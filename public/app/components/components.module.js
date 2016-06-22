/*
 * Angular modules for components like 'inputComponent', 'registerComponent'
 */

import inputComponent from './input/input.component';
import registerComponent from './register/register.component';
import modalComponent from './modal/modal.component';

export default angular.module('components', [])
    .component('inputComponent', inputComponent)
    .component('registerComponent', registerComponent)
    .component('modalComponent', modalComponent);