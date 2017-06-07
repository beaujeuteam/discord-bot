const utils = require('./../../services/utils');
const request = require('request');

// @see http://kaamelott.underfloor.io/doc
const apiUrl = 'http://kaamelott.underfloor.io/quote/rand';

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchExactlyOne('/kaamelott', message.content)) {
            client.logger.debug(`Module kaamelott match command "/kaamelott"`);

            request(apiUrl, (err, res, body) => {
                client.logger.request(apiUrl, res);

                if (!err && res.statusCode == 200) {
                    message.channel.sendMessage(JSON.parse(body).quote || 'C\'est pas faux.');
                }
            });
        }
    });
};
