'use strict';
var sso = jm.sdk.sso;

app.controller('PlayerChargeCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', '$timeout', function ($scope, $state, $stateParams, $http, global, $timeout) {
    $scope.enableTypeChoose = true;   //是否允许选择操作类型
    $scope.type = $stateParams.type || null;


    var player = sessionStorage.getItem('selectedUser');
    if(player) {
        player = JSON.parse(player);
        $scope.player = player;
        $scope.playerjb = global.reg(player.jb);
    }
    sessionStorage.removeItem("selectedUser");


    var bank = jm.sdk.bank;
    $scope.querybank = function () {
        bank.query({},function(err,result){
            result || (result||{});
            var holds = result.holds||{};
            var jbObj = holds.jb || {};
            $scope.balence = jbObj.amountValid||0;
            $scope.jb = global.reg(jbObj.amountValid||0);
        });
    }
    $scope.querybank();


    $scope.updateData = function(type, allAmount){

        var ct = {'jb':global.translateByKey('common.jb')};
        var amount = $scope.amount;
        var memo = $scope.memo||"";
        var fromUserId,toUserId,info,sum;

        if(player != null){
            var account = player.nick||"";
            account += '('+ global.translateByKey('search.account') + (player.account||player.uid) + ')';
            if($scope.type == 'charge'){
                fromUserId = sso.user.id;
                toUserId = player.id;
                sum = player.jb + amount;
                info = global.translateByKey('search.player') + account + '<br/> '+global.translateByKey('search.balance') + global.reg(player.jb) + '<br/>'+global.translateByKey('search.charge') + amount + '<br> '+global.translateByKey('search.result')+global.reg(sum);
            }else if($scope.type == 'uncharge'){
                fromUserId = player.id;
                toUserId = sso.user.id;
                if(allAmount) amount = player.jb;
                sum = player.jb - amount;
                info = global.translateByKey('search.player')+ account + '<br/> '+global.translateByKey('search.balance') + global.reg(player.jb) + '<br/> '+global.translateByKey('search.uncharge') + amount + '<br> '+global.translateByKey('search.result')+global.reg(sum);
            }

            if(sum<0||amount>$scope.balence){
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
                                $scope.amount = "";
                                $scope.memo = "";
                                $scope.player = null;
                                $scope.amount = null;
                                $scope.querybank();
                            }
                        });
                    }
                });
            }

        }else{
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('player.info.transferTip.tip'),
                cancelTitle:global.translateByKey('player.info.TipInfo.okTitle'),
                singleButton:true
            });
        }
    }
}]);

