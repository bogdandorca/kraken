import controller from './category.controller';
import template from './category.template.html!text';

class CategoryComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new CategoryComponent();