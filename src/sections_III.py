"""
Секция III (стр. 27-40): Функциональные модули клиентской части.
14 модулей + карта 5 вкладок + геймификация, использует ~55 скринов из 69.
Layout: 60/40 для ключевых модулей, мини-галерея 2×2/3×1 для модулей с несколькими состояниями.
"""
import sys
sys.path.insert(0, '/home/claude/ethnomir-app/src')
from pdfkit import *


# ══════════════════════════════════════════════════
# 10 · SECTION III COVER
# ══════════════════════════════════════════════════
def page_cover_III(c):
    c.setFillColor(C["sec_III"])
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFFB0"))
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T, "СЛОЙ III · 22")

    y = PAGE_H/2 + 90
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Inter-Ex", 56)
    c.drawString(MARGIN_L, y, "Функциональные")
    c.drawString(MARGIN_L, y - 62, "модули.")

    y -= 120
    c.setFillColor(HexColor("#FFFFFFC8"))
    c.setFont("Inter-Med", 13)
    for line in [
        "Четырнадцать модулей клиентской части —",
        "от покупки билета до инвестиций в",
        "недвижимость. Каждый с составом, цифрами",
        "и связями с остальной экосистемой.",
    ]:
        c.drawString(MARGIN_L, y, line)
        y -= 18

    c.setFillColor(HexColor("#FFFFFFA0"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN_L, MARGIN_B, "ethnomir.app · Справочник продукта")
    c.drawRightString(PAGE_W - MARGIN_R, MARGIN_B, "22 / 54")
    c.showPage()


# ══════════════════════════════════════════════════
# 13 · III.Философия продукта — три принципа линейки
# ══════════════════════════════════════════════════
def page_III_philosophy(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "III · ФУНКЦИОНАЛЬНЫЕ МОДУЛИ · ФИЛОСОФИЯ")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Продуктовая линейка.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74, "Три принципа, заданных в основу всех 14 модулей.")

    y = PAGE_H - MARGIN_T - 110
    intro = ("Каждый туристический продукт Этномира в приложении спроектирован как самодостаточный "
             "ценный конечный продукт (ЦКП) и одновременно — часть непрерывной линейки. Три принципа "
             "определяют, как модули выстроены и почему они усиливают друг друга.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15, max_width=CONTENT_W, color=C["label2_real"])

    y -= 20
    principles = [
        ("I.", "Понятность. ЦКП.",
         "Ценный конечный продукт",
         "Каждый человек, соприкасающийся с Этномиром, ясно понимает, какие флагманские "
         "туристические продукты созданы для него. В любой момент эти продукты доступны — "
         "как гамбургер в Макдональдсе: гость точно знает что он получит, за сколько и когда.",
         C["sec_III"]),
        ("II.", "Непрерывность.",
         "Линейка от знакомства до погружения",
         "Продукты выстраиваются в последовательность от первого визита к глубокому погружению. "
         "Первый раз — общее яркое впечатление (билет + парк). Повторные визиты — тематические "
         "и продолжительные программы (отель + мастер-класс + этнодвор). Каждый продукт "
         "самодостаточен, но при этом один дополняет другой.",
         C["sec_III"]),
        ("III.", "Увеличение.",
         "Итерации · время · средний чек",
         "Продукты не конкурируют друг с другом — они дополняющие. Гости проводят в Этномире "
         "от нескольких часов до нескольких дней. Растёт удовлетворённость, расход (проживание, "
         "питание, развлечения) и количество повторных визитов.",
         C["sec_III"]),
    ]

    p_body = ParagraphStyle("pp", fontName="Inter", fontSize=10, leading=14.5, textColor=C["label"])
    for roman, title_main, subtitle, body, color in principles:
        # Roman numeral — крупный цветной
        c.setFillColor(color)
        c.setFont("Inter-Ex", 42)
        c.drawString(MARGIN_L, y - 36, roman)
        # Title + subtitle right
        c.setFillColor(C["label"])
        c.setFont("Inter-Ex", 18)
        c.drawString(MARGIN_L + 70, y - 16, title_main)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Med", 11)
        c.drawString(MARGIN_L + 70, y - 32, subtitle)
        # Body
        p = Paragraph(body, p_body)
        pw, ph = p.wrap(CONTENT_W - 70, 100)
        p.drawOn(c, MARGIN_L + 70, y - 46 - ph)
        y = y - 46 - ph - 22

    # Итог
    y -= 4
    c.setFillColor(C["bg"])
    box_h = 60
    c.roundRect(MARGIN_L, y - box_h, CONTENT_W, box_h, 10, fill=1, stroke=0)
    p_it = ParagraphStyle("it", fontName="Inter-Semi", fontSize=10.5, leading=14.5, textColor=C["label"])
    p = Paragraph("В следующих четырнадцати модулях эти три принципа видны в действии: "
                  "каждый модуль — отдельный ЦКП, и одновременно ступень в общей лестнице погружения гостя в парк.",
                  p_it)
    pw, ph = p.wrap(CONTENT_W - 28, box_h - 12)
    p.drawOn(c, MARGIN_L + 14, y - ph - 12)

    draw_page_frame(c, 23, 54, "III · ФУНКЦИОНАЛЬНЫЕ МОДУЛИ · ФИЛОСОФИЯ")
    c.showPage()


# ══════════════════════════════════════════════════
# 19 · III.map Карта 5 вкладок приложения (NEW)
# ══════════════════════════════════════════════════
def page_III_map(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "III · ФУНКЦИОНАЛЬНЫЕ МОДУЛИ · КАРТА")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 36)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Карта приложения.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74,
                 "Пять основных вкладок и плавающий Паспорт.")

    y = PAGE_H - MARGIN_T - 108
    intro = ("Навигационная карта клиентской части. Пять вкладок нижнего Tab Bar — "
             "постоянные точки входа. Паспорт — плавающая кнопка на каждом экране. "
             "Глобальный поиск — overlay поверх всего.")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15,
                        max_width=CONTENT_W, color=C["label2_real"])
    y -= 24

    # 5 вкладок в большой строке + overlays снизу
    tabs = [
        ("Парк",     "M00",  "Главная лента «Сегодня»: новости, погода, события, карта 140 га, 20+ баннеров.", "стр. 25", C["sec_I"]),
        ("Билеты",   "M01",  "13 туров от 600₽, 41 мастер-класс в 4 категориях, музеи, расписание, сертификаты.", "стр. 30-27", C["sec_II"]),
        ("Жильё",    "M02",  "13 этноотелей, 330 номеров, 6 сервисов в номер, 8 объектов ROI 14-22%.",              "стр. 32-29", C["sec_III"]),
        ("Услуги",   "M03",  "18 ресторанов с предзаказом, 22 сервиса: прокат, экскурсии, баня, трансфер.",          "стр. 30",    C["sec_IV"]),
        ("Этномир",  "M07",  "Пятый таб — портал 22 лендингов: франшиза, B2B, наследие, FAQ, вакансии.",             "стр. 36",    C["sec_V"]),
    ]

    cell_w = (CONTENT_W - 4*8) / 5
    cell_h = 210
    p_tab_desc = ParagraphStyle("td", fontName="Inter", fontSize=9, leading=12,
                                textColor=C["label"])
    header_h = 44
    for i, (name, mid, desc, ref, color) in enumerate(tabs):
        cx = MARGIN_L + i*(cell_w + 8)
        # Общий светло-серый фон карточки
        c.setFillColor(HexColor("#FAFAFA"))
        c.roundRect(cx, y - cell_h, cell_w, cell_h, 12, fill=1, stroke=0)
        # Цветная шапка сверху — clip только верх
        c.saveState()
        from reportlab.pdfgen.canvas import Canvas as RCanvas
        p_clip = c.beginPath()
        p_clip.rect(cx, y - header_h, cell_w, header_h)
        c.clipPath(p_clip, stroke=0)
        c.setFillColor(color)
        c.roundRect(cx, y - header_h - 20, cell_w, header_h + 20, 12, fill=1, stroke=0)
        c.restoreState()
        # Название вкладки с auto-fit
        fs_name = 16
        while fs_name > 11 and c.stringWidth(name, "Inter-Bold", fs_name) > cell_w - 24:
            fs_name -= 1
        c.setFillColor(HexColor("#FFFFFF"))
        c.setFont("Inter-Bold", fs_name)
        c.drawString(cx + 12, y - 22, name)
        c.setFillColor(HexColor("#FFFFFFC0"))
        c.setFont("Inter-Semi", 8.5)
        c.drawString(cx + 12, y - 36, mid)
        # Описание
        p = Paragraph(desc, p_tab_desc)
        _, ph = p.wrap(cell_w - 20, 200)
        p.drawOn(c, cx + 10, y - header_h - 14 - ph)
        # Ссылка внизу
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 8)
        c.drawString(cx + 10, y - cell_h + 14, "→ " + ref)

    y -= cell_h + 20

    # Два overlay-блока: Паспорт + Глобальный поиск
    draw_rule(c, MARGIN_L, y, CONTENT_W)
    y -= 18
    draw_eyebrow(c, MARGIN_L, y, "ОВЕРЛЕЙ · ПОВЕРХ ВСЕХ ВКЛАДОК")
    y -= 18

    overlays = [
        ("Паспорт путешественника",
         "Плавающая кнопка в правом верхнем углу каждого экрана. 16 суб-экранов в 4 разделах: коллекция, мои данные, кошелёк, инструменты.",
         "стр. 35-32 · M04", C["orange"]),
        ("Глобальный поиск",
         "Кнопка «Поиск» в центре Tab Bar. Полнотекстовый индекс 150+ объектов: отели, рестораны, мастер-классы, статьи, события.",
         "стр. 39 · M13", C["purple"]),
    ]
    gap_x = 16
    ov_cell_w = (CONTENT_W - gap_x) / 2
    p_ov = ParagraphStyle("ov", fontName="Inter", fontSize=9.5, leading=13,
                          textColor=C["label2_real"])
    for i, (name, desc, ref, color) in enumerate(overlays):
        cx = MARGIN_L + i*(ov_cell_w + gap_x)
        # Цветная точка
        c.setFillColor(color)
        c.circle(cx + 5, y - 3, 4, fill=1, stroke=0)
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 12)
        c.drawString(cx + 18, y - 6, name)
        p = Paragraph(desc, p_ov)
        _, ph = p.wrap(ov_cell_w - 20, 80)
        p.drawOn(c, cx + 18, y - 22 - ph)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter-Semi", 8)
        c.drawString(cx + 18, y - 22 - ph - 14, "→ " + ref)

    draw_page_frame(c, 24, 54, "III · ФУНКЦИОНАЛЬНЫЕ МОДУЛИ")
    c.showPage()


