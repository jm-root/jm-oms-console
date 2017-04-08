app.controller('BankDealCtrl', ['$scope', '$state', '$http','$timeout', 'global', function ($scope, $state, $http,$timeout, global) {
    var history = global.bankDealHistory||(global.bankDealHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search.user = $scope.search.user || '';

    var page = 1;
    var bank = jm.sdk.bank;

    //判断是否移动端设置表格样式
    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-240+'px'
        }
    }

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.getdata();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.getdata();
        }
    };

    $scope.getdata = function(pagenum) {
        if(pagenum){
            page = pagenum;
        }
        $scope.moreLoading = true;
        bank.history({
            page: page,
            rows: $scope.pageSize
        },function(err,result){
            var data = result;
            console.info(result);
            if (data.err) {
                $scope.error(data.msg);
            }else{
                $timeout(function () {
                    $scope.moreLoading = false;
                    $('html,body').animate({ scrollTop: 0 }, 100);
                    if(result.total){
                        $scope.nodata = false;
                        $scope.deallist = result.rows;
                        $scope.page = result.page;
                        $scope.pages = result.pages;
                        $scope.total = result.total;
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
}]);
