var App = Backbone.Model.extend({
    defaults: {
        text: '123'
    }
});

var app = new App;

$(function() {
    var bemjson = [{
        block: 'checkbox',
        onChange: function(e) {
            app.set('text', e.target.checked ? 'checked' : 'unchecked');
        }
    }, {
        block: 'text',
        bind: 'app',
        content: function(app) {
            return app.get('text');
        }
    }];
    bj.init({
        bemjson: bemjson,
        models: {
            app: app
        },
        adapter: bj.adapters['i-bem'],
        templateEngine: bh
    });
});
