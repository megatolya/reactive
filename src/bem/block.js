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
        if (iterableModels) {
            utils.extend(this._models, iterableModels);
        }

        if (this._iterable) {
            var blocks = this.iterableScope[this._iteratingBind].models.map(function(model) {
                var bindedModel = {};
                bindedModel[this._iteratingBind] = model;
                utils.extend(this._models, bindedModel);

                if (!this.isShown())
                    return null;

                return {
                    block: this._name,
                    mods: this._getMods(),
                    content: this._content ? this._content.apply(null, this._getModels()) : (this._children || []).map(function(child) {
                        return child.toBemjson(bindedModel);
                    }),
                    attrs: this._getAttrs()
                };
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

    _getContent: function() {
        if (this._content) {
            var models = this._getModels();
            return this._content.apply(null, models);
        } else {
            if (this._children) {
                return this._children.map(function(child) {
                    return child.toBemjson();
                });
            }
        }
    },

    // TODO если перерисовали родителя, не нужно перерисовывать детей
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

            // TODO while?

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
                this.parent.getDomElement().prepend(html);
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
