import $ from 'jquery';
import Field from './Field';

/**
 * Validator Class. Валидатор для формы. Один на всю форму.
 * @param formElement form
 * @param array opts
 * 
 */
var Validator = function ( form, opts ) {

    this.form = form;
    this.allRules = opts.rules;
    this.opts = opts;
    this.buttons = [];
    this.fields = [];

    /*
     * Проходим по каждому элементу формы
     */
    for ( var i = 0; i < form.elements.length; i++ ) {
        //кнопки добавляем в this.buttons
        if ( form.elements[i].type === 'submit' ) {
            this.buttons.push( form.elements[i] );
            continue;
        }
        //пробуем составить правила для элемента
        var $elem = $( form.elements[i] )
                , fieldRules = this._genElemRules( $elem )
                ;
        // если удалось найти подходящие правила, то создаем объект Field и пихаем его в this.fields
        if ( fieldRules.length ) {
            this.fields.push( new Field( $elem, fieldRules.join( '|' ), this ) );
        } else {
            this.fields.push( new Field( $elem, null, this ) );
        }
    }

    //Устанавливаем первоначальное значение кнопок(отключены\включены)
    this._checkButtons();

    //Добавляем обработчик события(submit)
    $( form ).submit( $.proxy( this, '_validateForm' ) );
//        console.dir(this);

};

// Добавляем статические функции для Validator
$.extend( Validator.prototype, {

    /**
     * Генерируем правила для элемента. Пробегаем по каждому правилу из defaultRules, если элемент удовлетворяет
     * css селектору, то добавляем правило в итоговый массив.
     * @param {$element} $field
     * @returns {Array}
     */
    _genElemRules: function ( $field ) {
        var rules = {},
                arrRules = [];

        for ( var i = 0; i < this.allRules.length; i++ ) {
            if ( $field.is( this.allRules[i].el ) ) {
                rules[this.allRules[i].rule] = true;
            }
        }
        ;

        for ( var key in rules ) {
            arrRules.push( key );
        }

        return arrRules;
    }

    /**
     * Валидация формы. Просто опрашиваем каждый Field из this.fields, если хотя бы одни не валиден,
     * то и вся форма не отправляется
     * @param {Event} evt
     * @returns {Boolean}
     */
    , _validateForm: function ( evt ) {
        var error = false;


        for ( var i = 0; i < this.fields.length; i++ ) {

            var field = this.fields[i];
            if ( !field._validate() ) {
                error = true;
            }

        }

        if ( error ) {
            if ( evt && evt.preventDefault ) {
                evt.preventDefault();
            } else if ( event ) {
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

        for ( var i = 0; i < this.fields.length; i++ ) {

            var field = this.fields[i];
            if ( !field.valid ) {
                error = true;
            }
            ;

        }

        if ( error ) {
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].classList.add('disabled');
            }
        } else {
            for ( var i = 0; i < this.buttons.length; i++ ) {
                this.buttons[i].classList.remove('disabled');
            }
        }


    }

} );

export default Validator;


