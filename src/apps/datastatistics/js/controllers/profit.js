
app.controller('ProfitCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = {};
    $scope.search.date = $scope.search.date||{};

    var page = 1;

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.startDate = moment().subtract(1, 'months');
    $scope.dateOptions.endDate = moment();
    $scope.dateOptions.opens = 'left';

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px',
            border:'1px solid #cccccc'
        }
    }

    $http.get(agentUri + '/subAgents', {
        params:{
            token: sso.getToken(),
            search:$scope.search.agent
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.channels = obj.rows||[];
            $scope.select = true;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $http.get(appMgrUri + '/appList', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        console.log(result)
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.games = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

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

    $scope.getdata = function(_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date||{};
        var startDate = date.startDate || "";
        var endDate = date.endDate|| "";
        var agent =search.agent || "";
        console.log(agent);
        $http.get(statUri+'/statapps', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize||20,
                isStat:true,
                type:1,
                startDate:startDate.toString(),
                endDate:endDate.toString(),
                agent:agent
            }
        }).success(function(result){
            console.log(result);
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 0);
                $scope.gameProfit = result;
                $scope.gameProfit.stat.total = global.reg($scope.gameProfit.stat.total||0);

                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.getdata();

    $scope.$watch('search.date', function () {
        $scope.getdata(1);
    });
}]);
