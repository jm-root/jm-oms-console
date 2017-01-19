'use strict';

app.controller('VipCondCtrl', ['$scope', '$state', '$http', '$timeout', 'sso', function ($scope, $state, $http, $timeout, sso) {
    jm.sdk.init({uri: gConfig.sdkHost});
    var config = jm.sdk.config;

    var hkey = 'VIP_CONDITIONS';
    var key = 'recharge';

    config.getConfig({token: sso.getToken(),root:hkey,key:key},function(err,result){
        if(err){
            err = result&&result.msg || err.message;
            return $scope.error(err);
        }
        $scope.tags = result.ret;
    });

    var formatTags = function(data){
        var ary = [];
        data = data || [];
        data.forEach(function(item){
            if(item.text) ary.push(item.text);
        });
        return ary;
    };

    $scope.save = function(){
        var val = formatTags($scope.tags||[]);
        val.sort(function(a,b){return a-b;});
        $scope.tags = val;
        config.setConfig({token: sso.getToken(),root:hkey,key:key,value:val},function(err,ret){
            if(err){
                err = ret&&ret.msg || err.message;
                return $scope.error(err);
            }
            $timeout(function(){
                $scope.success('设置成功');
            });
        });
    }

}]);

app.controller('VipItemCtrl', ['$scope', '$state', '$http', '$timeout', 'sso', function ($scope, $state, $http, $timeout, sso) {
    $scope.item = {};

    jm.sdk.init({uri: gConfig.sdkHost});
    var config = jm.sdk.config;

    var hkey = 'VIP_ITEM';
    var keys = ['login','recharge_jb','recharge_dbj','turntable'];

    keys.forEach(function(key){
        config.getConfig({token: sso.getToken(),root:hkey,key:key},function(err,result){
            if(err){
                return;
            }
            $scope.item[key] = result.ret;
        });
    });


    var formatTags = function(data){
        var ary = [];
        data = data || [];
        data.forEach(function(item){
            if(item.text) ary.push(item.text);
        });
        return ary;
    };

    $scope.save = function(key){
        var val = formatTags($scope.item[key]||[]);
        config.setConfig({token: sso.getToken(),root:hkey,key:key,value:val},function(err,ret){
            if(err){
                err = ret&&ret.msg || err.message;
                return $scope.error(err);
            }
            $timeout(function(){
                $scope.success('设置成功');
            });
        });
    }

}]);

app.controller('VipSetCtrl', ['$scope', '$state', '$http', '$timeout', 'sso', 'AGGRID', function ($scope, $state, $http, $timeout, sso, AGGRID) {
    $scope.vips = [];

    jm.sdk.init({uri: gConfig.sdkHost});
    var config = jm.sdk.config;

    var hkey = 'VIP_CONFIG';

    var columnDefs = [
        {headerName: "名称", field: "name", width: 140}
    ];

    $scope.gridOptions = {
        // paginationPageSize: Number($scope.pageSize),
        // rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        angularCompileRows: true,
        rowSelection: 'single',
        columnDefs: columnDefs,
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.home.vip.setedit' , {key: cell.data.key});
        },
        localeText: AGGRID.zh_CN,
        rowData: []
    };

    $scope.refresh = function(){
        config.listConfig({token: sso.getToken(),root:hkey},function(err,result){
            if(err){
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            var rows = [];
            result.rows.forEach(function(item){
                var args = item.split(':');
                rows.push({key:item,name:args[1]+'级会员'});
            });
            $scope.gridOptions.api.setRowData(rows);
        });
    };
    $scope.refresh();

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
                    var row = rows[0];
                    config.delConfig({token: sso.getToken(),root:hkey,key:row.key},function(err,doc){
                        if(err){
                            return $scope.error(doc||err);
                        }
                        $scope.success('删除成功');
                        $scope.refresh();
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
}]);

app.controller('VipSetEditCtrl', ['$scope', '$state', '$stateParams', '$http', '$timeout', 'sso', function ($scope, $state, $stateParams, $http, $timeout, sso) {
    jm.sdk.init({uri: gConfig.sdkHost});
    var config = jm.sdk.config;
    $scope.vip = {pattern:0};
    $scope.vals = {};
    $scope.items = [];
    $scope.propertys = [
        {key:'login',name:'每日登录赠送'},
        {key:'recharge_jb',name:'充值额外返利(金币)'},
        {key:'recharge_dbj',name:'充值额外返利(夺宝卷)'},
        {key:'turntable',name:'大厅每日转盘次数'}
    ];

    var key = $stateParams.key;
    $scope.key = key;

    var ueditor;
    $scope.onUeditor = function(ue){
        ueditor = ue;
        $timeout(function(){
            ue.fireEvent('contentchange');
        },1000);
    };
    $scope.ueditor_config = {
        serverUrl: uploadUri+"/ueditor?root=vip/"
    };

    if(key){
        var args = key.split(':');
        config.getConfig({token: sso.getToken(),root:'VIP_CONFIG',key:key},function(err,result){
            if(err){
                err = result&&result.msg || err.message;
                return $scope.error(err);
            }
            $scope.vip = result.ret;
            for(var key in $scope.vip)
            {
                $scope.items.push(_.find($scope.propertys,{key:key}));
            }
            $scope.vip.level = args[1]*1;

            if($scope.vip.pattern==1){
                $scope.vip.content = '<pre>'+$scope.vip.content+'</pre>';
            }
        });
    }

    $scope.propertys.forEach(function(item){
        var key = item.key;
        config.getConfig({token: sso.getToken(),root:'VIP_ITEM',key:key},function(err,result){
            if(err){
                return;
            }
            $scope.vals[key] = result.ret;
        });
    });


    $scope.save = function(){
        if(ueditor){
            if($scope.vip.pattern==0) $scope.vip.content = ueditor.getContentTxt();
            if($scope.vip.pattern==1) $scope.vip.content = ueditor.getPlainTxt();
            if($scope.vip.pattern==2) $scope.vip.content = ueditor.getContent();
        }
        var vip = angular.copy($scope.vip);
        var hkey = 'VIP_CONFIG';
        var key = 'level:'+vip.level;
        delete vip.level;
        config.getConfig({token: sso.getToken(),root:hkey,key:key},function(err,result){
            if(!$scope.key&&result.ret){
                $timeout(function(){
                    $scope.error('该等级已经存在,请更改等级');
                });
                 return ;
            }
            config.setConfig({token: sso.getToken(),root:hkey,key:key,value:vip},function(err,ret){
                if(err){
                    err = ret&&ret.msg || err.message;
                    return $scope.error(err);
                }
                $timeout(function(){
                    $scope.success('设置成功');
                    $state.go('app.home.vip.set');
                });
            });
        });
    }

}]);
