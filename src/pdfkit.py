"""
ethnomir.app · Справочник продукта v2 · Апрель 2026
Дизайн-система и утилиты для генерации PDF в iOS 26 / McKinsey стиле.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import Color, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Frame, Paragraph as _RLParagraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY
import os

# ─── Fonts ──────────────────────────────────────────
FONT_DIR = "/home/claude/ethnomir-v2/assets/fonts"
pdfmetrics.registerFont(TTFont("Inter", f"{FONT_DIR}/Inter-400.ttf"))
pdfmetrics.registerFont(TTFont("Inter-Med", f"{FONT_DIR}/Inter-500.ttf"))
pdfmetrics.registerFont(TTFont("Inter-Semi", f"{FONT_DIR}/Inter-600.ttf"))
pdfmetrics.registerFont(TTFont("Inter-Bold", f"{FONT_DIR}/Inter-700.ttf"))
pdfmetrics.registerFont(TTFont("Inter-Ex", f"{FONT_DIR}/Inter-800.ttf"))
pdfmetrics.registerFont(TTFont("Inter-Black", f"{FONT_DIR}/Inter-900.ttf"))
# DejaVu fallback для ₽, →, ←, ★, ✓ и других спецсимволов
pdfmetrics.registerFont(TTFont("Sym",      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Sym-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily(
    "Inter",
    normal="Inter",
    bold="Inter-Bold",
    italic="Inter",
    boldItalic="Inter-Bold",
)

# ─── Colors (iOS 26 system) ─────────────────────────
C = {
    "label":       HexColor("#000000"),
    "label2":      HexColor("#3C3C4399"),   # rgba(60,60,67,.60) — approx without alpha
    "label2_real": Color(60/255, 60/255, 67/255, 0.60),
    "label3":      Color(60/255, 60/255, 67/255, 0.30),
    "bg":          HexColor("#F2F2F7"),
    "bg_white":    HexColor("#FFFFFF"),
    "sep":         Color(60/255, 60/255, 67/255, 0.18),
    "sep_light":   Color(60/255, 60/255, 67/255, 0.10),

    "blue":        HexColor("#007AFF"),
    "green":       HexColor("#34C759"),
    "red":         HexColor("#FF3B30"),
    "orange":      HexColor("#FF9500"),
    "purple":      HexColor("#AF52DE"),
    "pink":        HexColor("#FF2D55"),
    "teal":        HexColor("#30B0C7"),
    "indigo":      HexColor("#5856D6"),
    "yellow":      HexColor("#FFCC00"),
    "brown":       HexColor("#A2845E"),

    # Role color markers (V section)
    "role_founder":   HexColor("#000000"),
    "role_partner":   HexColor("#007AFF"),
    "role_guest":     HexColor("#34C759"),
    "role_franchise": HexColor("#FF9500"),
    "role_investor":  HexColor("#AF52DE"),
    "role_staff":     HexColor("#FF3B30"),

    # Section cover colors
    "sec_I":   HexColor("#007AFF"),
    "sec_II":  HexColor("#5856D6"),
    "sec_III": HexColor("#34C759"),
    "sec_IV":  HexColor("#000000"),
    "sec_V":   HexColor("#FF9500"),
    "sec_VI":  HexColor("#30B0C7"),
}

# ─── Page geometry (A4) ─────────────────────────────
PAGE_W, PAGE_H = A4  # 595.27 x 841.89 pt
MARGIN_L = 22*mm
MARGIN_R = 22*mm
MARGIN_T = 20*mm
MARGIN_B = 18*mm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R  # ~173mm ≈ 491pt
CONTENT_H = PAGE_H - MARGIN_T - MARGIN_B  # ~210mm ≈ 595pt

# ─── Typography styles ──────────────────────────────
def make_styles():
    s = {}
    s["title_xl"]  = ParagraphStyle("title_xl",  fontName="Inter-Ex",  fontSize=44, leading=48, textColor=C["label"], spaceAfter=6)
    s["title_lg"]  = ParagraphStyle("title_lg",  fontName="Inter-Ex",  fontSize=32, leading=36, textColor=C["label"], spaceAfter=4)
    s["title_md"]  = ParagraphStyle("title_md",  fontName="Inter-Bold",fontSize=22, leading=26, textColor=C["label"], spaceAfter=8)
    s["title_sm"]  = ParagraphStyle("title_sm",  fontName="Inter-Bold",fontSize=16, leading=20, textColor=C["label"], spaceAfter=6)
    s["eyebrow"]   = ParagraphStyle("eyebrow",   fontName="Inter-Semi",fontSize=8.5,leading=11, textColor=C["label2_real"], spaceAfter=6)
    s["eyebrow_c"] = ParagraphStyle("eyebrow_c", fontName="Inter-Semi",fontSize=8.5,leading=11, textColor=C["blue"], spaceAfter=6)
    s["body"]      = ParagraphStyle("body",      fontName="Inter",     fontSize=10, leading=14.5, textColor=C["label"], spaceAfter=8)
    s["body_sm"]   = ParagraphStyle("body_sm",   fontName="Inter",     fontSize=9,  leading=13, textColor=C["label"], spaceAfter=6)
    s["body_tight"]= ParagraphStyle("body_tight",fontName="Inter",     fontSize=9.5,leading=13.5, textColor=C["label"], spaceAfter=4)
    s["caption"]   = ParagraphStyle("caption",   fontName="Inter",     fontSize=8,  leading=11, textColor=C["label2_real"], spaceAfter=4)
    s["label_num"] = ParagraphStyle("label_num", fontName="Inter-Ex",  fontSize=32, leading=34, textColor=C["label"], spaceAfter=0)
    s["label_num_sm"]=ParagraphStyle("label_num_sm", fontName="Inter-Bold", fontSize=18, leading=20, textColor=C["label"], spaceAfter=0)
    s["quote"]     = ParagraphStyle("quote",     fontName="Inter-Med", fontSize=11, leading=16, textColor=C["label"], spaceAfter=6, leftIndent=0)
    s["quote_big"] = ParagraphStyle("quote_big", fontName="Inter-Semi",fontSize=14, leading=20, textColor=C["label"], spaceAfter=8, leftIndent=0)
    # Section covers
    s["cov_small"] = ParagraphStyle("cov_small", fontName="Inter-Semi",fontSize=10, leading=13, textColor=HexColor("#FFFFFF"), spaceAfter=8)
    s["cov_roman"] = ParagraphStyle("cov_roman", fontName="Inter-Semi",fontSize=10, leading=13, textColor=HexColor("#FFFFFFB0"), spaceAfter=10)
    s["cov_big"]   = ParagraphStyle("cov_big",   fontName="Inter-Ex",  fontSize=52, leading=56, textColor=HexColor("#FFFFFF"), spaceAfter=14)
    s["cov_sub"]   = ParagraphStyle("cov_sub",   fontName="Inter-Med", fontSize=13, leading=18, textColor=HexColor("#FFFFFFC0"), spaceAfter=0)
    # White labels for dark area
    s["w_eyebrow"] = ParagraphStyle("w_eyebrow", fontName="Inter-Semi",fontSize=8.5,leading=11, textColor=HexColor("#FFFFFFB0"))
    s["w_body"]    = ParagraphStyle("w_body",    fontName="Inter",     fontSize=10, leading=14, textColor=HexColor("#FFFFFFDD"))
    return s

STYLES = make_styles()

def Paragraph(text, style=None, *args, **kwargs):
    """Обёртка над RL Paragraph: автоматически пропускает текст через fix_special
    чтобы ₽, →, ★ отображались из fallback-шрифта Sym."""
    return _RLParagraph(fix_special(text), style, *args, **kwargs)

def P(text, style=None):
    return Paragraph(text, style)

# ─── Building blocks ────────────────────────────────
def draw_page_frame(c, page_num, total_pages, section_label=""):
    """Плоский iOS-стиль: тонкая линия снизу + номер страницы + ярлык раздела."""
    c.setStrokeColor(C["sep_light"])
    c.setLineWidth(0.4)
    c.line(MARGIN_L, MARGIN_B - 6*mm, PAGE_W - MARGIN_R, MARGIN_B - 6*mm)
    c.setFillColor(C["label2_real"])
    c.setFont("Inter", 7.5)
    c.drawString(MARGIN_L, MARGIN_B - 10*mm, "ethnomir.app · Справочник продукта")
    if section_label:
        c.drawCentredString(PAGE_W/2, MARGIN_B - 10*mm, section_label)
    c.drawRightString(PAGE_W - MARGIN_R, MARGIN_B - 10*mm, f"{page_num} / {total_pages}")

def draw_eyebrow(c, x, y, text, color=None):
    """ALL CAPS label in iOS style."""
    c.setFont("Inter-Semi", 8.5)
    c.setFillColor(color or C["label2_real"])
    c.drawString(x, y, text.upper())

def draw_rule(c, x, y, w, color=None, weight=0.4):
    c.setStrokeColor(color or C["sep"])
    c.setLineWidth(weight)
    c.line(x, y, x+w, y)

def rounded_card(c, x, y, w, h, radius=12, fill=None, stroke=None, stroke_w=0.4):
    """iOS-стиль скруглённая карточка."""
    if fill is not None:
        c.setFillColor(fill)
    if stroke is not None:
        c.setStrokeColor(stroke)
        c.setLineWidth(stroke_w)
    c.roundRect(x, y, w, h, radius, fill=1 if fill else 0, stroke=1 if stroke else 0)

def draw_kpi_block(c, x, y, w, h, value, label, value_color=None, label_color=None, value_font_size=22):
    """Ячейка KPI — число крупно сверху, подпись снизу."""
    c.setFillColor(value_color or C["label"])
    c.setFont("Inter-Ex", value_font_size)
    c.drawString(x, y + h - value_font_size - 2, value)
    c.setFillColor(label_color or C["label2_real"])
    c.setFont("Inter", 8)
    # Подпись может уйти в две строки — пока простой вариант
    c.drawString(x, y + 4, label)

def wrap_text_lines(c, text, font_name, font_size, max_width):
    """Рубим текст на строки по ширине. Уважает явные \\n как жёсткие переносы."""
    out_lines = []
    for hard_line in text.split("\n"):
        words = hard_line.split()
        if not words:
            out_lines.append("")
            continue
        cur = ""
        for w in words:
            test = cur + " " + w if cur else w
            if c.stringWidth(test, font_name, font_size) <= max_width:
                cur = test
            else:
                if cur: out_lines.append(cur)
                cur = w
        if cur: out_lines.append(cur)
    return out_lines

def draw_text_block(c, x, y, text, font_name="Inter", font_size=10, leading=14, max_width=None, color=None):
    """Рисую текст-абзац от верхней точки y вниз. Возвращаю конечный y."""
    c.setFont(font_name, font_size)
    c.setFillColor(color or C["label"])
    if max_width is None: max_width = CONTENT_W
    lines = wrap_text_lines(c, text, font_name, font_size, max_width)
    cy = y
    for line in lines:
        c.drawString(x, cy, line)
        cy -= leading
    return cy + leading  # вернём координату последней строки

def draw_heading(c, x, y, text, level="h1"):
    """Заголовки: h1 32pt EX, h2 22pt Bold, h3 16pt Bold."""
    if level == "h1":
        font, size, lead = "Inter-Ex", 32, 36
    elif level == "h2":
        font, size, lead = "Inter-Bold", 22, 26
    elif level == "h3":
        font, size, lead = "Inter-Bold", 16, 20
    elif level == "h4":
        font, size, lead = "Inter-Semi", 12, 15
    c.setFillColor(C["label"])
    c.setFont(font, size)
    lines = wrap_text_lines(c, text, font, size, CONTENT_W)
    cy = y
    for line in lines:
        c.drawString(x, cy, line)
        cy -= lead
    return cy + lead

# ─── Image helpers ──────────────────────────────────
SCREENS_DIR = "/home/claude/ethnomir-v2/screens"

def draw_mixed(c, x, y, text, font_name, font_size, color=None):
    """Рисует строку с fallback на Sym/Sym-Bold для спецсимволов (₽, →, ★ и т.п.).
    Возвращает ширину нарисованного текста."""
    if color: c.setFillColor(color)
    SYM_CHARS = set("₽→←↔★✓©™≠·•∞")  # символы, которых нет в Inter
    is_bold = "Bold" in font_name or "Ex" in font_name or "Black" in font_name or "Semi" in font_name
    sym_font = "Sym-Bold" if is_bold else "Sym"
    cx = x
    i = 0
    while i < len(text):
        # Group consecutive chars by font
        ch = text[i]
        use_sym = ch in SYM_CHARS
        font = sym_font if use_sym else font_name
        # Collect run
        run = ch
        j = i + 1
        while j < len(text):
            nxt = text[j]
            nxt_use_sym = nxt in SYM_CHARS
            if nxt_use_sym == use_sym:
                run += nxt
                j += 1
            else:
                break
        # DejaVu шире — чуть уменьшаем размер для балансa визуально
        actual_size = font_size * (0.92 if use_sym else 1.0)
        c.setFont(font, actual_size)
        c.drawString(cx, y, run)
        cx += c.stringWidth(run, font, actual_size)
        i = j
    return cx - x


def fix_special(text):
    """Обёртывает спецсимволы (₽, →, ★, ✓) в <font name='Sym'> для Paragraph.
    Paragraph не знает про fallback, поэтому заменяем явно в HTML."""
    import re
    SYM_CHARS = "₽→←↔★✓©™≠•"
    pattern = f"([{SYM_CHARS}])"
    # Оборачиваем каждый символ индивидуально — внутренний Paragraph может применить свой bold/regular
    return re.sub(pattern, r"<font name='Sym'>\1</font>", text)


def draw_screen(c, path, x, y_top, w, shadow=True, corner=14):
    """Рисую скрин приложения с закруглёнными углами и тенью.
    Реализация: клипа по скруглённому пути — не использую RGBA маску, 
    чтобы избежать потери яркости.
    y_top — верхняя Y-координата, w — ширина в точках.
    Возвращает высоту."""
    from PIL import Image as PILImage
    img = PILImage.open(path)
    iw, ih = img.size
    h = w * (ih/iw)
    y_bot = y_top - h
    
    # Тень
    if shadow:
        c.saveState()
        c.setFillColor(Color(0,0,0,0.10))
        c.roundRect(x+1.5, y_bot-2, w, h, corner, fill=1, stroke=0)
        c.restoreState()
    
    # Клип по скруглённому пути + рисуем исходный PNG без альфы
    c.saveState()
    p = c.beginPath()
    # Ручной скруглённый прямоугольник как path
    p.moveTo(x + corner, y_bot)
    p.lineTo(x + w - corner, y_bot)
    p.arcTo(x + w - 2*corner, y_bot, x + w, y_bot + 2*corner, startAng=270, extent=90)
    p.lineTo(x + w, y_top - corner)
    p.arcTo(x + w - 2*corner, y_top - 2*corner, x + w, y_top, startAng=0, extent=90)
    p.lineTo(x + corner, y_top)
    p.arcTo(x, y_top - 2*corner, x + 2*corner, y_top, startAng=90, extent=90)
    p.lineTo(x, y_bot + corner)
    p.arcTo(x, y_bot, x + 2*corner, y_bot + 2*corner, startAng=180, extent=90)
    p.close()
    c.clipPath(p, stroke=0, fill=0)
    
    # Рисуем оригинальное изображение без альфа-маски
    c.drawImage(path, x, y_bot, w, h, preserveAspectRatio=True)
    c.restoreState()
    return h

def mask_img(src, dst, radius_ratio=0.03):
    """Скругляю углы PNG. Сохраняет прозрачность там где обрезано."""
    from PIL import Image as PILImage, ImageDraw
    img = PILImage.open(src).convert("RGBA")
    w, h = img.size
    r = int(min(w,h) * radius_ratio)
    # Маска — белый прямоугольник с закруглёнными углами, остальное 0
    mask = PILImage.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,w,h), radius=r, fill=255)
    # Применяем: копируем img, ставим альфу = min(существующая_альфа, mask)
    alpha = img.split()[3] if img.mode == "RGBA" else PILImage.new("L",(w,h),255)
    from PIL import ImageChops
    new_alpha = ImageChops.multiply(alpha, mask) if alpha else mask
    img.putalpha(new_alpha)
    img.save(dst, "PNG")

def screen_path(timestamp):
    """По таймстампу '01_17_10' возвращает полный путь."""
    return f"{SCREENS_DIR}/Screenshot_2026-04-17_at_{timestamp}.png"

# ─── Tables ─────────────────────────────────────────
def ios_table(data, col_widths, head=True, fs_head=8.5, fs_body=9.5, row_h=None,
              anchor_first_col=True, compact=False):
    """McKinsey-style таблица. Длинный текст в ячейках автоматически переносится через Paragraph.

    - Заголовки: UPPERCASE 8.5pt Inter-Semi, серые (label2_real)
    - Тело: 9.5pt Inter, черный
    - Первая колонка при anchor_first_col=True — Inter-Semi (жирнее), служит якорем строки
    - Линии: толстая (0.7pt) над и под заголовком, тонкая (0.25pt) под последней строкой.
      Внутренних линий между строками НЕТ — пространство делает работу разделителя.
    - Паддинги: top/bottom 9pt, left/right 10pt — McKinsey breathing room.
    - compact=True — плотные паддинги (5pt) для референсных таблиц с короткими значениями.
    """
    p_body = ParagraphStyle("cell_body", fontName="Inter", fontSize=fs_body,
                            leading=fs_body+3, textColor=C["label"])
    p_body_anchor = ParagraphStyle("cell_anchor", fontName="Inter-Semi", fontSize=fs_body,
                                   leading=fs_body+3, textColor=C["label"])
    p_head = ParagraphStyle("cell_head", fontName="Inter-Semi", fontSize=fs_head,
                            leading=fs_head+2, textColor=C["label2_real"])

    rows = []
    for ri, row in enumerate(data):
        new_row = []
        for ci, cell in enumerate(row):
            if isinstance(cell, str):
                txt = cell.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                if head and ri == 0:
                    txt = txt.upper()
                    style = p_head
                elif anchor_first_col and ci == 0:
                    style = p_body_anchor
                else:
                    style = p_body
                new_row.append(Paragraph(txt, style))
            else:
                new_row.append(cell)
        rows.append(new_row)

    t = Table(rows, colWidths=col_widths,
              rowHeights=[row_h]*len(rows) if row_h else None)
    vpad = 5 if compact else 9
    style_cmds = [
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("ALIGN",         (0,0), (0,-1),  "LEFT"),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("TOPPADDING",    (0,0), (-1,-1), vpad),
        ("BOTTOMPADDING", (0,0), (-1,-1), vpad),
    ]
    # Первая колонка без левого паддинга — прижата к левому краю содержимого
    style_cmds.append(("LEFTPADDING", (0,0), (0,-1), 0))
    if head:
        head_vpad = 5 if compact else 7
        style_cmds += [
            ("LINEABOVE", (0,0), (-1,0), 0.7, C["label"]),
            ("LINEBELOW", (0,0), (-1,0), 0.7, C["label"]),
            ("TOPPADDING",    (0,0), (-1,0), head_vpad),
            ("BOTTOMPADDING", (0,0), (-1,0), head_vpad),
        ]
    # Тонкая линия под последней строкой — закрывает таблицу
    style_cmds.append(("LINEBELOW", (0,-1), (-1,-1), 0.25, C["sep"]))

    t.setStyle(TableStyle(style_cmds))
    return t

# ─── Section cover ──────────────────────────────────
def draw_section_cover(c, roman, title, subtitle, accent_color):
    """Тёмный разделитель секции в стиле Apple keynote."""
    # Fill whole page with color
    c.setFillColor(accent_color)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Тонкая метка сверху
    c.setFillColor(HexColor("#FFFFFF80"))
    c.setFont("Inter-Semi", 9)
    c.drawString(MARGIN_L, PAGE_H - MARGIN_T, roman)
    # Заголовок
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Inter-Ex", 46)
    lines = wrap_text_lines(c, title, "Inter-Ex", 46, CONTENT_W)
    y = PAGE_H/2 + 40
    for line in lines:
        c.drawString(MARGIN_L, y, line)
        y -= 50
    # Подзаголовок
    c.setFillColor(HexColor("#FFFFFFC0"))
    c.setFont("Inter-Med", 13)
    for line in wrap_text_lines(c, subtitle, "Inter-Med", 13, CONTENT_W*0.75):
        c.drawString(MARGIN_L, y - 14, line)
        y -= 18

def finish_page(c):
    c.showPage()
