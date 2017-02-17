'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$state', '$translatePartialLoader', '$http', 'global', function ($scope, $state, $translatePartialLoader, $http, global) {
        $translatePartialLoader.addPart('common');
        $translatePartialLoader.addPart('main');

        $scope.defaultRows = '20';
        $scope.listRowsOptions = [{val:'20'},{val:'50'},{val:'100'},{val:'200'},{val:'500'},{val:'1000'}];

        var sso = jm.sdk.sso;
        global.getUser().then(function (user) {
            $scope.userInfo = user;
            return global.getRoles();
        }).then(function (roles) {
            global.ready = true;
            global.emit('ready', global);
            $http.get(omsUri + '/nav', {
                params: {
                    token: sso.getToken(),
                    acl_user: $scope.userInfo.id
                }
            }).success(function (result) {
                console.log(result);
                var obj = result;
                if (obj.err) {
                    $scope.error(obj.msg);
                } else {
                    $scope.nav = sort(obj.ret);
                }
            }).error(function (msg, code) {
                console.log(msg);
                //$scope.errorTips(code);
            });
        }).catch(function (err) {
            if (err.err) {
                $scope.error(err.msg);
            } else if (err.code) {
                $scope.errorTips(code);
            }
            $state.go('access.signin');
        });

        $scope.signout = function () {
            sso.signout();
            $state.go('access.signin');
            localStorage.setItem('isWXLogin', false);
        };

        $state.back = function () {
            if (!$state.lastState) return;
            $state.go($state.lastState.name, $state.lastState.params);
        };

        $scope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                $state.lastState = {
                    name: fromState.name,
                    params: fromParams
                };
            }
        );
        //菜单排序
        function sort(navs) {
            var navSort=[];
            var model=["app.promote","app.player.manage","app.recharge.manage", "app.wordfilter.manage","app.guestbook.manage",
                "app.home.manage", "app.activity.manage", "app.bbs.manage","app.shop.manage","app.app.manage",
                "app.room.manage","app.package.manage","app.agent.manage","app.agent.data","app.coin.sys",
                "app.report.manage","app.bank.manage","app.acl.manage","app.system.manage","app.config.manage"];
            model.forEach(function (item) {
                navs.forEach(function (nav) {
                    if(nav.code==item){
                        navSort.push(nav);
                    }
                });
            });
            return navSort;
        }
    }])
;


