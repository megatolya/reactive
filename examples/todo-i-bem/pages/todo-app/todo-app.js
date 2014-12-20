var App = Backbone.Model.extend({
    defaults: {
        text: '123'
    }
});

var Cart = Backbone.Collection.extend();
var Products = Backbone.Collection.extend();

var cart = new Cart();
var app = new App();

var Product = Backbone.Model.extend({
    initialize: function(name, price) {
        this.set('name', name);
        this.set('price', price);
    }
});

var products = new Products([
    //new Product('item1', 100),
    //new Product('item2', 100),
    //new Product('item3', 400),
    //new Product('item4', 400),
    //new Product('item5', 600),
    //new Product('item6', 600)
]);

bh.match('product__title', function(ctx) {
    ctx.tag('span');
});

bh.match('product__btn', function(ctx) {
    ctx.tag('button');
    ctx.attr('type', 'button');
    ctx.content('купить');
});

$(function() {
    var bemjson = [{
        block: 'checkbox',
        onChange: function(e) {
            app.set('text', e.target.checked ? 'checked' : 'unchecked');
        }
    }, {
        block: 'products',
        content: {
            block: 'product',
            iterate: 'product in products',
            bind: 'product',
            content: [{
                elem: 'title',
                bind: 'product',
                content: function(product) {
                    return product.get('name') + ' ' + product.get('price')
                }
            }, {
                elem: 'btn',
                bind: 'product',
                onClick: function(event, product) {
                    products.remove(product);
                    cart.add(product);
                }
            }]
        },
    }, {
        block: 'cart',
        content: {
            block: 'product',
            mods: {
                'in-cart': 'yes'
            },
            iterate: 'product in cart',
            bind: 'product',
            content: function(product) {
                return product.get('name');
            }
        }
    }];

    bj.init({
        bemjson: bemjson,
        models: {
            app: app,
            products: products,
            cart: cart
        },
        adapter: bj.adapters['i-bem'],
        templateEngine: bh
    });
});
