'use strict';
// Dentists controller
var specialityList = []; //Declare speciality variable
var categoryList = []; //Declare DoctorCategoryList variable
var searchDataTags = [];
angular.module('dentists')
        .controller('SearchDentistController', ['$scope', '$http', '$stateParams', '$location', 'Authentication',
            function ($scope, $http, $stateParams, $location, Authentication) {
                /*
                 function to handle search dentist from home page.
                 var $scope.search.dentist [value or blank]
                 var $scope.search.area [value or blank]
                 */

                var search = {};
                search.dentistClinic = $stateParams.dentistClinic;
                search.area = $stateParams.area;
                search.speciality = $stateParams.speciality;
                search.category = $stateParams.category;
                $scope.search = search;

                if (categoryList.length < 1) // It will be run only once
                {
                    $http.post('/doctorCategoryList').success(function (response) { //To fetch doctors category list
                        $scope.category = categoryList = response;
                        if ($stateParams.category != 'all' && $stateParams.category != undefined)
                        {
                            var fCat = $stateParams.category.split(',');
                            for (var a in $scope.category)
                            {
                                if ($scope.category[a].id == fCat[0])
                                {
                                    $scope.category[a].isSelected = true;
                                } else {
                                    $scope.category[a].isSelected = false;
                                }
                            }
                        }
                    }).error(function (response) {
                        $scope.error = response.message;
                    });
                } else {
                    $scope.category = categoryList;
                    if ($stateParams.category != 'all' && $stateParams.category != undefined)
                    {
                        var fCat = $stateParams.category.split(',');
                        for (var a in $scope.category)
                        {
                            if ($scope.category[a].id == fCat[0])
                            {
                                $scope.category[a].isSelected = true;
                            } else {
                                $scope.category[a].isSelected = false;
                            }
                        }
                    }
                }


                if (specialityList.length < 1) // It will be run only once
                {
                    $http.post('/specialityList', {clinic_id: 0}).success(function (response) { //To fetch all speciality list
                        $scope.spec = specialityList = response;
                        if ($stateParams.speciality != 'all' && $stateParams.speciality != undefined)
                        {
                            var fSpec = $stateParams.speciality.split(',');
                            for (var a in $scope.spec)
                            {
                                if ($scope.spec[a].id == fSpec[0])
                                {
                                    $scope.spec[a].isSelected = true;
                                } else {
                                    $scope.spec[a].isSelected = false;
                                }
                            }
                        }
                    }).error(function (response) {
                        $scope.error = response.message;
                    });
                } else {
                    $scope.spec = specialityList;
                    if ($stateParams.speciality != 'all' && $stateParams.speciality != undefined)
                    {
                        var fSpec = $stateParams.speciality.split(',');
                        for (var a in $scope.spec)
                        {
                            if ($scope.spec[a].id == fSpec[0])
                            {
                                $scope.spec[a].isSelected = true;
                            } else {
                                $scope.spec[a].isSelected = false;
                            }
                        }
                    }
                }


//                if ($stateParams.speciality == undefined)
//                {
//                    $scope.selectedSpec = false; //To show Selected speciality
//                } else {
//                    var specArray = $stateParams.speciality.split(',');
//                    $scope.selectedSpec = specArray[specArray.length - 1]; //To show Selected speciality
//                }

                $scope.updateSpec = function (val) {
                    $scope.spec = [];
                    for (var a in specialityList)
                    {
                        if (specialityList[a].category_id === parseInt(val))
                        {
                            $scope.spec.push(specialityList[a]);
                        }
                    }
                };

                $scope.searchDentist = function () {
                    if (typeof $scope.search == "undefined") //if dentist and area name are blank
                        $location.path('/dentistList/'); //redirect to search result page without blank
                    else {
                        $location.path('/dentistList/' + ($scope.search.category || 'all') + '/' + ($scope.search.speciality || 'all') + '/' + ($scope.search.dentistClinic || 'all') + '/' + ($scope.search.area || 'all') + '/' + ($scope.search.exp || '0') + '/'); //redirect to search result page with values
                    }
                };

                $scope.getAndSetLatLongOfCurrentLocation = function () {
                    if (navigator.geolocation) {
                        // timeout at 60000 milliseconds (60 seconds)
                        var options = {timeout: 60000};
                        var val = navigator.geolocation.getCurrentPosition($scope.showLocation, $scope.errorHandler, options);


                    } else {
                        alert("Sorry, browser does not support geolocation!");
                    }
                }

                $scope.showLocation = function (position) {
                    $scope.latitude = position.coords.latitude;
                    $scope.longitude = position.coords.longitude;

                    /*  alert("Latitude : " + $scope.latitude + " Longitude: " + $scope.longitude);*/
                    /*if(typeof  $scope.search == "undefined"){ //if dentist and area name are blank
                     if($scope.latitude != undefined && $scope.longitude != undefined){*/
                    /* $location.path('/dentistList/'+($scope.latitude || 0)+'/'+($scope.longitude || 0)+'/'); //redirect to search result page without blank*/
                    /*}
                     }
                     else{
                     if($scope.latitude != undefined && $scope.longitude != undefined){
                     $location.path('/dentistList/'+($scope.search.speciality || 'all')+'/'+($scope.search.dentistClinic || 'all')+'/'+($scope.search.area || 'all')+'/'+($scope.search.exp || '0')+'/'+($scope.latitude || 0)+'/'+($scope.longitude || 0)+'/');//redirect to search result page with values
                     }
                     }*/

                }

                $scope.errorHandler = function (err) {
                    if (err.code == 1) {
                        alert("Error: Access is denied!");
                    } else if (err.code == 2) {
                        alert("Error: Position is unavailable!");
                    }
                }

                $scope.searchByLatLong = function () {
                    if (typeof $scope.search == "undefined") {//if dentist and area name are blank
                        if ($scope.latitude != undefined && $scope.longitude != undefined) {
                            $location.path('/dentistList/' + ($scope.latitude || '0') + '/' + ($scope.longitude || '0') + '/'); //redirect to search result page without blank
                        }
                    } else {
                        if ($scope.latitude != undefined && $scope.longitude != undefined) {
                            //console.log('/dentistList/'+($scope.search.speciality || 'all')+'/'+($scope.search.dentistClinic || 'all')+'/'+($scope.search.area || 'all')+'/'+($scope.search.exp || '0')+'/'+($scope.latitude || '0')+'/'+($scope.longitude || '0')+'/');
                            $location.path('/dentistList/' + ($scope.search.category || 'all') + '/' + ($scope.search.speciality || 'all') + '/' + ($scope.search.dentistClinic || 'all') + '/' + ($scope.search.area || 'all') + '/' + ($scope.search.exp || '0') + '/' + ($scope.latitude || '0') + '/' + ($scope.longitude || '0') + '/');//redirect to search result page with values
                        }
                    }
                }
            }

        ]);

