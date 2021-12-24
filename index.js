const config = require('./config.json');
const bodyParser = require('yion-body-parser');
const { createApp, createServer } = require('yion');

const Discord = require('discord.js');
const logger = require('./services/logger');
const { Command, commands } = require('./services/commands');

const client = new Discord.Client();
const helpCommand = new Command('help', 'Display list of commands (use -v option for more information)', 'helper')
                        .option('-v', 'verbose', 'Display all options');

const app = createApp();
const httpServer = createServer(app, [bodyParser]);
client.http = app;

app.link('/fonts', __dirname + '/public/fonts');
app.link('/style', __dirname + '/public/style');
app.link('/script', __dirname + '/public/script');
app.link('/components', __dirname + '/public/components');
app.link('/services', __dirname + '/public/services');
app.link('/images', __dirname + '/public/images');
app.link('/modules', __dirname + '/node_modules');

app.get('/soundbox', (req, res) => {
    res.sendFile(__dirname + '/public/soundbox.html', 'soundbox.html', 'text/html', false);
});

// extend limit of listener
require('events').EventEmitter.defaultMaxListeners = 20;

client.on('ready', () => {
    console.log('I am ready!');

    if (!!config.debug) {
        logger.setClient(client);
        logger.setChannel(client.channels.cache.get(config.channel_debug));
    }

    client.logger = logger;
    client.config = config;
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

client.on('error', err => {
    console.error(err);
    process.exit(1);
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
//require('./modules/crypto')(client);
//require('./modules/adventure')(client);

if (!!config.monitoring) {
    require('./modules/monitoring')(client);
}

client.login(config.tokens.token);
httpServer.listen(config.http.port);
