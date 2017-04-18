'use strict';

(function(){
    var name = 'backpoints';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [ '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                    //下分管理
                        .state('app.backpoints', {
                            url: '/backpoints',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'BackpointsCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/backpoints.js'])
                        })
                        .state('app.backpoints.list', {
                            url: '/list',
                            controller: 'BacklistCtrl',
                            templateUrl: path  + 'tpl/backpoints.list.html',
                            resolve: lazyLoadProvider.load([path + 'css/self.css'])
                        })
                        .state('app.backpoints.log', {
                            url: '/log',
                            controller: 'BacklogCtrl',
                            templateUrl: path  + 'tpl/backpoints.log.html',
                            resolve: lazyLoadProvider.load('daterangepicker')
                        })
                }
            ]
        );
}());


