import controller from './modal.controller';
import template from './modal.template.html!text';

// TODO: Usage documentation for the Component

/*
 * @property: 'title' - The title that will appear in the header of the modal
 * @content: The content of the module tag will be set inside it's body
 */

class ModalComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
        this.transclude = true;
        this.bindings = {
            name: '@',
            title: '@'
        };
    }
}

export default new ModalComponent();