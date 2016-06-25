/*
 * Main module that integrates all the libraries and the adjacent modules
 */

// Libraries
import 'toastr';

// Angular libraries
import angular from 'angular';
import ngRoute from 'angular-route';
import ngMaterial from 'angular-material';
import routes from './routes';

// Modules
import templateComponents from './template/template.module';
import components from './components/components.module';
import pages from './pages/pages.module';
import services from './services/services.module';

export default angular.module('app', [
    'ngRoute',
    'ngMaterial',
    templateComponents.name,
    components.name,
    pages.name,
    services.name ])
    .config(routes);