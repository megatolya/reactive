var gulp = require('gulp');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var config = require('./config');

gulp.task('default', function() {
    gulp.src('src/index.js')
        .pipe(browserify())
        .pipe(rename(config.outputFilename))
        .pipe(gulp.dest(config.outputFolder));
});

gulp.task('watch', function() {
    gulp.watch('src/**', ['default']);
});
