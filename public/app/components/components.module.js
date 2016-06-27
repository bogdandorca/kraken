/*
 * Angular modules for components
 */

import menuComponent from './menu/menu.component';
import userMenuComponent from './userMenu/userMenu.component';

export default angular.module('components', [])
    .component('menu', menuComponent)
    .component('userMenu', userMenuComponent);