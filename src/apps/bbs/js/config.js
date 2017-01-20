'use strict';

(function(){
    var name = 'bbs';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
                function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
                    $stateProvider
                    //论坛管理
                        .state('app.bbs', {
                            url:'/bbs',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: load([path + 'js/controllers/bbs.js'])
                        })

                        .state('app.bbs.forum', {
                            url: '/forum',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.bbs.forum.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/bbs.forum.list.html',
                            controller: 'BBSForumListCtrl'
                        })
                        .state('app.bbs.forum.edit', {
                            url: '/edit/{id}',
                            templateUrl: path + 'tpl/bbs.forum.edit.html',
                            controller: 'BBSForumEditCtrl',
                            resolve:load(['ng-tags-input',JQ_CONFIG.ueditor])
                        })
                        .state('app.bbs.forum.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: load(['angular-img-cropper'])
                        })

                        .state('app.bbs.topic', {
                            url: '/topic',
                            template: '<div ui-view class="fade-in-down"></div>'
                        })
                        .state('app.bbs.topic.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/bbs.topic.list.html',
                            controller: 'BBSTopicListCtrl'
                        })
                        .state('app.bbs.topic.edit', {
                            url: '/edit/{id}?pid',
                            templateUrl:path + 'tpl/bbs.topic.edit.html',
                            controller: 'BBSTopicEditCtrl',
                            resolve: load(['ng-tags-input',JQ_CONFIG.ueditor])
                        })
                        .state('app.bbs.topic.edit.logo', {
                            url: '/logo',
                            templateUrl: path + 'tpl/imgcrop2.html',
                            resolve: load(['angular-img-cropper'])
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

