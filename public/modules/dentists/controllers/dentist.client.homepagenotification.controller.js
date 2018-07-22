 if(notify=="") {
        var notify= "";
 }

angular.module('dentists').controller('HomePageNotificationController',['$scope','$http','$stateParams','$location','$upload','Authentication','Dentist','GetPatient','Staff',
    function($scope,$http,$stateParams,$location,$upload,Authentication,Dentist,GetPatient,Staff){

   $scope.user =JSON.parse(Authentication.get('user'));
   $scope.dentist =JSON.parse(Dentist.get('dentist'));
   $scope.notify=[];
   $scope.filterVal = '';

//Initiate datepicker
                   //Initiate datepicker
                                     var curDate = new Date();
                                     var endDate = new Date(new Date(curDate).setMonth(curDate.getMonth()+3));
                                     $('#notification-start-date')
                                         .datepicker({
                                             inline: true,
                                             dateFormat: "m/dd/yy",
                                             minDate:curDate,
                                             maxDate: endDate,
                                             onSelect: function () {
                                                 var appDate = $(this).val();
                                                     if($scope.notify!=undefined){
                                                        $scope.notify.start_date=$(this).val();
                                                     }else{
                                                        $scope.start_date=$(this).val();
                                                     }
                                             }
                                         })
                                         .datepicker('setDate', curDate);
                                     $('#notification-end-date')
                                         .datepicker({
                                             inline: true,
                                             dateFormat: "m/dd/yy",
                                             minDate:curDate,
                                             maxDate: endDate,
                                             onSelect: function () {
                                                 var appDate = $(this).val();
                                                     if($scope.notify!=undefined){
                                                        $scope.notify.end_date=$(this).val();
                                                     }else{
                                                        $scope.end_date=$(this).val();
                                                     }
                                             }
                                         })
                                         .datepicker('setDate', curDate);

  //Get staff access module
   $scope.staffModule = JSON.parse(Staff.get('staff'));

            if($scope.staffModule != undefined){
                console.log($scope.staffModule[0].module_access);
                var modules = $scope.staffModule[0].module_access.split(',');
                $scope.allModules = [];
                for(var i=0 ; i < modules.length; i++){
                      $scope.allModules.push(modules[i]);
                      if(modules[i] == 'Data'){
                            $scope.dataVal = true;
                      }
                      if(modules[i] == 'Patient'){
                            $scope.patientVal = true;
                      }

                }
                console.log($scope.allModules +"  " + $scope.patientVal + "  " + $scope.dataVal);
            }

   $scope.notificationFilter = function() {
   			//$scope.currentPage = 1;
   			console.log($scope.notify.filterVal);
               $scope.find($scope.notify.filterVal);
           };


   $scope.descript =[];

   $scope.notificationSubmit = function(){
       console.log($scope.notify) ;
            if ($scope.notify){
         //$scope.notify.notify_id = $scope.authentication[0].id;
          var notifydata ={
                       description: $scope.notify.description,
                        end_date: $scope.notify.end_date,
                       start_date: $scope.notify.start_date,
                       }
          console.log(notifydata);
     $http.post('/addNotification',notifydata).success(function (response){
                      if (response == 'err') {
                              $scope.descript = [];
                      }else{
                              alert("Notification added successfully");
                              console.log(response.insertId)
                              $location.path('/homeNotification');
                              $scope.descript.push({
                                     id: response.insertId,
                                     description: $scope.notify.description,
                                     end_date: $scope.notify.end_date,
                                     start_date: $scope.notify.start_date,
                              });

                                     $scope.notify.description=''
                                     $scope.notify.end_date=''
                                     $scope.notify.start_date=''
                      }

     }).error(function (response) {
                      var res = JSON.parse(JSON.stringify(response));
                      $scope.error = res[0];
                      $("html, body").animate({ scrollTop: 0 }, "slow");
     });
           }else{

                      $scope.error = 'please fill all required fields';
                      $("html, body").animate({ scrollTop: 0 }, "slow");
           }
   }

   $scope.find=function(searchVal){

     searchVal=(searchVal && typeof searchVal != 'undefined')?searchVal:$scope.notify.filterVal;
     console.log(searchVal);
     $http.post('/getAllNotificationList',{searchVal:searchVal}).success(function(response){
        $scope.descript=response;
        var date = new Date(Date.parse($scope.descript.start_date))
        // delete $scope.descript.start_date;
          if(date .toString()!='Invalid Date'){
                      $scope.descript.start_date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
          }else{
                      $scope.descript.start_date = '';
          };

        var date = new Date(Date.parse($scope.descript.end_date))
          if(date.toString()!='Invalid Date'){
                      $scope.descript.end_date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
          }else{
                      $scope.descript.end_date = '';
          };
     }).error(function(response){
        $scope.error = response.message;
     });

   };

   $scope.notificationUpdate = function(id){
     console.log(id);
     $http.post('/updateNotificationList',{
                id: $scope.notify.id,
                description: $scope.notify.description,
                start_date:  $scope.notify.start_date,
                end_date:  $scope.notify.end_date
     }).success(function(response){
                if(response=='err'){
                  console.log(response);
                }else{
                  console.log(response);
                  alert("User updated successfully");
                  var data = {
                               id:  $scope.notify.id,
                               description:   $scope.notify.description,
                               start_date:  $scope.notify.start_date,
                               end_date: $scope.notify.end_date
                  }
                     //var id = $scope.notificationValues.id
                  console.log(data);
                  $scope.descript.splice($scope.index, 1);
                  $scope.descript.splice($scope.index, 0,data);
                  $scope.index='';
                  $location.path('/homeNotification');
                }

     }).error(function(response){
                $scope.error = response.message;
     });
   }

   $scope.deleteNotification = function(id,index){
        console.log(id);
         //var description= $scope.descript.description;
         var r = confirm('Are you sure to delete this notification ?');
            if (r == true) {
                $http.post('/deleteNotificationByAppId',{id:id}).success(function (response) {
                    if (response) {
                        $scope.descript.splice(index, 1);
                        alert(response.message);
                    }
                }).error(function (response) {
                    $scope.error = response.message;
                });
            }
   }

  /* $scope.getNotificationId=function(id,index){
       $scope.index=index;
       $scope.editNotificationId=id;
       console.log($scope.editNotificationId)
          $http.post('/getEditNotificationListById',{id:$scope.editNotificationId}).success(function(response){
                $scope.notify=response[0];
                console.log($scope.notify);
          }).error(function(response){
                $scope.error = response.message;
          });
   }*/

   /*$scope.findedit=function(){
        var searchVal='';
        //var start-date = new Date();
        //var end-date = new Date();
        if($scope.search!=undefined){
        searchVal=$scope.search.searchVal;
        }
              console.log($scope.search);
     $http.post('/getUpdateNotificationListById',{searchVal:searchVal}).success(function(response){
        $scope.notificationValues=response;
              console.log( $scope.notificationValues);
              var date = new Date(Date.parse($scope.notificationValues.start_date))

              if(date .toString()!='Invalid Date'){
                   $scope.notificationValues.start_date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
              }else{
                   $scope.notificationValues.start_date = '';
              };

              var date = new Date(Date.parse($scope.notificationValues.end_date))
              if(date.toString()!='Invalid Date'){
                   $scope.notificationValues.end_date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
              }else{
                   $scope.notificationValues.end_date = '';
              };
     }).error(function(response){
        $scope.error = response.message;
     });

   };*/

    $scope.getViewNotificationId=function(id){
        $scope.viewNotificationId=id;
            console.log($scope.viewNotificationId)
            $http.post('/getViewNotificationListById',{id:$scope.viewNotificationId}).success(function(response){
               $scope.viewNotificationValues=response[0];
               console.log($scope.viewNotificationValues);
            }).error(function(response){
               $scope.error = response.message;
            });
    }

     $scope.editNotification=function(id){
        $scope.notifyVal=true;
        console.log(id);
       // var searchVal='';
         $http.post('/getUpdateNotificationListById',{id:id}).success(function(response){
                $scope.notify=response[0];
                console.log($scope.notify);
                    var date = new Date(Date.parse($scope.notify.start_date))

                      if(date .toString()!='Invalid Date'){
                           $scope.notify.start_date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
                      }else{
                           $scope.notify.start_date = '';
                      };

                      var date = new Date(Date.parse($scope.notify.end_date))
                      if(date.toString()!='Invalid Date'){
                           $scope.notify.end_date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
                      }else{
                           $scope.notify.end_date = '';
                      };

             }).error(function(response){
                $scope.error = response.message;
             });

     }

     $scope.addNewNotification = function(){
        $scope.notifyVal=false;
        console.log( $scope.notifyVal);
     }
}]);

