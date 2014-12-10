var bh = new BH;

bh.match('search', function(ctx) {
    ctx.tag('input');
    ctx.attrs({
        placeholder: 'Поиск'
    });
});

bh.match('todo-list', function(ctx) {
    ctx.tag('ul');
});

bh.match('todo-item', function(ctx) {
    ctx.tag('li');
});

bh.match('todo-item__text', function(ctx) {
    ctx.tag('span');
});

bh.match('checkbox', function(ctx) {
    ctx.tag('input');
    ctx.attr('type', 'checkbox');
    var json = ctx.json();
    // TODO bug in bh
    if (ctx.mod('checked')) {
        json.attrs = $.extend({checked: 'checked'}, json.attrs);
    }
});

bh.match('button', function(ctx) {
    ctx.tag('button');
});

var App = Backbone.Model.extend({
    defaults: {
        query: '',
        locked: false
    }
});
var Task = Backbone.Model.extend({
    initialize: function(text) {
        this.set('name', text);
    },
    defaults: {
        text: 'Нет описания',
        done: false
    }
});

var Tasks = Backbone.Collection.extend();

var tasks = new Tasks([
    new Task('Сделать что-то'),
    new Task('Сделать что-то еще'),
    new Task('Сделать все остальное'),
    new Task('Все переделать')
]);
var app = new App();

var bemjson = function() {
    return [{
        block: 'head-search',
        content: [{
            block: 'search',
            onKeyup: function(event) {
                app.set('query', event.target.value);
            }
        }, {
            block: 'button',
            content: 'Добавить',
            onClick: function() {
                app.get('query') && tasks.add(new Task(app.get('query')));
                /*
                    document.querySelector('.search').value = '';
                    search.set('query', '');
                */
            }
        }]
    }, {
        block: 'todo-list',
        content: {
            block: 'todo-item',
            bind: ['task', 'app'],
            showIf: function(task, app) {
                return new RegExp(app.get('query')).test(task.get('name'));
            },
            mods: {
                done: function(task, app) {
                    return task.get('done') ? 'yes' : '';
                }
            },
            iterate: 'task in tasks',
            content: [{
                block: 'todo-item-text',
                bind: ['task', 'app'],
                mods: {
                    theme: 'default'
                },
                content: function(task, app) {
                    var str = task.get('name');

                    if (task.get('done')) {
                        str += ' (done)';
                    }

                    return str;
                }
            }, {
                block: 'checkbox',
                bind: 'task',
                onClick: function(e, task) {
                    task.set('done', !task.get('done'));
                },
                mods: {
                    checked: function(task, app) {
                        return task.get('done') ? 'yes' : '';
                    }
                },
                attrs: {
                    disabled: function(task) {
                        return app.get('locked') ? 'disabled' : '';
                    }
                }
            }]
        }
    }, {
        block: 'lock',
        content: [
            {
                block: 'text',
                tag: 'span',
                content: 'Заблокировать чекбоксы'
            },
            {
                block: 'checkbox',
                onClick: function(e) {
                    app.set('locked', !app.get('locked'));
                }
            }
        ]
    }];
};

$(function() {
    bj.init({
        bemjson: bemjson(),
        models: {
            tasks: tasks,
            app: app
        },
        adapter: bj.adapters.native,
        templateEngine: bh
    });
});
