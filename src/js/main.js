'use strict';

/* Controllers */

angular.module('app')
  .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', 'toaster',
    function(              $scope,   $translate,   $localStorage,   $window, toaster ) {
      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      if(isIE){ angular.element($window.document.body).addClass('ie');}
        $scope.sdkHost = sdkHost;
        $scope.staticHost = staticHost;

        $scope.ssoUri = ssoUri;
        $scope.aclUri = aclUri;
        $scope.adminUri = adminUri;
        $scope.appMgrUri = appMgrUri;
        $scope.statUri = statUri;
        $scope.agentUri = agentUri;
        $scope.packUri = packUri;
        $scope.configUri = configUri;
        $scope.staticUri = staticUri;
      if(isSmartDevice( $window ) ){ angular.element($window.document.body).addClass('smart')};
        $scope.defaultRows = '20';
        $scope.listRowsOptions = [{val:'20'},{val:'50'},{val:'100'},{val:'200'},{val:'500'},{val:'1000'}];

        $scope.navs = [{url:'app.main',title:'首页'}];
        $scope.navsPush = function(obj,reset){
            if(reset==undefined) reset = true;
            if(reset) $scope.navs.splice(1);
            $scope.navs.push(obj);
        };
        //angular-Grid全局定义
        $scope.angGridFormatDateS = function (params) {
            var date = params.data[params.colDef.field];
            if(!date) return '';
            return moment(date).format('YYYY-MM-DD HH:mm:ss');
        };
        $scope.angGridFormatDate = function (params) {
            var date = params.data[params.colDef.field];
            if(!date) return '';
            return moment(date).format('YYYY-MM-DD');
        };

        $scope.angGridFormatStatus = function (params) {
            return params.data[params.colDef.field] ? "启用" : "禁用";
        };
      // config
      $scope.app = {
        name: '总后台',
        version: '2.2.0',
        // for chart colors
        color: {
          primary: '#7266ba',
          info:    '#23b7e5',
          success: '#27c24c',
          warning: '#fad733',
          danger:  '#f05050',
          light:   '#e8eff0',
          dark:    '#3a3f51',
          black:   '#1c2b36'
        },
        settings: {
          themeID: 1,
          navbarHeaderColor: 'bg-black',
          navbarCollapseColor: 'bg-white-only',
          asideColor: 'bg-black',
          headerFixed: true,
          asideFixed: true,
          asideFolded: false,
          asideDock: false,
          container: false
        }
      };

      // save settings to local storage
      if ( angular.isDefined($localStorage.settings) ) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function(){
        if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
          // aside dock and fixed must set the header fixed.
          $scope.app.settings.headerFixed = true;
        }
        // for box layout, add background image
        $scope.app.settings.container ? angular.element('html').addClass('bg') : angular.element('html').removeClass('bg');
        // save to local storage
        $localStorage.settings = $scope.app.settings;
      }, true);

      // angular translate
      $scope.lang = { isopen: false };
      $scope.langs = {zh_CN: '中文', en: 'English'};
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || '中文';
      $scope.setLang = function(langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      function isSmartDevice( $window )
      {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

        //toaster全局定义
        $scope.error = function(title, body){
            toaster.pop('error', title, body);
        };

        $scope.info = function(title, body){
            toaster.pop('info', title, body);
        };

        $scope.success = function(title, body){
            toaster.pop('success', title, body);
        };

        $scope.warning = function(title, body){
            toaster.pop('warning', title, body);
        };

        $scope.errorTips = function(code){
            if(code==401){
                $scope.error('未登录');
            }else if(code==403){
                $scope.error('没有操作权限');
            }else if(code==404){
                $scope.error('请求路径失败');
            }else{
                $scope.error('网络故障');
            }
        };
        window.onresize=function(){
            $scope.app.navHeight = window.innerHeight-50;
        };

        $scope.openTips = function (opts) {
            opts = opts || {};
            opts.title = opts.title || '提示';
            opts.content = opts.content || '';
            opts.cancelTitle = opts.cancelTitle || '取消';
            opts.cancelCallback = opts.cancelCallback || function(){};
            opts.okTitle = opts.okTitle || '确定';
            opts.okCallback = opts.okCallback || function(){};
            opts.singleButton = opts.singleButton || false;

            var modalInstance = $modal.open({
                template: '<div class="modal-header">'+
                '<h3 class="modal-title">'+opts.title+'</h3>'+
                '</div>'+
                '<div class="modal-body">'+opts.content+'</div>'+
                '<div class="modal-footer">'+
                '<button class="btn btn-default" ng-click="cancel()">'+opts.cancelTitle+'</button>'+
                '<button class="btn btn-primary" ng-click="ok()" ng-hide="'+opts.singleButton+'">'+opts.okTitle+'</button>'+
                '</div>',
                controller: 'ModalInstanceCtrl',
                size: opts.size,
                resolve: {
                    tipsOpts: function () {
                        return opts;
                    }
                }
            });

            modalInstance.result.then(function ($s) {
                opts.okCallback($s);
            }, function () {
                opts.cancelCallback();
            });
        };

    }])
    .controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', function($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close($scope);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
  }]);
