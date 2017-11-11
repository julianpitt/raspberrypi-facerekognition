'use strict';

const WebClient = require('@slack/client').WebClient;
const BbPromise = require('bluebird');
const fs = require('fs');

class SlackWebClient {

    constructor(token) {
        this.webclient = new WebClient(token);
    }

    uploadImage(channel, fileName, fileStream) {
        return new BbPromise((resolve, reject) => {
            this.webclient.files.upload(fileName, {
                    file: fileStream,
                    channels: channel
                }, (error, response) => {
                if(error) reject(error)
                else resolve(response)
            });
        });
    }

    sendMessage(channel, message, username, icon_emoji) {
        return new BbPromise((resolve, reject) => {

            const opts = {
                icon_emoji,
                username
            }

            this.webclient.chat.postMessage(channel, message, opts, (error, success) => {
                if(error) reject(error)
                else resolve(success)
            });
        });
    }

    log(channel, message, opts) {
        return BbPromise.coroutine(function* (channel, message, opts) {
        
            if(opts.attachment) {
                yield this.uploadImage(channel, message, fs.createReadStream(opts.attachment));
            } else {
                yield this.sendMessage(channel, message, opts.username, opts.icon_emoji);
            }   

        });
    }
}


module.exports = SlackWebClient;