
/**
 * Created by Kartik on 2/20/2015.
 */
if (duser == "") {
    var duser = "";
}
angular.module('dentists').controller('PatientController', ['$scope', '$http', '$stateParams', '$location', '$upload', 'Authentication', 'Dentist', 'GetPatient', 'Staff',
    function ($scope, $http, $stateParams, $location, $upload, Authentication, Dentist, GetPatient, Staff) {
        $scope.user = JSON.parse(Authentication.get('user'));
        $scope.dentist = JSON.parse(Dentist.get('dentist'));
        /* Related to pagination */
        $scope.itemsPerPage = 10; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        //$scope.patients = [];
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

        $scope.notes = [];
        $scope.appts = [];
        $scope.editPatAppt = false;

        //for birth year month and date
        $scope.years = []
        $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        $scope.dates = [];
        var dt = new Date();
        var startYear = 1960;
        var diffYear = dt.getFullYear() - startYear - 5;
        for (var i = 0; i < diffYear; i++) {
            $scope.years.push(startYear);
            startYear++;
        }
        for (var i = 1; i < 32; i++) {
            $scope.dates.push(i);
        }


        //Initiate datepicker
        var curDate = new Date();
        var endDate = new Date(new Date(curDate).setMonth(curDate.getMonth() + 3));
        $('#appointmentDate')
                .datepicker({
                    inline: true,
                    dateFormat: "m/dd/yy",
                    minDate: curDate,
                    maxDate: endDate,
                    onSelect: function () {
                        var appDate = $(this).val();
                        if ($scope.duser != undefined) {
                            $scope.duser.app_date = $(this).val();
                        } else {
                            $scope.app_date = $(this).val();
                        }
                        $scope.getAvailableAppointmentsTime();
                    }
                })
                .datepicker('setDate', curDate);
        $('#appointment-date2')
                .datepicker({
                    inline: true,
                    dateFormat: "m/dd/yy",
                    minDate: curDate,
                    maxDate: endDate,
                    onSelect: function () {
                        var appDate = $(this).val();
                        if ($scope.newAppt != undefined) {
                            $scope.newAppt.app_date = $(this).val();
                        } else {
                            $scope.app_date = $(this).val();
                        }
                        $scope.getAvailableAppointmentsTime();
                    }
                })
                .datepicker('setDate', curDate);
        $scope.clearData = function () {
            $scope.editPatAppt = false;
            $scope.msg = undefined;
            $scope.newAppt = [];
            $scope.times = [];
        }
        $http.post('/areaList').success(function (response) { //To fetch all area list
            $scope.areaList = response;
        }).error(function (response) {
            $scope.error = response.message;
        });

        //get clinic list by dentist id
        var id = ($scope.dentist != null) ? $scope.dentist[0].id : '';
        $http.post('/clinicList', {doctor_id: id}).success(function (response) { //To fetch all area list
            $scope.clinics = response;
        }).error(function (response) {
            $scope.error = response.message;
        });

        $scope.getAvailableAppointmentsTime = function () {
            $scope.appErr = '';
            $scope.wait = 'Please wait...';
            var clinic_id;
            var date;
            if ($stateParams.clinic_id == undefined) {
                $scope.apptSuccess = false;
                $scope.appErr = 'Please select clinic';
                if ($scope.duser == undefined) {
                    date = $scope.app_date;
                    console.log("iff getAvailableAppointmentsTime" + date);
                } else {
                    clinic_id = $scope.duser.clinic_id;
                    date = $scope.duser.app_date
                    console.log("else getAvailableAppointmentsTime" + date);
                }

            } else {
                clinic_id = $stateParams.clinic_id;
                if ($scope.newAppt == undefined) {
                    date = $scope.app_date;
                } else {
                    date = $scope.newAppt.app_date;
                }
            }
            $http.post('/getAvailableAppointmentsTime', {clinic_id: clinic_id, date: date}).success(function (response) { //To fetch all area list
                console.log()
                if (response.message != undefined) {
                    $scope.appErr = response.message;
                    $scope.times = [];
                    // alert(response.message);
                    $scope.wait = '';
                }
                if (response.length == 0) {
                    $scope.appErr = 'Please select valid date';
                    $scope.times = [];
                    // alert(response.message);
                    $scope.wait = '';
                }

                if (response[0] != undefined) {
                    $scope.appErr = ''
                    $scope.times = [];
                    for (var i = 0; i < response.length; i++) {
                        var dt = new Date(Date.parse(response[i].dt));
                        console.log(dt.getTime());
                        /*if(i==0) {
                         $scope.duser.appTime = dt;
                         }*/
                        $scope.times.push({dt: dt});
                        $scope.appErr = '';

                    }
                    $scope.wait = '';

                }


            }).error(function (response) {
                $scope.error = response.message;
            });
        }

        $scope.find = function (searchVal, pageVal) {
            $scope.refer = {};
            //Pagination//
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = $scope.itemsPerPage;
            //End//		

            //var searchVal='';
            //if($scope.search!=undefined){
            searchVal = (searchVal && typeof searchVal != 'undefined') ? searchVal : $scope.filterVal;
            //}
            var id = ($scope.dentist != null) ? $scope.dentist[0].id : '';
            var clinic_id = '';
            if ($scope.user[0].role_id == 3) {
                $scope.staffData = JSON.parse(Staff.get('staff'));
                clinic_id = $scope.staffData[0].clinicIds;
                id = $scope.staffData[0].doctor_id;
            }
			
            $http.post('/getPatientByDentistId', {doctor_id: id, searchVal: searchVal, role_id: $scope.user[0].role_id, clinic_id: clinic_id, page: page}).success(function (response) {
                if (response == 'err') {
                    $scope.patients = [];
                } else {
                    $scope.patients = response.data;
                    //To show the page count of pagination//
                    for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                        $scope.pagedItems.push(i);
                    }
                    //End//
                }
            }).error(function (response) {
                $scope.patients = response;
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
        $scope.patientFilter = function () {
            $scope.currentPage = 1;
            $scope.find($scope.filterVal);
        };
        //add a user and create an appointment
        $scope.addUserWithAppointment = function () {
            if ($scope.duser) {
                $scope.duser.created_by = $scope.user[0].id;
                $scope.duser.birth_date = (parseInt($scope.duser.month) + 1) + '/' + $scope.duser.date + '/' + $scope.duser.year;

                if ($scope.duser.app_date == undefined) {
                    $scope.duser.app_date = $scope.app_date;
                }
                $http.post('/addUserBYDentist', $scope.duser).success(function (response) {
                    if (response == 'err') {
                        $scope.patients = [];
                    } else {
                        alert("User added successfully");
                        $location.path('/listPatient');
                    }
                }).error(function (response) {
                    var res = JSON.parse(JSON.stringify(response));
                    $scope.error = (typeof res.message == 'string') ? res.message : res.message[0];
                    $("html, body").animate({scrollTop: 0}, "slow");
                });

            } else {
                $scope.error = 'please fill all required fields';
                $("html, body").animate({scrollTop: 0}, "slow");
            }
        }

        $scope.editPatient = function (app_id, user_id) {
            $location.path('/editPatient').search('val', 'edit').search('app_id', app_id).search('user_id', user_id);
        }

        $scope.findone = function () {
            $scope.val = $location.search().val;
            if ($scope.val == 'edit') {
                var app_id = '';
                if ($stateParams.app_id != undefined) {
                    app_id = $stateParams.app_id;
                } else if ($location.search().app_id != undefined) {
                    app_id = $location.search().app_id;
                } else {
                    app_id = '';
                }
                $scope.times = [];
                $http.post('/getPatientDetailByAppId', {app_id: app_id, user_id: $location.search().user_id}).success(function (response) {
                    if (response == 'err') {
                        $scope.duser = '';
                    } else {
                        console.log(response);
                        if (response[0] != undefined) {
                            $scope.duser = response[0];
                            var date = new Date(Date.parse($scope.duser.app_time));

                            delete $scope.duser.app_time;
                            if (date.toString() != 'Invalid Date') {
                                $scope.duser.app_date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
                            } else {
                                $scope.duser.app_date = '';
                            }

                            var b_date = new Date(Date.parse($scope.duser.birth_date));
                            console.log(b_date);
                            if (b_date.toString() != 'Invalid Date') {
                                $scope.duser.birth_date = b_date.getMonth() + 1 + '/' + b_date.getDate() + '/' + b_date.getFullYear();

                                $scope.duser.month = (parseInt(b_date.getMonth()));
                                $scope.duser.year = b_date.getFullYear();
                                $scope.duser.date = b_date.getDate();
                            }
                            console.log($scope.duser.month);
                            $scope.duser.appTime = date;
                            if ($location.search().app_id) {
                                $scope.times.push({dt: date});
                                $http.post('/getAvailableAppointmentsTime', {clinic_id: $scope.duser.clinic_id, date: date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear()}).success(function (response1) { //To fetch all area list
                                    if (response1[0] != undefined) {
                                        for (var i = 0; i < response1.length; i++) {
                                            var dt = new Date(Date.parse(response1[i].dt));
                                            $scope.times.push({dt: dt});
                                        }
                                    }

                                }).error(function (response) {
                                    $scope.error = response.message;
                                });
                            } else {

                            }
                            console.log($scope.duser);
                            $scope.app1 = {clinical_note: $scope.duser.clinical_note,
                                perception: $scope.duser.perception, app_id: $scope.duser.app_id};
                            var displayFile = [];
                            if ($scope.duser.display_file_name != undefined || $scope.duser.display_file_name != '' && $scope.duser.display_file_name != null)
                            {
                                displayFile = $scope.duser.display_file_name.split(',');
                                console.log(displayFile);
                            }

                            $scope.notes.push(
                                    {
                                        clinical_note: $scope.duser.clinical_note,
                                        perception: $scope.duser.perception,
                                        updated_date: new Date(Date.parse($scope.duser.updated_date)),
                                        app_time: date,
                                        app_id: $scope.duser.app_id
                                    }
                            );
                            $scope.appts.push(
                                    {
                                        app_time: $scope.duser.appTime,
                                        status: $scope.duser.status,
                                        appt_id: $scope.duser.app_id,
                                        fileNames: displayFile,
                                        url: $scope.duser.report_url,
                                        reason:$scope.duser.reason
                                    }
                            )

                        }
                    }
                }).error(function (response) {
                    $scope.duser = response;
                });
            }
        }

        //update user with appointment
        $scope.updateUserWithAppointment = function () {

            $scope.duser.birth_date = (parseInt($scope.duser.month) + 1) + '/' + $scope.duser.date + '/' + $scope.duser.year;
            delete $scope.duser.month;
            delete $scope.duser.year;
            delete $scope.duser.date;
            $http.post('/updatePatientDetailByAppId', $scope.duser).success(function (response) {
                if (response == 'err') {
                    console.log(response);
                } else {
                    alert("User updated successfully");
                    window.history.back();
                }
            }).error(function (response) {
                //var res = JSON.parse(JSON.stringify(response));
                $scope.error = response.message[0];
                $("html, body").animate({scrollTop: 0}, "slow");
            });
        }

        //get appointment data with parent id's
        $scope.getAppoinmentData = function () {
            $http.post('/getAppoinmentData', {app_id: $stateParams.app_id}).success(function (response) {
                /* $scope.notes.push(response);*/

                for (var a in response) {
                    $scope.notes.updated_date = new Date(Date.parse(response[a].updated_date));
                    $scope.notes.push(response[a]);
                    console.log()
                    var displayFile = []
                    if (response[a].display_file_name != null)
                    {
                        displayFile = response[a].display_file_name.split(',');
                    }
                    var data = {
                        app_time: response[a].app_time,
                        status: response[a].status,
                        appt_id: response[a].app_id,
                        fileNames: displayFile,
                        url: response[a].report_url
                    }

                    $scope.appts.push(data);
                    console.log($scope.appts);
                }
            }).error(function (response) {
                $scope.patients = response;
            });
        }

        //get Notes
        $scope.getNotes = function (notes, index, event) {
            console.log(index);
            console.log($scope.notes[index]);
            $scope.app1 = $scope.notes[index];
            $(".taglist").find('li').each(function () {
                $(this).removeClass("active");
            });
            $(event.target).parent().addClass('active');
            console.log($scope.app1);
        }

        //update Appointments Notes perception
        $scope.updateAppointmentNote = function () {
            var data = {
                clinical_note: $scope.app1.clinical_note,
                perception: $scope.app1.perception,
                app_id: $scope.app1.app_id,
                status: 'Pending'
            }

            $http.post('/updateAppointmentNotes', data).success(function (response) {
                $scope.app = response;
                alert("update successfully");
                console.log(response);
            }).error(function (response) {
                $scope.patients = response;
            });
        }

        //book next appointment for same user
        $scope.bookAppointmentForSameUser = function () {
            
            var dt1 = '';
            var dt3 = '';
            console.log($scope.app_date);
            if ($scope.newAppt == undefined) {
                dt1 = $scope.app_date.split('/');
                dt3 = $scope.app_date;
            } else {
                dt1 = $scope.app_date.split('/');
                dt3 = $scope.app_date;
            }

            var dt2 = $scope.newAppt.appTime.split(':');
            //year, month, day, hours, minutes, seconds, milliseconds
            // 4/25/2015
            var date = new Date(dt1[2], (dt1[0] - 1), dt1[1], dt2[0], dt2[1]);
            var data = {
                //parent_appId: $stateParams.app_id,
                clinic_id: $stateParams.clinic_id,
                user_id: $stateParams.user_id,
                app_date: dt3,
                appTime: $scope.newAppt.appTime,
                created_by: $scope.user[0].id,
                status: 'Pending',
                reason: $scope.newAppt.reason
            }
            $http.post('/bookNextAppointmentSameUser', data).success(function (response) {
                $scope.app = response;
                console.log(response);
                $scope.msg = 'Well done! You successfully Scheduled Next Appointment. Book another or close this.'
//                $scope.notes.push(
//                        {
//                            clinical_note: "",
//                            perception: "",
//                            updated_date: new Date(),
//                            app_time: date,
//                            app_id: response.app_id
//                        }
//                );
//                $scope.appts.push(
//                        {
//                            app_time: date,
//                            status: 'Pending',
//                            appt_id: response.app_id,
//                            fileNames: [],
//                            url: ''
//                        }
//                )
                console.log($scope.notes);
                console.log($scope.appts);
            }).error(function (response) {
                $scope.patients = response;
            });

        }

        //update Reason
        $scope.updateReason = function () {
            var data = {
                app_id: $stateParams.app_id,
                reason: $scope.duser.reason
            }
            $http.post('/updateAppointmentNotes', data).success(function (response) {
                console.log(response);
            }).error(function (response) {
                $scope.patients = response;
            });

        }

        //delete Appointment
        $scope.deleteAppointment = function (notes, index) {
            var r = confirm('Are you sure to delete this appointment ?');
            if (r == true) {
                var app_id = '';
                if (notes.appt_id) {
                    app_id = notes.appt_id;
                } else {
                    app_id = notes[index].app_id
                }
                var data = {
                    app_id: app_id,
                    status: 'deleted'
                }
                console.log(data);
                $http.post('/updateAppointmentNotes', data).success(function (response) {
                    console.log(response);
                    $scope.notes.splice(index, 1);
                    $scope.appts.splice(index, 1);
                }).error(function (response) {
                    $scope.patients = response;
                });
            }
        }

        //delete AppointMent With Parent AppId
        $scope.deleteAppointMentWithParentAppId = function (app_id, index, user_id) {
            if (app_id != undefined) {
                var r = confirm('Are you sure to delete this user ?');
                if (r == true) {
                    var data = {
                        app_id: app_id,
                        user_id: user_id
                    }
                    $http.post('/deleteAppointMentWithParentAppId', data).success(function (response) {
                        alert("Patient deleted successfully..!");
                        $scope.patients.splice(index, 1);
                    }).error(function (response) {
                        $scope.patients = response;
                    });
                }
            } else {
                alert("There is no appointment for this user");
            }
        }

        //on click of edit appointments
        $scope.editPatientAppointment = function (appt, index) {
            $scope.msg = undefined;
            $scope.times = [];
            $scope.editPatAppt = true;
            $scope.filename = appt.fileNames;
            $scope.url = appt.url;
            var dt = new Date(Date.parse(appt.app_time));
            $scope.newAppt = {app_date: (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear(), appTime: dt, app_id: appt.appt_id, index: index,reason:appt.reason};
            $scope.times.push({dt: dt});
            $http.post('/getAvailableAppointmentsTime', {clinic_id: $stateParams.clinic_id, date: dt.getMonth() + 1 + '/' + dt.getDate() + '/' + dt.getFullYear()}).success(function (response1) { //To fetch all area list
                if (response1[0] != undefined) {
                    for (var i = 0; i < response1.length; i++) {
                        var dt = new Date(Date.parse(response1[i].dt));
                        $scope.times.push({dt: dt});
                    }
                }

            }).error(function (response) {
                $scope.error = response.message;
            });

        }

        //update Appointment For SameUser
        $scope.updateAppointmentForSameUser = function () {
            var sqlDate = "";
            var dt = new Date(Date.parse($scope.newAppt.appTime));
            var selectedDate = $scope.newAppt.app_date.split('/');
            var date = '';
            console.log(dt);
            if (dt == 'Invalid Date') {
                sqlDate = selectedDate[2] + '-' + selectedDate[0] + '-' + selectedDate[1] + ' ' + $scope.newAppt.appTime;
                var time = $scope.newAppt.appTime.split(':')
                date = new Date(selectedDate[2], (selectedDate[0] - 1), selectedDate[1], time[0], time[1]);
            } else {
                sqlDate = selectedDate[2] + '-' + selectedDate[0] + '-' + selectedDate[1] + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
                date = dt;
            }
            var r = confirm('Are you sure to update this appointment ?');
            if (r == true) {
                var data = {
                    app_id: $scope.newAppt.app_id,
                    app_time: sqlDate,
                    reason:$scope.newAppt.reason
                }

                $http.post('/updateAppointmentNotes', data).success(function (response) {
                    console.log(response);
                    $scope.msg = 'Well done! You successfully Update Appointment'
                    //$scope.newAppt={app_date:appt.app_time.getMonth()+'/'+appt.app_time.getDate()+'/'+appt.app_time.getFullYear(),appTime:appt.app_time,app_id:appt.appt_id};
                    var data = {
                        app_time: date,
                        status: 'pending',
                        appt_id: $scope.newAppt.appt_id,
                        fileNames: $scope.filename,
                        url: $scope.url
                    }
                    $scope.appts.splice($scope.newAppt.index, 1);
                    $scope.appts.splice($scope.newAppt.index, 0, data);
                    $scope.editPatAppt = false;
                    /* $scope.appts.app_time=date;
                     $scope.appts.status='pending';
                     $scope.appts.appt_id=$scope.newAppt.appt_id;*/



                }).error(function (response) {
                });
            }
        }

        //update AppointMent Status
        $scope.updateAppointMentStatus = function (appt) {
            console.log(appt);
            var r = confirm('Are you sure to update status ?');
            if (r == true) {
                $http.post('/updateAppointmentNotes', {app_id: appt.appt_id, status: appt.status}).success(function (response) {
                    console.log(response);
                    alert('You successfully Update status');
                }).error(function (response) {

                });
            }
        }

        //on click of upload report
        $scope.uploadPatientReport = function (appt, index) {
            $scope.msg = undefined;
            $scope.appointmentId = appt.appt_id;
        }


        $scope.uploadReport = function (files) {
            $scope.msg = undefined;
            $scope.tmpReportFileNames = [];
            $scope.filesReport = [];
            $scope.filesReportName = [];
            for (var i = 0; i < files.length; i++) {
                console.log(files[i].name);
                $scope.filesReport.push(files[i]);
                $scope.filesReportName.push(files[i].name);
                //To get GUID
                var fileName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                $scope.tmpReportFileNames.push(fileName);
            }
        };

        $scope.uploadReportToDataBase = function () {
            //To Save uploaded Report
            $scope.msg = undefined;
            console.log($scope.duser.first_name);
            if ($scope.filesReportName != undefined) {
                console.log($scope.filesReportName);
                $scope.upload = $upload.upload({
                    url: '/uploadReportToDataBase',
                    method: 'POST',
                    file: $scope.filesReport,
                    data: {files: $scope.tmpReportFileNames, app_id: $scope.appointmentId, name: $scope.duser.first_name + ' ' + $scope.duser.last_name}
                }).success(function (data, status, headers, config) {
                    /*alert('File uploaded successfully');*/
                    $http.post('/saveAllReportToAppointmentTable',
                            {app_id: $scope.appointmentId, file: $scope.filesReportName,
                                tmpFile: $scope.tmpReportFileNames, name: $scope.duser.first_name + ' ' + $scope.duser.last_name}).success(function (response) {
                         $scope.msg = 'File uploaded successfully';
                        alert('File uploaded successfully');
                        window.location.reload(true);
                        /*$scope.appt.display_file_name=$scope.filesReportName;
                         var data={
                         app_time:date,
                         status:'pending',
                         appt_id:$scope.newAppt.appt_id,
                         fileNames:[],
                         url:''
                         }
                         $scope.appts.splice($scope.newAppt.index, 1);
                         $scope.appts.splice($scope.newAppt.index, 0, data);*/

                    }).error(function (response) {
                        $scope.msg = 'Error uploading file: ' + response.message;
                    })
                }).error(function (err) {
                    $scope.uploadInProgress = false;
                    $scope.msg = 'Error uploading file: ' + err.message;
                    console.log('Error uploading file: ' + err.message);
                });
            } else {
                $scope.msg = "Please select file";
            }
        }

        $scope.getReports = function () {
            $http.post('/getReports', {app_id: $scope.appointmentId, name: $scope.duser.first_name + ' ' + $scope.duser.last_name}).success(function (response) {
                console.log(response);
            }).error(function (response) {
                alert('Error' + response);
            })
        }





        var fileName = undefined;
        $scope.files = [];
        $scope.uploadFile = function (files) {
            $scope.files = [];
            for (var i = 0; i < files.length; i++) {
                $scope.files.push(files[i])
            }

            /*//To get GUID
             fileName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
             var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
             return v.toString(16);
             });*/
            console.log($scope.files);
            $scope.msgErr = undefined;

        };

        //import patient info
        $scope.importPatientInfo = function () {

            //To Save uploaded image
            if ($scope.files.length > 0) {
                $scope.upload = $upload.upload({
                    url: '/saveCsvFile',
                    method: 'POST',
                    data: $scope.user[0].id,
                    file: $scope.files
                }).success(function (data, status, headers, config) {
                    $scope.msg = "Patient Info Imported successfully.If any user information is not added " +
                            "then that user is already exist.";
                    fileName = undefined;
                    $scope.files = [];
                    $scope.filetoUp = undefined;
                    $scope.msgErr = undefined;
                    $('#fileToUpload').val("");

                }).error(function (err) {
                    $scope.uploadInProgress = false;
                    console.log('Error uploading file: ' + err.message || err);
                    $scope.msgErr = 'Error uploading file: ' + err.message || err;
                });
            } else {
                $scope.msgErr = "Please select file";
            }
        }

        //clearData
        $scope.clearData = function () {
            console.log($scope.files);
            $scope.msg = undefined;
            fileName = undefined;
            $scope.files = [];
            $scope.filetoUp = undefined;
            $scope.msgErr = undefined;
            $('#fileToUpload').val("");

        }
		
		$scope.clearReferData = function () {
			console.log('here');
			$scope.refer = {};
			$scope.msg = undefined;
			$scope.refer = undefined;
			$scope.setDentistData = undefined;
			$('#referToDoctor').val("");
		}

        //getFile
        /*$scope.getFile=function(){
         $scope.msg = undefined;
         fileName = undefined;
         $scope.files = [];
         //$scope.filetoUp=undefined;
         document.getElementById('fileToUpload').value='';
         }*/
        
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
                    $scope.refer = '';
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
