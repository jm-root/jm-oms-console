/**
 * Created by ZL on 2016/8/13.
 */
"use strict";
var sso =jm.sdk.sso;
app.controller('GameSetListCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', '$filter', function ($scope, $state, $stateParams, $http, global, $filter) {


    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var tmpl_id = $stateParams.appId;
    var tmpl_type = $stateParams.type;
    var hkey = 'app:' + tmpl_id + ":config";

    var columnDefs = {
        fish: [
            {headerName: "房间类型", field: "roomType", width: 100},
            {headerName: "名字", field: "name", width: 100},
            // {headerName: "简介", field: "intro", width: 120},
            // {headerName: "游戏难度", field: "hardLevel", width: 120},
            // {headerName: "桌子数", field: "tableNumber", width: 100},
            {headerName: "房间倍率", field: "areaRate", width: 120},
            // {headerName: "固定炮值", field: "fixedRate", width: 120, valueGetter: angGridFormatFixedRate},
            {headerName: "免费场", field: "free", width: 100, valueGetter: angGridFormatFree},
            // {headerName: "玩家上限", field: "maxPlayers", width: 120},
            {headerName: "最少鱼数", field: "minFishes", width: 120},
            {headerName: "桌子数", field: "maxAreas", width: 120},
            {headerName: "桌子模式", field: "mode", width: 120, valueGetter: angGridFormatMode},
            {headerName: "货币种类", field: "ctCode", width: 120, valueGetter: angGridFormatCtCode},
            {headerName: "一币分值", field: "exchangeRate", width: 120},
            // {headerName: "发炮速度限制", field: "gunSpeedLimit", width: 180},
            {headerName: "最大携带", field: "maxAmount", width: 120},
            {headerName: "最小携带", field: "minAmount", width: 120},
            {headerName: "上分设置", field: "exchangeAmount", width: 120},
            // {headerName: "最小炮值", field: "minGunValue", width: 120},
            // {headerName: "加炮幅度", field: "addGunValue", width: 120},
            // {headerName: "上分上限", field: "maxUpScore", width: 120},
            // {headerName: "爆机分数", field: "baoji", width: 120},
            // {headerName: "限时发炮", field: "maxWaitFireTime", width: 120}
            // {headerName: "是否可见", field: "visible", width: 120, valueGetter: angGridFormatVisible},
            {headerName: "#", width: 70, cellRenderer: angGridFormatRoomBtn, cellStyle:{'text-align':'center'}},
            {headerName: "#", width: 70, cellRenderer: angGridFormatTableBtn, cellStyle:{'text-align':'center'}}
        ],
        gamble: [
            {headerName: "房间类型", field: "roomType", width: 100},
            {headerName: "名字", field: "name", width: 100},
            // {headerName: "简介", field: "intro", width: 120},
            // {headerName: "最大玩家数", field: "maxPlayers", width: 100},
            {headerName: "房间倍率", field: "areaRate", width: 120},
            {headerName: "免费场", field: "free", width: 100, valueGetter: angGridFormatFree},
            {headerName: "桌子模式", field: "mode", width: 120, valueGetter: angGridFormatMode},
            {headerName: "货币种类", field: "ctCode", width: 120, valueGetter: angGridFormatCtCode},
            {headerName: "桌子数", field: "maxAreas", width: 120},
            // {headerName: "游戏难度", field: "hardLevel", width: 120},
            {headerName: "最大携带", field: "maxAmount", width: 120},
            {headerName: "最小携带", field: "minAmount", width: 120},
            {headerName: "上分设置", field: "exchangeAmount", width: 120},
            {headerName: "一币分值", field: "exchangeRate", width: 120},
            // {headerName: "是否可见", field: "visible", width: 120, valueGetter: angGridFormatVisible},
            {headerName: "#", width: 70, cellRenderer: angGridFormatRoomBtn, cellStyle:{'text-align':'center'}},
            {headerName: "#", width: 70, cellRenderer: angGridFormatTableBtn, cellStyle:{'text-align':'center'}}
        ]
    };

    global.agGridTranslateSync($scope, columnDefs.fish, [
        'appmgr.room.roomType',
        'appmgr.room.roomName',
        'appmgr.room.roomRate',
        'appmgr.room.freeField',
        'appmgr.room.tableFishNum',
        'appmgr.room.tableNum',
        'appmgr.room.roomMode',
        'appmgr.room.roomCurrency',
        'appmgr.room.currencyScore',
        'appmgr.room.maxCarry',
        'appmgr.room.minCarry',
        'appmgr.room.setup'
    ]);

    global.agGridTranslateSync($scope, columnDefs.gamble, [
        'appmgr.room.roomType',
        'appmgr.room.roomName',
        'appmgr.room.roomRate',
        'appmgr.room.freeField',
        'appmgr.room.roomMode',
        'appmgr.room.roomCurrency',
        'appmgr.room.tableNum',
        'appmgr.room.maxCarry',
        'appmgr.room.minCarry',
        'appmgr.room.setup',
        'appmgr.room.currencyScore'
    ]);

    function angGridFormatVisible(params) {
        return params.data.visible == 1 ? $filter('translate')('common.yes') : $filter('translate')('common.no');
    }
    function angGridFormatFree(params) {
        return params.data.free == 1 ? $filter('translate')('common.yes') : $filter('translate')('common.no');
    }
    function angGridFormatFixedRate(params) {
        return params.data.fixedRate == 1 ? $filter('translate')('common.yes') : $filter('translate')('common.no');
    }
    function angGridFormatMode(params) {
        return params.data.mode == 1 ? $filter('translate')('appmgr.room.modeGoldLottery') : $filter('translate')('appmgr.room.modeGold');
    }
    function angGridFormatCtCode(params) {
        return params.data.ctCode == "tb" ? $filter('translate')('common.tb') : $filter('translate')('common.jb');
    }

    function angGridFormatRoomBtn(params) {
        return '<button class="btn btn-xs bg-primary" ng-click="goRoomConfig(\''+params.data.roomType+'\')" translate="appmgr.room.roomConfig">房间配置</button>';
    }

    function angGridFormatTableBtn(params) {
        return '<button class="btn btn-xs bg-primary" ng-click="goTableConfig(\''+tmpl_id+'\', \''+tmpl_type+'\',\''+params.data.roomType+'\')" translate="appmgr.tableList">桌子配置</button>';
    }

    $scope.goRoomConfig = function(roomType){
        $state.go('app.rooms.manage.gameset.edit' , {appId: tmpl_id, type: tmpl_type, id: roomType});
    };

    $scope.goTableConfig = function(id, type, roomId){
        $state.go("app.rooms.manage.gameset.table.list", {appId: id, type: type, roomId: roomId});
    };


    var dataSource = {
        getRows: function (params) {

            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            var url = appMgrUri + "/appConfig";
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    root: hkey,
                    list: 1,
                    all: 1
                }
            }).error(function (msg, code) {
                $scope.errorTips(code);
            }).success(function (result) {
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    if(data.err == 404){
                        data = {};
                    }
                    var rowsThisPage = [];

                    for(var key in data){
                        data[key].roomType = key;
                        rowsThisPage.push(data[key]);
                    }

                    var lastRow = rowsThisPage.length;
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
        // enableColResize: true,
        rowSelection: 'multiple',
        // columnDefs: columnDefs,
        columnDefs: columnDefs[tmpl_type],
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.rooms.manage.gameset.edit' , {appId: tmpl_id, type: tmpl_type, id: cell.data.roomType});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.rooms.manage.gameset.edit' , {appId: tmpl_id, type: tmpl_type, id: cell.data.roomType});
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource,
        angularCompileRows: true,
        headerCellRenderer: global.agGridHeaderCellRendererFunc
    };

    $scope.create = function () {
        $state.go("app.rooms.manage.gameset.edit", {appId: tmpl_id, type: tmpl_type});
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title:$filter('translate')('openTips.title'),
                content:$filter('translate')('openTips.delContent'),
                okTitle:$filter('translate')('common.yes'),
                cancelTitle:$filter('translate')('common.no'),
                okCallback: function(){
                    var ids = 0;
                    rows.forEach(function(e){
                        var url = appMgrUri + "/appConfig";
                        $http.delete(url, {
                            params: {
                                token: sso.getToken(),
                                root: hkey,
                                key: e.roomType
                            }
                        }).error(function (msg, code) {
                            $scope.errorTips(code);
                        }).success(function (result) {
                            var data = result;
                            if(data.err){
                                $scope.error(data.msg);
                            }else{
                                ids++;
                                if(ids == len) {
                                    $scope.success($filter('translate')('openTips.operationSuccess'));
                                    $scope.gridOptions.api.setDatasource(dataSource);
                                }
                            }
                        });
                    });
                }
            });
        }else{
            $scope.openTips({
                title:$filter('translate')('openTips.title'),
                content:$filter('translate')('openTips.selectDelContent'),
                cancelTitle:$filter('translate')('openTips.cancelDelContent'),
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

    $scope.isFromAppManager = false;
    var viewPath = 'view.appmanager.gameset.config';
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
        if($scope.super || ($scope.per.get && $scope.per.post)){
            $scope.isFromAppManager = true;
        }
    }).catch(function(err){
        console.log(err);
    });

}]);

