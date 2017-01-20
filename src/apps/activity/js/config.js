'use strict';

(function(){
    var name = 'activity';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                        .state('app.' + name, {
                            url: '/activity',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['uiLoad',
                                    function(uiLoad ){
                                        return uiLoad.load( [path + 'js/controllers/activity.js'] );
                                    }]
                            }
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
                            resolve: {
                                deps: ['$ocLazyLoad',
                                    function ($ocLazyLoad) {
                                        // return $ocLazyLoad.load(['ng-tags-input']);
                                    }]
                            }
                        })
                        .state('app.' + name + '.prop.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: {
                                deps: ['$ocLazyLoad',
                                    function( $ocLazyLoad ){
                                        // return $ocLazyLoad.load('angular-img-cropper');
                                    }]
                            }
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
                            // resolve: {
                            //     deps: ['$ocLazyLoad', 'uiLoad',
                            //         function( $ocLazyLoad, uiLoad ){
                            //             // return $ocLazyLoad.load(['ng-tags-input'])
                            //             //     .then(function () {
                            //             //         return uiLoad.load(JQ_CONFIG.ueditor);
                            //             //     });
                            //         }]
                            // }
                        })
                        .state('app.' + name + '.forum.edit.logo', {
                            url: '/logo',
                            templateUrl: 'tpl/imgcrop2.html',
                            resolve: {
                                deps: ['$ocLazyLoad',
                                    function( $ocLazyLoad ){
                                        // return $ocLazyLoad.load('angular-img-cropper');
                                    }]
                            }
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
                            // resolve: {
                            //     deps: ['$ocLazyLoad', 'uiLoad',
                            //         function( $ocLazyLoad, uiLoad ){
                            //             return $ocLazyLoad.load(['ui.bootstrap.datetimepicker','ng-tags-input'])
                            //                 .then(function () {
                            //                     return uiLoad.load(JQ_CONFIG.ueditor);
                            //                 });
                            //         }]
                            // }
                        })
                        .state('app.' + name + '.aty.edit.logo', {
                            url: '/logo',
                            templateUrl: 'tpl/imgcrop2.html',
                            resolve: {
                                deps: ['$ocLazyLoad',
                                    function( $ocLazyLoad ){
                                        // return $ocLazyLoad.load('angular-img-cropper');
                                    }]
                            }
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
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad ){
                                        return $ocLazyLoad.load(['ui.bootstrap.datetimepicker','ng-tags-input']);
                                    }]
                            }
                        });

                    function load(srcs, callback) {
                        console.info(srcs);
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

