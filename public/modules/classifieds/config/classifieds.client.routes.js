'use strict';

//Setting up route
angular.module('classifieds').config(['$stateProvider',
	function($stateProvider) {
		// Classifieds state routing
		$stateProvider.
		state('listClassifieds', {
			url: '/listClassifieds',
			templateUrl: 'modules/classifieds/views/list-classifieds.client.view.html'
		}).
		state('createClassified', {
			url: '/classifieds/create',
			templateUrl: 'modules/classifieds/views/create-classified.client.view.html'
		}).
		state('viewClassified', {
			url: '/classifieds/:classifiedId',
			templateUrl: 'modules/classifieds/views/view-classified.client.view.html'
		}).
		state('editClassified', {
			url: '/classifieds/:classifiedId/edit',
			templateUrl: 'modules/classifieds/views/edit-classified.client.view.html'
		}).
		state('manageClassified', {
			url: '/manage-classified',
			templateUrl: 'modules/classifieds/views/manage-classified.client.view.html'
		}).
		state('myClassified', {
			url: '/my-classified',
			templateUrl: 'modules/classifieds/views/my-classified.client.view.html'
		});
	}
]);
