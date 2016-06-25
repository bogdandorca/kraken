var emailService = require('./email.service');

class EmailInterface {
    static activateAccount(name, email, token) {
        return emailService.activateAccount(name, email, token);
    }
}

module.exports = EmailInterface;
