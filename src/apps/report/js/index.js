'use strict';

(function(){
    var name = 'report';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                    //统计报表
                        .state('app.report', {
                            url: '/report',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/report.js'] )
                        })
                        .state('app.report.account', {
                            url: '/account',
                            templateUrl: path + 'tpl/report.account.html',
                            controller: 'ReportAccountCtrl',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                }
            ]
        );
}());

