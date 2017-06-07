const Discord = require('discord.js');
const utils = require('./../../services/utils');
const voiceClient = require('./../../services/voice-client');

// https://discord.js.org/#/docs/main/stable/class/StreamDispatcher
module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        utils.command('/play (.*)', message.content, result => {
            voiceClient.playUrl(result[0]).then(stream => {
                stream.on('error', error => message.reply(error));
            });
        });

        utils.command('/stop', message.content, () => {
            voiceClient.stop();
        });

        utils.command('/pause', message.content, () => {
            voiceClient.pause();
        });

        utils.command('/volume ([0-9\.]+)', message.content, result => {
            voiceClient.setVolume(result[0]);
        });
    });
};
