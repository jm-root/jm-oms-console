app.controller('BankOwnDealCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    var history = global.bankOwnDealHistory||(global.bankOwnDealHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    var format_ctName = function(params) {
        var ctName = params.data.ctName;
        return ctName || '';
    };
    var format_flag = function(params) {
        var flag = params.data.flag || 0;
        var info = global.translateByKey('bank.bank.owndeal.income');
        if(flag!=0){
            info=global.translateByKey('bank.bank.owndeal.expenditure');
        }
        return info;
    };

    var format_userid = function(params) {
        var flag = params.data.flag || 0;
        var user;
        if(flag){
            user = params.data.toUserId;
        }else{
            user = params.data.fromUserId;
        }

        return user||'';
    };

    var format_user = function(params) {
        var flag = params.data.flag || 0;
        var user;
        if(flag){
            user = params.data.toUserName;
        }else{
            user = params.data.fromUserName;
        }

        return user||'货币商';
    };

    var columnDefs = [
        {headerName: "用户ID", field: "user", width: 210, valueGetter: format_userid},
        {headerName: "用户名", field: "user", width: 100, valueGetter: format_user},
        {headerName: "币种", field: "ctName", width: 100, valueGetter: format_ctName},
        {headerName: "交易标记", field: "flag", width: 100, valueGetter: format_flag},
        {headerName: "金额", field: "amount", width: 100},
        {headerName: "时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'bank.bank.owndeal.header.userId',
        'bank.bank.owndeal.header.user',
        'bank.bank.owndeal.header.ctName',
        'bank.bank.owndeal.header.flag',
        'bank.bank.owndeal.header.amount',
        'bank.bank.owndeal.header.createdAt'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";

            var page = params.startRow / $scope.pageSize + 1;
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
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
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
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
        onCellDoubleClicked: function(cell){
        },
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
    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });
}]);