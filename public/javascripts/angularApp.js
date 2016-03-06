var app = angular.module('lami-bib', []);

app.controller('MainCtrl', [
  '$scope',
  function($scope){
      $scope.test = 'Hello world!';
  }]);
