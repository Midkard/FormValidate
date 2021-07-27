$(function(){
    $('form').validate({
        hideLabels: true,
        validateOnBlur: true,
        privacy: '/123',
        phoneRegex : /^\+7\([023456789]\d{2}\) \d{3}-\d{2}-\d{2}$/,
    });
});


