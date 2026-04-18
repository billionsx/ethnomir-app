"""
Секция V (стр. 42-47): Ценностные карты по 6 аудиториям.
Влияние приложения, основатель, гости, партнёры, франчайзи, инвесторы, персонал.
Секция VI (дорожная карта) — снята по решению заказчика, функции сохранены в коде.
"""
import sys
sys.path.insert(0, '/home/claude/ethnomir-app/src')
from pdfkit import *


# ══════════════════════════════════════════════════
# 31 · SECTION V COVER
# ══════════════════════════════════════════════════
def page_cover_V(c):
    c.setFillColor(C["sec_V"])  # оранжевый
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFFB0"))
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T, "СЛОЙ V · 42")

    y = PAGE_H/2 + 90
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Inter-Ex", 56)
    c.drawString(MARGIN_L, y, "Ценностные")
    c.drawString(MARGIN_L, y - 62, "карты.")

    y -= 120
    c.setFillColor(HexColor("#FFFFFFC8"))
    c.setFont("Inter-Med", 13)
    for line in [
        "Один продукт — шесть аудиторий. Каждая",
        "получает от приложения свою ценность, свой",
        "доступ, свою экономику. Ниже — что именно",
        "получает каждая.",
    ]:
        c.drawString(MARGIN_L, y, line)
        y -= 18

    c.setFillColor(HexColor("#FFFFFFA0"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN_L, MARGIN_B, "ethnomir.app · Справочник продукта")
    c.drawRightString(PAGE_W - MARGIN_R, MARGIN_B, "42 / 47")
    c.showPage()


# ══════════════════════════════════════════════════
# 43 · V.influence Влияние приложения (NEW, открывает секцию V)
# ══════════════════════════════════════════════════
def page_V_influence(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "V · ЦЕННОСТНЫЕ КАРТЫ · ВЛИЯНИЕ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 34)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Влияние приложения.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74,
                 "Шесть осей, меняющих позицию парка на рынке.")

    y = PAGE_H - MARGIN_T - 108
    intro = ("До детальных ценностных карт по аудиториям — шесть осей стратегического "
             "влияния приложения. Каждая ось — отдельный вектор изменения позиции парка. "
             "Детали по ролям — на следующих страницах.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15,
                        max_width=CONTENT_W, color=C["label2_real"])
    y -= 24

    axes = [
        ("01", "Репутация",
         "Apple iOS 26+ Liquid Glass как визитная карточка. Когда гость открывает приложение, "
         "он мгновенно понимает: Этномир — технологически зрелый бренд мирового уровня.",
         C["role_founder"]),
        ("02", "Гости",
         "Цифровой спутник от первого знакомства до последнего дня визита: планирование, "
         "навигация, заказы, достижения, персональные скидки, приглашение друзей.",
         C["role_guest"]),
        ("03", "Инвесторы и франчайзи",
         "Технологическая зрелость и масштабируемость платформы кардинально меняют переговорную "
         "позицию. Прозрачность через дашборды, франшизопригодность из коробки.",
         C["role_investor"]),
        ("04", "Управление",
         "CRM с 24+ вкладками и пятиуровневым RBAC. Дашборд KPI в реальном времени: загрузка, "
         "выручка, конверсия, средний чек. Полная прослеживаемость: кто, что и когда изменил.",
         C["role_founder"]),
        ("05", "Маркетинг",
         "Самый мощный маркетинговый канал Этномира. Push, stories, лендинги, акции, "
         "лояльность — без зависимости от соцсетей. Кампании создаются из CRM с отслеживанием ROI.",
         C["role_partner"]),
        ("06", "Коммерция",
         "Полноценный инструмент управления воронкой: модули Сделки, Лиды, Кампании, Аналитика "
         "— от первого контакта до закрытия сделки. ROI каждой маркетинговой активности.",
         C["role_staff"]),
    ]
    # Сетка 2×3
    gap_x = 16
    gap_y = 14
    cell_w = (CONTENT_W - gap_x) / 2
    cell_h = 145
    p_a = ParagraphStyle("ax", fontName="Inter", fontSize=9.5, leading=13,
                         textColor=C["label"])
    for idx, (num, name, desc, color) in enumerate(axes):
        col = idx % 2
        row = idx // 2
        cx = MARGIN_L + col*(cell_w + gap_x)
        cy_top = y - row*(cell_h + gap_y)
        c.setFillColor(HexColor("#FAFAFA"))
        c.roundRect(cx, cy_top - cell_h, cell_w, cell_h, 12, fill=1, stroke=0)
        # Номер в цветном круге
        c.setFillColor(color)
        c.circle(cx + 22, cy_top - 24, 14, fill=1, stroke=0)
        c.setFillColor(HexColor("#FFFFFF"))
        c.setFont("Inter-Bold", 11)
        c.drawCentredString(cx + 22, cy_top - 28, num)
        # Название
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 15)
        c.drawString(cx + 46, cy_top - 28, name)
        # Описание
        p = Paragraph(desc, p_a)
        _, ph = p.wrap(cell_w - 36, 140)
        p.drawOn(c, cx + 18, cy_top - 56 - ph)

    draw_page_frame(c, 43, 47, "V · ЦЕННОСТНЫЕ КАРТЫ · ВЛИЯНИЕ")
    c.showPage()


