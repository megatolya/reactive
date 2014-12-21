var App = Backbone.Model.extend({
    defaults: {
        accepted: false
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
    new Product('iPhone 5', 100),
    new Product('iPhone 5C', 200),
    new Product('iPhone 5S', 300),
    new Product('iPhone 6', 400),
    new Product('iPhone 6 Plus', 400),
    new Product('Nexus 6', 10000)
]);

bh.match('product__title', function(ctx) {
    ctx.tag('span');
});

function cartIsNotEmpty() {
    return cart.models.length !== 0;
}

$(function() {
    var bemjson = [{
            block: 'header',
            content: {
                elem: 'h1',
                tag: 'h1',
                content: 'Супер магазин'
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
                    return product.get('name') + ' ' + product.get('price') + ' $'
                }
            }, {
                block: 'button',
                bind: 'product',
                onClick: function(event, product) {
                    products.remove(product);
                    cart.add(product);
                },
                content: 'Купить'
            }]
        },
    }, {
        block: 'popup',
        content: [{
            block: 'cart-logo'
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
        }, {
            block: 'order',
            content: [{
                elem: 'header',
                tag: 'h3',
                bind: 'cart',
                content: function(products) {
                    var length = products.models.length;

                    switch (length) {
                        case 0:
                            return 'В корзине ничего нет :(';

                        case 1:
                            return 'Нужно больше айфонов!';

                        default:
                            return 'Пора оформлять заказ';
                    }
                }
            }, {
                elem: 'text',
                bind: 'cart',
                showIf: cartIsNotEmpty,
                tag: 'span',
                content: 'Чекбокс, подтверждающий, что вы нажали на чекбокс ☞'
            }, {
                block: 'checkbox',
                bind: ['cart', 'app'],
                showIf: cartIsNotEmpty,
                onClick: function() {
                    console.log('onClick');
                    app.set('accepted', true);
                }
            }, {
                block: 'button',
                content: 'оформить заказ',
                bind: 'cart',
                mods: {
                    disabled: function() {
                        console.log('redraw disabled');
                        return (cartIsNotEmpty() && app.get('accepted')) ? '' : 'yes';
                    },
                    name: 'order'
                }
            }]
        }]
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
