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
                        .state('app.recharge.parvalue', {
                            url: '/parvalue',
                            templateUrl: path + 'tpl/parvalue.html',
                            controller:'RechargeParvalueCtrl'
                        })
                        .state('app.recharge.third', {
                            url: '/third',
                            templateUrl: path + 'tpl/third.html',
                            controller: 'RechargeThirdCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.recharge.cardlog', {
                            url: '/cardlog',
                            templateUrl: path + 'tpl/cardlog.html',
                            controller: 'RechargeCardlogCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.recharge.card', {
                            url: '/card',
                            templateUrl:path +  'tpl/card.html',
                            controller: 'RechargeCardCtrl',
                            resolve:lazyLoadProvider.load(['daterangepicker'])
                        });
                }
            ]
        );
}());


