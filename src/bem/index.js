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
