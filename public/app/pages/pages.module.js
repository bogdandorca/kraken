/*
 * Angular module for page components like 'register', 'login'
 */

import homePage from './home/home.component';
import activationPage from './activation/activation.component';

export default angular.module('pages', [])
    .component('homePage', homePage)
    .component('activationPage', activationPage);