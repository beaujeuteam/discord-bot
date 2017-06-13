const MongoObjectID = require("mongodb").ObjectID;
const DB = require('./../../../services/db');

class MessagesRepository {

    constructor() {
        this.collection = 'discord_messages';
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
}

module.exports = new MessagesRepository();
