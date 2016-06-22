import template from './header.template.html!text';
import './header.style.css!css';

class HeaderComponent {
    constructor() {
        this.template = template;
        this.controllerAs = '$ctrl';
        this.bindings = {
            title: '@'
        };
    }
}

export default new HeaderComponent();