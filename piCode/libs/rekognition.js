'use strict';

const AWS = require('aws-sdk');

class Rekognition {}

Rekognition.constructor = (region, threshold) => {
    this.threshold = threshold;
    this.rekognition = new AWS.Rekognition({
        region: region
    });
};

Rekognition.getMatchedCollections = (prefix) => {

    return this.getCollections()
        .then((callCollections) => {
            return callCollections.filter((val) => {
                return val.indexOf(prefix) != 0;
            });
        });

};

Rekognition.getCollections = (nextToken, collections) => {
    
    const params = {
        NextToken: nextToken || null
    };

    if(!collections) {
        collections = [];
    }

    return this.rekognition.listCollections(params)
        .promise()
        .then((result) => {

            collections = collections.concat(result.CollectionIds);

            if(result.NextToken) {
                return this.getCollections(result.NextToken, collections);
            } else {
                return collections;
            }

        });
};

Rekognition.faceMatch = (collectionId, pictureBuffer) => {

    const params = {
        CollectionId: collectionId,
        Image: {
            Bytes: pictureBuffer
        },
        FaceMatchThreshold: this.threshold,
        MaxFaces: 1
    };
    

    return this.rekognition.searchFacesByImage(params)
        .promise()
        .then((face)=> {
            if(face && face.FaceMatches && face.FaceMatches.length > 0 && face.FaceMatches[0].Face.Confidence >= 95) {
                return collectionId;
            } else {
                return null;
            }
        });
};

exports.Rekognition = Rekognition;