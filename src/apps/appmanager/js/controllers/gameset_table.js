/**
 * Created by ZL on 2016/8/13.
 */
"use strict";
var sso = jm.sdk.sso;
app.controller('GameSetTableListCtrl', ['$scope', '$state', '$stateParams', '$http','AGGRID', 'global', '$q', function ($scope, $state, $stateParams, $http, AGGRID, global, $q) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var tmpl_id = $stateParams.appId;
    var tmpl_type = $stateParams.type;
    var roomId = $stateParams.roomId;
    var hkey = 'app:' + tmpl_id + ":config:area";

    var baseUrl = algUri + "/" + tmpl_type;

    var columnDefs = {
        fish: [
            {headerName: "所属房间类型", field: "roomType", width: 120},
            {headerName: "桌子类型", field: "tableType", width: 100},
            {headerName: "名字", field: "name", width: 100},
            // {headerName: "简介", field: "intro", width: 120},
            // {headerName: "游戏难度", field: "hardLevel", width: 120},
            // {headerName: "桌子数", field: "tableNumber", width: 100},
            {headerName: "游戏难度", field: "diff", width: 100},
            {headerName: "桌子倍率", field: "areaRate", width: 100},
            // {headerName: "固定炮值", field: "fixedRate", width: 120, valueGetter: angGridFormatFixedRate},
            {headerName: "免费场", field: "free", width: 100, valueGetter: angGridFormatFree},
            // {headerName: "玩家上限", field: "maxPlayers", width: 120},
            {headerName: "最少鱼数", field: "minFishes", width: 100},
            // {headerName: "桌子数", field: "maxAreas", width: 120},
            {headerName: "桌子模式", field: "mode", width: 100, valueGetter: angGridFormatMode},
            {headerName: "货币种类", field: "ctCode", width: 100},
            {headerName: "一币分值", field: "exchangeRate", width: 100},
            // {headerName: "发炮速度限制", field: "gunSpeedLimit", width: 180},
            {headerName: "最大携带", field: "maxAmount", width: 100},
            {headerName: "最小携带", field: "minAmount", width: 100},
            {headerName: "上分设置", field: "exchangeAmount", width: 100},
            // {headerName: "最小炮值", field: "minGunValue", width: 120},
            // {headerName: "加炮幅度", field: "addGunValue", width: 120},
            // {headerName: "上分上限", field: "maxUpScore", width: 120},
            // {headerName: "爆机分数", field: "baoji", width: 120},
            // {headerName: "限时发炮", field: "maxWaitFireTime", width: 120}
            {headerName: "是否可见", field: "visible", width: 100, valueGetter: angGridFormatVisible},
            {headerName: "#", width: 70, cellRenderer: angGridFormatTableBtn, cellStyle:{'text-align':'center'}},
            {headerName: "所属渠道", width: 180, cellRenderer: angGridFormatTableSelect, cellStyle:{'text-align':'center'}}
        ],
        gamble: [
            {headerName: "所属房间类型", field: "roomType", width: 120},
            {headerName: "桌子类型", field: "tableType", width: 100},
            {headerName: "名字", field: "name", width: 100},
            // {headerName: "简介", field: "intro", width: 120},
            // {headerName: "最大玩家数", field: "maxPlayers", width: 100},
            {headerName: "游戏难度", field: "diff", width: 100},
            {headerName: "桌子倍率", field: "areaRate", width: 100},
            {headerName: "免费场", field: "free", width: 100, valueGetter: angGridFormatFree},
            {headerName: "桌子模式", field: "mode", width: 100, valueGetter: angGridFormatMode},
            {headerName: "货币种类", field: "ctCode", width: 100, valueGetter: angGridFormatCtCode},
            // {headerName: "桌子数", field: "maxAreas", width: 120},
            {headerName: "最大携带", field: "maxAmount", width: 100},
            {headerName: "最小携带", field: "minAmount", width: 100},
            {headerName: "上分设置", field: "exchangeAmount", width: 100},
            {headerName: "一币分值", field: "exchangeRate", width: 100},
            {headerName: "是否可见", field: "visible", width: 100, valueGetter: angGridFormatVisible},
            {headerName: "#", width: 70, cellRenderer: angGridFormatTableBtn, cellStyle:{'text-align':'center'}},
            {headerName: "所属渠道", width: 180, cellRenderer: angGridFormatTableSelect, cellStyle:{'text-align':'center'}}
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

    $scope.agents = [];
    $scope.tableAgents = [];

    var roomData = {};

    function getRoomAndAgentData() {
        var deferred = $q.defer();

        var hkey2 = 'app:' + tmpl_id + ":config";
        var url = appMgrUri + "/appConfig";
        $http.get(url, {
            params:{
                token: sso.getToken(),
                root: hkey2,
                key: roomId
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
            deferred.reject();
        }).success(function (result) {
            var data = result;
            if(data.err){
                $scope.error(data.msg);
                deferred.reject();
            }else{
                roomData = result.ret;

                var url = agentUri + "/agents?level=1";
                $http.get(url, {
                    params:{
                        token: sso.getToken()
                    }
                }).error(function (msg, code) {
                    $scope.errorTips(code);
                    deferred.reject();
                }).success(function (result) {
                    var data = result;
                    if(data.err){
                        $scope.error(data.msg);
                        deferred.reject();
                    }else{
                        $scope.agents = result.rows;
                        deferred.resolve();
                    }
                });
            }
        });

        return deferred.promise;
    }

    function angGridFormatTableSelect(params) {
        var str = '<select ng-model="tableAgents['+params.data.tableType+']" ng-options="agent.name for agent in agents" ng-change="agentChange(\''+params.data.tableType+'\')"><option value=""></option></select>';
        return str;
    }

    $scope.agentChange = function (table) {
        table = parseInt(table);

        var tableAgent = $scope.tableAgents[table];

        if(roomData){
            var agentAreas = roomData.agentAreas;
            if(agentAreas){

                for(var key in agentAreas){
                    var index = agentAreas[key].indexOf(table);
                    if(index >= 0){
                       agentAreas[key].splice(index, 1);
                    }
                }

                if(tableAgent){
                    if(!agentAreas[tableAgent._id._id]){
                        agentAreas[tableAgent._id._id] = [];
                    }
                    agentAreas[tableAgent._id._id].push(table);
                }
            }
        }

        roomData.agentAreas = agentAreas;

        var hkey2 = 'app:' + tmpl_id + ":config";
        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: hkey2, key: roomId, value: roomData}, {
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
            }
        });
    };

    function angGridFormatTableBtn(params) {
        return '<button class="btn btn-xs bg-primary" ng-click="goTableConfig(\''+tmpl_id+'\', \''+tmpl_type+'\',\''+roomId+'\',\''+params.data.tableType+'\')">桌子配置</button>';
    }

    $scope.goTableConfig = function(appId, type, roomId, id){
        $state.go('app.rooms.manage.gameset.table.edit' , {appId: appId, type: type, roomId: roomId, id: id});
    };


    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;

            getRoomAndAgentData().then(function () {

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


                        var funcs = [];
                        for(var key in data){
                            data[key].roomType = roomId;
                            data[key].tableType = key;
                            funcs.push(getAlgData(key));
                        }
                        $q.all(funcs).then(function (arr) {
                            // console.log(arr);
                            for(var i=0; i<arr.length; ++i){
                                var item = arr[i];
                                if(item && (typeof item == 'object')){
                                    data[item.roomId].diff = item.diff;
                                }

                                var agentAreas = roomData.agentAreas;
                                for(var key in agentAreas){
                                    var tt = parseInt(data[item.roomId].tableType);
                                    var index = agentAreas[key].indexOf(tt);
                                    if(index >= 0){
                                        for(var j in $scope.agents){
                                            if($scope.agents[j]._id._id == key){
                                                $scope.tableAgents[tt] = $scope.agents[j];
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }

                                var begin = roomData.startAreaId;
                                var end =  roomData.startAreaId + roomData.maxAreas;
                                if(item.roomId < end && item.roomId >= begin){
                                    rowsThisPage.push(data[item.roomId]);
                                }

                            }

                            var lastRow = rowsThisPage.length;
                            params.successCallback(rowsThisPage, lastRow);
                        });

                    }
                });


            });

        }
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
            $state.go('app.rooms.manage.gameset.table.edit' , {appId: tmpl_id, type: tmpl_type, roomId: roomId, id: cell.data.tableType});
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource,
        angularCompileRows: true
    };

    $scope.create = function () {
        $state.go("app.rooms.manage.gameset.table.edit", {appId: tmpl_id, type: tmpl_type, roomId: roomId});
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
                                key: e.tableType
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

app.controller('GameSetTableEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', '$location', '$anchorScroll', function($scope, $http, $state, $stateParams, $timeout, global, $location, $anchorScroll) {

    var tmpl_type = $stateParams.type;
    $scope.gameset_config_tmpl = "tpl/appmanager/gameset_" + $stateParams.type + "_table_edit.html";
    $scope.gameset_config_diffcult_tmpl = "tpl/appmanager/gameset_table_diffcult_edit.html";

    $scope.goScroll = function (anchor) {
        $location.hash(anchor);
        $anchorScroll();
    }

}]);

