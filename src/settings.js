/**
 * Это просто css селекторы и какие правила применять
 * Можно менять, можно добавлять. Правилом может быть одна из функций в Field._hooks. 
 * Параметры в квадратных скобках, если есть.
 * @type Array
 */
export var rules = [
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
        el: '[name="email1"], [name="email"]'
        , rule: 'valid_email'
    }
    , {
        el: '.agreement'
        , rule: 'agreement'
    }
];

/**
 * Здесь расположены регулярные выражения для тестирования. rule и numeric вспомогательные(менять не желательно).
 * Остальные можно менять.
 */
export var ruleRegex = /^(.+?)\[(.+)\]$/;
export var numericRegex = /^[0-9]+$/;
export var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
export var alphaRegex = /^[а-яё ]*$/i;
export var phoneRegex = /^\+7\(\d{3}\) \d{3}-\d{2}-\d{2}$/;

/**
 * Это сообщения в случае ошибки(для alpha используется как подсказка). Их можно менять.
 * Ключ соответствует названию функции в Field._hooks
 */
export var messages = {
    required: "Пожалуйста, заполните поле."
    , valid_email: "Введите корректный email."
    , valid_phone: "Введите корректный номер телефона."
    , alpha: 'Это поле может содержать только буквы русского алфавита.'
    , min_length: 'Поле должно содержать не менее %s символов.'

};

/*
 * Это html всплывашки для соглашения. Можно менять.
 */
export var popupRender =
        "<div id=\"modal-not-agreement\">\
                    <div class=\"icon\">\
                            <svg viewBox=\"0 0 22 22\"><path d=\"M.35.35,21.82,21.82\"/><path d=\"M21.82.35.35,21.82\"/></svg>\
                    </div>\
                    <h2>Внимание!</h2>\
                    <p>Вы не согласились с нашей <a href=\"//privacy-policy/\" >политикой конфиденциальности</a>. По Закону, мы не имеем права получать ваши контакты.</p>\
                    <div class=\"button\">\
                            <button class=\"confirm btn\">Согласиться с политикой</button>\
                    </div>\
            </div>";
export var overlayRender = '<div id="modal-not-agreement__overlay"></div>';

var hideLabels = true;
export function isHideLabels() {
    return hideLabels;
}
export function setHideLabels(val) {
    hideLabels = !!val;
}