# ══════════════════════════════════════════════════
# Helper: унифицированный модуль-разворот 60/40
# ══════════════════════════════════════════════════
def module_page(c, *, page_num, module_num, module_total, eyebrow,
                title, intro, kpis, body_blocks, screens,
                layout="60 / 49", section_label="III · ФУНКЦИОНАЛЬНЫЕ МОДУЛИ"):
    """
    Универсальный шаблон страницы модуля.
    
    layout: "60 / 49" (текст слева, скрин справа) или "gallery_2x2" (текст сверху + 4 скрина 2×2 внизу)
             или "gallery_3x1" (3 скрина в ряд снизу)
    kpis: [(value, label), ...] — до 4
    body_blocks: [(heading, body_text), ...]
    screens: [(ts, caption), ...] — таймстампы скринов + подписи
    """
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, eyebrow)
    
    # В 60/40 скрин справа — заголовок wrap-ится в левую колонку чтобы не налезал.
    # В остальных layout — на полную ширину.
    if layout == "60 / 49":
        title_wrap_w = CONTENT_W * 0.58
    else:
        title_wrap_w = CONTENT_W
    
    # Заголовок модуля
    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 32)
    title_lines = wrap_text_lines(c, title, "Inter-Ex", 32, title_wrap_w)
    ty = PAGE_H - MARGIN_T - 44
    for ln in title_lines:
        c.drawString(MARGIN_L, ty, ln)
        ty -= 36

    if layout == "60 / 49":
        col_text_w = CONTENT_W * 0.58
        col_img_x = MARGIN_L + col_text_w + 14
        col_img_w = CONTENT_W - col_text_w - 14
        
        y = ty - 10
        # Lead
        p_lead = ParagraphStyle("lead", fontName="Inter", fontSize=10, leading=14.5,
                                 textColor=C["label2_real"], spaceAfter=12)
        p = Paragraph(intro, p_lead)
        pw, ph = p.wrap(col_text_w, 400)
        p.drawOn(c, MARGIN_L, y - ph)
        y = y - ph - 4

        # KPIs row
        if kpis:
            kw = col_text_w / min(len(kpis), 4)
            for i, (v, l) in enumerate(kpis[:4]):
                cx = MARGIN_L + i*kw
                # Auto-fit: если value не влезает в kw-6pt при 22pt — сжимаем
                fs = 22
                while fs > 14 and c.stringWidth(v, "Inter-Ex", fs) > kw - 14:
                    fs -= 1
                draw_mixed(c, cx, y - fs, v, "Inter-Ex", fs, color=C["label"])
                c.setFillColor(C["label2_real"])
                c.setFont("Inter", 8)
                # перенос подписи на 2 строки если нужно
                lbl_lines = wrap_text_lines(c, l, "Inter", 8, kw - 8)
                for j, ln in enumerate(lbl_lines[:2]):
                    c.drawString(cx, y - 36 - j*10, ln)
            y -= 72

        # Body blocks
        p_h = ParagraphStyle("bh", fontName="Inter-Bold", fontSize=11, leading=14, textColor=C["label"], spaceAfter=3)
        p_b = ParagraphStyle("bb", fontName="Inter", fontSize=9.5, leading=13, textColor=C["label"], spaceAfter=10)
        for head, body in body_blocks:
            if head:
                ph_head = Paragraph(head, p_h)
                pw, php = ph_head.wrap(col_text_w, 50)
                ph_head.drawOn(c, MARGIN_L, y - php)
                y -= php + 2
            if body:
                pb = Paragraph(body, p_b)
                pw, phb = pb.wrap(col_text_w, 400)
                pb.drawOn(c, MARGIN_L, y - phb)
                y -= phb + 6

        # Screen на правой колонке — всегда 1 скрин для 60/40
        if screens:
            ts, caption = screens[0]
            screen_y = PAGE_H - MARGIN_T - 110
            screen_h = draw_screen(c, screen_path(ts), col_img_x, screen_y, col_img_w)
            if caption:
                cap_y = screen_y - screen_h - 18
                for ln in wrap_text_lines(c, caption, "Inter", 8, col_img_w)[:3]:
                    draw_mixed(c, col_img_x, cap_y, ln, "Inter", 8, color=C["label2_real"])
                    cap_y -= 11
    
    elif layout == "gallery_2x2":
        # Было: 4 скрина сеткой 2×2. Стало: 2 крупных скрина в ряд — чтобы были читаемы.
        # Берём первые 2 скрина из списка (самые репрезентативные).
        y = ty - 10
        p_lead = ParagraphStyle("lead", fontName="Inter", fontSize=10, leading=14.5,
                                 textColor=C["label2_real"], spaceAfter=10)
        p = Paragraph(intro, p_lead)
        pw, ph = p.wrap(CONTENT_W, 200)
        p.drawOn(c, MARGIN_L, y - ph)
        y = y - ph - 6

        # KPIs
        if kpis:
            kw = CONTENT_W / min(len(kpis), 4)
            for i, (v, l) in enumerate(kpis[:4]):
                cx = MARGIN_L + i*kw
                fs = 22
                while fs > 14 and c.stringWidth(v, "Inter-Ex", fs) > kw - 14:
                    fs -= 1
                draw_mixed(c, cx, y - fs, v, "Inter-Ex", fs, color=C["label"])
                c.setFillColor(C["label2_real"])
                c.setFont("Inter", 8.5)
                for j, ln in enumerate(wrap_text_lines(c, l, "Inter", 8.5, kw - 8)[:2]):
                    c.drawString(cx, y - 36 - j*10, ln)
            y -= 72

        # Body compactly
        p_b = ParagraphStyle("bb", fontName="Inter", fontSize=9.5, leading=13, textColor=C["label"], spaceAfter=6)
        for bi, (head, body) in enumerate(body_blocks):
            if head:
                if bi > 0: y -= 8
                c.setFillColor(C["label"])
                c.setFont("Inter-Bold", 10.5)
                c.drawString(MARGIN_L, y, head)
                y -= 14
            if body:
                pb = Paragraph(body, p_b)
                pw, phb = pb.wrap(CONTENT_W, 300)
                pb.drawOn(c, MARGIN_L, y - phb)
                y -= phb + 4

        # 2 скрина бок-о-бок — одна строка, крупно
        gap = 20
        cap_reserve = 52  # место под 3-строчную подпись (3×12 + 16 gap)
        avail_h = y - MARGIN_B - 40 - cap_reserve
        # Идеал: cell_w = (CONTENT_W - gap) / 2 = 235.5, cell_h = 609. Нереально.
        # Ограничиваем по высоте: cell_h = avail_h, затем cell_w = avail_h * (784/2024)
        cell_h_max = avail_h
        cell_w_max = cell_h_max * (784/2024)
        # Но и шириной ограничимся: не шире (CONTENT_W - gap)/2
        cell_w_limit = (CONTENT_W - gap) / 2
        if cell_w_max > cell_w_limit:
            cell_w = cell_w_limit
            cell_h = cell_w / (784/2024)
        else:
            cell_w = cell_w_max
            cell_h = cell_h_max
        total_w = 2*cell_w + gap
        x_start = MARGIN_L + (CONTENT_W - total_w) / 2

        for idx, (ts, caption) in enumerate(screens[:2]):
            cx = x_start + idx*(cell_w + gap)
            cy_top = y
            draw_screen(c, screen_path(ts), cx, cy_top, cell_w, corner=12)
            if caption:
                cap_y = cy_top - cell_h - 16
                cap_lines = wrap_text_lines(c, caption, "Inter", 9, cell_w - 4)
                for li, ln in enumerate(cap_lines[:3]):
                    draw_mixed(c, cx, cap_y - li*12, ln, "Inter", 9, color=C["label2_real"])

    elif layout == "gallery_3x1":
        y = ty - 10
        p_lead = ParagraphStyle("lead", fontName="Inter", fontSize=10, leading=14.5,
                                 textColor=C["label2_real"], spaceAfter=10)
        p = Paragraph(intro, p_lead)
        pw, ph = p.wrap(CONTENT_W, 200)
        p.drawOn(c, MARGIN_L, y - ph)
        y = y - ph - 6

        if kpis:
            kw = CONTENT_W / min(len(kpis), 4)
            for i, (v, l) in enumerate(kpis[:4]):
                cx = MARGIN_L + i*kw
                fs = 22
                while fs > 14 and c.stringWidth(v, "Inter-Ex", fs) > kw - 14:
                    fs -= 1
                draw_mixed(c, cx, y - fs, v, "Inter-Ex", fs, color=C["label"])
                c.setFillColor(C["label2_real"])
                c.setFont("Inter", 8.5)
                for j, ln in enumerate(wrap_text_lines(c, l, "Inter", 8.5, kw - 8)[:2]):
                    c.drawString(cx, y - 36 - j*10, ln)
            y -= 72

        p_b = ParagraphStyle("bb", fontName="Inter", fontSize=9.5, leading=13, textColor=C["label"], spaceAfter=6)
        for bi, (head, body) in enumerate(body_blocks):
            if head:
                if bi > 0: y -= 8
                c.setFillColor(C["label"])
                c.setFont("Inter-Bold", 10.5)
                c.drawString(MARGIN_L, y, head)
                y -= 14
            if body:
                pb = Paragraph(body, p_b)
                pw, phb = pb.wrap(CONTENT_W, 300)
                pb.drawOn(c, MARGIN_L, y - phb)
                y -= phb + 4

        # 3 скрина в ряд
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
        
        for idx, (ts, caption) in enumerate(screens[:3]):
            cx = x_start + idx*(cell_w + gap)
            draw_screen(c, screen_path(ts), cx, y, cell_w, corner=10)
            if caption:
                c.setFillColor(C["label2_real"])
                c.setFont("Inter", 7.5)
                cap_lines = wrap_text_lines(c, caption, "Inter", 7.5, cell_w - 4)
                for li, ln in enumerate(cap_lines[:2]):
                    draw_mixed(c, cx, y - cell_h - 16 - li*11, ln, "Inter", 8, color=C["label2_real"])

    draw_page_frame(c, page_num, 54, f"{section_label}  ·  М{module_num:02d} / {module_total:02d}")
    c.showPage()


