var config = function($routeProvider) {
    $routeProvider
        .when('/', {
            template: '<home-page></home-page>'
        })
        .when('/activate/:token', {
            template: '<activation-page></activation-page>'
        })
        .otherwise({
            redirectTo: '/'
        });
};

export default config;