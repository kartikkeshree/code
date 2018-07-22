'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		}).
		state('homePage', {
			url: '/home',
			templateUrl: 'modules/core/views/home.client.view.html'
		}).
        state('ourCompany', {
            url: '/our_company',
            templateUrl: 'modules/core/views/our_company.html'
        }).
        state('contactContact', {
            url: '/contact',
            templateUrl: 'modules/core/views/contact.html'
        }).
        state('termAndCondition', {
            url: '/termAndCondition',
            templateUrl: 'modules/core/views/terms-condition.client.view.html'
        }).state('signout', {
           url: '/signout',
          templateUrl: 'modules/core/views/home.logout.client.view.html'
       });
	}
]);
