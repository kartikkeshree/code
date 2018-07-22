'use strict';

//Dentists service used to communicate Dentists REST endpoints
angular.module('dentists').factory('Dentists', ['$resource',
	function($resource) {
		return $resource('dentists/update', {}, {
			update: {
				method: 'POST'
			}
		});
               
	}
]);
/*
angular.module('dentists').factory('Speciality', ['$resource',
	//var spVar = '';
	//$http.post('/specialityList').success(function(response) { //To fetch all speciality list
	//	spVar = response;
	//}).error(function(response) {
	//	return response.message;
	//});
	//console.log('page1');
	//console.log(spVar);
	//return spVar;
	function($resource) {
		return $resource('/specialityList');
	}
]);
*/

angular.module('dentists').factory('WeekDays', function() {
		return ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
	}
);
angular.module('dentists').factory('GetPatient',['$resource',
    function($resource) {
        return $resource('/getPatientByDentistId');
    }
]);
/*angular.module('dentists').factory('GetServices',['$resource', '$http', '$scope',
	function($resource, $http, $scope) {
		$http.post('/getServiceList').success(function(response) { //To fetch all area list
			return $scope.serviceList = response;
		}).error(function(response) {
			$scope.error = response.message;
		});
	}
]);*/
angular.module('dentists').factory('Page',[function(){

    return{
        set:function(key,value){
            return sessionStorage.setItem(key,value);
        },
        get:function(key){
            return sessionStorage.getItem(key);
        },
        destroy:function(key){
            return sessionStorage.removeItem(key);
        }

    };
}
]);