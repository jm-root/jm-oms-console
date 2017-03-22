var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = jm;
}

(function(){
    if(jm.root) return;
    var root = {};
    var registries = {};
    root.registries = registries;
    jm.root = root;

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.ERR) return;
    jm.ERR = {
        SUCCESS: {
            err: 0,
            msg: 'Success'
        },

        FAIL: {
            err: 1,
            msg: 'Fail'
        },

        FA_SYS: {
            err: 2,
            msg: 'System Error'
        },

        FA_NETWORK: {
            err: 3,
            msg: 'Network Error'
        },

        FA_PARAMS: {
            err: 4,
            msg: 'Parameter Error'
        },

        FA_BUSY: {
            err: 5,
            msg: 'Busy'
        },

        FA_TIMEOUT: {
            err: 6,
            msg: 'Time Out'
        },

        FA_ABORT: {
            err: 7,
            msg: 'Abort'
        },

        FA_NOTREADY: {
            err: 8,
            msg: 'Not Ready'
        },

        OK: {
            err: 200,
            msg: 'OK'
        },

        FA_BADREQUEST: {
            err: 400,
            msg: 'Bad Request'
        },

        FA_NOAUTH: {
            err: 401,
            msg: 'Unauthorized'
        },

        FA_NOPERMISSION: {
            err: 403,
            msg: 'Forbidden'
        },

        FA_NOTFOUND: {
            err: 404,
            msg: 'Not Found'
        },

        FA_INTERNALERROR: {
            err: 500,
            msg: 'Internal Server Error'
        },

        FA_UNAVAILABLE: {
            err: 503,
            msg: 'Service Unavailable'
        }

    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.getLogger) return;
    if (typeof module !== 'undefined' && module.exports) {
        var log4js = require('log4js');
        jm.getLogger = function(loggerCategoryName) {
            return log4js.getLogger(loggerCategoryName);
        };
    }else{
        jm.getLogger = function(loggerCategoryName) {
            console.debug = console.debug || console.log;
            return console;
        };
    }
    jm.logger = jm.getLogger();
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function () {
    if(jm.utils) return;
    jm.utils = {
        //高效slice
        slice: function (a, start, end) {
            start = start || 0;
            end = end || a.length;
            if (start < 0) start += a.length;
            if (end < 0) end += a.length;
            var r = new Array(end - start);
            for (var i = start; i < end; i++) {
                r[i - start] = a[i];
            }
            return r;
        },

        formatJSON: function(obj){
            return JSON.stringify(obj, null, 2);
        }
    };
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.aop) return;
    jm.aop = {
        _Arguments: function (args) {
            //convert arguments object to array
            this.value = [].slice.call(args);
        },

        arguments: function () {
            //convert arguments object to array
            return new this._Arguments(arguments);
        },

        inject: function( aOrgFunc, aBeforeExec, aAtferExec ) {
            var self = this;
            return function() {
                var Result, isDenied=false, args=[].slice.call(arguments);
                if (typeof(aBeforeExec) == 'function') {
                    Result = aBeforeExec.apply(this, args);
                    if (Result instanceof self._Arguments) //(Result.constructor === _Arguments)
                        args = Result.value;
                    else if (isDenied = Result !== undefined)
                        args.push(Result);
                }
                !isDenied && args.push(aOrgFunc.apply(this, args)); //if (!isDenied) args.push(aOrgFunc.apply(this, args));
                if (typeof(aAtferExec) == 'function')
                    Result = aAtferExec.apply(this, args.concat(isDenied));
                else
                    Result = undefined;
                return (Result !== undefined ? Result : args.pop());
            }
        }
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.Class) return;
    var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    jm.Class = function(){};

    // Create a new Class that inherits from this class
    jm.Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        var prototype = Object.create(_super);

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            if(name == 'properties'){
                continue;
            }
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        {
            var properties = prop['properties'];
            for(var key in properties){
                var desc = properties[key];
                if(desc.get && typeof desc.get == "string"){
                    desc.get = prototype[desc.get];
                }
                if(desc.set && typeof desc.set == "string"){
                    desc.set = prototype[desc.set];
                }
                Object.defineProperty(prototype, key, desc);
            }
        }

        // The dummy class constructor
        function Class() {
            if(this._className){
                Object.defineProperty(this, "className", { value: this._className, writable: false });
            }

            // All construction is actually done in the init method
            if ( this.ctor )
                this.ctor.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = jm.Class.extend;

        return Class;
    };
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.Object) return;
    jm.Object = jm.Class.extend({
        _className: 'object',

        attr: function (attrs) {
            for (var key in attrs) {
                if(key === 'className'){
                    continue;
                }

                this[key] = attrs[key];
            }
        }
    });

    jm.object = function(){
        return new jm.Object();
    };
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.Random) return;
    var iRandomMax = 200000000000;    //最大随机整数范围 0 <= randomValue <= iRandomMax;

    jm.Random = jm.Class.extend({
        _className: 'random',

        properties: {
            seed: { get: 'getSeed', set: 'setSeed' }
        },

        ctor: function(opts){
            opts = opts || {};
            this.g_seed = 0;
            this.randomMax =  opts.randomMax || iRandomMax;            
        },

        setSeed : function(seed)
        {
            this.g_seed = seed;
        },

        getSeed : function()
        {
            return this.g_seed;
        },

        random : function(){
            this.g_seed = ( this.g_seed * 9301 + 49297 ) % 233280;
            return this.g_seed / ( 233280.0 );
        },

        //min<=result<=max
        randomInt : function(min, max)
        {
            if(max === undefined) {
                max = min;
                min = 0;
            }
            var range = min + (this.random()*(max - min));
            return Math.round(range);
        },

        //min<=result<=max
        randomDouble : function(min, max)
        {
            if(max === undefined) {
                max = min;
                min = 0.0;
            }

            var range = min + (this.random()*(max - min));
            return range;
        },

        randomRange : function(range){
            return this.randomInt(0,this.randomMax) % range;
        },

        randomOdds : function(range, odds){
            if(this.randomRange(range) < odds) return 1;
            return 0;
        }
    });

    jm.random = function(opts){
        return new jm.Random(opts);
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.EventEmitter) return;
    jm.EventEmitter = jm.Object.extend({
        _className: 'eventEmitter',

        ctor: function () {
            this._events = {};
            this.addListener = this.on;
        },

        __createListener: function(fn, caller) {
            caller = caller;
            return {
                fn: fn,
                caller: caller
            };
        },

        __equalsListener: function (listener1, listener2) {
            return listener1.fn === listener2.fn && listener1.caller === listener2.caller;
        },

        /**
         * Adds a listener
         *
         * @api public
         */

        on: function (name, fn, caller) {
            var listener = this.__createListener(fn, caller);
            if (!this._events[name]) {
                this._events[name] = listener;
            } else if (Array.isArray(this._events[name])) {
                this._events[name].push(listener);
            } else {
                this._events[name] = [this._events[name], listener];
            }
            return this;
        },

        /**
         * Adds a volatile listener.
         *
         * @api public
         */

        once: function (name, fn, caller) {
            var self = this;
            var listener = this.__createListener(fn, caller);

            function on (arg1, arg2, arg3, arg4, arg5) {
                self.removeListener(name, on);
                fn.call(listener.caller, arg1, arg2, arg3, arg4, arg5);
            };

            on.listener = listener;
            this.on(name, on);

            return this;
        },


        /**
         * Removes a listener.
         *
         * @api public
         */

        removeListener: function (name, fn, caller) {
            var listener = this.__createListener(fn, caller);
            if (this._events && this._events[name]) {
                var list = this._events[name];

                if (Array.isArray(list)) {
                    var pos = -1;

                    for (var i = 0, l = list.length; i < l; i++) {
                        var o = list[i];
                        if (this.__equalsListener(o, listener) || (o.listener && this.__equalsListener(o.listener, listener))) {
                            pos = i;
                            break;
                        }
                    }

                    if (pos < 0) {
                        return this;
                    }

                    list.splice(pos, 1);

                    if (!list.length) {
                        delete this._events[name];
                    }
                } else if (this.__equalsListener(list, listener) || (list.listener && this.__equalsListener(list.listener, listener))) {
                    delete this._events[name];
                }
            }

            return this;
        },

        /**
         * Removes all listeners for an event.
         *
         * @api public
         */

        removeAllListeners: function (name) {
            if (name === undefined) {
                this._events = {};
                return this;
            }

            if (this._events && this._events[name]) {
                this._events[name] = null;
            }

            return this;
        },

        /**
         * Gets all listeners for a certain event.
         *
         * @api publci
         */

        listeners: function (name) {
            if (!this._events[name]) {
                this._events[name] = [];
            }

            if (!Array.isArray(this._events[name])) {
                this._events[name] = [this._events[name]];
            }

            return this._events[name];
        },

        /**
         * Emits an event.
         *
         * tip: use arg1...arg5 instead of arguments for performance consider.
         *
         * @api public
         */

        emit: function (name, arg1, arg2, arg3, arg4, arg5) {
            var handler = this._events[name];
            if (!handler) return this;

            if(typeof handler === 'object' && !Array.isArray(handler)){
                handler.fn.call(handler.caller || this, arg1, arg2, arg3, arg4, arg5);
            } else if (Array.isArray(handler)) {
                var listeners = new Array(handler.length);
                for (var i = 0; i < handler.length; i++) {
                    listeners[i] = handler[i];
                }

                for (var i = 0, l = listeners.length; i < l; i++) {
                    var h = listeners[i];
                    if(h.fn.call(h.caller || this, arg1, arg2, arg3, arg4, arg5) === false) break;
                }
            }
            return this;
        }
    });

    jm.eventEmitter = function(){ return new jm.EventEmitter();}

    var prototype = jm.EventEmitter.prototype;
    var EventEmitter = {
        _events: {},

        __createListener: prototype.__createListener,
        __equalsListener: prototype.__equalsListener,
        on: prototype.on,
        once: prototype.once,
        addListener: prototype.on,
        removeListener: prototype.removeListener,
        removeAllListeners: prototype.removeAllListeners,
        listeners: prototype.listeners,
        emit: prototype.emit
    };

    var em = EventEmitter;
    jm.enableEvent = function(obj) {
        if(obj._events!==undefined) return;
        for(var key in em){
            obj[key] = em[key];
        }
        obj._events = {};
        return this;
    };

    jm.disableEvent = function(obj) {
        for(var key in em){
            delete obj[key];
        }
        return this;
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('./root.js');
}

