'use strict';
(function(){
    var name = 'oms';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(['$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.oms', {
                            url: '/oms',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller: 'OmsActivitiesCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/aty1.js'] )
                        })
                        .state('app.oms.aty1',{
                            url: '/aty1',
                            templateUrl: path + 'tpl/aty1.html',
                            controller: 'OmsAty1Ctrl'
                        })
                }
            ]
        );
}());
