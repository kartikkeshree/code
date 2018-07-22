'use strict';

//Setting up route
angular.module('knowledgebases').config(['$stateProvider',
	function($stateProvider,$httpProvider) {
		// Knowledgebases state routing
		$stateProvider.
		state('listKnowledgebases', {
			url: '/knowledgebases',
			templateUrl: 'modules/knowledgebases/views/list-knowledgebases.client.view.html'
		}).
		state('createKnowledgebase', {
			url: '/knowledgebases/create',
			templateUrl: 'modules/knowledgebases/views/create-knowledgebase.client.view.html'
		}).
		state('viewKnowledgebase', {
			url: '/knowledgebases/:knowledgebaseId',
			templateUrl: 'modules/knowledgebases/views/view-knowledgebase.client.view.html'
		}).
		state('editKnowledgebase', {
			url: '/knowledgebases/:knowledgebaseId/edit',
			templateUrl: 'modules/knowledgebases/views/edit-knowledgebase.client.view.html'
		}).state('listAdminKnowBase',{
		    url : '/listAdminKnowBase/:keyword',
		    templateUrl : 'modules/knowledgebases/views/list-knowledgebase-admin.client.view.html'
		}).state('knowledgeBaseForm',{
		    url : '/knowledgeBaseForm',
		    templateUrl :'modules/knowledgebases/views/knowledgebase-title-client.view.html'
		}).state('/listAllKnowledgeBase',{
            url : '/listAllKnowledgeBase',
            templateUrl : 'modules/knowledgebases/views/list-allKnowledgebases-admin.client.view.html'
        }).state('getAllKnowledgeBaseSort',{
            url : '/getAllKnowledgeBase/sort/:alphabet',
            templateUrl: 'modules/knowledgebases/views/list-knowledgebases.client.view.html'
        });
	}
]);
