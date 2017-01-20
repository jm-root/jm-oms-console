'use strict';

app.controller('GuestBookCtrl', ['$scope', '$state', '$http', 'AGGRID', 'global', function ($scope, $state, $http,AGGRID, global) {
    var sso = jm.sdk.sso;
    var history = global.GuestBookHistory||(global.GuestBookHistory={});
    $scope.pageSize=history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};

    $scope.dateOptions = global.dateRangeOptions;
    var columnDefs=[
        {headerName:"ip",field:"ip",width:400},
        {headerName:"内容",field:"content",width:400},
        {headerName:"时间",field:"messageDate",width:200,valueGetter:$scope.angGridFormatDateS},
        {headerName:"联系方式",field:"contact",width:400}
    ];
    var dataSource={
        getRows:function(params){
            var search = $scope.search;
            var keyword = search.keyword;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(guestbookUri+'/guestbook/'+(keyword?keyword.toString():""),{
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: keyword
                }
            }).success(function (result) {
                var data=result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage,lastRow);
                }
            }).error(function (msg,code) {
                $scope.errorTips(code);
            })
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
        },
        localeText: AGGRID.zh_CN,
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
                    rows.forEach(function(e){
                        if(ids) ids += ',';
                        ids += e._id;
                    });
                    $http.delete(guestbookUri+'/guestbook', {
                        params:{
                            token: sso.getToken(),
                            id: ids
                        }
                    }).success(function(result){
                        var obj = result;
                        if(obj.err){
                            $scope.error(obj.msg);
                        }else{
                            $scope.success('操作成功');
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
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
}]);


app.controller('WordFilterLogCtrl', ['$scope', '$state', '$http', 'AGGRID', 'global', function ($scope, $state, $http,AGGRID, global) {
    var sso = jm.sdk.sso;
    var history = global.WordFilterLogHistory||(global.WordFilterLogHistory={});
    $scope.pageSize=history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};

    $scope.dateOptions = global.dateRangeOptions;


    var columnDefs=[
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "用户ID", field: "userId", width: 50,hide:true},
        {headerName: "IP", field: "ip", width: 50},
        {headerName: "拦截内容", field: "content", width: 50},
        {headerName: "敏感词", field: "words", width: 60},
        {headerName: "标签", field: "tags", width: 50},
        {headerName: "拦截时间", field: "crtime", width: 60, valueGetter: $scope.angGridFormatDateS}
    ];
    var dataSource={
        getRows:function(params){
            var search = $scope.search;
            var keyword = search.keyword;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get( wordfilterUri+'/filterLogs',{
                params: {
                    page:page,
                    token: sso.getToken(),
                    rows: $scope.pageSize,
                    keyword: keyword
                }
            }).success(function (result) {
                var data=result;
                if(data.err){
                    $scope(data.msg)
                }else{
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage,lastRow);
                }
            }).error(function (msg,code) {
                $scope.errorTips(code);
            })
        }
    };
    $scope.gridOptions={
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
        localeText: AGGRID.zh_CN,
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
                    rows.forEach(function(e){
                        if(ids) ids += ',';
                        ids += e._id;
                    });
                    $http.delete( wordfilterUri+'/filterLogs', {
                        params:{
                            token: sso.getToken(),
                            id: ids
                        }
                    }).success(function(result){
                        var obj = result;
                        if(obj.err){
                            $scope.error(obj.msg);
                        }else{
                            $scope.success('操作成功');
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
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });

}]);


