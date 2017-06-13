const config = require('./config.json');
const opusscript = require('opusscript');

const Discord = require('discord.js');
const logger = require('./services/logger');
const utils = require('./services/utils');
const { Command, commands } = require('./services/commands');

const client = new Discord.Client();
const logChannel = null;
const helpCommand = new Command('help', 'Display list of commands')
                        .option('-v', 'verbose', 'Display all options');

// extend limit of listener
require('events').EventEmitter.defaultMaxListeners = 20;

client.on('ready', () => {
    console.log('I am ready!');

    if (!!config.debug) {
        logger.setClient(client);
        logger.setChannel(client.channels.find('name', config.channel_debug));
    }

    client.logger = logger;
});

client.on('disconnect', event => {
    console.log('Client disconnected because :', event);
});

client.on('message', message => {
    if (message.author.id === client.user.id) {
        return;
    }

    helpCommand.match(message.content, (args, { verbose }) => {
        message.channel.send(commands.help(verbose));
    });

    client.logger.info(`New message from ${message.author.username} : ${message.content}`);
});

require('./modules/ping')(client);
require('./modules/love')(client);
require('./modules/good-morning')(client);
require('./modules/kaamelott')(client);
require('./modules/captain')(client);
require('./modules/roll')(client);
require('./modules/tableflip')(client);
require('./modules/voice')(client);
require('./modules/player')(client);
require('./modules/playlist')(client);
//require('./modules/adventure')(client);

if (!!config.monitoring) {
    require('./modules/monitoring')(client);
}

client.login(config.tokens.token);
