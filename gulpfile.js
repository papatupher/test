const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');

function style() {
   return gulp.src('../assets/static/scss/**/*.scss')
        .pipe(sass())
        // .pipe(autoprefixer())
        .pipe(gulp.dest('../assets/static/comcss'))
        .pipe(browserSync.stream()); 
}

function watch() {
    
    browserSync.init({
        proxy: 'http://127.0.0.1:8000',
        port:8000,
    });

    gulp.watch('../assets/static/scss/**/*.scss', style);
    gulp.watch('./**/*.html').on('change', browserSync.reload);
    gulp.watch('../assets/static/js/**/*.js').on('change', browserSync.reload);
}

exports.style = style;
exports.watch = watch;



