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
        var right = ($(window).width() - $('.g-body').width()) / 2-10;
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