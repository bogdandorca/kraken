import controller from './input.controller';
import template from './input.template.html!text';
import './input.style.css!css';

/*
 * Overview: The InputComponent provides a standardized input throughout the application
 * @property: 'name' - The name used for the name of the input, will also be used as an ID
 * @property: 'type' - The type of the input
 * @property: 'title' - The label attributed to the input
 */

class InputComponent {
    constructor() {
        this.controller = controller;
        this.controllerAs = '$ctrl';
        this.bindings = {
            name: '@',
            type: '@',
            title: '@',
            model: '='
        };
        this.template = template;
    }
}

export default new InputComponent();