// config

var gConfig = {
    localhost: {
        sdkHost: "http://localhost:20200",
        opensdkHost: "http://localhost:20300",
        staticHost:"http://localhost:20400"
    },
    development: {
        sdkHost: "http://192.168.0.55:19990",
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

var sdkHost = gConfig.sdkHost;
var opensdkHost = gConfig.opensdkHost;
var staticHost = gConfig.staticHost;

var ssoUri = sdkHost+"/sso";
var aclUri = sdkHost+"/acl";
var adminUri = sdkHost+"/oms";
var appMgrUri = sdkHost + "/appManager";
var agentUri = "http://jamma.3322.org:20200" + "/agent";
var configUri = sdkHost + "/config";
var uploadUri = sdkHost + "/upload";
var staticUri = staticHost + "/static";
var activityUri = "http://jamma.3322.org:20200" + "/activity";
var propUri = "http://jamma.3322.org:20200" + "/prop";
var depotUri = sdkHost + "/depot";
var payUri = sdkHost + "/pay";
var bbsUri = sdkHost + "/bbs";
var wordfilterUri = sdkHost + "/wordfilter";
var packUri = sdkHost + "/pack";
var statUri = sdkHost + "/stat";
var cardUri = "http://jamma.3322.org:20200" + "/card";
var homeUri = "http://jamma.3322.org:20200" + "/home";
var recordUri = sdkHost + "/record";
var guestbookUri = sdkHost + "/guestbook";
var shopUri = "http://jamma.3322.org:20200" + "/shop";
var logUri = "http://jamma.3322.org:20200" + "/log";


jm.sdk.init({uri: sdkHost});

var domain = '';
var host = document.domain;
if(domain&&host.indexOf(domain)>=0){
    document.domain = domain;
}

