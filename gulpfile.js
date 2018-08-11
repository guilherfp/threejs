'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var order = require('gulp-order');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var htmlReplace = require('gulp-html-replace');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var es = require('event-stream');
var compress = require('compression');
var path = require('path');
var del = require('del');

var lib = {
  min: ['bower_components/threejs/build/three.min.js'],
  src: [
    'bower_components/colladaLoader/index.js',
    'bower_components/detector/index.js'
  ]
};
var htmlIdx = ['src/index.html'];
var html = ['src/**/*.html'];
var scssIdx = ['src/scss/index.scss'];
var scss = ['src/scss/**/*.scss'];
var js = [
  'src/js/helpers/**/*.js',
  'src/js/control/**/*.js',
  'src/js/models/**/*.js',
  'src/js/scene/**/*.js',
  'src/js/settings/**/*.js',
  'src/js/app.js'
];
var img = ['src/images/**/*', '!src/images/**/*.svg'];

gulp.task('img', function() {
  return gulp
    .src(img)
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'));
});

gulp.task('lib', function() {
  var min = gulp.src(lib.min).pipe(concat('min.js'));

  var src = gulp
    .src(lib.src)
    .pipe(concat('src.js'))
    .pipe(uglify());

  return es
    .merge([min, src])
    .pipe(order(['min.js', 'src.js']))
    .pipe(concat('index.min.js'))
    .pipe(gulp.dest('dist/lib/'));
});

gulp.task('js', ['lib'], function() {
  return gulp
    .src(js)
    .pipe(concat('index.min.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('sass', function() {
  return gulp
    .src(scssIdx)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(rename({ basename: 'index.min' }))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('html', function() {
  return gulp
    .src(htmlIdx)
    .pipe(
      htmlReplace({
        js: ['lib/index.min.js', 'js/index.min.js'],
        css: 'css/index.min.css'
      })
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task('bsync', function() {
  browserSync.init('dist/**/*', {
    server: {
      baseDir: './dist/',
      middleware: [compress()]
    },
    startPath: '/'
  });
});

gulp.task('watch', ['bsync'], function() {
  gulp.watch(js, ['js']);
  gulp.watch(img, ['img']);
  gulp.watch(scss, ['sass']);
  gulp.watch(html, ['html']);
});

gulp.task('clean', function() {
  del.sync(['./dist']);
});

gulp.task('dev', ['clean'], function() {
  gulp.start('html', 'img', 'sass', 'js');
});
