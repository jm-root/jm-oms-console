/**
 * Created by Admin on 2016/5/19.
 */
'use strict';
var sso = jm.sdk.sso;
app.controller('ProdListCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {
    var history = global.appsListHistory||(global.appsListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = history.search||'';

    var columnDefs = [
        {headerName: "_id", field: "_id", width: 70, hide: true},
        {headerName: "产品名称", field: "name", width: 120},
        // {headerName: "分类编码", field: "category.code", width: 120},
        // {headerName: "分类名称", field: "category.name", width: 120},
        // {headerName: "产品描述", field: "description", width: 120},
        {headerName: "产品类型", cellRenderer: type_render, width: 120, cellStyle:{'text-align':'center'}},
        {headerName: "产品价格", field: "price", width: 120},
        {headerName: "产品图片", field: "pic", width: 300},
        // {headerName: "产品标签", field: "tags", width: 120},
        {headerName: "产品库存", field: "inventory", width: 120},
        {headerName: "产品状态", field: "status", width: 120, valueGetter: $scope.angGridFormatStatus},
        {headerName: "前端是否可见", field: "visible", width: 120},
        {headerName: "创建时间", field: "crTime", width: 145, valueGetter: $scope.angGridFormatDateS},
        {headerName: "修改时间", field: "modiTime", width: 145, valueGetter: $scope.angGridFormatDateS},

        {headerName: "#", width: 200, cellRenderer: create_lottery, cellStyle:{'text-align':'center'}},
        {headerName: "#", width: 100, cellRenderer: create_goods, cellStyle:{'text-align':'center'}}
    ];

    global.agGridTranslateSync($scope,columnDefs,[
        'shop.product.header._id',
        'shop.product.header.name',
        'shop.product.header.type',
        'shop.product.header.price',
        'shop.product.header.pic',
        'shop.product.header.inventory',
        'shop.product.header.status',
        'shop.product.header.visible',
        'shop.product.header.crTime',
        'shop.product.header.modiTime'
    ])

    function opr_render(params){
        return '<button class="btn btn-xs bg-primary" ng-click="goCheck(\''+params+'\')">查看</button>';
    }

    function type_render(params) {
        if(params.data.type == 1){
            return "夺宝";
        }else{
            return "商城";
        }
    }

    function create_lottery(params) {
        var str = "";
        // if(params.data.status == 1){
        //     str = '<button class="btn btn-xs bg-primary" ng-click="goCreateLottery(\''+params.data._id+'\')">新建活动</button> ';
        // }
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
            global.agGridOverlay();

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
            // event.api.sizeColumnsToFit();
        },
        onCellClicked: function(cell){
            var browser = global.browser();
            //判断是否移动端
            if(browser.versions.mobile||browser.versions.android||browser.versions.ios){
                $state.go('app.shop.product.edit' , {id: cell.data._id, type: "product"});
            }
        },
        onCellDoubleClicked: function(cell){
            $state.go('app.shop.product.edit' , {id: cell.data._id, type: "product"});
        },
        localeText: global.agGrid.localeText,
        headerCellRenderer: global.agGridHeaderCellRendererFunc,

        onRowDataChanged: function (cell) {
            global.agGridOverlay();
        },
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
    // $scope.product = {};

    $scope.categories = {};
    // $scope.cate = {};
    var type = $stateParams.type;

    $scope.lottery = {
        period: 1,
        prodNum: 1,
        type: "1",
        currency: "dbj",
        unitPrice: 1,
        sort: 0,
        status: 1
    };

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
                        // for(var i=0; i<$scope.categories.length; i++){
                        //     if($scope.categories[i]._id == obj.category._id){
                        //         $scope.cate = $scope.categories[i];
                        //     }
                        // }
                    }
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }else{
                // $scope.category.name = obj.name;
                // $scope.category.pid = obj.pid;
                $scope.product = {
                    status: 1,
                }

                if((type !== undefined) && (type == 'lottery')){
                    $scope.product.type = 1;
                }else{
                    $scope.product.type = 2;
                }
            }

        }
    });

    $scope.save = function(){

        var url = shopUri  + '/products';
        if(id){
            url += "/" + id;
        }

        // $scope.product.category = $scope.cate._id;
        $scope.product.price = 0;
        $scope.product.inventory = 999999999;
        $scope.product.currency = "dbj";
        $scope.product.type = parseInt($scope.product.type);

        if($scope.product.type == 1){
            $scope.product.visible = 0;
            $scope.product.unitPrice = 0;
        }else{
            if($scope.product.visible){
                $scope.product.visible = parseInt($scope.product.visible);
            }else{
                $scope.product.visible = 1;
            }
        }

        $http.post(url, $scope.product, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                if($scope.product.type == 1 && !id){

                    $scope.lottery.product = obj._id;
                    $scope.lottery.title || ($scope.lottery.title = $scope.product.title);
                    $scope.lottery.summary || ($scope.lottery.summary = $scope.product.summary);
                    $scope.lottery.enable = true;

                    var url = shopUri  + '/lotteries';

                    $http.post(url, $scope.lottery, {
                        params:{
                            token: sso.getToken()
                        }
                    }).success(function(result){
                        var obj = result;
                        if(obj.err){
                            $scope.error(obj.msg);
                        }else{
                            $scope.success('操作成功');
                            $state.go('app.shop.lottery.list');
                        }
                    }).error(function(msg, code){
                        $scope.errorTips(code);
                    });

                }else{
                    $scope.success('操作成功');
                    $state.go('app.shop.product.list');
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.chgAttach = function (attach) {
        if($scope.product.type == 2){
            for(var i=0; i<$scope.props.length; ++i){
                if($scope.props[i]._id == attach){
                    $scope.product.name = $scope.props[i].name;
                    $scope.product.description = $scope.props[i].name;
                    break;
                }
            }
        }
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
