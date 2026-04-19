"""
Секция IV (стр. 45-47): CRM — операционная система парка.
Обзор, реестр 23 модулей, воронка, операции, финансы, контент и персонал.
Использует 20 скринов CRM + скрин «Смотреть как роль».
"""
import sys
sys.path.insert(0, '/home/claude/ethnomir-app/src')
from pdfkit import *


# ══════════════════════════════════════════════════
# 25 · SECTION IV COVER
# ══════════════════════════════════════════════════
def page_cover_IV(c):
    c.setFillColor(C["sec_IV"])  # чёрный — CRM как режим «Владелец»
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF90"))
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T, "СЛОЙ IV · 40")

    y = PAGE_H/2 + 90
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Inter-Ex", 56)
    c.drawString(MARGIN_L, y, "CRM —")
    c.drawString(MARGIN_L, y - 62, "операционная")
    c.drawString(MARGIN_L, y - 124, "система парка.")

    y -= 170
    c.setFillColor(HexColor("#FFFFFFC8"))
    c.setFont("Inter-Med", 13)
    for line in [
        "Двадцать три модуля управления,",
        "которые заменяют отдельную ERP, PMS, POS",
        "и классическую CRM. Всё — в том же",
        "приложении, в режиме «Владелец», с телефона.",
    ]:
        c.drawString(MARGIN_L, y, line)
        y -= 18

    c.setFillColor(HexColor("#FFFFFFA0"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN_L, MARGIN_B, "ethnomir.app · Справочник продукта")
    c.drawRightString(PAGE_W - MARGIN_R, MARGIN_B, "40 / 54")
    c.showPage()


# ══════════════════════════════════════════════════
# 26 · Режим «Владелец» — обзор + главный дашборд CRM
# ══════════════════════════════════════════════════
def page_IV_overview(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "IV · CRM — ОПЕРАЦИОННАЯ СИСТЕМА")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 34)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Режим «Владелец».")

    # 60/40
    col_text_w = CONTENT_W * 0.56
    col_img_x = MARGIN_L + col_text_w + 14
    col_img_w = CONTENT_W - col_text_w - 14

    y = PAGE_H - MARGIN_T - 95
    intro = ("Одно приложение работает в двух кардинально разных режимах. Для гостя это "
             "мобильное приложение парка с пятью табами и Паспортом. Для сотрудника — "
             "полноценная панель управления с 24 вкладками, метриками и инструментами. "
             "Переключение — по одной роли в профиле.")
    p_style = ParagraphStyle("p", fontName="Inter", fontSize=10, leading=14.5,
                              textColor=C["label2_real"], spaceAfter=10)
    p = Paragraph(intro, p_style)
    pw, ph = p.wrap(col_text_w, 200)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 4

    # Hero-highlight — высота считается по реальному контенту
    p_note_style = ParagraphStyle("n", fontName="Inter", fontSize=9, leading=12.5,
                                   textColor=C["label"])
    note = ("Классический парк масштаба Этномира заказывал бы: Opera/Fidelio PMS "
            "для отелей, R-Keeper/iiko POS для ресторанов, Bitrix24/AmoCRM для B2B, "
            "Manzana/Loymax для лояльности, Unisender для рассылок, отдельные "
            "админки контента и недвижимости. Это 6-10 контрактов, лицензий, "
            "интеграций, поставщиков. В ethnomir.app всё это — одно приложение.")
    p2 = Paragraph(note, p_note_style)
    p2w, p2h = p2.wrap(col_text_w - 28, 400)
    # Заголовок 11pt (≈14pt высоты) + зазор 10 + параграф + нижний padding 14
    box_h = 14 + 10 + p2h + 14
    c.setFillColor(C["bg"])
    c.roundRect(MARGIN_L, y - box_h, col_text_w, box_h, 10, fill=1, stroke=0)
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 11)
    c.drawString(MARGIN_L + 14, y - 18, "Что значит «CRM здесь, а не отдельно»")
    # Параграф под заголовком
    p2.drawOn(c, MARGIN_L + 14, y - 18 - 10 - p2h)
    y = y - box_h - 18

    # 8 доменов CRM — компактная таблица в левой колонке, не налезает на скрин справа
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 11)
    c.drawString(MARGIN_L, y, "8 функциональных доменов CRM")
    y -= 12

    domains = [
        ["ДОМЕН", "ВКЛАДКИ", "СОДЕРЖАНИЕ"],
        ["Воронка продаж",   "3", "Лиды · Сделки · Задачи"],
        ["Операции",         "5", "Брони · Календарь · Заказы · Номера · Timeline"],
        ["Финансы",          "3", "Финансы · Оплаты · Экспорт"],
        ["Разум гостя",      "3", "Гости · Отзывы и NPS · Чат"],
        ["Контент",          "2", "Контент-база · Расписание"],
        ["Персонал",         "2", "Стафф 24 чел · Партнёрский доступ"],
        ["Рост и маркетинг", "3", "Рассылки · Цены · Заявки B2B"],
        ["Governance",       "3", "Аналитика · Документы · Настройки"],
    ]
    # Ширины для col_text_w (~275pt): домен 110, вкладки 50, содержание = остаток
    t = ios_table(domains, [110, 50, col_text_w - 160], head=True,
                  fs_head=7.5, fs_body=8.5, compact=True)
    tw, th = t.wrap(col_text_w, 400)
    t.drawOn(c, MARGIN_L, y - th)

    # Правая колонка — CRM Home дашборд
    draw_screen(c, screen_path("01_31_51"), col_img_x, PAGE_H - MARGIN_T - 110, col_img_w)
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    c.drawString(col_img_x, MARGIN_B + 100, "CRM · Главная: уведомления,")
    c.drawString(col_img_x, MARGIN_B + 90, "«Система работает 97%».")

    draw_page_frame(c, 41, 54, "IV · CRM · ОБЗОР")
    c.showPage()


