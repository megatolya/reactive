var FixmeError = require('../errors').FixmeError;
var utils = require('../utils');

var i = 0;
var ATTRIBUTE = 'bj';
var ID_ATTRIBUTE = 'data-' + ATTRIBUTE;

// TODO удалить в пользу хеша id блока -> название ключа итерации
var DATA_ATTRIBUTE = 'data-' + ATTRIBUTE + 'x';
var Param = require('./param');
var ChangeableParam = require('./changeable-param');

function uniq() {
    return 'uniqid-' + (i++);
}

function Primitive(bemjson, parent) {
    if (Primitive.isPrimitive(bemjson)) {
        throw new FixmeError('Plain types in bemjson not implemented yet');
    }

    this.parent = parent;
    var _this = this;

    this.scope = this._createScope(parent);
    window.allElements = this._allElements = require('../vars').allElements;
    this._allElements.push(this);

    this._id = uniq();

    // не примитив
    this._params = this._extractParams(bemjson);
    this._events = this._getEventListeners();

    this._mods = this._extractComplexParams(bemjson.mods || {});
    this._attrs = this._extractComplexParams(bemjson.attrs || {});

    this._content = this._extractContent(bemjson.content);

    if (!this._content) {
        this._children = this._extractChildren(bemjson.content);
    }

    if (bemjson.iterate) {
        this._iterable = true;
        var iteratingBind = bemjson.iterate.split(' ')[0].trim();
        this._iteratingBindingName = iteratingBind;
        this._collectionName = bemjson.iterate.split(' ')[2].trim();
        this._collection = this.scope[this._collectionName];
    }

    this._bindings = this._extractBindings(bemjson.bind);
    this._bindings.forEach(function(binding) {
        var model = this.scope[binding];

        if (!model) {
            model = this._collection;

            if (!model) {
                return;
                //throw new Error('No such model was supplied: ' + binding);
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
        ? function(models) {
            return Boolean(showIf.apply(null, models || _this._getModels()));
        }
        : function() {
            return true;
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

function getBlockFromElement(element) {
    var adapter = require('../vars').adapter;
    var $element = adapter(element);
    var attr = $element.attr(ID_ATTRIBUTE);

    var res = null;

    if (attr) {
        require('../vars').allElements.some(function(block) {
            if (block._id === attr) {
                res = block;
                return true;
            }

            return false;
        });
    }

    if (res) {
        return res;
    }

    var parent;
    while (parent = element.parentNode) {
        attr = $(parent).attr(ID_ATTRIBUTE);

        if (attr) {
            require('../vars').allElements.some(function(block) {
                if (block._id === attr) {
                    res = block;
                    return true;
                }

                return false;
            });
            break;
        }
    }

    return res;
}

function getBlockFromEvent(event) {
    return getBlockFromElement(event.target);
}

Primitive.registerListeners = function(block, events) {
    var registered = this._registered = this._registered || {};
    var adapter = require('../vars').adapter;

    Object.keys(events).forEach(function(eventName) {
        if (!registered[eventName]) {
            adapter.bindToDoc(eventName, function(e) {
                var originalTriggeredBlock = getBlockFromEvent(e);

                if (!originalTriggeredBlock)
                    return;

                registered[eventName].some(function(block) {
                    var triggeredBlock = originalTriggeredBlock;

                    if (block === triggeredBlock) {
                        block.handleEvent(e);
                        return true;
                    }

                    if (!triggeredBlock.parent) {
                        return false;
                    }

                    while (triggeredBlock = triggeredBlock.parent) {
                        if (block === triggeredBlock) {
                            block.handleEvent(e);
                            return true;
                        }
                    }

                    return false;
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

    isWasShown: function() {
        var domElem = this.getDomElement();
        return Boolean(domElem.length);
    },

    // TODO вызывается лишний раз в итерируемых блоках
    _onModelChanged: function(eventName, model) {
        this._previousModelChanged = model.changed;
        this.repaint();
    },

    _createScope: function(parent) {
        var parentScope;

        if (parent) {
            parentScope = parent.scope;
        } else {
            parentScope = require('../vars').models;
        }

        return Object.create(parentScope);
    },

    _extractBindings: function(bindings) {
        if (typeof bindings === 'string') {
            return bindings.split(' ');
        }

        return bindings || [];
    },

    _getModels: function() {
        return this._bindings.map(function(binding) {
            var scope = this.scope;

            if (scope[binding]) {
                return scope[binding];
            }

            throw new Error('No such model ' + binding);
        }, this);
    },

    getPreviousSibling: function() {
        var prevBlock = this._allElements[this._allElements.indexOf(this) - 1];

        if (prevBlock && prevBlock.parent === this.parent) {
            return prevBlock;
        }

        return null;
    },

    _extractComplexParams: function(mods) {
        return Object.keys(mods).map(function(modName) {
            if (typeof mods[modName] === 'function') {
                return new ChangeableParam(modName, mods[modName]);
            } else {
                return new Param(modName, mods[modName]);
            }
        });
    },

    _extractParams: function(bemjson) {
        var ignoreParams = [
            'block',
            'elem',
            'elemMods',
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
        function prepareIterableScope(elem) {
            var adapter = require('../vars').adapter;
            var adaptedElement = adapter(elem)
            var json = adaptedElement.attr(DATA_ATTRIBUTE);

            if (json) {
                var block = getBlockFromElement(elem);
                var data = JSON.parse(json);
                block.scope[data.name] = block._collection.models[data.index];
            }
        }

        // сопоставляем scope и элемент
        prepareIterableScope(e.target);

        var parent = e.target;
        while (parent = parent.parentElement) {
            prepareIterableScope(parent);
        }

        var models = Array.prototype.slice.call(this._getModels());
        models.unshift(e);
        this._params['on' + e.type.charAt(0).toUpperCase() + e.type.slice(1, e.length)].apply(null, models);
    },

    getDomElement: function() {
        var adapter = require('../vars').adapter;

        return adapter('[' + ID_ATTRIBUTE + '=%id]'.replace('%id', this._id));

    },

    _getComplexParams: function(paramsProp) {
        var res = {};

        this[paramsProp].map(function(param) {
            utils.extend(res, param.valueOf(this._getModels()));
        }, this);
        Object.keys(res).forEach(function(key) {
            if (!res[key]) {
                delete res[key];
            }
        });

        return res;
    },

    _getMods: function() {
        return this._getComplexParams('_mods');
    },

    _getAttrs: function() {
        return utils.extend({
            'data-bj': this._id
        }, this._getComplexParams('_attrs'));
    },

    toBemjson: function() {
        this._loops = this._loops || ((this.parent || {})._loops ? this.parent._loops.slice() : []);

        if (this._iterable) {
            this._loops.push(this._iteratingBindingName);
            var blocks = this._collection.models.map(function(model, index) {
                this.scope[this._iteratingBindingName] = model;

                var models = this._getModels();
                var loopAttrs = {};
                loopAttrs[DATA_ATTRIBUTE] = JSON.stringify({
                    name: this._iteratingBindingName,
                    index: index
                });

                if (!this.isShown(models))
                    return null;

                return this._formatData({
                    block: this._name,
                    mods: this._getMods(),
                    content: this._content ? this._content.apply(null, models) : (this._children || []).map(function(child) {
                        return child.toBemjson();
                    }, this),
                    attrs: utils.extend(loopAttrs, this._getAttrs())
                });
            }, this);
        } else {
            if (!this.isShown()) {
                return null;
            }

            var block = this._formatData({
                block: this._name,
                mods: this._getMods(),
                // getchildrenorcontent
                content: this._getContent(),
                attrs: this._getAttrs()
            });

            for (var key in this._params) {
                block[key] = this._params[key];
            }
        }

        return blocks || block;
    },

    _getContent: function() {
        if (this._content) {
            var models = this._getModels();
            return this._content.apply(null, models);
        } else {
            if (this._children) {
                return this._children.map(function(child) {
                    return child.toBemjson();
                }, this);
            }
        }
    },

    repaint: function() {
        var adapter = require('../vars').adapter;

        if (this.parent && !this.parent.isWasShown()) {
            return;
        }

        if (this._params.repaint === false) {
            return;
        }

        if (this.isWasShown()) {
            var domNode = this.getDomElement();

            domNode.replaceWith(this.toHTML());
        } else {
            // ставим блок после предыдущего блока
            var prev = this.getPreviousSibling();

            if (!prev) {
                var html = this.toHTML();

                if (!this.parent) {
                    adapter(adapter().root).prepend(html);
                } else {
                    this.parent.getDomElement().prepend(html);
                }
                return;
            }

            var prevElement = null;
            if (!prev.isWasShown()) {
                while (prev = prev.getPreviousSibling()) {
                    if (prev.isWasShown()) {
                        prevElement = prev.getDomElement();
                    }
                }
            } else {
                prevElement = prev.getDomElement();
            }

            if (prevElement) {
                prevElement.after(this.toHTML());
            } else {
                if (this.parent) {
                    this.parent.getDomElement().prepend(html);
                } else {
                    var html = this.toHTML();
                    adapter(adapter().root).prepend(html);
                }
            }
        }
    },

    toHTML: function() {
        var templateEngine = require('../vars').templateEngine;
        return templateEngine.apply(this.toBemjson());
    }
};

module.exports = Primitive;
