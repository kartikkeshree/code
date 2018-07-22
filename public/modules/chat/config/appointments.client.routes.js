'use strict';

//Setting up route
angular.module('appointments').config(['$stateProvider',
	function($stateProvider) {
		// Appointments state routing
		$stateProvider.
		state('chat', {
			url: '/chat',
			templateUrl: 'modules/chat/views/chat.html'
		});
	}
]);
