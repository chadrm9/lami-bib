var app = angular.module('lami-bus', ['ui.router','ui.bootstrap'])
app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('login')
        }
      }],
      resolve: {
        postPromise: ['notes', function(notes){
          return notes.getAll()
        }]
      }
    })
    .state('notes', {
      url: '/notes/{id}',
      templateUrl: '/notes.html',
      controller: 'NotesCtrl',
      resolve: {
	note: ['$stateParams', 'notes', function($stateParams, notes) {
	return notes.get($stateParams.id)
	}]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home')
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home')
        }
      }]
    })
  $urlRouterProvider.otherwise('home')
}])

app.factory('auth', ['$http', '$window', function($http, $window){
  var auth = {}
  auth.saveToken = function (token){
    $window.localStorage['lami-bus-token'] = token
  }
  auth.getToken = function (){
    return $window.localStorage['lami-bus-token']
  }
  auth.isLoggedIn = function(){
    var token = auth.getToken()
    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]))
      return payload.exp > Date.now() / 1000
    }
    else return false
  }
  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken()
      var payload = JSON.parse($window.atob(token.split('.')[1]))
      return payload.username
    }
  }
  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token)
    })
  }
  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token)
    })
  }
  auth.logOut = function(){
    $window.localStorage.removeItem('lami-bus-token')
    $window.location.href = "#/login"
  }
  return auth
}])

app.factory('notes', ['$http', 'auth', function($http, auth){
  var o = {
    notes: []
  }
  o.getAll = function() {
    return $http.get('/notes').success(function(data){
      angular.copy(data, o.notes)
    })
  }
  o.create = function(note) {
    return $http.post('/notes', note, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.notes.push(data)
    })
  }
  o.get = function(id) {
    return $http.get('/notes/' + id).then(function(res) {
      return res.data
    })
  }
//   o.delete = function(id) {
//     return $http.delete('/notes/' + id).then(function(res) {
//       return res.data
//     })
//   }
  return o
}])

app.controller('MainCtrl', [
  '$scope',
  'notes',
  'auth',
  function($scope, notes, auth){
    $scope.notes = notes.notes
    $scope.isLoggedIn = auth.isLoggedIn
    $scope.addNote = function(){
      if ($scope.title === '') return
      notes.create({
        title: $scope.title,
        message: $scope.message,
      })
      $scope.title = ''
      $scope.message = ''
    }
//     $scope.deleteNote = function(id){
//       notes.delete(id)
//     }
}])

app.controller('NotesCtrl', [
  '$scope',
  'notes',
  'note',
  'auth',
  function($scope, notes, note, auth){
    $scope.note = note
    $scope.isLoggedIn = auth.isLoggedIn
}])

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.user = {}
    $scope.register = function(){
      auth.register($scope.user).error(function(error){
	$scope.error = error
      }).then(function(){
	$state.go('home')
      })
    }
    $scope.logIn = function(){
      auth.logIn($scope.user).error(function(error){
	$scope.error = error
      }).then(function(){
	$state.go('home')
      })
    }
}])

app.controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    $scope.isLoggedIn = auth.isLoggedIn
    $scope.currentUser = auth.currentUser
    $scope.logOut = auth.logOut
}])
