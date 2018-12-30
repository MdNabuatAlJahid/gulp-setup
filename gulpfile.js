//lossy compression
// https://gist.github.com/LoyEgor/e9dba0725b3ddbb8d1a68c91ca5452b5
const gulp = require("gulp");
const sass = require("gulp-sass");
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
//gulp-uglify used to minify javaScript
const uglify = require('gulp-uglify');
//gulp-cssnano used to minify css
const cssnano = require('gulp-cssnano');
//gulp-sourcemaps plugin shows original source of the file
const sourcemaps = require('gulp-sourcemaps');
//gulp-concat plugin used to convert multiple files into a single file
const concat = require('gulp-concat');
//gulp-clean plugin used to remove unnecessary files from dist folder
const clean = require('gulp-clean');
//gulp run-sequence runs a series of gulp tasks in order.
const sequence = require('run-sequence');
//Minify PNG, JPEG, GIF and SVG images with imagemin
const imagemin = require('gulp-imagemin');
//image lossy compression
const imageminPngquant = require('imagemin-pngquant');
const imageminZopfli = require('imagemin-zopfli');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminGiflossy = require('imagemin-giflossy');
//A temp file based caching proxy task for gulp.
const cache = require('gulp-cache');

//configuring html file
gulp.task('html', () => {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./dist'))
        //browser reload for html
        .pipe(browserSync.stream({
            reload: true
        }))
});

//configuring sass to css using gulp-sass plugin
gulp.task('css', () => {
    return gulp.src('./src/css/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css'))
        //browser reload for css
        .pipe(browserSync.stream({
            reload: true
        }))
});

//configuring javaScript
gulp.task('js', () => {
    return gulp
        .src('./src/js/**/*.js')
        .pipe(sourcemaps.init())
        //converting es6 to es5 using gulp-babel plugin
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/js'))
        //browser reload for javaScript
        .pipe(browserSync.stream({
            reload: true
        }))
});

//Minify PNG, JPEG, GIF and SVG images with imagemin
gulp.task('image', () => {
    gulp.src('src/img/**/*.+(jpg|png|gif|svg)')
        .pipe(cache(imagemin([
            //png
            imageminPngquant({
                speed: 1,
                quality: 98 //lossy settings
            }),
            imageminZopfli({
                more: true
                // iterations: 50 // very slow but more effective
            }),
            //gif
            // imagemin.gifsicle({
            //     interlaced: true,
            //     optimizationLevel: 3
            // }),
            //gif very light lossy, use only one of gifsicle or Giflossy
            imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3, //keep-empty: Preserve empty transparent frames
                lossy: 2
            }),
            //svg
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            //jpg lossless
            imagemin.jpegtran({
                progressive: true
            }),
            //jpg very light lossy, use vs jpegtran
            imageminMozjpeg({
                quality: 60
            })
        ])))
        .pipe(gulp.dest('dist/img'))
});

//cleaning dist folder
gulp.task('clean', () => {
    return gulp.src('./dist', {
            allowEmpty: true,
            read: false
        })
        .pipe(clean())
});

//configuring server using Browsersync + Gulp.js
gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});

//configuring gulp watch
gulp.task('watch', sequence('clean', ['html', 'server', 'js', 'css']), () => {
    gulp.watch('./src/css/**/*.scss', ['css']);
    gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('./src/*.html', ['html']);
});

gulp.task('default', sequence('watch', 'image'));

gulp.task('build', sequence('clean', 'css', 'html', 'js', 'image'));