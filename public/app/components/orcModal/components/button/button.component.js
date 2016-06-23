import controller from './button.controller';
import template from './button.template.html!text';

/*
 * @property: 'class' - The class that the button will have
 * @property: 'title' - The name of the button
 * @property: 'type' - The type of the control (button/a)
 * @property: 'modal-name' - The name of the modal that the button will open
 */

class ButtonComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
        this.bindings = {
            class: '@',
            title: '@',
            type: '@',
            modalName: '@'
        }
    }
}

export default new ButtonComponent();