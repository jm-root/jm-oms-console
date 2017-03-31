
'use strict';
app.controller('BackpointsCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('backpoints');
}])
app.controller('BacklistCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    $scope.search = {};
    $scope.page = 1
    var keyword = $scope.search.keyword;
    var url = statUri+'/players';
    $http.get(statUri+'/players', {
        params:{
            token: sso.getToken(),
            search: keyword,
            page:$scope.page
        }
    }).success(function(result){
        $scope.data = result;
        if($scope.data.err){
            $scope.error($scope.data.msg);
        }else{
            $scope.usersInfo = $scope.data;
            $scope.pages = $scope.data.pages;
            $scope.total = $scope.data.total;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

}]);
app.controller('BacklogCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    $scope.search = {};
    var url = statUri+'/players';
    function uid_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="goto(data)">{{data.uid}}</a>';
    }
    function account_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="goto(data)">{{data.account}}</a>';
    }
    function nick_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="onPageSizeChanged(data.nick)">{{data.nick}}</a>';
    }
    function confirm_render(params){
        return '<button class="btn btn-sm btn-info"  ng-click="goto(data)">下分确认</button>';
    }
    var columnDefs = [
        {headerName: "玩家ID", field: "uid", width: 180, cellRenderer: uid_render},
        {headerName: "账号", field: "account", width: 120, cellRenderer: account_render},
        {headerName: "昵称", field: "nick", width: 120, cellRenderer: nick_render},
        {headerName: "当前金币数", field: "jb", width: 150},
        {headerName: "下分金币数", field: "jb", width: 150},
        {headerName: "执行状态", field: "account", width: 140},
        {headerName: "玩家下分时间", field: "crtime", width: 180, valueGetter: $scope.angGridFormatDateS},
        {headerName: "下分操作人", field: "jb", width: 120},
        {headerName: "下分操作时间", field: "crtime", width: 180, valueGetter: $scope.angGridFormatDateS},
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
                    rows: $scope.pageSize,
                    search: keyword,
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

}]);
