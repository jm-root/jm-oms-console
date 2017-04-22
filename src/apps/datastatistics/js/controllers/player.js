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
            height:$scope.app.navHeight-210+'px',
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
        $state.go("app.datastatistics.playerdiary",{account:key1,date:JSON.stringify(key2)});
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

                $scope.playerdata.stat.allget = global.reg(($scope.playerdata.stat.pout_jb - $scope.playerdata.stat.pin_jb)||0);
                $scope.playerdata.stat.up_jb = global.reg($scope.playerdata.stat.up_jb||0);
                $scope.playerdata.stat.down_jb = global.reg($scope.playerdata.stat.down_jb||0);
                $scope.playerdata.stat.pout_jb = global.reg($scope.playerdata.stat.pout_jb||0);
                $scope.playerdata.stat.pin_jb = global.reg($scope.playerdata.stat.pin_jb||0);

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

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    if ($stateParams.account) {            //给时间框赋值
        $scope.search.keyword = $stateParams.account;
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

    var format_ctName = function (params) {
        var ctName = params.data.ctName;
        return ctName || '';
    };

    var format_fromUserId = function (params) {
        return params.data.fromUid || params.data.fromUserId;
    };

    var format_fromUser = function (params) {
        return params.data.fromUserName || '';
    };

    var format_toUid = function (params) {
        return params.data.toUid || '';
    };

    var format_toUser = function (params) {
        return params.data.toUserName || '';
    };

    var format_type = function (params) {
        var type = params.data.type;
        var info = '未知';
        if (type == 0) info = '普通交易';
        if (type == 1) info = '转帐交易';
        if (type == 2) info = '货币发行';
        if (type == 3) info = '货币回收';
        if (type == 4) info = '预授权';

        return info;
    };

    function type_render(params){
        var obj = params.data|| {};
        if(obj.type == 0){
            return "收入"
        }else if(obj.type == 1){
            return "支出";
        }else if(obj.type == 2){
            return "转入";
        }else if(obj.type == 3){
            return "转出";
        }else if(obj.type == 4){
            return "上分";
        }else if(obj.type == 5) {
            return "下分";
        }else if(obj.type == 6) {
            return "输";
        }else if(obj.type == 7) {
            return "赢";
        }else if(obj.type == 8) {
            return "货币发行";
        }else if(obj.type == 9) {
            return "货币回收";
        }
    };

    var columnDefs = [
        {headerName: "发起方ID", field: "fromUserId", width: 210, valueGetter: format_fromUserId},
        {headerName: "发起方名称", field: "fromUser", width: 120, valueGetter: format_fromUser},
        {headerName: "操作类型", field: "flag", width: 120,cellRenderer: type_render},
        {headerName: "操作金额", field: "amount", width: 120},
        {headerName: "交易对象ID", field: "toUid", width: 200,valueGetter:format_toUid},
        {headerName: "交易对象名称", field: "toUserName", width: 150},
        {headerName: "操作时间", field: "createdAt", width: 250, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'datastatistics.playerdiary.header.fromUserId',
        'datastatistics.playerdiary.header.fromUser',
        'datastatistics.playerdiary.header.type',
        'datastatistics.playerdiary.header.amount',
        'datastatistics.playerdiary.header.toUserId',
        'datastatistics.playerdiary.header.toUser',
        'datastatistics.playerdiary.header.createdAt'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();
            var search = $scope.search;
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
            var agent = search.agent;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(statUri+'/deals',{
                params:{
                    token: sso.getToken(),
                    page:page,
                    rows:$scope.pageSize,
                    agent:agent,
                    search: $scope.search.keyword,
                    startDate: startDate.toString(),
                    endDate: endDate.toString(),
                    onlyAgent:true
                }
            }).success(function(result){
                if(result.err){
                    $scope.error(result.msg);
                }else{
                    var data = result;
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function(msg, code){
                $scope.errorTips(code);
            });
        }
    };

    $scope.gridOptions = {
        paginationPageSize: Number($scope.pageSize),
        rowModelType: 'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        rowStyle: {
            '-webkit-user-select': 'text',
            '-moz-user-select': 'text',
            '-o-user-select': 'text',
            'user-select': 'text'
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onGridReady: function (event) {
            // event.api.sizeColumnsToFit();
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
        onCellDoubleClicked: function (cell) {
        },
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function () {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });

}]);

