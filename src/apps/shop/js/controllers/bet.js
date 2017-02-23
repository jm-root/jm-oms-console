/**
 * Created by Admin on 2016/5/20.
 */
"use strict";
var sso = jm.sdk.sso;
app.controller('BetListCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', function ($scope, $state, $stateParams, $http, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    $scope.lotteryId = $stateParams.lotteryId;
    
    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "用户名", field: "user.nick", width: 100},
        {headerName: "用户id", field: "user._id", width: 100},
        {headerName: "产品名称", field: "lottery.title", width: 100},
        {headerName: "期数", field: "lottery.period", width: 100},
        {headerName: "抽奖编码开始", field: "codeBegin", width: 100},
        {headerName: "抽奖编码数量", field: "codeNum", width: 100},
        {headerName: "支付单号", field: "payId", width: 100},
        {headerName: "状态", field: "status", width: 100, valueGetter: angGridFormtStatus},
        {headerName: "购买时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'shop.bet.header._id',
        'shop.bet.header.user.nick',
        'shop.bet.header.user._id',
        'shop.bet.header.lottery.title',
        'shop.bet.header.lottery.period',
        'shop.bet.header.codes',
        'shop.bet.header.codeNum',
        'shop.bet.header.payId',
        'shop.bet.header.status',
        'shop.bet.header.crTime',
        'shop.bet.header.modiTime',
    ]);

        function angGridFormtStatus(params) {
        var formatStr = params.data.status + "";
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
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/bets', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search,
                    lottery: $scope.lotteryId
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
            // $state.go('app.shop.bet_edit' , {id: cell.data._id});
            $scope.openTips({
                title:'幸运码',
                content: "<div style='word-break:break-all;'>" + cell.data.codes + "</div>",
                okTitle:'是',
                // cancelTitle:'否',
                // cancelTitle:'否',
                // okCallback: function(){
                // }
            });
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
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
                    $http.delete(shopUri+'/bets', {
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

app.controller('BetEditCtrl', ['$scope', '$http', '$state', '$stateParams',function($scope, $http, $state, $stateParams) {
    // $scope.$state = $state;
    //
    // var id = $stateParams.id;
    // $scope.id = id;
    // $scope.bet = {};
    //
    //
    // if(id){
    //     $http.get(shopUri+'/bets/'+id, {
    //         params:{
    //             token: sso.getToken(),
    //         }
    //     }).success(function(result){
    //         var obj = result;
    //         if(obj.err){
    //             $scope.error(obj.msg);
    //         }else{
    //             $scope.lottery.name = obj.product.name;
    //             $scope.lottery.status = obj.status;
    //             if(obj.status == 0){
    //                 $scope.lotteryDisabled = true;
    //             }
    //         }
    //     }).error(function(msg, code){
    //         $scope.errorTips(code);
    //     });
    // }else{
    //     // $scope.category.name = obj.name;
    //     // $scope.category.pid = obj.pid;
    // }
    //
    // $scope.save = function(){
    //
    //     var url = shopUri  + '/bets';
    //     if(id){
    //         url += "/" + id;
    //     }
    //
    //     $http.post(url, $scope.bet, {
    //         params:{
    //             token: sso.getToken()
    //         }
    //     }).success(function(result){
    //         var obj = result;
    //         if(obj.err){
    //             $scope.error(obj.msg);
    //         }else{
    //             $scope.success('操作成功');
    //             $state.go('app.shop.lottery');
    //         }
    //     }).error(function(msg, code){
    //         $scope.errorTips(code);
    //     });
    // };


}]);
