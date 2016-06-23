class LoginController {
    constructor($omd) {
        this._orcModal = $omd;
    }

    closeModal() {
        this._orcModal.closeModal('login');
    }
}

LoginController.$inject = [ '$omd' ];

export default LoginController;