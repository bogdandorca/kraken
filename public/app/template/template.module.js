/*
 * Angular module for template components like 'header', 'footer', 'navbar'
 */

// Components
import navbarComponent from './navbar/navbar.component';
import loginComponent from './login/login.component';
import registerComponent from './register/register.component';

export default angular.module('templateComponents', [])
    .component('navbar', navbarComponent)
    .component('login', loginComponent)
    .component('register', registerComponent);