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
                        .state('app.' + name, {
                            url: '/agent',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/agent.js'] )
                        })
                        .state('app.' + name + '.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/agent.list.html',
                            controller: 'AgentListCtrl'
                        })
                        .state('app.' + name + '.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/agent.edit.html',
                            controller: 'AgentEditCtrl',
                            resolve: lazyLoadProvider.load(['smart-table','ngTagsInput'])
                        })
                        .state('app.' + name + '.create', {
                            url: '/create',
                            templateUrl: path + 'tpl/agent.create.html',
                            controller: 'AgentCreateCtrl',
                            resolve: lazyLoadProvider.load(['smart-table','ngTagsInput'])
                        })
                    //package
                        .state('app.package', {
                            url: '/package',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/package.js'] )
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
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/agentdata.js'] )
                        })
                        .state('app.agentdata.register', {
                            url: '/register',
                            templateUrl: path + 'tpl/agentdata.register.html',
                            controller: 'AgentDataRegisterCtrl',
                            // resolve: lazyLoadProvider.load(['daterangepicker','dateRangePicker'])
                        })
                        .state('app.agentdata.recharge', {
                            url: '/recharge',
                            templateUrl: path + 'tpl/agentdata.recharge.html',
                            controller: 'AgentDataRechargeCtrl',
                            // resolve: lazyLoadProvider.load(['daterangepicker','dateRangePicker'])
                        })
                        .state('app.agentdata.analysis', {
                            url: '/analysis',
                            templateUrl: path + 'tpl/agentdata.analysis.html',
                            controller: 'AgentDataAnalysisCtrl',
                            // resolve: lazyLoadProvider.load(['daterangepicker','dateRangePicker'])
                        })
                    //推广地址
                        .state('app.promote', {
                            url: '/promote',
                            templateUrl: path + 'tpl/promote.html',
                            controller: 'PromoteCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/promote.js'])
                        })
                }
            ]
        );
}());

