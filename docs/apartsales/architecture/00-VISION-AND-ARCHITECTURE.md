# Apartsales — Vision & Architecture

**Версия:** 1.0 (brainstorm freeze)
**Дата:** 2026-05-01
**Статус:** Утверждено как архитектурный фреймворк
**Owner:** Billions X / Apartsales

---

## 1. Тезис позиционирования

> **«Aviasales × Тинькофф для первичной недвижимости — но мирового масштаба.»**

Apartsales — не маркетплейс. Apartsales — **операционная система мировой первичной недвижимости**: единый протокол, в котором живут застройщик, банк, нотариус, регистратор, УК, инвестор, иностранный покупатель, государство.

Цель — войти в мировую большую тройку PropTech за 5 лет с тройным IPO (Москва, Дубай, Астана), целевая капитализация $10–30B.

---

## 2. Семь столпов продукта (концептуальный каркас)

1. **Геополитика продукта** — RU + мир, мультиязычность с дня 0, экспансия по регионам, мост для иностранных инвесторов.
2. **Слоёная упаковка** — страна → регион → город → застройщик → комплекс → юнит. Победа на каждом слое.
3. **Двусторонний маркетплейс** — клиент (4 цели: жизнь / отдых / инвестиции / работа) ↔ застройщик / УК / собственник.
4. **Поиск и сопоставление** — мегафильтр, ранжирование, AI-матчинг, Apartsales Score™.
5. **Геймификация и удержание** — для застройщика и для клиента.
6. **Стандартизация процессов** — онбординг, лидогенерация без потерь, отчётность, SLA-движок.
7. **Защитный ров (моат)** — 5 уровней моата, описаны в `10-defensibility-moat.md`.

---

## 3. Архитектурные принципы

- **Multi-region, multi-currency, multilingual с дня 0.** 6 языков (RU/EN/AR/CN/TR/ES), 5+ валют включая крипто-rails.
- **Headless content layer.** Все слои упаковки = headless CMS с шаблонами. Landing-страницы под любой объект — без программиста.
- **API-first.** Open API + webhooks для интеграций с любой CRM застройщика (Bitrix24, AmoCRM, Profitbase, 1С).
- **Compliance-first.** KYC/AML мирового уровня встроены с дня 0 — без этого иностранных инвесторов не будет.
- **Mobile-first но web-equal.** Iоs 26 Liquid Glass + Android Material You + Web — три полноценных канала.
- **Online-only с дня 0.** Ни одного офлайн-офиса. Простота и прозрачность как защита от недоверия.
- **YAGNI / DRY / Evidence over claims.** Workflow Superpowers v4.1.1.

---

## 4. Полный реестр идей (62 идеи, разложены по файлам)

### Базовый слой (#1–20) → распределён по тематическим файлам

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 1  | Apartsales Score™                     | 05-trust-and-fintech, 10-moat     |
| 2  | Trust Stack                           | 05-trust-and-fintech              |
| 3  | Mortgage Marketplace                  | 05-trust-and-fintech              |
| 4  | Multi-currency & Crypto Rails         | 05-trust-and-fintech              |
| 5  | Compliance Layer (KYC/AML)            | 05-trust-and-fintech              |
| 6  | AI Concierge / Match Engine           | 06-ai-and-data                    |
| 7  | Digital Twin юнита                    | 06-ai-and-data, 12-tech           |
| 8  | Apartsales Data                       | 06-ai-and-data, 10-moat, 11-monet |
| 9  | Open API & Webhook layer              | 07-developer-platform, 12-tech    |
| 10 | White-label CRM для Excel-застройщиков| 07-developer-platform             |
| 11 | SLA-движок                            | 07-developer-platform             |
| 12 | Apartsales Academy                    | 07-developer-platform, 10-moat    |
| 13 | УК-as-a-Service                       | 08-client-lifecycle               |
| 14 | Resale / Secondary loop               | 08-client-lifecycle               |
| 15 | Permit & Visa Concierge               | 08-client-lifecycle, 03-personas  |
| 16 | Apartsales Points / Lifetime Loyalty  | 08-client-lifecycle               |
| 17 | Marketplace внутри маркетплейса       | 09-ecosystem                      |
| 18 | Локальные эксперты                    | 09-ecosystem, 10-moat             |
| 19 | Multilingual & Multi-region           | 12-tech                           |
| 20 | Headless Content Layer                | 12-tech                           |

