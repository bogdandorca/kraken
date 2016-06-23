import controller from './login.controller';
import template from './login.template.html!text';

class LoginComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new LoginComponent();