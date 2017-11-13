'use strict';

const isOnline = require('is-online');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const Gpio = require('onoff').Gpio;
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../recognition/config.json')));
const Rekognition = require('../recognition/libs/rekognition');

const red_led = new Gpio(23, 'out');
const yellow_led = new Gpio(24, 'out');
const green_led = new Gpio(25, 'out');
const button = new Gpio(16, 'in', 'both');
const rekognition = new Rekognition(config.region, config.threshold);


const blink = (led) => {
    const write = led.readSync() === 0 ? 1:0;
    led.writeSync(write);
}

const delayedErrorExit = () => {
    setTimeout(() => {
        process.exit(1);
    }, 30000); // exit in a minute
};

const setColours = (r,g,y) => {
    red_led.writeSync(r);
    green_led.writeSync(g);
    yellow_led.writeSync(y);
}

let loading = setInterval(() => {
    blink(yellow_led);
}, 500);

return isOnline({ timeout: 300 })
    .then(online => {

        if(online) {
            return rekognition.getMatchedCollections(config.servicePrefix)
                .then(() => {
                    clearInterval(loading);
                    setColours(0,0,0);
                    cp.fork('~/raspberrypi-facerekognition/piCode/recognition/face-rekognition.js');
                })
                .catch((error) => {
                    setColours(1,1,0);
                    console.log(error);
                    console.log('Please setup and configure your default aws profile');
                    delayedErrorExit();
                });
        } else {
            setColours(1,0,1);
            console.log('Please connect to the internet then run `node ~/raspberrypi-facerekognition/piCode/recognition/face-rekognition.js`');
            delayedErrorExit();
        }
        
    })
    .catch((error) => {
        setColours(1,0,0);
        console.log(message);
        delayedErrorExit();
    });

process.on('SIGINT', function () {
    red_led.unexport();
    yellow_led.unexport();
    green_led.unexport();
    button.unexport();
});