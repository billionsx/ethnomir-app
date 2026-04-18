#!/usr/bin/env python3
"""
Перенумерация v2.2 → v2.3 (52 → 53 стр).
- Матрица с стр.52 перемещена на стр.8
- Новая стр.11 — 4 этапа исполнения
- total 52 → 53
"""
import re
from pathlib import Path

SRC = Path("/home/claude/spr/src")

# MAP: старый_номер (v2.2) → новый_номер (v2.3)
MAP = {
    1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7,
    8:9, 9:10, 10:12, 11:13, 12:14, 13:15,
    14:16, 15:17, 16:18, 17:19, 18:20,
    19:21, 20:22, 21:23, 22:24, 23:25, 24:26, 25:27, 26:28,
    27:29, 28:30, 29:31, 30:32, 31:33, 32:34, 33:35, 34:36,
    35:37, 36:38,
    37:39, 38:40, 39:41, 40:42, 41:43, 42:44, 43:45,
    44:46, 45:47, 46:48, 47:49, 48:50, 49:51,
    50:52, 51:53,
    52:8,
}

def shift(n):
    return MAP.get(n, n)

# TOC-диапазоны: ручная пересборка
TOC_RANGE_MAP = {
    "04-13": "04-15",
    "14-18": "16-20",
    "19-36": "21-38",
    "37-43": "39-45",
    "44-49": "46-51",
    "50-52": "52-53",
}
# Комментарии в заголовках файлов
COMMENT_RANGE_MAP = {
    "(стр. 19-36)": "(стр. 21-38)",
    "(стр. 37-43)": "(стр. 39-45)",
    "(стр. 44-49)": "(стр. 46-51)",
}


def replace_page_num(match):
    n = int(match.group(1))
    return f"page_num={shift(n)}"


def replace_draw_frame_numeric(match):
    n = int(match.group(1))
    return f"draw_page_frame(c, {shift(n)}, 53"


def replace_footer_slash(match):
    n = int(match.group(1))
    return f'"{shift(n):02d} / 53"'


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

    # 1. page_num=N
    text = re.sub(r"page_num=(\d+)", replace_page_num, text)
    # 2. draw_page_frame(c, N, 52, ...)
    text = re.sub(r"draw_page_frame\(c,\s*(\d+),\s*52", replace_draw_frame_numeric, text)
    # 3. draw_page_frame(c, page_num, 52, ...)
    text = re.sub(r"draw_page_frame\(c,\s*page_num,\s*52", "draw_page_frame(c, page_num, 53", text)
    # 4. footer "NN / 52"
    text = re.sub(r'"(\d{2})\s*/\s*52"', replace_footer_slash, text)
    # 5. "СЛОЙ X · NN"
    text = re.sub(r'"СЛОЙ (I{1,3}|IV|V|VI) · (\d{1,2})"', replace_sloy, text)
    # 6. TOC ranges (в кавычках)
    for old, new in TOC_RANGE_MAP.items():
        text = text.replace(f'"{old}"', f'"{new}"')
    # 7. comment range in file header
    for old, new in COMMENT_RANGE_MAP.items():
        text = text.replace(old, new)
    # 8. cross-refs "стр. N-M" (ranges)
    text = re.sub(r"(стр\.\s*)(\d+)-(\d+)", replace_cross_ref_range, text)
    # 9. cross-refs "стр. N" (singles; after ranges handled)
    text = re.sub(r"(стр\.\s*)(\d+)", replace_cross_ref_single, text)
    text = re.sub(r"(стр\.)(\d+)", replace_cross_ref_single, text)  # без пробела

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


for f in sorted(SRC.glob("*.py")):
    if f.name == "pdfkit.py":
        continue
    changed = process_file(f)
    print(f"{'✓' if changed else '-'} {f.name}")
