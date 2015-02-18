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
  .controller('ApplicationCtrl', function ($rootScope, $scope, $location, $window, $routeParams, $firebase, AuthService, UserService, AppFirebase, Notification, FBURL, AUTH_EVENTS, AUTH_SCOPE) {
    //Initialize some variables
    $scope.appLoaded = null;
    $scope.currentUser = null;
    $rootScope.currentGroupId = 0;

    //Start auth flow
    AuthService.flow(AUTH_SCOPE).then(function(response) {
      $scope.appLoaded = true;
      $scope.currentUser = response;
    }, function(response) {
      console.error('There was an error logging in.');
    });

    /** 
     * Event handler for when the user logs in or out. Hides the page and shows a modal
     * prompting the user to log in.
     */
    $scope.$watch('currentUser', function(newVal, oldVal) {
      //console.log('currentUser', newVal, oldVal);
      if(oldVal !== null && (angular.isUndefined(newVal) || newVal === null))
        Notification.showModal('Please log in', '#modal-content-login', 'takeover');
      else if(oldVal !== null)
        Notification.hideModal();
    });
    
    /**
     * Event handler for when a 401 error is returned from an API. This will
     * cause the current authenticated session to expire.
     */
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
      AuthService.expire();
      $scope.currentUser = null;
      AuthService.login();
    });

    AppFirebase.getAuthRef().$onAuth(function(authData) {
      if (!authData && $scope.appLoaded) {
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
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