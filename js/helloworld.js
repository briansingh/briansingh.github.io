(function() {

  var app = angular.module("HelloWorldApp", []);

  var HelloWorldController = function($scope) {
    $scope.message = "Hello World";
  };
  
  app.controller("HelloWorldController", ["$scope", HelloWorldController]);

}());