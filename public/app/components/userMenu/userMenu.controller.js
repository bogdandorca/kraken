class UserMenuController {
    constructor($authService, $mdSidenav, $location) {
        this._authService = $authService;
        this._mdSidenav = $mdSidenav;
        this._location = $location;
    }

    logout() {
        this._authService.logout();
        this.closeModal();
    }
    goTo(page) {
        this._location.path(`/${page}`);
        this.closeModal();
    }
    closeModal() {
        this._mdSidenav('userMenu').close();
    }
}

UserMenuController.$inject = [ '$authService', '$mdSidenav', '$location' ];

export default UserMenuController;