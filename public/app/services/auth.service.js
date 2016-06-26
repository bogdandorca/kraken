class AuthService {
    constructor($http, $cookies, $timeout) {
        this._http = $http;
        this._cookies = $cookies;
        this._timeout = $timeout;

        this.cookieName = 'ckie';

        this.getCookieData();
    }
    login(credentials) {
        return this._http.post('/api/auth/login', credentials);
    }
    logout() {
        this.user = null;
        this._cookies.remove(this.cookieName);
    }
    getCookieData() {
        // TODO: Remove this
        this._timeout(() => {
            var userToken = this._cookies.get(this.cookieName);

            if(userToken) {
                this.setUserData();
            } else {
                this.user = null;
            }
        }, 0);
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
}

AuthService.$inject = [ '$http', '$cookies', '$timeout' ];

export default AuthService;
