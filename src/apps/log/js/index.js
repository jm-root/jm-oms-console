'use strict';

(function(){
    var name = 'log';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                    //敏感词管理
                        .state('app.wordfilter', {
                            url: '/wordfilter',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller: 'LogCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/log.js',path + 'js/controllers/index.js'] )
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
                            controller: 'LogCtrl',
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/log.js',path + 'js/controllers/index.js'] )
                        })
                        .state('app.guestbook.list',{
                            url: '/list',
                            templateUrl: path + 'tpl/log.guestbook.html',
                            controller: 'GuestBookCtrl'
                        })
                }
            ]
        );
}());

