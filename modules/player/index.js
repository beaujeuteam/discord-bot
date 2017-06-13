const Discord = require('discord.js');
const utils = require('./../../services/utils');
const voiceClient = require('./../../services/voice-client');
const { Command } = require('./../../services/commands');

const playCmd = new Command('play [url]', 'Tell at bot to play music from url.');
const stopCmd = new Command('stop', 'Tell at bot to stop music.');
const pauseCmd = new Command('pause', 'Tell at bot to pause music.');
const volumeCmd = new Command('volume <volume>', 'Tell at bot to set volume at 0-200% (between 0 and 2).');

// https://discord.js.org/#/docs/main/stable/class/StreamDispatcher
module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        playCmd.match(message.content, ({ url }) => {
            voiceClient.playUrl(url)
                .catch(err => message.reply('An error occurred ' + err));
        });

        stopCmd.match(message.content, () => voiceClient.stop());
        pauseCmd.match(message.content, () => voiceClient.pause());
        volumeCmd.match(message.content, ({ volume }) => voiceClient.setVolume(volume));
    });
};
