const path = require('path');
const codes = require('http-status-codes');
const express = require('express');
const app = express();
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId; 
const assert = require('assert');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const parseurl = require('parseurl');

let db;
let hos

require('dotenv').config();

app.listen(process.env.PORT, () => console.log(`Example app listening on `+process.env.PORT));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto', maxAge: 60*60*24 }
}));

app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1

  next()
})

app.get('/foo', function (req, res) {
  res.send('you viewed this page: ' + req.session.authenticated);
})
app.get('/bar', function (req, res) {
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
});

app.get('/authenticated', function (req, res) {
  if (req.session.authenticated) res.json({success: true, email: req.session.authenticated});
  else res.json({success: false});
})

/* DATABASE */
MongoClient.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = client.db('admin');
});

const insertDocument = function(doc, callback) {
  const collection = db.collection('art-software');
  collection.insertOne(doc)
  .then((obj) => {
    console.log('Inserted - ' + obj);
    callback(obj);
  })
  .catch((err) => {
    console.log('Error: ' + err);
  })
};

const updateDocument = function(doc, callback) {
  const collection = db.collection('art-software');
  const _id = new ObjectId(doc._id);
  delete doc._id;
  collection.updateOne(
    {_id: _id},
    {$set: doc},
    {upsert: true})
    .then((obj) => {
      console.log('Updated - ' + obj);
      callback(obj);
    })
    .catch((err) => {
        console.log('Error: ' + err);
    })
};

const findDocuments = function(query, callback) {
  const collection = db.collection('art-software');
  collection.find(query).toArray((err, docs) => {
    assert.equal(err, null);
    console.log(docs)
    callback(docs);
  });
};

/* MAGIC LINK EMAIL */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GMAIL_CLIENTID,
    clientSecret: process.env.GMAIL_CLIENTSECRET,
    refreshToken: process.env.GMAIL_REFRESHTOKEN,
    accessToken: process.env.GMAIL_ACCESSTOKEN
  }
 });

const login = (req, res) => {
  let email = req.body.email;
  if (!email) return res.status(codes.BAD_REQUEST).send({error: 'email is required'});
  const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: 60*60}); // valid for one hour
  const url = req.protocol + '://' + req.get('host') + '/submit?' + token;
  const mailOpts = {
    from: 'laurenleemccarthy@gmail.com',
    to: email,
    subject: 'art(ists)+software link',
    html: 'Hello, <a href="'+url+'">click here to submit!</a>'
  };

  console.log(mailOpts)
  transporter.sendMail(mailOpts, (err, info) => {
    if(err) return res.status(codes.INTERNAL_SERVER_ERROR).send({error: 'cannot send mail'});
    else return res.status(codes.OK).send({message: 'email has been sent'});
 });
};

const account = (req, res) => {
  const auth = req.headers.authorization;
  // if (!auth || !auth.startsWith('Bearer ')) {
  //   res.status(codes.FORBIDDEN).send({error: 'cannot verify jwt'});
  //   return;
  // }
  // const token = auth.substring(7, auth.length);
  const token = req.body.token;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    res.json({succes: false, code: codes.FORBIDDEN, error: e});
    return;
  }
  if (!decoded.hasOwnProperty('email')) {
    res.json({succes: false, code: codes.FORBIDDEN, error: 'invalid jwt token'});
  }
  console.log(decoded);
  req.session.authenticated = decoded.email;
  res.json({success: true, email: decoded.email});
};


/* UPLOADS */
const uploadHandler = multer({
  storage: multerGoogleStorage.storageEngine({
    bucket: process.env.GCS_BUCKET,
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: process.env.GCS_KEYFILE
  })
});

const upload = (req, res) => {
  let doc = req.body;
  doc.timestamp = new Date().toISOString();
  doc.files = req.files;
  if (doc._id) updateDocument(doc, res => {});
  else insertDocument(doc, res => {});
  res.json({success: true});
};

/* SEARCH */
const search = (req, res) => {
  console.log(req.body);
  let query = {};
  if (req.body['artist-email']) {
    query['artist-email'] = { $regex: req.body['artist-email']};
  }
  if (req.body['artist-name']) {
    query['artist-name'] = { $regex: req.body['artist-name'], $options: 'i' };
  }
  if (req.body['artist-country-residence']) {
    query['artist-country-residence'] = req.body['artist-country-residence'];
  }
  if (req.body['artist-country-birth']) {
    query['artist-country-birth'] = req.body['artist-country-birth'];
  }
  if (req.body['artist-year-birth']) {
    query['artist-year-birth'] = req.body['artist-year-birth'];
  }
  /* GENDER TODO */

  if (req.body['work-title']) {
    query['work-title'] = { $regex: req.body['work-title'], $options: 'i' };
  }

  if (req.body['work-year-start'] || req.body['work-year-end']) {
    let ys = req.body['work-year-start'] || '0';
    let ye = req.body['work-year-end'] || '3000';
    query['work-year'] = { $gte: ys, $lte: ye };
  }
  
  if (req.body['work-categories']) {
    query['work-categories'] = req.body['work-categories'];
  }
  findDocuments(query, data => res.json(data));
};

/* METADATA */
const metadata = (req, res) => {
  const collection = db.collection('metadata');
  collection.findOne({}, (err, docs) => {
    assert.equal(err, null);
    res.json(docs);
  });
};


/* ROUTES */

app.post('/upload', uploadHandler.any(), upload);
app.get('/metadata', metadata);
app.post('/search', search);
app.post('/login', login);
app.post('/account', account);
