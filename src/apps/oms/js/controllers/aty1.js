'use strict';
app.controller('OmsActivitiesCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('oms');
}]);

app.controller('OmsAty1Ctrl', ['$scope', '$http', '$state','MODULE_CONFIG', 'global',function($scope, $http, $state,MODULE_CONFIG, global) {

    var sso = jm.sdk.sso;
    $scope.search = {};
    var url = activityUri+'/forums';
    $scope.dateOptions = global.dateRangeOptions;
    $scope.gears = {};
    $scope.removeItem = function(index) {
        $scope.gears.gear.splice(index, 1);
    };
    $scope.addItem = function() {
        if(!$scope.gears.gear){
            $scope.gears.gear = [];
        }
        if($scope.gears.gear.length<20){
            $scope.gears.gear.push({amount:1});
        }
    };
    var viewPath = 'view.agent.list';
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
    }).catch(function(err){
        console.log(err);
    });
    function uid_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="goto(data)">{{data.uid}}</a>';
    }
    function account_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="goto(data)">{{data.account}}</a>';
    }
    function nick_render(params){
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="onPageSizeChanged(data.nick)">{{data.nick}}</a>';
    }
    function confirm_render(params){
        return '<button class="btn btn-xs btn-primary center-block">下分确认</button>';
    }
    var columnDefs = [
        {headerName: "玩家ID", field: "uid", width: 120, cellRenderer: uid_render},
        {headerName: "账号", field: "account", width: 100, cellRenderer: account_render},
        {headerName: "昵称", field: "nick", width: 100, cellRenderer: nick_render},
        {headerName: "当前金币数", field: "level", width: 120},
        {headerName: "下分金币数", field: "mac", width: 120},
        {headerName: "下分奖励", field: "ip", width: 120},
        {headerName: "执行状态", field: "tb", width: 120, cellStyle:{'color':'#0000CC','cursor':'pointer'},editable: true},
        {headerName: "下分时间", field: "jb", width: 220, cellStyle:{'color':'#0000CC','cursor':'pointer'},editable: true},
        {headerName: "下分操作者", field: "dbj", width: 120, cellStyle:{'color':'#0000CC','cursor':'pointer'},editable: true},
        {headerName: "#", field: "cny", width: 120,cellRenderer:confirm_render}
    ];
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();   //翻译

            var search = $scope.search;
            var keyword = search.keyword;
            var type = search.type;
            var agent = search.agent;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    type: type,
                    agent: agent
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rows = data.rows || [];
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

}]);