# ══════════════════════════════════════════════════
# Универсальный шаблон ценностной карты
# ══════════════════════════════════════════════════
def value_card_page(c, *, page_num, audience_roman, audience_title,
                     role_color, opening_statement, value_points,
                     screen_ts, screen_caption, closing_quote=None):
    """Ценностная карта для одной аудитории. 60/40 layout."""
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T,
                 f"V · ЦЕННОСТНЫЕ КАРТЫ · {audience_roman}")

    # Цветная метка-точка + заголовок
    c.setFillColor(role_color)
    c.circle(MARGIN_L + 6, PAGE_H - MARGIN_T - 36, 6, fill=1, stroke=0)
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 26)
    c.drawString(MARGIN_L + 22, PAGE_H - MARGIN_T - 42, audience_title)

    col_text_w = CONTENT_W * 0.58
    col_img_x = MARGIN_L + col_text_w + 14
    col_img_w = CONTENT_W - col_text_w - 14

    y = PAGE_H - MARGIN_T - 80
    # Открывающее утверждение
    p_lead = ParagraphStyle("lead", fontName="Inter-Med", fontSize=11, leading=15,
                             textColor=C["label"], spaceAfter=14)
    p = Paragraph(opening_statement, p_lead)
    pw, ph = p.wrap(col_text_w, 200)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 6

    # 4-5 ценностных тезиса: цифра + заголовок + описание
    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10.5, leading=13.5, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=9, leading=12.5, textColor=C["label2_real"])
    
    for idx, (head, body) in enumerate(value_points, 1):
        # Цифра (в линию с заголовком)
        c.setFillColor(role_color)
        c.setFont("Inter-Bold", 10)
        c.drawString(MARGIN_L, y - 10, f"{idx:02d}")
        # Заголовок
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(col_text_w - 28, 30)
        ph_h.drawOn(c, MARGIN_L + 28, y - phh)
        y -= phh + 4
        # Тело
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(col_text_w - 28, 60)
        ph_b.drawOn(c, MARGIN_L + 28, y - phb)
        y -= phb + 10

    # Закрывающая цитата — опционально, снизу левой колонки
    if closing_quote:
        y -= 4
        p_q = ParagraphStyle("q", fontName="Inter-Semi", fontSize=10, leading=13.5, textColor=C["label"])
        pq = Paragraph(closing_quote, p_q)
        pw, pqh = pq.wrap(col_text_w - 28, 400)
        box_h = pqh + 20  # реальная высота контента + padding
        if y - box_h > MARGIN_B + 20:
            c.setFillColor(C["bg"])
            c.roundRect(MARGIN_L, y - box_h, col_text_w, box_h, 10, fill=1, stroke=0)
            pq.drawOn(c, MARGIN_L + 14, y - pqh - 10)

    # Правая колонка — скрин
    draw_screen(c, screen_path(screen_ts), col_img_x, PAGE_H - MARGIN_T - 110, col_img_w)
    # Подпись
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    cap_lines = wrap_text_lines(c, screen_caption, "Inter", 8, col_img_w)
    cap_y = MARGIN_B + 55
    for ln in cap_lines[:3]:
        c.drawString(col_img_x, cap_y, ln)
        cap_y -= 10

    draw_page_frame(c, page_num, 47, f"V · ЦЕННОСТЬ · {audience_roman}")
    c.showPage()


