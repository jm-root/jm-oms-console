/**
 * Created by ZL on 2016/12/16.
 */
"use strict";

var sso =jm.sdk.sso;
app.controller('RoomsListCtrl', ['$rootScope', '$scope', '$state', '$http', '$q','global', "$stateParams", "$translatePartialLoader", "$filter", function ($rootScope, $scope, $state, $http,$q, global, $stateParams, $translatePartialLoader, $filter) {
    $translatePartialLoader.addPart('appManager');

    var history = global.appsListHistory || (global.appsListHistory = {});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    // var id = $stateParams.id;

    var columnDefs = [
        // {headerName: "_id", field: "_id", width: 70, hide: true},
        // {headerName: "userId", field: "userId", width: 200, hide: true},
        {headerName: "名称", field: "name", width: 120},
        {headerName:"操作",field:"name",width:130,cellRenderer:format_kick,cellStyle:{'text-align':'center'}},
        // {headerName: "密码", field: "password", width: 70, hide: true},
        {headerName: "排序", field: "sort", width: 100},
        {headerName: "分类", field: "category", width: 120},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "创建人", field: "userNick", width: 100},
        {headerName: "状态", field: "status", width: 150, valueGetter: statusFormat},
        {headerName: "显示", field: "visible", width: 150, valueGetter: visibleFormat}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'common.name',
        'common.operate',
        'common.sort',
        'common.cate',
        'common.ctime',
        'common.mtime',
        'common.creator',
        'common.status',
        'common.visible'
    ]);


    function format_kick(params) {
        if(params.data.category === 999999 || params.data.category === 3) return "";
        return "<button class='btn btn-xs btn-danger' ng-click='handleServer(data.isopen,data)'>{{data.isopen ? ('common.stopservice'|translate) :('common.startservice'|translate)}}</button>";
    }

    $scope.handleServer = function (isopen,data) {
        data.isopen = !data.isopen;
        var hkey = 'app:' + data._id + ":config:area";
        var url = appMgrUri + "/appConfig";
        if(isopen){
            console.log(1);
            $http.post(homeUri+"/kick",{ apps:[data._id]},{
                params:{
                    token:sso.getToken()
                }
            }).success(function (result) {
                if(result.err){
                    $scope.error(result.msg);
                }else{
                    $scope.success('操作成功');
                }
            })
        }
        $http.get(url, {
            params: {
                token: sso.getToken(),
                root: hkey,
                list: 1,
                all: 1
            }
        }).success(function (result) {
            for(var key in result){
                result[key].serverStatus = isopen ? 0 : 1;
            }
            for(var key in result){
                $http.post(url, {root: hkey, key: key, value: result[key]}, {
                    params:{
                        token: sso.getToken()
                    }
                }).error(function (msg, code) {
                    $scope.errorTips(code);
                }).success(function (result) {
                })
            }
        }).error(function (msg,code) {
            $scope.errorTips(code);
        })




    }


    function goRoomConfig(params){
        if(params.data.tmpl == "baoxiang"){
            goBaoxiangConfig(params.data._id, params.data.tmpl);
        }else{
            goConfig(params.data._id, params.data.tmpl);
        }
    }

    function statusFormat(params) {
        var value = $filter('translate')('common.disable');
        switch(params.data.status){
            case 0:{
                var value = $filter('translate')('common.disable');
                break;
            }
            case 1:{
                var value = $filter('translate')('common.enable');
                break;
            }
            case 2:{
                var value = $filter('translate')('appmgr.access');
                break;
            }
            case 3:{
                var value = $filter('translate')('appmgr.review');
                break;
            }
        }
        return value;
    };

    function visibleFormat(params) {
        return params.data.visible ? $filter('translate')('common.yes') : $filter('translate')('common.no');
    }

    function goConfig(id, type) {
        $state.go("app.rooms.manage.gameset.list", {appId: id, type: type});
    };

    function goBaoxiangConfig(id, type) {
        $state.go("app.rooms.manage.baoxiang.list", {appId: id, type: type});
    };

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(appMgrUri+'/apps', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search,
                    type: "all",
                    // userId: id
                }
            }).success(function(result){
                var data = result;
                console.log(result)
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var judge = [];
                    var getsource = function (i) {
                        var hkey = 'app:' + data.rows[i]._id + ":config:area";
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
                            // console.log(i);
                            var isopen = false;
                            var num = 0;
                            for(var key in result){
                                num = 1;
                                if(result[key].serverStatus != 0){
                                    isopen = true;
                                    break;
                                }
                            }
                            if(!num){                        //如果游戏桌子列表是空的，直接设置为true;
                                isopen = true;
                            }
                            judge.push(isopen);
                            if(judge.length === data.rows.length){
                                for(var j=0;j<data.rows.length;j++){
                                    data.rows[j].isopen = judge[j];
                                }
                                var rowsThisPage = data.rows || [];
                                var lastRow = data.total||rowsThisPage.length||0;
                                params.successCallback(rowsThisPage, lastRow);
                            }else{
                                getsource(++i);
                            }
                        })
                    }

                    getsource(0);

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
        onCellClicked: function(cell){
            if($scope.isSmartDevice){
                goRoomConfig(cell);
            }
        },
        onCellDoubleClicked: function(cell){
            goRoomConfig(cell);
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource,
            angularCompileRows: true,
            headerCellRenderer: global.agGridHeaderCellRendererFunc
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
