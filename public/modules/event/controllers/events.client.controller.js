'use strict';

// Events controller
angular.module('events').controller('EventsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', '$upload',
    function ($scope, $http, $stateParams, $location, Authentication, $upload) {
        $scope.user = JSON.parse(Authentication.get('user'));
        //$scope.dentist = JSON.parse(Dentist.get('dentist'));
        $scope.isEdit = ($stateParams.clinicId == undefined) ? false : true;
        $scope.isEdit = false;
        $scope.filterVal = '';
        $scope.listType = '';
        $scope.dateOf = '';
        $scope.newEvent = {};
        /* Related to pagination */
        $scope.itemsPerPage = 10; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        /* End */


        $scope.findOne = function () {
            var curDate = new Date();
            var endDate = new Date(new Date(curDate).setMonth(curDate.getMonth() + 3));
            $('#event-start-date')
                    .datepicker({
                        inline: true,
                        dateFormat: "m/dd/yy",
                        minDate: curDate,
                        maxDate: endDate,
                        onSelect: function () {
                            $scope.event.start_date = $(this).val();
                        }
                    })
                    .datepicker('setDate', curDate);
            $('#event-end-date')
                    .datepicker({
                        inline: true,
                        dateFormat: "m/dd/yy",
                        minDate: curDate,
                        maxDate: endDate,
                        onSelect: function () {
                            $scope.event.end_date = $(this).val();
                        }
                    })
                    .datepicker('setDate', curDate);
            $scope.event = {image: null};
            var date1 = new Date("", "", "", 8, 0);
            $scope.timeArr = [];
            for (var a = 0; a < 24; a++) {
                var date2 = new Date(date1.setMinutes(date1.getMinutes() + 30));
                $scope.timeArr.push(date2);
            }
            if ($stateParams.eventId !== undefined) {
                $scope.isEdit = true;
                $http.post('/getEvent', {id: $stateParams.eventId}).success(function (response) { //To Create Event
                    $scope.event = response[0];
                    var sDate = new Date($scope.event.start_datetime);
                    var eDate = new Date($scope.event.end_datetime);
                    $scope.event.start_date = (parseInt(sDate.getMonth()) + 1) + '/' + sDate.getDate() + '/' + sDate.getFullYear();
                    $scope.event.end_date = (parseInt(eDate.getMonth()) + 1) + '/' + eDate.getDate() + '/' + eDate.getFullYear();
                    $scope.event.start_time = sDate.getHours() + ':' + sDate.getMinutes();
                    $scope.event.end_time = eDate.getHours() + ':' + eDate.getMinutes();
                }).error(function (response) {
                    $('#loader-container').hide();
                    $scope.error = response[0];
                    $("html, body").animate({scrollTop: 0}, "slow");
                });
            }
        }

        $scope.uploadFile = function (files) {
            $scope.event.image = 'new';
            $("#event-image-container").html('<div class="clinicLoading" ></div>');
            $scope.files = []
            for (var i = 0; i < files.length; i++) {
                $scope.files.push(files[i])
            }

            //To get GUID
            var fileName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

            //To Save uploaded image
            $scope.upload = $upload.upload({
                url: '/getTempEventImage',
                method: 'POST',
                data: fileName,
                file: $scope.files
            }).success(function (data, status, headers, config) {
                $scope.newEvent.image = data.replace(/"/g, '');
                $scope.newEvent.isImage = true;
                setTimeout(function () {
                    $('.clinicLoading').remove();
                    $("#event-image-container").html('<div class="new_image clinic-image"><img src="/images/event_images/tmp/' + data.replace(/"/g, '') + '" class="x-80 pull-left"></div>');
                }, 3000);
            }).error(function (err) {
                $scope.uploadInProgress = false;
                console.log('Error uploading file: ' + err.message || err);
            });
        };

        $scope.create = function () {
            if ($scope.event) {
                $('#loader-container').show();
                $scope.event.user_id = $scope.user[0].id; //asign logged in user's id//
                if($scope.newEvent.isImage && $scope.newEvent.isImage == true)
                {
                    $scope.event.image = $scope.newEvent.image;
                    $scope.event.isImage = $scope.newEvent.isImage;
                }
                $http.post('/eventAdd', $scope.event).success(function (response) { //To Create Event//
                    $location.path('/listEvents');
                }).error(function (response) {
                    $('#loader-container').hide();
                    $scope.error = response.message[0];
                    //$("html, body").animate({scrollTop: 0}, "slow");
                });
            } else {
                $scope.error = 'Please fill all required fields.'
            }
        }

        $scope.update = function () {
            if ($scope.event) {
                $('#loader-container').show();
                $scope.event.user_id = $scope.user[0].id; //asign logged in user's id//
                $scope.event.id = $stateParams.eventId;
                if($scope.newEvent.isImage && $scope.newEvent.isImage == true)
                {
                    $scope.event.image = $scope.newEvent.image;
                    $scope.event.isImage = $scope.newEvent.isImage;
                }
                $http.post('/eventUpdate', $scope.event).success(function (response) { //To update event//
                    $location.path('/listEvents');
                }).error(function (response) {
                    $('#loader-container').hide();
                    $scope.error = response.message[0];
                    //$("html, body").animate({scrollTop: 0}, "slow");
                });
            } else {
                $scope.error = 'Please fill all required fields.'
            }
        }

        $scope.find = function (searchVal, pageVal) {
            //Pagination//
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = $scope.itemsPerPage;
            //End//
            var eventData = {doctor_id: $scope.user[0].id, role_id: $scope.user[0].role_id, searchVal: searchVal, page: page};
            $http.post('/listEvents', eventData).success(function (response) {
                $scope.events = response.data;
                //To show the page count of pagination//
                for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                    $scope.pagedItems.push(i);
                }
                //End//
            }).error(function (response) {
                console.log(response);
            });
        }

        $scope.eventFilter = function () {
            $scope.currentPage = 1;
            $scope.find($scope.filterVal, $scope.currentPage);
        };

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

        // Remove existing Event
        $scope.remove = function (eventId, statusVal, index) {
            if (eventId) {
                if (confirm((statusVal == 'Deleted') ? 'Do you want to delete ?' : 'Do you want change the status of this event ?')) {
                    $http.post('/removeEvent', {id: eventId, status: statusVal}).success(function (response) {
                        if (response) {
                            //$scope.events.splice(index, 1);
                            $scope.find($scope.filterVal, $scope.currentPage);
                            alert(response.message);
                        }
                    }).error(function (response) {
                        $scope.error = response.message;
                    });
                }
            }
        };

        $scope.findEvents = function (listType, dateOf, pageVal) {
            //Pagination//
            var listPerPage = 5;
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = listPerPage;
            $scope.currentPage = page.page;
            //End//
            if (listType != '')
            {
                $scope.listType = listType;
            }
            var id = ($scope.user) ? $scope.user[0].id : null;
            $http.post('/listAllEvents', {status: $scope.listType, page: page, id: id, dateOf: dateOf}).success(function (response) {
                $scope.events = response.data;
                for(var i in $scope.events)
                {
                    $scope.events[i].image = ($scope.events[i].image != '' && $scope.events[i].image != null) ? 'images/event_images/'+$scope.events[i].image : 'modules/core/images/news-events-1.jpg';
                }
                //To show the page count of pagination//
                for (var i = 1; i <= Math.floor(response.total.totalRes / listPerPage) + ((response.total.totalRes % listPerPage) ? 1 : 0); i++) {
                    $scope.pagedItems.push(i);
                }
                //End//
            }).error(function (response) {
                console.log(response);
            });
        }

        $scope.showCalendar = function () {
            var curDate = new Date();
            var endDate = new Date(new Date(curDate).setMonth(curDate.getMonth() + 3));
            $('#event-start-date')
                    .datepicker({
                        inline: true,
                        dateFormat: "m/dd/yy",
                        //minDate: curDate,
                        maxDate: endDate,
                        onSelect: function () {
                            $scope.dateOf = $(this).val();
                            $scope.findEvents($scope.listType, $(this).val());
                        }
                    })
                    .datepicker('setDate', curDate);
        }
        
        //After click on page number of pagination//
        $scope.setPageList = function (listType) {
            $scope.currentPage = this.n;
            $scope.findEvents(listType, $scope.dateOf, $scope.currentPage);
        };
        //End//
        //After click on Previous Button of pagination//
        $scope.prevPageList = function (listType) {
            if (($scope.currentPage - 1) < 1)
                return false;
            $scope.currentPage += -1;
            $scope.findEvents(listType, $scope.dateOf, $scope.currentPage);
        };
        //End//
        //After click on Next Button of pagination//
        $scope.nextPageList = function (listType) {
            console.log(listType);
            if (($scope.currentPage + 1) > $scope.pagedItems.length)
                return false;
            $scope.currentPage += 1;
            $scope.findEvents(listType, $scope.dateOf, $scope.currentPage);
        };
        //End//
    }
]);