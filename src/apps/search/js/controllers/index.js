'use strict';
app.controller('SearchCtrl',['$scope','$state','$translatePartialLoader',function ($scope,$state,$translatePartialLoader) {
    $translatePartialLoader.addPart('common');

    $scope.cancel = function () {
        // $state.back();
        window.history.go( -1 );
        // window.location.reload();//刷新当前页面
    };
}]);