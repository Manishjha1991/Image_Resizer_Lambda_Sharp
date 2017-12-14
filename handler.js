'use strict'
const bluebird = require('bluebird');
const AWS = require('aws-sdk');
const Sharp = require('sharp');
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
const BUCKET = "wvalpha";
const URL =  "https://d8rwe65c9cuak.cloudfront.net/uploads/uploads/versions/";
module.exports.imageResize = async function(event, context, callback) {
  try {
    const id = event.pathParameters.key;
    const originalKey =id;
    const resizeWidth =event.pathParameters.width;
      await getFileFromS3AndContinue(originalKey,resizeWidth,callback);
  } catch (errorMessage) {
     await  returnErrorResponse(errorMessage, callback);
  }
};
function returnErrorResponse(errorMessage, callback) {
  const response = {
      statusCode: 400,
      body: 'Error: ' + JSON.stringify(errorMessage)
  };

  callback(null, response);
}
function getFileFromS3AndContinue(originalKey,resizeWidth, callback) {
  try {
      s3.getObject({Bucket: BUCKET, Key: originalKey}, (err, result) => {
         if(err) {
            returnErrorResponse(err, callback);
          } else {
              resizeAndContinue(result.Body, resizeWidth, callback);
          }
      });
  } catch (errorMessage) {
      returnErrorResponse(errorMessage, callback);
  }
}

 function resizeAndContinue(content, resizeWidth, callback) {
  try {
    const width = resizeWidth;
    if(width > 0 && width < 10000) {
          const image = Sharp(content).resize(parseInt(width)).toFormat('png')  ;
        image.toBuffer((err, buffer, info) => {
            
                  if(err) {
                    returnErrorResponse(err, callback);
                  } else {
                    returnResponse(buffer,callback);
                  }
              });
      } else {
          returnResponse(content,callback);
      }
  } catch (errorMessage) {
      returnErrorResponse(errorMessage, callback);
  }
}
function returnResponse(content,callback) {
  try {
      const body = content.toString("base64");
      const MAX_BASE64_LAMBDA_RESPONSE_SIZE = 4718628; // Based on my testing as of 2016-12-30
      if(body.length > MAX_BASE64_LAMBDA_RESPONSE_SIZE) {
          throw `Response body size ${body.length} bytes is greater than the limit of ${MAX_BASE64_LAMBDA_RESPONSE_SIZE} bytes`;
      }
      var data = "<img height=100 width=100 src='data:image/png;base64,"+body+"' />";
      const response = {
          statusCode: 200,
          headers: {
              "Content-Type": "image/png"
          },
          body:data,
          isBase64Encoded: true
      };
     

      callback(null, response);
  } catch (errorMessage) {
      returnErrorResponse(errorMessage, callback);
  }
}






