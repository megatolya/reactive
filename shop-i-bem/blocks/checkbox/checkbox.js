(function(undefined) {
    function checkInput(block, checked) {
        block.elem('input').prop('checked', checked);
    }

    BEM.DOM.decl('checkbox', {
        _checkInput: true,

        onSetMod: {
            js: function() {
                var checked = this.getMod('checked');
                checkInput(this, this.getMod('checked') === 'checked');

                this.bindTo('input', 'change', function(e) {
                    var input = e.target;
                    this.setMod('checked', input.checked ? 'yes' : '');
                    this._checkInput = false;
                    //checkInput(this, !input.checked);
                });
            },

            checked: function(modName, modVal, oldVal) {
                var newVal = modVal === 'yes';
                if (this.elem('input').get(0).checked !== newVal) {
                    checkInput(this, newVal);
                }

                this._checkInput = true;
                this.trigger('change', newVal);
            }
        }
    });
})();

bh.match('checkbox', function(ctx) {
    ctx.tag('span');
    ctx.content([{
        elem: 'input'
    }, {
        elem: 'tick'
    }]);
    ctx.js(true);
});

bh.match('checkbox__input', function(ctx) {
    ctx.tag('input');
    ctx.attr('type', 'checkbox');
});
