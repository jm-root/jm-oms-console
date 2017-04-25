#!/bin/bash

setEnv () {
    local NAME=$1;
    local VALUE=$2;
    if [ -n "$VALUE" ]
    then
        echo "$NAME: $VALUE"
        expr $VALUE + 0 &>/dev/null
        if [ $? -ne 0  ]
        then
            sed -i "s/var $NAME;/var $NAME=\'${VALUE}\';/g" /usr/share/nginx/html/dist/apps/config.js
        else
            sed -i "s/var $NAME;/var $NAME=${VALUE};/g" /usr/share/nginx/html/dist/apps/config.js
        fi
    fi
}

setEnv "StaticHost" "$StaticHost"
setEnv "StaticPort" $StaticPort
setEnv "ApiHost" "$ApiHost"
setEnv "ApiPort" $ApiPort

## 为App添加<script>
S=""
for app in $APPS
do
    echo $app
    S="$S<script src=\"apps\/$app\/js\/index.js\"><\/script>"
done

if [ -n "$S" ]
then
   sed -i "s/<!-- endApps -->/${S}/g" /usr/share/nginx/html/dist/index.html
fi

nginx -g "daemon off;"
