'use strict';
app.controller('ReportCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('report');
}]);