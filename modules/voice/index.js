const Discord = require('discord.js');
const voiceClient = require('./../../services/voice-client');
const { Command } = require('./../../services/commands');

const joinCmd = new Command('join', 'Tell at bot to join vocal channel.', 'voice');
const leaveCmd = new Command('leave', 'Tell at bot to leave current vocal channel.', 'voice');
const sayCmd = new Command('say [text]', 'Tell at bot to say something.', 'voice')
    .option('-f', 'fr', 'Use French language')
    .option('-d', 'de', 'Use German language')
    .option('-r', 'ru', 'Use Russion language')
    .option('-e', 'es', 'Use Spanish language')
    .option('-u', 'us', 'Use English language');

// http://www.voicerss.org/api/documentation.aspx
module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        joinCmd.match(message.content, () => {
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

        leaveCmd.match(message.content, () => {
            voiceClient.playText('Au revoir')
                .then(() => setTimeout(() => voiceClient.leave(), 3000))
                .catch(err => message.reply(err));
        });

        sayCmd.match(message.content, ({ text }, { fr, de, ru, es, us }) => {

            let lang = fr ? 'fr' : 'fr';
            lang = de ? 'de' : lang;
            lang = ru ? 'ru' : lang;
            lang = es ? 'es' : lang;
            lang = us ? 'us' : lang;

            voiceClient.playText(text, lang)
                .catch(err => message.send('An error occurred ' + err));
        });
    });
};
