/*
 * Angular module for page components like 'register', 'login'
 */

import registerPage from './register/register.component';

export default angular.module('pages', [])
    .component('registerPage', registerPage);