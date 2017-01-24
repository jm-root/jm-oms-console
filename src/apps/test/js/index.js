'use strict';

(function () {
    var name = 'test';
    var path = 'apps/' + name + '/';

    angular.module('app')
        .config(
            ['$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider, $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('test', {
                            abstract: true,
                            url: '/test',
                            template: '<div ui-view class="fade-in-right-big smooth"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/index.js'])
                        })
                        .state('test.form', {
                            url: '/form',
                            templateUrl: path +'tpl/form.html',
                            resolve: lazyLoadProvider.load(['ngTagsInput', 'daterangepicker'])
                        })
                    ;

                }
            ]
        )
    ;
}());
