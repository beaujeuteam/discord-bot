const utils = require('./../../services/utils');
const { Command } = require('./../../services/commands');
const request = require('request');

// @see https://github.com/sin0light/api-kaamelott/
const apiUrl = 'https://kaamelott.chaudie.re/api/random';
const kaamelottCmd = new Command('kaamelott', 'Display random kaamelott quote.', 'fun');
const kaamelottPersoCmd = new Command('kaamelott [character]', 'Display random kaamelott quote from personnage.', 'fun');

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        kaamelottPersoCmd.match(message.content, ({ character }) => {
            const url = `${apiUrl}/personnage/${character}`;
            request(url, (err, res, body) => {
                client.logger.request(url, res);

                if (!err && res.statusCode == 200) {
                    const { infos, citation } = JSON.parse(body).citation;
                    message.channel.send(`**${infos.personnage}** _(${infos.saison} ${infos.episode})_\n${citation.trim()}`);
                }
            });
        });

        kaamelottCmd.match(message.content, () => {
            request(apiUrl, (err, res, body) => {
                client.logger.request(apiUrl, res);

                if (!err && res.statusCode == 200) {
                    const { infos, citation } = JSON.parse(body).citation;
                    message.channel.send(`**${infos.personnage}** _(${infos.saison} ${infos.episode})_\n${citation.trim()}`);
                }
            });
        });
    });
};
