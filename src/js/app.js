'use strict';
angular.module('app', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'ui.load',
    'ui.jq',
    'oc.lazyLoad',
    'pascalprecht.translate',
    'toaster'
])
    .run(
        ['$rootScope', '$state', '$stateParams', '$translate',
            function ($rootScope, $state, $stateParams, $translate) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                    $translate.refresh();
                });
            }
        ]
    )
;
