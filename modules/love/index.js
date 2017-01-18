const utils = require('./../../services/utils');
const words = ['love', 'amour', 'kiss', 'xxx'];

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchOneOf(words, message.content)) {
            message.react('❤');
        }
    });
}
