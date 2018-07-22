'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$stateParams', '$location', 'Users', 'Authentication', '$upload',
    function ($scope, $http, $stateParams, $location, Users, Authentication, $upload) {
        $scope.user = JSON.parse(Authentication.get('user'));
        if (!$scope.user)
            $location.path('/');  //If not logged in redirect to home page
        $scope.user[0].imageUpdate = false;

        //for birth year month and date


        if ($scope.user[0].image == null || $scope.user[0].image == '') //To set the user image
        {
            $scope.user[0].image = "profilethumb.png";
        }


        $http.post('/areaList').success(function (response) { //To fetch all area list
            $scope.areaList = response;
        }).error(function (response) {
            $scope.error = response.message;
        });

        // Check if there are additional accounts 
        $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
            for (var i in $scope.user.additionalProvidersData) {
                return true;
            }

            return false;
        };

        // Check if provider is already in use with current user
        $scope.isConnectedSocialAccount = function (provider) {
            return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
        };

        // Remove a user social account
        $scope.removeUserSocialAccount = function (provider) {
            $scope.success = $scope.error = null;
            $http.delete('/users/accounts', {
                params: {
                    provider: provider
                }
            }).success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.user = Authentication.user = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
        };


        $scope.uploadFile = function (files) {
            $("#profile-image-container").html('<div class="clinicLoading" ></div>');
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
                $scope.user[0].image = data.replace(/"/g, '');
                $scope.user[0].imageUpdate = true;
                setTimeout(function () {
                    $("#profile-image-container").html('<img id="profile_image" src="/images/profile_images/tmp/' + data.replace(/"/g, '') + '" height="100" width="100">');
                }, 3000);
                //$("#profile_image").attr("src","/images/profile_images/tmp/"+data.replace(/"/g,''));
            }).error(function (err) {
                $scope.uploadInProgress = false;
                console.log('Error uploading file: ' + err.message || err);
            });
        };

        // Update a user profile
        $scope.updateUserProfile = function () {
            if ($scope.user) {
                if ($scope.user[0].area_id != undefined && $scope.user[0].area_id != '') {
                    $scope.success = $scope.error = null;
                    var user = new Users($scope.user[0]);
                    var userData = [];
                    user.$update(function (response) {
                        $scope.success = true;
                        userData.push(response);
                        Authentication.set('user', JSON.stringify(userData));
                        document.getElementById('displayName').innerHTML = $scope.user[0].first_name + ' ' + $scope.user[0].last_name + ' <span class="caret">';
                        alert("updated successfully");
                        //window.location.reload(true);
                    }, function (response) {
                        $scope.error = response.data[0]
                    });
                } else {
                    $scope.error = 'Required area';
                }
            } else {
                $scope.submitted = true;
                alert('You are not authorized person to update profile.');
            }
        };

        // Change user password
        $scope.changePassword = function () {

            if ($scope.chpass != undefined) {
                $scope.chpass.id = $scope.user[0].id;
                $http.post('/changePassword', $scope.chpass).success(function (response) {
                    $scope.message = response.message;
                    $scope.chpass.curPassword = '';
                    $scope.chpass.newPass = '';
                    $scope.chpass.cpass = '';

                }).error(function (response) {
                    $scope.message = response.message;
                    console.log($scope.message);
                });
            }
        };


        $scope.getYearMonthDate = function () {
            $scope.years = [];
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
        }

        $scope.addNewMember = function () {
            if ($scope.credentials != undefined) {
                $scope.credentials.role_id = "5";
                $scope.credentials.parent_id = $scope.user[0].id;
                $scope.credentials.created_by = $scope.user[0].id;
                if ($stateParams.user_id) {
                    $scope.credentials.id = $stateParams.user_id;
                }

                $http.post('/addNewMember', $scope.credentials).success(function (response) {
                    if (response.status == "false") {
                        $scope.error = response.message[0];
                        console.log($scope.error);
                    } else {
                        alert(response.message);
                        $location.path('/listMember');
                    }

                }).error(function (response) {
                    $scope.error = response[0];
                });
            } else {
                $scope.error = "Please fill all the required fields."
            }
        }

        $scope.getMember = function () {
            $http.post('/getMember', {id: $scope.user[0].id}).success(function (response) {
                $scope.credentials = response;
            }).error(function (response) {
            });
        }

        $scope.find = function () {
            if ($stateParams.user_id) {
                $http.post('/getMember', {member_id: $stateParams.user_id}).success(function (response) {
                    $scope.credentials = response[0];
                    $scope.isEdit = true;
                    var date = new Date(response[0].birth_date);
                    $scope.credentials.birth_date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                }).error(function (response) {
                });
            } else {
                $scope.isEdit = false;
            }
        }

        $scope.deleteMember = function (id, index) {
            $http.post('/addNewMember', {id: id, status: 'deleted'}).success(function (response) {
                $scope.credentials.splice(index, 1);
                alert("Member deleted successfully.");
            }).error(function (response) {
            });
        }
    }
]);
