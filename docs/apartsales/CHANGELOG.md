# CHANGELOG — Apartsales Documentation

Версионирование по semver. Записи в обратном хронологическом порядке.

Формат записи:

```
## [vX.Y] — YYYY-MM-DD — Заголовок изменения

**Документ:** какие файлы затронуты
**Автор:** имя
**Тип:** feat / fix / refactor / docs / break

Описание изменения.
```

---

## [v1.3] — 2026-04-29 — Product Line & Monetization v1 (Шаг 2/2)

**Документы:**
- 🆕 `04-PRODUCT-MONETIZATION-v1.md` (992 строки)
- 🆕 `04-PRODUCT-MONETIZATION-v1.pdf` (20 страниц, 153 KB)
- 📝 `README.md` обновлён со ссылкой на новый документ

**Автор:** Billions X × Claude
**Тип:** feat

Продуктовая линейка и монетизация Apartsales по модели Aviasales × Тинькофф. **Полный цикл онлайн** (поиск → KYC через ЕСИА → Lock → ДДУ через Госключ → эскроу → ипотека → Росреестр) без оффлайн-офисов.

**7 revenue streams:**
1. Core commission (3% от ДДУ) — 60% rev Y1 → 40% Y7
2. Adjacent services (10 streams: Yield, mortgage, юр.пакет, Госключ, эскроу, insurance, furniture, дизайн, переезд, B2B 3D-туры)
3. Subscriptions B2C (Free/Premium 990/Pro 4990) + B2B (Listed/Pro 50K/Enterprise 200K/Strategic)
4. Data — Apartsales Index (public + B2B feed для банков, оценщиков, фондов)
5. Advertising (бренд-объекты, Showcase, спецпроекты — Aviasales-style)
6. Affiliate Apartsales Partners (Tier 1-5: блогеры, Telegram, агентства, B2B-партнёры, корпорации)
7. SaaS / White-label Year 4+

**Ключевые цифры:**
- LTV per buyer: ~607K ₽ (core 297K + adjacent 311K)
- CAC blended: ~85K ₽
- LTV:CAC = 7:1 (vs benchmark 3:1)
- Year 5 target: 22 млрд ₽ revenue, 7 streams
- Year 7: 60 млрд ₽, decacorn-trajectory

**Core insight:** Adjacent revenue per buyer (~310K ₽) почти в 1.5× больше core commission (~297K ₽). Это валидирует диверсификацию через Yield, mortgage, юр.услуги — следуя пути Zillow и PropertyGuru.

**Memory updated:** core vision зафиксирована в slot 22 — "Aviasales × Тинькофф для первичной недвижимости, полный цикл онлайн, ноль оффлайн-офисов".

---



**Документы:**
- 🆕 `03-COMPETITIVE-DEEP-DIVE-v1.md` (1 038 строк)
- 🆕 `03-COMPETITIVE-DEEP-DIVE-v1.pdf` (20 страниц, 153 KB)
- 📝 `README.md` обновлён со ссылкой на новый документ

**Автор:** Billions X × Claude
**Тип:** feat

Создан конкурентный deep-dive — структурный анализ как Apartsales становится чемпионом на рынке первичной недвижимости РФ. 5 категорий конкурентов, deep-dive по топ-5 РФ-игрокам (ЦИАН, Самолёт Плюс, Домклик, Авито, Яндекс), 4 международных бенчмарка (Zillow, PropertyGuru, Idealista, Lianjia). 7 измерений позиционирования, 5 сценариев угроз, защитный playbook, KPI чемпионства.

**Ключевые выводы:**
- ЦИАН 2025: выручка 15.2 млрд ₽, MAU 20.2M, доля 57% — но generalist без специализации
- Самолёт Плюс: 1700+ офисов, но closed ecosystem и нет проектов в Крыму Year 1
- Домклик: mortgage-first, не конкурент по комиссии — потенциальный партнёр Year 2
- Zillow benchmark: $2.6B revenue, 70% от Premier Agent (lead-gen) — валидирует Lead Lock-модель
- PropertyGuru: subscription + fintech + data licensing = модель для adjacent revenue

**Реальные действия:** Домены `apartsales.com` и `apartsales.ru` зарегистрированы (29.04.2026).

---



**Документы:**
- 🆕 `00-MASTER.pdf` (32 страницы, 182 KB)
- 🆕 `01-STRATEGY-v2.0.pdf` (25 страниц, 162 KB)
- 🆕 `02-FINANCIAL-MODEL-v1.pdf` (7 страниц, 90 KB)
- 🆕 `README.pdf` (2 страницы, 65 KB)
- 🆕 `CHANGELOG.pdf` (2 страницы, 55 KB)
- 🆕 `_build_pdfs.sh` — скрипт регенерации PDF из .md
- 📝 `README.md` обновлён: ссылки на оба формата

