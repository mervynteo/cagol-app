angular.module('cagol.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $interval, UserService, FacebookService) {  
  $scope.accessTokenTest = function () {
    alert(UserService.getAccessToken());
  };
  
  $scope.hasAuthorisation = UserService.hasAuthorisation();
  
  if (UserService.getAccessToken()) {
    FacebookService.getProfilePicture(UserService.getAccessToken(), function (res) {
      $scope.profilePictureUrl = res;
    });
  };
})

.controller('LoginCtrl', function ($scope, $ionicPlatform, $cordovaOauth, UserService, ConfigService, $window) {
  $scope.hasAuthorisation = UserService.hasAuthorisation();
  
  if (UserService.hasAuthorisation()) {  
  }
  else {
    $scope.facebookLogin = function() {
      $cordovaOauth.facebook(ConfigService._FACEBOOK_CLIENT_ID, ["email"]).then(function(result) {
        UserService.setAccessToken(result.access_token);
        UserService.setExpiresIn(result.expires_in);
        
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

