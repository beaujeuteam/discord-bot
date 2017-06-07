const Discord = require('discord.js');
const utils = require('./../../services/utils');
const voiceClient = require('./../../services/voice-client');

// http://www.voicerss.org/api/documentation.aspx
module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        utils.command('/joinme', message.content, () => {
            client.channels.forEach(channel => {
                if (
                    channel instanceof Discord.VoiceChannel &&
                    !!channel.members.get(message.author.id)
                ) {
                    voiceClient.join(channel).then(() => {
                        voiceClient.playText('Salut').catch(err => message.reply(err));
                    }).catch(err => message.reply(err));
                }
            });
        });

        utils.command('/leaveme', message.content, () => {
            voiceClient.playText('Au revoir').then(() => setTimeout(() => voiceClient.leave(), 2000)).catch(err => message.reply(err));
        });

        const sayText = utils.command('/saytext (.*)', message.content, result => {
            voiceClient.playText(result[0]).catch(err => message.reply(err));
        });

        const sayTextWithLang = utils.command('/saytext ([a-zA-Z]{2}-[a-zA-Z]{2}) (.*)', message.content, result => {
            //voiceClient.playText(result[1], result[0]).catch(err => message.reply(err));
        });
    });
};
