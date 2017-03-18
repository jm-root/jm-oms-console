'use strict';
var sso = jm.sdk.sso;
app.controller('HomeBBSForumListCtrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state, global) {
    var history = global.homeBBSForumListHistory||(global.homeBBSForumListHistoryhomeBBSForumListHistory={});
    var url = homeUri+'/bbs/forums';
    $scope.pageSize = history.pageSize||$scope.defaultRows;

    var format_creator = function(params) {
        if(!params.data.creator) return global.translateByKey('home.bbs.list.systemBulid');
        var obj = params.data.creator;
        return obj.nick || '';
    };

    var columnDefs = [
        // {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "编码", field: "code", width: 120},
        {headerName: "名称", field: "name", width: 120},
        {headerName: "类型", field: "type", width: 120},
        //{headerName: "收藏次数", field: "favTimes", width: 85},
        //{headerName: "分享次数", field: "shareTimes", width: 85},
        {headerName: "贴子数量", field: "postCount", width: 100},
        {headerName: "今日发帖", field: "postCountToday", width: 100},
        {headerName: "昨日发帖", field: "postCountYesterday", width: 100},
        {headerName: "创建者", field: "creator", width: 100, valueGetter: format_creator},
        {headerName: "显示", field: "visible", width: 100},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "#", width: 120, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'home.bbs.list.code',
        'home.bbs.list.name',
        'home.bbs.list.type',
        'home.bbs.list.postCount',
        'home.bbs.list.postCountToday',
        'home.bbs.list.postCountYesterday',
        'home.bbs.list.creator',
        'home.bbs.list.visible',
        'home.bbs.list.crtime',
        'home.bbs.list.moditime'
    ]);


    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="publish(\''+params.data._id+'\')" translate="home.bbs.list.publishPost">发布帖子</button>';
    }

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize
                }
            }).success(function (result) {
                console.log(result);
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    data.rows = data.rows || [];
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
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
        angularCompileRows: true,
        rowSelection: 'multiple',
        rowHeight: 30,
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.home.bbs.forum.edit' , {id: cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.home.bbs.forum.edit' , {id: cell.data._id});
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.delContent'),
                okTitle:global.translateByKey('common.yes'),
                cancelTitle:global.translateByKey('common.no'),
                okCallback: function(){
                    var ids = '';
                    angular.forEach(rows, function (item,index) {
                        var dot = ',';
                        if(!index) dot = '';
                        ids = ids.concat(dot+item._id);
                    });
                    $http.delete(url, {
                        params: {
                            token: sso.getToken(),
                            id:ids
                        }
                    }).success(function (result) {
                        var data = result;
                        if (data.err) {
                            $scope.error(data.msg);
                        } else {
                            $scope.gridOptions.api.setDatasource(dataSource);
                        }
                    }).error(function(msg, code){
                        $scope.errorTips(code);
                    });
                }
            });
        }else{
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.selectDelContent'),
                cancelTitle:global.translateByKey('openTips.cancelDelContent'),
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

    $scope.publish = function(id){
        $state.go('app.home.bbs.topic.edit' , {pid:id});
    };
}]);

