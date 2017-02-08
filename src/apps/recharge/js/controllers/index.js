'use strict';
app.controller('RechargeCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('recharge');
}]);