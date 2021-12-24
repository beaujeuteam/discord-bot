class SongRepository extends Injectable {
    constructor() {
        super();

        this.url = '/api';
    }

    get(id) {
        return fetch(`${this.url}/song/${id}`)
            .then(response => response.json())
        ;
    }

    find() {
        return fetch(`${this.url}/songs`)
            .then(response => response.json())
        ;
    }

    post(form, type = 'url') {
        const body = new FormData(form);
        return fetch(`${this.url}/song/${type}`, { method: 'POST', body })
            .then(response => response.json())
        ;
    }

    play(id) {
        console.log('PUT PLAY');
        return fetch(`${this.url}/song/${id}/play`, { method: 'PUT' })
            .then(response => response.json())
        ;
    }
}
