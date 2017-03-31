'use strict';
var sso = jm.sdk.sso;
var bank = jm.sdk.bank;

app.controller('SearchUserCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', '$timeout', function ($scope, $state, $stateParams, $http, global, $timeout) {
    var page = 1;
    var pageSize = 10;
    var pages = 1;
    var total = 0;
    $scope.left = function () {
        if(page>1){
            --page;
            $scope.search();
        }
    }
    $scope.right = function () {
        if(page<pages){
            ++page;
            $scope.search();
        }
    };

    $scope.search = function(){
        $scope.moreLoading = true;
        $http.get(statUri+'/players', {
            params:{
                page: page,
                rows: pageSize,
                token: sso.getToken(),
                search: $scope.keyword
            }
        }).success(function(result){
            $scope.moreLoading = false;
            $scope.data = result;
            if($scope.data.err){
                $scope.error($scope.data.msg);
            }else{
                page = result.page;
                pages = result.pages || 1;
                total = result.total || 0;
                $scope.page = page;
                $scope.pages = pages;
                $scope.total = total;
                $scope.usersInfo = $scope.data;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.selectUser = function(row){
        var userId = row._id;
        var uid = row.uid;
        var nick = row.nick;
        bank.query({userId: userId},function(err, result){
            result || (result||{});
            var holds = result.holds||{};
            var jbObj = holds.jb || {};
            var jb = jbObj.amount || 0;
            var obj = {
                id: userId,
                uid: uid,
                nick: nick,
                jb: jb
            };
            sessionStorage.setItem('selectedUser', JSON.stringify(obj));//缓存到本地
            alert(JSON.stringify($state.lastState.params));
            $state.back();
        });
    };

}]);

