
class Soundbox extends CustomElement {
    constructor() {
        super();

        this.repository = this.get('SongRepository');

        this.songs = [];
    }

    onConnected() {
        this.repository.find().then(songs => this.update({ songs }));
    }

    openSidebar() {
        this.element('.sidebar').classList.add('active');
    }

    closeSidebar() {
        this.element('.sidebar').classList.remove('active');
    }

    static get template() {
        return `
            <link rel="stylesheet" href="/modules/@fortawesome/fontawesome-free/css/all.css">
            <style>
                .board {
                    display: flex;
                    flex-wrap: wrap;
                    
                    margin: 1em;
                }
            
                .button-song {
                    width: calc(100% / 2);
                    flex-shrink: 0;
                }
                
                .sidebar {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: -100%;
                    width: 100%;
                    padding: 1em;
                    color: white;
                    background: #282828;
                    
                    transition: left .5s;
                    z-index: 1000;
                }
                
                .sidebar.active {
                    transition: left .25s;
                    left: 0;
                }
                
                .close-button {
                    float: right;
                    cursor: pointer;
                }
                
                @media (min-width: 48rem) {
                    .button-song {
                        width: calc(100% / 4);
                    }
                    
                    .sidebar {
                        width: 50%;
                    }
                }
                    
                @media (min-width: 62rem) {
                    .button-song {
                        width: calc(100% / 6);
                    }
                    
                    .sidebar {
                        width: 25%;
                    }
                }
            </style>
            
            <soundbox-header (open)="this.openSidebar()"></soundbox-header>
            <main>
                <aside class="sidebar">
                    <i class="close-button fas fa-times" (click)="this.closeSidebar()"></i>
                    <soundbox-form></soundbox-form>
                </aside>

                <section class="board">
                    <soundbox-song class="button-song" #for="let song of this.songs" [attr.songid]="song._id"></soundbox-song>
                </section>
            </main>
        `;
    }

    static get injects() {
        return [SongRepository];
    }
}

window.customElements.define('soundbox-app', Soundbox);
