var config = function($routeProvider) {
    $routeProvider
        .when('/', {
            template: '<home-page></home-page>'
        })
        .otherwise({
            redirectTo: '/'
        });
};

export default config;