'use strict';

//Setting up route
angular.module('dentists', ['angularFileUpload']).config(['$stateProvider',
    function ($stateProvider) {
        // Dentists state routing
        $stateProvider.
                state('listDentists', {
                    url: '/dentists',
                    templateUrl: 'modules/dentists/views/list-dentists.client.view.html'
                }).
                state('listDentistStatus', {
                    url: '/dentists/status/:dentistStatus',
                    templateUrl: 'modules/dentists/views/list-dentists.client.view.html'
                }).
                state('createDentist', {
                    url: '/dentists/create',
                    templateUrl: 'modules/dentists/views/create-dentist.client.view.html'
                }).
                state('viewDentist', {
                    url: '/dentistDetail/:dentistId',
                    templateUrl: 'modules/dentists/views/view-dentist.client.view.html'
                }).
                state('editDentist', {
                    url: '/dentists/:dentistId/edit',
                    templateUrl: 'modules/dentists/views/edit-dentist.client.view.html'
                }).
                state('signUpDentist', {
                    url: '/signUpDentist',
                    templateUrl: 'modules/dentists/views/signup.dentist.client.view.html'
                }).
                state('dentistHome', {
                    url: '/dentistHome',
                    templateUrl: 'modules/dentists/views/dentist_home.client.view.html'
                }).
                state('dentistList', {
                    url: '/dentistList/',
                    templateUrl: 'modules/dentists/views/dentist_list.client.view.html'
                }).
                state('dentistListParam', {
                    url: '/dentistList/:category/:speciality/:dentistClinic/:area/:exp/',
                    templateUrl: 'modules/dentists/views/dentist_list.client.view.html'
                }).
                state('dentistListParamWithLatLong', {
                    url: '/dentistList/:category/:speciality/:dentistClinic/:area/:exp/:latitude/:longitude/',
                    templateUrl: 'modules/dentists/views/dentist_list.client.view.html'
                }).
                state('dentistListWithLatLong', {
                    url: '/dentistList/:latitude/:longitude/',
                    templateUrl: 'modules/dentists/views/dentist_list.client.view.html'
                }).
                state('dentistAppointmentList', {
                    url: '/dentistAppointmentList',
                    templateUrl: 'modules/dentists/views/dentist_appointment_list.client.view.html'
                }).
                state('dentistAppointmentListStatus', {
                    url: '/dentistAppointmentList/status/:appointStatus',
                    templateUrl: 'modules/dentists/views/dentist_appointment_list.client.view.html'
                }).
                state('testFile', {
                    url: '/testFile',
                    templateUrl: 'modules/dentists/views/test-file.html'
                }).
                state('listPatient', {
                    url: '/listPatient',
                    templateUrl: 'modules/dentists/views/list_patient.client.view.html'
                }).
                state('addPatient', {
                    url: '/addPatient',
                    templateUrl: 'modules/dentists/views/dentist_add_patient.client.view.html'
                }).
                state('editPatient', {
                    url: '/editPatient',
                    templateUrl: 'modules/dentists/views/dentist_add_patient.client.view.html'
                }).
                state('viewPatientInfo', {
                    url: '/viewPatientInfo/:user_id/:app_id/:clinic_id',
                    templateUrl: 'modules/dentists/views/view_patient_info.client.view.html'
                }).
                state('viewProfile', {
                    url: '/viewProfile/:user_id',
                    templateUrl: 'modules/dentists/views/view-profile.client.html'
                }).
                state('dashboard', {
                    url: '/dashboard',
                    templateUrl: 'modules/dentists/views/dentist_dashboard.client.view.html'
                }).
                state('notification', {
                    url: '/homeNotification',
                    templateUrl: 'modules/dentists/views/home-notification.client.view.html'
                }).
                state('calender', {
                    url: '/calender',
                    templateUrl: 'modules/dentists/views/dentist-calender.client.view.html'
                }).
                state('/appointmentByDate', {
                    url: '/appointmentByDate/:date/:doctor_id',
                    templateUrl: 'modules/dentists/views/dentist-appointment-bydate.client.view.html'
                }).
                state('/campaignList', {
                    url: '/campaignList',
                    templateUrl: 'modules/dentists/views/campaign-list.client.view.html'
                }).
				state('/StaffcampaignList', {
                    url: '/Campaign',
                    templateUrl: 'modules/dentists/views/campaign-list.client.view.html'
                }).
                state('/addCampaign', {
                    url: '/addCampaign',
                    templateUrl: 'modules/dentists/views/campaign-add.client.view.html'
                }).
                state('/package', {
                    url: '/package',
                    templateUrl: 'modules/dentists/views/dentist-list-packages.client.view.html'
                }).
                state('/packageRequest', {
                    url: '/packageRequest',
                    templateUrl: 'modules/dentists/views/sms-package-request.client.view.html'

                }).
                state('/allStatus', {
                    url: '/allStatus',
                    templateUrl: 'modules/dentists/views/view-status.client.view.html'
                }).
                state('/allAdminStatus', {
                    url: '/allAdminStatus',
                    templateUrl: 'modules/dentists/views/admin-view-status.client.view.html'
                });

    }
]);
