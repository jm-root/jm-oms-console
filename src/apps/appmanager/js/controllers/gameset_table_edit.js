/**
 * Created by Admin on 2016/8/6.
 */
"use strict";
var sso = jm.sdk.sso;
app.controller('FishTableEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$q', function($scope, $http, $state, $stateParams, $q) {

    var tableDefault = {
        name: "桌子",
        intro: "桌子",
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
        areaRate: 100,
        free: 1,
        status: 1,
        visible: 1,
        autoSeat: 0,
        virtualOnlineCount: 0,
        rates: [1,2,3,4,5,6,7,8,9,10],
        //---------------
        baoji: 0,
        intervalChangeScene: 0,
        minFishes: 50,
        fixedRate: 0,
        doubleFire: 0,
        fireSpeed: 5,
        maxfireSpeed: 8,
        bulletSpeed: 1200,
        autoAim: 0
    };

    $scope.table = angular.copy(tableDefault);
    transformStr();
    var original = angular.copy($scope.table);

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;
    $scope.table.roomType = $stateParams.roomId;

    var baseUrl = algUri + "/" + tmpl_type;

    var hkey = 'app:'+ appId + ':config:area';

    $scope.hkey = hkey;
    $scope.id = id;
    $scope.type = tmpl_type;

    $scope.tabPageShow = false;

    if(id){
        $scope.table.tableType = id;
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
                $scope.table = result.ret;
                $scope.table.roomType = $stateParams.roomId;
                // transformStr();
                // original = angular.copy($scope.table);
                // $scope.tabPageShow = true;
                getAlgData(id).then(function (data) {
                    if(data && (typeof data == "object")){
                        $scope.table.diff = data.diff;
                    }
                    transformStr();
                    original = angular.copy($scope.table);
                    $scope.tabPageShow = true;
                });
            }
        });
    }else{
        $scope.tabPageShow = true;
    }

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

    function transformStr() {
        $scope.table.diff = $scope.table.diff + "";
        $scope.table.mode = $scope.table.mode + "";
        $scope.table.autoSeat = $scope.table.autoSeat + "";
        $scope.table.free = $scope.table.free + "";
        $scope.table.status = $scope.table.status + "";
        $scope.table.visible = $scope.table.visible + "";
        $scope.table.doubleFire = $scope.table.doubleFire + "";
        $scope.table.fixedRate = $scope.table.fixedRate + "";
        $scope.table.autoAim = $scope.table.autoAim + "";
    }

    function transformInt() {
        $scope.table.diff = parseInt($scope.table.diff);
        $scope.table.mode = parseInt($scope.table.mode);
        $scope.table.autoSeat = parseInt($scope.table.autoSeat);
        $scope.table.free = parseInt($scope.table.free);
        $scope.table.status = parseInt($scope.table.status);
        $scope.table.visible = parseInt($scope.table.visible);
        $scope.table.doubleFire = parseInt($scope.table.doubleFire);
        $scope.table.fixedRate = parseInt($scope.table.fixedRate);
        $scope.table.autoAim = parseInt($scope.table.autoAim);
        if(typeof $scope.table.rates == "string"){
            var rates = $scope.table.rates.split(",");
            for(var i=0; i<rates.length; ++i){
                rates[i] = parseInt(rates[i]);
            }
            $scope.table.rates = rates;
        }
    }


    $scope.save = function(){
        saveConfig(true);
    };

    $scope.recovery = function () {
        $scope.table = angular.copy(original);
    };

    function saveTableConfig(jump) {
        var key = $scope.table.tableType;
        transformInt();

        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: $scope.hkey, key: key, value: $scope.table}, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            transformStr();
            $scope.errorTips(code);
        }).success(function (result) {
            original = angular.copy($scope.table);
            transformStr();
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.success('设置成功');
                if(jump){
                    $state.go('app.rooms.manage.gameset.table.list', {appId: $stateParams.appId, type: $stateParams.type, roomId: $stateParams.roomId});
                }
            }
        });
    }

    function saveConfig(jump) {

        saveTableConfig(jump);
        // if($scope.table.diff == original.diff){
        //     saveTableConfig(jump);
        // }else{
        //     setDiff($scope.table.tableType, $scope.table.diff).then(function (data) {
        //         saveTableConfig(jump);
        //     }, function (data) {
        //         $scope.error("算法设置难度失败");
        //     });
        // }

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
            }else if(data.ret == "ok"){
                deferred.resolve(data);
            }else{
                deferred.reject(data);
            }
        });

        return deferred.promise;
    }
}]);

