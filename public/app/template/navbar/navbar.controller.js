class NavbarController {
    constructor($omd) {
        this._modalService = $omd;
    }

    openModal(name) {
        this._modalService.openModal(name);
    }
}

NavbarController.$inject = [ '$omd' ];

export default NavbarController;