# ══════════════════════════════════════════════════
# 37 · IV.crm_table — Реестр 23 модулей CRM (NEW)
# ══════════════════════════════════════════════════
def page_IV_crm_table(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "IV · CRM · РЕЕСТР МОДУЛЕЙ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 34)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Реестр модулей CRM.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 13)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 72,
                 "23 инструмента управления — в 8 доменах. Обзор по доменам — на стр. 41.")

    y = PAGE_H - MARGIN_T - 100

    # Таблица 23 модулей — компактно, одна строка на функцию
    table_data = [
        ["№",  "МОДУЛЬ",              "ДОМЕН",             "ФУНКЦИЯ"],
        ["01", "Dashboard",           "Governance",        "KPI, спарклайны, выручка, загрузка"],
        ["02", "Bookings",            "Операции",          "Брони, статусы, канбан, календарь"],
        ["03", "Reviews",             "Разум гостя",       "Модерация отзывов, NPS, ответы"],
        ["04", "Finance",             "Финансы",           "Доходы, расходы, план/факт"],
        ["05", "Staff",               "Персонал",          "Сотрудники, роли, KPI, смены"],
        ["06", "Deals",               "Воронка продаж",    "B2B и франшиза, канбан сделок"],
        ["07", "Leads",               "Воронка продаж",    "Заявки, квалификация, источники"],
        ["08", "Tasks",               "Воронка продаж",    "Канбан задач с приоритетами"],
        ["09", "Guests",              "Разум гостя",       "База гостей, сегментация, 360°"],
        ["10", "Rooms",               "Операции",          "Номерной фонд, занятость"],
        ["11", "Analytics",           "Governance",        "Когорты, воронки, LTV, retention"],
        ["12", "Calendar",            "Операции",          "События парка, мастер-классы"],
        ["13", "Messages",            "Разум гостя",       "Мессенджер-центр, live-чат, push"],
        ["14", "Content",             "Контент",           "CMS: новости, статьи, FAQ"],
        ["15", "Pricing",             "Рост и маркетинг",  "Тарифы, динамическое ценообразование"],
        ["16", "Campaigns",           "Рост и маркетинг",  "Email, push, промо-акции"],
        ["17", "Inventory",           "Операции",          "Склад, мерч, расходники"],
        ["18", "AI Recommendations",  "Governance",        "Прогнозы цен, сегменты, офферы"],
        ["19", "Exports",             "Финансы",           "Excel, CSV, PDF — отчёты"],
        ["20", "Settings",            "Governance",        "Интеграции, API, RBAC"],
        ["21", "Promos",              "Рост и маркетинг",  "Акции, купоны, рефералы"],
        ["22", "Notifications",       "Контент",           "Шаблоны push и email, расписание"],
        ["23", "Audit",               "Governance",        "Журнал операций, логи"],
    ]
    t = ios_table(table_data, [26, 128, 108, CONTENT_W - 262], head=True,
                  fs_body=8.5, compact=True)
    tw, th = t.wrap(CONTENT_W, 700)
    t.drawOn(c, MARGIN_L, y - th)
    y = y - th - 16

    # Плашка-summary
    p_sum = ParagraphStyle("sm", fontName="Inter-Semi", fontSize=9.5, leading=13,
                           textColor=C["label"])
    p = Paragraph("Все 23 модуля — в одном приложении. Переключение — по Tab Bar CRM. "
                  "Права доступа — 5-уровневый RBAC: владелец видит всё, кассир — только свою зону.",
                  p_sum)
    pw, ph = p.wrap(CONTENT_W - 28, 100)
    box_h = ph + 20
    c.setFillColor(C["bg"])
    c.roundRect(MARGIN_L, y - box_h, CONTENT_W, box_h, 10, fill=1, stroke=0)
    p.drawOn(c, MARGIN_L + 14, y - ph - 10)

    draw_page_frame(c, 42, 54, "IV · CRM · РЕЕСТР")
    c.showPage()


