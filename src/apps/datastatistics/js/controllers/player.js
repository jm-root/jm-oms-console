app.controller('PlayerStatisticsCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};
    var page = 1;
    var urlget = statUri+'/players';


    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px',
            border:'1px solid #cccccc'
        }
    }

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.opens = 'left';

    $http.get(agentUri + '/subAgents', {
        params:{
            token: sso.getToken(),
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.apps =obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.getdata();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.getdata();
        }
    };
    $scope.getdata = function(_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date||{};
        var startDate = date.startDate || $scope.startDate;
        var endDate = date.endDate|| $scope.endDate;
        var agent = search.agent;

        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                search: $scope.search.keyword,
                page:page,
                rows:$scope.pageSize||20,
                status:1,
                agent:agent
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.usersInfo = result;
                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.getdata();

    $scope.details = function (key) {

    }

    $scope.$watch('search.date', function () {
        $scope.getdata(1);
    });


}]);

app.controller('PlayerDataCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = {};
    $scope.startDate = moment(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 15));
    $scope.endDate = moment(new Date());

    $scope.search.date = $scope.search.date || {
            startDate:$scope.startDate,
            endDate:$scope.endDate
        };
    var page = 1;
    var urlget = statUri+'/report/account';

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.startDate = $scope.startDate.format('YYYY/MM/DD');
    $scope.dateOptions.endDate = $scope.endDate.format('YYYY/MM/DD');
    $scope.dateOptions.opens = 'left';

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px',
            border:'1px solid #cccccc'
        }
    }

    $http.get(agentUri + '/subAgents', {
        params:{
            token: sso.getToken(),
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.channels = obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.getdata();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.getdata();
        }
    };

    $scope.getdata = function(_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        var search = $scope.search;
        var date = search.date||{};
        var startDate = date.startDate || $scope.startDate;
        var endDate = date.endDate|| $scope.endDate;
        var agent = search.agent;
        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize||20,
                isStat:true,
                type:0,
                startDate:startDate.toString(),
                endDate:endDate.toString(),
                agent:agent
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 0);
                $scope.playerdata = result;
                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }
    $scope.getdata();

    $scope.$watch('search.date', function () {
        $scope.getdata(1);
    });




}]);

app.controller('PlayerDiaryCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    var history = global.agentListHistory||(global.agentListHistory={});
    $scope.pageSize = history.pageSize||$scope.defaultRows;
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};
    var page = 1;
    var urlget = statUri+'/players';

    $scope.startDate = moment(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 15));
    $scope.endDate = moment(new Date());

    $scope.dateOptions = angular.copy(global.dateRangeOptions);
    $scope.dateOptions.startDate = $scope.startDate;
    $scope.dateOptions.endDate = $scope.endDate;
    $scope.dateOptions.opens = 'left';
    $scope.date = $scope.startDate.format('YYYY/MM/DD') + "-" + $scope.endDate.format('YYYY/MM/DD');

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px',
            border:'1px solid #cccccc'
        }
    }

    $http.get(agentUri + '/subAgents', {
        params:{
            token: sso.getToken(),
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.apps =obj.rows||[];
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $scope.left = function () {
        if($scope.page>1){
            --page;
            $scope.getdata();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.getdata();
        }
    };
    $scope.getdata = function(_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                search: $scope.search.keyword,
                page:page,
                rows:$scope.pageSize||20,
                status:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                $scope.usersInfo = result;
                if(result.total){
                    $scope.nodata = false;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                    $scope.totalnumber = global.reg(result.total);
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.getdata();

}]);

