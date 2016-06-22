class RegisterController {
    constructor() {
        this.user = {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            passwordConfirmation: ''
        };
    }

    register() {
        // TODO: Angular validation
        console.log(this.user);
    }
}

export default RegisterController;