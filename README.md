# Art(ists) + Software

## Setup
0. Install [nodejs](https://nodejs.org/en/)
0. Clone repo: `git clone git@github.com:lmccart/art-software.git`
0. Navigate to repo: `cd art-software`
0. Install dependencies: `npm install`
0. Copy in `.env` and `art-software-5624b11287ef.json` files. (Email Lauren)

## Running
* `node server.js`
* view at http://localhost:3000

## Reference

The server component is currently hosted on a DigitalOcean droplet (http://167.99.175.36), using [Node.js](https://nodejs.org/) and [mongoDB](https://www.mongodb.com/). The uploaded artist files are hosted on [Google Cloud Storage](https://cloud.google.com/storage). Eventually, we would like to move this off of DigitalOcean and onto the DMA server. We are currently using [jSPDF](https://github.com/MrRio/jsPDF) to generate PDFs on the client side. This is a temporary test and we are exploring other tools for this.

The [Backend spec](https://docs.google.com/document/d/1N-gVMw1AJQD5tHP979i_f6oDtJRyLK1zcQ3C2zq8dmE/edit) outlines the API the server provides. TODO: Move this document to this readme once API is more stable.


* DigitalOcean
  * `ssh root@167.99.175.36`
  * https://www.digitalocean.com/docs/droplets/how-to/connect-with-ssh/
  * https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04 (mongodb)
  * https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04#part-two-securing-mongodb (mongodb)
  * https://pm2.keymetrics.io/ (PM2 task runner)
* MongoDB
  * https://github.com/mongodb/node-mongodb-native
  * https://docs.mongodb.com/manual/reference/mongo-shell/
  * [mongo compass tool](https://www.mongodb.com/products/compass) - gui for cloud db
* Magic Link
  * https://github.com/nodemailer/nodemailer
  * https://github.com/auth0/node-jsonwebtoken#readme
  * https://www.youtube.com/watch?v=JJ44WA_eV8E
* Google Cloud Storage
  * https://console.cloud.google.com/storage/browser/ (console)
  * https://cloud.google.com/appengine/docs/flexible/nodejs/using-cloud-storage
  * https://github.com/ARozar/multer-google-storage#readme (multi-part uploads)
* GCH &amp; CORS
  * https://cloud.google.com/storage/docs/gsutil_install (CORS)
  * https://cloud.google.com/storage/docs/gsutil/commands/cors (CORS)
  * https://cloud.google.com/storage/docs/configuring-cors (CORS)
  * `gsutil cors set cors.json gs://art-software` (CORS)
* PDF Generation
  * http://raw.githack.com/MrRio/jsPDF/master/docs/index.html (client-side, currently using)
  * https://github.com/foliojs/pdfkit (server-side, alternative option)
