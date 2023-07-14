const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
// const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require("gulp-sourcemaps");
const stylefmt = require("gulp-stylefmt");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const stylelint = require("stylelint");
const reporter = require("postcss-reporter");
const postcss = require("gulp-postcss");

// const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const browserSync = require('browser-sync').create();
const prettier = require('gulp-prettier');
const plumber = require('gulp-plumber');
const htmlbeautify = require('gulp-html-beautify');
const jsbeautifier = require('gulp-jsbeautifier');
const sassbeautify = require('gulp-sassbeautify');
const notify = require('gulp-notify');
const changed = require('gulp-changed'); 
const rename = require('gulp-rename');

var onError = function (err) {
  notify.onError(function (error) {
    return error.message;
  })(err);
  this.emit("end");
};

// Compile SCSS to CSS
gulp.task("css", function () {
  return gulp
    .src("src/scss/main.scss")
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError)) // Use "expanded" output style for unminified CSS
    .pipe(
      postcss([
        autoprefixer(),
        stylelint(),
        cssnano(),
        reporter({ clearReportedMessages: true }),
      ])
    )
    .pipe(rename("main.css")) // Rename the unminified CSS file
    .pipe(gulp.dest('dist/css'))
    .pipe(rename("main.min.css")) // Rename the minified CSS file
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/css'))
    .pipe(
      notify({
        message: "SCSS compiled!",
        sound: "Pop",
      })
    );
});

gulp.task("style", function () {
  return gulp.src("src/scss/main.scss").pipe(stylefmt()).pipe(gulp.dest("scss"));
});

// Concatenate and minify JS files from plugins folder
gulp.task('plugins', function () {
  return gulp
    .src([
      //'node_modules/jquery/dist/jquery.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'src/js/plugins/*.js',
    ])
    .pipe(plumber())
    .pipe(concat('libraries.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .pipe(concat('libraries.min.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream())
    .pipe(notify({ "message": "Plugins concatenated and minified!" }));
});

// Minify scripts.js
gulp.task('scripts', function () {
  return gulp
    .src('src/js/scripts.js')
    .pipe(plumber())
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream())
    .pipe(notify({ "message": "Scripts minified!" }));
});

// Optimize images and convert to WebP
gulp.task('images', function () {
  return gulp
    .src('src/img/**/*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'))
    .pipe(webp())
    .pipe(gulp.dest('dist/img/webp'))
    .pipe(browserSync.stream())
    .pipe(notify({ "message": "Images optimized and converted to WebP!" }));
});

// Format SCSS files
gulp.task('format-scss', function () {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(changed('src/scss', { extension: '.scss' }))
    .pipe(sassbeautify())
    .pipe(gulp.dest('src/scss'))
    .pipe(notify({ "message": "SCSS formatted!" }));
});

// Format HTML/PHP files
gulp.task('format-html-php', function () {
  return gulp
    .src('**/*.html')
    .pipe(plumber())
    .pipe(changed('.', { extension: '.html' }))
    .pipe(htmlbeautify({ indent_size: 2 }))
    .pipe(gulp.dest('.'))
    .pipe(notify({ "message":"HTML/PHP formatted!" }));
});

// Format JS files
gulp.task('format-js', function () {
  return gulp
    .src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(changed('src/js', { extension: '.js' }))
    .pipe(jsbeautifier())
    .pipe(gulp.dest('src/js'))
    .pipe(notify({ "message":"JS formatted!" }));
});

// Watch for changes in SCSS, JS, and HTML/PHP files
gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });

  gulp.watch('src/scss/**/*.scss', gulp.series('css')).on('change', browserSync.reload);
  gulp.watch('dist/css/**/*.css').on('change', browserSync.reload);
  gulp.watch('src/js/plugins/*.js', gulp.series('plugins')).on('change', browserSync.reload);
  gulp.watch('src/js/scripts.js', gulp.series('scripts')).on('change', browserSync.reload);
  gulp.watch('dist/js/**/*.js').on('change', browserSync.reload);
  gulp.watch('*.html').on('change', browserSync.reload);
  gulp.watch('src/img/**/*', gulp.series('images')).on('change', browserSync.reload);
  gulp.watch('dist/img/**/*').on('change', browserSync.reload);
  // gulp.watch('src/scss/**/*.scss', gulp.series('format-scss')).on('change', notifyOnSuccess('SCSS formatted!'));
  // gulp.watch('**/*.html', gulp.series('format-html-php')).on('change', notifyOnSuccess('HTML/PHP formatted!'));
  // gulp.watch('src/js/**/*.js', gulp.series('format-js')).on('change', notifyOnSuccess('JS formatted!'));
});

// Helper function to display notifications on task completion
function notifyOnSuccess(message) {
  return function () {
    return gulp.src('.').pipe(notify({ message }));
  };
}
// Default task
gulp.task('default', gulp.series( 'css', 'plugins', 'scripts', 'images', 'watch'));
