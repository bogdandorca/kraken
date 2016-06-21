import angular from 'angular';
import ngRoute from 'angular-route';
import routes from './routes';

// Pages
import registerPage from './pages/register/register.component';

// Components
import inputComponent from './components/input/input.component';
import registerComponent from './components/register/register.component';

export default angular.module('app', [ 'ngRoute' ])
    .component('inputComponent', inputComponent)
    .component('registerComponent', registerComponent)
    .component('registerPage', registerPage)
    .config(routes);