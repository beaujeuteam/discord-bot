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

        const joinCommand = utils.command('/joinme', message.content);
        const leaveCommand = utils.command('/leaveme', message.content);
        const sayText = utils.command('/saytext (.*)', message.content);
        const sayTextWithLang = utils.command('/saytext ([a-zA-Z]{2}-[a-zA-Z]{2}) (.*)', message.content);

        if (!!joinCommand) {
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
        }

        if (!!leaveCommand) {
            voiceClient.playText('Au revoir').then(() => setTimeout(() => voiceClient.leave(), 2000)).catch(err => message.reply(err));
        }

        if (!!sayTextWithLang) {
            voiceClient.playText(sayTextWithLang[1], sayTextWithLang[0]).catch(err => message.reply(err));
            return;
        }

        if (!!sayText) {
            voiceClient.playText(sayText[0]).catch(err => message.reply(err));
            return;
        }
    });
};