app.controller('GameSetTableDiffcultEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$q', 'global', function($scope, $http, $state, $stateParams, $timeout, $q, global) {

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;

    var hkey = 'app:'+ appId + ':config:area';

    var baseUrl = algUri + "/" + tmpl_type;

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

    getAlgData(id).then(function (data) {
        if(data && (typeof data == "object")){
            $scope.room = data;
            $scope.diff2 = $scope.showData.diffs[data.diff];
            var rejustDiffs = $scope.showData.rejustDiffs;
            for(var i=0; i< rejustDiffs; ++i){
                if(rejustDiffs[i].max_send == data.max_send){
                    $scope.diff3 = rejustDiffs[i];
                    break;
                }
            }
        }
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
    };


    $scope.saveDiff = function(diff){
        var jump = true;

        saveRoomDiffcult(jump, parseInt(diff));
    };

    $scope.saveRejustDiff = function (diff) {
        var jump = true;

        saveRoomRejust(jump, parseInt(diff));
    };

    function saveRoomDiffcult(jump, diff) {

        setDiff(id, diff).then(function (data) {
            if(data && data.ret == "ok"){
                $scope.success('设置成功');
                if(jump){
                    $state.go('app.rooms.manage.gameset.table.list', {appId: $stateParams.appId, type: $stateParams.type, roomId: $stateParams.roomId});
                }
            }else{
                $scope.error("算法设置难度失败");
            }
        });
    }

    function saveRoomRejust(jump, diff) {

        setRejustDiff(id, diff).then(function (data) {
            if(data && data.ret == "ok"){
                $scope.success('设置成功');
                if(jump){
                    $state.go('app.rooms.manage.gameset.table.list', {appId: $stateParams.appId, type: $stateParams.type, roomId: $stateParams.roomId});
                }
            }else{
                $scope.error("算法设置难度失败");
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
                    var diffData = { "room": parseInt(room), "diff": $scope.room.diff, "coin_rate": $scope.room.coin_rate, "totalPlayerNum": totalPlayerNum};
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

        return deferred.promise;
    }

}]);
