/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

// Like Jbone library

var dom = __webpack_require__(7);

module.exports = dom;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var mvc = __webpack_require__(3);

/**
 * @constructor
 * @extend Backbone View
 */
var BaseView = mvc.View.extend({
    /**
     * Parameters for 'renderAfterFetch' method
     * template {String} - template name
     * url {String} - data url
     */
    template: null,
    url: null,

    /**
     * Rendered flag
     */
    _rendered: false,

    /**
     * Return DoT template by template name or only template name
     * @param {String} templateName
     * @param {*} data
     * @returns {String}
     */
    tmpl: function (templateName, data) {
        var template = __webpack_require__(48)("./" + templateName + '.dot');

        return template.call({
            tmpl: this.tmpl
        }, data);
    },

    /**
     * Get data from url and after it render template with received data
     *
     * @returns {Promise}
     */
    renderAfterFetch: function () {
        this._rendered = false;

        // Show loading (spinner maybe)
        this.showLoadingContent();

        /**
         * Fetch, transform data to object, render
         */
        return window.fetch(this.url)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                this.$el.html(this.tmpl(this.template, data));

                this.trigger('rendered');
                this._rendered = true;
            }.bind(this));
    },

    /**
     * Render loading content
     */
    showLoadingContent: function () {
        this.$el.html('<span class="loading">Loading</span>');
    }
});

module.exports = BaseView;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var BaseView = __webpack_require__(1);
var dom = __webpack_require__(0);

var $pageContainer = dom('.page-container');

/**
 * @constructor
 * @extends {BaseView}
 */
var PageView = BaseView.extend({
    /**
     * Mounted flag
     */
    _mounted: false,

    /**
     * Section above window event handlers
     */
    events: {
        'aboveWindow .fn-section': 'handleSectionVisibleEvent'
    },

    /**
     * @constructor
     */
    initialize: function () {
        BaseView.prototype.initialize.apply(this, arguments);

        this.renderAfterFetch();

        this.undelegateEvents();

        this.listenToOnce(this, 'mounted', this._setScrollOptions.bind(this));
    },

    /**
     * Section visible event listener
     */
    handleSectionVisibleEvent: function () {},

    /**
     * Appending page element to page container
     */
    append: function () {
        $pageContainer.append(this.el);

        this.delegateEvents();

        this._triggerMountedEventIfNeed();
    },

    /**
     * @override
     */
    remove: function () {
        BaseView.prototype.remove.apply(this, arguments);

        this.undelegateEvents();
    },

    /**
     * Install viewed sections and relative events
     * @private
     */
    _setScrollOptions: function () {
        this.viewedSections = this.$('.fn-section').get();

        this._toggleScrollEvents(true);

        this.handleViewedSectionsPosition();
    },

    /**
     * Trigger mounted event if view already was rendered, else - handle render event
     * @private
     */
    _triggerMountedEventIfNeed: function () {
        this._rendered ? this._triggerMountedEvent() : this.listenToOnce(this, 'rendered', this._triggerMountedEvent.bind(this));
    },

    /**
     * Install mounted flag to true, fire event
     * @private
     */
    _triggerMountedEvent: function () {
        this._mounted = true;

        this.trigger('mounted');
    },

    /**
     * @override
     */
    delegateEvents: function () {
        BaseView.prototype.delegateEvents.apply(this, arguments);

        this._toggleScrollEvents(true);
    },

    /**
     * @override
     */
    undelegateEvents: function () {
        BaseView.prototype.undelegateEvents.apply(this, arguments);

        this._toggleScrollEvents(false);
    },

    /**
     * Add window scroll event handlers if view was mounted and there are viewed sections
     * @param flag {Boolean} - off or on events handlers
     * @private
     */
    _toggleScrollEvents: function (flag) {
        if (this._mounted && this.viewedSections.length) {
            dom(window)[flag ? 'on' : 'off']('scroll' + '.scroll' + this.cid, this.handleViewedSectionsPosition.bind(this));
        }
    },

    /**
     * Check all viewed sections, if positions is matched trigger above window event and remove element from viewed sections
     */
    handleViewedSectionsPosition: function () {
        var $sections = this.viewedSections;
        var viewedElems = [];

        $sections.forEach(function (el) {
            var windowHeight = window.innerHeight;
            var elemPositionY = el.getBoundingClientRect().top;

            if (elemPositionY > 0 && elemPositionY < windowHeight) {
                dom(el).trigger('aboveWindow');

                viewedElems.push(el);
            }
        }, this);

        viewedElems.forEach(function (el) {
            $sections.splice($sections.indexOf(el), 1);
        }, this);
    }
});

module.exports = PageView;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Like backbone library

var mvc = __webpack_require__(45);

module.exports = mvc;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var BaseView = __webpack_require__(1);

/**
 * @constructor
 * @extends {BaseView}
 */
var BaseProgressBar = BaseView.extend({
    /**
     * Innter template for progress view
     */
    template: '',

    /**
     * Default options for progress (color, width and so on)
     */
    defaultOptions: {},

    /**
     * @param options {Object}
     */
    initialize: function (options) {
        this.setElement(options.el);
        this.setOptions();
        this.render();
        this.setElements();
        this.setElementsView();
    },

    /**
     * Install options from default options and element dataset
     */
    setOptions: function () {
        var data = this.$el.get(0).dataset;

        this.options = {};

        Object.keys(this.defaultOptions).forEach(function (key) {
            this.options[key] = data[key] || this.defaultOptions[key];
        }, this);
    },

    /**
     * @override
     */
    render: function () {
        this.$el.html(this.template);
    },

    /**
     * Set help dom elements
     */
    setElements: function () {},

    /**
     * Set default elements view
     */
    setElementsView: function () {},

    /**
     * Start progress animation
     */
    start: function () {}
});

module.exports = BaseProgressBar;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/font-awesome//fontawesome-webfont.eot?32400f4e08932a94d8bfd2422702c446";

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var dom = __webpack_require__(0);
var MainHeader = __webpack_require__(44);
var MainFooter = __webpack_require__(55);

/**
 * Layout manager constructor
 *
 * Add layout elements to html
 *
 * @constructor
 */
var LayoutManager = function () {
    var elems = this.elements;

    dom('.fn-main-header').append(elems.mainHeader.el);
    dom('.fn-main-footer').append(elems.mainFooter.el);
};

LayoutManager.prototype = {
    /**
     * Layout elements links
     */
    elements: {
        mainHeader: new MainHeader(),
        mainFooter: new MainFooter()
    },

    /**
     * Update main header nav by path
     * @param path {String} - history pathname
     */
    updateMainNav: function (path) {
        this.elements.mainHeader.updateNav(path);
    }
};

module.exports = new LayoutManager();


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jBone v1.2.0 - 2016-04-13 - Library for DOM manipulation
 *
 * http://jbone.js.org
 *
 * Copyright 2016 Alexey Kupriyanenko
 * Released under the MIT license.
 */

(function (win) {

var
// cache previous versions
_$ = win.$,
_jBone = win.jBone,

// Quick match a standalone tag
rquickSingleTag = /^<(\w+)\s*\/?>$/,

// A simple way to check for HTML strings
// Prioritize #id over <tag> to avoid XSS via location.hash
rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

// Alias for function
slice = [].slice,
splice = [].splice,
keys = Object.keys,

// Alias for global variables
doc = document,

isString = function(el) {
    return typeof el === "string";
},
isObject = function(el) {
    return el instanceof Object;
},
isFunction = function(el) {
    return ({}).toString.call(el) === "[object Function]";
},
isArray = function(el) {
    return Array.isArray(el);
},
jBone = function(element, data) {
    return new fn.init(element, data);
},
fn;

// set previous values and return the instance upon calling the no-conflict mode
jBone.noConflict = function() {
    win.$ = _$;
    win.jBone = _jBone;

    return jBone;
};

fn = jBone.fn = jBone.prototype = {
    init: function(element, data) {
        var elements, tag, wraper, fragment;

        if (!element) {
            return this;
        }
        if (isString(element)) {
            // Create single DOM element
            if (tag = rquickSingleTag.exec(element)) {
                this[0] = doc.createElement(tag[1]);
                this.length = 1;

                if (isObject(data)) {
                    this.attr(data);
                }

                return this;
            }
            // Create DOM collection
            if ((tag = rquickExpr.exec(element)) && tag[1]) {
                fragment = doc.createDocumentFragment();
                wraper = doc.createElement("div");
                wraper.innerHTML = element;
                while (wraper.lastChild) {
                    fragment.appendChild(wraper.firstChild);
                }
                elements = slice.call(fragment.childNodes);

                return jBone.merge(this, elements);
            }
            // Find DOM elements with querySelectorAll
            if (jBone.isElement(data)) {
                return jBone(data).find(element);
            }

            try {
                elements = doc.querySelectorAll(element);

                return jBone.merge(this, elements);
            } catch (e) {
                return this;
            }
        }
        // Wrap DOMElement
        if (element.nodeType) {
            this[0] = element;
            this.length = 1;

            return this;
        }
        // Run function
        if (isFunction(element)) {
            return element();
        }
        // Return jBone element as is
        if (element instanceof jBone) {
            return element;
        }

        // Return element wrapped by jBone
        return jBone.makeArray(element, this);
    },

    pop: [].pop,
    push: [].push,
    reverse: [].reverse,
    shift: [].shift,
    sort: [].sort,
    splice: [].splice,
    slice: [].slice,
    indexOf: [].indexOf,
    forEach: [].forEach,
    unshift: [].unshift,
    concat: [].concat,
    join: [].join,
    every: [].every,
    some: [].some,
    filter: [].filter,
    map: [].map,
    reduce: [].reduce,
    reduceRight: [].reduceRight,
    length: 0
};

fn.constructor = jBone;

fn.init.prototype = fn;

jBone.setId = function(el) {
    var jid = el.jid;

    if (el === win) {
        jid = "window";
    } else if (el.jid === undefined) {
        el.jid = jid = ++jBone._cache.jid;
    }

    if (!jBone._cache.events[jid]) {
        jBone._cache.events[jid] = {};
    }
};

jBone.getData = function(el) {
    el = el instanceof jBone ? el[0] : el;

    var jid = el === win ? "window" : el.jid;

    return {
        jid: jid,
        events: jBone._cache.events[jid]
    };
};

jBone.isElement = function(el) {
    return el && el instanceof jBone || el instanceof HTMLElement || isString(el);
};

jBone._cache = {
    events: {},
    jid: 0
};

function isArraylike(obj) {
    var length = obj.length,
        type = typeof obj;

    if (isFunction(type) || obj === win) {
        return false;
    }

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return isArray(type) || length === 0 ||
        typeof length === "number" && length > 0 && (length - 1) in obj;
}

fn.pushStack = function(elems) {
    var ret = jBone.merge(this.constructor(), elems);

    return ret;
};

jBone.merge = function(first, second) {
    var l = second.length,
        i = first.length,
        j = 0;

    while (j < l) {
        first[i++] = second[j++];
    }

    first.length = i;

    return first;
};

jBone.contains = function(container, contained) {
    return container.contains(contained);
};

jBone.extend = function(target) {
    var tg;

    splice.call(arguments, 1).forEach(function(source) {
        tg = target; //caching target for perf improvement

        if (source) {
            for (var prop in source) {
                tg[prop] = source[prop];
            }
        }
    });

    return target;
};

jBone.makeArray = function(arr, results) {
    var ret = results || [];

    if (arr !== null) {
        if (isArraylike(arr)) {
            jBone.merge(ret, isString(arr) ? [arr] : arr);
        } else {
            ret.push(arr);
        }
    }

    return ret;
};

jBone.unique = function(array) {
    if (array == null) {
        return [];
    }

    var result = [];

    for (var i = 0, length = array.length; i < length; i++) {
        var value = array[i];
        if (result.indexOf(value) < 0) {
            result.push(value);
        }
    }
    return result;
};

function BoneEvent(e, data) {
    var key, setter;

    this.originalEvent = e;

    setter = function(key, e) {
        if (key === "preventDefault") {
            this[key] = function() {
                this.defaultPrevented = true;
                return e[key]();
            };
        } else if (key === "stopImmediatePropagation") {
            this[key] = function() {
                this.immediatePropagationStopped = true;
                return e[key]();
            };
        } else if (isFunction(e[key])) {
            this[key] = function() {
                return e[key]();
            };
        } else {
            this[key] = e[key];
        }
    };

    for (key in e) {
        if (e[key] || typeof e[key] === "function") {
            setter.call(this, key, e);
        }
    }

    jBone.extend(this, data, {
        isImmediatePropagationStopped: function() {
            return !!this.immediatePropagationStopped;
        }
    });
}

jBone.Event = function(event, data) {
    var namespace, eventType;

    if (event.type && !data) {
        data = event;
        event = event.type;
    }

    namespace = event.split(".").splice(1).join(".");
    eventType = event.split(".")[0];

    event = doc.createEvent("Event");
    event.initEvent(eventType, true, true);

    return jBone.extend(event, {
        namespace: namespace,
        isDefaultPrevented: function() {
            return event.defaultPrevented;
        }
    }, data);
};

jBone.event = {

    /**
     * Attach a handler to an event for the elements
     * @param {Node}        el         - Events will be attached to this DOM Node
     * @param {String}      types      - One or more space-separated event types and optional namespaces
     * @param {Function}    handler    - A function to execute when the event is triggered
     * @param {Object}      [data]     - Data to be passed to the handler in event.data
     * @param {String}      [selector] - A selector string to filter the descendants of the selected elements
     */
    add: function(el, types, handler, data, selector) {
        jBone.setId(el);

        var eventHandler = function(e) {
                jBone.event.dispatch.call(el, e);
            },
            events = jBone.getData(el).events,
            eventType, t, event;

        types = types.split(" ");
        t = types.length;
        while (t--) {
            event = types[t];

            eventType = event.split(".")[0];
            events[eventType] = events[eventType] || [];

            if (events[eventType].length) {
                // override with previous event handler
                eventHandler = events[eventType][0].fn;
            } else {
                el.addEventListener && el.addEventListener(eventType, eventHandler, false);
            }

            events[eventType].push({
                namespace: event.split(".").splice(1).join("."),
                fn: eventHandler,
                selector: selector,
                data: data,
                originfn: handler
            });
        }
    },

    /**
     * Remove an event handler
     * @param  {Node}       el        - Events will be deattached from this DOM Node
     * @param  {String}     types     - One or more space-separated event types and optional namespaces
     * @param  {Function}   handler   - A handler function previously attached for the event(s)
     * @param  {String}     [selector] - A selector string to filter the descendants of the selected elements
     */
    remove: function(el, types, handler, selector) {
        var removeListener = function(events, eventType, index, el, e) {
                var callback;

                // get callback
                if ((handler && e.originfn === handler) || !handler) {
                    callback = e.fn;
                }

                if (events[eventType][index].fn === callback) {
                    // remove handler from cache
                    events[eventType].splice(index, 1);

                    if (!events[eventType].length) {
                        el.removeEventListener(eventType, callback);
                    }
                }
            },
            events = jBone.getData(el).events,
            l,
            eventsByType;

        if (!events) {
            return;
        }

        // remove all events
        if (!types && events) {
            return keys(events).forEach(function(eventType) {
                eventsByType = events[eventType];
                l = eventsByType.length;

                while(l--) {
                    removeListener(events, eventType, l, el, eventsByType[l]);
                }
            });
        }

        types.split(" ").forEach(function(eventName) {
            var eventType = eventName.split(".")[0],
                namespace = eventName.split(".").splice(1).join("."),
                e;

            // remove named events
            if (events[eventType]) {
                eventsByType = events[eventType];
                l = eventsByType.length;

                while(l--) {
                    e = eventsByType[l];
                    if ((!namespace || (namespace && e.namespace === namespace)) &&
                        (!selector  || (selector  && e.selector === selector))) {
                        removeListener(events, eventType, l, el, e);
                    }
                }
            }
            // remove all namespaced events
            else if (namespace) {
                keys(events).forEach(function(eventType) {
                    eventsByType = events[eventType];
                    l = eventsByType.length;

                    while(l--) {
                        e = eventsByType[l];
                        if (e.namespace.split(".")[0] === namespace.split(".")[0]) {
                            removeListener(events, eventType, l, el, e);
                        }
                    }
                });
            }
        });
    },

    /**
     * Execute all handlers and behaviors attached to the matched elements for the given event type.
     * @param  {Node}       el       - Events will be triggered for thie DOM Node
     * @param  {String}     event    - One or more space-separated event types and optional namespaces
     */
    trigger: function(el, event) {
        var events = [];

        if (isString(event)) {
            events = event.split(" ").map(function(event) {
                return jBone.Event(event);
            });
        } else {
            event = event instanceof Event ? event : jBone.Event(event);
            events = [event];
        }

        events.forEach(function(event) {
            if (!event.type) {
                return;
            }

            el.dispatchEvent && el.dispatchEvent(event);
        });
    },

    dispatch: function(e) {
        var i = 0,
            j = 0,
            el = this,
            handlers = jBone.getData(el).events[e.type],
            length = handlers.length,
            handlerQueue = [],
            targets = [],
            l,
            expectedTarget,
            handler,
            event,
            eventOptions;

        // cache all events handlers, fix issue with multiple handlers (issue #45)
        for (; i < length; i++) {
            handlerQueue.push(handlers[i]);
        }

        i = 0;
        length = handlerQueue.length;

        for (;
            // if event exists
            i < length &&
            // if handler is not removed from stack
            ~handlers.indexOf(handlerQueue[i]) &&
            // if propagation is not stopped
            !(event && event.isImmediatePropagationStopped());
        i++) {
            expectedTarget = null;
            eventOptions = {};
            handler = handlerQueue[i];
            handler.data && (eventOptions.data = handler.data);

            // event handler without selector
            if (!handler.selector) {
                event = new BoneEvent(e, eventOptions);

                if (!(e.namespace && e.namespace !== handler.namespace)) {
                    handler.originfn.call(el, event);
                }
            }
            // event handler with selector
            else if (
                // if target and selected element the same
                ~(targets = jBone(el).find(handler.selector)).indexOf(e.target) && (expectedTarget = e.target) ||
                // if one of element matched with selector contains target
                (el !== e.target && el.contains(e.target))
            ) {
                // get element matched with selector
                if (!expectedTarget) {
                    l = targets.length;
                    j = 0;

                    for (; j < l; j++) {
                        if (targets[j] && targets[j].contains(e.target)) {
                            expectedTarget = targets[j];
                        }
                    }
                }

                if (!expectedTarget) {
                    continue;
                }

                eventOptions.currentTarget = expectedTarget;
                event = new BoneEvent(e, eventOptions);

                if (!(e.namespace && e.namespace !== handler.namespace)) {
                    handler.originfn.call(expectedTarget, event);
                }
            }
        }
    }
};

fn.on = function(types, selector, data, fn) {
    var length = this.length,
        i = 0;

    if (data == null && fn == null) {
        // (types, fn)
        fn = selector;
        data = selector = undefined;
    } else if (fn == null) {
        if (typeof selector === "string") {
            // (types, selector, fn)
            fn = data;
            data = undefined;
        } else {
            // (types, data, fn)
            fn = data;
            data = selector;
            selector = undefined;
        }
    }

    if (!fn) {
        return this;
    }

    for (; i < length; i++) {
        jBone.event.add(this[i], types, fn, data, selector);
    }

    return this;
};

fn.one = function(event) {
    var args = arguments,
        i = 0,
        length = this.length,
        oneArgs = slice.call(args, 1, args.length - 1),
        callback = slice.call(args, -1)[0],
        addListener;

    addListener = function(el) {
        var $el = jBone(el);

        event.split(" ").forEach(function(event) {
            var fn = function(e) {
                $el.off(event, fn);
                callback.call(el, e);
            };

            $el.on.apply($el, [event].concat(oneArgs, fn));
        });
    };

    for (; i < length; i++) {
        addListener(this[i]);
    }

    return this;
};

fn.trigger = function(event) {
    var i = 0,
        length = this.length;

    if (!event) {
        return this;
    }

    for (; i < length; i++) {
        jBone.event.trigger(this[i], event);
    }

    return this;
};

fn.off = function(types, selector, handler) {
    var i = 0,
        length = this.length;

    if (isFunction(selector)) {
        handler = selector;
        selector = undefined;
    }

    for (; i < length; i++) {
        jBone.event.remove(this[i], types, handler, selector);
    }

    return this;
};

fn.find = function(selector) {
    var results = [],
        i = 0,
        length = this.length,
        finder = function(el) {
            if (isFunction(el.querySelectorAll)) {
                [].forEach.call(el.querySelectorAll(selector), function(found) {
                    results.push(found);
                });
            }
        };

    for (; i < length; i++) {
        finder(this[i]);
    }

    return jBone(results);
};

fn.get = function(index) {
    return index != null ?

        // Return just one element from the set
        (index < 0 ? this[index + this.length] : this[index]) :

        // Return all the elements in a clean array
        slice.call(this);
};

fn.eq = function(index) {
    return jBone(this[index]);
};

fn.parent = function() {
    var results = [],
        parent,
        i = 0,
        length = this.length;

    for (; i < length; i++) {
        if (!~results.indexOf(parent = this[i].parentElement) && parent) {
            results.push(parent);
        }
    }

    return jBone(results);
};

fn.toArray = function() {
    return slice.call(this);
};

fn.is = function() {
    var args = arguments;

    return this.some(function(el) {
        return el.tagName.toLowerCase() === args[0];
    });
};

fn.has = function() {
    var args = arguments;

    return this.some(function(el) {
        return el.querySelectorAll(args[0]).length;
    });
};

fn.add = function(selector, context) {
    return this.pushStack(
        jBone.unique(
            jBone.merge(this.get(), jBone(selector, context))
        )
    );
};

fn.attr = function(key, value) {
    var args = arguments,
        i = 0,
        length = this.length,
        setter;

    if (isString(key) && args.length === 1) {
        return this[0] && this[0].getAttribute(key);
    }

    if (args.length === 2) {
        setter = function(el) {
            el.setAttribute(key, value);
        };
    } else if (isObject(key)) {
        setter = function(el) {
            keys(key).forEach(function(name) {
                el.setAttribute(name, key[name]);
            });
        };
    }

    for (; i < length; i++) {
        setter(this[i]);
    }

    return this;
};

fn.removeAttr = function(key) {
    var i = 0,
        length = this.length;

    for (; i < length; i++) {
        this[i].removeAttribute(key);
    }

    return this;
};

fn.val = function(value) {
    var i = 0,
        length = this.length;

    if (arguments.length === 0) {
        return this[0] && this[0].value;
    }

    for (; i < length; i++) {
        this[i].value = value;
    }

    return this;
};

fn.css = function(key, value) {
    var args = arguments,
        i = 0,
        length = this.length,
        setter;

    // Get attribute
    if (isString(key) && args.length === 1) {
        return this[0] && win.getComputedStyle(this[0])[key];
    }

    // Set attributes
    if (args.length === 2) {
        setter = function(el) {
            el.style[key] = value;
        };
    } else if (isObject(key)) {
        setter = function(el) {
            keys(key).forEach(function(name) {
                el.style[name] = key[name];
            });
        };
    }

    for (; i < length; i++) {
        setter(this[i]);
    }

    return this;
};

fn.data = function(key, value) {
    var args = arguments, data = {},
        i = 0,
        length = this.length,
        setter,
        setValue = function(el, key, value) {
            if (isObject(value)) {
                el.jdata = el.jdata || {};
                el.jdata[key] = value;
            } else {
                el.dataset[key] = value;
            }
        },
        getValue = function(value) {
            if (value === "true") {
                return true;
            } else if (value === "false") {
                return false;
            } else {
                return value;
            }
        };

    // Get all data
    if (args.length === 0) {
        this[0].jdata && (data = this[0].jdata);

        keys(this[0].dataset).forEach(function(key) {
            data[key] = getValue(this[0].dataset[key]);
        }, this);

        return data;
    }
    // Get data by name
    if (args.length === 1 && isString(key)) {
        return this[0] && getValue(this[0].dataset[key] || this[0].jdata && this[0].jdata[key]);
    }

    // Set data
    if (args.length === 1 && isObject(key)) {
        setter = function(el) {
            keys(key).forEach(function(name) {
                setValue(el, name, key[name]);
            });
        };
    } else if (args.length === 2) {
        setter = function(el) {
            setValue(el, key, value);
        };
    }

    for (; i < length; i++) {
        setter(this[i]);
    }

    return this;
};

fn.removeData = function(key) {
    var i = 0,
        length = this.length,
        jdata, dataset;

    for (; i < length; i++) {
        jdata = this[i].jdata;
        dataset = this[i].dataset;

        if (key) {
            jdata && jdata[key] && delete jdata[key];
            delete dataset[key];
        } else {
            for (key in jdata) {
                delete jdata[key];
            }

            for (key in dataset) {
                delete dataset[key];
            }
        }
    }

    return this;
};

fn.addClass = function(className) {
    var i = 0,
        j = 0,
        length = this.length,
        classes = className ? className.trim().split(/\s+/) : [];

    for (; i < length; i++) {
        j = 0;

        for (j = 0; j < classes.length; j++) {
            this[i].classList.add(classes[j]);
        }
    }

    return this;
};

fn.removeClass = function(className) {
    var i = 0,
        j = 0,
        length = this.length,
        classes = className ? className.trim().split(/\s+/) : [];

    for (; i < length; i++) {
        j = 0;

        for (j = 0; j < classes.length; j++) {
            this[i].classList.remove(classes[j]);
        }
    }

    return this;
};

fn.toggleClass = function(className, force) {
    var i = 0,
        length = this.length,
        method = "toggle";

    force === true && (method = "add") || force === false && (method = "remove");

    if (className) {
        for (; i < length; i++) {
            this[i].classList[method](className);
        }
    }

    return this;
};

fn.hasClass = function(className) {
    var i = 0, length = this.length;

    if (className) {
        for (; i < length; i++) {
            if (this[i].classList.contains(className)) {
                return true;
            }
        }
    }

    return false;
};

fn.html = function(value) {
    var args = arguments,
        el;

    // add HTML into elements
    if (args.length === 1 && value !== undefined) {
        return this.empty().append(value);
    }
    // get HTML from element
    else if (args.length === 0 && (el = this[0])) {
        return el.innerHTML;
    }

    return this;
};

fn.append = function(appended) {
    var i = 0,
        length = this.length,
        setter;

    // create jBone object and then append
    if (isString(appended) && rquickExpr.exec(appended)) {
        appended = jBone(appended);
    }
    // create text node for insertion
    else if (!isObject(appended)) {
        appended = document.createTextNode(appended);
    }

    appended = appended instanceof jBone ? appended : jBone(appended);

    setter = function(el, i) {
        appended.forEach(function(node) {
            if (i) {
                el.appendChild(node.cloneNode(true));
            } else {
                el.appendChild(node);
            }
        });
    };

    for (; i < length; i++) {
        setter(this[i], i);
    }

    return this;
};

fn.appendTo = function(to) {
    jBone(to).append(this);

    return this;
};

fn.empty = function() {
    var i = 0,
        length = this.length,
        el;

    for (; i < length; i++) {
        el = this[i];

        while (el.lastChild) {
            el.removeChild(el.lastChild);
        }
    }

    return this;
};

fn.remove = function() {
    var i = 0,
        length = this.length,
        el;

    // remove all listeners
    this.off();

    for (; i < length; i++) {
        el = this[i];

        // remove data and nodes
        delete el.jdata;
        el.parentNode && el.parentNode.removeChild(el);
    }

    return this;
};

if (typeof module === "object" && module && typeof module.exports === "object") {
    // Expose jBone as module.exports in loaders that implement the Node
    // module pattern (including browserify). Do not create the global, since
    // the user will be storing it themselves locally, and globals are frowned
    // upon in the Node module world.
    module.exports = jBone;
}
// Register as a AMD module
else if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
        return jBone;
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

    win.jBone = win.$ = jBone;
} else if (typeof win === "object" && typeof win.document === "object") {
    win.jBone = win.$ = jBone;
}

}(window));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(43)(module)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

//Tell to webpack to include css (less)
__webpack_require__(9);

//Fetch polifyl for old browsers
__webpack_require__(29);

//Tell to webpack include images to build
function requireAll(r) { r.keys().forEach(r); }
requireAll(__webpack_require__(30));
//Include layout elements (footer, header, etc.)
__webpack_require__(6);

//Include router, handle history and manage pages views
__webpack_require__(56);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(10);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(28)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/autoprefixer-loader/index.js!../../node_modules/less-loader/index.js!./common.less", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/autoprefixer-loader/index.js!../../node_modules/less-loader/index.js!./common.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)();
// imports


// module
exports.push([module.i, "html,\nbody,\ndiv,\nspan,\napplet,\nobject,\niframe,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nblockquote,\npre,\na,\nabbr,\nacronym,\naddress,\nbig,\ncite,\ncode,\ndel,\ndfn,\nem,\nimg,\nins,\nkbd,\nq,\ns,\nsamp,\nsmall,\nstrike,\nstrong,\nsub,\nsup,\ntt,\nvar,\nb,\nu,\ni,\ncenter,\ndl,\ndt,\ndd,\nol,\nul,\nli,\nfieldset,\nform,\nlabel,\nlegend,\ntable,\ncaption,\ntbody,\ntfoot,\nthead,\ntr,\nth,\ntd,\narticle,\naside,\ncanvas,\ndetails,\nembed,\nfigure,\nfigcaption,\nfooter,\nheader,\nmenu,\nnav,\noutput,\nruby,\nsection,\nsummary,\ntime,\nmark,\naudio,\nvideo {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nmenu,\nnav,\nsection {\n  display: block;\n}\nbody {\n  line-height: 1;\n}\nol,\nul {\n  list-style: none;\n}\nblockquote,\nq {\n  quotes: none;\n}\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\na {\n  color: inherit;\n  text-decoration: none;\n}\n* {\n  box-sizing: border-box;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(12) + ");\n  font-weight: 100;\n  font-style: normal;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(13) + ");\n  font-weight: 100;\n  font-style: italic;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(14) + ");\n  font-weight: 300;\n  font-style: normal;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(15) + ");\n  font-weight: 300;\n  font-style: italic;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(16) + ");\n  font-weight: 400;\n  font-style: normal;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(17) + ");\n  font-weight: 400;\n  font-style: italic;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(18) + ");\n  font-weight: 500;\n  font-style: normal;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(19) + ");\n  font-weight: 500;\n  font-style: italic;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(20) + ");\n  font-weight: 700;\n  font-style: normal;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(21) + ");\n  font-weight: 700;\n  font-style: italic;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(22) + ");\n  font-weight: 900;\n  font-style: normal;\n}\n@font-face {\n  font-family: Roboto;\n  src: url(" + __webpack_require__(23) + ");\n  font-weight: 900;\n  font-style: italic;\n}\n@-webkit-keyframes button-smart-border {\n  0% {\n    top: 100%;\n    width: 0;\n  }\n  50% {\n    top: -0.3rem;\n    width: 0;\n  }\n  100% {\n    top: -0.3rem;\n    width: 50%;\n  }\n}\n@keyframes button-smart-border {\n  0% {\n    top: 100%;\n    width: 0;\n  }\n  50% {\n    top: -0.3rem;\n    width: 0;\n  }\n  100% {\n    top: -0.3rem;\n    width: 50%;\n  }\n}\n@-webkit-keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes bottomToTop {\n  0% {\n    -webkit-transform: translate(0, 500px);\n            transform: translate(0, 500px);\n  }\n  100% {\n    -webkit-transform: translate(0);\n            transform: translate(0);\n  }\n}\n@keyframes bottomToTop {\n  0% {\n    -webkit-transform: translate(0, 500px);\n            transform: translate(0, 500px);\n  }\n  100% {\n    -webkit-transform: translate(0);\n            transform: translate(0);\n  }\n}\n/*!\n *  Font Awesome 4.5.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */\n/* FONT PATH\n * -------------------------- */\n@font-face {\n  font-family: 'FontAwesome';\n  src: url(" + __webpack_require__(5) + ");\n  src: url(" + __webpack_require__(5) + ") format('embedded-opentype'), url(" + __webpack_require__(24) + ") format('woff2'), url(" + __webpack_require__(25) + ") format('woff'), url(" + __webpack_require__(26) + ") format('truetype'), url(" + __webpack_require__(27) + ") format('svg');\n  font-weight: normal;\n  font-style: normal;\n}\n.fa {\n  display: inline-block;\n  font: normal normal normal 14px/1 FontAwesome;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n/* makes the font 33% larger relative to the icon container */\n.fa-lg {\n  font-size: 1.33333333em;\n  line-height: 0.75em;\n  vertical-align: -15%;\n}\n.fa-2x {\n  font-size: 2em;\n}\n.fa-3x {\n  font-size: 3em;\n}\n.fa-4x {\n  font-size: 4em;\n}\n.fa-5x {\n  font-size: 5em;\n}\n.fa-fw {\n  width: 1.28571429em;\n  text-align: center;\n}\n.fa-ul {\n  padding-left: 0;\n  margin-left: 2.14285714em;\n  list-style-type: none;\n}\n.fa-ul > li {\n  position: relative;\n}\n.fa-li {\n  position: absolute;\n  left: -2.14285714em;\n  width: 2.14285714em;\n  top: 0.14285714em;\n  text-align: center;\n}\n.fa-li.fa-lg {\n  left: -1.85714286em;\n}\n.fa-border {\n  padding: .2em .25em .15em;\n  border: solid 0.08em #eee;\n  border-radius: .1em;\n}\n.fa-pull-left {\n  float: left;\n}\n.fa-pull-right {\n  float: right;\n}\n.fa.fa-pull-left {\n  margin-right: .3em;\n}\n.fa.fa-pull-right {\n  margin-left: .3em;\n}\n/* Deprecated as of 4.4.0 */\n.pull-right {\n  float: right;\n}\n.pull-left {\n  float: left;\n}\n.fa.pull-left {\n  margin-right: .3em;\n}\n.fa.pull-right {\n  margin-left: .3em;\n}\n.fa-spin {\n  -webkit-animation: fa-spin 2s infinite linear;\n  animation: fa-spin 2s infinite linear;\n}\n.fa-pulse {\n  -webkit-animation: fa-spin 1s infinite steps(8);\n  animation: fa-spin 1s infinite steps(8);\n}\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n.fa-rotate-90 {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=1);\n  -webkit-transform: rotate(90deg);\n  transform: rotate(90deg);\n}\n.fa-rotate-180 {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2);\n  -webkit-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n.fa-rotate-270 {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);\n  -webkit-transform: rotate(270deg);\n  transform: rotate(270deg);\n}\n.fa-flip-horizontal {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1);\n  -webkit-transform: scale(-1, 1);\n  transform: scale(-1, 1);\n}\n.fa-flip-vertical {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1);\n  -webkit-transform: scale(1, -1);\n  transform: scale(1, -1);\n}\n:root .fa-rotate-90,\n:root .fa-rotate-180,\n:root .fa-rotate-270,\n:root .fa-flip-horizontal,\n:root .fa-flip-vertical {\n  -webkit-filter: none;\n          filter: none;\n}\n.fa-stack {\n  position: relative;\n  display: inline-block;\n  width: 2em;\n  height: 2em;\n  line-height: 2em;\n  vertical-align: middle;\n}\n.fa-stack-1x,\n.fa-stack-2x {\n  position: absolute;\n  left: 0;\n  width: 100%;\n  text-align: center;\n}\n.fa-stack-1x {\n  line-height: inherit;\n}\n.fa-stack-2x {\n  font-size: 2em;\n}\n.fa-inverse {\n  color: #fff;\n}\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\n   readers do not read off random characters that represent icons */\n.fa-glass:before {\n  content: \"\\F000\";\n}\n.fa-music:before {\n  content: \"\\F001\";\n}\n.fa-search:before {\n  content: \"\\F002\";\n}\n.fa-envelope-o:before {\n  content: \"\\F003\";\n}\n.fa-heart:before {\n  content: \"\\F004\";\n}\n.fa-star:before {\n  content: \"\\F005\";\n}\n.fa-star-o:before {\n  content: \"\\F006\";\n}\n.fa-user:before {\n  content: \"\\F007\";\n}\n.fa-film:before {\n  content: \"\\F008\";\n}\n.fa-th-large:before {\n  content: \"\\F009\";\n}\n.fa-th:before {\n  content: \"\\F00A\";\n}\n.fa-th-list:before {\n  content: \"\\F00B\";\n}\n.fa-check:before {\n  content: \"\\F00C\";\n}\n.fa-remove:before,\n.fa-close:before,\n.fa-times:before {\n  content: \"\\F00D\";\n}\n.fa-search-plus:before {\n  content: \"\\F00E\";\n}\n.fa-search-minus:before {\n  content: \"\\F010\";\n}\n.fa-power-off:before {\n  content: \"\\F011\";\n}\n.fa-signal:before {\n  content: \"\\F012\";\n}\n.fa-gear:before,\n.fa-cog:before {\n  content: \"\\F013\";\n}\n.fa-trash-o:before {\n  content: \"\\F014\";\n}\n.fa-home:before {\n  content: \"\\F015\";\n}\n.fa-file-o:before {\n  content: \"\\F016\";\n}\n.fa-clock-o:before {\n  content: \"\\F017\";\n}\n.fa-road:before {\n  content: \"\\F018\";\n}\n.fa-download:before {\n  content: \"\\F019\";\n}\n.fa-arrow-circle-o-down:before {\n  content: \"\\F01A\";\n}\n.fa-arrow-circle-o-up:before {\n  content: \"\\F01B\";\n}\n.fa-inbox:before {\n  content: \"\\F01C\";\n}\n.fa-play-circle-o:before {\n  content: \"\\F01D\";\n}\n.fa-rotate-right:before,\n.fa-repeat:before {\n  content: \"\\F01E\";\n}\n.fa-refresh:before {\n  content: \"\\F021\";\n}\n.fa-list-alt:before {\n  content: \"\\F022\";\n}\n.fa-lock:before {\n  content: \"\\F023\";\n}\n.fa-flag:before {\n  content: \"\\F024\";\n}\n.fa-headphones:before {\n  content: \"\\F025\";\n}\n.fa-volume-off:before {\n  content: \"\\F026\";\n}\n.fa-volume-down:before {\n  content: \"\\F027\";\n}\n.fa-volume-up:before {\n  content: \"\\F028\";\n}\n.fa-qrcode:before {\n  content: \"\\F029\";\n}\n.fa-barcode:before {\n  content: \"\\F02A\";\n}\n.fa-tag:before {\n  content: \"\\F02B\";\n}\n.fa-tags:before {\n  content: \"\\F02C\";\n}\n.fa-book:before {\n  content: \"\\F02D\";\n}\n.fa-bookmark:before {\n  content: \"\\F02E\";\n}\n.fa-print:before {\n  content: \"\\F02F\";\n}\n.fa-camera:before {\n  content: \"\\F030\";\n}\n.fa-font:before {\n  content: \"\\F031\";\n}\n.fa-bold:before {\n  content: \"\\F032\";\n}\n.fa-italic:before {\n  content: \"\\F033\";\n}\n.fa-text-height:before {\n  content: \"\\F034\";\n}\n.fa-text-width:before {\n  content: \"\\F035\";\n}\n.fa-align-left:before {\n  content: \"\\F036\";\n}\n.fa-align-center:before {\n  content: \"\\F037\";\n}\n.fa-align-right:before {\n  content: \"\\F038\";\n}\n.fa-align-justify:before {\n  content: \"\\F039\";\n}\n.fa-list:before {\n  content: \"\\F03A\";\n}\n.fa-dedent:before,\n.fa-outdent:before {\n  content: \"\\F03B\";\n}\n.fa-indent:before {\n  content: \"\\F03C\";\n}\n.fa-video-camera:before {\n  content: \"\\F03D\";\n}\n.fa-photo:before,\n.fa-image:before,\n.fa-picture-o:before {\n  content: \"\\F03E\";\n}\n.fa-pencil:before {\n  content: \"\\F040\";\n}\n.fa-map-marker:before {\n  content: \"\\F041\";\n}\n.fa-adjust:before {\n  content: \"\\F042\";\n}\n.fa-tint:before {\n  content: \"\\F043\";\n}\n.fa-edit:before,\n.fa-pencil-square-o:before {\n  content: \"\\F044\";\n}\n.fa-share-square-o:before {\n  content: \"\\F045\";\n}\n.fa-check-square-o:before {\n  content: \"\\F046\";\n}\n.fa-arrows:before {\n  content: \"\\F047\";\n}\n.fa-step-backward:before {\n  content: \"\\F048\";\n}\n.fa-fast-backward:before {\n  content: \"\\F049\";\n}\n.fa-backward:before {\n  content: \"\\F04A\";\n}\n.fa-play:before {\n  content: \"\\F04B\";\n}\n.fa-pause:before {\n  content: \"\\F04C\";\n}\n.fa-stop:before {\n  content: \"\\F04D\";\n}\n.fa-forward:before {\n  content: \"\\F04E\";\n}\n.fa-fast-forward:before {\n  content: \"\\F050\";\n}\n.fa-step-forward:before {\n  content: \"\\F051\";\n}\n.fa-eject:before {\n  content: \"\\F052\";\n}\n.fa-chevron-left:before {\n  content: \"\\F053\";\n}\n.fa-chevron-right:before {\n  content: \"\\F054\";\n}\n.fa-plus-circle:before {\n  content: \"\\F055\";\n}\n.fa-minus-circle:before {\n  content: \"\\F056\";\n}\n.fa-times-circle:before {\n  content: \"\\F057\";\n}\n.fa-check-circle:before {\n  content: \"\\F058\";\n}\n.fa-question-circle:before {\n  content: \"\\F059\";\n}\n.fa-info-circle:before {\n  content: \"\\F05A\";\n}\n.fa-crosshairs:before {\n  content: \"\\F05B\";\n}\n.fa-times-circle-o:before {\n  content: \"\\F05C\";\n}\n.fa-check-circle-o:before {\n  content: \"\\F05D\";\n}\n.fa-ban:before {\n  content: \"\\F05E\";\n}\n.fa-arrow-left:before {\n  content: \"\\F060\";\n}\n.fa-arrow-right:before {\n  content: \"\\F061\";\n}\n.fa-arrow-up:before {\n  content: \"\\F062\";\n}\n.fa-arrow-down:before {\n  content: \"\\F063\";\n}\n.fa-mail-forward:before,\n.fa-share:before {\n  content: \"\\F064\";\n}\n.fa-expand:before {\n  content: \"\\F065\";\n}\n.fa-compress:before {\n  content: \"\\F066\";\n}\n.fa-plus:before {\n  content: \"\\F067\";\n}\n.fa-minus:before {\n  content: \"\\F068\";\n}\n.fa-asterisk:before {\n  content: \"\\F069\";\n}\n.fa-exclamation-circle:before {\n  content: \"\\F06A\";\n}\n.fa-gift:before {\n  content: \"\\F06B\";\n}\n.fa-leaf:before {\n  content: \"\\F06C\";\n}\n.fa-fire:before {\n  content: \"\\F06D\";\n}\n.fa-eye:before {\n  content: \"\\F06E\";\n}\n.fa-eye-slash:before {\n  content: \"\\F070\";\n}\n.fa-warning:before,\n.fa-exclamation-triangle:before {\n  content: \"\\F071\";\n}\n.fa-plane:before {\n  content: \"\\F072\";\n}\n.fa-calendar:before {\n  content: \"\\F073\";\n}\n.fa-random:before {\n  content: \"\\F074\";\n}\n.fa-comment:before {\n  content: \"\\F075\";\n}\n.fa-magnet:before {\n  content: \"\\F076\";\n}\n.fa-chevron-up:before {\n  content: \"\\F077\";\n}\n.fa-chevron-down:before {\n  content: \"\\F078\";\n}\n.fa-retweet:before {\n  content: \"\\F079\";\n}\n.fa-shopping-cart:before {\n  content: \"\\F07A\";\n}\n.fa-folder:before {\n  content: \"\\F07B\";\n}\n.fa-folder-open:before {\n  content: \"\\F07C\";\n}\n.fa-arrows-v:before {\n  content: \"\\F07D\";\n}\n.fa-arrows-h:before {\n  content: \"\\F07E\";\n}\n.fa-bar-chart-o:before,\n.fa-bar-chart:before {\n  content: \"\\F080\";\n}\n.fa-twitter-square:before {\n  content: \"\\F081\";\n}\n.fa-facebook-square:before {\n  content: \"\\F082\";\n}\n.fa-camera-retro:before {\n  content: \"\\F083\";\n}\n.fa-key:before {\n  content: \"\\F084\";\n}\n.fa-gears:before,\n.fa-cogs:before {\n  content: \"\\F085\";\n}\n.fa-comments:before {\n  content: \"\\F086\";\n}\n.fa-thumbs-o-up:before {\n  content: \"\\F087\";\n}\n.fa-thumbs-o-down:before {\n  content: \"\\F088\";\n}\n.fa-star-half:before {\n  content: \"\\F089\";\n}\n.fa-heart-o:before {\n  content: \"\\F08A\";\n}\n.fa-sign-out:before {\n  content: \"\\F08B\";\n}\n.fa-linkedin-square:before {\n  content: \"\\F08C\";\n}\n.fa-thumb-tack:before {\n  content: \"\\F08D\";\n}\n.fa-external-link:before {\n  content: \"\\F08E\";\n}\n.fa-sign-in:before {\n  content: \"\\F090\";\n}\n.fa-trophy:before {\n  content: \"\\F091\";\n}\n.fa-github-square:before {\n  content: \"\\F092\";\n}\n.fa-upload:before {\n  content: \"\\F093\";\n}\n.fa-lemon-o:before {\n  content: \"\\F094\";\n}\n.fa-phone:before {\n  content: \"\\F095\";\n}\n.fa-square-o:before {\n  content: \"\\F096\";\n}\n.fa-bookmark-o:before {\n  content: \"\\F097\";\n}\n.fa-phone-square:before {\n  content: \"\\F098\";\n}\n.fa-twitter:before {\n  content: \"\\F099\";\n}\n.fa-facebook-f:before,\n.fa-facebook:before {\n  content: \"\\F09A\";\n}\n.fa-github:before {\n  content: \"\\F09B\";\n}\n.fa-unlock:before {\n  content: \"\\F09C\";\n}\n.fa-credit-card:before {\n  content: \"\\F09D\";\n}\n.fa-feed:before,\n.fa-rss:before {\n  content: \"\\F09E\";\n}\n.fa-hdd-o:before {\n  content: \"\\F0A0\";\n}\n.fa-bullhorn:before {\n  content: \"\\F0A1\";\n}\n.fa-bell:before {\n  content: \"\\F0F3\";\n}\n.fa-certificate:before {\n  content: \"\\F0A3\";\n}\n.fa-hand-o-right:before {\n  content: \"\\F0A4\";\n}\n.fa-hand-o-left:before {\n  content: \"\\F0A5\";\n}\n.fa-hand-o-up:before {\n  content: \"\\F0A6\";\n}\n.fa-hand-o-down:before {\n  content: \"\\F0A7\";\n}\n.fa-arrow-circle-left:before {\n  content: \"\\F0A8\";\n}\n.fa-arrow-circle-right:before {\n  content: \"\\F0A9\";\n}\n.fa-arrow-circle-up:before {\n  content: \"\\F0AA\";\n}\n.fa-arrow-circle-down:before {\n  content: \"\\F0AB\";\n}\n.fa-globe:before {\n  content: \"\\F0AC\";\n}\n.fa-wrench:before {\n  content: \"\\F0AD\";\n}\n.fa-tasks:before {\n  content: \"\\F0AE\";\n}\n.fa-filter:before {\n  content: \"\\F0B0\";\n}\n.fa-briefcase:before {\n  content: \"\\F0B1\";\n}\n.fa-arrows-alt:before {\n  content: \"\\F0B2\";\n}\n.fa-group:before,\n.fa-users:before {\n  content: \"\\F0C0\";\n}\n.fa-chain:before,\n.fa-link:before {\n  content: \"\\F0C1\";\n}\n.fa-cloud:before {\n  content: \"\\F0C2\";\n}\n.fa-flask:before {\n  content: \"\\F0C3\";\n}\n.fa-cut:before,\n.fa-scissors:before {\n  content: \"\\F0C4\";\n}\n.fa-copy:before,\n.fa-files-o:before {\n  content: \"\\F0C5\";\n}\n.fa-paperclip:before {\n  content: \"\\F0C6\";\n}\n.fa-save:before,\n.fa-floppy-o:before {\n  content: \"\\F0C7\";\n}\n.fa-square:before {\n  content: \"\\F0C8\";\n}\n.fa-navicon:before,\n.fa-reorder:before,\n.fa-bars:before {\n  content: \"\\F0C9\";\n}\n.fa-list-ul:before {\n  content: \"\\F0CA\";\n}\n.fa-list-ol:before {\n  content: \"\\F0CB\";\n}\n.fa-strikethrough:before {\n  content: \"\\F0CC\";\n}\n.fa-underline:before {\n  content: \"\\F0CD\";\n}\n.fa-table:before {\n  content: \"\\F0CE\";\n}\n.fa-magic:before {\n  content: \"\\F0D0\";\n}\n.fa-truck:before {\n  content: \"\\F0D1\";\n}\n.fa-pinterest:before {\n  content: \"\\F0D2\";\n}\n.fa-pinterest-square:before {\n  content: \"\\F0D3\";\n}\n.fa-google-plus-square:before {\n  content: \"\\F0D4\";\n}\n.fa-google-plus:before {\n  content: \"\\F0D5\";\n}\n.fa-money:before {\n  content: \"\\F0D6\";\n}\n.fa-caret-down:before {\n  content: \"\\F0D7\";\n}\n.fa-caret-up:before {\n  content: \"\\F0D8\";\n}\n.fa-caret-left:before {\n  content: \"\\F0D9\";\n}\n.fa-caret-right:before {\n  content: \"\\F0DA\";\n}\n.fa-columns:before {\n  content: \"\\F0DB\";\n}\n.fa-unsorted:before,\n.fa-sort:before {\n  content: \"\\F0DC\";\n}\n.fa-sort-down:before,\n.fa-sort-desc:before {\n  content: \"\\F0DD\";\n}\n.fa-sort-up:before,\n.fa-sort-asc:before {\n  content: \"\\F0DE\";\n}\n.fa-envelope:before {\n  content: \"\\F0E0\";\n}\n.fa-linkedin:before {\n  content: \"\\F0E1\";\n}\n.fa-rotate-left:before,\n.fa-undo:before {\n  content: \"\\F0E2\";\n}\n.fa-legal:before,\n.fa-gavel:before {\n  content: \"\\F0E3\";\n}\n.fa-dashboard:before,\n.fa-tachometer:before {\n  content: \"\\F0E4\";\n}\n.fa-comment-o:before {\n  content: \"\\F0E5\";\n}\n.fa-comments-o:before {\n  content: \"\\F0E6\";\n}\n.fa-flash:before,\n.fa-bolt:before {\n  content: \"\\F0E7\";\n}\n.fa-sitemap:before {\n  content: \"\\F0E8\";\n}\n.fa-umbrella:before {\n  content: \"\\F0E9\";\n}\n.fa-paste:before,\n.fa-clipboard:before {\n  content: \"\\F0EA\";\n}\n.fa-lightbulb-o:before {\n  content: \"\\F0EB\";\n}\n.fa-exchange:before {\n  content: \"\\F0EC\";\n}\n.fa-cloud-download:before {\n  content: \"\\F0ED\";\n}\n.fa-cloud-upload:before {\n  content: \"\\F0EE\";\n}\n.fa-user-md:before {\n  content: \"\\F0F0\";\n}\n.fa-stethoscope:before {\n  content: \"\\F0F1\";\n}\n.fa-suitcase:before {\n  content: \"\\F0F2\";\n}\n.fa-bell-o:before {\n  content: \"\\F0A2\";\n}\n.fa-coffee:before {\n  content: \"\\F0F4\";\n}\n.fa-cutlery:before {\n  content: \"\\F0F5\";\n}\n.fa-file-text-o:before {\n  content: \"\\F0F6\";\n}\n.fa-building-o:before {\n  content: \"\\F0F7\";\n}\n.fa-hospital-o:before {\n  content: \"\\F0F8\";\n}\n.fa-ambulance:before {\n  content: \"\\F0F9\";\n}\n.fa-medkit:before {\n  content: \"\\F0FA\";\n}\n.fa-fighter-jet:before {\n  content: \"\\F0FB\";\n}\n.fa-beer:before {\n  content: \"\\F0FC\";\n}\n.fa-h-square:before {\n  content: \"\\F0FD\";\n}\n.fa-plus-square:before {\n  content: \"\\F0FE\";\n}\n.fa-angle-double-left:before {\n  content: \"\\F100\";\n}\n.fa-angle-double-right:before {\n  content: \"\\F101\";\n}\n.fa-angle-double-up:before {\n  content: \"\\F102\";\n}\n.fa-angle-double-down:before {\n  content: \"\\F103\";\n}\n.fa-angle-left:before {\n  content: \"\\F104\";\n}\n.fa-angle-right:before {\n  content: \"\\F105\";\n}\n.fa-angle-up:before {\n  content: \"\\F106\";\n}\n.fa-angle-down:before {\n  content: \"\\F107\";\n}\n.fa-desktop:before {\n  content: \"\\F108\";\n}\n.fa-laptop:before {\n  content: \"\\F109\";\n}\n.fa-tablet:before {\n  content: \"\\F10A\";\n}\n.fa-mobile-phone:before,\n.fa-mobile:before {\n  content: \"\\F10B\";\n}\n.fa-circle-o:before {\n  content: \"\\F10C\";\n}\n.fa-quote-left:before {\n  content: \"\\F10D\";\n}\n.fa-quote-right:before {\n  content: \"\\F10E\";\n}\n.fa-spinner:before {\n  content: \"\\F110\";\n}\n.fa-circle:before {\n  content: \"\\F111\";\n}\n.fa-mail-reply:before,\n.fa-reply:before {\n  content: \"\\F112\";\n}\n.fa-github-alt:before {\n  content: \"\\F113\";\n}\n.fa-folder-o:before {\n  content: \"\\F114\";\n}\n.fa-folder-open-o:before {\n  content: \"\\F115\";\n}\n.fa-smile-o:before {\n  content: \"\\F118\";\n}\n.fa-frown-o:before {\n  content: \"\\F119\";\n}\n.fa-meh-o:before {\n  content: \"\\F11A\";\n}\n.fa-gamepad:before {\n  content: \"\\F11B\";\n}\n.fa-keyboard-o:before {\n  content: \"\\F11C\";\n}\n.fa-flag-o:before {\n  content: \"\\F11D\";\n}\n.fa-flag-checkered:before {\n  content: \"\\F11E\";\n}\n.fa-terminal:before {\n  content: \"\\F120\";\n}\n.fa-code:before {\n  content: \"\\F121\";\n}\n.fa-mail-reply-all:before,\n.fa-reply-all:before {\n  content: \"\\F122\";\n}\n.fa-star-half-empty:before,\n.fa-star-half-full:before,\n.fa-star-half-o:before {\n  content: \"\\F123\";\n}\n.fa-location-arrow:before {\n  content: \"\\F124\";\n}\n.fa-crop:before {\n  content: \"\\F125\";\n}\n.fa-code-fork:before {\n  content: \"\\F126\";\n}\n.fa-unlink:before,\n.fa-chain-broken:before {\n  content: \"\\F127\";\n}\n.fa-question:before {\n  content: \"\\F128\";\n}\n.fa-info:before {\n  content: \"\\F129\";\n}\n.fa-exclamation:before {\n  content: \"\\F12A\";\n}\n.fa-superscript:before {\n  content: \"\\F12B\";\n}\n.fa-subscript:before {\n  content: \"\\F12C\";\n}\n.fa-eraser:before {\n  content: \"\\F12D\";\n}\n.fa-puzzle-piece:before {\n  content: \"\\F12E\";\n}\n.fa-microphone:before {\n  content: \"\\F130\";\n}\n.fa-microphone-slash:before {\n  content: \"\\F131\";\n}\n.fa-shield:before {\n  content: \"\\F132\";\n}\n.fa-calendar-o:before {\n  content: \"\\F133\";\n}\n.fa-fire-extinguisher:before {\n  content: \"\\F134\";\n}\n.fa-rocket:before {\n  content: \"\\F135\";\n}\n.fa-maxcdn:before {\n  content: \"\\F136\";\n}\n.fa-chevron-circle-left:before {\n  content: \"\\F137\";\n}\n.fa-chevron-circle-right:before {\n  content: \"\\F138\";\n}\n.fa-chevron-circle-up:before {\n  content: \"\\F139\";\n}\n.fa-chevron-circle-down:before {\n  content: \"\\F13A\";\n}\n.fa-html5:before {\n  content: \"\\F13B\";\n}\n.fa-css3:before {\n  content: \"\\F13C\";\n}\n.fa-anchor:before {\n  content: \"\\F13D\";\n}\n.fa-unlock-alt:before {\n  content: \"\\F13E\";\n}\n.fa-bullseye:before {\n  content: \"\\F140\";\n}\n.fa-ellipsis-h:before {\n  content: \"\\F141\";\n}\n.fa-ellipsis-v:before {\n  content: \"\\F142\";\n}\n.fa-rss-square:before {\n  content: \"\\F143\";\n}\n.fa-play-circle:before {\n  content: \"\\F144\";\n}\n.fa-ticket:before {\n  content: \"\\F145\";\n}\n.fa-minus-square:before {\n  content: \"\\F146\";\n}\n.fa-minus-square-o:before {\n  content: \"\\F147\";\n}\n.fa-level-up:before {\n  content: \"\\F148\";\n}\n.fa-level-down:before {\n  content: \"\\F149\";\n}\n.fa-check-square:before {\n  content: \"\\F14A\";\n}\n.fa-pencil-square:before {\n  content: \"\\F14B\";\n}\n.fa-external-link-square:before {\n  content: \"\\F14C\";\n}\n.fa-share-square:before {\n  content: \"\\F14D\";\n}\n.fa-compass:before {\n  content: \"\\F14E\";\n}\n.fa-toggle-down:before,\n.fa-caret-square-o-down:before {\n  content: \"\\F150\";\n}\n.fa-toggle-up:before,\n.fa-caret-square-o-up:before {\n  content: \"\\F151\";\n}\n.fa-toggle-right:before,\n.fa-caret-square-o-right:before {\n  content: \"\\F152\";\n}\n.fa-euro:before,\n.fa-eur:before {\n  content: \"\\F153\";\n}\n.fa-gbp:before {\n  content: \"\\F154\";\n}\n.fa-dollar:before,\n.fa-usd:before {\n  content: \"\\F155\";\n}\n.fa-rupee:before,\n.fa-inr:before {\n  content: \"\\F156\";\n}\n.fa-cny:before,\n.fa-rmb:before,\n.fa-yen:before,\n.fa-jpy:before {\n  content: \"\\F157\";\n}\n.fa-ruble:before,\n.fa-rouble:before,\n.fa-rub:before {\n  content: \"\\F158\";\n}\n.fa-won:before,\n.fa-krw:before {\n  content: \"\\F159\";\n}\n.fa-bitcoin:before,\n.fa-btc:before {\n  content: \"\\F15A\";\n}\n.fa-file:before {\n  content: \"\\F15B\";\n}\n.fa-file-text:before {\n  content: \"\\F15C\";\n}\n.fa-sort-alpha-asc:before {\n  content: \"\\F15D\";\n}\n.fa-sort-alpha-desc:before {\n  content: \"\\F15E\";\n}\n.fa-sort-amount-asc:before {\n  content: \"\\F160\";\n}\n.fa-sort-amount-desc:before {\n  content: \"\\F161\";\n}\n.fa-sort-numeric-asc:before {\n  content: \"\\F162\";\n}\n.fa-sort-numeric-desc:before {\n  content: \"\\F163\";\n}\n.fa-thumbs-up:before {\n  content: \"\\F164\";\n}\n.fa-thumbs-down:before {\n  content: \"\\F165\";\n}\n.fa-youtube-square:before {\n  content: \"\\F166\";\n}\n.fa-youtube:before {\n  content: \"\\F167\";\n}\n.fa-xing:before {\n  content: \"\\F168\";\n}\n.fa-xing-square:before {\n  content: \"\\F169\";\n}\n.fa-youtube-play:before {\n  content: \"\\F16A\";\n}\n.fa-dropbox:before {\n  content: \"\\F16B\";\n}\n.fa-stack-overflow:before {\n  content: \"\\F16C\";\n}\n.fa-instagram:before {\n  content: \"\\F16D\";\n}\n.fa-flickr:before {\n  content: \"\\F16E\";\n}\n.fa-adn:before {\n  content: \"\\F170\";\n}\n.fa-bitbucket:before {\n  content: \"\\F171\";\n}\n.fa-bitbucket-square:before {\n  content: \"\\F172\";\n}\n.fa-tumblr:before {\n  content: \"\\F173\";\n}\n.fa-tumblr-square:before {\n  content: \"\\F174\";\n}\n.fa-long-arrow-down:before {\n  content: \"\\F175\";\n}\n.fa-long-arrow-up:before {\n  content: \"\\F176\";\n}\n.fa-long-arrow-left:before {\n  content: \"\\F177\";\n}\n.fa-long-arrow-right:before {\n  content: \"\\F178\";\n}\n.fa-apple:before {\n  content: \"\\F179\";\n}\n.fa-windows:before {\n  content: \"\\F17A\";\n}\n.fa-android:before {\n  content: \"\\F17B\";\n}\n.fa-linux:before {\n  content: \"\\F17C\";\n}\n.fa-dribbble:before {\n  content: \"\\F17D\";\n}\n.fa-skype:before {\n  content: \"\\F17E\";\n}\n.fa-foursquare:before {\n  content: \"\\F180\";\n}\n.fa-trello:before {\n  content: \"\\F181\";\n}\n.fa-female:before {\n  content: \"\\F182\";\n}\n.fa-male:before {\n  content: \"\\F183\";\n}\n.fa-gittip:before,\n.fa-gratipay:before {\n  content: \"\\F184\";\n}\n.fa-sun-o:before {\n  content: \"\\F185\";\n}\n.fa-moon-o:before {\n  content: \"\\F186\";\n}\n.fa-archive:before {\n  content: \"\\F187\";\n}\n.fa-bug:before {\n  content: \"\\F188\";\n}\n.fa-vk:before {\n  content: \"\\F189\";\n}\n.fa-weibo:before {\n  content: \"\\F18A\";\n}\n.fa-renren:before {\n  content: \"\\F18B\";\n}\n.fa-pagelines:before {\n  content: \"\\F18C\";\n}\n.fa-stack-exchange:before {\n  content: \"\\F18D\";\n}\n.fa-arrow-circle-o-right:before {\n  content: \"\\F18E\";\n}\n.fa-arrow-circle-o-left:before {\n  content: \"\\F190\";\n}\n.fa-toggle-left:before,\n.fa-caret-square-o-left:before {\n  content: \"\\F191\";\n}\n.fa-dot-circle-o:before {\n  content: \"\\F192\";\n}\n.fa-wheelchair:before {\n  content: \"\\F193\";\n}\n.fa-vimeo-square:before {\n  content: \"\\F194\";\n}\n.fa-turkish-lira:before,\n.fa-try:before {\n  content: \"\\F195\";\n}\n.fa-plus-square-o:before {\n  content: \"\\F196\";\n}\n.fa-space-shuttle:before {\n  content: \"\\F197\";\n}\n.fa-slack:before {\n  content: \"\\F198\";\n}\n.fa-envelope-square:before {\n  content: \"\\F199\";\n}\n.fa-wordpress:before {\n  content: \"\\F19A\";\n}\n.fa-openid:before {\n  content: \"\\F19B\";\n}\n.fa-institution:before,\n.fa-bank:before,\n.fa-university:before {\n  content: \"\\F19C\";\n}\n.fa-mortar-board:before,\n.fa-graduation-cap:before {\n  content: \"\\F19D\";\n}\n.fa-yahoo:before {\n  content: \"\\F19E\";\n}\n.fa-google:before {\n  content: \"\\F1A0\";\n}\n.fa-reddit:before {\n  content: \"\\F1A1\";\n}\n.fa-reddit-square:before {\n  content: \"\\F1A2\";\n}\n.fa-stumbleupon-circle:before {\n  content: \"\\F1A3\";\n}\n.fa-stumbleupon:before {\n  content: \"\\F1A4\";\n}\n.fa-delicious:before {\n  content: \"\\F1A5\";\n}\n.fa-digg:before {\n  content: \"\\F1A6\";\n}\n.fa-pied-piper:before {\n  content: \"\\F1A7\";\n}\n.fa-pied-piper-alt:before {\n  content: \"\\F1A8\";\n}\n.fa-drupal:before {\n  content: \"\\F1A9\";\n}\n.fa-joomla:before {\n  content: \"\\F1AA\";\n}\n.fa-language:before {\n  content: \"\\F1AB\";\n}\n.fa-fax:before {\n  content: \"\\F1AC\";\n}\n.fa-building:before {\n  content: \"\\F1AD\";\n}\n.fa-child:before {\n  content: \"\\F1AE\";\n}\n.fa-paw:before {\n  content: \"\\F1B0\";\n}\n.fa-spoon:before {\n  content: \"\\F1B1\";\n}\n.fa-cube:before {\n  content: \"\\F1B2\";\n}\n.fa-cubes:before {\n  content: \"\\F1B3\";\n}\n.fa-behance:before {\n  content: \"\\F1B4\";\n}\n.fa-behance-square:before {\n  content: \"\\F1B5\";\n}\n.fa-steam:before {\n  content: \"\\F1B6\";\n}\n.fa-steam-square:before {\n  content: \"\\F1B7\";\n}\n.fa-recycle:before {\n  content: \"\\F1B8\";\n}\n.fa-automobile:before,\n.fa-car:before {\n  content: \"\\F1B9\";\n}\n.fa-cab:before,\n.fa-taxi:before {\n  content: \"\\F1BA\";\n}\n.fa-tree:before {\n  content: \"\\F1BB\";\n}\n.fa-spotify:before {\n  content: \"\\F1BC\";\n}\n.fa-deviantart:before {\n  content: \"\\F1BD\";\n}\n.fa-soundcloud:before {\n  content: \"\\F1BE\";\n}\n.fa-database:before {\n  content: \"\\F1C0\";\n}\n.fa-file-pdf-o:before {\n  content: \"\\F1C1\";\n}\n.fa-file-word-o:before {\n  content: \"\\F1C2\";\n}\n.fa-file-excel-o:before {\n  content: \"\\F1C3\";\n}\n.fa-file-powerpoint-o:before {\n  content: \"\\F1C4\";\n}\n.fa-file-photo-o:before,\n.fa-file-picture-o:before,\n.fa-file-image-o:before {\n  content: \"\\F1C5\";\n}\n.fa-file-zip-o:before,\n.fa-file-archive-o:before {\n  content: \"\\F1C6\";\n}\n.fa-file-sound-o:before,\n.fa-file-audio-o:before {\n  content: \"\\F1C7\";\n}\n.fa-file-movie-o:before,\n.fa-file-video-o:before {\n  content: \"\\F1C8\";\n}\n.fa-file-code-o:before {\n  content: \"\\F1C9\";\n}\n.fa-vine:before {\n  content: \"\\F1CA\";\n}\n.fa-codepen:before {\n  content: \"\\F1CB\";\n}\n.fa-jsfiddle:before {\n  content: \"\\F1CC\";\n}\n.fa-life-bouy:before,\n.fa-life-buoy:before,\n.fa-life-saver:before,\n.fa-support:before,\n.fa-life-ring:before {\n  content: \"\\F1CD\";\n}\n.fa-circle-o-notch:before {\n  content: \"\\F1CE\";\n}\n.fa-ra:before,\n.fa-rebel:before {\n  content: \"\\F1D0\";\n}\n.fa-ge:before,\n.fa-empire:before {\n  content: \"\\F1D1\";\n}\n.fa-git-square:before {\n  content: \"\\F1D2\";\n}\n.fa-git:before {\n  content: \"\\F1D3\";\n}\n.fa-y-combinator-square:before,\n.fa-yc-square:before,\n.fa-hacker-news:before {\n  content: \"\\F1D4\";\n}\n.fa-tencent-weibo:before {\n  content: \"\\F1D5\";\n}\n.fa-qq:before {\n  content: \"\\F1D6\";\n}\n.fa-wechat:before,\n.fa-weixin:before {\n  content: \"\\F1D7\";\n}\n.fa-send:before,\n.fa-paper-plane:before {\n  content: \"\\F1D8\";\n}\n.fa-send-o:before,\n.fa-paper-plane-o:before {\n  content: \"\\F1D9\";\n}\n.fa-history:before {\n  content: \"\\F1DA\";\n}\n.fa-circle-thin:before {\n  content: \"\\F1DB\";\n}\n.fa-header:before {\n  content: \"\\F1DC\";\n}\n.fa-paragraph:before {\n  content: \"\\F1DD\";\n}\n.fa-sliders:before {\n  content: \"\\F1DE\";\n}\n.fa-share-alt:before {\n  content: \"\\F1E0\";\n}\n.fa-share-alt-square:before {\n  content: \"\\F1E1\";\n}\n.fa-bomb:before {\n  content: \"\\F1E2\";\n}\n.fa-soccer-ball-o:before,\n.fa-futbol-o:before {\n  content: \"\\F1E3\";\n}\n.fa-tty:before {\n  content: \"\\F1E4\";\n}\n.fa-binoculars:before {\n  content: \"\\F1E5\";\n}\n.fa-plug:before {\n  content: \"\\F1E6\";\n}\n.fa-slideshare:before {\n  content: \"\\F1E7\";\n}\n.fa-twitch:before {\n  content: \"\\F1E8\";\n}\n.fa-yelp:before {\n  content: \"\\F1E9\";\n}\n.fa-newspaper-o:before {\n  content: \"\\F1EA\";\n}\n.fa-wifi:before {\n  content: \"\\F1EB\";\n}\n.fa-calculator:before {\n  content: \"\\F1EC\";\n}\n.fa-paypal:before {\n  content: \"\\F1ED\";\n}\n.fa-google-wallet:before {\n  content: \"\\F1EE\";\n}\n.fa-cc-visa:before {\n  content: \"\\F1F0\";\n}\n.fa-cc-mastercard:before {\n  content: \"\\F1F1\";\n}\n.fa-cc-discover:before {\n  content: \"\\F1F2\";\n}\n.fa-cc-amex:before {\n  content: \"\\F1F3\";\n}\n.fa-cc-paypal:before {\n  content: \"\\F1F4\";\n}\n.fa-cc-stripe:before {\n  content: \"\\F1F5\";\n}\n.fa-bell-slash:before {\n  content: \"\\F1F6\";\n}\n.fa-bell-slash-o:before {\n  content: \"\\F1F7\";\n}\n.fa-trash:before {\n  content: \"\\F1F8\";\n}\n.fa-copyright:before {\n  content: \"\\F1F9\";\n}\n.fa-at:before {\n  content: \"\\F1FA\";\n}\n.fa-eyedropper:before {\n  content: \"\\F1FB\";\n}\n.fa-paint-brush:before {\n  content: \"\\F1FC\";\n}\n.fa-birthday-cake:before {\n  content: \"\\F1FD\";\n}\n.fa-area-chart:before {\n  content: \"\\F1FE\";\n}\n.fa-pie-chart:before {\n  content: \"\\F200\";\n}\n.fa-line-chart:before {\n  content: \"\\F201\";\n}\n.fa-lastfm:before {\n  content: \"\\F202\";\n}\n.fa-lastfm-square:before {\n  content: \"\\F203\";\n}\n.fa-toggle-off:before {\n  content: \"\\F204\";\n}\n.fa-toggle-on:before {\n  content: \"\\F205\";\n}\n.fa-bicycle:before {\n  content: \"\\F206\";\n}\n.fa-bus:before {\n  content: \"\\F207\";\n}\n.fa-ioxhost:before {\n  content: \"\\F208\";\n}\n.fa-angellist:before {\n  content: \"\\F209\";\n}\n.fa-cc:before {\n  content: \"\\F20A\";\n}\n.fa-shekel:before,\n.fa-sheqel:before,\n.fa-ils:before {\n  content: \"\\F20B\";\n}\n.fa-meanpath:before {\n  content: \"\\F20C\";\n}\n.fa-buysellads:before {\n  content: \"\\F20D\";\n}\n.fa-connectdevelop:before {\n  content: \"\\F20E\";\n}\n.fa-dashcube:before {\n  content: \"\\F210\";\n}\n.fa-forumbee:before {\n  content: \"\\F211\";\n}\n.fa-leanpub:before {\n  content: \"\\F212\";\n}\n.fa-sellsy:before {\n  content: \"\\F213\";\n}\n.fa-shirtsinbulk:before {\n  content: \"\\F214\";\n}\n.fa-simplybuilt:before {\n  content: \"\\F215\";\n}\n.fa-skyatlas:before {\n  content: \"\\F216\";\n}\n.fa-cart-plus:before {\n  content: \"\\F217\";\n}\n.fa-cart-arrow-down:before {\n  content: \"\\F218\";\n}\n.fa-diamond:before {\n  content: \"\\F219\";\n}\n.fa-ship:before {\n  content: \"\\F21A\";\n}\n.fa-user-secret:before {\n  content: \"\\F21B\";\n}\n.fa-motorcycle:before {\n  content: \"\\F21C\";\n}\n.fa-street-view:before {\n  content: \"\\F21D\";\n}\n.fa-heartbeat:before {\n  content: \"\\F21E\";\n}\n.fa-venus:before {\n  content: \"\\F221\";\n}\n.fa-mars:before {\n  content: \"\\F222\";\n}\n.fa-mercury:before {\n  content: \"\\F223\";\n}\n.fa-intersex:before,\n.fa-transgender:before {\n  content: \"\\F224\";\n}\n.fa-transgender-alt:before {\n  content: \"\\F225\";\n}\n.fa-venus-double:before {\n  content: \"\\F226\";\n}\n.fa-mars-double:before {\n  content: \"\\F227\";\n}\n.fa-venus-mars:before {\n  content: \"\\F228\";\n}\n.fa-mars-stroke:before {\n  content: \"\\F229\";\n}\n.fa-mars-stroke-v:before {\n  content: \"\\F22A\";\n}\n.fa-mars-stroke-h:before {\n  content: \"\\F22B\";\n}\n.fa-neuter:before {\n  content: \"\\F22C\";\n}\n.fa-genderless:before {\n  content: \"\\F22D\";\n}\n.fa-facebook-official:before {\n  content: \"\\F230\";\n}\n.fa-pinterest-p:before {\n  content: \"\\F231\";\n}\n.fa-whatsapp:before {\n  content: \"\\F232\";\n}\n.fa-server:before {\n  content: \"\\F233\";\n}\n.fa-user-plus:before {\n  content: \"\\F234\";\n}\n.fa-user-times:before {\n  content: \"\\F235\";\n}\n.fa-hotel:before,\n.fa-bed:before {\n  content: \"\\F236\";\n}\n.fa-viacoin:before {\n  content: \"\\F237\";\n}\n.fa-train:before {\n  content: \"\\F238\";\n}\n.fa-subway:before {\n  content: \"\\F239\";\n}\n.fa-medium:before {\n  content: \"\\F23A\";\n}\n.fa-yc:before,\n.fa-y-combinator:before {\n  content: \"\\F23B\";\n}\n.fa-optin-monster:before {\n  content: \"\\F23C\";\n}\n.fa-opencart:before {\n  content: \"\\F23D\";\n}\n.fa-expeditedssl:before {\n  content: \"\\F23E\";\n}\n.fa-battery-4:before,\n.fa-battery-full:before {\n  content: \"\\F240\";\n}\n.fa-battery-3:before,\n.fa-battery-three-quarters:before {\n  content: \"\\F241\";\n}\n.fa-battery-2:before,\n.fa-battery-half:before {\n  content: \"\\F242\";\n}\n.fa-battery-1:before,\n.fa-battery-quarter:before {\n  content: \"\\F243\";\n}\n.fa-battery-0:before,\n.fa-battery-empty:before {\n  content: \"\\F244\";\n}\n.fa-mouse-pointer:before {\n  content: \"\\F245\";\n}\n.fa-i-cursor:before {\n  content: \"\\F246\";\n}\n.fa-object-group:before {\n  content: \"\\F247\";\n}\n.fa-object-ungroup:before {\n  content: \"\\F248\";\n}\n.fa-sticky-note:before {\n  content: \"\\F249\";\n}\n.fa-sticky-note-o:before {\n  content: \"\\F24A\";\n}\n.fa-cc-jcb:before {\n  content: \"\\F24B\";\n}\n.fa-cc-diners-club:before {\n  content: \"\\F24C\";\n}\n.fa-clone:before {\n  content: \"\\F24D\";\n}\n.fa-balance-scale:before {\n  content: \"\\F24E\";\n}\n.fa-hourglass-o:before {\n  content: \"\\F250\";\n}\n.fa-hourglass-1:before,\n.fa-hourglass-start:before {\n  content: \"\\F251\";\n}\n.fa-hourglass-2:before,\n.fa-hourglass-half:before {\n  content: \"\\F252\";\n}\n.fa-hourglass-3:before,\n.fa-hourglass-end:before {\n  content: \"\\F253\";\n}\n.fa-hourglass:before {\n  content: \"\\F254\";\n}\n.fa-hand-grab-o:before,\n.fa-hand-rock-o:before {\n  content: \"\\F255\";\n}\n.fa-hand-stop-o:before,\n.fa-hand-paper-o:before {\n  content: \"\\F256\";\n}\n.fa-hand-scissors-o:before {\n  content: \"\\F257\";\n}\n.fa-hand-lizard-o:before {\n  content: \"\\F258\";\n}\n.fa-hand-spock-o:before {\n  content: \"\\F259\";\n}\n.fa-hand-pointer-o:before {\n  content: \"\\F25A\";\n}\n.fa-hand-peace-o:before {\n  content: \"\\F25B\";\n}\n.fa-trademark:before {\n  content: \"\\F25C\";\n}\n.fa-registered:before {\n  content: \"\\F25D\";\n}\n.fa-creative-commons:before {\n  content: \"\\F25E\";\n}\n.fa-gg:before {\n  content: \"\\F260\";\n}\n.fa-gg-circle:before {\n  content: \"\\F261\";\n}\n.fa-tripadvisor:before {\n  content: \"\\F262\";\n}\n.fa-odnoklassniki:before {\n  content: \"\\F263\";\n}\n.fa-odnoklassniki-square:before {\n  content: \"\\F264\";\n}\n.fa-get-pocket:before {\n  content: \"\\F265\";\n}\n.fa-wikipedia-w:before {\n  content: \"\\F266\";\n}\n.fa-safari:before {\n  content: \"\\F267\";\n}\n.fa-chrome:before {\n  content: \"\\F268\";\n}\n.fa-firefox:before {\n  content: \"\\F269\";\n}\n.fa-opera:before {\n  content: \"\\F26A\";\n}\n.fa-internet-explorer:before {\n  content: \"\\F26B\";\n}\n.fa-tv:before,\n.fa-television:before {\n  content: \"\\F26C\";\n}\n.fa-contao:before {\n  content: \"\\F26D\";\n}\n.fa-500px:before {\n  content: \"\\F26E\";\n}\n.fa-amazon:before {\n  content: \"\\F270\";\n}\n.fa-calendar-plus-o:before {\n  content: \"\\F271\";\n}\n.fa-calendar-minus-o:before {\n  content: \"\\F272\";\n}\n.fa-calendar-times-o:before {\n  content: \"\\F273\";\n}\n.fa-calendar-check-o:before {\n  content: \"\\F274\";\n}\n.fa-industry:before {\n  content: \"\\F275\";\n}\n.fa-map-pin:before {\n  content: \"\\F276\";\n}\n.fa-map-signs:before {\n  content: \"\\F277\";\n}\n.fa-map-o:before {\n  content: \"\\F278\";\n}\n.fa-map:before {\n  content: \"\\F279\";\n}\n.fa-commenting:before {\n  content: \"\\F27A\";\n}\n.fa-commenting-o:before {\n  content: \"\\F27B\";\n}\n.fa-houzz:before {\n  content: \"\\F27C\";\n}\n.fa-vimeo:before {\n  content: \"\\F27D\";\n}\n.fa-black-tie:before {\n  content: \"\\F27E\";\n}\n.fa-fonticons:before {\n  content: \"\\F280\";\n}\n.fa-reddit-alien:before {\n  content: \"\\F281\";\n}\n.fa-edge:before {\n  content: \"\\F282\";\n}\n.fa-credit-card-alt:before {\n  content: \"\\F283\";\n}\n.fa-codiepie:before {\n  content: \"\\F284\";\n}\n.fa-modx:before {\n  content: \"\\F285\";\n}\n.fa-fort-awesome:before {\n  content: \"\\F286\";\n}\n.fa-usb:before {\n  content: \"\\F287\";\n}\n.fa-product-hunt:before {\n  content: \"\\F288\";\n}\n.fa-mixcloud:before {\n  content: \"\\F289\";\n}\n.fa-scribd:before {\n  content: \"\\F28A\";\n}\n.fa-pause-circle:before {\n  content: \"\\F28B\";\n}\n.fa-pause-circle-o:before {\n  content: \"\\F28C\";\n}\n.fa-stop-circle:before {\n  content: \"\\F28D\";\n}\n.fa-stop-circle-o:before {\n  content: \"\\F28E\";\n}\n.fa-shopping-bag:before {\n  content: \"\\F290\";\n}\n.fa-shopping-basket:before {\n  content: \"\\F291\";\n}\n.fa-hashtag:before {\n  content: \"\\F292\";\n}\n.fa-bluetooth:before {\n  content: \"\\F293\";\n}\n.fa-bluetooth-b:before {\n  content: \"\\F294\";\n}\n.fa-percent:before {\n  content: \"\\F295\";\n}\n.who_i_am-title {\n  margin-bottom: 2rem;\n  font-size: 2rem;\n  text-transform: uppercase;\n}\n.who_i_am-title__name {\n  display: block;\n  margin-bottom: 1rem;\n}\n.who_i_am-title__position {\n  display: block;\n  color: #777;\n  font-weight: 100;\n}\n.who_i_am-about {\n  margin-bottom: 2rem;\n  color: #33373d;\n  font-size: 1.6rem;\n  font-weight: 100;\n  line-height: 1.5;\n  text-align: justify;\n}\n.who_i_am-table {\n  width: 100%;\n  font-size: 1.6rem;\n  text-align: center;\n}\n@media screen and (max-width: 767px) {\n  .who_i_am-table {\n    border-bottom: 0.1rem solid #efefef;\n  }\n}\n.who_i_am-table__th,\n.who_i_am-table__td {\n  padding: 1rem;\n  width: 50%;\n  border: 0.1rem solid #efefef;\n}\n@media screen and (max-width: 767px) {\n  .who_i_am-table__th,\n  .who_i_am-table__td {\n    display: block;\n    width: 100%;\n    border-bottom: none;\n  }\n}\n.who_i_am-table__th {\n  font-weight: 700;\n}\n.who_i_am-table__td {\n  font-weight: 300;\n  background-color: #fafafa;\n}\n.exp-list {\n  position: relative;\n  font-size: 1.6rem;\n  overflow: hidden;\n}\n.exp-list-title_icon {\n  position: relative;\n  left: -0.4rem;\n  width: 4.7rem;\n  line-height: 4rem;\n  font-size: 2rem;\n  text-align: center;\n  border: 0.3rem solid #efefef;\n  border-radius: 50%;\n}\n.exp-list-item {\n  margin-left: 1.7rem;\n  padding-left: 2rem;\n  padding-top: 4rem;\n  border-left: 0.3rem solid #efefef;\n  opacity: 0;\n  -webkit-transform: translate(200%, 0);\n          transform: translate(200%, 0);\n  transition: all 0.2s;\n}\n.exp-list-item.visible {\n  opacity: 1;\n  -webkit-transform: translate(0);\n          transform: translate(0);\n}\n.exp-list-item:hover .exp-list-item__title:before {\n  -webkit-transform: scale(1.5);\n          transform: scale(1.5);\n}\n.exp-list-item__title {\n  position: relative;\n  margin-bottom: 1rem;\n}\n.exp-list-item__title:before {\n  content: '';\n  position: absolute;\n  width: 1rem;\n  height: 1rem;\n  left: -2.8rem;\n  background-color: #558e6a;\n  border: 0.2rem solid white;\n  border-radius: 50%;\n  transition: all 0.2s;\n}\n.exp-list-item__date {\n  margin-bottom: 1rem;\n  color: #777;\n  font-style: italic;\n  font-weight: 300;\n}\n.exp-list-item__date__icon {\n  display: inline-block;\n  color: #777;\n  margin-right: 0.5rem;\n}\n.exp-list-item__description {\n  line-height: 1.3;\n  font-weight: 300;\n  text-align: justify;\n}\n.icons-list {\n  text-align: center;\n}\n.icons-list-item {\n  display: inline-block;\n  width: 30%;\n  margin-bottom: 3rem;\n  vertical-align: top;\n  opacity: 0;\n  -webkit-transform: translate(0, 200%);\n          transform: translate(0, 200%);\n  transition: all 0.2s;\n}\n.icons-list-item.visible {\n  opacity: 1;\n  -webkit-transform: translate(0);\n          transform: translate(0);\n}\n.icons-list-item:hover {\n  -webkit-transform: scale(1.2);\n          transform: scale(1.2);\n}\n@media screen and (max-width: 767px) {\n  .icons-list-item {\n    display: block;\n    width: auto;\n  }\n}\n.icons-list-item__icon {\n  display: inline-block;\n  margin-bottom: 1rem;\n  color: #558e6a;\n  font-size: 5rem;\n}\n.icons-list-item__title {\n  margin-bottom: 1rem;\n  font-size: 1.6rem;\n  font-style: italic;\n  text-transform: uppercase;\n}\n.icons-list-item__description {\n  display: inline-block;\n  width: 70%;\n  color: #777;\n  font-size: 1.6rem;\n  font-style: italic;\n  font-weight: 100;\n  line-height: 1.2;\n}\n@media screen and (max-width: 767px) {\n  .icons-list-item__description {\n    width: auto;\n  }\n}\n.tech-skills-item {\n  position: relative;\n  margin-bottom: 3rem;\n}\n.tech-skills-title {\n  display: inline-block;\n  width: 80%;\n  padding-right: 3rem;\n  vertical-align: top;\n}\n@media screen and (max-width: 767px) {\n  .tech-skills-title {\n    position: absolute;\n    padding-right: 0;\n    left: 50%;\n    top: 50%;\n    width: 80%;\n    -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n    text-align: center;\n  }\n}\n.tech-skills-title__name {\n  margin-bottom: 1rem;\n  color: #33373d;\n  font-size: 2rem;\n  font-style: italic;\n  letter-spacing: 0.1rem;\n}\n.tech-skills-title__description {\n  margin-bottom: 1rem;\n  color: #777;\n  font-size: 1.6rem;\n  font-style: italic;\n  font-weight: 100;\n  line-height: 1.4;\n  text-align: justify;\n}\n@media screen and (max-width: 767px) {\n  .tech-skills-title__description {\n    display: none;\n  }\n}\n.tech-skills-title__keywords {\n  font-size: 1.6rem;\n  line-height: 1.5;\n}\n.tech-skills-title__keywords__label {\n  display: inline-block;\n  padding: 0 1rem;\n  margin-right: 0.5rem;\n  color: white;\n  font-style: italic;\n  font-weight: normal;\n  background-color: #558e6a;\n  border-radius: 0.5rem;\n}\n.tech-skills-title__keywords__text {\n  color: #777;\n  font-weight: bold;\n}\n.tech-skills-progress {\n  display: inline-block;\n  width: 20%;\n  vertical-align: top;\n}\n@media screen and (max-width: 767px) {\n  .tech-skills-progress {\n    display: block;\n    width: auto;\n  }\n}\n@media screen and (max-width: 767px) {\n  .tech-skills-progress .text {\n    display: none;\n  }\n}\n.language-skills-item {\n  margin-bottom: 3rem;\n}\n.language-skills-title {\n  margin-bottom: 1rem;\n  color: #33373d;\n  font-size: 1.8rem;\n  font-style: italic;\n  letter-spacing: 0.1rem;\n}\n.language-skills-title .small {\n  float: right;\n  color: #777;\n  font-size: 1.6rem;\n  font-weight: 300;\n}\n.language-skills-progress {\n  margin-bottom: 2rem;\n}\n.language-skills-description {\n  color: #777;\n  font-size: 1.6rem;\n  font-style: italic;\n  font-weight: 100;\n  line-height: 1.4;\n  text-align: justify;\n}\n.tools-skills-item {\n  margin-bottom: 3rem;\n  overflow: hidden;\n}\n.tools-skills-title {\n  float: left;\n  color: #777;\n  font-size: 1.8rem;\n  font-style: italic;\n  letter-spacing: 0.1rem;\n}\n@media screen and (max-width: 767px) {\n  .tools-skills-title {\n    float: none;\n    margin-bottom: 1rem;\n  }\n}\n.tools-skills-progress {\n  float: right;\n}\n@media screen and (max-width: 767px) {\n  .tools-skills-progress {\n    float: none;\n    margin-left: -0.5rem;\n  }\n}\n.tools-skills-progress__item {\n  display: inline-block;\n  margin: 0 0.5rem;\n  width: 2rem;\n  height: 2rem;\n  background: black;\n  border-radius: 50%;\n}\n.tools-skills-progress__item.active {\n  background-color: #558e6a;\n}\n.portfolio-list {\n  text-align: center;\n}\n.portfolio-list-item {\n  display: inline-block;\n  position: relative;\n  margin: 0 1rem 2rem;\n  width: 30%;\n  opacity: 0;\n  transition: all 0.3s;\n}\n@media screen and (max-width: 767px) {\n  .portfolio-list-item {\n    display: block;\n    width: auto;\n  }\n}\n.portfolio-list-item__img {\n  width: 100%;\n}\n.portfolio-list-item__overlay {\n  display: none;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  opacity: 0;\n  overflow: hidden;\n  background-color: rgba(85, 142, 106, 0.8);\n  -webkit-animation: fadeIn 0.2s forwards;\n          animation: fadeIn 0.2s forwards;\n}\n.portfolio-list-item__overlay__center {\n  display: inline-block;\n  position: absolute;\n  width: 70%;\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n}\n.portfolio-list-item__overlay__name {\n  display: block;\n  margin-bottom: 1rem;\n  color: white;\n  font-size: 1.6rem;\n  font-style: italic;\n  font-weight: 700;\n  letter-spacing: 0.1rem;\n  text-transform: uppercase;\n  -webkit-transform: translate(0, 500px);\n          transform: translate(0, 500px);\n  -webkit-animation: bottomToTop 0.2s forwards;\n          animation: bottomToTop 0.2s forwards;\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n.portfolio-list-item__overlay__position {\n  display: inline-block;\n  color: white;\n  font-size: 1.6rem;\n  font-weight: 300;\n  line-height: 1.3;\n  -webkit-transform: translate(0, 500px);\n          transform: translate(0, 500px);\n  -webkit-animation: bottomToTop 0.2s forwards;\n          animation: bottomToTop 0.2s forwards;\n  -webkit-animation-delay: 0.4s;\n          animation-delay: 0.4s;\n}\n.portfolio-list-item.visible {\n  -webkit-animation: fadeIn 0.2s forwards;\n          animation: fadeIn 0.2s forwards;\n}\n.portfolio-list-item:hover {\n  z-index: 1;\n  -webkit-transform: scale(1.05);\n          transform: scale(1.05);\n}\n.portfolio-list-item:hover .portfolio-list-item__overlay {\n  display: block;\n}\n.contact-map {\n  position: relative;\n  padding-top: 60%;\n}\n.contact-map-instance {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n.contact-info {\n  position: relative;\n  padding: 4rem 2rem 2rem;\n  margin-top: 5rem;\n  border: 0.1rem solid #efefef;\n}\n.contact-info-icon {\n  position: absolute;\n  width: 6rem;\n  left: 50%;\n  top: 0;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  line-height: 6rem;\n  color: white;\n  font-size: 3rem;\n  text-align: center;\n  background-color: #558e6a;\n  border-radius: 50%;\n}\n.contact-info-icon.link {\n  transition: all 0.3s;\n}\n.contact-info-icon.link:hover {\n  background-color: #33373d;\n  -webkit-transform: translate(-50%, -60%);\n          transform: translate(-50%, -60%);\n}\n.contact-info-text {\n  color: #33373d;\n  font-size: 2rem;\n  text-align: center;\n}\nhtml,\nbody {\n  min-height: 100%;\n  color: #33373d;\n  font-size: 10px;\n  font-family: Roboto;\n}\nbody {\n  padding: 5rem 0;\n  background-color: #efefef;\n}\n@media screen and (max-width: 767px) {\n  body {\n    padding: 0;\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1199px) {\n  body {\n    padding: 2rem;\n  }\n}\n.loading {\n  font-size: 2rem;\n}\n.cv {\n  margin: 0 auto;\n  max-width: 120rem;\n  height: 100%;\n  font-size: 0;\n}\n.main-header,\n.page-wrapper {\n  display: inline-block;\n  min-height: 100%;\n  vertical-align: top;\n}\n@media screen and (max-width: 767px) {\n  .main-header,\n  .page-wrapper {\n    display: block;\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1199px) {\n  .main-header,\n  .page-wrapper {\n    display: block;\n  }\n}\n.main-header {\n  width: 30%;\n  padding-right: 2rem;\n}\n@media screen and (max-width: 767px) {\n  .main-header {\n    width: auto;\n    padding-right: 0;\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1199px) {\n  .main-header {\n    width: auto;\n    padding-right: 0;\n  }\n}\n.main-nav {\n  font-weight: bold;\n  text-transform: uppercase;\n  background-color: #33373d;\n}\n.main-nav-li {\n  position: relative;\n  border-bottom: 0.1rem solid #26292e;\n  font-size: 1.4rem;\n  text-align: right;\n}\n@media screen and (max-width: 767px) {\n  .main-nav-li {\n    display: inline-block;\n    width: 25%;\n    vertical-align: top;\n    font-size: 0;\n    text-align: center;\n    border: none;\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1199px) {\n  .main-nav-li {\n    display: inline-block;\n    width: 25%;\n    vertical-align: top;\n    border-bottom: none;\n    border-right: 0.1rem solid #26292e;\n  }\n  .main-nav-li:last-child {\n    border-right: none;\n  }\n}\n.main-nav-li:last-child {\n  border-bottom: none;\n}\n.main-nav-item {\n  display: block;\n  padding: 2rem;\n  color: #85878b;\n}\n@media screen and (max-width: 767px) {\n  .main-nav-item {\n    display: inline-block;\n  }\n}\n.main-nav-item:before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 1;\n  background-color: #558e6a;\n  -webkit-transform: scaleX(0);\n          transform: scaleX(0);\n  transition: all 0.4s ease;\n}\n.main-nav-item:hover,\n.main-nav-item.active {\n  color: white;\n}\n.main-nav-item:hover:before,\n.main-nav-item.active:before {\n  -webkit-transform: scaleX(1);\n          transform: scaleX(1);\n}\n.main-nav-item > * {\n  position: relative;\n  z-index: 2;\n}\n.main-nav-item i {\n  float: left;\n  font-size: 2rem;\n  margin-top: -0.3rem;\n}\n@media screen and (max-width: 767px) {\n  .main-nav-item i {\n    font-size: 2rem;\n  }\n}\n.avatar {\n  position: relative;\n}\n.avatar-title {\n  position: absolute;\n  padding: 0.5rem 1.5rem;\n  color: #FFF;\n  font-size: 1.6rem;\n  letter-spacing: 0.2rem;\n  -webkit-transform: rotate(270deg) translateX(-100%);\n          transform: rotate(270deg) translateX(-100%);\n  -webkit-transform-origin: left top;\n          transform-origin: left top;\n  background: linear-gradient(to left, #33373D 0%, rgba(51, 55, 61, 0) 100%);\n}\n.avatar img {\n  width: 100%;\n}\n.social-links {\n  padding: 2rem;\n  background-color: white;\n  color: #33373d;\n  font-size: 2rem;\n  text-align: center;\n}\n.social-links-li {\n  display: inline-block;\n  margin: 0 0.1rem;\n  width: 4rem;\n  line-height: 3.5rem;\n  border-radius: 50%;\n  border: 0.2rem solid #33373d;\n  transition: all 0.4s;\n}\n.social-links-li:hover {\n  color: #558e6a;\n  border-color: #558e6a;\n}\n.page-wrapper {\n  width: 70%;\n  background-color: white;\n}\n@media screen and (max-width: 767px) {\n  .page-wrapper {\n    width: auto;\n  }\n}\n@media screen and (min-width: 768px) and (max-width: 1199px) {\n  .page-wrapper {\n    width: auto;\n  }\n}\n.page {\n  opacity: 0;\n  -webkit-animation: fadeIn 1s forwards;\n          animation: fadeIn 1s forwards;\n}\n.page-footer {\n  padding: 5rem 0;\n  text-align: center;\n  border-top: 1px solid #efefef;\n}\n.page-footer .download-cv {\n  display: inline-block;\n  padding: 1rem 0;\n  margin: 0 2rem;\n  width: 25rem;\n  font-size: 2rem;\n  text-transform: uppercase;\n  border: 0.3rem solid;\n}\n.page-footer .download-cv i {\n  display: inline-block;\n  margin-right: 0.5rem;\n}\n.page-footer .download-cv {\n  position: relative;\n  border-width: 0;\n  border-bottom-width: 0.3rem;\n}\n.page-footer .download-cv:before {\n  content: '';\n  position: absolute;\n  width: 0;\n  left: 0;\n  bottom: -0.3rem;\n  border-left: 0.3rem solid;\n  border-top: 0.3rem solid;\n}\n.page-footer .download-cv:after {\n  content: '';\n  position: absolute;\n  width: 0;\n  right: 0;\n  bottom: -0.3rem;\n  border-right: 0.3rem solid;\n  border-top: 0.3rem solid;\n}\n.page-footer .download-cv:hover:before,\n.page-footer .download-cv:hover:after {\n  -webkit-animation: button-smart-border 0.4s forwards;\n          animation: button-smart-border 0.4s forwards;\n}\n.section {\n  padding: 0 3rem;\n  margin-bottom: 2rem;\n}\n@media screen and (max-width: 767px) {\n  .section {\n    padding: 0 2rem;\n  }\n}\n.section-title {\n  padding: 2rem 3rem 1rem;\n  margin: 0 0 3rem -3rem;\n  color: #33373d;\n  font-size: 1.7rem;\n  font-weight: bold;\n  text-transform: uppercase;\n  border-bottom: 0.1rem solid #efefef;\n}\n", ""]);

// exports


/***/ }),
/* 11 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-Thin.ttf?3f68500b267c20051088bcc0698af773";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-ThinItalic.ttf?1e5737be5c68c15c3a105b2db9a3b67c";

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-Light.ttf?7b5fb88f12bec8143f00e21bc3222124";

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-LightItalic.ttf?129c5057f4480f9a353e15e1e1e09f9d";

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-Regular.ttf?ac3f799d5bbaf5196fab15ab8de8431c";

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-Italic.ttf?de74c60991cd63c8b922e0e665a39c7a";

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-Medium.ttf?fe13e4170719c2fc586501e777bde143";

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-MediumItalic.ttf?5b25afa871e1b896011859f8cdf8da74";

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-Bold.ttf?d329cc8b34667f114a95422aaad1b063";

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-BoldItalic.ttf?b37d0bb73a2f688ecaee01647f41e3e5";

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-Black.ttf?893fe14628bd7ac498d550e96367e1be";

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/Roboto//Roboto-BlackItalic.ttf?256aab654d3c4dd0e12fd0a32c7e8aa6";

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/font-awesome//fontawesome-webfont.woff2?db812d8a70a4e88e888744c1c9a27e89";

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/font-awesome//fontawesome-webfont.woff?a35720c2fed2c7f043bc7e4ffb45e073";

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/font-awesome//fontawesome-webfont.ttf?a3de2170e4e9df77161ea5d3f31b2668";

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fonts/font-awesome//fontawesome-webfont.svg?65e8f7dd6a65aa5812afa9050bfc720e";

/***/ }),
/* 28 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 29 */
/***/ (function(module, exports) {

(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = name.toString();
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = value.toString();
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    var self = this
    if (headers instanceof Headers) {
      headers.forEach(function(name, values) {
        values.forEach(function(value) {
          self.append(name, value)
        })
      })

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        self.append(name, headers[name])
      })
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  // Instead of iterable for now.
  Headers.prototype.forEach = function(callback) {
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name])
    })
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return fetch.Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new fetch.Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return fetch.Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return fetch.Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return fetch.Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : fetch.Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(function (text) {
          return JSON.parse(text);
      });
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(url, options) {
    options = options || {}
    this.url = url

    this.credentials = options.credentials || 'omit'
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(options.body)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  function getXhr() {
    // from backbone.js 1.1.2
    // https://github.com/jashkenas/backbone/blob/1.1.2/backbone.js#L1181
    if (noXhrPatch && !(/^(get|post|head|put|delete|options)$/i.test(this.method))) {
      this.usingActiveXhr = true;
      return new ActiveXObject("Microsoft.XMLHTTP");
    }
    return new XMLHttpRequest();
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.url = null
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    // TODO: Request constructor should accept input, init
    var request
    if (Request.prototype.isPrototypeOf(input) && !init) {
      request = input
    } else {
      request = new Request(input, init)
    }

    return new fetch.Promise(function(resolve, reject) {
      var xhr = getXhr();
      if (request.credentials === 'cors') {
        xhr.withCredentials = true;
      }

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      function onload() {
        if (xhr.readyState !== 4) {
          return
        }
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }
      xhr.onreadystatechange = onload;
      if (!self.usingActiveXhr) {
        xhr.onload = onload;
        xhr.onerror = function() {
          reject(new TypeError('Network request failed'))
        }
      }

      xhr.open(request.method, request.url, true)

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  fetch.Promise = self.Promise; // you could change it to your favorite alternative
  self.fetch.polyfill = true
})();


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./ava1.jpg": 31,
	"./favicon.ico": 32,
	"./portfolio/freelance.jpg": 33,
	"./portfolio/gbas.jpg": 34,
	"./portfolio/gcas.jpg": 35,
	"./portfolio/gofast.jpg": 36,
	"./portfolio/got.jpg": 37,
	"./portfolio/hiqo.jpg": 38,
	"./portfolio/look.jpg": 39,
	"./portfolio/node.jpg": 40,
	"./portfolio/sportcom.jpg": 41,
	"./the-rock.jpg": 42
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 30;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img//ava1.jpg?8eaab2a60961dbba08df2f2363ee9c42";

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img//favicon.ico?dc59d0a8ed7d56068cb6a3adeff4d0a1";

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//freelance.jpg?bb44ffeab5fc0c9530f6952fe7afbd6a";

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//gbas.jpg?faa85a44b9cfd267b29f27f2da83ab7e";

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//gcas.jpg?895fb056e057eb59c7b783f270551eb8";

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//gofast.jpg?3d2cbc38b2d076f775c24cb109926672";

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//got.jpg?8b28a3d1434b2b7675b6a755a12b8e66";

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//hiqo.jpg?68c3c10f2d6da02c9c5399276b290481";

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//look.jpg?1f5cce779f2fc5b79adb0dc8a8e8bde9";

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//node.jpg?2b0ea3e980ad773b0ef802ec024ed43b";

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img/portfolio//sportcom.jpg?2f91b0f55e9506293c19a0899cdfac23";

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img//the-rock.jpg?0e1b7ae15ca908ea5b8111d2cc6f3146";

/***/ }),
/* 43 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var BaseView = __webpack_require__(1);
var mvc = __webpack_require__(3);

/**
 * @constructor
 */
var MainHeader = BaseView.extend({
    /**
     * @override
     */
    template: 'layout/main-header',
    url: 'data/about.json',

    events: {
        'click .fn-nav-item': 'navigate'
    },

    initialize: function () {
        this.renderAfterFetch();
    },

    /**
     * Nivigate by backbone history
     * @param event {Event}
     */
    navigate: function (event) {
        event.preventDefault();

        mvc.history.navigate(event.currentTarget.getAttribute('href'), true);
    },

    /**
     * Set nav active class by path if need
     * @param path
     */
    updateNav: function (path) {
        if (this._rendered) {
            this.setNavActiveClass(path);
        } else {
            this.listenToOnce(this, 'rendered', this.setNavActiveClass.bind(this, path));
        }
    },

    /**
     * Set nav active class
     * @param path
     */
    setNavActiveClass: function (path) {
        var target = this.$('.fn-nav-item').filter(function (el) {
            return el.getAttribute('href').substr(1) === path;
        })[0];

        this.$('.fn-nav-item').removeClass('active');

        target.classList.add('active');
    }
});

module.exports = MainHeader;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Backbone.js 1.3.3

//     (c) 2010-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self === self && self) ||
            (typeof global == 'object' && global.global === global && global);

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(47), __webpack_require__(7), exports], __WEBPACK_AMD_DEFINE_RESULT__ = function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), $;
    try { $ = require('jquery'); } catch (e) {}
    factory(root, exports, _, $);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

})(function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.3.3';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... this will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function(length, method, attribute) {
    switch (length) {
      case 1: return function() {
        return _[method](this[attribute]);
      };
      case 2: return function(value) {
        return _[method](this[attribute], value);
      };
      case 3: return function(iteratee, context) {
        return _[method](this[attribute], cb(iteratee, this), context);
      };
      case 4: return function(iteratee, defaultVal, context) {
        return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
      };
      default: return function() {
        var args = slice.call(arguments);
        args.unshift(this[attribute]);
        return _[method].apply(_, args);
      };
    }
  };
  var addUnderscoreMethods = function(Class, methods, attribute) {
    _.each(methods, function(length, method) {
      if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
    return iteratee;
  };
  var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
      return matcher(model.attributes);
    };
  };

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // a custom event channel. You may bind a callback to an event with `on` or
  // remove with `off`; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {};

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0, names;
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length ; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Events.on = function(name, callback, context) {
    return internalOn(this, name, callback, context);
  };

  // Guard the `listening` argument from the public API.
  var internalOn = function(obj, name, callback, context, listening) {
    obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
      context: context,
      ctx: obj,
      listening: listening
    });

    if (listening) {
      var listeners = obj._listeners || (obj._listeners = {});
      listeners[listening.id] = listening;
    }

    return obj;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo = function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
      listening = listeningTo[id] = {obj: obj, objId: id, id: thisId, listeningTo: listeningTo, count: 0};
    }

    // Bind callbacks on obj, and keep track of them on listening.
    internalOn(obj, name, callback, this, listening);
    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context, ctx = options.ctx, listening = options.listening;
      if (listening) listening.count++;

      handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
    }
    return events;
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off = function(name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners
    });
    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening = function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);

    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
    }

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function(events, name, callback, options) {
    if (!events) return;

    var i = 0, listening;
    var context = options.context, listeners = options.listeners;

    // Delete all events listeners and "drop" events.
    if (!name && !callback && !context) {
      var ids = _.keys(listeners);
      for (; i < ids.length; i++) {
        listening = listeners[ids[i]];
        delete listeners[listening.id];
        delete listening.listeningTo[listening.objId];
      }
      return;
    }

    var names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Replace events if there are any remaining.  Otherwise, clean up.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (
          callback && callback !== handler.callback &&
            callback !== handler.callback._callback ||
              context && context !== handler.context
        ) {
          remaining.push(handler);
        } else {
          listening = handler.listening;
          if (listening && --listening.count === 0) {
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
          }
        }
      }

      // Update tail event if the list has any events.  Otherwise, clean up.
      if (remaining.length) {
        events[name] = remaining;
      } else {
        delete events[name];
      }
    }
    return events;
  };

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  Events.once = function(name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
    if (typeof name === 'string' && context == null) callback = void 0;
    return this.on(events, callback, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce = function(obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function() {
        offer(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
    }
    return map;
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.trigger = function(name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

    eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function(objEvents, name, callback, args) {
    if (objEvents) {
      var events = objEvents[name];
      var allEvents = objEvents.all;
      if (events && allEvents) allEvents = allEvents.slice();
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, [name].concat(args));
    }
    return objEvents;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    var defaults = _.result(this, 'defaults');
    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // The prefix is used to create the client id which is used to identify models locally.
    // You may want to override this if you're experiencing name clashes with model ids.
    cidPrefix: 'c',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset      = options.unset;
      var silent     = options.silent;
      var changes    = [];
      var changing   = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev    = this._previousAttributes;

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          changed[attr] = val;
        } else {
          delete changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Update the `id`.
      if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0; i < changes.length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
      }
      return _.size(changed) ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (!model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true, parse: true}, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else if (!this._validate(attrs, options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
        if (serverAttrs && !model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

      var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (wait) destroy();
        if (success) success.call(options.context, model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        _.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend({}, options, {validate: true}));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
      omit: 0, chain: 1, isEmpty: 1};

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  addUnderscoreMethods(Model, modelMethods, 'attributes');

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Splices `insert` into `array` at index `at`.
  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model) { return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();
      var removed = this._removeModels(models, options);
      if (!options.silent && removed.length) {
        options.changes = {added: [], merged: [], removed: removed};
        this.trigger('update', this, options);
      }
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      if (models == null) return;

      options = _.extend({}, setOptions, options);
      if (options.parse && !this._isModel(models)) {
        models = this.parse(models, options) || [];
      }

      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();

      var at = options.at;
      if (at != null) at = +at;
      if (at > this.length) at = this.length;
      if (at < 0) at += this.length + 1;

      var set = [];
      var toAdd = [];
      var toMerge = [];
      var toRemove = [];
      var modelMap = {};

      var add = options.add;
      var merge = options.merge;
      var remove = options.remove;

      var sort = false;
      var sortable = this.comparator && at == null && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      var model, i;
      for (i = 0; i < models.length; i++) {
        model = models[i];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        var existing = this.get(model);
        if (existing) {
          if (merge && model !== existing) {
            var attrs = this._isModel(model) ? model.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
          }
          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(model, options);
          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }
        }
      }

      // Remove stale models.
      if (remove) {
        for (i = 0; i < this.length; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) toRemove.push(model);
        }
        if (toRemove.length) this._removeModels(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      var orderChanged = false;
      var replace = !sortable && add && remove;
      if (set.length && replace) {
        orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
          return m !== set[index];
        });
        this.models.length = 0;
        splice(this.models, set, 0);
        this.length = this.models.length;
      } else if (toAdd.length) {
        if (sortable) sort = true;
        splice(this.models, toAdd, at == null ? this.length : at);
        this.length = this.models.length;
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort/update events.
      if (!options.silent) {
        for (i = 0; i < toAdd.length; i++) {
          if (at != null) options.index = at + i;
          model = toAdd[i];
          model.trigger('add', model, this, options);
        }
        if (sort || orderChanged) this.trigger('sort', this, options);
        if (toAdd.length || toRemove.length || toMerge.length) {
          options.changes = {
            added: toAdd,
            removed: toRemove,
            merged: toMerge
          };
          this.trigger('update', this, options);
        }
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id, cid, model object with id or cid
    // properties, or an attributes object that is transformed through modelId.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] ||
        this._byId[this.modelId(obj.attributes || obj)] ||
        obj.cid && this._byId[obj.cid];
    },

    // Returns `true` if the model is in the collection.
    has: function(obj) {
      return this.get(obj) != null;
    },

    // Get the model at the given index.
    at: function(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

      // Run sort based on type of `comparator`.
      if (length === 1 || _.isString(comparator)) {
        this.models = this.sortBy(comparator);
      } else {
        this.models.sort(comparator);
      }
      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return this.map(attr + '');
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success.call(options.context, collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(m, resp, callbackOpts) {
        if (wait) collection.add(m, callbackOpts);
        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function(attrs) {
      return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method called by both remove and set.
    _removeModels: function(models, options) {
      var removed = [];
      for (var i = 0; i < models.length; i++) {
        var model = this.get(models[i]);
        if (!model) continue;

        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        // Remove references before triggering 'remove' event to prevent an
        // infinite loop. #3693
        delete this._byId[model.cid];
        var id = this.modelId(model.attributes);
        if (id != null) delete this._byId[id];

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }

        removed.push(model);
        this._removeReference(model, options);
      }
      return removed;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function(model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      delete this._byId[model.cid];
      var id = this.modelId(model.attributes);
      if (id != null) delete this._byId[id];
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if (model) {
        if ((event === 'add' || event === 'remove') && collection !== this) return;
        if (event === 'destroy') this.remove(model, options);
        if (event === 'change') {
          var prevId = this.modelId(model.previousAttributes());
          var id = this.modelId(model.attributes);
          if (prevId !== id) {
            if (prevId != null) delete this._byId[prevId];
            if (id != null) this._byId[id] = model;
          }
        }
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = {forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
      foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
      select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
      contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
      head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
      without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
      isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
      sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3};

  // Mix in each Underscore method as a proxy to `Collection#models`.
  addUnderscoreMethods(Collection, collectionMethods, 'models');

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be set as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
    _setElement: function(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    this.checkUrl = _.bind(this.checkUrl, this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function() {
      var path = this.decodeFragment(this.location.pathname);
      var rootPath = path.slice(0, this.root.length - 1) + '/';
      return rootPath === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = this.decodeFragment(
        this.location.pathname + this.getSearch()
      ).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
      if (fragment == null) {
        if (this._usePushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.history && this.history.pushState);
      this._usePushState    = this._wantsPushState && this._hasPushState;
      this.fragment         = this.getFragment();

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          var rootPath = this.root.slice(0, -1) || '/';
          this.location.replace(rootPath + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), {replace: true});
        }

      }

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'javascript:0';
        this.iframe.style.display = 'none';
        this.iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
        iWindow.document.open();
        iWindow.document.close();
        iWindow.location.hash = '#' + this.fragment;
      }

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function(eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._usePushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function(eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._usePushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();

      // If the user pressed the back button, the iframe's hash will have
      // changed and we should use that for comparison.
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe.contentWindow);
      }

      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Don't include a trailing slash on the root.
      var rootPath = this.root;
      if (fragment === '' || fragment.charAt(0) === '?') {
        rootPath = rootPath.slice(0, -1) || '/';
      }
      var url = rootPath + fragment;

      // Strip the hash and decode for matching.
      fragment = this.decodeFragment(fragment.replace(pathStripper, ''));

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._usePushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
          var iWindow = this.iframe.contentWindow;

          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if (!options.replace) {
            iWindow.document.open();
            iWindow.document.close();
          }

          this._updateHash(iWindow.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;
});

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(46)))

/***/ }),
/* 46 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (true) {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return _;
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}.call(this));


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./layout/main-footer.dot": 49,
	"./layout/main-header.dot": 50,
	"./pages/about-page.dot": 51,
	"./pages/contact-page.dot": 52,
	"./pages/portfolio-page.dot": 53,
	"./pages/skills-page.dot": 54
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 48;

/***/ }),
/* 49 */
/***/ (function(module, exports) {

module.exports = function anonymous(it
/*``*/) {
var out='<a href="'+(it.textResumeLink)+'" class="download-cv"> <i class="fa fa-download"></i> <span>Download cv</span></a>';return out;
}

/***/ }),
/* 50 */
/***/ (function(module, exports) {

module.exports = function anonymous(it
/*``*/) {
var out='<figure class="avatar"> <figcaption class="avatar-title">'+(it.commonInfo.fullName)+'</figcaption> <img src="'+(it.commonInfo.avatarSrc)+'" alt="avatar"/></figure><ul class="main-nav"> <li class="main-nav-li"> <a href="/" class="main-nav-item fn-nav-item active"> <i class="fa fa-user"></i> <span>About</span> </a> </li> <li class="main-nav-li"> <a href="/skills" class="main-nav-item fn-nav-item"> <i class="fa fa-gears"></i> <span>Skills</span> </a> </li> <li class="main-nav-li"> <a href="/portfolio" class="main-nav-item fn-nav-item"> <i class="fa fa-folder"></i> <span>Portfolio</span> </a> </li> <li class="main-nav-li"> <a href="/contact" class="main-nav-item fn-nav-item"> <i class="fa fa-phone"></i> <span>Contact</span> </a> </li></ul><ul class="social-links"> ';var arr1=it.socialLinks;if(arr1){var link,i1=-1,l1=arr1.length-1;while(i1<l1){link=arr1[i1+=1];out+=' <li class="social-links-li"> <a href="'+(link.href)+'" target="_blank"><i class="fa fa-'+(link.icon)+'"></i></a> </li> ';} } out+='</ul>';return out;
}

/***/ }),
/* 51 */
/***/ (function(module, exports) {

module.exports = function anonymous(it
/*``*/) {
var out='<div class="page about-page"> <section class="section who_i_am fn-section"> <h1 class="section-title">Who i am</h1> <h2 class="who_i_am-title"> <span class="who_i_am-title__name">'+(it.commonInfo.fullName)+'</span> <span class="who_i_am-title__position">'+(it.commonInfo.position)+'</span> </h2> <p class="who_i_am-about">'+(it.commonInfo.introWords)+'</p> <table class="who_i_am-table"> <tbody> ';var arr1=it.commonInfo.details;if(arr1){var detail,i1=-1,l1=arr1.length-1;while(i1<l1){detail=arr1[i1+=1];out+=' <tr class="who_i_am-table__tr"> <td class="who_i_am-table__th">'+(detail.title)+'</td> <td class="who_i_am-table__td">'+(detail.value)+'</td> </tr> ';} } out+=' </tbody> </table> </section> <section class="section fn-section"> <h2 class="section-title">Education</h2> <ul class="exp-list"> <i class="fa fa-graduation-cap exp-list-title_icon"></i> ';var arr2=it.education;if(arr2){var edu,i2=-1,l2=arr2.length-1;while(i2<l2){edu=arr2[i2+=1];out+=' <li class="exp-list-item fn-visible-item"> <h3 class="exp-list-item__title"> <span class="exp-list-item__title__position">'+(edu.position)+'</span> &nbsp;-&nbsp; <span class="exp-list-item__title__place">'+(edu.place)+'</span> </h3> <div class="exp-list-item__date"> <i class="fa fa-calendar exp-list-item__date__icon"></i> <span class="exp-list-item__date__start">'+(edu.startDate)+'</span> &nbsp;-&nbsp; <span class="exp-list-item__date__end">'+(edu.endDate)+'</span> </div> <p class="exp-list-item__description">'+(edu.description)+'</p> </li> ';} } out+=' </ul> </section> <section class="section fn-section"> <h2 class="section-title">Experience</h2> <ul class="exp-list"> <i class="fa fa-briefcase exp-list-title_icon"></i> ';var arr3=it.expirience;if(arr3){var exp,i3=-1,l3=arr3.length-1;while(i3<l3){exp=arr3[i3+=1];out+=' <li class="exp-list-item fn-visible-item"> <h3 class="exp-list-item__title"> <span class="exp-list-item__title__position">'+(exp.position)+'</span> &nbsp;-&nbsp; <span class="exp-list-item__title__place">'+(exp.place)+'</span> </h3> <div class="exp-list-item__date"> <i class="fa fa-calendar exp-list-item__date__icon"></i> <span class="exp-list-item__date__start">'+(exp.startDate)+'</span> &nbsp;-&nbsp; <span class="exp-list-item__date__end">'+(exp.endDate)+'</span> </div> <p class="exp-list-item__description">'+(exp.description)+'</p> </li> ';} } out+=' </ul> </section> <section class="section fn-section"> <h1 class="section-title">Services</h1> <ul class="icons-list"> ';var arr4=it.services;if(arr4){var service,i4=-1,l4=arr4.length-1;while(i4<l4){service=arr4[i4+=1];out+=' <li class="icons-list-item fn-visible-item"> <i class="fa fa-'+(service.icon)+' icons-list-item__icon"></i> <h4 class="icons-list-item__title">'+(service.title)+'</h4> <p class="icons-list-item__description">'+(service.description)+'</p> </li> ';} } out+=' </ul> </section> <section class="section fn-section"> <h1 class="section-title">Hobbies</h1> <ul class="icons-list"> ';var arr5=it.hobbies;if(arr5){var hobby,i5=-1,l5=arr5.length-1;while(i5<l5){hobby=arr5[i5+=1];out+=' <li class="icons-list-item fn-visible-item"> <i class="fa fa-'+(hobby.icon)+' icons-list-item__icon"></i> <h4 class="icons-list-item__title">'+(hobby.title)+'</h4> <p class="icons-list-item__description">'+(hobby.description)+'</p> </li> ';} } out+=' </ul> </section></div>';return out;
}

/***/ }),
/* 52 */
/***/ (function(module, exports) {

module.exports = function anonymous(it
/*``*/) {
var out=''; var contacts = it.commonInfo.details.filter(function (detail) { return detail.contact; }); out+='<div class="page about-page"> <section class="section who_i_am"> <h1 class="section-title">Map location</h1> <div class="contact-map"> <div class="contact-map-instance fn-map"></div> </div> </section> <section class="section"> <h1 class="section-title">Contact Info</h1> ';var arr1=contacts;if(arr1){var contact,i1=-1,l1=arr1.length-1;while(i1<l1){contact=arr1[i1+=1];out+=' <div class="contact-info"> ';if(contact.isLink){out+=' <a href="'+(contact.linkType || '')+(contact.value)+'" class="contact-info-icon link"> <i class="fa fa-'+(contact.contactIcon)+'"></i> </a> ';}else{out+=' <span class="contact-info-icon"> <i class="fa fa-'+(contact.contactIcon)+'"></i> </span> ';}out+=' <h5 class="contact-info-text">'+(contact.value)+'</h5> </div> ';} } out+=' </section></div>';return out;
}

/***/ }),
/* 53 */
/***/ (function(module, exports) {

module.exports = function anonymous(it
/*``*/) {
var out='<div class="page about-page"> <section class="section who_i_am fn-section"> <h1 class="section-title">Portfolio</h1> <ul class="portfolio-list"> ';var arr1=it.projects;if(arr1){var project,i1=-1,l1=arr1.length-1;while(i1<l1){project=arr1[i1+=1];out+=' <li class="portfolio-list-item fn-item"> <img class="portfolio-list-item__img" src="'+(project.img)+'" alt="portfolio"/> <a class="portfolio-list-item__overlay" href="'+(project.href)+'" target="_blank"> <span class="portfolio-list-item__overlay__center"> <span class="portfolio-list-item__overlay__name">'+(project.name)+'</span> <span class="portfolio-list-item__overlay__position">'+(project.position)+'</span> </span> </a> </li> ';} } out+=' </ul> </section></div>';return out;
}

/***/ }),
/* 54 */
/***/ (function(module, exports) {

module.exports = function anonymous(it
/*``*/) {
var out='<div class="page skill-page"> <section class="section fn-section"> <h1 class="section-title">Tech Skills</h1> <ul class="tech-skills"> ';var arr1=it.commonTechSkills;if(arr1){var skill,i1=-1,l1=arr1.length-1;while(i1<l1){skill=arr1[i1+=1];out+=' <li class="tech-skills-item"> <div class="tech-skills-title"> <h4 class="tech-skills-title__name">'+(skill.title)+'</h4> <p class="tech-skills-title__description">'+(skill.description)+'</p> <div class="tech-skills-title__keywords"> <span class="tech-skills-title__keywords__label">Keywords:</span> <span class="tech-skills-title__keywords__text">'+(skill.keywords)+'</span> </div> </div> <div class="tech-skills-progress fn-tech-skills-progress fn-progress" data-progress="circle" data-percent="'+(skill.level)+'" data-color="#558e6a" data-font-color="#558e6a" data-line-width="5">123</div> </li> ';} } out+=' </ul> </section> <section class="section fn-section"> <h1 class="section-title">Languages Skills</h1> <ul class="language-skills"> ';var arr2=it.languageSkills;if(arr2){var skill,i2=-1,l2=arr2.length-1;while(i2<l2){skill=arr2[i2+=1];out+=' <li class="language-skills-item"> <h4 class="language-skills-title">'+(skill.title)+' <span class="small">'+(skill.levelInWords)+'</span></h4> <div class="language-skills-progress fn-language-skills-progress fn-progress" data-progress="linear" data-percent="'+(skill.level)+'" data-color="#558e6a"></div> <p class="language-skills-description">'+(skill.description)+'</p> </li> ';} } out+=' </ul> </section> <section class="section fn-section"> <h1 class="section-title">Tools Skills</h1> <ul class="tools-skills"> ';var arr3=it.toolsSkills;if(arr3){var skill,i3=-1,l3=arr3.length-1;while(i3<l3){skill=arr3[i3+=1];out+=' <li class="tools-skills-item"> <h4 class="tools-skills-title">'+(skill.title)+'</h4> <ul class="tools-skills-progress fn-tools-skills-progress fn-progress" data-progress="points" data-percent="'+(skill.level)+'" data-color="#558e6a"></ul> </li> ';} } out+=' </ul> </section></div>';return out;
}

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

var BaseView = __webpack_require__(1);

/**
 * @constructor
 */
var MainFooter = BaseView.extend({
    /**
     * @override
     */
    template: 'layout/main-footer',
    url: 'data/about.json',

    /**
     * @override
     */
    initialize: function () {
        this.renderAfterFetch();
    }
});

module.exports = MainFooter;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mvc = __webpack_require__(3);
var layoutManager = __webpack_require__(6);

var HomePage = __webpack_require__(57);
var SkillsPage = __webpack_require__(58);
var PortfolioPage = __webpack_require__(62);
var ContactPage = __webpack_require__(63);

/**
 * Instances of pages
 * @type {Object}
 */
var pages = {
    home: new HomePage(),
    skill: new SkillsPage(),
    portfolio: new PortfolioPage(),
    contact: new ContactPage()
};

/**
 * Base router
 *
 * @constructor
 * @extends Router
 */
var BaseRouter = mvc.Router.extend({
    /**
     * Current page link
     */
    currentPage: null,

    /**
     * Pages map
     */
    pages: {
        '': pages.home,
        default: pages.home,
        skills: pages.skill,
        portfolio: pages.portfolio,
        contact: pages.contact
    },

    /**
     * Common routers map
     */
    routes: {
        '*route': 'routeHandler'
    },

    /**
     * Remove current page, refresh page and install link to new current page
     * @param newPage {PageView} - page to show
     */
    showPage: function (newPage) {
        var currentPage = this.currentPage;

        currentPage && currentPage.remove();

        newPage.append();

        this.currentPage = newPage;
    },

    /**
     * Get page and show it, refresh main nav elements
     * @param path {String} - current history pathname
     */
    routeHandler: function (path) {
        var pageKey = path || '';
        var newPage = this.pages[pageKey] || this.pages.default;

        this.showPage(newPage);

        layoutManager.updateMainNav(pageKey);
    }
});

// Create instance of router and start history functionality
var baseRouter = new BaseRouter();
mvc.history.start({pushState: true});

module.exports = baseRouter;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var PageView = __webpack_require__(2);
var dom = __webpack_require__(0);

var ANIMATIONS_TIMEOUT = 200;

/**
 * @constructor
 */
var HomePage = PageView.extend({
    /**
     * @override
     */
    template: 'pages/about-page',
    url: 'data/about.json',

    /**
     * Show all special items of section by timeout
     *
     * @override
     * @param event {Event}
     */
    handleSectionVisibleEvent: function (event) {
        var $items = dom(event.currentTarget).find('.fn-visible-item');
        var counter = 0;

        var interval = window.setInterval(function () {
            $items.eq(counter++).addClass('visible');

            if (counter === $items.length) {
                window.clearInterval(interval);
            }
        }, ANIMATIONS_TIMEOUT);
    }
});

module.exports = HomePage;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var PageView = __webpack_require__(2);
var dom = __webpack_require__(0);
var CircleProgressBar = __webpack_require__(59);
var LinearProgressBar = __webpack_require__(60);
var PointsProgressBar = __webpack_require__(61);

/**
 * @constructor
 */
var SkillsPage = PageView.extend({
    /**
     * @override
     */
    template: 'pages/skills-page',
    url: 'data/skills.json',

    /**
     * Circle progress cache (for listening resize)
     */
    circleProgresses: [],

    progressesMap: {
        circle: CircleProgressBar,
        linear: LinearProgressBar,
        points: PointsProgressBar
    },

    /**
     * Start progresses of section
     * Cache circle progresses
     *
     * @override
     * @param event {Event}
     */
    handleSectionVisibleEvent: function (event) {
        var progresses = dom(event.target).find('.fn-progress');

        progresses.forEach(function (el) {
            var progressKey = el.dataset.progress;
            var ProgressClass = this.progressesMap[progressKey];

            var progress = new ProgressClass({ el: el });
            progress.start();

            //Cache circle progresses for resize events
            if (progressKey === 'circle') {
                this.circleProgresses.push(progress);
            }
        }, this);
    },

    /**
     * Resize circle canvas on window resize
     * @override
     */
    delegateEvents: function () {
        PageView.prototype.delegateEvents.apply(this, arguments);

        dom(window).on('resize.resize-circle-progress', function () {
            this.circleProgresses.forEach(function (circleProgress) {
                circleProgress.refreshOnResize();
            });
        }.bind(this));
    },

    /**
     * @override
     */
    undelegateEvents: function () {
        PageView.prototype.undelegateEvents.apply(this, arguments);

        dom(window).off('resize.resize-circle-progress');
    }
});

module.exports = SkillsPage;

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var BaseProgressBar = __webpack_require__(4);

/**
 * @constructor
 */
var CircleProgressBar = BaseProgressBar.extend({
    /**
     * @override
     */
    template: '<canvas></canvas><span class="text"></span>',

    /**
     * @override
     */
    defaultOptions: {
        percent: 33,
        color: 'black',
        lineWidth: 3,
        radius: 100,
        lineCap: 'round', // butt, round or square
        fontSize: '2rem',
        fontColor: 'black',
        duration: 1000
    },

    /**
     * @override
     */
    setElements: function () {
        this.canvas = this.el.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.$text = this.$el.find('.text');
    },

    /**
     * @override
     */
    setElementsView: function () {
        //Set canvas size by element width
        this.options.size = this.el.clientWidth;

        this.canvas.width = this.canvas.height = this.options.size;
        this.ctx.translate(this.options.size / 2, this.options.size / 2);
        this.ctx.rotate(-1 * Math.PI);

        this.imageData = this.ctx.getImageData(0, 0, this.options.size, this.options.size);

        this.$el.css({
            position: 'relative'
        });

        this.$text.css({
            'font-size': this.options.fontSize,
            color: this.options.fontColor,
            position: 'absolute',
            left: 0,
            top: 0,
            'margin-left': '50%',
            'margin-top': '50%',
            transform: 'translate(-50%, -50%)'
        });
    },

    /**
     * @override
     */
    start: function () {
        var interval = this.options.duration / this.options.percent;
        var currentPercent = 1;

        window.setTimeout(this.ticker.bind(this, interval, currentPercent), interval);
    },

    /**
     * Interval for drawing circle by value
     *
     * @param interval {Integer}
     * @param currentPercent {Integer}
     */
    ticker: function (interval, currentPercent) {
        this.drawCircle(currentPercent++);

        if (currentPercent <= parseInt(this.options.percent, 10)) {
            window.setTimeout(this.ticker.bind(this, interval, currentPercent), interval);
        }
    },

    /**
     * Draw circle by current percent
     * @param percent {Integer}
     */
    drawCircle: function (percent) {
        var options = this.options;
        var canvas = this.canvas;
        var ctx = this.ctx;

        ctx.putImageData(this.imageData, 0, 0);

        //Draw background arc
        ctx.beginPath();
        ctx.arc(0, 0, (options.size - options.lineWidth) / 2, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineCap = options.lineCap;
        ctx.lineWidth = options.lineWidth - 2;
        ctx.stroke();
        ctx.closePath();

        //Draw main arc (by percent)
        ctx.beginPath();
        ctx.arc(0, 0, (options.size - options.lineWidth) / 2, 0, Math.PI * 2 * percent / 100, false);
        ctx.strokeStyle = options.color;
        ctx.lineCap = options.lineCap;
        ctx.lineWidth = options.lineWidth;
        ctx.stroke();
        ctx.closePath();

        //Set percent to text
        this.$text.html(percent + '%');
    },

    /**
     * Refreshing
     */
    refreshOnResize: function () {
        this.setElementsView();
        this.drawCircle(this.options.percent);
    }
});

module.exports = CircleProgressBar;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var BaseProgressBar = __webpack_require__(4);

var MILLISECONDS_IN_SECONDS = 1000;

/**
 * @constructor
 */
var LinearProgressBar = BaseProgressBar.extend({
    /**
     * @override
     */
    template: '<span class="language-skills-progress__bar fn-bar"></span>',

    /**
     * @override
     */
    defaultOptions: {
        percent: 33,
        color: 'black',
        duration: 1000,
        animationFunction: 'linear'
    },

    /**
     * @override
     */
    setElements: function () {
        this.$bar = this.$('.fn-bar');
    },

    /**
     * @override
     */
    setElementsView: function () {
        var options = this.options;

        this.$el.css({
            'position': 'relative',
            'border': '0.2rem solid ' + options.color,
            'height': '1.5rem',
            'border-radius': '0.75rem'
        });

        this.$bar.css({
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: 0,
            'background-color': options.color,
            'transition': 'width ' + (options.duration / MILLISECONDS_IN_SECONDS) + 's ' + options.animationFunction,
            '-webkit-transition': 'width ' + (options.duration / MILLISECONDS_IN_SECONDS) + 's ' + options.animationFunction
        });
    },

    /**
     * @override
     */
    start: function () {
        window.setTimeout(function () {
            this.$bar.css('width', this.options.percent + '%');
        }.bind(this));
    }
});

module.exports = LinearProgressBar;

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var BaseProgressBar = __webpack_require__(4);

var LinearProgressBar = BaseProgressBar.extend({
    /**
     * @override
     */
    template: '<li class="tools-skills-progress__item fn-item"></li>',

    /**
     * Total length of circles
     */
    totalLength: 10,

    /**
     * @override
     */
    defaultOptions: {
        percent: 33,
        color: 'black',
        delay: 200,
        duration: 400,
        animationFunction: 'linear'
    },

    /**
     * @override
     */
    render: function () {
        var html = '';

        for (var i = 0; i < this.totalLength; i++) {
            html += this.template;
        }

        this.$el.html(html);
    },

    /**
     * @override
     */
    setElements: function () {
        this.$items = this.$('.fn-item');
    },

    /**
     * @override
     */
    setElementsView: function () {
        var options = this.options;

        this.$items.css({
            'transition': 'background ' + (options.duration / 1000) + 's ' + options.animationFunction,
            '-webkit-transition': 'background ' + (options.duration / 1000) + 's ' + options.animationFunction
        });
    },

    /**
     * @override
     */
    start: function () {
        var options = this.options;
        var length = Math.round(options.percent / 10);
        var flag = 0;

        var interval = setInterval(function () {
            this.$items.eq(flag++).css('background-color', options.color);

            if (flag === length) {
                clearInterval(interval);
            }
        }.bind(this), options.delay);
    }
});

module.exports = LinearProgressBar;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var PageView = __webpack_require__(2);

var INTERVAL_DURATION = 300;

/**
 * @constructor
 */
var PortfolioPage = PageView.extend({
    /**
     * @override
     */
    url: 'data/portfolio.json',
    template: 'pages/portfolio-page',

    /**
     * Show all special items of section by timeout
     *
     * @override
     * @param event {Event}
     */
    handleSectionVisibleEvent: function (event) {
        var $items = this.$('.fn-item');
        var index = 0;

        var interval = window.setInterval(function () {
            $items.eq(index++).addClass('visible');

            if (index === $items.length) {
                window.clearInterval(interval);
            }
        }.bind(this), INTERVAL_DURATION)
    }
});

module.exports = PortfolioPage;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var PageView = __webpack_require__(2);

/**
 * @constructor
 */
var ContactPage = PageView.extend({
    /**
     * @override
     */
    template: 'pages/contact-page',
    url: 'data/about.json',

    /**
     * Google maps script link
     */
    googleMapsApiSrc: 'https://maps.googleapis.com/maps/api/js',

    /**
     * Google maps options
     */
    googleMapOptions: {
        center: {
            lat: 53.90431287332806,
            lng: 27.561290189623833
        },
        zoom: 11
    },

    initialize: function () {
        PageView.prototype.initialize.apply(this, arguments);

        this.listenToOnce(this, 'mounted', this.renderContactMap.bind(this));
    },

    /**
     * Create google map after loading script
     */
    renderContactMap: function () {
        this.loadGoogleMapsApi().then(this.createGoogleMap.bind(this));
    },

    /**
     * Create script element which load google maps api
     * @returns {Promise}
     */
    loadGoogleMapsApi: function () {
        return new Promise(function (resolve) {
            var scriptElement = document.createElement('script');

            scriptElement.async = true;
            scriptElement.src = this.googleMapsApiSrc;

            scriptElement.addEventListener('load', function () {
                resolve();
            });

            document.head.appendChild(scriptElement);
        }.bind(this));
    },

    /**
     * Render google maps, insert it and create marker
     */
    createGoogleMap: function () {
        var mapDiv = this.$('.fn-map').get(0);
        var options = this.googleMapOptions;

        var map = new google.maps.Map(mapDiv, options);

        var marker = new google.maps.Marker({
            position: options.center,
            map: map
        });
    }
});

module.exports = ContactPage;

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBlMGEyMDcyNDQ1YTMxMmM2MTQ4MSIsIndlYnBhY2s6Ly8vLi9qcy9saWIvZG9tLmpzIiwid2VicGFjazovLy8uL2pzL2Jhc2UvYmFzZS12aWV3LmpzIiwid2VicGFjazovLy8uL2pzL2Jhc2UvcGFnZS12aWV3LmpzIiwid2VicGFjazovLy8uL2pzL2xpYi9tdmMuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYmFzZS9wcm9ncmVzcy1iYXIuanMiLCJ3ZWJwYWNrOi8vLy4vZm9udHMvZm9udC1hd2Vzb21lL2ZvbnRhd2Vzb21lLXdlYmZvbnQuZW90Iiwid2VicGFjazovLy8uL2pzL2xheW91dC9sYXlvdXQtbWFuYWdlci5qcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL2pib25lL2Rpc3QvamJvbmUuanMiLCJ3ZWJwYWNrOi8vLy4vanMvaW5pdC5qcyIsIndlYnBhY2s6Ly8vLi9sZXNzL2NvbW1vbi5sZXNzPzQwZWEiLCJ3ZWJwYWNrOi8vLy4vbGVzcy9jb21tb24ubGVzcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzIiwid2VicGFjazovLy8uL2ZvbnRzL1JvYm90by9Sb2JvdG8tVGhpbi50dGYiLCJ3ZWJwYWNrOi8vLy4vZm9udHMvUm9ib3RvL1JvYm90by1UaGluSXRhbGljLnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9Sb2JvdG8vUm9ib3RvLUxpZ2h0LnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9Sb2JvdG8vUm9ib3RvLUxpZ2h0SXRhbGljLnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9Sb2JvdG8vUm9ib3RvLVJlZ3VsYXIudHRmIiwid2VicGFjazovLy8uL2ZvbnRzL1JvYm90by9Sb2JvdG8tSXRhbGljLnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9Sb2JvdG8vUm9ib3RvLU1lZGl1bS50dGYiLCJ3ZWJwYWNrOi8vLy4vZm9udHMvUm9ib3RvL1JvYm90by1NZWRpdW1JdGFsaWMudHRmIiwid2VicGFjazovLy8uL2ZvbnRzL1JvYm90by9Sb2JvdG8tQm9sZC50dGYiLCJ3ZWJwYWNrOi8vLy4vZm9udHMvUm9ib3RvL1JvYm90by1Cb2xkSXRhbGljLnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9Sb2JvdG8vUm9ib3RvLUJsYWNrLnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9Sb2JvdG8vUm9ib3RvLUJsYWNrSXRhbGljLnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9mb250LWF3ZXNvbWUvZm9udGF3ZXNvbWUtd2ViZm9udC53b2ZmMiIsIndlYnBhY2s6Ly8vLi9mb250cy9mb250LWF3ZXNvbWUvZm9udGF3ZXNvbWUtd2ViZm9udC53b2ZmIiwid2VicGFjazovLy8uL2ZvbnRzL2ZvbnQtYXdlc29tZS9mb250YXdlc29tZS13ZWJmb250LnR0ZiIsIndlYnBhY2s6Ly8vLi9mb250cy9mb250LWF3ZXNvbWUvZm9udGF3ZXNvbWUtd2ViZm9udC5zdmciLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvZmV0Y2gtcG9seWZpbGwvZmV0Y2guanMiLCJ3ZWJwYWNrOi8vLy4vaW1nIFxcLihpY298cG5nfGpwZykkLyIsIndlYnBhY2s6Ly8vLi9pbWcvYXZhMS5qcGciLCJ3ZWJwYWNrOi8vLy4vaW1nL2Zhdmljb24uaWNvIiwid2VicGFjazovLy8uL2ltZy9wb3J0Zm9saW8vZnJlZWxhbmNlLmpwZyIsIndlYnBhY2s6Ly8vLi9pbWcvcG9ydGZvbGlvL2diYXMuanBnIiwid2VicGFjazovLy8uL2ltZy9wb3J0Zm9saW8vZ2Nhcy5qcGciLCJ3ZWJwYWNrOi8vLy4vaW1nL3BvcnRmb2xpby9nb2Zhc3QuanBnIiwid2VicGFjazovLy8uL2ltZy9wb3J0Zm9saW8vZ290LmpwZyIsIndlYnBhY2s6Ly8vLi9pbWcvcG9ydGZvbGlvL2hpcW8uanBnIiwid2VicGFjazovLy8uL2ltZy9wb3J0Zm9saW8vbG9vay5qcGciLCJ3ZWJwYWNrOi8vLy4vaW1nL3BvcnRmb2xpby9ub2RlLmpwZyIsIndlYnBhY2s6Ly8vLi9pbWcvcG9ydGZvbGlvL3Nwb3J0Y29tLmpwZyIsIndlYnBhY2s6Ly8vLi9pbWcvdGhlLXJvY2suanBnIiwid2VicGFjazovLy8uLi9ub2RlX21vZHVsZXMvd2VicGFjay9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9qcy9sYXlvdXQvbWFpbi1oZWFkZXIuanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9iYWNrYm9uZS9iYWNrYm9uZS5qcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL3dlYnBhY2svYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vdGVtcGxhdGVzIF5cXC5cXC8uKlxcLmRvdCQiLCJ3ZWJwYWNrOi8vLy4vdGVtcGxhdGVzL2xheW91dC9tYWluLWZvb3Rlci5kb3QiLCJ3ZWJwYWNrOi8vLy4vdGVtcGxhdGVzL2xheW91dC9tYWluLWhlYWRlci5kb3QiLCJ3ZWJwYWNrOi8vLy4vdGVtcGxhdGVzL3BhZ2VzL2Fib3V0LXBhZ2UuZG90Iiwid2VicGFjazovLy8uL3RlbXBsYXRlcy9wYWdlcy9jb250YWN0LXBhZ2UuZG90Iiwid2VicGFjazovLy8uL3RlbXBsYXRlcy9wYWdlcy9wb3J0Zm9saW8tcGFnZS5kb3QiLCJ3ZWJwYWNrOi8vLy4vdGVtcGxhdGVzL3BhZ2VzL3NraWxscy1wYWdlLmRvdCIsIndlYnBhY2s6Ly8vLi9qcy9sYXlvdXQvbWFpbi1mb290ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYmFzZS9iYXNlLXJvdXRlci5qcyIsIndlYnBhY2s6Ly8vLi9qcy9wYWdlcy9ob21lLXBhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vanMvcGFnZXMvc2tpbGxzLXBhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vanMvdG9vbHMvcHJvZ3Jlc3MtYmFyL2NpcmNsZS5qcyIsIndlYnBhY2s6Ly8vLi9qcy90b29scy9wcm9ncmVzcy1iYXIvbGluZWFyLmpzIiwid2VicGFjazovLy8uL2pzL3Rvb2xzL3Byb2dyZXNzLWJhci9wb2ludHMuanMiLCJ3ZWJwYWNrOi8vLy4vanMvcGFnZXMvcG9ydGZvbGlvLXBhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vanMvcGFnZXMvY29udGFjdC1wYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGUwYTIwNzI0NDVhMzEyYzYxNDgxIiwiLy8gTGlrZSBKYm9uZSBsaWJyYXJ5XHJcblxyXG52YXIgZG9tID0gcmVxdWlyZSgnamJvbmUnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZG9tO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvbGliL2RvbS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgbXZjID0gcmVxdWlyZSgnbGliL212YycpO1xyXG5cclxuLyoqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAZXh0ZW5kIEJhY2tib25lIFZpZXdcclxuICovXHJcbnZhciBCYXNlVmlldyA9IG12Yy5WaWV3LmV4dGVuZCh7XHJcbiAgICAvKipcclxuICAgICAqIFBhcmFtZXRlcnMgZm9yICdyZW5kZXJBZnRlckZldGNoJyBtZXRob2RcclxuICAgICAqIHRlbXBsYXRlIHtTdHJpbmd9IC0gdGVtcGxhdGUgbmFtZVxyXG4gICAgICogdXJsIHtTdHJpbmd9IC0gZGF0YSB1cmxcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6IG51bGwsXHJcbiAgICB1cmw6IG51bGwsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXJlZCBmbGFnXHJcbiAgICAgKi9cclxuICAgIF9yZW5kZXJlZDogZmFsc2UsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gRG9UIHRlbXBsYXRlIGJ5IHRlbXBsYXRlIG5hbWUgb3Igb25seSB0ZW1wbGF0ZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGVOYW1lXHJcbiAgICAgKiBAcGFyYW0geyp9IGRhdGFcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHRtcGw6IGZ1bmN0aW9uICh0ZW1wbGF0ZU5hbWUsIGRhdGEpIHtcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXF1aXJlKCd0ZW1wbGF0ZXMvJyArIHRlbXBsYXRlTmFtZSArICcuZG90Jyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZS5jYWxsKHtcclxuICAgICAgICAgICAgdG1wbDogdGhpcy50bXBsXHJcbiAgICAgICAgfSwgZGF0YSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGRhdGEgZnJvbSB1cmwgYW5kIGFmdGVyIGl0IHJlbmRlciB0ZW1wbGF0ZSB3aXRoIHJlY2VpdmVkIGRhdGFcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICAgICAqL1xyXG4gICAgcmVuZGVyQWZ0ZXJGZXRjaDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFNob3cgbG9hZGluZyAoc3Bpbm5lciBtYXliZSlcclxuICAgICAgICB0aGlzLnNob3dMb2FkaW5nQ29udGVudCgpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGZXRjaCwgdHJhbnNmb3JtIGRhdGEgdG8gb2JqZWN0LCByZW5kZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICByZXR1cm4gd2luZG93LmZldGNoKHRoaXMudXJsKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5odG1sKHRoaXMudG1wbCh0aGlzLnRlbXBsYXRlLCBkYXRhKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdyZW5kZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlciBsb2FkaW5nIGNvbnRlbnRcclxuICAgICAqL1xyXG4gICAgc2hvd0xvYWRpbmdDb250ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuaHRtbCgnPHNwYW4gY2xhc3M9XCJsb2FkaW5nXCI+TG9hZGluZzwvc3Bhbj4nKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VWaWV3O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvYmFzZS9iYXNlLXZpZXcuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIEJhc2VWaWV3ID0gcmVxdWlyZSgnYmFzZS9iYXNlLXZpZXcnKTtcclxudmFyIGRvbSA9IHJlcXVpcmUoJ2xpYi9kb20nKTtcclxuXHJcbnZhciAkcGFnZUNvbnRhaW5lciA9IGRvbSgnLnBhZ2UtY29udGFpbmVyJyk7XHJcblxyXG4vKipcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBleHRlbmRzIHtCYXNlVmlld31cclxuICovXHJcbnZhciBQYWdlVmlldyA9IEJhc2VWaWV3LmV4dGVuZCh7XHJcbiAgICAvKipcclxuICAgICAqIE1vdW50ZWQgZmxhZ1xyXG4gICAgICovXHJcbiAgICBfbW91bnRlZDogZmFsc2UsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZWN0aW9uIGFib3ZlIHdpbmRvdyBldmVudCBoYW5kbGVyc1xyXG4gICAgICovXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgICAnYWJvdmVXaW5kb3cgLmZuLXNlY3Rpb24nOiAnaGFuZGxlU2VjdGlvblZpc2libGVFdmVudCdcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIEJhc2VWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyQWZ0ZXJGZXRjaCgpO1xyXG5cclxuICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ub09uY2UodGhpcywgJ21vdW50ZWQnLCB0aGlzLl9zZXRTY3JvbGxPcHRpb25zLmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlY3Rpb24gdmlzaWJsZSBldmVudCBsaXN0ZW5lclxyXG4gICAgICovXHJcbiAgICBoYW5kbGVTZWN0aW9uVmlzaWJsZUV2ZW50OiBmdW5jdGlvbiAoKSB7fSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFwcGVuZGluZyBwYWdlIGVsZW1lbnQgdG8gcGFnZSBjb250YWluZXJcclxuICAgICAqL1xyXG4gICAgYXBwZW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHBhZ2VDb250YWluZXIuYXBwZW5kKHRoaXMuZWwpO1xyXG5cclxuICAgICAgICB0aGlzLmRlbGVnYXRlRXZlbnRzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXJNb3VudGVkRXZlbnRJZk5lZWQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgQmFzZVZpZXcucHJvdG90eXBlLnJlbW92ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cclxuICAgICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YWxsIHZpZXdlZCBzZWN0aW9ucyBhbmQgcmVsYXRpdmUgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0U2Nyb2xsT3B0aW9uczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudmlld2VkU2VjdGlvbnMgPSB0aGlzLiQoJy5mbi1zZWN0aW9uJykuZ2V0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RvZ2dsZVNjcm9sbEV2ZW50cyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5oYW5kbGVWaWV3ZWRTZWN0aW9uc1Bvc2l0aW9uKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJpZ2dlciBtb3VudGVkIGV2ZW50IGlmIHZpZXcgYWxyZWFkeSB3YXMgcmVuZGVyZWQsIGVsc2UgLSBoYW5kbGUgcmVuZGVyIGV2ZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfdHJpZ2dlck1vdW50ZWRFdmVudElmTmVlZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVkID8gdGhpcy5fdHJpZ2dlck1vdW50ZWRFdmVudCgpIDogdGhpcy5saXN0ZW5Ub09uY2UodGhpcywgJ3JlbmRlcmVkJywgdGhpcy5fdHJpZ2dlck1vdW50ZWRFdmVudC5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YWxsIG1vdW50ZWQgZmxhZyB0byB0cnVlLCBmaXJlIGV2ZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfdHJpZ2dlck1vdW50ZWRFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX21vdW50ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ21vdW50ZWQnKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBCYXNlVmlldy5wcm90b3R5cGUuZGVsZWdhdGVFdmVudHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdG9nZ2xlU2Nyb2xsRXZlbnRzKHRydWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICovXHJcbiAgICB1bmRlbGVnYXRlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgQmFzZVZpZXcucHJvdG90eXBlLnVuZGVsZWdhdGVFdmVudHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdG9nZ2xlU2Nyb2xsRXZlbnRzKGZhbHNlKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgd2luZG93IHNjcm9sbCBldmVudCBoYW5kbGVycyBpZiB2aWV3IHdhcyBtb3VudGVkIGFuZCB0aGVyZSBhcmUgdmlld2VkIHNlY3Rpb25zXHJcbiAgICAgKiBAcGFyYW0gZmxhZyB7Qm9vbGVhbn0gLSBvZmYgb3Igb24gZXZlbnRzIGhhbmRsZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfdG9nZ2xlU2Nyb2xsRXZlbnRzOiBmdW5jdGlvbiAoZmxhZykge1xyXG4gICAgICAgIGlmICh0aGlzLl9tb3VudGVkICYmIHRoaXMudmlld2VkU2VjdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGRvbSh3aW5kb3cpW2ZsYWcgPyAnb24nIDogJ29mZiddKCdzY3JvbGwnICsgJy5zY3JvbGwnICsgdGhpcy5jaWQsIHRoaXMuaGFuZGxlVmlld2VkU2VjdGlvbnNQb3NpdGlvbi5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgYWxsIHZpZXdlZCBzZWN0aW9ucywgaWYgcG9zaXRpb25zIGlzIG1hdGNoZWQgdHJpZ2dlciBhYm92ZSB3aW5kb3cgZXZlbnQgYW5kIHJlbW92ZSBlbGVtZW50IGZyb20gdmlld2VkIHNlY3Rpb25zXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZVZpZXdlZFNlY3Rpb25zUG9zaXRpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJHNlY3Rpb25zID0gdGhpcy52aWV3ZWRTZWN0aW9ucztcclxuICAgICAgICB2YXIgdmlld2VkRWxlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgJHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICAgICAgICAgIHZhciBlbGVtUG9zaXRpb25ZID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG5cclxuICAgICAgICAgICAgaWYgKGVsZW1Qb3NpdGlvblkgPiAwICYmIGVsZW1Qb3NpdGlvblkgPCB3aW5kb3dIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGRvbShlbCkudHJpZ2dlcignYWJvdmVXaW5kb3cnKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2aWV3ZWRFbGVtcy5wdXNoKGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG5cclxuICAgICAgICB2aWV3ZWRFbGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICAkc2VjdGlvbnMuc3BsaWNlKCRzZWN0aW9ucy5pbmRleE9mKGVsKSwgMSk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYWdlVmlldztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL2Jhc2UvcGFnZS12aWV3LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIExpa2UgYmFja2JvbmUgbGlicmFyeVxyXG5cclxudmFyIG12YyA9IHJlcXVpcmUoJ2JhY2tib25lJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG12YztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL2xpYi9tdmMuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIEJhc2VWaWV3ID0gcmVxdWlyZSgnYmFzZS9iYXNlLXZpZXcnKTtcclxuXHJcbi8qKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGV4dGVuZHMge0Jhc2VWaWV3fVxyXG4gKi9cclxudmFyIEJhc2VQcm9ncmVzc0JhciA9IEJhc2VWaWV3LmV4dGVuZCh7XHJcbiAgICAvKipcclxuICAgICAqIElubnRlciB0ZW1wbGF0ZSBmb3IgcHJvZ3Jlc3Mgdmlld1xyXG4gICAgICovXHJcbiAgICB0ZW1wbGF0ZTogJycsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0IG9wdGlvbnMgZm9yIHByb2dyZXNzIChjb2xvciwgd2lkdGggYW5kIHNvIG9uKVxyXG4gICAgICovXHJcbiAgICBkZWZhdWx0T3B0aW9uczoge30sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuc2V0RWxlbWVudChvcHRpb25zLmVsKTtcclxuICAgICAgICB0aGlzLnNldE9wdGlvbnMoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG4gICAgICAgIHRoaXMuc2V0RWxlbWVudHMoKTtcclxuICAgICAgICB0aGlzLnNldEVsZW1lbnRzVmlldygpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc3RhbGwgb3B0aW9ucyBmcm9tIGRlZmF1bHQgb3B0aW9ucyBhbmQgZWxlbWVudCBkYXRhc2V0XHJcbiAgICAgKi9cclxuICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuJGVsLmdldCgwKS5kYXRhc2V0O1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5kZWZhdWx0T3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gZGF0YVtrZXldIHx8IHRoaXMuZGVmYXVsdE9wdGlvbnNba2V5XTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy4kZWwuaHRtbCh0aGlzLnRlbXBsYXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgaGVscCBkb20gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgc2V0RWxlbWVudHM6IGZ1bmN0aW9uICgpIHt9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGRlZmF1bHQgZWxlbWVudHMgdmlld1xyXG4gICAgICovXHJcbiAgICBzZXRFbGVtZW50c1ZpZXc6IGZ1bmN0aW9uICgpIHt9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgcHJvZ3Jlc3MgYW5pbWF0aW9uXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzZVByb2dyZXNzQmFyO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvYmFzZS9wcm9ncmVzcy1iYXIuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvZm9udC1hd2Vzb21lLy9mb250YXdlc29tZS13ZWJmb250LmVvdD8zMjQwMGY0ZTA4OTMyYTk0ZDhiZmQyNDIyNzAyYzQ0NlwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZm9udHMvZm9udC1hd2Vzb21lL2ZvbnRhd2Vzb21lLXdlYmZvbnQuZW90XG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBkb20gPSByZXF1aXJlKCdsaWIvZG9tJyk7XHJcbnZhciBNYWluSGVhZGVyID0gcmVxdWlyZSgnbGF5b3V0L21haW4taGVhZGVyJyk7XHJcbnZhciBNYWluRm9vdGVyID0gcmVxdWlyZSgnbGF5b3V0L21haW4tZm9vdGVyJyk7XHJcblxyXG4vKipcclxuICogTGF5b3V0IG1hbmFnZXIgY29uc3RydWN0b3JcclxuICpcclxuICogQWRkIGxheW91dCBlbGVtZW50cyB0byBodG1sXHJcbiAqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxudmFyIExheW91dE1hbmFnZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZWxlbXMgPSB0aGlzLmVsZW1lbnRzO1xyXG5cclxuICAgIGRvbSgnLmZuLW1haW4taGVhZGVyJykuYXBwZW5kKGVsZW1zLm1haW5IZWFkZXIuZWwpO1xyXG4gICAgZG9tKCcuZm4tbWFpbi1mb290ZXInKS5hcHBlbmQoZWxlbXMubWFpbkZvb3Rlci5lbCk7XHJcbn07XHJcblxyXG5MYXlvdXRNYW5hZ2VyLnByb3RvdHlwZSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogTGF5b3V0IGVsZW1lbnRzIGxpbmtzXHJcbiAgICAgKi9cclxuICAgIGVsZW1lbnRzOiB7XHJcbiAgICAgICAgbWFpbkhlYWRlcjogbmV3IE1haW5IZWFkZXIoKSxcclxuICAgICAgICBtYWluRm9vdGVyOiBuZXcgTWFpbkZvb3RlcigpXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIG1haW4gaGVhZGVyIG5hdiBieSBwYXRoXHJcbiAgICAgKiBAcGFyYW0gcGF0aCB7U3RyaW5nfSAtIGhpc3RvcnkgcGF0aG5hbWVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlTWFpbk5hdjogZnVuY3Rpb24gKHBhdGgpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzLm1haW5IZWFkZXIudXBkYXRlTmF2KHBhdGgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTGF5b3V0TWFuYWdlcigpO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL2xheW91dC9sYXlvdXQtbWFuYWdlci5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiFcbiAqIGpCb25lIHYxLjIuMCAtIDIwMTYtMDQtMTMgLSBMaWJyYXJ5IGZvciBET00gbWFuaXB1bGF0aW9uXG4gKlxuICogaHR0cDovL2pib25lLmpzLm9yZ1xuICpcbiAqIENvcHlyaWdodCAyMDE2IEFsZXhleSBLdXByaXlhbmVua29cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4oZnVuY3Rpb24gKHdpbikge1xuXG52YXJcbi8vIGNhY2hlIHByZXZpb3VzIHZlcnNpb25zXG5fJCA9IHdpbi4kLFxuX2pCb25lID0gd2luLmpCb25lLFxuXG4vLyBRdWljayBtYXRjaCBhIHN0YW5kYWxvbmUgdGFnXG5ycXVpY2tTaW5nbGVUYWcgPSAvXjwoXFx3KylcXHMqXFwvPz4kLyxcblxuLy8gQSBzaW1wbGUgd2F5IHRvIGNoZWNrIGZvciBIVE1MIHN0cmluZ3Ncbi8vIFByaW9yaXRpemUgI2lkIG92ZXIgPHRhZz4gdG8gYXZvaWQgWFNTIHZpYSBsb2NhdGlvbi5oYXNoXG5ycXVpY2tFeHByID0gL14oPzpbXiM8XSooPFtcXHdcXFddKz4pW14+XSokfCMoW1xcd1xcLV0qKSQpLyxcblxuLy8gQWxpYXMgZm9yIGZ1bmN0aW9uXG5zbGljZSA9IFtdLnNsaWNlLFxuc3BsaWNlID0gW10uc3BsaWNlLFxua2V5cyA9IE9iamVjdC5rZXlzLFxuXG4vLyBBbGlhcyBmb3IgZ2xvYmFsIHZhcmlhYmxlc1xuZG9jID0gZG9jdW1lbnQsXG5cbmlzU3RyaW5nID0gZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIGVsID09PSBcInN0cmluZ1wiO1xufSxcbmlzT2JqZWN0ID0gZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gZWwgaW5zdGFuY2VvZiBPYmplY3Q7XG59LFxuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICh7fSkudG9TdHJpbmcuY2FsbChlbCkgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIjtcbn0sXG5pc0FycmF5ID0gZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShlbCk7XG59LFxuakJvbmUgPSBmdW5jdGlvbihlbGVtZW50LCBkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBmbi5pbml0KGVsZW1lbnQsIGRhdGEpO1xufSxcbmZuO1xuXG4vLyBzZXQgcHJldmlvdXMgdmFsdWVzIGFuZCByZXR1cm4gdGhlIGluc3RhbmNlIHVwb24gY2FsbGluZyB0aGUgbm8tY29uZmxpY3QgbW9kZVxuakJvbmUubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbi4kID0gXyQ7XG4gICAgd2luLmpCb25lID0gX2pCb25lO1xuXG4gICAgcmV0dXJuIGpCb25lO1xufTtcblxuZm4gPSBqQm9uZS5mbiA9IGpCb25lLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBlbGVtZW50cywgdGFnLCB3cmFwZXIsIGZyYWdtZW50O1xuXG4gICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzU3RyaW5nKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgc2luZ2xlIERPTSBlbGVtZW50XG4gICAgICAgICAgICBpZiAodGFnID0gcnF1aWNrU2luZ2xlVGFnLmV4ZWMoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzWzBdID0gZG9jLmNyZWF0ZUVsZW1lbnQodGFnWzFdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxlbmd0aCA9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRyKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3JlYXRlIERPTSBjb2xsZWN0aW9uXG4gICAgICAgICAgICBpZiAoKHRhZyA9IHJxdWlja0V4cHIuZXhlYyhlbGVtZW50KSkgJiYgdGFnWzFdKSB7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSBkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgICAgIHdyYXBlciA9IGRvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIHdyYXBlci5pbm5lckhUTUwgPSBlbGVtZW50O1xuICAgICAgICAgICAgICAgIHdoaWxlICh3cmFwZXIubGFzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHdyYXBlci5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudHMgPSBzbGljZS5jYWxsKGZyYWdtZW50LmNoaWxkTm9kZXMpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGpCb25lLm1lcmdlKHRoaXMsIGVsZW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZpbmQgRE9NIGVsZW1lbnRzIHdpdGggcXVlcnlTZWxlY3RvckFsbFxuICAgICAgICAgICAgaWYgKGpCb25lLmlzRWxlbWVudChkYXRhKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBqQm9uZShkYXRhKS5maW5kKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gakJvbmUubWVyZ2UodGhpcywgZWxlbWVudHMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFdyYXAgRE9NRWxlbWVudFxuICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSkge1xuICAgICAgICAgICAgdGhpc1swXSA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IDE7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJ1biBmdW5jdGlvblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXR1cm4gakJvbmUgZWxlbWVudCBhcyBpc1xuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIGpCb25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldHVybiBlbGVtZW50IHdyYXBwZWQgYnkgakJvbmVcbiAgICAgICAgcmV0dXJuIGpCb25lLm1ha2VBcnJheShlbGVtZW50LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgcG9wOiBbXS5wb3AsXG4gICAgcHVzaDogW10ucHVzaCxcbiAgICByZXZlcnNlOiBbXS5yZXZlcnNlLFxuICAgIHNoaWZ0OiBbXS5zaGlmdCxcbiAgICBzb3J0OiBbXS5zb3J0LFxuICAgIHNwbGljZTogW10uc3BsaWNlLFxuICAgIHNsaWNlOiBbXS5zbGljZSxcbiAgICBpbmRleE9mOiBbXS5pbmRleE9mLFxuICAgIGZvckVhY2g6IFtdLmZvckVhY2gsXG4gICAgdW5zaGlmdDogW10udW5zaGlmdCxcbiAgICBjb25jYXQ6IFtdLmNvbmNhdCxcbiAgICBqb2luOiBbXS5qb2luLFxuICAgIGV2ZXJ5OiBbXS5ldmVyeSxcbiAgICBzb21lOiBbXS5zb21lLFxuICAgIGZpbHRlcjogW10uZmlsdGVyLFxuICAgIG1hcDogW10ubWFwLFxuICAgIHJlZHVjZTogW10ucmVkdWNlLFxuICAgIHJlZHVjZVJpZ2h0OiBbXS5yZWR1Y2VSaWdodCxcbiAgICBsZW5ndGg6IDBcbn07XG5cbmZuLmNvbnN0cnVjdG9yID0gakJvbmU7XG5cbmZuLmluaXQucHJvdG90eXBlID0gZm47XG5cbmpCb25lLnNldElkID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgamlkID0gZWwuamlkO1xuXG4gICAgaWYgKGVsID09PSB3aW4pIHtcbiAgICAgICAgamlkID0gXCJ3aW5kb3dcIjtcbiAgICB9IGVsc2UgaWYgKGVsLmppZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVsLmppZCA9IGppZCA9ICsrakJvbmUuX2NhY2hlLmppZDtcbiAgICB9XG5cbiAgICBpZiAoIWpCb25lLl9jYWNoZS5ldmVudHNbamlkXSkge1xuICAgICAgICBqQm9uZS5fY2FjaGUuZXZlbnRzW2ppZF0gPSB7fTtcbiAgICB9XG59O1xuXG5qQm9uZS5nZXREYXRhID0gZnVuY3Rpb24oZWwpIHtcbiAgICBlbCA9IGVsIGluc3RhbmNlb2YgakJvbmUgPyBlbFswXSA6IGVsO1xuXG4gICAgdmFyIGppZCA9IGVsID09PSB3aW4gPyBcIndpbmRvd1wiIDogZWwuamlkO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgamlkOiBqaWQsXG4gICAgICAgIGV2ZW50czogakJvbmUuX2NhY2hlLmV2ZW50c1tqaWRdXG4gICAgfTtcbn07XG5cbmpCb25lLmlzRWxlbWVudCA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsICYmIGVsIGluc3RhbmNlb2YgakJvbmUgfHwgZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCB8fCBpc1N0cmluZyhlbCk7XG59O1xuXG5qQm9uZS5fY2FjaGUgPSB7XG4gICAgZXZlbnRzOiB7fSxcbiAgICBqaWQ6IDBcbn07XG5cbmZ1bmN0aW9uIGlzQXJyYXlsaWtlKG9iaikge1xuICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoLFxuICAgICAgICB0eXBlID0gdHlwZW9mIG9iajtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHR5cGUpIHx8IG9iaiA9PT0gd2luKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAob2JqLm5vZGVUeXBlID09PSAxICYmIGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXNBcnJheSh0eXBlKSB8fCBsZW5ndGggPT09IDAgfHxcbiAgICAgICAgdHlwZW9mIGxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW5ndGggPiAwICYmIChsZW5ndGggLSAxKSBpbiBvYmo7XG59XG5cbmZuLnB1c2hTdGFjayA9IGZ1bmN0aW9uKGVsZW1zKSB7XG4gICAgdmFyIHJldCA9IGpCb25lLm1lcmdlKHRoaXMuY29uc3RydWN0b3IoKSwgZWxlbXMpO1xuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbmpCb25lLm1lcmdlID0gZnVuY3Rpb24oZmlyc3QsIHNlY29uZCkge1xuICAgIHZhciBsID0gc2Vjb25kLmxlbmd0aCxcbiAgICAgICAgaSA9IGZpcnN0Lmxlbmd0aCxcbiAgICAgICAgaiA9IDA7XG5cbiAgICB3aGlsZSAoaiA8IGwpIHtcbiAgICAgICAgZmlyc3RbaSsrXSA9IHNlY29uZFtqKytdO1xuICAgIH1cblxuICAgIGZpcnN0Lmxlbmd0aCA9IGk7XG5cbiAgICByZXR1cm4gZmlyc3Q7XG59O1xuXG5qQm9uZS5jb250YWlucyA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgY29udGFpbmVkKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5jb250YWlucyhjb250YWluZWQpO1xufTtcblxuakJvbmUuZXh0ZW5kID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdmFyIHRnO1xuXG4gICAgc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAxKS5mb3JFYWNoKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICB0ZyA9IHRhcmdldDsgLy9jYWNoaW5nIHRhcmdldCBmb3IgcGVyZiBpbXByb3ZlbWVudFxuXG4gICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgdGdbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG59O1xuXG5qQm9uZS5tYWtlQXJyYXkgPSBmdW5jdGlvbihhcnIsIHJlc3VsdHMpIHtcbiAgICB2YXIgcmV0ID0gcmVzdWx0cyB8fCBbXTtcblxuICAgIGlmIChhcnIgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKGlzQXJyYXlsaWtlKGFycikpIHtcbiAgICAgICAgICAgIGpCb25lLm1lcmdlKHJldCwgaXNTdHJpbmcoYXJyKSA/IFthcnJdIDogYXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldC5wdXNoKGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xufTtcblxuakJvbmUudW5pcXVlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldO1xuICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YodmFsdWUpIDwgMCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5mdW5jdGlvbiBCb25lRXZlbnQoZSwgZGF0YSkge1xuICAgIHZhciBrZXksIHNldHRlcjtcblxuICAgIHRoaXMub3JpZ2luYWxFdmVudCA9IGU7XG5cbiAgICBzZXR0ZXIgPSBmdW5jdGlvbihrZXksIGUpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gXCJwcmV2ZW50RGVmYXVsdFwiKSB7XG4gICAgICAgICAgICB0aGlzW2tleV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBlW2tleV0oKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzW2tleV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVba2V5XSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKGVba2V5XSkpIHtcbiAgICAgICAgICAgIHRoaXNba2V5XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlW2tleV0oKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzW2tleV0gPSBlW2tleV07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZm9yIChrZXkgaW4gZSkge1xuICAgICAgICBpZiAoZVtrZXldIHx8IHR5cGVvZiBlW2tleV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc2V0dGVyLmNhbGwodGhpcywga2V5LCBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGpCb25lLmV4dGVuZCh0aGlzLCBkYXRhLCB7XG4gICAgICAgIGlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhIXRoaXMuaW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmpCb25lLkV2ZW50ID0gZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICB2YXIgbmFtZXNwYWNlLCBldmVudFR5cGU7XG5cbiAgICBpZiAoZXZlbnQudHlwZSAmJiAhZGF0YSkge1xuICAgICAgICBkYXRhID0gZXZlbnQ7XG4gICAgICAgIGV2ZW50ID0gZXZlbnQudHlwZTtcbiAgICB9XG5cbiAgICBuYW1lc3BhY2UgPSBldmVudC5zcGxpdChcIi5cIikuc3BsaWNlKDEpLmpvaW4oXCIuXCIpO1xuICAgIGV2ZW50VHlwZSA9IGV2ZW50LnNwbGl0KFwiLlwiKVswXTtcblxuICAgIGV2ZW50ID0gZG9jLmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gakJvbmUuZXh0ZW5kKGV2ZW50LCB7XG4gICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlLFxuICAgICAgICBpc0RlZmF1bHRQcmV2ZW50ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQ7XG4gICAgICAgIH1cbiAgICB9LCBkYXRhKTtcbn07XG5cbmpCb25lLmV2ZW50ID0ge1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgaGFuZGxlciB0byBhbiBldmVudCBmb3IgdGhlIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtOb2RlfSAgICAgICAgZWwgICAgICAgICAtIEV2ZW50cyB3aWxsIGJlIGF0dGFjaGVkIHRvIHRoaXMgRE9NIE5vZGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gICAgICB0eXBlcyAgICAgIC0gT25lIG9yIG1vcmUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzIGFuZCBvcHRpb25hbCBuYW1lc3BhY2VzXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gICAgaGFuZGxlciAgICAtIEEgZnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gICAgICBbZGF0YV0gICAgIC0gRGF0YSB0byBiZSBwYXNzZWQgdG8gdGhlIGhhbmRsZXIgaW4gZXZlbnQuZGF0YVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSAgICAgIFtzZWxlY3Rvcl0gLSBBIHNlbGVjdG9yIHN0cmluZyB0byBmaWx0ZXIgdGhlIGRlc2NlbmRhbnRzIG9mIHRoZSBzZWxlY3RlZCBlbGVtZW50c1xuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24oZWwsIHR5cGVzLCBoYW5kbGVyLCBkYXRhLCBzZWxlY3Rvcikge1xuICAgICAgICBqQm9uZS5zZXRJZChlbCk7XG5cbiAgICAgICAgdmFyIGV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBqQm9uZS5ldmVudC5kaXNwYXRjaC5jYWxsKGVsLCBlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBldmVudHMgPSBqQm9uZS5nZXREYXRhKGVsKS5ldmVudHMsXG4gICAgICAgICAgICBldmVudFR5cGUsIHQsIGV2ZW50O1xuXG4gICAgICAgIHR5cGVzID0gdHlwZXMuc3BsaXQoXCIgXCIpO1xuICAgICAgICB0ID0gdHlwZXMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAodC0tKSB7XG4gICAgICAgICAgICBldmVudCA9IHR5cGVzW3RdO1xuXG4gICAgICAgICAgICBldmVudFR5cGUgPSBldmVudC5zcGxpdChcIi5cIilbMF07XG4gICAgICAgICAgICBldmVudHNbZXZlbnRUeXBlXSA9IGV2ZW50c1tldmVudFR5cGVdIHx8IFtdO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRzW2V2ZW50VHlwZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGUgd2l0aCBwcmV2aW91cyBldmVudCBoYW5kbGVyXG4gICAgICAgICAgICAgICAgZXZlbnRIYW5kbGVyID0gZXZlbnRzW2V2ZW50VHlwZV1bMF0uZm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIgJiYgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50SGFuZGxlciwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBldmVudHNbZXZlbnRUeXBlXS5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IGV2ZW50LnNwbGl0KFwiLlwiKS5zcGxpY2UoMSkuam9pbihcIi5cIiksXG4gICAgICAgICAgICAgICAgZm46IGV2ZW50SGFuZGxlcixcbiAgICAgICAgICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICBvcmlnaW5mbjogaGFuZGxlclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0gIHtOb2RlfSAgICAgICBlbCAgICAgICAgLSBFdmVudHMgd2lsbCBiZSBkZWF0dGFjaGVkIGZyb20gdGhpcyBET00gTm9kZVxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gICAgIHR5cGVzICAgICAtIE9uZSBvciBtb3JlIHNwYWNlLXNlcGFyYXRlZCBldmVudCB0eXBlcyBhbmQgb3B0aW9uYWwgbmFtZXNwYWNlc1xuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSAgIGhhbmRsZXIgICAtIEEgaGFuZGxlciBmdW5jdGlvbiBwcmV2aW91c2x5IGF0dGFjaGVkIGZvciB0aGUgZXZlbnQocylcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgICBbc2VsZWN0b3JdIC0gQSBzZWxlY3RvciBzdHJpbmcgdG8gZmlsdGVyIHRoZSBkZXNjZW5kYW50cyBvZiB0aGUgc2VsZWN0ZWQgZWxlbWVudHNcbiAgICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uKGVsLCB0eXBlcywgaGFuZGxlciwgc2VsZWN0b3IpIHtcbiAgICAgICAgdmFyIHJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnRzLCBldmVudFR5cGUsIGluZGV4LCBlbCwgZSkge1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjaztcblxuICAgICAgICAgICAgICAgIC8vIGdldCBjYWxsYmFja1xuICAgICAgICAgICAgICAgIGlmICgoaGFuZGxlciAmJiBlLm9yaWdpbmZuID09PSBoYW5kbGVyKSB8fCAhaGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGUuZm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50c1tldmVudFR5cGVdW2luZGV4XS5mbiA9PT0gY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGhhbmRsZXIgZnJvbSBjYWNoZVxuICAgICAgICAgICAgICAgICAgICBldmVudHNbZXZlbnRUeXBlXS5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZXZlbnRzW2V2ZW50VHlwZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50cyA9IGpCb25lLmdldERhdGEoZWwpLmV2ZW50cyxcbiAgICAgICAgICAgIGwsXG4gICAgICAgICAgICBldmVudHNCeVR5cGU7XG5cbiAgICAgICAgaWYgKCFldmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSBhbGwgZXZlbnRzXG4gICAgICAgIGlmICghdHlwZXMgJiYgZXZlbnRzKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5cyhldmVudHMpLmZvckVhY2goZnVuY3Rpb24oZXZlbnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRzQnlUeXBlID0gZXZlbnRzW2V2ZW50VHlwZV07XG4gICAgICAgICAgICAgICAgbCA9IGV2ZW50c0J5VHlwZS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICB3aGlsZShsLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIoZXZlbnRzLCBldmVudFR5cGUsIGwsIGVsLCBldmVudHNCeVR5cGVbbF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdHlwZXMuc3BsaXQoXCIgXCIpLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnRUeXBlID0gZXZlbnROYW1lLnNwbGl0KFwiLlwiKVswXSxcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2UgPSBldmVudE5hbWUuc3BsaXQoXCIuXCIpLnNwbGljZSgxKS5qb2luKFwiLlwiKSxcbiAgICAgICAgICAgICAgICBlO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgbmFtZWQgZXZlbnRzXG4gICAgICAgICAgICBpZiAoZXZlbnRzW2V2ZW50VHlwZV0pIHtcbiAgICAgICAgICAgICAgICBldmVudHNCeVR5cGUgPSBldmVudHNbZXZlbnRUeXBlXTtcbiAgICAgICAgICAgICAgICBsID0gZXZlbnRzQnlUeXBlLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIHdoaWxlKGwtLSkge1xuICAgICAgICAgICAgICAgICAgICBlID0gZXZlbnRzQnlUeXBlW2xdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKCFuYW1lc3BhY2UgfHwgKG5hbWVzcGFjZSAmJiBlLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICghc2VsZWN0b3IgIHx8IChzZWxlY3RvciAgJiYgZS5zZWxlY3RvciA9PT0gc2VsZWN0b3IpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIoZXZlbnRzLCBldmVudFR5cGUsIGwsIGVsLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlbW92ZSBhbGwgbmFtZXNwYWNlZCBldmVudHNcbiAgICAgICAgICAgIGVsc2UgaWYgKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgICAgIGtleXMoZXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50VHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBldmVudHNCeVR5cGUgPSBldmVudHNbZXZlbnRUeXBlXTtcbiAgICAgICAgICAgICAgICAgICAgbCA9IGV2ZW50c0J5VHlwZS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUobC0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gZXZlbnRzQnlUeXBlW2xdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubmFtZXNwYWNlLnNwbGl0KFwiLlwiKVswXSA9PT0gbmFtZXNwYWNlLnNwbGl0KFwiLlwiKVswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVyKGV2ZW50cywgZXZlbnRUeXBlLCBsLCBlbCwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWxsIGhhbmRsZXJzIGFuZCBiZWhhdmlvcnMgYXR0YWNoZWQgdG8gdGhlIG1hdGNoZWQgZWxlbWVudHMgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSAge05vZGV9ICAgICAgIGVsICAgICAgIC0gRXZlbnRzIHdpbGwgYmUgdHJpZ2dlcmVkIGZvciB0aGllIERPTSBOb2RlXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgICAgZXZlbnQgICAgLSBPbmUgb3IgbW9yZSBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXMgYW5kIG9wdGlvbmFsIG5hbWVzcGFjZXNcbiAgICAgKi9cbiAgICB0cmlnZ2VyOiBmdW5jdGlvbihlbCwgZXZlbnQpIHtcbiAgICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICAgIGlmIChpc1N0cmluZyhldmVudCkpIHtcbiAgICAgICAgICAgIGV2ZW50cyA9IGV2ZW50LnNwbGl0KFwiIFwiKS5tYXAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gakJvbmUuRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudCA9IGV2ZW50IGluc3RhbmNlb2YgRXZlbnQgPyBldmVudCA6IGpCb25lLkV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIGV2ZW50cyA9IFtldmVudF07XG4gICAgICAgIH1cblxuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKCFldmVudC50eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50ICYmIGVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2g6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgaiA9IDAsXG4gICAgICAgICAgICBlbCA9IHRoaXMsXG4gICAgICAgICAgICBoYW5kbGVycyA9IGpCb25lLmdldERhdGEoZWwpLmV2ZW50c1tlLnR5cGVdLFxuICAgICAgICAgICAgbGVuZ3RoID0gaGFuZGxlcnMubGVuZ3RoLFxuICAgICAgICAgICAgaGFuZGxlclF1ZXVlID0gW10sXG4gICAgICAgICAgICB0YXJnZXRzID0gW10sXG4gICAgICAgICAgICBsLFxuICAgICAgICAgICAgZXhwZWN0ZWRUYXJnZXQsXG4gICAgICAgICAgICBoYW5kbGVyLFxuICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICBldmVudE9wdGlvbnM7XG5cbiAgICAgICAgLy8gY2FjaGUgYWxsIGV2ZW50cyBoYW5kbGVycywgZml4IGlzc3VlIHdpdGggbXVsdGlwbGUgaGFuZGxlcnMgKGlzc3VlICM0NSlcbiAgICAgICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFuZGxlclF1ZXVlLnB1c2goaGFuZGxlcnNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaSA9IDA7XG4gICAgICAgIGxlbmd0aCA9IGhhbmRsZXJRdWV1ZS5sZW5ndGg7XG5cbiAgICAgICAgZm9yICg7XG4gICAgICAgICAgICAvLyBpZiBldmVudCBleGlzdHNcbiAgICAgICAgICAgIGkgPCBsZW5ndGggJiZcbiAgICAgICAgICAgIC8vIGlmIGhhbmRsZXIgaXMgbm90IHJlbW92ZWQgZnJvbSBzdGFja1xuICAgICAgICAgICAgfmhhbmRsZXJzLmluZGV4T2YoaGFuZGxlclF1ZXVlW2ldKSAmJlxuICAgICAgICAgICAgLy8gaWYgcHJvcGFnYXRpb24gaXMgbm90IHN0b3BwZWRcbiAgICAgICAgICAgICEoZXZlbnQgJiYgZXZlbnQuaXNJbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQoKSk7XG4gICAgICAgIGkrKykge1xuICAgICAgICAgICAgZXhwZWN0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgICAgICAgZXZlbnRPcHRpb25zID0ge307XG4gICAgICAgICAgICBoYW5kbGVyID0gaGFuZGxlclF1ZXVlW2ldO1xuICAgICAgICAgICAgaGFuZGxlci5kYXRhICYmIChldmVudE9wdGlvbnMuZGF0YSA9IGhhbmRsZXIuZGF0YSk7XG5cbiAgICAgICAgICAgIC8vIGV2ZW50IGhhbmRsZXIgd2l0aG91dCBzZWxlY3RvclxuICAgICAgICAgICAgaWYgKCFoYW5kbGVyLnNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSBuZXcgQm9uZUV2ZW50KGUsIGV2ZW50T3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIShlLm5hbWVzcGFjZSAmJiBlLm5hbWVzcGFjZSAhPT0gaGFuZGxlci5uYW1lc3BhY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIub3JpZ2luZm4uY2FsbChlbCwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGV2ZW50IGhhbmRsZXIgd2l0aCBzZWxlY3RvclxuICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgLy8gaWYgdGFyZ2V0IGFuZCBzZWxlY3RlZCBlbGVtZW50IHRoZSBzYW1lXG4gICAgICAgICAgICAgICAgfih0YXJnZXRzID0gakJvbmUoZWwpLmZpbmQoaGFuZGxlci5zZWxlY3RvcikpLmluZGV4T2YoZS50YXJnZXQpICYmIChleHBlY3RlZFRhcmdldCA9IGUudGFyZ2V0KSB8fFxuICAgICAgICAgICAgICAgIC8vIGlmIG9uZSBvZiBlbGVtZW50IG1hdGNoZWQgd2l0aCBzZWxlY3RvciBjb250YWlucyB0YXJnZXRcbiAgICAgICAgICAgICAgICAoZWwgIT09IGUudGFyZ2V0ICYmIGVsLmNvbnRhaW5zKGUudGFyZ2V0KSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIGdldCBlbGVtZW50IG1hdGNoZWQgd2l0aCBzZWxlY3RvclxuICAgICAgICAgICAgICAgIGlmICghZXhwZWN0ZWRUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgbCA9IHRhcmdldHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBqID0gMDtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgaiA8IGw7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldHNbal0gJiYgdGFyZ2V0c1tqXS5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZFRhcmdldCA9IHRhcmdldHNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWV4cGVjdGVkVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGV2ZW50T3B0aW9ucy5jdXJyZW50VGFyZ2V0ID0gZXhwZWN0ZWRUYXJnZXQ7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSBuZXcgQm9uZUV2ZW50KGUsIGV2ZW50T3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIShlLm5hbWVzcGFjZSAmJiBlLm5hbWVzcGFjZSAhPT0gaGFuZGxlci5uYW1lc3BhY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIub3JpZ2luZm4uY2FsbChleHBlY3RlZFRhcmdldCwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmZuLm9uID0gZnVuY3Rpb24odHlwZXMsIHNlbGVjdG9yLCBkYXRhLCBmbikge1xuICAgIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCxcbiAgICAgICAgaSA9IDA7XG5cbiAgICBpZiAoZGF0YSA9PSBudWxsICYmIGZuID09IG51bGwpIHtcbiAgICAgICAgLy8gKHR5cGVzLCBmbilcbiAgICAgICAgZm4gPSBzZWxlY3RvcjtcbiAgICAgICAgZGF0YSA9IHNlbGVjdG9yID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoZm4gPT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvLyAodHlwZXMsIHNlbGVjdG9yLCBmbilcbiAgICAgICAgICAgIGZuID0gZGF0YTtcbiAgICAgICAgICAgIGRhdGEgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAodHlwZXMsIGRhdGEsIGZuKVxuICAgICAgICAgICAgZm4gPSBkYXRhO1xuICAgICAgICAgICAgZGF0YSA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgc2VsZWN0b3IgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWZuKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgakJvbmUuZXZlbnQuYWRkKHRoaXNbaV0sIHR5cGVzLCBmbiwgZGF0YSwgc2VsZWN0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuZm4ub25lID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoLFxuICAgICAgICBvbmVBcmdzID0gc2xpY2UuY2FsbChhcmdzLCAxLCBhcmdzLmxlbmd0aCAtIDEpLFxuICAgICAgICBjYWxsYmFjayA9IHNsaWNlLmNhbGwoYXJncywgLTEpWzBdLFxuICAgICAgICBhZGRMaXN0ZW5lcjtcblxuICAgIGFkZExpc3RlbmVyID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgdmFyICRlbCA9IGpCb25lKGVsKTtcblxuICAgICAgICBldmVudC5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGZuID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICRlbC5vZmYoZXZlbnQsIGZuKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKGVsLCBlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICRlbC5vbi5hcHBseSgkZWwsIFtldmVudF0uY29uY2F0KG9uZUFyZ3MsIGZuKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZExpc3RlbmVyKHRoaXNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuZm4udHJpZ2dlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBqQm9uZS5ldmVudC50cmlnZ2VyKHRoaXNbaV0sIGV2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbmZuLm9mZiA9IGZ1bmN0aW9uKHR5cGVzLCBzZWxlY3RvciwgaGFuZGxlcikge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihzZWxlY3RvcikpIHtcbiAgICAgICAgaGFuZGxlciA9IHNlbGVjdG9yO1xuICAgICAgICBzZWxlY3RvciA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGpCb25lLmV2ZW50LnJlbW92ZSh0aGlzW2ldLCB0eXBlcywgaGFuZGxlciwgc2VsZWN0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuZm4uZmluZCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoLFxuICAgICAgICBmaW5kZXIgPSBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oZWwucXVlcnlTZWxlY3RvckFsbCkpIHtcbiAgICAgICAgICAgICAgICBbXS5mb3JFYWNoLmNhbGwoZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksIGZ1bmN0aW9uKGZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChmb3VuZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZpbmRlcih0aGlzW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gakJvbmUocmVzdWx0cyk7XG59O1xuXG5mbi5nZXQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHJldHVybiBpbmRleCAhPSBudWxsID9cblxuICAgICAgICAvLyBSZXR1cm4ganVzdCBvbmUgZWxlbWVudCBmcm9tIHRoZSBzZXRcbiAgICAgICAgKGluZGV4IDwgMCA/IHRoaXNbaW5kZXggKyB0aGlzLmxlbmd0aF0gOiB0aGlzW2luZGV4XSkgOlxuXG4gICAgICAgIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGluIGEgY2xlYW4gYXJyYXlcbiAgICAgICAgc2xpY2UuY2FsbCh0aGlzKTtcbn07XG5cbmZuLmVxID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICByZXR1cm4gakJvbmUodGhpc1tpbmRleF0pO1xufTtcblxuZm4ucGFyZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXSxcbiAgICAgICAgcGFyZW50LFxuICAgICAgICBpID0gMCxcbiAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghfnJlc3VsdHMuaW5kZXhPZihwYXJlbnQgPSB0aGlzW2ldLnBhcmVudEVsZW1lbnQpICYmIHBhcmVudCkge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gakJvbmUocmVzdWx0cyk7XG59O1xuXG5mbi50b0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwodGhpcyk7XG59O1xuXG5mbi5pcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgcmV0dXJuIHRoaXMuc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICByZXR1cm4gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBhcmdzWzBdO1xuICAgIH0pO1xufTtcblxuZm4uaGFzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICByZXR1cm4gdGhpcy5zb21lKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKGFyZ3NbMF0pLmxlbmd0aDtcbiAgICB9KTtcbn07XG5cbmZuLmFkZCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMucHVzaFN0YWNrKFxuICAgICAgICBqQm9uZS51bmlxdWUoXG4gICAgICAgICAgICBqQm9uZS5tZXJnZSh0aGlzLmdldCgpLCBqQm9uZShzZWxlY3RvciwgY29udGV4dCkpXG4gICAgICAgIClcbiAgICApO1xufTtcblxuZm4uYXR0ciA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoLFxuICAgICAgICBzZXR0ZXI7XG5cbiAgICBpZiAoaXNTdHJpbmcoa2V5KSAmJiBhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gdGhpc1swXSAmJiB0aGlzWzBdLmdldEF0dHJpYnV0ZShrZXkpO1xuICAgIH1cblxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBzZXR0ZXIgPSBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qoa2V5KSkge1xuICAgICAgICBzZXR0ZXIgPSBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAga2V5cyhrZXkpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShuYW1lLCBrZXlbbmFtZV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzZXR0ZXIodGhpc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5mbi5yZW1vdmVBdHRyID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpc1tpXS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbmZuLnZhbCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdICYmIHRoaXNbMF0udmFsdWU7XG4gICAgfVxuXG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzW2ldLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5mbi5jc3MgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aCxcbiAgICAgICAgc2V0dGVyO1xuXG4gICAgLy8gR2V0IGF0dHJpYnV0ZVxuICAgIGlmIChpc1N0cmluZyhrZXkpICYmIGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdICYmIHdpbi5nZXRDb21wdXRlZFN0eWxlKHRoaXNbMF0pW2tleV07XG4gICAgfVxuXG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgc2V0dGVyID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGtleSkpIHtcbiAgICAgICAgc2V0dGVyID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIGtleXMoa2V5KS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZVtuYW1lXSA9IGtleVtuYW1lXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2V0dGVyKHRoaXNbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuZm4uZGF0YSA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cywgZGF0YSA9IHt9LFxuICAgICAgICBpID0gMCxcbiAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGgsXG4gICAgICAgIHNldHRlcixcbiAgICAgICAgc2V0VmFsdWUgPSBmdW5jdGlvbihlbCwga2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGVsLmpkYXRhID0gZWwuamRhdGEgfHwge307XG4gICAgICAgICAgICAgICAgZWwuamRhdGFba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbC5kYXRhc2V0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJmYWxzZVwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAvLyBHZXQgYWxsIGRhdGFcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpc1swXS5qZGF0YSAmJiAoZGF0YSA9IHRoaXNbMF0uamRhdGEpO1xuXG4gICAgICAgIGtleXModGhpc1swXS5kYXRhc2V0KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgZGF0YVtrZXldID0gZ2V0VmFsdWUodGhpc1swXS5kYXRhc2V0W2tleV0pO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgLy8gR2V0IGRhdGEgYnkgbmFtZVxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiBpc1N0cmluZyhrZXkpKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdICYmIGdldFZhbHVlKHRoaXNbMF0uZGF0YXNldFtrZXldIHx8IHRoaXNbMF0uamRhdGEgJiYgdGhpc1swXS5qZGF0YVtrZXldKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgZGF0YVxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiBpc09iamVjdChrZXkpKSB7XG4gICAgICAgIHNldHRlciA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBrZXlzKGtleSkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgc2V0VmFsdWUoZWwsIG5hbWUsIGtleVtuYW1lXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHNldHRlciA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBzZXRWYWx1ZShlbCwga2V5LCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzZXR0ZXIodGhpc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5mbi5yZW1vdmVEYXRhID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aCxcbiAgICAgICAgamRhdGEsIGRhdGFzZXQ7XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGpkYXRhID0gdGhpc1tpXS5qZGF0YTtcbiAgICAgICAgZGF0YXNldCA9IHRoaXNbaV0uZGF0YXNldDtcblxuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICBqZGF0YSAmJiBqZGF0YVtrZXldICYmIGRlbGV0ZSBqZGF0YVtrZXldO1xuICAgICAgICAgICAgZGVsZXRlIGRhdGFzZXRba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIGpkYXRhKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGpkYXRhW2tleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoa2V5IGluIGRhdGFzZXQpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgZGF0YXNldFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5mbi5hZGRDbGFzcyA9IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgaiA9IDAsXG4gICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoLFxuICAgICAgICBjbGFzc2VzID0gY2xhc3NOYW1lID8gY2xhc3NOYW1lLnRyaW0oKS5zcGxpdCgvXFxzKy8pIDogW107XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGogPSAwO1xuXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBjbGFzc2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB0aGlzW2ldLmNsYXNzTGlzdC5hZGQoY2xhc3Nlc1tqXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbmZuLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBqID0gMCxcbiAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGgsXG4gICAgICAgIGNsYXNzZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUudHJpbSgpLnNwbGl0KC9cXHMrLykgOiBbXTtcblxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaiA9IDA7XG5cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGNsYXNzZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHRoaXNbaV0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzW2pdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuZm4udG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbihjbGFzc05hbWUsIGZvcmNlKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aCxcbiAgICAgICAgbWV0aG9kID0gXCJ0b2dnbGVcIjtcblxuICAgIGZvcmNlID09PSB0cnVlICYmIChtZXRob2QgPSBcImFkZFwiKSB8fCBmb3JjZSA9PT0gZmFsc2UgJiYgKG1ldGhvZCA9IFwicmVtb3ZlXCIpO1xuXG4gICAgaWYgKGNsYXNzTmFtZSkge1xuICAgICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzW2ldLmNsYXNzTGlzdFttZXRob2RdKGNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbmZuLmhhc0NsYXNzID0gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgIGlmIChjbGFzc05hbWUpIHtcbiAgICAgICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXNbaV0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmZuLmh0bWwgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBlbDtcblxuICAgIC8vIGFkZCBIVE1MIGludG8gZWxlbWVudHNcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbXB0eSgpLmFwcGVuZCh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIGdldCBIVE1MIGZyb20gZWxlbWVudFxuICAgIGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAwICYmIChlbCA9IHRoaXNbMF0pKSB7XG4gICAgICAgIHJldHVybiBlbC5pbm5lckhUTUw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5mbi5hcHBlbmQgPSBmdW5jdGlvbihhcHBlbmRlZCkge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGgsXG4gICAgICAgIHNldHRlcjtcblxuICAgIC8vIGNyZWF0ZSBqQm9uZSBvYmplY3QgYW5kIHRoZW4gYXBwZW5kXG4gICAgaWYgKGlzU3RyaW5nKGFwcGVuZGVkKSAmJiBycXVpY2tFeHByLmV4ZWMoYXBwZW5kZWQpKSB7XG4gICAgICAgIGFwcGVuZGVkID0gakJvbmUoYXBwZW5kZWQpO1xuICAgIH1cbiAgICAvLyBjcmVhdGUgdGV4dCBub2RlIGZvciBpbnNlcnRpb25cbiAgICBlbHNlIGlmICghaXNPYmplY3QoYXBwZW5kZWQpKSB7XG4gICAgICAgIGFwcGVuZGVkID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwZW5kZWQpO1xuICAgIH1cblxuICAgIGFwcGVuZGVkID0gYXBwZW5kZWQgaW5zdGFuY2VvZiBqQm9uZSA/IGFwcGVuZGVkIDogakJvbmUoYXBwZW5kZWQpO1xuXG4gICAgc2V0dGVyID0gZnVuY3Rpb24oZWwsIGkpIHtcbiAgICAgICAgYXBwZW5kZWQuZm9yRWFjaChmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBpZiAoaSkge1xuICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGUuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNldHRlcih0aGlzW2ldLCBpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbmZuLmFwcGVuZFRvID0gZnVuY3Rpb24odG8pIHtcbiAgICBqQm9uZSh0bykuYXBwZW5kKHRoaXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5mbi5lbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGgsXG4gICAgICAgIGVsO1xuXG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBlbCA9IHRoaXNbaV07XG5cbiAgICAgICAgd2hpbGUgKGVsLmxhc3RDaGlsZCkge1xuICAgICAgICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuZm4ucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aCxcbiAgICAgICAgZWw7XG5cbiAgICAvLyByZW1vdmUgYWxsIGxpc3RlbmVyc1xuICAgIHRoaXMub2ZmKCk7XG5cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsID0gdGhpc1tpXTtcblxuICAgICAgICAvLyByZW1vdmUgZGF0YSBhbmQgbm9kZXNcbiAgICAgICAgZGVsZXRlIGVsLmpkYXRhO1xuICAgICAgICBlbC5wYXJlbnROb2RlICYmIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgIC8vIEV4cG9zZSBqQm9uZSBhcyBtb2R1bGUuZXhwb3J0cyBpbiBsb2FkZXJzIHRoYXQgaW1wbGVtZW50IHRoZSBOb2RlXG4gICAgLy8gbW9kdWxlIHBhdHRlcm4gKGluY2x1ZGluZyBicm93c2VyaWZ5KS4gRG8gbm90IGNyZWF0ZSB0aGUgZ2xvYmFsLCBzaW5jZVxuICAgIC8vIHRoZSB1c2VyIHdpbGwgYmUgc3RvcmluZyBpdCB0aGVtc2VsdmVzIGxvY2FsbHksIGFuZCBnbG9iYWxzIGFyZSBmcm93bmVkXG4gICAgLy8gdXBvbiBpbiB0aGUgTm9kZSBtb2R1bGUgd29ybGQuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBqQm9uZTtcbn1cbi8vIFJlZ2lzdGVyIGFzIGEgQU1EIG1vZHVsZVxuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBqQm9uZTtcbiAgICB9KTtcblxuICAgIHdpbi5qQm9uZSA9IHdpbi4kID0gakJvbmU7XG59IGVsc2UgaWYgKHR5cGVvZiB3aW4gPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHdpbi5kb2N1bWVudCA9PT0gXCJvYmplY3RcIikge1xuICAgIHdpbi5qQm9uZSA9IHdpbi4kID0gakJvbmU7XG59XG5cbn0od2luZG93KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuLi9ub2RlX21vZHVsZXMvamJvbmUvZGlzdC9qYm9uZS5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1RlbGwgdG8gd2VicGFjayB0byBpbmNsdWRlIGNzcyAobGVzcylcclxucmVxdWlyZSgnbGVzcy9jb21tb24ubGVzcycpO1xyXG5cclxuLy9GZXRjaCBwb2xpZnlsIGZvciBvbGQgYnJvd3NlcnNcclxucmVxdWlyZSgnZmV0Y2gtcG9seWZpbGwnKTtcclxuXHJcbi8vVGVsbCB0byB3ZWJwYWNrIGluY2x1ZGUgaW1hZ2VzIHRvIGJ1aWxkXHJcbmZ1bmN0aW9uIHJlcXVpcmVBbGwocikgeyByLmtleXMoKS5mb3JFYWNoKHIpOyB9XHJcbnJlcXVpcmVBbGwocmVxdWlyZS5jb250ZXh0KCdpbWcvJywgdHJ1ZSwgL1xcLihpY298cG5nfGpwZykkL2kpKTtcclxuLy9JbmNsdWRlIGxheW91dCBlbGVtZW50cyAoZm9vdGVyLCBoZWFkZXIsIGV0Yy4pXHJcbnJlcXVpcmUoJ2xheW91dC9sYXlvdXQtbWFuYWdlcicpO1xyXG5cclxuLy9JbmNsdWRlIHJvdXRlciwgaGFuZGxlIGhpc3RvcnkgYW5kIG1hbmFnZSBwYWdlcyB2aWV3c1xyXG5yZXF1aXJlKCdiYXNlL2Jhc2Utcm91dGVyJyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy9pbml0LmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHN0eWxlLWxvYWRlcjogQWRkcyBzb21lIGNzcyB0byB0aGUgRE9NIGJ5IGFkZGluZyBhIDxzdHlsZT4gdGFnXG5cbi8vIGxvYWQgdGhlIHN0eWxlc1xudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvYXV0b3ByZWZpeGVyLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvaW5kZXguanMhLi9jb21tb24ubGVzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwge30pO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvYXV0b3ByZWZpeGVyLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvaW5kZXguanMhLi9jb21tb24ubGVzc1wiLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb250ZW50ID0gcmVxdWlyZShcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2F1dG9wcmVmaXhlci1sb2FkZXIvaW5kZXguanMhLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2luZGV4LmpzIS4vY29tbW9uLmxlc3NcIik7XG5cdFx0XHRpZih0eXBlb2YgbmV3Q29udGVudCA9PT0gJ3N0cmluZycpIG5ld0NvbnRlbnQgPSBbW21vZHVsZS5pZCwgbmV3Q29udGVudCwgJyddXTtcblx0XHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0XHR9KTtcblx0fVxuXHQvLyBXaGVuIHRoZSBtb2R1bGUgaXMgZGlzcG9zZWQsIHJlbW92ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdG1vZHVsZS5ob3QuZGlzcG9zZShmdW5jdGlvbigpIHsgdXBkYXRlKCk7IH0pO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbGVzcy9jb21tb24ubGVzc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCJodG1sLFxcbmJvZHksXFxuZGl2LFxcbnNwYW4sXFxuYXBwbGV0LFxcbm9iamVjdCxcXG5pZnJhbWUsXFxuaDEsXFxuaDIsXFxuaDMsXFxuaDQsXFxuaDUsXFxuaDYsXFxucCxcXG5ibG9ja3F1b3RlLFxcbnByZSxcXG5hLFxcbmFiYnIsXFxuYWNyb255bSxcXG5hZGRyZXNzLFxcbmJpZyxcXG5jaXRlLFxcbmNvZGUsXFxuZGVsLFxcbmRmbixcXG5lbSxcXG5pbWcsXFxuaW5zLFxcbmtiZCxcXG5xLFxcbnMsXFxuc2FtcCxcXG5zbWFsbCxcXG5zdHJpa2UsXFxuc3Ryb25nLFxcbnN1YixcXG5zdXAsXFxudHQsXFxudmFyLFxcbmIsXFxudSxcXG5pLFxcbmNlbnRlcixcXG5kbCxcXG5kdCxcXG5kZCxcXG5vbCxcXG51bCxcXG5saSxcXG5maWVsZHNldCxcXG5mb3JtLFxcbmxhYmVsLFxcbmxlZ2VuZCxcXG50YWJsZSxcXG5jYXB0aW9uLFxcbnRib2R5LFxcbnRmb290LFxcbnRoZWFkLFxcbnRyLFxcbnRoLFxcbnRkLFxcbmFydGljbGUsXFxuYXNpZGUsXFxuY2FudmFzLFxcbmRldGFpbHMsXFxuZW1iZWQsXFxuZmlndXJlLFxcbmZpZ2NhcHRpb24sXFxuZm9vdGVyLFxcbmhlYWRlcixcXG5tZW51LFxcbm5hdixcXG5vdXRwdXQsXFxucnVieSxcXG5zZWN0aW9uLFxcbnN1bW1hcnksXFxudGltZSxcXG5tYXJrLFxcbmF1ZGlvLFxcbnZpZGVvIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3JkZXI6IDA7XFxuICBmb250LXNpemU6IDEwMCU7XFxuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi8qIEhUTUw1IGRpc3BsYXktcm9sZSByZXNldCBmb3Igb2xkZXIgYnJvd3NlcnMgKi9cXG5hcnRpY2xlLFxcbmFzaWRlLFxcbmRldGFpbHMsXFxuZmlnY2FwdGlvbixcXG5maWd1cmUsXFxuZm9vdGVyLFxcbmhlYWRlcixcXG5tZW51LFxcbm5hdixcXG5zZWN0aW9uIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5ib2R5IHtcXG4gIGxpbmUtaGVpZ2h0OiAxO1xcbn1cXG5vbCxcXG51bCB7XFxuICBsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlLFxcbnEge1xcbiAgcXVvdGVzOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlOmJlZm9yZSxcXG5ibG9ja3F1b3RlOmFmdGVyLFxcbnE6YmVmb3JlLFxcbnE6YWZ0ZXIge1xcbiAgY29udGVudDogJyc7XFxuICBjb250ZW50OiBub25lO1xcbn1cXG50YWJsZSB7XFxuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xcbiAgYm9yZGVyLXNwYWNpbmc6IDA7XFxufVxcbmEge1xcbiAgY29sb3I6IGluaGVyaXQ7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxufVxcbioge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuQGZvbnQtZmFjZSB7XFxuICBmb250LWZhbWlseTogUm9ib3RvO1xcbiAgc3JjOiB1cmwoXCIgKyByZXF1aXJlKFwiZm9udHMvUm9ib3RvL1JvYm90by1UaGluLnR0ZlwiKSArIFwiKTtcXG4gIGZvbnQtd2VpZ2h0OiAxMDA7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6IFJvYm90bztcXG4gIHNyYzogdXJsKFwiICsgcmVxdWlyZShcImZvbnRzL1JvYm90by9Sb2JvdG8tVGhpbkl0YWxpYy50dGZcIikgKyBcIik7XFxuICBmb250LXdlaWdodDogMTAwO1xcbiAgZm9udC1zdHlsZTogaXRhbGljO1xcbn1cXG5AZm9udC1mYWNlIHtcXG4gIGZvbnQtZmFtaWx5OiBSb2JvdG87XFxuICBzcmM6IHVybChcIiArIHJlcXVpcmUoXCJmb250cy9Sb2JvdG8vUm9ib3RvLUxpZ2h0LnR0ZlwiKSArIFwiKTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6IFJvYm90bztcXG4gIHNyYzogdXJsKFwiICsgcmVxdWlyZShcImZvbnRzL1JvYm90by9Sb2JvdG8tTGlnaHRJdGFsaWMudHRmXCIpICsgXCIpO1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcXG59XFxuQGZvbnQtZmFjZSB7XFxuICBmb250LWZhbWlseTogUm9ib3RvO1xcbiAgc3JjOiB1cmwoXCIgKyByZXF1aXJlKFwiZm9udHMvUm9ib3RvL1JvYm90by1SZWd1bGFyLnR0ZlwiKSArIFwiKTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6IFJvYm90bztcXG4gIHNyYzogdXJsKFwiICsgcmVxdWlyZShcImZvbnRzL1JvYm90by9Sb2JvdG8tSXRhbGljLnR0ZlwiKSArIFwiKTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXN0eWxlOiBpdGFsaWM7XFxufVxcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6IFJvYm90bztcXG4gIHNyYzogdXJsKFwiICsgcmVxdWlyZShcImZvbnRzL1JvYm90by9Sb2JvdG8tTWVkaXVtLnR0ZlwiKSArIFwiKTtcXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6IFJvYm90bztcXG4gIHNyYzogdXJsKFwiICsgcmVxdWlyZShcImZvbnRzL1JvYm90by9Sb2JvdG8tTWVkaXVtSXRhbGljLnR0ZlwiKSArIFwiKTtcXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICBmb250LXN0eWxlOiBpdGFsaWM7XFxufVxcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6IFJvYm90bztcXG4gIHNyYzogdXJsKFwiICsgcmVxdWlyZShcImZvbnRzL1JvYm90by9Sb2JvdG8tQm9sZC50dGZcIikgKyBcIik7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbn1cXG5AZm9udC1mYWNlIHtcXG4gIGZvbnQtZmFtaWx5OiBSb2JvdG87XFxuICBzcmM6IHVybChcIiArIHJlcXVpcmUoXCJmb250cy9Sb2JvdG8vUm9ib3RvLUJvbGRJdGFsaWMudHRmXCIpICsgXCIpO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcXG59XFxuQGZvbnQtZmFjZSB7XFxuICBmb250LWZhbWlseTogUm9ib3RvO1xcbiAgc3JjOiB1cmwoXCIgKyByZXF1aXJlKFwiZm9udHMvUm9ib3RvL1JvYm90by1CbGFjay50dGZcIikgKyBcIik7XFxuICBmb250LXdlaWdodDogOTAwO1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbn1cXG5AZm9udC1mYWNlIHtcXG4gIGZvbnQtZmFtaWx5OiBSb2JvdG87XFxuICBzcmM6IHVybChcIiArIHJlcXVpcmUoXCJmb250cy9Sb2JvdG8vUm9ib3RvLUJsYWNrSXRhbGljLnR0ZlwiKSArIFwiKTtcXG4gIGZvbnQtd2VpZ2h0OiA5MDA7XFxuICBmb250LXN0eWxlOiBpdGFsaWM7XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBidXR0b24tc21hcnQtYm9yZGVyIHtcXG4gIDAlIHtcXG4gICAgdG9wOiAxMDAlO1xcbiAgICB3aWR0aDogMDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRvcDogLTAuM3JlbTtcXG4gICAgd2lkdGg6IDA7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdG9wOiAtMC4zcmVtO1xcbiAgICB3aWR0aDogNTAlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGJ1dHRvbi1zbWFydC1ib3JkZXIge1xcbiAgMCUge1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiAwO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdG9wOiAtMC4zcmVtO1xcbiAgICB3aWR0aDogMDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0b3A6IC0wLjNyZW07XFxuICAgIHdpZHRoOiA1MCU7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBmYWRlSW4ge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZmFkZUluIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgYm90dG9tVG9Ub3Age1xcbiAgMCUge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDUwMHB4KTtcXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCA1MDBweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKTtcXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBib3R0b21Ub1RvcCB7XFxuICAwJSB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgNTAwcHgpO1xcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDUwMHB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDApO1xcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApO1xcbiAgfVxcbn1cXG4vKiFcXG4gKiAgRm9udCBBd2Vzb21lIDQuNS4wIGJ5IEBkYXZlZ2FuZHkgLSBodHRwOi8vZm9udGF3ZXNvbWUuaW8gLSBAZm9udGF3ZXNvbWVcXG4gKiAgTGljZW5zZSAtIGh0dHA6Ly9mb250YXdlc29tZS5pby9saWNlbnNlIChGb250OiBTSUwgT0ZMIDEuMSwgQ1NTOiBNSVQgTGljZW5zZSlcXG4gKi9cXG4vKiBGT05UIFBBVEhcXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xcbkBmb250LWZhY2Uge1xcbiAgZm9udC1mYW1pbHk6ICdGb250QXdlc29tZSc7XFxuICBzcmM6IHVybChcIiArIHJlcXVpcmUoXCIuLi9mb250cy9mb250LWF3ZXNvbWUvZm9udGF3ZXNvbWUtd2ViZm9udC5lb3RcIikgKyBcIik7XFxuICBzcmM6IHVybChcIiArIHJlcXVpcmUoXCIuLi9mb250cy9mb250LWF3ZXNvbWUvZm9udGF3ZXNvbWUtd2ViZm9udC5lb3RcIikgKyBcIikgZm9ybWF0KCdlbWJlZGRlZC1vcGVudHlwZScpLCB1cmwoXCIgKyByZXF1aXJlKFwiLi4vZm9udHMvZm9udC1hd2Vzb21lL2ZvbnRhd2Vzb21lLXdlYmZvbnQud29mZjJcIikgKyBcIikgZm9ybWF0KCd3b2ZmMicpLCB1cmwoXCIgKyByZXF1aXJlKFwiLi4vZm9udHMvZm9udC1hd2Vzb21lL2ZvbnRhd2Vzb21lLXdlYmZvbnQud29mZlwiKSArIFwiKSBmb3JtYXQoJ3dvZmYnKSwgdXJsKFwiICsgcmVxdWlyZShcIi4uL2ZvbnRzL2ZvbnQtYXdlc29tZS9mb250YXdlc29tZS13ZWJmb250LnR0ZlwiKSArIFwiKSBmb3JtYXQoJ3RydWV0eXBlJyksIHVybChcIiArIHJlcXVpcmUoXCIuLi9mb250cy9mb250LWF3ZXNvbWUvZm9udGF3ZXNvbWUtd2ViZm9udC5zdmdcIikgKyBcIikgZm9ybWF0KCdzdmcnKTtcXG4gIGZvbnQtd2VpZ2h0OiBub3JtYWw7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcbi5mYSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBmb250OiBub3JtYWwgbm9ybWFsIG5vcm1hbCAxNHB4LzEgRm9udEF3ZXNvbWU7XFxuICBmb250LXNpemU6IGluaGVyaXQ7XFxuICB0ZXh0LXJlbmRlcmluZzogYXV0bztcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xcbiAgLW1vei1vc3gtZm9udC1zbW9vdGhpbmc6IGdyYXlzY2FsZTtcXG59XFxuLyogbWFrZXMgdGhlIGZvbnQgMzMlIGxhcmdlciByZWxhdGl2ZSB0byB0aGUgaWNvbiBjb250YWluZXIgKi9cXG4uZmEtbGcge1xcbiAgZm9udC1zaXplOiAxLjMzMzMzMzMzZW07XFxuICBsaW5lLWhlaWdodDogMC43NWVtO1xcbiAgdmVydGljYWwtYWxpZ246IC0xNSU7XFxufVxcbi5mYS0yeCB7XFxuICBmb250LXNpemU6IDJlbTtcXG59XFxuLmZhLTN4IHtcXG4gIGZvbnQtc2l6ZTogM2VtO1xcbn1cXG4uZmEtNHgge1xcbiAgZm9udC1zaXplOiA0ZW07XFxufVxcbi5mYS01eCB7XFxuICBmb250LXNpemU6IDVlbTtcXG59XFxuLmZhLWZ3IHtcXG4gIHdpZHRoOiAxLjI4NTcxNDI5ZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcbi5mYS11bCB7XFxuICBwYWRkaW5nLWxlZnQ6IDA7XFxuICBtYXJnaW4tbGVmdDogMi4xNDI4NTcxNGVtO1xcbiAgbGlzdC1zdHlsZS10eXBlOiBub25lO1xcbn1cXG4uZmEtdWwgPiBsaSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcbi5mYS1saSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBsZWZ0OiAtMi4xNDI4NTcxNGVtO1xcbiAgd2lkdGg6IDIuMTQyODU3MTRlbTtcXG4gIHRvcDogMC4xNDI4NTcxNGVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4uZmEtbGkuZmEtbGcge1xcbiAgbGVmdDogLTEuODU3MTQyODZlbTtcXG59XFxuLmZhLWJvcmRlciB7XFxuICBwYWRkaW5nOiAuMmVtIC4yNWVtIC4xNWVtO1xcbiAgYm9yZGVyOiBzb2xpZCAwLjA4ZW0gI2VlZTtcXG4gIGJvcmRlci1yYWRpdXM6IC4xZW07XFxufVxcbi5mYS1wdWxsLWxlZnQge1xcbiAgZmxvYXQ6IGxlZnQ7XFxufVxcbi5mYS1wdWxsLXJpZ2h0IHtcXG4gIGZsb2F0OiByaWdodDtcXG59XFxuLmZhLmZhLXB1bGwtbGVmdCB7XFxuICBtYXJnaW4tcmlnaHQ6IC4zZW07XFxufVxcbi5mYS5mYS1wdWxsLXJpZ2h0IHtcXG4gIG1hcmdpbi1sZWZ0OiAuM2VtO1xcbn1cXG4vKiBEZXByZWNhdGVkIGFzIG9mIDQuNC4wICovXFxuLnB1bGwtcmlnaHQge1xcbiAgZmxvYXQ6IHJpZ2h0O1xcbn1cXG4ucHVsbC1sZWZ0IHtcXG4gIGZsb2F0OiBsZWZ0O1xcbn1cXG4uZmEucHVsbC1sZWZ0IHtcXG4gIG1hcmdpbi1yaWdodDogLjNlbTtcXG59XFxuLmZhLnB1bGwtcmlnaHQge1xcbiAgbWFyZ2luLWxlZnQ6IC4zZW07XFxufVxcbi5mYS1zcGluIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBmYS1zcGluIDJzIGluZmluaXRlIGxpbmVhcjtcXG4gIGFuaW1hdGlvbjogZmEtc3BpbiAycyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5mYS1wdWxzZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZmEtc3BpbiAxcyBpbmZpbml0ZSBzdGVwcyg4KTtcXG4gIGFuaW1hdGlvbjogZmEtc3BpbiAxcyBpbmZpbml0ZSBzdGVwcyg4KTtcXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZhLXNwaW4ge1xcbiAgMCUge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDM1OWRlZyk7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM1OWRlZyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZmEtc3BpbiB7XFxuICAwJSB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzU5ZGVnKTtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzU5ZGVnKTtcXG4gIH1cXG59XFxuLmZhLXJvdGF0ZS05MCB7XFxuICBmaWx0ZXI6IHByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CYXNpY0ltYWdlKHJvdGF0aW9uPTEpO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSg5MGRlZyk7XFxuICB0cmFuc2Zvcm06IHJvdGF0ZSg5MGRlZyk7XFxufVxcbi5mYS1yb3RhdGUtMTgwIHtcXG4gIGZpbHRlcjogcHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkJhc2ljSW1hZ2Uocm90YXRpb249Mik7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDE4MGRlZyk7XFxuICB0cmFuc2Zvcm06IHJvdGF0ZSgxODBkZWcpO1xcbn1cXG4uZmEtcm90YXRlLTI3MCB7XFxuICBmaWx0ZXI6IHByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CYXNpY0ltYWdlKHJvdGF0aW9uPTMpO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgyNzBkZWcpO1xcbiAgdHJhbnNmb3JtOiByb3RhdGUoMjcwZGVnKTtcXG59XFxuLmZhLWZsaXAtaG9yaXpvbnRhbCB7XFxuICBmaWx0ZXI6IHByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CYXNpY0ltYWdlKHJvdGF0aW9uPTAsIG1pcnJvcj0xKTtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgtMSwgMSk7XFxuICB0cmFuc2Zvcm06IHNjYWxlKC0xLCAxKTtcXG59XFxuLmZhLWZsaXAtdmVydGljYWwge1xcbiAgZmlsdGVyOiBwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuQmFzaWNJbWFnZShyb3RhdGlvbj0yLCBtaXJyb3I9MSk7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMSwgLTEpO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLCAtMSk7XFxufVxcbjpyb290IC5mYS1yb3RhdGUtOTAsXFxuOnJvb3QgLmZhLXJvdGF0ZS0xODAsXFxuOnJvb3QgLmZhLXJvdGF0ZS0yNzAsXFxuOnJvb3QgLmZhLWZsaXAtaG9yaXpvbnRhbCxcXG46cm9vdCAuZmEtZmxpcC12ZXJ0aWNhbCB7XFxuICAtd2Via2l0LWZpbHRlcjogbm9uZTtcXG4gICAgICAgICAgZmlsdGVyOiBub25lO1xcbn1cXG4uZmEtc3RhY2sge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgd2lkdGg6IDJlbTtcXG4gIGhlaWdodDogMmVtO1xcbiAgbGluZS1oZWlnaHQ6IDJlbTtcXG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XFxufVxcbi5mYS1zdGFjay0xeCxcXG4uZmEtc3RhY2stMngge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4uZmEtc3RhY2stMXgge1xcbiAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XFxufVxcbi5mYS1zdGFjay0yeCB7XFxuICBmb250LXNpemU6IDJlbTtcXG59XFxuLmZhLWludmVyc2Uge1xcbiAgY29sb3I6ICNmZmY7XFxufVxcbi8qIEZvbnQgQXdlc29tZSB1c2VzIHRoZSBVbmljb2RlIFByaXZhdGUgVXNlIEFyZWEgKFBVQSkgdG8gZW5zdXJlIHNjcmVlblxcbiAgIHJlYWRlcnMgZG8gbm90IHJlYWQgb2ZmIHJhbmRvbSBjaGFyYWN0ZXJzIHRoYXQgcmVwcmVzZW50IGljb25zICovXFxuLmZhLWdsYXNzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMDBcXFwiO1xcbn1cXG4uZmEtbXVzaWM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAwMVxcXCI7XFxufVxcbi5mYS1zZWFyY2g6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAwMlxcXCI7XFxufVxcbi5mYS1lbnZlbG9wZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMDNcXFwiO1xcbn1cXG4uZmEtaGVhcnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAwNFxcXCI7XFxufVxcbi5mYS1zdGFyOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMDVcXFwiO1xcbn1cXG4uZmEtc3Rhci1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMDZcXFwiO1xcbn1cXG4uZmEtdXNlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDA3XFxcIjtcXG59XFxuLmZhLWZpbG06YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAwOFxcXCI7XFxufVxcbi5mYS10aC1sYXJnZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDA5XFxcIjtcXG59XFxuLmZhLXRoOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMEFcXFwiO1xcbn1cXG4uZmEtdGgtbGlzdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDBCXFxcIjtcXG59XFxuLmZhLWNoZWNrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMENcXFwiO1xcbn1cXG4uZmEtcmVtb3ZlOmJlZm9yZSxcXG4uZmEtY2xvc2U6YmVmb3JlLFxcbi5mYS10aW1lczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDBEXFxcIjtcXG59XFxuLmZhLXNlYXJjaC1wbHVzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMEVcXFwiO1xcbn1cXG4uZmEtc2VhcmNoLW1pbnVzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMTBcXFwiO1xcbn1cXG4uZmEtcG93ZXItb2ZmOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMTFcXFwiO1xcbn1cXG4uZmEtc2lnbmFsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMTJcXFwiO1xcbn1cXG4uZmEtZ2VhcjpiZWZvcmUsXFxuLmZhLWNvZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDEzXFxcIjtcXG59XFxuLmZhLXRyYXNoLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAxNFxcXCI7XFxufVxcbi5mYS1ob21lOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMTVcXFwiO1xcbn1cXG4uZmEtZmlsZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMTZcXFwiO1xcbn1cXG4uZmEtY2xvY2stbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDE3XFxcIjtcXG59XFxuLmZhLXJvYWQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAxOFxcXCI7XFxufVxcbi5mYS1kb3dubG9hZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDE5XFxcIjtcXG59XFxuLmZhLWFycm93LWNpcmNsZS1vLWRvd246YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAxQVxcXCI7XFxufVxcbi5mYS1hcnJvdy1jaXJjbGUtby11cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDFCXFxcIjtcXG59XFxuLmZhLWluYm94OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMUNcXFwiO1xcbn1cXG4uZmEtcGxheS1jaXJjbGUtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDFEXFxcIjtcXG59XFxuLmZhLXJvdGF0ZS1yaWdodDpiZWZvcmUsXFxuLmZhLXJlcGVhdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDFFXFxcIjtcXG59XFxuLmZhLXJlZnJlc2g6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAyMVxcXCI7XFxufVxcbi5mYS1saXN0LWFsdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDIyXFxcIjtcXG59XFxuLmZhLWxvY2s6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAyM1xcXCI7XFxufVxcbi5mYS1mbGFnOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMjRcXFwiO1xcbn1cXG4uZmEtaGVhZHBob25lczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDI1XFxcIjtcXG59XFxuLmZhLXZvbHVtZS1vZmY6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAyNlxcXCI7XFxufVxcbi5mYS12b2x1bWUtZG93bjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDI3XFxcIjtcXG59XFxuLmZhLXZvbHVtZS11cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDI4XFxcIjtcXG59XFxuLmZhLXFyY29kZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDI5XFxcIjtcXG59XFxuLmZhLWJhcmNvZGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAyQVxcXCI7XFxufVxcbi5mYS10YWc6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAyQlxcXCI7XFxufVxcbi5mYS10YWdzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMkNcXFwiO1xcbn1cXG4uZmEtYm9vazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDJEXFxcIjtcXG59XFxuLmZhLWJvb2ttYXJrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMkVcXFwiO1xcbn1cXG4uZmEtcHJpbnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAyRlxcXCI7XFxufVxcbi5mYS1jYW1lcmE6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAzMFxcXCI7XFxufVxcbi5mYS1mb250OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMzFcXFwiO1xcbn1cXG4uZmEtYm9sZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDMyXFxcIjtcXG59XFxuLmZhLWl0YWxpYzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDMzXFxcIjtcXG59XFxuLmZhLXRleHQtaGVpZ2h0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwMzRcXFwiO1xcbn1cXG4uZmEtdGV4dC13aWR0aDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDM1XFxcIjtcXG59XFxuLmZhLWFsaWduLWxlZnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAzNlxcXCI7XFxufVxcbi5mYS1hbGlnbi1jZW50ZXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAzN1xcXCI7XFxufVxcbi5mYS1hbGlnbi1yaWdodDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDM4XFxcIjtcXG59XFxuLmZhLWFsaWduLWp1c3RpZnk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAzOVxcXCI7XFxufVxcbi5mYS1saXN0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwM0FcXFwiO1xcbn1cXG4uZmEtZGVkZW50OmJlZm9yZSxcXG4uZmEtb3V0ZGVudDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDNCXFxcIjtcXG59XFxuLmZhLWluZGVudDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDNDXFxcIjtcXG59XFxuLmZhLXZpZGVvLWNhbWVyYTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDNEXFxcIjtcXG59XFxuLmZhLXBob3RvOmJlZm9yZSxcXG4uZmEtaW1hZ2U6YmVmb3JlLFxcbi5mYS1waWN0dXJlLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjAzRVxcXCI7XFxufVxcbi5mYS1wZW5jaWw6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA0MFxcXCI7XFxufVxcbi5mYS1tYXAtbWFya2VyOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNDFcXFwiO1xcbn1cXG4uZmEtYWRqdXN0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNDJcXFwiO1xcbn1cXG4uZmEtdGludDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDQzXFxcIjtcXG59XFxuLmZhLWVkaXQ6YmVmb3JlLFxcbi5mYS1wZW5jaWwtc3F1YXJlLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA0NFxcXCI7XFxufVxcbi5mYS1zaGFyZS1zcXVhcmUtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDQ1XFxcIjtcXG59XFxuLmZhLWNoZWNrLXNxdWFyZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNDZcXFwiO1xcbn1cXG4uZmEtYXJyb3dzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNDdcXFwiO1xcbn1cXG4uZmEtc3RlcC1iYWNrd2FyZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDQ4XFxcIjtcXG59XFxuLmZhLWZhc3QtYmFja3dhcmQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA0OVxcXCI7XFxufVxcbi5mYS1iYWNrd2FyZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDRBXFxcIjtcXG59XFxuLmZhLXBsYXk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA0QlxcXCI7XFxufVxcbi5mYS1wYXVzZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDRDXFxcIjtcXG59XFxuLmZhLXN0b3A6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA0RFxcXCI7XFxufVxcbi5mYS1mb3J3YXJkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNEVcXFwiO1xcbn1cXG4uZmEtZmFzdC1mb3J3YXJkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNTBcXFwiO1xcbn1cXG4uZmEtc3RlcC1mb3J3YXJkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNTFcXFwiO1xcbn1cXG4uZmEtZWplY3Q6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1MlxcXCI7XFxufVxcbi5mYS1jaGV2cm9uLWxlZnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1M1xcXCI7XFxufVxcbi5mYS1jaGV2cm9uLXJpZ2h0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNTRcXFwiO1xcbn1cXG4uZmEtcGx1cy1jaXJjbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1NVxcXCI7XFxufVxcbi5mYS1taW51cy1jaXJjbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1NlxcXCI7XFxufVxcbi5mYS10aW1lcy1jaXJjbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1N1xcXCI7XFxufVxcbi5mYS1jaGVjay1jaXJjbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1OFxcXCI7XFxufVxcbi5mYS1xdWVzdGlvbi1jaXJjbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1OVxcXCI7XFxufVxcbi5mYS1pbmZvLWNpcmNsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDVBXFxcIjtcXG59XFxuLmZhLWNyb3NzaGFpcnM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA1QlxcXCI7XFxufVxcbi5mYS10aW1lcy1jaXJjbGUtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDVDXFxcIjtcXG59XFxuLmZhLWNoZWNrLWNpcmNsZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNURcXFwiO1xcbn1cXG4uZmEtYmFuOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNUVcXFwiO1xcbn1cXG4uZmEtYXJyb3ctbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDYwXFxcIjtcXG59XFxuLmZhLWFycm93LXJpZ2h0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNjFcXFwiO1xcbn1cXG4uZmEtYXJyb3ctdXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA2MlxcXCI7XFxufVxcbi5mYS1hcnJvdy1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNjNcXFwiO1xcbn1cXG4uZmEtbWFpbC1mb3J3YXJkOmJlZm9yZSxcXG4uZmEtc2hhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA2NFxcXCI7XFxufVxcbi5mYS1leHBhbmQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA2NVxcXCI7XFxufVxcbi5mYS1jb21wcmVzczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDY2XFxcIjtcXG59XFxuLmZhLXBsdXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA2N1xcXCI7XFxufVxcbi5mYS1taW51czpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDY4XFxcIjtcXG59XFxuLmZhLWFzdGVyaXNrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNjlcXFwiO1xcbn1cXG4uZmEtZXhjbGFtYXRpb24tY2lyY2xlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNkFcXFwiO1xcbn1cXG4uZmEtZ2lmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDZCXFxcIjtcXG59XFxuLmZhLWxlYWY6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA2Q1xcXCI7XFxufVxcbi5mYS1maXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNkRcXFwiO1xcbn1cXG4uZmEtZXllOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNkVcXFwiO1xcbn1cXG4uZmEtZXllLXNsYXNoOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNzBcXFwiO1xcbn1cXG4uZmEtd2FybmluZzpiZWZvcmUsXFxuLmZhLWV4Y2xhbWF0aW9uLXRyaWFuZ2xlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNzFcXFwiO1xcbn1cXG4uZmEtcGxhbmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA3MlxcXCI7XFxufVxcbi5mYS1jYWxlbmRhcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDczXFxcIjtcXG59XFxuLmZhLXJhbmRvbTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDc0XFxcIjtcXG59XFxuLmZhLWNvbW1lbnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA3NVxcXCI7XFxufVxcbi5mYS1tYWduZXQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA3NlxcXCI7XFxufVxcbi5mYS1jaGV2cm9uLXVwOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNzdcXFwiO1xcbn1cXG4uZmEtY2hldnJvbi1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwNzhcXFwiO1xcbn1cXG4uZmEtcmV0d2VldDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDc5XFxcIjtcXG59XFxuLmZhLXNob3BwaW5nLWNhcnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA3QVxcXCI7XFxufVxcbi5mYS1mb2xkZXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA3QlxcXCI7XFxufVxcbi5mYS1mb2xkZXItb3BlbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDdDXFxcIjtcXG59XFxuLmZhLWFycm93cy12OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwN0RcXFwiO1xcbn1cXG4uZmEtYXJyb3dzLWg6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA3RVxcXCI7XFxufVxcbi5mYS1iYXItY2hhcnQtbzpiZWZvcmUsXFxuLmZhLWJhci1jaGFydDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDgwXFxcIjtcXG59XFxuLmZhLXR3aXR0ZXItc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwODFcXFwiO1xcbn1cXG4uZmEtZmFjZWJvb2stc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwODJcXFwiO1xcbn1cXG4uZmEtY2FtZXJhLXJldHJvOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwODNcXFwiO1xcbn1cXG4uZmEta2V5OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwODRcXFwiO1xcbn1cXG4uZmEtZ2VhcnM6YmVmb3JlLFxcbi5mYS1jb2dzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwODVcXFwiO1xcbn1cXG4uZmEtY29tbWVudHM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA4NlxcXCI7XFxufVxcbi5mYS10aHVtYnMtby11cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDg3XFxcIjtcXG59XFxuLmZhLXRodW1icy1vLWRvd246YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA4OFxcXCI7XFxufVxcbi5mYS1zdGFyLWhhbGY6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA4OVxcXCI7XFxufVxcbi5mYS1oZWFydC1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOEFcXFwiO1xcbn1cXG4uZmEtc2lnbi1vdXQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA4QlxcXCI7XFxufVxcbi5mYS1saW5rZWRpbi1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA4Q1xcXCI7XFxufVxcbi5mYS10aHVtYi10YWNrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOERcXFwiO1xcbn1cXG4uZmEtZXh0ZXJuYWwtbGluazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDhFXFxcIjtcXG59XFxuLmZhLXNpZ24taW46YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA5MFxcXCI7XFxufVxcbi5mYS10cm9waHk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA5MVxcXCI7XFxufVxcbi5mYS1naXRodWItc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOTJcXFwiO1xcbn1cXG4uZmEtdXBsb2FkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOTNcXFwiO1xcbn1cXG4uZmEtbGVtb24tbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDk0XFxcIjtcXG59XFxuLmZhLXBob25lOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOTVcXFwiO1xcbn1cXG4uZmEtc3F1YXJlLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjA5NlxcXCI7XFxufVxcbi5mYS1ib29rbWFyay1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOTdcXFwiO1xcbn1cXG4uZmEtcGhvbmUtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOThcXFwiO1xcbn1cXG4uZmEtdHdpdHRlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDk5XFxcIjtcXG59XFxuLmZhLWZhY2Vib29rLWY6YmVmb3JlLFxcbi5mYS1mYWNlYm9vazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDlBXFxcIjtcXG59XFxuLmZhLWdpdGh1YjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDlCXFxcIjtcXG59XFxuLmZhLXVubG9jazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDlDXFxcIjtcXG59XFxuLmZhLWNyZWRpdC1jYXJkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwOURcXFwiO1xcbn1cXG4uZmEtZmVlZDpiZWZvcmUsXFxuLmZhLXJzczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMDlFXFxcIjtcXG59XFxuLmZhLWhkZC1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQTBcXFwiO1xcbn1cXG4uZmEtYnVsbGhvcm46YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBMVxcXCI7XFxufVxcbi5mYS1iZWxsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRjNcXFwiO1xcbn1cXG4uZmEtY2VydGlmaWNhdGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBM1xcXCI7XFxufVxcbi5mYS1oYW5kLW8tcmlnaHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBNFxcXCI7XFxufVxcbi5mYS1oYW5kLW8tbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEE1XFxcIjtcXG59XFxuLmZhLWhhbmQtby11cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEE2XFxcIjtcXG59XFxuLmZhLWhhbmQtby1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQTdcXFwiO1xcbn1cXG4uZmEtYXJyb3ctY2lyY2xlLWxlZnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBOFxcXCI7XFxufVxcbi5mYS1hcnJvdy1jaXJjbGUtcmlnaHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBOVxcXCI7XFxufVxcbi5mYS1hcnJvdy1jaXJjbGUtdXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBQVxcXCI7XFxufVxcbi5mYS1hcnJvdy1jaXJjbGUtZG93bjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEFCXFxcIjtcXG59XFxuLmZhLWdsb2JlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQUNcXFwiO1xcbn1cXG4uZmEtd3JlbmNoOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQURcXFwiO1xcbn1cXG4uZmEtdGFza3M6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBRVxcXCI7XFxufVxcbi5mYS1maWx0ZXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBCMFxcXCI7XFxufVxcbi5mYS1icmllZmNhc2U6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBCMVxcXCI7XFxufVxcbi5mYS1hcnJvd3MtYWx0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQjJcXFwiO1xcbn1cXG4uZmEtZ3JvdXA6YmVmb3JlLFxcbi5mYS11c2VyczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEMwXFxcIjtcXG59XFxuLmZhLWNoYWluOmJlZm9yZSxcXG4uZmEtbGluazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEMxXFxcIjtcXG59XFxuLmZhLWNsb3VkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQzJcXFwiO1xcbn1cXG4uZmEtZmxhc2s6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBDM1xcXCI7XFxufVxcbi5mYS1jdXQ6YmVmb3JlLFxcbi5mYS1zY2lzc29yczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEM0XFxcIjtcXG59XFxuLmZhLWNvcHk6YmVmb3JlLFxcbi5mYS1maWxlcy1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQzVcXFwiO1xcbn1cXG4uZmEtcGFwZXJjbGlwOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQzZcXFwiO1xcbn1cXG4uZmEtc2F2ZTpiZWZvcmUsXFxuLmZhLWZsb3BweS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQzdcXFwiO1xcbn1cXG4uZmEtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQzhcXFwiO1xcbn1cXG4uZmEtbmF2aWNvbjpiZWZvcmUsXFxuLmZhLXJlb3JkZXI6YmVmb3JlLFxcbi5mYS1iYXJzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQzlcXFwiO1xcbn1cXG4uZmEtbGlzdC11bDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMENBXFxcIjtcXG59XFxuLmZhLWxpc3Qtb2w6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBDQlxcXCI7XFxufVxcbi5mYS1zdHJpa2V0aHJvdWdoOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQ0NcXFwiO1xcbn1cXG4uZmEtdW5kZXJsaW5lOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwQ0RcXFwiO1xcbn1cXG4uZmEtdGFibGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBDRVxcXCI7XFxufVxcbi5mYS1tYWdpYzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEQwXFxcIjtcXG59XFxuLmZhLXRydWNrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRDFcXFwiO1xcbn1cXG4uZmEtcGludGVyZXN0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRDJcXFwiO1xcbn1cXG4uZmEtcGludGVyZXN0LXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEQzXFxcIjtcXG59XFxuLmZhLWdvb2dsZS1wbHVzLXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEQ0XFxcIjtcXG59XFxuLmZhLWdvb2dsZS1wbHVzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRDVcXFwiO1xcbn1cXG4uZmEtbW9uZXk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBENlxcXCI7XFxufVxcbi5mYS1jYXJldC1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRDdcXFwiO1xcbn1cXG4uZmEtY2FyZXQtdXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBEOFxcXCI7XFxufVxcbi5mYS1jYXJldC1sZWZ0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRDlcXFwiO1xcbn1cXG4uZmEtY2FyZXQtcmlnaHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBEQVxcXCI7XFxufVxcbi5mYS1jb2x1bW5zOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwREJcXFwiO1xcbn1cXG4uZmEtdW5zb3J0ZWQ6YmVmb3JlLFxcbi5mYS1zb3J0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRENcXFwiO1xcbn1cXG4uZmEtc29ydC1kb3duOmJlZm9yZSxcXG4uZmEtc29ydC1kZXNjOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRERcXFwiO1xcbn1cXG4uZmEtc29ydC11cDpiZWZvcmUsXFxuLmZhLXNvcnQtYXNjOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwREVcXFwiO1xcbn1cXG4uZmEtZW52ZWxvcGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBFMFxcXCI7XFxufVxcbi5mYS1saW5rZWRpbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEUxXFxcIjtcXG59XFxuLmZhLXJvdGF0ZS1sZWZ0OmJlZm9yZSxcXG4uZmEtdW5kbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEUyXFxcIjtcXG59XFxuLmZhLWxlZ2FsOmJlZm9yZSxcXG4uZmEtZ2F2ZWw6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBFM1xcXCI7XFxufVxcbi5mYS1kYXNoYm9hcmQ6YmVmb3JlLFxcbi5mYS10YWNob21ldGVyOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRTRcXFwiO1xcbn1cXG4uZmEtY29tbWVudC1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRTVcXFwiO1xcbn1cXG4uZmEtY29tbWVudHMtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEU2XFxcIjtcXG59XFxuLmZhLWZsYXNoOmJlZm9yZSxcXG4uZmEtYm9sdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEU3XFxcIjtcXG59XFxuLmZhLXNpdGVtYXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBFOFxcXCI7XFxufVxcbi5mYS11bWJyZWxsYTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEU5XFxcIjtcXG59XFxuLmZhLXBhc3RlOmJlZm9yZSxcXG4uZmEtY2xpcGJvYXJkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRUFcXFwiO1xcbn1cXG4uZmEtbGlnaHRidWxiLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBFQlxcXCI7XFxufVxcbi5mYS1leGNoYW5nZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEVDXFxcIjtcXG59XFxuLmZhLWNsb3VkLWRvd25sb2FkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRURcXFwiO1xcbn1cXG4uZmEtY2xvdWQtdXBsb2FkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRUVcXFwiO1xcbn1cXG4uZmEtdXNlci1tZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEYwXFxcIjtcXG59XFxuLmZhLXN0ZXRob3Njb3BlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRjFcXFwiO1xcbn1cXG4uZmEtc3VpdGNhc2U6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBGMlxcXCI7XFxufVxcbi5mYS1iZWxsLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBBMlxcXCI7XFxufVxcbi5mYS1jb2ZmZWU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBGNFxcXCI7XFxufVxcbi5mYS1jdXRsZXJ5OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRjVcXFwiO1xcbn1cXG4uZmEtZmlsZS10ZXh0LW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBGNlxcXCI7XFxufVxcbi5mYS1idWlsZGluZy1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRjdcXFwiO1xcbn1cXG4uZmEtaG9zcGl0YWwtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEY4XFxcIjtcXG59XFxuLmZhLWFtYnVsYW5jZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEY5XFxcIjtcXG59XFxuLmZhLW1lZGtpdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEZBXFxcIjtcXG59XFxuLmZhLWZpZ2h0ZXItamV0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRkJcXFwiO1xcbn1cXG4uZmEtYmVlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMEZDXFxcIjtcXG59XFxuLmZhLWgtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYwRkRcXFwiO1xcbn1cXG4uZmEtcGx1cy1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjBGRVxcXCI7XFxufVxcbi5mYS1hbmdsZS1kb3VibGUtbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTAwXFxcIjtcXG59XFxuLmZhLWFuZ2xlLWRvdWJsZS1yaWdodDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTAxXFxcIjtcXG59XFxuLmZhLWFuZ2xlLWRvdWJsZS11cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTAyXFxcIjtcXG59XFxuLmZhLWFuZ2xlLWRvdWJsZS1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMDNcXFwiO1xcbn1cXG4uZmEtYW5nbGUtbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTA0XFxcIjtcXG59XFxuLmZhLWFuZ2xlLXJpZ2h0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMDVcXFwiO1xcbn1cXG4uZmEtYW5nbGUtdXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEwNlxcXCI7XFxufVxcbi5mYS1hbmdsZS1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMDdcXFwiO1xcbn1cXG4uZmEtZGVza3RvcDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTA4XFxcIjtcXG59XFxuLmZhLWxhcHRvcDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTA5XFxcIjtcXG59XFxuLmZhLXRhYmxldDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTBBXFxcIjtcXG59XFxuLmZhLW1vYmlsZS1waG9uZTpiZWZvcmUsXFxuLmZhLW1vYmlsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTBCXFxcIjtcXG59XFxuLmZhLWNpcmNsZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMENcXFwiO1xcbn1cXG4uZmEtcXVvdGUtbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTBEXFxcIjtcXG59XFxuLmZhLXF1b3RlLXJpZ2h0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMEVcXFwiO1xcbn1cXG4uZmEtc3Bpbm5lcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTEwXFxcIjtcXG59XFxuLmZhLWNpcmNsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTExXFxcIjtcXG59XFxuLmZhLW1haWwtcmVwbHk6YmVmb3JlLFxcbi5mYS1yZXBseTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTEyXFxcIjtcXG59XFxuLmZhLWdpdGh1Yi1hbHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjExM1xcXCI7XFxufVxcbi5mYS1mb2xkZXItbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTE0XFxcIjtcXG59XFxuLmZhLWZvbGRlci1vcGVuLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjExNVxcXCI7XFxufVxcbi5mYS1zbWlsZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMThcXFwiO1xcbn1cXG4uZmEtZnJvd24tbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTE5XFxcIjtcXG59XFxuLmZhLW1laC1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMUFcXFwiO1xcbn1cXG4uZmEtZ2FtZXBhZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTFCXFxcIjtcXG59XFxuLmZhLWtleWJvYXJkLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjExQ1xcXCI7XFxufVxcbi5mYS1mbGFnLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjExRFxcXCI7XFxufVxcbi5mYS1mbGFnLWNoZWNrZXJlZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTFFXFxcIjtcXG59XFxuLmZhLXRlcm1pbmFsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMjBcXFwiO1xcbn1cXG4uZmEtY29kZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTIxXFxcIjtcXG59XFxuLmZhLW1haWwtcmVwbHktYWxsOmJlZm9yZSxcXG4uZmEtcmVwbHktYWxsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMjJcXFwiO1xcbn1cXG4uZmEtc3Rhci1oYWxmLWVtcHR5OmJlZm9yZSxcXG4uZmEtc3Rhci1oYWxmLWZ1bGw6YmVmb3JlLFxcbi5mYS1zdGFyLWhhbGYtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTIzXFxcIjtcXG59XFxuLmZhLWxvY2F0aW9uLWFycm93OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMjRcXFwiO1xcbn1cXG4uZmEtY3JvcDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTI1XFxcIjtcXG59XFxuLmZhLWNvZGUtZm9yazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTI2XFxcIjtcXG59XFxuLmZhLXVubGluazpiZWZvcmUsXFxuLmZhLWNoYWluLWJyb2tlbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTI3XFxcIjtcXG59XFxuLmZhLXF1ZXN0aW9uOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMjhcXFwiO1xcbn1cXG4uZmEtaW5mbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTI5XFxcIjtcXG59XFxuLmZhLWV4Y2xhbWF0aW9uOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMkFcXFwiO1xcbn1cXG4uZmEtc3VwZXJzY3JpcHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEyQlxcXCI7XFxufVxcbi5mYS1zdWJzY3JpcHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEyQ1xcXCI7XFxufVxcbi5mYS1lcmFzZXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEyRFxcXCI7XFxufVxcbi5mYS1wdXp6bGUtcGllY2U6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEyRVxcXCI7XFxufVxcbi5mYS1taWNyb3Bob25lOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMzBcXFwiO1xcbn1cXG4uZmEtbWljcm9waG9uZS1zbGFzaDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTMxXFxcIjtcXG59XFxuLmZhLXNoaWVsZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTMyXFxcIjtcXG59XFxuLmZhLWNhbGVuZGFyLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEzM1xcXCI7XFxufVxcbi5mYS1maXJlLWV4dGluZ3Vpc2hlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTM0XFxcIjtcXG59XFxuLmZhLXJvY2tldDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTM1XFxcIjtcXG59XFxuLmZhLW1heGNkbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTM2XFxcIjtcXG59XFxuLmZhLWNoZXZyb24tY2lyY2xlLWxlZnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEzN1xcXCI7XFxufVxcbi5mYS1jaGV2cm9uLWNpcmNsZS1yaWdodDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTM4XFxcIjtcXG59XFxuLmZhLWNoZXZyb24tY2lyY2xlLXVwOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxMzlcXFwiO1xcbn1cXG4uZmEtY2hldnJvbi1jaXJjbGUtZG93bjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTNBXFxcIjtcXG59XFxuLmZhLWh0bWw1OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxM0JcXFwiO1xcbn1cXG4uZmEtY3NzMzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTNDXFxcIjtcXG59XFxuLmZhLWFuY2hvcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTNEXFxcIjtcXG59XFxuLmZhLXVubG9jay1hbHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjEzRVxcXCI7XFxufVxcbi5mYS1idWxsc2V5ZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTQwXFxcIjtcXG59XFxuLmZhLWVsbGlwc2lzLWg6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE0MVxcXCI7XFxufVxcbi5mYS1lbGxpcHNpcy12OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNDJcXFwiO1xcbn1cXG4uZmEtcnNzLXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTQzXFxcIjtcXG59XFxuLmZhLXBsYXktY2lyY2xlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNDRcXFwiO1xcbn1cXG4uZmEtdGlja2V0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNDVcXFwiO1xcbn1cXG4uZmEtbWludXMtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNDZcXFwiO1xcbn1cXG4uZmEtbWludXMtc3F1YXJlLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE0N1xcXCI7XFxufVxcbi5mYS1sZXZlbC11cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTQ4XFxcIjtcXG59XFxuLmZhLWxldmVsLWRvd246YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE0OVxcXCI7XFxufVxcbi5mYS1jaGVjay1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE0QVxcXCI7XFxufVxcbi5mYS1wZW5jaWwtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNEJcXFwiO1xcbn1cXG4uZmEtZXh0ZXJuYWwtbGluay1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE0Q1xcXCI7XFxufVxcbi5mYS1zaGFyZS1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE0RFxcXCI7XFxufVxcbi5mYS1jb21wYXNzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNEVcXFwiO1xcbn1cXG4uZmEtdG9nZ2xlLWRvd246YmVmb3JlLFxcbi5mYS1jYXJldC1zcXVhcmUtby1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNTBcXFwiO1xcbn1cXG4uZmEtdG9nZ2xlLXVwOmJlZm9yZSxcXG4uZmEtY2FyZXQtc3F1YXJlLW8tdXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE1MVxcXCI7XFxufVxcbi5mYS10b2dnbGUtcmlnaHQ6YmVmb3JlLFxcbi5mYS1jYXJldC1zcXVhcmUtby1yaWdodDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTUyXFxcIjtcXG59XFxuLmZhLWV1cm86YmVmb3JlLFxcbi5mYS1ldXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE1M1xcXCI7XFxufVxcbi5mYS1nYnA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE1NFxcXCI7XFxufVxcbi5mYS1kb2xsYXI6YmVmb3JlLFxcbi5mYS11c2Q6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE1NVxcXCI7XFxufVxcbi5mYS1ydXBlZTpiZWZvcmUsXFxuLmZhLWlucjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTU2XFxcIjtcXG59XFxuLmZhLWNueTpiZWZvcmUsXFxuLmZhLXJtYjpiZWZvcmUsXFxuLmZhLXllbjpiZWZvcmUsXFxuLmZhLWpweTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTU3XFxcIjtcXG59XFxuLmZhLXJ1YmxlOmJlZm9yZSxcXG4uZmEtcm91YmxlOmJlZm9yZSxcXG4uZmEtcnViOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNThcXFwiO1xcbn1cXG4uZmEtd29uOmJlZm9yZSxcXG4uZmEta3J3OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNTlcXFwiO1xcbn1cXG4uZmEtYml0Y29pbjpiZWZvcmUsXFxuLmZhLWJ0YzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTVBXFxcIjtcXG59XFxuLmZhLWZpbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE1QlxcXCI7XFxufVxcbi5mYS1maWxlLXRleHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE1Q1xcXCI7XFxufVxcbi5mYS1zb3J0LWFscGhhLWFzYzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTVEXFxcIjtcXG59XFxuLmZhLXNvcnQtYWxwaGEtZGVzYzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTVFXFxcIjtcXG59XFxuLmZhLXNvcnQtYW1vdW50LWFzYzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTYwXFxcIjtcXG59XFxuLmZhLXNvcnQtYW1vdW50LWRlc2M6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE2MVxcXCI7XFxufVxcbi5mYS1zb3J0LW51bWVyaWMtYXNjOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNjJcXFwiO1xcbn1cXG4uZmEtc29ydC1udW1lcmljLWRlc2M6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE2M1xcXCI7XFxufVxcbi5mYS10aHVtYnMtdXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE2NFxcXCI7XFxufVxcbi5mYS10aHVtYnMtZG93bjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTY1XFxcIjtcXG59XFxuLmZhLXlvdXR1YmUtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNjZcXFwiO1xcbn1cXG4uZmEteW91dHViZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTY3XFxcIjtcXG59XFxuLmZhLXhpbmc6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE2OFxcXCI7XFxufVxcbi5mYS14aW5nLXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTY5XFxcIjtcXG59XFxuLmZhLXlvdXR1YmUtcGxheTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTZBXFxcIjtcXG59XFxuLmZhLWRyb3Bib3g6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE2QlxcXCI7XFxufVxcbi5mYS1zdGFjay1vdmVyZmxvdzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTZDXFxcIjtcXG59XFxuLmZhLWluc3RhZ3JhbTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTZEXFxcIjtcXG59XFxuLmZhLWZsaWNrcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTZFXFxcIjtcXG59XFxuLmZhLWFkbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTcwXFxcIjtcXG59XFxuLmZhLWJpdGJ1Y2tldDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTcxXFxcIjtcXG59XFxuLmZhLWJpdGJ1Y2tldC1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE3MlxcXCI7XFxufVxcbi5mYS10dW1ibHI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE3M1xcXCI7XFxufVxcbi5mYS10dW1ibHItc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNzRcXFwiO1xcbn1cXG4uZmEtbG9uZy1hcnJvdy1kb3duOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxNzVcXFwiO1xcbn1cXG4uZmEtbG9uZy1hcnJvdy11cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTc2XFxcIjtcXG59XFxuLmZhLWxvbmctYXJyb3ctbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTc3XFxcIjtcXG59XFxuLmZhLWxvbmctYXJyb3ctcmlnaHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE3OFxcXCI7XFxufVxcbi5mYS1hcHBsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTc5XFxcIjtcXG59XFxuLmZhLXdpbmRvd3M6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE3QVxcXCI7XFxufVxcbi5mYS1hbmRyb2lkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxN0JcXFwiO1xcbn1cXG4uZmEtbGludXg6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE3Q1xcXCI7XFxufVxcbi5mYS1kcmliYmJsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTdEXFxcIjtcXG59XFxuLmZhLXNreXBlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxN0VcXFwiO1xcbn1cXG4uZmEtZm91cnNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTgwXFxcIjtcXG59XFxuLmZhLXRyZWxsbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTgxXFxcIjtcXG59XFxuLmZhLWZlbWFsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTgyXFxcIjtcXG59XFxuLmZhLW1hbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE4M1xcXCI7XFxufVxcbi5mYS1naXR0aXA6YmVmb3JlLFxcbi5mYS1ncmF0aXBheTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTg0XFxcIjtcXG59XFxuLmZhLXN1bi1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxODVcXFwiO1xcbn1cXG4uZmEtbW9vbi1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxODZcXFwiO1xcbn1cXG4uZmEtYXJjaGl2ZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTg3XFxcIjtcXG59XFxuLmZhLWJ1ZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTg4XFxcIjtcXG59XFxuLmZhLXZrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxODlcXFwiO1xcbn1cXG4uZmEtd2VpYm86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE4QVxcXCI7XFxufVxcbi5mYS1yZW5yZW46YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE4QlxcXCI7XFxufVxcbi5mYS1wYWdlbGluZXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE4Q1xcXCI7XFxufVxcbi5mYS1zdGFjay1leGNoYW5nZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMThEXFxcIjtcXG59XFxuLmZhLWFycm93LWNpcmNsZS1vLXJpZ2h0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxOEVcXFwiO1xcbn1cXG4uZmEtYXJyb3ctY2lyY2xlLW8tbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTkwXFxcIjtcXG59XFxuLmZhLXRvZ2dsZS1sZWZ0OmJlZm9yZSxcXG4uZmEtY2FyZXQtc3F1YXJlLW8tbGVmdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTkxXFxcIjtcXG59XFxuLmZhLWRvdC1jaXJjbGUtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTkyXFxcIjtcXG59XFxuLmZhLXdoZWVsY2hhaXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE5M1xcXCI7XFxufVxcbi5mYS12aW1lby1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE5NFxcXCI7XFxufVxcbi5mYS10dXJraXNoLWxpcmE6YmVmb3JlLFxcbi5mYS10cnk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE5NVxcXCI7XFxufVxcbi5mYS1wbHVzLXNxdWFyZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxOTZcXFwiO1xcbn1cXG4uZmEtc3BhY2Utc2h1dHRsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTk3XFxcIjtcXG59XFxuLmZhLXNsYWNrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxOThcXFwiO1xcbn1cXG4uZmEtZW52ZWxvcGUtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxOTlcXFwiO1xcbn1cXG4uZmEtd29yZHByZXNzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxOUFcXFwiO1xcbn1cXG4uZmEtb3BlbmlkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxOUJcXFwiO1xcbn1cXG4uZmEtaW5zdGl0dXRpb246YmVmb3JlLFxcbi5mYS1iYW5rOmJlZm9yZSxcXG4uZmEtdW5pdmVyc2l0eTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMTlDXFxcIjtcXG59XFxuLmZhLW1vcnRhci1ib2FyZDpiZWZvcmUsXFxuLmZhLWdyYWR1YXRpb24tY2FwOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxOURcXFwiO1xcbn1cXG4uZmEteWFob286YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjE5RVxcXCI7XFxufVxcbi5mYS1nb29nbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFBMFxcXCI7XFxufVxcbi5mYS1yZWRkaXQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFBMVxcXCI7XFxufVxcbi5mYS1yZWRkaXQtc3F1YXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQTJcXFwiO1xcbn1cXG4uZmEtc3R1bWJsZXVwb24tY2lyY2xlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQTNcXFwiO1xcbn1cXG4uZmEtc3R1bWJsZXVwb246YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFBNFxcXCI7XFxufVxcbi5mYS1kZWxpY2lvdXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFBNVxcXCI7XFxufVxcbi5mYS1kaWdnOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQTZcXFwiO1xcbn1cXG4uZmEtcGllZC1waXBlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUE3XFxcIjtcXG59XFxuLmZhLXBpZWQtcGlwZXItYWx0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQThcXFwiO1xcbn1cXG4uZmEtZHJ1cGFsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQTlcXFwiO1xcbn1cXG4uZmEtam9vbWxhOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQUFcXFwiO1xcbn1cXG4uZmEtbGFuZ3VhZ2U6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFBQlxcXCI7XFxufVxcbi5mYS1mYXg6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFBQ1xcXCI7XFxufVxcbi5mYS1idWlsZGluZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUFEXFxcIjtcXG59XFxuLmZhLWNoaWxkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQUVcXFwiO1xcbn1cXG4uZmEtcGF3OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQjBcXFwiO1xcbn1cXG4uZmEtc3Bvb246YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFCMVxcXCI7XFxufVxcbi5mYS1jdWJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQjJcXFwiO1xcbn1cXG4uZmEtY3ViZXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFCM1xcXCI7XFxufVxcbi5mYS1iZWhhbmNlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQjRcXFwiO1xcbn1cXG4uZmEtYmVoYW5jZS1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFCNVxcXCI7XFxufVxcbi5mYS1zdGVhbTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUI2XFxcIjtcXG59XFxuLmZhLXN0ZWFtLXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUI3XFxcIjtcXG59XFxuLmZhLXJlY3ljbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFCOFxcXCI7XFxufVxcbi5mYS1hdXRvbW9iaWxlOmJlZm9yZSxcXG4uZmEtY2FyOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQjlcXFwiO1xcbn1cXG4uZmEtY2FiOmJlZm9yZSxcXG4uZmEtdGF4aTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUJBXFxcIjtcXG59XFxuLmZhLXRyZWU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFCQlxcXCI7XFxufVxcbi5mYS1zcG90aWZ5OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQkNcXFwiO1xcbn1cXG4uZmEtZGV2aWFudGFydDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUJEXFxcIjtcXG59XFxuLmZhLXNvdW5kY2xvdWQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFCRVxcXCI7XFxufVxcbi5mYS1kYXRhYmFzZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUMwXFxcIjtcXG59XFxuLmZhLWZpbGUtcGRmLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFDMVxcXCI7XFxufVxcbi5mYS1maWxlLXdvcmQtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUMyXFxcIjtcXG59XFxuLmZhLWZpbGUtZXhjZWwtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUMzXFxcIjtcXG59XFxuLmZhLWZpbGUtcG93ZXJwb2ludC1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQzRcXFwiO1xcbn1cXG4uZmEtZmlsZS1waG90by1vOmJlZm9yZSxcXG4uZmEtZmlsZS1waWN0dXJlLW86YmVmb3JlLFxcbi5mYS1maWxlLWltYWdlLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFDNVxcXCI7XFxufVxcbi5mYS1maWxlLXppcC1vOmJlZm9yZSxcXG4uZmEtZmlsZS1hcmNoaXZlLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFDNlxcXCI7XFxufVxcbi5mYS1maWxlLXNvdW5kLW86YmVmb3JlLFxcbi5mYS1maWxlLWF1ZGlvLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFDN1xcXCI7XFxufVxcbi5mYS1maWxlLW1vdmllLW86YmVmb3JlLFxcbi5mYS1maWxlLXZpZGVvLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFDOFxcXCI7XFxufVxcbi5mYS1maWxlLWNvZGUtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUM5XFxcIjtcXG59XFxuLmZhLXZpbmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFDQVxcXCI7XFxufVxcbi5mYS1jb2RlcGVuOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQ0JcXFwiO1xcbn1cXG4uZmEtanNmaWRkbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFDQ1xcXCI7XFxufVxcbi5mYS1saWZlLWJvdXk6YmVmb3JlLFxcbi5mYS1saWZlLWJ1b3k6YmVmb3JlLFxcbi5mYS1saWZlLXNhdmVyOmJlZm9yZSxcXG4uZmEtc3VwcG9ydDpiZWZvcmUsXFxuLmZhLWxpZmUtcmluZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUNEXFxcIjtcXG59XFxuLmZhLWNpcmNsZS1vLW5vdGNoOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxQ0VcXFwiO1xcbn1cXG4uZmEtcmE6YmVmb3JlLFxcbi5mYS1yZWJlbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUQwXFxcIjtcXG59XFxuLmZhLWdlOmJlZm9yZSxcXG4uZmEtZW1waXJlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRDFcXFwiO1xcbn1cXG4uZmEtZ2l0LXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUQyXFxcIjtcXG59XFxuLmZhLWdpdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUQzXFxcIjtcXG59XFxuLmZhLXktY29tYmluYXRvci1zcXVhcmU6YmVmb3JlLFxcbi5mYS15Yy1zcXVhcmU6YmVmb3JlLFxcbi5mYS1oYWNrZXItbmV3czpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUQ0XFxcIjtcXG59XFxuLmZhLXRlbmNlbnQtd2VpYm86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFENVxcXCI7XFxufVxcbi5mYS1xcTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUQ2XFxcIjtcXG59XFxuLmZhLXdlY2hhdDpiZWZvcmUsXFxuLmZhLXdlaXhpbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUQ3XFxcIjtcXG59XFxuLmZhLXNlbmQ6YmVmb3JlLFxcbi5mYS1wYXBlci1wbGFuZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUQ4XFxcIjtcXG59XFxuLmZhLXNlbmQtbzpiZWZvcmUsXFxuLmZhLXBhcGVyLXBsYW5lLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFEOVxcXCI7XFxufVxcbi5mYS1oaXN0b3J5OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxREFcXFwiO1xcbn1cXG4uZmEtY2lyY2xlLXRoaW46YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFEQlxcXCI7XFxufVxcbi5mYS1oZWFkZXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFEQ1xcXCI7XFxufVxcbi5mYS1wYXJhZ3JhcGg6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFERFxcXCI7XFxufVxcbi5mYS1zbGlkZXJzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxREVcXFwiO1xcbn1cXG4uZmEtc2hhcmUtYWx0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRTBcXFwiO1xcbn1cXG4uZmEtc2hhcmUtYWx0LXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUUxXFxcIjtcXG59XFxuLmZhLWJvbWI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFFMlxcXCI7XFxufVxcbi5mYS1zb2NjZXItYmFsbC1vOmJlZm9yZSxcXG4uZmEtZnV0Ym9sLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFFM1xcXCI7XFxufVxcbi5mYS10dHk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFFNFxcXCI7XFxufVxcbi5mYS1iaW5vY3VsYXJzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRTVcXFwiO1xcbn1cXG4uZmEtcGx1ZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUU2XFxcIjtcXG59XFxuLmZhLXNsaWRlc2hhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFFN1xcXCI7XFxufVxcbi5mYS10d2l0Y2g6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFFOFxcXCI7XFxufVxcbi5mYS15ZWxwOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRTlcXFwiO1xcbn1cXG4uZmEtbmV3c3BhcGVyLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFFQVxcXCI7XFxufVxcbi5mYS13aWZpOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRUJcXFwiO1xcbn1cXG4uZmEtY2FsY3VsYXRvcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUVDXFxcIjtcXG59XFxuLmZhLXBheXBhbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUVEXFxcIjtcXG59XFxuLmZhLWdvb2dsZS13YWxsZXQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFFRVxcXCI7XFxufVxcbi5mYS1jYy12aXNhOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRjBcXFwiO1xcbn1cXG4uZmEtY2MtbWFzdGVyY2FyZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUYxXFxcIjtcXG59XFxuLmZhLWNjLWRpc2NvdmVyOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRjJcXFwiO1xcbn1cXG4uZmEtY2MtYW1leDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUYzXFxcIjtcXG59XFxuLmZhLWNjLXBheXBhbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUY0XFxcIjtcXG59XFxuLmZhLWNjLXN0cmlwZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUY1XFxcIjtcXG59XFxuLmZhLWJlbGwtc2xhc2g6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFGNlxcXCI7XFxufVxcbi5mYS1iZWxsLXNsYXNoLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFGN1xcXCI7XFxufVxcbi5mYS10cmFzaDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUY4XFxcIjtcXG59XFxuLmZhLWNvcHlyaWdodDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUY5XFxcIjtcXG59XFxuLmZhLWF0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRkFcXFwiO1xcbn1cXG4uZmEtZXllZHJvcHBlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUZCXFxcIjtcXG59XFxuLmZhLXBhaW50LWJydXNoOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYxRkNcXFwiO1xcbn1cXG4uZmEtYmlydGhkYXktY2FrZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMUZEXFxcIjtcXG59XFxuLmZhLWFyZWEtY2hhcnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjFGRVxcXCI7XFxufVxcbi5mYS1waWUtY2hhcnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIwMFxcXCI7XFxufVxcbi5mYS1saW5lLWNoYXJ0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMDFcXFwiO1xcbn1cXG4uZmEtbGFzdGZtOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMDJcXFwiO1xcbn1cXG4uZmEtbGFzdGZtLXNxdWFyZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjAzXFxcIjtcXG59XFxuLmZhLXRvZ2dsZS1vZmY6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIwNFxcXCI7XFxufVxcbi5mYS10b2dnbGUtb246YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIwNVxcXCI7XFxufVxcbi5mYS1iaWN5Y2xlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMDZcXFwiO1xcbn1cXG4uZmEtYnVzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMDdcXFwiO1xcbn1cXG4uZmEtaW94aG9zdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjA4XFxcIjtcXG59XFxuLmZhLWFuZ2VsbGlzdDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjA5XFxcIjtcXG59XFxuLmZhLWNjOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMEFcXFwiO1xcbn1cXG4uZmEtc2hla2VsOmJlZm9yZSxcXG4uZmEtc2hlcWVsOmJlZm9yZSxcXG4uZmEtaWxzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMEJcXFwiO1xcbn1cXG4uZmEtbWVhbnBhdGg6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIwQ1xcXCI7XFxufVxcbi5mYS1idXlzZWxsYWRzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMERcXFwiO1xcbn1cXG4uZmEtY29ubmVjdGRldmVsb3A6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIwRVxcXCI7XFxufVxcbi5mYS1kYXNoY3ViZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjEwXFxcIjtcXG59XFxuLmZhLWZvcnVtYmVlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMTFcXFwiO1xcbn1cXG4uZmEtbGVhbnB1YjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjEyXFxcIjtcXG59XFxuLmZhLXNlbGxzeTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjEzXFxcIjtcXG59XFxuLmZhLXNoaXJ0c2luYnVsazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjE0XFxcIjtcXG59XFxuLmZhLXNpbXBseWJ1aWx0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMTVcXFwiO1xcbn1cXG4uZmEtc2t5YXRsYXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIxNlxcXCI7XFxufVxcbi5mYS1jYXJ0LXBsdXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIxN1xcXCI7XFxufVxcbi5mYS1jYXJ0LWFycm93LWRvd246YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIxOFxcXCI7XFxufVxcbi5mYS1kaWFtb25kOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMTlcXFwiO1xcbn1cXG4uZmEtc2hpcDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjFBXFxcIjtcXG59XFxuLmZhLXVzZXItc2VjcmV0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMUJcXFwiO1xcbn1cXG4uZmEtbW90b3JjeWNsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjFDXFxcIjtcXG59XFxuLmZhLXN0cmVldC12aWV3OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMURcXFwiO1xcbn1cXG4uZmEtaGVhcnRiZWF0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMUVcXFwiO1xcbn1cXG4uZmEtdmVudXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIyMVxcXCI7XFxufVxcbi5mYS1tYXJzOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMjJcXFwiO1xcbn1cXG4uZmEtbWVyY3VyeTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjIzXFxcIjtcXG59XFxuLmZhLWludGVyc2V4OmJlZm9yZSxcXG4uZmEtdHJhbnNnZW5kZXI6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIyNFxcXCI7XFxufVxcbi5mYS10cmFuc2dlbmRlci1hbHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIyNVxcXCI7XFxufVxcbi5mYS12ZW51cy1kb3VibGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIyNlxcXCI7XFxufVxcbi5mYS1tYXJzLWRvdWJsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjI3XFxcIjtcXG59XFxuLmZhLXZlbnVzLW1hcnM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIyOFxcXCI7XFxufVxcbi5mYS1tYXJzLXN0cm9rZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjI5XFxcIjtcXG59XFxuLmZhLW1hcnMtc3Ryb2tlLXY6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIyQVxcXCI7XFxufVxcbi5mYS1tYXJzLXN0cm9rZS1oOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMkJcXFwiO1xcbn1cXG4uZmEtbmV1dGVyOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMkNcXFwiO1xcbn1cXG4uZmEtZ2VuZGVybGVzczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjJEXFxcIjtcXG59XFxuLmZhLWZhY2Vib29rLW9mZmljaWFsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyMzBcXFwiO1xcbn1cXG4uZmEtcGludGVyZXN0LXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIzMVxcXCI7XFxufVxcbi5mYS13aGF0c2FwcDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjMyXFxcIjtcXG59XFxuLmZhLXNlcnZlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjMzXFxcIjtcXG59XFxuLmZhLXVzZXItcGx1czpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjM0XFxcIjtcXG59XFxuLmZhLXVzZXItdGltZXM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIzNVxcXCI7XFxufVxcbi5mYS1ob3RlbDpiZWZvcmUsXFxuLmZhLWJlZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjM2XFxcIjtcXG59XFxuLmZhLXZpYWNvaW46YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjIzN1xcXCI7XFxufVxcbi5mYS10cmFpbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjM4XFxcIjtcXG59XFxuLmZhLXN1YndheTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjM5XFxcIjtcXG59XFxuLmZhLW1lZGl1bTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjNBXFxcIjtcXG59XFxuLmZhLXljOmJlZm9yZSxcXG4uZmEteS1jb21iaW5hdG9yOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyM0JcXFwiO1xcbn1cXG4uZmEtb3B0aW4tbW9uc3RlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjNDXFxcIjtcXG59XFxuLmZhLW9wZW5jYXJ0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyM0RcXFwiO1xcbn1cXG4uZmEtZXhwZWRpdGVkc3NsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyM0VcXFwiO1xcbn1cXG4uZmEtYmF0dGVyeS00OmJlZm9yZSxcXG4uZmEtYmF0dGVyeS1mdWxsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNDBcXFwiO1xcbn1cXG4uZmEtYmF0dGVyeS0zOmJlZm9yZSxcXG4uZmEtYmF0dGVyeS10aHJlZS1xdWFydGVyczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjQxXFxcIjtcXG59XFxuLmZhLWJhdHRlcnktMjpiZWZvcmUsXFxuLmZhLWJhdHRlcnktaGFsZjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjQyXFxcIjtcXG59XFxuLmZhLWJhdHRlcnktMTpiZWZvcmUsXFxuLmZhLWJhdHRlcnktcXVhcnRlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjQzXFxcIjtcXG59XFxuLmZhLWJhdHRlcnktMDpiZWZvcmUsXFxuLmZhLWJhdHRlcnktZW1wdHk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI0NFxcXCI7XFxufVxcbi5mYS1tb3VzZS1wb2ludGVyOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNDVcXFwiO1xcbn1cXG4uZmEtaS1jdXJzb3I6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI0NlxcXCI7XFxufVxcbi5mYS1vYmplY3QtZ3JvdXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI0N1xcXCI7XFxufVxcbi5mYS1vYmplY3QtdW5ncm91cDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjQ4XFxcIjtcXG59XFxuLmZhLXN0aWNreS1ub3RlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNDlcXFwiO1xcbn1cXG4uZmEtc3RpY2t5LW5vdGUtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjRBXFxcIjtcXG59XFxuLmZhLWNjLWpjYjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjRCXFxcIjtcXG59XFxuLmZhLWNjLWRpbmVycy1jbHViOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNENcXFwiO1xcbn1cXG4uZmEtY2xvbmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI0RFxcXCI7XFxufVxcbi5mYS1iYWxhbmNlLXNjYWxlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNEVcXFwiO1xcbn1cXG4uZmEtaG91cmdsYXNzLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1MFxcXCI7XFxufVxcbi5mYS1ob3VyZ2xhc3MtMTpiZWZvcmUsXFxuLmZhLWhvdXJnbGFzcy1zdGFydDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjUxXFxcIjtcXG59XFxuLmZhLWhvdXJnbGFzcy0yOmJlZm9yZSxcXG4uZmEtaG91cmdsYXNzLWhhbGY6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1MlxcXCI7XFxufVxcbi5mYS1ob3VyZ2xhc3MtMzpiZWZvcmUsXFxuLmZhLWhvdXJnbGFzcy1lbmQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1M1xcXCI7XFxufVxcbi5mYS1ob3VyZ2xhc3M6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1NFxcXCI7XFxufVxcbi5mYS1oYW5kLWdyYWItbzpiZWZvcmUsXFxuLmZhLWhhbmQtcm9jay1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNTVcXFwiO1xcbn1cXG4uZmEtaGFuZC1zdG9wLW86YmVmb3JlLFxcbi5mYS1oYW5kLXBhcGVyLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1NlxcXCI7XFxufVxcbi5mYS1oYW5kLXNjaXNzb3JzLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1N1xcXCI7XFxufVxcbi5mYS1oYW5kLWxpemFyZC1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNThcXFwiO1xcbn1cXG4uZmEtaGFuZC1zcG9jay1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNTlcXFwiO1xcbn1cXG4uZmEtaGFuZC1wb2ludGVyLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1QVxcXCI7XFxufVxcbi5mYS1oYW5kLXBlYWNlLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1QlxcXCI7XFxufVxcbi5mYS10cmFkZW1hcms6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI1Q1xcXCI7XFxufVxcbi5mYS1yZWdpc3RlcmVkOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNURcXFwiO1xcbn1cXG4uZmEtY3JlYXRpdmUtY29tbW9uczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjVFXFxcIjtcXG59XFxuLmZhLWdnOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNjBcXFwiO1xcbn1cXG4uZmEtZ2ctY2lyY2xlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNjFcXFwiO1xcbn1cXG4uZmEtdHJpcGFkdmlzb3I6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI2MlxcXCI7XFxufVxcbi5mYS1vZG5va2xhc3NuaWtpOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNjNcXFwiO1xcbn1cXG4uZmEtb2Rub2tsYXNzbmlraS1zcXVhcmU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI2NFxcXCI7XFxufVxcbi5mYS1nZXQtcG9ja2V0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNjVcXFwiO1xcbn1cXG4uZmEtd2lraXBlZGlhLXc6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI2NlxcXCI7XFxufVxcbi5mYS1zYWZhcmk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI2N1xcXCI7XFxufVxcbi5mYS1jaHJvbWU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI2OFxcXCI7XFxufVxcbi5mYS1maXJlZm94OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNjlcXFwiO1xcbn1cXG4uZmEtb3BlcmE6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI2QVxcXCI7XFxufVxcbi5mYS1pbnRlcm5ldC1leHBsb3JlcjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjZCXFxcIjtcXG59XFxuLmZhLXR2OmJlZm9yZSxcXG4uZmEtdGVsZXZpc2lvbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjZDXFxcIjtcXG59XFxuLmZhLWNvbnRhbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjZEXFxcIjtcXG59XFxuLmZhLTUwMHB4OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNkVcXFwiO1xcbn1cXG4uZmEtYW1hem9uOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNzBcXFwiO1xcbn1cXG4uZmEtY2FsZW5kYXItcGx1cy1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNzFcXFwiO1xcbn1cXG4uZmEtY2FsZW5kYXItbWludXMtbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjcyXFxcIjtcXG59XFxuLmZhLWNhbGVuZGFyLXRpbWVzLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI3M1xcXCI7XFxufVxcbi5mYS1jYWxlbmRhci1jaGVjay1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNzRcXFwiO1xcbn1cXG4uZmEtaW5kdXN0cnk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI3NVxcXCI7XFxufVxcbi5mYS1tYXAtcGluOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNzZcXFwiO1xcbn1cXG4uZmEtbWFwLXNpZ25zOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyNzdcXFwiO1xcbn1cXG4uZmEtbWFwLW86YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI3OFxcXCI7XFxufVxcbi5mYS1tYXA6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI3OVxcXCI7XFxufVxcbi5mYS1jb21tZW50aW5nOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyN0FcXFwiO1xcbn1cXG4uZmEtY29tbWVudGluZy1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyN0JcXFwiO1xcbn1cXG4uZmEtaG91eno6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI3Q1xcXCI7XFxufVxcbi5mYS12aW1lbzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjdEXFxcIjtcXG59XFxuLmZhLWJsYWNrLXRpZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjdFXFxcIjtcXG59XFxuLmZhLWZvbnRpY29uczpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjgwXFxcIjtcXG59XFxuLmZhLXJlZGRpdC1hbGllbjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjgxXFxcIjtcXG59XFxuLmZhLWVkZ2U6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI4MlxcXCI7XFxufVxcbi5mYS1jcmVkaXQtY2FyZC1hbHQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI4M1xcXCI7XFxufVxcbi5mYS1jb2RpZXBpZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjg0XFxcIjtcXG59XFxuLmZhLW1vZHg6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI4NVxcXCI7XFxufVxcbi5mYS1mb3J0LWF3ZXNvbWU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI4NlxcXCI7XFxufVxcbi5mYS11c2I6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI4N1xcXCI7XFxufVxcbi5mYS1wcm9kdWN0LWh1bnQ6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI4OFxcXCI7XFxufVxcbi5mYS1taXhjbG91ZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjg5XFxcIjtcXG59XFxuLmZhLXNjcmliZDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjhBXFxcIjtcXG59XFxuLmZhLXBhdXNlLWNpcmNsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjhCXFxcIjtcXG59XFxuLmZhLXBhdXNlLWNpcmNsZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyOENcXFwiO1xcbn1cXG4uZmEtc3RvcC1jaXJjbGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFxcRjI4RFxcXCI7XFxufVxcbi5mYS1zdG9wLWNpcmNsZS1vOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyOEVcXFwiO1xcbn1cXG4uZmEtc2hvcHBpbmctYmFnOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyOTBcXFwiO1xcbn1cXG4uZmEtc2hvcHBpbmctYmFza2V0OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyOTFcXFwiO1xcbn1cXG4uZmEtaGFzaHRhZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjkyXFxcIjtcXG59XFxuLmZhLWJsdWV0b290aDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjkzXFxcIjtcXG59XFxuLmZhLWJsdWV0b290aC1iOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcXEYyOTRcXFwiO1xcbn1cXG4uZmEtcGVyY2VudDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXFxGMjk1XFxcIjtcXG59XFxuLndob19pX2FtLXRpdGxlIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07XFxuICBmb250LXNpemU6IDJyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbn1cXG4ud2hvX2lfYW0tdGl0bGVfX25hbWUge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbn1cXG4ud2hvX2lfYW0tdGl0bGVfX3Bvc2l0aW9uIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgY29sb3I6ICM3Nzc7XFxuICBmb250LXdlaWdodDogMTAwO1xcbn1cXG4ud2hvX2lfYW0tYWJvdXQge1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG4gIGNvbG9yOiAjMzMzNzNkO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBmb250LXdlaWdodDogMTAwO1xcbiAgbGluZS1oZWlnaHQ6IDEuNTtcXG4gIHRleHQtYWxpZ246IGp1c3RpZnk7XFxufVxcbi53aG9faV9hbS10YWJsZSB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLndob19pX2FtLXRhYmxlIHtcXG4gICAgYm9yZGVyLWJvdHRvbTogMC4xcmVtIHNvbGlkICNlZmVmZWY7XFxuICB9XFxufVxcbi53aG9faV9hbS10YWJsZV9fdGgsXFxuLndob19pX2FtLXRhYmxlX190ZCB7XFxuICBwYWRkaW5nOiAxcmVtO1xcbiAgd2lkdGg6IDUwJTtcXG4gIGJvcmRlcjogMC4xcmVtIHNvbGlkICNlZmVmZWY7XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAud2hvX2lfYW0tdGFibGVfX3RoLFxcbiAgLndob19pX2FtLXRhYmxlX190ZCB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXG4gIH1cXG59XFxuLndob19pX2FtLXRhYmxlX190aCB7XFxuICBmb250LXdlaWdodDogNzAwO1xcbn1cXG4ud2hvX2lfYW0tdGFibGVfX3RkIHtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmFmYWZhO1xcbn1cXG4uZXhwLWxpc3Qge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG4uZXhwLWxpc3QtdGl0bGVfaWNvbiB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtMC40cmVtO1xcbiAgd2lkdGg6IDQuN3JlbTtcXG4gIGxpbmUtaGVpZ2h0OiA0cmVtO1xcbiAgZm9udC1zaXplOiAycmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgYm9yZGVyOiAwLjNyZW0gc29saWQgI2VmZWZlZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG59XFxuLmV4cC1saXN0LWl0ZW0ge1xcbiAgbWFyZ2luLWxlZnQ6IDEuN3JlbTtcXG4gIHBhZGRpbmctbGVmdDogMnJlbTtcXG4gIHBhZGRpbmctdG9wOiA0cmVtO1xcbiAgYm9yZGVyLWxlZnQ6IDAuM3JlbSBzb2xpZCAjZWZlZmVmO1xcbiAgb3BhY2l0eTogMDtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjAwJSwgMCk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwMCUsIDApO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxufVxcbi5leHAtbGlzdC1pdGVtLnZpc2libGUge1xcbiAgb3BhY2l0eTogMTtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApO1xcbn1cXG4uZXhwLWxpc3QtaXRlbTpob3ZlciAuZXhwLWxpc3QtaXRlbV9fdGl0bGU6YmVmb3JlIHtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxLjUpO1xcbiAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNSk7XFxufVxcbi5leHAtbGlzdC1pdGVtX190aXRsZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbn1cXG4uZXhwLWxpc3QtaXRlbV9fdGl0bGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6ICcnO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDFyZW07XFxuICBoZWlnaHQ6IDFyZW07XFxuICBsZWZ0OiAtMi44cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzU1OGU2YTtcXG4gIGJvcmRlcjogMC4ycmVtIHNvbGlkIHdoaXRlO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxufVxcbi5leHAtbGlzdC1pdGVtX19kYXRlIHtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICBjb2xvcjogIzc3NztcXG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxufVxcbi5leHAtbGlzdC1pdGVtX19kYXRlX19pY29uIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIGNvbG9yOiAjNzc3O1xcbiAgbWFyZ2luLXJpZ2h0OiAwLjVyZW07XFxufVxcbi5leHAtbGlzdC1pdGVtX19kZXNjcmlwdGlvbiB7XFxuICBsaW5lLWhlaWdodDogMS4zO1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIHRleHQtYWxpZ246IGp1c3RpZnk7XFxufVxcbi5pY29ucy1saXN0IHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmljb25zLWxpc3QtaXRlbSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB3aWR0aDogMzAlO1xcbiAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gIHZlcnRpY2FsLWFsaWduOiB0b3A7XFxuICBvcGFjaXR5OiAwO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAyMDAlKTtcXG4gICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMjAwJSk7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG59XFxuLmljb25zLWxpc3QtaXRlbS52aXNpYmxlIHtcXG4gIG9wYWNpdHk6IDE7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDApO1xcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKTtcXG59XFxuLmljb25zLWxpc3QtaXRlbTpob3ZlciB7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMS4yKTtcXG4gICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjIpO1xcbn1cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLmljb25zLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICB3aWR0aDogYXV0bztcXG4gIH1cXG59XFxuLmljb25zLWxpc3QtaXRlbV9faWNvbiB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgY29sb3I6ICM1NThlNmE7XFxuICBmb250LXNpemU6IDVyZW07XFxufVxcbi5pY29ucy1saXN0LWl0ZW1fX3RpdGxlIHtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcXG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxufVxcbi5pY29ucy1saXN0LWl0ZW1fX2Rlc2NyaXB0aW9uIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHdpZHRoOiA3MCU7XFxuICBjb2xvcjogIzc3NztcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgZm9udC1zdHlsZTogaXRhbGljO1xcbiAgZm9udC13ZWlnaHQ6IDEwMDtcXG4gIGxpbmUtaGVpZ2h0OiAxLjI7XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAuaWNvbnMtbGlzdC1pdGVtX19kZXNjcmlwdGlvbiB7XFxuICAgIHdpZHRoOiBhdXRvO1xcbiAgfVxcbn1cXG4udGVjaC1za2lsbHMtaXRlbSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbn1cXG4udGVjaC1za2lsbHMtdGl0bGUge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgd2lkdGg6IDgwJTtcXG4gIHBhZGRpbmctcmlnaHQ6IDNyZW07XFxuICB2ZXJ0aWNhbC1hbGlnbjogdG9wO1xcbn1cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnRlY2gtc2tpbGxzLXRpdGxlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwO1xcbiAgICBsZWZ0OiA1MCU7XFxuICAgIHRvcDogNTAlO1xcbiAgICB3aWR0aDogODAlO1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB9XFxufVxcbi50ZWNoLXNraWxscy10aXRsZV9fbmFtZSB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgY29sb3I6ICMzMzM3M2Q7XFxuICBmb250LXNpemU6IDJyZW07XFxuICBmb250LXN0eWxlOiBpdGFsaWM7XFxuICBsZXR0ZXItc3BhY2luZzogMC4xcmVtO1xcbn1cXG4udGVjaC1za2lsbHMtdGl0bGVfX2Rlc2NyaXB0aW9uIHtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICBjb2xvcjogIzc3NztcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgZm9udC1zdHlsZTogaXRhbGljO1xcbiAgZm9udC13ZWlnaHQ6IDEwMDtcXG4gIGxpbmUtaGVpZ2h0OiAxLjQ7XFxuICB0ZXh0LWFsaWduOiBqdXN0aWZ5O1xcbn1cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnRlY2gtc2tpbGxzLXRpdGxlX19kZXNjcmlwdGlvbiB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxufVxcbi50ZWNoLXNraWxscy10aXRsZV9fa2V5d29yZHMge1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBsaW5lLWhlaWdodDogMS41O1xcbn1cXG4udGVjaC1za2lsbHMtdGl0bGVfX2tleXdvcmRzX19sYWJlbCB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwYWRkaW5nOiAwIDFyZW07XFxuICBtYXJnaW4tcmlnaHQ6IDAuNXJlbTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcXG4gIGZvbnQtd2VpZ2h0OiBub3JtYWw7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNTU4ZTZhO1xcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xcbn1cXG4udGVjaC1za2lsbHMtdGl0bGVfX2tleXdvcmRzX190ZXh0IHtcXG4gIGNvbG9yOiAjNzc3O1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxufVxcbi50ZWNoLXNraWxscy1wcm9ncmVzcyB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB3aWR0aDogMjAlO1xcbiAgdmVydGljYWwtYWxpZ246IHRvcDtcXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC50ZWNoLXNraWxscy1wcm9ncmVzcyB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICB3aWR0aDogYXV0bztcXG4gIH1cXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC50ZWNoLXNraWxscy1wcm9ncmVzcyAudGV4dCB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxufVxcbi5sYW5ndWFnZS1za2lsbHMtaXRlbSB7XFxuICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbn1cXG4ubGFuZ3VhZ2Utc2tpbGxzLXRpdGxlIHtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICBjb2xvcjogIzMzMzczZDtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC1zdHlsZTogaXRhbGljO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMXJlbTtcXG59XFxuLmxhbmd1YWdlLXNraWxscy10aXRsZSAuc21hbGwge1xcbiAgZmxvYXQ6IHJpZ2h0O1xcbiAgY29sb3I6ICM3Nzc7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxufVxcbi5sYW5ndWFnZS1za2lsbHMtcHJvZ3Jlc3Mge1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG59XFxuLmxhbmd1YWdlLXNraWxscy1kZXNjcmlwdGlvbiB7XFxuICBjb2xvcjogIzc3NztcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgZm9udC1zdHlsZTogaXRhbGljO1xcbiAgZm9udC13ZWlnaHQ6IDEwMDtcXG4gIGxpbmUtaGVpZ2h0OiAxLjQ7XFxuICB0ZXh0LWFsaWduOiBqdXN0aWZ5O1xcbn1cXG4udG9vbHMtc2tpbGxzLWl0ZW0ge1xcbiAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcbi50b29scy1za2lsbHMtdGl0bGUge1xcbiAgZmxvYXQ6IGxlZnQ7XFxuICBjb2xvcjogIzc3NztcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC1zdHlsZTogaXRhbGljO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMXJlbTtcXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC50b29scy1za2lsbHMtdGl0bGUge1xcbiAgICBmbG9hdDogbm9uZTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gIH1cXG59XFxuLnRvb2xzLXNraWxscy1wcm9ncmVzcyB7XFxuICBmbG9hdDogcmlnaHQ7XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAudG9vbHMtc2tpbGxzLXByb2dyZXNzIHtcXG4gICAgZmxvYXQ6IG5vbmU7XFxuICAgIG1hcmdpbi1sZWZ0OiAtMC41cmVtO1xcbiAgfVxcbn1cXG4udG9vbHMtc2tpbGxzLXByb2dyZXNzX19pdGVtIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIG1hcmdpbjogMCAwLjVyZW07XFxuICB3aWR0aDogMnJlbTtcXG4gIGhlaWdodDogMnJlbTtcXG4gIGJhY2tncm91bmQ6IGJsYWNrO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbn1cXG4udG9vbHMtc2tpbGxzLXByb2dyZXNzX19pdGVtLmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNTU4ZTZhO1xcbn1cXG4ucG9ydGZvbGlvLWxpc3Qge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4ucG9ydGZvbGlvLWxpc3QtaXRlbSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBtYXJnaW46IDAgMXJlbSAycmVtO1xcbiAgd2lkdGg6IDMwJTtcXG4gIG9wYWNpdHk6IDA7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC5wb3J0Zm9saW8tbGlzdC1pdGVtIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHdpZHRoOiBhdXRvO1xcbiAgfVxcbn1cXG4ucG9ydGZvbGlvLWxpc3QtaXRlbV9faW1nIHtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4ucG9ydGZvbGlvLWxpc3QtaXRlbV9fb3ZlcmxheSB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBib3R0b206IDA7XFxuICBsZWZ0OiAwO1xcbiAgb3BhY2l0eTogMDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDg1LCAxNDIsIDEwNiwgMC44KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBmYWRlSW4gMC4ycyBmb3J3YXJkcztcXG4gICAgICAgICAgYW5pbWF0aW9uOiBmYWRlSW4gMC4ycyBmb3J3YXJkcztcXG59XFxuLnBvcnRmb2xpby1saXN0LWl0ZW1fX292ZXJsYXlfX2NlbnRlciB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogNzAlO1xcbiAgbGVmdDogNTAlO1xcbiAgdG9wOiA1MCU7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG59XFxuLnBvcnRmb2xpby1saXN0LWl0ZW1fX292ZXJsYXlfX25hbWUge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBmb250LXN0eWxlOiBpdGFsaWM7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMXJlbTtcXG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDUwMHB4KTtcXG4gICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgNTAwcHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGJvdHRvbVRvVG9wIDAuMnMgZm9yd2FyZHM7XFxuICAgICAgICAgIGFuaW1hdGlvbjogYm90dG9tVG9Ub3AgMC4ycyBmb3J3YXJkcztcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMnM7XFxufVxcbi5wb3J0Zm9saW8tbGlzdC1pdGVtX19vdmVybGF5X19wb3NpdGlvbiB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBjb2xvcjogd2hpdGU7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBsaW5lLWhlaWdodDogMS4zO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCA1MDBweCk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDUwMHB4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBib3R0b21Ub1RvcCAwLjJzIGZvcndhcmRzO1xcbiAgICAgICAgICBhbmltYXRpb246IGJvdHRvbVRvVG9wIDAuMnMgZm9yd2FyZHM7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC40cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjRzO1xcbn1cXG4ucG9ydGZvbGlvLWxpc3QtaXRlbS52aXNpYmxlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBmYWRlSW4gMC4ycyBmb3J3YXJkcztcXG4gICAgICAgICAgYW5pbWF0aW9uOiBmYWRlSW4gMC4ycyBmb3J3YXJkcztcXG59XFxuLnBvcnRmb2xpby1saXN0LWl0ZW06aG92ZXIge1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcXG4gICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcXG59XFxuLnBvcnRmb2xpby1saXN0LWl0ZW06aG92ZXIgLnBvcnRmb2xpby1saXN0LWl0ZW1fX292ZXJsYXkge1xcbiAgZGlzcGxheTogYmxvY2s7XFxufVxcbi5jb250YWN0LW1hcCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBwYWRkaW5nLXRvcDogNjAlO1xcbn1cXG4uY29udGFjdC1tYXAtaW5zdGFuY2Uge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4uY29udGFjdC1pbmZvIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHBhZGRpbmc6IDRyZW0gMnJlbSAycmVtO1xcbiAgbWFyZ2luLXRvcDogNXJlbTtcXG4gIGJvcmRlcjogMC4xcmVtIHNvbGlkICNlZmVmZWY7XFxufVxcbi5jb250YWN0LWluZm8taWNvbiB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogNnJlbTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHRvcDogMDtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbiAgbGluZS1oZWlnaHQ6IDZyZW07XFxuICBjb2xvcjogd2hpdGU7XFxuICBmb250LXNpemU6IDNyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNTU4ZTZhO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbn1cXG4uY29udGFjdC1pbmZvLWljb24ubGluayB7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG59XFxuLmNvbnRhY3QtaW5mby1pY29uLmxpbms6aG92ZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzMzMzczZDtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTYwJSk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC02MCUpO1xcbn1cXG4uY29udGFjdC1pbmZvLXRleHQge1xcbiAgY29sb3I6ICMzMzM3M2Q7XFxuICBmb250LXNpemU6IDJyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcbmh0bWwsXFxuYm9keSB7XFxuICBtaW4taGVpZ2h0OiAxMDAlO1xcbiAgY29sb3I6ICMzMzM3M2Q7XFxuICBmb250LXNpemU6IDEwcHg7XFxuICBmb250LWZhbWlseTogUm9ib3RvO1xcbn1cXG5ib2R5IHtcXG4gIHBhZGRpbmc6IDVyZW0gMDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNlZmVmZWY7XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICBib2R5IHtcXG4gICAgcGFkZGluZzogMDtcXG4gIH1cXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogNzY4cHgpIGFuZCAobWF4LXdpZHRoOiAxMTk5cHgpIHtcXG4gIGJvZHkge1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgfVxcbn1cXG4ubG9hZGluZyB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbi5jdiB7XFxuICBtYXJnaW46IDAgYXV0bztcXG4gIG1heC13aWR0aDogMTIwcmVtO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgZm9udC1zaXplOiAwO1xcbn1cXG4ubWFpbi1oZWFkZXIsXFxuLnBhZ2Utd3JhcHBlciB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBtaW4taGVpZ2h0OiAxMDAlO1xcbiAgdmVydGljYWwtYWxpZ246IHRvcDtcXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC5tYWluLWhlYWRlcixcXG4gIC5wYWdlLXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogNzY4cHgpIGFuZCAobWF4LXdpZHRoOiAxMTk5cHgpIHtcXG4gIC5tYWluLWhlYWRlcixcXG4gIC5wYWdlLXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG59XFxuLm1haW4taGVhZGVyIHtcXG4gIHdpZHRoOiAzMCU7XFxuICBwYWRkaW5nLXJpZ2h0OiAycmVtO1xcbn1cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLm1haW4taGVhZGVyIHtcXG4gICAgd2lkdGg6IGF1dG87XFxuICAgIHBhZGRpbmctcmlnaHQ6IDA7XFxuICB9XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDc2OHB4KSBhbmQgKG1heC13aWR0aDogMTE5OXB4KSB7XFxuICAubWFpbi1oZWFkZXIge1xcbiAgICB3aWR0aDogYXV0bztcXG4gICAgcGFkZGluZy1yaWdodDogMDtcXG4gIH1cXG59XFxuLm1haW4tbmF2IHtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMzMzM3M2Q7XFxufVxcbi5tYWluLW5hdi1saSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBib3JkZXItYm90dG9tOiAwLjFyZW0gc29saWQgIzI2MjkyZTtcXG4gIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAubWFpbi1uYXYtbGkge1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIHdpZHRoOiAyNSU7XFxuICAgIHZlcnRpY2FsLWFsaWduOiB0b3A7XFxuICAgIGZvbnQtc2l6ZTogMDtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICB9XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDc2OHB4KSBhbmQgKG1heC13aWR0aDogMTE5OXB4KSB7XFxuICAubWFpbi1uYXYtbGkge1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIHdpZHRoOiAyNSU7XFxuICAgIHZlcnRpY2FsLWFsaWduOiB0b3A7XFxuICAgIGJvcmRlci1ib3R0b206IG5vbmU7XFxuICAgIGJvcmRlci1yaWdodDogMC4xcmVtIHNvbGlkICMyNjI5MmU7XFxuICB9XFxuICAubWFpbi1uYXYtbGk6bGFzdC1jaGlsZCB7XFxuICAgIGJvcmRlci1yaWdodDogbm9uZTtcXG4gIH1cXG59XFxuLm1haW4tbmF2LWxpOmxhc3QtY2hpbGQge1xcbiAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXG59XFxuLm1haW4tbmF2LWl0ZW0ge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBwYWRkaW5nOiAycmVtO1xcbiAgY29sb3I6ICM4NTg3OGI7XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAubWFpbi1uYXYtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIH1cXG59XFxuLm1haW4tbmF2LWl0ZW06YmVmb3JlIHtcXG4gIGNvbnRlbnQ6ICcnO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgYm90dG9tOiAwO1xcbiAgei1pbmRleDogMTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM1NThlNmE7XFxuICAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGVYKDApO1xcbiAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlWCgwKTtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjRzIGVhc2U7XFxufVxcbi5tYWluLW5hdi1pdGVtOmhvdmVyLFxcbi5tYWluLW5hdi1pdGVtLmFjdGl2ZSB7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbi5tYWluLW5hdi1pdGVtOmhvdmVyOmJlZm9yZSxcXG4ubWFpbi1uYXYtaXRlbS5hY3RpdmU6YmVmb3JlIHtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZVgoMSk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGVYKDEpO1xcbn1cXG4ubWFpbi1uYXYtaXRlbSA+ICoge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgei1pbmRleDogMjtcXG59XFxuLm1haW4tbmF2LWl0ZW0gaSB7XFxuICBmbG9hdDogbGVmdDtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIG1hcmdpbi10b3A6IC0wLjNyZW07XFxufVxcbkBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAubWFpbi1uYXYtaXRlbSBpIHtcXG4gICAgZm9udC1zaXplOiAycmVtO1xcbiAgfVxcbn1cXG4uYXZhdGFyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuLmF2YXRhci10aXRsZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBwYWRkaW5nOiAwLjVyZW0gMS41cmVtO1xcbiAgY29sb3I6ICNGRkY7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGxldHRlci1zcGFjaW5nOiAwLjJyZW07XFxuICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDI3MGRlZykgdHJhbnNsYXRlWCgtMTAwJSk7XFxuICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDI3MGRlZykgdHJhbnNsYXRlWCgtMTAwJSk7XFxuICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IGxlZnQgdG9wO1xcbiAgICAgICAgICB0cmFuc2Zvcm0tb3JpZ2luOiBsZWZ0IHRvcDtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byBsZWZ0LCAjMzMzNzNEIDAlLCByZ2JhKDUxLCA1NSwgNjEsIDApIDEwMCUpO1xcbn1cXG4uYXZhdGFyIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuLnNvY2lhbC1saW5rcyB7XFxuICBwYWRkaW5nOiAycmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICBjb2xvcjogIzMzMzczZDtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLnNvY2lhbC1saW5rcy1saSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBtYXJnaW46IDAgMC4xcmVtO1xcbiAgd2lkdGg6IDRyZW07XFxuICBsaW5lLWhlaWdodDogMy41cmVtO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgYm9yZGVyOiAwLjJyZW0gc29saWQgIzMzMzczZDtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjRzO1xcbn1cXG4uc29jaWFsLWxpbmtzLWxpOmhvdmVyIHtcXG4gIGNvbG9yOiAjNTU4ZTZhO1xcbiAgYm9yZGVyLWNvbG9yOiAjNTU4ZTZhO1xcbn1cXG4ucGFnZS13cmFwcGVyIHtcXG4gIHdpZHRoOiA3MCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC5wYWdlLXdyYXBwZXIge1xcbiAgICB3aWR0aDogYXV0bztcXG4gIH1cXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogNzY4cHgpIGFuZCAobWF4LXdpZHRoOiAxMTk5cHgpIHtcXG4gIC5wYWdlLXdyYXBwZXIge1xcbiAgICB3aWR0aDogYXV0bztcXG4gIH1cXG59XFxuLnBhZ2Uge1xcbiAgb3BhY2l0eTogMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBmYWRlSW4gMXMgZm9yd2FyZHM7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZmFkZUluIDFzIGZvcndhcmRzO1xcbn1cXG4ucGFnZS1mb290ZXIge1xcbiAgcGFkZGluZzogNXJlbSAwO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICNlZmVmZWY7XFxufVxcbi5wYWdlLWZvb3RlciAuZG93bmxvYWQtY3Yge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcGFkZGluZzogMXJlbSAwO1xcbiAgbWFyZ2luOiAwIDJyZW07XFxuICB3aWR0aDogMjVyZW07XFxuICBmb250LXNpemU6IDJyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgYm9yZGVyOiAwLjNyZW0gc29saWQ7XFxufVxcbi5wYWdlLWZvb3RlciAuZG93bmxvYWQtY3YgaSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBtYXJnaW4tcmlnaHQ6IDAuNXJlbTtcXG59XFxuLnBhZ2UtZm9vdGVyIC5kb3dubG9hZC1jdiB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBib3JkZXItd2lkdGg6IDA7XFxuICBib3JkZXItYm90dG9tLXdpZHRoOiAwLjNyZW07XFxufVxcbi5wYWdlLWZvb3RlciAuZG93bmxvYWQtY3Y6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6ICcnO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDA7XFxuICBsZWZ0OiAwO1xcbiAgYm90dG9tOiAtMC4zcmVtO1xcbiAgYm9yZGVyLWxlZnQ6IDAuM3JlbSBzb2xpZDtcXG4gIGJvcmRlci10b3A6IDAuM3JlbSBzb2xpZDtcXG59XFxuLnBhZ2UtZm9vdGVyIC5kb3dubG9hZC1jdjphZnRlciB7XFxuICBjb250ZW50OiAnJztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBib3R0b206IC0wLjNyZW07XFxuICBib3JkZXItcmlnaHQ6IDAuM3JlbSBzb2xpZDtcXG4gIGJvcmRlci10b3A6IDAuM3JlbSBzb2xpZDtcXG59XFxuLnBhZ2UtZm9vdGVyIC5kb3dubG9hZC1jdjpob3ZlcjpiZWZvcmUsXFxuLnBhZ2UtZm9vdGVyIC5kb3dubG9hZC1jdjpob3ZlcjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogYnV0dG9uLXNtYXJ0LWJvcmRlciAwLjRzIGZvcndhcmRzO1xcbiAgICAgICAgICBhbmltYXRpb246IGJ1dHRvbi1zbWFydC1ib3JkZXIgMC40cyBmb3J3YXJkcztcXG59XFxuLnNlY3Rpb24ge1xcbiAgcGFkZGluZzogMCAzcmVtO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG59XFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC5zZWN0aW9uIHtcXG4gICAgcGFkZGluZzogMCAycmVtO1xcbiAgfVxcbn1cXG4uc2VjdGlvbi10aXRsZSB7XFxuICBwYWRkaW5nOiAycmVtIDNyZW0gMXJlbTtcXG4gIG1hcmdpbjogMCAwIDNyZW0gLTNyZW07XFxuICBjb2xvcjogIzMzMzczZDtcXG4gIGZvbnQtc2l6ZTogMS43cmVtO1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgYm9yZGVyLWJvdHRvbTogMC4xcmVtIHNvbGlkICNlZmVmZWY7XFxufVxcblwiLCBcIlwiXSk7XG5cbi8vIGV4cG9ydHNcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4uL25vZGVfbW9kdWxlcy9hdXRvcHJlZml4ZXItbG9hZGVyIS4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlciEuL2xlc3MvY29tbW9uLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXHJcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXHJcbiovXHJcbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIGxpc3QgPSBbXTtcclxuXHJcblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xyXG5cdGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcclxuXHRcdHZhciByZXN1bHQgPSBbXTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBpdGVtID0gdGhpc1tpXTtcclxuXHRcdFx0aWYoaXRlbVsyXSkge1xyXG5cdFx0XHRcdHJlc3VsdC5wdXNoKFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgaXRlbVsxXSArIFwifVwiKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXN1bHQucHVzaChpdGVtWzFdKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdC5qb2luKFwiXCIpO1xyXG5cdH07XHJcblxyXG5cdC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XHJcblx0bGlzdC5pID0gZnVuY3Rpb24obW9kdWxlcywgbWVkaWFRdWVyeSkge1xyXG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXHJcblx0XHRcdG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIFwiXCJdXTtcclxuXHRcdHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgaWQgPSB0aGlzW2ldWzBdO1xyXG5cdFx0XHRpZih0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpXHJcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0Zm9yKGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XHJcblx0XHRcdC8vIHNraXAgYWxyZWFkeSBpbXBvcnRlZCBtb2R1bGVcclxuXHRcdFx0Ly8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgMTAwJSBwZXJmZWN0IGZvciB3ZWlyZCBtZWRpYSBxdWVyeSBjb21iaW5hdGlvbnNcclxuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cclxuXHRcdFx0Ly8gIEkgaG9wZSB0aGlzIHdpbGwgbmV2ZXIgb2NjdXIgKEhleSB0aGlzIHdheSB3ZSBoYXZlIHNtYWxsZXIgYnVuZGxlcylcclxuXHRcdFx0aWYodHlwZW9mIGl0ZW1bMF0gIT09IFwibnVtYmVyXCIgfHwgIWFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcclxuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XHJcblx0XHRcdFx0XHRpdGVtWzJdID0gbWVkaWFRdWVyeTtcclxuXHRcdFx0XHR9IGVsc2UgaWYobWVkaWFRdWVyeSkge1xyXG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRsaXN0LnB1c2goaXRlbSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cdHJldHVybiBsaXN0O1xyXG59O1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImZvbnRzL1JvYm90by8vUm9ib3RvLVRoaW4udHRmPzNmNjg1MDBiMjY3YzIwMDUxMDg4YmNjMDY5OGFmNzczXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9Sb2JvdG8vUm9ib3RvLVRoaW4udHRmXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJmb250cy9Sb2JvdG8vL1JvYm90by1UaGluSXRhbGljLnR0Zj8xZTU3MzdiZTVjNjhjMTVjM2ExMDViMmRiOWEzYjY3Y1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZm9udHMvUm9ib3RvL1JvYm90by1UaGluSXRhbGljLnR0ZlxuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvUm9ib3RvLy9Sb2JvdG8tTGlnaHQudHRmPzdiNWZiODhmMTJiZWM4MTQzZjAwZTIxYmMzMjIyMTI0XCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9Sb2JvdG8vUm9ib3RvLUxpZ2h0LnR0ZlxuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvUm9ib3RvLy9Sb2JvdG8tTGlnaHRJdGFsaWMudHRmPzEyOWM1MDU3ZjQ0ODBmOWEzNTNlMTVlMWUxZTA5ZjlkXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9Sb2JvdG8vUm9ib3RvLUxpZ2h0SXRhbGljLnR0ZlxuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvUm9ib3RvLy9Sb2JvdG8tUmVndWxhci50dGY/YWMzZjc5OWQ1YmJhZjUxOTZmYWIxNWFiOGRlODQzMWNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ZvbnRzL1JvYm90by9Sb2JvdG8tUmVndWxhci50dGZcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImZvbnRzL1JvYm90by8vUm9ib3RvLUl0YWxpYy50dGY/ZGU3NGM2MDk5MWNkNjNjOGI5MjJlMGU2NjVhMzljN2FcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ZvbnRzL1JvYm90by9Sb2JvdG8tSXRhbGljLnR0ZlxuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvUm9ib3RvLy9Sb2JvdG8tTWVkaXVtLnR0Zj9mZTEzZTQxNzA3MTljMmZjNTg2NTAxZTc3N2JkZTE0M1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZm9udHMvUm9ib3RvL1JvYm90by1NZWRpdW0udHRmXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJmb250cy9Sb2JvdG8vL1JvYm90by1NZWRpdW1JdGFsaWMudHRmPzViMjVhZmE4NzFlMWI4OTYwMTE4NTlmOGNkZjhkYTc0XCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9Sb2JvdG8vUm9ib3RvLU1lZGl1bUl0YWxpYy50dGZcbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImZvbnRzL1JvYm90by8vUm9ib3RvLUJvbGQudHRmP2QzMjljYzhiMzQ2NjdmMTE0YTk1NDIyYWFhZDFiMDYzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9Sb2JvdG8vUm9ib3RvLUJvbGQudHRmXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJmb250cy9Sb2JvdG8vL1JvYm90by1Cb2xkSXRhbGljLnR0Zj9iMzdkMGJiNzNhMmY2ODhlY2FlZTAxNjQ3ZjQxZTNlNVwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZm9udHMvUm9ib3RvL1JvYm90by1Cb2xkSXRhbGljLnR0ZlxuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvUm9ib3RvLy9Sb2JvdG8tQmxhY2sudHRmPzg5M2ZlMTQ2MjhiZDdhYzQ5OGQ1NTBlOTYzNjdlMWJlXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9Sb2JvdG8vUm9ib3RvLUJsYWNrLnR0ZlxuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvUm9ib3RvLy9Sb2JvdG8tQmxhY2tJdGFsaWMudHRmPzI1NmFhYjY1NGQzYzRkZDBlMTJmZDBhMzJjN2U4YWE2XCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9Sb2JvdG8vUm9ib3RvLUJsYWNrSXRhbGljLnR0ZlxuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvZm9udC1hd2Vzb21lLy9mb250YXdlc29tZS13ZWJmb250LndvZmYyP2RiODEyZDhhNzBhNGU4OGU4ODg3NDRjMWM5YTI3ZTg5XCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9mb250cy9mb250LWF3ZXNvbWUvZm9udGF3ZXNvbWUtd2ViZm9udC53b2ZmMlxuLy8gbW9kdWxlIGlkID0gMjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvZm9udC1hd2Vzb21lLy9mb250YXdlc29tZS13ZWJmb250LndvZmY/YTM1NzIwYzJmZWQyYzdmMDQzYmM3ZTRmZmI0NWUwNzNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ZvbnRzL2ZvbnQtYXdlc29tZS9mb250YXdlc29tZS13ZWJmb250LndvZmZcbi8vIG1vZHVsZSBpZCA9IDI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImZvbnRzL2ZvbnQtYXdlc29tZS8vZm9udGF3ZXNvbWUtd2ViZm9udC50dGY/YTNkZTIxNzBlNGU5ZGY3NzE2MWVhNWQzZjMxYjI2NjhcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ZvbnRzL2ZvbnQtYXdlc29tZS9mb250YXdlc29tZS13ZWJmb250LnR0ZlxuLy8gbW9kdWxlIGlkID0gMjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZm9udHMvZm9udC1hd2Vzb21lLy9mb250YXdlc29tZS13ZWJmb250LnN2Zz82NWU4ZjdkZDZhNjVhYTU4MTJhZmE5MDUwYmZjNzIwZVwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZm9udHMvZm9udC1hd2Vzb21lL2ZvbnRhd2Vzb21lLXdlYmZvbnQuc3ZnXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xudmFyIHN0eWxlc0luRG9tID0ge30sXG5cdG1lbW9pemUgPSBmdW5jdGlvbihmbikge1xuXHRcdHZhciBtZW1vO1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0cmV0dXJuIG1lbW87XG5cdFx0fTtcblx0fSxcblx0aXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIC9tc2llIFs2LTldXFxiLy50ZXN0KHNlbGYubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKTtcblx0fSksXG5cdGdldEhlYWRFbGVtZW50ID0gbWVtb2l6ZShmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xuXHR9KSxcblx0c2luZ2xldG9uRWxlbWVudCA9IG51bGwsXG5cdHNpbmdsZXRvbkNvdW50ZXIgPSAwLFxuXHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcCA9IFtdO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcblx0aWYodHlwZW9mIERFQlVHICE9PSBcInVuZGVmaW5lZFwiICYmIERFQlVHKSB7XG5cdFx0aWYodHlwZW9mIGRvY3VtZW50ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3R5bGUtbG9hZGVyIGNhbm5vdCBiZSB1c2VkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIik7XG5cdH1cblxuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIDxoZWFkPi5cblx0aWYgKHR5cGVvZiBvcHRpb25zLmluc2VydEF0ID09PSBcInVuZGVmaW5lZFwiKSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QpO1xuXHRhZGRTdHlsZXNUb0RvbShzdHlsZXMsIG9wdGlvbnMpO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXHRcdFx0ZG9tU3R5bGUucmVmcy0tO1xuXHRcdFx0bWF5UmVtb3ZlLnB1c2goZG9tU3R5bGUpO1xuXHRcdH1cblx0XHRpZihuZXdMaXN0KSB7XG5cdFx0XHR2YXIgbmV3U3R5bGVzID0gbGlzdFRvU3R5bGVzKG5ld0xpc3QpO1xuXHRcdFx0YWRkU3R5bGVzVG9Eb20obmV3U3R5bGVzLCBvcHRpb25zKTtcblx0XHR9XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IG1heVJlbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvbVN0eWxlID0gbWF5UmVtb3ZlW2ldO1xuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgZG9tU3R5bGUucGFydHMubGVuZ3RoOyBqKyspXG5cdFx0XHRcdFx0ZG9tU3R5bGUucGFydHNbal0oKTtcblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGl0ZW0gPSBzdHlsZXNbaV07XG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0c1tqXShpdGVtLnBhcnRzW2pdKTtcblx0XHRcdH1cblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGFydHMgPSBbXTtcblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXHRcdFx0c3R5bGVzSW5Eb21baXRlbS5pZF0gPSB7aWQ6IGl0ZW0uaWQsIHJlZnM6IDEsIHBhcnRzOiBwYXJ0c307XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGxpc3RUb1N0eWxlcyhsaXN0KSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXHRmb3IodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBpdGVtWzBdO1xuXHRcdHZhciBjc3MgPSBpdGVtWzFdO1xuXHRcdHZhciBtZWRpYSA9IGl0ZW1bMl07XG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XG5cdFx0dmFyIHBhcnQgPSB7Y3NzOiBjc3MsIG1lZGlhOiBtZWRpYSwgc291cmNlTWFwOiBzb3VyY2VNYXB9O1xuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKVxuXHRcdFx0c3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcblx0XHRlbHNlXG5cdFx0XHRuZXdTdHlsZXNbaWRdLnBhcnRzLnB1c2gocGFydCk7XG5cdH1cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlRWxlbWVudCkge1xuXHR2YXIgaGVhZCA9IGdldEhlYWRFbGVtZW50KCk7XG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wW3N0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmKCFsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCkge1xuXHRcdFx0aGVhZC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBoZWFkLmZpcnN0Q2hpbGQpO1xuXHRcdH0gZWxzZSBpZihsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZykge1xuXHRcdFx0aGVhZC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0XHR9XG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AucHVzaChzdHlsZUVsZW1lbnQpO1xuXHR9IGVsc2UgaWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwiYm90dG9tXCIpIHtcblx0XHRoZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyICdpbnNlcnRBdCcuIE11c3QgYmUgJ3RvcCcgb3IgJ2JvdHRvbScuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcblx0c3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcblx0dmFyIGlkeCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmluZGV4T2Yoc3R5bGVFbGVtZW50KTtcblx0aWYoaWR4ID49IDApIHtcblx0XHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuXHR2YXIgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXHRzdHlsZUVsZW1lbnQudHlwZSA9IFwidGV4dC9jc3NcIjtcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIHN0eWxlRWxlbWVudCk7XG5cdHJldHVybiBzdHlsZUVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpIHtcblx0dmFyIGxpbmtFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG5cdGxpbmtFbGVtZW50LnJlbCA9IFwic3R5bGVzaGVldFwiO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgbGlua0VsZW1lbnQpO1xuXHRyZXR1cm4gbGlua0VsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuXHR2YXIgc3R5bGVFbGVtZW50LCB1cGRhdGUsIHJlbW92ZTtcblxuXHRpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcblx0XHR2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcblx0XHRzdHlsZUVsZW1lbnQgPSBzaW5nbGV0b25FbGVtZW50IHx8IChzaW5nbGV0b25FbGVtZW50ID0gY3JlYXRlU3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCBmYWxzZSk7XG5cdFx0cmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCwgc3R5bGVJbmRleCwgdHJ1ZSk7XG5cdH0gZWxzZSBpZihvYmouc291cmNlTWFwICYmXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIFVSTC5jcmVhdGVPYmplY3RVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZUxpbmtFbGVtZW50KG9wdGlvbnMpO1xuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG5cdFx0XHRpZihzdHlsZUVsZW1lbnQuaHJlZilcblx0XHRcdFx0VVJMLnJldm9rZU9iamVjdFVSTChzdHlsZUVsZW1lbnQuaHJlZik7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRzdHlsZUVsZW1lbnQgPSBjcmVhdGVTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG5cdFx0dXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlRWxlbWVudCk7XG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcblx0XHR9O1xuXHR9XG5cblx0dXBkYXRlKG9iaik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKG5ld09iaikge1xuXHRcdGlmKG5ld09iaikge1xuXHRcdFx0aWYobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR1cGRhdGUob2JqID0gbmV3T2JqKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVtb3ZlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG52YXIgcmVwbGFjZVRleHQgPSAoZnVuY3Rpb24gKCkge1xuXHR2YXIgdGV4dFN0b3JlID0gW107XG5cblx0cmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcblx0XHR0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG5cdFx0cmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG5cdH07XG59KSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlRWxlbWVudCwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG5cdHZhciBjc3MgPSByZW1vdmUgPyBcIlwiIDogb2JqLmNzcztcblxuXHRpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuXHRcdHZhciBjaGlsZE5vZGVzID0gc3R5bGVFbGVtZW50LmNoaWxkTm9kZXM7XG5cdFx0aWYgKGNoaWxkTm9kZXNbaW5kZXhdKSBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuXHRcdFx0c3R5bGVFbGVtZW50Lmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChjc3NOb2RlKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyhzdHlsZUVsZW1lbnQsIG9iaikge1xuXHR2YXIgY3NzID0gb2JqLmNzcztcblx0dmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuXG5cdGlmKG1lZGlhKSB7XG5cdFx0c3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsIG1lZGlhKVxuXHR9XG5cblx0aWYoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuXHR9IGVsc2Uge1xuXHRcdHdoaWxlKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG5cdFx0XHRzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuXHRcdH1cblx0XHRzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTGluayhsaW5rRWxlbWVudCwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuXHRpZihzb3VyY2VNYXApIHtcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxuXHRcdGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIgKyBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpICsgXCIgKi9cIjtcblx0fVxuXG5cdHZhciBibG9iID0gbmV3IEJsb2IoW2Nzc10sIHsgdHlwZTogXCJ0ZXh0L2Nzc1wiIH0pO1xuXG5cdHZhciBvbGRTcmMgPSBsaW5rRWxlbWVudC5ocmVmO1xuXG5cdGxpbmtFbGVtZW50LmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYylcblx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKG9sZFNyYyk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2FkZFN0eWxlcy5qc1xuLy8gbW9kdWxlIGlkID0gMjhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24obmFtZSwgdmFsdWVzKSB7XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgc2VsZi5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgc2VsZi5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIC8vIEluc3RlYWQgb2YgaXRlcmFibGUgZm9yIG5vdy5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgY2FsbGJhY2sobmFtZSwgc2VsZi5tYXBbbmFtZV0pXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIGZldGNoLlByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgZmV0Y2guUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBmZXRjaC5Qcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmZXRjaC5Qcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZldGNoLlByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBmZXRjaC5Qcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdCh1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHRoaXMudXJsID0gdXJsXG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgb3B0aW9ucy5ib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KG9wdGlvbnMuYm9keSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICB2YXIgbm9YaHJQYXRjaCA9XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgISF3aW5kb3cuQWN0aXZlWE9iamVjdCAmJlxuICAgICAgISh3aW5kb3cuWE1MSHR0cFJlcXVlc3QgJiYgKG5ldyBYTUxIdHRwUmVxdWVzdCkuZGlzcGF0Y2hFdmVudCk7XG5cbiAgZnVuY3Rpb24gZ2V0WGhyKCkge1xuICAgIC8vIGZyb20gYmFja2JvbmUuanMgMS4xLjJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL2JhY2tib25lL2Jsb2IvMS4xLjIvYmFja2JvbmUuanMjTDExODFcbiAgICBpZiAobm9YaHJQYXRjaCAmJiAhKC9eKGdldHxwb3N0fGhlYWR8cHV0fGRlbGV0ZXxvcHRpb25zKSQvaS50ZXN0KHRoaXMubWV0aG9kKSkpIHtcbiAgICAgIHRoaXMudXNpbmdBY3RpdmVYaHIgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTEhUVFBcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy51cmwgPSBudWxsXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVycztcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIC8vIFRPRE86IFJlcXVlc3QgY29uc3RydWN0b3Igc2hvdWxkIGFjY2VwdCBpbnB1dCwgaW5pdFxuICAgIHZhciByZXF1ZXN0XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICByZXF1ZXN0ID0gaW5wdXRcbiAgICB9IGVsc2Uge1xuICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgZmV0Y2guUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciB4aHIgPSBnZXRYaHIoKTtcbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnY29ycycpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlVVJMKCkge1xuICAgICAgICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIpIHtcbiAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBzZWN1cml0eSB3YXJuaW5ncyBvbiBnZXRSZXNwb25zZUhlYWRlciB3aGVuIG5vdCBhbGxvd2VkIGJ5IENPUlNcbiAgICAgICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgICAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25sb2FkKCkge1xuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RhdHVzID0gKHhoci5zdGF0dXMgPT09IDEyMjMpID8gMjA0IDogeGhyLnN0YXR1c1xuICAgICAgICBpZiAoc3RhdHVzIDwgMTAwIHx8IHN0YXR1cyA+IDU5OSkge1xuICAgICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBvbmxvYWQ7XG4gICAgICBpZiAoIXNlbGYudXNpbmdBY3RpdmVYaHIpIHtcbiAgICAgICAgeGhyLm9ubG9hZCA9IG9ubG9hZDtcbiAgICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBmZXRjaC5Qcm9taXNlID0gc2VsZi5Qcm9taXNlOyAvLyB5b3UgY291bGQgY2hhbmdlIGl0IHRvIHlvdXIgZmF2b3JpdGUgYWx0ZXJuYXRpdmVcbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKCk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuLi9ub2RlX21vZHVsZXMvZmV0Y2gtcG9seWZpbGwvZmV0Y2guanNcbi8vIG1vZHVsZSBpZCA9IDI5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBtYXAgPSB7XG5cdFwiLi9hdmExLmpwZ1wiOiAzMSxcblx0XCIuL2Zhdmljb24uaWNvXCI6IDMyLFxuXHRcIi4vcG9ydGZvbGlvL2ZyZWVsYW5jZS5qcGdcIjogMzMsXG5cdFwiLi9wb3J0Zm9saW8vZ2Jhcy5qcGdcIjogMzQsXG5cdFwiLi9wb3J0Zm9saW8vZ2Nhcy5qcGdcIjogMzUsXG5cdFwiLi9wb3J0Zm9saW8vZ29mYXN0LmpwZ1wiOiAzNixcblx0XCIuL3BvcnRmb2xpby9nb3QuanBnXCI6IDM3LFxuXHRcIi4vcG9ydGZvbGlvL2hpcW8uanBnXCI6IDM4LFxuXHRcIi4vcG9ydGZvbGlvL2xvb2suanBnXCI6IDM5LFxuXHRcIi4vcG9ydGZvbGlvL25vZGUuanBnXCI6IDQwLFxuXHRcIi4vcG9ydGZvbGlvL3Nwb3J0Y29tLmpwZ1wiOiA0MSxcblx0XCIuL3RoZS1yb2NrLmpwZ1wiOiA0MlxufTtcbmZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0KHJlcSkge1xuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyh3ZWJwYWNrQ29udGV4dFJlc29sdmUocmVxKSk7XG59O1xuZnVuY3Rpb24gd2VicGFja0NvbnRleHRSZXNvbHZlKHJlcSkge1xuXHR2YXIgaWQgPSBtYXBbcmVxXTtcblx0aWYoIShpZCArIDEpKSAvLyBjaGVjayBmb3IgbnVtYmVyIG9yIHN0cmluZ1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyByZXEgKyBcIicuXCIpO1xuXHRyZXR1cm4gaWQ7XG59O1xud2VicGFja0NvbnRleHQua2V5cyA9IGZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0S2V5cygpIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hcCk7XG59O1xud2VicGFja0NvbnRleHQucmVzb2x2ZSA9IHdlYnBhY2tDb250ZXh0UmVzb2x2ZTtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0NvbnRleHQ7XG53ZWJwYWNrQ29udGV4dC5pZCA9IDMwO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vaW1nIFxcLihpY298cG5nfGpwZykkL1xuLy8gbW9kdWxlIGlkID0gMzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiaW1nLy9hdmExLmpwZz84ZWFhYjJhNjA5NjFkYmJhMDhkZjJmMjM2M2VlOWM0MlwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vaW1nL2F2YTEuanBnXG4vLyBtb2R1bGUgaWQgPSAzMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJpbWcvL2Zhdmljb24uaWNvP2RjNTlkMGE4ZWQ3ZDU2MDY4Y2I2YTNhZGVmZjRkMGExXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9pbWcvZmF2aWNvbi5pY29cbi8vIG1vZHVsZSBpZCA9IDMyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltZy9wb3J0Zm9saW8vL2ZyZWVsYW5jZS5qcGc/YmI0NGZmZWFiNWZjMGM5NTMwZjY5NTJmZTdhZmJkNmFcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ltZy9wb3J0Zm9saW8vZnJlZWxhbmNlLmpwZ1xuLy8gbW9kdWxlIGlkID0gMzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiaW1nL3BvcnRmb2xpby8vZ2Jhcy5qcGc/ZmFhODVhNDRiOWNmZDI2N2IyOWYyN2YyZGE4M2FiN2VcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ltZy9wb3J0Zm9saW8vZ2Jhcy5qcGdcbi8vIG1vZHVsZSBpZCA9IDM0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltZy9wb3J0Zm9saW8vL2djYXMuanBnPzg5NWZiMDU2ZTA1N2ViNTljN2I3ODNmMjcwNTUxZWI4XCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9pbWcvcG9ydGZvbGlvL2djYXMuanBnXG4vLyBtb2R1bGUgaWQgPSAzNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJpbWcvcG9ydGZvbGlvLy9nb2Zhc3QuanBnPzNkMmNiYzM4YjJkMDc2Zjc3NWMyNGNiMTA5OTI2NjcyXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9pbWcvcG9ydGZvbGlvL2dvZmFzdC5qcGdcbi8vIG1vZHVsZSBpZCA9IDM2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltZy9wb3J0Zm9saW8vL2dvdC5qcGc/OGIyOGEzZDE0MzRiMmI3Njc1YjZhNzU1YTEyYjhlNjZcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ltZy9wb3J0Zm9saW8vZ290LmpwZ1xuLy8gbW9kdWxlIGlkID0gMzdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiaW1nL3BvcnRmb2xpby8vaGlxby5qcGc/NjhjM2MxMGYyZDZkYTAyYzljNTM5OTI3NmIyOTA0ODFcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ltZy9wb3J0Zm9saW8vaGlxby5qcGdcbi8vIG1vZHVsZSBpZCA9IDM4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImltZy9wb3J0Zm9saW8vL2xvb2suanBnPzFmNWNjZTc3OWYyZmM1Yjc5YWRiMGRjOGE4ZThiZGU5XCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9pbWcvcG9ydGZvbGlvL2xvb2suanBnXG4vLyBtb2R1bGUgaWQgPSAzOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJpbWcvcG9ydGZvbGlvLy9ub2RlLmpwZz8yYjBlYTNlOTgwYWQ3NzNiMGVmODAyZWMwMjRlZDQzYlwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vaW1nL3BvcnRmb2xpby9ub2RlLmpwZ1xuLy8gbW9kdWxlIGlkID0gNDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiaW1nL3BvcnRmb2xpby8vc3BvcnRjb20uanBnPzJmOTFiMGY1NWU5NTA2MjkzYzE5YTA4OTljZGZhYzIzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9pbWcvcG9ydGZvbGlvL3Nwb3J0Y29tLmpwZ1xuLy8gbW9kdWxlIGlkID0gNDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiaW1nLy90aGUtcm9jay5qcGc/MGUxYjdhZTE1Y2E5MDhlYTViODExMWQyY2M2ZjMxNDZcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2ltZy90aGUtcm9jay5qcGdcbi8vIG1vZHVsZSBpZCA9IDQyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XHJcblx0aWYoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcclxuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xyXG5cdFx0bW9kdWxlLnBhdGhzID0gW107XHJcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcclxuXHRcdGlmKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJsb2FkZWRcIiwge1xyXG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxyXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiBtb2R1bGUubDtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImlkXCIsIHtcclxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XHJcblx0fVxyXG5cdHJldHVybiBtb2R1bGU7XHJcbn07XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL25vZGVfbW9kdWxlcy93ZWJwYWNrL2J1aWxkaW4vbW9kdWxlLmpzXG4vLyBtb2R1bGUgaWQgPSA0M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgQmFzZVZpZXcgPSByZXF1aXJlKCdiYXNlL2Jhc2UtdmlldycpO1xyXG52YXIgbXZjID0gcmVxdWlyZSgnbGliL212YycpO1xyXG5cclxuLyoqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxudmFyIE1haW5IZWFkZXIgPSBCYXNlVmlldy5leHRlbmQoe1xyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6ICdsYXlvdXQvbWFpbi1oZWFkZXInLFxyXG4gICAgdXJsOiAnZGF0YS9hYm91dC5qc29uJyxcclxuXHJcbiAgICBldmVudHM6IHtcclxuICAgICAgICAnY2xpY2sgLmZuLW5hdi1pdGVtJzogJ25hdmlnYXRlJ1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJBZnRlckZldGNoKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTml2aWdhdGUgYnkgYmFja2JvbmUgaGlzdG9yeVxyXG4gICAgICogQHBhcmFtIGV2ZW50IHtFdmVudH1cclxuICAgICAqL1xyXG4gICAgbmF2aWdhdGU6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIG12Yy5oaXN0b3J5Lm5hdmlnYXRlKGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJyksIHRydWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBuYXYgYWN0aXZlIGNsYXNzIGJ5IHBhdGggaWYgbmVlZFxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqL1xyXG4gICAgdXBkYXRlTmF2OiBmdW5jdGlvbiAocGF0aCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldE5hdkFjdGl2ZUNsYXNzKHBhdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG9PbmNlKHRoaXMsICdyZW5kZXJlZCcsIHRoaXMuc2V0TmF2QWN0aXZlQ2xhc3MuYmluZCh0aGlzLCBwYXRoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBuYXYgYWN0aXZlIGNsYXNzXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICovXHJcbiAgICBzZXROYXZBY3RpdmVDbGFzczogZnVuY3Rpb24gKHBhdGgpIHtcclxuICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy4kKCcuZm4tbmF2LWl0ZW0nKS5maWx0ZXIoZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKS5zdWJzdHIoMSkgPT09IHBhdGg7XHJcbiAgICAgICAgfSlbMF07XHJcblxyXG4gICAgICAgIHRoaXMuJCgnLmZuLW5hdi1pdGVtJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYWluSGVhZGVyO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvbGF5b3V0L21haW4taGVhZGVyLmpzXG4vLyBtb2R1bGUgaWQgPSA0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAgICAgQmFja2JvbmUuanMgMS4zLjNcblxuLy8gICAgIChjKSAyMDEwLTIwMTYgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBCYWNrYm9uZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbi8vICAgICBGb3IgYWxsIGRldGFpbHMgYW5kIGRvY3VtZW50YXRpb246XG4vLyAgICAgaHR0cDovL2JhY2tib25lanMub3JnXG5cbihmdW5jdGlvbihmYWN0b3J5KSB7XG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIG9yIGBnbG9iYWxgIG9uIHRoZSBzZXJ2ZXIuXG4gIC8vIFdlIHVzZSBgc2VsZmAgaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgdmFyIHJvb3QgPSAodHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZi5zZWxmID09PSBzZWxmICYmIHNlbGYpIHx8XG4gICAgICAgICAgICAodHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsKTtcblxuICAvLyBTZXQgdXAgQmFja2JvbmUgYXBwcm9wcmlhdGVseSBmb3IgdGhlIGVudmlyb25tZW50LiBTdGFydCB3aXRoIEFNRC5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ3VuZGVyc2NvcmUnLCAnanF1ZXJ5JywgJ2V4cG9ydHMnXSwgZnVuY3Rpb24oXywgJCwgZXhwb3J0cykge1xuICAgICAgLy8gRXhwb3J0IGdsb2JhbCBldmVuIGluIEFNRCBjYXNlIGluIGNhc2UgdGhpcyBzY3JpcHQgaXMgbG9hZGVkIHdpdGhcbiAgICAgIC8vIG90aGVycyB0aGF0IG1heSBzdGlsbCBleHBlY3QgYSBnbG9iYWwgQmFja2JvbmUuXG4gICAgICByb290LkJhY2tib25lID0gZmFjdG9yeShyb290LCBleHBvcnRzLCBfLCAkKTtcbiAgICB9KTtcblxuICAvLyBOZXh0IGZvciBOb2RlLmpzIG9yIENvbW1vbkpTLiBqUXVlcnkgbWF5IG5vdCBiZSBuZWVkZWQgYXMgYSBtb2R1bGUuXG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyksICQ7XG4gICAgdHJ5IHsgJCA9IHJlcXVpcmUoJ2pxdWVyeScpOyB9IGNhdGNoIChlKSB7fVxuICAgIGZhY3Rvcnkocm9vdCwgZXhwb3J0cywgXywgJCk7XG5cbiAgLy8gRmluYWxseSwgYXMgYSBicm93c2VyIGdsb2JhbC5cbiAgfSBlbHNlIHtcbiAgICByb290LkJhY2tib25lID0gZmFjdG9yeShyb290LCB7fSwgcm9vdC5fLCAocm9vdC5qUXVlcnkgfHwgcm9vdC5aZXB0byB8fCByb290LmVuZGVyIHx8IHJvb3QuJCkpO1xuICB9XG5cbn0pKGZ1bmN0aW9uKHJvb3QsIEJhY2tib25lLCBfLCAkKSB7XG5cbiAgLy8gSW5pdGlhbCBTZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tXG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBCYWNrYm9uZWAgdmFyaWFibGUsIHNvIHRoYXQgaXQgY2FuIGJlXG4gIC8vIHJlc3RvcmVkIGxhdGVyIG9uLCBpZiBgbm9Db25mbGljdGAgaXMgdXNlZC5cbiAgdmFyIHByZXZpb3VzQmFja2JvbmUgPSByb290LkJhY2tib25lO1xuXG4gIC8vIENyZWF0ZSBhIGxvY2FsIHJlZmVyZW5jZSB0byBhIGNvbW1vbiBhcnJheSBtZXRob2Qgd2UnbGwgd2FudCB0byB1c2UgbGF0ZXIuXG4gIHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuICAvLyBDdXJyZW50IHZlcnNpb24gb2YgdGhlIGxpYnJhcnkuIEtlZXAgaW4gc3luYyB3aXRoIGBwYWNrYWdlLmpzb25gLlxuICBCYWNrYm9uZS5WRVJTSU9OID0gJzEuMy4zJztcblxuICAvLyBGb3IgQmFja2JvbmUncyBwdXJwb3NlcywgalF1ZXJ5LCBaZXB0bywgRW5kZXIsIG9yIE15IExpYnJhcnkgKGtpZGRpbmcpIG93bnNcbiAgLy8gdGhlIGAkYCB2YXJpYWJsZS5cbiAgQmFja2JvbmUuJCA9ICQ7XG5cbiAgLy8gUnVucyBCYWNrYm9uZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgQmFja2JvbmVgIHZhcmlhYmxlXG4gIC8vIHRvIGl0cyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGlzIEJhY2tib25lIG9iamVjdC5cbiAgQmFja2JvbmUubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuQmFja2JvbmUgPSBwcmV2aW91c0JhY2tib25lO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFR1cm4gb24gYGVtdWxhdGVIVFRQYCB0byBzdXBwb3J0IGxlZ2FjeSBIVFRQIHNlcnZlcnMuIFNldHRpbmcgdGhpcyBvcHRpb25cbiAgLy8gd2lsbCBmYWtlIGBcIlBBVENIXCJgLCBgXCJQVVRcImAgYW5kIGBcIkRFTEVURVwiYCByZXF1ZXN0cyB2aWEgdGhlIGBfbWV0aG9kYCBwYXJhbWV0ZXIgYW5kXG4gIC8vIHNldCBhIGBYLUh0dHAtTWV0aG9kLU92ZXJyaWRlYCBoZWFkZXIuXG4gIEJhY2tib25lLmVtdWxhdGVIVFRQID0gZmFsc2U7XG5cbiAgLy8gVHVybiBvbiBgZW11bGF0ZUpTT05gIHRvIHN1cHBvcnQgbGVnYWN5IHNlcnZlcnMgdGhhdCBjYW4ndCBkZWFsIHdpdGggZGlyZWN0XG4gIC8vIGBhcHBsaWNhdGlvbi9qc29uYCByZXF1ZXN0cyAuLi4gdGhpcyB3aWxsIGVuY29kZSB0aGUgYm9keSBhc1xuICAvLyBgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkYCBpbnN0ZWFkIGFuZCB3aWxsIHNlbmQgdGhlIG1vZGVsIGluIGFcbiAgLy8gZm9ybSBwYXJhbSBuYW1lZCBgbW9kZWxgLlxuICBCYWNrYm9uZS5lbXVsYXRlSlNPTiA9IGZhbHNlO1xuXG4gIC8vIFByb3h5IEJhY2tib25lIGNsYXNzIG1ldGhvZHMgdG8gVW5kZXJzY29yZSBmdW5jdGlvbnMsIHdyYXBwaW5nIHRoZSBtb2RlbCdzXG4gIC8vIGBhdHRyaWJ1dGVzYCBvYmplY3Qgb3IgY29sbGVjdGlvbidzIGBtb2RlbHNgIGFycmF5IGJlaGluZCB0aGUgc2NlbmVzLlxuICAvL1xuICAvLyBjb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbihtb2RlbCkgeyByZXR1cm4gbW9kZWwuZ2V0KCdhZ2UnKSA+IDEwIH0pO1xuICAvLyBjb2xsZWN0aW9uLmVhY2godGhpcy5hZGRWaWV3KTtcbiAgLy9cbiAgLy8gYEZ1bmN0aW9uI2FwcGx5YCBjYW4gYmUgc2xvdyBzbyB3ZSB1c2UgdGhlIG1ldGhvZCdzIGFyZyBjb3VudCwgaWYgd2Uga25vdyBpdC5cbiAgdmFyIGFkZE1ldGhvZCA9IGZ1bmN0aW9uKGxlbmd0aCwgbWV0aG9kLCBhdHRyaWJ1dGUpIHtcbiAgICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfW21ldGhvZF0odGhpc1thdHRyaWJ1dGVdKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gX1ttZXRob2RdKHRoaXNbYXR0cmlidXRlXSwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBfW21ldGhvZF0odGhpc1thdHRyaWJ1dGVdLCBjYihpdGVyYXRlZSwgdGhpcyksIGNvbnRleHQpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGl0ZXJhdGVlLCBkZWZhdWx0VmFsLCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBfW21ldGhvZF0odGhpc1thdHRyaWJ1dGVdLCBjYihpdGVyYXRlZSwgdGhpcyksIGRlZmF1bHRWYWwsIGNvbnRleHQpO1xuICAgICAgfTtcbiAgICAgIGRlZmF1bHQ6IHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzW2F0dHJpYnV0ZV0pO1xuICAgICAgICByZXR1cm4gX1ttZXRob2RdLmFwcGx5KF8sIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG4gIHZhciBhZGRVbmRlcnNjb3JlTWV0aG9kcyA9IGZ1bmN0aW9uKENsYXNzLCBtZXRob2RzLCBhdHRyaWJ1dGUpIHtcbiAgICBfLmVhY2gobWV0aG9kcywgZnVuY3Rpb24obGVuZ3RoLCBtZXRob2QpIHtcbiAgICAgIGlmIChfW21ldGhvZF0pIENsYXNzLnByb3RvdHlwZVttZXRob2RdID0gYWRkTWV0aG9kKGxlbmd0aCwgbWV0aG9kLCBhdHRyaWJ1dGUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFN1cHBvcnQgYGNvbGxlY3Rpb24uc29ydEJ5KCdhdHRyJylgIGFuZCBgY29sbGVjdGlvbi5maW5kV2hlcmUoe2lkOiAxfSlgLlxuICB2YXIgY2IgPSBmdW5jdGlvbihpdGVyYXRlZSwgaW5zdGFuY2UpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkgcmV0dXJuIGl0ZXJhdGVlO1xuICAgIGlmIChfLmlzT2JqZWN0KGl0ZXJhdGVlKSAmJiAhaW5zdGFuY2UuX2lzTW9kZWwoaXRlcmF0ZWUpKSByZXR1cm4gbW9kZWxNYXRjaGVyKGl0ZXJhdGVlKTtcbiAgICBpZiAoXy5pc1N0cmluZyhpdGVyYXRlZSkpIHJldHVybiBmdW5jdGlvbihtb2RlbCkgeyByZXR1cm4gbW9kZWwuZ2V0KGl0ZXJhdGVlKTsgfTtcbiAgICByZXR1cm4gaXRlcmF0ZWU7XG4gIH07XG4gIHZhciBtb2RlbE1hdGNoZXIgPSBmdW5jdGlvbihhdHRycykge1xuICAgIHZhciBtYXRjaGVyID0gXy5tYXRjaGVzKGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgIHJldHVybiBtYXRjaGVyKG1vZGVsLmF0dHJpYnV0ZXMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQmFja2JvbmUuRXZlbnRzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEEgbW9kdWxlIHRoYXQgY2FuIGJlIG1peGVkIGluIHRvICphbnkgb2JqZWN0KiBpbiBvcmRlciB0byBwcm92aWRlIGl0IHdpdGhcbiAgLy8gYSBjdXN0b20gZXZlbnQgY2hhbm5lbC4gWW91IG1heSBiaW5kIGEgY2FsbGJhY2sgdG8gYW4gZXZlbnQgd2l0aCBgb25gIG9yXG4gIC8vIHJlbW92ZSB3aXRoIGBvZmZgOyBgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW5cbiAgLy8gc3VjY2Vzc2lvbi5cbiAgLy9cbiAgLy8gICAgIHZhciBvYmplY3QgPSB7fTtcbiAgLy8gICAgIF8uZXh0ZW5kKG9iamVjdCwgQmFja2JvbmUuRXZlbnRzKTtcbiAgLy8gICAgIG9iamVjdC5vbignZXhwYW5kJywgZnVuY3Rpb24oKXsgYWxlcnQoJ2V4cGFuZGVkJyk7IH0pO1xuICAvLyAgICAgb2JqZWN0LnRyaWdnZXIoJ2V4cGFuZCcpO1xuICAvL1xuICB2YXIgRXZlbnRzID0gQmFja2JvbmUuRXZlbnRzID0ge307XG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5ncy5cbiAgdmFyIGV2ZW50U3BsaXR0ZXIgPSAvXFxzKy87XG5cbiAgLy8gSXRlcmF0ZXMgb3ZlciB0aGUgc3RhbmRhcmQgYGV2ZW50LCBjYWxsYmFja2AgKGFzIHdlbGwgYXMgdGhlIGZhbmN5IG11bHRpcGxlXG4gIC8vIHNwYWNlLXNlcGFyYXRlZCBldmVudHMgYFwiY2hhbmdlIGJsdXJcIiwgY2FsbGJhY2tgIGFuZCBqUXVlcnktc3R5bGUgZXZlbnRcbiAgLy8gbWFwcyBge2V2ZW50OiBjYWxsYmFja31gKS5cbiAgdmFyIGV2ZW50c0FwaSA9IGZ1bmN0aW9uKGl0ZXJhdGVlLCBldmVudHMsIG5hbWUsIGNhbGxiYWNrLCBvcHRzKSB7XG4gICAgdmFyIGkgPSAwLCBuYW1lcztcbiAgICBpZiAobmFtZSAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIEhhbmRsZSBldmVudCBtYXBzLlxuICAgICAgaWYgKGNhbGxiYWNrICE9PSB2b2lkIDAgJiYgJ2NvbnRleHQnIGluIG9wdHMgJiYgb3B0cy5jb250ZXh0ID09PSB2b2lkIDApIG9wdHMuY29udGV4dCA9IGNhbGxiYWNrO1xuICAgICAgZm9yIChuYW1lcyA9IF8ua2V5cyhuYW1lKTsgaSA8IG5hbWVzLmxlbmd0aCA7IGkrKykge1xuICAgICAgICBldmVudHMgPSBldmVudHNBcGkoaXRlcmF0ZWUsIGV2ZW50cywgbmFtZXNbaV0sIG5hbWVbbmFtZXNbaV1dLCBvcHRzKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgJiYgZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XG4gICAgICAvLyBIYW5kbGUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IG5hbWVzIGJ5IGRlbGVnYXRpbmcgdGhlbSBpbmRpdmlkdWFsbHkuXG4gICAgICBmb3IgKG5hbWVzID0gbmFtZS5zcGxpdChldmVudFNwbGl0dGVyKTsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV2ZW50cyA9IGl0ZXJhdGVlKGV2ZW50cywgbmFtZXNbaV0sIGNhbGxiYWNrLCBvcHRzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmluYWxseSwgc3RhbmRhcmQgZXZlbnRzLlxuICAgICAgZXZlbnRzID0gaXRlcmF0ZWUoZXZlbnRzLCBuYW1lLCBjYWxsYmFjaywgb3B0cyk7XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH07XG5cbiAgLy8gQmluZCBhbiBldmVudCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZFxuICAvLyB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbiAgRXZlbnRzLm9uID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICByZXR1cm4gaW50ZXJuYWxPbih0aGlzLCBuYW1lLCBjYWxsYmFjaywgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gR3VhcmQgdGhlIGBsaXN0ZW5pbmdgIGFyZ3VtZW50IGZyb20gdGhlIHB1YmxpYyBBUEkuXG4gIHZhciBpbnRlcm5hbE9uID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaywgY29udGV4dCwgbGlzdGVuaW5nKSB7XG4gICAgb2JqLl9ldmVudHMgPSBldmVudHNBcGkob25BcGksIG9iai5fZXZlbnRzIHx8IHt9LCBuYW1lLCBjYWxsYmFjaywge1xuICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgIGN0eDogb2JqLFxuICAgICAgbGlzdGVuaW5nOiBsaXN0ZW5pbmdcbiAgICB9KTtcblxuICAgIGlmIChsaXN0ZW5pbmcpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBvYmouX2xpc3RlbmVycyB8fCAob2JqLl9saXN0ZW5lcnMgPSB7fSk7XG4gICAgICBsaXN0ZW5lcnNbbGlzdGVuaW5nLmlkXSA9IGxpc3RlbmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAuIFRlbGwgKnRoaXMqIG9iamVjdCB0byBsaXN0ZW4gdG9cbiAgLy8gYW4gZXZlbnQgaW4gYW5vdGhlciBvYmplY3QuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3MgbGlzdGVuaW5nIHRvXG4gIC8vIGZvciBlYXNpZXIgdW5iaW5kaW5nIGxhdGVyLlxuICBFdmVudHMubGlzdGVuVG8gPSBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiB0aGlzO1xuICAgIHZhciBpZCA9IG9iai5fbGlzdGVuSWQgfHwgKG9iai5fbGlzdGVuSWQgPSBfLnVuaXF1ZUlkKCdsJykpO1xuICAgIHZhciBsaXN0ZW5pbmdUbyA9IHRoaXMuX2xpc3RlbmluZ1RvIHx8ICh0aGlzLl9saXN0ZW5pbmdUbyA9IHt9KTtcbiAgICB2YXIgbGlzdGVuaW5nID0gbGlzdGVuaW5nVG9baWRdO1xuXG4gICAgLy8gVGhpcyBvYmplY3QgaXMgbm90IGxpc3RlbmluZyB0byBhbnkgb3RoZXIgZXZlbnRzIG9uIGBvYmpgIHlldC5cbiAgICAvLyBTZXR1cCB0aGUgbmVjZXNzYXJ5IHJlZmVyZW5jZXMgdG8gdHJhY2sgdGhlIGxpc3RlbmluZyBjYWxsYmFja3MuXG4gICAgaWYgKCFsaXN0ZW5pbmcpIHtcbiAgICAgIHZhciB0aGlzSWQgPSB0aGlzLl9saXN0ZW5JZCB8fCAodGhpcy5fbGlzdGVuSWQgPSBfLnVuaXF1ZUlkKCdsJykpO1xuICAgICAgbGlzdGVuaW5nID0gbGlzdGVuaW5nVG9baWRdID0ge29iajogb2JqLCBvYmpJZDogaWQsIGlkOiB0aGlzSWQsIGxpc3RlbmluZ1RvOiBsaXN0ZW5pbmdUbywgY291bnQ6IDB9O1xuICAgIH1cblxuICAgIC8vIEJpbmQgY2FsbGJhY2tzIG9uIG9iaiwgYW5kIGtlZXAgdHJhY2sgb2YgdGhlbSBvbiBsaXN0ZW5pbmcuXG4gICAgaW50ZXJuYWxPbihvYmosIG5hbWUsIGNhbGxiYWNrLCB0aGlzLCBsaXN0ZW5pbmcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFRoZSByZWR1Y2luZyBBUEkgdGhhdCBhZGRzIGEgY2FsbGJhY2sgdG8gdGhlIGBldmVudHNgIG9iamVjdC5cbiAgdmFyIG9uQXBpID0gZnVuY3Rpb24oZXZlbnRzLCBuYW1lLCBjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgdmFyIGhhbmRsZXJzID0gZXZlbnRzW25hbWVdIHx8IChldmVudHNbbmFtZV0gPSBbXSk7XG4gICAgICB2YXIgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dCwgY3R4ID0gb3B0aW9ucy5jdHgsIGxpc3RlbmluZyA9IG9wdGlvbnMubGlzdGVuaW5nO1xuICAgICAgaWYgKGxpc3RlbmluZykgbGlzdGVuaW5nLmNvdW50Kys7XG5cbiAgICAgIGhhbmRsZXJzLnB1c2goe2NhbGxiYWNrOiBjYWxsYmFjaywgY29udGV4dDogY29udGV4dCwgY3R4OiBjb250ZXh0IHx8IGN0eCwgbGlzdGVuaW5nOiBsaXN0ZW5pbmd9KTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbiAgfTtcblxuICAvLyBSZW1vdmUgb25lIG9yIG1hbnkgY2FsbGJhY2tzLiBJZiBgY29udGV4dGAgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgLy8gY2FsbGJhY2tzIHdpdGggdGhhdCBmdW5jdGlvbi4gSWYgYGNhbGxiYWNrYCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAvLyBjYWxsYmFja3MgZm9yIHRoZSBldmVudC4gSWYgYG5hbWVgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXG4gIC8vIGNhbGxiYWNrcyBmb3IgYWxsIGV2ZW50cy5cbiAgRXZlbnRzLm9mZiA9IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuICAgIHRoaXMuX2V2ZW50cyA9IGV2ZW50c0FwaShvZmZBcGksIHRoaXMuX2V2ZW50cywgbmFtZSwgY2FsbGJhY2ssIHtcbiAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICBsaXN0ZW5lcnM6IHRoaXMuX2xpc3RlbmVyc1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cyAuLi4gb3JcbiAgLy8gdG8gZXZlcnkgb2JqZWN0IGl0J3MgY3VycmVudGx5IGxpc3RlbmluZyB0by5cbiAgRXZlbnRzLnN0b3BMaXN0ZW5pbmcgPSBmdW5jdGlvbihvYmosIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGxpc3RlbmluZ1RvID0gdGhpcy5fbGlzdGVuaW5nVG87XG4gICAgaWYgKCFsaXN0ZW5pbmdUbykgcmV0dXJuIHRoaXM7XG5cbiAgICB2YXIgaWRzID0gb2JqID8gW29iai5fbGlzdGVuSWRdIDogXy5rZXlzKGxpc3RlbmluZ1RvKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGlzdGVuaW5nID0gbGlzdGVuaW5nVG9baWRzW2ldXTtcblxuICAgICAgLy8gSWYgbGlzdGVuaW5nIGRvZXNuJ3QgZXhpc3QsIHRoaXMgb2JqZWN0IGlzIG5vdCBjdXJyZW50bHlcbiAgICAgIC8vIGxpc3RlbmluZyB0byBvYmouIEJyZWFrIG91dCBlYXJseS5cbiAgICAgIGlmICghbGlzdGVuaW5nKSBicmVhaztcblxuICAgICAgbGlzdGVuaW5nLm9iai5vZmYobmFtZSwgY2FsbGJhY2ssIHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFRoZSByZWR1Y2luZyBBUEkgdGhhdCByZW1vdmVzIGEgY2FsbGJhY2sgZnJvbSB0aGUgYGV2ZW50c2Agb2JqZWN0LlxuICB2YXIgb2ZmQXBpID0gZnVuY3Rpb24oZXZlbnRzLCBuYW1lLCBjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIGlmICghZXZlbnRzKSByZXR1cm47XG5cbiAgICB2YXIgaSA9IDAsIGxpc3RlbmluZztcbiAgICB2YXIgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dCwgbGlzdGVuZXJzID0gb3B0aW9ucy5saXN0ZW5lcnM7XG5cbiAgICAvLyBEZWxldGUgYWxsIGV2ZW50cyBsaXN0ZW5lcnMgYW5kIFwiZHJvcFwiIGV2ZW50cy5cbiAgICBpZiAoIW5hbWUgJiYgIWNhbGxiYWNrICYmICFjb250ZXh0KSB7XG4gICAgICB2YXIgaWRzID0gXy5rZXlzKGxpc3RlbmVycyk7XG4gICAgICBmb3IgKDsgaSA8IGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaXN0ZW5pbmcgPSBsaXN0ZW5lcnNbaWRzW2ldXTtcbiAgICAgICAgZGVsZXRlIGxpc3RlbmVyc1tsaXN0ZW5pbmcuaWRdO1xuICAgICAgICBkZWxldGUgbGlzdGVuaW5nLmxpc3RlbmluZ1RvW2xpc3RlbmluZy5vYmpJZF07XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5hbWVzID0gbmFtZSA/IFtuYW1lXSA6IF8ua2V5cyhldmVudHMpO1xuICAgIGZvciAoOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgIHZhciBoYW5kbGVycyA9IGV2ZW50c1tuYW1lXTtcblxuICAgICAgLy8gQmFpbCBvdXQgaWYgdGhlcmUgYXJlIG5vIGV2ZW50cyBzdG9yZWQuXG4gICAgICBpZiAoIWhhbmRsZXJzKSBicmVhaztcblxuICAgICAgLy8gUmVwbGFjZSBldmVudHMgaWYgdGhlcmUgYXJlIGFueSByZW1haW5pbmcuICBPdGhlcndpc2UsIGNsZWFuIHVwLlxuICAgICAgdmFyIHJlbWFpbmluZyA9IFtdO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoYW5kbGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgaGFuZGxlciA9IGhhbmRsZXJzW2pdO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGhhbmRsZXIuY2FsbGJhY2sgJiZcbiAgICAgICAgICAgIGNhbGxiYWNrICE9PSBoYW5kbGVyLmNhbGxiYWNrLl9jYWxsYmFjayB8fFxuICAgICAgICAgICAgICBjb250ZXh0ICYmIGNvbnRleHQgIT09IGhhbmRsZXIuY29udGV4dFxuICAgICAgICApIHtcbiAgICAgICAgICByZW1haW5pbmcucHVzaChoYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaXN0ZW5pbmcgPSBoYW5kbGVyLmxpc3RlbmluZztcbiAgICAgICAgICBpZiAobGlzdGVuaW5nICYmIC0tbGlzdGVuaW5nLmNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBkZWxldGUgbGlzdGVuZXJzW2xpc3RlbmluZy5pZF07XG4gICAgICAgICAgICBkZWxldGUgbGlzdGVuaW5nLmxpc3RlbmluZ1RvW2xpc3RlbmluZy5vYmpJZF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSB0YWlsIGV2ZW50IGlmIHRoZSBsaXN0IGhhcyBhbnkgZXZlbnRzLiAgT3RoZXJ3aXNlLCBjbGVhbiB1cC5cbiAgICAgIGlmIChyZW1haW5pbmcubGVuZ3RoKSB7XG4gICAgICAgIGV2ZW50c1tuYW1lXSA9IHJlbWFpbmluZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSBldmVudHNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH07XG5cbiAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAvLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZCwgaXRzIGxpc3RlbmVyIHdpbGwgYmUgcmVtb3ZlZC4gSWYgbXVsdGlwbGUgZXZlbnRzXG4gIC8vIGFyZSBwYXNzZWQgaW4gdXNpbmcgdGhlIHNwYWNlLXNlcGFyYXRlZCBzeW50YXgsIHRoZSBoYW5kbGVyIHdpbGwgZmlyZVxuICAvLyBvbmNlIGZvciBlYWNoIGV2ZW50LCBub3Qgb25jZSBmb3IgYSBjb21iaW5hdGlvbiBvZiBhbGwgZXZlbnRzLlxuICBFdmVudHMub25jZSA9IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgLy8gTWFwIHRoZSBldmVudCBpbnRvIGEgYHtldmVudDogb25jZX1gIG9iamVjdC5cbiAgICB2YXIgZXZlbnRzID0gZXZlbnRzQXBpKG9uY2VNYXAsIHt9LCBuYW1lLCBjYWxsYmFjaywgXy5iaW5kKHRoaXMub2ZmLCB0aGlzKSk7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBjb250ZXh0ID09IG51bGwpIGNhbGxiYWNrID0gdm9pZCAwO1xuICAgIHJldHVybiB0aGlzLm9uKGV2ZW50cywgY2FsbGJhY2ssIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmNlYC5cbiAgRXZlbnRzLmxpc3RlblRvT25jZSA9IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAvLyBNYXAgdGhlIGV2ZW50IGludG8gYSBge2V2ZW50OiBvbmNlfWAgb2JqZWN0LlxuICAgIHZhciBldmVudHMgPSBldmVudHNBcGkob25jZU1hcCwge30sIG5hbWUsIGNhbGxiYWNrLCBfLmJpbmQodGhpcy5zdG9wTGlzdGVuaW5nLCB0aGlzLCBvYmopKTtcbiAgICByZXR1cm4gdGhpcy5saXN0ZW5UbyhvYmosIGV2ZW50cyk7XG4gIH07XG5cbiAgLy8gUmVkdWNlcyB0aGUgZXZlbnQgY2FsbGJhY2tzIGludG8gYSBtYXAgb2YgYHtldmVudDogb25jZVdyYXBwZXJ9YC5cbiAgLy8gYG9mZmVyYCB1bmJpbmRzIHRoZSBgb25jZVdyYXBwZXJgIGFmdGVyIGl0IGhhcyBiZWVuIGNhbGxlZC5cbiAgdmFyIG9uY2VNYXAgPSBmdW5jdGlvbihtYXAsIG5hbWUsIGNhbGxiYWNrLCBvZmZlcikge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgdmFyIG9uY2UgPSBtYXBbbmFtZV0gPSBfLm9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIG9mZmVyKG5hbWUsIG9uY2UpO1xuICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICBvbmNlLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICByZXR1cm4gbWFwO1xuICB9O1xuXG4gIC8vIFRyaWdnZXIgb25lIG9yIG1hbnkgZXZlbnRzLCBmaXJpbmcgYWxsIGJvdW5kIGNhbGxiYWNrcy4gQ2FsbGJhY2tzIGFyZVxuICAvLyBwYXNzZWQgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGB0cmlnZ2VyYCBpcywgYXBhcnQgZnJvbSB0aGUgZXZlbnQgbmFtZVxuICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgLy8gcmVjZWl2ZSB0aGUgdHJ1ZSBuYW1lIG9mIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQpLlxuICBFdmVudHMudHJpZ2dlciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoMCwgYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIHZhciBhcmdzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAxXTtcblxuICAgIGV2ZW50c0FwaSh0cmlnZ2VyQXBpLCB0aGlzLl9ldmVudHMsIG5hbWUsIHZvaWQgMCwgYXJncyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gSGFuZGxlcyB0cmlnZ2VyaW5nIHRoZSBhcHByb3ByaWF0ZSBldmVudCBjYWxsYmFja3MuXG4gIHZhciB0cmlnZ2VyQXBpID0gZnVuY3Rpb24ob2JqRXZlbnRzLCBuYW1lLCBjYWxsYmFjaywgYXJncykge1xuICAgIGlmIChvYmpFdmVudHMpIHtcbiAgICAgIHZhciBldmVudHMgPSBvYmpFdmVudHNbbmFtZV07XG4gICAgICB2YXIgYWxsRXZlbnRzID0gb2JqRXZlbnRzLmFsbDtcbiAgICAgIGlmIChldmVudHMgJiYgYWxsRXZlbnRzKSBhbGxFdmVudHMgPSBhbGxFdmVudHMuc2xpY2UoKTtcbiAgICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgIGlmIChhbGxFdmVudHMpIHRyaWdnZXJFdmVudHMoYWxsRXZlbnRzLCBbbmFtZV0uY29uY2F0KGFyZ3MpKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iakV2ZW50cztcbiAgfTtcblxuICAvLyBBIGRpZmZpY3VsdC10by1iZWxpZXZlLCBidXQgb3B0aW1pemVkIGludGVybmFsIGRpc3BhdGNoIGZ1bmN0aW9uIGZvclxuICAvLyB0cmlnZ2VyaW5nIGV2ZW50cy4gVHJpZXMgdG8ga2VlcCB0aGUgdXN1YWwgY2FzZXMgc3BlZWR5IChtb3N0IGludGVybmFsXG4gIC8vIEJhY2tib25lIGV2ZW50cyBoYXZlIDMgYXJndW1lbnRzKS5cbiAgdmFyIHRyaWdnZXJFdmVudHMgPSBmdW5jdGlvbihldmVudHMsIGFyZ3MpIHtcbiAgICB2YXIgZXYsIGkgPSAtMSwgbCA9IGV2ZW50cy5sZW5ndGgsIGExID0gYXJnc1swXSwgYTIgPSBhcmdzWzFdLCBhMyA9IGFyZ3NbMl07XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcbiAgICAgIGNhc2UgMTogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suY2FsbChldi5jdHgsIGExKTsgcmV0dXJuO1xuICAgICAgY2FzZSAyOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyKTsgcmV0dXJuO1xuICAgICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcbiAgICAgIGRlZmF1bHQ6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmFwcGx5KGV2LmN0eCwgYXJncyk7IHJldHVybjtcbiAgICB9XG4gIH07XG5cbiAgLy8gQWxpYXNlcyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIEV2ZW50cy5iaW5kICAgPSBFdmVudHMub247XG4gIEV2ZW50cy51bmJpbmQgPSBFdmVudHMub2ZmO1xuXG4gIC8vIEFsbG93IHRoZSBgQmFja2JvbmVgIG9iamVjdCB0byBzZXJ2ZSBhcyBhIGdsb2JhbCBldmVudCBidXMsIGZvciBmb2xrcyB3aG9cbiAgLy8gd2FudCBnbG9iYWwgXCJwdWJzdWJcIiBpbiBhIGNvbnZlbmllbnQgcGxhY2UuXG4gIF8uZXh0ZW5kKEJhY2tib25lLCBFdmVudHMpO1xuXG4gIC8vIEJhY2tib25lLk1vZGVsXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQmFja2JvbmUgKipNb2RlbHMqKiBhcmUgdGhlIGJhc2ljIGRhdGEgb2JqZWN0IGluIHRoZSBmcmFtZXdvcmsgLS1cbiAgLy8gZnJlcXVlbnRseSByZXByZXNlbnRpbmcgYSByb3cgaW4gYSB0YWJsZSBpbiBhIGRhdGFiYXNlIG9uIHlvdXIgc2VydmVyLlxuICAvLyBBIGRpc2NyZXRlIGNodW5rIG9mIGRhdGEgYW5kIGEgYnVuY2ggb2YgdXNlZnVsLCByZWxhdGVkIG1ldGhvZHMgZm9yXG4gIC8vIHBlcmZvcm1pbmcgY29tcHV0YXRpb25zIGFuZCB0cmFuc2Zvcm1hdGlvbnMgb24gdGhhdCBkYXRhLlxuXG4gIC8vIENyZWF0ZSBhIG5ldyBtb2RlbCB3aXRoIHRoZSBzcGVjaWZpZWQgYXR0cmlidXRlcy4gQSBjbGllbnQgaWQgKGBjaWRgKVxuICAvLyBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBhbmQgYXNzaWduZWQgZm9yIHlvdS5cbiAgdmFyIE1vZGVsID0gQmFja2JvbmUuTW9kZWwgPSBmdW5jdGlvbihhdHRyaWJ1dGVzLCBvcHRpb25zKSB7XG4gICAgdmFyIGF0dHJzID0gYXR0cmlidXRlcyB8fCB7fTtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHRoaXMuY2lkID0gXy51bmlxdWVJZCh0aGlzLmNpZFByZWZpeCk7XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgaWYgKG9wdGlvbnMuY29sbGVjdGlvbikgdGhpcy5jb2xsZWN0aW9uID0gb3B0aW9ucy5jb2xsZWN0aW9uO1xuICAgIGlmIChvcHRpb25zLnBhcnNlKSBhdHRycyA9IHRoaXMucGFyc2UoYXR0cnMsIG9wdGlvbnMpIHx8IHt9O1xuICAgIHZhciBkZWZhdWx0cyA9IF8ucmVzdWx0KHRoaXMsICdkZWZhdWx0cycpO1xuICAgIGF0dHJzID0gXy5kZWZhdWx0cyhfLmV4dGVuZCh7fSwgZGVmYXVsdHMsIGF0dHJzKSwgZGVmYXVsdHMpO1xuICAgIHRoaXMuc2V0KGF0dHJzLCBvcHRpb25zKTtcbiAgICB0aGlzLmNoYW5nZWQgPSB7fTtcbiAgICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvLyBBdHRhY2ggYWxsIGluaGVyaXRhYmxlIG1ldGhvZHMgdG8gdGhlIE1vZGVsIHByb3RvdHlwZS5cbiAgXy5leHRlbmQoTW9kZWwucHJvdG90eXBlLCBFdmVudHMsIHtcblxuICAgIC8vIEEgaGFzaCBvZiBhdHRyaWJ1dGVzIHdob3NlIGN1cnJlbnQgYW5kIHByZXZpb3VzIHZhbHVlIGRpZmZlci5cbiAgICBjaGFuZ2VkOiBudWxsLFxuXG4gICAgLy8gVGhlIHZhbHVlIHJldHVybmVkIGR1cmluZyB0aGUgbGFzdCBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICB2YWxpZGF0aW9uRXJyb3I6IG51bGwsXG5cbiAgICAvLyBUaGUgZGVmYXVsdCBuYW1lIGZvciB0aGUgSlNPTiBgaWRgIGF0dHJpYnV0ZSBpcyBgXCJpZFwiYC4gTW9uZ29EQiBhbmRcbiAgICAvLyBDb3VjaERCIHVzZXJzIG1heSB3YW50IHRvIHNldCB0aGlzIHRvIGBcIl9pZFwiYC5cbiAgICBpZEF0dHJpYnV0ZTogJ2lkJyxcblxuICAgIC8vIFRoZSBwcmVmaXggaXMgdXNlZCB0byBjcmVhdGUgdGhlIGNsaWVudCBpZCB3aGljaCBpcyB1c2VkIHRvIGlkZW50aWZ5IG1vZGVscyBsb2NhbGx5LlxuICAgIC8vIFlvdSBtYXkgd2FudCB0byBvdmVycmlkZSB0aGlzIGlmIHlvdSdyZSBleHBlcmllbmNpbmcgbmFtZSBjbGFzaGVzIHdpdGggbW9kZWwgaWRzLlxuICAgIGNpZFByZWZpeDogJ2MnLFxuXG4gICAgLy8gSW5pdGlhbGl6ZSBpcyBhbiBlbXB0eSBmdW5jdGlvbiBieSBkZWZhdWx0LiBPdmVycmlkZSBpdCB3aXRoIHlvdXIgb3duXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gbG9naWMuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgbW9kZWwncyBgYXR0cmlidXRlc2Agb2JqZWN0LlxuICAgIHRvSlNPTjogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgcmV0dXJuIF8uY2xvbmUodGhpcy5hdHRyaWJ1dGVzKTtcbiAgICB9LFxuXG4gICAgLy8gUHJveHkgYEJhY2tib25lLnN5bmNgIGJ5IGRlZmF1bHQgLS0gYnV0IG92ZXJyaWRlIHRoaXMgaWYgeW91IG5lZWRcbiAgICAvLyBjdXN0b20gc3luY2luZyBzZW1hbnRpY3MgZm9yICp0aGlzKiBwYXJ0aWN1bGFyIG1vZGVsLlxuICAgIHN5bmM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEJhY2tib25lLnN5bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUuXG4gICAgZ2V0OiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzW2F0dHJdO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIEhUTUwtZXNjYXBlZCB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUuXG4gICAgZXNjYXBlOiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICByZXR1cm4gXy5lc2NhcGUodGhpcy5nZXQoYXR0cikpO1xuICAgIH0sXG5cbiAgICAvLyBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXR0cmlidXRlIGNvbnRhaW5zIGEgdmFsdWUgdGhhdCBpcyBub3QgbnVsbFxuICAgIC8vIG9yIHVuZGVmaW5lZC5cbiAgICBoYXM6IGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldChhdHRyKSAhPSBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWFsLWNhc2VkIHByb3h5IHRvIHVuZGVyc2NvcmUncyBgXy5tYXRjaGVzYCBtZXRob2QuXG4gICAgbWF0Y2hlczogZnVuY3Rpb24oYXR0cnMpIHtcbiAgICAgIHJldHVybiAhIV8uaXRlcmF0ZWUoYXR0cnMsIHRoaXMpKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgfSxcblxuICAgIC8vIFNldCBhIGhhc2ggb2YgbW9kZWwgYXR0cmlidXRlcyBvbiB0aGUgb2JqZWN0LCBmaXJpbmcgYFwiY2hhbmdlXCJgLiBUaGlzIGlzXG4gICAgLy8gdGhlIGNvcmUgcHJpbWl0aXZlIG9wZXJhdGlvbiBvZiBhIG1vZGVsLCB1cGRhdGluZyB0aGUgZGF0YSBhbmQgbm90aWZ5aW5nXG4gICAgLy8gYW55b25lIHdobyBuZWVkcyB0byBrbm93IGFib3V0IHRoZSBjaGFuZ2UgaW4gc3RhdGUuIFRoZSBoZWFydCBvZiB0aGUgYmVhc3QuXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbCwgb3B0aW9ucykge1xuICAgICAgaWYgKGtleSA9PSBudWxsKSByZXR1cm4gdGhpcztcblxuICAgICAgLy8gSGFuZGxlIGJvdGggYFwia2V5XCIsIHZhbHVlYCBhbmQgYHtrZXk6IHZhbHVlfWAgLXN0eWxlIGFyZ3VtZW50cy5cbiAgICAgIHZhciBhdHRycztcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhdHRycyA9IGtleTtcbiAgICAgICAgb3B0aW9ucyA9IHZhbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIChhdHRycyA9IHt9KVtrZXldID0gdmFsO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgICAvLyBSdW4gdmFsaWRhdGlvbi5cbiAgICAgIGlmICghdGhpcy5fdmFsaWRhdGUoYXR0cnMsIG9wdGlvbnMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIEV4dHJhY3QgYXR0cmlidXRlcyBhbmQgb3B0aW9ucy5cbiAgICAgIHZhciB1bnNldCAgICAgID0gb3B0aW9ucy51bnNldDtcbiAgICAgIHZhciBzaWxlbnQgICAgID0gb3B0aW9ucy5zaWxlbnQ7XG4gICAgICB2YXIgY2hhbmdlcyAgICA9IFtdO1xuICAgICAgdmFyIGNoYW5naW5nICAgPSB0aGlzLl9jaGFuZ2luZztcbiAgICAgIHRoaXMuX2NoYW5naW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKCFjaGFuZ2luZykge1xuICAgICAgICB0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMgPSBfLmNsb25lKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IHt9O1xuICAgICAgfVxuXG4gICAgICB2YXIgY3VycmVudCA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgIHZhciBjaGFuZ2VkID0gdGhpcy5jaGFuZ2VkO1xuICAgICAgdmFyIHByZXYgICAgPSB0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXM7XG5cbiAgICAgIC8vIEZvciBlYWNoIGBzZXRgIGF0dHJpYnV0ZSwgdXBkYXRlIG9yIGRlbGV0ZSB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICAgIGZvciAodmFyIGF0dHIgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFsID0gYXR0cnNbYXR0cl07XG4gICAgICAgIGlmICghXy5pc0VxdWFsKGN1cnJlbnRbYXR0cl0sIHZhbCkpIGNoYW5nZXMucHVzaChhdHRyKTtcbiAgICAgICAgaWYgKCFfLmlzRXF1YWwocHJldlthdHRyXSwgdmFsKSkge1xuICAgICAgICAgIGNoYW5nZWRbYXR0cl0gPSB2YWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGNoYW5nZWRbYXR0cl07XG4gICAgICAgIH1cbiAgICAgICAgdW5zZXQgPyBkZWxldGUgY3VycmVudFthdHRyXSA6IGN1cnJlbnRbYXR0cl0gPSB2YWw7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgYGlkYC5cbiAgICAgIGlmICh0aGlzLmlkQXR0cmlidXRlIGluIGF0dHJzKSB0aGlzLmlkID0gdGhpcy5nZXQodGhpcy5pZEF0dHJpYnV0ZSk7XG5cbiAgICAgIC8vIFRyaWdnZXIgYWxsIHJlbGV2YW50IGF0dHJpYnV0ZSBjaGFuZ2VzLlxuICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoKSB0aGlzLl9wZW5kaW5nID0gb3B0aW9ucztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2U6JyArIGNoYW5nZXNbaV0sIHRoaXMsIGN1cnJlbnRbY2hhbmdlc1tpXV0sIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFlvdSBtaWdodCBiZSB3b25kZXJpbmcgd2h5IHRoZXJlJ3MgYSBgd2hpbGVgIGxvb3AgaGVyZS4gQ2hhbmdlcyBjYW5cbiAgICAgIC8vIGJlIHJlY3Vyc2l2ZWx5IG5lc3RlZCB3aXRoaW4gYFwiY2hhbmdlXCJgIGV2ZW50cy5cbiAgICAgIGlmIChjaGFuZ2luZykgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAoIXNpbGVudCkge1xuICAgICAgICB3aGlsZSAodGhpcy5fcGVuZGluZykge1xuICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLl9wZW5kaW5nO1xuICAgICAgICAgIHRoaXMuX3BlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2NoYW5nZScsIHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9wZW5kaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9jaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBhbiBhdHRyaWJ1dGUgZnJvbSB0aGUgbW9kZWwsIGZpcmluZyBgXCJjaGFuZ2VcImAuIGB1bnNldGAgaXMgYSBub29wXG4gICAgLy8gaWYgdGhlIGF0dHJpYnV0ZSBkb2Vzbid0IGV4aXN0LlxuICAgIHVuc2V0OiBmdW5jdGlvbihhdHRyLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoYXR0ciwgdm9pZCAwLCBfLmV4dGVuZCh7fSwgb3B0aW9ucywge3Vuc2V0OiB0cnVlfSkpO1xuICAgIH0sXG5cbiAgICAvLyBDbGVhciBhbGwgYXR0cmlidXRlcyBvbiB0aGUgbW9kZWwsIGZpcmluZyBgXCJjaGFuZ2VcImAuXG4gICAgY2xlYXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBhdHRycyA9IHt9O1xuICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuYXR0cmlidXRlcykgYXR0cnNba2V5XSA9IHZvaWQgMDtcbiAgICAgIHJldHVybiB0aGlzLnNldChhdHRycywgXy5leHRlbmQoe30sIG9wdGlvbnMsIHt1bnNldDogdHJ1ZX0pKTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBtb2RlbCBoYXMgY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCBgXCJjaGFuZ2VcImAgZXZlbnQuXG4gICAgLy8gSWYgeW91IHNwZWNpZnkgYW4gYXR0cmlidXRlIG5hbWUsIGRldGVybWluZSBpZiB0aGF0IGF0dHJpYnV0ZSBoYXMgY2hhbmdlZC5cbiAgICBoYXNDaGFuZ2VkOiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICBpZiAoYXR0ciA9PSBudWxsKSByZXR1cm4gIV8uaXNFbXB0eSh0aGlzLmNoYW5nZWQpO1xuICAgICAgcmV0dXJuIF8uaGFzKHRoaXMuY2hhbmdlZCwgYXR0cik7XG4gICAgfSxcblxuICAgIC8vIFJldHVybiBhbiBvYmplY3QgY29udGFpbmluZyBhbGwgdGhlIGF0dHJpYnV0ZXMgdGhhdCBoYXZlIGNoYW5nZWQsIG9yXG4gICAgLy8gZmFsc2UgaWYgdGhlcmUgYXJlIG5vIGNoYW5nZWQgYXR0cmlidXRlcy4gVXNlZnVsIGZvciBkZXRlcm1pbmluZyB3aGF0XG4gICAgLy8gcGFydHMgb2YgYSB2aWV3IG5lZWQgdG8gYmUgdXBkYXRlZCBhbmQvb3Igd2hhdCBhdHRyaWJ1dGVzIG5lZWQgdG8gYmVcbiAgICAvLyBwZXJzaXN0ZWQgdG8gdGhlIHNlcnZlci4gVW5zZXQgYXR0cmlidXRlcyB3aWxsIGJlIHNldCB0byB1bmRlZmluZWQuXG4gICAgLy8gWW91IGNhbiBhbHNvIHBhc3MgYW4gYXR0cmlidXRlcyBvYmplY3QgdG8gZGlmZiBhZ2FpbnN0IHRoZSBtb2RlbCxcbiAgICAvLyBkZXRlcm1pbmluZyBpZiB0aGVyZSAqd291bGQgYmUqIGEgY2hhbmdlLlxuICAgIGNoYW5nZWRBdHRyaWJ1dGVzOiBmdW5jdGlvbihkaWZmKSB7XG4gICAgICBpZiAoIWRpZmYpIHJldHVybiB0aGlzLmhhc0NoYW5nZWQoKSA/IF8uY2xvbmUodGhpcy5jaGFuZ2VkKSA6IGZhbHNlO1xuICAgICAgdmFyIG9sZCA9IHRoaXMuX2NoYW5naW5nID8gdGhpcy5fcHJldmlvdXNBdHRyaWJ1dGVzIDogdGhpcy5hdHRyaWJ1dGVzO1xuICAgICAgdmFyIGNoYW5nZWQgPSB7fTtcbiAgICAgIGZvciAodmFyIGF0dHIgaW4gZGlmZikge1xuICAgICAgICB2YXIgdmFsID0gZGlmZlthdHRyXTtcbiAgICAgICAgaWYgKF8uaXNFcXVhbChvbGRbYXR0cl0sIHZhbCkpIGNvbnRpbnVlO1xuICAgICAgICBjaGFuZ2VkW2F0dHJdID0gdmFsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uc2l6ZShjaGFuZ2VkKSA/IGNoYW5nZWQgOiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBwcmV2aW91cyB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUsIHJlY29yZGVkIGF0IHRoZSB0aW1lIHRoZSBsYXN0XG4gICAgLy8gYFwiY2hhbmdlXCJgIGV2ZW50IHdhcyBmaXJlZC5cbiAgICBwcmV2aW91czogZnVuY3Rpb24oYXR0cikge1xuICAgICAgaWYgKGF0dHIgPT0gbnVsbCB8fCAhdGhpcy5fcHJldmlvdXNBdHRyaWJ1dGVzKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXNbYXR0cl07XG4gICAgfSxcblxuICAgIC8vIEdldCBhbGwgb2YgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIG1vZGVsIGF0IHRoZSB0aW1lIG9mIHRoZSBwcmV2aW91c1xuICAgIC8vIGBcImNoYW5nZVwiYCBldmVudC5cbiAgICBwcmV2aW91c0F0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8uY2xvbmUodGhpcy5fcHJldmlvdXNBdHRyaWJ1dGVzKTtcbiAgICB9LFxuXG4gICAgLy8gRmV0Y2ggdGhlIG1vZGVsIGZyb20gdGhlIHNlcnZlciwgbWVyZ2luZyB0aGUgcmVzcG9uc2Ugd2l0aCB0aGUgbW9kZWwnc1xuICAgIC8vIGxvY2FsIGF0dHJpYnV0ZXMuIEFueSBjaGFuZ2VkIGF0dHJpYnV0ZXMgd2lsbCB0cmlnZ2VyIGEgXCJjaGFuZ2VcIiBldmVudC5cbiAgICBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtwYXJzZTogdHJ1ZX0sIG9wdGlvbnMpO1xuICAgICAgdmFyIG1vZGVsID0gdGhpcztcbiAgICAgIHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuICAgICAgb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICB2YXIgc2VydmVyQXR0cnMgPSBvcHRpb25zLnBhcnNlID8gbW9kZWwucGFyc2UocmVzcCwgb3B0aW9ucykgOiByZXNwO1xuICAgICAgICBpZiAoIW1vZGVsLnNldChzZXJ2ZXJBdHRycywgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHN1Y2Nlc3MuY2FsbChvcHRpb25zLmNvbnRleHQsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICAgICAgbW9kZWwudHJpZ2dlcignc3luYycsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICAgIH07XG4gICAgICB3cmFwRXJyb3IodGhpcywgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gdGhpcy5zeW5jKCdyZWFkJywgdGhpcywgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8vIFNldCBhIGhhc2ggb2YgbW9kZWwgYXR0cmlidXRlcywgYW5kIHN5bmMgdGhlIG1vZGVsIHRvIHRoZSBzZXJ2ZXIuXG4gICAgLy8gSWYgdGhlIHNlcnZlciByZXR1cm5zIGFuIGF0dHJpYnV0ZXMgaGFzaCB0aGF0IGRpZmZlcnMsIHRoZSBtb2RlbCdzXG4gICAgLy8gc3RhdGUgd2lsbCBiZSBgc2V0YCBhZ2Fpbi5cbiAgICBzYXZlOiBmdW5jdGlvbihrZXksIHZhbCwgb3B0aW9ucykge1xuICAgICAgLy8gSGFuZGxlIGJvdGggYFwia2V5XCIsIHZhbHVlYCBhbmQgYHtrZXk6IHZhbHVlfWAgLXN0eWxlIGFyZ3VtZW50cy5cbiAgICAgIHZhciBhdHRycztcbiAgICAgIGlmIChrZXkgPT0gbnVsbCB8fCB0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBhdHRycyA9IGtleTtcbiAgICAgICAgb3B0aW9ucyA9IHZhbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIChhdHRycyA9IHt9KVtrZXldID0gdmFsO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zID0gXy5leHRlbmQoe3ZhbGlkYXRlOiB0cnVlLCBwYXJzZTogdHJ1ZX0sIG9wdGlvbnMpO1xuICAgICAgdmFyIHdhaXQgPSBvcHRpb25zLndhaXQ7XG5cbiAgICAgIC8vIElmIHdlJ3JlIG5vdCB3YWl0aW5nIGFuZCBhdHRyaWJ1dGVzIGV4aXN0LCBzYXZlIGFjdHMgYXNcbiAgICAgIC8vIGBzZXQoYXR0cikuc2F2ZShudWxsLCBvcHRzKWAgd2l0aCB2YWxpZGF0aW9uLiBPdGhlcndpc2UsIGNoZWNrIGlmXG4gICAgICAvLyB0aGUgbW9kZWwgd2lsbCBiZSB2YWxpZCB3aGVuIHRoZSBhdHRyaWJ1dGVzLCBpZiBhbnksIGFyZSBzZXQuXG4gICAgICBpZiAoYXR0cnMgJiYgIXdhaXQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNldChhdHRycywgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX3ZhbGlkYXRlKGF0dHJzLCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIEFmdGVyIGEgc3VjY2Vzc2Z1bCBzZXJ2ZXItc2lkZSBzYXZlLCB0aGUgY2xpZW50IGlzIChvcHRpb25hbGx5KVxuICAgICAgLy8gdXBkYXRlZCB3aXRoIHRoZSBzZXJ2ZXItc2lkZSBzdGF0ZS5cbiAgICAgIHZhciBtb2RlbCA9IHRoaXM7XG4gICAgICB2YXIgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2VzcztcbiAgICAgIHZhciBhdHRyaWJ1dGVzID0gdGhpcy5hdHRyaWJ1dGVzO1xuICAgICAgb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAvLyBFbnN1cmUgYXR0cmlidXRlcyBhcmUgcmVzdG9yZWQgZHVyaW5nIHN5bmNocm9ub3VzIHNhdmVzLlxuICAgICAgICBtb2RlbC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgdmFyIHNlcnZlckF0dHJzID0gb3B0aW9ucy5wYXJzZSA/IG1vZGVsLnBhcnNlKHJlc3AsIG9wdGlvbnMpIDogcmVzcDtcbiAgICAgICAgaWYgKHdhaXQpIHNlcnZlckF0dHJzID0gXy5leHRlbmQoe30sIGF0dHJzLCBzZXJ2ZXJBdHRycyk7XG4gICAgICAgIGlmIChzZXJ2ZXJBdHRycyAmJiAhbW9kZWwuc2V0KHNlcnZlckF0dHJzLCBvcHRpb25zKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcy5jYWxsKG9wdGlvbnMuY29udGV4dCwgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgICBtb2RlbC50cmlnZ2VyKCdzeW5jJywgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgfTtcbiAgICAgIHdyYXBFcnJvcih0aGlzLCBvcHRpb25zKTtcblxuICAgICAgLy8gU2V0IHRlbXBvcmFyeSBhdHRyaWJ1dGVzIGlmIGB7d2FpdDogdHJ1ZX1gIHRvIHByb3Blcmx5IGZpbmQgbmV3IGlkcy5cbiAgICAgIGlmIChhdHRycyAmJiB3YWl0KSB0aGlzLmF0dHJpYnV0ZXMgPSBfLmV4dGVuZCh7fSwgYXR0cmlidXRlcywgYXR0cnMpO1xuXG4gICAgICB2YXIgbWV0aG9kID0gdGhpcy5pc05ldygpID8gJ2NyZWF0ZScgOiAob3B0aW9ucy5wYXRjaCA/ICdwYXRjaCcgOiAndXBkYXRlJyk7XG4gICAgICBpZiAobWV0aG9kID09PSAncGF0Y2gnICYmICFvcHRpb25zLmF0dHJzKSBvcHRpb25zLmF0dHJzID0gYXR0cnM7XG4gICAgICB2YXIgeGhyID0gdGhpcy5zeW5jKG1ldGhvZCwgdGhpcywgb3B0aW9ucyk7XG5cbiAgICAgIC8vIFJlc3RvcmUgYXR0cmlidXRlcy5cbiAgICAgIHRoaXMuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG5cbiAgICAgIHJldHVybiB4aHI7XG4gICAgfSxcblxuICAgIC8vIERlc3Ryb3kgdGhpcyBtb2RlbCBvbiB0aGUgc2VydmVyIGlmIGl0IHdhcyBhbHJlYWR5IHBlcnNpc3RlZC5cbiAgICAvLyBPcHRpbWlzdGljYWxseSByZW1vdmVzIHRoZSBtb2RlbCBmcm9tIGl0cyBjb2xsZWN0aW9uLCBpZiBpdCBoYXMgb25lLlxuICAgIC8vIElmIGB3YWl0OiB0cnVlYCBpcyBwYXNzZWQsIHdhaXRzIGZvciB0aGUgc2VydmVyIHRvIHJlc3BvbmQgYmVmb3JlIHJlbW92YWwuXG4gICAgZGVzdHJveTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzO1xuICAgICAgdmFyIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3M7XG4gICAgICB2YXIgd2FpdCA9IG9wdGlvbnMud2FpdDtcblxuICAgICAgdmFyIGRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbW9kZWwuc3RvcExpc3RlbmluZygpO1xuICAgICAgICBtb2RlbC50cmlnZ2VyKCdkZXN0cm95JywgbW9kZWwsIG1vZGVsLmNvbGxlY3Rpb24sIG9wdGlvbnMpO1xuICAgICAgfTtcblxuICAgICAgb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICBpZiAod2FpdCkgZGVzdHJveSgpO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcy5jYWxsKG9wdGlvbnMuY29udGV4dCwgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoIW1vZGVsLmlzTmV3KCkpIG1vZGVsLnRyaWdnZXIoJ3N5bmMnLCBtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgeGhyID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5pc05ldygpKSB7XG4gICAgICAgIF8uZGVmZXIob3B0aW9ucy5zdWNjZXNzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdyYXBFcnJvcih0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgeGhyID0gdGhpcy5zeW5jKCdkZWxldGUnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIGlmICghd2FpdCkgZGVzdHJveSgpO1xuICAgICAgcmV0dXJuIHhocjtcbiAgICB9LFxuXG4gICAgLy8gRGVmYXVsdCBVUkwgZm9yIHRoZSBtb2RlbCdzIHJlcHJlc2VudGF0aW9uIG9uIHRoZSBzZXJ2ZXIgLS0gaWYgeW91J3JlXG4gICAgLy8gdXNpbmcgQmFja2JvbmUncyByZXN0ZnVsIG1ldGhvZHMsIG92ZXJyaWRlIHRoaXMgdG8gY2hhbmdlIHRoZSBlbmRwb2ludFxuICAgIC8vIHRoYXQgd2lsbCBiZSBjYWxsZWQuXG4gICAgdXJsOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBiYXNlID1cbiAgICAgICAgXy5yZXN1bHQodGhpcywgJ3VybFJvb3QnKSB8fFxuICAgICAgICBfLnJlc3VsdCh0aGlzLmNvbGxlY3Rpb24sICd1cmwnKSB8fFxuICAgICAgICB1cmxFcnJvcigpO1xuICAgICAgaWYgKHRoaXMuaXNOZXcoKSkgcmV0dXJuIGJhc2U7XG4gICAgICB2YXIgaWQgPSB0aGlzLmdldCh0aGlzLmlkQXR0cmlidXRlKTtcbiAgICAgIHJldHVybiBiYXNlLnJlcGxhY2UoL1teXFwvXSQvLCAnJCYvJykgKyBlbmNvZGVVUklDb21wb25lbnQoaWQpO1xuICAgIH0sXG5cbiAgICAvLyAqKnBhcnNlKiogY29udmVydHMgYSByZXNwb25zZSBpbnRvIHRoZSBoYXNoIG9mIGF0dHJpYnV0ZXMgdG8gYmUgYHNldGAgb25cbiAgICAvLyB0aGUgbW9kZWwuIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIGp1c3QgdG8gcGFzcyB0aGUgcmVzcG9uc2UgYWxvbmcuXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHJlc3AsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiByZXNwO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgbW9kZWwgd2l0aCBpZGVudGljYWwgYXR0cmlidXRlcyB0byB0aGlzIG9uZS5cbiAgICBjbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcy5hdHRyaWJ1dGVzKTtcbiAgICB9LFxuXG4gICAgLy8gQSBtb2RlbCBpcyBuZXcgaWYgaXQgaGFzIG5ldmVyIGJlZW4gc2F2ZWQgdG8gdGhlIHNlcnZlciwgYW5kIGxhY2tzIGFuIGlkLlxuICAgIGlzTmV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhdGhpcy5oYXModGhpcy5pZEF0dHJpYnV0ZSk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIHRoZSBtb2RlbCBpcyBjdXJyZW50bHkgaW4gYSB2YWxpZCBzdGF0ZS5cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmFsaWRhdGUoe30sIF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB7dmFsaWRhdGU6IHRydWV9KSk7XG4gICAgfSxcblxuICAgIC8vIFJ1biB2YWxpZGF0aW9uIGFnYWluc3QgdGhlIG5leHQgY29tcGxldGUgc2V0IG9mIG1vZGVsIGF0dHJpYnV0ZXMsXG4gICAgLy8gcmV0dXJuaW5nIGB0cnVlYCBpZiBhbGwgaXMgd2VsbC4gT3RoZXJ3aXNlLCBmaXJlIGFuIGBcImludmFsaWRcImAgZXZlbnQuXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbihhdHRycywgb3B0aW9ucykge1xuICAgICAgaWYgKCFvcHRpb25zLnZhbGlkYXRlIHx8ICF0aGlzLnZhbGlkYXRlKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGF0dHJzID0gXy5leHRlbmQoe30sIHRoaXMuYXR0cmlidXRlcywgYXR0cnMpO1xuICAgICAgdmFyIGVycm9yID0gdGhpcy52YWxpZGF0aW9uRXJyb3IgPSB0aGlzLnZhbGlkYXRlKGF0dHJzLCBvcHRpb25zKSB8fCBudWxsO1xuICAgICAgaWYgKCFlcnJvcikgcmV0dXJuIHRydWU7XG4gICAgICB0aGlzLnRyaWdnZXIoJ2ludmFsaWQnLCB0aGlzLCBlcnJvciwgXy5leHRlbmQob3B0aW9ucywge3ZhbGlkYXRpb25FcnJvcjogZXJyb3J9KSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIFVuZGVyc2NvcmUgbWV0aG9kcyB0aGF0IHdlIHdhbnQgdG8gaW1wbGVtZW50IG9uIHRoZSBNb2RlbCwgbWFwcGVkIHRvIHRoZVxuICAvLyBudW1iZXIgb2YgYXJndW1lbnRzIHRoZXkgdGFrZS5cbiAgdmFyIG1vZGVsTWV0aG9kcyA9IHtrZXlzOiAxLCB2YWx1ZXM6IDEsIHBhaXJzOiAxLCBpbnZlcnQ6IDEsIHBpY2s6IDAsXG4gICAgICBvbWl0OiAwLCBjaGFpbjogMSwgaXNFbXB0eTogMX07XG5cbiAgLy8gTWl4IGluIGVhY2ggVW5kZXJzY29yZSBtZXRob2QgYXMgYSBwcm94eSB0byBgTW9kZWwjYXR0cmlidXRlc2AuXG4gIGFkZFVuZGVyc2NvcmVNZXRob2RzKE1vZGVsLCBtb2RlbE1ldGhvZHMsICdhdHRyaWJ1dGVzJyk7XG5cbiAgLy8gQmFja2JvbmUuQ29sbGVjdGlvblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSWYgbW9kZWxzIHRlbmQgdG8gcmVwcmVzZW50IGEgc2luZ2xlIHJvdyBvZiBkYXRhLCBhIEJhY2tib25lIENvbGxlY3Rpb24gaXNcbiAgLy8gbW9yZSBhbmFsb2dvdXMgdG8gYSB0YWJsZSBmdWxsIG9mIGRhdGEgLi4uIG9yIGEgc21hbGwgc2xpY2Ugb3IgcGFnZSBvZiB0aGF0XG4gIC8vIHRhYmxlLCBvciBhIGNvbGxlY3Rpb24gb2Ygcm93cyB0aGF0IGJlbG9uZyB0b2dldGhlciBmb3IgYSBwYXJ0aWN1bGFyIHJlYXNvblxuICAvLyAtLSBhbGwgb2YgdGhlIG1lc3NhZ2VzIGluIHRoaXMgcGFydGljdWxhciBmb2xkZXIsIGFsbCBvZiB0aGUgZG9jdW1lbnRzXG4gIC8vIGJlbG9uZ2luZyB0byB0aGlzIHBhcnRpY3VsYXIgYXV0aG9yLCBhbmQgc28gb24uIENvbGxlY3Rpb25zIG1haW50YWluXG4gIC8vIGluZGV4ZXMgb2YgdGhlaXIgbW9kZWxzLCBib3RoIGluIG9yZGVyLCBhbmQgZm9yIGxvb2t1cCBieSBgaWRgLlxuXG4gIC8vIENyZWF0ZSBhIG5ldyAqKkNvbGxlY3Rpb24qKiwgcGVyaGFwcyB0byBjb250YWluIGEgc3BlY2lmaWMgdHlwZSBvZiBgbW9kZWxgLlxuICAvLyBJZiBhIGBjb21wYXJhdG9yYCBpcyBzcGVjaWZpZWQsIHRoZSBDb2xsZWN0aW9uIHdpbGwgbWFpbnRhaW5cbiAgLy8gaXRzIG1vZGVscyBpbiBzb3J0IG9yZGVyLCBhcyB0aGV5J3JlIGFkZGVkIGFuZCByZW1vdmVkLlxuICB2YXIgQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24gPSBmdW5jdGlvbihtb2RlbHMsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIGlmIChvcHRpb25zLm1vZGVsKSB0aGlzLm1vZGVsID0gb3B0aW9ucy5tb2RlbDtcbiAgICBpZiAob3B0aW9ucy5jb21wYXJhdG9yICE9PSB2b2lkIDApIHRoaXMuY29tcGFyYXRvciA9IG9wdGlvbnMuY29tcGFyYXRvcjtcbiAgICB0aGlzLl9yZXNldCgpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChtb2RlbHMpIHRoaXMucmVzZXQobW9kZWxzLCBfLmV4dGVuZCh7c2lsZW50OiB0cnVlfSwgb3B0aW9ucykpO1xuICB9O1xuXG4gIC8vIERlZmF1bHQgb3B0aW9ucyBmb3IgYENvbGxlY3Rpb24jc2V0YC5cbiAgdmFyIHNldE9wdGlvbnMgPSB7YWRkOiB0cnVlLCByZW1vdmU6IHRydWUsIG1lcmdlOiB0cnVlfTtcbiAgdmFyIGFkZE9wdGlvbnMgPSB7YWRkOiB0cnVlLCByZW1vdmU6IGZhbHNlfTtcblxuICAvLyBTcGxpY2VzIGBpbnNlcnRgIGludG8gYGFycmF5YCBhdCBpbmRleCBgYXRgLlxuICB2YXIgc3BsaWNlID0gZnVuY3Rpb24oYXJyYXksIGluc2VydCwgYXQpIHtcbiAgICBhdCA9IE1hdGgubWluKE1hdGgubWF4KGF0LCAwKSwgYXJyYXkubGVuZ3RoKTtcbiAgICB2YXIgdGFpbCA9IEFycmF5KGFycmF5Lmxlbmd0aCAtIGF0KTtcbiAgICB2YXIgbGVuZ3RoID0gaW5zZXJ0Lmxlbmd0aDtcbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGFpbC5sZW5ndGg7IGkrKykgdGFpbFtpXSA9IGFycmF5W2kgKyBhdF07XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSBhcnJheVtpICsgYXRdID0gaW5zZXJ0W2ldO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0YWlsLmxlbmd0aDsgaSsrKSBhcnJheVtpICsgbGVuZ3RoICsgYXRdID0gdGFpbFtpXTtcbiAgfTtcblxuICAvLyBEZWZpbmUgdGhlIENvbGxlY3Rpb24ncyBpbmhlcml0YWJsZSBtZXRob2RzLlxuICBfLmV4dGVuZChDb2xsZWN0aW9uLnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cbiAgICAvLyBUaGUgZGVmYXVsdCBtb2RlbCBmb3IgYSBjb2xsZWN0aW9uIGlzIGp1c3QgYSAqKkJhY2tib25lLk1vZGVsKiouXG4gICAgLy8gVGhpcyBzaG91bGQgYmUgb3ZlcnJpZGRlbiBpbiBtb3N0IGNhc2VzLlxuICAgIG1vZGVsOiBNb2RlbCxcblxuICAgIC8vIEluaXRpYWxpemUgaXMgYW4gZW1wdHkgZnVuY3Rpb24gYnkgZGVmYXVsdC4gT3ZlcnJpZGUgaXQgd2l0aCB5b3VyIG93blxuICAgIC8vIGluaXRpYWxpemF0aW9uIGxvZ2ljLlxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcblxuICAgIC8vIFRoZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIGEgQ29sbGVjdGlvbiBpcyBhbiBhcnJheSBvZiB0aGVcbiAgICAvLyBtb2RlbHMnIGF0dHJpYnV0ZXMuXG4gICAgdG9KU09OOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24obW9kZWwpIHsgcmV0dXJuIG1vZGVsLnRvSlNPTihvcHRpb25zKTsgfSk7XG4gICAgfSxcblxuICAgIC8vIFByb3h5IGBCYWNrYm9uZS5zeW5jYCBieSBkZWZhdWx0LlxuICAgIHN5bmM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEJhY2tib25lLnN5bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgbW9kZWwsIG9yIGxpc3Qgb2YgbW9kZWxzIHRvIHRoZSBzZXQuIGBtb2RlbHNgIG1heSBiZSBCYWNrYm9uZVxuICAgIC8vIE1vZGVscyBvciByYXcgSmF2YVNjcmlwdCBvYmplY3RzIHRvIGJlIGNvbnZlcnRlZCB0byBNb2RlbHMsIG9yIGFueVxuICAgIC8vIGNvbWJpbmF0aW9uIG9mIHRoZSB0d28uXG4gICAgYWRkOiBmdW5jdGlvbihtb2RlbHMsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldChtb2RlbHMsIF8uZXh0ZW5kKHttZXJnZTogZmFsc2V9LCBvcHRpb25zLCBhZGRPcHRpb25zKSk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBhIG1vZGVsLCBvciBhIGxpc3Qgb2YgbW9kZWxzIGZyb20gdGhlIHNldC5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zKTtcbiAgICAgIHZhciBzaW5ndWxhciA9ICFfLmlzQXJyYXkobW9kZWxzKTtcbiAgICAgIG1vZGVscyA9IHNpbmd1bGFyID8gW21vZGVsc10gOiBtb2RlbHMuc2xpY2UoKTtcbiAgICAgIHZhciByZW1vdmVkID0gdGhpcy5fcmVtb3ZlTW9kZWxzKG1vZGVscywgb3B0aW9ucyk7XG4gICAgICBpZiAoIW9wdGlvbnMuc2lsZW50ICYmIHJlbW92ZWQubGVuZ3RoKSB7XG4gICAgICAgIG9wdGlvbnMuY2hhbmdlcyA9IHthZGRlZDogW10sIG1lcmdlZDogW10sIHJlbW92ZWQ6IHJlbW92ZWR9O1xuICAgICAgICB0aGlzLnRyaWdnZXIoJ3VwZGF0ZScsIHRoaXMsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNpbmd1bGFyID8gcmVtb3ZlZFswXSA6IHJlbW92ZWQ7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSBhIGNvbGxlY3Rpb24gYnkgYHNldGAtaW5nIGEgbmV3IGxpc3Qgb2YgbW9kZWxzLCBhZGRpbmcgbmV3IG9uZXMsXG4gICAgLy8gcmVtb3ZpbmcgbW9kZWxzIHRoYXQgYXJlIG5vIGxvbmdlciBwcmVzZW50LCBhbmQgbWVyZ2luZyBtb2RlbHMgdGhhdFxuICAgIC8vIGFscmVhZHkgZXhpc3QgaW4gdGhlIGNvbGxlY3Rpb24sIGFzIG5lY2Vzc2FyeS4gU2ltaWxhciB0byAqKk1vZGVsI3NldCoqLFxuICAgIC8vIHRoZSBjb3JlIG9wZXJhdGlvbiBmb3IgdXBkYXRpbmcgdGhlIGRhdGEgY29udGFpbmVkIGJ5IHRoZSBjb2xsZWN0aW9uLlxuICAgIHNldDogZnVuY3Rpb24obW9kZWxzLCBvcHRpb25zKSB7XG4gICAgICBpZiAobW9kZWxzID09IG51bGwpIHJldHVybjtcblxuICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBzZXRPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgIGlmIChvcHRpb25zLnBhcnNlICYmICF0aGlzLl9pc01vZGVsKG1vZGVscykpIHtcbiAgICAgICAgbW9kZWxzID0gdGhpcy5wYXJzZShtb2RlbHMsIG9wdGlvbnMpIHx8IFtdO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2luZ3VsYXIgPSAhXy5pc0FycmF5KG1vZGVscyk7XG4gICAgICBtb2RlbHMgPSBzaW5ndWxhciA/IFttb2RlbHNdIDogbW9kZWxzLnNsaWNlKCk7XG5cbiAgICAgIHZhciBhdCA9IG9wdGlvbnMuYXQ7XG4gICAgICBpZiAoYXQgIT0gbnVsbCkgYXQgPSArYXQ7XG4gICAgICBpZiAoYXQgPiB0aGlzLmxlbmd0aCkgYXQgPSB0aGlzLmxlbmd0aDtcbiAgICAgIGlmIChhdCA8IDApIGF0ICs9IHRoaXMubGVuZ3RoICsgMTtcblxuICAgICAgdmFyIHNldCA9IFtdO1xuICAgICAgdmFyIHRvQWRkID0gW107XG4gICAgICB2YXIgdG9NZXJnZSA9IFtdO1xuICAgICAgdmFyIHRvUmVtb3ZlID0gW107XG4gICAgICB2YXIgbW9kZWxNYXAgPSB7fTtcblxuICAgICAgdmFyIGFkZCA9IG9wdGlvbnMuYWRkO1xuICAgICAgdmFyIG1lcmdlID0gb3B0aW9ucy5tZXJnZTtcbiAgICAgIHZhciByZW1vdmUgPSBvcHRpb25zLnJlbW92ZTtcblxuICAgICAgdmFyIHNvcnQgPSBmYWxzZTtcbiAgICAgIHZhciBzb3J0YWJsZSA9IHRoaXMuY29tcGFyYXRvciAmJiBhdCA9PSBudWxsICYmIG9wdGlvbnMuc29ydCAhPT0gZmFsc2U7XG4gICAgICB2YXIgc29ydEF0dHIgPSBfLmlzU3RyaW5nKHRoaXMuY29tcGFyYXRvcikgPyB0aGlzLmNvbXBhcmF0b3IgOiBudWxsO1xuXG4gICAgICAvLyBUdXJuIGJhcmUgb2JqZWN0cyBpbnRvIG1vZGVsIHJlZmVyZW5jZXMsIGFuZCBwcmV2ZW50IGludmFsaWQgbW9kZWxzXG4gICAgICAvLyBmcm9tIGJlaW5nIGFkZGVkLlxuICAgICAgdmFyIG1vZGVsLCBpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG1vZGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBtb2RlbCA9IG1vZGVsc1tpXTtcblxuICAgICAgICAvLyBJZiBhIGR1cGxpY2F0ZSBpcyBmb3VuZCwgcHJldmVudCBpdCBmcm9tIGJlaW5nIGFkZGVkIGFuZFxuICAgICAgICAvLyBvcHRpb25hbGx5IG1lcmdlIGl0IGludG8gdGhlIGV4aXN0aW5nIG1vZGVsLlxuICAgICAgICB2YXIgZXhpc3RpbmcgPSB0aGlzLmdldChtb2RlbCk7XG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgIGlmIChtZXJnZSAmJiBtb2RlbCAhPT0gZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIHZhciBhdHRycyA9IHRoaXMuX2lzTW9kZWwobW9kZWwpID8gbW9kZWwuYXR0cmlidXRlcyA6IG1vZGVsO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMucGFyc2UpIGF0dHJzID0gZXhpc3RpbmcucGFyc2UoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgZXhpc3Rpbmcuc2V0KGF0dHJzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHRvTWVyZ2UucHVzaChleGlzdGluZyk7XG4gICAgICAgICAgICBpZiAoc29ydGFibGUgJiYgIXNvcnQpIHNvcnQgPSBleGlzdGluZy5oYXNDaGFuZ2VkKHNvcnRBdHRyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFtb2RlbE1hcFtleGlzdGluZy5jaWRdKSB7XG4gICAgICAgICAgICBtb2RlbE1hcFtleGlzdGluZy5jaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldC5wdXNoKGV4aXN0aW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbW9kZWxzW2ldID0gZXhpc3Rpbmc7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldywgdmFsaWQgbW9kZWwsIHB1c2ggaXQgdG8gdGhlIGB0b0FkZGAgbGlzdC5cbiAgICAgICAgfSBlbHNlIGlmIChhZGQpIHtcbiAgICAgICAgICBtb2RlbCA9IG1vZGVsc1tpXSA9IHRoaXMuX3ByZXBhcmVNb2RlbChtb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgICAgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgICB0b0FkZC5wdXNoKG1vZGVsKTtcbiAgICAgICAgICAgIHRoaXMuX2FkZFJlZmVyZW5jZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBtb2RlbE1hcFttb2RlbC5jaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldC5wdXNoKG1vZGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIHN0YWxlIG1vZGVscy5cbiAgICAgIGlmIChyZW1vdmUpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBtb2RlbCA9IHRoaXMubW9kZWxzW2ldO1xuICAgICAgICAgIGlmICghbW9kZWxNYXBbbW9kZWwuY2lkXSkgdG9SZW1vdmUucHVzaChtb2RlbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvUmVtb3ZlLmxlbmd0aCkgdGhpcy5fcmVtb3ZlTW9kZWxzKHRvUmVtb3ZlLCBvcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VlIGlmIHNvcnRpbmcgaXMgbmVlZGVkLCB1cGRhdGUgYGxlbmd0aGAgYW5kIHNwbGljZSBpbiBuZXcgbW9kZWxzLlxuICAgICAgdmFyIG9yZGVyQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgdmFyIHJlcGxhY2UgPSAhc29ydGFibGUgJiYgYWRkICYmIHJlbW92ZTtcbiAgICAgIGlmIChzZXQubGVuZ3RoICYmIHJlcGxhY2UpIHtcbiAgICAgICAgb3JkZXJDaGFuZ2VkID0gdGhpcy5sZW5ndGggIT09IHNldC5sZW5ndGggfHwgXy5zb21lKHRoaXMubW9kZWxzLCBmdW5jdGlvbihtLCBpbmRleCkge1xuICAgICAgICAgIHJldHVybiBtICE9PSBzZXRbaW5kZXhdO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5tb2RlbHMubGVuZ3RoID0gMDtcbiAgICAgICAgc3BsaWNlKHRoaXMubW9kZWxzLCBzZXQsIDApO1xuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubW9kZWxzLmxlbmd0aDtcbiAgICAgIH0gZWxzZSBpZiAodG9BZGQubGVuZ3RoKSB7XG4gICAgICAgIGlmIChzb3J0YWJsZSkgc29ydCA9IHRydWU7XG4gICAgICAgIHNwbGljZSh0aGlzLm1vZGVscywgdG9BZGQsIGF0ID09IG51bGwgPyB0aGlzLmxlbmd0aCA6IGF0KTtcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLm1vZGVscy5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbGVudGx5IHNvcnQgdGhlIGNvbGxlY3Rpb24gaWYgYXBwcm9wcmlhdGUuXG4gICAgICBpZiAoc29ydCkgdGhpcy5zb3J0KHtzaWxlbnQ6IHRydWV9KTtcblxuICAgICAgLy8gVW5sZXNzIHNpbGVuY2VkLCBpdCdzIHRpbWUgdG8gZmlyZSBhbGwgYXBwcm9wcmlhdGUgYWRkL3NvcnQvdXBkYXRlIGV2ZW50cy5cbiAgICAgIGlmICghb3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRvQWRkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGF0ICE9IG51bGwpIG9wdGlvbnMuaW5kZXggPSBhdCArIGk7XG4gICAgICAgICAgbW9kZWwgPSB0b0FkZFtpXTtcbiAgICAgICAgICBtb2RlbC50cmlnZ2VyKCdhZGQnLCBtb2RlbCwgdGhpcywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNvcnQgfHwgb3JkZXJDaGFuZ2VkKSB0aGlzLnRyaWdnZXIoJ3NvcnQnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKHRvQWRkLmxlbmd0aCB8fCB0b1JlbW92ZS5sZW5ndGggfHwgdG9NZXJnZS5sZW5ndGgpIHtcbiAgICAgICAgICBvcHRpb25zLmNoYW5nZXMgPSB7XG4gICAgICAgICAgICBhZGRlZDogdG9BZGQsXG4gICAgICAgICAgICByZW1vdmVkOiB0b1JlbW92ZSxcbiAgICAgICAgICAgIG1lcmdlZDogdG9NZXJnZVxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKCd1cGRhdGUnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gdGhlIGFkZGVkIChvciBtZXJnZWQpIG1vZGVsIChvciBtb2RlbHMpLlxuICAgICAgcmV0dXJuIHNpbmd1bGFyID8gbW9kZWxzWzBdIDogbW9kZWxzO1xuICAgIH0sXG5cbiAgICAvLyBXaGVuIHlvdSBoYXZlIG1vcmUgaXRlbXMgdGhhbiB5b3Ugd2FudCB0byBhZGQgb3IgcmVtb3ZlIGluZGl2aWR1YWxseSxcbiAgICAvLyB5b3UgY2FuIHJlc2V0IHRoZSBlbnRpcmUgc2V0IHdpdGggYSBuZXcgbGlzdCBvZiBtb2RlbHMsIHdpdGhvdXQgZmlyaW5nXG4gICAgLy8gYW55IGdyYW51bGFyIGBhZGRgIG9yIGByZW1vdmVgIGV2ZW50cy4gRmlyZXMgYHJlc2V0YCB3aGVuIGZpbmlzaGVkLlxuICAgIC8vIFVzZWZ1bCBmb3IgYnVsayBvcGVyYXRpb25zIGFuZCBvcHRpbWl6YXRpb25zLlxuICAgIHJlc2V0OiBmdW5jdGlvbihtb2RlbHMsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gXy5jbG9uZShvcHRpb25zKSA6IHt9O1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1vZGVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLl9yZW1vdmVSZWZlcmVuY2UodGhpcy5tb2RlbHNbaV0sIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5wcmV2aW91c01vZGVscyA9IHRoaXMubW9kZWxzO1xuICAgICAgdGhpcy5fcmVzZXQoKTtcbiAgICAgIG1vZGVscyA9IHRoaXMuYWRkKG1vZGVscywgXy5leHRlbmQoe3NpbGVudDogdHJ1ZX0sIG9wdGlvbnMpKTtcbiAgICAgIGlmICghb3B0aW9ucy5zaWxlbnQpIHRoaXMudHJpZ2dlcigncmVzZXQnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBtb2RlbHM7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIG1vZGVsIHRvIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgcHVzaDogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZChtb2RlbCwgXy5leHRlbmQoe2F0OiB0aGlzLmxlbmd0aH0sIG9wdGlvbnMpKTtcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIGEgbW9kZWwgZnJvbSB0aGUgZW5kIG9mIHRoZSBjb2xsZWN0aW9uLlxuICAgIHBvcDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIG1vZGVsID0gdGhpcy5hdCh0aGlzLmxlbmd0aCAtIDEpO1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlKG1vZGVsLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgbW9kZWwgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgY29sbGVjdGlvbi5cbiAgICB1bnNoaWZ0OiBmdW5jdGlvbihtb2RlbCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkKG1vZGVsLCBfLmV4dGVuZCh7YXQ6IDB9LCBvcHRpb25zKSk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBhIG1vZGVsIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgY29sbGVjdGlvbi5cbiAgICBzaGlmdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIG1vZGVsID0gdGhpcy5hdCgwKTtcbiAgICAgIHJldHVybiB0aGlzLnJlbW92ZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8vIFNsaWNlIG91dCBhIHN1Yi1hcnJheSBvZiBtb2RlbHMgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICBzbGljZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2xpY2UuYXBwbHkodGhpcy5tb2RlbHMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIG1vZGVsIGZyb20gdGhlIHNldCBieSBpZCwgY2lkLCBtb2RlbCBvYmplY3Qgd2l0aCBpZCBvciBjaWRcbiAgICAvLyBwcm9wZXJ0aWVzLCBvciBhbiBhdHRyaWJ1dGVzIG9iamVjdCB0aGF0IGlzIHRyYW5zZm9ybWVkIHRocm91Z2ggbW9kZWxJZC5cbiAgICBnZXQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgICAgcmV0dXJuIHRoaXMuX2J5SWRbb2JqXSB8fFxuICAgICAgICB0aGlzLl9ieUlkW3RoaXMubW9kZWxJZChvYmouYXR0cmlidXRlcyB8fCBvYmopXSB8fFxuICAgICAgICBvYmouY2lkICYmIHRoaXMuX2J5SWRbb2JqLmNpZF07XG4gICAgfSxcblxuICAgIC8vIFJldHVybnMgYHRydWVgIGlmIHRoZSBtb2RlbCBpcyBpbiB0aGUgY29sbGVjdGlvbi5cbiAgICBoYXM6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KG9iaikgIT0gbnVsbDtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBtb2RlbCBhdCB0aGUgZ2l2ZW4gaW5kZXguXG4gICAgYXQ6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICBpZiAoaW5kZXggPCAwKSBpbmRleCArPSB0aGlzLmxlbmd0aDtcbiAgICAgIHJldHVybiB0aGlzLm1vZGVsc1tpbmRleF07XG4gICAgfSxcblxuICAgIC8vIFJldHVybiBtb2RlbHMgd2l0aCBtYXRjaGluZyBhdHRyaWJ1dGVzLiBVc2VmdWwgZm9yIHNpbXBsZSBjYXNlcyBvZlxuICAgIC8vIGBmaWx0ZXJgLlxuICAgIHdoZXJlOiBmdW5jdGlvbihhdHRycywgZmlyc3QpIHtcbiAgICAgIHJldHVybiB0aGlzW2ZpcnN0ID8gJ2ZpbmQnIDogJ2ZpbHRlciddKGF0dHJzKTtcbiAgICB9LFxuXG4gICAgLy8gUmV0dXJuIHRoZSBmaXJzdCBtb2RlbCB3aXRoIG1hdGNoaW5nIGF0dHJpYnV0ZXMuIFVzZWZ1bCBmb3Igc2ltcGxlIGNhc2VzXG4gICAgLy8gb2YgYGZpbmRgLlxuICAgIGZpbmRXaGVyZTogZnVuY3Rpb24oYXR0cnMpIHtcbiAgICAgIHJldHVybiB0aGlzLndoZXJlKGF0dHJzLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgLy8gRm9yY2UgdGhlIGNvbGxlY3Rpb24gdG8gcmUtc29ydCBpdHNlbGYuIFlvdSBkb24ndCBuZWVkIHRvIGNhbGwgdGhpcyB1bmRlclxuICAgIC8vIG5vcm1hbCBjaXJjdW1zdGFuY2VzLCBhcyB0aGUgc2V0IHdpbGwgbWFpbnRhaW4gc29ydCBvcmRlciBhcyBlYWNoIGl0ZW1cbiAgICAvLyBpcyBhZGRlZC5cbiAgICBzb3J0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgY29tcGFyYXRvciA9IHRoaXMuY29tcGFyYXRvcjtcbiAgICAgIGlmICghY29tcGFyYXRvcikgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc29ydCBhIHNldCB3aXRob3V0IGEgY29tcGFyYXRvcicpO1xuICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgICAgdmFyIGxlbmd0aCA9IGNvbXBhcmF0b3IubGVuZ3RoO1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihjb21wYXJhdG9yKSkgY29tcGFyYXRvciA9IF8uYmluZChjb21wYXJhdG9yLCB0aGlzKTtcblxuICAgICAgLy8gUnVuIHNvcnQgYmFzZWQgb24gdHlwZSBvZiBgY29tcGFyYXRvcmAuXG4gICAgICBpZiAobGVuZ3RoID09PSAxIHx8IF8uaXNTdHJpbmcoY29tcGFyYXRvcikpIHtcbiAgICAgICAgdGhpcy5tb2RlbHMgPSB0aGlzLnNvcnRCeShjb21wYXJhdG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW9kZWxzLnNvcnQoY29tcGFyYXRvcik7XG4gICAgICB9XG4gICAgICBpZiAoIW9wdGlvbnMuc2lsZW50KSB0aGlzLnRyaWdnZXIoJ3NvcnQnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBQbHVjayBhbiBhdHRyaWJ1dGUgZnJvbSBlYWNoIG1vZGVsIGluIHRoZSBjb2xsZWN0aW9uLlxuICAgIHBsdWNrOiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoYXR0ciArICcnKTtcbiAgICB9LFxuXG4gICAgLy8gRmV0Y2ggdGhlIGRlZmF1bHQgc2V0IG9mIG1vZGVscyBmb3IgdGhpcyBjb2xsZWN0aW9uLCByZXNldHRpbmcgdGhlXG4gICAgLy8gY29sbGVjdGlvbiB3aGVuIHRoZXkgYXJyaXZlLiBJZiBgcmVzZXQ6IHRydWVgIGlzIHBhc3NlZCwgdGhlIHJlc3BvbnNlXG4gICAgLy8gZGF0YSB3aWxsIGJlIHBhc3NlZCB0aHJvdWdoIHRoZSBgcmVzZXRgIG1ldGhvZCBpbnN0ZWFkIG9mIGBzZXRgLlxuICAgIGZldGNoOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gXy5leHRlbmQoe3BhcnNlOiB0cnVlfSwgb3B0aW9ucyk7XG4gICAgICB2YXIgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2VzcztcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gdGhpcztcbiAgICAgIG9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgdmFyIG1ldGhvZCA9IG9wdGlvbnMucmVzZXQgPyAncmVzZXQnIDogJ3NldCc7XG4gICAgICAgIGNvbGxlY3Rpb25bbWV0aG9kXShyZXNwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHN1Y2Nlc3MuY2FsbChvcHRpb25zLmNvbnRleHQsIGNvbGxlY3Rpb24sIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgICBjb2xsZWN0aW9uLnRyaWdnZXIoJ3N5bmMnLCBjb2xsZWN0aW9uLCByZXNwLCBvcHRpb25zKTtcbiAgICAgIH07XG4gICAgICB3cmFwRXJyb3IodGhpcywgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gdGhpcy5zeW5jKCdyZWFkJywgdGhpcywgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIG1vZGVsIGluIHRoaXMgY29sbGVjdGlvbi4gQWRkIHRoZSBtb2RlbCB0byB0aGVcbiAgICAvLyBjb2xsZWN0aW9uIGltbWVkaWF0ZWx5LCB1bmxlc3MgYHdhaXQ6IHRydWVgIGlzIHBhc3NlZCwgaW4gd2hpY2ggY2FzZSB3ZVxuICAgIC8vIHdhaXQgZm9yIHRoZSBzZXJ2ZXIgdG8gYWdyZWUuXG4gICAgY3JlYXRlOiBmdW5jdGlvbihtb2RlbCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG4gICAgICB2YXIgd2FpdCA9IG9wdGlvbnMud2FpdDtcbiAgICAgIG1vZGVsID0gdGhpcy5fcHJlcGFyZU1vZGVsKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgIGlmICghbW9kZWwpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghd2FpdCkgdGhpcy5hZGQobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzO1xuICAgICAgdmFyIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3M7XG4gICAgICBvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihtLCByZXNwLCBjYWxsYmFja09wdHMpIHtcbiAgICAgICAgaWYgKHdhaXQpIGNvbGxlY3Rpb24uYWRkKG0sIGNhbGxiYWNrT3B0cyk7XG4gICAgICAgIGlmIChzdWNjZXNzKSBzdWNjZXNzLmNhbGwoY2FsbGJhY2tPcHRzLmNvbnRleHQsIG0sIHJlc3AsIGNhbGxiYWNrT3B0cyk7XG4gICAgICB9O1xuICAgICAgbW9kZWwuc2F2ZShudWxsLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBtb2RlbDtcbiAgICB9LFxuXG4gICAgLy8gKipwYXJzZSoqIGNvbnZlcnRzIGEgcmVzcG9uc2UgaW50byBhIGxpc3Qgb2YgbW9kZWxzIHRvIGJlIGFkZGVkIHRvIHRoZVxuICAgIC8vIGNvbGxlY3Rpb24uIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIGp1c3QgdG8gcGFzcyBpdCB0aHJvdWdoLlxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gcmVzcDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IGNvbGxlY3Rpb24gd2l0aCBhbiBpZGVudGljYWwgbGlzdCBvZiBtb2RlbHMgYXMgdGhpcyBvbmUuXG4gICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMubW9kZWxzLCB7XG4gICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxuICAgICAgICBjb21wYXJhdG9yOiB0aGlzLmNvbXBhcmF0b3JcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBEZWZpbmUgaG93IHRvIHVuaXF1ZWx5IGlkZW50aWZ5IG1vZGVscyBpbiB0aGUgY29sbGVjdGlvbi5cbiAgICBtb2RlbElkOiBmdW5jdGlvbihhdHRycykge1xuICAgICAgcmV0dXJuIGF0dHJzW3RoaXMubW9kZWwucHJvdG90eXBlLmlkQXR0cmlidXRlIHx8ICdpZCddO1xuICAgIH0sXG5cbiAgICAvLyBQcml2YXRlIG1ldGhvZCB0byByZXNldCBhbGwgaW50ZXJuYWwgc3RhdGUuIENhbGxlZCB3aGVuIHRoZSBjb2xsZWN0aW9uXG4gICAgLy8gaXMgZmlyc3QgaW5pdGlhbGl6ZWQgb3IgcmVzZXQuXG4gICAgX3Jlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMubW9kZWxzID0gW107XG4gICAgICB0aGlzLl9ieUlkICA9IHt9O1xuICAgIH0sXG5cbiAgICAvLyBQcmVwYXJlIGEgaGFzaCBvZiBhdHRyaWJ1dGVzIChvciBvdGhlciBtb2RlbCkgdG8gYmUgYWRkZWQgdG8gdGhpc1xuICAgIC8vIGNvbGxlY3Rpb24uXG4gICAgX3ByZXBhcmVNb2RlbDogZnVuY3Rpb24oYXR0cnMsIG9wdGlvbnMpIHtcbiAgICAgIGlmICh0aGlzLl9pc01vZGVsKGF0dHJzKSkge1xuICAgICAgICBpZiAoIWF0dHJzLmNvbGxlY3Rpb24pIGF0dHJzLmNvbGxlY3Rpb24gPSB0aGlzO1xuICAgICAgICByZXR1cm4gYXR0cnM7XG4gICAgICB9XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IF8uY2xvbmUob3B0aW9ucykgOiB7fTtcbiAgICAgIG9wdGlvbnMuY29sbGVjdGlvbiA9IHRoaXM7XG4gICAgICB2YXIgbW9kZWwgPSBuZXcgdGhpcy5tb2RlbChhdHRycywgb3B0aW9ucyk7XG4gICAgICBpZiAoIW1vZGVsLnZhbGlkYXRpb25FcnJvcikgcmV0dXJuIG1vZGVsO1xuICAgICAgdGhpcy50cmlnZ2VyKCdpbnZhbGlkJywgdGhpcywgbW9kZWwudmFsaWRhdGlvbkVycm9yLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gSW50ZXJuYWwgbWV0aG9kIGNhbGxlZCBieSBib3RoIHJlbW92ZSBhbmQgc2V0LlxuICAgIF9yZW1vdmVNb2RlbHM6IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgICAgdmFyIHJlbW92ZWQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMuZ2V0KG1vZGVsc1tpXSk7XG4gICAgICAgIGlmICghbW9kZWwpIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuaW5kZXhPZihtb2RlbCk7XG4gICAgICAgIHRoaXMubW9kZWxzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHJlZmVyZW5jZXMgYmVmb3JlIHRyaWdnZXJpbmcgJ3JlbW92ZScgZXZlbnQgdG8gcHJldmVudCBhblxuICAgICAgICAvLyBpbmZpbml0ZSBsb29wLiAjMzY5M1xuICAgICAgICBkZWxldGUgdGhpcy5fYnlJZFttb2RlbC5jaWRdO1xuICAgICAgICB2YXIgaWQgPSB0aGlzLm1vZGVsSWQobW9kZWwuYXR0cmlidXRlcyk7XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSBkZWxldGUgdGhpcy5fYnlJZFtpZF07XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgIG9wdGlvbnMuaW5kZXggPSBpbmRleDtcbiAgICAgICAgICBtb2RlbC50cmlnZ2VyKCdyZW1vdmUnLCBtb2RlbCwgdGhpcywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVkLnB1c2gobW9kZWwpO1xuICAgICAgICB0aGlzLl9yZW1vdmVSZWZlcmVuY2UobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbW92ZWQ7XG4gICAgfSxcblxuICAgIC8vIE1ldGhvZCBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3Qgc2hvdWxkIGJlIGNvbnNpZGVyZWQgYSBtb2RlbCBmb3JcbiAgICAvLyB0aGUgcHVycG9zZXMgb2YgYWRkaW5nIHRvIHRoZSBjb2xsZWN0aW9uLlxuICAgIF9pc01vZGVsOiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgcmV0dXJuIG1vZGVsIGluc3RhbmNlb2YgTW9kZWw7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG1ldGhvZCB0byBjcmVhdGUgYSBtb2RlbCdzIHRpZXMgdG8gYSBjb2xsZWN0aW9uLlxuICAgIF9hZGRSZWZlcmVuY2U6IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLl9ieUlkW21vZGVsLmNpZF0gPSBtb2RlbDtcbiAgICAgIHZhciBpZCA9IHRoaXMubW9kZWxJZChtb2RlbC5hdHRyaWJ1dGVzKTtcbiAgICAgIGlmIChpZCAhPSBudWxsKSB0aGlzLl9ieUlkW2lkXSA9IG1vZGVsO1xuICAgICAgbW9kZWwub24oJ2FsbCcsIHRoaXMuX29uTW9kZWxFdmVudCwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG1ldGhvZCB0byBzZXZlciBhIG1vZGVsJ3MgdGllcyB0byBhIGNvbGxlY3Rpb24uXG4gICAgX3JlbW92ZVJlZmVyZW5jZTogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ieUlkW21vZGVsLmNpZF07XG4gICAgICB2YXIgaWQgPSB0aGlzLm1vZGVsSWQobW9kZWwuYXR0cmlidXRlcyk7XG4gICAgICBpZiAoaWQgIT0gbnVsbCkgZGVsZXRlIHRoaXMuX2J5SWRbaWRdO1xuICAgICAgaWYgKHRoaXMgPT09IG1vZGVsLmNvbGxlY3Rpb24pIGRlbGV0ZSBtb2RlbC5jb2xsZWN0aW9uO1xuICAgICAgbW9kZWwub2ZmKCdhbGwnLCB0aGlzLl9vbk1vZGVsRXZlbnQsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBJbnRlcm5hbCBtZXRob2QgY2FsbGVkIGV2ZXJ5IHRpbWUgYSBtb2RlbCBpbiB0aGUgc2V0IGZpcmVzIGFuIGV2ZW50LlxuICAgIC8vIFNldHMgbmVlZCB0byB1cGRhdGUgdGhlaXIgaW5kZXhlcyB3aGVuIG1vZGVscyBjaGFuZ2UgaWRzLiBBbGwgb3RoZXJcbiAgICAvLyBldmVudHMgc2ltcGx5IHByb3h5IHRocm91Z2guIFwiYWRkXCIgYW5kIFwicmVtb3ZlXCIgZXZlbnRzIHRoYXQgb3JpZ2luYXRlXG4gICAgLy8gaW4gb3RoZXIgY29sbGVjdGlvbnMgYXJlIGlnbm9yZWQuXG4gICAgX29uTW9kZWxFdmVudDogZnVuY3Rpb24oZXZlbnQsIG1vZGVsLCBjb2xsZWN0aW9uLCBvcHRpb25zKSB7XG4gICAgICBpZiAobW9kZWwpIHtcbiAgICAgICAgaWYgKChldmVudCA9PT0gJ2FkZCcgfHwgZXZlbnQgPT09ICdyZW1vdmUnKSAmJiBjb2xsZWN0aW9uICE9PSB0aGlzKSByZXR1cm47XG4gICAgICAgIGlmIChldmVudCA9PT0gJ2Rlc3Ryb3knKSB0aGlzLnJlbW92ZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChldmVudCA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICB2YXIgcHJldklkID0gdGhpcy5tb2RlbElkKG1vZGVsLnByZXZpb3VzQXR0cmlidXRlcygpKTtcbiAgICAgICAgICB2YXIgaWQgPSB0aGlzLm1vZGVsSWQobW9kZWwuYXR0cmlidXRlcyk7XG4gICAgICAgICAgaWYgKHByZXZJZCAhPT0gaWQpIHtcbiAgICAgICAgICAgIGlmIChwcmV2SWQgIT0gbnVsbCkgZGVsZXRlIHRoaXMuX2J5SWRbcHJldklkXTtcbiAgICAgICAgICAgIGlmIChpZCAhPSBudWxsKSB0aGlzLl9ieUlkW2lkXSA9IG1vZGVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy50cmlnZ2VyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIFVuZGVyc2NvcmUgbWV0aG9kcyB0aGF0IHdlIHdhbnQgdG8gaW1wbGVtZW50IG9uIHRoZSBDb2xsZWN0aW9uLlxuICAvLyA5MCUgb2YgdGhlIGNvcmUgdXNlZnVsbmVzcyBvZiBCYWNrYm9uZSBDb2xsZWN0aW9ucyBpcyBhY3R1YWxseSBpbXBsZW1lbnRlZFxuICAvLyByaWdodCBoZXJlOlxuICB2YXIgY29sbGVjdGlvbk1ldGhvZHMgPSB7Zm9yRWFjaDogMywgZWFjaDogMywgbWFwOiAzLCBjb2xsZWN0OiAzLCByZWR1Y2U6IDAsXG4gICAgICBmb2xkbDogMCwgaW5qZWN0OiAwLCByZWR1Y2VSaWdodDogMCwgZm9sZHI6IDAsIGZpbmQ6IDMsIGRldGVjdDogMywgZmlsdGVyOiAzLFxuICAgICAgc2VsZWN0OiAzLCByZWplY3Q6IDMsIGV2ZXJ5OiAzLCBhbGw6IDMsIHNvbWU6IDMsIGFueTogMywgaW5jbHVkZTogMywgaW5jbHVkZXM6IDMsXG4gICAgICBjb250YWluczogMywgaW52b2tlOiAwLCBtYXg6IDMsIG1pbjogMywgdG9BcnJheTogMSwgc2l6ZTogMSwgZmlyc3Q6IDMsXG4gICAgICBoZWFkOiAzLCB0YWtlOiAzLCBpbml0aWFsOiAzLCByZXN0OiAzLCB0YWlsOiAzLCBkcm9wOiAzLCBsYXN0OiAzLFxuICAgICAgd2l0aG91dDogMCwgZGlmZmVyZW5jZTogMCwgaW5kZXhPZjogMywgc2h1ZmZsZTogMSwgbGFzdEluZGV4T2Y6IDMsXG4gICAgICBpc0VtcHR5OiAxLCBjaGFpbjogMSwgc2FtcGxlOiAzLCBwYXJ0aXRpb246IDMsIGdyb3VwQnk6IDMsIGNvdW50Qnk6IDMsXG4gICAgICBzb3J0Qnk6IDMsIGluZGV4Qnk6IDMsIGZpbmRJbmRleDogMywgZmluZExhc3RJbmRleDogM307XG5cbiAgLy8gTWl4IGluIGVhY2ggVW5kZXJzY29yZSBtZXRob2QgYXMgYSBwcm94eSB0byBgQ29sbGVjdGlvbiNtb2RlbHNgLlxuICBhZGRVbmRlcnNjb3JlTWV0aG9kcyhDb2xsZWN0aW9uLCBjb2xsZWN0aW9uTWV0aG9kcywgJ21vZGVscycpO1xuXG4gIC8vIEJhY2tib25lLlZpZXdcbiAgLy8gLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEJhY2tib25lIFZpZXdzIGFyZSBhbG1vc3QgbW9yZSBjb252ZW50aW9uIHRoYW4gdGhleSBhcmUgYWN0dWFsIGNvZGUuIEEgVmlld1xuICAvLyBpcyBzaW1wbHkgYSBKYXZhU2NyaXB0IG9iamVjdCB0aGF0IHJlcHJlc2VudHMgYSBsb2dpY2FsIGNodW5rIG9mIFVJIGluIHRoZVxuICAvLyBET00uIFRoaXMgbWlnaHQgYmUgYSBzaW5nbGUgaXRlbSwgYW4gZW50aXJlIGxpc3QsIGEgc2lkZWJhciBvciBwYW5lbCwgb3JcbiAgLy8gZXZlbiB0aGUgc3Vycm91bmRpbmcgZnJhbWUgd2hpY2ggd3JhcHMgeW91ciB3aG9sZSBhcHAuIERlZmluaW5nIGEgY2h1bmsgb2ZcbiAgLy8gVUkgYXMgYSAqKlZpZXcqKiBhbGxvd3MgeW91IHRvIGRlZmluZSB5b3VyIERPTSBldmVudHMgZGVjbGFyYXRpdmVseSwgd2l0aG91dFxuICAvLyBoYXZpbmcgdG8gd29ycnkgYWJvdXQgcmVuZGVyIG9yZGVyIC4uLiBhbmQgbWFrZXMgaXQgZWFzeSBmb3IgdGhlIHZpZXcgdG9cbiAgLy8gcmVhY3QgdG8gc3BlY2lmaWMgY2hhbmdlcyBpbiB0aGUgc3RhdGUgb2YgeW91ciBtb2RlbHMuXG5cbiAgLy8gQ3JlYXRpbmcgYSBCYWNrYm9uZS5WaWV3IGNyZWF0ZXMgaXRzIGluaXRpYWwgZWxlbWVudCBvdXRzaWRlIG9mIHRoZSBET00sXG4gIC8vIGlmIGFuIGV4aXN0aW5nIGVsZW1lbnQgaXMgbm90IHByb3ZpZGVkLi4uXG4gIHZhciBWaWV3ID0gQmFja2JvbmUuVmlldyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB0aGlzLmNpZCA9IF8udW5pcXVlSWQoJ3ZpZXcnKTtcbiAgICBfLmV4dGVuZCh0aGlzLCBfLnBpY2sob3B0aW9ucywgdmlld09wdGlvbnMpKTtcbiAgICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQ2FjaGVkIHJlZ2V4IHRvIHNwbGl0IGtleXMgZm9yIGBkZWxlZ2F0ZWAuXG4gIHZhciBkZWxlZ2F0ZUV2ZW50U3BsaXR0ZXIgPSAvXihcXFMrKVxccyooLiopJC87XG5cbiAgLy8gTGlzdCBvZiB2aWV3IG9wdGlvbnMgdG8gYmUgc2V0IGFzIHByb3BlcnRpZXMuXG4gIHZhciB2aWV3T3B0aW9ucyA9IFsnbW9kZWwnLCAnY29sbGVjdGlvbicsICdlbCcsICdpZCcsICdhdHRyaWJ1dGVzJywgJ2NsYXNzTmFtZScsICd0YWdOYW1lJywgJ2V2ZW50cyddO1xuXG4gIC8vIFNldCB1cCBhbGwgaW5oZXJpdGFibGUgKipCYWNrYm9uZS5WaWV3KiogcHJvcGVydGllcyBhbmQgbWV0aG9kcy5cbiAgXy5leHRlbmQoVmlldy5wcm90b3R5cGUsIEV2ZW50cywge1xuXG4gICAgLy8gVGhlIGRlZmF1bHQgYHRhZ05hbWVgIG9mIGEgVmlldydzIGVsZW1lbnQgaXMgYFwiZGl2XCJgLlxuICAgIHRhZ05hbWU6ICdkaXYnLFxuXG4gICAgLy8galF1ZXJ5IGRlbGVnYXRlIGZvciBlbGVtZW50IGxvb2t1cCwgc2NvcGVkIHRvIERPTSBlbGVtZW50cyB3aXRoaW4gdGhlXG4gICAgLy8gY3VycmVudCB2aWV3LiBUaGlzIHNob3VsZCBiZSBwcmVmZXJyZWQgdG8gZ2xvYmFsIGxvb2t1cHMgd2hlcmUgcG9zc2libGUuXG4gICAgJDogZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLiRlbC5maW5kKHNlbGVjdG9yKTtcbiAgICB9LFxuXG4gICAgLy8gSW5pdGlhbGl6ZSBpcyBhbiBlbXB0eSBmdW5jdGlvbiBieSBkZWZhdWx0LiBPdmVycmlkZSBpdCB3aXRoIHlvdXIgb3duXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gbG9naWMuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gICAgLy8gKipyZW5kZXIqKiBpcyB0aGUgY29yZSBmdW5jdGlvbiB0aGF0IHlvdXIgdmlldyBzaG91bGQgb3ZlcnJpZGUsIGluIG9yZGVyXG4gICAgLy8gdG8gcG9wdWxhdGUgaXRzIGVsZW1lbnQgKGB0aGlzLmVsYCksIHdpdGggdGhlIGFwcHJvcHJpYXRlIEhUTUwuIFRoZVxuICAgIC8vIGNvbnZlbnRpb24gaXMgZm9yICoqcmVuZGVyKiogdG8gYWx3YXlzIHJldHVybiBgdGhpc2AuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgdGhpcyB2aWV3IGJ5IHRha2luZyB0aGUgZWxlbWVudCBvdXQgb2YgdGhlIERPTSwgYW5kIHJlbW92aW5nIGFueVxuICAgIC8vIGFwcGxpY2FibGUgQmFja2JvbmUuRXZlbnRzIGxpc3RlbmVycy5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVtb3ZlRWxlbWVudCgpO1xuICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIHRoaXMgdmlldydzIGVsZW1lbnQgZnJvbSB0aGUgZG9jdW1lbnQgYW5kIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAgICAvLyBhdHRhY2hlZCB0byBpdC4gRXhwb3NlZCBmb3Igc3ViY2xhc3NlcyB1c2luZyBhbiBhbHRlcm5hdGl2ZSBET01cbiAgICAvLyBtYW5pcHVsYXRpb24gQVBJLlxuICAgIF9yZW1vdmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICAvLyBDaGFuZ2UgdGhlIHZpZXcncyBlbGVtZW50IChgdGhpcy5lbGAgcHJvcGVydHkpIGFuZCByZS1kZWxlZ2F0ZSB0aGVcbiAgICAvLyB2aWV3J3MgZXZlbnRzIG9uIHRoZSBuZXcgZWxlbWVudC5cbiAgICBzZXRFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgIHRoaXMuX3NldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICB0aGlzLmRlbGVnYXRlRXZlbnRzKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlcyB0aGUgYHRoaXMuZWxgIGFuZCBgdGhpcy4kZWxgIHJlZmVyZW5jZXMgZm9yIHRoaXMgdmlldyB1c2luZyB0aGVcbiAgICAvLyBnaXZlbiBgZWxgLiBgZWxgIGNhbiBiZSBhIENTUyBzZWxlY3RvciBvciBhbiBIVE1MIHN0cmluZywgYSBqUXVlcnlcbiAgICAvLyBjb250ZXh0IG9yIGFuIGVsZW1lbnQuIFN1YmNsYXNzZXMgY2FuIG92ZXJyaWRlIHRoaXMgdG8gdXRpbGl6ZSBhblxuICAgIC8vIGFsdGVybmF0aXZlIERPTSBtYW5pcHVsYXRpb24gQVBJIGFuZCBhcmUgb25seSByZXF1aXJlZCB0byBzZXQgdGhlXG4gICAgLy8gYHRoaXMuZWxgIHByb3BlcnR5LlxuICAgIF9zZXRFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgdGhpcy4kZWwgPSBlbCBpbnN0YW5jZW9mIEJhY2tib25lLiQgPyBlbCA6IEJhY2tib25lLiQoZWwpO1xuICAgICAgdGhpcy5lbCA9IHRoaXMuJGVsWzBdO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgY2FsbGJhY2tzLCB3aGVyZSBgdGhpcy5ldmVudHNgIGlzIGEgaGFzaCBvZlxuICAgIC8vXG4gICAgLy8gKntcImV2ZW50IHNlbGVjdG9yXCI6IFwiY2FsbGJhY2tcIn0qXG4gICAgLy9cbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgICdtb3VzZWRvd24gLnRpdGxlJzogICdlZGl0JyxcbiAgICAvLyAgICAgICAnY2xpY2sgLmJ1dHRvbic6ICAgICAnc2F2ZScsXG4gICAgLy8gICAgICAgJ2NsaWNrIC5vcGVuJzogICAgICAgZnVuY3Rpb24oZSkgeyAuLi4gfVxuICAgIC8vICAgICB9XG4gICAgLy9cbiAgICAvLyBwYWlycy4gQ2FsbGJhY2tzIHdpbGwgYmUgYm91bmQgdG8gdGhlIHZpZXcsIHdpdGggYHRoaXNgIHNldCBwcm9wZXJseS5cbiAgICAvLyBVc2VzIGV2ZW50IGRlbGVnYXRpb24gZm9yIGVmZmljaWVuY3kuXG4gICAgLy8gT21pdHRpbmcgdGhlIHNlbGVjdG9yIGJpbmRzIHRoZSBldmVudCB0byBgdGhpcy5lbGAuXG4gICAgZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgICAgZXZlbnRzIHx8IChldmVudHMgPSBfLnJlc3VsdCh0aGlzLCAnZXZlbnRzJykpO1xuICAgICAgaWYgKCFldmVudHMpIHJldHVybiB0aGlzO1xuICAgICAgdGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gZXZlbnRzKSB7XG4gICAgICAgIHZhciBtZXRob2QgPSBldmVudHNba2V5XTtcbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24obWV0aG9kKSkgbWV0aG9kID0gdGhpc1ttZXRob2RdO1xuICAgICAgICBpZiAoIW1ldGhvZCkgY29udGludWU7XG4gICAgICAgIHZhciBtYXRjaCA9IGtleS5tYXRjaChkZWxlZ2F0ZUV2ZW50U3BsaXR0ZXIpO1xuICAgICAgICB0aGlzLmRlbGVnYXRlKG1hdGNoWzFdLCBtYXRjaFsyXSwgXy5iaW5kKG1ldGhvZCwgdGhpcykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIHNpbmdsZSBldmVudCBsaXN0ZW5lciB0byB0aGUgdmlldydzIGVsZW1lbnQgKG9yIGEgY2hpbGQgZWxlbWVudFxuICAgIC8vIHVzaW5nIGBzZWxlY3RvcmApLiBUaGlzIG9ubHkgd29ya3MgZm9yIGRlbGVnYXRlLWFibGUgZXZlbnRzOiBub3QgYGZvY3VzYCxcbiAgICAvLyBgYmx1cmAsIGFuZCBub3QgYGNoYW5nZWAsIGBzdWJtaXRgLCBhbmQgYHJlc2V0YCBpbiBJbnRlcm5ldCBFeHBsb3Jlci5cbiAgICBkZWxlZ2F0ZTogZnVuY3Rpb24oZXZlbnROYW1lLCBzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgIHRoaXMuJGVsLm9uKGV2ZW50TmFtZSArICcuZGVsZWdhdGVFdmVudHMnICsgdGhpcy5jaWQsIHNlbGVjdG9yLCBsaXN0ZW5lcik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQ2xlYXJzIGFsbCBjYWxsYmFja3MgcHJldmlvdXNseSBib3VuZCB0byB0aGUgdmlldyBieSBgZGVsZWdhdGVFdmVudHNgLlxuICAgIC8vIFlvdSB1c3VhbGx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMsIGJ1dCBtYXkgd2lzaCB0byBpZiB5b3UgaGF2ZSBtdWx0aXBsZVxuICAgIC8vIEJhY2tib25lIHZpZXdzIGF0dGFjaGVkIHRvIHRoZSBzYW1lIERPTSBlbGVtZW50LlxuICAgIHVuZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuJGVsKSB0aGlzLiRlbC5vZmYoJy5kZWxlZ2F0ZUV2ZW50cycgKyB0aGlzLmNpZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQSBmaW5lci1ncmFpbmVkIGB1bmRlbGVnYXRlRXZlbnRzYCBmb3IgcmVtb3ZpbmcgYSBzaW5nbGUgZGVsZWdhdGVkIGV2ZW50LlxuICAgIC8vIGBzZWxlY3RvcmAgYW5kIGBsaXN0ZW5lcmAgYXJlIGJvdGggb3B0aW9uYWwuXG4gICAgdW5kZWxlZ2F0ZTogZnVuY3Rpb24oZXZlbnROYW1lLCBzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgIHRoaXMuJGVsLm9mZihldmVudE5hbWUgKyAnLmRlbGVnYXRlRXZlbnRzJyArIHRoaXMuY2lkLCBzZWxlY3RvciwgbGlzdGVuZXIpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFByb2R1Y2VzIGEgRE9NIGVsZW1lbnQgdG8gYmUgYXNzaWduZWQgdG8geW91ciB2aWV3LiBFeHBvc2VkIGZvclxuICAgIC8vIHN1YmNsYXNzZXMgdXNpbmcgYW4gYWx0ZXJuYXRpdmUgRE9NIG1hbmlwdWxhdGlvbiBBUEkuXG4gICAgX2NyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICAgIH0sXG5cbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgVmlldyBoYXMgYSBET00gZWxlbWVudCB0byByZW5kZXIgaW50by5cbiAgICAvLyBJZiBgdGhpcy5lbGAgaXMgYSBzdHJpbmcsIHBhc3MgaXQgdGhyb3VnaCBgJCgpYCwgdGFrZSB0aGUgZmlyc3RcbiAgICAvLyBtYXRjaGluZyBlbGVtZW50LCBhbmQgcmUtYXNzaWduIGl0IHRvIGBlbGAuIE90aGVyd2lzZSwgY3JlYXRlXG4gICAgLy8gYW4gZWxlbWVudCBmcm9tIHRoZSBgaWRgLCBgY2xhc3NOYW1lYCBhbmQgYHRhZ05hbWVgIHByb3BlcnRpZXMuXG4gICAgX2Vuc3VyZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmVsKSB7XG4gICAgICAgIHZhciBhdHRycyA9IF8uZXh0ZW5kKHt9LCBfLnJlc3VsdCh0aGlzLCAnYXR0cmlidXRlcycpKTtcbiAgICAgICAgaWYgKHRoaXMuaWQpIGF0dHJzLmlkID0gXy5yZXN1bHQodGhpcywgJ2lkJyk7XG4gICAgICAgIGlmICh0aGlzLmNsYXNzTmFtZSkgYXR0cnNbJ2NsYXNzJ10gPSBfLnJlc3VsdCh0aGlzLCAnY2xhc3NOYW1lJyk7XG4gICAgICAgIHRoaXMuc2V0RWxlbWVudCh0aGlzLl9jcmVhdGVFbGVtZW50KF8ucmVzdWx0KHRoaXMsICd0YWdOYW1lJykpKTtcbiAgICAgICAgdGhpcy5fc2V0QXR0cmlidXRlcyhhdHRycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldEVsZW1lbnQoXy5yZXN1bHQodGhpcywgJ2VsJykpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTZXQgYXR0cmlidXRlcyBmcm9tIGEgaGFzaCBvbiB0aGlzIHZpZXcncyBlbGVtZW50LiAgRXhwb3NlZCBmb3JcbiAgICAvLyBzdWJjbGFzc2VzIHVzaW5nIGFuIGFsdGVybmF0aXZlIERPTSBtYW5pcHVsYXRpb24gQVBJLlxuICAgIF9zZXRBdHRyaWJ1dGVzOiBmdW5jdGlvbihhdHRyaWJ1dGVzKSB7XG4gICAgICB0aGlzLiRlbC5hdHRyKGF0dHJpYnV0ZXMpO1xuICAgIH1cblxuICB9KTtcblxuICAvLyBCYWNrYm9uZS5zeW5jXG4gIC8vIC0tLS0tLS0tLS0tLS1cblxuICAvLyBPdmVycmlkZSB0aGlzIGZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgbWFubmVyIGluIHdoaWNoIEJhY2tib25lIHBlcnNpc3RzXG4gIC8vIG1vZGVscyB0byB0aGUgc2VydmVyLiBZb3Ugd2lsbCBiZSBwYXNzZWQgdGhlIHR5cGUgb2YgcmVxdWVzdCwgYW5kIHRoZVxuICAvLyBtb2RlbCBpbiBxdWVzdGlvbi4gQnkgZGVmYXVsdCwgbWFrZXMgYSBSRVNUZnVsIEFqYXggcmVxdWVzdFxuICAvLyB0byB0aGUgbW9kZWwncyBgdXJsKClgLiBTb21lIHBvc3NpYmxlIGN1c3RvbWl6YXRpb25zIGNvdWxkIGJlOlxuICAvL1xuICAvLyAqIFVzZSBgc2V0VGltZW91dGAgdG8gYmF0Y2ggcmFwaWQtZmlyZSB1cGRhdGVzIGludG8gYSBzaW5nbGUgcmVxdWVzdC5cbiAgLy8gKiBTZW5kIHVwIHRoZSBtb2RlbHMgYXMgWE1MIGluc3RlYWQgb2YgSlNPTi5cbiAgLy8gKiBQZXJzaXN0IG1vZGVscyB2aWEgV2ViU29ja2V0cyBpbnN0ZWFkIG9mIEFqYXguXG4gIC8vXG4gIC8vIFR1cm4gb24gYEJhY2tib25lLmVtdWxhdGVIVFRQYCBpbiBvcmRlciB0byBzZW5kIGBQVVRgIGFuZCBgREVMRVRFYCByZXF1ZXN0c1xuICAvLyBhcyBgUE9TVGAsIHdpdGggYSBgX21ldGhvZGAgcGFyYW1ldGVyIGNvbnRhaW5pbmcgdGhlIHRydWUgSFRUUCBtZXRob2QsXG4gIC8vIGFzIHdlbGwgYXMgYWxsIHJlcXVlc3RzIHdpdGggdGhlIGJvZHkgYXMgYGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZGBcbiAgLy8gaW5zdGVhZCBvZiBgYXBwbGljYXRpb24vanNvbmAgd2l0aCB0aGUgbW9kZWwgaW4gYSBwYXJhbSBuYW1lZCBgbW9kZWxgLlxuICAvLyBVc2VmdWwgd2hlbiBpbnRlcmZhY2luZyB3aXRoIHNlcnZlci1zaWRlIGxhbmd1YWdlcyBsaWtlICoqUEhQKiogdGhhdCBtYWtlXG4gIC8vIGl0IGRpZmZpY3VsdCB0byByZWFkIHRoZSBib2R5IG9mIGBQVVRgIHJlcXVlc3RzLlxuICBCYWNrYm9uZS5zeW5jID0gZnVuY3Rpb24obWV0aG9kLCBtb2RlbCwgb3B0aW9ucykge1xuICAgIHZhciB0eXBlID0gbWV0aG9kTWFwW21ldGhvZF07XG5cbiAgICAvLyBEZWZhdWx0IG9wdGlvbnMsIHVubGVzcyBzcGVjaWZpZWQuXG4gICAgXy5kZWZhdWx0cyhvcHRpb25zIHx8IChvcHRpb25zID0ge30pLCB7XG4gICAgICBlbXVsYXRlSFRUUDogQmFja2JvbmUuZW11bGF0ZUhUVFAsXG4gICAgICBlbXVsYXRlSlNPTjogQmFja2JvbmUuZW11bGF0ZUpTT05cbiAgICB9KTtcblxuICAgIC8vIERlZmF1bHQgSlNPTi1yZXF1ZXN0IG9wdGlvbnMuXG4gICAgdmFyIHBhcmFtcyA9IHt0eXBlOiB0eXBlLCBkYXRhVHlwZTogJ2pzb24nfTtcblxuICAgIC8vIEVuc3VyZSB0aGF0IHdlIGhhdmUgYSBVUkwuXG4gICAgaWYgKCFvcHRpb25zLnVybCkge1xuICAgICAgcGFyYW1zLnVybCA9IF8ucmVzdWx0KG1vZGVsLCAndXJsJykgfHwgdXJsRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB3ZSBoYXZlIHRoZSBhcHByb3ByaWF0ZSByZXF1ZXN0IGRhdGEuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSA9PSBudWxsICYmIG1vZGVsICYmIChtZXRob2QgPT09ICdjcmVhdGUnIHx8IG1ldGhvZCA9PT0gJ3VwZGF0ZScgfHwgbWV0aG9kID09PSAncGF0Y2gnKSkge1xuICAgICAgcGFyYW1zLmNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgcGFyYW1zLmRhdGEgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmF0dHJzIHx8IG1vZGVsLnRvSlNPTihvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgLy8gRm9yIG9sZGVyIHNlcnZlcnMsIGVtdWxhdGUgSlNPTiBieSBlbmNvZGluZyB0aGUgcmVxdWVzdCBpbnRvIGFuIEhUTUwtZm9ybS5cbiAgICBpZiAob3B0aW9ucy5lbXVsYXRlSlNPTikge1xuICAgICAgcGFyYW1zLmNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc7XG4gICAgICBwYXJhbXMuZGF0YSA9IHBhcmFtcy5kYXRhID8ge21vZGVsOiBwYXJhbXMuZGF0YX0gOiB7fTtcbiAgICB9XG5cbiAgICAvLyBGb3Igb2xkZXIgc2VydmVycywgZW11bGF0ZSBIVFRQIGJ5IG1pbWlja2luZyB0aGUgSFRUUCBtZXRob2Qgd2l0aCBgX21ldGhvZGBcbiAgICAvLyBBbmQgYW4gYFgtSFRUUC1NZXRob2QtT3ZlcnJpZGVgIGhlYWRlci5cbiAgICBpZiAob3B0aW9ucy5lbXVsYXRlSFRUUCAmJiAodHlwZSA9PT0gJ1BVVCcgfHwgdHlwZSA9PT0gJ0RFTEVURScgfHwgdHlwZSA9PT0gJ1BBVENIJykpIHtcbiAgICAgIHBhcmFtcy50eXBlID0gJ1BPU1QnO1xuICAgICAgaWYgKG9wdGlvbnMuZW11bGF0ZUpTT04pIHBhcmFtcy5kYXRhLl9tZXRob2QgPSB0eXBlO1xuICAgICAgdmFyIGJlZm9yZVNlbmQgPSBvcHRpb25zLmJlZm9yZVNlbmQ7XG4gICAgICBvcHRpb25zLmJlZm9yZVNlbmQgPSBmdW5jdGlvbih4aHIpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtSFRUUC1NZXRob2QtT3ZlcnJpZGUnLCB0eXBlKTtcbiAgICAgICAgaWYgKGJlZm9yZVNlbmQpIHJldHVybiBiZWZvcmVTZW5kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIERvbid0IHByb2Nlc3MgZGF0YSBvbiBhIG5vbi1HRVQgcmVxdWVzdC5cbiAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdHRVQnICYmICFvcHRpb25zLmVtdWxhdGVKU09OKSB7XG4gICAgICBwYXJhbXMucHJvY2Vzc0RhdGEgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBQYXNzIGFsb25nIGB0ZXh0U3RhdHVzYCBhbmQgYGVycm9yVGhyb3duYCBmcm9tIGpRdWVyeS5cbiAgICB2YXIgZXJyb3IgPSBvcHRpb25zLmVycm9yO1xuICAgIG9wdGlvbnMuZXJyb3IgPSBmdW5jdGlvbih4aHIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICBvcHRpb25zLnRleHRTdGF0dXMgPSB0ZXh0U3RhdHVzO1xuICAgICAgb3B0aW9ucy5lcnJvclRocm93biA9IGVycm9yVGhyb3duO1xuICAgICAgaWYgKGVycm9yKSBlcnJvci5jYWxsKG9wdGlvbnMuY29udGV4dCwgeGhyLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XG4gICAgfTtcblxuICAgIC8vIE1ha2UgdGhlIHJlcXVlc3QsIGFsbG93aW5nIHRoZSB1c2VyIHRvIG92ZXJyaWRlIGFueSBBamF4IG9wdGlvbnMuXG4gICAgdmFyIHhociA9IG9wdGlvbnMueGhyID0gQmFja2JvbmUuYWpheChfLmV4dGVuZChwYXJhbXMsIG9wdGlvbnMpKTtcbiAgICBtb2RlbC50cmlnZ2VyKCdyZXF1ZXN0JywgbW9kZWwsIHhociwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHhocjtcbiAgfTtcblxuICAvLyBNYXAgZnJvbSBDUlVEIHRvIEhUVFAgZm9yIG91ciBkZWZhdWx0IGBCYWNrYm9uZS5zeW5jYCBpbXBsZW1lbnRhdGlvbi5cbiAgdmFyIG1ldGhvZE1hcCA9IHtcbiAgICAnY3JlYXRlJzogJ1BPU1QnLFxuICAgICd1cGRhdGUnOiAnUFVUJyxcbiAgICAncGF0Y2gnOiAnUEFUQ0gnLFxuICAgICdkZWxldGUnOiAnREVMRVRFJyxcbiAgICAncmVhZCc6ICdHRVQnXG4gIH07XG5cbiAgLy8gU2V0IHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIGBCYWNrYm9uZS5hamF4YCB0byBwcm94eSB0aHJvdWdoIHRvIGAkYC5cbiAgLy8gT3ZlcnJpZGUgdGhpcyBpZiB5b3UnZCBsaWtlIHRvIHVzZSBhIGRpZmZlcmVudCBsaWJyYXJ5LlxuICBCYWNrYm9uZS5hamF4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEJhY2tib25lLiQuYWpheC5hcHBseShCYWNrYm9uZS4kLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIEJhY2tib25lLlJvdXRlclxuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSb3V0ZXJzIG1hcCBmYXV4LVVSTHMgdG8gYWN0aW9ucywgYW5kIGZpcmUgZXZlbnRzIHdoZW4gcm91dGVzIGFyZVxuICAvLyBtYXRjaGVkLiBDcmVhdGluZyBhIG5ldyBvbmUgc2V0cyBpdHMgYHJvdXRlc2AgaGFzaCwgaWYgbm90IHNldCBzdGF0aWNhbGx5LlxuICB2YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgaWYgKG9wdGlvbnMucm91dGVzKSB0aGlzLnJvdXRlcyA9IG9wdGlvbnMucm91dGVzO1xuICAgIHRoaXMuX2JpbmRSb3V0ZXMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvLyBDYWNoZWQgcmVndWxhciBleHByZXNzaW9ucyBmb3IgbWF0Y2hpbmcgbmFtZWQgcGFyYW0gcGFydHMgYW5kIHNwbGF0dGVkXG4gIC8vIHBhcnRzIG9mIHJvdXRlIHN0cmluZ3MuXG4gIHZhciBvcHRpb25hbFBhcmFtID0gL1xcKCguKj8pXFwpL2c7XG4gIHZhciBuYW1lZFBhcmFtICAgID0gLyhcXChcXD8pPzpcXHcrL2c7XG4gIHZhciBzcGxhdFBhcmFtICAgID0gL1xcKlxcdysvZztcbiAgdmFyIGVzY2FwZVJlZ0V4cCAgPSAvW1xcLXt9XFxbXFxdKz8uLFxcXFxcXF4kfCNcXHNdL2c7XG5cbiAgLy8gU2V0IHVwIGFsbCBpbmhlcml0YWJsZSAqKkJhY2tib25lLlJvdXRlcioqIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuXG4gIF8uZXh0ZW5kKFJvdXRlci5wcm90b3R5cGUsIEV2ZW50cywge1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBpcyBhbiBlbXB0eSBmdW5jdGlvbiBieSBkZWZhdWx0LiBPdmVycmlkZSBpdCB3aXRoIHlvdXIgb3duXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gbG9naWMuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gICAgLy8gTWFudWFsbHkgYmluZCBhIHNpbmdsZSBuYW1lZCByb3V0ZSB0byBhIGNhbGxiYWNrLiBGb3IgZXhhbXBsZTpcbiAgICAvL1xuICAgIC8vICAgICB0aGlzLnJvdXRlKCdzZWFyY2gvOnF1ZXJ5L3A6bnVtJywgJ3NlYXJjaCcsIGZ1bmN0aW9uKHF1ZXJ5LCBudW0pIHtcbiAgICAvLyAgICAgICAuLi5cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICByb3V0ZTogZnVuY3Rpb24ocm91dGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAoIV8uaXNSZWdFeHAocm91dGUpKSByb3V0ZSA9IHRoaXMuX3JvdXRlVG9SZWdFeHAocm91dGUpO1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihuYW1lKSkge1xuICAgICAgICBjYWxsYmFjayA9IG5hbWU7XG4gICAgICAgIG5hbWUgPSAnJztcbiAgICAgIH1cbiAgICAgIGlmICghY2FsbGJhY2spIGNhbGxiYWNrID0gdGhpc1tuYW1lXTtcbiAgICAgIHZhciByb3V0ZXIgPSB0aGlzO1xuICAgICAgQmFja2JvbmUuaGlzdG9yeS5yb3V0ZShyb3V0ZSwgZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSByb3V0ZXIuX2V4dHJhY3RQYXJhbWV0ZXJzKHJvdXRlLCBmcmFnbWVudCk7XG4gICAgICAgIGlmIChyb3V0ZXIuZXhlY3V0ZShjYWxsYmFjaywgYXJncywgbmFtZSkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgcm91dGVyLnRyaWdnZXIuYXBwbHkocm91dGVyLCBbJ3JvdXRlOicgKyBuYW1lXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgIHJvdXRlci50cmlnZ2VyKCdyb3V0ZScsIG5hbWUsIGFyZ3MpO1xuICAgICAgICAgIEJhY2tib25lLmhpc3RvcnkudHJpZ2dlcigncm91dGUnLCByb3V0ZXIsIG5hbWUsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBFeGVjdXRlIGEgcm91dGUgaGFuZGxlciB3aXRoIHRoZSBwcm92aWRlZCBwYXJhbWV0ZXJzLiAgVGhpcyBpcyBhblxuICAgIC8vIGV4Y2VsbGVudCBwbGFjZSB0byBkbyBwcmUtcm91dGUgc2V0dXAgb3IgcG9zdC1yb3V0ZSBjbGVhbnVwLlxuICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKGNhbGxiYWNrLCBhcmdzLCBuYW1lKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0sXG5cbiAgICAvLyBTaW1wbGUgcHJveHkgdG8gYEJhY2tib25lLmhpc3RvcnlgIHRvIHNhdmUgYSBmcmFnbWVudCBpbnRvIHRoZSBoaXN0b3J5LlxuICAgIG5hdmlnYXRlOiBmdW5jdGlvbihmcmFnbWVudCwgb3B0aW9ucykge1xuICAgICAgQmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZShmcmFnbWVudCwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQmluZCBhbGwgZGVmaW5lZCByb3V0ZXMgdG8gYEJhY2tib25lLmhpc3RvcnlgLiBXZSBoYXZlIHRvIHJldmVyc2UgdGhlXG4gICAgLy8gb3JkZXIgb2YgdGhlIHJvdXRlcyBoZXJlIHRvIHN1cHBvcnQgYmVoYXZpb3Igd2hlcmUgdGhlIG1vc3QgZ2VuZXJhbFxuICAgIC8vIHJvdXRlcyBjYW4gYmUgZGVmaW5lZCBhdCB0aGUgYm90dG9tIG9mIHRoZSByb3V0ZSBtYXAuXG4gICAgX2JpbmRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLnJvdXRlcykgcmV0dXJuO1xuICAgICAgdGhpcy5yb3V0ZXMgPSBfLnJlc3VsdCh0aGlzLCAncm91dGVzJyk7XG4gICAgICB2YXIgcm91dGUsIHJvdXRlcyA9IF8ua2V5cyh0aGlzLnJvdXRlcyk7XG4gICAgICB3aGlsZSAoKHJvdXRlID0gcm91dGVzLnBvcCgpKSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMucm91dGUocm91dGUsIHRoaXMucm91dGVzW3JvdXRlXSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSByb3V0ZSBzdHJpbmcgaW50byBhIHJlZ3VsYXIgZXhwcmVzc2lvbiwgc3VpdGFibGUgZm9yIG1hdGNoaW5nXG4gICAgLy8gYWdhaW5zdCB0aGUgY3VycmVudCBsb2NhdGlvbiBoYXNoLlxuICAgIF9yb3V0ZVRvUmVnRXhwOiBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgcm91dGUgPSByb3V0ZS5yZXBsYWNlKGVzY2FwZVJlZ0V4cCwgJ1xcXFwkJicpXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2Uob3B0aW9uYWxQYXJhbSwgJyg/OiQxKT8nKVxuICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKG5hbWVkUGFyYW0sIGZ1bmN0aW9uKG1hdGNoLCBvcHRpb25hbCkge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbmFsID8gbWF0Y2ggOiAnKFteLz9dKyknO1xuICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2Uoc3BsYXRQYXJhbSwgJyhbXj9dKj8pJyk7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyByb3V0ZSArICcoPzpcXFxcPyhbXFxcXHNcXFxcU10qKSk/JCcpO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIHJvdXRlLCBhbmQgYSBVUkwgZnJhZ21lbnQgdGhhdCBpdCBtYXRjaGVzLCByZXR1cm4gdGhlIGFycmF5IG9mXG4gICAgLy8gZXh0cmFjdGVkIGRlY29kZWQgcGFyYW1ldGVycy4gRW1wdHkgb3IgdW5tYXRjaGVkIHBhcmFtZXRlcnMgd2lsbCBiZVxuICAgIC8vIHRyZWF0ZWQgYXMgYG51bGxgIHRvIG5vcm1hbGl6ZSBjcm9zcy1icm93c2VyIGJlaGF2aW9yLlxuICAgIF9leHRyYWN0UGFyYW1ldGVyczogZnVuY3Rpb24ocm91dGUsIGZyYWdtZW50KSB7XG4gICAgICB2YXIgcGFyYW1zID0gcm91dGUuZXhlYyhmcmFnbWVudCkuc2xpY2UoMSk7XG4gICAgICByZXR1cm4gXy5tYXAocGFyYW1zLCBmdW5jdGlvbihwYXJhbSwgaSkge1xuICAgICAgICAvLyBEb24ndCBkZWNvZGUgdGhlIHNlYXJjaCBwYXJhbXMuXG4gICAgICAgIGlmIChpID09PSBwYXJhbXMubGVuZ3RoIC0gMSkgcmV0dXJuIHBhcmFtIHx8IG51bGw7XG4gICAgICAgIHJldHVybiBwYXJhbSA/IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbSkgOiBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIEJhY2tib25lLkhpc3RvcnlcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEhhbmRsZXMgY3Jvc3MtYnJvd3NlciBoaXN0b3J5IG1hbmFnZW1lbnQsIGJhc2VkIG9uIGVpdGhlclxuICAvLyBbcHVzaFN0YXRlXShodHRwOi8vZGl2ZWludG9odG1sNS5pbmZvL2hpc3RvcnkuaHRtbCkgYW5kIHJlYWwgVVJMcywgb3JcbiAgLy8gW29uaGFzaGNoYW5nZV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9ET00vd2luZG93Lm9uaGFzaGNoYW5nZSlcbiAgLy8gYW5kIFVSTCBmcmFnbWVudHMuIElmIHRoZSBicm93c2VyIHN1cHBvcnRzIG5laXRoZXIgKG9sZCBJRSwgbmF0Y2gpLFxuICAvLyBmYWxscyBiYWNrIHRvIHBvbGxpbmcuXG4gIHZhciBIaXN0b3J5ID0gQmFja2JvbmUuSGlzdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaGFuZGxlcnMgPSBbXTtcbiAgICB0aGlzLmNoZWNrVXJsID0gXy5iaW5kKHRoaXMuY2hlY2tVcmwsIHRoaXMpO1xuXG4gICAgLy8gRW5zdXJlIHRoYXQgYEhpc3RvcnlgIGNhbiBiZSB1c2VkIG91dHNpZGUgb2YgdGhlIGJyb3dzZXIuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xuICAgICAgdGhpcy5oaXN0b3J5ID0gd2luZG93Lmhpc3Rvcnk7XG4gICAgfVxuICB9O1xuXG4gIC8vIENhY2hlZCByZWdleCBmb3Igc3RyaXBwaW5nIGEgbGVhZGluZyBoYXNoL3NsYXNoIGFuZCB0cmFpbGluZyBzcGFjZS5cbiAgdmFyIHJvdXRlU3RyaXBwZXIgPSAvXlsjXFwvXXxcXHMrJC9nO1xuXG4gIC8vIENhY2hlZCByZWdleCBmb3Igc3RyaXBwaW5nIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMuXG4gIHZhciByb290U3RyaXBwZXIgPSAvXlxcLyt8XFwvKyQvZztcblxuICAvLyBDYWNoZWQgcmVnZXggZm9yIHN0cmlwcGluZyB1cmxzIG9mIGhhc2guXG4gIHZhciBwYXRoU3RyaXBwZXIgPSAvIy4qJC87XG5cbiAgLy8gSGFzIHRoZSBoaXN0b3J5IGhhbmRsaW5nIGFscmVhZHkgYmVlbiBzdGFydGVkP1xuICBIaXN0b3J5LnN0YXJ0ZWQgPSBmYWxzZTtcblxuICAvLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuSGlzdG9yeSoqIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuXG4gIF8uZXh0ZW5kKEhpc3RvcnkucHJvdG90eXBlLCBFdmVudHMsIHtcblxuICAgIC8vIFRoZSBkZWZhdWx0IGludGVydmFsIHRvIHBvbGwgZm9yIGhhc2ggY2hhbmdlcywgaWYgbmVjZXNzYXJ5LCBpc1xuICAgIC8vIHR3ZW50eSB0aW1lcyBhIHNlY29uZC5cbiAgICBpbnRlcnZhbDogNTAsXG5cbiAgICAvLyBBcmUgd2UgYXQgdGhlIGFwcCByb290P1xuICAgIGF0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0aCA9IHRoaXMubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvW15cXC9dJC8sICckJi8nKTtcbiAgICAgIHJldHVybiBwYXRoID09PSB0aGlzLnJvb3QgJiYgIXRoaXMuZ2V0U2VhcmNoKCk7XG4gICAgfSxcblxuICAgIC8vIERvZXMgdGhlIHBhdGhuYW1lIG1hdGNoIHRoZSByb290P1xuICAgIG1hdGNoUm9vdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0aCA9IHRoaXMuZGVjb2RlRnJhZ21lbnQodGhpcy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICB2YXIgcm9vdFBhdGggPSBwYXRoLnNsaWNlKDAsIHRoaXMucm9vdC5sZW5ndGggLSAxKSArICcvJztcbiAgICAgIHJldHVybiByb290UGF0aCA9PT0gdGhpcy5yb290O1xuICAgIH0sXG5cbiAgICAvLyBVbmljb2RlIGNoYXJhY3RlcnMgaW4gYGxvY2F0aW9uLnBhdGhuYW1lYCBhcmUgcGVyY2VudCBlbmNvZGVkIHNvIHRoZXkncmVcbiAgICAvLyBkZWNvZGVkIGZvciBjb21wYXJpc29uLiBgJTI1YCBzaG91bGQgbm90IGJlIGRlY29kZWQgc2luY2UgaXQgbWF5IGJlIHBhcnRcbiAgICAvLyBvZiBhbiBlbmNvZGVkIHBhcmFtZXRlci5cbiAgICBkZWNvZGVGcmFnbWVudDogZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgIHJldHVybiBkZWNvZGVVUkkoZnJhZ21lbnQucmVwbGFjZSgvJTI1L2csICclMjUyNScpKTtcbiAgICB9LFxuXG4gICAgLy8gSW4gSUU2LCB0aGUgaGFzaCBmcmFnbWVudCBhbmQgc2VhcmNoIHBhcmFtcyBhcmUgaW5jb3JyZWN0IGlmIHRoZVxuICAgIC8vIGZyYWdtZW50IGNvbnRhaW5zIGA/YC5cbiAgICBnZXRTZWFyY2g6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG1hdGNoID0gdGhpcy5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoLyMuKi8sICcnKS5tYXRjaCgvXFw/LisvKTtcbiAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIDogJyc7XG4gICAgfSxcblxuICAgIC8vIEdldHMgdGhlIHRydWUgaGFzaCB2YWx1ZS4gQ2Fubm90IHVzZSBsb2NhdGlvbi5oYXNoIGRpcmVjdGx5IGR1ZSB0byBidWdcbiAgICAvLyBpbiBGaXJlZm94IHdoZXJlIGxvY2F0aW9uLmhhc2ggd2lsbCBhbHdheXMgYmUgZGVjb2RlZC5cbiAgICBnZXRIYXNoOiBmdW5jdGlvbih3aW5kb3cpIHtcbiAgICAgIHZhciBtYXRjaCA9ICh3aW5kb3cgfHwgdGhpcykubG9jYXRpb24uaHJlZi5tYXRjaCgvIyguKikkLyk7XG4gICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHBhdGhuYW1lIGFuZCBzZWFyY2ggcGFyYW1zLCB3aXRob3V0IHRoZSByb290LlxuICAgIGdldFBhdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhdGggPSB0aGlzLmRlY29kZUZyYWdtZW50KFxuICAgICAgICB0aGlzLmxvY2F0aW9uLnBhdGhuYW1lICsgdGhpcy5nZXRTZWFyY2goKVxuICAgICAgKS5zbGljZSh0aGlzLnJvb3QubGVuZ3RoIC0gMSk7XG4gICAgICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJyA/IHBhdGguc2xpY2UoMSkgOiBwYXRoO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGNyb3NzLWJyb3dzZXIgbm9ybWFsaXplZCBVUkwgZnJhZ21lbnQgZnJvbSB0aGUgcGF0aCBvciBoYXNoLlxuICAgIGdldEZyYWdtZW50OiBmdW5jdGlvbihmcmFnbWVudCkge1xuICAgICAgaWYgKGZyYWdtZW50ID09IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuX3VzZVB1c2hTdGF0ZSB8fCAhdGhpcy5fd2FudHNIYXNoQ2hhbmdlKSB7XG4gICAgICAgICAgZnJhZ21lbnQgPSB0aGlzLmdldFBhdGgoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcmFnbWVudCA9IHRoaXMuZ2V0SGFzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZnJhZ21lbnQucmVwbGFjZShyb3V0ZVN0cmlwcGVyLCAnJyk7XG4gICAgfSxcblxuICAgIC8vIFN0YXJ0IHRoZSBoYXNoIGNoYW5nZSBoYW5kbGluZywgcmV0dXJuaW5nIGB0cnVlYCBpZiB0aGUgY3VycmVudCBVUkwgbWF0Y2hlc1xuICAgIC8vIGFuIGV4aXN0aW5nIHJvdXRlLCBhbmQgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmIChIaXN0b3J5LnN0YXJ0ZWQpIHRocm93IG5ldyBFcnJvcignQmFja2JvbmUuaGlzdG9yeSBoYXMgYWxyZWFkeSBiZWVuIHN0YXJ0ZWQnKTtcbiAgICAgIEhpc3Rvcnkuc3RhcnRlZCA9IHRydWU7XG5cbiAgICAgIC8vIEZpZ3VyZSBvdXQgdGhlIGluaXRpYWwgY29uZmlndXJhdGlvbi4gRG8gd2UgbmVlZCBhbiBpZnJhbWU/XG4gICAgICAvLyBJcyBwdXNoU3RhdGUgZGVzaXJlZCAuLi4gaXMgaXQgYXZhaWxhYmxlP1xuICAgICAgdGhpcy5vcHRpb25zICAgICAgICAgID0gXy5leHRlbmQoe3Jvb3Q6ICcvJ30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICB0aGlzLnJvb3QgICAgICAgICAgICAgPSB0aGlzLm9wdGlvbnMucm9vdDtcbiAgICAgIHRoaXMuX3dhbnRzSGFzaENoYW5nZSA9IHRoaXMub3B0aW9ucy5oYXNoQ2hhbmdlICE9PSBmYWxzZTtcbiAgICAgIHRoaXMuX2hhc0hhc2hDaGFuZ2UgICA9ICdvbmhhc2hjaGFuZ2UnIGluIHdpbmRvdyAmJiAoZG9jdW1lbnQuZG9jdW1lbnRNb2RlID09PSB2b2lkIDAgfHwgZG9jdW1lbnQuZG9jdW1lbnRNb2RlID4gNyk7XG4gICAgICB0aGlzLl91c2VIYXNoQ2hhbmdlICAgPSB0aGlzLl93YW50c0hhc2hDaGFuZ2UgJiYgdGhpcy5faGFzSGFzaENoYW5nZTtcbiAgICAgIHRoaXMuX3dhbnRzUHVzaFN0YXRlICA9ICEhdGhpcy5vcHRpb25zLnB1c2hTdGF0ZTtcbiAgICAgIHRoaXMuX2hhc1B1c2hTdGF0ZSAgICA9ICEhKHRoaXMuaGlzdG9yeSAmJiB0aGlzLmhpc3RvcnkucHVzaFN0YXRlKTtcbiAgICAgIHRoaXMuX3VzZVB1c2hTdGF0ZSAgICA9IHRoaXMuX3dhbnRzUHVzaFN0YXRlICYmIHRoaXMuX2hhc1B1c2hTdGF0ZTtcbiAgICAgIHRoaXMuZnJhZ21lbnQgICAgICAgICA9IHRoaXMuZ2V0RnJhZ21lbnQoKTtcblxuICAgICAgLy8gTm9ybWFsaXplIHJvb3QgdG8gYWx3YXlzIGluY2x1ZGUgYSBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaC5cbiAgICAgIHRoaXMucm9vdCA9ICgnLycgKyB0aGlzLnJvb3QgKyAnLycpLnJlcGxhY2Uocm9vdFN0cmlwcGVyLCAnLycpO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIGZyb20gaGFzaENoYW5nZSB0byBwdXNoU3RhdGUgb3IgdmljZSB2ZXJzYSBpZiBib3RoIGFyZVxuICAgICAgLy8gcmVxdWVzdGVkLlxuICAgICAgaWYgKHRoaXMuX3dhbnRzSGFzaENoYW5nZSAmJiB0aGlzLl93YW50c1B1c2hTdGF0ZSkge1xuXG4gICAgICAgIC8vIElmIHdlJ3ZlIHN0YXJ0ZWQgb2ZmIHdpdGggYSByb3V0ZSBmcm9tIGEgYHB1c2hTdGF0ZWAtZW5hYmxlZFxuICAgICAgICAvLyBicm93c2VyLCBidXQgd2UncmUgY3VycmVudGx5IGluIGEgYnJvd3NlciB0aGF0IGRvZXNuJ3Qgc3VwcG9ydCBpdC4uLlxuICAgICAgICBpZiAoIXRoaXMuX2hhc1B1c2hTdGF0ZSAmJiAhdGhpcy5hdFJvb3QoKSkge1xuICAgICAgICAgIHZhciByb290UGF0aCA9IHRoaXMucm9vdC5zbGljZSgwLCAtMSkgfHwgJy8nO1xuICAgICAgICAgIHRoaXMubG9jYXRpb24ucmVwbGFjZShyb290UGF0aCArICcjJyArIHRoaXMuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAvLyBSZXR1cm4gaW1tZWRpYXRlbHkgYXMgYnJvd3NlciB3aWxsIGRvIHJlZGlyZWN0IHRvIG5ldyB1cmxcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBPciBpZiB3ZSd2ZSBzdGFydGVkIG91dCB3aXRoIGEgaGFzaC1iYXNlZCByb3V0ZSwgYnV0IHdlJ3JlIGN1cnJlbnRseVxuICAgICAgICAvLyBpbiBhIGJyb3dzZXIgd2hlcmUgaXQgY291bGQgYmUgYHB1c2hTdGF0ZWAtYmFzZWQgaW5zdGVhZC4uLlxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2hhc1B1c2hTdGF0ZSAmJiB0aGlzLmF0Um9vdCgpKSB7XG4gICAgICAgICAgdGhpcy5uYXZpZ2F0ZSh0aGlzLmdldEhhc2goKSwge3JlcGxhY2U6IHRydWV9KTtcbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIC8vIFByb3h5IGFuIGlmcmFtZSB0byBoYW5kbGUgbG9jYXRpb24gZXZlbnRzIGlmIHRoZSBicm93c2VyIGRvZXNuJ3RcbiAgICAgIC8vIHN1cHBvcnQgdGhlIGBoYXNoY2hhbmdlYCBldmVudCwgSFRNTDUgaGlzdG9yeSwgb3IgdGhlIHVzZXIgd2FudHNcbiAgICAgIC8vIGBoYXNoQ2hhbmdlYCBidXQgbm90IGBwdXNoU3RhdGVgLlxuICAgICAgaWYgKCF0aGlzLl9oYXNIYXNoQ2hhbmdlICYmIHRoaXMuX3dhbnRzSGFzaENoYW5nZSAmJiAhdGhpcy5fdXNlUHVzaFN0YXRlKSB7XG4gICAgICAgIHRoaXMuaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgIHRoaXMuaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0OjAnO1xuICAgICAgICB0aGlzLmlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB0aGlzLmlmcmFtZS50YWJJbmRleCA9IC0xO1xuICAgICAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgICAgIC8vIFVzaW5nIGBhcHBlbmRDaGlsZGAgd2lsbCB0aHJvdyBvbiBJRSA8IDkgaWYgdGhlIGRvY3VtZW50IGlzIG5vdCByZWFkeS5cbiAgICAgICAgdmFyIGlXaW5kb3cgPSBib2R5Lmluc2VydEJlZm9yZSh0aGlzLmlmcmFtZSwgYm9keS5maXJzdENoaWxkKS5jb250ZW50V2luZG93O1xuICAgICAgICBpV2luZG93LmRvY3VtZW50Lm9wZW4oKTtcbiAgICAgICAgaVdpbmRvdy5kb2N1bWVudC5jbG9zZSgpO1xuICAgICAgICBpV2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIycgKyB0aGlzLmZyYWdtZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgYSBjcm9zcy1wbGF0Zm9ybSBgYWRkRXZlbnRMaXN0ZW5lcmAgc2hpbSBmb3Igb2xkZXIgYnJvd3NlcnMuXG4gICAgICB2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyIHx8IGZ1bmN0aW9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIGF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIERlcGVuZGluZyBvbiB3aGV0aGVyIHdlJ3JlIHVzaW5nIHB1c2hTdGF0ZSBvciBoYXNoZXMsIGFuZCB3aGV0aGVyXG4gICAgICAvLyAnb25oYXNoY2hhbmdlJyBpcyBzdXBwb3J0ZWQsIGRldGVybWluZSBob3cgd2UgY2hlY2sgdGhlIFVSTCBzdGF0ZS5cbiAgICAgIGlmICh0aGlzLl91c2VQdXNoU3RhdGUpIHtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLmNoZWNrVXJsLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3VzZUhhc2hDaGFuZ2UgJiYgIXRoaXMuaWZyYW1lKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCB0aGlzLmNoZWNrVXJsLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3dhbnRzSGFzaENoYW5nZSkge1xuICAgICAgICB0aGlzLl9jaGVja1VybEludGVydmFsID0gc2V0SW50ZXJ2YWwodGhpcy5jaGVja1VybCwgdGhpcy5pbnRlcnZhbCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5vcHRpb25zLnNpbGVudCkgcmV0dXJuIHRoaXMubG9hZFVybCgpO1xuICAgIH0sXG5cbiAgICAvLyBEaXNhYmxlIEJhY2tib25lLmhpc3RvcnksIHBlcmhhcHMgdGVtcG9yYXJpbHkuIE5vdCB1c2VmdWwgaW4gYSByZWFsIGFwcCxcbiAgICAvLyBidXQgcG9zc2libHkgdXNlZnVsIGZvciB1bml0IHRlc3RpbmcgUm91dGVycy5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFkZCBhIGNyb3NzLXBsYXRmb3JtIGByZW1vdmVFdmVudExpc3RlbmVyYCBzaGltIGZvciBvbGRlciBicm93c2Vycy5cbiAgICAgIHZhciByZW1vdmVFdmVudExpc3RlbmVyID0gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIgfHwgZnVuY3Rpb24oZXZlbnROYW1lLCBsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgICAgfTtcblxuICAgICAgLy8gUmVtb3ZlIHdpbmRvdyBsaXN0ZW5lcnMuXG4gICAgICBpZiAodGhpcy5fdXNlUHVzaFN0YXRlKSB7XG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5jaGVja1VybCwgZmFsc2UpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl91c2VIYXNoQ2hhbmdlICYmICF0aGlzLmlmcmFtZSkge1xuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5jaGVja1VybCwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhbiB1cCB0aGUgaWZyYW1lIGlmIG5lY2Vzc2FyeS5cbiAgICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuaWZyYW1lKTtcbiAgICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBTb21lIGVudmlyb25tZW50cyB3aWxsIHRocm93IHdoZW4gY2xlYXJpbmcgYW4gdW5kZWZpbmVkIGludGVydmFsLlxuICAgICAgaWYgKHRoaXMuX2NoZWNrVXJsSW50ZXJ2YWwpIGNsZWFySW50ZXJ2YWwodGhpcy5fY2hlY2tVcmxJbnRlcnZhbCk7XG4gICAgICBIaXN0b3J5LnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgcm91dGUgdG8gYmUgdGVzdGVkIHdoZW4gdGhlIGZyYWdtZW50IGNoYW5nZXMuIFJvdXRlcyBhZGRlZCBsYXRlclxuICAgIC8vIG1heSBvdmVycmlkZSBwcmV2aW91cyByb3V0ZXMuXG4gICAgcm91dGU6IGZ1bmN0aW9uKHJvdXRlLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5oYW5kbGVycy51bnNoaWZ0KHtyb3V0ZTogcm91dGUsIGNhbGxiYWNrOiBjYWxsYmFja30pO1xuICAgIH0sXG5cbiAgICAvLyBDaGVja3MgdGhlIGN1cnJlbnQgVVJMIHRvIHNlZSBpZiBpdCBoYXMgY2hhbmdlZCwgYW5kIGlmIGl0IGhhcyxcbiAgICAvLyBjYWxscyBgbG9hZFVybGAsIG5vcm1hbGl6aW5nIGFjcm9zcyB0aGUgaGlkZGVuIGlmcmFtZS5cbiAgICBjaGVja1VybDogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldEZyYWdtZW50KCk7XG5cbiAgICAgIC8vIElmIHRoZSB1c2VyIHByZXNzZWQgdGhlIGJhY2sgYnV0dG9uLCB0aGUgaWZyYW1lJ3MgaGFzaCB3aWxsIGhhdmVcbiAgICAgIC8vIGNoYW5nZWQgYW5kIHdlIHNob3VsZCB1c2UgdGhhdCBmb3IgY29tcGFyaXNvbi5cbiAgICAgIGlmIChjdXJyZW50ID09PSB0aGlzLmZyYWdtZW50ICYmIHRoaXMuaWZyYW1lKSB7XG4gICAgICAgIGN1cnJlbnQgPSB0aGlzLmdldEhhc2godGhpcy5pZnJhbWUuY29udGVudFdpbmRvdyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjdXJyZW50ID09PSB0aGlzLmZyYWdtZW50KSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAodGhpcy5pZnJhbWUpIHRoaXMubmF2aWdhdGUoY3VycmVudCk7XG4gICAgICB0aGlzLmxvYWRVcmwoKTtcbiAgICB9LFxuXG4gICAgLy8gQXR0ZW1wdCB0byBsb2FkIHRoZSBjdXJyZW50IFVSTCBmcmFnbWVudC4gSWYgYSByb3V0ZSBzdWNjZWVkcyB3aXRoIGFcbiAgICAvLyBtYXRjaCwgcmV0dXJucyBgdHJ1ZWAuIElmIG5vIGRlZmluZWQgcm91dGVzIG1hdGNoZXMgdGhlIGZyYWdtZW50LFxuICAgIC8vIHJldHVybnMgYGZhbHNlYC5cbiAgICBsb2FkVXJsOiBmdW5jdGlvbihmcmFnbWVudCkge1xuICAgICAgLy8gSWYgdGhlIHJvb3QgZG9lc24ndCBtYXRjaCwgbm8gcm91dGVzIGNhbiBtYXRjaCBlaXRoZXIuXG4gICAgICBpZiAoIXRoaXMubWF0Y2hSb290KCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGZyYWdtZW50ID0gdGhpcy5mcmFnbWVudCA9IHRoaXMuZ2V0RnJhZ21lbnQoZnJhZ21lbnQpO1xuICAgICAgcmV0dXJuIF8uc29tZSh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICAgIGlmIChoYW5kbGVyLnJvdXRlLnRlc3QoZnJhZ21lbnQpKSB7XG4gICAgICAgICAgaGFuZGxlci5jYWxsYmFjayhmcmFnbWVudCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBTYXZlIGEgZnJhZ21lbnQgaW50byB0aGUgaGFzaCBoaXN0b3J5LCBvciByZXBsYWNlIHRoZSBVUkwgc3RhdGUgaWYgdGhlXG4gICAgLy8gJ3JlcGxhY2UnIG9wdGlvbiBpcyBwYXNzZWQuIFlvdSBhcmUgcmVzcG9uc2libGUgZm9yIHByb3Blcmx5IFVSTC1lbmNvZGluZ1xuICAgIC8vIHRoZSBmcmFnbWVudCBpbiBhZHZhbmNlLlxuICAgIC8vXG4gICAgLy8gVGhlIG9wdGlvbnMgb2JqZWN0IGNhbiBjb250YWluIGB0cmlnZ2VyOiB0cnVlYCBpZiB5b3Ugd2lzaCB0byBoYXZlIHRoZVxuICAgIC8vIHJvdXRlIGNhbGxiYWNrIGJlIGZpcmVkIChub3QgdXN1YWxseSBkZXNpcmFibGUpLCBvciBgcmVwbGFjZTogdHJ1ZWAsIGlmXG4gICAgLy8geW91IHdpc2ggdG8gbW9kaWZ5IHRoZSBjdXJyZW50IFVSTCB3aXRob3V0IGFkZGluZyBhbiBlbnRyeSB0byB0aGUgaGlzdG9yeS5cbiAgICBuYXZpZ2F0ZTogZnVuY3Rpb24oZnJhZ21lbnQsIG9wdGlvbnMpIHtcbiAgICAgIGlmICghSGlzdG9yeS5zdGFydGVkKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIW9wdGlvbnMgfHwgb3B0aW9ucyA9PT0gdHJ1ZSkgb3B0aW9ucyA9IHt0cmlnZ2VyOiAhIW9wdGlvbnN9O1xuXG4gICAgICAvLyBOb3JtYWxpemUgdGhlIGZyYWdtZW50LlxuICAgICAgZnJhZ21lbnQgPSB0aGlzLmdldEZyYWdtZW50KGZyYWdtZW50IHx8ICcnKTtcblxuICAgICAgLy8gRG9uJ3QgaW5jbHVkZSBhIHRyYWlsaW5nIHNsYXNoIG9uIHRoZSByb290LlxuICAgICAgdmFyIHJvb3RQYXRoID0gdGhpcy5yb290O1xuICAgICAgaWYgKGZyYWdtZW50ID09PSAnJyB8fCBmcmFnbWVudC5jaGFyQXQoMCkgPT09ICc/Jykge1xuICAgICAgICByb290UGF0aCA9IHJvb3RQYXRoLnNsaWNlKDAsIC0xKSB8fCAnLyc7XG4gICAgICB9XG4gICAgICB2YXIgdXJsID0gcm9vdFBhdGggKyBmcmFnbWVudDtcblxuICAgICAgLy8gU3RyaXAgdGhlIGhhc2ggYW5kIGRlY29kZSBmb3IgbWF0Y2hpbmcuXG4gICAgICBmcmFnbWVudCA9IHRoaXMuZGVjb2RlRnJhZ21lbnQoZnJhZ21lbnQucmVwbGFjZShwYXRoU3RyaXBwZXIsICcnKSk7XG5cbiAgICAgIGlmICh0aGlzLmZyYWdtZW50ID09PSBmcmFnbWVudCkgcmV0dXJuO1xuICAgICAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50O1xuXG4gICAgICAvLyBJZiBwdXNoU3RhdGUgaXMgYXZhaWxhYmxlLCB3ZSB1c2UgaXQgdG8gc2V0IHRoZSBmcmFnbWVudCBhcyBhIHJlYWwgVVJMLlxuICAgICAgaWYgKHRoaXMuX3VzZVB1c2hTdGF0ZSkge1xuICAgICAgICB0aGlzLmhpc3Rvcnlbb3B0aW9ucy5yZXBsYWNlID8gJ3JlcGxhY2VTdGF0ZScgOiAncHVzaFN0YXRlJ10oe30sIGRvY3VtZW50LnRpdGxlLCB1cmwpO1xuXG4gICAgICAvLyBJZiBoYXNoIGNoYW5nZXMgaGF2ZW4ndCBiZWVuIGV4cGxpY2l0bHkgZGlzYWJsZWQsIHVwZGF0ZSB0aGUgaGFzaFxuICAgICAgLy8gZnJhZ21lbnQgdG8gc3RvcmUgaGlzdG9yeS5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fd2FudHNIYXNoQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUhhc2godGhpcy5sb2NhdGlvbiwgZnJhZ21lbnQsIG9wdGlvbnMucmVwbGFjZSk7XG4gICAgICAgIGlmICh0aGlzLmlmcmFtZSAmJiBmcmFnbWVudCAhPT0gdGhpcy5nZXRIYXNoKHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cpKSB7XG4gICAgICAgICAgdmFyIGlXaW5kb3cgPSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93O1xuXG4gICAgICAgICAgLy8gT3BlbmluZyBhbmQgY2xvc2luZyB0aGUgaWZyYW1lIHRyaWNrcyBJRTcgYW5kIGVhcmxpZXIgdG8gcHVzaCBhXG4gICAgICAgICAgLy8gaGlzdG9yeSBlbnRyeSBvbiBoYXNoLXRhZyBjaGFuZ2UuICBXaGVuIHJlcGxhY2UgaXMgdHJ1ZSwgd2UgZG9uJ3RcbiAgICAgICAgICAvLyB3YW50IHRoaXMuXG4gICAgICAgICAgaWYgKCFvcHRpb25zLnJlcGxhY2UpIHtcbiAgICAgICAgICAgIGlXaW5kb3cuZG9jdW1lbnQub3BlbigpO1xuICAgICAgICAgICAgaVdpbmRvdy5kb2N1bWVudC5jbG9zZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX3VwZGF0ZUhhc2goaVdpbmRvdy5sb2NhdGlvbiwgZnJhZ21lbnQsIG9wdGlvbnMucmVwbGFjZSk7XG4gICAgICAgIH1cblxuICAgICAgLy8gSWYgeW91J3ZlIHRvbGQgdXMgdGhhdCB5b3UgZXhwbGljaXRseSBkb24ndCB3YW50IGZhbGxiYWNrIGhhc2hjaGFuZ2UtXG4gICAgICAvLyBiYXNlZCBoaXN0b3J5LCB0aGVuIGBuYXZpZ2F0ZWAgYmVjb21lcyBhIHBhZ2UgcmVmcmVzaC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLmFzc2lnbih1cmwpO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlcikgcmV0dXJuIHRoaXMubG9hZFVybChmcmFnbWVudCk7XG4gICAgfSxcblxuICAgIC8vIFVwZGF0ZSB0aGUgaGFzaCBsb2NhdGlvbiwgZWl0aGVyIHJlcGxhY2luZyB0aGUgY3VycmVudCBlbnRyeSwgb3IgYWRkaW5nXG4gICAgLy8gYSBuZXcgb25lIHRvIHRoZSBicm93c2VyIGhpc3RvcnkuXG4gICAgX3VwZGF0ZUhhc2g6IGZ1bmN0aW9uKGxvY2F0aW9uLCBmcmFnbWVudCwgcmVwbGFjZSkge1xuICAgICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgICAgdmFyIGhyZWYgPSBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoLyhqYXZhc2NyaXB0OnwjKS4qJC8sICcnKTtcbiAgICAgICAgbG9jYXRpb24ucmVwbGFjZShocmVmICsgJyMnICsgZnJhZ21lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU29tZSBicm93c2VycyByZXF1aXJlIHRoYXQgYGhhc2hgIGNvbnRhaW5zIGEgbGVhZGluZyAjLlxuICAgICAgICBsb2NhdGlvbi5oYXNoID0gJyMnICsgZnJhZ21lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIENyZWF0ZSB0aGUgZGVmYXVsdCBCYWNrYm9uZS5oaXN0b3J5LlxuICBCYWNrYm9uZS5oaXN0b3J5ID0gbmV3IEhpc3Rvcnk7XG5cbiAgLy8gSGVscGVyc1xuICAvLyAtLS0tLS0tXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvcnJlY3RseSBzZXQgdXAgdGhlIHByb3RvdHlwZSBjaGFpbiBmb3Igc3ViY2xhc3Nlcy5cbiAgLy8gU2ltaWxhciB0byBgZ29vZy5pbmhlcml0c2AsIGJ1dCB1c2VzIGEgaGFzaCBvZiBwcm90b3R5cGUgcHJvcGVydGllcyBhbmRcbiAgLy8gY2xhc3MgcHJvcGVydGllcyB0byBiZSBleHRlbmRlZC5cbiAgdmFyIGV4dGVuZCA9IGZ1bmN0aW9uKHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgdmFyIGNoaWxkO1xuXG4gICAgLy8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuICAgIC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuICAgIC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQgY29uc3RydWN0b3IuXG4gICAgaWYgKHByb3RvUHJvcHMgJiYgXy5oYXMocHJvdG9Qcm9wcywgJ2NvbnN0cnVjdG9yJykpIHtcbiAgICAgIGNoaWxkID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQgPSBmdW5jdGlvbigpeyByZXR1cm4gcGFyZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgfVxuXG4gICAgLy8gQWRkIHN0YXRpYyBwcm9wZXJ0aWVzIHRvIHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiwgaWYgc3VwcGxpZWQuXG4gICAgXy5leHRlbmQoY2hpbGQsIHBhcmVudCwgc3RhdGljUHJvcHMpO1xuXG4gICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcbiAgICAvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGFuZCBhZGQgdGhlIHByb3RvdHlwZSBwcm9wZXJ0aWVzLlxuICAgIGNoaWxkLnByb3RvdHlwZSA9IF8uY3JlYXRlKHBhcmVudC5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGNoaWxkLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNoaWxkO1xuXG4gICAgLy8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZFxuICAgIC8vIGxhdGVyLlxuICAgIGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cbiAgICByZXR1cm4gY2hpbGQ7XG4gIH07XG5cbiAgLy8gU2V0IHVwIGluaGVyaXRhbmNlIGZvciB0aGUgbW9kZWwsIGNvbGxlY3Rpb24sIHJvdXRlciwgdmlldyBhbmQgaGlzdG9yeS5cbiAgTW9kZWwuZXh0ZW5kID0gQ29sbGVjdGlvbi5leHRlbmQgPSBSb3V0ZXIuZXh0ZW5kID0gVmlldy5leHRlbmQgPSBIaXN0b3J5LmV4dGVuZCA9IGV4dGVuZDtcblxuICAvLyBUaHJvdyBhbiBlcnJvciB3aGVuIGEgVVJMIGlzIG5lZWRlZCwgYW5kIG5vbmUgaXMgc3VwcGxpZWQuXG4gIHZhciB1cmxFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQSBcInVybFwiIHByb3BlcnR5IG9yIGZ1bmN0aW9uIG11c3QgYmUgc3BlY2lmaWVkJyk7XG4gIH07XG5cbiAgLy8gV3JhcCBhbiBvcHRpb25hbCBlcnJvciBjYWxsYmFjayB3aXRoIGEgZmFsbGJhY2sgZXJyb3IgZXZlbnQuXG4gIHZhciB3cmFwRXJyb3IgPSBmdW5jdGlvbihtb2RlbCwgb3B0aW9ucykge1xuICAgIHZhciBlcnJvciA9IG9wdGlvbnMuZXJyb3I7XG4gICAgb3B0aW9ucy5lcnJvciA9IGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgIGlmIChlcnJvcikgZXJyb3IuY2FsbChvcHRpb25zLmNvbnRleHQsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICAgIG1vZGVsLnRyaWdnZXIoJ2Vycm9yJywgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIEJhY2tib25lO1xufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuLi9ub2RlX21vZHVsZXMvYmFja2JvbmUvYmFja2JvbmUuanNcbi8vIG1vZHVsZSBpZCA9IDQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL25vZGVfbW9kdWxlcy93ZWJwYWNrL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSA0NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjguM1xuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNSBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kLFxuICAgIG5hdGl2ZUNyZWF0ZSAgICAgICA9IE9iamVjdC5jcmVhdGU7XG5cbiAgLy8gTmFrZWQgZnVuY3Rpb24gcmVmZXJlbmNlIGZvciBzdXJyb2dhdGUtcHJvdG90eXBlLXN3YXBwaW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuOC4zJztcblxuICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXG4gIC8vIGZ1bmN0aW9ucy5cbiAgdmFyIG9wdGltaXplQ2IgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xuICAgIHN3aXRjaCAoYXJnQ291bnQgPT0gbnVsbCA/IDMgOiBhcmdDb3VudCkge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG90aGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBIG1vc3RseS1pbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBjYWxsYmFja3MgdGhhdCBjYW4gYmUgYXBwbGllZFxuICAvLyB0byBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXJcbiAgLy8gaWRlbnRpdHksIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBvcHRpbWl6ZUNiKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVyKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBjYih2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhc3NpZ25lciBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVBc3NpZ25lciA9IGZ1bmN0aW9uKGtleXNGdW5jLCB1bmRlZmluZWRPbmx5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoIDwgMiB8fCBvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXG4gICAgICAgICAgICBrZXlzID0ga2V5c0Z1bmMoc291cmNlKSxcbiAgICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoIXVuZGVmaW5lZE9ubHkgfHwgb2JqW2tleV0gPT09IHZvaWQgMCkgb2JqW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIGFub3RoZXIuXG4gIHZhciBiYXNlQ3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHByb3RvdHlwZSkpIHJldHVybiB7fTtcbiAgICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBDdG9yO1xuICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBwcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gSGVscGVyIGZvciBjb2xsZWN0aW9uIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBjb2xsZWN0aW9uXG4gIC8vIHNob3VsZCBiZSBpdGVyYXRlZCBhcyBhbiBhcnJheSBvciBhcyBhbiBvYmplY3RcbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBwcm9wZXJ0eSgnbGVuZ3RoJyk7XG4gIHZhciBpc0FycmF5TGlrZSA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pO1xuICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGxlbmd0aCA+PSAwICYmIGxlbmd0aCA8PSBNQVhfQVJSQVlfSU5ERVg7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIHJlZHVjaW5nIGZ1bmN0aW9uIGl0ZXJhdGluZyBsZWZ0IG9yIHJpZ2h0LlxuICBmdW5jdGlvbiBjcmVhdGVSZWR1Y2UoZGlyKSB7XG4gICAgLy8gT3B0aW1pemVkIGl0ZXJhdG9yIGZ1bmN0aW9uIGFzIHVzaW5nIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAvLyBpbiB0aGUgbWFpbiBmdW5jdGlvbiB3aWxsIGRlb3B0aW1pemUgdGhlLCBzZWUgIzE5OTEuXG4gICAgZnVuY3Rpb24gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCkge1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBpbml0aWFsIHZhbHVlIGlmIG5vbmUgaXMgcHJvdmlkZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleF07XG4gICAgICAgIGluZGV4ICs9IGRpcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvcihvYmosIGl0ZXJhdGVlLCBtZW1vLCBrZXlzLCBpbmRleCwgbGVuZ3RoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGNyZWF0ZVJlZHVjZSgxKTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBjcmVhdGVSZWR1Y2UoLTEpO1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBrZXk7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgIGtleSA9IF8uZmluZEluZGV4KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5ID0gXy5maW5kS2V5KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKGtleSAhPT0gdm9pZCAwICYmIGtleSAhPT0gLTEpIHJldHVybiBvYmpba2V5XTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKGNiKHByZWRpY2F0ZSkpLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIGl0ZW0gKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZXNgIGFuZCBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGVzID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCBpdGVtLCBmcm9tSW5kZXgsIGd1YXJkKSB7XG4gICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgIGlmICh0eXBlb2YgZnJvbUluZGV4ICE9ICdudW1iZXInIHx8IGd1YXJkKSBmcm9tSW5kZXggPSAwO1xuICAgIHJldHVybiBfLmluZGV4T2Yob2JqLCBpdGVtLCBmcm9tSW5kZXgpID49IDA7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBmdW5jID0gaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXTtcbiAgICAgIHJldHVybiBmdW5jID09IG51bGwgPyBmdW5jIDogZnVuYy5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBzZXQubGVuZ3RoO1xuICAgIHZhciBzaHVmZmxlZCA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCByYW5kOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgIGlmIChyYW5kICE9PSBpbmRleCkgc2h1ZmZsZWRbaW5kZXhdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHNldFtpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gaXNBcnJheUxpa2Uob2JqKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHtcbiAgICAgIChwcmVkaWNhdGUodmFsdWUsIGtleSwgb2JqKSA/IHBhc3MgOiBmYWlsKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIF8ucmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBzdGFydEluZGV4KSB7XG4gICAgdmFyIG91dHB1dCA9IFtdLCBpZHggPSAwO1xuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IHx8IDAsIGxlbmd0aCA9IGdldExlbmd0aChpbnB1dCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaW5wdXRbaV07XG4gICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAvL2ZsYXR0ZW4gY3VycmVudCBsZXZlbCBvZiBhcnJheSBvciBhcmd1bWVudHMgb2JqZWN0XG4gICAgICAgIGlmICghc2hhbGxvdykgdmFsdWUgPSBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBzdHJpY3QpO1xuICAgICAgICB2YXIgaiA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgb3V0cHV0Lmxlbmd0aCArPSBsZW47XG4gICAgICAgIHdoaWxlIChqIDwgbGVuKSB7XG4gICAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXN0cmljdCkge1xuICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IGNvbXB1dGVkKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSBjb21wdXRlZDtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHNlZW4sIGNvbXB1dGVkKSkge1xuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFfLmNvbnRhaW5zKHJlc3VsdCwgdmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuemlwKGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQ29tcGxlbWVudCBvZiBfLnppcC4gVW56aXAgYWNjZXB0cyBhbiBhcnJheSBvZiBhcnJheXMgYW5kIGdyb3Vwc1xuICAvLyBlYWNoIGFycmF5J3MgZWxlbWVudHMgb24gc2hhcmVkIGluZGljZXNcbiAgXy51bnppcCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIGxlbmd0aCA9IGFycmF5ICYmIF8ubWF4KGFycmF5LCBnZXRMZW5ndGgpLmxlbmd0aCB8fCAwO1xuICAgIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmVzdWx0W2luZGV4XSA9IF8ucGx1Y2soYXJyYXksIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgobGlzdCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGZpbmRJbmRleCBhbmQgZmluZExhc3RJbmRleCBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgaW5kZXggb24gYW4gYXJyYXktbGlrZSB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0XG4gIF8uZmluZEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoMSk7XG4gIF8uZmluZExhc3RJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKC0xKTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xuICAgICAgaWYgKGl0ZXJhdGVlKGFycmF5W21pZF0pIDwgdmFsdWUpIGxvdyA9IG1pZCArIDE7IGVsc2UgaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBpbmRleE9mIGFuZCBsYXN0SW5kZXhPZiBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlSW5kZXhGaW5kZXIoZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgICAgaSA9IGlkeCA+PSAwID8gaWR4IDogTWF0aC5tYXgoaWR4ICsgbGVuZ3RoLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGlkeCA+PSAwID8gTWF0aC5taW4oaWR4ICsgMSwgbGVuZ3RoKSA6IGlkeCArIGxlbmd0aCArIDE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc29ydGVkSW5kZXggJiYgaWR4ICYmIGxlbmd0aCkge1xuICAgICAgICBpZHggPSBzb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpZHhdID09PSBpdGVtID8gaWR4IDogLTE7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbSAhPT0gaXRlbSkge1xuICAgICAgICBpZHggPSBwcmVkaWNhdGVGaW5kKHNsaWNlLmNhbGwoYXJyYXksIGksIGxlbmd0aCksIF8uaXNOYU4pO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgPyBpZHggKyBpIDogLTE7XG4gICAgICB9XG4gICAgICBmb3IgKGlkeCA9IGRpciA+IDAgPyBpIDogbGVuZ3RoIC0gMTsgaWR4ID49IDAgJiYgaWR4IDwgbGVuZ3RoOyBpZHggKz0gZGlyKSB7XG4gICAgICAgIGlmIChhcnJheVtpZHhdID09PSBpdGVtKSByZXR1cm4gaWR4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgdmFyIGV4ZWN1dGVCb3VuZCA9IGZ1bmN0aW9uKHNvdXJjZUZ1bmMsIGJvdW5kRnVuYywgY29udGV4dCwgY2FsbGluZ0NvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIShjYWxsaW5nQ29udGV4dCBpbnN0YW5jZW9mIGJvdW5kRnVuYykpIHJldHVybiBzb3VyY2VGdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIHZhciBzZWxmID0gYmFzZUNyZWF0ZShzb3VyY2VGdW5jLnByb3RvdHlwZSk7XG4gICAgdmFyIHJlc3VsdCA9IHNvdXJjZUZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBfID8gYXJndW1lbnRzW3Bvc2l0aW9uKytdIDogYm91bmRBcmdzW2ldO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCB0aGlzLCB0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9ICcnICsgKGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5KTtcbiAgICAgIGlmICghXy5oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBfLnBhcnRpYWwoXy5kZWxheSwgXywgMSk7XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcblxuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb24gYW5kIGFmdGVyIHRoZSBOdGggY2FsbC5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgdXAgdG8gKGJ1dCBub3QgaW5jbHVkaW5nKSB0aGUgTnRoIGNhbGwuXG4gIF8uYmVmb3JlID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICB2YXIgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lcyA8PSAxKSBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IF8ucGFydGlhbChfLmJlZm9yZSwgMik7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gS2V5cyBpbiBJRSA8IDkgdGhhdCB3b24ndCBiZSBpdGVyYXRlZCBieSBgZm9yIGtleSBpbiAuLi5gIGFuZCB0aHVzIG1pc3NlZC5cbiAgdmFyIGhhc0VudW1CdWcgPSAhe3RvU3RyaW5nOiBudWxsfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuICBmdW5jdGlvbiBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cykge1xuICAgIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgICB2YXIgY29uc3RydWN0b3IgPSBvYmouY29uc3RydWN0b3I7XG4gICAgdmFyIHByb3RvID0gKF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlKSB8fCBPYmpQcm90bztcblxuICAgIC8vIENvbnN0cnVjdG9yIGlzIGEgc3BlY2lhbCBjYXNlLlxuICAgIHZhciBwcm9wID0gJ2NvbnN0cnVjdG9yJztcbiAgICBpZiAoXy5oYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdFxuICAvLyBJbiBjb250cmFzdCB0byBfLm1hcCBpdCByZXR1cm5zIGFuIG9iamVjdFxuICBfLm1hcE9iamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICBfLmtleXMob2JqKSxcbiAgICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHRzID0ge30sXG4gICAgICAgICAgY3VycmVudEtleTtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY3VycmVudEtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgICByZXN1bHRzW2N1cnJlbnRLZXldID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMpO1xuXG4gIC8vIEFzc2lnbnMgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG93biBwcm9wZXJ0aWVzIGluIHRoZSBwYXNzZWQtaW4gb2JqZWN0KHMpXG4gIC8vIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduKVxuICBfLmV4dGVuZE93biA9IF8uYXNzaWduID0gY3JlYXRlQXNzaWduZXIoXy5rZXlzKTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBrZXkgb24gYW4gb2JqZWN0IHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqZWN0LCBvaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIG9iaiA9IG9iamVjdCwgaXRlcmF0ZWUsIGtleXM7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24ob2l0ZXJhdGVlKSkge1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKG9pdGVyYXRlZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleXMgPSBmbGF0dGVuKGFyZ3VtZW50cywgZmFsc2UsIGZhbHNlLCAxKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7IHJldHVybiBrZXkgaW4gb2JqOyB9O1xuICAgICAgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5uZWdhdGUoaXRlcmF0ZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ubWFwKGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzLCB0cnVlKTtcblxuICAvLyBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIGdpdmVuIHByb3RvdHlwZSBvYmplY3QuXG4gIC8vIElmIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhcmUgcHJvdmlkZWQgdGhlbiB0aGV5IHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4gIC8vIGNyZWF0ZWQgb2JqZWN0LlxuICBfLmNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSwgcHJvcHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIGlmIChwcm9wcykgXy5leHRlbmRPd24ocmVzdWx0LCBwcm9wcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uaXNNYXRjaCA9IGZ1bmN0aW9uKG9iamVjdCwgYXR0cnMpIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhhdHRycyksIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuICFsZW5ndGg7XG4gICAgdmFyIG9iaiA9IE9iamVjdChvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG5cbiAgICB2YXIgYXJlQXJyYXlzID0gY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIGlmICghYXJlQXJyYXlzKSB7XG4gICAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzIG9yIGBBcnJheWBzXG4gICAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuXG4gICAgLy8gSW5pdGlhbGl6aW5nIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIC8vIEl0J3MgZG9uZSBoZXJlIHNpbmNlIHdlIG9ubHkgbmVlZCB0aGVtIGZvciBvYmplY3RzIGFuZCBhcnJheXMgY29tcGFyaXNvbi5cbiAgICBhU3RhY2sgPSBhU3RhY2sgfHwgW107XG4gICAgYlN0YWNrID0gYlN0YWNrIHx8IFtdO1xuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoYXJlQXJyYXlzKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIGxlbmd0aCA9IGEubGVuZ3RoO1xuICAgICAgaWYgKGxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKCFlcShhW2xlbmd0aF0sIGJbbGVuZ3RoXSwgYVN0YWNrLCBiU3RhY2spKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoYSksIGtleTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgaWYgKF8ua2V5cyhiKS5sZW5ndGggIT09IGxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICBrZXkgPSBrZXlzW2xlbmd0aF07XG4gICAgICAgIGlmICghKF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSA8IDkpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBzb21lIHR5cGVvZiBidWdzIGluIG9sZCB2OCxcbiAgLy8gSUUgMTEgKCMxNjIxKSwgYW5kIGluIFNhZmFyaSA4ICgjMTkyOSkuXG4gIGlmICh0eXBlb2YgLy4vICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mIEludDhBcnJheSAhPSAnb2JqZWN0Jykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8vIFByZWRpY2F0ZS1nZW5lcmF0aW5nIGZ1bmN0aW9ucy4gT2Z0ZW4gdXNlZnVsIG91dHNpZGUgb2YgVW5kZXJzY29yZS5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5ub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gIF8ucHJvcGVydHkgPSBwcm9wZXJ0eTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT0gbnVsbCA/IGZ1bmN0aW9uKCl7fSA6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZXNjYXBlTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjeDI3OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xuICB9O1xuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWFwW21hdGNoXTtcbiAgICB9O1xuICAgIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZFxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIGZhbGxiYWNrKSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0ID09IG51bGwgPyB2b2lkIDAgOiBvYmplY3RbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICB2YWx1ZSA9IGZhbGxiYWNrO1xuICAgIH1cbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgfTtcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAvLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBzZXR0aW5ncywgb2xkU2V0dGluZ3MpIHtcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVyLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZlc3QuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdmFyIGFyZ3VtZW50ID0gc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaic7XG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLiBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XG4gICAgaW5zdGFuY2UuX2NoYWluID0gdHJ1ZTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBvYmopIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gUHJvdmlkZSB1bndyYXBwaW5nIHByb3h5IGZvciBzb21lIG1ldGhvZHMgdXNlZCBpbiBlbmdpbmUgb3BlcmF0aW9uc1xuICAvLyBzdWNoIGFzIGFyaXRobWV0aWMgYW5kIEpTT04gc3RyaW5naWZpY2F0aW9uLlxuICBfLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XG5cbiAgXy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJycgKyB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufS5jYWxsKHRoaXMpKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanNcbi8vIG1vZHVsZSBpZCA9IDQ3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBtYXAgPSB7XG5cdFwiLi9sYXlvdXQvbWFpbi1mb290ZXIuZG90XCI6IDQ5LFxuXHRcIi4vbGF5b3V0L21haW4taGVhZGVyLmRvdFwiOiA1MCxcblx0XCIuL3BhZ2VzL2Fib3V0LXBhZ2UuZG90XCI6IDUxLFxuXHRcIi4vcGFnZXMvY29udGFjdC1wYWdlLmRvdFwiOiA1Mixcblx0XCIuL3BhZ2VzL3BvcnRmb2xpby1wYWdlLmRvdFwiOiA1Myxcblx0XCIuL3BhZ2VzL3NraWxscy1wYWdlLmRvdFwiOiA1NFxufTtcbmZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0KHJlcSkge1xuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyh3ZWJwYWNrQ29udGV4dFJlc29sdmUocmVxKSk7XG59O1xuZnVuY3Rpb24gd2VicGFja0NvbnRleHRSZXNvbHZlKHJlcSkge1xuXHR2YXIgaWQgPSBtYXBbcmVxXTtcblx0aWYoIShpZCArIDEpKSAvLyBjaGVjayBmb3IgbnVtYmVyIG9yIHN0cmluZ1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyByZXEgKyBcIicuXCIpO1xuXHRyZXR1cm4gaWQ7XG59O1xud2VicGFja0NvbnRleHQua2V5cyA9IGZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0S2V5cygpIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hcCk7XG59O1xud2VicGFja0NvbnRleHQucmVzb2x2ZSA9IHdlYnBhY2tDb250ZXh0UmVzb2x2ZTtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0NvbnRleHQ7XG53ZWJwYWNrQ29udGV4dC5pZCA9IDQ4O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGVtcGxhdGVzIF5cXC5cXC8uKlxcLmRvdCRcbi8vIG1vZHVsZSBpZCA9IDQ4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYW5vbnltb3VzKGl0XG4vKmBgKi8pIHtcbnZhciBvdXQ9JzxhIGhyZWY9XCInKyhpdC50ZXh0UmVzdW1lTGluaykrJ1wiIGNsYXNzPVwiZG93bmxvYWQtY3ZcIj4gPGkgY2xhc3M9XCJmYSBmYS1kb3dubG9hZFwiPjwvaT4gPHNwYW4+RG93bmxvYWQgY3Y8L3NwYW4+PC9hPic7cmV0dXJuIG91dDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3RlbXBsYXRlcy9sYXlvdXQvbWFpbi1mb290ZXIuZG90XG4vLyBtb2R1bGUgaWQgPSA0OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFub255bW91cyhpdFxuLypgYCovKSB7XG52YXIgb3V0PSc8ZmlndXJlIGNsYXNzPVwiYXZhdGFyXCI+IDxmaWdjYXB0aW9uIGNsYXNzPVwiYXZhdGFyLXRpdGxlXCI+JysoaXQuY29tbW9uSW5mby5mdWxsTmFtZSkrJzwvZmlnY2FwdGlvbj4gPGltZyBzcmM9XCInKyhpdC5jb21tb25JbmZvLmF2YXRhclNyYykrJ1wiIGFsdD1cImF2YXRhclwiLz48L2ZpZ3VyZT48dWwgY2xhc3M9XCJtYWluLW5hdlwiPiA8bGkgY2xhc3M9XCJtYWluLW5hdi1saVwiPiA8YSBocmVmPVwiL1wiIGNsYXNzPVwibWFpbi1uYXYtaXRlbSBmbi1uYXYtaXRlbSBhY3RpdmVcIj4gPGkgY2xhc3M9XCJmYSBmYS11c2VyXCI+PC9pPiA8c3Bhbj5BYm91dDwvc3Bhbj4gPC9hPiA8L2xpPiA8bGkgY2xhc3M9XCJtYWluLW5hdi1saVwiPiA8YSBocmVmPVwiL3NraWxsc1wiIGNsYXNzPVwibWFpbi1uYXYtaXRlbSBmbi1uYXYtaXRlbVwiPiA8aSBjbGFzcz1cImZhIGZhLWdlYXJzXCI+PC9pPiA8c3Bhbj5Ta2lsbHM8L3NwYW4+IDwvYT4gPC9saT4gPGxpIGNsYXNzPVwibWFpbi1uYXYtbGlcIj4gPGEgaHJlZj1cIi9wb3J0Zm9saW9cIiBjbGFzcz1cIm1haW4tbmF2LWl0ZW0gZm4tbmF2LWl0ZW1cIj4gPGkgY2xhc3M9XCJmYSBmYS1mb2xkZXJcIj48L2k+IDxzcGFuPlBvcnRmb2xpbzwvc3Bhbj4gPC9hPiA8L2xpPiA8bGkgY2xhc3M9XCJtYWluLW5hdi1saVwiPiA8YSBocmVmPVwiL2NvbnRhY3RcIiBjbGFzcz1cIm1haW4tbmF2LWl0ZW0gZm4tbmF2LWl0ZW1cIj4gPGkgY2xhc3M9XCJmYSBmYS1waG9uZVwiPjwvaT4gPHNwYW4+Q29udGFjdDwvc3Bhbj4gPC9hPiA8L2xpPjwvdWw+PHVsIGNsYXNzPVwic29jaWFsLWxpbmtzXCI+ICc7dmFyIGFycjE9aXQuc29jaWFsTGlua3M7aWYoYXJyMSl7dmFyIGxpbmssaTE9LTEsbDE9YXJyMS5sZW5ndGgtMTt3aGlsZShpMTxsMSl7bGluaz1hcnIxW2kxKz0xXTtvdXQrPScgPGxpIGNsYXNzPVwic29jaWFsLWxpbmtzLWxpXCI+IDxhIGhyZWY9XCInKyhsaW5rLmhyZWYpKydcIiB0YXJnZXQ9XCJfYmxhbmtcIj48aSBjbGFzcz1cImZhIGZhLScrKGxpbmsuaWNvbikrJ1wiPjwvaT48L2E+IDwvbGk+ICc7fSB9IG91dCs9JzwvdWw+JztyZXR1cm4gb3V0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGVtcGxhdGVzL2xheW91dC9tYWluLWhlYWRlci5kb3Rcbi8vIG1vZHVsZSBpZCA9IDUwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYW5vbnltb3VzKGl0XG4vKmBgKi8pIHtcbnZhciBvdXQ9JzxkaXYgY2xhc3M9XCJwYWdlIGFib3V0LXBhZ2VcIj4gPHNlY3Rpb24gY2xhc3M9XCJzZWN0aW9uIHdob19pX2FtIGZuLXNlY3Rpb25cIj4gPGgxIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPldobyBpIGFtPC9oMT4gPGgyIGNsYXNzPVwid2hvX2lfYW0tdGl0bGVcIj4gPHNwYW4gY2xhc3M9XCJ3aG9faV9hbS10aXRsZV9fbmFtZVwiPicrKGl0LmNvbW1vbkluZm8uZnVsbE5hbWUpKyc8L3NwYW4+IDxzcGFuIGNsYXNzPVwid2hvX2lfYW0tdGl0bGVfX3Bvc2l0aW9uXCI+JysoaXQuY29tbW9uSW5mby5wb3NpdGlvbikrJzwvc3Bhbj4gPC9oMj4gPHAgY2xhc3M9XCJ3aG9faV9hbS1hYm91dFwiPicrKGl0LmNvbW1vbkluZm8uaW50cm9Xb3JkcykrJzwvcD4gPHRhYmxlIGNsYXNzPVwid2hvX2lfYW0tdGFibGVcIj4gPHRib2R5PiAnO3ZhciBhcnIxPWl0LmNvbW1vbkluZm8uZGV0YWlscztpZihhcnIxKXt2YXIgZGV0YWlsLGkxPS0xLGwxPWFycjEubGVuZ3RoLTE7d2hpbGUoaTE8bDEpe2RldGFpbD1hcnIxW2kxKz0xXTtvdXQrPScgPHRyIGNsYXNzPVwid2hvX2lfYW0tdGFibGVfX3RyXCI+IDx0ZCBjbGFzcz1cIndob19pX2FtLXRhYmxlX190aFwiPicrKGRldGFpbC50aXRsZSkrJzwvdGQ+IDx0ZCBjbGFzcz1cIndob19pX2FtLXRhYmxlX190ZFwiPicrKGRldGFpbC52YWx1ZSkrJzwvdGQ+IDwvdHI+ICc7fSB9IG91dCs9JyA8L3Rib2R5PiA8L3RhYmxlPiA8L3NlY3Rpb24+IDxzZWN0aW9uIGNsYXNzPVwic2VjdGlvbiBmbi1zZWN0aW9uXCI+IDxoMiBjbGFzcz1cInNlY3Rpb24tdGl0bGVcIj5FZHVjYXRpb248L2gyPiA8dWwgY2xhc3M9XCJleHAtbGlzdFwiPiA8aSBjbGFzcz1cImZhIGZhLWdyYWR1YXRpb24tY2FwIGV4cC1saXN0LXRpdGxlX2ljb25cIj48L2k+ICc7dmFyIGFycjI9aXQuZWR1Y2F0aW9uO2lmKGFycjIpe3ZhciBlZHUsaTI9LTEsbDI9YXJyMi5sZW5ndGgtMTt3aGlsZShpMjxsMil7ZWR1PWFycjJbaTIrPTFdO291dCs9JyA8bGkgY2xhc3M9XCJleHAtbGlzdC1pdGVtIGZuLXZpc2libGUtaXRlbVwiPiA8aDMgY2xhc3M9XCJleHAtbGlzdC1pdGVtX190aXRsZVwiPiA8c3BhbiBjbGFzcz1cImV4cC1saXN0LWl0ZW1fX3RpdGxlX19wb3NpdGlvblwiPicrKGVkdS5wb3NpdGlvbikrJzwvc3Bhbj4gJm5ic3A7LSZuYnNwOyA8c3BhbiBjbGFzcz1cImV4cC1saXN0LWl0ZW1fX3RpdGxlX19wbGFjZVwiPicrKGVkdS5wbGFjZSkrJzwvc3Bhbj4gPC9oMz4gPGRpdiBjbGFzcz1cImV4cC1saXN0LWl0ZW1fX2RhdGVcIj4gPGkgY2xhc3M9XCJmYSBmYS1jYWxlbmRhciBleHAtbGlzdC1pdGVtX19kYXRlX19pY29uXCI+PC9pPiA8c3BhbiBjbGFzcz1cImV4cC1saXN0LWl0ZW1fX2RhdGVfX3N0YXJ0XCI+JysoZWR1LnN0YXJ0RGF0ZSkrJzwvc3Bhbj4gJm5ic3A7LSZuYnNwOyA8c3BhbiBjbGFzcz1cImV4cC1saXN0LWl0ZW1fX2RhdGVfX2VuZFwiPicrKGVkdS5lbmREYXRlKSsnPC9zcGFuPiA8L2Rpdj4gPHAgY2xhc3M9XCJleHAtbGlzdC1pdGVtX19kZXNjcmlwdGlvblwiPicrKGVkdS5kZXNjcmlwdGlvbikrJzwvcD4gPC9saT4gJzt9IH0gb3V0Kz0nIDwvdWw+IDwvc2VjdGlvbj4gPHNlY3Rpb24gY2xhc3M9XCJzZWN0aW9uIGZuLXNlY3Rpb25cIj4gPGgyIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPkV4cGVyaWVuY2U8L2gyPiA8dWwgY2xhc3M9XCJleHAtbGlzdFwiPiA8aSBjbGFzcz1cImZhIGZhLWJyaWVmY2FzZSBleHAtbGlzdC10aXRsZV9pY29uXCI+PC9pPiAnO3ZhciBhcnIzPWl0LmV4cGlyaWVuY2U7aWYoYXJyMyl7dmFyIGV4cCxpMz0tMSxsMz1hcnIzLmxlbmd0aC0xO3doaWxlKGkzPGwzKXtleHA9YXJyM1tpMys9MV07b3V0Kz0nIDxsaSBjbGFzcz1cImV4cC1saXN0LWl0ZW0gZm4tdmlzaWJsZS1pdGVtXCI+IDxoMyBjbGFzcz1cImV4cC1saXN0LWl0ZW1fX3RpdGxlXCI+IDxzcGFuIGNsYXNzPVwiZXhwLWxpc3QtaXRlbV9fdGl0bGVfX3Bvc2l0aW9uXCI+JysoZXhwLnBvc2l0aW9uKSsnPC9zcGFuPiAmbmJzcDstJm5ic3A7IDxzcGFuIGNsYXNzPVwiZXhwLWxpc3QtaXRlbV9fdGl0bGVfX3BsYWNlXCI+JysoZXhwLnBsYWNlKSsnPC9zcGFuPiA8L2gzPiA8ZGl2IGNsYXNzPVwiZXhwLWxpc3QtaXRlbV9fZGF0ZVwiPiA8aSBjbGFzcz1cImZhIGZhLWNhbGVuZGFyIGV4cC1saXN0LWl0ZW1fX2RhdGVfX2ljb25cIj48L2k+IDxzcGFuIGNsYXNzPVwiZXhwLWxpc3QtaXRlbV9fZGF0ZV9fc3RhcnRcIj4nKyhleHAuc3RhcnREYXRlKSsnPC9zcGFuPiAmbmJzcDstJm5ic3A7IDxzcGFuIGNsYXNzPVwiZXhwLWxpc3QtaXRlbV9fZGF0ZV9fZW5kXCI+JysoZXhwLmVuZERhdGUpKyc8L3NwYW4+IDwvZGl2PiA8cCBjbGFzcz1cImV4cC1saXN0LWl0ZW1fX2Rlc2NyaXB0aW9uXCI+JysoZXhwLmRlc2NyaXB0aW9uKSsnPC9wPiA8L2xpPiAnO30gfSBvdXQrPScgPC91bD4gPC9zZWN0aW9uPiA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24gZm4tc2VjdGlvblwiPiA8aDEgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCI+U2VydmljZXM8L2gxPiA8dWwgY2xhc3M9XCJpY29ucy1saXN0XCI+ICc7dmFyIGFycjQ9aXQuc2VydmljZXM7aWYoYXJyNCl7dmFyIHNlcnZpY2UsaTQ9LTEsbDQ9YXJyNC5sZW5ndGgtMTt3aGlsZShpNDxsNCl7c2VydmljZT1hcnI0W2k0Kz0xXTtvdXQrPScgPGxpIGNsYXNzPVwiaWNvbnMtbGlzdC1pdGVtIGZuLXZpc2libGUtaXRlbVwiPiA8aSBjbGFzcz1cImZhIGZhLScrKHNlcnZpY2UuaWNvbikrJyBpY29ucy1saXN0LWl0ZW1fX2ljb25cIj48L2k+IDxoNCBjbGFzcz1cImljb25zLWxpc3QtaXRlbV9fdGl0bGVcIj4nKyhzZXJ2aWNlLnRpdGxlKSsnPC9oND4gPHAgY2xhc3M9XCJpY29ucy1saXN0LWl0ZW1fX2Rlc2NyaXB0aW9uXCI+Jysoc2VydmljZS5kZXNjcmlwdGlvbikrJzwvcD4gPC9saT4gJzt9IH0gb3V0Kz0nIDwvdWw+IDwvc2VjdGlvbj4gPHNlY3Rpb24gY2xhc3M9XCJzZWN0aW9uIGZuLXNlY3Rpb25cIj4gPGgxIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPkhvYmJpZXM8L2gxPiA8dWwgY2xhc3M9XCJpY29ucy1saXN0XCI+ICc7dmFyIGFycjU9aXQuaG9iYmllcztpZihhcnI1KXt2YXIgaG9iYnksaTU9LTEsbDU9YXJyNS5sZW5ndGgtMTt3aGlsZShpNTxsNSl7aG9iYnk9YXJyNVtpNSs9MV07b3V0Kz0nIDxsaSBjbGFzcz1cImljb25zLWxpc3QtaXRlbSBmbi12aXNpYmxlLWl0ZW1cIj4gPGkgY2xhc3M9XCJmYSBmYS0nKyhob2JieS5pY29uKSsnIGljb25zLWxpc3QtaXRlbV9faWNvblwiPjwvaT4gPGg0IGNsYXNzPVwiaWNvbnMtbGlzdC1pdGVtX190aXRsZVwiPicrKGhvYmJ5LnRpdGxlKSsnPC9oND4gPHAgY2xhc3M9XCJpY29ucy1saXN0LWl0ZW1fX2Rlc2NyaXB0aW9uXCI+JysoaG9iYnkuZGVzY3JpcHRpb24pKyc8L3A+IDwvbGk+ICc7fSB9IG91dCs9JyA8L3VsPiA8L3NlY3Rpb24+PC9kaXY+JztyZXR1cm4gb3V0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGVtcGxhdGVzL3BhZ2VzL2Fib3V0LXBhZ2UuZG90XG4vLyBtb2R1bGUgaWQgPSA1MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFub255bW91cyhpdFxuLypgYCovKSB7XG52YXIgb3V0PScnOyB2YXIgY29udGFjdHMgPSBpdC5jb21tb25JbmZvLmRldGFpbHMuZmlsdGVyKGZ1bmN0aW9uIChkZXRhaWwpIHsgcmV0dXJuIGRldGFpbC5jb250YWN0OyB9KTsgb3V0Kz0nPGRpdiBjbGFzcz1cInBhZ2UgYWJvdXQtcGFnZVwiPiA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24gd2hvX2lfYW1cIj4gPGgxIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPk1hcCBsb2NhdGlvbjwvaDE+IDxkaXYgY2xhc3M9XCJjb250YWN0LW1hcFwiPiA8ZGl2IGNsYXNzPVwiY29udGFjdC1tYXAtaW5zdGFuY2UgZm4tbWFwXCI+PC9kaXY+IDwvZGl2PiA8L3NlY3Rpb24+IDxzZWN0aW9uIGNsYXNzPVwic2VjdGlvblwiPiA8aDEgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCI+Q29udGFjdCBJbmZvPC9oMT4gJzt2YXIgYXJyMT1jb250YWN0cztpZihhcnIxKXt2YXIgY29udGFjdCxpMT0tMSxsMT1hcnIxLmxlbmd0aC0xO3doaWxlKGkxPGwxKXtjb250YWN0PWFycjFbaTErPTFdO291dCs9JyA8ZGl2IGNsYXNzPVwiY29udGFjdC1pbmZvXCI+ICc7aWYoY29udGFjdC5pc0xpbmspe291dCs9JyA8YSBocmVmPVwiJysoY29udGFjdC5saW5rVHlwZSB8fCAnJykrKGNvbnRhY3QudmFsdWUpKydcIiBjbGFzcz1cImNvbnRhY3QtaW5mby1pY29uIGxpbmtcIj4gPGkgY2xhc3M9XCJmYSBmYS0nKyhjb250YWN0LmNvbnRhY3RJY29uKSsnXCI+PC9pPiA8L2E+ICc7fWVsc2V7b3V0Kz0nIDxzcGFuIGNsYXNzPVwiY29udGFjdC1pbmZvLWljb25cIj4gPGkgY2xhc3M9XCJmYSBmYS0nKyhjb250YWN0LmNvbnRhY3RJY29uKSsnXCI+PC9pPiA8L3NwYW4+ICc7fW91dCs9JyA8aDUgY2xhc3M9XCJjb250YWN0LWluZm8tdGV4dFwiPicrKGNvbnRhY3QudmFsdWUpKyc8L2g1PiA8L2Rpdj4gJzt9IH0gb3V0Kz0nIDwvc2VjdGlvbj48L2Rpdj4nO3JldHVybiBvdXQ7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi90ZW1wbGF0ZXMvcGFnZXMvY29udGFjdC1wYWdlLmRvdFxuLy8gbW9kdWxlIGlkID0gNTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhbm9ueW1vdXMoaXRcbi8qYGAqLykge1xudmFyIG91dD0nPGRpdiBjbGFzcz1cInBhZ2UgYWJvdXQtcGFnZVwiPiA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24gd2hvX2lfYW0gZm4tc2VjdGlvblwiPiA8aDEgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCI+UG9ydGZvbGlvPC9oMT4gPHVsIGNsYXNzPVwicG9ydGZvbGlvLWxpc3RcIj4gJzt2YXIgYXJyMT1pdC5wcm9qZWN0cztpZihhcnIxKXt2YXIgcHJvamVjdCxpMT0tMSxsMT1hcnIxLmxlbmd0aC0xO3doaWxlKGkxPGwxKXtwcm9qZWN0PWFycjFbaTErPTFdO291dCs9JyA8bGkgY2xhc3M9XCJwb3J0Zm9saW8tbGlzdC1pdGVtIGZuLWl0ZW1cIj4gPGltZyBjbGFzcz1cInBvcnRmb2xpby1saXN0LWl0ZW1fX2ltZ1wiIHNyYz1cIicrKHByb2plY3QuaW1nKSsnXCIgYWx0PVwicG9ydGZvbGlvXCIvPiA8YSBjbGFzcz1cInBvcnRmb2xpby1saXN0LWl0ZW1fX292ZXJsYXlcIiBocmVmPVwiJysocHJvamVjdC5ocmVmKSsnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+IDxzcGFuIGNsYXNzPVwicG9ydGZvbGlvLWxpc3QtaXRlbV9fb3ZlcmxheV9fY2VudGVyXCI+IDxzcGFuIGNsYXNzPVwicG9ydGZvbGlvLWxpc3QtaXRlbV9fb3ZlcmxheV9fbmFtZVwiPicrKHByb2plY3QubmFtZSkrJzwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJwb3J0Zm9saW8tbGlzdC1pdGVtX19vdmVybGF5X19wb3NpdGlvblwiPicrKHByb2plY3QucG9zaXRpb24pKyc8L3NwYW4+IDwvc3Bhbj4gPC9hPiA8L2xpPiAnO30gfSBvdXQrPScgPC91bD4gPC9zZWN0aW9uPjwvZGl2Pic7cmV0dXJuIG91dDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3RlbXBsYXRlcy9wYWdlcy9wb3J0Zm9saW8tcGFnZS5kb3Rcbi8vIG1vZHVsZSBpZCA9IDUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYW5vbnltb3VzKGl0XG4vKmBgKi8pIHtcbnZhciBvdXQ9JzxkaXYgY2xhc3M9XCJwYWdlIHNraWxsLXBhZ2VcIj4gPHNlY3Rpb24gY2xhc3M9XCJzZWN0aW9uIGZuLXNlY3Rpb25cIj4gPGgxIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPlRlY2ggU2tpbGxzPC9oMT4gPHVsIGNsYXNzPVwidGVjaC1za2lsbHNcIj4gJzt2YXIgYXJyMT1pdC5jb21tb25UZWNoU2tpbGxzO2lmKGFycjEpe3ZhciBza2lsbCxpMT0tMSxsMT1hcnIxLmxlbmd0aC0xO3doaWxlKGkxPGwxKXtza2lsbD1hcnIxW2kxKz0xXTtvdXQrPScgPGxpIGNsYXNzPVwidGVjaC1za2lsbHMtaXRlbVwiPiA8ZGl2IGNsYXNzPVwidGVjaC1za2lsbHMtdGl0bGVcIj4gPGg0IGNsYXNzPVwidGVjaC1za2lsbHMtdGl0bGVfX25hbWVcIj4nKyhza2lsbC50aXRsZSkrJzwvaDQ+IDxwIGNsYXNzPVwidGVjaC1za2lsbHMtdGl0bGVfX2Rlc2NyaXB0aW9uXCI+Jysoc2tpbGwuZGVzY3JpcHRpb24pKyc8L3A+IDxkaXYgY2xhc3M9XCJ0ZWNoLXNraWxscy10aXRsZV9fa2V5d29yZHNcIj4gPHNwYW4gY2xhc3M9XCJ0ZWNoLXNraWxscy10aXRsZV9fa2V5d29yZHNfX2xhYmVsXCI+S2V5d29yZHM6PC9zcGFuPiA8c3BhbiBjbGFzcz1cInRlY2gtc2tpbGxzLXRpdGxlX19rZXl3b3Jkc19fdGV4dFwiPicrKHNraWxsLmtleXdvcmRzKSsnPC9zcGFuPiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJ0ZWNoLXNraWxscy1wcm9ncmVzcyBmbi10ZWNoLXNraWxscy1wcm9ncmVzcyBmbi1wcm9ncmVzc1wiIGRhdGEtcHJvZ3Jlc3M9XCJjaXJjbGVcIiBkYXRhLXBlcmNlbnQ9XCInKyhza2lsbC5sZXZlbCkrJ1wiIGRhdGEtY29sb3I9XCIjNTU4ZTZhXCIgZGF0YS1mb250LWNvbG9yPVwiIzU1OGU2YVwiIGRhdGEtbGluZS13aWR0aD1cIjVcIj4xMjM8L2Rpdj4gPC9saT4gJzt9IH0gb3V0Kz0nIDwvdWw+IDwvc2VjdGlvbj4gPHNlY3Rpb24gY2xhc3M9XCJzZWN0aW9uIGZuLXNlY3Rpb25cIj4gPGgxIGNsYXNzPVwic2VjdGlvbi10aXRsZVwiPkxhbmd1YWdlcyBTa2lsbHM8L2gxPiA8dWwgY2xhc3M9XCJsYW5ndWFnZS1za2lsbHNcIj4gJzt2YXIgYXJyMj1pdC5sYW5ndWFnZVNraWxscztpZihhcnIyKXt2YXIgc2tpbGwsaTI9LTEsbDI9YXJyMi5sZW5ndGgtMTt3aGlsZShpMjxsMil7c2tpbGw9YXJyMltpMis9MV07b3V0Kz0nIDxsaSBjbGFzcz1cImxhbmd1YWdlLXNraWxscy1pdGVtXCI+IDxoNCBjbGFzcz1cImxhbmd1YWdlLXNraWxscy10aXRsZVwiPicrKHNraWxsLnRpdGxlKSsnIDxzcGFuIGNsYXNzPVwic21hbGxcIj4nKyhza2lsbC5sZXZlbEluV29yZHMpKyc8L3NwYW4+PC9oND4gPGRpdiBjbGFzcz1cImxhbmd1YWdlLXNraWxscy1wcm9ncmVzcyBmbi1sYW5ndWFnZS1za2lsbHMtcHJvZ3Jlc3MgZm4tcHJvZ3Jlc3NcIiBkYXRhLXByb2dyZXNzPVwibGluZWFyXCIgZGF0YS1wZXJjZW50PVwiJysoc2tpbGwubGV2ZWwpKydcIiBkYXRhLWNvbG9yPVwiIzU1OGU2YVwiPjwvZGl2PiA8cCBjbGFzcz1cImxhbmd1YWdlLXNraWxscy1kZXNjcmlwdGlvblwiPicrKHNraWxsLmRlc2NyaXB0aW9uKSsnPC9wPiA8L2xpPiAnO30gfSBvdXQrPScgPC91bD4gPC9zZWN0aW9uPiA8c2VjdGlvbiBjbGFzcz1cInNlY3Rpb24gZm4tc2VjdGlvblwiPiA8aDEgY2xhc3M9XCJzZWN0aW9uLXRpdGxlXCI+VG9vbHMgU2tpbGxzPC9oMT4gPHVsIGNsYXNzPVwidG9vbHMtc2tpbGxzXCI+ICc7dmFyIGFycjM9aXQudG9vbHNTa2lsbHM7aWYoYXJyMyl7dmFyIHNraWxsLGkzPS0xLGwzPWFycjMubGVuZ3RoLTE7d2hpbGUoaTM8bDMpe3NraWxsPWFycjNbaTMrPTFdO291dCs9JyA8bGkgY2xhc3M9XCJ0b29scy1za2lsbHMtaXRlbVwiPiA8aDQgY2xhc3M9XCJ0b29scy1za2lsbHMtdGl0bGVcIj4nKyhza2lsbC50aXRsZSkrJzwvaDQ+IDx1bCBjbGFzcz1cInRvb2xzLXNraWxscy1wcm9ncmVzcyBmbi10b29scy1za2lsbHMtcHJvZ3Jlc3MgZm4tcHJvZ3Jlc3NcIiBkYXRhLXByb2dyZXNzPVwicG9pbnRzXCIgZGF0YS1wZXJjZW50PVwiJysoc2tpbGwubGV2ZWwpKydcIiBkYXRhLWNvbG9yPVwiIzU1OGU2YVwiPjwvdWw+IDwvbGk+ICc7fSB9IG91dCs9JyA8L3VsPiA8L3NlY3Rpb24+PC9kaXY+JztyZXR1cm4gb3V0O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdGVtcGxhdGVzL3BhZ2VzL3NraWxscy1wYWdlLmRvdFxuLy8gbW9kdWxlIGlkID0gNTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIEJhc2VWaWV3ID0gcmVxdWlyZSgnYmFzZS9iYXNlLXZpZXcnKTtcclxuXHJcbi8qKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbnZhciBNYWluRm9vdGVyID0gQmFzZVZpZXcuZXh0ZW5kKHtcclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIHRlbXBsYXRlOiAnbGF5b3V0L21haW4tZm9vdGVyJyxcclxuICAgIHVybDogJ2RhdGEvYWJvdXQuanNvbicsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyQWZ0ZXJGZXRjaCgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFpbkZvb3RlcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL2xheW91dC9tYWluLWZvb3Rlci5qc1xuLy8gbW9kdWxlIGlkID0gNTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIG12YyA9IHJlcXVpcmUoJ2xpYi9tdmMnKTtcclxudmFyIGxheW91dE1hbmFnZXIgPSByZXF1aXJlKCdsYXlvdXQvbGF5b3V0LW1hbmFnZXInKTtcclxuXHJcbnZhciBIb21lUGFnZSA9IHJlcXVpcmUoJ3BhZ2VzL2hvbWUtcGFnZScpO1xyXG52YXIgU2tpbGxzUGFnZSA9IHJlcXVpcmUoJ3BhZ2VzL3NraWxscy1wYWdlJyk7XHJcbnZhciBQb3J0Zm9saW9QYWdlID0gcmVxdWlyZSgncGFnZXMvcG9ydGZvbGlvLXBhZ2UnKTtcclxudmFyIENvbnRhY3RQYWdlID0gcmVxdWlyZSgncGFnZXMvY29udGFjdC1wYWdlJyk7XHJcblxyXG4vKipcclxuICogSW5zdGFuY2VzIG9mIHBhZ2VzXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG52YXIgcGFnZXMgPSB7XHJcbiAgICBob21lOiBuZXcgSG9tZVBhZ2UoKSxcclxuICAgIHNraWxsOiBuZXcgU2tpbGxzUGFnZSgpLFxyXG4gICAgcG9ydGZvbGlvOiBuZXcgUG9ydGZvbGlvUGFnZSgpLFxyXG4gICAgY29udGFjdDogbmV3IENvbnRhY3RQYWdlKClcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHJvdXRlclxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGV4dGVuZHMgUm91dGVyXHJcbiAqL1xyXG52YXIgQmFzZVJvdXRlciA9IG12Yy5Sb3V0ZXIuZXh0ZW5kKHtcclxuICAgIC8qKlxyXG4gICAgICogQ3VycmVudCBwYWdlIGxpbmtcclxuICAgICAqL1xyXG4gICAgY3VycmVudFBhZ2U6IG51bGwsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYWdlcyBtYXBcclxuICAgICAqL1xyXG4gICAgcGFnZXM6IHtcclxuICAgICAgICAnJzogcGFnZXMuaG9tZSxcclxuICAgICAgICBkZWZhdWx0OiBwYWdlcy5ob21lLFxyXG4gICAgICAgIHNraWxsczogcGFnZXMuc2tpbGwsXHJcbiAgICAgICAgcG9ydGZvbGlvOiBwYWdlcy5wb3J0Zm9saW8sXHJcbiAgICAgICAgY29udGFjdDogcGFnZXMuY29udGFjdFxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbW1vbiByb3V0ZXJzIG1hcFxyXG4gICAgICovXHJcbiAgICByb3V0ZXM6IHtcclxuICAgICAgICAnKnJvdXRlJzogJ3JvdXRlSGFuZGxlcidcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgY3VycmVudCBwYWdlLCByZWZyZXNoIHBhZ2UgYW5kIGluc3RhbGwgbGluayB0byBuZXcgY3VycmVudCBwYWdlXHJcbiAgICAgKiBAcGFyYW0gbmV3UGFnZSB7UGFnZVZpZXd9IC0gcGFnZSB0byBzaG93XHJcbiAgICAgKi9cclxuICAgIHNob3dQYWdlOiBmdW5jdGlvbiAobmV3UGFnZSkge1xyXG4gICAgICAgIHZhciBjdXJyZW50UGFnZSA9IHRoaXMuY3VycmVudFBhZ2U7XHJcblxyXG4gICAgICAgIGN1cnJlbnRQYWdlICYmIGN1cnJlbnRQYWdlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICBuZXdQYWdlLmFwcGVuZCgpO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gbmV3UGFnZTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgcGFnZSBhbmQgc2hvdyBpdCwgcmVmcmVzaCBtYWluIG5hdiBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHBhdGgge1N0cmluZ30gLSBjdXJyZW50IGhpc3RvcnkgcGF0aG5hbWVcclxuICAgICAqL1xyXG4gICAgcm91dGVIYW5kbGVyOiBmdW5jdGlvbiAocGF0aCkge1xyXG4gICAgICAgIHZhciBwYWdlS2V5ID0gcGF0aCB8fCAnJztcclxuICAgICAgICB2YXIgbmV3UGFnZSA9IHRoaXMucGFnZXNbcGFnZUtleV0gfHwgdGhpcy5wYWdlcy5kZWZhdWx0O1xyXG5cclxuICAgICAgICB0aGlzLnNob3dQYWdlKG5ld1BhZ2UpO1xyXG5cclxuICAgICAgICBsYXlvdXRNYW5hZ2VyLnVwZGF0ZU1haW5OYXYocGFnZUtleSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8gQ3JlYXRlIGluc3RhbmNlIG9mIHJvdXRlciBhbmQgc3RhcnQgaGlzdG9yeSBmdW5jdGlvbmFsaXR5XHJcbnZhciBiYXNlUm91dGVyID0gbmV3IEJhc2VSb3V0ZXIoKTtcclxubXZjLmhpc3Rvcnkuc3RhcnQoe3B1c2hTdGF0ZTogdHJ1ZX0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBiYXNlUm91dGVyO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvYmFzZS9iYXNlLXJvdXRlci5qc1xuLy8gbW9kdWxlIGlkID0gNTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIFBhZ2VWaWV3ID0gcmVxdWlyZSgnYmFzZS9wYWdlLXZpZXcnKTtcclxudmFyIGRvbSA9IHJlcXVpcmUoJ2xpYi9kb20nKTtcclxuXHJcbnZhciBBTklNQVRJT05TX1RJTUVPVVQgPSAyMDA7XHJcblxyXG4vKipcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgSG9tZVBhZ2UgPSBQYWdlVmlldy5leHRlbmQoe1xyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6ICdwYWdlcy9hYm91dC1wYWdlJyxcclxuICAgIHVybDogJ2RhdGEvYWJvdXQuanNvbicsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93IGFsbCBzcGVjaWFsIGl0ZW1zIG9mIHNlY3Rpb24gYnkgdGltZW91dFxyXG4gICAgICpcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICogQHBhcmFtIGV2ZW50IHtFdmVudH1cclxuICAgICAqL1xyXG4gICAgaGFuZGxlU2VjdGlvblZpc2libGVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyICRpdGVtcyA9IGRvbShldmVudC5jdXJyZW50VGFyZ2V0KS5maW5kKCcuZm4tdmlzaWJsZS1pdGVtJyk7XHJcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xyXG5cclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkaXRlbXMuZXEoY291bnRlcisrKS5hZGRDbGFzcygndmlzaWJsZScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvdW50ZXIgPT09ICRpdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIEFOSU1BVElPTlNfVElNRU9VVCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIb21lUGFnZTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL3BhZ2VzL2hvbWUtcGFnZS5qc1xuLy8gbW9kdWxlIGlkID0gNTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIFBhZ2VWaWV3ID0gcmVxdWlyZSgnYmFzZS9wYWdlLXZpZXcnKTtcclxudmFyIGRvbSA9IHJlcXVpcmUoJ2xpYi9kb20nKTtcclxudmFyIENpcmNsZVByb2dyZXNzQmFyID0gcmVxdWlyZSgndG9vbHMvcHJvZ3Jlc3MtYmFyL2NpcmNsZScpO1xyXG52YXIgTGluZWFyUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCd0b29scy9wcm9ncmVzcy1iYXIvbGluZWFyJyk7XHJcbnZhciBQb2ludHNQcm9ncmVzc0JhciA9IHJlcXVpcmUoJ3Rvb2xzL3Byb2dyZXNzLWJhci9wb2ludHMnKTtcclxuXHJcbi8qKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbnZhciBTa2lsbHNQYWdlID0gUGFnZVZpZXcuZXh0ZW5kKHtcclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIHRlbXBsYXRlOiAncGFnZXMvc2tpbGxzLXBhZ2UnLFxyXG4gICAgdXJsOiAnZGF0YS9za2lsbHMuanNvbicsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaXJjbGUgcHJvZ3Jlc3MgY2FjaGUgKGZvciBsaXN0ZW5pbmcgcmVzaXplKVxyXG4gICAgICovXHJcbiAgICBjaXJjbGVQcm9ncmVzc2VzOiBbXSxcclxuXHJcbiAgICBwcm9ncmVzc2VzTWFwOiB7XHJcbiAgICAgICAgY2lyY2xlOiBDaXJjbGVQcm9ncmVzc0JhcixcclxuICAgICAgICBsaW5lYXI6IExpbmVhclByb2dyZXNzQmFyLFxyXG4gICAgICAgIHBvaW50czogUG9pbnRzUHJvZ3Jlc3NCYXJcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBwcm9ncmVzc2VzIG9mIHNlY3Rpb25cclxuICAgICAqIENhY2hlIGNpcmNsZSBwcm9ncmVzc2VzXHJcbiAgICAgKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKiBAcGFyYW0gZXZlbnQge0V2ZW50fVxyXG4gICAgICovXHJcbiAgICBoYW5kbGVTZWN0aW9uVmlzaWJsZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgcHJvZ3Jlc3NlcyA9IGRvbShldmVudC50YXJnZXQpLmZpbmQoJy5mbi1wcm9ncmVzcycpO1xyXG5cclxuICAgICAgICBwcm9ncmVzc2VzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBwcm9ncmVzc0tleSA9IGVsLmRhdGFzZXQucHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgIHZhciBQcm9ncmVzc0NsYXNzID0gdGhpcy5wcm9ncmVzc2VzTWFwW3Byb2dyZXNzS2V5XTtcclxuXHJcbiAgICAgICAgICAgIHZhciBwcm9ncmVzcyA9IG5ldyBQcm9ncmVzc0NsYXNzKHsgZWw6IGVsIH0pO1xyXG4gICAgICAgICAgICBwcm9ncmVzcy5zdGFydCgpO1xyXG5cclxuICAgICAgICAgICAgLy9DYWNoZSBjaXJjbGUgcHJvZ3Jlc3NlcyBmb3IgcmVzaXplIGV2ZW50c1xyXG4gICAgICAgICAgICBpZiAocHJvZ3Jlc3NLZXkgPT09ICdjaXJjbGUnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNpcmNsZVByb2dyZXNzZXMucHVzaChwcm9ncmVzcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNpemUgY2lyY2xlIGNhbnZhcyBvbiB3aW5kb3cgcmVzaXplXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBQYWdlVmlldy5wcm90b3R5cGUuZGVsZWdhdGVFdmVudHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcbiAgICAgICAgZG9tKHdpbmRvdykub24oJ3Jlc2l6ZS5yZXNpemUtY2lyY2xlLXByb2dyZXNzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNpcmNsZVByb2dyZXNzZXMuZm9yRWFjaChmdW5jdGlvbiAoY2lyY2xlUHJvZ3Jlc3MpIHtcclxuICAgICAgICAgICAgICAgIGNpcmNsZVByb2dyZXNzLnJlZnJlc2hPblJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICovXHJcbiAgICB1bmRlbGVnYXRlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgUGFnZVZpZXcucHJvdG90eXBlLnVuZGVsZWdhdGVFdmVudHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcbiAgICAgICAgZG9tKHdpbmRvdykub2ZmKCdyZXNpemUucmVzaXplLWNpcmNsZS1wcm9ncmVzcycpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2tpbGxzUGFnZTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL3BhZ2VzL3NraWxscy1wYWdlLmpzXG4vLyBtb2R1bGUgaWQgPSA1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgQmFzZVByb2dyZXNzQmFyID0gcmVxdWlyZSgnYmFzZS9wcm9ncmVzcy1iYXInKTtcclxuXHJcbi8qKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbnZhciBDaXJjbGVQcm9ncmVzc0JhciA9IEJhc2VQcm9ncmVzc0Jhci5leHRlbmQoe1xyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6ICc8Y2FudmFzPjwvY2FudmFzPjxzcGFuIGNsYXNzPVwidGV4dFwiPjwvc3Bhbj4nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIGRlZmF1bHRPcHRpb25zOiB7XHJcbiAgICAgICAgcGVyY2VudDogMzMsXHJcbiAgICAgICAgY29sb3I6ICdibGFjaycsXHJcbiAgICAgICAgbGluZVdpZHRoOiAzLFxyXG4gICAgICAgIHJhZGl1czogMTAwLFxyXG4gICAgICAgIGxpbmVDYXA6ICdyb3VuZCcsIC8vIGJ1dHQsIHJvdW5kIG9yIHNxdWFyZVxyXG4gICAgICAgIGZvbnRTaXplOiAnMnJlbScsXHJcbiAgICAgICAgZm9udENvbG9yOiAnYmxhY2snLFxyXG4gICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIHNldEVsZW1lbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgICAgdGhpcy4kdGV4dCA9IHRoaXMuJGVsLmZpbmQoJy50ZXh0Jyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIHNldEVsZW1lbnRzVmlldzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vU2V0IGNhbnZhcyBzaXplIGJ5IGVsZW1lbnQgd2lkdGhcclxuICAgICAgICB0aGlzLm9wdGlvbnMuc2l6ZSA9IHRoaXMuZWwuY2xpZW50V2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnNpemU7XHJcbiAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHRoaXMub3B0aW9ucy5zaXplIC8gMiwgdGhpcy5vcHRpb25zLnNpemUgLyAyKTtcclxuICAgICAgICB0aGlzLmN0eC5yb3RhdGUoLTEgKiBNYXRoLlBJKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbWFnZURhdGEgPSB0aGlzLmN0eC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy5vcHRpb25zLnNpemUsIHRoaXMub3B0aW9ucy5zaXplKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWwuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy4kdGV4dC5jc3Moe1xyXG4gICAgICAgICAgICAnZm9udC1zaXplJzogdGhpcy5vcHRpb25zLmZvbnRTaXplLFxyXG4gICAgICAgICAgICBjb2xvcjogdGhpcy5vcHRpb25zLmZvbnRDb2xvcixcclxuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICAgIHRvcDogMCxcclxuICAgICAgICAgICAgJ21hcmdpbi1sZWZ0JzogJzUwJScsXHJcbiAgICAgICAgICAgICdtYXJnaW4tdG9wJzogJzUwJScsXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMuZHVyYXRpb24gLyB0aGlzLm9wdGlvbnMucGVyY2VudDtcclxuICAgICAgICB2YXIgY3VycmVudFBlcmNlbnQgPSAxO1xyXG5cclxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnRpY2tlci5iaW5kKHRoaXMsIGludGVydmFsLCBjdXJyZW50UGVyY2VudCksIGludGVydmFsKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcnZhbCBmb3IgZHJhd2luZyBjaXJjbGUgYnkgdmFsdWVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gaW50ZXJ2YWwge0ludGVnZXJ9XHJcbiAgICAgKiBAcGFyYW0gY3VycmVudFBlcmNlbnQge0ludGVnZXJ9XHJcbiAgICAgKi9cclxuICAgIHRpY2tlcjogZnVuY3Rpb24gKGludGVydmFsLCBjdXJyZW50UGVyY2VudCkge1xyXG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZShjdXJyZW50UGVyY2VudCsrKTtcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRQZXJjZW50IDw9IHBhcnNlSW50KHRoaXMub3B0aW9ucy5wZXJjZW50LCAxMCkpIHtcclxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQodGhpcy50aWNrZXIuYmluZCh0aGlzLCBpbnRlcnZhbCwgY3VycmVudFBlcmNlbnQpLCBpbnRlcnZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERyYXcgY2lyY2xlIGJ5IGN1cnJlbnQgcGVyY2VudFxyXG4gICAgICogQHBhcmFtIHBlcmNlbnQge0ludGVnZXJ9XHJcbiAgICAgKi9cclxuICAgIGRyYXdDaXJjbGU6IGZ1bmN0aW9uIChwZXJjZW50KSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcbiAgICAgICAgdmFyIGNhbnZhcyA9IHRoaXMuY2FudmFzO1xyXG4gICAgICAgIHZhciBjdHggPSB0aGlzLmN0eDtcclxuXHJcbiAgICAgICAgY3R4LnB1dEltYWdlRGF0YSh0aGlzLmltYWdlRGF0YSwgMCwgMCk7XHJcblxyXG4gICAgICAgIC8vRHJhdyBiYWNrZ3JvdW5kIGFyY1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKDAsIDAsIChvcHRpb25zLnNpemUgLSBvcHRpb25zLmxpbmVXaWR0aCkgLyAyLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIDAuMSknO1xyXG4gICAgICAgIGN0eC5saW5lQ2FwID0gb3B0aW9ucy5saW5lQ2FwO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvcHRpb25zLmxpbmVXaWR0aCAtIDI7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuXHJcbiAgICAgICAgLy9EcmF3IG1haW4gYXJjIChieSBwZXJjZW50KVxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKDAsIDAsIChvcHRpb25zLnNpemUgLSBvcHRpb25zLmxpbmVXaWR0aCkgLyAyLCAwLCBNYXRoLlBJICogMiAqIHBlcmNlbnQgLyAxMDAsIGZhbHNlKTtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRpb25zLmNvbG9yO1xyXG4gICAgICAgIGN0eC5saW5lQ2FwID0gb3B0aW9ucy5saW5lQ2FwO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBvcHRpb25zLmxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xyXG5cclxuICAgICAgICAvL1NldCBwZXJjZW50IHRvIHRleHRcclxuICAgICAgICB0aGlzLiR0ZXh0Lmh0bWwocGVyY2VudCArICclJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVmcmVzaGluZ1xyXG4gICAgICovXHJcbiAgICByZWZyZXNoT25SZXNpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNldEVsZW1lbnRzVmlldygpO1xyXG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSh0aGlzLm9wdGlvbnMucGVyY2VudCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGVQcm9ncmVzc0JhcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL3Rvb2xzL3Byb2dyZXNzLWJhci9jaXJjbGUuanNcbi8vIG1vZHVsZSBpZCA9IDU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBCYXNlUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCdiYXNlL3Byb2dyZXNzLWJhcicpO1xyXG5cclxudmFyIE1JTExJU0VDT05EU19JTl9TRUNPTkRTID0gMTAwMDtcclxuXHJcbi8qKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbnZhciBMaW5lYXJQcm9ncmVzc0JhciA9IEJhc2VQcm9ncmVzc0Jhci5leHRlbmQoe1xyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6ICc8c3BhbiBjbGFzcz1cImxhbmd1YWdlLXNraWxscy1wcm9ncmVzc19fYmFyIGZuLWJhclwiPjwvc3Bhbj4nLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIGRlZmF1bHRPcHRpb25zOiB7XHJcbiAgICAgICAgcGVyY2VudDogMzMsXHJcbiAgICAgICAgY29sb3I6ICdibGFjaycsXHJcbiAgICAgICAgZHVyYXRpb246IDEwMDAsXHJcbiAgICAgICAgYW5pbWF0aW9uRnVuY3Rpb246ICdsaW5lYXInXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIHNldEVsZW1lbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy4kYmFyID0gdGhpcy4kKCcuZm4tYmFyJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIHNldEVsZW1lbnRzVmlldzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuICAgICAgICB0aGlzLiRlbC5jc3Moe1xyXG4gICAgICAgICAgICAncG9zaXRpb24nOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAnYm9yZGVyJzogJzAuMnJlbSBzb2xpZCAnICsgb3B0aW9ucy5jb2xvcixcclxuICAgICAgICAgICAgJ2hlaWdodCc6ICcxLjVyZW0nLFxyXG4gICAgICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICcwLjc1cmVtJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRiYXIuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICAgIHRvcDogMCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgIHdpZHRoOiAwLFxyXG4gICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgICAgICAgICd0cmFuc2l0aW9uJzogJ3dpZHRoICcgKyAob3B0aW9ucy5kdXJhdGlvbiAvIE1JTExJU0VDT05EU19JTl9TRUNPTkRTKSArICdzICcgKyBvcHRpb25zLmFuaW1hdGlvbkZ1bmN0aW9uLFxyXG4gICAgICAgICAgICAnLXdlYmtpdC10cmFuc2l0aW9uJzogJ3dpZHRoICcgKyAob3B0aW9ucy5kdXJhdGlvbiAvIE1JTExJU0VDT05EU19JTl9TRUNPTkRTKSArICdzICcgKyBvcHRpb25zLmFuaW1hdGlvbkZ1bmN0aW9uXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG92ZXJyaWRlXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRiYXIuY3NzKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5wZXJjZW50ICsgJyUnKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGluZWFyUHJvZ3Jlc3NCYXI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy90b29scy9wcm9ncmVzcy1iYXIvbGluZWFyLmpzXG4vLyBtb2R1bGUgaWQgPSA2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgQmFzZVByb2dyZXNzQmFyID0gcmVxdWlyZSgnYmFzZS9wcm9ncmVzcy1iYXInKTtcclxuXHJcbnZhciBMaW5lYXJQcm9ncmVzc0JhciA9IEJhc2VQcm9ncmVzc0Jhci5leHRlbmQoe1xyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6ICc8bGkgY2xhc3M9XCJ0b29scy1za2lsbHMtcHJvZ3Jlc3NfX2l0ZW0gZm4taXRlbVwiPjwvbGk+JyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvdGFsIGxlbmd0aCBvZiBjaXJjbGVzXHJcbiAgICAgKi9cclxuICAgIHRvdGFsTGVuZ3RoOiAxMCxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICovXHJcbiAgICBkZWZhdWx0T3B0aW9uczoge1xyXG4gICAgICAgIHBlcmNlbnQ6IDMzLFxyXG4gICAgICAgIGNvbG9yOiAnYmxhY2snLFxyXG4gICAgICAgIGRlbGF5OiAyMDAsXHJcbiAgICAgICAgZHVyYXRpb246IDQwMCxcclxuICAgICAgICBhbmltYXRpb25GdW5jdGlvbjogJ2xpbmVhcidcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGh0bWwgPSAnJztcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRvdGFsTGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLnRlbXBsYXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4kZWwuaHRtbChodG1sKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgc2V0RWxlbWVudHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLiRpdGVtcyA9IHRoaXMuJCgnLmZuLWl0ZW0nKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgc2V0RWxlbWVudHNWaWV3OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG4gICAgICAgIHRoaXMuJGl0ZW1zLmNzcyh7XHJcbiAgICAgICAgICAgICd0cmFuc2l0aW9uJzogJ2JhY2tncm91bmQgJyArIChvcHRpb25zLmR1cmF0aW9uIC8gMTAwMCkgKyAncyAnICsgb3B0aW9ucy5hbmltYXRpb25GdW5jdGlvbixcclxuICAgICAgICAgICAgJy13ZWJraXQtdHJhbnNpdGlvbic6ICdiYWNrZ3JvdW5kICcgKyAob3B0aW9ucy5kdXJhdGlvbiAvIDEwMDApICsgJ3MgJyArIG9wdGlvbnMuYW5pbWF0aW9uRnVuY3Rpb25cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuICAgICAgICB2YXIgbGVuZ3RoID0gTWF0aC5yb3VuZChvcHRpb25zLnBlcmNlbnQgLyAxMCk7XHJcbiAgICAgICAgdmFyIGZsYWcgPSAwO1xyXG5cclxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGl0ZW1zLmVxKGZsYWcrKykuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgb3B0aW9ucy5jb2xvcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoZmxhZyA9PT0gbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSwgb3B0aW9ucy5kZWxheSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMaW5lYXJQcm9ncmVzc0JhcjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2pzL3Rvb2xzL3Byb2dyZXNzLWJhci9wb2ludHMuanNcbi8vIG1vZHVsZSBpZCA9IDYxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBQYWdlVmlldyA9IHJlcXVpcmUoJ2Jhc2UvcGFnZS12aWV3Jyk7XHJcblxyXG52YXIgSU5URVJWQUxfRFVSQVRJT04gPSAzMDA7XHJcblxyXG4vKipcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgUG9ydGZvbGlvUGFnZSA9IFBhZ2VWaWV3LmV4dGVuZCh7XHJcbiAgICAvKipcclxuICAgICAqIEBvdmVycmlkZVxyXG4gICAgICovXHJcbiAgICB1cmw6ICdkYXRhL3BvcnRmb2xpby5qc29uJyxcclxuICAgIHRlbXBsYXRlOiAncGFnZXMvcG9ydGZvbGlvLXBhZ2UnLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBhbGwgc3BlY2lhbCBpdGVtcyBvZiBzZWN0aW9uIGJ5IHRpbWVvdXRcclxuICAgICAqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqIEBwYXJhbSBldmVudCB7RXZlbnR9XHJcbiAgICAgKi9cclxuICAgIGhhbmRsZVNlY3Rpb25WaXNpYmxlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciAkaXRlbXMgPSB0aGlzLiQoJy5mbi1pdGVtJyk7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgdmFyIGludGVydmFsID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJGl0ZW1zLmVxKGluZGV4KyspLmFkZENsYXNzKCd2aXNpYmxlJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPT09ICRpdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSwgSU5URVJWQUxfRFVSQVRJT04pXHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9QYWdlO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vanMvcGFnZXMvcG9ydGZvbGlvLXBhZ2UuanNcbi8vIG1vZHVsZSBpZCA9IDYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBQYWdlVmlldyA9IHJlcXVpcmUoJ2Jhc2UvcGFnZS12aWV3Jyk7XHJcblxyXG4vKipcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgQ29udGFjdFBhZ2UgPSBQYWdlVmlldy5leHRlbmQoe1xyXG4gICAgLyoqXHJcbiAgICAgKiBAb3ZlcnJpZGVcclxuICAgICAqL1xyXG4gICAgdGVtcGxhdGU6ICdwYWdlcy9jb250YWN0LXBhZ2UnLFxyXG4gICAgdXJsOiAnZGF0YS9hYm91dC5qc29uJyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdvb2dsZSBtYXBzIHNjcmlwdCBsaW5rXHJcbiAgICAgKi9cclxuICAgIGdvb2dsZU1hcHNBcGlTcmM6ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanMnLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR29vZ2xlIG1hcHMgb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBnb29nbGVNYXBPcHRpb25zOiB7XHJcbiAgICAgICAgY2VudGVyOiB7XHJcbiAgICAgICAgICAgIGxhdDogNTMuOTA0MzEyODczMzI4MDYsXHJcbiAgICAgICAgICAgIGxuZzogMjcuNTYxMjkwMTg5NjIzODMzXHJcbiAgICAgICAgfSxcclxuICAgICAgICB6b29tOiAxMVxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgUGFnZVZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ZW5Ub09uY2UodGhpcywgJ21vdW50ZWQnLCB0aGlzLnJlbmRlckNvbnRhY3RNYXAuYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGdvb2dsZSBtYXAgYWZ0ZXIgbG9hZGluZyBzY3JpcHRcclxuICAgICAqL1xyXG4gICAgcmVuZGVyQ29udGFjdE1hcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubG9hZEdvb2dsZU1hcHNBcGkoKS50aGVuKHRoaXMuY3JlYXRlR29vZ2xlTWFwLmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzY3JpcHQgZWxlbWVudCB3aGljaCBsb2FkIGdvb2dsZSBtYXBzIGFwaVxyXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XHJcbiAgICAgKi9cclxuICAgIGxvYWRHb29nbGVNYXBzQXBpOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XHJcbiAgICAgICAgICAgIHZhciBzY3JpcHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcblxyXG4gICAgICAgICAgICBzY3JpcHRFbGVtZW50LmFzeW5jID0gdHJ1ZTtcclxuICAgICAgICAgICAgc2NyaXB0RWxlbWVudC5zcmMgPSB0aGlzLmdvb2dsZU1hcHNBcGlTcmM7XHJcblxyXG4gICAgICAgICAgICBzY3JpcHRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHRFbGVtZW50KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlciBnb29nbGUgbWFwcywgaW5zZXJ0IGl0IGFuZCBjcmVhdGUgbWFya2VyXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZUdvb2dsZU1hcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtYXBEaXYgPSB0aGlzLiQoJy5mbi1tYXAnKS5nZXQoMCk7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdvb2dsZU1hcE9wdGlvbnM7XHJcblxyXG4gICAgICAgIHZhciBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcERpdiwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgICAgICAgcG9zaXRpb246IG9wdGlvbnMuY2VudGVyLFxyXG4gICAgICAgICAgICBtYXA6IG1hcFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udGFjdFBhZ2U7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy9wYWdlcy9jb250YWN0LXBhZ2UuanNcbi8vIG1vZHVsZSBpZCA9IDYzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBOzs7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2hFQTs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDcmlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ2pEQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3BXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUM1QkE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7Ozs7OztBQ0FBOzs7Ozs7QUNBQTs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQy8zREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBOzs7Ozs7O0FDM2dEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QSIsInNvdXJjZVJvb3QiOiIifQ==