# ══════════════════════════════════════════════════
# 32 · Для основателя
# ══════════════════════════════════════════════════
def page_V_founder(c):
    value_card_page(c, page_num=44,
        audience_roman="ОСНОВАТЕЛЬ",
        audience_title="Для основателя и руководства.",
        role_color=C["role_founder"],
        opening_statement=(
            "Приложение — это не канал продаж, а инструмент контроля. "
            "С одного экрана видно всё, с телефона — всё подчинено. "
            "Ниже — четыре способа, которыми ethnomir.app меняет позицию основателя."
        ),
        value_points=[
            ("Суверенитет над данными",
             "Все данные парка — гости, брони, финансы, переписки, отзывы, контент — "
             "хранятся в единой базе PostgreSQL, принадлежащей парку. Никаких SaaS-подписок "
             "с внешними условиями. В любой момент: pg_dump, перенос к другому провайдеру, "
             "размещение на своём сервере."),
            ("Наблюдаемость целого бизнеса с одного экрана",
             "Режим «Владелец» даёт одним свайпом: выручка за все периоды, NPS, загрузка отелей, "
             "движение лидов, воронка сделок, активные задачи. Пятиминутная проверка — полное "
             "понимание текущего состояния парка."),
            ("Режим «Смотреть как роль»",
             "Одним кликом — вид кассира, консьержа, менеджера, партнёра-ресторатора. "
             "Инструмент аудита, обучения и стратегического мышления — никогда не теряя "
             "связь с полевой реальностью."),
            ("Наследие как цифровой актив",
             "Первая цифровая реализация миссии Этномира. Разделы «Наследие» (timeline 2007-2030), "
             "«Основатель» (биография Руслана Байрамова), «Благотворительность» (прозрачные отчёты) "
             "делают миссию публичным документом для миллиона гостей в год."),
        ],
        screen_ts="01_31_27",
        screen_caption="Настройки CRM · «Система работает 97%» · 107 таблиц · 93 функции · 87 Edge Functions · 19 триггеров.",
        closing_quote=(
            "«Раньше узнать выручку парка за неделю значило запросить отчёты из пяти систем "
            "и сложить в Excel. Теперь — открыть приложение.»"
        ),
    )


