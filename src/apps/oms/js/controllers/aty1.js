'use strict';
app.controller('OmsActivitiesCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('oms');
}]);

app.controller('OmsAty1Ctrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state, global) {

    var sso = jm.sdk.sso;

    $scope.gears = {};
    $scope.aty = {type:0};
    $scope.aty.date = $scope.aty.date||{};
    var url = statUri+'/players';
    $scope.key = "";
    $scope.dateOptions = global.dateRangeOptions;


    $scope.removeItem = function(index) {
        $scope.gears.gear.splice(index, 1);
    };
    $scope.addItem = function() {
        if(!$scope.gears.gear){
            $scope.gears.gear = [];
        }
        if($scope.gears.gear.length<20){
            $scope.gears.gear.push({});
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
        return '<button class="btn btn-xs btn-info center-block">下分确认</button>';
    }
    var columnDefs = [
        {headerName: "玩家ID", field: "uid", width: 120, cellRenderer: uid_render},
        {headerName: "账号", field: "account", width: 100, cellRenderer: account_render},
        {headerName: "昵称", field: "nick", width: 100, cellRenderer: nick_render},
        {headerName: "当前金币数", field: "record.win_jb", width: 120},
        {headerName: "下分金币数", field: "record.jb", width: 120},
        {headerName: "下分奖励", field: "record.tb", width: 120},
        {headerName: "执行状态", field: "record.tb", width: 120},
        {headerName: "下分时间", field: "crtime", width: 220,valueGetter: $scope.angGridFormatDateS},
        {headerName: "下分操作者", field: "ip", width: 120},
        {headerName: "#", field: "cny", width: 120,cellRenderer:confirm_render}
    ];

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();   //翻译

            var search = $scope.aty;
            var keyword = search.keyword;
            var agent = search.agent;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
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
                    if($scope.aty.type == "1"){
                        params.successCallback(rowsThisPage, lastRow);
                    }else{
                        params.successCallback([], lastRow);
                    }

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
        }
    };


    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.chooseType = function(){
        if($scope.aty.type == "1"){
            $scope.key = false;
        }else{
            $scope.key = true;
        }
    };
    $scope.chooseType();
    $scope.getdata = function () {
        $scope.chooseType();
        $scope.gridOptions.api.setDatasource(dataSource);
    }

    $http.get(activityUri+'/findone', {
        params: {
            token: sso.getToken(),
            code:'backCoin',
            forum:'activity'
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            $scope.aty1 = result;
            $scope.aty.date = $scope.aty1.crtime;
            $scope.aty.name = $scope.aty1.code;
            return $scope.aty1;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });

    //保存
    $scope.save = function () {

        var title = $scope.aty.name;
        var content = $scope.aty.content;
        var startDate = $scope.aty.date.startDate||"";
        var endDate = $scope.aty.date.endDate||"";
        var ext = $scope.gears.gear;
        var id = $scope.aty1._id;

        $http.post(activityUri+'/activities/'+id ,{
            params: {
                token: sso.getToken(),
                title:title,
                content:content,
                ext:ext,
                startDate:startDate,
                endDate:endDate
            }
        }).success(function (result) {
            if (result.err) {
                $scope.error(result.msg);
            } else {
                $scope.aty1 = result;
                console.info(result);
                console.info($scope.aty1._id);
                console.info($scope.aty1);
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    }

}]);