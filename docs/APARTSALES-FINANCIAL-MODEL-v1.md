# APARTSALES — Financial Model v1

> **3 сценария финансирования: Bootstrap / Seed / Aggressive**
> Year 1 — Крым. Помесячная модель, 1 023 формулы, 7 листов

**Версия:** v1.0 (29 апреля 2026)
**Авторы:** Billions X × Claude
**Связанный документ:** `docs/APARTSALES-MODEL-v2.0.md` — стратегическая модель
**Файл модели:** `docs/APARTSALES-FINANCIAL-MODEL-v1.xlsx`

Этот markdown — **сопроводительный narrative**: методология, ассумпции, сравнение сценариев, рекомендация. **Канонический документ — xlsx-файл**, в котором все числа живые и пересчитываются при изменении ассумпций на листе `Inputs`.

---

## EXECUTIVE SUMMARY — РЕКОМЕНДАЦИЯ

**Рекомендованный сценарий: Seed (~180M ₽).**

| Сценарий | Year 1 сделок | Year 1 Revenue | Year 1 EBITDA | Cash EOY | Дилюция | Risk-adjusted score |
|---|---:|---:|---:|---:|---:|:---:|
| Bootstrap (30M ₽) | 85 | 28M ₽ | -13M ₽ | 17M ₽ | 0% | ⚠️ Слишком тонко |
| **Seed (180M ₽)** | **360** | **130M ₽** | **-16M ₽** | **164M ₽** | **18%** | **✅ Best fit** |
| Aggressive (350M ₽) | 991 | 377M ₽ | +75M ₽ | 425M ₽ | 30% | ⚠️ Execution risk |

### Почему Seed:

1. **Достаточно объёма для proof of model** — 360 сделок Year 1 даёт статистическую значимость для отработки воронки (Bootstrap @ 85 сделок недостаточно).
2. **Сохраняет ~91% инжекта на конец Year 1** (164M из 180M). Достаточный буфер для опережающего найма Year 2.
3. **18% дилюция вменяема** при $10M pre-money. Aggressive 30% — это уже Series A-уровень дилюции на pre-revenue.
4. **EBITDA -16M ₽** — управляемый burn (~1.3M ₽/мес). Y2 уже break-even по модели.
5. **Aggressive выглядит соблазнительно (Y1 EBITDA положительный)**, но требует 70K visitors/month в Декабре Year 1 — это ~14× ramp от старта. Cold launch в Крыму без бренд-узнаваемости это очень амбициозно. Если ramp не достигается, OpEx 302M ₽ съедает раунд за 12 месяцев.

### Когда переходить на Aggressive-режим:

После validation Year 1 (Seed-сценарий) и метрики **CAC payback < 3 месяца** + **closing rate ≥ 25%** — поднимаем Series A 400-600M ₽ в Year 2 и выходим на агрессивный hub-expansion (Сочи, Калининград, КавМинВоды).

---

## СТРУКТУРА МОДЕЛИ

### 7 листов в xlsx:

| Лист | Содержание |
|---|---|
| `README` | Легенда, версия, навигация |
| `Inputs` | Все ассумпции в одном месте (3 сценария в столбцах). Меняй здесь — пересчитывается всё |
| `Headcount` | План найма по месяцам (роли × месяцы × сценарии) |
| `Revenue` | Помесячный build выручки через 5-этапную воронку |
| `P&L Year 1` | Помесячный P&L для всех 3 сценариев |
| `3-Year View` | Year 1 / Year 2 / Year 3 summary |
| `Cap Table` | Структура раунда + Use of Funds + Net cash flow |

### Цветовая легенда (industry standard):

- 🟦 **Синий текст** — hardcoded input (меняй для своих сценариев)
- ⬛ **Чёрный текст** — формула / расчёт
- 🟩 **Зелёный текст** — ссылка на другой лист
- 🟨 **Жёлтый фон** — ключевая ассумпция (особое внимание)

---

## КЛЮЧЕВЫЕ АССУМПЦИИ

### Структура выручки на сделку (одинакова для всех сценариев)

| Метрика | Значение | Источник |
|---|---:|---|
| Avg цена сделки Year 1 (Крым) | 14M ₽ | v2.0 — blended апарты+квартиры+виллы |
| Gross commission rate | 3.0% | Стандарт договора по ст. 1005 ГК РФ |
| Сертификат покупателю | 1.0% | Защитный механизм (clawback из comm.) |
| **Net core revenue / close** | **280K ₽** | 14M × (3% - 1%) |
| Adjacent services / close | 50K / 80K / 100K ₽ | Yield, broker, юр.док |
| **Net total revenue / close** | **330K / 360K / 380K ₽** | core + adjacent |

