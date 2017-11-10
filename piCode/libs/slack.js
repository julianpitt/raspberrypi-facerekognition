'use strict';

const WebClient = require('@slack/client').WebClient;
const BbPromise = require('bluebird');

class SlackWebClient {}

SlackWebClient.constructor = (token) => {
    this.webclient = new WebClient(token);
};

SlackWebClient.uploadImage = (channel, fileName, fileStream) => {
    return new BbPromise((resolve, reject) => {
        web.files.upload(fileName, {
                file: fileStream,
                channels: channel
            }, (error, response) => {
            if(error) reject(error)
            else resolve(response)
        });
    });
};

SlackWebClient.sendMessage = (channel, message, username, icon_emoji) => {
    return new BbPromise((resolve, reject) => {

        const opts = {
            icon_emoji,
            username
        }

        web.chat.postMessage(channel, message, opts, (error, success) => {
            if(error) reject(error)
            else resolve(success)
        });
    });
};

SlackWebClient.log = BbPromise.coroutine(function* (message, attachment) {
    
    if(attachment) {
        yield uploadImage(channel, message, fs.createReadStream(attachment));
    } else {
        yield sendMessage(channel, message, username, icon_emoji);
    }   

});

exports.SlackWebClient = SlackWebClient;