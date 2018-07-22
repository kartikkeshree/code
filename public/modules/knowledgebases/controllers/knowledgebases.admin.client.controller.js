'use strict';

// Knowledgebases controller
angular.module('knowledgebases').controller('KnowledgebasesAdminController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Knowledgebases',
	function($scope, $http, $stateParams, $location, Authentication, Knowledgebases) {
		$scope.authentication = JSON.parse(Authentication.get('user'));

        $scope.find =function(){
            if($stateParams.keyword && $stateParams.keyword != '') {
                $scope.wikiDatas = [];
                $http.post('/getWikiData',{keyword:$stateParams.keyword}).success(function(response){
                    if(response.length > 0){
                         for(var i = 0 ; i < response.length; i++) {
                            $http.post('/getDataUsingPageId',{pageids:response[i]}).success(function(response){
                                $scope.wikiDatas.push(response);
                                console.log($scope.wikiDatas);
                            }).error(function(response){

                            })
                         }
                     } else {
                        alert('No data for topic '+$stateParams.keyword);
                        history.back();
                     }
                }).error(function(response){
                    console.log(response);
                })

            }
		}

		$scope.submitKeywordWiki = function(){
		    $scope.wikiDatas = [];
		    if($scope.keyword) {
                $location.path('/listAdminKnowBase/'+$scope.keyword+'')
           } else {
                alert('Please enter Keyword');
           }
		}

		$scope.getWikiData = function(wikiData,index) {
		    wikiData.user_id = $scope.authentication[0].id;
		    $scope.setWikiDataToSave = wikiData;
		    console.log(wikiData);
            $scope.saveWikiData();
		}

		$scope.saveWikiData = function(){
		     if(confirm('Are you sure to save ?')) {
                 $http.post('/createKnowledgeBase',$scope.setWikiDataToSave).success(function(response){
                    alert('Saved successfully');
                    history.back();
                }).error(function(response){
                    alert(response.message);
                    console.log(response);
                })
            }

		}

		$scope.findKnowBase = function() {

		    var searchVal = '';
		    if($scope.search){
		        searchVal = $scope.search.searchVal
		    }
            $http.post('/getAllKnowledgeBase',{searchVal:searchVal}).success(function(response){
                $scope.knowledgeBases = response;
            }).error(function(response){
                $scope.error = response.message;
            })
		}

		$scope.deleteWikiData = function(id) {
            if(confirm('Are you sure to delete ?')) {
                $http.post('/deleteKnowBaseById',{id:id}).success(function(response){
                    $scope.knowledgeBases = response;
                }).error(function(response){
                    $scope.error = response.message;
                })
            }
		}

	}
]);
