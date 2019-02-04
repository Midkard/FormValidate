"use strict";

const gulp       = require('gulp'), // Подключаем Gulp
    concat       = require('gulp-concat-util'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglify'), // Подключаем gulp-uglify (для сжатия JS)
    watch        = require('gulp-watch'),
    fs           = require('fs');

const pkg = require('./package.json');

const modules_path = 'node_modules/';

function error(err){
	console.log(err.message);
    console.log(err.error);
}

function libs() {

    let paths = [
        modules_path+'jquery.maskedinput/src/jquery.maskedinput.js',
    ]
    let libs = new Promise((resolve, reject) => {
		gulp.src(paths)
	        .pipe(concat('jquery.maskedinput.js'))
        	.pipe(gulp.dest('src'))
        	.on('end', ()=> { resolve(1) })
        	.on('error', (er)=>{ reject(er) });
    });

    return Promise.all([libs]);
}


gulp.task('libs', libs);

gulp.task('clean', function(cb) {
    deleteFolderRecursive('dist'); // Удаляем папку dist перед сборкой
    cb();
})

gulp.task('build', ['clean', 'libs'], function() {

// Переносим скрипты в продакшен
    gulp.src('src/*.js')
            .pipe(concat('validate.min.js'))
            .pipe(uglify())
            .pipe(concat.header('/**\n* ' + pkg.name + ' v' + pkg.version + '\n*/\n'))
            .pipe(gulp.dest('dist'))
            .pipe(gulp.dest('demo/js'));
    

})

gulp.task('default', ['build']);


function mkdir(dir) {
	var arr = dir.split('/');
	let path = '';
	for (var i = 0; i < arr.length; i++) {
		path += arr[i];
		if (! fs.existsSync(path) ) {
			fs.mkdirSync(path);
		}
		path += '/';
	}
}

function deleteFolderRecursive (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};