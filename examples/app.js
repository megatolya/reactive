(function(undefined) {
    var bh = new BH;

    bh.match('link', function(ctx) {
        ctx.tag('a');
        ctx.attr('href', ctx.param('url') || ctx.param('href'));
    });

    bh.match('container', function(ctx) {
        ctx.tag('div');
    });
    bh.match('container_type_list', function(ctx) {
        ctx.tag('ul');
    });
    bh.match('list-item', function(ctx) {
        ctx.tag('li');
    });


    var Settings = Backbone.Model.extend();
    var AnotherModel = Backbone.Model.extend();
    var Bookmark = Backbone.Model.extend({
        initialize: function(url) {
            this.set('url', url);
        }
    });
    var BookmarksList=  Backbone.Collection.extend({
        model: Bookmark
    });

    var bemjson = function() {
        return [
            {
                block: 'container',
                bind: ['settings', 'anotherModel'],
                showIf: function(settings, anotherModel) {
                    return anotherModel.get('a');
                },
                content: [
                    {
                        block: 'link',
                        url: 'http://yandex.ru',
                        bind: 'settings',
                        showIf: function(settings) {
                            return settings.get('linkText');
                        },
                        content: function(settings) {
                            return 'Text from model: ' + settings.get('linkText');
                        }
                    },
                    {
                        block: 'link',
                        url: 'http://yandex.ru',
                        bind: 'settings',
                        showIf: function(settings) {
                            return settings.get('linkText2');
                        },
                        content: function(settings) {
                            return 'Text from model: ' + settings.get('linkText2');
                        }
                    },
                    {
                        block: 'link',
                        url: 'http://yandex.ru',
                        bind: 'settings',
                        showIf: function(settings) {
                            return settings.get('linkText');
                        },
                        content: function(settings) {
                            return 'Text from model: ' + settings.get('linkText');
                        }
                    }
                ]
            },
            {
                block: 'container',
                mods: {
                    index: '2'
                },
                content: [
                    {
                        block: 'link',
                        url: 'http://mail.ru',
                        content: 'mail.ru'
                    },
                    {
                        block: 'link',
                        url: 'http://gmail.com',
                        content: 'gmail.com'
                    },
                    {
                        block: 'link',
                        url: 'http://ya.ru',
                        bind: 'anotherModel',
                        content: function(anotherModel) {
                            return anotherModel.get('a');
                        }
                    }
                ]
            },
            {
                block: 'container',
                mods: {
                    type: 'list'
                },
                content: {
                    iterate: 'item in bookmarksList',
                    bind: 'item',
                    block: 'list-item',
                    content: function(item) {
                        return item.get('url');
                    }
                }
            }
        ];
    };

    window.settings = new Settings();
    window.anotherModel = new AnotherModel();
    window.Bookmark = Bookmark;
    window.bookmarksList = new BookmarksList([new Bookmark('http://one.ru'), new Bookmark('http://two.ru'), new Bookmark('http://three.ru')]);

    anotherModel.set('a', 'asd');
    settings.set('linkText', 'asd2');

    $(function() {
        blox.init({
            bemjson: bemjson(),
            models: {
                settings: settings,
                anotherModel: anotherModel,
                bookmarksList: bookmarksList
            },
            adapter: blox.adapters.native,
            templateEngine: bh
        });
    });
})();