(function(){
    if(jm.TagObject) return;
    jm.TagObject = jm.EventEmitter.extend({
        _className: 'tagObject',

        ctor: function(){
            this._super();
            this._tags = [];
            Object.defineProperty(this, "tags", { value: this._tags, writable: false });
        },

        destroy: function(){
            this.emit('destroy', this);
            this.removeAllTags();
        },

        hasTag: function(tag){
            var tags = this._tags;
            return tags.indexOf(tag) != -1;
        },

        hasTagAny: function(tags){
            for(var i in tags){
                var t = tags[i];
                if(this.hasTag(t)) return true;
            }
            return false;
        },

        hasTagAll: function(tags){
            for(var i in tags){
                var t = tags[i];
                if(!this.hasTag(t)) return false;
            }
            return true;
        },

        addTag: function(tag){
            var tags = this._tags;
            if (this.hasTag(tag)) return this;
            tags.push(tag);
            this.emit('addTag', tag);
            return this;
        },

        addTags: function(tags){
            for(var i in tags){
                var t = tags[i];
                this.addTag(t);
            }
            return this;
        },

        removeTag: function(tag){
            var tags = this._tags;
            var idx = tags.indexOf(tag);
            if(idx>=0){
                tags.splice(idx, 1);
            }
            this.emit('removeTag', tag);
            return this;
        },

        removeTags: function(tags){
            for(var i in tags){
                var t = tags[i];
                this.removeTag(t);
            }
            return this;
        },

        removeAllTags: function () {
            var v = this._tags;
            for(i in v){
                this.emit('removeTag', v[i]);
            }
            this._tags = [];
            this.emit('removeAllTags');
            return this;
        }

    });

    jm.tagObject = function(){return new jm.TagObject();}

    var prototype = jm.TagObject.prototype;
    var Tag = {
        _tags: [],

        hasTag: prototype.hasTag,
        hasTagAny: prototype.hasTagAny,
        hasTagAll: prototype.hasTagAll,
        addTag: prototype.addTag,
        addTags: prototype.addTags,
        removeTag: prototype.removeTag,
        removeTags: prototype.removeTags,
        removeAllTags: prototype.removeAllTags
    };

    jm.enableTag = function(obj) {
        if(obj._tags!=undefined) return;
        for(key in Tag){
            obj[key] = Tag[key];
        }
        obj._tags = [];
        Object.defineProperty(obj, "tags", { value: obj._tags, writable: false });
        jm.enableEvent(obj);
    };

    jm.disableTag = function(obj) {
        for(key in Tag){
            delete obj[key];
        }
        jm.disableEvent(obj);
    };
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.ajax) return;
    var $ = jm;
    var ERR = jm.ERR;
    var logger = jm.getLogger('jm:ajax');

    if (typeof module !== 'undefined' && module.exports) {
        $.ajax = require('najax');
    }else{
        (function($){
            var utils = {
                extend: function (o) {
                    utils.each(Array.prototype.slice.call(arguments, 1), function (a) {
                        for (var p in a) if (a[p] !== void 0) o[p] = a[p];
                    });
                    return o;
                },

                each: function (o, fn, ctx) {
                    if (o === null) return;
                    if (nativeForEach && o.forEach === nativeForEach)
                        o.forEach(fn, ctx);
                    else if (o.length === +o.length) {
                        for (var i = 0, l = o.length; i < l; i++)
                            if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
                    } else {
                        for (var key in o)
                            if (hasOwnProperty.call(o, key))
                                if (fn.call(ctx, o[key], key, o) === breaker) return;
                    }
                }

            };

            var Ajax = {};
            _xhrf = null;
            var nativeForEach = Array.prototype.forEach,
                _each = utils.each,
                _extend = utils.extend;

            Ajax.xhr = function () {
                return new XMLHttpRequest();
            };
            Ajax._xhrResp = function (xhr) {
                switch (xhr.getResponseHeader("Content-Type").split(";")[0]) {
                    case "text/xml":
                        return xhr.responseXML;
                    case "text/json":
                    case "application/json":
                    case "text/javascript":
                    case "application/javascript":
                    case "application/x-javascript":
                        try {
                            return JSON.parse(xhr.responseText);
                        } catch (e) {
                            return ERR.FAIL;
                        }
                    default:
                        return xhr.responseText;
                }
            };
            Ajax._formData = function (o) {
                var kvps = [], regEx = /%20/g;
                for (var k in o) {
                    if(o[k]!=undefined && o[k]!=null)
                        kvps.push(encodeURIComponent(k).replace(regEx, "+") + "=" + encodeURIComponent(o[k].toString()).replace(regEx, "+"));
                }
                return kvps.join('&');
            };
            Ajax.ajax = function (o) {
                var xhr = Ajax.xhr(), timer=null, n = 0;
                if(typeof xhr.open !== 'function') return;
                o = _extend({ userAgent: "XMLHttpRequest", lang: "en", type: "GET", data: null, contentType: "application/x-www-form-urlencoded" }, o);
                if (o.timeout) timer = setTimeout(function () {o.error.timeout = true; xhr.abort(); if (o.timeoutFn) o.timeoutFn(o.url); }, o.timeout);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (timer!=null) {
                            clearTimeout(timer);
                            timer = null;
                        }
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                            if (o.success) o.success(Ajax._xhrResp(xhr));
                        }
                        else if (o.error) o.error(xhr, xhr.status, xhr.statusText);
                        if (o.complete) o.complete(Ajax._xhrResp(xhr), xhr, xhr.statusText);
                    }
                    else if (o.progress) o.progress(++n);
                };
                var url = o.url, data = null;
                o.type = (o.type||'GET').toUpperCase();
                var isPost = o.type == "POST" || o.type == "PUT";
                if (!isPost && o.data) url += "?" + Ajax._formData(o.data);
                xhr.open(o.type, url);
                if(o.headers)
                    for (var key in o.headers) {
                        o.headers[key] && (xhr.setRequestHeader(key, o.headers[key]));
                    }
                if (isPost) {
                    var isJson = o.contentType.indexOf("json") >= 0;
                    data = isJson ? JSON.stringify(o.data) : Ajax._formData(o.data);
                    xhr.setRequestHeader("Content-Type", isJson ? "application/json" : "application/x-www-form-urlencoded");
                }
                if(data){
                    xhr.send(data);
                }else{
                    xhr.send();
                }
            };
            $.ajax = Ajax.ajax;
        }($));
    }

    /**
     * 为obj对象增加快捷ajax接口
     * @function jm#enableAjax
     * @param {Object} obj 对象
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
         *  types: 支持的请求类型, 默认['get', 'post', 'put', 'delete']
         *  ignoreDocErr: 是否忽略返回的doc中的err(可选, 默认false, 不忽略, 检测doc.err不为空时, 生成Error)
         *  timeout: 设置默认超时检测, 单位毫秒, 默认0代表不检测超时
         * }
     */
    jm.enableAjax = function(obj, opts){
        opts = opts || {};
        var ignoreDocErr = opts.ignoreDocErr || false;
        var types = opts.types || ['get', 'post', 'put', 'delete'];
        var timeout = opts.timeout || 0;
        if(!Array.isArray(types)){
            types = [types];
        }
        types.forEach(function(method) {
            obj[method] = function(opts, cb) {
                var params = {};
                for(var key in opts){
                    params[key] = opts[key];
                }
                params.type = method.toUpperCase();
                params.contentType = params.contentType || 'application/json';
                params.dataType = params.dataType || 'json';
                params.timeout = params.timeout || timeout;
                params.success = params.success ||
                    function(doc) {
                        if(!cb) return;
                        var err = null;
                        if(doc && doc.err && !ignoreDocErr){
                            err = new Error(doc.msg || doc.err);
                        }
                        cb(err, doc);
                    };
                params.error = params.error ||
                    function(XMLHttpRequest, textStatus, errorThrown){
                        var s = method.toUpperCase() + ' ' + opts.url;
                        if(params.error.timeout) errorThrown = new Error('timeout');
                        errorThrown = errorThrown || new Error(s);
                        logger.debug('failed. ' + s);
                        if(cb) cb(errorThrown, ERR.FA_NETWORK);
                    }
                $.ajax(params);
            };
        });
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

/**
 * sdk对象
 * @class  sdk
 */
(function(){
    if(jm.sdk) return;
    jm.sdk = {};
    var sdk = jm.sdk;
    jm.enableEvent(sdk);
    sdk.getLogger = jm.getLogger;
    sdk.logger = sdk.getLogger();

    /**
     * sdk对象
     * @function sdk#init
     * @param {Object} opts 配置
     */
    sdk.init = function(opts){
        opts = opts || {};
        sdk.emit('init', opts);
    };
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.sdk.consts) return;
    var sdk = jm.sdk;

    sdk.consts = {
        ERR: jm.ERR
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.sdk.utils) return;
    var sdk = jm.sdk;

    /**
     * utils对象
     * @class  utils
     */
    sdk.utils = {

        formatJSON: function(o) {
            return JSON.stringify(o, null, 2);
        }

    };
})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-ajax');
}

