'use strict';

// Authentication service for user variables
/*angular.module('users').factory('Authentication',[
		function() {
			var _this = this;
			_this._data = {
				user: window.user
			};
			return _this._data;
		}
]);*/

/*angular.module('users').factory('Authentication', function($http) {
    var Session = {
        data: {},
        saveSession: function() { *//* save session data to db *//* },
        updateSession: function() {
            *//* load data from db *//*
            Session.data = $http.get('session.json').then(function(r) { return r.data;});
        }
    };
    Session.updateSession();
    return Session;
});*/

angular.module('users').factory('Authentication',[function(){



/*var service = {

        model: {
            name: '',
            email: ''
        },

        SaveState: function () {
            sessionStorage.userService = angular.toJson(service.model);
        },

        RestoreState: function () {
            service.model = angular.fromJson(sessionStorage.userService);
        }
    }

    $rootScope.$on("savestate", service.SaveState);
    $rootScope.$on("restorestate", service.RestoreState);

    return service;*/


    return{
        set:function(key,value){
            //return window.localStorage.set(key,value);
            return localStorage.setItem(key,value);
        },
        get:function(key){
            //return window.localStorage.get(key);
            return localStorage.getItem(key);
        },
        destroy:function(key){
            return localStorage.removeItem(key);
        }/*,
        checkSession:function(callback){
            $http.get('/').success(function(response){
                callback(response);
            }).error(function(response){
                callback(response);
            })
        }*/

    };
}
]);

angular.module('users').factory('Dentist',[function(){

    return{
        set:function(key,value){
            return localStorage.setItem(key,value);
        },
        get:function(key){
            return localStorage.getItem(key);
        },
        destroy:function(key){
            return localStorage.removeItem(key);
        }

    };
}
]);

angular.module('users').factory('Staff',[function(){
    return{
        set:function(key,value){
            return localStorage.setItem(key,value);
        },
        get:function(key){
            return localStorage.getItem(key);
        },
        destroy:function(key){
            return localStorage.removeItem(key);
        }
    };
}
]);