# ══════════════════════════════════════════════════
# Модули (пишем компактно — каждый модуль — один module_page)
# ══════════════════════════════════════════════════

# 11 · M0 — Главная
def page_M00(c):
    module_page(c, page_num=25, module_num=0, module_total=14,
        eyebrow="III · МОДУЛЬ 00 · ГЛАВНАЯ",
        title="Точка входа. «Сегодня» в парке.",
        intro=("Первый экран приложения — не маркетплейс и не список услуг, а живая лента «что "
               "происходит в парке сейчас»: hero с миссией, новости, погода, баннеры актуальных "
               "программ. Цель главной — одним взглядом показать атмосферу и вовлечь в парк."),
        kpis=[("5", "табов\nприложения"),
              ("3", "hero-баннера\nс миссией"),
              ("8", "новостей\nв ленте"),
              ("12", "баннеров\nпрограмм")],
        body_blocks=[
            ("Hero-карусель с ключевыми направлениями",
             "В верхнем баннере — циклическая карусель: «18 ресторанов мира», «13 отелей народов», "
             "«41 мастер-класс», «96 стран на ладони». Каждый слайд ведёт в соответствующий раздел "
             "приложения одним тапом."),
            ("Счётчики парка и лента событий",
             "Три пилюли под заголовком — 1M+ гостей в год, 85 этнодворов, 13 отелей. Ниже — "
             "горизонтальная лента текущих событий с цветными эмодзи-аватарами: Масленица, "
             "Скандинавия, Хаски-парк, акции со скидкой."),
            ("Виджет погоды и таб-бар",
             "Блок «Этномир · Ночь 6°» с барой «Откроется через 7 ч 54 мин». Снизу — пять вкладок "
             "Liquid Glass с монохромными SF Symbols: Парк · Билеты · Жильё · Услуги · Этномир."),
        ],
        screens=[("01_06_56", "Таб «Парк» — главный экран: hero-карусель, KPI парка, лента событий, погода «Этномир · Ночь 6°».")],
        layout="60 / 49",
    )


