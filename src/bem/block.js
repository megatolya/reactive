var utils = require('../utils');
var Primitive = require('./primitive');

function Block(bemjson, parent) {
    Primitive.apply(this, arguments);
    this._name = bemjson.block;
}

Block.prototype = Object.create(Primitive.prototype);

utils.extend(Block.prototype, {
    constructor: Block
});

Block.isBlock = function(bemjson) {
    if (utils.isPlainObject(bemjson) && bemjson.block && !bemjson.elem) {
        return true;
    }

    return false;
};

module.exports = Block;
