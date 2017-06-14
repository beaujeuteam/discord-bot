const voiceClient = require('./../../../services/voice-client');

class Playlist {

    constructor(name) {
        this.id = null;
        this.name = name;
        this.tracks = [];
        this.currentTrack = 0;
        this.currentPlaylist = false;
        this.channel = null;
        this.random = false;
    }

    add(track) {
        this.tracks.push(track);
    }

    play(channel = null, playTrack = null) {
        if (null === voiceClient.connection) {
            return;
        }

        if (null !== playTrack && playTrack >= 0 && playTrack <= this.tracks.length) {
            this.currentTrack = playTrack;
        }

        if (null !== channel) {
            this.channel = channel;
        }

        const track = this.tracks[this.currentTrack];

        voiceClient.playUrl(track)
            .then(() => {
                voiceClient.player.once('end', reason => {
                    if (reason === 'Stream is not generating quickly enough.' || reason === 'skip song') {
                        setTimeout(() => this.next(), 1000);
                    }
                });

                if (!!this.channel) {
                    this.channel.send(`Lecture de ${track} de la playlist "${this.name}" [${this.currentTrack + 1} / ${this.size}]`);
                }
            })
            .catch(err => this.channel.send('An error occurred ' + error));
    }

    next () {
        this.currentTrack++;

        if (this.currentTrack > this.tracks.length - 1) {
            this.currentTrack = 0;
        }

        if (this.random) {
            this.currentTrack = Math.floor(Math.random() * this.tracks.length);
        }

        this.play();
    }

    reset() {
        this.currentTrack = 0;
    }

    randomize() {
        this.random = !this.random;
    }

    stop(reason) {
        this.voiceClient.stop(reason);
    }

    get track() {
        return this.tracks[this.currentTrack];
    }

    get size() {
        return this.tracks.length;
    }

    serialize() {
        return {
            _id: this.id,
            name: this.name,
            tracks: this.tracks.join()
        }
    }

    static unserialize(data) {
        let playlist = new Playlist(data.name);
        playlist.id = data._id;
        playlist.tracks = data.tracks.split(',');

        return playlist;
    }
}

module.exports = Playlist;
