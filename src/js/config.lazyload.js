// lazyload config

angular.module('app')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
      easyPieChart:   [   '../libs/jquery/jquery.easy-pie-chart/dist/jquery.easypiechart.fill.js'],
      sparkline:      [   '../libs/jquery/jquery.sparkline/dist/jquery.sparkline.retina.js'],
      plot:           [   '../libs/jquery/flot/jquery.flot.js',
                          '../libs/jquery/flot/jquery.flot.pie.js', 
                          '../libs/jquery/flot/jquery.flot.resize.js',
                          '../libs/jquery/flot.tooltip/js/jquery.flot.tooltip.min.js',
                          '../libs/jquery/flot.orderbars/js/jquery.flot.orderBars.js',
                          '../libs/jquery/flot-spline/js/jquery.flot.spline.min.js'],
      moment:         [   '../libs/jquery/moment/moment.js'],
      screenfull:     [   '../libs/jquery/screenfull/dist/screenfull.min.js'],
      slimScroll:     [   '../libs/jquery/slimscroll/jquery.slimscroll.min.js'],
      sortable:       [   '../libs/jquery/html5sortable/jquery.sortable.js'],
      nestable:       [   '../libs/jquery/nestable/jquery.nestable.js',
                          '../libs/jquery/nestable/jquery.nestable.css'],
      filestyle:      [   '../libs/jquery/bootstrap-filestyle/src/bootstrap-filestyle.js'],
      slider:         [   '../libs/jquery/bootstrap-slider/bootstrap-slider.js',
                          '../libs/jquery/bootstrap-slider/bootstrap-slider.css'],
      chosen:         [   '../libs/jquery/chosen/chosen.jquery.min.js',
                          '../libs/jquery/chosen/bootstrap-chosen.css'],
      TouchSpin:      [   '../libs/jquery/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js',
                          '../libs/jquery/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
      wysiwyg:        [   '../libs/jquery/bootstrap-wysiwyg/bootstrap-wysiwyg.js',
                          '../libs/jquery/bootstrap-wysiwyg/external/jquery.hotkeys.js'],
      dataTable:      [   '../libs/jquery/datatables/media/js/jquery.dataTables.min.js',
                          '../libs/jquery/plugins/integration/bootstrap/3/dataTables.bootstrap.js',
                          '../libs/jquery/plugins/integration/bootstrap/3/dataTables.bootstrap.css'],
      vectorMap:      [   '../libs/jquery/bower-jvectormap/jquery-jvectormap-1.2.2.min.js', 
                          '../libs/jquery/bower-jvectormap/jquery-jvectormap-world-mill-en.js',
                          '../libs/jquery/bower-jvectormap/jquery-jvectormap-us-aea-en.js',
                          '../libs/jquery/bower-jvectormap/jquery-jvectormap.css'],
      footable:       [   '../libs/jquery/footable/v3/js/footable.min.js',
                          '../libs/jquery/footable/v3/css/footable.bootstrap.min.css'],
      fullcalendar:   [   '../libs/jquery/moment/moment.js',
                          '../libs/jquery/fullcalendar/dist/fullcalendar.min.js',
                          '../libs/jquery/fullcalendar/dist/fullcalendar.css',
                          '../libs/jquery/fullcalendar/dist/fullcalendar.theme.css'],
      daterangepicker:[   '../libs/jquery/moment/moment.js',
                          '../libs/jquery/bootstrap-daterangepicker/daterangepicker.js',
                          '../libs/jquery/bootstrap-daterangepicker/daterangepicker.css'],
      tagsinput:      [   '../libs/jquery/bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
                          '../libs/jquery/bootstrap-tagsinput/dist/bootstrap-tagsinput.css'],
      ueditor:         ['../src/js/directives/ui-ueditor.js'],
      tree: [ '../libs/angular/angular-ui-tree/angular-ui-tree.js' ]

    }
  )
    .constant('AGGRID', {
        zh_CN: {
            // for filter panel
            page: ' ',
            more: ' ',
            to: '-',
            of: '/',
            next: '下一页',
            last: '未尾页',
            first: '首页',
            previous: '上一页',
            loadingOoo: '加载中...',
            // for set filter
            selectAll: '全选',
            searchOoo: '搜索...',
            blanks: '空白',
            // for number filter and string filter
            filterOoo: '过滤...',
            applyFilter: '应用过滤...',
            // for number filter
            equals: '等于',
            lessThan: '小于',
            greaterThan: '大于',
            // for text filter
            contains: '包含',
            startsWith: '开始',
            endsWith: '结束',
            // tool panel
            columns: '列',
            pivotedColumns: '主列',
            pivotedColumnsEmptyMessage: '请将列拖到这里',
            valueColumns: '列值',
            valueColumnsEmptyMessage: '请将列拖到这里',
            //
            noRowsToShow: '无数据'
        }
    })
  .constant('MODULE_CONFIG', [
      {
          name: 'ngGrid',
          files: [
              '../libs/angular/ng-grid/build/ng-grid.min.js',
              '../libs/angular/ng-grid/ng-grid.min.css',
              '../libs/angular/ng-grid/ng-grid.bootstrap.css'
          ]
      },
      {
          name: 'ui.grid',
          files: [
              '../libs/angular/angular-ui-grid/ui-grid.min.js',
              '../libs/angular/angular-ui-grid/ui-grid.min.css',
              '../libs/angular/angular-ui-grid/ui-grid.bootstrap.css'
          ]
      },
      {
          name: 'ui.select',
          files: [
              '../libs/angular/angular-ui-select/dist/select.min.js',
              '../libs/angular/angular-ui-select/dist/select.min.css'
          ]
      },
      {
          name:'angularFileUpload',
          files: [
            '../libs/angular/angular-file-upload/angular-file-upload.js'
          ]
      },
      {
          name:'ui.calendar',
          files: ['../libs/angular/angular-ui-calendar/src/calendar.js']
      },
      {
          name: 'ngImgCrop',
          files: [
              '../libs/angular/ngImgCrop/compile/minified/ng-img-crop.js',
              '../libs/angular/ngImgCrop/compile/minified/ng-img-crop.css'
          ]
      },
      {
          name: 'angularBootstrapNavTree',
          files: [
              '../libs/angular/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
              '../libs/angular/angular-bootstrap-nav-tree/dist/abn_tree.css'
          ]
      },
      {
          name: 'toaster',
          files: [
              '../libs/angular/angularjs-toaster/toaster.js',
              '../libs/angular/angularjs-toaster/toaster.css'
          ]
      },
      {
          name: 'textAngular',
          files: [
              '../libs/angular/textAngular/dist/textAngular-sanitize.min.js',
              '../libs/angular/textAngular/dist/textAngular.min.js'
          ]
      },
      {
          name: 'vr.directives.slider',
          files: [
              '../libs/angular/venturocket-angular-slider/build/angular-slider.min.js',
              '../libs/angular/venturocket-angular-slider/build/angular-slider.css'
          ]
      },
      {
          name: 'com.2fdevs.videogular',
          files: [
              '../libs/angular/videogular/videogular.min.js'
          ]
      },
      {
          name: 'com.2fdevs.videogular.plugins.controls',
          files: [
              '../libs/angular/videogular-controls/controls.min.js'
          ]
      },
      {
          name: 'com.2fdevs.videogular.plugins.buffering',
          files: [
              '../libs/angular/videogular-buffering/buffering.min.js'
          ]
      },
      {
          name: 'com.2fdevs.videogular.plugins.overlayplay',
          files: [
              '../libs/angular/videogular-overlay-play/overlay-play.min.js'
          ]
      },
      {
          name: 'com.2fdevs.videogular.plugins.poster',
          files: [
              '../libs/angular/videogular-poster/poster.min.js'
          ]
      },
      {
          name: 'com.2fdevs.videogular.plugins.imaads',
          files: [
              '../libs/angular/videogular-ima-ads/ima-ads.min.js'
          ]
      },
      {
          name: 'xeditable',
          files: [
              '../libs/angular/angular-xeditable/dist/js/xeditable.min.js',
              '../libs/angular/angular-xeditable/dist/css/xeditable.css'
          ]
      },
      {
          name: 'smart-table',
          files: [
              '../libs/angular/angular-smart-table/dist/smart-table.min.js'
          ]
      },
      {
          name: 'angular-skycons',
          files: [
              '../libs/angular/angular-skycons/angular-skycons.js'
          ]
      },
          {
              name: 'ngTagsInput',
              files: [
                  '../libs/angular/ng-tags-input/ng-tags-input.js',
                  '../libs/angular/ng-tags-input/ng-tags-input.css',
                  '../libs/angular/ng-tags-input/ng-tags-input.bootstrap.css'
              ]
          },
      {
          name: 'ag-grid',
          files: [
              '../libs/angular/ag-grid/dist/ag-grid.js',
              '../libs/angular/ag-grid/dist/styles/ag-grid.css'
          ]
      },
      {
          name: 'localytics.directives',
          files: [
              '../libs/angular/angular-chosen-localytics/dist/angular-chosen.min.js'
          ]
      },
      {
          name: 'treeControl',
          files: [
              '../libs/angular/angular-tree-control/angular-tree-control.js',
              '../libs/angular/angular-tree-control/tree-control.css',
              '../libs/angular/angular-tree-control/tree-control-attribute.css'
          ]
      },
       {
              name: 'ui.bootstrap.datetimepicker',
              files: [
                  '../libs/angular/angular-bootstrap-datetimepicker/datetimepicker.css',
                  '../libs/angular/angular-bootstrap-datetimepicker/css/datetimepicker.css',
                  '../libs/angular/angular-bootstrap-datetimepicker/datetimepicker.js'
              ]
        },
          {
              name: 'dateRangePicker',
              files: [
                  '../libs/angular/angular-daterangepicker/angular-daterangepicker.js'
              ]
        }
]
  )
    .provider('lazyLoad', ['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        var JQ_CONFIG = {};
        var MODULE_CONFIG = {};
        var load = function(srcs, callback) {
            return {
                deps: ['$ocLazyLoad', '$q',
                    function( $ocLazyLoad, $q ){
                        var deferred = $q.defer();
                        var promise  = false;
                        srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                        if(!promise){
                            promise = deferred.promise;
                        }
                        angular.forEach(srcs, function(src) {
                            promise = promise.then( function(){
                                if(JQ_CONFIG[src]){
                                    return $ocLazyLoad.load(JQ_CONFIG[src]);
                                }
                                name = src;
                                return $ocLazyLoad.load(name);
                            } );
                        });

                        deferred.resolve();
                        return callback ? promise.then(function(){ return callback(); }) : promise;
                    }]
            }
        };
        return {
            configJQ: function(opts) {
                opts || (opts={});
                for(var key in opts) {
                    JQ_CONFIG[key] = opts[key];
                }
            },

            configModule: function(opts) {
                opts || (opts={});
                var v = [];
                for(var key in opts) {
                    MODULE_CONFIG[key] = opts[key];
                    v.push({
                        name: key,
                        files: opts[key]
                    });
                }
                $ocLazyLoadProvider.config({
                    debug:  false,
                    events: true,
                    modules: v
                });
            },

            load: load,

            $get: function () {
                return {
                    load: load
                }
            }
        }
    }])
    .config(['lazyLoadProvider', 'JQ_CONFIG', 'MODULE_CONFIG', function (lazyLoadProvider, JQ_CONFIG, MODULE_CONFIG) {
        lazyLoadProvider.configJQ(JQ_CONFIG);
        //lazyLoadProvider.configModule(MODULE_CONFIG);
        lazyLoadProvider.configModule(
            {
                'ngTagsInput': [
                    '../libs/angular/ng-tags-input/ng-tags-input.js',
                    '../libs/angular/ng-tags-input/ng-tags-input.css',
                    '../libs/angular/ng-tags-input/ng-tags-input.bootstrap.css'
                ],
                'treeControl': [
                    '../libs/angular/angular-tree-control/angular-tree-control.js',
                    '../libs/angular/angular-tree-control/tree-control.css',
                    '../libs/angular/angular-tree-control/tree-control-attribute.css'
                ]
            }
        );

    }])
;
