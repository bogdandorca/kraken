var AuthController = require('./auth.controller');

class AuthInterface {

    // Check if the token is valid, it contains a valid userId and is not expired
    *isValidToken(token) {
        return yield AuthController.isValidToken(token);
    }
    // Used as middleware in order to check if any user is logged in
    *userOnly(next) {
        var token = this.cookies.get('kcie');
        yield AuthController.userOnly(token, next);
    }
    // Used as a middleware, checks if the user is an administrator
    *adminOnly(next) {
        var token = this.cookies.get('kcie');
        yield AuthController.adminOnly(token, next);
    }
    // Checks if the user is requesting data for his own account or if he's an admin
    *currentUserOnly(next) {
        var token = this.cookies.get('kcie');
        var requestedUserId = this.params.id;
        yield AuthController.currentUserOnly(token, requestedUserId, next);
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new AuthInterface();
        }
        return this.instance;
    }
}

module.exports = AuthInterface.getInstance();
