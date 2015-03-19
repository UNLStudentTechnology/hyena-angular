/* global Firebase */
'use strict';

/**
 * @ngdoc function
 * @name hyenaAppsApp.controller:ApplicationCtrl
 * @description
 * # ApplicationCtrl
 * Controller of the hyenaAppsApp
 */
angular.module("hyenaAngular")
  .controller('ApplicationCtrl', function ($rootScope, $scope, $location, $state, $window, $firebase, AuthService, UserService, AppFirebase, Notification, FBURL, AUTH_EVENTS, AUTH_SCOPE) {
    //Initialize some variables
    $scope.appLoaded = null;
    $scope.currentUser = null;
    $scope.requireAuth = null;
    $rootScope.currentGroupId = 0;

    /**
     * Checks to see if the requireAuth param is set on the state.
     * If it is, it will go through the auth flow and attach auth events.
     */
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      //Check and see if we should authenticate
      if(angular.isDefined(toState.data) && angular.isDefined(toState.data.requireAuth))
      {
        //Set a global variable accessible in other controllers
        $scope.requireAuth = toState.data.requireAuth;

        //No need to reauth if already authenticated
        if($scope.currentUser === null && toState.data.requireAuth)
        {
          //Start auth flow
          AuthService.flow(AUTH_SCOPE).then(function(response) {
            $scope.appLoaded = true;
            $scope.currentUser = response;
          }, function(response) {
            console.error('There was an error logging in.', response);
          });
        }
      }
    });

    /**
     * Fired whenever a Firebase authenticated JWT expires.
     */
    AppFirebase.getAuthRef().$onAuth(function(authData) {
      if (!authData && $scope.currentUser) {
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    });
    
    /**
     * Event handler for when a 401 error is returned from an API. This will
     * cause the current authenticated session to expire.
     */
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
        AuthService.expire();
        $scope.currentUser = null;
        if($scope.requireAuth)
        {
          Notification.showModal('Please log in', '#modal-content-login', 'takeover');
          AuthService.login();
        }
    });

    /**
     * Sets the current user on scope.
     * @param Object user JSON user object
     */
  	$scope.setCurrentUser = function (user) {
  		$scope.currentUser = user;
  	};

    $scope.logOutCurrentUser = function() {
      $scope.currentUser = null;
      AuthService.logout();
    };

    /**
     * Starts the log in flow manually.
     */
    $scope.logIn = function() {
      if(!AuthService.check())
        AuthService.login();
    };

    /**
     * Toggles the main layout drawer
     */
    $scope.toggleMainDrawer = function() {
      document.querySelector('unl-layout').toggleDrawer();
    };

    /**
     * Toggles the main layout drawer
     */
    $scope.closeMainDrawer = function() {
      document.querySelector('unl-layout').closeDrawer();
    };

    /**
     * Forces the drawer to hide even on large screens
     */
    $scope.hideMainDrawer = function() {
      document.querySelector('unl-layout').forceHideDrawer();
    };

    /**
     * Forces the drawer to show even on large screens
     */
    $scope.showMainDrawer = function() {
      document.querySelector('unl-layout').forceShowDrawer();
    };

    /**
     * Callback function to show the login modal window.
     */
    $scope.showLoginWindow = function() {
      Notification.setModalContent('#modal-content-login');
    };

    $scope.closeModal = function() {
      Notification.hideModal();
    };

    /**
     * Manages page navigation and allows to specify a page animation
     * class to be set.
     * @param  string path                  href to location
     * @param  string pageAnimationClass    CSS animation class
     */
    $scope.go = function (path, pageAnimationClass) {
      if (typeof(pageAnimationClass) === 'undefined') { // Use a default, your choice
          $scope.pageAnimationClass = 'animate-slide-right';
      } 
      else { // Use the specified animation
          $scope.pageAnimationClass = pageAnimationClass;
      }

      if (path === 'back') { // Allow a 'back' keyword to go to previous page
          $scope.pageAnimationClass = 'animate-slide-left';
          $window.history.back();
      }    
      else { // Go to the specified path
          $location.path(path);
      }
    };

  });