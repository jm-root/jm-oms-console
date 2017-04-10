'use strict';

app.controller('GuestBookCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
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
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'log.guestbook.ip',
        'log.guestbook.content',
        'log.guestbook.time',
        'log.guestbook.contact'
    ]);
    var dataSource={
        getRows:function(params){
            global.agGridOverlay();             //翻译
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
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
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
                            $scope.success(global.translateByKey('common.succeed'));
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
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
}]);


app.controller('WordFilterLogCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var sso = jm.sdk.sso;
    var history = global.WordFilterLogHistory||(global.WordFilterLogHistory={});
    $scope.pageSize=history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};

    $scope.dateOptions = global.dateRangeOptions;


    var columnDefs=[
        // {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "用户ID", field: "userId", width: 150,hide:true},
        {headerName: "IP", field: "ip", width: 150},
        {headerName: "拦截内容", field: "content", width: 150},
        {headerName: "敏感词", field: "words", width: 160},
        {headerName: "标签", field: "tags", width: 150},
        {headerName: "拦截时间", field: "crtime", width: 160, valueGetter: $scope.angGridFormatDateS}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'log.log.userId',
        'log.log.ip',
        'log.log.content',
        'log.log.words',
        'log.log.tags',
        'log.log.crtime'
    ]);

    var dataSource={
        getRows:function(params){
            global.agGridOverlay();             //翻译
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
    $scope.gridOptions={
        paginationPageSize: Number($scope.pageSize),
        rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
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
                            $scope.success(global.translateByKey('common.succeed'));
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
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });

}]);


app.controller('WordFilterCtrl', ['$scope', '$state','$stateParams', '$http', 'global', function ($scope, $state,$stateParams, $http, global) {
    var sso = jm.sdk.sso;
    var history = global.WordFilterHistory||(global.WordFilterHistory={});
    $scope.pageSize=history.pageSize||'50';
    $scope.search = history.search||{};
    $scope.wordfilter=history.wordfilter;
    $scope.crtime=history.crtime;
    var url= wordfilterUri +'/words';

    $scope.$state = $state;
    var id = $stateParams.id;
    $scope.id = id;
    $scope.log = {};

    var columnDefs=[
        // {headerName:"_id",field:"_id",width:80,hide:true},
        {headerName:"ID",field:"id",width:180,valueGetter:format_id},
        {headerName:"敏感词",field:"word",width:200},//给敏感词添加一个模板，或者事件监听
        {headerName:"状态",field:"status",width:200,hide:true},
        {headerName:"创建时间",field:"crtime",width:200,valueGetter:$scope.angGridFormatDateS,sort:'desc'},
        {headerName:"操作",field:"ctrl",width:200,cellRenderer:operate,cellStyle:{'text-align':'center'}},
        {headerName:"状态",field:"__v",width:200,hide:true}
    ];
    global.agGridTranslateSync($scope, columnDefs, [                 //翻译
        'log.list.id',
        'log.list.word',
        'log.list.status',
        'log.list.crtime',
        'log.list.ctrl'
    ]);

    function format_id(params){
        var a = params.node.id+1;
        return a;
    };
    var dataSource={
        getRows:function(params){
            global.agGridOverlay();             //翻译
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
        return '<button class="btn btn-danger btn-xs" ng-click="delete()" translate="log.delete">删除</button>'
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
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.wordfilter.update',{id : cell.data._id});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.wordfilter.update',{id : cell.data._id});
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        localeText: global.agGrid.localeText,
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
            title:global.translateByKey('openTips.title'),
            content:global.translateByKey('openTips.delContent'),
            okTitle:global.translateByKey('common.yes'),
            cancelTitle:global.translateByKey('common.no'),
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
                        $scope.success(global.translateByKey('common.succeed'));
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
                    $scope.success(global.translateByKey('common.succeed'));
                    $scope.gridOptions.api.setDatasource(dataSource);
                }
            }).error(function (msg, code) {
                $scope.errorTips(code);
            });
        } else {
            $scope.openTips({
                title: global.translateByKey('openTips.title'),
                content: global.translateByKey('openTips.notAllow'),
                cancelTitle: global.translateByKey('openTips.cancelDelContent'),
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
            $scope.log.crtime = moment($scope.log.crtime).format('YYYY-MM-DD HH:mm:ss');
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
            console.log(result);
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $state.go('app.wordfilter.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
}]);

