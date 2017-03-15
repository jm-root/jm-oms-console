/**
 * Created by ZL on 2017/2/28.
 */
"use strict";

app.controller('RobotManageCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    $scope.rooms = [];
    $scope.games = [
        {name: "捕鱼.神龙宝藏", key: "fish1"},
        {name: "捕鱼.黄金蟹", key: "fish2"},
        {name: "捕鱼.夺宝捕鱼", key: "fish3"},
        {name: "捕鱼.四鲨争霸", key: "fish4"},
        {name: "捕鱼.海王", key: "fish5"},
        {name: "捕鱼.美人鱼李靖", key: "fish6"},
        {name: "捕鱼.美人鱼哪吒", key: "fish7"},
        {name: "龙太子", key: "gamble1"},
        {name: "新龙太子", key: "gamble2"}
    ];

    $scope.areas = {
        fish1: [
            {name: "体验场", value: "1"},
            {name: "大众场", value: "2"},
            // {name: "3", value: "3"},
            {name: "至尊场", value: "4"}
        ],
        fish2: [
            {name: "体验场", value: "1"},
            {name: "大众场", value: "2"},
            // {name: "3", value: "3"},
            {name: "至尊场", value: "4"}
        ],
        fish3: [
            {name: "夺宝场", value: "5"}
        ],
        fish4: [
            {name: "体验场", value: "1"},
            {name: "大众场", value: "2"},
            // {name: "3", value: "3"},
            {name: "至尊场", value: "4"}
        ],
        fish5: [
            {name: "体验场", value: "1"},
            {name: "大众场", value: "2"},
            // {name: "3", value: "3"},
            {name: "至尊场", value: "4"}
        ],
        fish6: [
            {name: "体验场", value: "1"},
            {name: "大众场", value: "2"},
            // {name: "3", value: "3"},
            {name: "至尊场", value: "4"}
        ],
        fish7: [
            {name: "体验场", value: "1"},
            {name: "大众场", value: "2"},
            // {name: "3", value: "3"},
            {name: "至尊场", value: "4"}
        ],
        gamble1: [
            {name: "新手场", value: "1"},
            {name: "专业场", value: "2"}
        ],
        gamble2: [
            {name: "新手场", value: "3"},
            {name: "专业场", value: "4"}
        ]
    };

    var defaultRoom = {
        robots: 10,
        modes: {
            occupation: true,
            passive: false,
            active: false
        },
        entryTime: "2017-12-12 12:00:00",
        exitTime: "2017-12-13 12:00:00",
        gamePoint: {
            min: 10,
            max: 1000
        },
        entryInterval: {
            base: 5,
            float: 3
        },
        exitInterval: {
            base: 5,
            float: 3
        },
        changeTable: {
            min: 5,
            max: 10
        }
    };


    var ms = jm.ms;
    var client = null;
    var uri = "ws://" + robotUri;

    ms.client({
        uri: uri,
        reconnect: false
    }, function (err, doc) {
        if(!err){
            client = doc;

            client.on("open", function (event) {

                client.post("/subscribe", {channel: "front"}, function (err, doc) {
                    // console.log("subscribe front", err, doc);
                });

            });

            client.on("close", function (event) {

            });

            client.on("message", function (data) {
                var json = null;
                try {
                    json = JSON.parse(data);
                }
                catch (err) {
                    console.error(err.stack);
                    return;
                }
                if(json.type == 'message'){
                    // for(var key in self.messageCallbacks){
                    //     if(key == json.data.channel){
                    //         self.messageCallbacks[key](json);
                    //     }
                    // }
                    if(json.data.channel === "front"){
                        console.log("message ", json.data.msg);
                        var groups = json.data.msg;
                        $scope.$apply(function () {
                            $scope.groups = [];
                            for(var key in groups){
                                var group = groups[key];
                                group.groupId = key;
                                $scope.groups.push(group);
                            }
                            updateGroupData();
                            console.log("groups ", $scope.groups);
                        });
                    }
                }
            });
        }
    });

    $scope.addAgent = function () {

        client.post("/agent/new", null, function (err, doc) {
            // console.log("/agent/new ", err, doc);
        });
    };

    $scope.search = function () {

        client.post("/agent/search", {game: $scope.room.game.key, area: $scope.room.area.value}, function (err, doc) {
            // console.log("/agent/search ", err, doc);
            if(!err){

            }
        });
    };

    $scope.add = function () {
        // console.log("add");

        // console.log($scope.room);

        if(!moment($scope.room.entryTime).isValid() && !moment($scope.room.exitTime).isValid()){
            alert("进入时间或离开时间填写格式错误");
            return;
        }
        if(moment($scope.room.entryTime).isAfter(moment($scope.room.exitTime))){
            alert("进入时间晚于离开时间填写格式错误");
            return;
        }
        // if($scope.room.gamePoint.min >= $scope.room.gamePoint.max){
        //     alert("携带分数最小值必须小于最大值");
        //     return;
        // }
        if($scope.room.changeTable.min >= $scope.room.changeTable.max){
            alert("换桌局数最小值必须小于最大值");
            return;
        }

        var data = {};
        angular.copy($scope.room, data);
        data.game = data.game.key;
        data.area = data.area.value;

        client.post("/agent/run", {group: data}, function (err, doc) {
            // console.log("/agent/run ", err, doc);
            if(err){
                alert(doc.msg);
            }
        });

    };

    $scope.delete = function () {
        console.log("delete");

        client.post("/agent/stop", {groupId: $scope.room.groupId}, function (err, doc) {
            // console.log("/agent/stop", err, doc);
            if(!err){
                delete $scope.room.groupId;
                delete $scope.room.number;
                delete $scope.room.modes;
                delete $scope.room.entryTime;
                delete $scope.room.exitTime;
                delete $scope.room.gamePoint;
                delete $scope.room.entryInterval;
                delete $scope.room.exitInterval;
                delete $scope.room.changeTable;
                delete $scope.room.loginNormalUser;
            }
        });
    };

    var groupIndex = -1;
    $scope.clickRow = function (index) {
        // console.log(index);
        groupIndex = index;
        updateGroupData();
    };

    var updateGroupData = function () {

        if(groupIndex >= 0){
            var group = $scope.groups[groupIndex];
            if(group){
                $scope.room.groupId = group.groupId;
                $scope.room.isRunning = group.isRunning;
                if(group.isRunning){
                    $scope.room.number = group.number;
                    $scope.room.modes = group.modes;
                    $scope.room.entryTime = group.entryTime;
                    $scope.room.exitTime = group.exitTime ;
                    $scope.room.gamePoint = group.gamePoint;
                    $scope.room.entryInterval = group.entryInterval;
                    $scope.room.exitInterval = group.exitInterval;
                    $scope.room.changeTable = group.changeTable;
                    $scope.room.loginNormalUser = group.loginNormalUser;
                    for(var i=0; i<$scope.games.length; ++i){
                        var game = $scope.games[i];
                        if(game.key == group.game){
                            $scope.room.game = game;
                        }
                    }
                    for(var j=0; j<$scope.areas[group.game].length; ++j){
                        var area = $scope.areas[group.game][j];
                        if(area.value == group.area){
                            $scope.room.area = area;
                        }
                    }
                }
            }
        }

    };


    $scope.cleanRobot = function () {

        var uri = "http://" + robotUri + "/agent/clean";
        $http.get(uri, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                if(data.ret == true){
                    $scope.success("清理机器人数据成功");
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };


    $scope.onBeforeRenderOpenDate = function ($dates) {

    };

    $scope.endDateOnSetTimeOpenDate = function () {
        $scope.$broadcast('valid-openDate');
        $scope.$broadcast('valid-startDate');
        $scope.$broadcast('valid-endDate');
        $scope.$broadcast('valid-closeDate');
        if(!$scope.entryTime){
            $scope.entryTime = $scope.openDate;
        }
    };
    $scope.endDateOnSetTimeCloseDate = function () {
        $scope.$broadcast('valid-startDate');
        $scope.$broadcast('valid-endDate');
        $scope.$broadcast('valid-closeDate');
        if(!$scope.room.exitTime){
            $scope.room.exitTime = $scope.closeDate;
        }
    };

    $scope.onBeforeRenderCloseDate = function ($view,$dates) {
        if ($scope.openDate) {
            var activeDate = moment($scope.openDate).subtract(1, $view).add(1, 'minute');

            $dates.filter(function (date) {
                return date.localDateValue() <= activeDate.valueOf()
            }).forEach(function (date) {
                date.selectable = false;
            })
        }
    };

    $scope.onBeforeRenderStartDate = function ($view,$dates) {
        if ($scope.openDate) {
            var start = moment($scope.openDate).subtract(1, $view).add(1, 'minute');
            var end = moment($scope.closeDate);

            $dates.filter(function (date) {
                return date.localDateValue() <= start.valueOf()||date.localDateValue() > end.valueOf();
            }).forEach(function (date) {
                date.selectable = false;
            })
        }
    };

    $scope.onBeforeRenderEndDate = function ($view,$dates) {
        if ($scope.openDate) {
            var start = moment($scope.openDate).subtract(1, $view).add(1, 'minute');
            var end = moment($scope.closeDate);

            $dates.filter(function (date) {
                return date.localDateValue() <= start.valueOf()||date.localDateValue() > end.valueOf();
            }).forEach(function (date) {
                date.selectable = false;
            })
        }
    };

    $scope.$on("$destroy", function(){
        if(client){
            client.close();
        }
    });

}]);