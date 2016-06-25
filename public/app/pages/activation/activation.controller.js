class ActivationController {
    constructor($routeParams, $userService) {
        this._routeParams = $routeParams;
        this._userService = $userService;

        this.completed = false;
        this.noError = true;

        this.token = this._routeParams.token;
        this.activateAccount();
    }
    
    activateAccount() {
        this._userService.activateAccount(this.token)
            .then((response) => {
                this.completed = true;
            }, (err) => {
                this.completed = true;
                this.noError = false;
            });
    }
}

ActivationController.$inject = [ '$routeParams', '$userService' ];

export default ActivationController;