'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$http', '$location', 'Authentication', 'Dentist', 'Staff', 'socket',
    function ($scope, $http, $location, Authentication, Dentist, Staff, socket) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.staffModule = JSON.parse(Staff.get('staff'));
        /* $(window).unload(function(){
         localStorage.clear();
         });*/
        if ($scope.staffModule != undefined) {
            console.log($scope.staffModule[0].module_access);
            var modules = $scope.staffModule[0].module_access.split(',');
            $scope.allModules = [];
            for (var i = 0; i < modules.length; i++) {
                if (modules[i] == 'Campaign') {
                    $scope.val = 'Campaign';
                    $scope.campVal = true;
                } else if (modules[i] == 'Appointment') {
                    $scope.val = 'dentistAppointmentList';
                    $scope.appVal = true;
                } else if (modules[i] == 'Patient') {
                    $scope.val = 'listPatient';
                    $scope.patVal = true;
                } else if (modules[i] == 'Data') {
                    $scope.val = 'listPatient';
                    $scope.datVal = true;
                }
            }
            console.log($scope.allModules)
        }
        $scope.signOut = function () {
            socket.disconnect();
            Authentication.destroy('user');
            Dentist.destroy('dentist');
            Staff.destroy('staff');
            location.reload();

        };

        $scope.toggleManage = function (event) {
            $(event.target).parent().toggleClass('active');
            $(event.target).next().toggle('slow');
        };
        $scope.toggleManage2 = function (event) {
            $(event.target).parent().toggleClass('active');
        };
    }


]);
