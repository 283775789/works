/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:fixer
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:fixer组件类
    // ------------------------------
    var Fixer = function ($element) {
        this.$ = $element;
    };

    // 定义:Fixer组件的类选择器
    // ------------------------------
    Fixer.prototype.selector = '.jsx-fixer';

    // 方法:reui调用的入口方法
    // ------------------------------
    Fixer.prototype.init = function () {
        var me = this;
        var $me = this.$;

        // 滚动监视
        // ------------------------------
        var $dataLink = me.getLinkBox();
        $dataLink.on('lazyScroll.reui.fixer', function () {
            me.fix($(this));
        });

        // 浏览器尺寸变化时，重新计算尺寸
        $(window).on('lazyResize.reui.fixer', function () {
            me.reInit();
            me.fix($dataLink);
        });

        me.reInit();
    };

    // 方法:获取关联的滚动容器
    // ------------------------------
    Fixer.prototype.getLinkBox = function () {
        var $me = this.$;
        var $dataLink = $($me.data('link'));
        $dataLink = $dataLink.length > 0 ? $dataLink : $(window);

        return $dataLink;
    };

    // 方法:重初始化
    // ------------------------------
    Fixer.prototype.reInit = function () {
        var $me = this.$;

        if (typeof $me.data('style') == 'string') $me.attr('style', $me.data('style'));
        $me.removeClass('c-fixer top bottom');

        var matrix = reui.getElementMatrix($me);
        $me.data('matrix', matrix);

        if (typeof $me.data('style') == 'undefined') {
            var style = $me.attr('style');

            if (!style) style = '';

            $me.data('style', style);
        }

        var $dataLink = $($me.data('link'));
        this.fix($dataLink);
    };

    // 方法:固定位置
    // ------------------------------
    Fixer.prototype.fix = function ($this) {
        var $me = this.$;
        var scrollTop = $this.scrollTop();
        var matrix = $me.data('matrix');
        var top = matrix.top;
        var position = $me.data('position');

        if (position != 'bottom') {
            if (scrollTop >= top) {
                $me.css({ left: matrix.left, width: matrix.width, position: 'fixed', top: 0 });
                $me.data('fix', true);
            } else {
                $me.attr('style', $me.data('style'));
                $me.data('fix', false);
            }
        } else {
            var windowHeight = $(window).height();
            var height = $me.outerHeight();

            if (scrollTop + windowHeight - height <= top) {
                $me.css({ left: matrix.left, width: matrix.width, position: 'fixed', bottom: 0 });
                $me.data('fix', true);
            } else {
                $me.attr('style', $me.data('style'));
                $me.data('fix', false);
            }
        }

        var tempFix = $me.data('tempFix');
        var dataFix = $me.data('fix');

        if (typeof tempFix == 'undefined' || tempFix != $me.data('fix')) {
            $me.data('tempFix', dataFix);

            var changeFix = $.Event('changeFix.reui');
            $me.trigger(changeFix);
        }
    };

    // 注册成reui模块
    // ------------------------------
    reui.module(Fixer);
}(jQuery);