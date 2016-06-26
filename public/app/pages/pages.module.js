/*
 * Angular module for page components like 'register', 'login'
 */

import homePage from './home/home.component';
import categoriesPage from './categories/categories.component';
import searchPage from './search/search.component';
import addPage from './add/add.component';
import activationPage from './activation/activation.component';

export default angular.module('pages', [])
    .component('homePage', homePage)
    .component('categoriesPage', categoriesPage)
    .component('searchPage', searchPage)
    .component('addPage', addPage)
    .component('activationPage', activationPage);