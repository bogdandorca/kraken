class RegisterController {
    constructor($mdSidenav, $userService, $toastrService) {
        this._mdSidenav = $mdSidenav;
        this._userService = $userService;
        this._toastrService = $toastrService;

        this.user = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };
        this.passwordConfirmation = '';

    }

    register() {
        // TODO: Validate
        this._userService.createUser(this.user).then(() => {
            this._toastrService.success('You account has successfuly been created');
        }, (error) => {
            this._toastrService.error(error.data);
        });
        this.closeSidebar();
    }
    closeSidebar() {
        this._mdSidenav('register').toggle();
    }
}

RegisterController.$inject = [ '$mdSidenav', '$userService', '$toastrService' ];

export default RegisterController;
