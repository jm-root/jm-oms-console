/**
 * Created by Administrator on 2017/2/13.
 */
'use strict';
app.controller('AgentCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('agent');
}]);