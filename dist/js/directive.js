function angularDirective(App) {

  App.directive('countDown', [() => {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        
      }
    };
  }]);
}

module.exports = angularDirective;
