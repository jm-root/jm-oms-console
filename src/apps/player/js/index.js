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
                        .state('app.player.info', {
                            url: '/info',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.player.info.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/player.info.list.html',
                            controller: 'PlayerListCtrl',
                            resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.online', {
                            url: '/online',
                            templateUrl: path + 'tpl/player.info.online.html',
                            controller: 'PlayerOnlineCtrl'
                        })
                        .state('app.player.info.games', {
                            url: '/games/{id}?name',
                            templateUrl: path + 'tpl/player.info.games.html',
                            controller: 'PlayerGamesListCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad,uiLoad) {
                                        return;
                                    }
                                ]
                            }
                        })
                        .state('app.player.record', {
                            url: '/record',
                            templateUrl: path + 'tpl/player.record.html',
                            controller: 'PlayerRecordCtrl',
                            resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.givelog', {
                            url: '/givelog',
                            templateUrl: path + 'tpl/player.givelog.html',
                            controller: 'PlayerGiveLogCtrl',
                            resolve: lazyLoadProvider.load('daterangepicker')
                        })
                        .state('app.player.changescore', {
                            url: '/changescore',
                            templateUrl: path +'tpl/player.changescore.html',
                            controller: 'PlayerChangeScoreCtrl'
                        })
                }
            ]
        );
}());

