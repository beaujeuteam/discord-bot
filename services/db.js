const MongoClient = require('mongodb').MongoClient;

/**
 * MongoDB database connection service
 * @module DB
 */
class DB {

    /**
     * @param {string} host
     * @param {string} dbname
     * @param {string} user
     * @param {string} [password=null]
     * @param {string|number} [port=27017]
     *
     * @alias module:DB
     */
    constructor (host, dbname, user, password = null, port = 27017) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.port = port;
        this.dbname = dbname;
        this.db = null;
    }

    /**
     * @param {Callable} callback
     *
     * @alias module:DB
     */
    connect(callback) {
        if (!!this.db) {
            return callback();
        }

        MongoClient.connect(`mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.dbname}`, (error, db) => {
            this.db = db;

            if (!!error) {
                console.error(error);
            }

            callback(error, db);
        });
    }
}

const config = require('./../config.json').db;
module.exports = new DB(config.host, config.dbname, config.user, config.password, config.port);
