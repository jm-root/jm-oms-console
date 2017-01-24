'use strict';

(function(){
    var name = 'system';
    var path = 'apps/'+ name + '/';
    angular.module('app')
        .config(
            [ '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                    //系统管理
                        .state('app.system', {
                            url: '/system',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/system.js'] )
                        })
                        .state('app.system.admin', {
                            url: '/data',
                            templateUrl: path + 'tpl/system.admin.html',
                            controller: 'SystemAdminCtrl'
                        })
                        .state('app.system.adminadd',{
                            url:'/adminadd',
                            templateUrl:path + 'tpl/system.adminadd.html',
                            controller:'SystemAdminAddCtrl'
                        })
                        .state('app.system.log', {
                            url: '/log',
                            templateUrl: path + 'tpl/system.log.html',
                            controller: 'SystemLogCtrl',
                            // resolve: lazyLoadProvider.load(['daterangepicker','dateRangePicker'])
                        })
                }
            ]
        );
}());


