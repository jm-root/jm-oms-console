var isNodeJS = (typeof exports !== 'undefined' && typeof module !== 'undefined');
var jm = jm || {};
if(isNodeJS){
    jm = require('./root.js');
}

var EventEmitter = {
    __events: {},

    __createListener: function(fn, caller) {
        caller = caller || this;
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
        if (!this.__events[name]) {
            this.__events[name] = listener;
        } else if (Array.isArray(this.__events[name])) {
            this.__events[name].push(listener);
        } else {
            this.__events[name] = [this.__events[name], listener];
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

        function on () {
            self.removeListener(name, on);
            fn.apply(listener.caller, arguments);
        }

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
        if (this.__events && this.__events[name]) {
            var list = this.__events[name];

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
                    delete this.__events[name];
                }
            } else if (this.__equalsListener(list, listener) || (list.listener && this.__equalsListener(list.listener, listener))) {
                delete this.__events[name];
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
            this.__events = {};
            return this;
        }

        if (this.__events && this.__events[name]) {
            this.__events[name] = null;
        }

        return this;
    },

    /**
     * Gets all listeners for a certain event.
     *
     * @api publci
     */

    listeners: function (name) {
        if (!this.__events[name]) {
            this.__events[name] = [];
        }

        if (!Array.isArray(this.__events[name])) {
            this.__events[name] = [this.__events[name]];
        }

        return this.__events[name];
    },

    /**
     * Emits an event.
     *
     * @api public
     */

    emit: function (name) {
        var handler = this.__events[name];

        if (!handler) {
            return false;
        }

        var args = Array.prototype.slice.call(arguments, 1);

        if(typeof handler === 'object' && !Array.isArray(handler)){
            handler.fn.apply(handler.caller, args);
        } else if (Array.isArray(handler)) {
            var listeners = handler.slice();

            for (var i = 0, l = listeners.length; i < l; i++) {
                var h = listeners[i];
                if(h.fn.apply(h.caller, args) === false) break;
            }
        } else {
            return false;
        }

        return true;
    }   
};

jm.enableEvent = function(obj) {
    if(obj.__events!==undefined) return;
    for(var key in EventEmitter){
        obj[key] = EventEmitter[key];
    }
    obj.__events = {};
};

jm.disableEvent = function(obj) {
    for(var key in EventEmitter){
        delete obj[key];
    }
};

