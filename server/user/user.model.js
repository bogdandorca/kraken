var crypto = require('crypto');

class User {
    constructor(user) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.salt = crypto.randomBytes(32).toString('base64');
        this.password = crypto.pbkdf2Sync(user.password, this.salt, 10000, 64).toString('base64');
        // TODO: prevent this from being duplicated in the DB
        this.active = crypto.randomBytes(32).toString('base64').replace('/', '').replace('?', '').replace('&', '');
    }
}

module.exports = User;
