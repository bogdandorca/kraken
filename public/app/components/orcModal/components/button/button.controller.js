class ButtonController {
    constructor($omd) {
        this._modalService = $omd;
    }

    openModal() {
        this._modalService.openModal(this.modalName);
    }
}

ButtonController.$inject = [ '$omd' ];

export default ButtonController;