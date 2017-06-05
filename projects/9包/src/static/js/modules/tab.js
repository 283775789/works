/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:tab
 * ------------------------------------------------------------ */
+function ($) {
    var speed = reui.config.speed;

    // 定义:tab组件类
    // ------------------------------
    var Tab = function ($element) {
        this.$ = $element;
    };

    // 定义:Conponent组件的类选择器
    // ------------------------------
    Tab.prototype.selector = '.jsx-tabnav';

    // 方法:reui调用的入口方法
    // ------------------------------
    Tab.prototype.init = function () {
        var me = this,
            $me = me.$,
            $tabBtn = $me.find('a');

        $me.on('click.reui.tab', 'a', function () {
            me.show($(this));
        });

        $me.on('click.reui.tab', '.js-more > span', function () {
            me.showMore($(this));
        });

        me.createMore();
    };

    // 方法:生成more菜单
    // ------------------------------
    Tab.prototype.createMore = function () {
    };

    // 方法:显示more菜单
    // ------------------------------
    Tab.prototype.showMore = function ($moreBtn) {
    };

    // 方法:隐藏more菜单
    // -----------------------------------
    Tab.prototype.hideMore = function ($moreBody) {
    };

    // 方法:显示tab
    // ------------------------------
    Tab.prototype.show = function ($tabBtn) {
        var $me = this.$,
            $more=$me.find('.js-more'),
            $tem=$tabBtn.parent().parent(),
            $prevTabBtn = $tabBtn.closest('.jsx-tabnav').find('a.active'),
            $target = $($tabBtn.data('target')),
            $activeTab = $target.parent().find(' > .active'),
            changeEvent = $.Event('change.reui', { relatedTarget: $prevTabBtn[0], currentTarget: $tabBtn[0] }),
            changedEvent = $.Event('changed.reui', { relatedTarget: $prevTabBtn[0], currentTarget: $tabBtn[0] }),
            speed = this.speed();

        if ($tabBtn.hasClass('active')) return;

        $me.trigger(changeEvent);

        if (changeEvent.isDefaultPrevented()) return;

        $tabBtn.addClass('active');
        if ($tem.is($more)) {
            $more.addClass('active');
        }

        $prevTabBtn.removeClass('active');
        if ($prevTabBtn.parent().parent().is($more) && !$tem.is($more)) {
            $more.removeClass('active');
        }

        $activeTab.hide().removeClass('active');
        $target.stop(true,true).fadeIn(speed, function () {
            $me.trigger(changedEvent);
        }).addClass('active');
    };

    // 方法:浏览器变化尺寸时，重新生成more菜单
    // ---------------------------------
    $(window).on('lazyResize.reui.tab', function () {
        $('.jsx-tabnav').reui('createMore');
    });

    // 注册成reui模块
    // ------------------------------
    reui.module(Tab);
}(jQuery);