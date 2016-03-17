import {Component} from 'angular2/core';

@Component({
    selector: 'kr-username',
    templateUrl: './app/modules/username/username.html'
})

export class UsernameComponent {
    user: string;
    color: string;
    constructor() {
        this.color = '#565656';
        this.user = 'asd';
    }

    checkIt() {
        alert(this.user);
    }
}