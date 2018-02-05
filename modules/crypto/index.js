const utils = require('./../../services/utils');
const { Command } = require('./../../services/commands');
const config = require('./../../config.json');
const request = require('request');

// @see https://coinmarketcap.com/api/
const apiUrl = 'https://api.coinmarketcap.com/v1/ticker';
const cryptoCmd = new Command('crypto [name]', 'Display crypto status.');
const cryptoTimerCmd = new Command('crypto-timer [name] [time]', 'Display crypto status every x hour.');
const cryptoTimerClearCmd = new Command('crypto-clear [name]', 'Clear timer for crypto.');
const timers = {};

module.exports = client => {
    const getCryptoStatus = name => {
        return new Promise((resolve, reject) => {
            const url = `${apiUrl}/${name}/?convert=EUR`;
            request(url, (err, res, body) => {
                client.logger.request(url, res);

                if (!err && res.statusCode == 200) {
                    let data = JSON.parse(body)[0];
                    let message = `${data.name}: ${data.price_eur}€\n`;
                    message += `1h  => ${data.percent_change_1h}%\n`;
                    message += `24h => ${data.percent_change_24h}%\n`;
                    message += `7d  => ${data.percent_change_7d}%`;

                    return resolve(message);
                }

                if (!err && res.statusCode === 404) {
                    let data = JSON.parse(body);

                    return reject(data.error);
                }
            });
        });
    };

    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        cryptoCmd.match(message.content, ({ name }) => {
            getCryptoStatus(name)
                .then(m => message.channel.send('```' + m + '```'))
                .catch(err => message.channel.send(err));
        });

        cryptoTimerCmd.match(message.content, ({ name, time }) => {
            const channel = client.channels.find('name', config.channel_crypto);
            if (null !== channel) {
                clearInterval(timers[name]);
                timers[name] = setInterval(() => {
                    getCryptoStatus(name)
                        .then(m => message.channel.send('```' + m + '```'))
                        .catch(err => message.channel.send(err));
                }, 1000 * 60 * 60 * time);

                return message.channel.send('Ok');
            }
        });

        cryptoTimerClearCmd.match(message.content, ({ name }) => {
            clearInterval(timers[name]);

            return message.channel.send('Ok');
        });
    });
};
