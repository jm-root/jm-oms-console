

'use strict';
var sso = jm.sdk.sso;
//充值
app.controller('CoinStockRechargeCtrl', ['$scope', '$http', '$state', '$stateParams', 'global', function($scope, $http, $state, $stateParams, global) {
    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    $scope.rate = 0;
    $http.get(agentUri+'/exchange', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.rate = result['cny:tb']||0;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    bank.query({ctCode:'tb'},function(err,result){
        result.holds.tb = result.holds.tb || {};
        $scope.tbAmount = result.holds.tb.amount||0;
    });

    $scope.recharge = function(){
        var way = 'swiftpass';
        var data = {
            'pingxx': {
                amount: $scope.amount,
                ctCode: 'tb',
                rate: $scope.rate,
                way: 'pingxx',
                channel: 'alipay_pc_direct',
                successURL: 'http://' + $scope.host + '/web/admin/#/app/agent/recharge'
            },
            'swiftpass': {
                amount: $scope.amount,
                ctCode: 'tb',
                rate: $scope.rate,
                way: 'swiftpass',
                channel: 'pay.weixin.native'
            }
        };
        var callback = {
            'pingxx': function(ticket){
                pingppPc.createPayment(ticket, function(result, err){
                });
            },
            'swiftpass': function(ticket){
                $scope.payImgCode = ticket.code_img_url;
            }
        };
        if(way=='swiftpass'){
            $state.go('app.coin.stock.recharge.pay');
        }

        $http.post(agentUri+'/recharge', data[way], {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                callback[way](result.ticket);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.back = function () {
        $state.go('^');
    };

}]);

//订单管理
app.controller('CoinStockOrderCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinStockOrderHistory||(global.coinStockOrderHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};

    var viewPath = 'view.agent.order';
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
    }).catch(function(err){
        console.log(err);
    });

    var format_user = function(params) {
        var user = params.data.user || {};
        return user.nick||user.account||'';
    };

    var format_agentId = function(params) {
        var user = params.data.user || {};
        var agent = user.agentRole || {};
        return agent.code||'';
    };

    var format_agent = function(params) {
        var user = params.data.user || {};
        var agent = user.agentRole || {};
        return agent.name||'';
    };

    var format_tAmount = function(params) {
        var obj = params.data.content || {};
        return obj.amount;
    };

    var format_amount = function(params) {
        var obj = params.data || {};
        return obj.amount/100;
    };

    var format_status = function(params) {
        var status = params.data.status;
        var info = '';
        if(status==0){
            info = global.translateByKey('agent.coin.stock.order.unpaid');
        }else if(status==1){
            info = global.translateByKey('agent.coin.stock.order.paid');
        }else if(status==2){
            info = global.translateByKey('agent.coin.stock.order.arrivalAccount');
        }else if(status==3){
            info = global.translateByKey('agent.coin.stock.order.alreadyShipped');
        }else if(status==4){
            info = global.translateByKey('agent.coin.stock.order.applyRefund');
        }else if(status==5){
            info = global.translateByKey('agent.coin.stock.order.agreeRefund');
        }else if(status==6){
            info = global.translateByKey('agent.coin.stock.order.refunded');
        }else if(status==7){
            info = global.translateByKey('agent.coin.stock.order.canceled');
        }else if(status==8){
            info =global.translateByKey('agent.coin.stock.order.obsolete');
        }
        return info;
    };

    function check_render(params){
        return '<label class="i-checks i-checks-sm">'+
            '<input type="checkbox" ng-model="data.check" ng-change="checkChange(\''+params.data._id+'\',data.check)"><i></i>'+
            '</label>';
    }

    $scope.checks = [];
    $scope.checkChange = function(id, val){
        if(val){
            $scope.checks.push(id);
        }else{
            var index = $scope.checks.indexOf(id);
            index>=0 && $scope.checks.splice(index, 1);
        }
    };

    var columnDefs = [
        {headerName: "多选", field: "check", width: 100, cellRenderer: check_render, cellStyle:{'text-align':'center'}},
        {headerName: "单号", field: "code", width: 150},
        {headerName: "订单时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "申购渠道", field: "agent", width: 120, valueGetter: format_agent},
        {headerName: "渠道ID", field: "agentId", width: 120, valueGetter: format_agentId},
        {headerName: "操作人", field: "user", width: 120, valueGetter: format_user},
        {headerName: "买T币数", field: "tAmount", width: 120, valueGetter: format_tAmount},
        {headerName: "支付金额", field: "amount", width: 120, valueGetter: format_amount},
        {headerName: "状态", field: "status", width: 120, valueGetter: format_status}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'agent.coin.stock.header.check',
        'agent.coin.stock.header.code',
        'agent.coin.stock.header.crtime',
        'agent.coin.stock.header.agent',
        'agent.coin.stock.header.agentId',
        'agent.coin.stock.header.user',
        'agent.coin.stock.header.tAmount',
        'agent.coin.stock.header.amount',
        'agent.coin.stock.header.status',
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            $http.get(agentUri+'/orders', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    status: search.status,
                    code: search.code,
                    agent: search.agent,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                    $scope.checks = [];
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
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.delContent'),
                okTitle:global.translateByKey('common.yes'),
                cancelTitle:global.translateByKey('common.no'),
                okCallback: function(){
                    var ids = '';
                    rows.forEach(function(e){
                        if(ids) ids += ',';
                        ids += e._id;
                    });
                    $http.delete(agentUri+'/orders', {
                        params:{
                            token: sso.getToken(),
                            id: ids
                        }
                    }).success(function(result){
                        var obj = result;
                        if(obj.err){
                            $scope.error(obj.msg);
                        }else{
                            $scope.success(global.translateByKey('common.succeed'));
                            $scope.gridOptions.api.setDatasource(dataSource);
                        }
                    }).error(function(msg, code){
                        $scope.errorTips(code);
                    });
                }
            });
        }else{
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.selectDelContent'),
                cancelTitle:global.translateByKey('openTips.cancelDelContent'),
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

    $scope.dateOptions = global.dateRangeOptions;

    //重置查询项
    $scope.resetFun = function(){
        $scope.search = {
            date: {},
            code: "",
            status: "",
            agent: ""
        }
    };

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

    $scope.updateStatus = function(status){
        if(!$scope.checks.length){
            return $scope.error(global.translateByKey('agent.coin.stock.select'));
        }
        var update = {
            status: status,
            id: $scope.checks
        };
        $http.post(agentUri+'/orders/status', update, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $scope.onPageSizeChanged();
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.onExportExcel = function() {
        window.location = agentUri+'/orders' + '?fileName='+encodeURIComponent(global.translateByKey('agent.coin.stock.orderList'))+'&token=' + sso.getToken();
    };
}]);

//库存列表
app.controller('CoinStockListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinStockListHistory||(global.coinStockListHistory={});
    $scope.page = history.page||1;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.agent = $scope.search.agent || '';

    $scope.hasPasswd = true;

    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    bank.isVaildPasswd({token:sso.getToken(),passwd: '1'},function(err,obj){
        if(err) return;
        if(obj.ret==-1){
            $scope.hasPasswd = false;
        }
    });

    var queryTB = function(){
        bank.query({ctCode:'tb'},function(err,result){
            result.holds.tb = result.holds.tb || {};
            $scope.tbAmount = result.holds.tb.amount||0;
        });
    };
    queryTB();

    var viewPath = 'view.coin.stock.list';
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
    }).catch(function(err){
        console.log(err);
    });

    var format_user = function(params) {
        var user = params.data._id || {};
        return user.nick||user.account||'';
    };

    var format_level = function(params) {
        var level = params.data.level;
        var info = global.translateByKey('agent.coin.stock.list.levelOpts.opts1');
        if(level==1) info = global.translateByKey('agent.coin.stock.list.levelOpts.opts2');
        if(level==2) info = global.translateByKey('agent.coin.stock.list.levelOpts.opts3');
        return info;
    };

    var format_amount = function(params) {
        var buyAmount = params.data.buyAmount || 0;
        var sellAmount = params.data.sellAmount || 0;
        return buyAmount-sellAmount;
    };

    var format_status = function(params) {
        var status = params.data.status;
        var info = '';
        if(status==0){
            info = global.translateByKey('agent.coin.stock.list.disable');
        }else if(status==1){
            info = global.translateByKey('agent.coin.stock.list.activation');
        }
        return info;
    };

    var format_accountStatus = function(params) {
        var status = params.data.accountStatus;
        var info = '';
        if(status==0){
            info = global.translateByKey('agent.coin.stock.list.frozen');
        }else if(status==1){
            info = global.translateByKey('agent.coin.stock.list.normal');
        }else if(status==2){
            info = global.translateByKey('agent.coin.stock.list.cancellation');
        }
        return info;
    };

    var htmlFun = function(id, name, type){
        var amoutInput = '<div class="form-group">' +
            '<label class="col-sm-2 control-label" translate="agent.coin.stock.list.inputAmount">输入金额</label>' +
            '<div class="col-sm-9">' +
            '<input type="number" class="form-control" placeholder="T币" ng-model="amount" ng-required="true">' +
            '</div>' +
            '<div class="col-sm-1"></div>' +
            '</div>';
        if(type=='freeze') amoutInput = '';

        return '<div class="col-lg-12 m-b-xs">' +
            '<div class="pull-left">' +
            '<span>渠道ID：'+id+'&emsp;&emsp;拥有者：'+name+'</span>' +
            '</div>' +
            '</div>' +
            '<form name="formValidate" class="form-horizontal form-validation">' + amoutInput +
            '<div class="form-group">' +
            '<label class="col-sm-2 control-label" translate="agent.coin.stock.list.paymentPassword">支付密码</label>' +
            '<div class="col-sm-9">' +
            '<input type="password" class="form-control" placeholder="支付密码" ng-model="passwd" ng-required="true">' +
            '</div>' +
            '<div class="col-sm-1"></div>' +
            '</div>' +
            '<a style="margin-left: 13px;font-size: 10px;color: #884b00" ui-sref="app.security({successUri:\'app.coin.stock.list\'})" ng-click="cancel()" ng-if="' + !$scope.hasPasswd + '" translate="agent.coin.stock.list.setPaymentPassword">设置支付密码</a>' +
            '</form>';
    };

    $scope.add = function(id, code, name){
        $scope.openTips({
            title:global.translateByKey('agent.coin.stock.list.add'),
            content: htmlFun(code,name),
            okTitle:global.translateByKey('common.confirm'),
            cancelTitle:global.translateByKey('common.cancel'),
            okCallback: function($s){
                if(!$s.passwd) return $scope.error(global.translateByKey('agent.coin.stock.list.inputPaymentPassword'));
                var data = {amount:$s.amount,passwd:$s.passwd,userId:id};
                $http.post(agentUri+'/coins/add', data, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    if(result.err){
                        $scope.error(result.msg);
                    }else{
                        $scope.success(global.translateByKey('common.succeed'));
                        $scope.onPageSizeChanged();
                        queryTB();
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    $scope.deduct = function(id, code, name){
        $scope.openTips({
            title:global.translateByKey('agent.coin.stock.list.deduction'),
            content: htmlFun(code,name),
            okTitle:global.translateByKey('common.confirm'),
            cancelTitle:global.translateByKey('common.cancel'),
            okCallback: function($s){
                if(!$s.passwd) return $scope.error(global.translateByKey('agent.coin.stock.list.inputPaymentPassword'));
                var data = {amount:$s.amount,passwd:$s.passwd,userId:id};
                $http.post(agentUri+'/coins/deduct', data, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    if(result.err){
                        $scope.error(result.msg);
                    }else{
                        $scope.success(global.translateByKey('common.succeed'));
                        $scope.onPageSizeChanged();
                        queryTB();
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    $scope.freeze = function(id, code, name,status){
        status = 1-status;
        var title;
        status ? title = global.translateByKey('agent.coin.stock.list.unfreeze'): title = global.translateByKey('agent.coin.stock.list.frozen');
        $scope.openTips({
            title:title,
            content: htmlFun(code,name,'freeze'),
            okTitle:global.translateByKey('common.confirm'),
            cancelTitle:global.translateByKey('common.cancel'),
            okCallback: function($s){
                if(!$s.passwd) return $scope.error(global.translateByKey('agent.coin.stock.list.inputPaymentPassword'));
                var data = {userId:id,status:status,passwd:$s.passwd};
                $http.post(agentUri+'/account/status', data, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    if(result.err){
                        $scope.error(result.msg);
                    }else{
                        $scope.success(global.translateByKey('common.succeed'));
                        $scope.onPageSizeChanged();
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    function ctrl_render(params){
        var user = params.data._id || {};
        var name = user.nick||user.account||'';
        var code = params.data.code;
        var id = user._id;
        var status = params.data.accountStatus;
        var freezeName = global.translateByKey('agent.coin.stock.list.frozen');
        if(status==0) freezeName = global.translateByKey('agent.coin.stock.list.unfreeze');
        return '<span class="btn btn-xs bg-primary m-r-xs" ng-click="add(\''+id+'\',\''+code+'\',\''+name+'\')" ng-if="super||per[\'增加\']" translate="agent.coin.stock.list.add">增加</span>'+
            '<span class="btn btn-xs bg-primary m-r-xs" ng-click="deduct(\''+id+'\',\''+code+'\',\''+name+'\')" ng-if="super||per[\'扣减\']" translate="agent.coin.stock.list.deduction">扣减</span>'+
            '<span class="btn btn-xs bg-primary m-r-xs" ng-click="freeze(\''+id+'\',\''+code+'\',\''+name+'\',\''+status+'\')" ng-if="super||per[\'冻结\']">'+freezeName+'</span>'+
            '<span class="btn btn-xs bg-primary" ng-click="onExportExcel(\''+id+'\')" ng-if="super||per[\'execl\']">execl</span>';
    }

    var columnDefs = [
        {headerName: "渠道ID", field: "code", width: 120},
        {headerName: "渠道名", field: "name", width: 120},
        {headerName: "代理级别", field: "level", width: 120, valueGetter: format_level},
        {headerName: "拥有者", field: "user", width: 120, valueGetter: format_user},
        {headerName: "总金额", field: "buyAmount", width: 120},
        {headerName: "发放金额", field: "sellAmount", width: 120},
        {headerName: "未发金额", field: "amount", width: 120, valueGetter: format_amount},
        {headerName: "状态", field: "status", width: 120, valueGetter: format_status},
        {headerName: "账户状态", field: "accountStatus", width: 120, valueGetter: format_accountStatus},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "操作", width: 250, cellRenderer: ctrl_render, cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'agent.coin.stock.list.header.code',
        'agent.coin.stock.list.header.name',
        'agent.coin.stock.list.header.level',
        'agent.coin.stock.list.header.user',
        'agent.coin.stock.list.header.buyAmount',
        'agent.coin.stock.list.header.sellAmount',
        'agent.coin.stock.list.header.amount',
        'agent.coin.stock.list.header.status',
        'agent.coin.stock.list.header.accountStatus',
        'agent.coin.stock.list.header.crtime',
        'agent.coin.stock.list.header.ctrl',
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            $scope.page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            $http.get(agentUri+'/agents', {
                params:{
                    token: sso.getToken(),
                    page: $scope.page,
                    rows: $scope.pageSize,
                    search: search.agent
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
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
        columnDefs: columnDefs,
        rowHeight: 30,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function() {
        dataSource.paginationPageSize = Number($scope.paginationPageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('page', function () {
        history.page = $scope.page;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

    //重置查询项
    $scope.resetFun = function(){
        $scope.search = {
            agent: ""
        }
    };

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

    $scope.onExportExcel = function(id) {
        id = id || '';
        id ? id=('/'+id) : '';
        window.location = agentUri+'/agents'+ id + '?fileName='+encodeURIComponent(global.translateByKey('agent.coin.stock.inventoryList'))+'&token=' + sso.getToken();
    };
}]);

//批量分发
app.controller('CoinDistributeBatchCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinDistributeBatchHistory||(global.coinDistributeBatchHistory={});
    $scope.page = history.page||1;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.user = $scope.search.user || '';

    $scope.hasPasswd = true;

    $scope.rate = 0;
    $http.get(agentUri+'/exchange', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.rate = result['tb:jb']||0;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    bank.isVaildPasswd({token:sso.getToken(),passwd: '1'},function(err,obj){
        if(err) return;
        if(obj.ret==-1){
            $scope.hasPasswd = false;
        }
    });

    var queryTB = function(){
        bank.query({ctCode:'tb'},function(err,result){
            result.holds.tb = result.holds.tb || {};
            $scope.tbAmount = result.holds.tb.amount||0;
        });
    };
    queryTB();

    //var viewPath = 'view.coin.stock.list';
    //$scope.per = {};
    //global.getUserPermission(viewPath).then(function(obj){
    //    $scope.per = obj[viewPath]||{};
    //    $scope.super = !!$scope.per['*'];
    //}).catch(function(err){
    //    console.log(err);
    //});

    var format_user = function(params) {
        var user = params.data || {};
        return user.nick|| user.account|| user.mobile || '';
    };

    function check_render(params){
        return '<label class="i-checks i-checks-sm">'+
            '<input type="checkbox" ng-model="data.check" ng-change="checkChange(data,data.check)"><i></i>'+
            '</label>';
    }

    $scope.checks = [];
    $scope.checkChange = function(data, val){
        if(val){
            $scope.checks.push(data);
        }else{
            var index = $scope.checks.indexOf(data);
            index>=0 && $scope.checks.splice(index, 1);
        }
    };

    var columnDefs = [
        {headerName: "多选", field: "check", width: 100, cellRenderer: check_render, cellStyle:{'text-align':'center'}},
        {headerName: "用户名", field: "user", width: 300, valueGetter: format_user},
        {headerName: "创建时间", field: "crtime", width: 300, valueGetter: $scope.angGridFormatDateS}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'agent.coin.distribute.batch.check',
        'agent.coin.distribute.batch.user',
        'agent.coin.distribute.batch.crtime'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            $http.get(agentUri + '/users', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: $scope.search.user,
                    onlyuser: true
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                    $scope.checks = [];
                }
            }).error(function (msg, code) {
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
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            //event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            //$state.go('app.agent.edit' , {id: cell.data._id});
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
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

    $scope.recharge = function(){
        console.log($scope.hasPasswd);
        if(!$scope.checks.length){
            return $scope.warning(global.translateByKey('agent.coin.distribute.batch.selectUser'));
        }
        if(!$scope.tbUseAmount){
            return $scope.warning(global.translateByKey('agent.coin.distribute.batch.enterAmount'));
        }
        var userIds = [];
        var users = [];
        $scope.checks.forEach(function(item){
            userIds.push(item._id);
            users.push(item.nick||item.mobile||item.account||item._id);
        });
        users = users.join(', ');
        var total = $scope.tbUseAmount * userIds.length;
        if($scope.tbAmount<total){
            return $scope.warning(global.translateByKey('agent.coin.distribute.batch.insufficient'));
        }
        $scope.openTips({
            title:global.translateByKey('openTips.title'),
            content:
            '<div style="margin-left: 12px">' +
            '<div style="margin-bottom: 5px" translate="agent.coin.distribute.batch.recharge">确定对下列用户充值吗?</div>'+
            '<div style="margin-bottom: 10px">'+users+'</div>'+
            '<div style="margin-bottom: 10px;color: red">本次操作将从你账户上扣除:&nbsp;&nbsp;'+total+'&nbsp;&nbsp;T币</div>' +
            '</div>' +
            '<form name="formValidate" class="form-horizontal form-validation">' +
            '<div class="form-group">' +
            '<label class="col-sm-2 control-label" translate="agent.coin.distribute.batch.paymentPassword">支付密码</label>' +
            '<div class="col-sm-9" style="padding-left:0px">' +
            '<input type="password" class="form-control" placeholder="支付密码" ng-model="passwd" ng-required="true">' +
            '</div>' +
            '<div class="col-sm-1"></div>' +
            '</div>' +
            '<a style="margin-left: 13px;font-size: 10px;color: #884b00" ui-sref="app.security({successUri:\'app.coin.distribute.batch\'})" ng-click="cancel()" ng-if="'+!$scope.hasPasswd+'">设置支付密码</a>' +
            '</form>',
            okTitle:global.translateByKey('common.yes'),
            cancelTitle:global.translateByKey('common.no'),
            okCallback: function($s){
                if(!$s.passwd) return $scope.error(global.translateByKey('agent.coin.distribute.batch.enter'));
                var data = {
                    userIds:userIds,fromCTCode:'tb',toCTCode:'jb',rate:$scope.rate,rebate:$scope.rebate,
                    fromAmount:$scope.tbUseAmount,toAmount:$scope.jbAmount,passwd:$s.passwd
                };
                $http.post(agentUri+'/distribute', data, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    if(result.err){
                        $scope.error(result.msg);
                    }else{
                        $scope.success(global.translateByKey('common.succeed'));
                        $scope.onPageSizeChanged();
                        queryTB();
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    }
}]);

//生成首充号
app.controller('CoinDistributeMakeCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinDistributeBatchHistory||(global.coinDistributeBatchHistory={});
    $scope.page = history.page||1;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};

    $scope.hasPasswd = true;

    $scope.rate = 0;
    $http.get(agentUri+'/exchange', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.rate = result['tb:jb']||0;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    bank.isVaildPasswd({token:sso.getToken(),passwd: '1'},function(err,obj){
        if(err) return;
        if(obj.ret==-1){
            $scope.hasPasswd = false;
        }
    });

    var queryTB = function(){
        bank.query({ctCode:'tb'},function(err,result){
            result.holds.tb = result.holds.tb || {};
            $scope.tbAmount = result.holds.tb.amount||0;
        });
    };
    queryTB();

    //var viewPath = 'view.coin.stock.list';
    //$scope.per = {};
    //global.getUserPermission(viewPath).then(function(obj){
    //    $scope.per = obj[viewPath]||{};
    //    $scope.super = !!$scope.per['*'];
    //}).catch(function(err){
    //    console.log(err);
    //});

    var format_agent = function(params) {
        var agent = params.data.agent || {};
        return agent.code||'';
    };

    var format_sAmount = function(params) {
        var obj = params.data || {};
        return Math.round(obj.sAmount)||'';
    };

    function ctrl_render(params){
        var id = params.data._id || '';
        return '<span class="btn btn-xs bg-primary" ng-click="onExportExcel(\''+id+'\')">execl</span>';
    }

    var columnDefs = [
        {headerName: "批次号", field: "code", width: 120},
        {headerName: "数量", field: "count", width: 100},
        {headerName: "金币数", field: "amount", width: 100},
        {headerName: "折扣", field: "rebate", width: 70},
        {headerName: "消耗T币", field: "sAmount", width: 100, valueGetter:format_sAmount},
        {headerName: "渠道ID", field: "agent", width: 100, valueGetter:format_agent},
        {headerName: "创建日期", field: "crtime", width: 200, valueGetter: $scope.angGridFormatDateS},
        {headerName: "操作", width: 100, cellRenderer: ctrl_render, cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'agent.coin.distribute.make.code',
        'agent.coin.distribute.make.count',
        'agent.coin.distribute.make.amount',
        'agent.coin.distribute.make.rebate',
        'agent.coin.distribute.make.sAmount',
        'agent.coin.distribute.make.agent',
        'agent.coin.distribute.make.crtime',
        'agent.coin.distribute.make.operation',
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            var page = params.startRow / $scope.pageSize + 1;
            var date = $scope.search.date;
            var startDate = date.startDate&&date.startDate.toString() || "";
            var endDate = date.endDate&&date.endDate.toString() || "";
            $http.get(agentUri + '/userMakeLogs', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                    $scope.checks = [];
                }
            }).error(function (msg, code) {
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
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            //event.api.sizeColumnsToFit();
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.coin.distribute.makeinfo' , {id: cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.coin.distribute.makeinfo' , {id: cell.data._id});
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
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

    $scope.dateOptions = global.dateRangeOptions;

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

    $scope.makeFun = function(){
        var total = $scope.tbUseAmount*$scope.count;
        $scope.openTips({
            title:global.translateByKey('openTips.title'),
            content: '<div style="margin-left: 12px">' +
            '<div style="margin-bottom: 10px;color: red">本次操作将从你账户上扣除:&nbsp;&nbsp;' + total + '&nbsp;&nbsp;T币</div>' +
            '</div>' +
            '<form name="formValidate" class="form-horizontal form-validation">' +
            '<div class="form-group">' +
            '<label class="col-sm-2 control-label" translate="agent.coin.distribute.batch.paymentPassword">支付密码</label>' +
            '<div class="col-sm-9" style="padding-left:0px">' +
            '<input type="password" class="form-control" placeholder="支付密码" ng-model="passwd" ng-required="true">' +
            '</div>' +
            '<div class="col-sm-1"></div>' +
            '</div>' +
            '<a style="margin-left: 13px;font-size: 10px;color: #884b00" ui-sref="app.security({successUri:\'app.coin.distribute.make\'})" ng-click="cancel()" ng-if="' + !$scope.hasPasswd + '">设置支付密码</a>' +
            '</form>',
            okTitle:global.translateByKey('common.yes'),
            cancelTitle:global.translateByKey('common.no'),
            okCallback: function ($s) {
                if(!$s.passwd) return $scope.error(global.translateByKey('agent.coin.distribute.batch.enter'));
                var data = {
                    count:$scope.count,ctCode:'jb',sCtCode:'tb',rate:$scope.rate,rebate:$scope.rebate,
                    amount:$scope.jbAmount,sAmount:$scope.tbUseAmount,passwd:$s.passwd
                };
                $http.post(agentUri+'/createUsers', data, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    if(result.err){
                        $scope.error(result.msg);
                    }else{
                        $scope.success(global.translateByKey('common.succeed'));
                        $scope.onPageSizeChanged();
                        queryTB();
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    $scope.onExportExcel = function(id) {
        window.location = agentUri+'/userMakeLogs/detail'+ '?fileName='+encodeURIComponent(global.translateByKey('agent.coin.distribute.make.charge'))+'&token=' + sso.getToken()+'&id='+id;
    };
}]);

//生成首充号详情
app.controller('CoinDistributeMakeInfoCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var id = $stateParams.id;
    $scope.users = [];
    if(id){
        $http.get(agentUri+'/make/users', {
            params:{
                token: sso.getToken(),
                mkId: id
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.users = result.rows||[];
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
}]);

//帐号列表
app.controller('CoinAccountListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinAccountListHistory||(global.coinAccountListHistory={});
    $scope.page = history.page||1;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    var viewPath = '/agent/account/status';
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
        if($scope.super){
            $scope.hasPasswd = true;
            bank.isVaildPasswd({token:sso.getToken(),passwd: '1'},function(err,obj){
                if(err) return;
                if(obj.ret==-1){
                    $scope.hasPasswd = false;
                }
            });
        }
    }).catch(function(err){
        console.log(err);
    });

    var format_user = function(params) {
        var user = params.data||{};
        return user.nick || user.account || user._id || '';
    };

    var format_agentCode = function(params) {
        var agent = params.data.agent||{};
        return agent.code || '';
    };

    var format_agentName = function(params) {
        var agent = params.data.agent||{};
        return agent.name || '';
    };

    var format_tb = function(params) {
        params.data.defAccount=params.data.defAccount || {};
        var holds = params.data.defAccount.holds||{};
        holds.tb = holds.tb || {};
        return holds.tb.amount || 0;
    };

    var format_jb = function(params) {
        params.data.defAccount=params.data.defAccount || {};
        var holds = params.data.defAccount.holds||{};
        holds.jb = holds.jb || {};
        return holds.jb.amount || 0;
    };

    var format_dbj = function(params) {
        params.data.defAccount=params.data.defAccount || {};
        var holds = params.data.defAccount.holds||{};
        holds.dbj = holds.dbj || {};
        return holds.dbj.amount || 0;
    };

    var format_accountStatus = function(params) {
        var status = params.data.defAccount.status;
        var info = '';
        if(status==0){
            info = global.translateByKey('agent.coin.account.list.frozen');
        }else if(status==1){
            info = global.translateByKey('agent.coin.account.list.normal');
        }else if(status==2){
            info = global.translateByKey('agent.coin.account.list.cancellation');
        }
        return info;
    };

    $scope.freeze = function(data){
        var userName = format_user({data:data});
        var id = data._id;
        var status = data.defAccount.status;
        if(status>=2) return;
        status = 1-status;
        var title,ask;
        status ? title = global.translateByKey('agent.coin.account.list.unfreeze'): title = global.translateByKey('agent.coin.account.list.frozen');
        ask = global.translateByKey('agent.coin.account.list.determine')+title+'('+userName+')用户账户?';

        $scope.openTips({
            title:title,
            content:
            '<div style="margin-left:13px;margin-bottom: 10px">'+ask+'</div>'+
            '<form name="formValidate" class="form-horizontal form-validation">' +
            '<div class="form-group">' +
            '<label class="col-sm-2 control-label" translate="agent.coin.distribute.batch.paymentPassword">支付密码</label>' +
            '<div class="col-sm-9" style="padding-left:0px">' +
            '<input type="password" class="form-control" placeholder="支付密码" ng-model="passwd" ng-required="true">' +
            '</div>' +
            '<div class="col-sm-1"></div>' +
            '</div>' +
            '<a style="margin-left: 13px;font-size: 10px;color: #884b00" ui-sref="app.security({successUri:\'app.coin.account.list\'})" ng-click="cancel()" ng-if="'+!$scope.hasPasswd+'">设置支付密码</a>' +
            '</form>',
            okTitle:global.translateByKey('common.yes'),
            cancelTitle:global.translateByKey('common.no'),
            okCallback: function($s){
                if(!$s.passwd) return $scope.error(global.translateByKey('agent.coin.account.list.inputPaymentPassword'));
                var data = {userId:id,status:status,passwd:$s.passwd};
                $http.post(agentUri+'/account/status', data, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    if(result.err){
                        $scope.error(result.msg);
                    }else{
                        $scope.success(global.translateByKey('common.succeed'));
                        $scope.onPageSizeChanged();
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    function ctrl_render(params){
        var status = params.data.defAccount.status;
        var freezeName = global.translateByKey('agent.coin.account.list.frozen');
        if(status==0) freezeName = global.translateByKey('agent.coin.account.list.unfreeze');
        return '<span class="btn btn-xs bg-primary m-r-xs" ng-if="'+$scope.super+'" ng-click="freeze(data)">'+freezeName+'</span>';
    }

    var columnDefs = [
        {headerName: "用户ID", field: "uid", width: 100},
        {headerName: "用户名", field: "user", width: 100, valueGetter: format_user},
        {headerName: "所属渠道", field: "agentCode", width: 100, valueGetter: format_agentCode},
        {headerName: "所属渠道名", field: "agentName", width: 145, valueGetter: format_agentName},
        {headerName: "手机", field: "mobile", width: 125},
        {headerName: "T币余额", field: "tb", width: 125, valueGetter: format_tb},
        {headerName: "金币余额", field: "jb", width: 125, valueGetter: format_jb},
        {headerName: "夺宝卷余额", field: "dbj", width: 125, valueGetter: format_dbj},
        {headerName: "账户状态", field: "accountStatus", width: 100, valueGetter: format_accountStatus},
        {headerName: "操作", width: 120, cellRenderer: ctrl_render, cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'agent.coin.account.list.uid',
        'agent.coin.account.list.user',
        'agent.coin.account.list.agentCode',
        'agent.coin.account.list.agentName',
        'agent.coin.account.list.mobile',
        'agent.coin.account.list.tb',
        'agent.coin.account.list.jb',
        'agent.coin.account.list.dbj',
        'agent.coin.account.list.accountStatus',
        'agent.coin.account.list.operation',
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            $scope.page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            $http.get(agentUri+'/users/accounts', {
                params:{
                    token: sso.getToken(),
                    page: $scope.page,
                    rows: $scope.pageSize,
                    search: search
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
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
        columnDefs: columnDefs,
        rowHeight: 30,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('page', function () {
        history.page = $scope.page;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

}]);

//玩家账号统计
app.controller('CoinRecordPlayerStatCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinStockListHistory||(global.coinStockListHistory={});
    $scope.page = history.page||1;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.statType = $scope.search.statType || '0';
    $scope.search.date = $scope.search.date || {};
    $scope.search.user = $scope.search.user || '';

    var format_account = function(params) {
        var user = params.data.user || {};
        return user.account||'';
    };

    var format_mobile = function(params) {
        var user = params.data.user || {};
        return user.mobile||'';
    };

    var format_agentCode = function(params) {
        var agent = params.data.agent || {};
        return agent.code||'';
    };

    var format_rebate = function(params) {
        var obj = params.data._id || {};
        return obj.rebate+global.translateByKey('agent.coin.record.playerStat.discount')||'';
    };

    var format_date = function(params) {
        var obj = params.data._id || {};
        return obj.date||'';
    };

    var format_amount = function(params) {
        var obj = params.data || {};
        return Math.round(obj.amount)||'';
    };

    var format_sAmount = function(params) {
        var obj = params.data || {};
        return  Math.round(obj.sAmount)||'';
    };

    function ctrl_render(params){
        var user = params.data._id || {};
        var name = user.nick||user.account||'';
        var code = params.data.code;
        var id = user._id;
        return '<span class="btn btn-xs bg-primary">execl</span>';
    }

    var columnDefs = [
        {headerName: "账号", field: "account", width: 100, valueGetter: format_account},
        {headerName: "手机", field: "mobile", width: 120, valueGetter: format_mobile},
        {headerName: "分发渠道", field: "agentCode", width: 100, valueGetter: format_agentCode},
        {headerName: "分发金币", field: "amount", width: 100, valueGetter: format_amount},
        {headerName: "折扣", field: "rebate", width: 100, valueGetter: format_rebate},
        {headerName: "价值T币", field: "sAmount", width: 100, valueGetter: format_sAmount},
        {headerName: "统计时间", field: "date", width: 145, valueGetter: format_date},
        //{headerName: "操作", width: 100, cellRenderer: ctrl_render, cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'agent.coin.record.playerStat.header.account',
        'agent.coin.record.playerStat.header.mobile',
        'agent.coin.record.playerStat.header.agentCode',
        'agent.coin.record.playerStat.header.amount',
        'agent.coin.record.playerStat.header.rebate',
        'agent.coin.record.playerStat.header.sAmount',
        'agent.coin.record.playerStat.header.date'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            $scope.page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate&&date.startDate.toString() || "";
            var endDate = date.endDate&&date.endDate.toString() || "";
            $http.get(agentUri+'/stat/users', {
                params:{
                    token: sso.getToken(),
                    page: $scope.page,
                    rows: $scope.pageSize,
                    user: search.user,
                    statType: search.statType,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
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
        columnDefs: columnDefs,
        rowHeight: 30,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
           // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('page', function () {
        history.page = $scope.page;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

    //重置查询项
    $scope.resetFun = function(){
        $scope.search = {
            date: {},
            user: '',
            statType: '0'
        }
    };

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

    $scope.dateOptions = global.dateRangeOptions;

    $scope.onExportExcel = function() {
        window.location = agentUri+'/stat/users' + '?fileName='+encodeURIComponent(global.translateByKey('agent.coin.record.playerStat.statistics'))+'&token=' + sso.getToken();
    };
}]);

//渠道账号统计
app.controller('CoinRecordAgentStatCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinRecordAgentStatHistory||(global.coinRecordAgentStatHistory={});
    $scope.page = history.page||1;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.statType = $scope.search.statType || '0';
    $scope.search.date = $scope.search.date || {};
    $scope.search.agent = $scope.search.agent || '';

    var format_code = function(params) {
        var agent = params.data.toAgent || {};
        return agent.code||'';
    };

    var format_name = function(params) {
        var agent = params.data.toAgent || {};
        return agent.name||'';
    };

    var format_pAgent = function(params) {
        var agent = params.data.fromAgent || {};
        return agent.code||'';
    };

    var format_date = function(params) {
        var obj = params.data._id || {};
        return obj.date||'';
    };

    var format_amount = function(params) {
        var obj = params.data || {};
        return Math.round(obj.amount)||'';
    };

    function ctrl_render(params){
        var user = params.data._id || {};
        var name = user.nick||user.account||'';
        var code = params.data.code;
        var id = user._id;
        return '<span class="btn btn-xs bg-primary">execl</span>';
    }

    var columnDefs = [
        {headerName: "渠道ID", field: "code", width: 100, valueGetter: format_code},
        {headerName: "渠道名", field: "name", width: 125, valueGetter: format_name},
        {headerName: "分发渠道", field: "pAgent", width: 145, valueGetter: format_pAgent},
        {headerName: "分发金额", field: "amount", width: 110, valueGetter: format_amount},
        {headerName: "统计时间", field: "date", width: 145, valueGetter: format_date},
        //{headerName: "操作", width: 100, cellRenderer: ctrl_render, cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'agent.coin.record.agentStat.code',
        'agent.coin.record.agentStat.name',
        'agent.coin.record.agentStat.pAgent',
        'agent.coin.record.agentStat.amount',
        'agent.coin.record.agentStat.date'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            $scope.page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate&&date.startDate.toString() || "";
            var endDate = date.endDate&&date.endDate.toString() || "";
            $http.get(agentUri+'/stat/agents', {
                params:{
                    token: sso.getToken(),
                    page: $scope.page,
                    rows: $scope.pageSize,
                    agent: search.agent,
                    statType: search.statType,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
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
        columnDefs: columnDefs,
        rowHeight: 30,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('page', function () {
        history.page = $scope.page;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });


    //重置查询项
    $scope.resetFun = function(){
        $scope.search = {
            date: {},
            user: '',
            statType: '0'
        }
    };

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

    $scope.dateOptions = global.dateRangeOptions;

    $scope.onExportExcel = function() {
        window.location = agentUri+'/stat/agents' + '?fileName='+encodeURIComponent(global.translateByKey('agent.coin.record.agentStat.statistics'))+'&token=' + sso.getToken();
    };
}]);

//日志查询
app.controller('CoinRecordLogsCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var history = global.coinRecordLogsHistory||(global.coinRecordLogsHistory={});
    $scope.page = history.page||1;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.type = history.type||'0';
    $scope.search = history.search||{};
    $scope.search.agent = $scope.search.agent || '';
    $scope.search.date = $scope.search.date || {};
    $scope.search.user = $scope.search.user || '';
    $scope.search.order = $scope.search.order || '';
    $scope.search.type = $scope.search.type || '';

    $scope.ctrltype = {
        '0':[{code:'0',name:global.translateByKey('agent.coin.record.logs.batch')},{code:'1',name:global.translateByKey('agent.coin.record.logs.generation')}],
        '1':[{code:'0',name:global.translateByKey('agent.coin.record.logs.add')},{code:'1',name:global.translateByKey('agent.coin.record.logs.deduction')}],
        '2':[
            {code:'0',name:global.translateByKey('agent.coin.record.logs.unpaid')},
            {code:'1',name:global.translateByKey('agent.coin.record.logs.paid')},
            {code:'2',name:global.translateByKey('agent.coin.record.logs.arrivalAccount')},
            {code:'3',name:global.translateByKey('agent.coin.record.logs.alreadyShipped')},
            {code:'4',name:global.translateByKey('agent.coin.record.logs.applyRefund')},
            {code:'5',name:global.translateByKey('agent.coin.record.logs.agreeRefund')},
            {code:'6',name:global.translateByKey('agent.coin.record.logs.refunded')},
            {code:'7',name:global.translateByKey('agent.coin.record.logs.canceled')},
            {code:'8',name:global.translateByKey('agent.coin.record.logs.obsolete')}
        ],
        '3':[{code:'0',name:global.translateByKey('agent.coin.record.logs.frozen')},{code:'1',name:global.translateByKey('agent.coin.record.logs.unfreeze')}]
    };

    var format_account = function(params) {
        var user = params.data.user || {};
        return user.account||'';
    };

    var format_agentCode = function(params) {
        var agent = params.data.agent || {};
        return agent.code||'';
    };

    var format_rebate = function(params) {
        var obj = params.data || {};
        return obj.rebate+global.translateByKey('agent.coin.record.logs.discount')||'';
    };

    var format_amount = function(params) {
        var obj = params.data || {};
        return Math.round(obj.amount)||'';
    };

    var format_sAmount = function(params) {
        var obj = params.data || {};
        return  Math.round(obj.sAmount)||'';
    };

    var format_type = function(params) {
        var obj = params.data || {};
        var info = '';
        if(obj.type=='0') info = global.translateByKey('agent.coin.record.logs.batch');
        if(obj.type=='1') info = global.translateByKey('agent.coin.record.logs.generation');
        return info;
    };

    var format_agentCode1 = function(params) {
        var agent = params.data.toAgent || {};
        return agent.code||'';
    };

    var format_agentName1 = function(params) {
        var agent = params.data.toAgent || {};
        return agent.name||'';
    };

    var format_pagentCode1 = function(params) {
        var agent = params.data.fromAgent || {};
        return agent.code||'';
    };


    var format_amount1 = function(params) {
        var obj = params.data || {};
        return Math.round(obj.amount)||'';
    };

    var format_type1 = function(params) {
        var obj = params.data || {};
        var info = '';
        if(obj.type=='0') info = global.translateByKey('agent.coin.record.logs.add');
        if(obj.type=='1') info = global.translateByKey('agent.coin.record.logs.deduction');
        return info;
    };

    var format_code2 = function(params) {
        var obj = params.data.order || {};
        return obj.code||'';
    };

    var format_time2 = function(params) {
        var obj = params.data.order || {};
        var info = moment(obj.crtime).format('YYYY-MM-DD HH:mm:ss');
        return info||'';
    };

    var format_agentName2 = function(params) {
        var obj = params.data.agent || {};
        return obj.name||'';
    };

    var format_agentCode2 = function(params) {
        var obj = params.data.agent || {};
        return obj.code||'';
    };

    var format_amount2 = function(params) {
        var obj = params.data.order || {};
        obj.content = obj.content || {};
        return obj.content.amount||'';
    };

    var format_cash2 = function(params) {
        var obj = params.data.order || {};
        return obj.amount/100||'';
    };

    var format_creator2 = function(params) {
        var obj = params.data.user || {};
        return obj.account||global.translateByKey('agent.coin.record.logs.system');
    };

    var format_type2 = function(params) {
        var status = params.data.status;
        var info = '';
        if(status==0) info = global.translateByKey('agent.coin.record.logs.unpaid');
        if(status==1) info = global.translateByKey('agent.coin.record.logs.paid');
        if(status==2) info = global.translateByKey('agent.coin.record.logs.arrivalAccount');
        if(status==3) info = global.translateByKey('agent.coin.record.logs.alreadyShipped');
        if(status==4) info = global.translateByKey('agent.coin.record.logs.applyRefund');
        if(status==5) info = global.translateByKey('agent.coin.record.logs.agreeRefund');
        if(status==6) info = global.translateByKey('agent.coin.record.logs.refunded');
        if(status==7) info = global.translateByKey('agent.coin.record.logs.canceled');
        if(status==8) info = global.translateByKey('agent.coin.record.logs.obsolete');
        return info;
    };

    var format_user3 = function(params) {
        var obj = params.data.user || {};
        return obj.account||'';
    };

    var format_creator3 = function(params) {
        var obj = params.data.creator || {};
        return obj.account||global.translateByKey('agent.coin.record.logs.system');
    };

    var format_type3 = function(params) {
        var obj = params.data || {};
        var info = '';
        if(obj.type=='0') info = global.translateByKey('agent.coin.record.logs.frozen');
        if(obj.type=='1') info = global.translateByKey('agent.coin.record.logs.unfreeze');
        return info;
    };

    var columnDefs = {
        '0':[
            {headerName: "玩家账号", field: "account", width: 100, valueGetter: format_account},
            {headerName: "所属渠道", field: "agentCode", width: 100, valueGetter: format_agentCode},
            {headerName: "分发金额", field: "amount", width: 100, valueGetter: format_amount},
            {headerName: "折扣", field: "rebate", width: 70, valueGetter: format_rebate},
            {headerName: "价值T币", field: "sAmount", width: 100, valueGetter: format_sAmount},
            {headerName: "操作时间", field: "crtime", width: 200, valueGetter: $scope.angGridFormatDateS},
            {headerName: "备注", field: "memo", width: 200},
            {headerName: "操作类型", field: "type", width: 100, valueGetter: format_type}
        ],
        '1':[
            {headerName: "渠道ID", field: "agentCode", width: 100, valueGetter: format_agentCode1},
            {headerName: "渠道名", field: "agentName", width: 100, valueGetter: format_agentName1},
            {headerName: "分发渠道", field: "pagentCode", width: 100, valueGetter: format_pagentCode1},
            {headerName: "分发T币数", field: "amount", width: 100, valueGetter: format_amount1},
            {headerName: "备注", field: "memo", width: 200},
            {headerName: "操作时间", field: "crtime", width: 200, valueGetter: $scope.angGridFormatDateS},
            {headerName: "操作类型", field: "type", width: 100, valueGetter: format_type1}
        ],
        '2':[
            {headerName: "单号", field: "code", width: 200, valueGetter: format_code2},
            {headerName: "下单时间", field: "time", width: 200, valueGetter: format_time2},
            {headerName: "申购渠道", field: "agentName", width: 100, valueGetter: format_agentName2},
            {headerName: "渠道ID", field: "agentCode", width: 100, valueGetter: format_agentCode2},
            {headerName: "购买T币数", field: "amount", width: 100, valueGetter: format_amount2},
            {headerName: "支付金额", field: "cash", width: 100, valueGetter: format_cash2},
            {headerName: "操作者", field: "creator", width: 100, valueGetter: format_creator2},
            {headerName: "操作时间", field: "crtime", width: 200, valueGetter: $scope.angGridFormatDateS},
            {headerName: "操作类型", field: "type", width: 100, valueGetter: format_type2}
        ],
        '3':[
            {headerName: "用户", field: "user", width: 100, valueGetter: format_user3},
            {headerName: "操作者", field: "creator", width: 100, valueGetter: format_creator3},
            {headerName: "操作时间", field: "crtime", width: 200, valueGetter: $scope.angGridFormatDateS},
            {headerName: "操作类型", field: "type", width: 100, valueGetter: format_type3}
        ]
    };
    global.agGridTranslateSync($scope, columnDefs['0'], [                 //翻译
        'agent.coin.record.logs.header.account',
        'agent.coin.record.logs.header.agentCode',
        'agent.coin.record.logs.header.amount',
        'agent.coin.record.logs.header.rebate',
        'agent.coin.record.logs.header.valueT',
        'agent.coin.record.logs.header.crtime',
        'agent.coin.record.logs.header.memo',
        'agent.coin.record.logs.header.type',
    ]);
    global.agGridTranslateSync($scope, columnDefs['1'], [                 //翻译
        'agent.coin.record.logs.header.channel',
        'agent.coin.record.logs.header.agentName',
        'agent.coin.record.logs.header.pagentCode',
        'agent.coin.record.logs.header.amountT',
        'agent.coin.record.logs.header.memo',
        'agent.coin.record.logs.header.crtime',
        'agent.coin.record.logs.header.type',
    ]);
    global.agGridTranslateSync($scope, columnDefs['2'], [                 //翻译
        'agent.coin.record.logs.header.code',
        'agent.coin.record.logs.header.time',
        'agent.coin.record.logs.header.purchaseChannel',
        'agent.coin.record.logs.header.channel',
        'agent.coin.record.logs.header.buyT',
        'agent.coin.record.logs.header.cash',
        'agent.coin.record.logs.header.creator',
        'agent.coin.record.logs.header.crtime',
        'agent.coin.record.logs.header.type'
    ]);
    global.agGridTranslateSync($scope, columnDefs['3'], [                 //翻译
        'agent.coin.record.logs.header.user',
        'agent.coin.record.logs.header.creator',
        'agent.coin.record.logs.header.crtime',
        'agent.coin.record.logs.header.type'
    ]);


    var targetUri = {
        '0':'/userDistributeLogs',
        '1':'/agentDistributeLogs',
        '2':'/orderLogs',
        '3':'/accountLogs'
    };

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            $scope.page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate&&date.startDate.toString() || "";
            var endDate = date.endDate&&date.endDate.toString() || "";
            var router = targetUri[$scope.type];
            $http.get(agentUri+router, {
                params:{
                    token: sso.getToken(),
                    page: $scope.page,
                    rows: $scope.pageSize,
                    agent: search.agent,
                    user: search.user,
                    order: search.order,
                    type: search.type,
                    startDate: startDate,
                    endDate: endDate
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
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
        columnDefs: columnDefs[$scope.type],
        rowHeight: 30,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            //event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setColumnDefs(columnDefs[$scope.type]);
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('page', function () {
        history.page = $scope.page;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('type', function () {
        history.type = $scope.type;
    });

    //重置查询项
    $scope.resetFun = function(){
        $scope.search = {
            date: {},
            user: '',
            agent: ''
        }
    };

    $scope.searchFun = function(){
        $scope.onPageSizeChanged();
    };

    $scope.dateOptions = global.dateRangeOptions;

    $scope.onExportExcel = function() {
        var router = targetUri[$scope.type];
        var fileNames = {
            '0':'玩家日志.xls',
            '1':'渠道日志.xls',
            '2':'订单日志.xls',
            '3':'账户日志.xls'
        };
        var fileName = fileNames[$scope.type];
        window.location = agentUri+router + '?fileName='+encodeURIComponent(fileName)+'&token=' + sso.getToken();
    };
}]);


