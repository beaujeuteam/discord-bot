const MongoObjectID = require("mongodb").ObjectID;
const DB = require('./../../../services/db');

class SongsRepository {

    constructor() {
        this.collection = 'discord_songs';
    }

    find() {
        return new Promise((resolve, reject) => {
            DB.db.collection(this.collection).find({}).toArray((error, results) => {
                if (!!error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    }

    insert(data, options = {}) {
        return new Promise((resolve, reject) => {
            DB.db.collection(this.collection).insert(data, options, (error, results) => {
                if (!!error) {
                    return reject(error);
                }
                return resolve(results.ops[0]);
            });
        });
    }

    remove(data, options = {}) {
        return new Promise((resolve, reject) => {
            DB.db.collection(this.collection).remove({ _id: new MongoObjectID(data._id) }, options, (error, results) => {
                if (!!error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    }
}

module.exports = new SongsRepository();
