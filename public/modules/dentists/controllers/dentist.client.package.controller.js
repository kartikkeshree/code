'use strict';

angular.module('dentists').controller('PackageController', ['$scope', '$http', 'Authentication', 'Dentist',
    function ($scope, $http, Authentication, Dentist) {


        $scope.user = JSON.parse(Authentication.get('user'));
        $scope.dentist = JSON.parse(Dentist.get('dentist'));


        var curDate = new Date();
        $('#package-start-date')
                .datepicker({
                    inline: true,
                    dateFormat: "m/dd/yy",
                    minDate: curDate,
                    onSelect: function () {
                        var appDate = $(this).val();
                        $scope.created_date = appDate;
                    }
                })
                .datepicker('setDate', curDate);
        $('#datepicker1')
                .datepicker({
                    inline: true,
                    dateFormat: "m/dd/yy",
                    minDate: curDate,
                    onSelect: function () {
                        var appDate = $(this).val();
                        $scope.end_date = appDate;
                    }
                })
                .datepicker('setDate', curDate);


        $scope.find = function () {
            var doctor_id = 0;
            var searchVal = '';
            if ($scope.user[0].role_id == 2) {
                doctor_id = $scope.dentist[0].id
            }
            if ($scope.search) {
                searchVal = $scope.search.searchVal;
            }
            $http.post('/getAllPackageByDentist', {doctor_id: doctor_id, searchVal: searchVal}).success(function (response) {
                $scope.packages = response;
            }).error(function (response) {

            })
        }

        $scope.smsPackageRequest = function () {
            if ($scope.packages) {
                $scope.packages.doctor_id = $scope.dentist[0].id;
                $scope.packages.end_date = $scope.end_date;
                $scope.packages.start_date = $scope.created_date;

                $http.post('/smsPackageRequest', $scope.packages).success(function (response) {
                    /*$scope.packages = response;*/
                    alert('Request sent successfully');
					$scope.packages.end_date = ''
					$scope.packages.start_date = ''
					$scope.packages.allocated = ''
                }).error(function (response) {
                    $scope.error = response.message[0];
                });
            } else {
                $scope.error = "Please fill all required fields";
            }
        }

        $scope.changePackageStatus = function (id, status) {
            console.log(id + ' ' + status);
            var r = confirm('Are you sure change status to Approve.');
            if (r == true) {
                $http.post('/changePackageStatus', {id: id, status: status}).success(function (response) {
                    /*$scope.packages = response;*/
                    alert('Status changed successfully.');
                    location.reload();
                }).error(function (response) {

                });
            }
        }


    }
]);
/*angular.module('dentists').controller('PackageController', ['$scope', '$http','$stateParams', '$location', 'Authentication', 'Dentist','Staff',
 function($scope,$http, $stateParams, $location,Authentication, Dentist,Staff) {
 
 $scope.find() = function() {
 $http.post('/getAllPackageByDentist').success(function(response){
 $scope.packages = response;
 }).error(function(response){
 
 })
 }
 
 }
 ]);*/
