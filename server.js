const path = require('path');
const express = require('express');
const app = express();
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let db;

require('dotenv').config();

app.listen(process.env.PORT, () => console.log(`Example app listening on `+process.env.PORT));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}));
app.use(express.json());

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

/* UPLOADS */
const uploadHandler = multer({
  storage: multerGoogleStorage.storageEngine({
    bucket: process.env.GCS_BUCKET,
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: process.env.GCS_KEYFILE
  })
});

app.post('/upload', uploadHandler.any(), (req, res) => {
  let doc = req.body;
  doc.timestamp = new Date().toISOString();
  doc.files = req.files;
  insertDocument(doc, res => {});
  res.json({success: true});
});

/* SEARCH */
app.post('/search', (req, res) => {
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
});

/* METADATA */
app.get('/metadata', (req, res) => {
  const collection = db.collection('metadata');
  collection.findOne({}, (err, docs) => {
    assert.equal(err, null);
    res.json(docs);
  });
});
