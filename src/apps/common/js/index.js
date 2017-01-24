'use strict';
angular.module('app')
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
    .config(['lazyLoadProvider', function (lazyLoadProvider) {
        lazyLoadProvider.configJQ({
            'lodash': ['../libs/jquery/lodash/dist/lodash.js'],
            'ueditor': ['../src/js/directives/ui-ueditor.js']
        });
        lazyLoadProvider.configModule({
            'ngTagsInput': [
                '../libs/angular/ng-tags-input/ng-tags-input.js',
                '../libs/angular/ng-tags-input/ng-tags-input.css',
                '../libs/angular/ng-tags-input/ng-tags-input.bootstrap.css'
            ],
            'localytics.directives': [
                '../libs/angular/angular-chosen-localytics/dist/angular-chosen.min.js'
            ],
            'treeControl': [
                '../libs/angular/angular-tree-control/angular-tree-control.js',
                '../libs/angular/angular-tree-control/tree-control.css',
                '../libs/angular/angular-tree-control/tree-control-attribute.css'
            ],
            'ui.bootstrap.datetimepicker': [
                '../libs/angular/angular-bootstrap-datetimepicker/datetimepicker.css',
                '../libs/angular/angular-bootstrap-datetimepicker/css/datetimepicker.css',
                '../libs/angular/angular-bootstrap-datetimepicker/datetimepicker.js'
            ],
            'dateRangePicker': [
                '../libs/angular/angular-daterangepicker/angular-daterangepicker.js'
            ],
            'tree': ['../libs/angular/angular-ui-tree/angular-ui-tree.js']
        });
    }])
    .service('global', ['$document', '$q', '$http', '$state', function ($document, $q, $http, $state) {
        var self = this;
        jm.enableEvent(self);
        var sso = jm.sdk.sso;
        self.ready = false;
        self.userInfo = {};
        self.roles = [];

        self.usersListHistory = {};
        self.agentListHistory = {};
        self.configListHistory = {};
        self.coinStockOrderHistory = {};
        self.coinStockListHistory = {};
        self.coinDistributeBatchHistory = {};
        self.agentDataRegisterHistory = {};
        self.agentDataRechargeHistory = {};
        self.bankAccountHistory = {};
        self.bankPreauthHistory = {};
        self.bankDealHistory = {};
        self.appsListHistory = {};
        self.homeActivityHistory = {};
        self.homeBBSForumListHistory = {};
        self.homeBBSTopicListHistory = {};
        self.packageAgentHistory = {};
        self.coinAccountListHistory = {};
        self.coinRecordAgentStatHistory = {};
        self.coinRecordLogsHistory = {};
        self.activityPropHistory = {};
        self.activityForumListHistory = {};
        self.activityAtyListHistory = {};
        self.activityAtyItemListHistory = {};
        self.accountPayListHistory = {};
        self.playerListHistory = {};
        self.playerGamesListHistory = {};
        self.playerGiveLogHistory = {};
        self.playerOnlineHistory = {};
        self.rechargeCardHistory = {};
        self.rechargeCardLogHistory = {};
        self.rechargeListHistory = {};
        self.rechargeCardTypeHistory = {};

        self.dateRangeOptions = {
            "autoApply": true,
            "showDropdowns": true,
            "locale": {
                "format": "YYYY/MM/DD",
                "separator": " - ",
                "applyLabel": "应用",
                "cancelLabel": "取消",
                "fromLabel": "从",
                "toLabel": "到",
                "customRangeLabel": "Custom",
                "daysOfWeek": ["日", "一", "二", "三", "四", "五", "六"],
                "monthNames": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
            }
        };

        if (!sso.getToken) {
            sso.getToken = function () {
                return jm.sdk.storage.getItem('token');
            }
        }
        self.getUser = function () {
            var deferred = $q.defer();
            sso.getUser({}, function (err, user) {
                if (!user) {
                    sso.authError = '账号或密码错误';
                    localStorage.setItem('isWXLogin', false);
                    deferred.reject({err: -1, msg: '用户无效'});
                } else {
                    self.userInfo = user;
                    deferred.resolve(user);
                }
            });
            return deferred.promise;
        };

        self.getLocalUser = function () {
            var deferred = $q.defer();
            if (sso.user) {
                deferred.resolve(sso.user);
            } else {
                self.on('getUser', function (user) {
                    deferred.resolve(user);
                });
            }
            return deferred.promise;
        };

        self.getRoles = function () {
            var deferred = $q.defer();
            $http.get(aclUri + '/userRoles', {
                params: {
                    token: sso.getToken()
                }
            }).success(function (result) {
                var obj = result;
                if (obj.err) {
                    deferred.reject(obj);
                } else {
                    var roles = obj.ret || [];
                    self.roles = roles;
                    if (roles.length) {
                        deferred.resolve(roles);
                    } else {
                        var isWXLogin = localStorage.getItem('isWXLogin');
                        sso.authError = isWXLogin == 'true' ? '您还不是本站会员' : '您不是本站管理员';
                        deferred.reject({err: -1, msg: '未分配角色'});
                    }
                }
            }).error(function (msg, code) {
                deferred.reject({code: code});
            });
            return deferred.promise;
        };

        self.getUserPermission = function (resource) {
            var deferred = $q.defer();
            $http.get(aclUri + '/user/permissions', {
                params: {
                    token: sso.getToken(),
                    resource: resource
                }
            }).success(function (result) {
                if (result.err) {
                    deferred.reject(result);
                } else {
                    var obj = {};
                    for (var key in result) {
                        var ary = result[key];
                        var per = {};
                        ary.forEach(function (item) {
                            per[item] = 1;
                        });
                        obj[key] = per;
                    }
                    deferred.resolve(obj);
                }
            }).error(function (msg, code) {
                deferred.reject({code: code});
            });
            return deferred.promise;
        };

    }])
    .service('common', ['$rootScope', '$http', '$window', function ($rootScope, $http, $window) {
        var self = this;
        jm.enableEvent(self);

        self.isIE = function () {
            return !!navigator.userAgent.match(/MSIE/i);
        };

        self.isSmartDevice = function () {
            // Adapted from http://www.detectmobilebrowsers.com
            var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        };

        self.location2info = function (location, cb) {
            var url = 'http://api.map.baidu.com/geocoder/v2/?ak=C6MDDbngC73PDlo6ifrzISzG&callback=?&location=' + location.latitude + ',' + location.longitude + '&output=json&pois=0';
            $.getJSON(url, function (res) {
                var province = res.result.addressComponent.province.replace('省', '');
                var city = res.result.addressComponent.city.replace('市', '');
                return cb({
                    province: province,
                    city: city
                });
                //addressComponent => {city: "广州市", district: "天河区", province: "广东省", street: "广州大道", street_number: "中922号-之101-128"}
            });
        };

        self.getLocationInfo = function (cb) {
            if (self.getLocation) {
                return self.getLocation(null, function (location) {
                    self.location2info(location, cb);
                })
            }
            if (remote_ip_info && remote_ip_info.ret == '1') {
                return cb({
                    province: remote_ip_info.province,
                    city: remote_ip_info.city
                });
            }
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        return self.location2info(position.coords, cb);
                    },
                    cb
                );
                return;
            }
        };

    }])
;
