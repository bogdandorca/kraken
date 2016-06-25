var UserController = require('./user.controller');

class UserInterface {
    constructor() {

    }
    *getUser(id, showPasswordAndSalt) {
        return yield UserController.getUser(id, showPasswordAndSalt);
    }
    *getAllUsers() {
        return yield UserController.getUsers();
    }
}