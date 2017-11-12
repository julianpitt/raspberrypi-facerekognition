'use strict';

const isOnline = require('is-online');
const cp = require('child_process');
const Gpio = require('onoff').Gpio;

const red_led = new Gpio(23, 'out');
const yellow_led = new Gpio(24, 'out');
const green_led = new Gpio(25, 'out');
const button = new Gpio(16, 'in', 'both');



const blink = (led) => {
    const write = led.readSync() === 0 ? 1:0;
    led.writeSync(write);
}

const delayedErrorExit = () => {
    setTimeout(() => {
        process.exit(1);
    }, 60000); // exit in a minute
};



let loading = setInterval(() => {
    blink(yellow_led);
}, 500);

return isOnline({ timeout: 300 })
    .then(online => {

        clearInterval(loading);
        yellow_led.writeSync(0);

        if(online) {
            cp.fork('~/raspberrypi-facerekognition/piCode/recognition/face-rekognition.js');
        } else {
            red_led.writeSync(1);
            yellow_led.writeSync(0);
            green_led.writeSync(0);
            console.log('Please connect to the internet then run `node ~/raspberrypi-facerekognition/piCode/recognition/face-rekognition.js`');
            delayedErrorExit();
        }
        
    })
    .catch((error) => {
        red_led.writeSync(1);
        yellow_led.writeSync(1);
        green_led.writeSync(0);
        console.log(message);
        delayedErrorExit();
    });

process.on('SIGINT', function () {
    red_led.unexport();
    yellow_led.unexport();
    green_led.unexport();
    button.unexport();
});