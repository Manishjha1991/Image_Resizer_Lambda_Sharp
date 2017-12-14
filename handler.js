'use strict'
const bluebird = require('bluebird');
const AWS = require('aws-sdk');
const Sharp = require('sharp');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const BUCKET = "wvalpha";
const URL =  "https://d8rwe65c9cuak.cloudfront.net/uploads/uploads/versions/";
// import { Base64 } from 'js-base64';
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
  .then((data) => 
  
  
  
  callback(null, {
    statusCode: 200,
    headers: {
        'Content-Type': 'text/html'
    },
      body:'<html><head><meta name="viewport" content="width=device-width, minimum-scale=0.1"><title>' + URL+width+"/"+key + '</title></head><body style="margin: 0px; background: #0e0e0e;text-align: center;"><img style="-webkit-user-select: none;background-position: 0px 0px, 10px 10px;background-size: 20px 20px;background-image:linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee 100%),linear-gradient(45deg, #eee 25%, white 25%, white 75%, #eee 75%, #eee 100%);text-align: center;height: auto;" src="' + URL+width+"/"+key + '"></body></html>'
      
    })
  )
  .catch(err => callback(err))
};
