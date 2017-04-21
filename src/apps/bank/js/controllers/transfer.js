app.controller('BankTransferCtrl', ['$scope', '$state', '$http',  'global', '$timeout', function ($scope, $state, $http,  global, $timeout) {

    $scope.bank = {};
    var transinfo = sessionStorage.getItem('selectedUser');
    if(transinfo){
        transinfo = JSON.parse(transinfo);
        $scope.bank.toUserId = transinfo.id;
        $scope.transinfo = transinfo;
        $scope.uid = transinfo.uid;
        $scope.nick = transinfo.nick;
        sessionStorage.removeItem('selectedUser');
    }

    $scope.accounts = [];
    $scope.defAccount = {user:{},holds:{}};

    var bank = jm.sdk.bank;

    global.getLocalUser().then(function(user){
        bank.isCP({},function(err,result){
            if (result.err) {
                return $scope.error(result.msg);
            }
            $scope.isCP = result.ret;
            if(!$scope.isCP){
                bank.accounts({
                    userId: user.id
                },function(err,result){
                    if (result.err) {
                        $scope.error(result.msg);
                    } else {
                        $scope.accounts = result.rows;
                        $scope.defAccount = _.find($scope.accounts, { id: $scope.accounts[0].user.accountId });
                        $scope.bank.fromAccountId = $scope.defAccount.user.accountId;
                    }
                });
            }
        });
    });

    $scope.changeAcount = function(){
        $scope.defAccount = _.find($scope.accounts, { id: $scope.bank.fromAccountId });
    };

    $scope.transfer = function(){
        $scope.bank.ctCode = $scope.bank.ctCode || "jb";
        var hold = $scope.defAccount.holds[$scope.bank.ctCode||"jb"]||{amountValid:0};

        if(transinfo != null){
            var account = transinfo.nick||transinfo.uid;
            var ammount = global.reg($scope.bank.amount||0);
            var info = global.translateByKey('search.user') + account + '<br/> '+global.translateByKey('search.transfer') + ammount;
            if(!$scope.isCP&&hold.amountValid<$scope.bank.amount){
                $scope.openTips({
                    title: global.translateByKey('openTips.title'),
                    content: global.translateByKey('openTips.balance'),
                    cancelTitle: global.translateByKey('openTips.cancelDelContent'),
                    singleButton: true
                });
            }else{
                $scope.openTips({
                    title:global.translateByKey('openTips.updateAccount'),
                    content: info,
                    okTitle:global.translateByKey('openTips.cancelDelContent'),
                    cancelTitle:global.translateByKey('openTips.cancelTitle'),
                    okCallback: function($s){
                        bank.transfer($scope.bank,function(err,result){
                            if (err) {
                                $timeout(function () {
                                    $scope.error(result.msg);
                                });
                            } else {
                                $timeout(function () {
                                    $scope.success('转账成功');
                                    $scope.bank.amount = null;
                                    $scope.bank = {} ;
                                    $scope.transinfo = null;
                                });
                            }
                        });
                    }
                });
            }
        }else {
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.selectPlayer'),
                cancelTitle:global.translateByKey('openTips.cancelDelContent'),
                singleButton:true
            });
        }

    };
}]);
