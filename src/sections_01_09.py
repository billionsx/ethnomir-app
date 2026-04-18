"""
Секции 01-08 PDF:
01 · Обложка
02 · Оглавление
03 · Разделитель I
04-05 · I Продукт в одном взгляде
06 · Разделитель II
07-09 · II Архитектура и стек
"""
import sys
sys.path.insert(0, '/home/claude/ethnomir-app/src')
from pdfkit import *

# ══════════════════════════════════════════════════
# 01 · COVER
# ══════════════════════════════════════════════════
def page_cover(c):
    # Верхний ярлык
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 5, "СПРАВОЧНИК ПРОДУКТА · АПРЕЛЬ 2026 · v2.2")

    # Hero-заголовок
    y = PAGE_H/2 + 90
    c.setFillColor(C["label"])
    c.setFont("Inter-Black", 72)
    c.drawString(MARGIN_L, y, "ethnomir")
    c.setFillColor(C["blue"])
    c.drawString(MARGIN_L + c.stringWidth("ethnomir", "Inter-Black", 72), y, ".app")

    # Подзаголовок
    y -= 55
    c.setFillColor(C["label"])
    c.setFont("Inter-Med", 20)
    c.drawString(MARGIN_L, y, "Цифровая операционная система")
    y -= 26
    c.drawString(MARGIN_L, y, "этнографического парка.")

    # Микро-описание
    y -= 35
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 11)
    lines = [
        "От покупки билета и бронирования отеля до управления номерным фондом,",
        "финансами, персоналом и маркетингом — в одном приложении.",
    ]
    for line in lines:
        c.drawString(MARGIN_L, y, line)
        y -= 15

    # Низ обложки — один мета-блок «Подготовлено для»
    y_meta = MARGIN_B + 70
    col_w = CONTENT_W / 3
    metas = [
        ("ПОДГОТОВЛЕНО ДЛЯ",   "Основателя и руководства\nпарка Этномир"),
    ]
    for i, (lbl, val) in enumerate(metas):
        cx = MARGIN_L + i*col_w
        # Разделитель сверху
        c.setStrokeColor(C["sep"])
        c.setLineWidth(0.5)
        c.line(cx, y_meta+40, cx + col_w - 15, y_meta+40)
        # Ярлык
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 7.5)
        c.drawString(cx, y_meta+28, lbl)
        # Значение
        c.setFillColor(C["label"])
        c.setFont("Inter-Med", 9.5)
        for j, vline in enumerate(val.split("\n")):
            c.drawString(cx, y_meta+14 - j*12, vline)

    # Очень низ — ethnomir.app
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    c.drawString(MARGIN_L, MARGIN_B, "ethnomir.app")
    c.drawRightString(PAGE_W - MARGIN_R, MARGIN_B, "Апрель 2026")
    c.showPage()