# ══════════════════════════════════════════════════
# 27 · Воронка продаж (2×2 галерея: заказы, лиды, сделки, задачи)
# ══════════════════════════════════════════════════
def page_IV_funnel(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "IV · CRM · ВОРОНКА ПРОДАЖ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 32)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Воронка продаж.")

    y = PAGE_H - MARGIN_T - 80
    intro = ("Лиды и сделки — классическая B2B-воронка парка. Задачи — поручения команде, "
             "связанные как со сделками, так и с отдельными задачами (ответы на негативные "
             "отзывы, обзвон VIP). Заказы агрегируют платные операции парка.")
    p_style = ParagraphStyle("p", fontName="Inter", fontSize=10, leading=14.5,
                              textColor=C["label2_real"], spaceAfter=10)
    p = Paragraph(intro, p_style)
    pw, ph = p.wrap(CONTENT_W, 200)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 4

    # 4 KPI
    kpis = [("15", "лидов в воронке,\n7% конверсия"),
            ("11", "сделок, win rate 18%,\nср. чек 504K"),
            ("12", "задач,\n80% выполнено"),
            ("58", "ожидающих заказов\nна 2.08M")]
    kw = CONTENT_W / 4
    for i, (v, l) in enumerate(kpis):
        cx = MARGIN_L + i*kw
        draw_mixed(c, cx, y - 22, v, "Inter-Ex", 22, color=C["label"])
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        for j, ln in enumerate(l.split("\n")[:2]):
            c.drawString(cx, y - 36 - j*10, ln)
    y -= 72

    # Ключевые проводки
    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10.5, leading=13, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=9, leading=12.5, textColor=C["label"])
    
    body_items = [
        ("Лиды: 5 стадий, 4 источника",
         "Новые → Контакт → Квалификация → Переговоры → Выиграны/Потеряны. Источники: звонок (2), сайт (3), рекомендации (1), соцсети (1)."),
        ("Сделки: пайплайн 2.27M ₽ (взвешенно)",
         "Холодные 1 (95K) · Тёплые 4 (2 935K) · Горячие 3 (1 065K) · Закрытие 1 (420K). Кейс: корпоратив ООО «Синергия» 175K."),
        ("Задачи: приоритет и SLA",
         "urgent «Ответить на отзыв 2★» (24ч SLA), high «Обзвонить VIP-гостей», normal «Проверить отзывы за неделю». Просрочено 2."),
        ("Заказы: агрегатор доходов",
         "Отели 2 028K, Билеты 33K, МК 6K, сертификаты 5K, услуги 3K. Статус «Ожидают» = pipeline к закрытию в оплату."),
    ]
    for head, body in body_items:
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(CONTENT_W, 20)
        ph_h.drawOn(c, MARGIN_L, y - phh)
        y -= phh + 2
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(CONTENT_W, 50)
        ph_b.drawOn(c, MARGIN_L, y - phb)
        y -= phb + 6

    y -= 4
    # 2 ключевых скрина бок-о-бок — Лиды (воронка) + Заказы (pipeline)
    gap = 20
    cap_reserve = 40
    avail_h = y - MARGIN_B - 40 - cap_reserve
    cell_w_limit = (CONTENT_W - gap) / 2
    cell_w_by_h = avail_h * (784/2024)
    if cell_w_by_h > cell_w_limit:
        cell_w = cell_w_limit
        cell_h = cell_w / (784/2024)
    else:
        cell_w = cell_w_by_h
        cell_h = avail_h
    total_w = 2*cell_w + gap
    x_start = MARGIN_L + (CONTENT_W - total_w)/2

    screens = [
        ("01_28_29", "Лиды · воронка 7% конв."),
        ("01_28_16", "Заказы · 58 ожидают 2.08M₽."),
    ]
    for idx, (ts, caption) in enumerate(screens):
        cx = x_start + idx*(cell_w + gap)
        draw_screen(c, screen_path(ts), cx, y, cell_w, corner=12)
        cap_y = y - cell_h - 16
        cap_lines = wrap_text_lines(c, caption, "Inter", 9, cell_w - 4)
        for li, ln in enumerate(cap_lines[:3]):
            draw_mixed(c, cx, cap_y - li*12, ln, "Inter", 9, color=C["label2_real"])

    draw_page_frame(c, 43, 54, "IV · CRM · ВОРОНКА")
    c.showPage()


