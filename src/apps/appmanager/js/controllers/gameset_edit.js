/**
 * Created by Admin on 2016/8/6.
 */
"use strict";

app.controller('FishEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$q', 'global', function($scope, $http, $state, $stateParams, $q, global) {

    var roomDefault = {
        // name: "新手港湾",
        // intro: "新手港湾",
        name: global.translateByKey("appmgr.noviceBay"),
        intro: global.translateByKey("appmgr.noviceBay"),
        maxAmount: 0,
        minAmount: 0,
        diff: 0,
        exchangeAmount: 0,
        exchangeRate: 1,
        ctCode: "jb",
        mode: 0,
        oddsCredit: 0,
        ctCodeTicket: 'dbj',
        maxPlayers: 4,
        areaRate: 1,
        free: 1,
        status: 1,
        visible: 1,
        autoSeat: 0,
        virtualOnlineCount: 0,
        rates: [1,2,3,4,5,6,7,8,9,10],
        startAreaId: 1,
        maxAreas: 5,
        agentIsolate: 0,
        agentAreas : {},
        serverStatus: 1,
        //---------------
        baoji: 0,
        intervalChangeScene: 0,
        minFishes: 50,
        fixedRate: 0,
        doubleFire: 0,
        fireSpeed: 5,
        maxfireSpeed: 8,
        bulletSpeed: 1200,
        autoAim: 0,
        taskScore: 5
    };

    $scope.room = angular.copy(roomDefault);
    transformStr();
    var original = angular.copy($scope.room);

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;

    var hkey = 'app:'+ appId + ':config';

    $scope.hkey = hkey;
    $scope.id = id;
    $scope.type = tmpl_type;

    $scope.tabPageShow = false;

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
                transformStr();
                original = angular.copy($scope.room);
                $scope.tabPageShow = true;
            }
        });
    }else{
        $scope.tabPageShow = true;
    }

    function transformStr() {
        $scope.room.diff = $scope.room.diff + "";
        $scope.room.mode = $scope.room.mode + "";
        $scope.room.agentIsolate = $scope.room.agentIsolate + "";
        $scope.room.autoSeat = $scope.room.autoSeat + "";
        $scope.room.free = $scope.room.free + "";
        $scope.room.status = $scope.room.status + "";
        $scope.room.visible = $scope.room.visible + "";
        $scope.room.doubleFire = $scope.room.doubleFire + "";
        $scope.room.fixedRate = $scope.room.fixedRate + "";
        $scope.room.autoAim = $scope.room.autoAim + "";
        $scope.room.serverStatus = $scope.room.serverStatus + "";

        $scope.room.intervalChangeScene /= 1000;
    }

    function transformInt() {
        $scope.room.diff = parseInt($scope.room.diff);
        $scope.room.mode = parseInt($scope.room.mode);
        $scope.room.agentIsolate = parseInt($scope.room.agentIsolate);
        $scope.room.autoSeat = parseInt($scope.room.autoSeat);
        $scope.room.free = parseInt($scope.room.free);
        $scope.room.status = parseInt($scope.room.status);
        $scope.room.visible = parseInt($scope.room.visible);
        $scope.room.doubleFire = parseInt($scope.room.doubleFire);
        $scope.room.fixedRate = parseInt($scope.room.fixedRate);
        $scope.room.autoAim = parseInt($scope.room.autoAim);
        $scope.room.serverStatus = parseInt($scope.room.serverStatus);
        if(typeof $scope.room.rates == "string"){
            var rates = $scope.room.rates.split(",");
            for(var i=0; i<rates.length; ++i){
                rates[i] = parseInt(rates[i]);
            }
            $scope.room.rates = rates;
        }

        $scope.room.intervalChangeScene *= 1000;
    }

    $scope.checkRates = function (rates) {
        var ratesArr = rates;
        if(typeof rates == "string"){
            ratesArr = rates.split(",");
        }
        for(var i=0; i<ratesArr.length; i++){
            if(ratesArr[i] < 0 || isNaN(ratesArr[i])){
                $scope.error(global.translateByKey("appmgr.ratesFormatError"));
                return false;
            }
        }
        return true;
    };

    $scope.save = function(){
        saveConfig(true);
    };

    $scope.recovery = function () {
        $scope.room = angular.copy(original);
    };

    function saveRoomConfig(jump) {
        var key = $scope.room.roomType;
        transformInt();

        updateTables();

        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: $scope.hkey, key: key, value: $scope.room}, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            transformStr();
            $scope.errorTips(code);
        }).success(function (result) {
            original = angular.copy($scope.room);
            transformStr();
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{


                getConfigCoinRate().then(function (data) {
                    var coinRate = data.ret;


                    var isQuZheng = ((coinRate * $scope.room.exchangeRate) % $scope.room.areaRate !== 0);
                    if(isQuZheng){
                        // $scope.error("房间倍率必须能被常量乘与一币分值整除");
                        $scope.error(global.translateByKey("appmgr.toBeDivisibleBy"));
                        return;
                    }

                    var coin_rate = (coinRate * $scope.room.exchangeRate)/$scope.room.areaRate;
                    if(isNaN(coin_rate)){
                        coin_rate = 1;
                    }

                    if(coin_rate <= 0){
                        // $scope.error("投币比例要大于 0");
                        $scope.error(global.translateByKey("appmgr.coin_rateGt0"));
                        return;
                    }

                    var tableArr = [];
                    var begin = $scope.room.startAreaId;
                    var end = $scope.room.startAreaId + $scope.room.maxAreas;
                    for(var i=begin; i<end; ++i){
                        tableArr.push(i);
                    }
                    tableArr.forEach(function (e) {
                        getAlgData(e).then(function (data) {
                            if(data.coin_rate != coin_rate){
                                initTable(e, $scope.room.diff, coin_rate).then(function (data) {
                                    if(data.ret != "ok"){
                                        // $scope.error("设置桌子"+e+"投币比例失败");
                                        $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                                    }
                                });
                            }
                        }, function () {
                            // $scope.error("获取桌子"+e+"投币比例失败");
                            $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                        });
                    });

                }, function () {
                    // $scope.error("获取CoinRate失败");
                    $scope.error(global.translateByKey("appmgr.getCoinRateFail"));
                });


                // $scope.success('设置成功');
                $scope.success(global.translateByKey("common.succeed"));
                if(jump){
                    $state.go('app.rooms.manage.gameset.list', {appId: $stateParams.appId, type: $stateParams.type});
                }
            }
        });
    }

    function updateTables() {
        var hkey = 'app:'+ appId + ':config:area';

        var tableDefault = {
            // name: "桌子",
            // intro: "桌子",
            maxAmount: 0,
            minAmount: 0,
            diff: 0,
            exchangeAmount: 0,
            exchangeRate: 1,
            ctCode: "jb",
            mode: 0,
            oddsCredit: 0,
            ctCodeTicket: 'dbj',
            maxPlayers: 4,
            areaRate: 1,
            free: 1,
            status: 1,
            visible: 1,
            autoSeat: 0,
            virtualOnlineCount: 0,
            rates: [1,2,3,4,5,6,7,8,9,10],
            serverStatus: 1,
            //---------------
            baoji: 0,
            intervalChangeScene: 0,
            minFishes: 50,
            fixedRate: 0,
            doubleFire: 0,
            fireSpeed: 5,
            maxfireSpeed: 8,
            bulletSpeed: 1200,
            autoAim: 0,
            taskScore: 5
        };

        for(var key in tableDefault){
            if($scope.room && $scope.room[key] != undefined){
                tableDefault[key] = $scope.room[key];
            }
        }

        getConfigCoinRate().then(function (data) {
            var coinRate = data.ret;

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

                    var isQuZheng = ((coinRate * $scope.room.exchangeRate) % $scope.room.areaRate !== 0);
                    if(isQuZheng){
                        // $scope.error("房间倍率必须能被常量乘与一币分值整除");
                        $scope.error(global.translateByKey("appmgr.toBeDivisibleBy"));
                        return;
                    }

                    var coin_rate = (coinRate * $scope.room.exchangeRate)/$scope.room.areaRate;
                    if(isNaN(coin_rate)){
                        coin_rate = 1;
                    }

                    if(coin_rate <= 0){
                        // $scope.error("投币比例要大于 0");
                        $scope.error(global.translateByKey("appmgr.coin_rateGt0"));
                        return;
                    }

                    var begin = $scope.room.startAreaId;
                    var end = $scope.room.startAreaId + $scope.room.maxAreas;
                    var arr = [];
                    for(var i=begin; i<end; ++i){
                        arr.push(i);
                    }

                    arr.forEach(function (index) {
                        var i = index;

                        if(!data[i]){

                            initTable(i, tableDefault.diff, coin_rate).then(function (data) {
                                // setDiff(i, tableDefault.diff).then(function (data) {
                                if(data && data.ret == "ok"){

                                    var temp = angular.copy(tableDefault);

                                    temp.roomType = id;
                                    temp.tableType = i + "";
                                    // temp.name = "桌子" + i;
                                    // temp.intro = "桌子" + i + "简介";
                                    temp.name = global.translateByKey("appmgr.tableName");
                                    temp.intro = global.translateByKey("appmgr.tableName") + i + global.translateByKey("appmgr.intro");

                                    var url = appMgrUri + "/appConfig";
                                    $http.post(url, {root: hkey, key: i, value: temp}, {
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
                                            // $scope.success('创建桌子'+i+'成功');
                                            $scope.success(global.translateByKey("appmgr.createTable", {value: i}));
                                            // console.log('创建桌子'+i+'成功');
                                        }
                                    });

                                }else{

                                    // $scope.error("算法设置难度失败");
                                    $scope.error(global.translateByKey("setAlgDiffFail"));
                                }
                            });


                        }
                    });

                }
            });

        });

    }

    function saveConfig(jump) {

        // saveRoomConfig(jump);
        if($scope.room.diff == original.diff){
            saveRoomConfig(jump)
        }else{
            var funtions = [];
            for(var i=$scope.room.startAreaId; i<($scope.room.startAreaId+$scope.room.maxAreas); ++i){
                funtions.push(setDiff(i, $scope.room.diff));
            }

            $q.all(funtions).then(function (arr) {
                var isOk = true;
                for(var i=0; i<arr.length; ++i){
                    var item = arr[i];
                    if(!item || item.ret != "ok"){
                        isOk = false;
                        break;
                    }
                }

                if(!isOk){
                    // $scope.error("算法设置难度失败");
                    $scope.error(global.translateByKey("setAlgDiffFail"));
                }

                saveRoomConfig(jump);
            });
        }

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

    function initTable(room, diff, coin_rate) {

        var deferred = $q.defer();

        var totalPlayerNum = 4;
        var url = algUri + '/' + $stateParams.type + '/init';
        var diffData = { "room": parseInt(room), "diff": parseInt(diff), "coin_rate": parseInt(coin_rate), "totalPlayerNum": parseInt(totalPlayerNum)};
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

    function getConfigCoinRate() {

        var deferred = $q.defer();

        var url = appMgrUri + "/appConfig";
        $http.get(url, {
            params: {
                token: sso.getToken(),
                root: "SystemConfig",
                list: 0,
                key: "coinRate"
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

app.controller('GambleEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$q', 'global', function($scope, $http, $state, $stateParams, $q, global) {

    var roomDefault = {
        // name: "新手港湾",
        // intro: "新手港湾",
        name: global.translateByKey("appmgr.noviceBay"),
        intro: global.translateByKey("appmgr.noviceBay"),
        maxAmount: 0,
        minAmount: 0,
        diff: 0,
        exchangeAmount: 0,
        exchangeRate: 1,
        ctCode: "jb",
        mode: 0,
        oddsCredit: 0,
        ctCodeTicket: 'dbj',
        maxPlayers: 8,
        areaRate: 1,
        free: 1,
        status: 1,
        visible: 1,
        autoSeat: 0,
        virtualOnlineCount: 0,
        rates: [1,2,3,4,5,6,7,8,9,10],
        startAreaId: 1,
        maxAreas: 5,
        agentIsolate: 0,
        agentAreas : {},
        serverStatus: 1,
        //---------------
        betTime: 15000,
        betLimit: 1000,
        betLowLimit: 50,
        betLowLimitRed: 50,
        betLowLimitGreen: 50,
        betLowLimitDragon: 50,
        absenceNum: 10,
        perLimit: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
    };

    $scope.room = angular.copy(roomDefault);
    transformStr();
    var original = angular.copy($scope.room);

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;

    var hkey = 'app:'+ appId + ':config';

    $scope.hkey = hkey;
    $scope.id = id;
    $scope.type = tmpl_type;

    $scope.tabPageShow = false;

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
                transformStr();
                original = angular.copy($scope.room);
                $scope.tabPageShow = true;
            }
        });
    }else{
        $scope.tabPageShow = true;
    }

    function transformStr() {
        $scope.room.diff = $scope.room.diff + "";
        $scope.room.mode = $scope.room.mode + "";
        $scope.room.agentIsolate = $scope.room.agentIsolate + "";
        $scope.room.autoSeat = $scope.room.autoSeat + "";
        $scope.room.free = $scope.room.free + "";
        $scope.room.status = $scope.room.status + "";
        $scope.room.visible = $scope.room.visible + "";
        $scope.room.serverStatus = $scope.room.serverStatus + "";

        $scope.room.betTime /= 1000;
    }

    function transformInt() {
        $scope.room.diff = parseInt($scope.room.diff);
        $scope.room.mode = parseInt($scope.room.mode);
        $scope.room.agentIsolate = parseInt($scope.room.agentIsolate);
        $scope.room.autoSeat = parseInt($scope.room.autoSeat);
        $scope.room.free = parseInt($scope.room.free);
        $scope.room.status = parseInt($scope.room.status);
        $scope.room.visible = parseInt($scope.room.visible);
        $scope.room.statusStatus = parseInt($scope.room.statusStatus);
        if(typeof $scope.room.rates == "string"){
            var rates = $scope.room.rates.split(",");
            for(var i=0; i<rates.length; ++i){
                rates[i] = parseInt(rates[i]);
            }
            $scope.room.rates = rates;
        }

        $scope.room.betTime *= 1000;
    }

    $scope.checkRates = function (rates) {
        var ratesArr = rates;
        if(typeof rates == "string"){
            ratesArr = rates.split(",");
        }
        for(var i=0; i<ratesArr.length; i++){
            if(ratesArr[i] < 0 || isNaN(ratesArr[i])){
                $scope.error(global.translateByKey("appmgr.ratesFormatError"));
                return false;
            }
        }
        return true;
    };

    $scope.save = function(){
        saveConfig(true);
    };

    $scope.recovery = function () {
        $scope.room = angular.copy(original);
    };

    function saveRoomConfig(jump) {
        var key = $scope.room.roomType;
        transformInt();

        updateTables();

        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: $scope.hkey, key: key, value: $scope.room}, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            transformStr();
            $scope.errorTips(code);
        }).success(function (result) {
            original = angular.copy($scope.room);
            transformStr();
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{

                getConfigCoinRate().then(function (data) {
                    var coinRate = data.ret;

                    var isQuZheng = ((coinRate * $scope.room.exchangeRate) % $scope.room.areaRate !== 0);
                    if(isQuZheng){
                        // $scope.error("房间倍率必须能被常量乘与一币分值整除");
                        $scope.error(global.translateByKey("appmgr.toBeDivisibleBy"));
                        return;
                    }

                    var coin_rate = (coinRate * $scope.room.exchangeRate)/$scope.room.areaRate;
                    if(isNaN(coin_rate)){
                        coin_rate = 1;
                    }

                    if(coin_rate <= 0){
                        // $scope.error("投币比例要大于 0");
                        $scope.error(global.translateByKey("appmgr.coin_rateGt0"));
                        return;
                    }

                    var tableArr = [];
                    var begin = $scope.room.startAreaId;
                    var end = $scope.room.startAreaId + $scope.room.maxAreas;
                    for(var i=begin; i<end; ++i){
                        tableArr.push(i);
                    }
                    tableArr.forEach(function (e) {
                        getAlgData(e).then(function (data) {
                            if(data.coin_rate != coin_rate){
                                initTable(e, $scope.room.diff, coin_rate).then(function (data) {
                                    if(data.ret != "ok"){
                                        // $scope.error("设置桌子"+e+"投币比例失败");
                                        $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                                    }
                                });
                            }
                        }, function () {
                            // $scope.error("获取桌子"+e+"投币比例失败");
                            $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                        });
                    });

                }, function () {
                    // $scope.error("获取CoinRate失败");
                    $scope.error(global.translateByKey("appmgr.getCoinRateFail"));
                });


                // $scope.success('设置成功');
                $scope.success(global.translateByKey("common.succeed"));
                if(jump){
                    $state.go('app.rooms.manage.gameset.list', {appId: $stateParams.appId, type: $stateParams.type});
                }
            }
        });
    }

    function updateTables() {
        var hkey = 'app:'+ appId + ':config:area';

        var tableDefault = {
            // name: "新手港湾",
            // intro: "新手港湾",
            maxAmount: 0,
            minAmount: 0,
            diff: 0,
            exchangeAmount: 0,
            exchangeRate: 1,
            ctCode: "jb",
            mode: 0,
            oddsCredit: 0,
            ctCodeTicket: 'dbj',
            maxPlayers: 8,
            areaRate: 1,
            free: 1,
            status: 1,
            visible: 1,
            autoSeat: 0,
            virtualOnlineCount: 0,
            rates: [1,2,3,4,5,6,7,8,9,10],
            serverStatus: 1,
            //---------------
            betTime: 15000,
            betLimit: 1000,
            betLowLimit: 50,
            betLowLimitRed: 50,
            betLowLimitGreen: 50,
            betLowLimitDragon: 50,
            absenceNum: 10,
            perLimit: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
        };

        for(var key in tableDefault){
            if($scope.room && $scope.room[key] != undefined){
                tableDefault[key] = $scope.room[key];
            }
        }


        getConfigCoinRate().then(function (data) {
            var coinRate = data.ret;

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

                    var isQuZheng = ((coinRate * $scope.room.exchangeRate) % $scope.room.areaRate !== 0);
                    if(isQuZheng){
                        // $scope.error("房间倍率必须能被常量乘与一币分值整除");
                        $scope.error(global.translateByKey("appmgr.toBeDivisibleBy"));
                        return;
                    }

                    var coin_rate = (coinRate * $scope.room.exchangeRate)/$scope.room.areaRate;
                    if(isNaN(coin_rate)){
                        coin_rate = 1;
                    }

                    if(coin_rate <= 0){
                        // $scope.error("投币比例要大于 0");
                        $scope.error(global.translateByKey("appmgr.coin_rateGt0"));
                        return;
                    }

                    var begin = $scope.room.startAreaId;
                    var end = $scope.room.startAreaId + $scope.room.maxAreas;
                    var arr = [];
                    for(var i=begin; i<end; ++i){
                        arr.push(i);
                    }

                    arr.forEach(function (index) {
                        var i = index;

                        if(!data[i]){

                            initTable(i, tableDefault.diff, coin_rate).then(function (data) {
                                if(data && data.ret == "ok"){

                                    var temp = angular.copy(tableDefault);

                                    temp.roomType = id;
                                    temp.tableType = i + "";
                                    // temp.name = "桌子" + i;
                                    // temp.intro = "桌子" + i + "简介";
                                    temp.name = global.translateByKey("appmgr.tableName");
                                    temp.intro = global.translateByKey("appmgr.tableName") + i + global.translateByKey("appmgr.intro");


                                    var url = appMgrUri + "/appConfig";
                                    $http.post(url, {root: hkey, key: i, value: temp}, {
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
                                            // $scope.success('创建桌子'+i+'成功');
                                            $scope.success(global.translateByKey("appmgr.createTable", {value: i}));
                                        }
                                    });

                                }else{

                                    // $scope.error("算法设置难度失败");
                                    $scope.error(global.translateByKey("appmgr.setAlgDiffFail"));
                                }
                            }, function (data) {
                                $scope.error(global.translateByKey("appmgr.setAlgDiffFail"));
                            });
                        }
                    });

                }
            });


        });


    }
    function saveConfig(jump) {

        // saveRoomConfig(jump);
        if($scope.room.diff == original.diff){
            saveRoomConfig(jump);
        }else{
            var funtions = [];
            for(var i=$scope.room.startAreaId; i<($scope.room.startAreaId+$scope.room.maxAreas); ++i){
                funtions.push(setDiff(i, $scope.room.diff));
            }

            $q.all(funtions).then(function (arr) {
                var isOk = true;
                for(var i=0; i<arr.length; ++i){
                    var item = arr[i];
                    if(!item || item.ret != "ok"){
                        isOk = false;
                        break;
                    }
                }

                if(!isOk){
                    // $scope.error("算法设置难度失败");
                    $scope.error(global.translateByKey("appmgr.setAlgDiffFail"));
                }

                saveRoomConfig(jump);
            });
        }

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

    function initTable(room, diff, coin_rate) {

        var deferred = $q.defer();

        var totalPlayerNum = 8;
        var url = algUri + '/' + $stateParams.type + '/init';
        var diffData = { "room": parseInt(room), "diff": parseInt(diff), "coin_rate": parseInt(coin_rate), "totalPlayerNum": parseInt(totalPlayerNum)};
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

    function getConfigCoinRate() {

        var deferred = $q.defer();

        var url = appMgrUri + "/appConfig";
        $http.get(url, {
            params: {
                token: sso.getToken(),
                root: "SystemConfig",
                list: 0,
                key: "coinRate"
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

app.controller('HuluEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$q', 'global', function($scope, $http, $state, $stateParams, $q, global) {

    var roomDefault = {
        // name: "新手港湾",
        // intro: "新手港湾",
        name: global.translateByKey("appmgr.noviceBay"),
        intro: global.translateByKey("appmgr.noviceBay"),
        maxAmount: 0,
        minAmount: 0,
        diff: 0,
        exchangeAmount: 0,
        exchangeRate: 1,
        ctCode: "jb",
        mode: 0,
        oddsCredit: 0,
        ctCodeTicket: 'dbj',
        maxPlayers: 8,
        areaRate: 1,
        free: 1,
        status: 1,
        visible: 1,
        autoSeat: 0,
        virtualOnlineCount: 0,
        rates: [1,2,3,4,5,6,7,8,9,10],
        startAreaId: 1,
        maxAreas: 5,
        agentIsolate: 0,
        agentAreas : {},
        serverStatus: 1,
        //---------------
        betTime: 15000,
        betLimit: 1000,
        betLowLimit: 50,
        betLowLimitZhuang: 50,
        betLowLimitHe: 50,
        betLowLimitXian: 50,
        absenceNum: 10,
        perLimit: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
    };

    $scope.room = angular.copy(roomDefault);
    transformStr();
    var original = angular.copy($scope.room);

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;

    var hkey = 'app:'+ appId + ':config';

    $scope.hkey = hkey;
    $scope.id = id;
    $scope.type = tmpl_type;

    $scope.tabPageShow = false;

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
                transformStr();
                original = angular.copy($scope.room);
                $scope.tabPageShow = true;
            }
        });
    }else{
        $scope.tabPageShow = true;
    }

    function transformStr() {
        $scope.room.diff = $scope.room.diff + "";
        $scope.room.mode = $scope.room.mode + "";
        $scope.room.agentIsolate = $scope.room.agentIsolate + "";
        $scope.room.autoSeat = $scope.room.autoSeat + "";
        $scope.room.free = $scope.room.free + "";
        $scope.room.status = $scope.room.status + "";
        $scope.room.visible = $scope.room.visible + "";
        $scope.room.serverStatus = $scope.room.serverStatus + "";

        $scope.room.betTime /= 1000;
    }

    function transformInt() {
        $scope.room.diff = parseInt($scope.room.diff);
        $scope.room.mode = parseInt($scope.room.mode);
        $scope.room.agentIsolate = parseInt($scope.room.agentIsolate);
        $scope.room.autoSeat = parseInt($scope.room.autoSeat);
        $scope.room.free = parseInt($scope.room.free);
        $scope.room.status = parseInt($scope.room.status);
        $scope.room.visible = parseInt($scope.room.visible);
        $scope.room.serverStatus = parseInt($scope.room.serverStatus);
        if(typeof $scope.room.rates == "string"){
            var rates = $scope.room.rates.split(",");
            for(var i=0; i<rates.length; ++i){
                rates[i] = parseInt(rates[i]);
            }
            $scope.room.rates = rates;
        }

        $scope.room.betTime *= 1000;
    }

    $scope.checkRates = function (rates) {
        var ratesArr = rates;
        if(typeof rates == "string"){
            ratesArr = rates.split(",");
        }
        for(var i=0; i<ratesArr.length; i++){
            if(ratesArr[i] < 0 || isNaN(ratesArr[i])){
                $scope.error(global.translateByKey("appmgr.ratesFormatError"));
                return false;
            }
        }
        return true;
    };

    $scope.save = function(){
        saveConfig(true);
    };

    $scope.recovery = function () {
        $scope.room = angular.copy(original);
    };

    function saveRoomConfig(jump) {
        var key = $scope.room.roomType;
        transformInt();

        updateTables();

        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: $scope.hkey, key: key, value: $scope.room}, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            transformStr();
            $scope.errorTips(code);
        }).success(function (result) {
            original = angular.copy($scope.room);
            transformStr();
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{

                getConfigCoinRate().then(function (data) {
                    var coinRate = data.ret;

                    var isQuZheng = ((coinRate * $scope.room.exchangeRate) % $scope.room.areaRate !== 0);
                    if(isQuZheng){
                        // $scope.error("房间倍率必须能被常量乘与一币分值整除");
                        $scope.error(global.translateByKey("appmgr.toBeDivisibleBy"));
                        return;
                    }

                    var coin_rate = (coinRate * $scope.room.exchangeRate)/$scope.room.areaRate;
                    if(isNaN(coin_rate)){
                        coin_rate = 1;
                    }

                    if(coin_rate <= 0){
                        // $scope.error("投币比例要大于 0");
                        $scope.error(global.translateByKey("appmgr.coin_rateGt0"));
                        return;
                    }

                    var tableArr = [];
                    var begin = $scope.room.startAreaId;
                    var end = $scope.room.startAreaId + $scope.room.maxAreas;
                    for(var i=begin; i<end; ++i){
                        tableArr.push(i);
                    }
                    tableArr.forEach(function (e) {
                        getAlgData(e).then(function (data) {
                            if(data.coin_rate != coin_rate){
                                initTable(e, $scope.room.diff, coin_rate).then(function (data) {
                                    if(data.ret != "ok"){
                                        // $scope.error("设置桌子"+e+"投币比例失败");
                                        $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                                    }
                                });
                            }
                        }, function () {
                            // $scope.error("获取桌子"+e+"投币比例失败");
                            $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                        });
                    });

                }, function () {
                    // $scope.error("获取CoinRate失败");
                    $scope.error(global.translateByKey("appmgr.getCoinRateFail"));
                });


                // $scope.success('设置成功');
                $scope.success(global.translateByKey("common.succeed"));
                if(jump){
                    $state.go('app.rooms.manage.gameset.list', {appId: $stateParams.appId, type: $stateParams.type});
                }
            }
        });
    }

    function updateTables() {
        var hkey = 'app:'+ appId + ':config:area';

        var tableDefault = {
            // name: "新手港湾",
            // intro: "新手港湾",
            maxAmount: 0,
            minAmount: 0,
            diff: 0,
            exchangeAmount: 0,
            exchangeRate: 1,
            ctCode: "jb",
            mode: 0,
            oddsCredit: 0,
            ctCodeTicket: 'dbj',
            maxPlayers: 8,
            areaRate: 1,
            free: 1,
            status: 1,
            visible: 1,
            autoSeat: 0,
            virtualOnlineCount: 0,
            rates: [1,2,3,4,5,6,7,8,9,10],
            serverStatus: 1,
            //---------------
            betTime: 15000,
            betLimit: 1000,
            betLowLimit: 50,
            betLowLimitZhuang: 50,
            betLowLimitHe: 50,
            betLowLimitXian: 50,
            absenceNum: 10,
            perLimit: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
        };

        for(var key in tableDefault){
            if($scope.room && $scope.room[key] != undefined){
                tableDefault[key] = $scope.room[key];
            }
        }


        getConfigCoinRate().then(function (data) {
            var coinRate = data.ret;

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

                    var isQuZheng = ((coinRate * $scope.room.exchangeRate) % $scope.room.areaRate !== 0);
                    if(isQuZheng){
                        // $scope.error("房间倍率必须能被常量乘与一币分值整除");
                        $scope.error(global.translateByKey("appmgr.toBeDivisibleBy"));
                        return;
                    }

                    var coin_rate = (coinRate * $scope.room.exchangeRate)/$scope.room.areaRate;
                    if(isNaN(coin_rate)){
                        coin_rate = 1;
                    }

                    if(coin_rate <= 0){
                        // $scope.error("投币比例要大于 0");
                        $scope.error(global.translateByKey("appmgr.coin_rateGt0"));
                        return;
                    }

                    var begin = $scope.room.startAreaId;
                    var end = $scope.room.startAreaId + $scope.room.maxAreas;
                    var arr = [];
                    for(var i=begin; i<end; ++i){
                        arr.push(i);
                    }

                    arr.forEach(function (index) {
                        var i = index;

                        if(!data[i]){

                            initTable(i, tableDefault.diff, coin_rate).then(function (data) {
                                if(data && data.ret == "ok"){

                                    var temp = angular.copy(tableDefault);

                                    temp.roomType = id;
                                    temp.tableType = i + "";
                                    // temp.name = "桌子" + i;
                                    // temp.intro = "桌子" + i + "简介";
                                    temp.name = global.translateByKey("appmgr.tableName");
                                    temp.intro = global.translateByKey("appmgr.tableName") + i + global.translateByKey("appmgr.intro");


                                    var url = appMgrUri + "/appConfig";
                                    $http.post(url, {root: hkey, key: i, value: temp}, {
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
                                            // $scope.success('创建桌子'+i+'成功');
                                            $scope.success(global.translateByKey("appmgr.createTable", {value: i}));
                                        }
                                    });

                                }else{

                                    // $scope.error("算法设置难度失败");
                                    $scope.error(global.translateByKey("appmgr.setAlgDiffFail"));
                                }
                            }, function (data) {
                                $scope.error(global.translateByKey("appmgr.setAlgDiffFail"));
                            });
                        }
                    });

                }
            });


        });


    }
    function saveConfig(jump) {

        // saveRoomConfig(jump);
        if($scope.room.diff == original.diff){
            saveRoomConfig(jump);
        }else{
            var funtions = [];
            for(var i=$scope.room.startAreaId; i<($scope.room.startAreaId+$scope.room.maxAreas); ++i){
                funtions.push(setDiff(i, $scope.room.diff));
            }

            $q.all(funtions).then(function (arr) {
                var isOk = true;
                for(var i=0; i<arr.length; ++i){
                    var item = arr[i];
                    if(!item || item.ret != "ok"){
                        isOk = false;
                        break;
                    }
                }

                if(!isOk){
                    // $scope.error("算法设置难度失败");
                    $scope.error(global.translateByKey("appmgr.setAlgDiffFail"));
                }

                saveRoomConfig(jump);
            });
        }

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

    function initTable(room, diff, coin_rate) {

        var deferred = $q.defer();

        var totalPlayerNum = 8;
        var url = algUri + '/' + $stateParams.type + '/init';
        var diffData = { "room": parseInt(room), "diff": parseInt(diff), "coin_rate": parseInt(coin_rate), "totalPlayerNum": parseInt(totalPlayerNum)};
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

    function getConfigCoinRate() {

        var deferred = $q.defer();

        var url = appMgrUri + "/appConfig";
        $http.get(url, {
            params: {
                token: sso.getToken(),
                root: "SystemConfig",
                list: 0,
                key: "coinRate"
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