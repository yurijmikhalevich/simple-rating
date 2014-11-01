/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

mainApp.controller('Authorization', function($rootScope, $scope) {
  $scope.authorize = function() {
    socket.emit('authorize', $scope.secret, function() {
      $rootScope.authorized = true;
      $scope.secret = null;
      $rootScope.$apply();
    });
  };
});