(function(){
    if(jm.sdk.$) return;
    var sdk = jm.sdk;
    sdk.$ = {};
    var $ = sdk.$;
    var ERR = sdk.consts.ERR;
    $.ajax = jm.ajax;

    if(!$.get){
        // alias methods
        ['get','post','put','delete','patch'].forEach(function(method) {
            $[method] = function(o) {
                o.type = method;
                $.ajax(o);
            };
        });
    }

    /**
     * 为obj对象增加快捷ajax接口
     * @function sdk#enableAjax
     * @param {Object} obj 对象
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
         *  ignoreDocErr: 是否忽略返回的doc中的err(可选, 默认false, 不忽略, 检测doc.err不为空时, 生成Error)
         * }
     */
    sdk.enableAjax = jm.enableAjax;

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.sdk.storage) return;
    var sdk = jm.sdk;
    var isNode = false;
    var stores = {};
    if (typeof module !== 'undefined' && module.exports) {
        isNode = true;
    }

    sdk.storage = {
        setItem: function(k, v) {
            if(isNode){
                stores[k] = v;
            }else{
                localStorage.setItem(k,v);
            }
        },

        getItem: function(k) {
            if(isNode){
                return stores[k];
            }else{
                return localStorage.getItem(k);
            }
        },

        removeItem: function(k) {
            if(isNode){
                delete stores[k];
            }else{
                localStorage.removeItem(k);
            }
        }
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

/**
 * ms对象
 * @class  ms
 */
(function(){
    if(jm.ms) return;
    var ERR = jm.ERR;
    jm.ms = function(opts){
        var router = jm.ms.router(opts);
        return router;
    };

    /**
     * 创建一个代理路由
     * 支持多种参数格式, 例如
     * proxy({uri:uri}, cb)
     * proxy(uri, cb)
     * 可以没有回调函数cb
     * proxy({uri:uri})
     * proxy(uri)
     * @function ms#proxy
     * @param {Object} opts 参数
     * @example
     * opts参数:{
         *  uri: 目标uri(必填)
         * }
     * @param cb 回调cb(err,doc)
     * @returns {Router}
     */
    jm.ms.proxy = function(opts, cb){
        opts || ( opts = {} );
        var err = null;
        var doc = null;
        if(typeof opts === 'string') {
            opts = {uri:opts};
        }
        if(!opts.uri){
            doc = ERR.FA_PARAMS;
            err = new Error(doc.msg, doc.err);
            if (!cb) throw err;
        }
        var router = jm.ms();
        jm.ms.client(opts, function(err, client){
            if(err) return cb(err, client);
            router.use(function(opts, cb) {
                client.request(opts, cb);
            });
            router.client = client;
            if(cb) cb(null, router);
        });
        return router;
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.ms.consts) return;
    var ms = jm.ms;

    var ERRCODE_MS = 900;
    jm.ERR.ms = {
        FA_INVALIDTYPE: {
            err: ERRCODE_MS++,
            msg: '无效的类型'
        }
    };

    ms.consts = {
    };

})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    jm = require('jm-core');
}

(function () {
    if(jm.ms.pathToRegexp) return;
    jm.ms.pathToRegexp = pathToRegexp;
    pathToRegexp.parse = parse;
    pathToRegexp.compile = compile;
    pathToRegexp.tokensToFunction = tokensToFunction;
    pathToRegexp.tokensToRegExp = tokensToRegExp;

    var isarray = Array.isArray || function (arr) {
            return Object.prototype.toString.call(arr) == '[object Array]';
        };

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
        // Match escaped characters that would otherwise appear in future matches.
        // This allows the user to escape special characters that won't transform.
        '(\\\\.)',
        // Match Express-style parameters and un-named parameters with a prefix
        // and optional suffixes. Matches appear as:
        //
        // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
        // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
        // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
        '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse(str) {
        var tokens = []
        var key = 0
        var index = 0
        var path = ''
        var res

        while ((res = PATH_REGEXP.exec(str)) != null) {
            var m = res[0]
            var escaped = res[1]
            var offset = res.index
            path += str.slice(index, offset)
            index = offset + m.length

            // Ignore already escaped sequences.
            if (escaped) {
                path += escaped[1]
                continue
            }

            // Push the current path onto the tokens.
            if (path) {
                tokens.push(path)
                path = ''
            }

            var prefix = res[2]
            var name = res[3]
            var capture = res[4]
            var group = res[5]
            var suffix = res[6]
            var asterisk = res[7]

            var repeat = suffix === '+' || suffix === '*'
            var optional = suffix === '?' || suffix === '*'
            var delimiter = prefix || '/'
            var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

            tokens.push({
                name: name || key++,
                prefix: prefix || '',
                delimiter: delimiter,
                optional: optional,
                repeat: repeat,
                pattern: escapeGroup(pattern)
            })
        }

        // Match any characters still remaining.
        if (index < str.length) {
            path += str.substr(index)
        }

        // If the path exists, push it onto the end.
        if (path) {
            tokens.push(path)
        }

        return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile(str) {
        return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction(tokens) {
        // Compile all the tokens into regexps.
        var matches = new Array(tokens.length)

        // Compile all the patterns before compilation.
        for (var i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] === 'object') {
                matches[i] = new RegExp('^' + tokens[i].pattern + '$')
            }
        }

        return function (obj) {
            var path = ''
            var data = obj || {}

            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i]

                if (typeof token === 'string') {
                    path += token

                    continue
                }

                var value = data[token.name]
                var segment

                if (value == null) {
                    if (token.optional) {
                        continue
                    } else {
                        throw new TypeError('Expected "' + token.name + '" to be defined')
                    }
                }

                if (isarray(value)) {
                    if (!token.repeat) {
                        throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
                    }

                    if (value.length === 0) {
                        if (token.optional) {
                            continue
                        } else {
                            throw new TypeError('Expected "' + token.name + '" to not be empty')
                        }
                    }

                    for (var j = 0; j < value.length; j++) {
                        segment = encodeURIComponent(value[j])

                        if (!matches[i].test(segment)) {
                            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
                        }

                        path += (j === 0 ? token.prefix : token.delimiter) + segment
                    }

                    continue
                }

                segment = encodeURIComponent(value)

                if (!matches[i].test(segment)) {
                    throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
                }

                path += token.prefix + segment
            }

            return path
        }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString(str) {
        return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup(group) {
        return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys(re, keys) {
        re.keys = keys
        return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags(options) {
        return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp(path, keys) {
        // Use a negative lookahead to match only capturing groups.
        var groups = path.source.match(/\((?!\?)/g)

        if (groups) {
            for (var i = 0; i < groups.length; i++) {
                keys.push({
                    name: i,
                    prefix: null,
                    delimiter: null,
                    optional: false,
                    repeat: false,
                    pattern: null
                })
            }
        }

        return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp(path, keys, options) {
        var parts = []

        for (var i = 0; i < path.length; i++) {
            parts.push(pathToRegexp(path[i], keys, options).source)
        }

        var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

        return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp(path, keys, options) {
        var tokens = parse(path)
        var re = tokensToRegExp(tokens, options)

        // Attach keys back to the regexp.
        for (var i = 0; i < tokens.length; i++) {
            if (typeof tokens[i] !== 'string') {
                keys.push(tokens[i])
            }
        }

        return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp(tokens, options) {
        options = options || {}

        var strict = options.strict
        var end = options.end !== false
        var route = ''
        var lastToken = tokens[tokens.length - 1]
        var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

        // Iterate over the tokens and create our regexp string.
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i]

            if (typeof token === 'string') {
                route += escapeString(token)
            } else {
                var prefix = escapeString(token.prefix)
                var capture = token.pattern

                if (token.repeat) {
                    capture += '(?:' + prefix + capture + ')*'
                }

                if (token.optional) {
                    if (prefix) {
                        capture = '(?:' + prefix + '(' + capture + '))?'
                    } else {
                        capture = '(' + capture + ')?'
                    }
                } else {
                    capture = prefix + '(' + capture + ')'
                }

                route += capture
            }
        }

        // In non-strict mode we allow a slash at the end of match. If the path to
        // match already ends with a slash, we remove it for consistency. The slash
        // is valid at the end of a path match, not in the middle. This is important
        // in non-ending mode, where "/test/" shouldn't match "/test//route".
        if (!strict) {
            route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
        }

        if (end) {
            route += '$'
        } else {
            // In non-ending mode, we need the capturing groups to match as much as
            // possible by using a positive lookahead to the end or next path segment.
            route += strict && endsWithSlash ? '' : '(?=\\/|$)'
        }

        return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp(path, keys, options) {
        keys = keys || []

        if (!isarray(keys)) {
            options = keys
            keys = []
        } else if (!options) {
            options = {}
        }

        if (path instanceof RegExp) {
            return regexpToRegexp(path, keys, options)
        }

        if (isarray(path)) {
            return arrayToRegexp(path, keys, options)
        }

        return stringToRegexp(path, keys, options)
    }

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.ms.Route) return;
    var ms = jm.ms;
    var ERR = jm.ERR;
    var pathToRegexp = ms.pathToRegexp;

    /**
     * Route
     * @param {Object} opts 参数
     * @example
     * opts参数:{
         *  uri: 接口路径(必填)
         *  type: 请求类型(可选)
         *  fn: 接口处理函数 function(opts, cb, next){}(必填)
         * }
     * @param cb 回调cb(err,doc)
     * @returns {Object}
     */
    var Route = jm.TagObject.extend({
        _className: 'route',

        ctor: function(opts) {
            this._super();
            if(opts) this.attr(opts);
            this._fns = [];
            Object.defineProperty(this, 'fns', { value: this._fns, writable: false });
            this.uri = this.uri || '/';
            this.keys = [];
            this.regexp = pathToRegexp(this.uri, this.keys, opts);
            if (this.uri === '/' && opts.end === false) {
                this.regexp.fast_slash = true;
            }
            if(this.type == undefined) {
                this.allType = true;
            }
            var fns = opts.fn;
            if(!Array.isArray(fns)){
                fns = [fns];
            }
            for (var i = 0; i < fns.length; i++) {
                var fn = fns[i];
                if (typeof fn !== 'function') {
                    var type = toString.call(fn);
                    var msg = 'requires callback functions but got a ' + type;
                    throw new TypeError(msg);
                }
                this._fns.push(fn);
            }
        },

        /**
         * dispatch opts, cb into this route
         * @private
         */
        handle: function dispatch(opts, cb, next) {
            var idx = 0;
            var fns = this.fns;
            if (fns.length === 0) {
                return next();
            }
            _next();
            function _next(err, doc) {
                if (err) {
                    if(err === 'route')
                        return next();
                    else
                        return cb(err, doc);
                }
                var fn = fns[idx++];
                if (!fn) {
                    return next(err);
                }
                try {
                    fn(opts, cb, _next);
                } catch (err) {
                    _next(err);
                }
            }
        },

        /**
         * Check if this route matches `uri`, if so
         * populate `.params`.
         *
         * @param {String} uri
         * @return {Boolean}
         * @api private
         */

        match: function match(uri, type) {
            if(type){
                type = type.toLowerCase();
            }
            if (type != this.type && !this.allType) {
                return false;
            }
            if (uri == null) {
                // no uri, nothing matches
                this.params = undefined;
                this.uri = undefined;
                return false;
            }

            if (this.regexp.fast_slash) {
                // fast uri non-ending match for / (everything matches)
                this.params = {};
                this.uri = '';
                return true;
            }

            var m = this.regexp.exec(uri);

            if (!m) {
                this.params = undefined;
                this.uri = undefined;
                return false;
            }

            // store values
            this.params = {};
            this.uri = m[0];

            var keys = this.keys;
            var params = this.params;

            for (var i = 1; i < m.length; i++) {
                var key = keys[i - 1];
                var prop = key.name;
                params[prop] = m[i];
            }

            return true;
        }

    });

    ms.Route = Route;
    ms.route = function(opts) {
        return new Route(opts);
    };

})();

var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
}

(function(){
    if(jm.ms.Router) return;
    var ms = jm.ms;
    var ERR = jm.ERR;

    var cb_default = function(err, doc){};
    var slice = Array.prototype.slice;

    var Router = jm.TagObject.extend({
        _className: 'router',

        /**
         * 添加接口定义
         * @function Router#add
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         *  sensitive: 是否大小写敏感(可选)
         *  strict: 是否检查末尾的分隔符(可选)
         * }
         * @param cb 回调cb(err,doc)
         * @returns {jm.ms}
         */
        ctor: function(opts) {
            var self = this;
            this._super();
            if(opts) this.attr(opts);
            this._routes = [];
            Object.defineProperty(this, 'routes', { value: this._routes, writable: false });

            // alias methods
            ms.utils.enableType(self, ['get', 'post', 'put', 'delete']);
        },

        /**
         * 清空接口定义
         * @function Router#clear
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         * }
         * @param cb 回调cb(err,doc)
         * @returns {Object}
         */
        clear: function(opts, cb) {
            this._routes.splice(0);
            if(cb) cb(null, true);
            return this;
        },

        /**
         * 添加接口定义
         * @function Router#_add
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         *  uri: 接口路径(必填)
         *  type: 请求类型(可选)
         *  fn: 接口处理函数 function(opts, cb){}, 支持数组(必填)
         * }
         * @param cb 回调cb(err,doc)
         * @returns {Object}
         */
        _add: function(opts, cb) {
            opts = opts || {};
            var err = null;
            var doc = null;
            if(!opts.uri || !opts.fn){
                doc = ERR.FA_PARAMS;
                err = new Error(doc.msg);
                if(!cb) throw err;
            }else{
                this.emit('add', opts);
                var o = {};
                for(var key in opts) {
                    o[key] = opts[key];
                }
                if(o.mergeParams === undefined) o.mergeParams =  this.mergeParams;
                if(o.sensitive === undefined) o.sensitive =  this.sensitive;
                if(o.strict === undefined) o.strict =  this.strict;
                var route = ms.route(o);
                this._routes.push(route);
            }
            if(cb) cb(err, doc);
            return this;
        },

        /**
         * 添加接口定义
         * 支持多种参数格式, 例如
         * add({uri:uri, type:type, fn:fn}, cb)
         * add({uri:uri, type:type, fn:[fn1, fn2, ..., fnn]}, cb)
         * 可以没有回调函数cb
         * add({uri:uri, type:type, fn:fn})
         * add({uri:uri, type:type, fn:[fn1, fn2, ..., fnn]})
         * 以下用法不能包含cb
         * add(uri, fn)
         * add(uri, fn1, fn2, ..., fnn)
         * add(uri, [fn1, fn2, ..,fnn])
         * add(uri, type, fn)
         * add(uri, type, fn1, fn2, ..., fnn)
         * add(uri, type, [fn1, fn2, ..,fnn])
         * @function Router#add
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         *  uri: 接口路径(必填)
         *  type: 请求类型(可选)
         *  fn: 接口处理函数 function(opts, cb){}, 支持数组(必填)
         * }
         * @param cb 回调cb(err,doc)
         * @returns {Object}
         */
        add: function(opts, cb) {
            if(typeof opts === 'string') {
                opts = {
                    uri: opts
                };
                if(typeof cb === 'string') {
                    opts.type = cb;
                    if(Array.isArray(arguments[2])){
                        opts.fn = arguments[2];
                    }else{
                        opts.fn = slice.call(arguments, 2);
                    }
                }else if(Array.isArray(cb)) {
                    opts.fn = cb;
                }else {
                    opts.fn = slice.call(arguments, 1);
                }
                cb = null;
            }
            return this._add(opts, cb);
        },

        /**
         * 引用路由定义
         * @function Router#_use
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         *  uri: 接口路径(可选)
         *  fn: 接口处理函数 router实例 或者 function(opts, cb){}(支持函数数组) 或者含有request或handle函数的对象(必填)
         * }
         * @param cb 回调cb(err,doc)
         * @returns {Object}
         */
        _use: function(opts, cb) {
            opts = opts || {};
            var err = null;
            var doc = null;
            if(opts && opts instanceof Router) {
                opts = {
                    fn: opts
                };
            }
            if(!opts.fn){
                doc = ERR.FA_PARAMS;
                err = new Error(doc.msg, doc.err);
                if(!cb) throw err;
            }else{
                this.emit('use', opts);
                opts.strict = false;
                opts.end = false;
                opts.uri = opts.uri || '/';
                if(opts.fn instanceof Router){
                    var router = opts.fn;
                    opts.router = router;
                    opts.fn = function(opts, cb, next) {
                        router.handle(opts, cb, next);
                    }
                } else if(typeof opts.fn === "object" ) {
                    var router = opts.fn;
                    if(router.request) {
                        opts.router = router;
                        opts.fn = function(opts, cb, next) {
                            router.request(opts, function(err, doc){
                                cb(err, doc);
                                next();
                            });
                        }
                    } else if(router.handle) {
                        opts.router = router;
                        opts.fn = function(opts, cb, next) {
                            router.handle(opts, cb, next);
                        }
                    }
                }
                return this._add(opts, cb);
            }
            if(cb) cb(err, doc);
            return this;
        },

        /**
         * 引用路由定义
         * 支持多种参数格式, 例如
         * use({uri:uri, fn:fn}, cb)
         * use({uri:uri, fn:[fn1, fn2, ..., fnn]}, cb)
         * use({uri:uri, fn:router}, cb)
         * use({uri:uri, fn:obj}, cb)
         * use(router, cb)
         * 可以没有回调函数cb
         * use({uri:uri, fn:fn})
         * use({uri:uri, fn:[fn1, fn2, ..., fnn]})
         * use({uri:uri, fn:router})
         * use({uri:uri, fn:obj})
         * use(router)
         * use(obj) obj必须实现了request或者handle函数之一，优先使用request
         * 以下用法不能包含cb
         * use(uri, fn)
         * use(uri, fn1, fn2, ..., fnn)
         * use(uri, [fn1, fn2, ..,fnn])
         * use(uri, router)
         * use(uri, obj)
         * use(uri, fn)
         * use(fn1, fn2, ..., fnn)
         * use([fn1, fn2, ..,fnn])
         * @function Router#use
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         *  uri: 接口路径(可选)
         *  fn: 接口处理函数 router实例 或者 function(opts, cb){}(必填)
         * }
         * @param cb 回调cb(err,doc)
         * @returns {Object}
         */
        use: function(opts, cb) {
            if(typeof opts === 'string') {
                opts = {
                    uri: opts
                };
                if (typeof cb === 'object') {   //object 或者 数组
                    opts.fn = cb;
                } else {
                    opts.fn = slice.call(arguments, 1);
                }
                cb = null;
            }else if(typeof opts === 'function') {
                opts = {
                    fn: slice.call(arguments, 0)
                };
                cb = null;
            }else if(Array.isArray(opts)) {
                opts = {
                    fn: opts
                };
                cb = null;
            }else if(typeof opts === 'object') {
                if(!opts.fn) {
                    opts = {
                        fn: opts
                    };
                }
            }

            return this._use(opts, cb);
        },

        _proxy: function(opts, cb) {
            var self = this;
            opts || (opts = {});
            cb || ( cb = function(err, doc){
                if(err) throw err;
            });
            if(!opts.target){
                var doc = ERR.FA_PARAMS;
                var err = new Error(doc.msg, doc.err);
                cb(err, doc);
            }
            this.emit('proxy', opts);
            if(typeof opts.target === 'string') {
                opts.target = {uri:opts.target};
            }
            if(opts.changeOrigin) {
                ms.client(opts.target, function(err, client){
                    if(err) return cb(err, client);
                    self.use(opts.uri, function(opts, cb) {
                        client.request(opts, cb);
                    });
                    cb();
                });
            }else {
                ms.proxy(opts.target, function(err, doc){
                    if(err) return cb(err, doc)
                    self.use(opts.uri, doc);
                    cb();
                })
            }

            return this;
        },
        /**
         * 添加代理
         * 支持多种参数格式, 例如
         * proxy({uri:uri, target:target, changeOrigin:true}, cb)
         * proxy(uri, target, changeOrigin, cb)
         * proxy(uri, target, cb)
         * 可以没有回调函数cb
         * proxy({uri:uri, target:target, changeOrigin:true})
         * proxy(uri, target, changeOrigin)
         * proxy(uri, target)
         * @function Router#proxy
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         *  uri: 接口路径(必填)
         *  target: 目标路径或者参数(必填)
         *  changeOrigin: 是否改变originUri(可选， 默认fasle)
         * }
         * @param cb 回调cb(err,doc)
         * @returns {this}
         */
        proxy: function(uri, target, changeOrigin, cb) {
            var opts = uri;
            if(typeof uri === 'string') {
                opts = {
                    uri: uri,
                    target: target
                };
                if(typeof changeOrigin === 'boolean') {
                    opts.changeOrigin = changeOrigin;
                } else if (changeOrigin && typeof changeOrigin === 'function') {
                    cb = changeOrigin;
                }
            }
            return this._proxy(opts, cb);
        },

        /**
         * 请求
         * 支持多种参数格式, 例如
         * request({uri:uri, type:type, data:data, params:params, timeout:timeout}, cb)
         * request({uri:uri, type:type, data:data, params:params, timeout:timeout})
         * request(uri, type, data, params, timeout, cb)
         * request(uri, type, data, params, cb)
         * request(uri, type, data, cb)
         * request(uri, type, cb)
         * request(uri, cb)
         * request(uri, type, data, params, timeout)
         * request(uri, type, data, params)
         * request(uri, type, data)
         * request(uri, type)
         * request(uri)
         * request(uri, type, data, timeout, cb)
         * request(uri, type, timeout, cb)
         * request(uri, timeout, cb)
         * request(uri, type, data, timeout)
         * request(uri, type, timeout)
         * request(uri, timeout)
         * @function Router#request
         * @param {Object} opts 参数
         * @example
         * opts参数:{
         *  uri: 接口路径(必填)
         *  type: 请求类型(可选)
         *  data: 请求数据(可选)
         *  params: 请求参数(可选)
         *  timeout: 请求超时(可选, 单位毫秒, 默认0表示不检测超时)
         * }
         * @param cb 回调(可选)cb(err,doc)
         * @returns {Object}
         */
        request: function(opts, cb) {
            var r = ms.utils.preRequest.apply(this, arguments);
            return this.handle(r.opts, r.cb || cb_default);
        },

        handle: function handle(opts, cb, next) {
            if(!next){
                //is a request
                var _opts = opts;
                var _cb = cb;
                opts = {};
                for(var key in _opts) {
                    opts[key] =  _opts[key];
                }
                cb = function(err, doc){
                    if(cb.done) return;
                    cb.done = true;
                    _cb(err, doc);
                };
                next = function(){
                    cb(new Error(jm.ERR.FA_NOTFOUND.msg), jm.ERR.FA_NOTFOUND);
                };
            }

            var self = this;
            var idx = 0;
            var routes = self.routes;
            var parentParams = opts.params;
            var parentUri = opts.baseUri || '';
            var done = restore(next, opts, 'baseUri', 'params');
            opts.originalUri = opts.originalUri || opts.uri;
            var uri = opts.uri;
            _next();
            return self;
            function _next() {
                if(cb.done){
                    return done();
                }
                opts.baseUri = parentUri;
                opts.uri = uri;
                // no more matching layers
                if (idx >= routes.length) {
                    return done();
                }
                var match = false;
                var route;
                while (!match && idx < routes.length) {
                    route = routes[idx++];
                    if (!route) {
                        continue;
                    }
                    try {
                        match = route.match(opts.uri, opts.type);
                    } catch (err) {
                        return done(err);
                    }
                    if (!match) {
                        continue;
                    }
                }
                if (!match) {
                    return done();
                }
                opts.params = {};
                for(var key in parentParams){
                    opts.params[key] = parentParams[key];
                }
                for(var key in route.params){
                    opts.params[key] = route.params[key];
                }

                if(route.router){
                    opts.baseUri = parentUri + route.uri;
                    opts.uri = opts.uri.replace(route.uri, '');
                }
                route.handle(opts, cb, _next);
            }
            // restore obj props after function
            function restore(fn, obj) {
                var props = new Array(arguments.length - 2);
                var vals = new Array(arguments.length - 2);

                for (var i = 0; i < props.length; i++) {
                    props[i] = arguments[i + 2];
                    vals[i] = obj[props[i]];
                }

                return function(err){
                    // restore vals
                    for (var i = 0; i < props.length; i++) {
                        obj[props[i]] = vals[i];
                    }

                    if(fn) fn.apply(this, arguments);
                    return self;
                };
            }
        }
    });

    ms.Router = Router;
    ms.router = function(opts) {
        return new Router(opts);
    };

})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    jm = require('jm-core');
}

(function () {
    if(jm.ms.utils) return;
    var slice = Array.prototype.slice;
    var ms = jm.ms;

    /**
     * utils对象
     * @class  utils
     */
    ms.utils = {

        formatJSON: function (o) {
            return JSON.stringify(o, null, 2);
        },

        getUriProtocol: function (uri) {
            if (!uri) return null;
            return uri.substring(0, uri.indexOf(':'));
        },

        getUriPath: function (uri) {
            var idx = uri.indexOf('//');
            if(idx == -1) return '';
            var idx = uri.indexOf('/', idx + 2);
            if(idx == -1) return '';
            uri = uri.substr(idx);
            idx = uri.indexOf('#');
            if(idx == -1) idx = uri.indexOf('?');
            if(idx != -1) uri = uri.substr(0, idx);
            return uri;
        },

        enableType: function(obj, types) {
            if(!Array.isArray(types)){
                types = [types];
            }
            types.forEach(function(type) {
                obj[type] = function(opts, cb) {
                    if(typeof opts === 'string') {
                        var args = Array.prototype.slice.call(arguments, 0);
                        args.splice(1, 0, type);
                        return obj.request.apply(obj, args);
                    }
                    opts.type = type;
                    return obj.request(opts, cb);
                };
            });
        },

        preRequest: function(opts, cb) {
            if(typeof opts === 'string') {
                var numargs = arguments.length;
                var args = slice.call(arguments, 0);
                cb = null;
                if(typeof args[numargs - 1] === 'function'){
                    cb = args[numargs - 1];
                    numargs--;
                }
                opts = {
                    uri: opts
                };
                if(typeof args[numargs - 1] === 'number'){
                    opts.timeout = args[numargs - 1];
                    numargs--;
                }
                var i = 1;
                if(i<numargs && args[i]){
                    opts.type = args[i];
                }
                i++;
                if(i<numargs && args[i]){
                    opts.data = args[i];
                }
                i++;
                if(i<numargs && args[i]){
                    opts.params = args[i];
                }
            }

            return {
                opts: opts,
                cb: cb
            };
        }
    };
})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    jm = require('jm-core');
}

(function () {
    if(jm.ms.client) return;
    var ms = jm.ms;
    var ERR = jm.ERR;
    var registries = jm.root.registries;
    registries.ms = {
        client: {
            types: {}
        }
    };
    var regTypes = registries.ms.client.types;

    ms.registClientType = function (opts, cb) {
        opts = opts || {};
        var err = null;
        var doc = null;
        if (!opts.type || !opts.fn) {
            err = new Error('invalid params');
            doc = ERR.FA_PARAMS;
        } else {
            var type = opts.type.toLowerCase();
            regTypes[type] = {
                type: type,
                port: opts.port,
                fn: opts.fn
            };
        }
        if (cb) cb(err, doc);
        return this;
    },

    ms.unregistClientType = function (opts, cb) {
        opts = opts || {};
        var err = null;
        var doc = null;
        if (!opts.type) {
            err = new Error('invalid params');
            doc = ERR.FA_PARAMS;
        } else {
            var type = opts.type.toLowerCase();
            if (regTypes[type]) {
                delete regTypes[type];
            }
        }
        if (cb) cb(err, doc);
        return this;
    },

    /**
     * 创建客户端
     * @function ms#client
     * @param {Object} opts 参数
     * @example
     * opts参数:{
     *  type: 类型(可选, 默认http)
     *  uri: uri(可选, 默认http://127.0.0.1)
     *  timeout: 请求超时(可选, 单位毫秒, 默认0表示不检测超时)
     * }
     * @param cb 回调cb(err,doc)
     * @returns {jm.ms}
     */
    ms.client = function (opts, cb) {
        opts = opts || {};
        var err = null;
        var doc = null;
        var type = null;
        if(opts.uri){
            type = ms.utils.getUriProtocol(opts.uri);
        }
        type = opts.type || type || 'http';
        type = type.toLowerCase();
        var o = regTypes[type];
        if (!o) {
            err = new Error('invalid type');
            doc = ERR.ms.FA_INVALIDTYPE;
        } else {
            o.fn.call(this, opts, function(err, doc){
                ms.utils.enableType(doc, ['get', 'post', 'put', 'delete']);
                cb(err, doc);
            });
            return this;
        }
        if (cb) cb(err, doc);
        return this;
    };

})();

var jm = jm || {};
var WebSocket = WebSocket || null;

(function () {
    'use strict';
    var MAXID = 999999;
    var defaultPort = 3100;
    var createClientImpl = null;
    if (typeof module !== 'undefined' && module.exports) {
        jm = require('jm-ms-core');
        WebSocket = require("ws");
        createClientImpl = function (uri, onmessage) {
            var ws = new WebSocket(uri);
            ws.on('message', function (data, flags) {
                // flags.binary will be set if a binary data is received.
                // flags.masked will be set if the data was masked.
                onmessage(data);
            });
            return ws;
        };
    } else {
        createClientImpl = function (uri, onmessage) {
            var ws = new WebSocket(uri);
            ws.onmessage = function (event) {
                onmessage(event.data);
            };
            return ws;
        };
    }

    var logger = jm.getLogger('jm-ms-ws:client');
    var createClient = function (opts, cb) {
        var self = this;
        opts = opts || {};
        var err = null;
        var ws = null;
        var connected = false;
        var autoReconnect = false;
        var id = 0;
        var cbs = {};

        var client = {
            request: function (opts, cb) {
                var r = ms.utils.preRequest.apply(this, arguments);
                opts = r.opts;
                cb = r.cb;
                if(!connected) return cb(new Error(jm.ERR.FA_NETWORK.msg), jm.ERR.FA_NETWORK);
                opts.uri = prefix + (opts.uri || '');
                if (cb) {
                    if(id >= MAXID) id = 0;
                    id++;
                    cbs[id] = cb;
                    opts.id = id;
                }
                ws.send(JSON.stringify(opts));
            },

            close: function() {
                autoReconnect = false;
                ws.close();
                ws = null;
            }
        };
        jm.enableEvent(client);

        var onmessage = function(message) {
            logger.debug('received: %s', message);
            client.emit('message', message);
            var json = null;
            try {
                json = JSON.parse(message);
            }
            catch (err) {
                return;
            }
            if (json.id) {
                if (cbs[json.id]) {
                    var err = null;
                    var doc = json.data;
                    if (doc.err) {
                        err = new Error(doc.msg);
                    }
                    cbs[json.id](err, doc);
                    delete cbs[json.id];
                }
            }
        };

        var uri = opts.uri || 'ws://127.0.0.1:' + defaultPort;
        var path = jm.ms.utils.getUriPath(uri);
        var prefix = opts.prefix || '';
        prefix = path + prefix;
        var reconnect = false;
        var reconncetTimer = null;
        var reconnectAttempts = 0;
        var reconnectionDelay = opts.reconnectionDelay || 5000;
        var DEFAULT_MAX_RECONNECT_ATTEMPTS = 0; //默认重试次数0 表示无限制
        var maxReconnectAttempts = opts.maxReconnectAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
        client.connect = function() {
            if(connected) return;
            logger.debug('connect to ' + uri);
            var self = client;
            if(!autoReconnect && opts.reconnect){
                autoReconnect = opts.reconnect;
                reconnect = false;
                reconnectAttempts = 0;
            }
            var onopen = function(event) {
                logger.debug('connected to ' + uri);
                connected = true;
                if(!!reconnect) {
                    self.emit('reconnect');
                }
                self.emit('open');
                if(self.onopen){
                    logger.warn(
                        'Deprecated: onopen, please use on(\'open\' function(err,doc){}).'
                    );
                    self.onopen(event);
                }
            };
            var onclose = function(event) {
                connected = false;
                self.emit('close');
                if(!!autoReconnect && (!maxReconnectAttempts || reconnectAttempts < maxReconnectAttempts)) {
                    reconnect = true;
                    reconnectAttempts++;
                    reconncetTimer = setTimeout(function() {
                        self.connect();
                    }, reconnectionDelay);
                }
            };
            var onerror = function(event) {
                client.emit('error');
            };
            ws = createClientImpl(uri, onmessage);
            ws.onopen = onopen;
            ws.onerror = onerror;
            ws.onclose = onclose;
        };

        client.connect();
        if (cb) cb(err, client);
        return this;
    };

    logger = jm.getLogger('jm-ms-ws:client');
    var ms = jm.ms;
    ms.registClientType({
        type: 'ws',
        fn: createClient
    });

})();


var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-ms-core');
    require("jm-ajax");
}

(function () {
    'use strict';
    var ms = jm.ms;
    var defaultPort = 3000;

    var $ = {};
    jm.enableAjax($);

    var createClient = function(opts, cb){
        var self = this;
        opts = opts || {};
        var err = null;
        var doc = null;
        var uri = opts.uri || 'http://127.0.0.1:' + defaultPort;
        var timeout = opts.timeout || 0;

        doc = {
            request: function(opts, cb) {
                var r = ms.utils.preRequest.apply(this, arguments);
                opts = r.opts;
                cb = r.cb;
                var type = opts.type || 'get';
                $[type]({
                    url: uri + opts.uri,
                    timeout: opts.timeout || timeout,
                    data: opts.data,
                    headers: opts.headers || {}
                }, cb);
            }
        };
        jm.enableEvent(doc);

        if(cb) cb(err, doc);
        doc.emit('open');
        return this;
    };

    ms.registClientType({
        type: 'http',
        fn: createClient
    });

})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    jm = require('jm-sdk-core');
    require('jm-ms');
}

