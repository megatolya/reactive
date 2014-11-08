var Param = require('./param');

function ChangeableParam(key, value) {
    this.key = key;
    this._value = value;
}

ChangeableParam.prototype = {
    __proto__: Param,

    constructor: ChangeableParam,

    valueOf: function(args) {
        var res = {};
        res[this.key] = this._value.apply(null, args);
        return res;
    }
};

module.exports = ChangeableParam;
