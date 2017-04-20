// config

var gConfig = {
    localhost: {
        apiHost: "http://localhost:20200",
        sdkHost: "http://localhost:20200",
        opensdkHost: "http://localhost:20300",
        staticHost:"http://localhost:20400",
        robotUri: "localhost:20760"
    },
    development: {
        apiHost: "http://test.gzleidi.cn:81",
        sdkHost: "http://test.gzleidi.cn:81",
        opensdkHost: "http://test.gzleidi.cn:20300",
        staticHost:"http://test.gzleidi.cn",
        robotUri: "test.gzleidi.cn/robot"
    },
    production: {
        apiHost: "http://cn1.gzleidi.cn:81",
        sdkHost: "http://cn1.gzleidi.cn:81",
        opensdkHost: "http://cn1.gzleidi.cn:81:20300",
        staticHost:"http://cn1.gzleidi.cn",
        robotUri: "cn1.gzleidi.cn:81/robot"
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
var adminUri = apiHost+"/admin";
var omsUri = apiHost+"/oms";
var appMgrUri = apiHost + "/appManager";
var agentUri = apiHost + "/agent";
var configUri = apiHost + "/config";
var uploadUri = apiHost + "/upload";
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
var bankUri = apiHost + "/bank";
var algUri = sdkHost + "/alg";


jm.sdk.init({uri: apiHost});

var domain = '';
var host = document.domain;
if(domain&&host.indexOf(domain)>=0){
    document.domain = domain;
}

var omsnav = "nav";

const pfm_cy = 'static';
const pfm_oms = 'oms';
var omsPlatform = pfm_cy;

var plat;