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
