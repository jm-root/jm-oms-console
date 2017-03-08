'use strict';

(function () {
    var name = 'robot';
    var path = 'apps/' + name + '/';

    angular.module('app')
        .config(
            ['$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider, $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.robot', {
                            abstract: true,
                            url: '/robot',
                            template: '<div ui-view class="fade-in-right-big smooth"></div>',
                            resolve: lazyLoadProvider.load(['ui.bootstrap.datetimepicker', path + 'js/controllers/index.js', path + 'js/controllers/robot.js', '../libs/jm/jm-ms/dist/js/jm-ms.js'])
                        })
                        .state('app.robot.manage', {
                            url: '/manage',
                            templateUrl: path +'tpl/robot.html',
                            // resolve: lazyLoadProvider.load(['ngTagsInput', 'daterangepicker'])
                            controller:'RobotManageCtrl',
                        })
                    ;

                }
            ]
        )
    ;
}());
