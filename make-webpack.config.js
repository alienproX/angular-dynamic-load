'use strict';

var path = require('path');
var fs = require('fs');

var webpack = require('webpack');
var _ = require('lodash');
var moment = require('moment');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var srcDir = path.resolve(process.cwd(), 'src');
var assets = path.resolve(process.cwd(), 'dist');
var sourceMap = require('./src/sourcemap.json');

var excludeFromStats = [
  /node_modules[\\\/]/
];
var now = moment().format('YYYYMMDDHH');


function makeConf(options) {
  options = options || {};

  var debug = options.debug !== undefined ? options.debug : true;
  var entries = genEntries();
  var chunks = Object.keys(entries);
  var config = {
    entry: entries,

    output: {
      // 在debug模式下，__build目录是虚拟的，webpack的dev server存储在内存里
      path: path.resolve(debug ? '__build' : assets),
      filename: debug ? '[name].js' : 'resources/js/' + now + '-[chunkhash:8].[name].min.js',
      chunkFilename: debug ? '' +
        '[chunkhash:8].chunk.js' : 'resources/js/[chunkhash:8].chunk.min.js',
      hotUpdateChunkFilename: debug ? '[id].[chunkhash:8].js' : 'resources/js/[id].[chunkhash:8].min.js',
      publicPath: debug ? '/__build/' : '/' /*todo*/
    },

    resolve: {
      root: [srcDir, './node_modules'],
      alias: sourceMap,
      extensions: ['', '.js', '.css', '.scss', '.tpl', '.png', '.jpg']
    },

    resolveLoader: {
      root: path.join(__dirname, 'node_modules')
    },

    module: {
      loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader?presets[]=es2015'
    }]
    },

    plugins: [
      new CommonsChunkPlugin({
        name: 'vendors',
        chunks: chunks,
        minChunks: chunks.length // 提取所有chunks共同依赖的模块
      })
    ],

    devServer: {
      hot: true,
      inline: true,
      stats: {
        cached: false,
        exclude: excludeFromStats,
        colors: true
      }
    }
  };

  if(debug) {
    // 开发阶段，css直接内嵌
    var cssLoader = {
      test: /\.css$/,
      loader: 'style!css'
    };
    var sassLoader = {
      test: /\.scss$/,
      loader: 'style!css!sass'
    };

    config.module.loaders.push(cssLoader);
    config.module.loaders.push(sassLoader);
  }
  else {
    // 编译阶段，css分离出来单独引入
    var cssLoader = {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style', 'css?minimize') // enable minimize
    };
    var sassLoader = {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract( 'style-loader', 'css-loader!sass-loader' )
    };

    config.module.loaders.push(cssLoader);
    config.module.loaders.push(sassLoader);

    var pages = fs.readdirSync(srcDir + '/');

    pages.forEach(function(filename) {
      var m = filename.match(/(.+)\.html$/);

      if(m) {
        // @see https://github.com/kangax/html-minifier
        var conf = {
          template: path.resolve(srcDir + '/', filename),
          filename: './' + filename
        };

        if(m[1] in config.entry) {
          conf.inject = 'body';
          if(filename === 'v2.html') {
            conf.chunks = ['vendors', m[1]];
          }
          else {
            conf.chunks = ['vendors', m[1]];
          }

        }
        config.plugins.push(new HtmlWebpackPlugin(conf));
      }
    });

    config.plugins.push(
      new ExtractTextPlugin('resources/css/' + now + '-[contenthash:8].[name].min.css', {
        allChunks: false
      })
    );



    config.plugins.push(new UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }));
  }

  return config;
}

function genEntries() {
  var jsDir = path.resolve(srcDir, 'resources/js');
  var names = fs.readdirSync(jsDir);
  var map = {};

  names.forEach(function(name) {
    var m = name.match(/(.+)\.js$/);
    var entry = m ? m[1] : '';
    var entryPath = entry ? path.resolve(jsDir, name) : '';

    if(entry) map[entry] = entryPath;
  });

  return map;
}

module.exports = makeConf;
