const Discord = require('discord.js');
const Playlist = require('./models/playlist');
const Repository = require('./../../services/repository');

const { Command } = require('./../../services/commands');
const voiceClient = require('./../../services/voice-client');

let playlists = [];
let radios = [];
let radioInfo = {};
let current = null;

const repo = new Repository('playlists');
const radioRepo = new Repository('streams');

const findPlaylist = () => {
    return repo.find().then(result => result.map(p => Playlist.unserialize(p)));
};

const findRadio = () => {
    return radioRepo.find();
};

const playRadio = (key, message) => {
    console.log(`play stream rtmp://stream.beelab.tk/live/${key}`);

    return voiceClient.playStream(`rtmp://stream.beelab.tk/live/${key}`)
        .then(player => player.on('speaking', speaking => {
            if (player.playing && !speaking) {
                return playRadio(key, message);
            }
        }))
        .catch(err => message.reply('An error occurred ' + err));
};

findPlaylist().then(p => playlists = p);
findRadio().then(p => radios = p);

const radiolistCmd = new Command('radio', 'List all radios.');
const radioPlayCmd = new Command('radio play [name]', 'Play radio.');

const playlistCmd = new Command('playlist', 'List all playlist.');
const playlistInfoCmd = new Command('playlist [name]', 'List songs of playlist.');
const playlistPlayCmd = new Command('playlist play [name]', 'Play playlist.');
//const playlistPlaySongCmd = new Command('playlist play [name] <number>', 'Play song of playlist.');
//const playlistCurrentPlaySongCmd = new Command('playlist play <number>', 'Play song from current playlist.');
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
                client.channels.cache.get(client.config.channel_main).send(message);
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

        if (message.content.match('/stop')) {
            current = null;
        }

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
                message.reply(`Radio ${name} trouvée !`);
                return playRadio(radio.key, message);
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
                let result = `${playlist.name} : http://jukebox.beelab.tk/#/playlist/${playlist.id}\n`;
                playlist.tracks.forEach(track => result += `- ${track.title}\n`);

                return message.channel.send(result);
            }

            message.channel.send(`Aucune playlist "${name}" trouvée.`);
        });

        /*playlistCurrentPlaySongCmd.match(message.content, ({ number }) => {
            if (!!current) {
                return current.play(message.channel, parseInt(number) - 1);
            }

            message.channel.send(`Aucune playlist en cours.`);
        });*/

        /*playlistPlaySongCmd.match(message.content, ({ name, number }) => {
            const regexp = new RegExp(name, 'i');
            const playlist = playlists.find(playlist => playlist.name.match(regexp));

            if (!!playlist) {
                current = playlist;

                return playlist.play(message.channel, parseInt(number) - 1);
            }

            message.channel.send(`Aucune playlist "${name}" trouvée.`);
        });*/

        playlistPlayCmd.match(message.content, ({ name }) => {
            playlists.forEach(playlist => playlist.currentPlaylist = false);

            const regexp = new RegExp(name, 'i');
            const playlist = playlists.find(playlist => playlist.name.match(regexp));

            if (!!playlist) {
                current = playlist;
                current.reset();

                return current.play(message.channel);
            }

            message.channel.send(`Aucune playlist "${name}" trouvée.`);
        });

        playlistNextCmd.match(message.content, () => {
            if (!!current) {
                return current.stop('skip song');
            }

            message.channel.send(`Aucune playlist en cours de lecture.`);
        });

        playlistRandomizeCmd.match(message.content, () => {
            if (!!current) {
                current.randomize();
                return message.channel.send(`Lecture aléatoire : ${current.random ? 'activée' : 'désactivée' }`);
            }

            message.channel.send(`Aucune playlist en cours de lecture.`);
        });
    });
};