app.controller('GameSetEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', '$location', '$anchorScroll', function($scope, $http, $state, $stateParams, $timeout, global, $location, $anchorScroll) {

    $scope.gameset_config_tmpl = "apps/appmanager/tpl/gameset_" + $stateParams.type + "_edit.html";
    $scope.gameset_config_alg_tmpl = "apps/appmanager/tpl/gameset_alg_edit.html";
    $scope.gameset_config_diffcult_tmpl = "apps/appmanager/tpl/gameset_diffcult_edit.html";

    $scope.goRoomList = function () {
        $state.go("app.rooms.manage.gameset.list", {appId: $stateParams.appId, type:$stateParams.type});
    };

    $scope.goScroll = function (anchor) {

        $location.hash(anchor);

        $anchorScroll();
    }
}]);

app.controller('GameSetAlgEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$interval', '$q', '$filter', function($scope, $http, $state, $stateParams, $interval, $q, $filter) {

    var baseUrl = algUri + '/' + $stateParams.type;

    $scope.saveInOut = function () {

        var url = baseUrl + '/changeInOut';
        var data = {};
        data.in = {};
        data.out = {};
        if($scope.table1.algOut == undefined && $scope.table1.algOut == undefined){
            getAlgData($scope.table1.id).then(function (algData) {

                var totalgIn = 0;
                var totalgOut = 0;
                if($stateParams.type == "fish"){
                    var arrIn = algData.gIn;
                    arrIn.forEach(function (e, i) {
                        totalgIn += e;
                    });

                    var arrOut = algData.gOut;
                    arrOut.forEach(function (e, i) {
                        totalgOut += e;
                    })
                }else{
                    totalgIn = algData.gIn;
                    totalgOut = algData.gOut;
                }

                data.in[$scope.table1.id] = totalgIn;
                data.out[$scope.table1.id] = totalgOut;

                $http.post(url, data, {
                    params:{
                        token: sso.getToken()
                    }
                }).error(function (msg, code) {
                    $scope.errorTips(code);
                }).success(function (result) {
                    var data = result;
                    if(data.ret == "ok"){
                        $scope.success($filter('translate')('openTips.operationSuccess'));
                    }else{
                        $scope.error($filter('translate')('openTips.operationFail'));
                    }
                });
            }, function (data) {
                $scope.error($filter('translate')('openTips.operationFail'));
            });
        }else{
            if($scope.table1.algIn == undefined){
                data.out[$scope.table1.id] = 0;
            }else{
                data.in[$scope.table1.id] = $scope.table1.algIn;
            }
            if($scope.table1.algOut == undefined){
                data.out[$scope.table1.id] = 0;
            }else{
                data.out[$scope.table1.id] = $scope.table1.algOut;
            }

            $http.post(url, data, {
                params:{
                    token: sso.getToken()
                }
            }).error(function (msg, code) {
                $scope.errorTips(code);
            }).success(function (result) {
                var data = result;
                if(data.ret == "ok"){
                    $scope.success($filter('translate')('openTips.operationSuccess'));
                }else{
                    $scope.error($filter('translate')('openTips.operationFail'));
                }
            });
        }

    };

    $scope.execInit = function () {

        var url = baseUrl + '/init';
        var data = {
            "room": parseInt($scope.table2.id),
            "diff": parseInt($scope.table2.diff),
            "coin_rate": $scope.table2.coin_rate,
            "totalPlayerNum": $scope.table2.totalPlayerNum
        };
        $http.post(url, data, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        }).success(function (result) {
            var data = result;
            if(data.ret == "ok"){
                $scope.success($filter('translate')('openTips.operationSuccess'));
            }else{
                $scope.error($filter('translate')('openTips.operationFail'));
            }
        });
    };

    $scope.changeDiff = function () {

        var url = baseUrl + '/changeDiff';
        var data = { "room": parseInt($scope.table3.id), "diff": parseInt($scope.table3.diff)};
        $http.post(url, data, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        }).success(function (result) {
            var data = result;
            if(data.ret == "ok"){
                $scope.success($filter('translate')('openTips.operationSuccess'));
            }else{
                $scope.error($filter('translate')('openTips.operationFail'));
            }
        });
    };

    $scope.tables = [];
    $scope.getAlgData = function () {
        getAlgData($scope.table4.id).then(function (data) {
            var msg = data;

            if(msg.gIn && msg.gOut &&  Array.isArray(msg.gIn) && Array.isArray(msg.gOut)){
                var arrIn = msg.gIn;
                msg.totalgIn = 0;
                arrIn.forEach(function (e, i) {
                    msg.totalgIn += e;
                });

                var arrOut = msg.gOut;
                msg.totalgOut = 0;
                arrOut.forEach(function (e, i) {
                    msg.totalgOut += e;
                });

                msg.gIngOutRate = (msg.totalgIn - msg.totalgOut) / msg.totalgIn;
            }else{
                msg.gIngOutRate = (msg.gIn - msg.gOut) / msg.gIn;
                msg.totalgIn = msg.gIn;
                msg.totalgOut = msg.gOut;
            }
            msg.glose = msg.totalgIn - msg.totalgOut;
            msg.lose = msg.inout.roomsIn - msg.inout.roomsOut;
            msg.inOutRate = (msg.inout.roomsIn - msg.inout.roomsOut) / msg.inout.roomsIn;
            msg.inOutRate = msg.inOutRate.toFixed(4);
            msg.gIngOutRate = msg.gIngOutRate.toFixed(4);

            // $scope.$apply(function () {
                $scope.tables[msg.roomId] = msg;
            // });



        }, function (data) {
            $scope.error($filter('translate')('appmgr.getDataError'));
        });
    };

    var refreshData = {};
    $scope.autoGetAlgData = function () {
        refreshData.t = $interval(function(){
            $scope.getAlgData();
        }, 1000);
    };

    $scope.cancelGetAlgData = function () {
        $interval.cancel(refreshData.t);
    };

    $scope.$on("$destroy", function(){
        $interval.cancel(refreshData.t);
    });

    function getAlgData(room) {

        var deferred = $q.defer();

        var url = baseUrl + '/getAlgData';
        $http.get(url, {
            params:{
                token: sso.getToken(),
                room: parseInt(room)
            }
        }).error(function (msg, code) {
            deferred.reject(code);
        }).success(function (result) {
            var data = result;
            if(data.err){
                deferred.reject(data);
            }else{
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    }

}]);

