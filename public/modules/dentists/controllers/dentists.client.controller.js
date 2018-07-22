'use strict';

// Dentists controller
angular.module('dentists').controller('DentistsController', ['$scope', '$http', '$stateParams', '$location', '$upload', 'Users', 'Authentication', 'Dentists', 'WeekDays', 'Dentist', 'Staff',
    function ($scope, $http, $stateParams, $location, $upload, Users, Authentication, Dentists, WeekDays, Dentist, Staff) {
        /* $(window).unload(function(){
         localStorage.clear();
         });*/
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.filterVal = '';
        /* Related to pagination */
        $scope.itemsPerPage = 10; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        $scope.dentist = [];
        /* End */

        if ($scope.authentication != null) {
            if ($scope.authentication[0].image == null || $scope.authentication[0].image == '') //To set the user image
            {
                $scope.authentication[0].image = "profilethumb.png";
            }
        }

        if ($scope.authentication != null && $scope.authentication[0].role_id == 1) {
            console.log($stateParams.dentistId);
            $http.post('/getUserByUserId', {user_id: $stateParams.dentistId}).success(function (response) {
                // If successful we assign the response to the global user model
                //$scope.authentication.user = response;
                // And redirect to the index page
                $scope.data = response;
                console.log($scope.data);


            }).error(function (response) {
                $scope.error = response.message;
            });
        }

        $http.post('/areaList').success(function (response) { //To fetch all area list
            $scope.areaList = response;
        }).error(function (response) {
            $scope.error = response.message;
        });
        //login
        $scope.signup = function () {
            if ($scope.credentials != undefined)
                $scope.credentials.role_id = "2";
            $http.post('/auth/signup', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                //$scope.authentication.user = response;
                // And redirect to the index page
                //console.log(response.status);
                alert(response.message);
                $location.path('/');

            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        // Create new Dentist
        $scope.create = function () {
            // Create new Dentist object
            //var dentist = new Dentists ($scope.dentist);
            $http.post('/dentists/create', $scope.dentist).success(function (response) {
                $location.path('/dentists');
                $scope.dentist = '';
            }).error(function (response) {
                $scope.error = response[0];
                $("html, body").animate({scrollTop: 0}, "slow");
            })

        };

        // Remove existing Dentist
        $scope.remove = function (dentist, index) {
            if (!$scope.authentication) {
                $location.path('/');
            }
            if (dentist) {
                if (confirm('Do you really want to delete ?')) {
                    $http.post('/removeDentist', {id: dentist}).success(function (response) { //To Delete clinic
                        if (response) {
                            $scope.dentists.splice(index, 1);
                            alert(response.message);
                        }
                    }).error(function (response) {
                        $scope.error = response.message;
                    });
                }
            }
        };

        // Update existing Dentist
        $scope.update = function () {
            if (!$scope.authentication) {
                $location.path('/');
            }
            var user = '';
            if ($scope.authentication[0].role_id == 1) {
                user = new Users($scope.data[0]);
            } else {
                user = new Users($scope.authentication[0]);
            }
            user.$update(function (response) {
                var data = [user];
                $scope.success = true;
                if ($scope.authentication[0].role_id != 1) {
                    Authentication.set('user', JSON.stringify(data));
                    $scope.authentication = JSON.parse(Authentication.get('user'));

                }
                if ($location.search().val == 'editOwn') {
                    Authentication.set('user', JSON.stringify(data));
                    $scope.authentication = JSON.parse(Authentication.get('user'));
                    $scope.authentication[0].display_name = $scope.authentication[0].first_name + ' ' + $scope.authentication[0].last_name;
                    document.getElementById('displayName').innerHTML = $scope.authentication[0].first_name + ' ' + $scope.authentication[0].last_name + '<small>- ' + $scope.authentication[0].email + '</small>';
                }


                $scope.updatePersonalInfoMsg = "update successfully";
                $scope.errorPersonalInfoMsg = '';

            }, function (response1) {
                var res = JSON.parse(JSON.stringify(response1));
                $scope.errorPersonalInfoMsg = res.data[0];
                $scope.updatePersonalInfoMsg = '';
            });
        };

        //Update professional info
        $scope.updateProfessionalInfo = function () {
            if (!$scope.authentication) {
                $location.path('/');
            }
            if ($scope.prof != undefined) {
                $scope.prof.experience = (parseInt($scope.prof.exp_year) * 12) + parseInt($scope.prof.exp_month);
                console.log($scope.prof.experience);
                $scope.id = $stateParams.dentistId;
                //$scope.prof.doctor_id = $stateParams.dentistId;
                var exp_year = $scope.prof.exp_year;
                var exp_month = $scope.prof.exp_month;
                delete $scope.prof.exp_year;
                delete $scope.prof.exp_month;
                delete $scope.prof.image;

                console.log($scope.prof);
                var dentist = new Dentists($scope.prof);
                dentist.$update(function (response) {
                    $scope.prof.exp_year = exp_year;
                    $scope.prof.exp_month = exp_month;
                    console.log(response);
                    $scope.prof = $scope.prof;
                    $scope.updateProfessionalInfoMsg = "Professional Information updated successfully";
                    $scope.errorProfessionalInfoMsg = ''
                }, function (response1) {
                    $scope.prof.exp_year = exp_year;
                    $scope.prof.exp_month = exp_month;
                    var res = JSON.parse(JSON.stringify(response1))
                    $scope.errorProfessionalInfoMsg = res.data[0];
                    $("html, body").animate({scrollTop: 550}, "slow");
                    $scope.updateProfessionalInfoMsg = '';
                });
            }

        };

        //update social links
        $scope.updateSocialLinks = function () {
            if (!$scope.authentication) {
                $location.path('/');
            }
            var data = {
                facebook_url: $scope.prof.facebook_url,
                linkedin_url: $scope.prof.linkedin_url,
                googleplus_url: $scope.prof.googleplus_url,
                twitter_url: $scope.prof.twitter_url,
                skype_name: $scope.prof.skype_name,
                doctor_id: $scope.prof.id
            }
            if ($scope.prof != undefined) {
                $scope.prof.experience = (parseInt($scope.prof.exp_year) * 12) + parseInt($scope.prof.exp_month);
                console.log($scope.prof.experience);
                $scope.id = $stateParams.dentistId;
                var exp_year = $scope.prof.exp_year;
                var exp_month = $scope.prof.exp_month;
                delete $scope.prof.exp_year;
                delete $scope.prof.exp_month;
                console.log($scope.prof);
                var dentist = new Dentists(data);
                $http.post("/dentists/socialLinksUpdate", data).success(function (response) {
                    $scope.prof.exp_year = exp_year;
                    $scope.prof.exp_month = exp_month;
                    console.log(response);
                    $scope.prof = $scope.prof;
                    $scope.updateSocialLinksInfoMsg = "Social Links updated successfully";
                }).error(function (response) {

                });

            }

        };

        $scope.uploadFile = function (files) {
            $scope.updateImageInfo = undefined;
            $("#profile-image-dentist").html('<div class="profileLoading"></div>');
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
                url: '/getTempUrlImage',
                method: 'POST',
                data: fileName,
                file: $scope.files
            }).success(function (data, status, headers, config) {
                setTimeout(function () {
                    if ($scope.authentication[0].role_id != 1) {
                        $scope.authentication[0].image = data.replace(/"/g, '');
                    } else {
                        if ($location.search().val == 'editOwn') {
                            $scope.authentication[0].image = data.replace(/"/g, '');
                        }
                        $scope.data[0].image = data.replace(/"/g, '');
                    }//assign image name to image field of user model
                    $scope.uploadInProgress_flag = true;
                    Authentication.set('user', JSON.stringify($scope.authentication));
                    $("#profile-image-dentist").html('<img id="profile_image" src="/images/profile_images/tmp/' + data.replace(/"/g, '') + '">');
                    //$("#profile-image-dentist").html('<img id="profile_image" src="/images/profile_images/tmp/'+data.replace(/"/g,'')+'">');
                }, 3000);
            }).error(function (err) {
                $scope.uploadInProgress = false;
                console.log('Error uploading file: ' + err.message || err);
            });
        };


        //dentist image updated
        $scope.updateUserProfile = function (isValid) {
            if ($scope.uploadInProgress_flag == true) {
                if (isValid) {
                    $scope.success = $scope.error = null;
                    var user = '';
                    if ($scope.authentication[0].role_id == 1) {
                        // user=new Users($scope.data);
                        user = new Users(
                                {image: $scope.data[0].image, display_name: $scope.data[0].display_name, id: $scope.data[0].id, imageUpdate: true, editOnlyImage: true}
                        );
                    } else {
                        user = new Users(
                                {image: $scope.authentication[0].image, display_name: $scope.authentication[0].display_name, id: $scope.authentication[0].id, imageUpdate: true, editOnlyImage: true}
                        );
                    }
                    //var user = new Users([{image:$scope.authentication[0].image,display_name:$scope.authentication[0].display_name,id:$scope.authentication[0].id,imageUpdate:true,editOnlyImage:true}]);
                    var userData = [];
                    user.$update(function (response) {
                        $scope.success = true;
                        /*userData.push({image:$scope.authentication[0].image});
                         Authentication.set('user',JSON.stringify(userData));
                         $scope.authentication=JSON.parse(Authentication.get('user'));*/
                        if ($location.search().val == 'editOwn') {
                            $("#header_img").attr('src', '/images/profile_images/' + $scope.authentication[0].image);
                        }
                        $scope.updateImageInfo = "Image update successfully";
                        // window.location.reload(true);
                    }, function (response) {
                        $scope.error = response.data.message;
                    });
                } else {
                    $scope.submitted = true;
                }
            }
        };

        // Find a list of dentists
        $scope.find = function (searchVal, pageVal) {
            if (!$scope.authentication) {
                $location.path('/');
            }
            //Pagination//
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = $scope.itemsPerPage;
            //End//		

            $http.post('/dentists/list', {searchVal: searchVal, page: page, status: $stateParams.dentistStatus}).success(function (response) {
                $scope.dentists = response.data;
                //To show the page count of pagination//
                for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                    $scope.pagedItems.push(i);
                }
                //End//
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
        $scope.dentistFilter = function () {
            $scope.currentPage = 1;
            $scope.find($scope.filterVal);
        };

        $scope.changeStatus = function (dentistVal, dStatus) {
            if (confirm('Do you want to change status'))
            {
                $http.post('/changeStatus', {doctor_id: dentistVal, status: dStatus}).success(function (response) {
                    alert('Updated successfully')
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        };

        // Find a list of Dentists by UserId
        $scope.findByUserId = function () {
            $http.post('/getDentistByUserId', {id: $stateParams.dentistId}).success(function (response) {
                //console.log(response);//@dentistData
                if (response[0] != undefined) {
                    $scope.prof = response[0];
                    $scope.getSpeciality(response[0].category_id);
                    $scope.prof.exp_year = parseInt((parseInt(response[0].experience)) / 12);
                    $scope.prof.exp_month = Math.abs((parseInt(response[0].experience)) % 12);
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.findOne = function () {
            if ($stateParams.dentistId) {
                var dData = {};
                dData.id = $stateParams.dentistId;
                $scope.serviceList = [];

                //To get dentist detail
                $http.post('/dentist', dData).success(function (response) {
                    for (var a in response) //To convert speciality string to speciality array
                    {
                        var arr1 = response[a].dSpeciality.split(",");
                        response[a].dSpeciality = arr1.filter(function (item, pos) {
                            return arr1.indexOf(item) == pos;
                        });
                        if (response[a].image == null || response[a].image == '') //To set the user image
                        {
                            response[a].image = "/modules/core/images/default-pic.jpg";
                        } else {
                            response[a].image = '/images/profile_images/' + response[a].image;
                        }
                    }
                    $scope.dentistData = response; //@dentistData
                    var specOfDent = new Array(); //List of speciality
                    for (var a in specialityList)
                    {
                        specOfDent[specialityList[a].id] = specialityList[a].name;
                    }
                    $scope.specOfDent = specOfDent;
                }).error(function (response) {
                    $scope.error = response.message;
                });
                //To get all clinics detail of dentist
                $http.post('/clinic', dData).success(function (response) {
                    for (var a in response) //To convert speciality string to speciality array
                    {
                        if (response[a].image == null || response[a].image == '') //To set the user image
                        {
                            response[a].image = "/modules/clinics/images/default-clinic.png";
                        } else {
                            response[a].image = '/images/clinic_images/' + response[a].image;
                        }

                        var imageData = [];
                        if (response[a].clinic_images == null || response[a].clinic_images == '') //To set the user image
                        {
                            imageData.push("/modules/clinics/images/default-clinic.png");
                        } else {
                            var str_images = response[a].clinic_images.split(",");
                            for (var b in str_images) {
                                str_images[b] = '/images/clinic_images/' + str_images[b];
                                imageData.push(str_images[b]);
                            }
                        }
                        response[a].clinic_images = imageData;
                        if (response[a].cServices != null) {
                            var arr1 = response[a].cServices.split(",");
                            for (var b in arr1) {
                                $scope.serviceList.push(arr1[b]);
                            }
                        }
                    }

                    $scope.clinicData = response; //@clinicData
                    setTimeout(function () {
                        for (var i = 0; i < $scope.clinicData.length; i++)
                        {
                            if ($scope.clinicData[i].clinic_images.length > 1)
                            {
                                $(".default .carousel-" + i).jCarouselLite({
                                    btnNext: ".default #next" + i,
                                    btnPrev: ".default #prev" + i
                                });
                            }
                        }
                    }, 2000);

                }).error(function (response) {
                    $scope.error = response.message;
                });
                $scope.WeekDays = WeekDays; //List of week days
            }

        };

        $scope.changeValue = function (val1, val2) {
            $('#main-image'+val1).attr('src', val2);
        }

        //For change the password
        $scope.changePassword = function (req, res) {
            if (!$scope.authentication) {
                $location.path('/');
            }
            if ($scope.chpass != undefined) {
                $scope.chpass.id = $stateParams.dentistId;
                $http.post('/changePassword', $scope.chpass).success(function (response) {
                    $scope.message = response.message;
                    console.log($scope.message);
                    $scope.chpass.curPassword = '';
                    $scope.chpass.newPass = '';
                    $scope.chpass.cpass = '';

                }).error(function (response) {
                    $scope.message = response.message;
                    console.log($scope.message);
                });
            }

        }

        $scope.getCategories = function () {
            $http.post('/doctorCategoryList').success(function (response) { //To fetch doctors category list
                $scope.categories = response;
            }).error(function (response) {
                console.log(response);
            });
        };
        //get All Speciality with specific dentist speciality
        $scope.getSpeciality = function (catVal) {
            $http.post('getSpecialityWithSpecificSpeciality', {user_id: $stateParams.dentistId, category_id: catVal}).success(function (response) {
                $scope.specs = response;
            }).error(function (response) {
                console.log(response);
            });
        };

        //update or insert speciality
        $scope.updateSpeciality = function () {
            if ($scope.spec)
            {
                $http.post('/updateSpeciality', {speciality_ids: $scope.spec.speciality, doctor_id: $scope.prof.id, category_id: $scope.prof.category_id}).success(function (response) {
                    $scope.updateSpecialityMessage = response.message;
                    delete $scope.updateSpecialityError;
                }).error(function (response) {
                    $scope.updateSpecialityError = response.message;
                    delete $scope.updateSpecialityMessage;
                });
            } else {
                $scope.updateSpecialityError = 'Please select specialty';
                delete $scope.updateSpecialityMessage;
            }
        };

        $scope.changeCategory = function (cVal) {
            $scope.getSpeciality(cVal);
        }

        //Logout
        $scope.signOut = function () {
            Authentication.destroy('user');
            Dentist.destroy('dentist');
            Staff.destroy('staff');
            $location.path('/');
        };

        //get user data
        $scope.getUserData = function () {
            $http.post('/getUserByUserId', {user_id: $stateParams.user_id}).success(function (response) {
                $scope.data = response[0];
                console.log($scope.data);
            }).error(function (response) {
                $scope.error = response.message;
            });
        }

        $scope.findDentistStatus = function () {
            $http.post('/getDentistStatus').success(function (response) {
                for (var i = 0; i < response.length; i++) {
                    if (response[i].status == 'Active') {
                        $scope.dentist_status_active = response[i].status_cnt;
                        console.log($scope.dentist_status_active);
                    } else if (response[i].status == 'Inactive') {
                        $scope.dentist_status_inactive = response[i].status_cnt;
                    } else if (response[i].status == 'deleted') {
                        $scope.dentist_status_deleted = response[i].status_cnt;
                    }
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        }

    }
]);

angular.module('dentists').controller('DentistsControllerTest', ['$scope', '$http', '$stateParams', '$location', 'Authentication',
    /*
     function to handle search filter criteria
     */
    function ($scope, $http, $stateParams, $location, Authentication) {

        var dentistData = {};
        $scope.result = '';
        dentistData.id = $stateParams.dentistId;
        console.log(dentistData.id);
        $http.post('/dentist', dentistData).success(function (response) {
            $scope.result = response;
            console.log($scope.result);
        }).error(function (response) {
            $scope.error = response.message;
        });
        console.log('test');

    }
]);
