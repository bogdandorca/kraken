import {Component} from 'angular2/core';

@Component({
    selector: 'kr-vehicle',
    templateUrl: './app/modules/vehicle/vehicle.html'
})

export class VehicleComponent {
    vehicles: Array;
    constructor() {
        this.vehicles = [
            {
                id: 1,
                name: 'Volkswagen'
            },
            {
                id: 2,
                name: 'Citroen'
            },
            {
                id: 3,
                name: 'Peugeot'
            },
            {
                id: 4,
                name: 'Audi'
            }
        ];
    }
}