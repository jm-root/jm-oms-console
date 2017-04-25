app.controller('AgentDataCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var page = 1;
    var history = global.AgentDataHistory||(global.AgentDataHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search|| {};
    $scope.search.date = $scope.search.date || {};

    $scope.channels = [];
    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.startDate = moment().subtract(1, 'months');
    $scope.dateOptions.endDate = moment();
    $scope.dateOptions.opens = 'left';

    //判断是否移动端设置表格样式
    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-255+'px'
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


    $scope.getOption = function () {
        $http.get(agentUri + '/subAgents', {
            params: {
                token: sso.getToken(),
                search:$scope.search.agent
            }
        }).success(function (result) {
            if (result.err) {
                $scope.channe = [];
                $scope.error(result.msg);
            } else {
                $scope.channels = result.rows;
                $scope.isok = true;
            }


        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    }


    $scope.getOption();

    $scope.getdata = function(keyword,_page) {
        if(_page) page = _page;
        $scope.nodata = false;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date;
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";
        var agent = search.agent;
        $http.get(statUri+'/statlist', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize,
                isStat:true,
                type:1,
                startDate: startDate.toString(),
                endDate: endDate.toString(),
                agent:agent,
                rtype:2
            }
        }).success(function(result){
            $scope.moreLoading = false;
            if(result.err){
                $scope.error(result.msg);
            }else{
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.agentdata = result;

                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;$scope.pages = 0;
                    $scope.total = 0;
                    $scope.totalnumber = 0;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.getdata();

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
    $scope.$watch('channels', function () {
        // $scope.channels = $scope.channels || [];
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
    $scope.search.date = $scope.search.date || {};
    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.startDate = moment().subtract(1, 'months');
    $scope.dateOptions.endDate = moment();
    $scope.dateOptions.opens = 'left';

    //判断是否移动端设置表格样式
    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-235+'px'
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
        if(_page) page = _page;
        $scope.nodata = false;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date;
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";
        var agent = search.agent || "";
        $http.get(statUri+'/statlist', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize,
                startDate: startDate.toString(),
                endDate: endDate.toString(),
                agent:agent,
                hasAccount:true,
                rtype:2
            }
        }).success(function(result){
            $scope.moreLoading = false;
            if(result.err){
                $scope.error(result.msg);
            }else{
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.agentdata = result;
                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                    $scope.pages = 0;
                    $scope.total = 0;
                    $scope.totalnumber = 0;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.getdata();

    $scope.details = function (key1,key2) {
      $state.go("app.datastatistics.agentdiary",{agentid:key1,date:JSON.stringify(key2)});
    }

    $scope.getOption = function () {
        $http.get(agentUri + '/subAgents', {
            params: {
                token: sso.getToken(),
                search:$scope.search.agent
            }
        }).success(function (result) {
            if (result.err) {
                $scope.error(result.msg);
            } else {
                $scope.channels = result.rows;
                $scope.isok = true;
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    }

    $scope.getOption();


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

app.controller('AgentDiaryCtrl', ['$scope', '$state', '$http', 'global','$stateParams', function ($scope, $state, $http, global,$stateParams) {
    var sso = jm.sdk.sso;
    var page = 1;
    var history = global.AgentDiaryHistory||(global.AgentDiaryHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search|| {};

    if ($stateParams.agentid) {            //给时间框赋值
        $scope.search.agent = $stateParams.agentid;
        var datestr = $stateParams.date || "";
        var dateobj = JSON.parse(datestr);
        $scope.search.date = dateobj;
    } else {
        $scope.search.agent = "";
        $scope.search.date = {
            startDate: moment().subtract(15, 'days'),
            endDate: moment()
        };
    }
    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    //判断是否移动端设置表格样式
    $scope.tablestyle = {};
    $scope.tdstyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
        $scope.tdstyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-255+'px',
            border:'1px solid #cccccc'
        }
        $scope.tdstyle = {
            width:"200px"
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

        if(_page) page = _page;
        $scope.nodata = false;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date;
        var keyword = search.keyword;

        if ($stateParams.account) {                    //获取开始和结束时间
            var datestr = $stateParams.date || "";
            var dateobj = JSON.parse(datestr);
            var startDate = dateobj.startDate || "";
            var endDate = dateobj.endDate || "";
        } else {
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
        }
        $http.get(statUri+'/deals', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize,
                agent:$scope.search.agent,
                search: keyword,
                startDate: startDate.toString(),
                endDate: endDate.toString(),
                onlyAgent:true
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.agentdata = result;
                result.rows.forEach(function (item) {
                    var type = item.type;
                    if(item.type == 0){
                         item.type = "收入"
                    }else if(item.type == 1){
                         item.type = "支出";
                    }else if(item.type == 2){
                        item.type =  "转入";
                    }else if(item.type == 3){
                        item.type =  "转出";
                    }else if(item.type == 4){
                        item.type =  "上分";
                    }else if(item.type == 5) {
                        item.type =  "下分";
                    }else if(item.type == 6) {
                        item.type =  "输";
                    }else if(item.type == 7) {
                        item.type =  "赢";
                    }else if(item.type == 8) {
                        item.type =  "货币发行";
                    }else if(item.type == 9) {
                        item.type =  "货币回收";
                    }
                });
                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                    $scope.pages = 0;
                    $scope.total = 0;
                    $scope.totalnumber = 0;
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
            $scope.channels = result.rows;
            $scope.select = true;
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