// config

var gConfig = {
    localhost: {
        apiHost: "http://localhost:19990",
        sdkHost: "http://localhost:20200",
        opensdkHost: "http://localhost:20300",
        staticHost:"http://localhost:20400",
        robotUri: "localhost:20760"
    },
    development: {
        apiHost: "http://test.gzleidi.cn:81",
        sdkHost: "http://test.gzleidi.cn:82",
        opensdkHost: "http://test.gzleidi.cn:20300",
        staticHost:"http://test.gzleidi.cn",
        robotUri: "test.gzleidi.cn:82/robot"
    },
    production: {
        sdkHost: "http://api.gzleidi.com",
        opensdkHost: "http://openapi.gzleidi.com",
        staticHost:"http://www.gzleidi.com",
        robotUri: "api.gzleidi.com/robot"
    }
};

gConfig = gConfig['development'];

var apiHost = gConfig.apiHost;
var sdkHost = gConfig.sdkHost;
var opensdkHost = gConfig.opensdkHost;
var staticHost = gConfig.staticHost;
var robotUri = gConfig.robotUri;

var perUri = sdkHost+"/acl";
var ssoUri = apiHost+"/sso";
var aclUri = apiHost+"/acl";
var adminUri = sdkHost+"/admin";
var omsUri = apiHost+"/oms";
var appMgrUri = sdkHost + "/appManager";
var agentUri = sdkHost + "/agent";
var configUri = sdkHost + "/config";
var uploadUri = sdkHost + "/upload";
var staticUri = staticHost + "/static";
var activityUri = sdkHost + "/activity";
var propUri = sdkHost + "/prop";
var depotUri = sdkHost + "/depot";
var payUri = apiHost + "/pay";
var bbsUri = sdkHost + "/bbs";
var wordfilterUri = sdkHost + "/wordfilter";
var packUri = sdkHost + "/pack";
var statUri = sdkHost + "/stat";
var cardUri = sdkHost + "/card";
var homeUri = sdkHost + "/home";
var recordUri = sdkHost + "/record";
var guestbookUri = sdkHost + "/guestbook";
var shopUri = sdkHost + "/shop";
var logUri = sdkHost + "/log";
var baoxiangUri = sdkHost + "/baoxiang";
var algUri = sdkHost + "/alg";


jm.sdk.init({uri: apiHost});

var domain = '';
var host = document.domain;
if(domain&&host.indexOf(domain)>=0){
    document.domain = domain;
}

