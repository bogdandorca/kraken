require('colors');

var app = require('koa')();
module.exports = app;

app.listen(4565, function () {
    console.log('Server listening on port 4565'.green);
});