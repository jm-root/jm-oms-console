'use strict';
var sso = jm.sdk.sso;
app.controller('BankAccountCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var history = global.bankAccountHistory||(global.bankAccountHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var bank = jm.sdk.bank;

    var format_user = function(params) {
        var user = params.data.user||{};
        return user.name || user.mobile || user.email || user.userId || '';
    };

    var format_tb = function(params) {
        var holds = params.data.holds||{};
        holds.tb = holds.tb || {};
        return holds.tb.amount || 0;
    };

    var format_tb_a = function(params) {
        var holds = params.data.holds||{};
        holds.tb = holds.tb || {};
        return holds.tb.overdraw || 0;
    };

    var format_jb = function(params) {
        var holds = params.data.holds||{};
        holds.jb = holds.jb || {};
        return holds.jb.amount || 0;
    };

    var format_jb_a = function(params) {
        var holds = params.data.holds||{};
        holds.jb = holds.jb || {};
        return holds.jb.overdraw || 0;
    };

    var format_dbj = function(params) {
        var holds = params.data.holds||{};
        holds.dbj = holds.dbj || {};
        return holds.dbj.amount || 0;
    };

    var format_dbj_a = function(params) {
        var holds = params.data.holds||{};
        holds.dbj = holds.dbj || {};
        return holds.dbj.overdraw || 0;
    };
console.log(global.translateByKey('bank.account.statusOpts.opts1'));
    var format_status = function(params) {
        var status = params.data.status;
        var info = '';
        if(status==0) info = global.translateByKey('bank.bank.account.statusOpts.opts1');
        if(status==1) info = global.translateByKey('bank.bank.account.statusOpts.opts2');
        if(status==2) info = global.translateByKey('bank.bank.account.statusOpts.opts3');
        return info || '';
    };
if(omsPlatform === pfm_oms){
    var columnDefs = [
        {headerName: "账户ID", field: "id", width: 200},
        {headerName: "用户名", field: "user", width: 120, valueGetter: format_user},
        {headerName: "T币余额", field: "tb", width: 120, valueGetter: format_tb},
        {headerName: "T币额度", field: "tb_a", width: 120, valueGetter: format_tb_a},
        {headerName: "金币余额", field: "jb", width: 120, valueGetter: format_jb},
        {headerName: "金币额度", field: "jb_a", width: 120, valueGetter: format_jb_a},
        {headerName: "夺宝卷余额", field: "dbj", width: 120, valueGetter: format_dbj},
        {headerName: "夺宝卷额度", field: "dbj_a", width: 120, valueGetter: format_dbj_a},
        {headerName: "状态", field: "status", width: 100, valueGetter: format_status},
        {headerName: "创建时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];
    global.agGridTranslateSync($scope,columnDefs,[
        'bank.account.header.id',
        'bank.account.header.user',
        'bank.account.header.tb',
        'bank.account.header.tb_a',
        'bank.account.header.jb',
        'bank.account.header.jb_a',
        'bank.account.header.dbj',
        'bank.account.header.dbj_a',
        'bank.account.header.status',
        'bank.account.header.createdAt'
    ]);
}else if(omsPlatform === pfm_cy){
    var columnDefs = [
        {headerName: "账户ID", field: "id", width: 200},
        {headerName: "用户名", field: "user", width: 120, valueGetter: format_user},
        // {headerName: "元宝余额", field: "tb", width: 100, valueGetter: format_tb},
        // {headerName: "元宝额度", field: "tb_a", width: 100, valueGetter: format_tb_a},
        {headerName: "金币余额", field: "jb", width: 120, valueGetter: format_jb},
        {headerName: "金币额度", field: "jb_a", width: 120, valueGetter: format_jb_a},
        // {headerName: "夺宝卷余额", field: "dbj", width: 100, valueGetter: format_dbj},
        // {headerName: "夺宝卷额度", field: "dbj_a", width: 100, valueGetter: format_dbj_a},
        {headerName: "状态", field: "status", width: 100, valueGetter: format_status},
        {headerName: "创建时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'bank.account.header.id',
        'bank.account.header.user',
        // 'bank.account.header.tb',
        // 'bank.account.header.tb_a',
        'bank.account.header.jb',
        'bank.account.header.jb_a',
        // 'bank.account.header.dbj',
        // 'bank.account.header.dbj_a',
        'bank.account.header.status',
        'bank.account.header.createdAt'
    ]);
}
    // var columnDefs = [
    //     {headerName: "账户ID", field: "id", width: 200},
    //     {headerName: "用户名", field: "user", width: 120, valueGetter: format_user},
    //     {headerName: "T币余额", field: "tb", width: 120, valueGetter: format_tb},
    //     {headerName: "T币额度", field: "tb_a", width: 120, valueGetter: format_tb_a},
    //     {headerName: "金币余额", field: "jb", width: 120, valueGetter: format_jb},
    //     {headerName: "金币额度", field: "jb_a", width: 120, valueGetter: format_jb_a},
    //     {headerName: "夺宝卷余额", field: "dbj", width: 120, valueGetter: format_dbj},
    //     {headerName: "夺宝卷额度", field: "dbj_a", width: 120, valueGetter: format_dbj_a},
    //     {headerName: "状态", field: "status", width: 100, valueGetter: format_status},
    //     {headerName: "创建时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
    // ];
    // global.agGridTranslateSync($scope,columnDefs,[
    //     'bank.account.header.id',
    //     'bank.account.header.user',
    //     'bank.account.header.tb',
    //     'bank.account.header.tb_a',
    //     'bank.account.header.jb',
    //     'bank.account.header.jb_a',
    //     'bank.account.header.dbj',
    //     'bank.account.header.dbj_a',
    //     'bank.account.header.status',
    //     'bank.account.header.createdAt'
    // ]);
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            bank.accounts({
                page: page,
                rows: $scope.pageSize,
                search: $scope.search
            },function(err,result){
                var data = result;
                console.info(result);
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
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
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
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
}]);

app.controller('BankTransferCtrl', ['$scope', '$state', '$http',  'global', '$timeout', function ($scope, $state, $http,  global, $timeout) {
    $scope.bank = {};
    $scope.accounts = [];
    $scope.defAccount = {user:{},holds:{}};

    var bank = jm.sdk.bank;

    global.getLocalUser().then(function(user){
        bank.isCP({},function(err,result){
            if (result.err) {
                return $scope.error(result.msg);
            }
            $scope.isCP = result.ret;
            if(!$scope.isCP){
                bank.accounts({
                    userId: user.id
                },function(err,result){
                    if (result.err) {
                        $scope.error(result.msg);
                    } else {
                        $scope.accounts = result.rows;
                        $scope.defAccount = _.find($scope.accounts, { id: $scope.accounts[0].user.accountId });
                        $scope.bank.fromAccountId = $scope.defAccount.user.accountId;
                    }
                });
            }
        });
    });
    $scope.changeAcount = function(){
        $scope.defAccount = _.find($scope.accounts, { id: $scope.bank.fromAccountId });
    };

    $scope.transfer = function(){
        var hold = $scope.defAccount.holds[$scope.bank.ctCode]||{amount:0};
        if(!$scope.isCP&&hold.amount<$scope.bank.amount){
            return $scope.error('余额不足');
        }
        bank.transfer($scope.bank,function(err,result){
            if (err) {
                $timeout(function () {
                    $scope.error(result.msg);
                });
            } else {
                $timeout(function () {
                    $scope.success('转账成功');
                    $scope.bank={};
                    $scope.nick='';
                });
            }
        });
    };
    $scope.i = 1;
    $scope.left = function () {
        if($scope.i>1){
            --$scope.i;
        }
    }
    $scope.right = function () {
        if($scope.i<$scope.pages){
            ++$scope.i;
        }
    }
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.pages = Math.ceil($scope.usersInfo.rows.length/10);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.i-1),[10*$scope.i])[$event.currentTarget.rowIndex-1];
        $scope.bank.toUserId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
    };
    $scope.$watch('bank.toUserId', function () {
        if(!$scope.bank.toUserId){
            $scope.nick = null;
        }
    });
}]);

