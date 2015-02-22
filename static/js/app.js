/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

var mainApp = angular.module('main', []);

mainApp.directive('contenteditable', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      // view -> model
      element.bind('blur change keyup', function() {
        scope.$apply(function() {
          ctrl.$setViewValue(element.html());
        });
      });

      // model -> view
      ctrl.$render = function() {
        element.html(ctrl.$viewValue);
      };
    }
  };
});

mainApp.directive('stopEvent', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      element.bind(attr.stopEvent, function(e) {
        e.stopPropagation();
      });
      element.on('$destroy', function() {
        element.unbind(attr.stopEvent);
      });
    }
  };
});

mainApp.directive('autoFocus', function() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element[0].focus();
    }
  };
});
