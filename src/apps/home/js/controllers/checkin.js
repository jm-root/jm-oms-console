/**
 * Created by Admin on 2016/6/13.
 */
'use strict'
var sso = jm.sdk.sso;
app.controller('CheckinCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    console.log("CheckinCtrl");
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 150, hide: true},
        {headerName: "天数", field: "day", width: 80},
        {headerName: "奖励", width: 80, cellRenderer: opr_render, cellStyle:{'text-align':'center'}}
    ];

    function opr_render(params){
        return '<p>'+params.data.rewards[0].amount+'</p>';
    }

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(homeUri + "/rewards", {
                params:{
                    token: sso.getToken(),
                    page: page,
                    rows: $scope.pageSize,
                    keyword: $scope.search
                }
            }).success(function(result){
                var data = result;
                if(data.err){
                    $scope.error(data.msg);
                }else{
                    var rowsThisPage = data.rows || [];
                    var lastRow = data.total||rowsThisPage.length||0;
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
        rowSelection: 'multiple',
        columnDefs: columnDefs,
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.home.checkin.edit' , {id: cell.data._id});
        },
        localeText: global.agGrid.localeText,
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
                    $http.delete(homeUri + "/rewards", {
                        params:{
                            token: sso.getToken(),
                            id: ids
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

}]);

app.controller('CheckinEditCtrl', ['$scope', '$http', '$state', '$stateParams', function($scope, $http, $state, $stateParams) {

    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.category = {};

    if(id){
        $http.get(homeUri+'/rewards/'+id, {
            params:{
                token: sso.getToken(),
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.reward = obj;
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }else{
        $scope.reward = {};
        $scope.reward.rewards = [];
    }

    $scope.save = function(){

        var url = homeUri  + '/rewards';
        if(id){
            url += "/" + id;
        }

        // $scope.reward.rewards[0].ctCode = "jb";
        $http.post(url, $scope.reward, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.home.checkin.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

}]);
