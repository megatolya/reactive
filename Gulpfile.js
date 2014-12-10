var gulp = require('gulp');
var rename = require('gulp-rename');
var config = require('./config');
var shell = require('gulp-shell');

gulp.task('default', function() {
    var browserify = require('gulp-browserify');

    return gulp.src('src/index.js')
        .pipe(browserify())
        .pipe(rename(config.fileName))
        .pipe(gulp.dest(config.outputFolder));
});

gulp.task('release', ['default'], function() {
    var uglify = require('gulp-uglify');

    return gulp.src('dist/bj.js')
        .pipe(uglify())
        .pipe(rename(config.minifiedFileName))
        .pipe(gulp.dest(config.outputFolder));
});

gulp.task('watch', function() {
    return gulp.watch(['src/**', 'examples'], ['default']);
});

gulp.task('examples',
    shell.task([
        '../../node_modules/.bin/gulp'
    ], {
        'cwd': './examples/shop-i-bem'
    })
);

gulp.task('gh-pages', ['examples'], function() {
    var deploy = require('gulp-gh-pages');

    return gulp.src('./examples/**/**')
        .pipe(deploy());
});
