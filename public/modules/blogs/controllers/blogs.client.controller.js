'use strict';

// Blogs controller
angular.module('blogs').controller('BlogsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Blogs', '$upload',
    function ($scope, $http, $stateParams, $location, Authentication, Blogs, $upload) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        //$scope.dentist = JSON.parse(Authentication.get('user'));
		//console.log('tests');
		//return false;
        $scope.blog_data = '';
        $scope.isOwner = ($scope.authentication != null && $scope.authentication[0].role_id == 1) ? 'admin' : false;
        $scope.moduleName = '';
        $scope.filterVal = '';
        // Find a list of Blogs //
        /* Related to pagination */
        $scope.itemsPerPage = 10; //Number of records per page//
        $scope.currentPage = 1; //Default value of page number within pagination//
        $scope.blog_data = [];
        /* End */
        $scope.find = function (moduleName, searchVal, pageVal) {
            moduleName = ($scope.moduleName == '') ? moduleName : $scope.moduleName;
            //Pagination//
            $scope.pagedItems = [];
            var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined') ? pageVal : $scope.currentPage;
            page.perPage = $scope.itemsPerPage;
            //End//			
            $scope.newBlog = {};
            $scope.newBlog.isImage = false;
            if (!$scope.authentication && moduleName != 'blog') {
                $location.path('/');
            } else {

                $http.post('/getAllBlogTopics', {module: moduleName, searchVal: searchVal, user_id: (($scope.authentication) ? $scope.authentication[0].id : ''), page: page}).success(function (response) {
                    $scope.blog_data = response.data;
                    for (var i = 0; i < response.data.length; i++) {
                        var dt = new Date(response.data[i].created_date);
                        $scope.blog_data[i].createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
                        if (response.data[i].image == null || response.data[i].image == '') //To set the blog image
                        {
                            $scope.blog_data[i].image = "modules/core/images/langara.jpg";
                        } else {
                            $scope.blog_data[i].image = 'images/blog_images/' + response.data[i].image;
                        }
                    }
                    //$scope.items = response.data;
                    //To show the page count of pagination//
                    for (var i = 1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage) ? 1 : 0); i++) {
                        $scope.pagedItems.push(i);
                    }
                    //End//
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }

            window.scrollTo(0, 0); //To scroll the page on top after click on page number of pagination//
        };

        //After click on page number of pagination//
        $scope.setPage = function (moduleName) {
            $scope.currentPage = this.n;
            $scope.find(moduleName, $scope.filterVal, $scope.currentPage);
        };
        //End//
        //After click on Previous Button of pagination//
        $scope.prevPage = function (moduleName) {
            if (($scope.currentPage - 1) < 1)
                return false;
            $scope.currentPage += -1;
            $scope.find(moduleName, $scope.filterVal, $scope.currentPage);
        };
        //End//
        //After click on Next Button of pagination//
        $scope.nextPage = function (moduleName) {
            if (($scope.currentPage + 1) > $scope.pagedItems.length)
                return false;
            $scope.currentPage += 1;
            $scope.find(moduleName, $scope.filterVal, $scope.currentPage);
        };
        //End//

        $scope.publishStatus = function (bId, sVal, index, moduleName) {
            if (confirm((sVal == 'delete') ? 'Do you want to delete this blog' : 'Do you want change the status of this blog ?'))
                $http.post('/blogStatus', {blog: bId, status: sVal}).success(function (response) {
                    if (response.status != 'deleted') {
                        //$scope.blog_data[index].blogStatus = response.status;
                        $scope.find(moduleName, $scope.filterVal, $scope.currentPage);
                        alert(response.message[0]);
                    } else {
                        //$scope.blog_data.splice(index, 1);
                        $scope.find(moduleName, $scope.filterVal, $scope.currentPage);
                        alert(response.message[0]);
                    }
                }).error(function (response) {
                    console.log(response);
                    $scope.error = response.message[0];
                });
        }

        $scope.blogFilter = function (moduleName) {
            $scope.currentPage = 1;
            $scope.find(moduleName, $scope.filterVal);
        };

        //to save blog image
        $scope.uploadFile = function (files) {
            $("#blog-image-container").html('<div class="clinicLoading" ></div>');
            $scope.files = [];
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
                url: '/getTempBlogUrl',
                method: 'POST',
                data: fileName,
                file: $scope.files
            }).success(function (data, status, headers, config) {
                $scope.newBlog.image = data.replace(/"/g, '');
                $scope.newBlog.isImage = true;
                setTimeout(function () {
                    $('.clinicLoading').remove();
                    $("#blog-image-container").html('<img src="/images/blog_images/tmp/' + data.replace(/"/g, '') + '" class="x-80 pull-left">');
                }, 3000);

            }).error(function (err) {
                $scope.uploadInProgress = false;
                console.log('Error uploading file: ' + err.message || err);
            });
        };

        // Create new Blog
        $scope.create = function () {
            if ($scope.newBlog) {
                $scope.newBlog.user_id = $scope.authentication[0].id;
                var blog = new Blogs($scope.newBlog);
                blog.$save(function (response) {
                    $scope.error = false;
                    $scope.success = "Your blog has been posted successfully.Your blog needs admin approval before being posted.";
                    $('.post-new-topic-form').removeClass('new-post-topic-height-blog');
                    if ($scope.blog_data.length < $scope.itemsPerPage) { //if index number of added record is more than recordPerPage then goto next page.
                        $scope.blog_data.push({id: response.insertedId, title: $scope.newBlog.title, created_date: response.created_date, status: 'Pending', commentCnt: 0})
                    } else {
                        $scope.currentPage += 1;
                        $scope.find('my-blog', '', $scope.currentPage);
                    }
                    $scope.newBlog = '';
                }, function (errorResponse) {
                    console.log(errorResponse.data.message[0])
                    $scope.error = errorResponse.data.message[0];
                });
            } else {
                $scope.success = false;
                $scope.error = 'Please fill all required fields.'
            }
        };

        $scope.findOne = function () {
            $scope.blog_comment_data = [];
            $scope.blog_comment_reply = [];
            $scope.authentication = JSON.parse(Authentication.get('user'));
            $scope.blog_detail = '';
            $scope.replyCommentValue = '';
            $scope.newBlog = {};
            $scope.newBlog.isImage = false;
            //To get Details of Blog Post
            $http.post('/getBlogById', ({blog_id: $stateParams.blog_id})).success(function (response) {
                $scope.blog_detail = response;
                if ($scope.authentication != null && response[0].user_id == $scope.authentication[0].id) //if logged in user is owner of this blog
                {
                    $scope.isOwner = true;
                }
                for (var i = 0; i < response.length; i++) {
                    var dt = new Date(response[i].created_date);
                    $scope.blog_detail[i].createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();

                    if (response[i].image == null || response[i].image == '') //To set the blog image
                    {
                        $scope.blog_detail[i].image = "modules/core/images/langara.jpg";
                    } else {
                        $scope.blog_detail[i].image = 'images/blog_images/' + response[i].image;
                    }
                }
            }).error(function (response) {
                $scope.error = response.message[0];
            });
            //To get all comments of any blog
            $http.post('/blog/getComments', ({blog_id: $stateParams.blog_id})).success(function (response) {
                for (var a = 0; a < response.length; a++) {
                    if (typeof response[a] != 'undefined') {
                        for (var i = 0; i < response[a].length; i++) {
                            var dt = new Date(response[a][i].created_date);
                            response[a][i].createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
                            if (response[a][i].image == null || response[a][i].image == '') //To set the user image
                            {
                                response[a][i].image = "/modules/core/images/default-pic.jpg";
                            } else {
                                response[a][i].image = '/images/profile_images/' + response[a][i].image;
                            }
                        }
                    }
                }
                $scope.blog_comment_data = response[0];
                $scope.blog_comment_reply = (typeof response[1] != 'undefined') ? response[1] : [];
                //console.log(response);
            }).error(function (response) {
                $scope.error = response.message[0];
            });
        }

        $scope.addComment = function () {
            if ($scope.authentication == null || $scope.authentication[0].id == undefined)
            {
                $scope.CommentError = "Please login to post comment !!";
                return false;
            }
            if (document.getElementById('blog_comment').value.length > 5) {
                $scope.data = {reference: 'blog', ref_id: $stateParams.blog_id, user_id: $scope.authentication[0].id, description: document.getElementById('blog_comment').value};
                //$scope.data.push({reference: 'blog', ref_id: $stateParams.blog_id, user_id: $scope.authentication[0].id, description: document.getElementById('blog_comment').value});
                //console.log($scope.data);
                //if($scope.authentication[0].role_id=="2"){
                $http.post('/blog/addComment', $scope.data).success(function (response) {
                    $scope.CommentError = false;
                    var dt = new Date(response[0].created_date);
                    var createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
                    var resdata = {
                        first_name: response[0].first_name,
                        last_name: response[0].last_name,
                        image: ((response[0].image == null || response[0].image == '') ? '/modules/core/images/default-pic.jpg' : '/images/profile_images/' + response[0].image),
                        id: response[0].id,
                        created_date: response[0].created_date,
                        description: response[0].description,
                        createdDate: createdDate
                    }
                    $scope.blog_comment_data.push(resdata);
                    document.getElementById('blog_comment').value = "";

                }).error(function (response) {
                    $scope.error = response.message[0];
                });
                //}
            } else {
                $scope.CommentError = "Please leave your message as more than 5 charecters !!";
            }
        }

        $scope.replyComment = function (item) {
            $scope.selected = item;
        }

        $scope.closeComment = function () {
            $scope.selected = false;
        }

        $scope.isSelected = function (item) {
            return $scope.selected == item
        }

        $scope.submitReplyComment = function (comment_id) {
            if ($scope.replyCommentValue.length > 0) {
                $scope.data = {
                    user_id: $scope.authentication[0].id,
                    ref_id: comment_id,
                    reference: 'comment',
                    description: $scope.replyCommentValue
                };
                $http.post('/blog/addComment', $scope.data).success(function (response) {
                    $scope.selected = false;
                    var dt = new Date(response[0].created_date);
                    var createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
                    var newdata = {
                        first_name: response[0].first_name,
                        last_name: response[0].last_name,
                        image: ((response[0].image == null || response[0].image == '') ? '/modules/core/images/default-pic.jpg' : '/images/profile_images/' + response[0].image),
                        id: response[0].id,
                        created_date: response[0].created_date,
                        description: response[0].description,
                        createdDate: createdDate,
                        ref_id: response[0].ref_id,
                        user_id: response[0].user_id
                    }
                    $scope.blog_comment_reply.push(newdata);
                    $scope.replyCommentValue = ''; //To remove previous comment data
                }).error(function (response) {
                    $scope.error = response.message[0];
                });
            } else {
                alert('Message can not be blank')
            }
        }
        $scope.updateBlog = function (item) {
            var blogData = {
                id: $stateParams.blog_id,
                title: $scope.blog_detail[0].title,
                description: $scope.blog_detail[0].description,
                isImage: false
            };
            if ($scope.newBlog.isImage == true) {
                blogData.isImage = true;
                blogData.image = $scope.newBlog.image;
            }
            $http.post('/updateBlog', blogData).success(function (response) {
                $scope.error = false;
                $scope.success = response.message;
                $('.post-content-section').removeClass('hide');
                $('.edit-post-form').removeClass('show');
                $('.edit-icon').removeClass('hide');
                if (response.image != null && response.image != '') //To set the blog image
                {
                    $scope.blog_detail[0].image = 'images/blog_images/' + response.image;
                }
            }).error(function (response) {
                console.log(response);
                $scope.error = response.message[0];
            });
        }

        $scope.recentBlogs = function () {
            $http.post('/recentBlog').success(function (response) {
                console.log(response);
                $scope.recentBlogs = response;
            }).error(function (response) {
                console.log(response);
                $scope.error = response[0];
            });
        }

        $scope.deleteBlogComment = function (id, index) {
            var r = confirm('Are you sure to delete this comment?');
            if (r == true) {
                $http.post('/deleteBlogComment', {id: id}).success(function (response) {
                    console.log(response);
                    if (response) {
                        $scope.blog_comment_data.splice(index, 1);
                        alert(response.message);
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        }

        $scope.deleteBlogCommentReply = function (id, index) {
            var r = confirm('Are you sure to delete this reply?');
            if (r == true) {
                $http.post('/deleteBlogCommentReply', {id: id}).success(function (response) {
                    console.log(response);
                    if (response) {
                        $scope.blog_comment_reply.splice(index, 1);
                        alert(response.message);
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        }

    }
]);
