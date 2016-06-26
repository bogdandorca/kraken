var app = require('koa')();
var router = require('koa-router')();
var parse = require('co-body');
var UserController = require('./user.controller');

router
    .get('/:id', function *() {
        var response = yield UserController.getUser(this.params.id, false);
        this.status = response.code;
        this.body = response.content;
    })
    .get('/current', function*() {
        var token = this.cookies.get('kcie');
        var response = yield UserController.getCurrentUser(token);
        this.status = response.code;
        this.body = response.content;
    })
    .get('/', function *() {
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
        this.status = response.code;
        this.body = response.content;
    })
    .put('/', function *() {
        var user = yield parse(this);
        var response = yield UserController.updateUser(user);
        this.status = response.code;
        this.body = response.content;
    })
    .delete('/:id', function *() {
        var response = yield UserController.removeUser(this.params.id);
        this.status = response.code;
        this.body = response.content;
    });

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;