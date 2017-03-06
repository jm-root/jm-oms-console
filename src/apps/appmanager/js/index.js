'use strict';

(function(){
    var name = 'appmanager';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            ['$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.apps', {
                            url: '/apps',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller: 'AppManagerCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/appManage.js',path + 'js/controllers/index.js'] )
                        })
                        .state('app.apps.manage', {
                            url: '/manage',
                            templateUrl: path + 'tpl/apps_manage.html'
                        })
                        .state('app.apps.manage.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/app_edit.html',
                            resolve: lazyLoadProvider.load(['ngTagsInput', 'angularFileUpload'])
                        })
                        .state('app.apps.manage.edit.icon', {
                            url: '/icon',
                            templateUrl: 'apps/common/tpl/imgcrop.html',
                            resolve: lazyLoadProvider.load(['ngImgCrop'])
                        })
                        .state('app.apps.upload', {
                            url: '/upload',
                            templateUrl: path + 'tpl/apps_upload.html',
                            resolve: lazyLoadProvider.load(['angularFileUpload',path + 'js/controllers/appUpload.js'])
                        })
                        .state('app.rooms', {
                            url: '/rooms',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller: 'AppManagerCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/roomManage.js',path + 'js/controllers/index.js'] )
                        })
                        .state('app.rooms.manage', {
                            url: '/manage',
                            templateUrl: path + 'tpl/rooms_manage.html'
                        })
                        .state('app.rooms.manage.gameset', {
                            url: '/gameset',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [ path + 'js/controllers/gameset.js'] )
                        })
                        .state('app.rooms.manage.gameset.list', {
                            url: '/list/{appId}/{type}',
                            templateUrl: path + 'tpl/gameset_list.html',
                            controller: 'GameSetListCtrl'
                        })
                        .state('app.rooms.manage.gameset.edit', {
                            url: '/edit/{appId}/{type}/{id}',
                            templateUrl: path + 'tpl/gameset_edit.html',
                            controller: 'GameSetEditCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/gameset_edit.js','jmGameDiffcult'])
                        })
                        .state('app.rooms.manage.gameset.table', {
                            url: '/table',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [ path + 'js/controllers/gameset_table.js'] )
                        })
                        .state('app.rooms.manage.gameset.table.list', {
                            url: '/list/{appId}/{type}/{roomId}',
                            templateUrl: path + 'tpl/gameset_table_list.html',
                            controller: 'GameSetTableListCtrl'
                        })
                        .state('app.rooms.manage.gameset.table.edit', {
                            url: '/edit/{appId}/{type}/{roomId}/{id}',
                            templateUrl: path + 'tpl/gameset_table_edit.html',
                            controller: 'GameSetTableEditCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/gameset_table_edit.js','jmGameDiffcult'])
                        })
                        .state('app.rooms.manage.baoxiang', {
                            url: '/baoxiang',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load( [ path + 'js/controllers/baoxiang.js'] )
                        })
                        .state('app.rooms.manage.baoxiang.list', {
                            url: '/list/{appId}',
                            templateUrl: path + 'tpl/baoxiang_list.html',
                            controller: 'BaoXiangListCtrl'
                        })
                        .state('app.rooms.manage.baoxiang.edit', {
                            url: '/edit/{appId}/{id}',
                            templateUrl: path + 'tpl/baoxiang_edit.html',
                            controller: 'BaoXiangEditCtrl'
                        })
                        .state('app.rooms.manage.baoxiang.record', {
                            url: '/record',
                            template: '<div ui-view class="fade-in-down"></div>',
                        })
                        .state('app.rooms.manage.baoxiang.record.list', {
                            url: '/list/:typeId',
                            templateUrl: path + 'tpl/baoxiang_record_list.html',
                            controller: 'BaoXiangRecordListCtrl'
                        })

                }
            ]
        );
}());

