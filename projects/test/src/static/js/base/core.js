/*! ------------------------------------------------------------
 *! 版本:1.0
 *! 描述:reui
 *! 作者:chenxiaoqi
 *! 开源协议:MIT
 *! 官网地址:www.rew3c.com
 *! ------------------------------------------------------------ */
+function ($) {
    // 构造函数:用于构造reui对象实例
     window.reui = function (constructor) {
        var prefix = /^.jsx-[a-zA-Z][a-zA-Z0-9]{0,19}$/,
            temp = new constructor(),
            selector = temp.selector;

        if (!prefix.test(selector)) {
            throw Error('选择器无效，请以".jsx-"开头，然后输入模块名字（需符合js变量规则）!');
        }

        this.selector = selector;
        this.name = selector.substring(5);
        this.constructor = constructor;
    };

    // 构造reui组件
    reui.prototype.build=function ($initElements) {
        var $elements = $(),
            name = this.name,
            constructor = this.constructor;

        $elements = $initElements ? $initElements : $(this.selector);

        $elements.each(function () {
            var $this = $(this),
                component = $this.data('reui.'+name);

            if (!component) {
                component = new constructor($this);

                if (typeof component.init == 'function') {
                    component.init();
                }
                
                $this.data('reui.' + name, component);
            }
        });
    };
    
    // reui模块容器
    reui.modules = {};

    // 注册reui模块
    reui.module = function (constructor) {
        var module = null;

        // 为所有组件添加animate方法
        constructor.prototype.animate = function () {
            return reui.config.animate && this.$.data('animate') != false;
        };

        // 为所有组件添加speed方法
        constructor.prototype.speed = function () {
            var speed = reui.config.speed;

            if (!this.animate()) speed = 0;

            return speed;
        };

        module = new reui(constructor);

        this.modules[module.name] = module;
    };

    // 通过选择器获取模块名称
    reui.getModuleName = function (selector) {
        var moduleName = '';

        if (typeof selector == 'string') {
            moduleName = selector.substring(5);
        }

        if (this.modules[moduleName] instanceof this) {
            return moduleName;
        }
    };

    // 初始化所有模块
    reui.init = function () {
        var modules = this.modules;

        for (var propName in modules) {
            modules[propName].build();
        }
    };

    // 页面加载时初始化所有模块
    $(document).ready(function () {
        reui.init();
    });
}(jQuery);