(function () {
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ms = jm.ms;

    var modelName = 'config';
    if(sdk[modelName]) return;
    sdk.on('init', function (opts) {
        opts[modelName] = opts[modelName] || {};
        opts[modelName].uri = opts[modelName].uri || opts.uri;
        opts[modelName].timeout = opts[modelName].timeout || opts.timeout;
        sdk[modelName].init(opts[modelName]);
    });
    var cb_default = function(err, doc) {};

    /**
     * config对象
     * @class  config
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  uri: 服务器uri(可选)
     * }
     */
    sdk.config = {
        init: function (opts) {
            var self = this;
            jm.enableEvent(this);
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/' + modelName;
            this.uri = uri + prefix;
            var app = ms();
            self.client = app;
            app.use(function(opts, cb, next){
                opts.data || (opts.data={});
                if(!opts.data.token){
                    var token = storage.getItem('token') || null;
                    if(token) opts.data.token = token;
                }
                next();
            });
            ms.client({
                uri: this.uri,
                timeout: opts.timeout || 0
            }, function(err, doc){
                if(!err && doc) {
                    app.use(doc);
                    doc.on('open', function(){
                        self.emit('open');
                        sdk.emit('open', modelName);
                    });
                    doc.on('close', function(){
                        self.emit('close');
                        sdk.emit('close', modelName);
                    });
                }
            });
        },

        _getlisturi: function(opts){
            var root = opts.root || '';
            return '/' + root;
        },

        _geturi: function(opts){
            var key = opts.key || '';
            return this._getlisturi(opts) + '/' + key;
        },

        /**
         * 获取配置信息
         * @function config#getConfig
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  root: 根(必填)
         *  key: 配置项(必填)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 配置值(基本类型, 对象或者数组)
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        getConfig: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var url = this._geturi(opts);
            this.client.get({
                uri: url
            }, cb);
        },

        /**
         * 设置配置信息
         * @function config#setConfig
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  root: 根(必填)
         *  key: 配置项(必填)
         *  value: 配置值(可选)
         *  expire: 过期时间(可选, 单位秒, 默认0代表永不过期)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 结果(true or false)
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        setConfig: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var url = this._geturi(opts);
            this.client.post({
                uri: url,
                data: opts
            }, cb);
        },

        /**
         * 删除配置信息
         * @function config#delConfig
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  root: 根(必填)
         *  key: 配置项(必填)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 结果(true or false)
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        delConfig: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var url = this._geturi(opts);
            this.client.delete({
                uri: url
            }, cb);
        },

        /**
         * 删除根配置, 所有根下面的配置信息都被删除
         * @function config#delRoot
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  root: 根(必填)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 结果(true or false)
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        delRoot: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var url = this._getlisturi(opts);
            this.client.delete({
                uri: url
            }, cb);
        },

        /**
         * 列出配置项
         * @function config#listConfig
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  root: 根(必填)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数: {
         *  rows: 配置项数组
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        listConfig: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var url = this._getlisturi(opts);
            this.client.get({
                uri: url,
                data:opts
            }, cb);
        },

        /**
         * 设置多个配置信息
         * @function config#setConfigs
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  root: 根(必填)
         *  value: 配置对象(可选, 默认{})
         *  expire: 过期时间(可选, 单位秒, 默认0代表永不过期)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 结果(true or false)
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        setConfigs: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var url = this._geturi(opts);
            this.client.post({
                uri: url,
                data: opts
            }, cb);
        }
    };

})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    jm = require('jm-sdk-core');
}

(function () {
    var sdk = jm.sdk;
    var $ = sdk.$;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'sso';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * sso对象
     * @class  sso
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.sso = {
        init: function (opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/sso';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout: opts.timeout || 0});
        },

        /**
         * 注册用户
         * @function sso#signup
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  account: 账号(可选),
         *  mobile: 手机号(可选),
         *  email: 邮箱(可选),
         *  passwd: 密码(必填),
         *  nick: 昵称(可选),
         *  gender: 性别(可选),
         *  country: 国家(可选),
         *  province: 省份(可选),
         *  city: 城市(可选),
         *  area: 地区(可选),
         *  birthday: 生日(可选),
         *  signature: 签名(可选),
         *  headimgurl: 头像(可选)
         * }
         * @param {callback} [cb=function(err, doc){}] 回调
         * @example
         * cb参数格式:
         * 成功时, doc参数:{
         *   id: 用户ObjectId,
         *   uid: 用户id,
         *   nick: 昵称,
         *   gender: 性别,
         *   province: 省份,
         *   city: 城市,
         *   headimgurl: 头像地址,
         *   signature: 签名
         * }
         * 失败时, doc参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        signup: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            this.post({
                url: this.uri + '/signup',
                data: opts
            }, function (err, doc) {
                if(!err && doc && doc.id){
                }else{
                    err = new Error('注册失败');
                }
                if(!err){
                    self.signon(opts, cb);
                } else {
                    cb(err, doc);
                }
                self.emit('signup', err, doc);
            });
        },

        /**
         * 登录
         * @function sso#signon
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  id: id(可选),
         *  account: 账号(可选),
         *  mobile: 手机号(可选),
         *  email: 邮箱(可选),
         *  passwd: 密码(必填),
         * }
         * @param {callback} [cb=function(err, doc){}] 回调
         * @example
         * cb参数格式:
         * 成功时, doc参数:{
         *   id: 用户ObjectId,
         *   uid: 用户id,
         *   nick: 昵称,
         *   gender: 性别,
         *   province: 省份,
         *   city: 城市,
         *   headimgurl: 头像地址,
         *   signature: 签名
         * }
         * 失败时, doc参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        signon: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            this.post({
                    url: this.uri + '/signon',
                    data: opts
                }
                , function (err, doc) {
                    if(!err && doc && doc.id){
                        storage.setItem('token', doc.token);
                        storage.setItem('id', doc.id);
                    }else{
                        storage.removeItem('token');
                        storage.removeItem('id');
                        err = new Error('登录失败');
                    }
                    if(!err){
                        self.getUser(opts, cb);
                    }else{
                        cb(err, doc);
                    }
                    self.emit('signon', err, doc);
                });
        },

        /**
         * 游客登录
         * @function sso#signon_guest
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *  id: '账号id',
         *  token: '令牌',
         *  account: '账号',
         *  passwd: '密码'
         * }
         * err参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        signon_guest: function (opts, cb) {
            var self = this;
            this.post({
                    url: this.uri + '/signon_guest',
                    data: opts
                },
                function (err, doc) {
                    if(!err && doc && doc.id){
                        storage.setItem('token', doc.token);
                        storage.setItem('id', doc.id);
                    }else{
                        storage.removeItem('token');
                        storage.removeItem('id');
                        err = new Error('登录失败');
                    }
                    cb(err, doc);
                    self.emit('signon', err, doc);
                }
            );
        },

        /**
         * 获取头像网址
         * @param opts 用户
         * @returns {*}
         */
        getAvatarUri: function (opts) {
            var user = opts || self.user;
            if (user) {
                return user.headimgurl || '/upload/sso/' + user.id + '/images/avatar.jpg';
            }
            return '/images/avatar.png';
        },

        /**
         * 获取用户信息
         * @function sso#getUser
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         * }
         * @param {callback} [cb=function(err, doc){}] 回调
         * @example
         * cb参数格式:
         * 成功时,doc参数:{
         *   id: 用户ObjectId,
         *   uid: 用户id,
         *   nick: 昵称,
         *   gender: 性别,
         *   province: 省份,
         *   city: 城市,
         *   headimgurl: 头像地址,
         *   signature: 签名
         * }
         * 失败时,doc参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        getUser: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var token = opts.token || storage.getItem('token');
            if (!token) return cb(new Error('获取用户信息失败'), ERR.FA_NOAUTH);
            this.get({
                    url: this.uri + '/user',
                    data: {token: token}
                },
                function (err, doc) {
                    if(!err && doc && doc.id){
                        self.user = {
                            token: token
                        };
                        for (var key in doc) {
                            self.user[key] = doc[key];
                        }
                        self.user.nick || (self.user.nick = '');
                        doc = self.user;
                    }else{
                        storage.removeItem('token');
                        storage.removeItem('id');
                        err = new Error('获取用户信息失败');
                    }
                    cb(err, doc);
                    self.emit('getUser', err, doc);
                }
            );
        },

        /**
         * 退出登录
         * @function sso#signout
         * @param {callback} [cb=function(err,result){}] 回调
         */
        signout: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var token = opts.token || storage.getItem('token');
            if (token){
                this.get({
                        url: this.uri + '/signout',
                        data: {token: token}
                    },
                    function (err, doc) {
                    }
                );
            }
            storage.removeItem('token');
            storage.removeItem('id');
            self.user = {};
            cb();
            self.emit('signout');
        },

        /**
         * 更新密码
         * @function sso#updatePasswd
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: token(可选, 如果不填,自动从localStorage获取),
         *  newPasswd:'新密码(必填)',
         *  passwd:'旧密码(必填)'
         * }
         * @param {callback} [cb=function(err, doc){}] 回调
         * @example
         * cb参数格式:
         * 成功, doc参数:{
         * }
         * 失败, doc参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        updatePasswd: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var token = opts.token || storage.getItem('token');
            if (!token) return cb(new Error('修改密码失败'), ERR.FA_NOAUTH);
            opts.token = token;
            this.post(
                {
                    url: this.uri + '/user/passwd',
                    data: opts
                },
                cb
            );
        },

        /**
         * 更新用户信息
         * @function sso#updateUser
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: token(可选, 如果不填,自动从localStorage获取),
         *  account: 账号(可选),
         *  mobile: 手机号(可选),
         *  email: 邮箱(可选),
         *  nick: 昵称(可选),
         *  gender: 性别(可选),
         *  country: 国家(可选),
         *  province: 省份(可选),
         *  city: 城市(可选),
         *  area: 地区(可选),
         *  birthday: 生日(可选),
         *  signature: 签名(可选),
         *  headimgurl: 头像(可选)
         * }
         * @param {callback} [cb=function(err, doc){}] 回调
         * @example
         * cb参数格式:
         * 成功, doc参数:{
         * }
         * 失败, doc参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        updateUser: function (opts, cb) {
            var self = this;
            cb = cb || function () {
                };
            opts = opts || {};
            var token = opts.token || storage.getItem('token');
            if (!token) return cb(new Error('更新用户信息失败'), ERR.FA_NOAUTH);
            opts.token = token;
            this.post({
                    url: this.uri + '/user',
                    data: opts
                }, cb
            );
        },

        /**
         * 获取验证码
         * @function sso#getVerifyCode
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  key: 键值(必填)
         *  length: 验证码长度（可选）
         *  expire: 过期时间，单位秒（可选）
         * }
         * @param {callback} [cb=function(err, doc){}] 回调
         * @example
         * cb参数格式:
         * 成功, doc参数:{
         *  code: 验证码
         *  expire: 验证码过期时间
         * }
         * 失败，doc参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        getVerifyCode: function (opts, cb) {
            cb = cb || function () {
                };
            this.get({
                url: this.uri + '/verifyCode',
                data: opts,
            }, cb);
        },

        /**
         * 验证验证码
         * @function sso#checkVerifyCode
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  key: 键值(必填)
         *  code: 验证码(必填)
         * }
         * @param {callback} [cb=function(err, doc){}] 回调
         * @example
         * cb参数格式:
         * 成功, doc参数:{
         *  ret: 验证结果
         * }
         * 失败，doc参数:{
         *    'err': '错误码',
         *    'msg': '错误信息'
         * }
         */
        checkVerifyCode: function (opts, cb) {
            cb = cb || function () {
                };
            this.get({
                url: this.uri + '/verifyCode/check',
                data: opts,
            }, cb);
        }

    };


})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    jm = require('jm-sdk-core');
    require('jm-ms');
}

