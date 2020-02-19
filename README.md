# Валидация формы

Для использования необходимо подключить скрипт /dist/validate.min.js на странице.
```html
<head>		
    ...

    <script src="js/jquery.min.js"></script>
    <script src="js/validate.min.js"></script>

    ...

</head>
```

В вашем коде укажите какие формы валидировать, а также определите параметры, с которыми запускается валидация
```javascript
$('form.form-to-validate').validate({
    hideLabels: false,
    validateOnBlur: true,
    privacy: 'https://site.ru/privacy/',
});
```

### Настройки

##### rules

Какие правила, применяются к указанным селекторам. Значение по умолчанию

```javascript
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
    }
]
```


##### messages

Это сообщения в случае ошибки(для alpha используется как подсказка). Значение по умолчанию

```javascript

messages : {
    required: "Пожалуйста, заполните поле.",
    valid_email: "Введите корректный email.",
    valid_phone: "Введите корректный номер телефона.",
    alpha: 'Это поле может содержать только буквы русского алфавита.',
    min_length: 'Поле должно содержать не менее %s символов.',
}

```

##### popupRender

Это html всплывашки для соглашения. Значение по умолчанию

```javascript

popupRender :
        "<div id=\"modal-not-agreement\">\
                <div class=\"icon\">\
                        <svg viewBox=\"0 0 22 22\"><path d=\"M.35.35,21.82,21.82\"/><path d=\"M21.82.35.35,21.82\"/></svg>\
                </div>\
                <h2>Внимание!</h2>\
                <p>Вы не согласились с нашей <a href=\"{privacy}\" >политикой конфиденциальности</a>. По Закону, мы не имеем права получать ваши контакты.</p>\
                <div class=\"button\">\
                        <button class=\"confirm btn\"><span>Согласиться с политикой</span></button>\
                </div>\
        </div>"
```

##### overlayRender

Html подложки для всплывающего окна. Значение по умолчанию

```javascript
overlayRender : '<div id="modal-not-agreement__overlay"></div>'
```

##### hideLabels

При фокусе на валидируемом поле добавляется класс label-none для всех соседних элементов label. При потере фокуса данный класс убирается, если поле осталось пустым. Значение по умолчанию true.

##### validateOnBlur

Проверять поле при потере фокуса с показыванием ошибок. Значение по умолчанию true.

##### privacy

Адрес страницы политики конфидециальности. Подставляется в popupRender вместо {privacy}. Значение по умолчанию '/privacy-policy/'.