app.controller('GameSetDiffcultEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$q', 'global', '$filter', function($scope, $http, $state, $stateParams, $timeout, $q, global, $filter) {

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;

    var hkey = 'app:'+ appId + ':config';

    $scope.hkey = hkey;
    $scope.id = id;
    $scope.type = tmpl_type;

    $scope.tabPageShow = false;

    // global.translateByKey("")

    var showData = {
        fish: {
            diffs: [
                {name: global.translateByKey("appmgr.difficulty0"), value: 0},
                {name: global.translateByKey("appmgr.difficulty1"), value: 1},
                {name: global.translateByKey("appmgr.difficulty2"), value: 2},
                {name: global.translateByKey("appmgr.difficulty3"), value: 3},
                {name: global.translateByKey("appmgr.difficulty4"), value: 4},
                {name: global.translateByKey("appmgr.difficulty5"), value: 5},
                {name: global.translateByKey("appmgr.difficulty6"), value: 6},
                {name: global.translateByKey("appmgr.difficulty7"), value: 7},
                {name: global.translateByKey("appmgr.difficulty8"), value: 8},
                {name: global.translateByKey("appmgr.difficulty9"), value: 9}
            ],
            rejustDiffs: [
                {name: global.translateByKey("appmgr.closeMaxSend"), value: 44, max_send:0},
                {name: global.translateByKey("appmgr.highest") + "-3000", value: 28, max_send: 3000},
                {name: global.translateByKey("appmgr.highest") + "-8000", value: 29, max_send: 8000},
                {name: global.translateByKey("appmgr.highest") + "-13000", value: 30, max_send: 13000},
                {name: global.translateByKey("appmgr.highest") + "-18000", value: 33, max_send: 18000},
                {name: global.translateByKey("appmgr.highest") + "-23000", value: 37, max_send: 23000},
                {name: global.translateByKey("appmgr.highest") + "-28000", value: 38, max_send: 28000},
                {name: global.translateByKey("appmgr.highest") + "-33000", value: 39, max_send: 33000},
                {name: global.translateByKey("appmgr.highest") + "-38000", value: 40, max_send: 38000},
                {name: global.translateByKey("appmgr.highest") + "-43000", value: 41, max_send: 43000},
                {name: global.translateByKey("appmgr.highest") + "-53000", value: 42, max_send: 53000},
                {name: global.translateByKey("appmgr.highest") + "-98000", value: 43, max_send: 98000}
                // {name: global.translateByKey("appmgr.highest") + "-5000", value: 28, max_send: 5000},
                // {name: global.translateByKey("appmgr.highest") + "-10000", value: 29, max_send: 10000},
                // {name: global.translateByKey("appmgr.highest") + "-15000", value: 30, max_send: 15000},
                // {name: global.translateByKey("appmgr.highest") + "-20000", value: 33, max_send: 20000},
                // {name: global.translateByKey("appmgr.highest") + "-25000", value: 37, max_send: 25000},
                // {name: global.translateByKey("appmgr.highest") + "-30000", value: 38, max_send: 30000},
                // {name: global.translateByKey("appmgr.highest") + "-35000", value: 39, max_send: 35000},
                // {name: global.translateByKey("appmgr.highest") + "-40000", value: 40, max_send: 40000},
                // {name: global.translateByKey("appmgr.highest") + "-45000", value: 41, max_send: 45000},
                // {name: global.translateByKey("appmgr.highest") + "-55000", value: 42, max_send: 55000},
                // {name: global.translateByKey("appmgr.highest") + "-100000", value: 43, max_send: 100000}
            ]
        },
        gamble: {
            diffs: [
                {name: global.translateByKey("appmgr.difficulty0"), value: 0},
                {name: global.translateByKey("appmgr.difficulty1"), value: 1},
                {name: global.translateByKey("appmgr.difficulty2"), value: 2},
                {name: global.translateByKey("appmgr.difficulty3"), value: 3},
                {name: global.translateByKey("appmgr.difficulty4"), value: 4},
                {name: global.translateByKey("appmgr.difficulty5"), value: 5},
                // {name: global.translateByKey("difficult6"), value: 6},
                // {name: global.translateByKey("difficult7"), value: 7},
                // {name: global.translateByKey("difficult8"), value: 8},
                // {name: global.translateByKey("difficult9"), value: 9}
            ],
            rejustDiffs: [
                {name: global.translateByKey("appmgr.closeMaxSend"), value: 44, max_send:0},
                {name: global.translateByKey("appmgr.highest") + "-1000", value: 28, max_send: 1000},
                {name: global.translateByKey("appmgr.highest") + "-6000", value: 29, max_send: 6000},
                {name: global.translateByKey("appmgr.highest") + "-11000", value: 30, max_send: 11000},
                {name: global.translateByKey("appmgr.highest") + "-16000", value: 33, max_send: 16000},
                {name: global.translateByKey("appmgr.highest") + "-21000", value: 37, max_send: 21000},
                {name: global.translateByKey("appmgr.highest") + "-26000", value: 38, max_send: 26000},
                {name: global.translateByKey("appmgr.highest") + "-31000", value: 39, max_send: 31000},
                {name: global.translateByKey("appmgr.highest") + "-36000", value: 40, max_send: 36000},
                {name: global.translateByKey("appmgr.highest") + "-41000", value: 41, max_send: 41000},
                {name: global.translateByKey("appmgr.highest") + "-51000", value: 42, max_send: 51000},
                {name: global.translateByKey("appmgr.highest") + "-96000", value: 43, max_send: 96000}
                // {name: global.translateByKey("appmgr.highest") + "-5000", value: 28, max_send: 5000},
                // {name: global.translateByKey("appmgr.highest") + "-10000", value: 29, max_send: 10000},
                // {name: global.translateByKey("appmgr.highest") + "-15000", value: 30, max_send: 15000},
                // {name: global.translateByKey("appmgr.highest") + "-20000", value: 33, max_send: 20000},
                // {name: global.translateByKey("appmgr.highest") + "-25000", value: 37, max_send: 25000},
                // {name: global.translateByKey("appmgr.highest") + "-30000", value: 38, max_send: 30000},
                // {name: global.translateByKey("appmgr.highest") + "-35000", value: 39, max_send: 35000},
                // {name: global.translateByKey("appmgr.highest") + "-40000", value: 40, max_send: 40000},
                // {name: global.translateByKey("appmgr.highest") + "-45000", value: 41, max_send: 45000},
                // {name: global.translateByKey("appmgr.highest") + "-55000", value: 42, max_send: 55000},
                // {name: global.translateByKey("appmgr.highest") + "-100000", value: 43, max_send: 100000}
            ]
        }
    };

    $scope.showData = showData[tmpl_type];

    if(id){
        $scope.roomType = id;
        var url = appMgrUri + "/appConfig";
        $http.get(url, {
            params:{
                token: sso.getToken(),
                root: hkey,
                key: id
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        }).success(function (result) {
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.room = result.ret;
                $scope.diff2 = $scope.showData.diffs[$scope.room.diff];

                $scope.tabPageShow = true;
            }
        });
    }else{
        $scope.tabPageShow = false;
    }


    $scope.saveDiff = function(diff){
        var jump = true;

        saveRoomDiffcult(jump, parseInt(diff));
    };

    $scope.saveRejustDiff = function(diff){
        var jump = true;

        saveRoomRejust(jump, parseInt(diff));
    };

    function saveRoomConfig(jump, diff) {

        var key = $scope.room.roomType;

        var data = angular.copy($scope.room);
        data.diff = diff;

        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: $scope.hkey, key: key, value: data}, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        }).success(function (result) {
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.success($filter('translate')('openTips.operationSuccess'));
                if(jump){
                    $state.go('app.rooms.manage.gameset.list', {appId: $stateParams.appId, type: $stateParams.type});
                }
            }
        });

    }

    function saveRoomDiffcult(jump, diff) {

        var functions = [];
        for(var i=$scope.room.startAreaId; i<($scope.room.startAreaId+$scope.room.maxAreas); ++i){
            functions.push(setDiff(i, diff));
        }

        $q.all(functions).then(function (arr) {
            var isOk = true;
            for(var i=0; i<arr.length; ++i){
                var item = arr[i];
                if(!item || item.ret != "ok"){
                    isOk = false;
                    break;
                }
            }

            if(!isOk){
                $scope.error(global.translateByKey("setAlgDiffFail"));
            }else{
                saveRoomConfig(jump, diff);
            }
        });
    }

    function saveRoomRejust(jump, diff) {

        var functions = [];
        for(var i=$scope.room.startAreaId; i<($scope.room.startAreaId+$scope.room.maxAreas); ++i){
            functions.push(setRejustDiff(i, diff));
        }

        $q.all(functions).then(function (arr) {
            var isOk = true;
            for(var i=0; i<arr.length; ++i){
                var item = arr[i];
                if(!item || item.ret != "ok"){
                    isOk = false;
                    break;
                }
            }

            if(!isOk){
                $scope.error(global.translateByKey("appmgr.setAlgCCDiffFail"));
            }else{
                $scope.success(global.translateByKey("appmgr.setAlgCCDiffSuccess"));
                if(jump){
                    $state.go('app.rooms.manage.gameset.list', {appId: $stateParams.appId, type: $stateParams.type});
                }
            }
        });
    }

    function setDiff(room, diff) {

        var deferred = $q.defer();

        var url = algUri + '/' + $stateParams.type + '/changeDiff';
        var diffData = { "room": parseInt(room), "diff": parseInt(diff)};
        $http.post(url, diffData, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            deferred.reject(code);
        }).success(function (result) {
            var data = result;
            if(data.err){
                deferred.reject(data.err);
            }else{
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    }

    function setRejustDiff(room, diff) {
        var deferred = $q.defer();

        var url = algUri + '/' + $stateParams.type + '/getAlgData';
        $http.get(url, {
            params:{
                token: sso.getToken(),
                room: parseInt(room)
            }
        }).error(function (msg, code) {
            deferred.reject(code);
        }).success(function (result) {
            var data = result;
            if(data.err){
                deferred.reject(data);
            }else{
                // deferred.resolve(data);
                var algData = data;
                var url = algUri + '/' + $stateParams.type + '/setRejustDiff';
                var diffData = { "room": parseInt(room), "diff": parseInt(diff)};
                $http.post(url, diffData, {
                    params:{
                        token: sso.getToken()
                    }
                }).error(function (msg, code) {
                    deferred.reject(code);
                }).success(function (result) {
                    var data = result;
                    if(data.err){
                        deferred.reject(data.err);
                    }else{
                        if(data.ret != "ok"){
                            deferred.reject(data);
                        }else{
                            // var totalPlayerNum;
                            // if($stateParams.type === "fish"){
                            //     totalPlayerNum = 4;
                            // }else{
                            //     totalPlayerNum = 8;
                            // }
                            // var url = algUri + '/' + $stateParams.type + '/init';
                            // var diffData = { "room": parseInt(room), "diff": $scope.room.diff, "coin_rate": algData.coin_rate, "totalPlayerNum": totalPlayerNum};
                            var url = algUri + '/' + $stateParams.type + '/changeDiff';
                            var diffData = { "room": parseInt(room), "diff": $scope.room.diff};
                            $http.post(url, diffData, {
                                params:{
                                    token: sso.getToken()
                                }
                            }).error(function (msg, code) {
                                deferred.reject(code);
                            }).success(function (result) {
                                var data = result;
                                if(data.err){
                                    deferred.reject(data.err);
                                }else{
                                    deferred.resolve(data);
                                }
                            });
                        }
                    }
                });
            }
        });


        return deferred.promise;
    }

    function getAlgData(room) {

        var deferred = $q.defer();

        var url = algUri + '/' + $stateParams.type + '/getAlgData';
        $http.get(url, {
            params:{
                token: sso.getToken(),
                room: parseInt(room)
            }
        }).error(function (msg, code) {
            deferred.reject(code);
        }).success(function (result) {
            var data = result;
            if(data.err){
                deferred.reject(data);
            }else{
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    };

}]);
