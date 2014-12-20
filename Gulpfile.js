var gulp = require('gulp');
var rename = require('gulp-rename');
var config = require('./config');

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
