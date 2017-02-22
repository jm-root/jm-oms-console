'use strict';
var sso = jm.sdk.sso;
app.controller('AgentDataRegisterCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'AGGRID', 'global', function($scope, $http, $state, $stateParams, $timeout, AGGRID, global) {
    var history = global.agentDataRegisterHistory||(global.agentDataRegisterHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.agent = $scope.search.agent || '';
    $scope.search.date = $scope.search.date || {};

    $scope.dateOptions = global.dateRangeOptions;

    var format_date = function(params) {
        var obj = params.data._id || {};
        return obj.date || '';
    };
    var format_code = function(params) {
        var agent = params.data.agent || {};
        return agent.code || '';
    };
    var format_name = function(params) {
        var agent = params.data.agent || {};
        return agent.name || '';
    };
    var format_pcode = function(params) {
        var agent = params.data.agent.pagent || {};
        return agent.code || '';
    };
    var format_pname = function(params) {
        var agent = params.data.agent.pagent || {};
        return agent.name || '';
    };
    var format_level = function(params) {
        var agent = params.data.agent || {};
        var level = agent.level;
        var info = '未知';
        if(level==1) info = '一级';
        if(level==2) info = '二级';
        return info;
    };

    var columnDefs = [
        {headerName: "日期", field: "date", width: 100, valueGetter: format_date},
        {headerName: "渠道ID", field: "code", width: 100, valueGetter: format_code},
        {headerName: "渠道名", field: "name", width: 100, valueGetter: format_name},
        {headerName: "渠道层级", field: "level", width: 100, valueGetter: format_level},
        {headerName: "上级渠道ID", field: "pcode", width: 100, valueGetter: format_pcode},
        {headerName: "上级渠道名", field: "pname", width: 100, valueGetter: format_pname},
        {headerName: "注册人数", field: "count", width: 100}
    ];

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate&&date.startDate.toString() || "";
            var endDate = date.endDate&&date.endDate.toString() || "";
            $http.get(agentUri + '/stat/registers', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    agent: search.agent,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function (msg, code) {
                $scope.errorTips(code);
                console.log(code);
            });
        }
    };

    $scope.gridOptions = {
        paginationPageSize: Number($scope.pageSize),
        rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

}]);

app.controller('AgentDataRechargeCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'AGGRID', 'global', function($scope, $http, $state, $stateParams, $timeout, AGGRID, global) {
    var history = global.agentDataRechargeHistory||(global.agentDataRechargeHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.agent = $scope.search.agent || '';
    $scope.search.date = $scope.search.date || {};

    $scope.dateOptions = global.dateRangeOptions;

    var format_date = function(params) {
        var obj = params.data._id || {};
        return obj.date || '';
    };
    var format_code = function(params) {
        var agent = params.data.agent || {};
        return agent.code || '';
    };
    var format_name = function(params) {
        var agent = params.data.agent || {};
        return agent.name || '';
    };
    var format_pcode = function(params) {
        var agent = params.data.agent.pagent || {};
        return agent.code || '';
    };
    var format_pname = function(params) {
        var agent = params.data.agent.pagent || {};
        return agent.name || '';
    };
    var format_level = function(params) {
        var agent = params.data.agent || {};
        var level = agent.level;
        var info = '未知';
        if(level==1) info = '一级';
        if(level==2) info = '二级';
        return info;
    };

    var columnDefs = [
        {headerName: "日期", field: "date", width: 100, valueGetter: format_date},
        {headerName: "渠道ID", field: "code", width: 100, valueGetter: format_code},
        {headerName: "渠道名", field: "name", width: 100, valueGetter: format_name},
        {headerName: "渠道层级", field: "level", width: 100, valueGetter: format_level},
        {headerName: "上级渠道ID", field: "pcode", width: 100, valueGetter: format_pcode},
        {headerName: "上级渠道名", field: "pname", width: 100, valueGetter: format_pname},
        {headerName: "充值数", field: "amount", width: 100}
    ];

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate&&date.startDate.toString() || "";
            var endDate = date.endDate&&date.endDate.toString() || "";
            $http.get(agentUri + '/stat/charges', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    agent: search.agent,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function (msg, code) {
                $scope.errorTips(code);
            });
        }
    };

    $scope.gridOptions = {
        paginationPageSize: Number($scope.pageSize),
        rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

}]);

app.controller('AgentDataAnalysisCtrl', ['$scope', '$state', '$http','AGGRID', 'global', function ($scope, $state, $http, AGGRID, global) {
    global.agentDataAnalysisHistory || (global.agentDataAnalysisHistory = {});
    var history = global.agentDataAnalysisHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};

    $scope.dateOptions = global.dateRangeOptions;

    var format_totalAmount = function(params) {
        var obj = params.data || {};
        var chargeAmount = obj.chargeAmount || 0;
        var cardAmount = obj.cardAmount || 0;
        var sysAmount = obj.sysAmount || 0;
        var amount = chargeAmount+cardAmount+sysAmount;
        return amount||0;
    };

    var columnDefs = [
        {headerName: "渠道ID", field: "code",width: 100 },
        {headerName: "渠道名称", field: "name", width: 100},
        {headerName: "注册人数", field: "regCount",width: 100 },
        {headerName: "在线人数", field: "online",width: 100 },
        {headerName: "充值人数", field: "chargeSum",width: 100 },
        {headerName: "充值金额", field: "chargeAmount",width: 100},
        {headerName: "点卡充值", field: "cardAmount" ,width: 100},
        {headerName: "系统奖励", field: "sysAmount" ,width: 100},
        {headerName: "总营收", field: "totalAmount" ,width: 100, valueGetter: format_totalAmount},
        {headerName: "注册时间", field: "crtime", width:145,valueGetter: $scope.angGridFormatDateS}
    ];

    var dataSource = {
        getRows: function (params) {
            var search = $scope.search;
            var date = search.date || {};
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = search.keyword;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(agentUri+'/stat', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    data.rows = data.rows || [];
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
        rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        angularCompileRows: true,
        rowSelection: 'multiple',
        rowHeight: 30,
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource
    };

    //改变表格行数
    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };
    //监听函数变化
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