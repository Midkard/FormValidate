import $ from 'jquery';
import {popupRender, overlayRender} from './settings';
/**
 * Popup Class
 * @returns {validateL#2.Popup}
 */
var Popup = function () {
    this.popup = $( popupRender ).appendTo( 'body' );
    this.overlay = $( overlayRender ).appendTo( 'body' );
    this.checkbox = null;
    var that = this;
    this.popup.find( '.confirm' ).click( function () {
        that.checkbox.prop( 'checked', true );
        that.checkbox.change();
        that.hide();
    } );
//        this.overlay.click(function() {
//            that.hide();
//        });
//        this.popup.find('.icon').click(function () {
//            that.hide();
//        });
};

$.extend( Popup.prototype, {
    show: function ( checkbox ) {
        this.checkbox = checkbox;
        this.overlay.fadeIn();
        this.popup.fadeIn();
    }

    , hide: function () {
        this.overlay.fadeOut();
        this.popup.fadeOut();
    }
} );

var popup;

export default function   getPopup() {
    //Если не создана всплывашка для соглашения на обработку, то тутт ее создаем. Она одна на все формы
    if ( !popup ) {
        popup = new Popup();
    }
    return popup;
};


