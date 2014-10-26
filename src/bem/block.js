var utils = require('../utils');
var Primitive = require('./primitive');

function Block(bemjson, parent) {
    Primitive.apply(this, arguments);
    this._name = bemjson.block;
}

Block.prototype = Object.create(Primitive.prototype);

utils.extend(Block.prototype, {
    constructor: Block,

    _getMods: function() {
        return this._mods;
    },

    toBemjson: function(iterableModels) {
        if (this._iterable) {
            var blocks = this.iterableScope[this._iteratingBind].models.map(function(model) {
                var bindedModel = {};
                bindedModel[this._iteratingBind] = model;
                utils.extend(this._models, bindedModel);

                if (!this.isShown())
                    return null;

            console.log(this._getModels());
                return {
                    block: this._name,
                    mods: this._getMods(),
                    content: this._content ? this._content.apply(null, this._getModels()) : (this._children || []).map(function(child) {
                        return child.toBemjson(bindedModel);
                    }),
                    attrs: this._getAttrs()
                }
            }, this);
        } else {
            if (!this.isShown()) {
                return null;
            }

            var block = {
                block: this._name,
                mods: this._getMods(),
                // getchildrenorcontent
                content: this._getContent(),
                attrs: this._getAttrs()
            };

            for (var key in this._params) {
                block[key] = this._params[key];
            }
        }

        return blocks || block;
    },

    // TODO optimize
    _getContent: function() {
        if (this._content) {
            return this._content.apply(null, this._getModels());
        } else {
            if (this._children) {
                return this._children.map(function(child) {
                    return child.toBemjson();
                });
            }
        }
    },

    // TODO если перерисовали родителя, не нужно перерисовывать детей
    repaint: function(prevVal) {
        var adapter = require('../vars').adapter;

        if (this.parent && !this.parent.isShown()) {
            return;
        }

        if (this.wasShown) {
            var domNode = this.getDomElement();

            domNode.replaceWith(this.toHTML());
        } else {
            var prev = this.getPreviousSibling();

            // TODO while?
            if (!prev || !prev.wasShown) {
                var html = this.toHTML();

                if (!this.parent) {
                    adapter(adapter().root).prepend(html);
                } else {
                    this.parent.getDomElement().prepend(html);
                }
            } else {
                this.getPreviousSibling().getDomElement().after(this.toHTML());
            }
        }
    },

    toHTML: function() {
        var templateEngine = require('../vars').templateEngine;
        return templateEngine.apply(this.toBemjson());
    }
});

Block.isBlock = function(bemjson) {
    if (utils.isPlainObject(bemjson) && bemjson.block && !bemjson.elem) {
        return true;
    }

    return false;
};

module.exports = Block;
