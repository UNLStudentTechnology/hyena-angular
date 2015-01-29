'use strict';

'format global'; /* global define */
'deps angular';

angular.module( "hyenaAngular", [] )
	/**
	 * Returns a pretty version of the uni_year code from Hyena.
	 * @return string   Pretty Year
	 */
	.filter('uni_year', function () {
		return function (input) {
			switch (input) {
				case "FR" :
					return "Freshman";
				case "SO" :
					return "Sophomore";
				case "JR" :
					return "Junior";
				case "SR" :
					return "Senior";
				case "GR" :
					return "Graduate";
				default :
					return "N/A";
			}
		};
	})
	/**
	 * Input types for self-validation directive.
	 */
	.value('FieldTypes', {
		text: ['Text', 'should be text'],
		email: ['Email', 'should be an email address'],
		number: ['Number', 'should be a number'],
		date: ['Date', 'should be a date'],
		datetime: ['Datetime', 'should be a datetime'],
		time: ['Time', 'should be a time'],
		month: ['Month', 'should be a month'],
		week: ['Week', 'should be a week'],
		url: ['URL', 'should be a URL'],
		tel: ['Phone Number', 'should be a phone number'],
		color: ['Color', 'should be a color']
	})
	/**
	 * Creates an input that is able to validate itself. Includes validation errors and bubbles
	 * up to outside form.
	 */
	.directive('selfValidation', function (FieldTypes) {
		return {
			templateUrl: 'views/partials/self-validation-input.html',
			restrict: 'EA',
			replace: true,
            scope: {
                model: '=',
                field: '@',
                type: '@',
                required: '@',
                placeholder: '@'
            },
			link: function postLink($scope, element, attrs) {
				
				$scope.types = FieldTypes;
			}
		};
	})
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
	})
	/**
	 * Binds reflected Polymer attributes to an Angular scope variable.
	 */
	.directive('bindPolymer', function($q, $timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
			  var attrMap = {};
			  for (var prop in attrs.$attr) {
			    if (prop != 'bindPolymer') {
			      var _attr = attrs.$attr[prop];
			      var _match = element.attr(_attr).match(/\{\{\s*([\.\w]+)\s*\}\}/);
			      if (_match) {
			        attrMap[_attr] = _match[1];
			      }
			    }
			  }

			  // When Polymer sees a change to the bound variable,
			  // $apply / $digest the changes here in Angular
			  new MutationObserver(function() { scope.$apply(); }).
			    observe(element[0], {attributes: true});

			  for (var _attr in attrMap) { watch (_attr); }

			  function watch(attr) {
			    scope.$watch(
			      function() { return element.attr(attr); },
			      function(value) {
			        var tokens = attrMap[attr].split(/\./);
			        var parent = scope;
			        for (var i=0; i<tokens.length-1; i++) {
			          if (typeof(parent[tokens[i]]) == 'undefined') {
			            parent[tokens[i]] = {};
			          }
			          parent = parent[tokens[i]];
			        }
			        parent[tokens[tokens.length - 1]] = value;
			      }
			    );
			  }
			}
		};
	});
