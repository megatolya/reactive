bh.match('button', function(ctx, json) {
    ctx.tag('span');
    ctx.js(true);
    ctx.content([{
        elem: 'input',
        tag: 'button',
        attrs: {
            type: 'button'
        }
    }, {
        elem: 'text',
        tag: 'span',
        content: ctx.content()
    }], true);

});

BEM.DOM.decl('button', {
    onSetMod: {
        js: function() {
            this.bindTo('mouseenter', this._onMouseEnter, this);
            this.bindTo('mouseleave', this._onMouseLeave, this);
            this.bindTo('mousedown', this._onMouseDown, this);
            this.bindTo('click', this._onClick, this);
            this.bindToDoc('mouseup', this._onMouseUp, this);
        }
    },

    _onMouseEnter: function() {
        this.setMod('hovered', 'yes');
    },

    _onMouseLeave: function() {
        this.delMod('hovered');
    },

    _onMouseDown: function() {
        this.setMod('active', 'yes');
    },

    _onClick: function() {
        this.trigger('click');
    },

    _onMouseUp: function() {
        this.delMod('active');
    }
});
