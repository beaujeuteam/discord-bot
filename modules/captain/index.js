const utils = require('./../../services/utils');
const songs = require('./songs.json');
const curses = require('./curses.json');

const words = ['Aaar!', 'Oy oy', 'Yaarr!', 'Yo ho ho', 'Ahoy!', 'Yaarrahah!'];
const beers = ['🍺', '🍻', 'beer', 'bière', 'biere', 'apéro', 'apero'];

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        const hasBotMention = (message.mentions.users.array().filter(user => user.id == client.user.id)).length > 0;

        if (utils.matchOneOf(beers, message.content)) {
            message.reply(utils.getRandomlyOneOf(words) + ' 🍺');
        }

        if (hasBotMention && utils.matchOneOf(['chanson', 'chante'], message.content)) {
            const song = utils.getRandomlyOneOf(songs);
            song.forEach(sentence => message.channel.sendMessage(sentence));

            return;
        }

        if (hasBotMention && utils.matchOneOf(['corrige', 'insulte', 'puni', 'vilipende'], message.content)) {
            const users = message.mentions.users.array().filter(user => user.id != client.user.id);
            users.forEach(user => {
                const curse = utils.getRandomlyOneOf(curses);
                message.channel.sendMessage(`<@${user.id}> ${curse} !`);
            });

            return;
        }

        if (hasBotMention) {
            message.reply(utils.getRandomlyOneOf(words));
        }
    });
};
