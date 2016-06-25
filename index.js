require('colors');
var serve = require('koa-static');
var mount = require('koa-mount');

var app = require('koa')();
module.exports = app;

var config = require('./server/conf/config');

// User
var userModule = require('./server/user/app');
app.use(mount('/api/users', userModule));

app.use(serve('./public'));

app.listen(config.getPort(), function () {
    console.log(`Server listening on port ${config.getPort()}`.green);
});