/*
 function to handle search result page
 var $stateParams['dentistClinic']
 var $stateParams['area']
 */

angular.module('dentists').controller('SearchDentistResultController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', '$filter', 'WeekDays', '$interval',
    function ($scope, $http, $stateParams, $location, Authentication, $filter, WeekDays, $interval) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.date_app = new Date();
        $scope.WeekDays = WeekDays; //List of week days
        var specOfDent = new Array(); //List of speciality
        searchDataTags = [];


        //To get area list//
        $http.post('/areaList').success(function (response) { //To fetch all Area list
            var selectedArea = ($stateParams.area == undefined) ? 'all' : $stateParams.area.toLowerCase().split(',');
            for (var a in response) {
                if (selectedArea.indexOf(response[a].area_name.toLowerCase()) > -1)
                {
                    response[a].isAvailable = "true";
                    searchDataTags.push({val: response[a].area_name, type:'area', urlVal:response[a].area_name.toLowerCase()});
                } else {
                    response[a].isAvailable = "false";
                }
            }
            $scope.areaFilter = response;
            $scope.searchDataTags = searchDataTags;
        }).error(function (response) {
            $scope.error = response.message;
        });


        //To get Category list
        if (categoryList.length < 1)
        {
            $http.post('/doctorCategoryList').success(function (response) { //To fetch doctors category list
                //$scope.specFilter = response;
                $scope.category = categoryList = response;
                var selectedCat = ($stateParams.category == undefined) ? 'all' : $stateParams.category.toLowerCase().split(',');
                for (var a in response) {
                    if (selectedCat.indexOf(response[a].id.toString()) > -1)
                    {
                        response[a].isAvailable = "true";
                        searchDataTags.push({val: response[a].name, type:'category', urlVal:response[a].id});
                    } else {
                        response[a].isAvailable = "false";
                    }
                    //response[a].isAvailable = ((selectedCat.indexOf(response[a].id.toString()) > -1) ? "true" : "false");
                }
                $scope.categoryFilter = response;
                $scope.searchDataTags = searchDataTags;
            }).error(function (response) {
                $scope.error = response.message;
            });
        } else {
            var selectedCat = ($stateParams.category == undefined) ? 'all' : $stateParams.category.toLowerCase().split(',');
            for (var a in categoryList)
            {
                $scope.category = categoryList
                if (selectedCat.indexOf(categoryList[a].id.toString()) > -1)
                {
                    categoryList[a].isAvailable = "true";
                    searchDataTags.push({val: categoryList[a].name, type: 'category', urlVal:categoryList[a].id});
                } else {
                    categoryList[a].isAvailable = "false";
                }
                //categoryList[a].isAvailable = ((selectedCat.indexOf(categoryList[a].id.toString()) > -1) ? "true" : "false")
            }
            $scope.categoryFilter = categoryList;
            $scope.searchDataTags = searchDataTags;
        }

        //To get speciality list
        if (specialityList.length < 1)
        {
            $http.post('/specialityList', {clinic_id: 0}).success(function (response) { //To fetch all speciality list
                specialityList = response;
                for (var a in specialityList)
                {
                    specOfDent[specialityList[a].id] = specialityList[a].name;
                }
                var selectedSpec = ($stateParams.speciality == undefined) ? 'all' : $stateParams.speciality.toLowerCase().split(',');
                for (var a in response) {
                    if (selectedSpec.indexOf(response[a].id.toString()) > -1)
                    {
                        response[a].isAvailable = "true";
                        searchDataTags.push({val: response[a].name, type:'speciality', urlVal:response[a].id});
                    } else {
                        response[a].isAvailable = "false";
                    }
                    //response[a].isAvailable = ((selectedSpec.indexOf(response[a].id.toString()) > -1) ? "true" : "false");
                }
                $scope.specFilter = response;
                $scope.searchDataTags = searchDataTags;
            }).error(function (response) {
                $scope.error = response.message;
            });
        } else {
            var selectedSpec = ($stateParams.speciality == undefined) ? 'all' : $stateParams.speciality.toLowerCase().split(',');
            for (var a in specialityList)
            {
                specOfDent[specialityList[a].id] = specialityList[a].name;
                if (selectedSpec.indexOf(specialityList[a].id.toString()) > -1)
                {
                    specialityList[a].isAvailable = "true";
                    searchDataTags.push({val: specialityList[a].name, type:'speciality', urlVal:specialityList[a].id});
                } else {
                    specialityList[a].isAvailable = "false";
                }
                //specialityList[a].isAvailable = ((selectedSpec.indexOf(specialityList[a].id.toString()) > -1) ? "true" : "false")
            }
            $scope.specFilter = specialityList;
            $scope.searchDataTags = searchDataTags;
        }
        $scope.specOfDent = specOfDent;

        //To get experience data
        var experience = [];
        var selectedExp = ($stateParams.exp == undefined) ? '0' : $stateParams.exp.split(',');
        for (var b = 1; b <= 20; b++)
        {
            experience.push({
                'expYear': b + '+',
                'expSelect': ((selectedExp.indexOf(b.toString() + '+') > -1) ? "true" : "false")
            })
        }
        $scope.experience = experience;

        $scope.updateSpec = function (val) {
            $scope.spec = [];
            for (var a in specialityList)
            {
                if (specialityList[a].category_id === parseInt(val))
                {
                    $scope.spec.push(specialityList[a]);
                }
            }
        };

        /* Related to pagination */
        //$scope.sortingOrder = [];
        //$scope.reverse = false;
        //$scope.filteredItems = [];
        //$scope.groupedItems = [];
        $scope.itemsPerPage = 5; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        $scope.items = [];
        /* End */
        $scope.getDentistData = function (pageVal) { //pageVal = value of page no. to display records//
            $scope.pagedItems = [];
            $scope.totalItems = 0;
            var search = {};
            search.page = pageVal;
            search.perPage = $scope.itemsPerPage;
            search.dentistClinic = ($stateParams.dentistClinic == undefined) ? 'all' : $stateParams.dentistClinic;
            search.area = ($stateParams.area == undefined) ? 'all' : $stateParams.area;
            search.speciality = ($stateParams.speciality == undefined) ? 'all' : $stateParams.speciality;
            search.category = ($stateParams.category == undefined) ? 'all' : $stateParams.category;
            search.experience = ($stateParams.exp == undefined) ? '0' : $stateParams.exp;

            if ($stateParams.latitude != "undefined") {
                search.latitude = ($stateParams.latitude == "undefined" || $stateParams.latitude == "0") ? "0" : $stateParams.latitude;
                search.longitude = ($stateParams.longitude == "undefined" || $stateParams.longitude == "0") ? "0" : $stateParams.longitude;
            }
            $http.post('/dentists/search', search).success(function (response) {
                $scope.totalItems = response.total.totalRes;
                for (var a in response.data) //To convert speciality string to speciality array
                {
                    var arr1 = response.data[a].dSpeciality.split(",");
                    response.data[a].dSpeciality = arr1.filter(function (item, pos) {
                        return arr1.indexOf(item) == pos;
                    });
                    if (response.data[a].image == null || response.data[a].image == '') //To set the user image
                    {
                        response.data[a].image = "/modules/core/images/default-pic.jpg";
                    } else {
                        response.data[a].image = '/images/profile_images/' + response.data[a].image;
                    }
                }
                $scope.items = response.data;
                //To show the page count of pagination//
                for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                    $scope.pagedItems.push(i);
                }
                //End//
                setTimeout(function () {
                    $('#loader-container').hide();
                }, 3000);

            }).error(function (response) {
                $scope.error = response.message;
            });
            window.scrollTo(0, 0); //To scroll the page on top after click on page number of pagination//
        };

        $scope.getDentistData($scope.currentPage); //To fetch search result listing
        //After click on page number of pagination//
        $scope.setPage = function () {
            $scope.currentPage = this.n;
            $scope.getDentistData($scope.currentPage);
        };
        //End//
        //After click on Previous Button of pagination//
        $scope.prevPage = function () {
            $scope.currentPage += -1;
            $scope.getDentistData($scope.currentPage);
        };
        //End//
        //After click on Next Button of pagination//
        $scope.nextPage = function () {
            $scope.currentPage += 1;
            $scope.getDentistData($scope.currentPage);
        };
        //End//
        $scope.goToAppointment = function () {
            alert('Please login before book an appointment.')
        };

        $scope.getSearchData = function () {

            //console.log(specialityList);
            //console.log(categoryList);

//            
//            if ($stateParams.category != undefined && $stateParams.category != 'all')
//            {
//                var catList = $stateParams.category.split(',');
//            }
//            
//            search.dentistClinic = ($stateParams.dentistClinic == undefined) ? 'all' : $stateParams.dentistClinic;
//            search.area = ($stateParams.area == undefined) ? 'all' : $stateParams.area;
//            search.speciality = ($stateParams.speciality == undefined) ? 'all' : $stateParams.speciality;
//            search.category = ($stateParams.category == undefined) ? 'all' : $stateParams.category;
//            search.experience = ($stateParams.exp == undefined) ? '0' : $stateParams.exp;
        };

        $scope.updateArea = function (aVal, chId) {
            var chStatus = document.getElementById(chId).checked;
            if ($stateParams.area == undefined || $stateParams.area == "all") //Area doesn't has any value
                var AreaNew = aVal;
            else {
                var areaArr = $stateParams.area.split(","); //query string to array
                var isFound = false;
                for (var a in areaArr) {
                    if (areaArr[a] == aVal) { //if $this.value found in query string
                        isFound = true;
                        if (!chStatus) // when user un-check the checkbox then remove value from query string
                        {
                            areaArr.splice(a, 1);
                        }
                        break;
                    }
                }
                if (!isFound)  //when user checks the checkbox add value in query string (if not already exist in query string)
                {
                    areaArr.push(aVal);
                }
                if (areaArr.length == 0)
                    areaArr.push('all');
                var AreaNew = areaArr.toString(); //array to query string
            }
            
            //$state.transitionTo ('/dentistList/3/all/all/0/');
            //$window.history.pushState(null, null, '/dentistList/'+($stateParams.speciality || 'all')+'/'+($stateParams.dentistClinic || 'all')+'/'+AreaNew+'/'+($stateParams.exp || '0')+'/');
            //$window.history.pushState(null, null, '/dentistList/all/all/all/0/');
            if ($stateParams.latitude != undefined && $stateParams.longitude != undefined) {
                $location.path('/dentistList/' + ($stateParams.category || 'all') + '/' + ($stateParams.speciality || 'all') + '/' + ($stateParams.dentistClinic || 'all') + '/' + AreaNew + '/' + ($stateParams.exp || '0') + '/' + $stateParams.latitude + '/' + $stateParams.longitude + '/', false); //redirect to search result page with values
            } else {
                $location.path('/dentistList/' + ($stateParams.category || 'all') + '/' + ($stateParams.speciality || 'all') + '/' + ($stateParams.dentistClinic || 'all') + '/' + AreaNew + '/' + ($stateParams.exp || '0') + '/', false); //redirect to search result page with values
            }
            //$scope.getDentistData(); //To fetch search result listing
        };

        $scope.updateCategory = function (cVal, chId) {
            var chStatus = document.getElementById(chId).checked;
            var search = {};
            if ($stateParams.category == undefined || $stateParams.category == "all") //category doesn't has any value
                search.category = cVal;
            else {
                var catArr = $stateParams.category.split(","); //query string to array
                var isFound = false;
                for (var a in catArr) {
                    if (catArr[a] == cVal) { //if value found in query string
                        isFound = true;
                        if (!chStatus) // when user un-check the checkbox then remove value from query string
                            catArr.splice(a, 1);
                        break;
                    }
                }
                if (!isFound)  //when user checks the checkbox add value in query string (if not already exist in query string)
                {
                    catArr.push(cVal);
                }
                if (catArr.length == 0)
                    catArr.push('all');
                search.category = catArr.toString(); //array to query string
            }
            if ($stateParams.latitude != (undefined && '0') && $stateParams.longitude != (undefined && '0')) {
                $location.path('/dentistList/' + (search.category || 'all') + '/' + ($stateParams.speciality || 'all') + '/' + ($stateParams.dentistClinic || 'all') + '/' + ($stateParams.area || 'all') + '/' + ($stateParams.exp || '0') + '/' + $stateParams.latitude + '/' + $stateParams.longitude + '/'); //redirect to search result page with values
            } else {
                $location.path('/dentistList/' + (search.category || 'all') + '/' + ($stateParams.speciality || 'all') + '/' + ($stateParams.dentistClinic || 'all') + '/' + ($stateParams.area || 'all') + '/' + ($stateParams.exp || '0') + '/'); //redirect to search result page with values
            }

        };

        $scope.updateSpeciality = function (sVal, chId) {
            var chStatus = document.getElementById(chId).checked;
            var search = {};
            if ($stateParams.speciality == undefined || $stateParams.speciality == "all") //speciality doesn't has any value
                search.speciality = sVal;
            else {
                var specArr = $stateParams.speciality.split(","); //query string to array
                var isFound = false;
                for (var a in specArr) {
                    if (specArr[a] == sVal) { //if value found in query string
                        isFound = true;
                        if (!chStatus) // when user un-check the checkbox then remove value from query string
                            specArr.splice(a, 1);
                        break;
                    }
                }
                if (!isFound)  //when user checks the checkbox add value in query string (if not already exist in query string)
                {
                    specArr.push(sVal);
                }
                if (specArr.length == 0)
                    specArr.push('all');
                search.speciality = specArr.toString(); //array to query string
            }

            if ($stateParams.latitude != (undefined && '0') && $stateParams.longitude != (undefined && '0')) {
                $location.path('/dentistList/' + ($stateParams.category || 'all') + '/' + search.speciality + '/' + ($stateParams.dentistClinic || 'all') + '/' + ($stateParams.area || 'all') + '/' + ($stateParams.exp || '0') + '/' + $stateParams.latitude + '/' + $stateParams.longitude + '/'); //redirect to search result page with values
            } else {
                $location.path('/dentistList/' + ($stateParams.category || 'all') + '/' + search.speciality + '/' + ($stateParams.dentistClinic || 'all') + '/' + ($stateParams.area || 'all') + '/' + ($stateParams.exp || '0') + '/'); //redirect to search result page with values
            }

        };

        $scope.updateExperience = function (eVal, chId) {
            var chStatus = document.getElementById(chId).checked;
            var search = {};
            if ($stateParams.exp == undefined || $stateParams.exp.toString() == "0") //Experience doesn't has any value
            {
                search.experience = eVal;
            }
            else {
                var expArr = $stateParams.exp.split(","); //query string to array
                var isFound = false;
                for (var a in expArr) {
                    if (expArr[a] == eVal) { //if value found in query string
                        isFound = true;
                        if (!chStatus) // when user un-check the checkbox then remove value from query string
                            expArr.splice(a, 1);
                        break;
                    }
                }
                if (!isFound)  //when user checks the checkbox add value in query string (if not already exist in query string)
                {
                    expArr.push(eVal);
                }
                if (expArr.length == 0)
                    expArr.push('0');
                search.experience = expArr.toString(); //array to query string
            }

            if ($stateParams.latitude != (undefined && '0') && $stateParams.longitude != (undefined && '0')) {
                $location.path('/dentistList/' + ($stateParams.category || 'all') + '/' + ($stateParams.speciality || 'all') + '/' + ($stateParams.dentistClinic || 'all') + '/' + ($stateParams.area || 'all') + '/' + search.experience + '/' + $stateParams.latitude + '/' + $stateParams.longitude + '/'); //redirect to search result page with values$location.path('/dentistList/'+($stateParams.speciality || 'all')+'/'+($stateParams.dentistClinic || 'all')+'/'+AreaNew+'/'+($stateParams.exp || '0')+'/'+$stateParams.latitude+'/'+$stateParams.longitude+'/',false); //redirect to search result page with values
            } else {
                $location.path('/dentistList/' + ($stateParams.category || 'all') + '/' + ($stateParams.speciality || 'all') + '/' + ($stateParams.dentistClinic || 'all') + '/' + ($stateParams.area || 'all') + '/' + search.experience + '/'); //redirect to search result page with values
            }
        };

        $scope.removeFilter = function (type, val){
            
            var categoryNew = $stateParams.category;
            var specialtyNew = $stateParams.speciality;
            var dentistClinicNew = $stateParams.dentistClinic;
            var areaNew = $stateParams.area;
            
            var qArr = $stateParams[type].split(","); //query string to array
            for (var a in qArr) {
                if (qArr[a] == val) { //if value found in query string
                    qArr.splice(a, 1);
                    break;
                }
            }
            
            switch(type)
            {
                case 'category' : categoryNew = qArr.toString(); //array to query string
                    break;
                case 'speciality' : specialtyNew = qArr.toString(); //array to query string
                    break;
                case 'dentistClinic' : dentistClinicNew = qArr.toString(); //array to query string
                    break;
                case 'area' : areaNew = qArr.toString(); //array to query string
                    break;
            }
           // var newArea = qArr.toString(); //array to query string
            
            if ($stateParams.latitude != (undefined && '0') && $stateParams.longitude != (undefined && '0')) {
                $location.path('/dentistList/' + ($stateParams.category || 'all') + '/' + ($stateParams.speciality || 'all') + '/' + ($stateParams.dentistClinic || 'all') + '/' + ($stateParams.area || 'all') + '/' + ($stateParams.exp || '0') + '/' + $stateParams.latitude + '/' + $stateParams.longitude + '/'); //redirect to search result page with values
            } else {
                $location.path('/dentistList/' + (categoryNew || 'all') + '/' + (specialtyNew || 'all') + '/' + (dentistClinicNew || 'all') + '/' + (areaNew || 'all') + '/' + ($stateParams.exp || '0') + '/'); //redirect to search result page with values
            }
        };
        
        $scope.attachSecretMessage = function (marker, num, message, clinic) {
            //var message = ['This', 'is', 'the', 'secret', 'message'];
            if($scope.authentication){
                var message = message.replace('href="app_link"','href="#!/appointments/create/'+clinic+'"');
            } else {
                var message = message.replace('href="app_link"','href="javascript:void(0);" onclick="alert(\'Please login to book an appointment\')"');
            }
            var infowindow = new google.maps.InfoWindow({
                content: message
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(marker.get('map'), marker);
            });
            /*
            var message = ['This', 'is', 'the', 'secret', 'message'];
            var infowindow = new google.maps.InfoWindow({
                content: message[num]
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(marker.get('map'), marker);
            });*/
        };

        $scope.getMapData = function (callback) {
            /*var stopInt = $interval(function () {
             if ($scope.items.length > 0)
             {
             $interval.cancel(stopInt);
             stopInt = undefined;
             callback(false, $scope.items);
             }
             }, 500); */
            
            var search = {};
            search.page = 'map';
            search.perPage = 0;
            search.dentistClinic = ($stateParams.dentistClinic == undefined) ? 'all' : $stateParams.dentistClinic;
            search.area = ($stateParams.area == undefined) ? 'all' : $stateParams.area;
            search.speciality = ($stateParams.speciality == undefined) ? 'all' : $stateParams.speciality;
            search.category = ($stateParams.category == undefined) ? 'all' : $stateParams.category;
            search.experience = ($stateParams.exp == undefined) ? '0' : $stateParams.exp;

            if ($stateParams.latitude != "undefined") {
                search.latitude = ($stateParams.latitude == "undefined" || $stateParams.latitude == "0") ? "0" : $stateParams.latitude;
                search.longitude = ($stateParams.longitude == "undefined" || $stateParams.longitude == "0") ? "0" : $stateParams.longitude;
            }
            $http.post('/dentists/search', search).success(function (response) {
                callback(false, response.data);
             }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]);

