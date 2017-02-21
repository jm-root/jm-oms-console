'use strict';

app.controller('DashboardCtrl', ['$scope', '$translate', '$translatePartialLoader',  '$state', '$http', '$interval', 'global', function ( $scope, $translate, $translatePartialLoader,$state, $http, $interval,  global ) {
    var sso=jm.sdk.sso;
    $scope.search = {};
    $scope.search.date || ($scope.search.date = {});

    $scope.search.date = {
        startDate: moment().subtract(7, 'days'),
        endDate: moment()
    };
    $scope.stat = {};

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    $scope.url = 'http://'+$scope.host+'/index.html';
    $scope.promote = uploadUri+'/qrcode?info='+$scope.url;

    $http.get(packUri + "/client", {
        params: {
            token: sso.getToken()
        }
    }).success(function (result) {
        if (result.err) {
            $scope.error(result.msg);
        } else {
            result = result || {};
            $scope.android_Path = staticHost + result.androidPath
        }
    }).error(function (msg, code) {
        $scope.errorTips(code);
    });

    $scope.download = function(){
        if($scope.android_Path) window.location.href = $scope.android_Path;
    };

    global.getLocalUser().then(function(user){
        $http.get(agentUri + '/agents/'+user.id, {
            params: {
                token: sso.getToken()
            }
        }).success(function (result) {
            if (result.err) {
                $scope.error(result.msg);
            } else {
                result = result || {};
                var code = result.code;
                var level = result.level;
                if(code&&level==2){
                    $scope.url = 'http://'+$scope.host+'/agent.html?agent='+code;
                    $scope.promote = uploadUri+'/qrcode?info='+$scope.url;
                }
            }
        }).error(function (msg, code) {
            $scope.errorTips(code);
        });
    });

    var reqStat = function(){
        $http.get(statUri+'/multiple', {
            params:{
                token: sso.getToken(),
                fields:{user_total:1,user_yesterday:1,user_today:1,user_guest:1,user_mobile:1,user_wechat:1,user_qq:1,
                    recharge_total:1,recharge_yesterday:1,recharge_today:1,recharge_order_total:1,recharge_order_valid:1,recharge_order_invalid:1}
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.stat = obj||{};
            }
        }).error(function(msg, code){

            $scope.errorTips(code);
        });
    };

    reqStat();
    /*     data.t = $interval(function(){
     reqStat();
     }, 5000);
     */
    var orders = [
        {key:'register',name:'注册人数'},
        {key:'login',name:'登录人数'},
        {key:'arpu',name:'ARPU'},
        {key:'recharge_p',name:'充值人数'},
        {key:'recharge',name:'充值数'},
        {key:'arppu',name:'ARPPU'}
    ];

    $scope.lineOptions = [];

    $scope.getData = function(){
        var search = $scope.search;
        var date = search.date;
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";

        $http.get(statUri+'/report/account', {
            params:{
                token: sso.getToken(),
                rows: 7,
                startDate: startDate.toString(),
                endDate: endDate.toString()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.stats = result.rows||[];
                var statMap = {
                    register:{x:[],y:[],max:0},
                    login:{x:[],y:[],max:0},
                    recharge_p:{x:[],y:[],max:0},
                    recharge:{x:[],y:[],max:0},
                    arpu:{x:[],y:[],max:0},
                    arppu:{x:[],y:[],max:0}
                };
                $scope.lineOptions = [];
                _.forEachRight($scope.stats, function(item) {
                    var date = moment(item.date).format('MM-DD');
                    statMap.register.x.push(date);
                    statMap.login.x.push(date);
                    statMap.recharge_p.x.push(date);
                    statMap.recharge.x.push(date);
                    statMap.arpu.x.push(date);
                    statMap.arppu.x.push(date);

                    var arpu = item.login?Math.round(item.recharge/item.login):0;
                    var arppu = item.recharge_p?Math.round(item.recharge/item.recharge_p):0;
                    statMap.register.y.push(item.register);
                    statMap.login.y.push(item.login);
                    statMap.recharge_p.y.push(item.recharge_p);
                    statMap.recharge.y.push(item.recharge);
                    statMap.arpu.y.push(arpu);
                    statMap.arppu.y.push(arppu);

                    statMap.register.max<item.register && (statMap.register.max=item.register);
                    statMap.login.max<item.login && (statMap.login.max=item.login);
                    statMap.recharge_p.max<item.recharge_p && (statMap.recharge_p.max=item.recharge_p);
                    statMap.recharge.max<item.recharge && (statMap.recharge.max=item.recharge);
                    statMap.arpu.max<arpu && (statMap.arpu.max=arpu);
                    statMap.arppu.max<arppu && (statMap.arppu.max=arppu);
                });
                orders.forEach(function(item){
                    var o = statMap[item.key];
                    var opts = {
                        name: item.name,
                        x: o.x,
                        y: o.y,
                        max: o.max
                    };
                    $scope.lineOptions.push(getLineOption(opts));
                });
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    // function onClick(params){
    //     console.log(params);
    // };

    $scope.lineConfig = {
        theme:'default',
        // event: [{click:onClick}],
        dataLoaded:true
    };


    var colors = ['#5793f3', '#d14a61', '#675bba'];

    var getLineOption = function(otps){
        otps || (otps={});
        otps.max || (otps.max=100);
        if(otps.max<10) otps.max = 10;
        var max = Math.round(otps.max*1.2);
        var step = Math.round(max/6);
        return {
            color: colors,
            tooltip: {
                trigger: 'axis'
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            legend: {
                data:[otps.name],
                x:'left'
            },
            xAxis: [
                {
                    type: 'category',
                    data: otps.x||[]
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: otps.name,
                    min: 0,
                    max: max,
                    interval: step,
                    axisLine: {
                        lineStyle: {
                            color: colors[0]
                        }
                    }
                }
            ],
            series: [
                {
                    name: otps.name,
                    type:'bar',
                    data:otps.y||[]
                }
            ]
        }
    };

    $scope.$watch('search.date', function () {
        $scope.getData();
    });
}]);


