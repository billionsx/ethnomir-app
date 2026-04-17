"""Сборка страниц 01-09 для визуальной проверки дизайна."""
import sys
sys.path.insert(0, '/home/claude/ethnomir-app/src')
from pdfkit import *
from sections_01_09 import (
    page_cover, page_toc, page_cover_I, page_I_1, page_I_2,
    page_cover_II, page_II_1, page_II_2, page_II_3
)

OUT = '/home/claude/ethnomir/preview_01_09.pdf'
c = Canvas(OUT, pagesize=A4)
c.setTitle("ethnomir.app — Справочник продукта (preview 01-09)")

page_cover(c)        # 01
page_toc(c)          # 02
page_cover_I(c)      # 03
page_I_1(c)          # 04
page_I_2(c)          # 05
page_cover_II(c)     # 06
page_II_1(c)         # 07
page_II_2(c)         # 08
page_II_3(c)         # 09

c.save()
import os
print(f"OK. {os.path.getsize(OUT)/1024:.1f} KB -> {OUT}")
