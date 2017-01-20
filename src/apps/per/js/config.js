'use strict';

(function(){
    var name = 'per';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                        .state('app.per', {
                            url: '/per',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.per.users', {
                            url: '/users',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: load( [path + 'js/controllers/users.js'] )
                        })
                        .state('app.per.users.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/users_list.html',
                            resolve: load([JQ_CONFIG.daterangepicker,'dateRangePicker'])
                        })
                        .state('app.per.users.edit', {
                            url: '/edit/{id}',
                            templateUrl: 'tpl/users_edit.html',
                            resolve: load(['ng-tags-input'])
                        })
                        .state('app.per.users.edit.avatar', {
                            url: '/avatar',
                            templateUrl: path + 'tpl/imgcrop.html',
                            resolve: load(['ngImgCrop'])
                        })

                        .state('app.per.org', {
                            url: '/org',
                            templateUrl: path + 'tpl/org.html',
                            controller: 'OrgCtrl',
                            resolve: load(['treeControl',JQ_CONFIG.ueditor,'js/controllers/per/org.js'])
                            //     {
                            //     deps: ['$ocLazyLoad', 'uiLoad',
                            //         function ($ocLazyLoad, uiLoad) {
                            //             return $ocLazyLoad.load(['treeControl'])
                            //                 .then(function () {
                            //                     return uiLoad.load(JQ_CONFIG.ueditor,['js/controllers/per/org.js']);
                            //                 });
                            //         }]
                            // }
                        })
                        .state('app.per.role', {
                            url: '/role',
                            templateUrl: 'tpl/per/role.html',
                            controller: 'RoleCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return $ocLazyLoad.load(['treeControl'])
                                            .then(function () {
                                                return uiLoad.load(JQ_CONFIG.ueditor,['js/controllers/per/role.js']);
                                            });
                                    }]
                            }
                        })
                        .state('app.per.resource', {
                            url: '/resource',
                            templateUrl: 'tpl/per/resource.html',
                            controller: 'ResourceCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return $ocLazyLoad.load(['treeControl','ngTagsInput'])
                                            .then(function () {
                                                return uiLoad.load(JQ_CONFIG.ueditor,['js/controllers/per/resource.js']);
                                            });
                                    }]
                            }
                        })
                        .state('app.per.roleUser', {
                            url: '/roleUser',
                            templateUrl: 'tpl/per/role_user.html',
                            controller: 'RoleUserCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return $ocLazyLoad.load(['treeControl','smart-table'])
                                            .then(function () {
                                                return uiLoad.load(JQ_CONFIG.ueditor,['js/controllers/per/roleUser.js']);
                                            });
                                    }]
                            }
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

