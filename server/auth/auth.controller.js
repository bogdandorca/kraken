var config = require('../conf/config');
var db = require('monk')(config.getDatabaseString());
var wrap = require('co-monk');
var users = wrap(db.get('users'));
var Response = require('../response/response');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var moment = require('moment');

class AuthController {

    *login(credentials) {
        if(credentials.email && credentials.password) {
            var user = yield users.findOne({ email: credentials.email });
            if(user) {
                if(user.active === true) {
                    var encryptedPassword = crypto.pbkdf2Sync(credentials.password, user.salt, 10000, 64).toString('base64');
                    if(encryptedPassword === user.password) {
                        var payload = {
                            id: user._id
                        };
                        return jwt.sign(payload, config.getSecret(), { expiresIn: '2d' });
                    } else {
                        return new Response(404, 'Please make sure the correct email and password have been entered');
                    }
                } else {
                    return new Response(403, 'You account has not been activated yet');
                }
            } else {
                return new Response(404, 'Please make sure the correct email and password have been entered');
            }
        } else {
            return new Response(404, 'The required credentials have not been provided');
        }
    }
    *userOnly(token, next) {
        if(token) {
            var user = yield this.isValidToken(token);
            if (!user) {
                this.status = 403;
                this.body = 'Not Authorized';
            } else {
                yield next;
            }
        } else {
            this.status = 403;
            this.body = 'Not authorized';
        }
    }
    *adminOnly(token, next) {
        if(token) {
            var user = yield this.isValidToken(token);
            if (!user) {
                this.status = 403;
                this.body = 'Not Authorized';
            } else if(user.role < 1) {
                // If the user's role is not admin
                this.status = 403;
                this.body = 'Not authorized';
            } else {
                yield next;
            }
        } else {
            this.status = 403;
            this.body = 'Not authorized';
        }
    }
    *currentUserOnly(token, requestedUserId, next) {
        if(token) {
            var user = yield this.isValidToken(token);
            if (!user) {
                this.status = 403;
                this.body = 'Not Authorized';
            } else if(user._id != requestedUserId && user.role < 1) {
                // If the user's role is not admin and the user required a different ID
                this.status = 403;
                this.body = 'Not authorized';
            } else {
                yield next;
            }
        } else {
            this.status = 403;
            this.body = 'Not authorized';
        }
    }
    *isValidToken(token) {
        var decryptedToken = '';
        try {
            decryptedToken = jwt.verify(token, config.getSecret());
        } catch(e) {
            return false;
        }
        var user = yield users.findOne({ _id: decryptedToken.id }, { sort: {}, fields: {
            password: 0,
            salt: 0
        } });
        return user || false;
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new AuthController();
        }
        return this.instance;
    }
}

module.exports = AuthController.getInstance();
