'use strict';
var sso = jm.sdk.sso;

app.controller('PlayerChargeCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', '$timeout', function ($scope, $state, $stateParams, $http, global, $timeout) {
    $scope.enableTypeChoose = true;   //是否允许选择操作类型
    $scope.type = $stateParams.type || null;

    var player = sessionStorage.getItem('selectedUser');
    if(player) {
        player = JSON.parse(player);
        $scope.player = player;
    }
    sessionStorage.removeItem("selectedUser");
    var bank = jm.sdk.bank;
    bank.query({},function(err,result){
        result || (result||{});
        var holds = result.holds||{};
        var jbObj = holds.jb || {};
        $scope.jb = global.reg(jbObj.amountValid||0);
    });

    $scope.updateData = function(type, allAmount){
        var account = player.nick||player.account;
        account += '(ID: ' + player.uid + ')';
        var ct = {'jb':global.translateByKey('common.jb')};
        var amount = $scope.amount;
        var memo = $scope.memo||"";
        var fromUserId,toUserId,info,sum;
        if($scope.type == 'charge'){
            fromUserId = sso.user.id;
            toUserId = player.id;
            sum = player.jb + amount;
            info = global.translateByKey('search.player') + account + '<br/> '+global.translateByKey('search.balance') + player.jb + '<br/>'+global.translateByKey('search.charge') + amount + '<br> '+global.translateByKey('search.result')+sum;
        }else if($scope.type == 'uncharge'){
            fromUserId = player.id;
            toUserId = sso.user.id;
            if(allAmount) amount = player.jb;
            sum = player.jb - amount;
            info = global.translateByKey('search.player')+ account + '<br/> '+global.translateByKey('search.balance') + player.jb + '<br/> '+global.translateByKey('search.uncharge') + amount + '<br> '+global.translateByKey('search.result')+sum;
        }

        if(sum<0){
            $scope.openTips({
                title: global.translateByKey('openTips.title'),
                content: global.translateByKey('player.info.TipInfo.balance'),
                cancelTitle: global.translateByKey('openTips.cancelDelContent'),
                singleButton: true
            });
        }else{
            $scope.openTips({
                title:global.translateByKey('player.info.TipInfo.title'),
                content: info,
                okTitle:global.translateByKey('player.info.TipInfo.okTitle'),
                cancelTitle:global.translateByKey('player.info.TipInfo.cancelTitle'),
                okCallback: function($s){
                    var o = {
                        ctCode:"jb",
                        amount:amount,
                        fromUserId:fromUserId,
                        toUserId:toUserId,
                        memo:memo,
                    };
                    bank.transfer(o,function(err,result){
                        if (err) {
                            $timeout(function () {
                                $scope.error(result.msg);
                            });
                        } else {
                            $timeout(function () {
                                $scope.success(global.translateByKey('common.succeed'));
                            });
                            $scope.player.jb = $scope.sum;
                            $scope.amount = null;
                            $scope.memo = "";
                        }
                    });
                }
            });
        }
    }
}]);

