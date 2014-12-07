var Block = require('./block');
var Primitive = require('./primitive');
var utils = require('../utils');

function Element(bemjson, parent) {
    Primitive.apply(this, arguments);
    this._name = bemjson.elem;
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
Element.prototype

module.exports = Element;
