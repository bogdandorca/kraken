var config = function($routeProvider) {
    $routeProvider
        .when('/', {
            template: '<home-page></home-page>'
        })
        // TODO: remove this
        .when('/categories', {
            template: '<categories-page></categories-page>'
        })
        .when('/search', {
            template: '<search-page></search-page>'
        })
        .when('/add', {
            template: '<add-page></add-page>'
        })
        .when('/activate/:token', {
            template: '<activation-page></activation-page>'
        })
        .when('/profile', {
            template: '<profile-page></profile-page>'
        })
        .otherwise({
            redirectTo: '/'
        });
};

export default config;