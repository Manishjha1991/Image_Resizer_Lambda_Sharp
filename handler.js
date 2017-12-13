'use strict'
const bluebird = require('bluebird');
const AWS = require('aws-sdk');
const Sharp = require('sharp');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const BUCKET = "wvalpha";
const URL =  "https://d8rwe65c9cuak.cloudfront.net/uploads/uploads/versions/";

//ImageResizer Function

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