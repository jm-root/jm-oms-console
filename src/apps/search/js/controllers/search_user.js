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

    $scope.search = function(_page){
        if(_page) page = 1;
        if($scope.keyword){
            var url = statUri+'/players';
            $scope.moreLoading = true;
        }else{
            var url = "";
        }

        var type = $stateParams.type;
        var param = {
            token: sso.getToken(),
            page: page,
            rows: pageSize,
            search:$scope.keyword
        }
        if(type==1){
            param.isSuperAgent = true;
        }
        if(type==2){
            param.isPlayer = true;
        }
        $http.get(url, {
            params:param
        }).success(function(result){
            $scope.moreLoading = false;
            $scope.usersInfo = result;
            if(result.err){
                $scope.error(result.msg);
            }else{
                page = result.page;
                pages = result.pages || 1;
                total = result.total || 0;
                $scope.page = page;
                $scope.pages = pages;
                $scope.total = total;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });

    };
    $scope.myKeyup = function(e){
        var keycode = window.event?e.keyCode:e.which;
        if(keycode==13){
            $scope.search(1);
        }
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
            $state.back();
        });
    };

}]);

