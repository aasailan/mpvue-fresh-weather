const gulp = require('gulp')
const jdists = require('gulp-jdists')
const runSequence = require('run-sequence')
const argv = require('minimist')(process.argv.slice(2))
// const ts = require('gulp-typescript');

// cloud-functions 处理方法
const cloudPath = './server/cloud-functions'
const dist = './dist'
const isProd = argv.type === 'prod'

gulp.task('cloud', () => {
  return gulp
    .src(`${cloudPath}/**`)
    .pipe(
      isProd
        ? jdists({
            trigger: 'prod'
          })
        : jdists({
            trigger: 'dev'
          })
    )
    .pipe(gulp.dest(`${dist}/cloud-functions`))
})

gulp.task('watch:cloud', () => {
  gulp.watch(`${cloudPath}/**`, ['cloud'])
})

gulp.task('cloud:dev', () => {
  runSequence('cloud', 'watch:cloud')
})