### Tier 1 — категориеобразующие (#21–24)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 21 | Pre-Construction Equity Tokens (PCET) | 05-trust-and-fintech, 15-vision   |
| 22 | Reverse Marketplace                   | 02-pillars, 15-vision             |
| 23 | Apartsales Index (AS-Index)           | 06-ai-and-data, 10-moat           |
| 24 | Apartsales Bank (Embedded Finance)    | 05-trust-and-fintech, 11-monet    |

### Tier 2 — сильные инновации (#25–29)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 25 | Autonomous Buyer Agent                | 06-ai-and-data, 15-vision         |
| 26 | Dynamic Pricing Engine                | 06-ai-and-data, 07-developer      |
| 27 | Pre-Construction DAO                  | 02-pillars, 15-vision             |
| 28 | B2B2C через банки/авиа/маркетплейсы   | 10-moat, 13-roadmap               |
| 29 | Live Streaming Auctions               | 02-pillars                        |

### Tier 3 — усилители (#30–32)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 30 | Apartsales Studio (AI-Generated)      | 07-developer-platform             |
| 31 | Owner Social Network                  | 09-ecosystem                      |
| 32 | Generational Residency Bundle         | 08-client-lifecycle, 03-personas  |

### Tier S — 10x идеи (#33–36)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 33 | Apartsales OS                         | 10-moat, 15-vision                |
| 34 | Real Estate Exchange (биржа)          | 11-monet, 15-vision               |
| 35 | Reverse Developer Model               | 02-pillars, 15-vision             |
| 36 | Urban Carbon Credits + ESG Tokens     | 09-ecosystem, 15-vision           |

### Tier A — структурные прорывы (#37–41)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 37 | Apartsales Sovereign (B2G)            | 16-sovereign-and-government       |
| 38 | Predictive Hype Engine                | 06-ai-and-data, 11-monet          |
| 39 | NFT-Title (титул на блокчейне)        | 05-trust-and-fintech, 12-tech     |
| 40 | Apartsales Time Machine               | 06-ai-and-data                    |
| 41 | Embedded Insurance Layer              | 05-trust-and-fintech              |

### Tier B — усилители прорыва (#42–45)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 42 | Concierge Layer для топ-1%            | 08-client-lifecycle               |
| 43 | Apartsales Education for Investors    | 08-client-lifecycle               |
| 44 | Cross-Border Tax Engine               | 05-trust-and-fintech              |
| 45 | Emergency Resale Protection           | 05-trust-and-fintech              |

### Tier X — wild but possible (#46–50)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 46 | Apartsales Constitution               | 16-sovereign, 10-moat             |
| 47 | Apartsales Treaty                     | 16-sovereign                      |
| 48 | Quantum Pricing Engine                | 06-ai-and-data                    |
| 49 | Apartsales Genome                     | 06-ai-and-data                    |
| 50 | Real Estate Prediction Markets        | 06-ai-and-data, 11-monet          |

### Tier Y — мегатренды (#51–56)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 51 | Silver Tsunami Vertical               | 03-personas, 15-vision            |
| 52 | Climate Migration Engine              | 03-personas, 15-vision            |
| 53 | Great Wealth Transfer Product         | 08-client-lifecycle               |
| 54 | War & Crisis Relocation Hub           | 03-personas, 15-vision            |
| 55 | Medical Tourism Real Estate           | 09-ecosystem                      |
| 56 | Education-Linked Real Estate          | 09-ecosystem                      |

### Tier Z — корпоративная стратегия (#57–62)