# ══════════════════════════════════════════════════
# 33 · Для гостей + партнёров (2 карты на странице)
# ══════════════════════════════════════════════════
def page_V_guest_partner(c):
    # Страница сдвоенная: верх — гости, низ — партнёры
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "V · ЦЕННОСТНЫЕ КАРТЫ · ГОСТИ И ПАРТНЁРЫ")

    # ── Верх: Гости ──
    c.setFillColor(C["role_guest"])
    c.circle(MARGIN_L + 6, PAGE_H - MARGIN_T - 34, 6, fill=1, stroke=0)
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 24)
    c.drawString(MARGIN_L + 22, PAGE_H - MARGIN_T - 40, "Для гостей Этномира.")

    col_text_w = CONTENT_W * 0.62
    col_img_x = MARGIN_L + col_text_w + 14
    col_img_w = CONTENT_W - col_text_w - 14

    y = PAGE_H - MARGIN_T - 65
    intro = ("Каждый из миллиона гостей в год получает персональное приложение, где "
             "накапливается его история визитов, коллекция стран, баллы, достижения. "
             "Парк превращается из одноразового впечатления в продолжающиеся отношения.")
    p_lead = ParagraphStyle("lead", fontName="Inter", fontSize=9.5, leading=13,
                             textColor=C["label2_real"], spaceAfter=8)
    p = Paragraph(intro, p_lead)
    pw, ph = p.wrap(col_text_w, 150)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 4

    points = [
        ("Одно приложение вместо десяти",
         "Билет, отель, доставка, сертификаты, экскурсия — одна корзина, один чек-аут, одна история."),
        ("Паспорт как эмоциональный актив",
         "96 стран, 85 регионов, 30 достижений. Каждый визит — след. Собранные 48 стран мотивируют вернуться за следующими."),
        ("Кошелёк с круговой экономикой",
         "Заработал за отзыв — потратил на кофе. PRO-подписка 990₽/мес превращает гостя в резидента."),
        ("Поддержка без очереди",
         "AI-чат отвечает мгновенно на 80% вопросов. Сложные эскалируются менеджеру с SLA."),
    ]
    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10, leading=12, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=8.5, leading=11, textColor=C["label2_real"])
    for idx, (head, body) in enumerate(points, 1):
        c.setFillColor(C["role_guest"])
        c.setFont("Inter-Bold", 9)
        c.drawString(MARGIN_L, y - 10, f"{idx:02d}")
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(col_text_w - 24, 20)
        ph_h.drawOn(c, MARGIN_L + 24, y - phh)
        y -= phh + 4
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(col_text_w - 24, 40)
        ph_b.drawOn(c, MARGIN_L + 24, y - phb)
        y -= phb + 10

    # Скрин гостя — Кошелёк. Высота ограничена — чтобы не налезал на нижнюю секцию.
    guest_y_top = PAGE_H - MARGIN_T - 80
    guest_y_bot_limit = PAGE_H/2 + 10  # выше разделителя на 20pt
    guest_h_max = guest_y_top - guest_y_bot_limit
    guest_w_by_h = guest_h_max * (784/2024)
    guest_w = min(col_img_w, guest_w_by_h)
    guest_h_real = guest_w / (784/2024)
    guest_x = col_img_x + (col_img_w - guest_w) / 2  # центрируем
    draw_screen(c, screen_path("01_26_33"), guest_x, guest_y_top, guest_w, corner=10)
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    c.drawString(col_img_x, guest_y_top - guest_h_real - 14, "Кошелёк · 8 750 баллов.")

    # ── Разделитель ──
    y_sep = PAGE_H/2 - 10
    draw_rule(c, MARGIN_L, y_sep, CONTENT_W, color=C["sep"], weight=0.5)

    # ── Низ: Партнёры ──
    y_bot_top = y_sep - 18
    c.setFillColor(C["role_partner"])
    c.circle(MARGIN_L + 6, y_bot_top - 6, 6, fill=1, stroke=0)
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 24)
    c.drawString(MARGIN_L + 22, y_bot_top - 12, "Для партнёров парка.")

    y = y_bot_top - 40
    intro2 = ("Рестораторы 18 заведений, операторы 13 отелей, хозяева этнодворов, прокаты, СПА — "
              "все имеют прямой доступ и работают с живым потоком гостей, а не с отчётами раз в месяц.")
    p2 = Paragraph(intro2, p_lead)
    pw, ph2 = p2.wrap(col_text_w, 100)
    p2.drawOn(c, MARGIN_L, y - ph2)
    y = y - ph2 - 4

    points2 = [
        ("Доступ к миллиону гостей без своей дистрибуции",
         "Ресторан появляется в каталоге «Услуги → Рестораны», виден каждому гостю. Без SMM, без Avito — только качество кухни."),
        ("Свой вид CRM через crm_partner_access",
         "Партнёр видит только свои заказы, чеки, отзывы, гостей. 8 заказов за вчера, 3 отзыва (ответить!), 2 брони на ужин."),
        ("Автоматические чеки и reconciliation",
         "Платёж через ЮKassa, чек выставляется, комиссия удерживается прозрачно, остаток — на счёт. Минус 3-5 часов бухгалтерии в день."),
    ]
    for idx, (head, body) in enumerate(points2, 1):
        c.setFillColor(C["role_partner"])
        c.setFont("Inter-Bold", 9)
        c.drawString(MARGIN_L, y - 10, f"{idx:02d}")
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(col_text_w - 24, 20)
        ph_h.drawOn(c, MARGIN_L + 24, y - phh)
        y -= phh + 4
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(col_text_w - 24, 40)
        ph_b.drawOn(c, MARGIN_L + 24, y - phb)
        y -= phb + 10

    # Скрин партнёра — рестораны. Высота ограничена до нижней границы своей секции.
    partner_y_top = y_sep - 30
    partner_y_bot_limit = MARGIN_B + 50
    partner_h_max = partner_y_top - partner_y_bot_limit
    partner_w_by_h = partner_h_max * (784/2024)
    partner_w = min(col_img_w, partner_w_by_h)
    partner_h_real = partner_w / (784/2024)
    partner_x = col_img_x + (col_img_w - partner_w) / 2
    draw_screen(c, screen_path("01_09_43"), partner_x, partner_y_top, partner_w, corner=10)
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    c.drawString(col_img_x, partner_y_top - partner_h_real - 14, "Рестораны · 18 заведений.")

    draw_page_frame(c, 45, 47, "V · ЦЕННОСТЬ · ГОСТИ И ПАРТНЁРЫ")
    c.showPage()


