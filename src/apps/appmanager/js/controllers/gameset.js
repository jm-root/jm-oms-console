/**
 * Created by ZL on 2016/8/13.
 */
"use strict";
app.controller('GameSetListCtrl', ['$scope', '$state', '$stateParams', '$http', 'sso', 'AGGRID', 'global', function ($scope, $state, $stateParams, $http, sso, AGGRID, global) {
    var history = global.appsListHistory;
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
            {headerName: "货币种类", field: "ctCode", width: 120},
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
            {headerName: "是否可见", field: "visible", width: 120, valueGetter: angGridFormatVisible},
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
            {headerName: "是否可见", field: "visible", width: 120, valueGetter: angGridFormatVisible},
            {headerName: "#", width: 70, cellRenderer: angGridFormatRoomBtn, cellStyle:{'text-align':'center'}},
            {headerName: "#", width: 70, cellRenderer: angGridFormatTableBtn, cellStyle:{'text-align':'center'}}
        ]
    };

    function angGridFormatVisible(params) {
        return params.data.visible == 1 ? "是" : "否";
    }
    function angGridFormatFree(params) {
        return params.data.free == 1 ? "是" : "否";
    }
    function angGridFormatFixedRate(params) {
        return params.data.fixedRate == 1 ? "是" : "否";
    }
    function angGridFormatMode(params) {
        return params.data.mode == 1 ? "只出夺宝卷" : "只出金币" ;
    }
    function angGridFormatCtCode(params) {
        return params.data.ctCode == 1 ? "T币" : "金币";
    }

    function angGridFormatRoomBtn(params) {
        return '<button class="btn btn-xs bg-primary" ng-click="goRoomConfig(\''+params.data.roomType+'\')">房间配置</button>';
    }

    function angGridFormatTableBtn(params) {
        return '<button class="btn btn-xs bg-primary" ng-click="goTableConfig(\''+tmpl_id+'\', \''+tmpl_type+'\',\''+params.data.roomType+'\')">桌子配置</button>';
    }

    $scope.goRoomConfig = function(roomType){
        $state.go('app.rooms.manage.gameset.edit' , {appId: tmpl_id, type: tmpl_type, id: roomType});
    };

    $scope.goTableConfig = function(id, type, roomId){
        $state.go("app.rooms.manage.gameset.table.list", {appId: id, type: type, roomId: roomId});
    };


    var dataSource = {
        getRows: function (params) {
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
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.rooms.manage.gameset.edit' , {appId: tmpl_id, type: tmpl_type, id: cell.data.roomType});
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource,
        angularCompileRows: true
    };

    $scope.create = function () {
        $state.go("app.rooms.manage.gameset.edit", {appId: tmpl_id, type: tmpl_type});
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
                                    $scope.success('操作成功');
                                    $scope.gridOptions.api.setDatasource(dataSource);
                                }
                            }
                        });
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

app.controller('GameSetEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'sso', 'global', '$location', '$anchorScroll', function($scope, $http, $state, $stateParams, $timeout, sso, global, $location, $anchorScroll) {

    $scope.gameset_config_tmpl = "tpl/appmanager/gameset_" + $stateParams.type + "_edit.html";
    $scope.gameset_config_alg_tmpl = "tpl/appmanager/gameset_alg_edit.html";
    $scope.gameset_config_diffcult_tmpl = "tpl/appmanager/gameset_diffcult_edit.html";


    $scope.goScroll = function (anchor) {

        $location.hash(anchor);

        $anchorScroll();
    }
}]);

