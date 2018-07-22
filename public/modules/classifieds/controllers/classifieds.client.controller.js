'use strict';

// Classifieds controller
angular.module('classifieds').controller('ClassifiedsController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Classifieds',
    function ($scope, $stateParams, $location, $http, Authentication, Classifieds) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.category = 'Select Category';

        /* Related to pagination */
        $scope.itemsPerPage = 10; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        $scope.forum_data = [];
        /* End */
        $scope.filterVal = '';

        $scope.isOwner = ($scope.authentication != null && $scope.authentication[0].role_id == 1) ? 'admin' : false;
        if ($scope.isOwner == 'admin' && $location.search().val == 'editAdmin') {
            $('.post-new-topic-form').attr('style', 'height:440px;');
            $('.post-new-topic-form').addClass('new-post-topic-height');
        }
        console.log($scope.isOwner);
        // Create new Classified
        $scope.create = function () {

            // Create new Classified object
            var classified = new Classifieds({
                title: this.title,
                classified_category_id: this.category,
                description: this.description,
                user_id: $scope.authentication[0].id
            });
            if (classified && $scope.category != "Select Category") {
                // Redirect after save
                $http.post('/classifieds/create', classified).success(function (response) {
                    // Clear form fields
                    $scope.error = undefined;
                    var data = {
                        category_name: $scope.category,
                        created_date: new Date(),
                        description: $scope.description,
                        display_name: $scope.authentication[0].display_name,
                        id: response.insertId,
                        title: $scope.title,
                        cmtCnt: 0
                    }
                    $scope.classifieds.push(data);
                    $scope.msgVal = true;
                    $scope.title = '';
                    $scope.category = 'Select Category';
                    $scope.description = '';
                    $('.post-new-topic-form').removeAttr('style');
                    $('.post-new-topic-form').removeClass('new-post-topic-height-classified');

                }).error(function (response) {

                    $scope.error = response.message[0];
                    $scope.msgVal = false;
                });
            } else {
                $scope.error = 'Please select category';
                $scope.msgVal = false;
            }
        };

        // Remove existing Classified
        $scope.remove = function (classified) {
            if (classified) {
                classified.$remove();

                for (var i in $scope.classifieds) {
                    if ($scope.classifieds [i] === classified) {
                        $scope.classifieds.splice(i, 1);
                    }
                }
            } else {
                $scope.classified.$remove(function () {
                    $location.path('classifieds');
                });
            }
        };

        // Update existing Classified
        $scope.update = function () {
            $scope.success = '';
            console.log($scope.classified[0]);
            var data = {
                title: $scope.classified[0].title,
                description: $scope.classified[0].description,
                id: $stateParams.classifiedId,
                classified_category_id: $scope.classified[0].classified_category_id
            }
            $http.post('/updateClassifiedById', data).success(function (response) {
                /* $scope.classified[0].title=$scope.classified[0].title;
                 $scope.classified[0].description=$scope.classified[0].description;
                 $scope.classified[0].classified_category_id=$scope.classified[0].classified_category_id;*/
                $scope.success = response.messages;
                $('.post-new-topic-form').removeAttr('style');
                $('.post-new-topic-form').removeClass('new-post-topic-height');
            }).error(function (response) {
                $scope.error = response.message[0];
            });

        };

        // Find a list of Classifieds
        $scope.find = function (searchVal, id, categoryType, pageVal) {
            //Pagination//
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = $scope.itemsPerPage;
            //End//

            if (!$scope.authentication) {
                $location.path('/');
            }
            id = ($scope.authentication != null && $scope.authentication[0].role_id == 1) ? 'admin' : false;
            $http.post('/classifieds', {id: id, page: page, text: searchVal, val: categoryType}).success(function (response) {
                $scope.classifieds = response.data;
                //To show the page count of pagination//
                for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                    $scope.pagedItems.push(i);
                }
                //End//
            })
            //console.log($scope.classifieds);
        };


        //After click on page number of pagination//
        $scope.setPage = function (searchVal, id) {
            $scope.currentPage = this.n;
            $scope.find($scope.filterVal, id, '', $scope.currentPage);
        };
        //End//
        //After click on Previous Button of pagination//
        $scope.prevPage = function (searchVal, id) {
            if (($scope.currentPage - 1) < 1)
                return false;
            $scope.currentPage += -1;
            $scope.find($scope.filterVal, id, '', $scope.currentPage);
        };
        //End//
        //After click on Next Button of pagination//
        $scope.nextPage = function (searchVal, id) {
            if (($scope.currentPage + 1) > $scope.pagedItems.length)
                return false;
            $scope.currentPage += 1;
            $scope.find($scope.filterVal, id, '', $scope.currentPage);
        };
        //End//
        //Filter forum
        $scope.classifiedFilter = function (firstP, id) {
            $scope.currentPage = 1;
            $scope.find($scope.filterVal, id, $scope.currentPage);
        };

        // Find existing Classified
        $scope.findOne = function () {
            $http.post('/classifiedById', {classified_id: $stateParams.classifiedId}).success(function (response) {
                $scope.classified = response;
            }).error(function (response) {

            });
        };

        $scope.getCategory = function (moduleName) {
            if (!$scope.authentication && moduleName != 'list') {
                $location.path('/');
            } else {
                $http.post('classified/getCategory', {classified_id: 0}).success(function (response) {
                    $scope.categories = response;
                }).error(function (response) {

                });
            }
        }

        $scope.searchClassified = function (id) {

            if ($scope.search != undefined) {
                $http.post('/classifieds', {text: $scope.search.classified, id: id, val: $scope.val}).success(function (response) {
                    $scope.classifieds = response.data;
                    //To show the page count of pagination//
                    for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                        $scope.pagedItems.push(i);
                    }
                }).error(function (response) {

                });

            }
        }

        $scope.searchByCategory = function (val, event) {
            // console.log(event);
            var text = '';
            if ($scope.search == undefined) {
                text = '';
            }
            else {
                text = $scope.search.classified;
            }
            $scope.val = val;
            $http.post('/classifieds', {val: val, text: text, id: 0}).success(function (response) {
                $scope.classifieds = response.data;
                console.log(response.data);
            }).error(function (response) {

            });
            $(".list-group-item").each(function () {
                $(this).removeClass("active");
            });
            $(event.target).addClass('active');
        }

        $scope.saveClassfiedComment = function (classified_id) {
            //"display_name":"kartikDentist keshri","image":"160b9dd6-c22e-448b-84e5-c91c66b305de.jpg","description":"sdfdsgds","created_date":"2015-02-13T12:03:00.000Z","id":1}
            if ($scope.authentication != undefined) {
                var data = {
                    user_id: $scope.authentication[0].id,
                    description: $scope.classified.commentText,
                    classified_id: classified_id
                }
                $http.post('/saveClassfiedComment', data).success(function (response) {
                    $scope.classifieds = response;
                    console.log(response);
                    $scope.classifiedComments.push({"display_name": $scope.authentication[0].first_name + ' ' + $scope.authentication[0].last_name, "image": $scope.authentication[0].image, "description": $scope.classified.commentText, "created_date": response.created_date, "id": response.id})
                    $scope.classified.commentText = '';
                }).error(function (response) {

                });

            }
        }
        $scope.getClassfiedComment = function () {
            $http.post('/getClassfiedComment', {classified_id: $stateParams.classifiedId}).success(function (response) {
                $scope.classifiedComments = response;
                console.log(response);
            }).error(function (response) {
                $scope.error = response.message[0];
            });
        }
        //To change classified's status
        $scope.publishStatus = function (cId, sVal, index) {
            if (confirm((sVal == 'delete') ? 'Do you want to delete this Classified topic ?' : 'Do you want change the status of this Classified topic ?'))
                $http.post('/classifiedStatus', {classified: cId, status: sVal}).success(function (response) {
                    if (response.status != 'deleted') {
                        if (index != 'classifiedDetail') {
                            $scope.classifieds[index].cStatus = response.status;
                        }
                        alert(response.message);
                    } else {
                        $scope.classifieds.splice(index, 1);
                        alert(response.message);
                    }
                }).error(function (response) {
                    console.log(response);
                    $scope.error = response.message;
                });
        }

        $scope.deleteClassifiedComment = function (id, index) {
            console.log(id);
            var r = confirm('Are you sure to delete this comment?');
            if (r == true) {
                $http.post('/deleteClassifiedComment', {id: id}).success(function (response) {
                    console.log(response);
                    if (response) {
                        $scope.classifiedComments.splice(index, 1);
                        alert(response.message);
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        }
    }
]);
