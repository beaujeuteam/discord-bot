
class Logger {
    constructor() {
        this.client = null;
        this.channel = null;
    }

    setChannel(channel) {
        this.channel = channel;
    }

    setClient(client) {
        this.client = client;
    }

    isInit() {
        return !!this.client && !!this.channel;
    }

    getDate() {
        const now = new Date();
        return `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    }

    info(message) {
        if (this.isInit()) {
            this.channel.sendMessage(`${this.getDate()} [INFO] ${message}`);
        }
    }

    debug(message) {
        if (this.isInit()) {
            this.channel.sendMessage(`${this.getDate()} [DEBUG] ${message}`);
        }
    }

    request(url, res) {
        if (this.isInit()) {
            this.channel.sendMessage(`${this.getDate()} [DEBUG] Request at ${url}, response <${res.statusCode}> : ${res.body}`);
        }
    }
}

module.exports = new Logger();
