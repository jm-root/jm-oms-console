'use strict';

(function(){
    var name = 'datastatistics';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.datastatistics', {
                            url: '/datastatistics',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'DataStatisticsCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/index.js',path + 'js/controllers/agent.js',path + 'js/controllers/player.js',path + 'js/controllers/table.js'] )
                        })
                        .state('app.datastatistics.agentdata', {
                            url: '/agentdata',
                            templateUrl: path + 'tpl/agent.data.html',
                            controller: 'AgentDataCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'css/self.css'])
                        })
                        .state('app.datastatistics.agentstatistics', {
                            url: '/agentstatistics',
                            templateUrl: path + 'tpl/agent.statistics.html',
                            controller: 'AgentStatisticsCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'css/self.css'])
                        })
                        .state('app.datastatistics.agentdiary', {
                            url: '/agentdiary',
                            templateUrl: path + 'tpl/agent.diary.html',
                            controller: 'AgentDiaryCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'css/self.css'])
                        })
                        .state('app.datastatistics.playerdata', {
                            url: '/playerdata',
                            templateUrl: path + 'tpl/player.data.html',
                            controller: 'PlayerDataCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'css/self.css'])
                        })
                        .state('app.datastatistics.playerstatistics', {
                            url: '/playerstatistics',
                            templateUrl: path + 'tpl/player.statistics.html',
                            controller: 'PlayerStatisticsCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'css/self.css'])
                        })
                        .state('app.datastatistics.playerdiary', {
                            url: '/playerdiary',
                            templateUrl: path + 'tpl/player.diary.html',
                            controller: 'PlayerDiaryCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker',path + 'css/self.css'])
                        })
                        .state('app.datastatistics.table', {
                            url: '/table',
                            templateUrl: path + 'tpl/table.html',
                            controller: 'TableCtrl',
                            resolve: lazyLoadProvider.load([path + 'css/self.css'])
                        })
                }
            ]
        );
}());

