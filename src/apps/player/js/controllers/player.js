'use strict';
app.controller('PlayerListCtrl', ['$scope', '$state', '$http', 'global', '$timeout', function ($scope, $state, $http, global, $timeout) {
    var history = global.playerListHistory||(global.playerListHistory={});
    var sso = jm.sdk.sso;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    $scope.stat = {};
    var url = statUri+'/players';

    $scope.dateOptions = global.dateRangeOptions;

    if(plat === 'PC'){
        $scope.hides = true;
    }else if(plat === 'Mobile'){
        $scope.hides = false;
    }

    var bank = jm.sdk.bank;

    var format_agent = function(params) {
        var obj = params.data.agent || {};
        return obj.name||'官方';
    };

    var format_level = function(params) {
        var obj = params.data.member || {};
        return obj.level||0;
    };

    var format_tb = function(params) {
        var obj = params.data.defAccount || {};
        obj.holds = obj.holds || {};
        var o = obj.holds['tb']||{};
        params.data.tb = o.amount;
        return o.amount||0;
    };

    var format_jb = function(params) {
        console.log(arguments);
        var obj = params.data.defAccount || {};
        obj.holds = obj.holds || {};
        var o = obj.holds['jb']||{};
        return o.amount||0;
    };

    var format_dbj = function(params) {
        var obj = params.data.defAccount || {};
        obj.holds = obj.holds || {};
        var o = obj.holds['dbj']||{};
        return o.amount||0;
    };

    var format_cny = function(params) {
        var obj = params.data.record || {};
        return obj['cny']*0.01||0;
    };

    var format_winjb = function(params) {
        var obj = params.data.record || {};
        return obj['win_jb']||0;
    };

    var format_jbamount = function(params) {
        var obj = params.data.record || {};
        return obj['expend_jb']||0;
    };

    var format_jbamount_d = function(params) {
        var obj = params.data.record || {};
        return obj['gain_jb']||0;
    };

    $scope.goto = function(data){
        $state.go('app.player.info.games' , {id: data._id,name:data.nick});
    };

    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="goto(data)">详情</button>';
    }

    function active_render(params){
        return '<label class="i-checks i-checks-sm">'+
            '<input type="checkbox" ng-model="data.active" ng-change="activeChange(data)"><i></i>'+
            '</label>';
    }
    function uid_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="goto(data)">{{data.uid}}</a>';
    }
    function account_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="goto(data)">{{data.account}}</a>';
    }
    function nick_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="onPageSizeChanged(data.nick)">{{data.nick}}</a>';
    }
    function ip_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="onPageSizeChanged(data.ip)">{{data.ip}}</a>';
    }

    $scope.activeChange = function(data){
        $http.post(ssoUri+'/users/'+data._id, {active:data.active}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    if(plat === 'PC'){
        var columnDefs = [
            {headerName: "所属渠道", field: "agent", width: 100, valueGetter: format_agent},
            {headerName: "玩家ID", field: "uid", width: 100, cellRenderer: uid_render},
            {headerName: "账号", field: "account", width: 100, cellRenderer: account_render},
            {headerName: "手机", field: "mobile", width: 100},
            {headerName: "昵称", field: "nick", width: 100, cellRenderer: nick_render},
            {headerName: "VIP等级", field: "level", width: 80, valueGetter: format_level},
            {headerName: "mac地址", field: "mac", width: 100},
            {headerName: "IP", field: "ip", width: 100, cellRenderer: ip_render},
            {headerName: "元宝", field: "tb", width: 100, cellStyle:{'color':'#0000CC','cursor':'pointer'},editable: true},
            {headerName: "金币", field: "jb", width: 80, cellStyle:{'color':'#0000CC','cursor':'pointer'},editable: true},
            {headerName: "夺宝卷", field: "dbj", width: 80, cellStyle:{'color':'#0000CC','cursor':'pointer'},editable: true},
            {headerName: "充值", field: "cny", width: 80, valueGetter: format_cny},
            {headerName: "点卡充值", field: "card", width: 100},
            {headerName: "历史最高金币", field: "win_jb", width: 115, valueGetter: format_winjb},
            {headerName: "累计消耗金币", field: "jbamount", width: 115, valueGetter: format_jbamount},
            {headerName: "当天游戏总输赢", field: "jbamount_d", width: 135, valueGetter: format_jbamount_d},
            {headerName: "注册时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
            {headerName: "封停/解封", field: "active", width: 100, cellRenderer: active_render, cellStyle:{'text-align':'center'}},
            {headerName: "各游戏累计输赢", width: 150, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
        ];

        global.agGridTranslateSync($scope, columnDefs, [                 //翻译
            'player.info.list.header.agent',
            'player.info.list.header.uid',
            'player.info.list.header.account',
            'player.info.list.header.mobile',
            'player.info.list.header.nick',
            'player.info.list.header.level',
            'player.info.list.header.mac',
            'player.info.list.header.ip',
            'player.info.list.header.tb',
            'player.info.list.header.jb',
            'player.info.list.header.dbj',
            'player.info.list.header.cny',
            'player.info.list.header.card',
            'player.info.list.header.win_jb',
            'player.info.list.header.jbamount',
            'player.info.list.header.jbamount_d',
            'player.info.list.header.crtime',
            'player.info.list.header.active',
            'player.info.list.header.ctrl'
        ]);
    }else if(plat === 'Mobile'){
        var columnDefs = [
            {headerName: "封停/解封", field: "active", width: 100, cellRenderer: active_render, cellStyle:{'text-align':'center'}},
            {headerName: "各游戏累计输赢", width: 150, cellRenderer: opr_render, cellStyle:{'text-align':'center'}},
            {headerName: "玩家ID", field: "uid", width: 100, cellRenderer: uid_render},
            {headerName: "账号", field: "account", width: 100, cellRenderer: account_render},
            {headerName: "所属渠道", field: "agent", width: 100, valueGetter: format_agent},
            {headerName: "昵称", field: "nick", width: 100, cellRenderer: nick_render},
            {headerName: "IP", field: "ip", width: 100, cellRenderer: ip_render},
            {headerName: "金币", field: "jb", width: 80, cellStyle:{'color':'#0000CC','cursor':'pointer'},editable: true},
            {headerName: "充值", field: "cny", width: 80, valueGetter: format_cny},
            {headerName: "历史最高金币", field: "win_jb", width: 115, valueGetter: format_winjb},
            {headerName: "累计消耗金币", field: "jbamount", width: 115, valueGetter: format_jbamount},
            {headerName: "当天游戏总输赢", field: "jbamount_d", width: 135, valueGetter: format_jbamount_d},
            {headerName: "注册时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS}

        ];

        global.agGridTranslateSync($scope, columnDefs, [                 //翻译
            'player.info.list.header.active',
            'player.info.list.header.ctrl',
            'player.info.list.header.uid',
            'player.info.list.header.account',
            'player.info.list.header.agent',
            'player.info.list.header.nick',
            'player.info.list.header.ip',
            'player.info.list.header.jb',
            'player.info.list.header.cny',
            'player.info.list.header.win_jb',
            'player.info.list.header.jbamount',
            'player.info.list.header.jbamount_d',
            'player.info.list.header.crtime'

        ]);
    }

    var dataSource = {
        //pageSize: Number($scope.pageSize),
        getRows: function (params) {
            global.agGridOverlay();   //翻译

            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = search.keyword;
            var active = search.active;
            var type = search.type;
            var agent = search.agent;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    active: active,
                    type: type,
                    agent: agent,
                    isPlayer: true,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rows = data.rows || [];
                    rows.forEach(function(item){
                        var obj = item.defAccount || {};
                        obj.holds = obj.holds || {};
                        var tb = obj.holds['tb']||{};
                        var jb = obj.holds['jb']||{};
                        var dbj = obj.holds['dbj']||{};
                        item.tb = tb.amount||0;
                        item.jb = jb.amount||0;
                        item.dbj = dbj.amount||0;
                    });
                    var rowsThisPage = rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function(msg, code){
                $scope.errorTips(code);
            });
        }
    };

    var oldVal,newVal;

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
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                var field = cell.colDef.field;
                var coin = ['tb','jb','dbj'];
                if(coin.indexOf(field)!=-1) return;
                $state.go('app.player.info.games' , {id: cell.data._id,name:cell.data.nick});
            }
        },
        onCellDoubleClicked: function(cell){
            var field = cell.colDef.field;
            var coin = ['tb','jb','dbj'];
            if(coin.indexOf(field)!=-1) return;
            $state.go('app.player.info.games' , {id: cell.data._id,name:cell.data.nick});
        },
        onCellValueChanged: function(event) {
            if(isNaN(event.newValue)){
                event.data[event.colDef.field] = event.oldValue;
            }
        },
        onCellEditingStarted: function (event) {
            oldVal = event.value;
        },
        onCellEditingStopped: function (event) {
            console.log(event);
            newVal = event.value;
            if(oldVal!=newVal){
                $scope.updateData(event);
            }
        }
    };

    $scope.onPageSizeChanged = function(keyword) {
        keyword&&($scope.search.keyword = keyword);
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

    $http.get(statUri+'/multiple', {
        params:{
            token: sso.getToken(),
            fields:{user_total:1,user_yesterday:1,user_today:1,user_guest:1,user_mobile:1,user_wechat:1,user_qq:1}
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.stat = obj||{};
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $http.get(agentUri + '/subAgents', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.agents = result.rows;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });

    $scope.updateData = function(event){
        var ctCode = event.colDef.field;
        var ct = {
            'tb':'元宝',
            'jb':'金币',
            'dbj':'夺宝卷'
        };
        var amount = Number(event.value)-Number(oldVal);
        var data = event.data;
        var fromUserId,toUserId,info;
        if(amount>=0){
            info = '是否给账号【'+data.account+'】充'+amount+ct[ctCode];
            fromUserId = sso.user.id;
            toUserId = data._id;
        }else{
            info = '是否扣除账号【'+data.account+'】'+Math.abs(amount)+ct[ctCode];
            fromUserId = data._id;
            toUserId = sso.user.id;
        }


        $scope.openTips({
            title:'更新账目',
            content: info,
            okTitle:'确定',
            cancelTitle:'取消',
            okCallback: function($s){
                var o = {
                    ctCode:ctCode,
                    amount:Math.abs(amount),
                    fromUserId:fromUserId,
                    toUserId:toUserId
                };
                bank.transfer(o,function(err,result){
                    if (err) {
                        $timeout(function () {
                            $scope.error(result.msg);
                        });
                    } else {
                        $timeout(function () {
                            $scope.success('操作成功');
                        });
                    }
                });
            },
            cancelCallback: function(){
                event.data[ctCode] = oldVal;
                $scope.gridOptions.api.refreshView();
            }
        });
    }

}]);

app.controller('PlayerGamesListCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', function ($scope, $state, $stateParams, $http, global) {
    var sso = jm.sdk.sso;
    var history = global.playerGamesListHistory||(global.playerGamesListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    var id = $stateParams.id;
    $scope.playerName = $stateParams.name;
    var url = statUri+'/players/'+id+'/gameStat';


    var columnDefs = [
        {headerName: "游戏名称", field: "name", width: 120},
        {headerName: "游戏局数", field: "count", width: 100},
        {headerName: "游戏总输赢", field: "gain_jb", width: 120},
        {headerName: "今日总输赢", field: "gain_day_jb", width: 120},
        {headerName: "总获取夺宝卷", field: "gain_dbj", width: 120}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'player.info.games.header.name',
        'player.info.games.header.count',
        'player.info.games.header.gain_jb',
        'player.info.games.header.gain_day_jb',
        'player.info.games.header.gain_dbj'
    ]);
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize
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
        headerCellRenderer:global.agGridHeaderCellRendererFunc,
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
}]);

