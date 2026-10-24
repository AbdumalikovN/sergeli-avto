/* Sergeli Avto — UZ is authored in the HTML; RU is applied here before first paint (script sits at the end of <body>).
   data-i18n (text) · data-i18n-html (markup) · data-i18n-label (aria-label) · data-i18n-alt · data-i18n-content · data-i18n-open. */
(function () {
  'use strict';
  var RU = {
    'meta.title': 'Sergeli Avto — новые Chevrolet в рассрочку 0%, без банка | Ташкент, Сергели',
    'meta.desc': 'Sergeli Avto — новые Chevrolet Damas, Cobalt и Labo в рассрочку без банка, без процентов, без штрафов. По одному паспорту, в 12 областей. Ключи за 2–3 часа. Ташкент, Сергелийский район, Index.',
    'skip': 'К содержанию', 'boot.label': 'Загрузка сайта', 'boot.skip': 'Пропустить', 'boot.s1': 'Процент', 'boot.s2': 'Областей', 'boot.s3': 'Паспорт', 'boot.loaded': 'Загружено ',
    'logo.label': 'Sergeli Avto, на главную', 'nav.label': 'Основная навигация', 'nav.mobile': 'Мобильная навигация',
    'nav.models': 'Модели', 'nav.calc': 'Калькулятор', 'nav.why': 'Почему мы', 'nav.bonus': 'Бонусы', 'nav.faq': 'Вопросы', 'nav.contact': 'Контакты',
    'lang.label': 'Язык сайта', 'theme.label': 'Светлая тема', 'theme.dark': 'Тёмная тема', 'sound.label': 'Звук и музыка', 'cta.request': 'Оставить заявку', 'menu.open': 'Открыть меню', 'close': 'Закрыть',
    'hours': 'Ежедневно 09:00–19:00', 'addr': 'г. Ташкент, Сергелийский район, Index', 'sum': 'сум', 'mo': 'мес.', 'bonusN': 'бонусов',
    'hero.pill': 'рассрочка 0%', 'hero.h1': 'Новый Chevrolet — <span class="grad-text">без банка и процентов.</span>',
    'hero.lead': 'Damas, Cobalt и Labo — в рассрочку без банка, без процентов, без штрафов и пени. Один паспорт, доставка в 12 областей, ключи за 2–3 часа.',
    'hero.call': 'Позвонить', 'hero.calc': 'Рассчитать платёж', 'hero.m1': 'процентов и банка', 'hero.m2': 'паспорт — достаточно', 'hero.m3': 'областей доставки', 'hero.m4': 'и ключи у вас', 'hero.hours': 'часа',
    'hero.photoAlt': 'Салон Sergeli Avto ночью: подсвеченный фасад и новые автомобили Chevrolet', 'hero.c1': 'Ключи за 2–3 часа', 'hero.c1s': 'Ташкент, Сергели, Index', 'hero.c2': '1 паспорт', 'hero.c2s': 'Без банка и поручителя', 'hero.scroll': 'Вниз',
    'facts.title': 'процентов, банка, поручителя и штрафов — ничего этого в Sergeli Avto нет. Новый Chevrolet в 12 областей по одному паспорту.', 'facts.pause': 'Пауза',
    't.foiz': 'процентов', 't.banksiz': 'без поручителя', 't.pasport': 'других документов не нужно', 't.viloyat': 'доставляем', 't.hours': 'ежедневно', 't.penya': 'без пени', 't.kalit': 'и ключи у вас', 't.foizsiz': 'рассрочка 0%', 't.kafil': 'поручитель не нужен', 't.tez': 'быстро и недорого', 't.yangi': 'новые автомобили', 't.bonus': 'к каждому авто', 't.banksiz2': 'без банка',
    'st.eb': 'Почему Sergeli Avto', 'st.title': 'Автокредит в банке — десятки бумаг. <span class="grad-text">В Sergeli Avto — один паспорт.</span>',
    'st.s1': 'процентов — без банка, поручителя, штрафов и пени', 'st.pasport': 'паспорт', 'st.s2': 'больше никаких справок, документов и залога', 'st.s3': 'от оформления до ключей, доставка в 12 областей',
    'st.note': 'Карточки слева — типичные этапы банковского автокредита (обобщённый пример), не о конкретном банке.',
    'st.c1': 'Справка о доходах', 'st.c1s': 'Банк · с места работы', 'st.c2': 'Поручитель', 'st.c2s': 'Банк · 1–2 человека', 'st.c3': 'Очередь в банке', 'st.c3s': 'Отделение · рабочие дни', 'st.c4': 'Годовой процент', 'st.c4s': 'Кредит · переплата каждый месяц',
    'st.c5': 'Штрафы и пеня', 'st.c5s': 'За просрочку платежа', 'st.c6': 'Проверка кредитной истории', 'st.c6s': 'Скоринг · 1–3 дня', 'st.c7': 'Страховка', 'st.c7s': 'Ежегодно · обязательно', 'st.c8': 'Залог', 'st.c8s': 'Авто в залоге у банка',
    'st.paper': 'бумаг', 'st.q': 'Что нужно?', 'st.a': '1 паспорт → <span class="grad-text">ключи за 2–3 часа</span>', 'st.ch1': 'Без банка', 'st.ch2': '0% процентов', 'st.ch3': 'Без штрафов', 'st.ch4': '12 областей',
    'models.eb': 'Модели', 'models.title': 'Три модели. <span class="grad-text">Одно условие: без банка и 0%.</span>',
    'models.lead': 'Ежемесячные платежи — условия рассрочки, объявленные Sergeli Avto, с бонусами. Больше первый взнос — меньше платёж.',
    'models.damas.meta': 'Новый · 7 мест', 'models.damas.price': 'в месяц · первый взнос 60% · 30 мес. (от 30% — 2 261 000)', 'models.calc': 'Рассчитать',
    'models.cs.meta': 'Новый · MCM · белый', 'models.cs.price': 'в месяц · первый взнос 50% (82 500 000) · 24 мес.',
    'models.cm.meta': 'Новый · MCM · чёрный', 'models.cm.price': 'в месяц · первый взнос 50% (87 000 000) · 24 мес.',
    'models.labo.meta': 'Новый · для груза', 'models.labo.price': 'Узнать цену', 'models.labo.text': 'условия по запросу: без банка, 0%, без штрафов', 'models.ask': 'Узнать цену',
    'alt.cobaltStyle': 'Chevrolet Cobalt Style MCM, белый', 'alt.cobaltMidnight': 'Chevrolet Cobalt Midnight MCM, чёрный',
    'cx.eb': 'Калькулятор', 'cx.title': 'Рассчитайте <span class="grad-text">ежемесячный платёж</span>', 'cx.lead': 'Цифры — условия, объявленные Sergeli Avto: без банка, без процентов, бонусы включены в цену.',
    'cx.step1': 'Модель', 'cx.step2': 'Первый взнос', 'cx.laboSmall': 'цена по запросу', 'cx.fifty': 'Damas · Cobalt', 'cx.hint': 'Damas — первый взнос 30/40/50/60%, 30 месяцев. Cobalt Style и Midnight — 50%, 24 месяца. Бонусы включены в цену.',
    'cx.monthly': 'Платёж в месяц', 'cx.total': 'Итого', 'cx.term': 'Срок', 'cx.totalCalc': 'Итого (расчёт)', 'cx.bonuses': 'Бонусы', 'cx.apply': 'Заявка на этих условиях',
    'cx.disc': '«Итого» — первый взнос + платёж × число месяцев, рассчитано на сайте. Банка, процентов и штрафов нет. Точные условия — при оформлении в салоне.',
    'cx.askText': 'Условия по Labo — по запросу: без банка, 0%, без штрафов, один паспорт. Позвоните или оставьте заявку — назовём цену.', 'cx.perMonth': 'В месяц', 'cx.barBtn': 'Заявка',
    'bonus.eb': 'Бонусы', 'bonus.title': 'К каждому авто — <span class="grad-text">бонусы в подарок</span>', 'bonus.lead': 'Бонусы включены в цену и выдаются вместе с ключами.',
    'b.reg': 'Видеорегистратор', 'b.polik': 'Коврики', 'b.benzin': 'Бензин', 'b.bar': 'Бар', 'b.torpedo': 'Чехол на торпедо', 'b.podnomer': 'Рамки под номер', 'b.pult': 'Чехол на пульт', 'b.brizgovik': 'Брызговики', 'b.setka': 'Сетка', 'b.moyka': 'Мойка', 'b.kraska': 'Проверка краски прибором',
    'steps.eb': 'Как это работает', 'steps.title': 'Три шага — <span class="grad-text">и ключи у вас</span>',
    'steps.1': 'Звонок или заявка', 'steps.1t': 'Выбираете модель и первый взнос. Подтверждаем условия по телефону или в Instagram DM.',
    'steps.2': 'Паспорт и первый взнос', 'steps.2t': 'Приезжаете в салон с одним паспортом. Банк, поручитель, справки и залог не нужны.',
    'steps.3': 'Ключи за 2–3 часа', 'steps.3t': 'Оформление быстрое — ключи в тот же день. Доставляем в 12 областей.',
    'gal.eb': 'Салон', 'gal.title': 'Сергели, Index — <span class="grad-text">выдача каждый день</span>', 'gal.lead': 'Настоящие фото: салон, сотрудники и новые Cobalt.',
    'gal.1': 'Салон Sergeli Avto днём', 'gal.2': 'Сотрудники и новые Cobalt', 'gal.3': 'Вывеска ночью',
    'faq.eb': 'Вопросы', 'faq.title': 'Частые <span class="grad-text">вопросы</span>', 'faq.lead': 'Коротко и по делу. Остальное спросите по телефону или в Instagram DM.',
    'faq.q1': 'Нужен ли банк?', 'faq.a1': 'Нет. Рассрочка оформляется через Sergeli Avto, без банка и поручителя.',
    'faq.q2': 'Есть ли проценты?', 'faq.a2': 'Нет — 0%. Итого = первый взнос + платёж × число месяцев. Пени и штрафов нет.',
    'faq.q3': 'Какие документы нужны?', 'faq.a3': 'Один паспорт. Справка о доходах, поручитель или залог не требуются.',
    'faq.q4': 'Сколько это занимает?', 'faq.a4': '2–3 часа — от оформления до ключей.',
    'faq.q5': 'Доставляете в области?', 'faq.a5': 'Да, в 12 областей — по одному паспорту. Детали уточним по телефону.',
    'faq.q6': 'Какие модели есть?', 'faq.a6': 'Новые Chevrolet Damas, Cobalt (Style и Midnight MCM) и Labo. Цена Labo — по запросу.',
    'faq.q7': 'Какие бонусы?', 'faq.a7': 'Cobalt: видеорегистратор, коврики, бензин, бар, чехол на торпедо, рамки под номер, чехол на пульт, брызговики, сетка, мойка, проверка краски прибором. Damas: видеорегистратор, коврики, рамки под номер, мойка, проверка краски прибором.',
    'faq.q8': 'Где вы и когда работаете?', 'faq.a8': 'г. Ташкент, Сергелийский район, Index. Ежедневно 09:00–19:00. Instagram: @sergeli_auto.',
    'rq.eb': 'Отвечаем ежедневно 09:00–19:00', 'rq.title': 'Оставьте <span class="grad-text">заявку</span>', 'rq.lead': 'Два коротких шага. Второй можно пропустить — остальное обсудим по телефону.',
    'rq.n1': 'Звонок или DM', 'rq.n1s': 'Подтверждаем модель и первый взнос', 'rq.n2': 'В салон с паспортом', 'rq.n2s': 'Сергелийский район, Index', 'rq.n3': 'Ключи за 2–3 часа', 'rq.n3s': 'Или доставим в 12 областей',
    'rq.st1': 'Контакт', 'rq.st2': 'Авто', 'rq.st3': 'Готово', 'rq.meter': 'Заявка заполнена', 'rq.l1': 'Как с вами связаться', 'rq.name': 'Ваше имя', 'rq.phone': 'Телефон', 'rq.next': 'Далее', 'rq.hint': 'Второй шаг можно пропустить',
    'rq.l2': 'Какое авто и условия', 'rq.opt': 'необязательно', 'rq.model': 'Модель', 'rq.note': 'Комментарий (область, цвет, вопрос)', 'rq.back': 'Назад', 'rq.skip': 'Пропустить', 'rq.send': 'Отправить заявку',
    'rq.doneT': 'Заявка готова', 'rq.doneX': 'Текст сообщения скопирован — вставьте его в Instagram DM или позвоните прямо сейчас. Ежедневно 09:00–19:00.', 'rq.copied': 'Сообщение скопировано', 'rq.copy': 'Скопировать', 'rq.again': 'Новая заявка',
    'ct.eb': 'Контакты', 'ct.title': 'Сергели, Index. <span class="grad-text">Ежедневно 09:00–19:00.</span>', 'ct.lead': 'Позвоните или напишите в Instagram — сразу назовём модель и условия.',
    'ct.phone': 'Телефон', 'ct.followers': 'подписчиков', 'ct.addr': 'Адрес', 'ct.hours': 'Режим работы',
    'ft.kicker': 'Instagram · 111K подписчиков', 'ft.title': 'Новые поступления — каждый день в @sergeli_auto', 'ft.text': 'Цены, условия и фото выдачи. На вопросы отвечаем в DM.', 'ft.rec': 'подписчиков · @sergeli_auto', 'ft.open': 'Открыть Instagram',
    'ft.desc': 'Новые Chevrolet Damas, Cobalt и Labo — в рассрочку без банка, без процентов, без штрафов и пени. В 12 областей по одному паспорту. Ташкент, Сергелийский район.',
    'ft.soc': 'Каналы связи Sergeli Avto', 'ft.sections': 'Разделы', 'ft.prefs': 'Настройки', 'ft.copy': 'Продажа автомобилей Chevrolet в рассрочку', 'ft.site': 'Сайт:'
  };
  var OPEN = { uz: ['Hozir ochiq', 'Hozir yopiq'], ru: ['Сейчас открыто', 'Сейчас закрыто'] };
  var lang = (document.documentElement.getAttribute('lang') || 'uz').slice(0, 2);
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  if (lang === 'ru') {
    var get = function (k) { return Object.prototype.hasOwnProperty.call(RU, k) ? RU[k] : null; };
    $$('[data-i18n]').forEach(function (el) { var v = get(el.getAttribute('data-i18n')); if (v !== null) el.textContent = v; });
    $$('[data-i18n-html]').forEach(function (el) { var v = get(el.getAttribute('data-i18n-html')); if (v !== null) el.innerHTML = v; });
    $$('[data-i18n-label]').forEach(function (el) { var v = get(el.getAttribute('data-i18n-label')); if (v !== null) el.setAttribute('aria-label', v); });
    $$('[data-i18n-alt]').forEach(function (el) { var v = get(el.getAttribute('data-i18n-alt')); if (v !== null) el.setAttribute('alt', v); });
    $$('[data-i18n-content]').forEach(function (el) { var v = get(el.getAttribute('data-i18n-content')); if (v !== null) el.setAttribute('content', v); });
    document.title = RU['meta.title'];
  }
  $$('[data-lang-current]').forEach(function (el) { el.textContent = lang.toUpperCase(); });
  $$('[data-lang-link]').forEach(function (a) { if (a.getAttribute('data-lang-link') === lang) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  var o = document.querySelector('[data-open-now]');
  if (o) { var t = OPEN[lang] || OPEN.uz; o.setAttribute('data-open-yes', t[0]); o.setAttribute('data-open-no', t[1]); }
  /* marquee: the second (hidden) track is a copy of the first, so the loop is seamless */
  ['1', '2'].forEach(function (n) {
    var tracks = $$('[data-i18n-track="' + n + '"]');
    if (tracks.length === 2) tracks[1].innerHTML = tracks[0].innerHTML;
  });
  window.SA_LANG = lang;
})();
