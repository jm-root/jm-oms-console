'use strict';

app.controller('AppCtrl', ['$scope', '$translate', '$translatePartialLoader', function ($scope, $translate, $translatePartialLoader) {
    $translatePartialLoader.addPart('main');
}]);

