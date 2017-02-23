'use strict';

app.controller('ResourceCtrl', ['$scope', '$state', '$http', function ($scope, $state, $http) {
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
        $scope.getResources(node.code);
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

    $scope.getResources = function(org){
        $http.get(perUri+'/resources', {
            params:{
                token: sso.getToken(),
                orgs: org
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.resources = obj.rows;
                $scope.resource = null;
                $scope.curResource = null;
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
        if(!$scope.isCollapsed){
            $scope.resource = $scope.curResource;
            $scope.ebtnname='新增';
            $scope.ubtnname='取消';
        }
    };


    $scope.isCollapsed = true;
    $scope.change = function(id){
        if(id==1&&!$scope.curResource) return;

        $scope.isCollapsed = !$scope.isCollapsed;
        if($scope.isCollapsed){
            $scope.ebtnname='新增';
            $scope.ubtnname='更新';
        }else{
            if(id==0){
                var code = $scope.org&&$scope.org.code || $scope.treedata[1].code;
                $scope.resource = {status:1,orgs:[code]};
                $scope.ebtnname='取消';
            }
            if(id==1){
                $scope.resource = $scope.curResource;
                $scope.ubtnname='取消';
            }
        }
    };

    var formatTags = function(data){
        var ary = [];
        data = data || [];
        data.forEach(function(item){
            ary.push(item.text);
        });
        return ary;
    };

    $scope.enter = function(){
        $scope.isCollapsed = true;
        $scope.ebtnname='新增';
        $scope.resource.permissions = formatTags($scope.resource.permissions);
        $scope.resource.perNoLimit = formatTags($scope.resource.perNoLimit);
        $scope.resource.perSignOnLimit = formatTags($scope.resource.perSignOnLimit);
        $http.post(perUri+'/resources', $scope.resource, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.resource._id = result.id;
            $scope.resources.push($scope.resource);
            $scope.resource = {};
            $scope.success('操作成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.update = function(){
        $scope.isCollapsed = true;
        $scope.ubtnname='更新';
        $scope.resource.permissions = formatTags($scope.resource.permissions);
        $scope.resource.perNoLimit = formatTags($scope.resource.perNoLimit);
        $scope.resource.perSignOnLimit = formatTags($scope.resource.perSignOnLimit);
        var id = $scope.resource._id;
        $http.post(perUri+'/resources/'+id, $scope.resource, {
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

    $scope.deleteResource = function(resource){
        $scope.openTips({
            title:'提示',
            content:'是否确认删除当前资源?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                $http.delete(perUri+'/resources', {
                    params:{
                        token: sso.getToken(),
                        resource: resource.code
                    }
                }).success(function(result) {
                    if(result.err){
                        return $scope.error(result.msg);
                    }
                    $scope.resources.splice($scope.resources.indexOf(resource), 1);
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

