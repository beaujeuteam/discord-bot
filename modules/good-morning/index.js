const utils = require('./../../services/utils');
const words = ['coucou', 'hello', 'yo', 'cc', 'salut', 'yop', 'hey'];

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchOneOf(words, message.content)) {
            message.reply(utils.getRandomlyOneOf(words));
        }
    });
}
