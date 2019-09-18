"use strict";

const gulp       = require('gulp'), // Подключаем Gulp
    concat       = require('gulp-concat-util'), // Подключаем gulp-concat (для конкатенации файлов)
//    uglify       = require('gulp-uglify'), // Подключаем gulp-uglify (для сжатия JS)
    fs           = require('fs');

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const pkg = require('./package.json');

const modules_path = 'node_modules/';

function error(err){
	console.log(err.message);
    console.log(err.error);
}

gulp.task('build',function() {

// Переносим скрипты в продакшен
    return gulp.src('src/validate.js')
            .pipe(webpackStream(webpackConfig), webpack)
            .pipe(concat.header('/**\n* ' + pkg.name + ' v' + pkg.version + '\n*/\n'))
            .pipe(gulp.dest('dist'))
            .pipe(gulp.dest('demo/js'));
    

})

gulp.task('default', gulp.series('build'));

