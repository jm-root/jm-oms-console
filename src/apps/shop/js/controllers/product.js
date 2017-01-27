/**
 * Created by Admin on 2016/5/19.
 */
'use strict';
var sso = jm.sdk.sso;
app.controller('ProdListCtrl', ['$scope', '$state', '$http','AGGRID', 'global', function ($scope, $state, $http,AGGRID, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "产品名称", field: "name", width: 120},
        {headerName: "分类编码", field: "category.code", width: 120},
        {headerName: "分类名称", field: "category.name", width: 120},
        {headerName: "产品描述", field: "description", width: 120},
        {headerName: "产品价格", field: "price", width: 120},
        {headerName: "产品图片", field: "pic", width: 120},
        {headerName: "产品标签", field: "tags", width: 120},
        {headerName: "产品库存", field: "inventory", width: 120},
        {headerName: "产品状态", field: "status", width: 120, valueGetter: $scope.angGridFormatStatus},
        {headerName: "前端是否可见", field: "visible", width: 120},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS},

        {headerName: "#", width: 200, cellRenderer: create_lottery, cellStyle:{'text-align':'center'}},
        {headerName: "#", width: 70, cellRenderer: create_goods, cellStyle:{'text-align':'center'}}
    ];

    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="goCheck(\''+params+'\')">查看</button>';
    }
    
    function create_lottery(params) {
        var str = "";
        if(params.data.status == 1){
            str = '<button class="btn btn-xs bg-primary" ng-click="goCreateLottery(\''+params.data._id+'\')">新建活动</button> ';
        }
        str += '<button class="btn btn-xs bg-primary" ng-click="goCheckLottery(\''+params.data._id+'\')">查看活动</button>';
        return str;
    }

    function create_goods(params) {
        if(params.data.type != 1){
            return '<button class="btn btn-xs bg-primary" ng-click="goCheckOrders(\''+params.data._id+'\')">查看订单</button>';
        }
        return '';
    }

    $scope.goCheckLottery = function(id){
        $state.go('app.shop.lottery.list' , {productId: id});
    };

    $scope.goCreateLottery = function(id){
        $state.go('app.shop.lottery.edit' , {productId: id});
    };

    $scope.goCheckOrders = function(id){
        $state.go('app.shop.order.list' , {productId: id});
    };

    var dataSource = {
        getRows: function (params) {
            var page = params.startRow / $scope.pageSize + 1;
            $http.get(shopUri+'/products', {
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
        rowStyle:{'-webkit-user-select':'text','-moz-user-select':'text','-o-user-select':'text','user-select': 'text'},
        onGridReady: function(event) {
            event.api.sizeColumnsToFit();
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.shop.product.edit' , {id: cell.data._id});
        },
        localeText: AGGRID.zh_CN,
        datasource: dataSource,
        angularCompileRows: true
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
                    $http.delete(shopUri+'/products', {
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

app.controller('ProdEditCtrl', ['$scope', '$http', '$state', '$stateParams',function($scope, $http, $state, $stateParams) {
    $scope.$state = $state;

    var id = $stateParams.id;
    $scope.id = id;
    $scope.product = {};

    $scope.categories = {};
    $scope.cate = {};

    $http.get(shopUri+'/categories', {
        params:{
            token: sso.getToken(),
            cateLevel: 2
        }
    }).error(function (msg, code) {

        $scope.errorTips(code);

    }).success(function (result) {

        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.categories = result.rows;

            if(id){
                $http.get(shopUri+'/products/'+id, {
                    params:{
                        token: sso.getToken(),
                    }
                }).success(function(result){
                    var obj = result;
                    if(obj.err){
                        $scope.error(obj.msg);
                    }else{
                        $scope.product = obj
                        $scope.product.picture = obj.pic ? sdkHost + obj.pic : "";
                        for(var i=0; i<$scope.categories.length; i++){
                            if($scope.categories[i]._id == obj.category._id){
                                $scope.cate = $scope.categories[i];
                            }
                        }
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }else{
                // $scope.category.name = obj.name;
                // $scope.category.pid = obj.pid;
            }

        }
    });

    $scope.save = function(){

        var url = shopUri  + '/products';
        if(id){
            url += "/" + id;
        }

        $scope.product.category = $scope.cate._id;

        $http.post(url, $scope.product, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $state.go('app.shop.product.list');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    var cropper = {
        cropWidth: 200,
        cropHeight: 200,
        imageSize:160,
        cropType:"square",
        sourceImage: null,
        croppedImage: null
    };

    var bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    $scope.cropper = cropper;
    $scope.bounds = bounds;

    $scope.ok = function () {
        $scope.product.picture = cropper.croppedImage;
        $state.go('^');
    };

    $scope.cancel = function () {
        $state.go('^');
    };

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

}]);
