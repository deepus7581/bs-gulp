import gulp from 'gulp';
// import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import stylefmt from 'gulp-stylefmt';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import stylelint from 'stylelint';
import reporter from 'postcss-reporter';
import postcss from 'gulp-postcss';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import {deleteAsync} from 'del';

const deleteSync = deleteAsync;
const sass = gulpSass(dartSass);

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
        message: 'SCSS compiled!',
        sound: 'Pop',
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
    .pipe(notify({ message: 'Plugins concatenated and minified!' }));
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
    .pipe(notify({ message: 'Scripts minified!' }));
});

// Optimize images and convert to WebP
gulp.task('images', function () {
  deleteSync(['dist/img/**/*', 'dist/img/webp/*']); // Exclude WebP images from deletion
  return gulp
    .src('src/img/**/*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'))
    .pipe(webp())
    .pipe(gulp.dest('dist/img/webp'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Images optimized and converted to WebP!' }));
});

// Format SCSS files
gulp.task('format-scss', function () {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(changed('src/scss', { extension: '.scss' }))
    .pipe(sassbeautify())
    .pipe(gulp.dest('src/scss'))
    .pipe(notify({ message: 'SCSS formatted!' }));
});

// Format HTML/PHP files
gulp.task('format', function () {
  return gulp
    .src('**/*.html')
    .pipe(plumber())
    .pipe(changed('.', { extension: '.html' }))
    .pipe(htmlbeautify({ indent_size: 2 }))
    .pipe(gulp.dest('.'))
    .pipe(notify({ message:'HTML/PHP formatted!' }));
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
