const request = require('request');
const utils = require('./../../services/utils');

// @see http://openweathermap.org/api
const key = '9aa0cb51bf2f55ad13b3f32faaee0a9f';
const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=lyon,fr&appid=${key}&lang=fr&units=metric`;

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

    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (utils.matchExactlyOne('/meteo', message.content)) {
            client.logger.debug(`Module meteo match command "/meteo"`);

            request(apiUrl, (err, res, body) => {
                client.logger.request(apiUrl, res);

                if (!err && res.statusCode == 200) {
                    const data = JSON.parse(body);
                    const weather = data.weather[0];
                    message.channel.sendMessage(`Il fait ${weather.description.toLowerCase()} ${getImoji(weather.icon)} avec ${Math.floor(data.main.temp)}°C`);
                }
            });
        }
    });
};