# 12 · M1 — Билеты (gallery 2x2)
def page_M01(c):
    module_page(c, page_num=26, module_num=1, module_total=14,
        eyebrow="III · МОДУЛЬ 01 · ПАРК И БИЛЕТЫ",
        title="Билеты, туры, события.",
        intro=("Восемь суб-разделов: Билеты, Туры, Мастер-классы, Музеи, Расписание, События, "
               "Сертификаты, Для групп. Билеты — первая точка контакта и источник основной "
               "гостевой воронки парка. Цены динамические, баллы начисляются автоматически."),
        kpis=[("13", "туров от 600₽\nдо 3 500₽"),
              ("41", "мастер-классов\n4 категорий"),
              ("20", "событий\nв году"),
              ("4", "номинала\nсертификатов")],
        body_blocks=[
            ("Динамические тарифы и баллы",
             "Взрослый билет в будни — 990₽, выходные — 1 500₽, праздники — 1 800₽. "
             "Тариф выбирается автоматически по дате. На каждый билет — 49 баллов в кошелёк."),
            ("QR-чек для бесконтактного входа",
             "QR 200×200 считывается на кассе за 1 секунду. Чек доступен в «Мои чеки» и по "
             "публичной ссылке без авторизации."),
        ],
        screens=[
            ("01_07_13", "Билеты: список, календарь 17 апр, «Взрослый билет 990₽», +30 очков."),
            ("01_07_38", "Корзина и оформление: «Взрослый билет» 990₽, +49 баллов, «Оформить заказ»."),
            ("01_33_16", "Туры: 13 позиций от 600₽ до 3 500₽."),
            ("01_33_10", "Мастер-классы: 41 вариант по 4 категориям."),
        ],
        layout="gallery_2x2",
    )


