
var adapter;
var bh;
var allElements = window.allElements = [];

module.exports =  {
    init: function blox_init(params) {
        var _this = this;
        var models = require('./vars').models;

        bh = params.templateEngine;
        adapter = params.adapter;
        $.extend(models, params.models);

        var tree = this.processBemJson(params.bemjson);
        window.tree = tree;

        var html = params.templateEngine.apply(tree.map(function(elem) {
            return elem.toBemjson();
        }));
        adapter('body').html(html);
    },

    processBemJson: function(bemjson) {
        var bem = require('./bem');
        var utils = require('./utils');

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
