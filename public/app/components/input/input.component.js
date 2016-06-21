import controller from './input.controller';
import template from './input.template.html!text';

class InputComponent {
    constructor() {
        this.controller = controller;
        this.controllerAs = '$ctrl';
        this.bindings = {
            bdName: '=',
            type: '='
        };
        this.template = template;
    }
}

export default new InputComponent();