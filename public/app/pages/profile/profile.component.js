import controller from './profile.controller';
import template from './profile.template.html!text';

class ProfileComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new ProfileComponent();
