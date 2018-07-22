'use strict';

// Knowledgebases controller
angular.module('knowledgebases').controller('KnowledgebasesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Knowledgebases',
	function($scope, $http, $stateParams, $location, Authentication, Knowledgebases) {
		$scope.authentication = JSON.parse(Authentication.get('user'));
		$scope.knowbase_data='';
		var alphabet = ''
		if($stateParams.alphabet){
		    alphabet = $stateParams.alphabet;
		}
		$http.post('/getAllKnowledgeBase',{alphabet:alphabet}).success(function(response){
			$scope.knowbase_data=response;

			for(var i=0;i<response.length;i++){
				var dt=new Date(response[i].created_date);
				$scope.knowbase_data[i].createdDate=dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();
			}
			console.log($scope.knowbase_data);
		}).error(function(response){
			$scope.error = response.message;
		})

        $scope.getAlphabets = function(){
            var alphabets = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
            $scope.allAlphabetsWithUrl = [];
            for(var i = 0;i < alphabets.length; i++){
                var data = {
                    alphabet:alphabets[i],
                    url : '#!/getAllKnowledgeBase/sort/'+alphabets[i]
                }
                $scope.allAlphabetsWithUrl.push(data);
            }


        }




		/*$http.post('/getWikiData').success(function(response){
		     console.log(response[0]);
		     for(var i = 0 ; i < response.length; i++){
                $http.post('/getDataUsingPageId',{pageids:response[i]}).success(function(response){

                }).error(function(response){

                })
		     }
		}).error(function(response){
		    console.log(response);
		})*/


	}
]);


angular.module('knowledgebases').controller('KnowledgebaseDetailsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Knowledgebases',
	function($scope, $http, $stateParams, $location, Authentication, Knowledgebases) {
		$scope.knowbase_comment_data = [];
		$scope.knowbase_comment_reply = [];
		$scope.authentication = JSON.parse(Authentication.get('user'));
		$scope.knowbase_detail='';
		$scope.replyCommentValue = '';
		//To get Details of Blog Post
		$http.post('/getKnowledgeBaseById',({knowbase_id:$stateParams.knowledgebaseId})).success(function(response){
			$scope.knowbase_detail=response;
			for(var i=0;i<response.length;i++){
				var dt=new Date(response[i].created_date);
				$scope.knowbase_detail[i].createdDate=dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();
			}
		}).error(function(response){
			$scope.error = response.message;
		});
		//To get all comments of any blog
		$http.post('/knowledgeBase/getComments',({knowbase_id:$stateParams.knowledgebaseId})).success(function(response){
			for(var a = 0; a< response.length; a++) {
				if(typeof response[a] != 'undefined') {
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
			$scope.knowbase_comment_data=response[0];
			$scope.knowbase_comment_reply = (typeof response[1] != 'undefined') ? response[1] : [];
			//console.log(response);
		}).error(function(response){
			$scope.error = response.message;
		});

		$scope.addComment=function(){
			$scope.data=[];
			$scope.data.push({reference:'knowbase',ref_id:$stateParams.knowledgebaseId,user_id:$scope.authentication[0].id,description:document.getElementById('knowbase_comment').value});
			//console.log($scope.data);
			//if($scope.authentication[0].role_id=="2"){
			$http.post('/knowledgeBase/addComment', $scope.data).success(function(response){

				var dt=new Date(response[0].created_date);
				var createdDate=dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();

				var resdata={
					first_name:response[0].first_name,
					last_name:response[0].last_name,
					image:((response[0].image == null || response[0].image == '')?'/modules/core/images/default-pic.jpg':'/images/profile_images/' + response[0].image),
					id:response[0].id,
					created_date:response[0].created_date,
					description:response[0].description,
					createdDate:createdDate
				}
				$scope.knowbase_comment_data.push(resdata);
				document.getElementById('knowbase_comment').value="";

			}).error(function(response){
				$scope.error = response.message;
			});
			//}
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

		$scope.submitReplyComment=function(comment_id){
			$scope.data=[{
				user_id:$scope.authentication[0].id,
				ref_id:comment_id,
				reference:'comment',
				description:$scope.replyCommentValue
			}];
			$http.post('/knowledgeBase/addComment',$scope.data).success(function(response){
				$scope.selected = false;
				var dt=new Date(response[0].created_date);
				var createdDate = dt.getDate()+' '+monthNames[dt.getMonth()]+' '+dt.getFullYear();
				var newdata={
					first_name:response[0].first_name,
					last_name:response[0].last_name,
					image:((response[0].image == null || response[0].image == '')?'/modules/core/images/default-pic.jpg':'/images/profile_images/' + response[0].image),
					id:response[0].id,
					created_date:response[0].created_date,
					description:response[0].description,
					createdDate:createdDate,
					ref_id:response[0].ref_id,
					user_id:response[0].user_id
				}
				$scope.knowbase_comment_reply.push(newdata);
				$scope.replyCommentValue = ''; //To remove previous comment data
			}).error(function(response){
				$scope.error = response.message;
			});
		}

		$scope.recentKnowBase = function () {
                $http.post('/recentKnowBase').success(function (response) {
                    console.log(response);
                    $scope.recentKnowBases = response;
                }).error(function (response) {
                    console.log(response);
                    $scope.error = response[0];
                });
         }
		 
		$scope.deleteKnowledgebaseComment = function (id,index) {
			console.log(id);
            var r = confirm('Are you sure to delete this comment?');
            if (r == true) {
			$http.post('/deleteKnowledgebaseComment',{id:id}).success(function (response) {
                console.log(response);
				if (response) {
				$scope.knowbase_comment_data.splice(index,1);
                alert(response.message);
				}
            }).error(function (response) {
				$scope.error = response.message;
            });
			}
		}
		
		$scope.deleteKnowledgebaseCommentReply = function (id,index) {
			console.log(id);
            var r = confirm('Are you sure to delete this reply?');
            if (r == true) {
			$http.post('/deleteKnowledgebaseCommentReply',{id:id}).success(function (response) {
                console.log(response);
				if (response) {
				$scope.knowbase_comment_reply.splice(index,1);
                alert(response.message);
				}
            }).error(function (response) {
				$scope.error = response.message;
            });
			}
		}
	}
]);
