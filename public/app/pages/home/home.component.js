import controller from './home.controller';
import template from './home.template.html!text';

class HomeComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new HomeComponent();