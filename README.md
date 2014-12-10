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

## с i-bem и без i-bem
