"use strict";

const gulp       = require('gulp'), // Подключаем Gulp
    concat       = require('gulp-concat-util');

const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const pkg = require('./package.json');

gulp.task('build',function() {

// Переносим скрипты в продакшен
    return gulp.src('src/validate.js')
            .pipe(webpackStream(webpackConfig))
            .pipe(concat.header('/**\n* ' + pkg.name + ' v' + pkg.version + '\n*/\n'))
            .pipe(gulp.dest('dist'))
            .pipe(gulp.dest('demo/js'));
    

})

gulp.task('default', gulp.series('build'));