# ══════════════════════════════════════════════════
# 02 · TABLE OF CONTENTS
# ══════════════════════════════════════════════════
def page_toc(c):
    # Метка
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T, "02 · ОГЛАВЛЕНИЕ")

    # Заголовок
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 42)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 55, "Содержание")

    # Короткое описание
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 10.5)
    for j, line in enumerate([
        "Документ построен от общего к частному: пять слоёв — от первого взгляда",
        "на продукт до подробного описания каждого модуля и роли.",
    ]):
        c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 85 - j*14, line)

    # Блоки разделов
    sections = [
        ("I",   "Продукт в одном взгляде",
         "Что это, для кого, состояние системы, команда, рынок, KPI, смыслы, столпы.", "04-11", C["sec_I"]),
        ("II",  "Архитектура и стек",
         "Три слоя системы, 136 таблиц, безопасность, CI/CD, дизайн-язык iOS 26+.", "12-16", C["sec_II"]),
        ("III", "Функциональные модули",
         "Философия линейки, карта 5 вкладок, 14 модулей, геймификация и баллы.", "17-34", C["sec_III"]),
        ("IV",  "CRM — операционная система парка",
         "Режим «Владелец», 24+ вкладки управления, реестр 23 модулей.", "35-41", C["sec_IV"]),
        ("V",   "Ценностные карты по аудиториям",
         "Влияние приложения, основатель, гости, партнёры, франчайзи, инвесторы, персонал.", "42-47", C["sec_V"]),
        ("A",   "Приложения",
         "Внешний цифровой контур (ethnomir.ru, ethnomir.app) и юридический контур (10 документов).", "48-49", C["label"]),
    ]

    y = PAGE_H - MARGIN_T - 135
    for roman, title, desc, pp, color in sections:
        # Цветной блок слева
        c.setFillColor(color)
        c.roundRect(MARGIN_L, y - 64, 44, 58, 6, fill=1, stroke=0)
        c.setFillColor(HexColor("#FFFFFF"))
        c.setFont("Inter-Ex", 22)
        c.drawCentredString(MARGIN_L + 22, y - 38, roman)
        # Заголовок
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 16)
        c.drawString(MARGIN_L + 58, y - 18, title)
        # Описание
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9.5)
        c.drawString(MARGIN_L + 58, y - 36, desc)
        # Страницы
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 9)
        c.drawRightString(PAGE_W - MARGIN_R, y - 18, pp)
        # Разделитель снизу
        c.setStrokeColor(C["sep_light"])
        c.setLineWidth(0.3)
        c.line(MARGIN_L + 58, y - 60, PAGE_W - MARGIN_R, y - 60)
        y -= 76

    draw_page_frame(c, 2, 50, "ОГЛАВЛЕНИЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 03 · SECTION I COVER
# ══════════════════════════════════════════════════
def page_cover_I(c):
    c.setFillColor(C["sec_I"])
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # Верхний ярлык
    c.setFillColor(HexColor("#FFFFFFB0"))
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T, "СЛОЙ I · 03")

    # Заголовок — без водяного знака
    y = PAGE_H/2 + 70
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Inter-Ex", 56)
    c.drawString(MARGIN_L, y, "Продукт")
    c.drawString(MARGIN_L, y - 62, "в одном")
    c.drawString(MARGIN_L, y - 124, "взгляде.")

    # Подзаголовок
    y = y - 170
    c.setFillColor(HexColor("#FFFFFFC8"))
    c.setFont("Inter-Med", 13)
    for line in ["Что такое ethnomir.app, для кого он построен,",
                 "какие задачи решает и какими цифрами",
                 "измеряется на сегодняшний день."]:
        c.drawString(MARGIN_L, y, line)
        y -= 18

    # Низ — мета
    c.setFillColor(HexColor("#FFFFFFA0"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN_L, MARGIN_B, "ethnomir.app · Справочник продукта")
    c.drawRightString(PAGE_W - MARGIN_R, MARGIN_B, "03 / 50")
    c.showPage()


# ══════════════════════════════════════════════════
# 04 · I.1 Одно приложение. Весь парк. (60/40 с главным скрином)
# ══════════════════════════════════════════════════
def page_I_1(c):
    # Eyebrow
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    # Заголовок — меньше размер и выше, чтобы текст и скрин не пересекались
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Одно приложение.")
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 80, "Весь парк.")

    # Без скрина — текст и KPI занимают всю ширину страницы
    col_text_w = CONTENT_W

    # Лид — три абзаца: проблема → решение → связность
    y = PAGE_H - MARGIN_T - 115
    p_style = ParagraphStyle("p", fontName="Inter", fontSize=10.5, leading=15, textColor=C["label"], spaceAfter=8)

    problem = ("За 18 лет в Этномире выстроена колоссальная инфраструктура — отели, "
               "рестораны, мастерские, музеи, фестивали, образовательные программы — "
               "но у этого хозяйства до сих пор нет единой цифровой витрины. Половина "
               "возможностей парка остаётся невидимой для гостя, партнёры работают в "
               "разнобой, управление опирается на ручные процессы.")
    p0 = Paragraph(problem, p_style)
    _, ph0 = p0.wrap(col_text_w, 400)
    p0.drawOn(c, MARGIN_L, y - ph0)
    y = y - ph0 - 8

    intro = ("ethnomir.app — цифровая платформа крупнейшего этнографического парка России. "
             "Она заменяет до пятнадцати отдельных систем, которые обычно обслуживают парк "
             "такого масштаба: кассу, PMS отелей, POS ресторанов, CRM, маркетплейс услуг, "
             "инвест-лендинг, франчайзинговый портал, полтора десятка лендингов.")
    p = Paragraph(intro, p_style)
    pw, ph = p.wrap(col_text_w, 400)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 8

    body2 = ("Всё живёт в единой кодовой базе, на единой базе данных, с единым дизайн-языком "
             "iOS 26+ Liquid Glass — интерфейс спроектирован pixel-perfect по эталонам Apple "
             "для iOS 26+ — и с единой моделью гостя: от первого визита до владения "
             "недвижимостью рядом с парком.")
    p2 = Paragraph(body2, p_style)
    pw, ph2 = p2.wrap(col_text_w, 400)
    p2.drawOn(c, MARGIN_L, y - ph2)
    y = y - ph2 - 24

    # KPI 5 в ряд на всю ширину
    kpi_data = [
        ("1M+",  "гостей в год"),
        ("13",   "отелей"),
        ("140га","территория"),
        ("22",   "лендинга"),
        ("120+", "экранов"),
    ]
    cell_w = CONTENT_W / 5
    for i, (v, l) in enumerate(kpi_data):
        cx = MARGIN_L + i * cell_w
        # Auto-fit: если value длинный — уменьшаем кегль, чтобы был зазор до соседа
        fs = 26
        while fs > 16 and c.stringWidth(v, "Inter-Ex", fs) > cell_w - 12:
            fs -= 1
        c.setFillColor(C["label"])
        c.setFont("Inter-Ex", fs)
        c.drawString(cx, y - fs, v)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9)
        for j, ln in enumerate(wrap_text_lines(c, l, "Inter", 9, cell_w - 8)[:2]):
            c.drawString(cx, y - fs - 10 - j*11, ln)

    # Скрин убран — его перенесли на стр.15.
    # (ранее здесь был draw_screen 01_06_56)

    # Низ — «Для кого построено приложение» с аудиториями
    y_foot = MARGIN_B + 160
    draw_rule(c, MARGIN_L, y_foot + 22, CONTENT_W, color=C["sep"], weight=0.5)
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 13)
    c.drawString(MARGIN_L, y_foot + 4, "Для кого построено приложение")

    audiences = [
        ("Гости парка",   "Билеты, бронирование, доставка, мастер-классы, коллекция стран-штампов, кошелёк баллов, PRO-подписка.", C["role_guest"]),
        ("Партнёры",      "Рестораны, СПА, этнодворы, прокаты — кабинет, статистика, управление контентом и потоком броней.", C["role_partner"]),
        ("Инвесторы",     "Каталог недвижимости ROI до 22%, рост стоимости участков +233% за 5 лет, арендный потенциал.", C["role_investor"]),
        ("Франчайзи",     "Шестишаговый процесс открытия парка в своём городе. Три масштаба: центр, парк 10 га, парк 20+ га.", C["role_franchise"]),
        ("Персонал",      "CRM в 24 вкладках: от броней и календаря до номерного фонда, финансов, рассылок и цен.", C["role_staff"]),
        ("Основатель",    "Режим «Владелец»: полная аналитика, 10+ агрегированных KPI, «смотреть как роль».", C["role_founder"]),
    ]
    # Каждая строка: цветная точка + название (жирное) + описание (серое, через Paragraph для переноса)
    y_row = y_foot - 12
    label_w = 75
    desc_w = CONTENT_W - label_w - 20
    p_desc = ParagraphStyle("desc", fontName="Inter", fontSize=8.5, leading=11, textColor=C["label2_real"])
    for title, desc, color in audiences:
        c.setFillColor(color)
        c.circle(MARGIN_L + 4, y_row + 3.5, 3.5, fill=1, stroke=0)
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 9)
        c.drawString(MARGIN_L + 14, y_row, title)
        # Description через Paragraph с ограничением по ширине
        p = Paragraph(desc, p_desc)
        pw, ph = p.wrap(desc_w, 40)
        p.drawOn(c, MARGIN_L + 14 + label_w, y_row - ph + 9)
        y_row -= max(14, ph + 4)

    draw_page_frame(c, 4, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 05 · I.2 Состояние системы на 17 апреля 2026
# ══════════════════════════════════════════════════
def page_I_2(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    # Заголовок
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Состояние системы.")
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 80, "Апрель 2026.")

    # Лид
    y = PAGE_H - MARGIN_T - 120
    intro = ("Цифры ниже получены прямыми запросами к production-инфраструктуре. Это не "
             "маркетинговые оценки — это реальный снимок живой системы.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15, max_width=CONTENT_W, color=C["label2_real"])

    # Три группы метрик в одной сетке 4×3
    y -= 20
    c.setFillColor(C["label"])
    c.setFont("Inter-Semi", 9)
    draw_eyebrow(c, MARGIN_L, y, "КОД И ИНФРАСТРУКТУРА")
    y -= 15

    group1 = [
        ("10 789", "строк TSX в главном\nфайле приложения"),
        ("163",    "функциональных\nкомпонента"),
        ("87",     "Edge Functions\nбизнес-логики"),
        ("97%",    "здоровья системы\nпо monitoring-score"),
    ]
    y_start = y
    cell_w = CONTENT_W / 4
    for i, (v, l) in enumerate(group1):
        cx = MARGIN_L + i*cell_w
        c.setFillColor(C["label"])
        c.setFont("Inter-Ex", 30)
        c.drawString(cx, y - 30, v)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        for j, line in enumerate(l.split("\n")):
            c.drawString(cx, y - 48 - j*11, line)
    y -= 75
    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 16

    draw_eyebrow(c, MARGIN_L, y, "БАЗА ДАННЫХ POSTGRESQL")
    y -= 15
    group2_r1 = [
        ("136", "таблиц в схеме public"),
        ("146", "PL/pgSQL функций"),
        ("239", "RLS-политик безопасности"),
        ("149", "триггеров автоматизации"),
    ]
    group2_r2 = [
        ("15",   "материализованных view"),
        ("9",    "расширений Postgres"),
        ("87",   "Edge Functions логики"),
        ("19",   "триггеров sync CRM/Client"),
    ]
    for row_idx, grp in enumerate([group2_r1, group2_r2]):
        for i, (v, l) in enumerate(grp):
            cx = MARGIN_L + i*cell_w
            c.setFillColor(C["label"])
            c.setFont("Inter-Ex", 24)
            c.drawString(cx, y - 24 - row_idx*56, v)
            c.setFillColor(C["label2_real"])
            c.setFont("Inter", 8.5)
            c.drawString(cx, y - 40 - row_idx*56, l)
    y -= 116
    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 16

    draw_eyebrow(c, MARGIN_L, y, "ГЕЙМИФИКАЦИЯ И ЛОЯЛЬНОСТЬ")
    y -= 15
    gam = [
        ("30",   "достижений в системе"),
        ("18",   "правил начисления баллов"),
        ("5",    "уровней лояльности"),
        ("96/85", "стран · регионов РФ"),
    ]
    for i, (v, l) in enumerate(gam):
        cx = MARGIN_L + i*cell_w
        c.setFillColor(C["label"])
        c.setFont("Inter-Ex", 24)
        c.drawString(cx, y - 24, v)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        c.drawString(cx, y - 40, l)
    y -= 58
    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 16

    draw_eyebrow(c, MARGIN_L, y, "ТРАНЗАКЦИОННАЯ АКТИВНОСТЬ (СГЕНЕРИРОВАНЫ И ПРОТЕСТИРОВАНЫ ДЛЯ ПРИМЕРА)")
    y -= 15

    # 3 крупные метрики + 3 поменьше — с draw_mixed для ₽
    big_metrics = [
        ("2.7M₽", "оборот по 78 бронированиям", C["green"]),
        ("2.1M₽", "оборот по 59 заказам доставки", C["blue"]),
        ("1.6M₽", "оборот по 54 платным чекам", C["purple"]),
    ]
    big_w = CONTENT_W / 3
    for i, (v, l, col) in enumerate(big_metrics):
        cx = MARGIN_L + i*big_w
        draw_mixed(c, cx, y - 30, v, "Inter-Ex", 28, color=col)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9)
        c.drawString(cx, y - 48, l)
    y -= 80

    small = [
        ("2 312", "записей audit-лога"),
        ("1 203", "активных QR-кодов"),
        ("309",   "отзывов гостей, NPS 91%"),
    ]
    for i, (v, l) in enumerate(small):
        cx = MARGIN_L + i*big_w
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 18)
        c.drawString(cx, y - 18, v)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9)
        c.drawString(cx, y - 32, l)
    y -= 60

    # Цитата убрана — страница стала плотнее после добавления блока геймификации.

    draw_page_frame(c, 5, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 06 · I.2a — КОМАНДА
# ══════════════════════════════════════════════════
def page_I_team(c):
    """Команда. McKinsey one-pager: две колонки — имя слева крупно,
    роль и направления справа; hairline-разделители между партнёрами."""
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    # Заголовок
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Команда.")

    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 13)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 72,
                 "Кто стоит за архитектурой, продуктом и внедрением ethnomir.app.")

    # Лид — два абзаца: модель взаимодействия + роль ИИ
    y = PAGE_H - MARGIN_T - 100
    p_intro = ParagraphStyle("intro", fontName="Inter", fontSize=10, leading=14,
                             textColor=C["label2_real"], spaceAfter=8)
    intro1 = ("Партнёры взаимодействуют между собой на стратегическом уровне, "
              "а затем декомпозируют задачи внутри своих рабочих групп — "
              "аналитикам, разработчикам, дата-инженерам, верстальщикам, "
              "дизайнерам, копирайтерам. Спроектировав и реализовав часть "
              "функционала, партнёры привлекают профильных внешних "
              "консультантов для независимой обратной связи и краш-теста "
              "каждого конкретного блока работы.")
    intro2 = ("ИИ локально в каждой сфере используется как рабочий инструмент "
              "ускорения. Архитектура, логика баз данных, защита информации, "
              "продуктовые решения, связки программ лояльности, пиксельный "
              "интерфейс — определяются именно управляющими партнёрами.")
    p1 = Paragraph(intro1, p_intro)
    _, ph1 = p1.wrap(CONTENT_W, 200)
    p1.drawOn(c, MARGIN_L, y - ph1)
    y = y - ph1 - 10
    p2 = Paragraph(intro2, p_intro)
    _, ph2 = p2.wrap(CONTENT_W, 200)
    p2.drawOn(c, MARGIN_L, y - ph2)
    y = y - ph2 - 16

    # Hairline сверху списка
    c.setStrokeColor(C["label"])
    c.setLineWidth(0.8)
    c.line(MARGIN_L, y, MARGIN_L + CONTENT_W, y)

    # Две колонки: 30% — номер+имя, остальное — роль+направления
    col_left_w = CONTENT_W * 0.30
    col_right_x = MARGIN_L + col_left_w + 16
    col_right_w = CONTENT_W - col_left_w - 16

    members = [
        ("01", "Евгений", "Иванов", None,
         "Продакт-оунер и основатель Billions X",
         "Стратегия · Смыслы · Архитектура · Продуктовая линейка · Интерфейс · UX/UI"),
        ("02", "Борис", "Прядкин", None,
         "Коммерческий директор и со-основатель Billions X",
         "Архитектура · Логика продаж · Система лояльности"),
        ("03", "Кирилл", "Романов", None,
         "Управляющий партнёр Billions X · недвижимость и застройщики",
         "Архитектура и логика внедрения продажи объектов недвижимости. "
         "Упаковка инвестиционной и жилой недвижимости. Методология продажи. "
         "Многолетний опыт в РФ."),
        ("04", "*****", "******", "(из-за вопросов конфиденциальности)",
         "Главный технический архитектор баз данных и ИИ приложения Этномира",
         "Действующий ведущий дата-инженер платформы данных и ИИ в "
         "Booking.com, Нидерланды."),
    ]

    p_role = ParagraphStyle("role", fontName="Inter-Med", fontSize=10.5,
                            leading=14, textColor=C["label2_real"])
    p_dir = ParagraphStyle("dir", fontName="Inter", fontSize=10,
                           leading=14.5, textColor=C["label"])

    y -= 22  # отступ после верхней линии

    for idx, (num, first, last, note, role, directions) in enumerate(members):
        # Левая колонка: номер сверху мелко, имя крупно, note под именем
        c.setFillColor(C["label3"])
        c.setFont("Inter-Med", 9)
        c.drawString(MARGIN_L, y - 2, num)

        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 20)
        c.drawString(MARGIN_L, y - 24, first)
        c.drawString(MARGIN_L, y - 48, last)

        # Подпись под именем (serой, если есть)
        if note:
            p_note = ParagraphStyle("note", fontName="Inter", fontSize=8.5,
                                    leading=11, textColor=C["label2_real"])
            pn = Paragraph(note, p_note)
            _, pn_h = pn.wrap(col_left_w - 4, 40)
            pn.drawOn(c, MARGIN_L, y - 48 - pn_h - 4)

        # Правая колонка: роль + направления
        p = Paragraph(role, p_role)
        pw, ph_r = p.wrap(col_right_w, 40)
        p.drawOn(c, col_right_x, y - ph_r)

        p = Paragraph(directions, p_dir)
        pw, ph_d = p.wrap(col_right_w, 140)
        p.drawOn(c, col_right_x, y - ph_r - 8 - ph_d)

        # Высота блока — максимум из высоты левой (60pt) и правой
        right_total = ph_r + 8 + ph_d
        block_h = max(58, right_total) + 22  # +воздух

        y -= block_h

        # Hairline между блоками
        if idx < len(members) - 1:
            c.setStrokeColor(C["sep_light"])
            c.setLineWidth(0.4)
            c.line(MARGIN_L, y + 8, MARGIN_L + CONTENT_W, y + 8)

    draw_page_frame(c, 6, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()




# ══════════════════════════════════════════════════
# 06 · I.3 Мировой рынок суперприложений
# ══════════════════════════════════════════════════
def page_I_3_market(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Рынок суперприложений.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74, "В какую глобальную категорию вписан ethnomir.app.")

    y = PAGE_H - MARGIN_T - 110
    intro = ("Суперприложение — одно мобильное приложение, в котором клиент получает доступ "
             "к десяткам сервисов в единой точке входа. Модель доказана в четырёх регионах мира "
             "и растёт темпами, опережающими любой другой сегмент IT-рынка.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15, max_width=CONTENT_W, color=C["label2_real"])

    # Три ключевые цифры рынка
    y -= 14
    draw_eyebrow(c, MARGIN_L, y, "ГЛОБАЛЬНЫЙ ОБЪЁМ РЫНКА")
    y -= 18
    market_kpis = [
        ("$121", "млрд\nобъём рынка 2025", C["blue"]),
        ("$969", "млрд\nпрогноз 2033", C["green"]),
        ("30.1%", "среднегодовой\nрост CAGR", C["orange"]),
    ]
    big_w = CONTENT_W / 3
    for i, (v, l, col) in enumerate(market_kpis):
        cx = MARGIN_L + i*big_w
        draw_mixed(c, cx, y - 34, v, "Inter-Ex", 34, color=col)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9.5)
        for j, ln in enumerate(l.split("\n")):
            c.drawString(cx, y - 54 - j*12, ln)
    y -= 90
    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 20

    # Четыре примера — таблица
    draw_eyebrow(c, MARGIN_L, y, "ЧЕТЫРЕ ДОКАЗАННЫХ ПРИМЕРА")
    y -= 8
    examples = [
        ["ПРИЛОЖЕНИЕ", "МАСШТАБ", "ЧТО ОБЪЕДИНЯЕТ"],
        ["WeChat", "$80+ млрд/год · 1.3 млрд пользователей",
         "Мессенджер превратили в операционную систему повседневной жизни: платежи, e-commerce, мини-программы, госуслуги."],
        ["Grab", "$2.3 млрд/год · 187 млн пользователей",
         "Вызов такси в Юго-Восточной Азии вырос в доставку, платежи, страхование, отели, кредитование. Вытеснил десятки отдельных приложений."],
        ["Яндекс Go", "₽180+ млрд/год · 50+ млн пользователей",
         "Российский суперапп: такси, доставка, маркет, еда, путешествия, подписки. Доказал модель на российском рынке."],
        ["Disney My Experience", "300K+ активных в неделю",
         "Приложение тематического парка Disney: билеты, бронирования, карта, очереди, MagicBands. Увеличило расходы посетителей на $45-200 на человека."],
    ]
    t = ios_table(examples, [120, 180, CONTENT_W - 300], head=True, compact=True)
    tw, th = t.wrap(CONTENT_W, 500)
    t.drawOn(c, MARGIN_L, y - th)
    y = y - th - 14

    # Итог — плашка с цитатой, высота считается по контенту
    p_i = ParagraphStyle("it", fontName="Inter-Semi", fontSize=10, leading=14, textColor=C["label"])
    p = Paragraph("ethnomir.app строится в этой же парадигме — одна точка входа, которая объединяет билеты, "
                  "отели, рестораны, мастер-классы, события, услуги, паспорт, CRM и инвест-лендинги в единую "
                  "цифровую среду крупнейшего этнографического парка России.", p_i)
    pw, ph = p.wrap(CONTENT_W - 28, 200)
    box_h = ph + 24
    c.setFillColor(C["bg"])
    c.roundRect(MARGIN_L, y - box_h, CONTENT_W, box_h, 10, fill=1, stroke=0)
    p.drawOn(c, MARGIN_L + 14, y - ph - 12)

    draw_page_frame(c, 7, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 07 · I.4 Ожидаемый эффект (research-backed KPIs)
# ══════════════════════════════════════════════════
def page_I_4_kpi(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Ожидаемый эффект.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74, "Четыре KPI, подтверждённые мировыми исследованиями.")

    y = PAGE_H - MARGIN_T - 110
    intro = ("Отраслевые исследования — Revinate, Omnico, Attractions.io, McKinsey — "
             "показывают предсказуемые коэффициенты роста для парков и гостиничных комплексов, "
             "внедряющих суперприложение с программой лояльности и персонализацией.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15, max_width=CONTENT_W, color=C["label2_real"])

    # Четыре KPI в grid 2×2
    y -= 18
    kpis = [
        ("×2.5", "повторные визиты",
         "Программы лояльности увеличивают удержание гостей в 2-3 раза. Участники обеспечивают 52.8% заполняемости номерного фонда.",
         "Revinate 2024", C["green"]),
        ("×2", "средний чек",
         "Внедрение мобильных технологий увеличивает расходы посетителей на $45-200 на человека. Лояльные тратят на 22.4% больше и остаются на 28% дольше.",
         "Omnico · Revinate 2024", C["blue"]),
        ("×3", "конверсия в бронь",
         "47% гостей платят больше за персонализацию, 81.6% — за проход без очереди, 72.6% — за ранний доступ. Прямой канал исключает комиссии 15-25%.",
         "Attractions.io 2025", C["purple"]),
        ("×3-4", "LTV гостя",
         "Геймификация + баллы + достижения + PRO-подписка — увеличивают пожизненную ценность клиента в 3-4 раза. Одноразовый посетитель становится амбассадором.",
         "McKinsey Loyalty Report 2023", C["orange"]),
    ]
    gap = 16
    cell_w = (CONTENT_W - gap) / 2
    cell_h = 175
    p_body = ParagraphStyle("kb", fontName="Inter", fontSize=9, leading=12.5, textColor=C["label2_real"])
    for idx, (mult, name, desc, source, color) in enumerate(kpis):
        col = idx % 2
        row = idx // 2
        cx = MARGIN_L + col*(cell_w + gap)
        cy_top = y - row*(cell_h + gap)
        # Большая цифра
        draw_mixed(c, cx, cy_top - 44, mult, "Inter-Ex", 44, color=color)
        # Название
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 12)
        c.drawString(cx, cy_top - 64, name)
        # Описание
        p = Paragraph(desc, p_body)
        pw, ph = p.wrap(cell_w - 4, 80)
        p.drawOn(cx, cy_top - 80 - ph) if False else p.drawOn(c, cx, cy_top - 80 - ph)
        # Источник
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 8)
        c.drawString(cx, cy_top - 80 - ph - 14, "ИСТОЧНИК · " + source.upper())
    y -= 2*cell_h + gap + 10

    # Итог
    y -= 6
    p_sum = ParagraphStyle("s", fontName="Inter-Semi", fontSize=10.5, leading=14.5, textColor=C["label"])
    p = Paragraph("При консервативных темпах роста среднего чека на 20% и повторных визитов на 30% "
                  "— инвестиции в платформу окупаются в течение 12-18 месяцев после запуска.", p_sum)
    pw, ph = p.wrap(CONTENT_W, 80)
    p.drawOn(c, MARGIN_L, y - ph)

    draw_page_frame(c, 9, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 09 · I.5 Смыслы. Гости (NEW)
# ══════════════════════════════════════════════════
def page_I_5_meaning_guest(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Смыслы для гостей.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74,
                 "Что приложение даёт каждому посетителю Этномира.")

    # Лид
    y = PAGE_H - MARGIN_T - 108
    intro = ("Восемь смысловых крючков, каждый из которых — отдельный вход в экосистему парка. "
             "Ниже — короткая карта-индекс; подробности — в соответствующих модулях секции III.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15,
                        max_width=CONTENT_W, color=C["label2_real"])
    y -= 20

    # 8 карточек в сетке 2×4
    hooks = [
        ("01", "Весь парк на ладони",
         "Главная лента «Сегодня»: живые события, погода, календарь, карта территории 140 га.",
         "стр. 20 · M00", C["role_guest"]),
        ("02", "Цифровой паспорт",
         "Персональный профиль с уровнем, 48/96 странами, 30 достижениями, кошельком баллов.",
         "стр. 26 · M04", C["role_guest"]),
        ("03", "96 стран. Коллекция",
         "У каждого павильона — физический QR. Сканирование открывает страну, +15-30 баллов.",
         "стр. 27 · M04", C["role_guest"]),
        ("04", "Билеты за 30 секунд",
         "Входные, групповые, корпоративные. Динамическая цена, QR на входе, цифровой чек.",
         "стр. 21 · M01", C["role_guest"]),
        ("05", "13 отелей. Один клик",
         "От русской избы до СПА-отеля «Шри-Ланка». Фильтры, календарь, мгновенное подтверждение.",
         "стр. 23 · M02", C["role_guest"]),
        ("06", "41 мастер-класс",
         "Гончарный круг, роспись, кузнечное дело, кулинария. Онлайн-запись и оплата в приложении.",
         "стр. 22 · M01", C["role_guest"]),
        ("07", "18 кухонь народов мира",
         "Рестораны парка с меню и предзаказом. Фильтры по диете, аллергенам, стоимости.",
         "стр. 25 · M03", C["role_guest"]),
        ("08", "22 сервиса парка",
         "Баня, прокат, экскурсии, детские программы — все в одной точке входа, без звонков.",
         "стр. 25 · M03", C["role_guest"]),
    ]
    gap_x = 14
    gap_y = 16
    cell_w = (CONTENT_W - gap_x) / 2
    cell_h = 105
    p_desc = ParagraphStyle("hd", fontName="Inter", fontSize=9.5, leading=13,
                            textColor=C["label"])
    for idx, (num, title, desc, ref, color) in enumerate(hooks):
        col = idx % 2
        row = idx // 2
        cx = MARGIN_L + col*(cell_w + gap_x)
        cy_top = y - row*(cell_h + gap_y)
        # Цветная вертикальная полоска слева
        c.setFillColor(color)
        c.rect(cx, cy_top - cell_h + 8, 3, cell_h - 16, fill=1, stroke=0)
        # Номер
        c.setFillColor(C["label3"])
        c.setFont("Inter-Med", 9)
        c.drawString(cx + 12, cy_top - 6, num)
        # Название
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 12)
        c.drawString(cx + 12, cy_top - 24, title)
        # Описание
        p = Paragraph(desc, p_desc)
        _, ph = p.wrap(cell_w - 16, 80)
        p.drawOn(c, cx + 12, cy_top - 36 - ph)
        # Ссылка
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 8)
        c.drawString(cx + 12, cy_top - cell_h + 14, "→ " + ref)

    draw_page_frame(c, 10, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 10 · I.6 Смыслы. Бизнес (NEW)
# ══════════════════════════════════════════════════
def page_I_6_meaning_business(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Смыслы для бизнеса.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74,
                 "Что приложение даёт партнёрам, руководству и основателю.")

    y = PAGE_H - MARGIN_T - 108
    intro = ("Девять крючков управленческой ценности. Каждая роль получает свой срез — "
             "с инструментами контроля, каналами монетизации, форматами сотрудничества.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15,
                        max_width=CONTENT_W, color=C["label2_real"])
    y -= 20

    hooks = [
        ("01", "Полный контроль. Каждый процесс",
         "Загрузка номеров, воронка сделок, финансы, активность гостей — в реальном времени из одного дашборда.",
         "стр. 36-41 · CRM", C["role_founder"]),
        ("02", "Все дашборды. Одним свайпом",
         "KPI, спарклайны, NPS, конверсия, средний чек, ROI кампаний — 24+ вкладки управления по доменам.",
         "стр. 36-41 · CRM", C["role_founder"]),
        ("03", "Контроль каждого партнёра",
         "Ресторан, отель, этнодвор — внутри единой системы. Партнёр видит свои брони, УК задаёт стандарт.",
         "стр. 45 · партнёры", C["role_partner"]),
        ("04", "Маркетплейс без комиссий",
         "Собственная платформа продаж — каждое направление продаётся напрямую, без посредников 15-25%.",
         "стр. 23-25 · M02-M03", C["role_partner"]),
        ("05", "Новое направление — через CRM",
         "Добавить ресторан, услугу, открыть район парка — через админ-интерфейс, без разработчика.",
         "стр. 41 · контент и персонал", C["role_partner"]),
        ("06", "Инструмент застройщика",
         "Инвестиционная недвижимость встроена в приложение — тысячи лояльных гостей видят объекты каждый день.",
         "стр. 24 · M02_ext · стр.46", C["role_investor"]),
        ("07", "Инструмент франчайзера",
         "Вся архитектура, геймификация, CRM и монетизация уже готовы. Франчайзи получает систему с первого дня.",
         "стр. 32 · M08 · стр.46", C["role_franchise"]),
        ("08", "Суверенитет над данными",
         "Всё живёт в единой PostgreSQL-базе, принадлежащей парку. Никаких SaaS-подписок с внешними условиями.",
         "стр. 13-15 · архитектура", C["role_founder"]),
        ("09", "Вклад в наследие",
         "Приложение оцифровывает культуры 96 народов мира. Не расход. Инвестиция в вечность.",
         "стр. 44 · основатель", C["role_founder"]),
    ]
    gap_x = 14
    gap_y = 10
    # Используем 3×3 чтобы 9 влезло
    cols = 3
    rows = 3
    cell_w = (CONTENT_W - gap_x*(cols-1)) / cols
    cell_h = 142
    p_desc = ParagraphStyle("hd", fontName="Inter", fontSize=9, leading=12.5,
                            textColor=C["label"])
    for idx, (num, title, desc, ref, color) in enumerate(hooks):
        col = idx % cols
        row = idx // cols
        cx = MARGIN_L + col*(cell_w + gap_x)
        cy_top = y - row*(cell_h + gap_y)
        c.setFillColor(color)
        c.rect(cx, cy_top - cell_h + 8, 3, cell_h - 16, fill=1, stroke=0)
        c.setFillColor(C["label3"])
        c.setFont("Inter-Med", 9)
        c.drawString(cx + 12, cy_top - 6, num)
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 10.5)
        # Название с переносом
        for j, ln in enumerate(wrap_text_lines(c, title, "Inter-Bold", 10.5, cell_w - 16)[:2]):
            c.drawString(cx + 12, cy_top - 22 - j*13, ln)
        p = Paragraph(desc, p_desc)
        _, ph = p.wrap(cell_w - 16, 80)
        p.drawOn(c, cx + 12, cy_top - 52 - ph)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 7.5)
        c.drawString(cx + 12, cy_top - cell_h + 12, "→ " + ref)

    draw_page_frame(c, 11, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 11 · I.7 Четыре столпа приложения (NEW)
# ══════════════════════════════════════════════════
def page_I_7_four_pillars(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Четыре столпа.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74,
                 "Принципы, заложенные в архитектуру как фундамент.")

    y = PAGE_H - MARGIN_T - 108
    intro = ("Над тремя продуктовыми принципами (понятность — непрерывность — увеличение, стр.18) "
             "стоят четыре стратегических столпа, определяющих ДНК всего приложения.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15,
                        max_width=CONTENT_W, color=C["label2_real"])
    y -= 24

    pillars = [
        ("I.", "Геймификация",
         "Каждое действие гостя — от покупки билета до публикации отзыва — вознаграждается баллами. "
         "30 достижений, коллекции 96 стран и 85 регионов, уровни и PRO-подписка. Парк становится игрой, "
         "в которую хочется возвращаться.",
         C["green"]),
        ("II.", "Дашбордность",
         "Реальные данные в реальном времени. CRM с 24+ вкладками, KPI-дашборды, спарклайны, аналитика "
         "загрузки. Каждый сотрудник видит свою зону ответственности, каждый руководитель — полную картину.",
         C["blue"]),
        ("III.", "Монетизация",
         "Прямые продажи без агрегаторов: билеты, номера, мастер-классы, еда, аренда, мероприятия. "
         "Динамическое ценообразование. Fast-pass. Подарочные сертификаты. Франшиза и инвестиционная "
         "недвижимость — отдельные каналы.",
         C["orange"]),
        ("IV.", "Вдохновение",
         "Приложение — это не утилита, а медиа. Красивый контент, истории, анимации, культурные открытия. "
         "Гость вдохновляется до визита, погружается во время и делится после. Каждый экран — повод вернуться.",
         C["purple"]),
    ]
    gap_x = 16
    gap_y = 14
    cell_w = (CONTENT_W - gap_x) / 2
    cell_h = 200
    p_body = ParagraphStyle("pb", fontName="Inter", fontSize=10, leading=13.5,
                            textColor=C["label"])
    for idx, (rn, name, desc, color) in enumerate(pillars):
        col = idx % 2
        row = idx // 2
        cx = MARGIN_L + col*(cell_w + gap_x)
        cy_top = y - row*(cell_h + gap_y)
        # Цветной фон
        c.setFillColor(HexColor("#FAFAFA"))
        c.roundRect(cx, cy_top - cell_h, cell_w, cell_h, 12, fill=1, stroke=0)
        # Римская цифра крупно цветом
        c.setFillColor(color)
        c.setFont("Inter-Ex", 42)
        c.drawString(cx + 18, cy_top - 52, rn)
        # Название
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 17)
        c.drawString(cx + 18, cy_top - 76, name)
        # Описание
        p = Paragraph(desc, p_body)
        _, ph = p.wrap(cell_w - 36, 160)
        p.drawOn(c, cx + 18, cy_top - 94 - ph)

    draw_page_frame(c, 12, 50, "I · ПРОДУКТ В ОДНОМ ВЗГЛЯДЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# 12 · SECTION II COVER (была 08)
# ══════════════════════════════════════════════════
def page_cover_II(c):
    c.setFillColor(C["sec_II"])
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFFB0"))
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T, "СЛОЙ II · 13")

    y = PAGE_H/2 + 70
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Inter-Ex", 56)
    c.drawString(MARGIN_L, y, "Архитектура")
    c.drawString(MARGIN_L, y - 62, "и стек.")

    y -= 120
    c.setFillColor(HexColor("#FFFFFFC8"))
    c.setFont("Inter-Med", 13)
    for line in [
        "Как устроено приложение на техническом",
        "уровне. Какие инструменты выбраны.",
        "Почему именно эти. Какая следует из этого",
        "экономика поддержки.",
    ]:
        c.drawString(MARGIN_L, y, line)
        y -= 18

    c.setFillColor(HexColor("#FFFFFFA0"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN_L, MARGIN_B, "ethnomir.app · Справочник продукта")
    c.drawRightString(PAGE_W - MARGIN_R, MARGIN_B, "13 / 50")
    c.showPage()


# ══════════════════════════════════════════════════
# 07 · II.1 Три слоя одной системы
# ══════════════════════════════════════════════════
def page_II_1(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "II · АРХИТЕКТУРА И СТЕК")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 38)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 48, "Три слоя одной системы.")

    y = PAGE_H - MARGIN_T - 90
    intro = ("Приложение построено по классической трёхуровневой архитектуре «клиент — сервер "
             "приложений — база данных», но каждый слой реализован на современном, edge-native "
             "стеке, который исключает необходимость в отдельных серверах, DevOps-инженерах "
             "и классической инфраструктуре.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10, leading=14, max_width=CONTENT_W)

    # Таблица слоёв
    y -= 6
    data = [
        ["СЛОЙ",         "ТЕХНОЛОГИЯ",                                    "НАЗНАЧЕНИЕ"],
        ["Клиент",       "Next.js 15 · React 19 · TypeScript · Turbopack","Single-page PWA для iOS/Android/Desktop без нативных сборок."],
        ["Дизайн-язык",  "iOS 26+ Liquid Glass · pixel-perfect",          "Интерфейс спроектирован по эталонам Apple для iOS 26+: типографика, отступы, радиусы, тени и стеклянные поверхности."],
        ["Рантайм",      "Vercel Edge Network · Serverless Functions",    "Глобальная раздача, автомасштабирование, zero-config деплой."],
        ["Бэкенд",       "Supabase · PostgreSQL 15 · Row Level Security", "База, авторизация, файловое хранилище, realtime, 87 Edge Functions."],
        ["Платежи",      "ЮKassa · СБП",                                  "Приём оплат по картам и системе быстрых платежей РФ, сертификация ЦБ."],
        ["Push",         "Firebase Cloud Messaging",                      "Уведомления iOS и Android через единый endpoint с шаблонами из CRM."],
        ["Аналитика",    "crm_analytics_daily · audit_trail · PostHog",   "Собственный аналитический слой + PostHog для воронок и когорт."],
    ]
    t = ios_table(data, [80, 180, 231], head=True)
    tw, th = t.wrap(CONTENT_W, 300)
    t.drawOn(c, MARGIN_L, y - th)
    y = y - th - 20

    # «Почему это экономически оправдано»
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 15)
    c.drawString(MARGIN_L, y, "Почему этот стек экономически оправдан")
    y -= 22

    reasons = [
        ("01", "Нулевая стоимость на малом трафике",
         "Vercel и Supabase — edge/serverless: платим только за фактические обращения. Первые 100 000 посещений/мес и 500 МБ — бесплатно."),
        ("02", "Автоматическое масштабирование",
         "Пик Масленицы, фестивалей — нагрузка ×50. Edge-функции разворачиваются автоматически по миру, без дежурств DevOps."),
        ("03", "Единая модель данных",
         "Клиент, CRM, аналитика, B2B, инвест-лендинг — одна база. Гость купил билет в 10:00 — менеджер видит его в CRM в 10:00:01."),
        ("04", "Безопасность на уровне базы",
         "239 RLS-политик Postgres проверяют каждый запрос. Кассир не увидит финансы; партнёр — только свои заказы; гость — только свои чеки."),
    ]
    for num, head, body in reasons:
        c.setFillColor(C["sec_II"])
        c.setFont("Inter-Bold", 11)
        c.drawString(MARGIN_L, y, num)
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 11)
        c.drawString(MARGIN_L + 25, y, head)
        # Body
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9.5)
        body_lines = wrap_text_lines(c, body, "Inter", 9.5, CONTENT_W - 25)
        for i, ln in enumerate(body_lines):
            c.drawString(MARGIN_L + 25, y - 14 - i*12, ln)
        y -= (14 + 12*len(body_lines) + 6)

    draw_page_frame(c, 14, 50, "II · АРХИТЕКТУРА И СТЕК")
    c.showPage()


