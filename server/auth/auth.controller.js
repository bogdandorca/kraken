var config = require('../conf/config');
var db = require('monk')(config.getDatabaseString());
var wrap = require('co-monk');
var users = wrap(db.get('users'));
var Response = require('../response/response');
var crypto = require('crypto');
var jwt = require('jwt-simple');

class AuthController {

    *login(credentials) {
        if(credentials.email && credentials.password) {
            var user = yield users.findOne({ email: credentials.email });
            if(user) {
                if(user.active === true) {
                    var encryptedPassword = crypto.pbkdf2Sync(credentials.password, user.salt, 10000, 64).toString('base64');
                    if(encryptedPassword === user.password) {
                        // TODO: Make token expire
                        return jwt.encode(user._id, config.getSecret());
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

    static getInstance() {
        if(!this.instance) {
            this.instance = new AuthController();
        }
        return this.instance;
    }
}

module.exports = AuthController.getInstance();