(function () {
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ms = jm.ms;

    var modelName = 'acl';
    if(sdk[modelName]) return;
    sdk.on('init', function (opts) {
        opts[modelName] = opts[modelName] || {};
        opts[modelName].uri = opts[modelName].uri || opts.uri;
        opts[modelName].timeout = opts[modelName].timeout || opts.timeout;
        sdk[modelName].init(opts[modelName]);
    });
    var cb_default = function(err, doc) {};

    /**
     * acl对象
     * @class  acl
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  uri: 服务器uri(可选)
     * }
     */
    sdk.acl = {
        init: function (opts) {
            var self = this;
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/' + modelName;
            this.uri = uri + prefix;
            var app = ms();
            self.client = app;
            app.use(function(opts, cb, next){
                opts.data || (opts.data={});
                if(!opts.data.token){
                    var token = storage.getItem('token') || null;
                    if(token) opts.data.token = token;
                }
                next();
            });
            ms.client({
                uri: this.uri,
                timeout: opts.timeout || 0
            }, function(err, doc){
                if(!err && doc) {
                    app.use({fn: doc});
                    doc.on('open', function(){
                        sdk.emit('open', modelName);
                    });
                    doc.on('close', function(){
                        sdk.emit('close', modelName);
                    });
                }
            });
            jm.enableEvent(this);
        },

        /**
         * 检测是否有权限访问
         * @function acl#isAllowed
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: (可选)
         *  user: 用户(可选)
         *  resource: 资源(可选)
         *  permisssions: 权限(可选)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 结果 1允许 0禁止
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        isAllowed: function (opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/isAllowed';
            this.client.get({
                uri: url,
                data: opts
            }, cb);
        },

        /**
         * 获取用户角色
         * @function acl#userRoles
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: (可选)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 角色数组
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        userRoles: function (opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/userRoles';
            this.client.get({
                uri: url,
                data: opts
            }, cb);
        },
        /**
         * 获取用户资源及权限
         * @function acl#userResources
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  user: 用户id(必填)
         *  resource: 资源(可选)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * {
         *  '资源':['权限']
         * }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        userResources:function (opts,cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/userResources';
            this.client.get({
                uri: url,
                data: opts
            }, cb);
        },
        /**
         * 重新加载
         * @function acl#reload
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: (可选)
         *  name:(可选)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 1
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        reload:function (opts,cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/reload';
            this.client.get({
                uri: url,
                data: opts
            }, cb);
        },
        /**
         * 获取角色资源
         * @function acl#roleResources
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: (可选)
         *  roles:
         *  permissions:(可选)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * 方式一:
         * {
         *  '资源':['权限']
         * }
         * 方式二:
         * {
         *  rows:['具有指定权限的资源']
         * }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        roleResources:function (opts,cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/roleResources';
            this.client.get({
                uri: url,
                data: opts
            }, cb);
        },

        /**
         * 添加用户角色
         * @function acl#addUserRoles
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  user: 用户id(必填)
         *  role: 角色(必填)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 1
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        addUserRoles:function (opts,cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/userRoles';
            this.client.put({
                uri: url,
                data: opts
            }, cb);
        },

        /**
         * 移除用户角色
         * @function acl#removeUserRoles
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  user: 用户id(必填)
         *  role: 角色(必填)
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * doc参数:{
         *  ret: 1
         *  }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        removeUserRoles:function (opts,cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/userRoles';
            this.client.delete({
                uri: url,
                data: opts
            }, cb);
        }

    };

    var acl = sdk.acl;
    acl.role = {
        /**
         * 填充角色
         * @function acl#role.init
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  rows:[{code: '角色编码', title: '标题', description:'描述',parents:['父编码'], allows: [{resource:'资源编码', permissions: ['权限']}]}]
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * {
         *  ret:true|false
         * }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        init: function(opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/roles/init';
            acl.client.post({
                uri: url,
                data: opts
            }, cb);
        },
        list: function(opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/roles';
            acl.client.get({
                uri: url,
                data: opts
            }, cb);
        }
    };

    acl.user = {
        list: function(opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/users';
            acl.client.get({
                uri: url,
                data: opts
            }, cb);
        }
    };
    acl.resource = {
        /**
         * 填充资源
         * @function acl#resource.init
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  rows:[{code: '资源编码', title: '标题', permissions: ['权限'],children: []}]
         * }
         * @param {callback} [cb=function(err,doc){}] 回调
         * @example
         * cb参数格式:
         * {
         *  ret:true|false
         * }
         * 出错时, doc参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        init: function(opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/resources/init';
            acl.client.post({
                uri: url,
                data: opts
            }, cb);
        },
        list: function(opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/resources';
            acl.client.get({
                uri: url,
                data: opts
            }, cb);
        },
        all: function(opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/resources/all';
            acl.client.get({
                uri: url,
                data: opts
            }, cb);
        },
        tree: function(opts, cb) {
            cb || (cb = cb_default);
            opts || (opts = {});
            var url = '/resources/tree';
            acl.client.get({
                uri: url,
                data: opts
            }, cb);
        }
    };

})();

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    require('jm-acl/dist/js/jm-sdk-acl');
    jm = require('jm-sdk-core');
}

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    jm = require('jm-sdk-core');
}

(function(){
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'activity';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * 活动对象
     * @class  activity
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.activity = {
        init: function(opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/activity';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout:opts.timeout||0});
        },

        /**
         * 获取发布活动列表
         * @function activity#list
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   page: 第几页(可选),
         *   rows: 一页几行(可选,默认10),
         *   fields: {status:1},//筛选字段(可选)
         *   sort: 对查询数据排序(可选).
         *   appid: 应用id(可选),
         *   forum: 版块id(可选),
         *   fcode: 版块编码(可选),
         *   code: 活动编码(可选),
         *   tags: 标签查询(可选).
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *   rows:[{}]
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        list: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            // if (!opts.token) return cb(new Error('获取发布活动列表失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/list',
                data: opts
            }, cb);
        },

        /**
         * 获取活动详情
         * @function activity#info
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   id: 活动id(可选,id,code二选一),
         *   code: 活动编码(可选,id,code二选一),
         *   appid: 应用id(可选,随code一起提供)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        info: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            // if (!opts.token) return cb(new Error('获取活动详情失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/info',
                data: opts
            }, cb);
        },

        /**
         * 领取奖励
         * @function activity#take
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   id: 活动项id(必填).
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         *   type:'类型',
         *   rows:[{
         *     prop:{ _id: 57e5f68aaec31c1ecc1d6336, code: 'paodan', name: '炮弹' },
         *     expire:'过期时间戳',
         *     amount:'数量'
         *   }]
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        take: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('领取奖励失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/take',
                data: opts
            }, cb);
        },

        /**
         * 获取未读活动
         * @function activity#unread
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   forum: 版块id(可选),
         *   fcode: 版块编码(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        unread: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取未读活动失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/unread',
                data: opts
            }, cb);
        }

    };

})();

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    jm = require('jm-sdk-core');
}

(function(){
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'agent';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * 代理对象
     * @class  agent
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.agent = {
        init: function(opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/agent';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout:opts.timeout||0});
        },

        /**
         * 获取用户属于哪个渠道
         * @function agent#userAgent
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   "userId": 指定用户ObjectId,需有相应权限,如无,取当前token用户
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * 注:没渠道返回空对象
         * result参数:{
         *  _id: 渠道ID,
         *  code: 渠道编码,
         *  name: "渠道名"
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        userAgent: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取用户渠道失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/userAgent',
                data: opts
            }, cb);
        }
    };

})();

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    jm = require('jm-sdk-core');
}

(function () {
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'bank';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * 银行对象
     * @class  bank
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.bank = {
        init: function (opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/bank';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout:opts.timeout||0});
        },

        /**
         * 获取账户信息
         * @function bank#query
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: (可选, 如果不填，自动从storage中取值)
         *  userId: 用户id(sso.user.id, 可选，如果不填，取当前登陆用户)
         *  accountId: 账户id(可选, 如果不填，取用户默认帐户)
         *  ctCode: [要查询的币种编码数组](可选, 如果不填，取全部)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *  id: (帐户id)
         *  name: "账户名",
         *  holds: {
         *      (ctcode): {
         *           overdraw: 透支数量
         *           amount: 数量
         *           amountLocked: 被锁定数量
         *           amountValid: 有效数量
         *      }
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        query: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取账户信息失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/query',
                data: opts
            }, cb);
        },

        /**
         * 获取账户信息列表
         * @function bank#accounts
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: (可选, 如果不填，自动从storage中取值)
         *  userId: 用户id(可选,默认查询所有跟自己相关的账户)
         *  accountId: 账户id(可选,默认查询所有账户)
         *  page: 第几页(可选)
         *  rows: 一页显示几行(可选)
         *  search: 模糊搜索用户(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *      "page": 1,
         *      "pages": 2,
         *      "total": 3,
         *      "rows": [
         *          {
         *              "id": "账户id",
         *              "name": "账户名",
         *              "status": "账户状态",
         *               "user": {
         *                   "id": "用户id",
         *                   "userId": "用户ObjectId",
         *                   "name": "用户名",
         *                   .....
         *               },
         *               "holds": {
         *                   (ctcode): {
         *                       name: 币种名称
         *                       overdraw: 透支数量
         *                       amount: 数量
         *                       amountLocked: 被锁定数量
         *                       amountValid: 有效数量
         *                   }
         *               }
         *           }
         *      ]
         *     }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        accounts: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取账户信息失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/accounts',
                data: opts
            }, cb);
        },

        /**
         * 更新账户状态
         * @function bank#status
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   userId: 用户ObjectId(必填).
         *   status: 状态(必填)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        status: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('更新状态失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/account/status',
                data: opts
            }, cb);
        },

        /**
         * 预授权
         * @function bank#preauth
         * @param {Object} [opts={}] 参数
         * @example
         * userId，accountId必填之一
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   userId: 被预授权用户（可选，sso.user.id）
         *   accountId: 被预授权账户(可选，如果不填，取默认帐户),
         *   ctCode: 币种编码(必填)
         *   amount: 数量(必填，allAmount为1时可不填)
         *   allAmount: 转出全部(可选，为1时amount被忽略)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  ctCode: 币种,
         *  amount: 数量,
         *  amountValid: 有效余额,
         *  totalAmount: 总授权数量
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        preauth: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('预授权失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/preauth',
                data: opts
            }, cb);
        },

        /**
         * 预授权取消
         * @function bank#preauthCancel
         * @param {Object} [opts={}] 参数
         * @example
         * userId，accountId必填之一
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   userId: 被预授权用户（可选，sso.user.id）
         *   accountId: 被预授权账户(可选，如果不填，取默认帐户),
         *   ctCode: 币种编码(必填)
         *   amount: 数量(必填，allAmount为1时可不填)
         *   allAmount: 转出全部(可选，为1时amount被忽略)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  ctCode: 币种,
         *  amount: 数量,
         *  amountValid: 有效余额,
         *  totalAmount: 总授权数量
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        preauthCancel: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('取消预授权失败'), ERR.FA_NOAUTH);
            this.delete({
                url: this.uri + '/preauth',
                data: opts
            }, cb);
        },

        /**
         * 预授权列表
         * @function bank#preauthList
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *  token: (可选, 如果不填，自动从storage中取值)
         *  page: 第几页(可选)
         *  rows: 一页显示几行(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        preauthList: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取预授权列表失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/preauth',
                data: opts
            }, cb);
        },

        /**
         * 转账
         * @function bank#transfer
         * @param {Object} [opts={}] 参数
         * @example
         * fromUserId，fromAccountId，toUserId，toAccountId必填之一
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   fromUserId: 转出用户（可选，sso.user.id，如果不填，取当前用户）
         *   fromAccountId: 转出账户(可选，如果不填，取默认帐户),
         *   toUserId: 转入用户（可选，sso.user.id，如果不填，取当前用户）
         *   toAccountId: 转入账户(可选，如果不填，取默认帐户),
         *   ctCode: 币种编码(必填)
         *   amount: 数量(必填，allAmount为1时可不填)
         *   allAmount: 转出全部(可选，为1时amount被忽略)
         *   payId: 支付单号(可选)
         *   attach: 附加信息(可选)
         *   orderId: 商户自编订单号(可选)
         *   memo: 备注信息(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  ctCode: 币种,
         *  amount: 数量
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        transfer: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('转账失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/transfer',
                data: opts
            }, cb);
        },

        /**
         * 兑换
         * @function bank#exchange
         * @param {Object} [opts={}] 参数
         * @example
         * fromUserId,fromAccountId,toUserId,toAccountId都不填默认当前用户默认账户不同币种兑换
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   fromUserId: 转出用户（可选，sso.user.id，如果不填，取当前用户）
         *   fromAccountId: 转出账户(可选，如果不填，取默认帐户),
         *   toUserId: 转入用户（可选，sso.user.id，如果不填，取当前用户）
         *   toAccountId: 转入账户(可选，如果不填，取默认帐户),
         *   fromCTCode: 转出币种编码(必填)
         *   fromAmount: 转出多少(必填)
         *   toCTCode: 转入币种编码(必填)
         *   toAmount: 转入多少(必填)
         *   payId: 支付单号(可选)
         *   attach: 附加信息(可选)
         *   orderId: 商户自编订单号(可选)
         *   memo: 备注信息(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *   fromCTCode: 转出币种编码
         *   fromAmount: 转出多少
         *   toCTCode: 转入币种编码
         *   toAmount: 转入多少
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        exchange: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('兑换失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/exchange',
                data: opts
            }, cb);
        },

        /**
         * 更新账号密码
         * @function bank#updatePasswd
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   passwd: 旧密码（必填）
         *   newPasswd: 新密码(必填),
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        updatePasswd: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('更新密码失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/updatePasswd',
                data: opts
            }, cb);
        },

        /**
         * 重置账号密码
         * @function bank#resetPasswd
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   key: 手机号（必填）
         *   code: 验证码（必填）
         *   passwd: 新密码（必填）
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        resetPasswd: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('重置密码失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/resetPasswd',
                data: opts
            }, cb);
        },

        /**
         * 获取交易历史
         * @function bank#history
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   token: (可选, 如果不填，自动从storage中取值)
         *   userId: 用户id(可选,默认查询所有跟自己相关的交易记录,可传数组).
         *   startDate: 开始时间(可选).
         *   endDate: 结束时间(可选).
         *   ctCode: 币种(可选).
         *   statType: 统计类型(可选,0:按天,1:按月,2:按年).
         *   page: 第几页(可选).
         *   rows: 一页显示几行(可选).
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        history: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取交易历史失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/history',
                data: opts
            }, cb);
        },

        /**
         * 密码是否有效
         * @function bank#isVaildPasswd
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   token: (可选)
         *   userId: 用户id（可选,token不提供为必填）
         *   passwd: 密码（必填）
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  ret:'true|false'
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        isVaildPasswd: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            //if (!opts.token) return cb(new Error('判断cp失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/isVaildPasswd',
                data: opts
            }, cb);
        },

        /**
         * 是否为cp用户
         * @function bank#isCP
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   token: (可选)
         *   userId: 用户id（可选）
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *  ret:'true|false'
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        isCP: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            //if (!opts.token) return cb(new Error('判断cp失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/isCP',
                data: opts
            }, cb);
        },

        /**
         * 币种间兑率
         * @function bank#exchangeRate
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * result参数:{
         *   "cny:tb":10,
         *   "ny:jb":1000,
         *   "dbj:tb":10,
         *   "dbj:jb":10000
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        exchangeRate: function (opts, cb) {
            opts = opts || {};
            cb = cb || function () {};
            //opts.token = opts.token || storage.getItem("token");
            //if (!opts.token) return cb(new Error('获取币种兑率失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/exchangeRate',
                data: opts
            }, cb);
        }
    };

})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    require('jm-config/dist/js/jm-sdk-config');
    jm = require('jm-sdk-core');
}

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    jm = require('jm-sdk-core');
}

(function(){
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'dak';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * 邮件对象
     * @class  dak
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.dak = {
        init: function(opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/dak';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout:opts.timeout||0});
        },

        /**
         * 邮件列表
         * @function dak#listDaks
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   page: 第几页(可选),
         *   rows: 一页几行(可选,默认10),
         *   fields: {status:1},//筛选字段(可选)
         *   appid: 应用id(可选),
         *   type: 邮件类型(可选,默认全部,0:系统,1:用户),
         *   userId: 指定用户id(可选,需要权限,值可为数组或以','间隔的字符串).
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        listDaks: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取邮件列表失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/daks',
                data: opts
            }, cb);
        },

        /**
         * 获取邮件信息
         * @function dak#getDak
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   id: 邮件ID
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        getDak: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取邮件失败'), ERR.FA_NOAUTH);
            if(!opts.id) return cb(new Error('获取邮件失败'), ERR.FAIL);
            this.get({
                url: this.uri + '/daks/'+opts.id,
                data: opts
            }, cb);
        },

        /**
         * 发送邮件
         * @function dak#send
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   appid: 应用id(必填),
         *   userId: 指定用户id(可选,需要权限,值可为数组或以','间隔的字符串).
         *   title: 邮件标题(必填),
         *   content: 邮件内容(必填),
         *   attach: [{     //附件(可选)
         *      id: '唯一ID',//该项为用户背包中道具的唯一ID
         *      prop:'道具ID',//该项只允许具有权限的用户操作
         *      expire:'过期时间',
         *      amount:'数量',
         *   }],
         *   isSys: 是否系统邮件(可选,默认否)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        send: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('发送邮件失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/send',
                data: opts
            }, cb);
        },

        /**
         * 领取附件
         * @function dak#take
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   type: 邮件类型(可选,0:系统,1:用户)
         *   id: 邮件id(可选,值可为数组或以','间隔的字符串),
         *   all: 是否全部(可选,id和all必填之一)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         *   rows:[{
         *     prop:{ _id: 57e5f68aaec31c1ecc1d6336, code: 'paodan', name: '炮弹' },
         *     expire:'过期时间戳',
         *     amount:'数量'
         *   }]
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        take: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('领取附件失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/take',
                data: opts
            }, cb);
        },

        /**
         * 删除邮件
         * @function dak#del
         * @param {Object} [opts={}] 参数
         * @example
         * id,all,read必填之一
         * opts参数:{
         *   type: 邮件类型(可选,0:系统,1:用户)
         *   id: 邮件id(可选,值可为数组或以','间隔的字符串),
         *   read: 是否只删除已读的(可选)
         *   all: 是否全部(可选)
         *   check: 是否检查附件未领(可选,默认false)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        del: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('删除邮件失败'), ERR.FA_NOAUTH);
            this.delete({
                url: this.uri + '/delete',
                data: opts
            }, cb);
        },

        /**
         * 获取未读邮件
         * @function dak#unread
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   type: 邮件类型(可选,0:系统,1:用户)
         *   appid: 应用id(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:{
         *   rows:['id']  //未读的邮件id
         *  }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        unread: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取未读邮件失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/unread',
                data: opts
            }, cb);
        }

    };

})();

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    jm = require('jm-sdk-core');
}

(function(){
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'depot';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * 用户仓库对象
     * @class  depot
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.depot = {
        init: function(opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/depot';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout:opts.timeout||0});
        },

        /**
         * 获取用户道具信息
         * @function depot#listProps
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   page: 第几页(可选),
         *   rows: 一页几行(可选,默认10),
         *   appId: 应用id(可选)
         *   mode: (可选,默认分页方式)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * 结果结构一:{page:'第几页',rows:[{}],total:'总数',pages:'页数}
         * 结果结构二:{(code):{}}//以道具code为键,值为它的具体信息
         * {
         *   _id:'唯一id'
         *   userId:'用户ID',
         *   used: '使用状态',//该值不是必填项,只有useMode=0时才有效(0:未使用,1:使用中)
         *   prop:{ //道具具体信息
         *     logo:'图标地址',
         *     code:'道具编码',
         *     app:'应用id',//该值存在,代表只有在指定应用下才能使用
         *     name:'道具名称',
         *     description:'描述',
         *     type:'类型道具',//(0:礼包,1:虚拟币,2:道具)
         *     useMode:'使用方式',//(0:驻留品,1:消耗品,2:收集品)
         *     isStack:'是否堆叠的'
         *   }
         *   expire:'有效使用时间',
         *   amount:'可用数量'
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        listProps: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取用户道具信息失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/props',
                data: opts
            }, cb);
        },

        /**
         * 获取指定道具信息
         * @function depot#getProp
         * @param {Object} [opts={}] 参数
         * @example
         * id|propId|propCode必填之一
         * opts参数:{
         *   id: 唯一id(可选),
         *   propId: 道具id(可选),
         *   propCode: 道具编码(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         *   _id:'唯一id'
         *   userId:'用户ID',
         *   used: '使用状态',//该值不是必填项,只有useMode=0时才有效(0:未使用,1:使用中)
         *   prop:{ //道具具体信息
         *     logo:'图标地址',
         *     code:'道具编码',
         *     app:'应用id',//该值存在,代表只有在指定应用下才能使用
         *     name:'道具名称',
         *     description:'描述',
         *     type:'类型道具',//(0:礼包,1:虚拟币,2:道具)
         *     useMode:'使用方式',//(0:驻留品,1:消耗品,2:收集品)
         *     isStack:'是否堆叠的'
         *   }
         *   expire:'有效使用时间',
         *   amount:'可用数量'
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        getProp: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('获取指定道具信息失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/prop',
                data: opts
            }, cb);
        },

        /**
         * 给予某用户道具
         * @function depot#giveProp
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   userId: 用户id(必填),
         *   prop: 道具id(可选,prop|ary必填之一),
         *   amount: 数量(可选,默认1),
         *   expire: 失效时间戳(可选,默认不失效,单位:毫秒)
         *   ary: 数组对象(可选,如该项提供优先采用;prop,amount,expire将不起作用,格式:[{prop:'id',amount:'数量',expire:''}]).
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        giveProp: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('给予某用户道具失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/props',
                data: opts
            }, cb);
        },

        /**
         * 使用道具
         * @function depot#useProp
         * @param {Object} [opts={}] 参数
         * @example
         * id|propId|propCode必填之一
         * opts参数:{
         *   id: 唯一id(可选),
         *   propId: 道具id(可选),
         *   propCode: 道具编码(可选)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        useProp: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('使用道具失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/useProp',
                data: opts
            }, cb);
        },

        /**
         * 销毁单个道具
         * @function depot#delProp
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   id: 唯一id(必填),
         *   amount: 指定数量(可选,默认全部)
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        delProp: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('销毁道具失败'), ERR.FA_NOAUTH);
            this.delete({
                url: this.uri + '/prop',
                data: opts
            }, cb);
        },

        /**
         * 提取用户道具
         * @function depot#takeProp
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   userId: 用户id(必填),
         *   id: 唯一id(可选,id|ary必填之一),
         *   amount: 数量(可选,默认1),
         *   ary: 数组对象(可选,如该项提供优先采用;id,amount将不起作用,格式:[{id:'id',amount:'数量'}]).
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        takeProp: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('提取用户道具失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/take',
                data: opts
            }, cb);
        }
    };

})();

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    jm = require('jm-sdk-core');
}

(function(){
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'pay';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * 支付对象
     * @class  pay
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.pay = {
        init: function(opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/pay';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout:opts.timeout||0});
        },

        /**
         * 预请求支付，生成支付凭据
         * @function pay#prepay
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   "way": 支付平台(必填)//['platform','swiftpass','pingxx'].
         *   "channel": 支付方式(可选)//默认为'platform',根据way有所不同.
         *   "title": 商品的标题(必填)//该参数最长为 32 个 Unicode 字符.
         *   "content": 商品的描述信息(必填)//该参数最长为 128 个 Unicode 字符.
         *   "amount": 金额(必填)//整数，单位分.
         *   "currency": 货币种类(必填)//['cny','tb']
         *   "orderId": 订单id(必填)//由商城产生或其它途径产生,根据type有所不同.
         *   "note": 附加描述(可选)
         *   "succeeded": 成功回调地址,用于后端(可选,支付成功后对后期处理)
         *   "successURL": 成功回调地址,用于前端(可选|必填,不同渠道会有不同)
         *   "attach": {   //附加数据(可选)
         *      userId: 用户id //向谁支付
         *   }
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         */
        prepay: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('预请求支付失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/pays',
                data: opts
            }, cb);
        },

        /**
         * 请求退款
         * @function pay#refund
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   "payid": 支付id(必填).
         *   "amount": 金额(必填)//整数，单位分.
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         */
        refund: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            if (!opts.token) return cb(new Error('请求退款失败'), ERR.FA_NOAUTH);
            this.post({
                url: this.uri + '/refund',
                data: opts
            }, cb);
        }
    };

    sdk.enableAjax(sdk.pay);
})();

