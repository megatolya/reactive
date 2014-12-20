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
