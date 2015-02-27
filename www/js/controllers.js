angular.module('cagol.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $cordovaGeolocation,
uiGmapGoogleMapApi, UserService, FacebookService,
CagolService, $cordovaCamera, $location, CameraService) {

  $scope.hasAuthorisation = UserService.hasAuthorisation();
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

  if ($scope.hasAuthorisation) {
    CagolService.getDepositTypes(accessToken, function (err, depositTypes) {
      $scope.depositTypes = depositTypes;
    });

    var watchOptions = {
      frequency : 1000,
      timeout : 3000,
      enableHighAccuracy: false // may cause errors if true
    };

    $scope.geolocationWatchCount = 0;

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
      null,
      function(err) {
        // error
      },
      function(position) {
        $scope.lat  = position.coords.latitude
        $scope.long = position.coords.longitude

        $scope.userPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        console.log("got position");

        uiGmapGoogleMapApi.then(function(maps) {
          $scope.map = { center: { latitude: $scope.lat, longitude: $scope.long } };

          if ($scope.geolocationWatchCount % 5 === 0 ||
          $scope.geolocationWatchCount === 0) {
            console.log("GET");
            $scope.getClosestBins(3);
          };

          $scope.geolocationWatchCount++;
        });
      }
    );

    $scope.addBin = function () {
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

      $cordovaCamera.getPicture(_OPTIONS).then(function (imageData) {
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

  $scope.init = function () {
    $scope.selectedClosestBin = false;
    $scope.selectedBin = null;
  };

  $scope.markers = [];

  $scope.getClosestBins = function (count) {
    CagolService.getClosestBins({
      'latitude': $scope.lat,
      'longitude': $scope.long },
      accessToken,
      count,
      function (err, bins) {
        bins.forEach(function (bin) {
          $scope.markers.push({
            id: bin._id,
            position: bin.position,
            options: {
              clickable: true
            },
            click: function () {
              $scope.selectedClosestBin = true;
              $scope.selectedBin = bin;
            }
          });
        });
      });
  };

  $scope.makeDeposit = function () {
    var canMakeDeposit = CagolService.canMakeDeposit($scope.userPosition,
    $scope.selectedBin.position);

    if (!canMakeDeposit) {
      alert("Please get closer to the bin.");
    }
    else if (!$scope.selectedBin.depositType) {
      alert("Please select a deposit type.")
    }
    else {
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

      $cordovaCamera.getPicture(_OPTIONS).then(function (imageData) {
        var deposit = {
          position: {
            latitude: $scope.lat,
            longitude: $scope.long
          },
          image: imageData,
          deposit_type_id: $scope.selectedBin.depositType._id,
          bin_id: $scope.selectedBin._id
        };

        CagolService.addDeposit(deposit, UserService.getAccessToken(), function (err, res) {
          console.log("Deposit type added... Hopefully.")
        });
      }, function(err) {
        // error
      });
    }
  };

  $scope.init();
})

.controller('BinCtrl', function ($scope, $ionicPlatform, $stateParams,
CagolService, UserService) {
  $scope.binId = $stateParams.id;

  $scope.bin = JSON.parse(localStorage.getItem('CAGOL:closest_bin'));
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
