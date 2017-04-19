app.controller('AgentDataCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var page = 1;
    var history = global.AgentDataHistory||(global.AgentDataHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search|| {};
    console.log($scope.search.date);
    $scope.search.date = $scope.search.date || {
            startDate:moment().subtract(15,"days"),
            endDate:moment()
        };

    $scope.dateOptions=global.dateRangeOptions;
    $scope.dateOptions.opens = 'left';

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

    $scope.getdata = function(keyword,_page) {
        console.log($scope.pageSize);
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date;
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";
        var agent = search.agent;
        $http.get(statUri+'/players', {
            params:{
                token: sso.getToken(),
                agent:agent,
                startDate: startDate.toString(),
                endDate: endDate.toString(),
                page:page,
                rows:$scope.pageSize,
                status:1
            }
        }).success(function(result){
            console.log(result);
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                // $('html,body').animate({ scrollTop: 0 }, 100);
                if(result.total){
                    $scope.nodata = false;
                    $scope.usersInfo = result;
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

    $http.get(agentUri + '/subAgents', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.agents = result.rows;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });


    $scope.onPageSizeChanged = function() {
        page = 1;
        $scope.getdata();
    };
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
        $scope.onPageSizeChanged();
    });

    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('search.date', function () {
        history.search.date = $scope.search.date;
        $scope.onPageSizeChanged();
    });

}]);

app.controller('AgentStatisticsCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var page = 1;
    var history = global.AgentStatisticsHistory||(global.AgentStatisticsHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search|| {};
    console.log($scope.search.date);
    $scope.search.date = $scope.search.date || {
            startDate:  moment().subtract(15, 'days'),
            endDate: moment()
        };
    $scope.dateOptions=global.dateRangeOptions;
    $scope.dateOptions.opens = 'left';

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

    $scope.getdata = function(keyword,_page) {
        console.log($scope.pageSize);
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date;
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";
        var agent = search.agent;
        $http.get(statUri+'/players', {
            params:{
                token: sso.getToken(),
                agent:agent,
                startDate: startDate.toString(),
                endDate: endDate.toString(),
                page:page,
                rows:$scope.pageSize,
                status:1
            }
        }).success(function(result){
            console.log(result);
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                // $('html,body').animate({ scrollTop: 0 }, 100);
                if(result.total){
                    $scope.nodata = false;
                    $scope.usersInfo = result;
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

    $http.get(agentUri + '/subAgents', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.agents = result.rows;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });


    $scope.onPageSizeChanged = function() {
        page = 1;
        $scope.getdata();
    };
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
        $scope.onPageSizeChanged();
    });

    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('search.date', function () {
        history.search.date = $scope.search.date;
        $scope.onPageSizeChanged();
    });

}]);

app.controller('AgentDiaryCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var page = 1;
    var history = global.AgentDiaryHistory||(global.AgentDiaryHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search|| {};
    console.log($scope.search.date);
    $scope.search.date = $scope.search.date || {
            startDate:  moment().subtract(15, 'days'),
            endDate: moment()
        };
    $scope.dateOptions=global.dateRangeOptions;
    $scope.dateOptions.opens = 'left';

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

    $scope.getdata = function(keyword,_page) {
        console.log($scope.pageSize);
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date;
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";
        var agent = search.agent;
        var keyword = search.keyword;
        $http.get(statUri+'/players', {
            params:{
                token: sso.getToken(),
                agent:agent,
                search: keyword,
                startDate: startDate.toString(),
                endDate: endDate.toString(),
                page:page,
                rows:$scope.pageSize,
                status:1
            }
        }).success(function(result){
            console.log(result);
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                // $('html,body').animate({ scrollTop: 0 }, 100);
                if(result.total){
                    $scope.nodata = false;
                    $scope.usersInfo = result;
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

    $http.get(agentUri + '/subAgents', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.agents = result.rows;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });


    $scope.onPageSizeChanged = function() {
        page = 1;
        $scope.getdata();
    };
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
        $scope.onPageSizeChanged();
    });

    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('search.date', function () {
        history.search.date = $scope.search.date;
        $scope.onPageSizeChanged();
    });
}]);