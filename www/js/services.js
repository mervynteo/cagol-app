angular.module('cagol.services', [])

.service('AuthorizationService', function (ConfigService) {
  this.getHeader = function (accessToken) {
    return 'Facebook ' + accessToken + ' ' +
    ConfigService.getAppHash(accessToken) + ' ' + new Date().getTime();
  };
})

.service('CagolService', function ($http, ConfigService, AuthorizationService) {
  var _CAGOL_URL = 'https://cagol-api.herokuapp.com/v1/',
      _APP_HASH = '';

  function deg2rad (deg) {
    return deg * (Math.PI/180);
  };

  function getDistance (latitude1, longitude1, latitude2, longitude2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(latitude2 - latitude1); // deg2rad below
    var dLon = deg2rad(longitude2 - longitude1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  };

  this.addBin = function (postData, accessToken, callback) {
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

  this.addDeposit = function (postData, accessToken, callback) {
    $http({
      url: _CAGOL_URL + '/deposits',
      method: "POST",
      data: postData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AuthorizationService.getHeader(accessToken)
      }
    }).success(function (data, status, headers, config) {
      console.log("success");
    }).error(function (data, status, headers, config) {
      console.log("failure");
    });
  };

  this.canMakeDeposit = function (userPosition, binPosition) {
    var distance = getDistance(userPosition.latitude, userPosition.longitude,
    binPosition.latitude, binPosition.longitude);

    if (distance <= 0.005) {
      return true;
    }
    else {
      return false;
    };
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

  this.getDepositTypes = function (accessToken, callback) {
    $http({
      url: _CAGOL_URL + '/deposits/types',
      method: "GET",
      headers: {
        'Authorization': AuthorizationService.getHeader(accessToken)
      }
    }).success(function (data, status, headers, config) {
      callback(null, data);
    }).error(function (data, status, headers, config) {
      console.log("failure");
    });
  };

  this.makeDeposit = function () {

  };
})

.service('CameraService', function ($cordovaCamera) {
  document.addEventListener("deviceready", function () {
    var _OPTIONS = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 280,
      targetHeight: 280,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  });

  this.getOptions = function () {
    return this._OPTIONS;
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
