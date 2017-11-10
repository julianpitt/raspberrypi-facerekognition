'use strict';

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition({
    region: 'us-east-1'
});
const fs = require('fs');
const path = require('path');


const collectionId = process.argv[2];
const inputImage = process.argv[3];

if(!collectionId) {
    console.log('You need to pass in a collection name e.g. node detect.js face-pi-julianp');
    process.exit(1);
}

if(!inputImage) {
    console.log('You need to pass in a path to an image containing a face e.g. node detect.js face-pi-julianp ./myface.jpg');
    process.exit(1);
}


const faceFileBuffer = fs.readFileSync(path.resolve(__dirname, inputImage));

const params = {
    CollectionId: collectionId,
    Image: {
        Bytes: new Buffer(faceFileBuffer, 'binary')
    },
    FaceMatchThreshold: 95,
    MaxFaces: 1
};

return rekognition.searchFacesByImage(params)
    .promise()
    .then((face)=> {
        if(face && face.FaceMatches && face.FaceMatches.length > 0 && face.FaceMatches[0].Face.Confidence >= 95) {
            console.log(`Face was found in ${collectionId}`);
        } else {
            console.log('Dunno who that is');
        }
    });