/**
 * Created by Admin on 2016/5/18.
 */
'use strict';
var sso = jm.sdk.sso;
app.controller('CateListCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 150, hide: true},
        {headerName: "编码", field: "code", width: 80},
        {headerName: "名称", field: "name", width: 80},
        {headerName: "父类", field: "pid.name", width: 80, hide: false},
        {headerName: "创建时间", field: "crTime", width: 100, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'shop.category.header._id',
        'shop.category.header.code',
        'shop.category.header.name',
        'shop.category.header.pid.name',
        'shop.category.header.crTime'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/categories', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search
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
            $state.go('app.shop.category.edit' , {id: cell.data._id});
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        datasource: dataSource
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title:'提示',
                content:'是否确认删除?',
                okTitle:'是',
                cancelTitle:'否',
                okCallback: function(){
                    var ids = '';
                    rows.forEach(function(e){
                        if(ids) ids += ',';
                        ids += e._id;
                    });
                    $http.delete(shopUri+'/categories', {
                        params:{
                            token: sso.getToken(),
                            id: ids
                        }
                    }).success(function(result){
                        var obj = result;
                        if(obj.err){
                            $scope.error(obj.msg);
                        }else{
                            $scope.success('操作成功');
                            $scope.gridOptions.api.setDatasource(dataSource);
                        }
                    }).error(function(msg, code){
                        $scope.errorTips(code);
                    });
                }
            });
        }else{
            $scope.openTips({
                title:'提示',
                content:'请选择要删除的数据!',
                cancelTitle:'确定',
                singleButton:true
            });
        }
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

app.controller('CateEditCtrl', ['$scope', '$http', '$state', '$stateParams',function($scope, $http, $state, $stateParams) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.category = {};

    $scope.parentCates = {};
    $http.get(shopUri+'/categories', {
        params:{
            token: sso.getToken(),
            cateLevel: 1
        }
    }).error(function (msg, code) {

        $scope.errorTips(code);

    }).success(function (result) {

        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.parentCates = result.rows;


            if(id){
                $http.get(shopUri+'/categories/'+id, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    var obj = result;
                    if(obj.err){
                        $scope.error(obj.msg);
                    }else{
                        $scope.category.name = obj.name;
                        for(var i=0; i<$scope.parentCates.length; i++){
                            if($scope.parentCates[i]._id == obj.pid){
                                $scope.category.parent = $scope.parentCates[i];
                            }
                        }
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }else{
                // $scope.category.name = obj.name;
                // $scope.category.pid = obj.pid;
            }

            $scope.save = function(){

                var url = shopUri  + '/categories';
                if(id){
                    url += "/" + id;
                }

                if($scope.category.parent){
                    $scope.category.pid = $scope.category.parent._id;
                    $scope.category.pCode = $scope.category.parent.code;
                }

                $http.post(url, $scope.category, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    var obj = result;
                    if(obj.err){
                        $scope.error(obj.msg);
                    }else{
                        $scope.success('操作成功');
                        $state.go('app.shop.category.list');
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            };


        }
    })



}]);