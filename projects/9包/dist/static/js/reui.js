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

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:默认配置项
 * ------------------------------------------------------------ */
+function ($) {
    reui.config = {
        animate: true,
        speed: 300,
        win: {
            content: '',
            miniTime: 3000
        },
        wins: {
            confirm: {
                title: '确认提示',
                icon: '<i class="ico ico-confirm"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">确定</a>'
                    },
                    {
                        html: '<a class="u-btn xlesser">取消</a>'
                    }
                ]
            },
            success: {
                icon: '<i class="ico ico-success"></i>',
                time:2000
            },
            alert: {
                title: '警告提示',
                icon: '<i class="ico ico-warning"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">确定</a>'
                    },
                    {
                        html: '<a class="u-btn xlesser">关闭</a>'
                    }
                ]
            },
            error: {
                title: '错误提示',
                icon: '<i class="ico ico-error"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">知道了</a>'
                    }
                ]
            },
            tip: {
                title: '提示信息',
                icon: '<i class="ico ico-tip"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">知道了</a>'
                    }
                ]
            },
            loading: {
                icon: '<i class="ico ico-loading"></i>',
                time:0
            },
            msg: {
                time: 2000
            }
        }
    };
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:html模板
 * ------------------------------------------------------------ */
+function ($) {
    reui.templete = {
        editInput: '<input class="c-editinput" type="text" />',
        win: '<div class="m-win info jsx-win"><div class="win-body"><div></div></div></div>',
        winHeader: '<div class="win-header"><a class="shut js-win-close" title="关闭">×</a><h4></h4></div>',
        winMax:'<a class="max js-win-max" title="最大化"></a>',
        winFooter:'<div class="win-footer"></div>',
        msgWin: '<div class="m-win msg jsx-win"><i></i><div></div></div>',
        editItem: '<li class="jsx-edititem"><a><span class="js-value"></span><div class="sidebar-edititems-icons"><span class="js-editbtn"><i class="ico ico-edit2"></i></span><span class="js-delbtn"><i class="ico ico-delete2"></i></span></div></a></li>',
        tabMore: '<div class="tabnav-more js-more"><span>更多<b class="caret"></b></span><div></div></div>',
        dim: '<div class="c-dim"></div>'
    };
}(jQuery);
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:reui公用函数
 * ------------------------------------------------------------ */
