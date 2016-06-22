import controller from './register.controller';
import template from './register.template.html!text';

class RegisterComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new RegisterComponent();