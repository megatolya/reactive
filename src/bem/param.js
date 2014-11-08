function Param(key, value) {
    this._key = key;
    this._value = value;
}

Param.prototype = {
    constructor: Param,

    valueOf: function() {
        var res = {};
        var utils = require('../utils');

        res[this._key] = this._value;
        this.valueOf = function() {
            var resCopy = {};
            utils.extend(resCopy, res);
            return resCopy;
        };

        var resCopy = {};
        utils.extend(resCopy, res);
        return resCopy;
    }
};

module.exports = Param;
