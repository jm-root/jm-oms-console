app.controller('PlayerStatisticsCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};
    var page = 1;

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-235+'px',
            border:'1px solid #cccccc'
        }
    }

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.startDate = moment().subtract(1, 'months');
    $scope.dateOptions.endDate = moment();
    $scope.dateOptions.opens = 'left';

    $http.get(agentUri + '/subAgents', {
        params:{
            token: sso.getToken(),
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.channels =obj.rows||[];
            $scope.select = true;
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
        var agent = search.agent;
        $http.get(statUri+'/statlist', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize||20,
                startDate:startDate.toString(),
                endDate:endDate.toString(),
                agent:agent,
                hasAccount:true,
                rtype:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.usersInfo = result;
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

    $scope.details = function (key1,key2) {
        $state.go("app.datastatistics.playerdiary",{userid:key1,date:JSON.stringify(key2)});
    }

    $scope.$watch('search.date', function () {
        $scope.getdata(1);
    });


}]);

app.controller('PlayerDataCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global,Excel,$timeout) {

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
            height:$scope.app.navHeight-255+'px',
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
        var agent =search.agent;
        $http.get(statUri+'/statlist', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize||20,
                isStat:true,
                type:1,
                startDate:startDate.toString(),
                endDate:endDate.toString(),
                agent:agent,
                rtype:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 0);
                $scope.playerdata = result;
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

app.controller('PlayerDiaryCtrl', ['$scope', '$state', '$http', 'global','$stateParams', function ($scope, $state, $http, global,$stateParams) {

    var sso = jm.sdk.sso;
    var history = global.playerDiaryHistory || (global.playerDiaryHistory = {});
    $scope.pageSize = history.pageSize || $scope.defaultRows;
    $scope.search = history.search || {};
    var page = 1;

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

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
    if ($stateParams.userid) {            //给时间框赋值
        $scope.search.keyword = $stateParams.userid;
        var datestr = $stateParams.date || "";
        var dateobj = JSON.parse(datestr);
        $scope.search.date = dateobj;
    } else {
        $scope.search.keyword = "";
        $scope.search.date = {
            startDate: moment().subtract(15, 'days'),
            endDate: moment()
        };
    }

    $http.get(agentUri + '/subAgents', {
        params: {
            token: sso.getToken(),
            search: $scope.search.agent
        }
    }).success(function (result) {
        var obj = result;
        if (obj.err) {
            $scope.error(obj.msg);
        } else {
            $scope.channels = obj.rows || [];
            $scope.select = true;
        }
    }).error(function (msg, code) {
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

    $scope.type_render = function (obj){
        if(obj.type == 0){
            return global.translateByKey('datastatistics.playerdiary.type.income');
        }else if(obj.type == 1){
            return global.translateByKey('datastatistics.playerdiary.type.expenditure');
        }else if(obj.type == 2){
            return global.translateByKey('datastatistics.playerdiary.type.turnin');
        }else if(obj.type == 3){
            return global.translateByKey('datastatistics.playerdiary.type.turnout');
        }else if(obj.type == 4){
            return global.translateByKey('datastatistics.playerdiary.type.up');
        }else if(obj.type == 5) {
            return global.translateByKey('datastatistics.playerdiary.type.down');
        }else if(obj.type == 6) {
            return global.translateByKey('datastatistics.playerdiary.type.lose');
        }else if(obj.type == 7) {
            return global.translateByKey('datastatistics.playerdiary.type.win');
        }else if(obj.type == 8) {
            return global.translateByKey('datastatistics.playerdiary.type.currencyissue');
        }else if(obj.type == 9) {
            return global.translateByKey('datastatistics.playerdiary.type.currencyrecovery');
        }
    };

    $scope.getdata = function(_page) {

        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date||{};
        var startDate = date.startDate || "";
        var endDate = date.endDate|| "";
        var agent =search.agent;
        $http.get(statUri+'/deals', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize,
                agent:agent,
                search: $scope.search.keyword,
                startDate: startDate.toString(),
                endDate: endDate.toString(),
                onlyAgent:false
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 0);
                $scope.deals = result;
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

