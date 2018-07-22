'use strict';
var latLong = '';
// Clinics controller

angular.module('clinics').controller('ClinicsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Clinics', '$http', 'Dentist', '$upload', 'Dentists',
    function ($scope, $stateParams, $location, Authentication, Clinics, $http, Dentist, $upload, Dentists) {
        $scope.user = JSON.parse(Authentication.get('user'));
        $scope.dentist = JSON.parse(Dentist.get('dentist'));
        $scope.isEdit = ($stateParams.clinicId == undefined) ? false : true;
        $scope.fileNames = [];
        $scope.imageCount = 0;
        $scope.filterVal = '';
        /* Related to pagination */
        $scope.itemsPerPage = 10; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        /* End */
        $scope.uploadFile = function (files) {
            if (files.length < 1)
                return false;
            if ((files.length + $scope.imageCount) > 5) {
                alert('Can not upload more than 5 images for a clinic.');
                return false;
            }
            $("#clinic-image-container").removeClass('ng-hide');
            $("#clinic-image-container").append('<div class="clinicLoading" ></div>');
            var tmpFileNames = [];
            $scope.files = [];
            //$scope.fileNames = [];
            //$("#clinic-image-container").find('.new_image').remove();
            for (var i = 0; i < files.length; i++) {
                $scope.files.push(files[i])
                //To get GUID
                var fileName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                tmpFileNames.push(fileName);
            }

            //To Save uploaded image
            $scope.upload = $upload.upload({
                url: '/saveClinicImages',
                method: 'POST',
                data: tmpFileNames,
                file: $scope.files
            }).success(function (data, status, headers, config) {
                setTimeout(function () {
                    $(".clinicLoading").remove();
                    //$scope.fileNames = [];
                    for (var a in data) {
                        $scope.fileNames.push(data[a].src);
                        $("#clinic-image-container").append('<div class="new_image clinic-image"><div class="remove-upload" onclick="javascript:$(this).parent().remove();"></div> <span class="upload-thumb-perview"></span><img src="/images/clinic_images/tmp/' + data[a].src.replace(/"/g, '') + '"></div>');
                    }
                }, 3000);
            }).error(function (err) {
                $scope.uploadInProgress = false;
                console.log('Error uploading file: ' + err.message || err);
            });
        };

        // Create new Clinic
        $scope.create = function () {

            if ($scope.clinic) {
                $('#loader-container').show();
                if ($scope.user[0].role_id != "1") //if logged in user is dentist
                {
                    $scope.clinic.doctor_id = $scope.dentist[0].id; //asign logged in user's id as clinic's dentits id
                }
                //var clinic = new Clinics($scope.clinic);
                //console.log(clinic);
                // Redirect after save
                $http.post('/clinicAdd', $scope.clinic).success(function (response) { //To Delete clinic
                    if ($scope.fileNames.length > 0) {
                        $http.post('/saveImageData', {
                            id: response.insertId,
                            images: $scope.fileNames
                        }).success(function (response) { //To Save images
                            console.log('Images saved')
                        }).error(function (response) {
                            $scope.error = response.message;
                        });
                    }
                    $location.path('/clinics/' + response.insertId + '/editTiming');
                }).error(function (response) {
                    $('#loader-container').hide();
                    $scope.error = response[0];
                    $("html, body").animate({scrollTop: 0}, "slow");
                });


                /* clinic.$save(function (response) {
                 if ($scope.fileNames.length > 0) {
                 $http.post('/saveImageData', {
                 id: response.insertId,
                 images: $scope.fileNames
                 }).success(function (response) { //To Save images
                 console.log('Images saved')
                 }).error(function (response) {
                 $scope.error = response.message;
                 });
                 }
                 $location.path('/clinics/' + response.insertId + '/editTiming');
                 // Clear form fields
                 }, function (errorResponse) {
                 $('#loader-container').hide();
                 $scope.error = errorResponse.data[0];
                 $("html, body").animate({scrollTop: 0}, "slow");
                 }); */
            } else {
                $scope.error = 'Please fill all required fields.'
                $("html, body").animate({scrollTop: 0}, "slow");
                //window.scrollTo(100, 100);
            }
        };

        // Remove existing Clinic
        $scope.remove = function (clinic, index) {
            if (clinic) {
                if (confirm('Do you really want to delete ?')) {
                    $http.post('/removeClinic', {id: clinic}).success(function (response) { //To Delete clinic
                        if (response) {
                            $scope.clinics.splice(index, 1);
                            alert(response.message);
                        }
                    }).error(function (response) {
                        $scope.error = response.message;
                    });
                }
            }
        };

        // Update existing Clinic
        $scope.update = function () {
            if ($scope.user[0].role_id != "1") //if logged in user is dentist
            {
                $scope.clinic.doctor_id = $scope.dentist[0].id; //asign logged in user's id as clinic's dentits id
            }
            $('#loader-container').show();
            $scope.clinic.clinic_id = $scope.clinic.id;
            delete $scope.clinic.id;
            $http.post('/updateClinic', $scope.clinic).success(function (response) { //To Delete clinic
                if (response) {
                    if ($scope.fileNames.length > 0) {
                        $http.post('/saveImageData', {
                            id: $scope.clinic.clinic_id,
                            images: $scope.fileNames
                        }).success(function (response) { //To Save images
                        }).error(function (response) {
                            $scope.error = response.message;
                        });
                    }
                    $location.path('/clinics');
                }
            }).error(function (response) {
                $('#loader-container').hide();
                var res = JSON.parse(JSON.stringify(response));
                $scope.error = res[0];
                $("html, body").animate({scrollTop: 0}, "slow");
            });
        };

        // Find a list of Clinics
        $scope.find = function (searchVal, pageVal) {
			console.log($stateParams.clinicStatus);
            //Pagination//
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = $scope.itemsPerPage;
            //End//

            if ($scope.user[0].role_id == 1) {
                var clinicData = {doctor_id: 'admin', searchVal: searchVal, page: page,status:$stateParams.clinicStatus};
            } else {
                var clinicData = {doctor_id: $scope.dentist[0].id, searchVal: searchVal, page: page,status:$stateParams.clinicStatus};
            }
            $http.post('/clinics', clinicData).success(function (response) {
                if (response) {
                    $scope.clinics = response.data;
                    //To show the page count of pagination//
                    for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                        $scope.pagedItems.push(i);
                    }
                    //End//
                }
            }).error(function (response) {
                console.log(response);
            });

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

        $scope.changeStatus = function (clinicVal, dStatus) {
            if (confirm('Do you want to change status')) {
                $http.post('/changeClinicStatus', {clinic_id: clinicVal, status: dStatus}).success(function (response) {
                    alert('Updated successfully')
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        };
        // Find existing Clinic
        $scope.findOne = function () {
            //$scope.clinic=[];
            $http.post('/areaList').success(function (response) { //To fetch all area list
                $scope.areaList = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
            $http.post('/getServiceList').success(function (response) { //To fetch all service list
                $scope.serviceList = response;
            }).error(function (response) {
                $scope.error = response.message;
            });

            if ($scope.user[0].role_id == '1') {
                // $scope.dentistList = Dentists.query({searchStatus: 'active'});
                $http.post('dentists/list', {searchStatus: 'active'}).success(function (response) {
                    $scope.dentistList = response.data;
                }).error(function (response) {

                })
            }
            if ($stateParams.clinicId !== undefined) {
                $http.post('/getClinicData', {id: $stateParams.clinicId}).success(function (response) { //To get clinic

                    if (response) {
                        $scope.clinic = response.clinic[0];
                        $scope.images = response.clinic_images;
                        $scope.imageCount = response.clinic_images.length;
                        $http.post('/getClinicServices', {id: $stateParams.clinicId}).success(function (responseServ) { //To get service list of clinic
                            //$scope.clinic=[];
                            if (responseServ) {
                                var servList = [];
                                for (var i = 0; i < $scope.serviceList.length; i++) {
                                    $scope.serviceList[i].flag = false;
                                    for (var a in responseServ) {
                                        if ($scope.serviceList[i].id == responseServ[a].service_id) {
                                            $scope.serviceList[i].flag = true;
                                            servList.push(responseServ[a].service_id);
                                            continue;
                                        }
                                    }
                                }
                                $scope.clinic.services = servList;
                            }
                        }).error(function (response) {
                            console.log('Unable to get services');
                        });
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        };

        // Show edit timing page
        $scope.getClinicTiming = function (clinic_id) {
            $http.post('/getAppointmentTimes', {clinic_id: clinic_id}).success(function (response) {
                if (response) {
                    $scope.clinicTimings = response;
                    //console.log($scope.clinicTimings);
                    for (var a in $scope.clinicTimings) {
                        //console.log($scope.clinicTimings[a]);
                        switch ($scope.clinicTimings[a].days) {
                            case '1':
                                $scope.clinicTiming.mon1s = $scope.clinicTimings[a].shift1_start_time;
                                $scope.clinicTiming.mon1e = $scope.clinicTimings[a].shift1_end_time;
                                $scope.clinicTiming.mon2s = $scope.clinicTimings[a].shift2_start_time;
                                $scope.clinicTiming.mon2e = $scope.clinicTimings[a].shift2_end_time;
                                break;
                            case '2':
                                $scope.clinicTiming.tue1s = $scope.clinicTimings[a].shift1_start_time;
                                $scope.clinicTiming.tue1e = $scope.clinicTimings[a].shift1_end_time;
                                $scope.clinicTiming.tue2s = $scope.clinicTimings[a].shift2_start_time;
                                $scope.clinicTiming.tue2e = $scope.clinicTimings[a].shift2_end_time;
                                break;
                            case '3':
                                $scope.clinicTiming.wed1s = $scope.clinicTimings[a].shift1_start_time;
                                $scope.clinicTiming.wed1e = $scope.clinicTimings[a].shift1_end_time;
                                $scope.clinicTiming.wed2s = $scope.clinicTimings[a].shift2_start_time;
                                $scope.clinicTiming.wed2e = $scope.clinicTimings[a].shift2_end_time;
                                break;
                            case '4':
                                $scope.clinicTiming.thu1s = $scope.clinicTimings[a].shift1_start_time;
                                $scope.clinicTiming.thu1e = $scope.clinicTimings[a].shift1_end_time;
                                $scope.clinicTiming.thu2s = $scope.clinicTimings[a].shift2_start_time;
                                $scope.clinicTiming.thu2e = $scope.clinicTimings[a].shift2_end_time;
                                break;
                            case '5':
                                $scope.clinicTiming.fri1s = $scope.clinicTimings[a].shift1_start_time;
                                $scope.clinicTiming.fri1e = $scope.clinicTimings[a].shift1_end_time;
                                $scope.clinicTiming.fri2s = $scope.clinicTimings[a].shift2_start_time;
                                $scope.clinicTiming.fri2e = $scope.clinicTimings[a].shift2_end_time;
                                break;
                            case '6':
                                $scope.clinicTiming.sat1s = $scope.clinicTimings[a].shift1_start_time;
                                $scope.clinicTiming.sat1e = $scope.clinicTimings[a].shift1_end_time;
                                $scope.clinicTiming.sat2s = $scope.clinicTimings[a].shift2_start_time;
                                $scope.clinicTiming.sat2e = $scope.clinicTimings[a].shift2_end_time;
                                break;
                            case '7':
                                $scope.clinicTiming.sun1s = $scope.clinicTimings[a].shift1_start_time;
                                $scope.clinicTiming.sun1e = $scope.clinicTimings[a].shift1_end_time;
                                $scope.clinicTiming.sun2s = $scope.clinicTimings[a].shift2_start_time;
                                $scope.clinicTiming.sun2e = $scope.clinicTimings[a].shift2_end_time;
                                break;
                            default:
                                break;

                        }
                    }
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        // Show edit timing page
        $scope.getTiming = function () {
            $scope.findOne();
            $scope.getClinicTiming($stateParams.clinicId);
            $scope.clinicTiming = [];
            var date1 = new Date("", "", "", (standardTiming.startTime - 1), (60 - appointmentDuration));
            $scope.timeArr = [];
            for (var a = 0; a < (standardTiming.endTime - standardTiming.startTime) * 2; a++) {
                var date2 = new Date(date1.setMinutes(date1.getMinutes() + appointmentDuration));
                $scope.timeArr.push({time: date2});
            }
        };

        // Save clinic timing
        $scope.clinicTime = function () {
            if ($scope.clinicTiming) {
                $('#loader-container').show();
                var timingArr = [];
                timingArr.push({
                    day: 1,
                    time: {
                        shift1_start_time: $scope.clinicTiming.mon1s,
                        shift1_end_time: $scope.clinicTiming.mon1e,
                        shift2_start_time: $scope.clinicTiming.mon2s,
                        shift2_end_time: $scope.clinicTiming.mon2e
                    }
                });
                timingArr.push({
                    day: 2,
                    time: {
                        shift1_start_time: $scope.clinicTiming.tue1s,
                        shift1_end_time: $scope.clinicTiming.tue1e,
                        shift2_start_time: $scope.clinicTiming.tue2s,
                        shift2_end_time: $scope.clinicTiming.tue2e
                    }
                });
                timingArr.push({
                    day: 3,
                    time: {
                        shift1_start_time: $scope.clinicTiming.wed1s,
                        shift1_end_time: $scope.clinicTiming.wed1e,
                        shift2_start_time: $scope.clinicTiming.wed2s,
                        shift2_end_time: $scope.clinicTiming.wed2e
                    }
                });
                timingArr.push({
                    day: 4,
                    time: {
                        shift1_start_time: $scope.clinicTiming.thu1s,
                        shift1_end_time: $scope.clinicTiming.thu1e,
                        shift2_start_time: $scope.clinicTiming.thu2s,
                        shift2_end_time: $scope.clinicTiming.thu2e
                    }
                });
                timingArr.push({
                    day: 5,
                    time: {
                        shift1_start_time: $scope.clinicTiming.fri1s,
                        shift1_end_time: $scope.clinicTiming.fri1e,
                        shift2_start_time: $scope.clinicTiming.fri2s,
                        shift2_end_time: $scope.clinicTiming.fri2e
                    }
                });
                timingArr.push({
                    day: 6,
                    time: {
                        shift1_start_time: $scope.clinicTiming.sat1s,
                        shift1_end_time: $scope.clinicTiming.sat1e,
                        shift2_start_time: $scope.clinicTiming.sat2s,
                        shift2_end_time: $scope.clinicTiming.sat2e
                    }
                });
                timingArr.push({
                    day: 7,
                    time: {
                        shift1_start_time: $scope.clinicTiming.sun1s,
                        shift1_end_time: $scope.clinicTiming.sun1e,
                        shift2_start_time: $scope.clinicTiming.sun2s,
                        shift2_end_time: $scope.clinicTiming.sun2e
                    }
                });

                $http.post('/saveClinicTime', {
                    id: $stateParams.clinicId,
                    timingData: timingArr
                }).success(function (response) { //To Delete clinic
                    if (response) {
                        $location.path('/clinics');
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }

        };

        $scope.clinicFilter = function () {
            $scope.currentPage = 1;
            $scope.find($scope.filterVal);
        };

        $scope.getLatLong = function (latLong) {

            if ($scope.clinic) {
                $scope.clinic.latitude = latLong.lat();
                $scope.clinic.logitude = latLong.lng();
            } else {
                $scope.clinic = {};
                $scope.clinic.latitude = latLong.lat();
                $scope.clinic.logitude = latLong.lng();
            }
            console.log(JSON.stringify($scope.clinic));
        }

        $scope.setLatLong = function () {
            if (latLong != undefined) {
                $scope.clinic.latitude = latLong.lat();
                $scope.clinic.logitude = latLong.lng();
            }
        }

        $scope.removeUploadedFile = function (imageVal) {
            var imageId = imageVal;
            $http.post('/removeUploadedFile', {imageId: imageId}).success(function (response) {
                alert(response.message);
                $("#delete_" + imageVal).remove();
            }).error(function (response) {
                $scope.error = response.message;
            });
        }
		
		$scope.findClinicStatus =function(){
			console.log('Clinic');
			console.log($scope.user[0].id);
			$http.post('/getClinicStatus',{user_id:$scope.user[0].id}).success(function (response) {
				console.log(response);
				for(var i=0 ; i < response.length; i++){
						if(response[i].status=='Pending'){
							$scope.clinic_status_pending=response[i].status_cnt;
							console.log($scope.clinic_status_pending);
						}else if(response[i].status=='Approved'){
							$scope.clinic_status_approved=response[i].status_cnt;
						}else if(response[i].status=='Deleted'){
							$scope.clinic_status_deleted=response[i].status_cnt;
						}else if(response[i].status=='Rejected'){
							$scope.clinic_status_rejected=response[i].status_cnt;
						}
				}
			}).error(function(response) {
				$scope.error = response.message;
			});
		}
		
				
    }

]);


angular.module('clinics').directive('helloMaps', function () {
    return function (scope, elem, attrs) {
        var mapOptions,
                latitude = attrs.latitude,
                longitude = attrs.longitude,
                map;

        latitude = latitude && parseFloat(latitude, 10) || 18.52043;
        longitude = longitude && parseFloat(longitude, 10) || 73.85674;

        mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(latitude, longitude)
        };

        map = new google.maps.Map(elem[0], mapOptions);
        google.maps.event.addListener(map, "click", function (e) {
            //lat and lng is available in e object
            latLong = e.latLng;
            scope.getLatLong(latLong);

        });
    };
});



