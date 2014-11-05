(function(undefined) {
    var bh = new BH;

    bh.match('link', function(ctx) {
        ctx.tag('a');
        ctx.attr('href', ctx.param('url') || ctx.param('href'));
    });

    bh.match('container', function(ctx) {
        ctx.tag('div');
    });

    var Settings = Backbone.Model.extend();
    var AnotherModel = Backbone.Model.extend();

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
                content: function(model) {
                    return '123123';
                }
            }
        ];
    };

    window.settings = new Settings();
    window.anotherModel = new AnotherModel();

    anotherModel.set('a', 'asd');
    settings.set('linkText', 'asd2');

    $(function() {
        bj.init({
            bemjson: bemjson(),
            models: {
                settings: settings,
                anotherModel: anotherModel
            },
            adapter: bj.adapters.native,
            templateEngine: bh
        });
    });
})();
