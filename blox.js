var blox = (function($) {
    function FixmeError(message) {
        this.message = message
    }

    FixmeError.prototype = new Error;
    FixmeError.constructor = FixmeError;
    FixmeError.name = 'FIXME';

    function isSameObjects(obj1, obj2) {
        if (typeof obj1 === 'object' && typeof obj2 === 'object') {
            if (obj1 === null || obj2 === null) {
                return obj1 === obj2;
            }

            for (var key in obj1) {
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                    if (!isSameObjects(obj1[key], obj2[key]))
                        return false;
                } else {
                    if (obj1[key] !== obj2[key])
                        return false;
                }
            }
            return Object.keys(obj1).length === Object.keys(obj2).length;
        } else {
            return obj1 === obj2;
        }
    }

    var i = 0;

    function uniq() {
        return 'uniq' + (i++);
    }

    var MODEL_NAME_PROP = '__name';

    var models;
    var adapter;
    var bh;

    window.allElements = [];

    function Primitive(bemjson, parent) {
        this.parent = parent;
        var _this = this;

        allElements.push(this);
        this._id = uniq();

        if (!Primitive.isPrimitive(bemjson)) {
            this._params = this._extractParams(bemjson);
            this._mods = $.extend({}, bemjson.mods || {});

            this._content = this._extractContent(bemjson.content);

            if (!this._content) {
                this._children = this._extractChildren(bemjson.content);
            }
        } else {
            throw new FixmeError('Plain types in bemjson not implemented yet');
        }

        this._attrs = $.extend({}, bemjson.attrs || {});
        this._attrs['data-blox'] = this._id;


        this._bindings = this._extractBindings(bemjson.bind);
        this._bindings.forEach(function(binding) {
            var model = models[binding];

            if (!model)
                throw new Error('No model such was supplied: ' + binding);

            model.on('change', function(model) {
                if (isSameObjects(this._previousModelChanged, model.changed)) {
                    return;
                }

                this._previousModelChanged = model.changed;
                this.repaint();
            }, this);
        }, this);

        // TODO
        this._previousModelChanged = {};

        var showIf = bemjson.showIf;

        this.isShown = typeof showIf === 'function'
            ? function() {
                return this.wasShown = Boolean(showIf.apply(null, _this._getModelsByBindings()));
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

        if ($.isPlainObject(data)) {
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
                if ($.isPlainObject(bemjson) && !bemjson.elem && !bemjson.block) {
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

        _extractBindings: function(bindings) {
            if (typeof bindings === 'string') {
                return bindings.split(' ');
            }

            return bindings || [];
        },

        _getAttrs: function() {
            return this._attrs;
        },

        // TODO rename getModels?
        _getModelsByBindings: function() {
            return this._bindings.map(function(binding) {
                return models[binding];
            }, this);
        },

        getPreviousSibling: function() {
            var prevBlock = allElements[allElements.indexOf(this) - 1];

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
                }
            }
            return typeof content === 'function'
                ? content
                : null;
        },

        _extractChildren: function(bemjson) {
            var parent = this;

            if ($.isPlainObject(bemjson)) {
                return createBemObject(bemjson, parent);
            } else if ($.isArray(bemjson)) {
                return bemjson.map(function(child) {
                    return createBemObject(child, parent);
                });
            }

            throw new TypeError('Uknown type of bemjson: ' + bemjson);
        },


        getDomElement: function() {
            return adapter('[data-blox=%id]'.replace('%id', this._id));
        }
    };

    function createBemObject(bemjson, parent) {
        if (Primitive.isPrimitive(bemjson)) {
            return new Primitive(bemjson, parent);
        }

        if (Block.isBlock(bemjson)) {
            return new Block(bemjson, parent);
        }

        throw new TypeError('Uknown type of bemjson: ' + typeof bemjson);
    }

    function Block(bemjson, parent) {
        Primitive.apply(this, arguments);
        this._name = bemjson.block;
    }

    Block.prototype = Object.create(Primitive.prototype);
    Block.prototype.constructor = Block;

    Block.prototype._getMods = function() {
        return this._mods;
    };

    Block.prototype.toBemjson = function() {
        if (!this.isShown()) {
            return null;
        }

        var res = {
            block: this._name,
            mods: this._getMods(),
            // getchildrenorcontent
            content: this._getContent(),
            attrs: this._getAttrs()
        };

        for (var key in this._params) {
            res[key] = this._params[key];
        }

        return res;
    };

    // TODO optimize
    Block.prototype._getContent = function() {
        if (this._content) {
            return this._content.apply(null, this._getModelsByBindings());
        } else {
            if (this._children) {
                return this._children.map(function(child) {
                    return child.toBemjson();
                });
            }
        }
    };

    Block.prototype.repaint = function(prevVal) {
        if (this.parent && !this.parent.isShown()) {
            return;
        }

        if (this.wasShown) {
            var domNode = this.getDomElement();

            domNode.replaceWith(bh.apply(this.toBemjson()));
        } else {
            var prev = this.getPreviousSibling();

            // TODO while
            if (!prev || !prev.wasShown) {
                var html = bh.apply(this.toBemjson());

                if (!this.parent) {
                    adapter(adapter().root).append(html);
                } else {
                    this.parent.getDomElement().prepend(html);
                }
            } else {
                this.getPreviousSibling().getDomElement().after(bh.apply(this.toBemjson()));
            }
        }
    };

    Block.isBlock = function(bemjson) {
        if ($.isPlainObject(bemjson) && bemjson.block && !bemjson.elem) {
            return true;
        }

        return false;
    };


    function Element(bemjson, parent) {
        Primitive.apply(this, arguments);
    }

    Element.prototype = Object.create(Block.prototype);
    Element.prototype.constructor = Element;


    function processBemJson(bemjson) {
        if ($.isArray(bemjson)) {
            return bemjson.map(function(child) {
                return processBemJson(child);
            });
        } else if ($.isPlainObject(bemjson)) {
            return createBemObject(bemjson, null);
        }

        if (Primitive.isPrimitive(bemjson)) {
            return new Primitive(bemjson, null);
        }

        throw new TypeError('Uknown type of bemjson: ' + typeof bemjson);
    }

    function commonProps() {}
    commonProps.prototype.root = 'body';

    function BemAdapter(query) {
        if (!(this instanceof BemAdapter)) {
            return new BemAdapter(query);
        }

        this._query = query;
        this[0] = document.querySelector(this._query);
    }

    BemAdapter.prototype = new commonProps();
    $.extend(BemAdapter.prototype, {
        constructor: BemAdapter,

        remove: function() {
            this[0].parentElement.removeChild(element);
        },

        replaceWith: function(html) {
            // TODO
            $(this[0]).replaceWith(html);
        },

        append: function(html) {
            this[0].innerHTML += html;
        },

        prepend: function(html) {
            this[0].innerHTML = html += this[0].innerHTML;
        },

        after: function(html) {
            this[0].outerHTML += html;
        },

        before: function(html) {
            this[0].outerHTML = html + this[0].outerHTML;
        }
    });

    return {
        init: function blox_init(_bemjson, _models, _adapter, _bh) {
            var _this = this;

            bh = _bh;
            adapter = _adapter;
            models = $.extend({}, _models);
            var tree = this.processBemJson(_bemjson);
            window.tree = tree;

            var html = _bh.apply(tree.map(function(elem) {
                return elem.toBemjson();
            }));
            $('body').html(html);
        },

        processBemJson: processBemJson,

        adapters: {
            native: BemAdapter
        }
    };

})(jQuery);
