const utils = require('./../../services/utils');

const words = ['Aaar!', 'Oy oy', 'Yaarr!', 'Yo ho ho', 'Ahoy!', 'Yaarrahah!'];

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        const hasBotMention = message.mentions.users.array().filter(user => user.id == client.user.id);
        if (hasBotMention.length > 0) {
            message.reply(utils.getRandomlyOneOf(words));
        }
    });
};
