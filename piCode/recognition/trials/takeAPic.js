const Raspistill = require('node-raspistill').Raspistill;
const camera = new Raspistill();

camera.takePhoto()
    .then(() => {
        console.log('photo taken');
    });