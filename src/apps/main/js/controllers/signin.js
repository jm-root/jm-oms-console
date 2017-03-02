'use strict';

/* Controllers */
// signin controller
app.controller('SigninCtrl', ['$scope', '$http', '$state', '$translatePartialLoader', function ($scope, $http, $state, $translatePartialLoader) {
    $translatePartialLoader.addPart('main');
    var sso = jm.sdk.sso;
    $scope.user = {account:localStorage.getItem('account')||''};
    $scope.visImgCode = localStorage.getItem('visImgCode')=='true';
    $scope.headerImg = sdkHost+(localStorage.getItem('headerImg')||'/apps/common/img/avatar.jpg');

    $scope.authError = sso.authError || null;
    var isWXLongin = localStorage.getItem('isWXLogin');
    $scope.isWXLongin = !!(isWXLongin=='1'||isWXLongin=='true');

    $scope.login = function () {
        localStorage.setItem('loginExpire', Date.now()+86400000);
        localStorage.setItem('isWXLogin', false);
        $scope.authError = null;
        sso.signon($scope.user, function(err, result){
            console.log(result);
            localStorage.setItem('account', $scope.user.account);
            if(result.token){
                localStorage.setItem('token',result.token);
                localStorage.setItem('id',result.id);
                localStorage.setItem('visImgCode', false);
                $scope.visImgCode = false;
                $state.go('app.dashboard');
            }else{
                $scope.authError = '账号或密码错误';
                if(result.err===2006||result.err===2007){
                    localStorage.setItem('visImgCode', true);
                    $scope.visImgCode = true;
                }
                if($scope.visImgCode) $scope.refresh();
                if(result.err===2007) $scope.authError = '验证码错误';
                $scope.isWXLongin = false;
                $scope.warning($scope.authError);
            }
        });
    };

    $scope.weixin = function(){
        $scope.authError =
        localStorage.setItem('isWXLogin', true);
        $http.get(ssoUri+'/wechat/authuri', {
            params: {
                process_uri:'http://'+$scope.host+'/wechat/oauth',
                process_uri2:'http://'+$scope.host+'/wechat_oauth.html',
                web: 1,
                uri:'http://'+$scope.host+'/admin'
            }
        }).success(function(result){
            window.location = result.uri;
        }).error(function(msg, code){
        });
    };

    $scope.onInput = function(){
        if($scope.authError) $scope.authError = null;
    };

    $scope.refresh = function(){
        var rkey = Date.now();
        $scope.user.rkey = rkey;
        $scope.imgCodeUri = uploadUri+'/imgCode/'+rkey+'/img.jpg';
    };
    $scope.refresh();
}]);