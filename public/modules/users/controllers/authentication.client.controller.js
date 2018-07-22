'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'Dentist', 'Staff','socket',
    function ($scope, $http, $location, Authentication, Dentist, Staff,socket) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.showForgot = false;

        // If user is signed in then redirect back home
        /*console.log('aaa'+JSON.parse(Authentication.get('user')));
         if(JSON.parse(Authentication.get('user'))!=null) {
         if ($scope.authentication[0].id)
         $location.path('/home');
         }*/
        $scope.signup = function () {
            if ($scope.credentials != undefined)
                $scope.credentials.role_id = "5";
            console.log($scope.credentials);
            $http.post('/auth/signup', $scope.credentials).success(function (response) {
                alert(response.message[0]);
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message[0];
            });
        };

        $scope.signin = function () {
            $http.post('/auth/signin', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                if (response[0].image == null || response[0].image == '')
                {
                    response[0].image = "/modules/core/images/default-pic.jpg";
                } else {
                    response[0].image = "images/profile_images/" + response[0].image;
                }
                Authentication.set('user', JSON.stringify(response));
                $scope.authentication = JSON.parse(Authentication.get('user'));
                if (response[0].role_id == "5") { //if user type is user
                   // $location.path('/home');
                    location.reload();
                }
                else if (response[0].role_id == "2") { //if user type is dentist
                    $http.post('/dentistIdData', {user_id: response[0].id}).success(function (response1) { //To fetch Dentist Data
                        Dentist.set('dentist', JSON.stringify(response1));
                    }).error(function (response1) {
                        $scope.error = response1.message;
                    });
                    //$location.path('/home');
                     location.reload();
                } else if (response[0].role_id == "1") { //if user type is admin
                    //$location.path('/home');
                     location.reload();
                } else if (response[0].role_id == 3) {
                    $http.post("/getModulesAccessByStaff", {id: response[0].id}).success(function (response2) {
                        Staff.destroy('staff');
                        Staff.set('staff', JSON.stringify(response2));
                        $scope.staffModule = JSON.parse(Staff.get('staff'));
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
                    }).error(function (response2) {
                        $scope.error = response2.message;
                    })
                    console.log($scope.authentication);
                    socket.emit('send:name', {
                        id: $scope.authentication[0].id,
                        name: $scope.authentication[0].display_name,
                        image: $scope.authentication[0].image
                    });
                   // $location.path('/home');
                   location.reload();

                }

            }).error(function (response) {
                $scope.error = response.message[0];
            });
        };

        $scope.askForPasswordReset = function () {
            if (typeof $scope.credentials != 'undefined' && typeof $scope.credentials.forgotEmail != 'undefined') {
                $scope.success = $scope.error = null;
                $http.post('/auth/forgot', $scope.credentials).success(function (response) {
                    // Show user success message and clear form
                    $scope.credentials = null;
                    $scope.success = response.message;

                }).error(function (response) {
                    console.log(response);
                    $scope.credentials = null;
                    $scope.error = response.message;
                });
            } else {
                $scope.error = 'Please enter your account email';
            }
        };
    }
]);

angular.module('users').controller('UserActivationController', ['$scope', '$http', '$location', 'Authentication',
    function ($scope, $http, $location, Authentication) {
        //To activate user account
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $http.post('/isActivatedViaEmail', {authkey: $location.search().val}).success(function (response) {
            if (response.status == "false") {
                $scope.error = response.desc[0];
                console.log($scope.error);
            } else {
                $scope.activationMsg = response;
                setTimeout(function ($location) {
                    window.location = '/';
                }, 3000
                        );
            }
        }).error(function (response) {
            $scope.error = response.message;
        });
    }
]);
