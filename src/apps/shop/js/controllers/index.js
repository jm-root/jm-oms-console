'use strict';
app.controller('ShopCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('shop');
}]);
