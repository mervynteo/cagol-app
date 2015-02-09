angular.module('cagol.services', [])

.service('CagolService', function ($http, ConfigService) {
  var _CAGOL_URL = 'https://cagol-api.herokuapp.com/v0.1/',
      _APP_HASH = '';
  
  this.addBin = function (postData, accessToken, callback) {
    console.dir(postData);
    console.log(accessToken);
    
    $http({
      url: _CAGOL_URL + '/bin',
      method: "POST",
      data: postData,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Facebook ' + accessToken +
        ' ' + ConfigService.getAppHash(accessToken) 
        + ' ' + new Date().getTime()
      }
    }).success(function (data, status, headers, config) {
      console.log("success");
    }).error(function (data, status, headers, config) {
      console.log("failure");
    });
  };
})

.service('FacebookService', function ($http) {
  var _FACEBOOK_URL = 'https://graph.facebook.com/v2.2/';
  
  this.getProfilePicture = function (access_token, callback) {
    $http.get(_FACEBOOK_URL + 'me/picture?access_token=' + access_token + 
              '&redirect=false&height=240&width=240')
      .success(function (res) {
        callback(res.data.url);
      })
      .error(function (err) {
        console.log(err);
      });
  };
})

.service('UserService', function ($rootScope) {
  this.clear = function () {
    localStorage.removeItem('CAGOL:access_token');
    localStorage.removeItem('CAGOL:expires_in');
  };
  this.getAccessToken = function () {
    return localStorage.getItem('CAGOL:access_token');
  };
  this.getExpiresIn = function () {
    return localStorage.getItem('CAGOL:expires_in');
  };
  this.hasAuthorisation = function () {
    if (this.getAccessToken() && this.getExpiresIn()) {
      return true;
    }
    else {
      return false;
    }
  }
  this.setAccessToken = function (access_token) {
    localStorage.setItem('CAGOL:previously_authenticated', true);
    localStorage.setItem('CAGOL:access_token', access_token);
  };
  this.setExpiresIn = function (expires_in) {
    localStorage.setItem('CAGOL:expires_in', expires_in);
  };
  this.hasSignedOut = function () {
    if (localStorage.getItem('CAGOL:previously_authenticated')) {
      if (!this.hasAuthorisation()) {
        localStorage.removeItem('CAGOL:previously_authenticated');
        
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  };
});
