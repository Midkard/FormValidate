import $ from 'jquery';
import init3rd from './init3rd';
import {setHideLabels} from './settings';
import Validator from './Validator';

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
    options = options ? options : {};

    if ( options.hideLabels !== undefined ) {
        setHideLabels(options.hideLabels);
    };

    //Здесь проходим по каждому элементу коллекции
    this.each( function () {
        // Проверяем не создавали ли валидатор для этого элемента. Если да, то выходим.
        var validator = $( this ).data( "validator" );
        if ( validator ) {
            return;
        }

        // Add novalidate tag if HTML5.
//            this.attr("novalidate", "novalidate");



        // Скрытие открытие textarea
        $( this ).find( 'span.add-textarea' ).click( function () {
            $( this ).toggleClass( 'opened' );
        } );


        //Создаем валидатор для этой формы. Запихиваем его в data. Чтобы потом достать, если понадобится
        // например для проверки, есть ли он у элемента.
        validator = new Validator( this );
        $( this ).data( "validator", validator );
    } );
    return this;
};

