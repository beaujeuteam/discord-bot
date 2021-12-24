
class Header extends CustomElement {
    constructor() {
        super();

        this.event = () => new CustomEvent('open', { composed: true });
    }

    static get template() {
        return `
            <link rel="stylesheet" href="/modules/@fortawesome/fontawesome-free/css/all.css">
            
            <style>
                header {
                    position: sticky;
                    top: 0;
                    
                    margin: 0 0 1em 0;
                    padding: 1em;

                    box-shadow: 0 2px 0 0 #f5f5f5;
                    background: white;
                }
                
                header nav ul {
                    display: flex;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }
                
                nav li {
                    margin-right: 1em;
                }
                
                small {
                    font-size: .5em;
                }
                
                .button {
                    cursor: pointer;
                }
            </style>
            
            <header class="layout-header">
                <nav>
                    <ul>
                        <li class="button"><i class="fas fa-bars" (click)="this.emit(this.event())"></i></li>
                        <li>Soundbox <small>v1.0.0</small></li>
                    </ul>
                </nav>
            </header>
        `;
    }
}

window.customElements.define('soundbox-header', Header);
