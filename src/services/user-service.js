'use strict';

/**
 * @ngdoc service
 * @name hyenaAngular.UserService
 * @description
 * # UserService
 * Service in hyenaAngular.
 */
angular.module('hyenaAngular')
	.service('UserService', function UserService(PLATFORM_ROOT, APIPATH, APIKEY, $http, $q, toArrayFilter, $localStorage) {
		var tokenString = 'token='+$localStorage.authToken;
		var apiString = 'api_key='+APIKEY;

		var UserService = {
			/**
			 * Gets a single user from the platform based on Blackboard user id.
			 * @param  string userId Blackboard username
			 * @param  string scope  Additional relations to return on the user
			 * @return Promise
			 */
			get: function getUser(userId, scope) {
				if(angular.isUndefined(scope))
					scope = '';

				return $http.get(
					APIPATH+'users/'+userId+'?with='+scope+'&api_key='+APIKEY);
			},
			/**
			 * Updates a user's first name and email address.
			 * @param  string userId   Blackboard username
			 * @return Promise
			 */
			update: function updateUser(userId, userData) {
				return $http.put(APIPATH+'users/'+userId+'?'+tokenString+'&'+apiString, userData);
			},
			/**
			 * Validates an NUID against the platform, returns Blackboard username.
			 * @param  Int user NUID number
			 * @return Promise
			 */
			validate: function validateUser(users) {
				return $http.post(
					APIPATH+'users/validate?api_key='+APIKEY, 
					{ "ids": [ users ] }
				);
			},
			/**
			 * Convenience function that validates an NUID and returns that user object.
			 * @param  Int user NUID number
			 * @return Promise
			 */
			validateAndGet: function validateAndGet(user) {
				var deferred = $q.defer();

				UserService.validate(user).then(function(response) {
					UserService.get(response.data.users_validated[0]).then(function(user) {
						deferred.resolve(user.data);
					}, function(error) {
						deferred.reject(error);
					});
				}, function(error) {
					deferred.reject(error);
				});

				return deferred.promise;
			},
			/**
		     * Returns a clean array to be exported to CSV
		     * @return array Array of users
		     */
		   	export: function export(array) {
		   		var exportArray = angular.copy(array);
				for (var i = 0; i < exportArray.length; i++) {
					delete exportArray[i].uni_ferpa;
					delete exportArray[i].pivot;
					delete exportArray[i].id;
					delete exportArray[i].profile_image;
				}
				return exportArray;
		    },
			/**
			 * Replaces user ids (BB Usernames) in an array with a full user object from platform.
			 * @param  Array array  Array in which to loop over and replace
			 * @param  String key   Array key in which to get user ids from
			 * @return Array        Returns an updated array if everything worked out.
			 */
			getUserRelations: function getUserRelations(array, key) {
				//If array is empty or malformed, end function
				if(angular.isUndefined(array))
					return false;

				//Set default key
				key = key || 'user';

				array = toArrayFilter(array);

				var userIdsArray = [];
				var userIdsString = "";
				//Go through existing array, find BB usernames and send to platform
				for (var i = 0; i < array.length; i++) {
					userIdsArray.push(array[i][key]);
					userIdsString += array[i][key]+',';
				}
				userIdsString = userIdsString.substring(0, userIdsString.length - 1); //Trim the last comma

				var usersResponse = $http.get(APIPATH+'users?ids='+userIdsString+'&api_key='+APIKEY);
				usersResponse.then(function(response) {
					for (var i = 0; i < response.data.length; i++) {
						array[i][key] = response.data[i];
					}
				});
				return array;

			}
		};

		return UserService;
	});
