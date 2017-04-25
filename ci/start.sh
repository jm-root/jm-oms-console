#!/bin/bash

function setEnv () {
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

nginx -g "daemon off;"
