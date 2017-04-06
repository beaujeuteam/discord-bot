const stream = require('stream');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const request = require('request');
const tts = require('./../lib/tts');

class VoiceClient {

    constructor() {
        this.channel = null;
        this.connection = null;
        this.player = null;
        this.volume = 1;
    }

    join(channel) {
        this.leave();

        return new Promise((resolve, reject) => {
            if (channel instanceof Discord.VoiceChannel && channel.joinable) {
                channel.join()
                    .then(connection => {
                        this.connection = connection;
                        this.channel = channel;

                        resolve();
                    })
                    .catch(err => reject(err));
            } else {
                reject('No joinable');
            }
        });
    }

    leave() {
        if (!!this.connection) {
            this.channel.leave();
        }
    }

    playFile(file, options = {}) {
        if (!!this.connection) {
            options.volume = this.volume;
            this.player = this.connection.playFile(file, options);
        }
    }

    playStream(stream, options = {}) {
        if (!!this.connection) {
            options.volume = this.volume;
            this.player = this.connection.playStream(stream, options);
        }
    }

    playText(text, lang = 'fr-fr') {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject();
            }

            tts.speech({
                key: require('./../config.json').tts_token,
                hl: lang,
                src: text,
                r: 0,
                c: 'mp3',
                f: '44khz_16bit_stereo',
                ssml: false,
                b64: false,
                callback: (err, content) => {
                    if (!!err) {
                        return reject(err);
                    }

                    const bufferStream = new stream.PassThrough();
                    bufferStream.end(content);
                    this.player = this.connection.playStream(bufferStream);

                    resolve(content);
                }
            });
        });
    }

    playUrl(url, options = {}) {
        let stream = null;

        return new Promise((resolve, reject) => {
            if (url.match(/youtube.com\/watch\?v=(.*)/i)) {
                stream = ytdl(url, { quality: 'lowest', filter: 'audioonly' });
            } else {
                stream = request(url);
            }

            resolve(stream);

            this.playStream(stream);
        });
    }

    stop() {
        if (null !== this.player) {
            this.player.end('Stop by user');
        }
    }

    pause() {
        if (null !== this.player && !this.player.paused) {
            this.player.pause();
        } else if (null !== this.player && this.player.paused) {
            this.player.resume();
        }
    }

    setVolume(volume) {
        const newVolume = volume >= 0 && volume <= 2 ? volume : 1;
        if (null !== this.player) {
            this.volume = newVolume;
            this.player.setVolume(newVolume);
        }
    }
}

module.exports = new VoiceClient();
