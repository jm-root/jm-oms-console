'use strict';
app.controller('RobotCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('Robot');
}]);