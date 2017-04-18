app.controller('BankDealCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var history = global.bankDealHistory||(global.bankDealHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {
            startDate:  moment().subtract(15, 'days'),
            endDate: moment()
        };

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
        var info = global.translateByKey('bank.bank.deal.income');
        if(flag!=0){
            info=global.translateByKey('bank.bank.deal.expenditure');
        }
        return info;
    };

    var format_fromUserId = function(params) {
        return params.data.fromUserId||'';
    };

    var format_fromUser = function(params) {
        return params.data.fromUserName||'';
    };

    var format_toUserId = function(params) {
        return params.data.toUserId||'';
    };

    var format_toUser = function(params) {
        return params.data.toUserName||'';
    };

    var format_type = function(params) {
        var type = params.data.type;
        var info = '未知';
        if(type==0) info = '普通交易';
        if(type==1) info = '转帐交易';
        if(type==2) info = '货币发行';
        if(type==3) info = '货币回收';
        if(type==4) info = '预授权';

        return info;
    };

    // var columnDefs = [
    //     {headerName: "转出ID", field: "fromUserId", width: 210, valueGetter: format_fromUserId},
    //     {headerName: "转出用户", field: "fromUser", width: 100, valueGetter: format_fromUser},
    //     {headerName: "转入ID", field: "toUserId", width: 210, valueGetter: format_toUserId},
    //     {headerName: "转入用户", field: "toUser", width: 100, valueGetter: format_toUser},
    //     {headerName: "交易类型", field: "type", width: 100, valueGetter: format_type},
    //     {headerName: "交易标记", field: "flag", width: 100, valueGetter: format_flag},
    //     {headerName: "币种", field: "ctName", width: 70, valueGetter: format_ctName},
    //     {headerName: "操作数量", field: "amount", width: 90},
    //     {headerName: "操作前余额", field: "balance", width: 110},
    //     {headerName: "时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
    // ];

    var columnDefs = [
        {headerName: "发起方ID", field: "fromUserId", width: 210, valueGetter: format_fromUserId},
        {headerName: "发起方名称", field: "fromUser", width: 100, valueGetter: format_fromUser},
        {headerName: "发起方等级", field: "type",width: 100},        //field: "fromUserGrade"
        {headerName: "发起方操作前金币", field: "type", width: 100},    //fromUserBalance
        {headerName: "操作类型", field: "type", width: 100, valueGetter: format_flag},
        {headerName: "操作金额", field: "amount", width: 100},
        {headerName: "交易对象ID", field: "toUserId", width: 70, valueGetter: format_toUserId},
        {headerName: "交易对象名称", field: "toUser", width: 90,valueGetter: format_toUser},
        {headerName: "交易对象等级", field: "type", width: 110},        //toUserGrade
        {headerName: "交易对象交易前金币", field: "type", width: 145},         //toUserBalance
        {headerName: "操作时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'bank.bank.deal.header.fromUserId',
        'bank.bank.deal.header.fromUser',
        'bank.bank.deal.header.type',
        'bank.bank.deal.header.type',
        'bank.bank.deal.header.type',
        // 'bank.bank.deal.header.flag',
        'bank.bank.deal.header.amount',
        'bank.bank.deal.header.toUserId',
        'bank.bank.deal.header.toUser',
        'bank.bank.deal.header.type',
        'bank.bank.deal.header.type',
        'bank.bank.deal.header.createdAt'
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
                type: search.type,
                search: search.keyword,
                startDate: startDate.toString(),
                endDate: endDate.toString()
            },function(err,result){
                var data = result;
                console.log(data);
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