app.controller('GambleTableEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$q', function($scope, $http, $state, $stateParams,$q) {

    var tableDefault = {
        name: "新手港湾",
        intro: "新手港湾",
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
        areaRate: 100,
        free: 1,
        status: 1,
        visible: 1,
        autoSeat: 0,
        virtualOnlineCount: 0,
        rates: [1,2,3,4,5,6,7,8,9,10],
        //---------------
        betLimit: 1000,
        absenceNum: 10,
        perLimit: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
    };

    $scope.table = angular.copy(tableDefault);
    transformStr();
    var original = angular.copy($scope.table);

    var tmpl_type = $stateParams.type;
    var appId = $stateParams.appId;
    var id = $stateParams.id;
    $scope.table.roomType = $stateParams.roomId;

    var baseUrl = algUri + "/" + tmpl_type;

    var hkey = 'app:'+ appId + ':config:area';

    $scope.hkey = hkey;
    $scope.id = id;
    $scope.type = tmpl_type;

    $scope.tabPageShow = false;

    if(id){
        $scope.table.tableType = id;
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
                $scope.table = result.ret;
                $scope.table.roomType = $stateParams.roomId;

                getAlgData(id).then(function (data) {
                    if(data && (typeof data == "object")){
                        $scope.table.diff = data.diff;
                    }
                    transformStr();
                    original = angular.copy($scope.table);
                    $scope.tabPageShow = true;
                });


            }
        });
    }else{
        $scope.tabPageShow = true;
    }

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

    function transformStr() {
        $scope.table.diff = $scope.table.diff + "";
        $scope.table.mode = $scope.table.mode + "";
        $scope.table.autoSeat = $scope.table.autoSeat + "";
        $scope.table.free = $scope.table.free + "";
        $scope.table.status = $scope.table.status + "";
        $scope.table.visible = $scope.table.visible + "";
    }

    function transformInt() {
        $scope.table.diff = parseInt($scope.table.diff);
        $scope.table.mode = parseInt($scope.table.mode);
        $scope.table.autoSeat = parseInt($scope.table.autoSeat);
        $scope.table.free = parseInt($scope.table.free);
        $scope.table.status = parseInt($scope.table.status);
        $scope.table.visible = parseInt($scope.table.visible);
        if(typeof $scope.table.rates == "string"){
            var rates = $scope.table.rates.split(",");
            for(var i=0; i<rates.length; ++i){
                rates[i] = parseInt(rates[i]);
            }
            $scope.table.rates = rates;
        }
    }


    $scope.save = function(){
        saveConfig(true);
    };

    $scope.recovery = function () {
        $scope.table = angular.copy(original);
    };

    function saveTableConfig(jump) {
        var key = $scope.table.tableType;
        transformInt();

        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: $scope.hkey, key: key, value: $scope.table}, {
            params:{
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            transformStr();
            $scope.errorTips(code);
        }).success(function (result) {
            original = angular.copy($scope.table);
            transformStr();
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.success('设置成功');
                if(jump){
                    $state.go('app.rooms.manage.gameset.table.list', {appId: $stateParams.appId, type: $stateParams.type, roomId: $stateParams.roomId});
                }
            }
        });
    }

    function saveConfig(jump) {

        saveTableConfig(jump);
        // if($scope.table.diff == original.diff){
        //     saveTableConfig(jump);
        // }else{
        //     setDiff($scope.table.tableType, $scope.table.diff).then(function (data) {
        //         saveTableConfig(jump);
        //     }, function (data) {
        //         $scope.error("算法设置难度失败");
        //     });
        // }

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
            }else if(data.ret == "ok"){
                deferred.resolve(data);
            }else{
                deferred.reject(data);
            }
        });

        return deferred.promise;
    }

}]);
