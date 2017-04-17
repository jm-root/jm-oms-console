'use strict';
app.controller('DataStatisticsCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('datastatistics');
}]);

