
'use strict';
app.controller('BackpointsCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('backpoints');
}])
app.controller('BacklistCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var page = 1;
    var urlget = agentUri+'/backCoinLogs';
    var urlpost = agentUri+'/backcoin/confirm';

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.search();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.search();
        }
    };
    $scope.search = function(keyword,_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                search: $scope.search.keyword,
                page:page,
                rows:16,
                status:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                if(result.total){
                    $scope.nodata = false;
                    $scope.usersInfo = result;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.crtime = moment($scope.usersInfo.crtime).format('YYYY-MM-DD HH:mm:ss');
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.search();

    $scope.confirm = function (id) {
        $http.post(urlpost, {oid:id},{
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            $scope.data = result;
            if($scope.data.err){
                $scope.error($scope.data.msg);
            }else{
                $scope.success($scope.data.msg);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

}]);



app.controller('BacklogCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    $scope.search = {};
    var url = agentUri+'/backCoinLogs';

    function status_render(params){
        var obj = params.data|| {};
        if(obj.status == 1){
            return '<span style="color: #ff0000">下分请求中</span>';
        }else if(obj.status == 4){
            return '<span style="color: #0000FF">已撤销并未下分</span>';
        }else if(obj.status == 5){
            return '<span style="color: #00FF00">已退款并下分</span>';
        }else{
            return '<span>未下分</span>';
        }
    };

    var columnDefs = [
        {headerName: "玩家ID", field: "user.uid", width: 180},
        {headerName: "账号", field: "user.account", width: 120},
        {headerName: "昵称", field: "user.nick", width: 120},
        {headerName: "当前金币数", field: "balance", width: 150},
        {headerName: "下分金币数", field: "amount", width: 150},
        {headerName: "执行状态", field: "", width: 140,cellRenderer: status_render},
        {headerName: "玩家下分时间", field: "crtime", width: 180, valueGetter: $scope.angGridFormatDateS},
        {headerName: "下分操作人", field: "executor.account", width: 120},
        {headerName: "下分操作时间", field: "entime", width: 180, valueGetter: $scope.angGridFormatDateS},
    ];
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();   //翻译
            var search = $scope.search;
            var keyword = search.keyword;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page:1,
                    rows:10,
                    search:keyword
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

}]);
