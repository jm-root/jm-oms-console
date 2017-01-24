'use strict';

(function () {
    angular.module('app')
        .controller('TestCtrl', ['$scope', function($scope) {
            $scope.datePicker = {};
            $scope.datePicker.date = {startDate: Date.now(), endDate: Date.now()};
        }])
    ;
}());