**Автор:** Billions X × Claude
**Тип:** feat + tooling

Сгенерированы PDF-копии всех markdown-документов через pandoc + xelatex + DejaVu Sans (поддержка кириллицы). Это позволяет просматривать документы без рендера в редакторе. Введён workflow: после каждого изменения в .md → запустить `bash _build_pdfs.sh` → коммит обоих файлов. Зафиксировано как обязательное правило проекта.

---

## [v1.0] — 2026-04-29 — Реструктура репо + Master document

**Документы:**
- 🆕 `docs/apartsales/00-MASTER.md` (создан) — единый справочник-презентация Apartsales (~2000 строк)
- 🆕 `docs/apartsales/README.md` (создан) — навигация по документации
- 🆕 `docs/apartsales/CHANGELOG.md` (создан) — этот файл
- 🔀 `docs/APARTSALES-MODEL-v2.0.md` → `docs/apartsales/01-STRATEGY-v2.0.md` (перенос)
- 🔀 `docs/APARTSALES-FINANCIAL-MODEL-v1.md` → `docs/apartsales/02-FINANCIAL-MODEL-v1.md` (перенос)
- 🔀 `docs/APARTSALES-FINANCIAL-MODEL-v1.xlsx` → `docs/apartsales/02-FINANCIAL-MODEL-v1.xlsx` (перенос)

**Автор:** Billions X × Claude
**Тип:** feat + refactor

Создан Master-документ — единый структурный справочник-презентация, описывающий Apartsales как продукт + стратегию доминирования в Крыму Year 1 + декакорн-арку до РФ-доминирования (Year 5+). Все Apartsales-документы перенесены в выделенную папку `docs/apartsales/` для непрерывной работы и версионирования. Git-история переносов сохранена через `git mv`.

---

## [v0.3] — 2026-04-29 — Apartsales Financial Model v1

**Документ:** `docs/APARTSALES-FINANCIAL-MODEL-v1.md` + `.xlsx`
**Автор:** Billions X × Claude
**Тип:** feat

Создана финансовая модель v1 с 3 сценариями (Bootstrap 30M ₽ / Seed 180M ₽ / Aggressive 350M ₽). 7 листов, 1 023 формулы, 0 ошибок. Помесячный P&L Year 1, 3-Year View, Cap Table & Use of Funds. Рекомендация: Seed.

Коммит: `bd9dc5a`

---

## [v0.2] — 2026-04-29 — Apartsales Villas sub-brand + risk #11

**Документ:** `docs/APARTSALES-MODEL-v2.0.md`
**Автор:** Billions X × Claude
**Тип:** feat

Добавлен суб-бренд Apartsales Villas в список продуктовых модулей (стр. 215). Добавлен риск №11 в таблицу рисков (стр. 870) — бренд-конфликт между именем "Apartsales" (буквально апарты) и скоупом Year 1 включающим виллы 30–60M ₽.

Коммит: `ad7dffd`

---

## [v0.1] — 2026-04-29 — Apartsales Strategic Model v2.0

**Документ:** `docs/APARTSALES-MODEL-v2.0.md` (1 017 строк)
**Автор:** Billions X × Claude
**Тип:** feat

Создана стратегическая модель v2.0 по 7 законам BillionsX (Strategy × Meanings × Product × Packaging × Promotion × Sales × AI = Growth). Российский pivot от глобальной модели Domonly v1.1.

Ключевые решения:
- Имя продукта: Apartsales (apartsales.com)
- Юр. структура: ООО «Апартсейлс» (РФ)
- Bull's-eye: Крым Year 1, инвест-апартаменты 8-25M ₽ + виллы 30-60M ₽
- Скоуп: апарты + квартиры + виллы/таунхаусы
- Монетизация: 3-4% commission с закрытой сделки
- Lead Lock: гибрид Модели 1+3 (агентский договор + сертификат покупателю)

Коммит: `dbd0301`

---

## [v0.0] — Pre-Apartsales era — Domonly Model v1.1

**Документ:** `docs/DOMONLY-MODEL-v1.1.md` (legacy, 926 строк)
**Тип:** docs

Параллельная глобальная стратегия Domonly (cross-border real estate). Сохранена как долгосрочная стратегия Year 5+, к которой Apartsales конвергируется после доминирования на РФ-рынке.
