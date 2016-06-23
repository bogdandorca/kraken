class RegisterController {
    constructor($omd) {
        this._orcModal = $omd;
        this.user = {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            passwordConfirmation: ''
        };
    }

    closeModal() {
        this._orcModal.closeModal('register');
    }
    register() {
        // TODO: Angular validation
        console.log(this.user);
    }
}

RegisterController.$inject = [ '$omd' ];

export default RegisterController;