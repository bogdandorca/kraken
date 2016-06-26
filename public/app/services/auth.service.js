class AuthService {
    constructor($http, $cookies) {
        this._http = $http;
        this._cookies = $cookies;

        this.cookieName = 'ckie';
        this.setUserData();
        this.user = null;
    }
    login(credentials) {
        return this._http.post('/api/auth/login', credentials);
    }
    logout() {
        this._http.post('/api/auth/logout').then(() => {
            this.user = null;
        });
    }
    setUserData() {
        this._http.get('/api/users/current')
            .then((result) => {
                this.user = result.data;
            }, (errors) => {
                this._cookies.remove(this.cookieName);
            });
    }
    getCurrentUser() {
        return this.user;
    }
    isLoggedIn() {
        return !!this.user;
    }
}

AuthService.$inject = [ '$http', '$cookies' ];

export default AuthService;
