# Setup
0. Install [nodejs](https://nodejs.org/en/)
0. Clone repo: `git clone git@github.com:lmccart/art-software.git`
0. Navigate to repo: `cd art-software`
0. Install dependencies: `npm install`
0. Copy in `.env` and `art-software-5624b11287ef.json` files. (Email Lauren)

# Running
* `node server.js`
* view at http://localhost:3000

# Reference
* Google Cloud Hosting
  * https://console.cloud.google.com/storage/browser/ (console)
  * https://cloud.google.com/appengine/docs/flexible/nodejs/using-cloud-storage
  * https://github.com/ARozar/multer-google-storage#readme (multi-part uploads)
* GCH &amp; CORS
  * https://cloud.google.com/storage/docs/gsutil_install (CORS)
  * https://cloud.google.com/storage/docs/gsutil/commands/cors (CORS)
  * https://cloud.google.com/storage/docs/configuring-cors (CORS)
  * `gsutil cors set cors.json gs://art-software` (CORS)
* MongoDB
  * https://github.com/mongodb/node-mongodb-native
  * https://docs.mongodb.com/manual/reference/mongo-shell/
* PDF Generation
  * http://raw.githack.com/MrRio/jsPDF/master/docs/index.html (client-side, currently using)
  * https://github.com/foliojs/pdfkit (server-side, alternative option)

# Digital Ocean
* `ssh root@167.99.175.36`
* https://www.digitalocean.com/docs/droplets/how-to/connect-with-ssh/
* https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04 (mongodb)
* https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04#part-two-securing-mongodb (mongodb)
