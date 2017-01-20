'use strict';

(function(){
    var name = 'recharge';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                    // resolve: load([path + 'js/controllers/index.js'])
                        .state('app.recharge', {
                            url: '/recharge',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: load([path + 'js/controllers/recharge.js'])
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
                            resolve:load(['daterangepicker','moment'])
                            // resolve: {
                            //     deps: ['$ocLazyLoad', 'uiLoad',
                            //         function ($ocLazyLoad,uiLoad) {
                            //             return uiLoad.load( JQ_CONFIG.daterangepicker).then(function(){
                            //                 return $ocLazyLoad.load(['dateRangePicker']);
                            //             });
                            //
                            //         }
                            //     ]
                            // }
                        })
                        .state('app.recharge.card.add', {
                            url: '/add',
                            params:{
                                data : null
                            },
                            templateUrl:path + 'tpl/recharge.cardadd.html',
                            controller: 'RechargeCardAddCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return uiLoad.load( JQ_CONFIG.daterangepicker).then(function(){
                                            return $ocLazyLoad.load(['dateRangePicker']);
                                        });

                                    }
                                ]
                            }
                        })
                        .state('app.recharge.cardlog', {
                            url: '/cardlog',
                            params:{
                                code : null
                            },
                            templateUrl: path + 'tpl/recharge.cardlog.html',
                            controller: 'RechargeCardLogCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return uiLoad.load( JQ_CONFIG.daterangepicker).then(function(){
                                            return $ocLazyLoad.load(['dateRangePicker']);
                                        });

                                    }
                                ]
                            }
                        })
                        .state('app.recharge.third', {
                            url: '/third',
                            templateUrl: path + 'tpl/recharge.third.html',
                            controller: 'RechargeThirdCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return uiLoad.load( JQ_CONFIG.daterangepicker).then(function(){
                                            return $ocLazyLoad.load(['dateRangePicker']);
                                        });
                                    }
                                ]
                            }
                        })
                    ;

                    function load(srcs, callback) {
                        return {
                            deps: ['$ocLazyLoad', '$q',
                                function( $ocLazyLoad, $q ){
                                    var deferred = $q.defer();
                                    var promise  = false;
                                    srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                                    if(!promise){
                                        promise = deferred.promise;
                                    }
                                    angular.forEach(srcs, function(src) {
                                        promise = promise.then( function(){
                                            if(JQ_CONFIG[src]){
                                                return $ocLazyLoad.load(JQ_CONFIG[src]);
                                            }
                                            angular.forEach(MODULE_CONFIG, function(module) {
                                                if( module.name == src){
                                                    name = module.name;
                                                }else{
                                                    name = src;
                                                }
                                            });
                                            return $ocLazyLoad.load(name);
                                        } );
                                    });
                                    deferred.resolve();
                                    return callback ? promise.then(function(){ return callback(); }) : promise;
                                }]
                        }
                    }
                }
            ]
        );
}());


