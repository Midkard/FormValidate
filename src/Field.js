import $ from 'jquery';
import getPopup from './Popup';
import intlTelInput from 'intl-tel-input';

/**
 * Field Class
 * Объект класса Field создается для каждого элемента, для которого нашлись правила.
 */
class Field {
    /**
     * 
     * @param {JQuery<HTMLInputElement>} elem 
     * @param {string} rules 
     * @param {Validator} parent 
     */
    constructor(elem, rules, parent) {
        this.elem = elem;
        this.rules = rules;
        this.validator = parent;
        this.opts = parent.opts;
        this.value = null;
        this.oldValue = '';

        if (this.rules) {
            this.erElem = null;
            this.tipElem = null;
            this.required = rules.indexOf('required') !== -1;
        }

        this.$placeholder = null;
        if ($(this.elem).siblings('label').length) {
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
                    this.validator._checkButtons();
                }
            }
        });

        //Привязываем обработчики к событиям элемента
        var field = this;
        if (this.rules) {
            elem.on('change completed', function () {
                field._validate();
            });
            if (this.opts.validateOnBlur) {
                elem.on('blur', function () {
                    field._validate();
                });
            }
            elem.on('input keypress keydown paste', function () {
                field._validate(true);
            });
        }
        //Если есть правило alpha, то нужно показать подсказку и фильтровать нажатия клавиш
        if (rules && ~rules.indexOf('alpha')) {
            elem.on('input', function () {
                field._testInput();
            });
            elem.on('focusout', function () {
                field._tip(true);
            });
        }
        if (rules && ~rules.indexOf('valid_phone')) {
            field._transformToPhone();
            elem.on('input', function () {
                field._transformToPhone();
            });
        }
        if (rules && ~rules.indexOf('valid_international')) {
            field.iti = intlTelInput(elem[0], {
                nationalMode: false,
                formatOnDisplay: true,
                preferredCountries: [],
                initialCountry: "auto",
                geoIpLookup: function (success) {
                    $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
                        const countryCode = resp?.country ? resp.country : "ru";
                        success(countryCode);
                    });
                },
                utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.min.js',
            });
            elem.on('input', function () {
                field._transformToInternational();
            });

            elem.on('countrychange', function () {
                field._validate(true);
            });
        }

        //Первоначальная проверка, без отображения ошибок.
        this._validate(true);

        //Если есть placeholder
        if (this.$placeholder) {
            field._placeholder();
            elem.on('focusin input', function () {
                field._placeholder('focusin');
            });
            elem.on('focusout', function () {
                field._placeholder('focusout');
            });
        }


    }

    /*
     * Главная функция. Проверяет валиден ли элемент.
     */
    _validate(silent) {

        silent = silent || false;
        if (!this.rules) {
            return true;
        }
        //валидация приостановлена
        if (this.elem.attr('data-validation') === 'stopvalidation') {
            this.valid = true;
            this.value = null;
            this._removeError();
            return true;
        }

        //Если мы уже тестировали текущее значение, в других евентах, то выходим
        if (silent && this.value === (this.elem[0].type === 'file' ? this.elem[0].files : this.elem.val())) {
            return;
        }

        var i, ruleLength
            , rules = this.rules.split('|')
            , isEmpty = (!this.elem.val())
            , errors = []
            ;


        this.value = this.elem[0].type === 'file' ? this.elem[0].files : this.elem.val();

        /*
         * Пробегаем по каждому правилу для данного элемента
         */

        for (i = 0, ruleLength = rules.length; i < ruleLength; i++) {
            var method = rules[i],
                param = null,
                failed = false,
                parts = this.opts.ruleRegex.exec(method);

            /*
             * If this field is not required and the value is empty, break.
             * For empty field value check only required and agreemen rule.
             */

            if (isEmpty && !this.required) {
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

                var message = this.elem.data(method);
                if (!message) {
                    message = this.opts.messages[method];
                }

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
            this.elem.attr('data-validation', 'invalid');
        } else {
            // if (!silent) {
            this._removeError();
            // }
            this.valid = true;
            this.elem.attr('data-validation', 'valid');
        }
        return this.valid;
    }

    /**
     * Filter keyboard input
     */
    _testInput() {
        //валидация приостановлена
        if (this.elem.attr('data-validation') === 'stopvalidation') {
            //убираем подсказку
            this._tip(true);
            return;
        }

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
    _tip(remove) {
        // Для alpha              
        remove = remove || false;

        var tip = this.opts.messages['alpha'];

        if (!remove) {
            if (!this.tipElem) {
                this.tipElem = $('<span class="message-tooltip">' + tip + '</span>').insertAfter(this.elem);
            }

        } else if (this.tipElem) {
            this.tipElem.remove();
            this.tipElem = null;
        }
    }

    /**
     * Filter keyboard input
     */
    _transformToPhone() {

        let value = this.elem.val();
        if (!value) {
            return;
        }

        value = value.replace(/\D/g, '');
        if (!value.length) {
            this.elem.val('');
            return;
        }

        const newValue = formatNumber(regexpToFormat(this.opts.phoneRegex.source), value);

        this.elem.val(newValue);

        this._validate(true);
    }
    /**
     * Filter keyboard input
     */
    _transformToInternational() {

        if (typeof intlTelInputUtils !== 'undefined') { // utils are lazy loaded, so must check
            var currentText = this.iti.getNumber(intlTelInputUtils.numberFormat.E164);
            if (typeof currentText === 'string') { // sometimes the currentText is an object :)
                this.iti.setNumber(currentText); // will autoformat because of formatOnDisplay=true
            }
        }
        this._validate(true);
    }

    /*
     * Add, remove placeholder
     */
    _placeholder(state) {
        var isEmpty = (!this.elem.val());
        state = state || 'focusout';

        //Изменяем класс соседнего label
        if (!this.opts.hideLabels) {
            return;
        }
        if ('focusout' === state) {
            if (isEmpty) {
                this.$placeholder.removeClass('label-none');
            } else {
                this.$placeholder.addClass('label-none');
            }
        } else {
            this.$placeholder.addClass('label-none');
        }

    }
    /**
     * Add span with error message after element
     * @param {Array} errors
     */
    _setError(errors) {
        if (this.erElem) {
            this.erElem.html(errors.join(' '));
        } else {
            if (this.rules.indexOf('agreement') === -1) {
                this.erElem = $('<span class="message-error">' + errors.join(' ') + '</span>').insertAfter(this.elem);
            }
        }

        this.elem.addClass('error');
        this.elem.removeClass('correctly');
    }

    /**
     * Remove span with error message
     */
    _removeError() {
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
    _hooks = {
        required: function () {
            var type = this.elem[0].type;
            if ((type === 'checkbox') || (type === 'radio')) {
                return (this.elem[0].checked === true);
            }

            return (!!this.value);
        }

        , valid_email: function () {
            return this.opts.emailRegex.test(this.value);
        }

        , valid_phone: function () {
            return this.opts.phoneRegex.test(this.value);
        }

        , valid_international: function () {
            if (this.iti) {
                return this.iti.isValidNumber();
            }
            return true;
        }

        , min_length: function (length) {
            if (!this.opts.numericRegex.test(length)) {
                return false;
            }

            return (this.value.length >= parseInt(length, 10));
        }

        , alpha: function () {
            return (this.opts.alphaRegex.test(this.value));
        }

        , agreement: function () {
            var type = this.elem[0].type;
            if ((type === 'checkbox') || (type === 'radio')) {
                var res = (this.elem[0].checked === true);
                if (!res) {
                    getPopup(this.opts).show(this.elem);
                }
                return res;
            }

            return (!!this.value);
        }

        , extension: function () {
            let extensions;
            if (this.elem.data('validationExt')) {
                extensions = this.elem.data('validationExt').split(',').map(function (el) {
                    return el.trim();
                });
            } else {
                return true;
            }
            for (let i = 0; i < this.value.length; i++) {
                let extension = this.value[i].name.slice(this.value[i].name.lastIndexOf('.') + 1);
                if (!~extensions.indexOf(extension)) {
                    return false;
                }
            }
            return true;
        }

        , max_size: function () {
            console.log(this.value);
            let max_size;
            if (this.elem.data('validationMaxSizeMb')) {
                max_size = parseFloat(this.elem.data('validationMaxSizeMb'));
                if (isNaN(max_size) || !isFinite(max_size)) {
                    return true;
                }
                max_size = max_size * 1024 * 1024;
            } else {
                return true;
            }
            let size = 0;
            for (let i = 0; i < this.value.length; i++) {
                size += this.value[i].size;
                console.log(size);
                if (size > max_size) {
                    return false;
                }
            }
            return true;
        }

    }
}

// Добавляем статические функции для Field
$.extend(Field.prototype, {



});

export default Field;

function formatNumber(mask, number) {
    const fixed = mask.replace(/\D/g, '')
    if (number.length >= fixed.length && fixed === number.slice(0, fixed.length)) {
        number = number.slice(fixed.length)
    }
    let s = '' + number, r = '';
    for (let im = 0, is = 0; im < mask.length && is < s.length; im++) {
        r += mask.charAt(im) === 'X' ? s.charAt(is++) : mask.charAt(im);
    }
    return r;
}

function regexpToFormat(regexp) {
    return regexp
        .replaceAll("\\", '')
        .replace("^", '')
        .replace("$", '')
        .replace(/d{(\d+)}/g, function (str, number) {
            return 'X'.repeat(+number)
        })
}