# 13 · M1 — расширение (расписание, сертификаты, группы)
def page_M01_ext(c):
    module_page(c, page_num=27, module_num=1, module_total=14,
        eyebrow="III · МОДУЛЬ 01 · РАСПИСАНИЕ И СЕРТИФИКАТЫ",
        title="Расписание, сертификаты, группы.",
        intro=("Live-расписание сегодняшних активностей, подарочные сертификаты как форма "
               "предоплаченного потребления и отдельная ветка B2B для групп — корпоративных, "
               "школ и турагентств."),
        kpis=[("14", "активностей\nв расписании"),
              ("4", "номинала\nсертификатов"),
              ("12 мес", "срок\nдействия"),
              ("3", "сегмента\nB2B")],
        body_blocks=[
            ("Расписание на сегодня",
             "Йога, стрельба из лука, катание на лошадях, обзорная экскурсия «Вокруг света», "
             "квест «Кругосветка за 60 минут», «Гончарное ремесло». Каждая активность — время, "
             "локация, цена, возрастной ценз."),
            ("Сертификаты как сезонный инструмент",
             "1 000₽ (мастер-класс на 1 чел.), 3 000₽ (билет + МК + обед), 5 000₽ (выходные "
             "на двоих), 10 000₽ (премиум отдых). Срок 12 месяцев, передача третьему лицу, "
             "применение на любые услуги."),
            ("B2B-ветка",
             "Корпоративным клиентам — 16 площадок для MICE, банкетов, конференций. "
             "Школьникам — экскурсии и лагеря. Турагентствам — групповые пакеты с комиссией."),
        ],
        screens=[
            ("01_32_51", "Расписание на сегодня: 14 активностей."),
            ("01_32_36", "Сертификаты: 4 номинала, срок 1 год."),
            ("01_32_18", "Для групп: корпоратив, школы, турагентства."),
        ],
        layout="gallery_3x1",
    )


# 14 · M2 — Жильё (60/40 с карточкой отеля)
def page_M02(c):
    module_page(c, page_num=28, module_num=2, module_total=14,
        eyebrow="III · МОДУЛЬ 02 · ЖИЛЬЁ",
        title="Полная замена PMS гостиницы.",
        intro=("Полноценная замена гостиничной PMS-системы для управления 13 объектами "
               "размещения. Раздел построен по трёхчастной модели: «Забронировать», «Гостю», "
               "«Недвижимость» — от кратковременного пребывания до покупки апартаментов."),
        kpis=[("13", "отелей и\nкомплексов"),
              ("330", "номеров в\nобщем фонде"),
              ("39", "типов номеров\nс ценами"),
              ("9", "фото на\nкаждый объект")],
        body_blocks=[
            ("Каталог и фильтры",
             "13 вариантов размещения от 6 500₽/ночь (Дербент) до 42M₽ (Вилла «Сибирь»). "
             "Фильтры: тип (отель/СПА/эконом/премиум), рейтинг, удобства. Галерея 1/9 с "
             "выразительными описаниями и блоком ближайших POI."),
            ("Сервисы в номер — интеграция с CRM",
             "Активному гостю — заказ уборки (+10), консьерж (+5), еда из 15 ресторанов (+15), "
             "товары в номер (+15), продление (+100), цифровой чек-аут (+20). Каждое действие "
             "создаёт тикет в модуле CRM «Заявки»."),
        ],
        screens=[("01_08_29", "Карточка отеля «Шри-Ланка»: галерея 1/9, рейтинг 9.8, от 16 000₽.")],
        layout="60 / 49",
    )


# 15 · M2 — Жильё (мини-галерея списка + сервисов)
def page_M02_ext(c):
    module_page(c, page_num=29, module_num=2, module_total=14,
        eyebrow="III · МОДУЛЬ 02 · ЖИЛЬЁ И НЕДВИЖИМОСТЬ",
        title="Три вкладки: бронь, гостю, инвестиции.",
        intro=("Раздел жилья работает в трёх режимах одновременно. Для ищущего ночёвку — каталог "
               "отелей с бронированием. Для активного гостя — сервисы прямо в номер. Для "
               "инвестора — тот же раздел превращается в инвестиционный лендинг с ROI."),
        kpis=[("13", "объектов\nразмещения"),
              ("6", "сервисов\nв номер"),
              ("8", "объектов в\nпродаже"),
              ("+233%", "рост цены\nучастков за 5л")],
        body_blocks=[
            ("Уникальный мост: «пришёл гостем — ушёл инвестором»",
             "Гость, бронирующий отель на выходные, в той же вкладке видит объекты "
             "недвижимости рядом — студии от 5.4M₽, апартаменты «Россия» от 10.9M₽, виллы "
             "до 42M₽. Заявка на просмотр — одним тапом."),
            ("Анонимная бронь с привязкой и промо-таймеры",
             "Гость оформляет бронь без регистрации — приложение создаёт анонимную сессию, "
             "бронь и чек сохраняются на устройстве. При первом входе по номеру телефона "
             "чек автоматически подтягивается в «Мои билеты». Промо-акции — с таймером "
             "обратного отсчёта и персональными скидками для лояльных гостей (уровень PRO)."),
        ],
        screens=[
            ("01_08_09", "Забронировать: 13 вариантов."),
            ("01_08_39", "Гостю: сервисы с +10…+100 баллов."),
            ("01_08_53", "Недвижимость: 8 объектов ROI 14-22%."),
        ],
        layout="gallery_3x1",
    )


# 16 · M3 — Услуги и доставка (2x2 галерея разных подразделов)
def page_M03(c):
    module_page(c, page_num=30, module_num=3, module_total=14,
        eyebrow="III · МОДУЛЬ 03 · УСЛУГИ",
        title="Всё, что можно купить в парке после билета.",
        intro=("Объединяет шесть суб-разделов: доставка еды, доставка напитков, рестораны, "
               "СПА и бани, развлечения, прокат. Все категории работают в единой корзине — "
               "это формирует основную долю заказов-дополнений к посещению."),
        kpis=[("18", "ресторанов\nмира"),
              ("166", "позиций\nменю"),
              ("22", "развлечений\nв парке"),
              ("5", "видов\nпроката")],
        body_blocks=[
            ("Единая корзина и круговая экономика баллов",
             "Все 6 категорий — одна корзина, один чек-аут. За заказ: доставка +15, "
             "ресторан +25, СПА +35, мастер-класс +40. Баллы можно тратить внутри любой "
             "категории — это создаёт циркуляцию ценности внутри парка."),
        ],
        screens=[
            ("01_09_08", "Доставка: еда, 5 блюд."),
            ("01_09_43", "Рестораны: 18 заведений, Дербент 4.9★."),
            ("01_11_24", "СПА: 5 программ, Дыхание дракона 4 500₽."),
            ("01_11_36", "Развлечения: 22 программы."),
        ],
        layout="gallery_2x2",
    )


