
/**
 * Logger interface
 * @module Logger
 */
class Logger {
    constructor() {
        this.client = null;
        this.channel = null;
    }

    /**
     * Set channel where send logs
     * @param {Channel} channel
     *
     * @alias module:Logger
     */
    setChannel(channel) {
        this.channel = channel;
    }

    /**
     * Set discord client
     * @param {Client} client
     *
     * @alias module:Logger
     */
    setClient(client) {
        this.client = client;
    }

    /**
     * Check if client and channel is initialize
     * @return {boolean}
     *
     * @alias module:Logger
     */
    isInit() {
        return !!this.client && !!this.channel;
    }

    /**
     * Format date
     * @return {string}
     *
     * @alias module:Logger
     */
    getDate() {
        const now = new Date();
        return `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    }

    /**
     * Send log as info message
     * @param {string} message
     *
     * @alias module:Logger
     */
    info(message) {
        if (this.isInit()) {
            this.channel.send(`${this.getDate()} [INFO] ${message}`);
        }
    }

    /**
     * Send log as debug message
     * @param {string} message
     *
     * @alias module:Logger
     */
    debug(message) {
        if (this.isInit()) {
            this.channel.send(`${this.getDate()} [DEBUG] ${message}`);
        }
    }

    /**
     * Send log of HTTP request
     * @param {string} url
     * @param {Response} res
     *
     * @alias module:Logger
     */
    request(url, res) {
        if (this.isInit()) {
            this.channel.send(`${this.getDate()} [DEBUG] Request at ${url}, response <${res.statusCode}> : ${res.body}`);
        }
    }
}

module.exports = new Logger();
