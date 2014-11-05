var FixmeError = require('../errors').FixmeError;
var utils = require('../utils');

var i = 0;
var ATTRIBUTE = 'bj';
var DATA_ATTRIBUTE = 'data-' + ATTRIBUTE;

function uniq() {
    return 'uniq-' + (i++);
}

function Primitive(bemjson, parent) {
    this.parent = parent;
    var _this = this;

    this.iterableScope = this._createScope(parent);
    window.allElements = this._allElements = require('../vars').allElements;
    this._allElements.push(this);

    this._id = uniq();

    if (!Primitive.isPrimitive(bemjson)) {
        this._params = this._extractParams(bemjson);
        this._events = this._getEventListeners();

        this._mods = utils.extend({}, bemjson.mods || {});

        this._content = this._extractContent(bemjson.content);

        if (!this._content) {
            this._children = this._extractChildren(bemjson.content);
        }
    } else {
        throw new FixmeError('Plain types in bemjson not implemented yet');
    }

    this._attrs = utils.extend({}, bemjson.attrs || {});
    this._attrs[DATA_ATTRIBUTE] = this._id;

    this._globalModels = require('../vars').models;
    this._models = {};
    utils.extend(this._models, this._globalModels);

    if (bemjson.iterate) {
        this._iterable = true;
        var iteratingBind = bemjson.iterate.split(' ')[0].trim();
        this._iteratingBind = iteratingBind;
        this.iterableScope[iteratingBind] = this._globalModels[bemjson.iterate.split(' ')[2].trim()];
    }

    this._bindings = this._extractBindings(bemjson.bind);
    this._bindings.forEach(function(binding) {
        var model = this._models[binding];

        if (!model) {
            model = this.iterableScope[binding];
            if (!model) {
                // TODO bind in block inside iterable
                // throw new Error('No such model was supplied: ' + binding);
                return;
            }
        }

        ['change', 'remove', 'add'].forEach(function(eventName) {
            model.on(eventName, function(model) {
                this._onModelChanged(eventName, model);
            }, this);
        }, this);
    }, this);

    this._previousModelChanged = null;

    var showIf = bemjson.showIf;

    this.isShown = typeof showIf === 'function'
        ? function() {
            return this.wasShown = Boolean(showIf.apply(null, _this._getModels()));
        }
        : function() {
            return this.wasShown = true;
        };

    if (!Primitive.isPrimitive(bemjson)) {
        Primitive.registerListeners(this, this._events);
    }
}

/**
    *
    * Вида:
    * {
    *     bind,
    *     content
    * }
    */
Primitive.primitiveToBemjson = function(data) {
    // в целях отладки
    if (!Primitive.isPrimitive(data)) {
        throw new TypeError('Not a primitive ' + data + ' ' + JSON.stringify(data));
    }

    if (utils.isPlainObject(data)) {
        return data;
    } else {
        return {
            content: data
        };
    }
};

Primitive.isPrimitive = function(bemjson) {
    if (bemjson) {
        if (typeof bemjson === 'string') {
            return true;
        } else {
            if (utils.isPlainObject(bemjson) && !bemjson.elem && !bemjson.block) {
                return true;
            }
            return false;
        }
    } else {
        return true;
    }
};

function getBlockFromEvent(event) {
    var adapter = require('../vars').adapter;
    var element = adapter(event.target);
    //var attr = element.dataset[ATTRIBUTE];
    var attr = element.attr(DATA_ATTRIBUTE);

    // TODO доделать
    if (attr) {
        return require('../vars').allElements.filter(function(block) {
            if (block._id === attr) {
                return true;
            }

            return false;
        })[0];
    }
}

Primitive.registerListeners = function(block, events) {
    var registered = this._registered = this._registered || {};
    var adapter = require('../vars').adapter;

    Object.keys(events).forEach(function(eventName) {
        if (!registered[eventName]) {
            adapter.bindToDoc(eventName, function(e) {
                var triggeredBlock = getBlockFromEvent(e);

                registered[eventName].some(function(block) {
                    if (block === triggeredBlock) {
                        block.handleEvent(e);
                        return true;
                    }

                    while (triggeredBlock = triggeredBlock.parent) {
                        if (block === triggeredBlock) {
                            block.handleEvent(e);
                            return true;
                        }
                    }
                });
            });
            registered[eventName] = [block];
        } else {
            registered[eventName].push(block);
        }
    });
};

Primitive.prototype = {
    constructor: Primitive,

    toBemjson: function() {
        return this._content.apply(null, this._bindings);
    },

    _onModelChanged: function(eventName, model) {
        if (eventName === 'change' && utils.isSameObjects(this._previousModelChanged, model.changed)) {
            return;
        }

        this._previousModelChanged = model.changed;
        this.repaint();
    },

    _createScope: function(parent) {
        var parentScope = {};

        if (parent) {
            parentScope = parent.iterableScope;
        }

        return Object.create(parentScope);
    },

    _extractBindings: function(bindings) {
        if (typeof bindings === 'string') {
            return bindings.split(' ');
        }

        return bindings || [];
    },

    _getAttrs: function() {
        return this._attrs;
    },

    _getModels: function() {
        return this._bindings.map(function(binding) {
            return this._models[binding];
        }, this);
    },

    getPreviousSibling: function() {
        var prevBlock = this._allElements[this._allElements.indexOf(this) - 1];

        if (prevBlock && prevBlock.parent === this.parent) {
            return prevBlock;
        }

        return null;
    },

    _extractParams: function(bemjson) {
        var ignoreParams = [
            'block',
            'elem',
            'mods',
            'content',
            'attrs',
            'bind'
        ];

        var result = {};

        Object.keys(bemjson).forEach(function(param) {
            if (ignoreParams.indexOf(param) === -1) {
                result[param] = bemjson[param];
            }
        });

        return result;
    },

    _extractContent: function(content) {
        // TODO isPrimitive
        if (content === null
                || content === undefined
                || typeof content === 'string'
                || typeof content === 'number'
            ) {
            return function() {
                return content;
            };
        }
        return typeof content === 'function'
            ? content
            : null;
    },

    _getEventListeners: function() {
        var eventToHandler = {};
        var reg = /^on[A-Z]+/;

        Object.keys(this._params).forEach(function(param) {
            if (reg.test(param)) {
                eventToHandler[param.replace(/^on/, '').toLowerCase()] = this._params[param];
            }
        }, this);

        return eventToHandler;
    },

    _extractChildren: function(bemjson) {
        var parent = this;
        var bem = require('./');

        if (utils.isPlainObject(bemjson)) {
            return [bem.createBemObject(bemjson, parent)];
        } else if (Array.isArray(bemjson)) {
            return bemjson.map(function(child) {
                return bem.createBemObject(child, parent);
            });
        }

        throw new TypeError('Uknown type of bemjson: ' + bemjson);
    },

    handleEvent: function(e) {
        console.log(e);
        var models = Array.prototype.slice.call(this._getModels());
        models.unshift(e);
        this._params['on' + e.type.charAt(0).toUpperCase() + e.type.slice(1, e.length)].apply(null, models);
    },

    getDomElement: function() {
        var adapter = require('../vars').adapter;

        return adapter('[' + DATA_ATTRIBUTE + '=%id]'.replace('%id', this._id));
    }
};

module.exports = Primitive;
