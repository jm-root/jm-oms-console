'use strict';
app.controller('SearchCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('common');

    $scope.cancel = function () {
        window.history.go( -1 );
        window.location.reload();//刷新当前页面
    };
}]);