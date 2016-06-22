/*
 * Angular module for template components like 'header', 'footer', 'navbar'
 */

// Components
import navbarComponent from './navbar/navbar.component';

export default angular.module('templateComponents', [])
    .component('navbarComponent', navbarComponent);