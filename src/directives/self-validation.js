angular.module("hyenaAngular")
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
	});