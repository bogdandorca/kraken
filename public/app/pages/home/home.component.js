import template from './home.template.html!text';

class HomeComponent {
    constructor() {
        this.template = template;
    }
}

export default new HomeComponent();