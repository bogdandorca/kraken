import controller from './modal.controller';
import template from './modal.template.html!text';
import './modal.style.css!css';

class ModalComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
        this.bindings = {
            title: '@',
            state: '='
        };
    }
}

export default new ModalComponent();