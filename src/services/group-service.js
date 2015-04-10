'use strict';

/**
 * @ngdoc service
 * @name hyenaAngular.GroupService
 * @description
 * # GroupService
 * Service in the hyenaAngular.
 */
angular.module('hyenaAngular')
  .service('GroupService', function GroupService($http, AuthService, APIPATH, APIKEY) {
    var tokenString = 'token='+AuthService.authToken();
    var apiString = 'api_key='+APIKEY;

  	var GroupService = {
  		/**
  		 * Gets a group from the platform.
  		 * @param  int 		groupId 	Group ID
  		 * @param  string 	scope   	Additional relations to return
  		 * @return Promise
  		 */
  		get: function getGroup(groupId, scope) {
  			scope = scope || '';
			return $http.get(APIPATH+'groups/'+groupId+'?with='+scope+'&'+apiString);
		},
		/**
		 * Update group on the platform.
		 * @param  int 		groupId 	Group ID
		 * @param  array 	appData 	Array of new data
		 * @return promise
		 */
		update: function updateGroup(groupId, appData) {
			return $http.put(
				APIPATH+'groups/'+groupId+'?'+tokenString, appData);
		},
		/**
		 * Adds new group to platform
		 * @param array 	group 	Array of new group information
		 */
		add: function addNewGroup(group) {
			return $http.post(
				APIPATH+'groups?'+tokenString+'&'+apiString, group);
		},
		/**
		 * Adds users to group
		 * @param  int 		groupId 	Group ID
		 * @param  array  	users   	Array of NUIDs or BB usernames to add
		 * @return promise
		 */
		usersAdd: function usersAdd(groupId, users) {
			return $http.post(
				APIPATH+'groups/'+groupId+'/users?'+tokenString+'&'+apiString, users);
		},
		/**
		 * Updates sing user in a group
		 * @param  string groupId  Group ID
		 * @param  string userId   BB username
		 * @param  object userData
		 * @return promise
		 */
		usersUpdate: function usersUpdate(groupId, userId, userData) {
			return $http.put(
				APIPATH+'groups/'+groupId+'/users/'+userId+'?'+apiString+'&'+tokenString, userData);
		},
		/**
		 * Removes users from group
		 * @param  int 		groupId 	Group ID
		 * @param  array  	users   	Array of NUIDs or BB usernames to remove
		 * @return promise
		 */
		usersRemove: function usersRemove(groupId, users) {
			return $http.post(
				APIPATH+'groups/'+groupId+'/users/delete?'+tokenString+'&'+apiString, users);
		},
		/**
		 * Check if the user exists in a group
		 * @param  int  	groupId
		 * @param  string  	userId
		 * @return promise
		 */
		hasUser: function hasUser(groupId, userId) {
			return $http.get(
				APIPATH+'groups/'+groupId+'/users/'+userId+'?'+apiString);
		},
		appsAdd: function appsAdd(groupId, apps) {
			return $http.post(
				APIPATH+'groups/'+groupId+'/apps?'+apiString+'&'+tokenString, apps);
		},
		appsRemove: function appsRemove(groupId, apps) {
			return $http.post(
				APIPATH+'groups/'+groupId+'/apps/delete?'+apiString+'&'+tokenString, apps);
		},
  	};

  	return GroupService;
  });
