const DB = require('./db');
const MongoObjectID = require("mongodb").ObjectID;

class Repository {
    constructor(collection) {
        this.collection = collection;
    }

    update(data, options = {}) {
        return new Promise((resolve, reject) => {
            DB.connect((error, db) => {
                if (error) {
                    throw new Error(error);
                }

                db.collection(this.collection).update({ _id: new MongoObjectID(data._id) }, data, options, (error, results) => {
                    if (!!error) {
                        return reject(error);
                    }

                    DB.close();

                    return resolve(results);
                });
            });
        });
    }

    remove(data, options = {}) {
        return new Promise((resolve, reject) => {
            DB.connect((error, db) => {
                if (error) {
                    throw new Error(error);
                }

                db.collection(this.collection).remove({ _id: new MongoObjectID(data._id) }, options, (error, results) => {
                    if (!!error) {
                        return reject(error);
                    }

                    DB.close();

                    return resolve(results);
                });
            });
        });
    }

    find() {
        return new Promise((resolve, reject) => {
            DB.connect((error, db) => {
                if (error) {
                    throw new Error(error);
                }

                db.collection(this.collection).find({}).toArray((error, results) => {
                    if (!!error) {
                        return reject(error);
                    }

                    DB.close();

                    return resolve(results);
                });
            });
        });
    }

    findOne(params) {
        return new Promise((resolve, reject) => {
            DB.connect((error, db) => {
                if (error) {
                    throw new Error(error);
                }

                if (params.id || params._id) {
                    params._id = new MongoObjectID(params.id || params._id);
                }

                DB.db.collection(this.collection).findOne(params, {}, (error, result) => {
                    if (!!error) {
                        return reject(error);
                    }

                    DB.close();

                    return resolve(result);
                });
            });
        });
    }

    insert(data, options = {}) {
        return new Promise((resolve, reject) => {
            DB.connect((error, db) => {
                if (error) {
                    throw new Error(error);
                }

                db.collection(this.collection).insert(data, options, (error, results) => {
                    if (!!error) {
                        return reject(error);
                    }

                    DB.close();

                    return resolve(results.ops[0]);
                });
            });
        });
    }
}

module.exports = Repository;
