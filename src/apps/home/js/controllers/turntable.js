/**
 * Created by Admin on 2016/6/13.
 */
'use strict'
var sso = jm.sdk.sso;
app.controller('HomeTurntableCtrl', ['$scope', '$state', '$http', '$timeout', 'global', function ($scope, $state, $http, $timeout, global) {
    var url = activityUri+'/items';

    $scope.activity = {};

    $scope.refresh = function(){
        $http.get(url, {
            params: {
                token: sso.getToken(),
                activity: 'turntable'
            }
        }).success(function (result) {
            var data = result;
            if (data.err) {
                $scope.error(data.msg);
            } else {
                var rows = data.rows || [];
                rows.forEach(function(item){
                    item.p_amount = item.props[0].amount;
                });
                $scope.gridOptions.api.setRowData(rows);
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.refresh();


    $http.get(activityUri+'/activities', {
        params:{
            token: sso.getToken(),
            code: 'turntable',
            fields: {status:1}
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            var rows = obj.rows||[];
            $scope.activity = rows[0]||{};
            $scope.onoff = !!($scope.activity.status==1);
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $http.get(propUri+'/props', {
        params:{
            token: sso.getToken(),
            fields: {name:1}
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.props = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    function render_p_name(params){
        var props = params.data.props||[];
        var prop = props[0]||{};
        return '<select style="width: 100%" ng-model="data.props[0].prop" ng-options="option._id as option.name for option in props" ng-change="changedProp(data,data.props[0].prop)">'+
            '</select>'
    }
    $scope.changedProp = function(data,val){
        $scope.updateData(data);
    };

    var columnDefs = [
        {headerName: "ID", field: "order", width: 60, editable: true},
        {headerName: "奖项", field: "title", width: 140, editable: true},
        {headerName: "奖品", field: "p_name", width: 140, editable: true, cellRenderer: render_p_name},
        {headerName: "数量", field: "p_amount", width: 90, editable: true},
        {headerName: "机率", field: "amount", width: 90, editable: true}
    ];

    var oldVal,newVal;

    $scope.gridOptions = {
        // paginationPageSize: Number($scope.pageSize),
        // rowModelType:'pagination',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        angularCompileRows: true,
        rowSelection: 'single',
        rowHeight: 30,
        columnDefs: columnDefs,
        localeText: global.agGrid.localeText,
        rowData: [],
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){

        },
        onCellEditingStarted: function (event) {
            oldVal = event.value;
        },
        onCellEditingStopped: function (event) {
            newVal = event.value;
            if(oldVal!=newVal){
                event.data.props[0].amount = event.data.p_amount;
                $scope.updateData(event.data);
            }
        }
    };

    $scope.updateData = function(data){
        var o = {
            _id:data._id,
            title:data.title,
            amount:data.amount,
            props:data.props,
            order:data.order
        };
        $http.post(url+'/save', o, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var count = 0;
    $scope.$watch('onoff', function () {
        count++;
        if(count<=2){
            return ;
        }

        var old = $scope.onoff;
        var id = $scope.activity._id;
        if(!id) return;
        $http.post(activityUri+'/activities/'+id, {status:$scope.onoff}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.onoff = old;
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
            $scope.onoff = old;
        });
    });

}]);
