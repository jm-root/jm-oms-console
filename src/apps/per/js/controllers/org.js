'use strict';

app.controller('OrgCtrl', ['$scope', '$state', '$http', 'sso', function ($scope, $state, $http, sso) {

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
        $http.get(aclUri+'/orgs/tree', {
            params: {
                token: sso.getToken()
            }
        }).success(function (result) {
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.treedata = [result];
                $scope.expandedNodes = $scope.expandNodes($scope.treedata[0]);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.getTree();


    $scope.parent;
    $scope.selectedNode = function(node,parent) {
        $scope.org = node;
        if(parent){
            $scope.org.ptitle = parent.title;
        }
    };

    $scope.addNode = function() {
        $scope.org = $scope.org||$scope.treedata[0];
        $scope.parent = $scope.org;
        $scope.org = {pid:$scope.parent._id,ptitle:$scope.parent.title,status:1,sort:0};
        $scope.selected = $scope.parent;
    };

    $scope.createNode = function() {
        $http.post(aclUri+'/orgs', $scope.org, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.org._id = result.id;
                $scope.parent.children = $scope.parent.children || [];
                $scope.parent.children.push($scope.org);
                $scope.selected = $scope.org;
                $scope.expandedNodes = $scope.expandNodes($scope.treedata[0]);
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.updateNode = function() {
        var id = $scope.org._id;
        $http.post(aclUri+'/orgs/'+id, $scope.org, {
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

    $scope.deleteNode = function() {
        $scope.openTips({
            title:'提示',
            content:'如果当前节点存在子节点也会一并删除,是否确认删除?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                var id = $scope.org._id;
                $http.delete(aclUri+'/orgs/'+id,{
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    if(result.err){
                        $scope.error(result.msg);
                    }else{
                        $scope.getTree();
                        $scope.org = null;
                        $scope.success('操作成功');
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    $scope.expandNodes = function(node){
        var ary = [node];
        if(node.children){
            node.children.forEach(function(child){
                ary = ary.concat($scope.expandNodes(child));
            });
        }
        return ary;
    }

}]);

