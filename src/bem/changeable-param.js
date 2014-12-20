var Param = require('./param');
var utils = require('../utils');

function ChangeableParam(key, value) {
    this.key = key;
    this._value = value;
}

ChangeableParam.prototype = new Param();

utils.extend(ChangeableParam.prototype, {
    constructor: ChangeableParam,

    valueOf: function(args) {
        var res = {};
        res[this.key] = this._value.apply(null, args);
        return res;
    }
});

module.exports = ChangeableParam;
