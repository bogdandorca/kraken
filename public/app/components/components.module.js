/*
 * Angular modules for components
 */

import menuComponent from './menu/menu.component';

export default angular.module('components', [])
    .component('menu', menuComponent);