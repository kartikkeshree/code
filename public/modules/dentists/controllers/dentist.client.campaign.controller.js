

angular.module('dentists').controller('CampaignController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Dentist', 'Staff',
    function ($scope, $http, $stateParams, $location, Authentication, Dentist, Staff) {
        $scope.user = JSON.parse(Authentication.get('user'));
        $scope.dentist = JSON.parse(Dentist.get('dentist'));

        //Get staff access module
        $scope.staffModule = JSON.parse(Staff.get('staff'));

        var doctor_id = '';
        var clinic_id = '';

        $scope.getAllPatients = function () {

            if ($scope.user[0].role_id == 3) {
                $scope.staff = JSON.parse(Staff.get('staff'));
                clinic_id = $scope.staff[0].clinicIds;
                doctor_id = $scope.staff[0].doctor_id;
            } else {
                doctor_id = $scope.dentist[0].id;
            }

            $http.post('/getAllPatientsByDentist', {doctor_id: doctor_id}).success(function (response) {
                $scope.users = response;
                console.log($scope.users);
            }).error(function (response) {

            })
        }

        $scope.sendEmailAndSms = function (req, res) {
            console.log($scope.campaign);
            if ($scope.campaign) {
                if ($scope.user[0].role_id == 3) {
                    $scope.staff = JSON.parse(Staff.get('staff'));
                    //$scope.campaign.clinic_id = $scope.staff[0].clinicIds;
                    $scope.campaign.doctor_id = $scope.staff[0].doctor_id;
                } else {
                    $scope.campaign.doctor_id = $scope.dentist[0].id;
                }

                $http.post('/addCampaign', $scope.campaign).success(function (response) {
                    $scope.users = response;
                    alert(response.message);
                    console.log($scope.users);
                    history.back();
                }).error(function (response) {
                    $scope.error = response.message;
                    // alert(response.message);
                });
            } else {
                $scope.error = "Please fill all fields";
            }

        }

        $scope.listCampaignByDentist = function () {
            var searchVal = '';

            if ($scope.search != undefined) {
                searchVal = $scope.search.searchVal;
            }
            if ($scope.user[0].role_id == 3) {
                $scope.staff = JSON.parse(Staff.get('staff'));
                clinic_id = $scope.staff[0].clinicIds;
                doctor_id = $scope.staff[0].doctor_id;
            } else {
                doctor_id = $scope.dentist[0].id;
            }

            $http.post('/listCampaignByDentist', {doctor_id: doctor_id, searchVal: searchVal}).success(function (response) {
                $scope.campaigns = response;
                console.log($scope.users);
            }).error(function (response) {

            })
        }
    }
]);
