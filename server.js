const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let db;

require('dotenv').config();

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
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
    console.log("Found the following records");
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
  // console.log(req.body)
  console.log(req)
  let doc = req.body;
  doc.timestamp = new Date().toISOString();
  doc.files = req.files;
  insertDocument(doc, (res) => {
    // console.log(res);
  });
  res.json({success: true});
});


app.post('/search', (req, res) => {
  console.log(req.body);
  let query = {};
  if (req.body.name) {
    query.name = { $regex: req.body.name, $options: 'i' };
  }
  findDocuments(query, (data) => {
    res.json(data);
  })
});

app.get('/metadata', (req, res) => {
  const collection = db.collection('metadata');
  collection.findOne({}, (err, docs) => {
    assert.equal(err, null);
    res.json(docs);
  });
});