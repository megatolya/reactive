var commonProps = require('./common');
var utils = require('../utils');
var errors = require('../errors');
var FixmeError = errors.FixmeError;

var ATTRIBUTE = 'bj';
var ID_ATTRIBUTE = 'data-' + ATTRIBUTE;

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
        // TODO надо/нет?
        this.$ = null;
    },

    replaceWith: function(html) {
        var $html = $(html);
        this.before($html);
        this.remove();
        this.$ = $html;
        BEM.DOM.init($html);
    },

    append: function(html) {
        BEM.DOM.append(this.$.eq(0), html);
    },

    prepend: function(html) {
        BEM.DOM.prepend(this.$.eq(0), html);
    },

    after: function(html) {
        BEM.DOM.after(this.$.eq(this.$.length - 1), html);
    },

    before: function(html) {
        BEM.DOM.before(this.$.eq(0), html);
        BEM.DOM.init();
    },

    html: function(html) {
        BEM.DOM.update(this.$, html);
    },

    attr: function(name, val) {
        return this.$.attr.apply(this.$, arguments);
    }
});

// TODO перенести
function getBlockById(id) {
    var allElements = require('../vars').allElements;

    // TODO
    return allElements.filter(function(block) {
        return block._id === id;
    })[0];
}

BemAdapter.getBlockFromElement = function(element) {
    var parent = $(element);
    var id = parent.attr(ID_ATTRIBUTE);

    if (id) {
        return getBlockById(id);
    }

    while (parent = parent.parent() && parent.length !== 0) {
        id = parent.attr(ID_ATTRIBUTE);

        if (id) {
            return getBlockById(id);
        }
    }

    return null;
};

BemAdapter.getTargetFromEvent = function(event) {
    return event.target.domElem.get(0);
};

// blockname -> {eventName: true}
var registered = {};

BemAdapter.bindTo = function(block, eventName) {
    if (registered[block._name] && registered[block._name][eventName]) {
        return;
    }

    BEM.blocks[block._name].on(eventName, function(event, data) {
        block.handleEvent(event, data);
    });
};

BemAdapter.init = function() {
    BEM.DOM.init();
};

module.exports = BemAdapter;
