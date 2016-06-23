/*
 * Angular modules for components like 'inputComponent', 'registerComponent'
 */

// Component Modules
import orcModal from './orcModal/modal.module';

// Components
import inputComponent from './input/input.component';
import registerComponent from './register/register.component';
import loginComponent from './login/login.component';

export default angular.module('components', [ orcModal.name ])
    .component('inputComponent', inputComponent)
    .component('registerComponent', registerComponent)
    .component('loginComponent', loginComponent);