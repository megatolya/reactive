var commonProps = require('./common');
var utils = require('../utils');

function NativeAdapter(query) {
    if (!(this instanceof NativeAdapter)) {
        return new NativeAdapter(query);
    }

    if (query) {
        if (typeof query === 'string') {
            utils.extend(this, document.querySelectorAll(query));
            return;
        } else if (query instanceof NodeList) {
            utils.extend(this, query);
            return;
        } else if (query instanceof Element) {
            utils.extend(this, [query]);
            this.length = 1;
            return;
        }

        throw new TypeError('Unknown query ' + query);
    }
}

NativeAdapter.prototype = new commonProps();
utils.extend(NativeAdapter.prototype, {
    constructor: NativeAdapter,

    remove: function() {
        for (var i = 0; i < this.length; i++) {
            this[i].parentElement.removeChild(this[i]);
            delete this[i];
        }
    },

    replaceWith: function(html) {
        var previousSibling = this[0].previousSibling;

        if (previousSibling) {
            this.remove();
            previousSibling.after(html);
        } else {
            var parent = this[0].parentElement;
            this.remove();
            new NativeAdapter(parent).append(html);
        }
    },

    append: function(html) {
        this[0].innerHTML += html;
    },

    prepend: function(html) {
        this[0].innerHTML = html += this[0].innerHTML;
    },

    after: function(html) {
        this[this.length - 1].outerHTML += html;
    },

    before: function(html) {
        this[0].outerHTML = html + this[0].outerHTML;
    },

    html: function(html) {
        this[0].innerHTML = html;
    },

    attr: function(name, val) {
        for (var i = 0; i < this.length; i++) {
            if (val) {
                this[i].setAttribute(name, val);
            } else {
                return this[i].getAttribute(name);
            }
        }
    }
});

NativeAdapter.bindToDoc = function(event, handler) {
    document.addEventListener(event, handler, false);
};
NativeAdapter.init = function() {};

module.exports = NativeAdapter;