# 17 · M4 — Паспорт (главный экран, 60/40)
def page_M04_main(c):
    module_page(c, page_num=31, module_num=4, module_total=14,
        eyebrow="III · МОДУЛЬ 04 · ПАСПОРТ ЭТНОМИРА",
        title="Центральный геймификационный актив.",
        intro=("Паспорт — эмоциональный центр экосистемы. Гость становится не посетителем, "
               "а «гражданином Этномира» с персональным цифровым паспортом: номер, уровень, "
               "коллекция стран, регионов, достижений, кошелёк баллов."),
        kpis=[("96", "стран мира\nв коллекции"),
              ("85", "регионов\nРоссии"),
              ("30", "достижений\n4 уровня"),
              ("16", "экранов\nвнутри паспорта")],
        body_blocks=[
            ("Паспорт как артефакт",
             "Отдельный экран в тёмной теме: номер паспорта ETH-91445, уровень «Легенда», "
             "48/96 стран, 42/85 регионов, 8 750 баллов. Фото гостя в рамке, срок действия "
             "10 лет, орган выдачи — «Этномир»."),
            ("QR-механика открытия стран",
             "У павильона каждой страны — физический QR. Гость сканирует, страна «открывается»: "
             "флаг, дата, +15-30 баллов. Система создаёт игровой loop между территорией парка "
             "и приложением."),
            ("Четыре раздела. 16 экранов внутри",
             "<b>Коллекция (4):</b> страны 96, регионы 85, достижения 30, гастро. "
             "<b>Мои данные (6):</b> бронирования, заказы, чеки, избранное, заявки, отзывы. "
             "<b>Кошелёк (2):</b> баланс баллов, PRO-подписка ×2. "
             "<b>Инструменты (4):</b> настройки, конфиденциальность, соглашение, быстрый вход в CRM."),
        ],
        screens=[("01_17_10", "Паспорт ETH-91445: уровень, 48/96, 8 750 баллов, кнопка CRM.")],
        layout="60 / 49",
    )


# 18 · M4 — Коллекции (2x2 — страны, регионы, закрытая страна, гастро)
def page_M04_collection(c):
    module_page(c, page_num=32, module_num=4, module_total=14,
        eyebrow="III · МОДУЛЬ 04 · КОЛЛЕКЦИИ ПАСПОРТА",
        title="Страны, регионы, гастро: четыре параллельных коллекции.",
        intro=("Четыре параллельные коллекции, каждая с собственной механикой. Страны и "
               "регионы — основная карта прогресса. Гастроколлекция — 18 блюд народов мира "
               "с бонусом +500 баллов за полный сбор и значком «Гурман»."),
        kpis=[("96", "стран с\nфактами дня"),
              ("85", "регионов\nРФ в 8 ФО"),
              ("18", "блюд гастро-\nколлекции"),
              ("+500", "бонус\nза коллекцию")],
        body_blocks=[
            ("Детальный экран страны",
             "После открытия: флаг, столица, население, площадь, факт дня («LEGO изобретён в "
             "Дании в 1932 году. Сегодня производят 36 миллиардов деталей в год»), отметка "
             "«Посещено» с датой и начисленными баллами."),
            ("Регионы России по федеральным округам",
             "85 регионов распределены по 8 ФО. Центральный — преимущественно открыт у активных "
             "гостей, Дальневосточный — чаще всего закрыт. Каждый регион открывается через "
             "QR в соответствующем этнодворе."),
        ],
        screens=[
            ("01_17_22", "Страны: сетка 96 с зелёной рамкой у открытых."),
            ("01_17_53", "Закрытая: Дания · «Сканировать QR», факт про LEGO."),
            ("01_18_32", "Регионы · Центральный ФО — открыты."),
            ("01_25_06", "Гастро: 0/18, +500 очков, значок «Гурман»."),
        ],
        layout="gallery_2x2",
    )


# ══════════════════════════════════════════════════
# 28 · III.gamification Геймификация и балловая система (NEW)
# ══════════════════════════════════════════════════
def page_III_gamification(c):
    draw_eyebrow(c, MARGIN_L, PAGE_H - MARGIN_T, "III · ГЕЙМИФИКАЦИЯ И БАЛЛОВАЯ СИСТЕМА")

    c.setFillColor(C["label"])
    c.setFont("Inter-Ex", 34)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 44, "Геймификация.")
    c.setFillColor(C["label2_real"])
    c.setFont("Inter-Med", 14)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T - 74,
                 "Баллы, категории начислений, способы траты.")

    y = PAGE_H - MARGIN_T - 108
    intro = ("Баллы — внутренняя валюта приложения. Начисляются автоматически за десять "
             "типов действий, конвертируются в скидки, апгрейды и премиальный доступ. "
             "Баланс и история — в Паспорте путешественника (стр. 31).")
    y = draw_text_block(c, MARGIN_L, y, intro, font_size=10.5, leading=15,
                        max_width=CONTENT_W, color=C["label2_real"])
    y -= 20

    # 4 KPI
    kpi_data = [
        ("10+", "способов\nзаработать"),
        ("6",   "направлений\nтраты"),
        ("×2",  "множитель\nдля PRO"),
        ("30%", "макс. скидка\nза баллы"),
    ]
    kw = CONTENT_W / 4
    for i, (v, l) in enumerate(kpi_data):
        cx = MARGIN_L + i * kw
        c.setFillColor(C["label"])
        c.setFont("Inter-Ex", 28)
        c.drawString(cx, y - 28, v)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 8.5)
        for j, ln in enumerate(l.split("\n")):
            c.drawString(cx, y - 44 - j*11, ln)
    y -= 78

    # Таблица 10 действий → баллов → категория
    draw_eyebrow(c, MARGIN_L, y, "ДЕСЯТЬ ДЕЙСТВИЙ, ЗА КОТОРЫЕ НАЧИСЛЯЮТСЯ БАЛЛЫ")
    y -= 10
    table_data = [
        ["ДЕЙСТВИЕ",            "БАЛЛЫ",     "КАТЕГОРИЯ"],
        ["Регистрация в приложении",   "100",        "Онбординг"],
        ["Покупка билета",             "50–200",     "Транзакция"],
        ["Бронирование отеля",         "200–500",    "Транзакция"],
        ["Запись на мастер-класс",     "30–100",     "Активность"],
        ["Заказ в ресторане",          "30–100",     "Транзакция"],
        ["Отзыв с фото",               "50",         "Контент"],
        ["Открытие нового павильона (QR)", "20",     "Исследование"],
        ["Реферал друга",              "150",        "Виральность"],
        ["Ежедневный вход",            "5",          "Вовлечённость"],
        ["PRO-подписка",               "×2 ко всем", "Премиум"],
    ]
    t = ios_table(table_data, [240, 100, 147], head=True, compact=True)
    tw, th = t.wrap(CONTENT_W, 500)
    t.drawOn(c, MARGIN_L, y - th)
    y = y - th - 20

    # Способы траты — 6 коротких pill'ов в два ряда
    draw_eyebrow(c, MARGIN_L, y, "ШЕСТЬ СПОСОБОВ ПОТРАТИТЬ БАЛЛЫ")
    y -= 20
    spend_ways = [
        ("Скидки до 30%",     "на билеты и услуги",       C["blue"]),
        ("Бесплатные МК",     "мастер-классы за баллы",   C["green"]),
        ("Эксклюзивный мерч", "в кошельке → каталог",     C["purple"]),
        ("Апгрейд номера",    "следующая категория",      C["orange"]),
        ("Ранний доступ",     "к событиям и туристам",    C["red"]),
        ("Пожертвования",     "на программы наследия",    C["sec_V"]),
    ]
    gap_x = 12
    sw_col = 3
    sw_cell = (CONTENT_W - gap_x*(sw_col-1)) / sw_col
    sw_h = 56
    for idx, (name, sub, color) in enumerate(spend_ways):
        col = idx % sw_col
        row = idx // sw_col
        cx = MARGIN_L + col*(sw_cell + gap_x)
        cy_top = y - row*(sw_h + 10)
        c.setFillColor(HexColor("#FAFAFA"))
        c.roundRect(cx, cy_top - sw_h, sw_cell, sw_h, 10, fill=1, stroke=0)
        c.setFillColor(color)
        c.rect(cx, cy_top - sw_h + 6, 3, sw_h - 12, fill=1, stroke=0)
        c.setFillColor(C["label"])
        c.setFont("Inter-Bold", 11)
        c.drawString(cx + 14, cy_top - 20, name)
        c.setFillColor(C["label2_real"])
        c.setFont("Inter", 9)
        c.drawString(cx + 14, cy_top - 36, sub)

    draw_page_frame(c, 33, 54, "III · ГЕЙМИФИКАЦИЯ")
    c.showPage()