+function ($) {
    // 获取元素的三维矩阵信息
    reui.getElementMatrix = function ($element) {
        var top = $element.offset().top,
            left = $element.offset().left,
            width = $element.outerWidth(),
            height = $element.outerHeight();

        return { top: top, left: left, width: width, height: height };
    };

    // 复制元素的矩阵信息
    reui.copyMatrix = function ($source) {
        var matrix = reui.getElementMatrix($source);

        for (var i = 1; i < arguments.length; i++) {
            arguments[i].css({
                left: matrix.left,
                top: matrix.top,
                width: matrix.width,
                height: matrix.height
            });
        }
    };

    // 居中元素
    reui.center = function ($source, $element, nonnegative) {
        var sourceWidth = $source.outerWidth(),
            sourceHeight = $source.outerHeight(),
            elementWidth = $element.outerWidth(),
            elementHeight = $element.outerHeight(),
            x = (sourceWidth - elementWidth) / 2,
            y = (sourceHeight - elementHeight) / 2;

        if (nonnegative) {
            x = x < 0 ? 0 : x;
            y = y < 0 ? 0 : y;
        }

        $element.css({ left: x, top: y });
    };

    // 表单报错
    reui.invalid = function (errorMsg, $ctr, time) {
        var $invalid = $(' <div class="c-invalid"></div>');
        var time = parseInt(time);

        if ($ctr instanceof jQuery) {
            var left = $ctr.position().left;
            var top = $ctr.position().top - 35;
            var width = $ctr.outerWidth();
            $ctr.addClass('xerror').focus();
        }

        $invalid.css({
            left: left,
            top: top,
            width: width
        }).text(errorMsg);

        if (isNaN(time)) time = 1000;

        $ctr.parent().append($invalid);
        $invalid.fadeIn();

        setTimeout(function () {
            $invalid.fadeOut(function () {
                $(this).remove();
            });
        }, time)
    };
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:Anchor
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Anchor组件类
    // ------------------------------
    var Anchor = function ($element) {
        this.$ = $element;
    };

    // 定义:Anchor组件的类选择器
    // ------------------------------
    Anchor.prototype.selector = '.jsx-anchor';

    // 方法:reui调用的入口方法
    // ------------------------------
    Anchor.prototype.init = function () {
        var me = this;
        var $me = this.$;
        var $anchors = $me.find('a');

        // 点击锚点调用滑动方法
        $anchors.on('click.reui.anchor', function () {
            me.slide($(this));
        });

        // 滚动监视
        var $dataLink = $($me.data('link'));
        $dataLink = $dataLink.length > 0 ? $dataLink : $(window);

        $dataLink.on('scroll.reui.anchor', function () {
            me.scrollSpy($(this));
        });
    };

    // 方法:滑动方法
    // ------------------------------
    Anchor.prototype.slide = function ($this) {
        var $me = this.$;
        var $dataLink = $($me.data('link'));
        var $activeAnchor = $me.find('a.active');

        if ($activeAnchor.is($this)) return;

        var slideEvent = $.Event('slide.reui.scrollspy');
        var slidEvent = $.Event('slid.reui.scrollspy');

        $me.trigger(slideEvent);
        if (slideEvent.isDefaultPrevented()) return;

        var $target = $($this.data('target'));
        var targetTop = $target.offset().top;
        var offset = $me.data('offset');
        var speed = this.speed();

        if ($dataLink.length == 0) {
            $dataLink = $('html,body');
        } else {
            var linkScrollTop = $dataLink.scrollTop();
            targetTop = targetTop - $dataLink.offset().top + linkScrollTop;
        }

        if (typeof offset == 'number') targetTop -= offset;

        $dataLink.animate({ scrollTop: targetTop }, speed, function () {
            $me.find('a').removeClass('active');
            $this.addClass('active');
            $me.trigger(slidEvent);
        });
    };

    // 方法:滑动方法
    // ------------------------------
    Anchor.prototype.scrollSpy = function ($this) {
        var scrollTop = $this.scrollTop();
        var top = 0;

        if (!$this.is($(window))) top = scrollTop - $this.offset().top;

        var $me = this.$;
        var $anchors = $me.find('a');
        var offset = $me.data('offset');

        offset = isNaN(offset) ? 0 : offset;

        $anchors.each(function () {
            var $self = $(this);
            var $target = $($self.data('target'));
            var targetTop = $target.offset().top;

            if (scrollTop >= (targetTop + top - offset)) {
                $me.find('a.active').removeClass('active');
                $self.addClass('active');
            }
        });
    };

    // 注册成reui模块
    // ------------------------------
    reui.module(Anchor);
}(jQuery);
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:sidebar
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Collapse组件类
    // ------------------------------
    var Collapse = function ($element) {
        this.$ = $element;
    };

    // 定义:Collapse组件的类选择器
    // ------------------------------
    Collapse.prototype.selector = '.jsx-collapse';

    // 方法:切换折叠项的显示与隐藏
    // ------------------------------
    Collapse.prototype.toggle = function () {
        var $me = this.$,
            $target = $($me.data('target')),
            speed = this.speed(),
            showEvent = $.Event('show.reui.collapse'),
            shownEvent = $.Event('shown.reui.collapse'),
            hideEvent = $.Event('hide.reui.collapse'),
            hiddenEvent = $.Event('hidden.reui.collapse');

        if ($target.is(':visible')) {
            $me.trigger(hideEvent);

            if (hideEvent.isDefaultPrevented()) return;

            $target.stop(true, true).slideUp(speed, function () {
                $(this).addClass('collapse');
                $me.addClass('collapsed');
                $me.trigger(hiddenEvent);
            });
        } else {
            $me.trigger(showEvent);

            if (showEvent.isDefaultPrevented()) return;

            $target.stop(true, true).slideDown(speed, function () {
                $(this).removeClass('collapse');
                $me.removeClass('collapsed');
                $me.trigger(shownEvent);
            });
        }
    };

    // 方法:在document上委托click事件
    // ------------------------------
    $(document).on('click.reui.collapse', '.jsx-collapse', function () {
        $(this).reui('toggle', '.jsx-collapse');
    });

    // 注册成reui模块
    // ------------------------------
    reui.module(Collapse);
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:edititem组件
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:EditItem组件类
    // ------------------------------
    var EditItem = function ($element) {
        this.$ = $element;
    };

    // 定义:edititem组件的类选择器
    // ------------------------------
    EditItem.prototype.selector = '.jsx-edititem';

    // 方法:reui调用的入口方法
    // ------------------------------
    EditItem.prototype.init = function () {
        var me = this,
            $editBtn = me.$.find('.js-editbtn'),
            $delBtn = me.$.find('.js-delbtn');
            
        $editBtn.on('click.reui.edititem', function () {
            me.edit(this);
        });

        $delBtn.on('click.reui.edititem', function () {
            me.deleteItem();
        });
    };

    // 方法:编辑文本
    // ------------------------------
    EditItem.prototype.edit = function (element) {
        var me = this,
            $editItem = this.$,
            $editBtn = $(element),
            $editValue = $editItem.find('.js-value'),
            originalText = $editValue.text(),
            $editInput = $(reui.templete.editInput);

        reui.copyMatrix($editValue, $editInput);

        $editInput.on('blur.reui.edititem', function () {
            me.setValue($editValue, this, originalText);
        });

        $editInput.on('keyup.reui.edititem', function (event) {
            if (event.keyCode === 13) {
                me.setValue($editValue, this, originalText);
            }

            if (event.keyCode === 27) {
                $(this).val(originalText);
                me.setValue($editValue, this, originalText);
            }
        });

        $('body').append($editInput);
        $editInput.val(originalText).focus();
    };

    // 方法:更新文本值
    // ------------------------------
    EditItem.prototype.setValue = function ($value,element,originalText) {
        var $editInput = $(element),
            value = $.trim($editInput.val()),
            changeEvent = null,
            noChangeEvent = null;

        //当前值不等于原来的值时，才触发change事件,否则触发nochange事件
        if (value !== originalText && value != '') {
            changeEvent = $.Event('change.reui', { value: value });
            this.$.trigger(changeEvent);

            if (!changeEvent.isDefaultPrevented()) {
                $value.text(value);
            }
        } else {
            noChangeEvent = $.Event('nochange.reui');
            this.$.trigger(noChangeEvent);
        }

        $editInput.remove();
    };

    // 方法:删除可编辑项
    // ------------------------------
    EditItem.prototype.deleteItem = function () {
        var $editItem = this.$,
            deleteEvent = $.Event('delete.reui');

        $editItem.trigger(deleteEvent);

        //显示确认对话框，点确定才删除当前项
        reui.confirm('是否删除该项?', '删除', function () {
            if (deleteEvent.isDefaultPrevented()) return;
            $editItem.remove();
        });
    };

    // 注册成reui模块
    // ------------------------------
    reui.module(EditItem);
}(jQuery);
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:editlist组件
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:EditList组件类
    // ------------------------------
    var EditList = function ($element) {
        this.$ = $element;
    };

    // 定义:EditList组件的类选择器
    // ------------------------------
    EditList.prototype.selector = '.jsx-editlist';

    // 方法:reui调用的入口方法
    // ------------------------------
    EditList.prototype.init = function () {
        var me = this,
            $addBtn = me.$.find('.js-addbtn');

        $addBtn.on('click.reui.editlist', function () {
            me.addItem(this);
        });
    };

    // 方法:添加可编辑项
    // ------------------------------
    EditList.prototype.addItem = function (element) {
        var $editList=this.$,
            $addBtn = $(element),
            $parent = $addBtn.parent(),
            $editItem = $(reui.templete.editItem),
            $editBtn = $editItem.find('.js-editbtn'),
            addEvent = null;

        $editItem.one('change.reui', function (event) {
            addEvent = $.Event('add.reui', { element: this, value: event.value });
            $editList.trigger(addEvent);

            if (addEvent.isDefaultPrevented()) {
                event.preventDefault();
                $(this).remove();
            }

            $editItem.off('nochange.reui');
        });

        $editItem.one('nochange.reui', function () {
            $(this).remove();
        });

        $editItem.insertBefore($parent).reui('init');
        $editBtn.trigger('click.reui.edititem');
    };

    // 注册成reui模块
    // ------------------------------
    reui.module(EditList);
}(jQuery);
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
        //var $tab = this.$,
        //    type=$tab.data('type'),
        //    tabWidth = $tab.outerWidth(),
        //    width = 0,
        //    $oldMore = $tab.find('.js-more'),
        //    $oldMoreLinks = $oldMore.find('div > a'),
        //    $more = $(reui.templete.tabMore),
        //    $moreBody = $more.find('div'),
        //    more = false;

        //// 如果类型是按钮式tab，不生成more菜单
        //if (type == 'button') return;

        //// 删除存在的more
        //$oldMore.remove();
        //$tab.append($oldMoreLinks);

        //var $tabLinks = $tab.find('a');

        //$tabLinks.each(function () {
        //    var $this = $(this);

        //    width += $this.outerWidth();

        //    if (tabWidth- width < 60) {
        //        more = true;
        //        $this.appendTo($moreBody);
        //    }
        //});

        //if ($more.find('a.active').length > 0) {
        //    $more.addClass('active');
        //}

        //if (more) {
        //    $tab.append($more);
        //}
    };

    // 方法:显示more菜单
    // ------------------------------
    Tab.prototype.showMore = function ($moreBtn) {
        //var $more = $moreBtn.parent(),
        //    $moreBody = $more.find('div'),
        //    speed = this.speed();

        //$moreBody.stop().slideToggle(speed);
        //this.hideMore($moreBody);
    };

    // 方法:隐藏more菜单
    // -----------------------------------
    Tab.prototype.hideMore = function ($moreBody) {
        //var me = this;

        //$(document).one('click.reui.tab.more', function (event) {
        //    var $target = $(event.target).parent().find(' > div');

        //    if ($target.is($moreBody)) {
        //        me.hideMore($moreBody);
        //        return;
        //    }

        //    $moreBody.stop().slideUp(speed);
        //});
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
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:window窗体
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Win组件类
    // ------------------------------
    var Win = function ($element) {
        this.$ = $element;
    };

    // 定义:Win组件的类选择器
    // ------------------------------
    Win.prototype.selector = '.jsx-win';

    // 属性:Win组件公用的半透明层
    // ------------------------------
    Win.prototype.dim = $(reui.templete.dim);

    // 方法:reui调用的入口方法
    // ------------------------------
    Win.prototype.init = function () {
        var me = this,
            $me = me.$,
            $header = $me.find('.win-header');

        // 监听拖动事件
        $header.on('mousedown.reui.win', function (event) {
            var origX = event.clientX,
                origY = event.clientY;

            me.drag(this, origX, origY);
        });

        // 监听关闭事件
        $me.on('click.reui.win','.js-win-close', function () {
            me.close();
        });

        // 监听最大化事件
        $me.on('click.reui.win','.js-win-max', function () {
            me.max(this);
        });
    };

    // 属性:记录最后打开弹窗的zindex值
    // ------------------------------
    Win.prototype.zindex = -1;

    // 属性:记录打开的窗体数量
    // ------------------------------
    Win.prototype.openedWins=0;

    // 方法:打开窗体
    // ------------------------------
    Win.prototype.open = function (nodim) {
        var speed = this.speed(),
            $me = this.$,
            showEvent = $.Event('show.reui.win'),
            shownEvent = $.Event('shown.reui.win');

        if ($me.is(':visible')) return;

        $me.trigger(showEvent);

        if (showEvent.isDefaultPrevented()) return;

        if (Win.prototype.zindex == -1) {
            Win.prototype.zindex = parseInt($me.css('z-index'));
        } else {
            Win.prototype.zindex += 2;
        }

        this.dim.css('z-index', this.zindex - 1);
        $me.css('z-index', this.zindex);

        // 修正打开的窗体数量初始值
        if (Win.prototype.openedWins < 0) Win.prototype.openedWins = 0;

        if (nodim != true) {
            Win.prototype.openedWins++;
        } else {
            $me.data('nodim', true);
        }

        if (Win.prototype.openedWins == 1) {
            $('body').append(this.dim).addClass('f-oh');
        }

        $me.fadeIn(speed, function () {
            $me.trigger(shownEvent);
        });

        this.center();
    };

    // 方法:关闭窗体
    // ------------------------------
    Win.prototype.close = function () {
        var $me = this.$;

        if ($me.is(':hidden')) return;

        var hideEvent = $.Event('hide.reui.win');
        $me.trigger(hideEvent);

        if (hideEvent.isDefaultPrevented()) return;

        var speed = this.speed();
        var hiddenEvent = $.Event('hidden.reui.win');

        $me.fadeOut(speed, function () {
            $me.trigger(hiddenEvent);
        });

        if (Win.prototype.zindex == -1) {
            Win.prototype.zindex = parseInt($me.css('z-index'));
        } else {
            Win.prototype.zindex -= 2;
        }

        var nodim = $me.data('nodim');
        if (nodim != true) Win.prototype.openedWins--;

        this.dim.css('z-index', this.zindex - 1);

        if (Win.prototype.openedWins == 0) {
            this.dim.remove();
            $('body').removeClass('f-oh');
        }
    };

    // 方法:最大化
    // ------------------------------
    Win.prototype.max = function (element) {
        var $me = this.$,
            $btn = $(element),
            maxEvent = $.Event('max.reui.win'),
            minEvent = $.Event('min.reui.win');

        if ($me.hasClass('max')) {
            $me.trigger(minEvent);

            if (minEvent.isDefaultPrevented()) return;

            $me.removeClass('max');
            $btn.attr('title', '最大化');
            $me.removeAttr('data-move').data('move', true);
        } else {
            $me.trigger(maxEvent);

            if (maxEvent.isDefaultPrevented()) return;

            $me.addClass('max');
            $btn.attr('title', '恢复');
            $me.attr('data-move', 'false').data('move', false);
        }
    };

    // 方法:拖动窗体
    // ------------------------------
    Win.prototype.drag = function (element,origX,origY) {
        var me = this,
            $win = me.$,
            $header = $(element),
            noMove = $win.data('move') === false,
            originalTop = $win.position().top,
            originalLeft = $win.position().left;

        // 禁止拖动
        if (noMove) {
            $win.addClass('nodrag');
            return;
        } else {
            $win.removeClass('nodrag');
        }

        // 拖动窗体
        $(document).on('mousemove.reui.win', function (event) {
            var differenceX = event.clientX - origX,
                differenceY = event.clientY - origY,
                currentTop = 0,
                currentLeft = 0;

            if (differenceX || differenceY) {
                currentTop = originalTop + differenceY;
                currentLeft = originalLeft + differenceX;

                me.move(currentLeft, currentTop);
            }
        });

        // 取消拖动
        $(document).one('mouseup.reui.win', function () {
            $(document).off('mousemove.reui.win');
        });
    };

    // 方法:移动窗体
    // ------------------------------
    Win.prototype.move = function (x,y) {
        this.$.css({ left: x, top: y });
    };

    // 方法:居中
    // ------------------------------
    Win.prototype.center = function () {

        // 如果已移动过，不再启用居中
        //if (this.moved) return;

        reui.center($(window), this.$, true);
    };

    // 方法:浏览器resize时重新居中
    // ------------------------------
    $(window).on('lazyResize.reui.win', function () {
        $('.jsx-win:visible').reui('center', '.jsx-win');
    });

    // 注册成reui模块
    // ------------------------------
    reui.module(Win);
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:打开窗体
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:OpenWin组件类
    // ------------------------------
    var OpenWin = function ($element) {
        this.$ = $element;
    };

    // 定义:OpenWin组件的类选择器
    // ------------------------------
    OpenWin.prototype.selector = '.jsx-openwin';

    // 定义:打开关联的窗体
    // ------------------------------
    OpenWin.prototype.open = function () {
        var $me = this.$,
            $target = $($me.data('target'));

        $target.reui('open', '.jsx-win');
    };

    // 方法:在document上监听组件的click事件
    // ------------------------------
    $(document).on('click.reui.openwin', '.jsx-openwin', function () {
        $(this).reui('open', '.jsx-openwin');
    });

    // 注册成reui模块
    // ------------------------------
    reui.module(OpenWin);
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:reui公用方法-信息提示,及快捷方法
 * ------------------------------------------------------------ */
+function ($) {
    reui.win = function (opts) {
        var option = $.extend({}, reui.config.win, opts);
        var time = parseInt(option.time);
        var dim = false;

        if (option.type == 'msg') {
            var $win = $(reui.templete.msgWin);
            var $winContent = $win.find('div');
            dim = true;
            $win.data('nodim', dim);
        } else {
            var $win = $(reui.templete.win);
            var $winBody = $win.find('.win-body');
            var $winContent = $winBody.find('div');

            // 如果存在标题，才添加header
            var $winHeader = $();

            if (option.title) {
                $winHeader = $(reui.templete.winHeader);
                var $headerBody = $winHeader.find('h4');
                $headerBody.html(option.title);

                if (option.max === true) {
                    $headerBody.before($(reui.templete.winMax));
                }

                $win.prepend($winHeader);
            }

            // 如果存在按钮，才添加footer
            var $winFooter = $();

            try {
                var btns = option.btns;

                if (btns instanceof Array && btns.length > 0) {
                    var $btns = $btn = $();

                    for (var i = 0; i < btns.length; i++) {
                        $btn = $(btns[i].html);

                        if (!(btns[i].closeWin === false)) {
                            $btn.addClass('js-win-close');
                        }

                        if (typeof btns[i].callback == 'function') $btn.on('click.reui.win', btns[i].callback);
                        $btns = $btns.add($btn);
                    }

                    $winFooter = $(reui.templete.winFooter).append($btns);
                    $win.append($winFooter);
                }
            } catch (e) {
                throw Error('生成窗体按钮时发生错误，请检查给定窗体按钮的option格式是否正确。')
            }

            // 如果存在图标，添加图标
            if (typeof option.icon == 'string') {
                $winBody.prepend($(option.icon).addClass('win-ico'));
            }

            // 当header与footer都不存在时，说明其是一个mini版窗体
            if ($winHeader.length == 0 && $winFooter.length == 0) {
                $win.addClass('mini');
                if (isNaN(time)) time = parseInt(option.miniTime);
            }
        }

        // 注册hide事件
        if (typeof option.hide === 'function') {
            $win.on('hide.reui.win', option.hide);
        }

        // 关闭时删除自身
        $win.on('hidden.reui.win', function () {
            $win.remove();
        });

        $winContent.html(option.content);
        $('body').append($win);
        $win.reui('open', '.jsx-win', dim);

        // 自动关闭
        if (!isNaN(time) && time != 0) {
            setTimeout(function () {
                $win.reui('close');
            }, time);
        }

        return $win;
    };

    // 函数：生成窗体函数
    var wins = reui.config.wins;
    for (var winType in wins) {
        reui[winType] = function (type) {
            return function (content, unsure, cb1, cb2, cb3) {
                var option = null;

                if (typeof content != 'string') content = '';

                option = {
                    content: content,
                    type: type,
                    btns: []
                };

                var funIndex = 2;
                if (typeof unsure == 'function') {
                    funIndex = 1;
                } else if (typeof unsure == 'string') {
                    option.title = unsure;
                } else if (typeof unsure == 'number') {
                    option.time = unsure;
                }

                var configOption = reui.config.wins[type];
                var btns = configOption.btns ? configOption.btns : [];
                var btnIndex = -1;

                for (var i = funIndex; i < arguments.length; i++) {
                    btnIndex++;
                    if (btnIndex < btns.length) {
                        option.btns[btnIndex] = {};
                        if (typeof arguments[i] == 'function') {
                            option.btns[btnIndex].callback = arguments[i];
                        }
                    } else {
                        if (typeof arguments[i] == 'function') {
                            option.hide = arguments[i];
                        }
                        break;
                    }
                }

                option = $.extend(true, {}, configOption, option);
                return reui.win(option);
            };
        }(winType);
    }
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:普通的脚本
 * ------------------------------------------------------------ */
var webui = {
    //计算时间日期选择器的位置
    getDatePickerPosition: function ($picker) {
        var top = $picker.offset().top,
            windownHeight = $(window).height();

        if (windownHeight - top < 300) {
            return 'top-left';
        } else {
            return 'bottom-left';
        }
    },
    //激活日期选择器
    initDatePicker: function ($datePicker) {
        $datePicker.on('click.datepicker', function () {
            var position = webui.getDatePickerPosition($(this));

            $(this).datetimepicker('remove');
            $(this).datetimepicker({
                language: 'zh-CN',
                weekStart: 1,
                format: "yyyy-mm-dd",
                pickerPosition: position,
                minView: "month",
                autoclose: 1,
                todayHighlight: 1
            });
            $(this).datetimepicker('show');
        });
    },
    //激活月份选择器
    initMonthPicker: function ($monthPicker) {
        $monthPicker.on('click.monthpicker', function () {
            var position = webui.getDatePickerPosition($(this));

            $(this).datetimepicker('remove');
            $(this).datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm',
                todayBtn: 1,
                autoclose: 1,
                pickerPosition: position,
                startView: 3,
                minView: 3
            });
            $(this).datetimepicker('show');
        });
    },
    //激活年份选择器
    initYearPicker: function ($yearPicker) {
        $yearPicker.on('click.yearpicker', function () {
            var position = webui.getDatePickerPosition($(this));

            $(this).datetimepicker('remove');
            $(this).datetimepicker({
                language: 'zh-CN',
                format: 'yyyy',
                todayBtn: 1,
                autoclose: 1,
                pickerPosition: position,
                startView: 4,
                minView: 4
            });
            $(this).datetimepicker('show');
        });
    },
    //初始化侧边按钮
    initAffix: function ($affix) {
        var right = ($(window).width() - $('.g-body').width()) / 2;
        $affix.css('right', right);
    },
    //函数:初始化所有控件
    init: function () {
        var $datePicker = $('.js-datepicker'),
            $monthPicker = $('.js-monthpicker'),
            $yearPicker = $('.js-yearpicker'),
            $affix = $('.m-affix');

        if ($datePicker.length > 0) {
            webui.initDatePicker($datePicker);
        }

        if ($yearPicker.length > 0) {
            webui.initYearPicker($yearPicker);
        }

        if ($monthPicker.length > 0) {
            webui.initMonthPicker($monthPicker);
        }

        if ($affix.length > 0) {
            webui.initAffix($affix);

            $(window).off('lazyResize.reui').on('lazyResize.reui', function () {
                webui.initAffix($affix);
            });
        }
    }
}


$(document).ready(function () {
    webui.init();

    // 激活tooltip
    $("[data-toggle='tooltip']").tooltip();
});