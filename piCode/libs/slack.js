'use strict';

const WebClient = require('@slack/client').WebClient;

class SlackWebClient {

    constructor(token) {
        this.webclient = new WebClient(token);
    }

    uploadImage(channel, fileName, fileStream) {
        return new Promise((resolve, reject) => {
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
        return new Promise((resolve, reject) => {

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

}


module.exports = SlackWebClient;