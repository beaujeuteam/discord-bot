const fs = require('fs');
const { exec } = require('child_process');
const Repository = require('./../../services/repository');

const voiceClient = require('./../../services/voice-client');
const { Command } = require('./../../services/commands');

let songs = [
    { tag: 'ready', type: 'file', source: __dirname + '/musics/ready.mp3' }
];

const repo = new Repository('discord_songs');
const fileRepo = new Repository('files');
repo.find().then(result => songs = songs.concat(result));

const playCmd = new Command('play [source]', 'Tell at bot to play music from url or from tag.', 'music');
const addCmd = new Command('add [source] [tag]', 'Add music source with tag.', 'music');
const tagsCmd = new Command('tags', 'List all tags.', 'music');
const removeCmd = new Command('remove [tag]', 'Remove tag.', 'music');
const stopCmd = new Command('stop', 'Tell at bot to stop music.', 'music');

// https://discord.js.org/#/docs/main/stable/class/StreamDispatcher
module.exports = client => {
    client.http.get('/api/songs/status', (req, res) => {
        return res.json({
            playing: voiceClient.playing
        });
    });

    client.http.get('/api/songs', (req, res) => {
        return repo.find().then(songs => res.json(songs));
    });

    client.http.get('/api/song/:id', (req, res) => {
        return repo.findOne({ _id: req.params.id }).then(song => res.json(song));
    });

    client.http.put('/api/song/:id/play', (req, res) => {
        if (voiceClient.playing) {
            return res.json({ error: 'already playing' });
        }

        repo.findOne({ _id: req.params.id }).then(song => {
            if (!song || !voiceClient.connection) {
                return res.json({ error: 'Not ready' });
            }

            if (song.type === 'url') {
                voiceClient.playUrl(song.source).then(() => res.json({}));
            } else {
                voiceClient.playFile(`${__dirname}/../../medias/${song.source}`).then(() => res.json({}));
            }
        });
    });

    client.http.post('/api/song/url', (req, res) => {
        fileRepo.insert({
            created_at: new Date(),
            user: 'discord',
            name: req.body.poster.filename,
            size: req.body.poster.length,
            mimetype: req.body.poster.mimetype,
            encoding: req.body.poster.encoding,
            data: fs.readFileSync(req.body.poster.filepath),
            tags: []
        }).then(data => {
            const song = {
                tag: req.body.tag,
                source: req.body.source,
                type: 'url',
                poster: `https://files.beelab.tk/file/${data._id}`
            };

            repo.insert(song, {}).then(data => res.json(data));
        });
    });

    client.http.post('/api/song/file', (req, res) => {
        fileRepo.insert({
            created_at: new Date(),
            user: 'discord',
            name: req.body.poster.filename,
            size: req.body.poster.length,
            mimetype: req.body.poster.mimetype,
            encoding: req.body.poster.encoding,
            data: fs.readFileSync(req.body.poster.filepath),
            tags: []
        }).then(data => {
            exec(`mv ${req.body.source.filepath} ${__dirname}/../../medias/${req.body.source.filename}`);

            const song = {
                tag: req.body.tag,
                source: req.body.source.filename,
                type: 'file',
                poster: `https://files.beelab.tk/file/${data._id}`
            };

            repo.insert(song, {}).then(data => res.json(data));
        });
    });

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

            try {
                message.reply('Chargement en cours, merci de patienter !');
                voiceClient.playUrl(source)
                    .then(() => message.reply(`C'est parti la musique !`))
                    .catch(err => message.reply('An error occurred ' + err));
            } catch (err) {
                voiceClient.playStream(source, { type: 'opus' })
                    .catch(err => message.reply('An error occurred ' + err));
            }
        });

        addCmd.match(message.content, ({ source, tag }) => {
            const song = { tag, source, type: 'url' };

            songs.push(song);
            repo.insert(song);

            message.channel.send(`La source ${source} est maintenant rattachée au tag ${tag}.`);
        });

        removeCmd.match(message.content, ({ tag }) => {
            for (let i = 0; i < songs.length; i++) {
                if (songs[i].tag === tag) {
                    repo.remove(songs[i]);
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
    });
};
