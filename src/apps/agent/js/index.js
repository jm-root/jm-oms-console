'use strict';

(function(){
    var name = 'agent';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.agent', {
                            url: '/agent',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'AgentCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/index.js' ,path + 'js/controllers/agent.js'] )
                        })
                        .state('app.agent.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/agent.list.html',
                            controller: 'AgentListCtrl'
                        })
                        .state('app.agent.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/agent.edit.html',
                            controller: 'AgentEditCtrl',
                            resolve: lazyLoadProvider.load(['smart-table','ngTagsInput'])
                        })
                        .state('app.agent.create', {
                            url: '/create',
                            templateUrl: path + 'tpl/agent.create.html',
                            controller: 'AgentCreateCtrl',
                            resolve: lazyLoadProvider.load(['smart-table','ngTagsInput'])
                        })
                        .state('app.agent.message', {
                            url: '/message',
                            templateUrl: path +'tpl/agent.message.html',
                            controller: 'AgentMessageCtrl'
                            // resolve: lazyLoadProvider.load(['smart-table','ngTagsInput'])
                        })
                    //包
                        .state('app.package', {
                            url: '/package',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'AgentCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/index.js' ,path + 'js/controllers/package.js'] )
                        })
                        .state('app.package.take', {
                            url: '/agent',
                            templateUrl: path + 'tpl/package.take.html',
                            controller: 'PackageTakeCtrl'
                        })
                        .state('app.package.set', {
                            url: '/set',
                            templateUrl: path + 'tpl/package.set.html',
                            controller: 'PackageSetCtrl',
                            resolve: lazyLoadProvider.load( ['chosen','localytics.directives'])
                        })
                    //渠道数据
                        .state('app.agentdata', {
                            url: '/agentdata',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'AgentCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/index.js' ,path + 'js/controllers/agentdata.js'] )
                        })
                        .state('app.agentdata.register', {
                            url: '/register',
                            templateUrl: path + 'tpl/agentdata.register.html',
                            controller: 'AgentDataRegisterCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.agentdata.recharge', {
                            url: '/recharge',
                            templateUrl: path + 'tpl/agentdata.recharge.html',
                            controller: 'AgentDataRechargeCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.agentdata.analysis', {
                            url: '/analysis',
                            templateUrl: path + 'tpl/agentdata.analysis.html',
                            controller: 'AgentDataAnalysisCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.agentdata.divided', {
                            url: '/divided',
                            templateUrl: path + 'tpl/agentdata.divided.html',
                            controller: 'AgentDataDividedCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                    //推广地址
                        .state('app.promote', {
                            url: '/promote',
                            templateUrl: path + 'tpl/promote.html',
                            controller: 'PromoteCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/promote.js'])
                        })
                    //T币
                        .state('app.coin', {
                            url: '/coin',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller:'AgentCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/index.js' ,path + 'js/controllers/coin.js'])
                        })
                        .state('app.coin.stock', {
                            url: '/stock',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.coin.stock.recharge', {
                            url: '/recharge',
                            templateUrl: path + 'tpl/coin.stock.recharge.html',
                            controller: 'CoinStockRechargeCtrl',
                            // resolve:lazyLoadProvider.load(['../common/js/pingpp-pc.js'])
                        })
                        .state('app.coin.stock.recharge.pay', {
                            url: '/pay',
                            templateUrl: path + 'tpl/pay.html',
                            controller: 'CoinStockRechargeCtrl'
                        })
                        .state('app.coin.stock.order', {
                            url: '/order',
                            templateUrl: path + 'tpl/coin.stock.order.html',
                            controller: 'CoinStockOrderCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.coin.stock.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/coin.stock.list.html',
                            controller: 'CoinStockListCtrl',
                            resolve: lazyLoadProvider.load([])
                        })
                        //生成首充号
                        .state('app.coin.distribute', {
                            url: '/distribute',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.coin.distribute.make', {
                            url: '/make',
                            templateUrl: path + 'tpl/coin.distribute.make.html',
                            controller: 'CoinDistributeMakeCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.coin.distribute.makeinfo', {
                            url: '/makeinfo/{id}',
                            templateUrl: path + 'tpl/coin.distribute.makeinfo.html',
                            controller: 'CoinDistributeMakeInfoCtrl',
                            resolve:  lazyLoadProvider.load(['smart-table'])
                        })
                        .state('app.coin.distribute.batch', {
                            url: '/batch',
                            templateUrl: path + 'tpl/coin.distribute.batch.html',
                            controller: 'CoinDistributeBatchCtrl',
                            resolve: lazyLoadProvider.load([])
                        })

                        //帐号列表
                        .state('app.coin.account', {
                            url: '/account',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.coin.account.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/coin.account.list.html',
                            controller:'CoinAccountListCtrl',
                            resolve: lazyLoadProvider.load([])
                        })

                        //玩家账号统计
                        .state('app.coin.record', {
                            url: '/record',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.coin.record.playerStat', {
                            url: '/playerStat',
                            templateUrl: path + 'tpl/coin.record.playerStat.html',
                            controller:'CoinRecordPlayerStatCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        //渠道玩家统计
                        .state('app.coin.record.agentStat',{
                            url:'/agentStat',
                            templateUrl:path +'tpl/coin.record.agentStat.html',
                            controller:'CoinRecordAgentStatCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        //日志查询
                        .state('app.coin.record.logs',{
                            url:'/logs',
                            templateUrl: path + 'tpl/coin.record.logs.html',
                            controller:'CoinRecordLogsCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                }
            ]
        );
}());

