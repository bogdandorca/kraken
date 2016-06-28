import Ingredient from '../ingredient/ingredient.model';

class IngredientsController {
    constructor() {
        this.ingredients = [
            new Ingredient()
        ];
    }

    addIngredient() {
        this.ingredients.push(new Ingredient());
    }
    removeIngredient(index) {
        // TODO: make this work
        this.ingredients.splice(index, 1);
    }
}

export default IngredientsController;
