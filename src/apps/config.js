// config

var gConfig = {
    localhost: {
        sdkHost: "http://localhost:20200",
        opensdkHost: "http://localhost:20300",
        staticHost:"http://localhost:20400"
    },
    development: {
        apiHost: "http://192.168.0.55:19990",
        sdkHost: "http://192.168.0.61:81",
        opensdkHost: "http://jamma.3322.org:20300",
        staticHost:"http://jamma.3322.org:20400"
    },
    production: {
        sdkHost: "http://api.gzleidi.com",
        opensdkHost: "http://openapi.gzleidi.com",
        staticHost:"http://www.gzleidi.com"
    }
};

gConfig = gConfig['development'];

var apiHost = gConfig.apiHost;
var sdkHost = gConfig.sdkHost;
var opensdkHost = gConfig.opensdkHost;
var staticHost = gConfig.staticHost;

var ssoUri = apiHost+"/sso";
var aclUri = apiHost+"/acl";
var adminUri = apiHost+"/admin";
var omsUri = apiHost+"/oms";
var appMgrUri = apiHost + "/appManager";
var agentUri = apiHost + "/agent";
var configUri = apiHost + "/config";
var uploadUri = sdkHost + "/upload";
var staticUri = staticHost + "/static";
var activityUri = apiHost + "/activity";
var propUri = apiHost + "/prop";
var depotUri = apiHost + "/depot";
var payUri = apiHost + "/pay";
var bbsUri = apiHost + "/bbs";
var wordfilterUri = apiHost + "/wordfilter";
var packUri = apiHost + "/pack";
var statUri = apiHost + "/stat";
var cardUri = apiHost + "/card";
var homeUri = apiHost + "/home";
var recordUri = apiHost + "/record";
var guestbookUri = apiHost + "/guestbook";
var shopUri = apiHost + "/shop";
var logUri = apiHost + "/log";
var baoxiangUri = apiHost + "/baoxiang";
var algUri = apiHost + "/alg";


jm.sdk.init({uri: apiHost});

var domain = '';
var host = document.domain;
if(domain&&host.indexOf(domain)>=0){
    document.domain = domain;
}

