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
require('dotenv').config();
let db;

app.listen(process.env.PORT, () => console.log(`Example app listening on `+process.env.PORT));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(session({ // todo: check these
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: 'auto', maxAge: 24*60*60*1000 } // 24 hours
}));

/* DATABASE */
MongoClient.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = client.db('admin');
});

const insertDocument = function(doc, callback) {
  delete doc._id;
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
    .catch((err) => { console.log('Error: ' + err); });
};


const findDocuments = function(query, callback) {
  const collection = db.collection('art-software');
  collection.find(query).toArray((err, docs) => {
    assert.equal(err, null);
    console.log(docs)
    callback(docs);
  });
};

const aggregateDocuments = function(query, callback) {
  const collection = db.collection('art-software');
  let match = {};
  for (prop in query.works.$elemMatch) {
    match['works.'+prop] = query.works.$elemMatch[prop];
  }
  collection.aggregate([ // this is messy!
    { '$match': query }]).toArray((err, docs) => {
      collection.aggregate([
        { '$match': query }, 
        { '$unwind': '$works' },
        { '$match': match},
        { $group: {_id: '$_id', 'works': {'$push': '$works'} }}
      ]).toArray((err, works_docs) => {
        assert.equal(err, null);
        for (d in docs) {
          docs[d].works = [];
          docs[d].works = works_docs[d].works;
        }
        callback(docs);
      });
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

  transporter.sendMail(mailOpts, (err, info) => {
    if(err) return res.status(codes.INTERNAL_SERVER_ERROR).send({error: 'cannot send mail'});
    else return res.status(codes.OK).send({message: 'email has been sent'});
 });
};

const account = (req, res) => {
  // pend: do we need this??
  // const auth = req.headers.authorization;
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
  req.session.authenticated = decoded.email;
  req.session.save();
  console.log('session saved '+req.session.authenticated )
  res.json({success: true, email: decoded.email});
};

const authenticate = (req, res) => {
  console.log(req.session)
  if (req.session.authenticated) res.json({success: true, email: req.session.authenticated});
  else {
    req.session.destroy();
    res.json({success: false});
  }
};

/* UPLOADS */
const uploadHandler = multer({
  storage: multerGoogleStorage.storageEngine({
    bucket: process.env.GCS_BUCKET,
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: process.env.GCS_KEYFILE
  })
});

const submit = (req, res) => {
  let doc = req.body;
  doc.timestamp = new Date().toISOString();
  if (doc._id && doc._id.length) updateDocument(doc, res => {});
  else insertDocument(doc, res => {});
  res.json({success: true});
};

const upload = (req, res) => {
  res.json(req.files);
};

/* SEARCH */
const search = (req, res) => {
  console.log(req.body);
  let query = {};
  let filter = {};
  
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
  if (req.body['artist-year-birth-start'] || req.body['artist-year-birth-end']) {
    let ys = req.body['artist-year-birth-start'] || '0';
    let ye = req.body['artist-year-birth-end'] || '3000';
    query['artist-year-birth'] = { $gte: ys, $lte: ye };
  }
  if (req.body['artist-gender']) {
    query['artist-gender'] = req.body['artist-gender'];
  }

  // WORKS
  if (req.body['work-title'] || req.body['work-description'] || req.body['work-year-start'] || 
  req.body['work-year-end'] || req.body['work-categories'] || req.body['work-software'] || req.body['work-code']) {
    query.works = { $elemMatch: {} };
    if (req.body['work-title']) {
      query.works.$elemMatch['work-title'] = { $regex: req.body['work-title'], $options: 'i' };
    }
    if (req.body['work-description']) {
      query.works.$elemMatch['work-description'] = { $regex: req.body['work-description'], $options: 'i' };
    }
    if (req.body['work-year-start'] || req.body['work-year-end']) {
      let ys = req.body['work-year-start'] || '0';
      let ye = req.body['work-year-end'] || '3000';
      query.works.$elemMatch['work-year'] = { $gte: ys, $lte: ye };
    }
    if (req.body['work-categories']) {
      query.works.$elemMatch['work-categories'] = req.body['work-categories'];
    }
    if (req.body['work-software']) {
      query.works.$elemMatch['work-software'] = req.body['work-software'];
    }
    if (req.body['work-code']) {
      query.works.$elemMatch['work-code'] = req.body['work-code'];
    }
    aggregateDocuments(query, data => res.json(data));
  } else {
    findDocuments(query, data => res.json(data));
  }
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
app.post('/login', login);
app.post('/account', account);
app.get('/authenticate', authenticate);
app.post('/upload', uploadHandler.any(), upload);
app.post('/submit', submit);
app.post('/search', search);
app.get('/metadata', metadata);
