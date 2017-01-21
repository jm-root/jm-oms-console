angular.module( 'common', [] )
    .service( 'common', ['$rootScope', '$http', '$window', function( $rootScope, $http, $window ) {
        var self = this;
        jm.enableEvent(self);

        self.isIE = function(){
            return  !!navigator.userAgent.match(/MSIE/i);
        };

        self.isSmartDevice = function(){
            // Adapted from http://www.detectmobilebrowsers.com
            var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        };

        self.location2info = function(location, cb){
            var url = 'http://api.map.baidu.com/geocoder/v2/?ak=C6MDDbngC73PDlo6ifrzISzG&callback=?&location='+location.latitude+','+location.longitude+'&output=json&pois=0';
            $.getJSON(url, function(res){
                var province = res.result.addressComponent.province.replace('省', '');
                var city = res.result.addressComponent.city.replace('市', '');
                return cb({
                    province: province,
                    city: city
                });
                //addressComponent => {city: "广州市", district: "天河区", province: "广东省", street: "广州大道", street_number: "中922号-之101-128"}
            });
        };

        self.getLocationInfo = function(cb){
            if(self.getLocation){
                return self.getLocation(null, function(location){
                    self.location2info(location, cb);
                })
            }
            if(remote_ip_info&&remote_ip_info.ret == '1'){
                return cb({
                    province: remote_ip_info.province,
                    city: remote_ip_info.city
                });
            }
            if (navigator.geolocation)
            {
                navigator.geolocation.getCurrentPosition(
                    function(position){
                        return self.location2info(position.coords, cb);
                    },
                    cb
                );
                return;
            }
        };

    }]);
