
class Song extends CustomElement {
    constructor() {
        super();

        this.repository = this.get('SongRepository');

        this.songid = null;
        this.song = null;
    }

    onConnected() {
        if (this.songid) {
            this.repository.get(this.songid).then(song => this.update({ song }));
        }
    }

    onClick() {
        this.repository.play(this.song._id);
    }

    getImage() {
        const now = (new Date()).getTime();
        return this.song.poster ? `${this.song.poster}?t=original` : `https://cataas.com/c?w=200&time=${now}`;
    }

    getRandomColor() {
        const randomize = () => Math.floor(Math.random()*256);
        return `rgba(${randomize()}, ${randomize()}, ${randomize()}, .5)`;
    }

    static get observedAttributes() {
        return ['songid'];
    }

    static get template() {
        return `
            <style>
                .button {
                    position: relative;
                    width: 100%;
                    height: 200px;
                    
                    transition: opacity .25s;
                    overflow: hidden;
                }
                
                label {
                    position: absolute;
                    top: 0; right: 0; left: 0; bottom: 0;

                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    color: white;
                    text-transform: uppercase;
                    font-weight: bolder;
                    text-shadow: 1px 1px black;
                    
                    cursor: pointer;
                    z-index: 300;
                }
                
                .overlay {
                    position: absolute;
                    
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    
                    mix-blend-mode: difference;
                    z-index: 200;
                }
                
                img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    
                    object-fit: cover;
                    object-position: center;
                    
                    transition: all .25s;
                    
                    z-index: 100;
                }

                .button:hover .overlay {
                    transition: opacity .5s;
                    opacity: 0;
                }
                
                .button:hover img {
                    left: -10%;
                    top: -10%;
                    width: 120%;
                    height: 120%;
                }
                
                .button:active img {
                    left: -1%;
                    top: -1%;
                    width: 102%;
                    height: 102%;
                    
                    filter: blur(2px);
                }
            </style>

            <div class="button" #if="this.song" (click)="this.onClick()">
                <label [innerHTML]="'#' + this.song.tag"></label>
                <div class="overlay" [style.background]="this.getRandomColor()"></div>
                <img [src]="this.getImage()">
            </div>
        `;
    }
}

window.customElements.define('soundbox-song', Song);
