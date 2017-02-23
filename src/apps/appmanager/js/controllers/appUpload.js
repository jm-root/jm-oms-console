/**
 * Created by ZL on 2016/8/23.
 */
"use strict";

var sso =jm.sdk.sso;
app.controller('AppsUploadCtrl', ['$scope', '$http','FileUploader', "$translatePartialLoader", "global", function ($scope, $http, FileUploader, $translatePartialLoader, global) {
    $translatePartialLoader.addPart('appManager');
    var platform = "";

    $http.get(appMgrUri+'/appVersion?platform=ios', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.iosVersion = obj.ret.version;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    $http.get(appMgrUri+'/appVersion?platform=android', {
        params:{
            token: sso.getToken()
        }
    }).success(function(result){
        var obj = result;
        if(obj.err){
            $scope.error(obj.msg);
        }else{
            $scope.androidVersion = obj.ret.version;
        }
    }).error(function(msg, code){
        $scope.errorTips(code);
    });

    var uploader = $scope.uploader = new FileUploader({
        // url: uploadUri+'?root=/apk&custom=true&fileName=player_new'
    });

    uploader.onProgressAll = function(progress) {
        // console.info('onProgressAll', progress);
        $scope.status = progress + '%';
    };

    uploader.onAfterAddingFile = function(fileItem) {
        // console.info('onAfterAddingFile', fileItem);
        $scope.status = fileItem.file.name;
        platform = fileItem.file.name.toString().substr(-3);
        if(platform == "apk"){
            fileItem.url = uploadUri+'?root=/apk&custom=true&fileName=player_new'
        }else if(platform == "ipa"){
            fileItem.url = uploadUri+'?root=/ipa&custom=true&fileName=player_new'
        }else {
            // $scope.status = "文件类型错误";
            $scope.status = global.translateByKey("appmgr.fileTypeError");
        }
    };

    uploader.onCompleteAll = function() {
        // console.info('onCompleteAll');
        // $scope.status = "解析与解压中...";
        $scope.status = global.translateByKey("appmgr.analysisAndDecompression");

        var url = appMgrUri + "/unpack";
        $http.post(url, {platform: platform}, {
            params:{
                token: sso.getToken()
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                if(result.err){
                    $scope.error(result.msg);
                    $scope.status = result.msg;
                }else{
                    // $scope.success('操作成功');
                    // $scope.status = "操作成功";
                    $scope.success(global.translateByKey("common.succeed"));
                    $scope.status = global.translateByKey("common.succeed");
                }
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };

    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };

}]);
