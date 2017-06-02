/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:sidebar组件
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Sidebar组件类
    // ------------------------------
    var Sidebar=function ($element) {
        this.$ = $element;
    };

    // 定义:sidebar组件的类选择器
    // ------------------------------
    Sidebar.prototype.selector = '.jsx-sidebar';


    // 方法:reui调用的入口方法
    // ------------------------------
    Sidebar.prototype.init = function () {
        var me = this,
            $link = me.$.find('a');

        $link.on('click.reui.slidebar', function () {
            me.showMenu(this);
        });
    };

    // 方法:显示选中的菜单
    // ------------------------------
    Sidebar.prototype.showMenu = function (element) {
        var me = this,
            $element = $(element),
            $ul = $element.closest('ul'),
            $subUl = $element.parent().children('ul,.sidebar-scroll'),
            $active = $ul.find('> .active'),
            $activeSubUl = $active.children('ul,.sidebar-scroll'),
            speed = me.speed();

        if ($subUl.length > 0) {
            $subUl.stop(true).slideToggle(speed, function () {
                me.activate($element, $subUl, $activeSubUl);
            });

            if (!$subUl.is($activeSubUl)) {
                $activeSubUl.stop(true).slideUp(speed);
            }
        } else {
            if ($activeSubUl.length > 0) {
                $activeSubUl.stop(true).slideUp(speed, function () {
                    me.activate($element, $subUl, $activeSubUl);
                });
            } else {
                me.activate($element, $subUl, $activeSubUl);
            }
        }
    };

    // 方法:为点击的菜单所在的li元素添加active
    // ------------------------------
    Sidebar.prototype.activate = function ($link, $showElement, $hideElement) {
        $link.parent().toggleClass('active').siblings().removeClass('active');
        $showElement.css('display', '');
        $hideElement.css('display', '');
    };

    // 注册成reui模块
    // ------------------------------
    reui.module(Sidebar);
}(jQuery);          
