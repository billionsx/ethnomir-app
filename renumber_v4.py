#!/usr/bin/env python3
"""
Перенумерация v2.3.x → v2.4 (53 → 54 страницы).
Новая страница вставлена после стр.4, все >=5 сдвигаются на +1.
"""
import re
from pathlib import Path

SRC = Path("/home/claude/spr/src")

# MAP: старый_номер → новый_номер
MAP = {n: n if n < 5 else n + 1 for n in range(1, 54)}

# TOC-диапазоны
TOC_RANGE_MAP = {
    "04-15": "04-16",
    "16-20": "17-21",
    "21-38": "22-39",
    "39-45": "40-46",
    "46-51": "47-52",
    "52-53": "53-54",
}

COMMENT_RANGE_MAP = {
    "(стр. 22-39)": "(стр. 22-39)",   # внутри файлов — обновим отдельно если надо
}


def shift(n):
    return MAP.get(n, n)


def replace_page_num(match):
    n = int(match.group(1))
    return f"page_num={shift(n)}"


def replace_draw_frame_numeric(match):
    n = int(match.group(1))
    return f"draw_page_frame(c, {shift(n)}, 54"


def replace_footer_slash(match):
    n = int(match.group(1))
    return f'"{shift(n):02d} / 54"'


def replace_sloy(match):
    roman = match.group(1)
    n = int(match.group(2))
    return f'"СЛОЙ {roman} · {shift(n):02d}"'


def replace_cross_ref_range(match):
    prefix = match.group(1)
    a = int(match.group(2))
    b = int(match.group(3))
    return f"{prefix}{shift(a)}-{shift(b)}"


def replace_cross_ref_single(match):
    prefix = match.group(1)
    n = int(match.group(2))
    return f"{prefix}{shift(n)}"


def process_file(path):
    text = path.read_text(encoding="utf-8")
    original = text
    text = re.sub(r"page_num=(\d+)", replace_page_num, text)
    text = re.sub(r"draw_page_frame\(c,\s*(\d+),\s*53", replace_draw_frame_numeric, text)
    text = re.sub(r"draw_page_frame\(c,\s*page_num,\s*53", "draw_page_frame(c, page_num, 54", text)
    text = re.sub(r'"(\d{2})\s*/\s*53"', replace_footer_slash, text)
    text = re.sub(r'"СЛОЙ (I{1,3}|IV|V|VI) · (\d{1,2})"', replace_sloy, text)
    for old, new in TOC_RANGE_MAP.items():
        text = text.replace(f'"{old}"', f'"{new}"')
    text = re.sub(r"(стр\.\s*)(\d+)-(\d+)", replace_cross_ref_range, text)
    text = re.sub(r"(стр\.\s*)(\d+)", replace_cross_ref_single, text)
    text = re.sub(r"(стр\.)(\d+)", replace_cross_ref_single, text)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


for f in sorted(SRC.glob("*.py")):
    if f.name == "pdfkit.py":
        continue
    changed = process_file(f)
    print(f"{'✓' if changed else '-'} {f.name}")
