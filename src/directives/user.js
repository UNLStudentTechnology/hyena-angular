angular.module("hyenaAngular")
	/**
	 * Replaces a Hyena username with a full user object.
	 */
	.directive('user', function (UserService) {
		return {
			restrict: 'A',
			scope: {
				userValue: "=userModel" //grabs the model from directive attribute and assigns it an isolated scope var.
			},
			link: function postLink(scope, element, attrs) {
				// console.log(attrs.userModel);
				// console.log('Directive', scope.userValue);
				var userId = scope.userValue;
				scope.$watch('userValue', function(newValue, oldValue) {
					if(angular.isDefined(newValue) && !angular.isObject(newValue)) {
						UserService.get(newValue).then(function(response) {
							scope.userValue = response.data;
						});
					}
				});
			}
		};
	});