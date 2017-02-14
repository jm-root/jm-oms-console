
'use strict';
app.controller('UsersListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'AGGRID', 'global',
    function($scope, $http, $state, $stateParams, $timeout, AGGRID,global) {
    var sso=jm.sdk.sso;
    var acl = jm.sdk.acl;
    var history = global.usersListHistory||(global.usersListHistory={});
    $scope.pageSize = history.pageSize||'10';
    $scope.search = history.search||{};
    var format_status = function(params) {
        var status = params.data.status||'';
        if(status=='0') status = '未激活';
        if(status=='1') status = '已激活';
        return status;
    };
    var format_roles = function(params) {
        var roles = params.data.roles||'';
        var rolesAry=[];
        if(roles){
            roles.forEach(function (item) {
                $scope.allRoles.forEach(function (role) {
                    if(role.code==item){
                        if(role.title){
                            rolesAry.push(role.title);
                        }else{
                            rolesAry.push(item);
                        }
                    }
                });
            });
        }
        return rolesAry;
    };
    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "昵称", field: "nick", width: 90,cellStyle:{'text-align':'center'}},
        {headerName: "角色", field: "roles", width: 80, valueGetter:format_roles,cellStyle:{'text-align':'center'} },
        {headerName: "标签", field: "tags", width: 80},
        {headerName: "创建者", field: "creator.nick", width: 80},
        {headerName: "激活状态", field: "status", width: 100, valueGetter:format_status,cellStyle:{'text-align':'center'}},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS,cellStyle:{'text-align':'center'}},
        {headerName: "最后登录IP", field: "creator.nick", width: 80},
        {headerName: "最后登录时间", field: "creator.nick", width: 80},
        {headerName: "登录次数", field: "creator.nick", width: 80}
    ];

    var dataSource = {
        getRows: function (params) {
            var search = $scope.search;
            var keyword = search.keyword;
            var status=search.status;
            var page = params.startRow / $scope.pageSize + 1;
            acl.user.list({
                token: sso.getToken(),
                page: page,
                rows: $scope.pageSize,
                keyword: keyword,
                status:status
            }, function(err, doc){
                if(doc.err){
                    $scope.errorTips(doc.err);
                    return;
                } else
                {
                    var data = doc;
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
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
        enableColResize: true,
        angularCompileRows: true,
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.acl.users.edit' , {id: cell.data._id});
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
                    $http.delete(aclUri+'/users/'+ids, {
                        params:{
                            token: sso.getToken()
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
    //获取用户拥有的角色列表
    acl.role.list({
            token: sso.getToken()
     },function (err,result) {
        if(result.err){
            $scope.error(result.msg);
            $scope.errorTips(result.msg);
        }else{
            $scope.allRoles = result.rows;
        }
    });
}]);

app.controller('UsersCtrl', ['$scope', '$http', '$state', '$stateParams',function($scope, $http, $state, $stateParams) {
    var sso=jm.sdk.sso;
    var acl=jm.sdk.acl;
    var token=sso.getToken();
    $scope.$state = $state;
    var id = $stateParams.id;
    $scope.id = id;
    $scope.user = {
    };
    //获取用户拥有的角色列表
    acl.role.list({
        token: token
    },function (err,result) {
        console.log(result);
        if(result.err){
            $scope.error(result.msg);
            $scope.errorTips(result.msg);
        }else{
            $scope.allRoles = result.rows;
        }
    });
    if(id){
        $http.get(aclUri+'/users/' + id, {
            params:{
                token: token
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.user = obj;
                if(id==localStorage.getItem('id')){
                    $scope.roleDisable = true;
                    $scope.user.rolesformat=format_roles($scope.user.roles)
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    //格式化
     function format_roles(roles) {
        var rolesAry=[];
        if(roles){
            roles.forEach(function (item) {
                $scope.allRoles.forEach(function (role) {
                    if(role.code==item){
                        if(role.title){
                            rolesAry.push(role.title);
                        }else{
                            rolesAry.push(item);
                        }
                    }
                });
            });
        }
        return rolesAry;
    }
    $scope.save = function(){
        var tags = [];
        $scope.user.tags = $scope.user.tags || [];
        $scope.user.tags.forEach(function(item){
            tags.push(item.text);
        });
        $scope.user.tags = tags;
        $scope.user.creator=sso.user.id;
        $http.post(aclUri+'/users', $scope.user, {
            params:{
                token: token
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.acl.users.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.update = function(){
        var tags = [];
        $scope.user.tags = $scope.user.tags || [];
        $scope.user.tags.forEach(function(item){
            tags.push(item.text);
        });
        $scope.user.tags = tags;
        $http.post(aclUri+'/users/'+id, $scope.user, {
            params:{
                token: token
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.acl.users.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.usersInfo={};
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: token,
                page: 1,
                keyword: keyword
            }
        }).success(function(result){
            console.log(result)
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        if(!$scope.id){
            $scope.selectRow = $scope.usersInfo.rows[$event.currentTarget.rowIndex-1];
            $scope.user._id = $scope.selectRow._id;
            $scope.user.nick = $scope.selectRow.nick;
        }
    };

}]);