### Воронка Year 1 (target Dec EOY)

| Этап | Bootstrap | Seed | Aggressive |
|---|---:|---:|---:|
| Visitors / month (Dec) | 20 000 | 40 000 | 70 000 |
| Sign-up rate | 10% | 12% | 13% |
| Activation rate | 30% | 35% | 38% |
| Qualified rate | 22% | 25% | 28% |
| Reservation rate (lead lock) | 55% | 60% | 65% |
| Closing rate | 20% | 23% | 25% |
| **Visitor → Close conversion** | **0.073%** | **0.145%** | **0.225%** |
| **Closes / month (Dec EOY)** | **15** | **58** | **157** |

Ramp от Jan: 3K / 8K / 15K visitors → линейный рост до Dec.

Closes идут с лагом 1.5 месяца от reservations (отражает реальный цикл подписания ДДУ в РФ-новостройке).

### Зарплаты РФ 2026 (gross ₽/мес на 1 FTE, +30% страховых)

| Роль | Bootstrap | Seed | Aggressive |
|---|---:|---:|---:|
| Founder | 200 000 | 400 000 | 500 000 |
| Senior engineer | 350 000 | 380 000 | 400 000 |
| AI/ML specialist | 400 000 | 450 000 | 500 000 |
| BD / Sales | 220 000 | 250 000 | 280 000 |
| Marketing / Content | 200 000 | 250 000 | 280 000 |
| Customer Success | 150 000 | 180 000 | 220 000 |
| Designer | 220 000 | 250 000 | 270 000 |
| Legal / GR | 280 000 | 320 000 | 350 000 |
| Finance / Ops | 250 000 | 280 000 | 300 000 |
| HR / People | — | — | 250 000 |

**Total cost = gross × 1.30** (страховые взносы РФ 2026).

**Bootstrap-логика:** founder comp 200K — это deferred salary (можно даже ниже до точки безубыточности). Минимальная команда, упор на freelance + outsource.

**Seed-логика:** market-aligned salaries, 15 FTE EOY достаточно для Крым-only operations.

**Aggressive-логика:** premium-уровень + agressive scaling, 24 FTE EOY (выше плана из v2.0 — 25 EOY).

### Marketing budget Year 1

| Канал | Bootstrap (12M ₽) | Seed (60M ₽) | Aggressive (140M ₽) |
|---|---:|---:|---:|
| Telegram-каналы | 30% (3.6M) | 35% (21M) | 30% (42M) |
| YouTube-блогеры о Крыме | 20% (2.4M) | 30% (18M) | 30% (42M) |
| SEO + content | 30% (3.6M) | 20% (12M) | 20% (28M) |
| Performance ads VK / Yandex | 10% (1.2M) | 10% (6M) | 15% (21M) |
| Brand / PR / Studio | 10% (1.2M) | 5% (3M) | 5% (7M) |

### Tech-команда (главное конкурентное преимущество модели)

**Founding base: 2 человека (founder + co-founder) + Claude как primary engineer.**

| Сценарий | Senior human engineers Y1 EOY | Затраты на инжиниринг |
|---|---:|---:|
| Bootstrap | 1 (нанят месяц 8) | ~2.7M ₽/год |
| Seed | 2 (CTO + senior) | ~10M ₽/год |
| Aggressive | 6 (CTO + 5 разработчиков) | ~32M ₽/год |

Сравнение: классический PropTech-стартап на 15 FTE в РФ имеет 8-10 инженеров с CFO/CPO добавляет ещё 30-50M ₽/год к payroll. **Apartsales благодаря Claude экономит 30M+ ₽/год на инжинерии без потери velocity.**

---

## P&L YEAR 1 — СВОДКА

### Bootstrap (30M ₽ founder-funded)

| Статья | Year 1 (₽) |
|---|---:|
| Revenue | 28.0M |
| Payroll (с 30% страх.) | 20.0M |
| Marketing | 12.0M |
| Tech infrastructure | 2.4M |
| Office (co-working) | 0.6M |
| Travel (Крым) | 1.5M |
| Legal / договоры / pilots | 1.2M |
| Бухгалтерия / outsource | 0.6M |
| Прочее / резерв | 1.0M |
| BD commission (5% rev) | 1.4M |
| **Total OpEx** | **40.7M** |
| **EBITDA** | **(12.6M)** |
| **Cash EOY** | **17.4M** |

**Месяцев runway:** ~16 (если burn rate сохраняется).

