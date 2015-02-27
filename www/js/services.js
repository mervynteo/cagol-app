angular.module('cagol.services', [])

.service('CagolService', function ($http, ConfigService) {
  var _CAGOL_URL = 'https://cagol-api.herokuapp.com/v1/',
      _APP_HASH = '';

  this.addBin = function (postData, accessToken, callback) {
    console.dir(postData);
    console.log(accessToken);

    $http({
      url: _CAGOL_URL + '/bins',
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

  this.getBinById = function (id, accessToken, callback) {
    $http({
      url: _CAGOL_URL + '/bins/' + id,
      method: "GET",
      headers: {
        'Authorization': 'Facebook ' + accessToken +
        ' ' + ConfigService.getAppHash(accessToken)
        + ' ' + new Date().getTime()
      }
    }).success(function (data, status, headers, config) {
      callback(null, data);
    }).error(function (data, status, headers, config) {
      console.log("failure");
    });
  };

  this.getBinImage = function (id, accessToken, callback) {
    $http({
      url: _CAGOL_URL + '/bins/' + id + '/image',
      method: "GET",
      headers: {
        'Authorization': 'Facebook ' + accessToken +
        ' ' + ConfigService.getAppHash(accessToken)
        + ' ' + new Date().getTime()
      }
    }).success(function (data, status, headers, config) {
      callback(null, data);
    }).error(function (data, status, headers, config) {
      console.log("failure");
    });
  };

  this.getClosestBins = function (position, accessToken, count, callback) {
    console.dir(position);

    $http({
      url: _CAGOL_URL + '/bins/' + position.latitude + '/' +
      position.longitude + '?count=' + count,
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Facebook ' + accessToken +
        ' ' + ConfigService.getAppHash(accessToken)
        + ' ' + new Date().getTime()
      }
    }).success(function (data, status, headers, config) {
      localStorage.removeItem('CAGOL:closest_bin');
      localStorage.setItem('CAGOL:closest_bin', JSON.stringify(data));

      callback(null, data);
    }).error(function (data, status, headers, config) {
      console.log("failure");
    });
  };
})

.service('FacebookService', function ($http) {
  var _FACEBOOK_URL = 'https://graph.facebook.com/v2.2/';

  this.getMe = function (accessToken, callback) {
    $http.get(_FACEBOOK_URL + 'me?access_token=' + accessToken)
      .success(function (res) {
        callback(null, res);
      })
      .error(function (err) {
        console.dir(err);
      });
  };
  this.getProfilePicture = function (access_token, callback) {
    $http.get(_FACEBOOK_URL + 'me/picture?access_token=' + access_token +
              '&redirect=false&height=240&width=240')
      .success(function (res) {
        console.dir(res);
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
    localStorage.removeItem('CAGOL:name');
  };
  this.getAccessToken = function () {
    return localStorage.getItem('CAGOL:access_token');
  };
  this.getExpiresIn = function () {
    return localStorage.getItem('CAGOL:expires_in');
  };
  this.getName = function () {
    var rawName = localStorage.getItem('CAGOL:name');

    if (rawName) {
      return JSON.parse(rawName);
    }
    else {
      return null;
    };
  };
  this.setAccessToken = function (access_token) {
    localStorage.setItem('CAGOL:previously_authenticated', true);
    localStorage.setItem('CAGOL:access_token', access_token);
  };
  this.setExpiresIn = function (expires_in) {
    localStorage.setItem('CAGOL:expires_in', expires_in);
  };
  this.setName = function (firstName, lastName) {
    var name = {
      'firstName': firstName,
      'lastName': lastName
    };

    localStorage.setItem('CAGOL:name', JSON.stringify(name));
  };
  this.hasAuthorisation = function () {
    if (this.getAccessToken() && this.getExpiresIn()) {
      return true;
    }
    else {
      return false;
    }
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
