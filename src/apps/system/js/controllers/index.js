'use strict';
app.controller('SystemCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('system');
}]);