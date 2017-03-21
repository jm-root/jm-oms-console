app.controller('RoleUserCtrl', ['$scope', '$http', function($scope, $http) {
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
    $scope.page = 1;
    $scope.left = function () {
        if($scope.page>1){
            --$scope.page;
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++$scope.page;
        }
    };
    $scope.usersInfo={};
    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                keyword: keyword
            }
        }).success(function(result){
            var data = result;
            if(data.err){
                $scope.error(data.msg);
            }else{
                $scope.usersInfo = data;
                $scope.pages = Math.ceil($scope.usersInfo.rows.length/10);

            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    $scope.selectUser = function($event){
        $scope.selectRow = $scope.usersInfo.rows.slice(10*($scope.page-1),[10*$scope.page])[$event.currentTarget.rowIndex-1];
        $scope.newuser = $scope.selectRow._id;
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
                $scope.users = null;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.selectRole = function(role){
        angular.forEach($scope.roles, function(role) {
            role.selected = false;
        });
        $scope.role = role;
        $scope.role.selected = true;
        $http.get(perUri+'/roles/_' + $scope.role.code + '_/users/', {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.users = obj.rows;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var addRoleUser = function(id, role, cb){
        if(!id||!role) return;
        $http.post(perUri+'/roles/'+id+'/roles', {}, {
            params:{
                token: sso.getToken(),
                role: role
            }
        }).success(function(result) {
            if(cb){
                cb(result);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
    var removeRoleUser = function(id, role, cb){
        if(!id||!role) return;
        $http.delete(perUri+'/roles/'+id+'/roles', {
                params:{
                    token: sso.getToken(),
                    role: role
                }
            }
        ).success(function(result) {
            if(cb){
                cb(result);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.addUser = function(){
        if(!$scope.newuser||!$scope.role.code) return;
        addRoleUser($scope.newuser, $scope.role.code, function(result){
            $scope.newuser = '';
            $scope.selectRole($scope.role);
        })
    };

    $scope.delUser = function(){
        if(!$scope.newuser||!$scope.role.code) return;
        removeRoleUser($scope.newuser, $scope.role.code, function(result){
            $scope.newuser = '';
            $scope.selectRole($scope.role);
        })
    };

    $scope.clickName = function(data){
        $scope.newuser = data._id;
    };

}]);

