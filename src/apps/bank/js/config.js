'use strict';

(function(){
    var name = 'bank';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [ '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                    //银行管理
                        .state('app.bank', {
                            url: '/bank',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return uiLoad.load([path + 'controllers/bank.js']);
                                    }]
                            }
                        })


                        //财务管理
                        .state('app.bank.currencyrate', {
                            url: '/currencyrate',
                            templateUrl: path  + 'tpl/currency.rate.html',
                            controller: 'CurrencyCtrl'
                        })
                        .state('app.bank.pay', {
                            url: '/pay',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.bank.pay.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/account.pay.list.html',
                            controller: 'AccountPayListCtrl',
                            resolve: {
                                deps: ['uiLoad','$ocLazyLoad',
                                    function (uiLoad,$ocLazyLoad) {
                                        return uiLoad.load( JQ_CONFIG.daterangepicker).then(function(){
                                            return $ocLazyLoad.load(['dateRangePicker']);
                                        });
                                    }
                                ]
                            }
                        })

                        .state('app.bank.account', {
                            url: '/account',
                            templateUrl: 'tpl/bank.account.html',
                            controller: 'BankAccountCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return uiLoad.load('../libs/jm/jm-play/jm-play-sdk.min.js');
                                    }
                                ]
                            }
                        })
                        .state('app.bank.preauth', {
                            url: '/preauth',
                            templateUrl: path + 'tpl/bank.preauth.html',
                            controller: 'BankPreauthCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return uiLoad.load('../libs/jm/jm-play/jm-play-sdk.min.js');
                                    }
                                ]
                            }
                        })
                        .state('app.bank.transfer', {
                            url: '/transfer',
                            templateUrl: path  + 'tpl/bank.transfer.html',
                            controller: 'BankTransferCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return $ocLazyLoad.load('smart-table')
                                            .then(function () {
                                                return uiLoad.load('../libs/jm/jm-play/jm-play-sdk.min.js');
                                            });

                                    }
                                ]
                            }
                        })
                        .state('app.bank.exchange', {
                            url: '/exchange',
                            templateUrl: path + 'tpl/bank.exchange.html',
                            controller: 'BankExchangeCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return uiLoad.load('../libs/jm/jm-play/jm-play-sdk.min.js');
                                    }
                                ]
                            }
                        })
                        .state('app.bank.deal', {
                            url: '/deal',
                            templateUrl: 'tpl/bank/bank.deal.html',
                            controller: 'BankDealCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return uiLoad.load('../common/js/jm-play-sdk.min.js');
                                    }
                                ]
                            }
                        })
                        .state('app.bank.npreauth', {
                            url: '/npreauth',
                            templateUrl: 'tpl/bank/bank.npreauth.html',
                            controller: 'BankNPreauthCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return $ocLazyLoad.load('smart-table')
                                            .then(function () {
                                                return uiLoad.load('../common/js/jm-play-sdk.min.js');
                                            });

                                    }
                                ]
                            }
                        })
                        .state('app.bank.overdraw', {
                            url: '/overdraw',
                            templateUrl: 'tpl/bank/bank.overdraw.html',
                            controller: 'BankOverdrawCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return $ocLazyLoad.load('smart-table');
                                    }
                                ]
                            }
                        })

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

