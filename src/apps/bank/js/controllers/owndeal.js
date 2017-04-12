app.controller('BankOwnDealCtrl', ['$scope', '$state', '$http','$timeout', 'global', function ($scope, $state, $http,$timeout, global) {
    var history = global.bankOwnDealHistory||(global.bankOwnDealHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    var page = 1;
    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    jm.sdk.init({uri: gConfig.sdkHost});
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

        var search = $scope.search;
        var date = search.date;
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";

        bank.history({
            page: page,
            rows: $scope.pageSize,
            isOwn: true,
            startDate: startDate.toString(),
            endDate: endDate.toString()
        },function(err,result){
            var data = result;
            if (data.err) {
                $scope.error(data.msg);
            }else{
                $timeout(function () {
                    $scope.moreLoading = false;
                    $('html,body').animate({ scrollTop: 0 }, 100);
                    $scope.deallist = result.rows;
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
    $scope.$watch('search.date', function () {
        $scope.getdata(1);
    });
}]);
