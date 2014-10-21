// копирует bemjson рекурсивно
function deepCopy(from, to) {
    if (!to) {
        if ($.isArray(from)) {
            to = [];
        } else if ($.isPlainObject(from)) {
            to = {};
        } else {
            return from;
        }
    }

    if ($.isArray(from)) {
        from.forEach(function(val) {
            to.push(deepCopy(val));
        });
    }

    if ($.isPlainObject(from)) {
        to = {};
        for (var prop in from) {
            to[prop] = deepCopy(from[prop]);
        }
    }

    return to;
}

