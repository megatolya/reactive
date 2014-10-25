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

    toBemjson: function() {
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
    },

    // TODO optimize
    _getContent: function() {
        if (this._content) {
            return this._content.apply(null, this._getModelsByBindings());
        } else {
            if (this._children) {
                return this._children.map(function(child) {
                    return child.toBemjson();
                });
            }
        }
    },

    repaint: function(prevVal) {
        if (this.parent && !this.parent.isShown()) {
            return;
        }

        if (this.wasShown) {
            var domNode = this.getDomElement();

            domNode.replaceWith(this.toHTML());
        } else {
            var prev = this.getPreviousSibling();

            // TODO while
            if (!prev || !prev.wasShown) {
                var html = this.toHTML();

                if (!this.parent) {
                    adapter(adapter().root).append(html);
                } else {
                    this.parent.getDomElement().prepend(html);
                }
            } else {
                this.getPreviousSibling().getDomElement().after(this.toHTML());
            }
        }
    },

    toHTML: function() {
        return bh.apply(this.toBemjson());
    }
});

Block.isBlock = function(bemjson) {
    if (utils.isPlainObject(bemjson) && bemjson.block && !bemjson.elem) {
        return true;
    }

    return false;
};

module.exports = Block;
