'use strict';

(function(){
    var name = 'bank';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [ '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                    //银行管理
                        .state('app.bank', {
                            url: '/bank',
                            template: '<div ui-view class="fade-in-down" style="position:relative'+'"></div>',
                            controller:'BankCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/bank.js',path + 'js/controllers/index.js'])
                        })
                        //财务管理
                        .state('app.bank.currencyrate', {
                            url: '/currencyrate',
                            templateUrl: path  + 'tpl/currency.rate.html',
                            controller: 'CurrencyCtrl',
                            resolve:lazyLoadProvider.load([path + 'js/controllers/currency.js'])
                        })
                        .state('app.bank.pay', {
                            url: '/pay',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.bank.pay.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/account.pay.list.html',
                            controller: 'AccountPayListCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path+'js/controllers/paylist.js'])
                        })

                        .state('app.bank.account', {
                            url: '/account',
                            templateUrl: path + 'tpl/bank.account.html',
                            controller: 'BankAccountCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/account.js'])
                        })
                        .state('app.bank.preauth', {
                            url: '/preauth',
                            templateUrl: path + 'tpl/bank.preauth.html',
                            controller: 'BankPreauthCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/preauth.js'])
                        })
                        .state('app.bank.transfer', {
                            url: '/transfer',
                            templateUrl: path  + 'tpl/bank.transfer.html',
                            controller: 'BankTransferCtrl',
                            resolve: lazyLoadProvider.load([path+'js/controllers/transfer.js'])
                        })
                        .state('app.bank.transfer.searchUser', {
                            url: '/searchUser',
                            templateUrl: path  + 'tpl/bank.searchUser.html'
                        })
                        .state('app.bank.exchange', {
                            url: '/exchange',
                            templateUrl: path + 'tpl/bank.exchange.html',
                            controller: 'BankExchangeCtrl',
                            resolve: lazyLoadProvider.load([])
                        })
                        .state('app.bank.deal', {
                            url: '/deal',
                            templateUrl: path + 'tpl/bank.deal.html',
                            controller: 'BankDealCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'js/controllers/deal.js'])
                        })
                        .state('app.bank.owndeal', {
                            url: '/owndeal',
                            templateUrl: path + 'tpl/bank.owndeal.html',
                            controller: 'BankOwnDealCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'js/controllers/owndeal.js'])
                        })
                        .state('app.bank.npreauth', {
                            url: '/npreauth',
                            templateUrl: path + 'tpl/bank.npreauth.html',
                            controller: 'BankNPreauthCtrl',
                            resolve: lazyLoadProvider.load([])
                        })
                        .state('app.bank.overdraw', {
                            url: '/overdraw',
                            templateUrl: path + 'tpl/bank.overdraw.html',
                            controller: 'BankOverdrawCtrl',
                            resolve: lazyLoadProvider.load(['smart-table'])
                        })

                }
            ]
        );
}());


