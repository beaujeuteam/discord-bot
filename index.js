const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

require('./modules/ping')(client);
require('./modules/love')(client);

client.login('MjcwODE4NjAzNTQ3MzYxMjgx.C19a_Q.IKPf7GQWZLH3VQzm9R0Nwq_-GGQ');
