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
app.use(express.urlencoded());
app.use(express.json());

MongoClient.connect(process.env.MONGO_URL, function(err, client) {
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
  // Get the documents collection
  const collection = db.collection('art-software');
  // Find some documents
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
  let doc = req.body;
  doc.timestamp = new Date().toISOString();
  doc.files = [];
  req.files.forEach(f => doc.files.push(f));
  insertDocument(doc, (res) => {
    // console.log(res);
  });
  console.log(req.body)
  res.json(req.files);
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