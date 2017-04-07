app.controller('AccountPayListCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var history = global.accountPayListHistory||(global.accountPayListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    var url = payUri+'/payss';

    $scope.dateOptions = global.dateRangeOptions;

    var format_channel = function(params) {
        var obj = params.data || {};
        var info = obj.channel;
        if(obj.channel=='platform'||obj.channel=='') info='平台';
        if(obj.currency=='swiftpass') info='威富通';
        if(obj.currency=='pingxx') info='pingxx';
        if(obj.currency=='wechat') info='微信';
        if(obj.currency=='alipay') info='支付宝';
        return info;
    };

    var format_currency = function(params) {
        var obj = params.data || {};
        var info = '未知';
        if(obj.currency=='cny') info='人民币';
        if(obj.currency=='tb') info='元宝';
        if(obj.currency=='jb') info='金币';
        if(obj.currency=='dbj') info='夺宝卷';
        return info;
    };

    var format_status = function(params) {
        var obj = params.data || {};
        var info = '未知';
        if(obj.status==0) info='未付';
        if(obj.status==1) info='已付';
        return info;
    };

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 200},
        {headerName: "单号", field: "code", width: 150},
        {headerName: "支付用户", field: "user", width: 200},
        {headerName: "渠道", field: "channel", width: 120, valueGetter: format_channel},
        {headerName: "标题", field: "title", width: 150},
        {headerName: "详情", field: "content", width: 150},
        {headerName: "币种", field: "currency", width: 120, valueGetter: format_currency},
        {headerName: "数量", field: "amount", width: 120},
        {headerName: "状态", field: "status", width: 100, valueGetter: format_status},
        {headerName: "备注", field: "note", width: 150},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'bank.account.paylist.header._id',
        'bank.account.paylist.header.code',
        'bank.account.paylist.header.user',
        'bank.account.paylist.header.channel',
        'bank.account.paylist.header.title',
        'bank.account.paylist.header.content',
        'bank.account.paylist.header.currency',
        'bank.account.paylist.header.amount',
        'bank.account.paylist.header.status',
        'bank.account.paylist.header.note',
        'bank.account.paylist.header.crtime'
    ]);
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = search.keyword;
            var currency = search.currency;
            var status = search.status;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    status: status,
                    currency: currency,
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
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
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
