
app.controller('UsersListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'sso', 'common', 'AGGRID', 'global', function($scope, $http, $state, $stateParams, $timeout, sso, common, AGGRID, global) {
    var history = global.usersListHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    $scope.isMgr = false;

    $scope.dateOptions = global.dateRangeOptions;

    var format_gender = function(params) {
        var gender = params.data.gender||'';
        if(gender=='0') gender = '男';
        if(gender=='1') gender = '女';
        return gender;
    };

    function active_render(params){
        return '<label class="i-checks i-checks-sm">'+
            '<input type="checkbox" ng-model="data.active" ng-change="activeChange(data)"><i></i>'+
            '</label>';
    }

    $scope.activeChange = function(data){
        $http.post(ssoUri+'/users/'+data._id, {active:data.active}, {
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
        {headerName: "id", field: "uid", width: 50},
        {headerName: "账号", field: "account", width: 100},
        {headerName: "手机号", field: "mobile", width: 120},
        {headerName: "邮箱", field: "email", width: 120},
        // {headerName: "微信UnionID", field: "mp_unionid", width: 255},
        // {headerName: "微信OpenID", field: "mp_openid", width: 255},
        {headerName: "昵称", field: "nick", width: 90},
        {headerName: "性别", field: "gender", width: 80, valueGetter: format_gender},
        {headerName: "激活状态", field: "active", width: 100, cellRenderer: active_render, cellStyle:{'text-align':'center'}},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    var dataSource = {
        getRows: function (params) {
            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = search.keyword;
            var active = search.active;
            var type = search.type;
            var tags = search.tags;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(ssoUri + '/users', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: keyword,
                    active: active,
                    type: type,
                    tags: tags,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            }).success(function (result) {
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function (msg, code) {
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
            $state.go('app.per.users.edit' , {id: cell.data._id});
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
                    $http.delete(ssoUri+'/users', {
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

    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });

    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });
    $scope.$watch('isMgr', function () {
        console.log($scope.isMgr);
        if($scope.isMgr)$scope.search.tags = ['角色'];
        if(!$scope.isMgr) delete $scope.search.tags;
        $scope.onPageSizeChanged();
    });
}]);

app.controller('UsersCtrl', ['$scope', '$http', '$state', '$stateParams', 'sso', function($scope, $http, $state, $stateParams, sso) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.user = {
    };

    if(id){
        $http.get(ssoUri+'/users/' + id, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.user = obj;
                $scope.user.avatar = sdkHost+sso.getAvatarUri(obj,true);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.user.passwd = '000000';
        $scope.user.avatar = '../common/images/avatar.jpg';
    }

    $scope.save = function(){
        var tags = [];
        $scope.user.tags = $scope.user.tags || [];
        $scope.user.tags.forEach(function(item){
            tags.push(item.text);
        });
        $scope.user.tags = tags;
        if(!cropper.croppedImage) delete $scope.user.avatar;

        $http.post(ssoUri+'/users/save', $scope.user, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.per.users.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
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
        $scope.user.avatar = cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };

}]);


