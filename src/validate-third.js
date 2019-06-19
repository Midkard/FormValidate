$(function(){

    //Для сброса фокуса с поля в попапе, при клике по контенту
    if (! $.fancybox) {
		return;
	}
	var oldfunc = $.fancybox.defaults.clickContent;
	$.fancybox.defaults.clickContent = function(current, event) {
		if (current.$content[0].contains(document.activeElement)) {
			document.activeElement.blur();
		}
		oldfunc(current, event);
	}
});

