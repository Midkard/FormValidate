export default {
    /**
     * Это просто css селекторы и какие правила применять
     * Можно менять, можно добавлять. Правилом может быть одна из функций в Field._hooks.
     * Параметры в квадратных скобках, если есть.
     * @type Array
     */
    rules: [
        {
            el: '.required',
            rule: 'required'
        },
        {
            el: '.inp, .valid_phone',
            rule: 'valid_phone'
        },
        {
            el: '[name="name1"], .valid_name',
            rule: 'alpha|min_length[2]'
        },
        {
            el: '[name="email1"], [name="email"], .valid_email',
            rule: 'valid_email'
        },
        {
            el: '.agreement',
            rule: 'agreement'
        },
        {
            el: 'input[type=file]',
            rule: 'max_size|extension'
        }
    ],

    /**
     * Здесь расположены регулярные выражения для тестирования. rule и numeric вспомогательные(менять не желательно).
     * Остальные можно менять.
     */
    ruleRegex: /^(.+?)\[(.+)\]$/,
    numericRegex: /^[0-9]+$/,
    emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
    alphaRegex: /^[а-яё ]*$/i,
    phoneRegex: /^\+7\(\d{3}\) \d{3}-\d{2}-\d{2}$/,

    /**
     * Это сообщения в случае ошибки(для alpha используется как подсказка). Их можно менять.
     * Ключ соответствует названию функции в Field._hooks
     */
    messages: {
        required: "Пожалуйста, заполните поле.",
        valid_email: "Введите корректный email.",
        valid_phone: "Введите корректный номер телефона.",
        alpha: 'Это поле может содержать только буквы русского алфавита.',
        min_length: 'Поле должно содержать не менее %s символов.',
        extension: 'Данный тип файлов не допускается',
        max_size: 'Превышен предельный размер файлов',
    },

    /*
     * Это html всплывашки для соглашения. Можно менять.
     */
    popupRender:
        "<div id=\"modal-not-agreement\">\
                    <div class=\"icon\">\
                            <svg viewBox=\"0 0 22 22\"><path d=\"M.35.35,21.82,21.82\"/><path d=\"M21.82.35.35,21.82\"/></svg>\
                    </div>\
                    <h2>Внимание!</h2>\
                    <p>Вы не согласились с нашей <a href=\"{privacy}\" >политикой конфиденциальности</a>. По Закону, мы не имеем права получать ваши контакты.</p>\
                    <div class=\"button\">\
                            <button class=\"confirm btn\"><span>Согласиться с политикой</span></button>\
                    </div>\
            </div>",
    overlayRender: '<div id="modal-not-agreement__overlay"></div>',

    hideLabels: true,

    validateOnBlur: true,

    privacy: '/privacy-policy/'


}
