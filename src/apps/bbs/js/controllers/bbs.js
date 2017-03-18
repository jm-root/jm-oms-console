'use strict';
var sso = jm.sdk.sso;
app.controller('BBSForumListCtrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state,global) {
    var sso = jm.sdk.sso;
    var history = global.BBSForumListHistory||(global.BBSForumListHistory={});
    var url = bbsUri+'/forums';
    $scope.pageSize = history.pageSize||$scope.defaultRows;

    var format_creator = function(params) {
        if(!params.data.author) return '系统建立';
        var obj = params.data.author;
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
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "编码", field: "code", width: 120},
        {headerName: "标题", field: "title", width: 120},
        //{headerName: "类型", field: "type", width: 70},
        //{headerName: "收藏次数", field: "favTimes", width: 85},
        //{headerName: "分享次数", field: "shareTimes", width: 85},
        {headerName: "贴子数量", field: "postCount", width: 120},
        {headerName: "今日发帖", field: "postCountToday", width: 120},
        {headerName: "昨日发帖", field: "postCountYesterday", width: 120},
        {headerName: "创建者", field: "creator", width: 100, valueGetter: format_creator},
        {headerName: "显示", field: "visible", width: 100,cellRenderer: visible_render, cellStyle:{'text-align':'center'}},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "#", width: 120, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];
    global.agGridTranslateSync($scope,columnDefs,[
        'bbs.forum.list.header._id',
        'bbs.forum.list.header.code',
        'bbs.forum.list.header.title',
        'bbs.forum.list.header.postCount',
        'bbs.forum.list.header.postCountToday',
        'bbs.forum.list.header.postCountYesterday',
        'bbs.forum.list.header.creator',
        'bbs.forum.list.header.visible',
        'bbs.forum.list.header.crtime',
        'bbs.forum.list.header.moditime'
    ])
    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="publish(\''+params.data._id+'\')">发布帖子</button>';
    }

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize
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
        rowHeight: 30,
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.bbs.forum.edit' , {id: cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.bbs.forum.edit' , {id: cell.data._id});
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
        datasource: dataSource
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

    $scope.publish = function(id){
        $state.go('app.bbs.topic.edit' , {pid:id});
    };
}]);

