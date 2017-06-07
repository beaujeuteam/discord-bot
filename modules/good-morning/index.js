const utils = require('./../../services/utils');
const words = ['coucou', 'hello', 'salut', 'yop', 'hey'];

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchOneOf(words, message.content)) {
            client.logger.debug(`Module good-morning match something`);
            message.reply(utils.getRandomlyOneOf(words));
        }
    });
}