app.controller('PlayerOnlineCtrl', ['$scope', '$state', '$http', '$interval', 'global', function ($scope, $state, $http, $interval, global) {
    var sso = jm.sdk.sso;
    var history = global.playerOnlineHistory||(global.playerOnlineHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';
    var url = recordUri+'/onlines';

    var t = $interval(function(){
        $scope.onPageSizeChanged();
    }, 10000);
    $scope.$on("$destroy", function(){
        $interval.cancel(t);
    });

    if(plat === 'PC'){
        $scope.hides = true;
    }else if(plat === 'Mobile'){
        $scope.hides = false;
    }

    var format_uid = function(params) {
        var obj = params.data.user || {};
        return obj.uid||'';
    };

    var format_nick = function(params) {
        var obj = params.data.user || {};
        return obj.nick||'';
    };

    var format_appname = function(params) {
        var obj = params.data.app || {};
        return obj.name||'';
    };

    var format_tb = function(params) {
        var obj = params.data.hold || {};
        return obj.tb||0;
    };

    var format_jb = function(params) {
        var obj = params.data.hold || {};
        return obj.jb||0;
    };

    var format_dbj = function(params) {
        var obj = params.data.hold || {};
        return obj.dbj||0;
    };
    var format_channel = function(params) {
        var obj = params.data || {};
        return obj.channel;
    };

    if(plat === 'PC'){
        var columnDefs = [
            {headerName: "玩家ID", field: "uid", width: 100, valueGetter: format_uid},
            {headerName: "昵称", field: "nick", width: 150, valueGetter: format_nick},
            {headerName: "游戏名称", field: "appname", width: 200, valueGetter: format_appname},
            {headerName: "房间号", field: "areaId", width: 80},
            {headerName: "房间类型", field: "areaType", width: 150},
            {headerName: "元宝", field: "tb", width: 100, valueGetter: format_tb},
            {headerName: "金币", field: "jb", width: 100, valueGetter: format_jb},
            {headerName: "夺宝卷", field: "dbj", width: 100, valueGetter: format_dbj},
            {headerName: "设备", field: "device", width: 100},
            {headerName: "渠道", field: "channel", width: 100,valueGetter: format_channel}
        ];

        global.agGridTranslateSync($scope, columnDefs, [
            'player.info.online.header.uid',
            'player.info.online.header.nick',
            'player.info.online.header.appname',
            'player.info.online.header.areaId',
            'player.info.online.header.areaType',
            'player.info.online.header.tb',
            'player.info.online.header.jb',
            'player.info.online.header.dbj',
            'player.info.online.header.device',
            'player.info.online.header.channel'
        ]);
    }else if(plat === 'Mobile'){
        var columnDefs = [
            {headerName: "玩家ID", field: "uid", width: 100, valueGetter: format_uid},
            {headerName: "昵称", field: "nick", width: 150, valueGetter: format_nick},
            {headerName: "游戏名称", field: "appname", width: 200, valueGetter: format_appname},
            {headerName: "房间号", field: "areaId", width: 80},
            {headerName: "房间类型", field: "areaType", width: 150},
            {headerName: "金币", field: "jb", width: 100, valueGetter: format_jb},
            {headerName: "渠道", field: "channel", width: 100,valueGetter: format_channel}
        ];

        global.agGridTranslateSync($scope, columnDefs, [
            'player.info.online.header.uid',
            'player.info.online.header.nick',
            'player.info.online.header.appname',
            'player.info.online.header.areaId',
            'player.info.online.header.areaType',
            'player.info.online.header.jb',
            'player.info.online.header.channel'
        ]);
    }

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();


            var search = $scope.search;
            var agent = search.agent;
            var page = params.startRow / $scope.pageSize + 1;

            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    agent: agent,
                    rows: $scope.pageSize,
                    search: $scope.search.content
                }
            }).success(function (result) {
                var data = result;
                console.log(result);
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
        headerCellRenderer:global.agGridHeaderCellRendererFunc,
        onRowDataChanged:function (cell) {
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
    $http.get(agentUri + '/subAgents', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        console.log(result);
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.agents = result.rows;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });
}]);