app.controller('BBSForumEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global',function($scope, $http, $state, $stateParams, $timeout, global) {
    var url = bbsUri+'/forums';
    var id = $stateParams.id;
    $scope.id = id;
    $scope.forum = {pattern:0};
    $scope.apps = [{_id:'corp',name:'官网'}];

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=bbs/forum/" + id
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
                $scope.forum.logo = sdkHost+global.getImgUri($scope.forum.logo, true);

                if($scope.forum.pattern==1){
                    $scope.forum.content = '<pre>'+$scope.forum.content+'</pre>';
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.forum.logo = sdkHost+global.getImgUri();
    }

    function submit(){
        //由于ui-ueditor.js的contentChange事件不能正确获取实际内容,所以保存前再获取一次,确保内容是正确的
        if(ueditor){
            if($scope.forum.pattern==0) $scope.forum.content = ueditor.getContentTxt();
            if($scope.forum.pattern==1) $scope.forum.content = ueditor.getPlainTxt();
            if($scope.forum.pattern==2) $scope.forum.content = ueditor.getContent();
        }
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
            console.log(result);
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.bbs.forum.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.save = function(){
        submit();
    };

    $scope.onck = function(){
        if(ueditor){
            $timeout(function(){
                $scope.forum.pattern==1 ? ueditor.execCommand('insertcode', ''):ueditor.execCommand('cleardoc');
            })
        }
    };
    $http.get(appMgrUri+'/apps', {
        params:{
            token: sso.getToken(),
            type: 'all'
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.apps = $scope.apps.concat(obj.rows||[]);
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    var cropper = {
        cropWidth: 300,
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
        $scope.forum.logo = cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };

    $scope.loadImg = function(event){
        $scope.cropper.cropWidth = event.target.naturalWidth;
        $scope.cropper.cropHeight = event.target.naturalHeight;
    }

}]);

app.controller('BBSTopicListCtrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state,global) {
    var sso = jm.sdk.sso;
    var history = global.BBSTopicListHistory||(global.BBSTopicListHistory={});
    var url = bbsUri+'/topics';
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
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    var format_title = function(params) {
        var obj = params.data.forum || {};
        return obj.title || '';
    };

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "所属板块", field: "title", width: 150,valueGetter: format_title},
        {headerName: "编码", field: "code", width: 120},
        {headerName: "标题", field: "title", width: 250},
        {headerName: "收藏次数", field: "favTimes", width: 120},
        {headerName: "分享次数", field: "shareTimes", width: 120},
        {headerName: "浏览次数", field: "viewCount", width: 120},
        {headerName: "回复次数", field: "replyCount", width: 120},
        {headerName: "支持人数", field: "favorTimes", width: 120},
        {headerName: "反对人数", field: "againstTimes", width: 120},
        {headerName: "作者", field: "author", width: 100, valueGetter: format_author},
        {headerName: "显示", field: "visible", width: 100, cellRenderer: visible_render, cellStyle:{'text-align':'center'}},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'bbs.topic.list.header._id',
        'bbs.topic.list.header.section',
        'bbs.topic.list.header.code',
        'bbs.topic.list.header.title',
        'bbs.topic.list.header.favTimes',
        'bbs.topic.list.header.shareTimes',
        'bbs.topic.list.header.viewCount',
        'bbs.topic.list.header.replyCount',
        'bbs.topic.list.header.favorTimes',
        'bbs.topic.list.header.againstTimes',
        'bbs.topic.list.header.author',
        'bbs.topic.list.header.visible',
        'bbs.topic.list.header.crtime',
        'bbs.topic.list.header.moditime'
    ]);
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

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
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.bbs.topic.edit' , {id: cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.bbs.topic.edit' , {id: cell.data._id});
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,
        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
        datasource: dataSource
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
                title:'提示',
                content:'请选择要删除的数据!',
                cancelTitle:'确定',
                singleButton:true
            });
        }
    };

    $http.get(bbsUri+'/forums' , {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        var data = result;
        if (data.err) {
            $scope.error(data.msg);
        } else {
            var rows = [{_id:'',title:'全部版块'}];
            rows = rows.concat(data.rows || []);
            $scope.forums = rows;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.create = function(){
        $state.go('app.bbs.topic.edit' , {pid: $scope.forum});
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
    $scope.$watch('forum', function () {
        history.forum = $scope.forum;
    });
}]);

app.controller('BBSTopicEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global',function($scope, $http, $state, $stateParams,$timeout, global) {
    var sso = jm.sdk.sso;
    var url = bbsUri+'/topics';
    var furl = bbsUri+'/forums';
    var id = $stateParams.id;
    var pid = $stateParams.pid;
    $scope.id = id;
    $scope.topic = {pattern:0};
    $scope.apps = [{_id:'corp',name:'官网'}];

    var getLogoUri = function(id, bTimestamp){
        if (id){
            var uri = '/upload/bbs/topic/' + id +'/image/logo.jpg';
            if(bTimestamp){
                uri += '?t=' + new Date();
            }
            return uri;
        }
        return 'img/logo.jpg';
    };
    var getTitleUri = function(id, bTimestamp){
        if (id){
            var uri = '/upload/bbs/topic/' + id +'/image/title.jpg';
            if(bTimestamp){
                uri += '?t=' + new Date();
            }
            return uri;
        }
        return 'img/logo.jpg';
    };

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=bbs/topic/" + id
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
                $scope.topic.logo = sdkHost+global.getImgUri($scope.topic.logo, true);
                $scope.topic.imgtitle = sdkHost+global.getImgUri($scope.topic.imgtitle, true);

                if($scope.topic.pattern==1){
                    $scope.topic.content = '<pre>'+$scope.topic.content+'</pre>';
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.topic.logo = sdkHost+global.getImgUri();
        $scope.topic.imgtitle = sdkHost+global.getImgUri();
    }

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
                $scope.topic.app = obj.app;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    function submit(){
        //由于ui-ueditor.js的contentChange事件不能正确获取实际内容,所以保存前再获取一次,确保内容是正确的
        if(ueditor){
            if($scope.topic.pattern==0) $scope.topic.content = ueditor.getContentTxt();
            if($scope.topic.pattern==1) $scope.topic.content = ueditor.getPlainTxt();
            if($scope.topic.pattern==2) $scope.topic.content = ueditor.getContent();
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
            console.log(result);
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.bbs.topic.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.save = function(){
        submit();
    };

    $scope.onck = function(){
        if(ueditor){
            $timeout(function(){
                $scope.topic.pattern==1 ? ueditor.execCommand('insertcode', ''):ueditor.execCommand('cleardoc');
            })
        }
    };

    $http.get(appMgrUri+'/apps', {
        params:{
            token: sso.getToken(),
            type: 'all'
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.apps = $scope.apps.concat(obj.rows||[]);
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.cropperObj = {
        logo:{
            cropWidth: 300,
            cropHeight: 200,
            imageSize:160,
            cropType:"square",
            sourceImage: null,
            croppedImage: null
        },
        imgtitle:{
            cropWidth: 300,
            cropHeight: 200,
            imageSize:160,
            cropType:"square",
            sourceImage: null,
            croppedImage: null
        }
    };

    var bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    $scope.setLogoTag = 'logo';
    $scope.cropper = $scope.cropperObj[$scope.setLogoTag];
    $scope.bounds = bounds;

    $scope.ok = function () {
        $scope.topic[$scope.setLogoTag] = $scope.cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };

    $scope.goLogo = function(tag){
        $scope.setLogoTag = tag;
        $scope.cropper = $scope.cropperObj[$scope.setLogoTag];
    };

    $scope.loadImg = function(event){
        $scope.cropperObj.logo.cropWidth = event.target.naturalWidth;
        $scope.cropperObj.logo.cropHeight = event.target.naturalHeight;
    };
    $scope.loadImg2 = function(event){
        $scope.cropperObj.imgtitle.cropWidth = event.target.naturalWidth;
        $scope.cropperObj.imgtitle.cropHeight = event.target.naturalHeight;
    };

}]);