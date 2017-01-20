const config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

require('./modules/ping')(client);
require('./modules/love')(client);
require('./modules/good-morning')(client);
require('./modules/kaamelott')(client);
require('./modules/captain')(client);
require('./modules/meteo')(client);
require('./modules/roll')(client);

client.login(config.token);
