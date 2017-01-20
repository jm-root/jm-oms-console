'use strict';

app.controller('RechargeCardCtrl', ['$scope', '$state', '$http', 'AGGRID', 'global', function ($scope, $state, $http, AGGRID, global) {
    var sso = jm.sdk.sso;
    var history = global.rechargeCardHistory||(global.rechargeCardHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search || {};
    $scope.search.type =   $scope.search.type || "";
    $scope.search.date = $scope.search.date||{};
    $scope.type = history.type || '';
    $scope.parValue = history.parValue || '';
    $scope.dateOptions=global.dateRangeOptions;

//先全局定义一个变量cardTypesRows
    var cardTypeRows = [];

    $scope.goto = function(data){
        console.log(data.card.attach.length);
        var d = {
            id:data._id,
            code:data.code,
            parValue:data.parValue,
            cardtype:data.card.type,
            channel:data.channel,
            number:data.card.attach.length
        };
        $state.go('app.recharge.card.add',{
            data : d
        });

    };


    function ctrl_render(params){
        return '<span class="btn btn-xs bg-primary m-r-xs" ng-click="goto(data)">编辑</span>'+
            '<span class="btn btn-xs bg-danger m-r-xs" ng-click="delete(data)">删除</span>';
    }

    function form_status(params){
        var data = params.data;
        var info = "";
        if(data.status == "0"){
            info = "禁用";
        }else if(data.status == "1"){
            info = "未用";
        }else if(data.status == "2"){
            info = "已使用";
        }
        return info;
    }

    function isNewCard(params){
        var data = params.data;
        if(data.card.type == "1"){
            return "是";
        }else{
            return "否";
        }
    }


    var columnDefs = [
        {headerName: "_id", field: "_id", width: 10, hide: true},
        {headerName: "ID", field: "_id", width: 90},
        {headerName: "卡号", field: "code", width: 70},
        {headerName: "密码", field: "passwd", width: 70},
        {headerName: "面值", field: "parValue", width: 40},
        // {headerName: "微信UnionID", field: "mp_unionid", width: 255},
        // {headerName: "微信OpenID", field: "mp_openid", width: 255},
        {headerName: "类型", field: "card.name", width: 50},
        {headerName: "是否新手卡", field: "card.type", width: 70,valueGetter:isNewCard},
        {headerName: "是否已用", field: "status", width: 60,valueGetter:form_status},
        {headerName: "生成时间", field: "crTime", width: 105,valueGetter: $scope.angGridFormatDateS},
        {headerName: "操作", field: "_id", width: 125, cellRenderer: ctrl_render,cellStyle:{'text-align':'center'}}
    ];

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;
            var date = $scope.search.date;
            var startDate = date.startDate || '';
            var endDate = date.endDate || '';
            var status = search.status;
            console.log("token");
            console.log(sso.getToken());

            $http.get(cardUri+'/cardTypes',{
                params:{
                    token:sso.getToken()
                }
            }).success(function (result){
                cardTypeRows = result.rows;
                $scope.typedata = cardTypeRows;

                $http.get(cardUri+'/cards', {
                    params:{
                        token: sso.getToken(),
                        page: page,
                        rows: $scope.pageSize,
                        search: search.type,
                        startDate:startDate.toString(),
                        endDate:endDate.toString(),
                        type:$scope.type,
                        status:status,
                        parValue:$scope.parValue
                    }
                }).success(function(result){
                    console.log('success');
                    var data = result;
                    console.log(result);
                    if(data.err){
                        $scope.error(data.msg);
                    }else{
                        var rowsThisPage = data.rows;
                        var lastRow = data.total;
                        params.successCallback(rowsThisPage, lastRow);
                    }
                }).error(function(msg, code){
                    console.log(2);
                    console.log(msg);
                    $scope.errorTips(code);
                });

            }).error(function (msg,code){
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
            if(cell.data.status =="2"){
                $state.go('app.recharge.cardlog',{code:cell.data.code});
            }
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource
    };

    $scope.delete = function(data){
        var id = data._id;
        if(id){
            $scope.openTips({
                title:'提示',
                content:'是否确认删除?',
                okTitle:'是',
                cancelTitle:'否',
                okCallback: function(){

                    $http.delete(cardUri+'/cards', {
                        params:{
                            token: sso.getToken(),
                            id: id
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
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);
        $scope.gridOptions.api.setDatasource(dataSource);
    };

    $scope.$watch('parValue',function () {
        history.parValue = $scope.parValue;
    });
    $scope.$watch('type',function () {
        history.type = $scope.type;
    });
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });
    $scope.$watch('search', function () {
        history.search = $scope.search;
    });
    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });
}]);

app.controller('RechargeCardLogCtrl', ['$scope', '$state','$stateParams','$http', 'AGGRID', 'global', function ($scope, $state,$stateParams, $http, AGGRID, global) {
    var sso = jm.sdk.sso;
    var history = global.rechargeCardLogHistory||(global.rechargeCardLogHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date||{};
    $scope.dateOptions = global.dateRangeOptions;
    var url = cardUri+'/cards?status=2';

    //先全局定义一个变量cardTypesRows
    var cardTypeRows = [];

    var format_nick = function(params) {
        var obj = params.data.user || {};
        return obj.nick||'';
    };
    var format_b2Recharge = function (params) {
        var obj = params.data.befRecharge || {};
        var btb = obj.tb;
        var amount = format_amount(params);
        return btb+'/'+(btb+amount);

    }
    var format_amount = function (params) {
        var obj = params.data.card || {};
        var attach = obj.attach ||[];
        var amount =0;
        for(var i=0;i<attach.length;i++){
            if(attach[i].prop.code == "tb"){
                amount = amount+attach[i].amount;
            }
        }
        return amount;
    }

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 100, hide: true},
        {headerName: "id", field: "_id", width: 140},
        {headerName:"卡号",field:"code",width:150},
        {headerName:"类型",field:"card.name",width:100},
        {headerName:"面值",field:"parValue",width:100},
        {headerName:"玩家ID",field:"userId",width:140},
        {headerName:"玩家账号",field:"nick",width:180,valueGetter:format_nick},
        {headerName:"IP",field:"userIP",width:200},
        {headerName:"充值时间",field:"useTime",width:200,valueGetter: $scope.angGridFormatDateS},
        {headerName:"充值前/后元宝数",field:"b2Recharge",width:160,valueGetter:format_b2Recharge},
        {headerName:"得到多少元宝",field:"amount",width:160,valueGetter:format_amount}
    ];

    $scope.$state = $state;
    var code = $stateParams.code;
    if(code){
        var dataSource = {
            getRows: function (params) {
                $http.get(cardUri + '/info?code=' + code, {
                    params: {
                        token: sso.getToken(),
                    }
                }).success(function (result) {
                    var obj = [];
                    obj.push(result);
                    if (obj.err) {
                        $scope.error(obj.msg);
                    } else {
                        var rowsThisPage = obj;
                        var lastRow = obj.total;
                        params.successCallback(rowsThisPage, lastRow);
                    }
                }).error(function (msg, code) {
                    $scope.errorTips(code);
                });
            }
        };
    }else {

        var dataSource = {
            getRows: function (params) {
                var search = $scope.search;
                var date = search.date;
                var starDate = date.startDate || '';
                var endDate = date.endDate || '';
                var type = search.type;
                var state = search.state;
                var page = params.startRow / $scope.pageSize + 1;
                var keyword = search.keyword;

                $http.get(cardUri+'/cardTypes',{
                    params:{
                        token:sso.getToken()
                    }
                }).success(function (result){
                    cardTypeRows = result.rows;
                    $scope.typedata = cardTypeRows;

                    $http.get(url, {
                        params: {
                            token: sso.getToken(),
                            page: page,
                            rows: $scope.pageSize,
                            startDate: starDate.toString(),
                            endDate: endDate.toString(),
                            type: type,
                            state: state,
                            keyword: keyword
                        }
                    }).success(function (result) {
                        console.log(result);
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

                }).error(function (msg,code){
                    $scope.errorTips(code);
                });
            }
        };
    };

    $scope.gridOptions = {
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
    $scope.$watch('startDate', function () {
        history.startDate = $scope.startDate;
    });
    $scope.$watch('endDate', function () {
        history.endDate = $scope.endDate;
    });
}]);


app.controller('RechargeThirdCtrl', ['$scope', '$state', '$http', 'AGGRID', 'global', function ($scope, $state, $http, AGGRID, global) {
    var sso = jm.sdk.sso;
    global.rechargeListHistory || (global.rechargeListHistory = {});
    var history = global.rechargeListHistory;
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||{};
    $scope.search.date = $scope.search.date || {};
    $scope.stat = {};

    $scope.dateOptions = global.dateRangeOptions;

    var format_suid = function(params) {
        var obj = params.data.pay || {};
        var bill = obj.bill || {};
        var info = '未知';
        if(obj.channel=='pingxx') info = bill.id;
        if(obj.channel=='swiftpass') info = bill.transaction_id;
        if(obj.channel=='alipay') info = bill.trade_no;

        return info||'';
    };

    var format_channel = function(params) {
        var obj = params.data.pay || {};
        return obj.channel||'';
    };

    var format_uid = function(params) {
        var obj = params.data.user || {};
        return obj.uid||'';
    };

    var format_nick = function(params) {
        var obj = params.data.user || {};
        return obj.nick||'';
    };

    var format_amount = function(params) {
        var obj = params.data || {};
        var amount = obj.amount || 0;
        return amount*0.01;
    };

    var format_cstatus = function(params) {
        var obj = params.data.pay || {};
        if(obj.status==undefined) return '';
        var info = '未付';
        if(obj.status) info = '已付';
        return info;
    };

    var format_status = function(params) {
        var status = params.data.status;
        var info = '不成功';
        if(status) info = '成功';
        return info;
    };

    var format_b2amount = function(params) {
        var status = params.data.status;
        var obj = params.data.content || {};
        var balance = obj.balance || 0;
        var amount = obj.amount || 0;
        if(!status) amount = 0;
        return balance+'/'+(balance+amount);
    };

    var format_tbamount = function(params) {
        var obj = params.data.content || {};
        return obj.amount || 0;
    };

    var columnDefs = [
        {headerName: "订单编号", field: "code", width: 200},
        {headerName: "第三方订单号", field: "suid", width: 200, valueGetter: format_suid},
        {headerName: "支付渠道", field: "channel", width: 100, valueGetter: format_channel},
        {headerName: "玩家ID", field: "uid", width: 100, valueGetter: format_uid},
        {headerName: "玩家昵称", field: "nick", width: 150, valueGetter: format_nick},
        {headerName: "支付金额", field: "amount", width: 90, valueGetter: format_amount},
        {headerName: "支付状态", field: "cstatus", width: 100, valueGetter: format_cstatus},
        {headerName: "充值状态", field: "status", width: 100, valueGetter: format_status},
        {headerName: "充值前/后元宝数", field: "b2amount", width: 200, valueGetter: format_b2amount, cellStyle:{'text-align':'center'}},
        {headerName: "充值元宝数", field: "tbamount", width: 110, valueGetter: format_tbamount},
        {headerName: "支付时间", field: "crtime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "到账时间", field: "moditime", width: 145, valueGetter: $scope.angGridFormatDateS}
    ];

    var dataSource = {
        getRows: function (params) {
            var search = $scope.search;
            var date = search.date;
            var startDate = date.startDate || "";
            var endDate = date.endDate || "";
            var keyword = search.keyword;
            var status = search.status;

            var page = params.startRow / $scope.pageSize + 1;
            $http.get(homeUri+'/orders', {
                params: {
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    search: keyword,
                    currency:'cny',
                    status:status,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            }).success(function (result) {
                console.log(result);
                var data = result;
                if (data.err) {
                    $scope.error(data.msg);
                } else {
                    data.rows = data.rows || [];
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function(msg, code){
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
        rowHeight: 30,
        columnDefs: columnDefs,
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource
    };

    //改变表格行数
    $scope.onPageSizeChanged = function() {
        $scope.gridOptions.paginationPageSize = Number($scope.pageSize);//需重新负值,不然会以之前的值处理
        $scope.gridOptions.api.setDatasource(dataSource);
    };
    //监听函数变化
    $scope.$watch('pageSize', function () {
        history.pageSize = $scope.pageSize;
    });

    $scope.$watch('search', function () {
        history.search = $scope.search;
    });

    $scope.$watch('search.date', function () {
        $scope.onPageSizeChanged();
    });

    $http.get(statUri+'/multiple', {
        params:{
            token: sso.getToken(),
            fields:{recharge_people_total:1,recharge_people_yesterday:1,recharge_people_today:1,recharge_total:1,recharge_yesterday:1,recharge_today:1,recharge_order_valid:1,recharge_order_invalid:1}
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.stat = obj||{};
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });
}]);


app.controller('RechargeCardAddCtrl', ['$scope', '$state', '$stateParams', '$http', 'AGGRID', 'global', function ($scope, $state, $stateParams,$http, AGGRID, global) {
    var sso = jm.sdk.sso;
    $scope.card = {};
    $scope.$state = $state;

    var data = $stateParams.data;

    $scope.isEdit = false;
    $scope.card.parValue = '';
    $scope.card.code = '';
    $scope.card.type = "1";
    $scope.card.number = 1;

    $http.get(agentUri + '/agents',{
        params : {
            token:sso.getToken(),
            audit:1,
            fields:{code:1,name:1}
        }
    }).success(function (result) {
        console.log(result);
        $scope.channelData = result.rows;

        if(data){
            $scope.isEdit = true;
            $scope.card.code = data.code;
            $scope.card.parValue = data.parValue;
            $scope.card.type = data.cardtype;
            $scope.card.channel = data.channel;
            $scope.card.number = data.number;
        }
    }).error(function (msg,code){
        $scope.errorTips(code);
    });

    $http.get(cardUri+'/cardTypes',{
        params:{
            token:sso.getToken()
        }
    }).success(function (result){
        $scope.typedata = result.rows;

    }).error(function (msg,code) {
        $scope.errorTips(code);
    });

    $scope.savecard = function (){
        var card = $scope.card;
        var type = card.type;
        var number = card.number || 1;
        var parValue = card.parValue || "1";
        var preCode = card.code || "";
        var channel = card.channel || "";
        console.log("type");
        console.log(type);

        if(data){
            var id = data.id;
            $http.post(cardUri + '/cards/'+id,{
                type:Number(type),
                number:Number(number),
                preCode:preCode,
                parValue:parValue,
                channel:channel
            },{
                params:{
                    token:sso.getToken()
                }
            }).success(function (result){
                console.log(result);
                var obj = result;
                if(obj.err){
                    $scope.error(obj.msg);
                }else{
                    $scope.success(obj.ret || '操作成功');
                    $scope.$state.go('app.recharge.card');
                }
            }).error(function (msg,code) {
                $scope.errorTips(code);
            });
        }else{
            $http.post(cardUri + '/createCards',{
                type:Number(type),
                number:Number(number),
                preCode:preCode,
                parValue:parValue,
                channel:channel
            },{
                params:{
                    token:sso.getToken()
                }
            }).success(function (result){
                console.log("start");
                console.log(result);
                var obj = result;
                if(obj.err){
                    $scope.error(obj.msg);
                }else{
                    $scope.success(obj.ret || '操作成功');
                    $state.go('app.recharge.card.list');
                }
            }).error(function (msg,code) {
                console.log("error");
                $scope.errorTips(code);
            });
        }

    }

}]);

app.controller('RechargeCardTypeCtrl', ['$scope', '$state', '$http', 'AGGRID', 'global', function ($scope, $state, $http, AGGRID, global) {
    var sso = jm.sdk.sso;
    var history = global.rechargeCardTypeHistory||(global.rechargeCardTypeHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search || {};
    $scope.search.type =   $scope.search.type || "";
    $scope.dateOptions=global.dateRangeOptions;


    $scope.goto = function(data){
        var d = {
            id:data._id,
            type:data.type,
            name:data.name,
            attach:data.attach
        };
        $state.go('app.recharge.cardtype.add',{
            data : d
        });

    };


    function ctrl_render(params){
        return '<span class="btn btn-xs bg-primary m-r-xs" ng-click="goto(data)">编辑</span>'+
            '<span class="btn btn-xs bg-danger m-r-xs" ng-click="delete(data)">删除</span>';
    }

    // function form_status(params){
    //     console.log(params);
    //
    // }

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 10, hide: true},
        {headerName: "ID", field: "_id", width: 50},
        {headerName: "类型", field: "name", width: 50},
        {headerName: "操作", field: "_id", width: 125, cellRenderer: ctrl_render,cellStyle:{'text-align':'center'}}
    ];

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            var search = $scope.search;

            $http.get(cardUri+'/cardTypes', {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows;
                    var lastRow = data.total;
                    params.successCallback(rowsThisPage, lastRow);
                }
            }).error(function(msg, code){
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
        localeText: AGGRID.zh_CN,
        datasource: dataSource
    };

    $scope.delete = function(data){
        var id = data._id;
        if(id){
            $scope.openTips({
                title:'提示',
                content:'是否确认删除?',
                okTitle:'是',
                cancelTitle:'否',
                okCallback: function(){

                    $http.delete(cardUri+'/cardTypes', {
                        params:{
                            token: sso.getToken(),
                            id: id
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


app.controller('RechargeCardTypeAddCtrl', ['$scope', '$state','$stateParams', '$http', 'AGGRID', 'global', function ($scope, $state,$stateParams, $http, AGGRID, global) {
    var sso = jm.sdk.sso;
    $scope.cardType = {};
    $scope.isEdit = false;
    var data = $stateParams.data;

    $http.get(propUri+'/props', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.props = obj.rows||[];
            console.log($scope.props);

            if(data){
                $scope.isEdit = true;
                $scope.cardType = data;
            }
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });




    $scope.removeItem = function(index) {
        $scope.cardType.attach.splice(index, 1);
    };

    $scope.addItem = function() {
        if(!$scope.cardType.attach) $scope.cardType.attach = [];
        $scope.cardType.attach.push({amount:1});
    };


    $scope.send = function(){
        console.log($scope.cardType);
        var url = "";
        if(data){
            console.log("data");
            console.log(data);
            url = cardUri + '/cardTypes/'+ data.id;
        }else{
            url = cardUri + '/cardTypes'
        }
        $http.post(url, $scope.cardType, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            console.log("success");
            var obj = result;
            console.log(obj);
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.recharge.cardtype.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
}]);