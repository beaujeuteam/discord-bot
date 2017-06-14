const Discord = require('discord.js');
const utils = require('./../../services/utils');
const voiceClient = require('./../../services/voice-client');
const DB = require('./../../services/db');
const { Command } = require('./../../services/commands');
const repository = require('./repositories/songs');

let songs = [
    { tag: 'ready', type: 'file', source: __dirname + '/musics/ready.mp3' }
]

DB.connect(error => {
    if (!error) {
        repository.find().then(result => songs = songs.concat(result));
    }
});

const playCmd = new Command('play [source]', 'Tell at bot to play music from url or from tag.');
const addCmd = new Command('add [source] [tag]', 'Add music source with tag.');
const tagsCmd = new Command('tags', 'List all tags.');
const removeCmd = new Command('remove [tag]', 'Remove tag.');
const stopCmd = new Command('stop', 'Tell at bot to stop music.');
const pauseCmd = new Command('pause', 'Tell at bot to pause music.');
const volumeCmd = new Command('volume <volume>', 'Tell at bot to set volume at 0-200% (between 0 and 2).');

// https://discord.js.org/#/docs/main/stable/class/StreamDispatcher
module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        playCmd.match(message.content, ({ source }) => {
            const song = songs.find(song => song.tag === source);

            if (!!song && song.type === 'file') {
                return voiceClient.playFile(song.source)
                    .catch(err => message.reply('An error occurred ' + err));
            } else if (!!song) {
                source = song.source;
            }

            voiceClient.playUrl(source)
                .catch(err => message.reply('An error occurred ' + err));
        });

        addCmd.match(message.content, ({ source, tag }) => {
            const song = { tag, source, type: 'url' };

            songs.push(song);
            repository.insert(song).then(() => console.log('ok')).catch(error => console.log(error));

            message.channel.send(`La source ${source} est maintenant rattachée au tag ${tag}.`);
        });

        removeCmd.match(message.content, ({ tag }) => {
            for (let i = 0; i < songs.length; i++) {
                if (songs[i].tag === tag) {
                    repository.remove(songs[i]);
                    songs.splice(i, 1);

                    return message.channel.send(`Tag ${tag} supprimé.`);
                }
            }

            message.channel.send(`Aucun tag ${tag}.`);
        });

        tagsCmd.match(message.content, () => {
            const tags = songs.map(song => song.tag).join(', ');
            message.channel.send(`Tags : ${tags}`);
        });

        stopCmd.match(message.content, () => voiceClient.stop());
        pauseCmd.match(message.content, () => voiceClient.pause());
        volumeCmd.match(message.content, ({ volume }) => voiceClient.setVolume(volume));
    });
};
