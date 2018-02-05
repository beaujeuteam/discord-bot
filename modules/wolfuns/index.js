const config = require('./../../config.json');

module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        if (message.mentions.users.find('username', 'wolfuns')) {
            const channel = client.channels.find('name', config.channel_wolfuns);
            if (null !== channel) {
                channel.send(`${message.author.username} says : ${message.content}`);
            }
        }
    });
};