### Seed (180M ₽ при $10M pre-money, 18% дилюция)

| Статья | Year 1 (₽) |
|---|---:|
| Revenue | 129.6M |
| Payroll (с 30% страх.) | 57.2M |
| Marketing | 60.0M |
| Tech infrastructure | 6.0M |
| Office (100m² Москва) | 4.8M |
| Travel | 4.0M |
| Legal | 3.0M |
| Бухгалтерия | 1.2M |
| Прочее | 3.0M |
| BD commission | 6.5M |
| **Total OpEx** | **145.7M** |
| **EBITDA** | **(16.1M)** |
| **Cash EOY** | **163.9M** |

**Месяцев runway:** ~120+ (positive trajectory к break-even Y2).

### Aggressive (350M ₽: Pre-Seed 100M + Seed 250M, 30% дилюция total)

| Статья | Year 1 (₽) |
|---|---:|
| Revenue | 376.6M |
| Payroll | 100.1M |
| Marketing | 140.0M |
| Tech infrastructure | 12.0M |
| Office (250m² Москва) | 9.6M |
| Travel | 8.0M |
| Legal | 5.0M |
| Бухгалтерия | 2.4M |
| Прочее | 6.0M |
| BD commission | 18.8M |
| **Total OpEx** | **301.9M** |
| **EBITDA** | **+74.7M** |
| **Cash EOY** | **424.7M** |

**Year 1 уже cash-positive.** Но требует execution velocity, которая не валидирована данными по Apartsales.

---

## 3-YEAR VIEW — СРАВНЕНИЕ ТРАЕКТОРИЙ

| | Bootstrap | | | Seed | | | Aggressive | | |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| | Y1 | Y2 | Y3 | Y1 | Y2 | Y3 | Y1 | Y2 | Y3 |
| Revenue (M ₽) | 28 | 84 | 168 | 130 | 454 | 1 037 | 377 | 1 506 | 3 766 |
| Headcount EOY | 7 | 12 | 18 | 15 | 30 | 45 | 24 | 53 | 84 |
| Closes (сделки) | 85 | 255 | 510 | 360 | 1 260 | 2 880 | 991 | 3 964 | 9 910 |
| OpEx (M ₽) | 41 | 76 | 122 | 146 | 320 | 524 | 302 | 731 | 1 268 |
| EBITDA (M ₽) | (13) | 8 | 46 | (16) | 133 | 512 | 75 | 776 | 2 498 |
| EBITDA margin | (45%) | 10% | 27% | (12%) | 29% | 49% | 20% | 51% | 66% |

> Y2/Y3 моделируются как мультипликаторы Y1 (revenue ×3-10, headcount ×1.7-3.5). Это иллюстративные траектории, не bottom-up forecasts.

### Сравнение с v2.0 strategic doc:

- v2.0 Year 1 target: 350M ₽ revenue, 25 HC, EBITDA -35% margin → ближе к **Aggressive** сценарию
- v2.0 Year 3 target: 4.5 млрд ₽ revenue, 130 HC → **Aggressive Y3 на 84% траектории** (3.77 млрд)
- **Seed-сценарий — это conservative path к v2.0 amibitions с Year 2 ramp вместо Year 1**

---

## SENSITIVITY (что больше всего двигает результат)

Топ-3 драйвера Year 1 EBITDA по чувствительности (на примере Seed):

| Драйвер | -10% эффект | +10% эффект |
|---|---:|---:|
| **Visitors EOY (40K → 36K/44K)** | EBITDA -10M | EBITDA +10M |
| **Closing rate (23% → 20.7%/25.3%)** | EBITDA -10M | EBITDA +10M |
| **Avg ASP (14M → 12.6M/15.4M)** | EBITDA -13M | EBITDA +13M |

Менее чувствительные: marketing budget mix (даёт ±3M), payroll структура (±5M).

**Главный риск:** провал closing rate. Если 23% → 15% (на 35%), EBITDA Year 1 рушится с -16M до -50M ₽, и cash EOY падает со 164M до 130M. Это не убийственно, но сжимает runway.

---

## USE OF FUNDS — Seed (180M ₽)

| Категория | M ₽ | % |
|---|---:|---:|
| Payroll | 57.2 | 31.8% |
| Marketing & acquisition | 60.0 | 33.3% |
| Tech infrastructure | 6.0 | 3.3% |
| Office | 4.8 | 2.7% |
| Travel | 4.0 | 2.2% |
| Legal / договоры / pilots | 3.0 | 1.7% |
| Бухгалтерия | 1.2 | 0.7% |
| Прочее / резерв | 3.0 | 1.7% |
| BD commission (5% rev) | 6.5 | 3.6% |
| **Total Year 1 OpEx** | **145.7** | **80.9%** |
| Year 1 Revenue (offset) | (129.6) | — |
| **Net cash burn Y1** | **16.1** | 8.9% |
| **Cash remaining EOY** | **163.9** | 91.1% |

