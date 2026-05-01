# Apartsales — Architecture Framework v1.0

**Brainstorm-фриз:** 2026-05-01
**Owner:** Billions X (Евгений Иванов)
**Total ideas:** 62
**Total files:** 17

---

## Что это

Архитектурный фреймворк проекта **Apartsales** — глобальной PropTech-платформы первичной недвижимости, разрабатываемой Billions X.

В этой папке зафиксированы **62 идеи**, распределённые по 17 тематическим документам, образующие единый архитектурный план на 5-летний горизонт.

Это **не feature backlog** и не product roadmap. Это **архитектурные ставки** — концептуальный каркас, на основе которого будут составлены детальные продуктовые спецификации в следующей фазе.

---

## Карта документов

| Файл                              | О чём                                              |
|-----------------------------------|---------------------------------------------------|
| `00-VISION-AND-ARCHITECTURE.md`   | Главный зонтик. Реестр всех 62 идей с маппингом. |
| `01-market-and-positioning.md`    | Рынок $2.9T, конкуренты, big-3 цель, медиа.       |
| `02-product-pillars.md`           | 7 столпов продукта.                                |
| `03-personas-and-jobs.md`         | 17 персон + JTBD.                                  |
| `04-layered-packaging.md`         | Слои: страна → юнит. SEO-моат на 30M страницах.   |
| `05-trust-and-fintech.md`         | Score, Trust Stack, Mortgage, Bank, NFT-Title.    |
| `06-ai-and-data.md`               | Concierge, Twin, Index, Genome, Quantum, Hype.   |
| `07-developer-platform.md`        | API, White-label CRM, SLA, Academy, Pricing.     |
| `08-client-lifecycle.md`          | УК, Resale, Loyalty, Education, Wealth Transfer.  |
| `09-ecosystem-marketplace.md`     | Long-tail сервисы, Owner Network, Carbon, Luxury. |
| `10-defensibility-moat.md`        | 5 моатов, anti-copy стратегия.                     |
| `11-monetization.md`              | 10 revenue streams. Y5 = $5B revenue.              |
| `12-tech-architecture.md`         | Stack, multi-region, headless CMS, blockchain.    |
| `13-roadmap-and-geo.md`           | Фазы M0–M60, география, M&A, IPO.                  |
| `14-kpis-and-metrics.md`          | North Star, OKRs, GMV, retention, NPS.             |
| `15-vision-2030.md`               | Мировой игрок, $30–50B капитализация.             |
| `16-sovereign-and-government.md`  | B2G, Constitution, Treaty, SWF.                    |

---

## Ключевые цифры (5-летний горизонт)

| Метрика                | Y1     | Y3      | Y5         |
|------------------------|--------|---------|------------|
| GMV                    | 5B ₽   | 200B ₽  | 2T ₽       |
| Revenue                | 220M ₽ | 32B ₽   | 500B ₽     |
| MAU                    | 50K    | 5M      | 50M        |
| Сделки                 | 200    | 100K    | 500K       |
| Регионы                | 1      | 30      | 50         |
| Команда                | 60     | 1000    | 5000       |
| Капитализация (target) | —      | $5–10B  | $30–50B    |

---

## Финансирование

- **Seed (закрыт):** 180M ₽ (заявлено).
- **Series A (M9):** 1–2B ₽.
- **Series B (M18):** 5–10B ₽ + первый SWF round.
- **Series C (M30):** 30–50B ₽.
- **Pre-IPO (M48):** strategic SWF rounds.
- **Triple-listing IPO (M60):** Москва + Дубай + Астана.

---

## Принципы документа

1. **Этот документ — единственная истина по полному списку идей.**
   Если идея не упомянута здесь — её нет в архитектуре.

2. **Документ живой,** но изменения происходят **через формальный процесс** (предложение → обсуждение → утверждение).

3. **До MVP — никаких новых идей.** Заморозка на исполнение.

4. **Каждое решение проверяется по `15-vision-2030.md`** через 5 final tests.

5. **Принципы исполнения:** Superpowers v4.1.1 — spec → design → write-plan → TDD.

---

## Связанные документы

В корневой папке `docs/apartsales/` (вне `architecture/`) находятся:
- `00-MASTER.md` — мастер-документ.
- `01-STRATEGY-v2.0.md` — стратегия.
- `02-FINANCIAL-MODEL-v1.{md,pdf,xlsx}` — финансовая модель.
- `03-COMPETITIVE-DEEP-DIVE-v1.{md,pdf}` — конкурентный анализ.
- `04-PRODUCT-MONETIZATION-v1.{md,pdf}` — монетизация.
- `05-NAPKIN-PITCH-v1.{md,pdf}` — pitch.
- `06-PRODUCT-TREE-v1.{md,pdf}` — продуктовое дерево.
- `07-TECHNICAL-ARCHITECTURE-v1.{md,pdf}` — техническая архитектура (детально).
- `08-VISION-EXPANSION-v1.{md,pdf}` — расширение видения.

Эти файлы — **детализированные продуктовые документы**.
Файлы в `architecture/` — **зонтичный архитектурный фреймворк**, объединяющий 62 идеи в единую систему.

---

## Что дальше

1. **Review & approval** — Билл­ионс X / Евгений Иванов.
2. **Priority matrix** — Impact × Effort × Defensibility × Speed → топ-15 для MVP.
3. **Detailed specs** для топ-15 идей по формату Superpowers v4.1.1.
4. **Phase 0 execution** — M0–M3 (foundation).

---

**Co-author:** Claude (Billions X tech team)
**Last updated:** 2026-05-01
