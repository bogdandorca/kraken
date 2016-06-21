var config = function($routeProvider) {
    $routeProvider
        .when('/', {
            template: '<register-page></register-page>'
        })
        .otherwise({
            redirectTo: '/'
        });
};

export default config;