# ══════════════════════════════════════════════════
# 08 · II.2 База данных: 136 таблиц по 12 доменам
# ══════════════════════════════════════════════════
def page_II_2(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "II · АРХИТЕКТУРА И СТЕК")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 34)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "База данных:")
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 78, "136 таблиц по 12 доменам.")

    y = PAGE_H - MARGIN_T - 115
    intro = ("Схема public структурирована по бизнес-доменам. Каждая таблица имеет префикс, "
             "отражающий её принадлежность к модулю, что облегчает навигацию и поддержку.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10, leading=14, max_width=CONTENT_W)

    # Таблица доменов
    y -= 6
    data = [
        ["ДОМЕН", "ТАБЛИЦ", "НАЗНАЧЕНИЕ ДОМЕНА"],
        ["CRM-операции",             "23", "Брони, сделки, лиды, задачи, гости, документы, уведомления, инвентарь, роли."],
        ["Контент BillionsX",        "14", "Лендинг-подсистема: методология, тарифы, кейсы, заявки."],
        ["Пользователи и авторизация","9",  "Профили, OTP-коды, провайдеры, points_log, wallet_transactions, rate_limits."],
        ["Отели и бронирования",      "7",  "hotels, room_types, bookings, booking_items, hotel_reviews, hotel_promos."],
        ["Контент парка",             "7",  "masterclasses, park_events, services, articles, tours, park_info, events."],
        ["Коммерция",                 "6",  "orders, cart_items, receipts, receipt_items, receipt_events, payment_methods."],
        ["Рестораны и F&B",           "5",  "restaurants, menu_items, delivery_items, restaurant_reviews, dietary_filters."],
        ["Геймификация и Паспорт",    "4",  "countries, regions_rf, achievements, passport_stamps."],
        ["Инфраструктура и карты",    "4",  "qr_codes, map_pois, landing_pages, landing_sections."],
        ["Операции и аудит",          "4",  "audit_trail, _deploy_store, admin_log, admin_permissions."],
        ["Вовлечение",                "2",  "reviews, chat_messages (live-чат поддержки)."],
        ["Прочие (справочники и пр.)","51", "Сертификаты, лояльность, подписки, промокоды, пуши, B2B, FAQ, истории и др."],
    ]
    t = ios_table(data, [150, 60, 281], head=True)
    tw, th = t.wrap(CONTENT_W, 500)
    t.drawOn(c, MARGIN_L, y - th)
    y = y - th - 20

    # Примечание с боксом
    c.setFillColor(C["bg"])
    box_h = 85
    c.roundRect(MARGIN_L, y - box_h, CONTENT_W, box_h, 10, fill=1, stroke=0)
    draw_eyebrow(c, MARGIN_L + 14, y - 16, "ЧТО ЗНАЧИТ «ПРОЧИЕ 51 ТАБЛИЦА»")
    note = ("Сюда входят: gift_certificates, loyalty_levels, subscription_plans, promo_codes, promo_uses, "
            "push_subscriptions, push_tokens, notifications, promos, promo_banners, ticket_types, "
            "b2b_programs, daily_schedule, family_tree, faq, favorites, heritage_items, hero_slides, "
            "legal_docs, login_history, partnership, real_estate, staff, stories, user_badges, "
            "user_collections, user_settings, weekly_themes, categories, contacts, app_config и другие.")
    draw_text_block(c, MARGIN_L + 14, y - 32, note, font_size=8.5, leading=11.5, max_width=CONTENT_W - 28, color=C["label2_real"])

    draw_page_frame(c, 15, 50, "II · АРХИТЕКТУРА И СТЕК")
    c.showPage()


# ══════════════════════════════════════════════════
# 09 · II.3 Безопасность и контур поставки
# ══════════════════════════════════════════════════
def page_II_3(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "II · АРХИТЕКТУРА И СТЕК")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 34)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Безопасность")
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 78, "и контур поставки.")

    y = PAGE_H - MARGIN_T - 120

    # RLS
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 15)
    c.drawString(MARGIN_L, y, "Row Level Security: 239 политик")
    y -= 20

    intro = ("Каждое обращение к базе проходит через PostgreSQL RLS-слой. "
             "Распределение политик по типам операций:")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10, leading=14, max_width=CONTENT_W, color=C["label2_real"])

    # 5 метрик — типы политик
    y -= 10
    metrics = [
        ("129", "на чтение\nSELECT", C["blue"]),
        ("58",  "на любые\nоперации ALL", C["purple"]),
        ("34",  "на запись\nINSERT", C["green"]),
        ("13",  "на обновление\nUPDATE", C["orange"]),
        ("5",   "на удаление\nDELETE", C["red"]),
    ]
    cell_w = CONTENT_W / 5
    for i, (v, l, col) in enumerate(metrics):
        cx = MARGIN_L + i*cell_w
        c.setFillColor(col)
        c.setFont("Inter-Ex", 30)
        c.drawString(cx, y - 30, v)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        for j, line in enumerate(l.split("\n")):
            c.drawString(cx, y - 46 - j*11, line)
    y -= 80

    # Роли
    roles_intro = ("24 активных сотрудника распределены по 23 ролям в 5 ступенях доступа (RBAC). "
                   "Даже при компрометации аккаунта кассира — злоумышленник не получит доступ "
                   "к финансовым отчётам или данным VIP-гостей. База просто не вернёт эту информацию, "
                   "независимо от того, какой код её запрашивает.")
    y = draw_text_block(c, MARGIN_L, y, roles_intro, font_size=10, leading=14, max_width=CONTENT_W)
    y -= 16

    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 16

    # CI/CD
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 15)
    c.drawString(MARGIN_L, y, "Контур поставки изменений (CI/CD)")
    y -= 24

    steps = [
        ("шаг 01", "Git push в main",                   "Каждое изменение — отдельный коммит с описанием и автором."),
        ("шаг 02", "Автосборка Vercel",                 "Turbopack собирает прод-версию за 35-50 секунд."),
        ("шаг 03", "Preview URL на review",             "До выкладки генерируется уникальный preview-URL для проверки."),
        ("шаг 04", "Атомарный swap к production",       "Production-домен переключается атомарно, без даунтайма."),
        ("шаг 05", "Автоматический откат при ошибке",   "Любой из 20 предыдущих деплоев — rollback candidate, возврат за 30 секунд."),
    ]
    for label, head, body in steps:
        c.setFillColor(C["sec_II"])
        c.setFont("Inter-Semi", 8.5)
        c.drawString(MARGIN_L, y, label.upper())
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 11)
        c.drawString(MARGIN_L + 60, y, head)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9.5)
        body_lines = wrap_text_lines(c, body, "Inter", 9.5, CONTENT_W - 60)
        for i, ln in enumerate(body_lines):
            c.drawString(MARGIN_L + 60, y - 14 - i*12, ln)
        y -= (14 + 12*len(body_lines) + 6)

    # Финальный KPI
    y -= 6
    c.setFillColor(C["green"])
    c.setFont("Inter-Ex", 22)
    c.drawString(MARGIN_L, y, "20/20")
    c.setFillColor(C["label"])
    c.setFont("Inter-Med", 10)
    c.drawString(MARGIN_L + 68, y, "последних деплоев в статусе READY · 100% стабильность.")
    y -= 22

    # Соответствие и криптография
    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 18
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 13)
    c.drawString(MARGIN_L, y, "Соответствие и криптография")
    y -= 18
    compliance = [
        ("152-ФЗ", "Обработка персональных данных согласно законодательству РФ. Явное согласие, "
                   "аудит действий, право на удаление — на уровне модели данных.", C["blue"]),
        ("HMAC-подпись чеков", "Каждый цифровой чек и QR-код подписаны криптографически. Подделать "
                               "или изменить пост-фактум невозможно — верификация на входе в парк.", C["purple"]),
        ("OTP и SSL/TLS", "Вход по одноразовому коду на телефон или email, без паролей. Весь трафик "
                          "шифруется, секреты хранятся в Vercel encrypted env.", C["green"]),
    ]
    col_w = CONTENT_W / 3
    p_c = ParagraphStyle("cc", fontName="Inter", fontSize=8.5, leading=11,
                         textColor=C["label2_real"])
    for i, (head, body, col) in enumerate(compliance):
        cx = MARGIN_L + i*col_w
        c.setFillColor(col)
        c.setFont("Inter-Bold", 11)
        c.drawString(cx, y, head)
        pc = Paragraph(body, p_c)
        _, phc = pc.wrap(col_w - 10, 80)
        pc.drawOn(c, cx, y - 14 - phc)

    draw_page_frame(c, 16, 50, "II · АРХИТЕКТУРА И СТЕК")
    c.showPage()