# 19 · M5 — Чеки (60/40 с boarding pass)
def page_M05(c):
    module_page(c, page_num=34, module_num=5, module_total=14,
        eyebrow="III · МОДУЛЬ 05 · ЧЕКИ И QR-ЭКОСИСТЕМА",
        title="Цифровой boarding pass вместо кассового оборудования.",
        intro=("Полная замена кассового оборудования на клиентских устройствах. Каждая "
               "покупка создаёт иммутабельный чек с уникальным номером формата "
               "ETM-260401-32FFD, QR для кассы и публичной ссылкой для передачи."),
        kpis=[("1 203", "активных\nQR-кодов"),
              ("54", "чеков уже\nвыставлено"),
              ("HMAC", "подпись для\nзащиты от подделки"),
              ("200px", "размер\nQR-кода")],
        body_blocks=[
            ("Публичная ссылка без авторизации",
             "Формат ethnomir.app/r/ETM-260401-32FFD — можно передать бухгалтерии, родителям, "
             "коллегам. Чек включает номер брони, сумму, состав, дату, статус оплаты, QR для "
             "кассира, ссылку на паспорт путешественника."),
            ("Дизайн в стиле авиационного boarding pass",
             "Узнаваемо, профессионально, серьёзно. Статус («Ожидает оплаты», «Оплачен», "
             "«Возврат») — цветной бейдж сверху. Центр — номер чека крупно, QR в рамке, "
             "разделы «Проживание», «Паспорт путешественника» снизу."),
        ],
        screens=[("01_25_49", "Чек ETM-260401-32FFD · Гостиница «Юго-Восточная Азия» · 595 000₽ · QR 200×200.")],
        layout="60 / 49",
    )


# 20 · M6 + M12 — Чат AI и Отзывы (60/40 chat)
def page_M06(c):
    module_page(c, page_num=35, module_num=6, module_total=14,
        eyebrow="III · МОДУЛИ 06-12 · ПОДДЕРЖКА, ОТЗЫВЫ, УВЕДОМЛЕНИЯ",
        title="AI-чат, отзывы, промо.",
        intro=("Три канала удержания работают вместе: встроенный AI-чат поддержки с "
               "переключением на живого менеджера, система отзывов с официальными "
               "ответами и персональные промо/уведомления. Всё внутри Паспорта, "
               "без переходов в сторонние мессенджеры."),
        kpis=[("72%", "сообщений\nждут ответа"),
              ("309", "отзывов\nгостей"),
              ("4.6★", "средний\nрейтинг"),
              ("91%", "NPS:\nпромоутеры")],
        body_blocks=[
            ("AI-чат с переключением на живого менеджера",
             "Гость может общаться с чат-ботом — типовые вопросы о билетах, отелях, "
             "ресторанах, мастер-классах и маршруте AI отвечает мгновенно. В любой "
             "момент разговор можно перевести на живого менеджера парка: сложные "
             "или эмоциональные обращения эскалируются в CRM-вкладку «Чат», где "
             "их подхватывает сотрудник с SLA и историей диалога."),
            ("Отзывы с ответом администрации",
             "309 отзывов, средний рейтинг 4.6. Распределение: 5★ — 155 (77.5%), 4★ — 27, "
             "3★ — 10, 2★ — 5, 1★ — 3. NPS (Net Promoter Score — индекс лояльности "
             "клиентов) = 91%: промоутеры 182, нейтралы 10, критики 8."),
            ("Промо и уведомления",
             "Масленица, Скидка 20% на отели, 100 баллов в подарок. Табличный контроль "
             "через таблицы promos, promo_codes, promo_uses, push_messages, notifications, "
             "sms_rate_limits."),
        ],
        screens=[("01_27_16", "AI-чат: «Сколько стоит в выходные билет для детей?» → мгновенный ответ с промокодом ЭТНО2026.")],
        layout="60 / 49",
    )


