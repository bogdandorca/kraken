class ActivationController {
    constructor($routeParams, $location, $userService, $authService, $toastrService) {
        this._routeParams = $routeParams;
        this._location = $location;
        this._userService = $userService;
        this._authService = $authService;
        this._toastrService = $toastrService;

        this.completed = false;
        this.noError = true;

        this.token = this._routeParams.token;
        this.activateAccount();
    }
    
    activateAccount() {
        this._userService.activateAccount(this.token)
            .then(() => {
                this.completed = true;
                this._authService.setUserData();
                this._toastrService.success('Your account has been activated!');
                this._location.path('/');

            }, (err) => {
                this.completed = true;
                this.noError = false;
            });
    }
}

ActivationController.$inject = [ '$routeParams', '$location', '$userService', '$authService', '$toastrService' ];

export default ActivationController;