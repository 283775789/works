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