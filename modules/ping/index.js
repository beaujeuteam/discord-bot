const utils = require('./../../services/utils');

module.exports = client => {
    /**
     * Response pong when someone says ping
     */
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchEvery('ping', message.content)) {
            message.reply('pong');
        }

        if (utils.matchEvery('pong', message.content)) {
            message.reply('ping!');
        }
    });
};
