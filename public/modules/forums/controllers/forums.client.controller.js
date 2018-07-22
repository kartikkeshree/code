'use strict';

// Forums controller
angular.module('forums').controller('ForumsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Forums',
    function ($scope, $http, $stateParams, $location, Authentication, Forums) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.forum_data = '';
        $scope.isOwner = ($scope.authentication != null && $scope.authentication[0].role_id == 1) ? 'admin' : false;
        $scope.moduleName = '';
        // Create new Forum
        $scope.addForumQuestion = function () {
            $scope.newForum.user_id = $scope.authentication[0].id;
            $http.post('/user/addForumQuestion', $scope.newForum).success(function (response) {
                /*if (response.status == true) {*/
                    var nData = {
                        id: response.id,
                        created_date: response.date,
                        question: $scope.newForum.question,
                        cmtCnt: 0,
                        status: 'Pending'
                    };
                    $scope.success = "Your query has been posted successfully.Your query needs admin approval before being posted." ;
					if($scope.forum_data.length < $scope.itemsPerPage){ //if index number of added record is more than recordPerPage then goto next page.
						$scope.forum_data.push(nData);
					} else {
						$scope.currentPage += 1;
						$scope.find('', '', $scope.currentPage);
					}
					$scope.error = undefined;
                    $scope.newForum = '';
                    $('.post-new-topic-form').removeClass('new-post-topic-height');
                //}
            }).error(function (response) {
                $scope.error = response.message[0];
                $scope.success= undefined;
            })

        };

        // Remove existing Forum
        $scope.getForumDetails = function (id) {
            $location.path('forumDetails/' + id);
        };

        // Update existing Forum
        $scope.update = function () {
            var forumData = {
                id: $stateParams.forum_id,
                question: $scope.forum_detail_data[0].question,
                description: $scope.forum_detail_data[0].description
            };
            $http.post('/updateForum', forumData).success(function (response) {
                $scope.error = false;
                $scope.success = response.message;
                $('.post-new-topic-form').removeClass('new-post-topic-height');
            }).error(function (response) {
                console.log(response);
                $scope.error = response.message[0];
            });
        };

		/* Related to pagination */
		$scope.itemsPerPage = 10; //Number of records per page//
		$scope.currentPage = 1; //Default value of page number within pagination//
		$scope.forum_data = [];
		/* End */
		$scope.filterVal = '';
		
        // Find a list of Forums
        $scope.find = function (moduleName, searchVal, pageVal) {
			
			//Pagination//
			$scope.pagedItems = [];
			var page = {};
            page.page = (pageVal && typeof pageVal != 'undefined')?pageVal:$scope.currentPage;
            page.perPage = $scope.itemsPerPage;
			//End//
            if($scope.moduleName == '')
            {
                $scope.moduleName = moduleName;
            }
            moduleName = $scope.moduleName;
            $scope.newForum = {};
			if (!$scope.authentication && moduleName != 'forum'){
				$location.path('/');
			}else{
				$http.post('/user/getAllForumQuestion', {module:moduleName, searchVal: searchVal, userId: (($scope.authentication)?$scope.authentication[0].id:''), page:page}).success(function (response) {
					$scope.forum_data = response.data;
					for (var i = 0; i < response.data.length; i++) {
						var dt = new Date(response.data[i].created_date);
						$scope.forum_data[i].createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
					}
					//$scope.items = response.data;
					//To show the page count of pagination//
					for (var i=1; i <= Math.floor(response.total.totalRes / $scope.itemsPerPage) + ((response.total.totalRes % $scope.itemsPerPage)?1:0); i++) {
					  $scope.pagedItems.push(i);
					}
					//End//
				}).error(function (response) {
					$scope.error = response.message;
				})
			}
        };
		
		//After click on page number of pagination//
		$scope.setPage = function (moduleName) {
			$scope.currentPage = this.n;
			$scope.find(moduleName, $scope.filterVal, $scope.currentPage);
		};
		//End//
		//After click on Previous Button of pagination//
		$scope.prevPage = function (moduleName) {
			if(($scope.currentPage - 1) < 1)
				return false;
			$scope.currentPage += -1 ;
			$scope.find(moduleName, $scope.filterVal, $scope.currentPage);
		};
		//End//
		//After click on Next Button of pagination//
		$scope.nextPage = function (moduleName) {
			if(($scope.currentPage + 1) > $scope.pagedItems.length)
				return false;
			$scope.currentPage += 1;
			$scope.find(moduleName, $scope.filterVal, $scope.currentPage);
		};
		//End//
		
        // Find existing Forum
        $scope.findOne = function () {
            $scope.replyValue = false;
            $scope.forum_comment_data = [];
            $scope.forum_comment_list = [];

            //$scope.forum_detail_data
            $http.post('/user/getForumQuestionByForumId', {forum_id: $stateParams.forum_id}).success(function (response) {
                $scope.forum_detail_data = response;
                if($scope.authentication != null && response[0].user_id == $scope.authentication[0].id)
                {
                    $scope.isOwner = true;
                }
                for (var i = 0; i < response.length; i++) {
                    if (response[i].image == null || response[i].image == '') //To set the user image
                    {
                        response[i].image = "/modules/core/images/default-pic.jpg";
                    } else {
                        response[i].image = '/images/profile_images/' + response[i].image;
                    }
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        //Filter forum
        $scope.forumFilter = function () {
			$scope.currentPage = 1;
            $scope.find('',$scope.filterVal, $scope.currentPage);
        };

        //Change Status of forum
        $scope.publishStatus = function (fId, sVal, index) {
            if (confirm((sVal == 'delete') ? 'Do you want to delete this forum topic' : 'Do you want change the status of this forum topic ?'))
                $http.post('/forumStatus', {forum: fId, status: sVal}).success(function (response) {
                    if (response.status != 'deleted') {
                        //$scope.forum_data[index].fStatus = response.status;
						$scope.find('',$scope.filterVal, $scope.currentPage);
                        alert(response.message);
                    } else {
                        //$scope.forum_data.splice(index, 1);
						$scope.find('',$scope.filterVal, $scope.currentPage);
                        alert(response.message);
                    }
                }).error(function (response) {
                    console.log(response);
                    $scope.error = response.message;
                });
        }

        $scope.addComment = function () {
            if($scope.authentication == null || $scope.authentication[0].id == undefined)
            {
                $scope.error = "Please login to post comment !!";
                return false;
            }
            //$scope.data = [];
            if(document.getElementById('forum_ans').value==''){
                $scope.error = "Required comment";
                $("html, body").animate({ scrollTop: 0 }, "slow");
                return false;
            }
            $scope.data = {ques_id: $stateParams.forum_id, user_id: $scope.authentication[0].id, answer: document.getElementById('forum_ans').value};
            //console.log($scope.data);
            if ($scope.authentication[0].role_id == "2") {
                $http.post('/dentist/addComment', $scope.data).success(function (response) {
                    var dt = new Date(response[0].created_date);
                    var createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();

                    var resdata = {
                        first_name: response[0].first_name,
                        last_name: response[0].last_name,
                        image: (response[0].image == null || response[0].image == '') ? "/modules/core/images/default-pic.jpg" : '/images/profile_images/' + response[0].image,
                        id: response[0].id,
                        created_date: response[0].created_date,
                        answer: response[0].answer,
                        createdDate: createdDate
                    }
                    $scope.forum_comment_data.push(resdata);
                    //console.log( $scope.forum_comment_data);
                    document.getElementById('forum_ans').value = "";

                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
        }
        $scope.getComments = function () {
            $http.post('/getComment', ({ques_id: $stateParams.forum_id})).success(function (response) {
                $scope.forum_comment_data = response[0];
                $scope.forum_comment_list = (typeof response[1] != 'undefined') ? response[1] : [];
                var flag = 0;
                for (var i = 0; i < response[0].length; i++) {
                    var dt = new Date(response[0][i].created_date);
                    $scope.forum_comment_data[i].createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();

                    if ($scope.forum_comment_data[i].image == null || $scope.forum_comment_data[i].image == '') //To set the user image
                    {
                        $scope.forum_comment_data[i].image = "/modules/core/images/default-pic.jpg";
                    } else {
                        $scope.forum_comment_data[i].image = '/images/profile_images/' + $scope.forum_comment_data[i].image;
                    }
                }
                if (typeof response[1] != 'undefined') { //If answer and comment exist for any forum topic
                    for (var a = 0; a < response[1].length; a++) {
                        var dt = new Date(response[1][a].created_date);
                        $scope.forum_comment_list[a].created_date = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
                        if ($scope.forum_comment_list[a].image == null || $scope.forum_comment_list[a].image == '') //To set the user image
                        {
                            $scope.forum_comment_list[a].image = "/modules/core/images/default-pic.jpg";
                        } else {
                            $scope.forum_comment_list[a].image = '/images/profile_images/' + $scope.forum_comment_list[a].image;
                        }
                    }
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
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


        $scope.getReplyOnAnswer = function (user_id, ref_id) {
            $http.post('/getReplyCommentAnswer', {user_id: user_id, ref_id: ref_id}).success(function (response) {
                $scope.reply_data = response;
                for (var i = 0; i < response.length; i++) {
                    var dt = new Date(response[i].created_date);
                    $scope.reply_data[i].createdDate = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
                    $scope.forum_comment_data.push($scope.reply_data[i]);
                }
                return $scope.reply_data;
            }).error(function (response) {
                return response.message;
            });
        }


        $scope.submitReplyComment = function (ques_id, user_id) {
            console.log($scope.authentication[0].id);
            if($scope.replyCommentValue==undefined){
                $scope.error = "Required comment";
                 $("html, body").animate({ scrollTop: 0 }, "slow");
                return false;
            }
            $scope.data = {
                user_id: $scope.authentication[0].id,
                ref_id: ques_id,
                reference: 'answer',
                description: $scope.replyCommentValue
            }
            $http.post('/submitReplyComment', $scope.data).success(function (response) {
                $scope.selected = false;
                //for(var a = 0;a<response.length;a++)
                //{
                var dt = new Date(response[0].created_date);
                response[0].created_date = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
                response[0].image = (response[0].image == null || response[0].image == '') ? "/modules/core/images/default-pic.jpg" : '/images/profile_images/' + response[0].image;
                //}
                var newdata = response[0];
                $scope.forum_comment_list.push(newdata);
                $scope.replyCommentValue = ''; //To remove previous comment data
            }).error(function (response) {
                $scope.error = response.message;
            });
        }

        $scope.getCommentsReply = function () {
            $http.post('/getComment', ({ques_id: $stateParams.forum_id})).success(function (response) {
                $scope.forum_comment_data = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
        }
		
		$scope.deleteForumComment = function (id,index) {
			console.log(id);
            var r = confirm('Are you sure to delete this comment?');
            if (r == true) {
			$http.post('/deleteForumComment',{id:id}).success(function (response) {
                console.log(response);
				if (response) {
				$scope.forum_comment_data.splice(index, 1);	
                alert(response.message);
				}
            }).error(function (response) {
				$scope.error = response.message;
            });
			}
		}
		
		$scope.deleteForumCommentReply = function (id,index) {
			console.log(id);
            var r = confirm('Are you sure to delete this reply?');
            if (r == true) {
			$http.post('/deleteForumCommentReply',{id:id}).success(function (response) {
                console.log(response);
				if (response) {
				$scope.forum_comment_list.splice(index, 1);
                alert(response.message);
				}
            }).error(function (response) {
				$scope.error = response.message;
            });
			}
		}
    }
]);
/*

 angular.module('forums').controller('ForumDetailsController', ['$scope','$http','$stateParams', '$location','$q', 'Authentication', 'Forums',
 function($scope,$http, $stateParams, $location,$q, Authentication, Forums) {
 $scope.authentication = JSON.parse(Authentication.get('user'));
 $scope.replyValue=false;
 $scope.forum_comment_data = [];
 $scope.forum_comment_list = [];
 //$scope.forum_detail_data
 $http.post('/user/getForumQuestionByForumId', {forum_id:$stateParams.forum_id}).success(function(response){
 $scope.forum_detail_data=response;
 for(var i=0;i<response.length;i++){
 if(response[i].image == null || response[i].image == '') //To set the user image
 {
 response[i].image = "/modules/core/images/default-pic.jpg";
 }else{
 response[i].image = '/images/profile_images/' + response[i].image;
 }
 }
 }).error(function(response){
 $scope.error = response.message;
 });

 $scope.addComment=function(){
 $scope.data=[];
 $scope.data.push({ques_id:$stateParams.forum_id,user_id:$scope.authentication[0].id,answer:document.getElementById('forum_ans').value});
 //console.log($scope.data);
 if($scope.authentication[0].role_id=="2"){
 $http.post('/dentist/addComment', $scope.data).success(function(response){
 var dt=new Date(response[0].created_date);
 var createdDate=dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();

 var resdata={
 first_name:response[0].first_name,
 last_name:response[0].last_name,
 image:(response[0].image == null || response[0].image == '')?"/modules/core/images/default-pic.jpg":'/images/profile_images/' + response[0].image,
 id:response[0].id,
 created_date:response[0].created_date,
 answer:response[0].answer,
 createdDate:createdDate
 }
 $scope.forum_comment_data.push(resdata);
 //console.log( $scope.forum_comment_data);
 document.getElementById('forum_ans').value="";

 }).error(function(response){
 $scope.error = response.message;
 });
 }
 }
 $scope.getComments=function(){
 $http.post('/getComment',({ques_id:$stateParams.forum_id})).success(function(response){
 $scope.forum_comment_data=response[0];
 $scope.forum_comment_list = (typeof response[1] != 'undefined') ? response[1] : [];
 var flag=0;
 for(var i=0;i<response[0].length;i++){
 var dt=new Date(response[0][i].created_date);
 $scope.forum_comment_data[i].createdDate=dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();

 if($scope.forum_comment_data[i].image == null || $scope.forum_comment_data[i].image == '') //To set the user image
 {
 $scope.forum_comment_data[i].image = "/modules/core/images/default-pic.jpg";
 }else{
 $scope.forum_comment_data[i].image = '/images/profile_images/' + $scope.forum_comment_data[i].image;
 }
 }
 if(typeof response[1] != 'undefined') { //If answer and comment exist for any forum topic
 for (var a = 0; a < response[1].length; a++) {
 var dt = new Date(response[1][a].created_date);
 $scope.forum_comment_list[a].created_date = dt.getDate() + ' ' + monthNames[dt.getMonth()] + ' ' + dt.getFullYear();
 if ($scope.forum_comment_list[a].image == null || $scope.forum_comment_list[a].image == '') //To set the user image
 {
 $scope.forum_comment_list[a].image = "/modules/core/images/default-pic.jpg";
 } else {
 $scope.forum_comment_list[a].image = '/images/profile_images/' + $scope.forum_comment_list[a].image;
 }
 }
 }
 }).error(function(response){
 $scope.error = response.message;
 });
 }

 $scope.replyComment=function(item){
 $scope.selected = item;
 }

 $scope.closeComment=function(){
 $scope.selected = false;
 }

 $scope.isSelected = function(item) {
 return $scope.selected == item
 }


 $scope.getReplyOnAnswer=function(user_id,ref_id){
 $http.post('/getReplyCommentAnswer',{user_id:user_id,ref_id:ref_id}).success(function(response){
 $scope.reply_data=response;
 for(var i=0;i<response.length;i++){
 var dt=new Date(response[i].created_date);
 $scope.reply_data[i].createdDate=dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();
 $scope.forum_comment_data.push($scope.reply_data[i]);
 }
 return $scope.reply_data;
 }).error(function(response){
 return response.message;
 });
 }



 $scope.submitReplyComment=function(ques_id,user_id){
 console.log($scope.authentication[0].id);
 $scope.data={
 user_id:$scope.authentication[0].id,
 ref_id:ques_id,
 reference:'answer',
 description:$scope.replyCommentValue
 }
 $http.post('/submitReplyComment',$scope.data).success(function(response){
 $scope.selected = false;
 //for(var a = 0;a<response.length;a++)
 //{
 var dt=new Date(response[0].created_date);
 response[0].created_date = dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();
 response[0].image = (response[0].image == null || response[0].image == '') ? "/modules/core/images/default-pic.jpg" : '/images/profile_images/' + response[0].image;
 //}
 var newdata = response[0];
 $scope.forum_comment_list.push(newdata);
 $scope.replyCommentValue = ''; //To remove previous comment data
 }).error(function(response){
 $scope.error = response.message;
 });
 }

 $scope.getCommentsReply=function(){
 $http.post('/getComment',({ques_id:$stateParams.forum_id})).success(function(response){
 $scope.forum_comment_data=response;
 }).error(function(response){
 $scope.error = response.message;
 });
 }

 }
 ]);
 */
