'use strict';
var sso = jm.sdk.sso;
app.controller('PromoteCtrl', ['$scope', '$state', '$http', '$interval','global', function ($scope, $state, $http, $interval, global) {
    $scope.url = 'http://'+$scope.host+'/index.html';
    $scope.promote = uploadUri+'/qrcode?info='+$scope.url;

    global.getLocalUser().then(function(user){
        $http.get(agentUri + '/agents/'+user.id, {
            params: {
                token: sso.getToken()
            }
        }).success(function (result) {
            if (result.err) {
                $scope.error(result.msg);
            } else {
                result = result || {};
                var code = result.code;
                var level = result.level;
                if(code&&level==2){
                    $scope.url = 'http://'+$scope.host+'/agent.html?agent='+code;
                    $scope.promote = uploadUri+'/qrcode?info='+$scope.url;
                }
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    });
}]);

