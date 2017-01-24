'use strict';

(function(){
    var name = 'activity';
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
                            url: '/activity',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/activity.js'] )
                        })
                        .state('app.'+ name + '.prop', {
                            url: '/prop',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.' + name + '.prop.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/activity.prop.list.html',
                            controller: 'ActivityPropCtrl'
                        })
                        .state('app.' + name + '.prop.edit', {
                            url: '/edit/{id}',
                            params: {pid: null},
                            templateUrl: path + 'tpl/activity.prop.edit.html',
                            controller: 'ActivityPropEditCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput'])
                        })
                        .state('app.' + name + '.prop.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load(['angular-img-cropper'])
                        })
                        .state('app.' + name + '.gaveprop', {
                            url: '/gaveprop',
                            params: {pid: null},
                            templateUrl: path + 'tpl/activity.gaveprop.html',
                            controller: 'ActivityGavePropCtrl'
                        })
                        .state('app.' + name + '.forum', {
                            url: '/forum',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.' + name + '.forum.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/activity.forum.list.html',
                            controller: 'ActivityForumListCtrl'
                        })
                        .state('app.' + name + '.forum.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/activity.forum.edit.html',
                            controller: 'ActivityForumEditCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput','ueditor'])
                        })
                        .state('app.' + name + '.forum.edit.logo', {
                            url: '/logo',
                            templateUrl: 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load('angular-img-cropper')
                        })

                        .state('app.' + name + '.aty', {
                            url: '/aty',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.' + name + '.aty.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/activity.aty.list.html',
                            controller: 'ActivityAtyListCtrl'
                        })
                        .state('app.' + name + '.aty.edit', {
                            url: '/edit/{id}?pid',
                            templateUrl: path + 'tpl/activity.aty.edit.html',
                            controller: 'ActivityAtyEditCtrl',
                            resolve: lazyLoadProvider.load(['ui.bootstrap.datetimepicker','ngTagsInput','ueditor'])
                        })
                        .state('app.' + name + '.aty.edit.logo', {
                            url: '/logo',
                            templateUrl: 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load('angular-img-cropper')
                        })

                        .state('app.' + name + '.aty.item', {
                            url: '/item',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.' + name + '.aty.item.list', {
                            url: '/list?pid',
                            templateUrl: path + 'tpl/activity.aty.item.list.html',
                            controller: 'ActivityAtyItemListCtrl'
                        })
                        .state('app.' + name + '.aty.item.edit', {
                            url: '/edit/{id}?pid',
                            templateUrl: path + 'tpl/activity.aty.item.edit.html',
                            controller: 'ActivityAtyItemEditCtrl',
                            resolve: lazyLoadProvider.load(['ui.bootstrap.datetimepicker','ngTagsInput'])
                        });
                }
            ]
        );
}());

