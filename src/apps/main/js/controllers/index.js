'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$state', '$translatePartialLoader', '$http', '$interval', 'global', function ($scope, $state, $translatePartialLoader, $http, $interval, global) {
        $translatePartialLoader.addPart('common');
        $translatePartialLoader.addPart('main');

        $scope.defaultRows = '20';
        $scope.listRowsOptions = [{val:'20'},{val:'50'},{val:'100'},{val:'200'},{val:'500'},{val:'1000'}];

        var url = omsUri+'/nav';
        $scope.times = 0;
        var sso = jm.sdk.sso;
        global.getUser().then(function (user) {
            $scope.userInfo = user;
            if($scope.userInfo.headimgurl)
                localStorage.setItem('headerImg', $scope.userInfo.headimgurl);
            return global.getRoles();
        }).then(function (roles) {
            $scope.updateTimes();
            $scope.roles = roles;

            global.ready = true;
            global.emit('ready', global);
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    acl_user: $scope.userInfo.id
                }
            }).success(function (result) {
                // console.log(result);
                var obj = result;
                if (obj.err) {
                    $scope.error(obj.msg);
                } else {
                    $scope.nav = obj.rows||[];
                }
            }).error(function (msg, code) {
                console.log(msg);
                //$scope.errorTips(code);
            });
        }).catch(function (err) {
            // if (err.err) {
            //     $scope.error(err.msg);
            // } else if (err.code) {
            //     $scope.errorTips(err.code);
            // }
            $state.go('access.signin');
        });

        $scope.signout = function () {
            sso.signout();
            $state.go('access.signin');
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

        var t = $interval(function(){
            if($scope.times<Date.now()){
                localStorage.removeItem('token');
                $state.go('lockme');
                $scope.warning('长时间没操作,为你的账号安全暂时退出后台!');
            }
            var loginExpire = localStorage.getItem('loginExpire');
            if(loginExpire<Date.now()){
                $scope.signout();
                $scope.warning('你的token已过期,请重新登录!');
            }
        }, 5000);
        $scope.$on("$destroy", function(){
            $interval.cancel(t);
        });

        $scope.updateTimes = function(expired){
            var expire = expired || 1200000;
            $scope.times = Date.now()+expire;
        };

    }])
;


