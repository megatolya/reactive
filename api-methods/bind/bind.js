var bh = new BH;

bh.match('header', function(ctx) {
    ctx.tag('header');
});


var App = Backbone.Model.extend({
    defaults: {
        timeSpent: 0
    }
});

var app = new App();

window.onload = function() {
    bj.init({
        bemjson: {
            block: 'header',
            bind: 'app',
            content: function(app) {
                return 'Потрачено зря времени: ' + app.get('timeSpent') + ' сек.';
            }
        },
        models: {
            app: app
        },
        adapter: bj.adapters.native,
        templateEngine: bh
    });

    setInterval(function() {
        app.set('timeSpent', app.get('timeSpent') + 1);
    }, 1000);
};
