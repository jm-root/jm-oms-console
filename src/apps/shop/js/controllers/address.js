/**
 * Created by Admin on 2016/5/19.
 */
'use strict';
var sso = jm.sdk.sso;
app.controller('AddrListCtrl', ['$scope', '$state', '$http','AGGRID', 'global', function ($scope, $state, $http,AGGRID, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';
    
    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "用户昵称", field: "user.nick", width: 200},
        {headerName: "名字", field: "name", width: 200},
        {headerName: "电话", field: "phone", width: 200},
        {headerName: "省", field: "province", width: 100},
        {headerName: "市", field: "city", width: 100},
        {headerName: "详细地址", field: "detail", width: 100},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "更改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];
    
    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/addresses', {
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
                // console.log("sss %j", result);
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
            $state.go('app.shop.address.edit' , {id: cell.data._id});
        },
        localeText: AGGRID.zh_CN,
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
                    $http.delete(shopUri+'/addresses', {
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

app.controller('AddrEditCtrl', ['$scope', '$http', '$state', '$stateParams',function($scope, $http, $state, $stateParams) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.address = {};

    if(id){
        $http.get(shopUri+'/addresses/'+id, {
            params:{
                token: sso.getToken(),
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.address.userId = obj.userId;
                $scope.address.name = obj.name;
                $scope.address.phone = obj.phone;
                $scope.address.province = obj.province;
                $scope.address.city = obj.city;
                $scope.address.detail = obj.detail;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        // $scope.category.name = obj.name;
        // $scope.category.pid = obj.pid;
    }

    $scope.save = function(){

        var url = shopUri  + '/addresses';
        if(id){
            url += "/" + id;
        }

        $http.post(url, $scope.address, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.shop.address.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

}]);
