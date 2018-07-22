'use strict';

//Knowledgebases service used to communicate Knowledgebases REST endpoints
angular.module('knowledgebases').factory('Knowledgebases', ['$resource',
	function($resource) {
		return $resource('knowledgebases/:knowledgebaseId', { knowledgebaseId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);