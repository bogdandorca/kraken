/*
 * Angular modules for components
 */

import menuComponent from './menu/menu.component';
import userMenuComponent from './userMenu/userMenu.component';
import ingredientComponent from './ingredient/ingredient.component';
import ingredientsComponent from './ingredients/ingredients.component';
import categoryComponent from './category/category.component';
import stepComponent from './step/step.component';
import stepsComponent from './steps/steps.component';

export default angular.module('components', [])
    .component('menu', menuComponent)
    .component('userMenu', userMenuComponent)
    .component('ingredient', ingredientComponent)
    .component('ingredients', ingredientsComponent)
    .component('category', categoryComponent)
    .component('step', stepComponent)
    .component('steps', stepsComponent);