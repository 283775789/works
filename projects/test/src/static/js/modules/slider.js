/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:slider
 * ------------------------------------------------------------ */
+function ($) {
    var Slider = function ($element) {
        this.$ = $element;
    };

    // 定义:Slider组件的类选择器
    // ------------------------------
    Slider.prototype.selector = '.jsx-slider';

    // 方法:reui调用的入口方法
    // 如果指定此函数，页面加载时，会自动调用该方法
    // ------------------------------------------------------------
    Slider.prototype.init = function () {
        var me = this;
        var $me = me.$;

        me.reInit();
    };

    // 方法:重新初始化
    // ------------------------------------------------------------
    Slider.prototype.reInit = function () {
        var me = this;
        var $me = me.$;
        var $value = $me.find('> .js-sv');
        var value = parseFloat($me.data('value'));
        var $link = $($me.data('link'));
        var suffix = $me.data('suffix');

        if (typeof suffix != 'string') suffix = '';

        if ($link.length > 0) {
            $me.off('change.slider.reui.link').on('change.reui.slider.link', function (e) {
                if (e.isLink) return;
                $link.val(e.value + suffix);
            });

            $link.off('keyup.slider.reui.link').on('keyup.reui.slider.link', function () {
                me.setValue($(this).val(), false, false,true);
            });
        }

        if (isNaN(value)) return;
        $link.val(value + suffix);
        me.setValue(value, false, true);
    };

    // 方法：设置值
    // ------------------------------
    Slider.prototype.setValue = function (value, isPercent,isInit,isLink) {
        value = parseFloat(value);

        if (isNaN(value)) return;

        var $me = this.$;
        var $value = $me.find('> .js-sv');
        var min = parseFloat($me.data('min'));
        var max = parseFloat($me.data('max'));
        var step = parseFloat($me.data('step'));

        if (isNaN(min)) min = 0;
        if (isNaN(max)) max = 100;
        if (isNaN(step)) step = 1;
        if (isPercent) value = (max - min) * value;
        if (value < min) value = min;
        if (value > max) value = max;

        // 具体值转化为步长相关的值
        var sliderValue = value - min;
        var quotient = parseInt(sliderValue / step);
        var mod = sliderValue % step;

        if (mod >= (step / 2)) {
            value = step * (quotient + 1) + min;
        } else {
            value = step * quotient + min;
        }

        var origValue = $me.data('value');
        var changeEvent = $.Event('change', { value: value, isLink: isLink });

        if (value != origValue || isInit) {
            if (!isInit) {
                if (changeEvent.isDefaultPrevented()) return;

                $me.attr('data-value', value);
                $me.data('value', value);
                $me.trigger(changeEvent);
            }

            var width = parseInt((value - min) / (max - min) * 100) + '%';
            $value.css('width', width);
        }
    };

    // 方法：移动
    // ------------------------------
    Slider.prototype.move = function (pageX) {
        var me = this;
        var $me = me.$;
        var width = $me.outerWidth();
        var x = pageX - $me.offset().left;

        me.setValue(x / width, true);
    };

    // 方法：拖动
    // ------------------------------
    Slider.prototype.drag = function () {
        var me = this;

        $(document).on('mousemove.reui.slider', function (e) {
            me.move(e.pageX);
        });

        $(document).on('mouseup.reui.slider', function (e) {
            $(this).off('mousemove.reui.slider');
        });
    };

    // 方法:在document上委托click事件
    // ------------------------------
    $(document).on('click.reui.slider', '.jsx-slider', function (e) {
        $(this).reui('move', '.jsx-slider', e.pageX);
    });

    // 方法:在document上委托mousedown事件
    // ------------------------------
    $(document).on('mousedown.reui.slider', '.jsx-slider > .js-sh', function (e) {
        $(this).parent().reui('drag', '.jsx-slider');
    });

    // 注册成reui模块
    // ------------------------------
    reui.module(Slider);
}(jQuery);