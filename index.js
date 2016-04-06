require('colors');
var serve = require('koa-static');

var app = require('koa')();
module.exports = app;

var config = require('./server/conf/config');

app.use(serve('./public'));

app.listen(config.getPort(), function () {
    console.log(`Server listening on port ${config.getPort()}`.green);
});