app.controller('BankExchangeCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;

    $scope.exchange = function(){

    }
}]);

app.controller('BankDealCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var history = global.bankDealHistory||(global.bankDealHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.user = $scope.search.user || '';

    var bank = jm.sdk.bank;

    var format_ctName = function(params) {
        var ctName = params.data.ctName;
        return ctName || '';
    };
    var format_flag = function(params) {
        var flag = params.data.flag || 0;
        var info = '收入';
        if(flag!=0){
            info='支出';
        }
        return info;
    };

    var format_userid = function(params) {
        var flag = params.data.flag || 0;
        var user;
        if(flag){
            user = params.data.fromUserId;
        }else{
            user = params.data.toUserId;
        }

        return user||'';
    };

    var format_user = function(params) {
        var flag = params.data.flag || 0;
        var user;
        if(flag){
            user = params.data.fromUserName;
        }else{
            user = params.data.toUserName;
        }

        return user||'';
    };

    var columnDefs = [
        {headerName: "用户ID", field: "user", width: 200, valueGetter: format_userid},
        {headerName: "用户名", field: "user", width: 120, valueGetter: format_user},
        {headerName: "币种", field: "ctName", width: 120, valueGetter: format_ctName},
        {headerName: "交易标记", field: "flag", width: 120, valueGetter: format_flag},
        {headerName: "金额", field: "amount", width: 120},
        {headerName: "时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'bank.bank.deal.header.userId',
        'bank.bank.deal.header.user',
        'bank.bank.deal.header.ctName',
        'bank.bank.deal.header.flag',
        'bank.bank.deal.header.amount',
        'bank.bank.deal.header.createdAt'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            bank.history({
                page: page,
                rows: $scope.pageSize
            },function(err,result){
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
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
        onCellDoubleClicked: function(cell){
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
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
}]);

app.controller('BankPreauthCtrl', ['$scope', '$state', '$http','$timeout', 'global', function ($scope, $state, $http, $timeout, global) {
    var history = global.bankPreauthHistory||(global.bankPreauthHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var bank = jm.sdk.bank;

    var format_user = function(params) {
        var hold = params.data.Hold||{};
        var account = hold.Account||{};
        var user = account.User||{};
        return user.name || user.mobile || user.email || user.userId || '';
    };

    var format_control = function(params) {
        var user = params.data.User||{};
        return user.name || user.mobile || user.email || user.userId || '';
    };

    var format_ct = function(params) {
        var hold = params.data.Hold||{};
        var ct = hold.CT||{};
        return ct.name||'';
    };


    var columnDefs = [
        {headerName: "授权者", field: "user", width: 120, valueGetter: format_user},
        {headerName: "操作者", field: "control", width: 120, valueGetter: format_control},
        {headerName: "币种", field: "ct", width: 100, valueGetter: format_ct},
        {headerName: "数量", field: "amount", width: 120},
        {headerName: "创建时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "#", width: 100, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'bank.bank.preauth.header.user',
        'bank.bank.preauth.header.control',
        'bank.bank.preauth.header.ct',
        'bank.bank.preauth.header.amount',
        'bank.bank.preauth.header.createdAt'
    ]);

    var ok = true;
    $scope.npreauth = function(data){
        if(!ok) return;
        ok = false;
        var hold = data.Hold||{};
        var account = hold.Account||{};
        var user = account.User||{};
        var ct = hold.CT||{};
        var creator = data.User||{};
        var req = {
            createId:creator.userId,
            userId:user.userId,
            ctCode:ct.code,
            allAmount:true
        };
        bank.preauthCancel(req,function(err,result){
            ok = true;
            $timeout(function () {
                if (err) {
                    $scope.error(result.msg||err);
                } else {
                    $scope.success('取消成功');
                    $scope.onPageSizeChanged();
                }
            });
        });
    };

    function opr_render(params){
        return '<button class="btn btn-xs bg-primary m-r-xs" ng-click="npreauth(data)">取消授权</button>';
    }

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            bank.preauthList({
                page: page,
                rows: $scope.pageSize,
                search: $scope.search
            },function(err,result){
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
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
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
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
}]);

app.controller('BankNPreauthCtrl', ['$scope', '$state', '$http','global', '$timeout', function ($scope, $state, $http,global, $timeout) {
    $scope.bank = {};
    $scope.defAccount = {user:{},holds:{}};
    $scope.lock = '';

    var bank = jm.sdk.bank;

    var ct = {
        'tb': 'T币',
        'jb': '金币',
        'dbj': '夺宝卷'
    };

    var findAccounts = function(){
        bank.query({
            token: sso.getToken(),
            userId: $scope.bank.userId
        },function(err,result){
            if (result.err) {
                $scope.error(result.msg);
            } else {
                $timeout(function(){
                    $scope.defAccount = result||{};
                    var holds = $scope.defAccount.holds || {};
                    var ary = [];
                    for(var key in holds){
                        var amountLocked = holds[key].amountLocked;
                        if(amountLocked){
                            var str = ct[key]+':'+amountLocked;
                            ary.push(str);
                        }
                    }
                    $scope.lock = ary.join('; ');
                });
            }
        });
    };

    $scope.npreauth = function(){
        if(!$scope.lock){
            return $scope.error('无需取消');
        }
        bank.preauthCancel($scope.bank,function(err,result){
            $timeout(function () {
                if (err) {
                    $scope.error(result.msg||err);
                } else {
                    $scope.success('取消成功');
                }
            });
        });
    };

    $scope.setAll = function(){
        if($scope.bank.allAmount=='1'){
            var holds = $scope.defAccount.holds || {};
            if(holds[$scope.bank.ctCode]){
                $scope.bank.amount = holds[$scope.bank.ctCode].amountLocked;
            }
        }
    };

    $scope.selectCT = function(){
        $scope.bank.allAmount = null;
        $scope.bank.amount = null;
    };
    $scope.i = 1;
    $scope.left = function () {
        if($scope.i>1){
            --$scope.i;
        }
    };
    $scope.right = function () {
        if($scope.i<$scope.pages){
            ++$scope.i;
        }
    };
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.pages = Math.ceil($scope.usersInfo.rows.length/10);;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.i-1),[10*$scope.i])[$event.currentTarget.rowIndex-1];
        $scope.bank.userId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
        findAccounts();
    };
    $scope.$watch('bank.userId', function () {
        if(!$scope.bank.userId){
            $scope.nick = null;
        }
    });
}]);

app.controller('BankOverdrawCtrl', ['$scope', '$state', '$http', 'global', '$timeout', function ($scope, $state, $http, global, $timeout) {
    $scope.bank = {};

    $scope.overdraw = function(){
        $http.post(bankUri+'/overdraw', $scope.bank, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $scope.bank = {};
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.page = 1;
    $scope.left = function () {
        if($scope.page>1){
            --$scope.page;
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++$scope.page;
        }
    };
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.pages = Math.ceil($scope.usersInfo.rows.length/10);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.page-1),[10*$scope.page])[$event.currentTarget.rowIndex-1];
        $scope.bank.userId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
    };
    $scope.$watch('bank.userId', function () {
        if(!$scope.bank.userId){
            $scope.nick = null;
        }
    });
}]);

app.controller('CurrencyCtrl', ['$scope', '$state', '$http','global',function ($scope, $state, $http,global) {
    $scope.currency = {};
    $http.get(adminUri+'/currencys', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.currencys = result.rows;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.selectCurrency = function(currency){
        angular.forEach($scope.currencys, function(currency) {
            currency.selected = false;
        });
        $scope.curCurrency = currency;
        $scope.curCurrency.selected = true;
        $scope.curRate = {from:currency.code};
    };

    $scope.deleteCurrency = function(role){
        $scope.openTips({
            title:'提示',
            content:'是否确认删除当前币种?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                $http.delete(adminUri+'/currencys', {
                    params:{
                        token: sso.getToken(),
                        code: role.code
                    }
                }).success(function(result) {
                    if(result.err){
                        return $scope.error(result.msg);
                    }
                    $scope.currencys = result.rows;
                    $scope.success('操作成功');
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    $scope.isCollapsed = true;
    $scope.change = function(id){
        $scope.isCollapsed = !$scope.isCollapsed;
        if($scope.isCollapsed){
            $scope.ebtnname='新增';
        }else{
            $scope.ebtnname='取消';
        }
    };

    $scope.enter = function(){
        $scope.isCollapsed = true;
        $scope.ebtnname='新增';
        $http.post(adminUri+'/currencys', $scope.currency, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.currencys = result.rows;
            $scope.success('操作成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.rates = [];
    $scope.curRate = {};

    $http.get(adminUri+'/rates', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.rates = result.rows;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.selectRate = function(rate){
        angular.forEach($scope.rates, function(rate) {
            rate.selected = false;
        });
        $scope.curRate = rate;
        $scope.curRate.selected = true;
    };

    $scope.add = function(){
        if(!$scope.curRate.from){
            return $scope.error('请选择以什么币种兑换');
        }
        $http.post(adminUri+'/rates', $scope.curRate, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.rates = result.rows;
            $scope.success('操作成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.deleteRate = function(rate){
        $scope.openTips({
            title:'提示',
            content:'是否确认删除当前兑换比例?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                $http.delete(adminUri+'/rates', {
                    params:{
                        token: sso.getToken(),
                        key: rate.from+':'+rate.to
                    }
                }).success(function(result) {
                    if(result.err){
                        return $scope.error(result.msg);
                    }
                    $scope.rates = result.rows;
                    $scope.success('操作成功');
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };
}]);

app.controller('AccountPayListCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var history = global.accountPayListHistory||(global.accountPayListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    var url = payUri+'/payss';

    $scope.dateOptions = global.dateRangeOptions;

    var format_channel = function(params) {
        var obj = params.data || {};
        var info = obj.channel;
        if(obj.channel=='platform'||obj.channel=='') info='平台';
        if(obj.currency=='swiftpass') info='威富通';
        if(obj.currency=='pingxx') info='pingxx';
        if(obj.currency=='wechat') info='微信';
        if(obj.currency=='alipay') info='支付宝';
        return info;
    };

    var format_currency = function(params) {
        var obj = params.data || {};
        var info = '未知';
        if(obj.currency=='cny') info='人民币';
        if(obj.currency=='tb') info='元宝';
        if(obj.currency=='jb') info='金币';
        if(obj.currency=='dbj') info='夺宝卷';
        return info;
    };

    var format_status = function(params) {
        var obj = params.data || {};
        var info = '未知';
        if(obj.status==0) info='未付';
        if(obj.status==1) info='已付';
        return info;
    };

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 200},
        {headerName: "单号", field: "code", width: 150},
        {headerName: "支付用户", field: "user", width: 200},
        {headerName: "渠道", field: "channel", width: 120, valueGetter: format_channel},
        {headerName: "标题", field: "title", width: 150},
        {headerName: "详情", field: "content", width: 150},
        {headerName: "币种", field: "currency", width: 120, valueGetter: format_currency},
        {headerName: "数量", field: "amount", width: 120},
        {headerName: "状态", field: "status", width: 100, valueGetter: format_status},
        {headerName: "备注", field: "note", width: 150},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
       'bank.account.paylist.header._id',
        'bank.account.paylist.header.code',
        'bank.account.paylist.header.user',
        'bank.account.paylist.header.channel',
        'bank.account.paylist.header.title',
        'bank.account.paylist.header.content',
        'bank.account.paylist.header.currency',
        'bank.account.paylist.header.amount',
        'bank.account.paylist.header.status',
        'bank.account.paylist.header.note',
        'bank.account.paylist.header.crtime'
    ]);
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = search.keyword;
            var currency = search.currency;
            var status = search.status;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    status: status,
                    currency: currency,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    data.rows = data.rows || [];
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
        rowHeight: 30,
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
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

    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });
}]);