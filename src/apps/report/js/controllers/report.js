'use strict';
var sso = jm.sdk.sso;
app.controller('ReportAccountCtrl', ['$scope', '$state', '$http', 'AGGRID', 'global', function ($scope, $state, $http,AGGRID, global) {
    global.reportAccountHistory || (global.reportAccountHistory = {});
    var history = global.reportAccountHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    $scope.search.type || ($scope.search.type='0');
    var url = statUri+'/report/account';

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    var format_date = function(params) {
        var date = params.data.date;
        if(date=='合计:') return date;
        var format = 'YYYY-MM-DD';
        if($scope.search.type=='1') format = 'YYYY-MM';
        if($scope.search.type=='2') format = 'YYYY';
        var info = moment(date).format(format);
        return info||'';
    };

    var columnDefs = [
        {headerName: "日期", field: "date", width: 150, valueGetter: format_date},
        // {headerName: "元宝", field: "tb", width: 150},
        // {headerName: "金币", field: "jb", width: 100},
        // {headerName: "夺宝卷", field: "dbj", width: 150},
        // {headerName: "登录人数", field: "login", width: 100},
        // {headerName: "签到人数", field: "checkin", width: 100},
        {headerName: "充值人数", field: "recharge_p", width: 100},
        {headerName: "充值数(分)", field: "recharge", width: 100},
        {headerName: "赠送金币", field: "give_jb", width: 150},
        {headerName: "赠送夺宝卷", field: "give_dbj", width: 100},
        {headerName: "游戏金币总输赢", field: "gain_jb", width: 100},
        {headerName: "游戏夺宝卷总输赢", field: "gain_dbj", width: 100}
    ];

    var dataSource = {
        getRows: function (params) {
            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var type = Number($scope.search.type);
            var agent = search.agent;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    type: type,
                    agent: agent,
                    isStat: true,
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
                    var stat = data.stat;
                    stat.date = '合计:';
                    $scope.gridOptions.api.setFloatingBottomRowData([stat]);
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
        datasource: dataSource,
        floatingBottomRowData: []
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

    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });

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
}]);

