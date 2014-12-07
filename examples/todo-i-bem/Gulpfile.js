var gulp = require('gulp');
var concat= require('gulp-concat');

gulp.task('js', function() {
    gulp.src([
        //'libs/jquery-inherit/*.js',
        //'libs/i-bem/i-bem.js',
        'libs/i-bem/i-bem__stuff.js',
        //'libs/i-bem/i-bem__internal.js',
        //'libs/i-bem/i-bem__dom.js',
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

gulp.task('default', ['js', 'css']);
