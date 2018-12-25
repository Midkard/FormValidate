/*
 * Validate plugin
 * version: 1.1.0
*/
(function ($) {
    "use strict";
    /**
     * Функция Validate Для Jquery. Именно она вызывается при надписи типа $('form').validate();
     * this указывает на коллекцию элементов
     * 
     */
    $.fn.validate = function () {
        // Если коллекция пуста, то заканчиваем сразу
        if (!this.length) {
            return;
        }

        //Здесь проходим по каждому элементу коллекции
        this.each(function () {
            // Проверяем не создавали ли валидатор для этого элемента. Если да, то выходим.
            var validator = $(this).data("validator");
            if (validator) {
                return;
            }
            
            // Add novalidate tag if HTML5.
//            this.attr("novalidate", "novalidate");

            // Adding mask
            $(this).find(".inp").mask("+7 (999) 999-99-99", {
                completed: function(){
                    $(this).trigger('completed');
                }
            });
            // Скрытие открытие textarea
            $(this).find('span.add-textarea').click( function(){
                $(this).toggleClass('opened');
            });

            //Если не создана всплывашка для соглашения на обработку, то тутт ее создаем. Она одна на все формы
            if (!popup) {
                popup = new Popup();
            }
            ;

            //Создаем валидатор для этой формы. Запихиваем его в data. Чтобы потом достать, если понадобится
            // например для проверки, есть ли он у элемента.
            validator = new Validator(this);
            $(this).data("validator", validator);
        });
        return this;
    };
    

    /**
     * Здесь расположены регулярные выражения для тестирования. rule и numeric вспомогательные(менять не желательно).
     * Остальные можно менять.
     */
    var ruleRegex = /^(.+?)\[(.+)\]$/
            , numericRegex = /^[0-9]+$/
            , emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
            , alphaRegex = /^[а-яё ]*$/i
            , phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
            ;
           
    /**
     * Это сообщения в случае ошибки(для alpha используется как подсказка). Их можно менять.
     * Ключ соответствует названию функции в Field._hooks
     */
    var messages = {
        required: "Пожалуйста, заполните поле."
        , valid_email: "Введите корректный email."
        , valid_phone: "Введите корректный номер телефона."
        , alpha: 'Это поле может содержать только буквы русского алфавита.'
        , min_length: 'Поле должно содержать не менее %s символов.'

    };
    
    /**
     * Это просто css селекторы и какие правила применять
     * Можно менять, можно добавлять. Правилом может быть одна из функций в Field._hooks. 
     * Параметры в квадратных скобках, если есть.
     * @type Array
     */
    var defaultRules = [
        {
            el: '.required'
            , rule: 'required'
        }
        , {
            el: '.inp'
            , rule: 'valid_phone'
        }
        , {
            el: '[name="name1"]'
            , rule: 'alpha|min_length[2]'
        }
        , {
            el: '[name="email1"]'
            , rule: 'valid_email'
        }
        , {
            el: '.agreement'
            , rule: 'agreement'
        }
    ];

    /*
	 * Это html всплывашки для соглашения. Можно менять.
    */
    var popupRender =
            "<div id=\"modal-not-agreement\">\
                    <div class=\"icon\">\
                            <svg viewBox=\"0 0 22 22\"><path d=\"M.35.35,21.82,21.82\"/><path d=\"M21.82.35.35,21.82\"/></svg>\
                    </div>\
                    <h2>Внимание!</h2>\
                    <p>Вы не согласились с нашей <a href=\"#\" >политикой конфиденциальности</a>. По Закону, мы не имеем права получать ваши контакты.</p>\
                    <div class=\"button\">\
                            <button class=\"confirm btn\">Согласиться с политикой</button>\
                    </div>\
            </div>";
    var overlayRender = '<div id="modal-not-agreement__overlay"></div>';

    /**
     * Validator Class. Валидатор для формы. Один на всю форму.
     * @param {nodeElement} form
     * 
     */
    var Validator = function (form) {
        this.form = form;
        this.allRules = defaultRules;
        this.buttons = [];
        this.fields = [];

        /*
         * Проходим по каждому элементу формы
         */        
        for (var i = 0; i < form.elements.length; i++) {
        	//кнопки добавляем в this.buttons
            if (form.elements[i].type === 'submit') {
                this.buttons.push(form.elements[i]);
                continue;
            }
            //пробуем составить правила для элемента
            var $elem = $(form.elements[i])
                    , fieldRules = this._genElemRules($elem)
                    ;
            // если удалось найти подходящие правила, то создаем объект Field и пихаем его в this.fields
            if (fieldRules.length) {
                this.fields.push(new Field($elem, fieldRules.join('|'), this));
            } else {
                this.fields.push(new Field($elem, null, this));
            }
        }
        
        //Устанавливаем первоначальное значение кнопок(отключены\включены)
        this._checkButtons();
        
        //Добавляем обработчик события(submit)
        $(form).submit($.proxy(this, '_validateForm'));
//        console.dir(this);

    };

    // Добавляем статические функции для Validator
    $.extend(Validator.prototype, {

        /**
         * Генерируем правила для элемента. Пробегаем по каждому правилу из defaultRules, если элемент удовлетворяет
         * css селектору, то добавляем правило в итоговый массив.
         * @param {$element} $field
         * @returns {Array}
         */
        _genElemRules: function ($field) {
            var rules = {},
                    arrRules = [];

            for (var i = 0; i < this.allRules.length; i++) {
                if ($field.is(this.allRules[i].el)) {
                    rules[this.allRules[i].rule] = true;
                }
            }
            ;

            for (var key in rules) {
                arrRules.push(key);
            }

            return arrRules;
        }

        /**
         * Валидация формы. Просто опрашиваем каждый Field из this.fields, если хотя бы одни не валиден,
         * то и вся форма не отправляется
         * @param {Event} evt
         * @returns {Boolean}
         */
        , _validateForm: function (evt) {
            var error = false;


            for (var i = 0; i < this.fields.length; i++) {

                var field = this.fields[i];
                if (!field._validate()) {
                    error = true;
                }
                ;

            }

            if (error) {
                if (evt && evt.preventDefault) {
                    evt.preventDefault();
                } else if (event) {
                    // IE uses the global event variable
                    event.returnValue = false;
                }
            }
            return true;
        }

        /**
         * Disable/enable buttons
         * Делает почти то же самое, что и _validateForm, только от результата зависит состояние кнопок.
         * Не заставляет поля перепроверять себя, использует переменную valid у Field.
         */
        , _checkButtons: function () {
            var error = false;

            for (var i = 0; i < this.fields.length; i++) {

                var field = this.fields[i];
                if (!field.valid) {
                    error = true;
                };                

            }

            var state = false;
            if (error) {
                state = true;
            }

            for (var i = 0; i < this.buttons.length; i++) {
                this.buttons[i].disabled = state;
            }

        }

    });


    /**
     * Field Class
     * Объект класса Field создается для каждого элемента, для которого нашлись правила.
     * @param {$element} elem
     * @param {String} rules
     * @param {Validator} parent
     * @returns {validateL#2.Field}
     */
    var Field = function (elem, rules, parent) {
        this.elem = elem;
        this.rules = rules;
        this.value = null;
        this.oldValue = '';
        
        if (this.rules) {
            this.erElem = null;
            this.tipElem = null;        
            this.required = rules.indexOf('required') !== -1;
            this.filterInput = rules.indexOf('alpha') !== -1;
        }
        
        this.$placeholder = null;
        if ($(this.elem).siblings('label').length){
            this.$placeholder = $(this.elem).siblings('label');
        }
        //состояние. При изменении вызыввает _checkButtons у родительского Validator
        var _valid = true;
        Object.defineProperty(this, "valid", {
            get: function () {
                return _valid;
            },
            set: function (value) {
                // if validity changed then check buttons
                if (value !== _valid) {
                    _valid = value;
                    parent._checkButtons();
                }
            }
        });
        
        //Первоначальная проверка, без отображения ошибок.
        this._validate(true);

        //Привязываем обработчики к собятиям элемента
        var field = this;
        if (this.rules) {
            elem.on('blur change completed', function () {
                field._validate();
            });
            elem.on('input keypress keydown paste', function () {
                field._validate(true);
            });
        }
        //Если есть правило alpha, то нужно показать подсказку и фильтровать нажатия клавиш
        if (this.filterInput) {
            elem.on('input', function () {
                field._testInput();
            });
            elem.on('focusout', function() {
                field._tip(true);
            });
        }
        //Если есть placeholder
        if (this.$placeholder) {
            elem.on('focusin', function() {
                field._placeholder();
            });
            elem.on('focusout', function() {
                field._placeholder(true);
            });
        }


    };

    // Добавляем статические функции для Field
    $.extend(Field.prototype, {

        /*
         * Главная функция. Проверяет валиден ли элемент.
         */

        _validate: function (silent) {

            silent = silent || false;
            if (!this.rules) { 
                return true;
            }
            //Если мы уже тестировали текущее значение, в других евентах, то выходим
            if (this.value === this.elem.val() && silent) {
            	return;
            }

            var i, ruleLength
                    , rules = this.rules.split('|')
                    , isEmpty = (!this.elem.val())
                    , errors = []
                    ;


            this.value = this.elem.val();

            /*
             * Пробегаем по каждому правилу для данного элемента
             */

            for (i = 0, ruleLength = rules.length; i < ruleLength; i++) {
                var method = rules[i],
                        param = null,
                        failed = false,
                        parts = ruleRegex.exec(method);

                /*
                 * If this field is not required and the value is empty, break.
                 * For empty field value check only required and agreemen rule.
                 */

                if (isEmpty && ! this.required) {
                    break;
                }

                if (isEmpty && ['required', 'agreement'].indexOf(method) === -1) {
                    continue;
                }

                /*
                 * If the rule has a parameter (i.e. matches[param]) split it out
                 */

                if (parts) {
                    method = parts[1];
                    param = parts[2];
                }

                if (method.charAt(0) === '!') {
                    method = method.substring(1, method.length);
                }

                /*
                 * If the hook is defined, run it to find any validation errors
                 */

                if (typeof this._hooks[method] === 'function') {
                    if (!this._hooks[method].apply(this, [param])) {
                        failed = true;
                    }
                }

                /*
                 * If the hook failed, add a message to the errors array
                 */

                if (failed) {

                    var message = messages[method];

                    if (param) {
                        message = message.replace('%s', param);
                    }
                    errors.push(message);

                }
            }

            //Показываем, убираем ошибки
            if (errors.length) {
                if (!silent) {
                    this._setError(errors);
                }
                this.valid = false;
            } else {
                // if (!silent) {
                    this._removeError();
                // }
                this.valid = true;
            }
            return this.valid;
        }

        /**
         * Filter keyboard input
         */
        , _testInput: function () {

            this.value = this.elem.val();
            if (!this._hooks.alpha.apply(this)) {
                this.elem.val(this.oldValue);
                //подсказка
                this._tip();
            } else {
            	this.oldValue = this.value;
                //убираем подсказку
                this._tip(true);
            }

        }
        
        /*
         * AddTip
         */
        , _tip: function (remove) {
            // Для alpha              
            remove = remove || false;

            var tip = messages['alpha'];

            if (!remove) {
                if (!this.tipElem) {
                    this.tipElem = $('<span class="message-tooltip">' + tip + '</span>').
                            insertAfter(this.elem);
                }

            } else if (this.tipElem) {
                this.tipElem.remove();
                this.tipElem = null;
            }
        }
        /*
         * Add, remove placeholder
         */
        , _placeholder: function(remove) {
            var isEmpty = (!this.elem.val());              
            remove = remove || false;
            
            //Изменяем класс соседнего label
            if (remove) {
                if (!isEmpty) {
                    this.$placeholder.addClass('label-none');
                }
            } else {
                this.$placeholder.removeClass('label-none');
            }

        }
        /**
         * Add span with error message after element
         * @param {Array} errors
         */
        , _setError: function (errors) {
            if (this.erElem) {
                this.erElem.html(errors.join(' '));
            } else {
                if (this.rules.indexOf('agreement') === -1) {
                    this.erElem = $('<span class="message-error">' + errors.join(' ') + '</span>').
                            insertAfter(this.elem);
                }
            }

            this.elem.addClass('error');
            this.elem.removeClass('correctly');
        }

        /**
         * Remove span with error message
         */
        , _removeError: function () {
            if (this.erElem) {
                this.erElem.remove();
                this.erElem = null;

                this.elem.addClass('correctly');
                this.elem.removeClass('error');
            }
        }

        /**
         * Функции, которые можно вызвать для тестирования содержимого поля.
         */
        , _hooks: {
            required: function () {
                var type = this.elem[0].type;
                if ((type === 'checkbox') || (type === 'radio')) {
                    return (this.elem[0].checked === true);
                }

                return (!!this.value);
            }

            , valid_email: function () {
                return emailRegex.test(this.value);
            }

            , valid_phone: function () {
                return phoneRegex.test(this.value);
            }

            , min_length: function (length) {
                if (!numericRegex.test(length)) {
                    return false;
                }

                return (this.value.length >= parseInt(length, 10));
            }

            , alpha: function () {
                return (alphaRegex.test(this.value));
            }

            , agreement: function () {
                var type = this.elem[0].type;
                if ((type === 'checkbox') || (type === 'radio')) {
                    var res = (this.elem[0].checked === true);
                    if (!res) {
                        popup.show(this.elem);
                    }
                    ;
                    return res;
                }

                return (!!this.value);
            }

        }

    });

	//ВСПЛЫВАШКА
    // Variable to store popup object
    var popup;

    /**
     * Popup Class
     * @returns {validateL#2.Popup}
     */
    var Popup = function () {
        this.popup = $(popupRender).appendTo('body');
        this.overlay = $(overlayRender).appendTo('body');
        this.checkbox = null;
        var that = this;
        this.popup.find('.confirm').click(function () {
            that.checkbox.prop('checked', true);
            that.checkbox.change();
            that.hide();
        });
    };

    $.extend(Popup.prototype, {
        show: function (checkbox) {
            this.checkbox = checkbox;
            this.overlay.fadeIn();
            this.popup.fadeIn();
        }

        , hide: function () {
            this.overlay.fadeOut();
            this.popup.fadeOut();
        }
    });
})(jQuery);