app.controller('HomeBBSForumEditCtrl', ['$scope', '$http', '$state', '$stateParams','$timeout',function($scope, $http, $state, $stateParams, $timeout) {
    var url = homeUri+'/bbs/forums';
    var id = $stateParams.id;
    $scope.id = id;
    $scope.forum = {};

    var getLogoUri = function(id, bTimestamp){
        if (id){
            var uri = '/upload/home/bbs/forum/' + id +'/image/logo.png';
            if(bTimestamp){
                uri += '?t=' + new Date();
            }
            return uri;
        }
        return 'apps/common/img/logo.jpg';
    };

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=home/bbs/forum/" + id
    };

    if(id){
        $http.get(url+'/' + id, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.forum = obj;
                $scope.forum.logo = sdkHost+getLogoUri(id, true);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.forum.logo = sdkHost+getLogoUri();
    }

    function submit(){
        //由于ui-ueditor.js的contentChange事件不能正确获取实际内容,所以保存前再获取一次,确保内容是正确的
        $scope.forum.content = ueditor.getContent();
        var tags = [];
        $scope.forum.tags = $scope.forum.tags || [];
        $scope.forum.tags.forEach(function(item){
            tags.push(item.text);
        });
        $scope.forum.tags = tags;
        $http.post(url+'/save', $scope.forum, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $state.go('app.home.bbs.forum.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.save = function(){
        submit();
    };

    var cropper = {
        cropWidth: 480,
        cropHeight: 300,
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
        $scope.forum.logo = cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };

}]);

app.controller('HomeBBSTopicListCtrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state, global) {
    var history = global.homeBBSTopicListHistory||(global.homeBBSTopicListHistory={});
    var url = homeUri+'/bbs/topics';
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';
    $scope.forum = history.forum||'';

    var format_author = function(params) {
        var obj = params.data.author || {};
        return obj.nick || '';
    };

    function visible_render(params){
        return '<label class="i-checks i-checks-sm">'+
            '<input type="checkbox" ng-model="data.visible" ng-change="visChange(\''+params.data._id+'\',data.visible)"><i></i>'+
            '</label>';
    }

    $scope.visChange = function(id, val){
        $http.post(url+'/'+id, {visible:val}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var columnDefs = [
        // {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "编码", field: "code", width: 100},
        {headerName: "标题", field: "title", width: 300},
        {headerName: "收藏次数", field: "favTimes", width: 120},
        {headerName: "分享次数", field: "shareTimes", width: 120},
        {headerName: "浏览次数", field: "viewCount", width: 120},
        {headerName: "回复次数", field: "replyCount", width: 120},
        {headerName: "支持人数", field: "recommend_add", width: 120},
        {headerName: "反对人数", field: "recommend_sub", width: 120},
        {headerName: "作者", field: "author", width: 90, valueGetter: format_author},
        {headerName: "显示", field: "visible", width: 120, cellRenderer: visible_render, cellStyle:{'text-align':'center'}},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'home.bbs.list.code',
        'home.bbs.list.title',
        'home.bbs.list.favTimes',
        'home.bbs.list.shareTimes',
        'home.bbs.list.viewCount',
        'home.bbs.list.replyCount',
        'home.bbs.list.recommend_add',
        'home.bbs.list.recommend_sub',
        'home.bbs.list.author',
        'home.bbs.list.visible',
        'home.bbs.list.crtime',
        'home.bbs.list.moditime'
    ]);


    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: $scope.search,
                    forum: $scope.forum
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    data.rows = data.rows || [];
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
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
        angularCompileRows: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.home.bbs.topic.edit' , {id: cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.home.bbs.topic.edit' , {id: cell.data._id});
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.delContent'),
                okTitle:global.translateByKey('common.yes'),
                cancelTitle:global.translateByKey('common.no'),
                okCallback: function(){
                    var ids = '';
                    angular.forEach(rows, function (item,index) {
                        var dot = ',';
                        if(!index) dot = '';
                        ids = ids.concat(dot+item._id);
                    });
                    $http.delete(url, {
                        params: {
                            token: sso.getToken(),
                            id:ids
                        }
                    }).success(function (result) {
                        var data = result;
                        if (data.err) {
                            $scope.error(data.msg);
                        } else {
                            $scope.gridOptions.api.setDatasource(dataSource);
                        }
                    }).error(function(msg, code){
                        $scope.errorTips(code);
                    });
                }
            });
        }else{
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.selectDelContent'),
                cancelTitle:global.translateByKey('openTips.cancelDelContent'),
                singleButton:true
            });
        }
    };

    $http.get(homeUri+'/bbs/forums', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        var data = result;
        if (data.err) {
            $scope.error(data.msg);
        } else {
            var rows = [{_id:'',name:global.translateByKey('home.bbs.list.plate')}];
            rows = rows.concat(data.rows || []);
            $scope.forums = rows;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

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
    $scope.$watch('forum', function () {
        history.forum = $scope.forum;
    });
}]);

