"""Полная сборка справочника ethnomir.app — 47 страниц (v2.1)."""
import sys
sys.path.insert(0, '/home/claude/ethnomir-app/src')
from pdfkit import *

# Секции
from sections_01_09 import (
    page_cover, page_toc, page_cover_I, page_I_1, page_I_2, page_I_team,
    page_I_3_market, page_I_4_kpi,
    page_I_5_meaning_guest, page_I_6_meaning_business, page_I_7_four_pillars,
    page_cover_II, page_II_1, page_II_2, page_II_3, page_II_4_design_language,
)
from sections_III import (
    page_cover_III, page_III_philosophy, page_III_map,
    page_M00, page_M01, page_M01_ext, page_M02, page_M02_ext,
    page_M03, page_M04_main, page_M04_collection, page_III_gamification,
    page_M05, page_M06, page_M07, page_M08, page_M09_11, page_M13_14
)
from sections_IV import (
    page_cover_IV, page_IV_overview, page_IV_crm_table,
    page_IV_funnel, page_IV_operations, page_IV_money_guest, page_IV_content_staff
)
from sections_V_VI import (
    page_cover_V, page_V_influence,
    page_V_founder, page_V_guest_partner, page_V_franchise_investor, page_V_staff
)

OUT = '/home/claude/ethnomir-app/pdf/ethnomir_spravochnik_v2.pdf'
c = Canvas(OUT, pagesize=A4)
c.setTitle("ethnomir.app — Справочник продукта v2.1 (Апрель 2026)")
c.setAuthor("BillionsX")
c.setSubject("Справочник продукта ethnomir.app")

# ── Front matter ──
page_cover(c)                       # 01
page_toc(c)                         # 02

# ── I · Продукт в одном взгляде ── (9 страниц)
page_cover_I(c)                     # 03
page_I_1(c)                         # 04
page_I_2(c)                         # 05
page_I_team(c)                      # 06
page_I_3_market(c)                  # 07
page_I_4_kpi(c)                     # 08
page_I_5_meaning_guest(c)           # 09 · NEW
page_I_6_meaning_business(c)        # 10 · NEW
page_I_7_four_pillars(c)            # 11 · NEW

# ── II · Архитектура и стек ── (5 страниц)
page_cover_II(c)                    # 12
page_II_1(c)                        # 13
page_II_2(c)                        # 14
page_II_3(c)                        # 15
page_II_4_design_language(c)        # 16 · NEW

# ── III · Функциональные модули ── (18 страниц)
page_cover_III(c)                   # 17
page_III_philosophy(c)              # 18
page_III_map(c)                     # 19 · NEW
page_M00(c)                         # 20
page_M01(c)                         # 21
page_M01_ext(c)                     # 22
page_M02(c)                         # 23
page_M02_ext(c)                     # 24
page_M03(c)                         # 25
page_M04_main(c)                    # 26
page_M04_collection(c)              # 27
page_III_gamification(c)            # 28 · NEW
page_M05(c)                         # 29
page_M06(c)                         # 30
page_M07(c)                         # 31
page_M08(c)                         # 32
page_M09_11(c)                      # 33
page_M13_14(c)                      # 34

# ── IV · CRM ── (7 страниц)
page_cover_IV(c)                    # 35
page_IV_overview(c)                 # 36
page_IV_crm_table(c)                # 37 · NEW
page_IV_funnel(c)                   # 38
page_IV_operations(c)               # 39
page_IV_money_guest(c)              # 40
page_IV_content_staff(c)            # 41

# ── V · Ценностные карты ── (6 страниц)
page_cover_V(c)                     # 42
page_V_influence(c)                 # 43 · NEW
page_V_founder(c)                   # 44
page_V_guest_partner(c)             # 45
page_V_franchise_investor(c)        # 46
page_V_staff(c)                     # 47

c.save()
import os
print(f"Готово. Размер: {os.path.getsize(OUT)/1024:.0f} KB")
print(f"Путь: {OUT}")

