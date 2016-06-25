class EmailModel {
    constructor(to, subject, message) {
        this.from = '"My CookBook" <mycookbook12@gmail.com>';
        this.to = to;
        this.subject = subject;
        this.html = message;
    }
}

module.exports = EmailModel;
