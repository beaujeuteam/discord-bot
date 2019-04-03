const Discord = require('discord.js');
const Playlist = require('./models/playlist');
const Repository = require('./../../services/repository');

const { Command } = require('./../../services/commands');
const voiceClient = require('./../../services/voice-client');

let playlists = [];
let radios = [];
let radioInfo = {};

const repo = new Repository('playlists');
const radioRepo = new Repository('streams');

const findPlaylist = () => {
    return repo.find().then(result => result.map(p => Playlist.unserialize(p)));
}

const findRadio = () => {
    return radioRepo.find();
}

findPlaylist().then(p => playlists = p);
findRadio().then(p => radios = p);

const radiolistCmd = new Command('radio', 'List all radios.');
const radioPlayCmd = new Command('radio play [name]', 'Play radio.');

const playlistCmd = new Command('playlist', 'List all playlist.');
const playlistInfoCmd = new Command('playlist [name]', 'List songs of playlist.');
const playlistPlayCmd = new Command('playlist play [name]', 'Play playlist.');
const playlistPlaySongCmd = new Command('playlist play [name] <number>', 'Play song of playlist.');
const playlistCurrentPlaySongCmd = new Command('playlist play <number>', 'Play song from current playlist.');
const playlistNextCmd = new Command('next', 'Play next song from playlist.');
const playlistRandomizeCmd = new Command('randomize', 'Set randomize mod.');

module.exports = client => {
    client.http.post('/radio', (req, res) => {
        const data = JSON.parse(req.body.data);

        if (!data.key) {
            return;
        }

        if (radioInfo[data.key]) {
            clearTimeout(radioInfo[data.key]);
            radioInfo[data.key] = setTimeout(() => delete radioInfo[data.key], 1000 * 60 * 60 * 3);
        } else {
            radioRepo.findOne({ key: data.key }).then(radio => {
                const message = `Nouvelle radio lancée !\n${radio.title} par @${radio.user}\nhttp://jukebox.beelab.tk/#/radio/${radio._id}`;
                client.channels.find('name', client.config.channel_main).send(message);
            });

            res.send();

            radioInfo[data.key] = setTimeout(() => delete radioInfo[data.key], 1000 * 60 * 60 * 3);
        }
    });

    client.on('message', message => {
        // Do nothing if is a bot's message
        if (message.author.id === client.user.id) {
            return;
        }

        findPlaylist().then(p => playlists = p);
        findRadio().then(p => radios = p);

        radiolistCmd.match(message.content, () => {
            if (0 === radios.length) {
                return message.channel.send(`Aucune radio.`);
            }

            let result = '';
            radios.forEach(radio => result += `- "${radio.title}" par @${radio.user}\n`);

            message.channel.send(`Les radios :\n${result}`);
        });

        radioPlayCmd.match(message.content, ({ name }) => {
            const regexp = new RegExp(name, 'i');
            const radio = radios.find(r => r.title.match(regexp));

            if (!!radio) {
                return voiceClient.playUnknown(`rtmp://stream.beelab.tk/live/${radio.key}`)
                    .catch(err => message.reply('An error occurred ' + err));
            }

            message.channel.send(`Aucune radio "${name}" trouvée.`);
        });

        playlistCmd.match(message.content, () => {
            if (0 === playlists.length) {
                return message.channel.send(`Aucune playlist.`);
            }

            let result = '';
            playlists.forEach(playlist => result += `- "${playlist.name}" par @${playlist.user}\n`);

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
