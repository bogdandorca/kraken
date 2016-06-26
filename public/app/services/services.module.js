import userService from './user.service';
import toastrService from './toastr.service';
import authService from './auth.service';

export default angular.module('services', [])
    .service('$userService', userService)
    .service('$toastrService', toastrService)
    .service('$authService', authService);