var jm = jm || {};
if((typeof exports !== 'undefined' && typeof module !== 'undefined')){
    jm = require('jm-sdk-core');
}

(function(){
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;

    sdk.on('init', function (opts) {
        var model = 'record';
        opts[model] = opts[model] || {};
        opts[model].uri = opts[model].uri || opts.uri;
        opts[model].timeout = opts[model].timeout || opts.timeout;
        sdk[model].init(opts[model]);
    });

    /**
     * 记录对象
     * @class  record
     * @param {Object} opts 配置属性
     * 格式:{uri:'网络地址'}
     */
    sdk.record = {
        init: function(opts) {
            opts = opts || {};
            var uri = opts.uri;
            var prefix = opts.prefix || '/record';
            this.uri = uri + prefix;
            jm.enableEvent(this);
            sdk.enableAjax(this,{timeout:opts.timeout||0});
        },

        /**
         * 统计
         * @function record#stat
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   type: 记录类型(必填).
         *   content: 内容(可选)
         *   userId: 用户id(可选,值可为数组或以','间隔的字符串).
         *   startDate: 开始时间(可选).
         *   endDate: 结束时间(可选).
         *   statType: 统计类型(可选,0:按天,1:按月,2:按年)
         *   unique: 唯一字段(可选,如:{crtime:1,content:1})
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         *   rows:[{
         *   }]
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        stat: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            // if (!opts.token) return cb(new Error('统计失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/stat',
                data: opts
            }, cb);
        },

        /**
         * 获取之最一条记录
         * @function record#most
         * @param {Object} [opts={}] 参数
         * @example
         * opts参数:{
         *   type: 记录类型(必填).
         *   content: 内容(可选)
         *   userId: 用户id(可选,值可为数组或以','间隔的字符串).
         *   startDate: 开始时间(可选).
         *   endDate: 结束时间(可选).
         * }
         * @param {callback} [cb=function(err,result){}] 回调
         * @example
         * cb参数格式:
         * result参数:
         * {
         * }
         * err参数:{
         *  err: 错误码,
         *  msg: 错误信息
         * }
         */
        most: function(opts, cb) {
            var self = this;
            opts = opts || {};
            cb = cb || function () {};
            opts.token = opts.token || storage.getItem("token");
            // if (!opts.token) return cb(new Error('获取失败'), ERR.FA_NOAUTH);
            this.get({
                url: this.uri + '/most',
                data: opts
            }, cb);
        }

    };

})();

