/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:reui基础模块
 * ------------------------------------------------------------ */
+function ($) {
    // 注册jQuery事件:lazyScroll(减少滚动时滚动事件重复触发次数)
    $.event.special.lazyScroll = {
        setup: function (data) {
            var timer = 0;

            $(this).on('scroll.lazyScroll', function (event) {
                if (!timer) {
                    timer = setTimeout(function () {
                        $(this).triggerHandler('lazyScroll');
                        timer = 0;
                    }, 150);
                }
            });
        },
        teardown: function () {
            $(this).off('scroll.lazyScroll');
        }
    };

    // 注册jQuery事件:lazyResize(减少窗口大小变化时resize事件重复触发次数)
    $.event.special.lazyResize = {
        setup: function (data) {
            var timer = 0;

            $(this).on('resize.lazyResize', function (event) {
                if (!timer) {
                    timer = setTimeout(function () {
                        $(this).triggerHandler('lazyResize');
                        timer = 0;
                    }, 200);
                }
            });
        },
        teardown: function () {
            $(this).off('resize.lazyResize');
        }
    };

    // 注册jQuery实例方法:获取jquery对象class属性中与reui模块相关的模块名称
    $.fn.getReuiNames = function () {
        var moduleSelectorRegex = /\bjsx-[^\s"]+/g,
            classString = this.attr('class'),
            matches = '',
            moduleName='',
            moduleNames = [];

        // 获取所有的以jsx-开头的class类名
        do {
            matches = moduleSelectorRegex.exec(classString);
            if (matches == null) {
                break;
            }

            moduleName = matches[0].substring(4);

            if(reui.modules[moduleName] instanceof reui){
                moduleNames.push(moduleName);
            }
        } while (true)

        return moduleNames;
    };

    // 注册jQuery实例方法:获取对应的reui模块实例
    $.fn.getReuiModules = function () {
        var moduleNames = this.getReuiNames(),
            modules = [];

        // 初始化相关的模块
        for (var i = 0; i < moduleNames.length; i++) {
            modules.push(reui.modules[moduleNames[i]]);
        }

        return modules;
    };

    /* ------------------------------------------------------------------------------------------------------------------------
     * 注册jQuery实例方法reui，参数说明：
     * 1.methodName:可选，要调用的方法名,不指定或指定的方法在组件上不存在，会将方法自动赋值为init初始化方法。
     * 2.moduleSelector:模块选择器，可选，当该元素绑定了多个reui组件对象时且对象存在同名方法时，必须指定。
     * 3.如果该元素还未构造成reui组件，将在其上自动运行reui.build()方法使其转变为reui组件。
     * 4.如果第二个参数不是模块选择器，则第二个参数后的所有参数，都会传递给调用的方法。
     * ------------------------------------------------------------------------------------------------------------------------ */
    $.fn.reui = function (methodName, moduleSelector) {
        var args = [],
            i=1,
            optionName = reui.getModuleName(moduleSelector);

        if (typeof optionName == 'string') i = 2;

        for (; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        return this.each(function () {
            var $this = $(this),
                tagName = $(this).tagName,
                moduleNames = $this.getReuiNames(),
                moduleName = name = '',
                conflict = -1,
                component = null;

            // 指定默认方法名
            if (!typeof methodName == 'string') {
                methodName = 'init';
            }

            // 构建reui组件及检测方法是否有冲突
            for (var i = 0; i < moduleNames.length; i++) {
                name = moduleNames[i];

                component = $this.data('reui.' + name);

                if (!component) {
                    reui.modules[name].build($this);
                    component = $this.data('reui.' + name);
                }

                if (methodName != 'init' && component[methodName]) {
                    moduleName = name;
                    conflict++;
                }
            }

            // 方法冲突处理
            if (conflict > 0) {
                if (typeof optionName != 'string') {
                    if (console.error) {
                        console.error(this, '\n以上元素绑定了多个reui组件且组件存在同名方法，调用方法时必须指定模块选择器".jsx-moduleName"!');
                    }
                    throw Error('元素【' + $this[0].tagName + '.' + $this.attr('class').replace(/\s+/g, '.') + '】绑定了多个reui组件且组件存在同名方法，调用方法时必须指定模块选择器".jsx-moduleName"!');
                } else {
                    moduleName = optionName;
                }
            }

            component = $this.data('reui.' + moduleName);

            if (component && component[methodName]) {
                component[methodName].apply(component, args);
            }
        });
    };
}(jQuery);
