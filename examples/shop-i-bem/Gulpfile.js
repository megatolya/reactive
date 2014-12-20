var gulp = require('gulp');
var concat= require('gulp-concat');

gulp.task('js', function() {
    gulp.src([
        'libs/i-bem/i-bem__stuff.js',
        'blocks/**/*.js'

    ])
    .pipe(concat('blocks.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
    gulp.src([
        'blocks/**/*.css'
    ])
    .pipe(concat('blocks.css'))
    .pipe(gulp.dest('./dist'));
});
gulp.task('images', function() {
    gulp.src([
        'blocks/**/*.jpg',
        'blocks/**/*.png',
        'blocks/**/*.gif'
    ])
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['js', 'css', 'images']);
