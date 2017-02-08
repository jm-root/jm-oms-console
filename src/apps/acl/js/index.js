/**
 * Created by sahara on 2017/1/18.
 */
'use strict';

(function(){
    var name = 'acl';
    var path = 'apps/'+ name + '/';

    /**
     * acl for the router
     */
    angular.module('app')
        .config(
            [ '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider, $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.acl', {
                            url: '/acl',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.acl.users', {
                            url: '/users',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/users.js'])
                        })
                        .state('app.acl.users.list', {
                            url: '/list',
                            templateUrl: path +'tpl/users_list.html'
                        })
                        .state('app.acl.users.edit', {
                            url: '/edit/{id}',
                            templateUrl: path +'tpl/users_edit.html',
                            resolve: lazyLoadProvider.load(['ngTagsInput','localytics.directives','chosen'])
                        })
                        .state('app.acl.role', {
                            url: '/role',
                            templateUrl: path +'tpl/role.html',
                            controller: 'RoleCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/role.js','ngTagsInput','treeControl','localytics.directives','chosen','ueditor'])
                        })
                        .state('app.acl.resource', {
                            url: '/resource',
                            templateUrl: path +'tpl/resource.html',
                            controller: 'ResourceCtrl',
                            resolve:lazyLoadProvider.load([path + 'js/controllers/resource.js','treeControl','ngTagsInput','localytics.directives','chosen','ueditor'])
                        });
                }
            ]
        );
}());