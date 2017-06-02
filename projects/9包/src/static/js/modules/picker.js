/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:SelectList(选择过滤条件，标签，栏目等)
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:SelectList组件类
    // ------------------------------
    var SelectList = function ($element) {
        this.$ = $element;
    };

    // 定义:SelectList组件的类选择器
    // ------------------------------
    SelectList.prototype.selector = '.jsx-selectlist';

    // 方法:reui调用的入口方法
    // ------------------------------
    SelectList.prototype.init = function () {
        var me = this;

        this.$.on('click.reui.top', function () {
            me.toTop();
        });
    };

    // 方法:返回顶部
    // ------------------------------
    SelectList.prototype.toTop = function () {
        var speed = this.speed();

        $('html,body').animate({ scrollTop: 0 }, speed);
    };

    // 方法:显示
    // ------------------------------
    SelectList.prototype.show = function () {
        var speed = this.speed();

        this.$.stop(true).fadeIn(speed);
    };

    // 属性:记录最后选中的项
    // ------------------------------
    SelectList.prototype.selected = $();

    // 方法:获取值
    // ------------------------------
    SelectList.prototype.getValue = function () {
        var value = [];
        var allSelected = this.$.find('> .selected');

        allSelected.each(function () {
            var $this = $(this);
            var val = $this.data('value');

            if (typeof val != 'undefined') {
                value.push(val);
            } else {
                value.push($this.text());
            }
        });
    };

    // 方法:选择项
    // ------------------------------
    SelectList.prototype.select = function ($option) {
        if ($option.is(this.selected)) return;

        var multiple = this.$.attr('data-multiple');

        if ($option.hasClass('js-all')) {
            $option.parent().find('> *').addClass('selected');
        } else {
            if (multiple == 'true') {
                $option.addClass('selected');
            } else {
                $option.addClass('selected').siblings().removeClass('selected');
            }
        }

        var changeEvent = $.Event('change', { $target: $option });
    };


    // 方法:滚动浏览器滚动动条时，显示或隐藏top组件
    // ------------------------------------------
    $(window).on('click.reui.selectList','.jst-selectlist > *', function () {
        var $selectlist = $(this).parent();
        $selectlist.twui('select', '.jst-selectlist', $option);
    });

    // 注册成reui模块
    // ------------------------------
    reui.module(SelectList);
}(jQuery);