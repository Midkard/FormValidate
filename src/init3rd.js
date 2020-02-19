import $ from 'jquery';

export default function init3rd() {
    $( 'label.agreement-label .check' ).click( function ( ev ) {
        ev.preventDefault();
        var input = $( this ).siblings( 'input' );
        var state = !input.prop( "checked" );
        input.prop( "checked", state );
        input.change();
    } );
    //Для сброса фокуса с поля в попапе, при клике по контенту
    if ( !$.fancybox ) {
        return;
    }
    var oldfunc = $.fancybox.defaults.clickContent;
    $.fancybox.defaults.clickContent = function ( current, event ) {
        if ( current.$content[0].contains( document.activeElement ) ) {
            document.activeElement.blur();
        }
        oldfunc( current, event );
    };
}

