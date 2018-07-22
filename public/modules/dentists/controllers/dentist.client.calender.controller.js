'use strict'

angular.module('dentists').controller('CalenderController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Dentist', 'Staff',
    function ($scope, $http, $stateParams, $location, Authentication, Dentist, Staff) {
        $scope.user = JSON.parse(Authentication.get('user'));
        $scope.dentist = JSON.parse(Dentist.get('dentist'));
        if (!$scope.user) {
            $location.path('/');
        }
        $http.post('/getAllAppointmentByDate', {doctor_id: $scope.dentist[0].id}).success(function (response) {
            $scope.data = response;
            $scope.values = [];
            for (var i = 0; i < $scope.data.length; i++) {
                var date = new Date($scope.data[i].app_time);
                var val = {
                    title: $scope.data[i].appointmentCnt + ' appointment Click for go to appointment ',
                    start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    url: '#!/appointmentByDate/' + date.getTime() + '/' + $scope.data[i].doctor_id
                }
                $scope.values.push(val);
            }
            jQuery(document).ready(function () {
                var date = new Date();
                var d = date.getDate();
                var m = date.getMonth();
                var y = date.getFullYear();

                var calendar = jQuery('#calendar').fullCalendar({
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month,agendaWeek,agendaDay'
                    },
                    buttonText: {
                        prev: '&laquo;',
                        next: '&raquo;',
                        prevYear: '&nbsp;&lt;&lt;&nbsp;',
                        nextYear: '&nbsp;&gt;&gt;&nbsp;',
                        today: 'today',
                        month: 'month',
                        week: 'week',
                        day: 'day'
                    },
                    selectable: true,
                    selectHelper: true,
                    editable: true,
                    events: $scope.values
                });
            });
            //console.log($('.fc-border-separate > thead > tr > th:first').width()); //returns width of first td//
            $('.fc-border-separate > thead > tr > th:last').width($('.fc-border-separate > thead > tr > th:first').width()); //Apply width of first td to last td//
        }).error(function (response) {

        });


    }
]);

angular.module('dentists').controller('CalenderAppController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Dentist', 'Staff',
    function ($scope, $http, $stateParams, $location, Authentication, Dentist, Staff) {

        $scope.find = function () {
            var searchVal = '';
            if ($scope.search != undefined) {
                searchVal = $scope.search.searchVal;
            }

            $http.post('/getAllAppointmentBySelectedDate', {date: $stateParams.date, doctor_id: $stateParams.doctor_id, searchVal: searchVal}).success(function (response) {
                $scope.appointments = response;
            }).error(function (response) {

            })
        }
    }
]);