# ══════════════════════════════════════════════════
# 28 · Операции: Календарь + Номерной фонд (60/40 номера)
# ══════════════════════════════════════════════════
def page_IV_operations(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "IV · CRM · ОПЕРАЦИИ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 32)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Операции.")

    col_text_w = CONTENT_W * 0.56
    col_img_x = MARGIN_L + col_text_w + 14
    col_img_w = CONTENT_W - col_text_w - 14

    y = PAGE_H - MARGIN_T - 80
    intro = ("Пять связанных вкладок одной бизнес-реальности: Брони, Календарь, Заказы, "
             "Номерной фонд, Timeline. Дают владельцу полную картину сегодняшнего дня парка.")
    p_style = ParagraphStyle("p", fontName="Inter", fontSize=10, leading=14.5,
                              textColor=C["label2_real"], spaceAfter=10)
    p = Paragraph(intro, p_style)
    pw, ph = p.wrap(col_text_w, 200)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 4

    kpis = [("330", "номеров"),
            ("13", "отелей"),
            ("78", "броней"),
            ("5%", "загрузка")]
    kw = col_text_w / 4
    for i, (v, l) in enumerate(kpis):
        cx = MARGIN_L + i*kw
        draw_mixed(c, cx, y - 20, v, "Inter-Ex", 20, color=C["label"])
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8)
        c.drawString(cx, y - 34, l)
    y -= 56

    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10.5, leading=13, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=9, leading=12.5, textColor=C["label"])
    
    items = [
        ("Календарь загрузки",
         "Месячная сетка с цветовой индикацией: жёлтый (ожидание оплаты), синий (подтверждено), "
         "зелёный (заселён), серый (завершён). Тап на любую дату — переход в бронь."),
        ("Номерной фонд",
         "Разбивка по отелям: Дербент 0/18, Океан смыслов 1/30, Юго-Восточная Азия 1/26, "
         "Дома и коттеджи 0/8, Комплекс апартаментов 0/29. Статусы: Занято, К уборке, Убрано, Всего."),
        ("Timeline 30 дней вперёд",
         "Визуальная лента будущих заездов и выездов. Помогает персоналу планировать уборку, "
         "заселение, выезды на три недели вперёд."),
    ]
    for head, body in items:
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(col_text_w, 30)
        ph_h.drawOn(c, MARGIN_L, y - phh)
        y -= phh + 2
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(col_text_w, 80)
        ph_b.drawOn(c, MARGIN_L, y - phb)
        y -= phb + 8

    # Правая колонка — скрин номерного фонда
    draw_screen(c, screen_path("01_29_28"), col_img_x, PAGE_H - MARGIN_T - 110, col_img_w)

    # Мини-заметка под скрином
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    c.drawString(col_img_x, MARGIN_B + 60, "Номерной фонд · 330 номеров")
    c.drawString(col_img_x, MARGIN_B + 50, "в 13 отелях · загрузка 5%.")

    draw_page_frame(c, 44, 54, "IV · CRM · ОПЕРАЦИИ")
    c.showPage()


