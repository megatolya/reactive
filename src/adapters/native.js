var ATTRIBUTE = 'bj';
var ID_ATTRIBUTE = 'data-' + ATTRIBUTE;
var commonProps = require('./common');
var utils = require('../utils');

function NativeAdapter(query) {
    if (!(this instanceof NativeAdapter)) {
        return new NativeAdapter(query);
    }

    if (query) {
        if (typeof query === 'string') {
            var list = document.querySelectorAll(query);
            utils.extend(this, list);
            this.length = list.length;
            return;
        } else if (query instanceof NodeList) {
            utils.extend(this, query);
            this.length = query.length;
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
            new NativeAdapter(previousSibling).after(html);
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

    // FIXME
    after: function(html) {
        this[this.length - 1].outerHTML += html;
    },

    // FIXME
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

NativeAdapter.getTargetFromEvent = function(event) {
    return event.target;
};

NativeAdapter.getBlockFromElement = function (element) {
    var adapter = require('../vars').adapter;
    var $element = adapter(element);
    var attr = $element.attr(ID_ATTRIBUTE);

    var res = null;

    if (attr) {
        require('../vars').allElements.some(function(block) {
            if (block._id === attr) {
                res = block;
                return true;
            }

            return false;
        });
    }

    if (res) {
        return res;
    }

    var parent = element;
    var isRightBlock = function(block) {
        if (block._id === attr) {
            res = block;
            return true;
        }

        return false;
    };

    while (parent = parent.parentNode) {
        attr = $(parent).attr(ID_ATTRIBUTE);

        if (attr) {
            require('../vars').allElements.some(isRightBlock);
            break;
        }
    }

    return res;
};

var registered = {};

NativeAdapter.bindTo = function(block, eventName) {
    if (!registered[eventName]) {
        registered[eventName] = [block];
    } else {
        registered[eventName].push(block);
        return;
    }

    document.addEventListener(eventName, function(e) {
        var originalTriggeredBlock = NativeAdapter.getBlockFromElement(e.target);

        if (!originalTriggeredBlock) {
            return;
        }

        registered[eventName].some(function(block) {
            var triggeredBlock = originalTriggeredBlock;
            if (block === triggeredBlock) {
                block.handleEvent(e);
                return true;
            }

            if (!triggeredBlock.parent) {
                return false;
            }

            while (triggeredBlock = triggeredBlock.parent) {
                if (block === triggeredBlock) {
                    block.handleEvent(e);
                    return true;
                }
            }

            return false;
        });
    }, false);
};

NativeAdapter.init = function() {};

module.exports = NativeAdapter;
