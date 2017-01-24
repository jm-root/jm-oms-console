'use strict';

(function(){
    var name = 'bbs';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                    //论坛管理
                        .state('app.bbs', {
                            url:'/bbs',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/bbs.js'])
                        })

                        .state('app.bbs.forum', {
                            url: '/forum',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.bbs.forum.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/bbs.forum.list.html',
                            controller: 'BBSForumListCtrl'
                        })
                        .state('app.bbs.forum.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/bbs.forum.edit.html',
                            controller: 'BBSForumEditCtrl',
                            resolve:lazyLoadProvider.load(['ngTagsInput','ueditor'])
                        })
                        .state('app.bbs.forum.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load(['angular-img-cropper'])
                        })

                        .state('app.bbs.topic', {
                            url: '/topic',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.bbs.topic.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/bbs.topic.list.html',
                            controller: 'BBSTopicListCtrl'
                        })
                        .state('app.bbs.topic.edit', {
                            url: '/edit/{id}?pid',
                            templateUrl:path + 'tpl/bbs.topic.edit.html',
                            controller: 'BBSTopicEditCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput','ueditor'])
                        })
                        .state('app.bbs.topic.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load(['angular-img-cropper'])
                        })
                }
            ]
        );
}());

