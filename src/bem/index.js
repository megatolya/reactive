var Primitive = require('./primitive');
var Block = require('./block');
var Element = require('./element');

module.exports = {
    createBemObject: function(bemjson, parent) {
        if (Primitive.isPrimitive(bemjson)) {
            return new Primitive(bemjson, parent);
        }

        if (Block.isBlock(bemjson)) {
            return new Block(bemjson, parent);
        }

        throw new TypeError('Uknown type of bemjson: ' + typeof bemjson);
    }
};