# 21 · M7 — Этномир-хаб (3x1 — top/mid/bottom)
def page_M07(c):
    module_page(c, page_num=36, module_num=7, module_total=14,
        eyebrow="III · МОДУЛЬ 07 · ЭТНОМИР-ХАБ",
        title="Пятый таб — портал 22 лендингов.",
        intro=("Вкладка «Этномир» — не раздел приложения, а портал 22 лендингов, разбитых "
               "на три смысловых пакета: Бизнес (7), Этномир (5), Для гостей (10). Каждый "
               "лендинг — полноценная посадочная страница с собственной монетизацией."),
        kpis=[("22", "лендинга\nв системе"),
              ("7", "бизнес-\nнаправлений"),
              ("5", "о смысле\nЭтномира"),
              ("10", "для\nгостей")],
        body_blocks=[
            ("Бизнес: от инвестиций до агро",
             "Инвестиционная недвижимость · Франшиза · Аренда коммерческих площадей · Зайти "
             "своим бизнесом · Построить новый район · Этномир 2030 · Сельское хозяйство."),
            ("Этномир: культурная основа",
             "Наследие (timeline 2007-2030, миссия, ценности) · Основатель Этномира · "
             "Благотворительность · Вакансии · Экология."),
            ("Для гостей: сервис и контент",
             "Как добраться · FAQ · Отзывы · Журнал (54 статьи) · Согласие на данные, "
             "и другие сервисные лендинги."),
        ],
        screens=[
            ("01_13_45", "Хаб сверху · Hero «Мир начинается с тебя»."),
            ("01_14_23", "Середина · блок Бизнес — 7 направлений."),
            ("01_16_30", "Низ · Наследие, Основатель, FAQ."),
        ],
        layout="gallery_3x1",
    )


# 22 · M8 — Франшиза
def page_M08(c):
    module_page(c, page_num=37, module_num=8, module_total=14,
        eyebrow="III · МОДУЛЬ 08 · ФРАНШИЗА ЭТНОМИРА",
        title="Инструмент масштабирования за пределы Калужской области.",
        intro=("Готовый лендинг с инвестиционной моделью, шестишаговым процессом открытия и "
               "тремя масштабами объекта. Это не просто страница — это полноценная воронка "
               "B2B-продаж, интегрированная с CRM: каждая заявка сразу в crm_leads."),
        kpis=[("$1M+", "минимальные\nинвестиции"),
              ("6", "шагов\nзапуска"),
              ("4-26", "недель до\nподписания"),
              ("35%", "доходность\nпроекта")],
        body_blocks=[
            ("Три масштаба франшизы",
             "Центр культуры (200-10 000 м², $1-8M, паушаль $200-800K) · Парк 10 га ($8-25M, "
             "$800K—2M) · Парк 20+ га (от $25M, от $2M). Три разных инвестиционных профиля, "
             "один бренд, одна технологическая платформа."),
            ("Шестишаговый процесс",
             "Заявка и NDA (1 день) · Финмодель под город (1-2 недели) · Визит в Этномир "
             "(2 дня) · Договор (2-4 недели) · Строительство (12-24 мес) · Запуск (1-2 мес)."),
        ],
        screens=[("01_15_42", "Франшиза · Hero: 18 лет, 1M+ гостей, 16M инвестиции, 35% доходность.")],
        layout="60 / 49",
    )


# 23 · M9 + M10 + M11 — Календарь, Сертификаты, B2B (3x1)
def page_M09_11(c):
    module_page(c, page_num=38, module_num=9, module_total=14,
        eyebrow="III · МОДУЛИ 09-11 · КАЛЕНДАРЬ · СЕРТИФИКАТЫ · B2B",
        title="Три витрины, работающие как одна воронка.",
        intro=("Календарь событий помогает планировать визит. Сертификаты — предоплаченное "
               "потребление, наполняющее кассу в низкий сезон. B2B — групповые программы, "
               "которые дают парку стабильные контракты. Все три — связаны между собой через "
               "CRM и цветовую маркировку мероприятий."),
        kpis=[("20+", "тематических\nнедель в году"),
              ("4", "категории:\nФест/Праз/Дет/Соб"),
              ("12 мес", "срок\nсертификата"),
              ("16", "MICE-площадок\nдля B2B")],
        body_blocks=[
            ("Календарь ↔ Отели: механика продажи предзаказов",
             "При выборе даты события гость видит блок «Номера на праздничные даты "
             "заканчиваются за 2-3 недели. Забронируйте сейчас со скидкой!» с прямым "
             "переходом в «Жильё». Воронка, которую классические парки не монетизируют."),
        ],
        screens=[
            ("01_32_10", "Календарь · «Неделя памятников» + предзаказ отеля."),
            ("01_32_41", "Сертификат 1 000₽ развёрнуто + CTA «В корзину»."),
            ("01_32_18", "B2B: корпоративы, школы, турагентства."),
        ],
        layout="gallery_3x1",
    )


# 24 · M13 + M14 — Уведомления + Поиск (60/40)
def page_M13_14(c):
    module_page(c, page_num=39, module_num=13, module_total=14,
        eyebrow="III · МОДУЛИ 13-14 · УВЕДОМЛЕНИЯ · ПОИСК",
        title="Уведомления и поиск.",
        intro=("Два служебных модуля, которые делают приложение живым: "
               "push/SMS-уведомления возвращают гостя в приложение, глобальный "
               "поиск покрывает всё 150+ объектов контента — отели, рестораны, "
               "туры, мастер-классы, события, страны и регионы."),
        kpis=[("10", "популярных\nзапросов"),
              ("150+", "индексируемых\nобъектов"),
              ("1 203", "QR-кодов\nна территории"),
              ("×3-5", "возврат\nпо push")],
        body_blocks=[
            ("Уведомления как канал возврата",
             "Push: «Масленица в Этномире», «Скидка 20% на отели», «100 баллов в подарок». "
             "Инфраструктура: promos, promo_banners, push_messages, push_subscriptions, "
             "notifications, sms_rate_limits — защита от спама."),
            ("Глобальный поиск по всему приложению",
             "Единая строка поиска индексирует 150+ объектов контента: отели, рестораны, "
             "туры, мастер-классы, события, страны и регионы. Подсказки с ранжированием "
             "по популярности запросов и контексту гостя."),
        ],
        screens=[("01_27_30", "Центр уведомлений: Масленица, скидки, бонусы.")],
        layout="60 / 49",
    )
