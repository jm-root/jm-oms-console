'use strict';
var sso = jm.sdk.sso;
app.controller('PackageTakeCtrl', ['$scope', '$state', '$http', '$q','global', function ($scope, $state, $http, $q,global) {
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.downloadUrl = history.downloadUrl;
    $scope.downloadTip = history.downloadTip;

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
                $scope.agentCode = result.code;
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    });

    $scope.generate = function(){
        if(!$scope.agentCode){
            return $scope.error('请先成为代理');
        }
        $scope.downloadTip = '正在打包中请等待';
        $http.post(appMgrUri+'/pack', {agent:$scope.agentCode,creator:sso.user.id}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                console.log(result);
                $scope.downloadUrl = sdkHost+result.path;
                $scope.downloadTip = '打包完成请下载';
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.download = function(){
        window.location = $scope.downloadUrl;
    };

    $scope.$watch('downloadUrl', function () {
        history.downloadUrl = $scope.downloadUrl;
    });
    $scope.$watch('downloadTip', function () {
        history.downloadTip = $scope.downloadTip;
    });
}]);


app.controller('PackageSetCtrl', ['$scope', '$state', '$http', '$q', 'global', function ($scope, $state, $http, $q,global) {
    $scope.agent = {apps:[]};

    $http.get(agentUri + '/subAgents', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.agents = result.rows;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });

    $http.get(agentUri + '/apps', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.apps = result.rows;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });

    $scope.changeAgent = function(){
        $http.get(agentUri + '/package', {
            params: {
                token: sso.getToken(),
                agent: $scope.agentCode
            }
        }).success(function (result) {
            if (result.err) {
                $scope.error(result.msg);
            } else {
                $scope.agent = result||{};
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    };

    $scope.save = function(){
        var data = {agent:$scope.agentCode,apps:$scope.agent.apps};
        $http.post(agentUri+'/package', data, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success('设置成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
}]);
