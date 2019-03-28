const MongoObjectID = require("mongodb").ObjectID;
const DB = require('./../../../services/db');

class RadioRepository {

    constructor() {
        this.collection = 'streams';
    }

    findOne(key) {
        return new Promise((resolve, reject) => {
            DB.db.collection(this.collection).findOne({ key }, {}, (error, result) => {
                if (!!error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    }
}

module.exports = new RadioRepository();
