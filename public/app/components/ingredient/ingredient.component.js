import controller from './ingredient.controller';
import template from './ingredient.template.html!text';

class IngredientComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new IngredientComponent();
