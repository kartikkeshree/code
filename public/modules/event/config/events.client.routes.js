'use strict';

//Setting up route
angular.module('events').config(['$stateProvider',
    function ($stateProvider) {
        // Events state routing
        $stateProvider.
                state('listEvents', {
                    url: '/events',
                    templateUrl: 'modules/event/views/events.client.view.html'
                }).
                state('myEvents', {
                    url: '/listEvents',
                    templateUrl: 'modules/event/views/list-event.client.view.html'
                }).
                state('createEvents', {
                    url: '/listEvents/create',
                    templateUrl: 'modules/event/views/create-event.client.view.html'
                }).
                state('editEvents', {
                    url: '/events/:eventId/edit',
                    templateUrl: 'modules/event/views/create-event.client.view.html'
                }).
                state('viewEvents', {
                    url: '/events/:eventId',
                    templateUrl: 'modules/event/views/view-event.client.view.html'
                });
    }
]);
