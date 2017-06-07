const config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();
const logger = require('./services/logger');
const utils = require('./services/utils');

const logChannel = null;

client.on('ready', () => {
    console.log('I am ready!');

    logger.setClient(client);
    logger.setChannel(client.channels.find('name', 'cabine_du_captain'));

    client.logger = logger;
});

client.on('disconnect', event => {
    console.log('Client disconnected because :', event);
});

client.on('message', message => {
    if (message.author.id === client.user.id) {
        return;
    }

    client.logger.info(`New message from ${message.author.username} : ${message.content}`);
});

require('./modules/ping')(client);
require('./modules/love')(client);
require('./modules/good-morning')(client);
require('./modules/kaamelott')(client);
require('./modules/captain')(client);
require('./modules/meteo')(client);
require('./modules/roll')(client);
require('./modules/voice')(client);
require('./modules/player')(client);
require('./modules/playlist')(client);
require('./modules/tableflip')(client);
require('./modules/adventure')(client);
require('./modules/monitoring')(client);

client.login(config.token);
