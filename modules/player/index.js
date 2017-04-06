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

        const playUrlCommand = utils.command('/play (.*)', message.content);
        const stopCommand = utils.command('/stop', message.content);
        const pauseCommand = utils.command('/pause', message.content);
        const volumeCommand = utils.command('/volume ([0-9\.]+)', message.content);

        if (playUrlCommand) {
            voiceClient.playUrl(playUrlCommand[0]).then(stream => {
                stream.on('error', error => message.reply(error));
            });
        }

        if (stopCommand) {
            voiceClient.stop();
        }

        if (pauseCommand) {
            voiceClient.pause();
        }

        if (volumeCommand) {
            voiceClient.setVolume(volumeCommand[0]);
        }
    });
};
