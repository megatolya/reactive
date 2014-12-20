var assert = require('chai').assert;
var jsdom = require('jsdom');

describe('native', function() {
    it('plain bemjson', function() {
        var html = '<html><head></head><body></body></html>';
        var doc = jsdom.jsdom(html);
        var window = doc.parentWindow;
        var $ = global.jQuery = require('jquery')(window);

        $('body').append(123);
        //console.log();
        assert.equal(123, $('body').text());
        //assert.equal(2, 2);
        //assert.equal(3, 3);
        //assert.equal(5, 6);
        //assert.equal(22, 1);
    });

    it('simple app', function() {
    });

});
