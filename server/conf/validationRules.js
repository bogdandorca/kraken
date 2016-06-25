class Rules {
    constructor() {
        this.name = "required|min:2|max:50";
        this.password = "required|min:6|max:100";
        this.email = "required|email";
        this.id = "required";
    }
}

module.exports = new Rules();
