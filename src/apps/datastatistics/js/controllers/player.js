app.controller('PlayerDataCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};
    var page = 1;
    var urlget = statUri+'/report/account';

    $scope.dateOptions = global.dateRangeOptions;

    // $scope.startDate = moment(new Date()).format('YYYY/MM/01');
    // $scope.endDate = moment(new Date()).format('YYYY/MM/DD');
    // $scope.search.date = $scope.startDate + "-" + $scope.endDate;
    // console.info($scope.search.date);

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px'
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
            $scope.search();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.search();
        }
    };
    $scope.search = function(_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        var date = $scope.search.date||{};
        var startDate = date.startDate || "";
        var endDate = date.endDate || "";
        console.info($scope.pageSize);

        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                page:page,
                rows:$scope.pageSize||20,
                isStat:true,
                type:0,
                startDate:startDate.toString(),
                endDate:endDate.toString()
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 0);
                if(result.total){
                    $scope.nodata = false;
                    $scope.playerdata = result;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.search();

}]);

app.controller('PlayerStatisticsCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};
    var page = 1;
    var urlget = statUri+'/players';


    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px'
        }
    }

    $scope.dateOptions = global.dateRangeOptions;
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
            $scope.search();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.search();
        }
    };
    $scope.search = function(keyword,_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                search: $scope.search.keyword,
                page:page,
                rows:20,
                status:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                if(result.total){
                    $scope.nodata = false;
                    $scope.usersInfo = result;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.search();

}]);

app.controller('PlayerDiaryCtrl', ['$scope', '$state', '$http', 'global', function ($scope, $state, $http, global) {

    var sso = jm.sdk.sso;
    $scope.search = {};
    $scope.search.date = $scope.search.date || {};
    var page = 1;
    var urlget = statUri+'/players';

    $scope.tablestyle = {};
    if($scope.isSmartDevice){
        $scope.tablestyle = {};
    }else{
        $scope.tablestyle = {
            height:$scope.app.navHeight-210+'px'
        }
    }

    $scope.dateOptions = global.dateRangeOptions;
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
            $scope.search();
        }
    }
    $scope.right = function () {
        if($scope.page<$scope.pages){
            ++page;
            $scope.search();
        }
    };
    $scope.search = function(keyword,_page) {
        if(_page) page = _page;
        $scope.moreLoading = true;
        $http.get(urlget, {
            params:{
                token: sso.getToken(),
                search: $scope.search.keyword,
                page:page,
                rows:20,
                status:1
            }
        }).success(function(result){
            if(result.err){
                $scope.error(result.msg);
            }else{
                $scope.moreLoading = false;
                $('html,body').animate({ scrollTop: 0 }, 100);
                if(result.total){
                    $scope.nodata = false;
                    $scope.usersInfo = result;
                    $scope.page = result.page;
                    $scope.pages = result.pages;
                    $scope.total = result.total;
                }else{
                    $scope.nodata = true;
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    }

    $scope.search();

}]);

