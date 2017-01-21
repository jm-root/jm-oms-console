'use strict';
 angular.module('app.global', [])
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
                    "monthNames": ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
                }
            };

            if(!sso.getToken){
                sso.getToken = function(){
                    return jm.sdk.storage.getItem('token');
                }
            }
            self.getUser = function(){
                var deferred = $q.defer();
                sso.getUser({}, function(err, user){
                    if(!user){
                        sso.authError = '账号或密码错误';
                        localStorage.setItem('isWXLogin', false);
                        deferred.reject({err:-1,msg:'用户无效'});
                    }else{
                        self.userInfo = user;
                        deferred.resolve(user);
                    }
                });
                return deferred.promise;
            };

            self.getLocalUser = function(){
                var deferred = $q.defer();
                if(sso.user){
                    deferred.resolve(sso.user);
                }else{
                    self.on('getUser', function(user){
                        deferred.resolve(user);
                    });
                }
                return deferred.promise;
            };

            self.getRoles = function(){
                var deferred = $q.defer();
                $http.get(aclUri+'/userRoles', {
                    params:{
                        token: sso.getToken()
                    }
                }).success(function(result){
                    var obj = result;
                    if(obj.err){
                        deferred.reject(obj);
                    }else{
                        var roles = obj.ret || [];
                        self.roles = roles;
                        if(roles.length){
                            deferred.resolve(roles);
                        }else{
                            var isWXLogin = localStorage.getItem('isWXLogin');
                            sso.authError = isWXLogin=='true' ? '您还不是本站会员' : '您不是本站管理员';
                            deferred.reject({err:-1,msg:'未分配角色'});
                        }
                    }
                }).error(function(msg, code){
                    deferred.reject({code:code});
                });
                return deferred.promise;
            };

            self.getUserPermission = function(resource){
                var deferred = $q.defer();
                $http.get(aclUri+'/user/permissions', {
                    params:{
                        token: sso.getToken(),
                        resource: resource
                    }
                }).success(function(result){
                    if(result.err){
                        deferred.reject(result);
                    }else{
                        var obj = {};
                        for(var key in result){
                            var ary = result[key];
                            var per = {};
                            ary.forEach(function(item){
                                per[item] = 1;
                            });
                            obj[key] = per;
                        }
                        deferred.resolve(obj);
                    }
                }).error(function(msg, code){
                    deferred.reject({code:code});
                });
                return deferred.promise;
            };

        }])
    ;
