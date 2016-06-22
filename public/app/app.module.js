/*
 * Main module that integrates all the libraries and the adjacent modules
 */

// Angular libraries
import angular from 'angular';
import ngRoute from 'angular-route';
import routes from './routes';

// Modules
import templateComponents from './template/template.module';
import components from './components/components.module';
import pages from './pages/pages.module';

export default angular.module('app', [
    'ngRoute',
    templateComponents.name,
    components.name,
    pages.name ])
    .config(routes);