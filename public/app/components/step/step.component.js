import controller from './step.controller';
import template from './step.template.html!text';

class StepComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.controllerAs = '$ctrl';
    }
}

export default new StepComponent();
