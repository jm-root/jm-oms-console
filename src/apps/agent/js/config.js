'use strict';

(function(){
    var name = 'agent';
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
                            url: '/agent',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['uiLoad',
                                    function(uiLoad ){
                                        return uiLoad.load( [path + 'js/controllers/agent.js'] );
                                    }]
                            }
                        })
                        .state('app.' + name + '.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/agent.list.html',
                            controller: 'AgentListCtrl'
                        })
                        .state('app.' + name + '.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/agent.edit.html',
                            controller: 'AgentEditCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad',
                                    function ($ocLazyLoad) {
                                        return $ocLazyLoad.load(['smart-table','ng-tags-input']);
                                    }]
                            }
                        })
                        .state('app.' + name + '.create', {
                            url: '/create',
                            templateUrl: path + 'tpl/agent.create.html',
                            controller: 'AgentCreateCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad',
                                    function ($ocLazyLoad) {
                                        return $ocLazyLoad.load(['smart-table','ng-tags-input']);
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

