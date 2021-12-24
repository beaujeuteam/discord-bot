
class Form extends CustomElement {
    constructor() {
        super();

        this.repository = this.get('SongRepository');
    }

    onSubmit({ target }, type) {
        target.querySelector('button').setAttribute('disabled', 'disabled');
        this.repository.post(target, type).then(() => {
            target.reset();
            target.querySelector('button').removeAttribute('disabled');
        });
    }

    static get template() {
        return `
            <style>
                .group {
                    padding: 0.5em 0;
                }
                
                label {
                    display: block;
                    font-size: .8em;
                    font-style: italic;
                }
                
                button {
                    width: 100%;
                    background: #00d1b2;
                    border-color: transparent;
                    color: #fff;
                    padding: calc(.5em - 1px) 1em;
                    border-radius: 5px;
                    
                    cursor: pointer;
                }
                
                button:hover {
                    background: #00c4a7;
                }
            </style>

            <p>Add new song by youtube URL</p>
            <form (submit.prevent)="this.onSubmit($event, 'url')">
                <div class="group">
                    <label for="tag">Tag</label>
                    <input id="tag" type="text" name="tag" required>
                </div>
                
                <div class="group">
                    <label for="poster">Image file</label>
                    <input id="poster" type="file" name="poster" required accept="image/*">
                </div>
                
                <div class="group">
                    <label for="source">Youtube link</label>
                    <input id="source" type="text" name="source" required placeholder="https://">
                </div>
                
                <button type="submit">Send</button>
            </form>
            
            <hr>
            
            <p>Add new song by mp3 file</p>
            <form (submit.prevent)="this.onSubmit($event, 'file')">
                <div class="group">
                    <label for="tag">Tag</label>
                    <input id="tag" type="text" name="tag" required>
                </div>
                
                <div class="group">
                    <label for="poster">Image file</label>
                    <input id="poster" type="file" name="poster" required accept="image/*">
                </div>
                
                <div class="group">
                    <label for="source">Audio file</label>
                    <input id="source" type="file" name="source" required accept="audio/*">
                </div>
                
                <button type="submit">Send</button>
            </form>
        `;
    }
}

window.customElements.define('soundbox-form', Form);
