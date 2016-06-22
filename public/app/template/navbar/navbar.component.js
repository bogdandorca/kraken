import controller from './navbar.controller';
import template from './navbar.template.html!text';

class NavbarComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new NavbarComponent();