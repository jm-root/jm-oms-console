'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$state', '$translatePartialLoader', '$http', 'global', function ($scope, $state, $translatePartialLoader, $http, global) {
        $translatePartialLoader.addPart('common');
        $translatePartialLoader.addPart('main');
        var sso = jm.sdk.sso;
        global.getUser().then(function (user) {
            $scope.userInfo = user;
            return global.getRoles();
        }).then(function (roles) {
            global.ready = true;
            global.emit('ready', global);
            $http.get(adminUri + '/navs', {
                params: {
                    token: sso.getToken(),
                    acl_user: sso.user.id
                }
            }).success(function (result) {
                console.log(result);
                var obj = result;
                if (obj.err) {
                    $scope.error(obj.msg);
                } else {
                    var b=[];
                    var a=obj.ret;
                    a.forEach(function (item) {
                          if(item.code=="app.acl.manage" ){
                              b.unshift(item);
                          }else if( item.code=="app.config.manage"){
                              if(b[0]&&b[0].code=="app.acl.manage"){
                                  b.splice(1,0,item);
                              }else{
                                  b.unshift(item);
                              }
                          } else {
                              b.push(item);
                          }
                    });
                    $scope.nav = b;
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
    }])
;


