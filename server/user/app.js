var app = require('koa')();
var router = require('koa-router')();
var parse = require('co-body');
var UserController = require('./user.controller');
var AuthInterface = require('../auth/auth.interface');

router
    .get('/:id', AuthInterface.currentUserOnly, function *() {
        var response = yield UserController.getUser(this.params.id, false);
        this.status = response.code;
        this.body = response.content;
    })
    .get('/current', AuthInterface.userOnly, function*() {
        var token = this.cookies.get('kcie');
        var response = yield UserController.getCurrentUser(token);
        this.status = response.code;
        this.body = response.content;
    })
    .get('/', AuthInterface.adminOnly, function *() {
        var response = yield UserController.getUsers();
        this.status = response.code;
        this.body = response.content;
    })
    .post('/', function *() {
        var user = yield parse(this);
        var response = yield UserController.createUser(user);
        this.status = response.code;
        this.body = response.content;
    })
    .post('/activate/:token', function *() {
        var response = yield UserController.activateAccount(this.params.token);
        var token = AuthInterface.getToken(response.content._id);
        this.cookies.set('kcie', token, {
            httpOnly: false
        });
        this.status = response.code;
        this.body = response.content;
    })
    .put('/:id', AuthInterface.currentUserOnly, function *() {
        // Make sure the user ID matches the current user's id
        var user = yield parse(this);
        user._id = this.params.id;

        var response = yield UserController.updateUser(user);
        this.status = response.code;
        this.body = response.content;
    })
    .delete('/:id', AuthInterface.currentUserOnly, function *() {
        var response = yield UserController.removeUser(this.params.id);
        this.status = response.code;
        this.body = response.content;
    });

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;