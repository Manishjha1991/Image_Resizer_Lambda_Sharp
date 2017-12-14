'use strict'
const bluebird = require('bluebird');
const AWS = require('aws-sdk');
const Sharp = require('sharp');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const BUCKET = "wvalpha";
//const URL =  "https://d8rwe65c9cuak.cloudfront.net/uploads/uploads/versions/";
 const URL =  "https://s3.ap-south-1.amazonaws.com/wvalpha/uploads/uploads/versions/";
module.exports.imageResize = async  (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const key = event.pathParameters.key;
    const data =event.pathParameters.data;
    let params  = decodeURIComponent(event.pathParameters.data);
    let pathParams =params.split(",");
    let finalWidth= pathParams[2].split("_");
    let finalHeight= pathParams[3].split("_");
    finalWidth=parseInt(finalWidth[1]);
    finalHeight=parseInt(finalHeight[1]);
S3.getObject({Bucket: BUCKET, Key: key}).promise()
  .then(data => 
     Sharp(data.Body)
    .resize(finalWidth ,finalHeight) 
    .toBuffer()
  )
  .then(buffer => S3.putObject({
      Body: buffer,
      Bucket: BUCKET+"/uploads/uploads/versions/"+finalWidth,
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
      body:'<html><head><meta name="viewport" content="width=device-width, minimum-scale=0.1"><title>' + URL+finalWidth+"/"+key + '</title></head><body style="background:#000;"><img style="height: auto;max-height:100vh;position: absolute;left: 0;right: 0;top: 0;bottom: 0;margin: auto;" src="' + URL+finalWidth+"/"+key + '" alt=""></body></html>'
      
    })
  )
  .catch(err => callback(err))
};