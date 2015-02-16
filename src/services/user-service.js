'use strict';

/**
 * @ngdoc service
 * @name hyenaAppsApp.UserService
 * @description
 * # UserService
 * Service in the hyenaAppsApp.
 */
angular.module('hyenaAngular')
	.service('UserService', function (APIPATH, APIKEY, $http, toArrayFilter) {
		return {
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
			 * Validates an NUID against the platform, returns Blackboard username.
			 * @param  Int user NUID number
			 * @return Promise
			 */
			validate: function validate(user) {
				return $http.post(
					APIPATH+'users/validate?api_key='+APIKEY, 
					{ "ids": [ user ] }
				);
			},
			/**
		     * Returns a clean array to be exported to CSV
		     * @return array Array of users
		     */
		   	export: function export(array) {
		   		var exportArray = angular.copy(array);
				for (var i = 0; i < exportArray.length; i++) {
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
	});
