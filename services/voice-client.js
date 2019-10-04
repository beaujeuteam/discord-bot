const fs = require('fs');
const stream = require('stream');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const request = require('request');
const tts = require('./../lib/tts');
const logger = require('./logger');

/*const { Readable } = require('stream');

const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

class Silence extends Readable {
  _read() {
      this.push(SILENCE_FRAME);
      this.destroy();
  }
}*/

/**
 * Voice client service for discord
 * @module VoiceClient
 */
class VoiceClient {

    constructor() {
        this.channel = null;
        this.connection = null;
        //this.receiver = null;
        this.player = null;
        this.volume = 1;
        //this.id = 0;
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
                        //this.receiver = this.connection.createReceiver();

                        //this.connection.playOpusStream(new Silence());

                        //console.log(this.connection);

                        /*this.connection.on('speaking', (user, speaking) => {
                            // https://github.com/discordjs/discord.js/issues/2929#issuecomment-458584532
                            if (speaking) {
                                this.id++;
                                //const outputStream = fs.createWriteStream(`${this.id}-${user.username}-stream.wav`);
                                //const audioStream = this.connection.receiver.createStream(user, { mode: 'pcm' });
                                const audioStream = this.receiver.createPCMStream(user);
                                this.connection.playStream(audioStream);

                                //audioStream.pipe(outputStream);

                                audioStream.on('data', (data) => {
                                    //console.log(data);
                                    //console.log(audioStream);
                                    //outputStream.write(data);
                                });

                                audioStream.on('end', () => {
                                    console.log('END');
                                    //outputStream.end();
                                    //const cmd = spawn('pocketsphinx_continuous', ['-dict', __dirname + '/../lib/models/fr-FR/fr.dict', '-hmm', __dirname + '/../lib/models/fr-FR/french', '-lm', __dirname + '/../lib/models/fr-FR/fr.lm.dmp', '-infile', `${user.username}-stream.wav`]);
                                    //pocketsphinx_continuous -dict /usr/share/pocketsphinx/model/fr_FR/frenchWords62K.dic -hmm /usr/share/pocketsphinx/model/fr_FR/french_f0/ -lm /usr/share/pocketsphinx/model/fr_FR/french3g62K.lm.dmp -inmic yes
                                });
                            }
                        });*/

                        logger.debug(`Connected to channel ${this.channel.name}`);

                        resolve();
                    });
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

            this.player.end('Stop by leaving');
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
     * @param {Callable} [callback]
     * @param {Object} [options={}]
     *
     * @alias module:VoiceClient
     */
    playFile(file, callback = () => {}, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                return reject(new Error('No connection.'));
            }

            options.volume = this.volume;
            this.connection.playFile(file, options);
            this.player = this.connection.dispatcher;

            this.player.on('start', () => {
                logger.debug(`Play file ${file}`);
                resolve();
            });

            this.player.on('error', error => {
                logger.debug(`Player error ${error}`);
                reject(error);
            });
        });
    }

    /**
     * Make bot play stream
     * @param {Stream} stream
     * @param {Object} [options={}]
     * @return {Promise}
     *
     * @alias module:VoiceClient
     */
    playStream(stream, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                return reject(new Error('No connection.'));
            }

            options.volume = this.volume;
            this.connection.playStream(stream, options);
            this.player = this.connection.dispatcher;

            this.player.on('start', () => {
                logger.debug(`Play stream`);
                resolve();
            });

            this.player.on('error', error => {
                logger.debug(`Player error ${error}`);
                reject(error);
            });
        });
    }

    /**
     * Make bot play unknown source
     * @param {string} string
     * @param {Object} [options={}]
     * @return {Promise}
     *
     * @alias module:VoiceClient
     */
    playUnknown(string, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                return reject(new Error('No connection.'));
            }

            options.volume = this.volume;
            this.connection.playArbitraryInput(string, options);
            this.player = this.connection.dispatcher;

            this.player.on('start', () => {
                logger.debug(`Play stream`);
                resolve(this.player);
            });

            this.player.on('error', error => {
                logger.debug(`Player error ${error}`);
                reject(error);
            });
        });
    }

    /**
     * Make bot says text
     * @param {string} text
     * @param {string} [lang='fr']
     * @return {Promise}
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
                        this.player.on('end', () => {
                            resolve(content);
                        });
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

        if (url.match(/youtube.com\/watch\?v=(.*)/i)) {
            logger.debug(`Youtube link matching`);
            stream = ytdl(url, { quality: 'lowest', filter: 'audioonly' });

            stream.on('error', err => logger.error(`Error with youtube stream : ${err.message}`));
        } else {
            stream = request(url);
        }

        return this.playStream(stream);
    }

    /**
     * Stop music
     * @param {string} [reason=null]
     *
     * @alias module:VoiceClient
     */
    stop(reason = null) {
        if (null !== this.player) {
            logger.debug(`Player stop`);
            this.player.end(reason);
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
