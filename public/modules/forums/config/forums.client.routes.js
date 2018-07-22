'use strict';

//Setting up route
angular.module('forums').config(['$stateProvider',
	function($stateProvider) {
		// Forums state routing
		$stateProvider.
		state('forumDetails', {
			url: '/forumDetails/:forum_id',
			templateUrl: 'modules/forums/views/forumDetails.client.view.html'
		}).
		state('createForum', {
			url: '/forums/create',
			templateUrl: 'modules/forums/views/create-forum.client.view.html'
		}).
		state('viewForum', {
			url: '/forums',
			templateUrl: 'modules/forums/views/view-forum.client.view.html'
		}).
		state('editForum', {
			url: '/forums/:forumId/edit',
			templateUrl: 'modules/forums/views/edit-forum.client.view.html'
		}).
		state('manageForum', {
			url: '/manage-forum',
			templateUrl: 'modules/forums/views/manage-forum.client.view.html'
		}).
		state('myForum', {
			url: '/my-forum',
			templateUrl: 'modules/forums/views/my-forum.client.view.html'
		});
	}
]);
