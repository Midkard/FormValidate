import $ from 'jquery';
import {messages, ruleRegex, emailRegex, numericRegex, phoneRegex, alphaRegex, isHideLabels} from './settings';
import getPopup from './Popup';

/**
 * Field Class
 * Объект класса Field создается для каждого элемента, для которого нашлись правила.
 * @param {$element} elem
 * @param {String} rules
 * @param {Validator} parent
 * @returns {validateL#2.Field}
 */
var Field = function ( elem, rules, parent ) {
    this.elem = elem;
    this.rules = rules;
    this.value = null;
    this.oldValue = '';

    if ( this.rules ) {
        this.erElem = null;
        this.tipElem = null;
        this.required = rules.indexOf( 'required' ) !== -1;
    }

    this.$placeholder = null;
    if ( $( this.elem ).siblings( 'label' ).length ) {
        this.$placeholder = $( this.elem ).siblings( 'label' );
    }
    //состояние. При изменении вызыввает _checkButtons у родительского Validator
    var _valid = true;
    Object.defineProperty( this, "valid", {
        get: function () {
            return _valid;
        },
        set: function ( value ) {
            // if validity changed then check buttons
            if ( value !== _valid ) {
                _valid = value;
                parent._checkButtons();
            }
        }
    } );

    //Первоначальная проверка, без отображения ошибок.
    this._validate( true );

    //Привязываем обработчики к собятиям элемента
    var field = this;
    if ( this.rules ) {
        elem.on( 'blur change completed', function () {
            field._validate();
        } );
        elem.on( 'input keypress keydown paste', function () {
            field._validate( true );
        } );
    }
    //Если есть правило alpha, то нужно показать подсказку и фильтровать нажатия клавиш
    if ( rules && ~rules.indexOf( 'alpha' ) ) {
        elem.on( 'input', function () {
            field._testInput();
        } );
        elem.on( 'focusout', function () {
            field._tip( true );
        } );
    }
    if (rules && ~rules.indexOf( 'valid_phone' )) {
        elem.on( 'input', function () {
            field._transformToPhone();
        } );
    }
    //Если есть placeholder
    if ( this.$placeholder ) {
        elem.on( 'focusin input', function () {
            field._placeholder( true );
        } );
        elem.on( 'focusout', function () {
            field._placeholder(  );
        } );
    }


};

