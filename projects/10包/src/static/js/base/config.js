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