var Block = require('./block');

function Element(bemjson, parent) {
    Primitive.apply(this, arguments);
}

Element.prototype = Object.create(Block.prototype);
Element.prototype.constructor = Element;

module.exports = Element;
