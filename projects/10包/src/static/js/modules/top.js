/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:返回顶部
 * ------------------------------------------------------------ */
+function ($) {
    var speed = reui.config.speed;

    // 定义:Top组件类
    // ------------------------------
    var Top = function ($element) {
        this.$ = $element;
    };

    // 定义:Top组件的类选择器
    // ------------------------------
    Top.prototype.selector = '.jsx-top';

    // 方法:reui调用的入口方法
    // ------------------------------
    Top.prototype.init = function () {
        var me = this;

        this.$.on('click.reui.top', function () {
            me.toTop();
        });
    };

    // 方法:返回顶部
    // ------------------------------
    Top.prototype.toTop = function () {
        var speed = this.speed();

        $('html,body').animate({ scrollTop: 0 }, speed);
    };

    // 方法:显示
    // ------------------------------
    Top.prototype.show = function () {
        var speed = this.speed();

        this.$.stop(true).fadeIn(speed);
    };

    // 方法:隐藏
    // ------------------------------
    Top.prototype.hide = function () {
        var speed = this.speed();

        this.$.stop(true).fadeOut(speed);
    };

    // 方法:滚动浏览器滚动动条时，显示或隐藏top组件
    // ------------------------------------------
    $(window).on('lazyScroll.reui.top', function () {
        var scrollTop = $(window).scrollTop();

        if (scrollTop > 150) {
            $('.jsx-top').reui('show');
        } else {
            $('.jsx-top').reui('hide');
        }
    });

    // 注册成reui模块
    // ------------------------------
    reui.module(Top);
}(jQuery);