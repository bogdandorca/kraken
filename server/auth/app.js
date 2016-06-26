var app = require('koa')();
var router = require('koa-router')();
var parse = require('co-body');
var AuthController = require('./auth.controller');

router
    .post('/login', function*() {
        var credentials = yield parse(this);
        var response = yield AuthController.login(credentials);
        if(response.code) {
            this.status = response.code;
            this.body = response.content;
        } else {
            this.cookies.set('kcie', response, {
                httpOnly: false
            });
            this.body = 'You have been successfully logged in';
        }
    })
    .post('/logout', function *() {
        this.cookies.set('kcie', null);
        this.body = 'You have been successfully logged out';
    });

app
    .use(router.routes())
    .use(router.allowedMethods());

module.exports = app;