# ══════════════════════════════════════════════════
# 29 · Финансы + Оплаты + Гость (3-в-1)
# ══════════════════════════════════════════════════
def page_IV_money_guest(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "IV · CRM · ФИНАНСЫ И РАЗУМ ГОСТЯ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 32)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Финансы и разум гостя.")

    y = PAGE_H - MARGIN_T - 85
    intro = ("Четыре тесно связанных вкладки: Финансы (выручка по периодам), Оплаты "
             "(транзакционный слой с реконсиляцией), Гости (LTV-сегментация), Отзывы (NPS). "
             "Владелец парка видит деньги и настроение гостей одновременно.")
    p_style = ParagraphStyle("p", fontName="Inter", fontSize=10, leading=14.5,
                              textColor=C["label2_real"], spaceAfter=10)
    p = Paragraph(intro, p_style)
    pw, ph = p.wrap(CONTENT_W, 200)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 4

    # 4 KPI
    kpis = [("2.3M₽", "общая\nвыручка"),
            ("370K₽", "средний\nLTV"),
            ("4 VIP", "из 12\nгостей"),
            ("91%", "NPS\nиндекс")]
    kw = CONTENT_W / 4
    for i, (v, l) in enumerate(kpis):
        cx = MARGIN_L + i*kw
        draw_mixed(c, cx, y - 22, v, "Inter-Ex", 22, color=C["label"])
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        for j, ln in enumerate(l.split("\n")[:2]):
            c.drawString(cx, y - 36 - j*10, ln)
    y -= 68

    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10.5, leading=13, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=9, leading=12.5, textColor=C["label"])
    
    items = [
        ("Финансы: 4 горизонта",
         "7 / 30 / 90 дней / всё время. За 30 дней — 2 305K₽ / 1 359 заказов / ср. день 77K. "
         "Разбивка по категориям (Отели 1 089K). Средний чек, выручка по методам оплаты."),
        ("Оплаты: мультиэквайринг",
         "Оплачено 101K · Ожидают 4 135K · Возвраты 66K. ЮКасса (карты/SBP/Apple Pay) — 78%, "
         "Robokassa (кошельки/QIWI/WebMoney) — 12%, Наличные — 8%. KPI казначея парка."),
        ("Гости: 360° карточка",
         "12 гостей · LTV 370K · 13.8 визитов. Евгений Иванов: LTV 4 073 237₽, 104 визита. "
         "Сегменты: VIP (4), Семьи (7), Корп (2), Постоянные (3). LTV-распределение: 1 / 8 / 2 / 1."),
    ]
    for head, body in items:
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(CONTENT_W, 30)
        ph_h.drawOn(c, MARGIN_L, y - phh)
        y -= phh + 2
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(CONTENT_W, 80)
        ph_b.drawOn(c, MARGIN_L, y - phb)
        y -= phb + 8

    # 3 скрина в ряд: финансы + оплаты + гости
    y -= 4
    gap = 10
    cell_w = (CONTENT_W - 2*gap) / 3
    cell_h = cell_w / (784/2024)
    avail_h = y - MARGIN_B - 40
    if cell_h > avail_h:
        cell_h = avail_h
        cell_w = cell_h * (784/2024)
        total_w = 3*cell_w + 2*gap
        x_start = MARGIN_L + (CONTENT_W - total_w)/2
    else:
        x_start = MARGIN_L
    
    screens = [
        ("01_28_55", "Финансы · 2 305K₽ за 30 дней."),
        ("01_30_44", "Оплаты · мультиэквайринг."),
        ("01_28_49", "Гости · LTV 370K₽ · 4 VIP."),
    ]
    for idx, (ts, caption) in enumerate(screens):
        cx = x_start + idx*(cell_w + gap)
        draw_screen(c, screen_path(ts), cx, y, cell_w, corner=8)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 7.5)
        cap_lines = wrap_text_lines(c, caption, "Inter", 7.5, cell_w - 4)
        for li, ln in enumerate(cap_lines[:2]):
            draw_mixed(c, cx, y - cell_h - 16 - li*11, ln, "Inter", 8, color=C["label2_real"])

    draw_page_frame(c, 45, 54, "IV · CRM · ФИНАНСЫ")
    c.showPage()


