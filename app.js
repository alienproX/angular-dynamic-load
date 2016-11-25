'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');

var koa = require('koa');
var router = require('koa-router')();
var serve = require('koa-static');
var colors = require('colors');
var open = require('open');
var gzip = require('koa-gzip');
var sass = require('node-sass');

var pkg = require('./package.json');
var env = process.env.NODE_ENV;
var debug = !env || env === 'development';
var viewDir = debug ? 'src' : 'dist';


var app = koa();

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

app.keys = [pkg.name, pkg.description];

app.on('error', function(err, ctx) {
  err.url = err.url || ctx.request.url;
  console.error(err, ctx);
});
// logger
app.use(function*(next) {
  console.log(this.method.info, this.url, this.response.status);
  yield next;
});

router.get(/\.scss$/, function*(next) {
  var result = sass.renderSync({
    file: __dirname + '/src' + this.url
  });
  this.type = 'text/css; charset=utf-8';
  this.response.body = result.css.toString();
});




app.use(router.routes());

app.use(gzip());

if(debug) {
  var webpackDevMiddleware = require('koa-webpack-dev-middleware');
  var webpack = require('webpack');
  var webpackDevConf = require('./webpack-dev.config');

  app.use(webpackDevMiddleware(webpack(webpackDevConf), {
    contentBase: webpackDevConf.output.path,
    publicPath: webpackDevConf.output.publicPath,
    hot: true,
    stats: {
      cached: false,
      colors: true
    }
  }));
}

// handle static files
app.use(serve(path.resolve(__dirname, viewDir), {
  maxage: 0
}));

app = http.createServer(app.callback());


app.listen(1984, '0.0.0.0', function() {
  console.log("😄...let's Rock N' Roll...🍺...🍺");
});