**Marketing > Payroll** — это правильная структура для customer-acquisition-driven business. Tech остаётся минимальным благодаря Claude как primary engineer.

---

## ОГРАНИЧЕНИЯ МОДЕЛИ v1 (что улучшать в v1.1)

1. **Y2/Y3 — мультипликаторы, не bottom-up.** Реальная expansion Y2 (Сочи) требует своей воронки и hub-launch costs. Для Series A pitch — нужна детальная модель Y2 hub-by-hub.
2. **Marketing budget равномерно по месяцам.** В реальности Q1 = soft launch (низкие траты), Q3-Q4 = пиковая активность. Нужна сезонная криvая.
3. **Cohort-анализ застройщиков отсутствует.** v2.0 предполагает 25 застройщиков EOY с avg ARR 200K ₽ — это надо отдельным sheet.
4. **Нет tax modeling.** УСН 6% / 15% или ОСН — выбор влияет на cash flow ~5-10% в первые годы.
5. **Нет sensitivity sheet** с интерактивным переключателем bear/base/bull — пока через ручное изменение Inputs.
6. **Cap table — упрощённый.** Нет ESOP pool (стандартно 10% pre-Seed), liquidation preferences, anti-dilution.
7. **Working capital не моделируется.** Между closing ДДУ и поступлением комиссии от застройщика проходит обычно 30-60 дней — это создаёт AR.
8. **Crimea-specific риски не количественно отражены.** Санкционная премия к marketing CPM, банковские ограничения на платежи — структурно в OpEx, но не выделены.

---

## NEXT ITERATIONS — ROADMAP МОДЕЛИ

**v1.1 (через 4-6 недель после первых pilot-данных):**
- Bottom-up Y2 модель с hub-launch costs (Сочи)
- Сезонный профиль marketing
- Cohort-анализ developers (по месяцам онбординга)
- Tax modeling УСН vs ОСН

**v2.0 (после первых 50 закрытых сделок):**
- Replace input estimates с фактическими данными (closing rate, ASP, time-to-close)
- Reverse-engineering CAC по реальным каналам
- Sensitivity sheet с tornado-chart
- LBO/Series A pitch deck appendix

**v3.0 (готовность к Series A):**
- Cross-hub model
- Multi-product (Apartsales Yield, Concierge как отдельные revenue streams)
- IRR / NPV для investors
- Comparable comps (Aviasales, EMC, Самолёт Плюс exit multiples)

---

## INSTRUCTIONS — КАК ИЗМЕНИТЬ МОДЕЛЬ

1. Открыть `APARTSALES-FINANCIAL-MODEL-v1.xlsx` в Excel или LibreOffice
2. Перейти на лист `Inputs`
3. Изменить **синий текст** (input cells) — например, можно протестировать:
   - Что если marketing budget Seed = 90M ₽ вместо 60M? (увеличить визитёров)
   - Что если closing rate = 18% вместо 23%? (понять breakeven point)
   - Что если ASP = 18M ₽ (виллы-heavy mix)? (выручка на сделку растёт)
4. Все остальные листы пересчитываются автоматически
5. Если открываешь в Google Sheets — формулы поддерживаются, но цветовое форматирование может потеряться

**Не меняй чёрный/зелёный текст** — это формулы и cross-sheet ссылки, они должны оставаться нетронутыми.

---

## ПОДПИСЬ

**Разработано:** Billions X × Claude
**Версия:** v1.0 (29 апреля 2026)
**Файлы:**
- `docs/APARTSALES-FINANCIAL-MODEL-v1.md` (этот файл)
- `docs/APARTSALES-FINANCIAL-MODEL-v1.xlsx` (live model, 1 023 формулы, 0 ошибок)

**Связанные документы:**
- `docs/APARTSALES-MODEL-v2.0.md` — стратегическая модель v2.0
- `docs/DOMONLY-MODEL-v1.1.md` — глобальная стратегия v2 (Year 5+)

**Следующий шаг:** обсуждение с Billions X → выбор сценария → детализация выбранного сценария до v1.1 → подготовка pitch deck (если Seed/Aggressive выбраны).

---

*"Модель — это не предсказание, это инструмент для изменения предсказаний под изменения ассумпций."*
