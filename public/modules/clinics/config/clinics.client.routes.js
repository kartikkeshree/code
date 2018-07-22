'use strict';

//Setting up route
angular.module('clinics').config(['$stateProvider',
	function($stateProvider) {
		// Clinics state routing
		$stateProvider.
		state('listClinics', {
			url: '/clinics',
			templateUrl: 'modules/clinics/views/list-clinics.client.view.html'
		}).
		state('listClinicsStatus', {
			url: '/clinics/status/:clinicStatus',
			templateUrl: 'modules/clinics/views/list-clinics.client.view.html'
		}).
		state('createClinic', {
			url: '/clinics/create',
			templateUrl: 'modules/clinics/views/create-clinic.client.view.html'
		}).
		state('viewClinic', {
			url: '/clinics/:clinicId',
			templateUrl: 'modules/clinics/views/view-clinic.client.view.html'
		}).
		state('editClinic', {
			url: '/clinics/:clinicId/edit',
			templateUrl: 'modules/clinics/views/create-clinic.client.view.html' //edit-clinic.client.view.html'
		}).
		state('editClinicTiming', {
			url: '/clinics/:clinicId/editTiming',
			templateUrl: 'modules/clinics/views/edit-clinic-timing.client.view.html' //edit-clinic.client.view.html'
		});
	}
]);

