(function(undefined) {
    var bh = new BH();

    bh.match('link', function(ctx) {
        ctx.tag('a');
        ctx.attr('href', ctx.param('url') || ctx.param('href'));
    });

    bh.match('container', function(ctx) {
        ctx.tag('div');
    });

    var Settings = Backbone.Model.extend();

    var bemjson = function() {
        return [
            {
                block: 'container',
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
                    //' ',
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
                    //' ',
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
            }
        ];
    };

    window.settings = new Settings();

    setTimeout(function() {
        console.log('---');
        settings.set('linkText2', '123')
    }, 1000);

    settings.set('linkText', '<i>im from model lol</i>');

    var models = {
        settings: window.settings
    };

    $(function() {
        blox.init(bemjson(), models, blox.adapters.native, bh);
    });
})();