app.controller('HomeBBSTopicEditCtrl', ['$scope', '$http', '$state', '$stateParams','$timeout',function($scope, $http, $state, $stateParams, $timeout) {
    var url = homeUri+'/bbs/topics';
    var furl = homeUri+'/bbs/forums';
    var id = $stateParams.id;
    var pid = $stateParams.pid;
    $scope.id = id;
    $scope.topic = {};

    var getLogoUri = function(id, bTimestamp){
        if (id){
            var uri = '/upload/home/bbs/topic/' + id +'/image/logo.png';
            if(bTimestamp){
                uri += '?t=' + new Date();
            }
            return uri;
        }
        return 'apps/common/img/logo.jpg';
    };

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=home/bbs/topic/" + id
    };

    if(id){
        $http.get(url+'/' + id, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.topic = obj;
                $scope.forum = obj.forum;
                $scope.topic.forum = obj.forum._id;
                $scope.topic.logo = sdkHost+getLogoUri(id, true);

                if($scope.topic.type=='doc'){
                    if(!$scope.topic.branch) $scope.topic.branch = '1';
                }

                if($scope.topic.branch==3){
                    $scope.topic.content = '<pre>'+$scope.topic.content+'</pre>';
                }

                contentObj[$scope.topic.type] = $scope.topic.content
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.topic.logo = sdkHost+getLogoUri();
        if(!pid){
            $http.get(furl, {
                params: {
                    token: sso.getToken()
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var forums = data.rows || [];
                    $scope.forums = forums;
                }
            }).error(function(msg, code){
                $scope.errorTips(code);
            });
        }
    }

    if(pid){
        $scope.topic.forum = pid;
        $http.get(furl+'/' + pid, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.forum = obj;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    function submit(){
        //由于ui-ueditor.js的contentChange事件不能正确获取实际内容,所以保存前再获取一次,确保内容是正确的
        if(ueditor){
            if($scope.topic.branch==1) $scope.topic.content = ueditor.getContent();
            if($scope.topic.branch==2) $scope.topic.content = ueditor.getContentTxt();
            if($scope.topic.branch==3) $scope.topic.content = ueditor.getPlainTxt();
        }
        var tags = [];
        $scope.topic.tags = $scope.topic.tags || [];
        $scope.topic.tags.forEach(function(item){
            tags.push(item.text);
        });
        $scope.topic.tags = tags;
        $http.post(url+'/save', $scope.topic, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $state.go('app.home.bbs.topic.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.save = function(){
        submit();
    };

    var contentObj = {};
    var perType = 'doc';
    $scope.chooseType = function(type){
        contentObj[perType] = $scope.topic.content||'';
        perType = type;
        $scope.topic.content = contentObj[type]||'';
    };

    var cropper = {
        cropWidth: 480,
        cropHeight: 300,
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
        $scope.topic.logo = cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };

}]);

app.controller('HomeActivityListCtrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state, global) {
    var history = global.homeActivityHistory||(global.homeActivityHistory={});
    var url = homeUri+'/bbs/topics';
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var format_author = function(params) {
        var obj = params.data.author || {};
        return obj.nick || '';
    };

    function visible_render(params){
        return '<label class="i-checks i-checks-sm">'+
            '<input type="checkbox" ng-model="data.visible" ng-change="visChange(\''+params.data._id+'\',data.visible)"><i></i>'+
            '</label>';
    }

    $scope.visChange = function(id, val){
        $http.post(url+'/'+id, {visible:val}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var columnDefs = [
        // {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "标题", field: "title", width: 250},
        {headerName: "收藏次数", field: "favTimes", width: 120},
        {headerName: "分享次数", field: "shareTimes", width: 120},
        {headerName: "浏览次数", field: "viewCount", width: 120},
        {headerName: "回复次数", field: "replyCount", width: 120},
        {headerName: "支持人数", field: "recommend_add", width: 120},
        {headerName: "反对人数", field: "recommend_sub", width: 120},
        {headerName: "作者", field: "author", width: 100, valueGetter: format_author},
        {headerName: "显示", field: "visible", width: 120, cellRenderer: visible_render, cellStyle:{'text-align':'center'}},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'home.activity.list.title',
        'home.activity.list.favTimes',
        'home.activity.list.shareTimes',
        'home.activity.list.viewCount',
        'home.activity.list.replyCount',
        'home.activity.list.recommend_add',
        'home.activity.list.recommend_sub',
        'home.activity.list.author',
        'home.activity.list.visible',
        'home.activity.list.crtime',
        'home.activity.list.moditime'
    ]);


    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: $scope.search,
                    fcode: 'homeActivitys'
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    data.rows = data.rows || [];
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
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
        angularCompileRows: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.home.activitys.edit' , {id: cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.home.activitys.edit' , {id: cell.data._id});
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        datasource: dataSource
    };

    $scope.delete = function(){
        var rows = $scope.gridOptions.api.getSelectedRows();
        var len = rows.length;
        if(len){
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.delContent'),
                okTitle:global.translateByKey('common.yes'),
                cancelTitle:global.translateByKey('common.no'),
                okCallback: function(){
                    var ids = '';
                    angular.forEach(rows, function (item,index) {
                        var dot = ',';
                        if(!index) dot = '';
                        ids = ids.concat(dot+item._id);
                    });
                    $http.delete(url, {
                        params: {
                            token: sso.getToken(),
                            id:ids
                        }
                    }).success(function (result) {
                        var data = result;
                        if (data.err) {
                            $scope.error(data.msg);
                        } else {
                            $scope.gridOptions.api.setDatasource(dataSource);
                        }
                    }).error(function(msg, code){
                        $scope.errorTips(code);
                    });
                }
            });
        }else{
            $scope.openTips({
                title:global.translateByKey('openTips.title'),
                content:global.translateByKey('openTips.selectDelContent'),
                cancelTitle:global.translateByKey('openTips.cancelDelContent'),
                singleButton:true
            });
        }
    };

    $scope.onPageSizeChanged = function() {
        dataSource.pageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

}]);

