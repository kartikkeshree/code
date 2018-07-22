'use strict';

//Clinics service used to communicate Clinics REST endpoints
angular.module('clinics').factory('Clinics', ['$resource',
	function($resource) {
		return $resource('clinics/:clinicId', { clinicId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);