'use strict';

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition({
    region: 'us-east-1'
});

const fs = require('fs'); 
const path = require('path');

const collectionId = process.argv[2];

if(!collectionId) {
    console.log('You need to pass in a collection name e.g. node createFaceCollection.js face-pi-julianp');
    process.exit(1);
}

const params = {
    CollectionId: collectionId
};
return rekognition.createCollection(params)
    .promise()
    .then((result) => {
        console.log(result);
        if(result.StatusCode === 200) {
            console.log(`Created ${collectionId}`);
        }
    });