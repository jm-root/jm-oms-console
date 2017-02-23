/**
 * Created by ZL on 2016/12/16.
 */
"use strict";
var sso = jm.sdk.sso;
app.controller('RoomsListCtrl', ['$scope', '$state', '$http', 'global', "$stateParams", function ($scope, $state, $http, global, $stateParams) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    // var id = $stateParams.id;

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "userId", field: "userId", width: 200, hide: true},
        {headerName: "应用名称", field: "name", width: 100},
        {headerName: "密码", field: "password", width: 70, hide: true},
        {headerName: "排序", field: "sort", width: 70},
        {headerName: "分类", field: "category", width: 100},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "创建人", field: "userNick", width: 70},
        {headerName: "状态", field: "status", width: 80, valueGetter: statusFormat},
        {headerName: "显示", field: "visible", width: 80, valueGetter: visibleFormat},
    ];

    function goRoomConfig(params){
        if(params.data.tmpl == "baoxiang"){
            goBaoxiangConfig(params.data._id, params.data.tmpl);
        }else{
            goConfig(params.data._id, params.data.tmpl);
        }
    }

    function statusFormat(params) {
        var value = "禁用";
        switch(params.data.status){
            case 0:{
                value = "禁用";
                break;
            }
            case 1:{
                value = "启用";
                break;
            }
            case 2:{
                value = "接入中";
                break;
            }
            case 3:{
                value = "审核中";
                break;
            }
        }
        return value;
    };

    function visibleFormat(params) {
        return params.data.visible ? "是" : "否";
    }

    function goConfig(id, type) {
        $state.go("app.rooms.manage.gameset.list", {appId: id, type: type});
    };

    function goBaoxiangConfig(id, type) {
        $state.go("app.rooms.manage.baoxiang.list", {appId: id, type: type});
    };

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(appMgrUri+'/apps', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search,
                    type: "all",
                    // userId: id
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows || [];
                    var lastRow = data.total||rowsThisPage.length||0;
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
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            goRoomConfig(cell);
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource,
        angularCompileRows: true
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

}]);
