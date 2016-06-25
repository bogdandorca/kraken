class LoginController {
    constructor($mdSidenav) {
        this._mdSidenav = $mdSidenav;
    }

    login() {
        this.closeSidebar();
    }
    closeSidebar() {
        this._mdSidenav('login').toggle();
    }
}

LoginController.$inject = [ '$mdSidenav' ];

export default LoginController;
