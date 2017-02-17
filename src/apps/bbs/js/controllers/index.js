'use strict';
app.controller('BbsCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('bbs');
}]);