# ══════════════════════════════════════════════════
# 30 · Контент + Персонал + Governance (3-в-1)
# ══════════════════════════════════════════════════
def page_IV_content_staff(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "IV · CRM · КОНТЕНТ · ПЕРСОНАЛ · GOVERNANCE")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 30)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 40, "Контент, персонал, governance.")

    y = PAGE_H - MARGIN_T - 78
    intro = ("Три управляющих домена CRM: Контент-база (105 объектов через единую CMS), "
             "Персонал (24 сотрудника на 23 роли), Governance (аналитика, документы, настройки). "
             "Режим «Смотреть как роль» — уникальный инструмент аудита.")
    p_style = ParagraphStyle("p", fontName="Inter", fontSize=10, leading=14.5,
                              textColor=C["label2_real"], spaceAfter=10)
    p = Paragraph(intro, p_style)
    pw, ph = p.wrap(CONTENT_W, 200)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 4

    kpis = [("105", "объектов\nконтента"),
            ("24", "активных\nсотрудников"),
            ("23", "роли с\nправами"),
            ("97%", "здоровья\nсистемы")]
    kw = CONTENT_W / 4
    for i, (v, l) in enumerate(kpis):
        cx = MARGIN_L + i*kw
        draw_mixed(c, cx, y - 22, v, "Inter-Ex", 22, color=C["label"])
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        for j, ln in enumerate(l.split("\n")[:2]):
            c.drawString(cx, y - 36 - j*10, ln)
    y -= 68

    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10.5, leading=13, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=9, leading=12.5, textColor=C["label"])
    
    items = [
        ("Контент-база: 105 объектов в одной CMS",
         "Отели 13, рестораны 18, туры 13, мастер-классы 41, события 20. Inline-редактирование: "
         "название, slug, тип, тэглайн, цена, звёзды, номеров, контакты. Изменение — без публикации и деплоя."),
        ("Персонал: 24 сотрудника × 23 роли × 5 ступеней доступа",
         "Примеры ролей: Рест-партн (2), Кассир (1), Консьерж (1), Контент (1), Доставка (1), "
         "Директор (1), Рук. МК (1), Рук. развлечений (1). Каждая со своим набором прав и уведомлений."),
        ("«Смотреть как роль» — уникальный governance-инструмент",
         "Владелец в настройках CRM нажимает «Смотреть как…» и выбирает роль. Экран перестраивается, "
         "показывая ровно то, что видит этот сотрудник. Инструмент аудита прав, обучения новых "
         "сотрудников и проверки, что RLS-политики работают корректно."),
    ]
    for head, body in items:
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(CONTENT_W, 30)
        ph_h.drawOn(c, MARGIN_L, y - phh)
        y -= phh + 2
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(CONTENT_W, 80)
        ph_b.drawOn(c, MARGIN_L, y - phb)
        y -= phb + 8

    y -= 4
    # 3 скрина: контент, персонал, смотреть-как
    gap = 10
    cell_w = (CONTENT_W - 2*gap) / 3
    cell_h = cell_w / (784/2024)
    avail_h = y - MARGIN_B - 40
    if cell_h > avail_h:
        cell_h = avail_h
        cell_w = cell_h * (784/2024)
        total_w = 3*cell_w + 2*gap
        x_start = MARGIN_L + (CONTENT_W - total_w)/2
    else:
        x_start = MARGIN_L
    
    screens = [
        ("01_29_56", "Контент · 105 объектов, 13 отелей."),
        ("01_29_50", "Стафф · 24 активных, 9 руководителей."),
        ("01_31_39", "«Смотреть как роль» · аудит прав."),
    ]
    for idx, (ts, caption) in enumerate(screens):
        cx = x_start + idx*(cell_w + gap)
        draw_screen(c, screen_path(ts), cx, y, cell_w, corner=8)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 7.5)
        cap_lines = wrap_text_lines(c, caption, "Inter", 7.5, cell_w - 4)
        for li, ln in enumerate(cap_lines[:2]):
            draw_mixed(c, cx, y - cell_h - 16 - li*11, ln, "Inter", 8, color=C["label2_real"])

    draw_page_frame(c, 46, 54, "IV · CRM · GOVERNANCE")
    c.showPage()
