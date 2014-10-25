var commonProps = require('./common');
var utils = require('../utils');

function NativeAdapter(query) {
    if (!(this instanceof NativeAdapter)) {
        return new NativeAdapter(query);
    }

    if (query) {
        this._query = query;
        this[0] = document.querySelector(this._query);
    }
}

NativeAdapter.prototype = new commonProps();
utils.extend(NativeAdapter.prototype, {
    constructor: NativeAdapter,

    remove: function() {
        this[0].parentElement.removeChild(element);
    },

    replaceWith: function(html) {
        // TODO
        $(this[0]).replaceWith(html);
    },

    append: function(html) {
        this[0].innerHTML += html;
    },

    prepend: function(html) {
        this[0].innerHTML = html += this[0].innerHTML;
    },

    after: function(html) {
        this[0].outerHTML += html;
    },

    before: function(html) {
        this[0].outerHTML = html + this[0].outerHTML;
    },

    html: function(html) {
        this[0].innerHTML = html;
    }
});

module.exports = NativeAdapter;
