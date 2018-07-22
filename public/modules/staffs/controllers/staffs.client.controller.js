'use strict';

// Staffs controller
angular.module('staffs').controller('StaffsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Staffs', 'Dentist',
    function ($scope, $http, $stateParams, $location, Authentication, Staffs, Dentist) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.dentist = JSON.parse(Dentist.get('dentist'));

        if ($stateParams.staffId != undefined) {
            $scope.edit = true;
        } else {
            $scope.edit = undefined;
        }
        console.log($scope.edit);
        if ($scope.authentication == undefined)
            $location.path('/');
        //$scope.modulesAccessibilities = ["Campaign","Patient","Doctor"];

        var id = ($scope.dentist != null) ? $scope.dentist[0].id : '';
        $http.post('/clinicList', {doctor_id: id}).success(function (response) { //To fetch all area list
            $scope.clinics = response;
        }).error(function (response) {
            $scope.error = response.message;
        });
        // Create new Staff
        $scope.create = function () {
            if ($scope.staffUser != undefined) {
                if ($stateParams.staffId == undefined) {
                    $scope.staffUser.role_id = "3";
                    $scope.staffUser.created_by = $scope.authentication[0].id;
                    $scope.staffUser.doctor_id = $scope.dentist[0].id;
                    console.log($scope.staffUser);
                    $http.post('/auth/signup', $scope.staffUser).success(function (response) {
                        if (response.status == "false") {
                            $scope.error = response.desc[0];
                            console.log($scope.error);
                        } else {
                            alert("Staff added successfully");
                            history.back();
                        }

                    }).error(function (response) {
                        $scope.error = response.message[0];
                        $("html, body").animate({scrollTop: 0}, "slow");
                    });
                } else {
                    console.log($scope.staffUser.check);
                    $scope.staffUser.staff_id = $stateParams.staffId;
                    $http.post('/updateUserAndStaffModule', $scope.staffUser).success(function (response) {
                        if (response.status == "false") {
                            $scope.error = response.desc[0];
                            console.log($scope.error);
                            $("html, body").animate({scrollTop: 0}, "slow");
                        } else {
                            alert("Updated successfully");
                            history.back();
                        }

                    }).error(function (response) {
                        $scope.error = response[0];
                        $("html, body").animate({scrollTop: 0}, "slow");
                    });
                }
            }
        };

        // Remove existing Staff
        $scope.remove = function (staff) {
            if (staff) {
                staff.$remove();

                for (var i in $scope.staffs) {
                    if ($scope.staffs [i] === staff) {
                        $scope.staffs.splice(i, 1);
                    }
                }
            } else {
                $scope.staff.$remove(function () {
                    $location.path('staffs');
                });
            }
        };

        // Update existing Staff
        $scope.update = function () {
            var staff = $scope.staff;
            staff.$update(function () {
                $location.path('staffs/' + staff._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Staffs
        $scope.find = function () {
            console.log($stateParams.staffStatus)
            var searchVal = '';
            if ($scope.searchVal != undefined) {
                searchVal = $scope.searchVal;
            }
            $http.post('/staffByDentistId', {id: $scope.authentication[0].id, role_id: $scope.authentication[0].role_id, searchVal: searchVal, status: $stateParams.staffStatus}).success(function (response) {
                if (response.status == "false") {
                    $scope.error = response.desc[0];
                    console.log($scope.error);
                } else {
                    $scope.staffs = response;

                }
            }).error(function (response) {
                $scope.error = response[0];
            });

        };

        // Find existing Staff
        $scope.findOne = function () {
            if ($stateParams.staffId != undefined) {
                $scope.edit = true;
                $http.post('/staffByStaffId', {staff_id: $stateParams.staffId}).success(function (response) {
                    if (response.status == "false") {
                        $scope.error = response.desc[0];
                        console.log($scope.error);
                    } else {
                        $scope.staffUser = response[0];
                        var accessModule = $scope.staffUser.module_access.split(',');

                        $scope.staffUser.check = {};
                        for (var i = 0; i < accessModule.length; i++) {
                            if (accessModule[i] == 'Campaign') {
                                $scope.staffUser.check.check1 = "Campaign"
                            }
                            if (accessModule[i] == 'Patient') {
                                $scope.staffUser.check.check2 = "Patient";
                            }
                            if (accessModule[i] == 'Data') {
                                $scope.staffUser.check.check3 = "Data";
                            }
                            if (accessModule[i] == 'Appointment') {
                                $scope.staffUser.check.check4 = "Appointment";
                            }
                        }
                        /*$scope.staffUser.check = {};
                         $scope.staffUser.check.check1="Campaign";
                         $scope.staffUser.check.check2="Patient";
                         $scope.staffUser.check.check3="Data";
                         $scope.staffUser.check.check4="Appointment";*/

                    }
                    console.log($scope.accessModules1);
                }).error(function (response) {
                    $scope.error = response[0];
                });
            }
        };

        //change status
        $scope.changeStatus = function (staffVal, dStatus, index) {
            if (confirm((dStatus == 'Deleted') ? "Do you want to delete this staff" : "Do you want to change status")) {
                $http.post('/changeStaffStatus', {staff_id: staffVal, status: dStatus}).success(function (response) {
                    if (dStatus == 'Deleted') {
                        $scope.staffs.splice(index, 1);
                        alert('Deleted successfully');
                    } else {
                        alert('Updated successfully');
                    }
                    
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        };

        //get Staff Status
        $scope.findStaffStatus = function () {
            console.log('Staff');
            console.log($scope.authentication[0].id);
            $http.post('/getStaffStatus', {user_id: $scope.authentication[0].id}).success(function (response) {
                console.log(response);
                for (var i = 0; i < response.length; i++) {
                    if (response[i].status == 'Pending') {
                        $scope.staff_status_pending = response[i].status_cnt;
                        console.log($scope.clinic_status_pending);
                    } else if (response[i].status == 'Approved') {
                        $scope.staff_status_approved = response[i].status_cnt;
                    } else if (response[i].status == 'Deleted') {
                        $scope.staff_status_deleted = response[i].status_cnt;
                    } else if (response[i].status == 'Rejected') {
                        $scope.staff_status_rejected = response[i].status_cnt;
                    }
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        }

    }
]);
