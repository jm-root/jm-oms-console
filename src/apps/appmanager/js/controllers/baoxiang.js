/**
 * Created by ZL on 2016/9/17.
 */
"use strict";

var sso =jm.sdk.sso;
app.controller('BaoXiangListCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', function ($scope, $state, $stateParams, $http, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

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
    // jm.sdk.init({uri: gConfig.sdkHost});
    // var config = jm.sdk.config;

    // var hkey = 'appConfig_baoxiang';
    var tmpl_id = $stateParams.appId;
    // var tmpl_type = $stateParams.type;
    // var hkey = 'appConfig_' + tmpl_id;
    var hkey = 'app:' + tmpl_id + ':config';



    var columnDefs = [
        {headerName: "宝箱类型", field: "boxType", width: 200},
        {headerName: "#", width: 200, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'appmgr.baoxiangType'
    ]);

    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="goCheck(\''+params.data.boxType+'\')" translate=\'appmgr.check\'>查看</button>';
    };

    $scope.goCheck = function (id) {
        $state.go('app.rooms.manage.baoxiang.record.list' , {appId: $stateParams.appId, typeId: id});
    };

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            // config.listConfig({token: sso.getToken(),root:hkey, all:true},function(err,result){
            //     var data = result;
            //     if(data.err && data.err != 404){
            //         $scope.error(data.msg);
            //     }else{
            //         if(data.err == 404){
            //             data = {};
            //         }
            //         var rowsThisPage = [];
            //
            //         for(var key in data){
            //             data[key].boxType = key;
            //             rowsThisPage.push(data[key]);
            //         }
            //
            //         var lastRow = rowsThisPage.length;
            //         params.successCallback(rowsThisPage, lastRow);
            //     }
            // });
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
                        data[key].boxType = key;
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
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.rooms.manage.baoxiang.edit' , {appId: tmpl_id, id: cell.data.boxType});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.rooms.manage.baoxiang.edit' , {appId: tmpl_id, id: cell.data.boxType});
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
        $state.go("app.rooms.manage.baoxiang.edit", {appId: tmpl_id});
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title: global.translateByKey("openTips.title"),
                content:global.translateByKey("openTips.delContent"),
                okTitle:global.translateByKey("common.yes"),
                cancelTitle:global.translateByKey("common.no"),
                okCallback: function(){
                    var ids = 0;
                    rows.forEach(function(e){
                        // config.delConfig({token: sso.getToken(),root:hkey,key:e.boxType}, function (err, result) {
                        //     if(err){
                        //         $scope.error(err.message);
                        //     }else{
                        //         if(result.err){
                        //             $scope.error(err.msg);
                        //         }else{
                        //             ids++;
                        //             if(ids == len){
                        //                 $scope.success('操作成功');
                        //                 $scope.gridOptions.api.setDatasource(dataSource);
                        //             }
                        //         }
                        //     }
                        // });
                        var url = appMgrUri + "/appConfig";
                        $http.delete(url, {
                            params: {
                                token: sso.getToken(),
                                root: hkey,
                                key: e.boxType
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
                                    // $scope.success('操作成功');
                                    $scope.success(global.translateByKey("common.succeed"));
                                    $scope.gridOptions.api.setDatasource(dataSource);
                                }
                            }
                        });
                    });
                }
            });
        }else{
            $scope.openTips({
                title: global.translateByKey("openTips.title"),
                content:global.translateByKey("openTips.selectDelContetn"),
                cancelTitle:global.translateByKey("openTips.cancelDelConfirm"),
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

}]);


app.controller('BaoXiangEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {

    // jm.sdk.init({uri: gConfig.sdkHost});
    // var config = jm.sdk.config;

    $scope.$state = $state;

    var id = $stateParams.id;
    var appId = $stateParams.appId;
    var hkey = 'app:' + appId + ':config';
    $scope.id = id;

    $scope.goBaoxiangList = function () {
        $state.go("app.rooms.manage.baoxiang.list", {appId: $stateParams.appId});
    };


    var boxDefault1 =
    {
        in: [
            {ctCode: "jb", amount: 100000}
        ],
        out: [
            {ctCode: "dbj", min: 8, max: 12, mid: 10, odds: 45}
        ],
        introduce: "100000金币赢夺宝卷！"
    };

    $scope.box = angular.copy(boxDefault1);

    if(id){
        $scope.boxType = id;
        // config.getConfig({token: sso.getToken(),root:hkey,key:id},function(err,result){
        //     if(err){
        //         err = err || result&&result.msg;
        //         return $scope.error(err.message);
        //     }else{
        //         if(result.err){
        //             $scope.error(result.msg);
        //         }else{
        //             $scope.box = result.ret;
        //         }
        //     }
        // });
        var url = appMgrUri + "/appConfig";
        $http.get(url, {
            params:{
                token: sso.getToken(),
                root: hkey,
                key: id,
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        }).success(function (result) {
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.box = result.ret;
            }
        });
    }

    $scope.save = function(){
        saveConfig();
    };

    function saveConfig() {
        var key = $scope.boxType;
        var url = appMgrUri + "/appConfig";
        $http.post(url, {root: hkey, key: key, value: $scope.box}, {
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
                // $http.get(baoxiangUri+'/updateConfig', {
                //     params:{
                //         token: sso.getToken()
                //     }
                // }).success(function(result){
                //     var obj = result;
                //     if(obj.err){
                //         $scope.error(obj.msg);
                //     }else{
                //         $timeout(function(){
                //             $scope.success('设置成功');
                //             $state.go('app.rooms.manage.baoxiang.list', {appId: appId});
                //         });
                //     }
                // }).error(function(msg, code){
                //     $scope.errorTips(code);
                // });
                // $scope.success('设置成功');
                $scope.success(global.translateByKey("common.succeed"));
                $state.go('app.rooms.manage.baoxiang.list', {appId: appId});
            }
        });
    }

    $scope.addCost = function () {
        var temp = angular.copy(boxDefault1.in[0]);
        $scope.box.in.push(temp);
    };

    $scope.delCost = function (index) {
        $scope.box.in.splice(index, 1);
    };

    $scope.addAward = function () {
        var temp = angular.copy(boxDefault1.out[0]);
        $scope.box.out.push(temp);
    };

    $scope.delAward = function (index) {
        $scope.box.out.splice(index, 1);
    };

}]);


