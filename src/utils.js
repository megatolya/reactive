function isSameObjects(obj1, obj2) {
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        if (obj1 === null || obj2 === null) {
            return obj1 === obj2;
        }

        for (var key in obj1) {
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                if (!isSameObjects(obj1[key], obj2[key])) {
                    return false;
                }
            } else {
                if (obj1[key] !== obj2[key]) {
                    return false;
                }
            }
        }
        return Object.keys(obj1).length === Object.keys(obj2).length;
    } else {
        return obj1 === obj2;
    }
}

module.exports = {
    extend: function (defaults, options) {
        var prop;

        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                defaults[prop] = options[prop];
            }
        }

        return defaults;
    },

    // https://github.com/jquery/jquery/blob/10399ddcf8a239acc27bdec9231b996b178224d3/src/core.js#L222
    isPlainObject: function(obj) {
        if (obj === null || typeof(obj) !== 'object' || obj.nodeType || obj === obj.window) {
            return false;
        }

        // проверка, что у конструктора (Object) есть isPrototypeOf
        if (obj.constructor && !Object.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        return true;
    },

    isSameObjects: isSameObjects
};