app.controller('HomeActivityEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout',function($scope, $http, $state, $stateParams, $timeout) {
    var url = homeUri+'/bbs/topics';
    var id = $stateParams.id;
    $scope.id = id;
    $scope.topic = {};

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=home/bbs/topic/" + id
    };

    if(id){
        $http.get(url+'/' + id, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.topic = obj;
                $scope.topic.forum = obj.forum._id;

                if($scope.topic.type=='doc'){
                    if(!$scope.topic.branch) $scope.topic.branch = '1';
                }

                if($scope.topic.branch==3){
                    $scope.topic.content = '<pre>'+$scope.topic.content+'</pre>';
                }

                contentObj[$scope.topic.type] = $scope.topic.content;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    function submit(){
        //由于ui-ueditor.js的contentChange事件不能正确获取实际内容,所以保存前再获取一次,确保内容是正确的
        if(ueditor){
            if($scope.topic.branch==1) $scope.topic.content = ueditor.getContent();
            if($scope.topic.branch==2) $scope.topic.content = ueditor.getContentTxt();
            if($scope.topic.branch==3) $scope.topic.content = ueditor.getPlainTxt();
        }
        var tags = [];
        $scope.topic.tags = $scope.topic.tags || [];
        $scope.topic.tags.forEach(function(item){
            tags.push(item.text);
        });
        $scope.topic.tags = tags;

        if(!$scope.topic._id){
            $scope.topic.fcode = 'homeActivitys';
        }
        $http.post(url+'/save', $scope.topic, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $state.go('app.home.activitys.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.save = function(){
        submit();
    };

    var contentObj = {};
    var perType = 'doc';
    $scope.chooseType = function(type){
        contentObj[perType] = $scope.topic.content||'';
        perType = type;
        $scope.topic.content = contentObj[type]||'';
    };


}]);

app.controller('HomeSendNoticeCtrl', ['$scope', '$http', '$state', '$stateParams', 'global', function($scope, $http, $state, $stateParams,global) {
    $scope.notice = {};
    $scope.selt = {};

    jm.sdk.init({uri: gConfig.sdkHost});
    var config = jm.sdk.config;

    var hkey = 'HomeNotice';

    function operate() {
        return '<button class="btn btn-danger btn-xs" ng-click="delete(data)" translate="home.delete">删除</button>'
    };

    function format_count(params){
        var times = params.data.times || [];
        return times.length;
    };

    function format_type(params){
        var type = params.data.type;
        var info;
        if(type==0) info = global.translateByKey('home.sendnotice.msgType.opts2');
        if(type==1) info = global.translateByKey('home.sendnotice.msgType.opts3');
        return info||'';
    };

    var columnDefs = [
        {headerName: "消息", field: "message", width: 300},
        {headerName: "类型", field: "type", width: 120, valueGetter: format_type},
        {headerName: "次数", field: "count", width: 120, valueGetter: format_count},
        {headerName: "已发", field: "step", width: 120},
        {headerName:"操作",field:"",width:120,cellRenderer:operate,cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'home.sendnotice.list.header.message',
        'home.sendnotice.list.header.type',
        'home.sendnotice.list.header.count',
        'home.sendnotice.list.header.step',
        'home.sendnotice.list.header.ctrl'
    ]);


    global.agGridOverlay();             //翻译
    $scope.gridOptions = {
        // paginationPageSize: Number($scope.pageSize),
        // rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        angularCompileRows: true,
        rowSelection: 'single',
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
        rowData: []
    };

    $scope.send = function(){
        var notice = $scope.notice;
        if(notice.type=='0'){
            notice.times = [];
            var count = $scope.selt.count;
            for(;count--;){
                notice.times.push($scope.selt.times);
            }
        }else if(notice.type=='1'){
            var tags = [];
            notice.times = notice.times || [];
            if(!notice.times.length) return $scope.error(global.translateByKey('home.sendnotice.lackOfTimes'));
            notice.times.forEach(function(item){
                tags.push(item.text);
            });
            notice.times = tags;
        }

        notice.isSys = true;
        $http.post(homeUri+'/notice', notice, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $scope.notice = {};
                $scope.refresh();
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.changeType = function(){
        delete $scope.notice.times;
    };

    $scope.endDateOnSetTimeAddDate = function () {
        $scope.notice.times = $scope.notice.times || [];
        var t = moment($scope.selt.addDate).format('YYYY-MM-DD HH:mm');
        $scope.notice.times.push({text:t});
    };

    $scope.onAddDate = function(){
        $scope.notice.times.pop();
    };

    $scope.refresh = function(){
        config.listConfig({token: sso.getToken(),root:hkey,all:true},function(err,result){
            if(err){
                err = result&&result.msg || err.message;
                // return $scope.error(err);
                result = {};
            }
            var rows = [];
            for(var key in result){
                var o = result[key];
                o.key = key;
                rows.push(o);
            }
            $scope.gridOptions.api.setRowData(rows);
        });
    };
    $scope.refresh();

    $scope.delete = function(data){
        $scope.openTips({
            title:global.translateByKey('openTips.title'),
            content:global.translateByKey('openTips.delContent'),
            okTitle:global.translateByKey('common.yes'),
            cancelTitle:global.translateByKey('common.no'),
            okCallback: function(){
                config.delConfig({token: sso.getToken(),root:hkey,key:data.key},function(err,doc){
                    if(err){
                        return $scope.error(doc||err);
                    }
                    $scope.success(global.translateByKey('home.sendnotice.successfulDelete'));
                    $scope.refresh();
                });
            }
        });
    };

}]);

app.controller('HomeDakSendCtrl', ['$scope', '$http', '$state', '$stateParams', 'global', function($scope, $http, $state, $stateParams, global) {
    $scope.dak = {isSys:true};

    $scope.send = function(){
        $http.post(homeUri+'/dak/send', $scope.dak, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $scope.dak = {isSys:true};
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $http.get(propUri+'/props', {
        params:{
            token: sso.getToken(),
            fields: {name:1}
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.props = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.removeItem = function(index) {
        $scope.dak.attach.splice(index, 1);
    };
    $scope.addItem = function() {
        if(!$scope.dak.attach) $scope.dak.attach = [];
        $scope.dak.attach.push({amount:1});
    };
    $scope.page = 1;
    $scope.left = function () {
        if($scope.page>1){
            --$scope.page;
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++$scope.page;
        }
    };
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.pages = Math.ceil($scope.usersInfo.rows.length/10);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.page-1),[10*$scope.page])[$event.currentTarget.rowIndex-1];
        $scope.dak.userId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
    };

    $scope.$watch('dak.userId', function () {
        if(!$scope.dak.userId){
            $scope.nick = null;
        }
    });

}]);

app.controller('HomeRankSetCtrl', ['$scope', '$http', '$state', '$stateParams','$timeout',function($scope, $http, $state, $stateParams,$timeout) {
    $scope.user = {};

    $scope.save = function(){
        $http.post(ssoUri+'/users/'+$scope.user._id, $scope.user, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.openTips.operationSuccess'));
                $scope.user = {};
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.page = 1;
    $scope.left = function () {
        if($scope.page>1){
            --$scope.page;
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++$scope.page;
        }
    };
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.pages = Math.ceil($scope.usersInfo.rows.length/10);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.page-1),[10*$scope.page])[$event.currentTarget.rowIndex-1];
        $scope.selectRow.member = $scope.selectRow.member || {};
        $scope.selectRow.record = $scope.selectRow.record || {};
        $scope.user = $scope.selectRow;
        $scope.user.userId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
    };

    $scope.$watch('user.userId', function () {
        if(!$scope.user.userId){
            $scope.nick = null;
        }
    });
}]);