/*
 * Angular module for page components like 'register', 'login'
 */

import homePage from './home/home.component';

export default angular.module('pages', [])
    .component('homePage', homePage);