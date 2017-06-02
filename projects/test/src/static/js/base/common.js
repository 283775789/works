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
    reui.invalid = function (errorMsg,$ctr,time) {
        var $invalid = $(' <div class="c-invalid">错误提示</div>');
        var time = parseInt(time);

        if ($ctr instanceof jQuery) {
            var left = $ctr.offset().left;
            var top = $ctr.offset().top - $ctr.outerHeight();
            var width = $ctr.outerWidth();
            $ctr.addClass('xerror').focus();
        }

        $invalid.css({
            left: left,
            top: top,
            width:width
        });

        if (isNaN(time))  time= 1000;

        $('body').append($invalid);
        $invalid.fadeIn();

        setTimeout(function () {
            $invalid.fadeOut(function () {
                $(this).remove();
            });
        },time)
    };
}(jQuery);
