'use strict';

var gulp = require('gulp');
var fs = require('fs');
var webpack = require('webpack');

var gutil = require('gulp-util');
var copy = require('gulp-contrib-copy');
var rename = require("gulp-rename");
var sass = require('gulp-sass');

var webpackConf = require('./webpack.config');
var webpackDevConf = require('./webpack-dev.config');
var moment = require('moment');
var now = moment().format('YYYYMMDDHH');
var nowDetail = moment().format('YYYYMMDDHHmmss');


var src = process.cwd() + '/src';
var assets = process.cwd() + '/dist';

var revReplace = require('gulp-rev-replace'),
  useref = require('gulp-useref'),
  rev = require('gulp-rev'),
  minifycss = require('gulp-minify-css'),
  gulpif = require('gulp-if');

var replace = require('gulp-replace');


// js check
gulp.task('hint', function() {
  var jshint = require('gulp-jshint');
  var stylish = require('jshint-stylish');

  return gulp.src([
      src + '/resources/js/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// clean assets
gulp.task('clean', ['hint'], function() {
  var clean = require('gulp-clean');

  return gulp.src([
    assets + '/'
  ], {
    read: true
  }).pipe(clean());
});


// run webpack pack
gulp.task('pack', ['clean'], function(done) {
  webpack(webpackConf, function(err, stats) {
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      colors: true
    }));
    done();
  });

});


gulp.task('copyCSS', ['pack'], function() {
  return gulp
    .src(src + '/css/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest(assets + '/css/'))
});

gulp.task('copyImages', ['copyCSS'], function() {
  return gulp
    .src(src + '/images/**/*')
    .pipe(copy())
    .pipe(gulp.dest(assets + '/images/'))
});

gulp.task('copyViews', ['copyImages'], function() {
  return gulp
    .src(src + '/views/**/*')
    .pipe(copy())
    .pipe(gulp.dest(assets + '/views/'))
});

gulp.task('copyJs', ['copyViews'], function() {
  return gulp
    .src(src + '/js/**/*')
    .pipe(copy())
    .pipe(gulp.dest(assets + '/js/'))
});

gulp.task('editCssPath', ['copyJs'], function() {
  return gulp
    .src(assets + '/views/**/*.html')
    .pipe(replace(/href="\/css\//g, 'href="/css/'))
    .pipe(replace(/.scss/g, '.css'))
    .pipe(gulp.dest(assets + '/views/'));

});

gulp.task('moveDistCss', ['editCssPath'], function() {
  return gulp
    .src(assets + '/views/**/*.html')
    .pipe(replace(/<link id="CACHE_CSS".*\/>/g, function(m, filename) {
      var cssPath = m.replace('<link id="CACHE_CSS" href="', '').replace(/" rel="stylesheet"\/>/g, '');
      var style = fs.readFileSync(assets + cssPath, 'utf8');
      return '<style type="text/css">\n' + style + '</style>';
    }))
    .pipe(gulp.dest(assets + '/views/'));
});


// html process
gulp.task('default', ['moveDistCss'], function() {
  var htmlmin = require('gulp-htmlmin');

  return gulp
    .src(assets + '/index.html')
    .pipe(replace(/<script(.+)?data-debug([^>]+)?><\/script>/g, ''))

  .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(replace(/##version##/g, nowDetail))
    .pipe(gulp.dest(assets + '/'));

});



// deploy assets to remote server
gulp.task('deploy', function() {
  var sftp = require('gulp-sftp');

  return gulp.src(assets + '/resources')
    .pipe(sftp({
      host: '[remote server ip]',
      remotePath: '/www/app/',
      user: 'foo',
      pass: 'bar'
    }));
});

// run HMR on `cli` mode
// @see http://webpack.github.io/docs/webpack-dev-server.html
gulp.task('hmr', function(done) {
  var WebpackDevServer = require('webpack-dev-server');
  var compiler = webpack(webpackDevConf);
  var devSvr = new WebpackDevServer(compiler, {
    contentBase: webpackConf.output.path,
    publicPath: webpackDevConf.output.publicPath,
    hot: true,
    stats: webpackDevConf.devServer.stats
  });

  devSvr.listen(3006, '0.0.0.0', function(err) {
    if(err) throw new gutil.PluginError('webpack-dev-server', err);

    gutil.log('[webpack-dev-server]',
      'http://localhost:8088/webpack-dev-server/index.html');

    // keep the devSvr alive
    done();
  });
});