app.controller('WordFilterCtrl', ['$scope', '$state','$stateParams', '$http','AGGRID', 'global', function ($scope, $state,$stateParams, $http,AGGRID, global) {
    var sso = jm.sdk.sso;
    var history = global.WordFilterHistory||(global.WordFilterHistory={});
    $scope.pageSize=history.pageSize||'50';
    $scope.search = history.search||{};
    $scope.wordfilter=history.wordfilter;
    $scope.crtime=history.crtime;
    var url= wordfilterUri+'/words';

    $scope.$state = $state;
    var id = $stateParams.id;
    $scope.id = id;
    $scope.log = {};

    var columnDefs=[
        {headerName:"_id",field:"_id",width:80,hide:true},
        {headerName:"ID",field:"id",width:80,valueGetter:format_id},
        {headerName:"敏感词",field:"word",width:200},//给敏感词添加一个模板，或者事件监听
        {headerName:"状态",field:"status",width:200,hide:true},
        {headerName:"创建时间",field:"crtime",width:200,valueGetter:$scope.angGridFormatDateS,sort:'desc'},
        {headerName:"操作",field:"",width:100,cellRenderer:operate,cellStyle:{'text-align':'center'}},
        {headerName:"状态",field:"__v",width:200,hide:true}
    ];
    function format_id(params){
        var a = params.node.id+1;
        return a;
    };
    var dataSource={
        getRows:function(params){
            var search = $scope.search;
            var page = params.startRow / $scope.pageSize + 1;
            var keyword = search.keyword;
            $http.get(url,{
                params:{
                    token: sso.getToken(),
                    page:page,
                    keyword:keyword,
                    rows: $scope.pageSize
                }
            }).success(function (result) {
                var data=result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage,lastRow);
                }
            }).error(function (msg,code) {
                $scope.errorTips(code);
            })
        }
    };
    function operate() {
        return '<button class="btn btn-danger btn-xs" ng-click="delete()">删除</button>'
    };

    $scope.gridOptions={
        paginationPageSize: Number($scope.pageSize),
        rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'multiple',
        angularCompileRows: true,
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.wordfilter.update',{id : cell.data._id});
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource
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

    $scope.delete = function () {
        var rows = $scope.gridOptions.api.getSelectedRows();
        $scope.openTips({
            title: '提示',
            content: '是否确认删除?',
            okTitle: '是',
            cancelTitle: '否',
            okCallback: function () {
                var ids = '';
                rows.forEach(function (e) {
                    if (ids) ids += ',';
                    ids += e._id;
                });
                $http.delete(url, {
                    params: {
                        token: sso.getToken(),
                        id: ids
                    }
                }).success(function (result) {
                    var obj = result;
                    if (obj.err) {
                        $scope.error(obj.msg);
                    } else {
                        $scope.success('操作成功');
                        $scope.gridOptions.api.setDatasource(dataSource);
                    }
                }).error(function (msg, code) {
                    $scope.errorTips(code);
                });
            }
        });
    };
    $scope.add = function () {
        var wordfilter = $scope.wordfilter;
        var crtime = $scope.crtime;
        if (wordfilter) {
            $http.post(url, $scope.log, {
                params: {
                    token: sso.getToken(),
                    word: wordfilter,
                    crtime: crtime
                }
            }).success(function (result) {
                var obj = result;
                if (obj.err) {
                    $scope.error(obj.msg);
                } else {
                    $scope.success('操作成功');
                    $scope.gridOptions.api.setDatasource(dataSource);
                }
            }).error(function (msg, code) {
                $scope.errorTips(code);
            });
        } else {
            $scope.openTips({
                title: '提示',
                content: '不允许添加空值!',
                cancelTitle: '确定',
                singleButton: true
            });
        }
    };

}]);
app.controller('wordupdateCtrl', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {
    var sso = jm.sdk.sso;
    $scope.$state = $state;
    var url= wordfilterUri+'/words';
    var id = $stateParams.id;
    $http.get(url +'/'+ id, {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        var obj = result;
        if (obj.err) {
            $scope.error(obj.msg);
        } else {
            $scope.log = obj;
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });

    $scope.save = function(){

        $http.post(url+'/'+id, $scope.log, {
            data:{
                word:$scope.log.word,
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.wordfilter.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
}]);

