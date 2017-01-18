'use strict';

(function(){
    var name = 'main';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app').config(
        [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
            function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                var layout = "tpl/app.html";
                if(window.location.href.indexOf("material") > 0){
                    layout = "tpl/blocks/material.layout.html";
                }
                $urlRouterProvider
                    .otherwise('/app/dashboard');

                $stateProvider
                    .state('app', {
                        abstract: true,
                        url: '/app',
                        templateUrl: path + layout,
                        controller: 'AppCtrl',
                        resolve: load([path + 'js/controllers/index.js'])
                    })
                    .state('access', {
                        url: '/access',
                        template: '<div ui-view class="fade-in-right-big smooth">1234</div>'
                    })
                    .state('access.signin', {
                        url: '/signin',
                        templateUrl: path + 'tpl/page_signin.html',
                        resolve: load( [path + 'js/controllers/signin.js'] )
                    })
                    .state('access.signup', {
                        url: '/signup',
                        templateUrl: path + 'tpl/page_signup.html',
                        resolve: load( [path + 'js/controllers/signup.js'] )
                    })
                    .state('access.forgotpwd', {
                        url: '/forgotpwd',
                        templateUrl: path + 'tpl/page_forgotpwd.html'
                    })
                    .state('access.404', {
                        url: '/404',
                        templateUrl: path + 'tpl/page_404.html'
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
