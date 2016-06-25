import controller from './activation.controller';
import template from './activation.template.html!text';

class ActivationComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new ActivationComponent();
