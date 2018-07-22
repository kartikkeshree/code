/**
 * Created by Kartik}
 * on 2/19/2015.
 */
'use strict';

// Dentists controller
angular.module('dentists').controller('DentistAppointmentController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Dentist', 'Staff',
    function ($scope, $http, $stateParams, $location, Authentication, Dentist, Staff) {
        $scope.user = JSON.parse(Authentication.get('user'));
        $scope.dentist = JSON.parse(Dentist.get('dentist'));
        $scope.dt = new Date();
        /* Related to pagination */
        $scope.itemsPerPage = 10; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        $scope.appointments = [];
        $scope.pageVal = '';
        /* End */
        $scope.filterVal = '';
        //Get staff access module
        $scope.staffModule = JSON.parse(Staff.get('staff'));

        if ($scope.staffModule != undefined) {
            console.log($scope.staffModule[0].module_access);
            var modules = $scope.staffModule[0].module_access.split(',');
            $scope.allModules = [];
            for (var i = 0; i < modules.length; i++) {
                $scope.allModules.push(modules[i]);
                if (modules[i] == 'Data') {
                    $scope.dataVal = true;
                }
                if (modules[i] == 'Patient') {
                    $scope.patientVal = true;
                }

            }
            console.log($scope.allModules + "  " + $scope.patientVal + "  " + $scope.dataVal);
        }
        //end

        //to get all appointment for dentist
        $scope.find = function (searchVal, pageVal) {
            $scope.refer = {};
            //Pagination//
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = $scope.itemsPerPage;
            //End//
            var status = $stateParams.appointStatus;
            var clinic_id = '';
            var doctor_id = '';
            if ($scope.user[0].role_id == 3) {
                $scope.staff = JSON.parse(Staff.get('staff'));
                clinic_id = $scope.staff[0].clinicIds;
                doctor_id = $scope.staff[0].doctor_id;
            } else {
                doctor_id = $scope.dentist[0].id;
            }

            $http.post('/getAllUserAppointmentByDentistId', {doctor_id: doctor_id, date: '', searchVal: searchVal, clinic_id: clinic_id, page: page, status: $stateParams.appointStatus}).success(function (response) {

                if (response == 'err') {
                    $scope.appointments = [];
                } else {
                    $scope.appointments = response.data;
                    //To show the page count of pagination//
                    for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                        $scope.pagedItems.push(i);
                    }
                    //End//
                }
            }).error(function (response) {
                $scope.appointments = response;
            });
        }

        //After click on page number of pagination//
        $scope.setPage = function () {
            $scope.currentPage = this.n;
            $scope.find($scope.filterVal, $scope.currentPage);
        };
        //End//
        //After click on Previous Button of pagination//
        $scope.prevPage = function () {
            if (($scope.currentPage - 1) < 1)
                return false;
            $scope.currentPage += -1;
            $scope.find($scope.filterVal, $scope.currentPage);
        };
        //End//
        //After click on Next Button of pagination//
        $scope.nextPage = function () {
            if (($scope.currentPage + 1) > $scope.pagedItems.length)
                return false;
            $scope.currentPage += 1;
            $scope.find($scope.filterVal, $scope.currentPage);
        };
        //End//
        //Filter AppointMent
        $scope.appointmentFilter = function () {
            $scope.currentPage = 1;
            $scope.find($scope.filterVal, $scope.currentPage);
        };
        //reschedule appointment
        $scope.editAppointmentByAppId = function (app_id, app_time, clinic_id, user_id) {
            var date = new Date(app_time);
            $location.path('/appointments/create/' + date.getTime() + '/' + clinic_id).search('val', 'editDentist').search('user_id', user_id).search('app_Id', app_id).search('time', date.getTime());
        }

        $scope.deleteAppointmentByAppId = function (app_id, index) {
            var r = confirm('Are you sure to delete this appointment ?');
            if (r == true) {
                $http.post('/deleteBookedAppointmentsByAppId', {app_id: app_id}).success(function (response) {
                    if (response) {
                        $scope.appointments.splice(index, 1);
                        alert(response.message);
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        }

        //
        $scope.findTodayAppointments = function () {
            $scope.refer = {};
            if ($scope.dentist != undefined) {
                var searchVal = '';
                if ($scope.search != undefined) {
                    searchVal = $scope.search.val;
                }
                $http.post('/getAllUserAppointmentByDentistId', {doctor_id: $scope.dentist[0].id, date: new Date(), searchVal: searchVal}).success(function (response) {
                    if (response == 'err') {
                        $scope.appointments = [];
                    } else {
                        $scope.appointments = response.data;
                    }
                }).error(function (response) {
                    $scope.appointments = response;
                });
            }
        }

        //update AppointMent Status
        $scope.updateAppointMentStatus = function (appt) {
            console.log(appt);
            if (appt.status != "") {
                var r = confirm('Are you sure to update status ?');
                if (r == true) {
                    $http.post('/updateAppointmentNotes', {app_id: appt.app_id, status: appt.status}).success(function (response) {
                        console.log(response);
                        alert('You successfully Update status');
                    }).error(function (response) {

                    });
                }
            }
        }

        $scope.editPatient = function (app_id, user_id) {
            $location.path('/editPatient').search('val', 'edit').search('app_id', app_id).search('user_id', user_id);
        }


        //to get appointment status
        $scope.findAppointmentStatus = function () {
            //console.log('appoint');
            $scope.appointments_status = [];
            //console.log($scope.user[0].id);
            $http.post('/getAppointmentStatus', {user_id: $scope.user[0].id}).success(function (response) {
                console.log(response);
                //$scope.appointments_status=response;
                for (var i = 0; i < response.length; i++) {
                    if (response[i].status == 'Pending') {
                        $scope.appointments_status_pending = response[i].status_cnt;
                        console.log($scope.appointments_status_pending);
                    } else if (response[i].status == 'Approved') {
                        $scope.appointments_status_Approved = response[i].status_cnt;
                    } else if (response[i].status == 'Deleted') {
                        $scope.appointments_status_Deleted = response[i].status_cnt;
                    } else if (response[i].status == 'Completed') {
                        $scope.appointments_status_Completed = response[i].status_cnt;
                    } else if (response[i].status == 'Rejected') {
                        $scope.appointments_status_Rejected = response[i].status_cnt;
                    } else if (response[i].status == 'Visited') {
                        $scope.appointments_status_Visited = response[i].status_cnt;
                    }
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        }

        $scope.setDentistData = function (patientId, sText, attempt) {
            var Doctors = [];
            $scope.refer.patient = patientId;
            $http.post('/referDoctorList', {doctor: $scope.user[0].id, searchText: sText}).success(function (response) {
                for (var a in response)
                {
                    Doctors.push({label: response[a].first_name + ' ' + response[a].last_name, value: response[a].id});
                }
                $('#tbCountries').autocomplete({
                    source: Doctors,
                    minLength: 0,
                    scroll: true,
                    select: function (e, ui) {
                        $('#tbCountries').attr('value', ui.item.label);
                        $scope.refer.referTo = ui.item.value;
                        return false;
                    }
                }).focus(function () {
                    $(this).autocomplete("search", "");
                }).keyup(function (e) {
                    if (attempt != 'second')
                    {
                        $scope.setDentistData(patientId, this.value, 'second');
                    }
                })
            }).error(function (response) {
                $scope.msg = response;
            });
        }

        $scope.referToDoctor = function () {
            if ($scope.refer) {
                $('#loader-container').show();
                $scope.refer.referFrom = $scope.user[0].id;
                $http.post('/referToDoctor', $scope.refer).success(function (response) {
                    $('#loader-container').hide();
                    $scope.refer = {};
                    $scope.msg = 'Message sent successfully to patient'
                }).error(function (response) {
                    $('#loader-container').hide();
                    $scope.msg = response.message[0];
                });
            } else {
                $scope.msg = 'Please fill all required fields.'
            }
        }
    }
]);
