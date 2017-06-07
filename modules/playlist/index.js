const Discord = require('discord.js');
const utils = require('./../../services/utils');
const Playlist = require('./models/playlist');
const repository = require('./repositories/playlists');
const DB = require('./../../services/db');

let playlists = [];

const p = new Playlist('naheulbeuk');

p.add('https://www.youtube.com/watch?v=jC7ghwsvYmE');
p.add('https://www.youtube.com/watch?v=UWPdBI9FlTg');
p.add('https://www.youtube.com/watch?v=Y-1WabDTeN0');
p.add('https://www.youtube.com/watch?v=8XGMUvvN4WY');
p.add('https://www.youtube.com/watch?v=DFOQJf5BTAI');
p.add('https://www.youtube.com/watch?v=nloAYB9jr54');
p.add('https://www.youtube.com/watch?v=UWpLTWZNT4g');

playlists.push(p);

DB.connect(() => {
    repository.find().then(result => playlists = playlists.concat(result.map(p => Playlist.unserialize(p))));
});

// https://discord.js.org/#/docs/main/stable/class/StreamDispatcher
module.exports = client => {
    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        utils.command('/playlist list', message.content, () => {
            if (0 === playlists.length) {
                return message.channel.sendMessage(`Aucune playlist.`);
            }

            let result = '';
            playlists.forEach(playlist => result += `- ${playlist.name}\n`);

            return message.channel.sendMessage(`Les playlist :\n${result}`);
        });

        utils.command('/playlist list ([a-zA-Z0-9_]+)', message.content, result => {
            const search = result[0];
            const playlist = playlists.find(playlist => playlist.name === search);

            if (!!playlist) {
                let result = `${playlist.name} :\n`;
                playlist.tracks.forEach(track => result += `- ${track}\n`);

                return message.channel.sendMessage(result);
            }

            return message.channel.sendMessage(`Aucune playlist "${search}" trouvée.`);
        });

        utils.command('/playlist play #([0-9]+)', message.content, result => {
            const playlist = playlists.find(playlist => playlist.currentPlaylist);

            if (!!playlist) {
                return playlist.play(message.channel, parseInt(result[0]) - 1);
            }

            return message.channel.sendMessage(`Aucune playlist en cours de lecture.`);
        });

        utils.command('/playlist play ([a-zA-Z0-9_]+)', message.content, result => {
            playlists.forEach(playlist => playlist.currentPlaylist = false);

            const search = result[0];
            const playlist = playlists.find(playlist => playlist.name === search);

            if (!!playlist) {
                playlist.currentPlaylist = true;

                playlist.reset();
                return playlist.play(message.channel);
            }

            return message.channel.sendMessage(`Aucune playlist "${search}" trouvée.`);
        });

        utils.command('/playlist add ([a-zA-Z0-9_]+) (.*)', message.content, result => {
            const search = result[0];
            let playlist = playlists.find(playlist => playlist.name === search);
            let isNew = false;

            if (!playlist) {
                playlist = new Playlist(search);
                playlists.push(playlist);
                isNew = true;
            }

            const tracks = result[1].split(',');
            tracks.forEach(track => {
                playlist.add(track.trim());
                message.channel.sendMessage(`Ajout de ${track} à la playlist ${playlist.name}`);
            });

            if (isNew) {
                repository.insert(playlist.serialize()).then(p => {
                    playlist.id = p._id;
                    repository.update(playlist.serialize());
                });
            } else {
                repository.update(playlist.serialize());
            }
        });

        utils.command('/playlist next', message.content, () => {
            const playlist = playlists.find(playlist => playlist.currentPlaylist);

            if (!!playlist) {
                return playlist.next();
            }

            return message.channel.sendMessage(`Aucune playlist en cours de lecture.`);
        });

        utils.command('/playlist randomize', message.content, () => {
            const playlist = playlists.find(playlist => playlist.currentPlaylist);

            if (!!playlist) {
                playlist.randomize();
                return message.channel.sendMessage(`Lecture aléatoire : ${playlist.random ? 'activée' : 'désactivée' }`);
            }

            return message.channel.sendMessage(`Aucune playlist en cours de lecture.`);
        });
    });
};
