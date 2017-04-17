'use strict';
var sso = jm.sdk.sso;



app.controller('BankExchangeCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    $scope.exchange = function(){

    }
}]);

app.controller('BankNPreauthCtrl', ['$scope', '$state', '$http','global', '$timeout', function ($scope, $state, $http,global, $timeout) {
    $scope.bank = {};

    var bankinfo = sessionStorage.getItem('selectedUser');
    if(bankinfo){
        bankinfo = JSON.parse(bankinfo);
        $scope.bank.userId = bankinfo.id;
        $scope.uid = bankinfo.uid;
        $scope.nick = bankinfo.nick;
        console.log($scope.bank.userId);
        sessionStorage.removeItem('selectedUser');
    }

    $scope.defAccount = {user:{},holds:{}};
    $scope.lock = '';

    var bank = jm.sdk.bank;

    var ct = {
        'tb': 'T币',
        'jb': '金币',
        'dbj': '夺宝卷'
    };

    var findAccounts = function(){
        bank.query({
            token: sso.getToken(),
            userId: $scope.bank.userId
        },function(err,result){
            if (result.err) {
                $scope.error(result.msg);
            } else {
                $timeout(function(){
                    $scope.defAccount = result||{};
                    var holds = $scope.defAccount.holds || {};
                    var ary = [];
                    for(var key in holds){
                        var amountLocked = holds[key].amountLocked;
                        if(amountLocked){
                            var str = ct[key]+':'+amountLocked;
                            ary.push(str);
                        }
                    }
                    $scope.lock = ary.join('; ');
                });
            }
        });
    };

    $scope.npreauth = function(){
        if(!$scope.lock){
            return $scope.error('无需取消');
        }
        bank.preauthCancel($scope.bank,function(err,result){
            $timeout(function () {
                if (err) {
                    $scope.error(result.msg||err);
                } else {
                    $scope.success('取消成功');
                }
            });
        });
    };

    $scope.setAll = function(){
        if($scope.bank.allAmount=='1'){
            var holds = $scope.defAccount.holds || {};
            if(holds[$scope.bank.ctCode]){
                $scope.bank.amount = holds[$scope.bank.ctCode].amountLocked;
            }
        }
    };

    $scope.selectCT = function(){
        $scope.bank.allAmount = null;
        $scope.bank.amount = null;
    };

    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.i-1),[10*$scope.i])[$event.currentTarget.rowIndex-1];
        $scope.bank.userId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
        findAccounts();
    };
    $scope.$watch('bank.userId', function () {
        if(!$scope.bank.userId){
            $scope.nick = null;
        }else{
            findAccounts();
        }
    });
    $scope.$watch('bank.ctCode', function () {
        $scope.selectCT();
    });
}]);

app.controller('BankOverdrawCtrl', ['$scope', '$state', '$http', 'global', '$timeout', function ($scope, $state, $http, global, $timeout) {
    $scope.bank = {};

    $scope.overdraw = function(){
        $http.post(bankUri+'/overdraw', $scope.bank, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $scope.bank = {};
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.page = 1;
    $scope.left = function () {
        if($scope.page>1){
            --$scope.page;
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++$scope.page;
        }
    };
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.pages = Math.ceil($scope.usersInfo.rows.length/10);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.page-1),[10*$scope.page])[$event.currentTarget.rowIndex-1];
        $scope.bank.userId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
    };
    $scope.$watch('bank.userId', function () {
        if(!$scope.bank.userId){
            $scope.nick = null;
        }
    });
}]);



