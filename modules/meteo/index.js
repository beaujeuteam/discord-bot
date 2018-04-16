const request = require('request');
const utils = require('./../../services/utils');
const config = require('./../../config.json');
const { Command } = require('./../../services/commands');

// @see http://openweathermap.org/api
const key = config.tokens.meteo_token;
const apiUrl = `http://api.openweathermap.org/data/2.5/weather?appid=${key}&lang=fr&units=metric`;
const apiUrl5d = `http://api.openweathermap.org/data/2.5/forecast?appid=${key}&lang=fr&units=metric`;

const meteoCmd = new Command('meteo', `Display current meteo in ${config.meteo_default_city}.`, 'meteo');
const meteoCityCmd = new Command('meteo [city]', 'Display current meteo in city.', 'meteo');

const meteo5dCmd = new Command('meteo-5d', `Display 5 days meteo in ${config.meteo_default_city}.`, 'meteo');
const meteoCity5dCmd = new Command('meteo-5d [city]', 'Display 5 days meteo in city.', 'meteo');

module.exports = client => {

    const getImoji = function(icon) {
        switch (icon) {
            case '01d':
                return ':sunny:';
            case '01n':
                return ':full_moon:';
            case '02d':
            case '02n':
                return ':partly_sunny:';
            case '03d':
            case '03n':
                return ':white_sun_cloud:';
            case '04d':
            case '04n':
                return ':cloud:';
            case '09d':
            case '09n':
                return ':cloud_rain:';
            case '10d':
            case '10n':
                return ':white_sun_rain_cloud:';
            case '11d':
            case '11n':
                return ':thunder_cloud_rain:';
            case '13d':
            case '13n':
                return ':cloud_snow:';
            case '50d':
            case '50n':
                return ':dash:';
            default:
                return ':deer:';
        }
    };

    const formatDate = (date) => {
        return date.replace(/[0-9]{4}-([0-9]{2})-([0-9]{2}) (15:00:00|03:00:00)/, '$2/$1');
    };

    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        meteoCmd.match(message.content, () => {
            client.logger.debug(`Module meteo match command "/meteo"`);

            const url = `${apiUrl}&q=${config.meteo_default_city},fr`;

            request(url, (err, res, body) => {
                client.logger.request(url, res);

                if (!err && res.statusCode == 200) {
                    const data = JSON.parse(body);
                    const weather = data.weather[0];
                    message.channel.send(`**${config.meteo_default_city}** ${weather.description.toLowerCase()} ${getImoji(weather.icon)} avec ${Math.floor(data.main.temp)}°C`);
                }
            });
        });

        meteoCityCmd.match(message.content, ({ city }) => {
            client.logger.debug(`Module meteo match command "/meteo ${city}"`);

            const url = `${apiUrl}&q=${city},fr`;

            request(url, (err, res, body) => {
                client.logger.request(url, res);

                if (!err && res.statusCode == 200) {
                    const data = JSON.parse(body);
                    const weather = data.weather[0];
                    message.channel.send(`**${city}** ${weather.description.toLowerCase()} ${getImoji(weather.icon)} avec ${Math.floor(data.main.temp)}°C`);
                }
            });
        });

        meteo5dCmd.match(message.content, () => {
            client.logger.debug(`Module meteo match command "/meteo-5d"`);

            const url = `${apiUrl5d}&q=${config.meteo_default_city},fr`;

            request(url, (err, res, body) => {
                client.logger.request(url, res);

                if (!err && res.statusCode == 200) {
                    const data = JSON.parse(body);
                    const list = data.list;

                    let result = `**${config.meteo_default_city}**\n\n`;
                    list.forEach(day => {
                        if (day.dt_txt.match(/[0-9]{4}-[0-9]{2}-[0-9]{2} (15:00:00)/)) {
                            const weather = day.weather[0];
                            result += `${formatDate(day.dt_txt)}  ${weather.description.toLowerCase()} ${getImoji(weather.icon)} avec ${Math.floor(day.main.temp)}°C\n`;
                        }
                    });

                    message.channel.send(result);
                }
            });
        });

        meteoCity5dCmd.match(message.content, ({ city }) => {
            client.logger.debug(`Module meteo match command "/meteo-5d ${city}"`);

            const url = `${apiUrl5d}&q=${city},fr`;

            request(url, (err, res, body) => {
                client.logger.request(url, res);

                if (!err && res.statusCode == 200) {
                    const data = JSON.parse(body);
                    const list = data.list;

                    let result = `**${city}**\n\n`;
                    list.forEach(day => {
                        if (day.dt_txt.match(/[0-9]{4}-[0-9]{2}-[0-9]{2} (15:00:00)/)) {
                            const weather = day.weather[0];
                            result += `${formatDate(day.dt_txt)}  ${weather.description.toLowerCase()} ${getImoji(weather.icon)} avec ${Math.floor(day.main.temp)}°C\n`;
                        }
                    });

                    message.channel.send(result);
                }
            });
        });
    });
};
