var bh = new BH;

var List = Backbone.Collection.extend();
var Item = Backbone.Model.extend({
    initialize: function(text) {
        this.set('text', text);
    }
});

var list = new List([
    new Item('one'),
    new Item('two'),
    new Item('three'),
    new Item('four')
]);

setTimeout(function() {
    list.add(new Item('FIVE!'));
}, 1000);

window.onload = function() {
    bj.init({
        bemjson: {
            block: 'list',
            content: {
                block: 'item',
                iterate: 'item in list',
                bind: 'item',
                content: function(item) {
                    return item.get('text');
                }
            }
        },
        models: {
            list: list
        },
        adapter: bj.adapters.native,
        templateEngine: bh
    });
};
