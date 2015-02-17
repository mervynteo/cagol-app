angular.module('cagol.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $cordovaGeolocation,
                                 uiGmapGoogleMapApi, UserService, FacebookService,
                                CagolService, $cordovaCamera) {
  $scope.accessTokenTest = function () {
    alert(UserService.getAccessToken());
  };

  $scope.hasAuthorisation = UserService.hasAuthorisation();

  if ($scope.hasAuthorisation) {
    var watchOptions = {
      frequency : 1000,
      timeout : 3000,
      enableHighAccuracy: false // may cause errors if true
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
      null,
      function(err) {
        // error
      },
      function(position) {
        $scope.lat  = position.coords.latitude
        $scope.long = position.coords.longitude

        //console.dir(position);

        uiGmapGoogleMapApi.then(function(maps) {
          $scope.map = { center: { latitude: $scope.lat, longitude: $scope.long } };
        });
      }
    );

    $scope.addBin = function () {
      var options = {
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

      $cordovaCamera.getPicture(options).then(function (imageData) {
        var bin = {
          position: {
            latitude: $scope.lat,
            longitude: $scope.long
          },
          image: imageData
        };

        CagolService.addBin(bin, UserService.getAccessToken(), function (err, res) {
          console.log("Bin added... Hopefully.")
        });
      }, function(err) {
        // error
      });

    };
  };

  var accessToken = UserService.getAccessToken();
  if (accessToken) {
    FacebookService.getProfilePicture(accessToken, function (res) {
      $scope.profilePictureUrl = res;
    });

    FacebookService.getMe(accessToken, function (err, res) {
      $scope.fullName = res.name;
      $scope.firstName = res.first_name;
      $scope.lastName = res.last_name;
    });
  };


})

.controller('LoginCtrl', function ($scope, $ionicPlatform, $cordovaOauth,
  UserService, ConfigService, $window, FacebookService) {
  $scope.hasAuthorisation = UserService.hasAuthorisation();

  if (UserService.hasAuthorisation()) {
  }
  else {
    $scope.facebookLogin = function() {
      $cordovaOauth.facebook(ConfigService._FACEBOOK_CLIENT_ID, ["email"]).then(function(result) {
        UserService.setAccessToken(result.access_token);
        UserService.setExpiresIn(result.expires_in);

        // result.access_token doesn't work with services at this point,
        // why is that?
        console.dir(result);

        $window.location.reload(true);
      }, function(error) {
          // error
      });
    };
  }
})

.controller('SettingsCtrl', function ($scope, $ionicPlatform, UserService, $window) {
  $scope.signOut = function () {
    UserService.clear();
  };
});
