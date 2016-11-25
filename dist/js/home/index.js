import $$ from 'Utils';

App.lazy.controller('HomeController', ['$scope','$location', ($scope, $location) => {

  $$.setDocTitle('Home Page');

  $scope.toDemo = () =>{
    $location.path('demo')
  }


}]);
