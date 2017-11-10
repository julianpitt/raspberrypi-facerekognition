'use strict';

const AWS = require('aws-sdk');
const glob = require('glob');

const rekognition = new AWS.Rekognition({
    region: 'us-east-1'
});

const fs = require('fs');
const path = require('path'); 


const collectionId = process.argv[2];
const faceLoc = process.argv[3];

if(!collectionId) {
    console.log('You need to pass in a collection name e.g. node buildFaceCollection.js face-pi-julianp');
    process.exit(1);
}

if(!faceLoc) {
    console.log('You need to pass in a path to a directory or singular image containing faces e.g. node buildFaceCollection.js face-pi-julianp ./myface.jpg');
    process.exit(1);
}

const addFace = (path) => {

    const facePic = fs.readFileSync(path);
    
    const params = {
        CollectionId: collectionId,
        Image: {
            Bytes: new Buffer(facePic, 'binary'),
        }
    };

    return rekognition
        .indexFaces(params)
        .promise();
}


const inputPath = path.resolve(__dirname, faceLoc);

if (fs.statSync(inputPath).isDirectory()) {

    const fileList = glob.sync(inputPath+'/**/*.{jpeg,jpg,png}');

    const facePromises = fileList.map((aFace => {
        return addFace(aFace);
    }));

    return Promise.all(facePromises)
        .then(() => {
            console.log('faces added');
        })
        .catch((err) => {
            console.error(err);
        });

} else {
    return addFace(inputPath)
        .then(() => {
            console.log('faces added');
        })
        .catch((err) => {
            console.error(err);
        });
}
