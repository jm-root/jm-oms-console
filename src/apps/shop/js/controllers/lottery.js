/**
 * Created by Admin on 2016/5/19.
 */
'use strict';
app.controller('LotteryListCtrl', ['$scope', '$state', '$stateParams', '$http', 'sso', 'AGGRID', 'global', function ($scope, $state, $stateParams, $http, sso, AGGRID, global) {
    var history = global.appsListHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';
    
    $scope.productId = $stateParams.productId;
    
    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "夺宝标题", field: "title", width: 100},
        {headerName: "期数", field: "period", width: 100},
        {headerName: "最大期数", field: "maxPeriod", width: 100},
        {headerName: "单价", field: "unitPrice", width: 100},
        {headerName: "总价", field: "totalPrice", width: 100},
        {headerName: "已参加人数", field: "joinNumber", width: 100},
        {headerName: "总需要人数", field: "totalNumber", width: 100},
        {headerName: "中奖用户", width: 70, cellRenderer: editWinUser, cellStyle:{'text-align':'center'}},
        {headerName: "中奖编码", field: "winCode", width: 100},
        {headerName: "状态", field: "status", width: 100, valueGetter: angGridFormtStatus},
        {headerName: "排序", field: "sort", width: 100},
        {headerName: "是否启用", field: "enable", width: 100},
        {headerName: "开始时间", field: "beginTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "结束时间", field: "endTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "#", width: 70, cellRenderer: publish, cellStyle:{'text-align':'center'}},
        {headerName: "#", width: 70, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];
    
    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="goBet(\''+params.data._id+'\')">查看</button>';
    }

    function publish(params) {
        var render;
        if(params.data.enable){
            render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">禁用</button>';
        }else{
            render =  '<button class="btn btn-xs bg-primary" ng-click="publish(data)">发布</button>';
        }
        return render;
    }

    function editWinUser(params) {
        var render = '';
        if(params.data.winUserId){
            render =  '<button class="btn btn-xs bg-primary" ng-click="editWinUser(data)">'+params.data.userNick+'</button>';
        }
        return render;
    }

    $scope.editWinUser = function(data) {
        $state.go('app.shop.lottery.user' , {id: data.winUserId});
    };

    $scope.goBet = function(id){
        $state.go('app.shop.bet.list' , {lotteryId: id});
    };

    $scope.publish = function (data) {
        var content = "是否确认发布?";
        if(data.enable){
            content = "是否确认禁用?";
        }
        $scope.openTips({
            title:'提示',
            content: content,
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                $http.post(shopUri + '/publish/' + data._id, {enable: !data.enable}, {
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
            }
        });
    };

    function angGridFormtStatus(params) {
        var formatStr = params.data.status + "";//1 进行中 2完成等待开奖 3开奖公布 4 未发货 5 已发货 6已完成
        switch (params.data.status){
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
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/lotteries', {
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
            $state.go('app.shop.lottery.edit' , {id: cell.data._id});
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

app.controller('LotteryEditCtrl', ['$scope', '$http', '$state', '$stateParams', 'sso', function($scope, $http, $state, $stateParams, sso) {
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

app.controller('winUserInfoCtrl', ['$scope', '$http', '$state', '$stateParams', 'sso', function($scope, $http, $state, $stateParams, sso) {
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
                $scope.winUser = obj;
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

app.controller('LotteryFormulaCtrl', ['$scope', '$http', '$state', '$stateParams', 'sso', function($scope, $http, $state, $stateParams, sso) {

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
