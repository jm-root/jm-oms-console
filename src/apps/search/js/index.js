'use strict';
(function(){
    var name = 'search';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.search', {
                            abstract: true,
                            url: '/search',
                            template: '<div ui-view class="fade-in-right-big smooth"></div>',
                            controller: 'SearchCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/index.js'])
                        })
                        .state('app.search.user', {
                            url: '/user?isSuperAgent',
                            templateUrl: path  + 'tpl/search_user.html',
                            controller: 'SearchUserCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/search_user.js'])
                        })
                }
            ]
        );
}());

