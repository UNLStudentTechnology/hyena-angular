'use strict';

/**
 * @ngdoc service
 * @name hyenaAppsApp.Auth
 * @description
 * # Auth
 * Reusable service that maintains a clientside authentication state.
 * REQUIRES the session and user service.
 */
angular.module('hyenaAngular')
  .service('AuthService', function ($http, $sessionStorage, $localStorage, $location, $q, UserService, APIKEY, APIPATH, AppFirebase) {
    var firebaseAuthRef = AppFirebase.getRef();

    var AuthService = {

      flow: function(scope) {
        scope = scope || "";
        var deferred = $q.defer();

        if(angular.isDefined($location.search().token)) //If this is new log in from CAS
        {
          //Get Query Params
          var authToken = $location.search().token;
          //Evaluate token from platform
          var tokenUser = AppFirebase.authenticate(authToken).then(function(authData) {
            //Process the user login
            AuthService.manualLogin(authData.uid, authToken, scope).then(function(user) {
              $location.url($location.path()); //Clear query params from address bar
              deferred.resolve(user.data);
            }, function(error) {
              deferred.reject(error);
              console.log('Login failed:', error);
            });
          }, function(error) {
            deferred.reject(error);
            console.error("Failed to authenticate token:", error, authToken);
          });
        }
        else if(AuthService.check() && AppFirebase.getAuthRef().$getAuth() !== null) //Already authenticated, attempt to get existing session
        {
          AuthService.user(scope).then(function(user) {
            deferred.resolve(user.data);
          });
        }
        else
        {
          AuthService.login(); //Start the CAS flow
        }

        return deferred.promise;
      },
 
      /**
       * Starts the CAS authorization flow.
       * WARNING: This is a redirect, not http request. This will leave current app flow.
       * @return N/A
       */
      login: function() {
        $sessionStorage.currentRoute = window.location.href;
        window.location.replace(APIPATH+'users/login?api_key='+APIKEY+'&callback='+window.location.href);
      },

      /**
       * Manually create an authentication session based on a user ID.
       * @param  string userId Blackboard Username
       * @return Promise
       */
      manualLogin: function(userId, authToken, scope) {
        if(angular.isUndefined(scope))
          scope = '';

        var auth_user = UserService.get(userId, scope);
        return auth_user.then(function(user) {
          if(AuthService.createAuthSession(userId, authToken))
            return AuthService.user(scope);
          else
            return false;
        });
      },

      /**
       * Logs a user out of the platform and destroys the local session.
       * @return Promise
       */
      logout: function() {
        AuthService.expire();
        window.location.replace(APIPATH+'users/logout?api_key='+APIKEY);
      },

      /**
       * Creates a session for the authenticated user in local storage.
       * @param  string
       * @param  JWT
       * @return bool
       */
      createAuthSession: function(userId, authToken) {
        $localStorage.auth = true;
        $localStorage.authUser = userId;
        $localStorage.authToken = authToken;
        return true;
      },

      /**
       * Gets the user object of the currently logged in user
       * @return Promise
       */
      user: function(scope) {
        if(angular.isUndefined(scope))
          scope = '';

        var userId = AuthService.userId();
        return UserService.get(userId, scope);
      },

      userId: function() {
        if($localStorage.auth)
          return $localStorage.authUser;
        else
          return false;
      },

      /**
       * Returns the current JWT token
       * @return string JWT token
       */
      authToken: function() {
        return $localStorage.authToken;
      },
     
      /**
       * Checks to see if someone is currently logged in
       * @return bool
       */
      check: function() {
        return !!$localStorage.auth;
      },

      /**
       * Destroys the current session
       * @return bool
       */
      expire: function() {
        if(angular.isDefined(firebaseAuthRef))
          firebaseAuthRef.unauth();
        
        delete $localStorage.auth;
        delete $localStorage.authUser;
        delete $localStorage.authToken;
      }

    };

    return AuthService;

  });
