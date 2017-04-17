app.controller('TableCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', function ($scope, $state, $stateParams, $http, global) {
    var sso = jm.sdk.sso;
    var page = 1;
    var history = global.TableHistory||(global.TableHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;

    //判断是否移动端设置表格样式
    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-240+'px'
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

    var aa = [];
    var result = {"page":0, "pages":0, "total": 0, rows: 0};



    $scope.getdata = function(keyword,_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        //获取游戏
        $http.get(appMgrUri+'/apps', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize,
                status:1
            }
        }).success(function(result){

            var game = new Array();
            for(var k = 0; k< result.rows.length; k++){
                // console.log(result.rows[k]);
                if(result.rows[k].category != 3){
                    game.push(result.rows[k]);
                }
            }

            // console.log(a);
            for(var gameid = 0; gameid< game.length; gameid++) {
                var id = game[gameid]._id;
                // console.log(id);

                //获取房间
                var hkey = 'app:' + id + ":config";

                $http.get(appMgrUri + "/appConfig", {
                    params: {
                        token: sso.getToken(),
                        root: hkey,
                        list: 1,
                        all: 1
                    }
                }).success(function (result) {
                    // console.log(result);

                    var rooms = new Array();
                    for(var key in result){
                        if(result[key].roomType != 1){
                            rooms.push(result[key]);
                        }
                    }
                    console.log(rooms);

                    //获取桌子
                    $http.get(algUri + '/' + $stateParams.type + '/getAlgData', {
                        params:{
                            token: sso.getToken(),
                            room: parseInt(rooms)
                        }
                    }).success(function (result) {
                        console.log(result);
                    });
                    // var promise = getAlgData();

                    // var tableArr = [];
                    // tableArr.forEach(function (e) {
                    //     getAlgData(e).then(function (data) {
                    //     //     if(data.coin_rate != coin_rate){
                    //     //         initTable(e, $scope.room.diff, coin_rate).then(function (data) {
                    //     //             if(data.ret != "ok"){
                    //     //                 // $scope.error("设置桌子"+e+"投币比例失败");
                    //     //                 $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                    //     //             }
                    //     //         });
                    //     //     }
                    //     // }, function () {
                    //     //     // $scope.error("获取桌子"+e+"投币比例失败");
                    //     //     $scope.error(global.translateByKey("appmgr.setTableXCoinRateFail", {value: e}));
                    //     });
                    // });

                    if (result.err) {
                        $scope.error(result.msg);
                    } else {
                        $scope.moreLoading = false;
                        // $('html,body').animate({ scrollTop: 0 }, 100);

                        $scope.gameName = game;
                        // console.log($scope.gameName);

                        if (result.total) {
                            $scope.nodata = false;
                            // $scope.table = a;
                            // $scope.page = result.page;
                            // $scope.pages = result.pages;
                            // $scope.total = result.total;
                            // $scope.totalnumber = global.reg(result.total);
                            // var row1 = [];

                        } else {
                            $scope.nodata = true;
                        }
                    }
                }).error(function (msg, code) {
                    $scope.errorTips(code);
                });
            }

        });


    }



    // function getAlgData(room) {
    //
    //     var deferred = $q.defer();
    //
    //     $http.get(algUri + '/' + $stateParams.type + '/getAlgData', {
    //         params:{
    //             token: sso.getToken(),
    //             room: parseInt(room)
    //         }
    //     }).error(function (msg, code) {
    //         deferred.reject(code);
    //     }).success(function (result) {
    //         console.log(result);
    //         var data = result;
    //         if(data.err){
    //             deferred.reject(data);
    //         }else{
    //             deferred.resolve(data);
    //         }
    //     });
    //
    //     return deferred.promise;
    // };

    // var id = gameid._id;

            // console.log(id);
            //
            // var hkey = 'app:' + id + ":config";
            //
            // $http.get(appMgrUri + "/appConfig", {
            //     params: {
            //         token: sso.getToken(),
            //         root: hkey,
            //         list: 1,
            //         all: 1
            //     }
            // }).success(function (result) {
            //     console.log(result);


                // var data = result;
                //
                // var hkey1 = 'app:' + id + ":config:area";
                //
                //
                // var url = algUri + '/' + $stateParams.type + '/getAlgData';
                // $http.get(url, {
                //     params:{
                //         token: sso.getToken(),
                //         room: parseInt(room)
                //     }
                // }).error(function (msg, code) {
                //     deferred.reject(code);
                // }).success(function (result) {
                //     var data = result;
                //     if(data.err){
                //         deferred.reject(data);
                //     }else{
                //         deferred.resolve(data);
                //     }
                // });







                // console.log(a);
        //         if(result.err){
        //             $scope.error(result.msg);
        //         }else{
        //             $scope.moreLoading = false;
        //             // $('html,body').animate({ scrollTop: 0 }, 100);
        //
        //             $scope.gameName = a;
        //             console.log($scope.gameName);
        //
        //             if(result.total){
        //                 $scope.nodata = false;
        //                 // $scope.table = a;
        //                 // $scope.page = result.page;
        //                 // $scope.pages = result.pages;
        //                 // $scope.total = result.total;
        //                 // $scope.totalnumber = global.reg(result.total);
        //                 // var row1 = [];
        //
        //             }else{
        //                 $scope.nodata = true;
        //             }
        //         }
        //     }).error(function(msg, code){
        //         $scope.errorTips(code);
        //     });
        //
        // });





    $scope.getdata();


    $scope.onPageSizeChanged = function() {
        page = 1;
        $scope.getdata();
    };
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
        $scope.onPageSizeChanged();
    });

}]);