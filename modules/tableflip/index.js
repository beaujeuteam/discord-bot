const utils = require('./../../services/utils');
const words = ['héhé', '... ok je rigole', 'Ahahah', 'Bwahahah', 'BOOOOM'];

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if ('(╯°□°）╯︵ ┻━┻' == message.content) {
            message.reply('┬─┬﻿ ノ( ゜-゜ノ)');
        }

        const hasBotMention = (message.mentions.users.array().filter(user => user.id == client.user.id)).length > 0;

        if (hasBotMention && utils.matchOneOf(['tableflip', 'table', 'renverse'], message.content)) {
            message.channel.sendMessage('(╯°□°）╯︵ ┻━┻');
            message.channel.sendMessage(utils.getRandomlyOneOf(words));
            message.channel.sendMessage('┬─┬﻿ ノ( ゜-゜ノ)');
        }
    });
};
