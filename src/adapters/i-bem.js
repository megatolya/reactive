var commonProps = require('./common');
var utils = require('../utils');
var errors = require('../errors');
var FixmeError = errors.FixmeError;

function BemAdapter(query) {
    if (!(this instanceof BemAdapter)) {
        return new BemAdapter(query);
    }

    this.$ = $(query);
    this.length = this.$.length;
}

BemAdapter.prototype = new commonProps();
utils.extend(BemAdapter.prototype, {
    constructor: BemAdapter,

    remove: function() {
        BEM.DOM.destruct(this.$);
    },

    replaceWith: function(html) {
        BEM.DOM.replace(this.$, html);
    },

    append: function(html) {
        BEM.DOM.append(this.$.eq(0), html);
    },

    prepend: function(html) {
        BEM.DOM.prepend(this.$.eq(0), html);
    },

    after: function(html) {
        BEM.DOM.after(this.$, html);
    },

    before: function(html) {
        BEM.DOM.before(this.$, html);
    },

    html: function(html) {
        BEM.DOM.update(this.$, html);
    },

    attr: function(name, val) {
        return this.$.attr.apply(this.$, arguments);
    }
});

BemAdapter.bindToDoc = function(event, handler) {
    document.addEventListener(event, handler, false);
};
BemAdapter.init = function() {
    BEM.DOM.init();
};

module.exports = BemAdapter;
