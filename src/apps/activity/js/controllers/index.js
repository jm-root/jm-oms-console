'use strict';
app.controller('ActivityCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('activity');
}]);
