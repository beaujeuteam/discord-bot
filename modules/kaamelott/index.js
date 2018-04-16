const utils = require('./../../services/utils');
const { Command } = require('./../../services/commands');
const request = require('request');

// @see http://kaamelott.underfloor.io/doc
const apiUrl = 'http://kaamelott.underfloor.io/quote/rand';
const kaamelottCmd = new Command('kaamelott', 'Display random kaamelott quote.', 'fun');

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        kaamelottCmd.match(message.content, () => {
            request(apiUrl, (err, res, body) => {
                client.logger.request(apiUrl, res);

                if (!err && res.statusCode == 200) {
                    message.channel.send(JSON.parse(body).quote || 'C\'est pas faux.');
                }
            });
        });
    });
};
