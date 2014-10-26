var FixmeError = require('../errors').FixmeError;
var utils = require('../utils');

var i = 0;

function uniq() {
    return 'block-' + (i++);
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
        this._mods = utils.extend({}, bemjson.mods || {});

        this._content = this._extractContent(bemjson.content);

        if (!this._content) {
            this._children = this._extractChildren(bemjson.content);
        }
    } else {
        throw new FixmeError('Plain types in bemjson not implemented yet');
    }

    this._attrs = utils.extend({}, bemjson.attrs || {});
    this._attrs['data-blox'] = this._id;

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
                throw new Error('No such model was supplied: ' + binding);
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
            'attrs'
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

    getDomElement: function() {
        var adapter = require('../vars').adapter;

        return adapter('[data-blox=%id]'.replace('%id', this._id));
    }
};

module.exports = Primitive;