| #  | Идея                                  | Файл                              |
|----|---------------------------------------|-----------------------------------|
| 57 | M&A Roll-up Strategy                  | 10-moat, 13-roadmap               |
| 58 | Apartsales as Media Empire            | 01-market, 13-roadmap             |
| 59 | Founder Story as IP                   | 01-market                         |
| 60 | Adjacent Luxury Assets                | 09-ecosystem, 15-vision           |
| 61 | Sovereign Wealth Fund Partnerships    | 10-moat, 16-sovereign             |
| 62 | IPO Strategy & Triple Listing         | 13-roadmap, 15-vision             |

---

## 5. Структура документа

```
docs/apartsales/architecture/
├── 00-VISION-AND-ARCHITECTURE.md     ← этот файл (зонтик)
├── 01-market-and-positioning.md       ← конкуренты, большая тройка, медиа, founder IP
├── 02-product-pillars.md              ← 7 столпов продукта
├── 03-personas-and-jobs.md            ← клиент×4 + застройщик + УК + инвестор + миграционные
├── 04-layered-packaging.md            ← страна→регион→город→ЖК→юнит
├── 05-trust-and-fintech.md            ← Score, Trust Stack, Mortgage, Crypto, Bank, NFT-Title
├── 06-ai-and-data.md                  ← Concierge, Twin, Index, Time Machine, Quantum, Genome
├── 07-developer-platform.md           ← Open API, White-label CRM, SLA, Academy, Pricing Engine
├── 08-client-lifecycle.md             ← УК, Resale, Loyalty, Education, Wealth Transfer
├── 09-ecosystem-marketplace.md        ← long-tail сервисы, Owner Network, Medical, Education, Luxury
├── 10-defensibility-moat.md           ← 5 моатов, anti-copy стратегия
├── 11-monetization.md                 ← подписка/комиссия/data/insurance/exchange
├── 12-tech-architecture.md            ← stack, multi-region, headless CMS, blockchain rails
├── 13-roadmap-and-geo.md              ← фазы 1–4, география, M&A, IPO
├── 14-kpis-and-metrics.md             ← North Star, OKRs, GMV, retention, NPS
├── 15-vision-2030.md                  ← мировой игрок, Tier S/X/Y/Z идеи
└── 16-sovereign-and-government.md     ← B2G, Constitution, Treaty, SWF
```

---

## 6. Roadmap фаз (краткий зонт)

| Фаза   | Срок          | Фокус                                                  | Tier идей       |
|--------|---------------|--------------------------------------------------------|-----------------|
| **0**  | M0–M3         | Спецификация, дизайн, MVP-скелет                       | основа          |
| **1**  | M3–M12        | MVP запуск, Крым+Сочи, 50 застройщиков, 5K юнитов      | #1–20 + #21–22  |
| **2**  | M12–M24       | Мультирегион РФ + ОАЭ + Турция, AS-Index, B2B2C        | #23–32, #38–45  |
| **3**  | M24–M48       | Мировой игрок, Bank, Exchange, Sovereign, Carbon       | #33–37, #46–58  |
| **4**  | M48–M60       | IPO triple-listing, Luxury Assets, Wealth Transfer     | #59–62          |

---

## 7. Принципы документа

- Документ **живой**. Все 62 идеи могут быть переработаны на основе данных рынка.
- Идеи не равны фичам — это **архитектурные ставки**. Каждая описывается отдельно в тематическом файле.
- Каждая идея в тематическом файле имеет: тезис / зачем / как / метрика успеха / риски / зависимости.
- **Этот документ — единственная истина** по полному списку идей. Если идея не упомянута здесь — её нет в архитектуре.

---

## 8. Что дальше

1. Этот документ зафиксирован в репо как **архитектурный фреймворк v1.0**.
2. Следующий шаг — **матрица приоритизации** (Impact × Effort × Defensibility × Speed) → топ-15 для MVP. Файл `14-kpis-and-metrics.md` содержит drafted version.
3. После приоритизации — детальные спеки по топ-15 идеям в формате Superpowers v4.1.1 (spec → design → write-plan → TDD).
4. До MVP — никаких новых идей в этот документ. Заморозка на исполнение.

---

**Owner:** Billions X
**Approved by:** Евгений Иванов (Apartsales / EthnoMir)
**Co-author:** Claude (Billions X tech team)