/*
 function to handle search filter criteria
 */
var app = angular.module('dentists');

app.controller('testFileController', ['$scope', '$upload', function ($scope, $upload) {
        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.upload = function (files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    console.log(file);
                    return false;
                    $upload.upload({
                        url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                        fields: {
                            'username': $scope.username
                        },
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' +
                                evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' +
                                JSON.stringify(data));
                    });
                }
            }
        };
    }]);



angular.module('dentists').directive('helloMaps', [function () {
        return function (scope, elem, attrs) {
            scope.getMapData(function (error, value) {
                
                /*
                var mapOptions = {
                    zoom: 13,
                    center: new google.maps.LatLng(18.505005521137843, 73.82726669311523)
                };

                var map = new google.maps.Map(elem[0],
                        mapOptions);



                var mapArrayLat = [18.505005521137843, 18.481481359676955, 18.507203115132786, 18.52763124937298];
                var mapArrayLong = [73.82726669311523, 73.8050365447998, 73.79344940185547, 73.85696411132812];


                for (var i = 0; i < mapArrayLat.length; i++) {
                    var var1 = mapArrayLat[i];
                    var var2 = mapArrayLong[i];
                    var position = new google.maps.LatLng(
                            var1, var2
                            );
                    var marker = new google.maps.Marker({
                        position: position,
                        map: map
                    });

                    marker.setTitle((i + 1).toString());
                    scope.attachSecretMessage(marker, i);
                }
                */
                
                 var mapOptions = {
                 zoom: 12,
                 center: new google.maps.LatLng(18.502026755213436, 73.93280147574842)
                 };

                var map = new google.maps.Map(elem[0], mapOptions);

                var mapArrayLat = [];
                var mapArrayLong = [];
                var messageArr = [];
                var clinicArr = [];
                for (var a in value)
                {
                    mapArrayLat.push(value[a].latitude);
                    mapArrayLong.push(value[a].logitude);
                    messageArr.push('<a href="#!/dentistDetail/'+value[a].dentistId+'" target="_blank"> Dr. '+value[a].first_name+' '+value[a].last_name + '</a>, '+value[a].doctorCategory+'<br/><b>Clinic:</b> '+value[a].name+'<br/><a href="app_link">Book Appointment</a>');
                    clinicArr.push(value[a].clinicId);
                }
//                var mapArrayLat = [18.505005521137843, 18.481481359676955, 18.507203115132786, 18.52763124937298];
//                var mapArrayLong = [73.82726669311523, 73.8050365447998, 73.79344940185547, 73.85696411132812];


                for (var i = 0; i < mapArrayLat.length; i++) {
                    var var1 = mapArrayLat[i];
                    var var2 = mapArrayLong[i];
                    var position = new google.maps.LatLng(
                            var1, var2
                            );
                    var marker = new google.maps.Marker({
                        position: position,
                        map: map
                    });

                    marker.setTitle((i + 1).toString());
                    scope.attachSecretMessage(marker, i, messageArr[i], clinicArr[i]);
                }
            });
        };
    }]);
