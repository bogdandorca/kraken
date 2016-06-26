var config = require('../conf/config');
var db = require('monk')(config.getDatabaseString());
var wrap = require('co-monk');
var users = wrap(db.get('users'));
var co = require('co');
var indicative = require('indicative');
var jwt = require('jwt-simple');

var validationRules = require('../conf/validationRules');
var User = require('./user.model');
var emailService = require('../email/email.interface');
var Response = require('../response/response');

class UserController {
    constructor() {
        this.rulesOnCreation = {
            "firstName": validationRules.name,
            "lastName": validationRules.name,
            "email": validationRules.email,
            "password": validationRules.password
        };
        this.rulesOnUpdate = {
            "firstName": validationRules.name,
            "lastName": validationRules.name,
            "email": validationRules.email,
            "_id": validationRules.id
        };
    }

    *getUser(id, showPasswordAndSalt) {
        return yield users.findOne( { _id: id }, { sort: {}, fields: {
            password: showPasswordAndSalt,
            salt: showPasswordAndSalt
        }});
    }
    *getCurrentUser(token) {
        if(token) {
            var userId = jwt.decode(token, config.getSecret());
            var user = yield this.getUser(userId, false);
            if(user) {
                return new Response(200, user);
            } else {
                return new Response(404, 'The session is not active anymore');
            }
        } else {
            return new Response(403, 'Not authorized');
        }
    }
    *getUsers() {
        return yield users.find( { active: true }, { sort: { lastName: 1 }, fields: {
            password: 0,
            salt: 0
        }});
    }
    *updateUser(userDetails) {
        var isValid = co.wrap(this.isValid);
        var userValidationResult = yield isValid(userDetails, this.rulesOnUpdate);

        if(userValidationResult === true) {
            var userExists = yield this.hasAccount(userDetails.email);
            if (userExists) {
                yield users.updateById( userDetails._id, { $set: {
                    firstName: userDetails.firstName,
                    lastName: userDetails.lastName,
                    email: userDetails.email
                }});
                var user = yield this.getUser(userDetails._id, false);
                return new Response(200, user);
            } else {
                return new Response(404, 'The user does not exist');
            }
        } else {
            return new Response(400, userValidationResult);
        }
    }
    *removeUser(id) {
        var res = yield users.remove( { _id: id } );
        if (res.result.ok === 1 && res.result.n === 1) {
            return new Response(200, 'The user has been successfully deleted');
        } else {
            return new Response(400, 'The account has not been deleted');
        }
    }
    *createUser(userDetails) {
        var isValid = co.wrap(this.isValid);
        var userValidationResult = yield isValid(userDetails, this.rulesOnCreation);

        if(userValidationResult === true) {
            var userExists = yield this.hasAccount(userDetails.email);
            if (!userExists) {
                var user = new User(userDetails);
                yield users.insert(user);

                // Delete the hidden fields
                delete user.password;
                delete user.salt;

                // Send an email to the user to activate his account
                emailService.activateAccount(user);
                return new Response(200, 'The account has been successfully created');
            } else {
                return new Response(409, 'This email address is already in use');
            }
        } else {
            return new Response(400, userValidationResult);
        }
    }
    *activateAccount(token) {
        var user = yield users.findOne({ active: token }, { sort: {}, fields: {
            password: 0,
            salt: 0
        }});
        if(user) {
            yield users.update({ active: token }, { $set: {
                active: true
            }});

            return new Response(200, user);
        } else {
            return new Response(404, 'The token used is invalid');
        }
    }
    *hasAccount(email) {
        return yield users.findOne({ email: email });
    }
    isValid(user, rules) {
        return indicative.validateAll(user, rules)
            .then(function() {
                return true;
            })
            .catch(function(errors) {
                var errorMessage = '';
                errors.forEach((element) => {
                    errorMessage += `${element.message}, \n`;
                });
                return errorMessage;
            });
    }

}

module.exports = new UserController();
