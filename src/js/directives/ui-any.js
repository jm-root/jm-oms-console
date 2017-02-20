angular.module('app')
    .directive('dropDownTable', function () {
        return {
            link: function (scope, element) {
                var isOpen = false;
                element.bind('click', function (event) {
                    if (['input', 'button','i','span'].indexOf(event.target.tagName.toLowerCase()) != -1) return;
                    isOpen = !isOpen;
                    if (isOpen) {
                        element.addClass('open');
                    } else {
                        element.removeClass('open');
                    }
                });

            }
        };
    })
    .directive('whenScrolled', function () {
        return {
            link: function(scope, elm, attr) {
                var raw = elm[0];
                elm.bind('scroll', function () {
                    if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                        scope.$apply(attr.whenScrolled);
                    }
                });
            }
        };
    })
    .directive('draggable', ['$document', function($document) {
        return function(scope, element, attr) {
            var startX = 0, startY = 0, x = 0, y = 0;
            element.css({
                position: 'relative',
                cursor: 'move'
            });

            element.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                startX = event.pageX - x;
                startY = event.pageY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;
                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        };
    }])
    .directive('zoomImg', function () {
        return {
            link: function (scope, element) {
                element.bind('click', function (event) {
                    if (['img'].indexOf(event.target.tagName.toLowerCase())!=-1){
                        window.location.href = event.target.currentSrc;
                    }
                });
            }
        };
    })
    .directive('imgLoad', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var fn = $parse(attrs.imgLoad);
                elem.on('load', function (event) {
                    scope.$apply(function() {
                        fn(scope, { $event: event });
                    });
                });
            }
        };
    }])
    .directive('ngEcharts',[function(){
        return {
            link: function(scope,element,attrs,ctrl){
                function refreshChart(){
                    var theme = (scope.config && scope.config.theme)
                        ? scope.config.theme : 'default';
                    var chart = echarts.init(element[0],theme);
                    if(scope.config && scope.config.dataLoaded === false){
                        chart.showLoading();
                    }

                    if(scope.config && scope.config.dataLoaded){
                        chart.setOption(scope.option);
                        // chart.resize();
                        window.addEventListener("resize",function () {
                            chart.resize();
                        })
                        chart.hideLoading();
                    }

                    if(scope.config && scope.config.event){
                        if(angular.isArray(scope.config.event)){
                            angular.forEach(scope.config.event,function(value,key){
                                for(var e in value){
                                    chart.on(e,value[e]);
                                }
                            });
                        }
                    }
                };

                //自定义参数 - config
                // event 定义事件
                // theme 主题名称
                // dataLoaded 数据是否加载

                scope.$watch(
                    function () { return scope.config; },
                    function (value) {if (value) {refreshChart();}},
                    true
                );

                //图表原生option
                scope.$watch(
                    function () { return scope.option; },
                    function (value) {if (value) {refreshChart();}},
                    true
                );
            },
            scope:{
                option:'=ecOption',
                config:'=ecConfig'
            },
            restrict:'EA'
        }
    }]);