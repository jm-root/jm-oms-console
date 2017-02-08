'use strict';

(function(){
    var name = 'recharge';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.recharge', {
                            url: '/recharge',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'RechargeCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/recharge.js',path + 'js/controllers/index.js'])
                        })
                        .state('app.recharge.cardtype', {
                            url: '/cardtype',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.recharge.cardtype.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/recharge.cardtype.html',
                            controller: 'RechargeCardTypeCtrl'
                        })
                        .state('app.recharge.cardtype.add', {
                            url: '/add',
                            params:{
                                data : null
                            },
                            templateUrl: path + 'tpl/recharge.cardtypeadd.html',
                            controller: 'RechargeCardTypeAddCtrl'
                        })
                        .state('app.recharge.card', {
                            url: '/card',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.recharge.card.list', {
                            url: '/list',
                            templateUrl:path +  'tpl/recharge.card.html',
                            controller: 'RechargeCardCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.recharge.card.add', {
                            url: '/add',
                            params:{
                                data : null
                            },
                            templateUrl:path + 'tpl/recharge.cardadd.html',
                            controller: 'RechargeCardAddCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.recharge.cardlog', {
                            url: '/cardlog',
                            params:{
                                code : null
                            },
                            templateUrl: path + 'tpl/recharge.cardlog.html',
                            controller: 'RechargeCardLogCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.recharge.third', {
                            url: '/third',
                            templateUrl: path + 'tpl/recharge.third.html',
                            controller: 'RechargeThirdCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                    ;
                }
            ]
        );
}());