# ══════════════════════════════════════════════════
# 34 · Для франчайзи + инвесторов (2 карты на странице)
# ══════════════════════════════════════════════════
def page_V_franchise_investor(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "V · ЦЕННОСТНЫЕ КАРТЫ · ФРАНЧАЙЗИ И ИНВЕСТОРЫ")

    col_text_w = CONTENT_W * 0.62
    col_img_x = MARGIN_L + col_text_w + 14
    col_img_w = CONTENT_W - col_text_w - 14

    # ── Верх: Франчайзи ──
    c.setFillColor(C["role_franchise"])
    c.circle(MARGIN_L + 6, PAGE_H - MARGIN_T - 34, 6, fill=1, stroke=0)
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 24)
    c.drawString(MARGIN_L + 22, PAGE_H - MARGIN_T - 40, "Для франчайзи.")

    y = PAGE_H - MARGIN_T - 65
    intro = ("Франшиза Этномира — не «бренд и методичка». Это готовая технологическая платформа, "
             "запускающаяся с первого дня нового парка.")
    p_lead = ParagraphStyle("lead", fontName="Inter", fontSize=9.5, leading=13,
                             textColor=C["label2_real"], spaceAfter=8)
    p = Paragraph(intro, p_lead)
    pw, ph = p.wrap(col_text_w, 150)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 4

    points = [
        ("Приложение как часть франшизы",
         "Франчайзи не ждёт 18 месяцев разработки. Получает то же приложение, заменяется только контент. Цифровой контур готов за 2-4 недели."),
        ("Единая методология и KPI",
         "Все парки — одна модель данных, одни метрики, один формат отчётов. Франчайзер видит сеть как McDonald's — в одном дашборде."),
        ("Маркетинг и IT уже в пакете",
         "Две из пяти ключевых затрат нового парка полностью покрыты приложением. Снижение стоимости запуска на 15-25%."),
    ]
    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10, leading=12, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=8.5, leading=11, textColor=C["label2_real"])
    for idx, (head, body) in enumerate(points, 1):
        c.setFillColor(C["role_franchise"])
        c.setFont("Inter-Bold", 9)
        c.drawString(MARGIN_L, y - 10, f"{idx:02d}")
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(col_text_w - 24, 20)
        ph_h.drawOn(c, MARGIN_L + 24, y - phh)
        y -= phh + 4
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(col_text_w - 24, 40)
        ph_b.drawOn(c, MARGIN_L + 24, y - phb)
        y -= phb + 10

    # Скрин — франшиза hero. Высота ограничена чтобы не налезал на нижнюю секцию.
    fr_y_top = PAGE_H - MARGIN_T - 80
    fr_y_bot_limit = PAGE_H/2 + 10
    fr_h_max = fr_y_top - fr_y_bot_limit
    fr_w_by_h = fr_h_max * (784/2024)
    fr_w = min(col_img_w, fr_w_by_h)
    fr_h_real = fr_w / (784/2024)
    fr_x = col_img_x + (col_img_w - fr_w) / 2
    draw_screen(c, screen_path("01_16_12"), fr_x, fr_y_top, fr_w, corner=10)
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    c.drawString(col_img_x, fr_y_top - fr_h_real - 14, "Франшиза · 6 шагов запуска.")

    # ── Разделитель ──
    y_sep = PAGE_H/2 - 10
    draw_rule(c, MARGIN_L, y_sep, CONTENT_W, color=C["sep"], weight=0.5)

    # ── Низ: Инвесторы ──
    y_bot_top = y_sep - 18
    c.setFillColor(C["role_investor"])
    c.circle(MARGIN_L + 6, y_bot_top - 6, 6, fill=1, stroke=0)
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 24)
    c.drawString(MARGIN_L + 22, y_bot_top - 12, "Для инвесторов.")

    y = y_bot_top - 40
    intro2 = ("Модуль недвижимости — живой инвестиционный инструмент с прозрачной доходностью "
              "и тремя сценариями арендной монетизации.")
    p2 = Paragraph(intro2, p_lead)
    pw, ph2 = p2.wrap(col_text_w, 100)
    p2.drawOn(c, MARGIN_L, y - ph2)
    y = y - ph2 - 4

    points2 = [
        ("Восемь объектов с реальным ROI",
         "Карточки с площадью, ценой, ROI, арендным потенциалом (Airbnb 45% / долгосрочная 30% / мероприятия 25%). Рост цены участков +233% за 5 лет."),
        ("Управление арендой через то же приложение",
         "Владелец апартаментов сдаёт их через общий фонд из 330 номеров. Инвестиция превращается в операционный доход."),
        ("Инфраструктура в шаговой доступности",
         "12 ресторанов, 4 СПА, 6+ детских зон, 13 отелей, 40+ мастерских, 15 музеев. Участок рядом с парком 1M гостей/год гарантирует арендный поток."),
    ]
    for idx, (head, body) in enumerate(points2, 1):
        c.setFillColor(C["role_investor"])
        c.setFont("Inter-Bold", 9)
        c.drawString(MARGIN_L, y - 10, f"{idx:02d}")
        ph_h = Paragraph(head, p_h)
        pw, phh = ph_h.wrap(col_text_w - 24, 20)
        ph_h.drawOn(c, MARGIN_L + 24, y - phh)
        y -= phh + 4
        ph_b = Paragraph(body, p_b)
        pw, phb = ph_b.wrap(col_text_w - 24, 40)
        ph_b.drawOn(c, MARGIN_L + 24, y - phb)
        y -= phb + 10

    # Скрин инвесторов. Высота ограничена до нижней границы секции.
    inv_y_top = y_sep - 30
    inv_y_bot_limit = MARGIN_B + 50
    inv_h_max = inv_y_top - inv_y_bot_limit
    inv_w_by_h = inv_h_max * (784/2024)
    inv_w = min(col_img_w, inv_w_by_h)
    inv_h_real = inv_w / (784/2024)
    inv_x = col_img_x + (col_img_w - inv_w) / 2
    draw_screen(c, screen_path("01_15_30"), inv_x, inv_y_top, inv_w, corner=10)
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8)
    c.drawString(col_img_x, inv_y_top - inv_h_real - 14, "Посёлок Мир · дома от 18M₽.")

    draw_page_frame(c, 46, 47, "V · ЦЕННОСТЬ · ФРАНЧАЙЗИ И ИНВЕСТОРЫ")
    c.showPage()


