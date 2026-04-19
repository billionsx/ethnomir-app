#!/usr/bin/env python3
"""v2.4 → v2.5 (54 → 55 стр). Новая стр.4, все >=4 сдвигаются на +1."""
import re
from pathlib import Path

SRC = Path("/home/claude/spr/src")
MAP = {n: n if n < 4 else n + 1 for n in range(1, 55)}

TOC_RANGE_MAP = {
    "04-16": "04-17",
    "17-21": "18-22",
    "22-39": "23-40",
    "40-46": "41-47",
    "47-52": "48-53",
    "53-54": "54-55",
}


def shift(n):
    return MAP.get(n, n)


def process_file(path):
    text = path.read_text(encoding="utf-8")
    original = text

    text = re.sub(r"page_num=(\d+)", lambda m: f"page_num={shift(int(m.group(1)))}", text)
    text = re.sub(r"draw_page_frame\(c,\s*(\d+),\s*54",
                  lambda m: f"draw_page_frame(c, {shift(int(m.group(1)))}, 55", text)
    text = re.sub(r"draw_page_frame\(c,\s*page_num,\s*54",
                  "draw_page_frame(c, page_num, 55", text)
    text = re.sub(r'"(\d{2})\s*/\s*54"',
                  lambda m: f'"{shift(int(m.group(1))):02d} / 55"', text)
    text = re.sub(r'"СЛОЙ (I{1,3}|IV|V|VI) · (\d{1,2})"',
                  lambda m: f'"СЛОЙ {m.group(1)} · {shift(int(m.group(2))):02d}"', text)
    for old, new in TOC_RANGE_MAP.items():
        text = text.replace(f'"{old}"', f'"{new}"')
    text = re.sub(r"(стр\.\s*)(\d+)-(\d+)",
                  lambda m: f"{m.group(1)}{shift(int(m.group(2)))}-{shift(int(m.group(3)))}", text)
    text = re.sub(r"(стр\.\s*)(\d+)",
                  lambda m: f"{m.group(1)}{shift(int(m.group(2)))}", text)
    text = re.sub(r"(стр\.)(\d+)",
                  lambda m: f"{m.group(1)}{shift(int(m.group(2)))}", text)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


for f in sorted(SRC.glob("*.py")):
    if f.name == "pdfkit.py":
        continue
    print(f"{'✓' if process_file(f) else '-'} {f.name}")
