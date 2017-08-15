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
    //初始化升缩文本的展开与收起
    initRsText: function ($rsTexts) {
        $rsTexts.each(function () {
            var rstext = '',
                dataparam = '',
                charnum = 200,
                subStr = '',
                textLength = 0,
                $riseSwitch = null,
                $shrinkSwitch = null,
                $temp = $('<div></div>'),
                riseSwitchHtml = '<span class="u-rstext-switch" data-as="rstext-riseswitch">展开<span>︾</span></span>',
                shrinkSwitchHtml = '<span class="u-rstext-switch" data-as="rstext-shrinkswitch">收起<span>︽</span></span>';

            $riseSwitch = $(this).find('[data-as="rstext-riseswitch"]');
            $shrinkSwitch = $(this).find('[data-as="rstext-shrinkswitch"]');

            //如果存在自定义的展开开关，获取其对应的html
            if ($riseSwitch.length > 0) {
                $temp.append($riseSwitch);
                riseSwitchHtml = $temp.html();
            }

            //如果存在自定义的关闭开关，获取其对应的html
            if ($shrinkSwitch.length > 0) {
                $temp = $('<div></div>');
                $temp.append($shrinkSwitch);
                shrinkSwitchHtml = $temp.html();
            }

            rstext = $(this).html();
            textLength = rstext.length;
            dataparam = $(this).data('param');

            //如果指定了限制字符数且指定的字符数能转换为整数就用指定的字符数作限制字符数，否则默认最多显示200个字符
            if (typeof dataparam != "undefined") {
                charnum = isNaN(parseInt(dataparam)) ? 200 : parseInt(dataparam);
            }

            //仅当文本字符数大于限制字符个数时，才显示切换开关
            if (textLength > charnum) {
                subStr = rstext.substring(0, charnum);
                $(this).html(subStr + '...' + riseSwitchHtml);
            }

            //单击展开开关:显示全部文字
            $(this).on('click', '[data-as="rstext-riseswitch"]', function () {
                var $rstext = $(this).parent();
                $rstext.html(rstext + shrinkSwitchHtml);
            });

            //单击收起开关:截断部份文字
            $(this).on('click', '[data-as="rstext-shrinkswitch"]', function () {
                var $rstext = $(this).parent();
                subStr = rstext.substring(0, charnum);
                $rstext.html(subStr + '...' + riseSwitchHtml);
            });
        });
    },
    //函数:初始化所有控件
    init: function () {
        var $datePicker = $('.js-datepicker'),
            $monthPicker = $('.js-monthpicker'),
            $yearPicker = $('.js-yearpicker'),
            $affix = $('.m-affix'),
            $rsTexts = $('[data-as="rstext"]');

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

        if ($rsTexts.length > 0) {
            webui.initRsText($rsTexts);
        }
    }
}


$(document).ready(function () {
    webui.init();

    // 激活tooltip
    $("[data-toggle='tooltip']").tooltip();
});