# ══════════════════════════════════════════════════
# 35 · Для персонала + SECTION VI COVER уплотнён
# ══════════════════════════════════════════════════
def page_V_staff(c):
    value_card_page(c, page_num=47,
        audience_roman="ПЕРСОНАЛ",
        audience_title="Для персонала парка.",
        role_color=C["role_staff"],
        opening_statement=(
            "24 сотрудника уже работают в CRM: Ирина Кассир, Сергей Консьерж, Олег "
            "Контентов, Артём Курьер и другие. Для каждого приложение — инструмент, "
            "уменьшающий рутину и автоматизирующий повторяющиеся операции."
        ),
        value_points=[
            ("Персонализированный интерфейс по роли",
             "Кассир видит только кассовые операции, Консьерж — только запросы гостей в номерах, "
             "Ресторан-партнёр — только свои заказы. Нет когнитивной перегрузки, нет поиска "
             "нужной функции среди 24 вкладок."),
            ("Мобильность — всё с телефона",
             "Консьерж не сидит за ресепшеном. Ходит по территории со смартфоном, получает запросы "
             "через push: «Гость в номере 203 заказал уборку». Директор одобряет скидку из дома. "
             "Ресторатор видит заказ через 5 секунд."),
            ("Автоматизация через 19 триггеров",
             "При оформлении брони автоматически создаются чек, задача ресепшену, рассылка гостю, "
             "запись в CRM-гостя. Сотрудник не вводит данные дважды — один раз в одном месте, "
             "всё распространяется через sync-триггеры."),
            ("Приоритизация и уведомления",
             "Срочное (негативный отзыв, жалоба, проблема с платежом) — urgent через push "
             "мгновенно. Обычное — через уведомление. Шум не приходит никогда."),
        ],
        screen_ts="01_29_50",
        screen_caption="Персонал CRM · 24 сотрудника, 9 руководителей, 5 партнёров. Каждый — со своей ролью и правами.",
        closing_quote=(
            "«CRM, в которую сотрудникам приятно заходить, — это уже 30% эффективности "
            "команды. ethnomir.app не отталкивает, а помогает.»"
        ),
    )


