app.controller('TableCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var page = 1;
    var history = global.TableHistory||(global.TableHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search;
    $scope.games = [];
    $scope.page = 1;

    //判断是否移动端设置表格样式
    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-250+'px'
        }
    }

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.getdata();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.getdata();
        }
    };

    function sum(array) {
        var sum = 0;
        for (var i=0; i < array.length; i++)
            sum += array[i];
        return sum ;
    }

    var reqApps = false;
    var reqRooms = 0;
    var reqTables = 0;


    $scope.getdata = function(keyword,_page) {
        $scope.page = page;

        if(reqApps){
            return;
        }
        reqApps = true;

        var allData = [];

        if(_page) page = _page;
        $scope.nodata = false;
        $scope.moreLoading = true;
        $http.get(appMgrUri+'/apps', {
            params:{
                token: sso.getToken(),
            }
        }).success(function(result){
            var game = new Array();
            for(var k = 0; k< result.rows.length; k++){
                if(result.rows[k].category != 3){
                    game.push(result.rows[k]);
                }
            }
            reqApps = false;

            $scope.games = [];
            game.forEach(function (e, i, arr) {
                var id = e._id;
                var tmpl = e.tmpl;
                var gamename = e.name;
                $scope.games.push(gamename);

                //桌子
                reqTables++;
                var hkey1 = 'app:' + id + ":config:area";
                $http.get(appMgrUri + "/appConfig", {
                    params: {
                        token: sso.getToken(),
                        root: hkey1,
                        list: 1,
                        all: 1
                    }
                }).success(function (result) {
                    var tableresult = result;
                    reqTables--;

                    reqRooms++;
                    //房间
                    var hkey = 'app:' + id + ":config";
                    $http.get(appMgrUri + "/appConfig", {
                        params: {
                            token: sso.getToken(),
                            root: hkey,
                            list: 1,
                            all: 1
                        }
                    }).success(function (result) {

                        var rooms = [];
                        for (var key in result) {
                            if (result[key].roomType != '1') {
                                rooms.push(result[key]);
                            }
                        }


                        reqRooms--;

                        var roomEmp = _.isEmpty(result);
                        if(roomEmp){
                            allData = _.sortBy(allData, ['gamename', 'tablenum']);

                            if($scope.search){
                                allData = _.filter(allData, {gamename: $scope.search});
                            }

                            var begin = ($scope.page - 1) * Number($scope.pageSize);
                            var end = begin + Number($scope.pageSize);
                            $scope.allData = [];
                            for(var i= begin; i< end; i++){
                                if($scope.allData[i] == undefined){
                                    $scope.allData[i] = allData[i];
                                }
                            }

                            // $scope.allData.forEach(function (e, i) {
                            //
                            //
                            //     $http.get(algUri + '/' + e.tmpl + '/getAlgData', {
                            //         params:{
                            //             token: sso.getToken(),
                            //             room: parseInt(e.tablenum)
                            //         }
                            //     }).success(function (result) {
                            //         var gin = result.gIn;
                            //         var gout = result.gOut;
                            //         var gcoin = result.coin_rate;
                            //         var rate;
                            //         var profit;
                            //         if (Object.prototype.toString.call(gin) == '[object Array]') {
                            //             var sumin = sum(gin);
                            //         } else {
                            //             var sumin = gin;
                            //         }
                            //
                            //         if (Object.prototype.toString.call(gout) == '[object Array]') {
                            //             var sumout = sum(gout);
                            //         } else {
                            //             var sumout = gout;
                            //         }
                            //
                            //         var gain = sumin - sumout;
                            //         if (sumin <= 0) {
                            //             rate = 0;
                            //         } else {
                            //             rate = gain / sumin;
                            //             rate = rate.toFixed(4);
                            //         }
                            //
                            //         if (gcoin <= 0) {
                            //             profit = 0;
                            //         } else {
                            //             profit = gain / gcoin;
                            //         }
                            //
                            //         e.in = sumin;
                            //         e.out = sumout;
                            //         e.gain = gain;
                            //         e.rate = rate;
                            //         e.profit = profit;
                            //     });
                            // });

                            $scope.moreLoading = false;
                            // $('html,body').animate({ scrollTop: 0 }, 100);
                            if(allData.length){
                                $scope.nodata = false;
                                $scope.page = page;
                                $scope.pages = Math.ceil(allData.length/$scope.pageSize);
                                $scope.total = allData.length;
                                $scope.totalnumber = global.reg(allData.length);
                            }else{
                                $scope.nodata = true;
                                $scope.pages = 0;
                                $scope.total = 0;
                                $scope.totalnumber = 0;
                            }
                        }


                        for(var roomtype=0;roomtype <rooms.length;roomtype++){
                            for(var tabletype1=rooms[roomtype].startAreaId;tabletype1<rooms[roomtype].startAreaId+rooms[roomtype].maxAreas;tabletype1++){
                                var dataname = gamename;
                                var tablenum = tabletype1;
                                var dataroom = rooms[roomtype].name;
                                var tmpl = e.tmpl;
                                if(!tablename){
                                    var a = tableresult[tabletype1];
                                }
                                var tablename ="";
                                var a = tableresult[tabletype1];
                                if(a && a.name){
                                    tablename = tableresult[tabletype1].name;
                                }

                                var rowdata = {
                                    gamename:dataname,
                                    gameroom:dataroom,
                                    tablenum:tablenum,
                                    tablename:tablename,
                                    tmpl: tmpl
                                };

                                allData.push(rowdata);

                                if(!reqApps && reqRooms == 0 && reqTables == 0){
                                        allData = _.sortBy(allData, ['gamename', 'tablenum']);

                                        if($scope.search){
                                            allData = _.filter(allData, {gamename: $scope.search});
                                        }

                                        var begin = ($scope.page - 1) * Number($scope.pageSize);
                                        var end = begin + Number($scope.pageSize);
                                        $scope.allData = [];
                                        for(var i= begin; i< end; i++){
                                            if($scope.allData[i] == undefined){
                                                $scope.allData[i] = allData[i];
                                            }
                                        }

                                    $scope.allData.forEach(function (e, i) {
                                        if(e == undefined){
                                            return;
                                        }

                                            $http.get(algUri + '/' + e.tmpl + '/getAlgData', {
                                                params:{
                                                    token: sso.getToken(),
                                                    room: parseInt(e.tablenum),
                                                    // async:false

                                                }
                                            }).success(function (result) {
                                                var gin = result.gIn;
                                                var gout = result.gOut;
                                                var gcoin = result.coin_rate;
                                                var rate;
                                                var profit;
                                                if (Object.prototype.toString.call(gin) == '[object Array]') {
                                                    var sumin = sum(gin);
                                                } else {
                                                    var sumin = gin;
                                                }

                                                if (Object.prototype.toString.call(gout) == '[object Array]') {
                                                    var sumout = sum(gout);
                                                } else {
                                                    var sumout = gout;
                                                }

                                                var gain = sumin - sumout;
                                                if (sumin <= 0) {
                                                    rate = 0;
                                                } else {
                                                    rate = gain / sumin;
                                                    rate = rate.toFixed(4);
                                                }

                                                if (gcoin <= 0) {
                                                    profit = 0;
                                                } else {
                                                    profit = gain / gcoin;
                                                }

                                                e.in = sumin;
                                                e.out = sumout;
                                                e.gain = gain;
                                                e.rate = rate;
                                                e.profit = profit;
                                                // e.result = result;
                                            });
                                        });

                                        $scope.moreLoading = false;
                                        // $('html,body').animate({ scrollTop: 0 }, 100);
                                        if(allData.length){
                                            $scope.nodata = false;
                                            $scope.page = page;
                                            $scope.pages = Math.ceil(allData.length/$scope.pageSize);
                                            $scope.total = allData.length;
                                            $scope.totalnumber = global.reg(allData.length);
                                        }else{
                                            $scope.nodata = true;
                                            $scope.pages = 0;
                                            $scope.total = 0;
                                            $scope.totalnumber = 0;
                                        }


                                }

                            }
                        }
                    });
                });
            });

        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    // $scope.getdata();


    $scope.onPageSizeChanged = function() {
        // page = 1;
        $scope.getdata();
    };
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
        $scope.onPageSizeChanged();
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

}]);