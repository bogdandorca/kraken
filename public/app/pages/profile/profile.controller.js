class ProfileController {
    constructor($authService, $location) {
        this._authService = $authService;
        this._location = $location;

        this.setCurrentUser();
    }

    setCurrentUser() {
        this.user = this._authService.getCurrentUser();
        if(!this.user) {
            this._location.path('/');
        }
    }
}

ProfileController.$inject = [ '$authService', '$location' ];

export default ProfileController;
