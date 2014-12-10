var bh = new BH;

bh.match('input', function(ctx) {
    ctx.tag('input');
});

var App = Backbone.Model.extend({
    defaults: {
        timeSpent: 0
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
        // hr временный костыль изза input.outerHTML += header
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
                    return ''
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
