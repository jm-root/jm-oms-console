'use strict';

(function(){
    var name = 'config';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                        .state('app.config', {
                            url: '/config',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: {
                                deps: ['uiLoad','$ocLazyLoad',
                                    function(uiLoad,$ocLazyLoad){
                                        return uiLoad.load( ['../libs/jm/jm-play/jm-play-sdk.min.js',path + 'js/controllers/config.js'] );
                                    }]
                            }
                        })
                        .state('app.config.create', {
                            url: '/config_create/{id}',
                            templateUrl: path + 'tpl/config_create.html',
                            controller: 'ConfigCreateCtrl'
                        })
                        .state('app.config.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/config_list.html',
                            controller: 'ConfigCtrl'
                        })
                        .state('app.config.menus', {
                            url: '/menus',
                            templateUrl: path + 'tpl/config.menus.html',
                            controller: 'ConfigMenusCtrl'
                        })
                        .state('app.config.systeminit', {
                            url: '/systeminit',
                            templateUrl:path +  'tpl/config.systeminit.html',
                            controller: 'ConfigSystemInitCtrl',
                            resolve: {
                                deps: ['$ocLazyLoad', 'uiLoad',
                                    function ($ocLazyLoad, uiLoad) {
                                        return $ocLazyLoad.load(['ngTagsInput']);
                                    }]
                            }
                        })
                        .state('app.config.systemconfig', {
                            url: '/systemconfig',
                            templateUrl:path +  'tpl/config.systemconfig.html',
                            controller: 'ConfigSystemConfigCtrl',
                            resolve: {
                                deps: ['uiLoad',
                                    function(uiLoad ){
                                        return uiLoad.load( ['../libs/jm/jm-play/jm-play-sdk.min.js'] );
                                    }]
                            }
                        })

                        .state('app.config.unified', {
                            url: '/unified',
                            templateUrl:path +  'tpl/config.unified.html',
                            controller: 'ConfigUnifiedCtrl',
                            resolve: {
                                deps: ['uiLoad',
                                    function(uiLoad ){
                                        return uiLoad.load( ['../libs/jm/jm-play/jm-play-sdk.min.js'] );
                                    }]
                            }
                        })
                        .state('app.config.unified.view', {
                            url: '/view',
                            templateUrl: 'tpl/config.unified.view.html',
                        })
                    ;

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

