const utils = require('./../../services/utils');

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        const ouput = utils.command('/roll ([0-9]+)d([0-9]+)', message.content);
        if (!!ouput) {
            ouput[0] = ouput[0] > 10 ? 10 : ouput[0];
            for (let i = 0; i < ouput[0]; i++) {
                message.reply(utils.random(ouput[1]));
            }
        }
    });
};
