import controller from './ingredients.controller';
import template from './ingredients.template.html!text';

class IngredientsComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new IngredientsComponent();
