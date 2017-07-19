// config
// 下面七行不要修改，部署到容器时会被环境变量替换
var StaticHost;
var StaticPort;
var ApiHost;
var ApiPort;
var RobotPort;
var OmsNav;
var PlatformTpl;

var gConfig = {
    localhost: {
        apiHost: "http://localhost:20200",
        sdkHost: "http://localhost:20200",
        staticHost:"http://localhost:20400",
        robotUri: "localhost:20760/robot"
    },
    development: {
        apiHost: "http://test.gzleidi.cn:81",
        sdkHost: "http://test.gzleidi.cn:81",
        staticHost:"http://test.gzleidi.cn",
        robotUri: "test.gzleidi.cn/robot"
    },
    production: {
        apiHost: "http://cn1.gzleidi.cn:81",
        sdkHost: "http://cn1.gzleidi.cn:81",
        staticHost:"http://cn1.gzleidi.cn",
        robotUri: "cn1.gzleidi.cn:81/robot"
    }
};

gConfig = gConfig['development'];

var staticHost;
var apiHost;
var sdkHost;
var robotUri;

StaticHost && (staticHost = 'http://' + StaticHost);
StaticPort && (staticHost += ':' + StaticPort);
ApiHost && (apiHost = 'http://' + ApiHost);
ApiPort && (apiHost += ':' + ApiPort);
ApiHost && (robotUri = ApiHost);
RobotPort && (robotUri += ':' + RobotPort + '/robot');

staticHost || (staticHost = gConfig.staticHost);
apiHost || (apiHost = gConfig.apiHost);
sdkHost || (sdkHost = gConfig.sdkHost || apiHost);
robotUri || (robotUri = gConfig.robotUri);

var perUri = apiHost+"/acl";
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
var algUri = apiHost + "/alg";


jm.sdk.init({uri: apiHost});

var domain = '';
var host = document.domain;
if(domain&&host.indexOf(domain)>=0){
    document.domain = domain;
}

var omsnav = OmsNav||"nav";

const pfm_cy = 'tpl0';
const pfm_oms = 'tpl1';
var omsPlatform = PlatformTpl||pfm_cy;

var plat;