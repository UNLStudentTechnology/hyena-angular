'use strict';

/**
 * @ngdoc service
 * @name hyenaAngular.FirebaseGroupService
 * @description
 * # FirebaseGroupService
 * Service in the hyenaAngular.
 */
angular.module('hyenaAngular')
  .service('FirebaseGroupService', function FirebaseGroupService($http, $firebase, AppFirebase, AuthService, APIPATH, APIKEY) {
	var groupsRef = AppFirebase.getRef().child('groups');

  	var FirebaseGroupService = {
  		get: function getGroup(groupId, scope) {
			scope = scope || "";
			return $http.get(APIPATH+'groups/'+groupId+'?with='+scope+'&api_key='+APIKEY);
		},
		add: function add(group, groupId) {
			return $firebase(groupsRef).$set(groupId, group);
		},
  		exists: function exists(groupId) {
			var groupExistsResponse = $firebase(groupsRef.child(groupId)).$asObject();
			return groupExistsResponse.$loaded(function() {
			    return groupExistsResponse.$value !== null;
			});
		},
		existsOrAdd: function existOrAdd(groupId) {
			var groupExistsPromise = FirebaseGroupService.exists(groupId);
			groupExistsPromise.then(function(response) {
				if(!response)
				{
					var getGroupPromise = FirebaseGroupService.get(groupId);
					getGroupPromise.then(function(response) {
						var newGroup = {
				          title: response.data.title,
				          description: response.data.description
				        };

				         FirebaseGroupService.add(newGroup, groupId).then(function(response) {
				         	console.log('Group added to Firebase', response);
				         });
					});
				}
			});
		}
  	};

  	return FirebaseGroupService;
  });
