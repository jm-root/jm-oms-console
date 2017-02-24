'use strict';
app.controller('AgentListCtrl', ['$scope', '$http', '$state', '$stateParams', '$timeout', 'global', function($scope, $http, $state, $stateParams, $timeout, global) {
    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.status = history.status||'';
    $scope.audit = history.audit||'';
    $scope.search = history.search||{};
    $scope.search.agent = $scope.search.agent || '';

    var viewPath = 'view.agent.list';
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
    }).catch(function(err){
        console.log(err);
    });

    var format_account = function(params) {
        var user = params.data._id||{};
        return user.account||user.mobile||'';
    };

    var format_type = function(params) {
        var type = params.data.type || 0;
        var info = global.translateByKey('agent.agent.create.list.cooperateOpts.other');
        if(type==1){
            info = global.translateByKey('agent.agent.create.list.cooperateOpts.cooperate');
        }else if(type==2){
            info = global.translateByKey('agent.agent.create.list.cooperateOpts.buyout');
        }

        return info;
    };

    var format_level = function(params) {
        var level = params.data.level;
        return level+global.translateByKey('agent.agent.create.list.level');
    };

    var format_status = function(params) {
        var status = params.data.status;
        var info = global.translateByKey('agent.agent.create.list.statusOpts.enable');
        if(status==0) info = global.translateByKey('agent.agent.create.list.statusOpts.suspend');
        return info;
    };

    var format_audit = function(params) {
        var audit = params.data.audit;
        var info = global.translateByKey('agent.agent.create.list.auditOpts.opts2');
        if(audit==1) info = global.translateByKey('agent.agent.create.list.auditOpts.opts3');
        if(audit==2) info = global.translateByKey('agent.agent.create.list.auditOpts.opts4');
        return info;
    };

    var format_url = function(params) {
        var code = params.data.code;
        var info = 'http://'+$scope.host+'/agent.html?agent='+code;
        return info;
    };

    var redirect = 'http://'+$scope.host+'/agent.html?agent=';
    $scope.goto = function(data){
        var code = data.code;
        var info = redirect+code;
        window.open(info);
    };
    function render_url(params){
        var code = params.data.code;
        var level = params.data.level;
        var info = '';
        if(level!=1) info = redirect+code;
        return '<a style="text-decoration:underline;color:#0000CC" ng-click="goto(data)">'+info+'</a>';
    }

    $scope.auditFun = function(data,ispass){
        var id = data._id._id;
        var audit = ispass ? 1 : 2;
        $http.post(agentUri+'/agents/'+id, {audit:audit}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $scope.onPageSizeChanged();
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.onoff = function(data){
        var id = data._id._id;
        data.status = !data.status;
        $http.post(agentUri+'/agents/'+id, {status:data.status}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $scope.onPageSizeChanged();
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var htmlFun = function(account){
        return '<form name="formValidate" class="form-horizontal form-validation">' +
            '<div class="form-group">' +
            '<label class="col-sm-2 control-label" translate="common.account">账号</label>' +
            '<div class="col-lg-10 w-auto">' +
            '<p class="form-control-static">'+account+'</p>' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label class="col-sm-2 control-label" translate="common.password>密码</label>' +
            '<div class="col-sm-9">' +
            '<input type="number" class="form-control" placeholder="密码" ng-model="passwd" ng-required="true">' +
            '</div>' +
            '<div class="col-sm-1"></div>' +
            '</div>' +
            '</form>';
    };

    $scope.resetPasswd = function(data){
        var account = data._id.account||data._id.mobile;
        var user = data._id._id;
        $scope.openTips({
            title:global.translateByKey('common.resetPassword'),
            content: htmlFun(account),
            okTitle:global.translateByKey('common.confirm'),
            cancelTitle:global.translateByKey('common.cancel'),
            okCallback: function($s){
                var passwd;
                $http.post(agentUri+'/resetPasswd', {
                    user:user,
                    passwd:$s.passwd
                }, {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    var obj = result;
                    if(obj.err){
                        $scope.error(obj.msg);
                    }else{
                        $scope.success(global.translateByKey('common.succeed'));
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    function ctrl_render(params){
        return '<span class="btn btn-xs bg-primary m-r-xs" ng-click="auditFun(data,true)" ng-if="(data.audit==0||data.audit==2)&&(super||per[\'通过\'])" translate="common.pass">通过</span>'+
            '<span class="btn btn-xs bg-primary m-r-xs" ng-click="auditFun(data,false)" ng-if="data.audit==0&&(super||per[\'不通过\'])" translate="common.notPass">不通过</span>'+
            '<span class="btn btn-xs bg-primary m-r-xs" ng-click="onoff(data)" ng-if="super||per[\'onoff\']">{{data.status?suspend:normal}}</span>'+
            '<span class="btn btn-xs bg-primary m-r-xs" ng-click="resetPasswd(data)" translate="common.resetPassword">重置密码</span>';
    }

    var columnDefs = [
        {headerName: "上级渠道号", field: "pcode", width: 100},
        {headerName: "渠道号", field: "code", width: 100},
        {headerName: "渠道名", field: "name", width: 100},
        {headerName: "账号", field: "account", width: 100, valueGetter: format_account},
        {headerName: "代理级别", field: "level", width: 100, valueGetter: format_level},
        {headerName: "合作方式", field: "type", width: 100, valueGetter: format_type},
        {headerName: "创建时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "状态", field: "status", width: 70, valueGetter: format_status},
        {headerName: "审核状态", field: "audit", width: 100, valueGetter: format_audit},
        {headerName: "操作", width: 200, cellRenderer: ctrl_render, cellStyle:{'text-align':'center'}},
        {headerName: "推广地址", width: 360, cellRenderer: render_url}
    ];
    global.agGridTranslateSync($scope, columnDefs, [
        'agent.agent.create.list.header.pcode',
        'agent.agent.create.list.header.code',
        'agent.agent.create.list.header.name',
        'agent.agent.create.list.header.account',
        'agent.agent.create.list.header.level',
        'agent.agent.create.list.header.type',
        'agent.agent.create.list.header.crtime',
        'agent.agent.create.list.header.status',
        'agent.agent.create.list.header.audit',
        'agent.agent.create.list.header.ctrl',
        'agent.agent.create.list.header.addr'
    ]);

    var dataSource = {
        getRows: function (params) {
            global.agGridOverlay();             //翻译
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            $http.get(agentUri + '/agents', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: search.agent,
                    audit: $scope.audit,
                    status: $scope.status
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
        rowHeight: 30,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,     //翻译
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onRowDataChanged: function (cell) {
            global.agGridOverlay();                 //翻译
        },
        onCellDoubleClicked: function(cell){
            if($scope.super||$scope.per['详情']||$scope.per['编辑']){
                $state.go('app.agent.edit' , {id: cell.data._id._id});
            }
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
                size:'sm',
                okCallback: function(){
                    var ids = '';
                    rows.forEach(function(e){
                        if(ids) ids += ',';
                        ids += e._id._id;
                    });
                    $http.delete(agentUri+'/agents', {
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
                size:'sm',
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
    $scope.$watch('status', function () {
        history.status = $scope.status;
    });
    $scope.$watch('audit', function () {
        history.audit = $scope.audit;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
}]);

app.controller('AgentEditCtrl', ['$scope', '$http', '$state', '$stateParams', 'global', function($scope, $http, $state, $stateParams, global) {
    var sso = jm.sdk.sso;
    var viewPath = 'view.agent.list';
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
    }).catch(function(err){
        console.log(err);
    });

    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.agent = {type:'1',userInfo:{bankInfo:{}}};

    if(id){
        $http.get(agentUri+'/agents/' + id, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.agent = result;
                $scope.agent.type = ''+$scope.agent.type;
                var user = result._id || {};
                $scope.agent.userInfo = {
                    name: user.realName,
                    mobile: Number(user.mobile),
                    qq: Number(user.qq),
                    email: user.email,
                    bankInfo: user.bankInfo||{}
                };
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    function formatTags(tags){
        tags = tags || [];
        var ary = [];
        tags.forEach(function(item){
            ary.push(item.text);
        });
        return ary;
    }

    $scope.update = function(){
        var agent = $scope.agent;
        var id = agent._id._id;
        agent.tags = formatTags(agent.tags);
        delete agent.status;
        delete agent.audit;
        $http.post(agentUri+'/agents/'+id, $scope.agent, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.succeed'));
                $state.go('app.agent.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };


}]);

app.controller('AgentCreateCtrl', ['$scope', '$http', '$state', '$stateParams', 'global', function($scope, $http, $state, $stateParams,global) {
    var sso = jm.sdk.sso;
    $scope.checkInput = {};
    var viewPath = 'view.agent.list';
    $scope.super = true;
    $scope.per = {};
    global.getUserPermission(viewPath).then(function(obj){
        $scope.per = obj[viewPath]||{};
        $scope.super = !!$scope.per['*'];
    }).catch(function(err){
        console.log(err);
    });

    $scope.$state = $state;
    $scope.agent = {type:'1',bankInfo:{}};

    global.getLocalUser().then(function(user){
        $http.get(agentUri + '/agents/'+user.id, {
            params: {
                token: sso.getToken()
            }
        }).success(function (result) {
            if (result.err) {
                $scope.error(result.msg);
            } else {
                result = result || {};
                $scope.agentLevel = result.level ? result.level+1 : 1;
                $scope.limit = result.limit;
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    });


    function formatTags(tags){
        tags = tags || [];
        var ary = [];
        tags.forEach(function(item){
            ary.push(item.text);
        });
        return ary;
    }

    //{
    //    type: 1, //1:合作,2:买断
    //    name: 'xxx',
    //    userId: '5711d8069f8b7920125161d5',
    //    account: 'agent1',
    //    passwd: '123',
    //    realName: '某某',
    //    mobile: '13800138000',
    //    email: 'example@qq.com',
    //    qq: '123456798',
    //    bankInfo: {
    //        account: '账户',
    //        bank: '所属银行',
    //        subbranch: '所属支行',
    //        card: '卡号',
    //    },
    //    tags: '广州',
    //    memo: '备注'
    //}
    $scope.create = function(){
        var agent = $scope.agent;
        console.log(111);
        agent.tags = formatTags(agent.tags);
        $http.post(agentUri+'/agents', $scope.agent, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            console.log(result);
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success(global.translateByKey('common.createSucceed'));
                $scope.agent = {type:'1',bankInfo:{}};
                $state.go('app.agent.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.searchUser = function(keyword){
        $http.get(ssoUri+'/users', {
            params:{
                token: sso.getToken(),
                page: 1,
                keyword: keyword
            }
        }).success(function(result){
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
        $scope.selectRow = $scope.usersInfo.rows[$event.currentTarget.rowIndex-1];
        $scope.agent.userId = $scope.selectRow._id;
        $scope.agent.nick = $scope.selectRow.nick;
    };

    $scope.$watch('agent.userId', function () {
        if(!$scope.agent.userId){
            $scope.agent.nick = null;
        }
    });

    $scope.onBlur = function(key){
        if(!$scope.agent[key]) return ;

        $scope.checkInput[key] = false;
        $http.get(ssoUri+'/checkUser', {
            params:{
                any: $scope.agent[key]
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                var ret = result.ret;
                $scope.checkInput[key] = ret;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

}]);