app.controller('PlayerRecordCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    global.playerRecordHistory || (global.playerRecordHistory = {});
    var history = global.playerRecordHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    var url = recordUri+'/gameovers';

    if(plat === 'PC'){
        $scope.hides = true;
    }else if(plat === 'Mobile'){
        $scope.hides = false;
    }

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.timePicker = true;
    $scope.dateOptions.timePicker24Hour = true;
    $scope.dateOptions.locale.format = "YYYY/MM/DD HH:mm";
    $scope.dateOptions.opens = 'center';

    var format_uid = function(params) {
        var obj = params.data.user || {};
        return obj.uid||'';
    };

    var format_nick = function(params) {
        var obj = params.data.user || {};
        return obj.nick||'';
    };

    var format_appname = function(params) {
        var obj = params.data.app || {};
        return obj.name||'';
    };

    var format_prejb = function(params) {
        var obj = params.data.onHold || {};
        return obj.jb||0;
    };

    var format_bkjb = function(params) {
        var obj = params.data.offHold || {};
        return obj.jb||0;
    };

    var format_changejb = function(params) {
        var onHold = params.data.onHold || {};
        var offHold = params.data.offHold || {};
        return offHold.jb - onHold.jb||0;
    };

    var format_time = function(params) {
        var obj = params.data || {};
        var start = moment(obj.onTime).valueOf();
        var end = moment(obj.offTime).valueOf();
        return Math.round((end-start)*0.001)+'秒';
    };

    if(plat === 'PC'){
        var columnDefs = [
            {headerName: "玩家ID", field: "uid", width: 100, valueGetter: format_uid},
            {headerName: "昵称", field: "nick", width: 150, valueGetter: format_nick},
            {headerName: "游戏名称", field: "appname", width: 200, valueGetter: format_appname},
            {headerName: "房间号", field: "areaId", width: 80},
            {headerName: "房间类型", field: "areaType", width: 150},
            {headerName: "开始前金币", field: "prejb", width: 120, valueGetter: format_prejb},
            {headerName: "结束后金币", field: "bkjb", width: 120, valueGetter: format_bkjb},
            {headerName: "输赢金币", field: "changejb", width: 100, valueGetter: format_changejb},
            {headerName: "设备", field: "device", width: 100},
            {headerName: "渠道", field: "channel", width: 100},
            {headerName: "游戏时长", field: "time", width: 100, valueGetter: format_time},
            {headerName: "开始时间", field: "onTime", width: 145, valueGetter: $scope.angGridFormatDateS},
            {headerName: "结束时间", field: "offTime", width: 145, valueGetter: $scope.angGridFormatDateS}
        ];

        global.agGridTranslateSync($scope, columnDefs, [
            'player.record.header.uid',
            'player.record.header.nick',
            'player.record.header.appname',
            'player.record.header.areaId',
            'player.record.header.areaType',
            'player.record.header.prejb',
            'player.record.header.bkjb',
            'player.record.header.changejb',
            'player.record.header.device',
            'player.record.header.channel',
            'player.record.header.time',
            'player.record.header.onTime',
            'player.record.header.offTime'
        ]);
    }else if(plat === 'Mobile'){
        var columnDefs = [
            {headerName: "玩家ID", field: "uid", width: 100, valueGetter: format_uid},
            {headerName: "昵称", field: "nick", width: 150, valueGetter: format_nick},
            {headerName: "游戏名称", field: "appname", width: 200, valueGetter: format_appname},
            {headerName: "房间号", field: "areaId", width: 80},
            {headerName: "房间类型", field: "areaType", width: 150},
            {headerName: "开始前金币", field: "prejb", width: 120, valueGetter: format_prejb},
            {headerName: "结束后金币", field: "bkjb", width: 120, valueGetter: format_bkjb},
            {headerName: "输赢金币", field: "changejb", width: 100, valueGetter: format_changejb},
            {headerName: "渠道", field: "channel", width: 100},
            {headerName: "游戏时长", field: "time", width: 100, valueGetter: format_time},
            {headerName: "开始时间", field: "onTime", width: 145, valueGetter: $scope.angGridFormatDateS},
            {headerName: "结束时间", field: "offTime", width: 145, valueGetter: $scope.angGridFormatDateS}
        ];

        global.agGridTranslateSync($scope, columnDefs, [
            'player.record.header.uid',
            'player.record.header.nick',
            'player.record.header.appname',
            'player.record.header.areaId',
            'player.record.header.areaType',
            'player.record.header.prejb',
            'player.record.header.bkjb',
            'player.record.header.changejb',
            'player.record.header.channel',
            'player.record.header.time',
            'player.record.header.onTime',
            'player.record.header.offTime'
        ]);
    }

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = search.keyword;
            var gamename = search.gamename;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    isEnd: true,
                    startDate: startDate.toString(),
                    endDate: endDate.toString(),
                    appid:gamename
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
    $http.get(appMgrUri+'/apps', {
        params:{
            token: sso.getToken(),
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.apps =obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });
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

app.controller('PlayerGiveLogCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var history = global.playerGiveLogHistory||(global.playerGiveLogHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    var url = recordUri+'/giveLogs';

    $scope.dateOptions = global.dateRangeOptions;

    var format_fromUserId = function(params) {
        var obj = params.data.fromUser || {};
        return obj.uid||'';
    };

    var format_fromUser = function(params) {
        var obj = params.data.fromUser || {};
        return obj.nick||'';
    };

    var format_toUserId = function(params) {
        var obj = params.data.toUser || {};
        return obj.uid||'';
    };

    var format_toUser = function(params) {
        var obj = params.data.toUser || {};
        return obj.nick||'';
    };

    var format_type = function(params) {
        var obj = params.data.content||{};
        return obj.name;
    };

    var format_origin = function(params) {
        var type = params.data.origin;
        var info = '未知';
        if(type==0) info = '背包';
        if(type==1) info = '签到';
        if(type==2) info = '邮件';
        return info;
    };

    var columnDefs = [
        {headerName: "ID", field: "_id", width: 150},
        {headerName: "赠送ID", field: "fromUserId", width: 100, valueGetter: format_fromUserId},
        {headerName: "赠送者", field: "fromUser", width: 150, valueGetter: format_fromUser},
        {headerName: "受赠ID", field: "toUserId", width: 100, valueGetter: format_toUserId},
        {headerName: "受赠者", field: "toUser", width: 150, valueGetter: format_toUser},
        {headerName: "道具类型", field: "type", width: 150, valueGetter: format_type},
        {headerName: "道具数量", field: "amount", width: 100},
        {headerName: "获得途径", field: "origin", width: 100, valueGetter: format_origin},
        {headerName: "手续费", field: "fee", width: 80},
        {headerName: "赠送时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'player.givelog.header._id',
        'player.givelog.header.fromUserId',
        'player.givelog.header.fromUser',
        'player.givelog.header.toUserId',
        'player.givelog.header.toUser',
        'player.givelog.header.type',
        'player.givelog.header.amount',
        'player.givelog.header.origin',
        'player.givelog.header.fee',
        'player.givelog.header.crtime'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = $scope.search.keyword;
            var type = $scope.search.type;
            var prop = $scope.search.prop;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    type: type,
                    propid: prop,
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

    $http.get(propUri+'/props', {
        params:{
            token: sso.getToken(),
            fields: {name:1}
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.props = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });
}]);

app.controller('PlayerChangeScoreCtrl', ['$scope', '$state', '$http', 'global', '$timeout', function ($scope, $state, $http, global, $timeout) {
    var sso = jm.sdk.sso;
    $scope.player = {};
    $scope.bank = {};
    $scope.data = {};
    // $scope.device = "mobile";
    $scope.device = "PC";

    $scope.url="";
    var reg = function (data) {
        return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    };
    jm.sdk.init({uri: gConfig.sdkHost});
    var bank = jm.sdk.bank;
    bank.query({},function(err,result){
        result || (result||{});
        var holds = result.holds||{};
        var jbObj = holds.jb || {};
        $scope.jb = reg(jbObj.amountValid||0);
    });

    $scope.operate = function (type) {
        if(type == 1){
            $scope.sum = $scope.player.jb + $scope.bank.amount;
        }else if(type == 2){
            $scope.sum = $scope.player.jb - $scope.bank.amount;
        }else {
            $scope.sum = $scope.player.jb;
        };
    };
    $scope.page = 1;
    $scope.left = function (keyword) {
        if($scope.page>1){
            $scope.page = $scope.page - 1;
            $scope.searchUser(keyword);
        }
    }
    $scope.right = function (keyword) {
        if($scope.page<$scope.pages){
            $scope.page = $scope.page + 1;
            $scope.searchUser(keyword);
        }
    };

    $scope.searchUser = function(keyword){
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
    };

    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows[$event.currentTarget.rowIndex-1];
        $scope.player.toUserId = $scope.selectRow.uid;
        $scope.nick = $scope.selectRow.nick;
        bank.query({userId:$scope.player.toUserId},function(err,result){
            result || (result||{});
            var holds = result.holds||{};
            var jbObj = holds.jb || {};
            $scope.player.jb = jbObj.amount||0;
        });
    };
    $scope.$watch('player.toUserId', function () {
        if(!$scope.player.toUserId){
            $scope.nick = null;
        }
    });
    $scope.inputsearch = function () {
        if($scope.player.toUserId) {
            $scope.page = 1;
            $scope.searchUser($scope.player.toUserId);
        }else {
            $scope.searchUser($scope.player);
        }
    }
    $scope.moselectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows[$event.currentTarget.rowIndex-1];
        $scope.uid = $scope.selectRow.uid;
        $scope.nick = $scope.selectRow.nick;
        $scope.player.toUserId = $scope.selectRow._id;
        bank.query({userId:$scope.player.toUserId},function(err,result){
            result || (result||{});
            var holds = result.holds||{};
            var jbObj = holds.jb || {};
            $scope.player.jb = jbObj.amount||0;
        });
        $state.go('^');
    };

    $scope.mobilesearch = function (keyword) {
        if(keyword) {
            $scope.page = 1;
            $scope.searchUser(keyword);
        }else {
            $scope.searchUser();
        }
    }

    $scope.updateData = function(event,type){
        var data = $scope.selectRow;
        var account = data.nick||data.account||data.uid;
        var ct = {'jb':global.translateByKey('common.jb')};
        var amount = $scope.bank.amount;
        var fromUserId,toUserId,info;
        var memo = $scope.bank.memo||"";
        if(type == 1){
            info = global.translateByKey('player.info.transferTip.add',{val:account})+amount+ct["jb"];
            fromUserId = sso.user.id;
            toUserId = data._id;
        }else if(type == 2){
            info = global.translateByKey('player.info.transferTip.deduct',{val:account})+amount+ct["jb"];
            fromUserId = data._id;
            toUserId = sso.user.id;
        }
        if($scope.sum<0){
            $scope.openTips({
                title: global.translateByKey('openTips.title'),
                content: global.translateByKey('player.info.TipInfo.balance'),
                cancelTitle: global.translateByKey('openTips.cancelDelContent'),
                singleButton: true
            });
        }else{
            $scope.openTips({
                title:global.translateByKey('player.info.TipInfo.title'),
                content: info,
                okTitle:global.translateByKey('player.info.TipInfo.okTitle'),
                cancelTitle:global.translateByKey('player.info.TipInfo.cancelTitle'),
                okCallback: function($s){
                    var o = {
                        ctCode:"jb",
                        amount:amount,
                        fromUserId:fromUserId,
                        toUserId:toUserId,
                        memo:memo,
                    };
                    bank.transfer(o,function(err,result){
                        if (err) {
                            $timeout(function () {
                                $scope.error(result.msg);
                            });
                        } else {
                            $timeout(function () {
                                $scope.success(global.translateByKey('common.succeed'));
                            });
                            $scope.player.jb = $scope.sum;
                            $scope.bank.amount = null;
                            $scope.bank.memo = "";
                        }
                    });
                }
            });
        }
    }
}]);

