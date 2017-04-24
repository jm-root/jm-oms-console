
'use strict';
app.controller('BackpointsCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('backpoints');
}])
app.controller('BacklistCtrl', ['$scope', '$state', '$http','$interval', 'global', function ($scope, $state, $http,$interval, global) {
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    var sso = jm.sdk.sso;
    var page = 1;
    var urlget = agentUri+'/backCoinLogs';
    var urlpost = agentUri+'/backcoin/confirm';

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-230+'px',
            border:'1px solid #cccccc'
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
        $scope.moreLoading = true;
        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                search: $scope.search.keyword,
                page:page,
                rows:$scope.pageSize||20,
                status:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.usersInfo = result;
                $scope.page = result.page;
                $scope.pages = result.pages;
                $scope.total = result.total;
                $scope.totalnumber = global.reg(result.total||0);
                if(result.total){
                    $scope.nodata = false;
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.getdata();

    var t = $interval(function(){
        $scope.getdata();
    }, 5000);
    $scope.$on("$destroy", function(){
        $interval.cancel(t);
    });

    var htmlFun = function(row){
        var account = row.user.account||row.user.nick;
       var info = global.translateByKey('search.player')+ account + '<br/> '+'<br/> '+global.translateByKey('search.uncharge') + row.amount + '<br> ';
       return info;
    };

    $scope.confirm = function (row) {
        var id = row._id;
        var account = row.account||row.uid||row.nick;
        $scope.openTips({
            title: global.translateByKey('backpoints.list.label5'),
            content: htmlFun(row),
            okTitle: global.translateByKey('common.confirm'),
            cancelTitle: global.translateByKey('common.cancel'),
            okCallback: function ($s) {
                $http.post(urlpost, {oid: id}, {
                    params: {
                        token: sso.getToken()
                    }
                }).success(function (result) {
                    if (result.err) {
                        $scope.error(result.msg);
                    } else {
                        $scope.success(global.translateByKey('common.succeed'));
                    };
                    $scope.getdata();
                }).error(function (msg, code) {
                    $scope.errorTips(code);
                });
            }
        });
    }

}]);



app.controller('BacklogCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};

    var url = agentUri+'/backCoinLogs';
    function status_render(params){
        var obj = params.data|| {};
        if(obj.status == 1){
            return "<span style='color: #ff0000'>{{'backpoints.log.label1'|translate}}</span>";
        }else if(obj.status == 4){
            return "<span style='color: #0000FF'>{{'backpoints.log.label2'|translate}}</span>";
        }else if(obj.status == 5){
            return "<span style='color: #00D900'>{{'backpoints.log.label3'|translate}}</span>";
        }else{
            return "<span>{{'backpoints.log.label4'|translate}}</span>";
        }
    };

    var format_account = function(params) {
        var account = params.data.user.account || params.data.user.mobile;
        return account;
    };

    var columnDefs = [
        {headerName: "玩家ID", field: "user.uid", width: 180},
        {headerName: "账号", field: "user.account", width: 120,valueGetter:format_account},
        {headerName: "昵称", field: "user.nick", width: 120},
        {headerName: "当前金币数", field: "balance", width: 150},
        {headerName: "下分金币数", field: "amount", width: 150},
        {headerName: "执行状态", field: "status", width: 140,cellRenderer: status_render},
        {headerName: "玩家下分时间", field: "crtime", width: 180, valueGetter: $scope.angGridFormatDateS},
        {headerName: "下分操作人", field: "executor.account", width: 120},
        {headerName: "下分操作时间", field: "entime", width: 180, valueGetter: $scope.angGridFormatDateS},
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'backpoints.log.header.uid',
        'backpoints.log.header.account',
        'backpoints.log.header.nick',
        'backpoints.log.header.balance',
        'backpoints.log.header.amount',
        'backpoints.log.header.status',
        'backpoints.log.header.crtime',
        'backpoints.log.header.exaccount',
        'backpoints.log.header.entime'
    ]);
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();   //翻译
            var search = $scope.search;
            var keyword = search.keyword;

            var date = search.date||{};
            var startDate = date.startDate || "";
            var endDate = date.endDate|| "";

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page:page,
                    rows:$scope.pageSize||20,
                    search:keyword,
                    startDate:startDate.toString(),
                    endDate:endDate.toString()
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rows = data.rows || [];
                    var rowsThisPage = rows;
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
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        datasource: dataSource,
        singleClickEdit: true,   //表格内可编辑元素变为单击编辑，适应移动端
    };

    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });
}]);
