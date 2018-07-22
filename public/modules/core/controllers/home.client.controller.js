'use strict';


angular.module('core').controller('HomeController', ['$scope', '$http', '$location', 'Authentication', '$timeout', 'Staff',
    function ($scope, $http, $location, Authentication, $timeout, Staff) {
        // This provides Authentication context.
        $scope.authentication = JSON.parse(Authentication.get('user'));
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


        $scope.cnt = 1;
        $scope.findDentist = function (val) {
            console.log(val);
            if (val) {
                $scope.cnt = $scope.cnt + parseInt(val);
            }
            //var page = {page:((val) ? val : $scope.cnt)};
            if ($scope.cnt > 0) {

                $http.post('/getDentist', {page: $scope.cnt}).success(function (response) {
                    if (response.length > 0) {
                        $scope.allDentists = response;


                        //List of speciality
                        $http.post('/specialityList', {clinic_id: 0}).success(function (response) { //To fetch all speciality list
                            $scope.specialityList = response;
                            for (var j = 0; j < $scope.allDentists.length; j++) {
                                var specOfDent = new Array();
                                if ($scope.allDentists[j].dSpeciality)
                                {
                                    var spec = $scope.allDentists[j].dSpeciality.split(',');
                                    for (var i = 0; i < spec.length; i++) {
                                        specOfDent[i] = $scope.specialityList[i].name;
                                    }
                                }
                                $scope.allDentists[j].val = specOfDent;
                            }
                        }).error(function (response) {
                            $scope.error = response.message;
                        });

                    } else {
                        $scope.cnt -= 1;
                    }

                }).error(function (response) {

                });
            } else {
                $scope.cnt += 1;
            }

        }

        $scope.findEvents = function (moduleName) {
            var id = ($scope.user) ? $scope.user[0].id : null;
            $http.post('/listAllEvents', {status: moduleName, id: id}).success(function (response) {
                $scope.events = response.data;
                for(var i in $scope.events)
                {
                    $scope.events[i].image = ($scope.events[i].image != '' && $scope.events[i].image != null) ? 'images/event_images/'+$scope.events[i].image : 'modules/core/images/news-events-1.jpg';
                }
            }).error(function (response) {
                console.log(response);
            });
        }

        $scope.findNews = function () {
            $http.post('/listActivity').success(function (response) {
                $scope.activity = response.data;
            }).error(function (response) {
                console.log(response);
            });
        }

        $scope.getNotificationDescription = function () {
            $http.post('/getNotificationDescription').success(function (response) {
                console.log(response);
                $scope.notifications = response;
            }).error(function (response) {

            });
        }

    }
]);


angular.module('core').controller('ContactController', ['$scope', '$location', '$http',
    function ($scope, $location, $http) {
        $scope.submitContact = function () {
            $scope.success = undefined;
            $http.post('/sendContact', $scope.contact).success(function (response) {
                if (response.status == true)
                {
                    $scope.contact = {first_name: '', last_name: '', contact_no: '', email: '', message: ''};
                }
                $scope.error = undefined;
                $scope.success = response.desc;
            }).error(function (response) {
                $scope.error = response[0];
            });

        }
    }
]);
angular.module('core').controller('LoaderController', ['$scope', '$location', 'Authentication', '$rootScope', '$timeout',
    function ($scope, $location, Authentication, $rootScope, $timeout) {
        $('#loader-container').remove();
        $("body").append('<div id="loader-container"><div class="" id="opaco" style="background-color: rgb(0, 0, 0); left: 0px; opacity: 0.7; position: fixed; top: 0px; width: 100%; height: 100%; z-index: 9999;"></div><div style="background: url(\'/modules/core/images/preloader_img.gif\') no-repeat scroll center center #fff !important;border-radius: 50%;content: \'\';height: 130px;left: 50%; margin: -65px 0 0 -65px; position: absolute;top: 50%;width: 130px;z-index: 99999;">&nbsp;</div></div>');
        $timeout(function () {
            setTimeout(function () {
                $('#loader-container').hide();
            }, 2000);
        });
    }
]);
