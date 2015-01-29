/* global Firebase */
'use strict';

/**
 * @ngdoc service
 * @name hyenaCheckpointsApp.firebase
 * @description
 * # firebase
 * Factory in the hyenaCheckpointsApp.
 */
angular.module('hyenaAngular')
  .factory('AppFirebase', function (FBURL, $firebase, $firebaseAuth) {
    var appFirebase = new Firebase(FBURL);

    var FirebaseService = {
      /**
       * Returns a reference to the Firebase
       * @return FirebaseRef
       */
      getRef: function getRef() {
        return appFirebase;
      },

      getAuthRef: function getAuthRef() {
        return $firebaseAuth(appFirebase);
      },

      /**
       * Takes a JWT, decodes it, authenticates a user into a firebase, and returns the decoded token.
       * @param  JWT authToken  Secure JWT from authentication server. (Hyena Platform)
       * @return Object         Decoded token
       */
      authenticate: function authenticate(authToken) {
        var authRef = $firebaseAuth(appFirebase);
        return authRef.$authWithCustomToken(authToken);
      }
    };

    return FirebaseService;
  });