# ══════════════════════════════════════════════════
# 16 · II.4 Дизайн-язык iOS 26+ Liquid Glass (NEW)
# ══════════════════════════════════════════════════
def page_II_4_design_language(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "II · АРХИТЕКТУРА И СТЕК")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 34)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Дизайн-язык.")
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 78, "iOS 26+ Liquid Glass.")

    y = PAGE_H - MARGIN_T - 118
    intro = ("Интерфейс приложения спроектирован по эталонам Apple для iOS 26+: "
             "типографика, отступы, радиусы, тени, стеклянные поверхности — всё pixel-perfect. "
             "Это не «вдохновлено Apple», это полностью совместимая с нативной iOS 26+ "
             "визуальная система, реализованная на Web.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15,
                        max_width=CONTENT_W, color=C["label2_real"])

    # 4 KPI масштаба дизайн-системы
    y -= 16
    kpi_data = [
        ("85+", "компонентов\nв системе"),
        ("8",   "дизайн-паков\nтематических"),
        ("60", "fps · Canvas 2D\nфоновый градиент"),
        ("6",  "слоёв Liquid Glass\nна каждой поверхности"),
    ]
    cell_w = CONTENT_W / 4
    for i, (v, l) in enumerate(kpi_data):
        cx = MARGIN_L + i * cell_w
        fs = 30
        while fs > 18 and c.stringWidth(v, "Inter-Ex", fs) > cell_w - 12:
            fs -= 1
        c.setFillColor(C["label"])
        c.setFont("Inter-Ex", fs)
        c.drawString(cx, y - fs, v)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        for j, ln in enumerate(l.split("\n")):
            c.drawString(cx, y - fs - 12 - j*11, ln)
    y -= 82
    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 18

    # 8 характеристик Liquid Glass в сетке 2×4
    draw_eyebrow(c, MARGIN_L, y, "ВОСЕМЬ ХАРАКТЕРИСТИК СТАНДАРТА")
    y -= 18

    features = [
        ("01", "Liquid Glass · 6 слоёв",
         "blur(40px) + saturate(180%) + border + specular highlight + inset shadow + drop shadow. Прозрачность 20-52% адаптивно."),
        ("02", "Ethnomir Gradient v5",
         "Двух-канвасная система с 12 плавающими блобами в стиле Instagram. Canvas 2D рендер на 60fps с IntersectionObserver."),
        ("03", "SF Pro Display",
         "Единственный шрифт во всём интерфейсе. 34pt bold для заголовков, 17pt regular для body, 13pt для микро-копирайта."),
        ("04", "SF Symbols",
         "Монохромные иконки Apple. Filled вариант для активного состояния (чёрный), outline для неактивного (серый 60%)."),
        ("05", "Tab Bar · floating r36",
         "Плавающий Liquid Glass в нижней части. Radius 36pt, 5 вкладок + центральная «Поиск» overlay."),
        ("06", "Touch Feedback",
         "Только opacity-based (opacity 0.6 на нажатии). Никаких scale(0.97) — они дают jitter и ломают pixel-perfect."),
        ("07", "Spring Animations",
         "cubic-bezier(0.2, 0.8, 0.2, 1) — эталонная кривая Apple. Продолжительность увеличена ×2 для «премиального» ощущения."),
        ("08", "AmbientFX",
         "Анимированные орбы на промо-баннерах. Sheen-sweep, twinkle, ripple, drift particles — декоративный слой."),
    ]
    p_fbody = ParagraphStyle("ff", fontName="Inter", fontSize=9, leading=12.5,
                             textColor=C["label2_real"])
    gap_x = 16
    cell_w = (CONTENT_W - gap_x) / 2
    cell_h = 68
    for idx, (num, title, body) in enumerate(features):
        col = idx % 2
        row = idx // 2
        cx = MARGIN_L + col*(cell_w + gap_x)
        cy_top = y - row*(cell_h + 6)
        c.setFillColor(C["sec_II"])
        c.setFont("Inter-Bold", 9.5)
        c.drawString(cx, cy_top - 4, num)
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 11)
        c.drawString(cx + 22, cy_top - 4, title)
        p = Paragraph(body, p_fbody)
        _, ph = p.wrap(cell_w - 24, 80)
        p.drawOn(c, cx + 22, cy_top - 18 - ph)

    draw_page_frame(c, 17, 50, "II · АРХИТЕКТУРА И СТЕК")
    c.showPage()
