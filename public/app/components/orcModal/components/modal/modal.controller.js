class ModalController {
    constructor($omd) {
        this._modalService = $omd;

        // Register new modal upon creation
        this._modalService.registerModal(this.name);
    }

    getState() {
        return this._modalService.getState(this.name);
    }
    closeModal() {
        this._modalService.closeModal(this.name);
    }
}

ModalController.$inject = [ '$omd' ];

export default ModalController;