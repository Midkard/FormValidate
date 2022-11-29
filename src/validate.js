import $ from 'jquery';
import init3rd from './init3rd';
import defaults from './defaults';
import Validator from './Validator';
import 'intl-tel-input/build/css/intlTelInput.css';
import './styles.css';

init3rd();
/**
 * Функция Validate Для Jquery. Именно она вызывается при надписи типа $('form').validate();
 * this указывает на коллекцию элементов
 * 
 */
$.fn.validate = function ( options ) {
    // Если коллекция пуста, то заканчиваем сразу
    if ( !this.length ) {
        return;
    }
    options = $.extend(true, {}, defaults, options);

    //Здесь проходим по каждому элементу коллекции
    this.each( function () {
        // Проверяем не создавали ли валидатор для этого элемента. Если да, то выходим.
        var validator = $( this ).data( "validator" );
        if ( validator ) {
            return;
        }

        // Add novalidate tag if HTML5.
//            this.attr("novalidate", "novalidate");



        // Скрытие открытие textarea wtf?
        $( this ).find( 'span.add-textarea' ).on( 'click', function () {
            $( this ).toggleClass( 'opened' );
        } );


        //Создаем валидатор для этой формы. Запихиваем его в data. Чтобы потом достать, если понадобится
        // например для проверки, есть ли он у элемента.
        validator = new Validator( this, options );
        $( this ).data( "validator", validator );
    } );
    return this;
};

