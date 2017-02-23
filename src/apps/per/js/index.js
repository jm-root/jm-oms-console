'use strict';

(function(){
    var name = 'per';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.per', {
                            url: '/per',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.per.users', {
                            url: '/users',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/users.js'])
                        })
                        .state('app.per.users.list', {
                            url: '/list',
                            templateUrl: path +'tpl/users_list.html',
                            resolve: lazyLoadProvider.load(['daterangepicker'])
                        })
                        .state('app.per.users.edit', {
                            url: '/edit/{id}',
                            templateUrl: path +'tpl/users_edit.html',
                            resolve: lazyLoadProvider.load(['ngTagsInput'])
                        })
                        .state('app.per.users.edit.avatar', {
                            url: '/avatar',
                            templateUrl: 'apps/common/tpl/imgcrop.html',
                            resolve: lazyLoadProvider.load(['ngImgCrop'])
                        })

                        .state('app.per.org', {
                            url: '/org',
                            templateUrl: path +'tpl/org.html',
                            controller: 'OrgCtrl',
                            resolve: lazyLoadProvider.load(['ueditor','treeControl',path + 'js/controllers/org.js'])
                        })
                        .state('app.per.role', {
                            url: '/role',
                            templateUrl: path +'tpl/role.html',
                            controller: 'RoleCtrl',
                            resolve: lazyLoadProvider.load(['ueditor','treeControl',path + 'js/controllers/role.js'])
                        })
                        .state('app.per.resource', {
                            url: '/resource',
                            templateUrl: path +'tpl/resource.html',
                            controller: 'ResourceCtrl',
                            resolve: lazyLoadProvider.load(['ueditor','treeControl','ngTagsInput',path + 'js/controllers/resource.js'])
                        })
                        .state('app.per.roleUser', {
                            url: '/roleUser',
                            templateUrl: path +'tpl/role_user.html',
                            controller: 'RoleUserCtrl',
                            resolve: lazyLoadProvider.load(['ueditor','treeControl','smart-table',path + 'js/controllers/roleUser.js'])
                        })
                }
            ]
        );
}());

