/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:gulp任务
 * ------------------------------------------------------------ */

// 获取项目所在的路径
// ------------------------------
var fullPath = process.argv.slice(2)[0].replace(/["\\]/g, '/');
var isMobile = fullPath.indexOf('-1') == 0;
var gulpPath = fullPath.substring(fullPath.lastIndexOf('projects'));
var src = gulpPath + 'src/';
var dest = gulpPath + 'dist/';

// 引用插件
// ------------------------------
var gulp = require('gulp');
var include = require('gulp-file-include');
var replace = require('gulp-replace');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sprite = require('gulp.spritesmith');
var server = require('browser-sync');
var reload = server.reload;
var concat = require('gulp-concat');
var del = require('del');

// globs对象：保存用到的各种路径
// ------------------------------
var paths = {};
paths.cssSrc = src + 'static/css/';
paths.icoSrc = src + 'static/icons/';
paths.html=[src + 'web/**/*.html', '!' + src + 'web/include/*.*'];
paths.htmlDest = dest + 'web/';
paths.include = [src + 'web/include/**/_*.html'];
paths.mainScss = [paths.cssSrc + 'main.scss'];
paths.scss = [paths.cssSrc + '**/*.+(css|scss)', '!' + paths.cssSrc + 'import/_sprite.scss'];
paths.cssDest = dest + 'static/css/';
paths.icons = [paths.icoSrc + '*.*', paths.icoSrc + '.*.*'];
paths.cssImport = paths.cssSrc + 'import/';
paths.img = [src + 'static/images/**/**'];
paths.imgDest = dest + 'static/images/';
paths.lib = [src + 'static/lib/**/**'];
paths.libDest = dest + 'static/lib/';
paths.scriptDest = dest + 'static/js/';
paths.script = [src + 'static/js/'];
paths.scriptBase = paths.script + 'base/';
paths.scriptConcat = [paths.scriptBase + 'core.js', paths.scriptBase + 'base.js', paths.scriptBase + 'config.js', paths.scriptBase + 'common.js', paths.script + 'modules/**/*.js', paths.script + '*.js'];
paths.scriptAll = paths.script + '**/*.js';

// 任务对象:保存各种任务调用的函数
// ------------------------------
var tasks = {
    include: function (isModule) {
        var stream = gulp.src(paths.html).pipe(plumber());
        var repalceReg = /\s+@@[\w]+/g;

        if (!isModule) {
            stream = stream.pipe(changed(paths.htmlDest));
        }

        return stream.pipe(include()).pipe(replace(repalceReg,'')).pipe(gulp.dest(paths.htmlDest)).pipe(reload({ stream: true }));
    },
    server: function () {
        var opt = {
            notify: false,
            port: 8015,
            directory: true,
            server: {
                baseDir: dest
            }
        };

        server.init(opt);
    },
    sass: function () {
        var opt = {
            outputStyle:'expanded'
        };

        return gulp.src(paths.mainScss).pipe(sass(opt)).on('error',errorHandler).pipe(gulp.dest(paths.cssDest)).pipe(reload({ stream: true }));
    },
    sprite: function () {
        var opt = {
            imgName: 'icons.png',
            cssName: '_sprite.scss',
            cssFormat: 'css',
            imgPath: '../images/icons.png',
            padding: 10,
            cssTemplate: 'csstemplate/px.handlebars',
            cssVarMap: function (sprite) {
                var cssName = sprite.name.replace(/;/g, ':').replace(/\)/g, '>');
                var nameList = cssName.split(',');
                for (var i = 0; i < nameList.length; i++) {
                    nameList[i] = /\s(\S*)$/.test(nameList[i]) ? nameList[i].replace(/\s(\S*)$/, ' .ico-$1') : nameList[i].replace(/(^.*$)/, '.ico-$1');
                }

                sprite.rem = {
                    offset_x: sprite.x / 40 + 'rem',
                    offset_y: sprite.y / 40 + 'rem',
                    width: sprite.width / 40 + 'rem',
                    height: sprite.height / 40 + 'rem',
                    total_width: sprite.total_width / 40 + 'rem',
                    total_height: sprite.total_height / 40 + 'rem'
                };

                sprite.name = nameList.join(',');
            }
        };

        if (isMobile) opt.cssTemplate = 'csstemplate/rem.handlebars';

        var spriteData = gulp.src(paths.icons).pipe(sprite(opt));
        spriteData.img.pipe(gulp.dest(paths.imgDest));

        var gtReg = /&gt;/g;
        return spriteData.css.pipe(replace(gtReg,'>')).pipe(gulp.dest(paths.cssImport));
    },
    copyImgs: function () {
        return gulp.src(paths.img).pipe(plumber()).pipe(changed(paths.imgDest)).pipe(gulp.dest(paths.imgDest)).pipe(reload({ stream: true }));
    },
    copyLib: function () {
        return gulp.src(paths.lib).pipe(plumber()).pipe(changed(paths.libDest)).pipe(gulp.dest(paths.libDest)).pipe(reload({ stream: true }));
    },
    script: function () {
        return gulp.src(paths.scriptConcat).pipe(concat('reui.js')).pipe(gulp.dest(paths.scriptDest)).pipe(reload({ stream: true }));
    },
    del: function (delpath) {
        delpath = delpath.replace(/\\/g, '/').replace(src, dest);
        del.sync(delpath);
    }
};

// 函数:错误处理
// ------------------------------
var errorHandler = function (error) {
    this.emit('end');
};

// 任务:按html模板生成html文件
// ------------------------------
gulp.task('html', function () {
    return tasks.include();
});

// 任务:编译_main.scss为main.css
// ------------------------------
gulp.task('sass', function () {
    return tasks.sass();
});

// 任务:合并sprite图片
// ------------------------------
gulp.task('sprite', function () {
   return tasks.sprite();
});

// 任务:先合并sprite图片，再生成sass
// ------------------------------------
gulp.task('sassAll', ['sprite'], function () {
    return tasks.sass();
});

// 任务:浏览器自动刷新
// ------------------------------
gulp.task('server', ['sassAll', 'script', 'copyImgs', 'copyLib', 'html'], function () {
    tasks.server();
});

// 任务:复制图片文件
// ------------------------------
gulp.task('copyImgs', function () {
    return tasks.copyImgs();
});

// 任务:复制Lib库文件
// ------------------------------
gulp.task('copyLib', function () {
    return tasks.copyLib();
});

// 任务:脚本处理
// ------------------------------
gulp.task('script', function () {
    return tasks.script();
});

// 任务：监控src目录文件的变动
// ------------------------------
gulp.task('watch', function () {
    var taskHandler = function (event, callback) {
        if (event.type == 'deleted') {
            tasks.del(event.path);
        } else {
            callback();
        }
    };

    // 监控：html文件的改变
    // ------------------------------
    gulp.watch(paths.html, function (event) {
        taskHandler(event, tasks.include);
    });

    // 监控：include文件改变
    // ------------------------------
    gulp.watch(paths.include, function () {
        return tasks.include(true);
    });

    // 监控：scss文件改变
    // ------------------------------
    gulp.watch(paths.scss, ['sass']);

    // 监控：图标改变
    // ------------------------------
    gulp.watch(paths.icons, ['sassAll']);

    // 监控：图片变化
    // ------------------------------
    gulp.watch(paths.img, function (event) {
        taskHandler(event, tasks.copyImgs);
    });

    // 监控：lib变化
    // ------------------------------
    gulp.watch(paths.lib, function (event) {
        taskHandler(event, tasks.copyLib);
    });

    // 监控：脚本变化
    // ------------------------------
    gulp.watch(paths.scriptAll, ['script']);
});

// 任务:默认任务
// ------------------------------
gulp.task('default', ['server', 'watch']);