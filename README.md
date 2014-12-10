# BJ
Что это? 

Фреймворк для разработки одностраничных веб-приложений в терминах БЭМ.

## Живые примеры
См. подробные примеры использования. 

[TODO MVC](http://bem-bj.github.io/bj/todo/)

[Магазин](https://github.com/bem-bj/bj/blob/master/examples/shop-i-bem/pages/shop-app/shop-app.js)

## Как подключить?

## API

Вся суть BJ - добавление ключевых слов в plain bemjson.

### bind
```javascript
var bh = new BH;

bh.match('header', function(ctx) {
    ctx.tag('header');
});


var App = Backbone.Model.extend({
    defaults: {
        text: 'hello world'
    }
});

var app = new App();

window.onload = function() {
    bj.init({
        bemjson: [{
            block: 'header',
            bind: 'app',
            content: function(app) {
                return app.get('text');
            }
        }],
        models: {
            app: app
        },
        adapter: bj.adapters.native,
        templateEngine: bh
    });
};

```
[Пример](http://bem-bj.github.io/bj/api-methods/bind/bind.html)

### showIf

[Пример](http://bem-bj.github.io/bj/api-methods/show-if/show-if.html)

### События

[Пример](http://bem-bj.github.io/bj/api-methods/events/events.html)

### Итерации
```javascript
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
```
[Живой пример](http://bem-bj.github.io/bj/api-methods/iterate/iterate.html)

## с i-bem и без i-bem
