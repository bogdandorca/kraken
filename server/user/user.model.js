var crypto = require('crypto');
var moment = require('moment');

class User {
    // TODO: Add creation date for users
    constructor(user) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.salt = crypto.randomBytes(32).toString('base64');
        this.password = crypto.pbkdf2Sync(user.password, this.salt, 10000, 64).toString('base64');
        // TODO: prevent this from being duplicated in the DB
        this.active = crypto.randomBytes(32).toString('base64').replace('/', '').replace('?', '').replace('&', '');
        /*
         * 0 = user
         * 1 = admin
         * 2 = super-admin
         */
        this.role = 0;
        this.creationDate = moment().format('x');
        this.lastUpdate = moment().format('x');
    }
}

module.exports = User;
