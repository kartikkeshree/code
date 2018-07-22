'use strict';

//Appointments service used to communicate Appointments REST endpoints
angular.module('appointments').factory('Appointments', ['$resource',
	function($resource) {
		return $resource('appointments/:appointmentId', { appointmentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);