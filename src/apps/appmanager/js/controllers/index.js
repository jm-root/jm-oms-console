'use strict';
app.controller('AppManagerCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('appmanager');
}]);