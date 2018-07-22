'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
		state('activateAccount', {
			url: '/activateAccount',
			templateUrl: 'modules/users/views/authentication/activate-account.client.view.html'
		}).state('addNewMember', {
            url: '/addNewMember',
            templateUrl: 'modules/users/views/settings/add-member.client.view.html'
        }).state('editMember', {
            url: '/editMember/:user_id',
            templateUrl: 'modules/users/views/settings/add-member.client.view.html'
        }).state('listMember', {
           url: '/listMember',
           templateUrl: 'modules/users/views/settings/list-addedMember.client.view.html'
       });
	}
]);
/*
angular.module('users').run(function($rootScope, $location) {
    $rootScope.$watch('$routeChangeSuccess', function () {
        return $location.path();

    }, function(){
            console.log('every');
        }
    )
});*/
