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
            [ '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider, $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                        .state('app.acl', {
                            url: '/acl',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.acl.users', {
                            url: '/users',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: load([path + 'js/controllers/users.js'])
                        })
                        .state('app.acl.users.list', {
                            url: '/list',
                            templateUrl: path +'tpl/users_list.html',
                            resolve: load(['moment'£¬'daterangepicker'])
                        })
                        .state('app.acl.users.edit', {
                            url: '/edit/{id}',
                            templateUrl: path +'tpl/users_edit.html',
                            resolve: load(['ng-tags-input'])
                        })
                        .state('app.acl.role', {
                            url: '/role',
                            templateUrl: path +'tpl/role.html',
                            controller: 'RoleCtrl',
                            resolve: load([path + 'js/controllers/role.js','uiTree','ng-tags-input','localytics.directives'])
                        })
                        .state('app.acl.resource', {
                            url: '/resource',
                            templateUrl: path +'tpl/resource.html',
                            controller: 'ResourceCtrl',
                            resolve:load([path + 'js/controllers/resource.js','uiTree','ng-tags-input','localytics.directives'])
                        });

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