# ══════════════════════════════════════════════════
# 36 · Дорожная карта 2026 и приложения (без section cover VI чтобы уложиться в 37)
# ══════════════════════════════════════════════════
def page_VI_roadmap(c):
    # Лёгкий цветной «corner tag» вместо отдельного разделителя
    c.setFillColor(C["sec_VI"])
    c.rect(0, PAGE_H - 4, PAGE_W, 4, fill=1, stroke=0)
    
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "VI · ДОРОЖНАЯ КАРТА И ПРИЛОЖЕНИЯ", color=C["sec_VI"])

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 32)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Что впереди.")

    y = PAGE_H - MARGIN_T - 80
    intro = ("Приложение живое и находится в активной разработке. Ниже — планы на ближайшие "
             "три квартала по трём линиям развития.")
    p_lead = ParagraphStyle("lead", fontName="Inter", fontSize=10, leading=14,
                             textColor=C["label2_real"], spaceAfter=12)
    p = Paragraph(intro, p_lead)
    pw, ph = p.wrap(CONTENT_W, 400)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 20  # больше отступ до первого квартала

    # 3 квартальные группы
    quarters = [
        ("Q2 2026", "ПОТРЕБИТЕЛЬСКИЙ ОПЫТ", C["sec_VI"],
         [
             ("01", "Native Push Notifications через PWA",
              "iOS 16.4+ и Android. Возврат гостя в приложение ×3-5."),
             ("02", "Офлайн-режим",
              "Кэш карты, Паспорта, истории покупок. Критично на большой территории со слабым сигналом."),
             ("03", "Геолокационные квесты",
              "«Дойти до юрты Монголии» — QR открывается только при правильной GPS-координате."),
         ]),
        ("Q3 2026", "ИНТЕЛЛЕКТ И ПЕРСОНАЛИЗАЦИЯ", C["purple"],
         [
             ("04", "AI-рекомендательная система",
              "На основе истории визитов, LTV, сегментации — персональные предложения. Netflix-алгоритм для парка."),
             ("05", "Умный concierge уровня GPT",
              "AI-консьерж, который умеет бронировать и эскалировать менеджеру. На базе Claude/GPT-5."),
             ("06", "Dynamic pricing v2",
              "Автокорректировка цен по загрузке, погоде, событиям конкурентов. Эффект: +8-15% к выручке."),
         ]),
        ("Q4 2026", "МАСШТАБИРОВАНИЕ", C["green"],
         [
             ("07", "Multi-tenant для франшизы",
              "Подготовка кода к 5-10 паркам-франчайзи одновременно. Изоляция данных, общие обновления."),
             ("08", "Нативные iOS/Android приложения",
              "App Store / Google Play. Apple Pay внутри, Apple Wallet для билетов."),
             ("09", "Открытый API для партнёров",
              "Ресторан сам загружает меню, отель — номера, турагентство — группы. Этномир → платформа."),
         ]),
    ]

    p_h = ParagraphStyle("h", fontName="Inter-Bold", fontSize=10, leading=12.5, textColor=C["label"])
    p_b = ParagraphStyle("b", fontName="Inter", fontSize=8.5, leading=11, textColor=C["label2_real"])
    for q_idx, (quarter, label, color, items) in enumerate(quarters):
        if q_idx > 0:
            y -= 8
        # Заголовок квартала
        c.setFillColor(color)
        c.setFont("Inter-Bold", 12)
        c.drawString(MARGIN_L, y, quarter)
        # Бейдж чуть правее
        qw = c.stringWidth(quarter, "Inter-Bold", 12)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 8.5)
        c.drawString(MARGIN_L + qw + 12, y + 1, label)
        y -= 18
        for num, head, body in items:
            c.setFillColor(color)
            c.setFont("Inter-Bold", 9)
            c.drawString(MARGIN_L + 4, y, num)
            # Head + body в одну строку + перенос
            line = f"<b>{head}</b>   {body}"
            p_combo = ParagraphStyle("combo", fontName="Inter", fontSize=8.5, leading=11, textColor=C["label"])
            p_combo.fontName = "Inter"
            ph_p = Paragraph(f"<font name='Inter-Bold' color='#000'>{head}</font>   <font color='#3C3C4399'>{body}</font>", p_combo)
            pw, phh = ph_p.wrap(CONTENT_W - 24, 60)
            ph_p.drawOn(c, MARGIN_L + 24, y - phh + 9)
            y -= max(phh + 2, 14)
        y -= 6

    draw_page_frame(c, 40, 47, "VI · ДОРОЖНАЯ КАРТА 2026")
    c.showPage()


