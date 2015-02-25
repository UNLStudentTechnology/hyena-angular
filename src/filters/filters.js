'use strict';
angular.module("hyenaAngular")
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
				case "staff" :
					return "Staff";
				default :
					return "N/A";
			}
		};
	})
	.filter('toArray', function () {
		return function (obj) {
		  	if (!(obj instanceof Object)) {
		        return obj;
		    }
		    return Object.keys(obj).map(function (key) {
		        return Object.defineProperty(obj[key], '$key', { enumerable: false, value: key});
		      });
		};
	})
	.filter('toBool', function () {
		return function (value) {
		  	return (value === 'true');
		};
	});