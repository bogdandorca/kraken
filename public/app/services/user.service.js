class UserService {
    constructor($http) {
        this._http = $http;
    }
    getUser(id) {

    }
    getUsers() {

    }
    createUser(user) {
        return this._http.post('/api/users', user);
    }
    activateAccount(token) {
        return this._http.post(`/api/users/activate/${token}`);
    }
    updateUser() {

    }
    deleteUser() {

    }
}

UserService.$inject = [ '$http' ];

export default UserService;