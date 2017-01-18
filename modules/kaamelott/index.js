const utils = require('./../../services/utils');
const request = require('request');

// @see http://kaamelott.underfloor.io/doc
const apiUrl = 'http://kaamelott.underfloor.io/quote/rand';

module.exports = client => {
    /**
     * Response pong when someone says ping
     */
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchExactlyOne('/kaamelott', message.content)) {
            request(apiUrl, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    message.channel.sendMessage(JSON.parse(body).quote || 'C\'est pas faux.');
                }
            });
        }
    });
};
