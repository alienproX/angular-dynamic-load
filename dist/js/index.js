'use strict';

import angular from 'angular';
import ngRoute from 'angular-route';
import $$ from 'Utils';

import FastClick from 'fastclick';
FastClick.attach(document.body);

angular.support = (attr) => attr in window;

require('Progress')(angular);

const App = angular.module('Cattla', ['ngRoute', 'ngProgress']);

window.App = App;

require('Filter')(App);
require('Factory')(App);
require('Directive')(App);

App.config(['$routeProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$locationProvider', ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $locationProvider) => {

  //$locationProvider.html5Mode(true)
    $locationProvider.hashPrefix('!');

  App.lazy = {
    controller: $controllerProvider.register,
    directive: $compileProvider.directive,
    filter: $filterProvider.register,
    factory: $provide.factory,
    service: $provide.service
  };

  $routeProvider
    .when('/demo', {
      templateUrl: 'views/demo/index.html',
      controller: 'DemoController',
      resolve: {
        load: ['$q', '$timeout', ($q, $timeout) => {
          let deferred = $q.defer();
          require(['./demo/index.js'], () => {
            $timeout(() => {
              deferred.resolve();
            });
          });
          return deferred.promise;
        }]
      }
    })
    .when('/', {
      templateUrl: 'views/home/index.html',
      controller: 'HomeController',
      resolve: {
        load: ['$q', '$timeout', ($q, $timeout) => {
          let deferred = $q.defer();
          require(['./home/index.js'], () => {
            $timeout(() => {
              deferred.resolve();
            });
          });
          return deferred.promise;
        }]
      }
    })
    .otherwise({
      redirectTo: '/'
    });
}]);


App.controller('MainController', ['$scope', 'ngProgressFactory', 'Ele', '$timeout', ($scope, ngProgressFactory, Ele, $timeout) => {

  $scope.progressbar = ngProgressFactory.createInstance();

  $scope.$on('$routeChangeStart', () => {
    $timeout(() => {
      $scope.vewiAble = false;
      $scope.progressbar.start();
    })
    Ele('.mainLoading').show();
  });

  $scope.$on('$viewContentLoaded', () => {
    Ele('.mainLoading').hide();
    $timeout(() => {
      $scope.vewiAble = true;
      $scope.progressbar.complete();
    })
  });

}]);
