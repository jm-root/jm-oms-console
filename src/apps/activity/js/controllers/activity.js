'use strict';
var sso =jm.sdk.sso;
app.controller('ActivityPropCtrl', ['$scope', '$http', '$state','MODULE_CONFIG', 'global',function($scope, $http, $state,MODULE_CONFIG, global) {
    var history = global.activityPropHistory||(global.activityPropHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var format_type = function(params) {
        var type = params.data.type;
        var info = '未知';
        if(type==0) info = '礼包';
        if(type==1) info = '虚拟币';
        if(type==2) info = '常规道具';
        return info;
    };
    var format_useMode = function(params) {
        var useMode = params.data.useMode;
        var info = '未知';
        if(useMode==0) info = '驻留品';
        if(useMode==1) info = '消耗品';
        if(useMode==2) info = '收集品';
        return info;
    };

    var columnDefs = [
        {headerName: "编码", field: "code", width: 250},
        {headerName: "应用ID", field: "app", width: 220},
        {headerName: "名称", field: "name", width: 100},
        {headerName: "描述", field: "description", width: 200},
        {headerName: "类型", field: "type", width: 85, valueGetter: format_type},
        {headerName: "使用方式", field: "useMode", width: 85, valueGetter: format_useMode},
        {headerName: "是否堆叠", field: "isStack", width: 85}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'activity.proplist.header.code',
        'activity.proplist.header.app',
        'activity.proplist.header.name',
        'activity.proplist.header.description',
        'activity.proplist.header.type',
        'activity.proplist.header.useMode',
        'activity.proplist.header.isStack'
    ]);
    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(propUri+'/props', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: $scope.search
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
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.activity.prop.edit' , {id: cell.data._id});
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
                    $http.delete(propUri+'/props', {
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
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
}]);

app.controller('ActivityPropEditCtrl', ['$scope', '$http', '$state', '$stateParams', 'global',function($scope, $http, $state, $stateParams, global) {
    var id = $stateParams.id;
    $scope.id = id;
    $scope.prop = {};
    $scope.apps = [];

    if(id){
        $http.get(propUri+'/props/' + id, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.prop = obj;
                if($scope.prop.type!=undefined) $scope.prop.type = $scope.prop.type.toString();
                if($scope.prop.useMode!=undefined) $scope.prop.useMode = $scope.prop.useMode.toString();
                $scope.prop.logo=sdkHost+global.getImgUri($scope.prop.logo,true);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.prop.logo = sdkHost+global.getImgUri();
    }

    $http.get(appMgrUri+'/apps', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.apps = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $http.get(propUri+'/props', {
        params:{
            token: sso.getToken(),
            ntype: 0,
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

    function formatTags(tags){
        tags = tags || [];
        var ary = [];
        tags.forEach(function(item){
            ary.push(item.text);
        });
        return ary;
    }

    $scope.save = function(){
        $scope.prop.tags = formatTags($scope.prop.tags);

        if($scope.prop.type=='0'&&!$scope.prop.props.length){
            return $scope.error('请添加道具');
        }
        $http.post(propUri+'/props/save', $scope.prop, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.activity.prop.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.changeType = function() {
        delete $scope.prop.amount;
        $scope.prop.useMode = null;
        if($scope.prop.type=='0'){
            $scope.prop.props = [];
        }else{
            delete $scope.prop.props;
        }
    };

    $scope.changeUseMode = function() {
        delete $scope.prop.amount;
        $scope.amountName = '数量';
        if($scope.prop.useMode=='1'){
            $scope.amountName = '消耗数量';
            $scope.prop.amount = 1;
        }else if($scope.prop.useMode=='2'){
            $scope.amountName = '积累数量';
            $scope.prop.amount = 1;
        }
    };

    $scope.removeItem = function(index) {
        $scope.prop.props.splice(index, 1);
    };
    $scope.addItem = function() {
        if(!$scope.prop.props) $scope.prop.props = [];
        $scope.prop.props.push({amount:1});
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
        $scope.prop.logo = cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };

}]);

app.controller('ActivityGavePropCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout',function($scope, $http, $state, $stateParams, $timeout) {
    $scope.depot = {isSelf:true};

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

    $scope.save = function(){
        $http.post(depotUri+'/props', $scope.depot, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $scope.depot = {isSelf:true};
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.i = 1;
    $scope.left = function () {
        if($scope.i>1){
            --$scope.i;
        }
    }
    $scope.right = function () {
        if($scope.i<$scope.psize){
            ++$scope.i;
        }
    }
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                page: 1,
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.psize = $scope.usersInfo.rows.length/5;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(5*($scope.i-1),[5*$scope.i])[$event.currentTarget.rowIndex-1];
        $scope.depot.userId = $scope.selectRow._id;
        $scope.nick = $scope.selectRow.nick;
    };

    $scope.$watch('depot.userId', function () {
        if(!$scope.depot.userId){
            $scope.nick = null;
        }
    });
}]);

app.controller('ActivityForumListCtrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state, global) {
    var history = global.activityForumListHistory||(global.activityForumListHistory={});
    var url = activityUri+'/forums';
    $scope.pageSize = history.pageSize||$scope.defaultRows;

    var format_author = function(params) {
        var author = params.data.author||{};
        return author.nick || '';
    };

    var columnDefs = [
        {headerName: "编码", field: "code", width: 80},
        {headerName: "标题", field: "title", width: 100},
        {headerName: "作者", field: "author", width: 90, valueGetter: format_author},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "显示", field: "visible", width: 70, cellRenderer: visible_render, cellStyle:{'text-align':'center'}},
        {headerName: "#", width: 70, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'activity.forumlist.header.code',
        'activity.forumlist.header.title',
        'activity.forumlist.header.author',
        'activity.forumlist.header.crtime',
        'activity.forumlist.header.moditime',
        'activity.forumlist.header.visible'
    ]);
    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="publish(\''+params.data._id+'\')">发布活动</button>';
    }

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
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.activity.forum.edit' , {id: cell.data._id});
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
        $state.go('app.activity.aty.edit' , {pid:id});
    };
}]);

app.controller('ActivityForumEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global',function($scope, $http, $state, $stateParams,$timeout, global) {
    var url = activityUri+'/forums';
    var id = $stateParams.id;
    $scope.id = id;
    $scope.forum = {};
    $scope.apps = [];

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=activity/forum/" + id
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
                $scope.forum.logo = sdkHost+global.getImgUri($scope.forum.logo,true);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.forum.logo = sdkHost+global.getImgUri();
    }

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
            $scope.apps = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

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
                $scope.success('操作成功');
                $state.go('app.activity.forum.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.save = function(){
        submit();
    };

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

}]);

app.controller('ActivityAtyListCtrl', ['$scope', '$http', '$state', 'global',function($scope, $http, $state, global) {
    var history = global.activityAtyListHistory||(global.activityAtyListHistory={});
    var url = activityUri+'/activities';
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};

    var format_forum = function(params) {
        var forum = params.data.forum||{};
        return forum.title || '';
    };

    var format_author = function(params) {
        var author = params.data.author||{};
        return author.nick || '';
    };

    $scope.onpush = function(data){
        var id = data._id;
        data.status = !data.status;
        $http.post(url+'/'+id, {status:data.status}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var columnDefs = [
        {headerName: "所属版块", field: "forum", width: 100, valueGetter: format_forum},
        {headerName: "编码", field: "code", width: 80},
        {headerName: "标题", field: "title", width: 100},
        {headerName: "作者", field: "author", width: 90, valueGetter: format_author},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "显示", field: "visible", width: 70, cellRenderer: visible_render, cellStyle:{'text-align':'center'}},
        {headerName: "#", width: 100, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'activity.atylist.header.forum',
        'activity.atylist.header.code',
        'activity.atylist.header.title',
        'activity.atylist.header.author',
        'activity.atylist.header.crtime',
        'activity.atylist.header.moditime',
        'activity.atylist.header.visible',
    ]);
    function opr_render(params){
        return '<button class="btn btn-xs bg-primary m-r-xs" ng-click="goItem(\''+params.data._id+'\')">配置活动项</button>'+
            '<span class="btn btn-xs bg-info" ng-click="onpush(data)">{{data.status?"取消发布":"发布"}}</span>';
    }

    $scope.goItem = function(id){
        $state.go('app.activity.aty.item.list' , {pid:id});
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

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var search = $scope.search;
            var keyword = search.keyword;
            var forum = search.forum;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    forum: forum
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
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.activity.aty.edit' , {id: cell.data._id});
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
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

    $scope.createAty = function(){
        $state.go('app.activity.aty.edit' , {pid: $scope.search.forum});
    };

    $http.get(activityUri+'/forums', {
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
}]);

app.controller('ActivityAtyEditCtrl', ['$scope', '$http', '$state', '$stateParams','global', '$timeout',function($scope, $http, $state, $stateParams,global,$timeout) {
    var url = activityUri+'/activities';
    var furl = activityUri+'/forums';
    var id = $stateParams.id;
    var pid = $stateParams.pid;
    $scope.id = id;
    $scope.activity = {pattern:0};
    $scope.apps = [];

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=activity/activities/" + id
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
                $scope.activity = obj;
                $scope.forum = obj.forum;
                $scope.activity.forum = obj.forum._id;
                $scope.activity.logo = sdkHost+global.getImgUri($scope.activity.logo, true);
                $scope.activity.imgtitle = sdkHost+global.getImgUri($scope.activity.imgtitle, true);

                if($scope.activity.pattern==1){
                    $scope.activity.content = '<pre>'+$scope.activity.content+'</pre>';
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.activity.logo = sdkHost+global.getImgUri();
        $scope.activity.imgtitle = sdkHost+global.getImgUri();
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
        $scope.activity.forum = pid;
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
                $scope.activity.app = obj.app;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

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
            $scope.apps = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    function submit(){
        //由于ui-ueditor.js的contentChange事件不能正确获取实际内容,所以保存前再获取一次,确保内容是正确的
        if(ueditor){
            if($scope.activity.pattern==0) $scope.activity.content = ueditor.getContentTxt();
            if($scope.activity.pattern==1) $scope.activity.content = ueditor.getPlainTxt();
            if($scope.activity.pattern==2) $scope.activity.content = ueditor.getContent();
        }
        var tags = [];
        $scope.activity.tags = $scope.activity.tags || [];
        $scope.activity.tags.forEach(function(item){
            tags.push(item.text);
        });
        $scope.activity.tags = tags;
        $http.post(url+'/save', $scope.activity, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.activity.aty.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.save = function(){
        submit();
    };

    $scope.onChanged = function(){
        if($scope.activity.forum){
            $scope.forum = _.find($scope.forums,{_id:$scope.activity.forum});
            if($scope.forum){
                $scope.activity.app = $scope.forum.app;
            }
        }
        if(!$scope.activity.forum){
            $scope.activity.app = '';
        }
    };
    $scope.onck = function(){
        if(ueditor){
            $timeout(function(){
                $scope.activity.pattern==1 ? ueditor.execCommand('insertcode', ''):ueditor.execCommand('cleardoc');
            })
        }
    };

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
        $scope.activity[$scope.setLogoTag] = $scope.cropper.croppedImage;
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

    $scope.onBeforeRenderOpenDate = function ($dates) {

    };

    $scope.endDateOnSetTimeOpenDate = function () {
        $scope.$broadcast('valid-openDate');
        $scope.$broadcast('valid-startDate');
        $scope.$broadcast('valid-endDate');
        $scope.$broadcast('valid-closeDate');
        if(!$scope.activity.startDate){
            $scope.activity.startDate = $scope.activity.openDate;
        }
    };
    $scope.endDateOnSetTimeCloseDate = function () {
        $scope.$broadcast('valid-startDate');
        $scope.$broadcast('valid-endDate');
        $scope.$broadcast('valid-closeDate');
        if(!$scope.activity.endDate){
            $scope.activity.endDate = $scope.activity.closeDate;
        }
    };

    $scope.onBeforeRenderCloseDate = function ($view,$dates) {
        if ($scope.activity.openDate) {
            var activeDate = moment($scope.activity.openDate).subtract(1, $view).add(1, 'minute');

            $dates.filter(function (date) {
                return date.localDateValue() <= activeDate.valueOf()
            }).forEach(function (date) {
                date.selectable = false;
            })
        }
    };

    $scope.onBeforeRenderStartDate = function ($view,$dates) {
        if ($scope.activity.openDate) {
            var start = moment($scope.activity.openDate).subtract(1, $view).add(1, 'minute');
            var end = moment($scope.activity.closeDate);

            $dates.filter(function (date) {
                return date.localDateValue() <= start.valueOf()||date.localDateValue() > end.valueOf();
            }).forEach(function (date) {
                date.selectable = false;
            })
        }
    };

    $scope.onBeforeRenderEndDate = function ($view,$dates) {
        if ($scope.activity.openDate) {
            var start = moment($scope.activity.openDate).subtract(1, $view).add(1, 'minute');
            var end = moment($scope.activity.closeDate);

            $dates.filter(function (date) {
                return date.localDateValue() <= start.valueOf()||date.localDateValue() > end.valueOf();
            }).forEach(function (date) {
                date.selectable = false;
            })
        }
    };

}]);

app.controller('ActivityAtyItemListCtrl', ['$scope', '$http', '$state', '$stateParams', 'global',function($scope, $http, $state, $stateParams,global) {
    var history = global.activityAtyItemListHistory||(global.activityAtyItemListHistory={});
    var url = activityUri+'/items';
    var purl = activityUri+'/activities';
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.activity = {};
    $scope.pid = $stateParams.pid;
    var pid = $scope.pid;
    if(pid){
        $http.get(purl+'/' + pid, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.activity = obj;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    var columnDefs = [
        {headerName: "标题", field: "title", width: 300},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];
    global.agGridTranslateSync($scope,columnDefs,[
       'activity.atyitemlist.header.title',
        'activity.atyitemlist.header.crtime'
    ]);
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

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    activity: $scope.pid
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
        onCellDoubleClicked: function(cell){
            $state.go('app.activity.aty.item.edit', {id: cell.data._id, pid:$scope.pid});
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
}]);

app.controller('ActivityAtyItemEditCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout',function($scope, $http, $state, $stateParams, $timeout) {
    var url = activityUri+'/items';
    var purl = activityUri+'/activities';
    var id = $stateParams.id;
    var pid = $stateParams.pid;
    $scope.pid = pid;
    $scope.id = id;
    $scope.atyitem = {activity:pid,props:[],hold:'0'};
    $scope.activity = {};
    $scope.props = [];

    $scope.types = {
        '0':[{code:'0',name:'次数'}],
        '1':[{code:'0',name:'时间段内累计登录次数'},{code:'1',name:'当天某时间段登录一次'},{code:'2',name:'时间段内每天登录一次'}],
        '2':[{code:'0',name:'时间段内首次充值数'},{code:'1',name:'时间段内累计充值数'},{code:'2',name:'时间段内单笔充值数'},{code:'3',name:'时间段内每日充值数'}],
        '3':[{code:'0',name:'时间段内首次消费数'},{code:'1',name:'时间段内累计消费数'},{code:'2',name:'时间段内单笔消费数'},{code:'3',name:'时间段内每日消费数'},{code:'4',name:'时间段内每月消费数'}],
        '4':[{code:'0',name:'权重'}]
    };

    $scope.visCode = {
        '2:0':'币种',
        '2:1':'币种',
        '2:2':'币种',
        '2:3':'币种',
        '3:0':'币种',
        '3:1':'币种',
        '3:2':'币种',
        '3:3':'币种',
        '3:4':'币种'
    };

    $scope.codes = {
        '2':[{code:'tb',name:'元宝'},{code:'jb',name:'金币'},{code:'dbj',name:'夺宝卷'}],
        '3':[{code:'tb',name:'元宝'},{code:'jb',name:'金币'},{code:'dbj',name:'夺宝卷'}]
    };

    $scope.visAmount = {
        '0:0':'次数',
        '1:0':'次数',
        '2:0':'数量',
        '2:1':'数量',
        '2:2':'数量',
        '2:3':'数量',
        '3:0':'数量',
        '3:1':'数量',
        '3:2':'数量',
        '3:3':'数量',
        '3:4':'数量',
        '4:0':'数值'
    };

    $scope.visDate = {
        '1:0':0,
        '1:1':1,
        '1:2':0,
        '2:0':0,
        '2:1':0,
        '2:2':0,
        '2:3':0,
        '3:0':0,
        '3:1':0,
        '3:2':0,
        '3:3':0,
        '3:4':0
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
                $scope.atyitem = obj;
                $scope.atyitem.type = $scope.atyitem.type.toString();
                $scope.atyitem.category = $scope.atyitem.category.toString();
                $scope.atyitem.hold = $scope.atyitem.hold&&$scope.atyitem.hold.toString()||'0';
                if($scope.atyitem.startDate){
                    if(86400000>=$scope.atyitem.startDate){
                        var stamp = moment().startOf('day').valueOf();
                        $scope.atyitem.startDate = stamp + $scope.atyitem.startDate;
                        $scope.atyitem.endDate = stamp + $scope.atyitem.endDate;
                    }
                    $scope.atyitem.startDate = new Date($scope.atyitem.startDate);
                    $scope.atyitem.endDate = new Date($scope.atyitem.endDate);
                }
                $scope.atyitem.props.forEach(function(item){
                    if(typeof item.prop!='string'){
                        item.prop = item.prop._id;
                    }
                });
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{

    }

    if(pid){
        $http.get(purl+'/' + pid, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.activity = obj;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

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

    $scope.save = function(){
        if(!$scope.atyitem.props.length){
            return $scope.warning('请添加道具');
        }
        if($scope.atyitem.startDate){
            if($scope.visDate[$scope.atyitem.type+':'+$scope.atyitem.category]==1){
                var curStamp = moment($scope.atyitem.startDate).second(0).millisecond(0).valueOf();
                var headStamp = moment($scope.atyitem.startDate).startOf('day').valueOf();
                $scope.atyitem.startDate = curStamp-headStamp;
                curStamp = moment($scope.atyitem.endDate).second(0).millisecond(0).valueOf();
                headStamp = moment($scope.atyitem.endDate).startOf('day').valueOf();
                $scope.atyitem.endDate = curStamp-headStamp;
            }
        }
        if(!$scope.atyitem.amount) $scope.atyitem.amount=1;

        $http.post(url+'/save', $scope.atyitem, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.activity.aty.item.list', {pid:pid});
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var clearDate = function(){
        delete $scope.atyitem.code;
        delete $scope.atyitem.amount;
        delete $scope.atyitem.startDate;
        delete $scope.atyitem.endDate;
    };

    $scope.selectChangeType = function() {
        delete $scope.atyitem.category;
        clearDate();
    };
    $scope.selectChangeCategory = function() {
        clearDate();
        if($scope.visDate[$scope.atyitem.type+':'+$scope.atyitem.category]==1){
            $scope.atyitem.startDate = new Date();
            $scope.atyitem.endDate = new Date();
        }
        $scope.$broadcast('valid-startDate');
        $scope.$broadcast('valid-endDate');
    };

    $scope.removeItem = function(index) {
        $scope.atyitem.props.splice(index, 1);
    };
    $scope.addItem = function() {
        if(!$scope.atyitem.props) $scope.atyitem.props = [];
        $scope.atyitem.props.push({amount:1});
    };

    $scope.onBeforeRenderStartDate = function ($view,$dates) {
        $scope.activity = $scope.activity || {};
        if (!$scope.activity.startDate) return;

        var start = moment($scope.activity.startDate).subtract(1, $view).add(1, 'minute');
        var end = moment($scope.activity.endDate);
        $dates.filter(function (date) {
            return date.localDateValue() <= start.valueOf()||date.localDateValue() > end.valueOf();
        }).forEach(function (date) {
            date.selectable = false;
        })
    };

    $scope.endDateOnSetTimeStartDate = function () {
        $scope.$broadcast('valid-startDate');
        $scope.$broadcast('valid-endDate');
    };

    $scope.onBeforeRenderEndDate = function ($view,$dates) {
        if ($scope.atyitem.startDate) {
            var start = moment($scope.atyitem.startDate).subtract(1, $view).add(1, 'minute');
            var end = moment($scope.activity.endDate);
            $dates.filter(function (date) {
                return date.localDateValue() <= start.valueOf()||($scope.activity.endDate&&date.localDateValue() > end.valueOf());
            }).forEach(function (date) {
                date.selectable = false;
            })
        }
    };


}]);