var jm = jm || {};
if ((typeof exports !== 'undefined' && typeof module !== 'undefined')) {
    require('jm-sso/dist/js/jm-sdk-sso');
    jm = require('jm-sdk-core');
}

(function () {
    var sdk = jm.sdk;
    var storage = sdk.storage;
    var ERR = sdk.consts.ERR;
    var sso = sdk.sso;

    /**
     * 获取验证码
     * @function sso#verifyCode
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  mobile:'手机号(必填)'
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     *  time:'验证码过期时间'
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.verifyCode = function (opts, cb) {
        cb = cb || function () {};
        this.get({
                url: this.uri + '/verifycode',
                data: opts
            },
            cb
        );
    };

    /**
     * 重置密码
     * @function sso#resetPasswd
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  key:'手机号(必填)',
     *  code:'验证码(必填)',
     *  passwd:'密码(必填)'
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.resetPasswd = function (opts, cb) {
        cb = cb || function () {};
        var self = this;
        this.post({
            url: this.uri + '/resetPasswd',
            data: opts
        }, cb);
    };


    /**
     * 绑定手机号
     * @function sso#bindMobile
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  code:'验证码(必填)',
     *  mobile:'手机号(必填)'
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.bindMobile = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        if (!opts.token) return cb(new Error('绑定手机号失败'), ERR.FA_NOAUTH);
        this.post({
            url: this.uri + '/bindMobile',
            data: opts
        }, cb);
    };

    /**
     * 获取用户列表
     * @function sso#getUsers
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  page: '第几页',
     *  rows: '一页几行',
     *  ids:['ObjectId'],
     *  keyword: '模糊查询关键字',
     *  fields: {}, //过滤字段
     *  sort: {} //按什么排序
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     *  rows:[]
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.getUsers = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        if (!opts.token) return cb(new Error('获取用户列表失败'), ERR.FA_NOAUTH);
        this.get({
                url: this.uri + '/users',
                data: opts
            },
            cb
        );
    };

    /**
     * 获取单个用户信息
     * @function sso#findUser
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  id: 'id',//(可选)
     *  account: '账户',//(可选)
     *  mobile: '手机号'//(可选)
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.findUser = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        //if (!opts.token) return cb(new Error('查找用户失败'), ERR.FA_NOAUTH);
        this.get({
                url: this.uri + '/findUser',
                data: opts
            },
            cb
        );
    };

    /**
     * 判断是否登录
     * @function sso#isSignon
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  token: '令牌',//(必填)
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     *  ret:true|false
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.isSignon = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        this.get({
                url: this.uri + '/isSignon',
                data: opts
            },
            cb
        );
    };

    /**
     * 是否开启效验码
     * @function sso#isCheckCode
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  token: '令牌',//(可选)
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     *  ret:true|false
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.isCheckCode = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        this.get({
                url: this.uri + '/isCheckCode',
                data: opts
            },
            cb
        );
    };

    /**
     * 是否开启游客登录
     * @function sso#isCheckCode
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  token: '令牌',//(可选)
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     *  ret:true|false
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.isGuest = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        // opts.token = opts.token || storage.getItem("token");
        this.get({
                url: this.uri + '/isGuest',
                data: opts
            },
            cb
        );
    };

    /**
     * 移除指定用户
     * @function sso#removeUsers
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  id: ['用户ObjectId'],//(必填)
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.removeUsers = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        if (!opts.token) return cb(new Error('删除用户失败'), ERR.FA_NOAUTH);
        this.delete({
                url: this.uri + '/users',
                data: opts
            },
            cb
        );
    };

    /**
     * 创建用户
     * @function sso#createUser
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  token: token(可选, 如果不填,自动从localStorage获取),
     *  passwd: 密码(可选),
     *  account: 账号(可选),
     *  mobile: 手机号(可选),
     *  email: 邮箱(可选),
     *  nick: 昵称(可选),
     *  gender: 性别(可选),
     *  country: 国家(可选),
     *  province: 省份(可选),
     *  city: 城市(可选),
     *  area: 地区(可选),
     *  birthday: 生日(可选),
     *  signature: 签名(可选),
     *  headimgurl: 头像(可选)
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.createUser = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        if (!opts.token) return cb(new Error('创建用户失败'), ERR.FA_NOAUTH);
        this.post({
                url: this.uri + '/users',
                data: opts
            },
            cb
        );
    };

    /**
     * 更新用户信息
     * @function sso#updateUser
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  token: token(可选, 如果不填,自动从localStorage获取),
     *  userId: 指定用户OjbectId(可选,需要当前操作用户有相应权限)
     *  account: 账号(可选),
     *  mobile: 手机号(可选),
     *  email: 邮箱(可选),
     *  nick: 昵称(可选),
     *  gender: 性别(可选),
     *  country: 国家(可选),
     *  province: 省份(可选),
     *  city: 城市(可选),
     *  area: 地区(可选),
     *  birthday: 生日(可选),
     *  signature: 签名(可选),
     *  headimgurl: 头像(可选)
     * }
     * @param {callback} [cb=function(err, doc){}] 回调
     * @example
     * cb参数格式:
     * 成功, doc参数:{
     * }
     * 失败, doc参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.updateUser = function (opts, cb) {
        var self = this;
        cb = cb || function () {};
        opts = opts || {};
        var token = opts.token || storage.getItem('token');
        if (!token) return cb(new Error('更新用户信息失败'), ERR.FA_NOAUTH);
        opts.token = token;
        var p = '/user';
        if(opts.userId){
            p = '/users/'+opts.userId;
        }
        this.post({
                url: this.uri + p,
                data: opts
            }, cb
        );
    };

    /**
     * 排名
     * @function sso#ranking
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  page:'第几页',
     *  rows:'一页几行',
     *  sort:'排名规则'
     * }
     * sort例子:
     * sort:{
     * 'record.jb':-1,
     * 'record.cny':-1,
     * 'record.tb':-1,
     * 'record.dbj':-1,
     * }
     * 注:-1代表降序,1代表升序,可组合
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     *  rows:[{}],
     *  me:'自己排名信息'
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.ranking = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        opts.token = opts.token || storage.getItem("token");
        this.get({
                url: this.uri + '/ranking',
                data: opts
            },
            cb
        );
    };

    /**
     * 获取用户信息
     * @function sso#getUser
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
         * }
     * @param {callback} [cb=function(err, doc){}] 回调
     * @example
     * cb参数格式:
     * 成功时,doc参数:{
     *   id: 用户ObjectId,
     *   uid: 用户id,
     *   nick: 昵称,
     *   gender: 性别,
     *   province: 省份,
     *   city: 城市,
     *   headimgurl: 头像地址,
     *   signature: 签名
     * }
     * 失败时,doc参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.getUser= function (opts, cb) {
        var self = this;
        cb = cb || function () {};
        opts = opts || {};
        var token = opts.token || storage.getItem('token');
        if (!token) return cb(new Error('获取用户信息失败'), ERR.FA_NOAUTH);
        this.get({
                url: this.uri + '/user',
                data: {token: token}
            },
            function (err, doc) {
                if(!err && doc && doc.id){
                    self.user = {
                        token: token
                    };
                    for (var key in doc) {
                        self.user[key] = doc[key];
                    }
                    self.user.nick||(self.user.nick='');
                    doc = self.user;
                }else{
                    err = new Error('获取用户信息失败');
                }
                cb(err, doc);
                self.emit('getUser', err, doc);
            }
        );
    };

    /**
     * 检测用户是否存在
     * @function sso#checkUser
     * @param {Object} [opts={}] 参数
     * @example
     * opts参数:{
     *  any: '检测信息',//(必填)
     * }
     * @param {callback} [cb=function(err,result){}] 回调
     * @example
     * cb参数格式:
     * result参数:{
     *  ret:true|false
     * }
     * err参数:{
     *    'err': '错误码',
     *    'msg': '错误信息'
     * }
     */
    sso.checkUser = function (opts, cb) {
        opts = opts || {};
        cb = cb || function () {};
        // opts.token = opts.token || storage.getItem("token");
        this.get({
                url: this.uri + '/checkUser',
                data: opts
            },
            cb
        );
    };

})();
