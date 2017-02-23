'use strict';

app.controller('RoleCtrl', ['$scope', '$state', '$http', function ($scope, $state, $http) {
    var sso = jm.sdk.sso;

    $scope.opts = {
        injectClasses: {
            "ul": "tree-font-size",
            "iExpanded": "fa fa-minus",
            "iCollapsed": "fa fa-plus",
            "iLeaf": "fa fa-file-o",
            "labelSelected": "tree-selected"
        }
    };

    $scope.getTree = function(){
        $http.get(perUri+'/orgs/tree', {
            params: {
                token: sso.getToken()
            }
        }).success(function (result) {
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.treedata = [{code:'none',title:'无组织'},result];
                $scope.expandedNodes = $scope.expandNodes($scope.treedata[1]);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.getTree();


    $scope.selectedNode = function(node,parent) {
        $scope.org = node;
        if(parent){
            $scope.org.ptitle = parent.title;
        }
        $scope.getRoles(node.code);
        if(!$scope.isCollapsed){
            $scope.isCollapsed = true;
            $scope.ebtnname='新增';
            $scope.ubtnname='更新';
        }
    };

    $scope.expandNodes = function(node){
        var ary = [node];
        if(node.children){
            node.children.forEach(function(child){
                ary = ary.concat($scope.expandNodes(child));
            });
        }
        return ary;
    };

    $scope.getRoles = function(org){
        $http.get(perUri+'/roles', {
            params:{
                token: sso.getToken(),
                orgs: org
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.roles = obj.rows;
                $scope.role = null;
                $scope.curRole = null;
                $scope.resources = null;
                $scope.curResource = null;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.selectRole = function(role){
        angular.forEach($scope.roles, function(role) {
            role.selected = false;
        });
        $scope.curRole = role;
        $scope.curRole.selected = true;
        if(role.orgs&&role.orgs.length)
            $scope.getResource(role.code);
        if(!$scope.isCollapsed){
            $scope.role = $scope.curRole;
            $scope.ebtnname='新增';
            $scope.ubtnname='取消';
        }
    };

    $scope.getResource = function(roleCode){
        $http.get(perUri+'/roles/_' + roleCode + '_/resources', {
            params:{
                token: sso.getToken()
                ,complex: true
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.resources = obj.rows;
                $scope.curResource = {};
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.selectResource = function(resource){
        angular.forEach($scope.resources, function(resource) {
            resource.selected = false;
        });
        $scope.curResource = resource;
        $scope.curResource.selected = true;
    };

    $scope.selectPermission = function(permission){
        angular.forEach($scope.curResource.permissions, function(permission) {
            permission.selected = false;
        });
        $scope.curPermission = permission;
        $scope.curPermission.selected = true;
    };

    $scope.updateResource = function(){
        var resource = $scope.curResource.code;
        if(resource){
            var role = $scope.curRole.code;
            var isChecked = $scope.curResource.isChecked;
            if(!isChecked){
                $http.delete(perUri+'/roles/_'+role+'_/resources', {
                        params:{
                            token: sso.getToken()
                            ,resource: resource
                        }
                    }
                ).success(function(result) {
                    if(result.err){
                        $scope.error('操作失败');
                    }else{
                        angular.forEach($scope.curResource.permissions, function(permission) {
                            permission.isChecked = false;
                        });
                        $scope.success('操作成功');
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }else{
                $scope.success('操作成功');
            }
        }
    };
    $scope.updatePermission = function(){
        var permission = $scope.curPermission.code;
        if(permission){
            var role = $scope.curRole.code;
            var resource = $scope.curResource.code;
            var isChecked = $scope.curPermission.isChecked;
            if(isChecked){
                $http.post(perUri+'/roles/_'+role+'_/permissions', {}, {
                    params:{
                        token: sso.getToken()
                        ,permissions: permission
                        ,resource: resource
                    }
                }).success(function(result) {
                    result.err ? $scope.error('操作失败') : $scope.success('操作成功');
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }else{
                $http.delete(perUri+'/roles/_'+role+'_/permissions', {
                        params:{
                            token: sso.getToken()
                            ,permissions: permission
                            ,resource: resource
                        }
                    }
                ).success(function(result) {
                    result.err ? $scope.error('操作失败') : $scope.success('操作成功');
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        }
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
                var code = $scope.org&&$scope.org.code || $scope.treedata[1].code;
                $scope.role = {status:1,orgs:[code]};
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
        $http.post(perUri+'/roles', $scope.role, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.role._id = result.id;
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
        console.log($scope.role);
        $http.post(perUri+'/roles/'+id, $scope.role, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.success('操作成功');
            var isHasSelf = $scope.role.orgs.indexOf($scope.org.code)>=0;
            if(isHasSelf) return;
            var index = $scope.roles.indexOf($scope.role);
            index>=0 && $scope.roles.splice(index, 1);
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
                $http.delete(perUri+'/roles/_'+role.code+'_', {
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

    $http.get(perUri+'/orgs', {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.orgs = result.rows;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });
}]);

