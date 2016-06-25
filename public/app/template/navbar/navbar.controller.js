class NavbarController {
    constructor($mdSidenav) {
        this._mdSidenav = $mdSidenav;
    }
    openSidebar(module) {
        if(module === 'login') {
            this._mdSidenav('register').close();
        } else {
            this._mdSidenav('login').close();
        }
        this._mdSidenav(module).toggle();
    }
}

NavbarController.$inject = [ '$mdSidenav' ];

export default NavbarController;
