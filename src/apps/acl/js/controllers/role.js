'use strict';

app.controller('RoleCtrl', ['$scope', '$state', '$http', 'sso', function ($scope, $state, $http, sso) {

    $scope.opts = {
        injectClasses: {
            "ul": "tree-font-size",
            "iExpanded": "fa fa-minus",
            "iCollapsed": "fa fa-plus",
            "iLeaf": "fa fa-file-o",
            "labelSelected": "tree-selected"
        }
    };

    $scope.style={
        visibility: 'hidden'
    };
    $scope.curRole=null;
    $scope.selectRole = function(role){
        angular.forEach($scope.roles, function(role) {
            role.selected = false;
        });
        $scope.curRole = role;
        $scope.curRole.selected = true;
        $scope.curPermission= null;
        $scope.addPermission={};
        $scope.removePermission={};
        if(!$scope.isCollapsed){
            $scope.role = $scope.curRole;
            $scope.ebtnname='新增';
            $scope.ubtnname='取消';
        }
        $scope.getResource(role);
    };
    $scope.isCollapsed = true;
    $scope.change = function(id){
        if(id==1&&!$scope.curRole) return;

        $scope.isCollapsed = !$scope.isCollapsed;
        if($scope.isCollapsed){
            $scope.ebtnname='新增';
            $scope.ubtnname='更新';
        }else{
            if(id==0){
                $scope.role = {status:1};
                $scope.ebtnname='取消';
            }
            if(id==1){
                $scope.role = $scope.curRole;
                $scope.ubtnname='取消';
            }
        }
    };

    $scope.enter = function(){
        $scope.isCollapsed = true;
        $scope.ebtnname='新增';
        $scope.role.creator=sso.user.id;
        $http.post(aclUri+'/roles', $scope.role, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.role._id = result._id;
            $scope.roles.push($scope.role);
            $scope.role = {};
            $scope.success('操作成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.update = function(){
        $scope.isCollapsed = true;
        $scope.ubtnname='更新';
        var id = $scope.role._id;
        $http.post(aclUri+'/roles'+id, $scope.role, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.success('操作成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.deleteRole = function(role){
        $scope.openTips({
            title:'提示',
            content:'是否确认删除当前角色?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                $http.delete(aclUri+'/roles/'+role._id, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result) {
                    if(result.err){
                        return $scope.error(result.msg);
                    }
                    $scope.roles.splice($scope.roles.indexOf(role), 1);
                    $scope.resources = [];
                    $scope.success('操作成功');
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };
    //角色资源权限
    $scope.getResource = function(role){
       
        $http.get(aclUri+'/roles/'+role._id +'/resources', {
            params:{
                code:role.code,
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
           
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.curPermission= result;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    //设置角色权限
    $scope.addPermission={};
    $scope.removePermission={};
    $scope.setPermisssion=function ($event,code) {
        var checkbox = $event.target;
       
        if(checkbox.checked){
            if(!$scope.removePermission[code]||$scope.removePermission[code].indexOf(checkbox.value)==-1){
                if (!$scope.addPermission[code]) {
                    $scope.addPermission[code] = [checkbox.value];
                } else {
                    if ($scope.addPermission[code].indexOf(checkbox.value) == -1) {
                        $scope.addPermission[code].push(checkbox.value);
                    }
                }
            }else{
                $scope.removePermission[code].splice($scope.removePermission[code].indexOf(checkbox.value),1);
            }

        }else{
            if(!$scope.addPermission[code]||$scope.addPermission[code].indexOf(checkbox.value)==-1){
                    if(!$scope.removePermission[code]){
                        $scope.removePermission[code]=[checkbox.value];
                    }else{
                        if($scope.removePermission[code].indexOf(checkbox.value)==-1) {
                            $scope.removePermission[code].push(checkbox.value);
                        }
                    }
            }else{
                $scope.addPermission[code].splice($scope.addPermission[code].indexOf(checkbox.value),1);
            }
        }
    };
    //格式化参数
    function formatPermission(ary) {
        var allow=[];
        for (var key in ary) {
            if (ary.hasOwnProperty(key)){
                var per={
                    permissions:ary[key],
                    resources:key
                };
                allow.push(per);
            }
        }
        return allow;
    }
    //更新角色资源的权限
    $scope.changePermission=function () {
        $http.post(aclUri+'/roles/'+$scope.curRole._id+'/resource',{
            roles:$scope.curRole.code,
            addPermission:formatPermission($scope.addPermission),
            removePermission:formatPermission($scope.removePermission)
        },{
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.getResource($scope.curRole);
                $scope.addPermission={};
                $scope.removePermission={};
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    function init(){
        //获取用户资源树及其权限
        $http.get(aclUri+'/users/'+ sso.user.id+'/resources/tree', {
            params: {
                token: sso.getToken()
            }
        }).success(function (result) {
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.angularTreeList =result;
                $scope.treeOptions=$scope.angularTreeList;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    sso.on('getUser', function(user){
        init();
    });
    if(sso.user) init();
    //获取用户所属角色
    $http.get(aclUri+'/users/'+localStorage.getItem('id')+'/roles', {
        params: {
            token: sso.getToken(),
            creator: localStorage.getItem('id')
        }
    }).success(function (result) {
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.userRoles =result;
            console.log(result);
            getRoles(result)
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });
    //获取用户创建的角色
    function getRoles(userRoles) {
        $http.get(aclUri+'/roles/', {
            params:{
                token: sso.getToken(),
                creator: localStorage.getItem('id')
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                var ary=[];
                result.rows.forEach(function (item) {
                    if(!userRoles[item.code]){
                        ary.push(item);
                    }
                });
                for(var key in userRoles){
                    ary.unshift(userRoles[key]);
                }
                $scope.roles =ary ;//获取用户创建的角色
                $scope.role = null;
                $scope.curRole = null;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

}]);