# ══════════════════════════════════════════════════
# 37 · Приложение: инфраструктура и finale
# ══════════════════════════════════════════════════
def page_VI_appendix(c):
    c.setFillColor(C["sec_VI"])
    c.rect(0, PAGE_H - 4, PAGE_W, 4, fill=1, stroke=0)
    
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "VI · ПРИЛОЖЕНИЕ · ИНФРАСТРУКТУРА", color=C["sec_VI"])

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 30)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 42, "Техническое приложение.")

    y = PAGE_H - MARGIN_T - 80
    intro = ("Полный список инфраструктурных идентификаторов для справки — на случай передачи "
             "прав, аудита, смены подрядчика или собственной поддержки.")
    p_lead = ParagraphStyle("lead", fontName="Inter", fontSize=10, leading=14,
                             textColor=C["label2_real"], spaceAfter=12)
    p = Paragraph(intro, p_lead)
    pw, ph = p.wrap(CONTENT_W, 400)
    p.drawOn(c, MARGIN_L, y - ph)
    y = y - ph - 16

    # 3 секции идентификаторов — компактные таблицы, заголовок только на первой
    sections = [
        ("GITHUB", True, [
            ["ИДЕНТИФИКАТОР", "ЗНАЧЕНИЕ"],
            ["Организация",           "billionsx"],
            ["Репозиторий",           "ethnomir-app"],
            ["Ветка по умолчанию",    "main · Private"],
            ["Последний коммит",      "a3d1771 · 17 апреля 2026"],
            ["Объём",                 "10 789 строк в apps/web/app/page.tsx"],
        ]),
        ("VERCEL", False, [
            ["Team ID",               "team_MGOjvAD4h7VZwruVGT1w4407"],
            ["Project ID",            "prj_8T0qzGKXi0q5XGy0KUkMozTM71Wc"],
            ["Production URL",        "ethnomir.app"],
            ["Bundler",               "Turbopack (35-50 сек на билд)"],
            ["Состояние",             "20/20 последних деплоев READY"],
        ]),
        ("SUPABASE И ТРЕТЬИ СТОРОНЫ", False, [
            ["Supabase Project ID",   "ewnoqkoojobyqqxpvzhj"],
            ["PostgreSQL",            "v15, 136 таблиц, 146 функций, 239 RLS-политик"],
            ["Edge Functions",        "87 деплой-юнитов"],
            ["Auth providers",        "SMS.ru (phone OTP) · Email"],
            ["Платежи",               "ЮKassa (78%) · Robokassa (12%) · Наличные (8%)"],
            ["Медиа",                 "Ostrovok CDN для фотографий отелей"],
        ]),
    ]
    for sec_eyebrow, has_head, table_data in sections:
        draw_eyebrow(c, MARGIN_L, y, sec_eyebrow, color=C["sec_VI"])
        y -= 6
        t = ios_table(table_data, [185, 306], head=has_head, compact=True)
        tw, th = t.wrap(CONTENT_W, 400)
        t.drawOn(c, MARGIN_L, y - th)
        y = y - th - 10

    # Финальный блок — «Вместо вывода»
    y -= 2
    draw_rule(c, MARGIN_L, y, CONTENT_W, color=C["sep"])
    y -= 16
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 13)
    c.drawString(MARGIN_L, y, "Вместо вывода")
    y -= 16

    quote = ("«Цифровой продукт ethnomir.app — это не приложение. Это новый способ организовать "
             "работу парка, в котором миллион гостей, 24 сотрудника, 136 таблиц базы данных "
             "и 22 лендинга работают на единой операционной системе.»")
    p_q = ParagraphStyle("q", fontName="Inter-Semi", fontSize=10.5, leading=14.5, textColor=C["label"])
    pq = Paragraph(quote, p_q)
    pw, pqh = pq.wrap(CONTENT_W, 200)
    pq.drawOn(c, MARGIN_L, y - pqh)
    y = y - pqh - 8

    # Эпиграф-наследие
    heritage = "«Наследие — это не то, что мы оставляем после себя. Это то, что живёт в руках каждого гостя.»"
    p_h = ParagraphStyle("hh", fontName="Inter", fontSize=9.5, leading=13, textColor=C["label2_real"])
    ph = Paragraph(heritage, p_h)
    pw, phh = ph.wrap(CONTENT_W, 80)
    ph.drawOn(c, MARGIN_L, y - phh)
    y = y - phh - 18

    # Подпись авторства — стартует от текущего y, но не выше MARGIN_B+50
    y_sig = min(y - 8, MARGIN_B + 50)
    y_sig = max(y_sig, MARGIN_B + 50)  # floor — не ниже MARGIN_B+50
    if y - 8 < MARGIN_B + 50:
        y_sig = y - 8  # если совсем прижало — опускаем ниже floor, риск отрезки футером
    draw_rule(c, MARGIN_L, y_sig + 24, CONTENT_W, color=C["sep"])
    
    # Левая колонка — подготовил
    col_w = CONTENT_W / 2 - 6
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Semi", 8)
    c.drawString(MARGIN_L, y_sig + 14, "ДОКУМЕНТ ПОДГОТОВИЛ")
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 11)
    c.drawString(MARGIN_L, y_sig, "BillionsX")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8.5)
    c.drawString(MARGIN_L, y_sig - 13, "Партнёр по цифровой трансформации")
    c.drawString(MARGIN_L, y_sig - 24, "billionsx.com")
    
    # Правая колонка — для кого
    x_right = MARGIN_L + col_w + 12
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Semi", 8)
    c.drawString(x_right, y_sig + 14, "ДЛЯ КОГО")
    c.setFillColor(C["label"])
    c.setFont("Inter-Bold", 11)
    c.drawString(x_right, y_sig, "Этномир")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 8.5)
    c.drawString(x_right, y_sig - 13, "Крупнейший этнографический парк РФ")
    c.drawString(x_right, y_sig - 24, "Калужская область, Боровский район")

    draw_page_frame(c, 41, 47, "VI · ПРИЛОЖЕНИЕ · АВТОРСТВО")
    c.showPage()
