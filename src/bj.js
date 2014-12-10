var utils = require('./utils');

module.exports =  {
    // TODO check params
    init: function(params) {
        var globals = require('./vars');

        utils.extend(globals, params);

        if (!Array.isArray(params.bemjson)) {
            params.bemjson = [params.bemjson];
        }

        var tree = this.processBemJson(params.bemjson);
        var html = params.templateEngine.apply(tree.map(function(elem) {
            return elem.toBemjson();
        }));
        globals.adapter('body').html(html);
        globals.adapter.init();
    },

    processBemJson: function(bemjson) {
        var bem = require('./bem');

        if (Array.isArray(bemjson)) {
            return bemjson.map(function(child) {
                return this.processBemJson(child);
            }, this);
        } else if (utils.isPlainObject(bemjson)) {
            return bem.createBemObject(bemjson, null);
        }

        throw new TypeError('Uknown type of bemjson: ' + typeof bemjson);
    },

    adapters: require('./adapters')
};
