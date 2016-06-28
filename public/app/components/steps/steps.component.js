import controller from './steps.controller';
import template from './steps.template.html!text';

class StepsComponent {
    constructor() {
        this.template = template;
        this.controller = controller;
        this.conrtollerAs = '$ctrl';
    }
}

export default new StepsComponent();
