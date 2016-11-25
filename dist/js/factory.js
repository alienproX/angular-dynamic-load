function angularFactory(App) {

  angular.element.prototype.show = function() {
    this.removeClass('_hide').addClass('_show');
  }
  angular.element.prototype.hide = function() {
    this.removeClass('_show').addClass('_hide');
  }

  App.factory('Ele', [() => {
    return(ele, all) => angular.element(ele = all ? document.querySelectorAll(ele) : document.querySelector(ele));
  }]);

  App.factory('$_notify', [() => {
    return(text) => alert(text)
  }]);

  App.factory('Ajax', ['$http', ($http) => {
    return(method = 'get') => {
      let METHOD = method.toUpperCase();
      return(url, data, resolve, reject, config) => {
        let errorFn = (data) => {
          alert(data)
        }
        reject = reject || errorFn;
        let params = {
          method: METHOD,
          url: url,
          config: config
        }
        if(METHOD === 'GET') params.params = data;
        if(METHOD === 'POST') params.data = data;
        $http(params).then((json) => {
          if(json.data.status === 100) {
            resolve(json.data.result)
          }
          else {
            reject(json.data)
          }

        }, (json) => {
        });
      }
    }
  }]);

}

module.exports = angularFactory;
