'use strict';

(function(){
    var name = 'shop';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.shop', {
                            url: '/shop',
                            controller:'ShopCtrl',
                            template: '<div ui-view class="fade-in-down"></div>',
                        })
                        .state('app.shop.category', {
                            url: '/category',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/category.js'])
                        })
                        .state('app.shop.category.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/shop_category.html',
                            controller: 'CateListCtrl'
                        })
                        .state('app.shop.category.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/shop_category_edit.html',
                            controller: 'CateEditCtrl'
                        })

                        .state('app.shop.product', {
                            url: '/product',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/product.js'])
                        })
                        .state('app.shop.product.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/shop_product.html',
                            controller: 'ProdListCtrl'
                        })
                        .state('app.shop.product.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/shop_product_edit.html',
                            controller: 'ProdEditCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput'])
                        })
                        .state('app.shop.product.edit.pic', {
                            url: '/pic',
                            templateUrl: 'apps/common/tpl/imgcrop.html',
                            resolve: lazyLoadProvider.load('ngImgCrop')
                        })
                        .state('app.shop.order', {
                            url: '/order',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/order.js'])
                        })
                        .state('app.shop.order.list', {
                            url: '/list/{productId}',
                            templateUrl: path + 'tpl/shop_order.html',
                            controller: 'OrderListCtrl'
                        })
                        .state('app.shop.order.edit', {
                            url: '/edit/{id}/{productId}',
                            templateUrl: path + 'tpl/shop_order_edit.html',
                            controller: 'OrderEditCtrl'
                        })


                        .state('app.shop.lottery', {
                            url: '/lottery',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/lottery.js'])
                        })
                        .state('app.shop.lottery.list', {
                            url: '/list/{productId}',
                            templateUrl: path + 'tpl/shop_lottery.html',
                            controller: 'LotteryListCtrl'
                        })
                        .state('app.shop.lottery.edit', {
                            url: '/edit/{id}/{productId}',
                            templateUrl: path + 'tpl/shop_lottery_edit.html',
                            controller: 'LotteryEditCtrl'
                        })

                        .state('app.shop.lotteryWin', {
                            url: '/lottery',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/lottery.js'])
                        })
                        .state('app.shop.lotteryWin.list', {
                            url: '/list/{productId}',
                            templateUrl: path + 'tpl/shop_lottery.html',
                            controller: 'LotteryWinListCtrl'
                        })
                        .state('app.shop.lotteryWin.edit', {
                            url: '/edit/{id}/{productId}',
                            templateUrl: path + 'tpl/shop_lottery_edit.html',
                            controller: 'LotteryWinEditCtrl'
                        })
                        .state('app.shop.lottery.formula', {
                            url: '/formula',
                            templateUrl: path + 'tpl/shop_formula.html',
                            controller: 'LotteryFormulaCtrl'
                        })
                        .state('app.shop.lottery.user', {
                            url: '/user/{id}',
                            templateUrl: path + 'tpl/shop_user.html',
                            controller: 'winUserInfoCtrl'
                        })
                        .state('app.shop.bet', {
                            url: '/bet',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/bet.js'])
                        })
                        .state('app.shop.bet.list', {
                            url: '/list/{lotteryId}',
                            templateUrl: path + 'tpl/shop_bet.html',
                            controller: 'BetListCtrl'
                        })
                        .state('app.shop.bet.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/shop_bet_edit.html',
                            controller: 'BetEditCtrl'
                        })
                }
            ]
        );
}());

