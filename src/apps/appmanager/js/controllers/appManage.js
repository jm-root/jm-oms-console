'use strict';
var sso =jm.sdk.sso;
app.controller('AppsListCtrl', ['$scope', '$state', '$http', 'global', "$stateParams", "$translatePartialLoader", function ($scope, $state, $http, global, $stateParams, $translatePartialLoader) {
    $translatePartialLoader.addPart('appManager');

    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var columnDefs = [
        // {headerName: "_id", field: "_id", width: 70, hide: true},
        // {headerName: "userId", field: "userId", width: 200, hide: true},
        {headerName: "应用名称", field: "name", width: 100},
        // {headerName: "密码", field: "password", width: 70, hide: true},
        {headerName: "排序", field: "sort", width: 70},
        {headerName: "分类", field: "category", width: 100},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "创建人", width: 70, cellRenderer: user_render, cellStyle:{'text-align':'center'}},
        {headerName: "状态", field: "status", width: 80, valueGetter: statusFormat},
        {headerName: "显示", field: "visible", width: 80, valueGetter: visibleFormat},
        {headerName: "#", width: 70, cellRenderer: config_render, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope, columnDefs, [
        'common.name',
        'common.sort',
        'common.cate',
        'common.ctime',
        'common.mtime',
        'common.creator',
        'common.status',
        'common.visible'
    ]);


    function config_render(params){
        if(params.data.category != 999999 && params.data.tmpl && params.data.tmpl != "empty"){
            if(params.data.tmpl == "baoxiang"){
                return '<button class="btn btn-xs bg-primary" ng-click="goBaoxiangConfig(\''+params.data._id+'\', \''+params.data.tmpl+'\')" translate="appmgr.config">配置</button>';
            }else{
                return '<button class="btn btn-xs bg-primary" ng-click="goConfig(\''+params.data._id+'\', \''+params.data.tmpl+'\')" translate=\'appmgr.room.roomConfig\'>房间配置</button>';
            }
        }else{
            return "";
        }
    }

    function statusFormat(params) {
        // var value = "禁用";
        var value = global.translateByKey("common.disable");
        switch(params.data.status){
            case 0:{
                // value = "禁用";
                value = global.translateByKey("common.disable");
                break;
            }
            case 1:{
                // value = "启用";
                value = global.translateByKey("common.enable");
                break;
            }
            case 2:{
                // value = "接入中";
                value = global.translateByKey("appmgr.access");
                break;
            }
            case 3:{
                // value = "审核中";
                value = global.translateByKey("appmgr.review");
                break;
            }
        }
        return value;
    };

    function visibleFormat(params) {
        // return params.data.visible ? "是" : "否";
        return params.data.visible ? global.translateByKey("common.yes") : global.translateByKey("common.no");
    }

    function user_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="goUserApps(\''+params.data.userId+'\')">' + params.data.userNick + '</button>';
    }

    var userId;
    $scope.goUserApps = function (id) {
        userId = id;
        $scope.onPageSizeChanged();
    };

    $scope.goConfig = function (id, type) {
        $state.go("app.rooms.manage.gameset.list", {appId: id, type: type});
    };

    $scope.goBaoxiangConfig = function (id, type) {
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
                    userId: userId
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
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.apps.manage.edit' , {id: cell.data._id});
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
                    $http.delete(appMgrUri+'/apps', {
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

app.controller('AppManageCtrl', ['$scope', '$http', '$state', '$stateParams', 'FileUploader', 'global', function($scope, $http, $state, $stateParams, FileUploader, global) {
    // $translatePartialLoader.addPart('appManager');

    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.appgame = {};

    // $scope.appCategories = [
    //     {value: "999999", name: global.translateByKey("appmgr.appManager.cateLobby")},
    //     {value: "0", name: global.translateByKey("appmgr.appManager.cateFish")},
    //     {value: "1", name: global.translateByKey("appmgr.appManager.cateGamble")},
    //     {value: "2", name: global.translateByKey("appmgr.appManager.cateChess")},
    //     {value: "3", name: global.translateByKey("appmgr.appManager.cateLittleGame")}
    // ];
    $scope.appCategories = [
        {value: "999999", name: 'appmgr.appManager.cateLobby'},
        {value: "0", name: "appmgr.appManager.cateFish"},
        {value: "1", name: "appmgr.appManager.cateGamble"},
        {value: "2", name: "appmgr.appManager.cateChess"},
        {value: "3", name: "appmgr.appManager.cateLittleGame"}
    ];
    
    $scope.createPassword = function () {
        $http.get(appMgrUri + "/rondomPasswd", {
            params: {
                token: sso.getToken()
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        }).success(function (result) {
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.appgame.password = result.ret;
            }
        });
    };
    
    if(id){
        $http.get(appMgrUri+'/apps/' + id, {
            params:{
                token: sso.getToken(),
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.appgame = obj;
                $scope.appgame.type = obj.type + "";
                $scope.appgame.category = obj.category + "";
                $scope.appgame.network = obj.network + "";
                $scope.appgame.icon = sdkHost + obj.icon;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.appgame.name = '';
        $scope.appgame.status = 0;
        $scope.appgame.sort = 0;
        $scope.appgame.platform = {};
        $scope.appgame.platform.android = true;
        $scope.appgame.platform.ios = true;
        $scope.appgame.platform.web = true;
        $scope.appgame.platform.windows = true;
        $scope.appgame.network = 3;
        $scope.createPassword();
    }


    $scope.save = function(){
        var url = appMgrUri + '/apps';
        if(id){
            url = appMgrUri + '/apps/' + id;
        }else{
            if($scope.id){
                $scope.appgame._id = $scope.id;
            }
        }

        $scope.appgame.category = parseInt($scope.appgame.category);
        $scope.appgame.type = parseInt($scope.appgame.type);
        if($scope.appgame.tags){
            var tags = [];
            for(var i=0; i<$scope.appgame.tags.length; ++i){
                tags.push($scope.appgame.tags[i].text);
            }
            $scope.appgame.tags = tags;
        }

        if($scope.appgame.currencies){
            var currencies = [];
            for(var i=0; i<$scope.appgame.currencies.length; ++i){
                currencies.push($scope.appgame.currencies[i].text);
            }
            $scope.appgame.currencies = currencies;
        }

        $http.post(url, $scope.appgame, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                // $scope.success('操作成功');
                $scope.success(global.translateByKey("common.succeed"));
                $state.go('app.apps.manage');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    // $scope.pwdText = "显示密码";
    $scope.pwdText = "appmgr.appManager.showPwd";
    $scope.showPwd = true;
    $scope.showPassword = function () {
        if($scope.showPwd){
            // $scope.pwdText = "隐藏密码";
            $scope.pwdText = "appmgr.appManager.hidePwd";
            $scope.showPwd = false;
        }else{
            // $scope.pwdText = "显示密码";
            $scope.pwdText = "appmgr.appManager.showPwd";
            $scope.showPwd = true;
        }

    };

    var cropper = {
        cropWidth: 200,
        cropHeight: 200,
        imageSize:160,
        cropType:"square",
        sourceImage: null,
        croppedImage: null
    };

    var bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    $scope.cropper = cropper;
    $scope.bounds = bounds;

    $scope.ok = function () {
        $scope.appgame.icon = cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };


    var uploader = $scope.uploader = new FileUploader({
        // url: uploadUrl
    });

    uploader.onProgressAll = function(progress) {
        // console.info('onProgressAll', progress);
        $scope.uploaderStatus  = progress + '%';
    };

    var fileName = '';
    var fileFullName = '';
    var filePath = "";
    uploader.onAfterAddingFile = function(fileItem) {
        // console.info('onAfterAddingFile', fileItem);
        var name = fileItem.file.name;
        fileFullName = name;
        var index = name.lastIndexOf(".");
        fileName = name.substr(0, index);
        $scope.uploaderStatus = fileName;

        if(id){
            fileItem.url = uploadUri+'?root=/apps/'+ id +'/package&custom=true&fileName=' + fileName;
            filePath = "/apps/" + id + "/package/" + fileFullName;
        }else{
            fileItem.url = uploadUri+'?root=/apps/packages&custom=true&fileName=' + fileName;
            filePath = "/apps/packages/" + fileFullName;
        }

        $scope.uploader.uploadAll();
    };

    uploader.onCompleteAll = function() {
        // console.info('onCompleteAll');
        // $scope.uploaderStatus = fileName + " 上传成功";
        $scope.uploaderStatus = fileName + global.translateByKey("appmgr.appManager.uploadSucceed");

        $scope.appgame.package = filePath;
    };

    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };


}]);
