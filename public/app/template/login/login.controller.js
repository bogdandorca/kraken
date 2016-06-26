class LoginController {
    constructor($mdSidenav, $authService, $toastrService) {
        this._mdSidenav = $mdSidenav;
        this._authService = $authService;
        this._toastrService = $toastrService;

        // TODO: Remove
        this.user = {
            email: 'bogdandorca@gmail.com',
            password: 'testpass'
        };
    }

    login() {
        this._authService.login(this.user)
            .then((response) => {
                this._toastrService.success(response.data);
                this._authService.setUserData();
            }, (error) => {
                this._toastrService.error(error.data);
            });
        this.closeSidebar();
    }
    closeSidebar() {
        this._mdSidenav('login').toggle();
    }
}

LoginController.$inject = [ '$mdSidenav', '$authService', '$toastrService' ];

export default LoginController;
