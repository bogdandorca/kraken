import controller from './menu.controller';
import template from './menu.template.html!text';
import './menu.style.css!css';

class MenuComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new MenuComponent();