app.controller('GameSetAlgEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'sso', '$q', function($scope, $http, $state, $stateParams, $timeout, sso, $q) {

    var baseUrl = algUri + '/' + $stateParams.type;

    $scope.saveInOut = function () {
        var url = baseUrl + '/changeInOut';
        var data = {};
        data.in = {};
        data.out = {};
        if($scope.table1.algIn){
            data.in[$scope.table1.id] = $scope.table1.algIn;
        }
        if($scope.table1.algOut){
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
                $scope.success("设置成功");
            }else{
                $scope.error("设置失败");
            }
        });
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
                $scope.success("设置成功");
            }else{
                $scope.error("设置失败");
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
                $scope.success("设置成功");
            }else{
                $scope.error("设置失败");
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
            }

            msg.inOutRate = (msg.inout.roomsIn - msg.inout.roomsOut) / msg.inout.roomsIn;
            msg.inOutRate = msg.inOutRate.toFixed(4);
            msg.gIngOutRate = msg.gIngOutRate.toFixed(4);

            // $scope.$apply(function () {
                $scope.tables[msg.roomId] = msg;
            // });



        }, function (data) {
            $scope.error("获取数据失败");
        });
    };

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

app.controller('GameSetDiffcultEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'sso', '$q', 'global', function($scope, $http, $state, $stateParams, $timeout, sso, $q, global) {

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;

    var hkey = 'app:'+ appId + ':config';

    $scope.hkey = hkey;
    $scope.id = id;
    $scope.type = tmpl_type;

    $scope.tabPageShow = false;


    var showData = {
        fish: {
            diffs: [
                {name: "最简单", value: 0},
                {name: "简单", value: 1},
                {name: "难", value: 2},
                {name: "最难", value: 3},
                {name: "死难", value: 4},
                {name: "难5", value: 5},
                {name: "难6", value: 6},
                {name: "难7", value: 7},
                {name: "难8", value: 8},
                {name: "难9", value: 9}
            ],
            rejustDiffs: [
                {name: "零负分（关闭炒场）", value: 44, max_send:0},
                {name: "最高-5000", value: 28, max_send: 5000},
                {name: "最高-10000", value: 29, max_send: 10000},
                {name: "最高-15000", value: 30, max_send: 15000},
                {name: "最高-20000", value: 33, max_send: 20000},
                {name: "最高-25000", value: 37, max_send: 25000},
                {name: "最高-30000", value: 38, max_send: 30000},
                {name: "最高-35000", value: 39, max_send: 35000},
                {name: "最高-40000", value: 40, max_send: 40000},
                {name: "最高-45000", value: 41, max_send: 45000},
                {name: "最高-55000", value: 42, max_send: 55000},
                {name: "最高-100000", value: 43, max_send: 100000}
            ]
        },
        gamble: {
            diffs: [
                {name: "最简单", value: 0},
                {name: "简单", value: 1},
                {name: "难", value: 2},
                {name: "最难", value: 3},
                {name: "死难", value: 4},
                {name: "难5", value: 5},
                {name: "难6", value: 6},
                {name: "难7", value: 7},
                {name: "难8", value: 8},
                {name: "难9", value: 9}
            ],
            rejustDiffs: [
                {name: "零负分（关闭炒场）", value: 44, max_send:0},
                {name: "最高-5000", value: 28, max_send: 5000},
                {name: "最高-10000", value: 29, max_send: 10000},
                {name: "最高-15000", value: 30, max_send: 15000},
                {name: "最高-20000", value: 33, max_send: 20000},
                {name: "最高-25000", value: 37, max_send: 25000},
                {name: "最高-30000", value: 38, max_send: 30000},
                {name: "最高-35000", value: 39, max_send: 35000},
                {name: "最高-40000", value: 40, max_send: 40000},
                {name: "最高-45000", value: 41, max_send: 45000},
                {name: "最高-55000", value: 42, max_send: 55000},
                {name: "最高-100000", value: 43, max_send: 100000}
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
                $scope.success('设置成功');
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
                $scope.error("算法设置难度失败");
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
                $scope.error("算法设置炒场难度失败");
            }else{
                $scope.success("算法设置炒场难度成功");
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
                            var totalPlayerNum;
                            if($stateParams.type === "fish"){
                                totalPlayerNum = 4;
                            }else{
                                totalPlayerNum = 8;
                            }
                            var url = algUri + '/' + $stateParams.type + '/init';
                            var diffData = { "room": parseInt(room), "diff": $scope.room.diff, "coin_rate": algData.coin_rate, "totalPlayerNum": totalPlayerNum};
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
