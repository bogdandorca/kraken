import controller from './userMenu.controller';
import template from './userMenu.template.html!text';
import './userMenu.style.css!css';

class UserMenuComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new UserMenuComponent();
