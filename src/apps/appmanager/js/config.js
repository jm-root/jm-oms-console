'use strict';

(function(){
    var name = 'appmanager';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            ['$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                        .state('app.apps', {
                            url: '/apps',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['uiLoad',
                                    function(uiLoad ){
                                        return uiLoad.load( [path + 'js/controllers/appManage.js'] );
                                    }]
                            }
                        })
                        .state('app.apps.manage', {
                            url: '/manage',
                            templateUrl: path + 'tpl/apps_manage.html'
                        })
                        .state('app.apps.manage.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/app_edit.html',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return $ocLazyLoad.load(['ng-tags-input', 'angularFileUpload']);
                                    }]
                            }
                        })
                        .state('app.apps.manage.edit.icon', {
                            url: '/icon',
                            templateUrl: path + 'tpl/imgcrop.html',
                            resolve: {
                                deps: ['$ocLazyLoad',
                                    function( $ocLazyLoad ){
                                        return $ocLazyLoad.load('ngImgCrop');
                                    }]
                            }
                        })
                        .state('app.apps.upload', {
                            url: '/upload',
                            templateUrl: path + 'tpl/apps_upload.html',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad){
                                        return $ocLazyLoad.load('angularFileUpload').then(
                                            function(){
                                                return uiLoad.load(path + 'js/controllers/appUpload.js');
                                            }
                                        );
                                    }]
                            }
                        })
                        .state('app.rooms', {
                            url: '/rooms',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['uiLoad',
                                    function(uiLoad ){
                                        return uiLoad.load( [path + 'js/controllers/roomManage.js'] );
                                    }]
                            }
                        })
                        .state('app.rooms.manage', {
                            url: '/manage',
                            templateUrl: path + 'tpl/rooms_manage.html'
                        })
                        .state('app.rooms.manage.gameset', {
                            url: '/gameset',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return uiLoad.load( ['../libs/jm/jm-play/jm-play-sdk.min.js', path + 'js/controllers/gameset.js'] );
                                    }]
                            }
                        })
                        .state('app.rooms.manage.gameset.list', {
                            url: '/list/{appId}/{type}',
                            templateUrl: path + 'tpl/gameset_list.html',
                            controller: 'GameSetListCtrl'
                        })
                        .state('app.rooms.manage.gameset.edit', {
                            url: '/edit/{appId}/{type}/{id}',
                            templateUrl: 'tpl/appmanager/gameset_edit.html',
                            controller: 'GameSetEditCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return uiLoad.load( ['js/controllers/appmanager/gameset_edit.js']).then(function () {
                                            return uiLoad.load(JQ_CONFIG.jmGameDiffcult);
                                        });

                                    }]
                            }
                        })
                        .state('app.rooms.manage.gameset.table', {
                            url: '/table',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return uiLoad.load( ['../common/js/jm-play-sdk.min.js', 'js/controllers/appmanager/gameset_table.js'] );
                                    }]
                            }
                        })
                        .state('app.rooms.manage.gameset.table.list', {
                            url: '/list/{appId}/{type}/{roomId}',
                            templateUrl: 'tpl/appmanager/gameset_list.html',
                            controller: 'GameSetTableListCtrl'
                        })
                        .state('app.rooms.manage.gameset.table.edit', {
                            url: '/edit/{appId}/{type}/{roomId}/{id}',
                            templateUrl: 'tpl/appmanager/gameset_table_edit.html',
                            controller: 'GameSetTableEditCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return uiLoad.load( ['js/controllers/appmanager/gameset_table_edit.js']).then(function () {
                                            return uiLoad.load(JQ_CONFIG.jmGameDiffcult);
                                        });

                                    }]
                            }
                        })
                        .state('app.rooms.manage.baoxiang', {
                            url: '/baoxiang',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return uiLoad.load( ['../common/js/jm-play-sdk.min.js', 'js/controllers/appmanager/baoxiang.js'] );
                                    }]
                            }
                        })
                        .state('app.rooms.manage.baoxiang.list', {
                            url: '/list/{appId}',
                            templateUrl: 'tpl/appmanager/baoxiang_list.html',
                            controller: 'BaoXiangListCtrl'
                        })
                        .state('app.rooms.manage.baoxiang.edit', {
                            url: '/edit/{appId}/{id}',
                            templateUrl: 'tpl/appmanager/baoxiang_edit.html',
                            controller: 'BaoXiangEditCtrl'
                        })
                        .state('app.rooms.manage.baoxiang.record', {
                            url: '/record',
                            template: '<div ui-view class="fade-in-down"></div>',
                        })
                        .state('app.rooms.manage.baoxiang.record.list', {
                            url: '/list/:typeId',
                            templateUrl: 'tpl/appmanager/baoxiang_record_list.html',
                            controller: 'BaoXiangRecordListCtrl'
                        })


                    function load(srcs, callback) {
                        return {
                            deps: ['$ocLazyLoad', '$q',
                                function( $ocLazyLoad, $q ){
                                    var deferred = $q.defer();
                                    var promise  = false;
                                    srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                                    if(!promise){
                                        promise = deferred.promise;
                                    }
                                    angular.forEach(srcs, function(src) {
                                        promise = promise.then( function(){
                                            if(JQ_CONFIG[src]){
                                                return $ocLazyLoad.load(JQ_CONFIG[src]);
                                            }
                                            angular.forEach(MODULE_CONFIG, function(module) {
                                                if( module.name == src){
                                                    name = module.name;
                                                }else{
                                                    name = src;
                                                }
                                            });
                                            return $ocLazyLoad.load(name);
                                        } );
                                    });
                                    deferred.resolve();
                                    return callback ? promise.then(function(){ return callback(); }) : promise;
                                }]
                        }
                    }
                }
            ]
        );
}());

