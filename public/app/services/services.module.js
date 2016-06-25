import userService from './user.service';
import toastrService from './toastr.service';

export default angular.module('services', [])
    .service('$userService', userService)
    .service('$toastrService', toastrService);