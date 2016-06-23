import modalComponent from './components/modal/modal.component';
import buttonComponent from './components/button/button.component';
import modalService from './service/modal.service';
import './style/modal.style.css!css';

export default angular.module('omd', [])
    .component('omd', modalComponent)
    .component('omdControl', buttonComponent)
    .service('$omd', modalService);