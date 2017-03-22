'use strict';

(function(){
    var name = 'player';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.player', {
                            url: '/player',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'PlayerCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/player.js',path + 'js/controllers/index.js'] )
                        })
                        .state('app.player.search', {
                            url: '/info',
                            templateUrl: path + 'tpl/search.html'
                        })
                        .state('app.player.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/list.html'
                            // controller: 'PlayerListCtrl',
                            // resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.online', {
                            url: '/online',
                            templateUrl: path + 'tpl/online.html',
                            controller: 'PlayerOnlineCtrl'
                        })
                        .state('app.player.givelog', {
                            url: '/givelog',
                            templateUrl: path + 'tpl/givelog.html',
                            // controller: 'PlayerGamesListCtrl',
                        })
                        .state('app.player.record', {
                            url: '/record',
                            templateUrl: path + 'tpl/record.html',
                            // controller: 'PlayerRecordCtrl',
                            // resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.receivelog', {
                            url: '/receivelog',
                            templateUrl: path + 'tpl/receivelog.html'
                            // controller: 'PlayerGiveLogCtrl',
                            // resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.signlog', {
                            url: '/signlog',
                            templateUrl: path + 'tpl/signlog.html'
                            // controller: 'PlayerGiveLogCtrl',
                            // resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.vip', {
                            url: '/signlog',
                            templateUrl: path + 'tpl/vip.html'
                            // controller: 'PlayerGiveLogCtrl',
                            // resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.suspend', {
                            url: '/suspend',
                            templateUrl: path + 'tpl/suspend.html'
                            // controller: 'PlayerGiveLogCtrl',
                            // resolve: lazyLoadProvider.load('daterangepicker')
                        })
                }
            ]
        );
}());

