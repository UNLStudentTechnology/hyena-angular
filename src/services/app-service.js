'use strict';

/**
 * @ngdoc service
 * @name hyenaAngular.AppService
 * @description
 * # AppService
 * Service in the hyenaAngular.
 */
angular.module('hyenaAngular')
  .service('AppService', function AppService($http, AuthService, APIPATH, APIKEY, PLATFORM_ROOT) {
    var tokenString = 'token='+AuthService.authToken();
    var apiString = 'api_key='+APIKEY;

  	var AppService = {
  		/**
  		 * Gets an app from the platform.
  		 * @param  int 		appId 		App ID
  		 * @return Promise
  		 */
  		get: function getApp(appId) {
        scope = scope || '';
        return $http.get(PLATFORM_ROOT+'apps/'+appId);
  		},
  		all: function allApps(offset, limit) {
    			offset = offset || 0;
  			limit = limit || 0;
  			return $http.get(PLATFORM_ROOT+'apps?offset='+offset+'&limit='+limit);
  		}
  	};

  	return AppService;
  });
