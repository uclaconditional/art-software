const path = require('path');
const codes = require('http-status-codes');
const express = require('express');
const app = express();
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
let db;
let hos

require('dotenv').config();

app.listen(process.env.PORT, () => console.log(`Example app listening on `+process.env.PORT));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}));
app.use(express.json());

/* DATABASE */
MongoClient.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = client.db('admin');
});

const insertDocument = function(doc, callback) {
  const collection = db.collection('art-software');
  collection.insertOne(doc, function(err, res) {
    console.log('Inserted document into the collection');
    callback(res);
  });
};

const findDocuments = function(query, callback) {
  const collection = db.collection('art-software');
  collection.find(query).toArray(function(err, docs) {
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
  const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: 60});
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
  insertDocument(doc, res => {});
  res.json({success: true});
};

/* SEARCH */
const search = (req, res) => {
  console.log(req.body);
  let query = {};
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