app.controller('BaoXiangRecordListCtrl', ['$scope', '$state', '$stateParams', '$http', 'global', function ($scope, $state, $stateParams, $http, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var type = $stateParams.typeId;

    $scope.goBaoxiangList = function () {
        $state.go("app.rooms.manage.baoxiang.list", {appId: $stateParams.appId});
    };

    var columnDefs = [
        // {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "用户id", field: "userId", width: 100},
        {headerName: "用户呢称", field: "userNick", width: 120},
        {headerName: "宝箱类型", field: "type", width: 120},
        {headerName: "消耗", field: "costs", width: 120, valueGetter: angGridFormatCosts},
        {headerName: "奖励", field: "awards", width: 120, valueGetter: angGridFormatAwards},
        {headerName: "支付id", field: "payId", width: 120},
        {headerName: "状态", field: "status", width: 120, valueGetter: angGridFormatStatus},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS},
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'appmgr.userId',
        'appmgr.userName',
        'appmgr.baoxiangType',
        'appmgr.cost',
        'appmgr.award',
        'appmgr.payId',
        'appmgr.status',
        'common.mtime',
        'common.ctime'
    ]);

    function angGridFormatStatus(params) {
        var formatStr = params.data.status + "";
        switch (params.data.status){
            case 1:
                formatStr = global.translateByKey("appmgr.orderGeneration");
                break;
            case 2:
                formatStr = global.translateByKey("appmgr.paymentCompleted");
                break;
            case 3:
                formatStr = global.translateByKey("appmgr.transactionCompleted");
                break;

        }
        return formatStr;
    };

    function angGridFormatCosts(params) {
        var formatStr = "";

        for(var i in params.data.costs){
            formatStr += params.data.costs[i].ctCode + ":" + params.data.costs[i].amount + ", ";
        }

        return formatStr;
    };

    function angGridFormatAwards(params) {
        var formatStr = "";

        for(var i in params.data.awards){
            formatStr += params.data.awards[i].ctCode + ":" + params.data.awards[i].amount + ", ";
        }

        return formatStr;
    };

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(baoxiangUri+'/records/'+type, {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows || [];
                    var lastRow = data.total||rowsThisPage.length||0;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function(msg, code){
                $scope.errorTips(code);
            });
        }
    };

    $scope.gridOptions = {
        paginationPageSize: Number($scope.pageSize),
        rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            // $state.go('app.shop.product.edit' , {id: cell.data._id});
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource,
        angularCompileRows: true,
        headerCellRenderer: global.agGridHeaderCellRendererFunc
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title: global.translateByKey("openTips.title"),
                content: global.translateByKey("openTips.delContent"),
                okTitle: global.translateByKey("common.yes"),
                cancelTitle: global.translateByKey("common.no"),
                okCallback: function(){
                    var ids = '';
                    rows.forEach(function(e){
                        if(ids) ids += ',';
                        ids += e._id;
                    });
                    $http.delete(baoxiangUri+'/record', {
                        params:{
                            token: sso.getToken(),
                            id: ids
                        }
                    }).success(function(result){
                        var obj = result;
                        if(obj.err){
                            $scope.error(obj.msg);
                        }else{
                            // $scope.success('操作成功');
                            $scope.success(global.translateByKey("common.succeed"));
                            $scope.gridOptions.api.setDatasource(dataSource);
                        }
                    }).error(function(msg, code){
                        $scope.errorTips(code);
                    });
                }
            });
        }else{
            $scope.openTips({
                title: global.translateByKey("openTips.title"),
                content:global.translateByKey("openTips.selectDelContetn"),
                cancelTitle:global.translateByKey("openTips.cancelDelConfirm"),
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

}]);
