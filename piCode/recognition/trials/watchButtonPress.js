const Gpio = require('onoff').Gpio;
const BbPromise = require('bluebird');

const red_led = new Gpio(23, 'out');
const yellow_led = new Gpio(24, 'out');
const green_led = new Gpio(25, 'out');
const button = new Gpio(16, 'in', 'both');

let inProgress = false;

const writeInSeries = (err, value) => {

    if(inProgress) {
        return;
    } else {
        inProgress = true;
    }

    // Red on
    return writeDelay(red_led, 0, 1)
        
        // Yellow on
        .then(() => writeDelay(red_led, 1000, 0))
        .then(() => writeDelay(yellow_led, 0, 1))

        // Green on
        .then(() => writeDelay(yellow_led, 1000, 0))
        .then(() => writeDelay(green_led, 0, 1))

        // Off
        .then(() => writeDelay(green_led, 1000, 0))
        .then(() => {
            inProgress = false;
        });
};

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

button.watch(writeInSeries);

process.on('SIGINT', function () {
    red_led.unexport();
    yellow_led.unexport();
    green_led.unexport();
    button.unexport();
});