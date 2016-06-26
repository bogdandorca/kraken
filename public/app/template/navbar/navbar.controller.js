class NavbarController {
    constructor($mdSidenav, $authService) {
        this._mdSidenav = $mdSidenav;
        this._authService = $authService;

        this.user = null;
    }
    setUser() {
        this.user = this._authService.getCurrentUser();
    }
    isLoggedIn() {
        return this._authService.getCurrentUser();
    }
    logOut() {
        this._authService.logout();
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

NavbarController.$inject = [ '$mdSidenav', '$authService' ];

export default NavbarController;
