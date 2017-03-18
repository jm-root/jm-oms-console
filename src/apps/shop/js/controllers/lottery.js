/**
 * Created by Admin on 2016/5/19.
 */
'use strict';
var sso = jm.sdk.sso;
app.controller('LotteryListCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', function ($scope, $state, $stateParams, $http, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    $scope.productId = $stateParams.productId;

    $scope.isShowFormula = true;

    var columnDefs = [
        {headerName: "Id", field: "_id", width: 100},
        {headerName: "总期数", field: "maxPeriod", width: 120},
        {headerName: "当前期数", field: "period", width: 120},
        {headerName: "物品名称", field: "title", width: 120},
        {headerName: "物品描述", field: "summary", width: 120},
        {headerName: "消耗夺宝卷数", field: "totalPrice", width: 120},
        {headerName: "总参与人次", field: "joinNumber2", width: 100},
        {headerName: "总参与人数", field: "joinPepole", width: 120},
        {headerName: "商品进度", field: "joinNumber", width: 120},
        // {headerName: "中奖用户", width: 70, cellRenderer: editWinUser, cellStyle:{'text-align':'center'}},
        // {headerName: "中奖编码", field: "winCode", width: 100},
        // {headerName: "状态", field: "status", width: 100, valueGetter: angGridFormtStatus},
        // {headerName: "状态", field: "enable", width: 100},
        {headerName: "状态", width: 120, cellRenderer: enable_render , cellStyle:{'text-align':'center'}},
        // {headerName: "是否启用", field: "enable", width: 100},
        // {headerName: "开始时间", field: "beginTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        // {headerName: "结束时间", field: "endTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "#", width: 150, cellRenderer: edit_render , cellStyle:{'text-align':'center'}},
        // {headerName: "#", width: 70, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'shop.lottery.header._id',
        'shop.lottery.header.maxPeriod',
        'shop.lottery.header.period',
        'shop.lottery.header.title',
        'shop.lottery.header.summary',
        'shop.lottery.header.totalPrice',
        'shop.lottery.header.joinNumber2',
        'shop.lottery.header.joinPepole',
        'shop.lottery.header.joinNumber',
        'shop.lottery.header.status'
    ]);
    function edit_render(params){
        var index = params.data.lotteryIds.length - 1;
        var id = params.data.lotteryIds[index];
        return '<button class="btn btn-xs bg-primary" ng-click="goEdit(\''+id+'\')">编辑</button>';
    }

    // function opr_render(params){
    //     return '<button class="btn btn-xs bg-primary" ng-click="goBet(\''+params.data._id+'\')">查看</button>';
    // }
    //
    // function publish(params) {
    //     var render = "";
    //     if(!params.data.userNick){
    //         if(params.data.enable){
    //             render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">禁用</button>';
    //         }else{
    //             render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">发布</button>';
    //         }
    //     }
    //     return render;
    // }
    //
    // function editWinUser(params) {
    //     var render = '';
    //     if(params.data.winUserId){
    //         render =  '<button class="btn btn-xs bg-primary" ng-click="editWinUser(data)">'+params.data.userNick+'</button>';
    //     }
    //     return render;
    // }

    $scope.goEdit = function (id) {
        $state.go('app.shop.lottery.edit' , {id: id});
    };

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
            case 0:
                formatStr = "禁用中";
                break;
            case 1:
                formatStr = "进行中";
                break;
            case 2:
                formatStr = "完成等待开奖";
                break;
            case 3:
                formatStr = "开奖公布";
                break;
            case 4:
                formatStr = "未发货";
                break;
            case 5:
                formatStr = "已发货";
                break;
            case 6:
                formatStr = "已完成";
                break;
        }
        return formatStr;
    }

    $scope.lotteryEnables = {};
    function enable_render(params) {

        var index = params.data.lotteryIds.length - 1;
        var id = params.data.lotteryIds[index];

        return '<select ng-model="lotteryEnables['+ (params.data._id)+']" ng-change="onEnableChange(\'' + id + '\', lotteryEnables['+ (params.data._id)+'])"> <option value="1">上架</option> <option value="0">下架</option> </select>'
    }

    $scope.onEnableChange = function (id, data) {
        var enable = false;
        if(data == '1'){
            enable = true;
        }
        $http.post(shopUri + '/publish/' + id, {enable: enable}, {
            params:{
                token: sso.getToken(),
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
    };

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/lotteryActivities', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search,
                    // productId: $scope.productId,
                    // draw: 0
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{

                    for(var i=0; i<data.rows.length; ++i){
                        if(data.rows[i].enable){
                            $scope.lotteryEnables[data.rows[i]._id] = '1';
                        }else{
                            $scope.lotteryEnables[data.rows[i]._id] =  '0';
                        }
                    }

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
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                var index = cell.data.lotteryIds.length - 1;
                $state.go('app.shop.lottery.edit' , {id: cell.data.lotteryIds[index]});
            }
        },
        onCellDoubleClicked: function(cell){
            var index = cell.data.lotteryIds.length - 1;
            $state.go('app.shop.lottery.edit' , {id: cell.data.lotteryIds[index]});
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
                        // ids += e._id;
                        var index = e.lotteryIds.length - 1;
                        ids += (e.lotteryIds[index]);
                    });
                    $http.delete(shopUri+'/lotteries', {
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

    $scope.goEditFormula = function () {
        $state.go("app.shop.lottery.formula");
    }
}]);

