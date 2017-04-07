app.controller('CurrencyCtrl', ['$scope', '$state', '$http','global',function ($scope, $state, $http,global) {
    $scope.currency = {};
    $http.get(adminUri+'/currencys', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.currencys = result.rows;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.selectCurrency = function(currency){
        angular.forEach($scope.currencys, function(currency) {
            currency.selected = false;
        });
        $scope.curCurrency = currency;
        $scope.curCurrency.selected = true;
        $scope.curRate = {from:currency.code};
    };

    $scope.deleteCurrency = function(role){
        $scope.openTips({
            title:'提示',
            content:'是否确认删除当前币种?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                $http.delete(adminUri+'/currencys', {
                    params:{
                        token: sso.getToken(),
                        code: role.code
                    }
                }).success(function(result) {
                    if(result.err){
                        return $scope.error(result.msg);
                    }
                    $scope.currencys = result.rows;
                    $scope.success('操作成功');
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };

    $scope.isCollapsed = true;
    $scope.change = function(id){
        $scope.isCollapsed = !$scope.isCollapsed;
        if($scope.isCollapsed){
            $scope.ebtnname='新增';
        }else{
            $scope.ebtnname='取消';
        }
    };

    $scope.enter = function(){
        $scope.isCollapsed = true;
        $scope.ebtnname='新增';
        $http.post(adminUri+'/currencys', $scope.currency, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.currencys = result.rows;
            $scope.success('操作成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.rates = [];
    $scope.curRate = {};

    $http.get(adminUri+'/rates', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        if(result.err){
            $scope.error(result.msg);
        }else{
            $scope.rates = result.rows;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.selectRate = function(rate){
        angular.forEach($scope.rates, function(rate) {
            rate.selected = false;
        });
        $scope.curRate = rate;
        $scope.curRate.selected = true;
    };

    $scope.add = function(){
        if(!$scope.curRate.from){
            return $scope.error('请选择以什么币种兑换');
        }
        $http.post(adminUri+'/rates', $scope.curRate, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result) {
            if(result.err){
                return $scope.error(result.msg);
            }
            $scope.rates = result.rows;
            $scope.success('操作成功');
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    $scope.deleteRate = function(rate){
        $scope.openTips({
            title:'提示',
            content:'是否确认删除当前兑换比例?',
            okTitle:'是',
            cancelTitle:'否',
            okCallback: function(){
                $http.delete(adminUri+'/rates', {
                    params:{
                        token: sso.getToken(),
                        key: rate.from+':'+rate.to
                    }
                }).success(function(result) {
                    if(result.err){
                        return $scope.error(result.msg);
                    }
                    $scope.rates = result.rows;
                    $scope.success('操作成功');
                }).error(function(msg, code){
                    $scope.errorTips(code);
                });
            }
        });
    };
}]);
