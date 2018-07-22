'use strict';
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var selectedDateTime = "";
var standardTiming = {startTime: 8, endTime: 22}; //minimum clinic opening time and maximum clinic closing time (in 24 Hr)
var appointmentDuration = 30; // Standard Time duration of appointment (in minutes)
var specialityList = [];
var editedTime = ''
var flag_check_data = false;
var day_diff = 0;
var prev_date = [];
var next_flag = false;
var max_length = 0;
var blockedTimeList = [];
// Appointments controller
angular.module('appointments').controller('AppointmentsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Appointments', 'Page', '$rootScope',
    function ($scope, $stateParams, $location, $http, Authentication, Appointments, Page, $rootScope) {

        $scope.authentication = JSON.parse(Authentication.get('user'));
        if (!$scope.authentication)
            $location.path('/');
        var curDate = new Date();
        var date = '';
        $scope.editFlag = false;
        //$scope.prev = '';
        $scope.next = '';
        var clinic_id = '';
        var dt = new Date();
        $scope.currrentDate = dt.getTime();
        $scope.next3monthdate = dt.setMonth(dt.getMonth() + 3);
        $scope.buttonText = "Book Appointment";
        flag_check_data = false;
        var dateLast = '';
        //$rootScope.blockedTimeList = [];
        //Initiate datepicker
        var curDate = new Date();
        var endDate = new Date(new Date(curDate).setMonth(curDate.getMonth() + 3));
        $('#appointment-date')
                .datepicker({
                    inline: true,
                    dateFormat: "m/dd/yy",
                    minDate: curDate,
                    maxDate: endDate,
                    onSelect: function () {
                        $scope.calDate = $(this).val();
                        //$scope.selectedDate=$(this).val();
                        $scope.getAppointmentsByCalenderDate();
                        //$scope.getAvailableAppointmentsTime();
                    }
                })
                .datepicker('setDate', curDate);


        if ($stateParams.date == undefined || $stateParams.date == "") {
            date = curDate;
            $scope.selectedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        } else {

            date = new Date(parseInt($stateParams.date));
            $scope.selectedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            if ($location.search().val == 'editUser' || $location.search().val == 'editDentist') {

                var queryParamDate = new Date(parseInt($location.search().time));
                editedTime = queryParamDate;
                selectedDateTime = queryParamDate.getTime();
                var am_pm = (editedTime.getHours() >= 12 ? 'PM' : 'AM');
                document.getElementById('selectedDate').innerHTML = editedTime.getDate() + ' ' + monthNames[editedTime.getMonth()] + ' ' + editedTime.getFullYear();
                document.getElementById('selectedDateTime').innerHTML = (editedTime.getHours() > 12 ? editedTime.getHours() - 12 : editedTime.getHours()) + ':' + (editedTime.getMinutes() < 30 ? '00' : '30') + ' ' + am_pm;
                $scope.reason = $location.search().reason;
                $scope.editFlag = true;

            }
            //date = new Date(date.setDate(date.getDate()));
            // var prvDate = new Date(parseInt($stateParams.date));
            //console.log("outttt" + Page.get("i"));
            //$scope.prev = prvDate.setDate(prvDate.getDate() - 7);
            //console.log("outtttaxdsad" + $scope.prev);
        }
        clinic_id = $stateParams.clinic_id;
        $scope.clinic_id = clinic_id;
        $http.post('/getAppointmentTimes', {date: date.getTime(), clinic_id: clinic_id}).success(function (response) {
            // If successful we assign the response to the global user model

            $scope.time = response;
            $scope.slot_diff = response[0].slot_diff;
            //$scope.data=[];
            if (response.length > 0) {
                $http.post('/getBookedAppointmentTimes', {date: date.getTime(), clinic_id: clinic_id}).success(function (response1) {
                    $scope.bookedApptTime = [];
                    for (var i = 0; i < response1.length; i++) {
                        var date3 = new Date(Date.parse(response1[i].app_time));
                        $scope.bookedApptTime.push(date3);
                    }
                    var appArr = [];
                    var k = 0;
                    appArr.push(response[6]); //Inserted timing of Sunday

                    for (var a = 0; a < response.length - 1; a++)
                    {
                        appArr.push(response[a]);
                    }
                    if (date.getTime() <= $scope.next3monthdate) {
                        $scope.arrCalTimes = $scope.getCalanderTimes(appArr, date, 0, $scope.slot_diff);
                        if ($scope.arrCalTimes) {
                            for (var time in $scope.arrCalTimes) {
                                if ($scope.arrCalTimes[time].times.length < max_length) {
                                    var remain = defTime(max_length - $scope.arrCalTimes[time].times.length, $scope.arrCalTimes[time].times[$scope.arrCalTimes[time].times.length - 1].dt, $scope.slot_diff);
                                    $scope.arrCalTimes[time].times = $scope.arrCalTimes[time].times.concat(remain);
                                }

                            }
                        }
                        dateLast = date;
                    }

                    if (next_flag == false) {
                        prev_date.push(date.getTime());
                        next_flag = true;
                    }
                    if ($location.search() != undefined) {
                        if ($location.search().next == "next") {
                            prev_date.push(date.getTime());
                            $scope.prev = prev_date[prev_date.length - 2];
                        } else if ($location.search().next == "prev") {
                            prev_date.splice(prev_date.length - 1, 1);
                            $scope.prev = prev_date[prev_date.length - 2];
                        }
                    }
                    //
                    //console.log("after push " + prev_date);
//                    console.log("currentDate " + new Date($scope.currrentDate));
//                    console.log("$scope.prev " + new Date($scope.prev));
//                    console.log('prev ' + $scope.prev);
//                    console.log('current ' + $scope.currrentDate);
//                    if (prev_date.length > 1) {
//                        $scope.prev = prev_date[prev_date.length - 2];
//                    }
                    //console.log('flag_check_data' + flag_check_data);
                    $http.post('/getBlockedTime', {clinic: $stateParams.clinic_id}).success(function (response) {
                        for (var i in response)
                        {
                            var d = new Date(response[i].date_time);
                            $("#" + d.getTime()).addClass('active');
                            var index = blockedTimeList.indexOf(d.getTime());
                            if (index < 0) {
                                blockedTimeList.push(d.getTime());
                            }
                        }
                        for (var i in blockedTimeList)
                        {
                            $("#" + blockedTimeList[i]).addClass('active');
                        }
                    }).error(function (response) {
                        $scope.message = response.message[0];
                    });
                    
                    if (flag_check_data == false) {
                        $location.path('/appointments/create/' + (dateLast.setDate(dateLast.getDate() + 1)) + '/' + clinic_id);
                    }

                }).error(function (response) {
                    $scope.error = response.message;
                });

            }
        }).error(function (response) {
            $scope.error = response.message;
        });

        $scope.getAppointmentsNextWeek = function (val, id, prevNextVal, moduleN) {
            if(moduleN == 'block')
            {
                $location.path('/clinic/blockTime/' + val + '/' + id).search('next', prevNextVal);
            } else {
                $location.path('/appointments/create/' + val + '/' + id).search('next', prevNextVal);
            }
        }

        $scope.getAppointmentsByCalenderDate = function () {
            var date = $scope.calDate;

            var str = date.split('/');
            var val = new Date(str[2], (parseInt(str[0]) - 1), str[1], 0, 0, 0);
            //$scope.getAppointmentsNextWeek(val.getTime(),$stateParams.clinic_id);
            window.location = '#!/appointments/create/' + val.getTime() + '/' + $stateParams.clinic_id;
        }

        $scope.selectApptTimeValue = function (val, event) {
            selectedDateTime = val;
            var bookedDate = new Date(parseInt(val));
            var am_pm = (bookedDate.getHours() >= 12 ? 'PM' : 'AM');
            document.getElementById('selectedDate').innerHTML = bookedDate.getDate() + ' ' + monthNames[bookedDate.getMonth()] + ' ' + bookedDate.getFullYear();
            document.getElementById('selectedDateTime').innerHTML = (bookedDate.getHours() > 12 ? bookedDate.getHours() - 12 : bookedDate.getHours()) + ':' + (bookedDate.getMinutes() < 30 ? '00' : '30') + ' ' + am_pm;
            //event.target.className= event.target.className+' active';
            $(".btn-sm").each(function () {
                $(this).removeClass("active");
            });
            $(event.target).addClass('active');
            $("html, body").animate({scrollTop: $("#selectedDate").offset().top}, "slow");
        }

        $scope.addToBlock = function (val, event) {
            if ($(event.target).hasClass('active'))
            {
                $(event.target).removeClass("active");
                var index = blockedTimeList.indexOf(val);
                if (index > -1) {
                    blockedTimeList.splice(index, 1);
                }
            } else {
                $(event.target).addClass('active');
                blockedTimeList.push(val);
            }
        }
        
        $scope.selectDay = function (event){
            if($(event.target).data('active') == false) //check value of 'data' attribute//
            {
                $(event.target).data('active',true); //change value of 'data' attribute as 'true'//
                $(event.target).nextAll().each(function () { //Iterate through each element next to this 'li' //
                    if (typeof $(this).children().attr('data-time') !== typeof undefined) { //check if element has 'data' attribute//
                        $(this).children().addClass('active'); //show time slot as selected//
                        blockedTimeList.push($(this).children().data('time')); //push value into blockTimeList array//
                    }
                });
            } else {
                $(event.target).data('active',false); //change value of 'data' attribute as 'false'//
                $(event.target).nextAll().each(function () { //Iterate through each element next to this 'li' //
                    if (typeof $(this).children().attr('data-time') !== typeof undefined) { //check if element has 'data' attribute//
                        $(this).children().removeClass('active'); //show time slot as selected//
                        //To delete a value from an array (blockTimeList) //
                        var index = blockedTimeList.indexOf($(this).children().data('time')); //get index of a value in array (blockTimeList)//
                        if (index > -1) { //if index of value found in array (blockTimeList)//
                            blockedTimeList.splice(index, 1); //delete a value from an array (blockTimeList) through index//
                        }
                    }
                });
            }
        }

        $scope.blockTime = function (vVal) {
            $scope.block = {};
            $scope.block.blockTimeList = [];
                        
            if (vVal != 'appointment') {
                $scope.appointment = Appointments.get({
                    appointmentId: $stateParams.appointmentId
                });
            }
        };

        $scope.saveBlockedTime = function () {
            $scope.block.blockTimeList = blockedTimeList;
            if($scope.block.blockTimeList && $scope.block.blockTimeList.length > 0)
            {
                $scope.block.id = $scope.authentication[0].id;
                $scope.block.clinic = $stateParams.clinic_id;
                $http.post('/blockTime', $scope.block).success(function (response) {
                    //$scope.message = response.message[0];
                    alert(response.message[0]);
                    $location.path('/clinics');
                }).error(function (response) {
                    $scope.message = response.message[0];
                });
            }
        }
        // Create new Appointment
        $scope.create = function () {
            // Create new Appointment object
            var appointment = new Appointments({
                name: this.name
            });

            // Redirect after save
            appointment.$save(function (response) {
                $location.path('appointments/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Appointment
        $scope.remove = function (appointment) {
            if (appointment) {
                appointment.$remove();

                for (var i in $scope.appointments) {
                    if ($scope.appointments [i] === appointment) {
                        $scope.appointments.splice(i, 1);
                    }
                }
            } else {
                $scope.appointment.$remove(function () {
                    $location.path('appointments');
                });
            }
        };

        // Update existing Appointment
        $scope.update = function () {
            var appointment = $scope.appointment;
            //console.log()
            appointment.$update(function () {
                $location.path('appointments/' + appointment._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Appointments
        $scope.find = function () {
            $scope.appointments = Appointments.query();
        };

        // Find existing Appointment
        $scope.findOne = function (vVal) {
            if (vVal != 'appointment') {
                $scope.appointment = Appointments.get({
                    appointmentId: $stateParams.appointmentId
                });
            }
        };
        var locArr = [];
        var k = 0;
        $scope.getCalanderTimes = function (appArr, date, lengthOfCal, slot_diff) {
            if (lengthOfCal == 7)
                return locArr;

            if (appArr[date.getDay()] != undefined) {
                var startTime = appArr[date.getDay()].shift1_start_time.split(":");
                var endTime = appArr[date.getDay()].shift1_end_time.split(":");
                var startTime_2nd = appArr[date.getDay()].shift2_start_time.split(":");
                var endTime_2nd = appArr[date.getDay()].shift2_end_time.split(":");
                // console.log('date'+date.getDate());
                var start1_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime[0], startTime[1], startTime[2], "");
                var start1End_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime[0], endTime[1], endTime[2], "");
                var dt = start1_date;
                var start2_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime_2nd[0], startTime_2nd[1], startTime_2nd[2], "");
                var start2End_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime_2nd[0], endTime_2nd[1], endTime_2nd[2], "");

                var absDiff = (start1End_date.getTime() - start1_date.getTime()) / 3600000;
                var absDiff2nd = (start2End_date.getTime() - start2_date.getTime()) / 3600000;
                if (start1_date.getTime() <= $scope.next3monthdate) {
                    var times = getTimes(start1_date, start1End_date, absDiff, start2_date, start2End_date, absDiff2nd, $scope.bookedApptTime, slot_diff);
                    if (times.length > 0) {
                        var days = dayNames[start1_date.getDay()] + ' ' + start1_date.getDate() + ' ' + monthNames[start1_date.getMonth()] + ' ' + start1_date.getFullYear();
                        locArr.push({days: days, times: times});
                        date = new Date(start1_date.setDate(start1_date.getDate() + 1));
                        $scope.next = date.getTime();
                        lengthOfCal += 1;
                        k++;
                    } else {
                        date = new Date(start1_date.setDate(start1_date.getDate() + 1));
                    }
                } else {
                    return locArr;
                }
            } else {
                date = new Date(start1_date.setDate(start1_date.getDate() + 1));
            }

            return $scope.getCalanderTimes(appArr, date, lengthOfCal, slot_diff);

        }
    }
]);

function getTimes(start1_date, start1End_date, absDiff, start2_date, start2End_date, absDiff2nd, bookedApptTime, slot_diff) {

    var timePush = [];
    var date = new Date();
    var differ = 0;
    var differ2 = 0;

    var len1 = (absDiff * (60 / slot_diff));
    var len2 = (absDiff2nd * (60 / slot_diff));
    var first = getSlots(start1_date, start1End_date, len1, bookedApptTime, slot_diff);
    //timePush=first;
    var second = getSlots(start2_date, start2End_date, len2, bookedApptTime, slot_diff);

    timePush = first.concat(second);
    //max_lentgth = timePush.length;
    if (max_length < timePush.length) {
        max_length = timePush.length;
    }


    if (timePush.length > 0) {
        flag_check_data = true;
    }


    return timePush;
}


function getSlots(start1_date, start1End_date, absDiff, bookedApptTime, slot_diff) {
    var timePush = [];
    var date = new Date();
    var val = 0;
    var flag = false;
    var editedTimeFlag = false;
    var dt = new Date(start1End_date.setMinutes(start1End_date.getMinutes() - slot_diff));
    for (var j = 0; j < (absDiff); j++) {
        if (start1_date > date) {
            var date1 = new Date(start1_date.setMinutes(start1_date.getMinutes() + val));
            val = slot_diff;
            for (var k in bookedApptTime) {
                if (start1_date.getTime() == bookedApptTime[k].getTime()) {
                    flag = true;
                }
            }
            if (editedTime != '') {
                if (start1_date.getTime() == editedTime.getTime()) {
                    editedTimeFlag = true;
                }
            }
            timePush.push({'dt': date1, 'flag': flag, 'editedTimeFlag': editedTimeFlag});
            editedTimeFlag = false;
            flag = false;
        }
        if (start1_date.getDate() == date.getDate() && start1_date.getMonth() == date.getMonth() && start1_date.getFullYear() == date.getFullYear()) {
            console.log(start1_date + ' == ' + dt)

            if (start1_date.getTime() == dt.getTime()) {
                break;
            }

            if (start1_date.getTime() > dt.getTime()) {
                break;
            }

            if (start1_date.getHours() >= date.getHours() && start1_date.getMinutes() >= date.getMinutes()) {

                var date1 = new Date(start1_date.setMinutes(start1_date.getMinutes() + val));
                val = slot_diff;
                for (var k in bookedApptTime) {
                    if (date1.getTime() == bookedApptTime[k].getTime()) {
                        flag = true;
                    }
                }
                if (editedTime != '') {

                    if (start1_date.getTime() == editedTime.getTime()) {
                        editedTimeFlag = true;
                    }
                }
                timePush.push({'dt': date1, 'flag': flag, 'editedTimeFlag': editedTimeFlag});
                editedTimeFlag = false;
                flag = false;
            } else {
                val = slot_diff
                start1_date.setMinutes(start1_date.getMinutes() + val);
                val = 0;
            }
        }
    }

    return timePush;
}

function defTime(len, date, slot_diff)
{
    var timePush = [];

    var dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0);
    var val = slot_diff;
    for (var i = 0; i < len; i++) {
        var date1 = new Date(dt.setMinutes(dt.getMinutes() + val));
        //val = slot_diff;
        timePush.push({'dt': date1, 'flag': true, 'editedTimeFlag': false});
    }
    return timePush;
}


angular.module('appointments').controller('BookAppoinmentController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Appointments',
    function ($scope, $stateParams, $location, $http, Authentication, Appointments) {
        $scope.user = JSON.parse(Authentication.get('user'));
        if ($location.search().val == 'editUser' || $location.search().val == 'editDentist') {
            $scope.buttonText = "Update Appointment"
        }
        if ($location.search().val == 'editDentist') {
            $scope.statusDiv = true;
        }



        $scope.bookedAppointment = function () {
            console.log($scope.authentication);
            $('#loader-container').show(); //To show loader popup//
            $("html, body").animate({scrollTop: 0});
            $scope.user[0].selectedAppointmentDateTime = selectedDateTime;
            $scope.user[0].clinic_id = $stateParams.clinic_id;
            $scope.user[0].email = $scope.member.email;
            $scope.user[0].contact_no = $scope.member.contact_no;

            if ($location.search().val == 'editUser') {
                console.log($scope.reason);
                $scope.user[0].app_id = $location.search().app_Id;
                $scope.user[0].appStatus = 'Pending';
                $scope.user[0].reasons = $scope.reason;
                if ($scope.member != undefined) {
                    $scope.user[0].member_id = $scope.member.id;
                }
                $http.post('/updateAppointment', $scope.user[0]).success(function () {
                    $('#loader-container').hide();
                    alert("Appointment Update Successfully");
                    history.back();
                }).error(function () {
                    $('#loader-container').hide();
                });

            } else if ($location.search().val == 'editDentist') {

                $scope.user[0].app_id = $location.search().app_Id;
                $scope.user[0].appStatus = 'Pending';
                $scope.user[0].id = $location.search().user_id;
                if ($scope.member != undefined) {
                    $scope.user[0].member_id = $scope.member.id;
                }
                //console.log($location.search().user_id);
                //console.log("editDentist   "+JSON.stringify($scope.user));
                $http.post('/updateAppointment', $scope.user[0]).success(function () {
                    $('#loader-container').hide();
                    alert("Appointment Update Successfully");
                    history.back();
                }).error(function () {
                    $('#loader-container').hide();
                });
            } else {


                if ($scope.member != undefined) {
                    $scope.user[0].member_id = $scope.member.id;
                }
                $scope.user[0].reasons = $scope.reason;
                console.log($scope.reason);
                if ($scope.user[0].selectedAppointmentDateTime != '') {
                    console.log($scope.user[0]);
                    $http.post('/bookAppointment', $scope.user[0]).success(function () {
                        /*$scope.user[0].id = actual_user_id;*/
                        $('#loader-container').hide();
                        alert("Appointment Booked Successfully");
                        $location.path("/myAppointment");
                    }).error(function () {
                        $('#loader-container').hide();
                    });

                } else {
                    $('#loader-container').hide();
                    alert('Please select appointment time');
                }
            }
        }

        $scope.getMember = function () {
            var memberId = 0;
            var app_Id = 0;
            if ($location.search().user_id)
            {
                memberId = $location.search().user_id;
                app_Id = $location.search().app_Id;
            } else {
                memberId = $scope.user[0].id;
            }
            $http.post('/selectMember', {memberId: memberId, app_id: app_Id}).success(function (response) {
                $scope.member = response[0];
                $scope.member.email = (($scope.member.email == '') ? $scope.authentication[0].email : $scope.member.email);
                $scope.member.contact_no = (($scope.member.contact_no == 0 || $scope.member.contact_no == null) ? $scope.authentication[0].contact_no : $scope.member.contact_no);

                $scope.mem_id = memberId;
            }).error(function (response) {
                $scope.error = response.message;
            });


            //$scope.member = {first_name: $scope.authentication[0].first_name, last_name: $scope.authentication[0].last_name};
            $http.post('/getMember', {id: $scope.user[0].id}).success(function (response) {
                $scope.credentials = response;

            }).error(function (response) {
            });
        }

        $scope.selectMember = function (memberId) {
            if (memberId == '') {
                memberId = $scope.authentication[0].id;
            }

            $http.post('/selectMember', {memberId: memberId}).success(function (response) {
                $scope.member.first_name = response[0].first_name;
                $scope.member.last_name = response[0].last_name;
                if (response[0].email == "") {
                    $scope.member.email = $scope.authentication[0].email;
                } else {
                    $scope.member.email = response[0].email;
                }
                if (response[0].contact_no == 0) {
                    $scope.member.contact_no = $scope.authentication[0].contact_no;
                } else {
                    $scope.member.contact_no = response[0].contact_no;
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        }
    }
]);
angular.module('appointments').controller('GetDentistData', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'WeekDays', 'Appointments',
    function ($scope, $stateParams, $location, $http, Authentication, WeekDays, Appointments) {
        $scope.user = Authentication.user;
        $scope.WeekDays = WeekDays; //List of week days
        $scope.data = []; //List of speciality
        var clinic_id = $stateParams.clinic_id;
        if (specialityList.length < 1)
        {
            $http.post('/specialityList', {clinic_id: clinic_id}).success(function (response) { //To fetch all speciality list
                //$scope.specFilter = response;
                //alert(JSON.stringify(response));
                $scope.specOfDent = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
        }

        $http.post('/GetDentistDataByClinicId', {clinic_id: clinic_id}).success(function (response) {
            $scope.result = response;
            //$scope.slot_diff = response[0].slot_diff;
        }).error(function () {
            alert('err');
        });



    }
]);
angular.module('appointments').controller('GetAllBookedAppoinmentController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', '$filter',
    function ($scope, $stateParams, $location, $http, Authentication, $filter) {

        /* Related to pagination */
        $scope.sortingOrder = [];
        $scope.reverse = false;
        $scope.filteredItems = [];
        $scope.groupedItems = [];
        $scope.itemsPerPage = 10;
        $scope.pagedItems = [];
        $scope.currentPage = 0;
        $scope.items = [];
        /* End */

        $scope.user = JSON.parse(Authentication.get('user'));
        if (!$scope.user)
            $location.path('/');
		
        $http.post('/getAllBookedAppointmentsByUserId', {user_id: $scope.user[0].id}).success(function (response) {

            //11 Aug 2014 - 12:30 PM
            var dt = new Date();
            $scope.curdate = dt.toJSON();
            for (var i = 0; i < response.length; i++) {
                var date = new Date(response[i].app_time);
                var hours = ((date.getHours() > 12) ? date.getHours() - 12 : date.getHours());
                var minutes = (date.getMinutes() < 30 ? '00' : 30);
                var am_pm = ((date.getHours() >= 12) ? 'PM' : 'AM')
                var dt = date.getDate() + ' ' + monthNames[date.getMonth()] + '' +
                        ' ' + date.getFullYear() + ' - ' + hours + ':' + minutes + ' ' + am_pm;
                response[i].appDate = dt;
            }
            //$scope.data = response;

            $scope.items = response;
            var searchMatch = function (haystack, needle) {
                if (!needle) {
                    return true;
                }
                return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
            };

            // init the filtered items
            $scope.search = function () {
                $scope.filteredItems = $filter('filter')($scope.items, function (item) {
                    for (var attr in item) {
                        if (searchMatch(item[attr], $scope.query))
                            return true;
                    }
                    return false;
                });
                // take care of the sorting order
                if ($scope.sortingOrder !== '') {
                    $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse);
                }
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            };

            // calculate page in place
            $scope.groupToPages = function () {
                $scope.pagedItems = [];

                for (var i = 0; i < $scope.filteredItems.length; i++) {
                    if (i % $scope.itemsPerPage === 0) {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]];
                    } else {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                    }
                }
            };

            $scope.range = function (start, end) {
                var ret = [];
                if (!end) {
                    end = start;
                    start = 0;
                }
                for (var i = start; i < end; i++) {
                    ret.push(i);
                }
                return ret;
            };

            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.pagedItems.length - 1) {
                    $scope.currentPage++;
                }
            };

            $scope.setPage = function () {
                $scope.currentPage = this.n;
            };

            // functions have been describe process the data for display
            $scope.search();

        }).error(function (response) {
            $scope.error = response.message;
        });

        $scope.deleteAppointmentByAppId = function (app_id, index) {
            var r = confirm('Are you sure to delete this appointment ?');
            if (r == true) {
                $http.post('/deleteBookedAppointmentsByAppId', {app_id: app_id}).success(function (response) {
                    if (response) {
                        $scope.pagedItems[0].splice(index, 1);
                        alert(response.message);
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        }

        $scope.editAppointmentByAppId = function (app_id, app_time, clinic_id, reason, user_id) {
            console.log(reason);
            var date = new Date(app_time);
            $location.path('/appointments/create/' + date.getTime() + '/' + clinic_id).search('val', 'editUser').search('app_Id', app_id).search('reason', reason).search('time', date.getTime()).search('user_id', user_id);
        }



    }
]);




