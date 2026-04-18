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
    page_V_founder, page_V_guest_partner, page_V_franchise_investor, page_V_staff,
    page_A_bx_scope, page_A_external_web, page_A_legal
)

OUT = '/home/claude/ethnomir-app/pdf/ethnomir_spravochnik_v2.pdf'
c = Canvas(OUT, pagesize=A4)
c.setTitle("ethnomir.app — Справочник продукта v2.1 (Апрель 2026)")
c.setAuthor("BillionsX")
c.setSubject("Справочник продукта ethnomir.app")
c.setKeywords("ethnomir, app, superapp, этнопарк, ios26, liquidglass, handbook")


# ─── Helper: страница + закладка PDF ────────────────
_bookmark_counter = [0]


def pp(page_func, title=None, section=False):
    """Вызов page_func + закладка в PDF outline.
    section=True → пункт уровня 0 (секция), иначе уровень 1 (страница внутри секции).
    """
    _bookmark_counter[0] += 1
    key = f"p{_bookmark_counter[0]:02d}"
    c.bookmarkPage(key)
    page_func(c)
    if title:
        level = 0 if section else 1
        c.addOutlineEntry(title, key, level=level, closed=False)


# ─── Front matter (уровень 0) ───────────────────────
pp(page_cover, "Обложка", section=True)                                    # 01
pp(page_toc, "Оглавление", section=True)                                   # 02

# ─── I · Продукт в одном взгляде ── (9 страниц) ─────
pp(page_cover_I, "I · Продукт в одном взгляде", section=True)              # 03
pp(page_I_1, "Одно приложение. Весь парк")                                 # 04
pp(page_I_2, "Состояние системы · Апрель 2026")                            # 05
pp(page_I_team, "Команда")                                                  # 06
pp(page_I_3_market, "Рынок суперприложений")                                # 07
pp(page_A_bx_scope, "Объём работ Billions X и этапность")                   # 08 · MOVED
pp(page_I_4_kpi, "Ожидаемый эффект · 4 KPI")                                # 09
pp(page_I_5_meaning_guest, "Смыслы для гостей · 8 крючков")                # 10
pp(page_I_6_meaning_business, "Смыслы для бизнеса · 9 крючков")            # 11
pp(page_I_7_four_pillars, "Четыре столпа приложения")                       # 12

# ─── II · Архитектура и стек ── (5 страниц) ─────────
pp(page_cover_II, "II · Архитектура и стек", section=True)                 # 13
pp(page_II_1, "Три слоя одной системы")                                     # 14
pp(page_II_2, "База данных · 136 таблиц")                                   # 15
pp(page_II_3, "Безопасность и контур поставки")                             # 16
pp(page_II_4_design_language, "Дизайн-язык · iOS 26+ Liquid Glass")         # 17 · NEW

# ─── III · Функциональные модули ── (18 страниц) ────
pp(page_cover_III, "III · Функциональные модули", section=True)            # 18
pp(page_III_philosophy, "Продуктовая линейка · 3 принципа")                # 19
pp(page_III_map, "Карта приложения · 5 вкладок")                           # 20 · NEW
pp(page_M00, "M00 · Главная «Сегодня»")                                     # 21
pp(page_M01, "M01 · Билеты, туры, события")                                 # 22
pp(page_M01_ext, "M01 · Расписание и сертификаты")                          # 23
pp(page_M02, "M02 · Жильё · замена PMS")                                    # 24
pp(page_M02_ext, "M02 · Бронь, гостю, инвестиции")                          # 25
pp(page_M03, "M03 · Услуги и доставка")                                     # 26
pp(page_M04_main, "M04 · Паспорт путешественника")                          # 27
pp(page_M04_collection, "M04 · Коллекции паспорта")                         # 28
pp(page_III_gamification, "Геймификация и балловая система")                # 29 · NEW
pp(page_M05, "M05 · Чеки и QR-экосистема")                                  # 30
pp(page_M06, "M06 · AI-чат, отзывы, промо")                                 # 31
pp(page_M07, "M07 · Хаб 22 лендингов")                                      # 32
pp(page_M08, "M08 · Франшиза")                                              # 33
pp(page_M09_11, "M09-M11 · Календарь, сертификаты, B2B")                    # 34
pp(page_M13_14, "M13-M14 · Уведомления и поиск")                           # 35

# ─── IV · CRM ── (7 страниц) ────────────────────────
pp(page_cover_IV, "IV · CRM — операционная система", section=True)         # 36
pp(page_IV_overview, "Режим «Владелец»")                                    # 37
pp(page_IV_crm_table, "Реестр 23 модулей CRM")                              # 38 · NEW
pp(page_IV_funnel, "Воронка продаж")                                        # 39
pp(page_IV_operations, "Операции и номерной фонд")                          # 40
pp(page_IV_money_guest, "Финансы и гости")                                  # 41
pp(page_IV_content_staff, "Контент и персонал")                             # 42

# ─── V · Ценностные карты ── (6 страниц) ────────────
pp(page_cover_V, "V · Ценностные карты", section=True)                     # 43
pp(page_V_influence, "Влияние приложения · 6 осей")                         # 44 · NEW
pp(page_V_founder, "Для основателя и руководства")                          # 45
pp(page_V_guest_partner, "Для гостей и партнёров")                          # 46
pp(page_V_franchise_investor, "Для франчайзи и инвесторов")                # 47
pp(page_V_staff, "Для персонала")                                           # 48

# ─── ПРИЛОЖЕНИЯ ── (2 страницы) ─────────────────────
pp(page_A_external_web, "Приложение · Внешний цифровой контур", section=True)  # 49
pp(page_A_legal, "Приложение · Юридический контур", section=True)              # 50

c.save()
import os
print(f"Готово. Размер: {os.path.getsize(OUT)/1024:.0f} KB")
print(f"Путь: {OUT}")
