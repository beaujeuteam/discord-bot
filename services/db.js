const MongoClient = require('mongodb').MongoClient;

class DB {

    constructor (host, dbname, user, password = null, port = '27017') {
        this.host = host;
        this.user = user;
        this.password = password;
        this.port = port;
        this.dbname = dbname;
        this.db = null;
    }

    connect(callback) {
        if (!!this.db) {
            return callback();
        }

        MongoClient.connect(`mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.dbname}`, (error, db) => {
            this.db = db;
            callback();
        });
    }
}

const config = require('./../config.json').db;
module.exports = new DB(config.host, config.dbname, config.user, config.password, config.port);
