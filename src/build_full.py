"""Полная сборка справочника ethnomir.app — 40 страниц."""
import sys
sys.path.insert(0, '/home/claude/ethnomir-v2/src')
from pdfkit import *

# Секции
from sections_01_09 import (
    page_cover, page_toc, page_cover_I, page_I_1, page_I_2,
    page_I_3_market, page_I_4_kpi,
    page_cover_II, page_II_1, page_II_2, page_II_3
)
from sections_III import (
    page_cover_III, page_III_philosophy,
    page_M00, page_M01, page_M01_ext, page_M02, page_M02_ext,
    page_M03, page_M04_main, page_M04_collection, page_M05, page_M06,
    page_M07, page_M08, page_M09_11, page_M13_14
)
from sections_IV import (
    page_cover_IV, page_IV_overview, page_IV_funnel, page_IV_operations,
    page_IV_money_guest, page_IV_content_staff
)
from sections_V_VI import (
    page_cover_V, page_V_founder, page_V_guest_partner, page_V_franchise_investor,
    page_V_staff, page_VI_roadmap, page_VI_appendix
)

OUT = '/home/claude/ethnomir-v2/pdf/ethnomir_spravochnik_v2.pdf'
c = Canvas(OUT, pagesize=A4)
c.setTitle("ethnomir.app — Справочник продукта v2 (Апрель 2026)")
c.setAuthor("BillionsX")
c.setSubject("Справочник продукта ethnomir.app")

# ── Front matter ──
page_cover(c)              # 01
page_toc(c)                # 02

# ── I · Продукт в одном взгляде ──
page_cover_I(c)            # 03
page_I_1(c)                # 04
page_I_2(c)                # 05
page_I_3_market(c)         # 06 (новая)
page_I_4_kpi(c)            # 07 (новая)

# ── II · Архитектура ──
page_cover_II(c)           # 08
page_II_1(c)               # 09
page_II_2(c)               # 10
page_II_3(c)               # 11

# ── III · Функциональные модули ──
page_cover_III(c)          # 12
page_III_philosophy(c)     # 13 (новая)
page_M00(c)                # 14 · M0 Главная
page_M01(c)                # 15 · M1 Билеты (2up)
page_M01_ext(c)            # 16
page_M02(c)                # 17
page_M02_ext(c)            # 18
page_M03(c)                # 19
page_M04_main(c)           # 20
page_M04_collection(c)     # 21
page_M05(c)                # 22
page_M06(c)                # 23
page_M07(c)                # 24
page_M08(c)                # 25
page_M09_11(c)             # 26
page_M13_14(c)             # 27

# ── IV · CRM ──
page_cover_IV(c)           # 28
page_IV_overview(c)        # 29
page_IV_funnel(c)          # 30
page_IV_operations(c)      # 31
page_IV_money_guest(c)     # 32
page_IV_content_staff(c)   # 33

# ── V · Ценностные карты ──
page_cover_V(c)            # 34
page_V_founder(c)          # 35
page_V_guest_partner(c)    # 36
page_V_franchise_investor(c)  # 37
page_V_staff(c)            # 38

# ── VI · Дорожная карта + Приложения ──
page_VI_roadmap(c)         # 39
page_VI_appendix(c)        # 40

c.save()
import os
print(f"Готово. Размер: {os.path.getsize(OUT)/1024:.0f} KB")
print(f"Путь: {OUT}")