app.controller('LotteryEditCtrl', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.lottery = {};

    if($stateParams.productId){
        $scope.lottery.product = $stateParams.productId;
    }

    $scope.lotteryDisabled = false;

    if(id){
        $http.get(shopUri+'/lotteries/'+id, {
            params:{
                token: sso.getToken(),
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.lottery = obj;
                $scope.lottery.status = obj.status + "";
                $scope.lottery.type = obj.type + "";
                if($scope.lottery.enable){
                    $scope.lottery.enable = "1";
                }else{
                    $scope.lottery.enable = "0";
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.lottery.period = 1;
        $scope.lottery.prodNum = 1;
        $scope.lottery.type = "1";
        $scope.lottery.currency = "dbj";
        $scope.lottery.unitPrice = 1;
        $scope.lottery.sort = 0;
    }

    $scope.save = function(){

        var url = shopUri  + '/lotteries';
        if(id){
            url += "/" + id;
        }

        if($scope.lotteryDisabled){
            $scope.lottery.status = 0;
        }

        if($scope.lottery.enable == '1'){
            $scope.lottery.enable = true;
        }else{
            $scope.lottery.enable = false;
        }

        $http.post(url, $scope.lottery, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.shop.lottery.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };


}]);

app.controller('winUserInfoCtrl', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.winUser = {};

    if(id){
        $http.get(shopUri + "/address", {
            params:{
                token: sso.getToken(),
                userId: id
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.winUser = obj.rows[0];
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{

    }

    $scope.save = function(){

        $scope.userId = id;
        $http.post(shopUri + '/address', $scope.winUser, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.shop.lottery.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };


}]);

app.controller('LotteryFormulaCtrl', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {

    $http.get(shopUri+'/formula', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.formula = obj;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.save = function(){

        var url = shopUri  + '/formula';

        $http.post(url, $scope.formula, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.shop.lottery.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
}]);


app.controller('LotteryWinListCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', function ($scope, $state, $stateParams, $http, global) {
    var history = global.appsListHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    $scope.productId = $stateParams.productId;

    $scope.isShowFormula = false;

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 100, hide: true},
        {headerName: "物品Id", field: "id", width: 120},
        {headerName: "夺宝标题", field: "title", width: 120},
        {headerName: "玩家名称", field: "userNick", width: 120},
        {headerName: "玩家ID", field: "userUId", width: 120},
        {headerName: "中奖期数", field: "period", width: 120},
        // {headerName: "总期数", field: "maxPeriod", width: 100},
        // {headerName: "单价", field: "unitPrice", width: 100},
        // {headerName: "消耗夺宝卷数", field: "totalPrice", width: 120},
        // {headerName: "已参加人数", field: "joinNumber", width: 100},
        // {headerName: "总需要人数", field: "totalNumber", width: 100},
        // {headerName: "中奖用户", width: 70, cellRenderer: editWinUser, cellStyle:{'text-align':'center'}},
        {headerName: "中奖编码", field: "winCode", width: 120},
        {headerName: "玩家地址", field: "address.address", width: 120},
        {headerName: "玩家姓名", field: "address.name", width: 120},
        {headerName: "手机号码", field: "address.mobile", width: 100},
        {headerName: "物流公司", field: "logistics", width: 120},
        {headerName: "物流订单", field: "lorder", width: 120},
        {headerName: "当前状态", field: "status", width: 120, valueGetter: angGridFormtStatus},
        // {headerName: "排序", field: "sort", width: 100},
        // {headerName: "是否启用", field: "enable", width: 100},
        // {headerName: "开始时间", field: "beginTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        // {headerName: "结束时间", field: "endTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        // {headerName: "#", width: 70, cellRenderer: publish, cellStyle:{'text-align':'center'}},
        // {headerName: "#", width: 70, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
        {headerName: "#", width: 100, cellRenderer: edit_render, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'shop.lottery.headerwin._id',
        'shop.lottery.headerwin.id',
        'shop.lottery.headerwin.title',
        'shop.lottery.headerwin.userNick',
        'shop.lottery.headerwin.userId',
        'shop.lottery.headerwin.period',
        'shop.lottery.headerwin.winCode',
        'shop.lottery.headerwin.address',
        'shop.lottery.headerwin.name',
        'shop.lottery.headerwin.mobile',
        'shop.lottery.headerwin.logistics',
        'shop.lottery.headerwin.lorder',
        'shop.lottery.headerwin.status',
    ]);

    function edit_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="goEdit(\''+params.data._id+'\')">编辑</button>';
    }

    $scope.goEdit = function (id) {
        $state.go('app.shop.lotteryWin.edit' , {id: id});
    };

    // function opr_render(params){
    //     return '<button class="btn btn-xs bg-primary" ng-click="goBet(\''+params.data._id+'\')">查看</button>';
    // }
    //
    // function publish(params) {
    //     var render = "";
    //     if(!params.data.userNick){
    //         if(params.data.enable){
    //             render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">禁用</button>';
    //         }else{
    //             render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">发布</button>';
    //         }
    //     }
    //     return render;
    // }
    //
    // function editWinUser(params) {
    //     var render = '';
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
            case 0:
                formatStr = "禁用中";
                break;
            case 1:
                formatStr = "进行中";
                break;
            case 2:
                formatStr = "完成等待开奖";
                break;
            case 3:
                formatStr = "开奖公布";
                break;
            case 4:
                formatStr = "未发货";
                break;
            case 5:
                formatStr = "已发货";
                break;
            case 6:
                formatStr = "已完成";
                break;
        }
        return formatStr;
    }

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/lotteries', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search,
                    productId: $scope.productId,
                    draw: 1
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
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.shop.lotteryWin.edit' , {id: cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.shop.lotteryWin.edit' , {id: cell.data._id});
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer:global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
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
                    $http.delete(shopUri+'/lotteries', {
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

    $scope.goEditFormula = function () {
        $state.go("app.shop.lottery.formula");
    }
}]);

app.controller('LotteryWinEditCtrl', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.lottery = {};

    if($stateParams.productId){
        $scope.lottery.product = $stateParams.productId;
    }

    $scope.lotteryDisabled = false;

    if(id){
        $http.get(shopUri+'/lotteries/'+id, {
            params:{
                token: sso.getToken(),
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.lottery = obj;
                $scope.lottery.status = obj.status + "";
                $scope.lottery.type = obj.type + "";
                if($scope.lottery.enable){
                    $scope.lottery.enable = "1";
                }else{
                    $scope.lottery.enable = "0";
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.lottery.period = 1;
        $scope.lottery.prodNum = 1;
        $scope.lottery.type = "1";
        $scope.lottery.currency = "dbj";
        $scope.lottery.unitPrice = 1;
        $scope.lottery.sort = 0;
    }

    $scope.save = function(){

        var url = shopUri  + '/lotteries';
        if(id){
            url += "/" + id;
        }

        if($scope.lotteryDisabled){
            $scope.lottery.status = 0;
        }

        if($scope.lottery.enable == '1'){
            $scope.lottery.enable = true;
        }else{
            $scope.lottery.enable = false;
        }

        $http.post(url, $scope.lottery, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.shop.lotteryWin.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };


}]);
