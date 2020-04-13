const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
require('dotenv').config();

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
app.use(express.static(path.join(__dirname, 'public')))

const uploadHandler = multer({
  storage: multerGoogleStorage.storageEngine({
    bucket: process.env.GCS_BUCKET,
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: process.env.GCS_KEYFILE
  })
});

app.post('/upload', uploadHandler.any(), function (req, res) {
  console.log(req.files);
  res.json(req.files);
});