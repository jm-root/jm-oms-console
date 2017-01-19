/**
 * Created by ZL on 2016/9/27.
 */
"use strict";

app.controller('OrderListCtrl', ['$scope', '$state', '$stateParams', '$http', 'sso', 'AGGRID', 'global', function ($scope, $state, $stateParams, $http, sso, AGGRID, global) {
    var history = global.appsListHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    $scope.productId = $stateParams.productId;

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "产品", field: "product.name", width: 100},
        {headerName: "数量", field: "buyNum", width: 70},
        {headerName: "购买用户", field: "userNick", width: 70},
        {headerName: "状态", field: "status", width: 100, valueGetter: angGridFormtStatus},
        // {headerName: "排序", field: "sort", width: 100},
        // {headerName: "是否启用", field: "enable", width: 100},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        // {headerName: "#", width: 70, cellRenderer: publish, cellStyle:{'text-align':'center'}},
        // {headerName: "#", width: 70, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];

    // function opr_render(params){
    //     return '<button class="btn btn-xs bg-primary" ng-click="goBet(\''+params.data._id+'\')">查看</button>';
    // }

    function publish(params) {
        var render;
        if(params.data.enable){
            render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">禁用</button>';
        }else{
            render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">发布</button>';
        }
        return render;
    }

    // function editWinUser(params) {
    //     var render;
    //     if(params.data.winUserId){
    //         render =  '<button class="btn btn-xs bg-primary" ng-click="editWinUser(data)">'+params.data.userNick+'</button>';
    //     }
    //     return render;
    // }
    //
    // $scope.editWinUser = function(data) {
    //     $state.go('app.shop.lottery.user' , {id: data.winUserId});
    // };
    //
    // $scope.goBet = function(id){
    //     $state.go('app.shop.bet.list' , {lotteryId: id});
    // };
    //
    // $scope.publish = function (data) {
    //     var content = "是否确认发布?";
    //     if(data.enable){
    //         content = "是否确认禁用?";
    //     }
    //     $scope.openTips({
    //         title:'提示',
    //         content: content,
    //         okTitle:'是',
    //         cancelTitle:'否',
    //         okCallback: function(){
    //             $http.post(shopUri + '/publish/' + data._id, {enable: !data.enable}, {
    //                 params:{
    //                     token: sso.getToken(),
    //                 }
    //             }).success(function(result){
    //                 var obj = result;
    //                 if(obj.err){
    //                     $scope.error(obj.msg);
    //                 }else{
    //                     $scope.success('操作成功');
    //                     $scope.gridOptions.api.setDatasource(dataSource);
    //                 }
    //             }).error(function(msg, code){
    //                 $scope.errorTips(code);
    //             });
    //         }
    //     });
    // };

    function angGridFormtStatus(params) {
        var formatStr = params.data.status + "";//1 进行中 2完成等待开奖 3开奖公布 4 未发货 5 已发货 6已完成
        switch (params.data.status){
            case 1:
                formatStr = "已下单";
                break;
            case 2:
                formatStr = "已支付";
                break;
            case 3:
                formatStr = "已完成";
                break;
        }
        return formatStr;
    }

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/orders', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search,
                    productId: $scope.productId,
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
            $state.go('app.shop.order.edit' , {id: cell.data._id});
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource,
        angularCompileRows: true
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
                    $http.delete(shopUri+'/orders', {
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

app.controller('OrderEditCtrl', ['$scope', '$http', '$state', '$stateParams', 'sso', function($scope, $http, $state, $stateParams, sso) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.order = {};

    if($stateParams.productId){
        $scope.order.product = $stateParams.productId;
    }


    if(id){
        $http.get(shopUri+'/orders/'+id, {
            params:{
                token: sso.getToken(),
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.order = obj;
                $scope.order.status = obj.status + "";
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{

    }

    $scope.save = function(){

        var url = shopUri  + '/orders';
        if(id){
            url += "/" + id;
        }

        $http.post(url, $scope.order, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.shop.order.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };


}]);

