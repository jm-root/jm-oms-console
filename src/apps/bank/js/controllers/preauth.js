app.controller('BankPreauthCtrl', ['$scope', '$state', '$http','$timeout', 'global', function ($scope, $state, $http, $timeout, global) {
    var history = global.bankPreauthHistory||(global.bankPreauthHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var page = 1;
    var bank = jm.sdk.bank;

    //判断是否移动端设置表格样式
    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-220+'px'
        }
    }

    var ok = true;
    $scope.npreauth = function(data){
        if(!ok) return;
        ok = false;
        var hold = data.Hold||{};
        var account = hold.Account||{};
        var user = account.User||{};
        var ct = hold.CT||{};
        var creator = data.User||{};
        var req = {
            createId:creator.userId,
            userId:user.userId,
            ctCode:ct.code,
            allAmount:true
        };
        bank.preauthCancel(req,function(err,result){
            ok = true;
            $timeout(function () {
                if (err) {
                    $scope.error(result.msg||err);
                } else {
                    $scope.success('取消成功');
                    $scope.onPageSizeChanged();
                }
            });
        });
    };

    // function opr_render(params){
    //     return '<button class="btn btn-xs bg-primary m-r-xs" ng-click="npreauth(data)">取消授权</button>';
    // }

    $scope.getdata = function (pagenum) {
        if(pagenum){
            page = pagenum;
        }
        $scope.moreLoading = true;
        console.log($scope.search);
        bank.preauthList({
            page: page,
            rows: $scope.pageSize,
            search: $scope.search
        },function(err,result){
            var data = result;
            console.info(result);
            if (data.err) {
                $scope.error(data.msg);
            }else{
                $timeout(function () {
                    $scope.moreLoading = false;
                    $('html,body').animate({ scrollTop: 0 }, 100);
                    $scope.preauthlist = result.rows;
                    if(result.total){
                        $scope.nodata = false;
                        $scope.page = result.page;
                        $scope.pages = result.pages;
                        $scope.total = result.total;
                        $scope.totalnumber = global.reg(result.total);
                    }else{
                        $scope.nodata = true;
                    }
                })
            }
        });
    }
    $scope.getdata();

    $scope.onPageSizeChanged = function() {
        page = 1;
        $scope.getdata();
    };

    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });

    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
}]);