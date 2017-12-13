// 'use strict'
// const MongoClient = require('mongodb').MongoClient;
// const bluebird = require('bluebird');
// const uuid = require('uuid');
// const validator = require('validator');
// const dateFormat = require('dateformat');
// const assert = require('assert');
// const now = new Date();
// const bcrypt = require('bcrypt-nodejs');
// const salt = bcrypt.genSaltSync(6);
// var awsS3Async = require("aws-s3-async")




// // ImageResizer

// const AWS = require('aws-sdk');
// const s3 = new AWS.S3({
//   signatureVersion: 'v4',
// });
// const Sharp = require('sharp');

// const BUCKET = "wvalpha";
// const URL = "http://wvalpha.s3-website.ap-south-1.amazonaws.com";
// module.exports.imageResize = async  (event, context, callback) => {
  
// context.callbackWaitsForEmptyEventLoop = false;
 
// const id = event.pathParameters.key;
// const key = id;
// // const match = key.match(/(\d+)x(\d+)\/(.*)/);
// // const width = parseInt(match[1], 10);
// // const height = parseInt(match[2], 10);
// const width =100;
// const height = 100;
// const originalKey =id;


// console.log("width -- "+width +'  -- HEight -- '+height +"  -- "+originalKey);

// console.log("width -- "+width +'  -- HEight -- '+height +"  -- "+originalKey);



//  var params = {Bucket: BUCKET, Key: id};
// var file = require('fs').createWriteStream(originalKey);
// s3.getObject(params).createReadStream().pipe(file);
 
// };

'use strict'
const MongoClient = require('mongodb').MongoClient;
const bluebird = require('bluebird');
const uuid = require('uuid');
const validator = require('validator');
const dateFormat = require('dateformat');
const assert = require('assert');
const now = new Date();
const bcrypt = require('bcrypt-nodejs');
const salt = bcrypt.genSaltSync(6);
var awsS3Async = require("aws-s3-async")
const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');
const BUCKET = "wvalpha";
const URL =  "https://d8rwe65c9cuak.cloudfront.net/uploads/uploads/versions/";
module.exports.imageResize = async  (event, context, callback) => {
context.callbackWaitsForEmptyEventLoop = false;
const id = event.pathParameters.key;
const key = id;
const width =event.pathParameters.width;
const originalKey =id;
S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
  .then(data => 
      Sharp(data.Body)
    .resize(parseInt(width))
    .toFormat('png')
    .toBuffer()
  )
  .then(buffer => S3.putObject({
      Body: buffer,
      Bucket: BUCKET+"/uploads/uploads/versions/"+(width),
      ContentType: 'image/png',
      Key: key,
      ACL:"public-read"
    }).promise()
  )
  .then((data) => callback(null, {
      statusCode: '301',
      header:
        "https://d8rwe65c9cuak.cloudfront.net/uploads/uploads/versions/"+width+"/"+key+"",
      body:URL+width+"/"+key
    })
  )
  .catch(err => callback(err))
};