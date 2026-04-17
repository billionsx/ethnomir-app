#!/usr/bin/env python3
"""
setup.py — автоматическая настройка путей при переносе проекта.

Использование:
    cd ethnomir-spravochnik-v2/
    python3 setup.py

Скрипт перепропишет константы FONT_DIR и SCREENS_DIR в src/pdfkit.py
и OUT в src/build_full.py на абсолютные пути этого репо.
"""
import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
FONTS_PATH = os.path.join(REPO_ROOT, "assets", "fonts")
SCREENS_PATH = os.path.join(REPO_ROOT, "screens")
PDF_OUT = os.path.join(REPO_ROOT, "pdf", "ethnomir_spravochnik_v2.pdf")

def patch_file(path, pattern, replacement):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"✓ patched {path}")
    else:
        print(f"- no change in {path}")

# pdfkit.py: FONT_DIR и SCREENS_DIR
pdfkit_path = os.path.join(REPO_ROOT, "src", "pdfkit.py")
patch_file(pdfkit_path,
    r'FONT_DIR\s*=\s*".*?"',
    f'FONT_DIR = "{FONTS_PATH}"')
patch_file(pdfkit_path,
    r'SCREENS_DIR\s*=\s*".*?"',
    f'SCREENS_DIR = "{SCREENS_PATH}"')

# build_full.py: OUT
build_path = os.path.join(REPO_ROOT, "src", "build_full.py")
patch_file(build_path,
    r"OUT\s*=\s*'.*?'",
    f"OUT = '{PDF_OUT}'")

# Проверка что всё есть
assert os.path.exists(FONTS_PATH), f"Не найдена папка шрифтов: {FONTS_PATH}"
assert os.path.exists(SCREENS_PATH), f"Не найдена папка скринов: {SCREENS_PATH}"
print("\nГотово. Теперь можно запускать:")
print(f"  python3 {os.path.join('src', 'build_full.py')}")
