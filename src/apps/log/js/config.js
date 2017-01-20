'use strict';

(function(){
    var name = 'log';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                    //敏感词管理
                        .state('app.wordfilter', {
                            url: '/wordfilter',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: load( [path + 'js/controllers/log.js'] )
                        })
                        //敏感词列表
                        .state('app.wordfilter.list',{
                            url: '/list',
                            templateUrl: path + 'tpl/log.wordfilter.html',
                            controller: 'WordFilterCtrl'
                        })
                        //敏感词更新
                        .state('app.wordfilter.update',{
                            url: '/update/{id}',
                            templateUrl: path + 'tpl/log.wordupdate.html',
                            controller: 'wordupdateCtrl'
                        })
                        //拦截日志
                        .state('app.wordfilter.log',{
                            url: '/log',
                            templateUrl: path + 'tpl/log.wordfilterlog.html',
                            controller: 'WordFilterLogCtrl'
                        })
                        //留言板列表
                        .state('app.guestbook', {
                            url: '/guestbook',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: load( [path + 'js/controllers/log.js'] )
                        })
                        .state('app.guestbook.list',{
                            url: '/list',
                            templateUrl: path + 'tpl/log.guestbook.html',
                            controller: 'GuestBookCtrl'
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

