'use strict';

app.controller('DashboardCtrl', ['$scope', '$translate', '$translatePartialLoader', function ($scope, $translate, $translatePartialLoader) {
    $translatePartialLoader.addPart('dashboard');
}]);

