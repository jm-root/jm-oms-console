'use strict';
var sso = jm.sdk.sso;
app.controller('SystemAdminCtrl', ['$scope', '$state', '$http','AGGRID', 'global', function ($scope, $state, $http, AGGRID, global) {
    var history=global.SystemAdminHitory || (global.SystemAdminHitory={});
    $scope.pageSize = history.pageSize || $scope.defaultRows;
    $scope.search = history.search || {};
    $scope.search.keyword = $scope.search.keyword || '';
    var url='http://192.168.0.249:21000/getadmin';

    var columnDefs=[
        {headerName:"管理员ID",field:"adminid",width:100},
        {headerName:"用户名",field:"username",width:100},
        {headerName:"真实姓名",field:"name",width:100},
        {headerName:"登陆次数",field:"loginnum",width:100},
        {headerName:"系统管理员",field:"admin",width:80},
        {headerName:"是否激活",field:"activation",width:80},
        {headerName:"最后登录IP",field:"lastip",width:100},
        {headerName:"最后登录时间",field:"lasttime",width:150,valueGetter:$scope.angGridFormatDateS},
        {headerName:"注册时间",field:"registtime",width:150,valueGetter:$scope.angGridFormatDateS},
        {headerName:"",field:"operating",width:100,valueGetter:operate,cellStyle:{'text-align':'center'}}
    ];
    function operate(params) {
        return '<button class="btn btn-primary btn-xs m-r-xs">编辑</button>'+'<button class="btn btn-danger btn-xs">删除</button>';
    }
    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(url, {
                token: sso.getToken(),
                keyword:$scope.search.keyword ||'',
                page:page
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage,lastRow);
                }
            }).error(function(msg, code){
                $scope.errorTips(code);
            });
        }
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
        localeText: AGGRID.zh_CN,
        datasource: dataSource
    };
    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);
        $scope.gridOptions.api.setDatasource(dataSource);
    };
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

}]);

app.controller('SystemLogCtrl', ['$scope', '$state', '$http','AGGRID', 'global', function ($scope, $state, $http,AGGRID, global) {
    var sso = jm.sdk.sso;
    var history=global.SystemLogHistory||(global.SystemLogHistory={});
    $scope.pageSize=history.pageSize||$scope.defaultRows;

    $scope.search = history.search || {};
    $scope.search.keyword =   $scope.search.keyword || "";
    $scope.search.date = $scope.search.date||{};
    $scope.search.isSearchUser = $scope.search.isSearchUser || 0;
    $scope.dateOptions=global.dateRangeOptions;
    // $scope.dateOptions = angular.copy(global.dateRangeOptions);
    // $scope.dateOptions.opens = 'left';

    var url= logUri + '/logs';

    var columnDefs=[
        // {headerName:"ID",field:"id",width:150},
        {headerName:"类别",field:"type",width:150, cellRenderer: formatOperation},
        {headerName:"操作内容",field:"operation",width:150},
        {headerName:"操作管理员",field:"user.nick",width:150},
        {headerName:"操作时间",field:"crtime",width:150,valueGetter:$scope.angGridFormatDateS},
        {headerName:"操作者IP",field:"ip",width:150}
    ];

    function formatOperation  (param) {
       if(param.data.type == 1){
           return "操作数据日志";
       }else if(param.data.type == 2){
           return "业务日志";
       }else{
           return "常规日志";
       }
    };

    var dataSource={
        getRows:function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate || '';
            var endDate = date.endDate || '';
            var keyword = search.keyword;
            var isSearchUer = $scope.search.isSearchUser ? 1 : 0;

            $http.get(url,{
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    startDate:startDate.toString(),
                    endDate:endDate.toString(),
                    isSearchUser: isSearchUer
                }
         }).success(function (result) {
                var data=result;
                console.log(result);
                if(data.err){
                    $scope.error(data.msg)
                }else{
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage,lastRow);
                }
            }).error(function (msg,code) {
                $scope.errorTips(code)
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
        angularCompileRows: true,
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
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

    // $scope.$watch('search.date', function () {
    //     $scope.onPageSizeChanged();
    // });

}]);
//新建用户
app.controller('SystemAdminAddCtrl', ['$scope', '$state', '$http','AGGRID', 'global', function ($scope, $state, $http, AGGRID, global) {

}]);