const Discord = require('discord.js');
const utils = require('./../../services/utils');
const Playlist = require('./models/playlist');
const repository = require('./repositories/playlists');
const radioRepository = require('./repositories/radio');
const DB = require('./../../services/db');
const { Command } = require('./../../services/commands');

let playlists = [];
let radios = {};

const findPlaylist = () => {
    return repository.find().then(result => result.map(p => Playlist.unserialize(p)));
}

DB.connect(error => {
    if (!error) {
        findPlaylist().then(p => playlists = p);
    }
});

const playlistCmd = new Command('playlist', 'List all playlist.');
const playlistInfoCmd = new Command('playlist [name]', 'List songs of playlist.');
const playlistPlayCmd = new Command('playlist play [name]', 'Play playlist.');
const playlistPlaySongCmd = new Command('playlist play [name] <number>', 'Play song of playlist.');
const playlistCurrentPlaySongCmd = new Command('playlist play <number>', 'Play song from current playlist.');
//const playlistAddCmd = new Command('playlist add [urls] [name]', 'Add song from url(s) to playlist.');
const playlistNextCmd = new Command('next', 'Play next song from playlist.');
const playlistRandomizeCmd = new Command('randomize', 'Set randomize mod.');
//const playlistDeleteCmd = new Command('playlist delete [name]', 'Delete playlist.');
//const playlistDeleteSongCmd = new Command('playlist delete [name] <number>', 'Delete song from playlist.');

module.exports = client => {
    client.http.post('/radio', (req, res) => {
        const data = JSON.parse(req.body.data);

        if (!data.key) {
            return;
        }

        if (radios[data.key]) {
            clearTimeout(radios[data.key]);
            radios[data.key] = setTimeout(() => delete radios[data.key], 1000 * 60 * 60 * 3);
        } else {
            radioRepository.findOne(data.key).then(radio => {
                const message = `Nouvelle radio lancée !\n${radio.title} par @${radio.user}\nhttp://jukebox.beelab.tk/#/radio/${radio._id}`;
                client.channels.find('name', client.config.channel_main).send(message);
            });

            res.send();

            radios[data.key] = setTimeout(() => delete radios[data.key], 1000 * 60 * 60 * 3);
        }
    });

    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        findPlaylist().then(p => playlists = p);

        playlistCmd.match(message.content, () => {
            if (0 === playlists.length) {
                return message.channel.send(`Aucune playlist.`);
            }

            let result = '';
            playlists.forEach(playlist => result += `- "${playlist.name}" par ${playlist.user}\n`);

            message.channel.send(`Les playlist :\n${result}`);
        });

        playlistInfoCmd.match(message.content, ({ name }) => {
            const regexp = new RegExp(name, 'i');
            const playlist = playlists.find(playlist => playlist.name.match(regexp));

            if (!!playlist) {
                let result = `${playlist.name} : http://jukebox.beaujeuteam.fr/#/playlist/${playlist.id}\n`;
                playlist.tracks.forEach(track => result += `- ${track.title}\n`);

                return message.channel.send(result);
            }

            message.channel.send(`Aucune playlist "${name}" trouvée.`);
        });

        playlistCurrentPlaySongCmd.match(message.content, ({ number }) => {
            const playlist = playlists.find(playlist => playlist.currentPlaylist);

            if (!!playlist) {
                return playlist.play(message.channel, parseInt(number) - 1);
            }

            message.channel.send(`Aucune playlist en cours.`);
        });

        playlistPlaySongCmd.match(message.content, ({ name, number }) => {
            const regexp = new RegExp(name, 'i');
            const playlist = playlists.find(playlist => playlist.name.match(regexp));

            if (!!playlist) {
                playlists.forEach(playlist => playlist.currentPlaylist = false);
                playlist.currentPlaylist = true;

                return playlist.play(message.channel, parseInt(number) - 1);
            }

            message.channel.send(`Aucune playlist "${name}" trouvée.`);
        });

        playlistPlayCmd.match(message.content, ({ name }) => {
            playlists.forEach(playlist => playlist.currentPlaylist = false);

            const regexp = new RegExp(name, 'i');
            const playlist = playlists.find(playlist => playlist.name.match(regexp));

            if (!!playlist) {
                playlist.currentPlaylist = true;
                playlist.reset();

                return playlist.play(message.channel);
            }

            message.channel.send(`Aucune playlist "${name}" trouvée.`);
        });

        /*playlistAddCmd.match(message.content, ({ urls, name }) => {
            let playlist = playlists.find(playlist => playlist.name === name);
            let isNew = false;

            if (!playlist) {
                playlist = new Playlist(name);
                playlists.push(playlist);
                isNew = true;
            }

            const tracks = urls.split(',');
            tracks.forEach(track => {
                playlist.add(track.trim());
                message.channel.send(`Ajout de ${Playlist.cleanTrack(track)} à la playlist ${playlist.name}`);
            });

            if (isNew) {
                repository.insert(playlist.serialize()).then(p => {
                    playlist.id = p._id;
                    repository.update(playlist.serialize());
                });
            } else {
                repository.update(playlist.serialize());
            }
        });*/

        /*playlistDeleteCmd.match(message.content, ({ name }) => {
            for (let i = 0; i < playlists.length; i++) {
                if (playlists[i].name === name) {
                    repository.remove(playlists[i].serialize());
                    playlists.splice(i, 1);

                    return message.channel.send(`Playlist "${name}" supprimée.`);
                }
            }
        });*/

        /*playlistDeleteSongCmd.match(message.content, ({ name, number }) => {
            const playlist = playlists.find(playlist => playlist.name === name);

            if (!!playlist) {
                playlist.tracks.splice((number - 1), 1);
                repository.update(playlist.serialize());

                return message.channel.send(`Musique supprimée.`);
            }

            message.channel.send(`Aucune playlist "${name}" trouvée.`);
        });*/

        playlistNextCmd.match(message.content, () => {
            const playlist = playlists.find(playlist => playlist.currentPlaylist);

            if (!!playlist) {
                return playlist.stop('skip song');
            }

            message.channel.send(`Aucune playlist en cours de lecture.`);
        });

        playlistRandomizeCmd.match(message.content, () => {
            const playlist = playlists.find(playlist => playlist.currentPlaylist);

            if (!!playlist) {
                playlist.randomize();
                return message.channel.send(`Lecture aléatoire : ${playlist.random ? 'activée' : 'désactivée' }`);
            }

            message.channel.send(`Aucune playlist en cours de lecture.`);
        });
    });
};
