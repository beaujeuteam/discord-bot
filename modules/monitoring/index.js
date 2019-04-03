const utils = require('./../../services/utils');
const Repository = require('./../../services/repository');

module.exports = client => {
    const repo = new Repository('discord_messages');

    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        repo.insert({
            channel: { id: message.channel.id, name: message.channel.name, type: message.channel.type },
            id: message.id,
            type: message.type,
            content: message.content,
            author: { id: message.author.id, username: message.author.username },
            tts: message.tts,
            createdTimestamp: message.createdTimestamp,
            createdAt: new Date(),
            embeds: message.embeds.map(el => ({ type: el.type, title: el.title, description: el.description, url: el.url })),
            mentions: {
                users: message.mentions.users.map(el => ({ id: el.id, username: el.username }))
            }
        })
        .catch(err => {
            client.logger.debug(`Error with insertion into monitoring : ${err}`);
        });
    });
}
