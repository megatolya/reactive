# BJ
Что это? 

Фреймворк для разработки одностраничных веб-приложений в терминах БЭМ.

## Что дает?
* Компонентность
* Реактивность
* MVC
И все это вместе с методологией БЭМ с возможностью использования компонентных БЭМ библиотек, например, i-bem.

## Живые примеры

[TODO MVC](http://bem-bj.github.io/bj/todo/) ([source](https://github.com/bem-bj/bj/blob/master/examples/todo/app.js))

[Магазин](http://bem-bj.github.io/bj/shop-i-bem/pages/shop-app/shop-app.html) ([source]( https://github.com/bem-bj/bj/blob/master/examples/shop-i-bem/pages/shop-app/shop-app.js))

## Как подключить?
Порядок примерно такой:
* bh и создать его экземпляр (чтобы затем передать его в bj)
* underscore
* backbone
* если используется БЕМ библиотека, то подлючить ее
* подключить bj

[Пример](https://github.com/bem-bj/bj/blob/master/examples/shop-i-bem/pages/shop-app/shop-app.html#L6-L20)

## Инициализация приложения

Для того, чтобы все заработало нужно явно вызвать bj на `domReady`:
```javascript
window.onload = {
    bj.init({
        // Bemjson приложения см. примеры ниже
        bemjson: myBemjson,
        // хеш моделей приложения
        models: {
            cart: cartModel,
            users: usersCollection
        },
        // адаптер, чтобы bj понимал, в какой библиотеке реализованы блоки
        // для i-bem:
        adapter: bj.adapters['i-bem'],
        // без i-bem
        adapter: bj.adapters.native,
        // bh/bemhtml шаблонизатор с описанными шаблонами приложения
        templateEngine: bemhtml
    });
};
```

## API

Вся суть BJ - добавление ключевых слов в plain bemjson.

### bind
```javascript
var bh = new BH();

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
[Живой пример](http://bem-bj.github.io/bj/api-methods/bind/bind.html)

### showIf
```javascript
var bh = new BH();

var App = Backbone.Model.extend({
    defaults: {
        timeSpent: 0
    }
});

var app = new App();

window.onload = function() {
    bj.init({
        bemjson: [{
            block: 'text',
            bind: 'app',
            showIf: function(app) {
                return app.get('timeSpent') > 3000;
            },
        models: {
            app: app
        },
        adapter: bj.adapters.native,
        templateEngine: bh
    });
};
```

### События
```javascript
var bh = new BH();

bh.match('input', function(ctx) {
    ctx.tag('input');
});

var App = Backbone.Model.extend({
    defaults: {
        username: null
    }
});

var app = new App();

window.onload = function() {
    bj.init({
        bemjson: [{
            block: 'input',
            onKeyup: function(e) {
                app.set('username', e.target.value);
            }
        // hr временный костыль изза того что after реализован как outerHTML += header :)
        }, {
            block: 'hr',
            tag: 'hr'
        }, {
            block: 'header',
            bind: 'app',
            content: function(app) {
                var username = app.get('username')
                if (username) {
                    return 'Привет, ' + username + '!';
                } else {
                    return '';
                }
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
[Живой пример](http://bem-bj.github.io/bj/api-methods/events/events.html)

### Итерации
```javascript
var bh = new BH();

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
