var nodemailer = require('nodemailer');
var MailModel = require('./email.model');
var co = require('co');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport('smtps://mycookbook12%40gmail.com:testpass@smtp.gmail.com');
        this.mailOptions = {
            from: '"My CookBook" <mycookbook12@gmail.com>'
        }
    }

    activateAccount(user) {
        // TODO: Change this before going live - put something in the config?
        var mailMessage = `<p>Hi, ${user.firstName} ${user.lastName}! <br/> In order to activate your account, please access <a href="http://localhost:4565/#/activate/${user.active}">this link</a></p>`;
        var mailOptions = new MailModel(user.email, 'One more step', mailMessage);

        this.sendMail(mailOptions);
    }

    sendMail(options) {
        this.transporter.sendMail(options, function(error) {
            return error;
        });
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new EmailService();
        }
        return this.instance;
    }
}

module.exports = EmailService.getInstance();
