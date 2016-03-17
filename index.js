require('colors');
var serve = require('koa-static');

var app = require('koa')();
module.exports = app;



app.use(serve('./public'));

app.listen(4565, function () {
    console.log('Server listening on port 4565'.green);
});