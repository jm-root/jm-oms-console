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
                        .state('app.recharge.denomination', {
                            url: '/denomination',
                            templateUrl: path + 'tpl/denomination.html'
                            // template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.recharge.third', {
                            url: '/third',
                            templateUrl: path + 'tpl/third.html',
                            // controller: 'RechargeCardTypeCtrl'
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.recharge.cardlog', {
                            url: '/cardlog',
                            templateUrl: path + 'tpl/cardlog.html',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.recharge.card', {
                            url: '/card',
                            templateUrl:path +  'tpl/card.html',
                            // controller: 'RechargeCardCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        });
                }
            ]
        );
}());


