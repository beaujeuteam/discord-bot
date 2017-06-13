const stream = require('stream');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const request = require('request');
const tts = require('./../lib/tts');
const logger = require('./logger');

/**
 * Voice client service for discord
 * @module VoiceClient
 */
class VoiceClient {

    constructor() {
        this.channel = null;
        this.connection = null;
        this.player = null;
        this.volume = 1;
    }

    /**
     * Make bot join channel
     * @param {VoiceChannel} channel
     * @return {Promise}
     *
     * @alias module:VoiceClient
     */
    join(channel) {
        this.leave();

        logger.debug(`Connecting to channel ${channel.name}`);

        return new Promise((resolve, reject) => {
            if (channel instanceof Discord.VoiceChannel && channel.joinable) {
                channel.join()
                    .then(connection => {
                        this.connection = connection;
                        this.channel = channel;

                        logger.debug(`Connected to channel ${this.channel.name}`);

                        resolve();
                    })
                    .catch(err => reject(err));
            } else {
                reject('Not joinable');
            }
        });
    }

    /**
     * Make bot leave current channel
     *
     * @alias module:VoiceClient
     */
    leave() {
        if (!!this.connection) {
            logger.debug(`Leave channel ${this.channel.name}`);

            this.player.end();
            this.player = null;

            this.connection.disconnect();
            this.connection = null;

            this.channel.leave();
            this.channel = null;
        }
    }

    /**
     * Make bot play music file
     * @param {string} file
     * @param {Object} [options={}]
     *
     * @alias module:VoiceClient
     */
    playFile(file, options = {}) {
        if (!!this.connection) {

            if (!!this.player) {
                this.player.end();
                this.player.stream = null;
                this.player = null;
            }

            options.volume = this.volume;
            this.player = this.connection.playFile(file, options);

            this.player.on('start', () => logger.debug(`Play file ${file}`));
        }
    }

    /**
     * Make bot play stream
     * @param {Stream} stream
     * @param {Object} [options={}]
     *
     * @alias module:VoiceClient
     */
    playStream(stream, options = {}) {
        if (!!this.connection) {

            if (!!this.player) {
                this.player.end();
                this.player.stream = null;
                this.player = null;
            }

            options.volume = this.volume;
            this.player = this.connection.playStream(stream, options);

            this.player.on('start', () => logger.debug(`Play stream`));
        }
    }

    /**
     * Make bot says text
     * @param {string} text
     * @param {string} [lang='fr']
     *
     * @alias module:VoiceClient
     */
    playText(text, lang = 'fr') {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                return reject();
            }

            const config = require('./../config.json').tokens;
            const languages = {
                "fr": "fr-fr",
                "us": "en-us",
                "ru": "ru-ru",
                "es": "es-es",
                "de": "de-de"
            };

            logger.debug(`Play text "${text}" with ${lang} language`);

            if (!!config.tts_token) {
                tts.speech({
                    key: config.tts_token,
                    hl: languages[lang] || 'fr-fr',
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
            }
        });
    }

    /**
     * Make bot play music from url
     * @param {string} url
     * @param {Object} [options={}]
     * @return {Promise}
     *
     * @alias module:VoiceClient
     */
    playUrl(url, options = {}) {
        let stream = null;

        logger.debug(`Play URL ${url}`);

        return new Promise((resolve, reject) => {
            if (url.match(/youtube.com\/watch\?v=(.*)/i)) {
                logger.debug(`Youtube link matching`);
                stream = ytdl(url, { quality: 'lowest', filter: 'audioonly' });
            } else {
                stream = request(url);
            }

            stream.on('start', () => resolve(stream));
            stream.on('error', () => reject(error));

            this.playStream(stream);
        });
    }

    /**
     * Stop music
     *
     * @alias module:VoiceClient
     */
    stop() {
        if (null !== this.player) {
            logger.debug(`Player stop`);
            this.player.end('Stop by user');
        }
    }

    /**
     * Pause or resume music
     *
     * @alias module:VoiceClient
     */
    pause() {
        if (null !== this.player && !this.player.paused) {
            logger.debug(`Player pause`);
            this.player.pause();
        } else if (null !== this.player && this.player.paused) {
            logger.debug(`Player resume`);
            this.player.resume();
        }
    }

    /**
     * Set volume between 0 and 2
     * @param {number} volume
     *
     * @alias module:VoiceClient
     */
    setVolume(volume) {
        const newVolume = volume >= 0 && volume <= 2 ? volume : 1;
        if (null !== this.player) {
            logger.debug(`Set volume at ${newVolume}`);

            this.volume = newVolume;
            this.player.setVolume(newVolume);
        }
    }
}

module.exports = new VoiceClient();