// Добавляем статические функции для Field
$.extend( Field.prototype, {

    /*
     * Главная функция. Проверяет валиден ли элемент.
     */

    _validate: function ( silent ) {

        silent = silent || false;
        if ( !this.rules ) {
            return true;
        }
        //валидация приостановлена
        if (this.elem.attr( 'data-validation') === 'stopvalidation' ) {
            this.valid = true;
            this.value = null;
            this._removeError();
            return true;
        }
        
        //Если мы уже тестировали текущее значение, в других евентах, то выходим
        if ( this.value === this.elem.val() && silent ) {
            return;
        }

        var i, ruleLength
                , rules = this.rules.split( '|' )
                , isEmpty = (!this.elem.val())
                , errors = []
                ;


        this.value = this.elem.val();

        /*
         * Пробегаем по каждому правилу для данного элемента
         */

        for ( i = 0, ruleLength = rules.length; i < ruleLength; i++ ) {
            var method = rules[i],
                    param = null,
                    failed = false,
                    parts = ruleRegex.exec( method );

            /*
             * If this field is not required and the value is empty, break.
             * For empty field value check only required and agreemen rule.
             */

            if ( isEmpty && !this.required ) {
                break;
            }

            if ( isEmpty && ['required', 'agreement'].indexOf( method ) === -1 ) {
                continue;
            }

            /*
             * If the rule has a parameter (i.e. matches[param]) split it out
             */

            if ( parts ) {
                method = parts[1];
                param = parts[2];
            }

            if ( method.charAt( 0 ) === '!' ) {
                method = method.substring( 1, method.length );
            }

            /*
             * If the hook is defined, run it to find any validation errors
             */

            if ( typeof this._hooks[method] === 'function' ) {
                if ( !this._hooks[method].apply( this, [param] ) ) {
                    failed = true;
                }
            }

            /*
             * If the hook failed, add a message to the errors array
             */

            if ( failed ) {

                var message = messages[method];

                if ( param ) {
                    message = message.replace( '%s', param );
                }
                errors.push( message );

            }
        }

        //Показываем, убираем ошибки
        if ( errors.length ) {
            if ( !silent ) {
                this._setError( errors );
            }
            this.valid = false;
            this.elem.attr( 'data-validation', 'invalid' );
        } else {
            // if (!silent) {
            this._removeError();
            // }
            this.valid = true;
            this.elem.attr( 'data-validation', 'valid' );
        }
        return this.valid;
    }

    /**
     * Filter keyboard input
     */
    , _testInput: function () {

        this.value = this.elem.val();
        if ( !this._hooks.alpha.apply( this ) ) {
            this.elem.val( this.oldValue );
            //подсказка
            this._tip();
        } else {
            this.oldValue = this.value;
            //убираем подсказку
            this._tip( true );
        }

    }

    /*
     * AddTip
     */
    , _tip: function ( remove ) {
        // Для alpha              
        remove = remove || false;

        var tip = messages['alpha'];

        if ( !remove ) {
            if ( !this.tipElem ) {
                this.tipElem = $( '<span class="message-tooltip">' + tip + '</span>' ).
                        insertAfter( this.elem );
            }

        } else if ( this.tipElem ) {
            this.tipElem.remove();
            this.tipElem = null;
        }
    }
    
    /**
     * Filter keyboard input
     */
    , _transformToPhone: function () {

        var value = this.elem.val();
        if (! value) {
            return;
        }
        
        value = value.replace(/\D/g, '');
        if (! value.length) {
            this.elem.val('');
            return;
        }
        if ('7' === value[0] || '8' === value[0]) {
            value = value.slice(1);
        }
        
        var newValue = '+7(';
        var groups = [value.slice(0, 3), value.slice(3, 6), value.slice(6, 8), value.slice(8, 10)];
        
        groups = groups.filter(function(el){
            return el !== '';
        });
        
        groups.forEach(function(el, index){
            if (index === 1) {
                newValue += ') ';
            }
            if (index > 1) {
                newValue += '-';
            }
            newValue += el;
        });
        
        this.elem.val(newValue);
        
        this._validate(true);
    }
    
    /*
     * Add, remove placeholder
     */
    , _placeholder: function ( remove ) {
        var isEmpty = (!this.elem.val());
        remove = remove || false;

        //Изменяем класс соседнего label
        if ( !isHideLabels() ) {
            return;
        }
        if ( remove ) {
            this.$placeholder.addClass( 'label-none' );
        } else {
            if ( isEmpty ) {
                this.$placeholder.removeClass( 'label-none' );
            }
        }

    }
    /**
     * Add span with error message after element
     * @param {Array} errors
     */
    , _setError: function ( errors ) {
        if ( this.erElem ) {
            this.erElem.html( errors.join( ' ' ) );
        } else {
            if ( this.rules.indexOf( 'agreement' ) === -1 ) {
                this.erElem = $( '<span class="message-error">' + errors.join( ' ' ) + '</span>' ).
                        insertAfter( this.elem );
            }
        }

        this.elem.addClass( 'error' );
        this.elem.removeClass( 'correctly' );
    }

    /**
     * Remove span with error message
     */
    , _removeError: function () {
        if ( this.erElem ) {
            this.erElem.remove();
            this.erElem = null;

            this.elem.addClass( 'correctly' );
            this.elem.removeClass( 'error' );
        }
    }

    /**
     * Функции, которые можно вызвать для тестирования содержимого поля.
     */
    , _hooks: {
        required: function () {
            var type = this.elem[0].type;
            if ( (type === 'checkbox') || (type === 'radio') ) {
                return (this.elem[0].checked === true);
            }

            return (!!this.value);
        }

        , valid_email: function () {
            return emailRegex.test( this.value );
        }

        , valid_phone: function () {
            return phoneRegex.test( this.value );
        }

        , min_length: function ( length ) {
            if ( !numericRegex.test( length ) ) {
                return false;
            }

            return (this.value.length >= parseInt( length, 10 ));
        }

        , alpha: function () {
            return (alphaRegex.test( this.value ));
        }

        , agreement: function () {
            var type = this.elem[0].type;
            if ( (type === 'checkbox') || (type === 'radio') ) {
                var res = (this.elem[0].checked === true);
                if ( !res ) {
                    getPopup().show( this.elem );
                }
                ;
                return res;
            }

            return (!!this.value);
        }

    }

} );

export default Field;


