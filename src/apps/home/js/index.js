'use strict';

(function(){
    var name = 'home';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                    //大厅管理
                        .state('app.home', {
                            url: '/home',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/home.js'])
                        })
                        .state('app.home.vip', {
                            url: '/vip',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( ['../libs/jm/jm-play/jm-play-sdk.min.js',path + 'js/controllers/vip.js'] )
                        })
                        .state('app.home.vip.cond', {
                            url: '/cond',
                            templateUrl: path + 'tpl/home.vip.cond.html',
                            controller: 'VipCondCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput'])
                        })
                        .state('app.home.vip.item', {
                            url: '/item',
                            templateUrl: path + 'tpl/home.vip.item.html',
                            controller: 'VipItemCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput'])
                        })
                        .state('app.home.vip.set', {
                            url: '/set',
                            templateUrl: path + 'tpl/home.vip.set.html',
                            controller: 'VipSetCtrl'
                        })
                        .state('app.home.vip.setedit', {
                            url: '/setedit/{key}',
                            templateUrl: path + 'tpl/home.vip.setedit.html',
                            controller: 'VipSetEditCtrl',
                            resolve: lazyLoadProvider.load(['chosen','ueditor','localytics.directives'])
                        })

                        .state('app.home.turntable', {
                            url: '/turntable',
                            templateUrl: path + 'tpl/home.turntable.html',
                            controller: 'HomeTurntableCtrl',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/turntable.js'])
                        })

                        .state('app.home.bbs', {
                            url: '/bbs',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.home.bbs.forum', {
                            url: '/forum',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.home.bbs.forum.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/home.bbs.forum.list.html',
                            controller: 'HomeBBSForumListCtrl'
                        })
                        .state('app.home.bbs.forum.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/home.bbs.forum.edit.html',
                            controller: 'HomeBBSForumEditCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput','ueditor'])
                        })
                        .state('app.home.bbs.forum.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load('angular-img-cropper')
                        })

                        .state('app.home.bbs.topic', {
                            url: '/topic',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.home.bbs.topic.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/home.bbs.topic.list.html',
                            controller: 'HomeBBSTopicListCtrl'
                        })
                        .state('app.home.bbs.topic.edit', {
                            url: '/edit/{id}?pid',
                            templateUrl: path + 'tpl/home.bbs.topic.edit.html',
                            controller: 'HomeBBSTopicEditCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput','ueditor'])
                        })
                        .state('app.home.bbs.topic.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load('angular-img-cropper')
                        })

                        .state('app.home.activitys', {
                            url: '/activitys',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.home.activitys.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/home.activity.list.html',
                            controller: 'HomeActivityListCtrl'
                        })
                        .state('app.home.activitys.edit', {
                            url: '/edit/{id}',
                            params: {pid: null},
                            templateUrl: path + 'tpl/home.activity.edit.html',
                            controller: 'HomeActivityEditCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput','ueditor'])
                        })
                        .state('app.home.activitys.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: lazyLoadProvider.load('angular-img-cropper')
                        })
                        .state('app.home.checkin', {
                            url: '/checkin',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/checkin.js'] )
                        })
                        .state('app.home.checkin.list', {
                            url: 'list',
                            templateUrl: path + 'tpl/home.checkin.html',
                            controller: "CheckinCtrl"
                        })
                        .state('app.home.checkin.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/home.checkin.edit.html',
                        })
                        .state('app.home.sendnotice', {
                            url: '/sendnotice',
                            templateUrl: path + 'tpl/home.sendnotice.html',
                            controller: "HomeSendNoticeCtrl",
                            resolve: lazyLoadProvider.load(['ui.bootstrap.datetimepicker','ngTagsInput','../libs/jm/jm-play/jm-play-sdk.min.js'])
                        })
                        .state('app.home.senddak', {
                            url: '/senddak',
                            templateUrl: path + 'tpl/home.dak.send.html',
                            controller: "HomeDakSendCtrl"
                        })
                        .state('app.home.rank', {
                            url: '/rank',
                            templateUrl: path + 'tpl/home.rankset.html',
                            controller: "HomeRankSetCtrl"
                        })
                }
            ]
        );
}());

