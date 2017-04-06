const MongoObjectID = require("mongodb").ObjectID;
const DB = require('./../../../services/db');

class PlaylistsRepository {

    find() {
        return new Promise((resolve, reject) => {
            DB.db.collection('playlists').find({}).toArray((error, results) => {
                if (!!error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    }

    insert(data, options = {}) {
        return new Promise((resolve, reject) => {
            DB.db.collection('playlists').insert(data, options, (error, results) => {
                if (!!error) {
                    return reject(error);
                }
                return resolve(results.ops[0]);
            });
        });
    }

    update (data, options = {}) {
        return new Promise((resolve, reject) => {
            DB.db.collection('playlists').update({ _id: new MongoObjectID(data._id) }, data, options, (error, results) => {
                if (!!error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    }
}

module.exports = new PlaylistsRepository();
