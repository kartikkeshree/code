'use strict';

//Classifieds service used to communicate Classifieds REST endpoints
angular.module('classifieds').factory('Classifieds', ['$resource',
	function($resource) {
		return $resource('/classifieds');
	}
]);
