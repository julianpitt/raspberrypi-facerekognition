'use strict';

// Basic packages
const fs = require('fs');
const path = require('path');
const BbPromise = require('bluebird');
const Gpio = require('onoff').Gpio;
const Raspistill = require('node-raspistill').Raspistill;
const SlackWebClient = require('./libs/slack');
const Rekognition = require('./libs/rekognition');


// Configuration
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json')));
const token = process.env.SLACK_API_TOKEN || config.slack.APIToken;
const channel = process.env.SLACK_CHANNEL || config.slack.channel;
const emoji = process.env.SLACK_EMOJI || config.slack.emoji;
const username = process.env.SLACK_USERNAME || config.slack.username;
const threshold = config.threshold;
const servicePrefix = config.servicePrefix;

// Instantiations
const camera = new Raspistill();
const rekognition = new Rekognition(config.region, threshold);
const slackWebClient = new SlackWebClient(token);

const red_led = new Gpio(23, 'out');
const yellow_led = new Gpio(24, 'out');
const green_led = new Gpio(25, 'out');
const button = new Gpio(16, 'in', 'both');


// Flags
let inProgress = false;



// Methods
const determineFace = BbPromise.coroutine(function*() {

    console.log('Button pressed');

    if(inProgress) {
        // prevent invocations if one's already in progress
        return;
    }

    console.log('Starting');
    
    pending();

    // Wait a second from pressing the button to take the picture
    BbPromise.delay(1000);

    const pictureBuffer = yield camera.takePhoto('intruder');
    const availableCollections = yield rekognition.getMatchedCollections(servicePrefix);

    const found = yield BbPromise.mapSeries(availableCollections, (collectionId) => {

        console.log(`Checking collection ${collectionId}`);

        return rekognition.faceMatch(collectionId, pictureBuffer)
            .catch((error) => {
                console.error(error);
                return false;
            });
        
    }).then((mappedResults) => {

        return mappedResults.reduce((accum, faceCollectionId) => {

            if(faceCollectionId) {
                accum = faceCollectionId;
            }
            return accum;
        }, null);

    });

    if(found !== null) {
        return success(found);
    } else {
        return failure(path.resolve(__dirname, './photos/intruder.jpg'));
    }


});

const writeDelay = (led, delay, value) => {

    return BbPromise
        .delay(delay)
        .then(() => {
            return new Promise((resolve, reject) => {
                led.write(value, (err, success) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(success);
                    }
                })
            });
        });
}

const success = (collectionId) => {

    console.log('Success!!');

    yellow_led.writeSync(0);
    green_led.writeSync(1);
    
    return writeDelay(green_led, 3000, 0)
        .then((res) => {
            
            inProgress = false;

            return slackWebClient.sendMessage(
                channel, 
                `Successfull login attempt from ${collectionId}`,
                username,
                emoji
            ).then(() => {
                return res;
            });

        });

};

const failure = (picPath) => {

    console.log('Failed');

    yellow_led.writeSync(0);
    red_led.writeSync(1);
    
    return writeDelay(red_led, 3000, 0)
        .then((res) => {
            
            inProgress = false;

            return slackWebClient.uploadImage(channel, 'Intruder', fs.createReadStream(picPath))
            .then(() => {
                return res;
            });

        });
    
};

const pending = () => {

    console.log('Pending');

    inProgress = true;
    yellow_led.writeSync(1);

};



button.watch(determineFace);

process.on('SIGINT', function () {
    red_led.unexport();
    yellow_led.unexport();
    green_led.unexport();
    button.unexport();
});