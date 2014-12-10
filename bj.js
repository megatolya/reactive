(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function commonProps() {}
commonProps.prototype.root = 'body';

module.exports = commonProps;

},{}],2:[function(require,module,exports){
var commonProps = require('./common');
var utils = require('../utils');
var errors = require('../errors');
var FixmeError = errors.FixmeError;

var ATTRIBUTE = 'bj';
var ID_ATTRIBUTE = 'data-' + ATTRIBUTE;

function BemAdapter(query) {
    if (!(this instanceof BemAdapter)) {
        return new BemAdapter(query);
    }

    this.$ = $(query);
    this.length = this.$.length;
}

BemAdapter.prototype = new commonProps();
utils.extend(BemAdapter.prototype, {
    constructor: BemAdapter,

    remove: function() {
        BEM.DOM.destruct(this.$);
        // TODO надо/нет?
        this.$ = null;
    },

    replaceWith: function(html) {
        var $html = $(html);
        this.before($html);
        this.remove();
        this.$ = $html;
        BEM.DOM.init($html);
    },

    append: function(html) {
        BEM.DOM.append(this.$.eq(0), html);
    },

    prepend: function(html) {
        BEM.DOM.prepend(this.$.eq(0), html);
    },

    after: function(html) {
        BEM.DOM.after(this.$.eq(this.$.length - 1), html);
    },

    before: function(html) {
        BEM.DOM.before(this.$.eq(0), html);
        BEM.DOM.init();
    },

    html: function(html) {
        BEM.DOM.update(this.$, html);
    },

    attr: function(name, val) {
        return this.$.attr.apply(this.$, arguments);
    }
});

// TODO перенести
function getBlockById(id) {
    var allElements = require('../vars').allElements;

    // TODO
    return allElements.filter(function(block) {
        return block._id === id;
    })[0];
}

BemAdapter.getBlockFromElement = function(element) {
    var parent = $(element);
    var id = parent.attr(ID_ATTRIBUTE);

    if (id) {
        return getBlockById(id);
    }

    while (parent = parent.parent() && parent.length !== 0) {
        id = parent.attr(ID_ATTRIBUTE);

        if (id) {
            return getBlockById(id);
        }
    }

    return null;
};

BemAdapter.getTargetFromEvent = function(event) {
    return event.target.domElem.get(0);
};

// blockname -> {eventName: true}
var registered = {};

BemAdapter.bindTo = function(block, eventName) {
    if (registered[block._name] && registered[block._name][eventName]) {
        return;
    }

    BEM.blocks[block._name].on(eventName, function(event, data) {
        block.handleEvent(event, data);
    });
};

BemAdapter.init = function() {
    BEM.DOM.init();
};

module.exports = BemAdapter;

},{"../errors":12,"../utils":14,"../vars":15,"./common":1}],3:[function(require,module,exports){
module.exports = {
    native: require('./native'),
    'i-bem': require('./i-bem')
};

},{"./i-bem":2,"./native":4}],4:[function(require,module,exports){
var ATTRIBUTE = 'bj';
var ID_ATTRIBUTE = 'data-' + ATTRIBUTE;
var commonProps = require('./common');
var utils = require('../utils');

function NativeAdapter(query) {
    if (!(this instanceof NativeAdapter)) {
        return new NativeAdapter(query);
    }

    if (query) {
        if (typeof query === 'string') {
            var list = document.querySelectorAll(query);
            utils.extend(this, list);
            this.length = list.length;
            return;
        } else if (query instanceof NodeList) {
            utils.extend(this, query);
            this.length = query.length;
            return;
        } else if (query instanceof Node) {
            utils.extend(this, [query]);
            this.length = 1;
            return;
        }

        throw new TypeError('Unknown query ' + query);
    }
}

NativeAdapter.prototype = new commonProps();
utils.extend(NativeAdapter.prototype, {
    constructor: NativeAdapter,

    remove: function() {
        for (var i = 0; i < this.length; i++) {
            this[i].parentElement.removeChild(this[i]);
            delete this[i];
        }
    },

    replaceWith: function(html) {
        var previousSibling = this[0].previousSibling;

        if (previousSibling) {
            this.remove();
            new NativeAdapter(previousSibling).after(html);
        } else {
            var parent = this[0].parentElement;
            this.remove();
            new NativeAdapter(parent).prepend(html);
        }
    },

    append: function(html) {
        this[0].innerHTML += html;
    },

    prepend: function(html) {
        this[0].innerHTML = html += this[0].innerHTML;
    },

    // FIXME
    after: function(html) {
        this[this.length - 1].outerHTML += html;
    },

    // FIXME
    before: function(html) {
        this[0].outerHTML = html + this[0].outerHTML;
    },

    html: function(html) {
        this[0].innerHTML = html;
    },

    attr: function(name, val) {
        for (var i = 0; i < this.length; i++) {
            if (val) {
                this[i].setAttribute(name, val);
            } else {
                return this[i].getAttribute(name);
            }
        }
    }
});

NativeAdapter.getTargetFromEvent = function(event) {
    return event.target;
};

NativeAdapter.getBlockFromElement = function (element) {
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

    var parent = element;
    var isRightBlock = function(block) {
        if (block._id === attr) {
            res = block;
            return true;
        }

        return false;
    };

    while (parent = parent.parentNode) {
        attr = new NativeAdapter(parent).attr(ID_ATTRIBUTE);

        if (attr) {
            require('../vars').allElements.some(isRightBlock);
            break;
        }
    }

    return res;
};

var registered = {};

NativeAdapter.bindTo = function(block, eventName) {
    if (!registered[eventName]) {
        registered[eventName] = [block];
    } else {
        registered[eventName].push(block);
        return;
    }

    document.addEventListener(eventName, function(e) {
        var originalTriggeredBlock = NativeAdapter.getBlockFromElement(e.target);

        if (!originalTriggeredBlock) {
            return;
        }

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
    }, false);
};

NativeAdapter.init = function() {};

module.exports = NativeAdapter;

},{"../utils":14,"../vars":15,"./common":1}],5:[function(require,module,exports){
var utils = require('../utils');
var Primitive = require('./primitive');

function Block(bemjson, parent) {
    this._name = bemjson.block;
    Primitive.apply(this, arguments);
}

Block.prototype = Object.create(Primitive.prototype);

utils.extend(Block.prototype, {
    constructor: Block,

    _formatData: function(data) {
        return data;
    }
});

Block.isBlock = function(bemjson) {
    if (utils.isPlainObject(bemjson) && bemjson.block && !bemjson.elem) {
        return true;
    }

    return false;
};

module.exports = Block;

},{"../utils":14,"./primitive":10}],6:[function(require,module,exports){
var Param = require('./param');
var utils = require('../utils');

function ChangeableParam(key, value) {
    this.key = key;
    this._value = value;
}

ChangeableParam.prototype = new Param();

utils.extend(ChangeableParam.prototype, {
    constructor: ChangeableParam,

    valueOf: function(args) {
        var res = {};
        res[this.key] = this._value.apply(null, args);
        return res;
    }
});

module.exports = ChangeableParam;

},{"../utils":14,"./param":9}],7:[function(require,module,exports){
var Block = require('./block');
var Primitive = require('./primitive');
var utils = require('../utils');

function Element(bemjson, parent) {
    this._name = bemjson.elem;
    Primitive.apply(this, arguments);
}

Element.isElement = function(bemjson) {

    if (utils.isPlainObject(bemjson) && !bemjson.block && bemjson.elem) {
        return true;
    }

    return false;
};

Element.prototype = Object.create(Block.prototype);
utils.extend(Element.prototype, {
    constructor: Element,

    _formatData: function(data) {
        if (data.mods) {
            data.elemMods = data.mods;
            delete data.mods;
        }

        if (data.block) {
            data.elem = data.block;
            delete data.block;
        }

        return data;
    }
});
Element.prototype.constructor = Element;
Element.prototype;

module.exports = Element;

},{"../utils":14,"./block":5,"./primitive":10}],8:[function(require,module,exports){
var Primitive = require('./primitive');
var Block = require('./block');
var BEMElement = require('./element');

module.exports = {
    createBemObject: function(bemjson, parent) {
        if (Primitive.isPrimitive(bemjson)) {
            return new Primitive(bemjson, parent);
        }

        if (Block.isBlock(bemjson)) {
            return new Block(bemjson, parent);
        }

        if (BEMElement.isElement(bemjson)) {
            return new BEMElement(bemjson, parent);
        }

        throw new TypeError('Uknown type of bemjson: ' + typeof bemjson);
    }
};

},{"./block":5,"./element":7,"./primitive":10}],9:[function(require,module,exports){
function Param(key, value) {
    this._key = key;
    this._value = value;
}

Param.prototype = {
    constructor: Param,

    valueOf: function() {
        var res = {};
        var utils = require('../utils');

        res[this._key] = this._value;
        this.valueOf = function() {
            var resCopy = {};
            utils.extend(resCopy, res);
            return resCopy;
        };

        var resCopy = {};
        utils.extend(resCopy, res);
        return resCopy;
    }
};

module.exports = Param;

},{"../utils":14}],10:[function(require,module,exports){
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
    this._allElements = require('../vars').allElements;
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

Primitive.registerListeners = function(block, events) {
    var adapter = require('../vars').adapter;

    Object.keys(events).forEach(function(eventName) {
        adapter.bindTo(block, eventName);
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
        var adapter = require('../vars').adapter;
        function prepareIterableScope(elem) {
            var adaptedElement = adapter(elem);
            var json = adaptedElement.attr(DATA_ATTRIBUTE);

            if (json) {
                var block = adapter.getBlockFromElement(elem);
                var data = JSON.parse(json);
                block.scope[data.name] = block._collection.models[data.index];
            }
        }

        // сопоставляем scope и элемент
        var target = adapter.getTargetFromEvent(e);
        prepareIterableScope(target);

        var parent = target;
        while (parent = parent.parentElement) {
            prepareIterableScope(parent);
        }

        var models = Array.prototype.slice.call(this._getModels());
        models.unshift(e);
        this._params['on' + e.type.charAt(0).toUpperCase() + e.type.slice(1, e.length)].apply(null, models);
    },

    getDomElement: function() {
        var adapter = require('../vars').adapter;

        var domElem = adapter('[' + ID_ATTRIBUTE + '=%id]'.replace('%id', this._id));
        return domElem;

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
        var blocks;
        var block;

        this._loops = this._loops || ((this.parent || {})._loops ? this.parent._loops.slice() : []);

        if (this._iterable) {
            this._loops.push(this._iteratingBindingName);
            blocks = this._collection.models.map(function(model, index) {
                this.scope[this._iteratingBindingName] = model;

                var models = this._getModels();
                var loopAttrs = {};
                loopAttrs[DATA_ATTRIBUTE] = JSON.stringify({
                    name: this._iteratingBindingName,
                    index: index
                });

                if (!this.isShown(models)) {
                    return null;
                }

                return this._formatData({
                    block: this._name,
                    mods: this._getMods(),
                    content: this._content
                        ? this._content.apply(null, models)
                        : (this._children || []).map(function(child) {
                            return child.toBemjson();
                        }, this),
                    attrs: utils.extend(loopAttrs, this._getAttrs())
                });
            }, this);
        } else {
            if (!this.isShown()) {
                return null;
            }

            block = this._formatData({
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

        var html;

        if (this.isWasShown()) {
            var domNode = this.getDomElement();

            domNode.replaceWith(this.toHTML());
        } else {
            // ставим блок после предыдущего блока
            var prev = this.getPreviousSibling();

            if (!prev) {
                html = this.toHTML();

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
                    html = this.toHTML();
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

},{"../errors":12,"../utils":14,"../vars":15,"./":8,"./changeable-param":6,"./param":9}],11:[function(require,module,exports){
var utils = require('./utils');

module.exports =  {
    // TODO check params
    init: function(params) {
        var globals = require('./vars');

        utils.extend(globals, params);

        if (!Array.isArray(params.bemjson)) {
            params.bemjson = [params.bemjson];
        }

        var tree = this.processBemJson(params.bemjson);
        var html = params.templateEngine.apply(tree.map(function(elem) {
            return elem.toBemjson();
        }));
        globals.adapter('body').html(html);
        globals.adapter.init();
    },

    processBemJson: function(bemjson) {
        var bem = require('./bem');

        if (Array.isArray(bemjson)) {
            return bemjson.map(function(child) {
                return this.processBemJson(child);
            }, this);
        } else if (utils.isPlainObject(bemjson)) {
            return bem.createBemObject(bemjson, null);
        }

        throw new TypeError('Uknown type of bemjson: ' + typeof bemjson);
    },

    adapters: require('./adapters')
};

},{"./adapters":3,"./bem":8,"./utils":14,"./vars":15}],12:[function(require,module,exports){
function FixmeError(message) {
    this.message = message;
}

FixmeError.prototype = new Error();
FixmeError.constructor = FixmeError;
FixmeError.name = 'FIXME';

module.exports = {
    FixmeError: FixmeError
};

},{}],13:[function(require,module,exports){
(function() {
    this.bj = require('./bj');
})();

},{"./bj":11}],14:[function(require,module,exports){
function isSameObjects(obj1, obj2) {
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        if (obj1 === null || obj2 === null) {
            return obj1 === obj2;
        }

        for (var key in obj1) {
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                if (!isSameObjects(obj1[key], obj2[key])) {
                    return false;
                }
            } else {
                if (obj1[key] !== obj2[key]) {
                    return false;
                }
            }
        }
        return Object.keys(obj1).length === Object.keys(obj2).length;
    } else {
        return obj1 === obj2;
    }
}

module.exports = {
    extend: function (defaults, options) {
        var prop;

        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                defaults[prop] = options[prop];
            }
        }

        return defaults;
    },

    // https://github.com/jquery/jquery/blob/10399ddcf8a239acc27bdec9231b996b178224d3/src/core.js#L222
    isPlainObject: function(obj) {
        if (obj === null || typeof(obj) !== 'object' || obj.nodeType || obj === obj.window) {
            return false;
        }

        // проверка, что у конструктора (Object) есть isPrototypeOf
        if (obj.constructor && !Object.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        return true;
    },

    isSameObjects: isSameObjects
};

},{}],15:[function(require,module,exports){
module.exports = {
    allElements: [],
    models: {}
};

},{}]},{},[13])