var gulp = require('gulp-help')(require('gulp')),
    sass = require('gulp-sass');

require('colors');

gulp.task('default', 'Confirmation that gulp is set-up', function() {
    console.log('Gulp tasks functional'.green);
});

gulp.task('sass', 'Compile scss files', function() {
    return gulp.src(['./public/assets/styles/**/*.scss', './public/app/**/*.scss'], {base: "./"})
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./'));
});

gulp.task('sass:watch', 'Watch for changes on scss files', function () {
    gulp.watch(['./public/app/**/*.scss', './public/assets/styles/**/*.scss'], ['sass']);
});

gulp.task('build', 'Build project dependencies', ['sass'], function() {

});