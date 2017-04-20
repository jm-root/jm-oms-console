app.controller('PlayerStatisticsCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};
    var page = 1;

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px',
            border:'1px solid #cccccc'
        }
    }

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    $http.get(agentUri + '/subAgents', {
        params:{
            token: sso.getToken(),
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.channels =obj.rows||[];
            $scope.select = true;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.getdata();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.getdata();
        }
    };
    $scope.getdata = function(_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date||{};
        var startDate = date.startDate || $scope.startDate;
        var endDate = date.endDate|| $scope.endDate;
        var agent = search.agent;
        $http.get(statUri+'/players', {
            params:{
                token: sso.getToken(),
                search: $scope.search.keyword,
                page:page,
                rows:$scope.pageSize||20,
                status:1,
                agent:agent
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.usersInfo = result;
                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.getdata();

    $scope.details = function (key1,key2) {
        $state.go("app.datastatistics.playerdiary",{account:key1,date:JSON.stringify(key2)});
    }

    $scope.$watch('search.date', function () {
        $scope.getdata(1);
    });


}]);

app.controller('PlayerDataCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global,Excel,$timeout) {

    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = {};
    $scope.search.date = $scope.search.date||{};
    var page = 1;

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.startDate = moment().subtract(1, 'months');
    $scope.dateOptions.endDate = moment();
    $scope.dateOptions.opens = 'left';

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px',
            border:'1px solid #cccccc'
        }
    }

    $http.get(agentUri + '/subAgents', {
        params:{
            token: sso.getToken(),
            search:$scope.search.agent
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.channels = obj.rows||[];
            $scope.select = true;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.getdata();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.getdata();
        }
    };

    $scope.getdata = function(_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date||{};
        var startDate = date.startDate || "";
        var endDate = date.endDate|| "";
        var agent =search.agent;
        $http.get(statUri+'/statlist', {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize||20,
                isStat:true,
                type:1,
                startDate:startDate.toString(),
                endDate:endDate.toString(),
                agent:agent,
                rtype:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 0);
                $scope.playerdata = result;

                $scope.playerdata.stat.allget = global.reg($scope.playerdata.stat.pout_jb||0 - $scope.playerdata.stat.pin_jb||0);
                $scope.playerdata.stat.up_jb = global.reg($scope.playerdata.stat.up_jb||0);
                $scope.playerdata.stat.down_jb = global.reg($scope.playerdata.stat.down_jb||0);
                $scope.playerdata.stat.pout_jb = global.reg($scope.playerdata.stat.pout_jb||0);
                $scope.playerdata.stat.pin_jb = global.reg($scope.playerdata.stat.pin_jb||0);

                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.getdata();

    $scope.$watch('search.date', function () {
        $scope.getdata(1);
    });

}]);

app.controller('PlayerDiaryCtrl', ['$scope', '$state', '$http', 'global','$stateParams', function ($scope, $state, $http, global,$stateParams) {

        var sso = jm.sdk.sso;
        var history = global.bankDealHistory||(global.bankDealHistory={});
        $scope.pageSize = history.pageSize||$scope.defaultRows;
        $scope.search = history.search||{};
        $scope.search.date = $scope.search.date || {
                startDate:  moment().subtract(15, 'days'),
                endDate: moment()
            };

        $scope.dateOptions = angular.copy(global.dateRangeOptions);
        $scope.dateOptions.opens = 'left';

        jm.sdk.init({uri: gConfig.sdkHost});
        var bank = jm.sdk.bank;

        var format_ctName = function(params) {
            var ctName = params.data.ctName;
            return ctName || '';
        };

        var format_fromUserId = function(params) {
            return params.data.fromUserId||'';
        };

        var format_fromUser = function(params) {
            return params.data.fromUserName||'';
        };

        var format_toUserId = function(params) {
            return params.data.toUserId||'';
        };

        var format_toUser = function(params) {
            return params.data.toUserName||'';
        };

        var format_type = function(params) {
            var type = params.data.type;
            var info = '未知';
            if(type==0) info = '普通交易';
            if(type==1) info = '转帐交易';
            if(type==2) info = '货币发行';
            if(type==3) info = '货币回收';
            if(type==4) info = '预授权';

            return info;
        };

        var columnDefs = [
            {headerName: "发起方ID", field: "fromUserId", width: 210, valueGetter: format_fromUserId},
            {headerName: "发起方名称", field: "fromUser", width: 100, valueGetter: format_fromUser},
            {headerName: "发起方等级", field: "type",width: 100},        //field: "fromUserGrade"
            {headerName: "发起方操作前金币", field: "type", width: 100},    //fromUserBalance
            {headerName: "操作类型", field: "flag", width: 100},
            {headerName: "操作金额", field: "amount", width: 100},
            {headerName: "交易对象ID", field: "toUserId", width: 70, valueGetter: format_toUserId},
            {headerName: "交易对象名称", field: "toUser", width: 90,valueGetter: format_toUser},
            {headerName: "交易对象等级", field: "type", width: 110},        //toUserGrade
            {headerName: "交易对象交易前金币", field: "type", width: 145},         //toUserBalance
            {headerName: "操作时间", field: "createdAt", width: 145, valueGetter: $scope.angGridFormatDateS}
        ];

        global.agGridTranslateSync($scope, columnDefs, [
            'datastatistics.playerdiary.header.fromUserId',
            'datastatistics.playerdiary.header.fromUser',
            'datastatistics.playerdiary.header.fromLevel',
            'datastatistics.playerdiary.header.fromJb',
            'datastatistics.playerdiary.header.type',
            'datastatistics.playerdiary.header.amount',
            'datastatistics.playerdiary.header.toUserId',
            'datastatistics.playerdiary.header.toUser',
            'datastatistics.playerdiary.header.toLevel',
            'datastatistics.playerdiary.header.toJb',
            'datastatistics.playerdiary.header.createdAt'
        ]);

        var dataSource = {
            getRows: function (params) {
                global.agGridOverlay();
                var search = $scope.search;
                if($stateParams.account){
                    var account = $stateParams.account;
                    var datestr = $stateParams.date||"";
                    var dateobj = JSON.parse(datestr);
                    search.keyword = account;
                    var startDate = dateobj.startDate||"";
                    var endDate = dateobj.endDate||"";
                    console.info(account);
                    console.info(dateobj.startDate);
                    console.info(dateobj.endDate);
                }else {
                    search.keyword = "";
                    var date = search.date;
                    var startDate = date.startDate || "";
                    var endDate = date.endDate || "";
                }

                var page = params.startRow / $scope.pageSize + 1;
                bank.history({
                    page: page,
                    rows: $scope.pageSize,
                    type: search.type,
                    search: search.keyword,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                },function(err,result){
                    var data = result;
                    if (data.err) {
                        $scope.error(data.msg);
                    } else {
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
            rowSelection: 'multiple',
            columnDefs: columnDefs,
            rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
            localeText: global.agGrid.localeText,
            headerCellRenderer: global.agGridHeaderCellRendererFunc,
            onGridReady: function(event) {
                // event.api.sizeColumnsToFit();
            },
            onRowDataChanged: function (cell) {
                global.agGridOverlay();
            },
            onCellDoubleClicked: function(cell){
            },
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
        $scope.$watch('search.date', function () {
            $scope.onPageSizeChanged();
        });

}]);

