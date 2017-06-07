const utils = require('./../../services/utils');

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        utils.command('/roll ([0-9]+)d([0-9]+)', message.content, result => {
            result[0] = result[0] > 10 ? 10 : result[0];
            for (let i = 0; i < result[0]; i++) {
                message.reply(utils.random(result[1]));
            }
        });
    });
};
