'use strict';

//Forums service used to communicate Forums REST endpoints
angular.module('forums').factory('Forums', ['$resource',
	function($resource) {
		return $resource('forums/:forumId', { forumId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);