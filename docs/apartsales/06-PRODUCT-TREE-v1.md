# APARTSALES — PRODUCT TREE v1

> **Полное дерево онлайн-процессов, функций, услуг и продуктов Apartsales.**
> Что строим, в каком порядке, и какая логика разворачивания.

**Версия:** v1.0 (30 апреля 2026)
**Документ:** `docs/apartsales/06-PRODUCT-TREE-v1.md`
**Авторы:** Billions X × Claude
**Связанные:** [00-MASTER.md](00-MASTER.md) · [04-PRODUCT-MONETIZATION-v1.md](04-PRODUCT-MONETIZATION-v1.md) · [05-NAPKIN-PITCH-v1.md](05-NAPKIN-PITCH-v1.md)

---

## TABLE OF CONTENTS

- [0. Карта дерева](#0-карта-дерева)
- [1. CORE TRANSACTION FLOW — позвоночник продукта](#1-core-transaction-flow)
- [2. AI / INTELLIGENCE LAYER — мозг платформы](#2-ai--intelligence-layer)
- [3. ADJACENT SERVICES — per-deal монетизация](#3-adjacent-services)
- [4. SUBSCRIPTIONS — recurring revenue](#4-subscriptions)
- [5. CONTENT & GROWTH ENGINE](#5-content--growth-engine)
- [6. INVESTOR PORTFOLIO TOOLS — для тех, кто уже купил](#6-investor-portfolio-tools)
- [7. B2B / SAAS — Year 3+](#7-b2b--saas)
- [8. SUB-BRANDS — отдельные продуктовые линии](#8-sub-brands)
- [9. FUTURE EXPANSIONS — Year 4+](#9-future-expansions)
- [10. Таймлайн запуска по горизонтам](#10-таймлайн-запуска-по-горизонтам)
- [11. Ключевая логика дерева](#11-ключевая-логика-дерева)

---

## 0. Карта дерева

```
APARTSALES PLATFORM
│
├── 1. CORE TRANSACTION FLOW — позвоночник продукта
│   │   (полный цикл сделки онлайн, ноль оффлайн)
│   │
│   ├── 1.1 SEARCH — Поиск
│   ├── 1.2 SELECT — Изучение объекта
│   ├── 1.3 KYC — Верификация личности
│   ├── 1.4 LOCK — Apartsales Lock 🔒 (наш core IP)
│   ├── 1.5 CONTRACT — Договор
│   ├── 1.6 ESCROW — Эскроу
│   ├── 1.7 MORTGAGE — Ипотека
│   ├── 1.8 PAY — Оплата
│   └── 1.9 REGISTER — Росреестр
│
├── 2. AI / INTELLIGENCE LAYER — мозг платформы
│   ├── 2.1 Yield Predictor (ML, точность ±15%)
│   ├── 2.2 Price Forecast (3–5 лет)
│   ├── 2.3 Developer Risk Score (банкротство/срыв)
│   ├── 2.4 ROI-калькулятор (yield + capital appreciation + налоги)
│   ├── 2.5 Apartsales Index — публичный индекс цен
│   ├── 2.6 AI-чат (24/7, primary support)
│   ├── 2.7 AI-чек ДДУ
│   ├── 2.8 AI-фото-анализ ремонта/планировки
│   └── 2.9 AI-генератор listing-карточек для застройщиков
│
├── 3. ADJACENT SERVICES — per-deal монетизация
│   │   (всё, что нужно после "купил")
│   ├── 3.1 Apartsales Yield — управление арендой
│   ├── 3.2 Mortgage Broker (комиссия с банка)
│   ├── 3.3 Insurance Broker (титульное / ипотечное / имущества)
│   ├── 3.4 Юр-пакет (DDU-чек, эскроу-аудит, налоги)
│   ├── 3.5 Furniture / Меблировка под ключ
│   ├── 3.6 Дизайн интерьера
│   ├── 3.7 Ремонт под ключ (B2B-агрегация подрядчиков)
│   ├── 3.8 Переезд / Клининг
│   ├── 3.9 Налоговая оптимизация (3-НДФЛ, ИП-режим)
│   ├── 3.10 Smart-Home pre-install (Яндекс / Сбер / Tuya)
│   └── 3.11 Apartsales Concierge — личный менеджер для премиума
│
├── 4. SUBSCRIPTIONS — recurring revenue
│   ├── 4.1 B2C (Free / Premium 990 ₽ / Pro Investor 4 990 ₽)
│   └── 4.2 B2B (Listed / Pro 50K / Enterprise 200K / Strategic)
│
├── 5. CONTENT & GROWTH ENGINE
│   ├── 5.1 Apartsales Studio (Tinkoff Journal для недвижимости)
│   ├── 5.2 Apartsales Partners (Travelpayouts-style affiliate)
│   ├── 5.3 Showcase / Branded listings (рекламная выручка)
│   └── 5.4 Apartsales Academy
│
├── 6. INVESTOR PORTFOLIO TOOLS — для тех, кто уже купил
│   ├── 6.1 Personal Dashboard (метрики портфеля)
│   ├── 6.2 Yield-tracking в реальном времени
│   ├── 6.3 Capital appreciation graph
│   ├── 6.4 Налоговый календарь и напоминания
│   ├── 6.5 Exit-planner (когда и как продать)
│   ├── 6.6 Документы (ДДУ, ЕГРН, страховки) в облаке
│   ├── 6.7 Re-financing советник (новые ставки → economy)
│   └── 6.8 Reinvest-предложения (apartsales pre-sale)
│
├── 7. B2B / SAAS — Year 3+
│   ├── 7.1 Apartsales API (открытое, как Тинькофф)
│   ├── 7.2 Apartsales Pro (SaaS для агентств)
│   ├── 7.3 Apartsales White-label
│   └── 7.4 Apartsales Index Feed (Bloomberg-style для РФ-недвиги)
│
├── 8. SUB-BRANDS — отдельные продуктовые линии
│   ├── 8.1 Apartsales 🏠     — апарты + квартиры (core)
│   ├── 8.2 Apartsales Villas 🏡 — премиум 30–80М ₽
│   ├── 8.3 Apartsales Yield 💼  — rentals management
│   ├── 8.4 Apartsales Studio 📰 — контент-медиа
│   ├── 8.5 Apartsales Index 📊  — индекс цен
│   ├── 8.6 Apartsales Partners 🤝 — affiliate
│   ├── 8.7 Apartsales Pro 🛠     — SaaS
│   ├── 8.8 Apartsales Academy 🎓 — обучение
│   └── 8.9 Apartsales Concierge 👤 — premium-сервис
│
└── 9. FUTURE EXPANSIONS — Year 4+
    ├── 9.1 Apartsales Commercial — офисы, retail, склады
    ├── 9.2 Apartsales Secondary — вторичный рынок (Y4+)
    ├── 9.3 Apartsales Global ↔ Domonly — cross-border
    ├── 9.4 Apartsales Bank — лицензия НКО / встроенные платежи
    ├── 9.5 Apartsales Insurance — собственный insurtech-продукт
    ├── 9.6 Apartsales Tokenized — фракционные доли (DeFi/web3)
    └── 9.7 Apartsales Build — co-investment в новые ЖК
```

---

## 1. CORE TRANSACTION FLOW

Позвоночник продукта. Полный цикл сделки онлайн, ноль оффлайн.

### 1.1 SEARCH — Поиск

- AI-консьерж (chat-first, primary UX)
- Семантический поиск ("апарты до 12М с морем")
- Гео-поиск на карте + drone-видео слой
- Фильтры: чек / yield / срок сдачи / класс
- Saved searches + smart alerts
- Сравнение объектов (до 4 в одной сетке)

### 1.2 SELECT — Изучение объекта

- 3D-туры (Matterport-class)
- Drone fly-by видео ЖК
- Live-stream показы (по запросу)
- Карточка юнита: планировки, виды, документы
- Инфраструктура вокруг (школы/пляж/еда)
- История цен (как на Aviasales по билетам)
- Reviews от уже купивших

### 1.3 KYC — Верификация личности

- Вход через ЕСИА (Госуслуги)
- Биометрия (фото + видео-селфи)
- Авто-проверка паспорта
- Анти-фрод скоринг

### 1.4 LOCK — Apartsales Lock 🔒 (наш core IP)

- SMS-верификация лида в CRM застройщика
- Юр.фиксация (агентский договор ст. 1005 ГК РФ)
- PDF-сертификат покупателю на 1% скидку
- Уникальный код-билет (как boarding pass)
- Tracking: статус лида в реальном времени

### 1.5 CONTRACT — Договор

- Шаблон ДДУ под застройщика
- Электронная подпись через Госключ
- AI-чек ДДУ (красные флаги)
- Юр-консультация (опц., платно)

### 1.6 ESCROW — Эскроу

- API Сбер / Тинькофф / ВТБ
- Открытие счёта в 1 клик
- Tracking движения средств

### 1.7 MORTGAGE — Ипотека

- Мульти-банк скоринг (5+ банков параллельно)
- Авто-сравнение ставок
- Подача заявки в 1 клик
- Семейная / IT / Военная / Сельская

### 1.8 PAY — Оплата

- ЮKassa (карты)
- СБП (мгновенно, 0.4%)
- Apple Pay / Google Pay
- Корпоративный счёт (B2B)

### 1.9 REGISTER — Росреестр

- Подача заявления онлайн через Госуслуги
- Tracking регистрации
- Получение выписки ЕГРН в приложении

---

## 2. AI / INTELLIGENCE LAYER

Мозг платформы. Уникальный конкурентный слой.

- **2.1 Yield Predictor** — ML-модель прогноза доходности от аренды, точность ±15%
- **2.2 Price Forecast** — прогноз цены на 3–5 лет вперёд по локации/ЖК
- **2.3 Developer Risk Score** — скоринг риска банкротства/срыва сроков застройщика
- **2.4 ROI-калькулятор** — комплекс: yield + capital appreciation + налоги + ипотека
- **2.5 Apartsales Index** — публичный индекс цен (PR-инструмент + B2B feed)
- **2.6 AI-чат** — 24/7, primary support, замещает агента
- **2.7 AI-чек ДДУ** — автоматическое выявление красных флагов в договоре
- **2.8 AI-фото-анализ** — ремонт/планировка по фото
- **2.9 AI-генератор listing-карточек** — для застройщиков (B2B)

---

## 3. ADJACENT SERVICES

Per-deal монетизация. Всё, что нужно после "купил".

- **3.1 Apartsales Yield** — управление арендой (поиск арендаторов, динамическое ценообразование, чек-ин/чек-аут, финансовые отчёты, 8–12% от rent-roll)
- **3.2 Mortgage Broker** — комиссия с банка
- **3.3 Insurance Broker** — титульное / ипотечное / имущества
- **3.4 Юр-пакет** — DDU-чек, эскроу-аудит, налоги
- **3.5 Furniture / Меблировка** — пакеты Эконом/Комфорт/Премиум, партнёры Hoff/IKEA-аналоги/локальные
- **3.6 Дизайн интерьера** — AI-визуализация (3D рендер) + сеть архитекторов-партнёров
- **3.7 Ремонт под ключ** — B2B-агрегация подрядчиков
- **3.8 Переезд / Клининг**
- **3.9 Налоговая оптимизация** — 3-НДФЛ, ИП-режим
- **3.10 Smart-Home pre-install** — Яндекс / Сбер / Tuya
- **3.11 Apartsales Concierge** — личный менеджер для премиума

---

## 4. SUBSCRIPTIONS

### 4.1 B2C

| Тариф | Цена | Фичи |
|---|---|---|
| Free | 0 ₽ | Поиск, базовые карточки |
| Premium | 990 ₽/мес | Yield-прогноз, alerts, ROI-калькулятор |
| Pro Investor | 4 990 ₽/мес | Портфельный режим, API, приоритет на закрытые pre-sale |

### 4.2 B2B (застройщики/агентства)

| Тариф | Цена | Фичи |
|---|---|---|
| Listed | 0 ₽ | Базовый листинг |
| Pro | 50K ₽/мес | Branded listing + аналитика |
| Enterprise | 200K ₽/мес | CRM-интеграция + SLA |
| Strategic | по запросу | Эксклюзив-партнёрство в регионе |

---

## 5. CONTENT & GROWTH ENGINE

- **5.1 Apartsales Studio** — Tinkoff Journal для недвижимости (лонгриды, видео-обзоры ЖК, YouTube, Telegram, Newsletter)
- **5.2 Apartsales Partners** — Travelpayouts-style affiliate (кабинет, реф-ссылки, выплаты от 0.5% сделки, top-100 leaderboard)
- **5.3 Showcase / Branded listings** — рекламная выручка (приоритет в выдаче, спецпроекты, push-кампании)
- **5.4 Apartsales Academy** — курсы для инвесторов (Yield 101) + сертификация партнёров-блогеров

---

## 6. INVESTOR PORTFOLIO TOOLS

Для тех, кто уже купил. Удерживает retention и драйвит reinvest.

- **6.1 Personal Dashboard** — метрики портфеля
- **6.2 Yield-tracking** в реальном времени
- **6.3 Capital appreciation graph**
- **6.4 Налоговый календарь** и напоминания
- **6.5 Exit-planner** — когда и как продать
- **6.6 Документы** — ДДУ, ЕГРН, страховки в облаке
- **6.7 Re-financing советник** — новые ставки → economy
- **6.8 Reinvest-предложения** — apartsales pre-sale

---

## 7. B2B / SAAS

Year 3+. Монетизация инфраструктуры.

- **7.1 Apartsales API** — открытое, как Тинькофф (Listing API, Lead API для CRM-интеграции Битрикс/amoCRM, Index API)
- **7.2 Apartsales Pro** — SaaS для агентств (CRM лидов, yield-калькулятор, sales-pipeline)
- **7.3 Apartsales White-label** — для региональных агентств / девелоперов (custom-брендинг + наш движок)
- **7.4 Apartsales Index Feed** — Bloomberg-style для РФ-недвиги (Public free + Pro feed для банков, фондов, СМИ)

---

## 8. SUB-BRANDS

Отдельные продуктовые линии под единым зонтиком.

| Sub-brand | Сегмент |
|---|---|
| 🏠 Apartsales | Апарты + квартиры (core) |
| 🏡 Apartsales Villas | Премиум 30–80М ₽ |
| 💼 Apartsales Yield | Rentals management |
| 📰 Apartsales Studio | Контент-медиа |
| 📊 Apartsales Index | Индекс цен |
| 🤝 Apartsales Partners | Affiliate |
| 🛠 Apartsales Pro | SaaS |
| 🎓 Apartsales Academy | Обучение |
| 👤 Apartsales Concierge | Premium-сервис |

---

## 9. FUTURE EXPANSIONS

Year 4+. Расширение категории.

- **9.1 Apartsales Commercial** — офисы, retail, склады
- **9.2 Apartsales Secondary** — вторичный рынок (Y4+)
- **9.3 Apartsales Global ↔ Domonly** — cross-border (inbound: ОАЭ/Турция/СНГ → РФ-курорты; outbound: РФ → Дубай/Стамбул/Бали)
- **9.4 Apartsales Bank** — лицензия НКО / встроенные платежи
- **9.5 Apartsales Insurance** — собственный insurtech-продукт
- **9.6 Apartsales Tokenized** — фракционные доли (DeFi/web3)
- **9.7 Apartsales Build** — co-investment в новые ЖК

---

## 10. Таймлайн запуска по горизонтам

| Горизонт | Запуск (минимально жизнеспособный набор) |
|---|---|
| **Day 1 (MVP, Year 1 Q1–Q2)** | 1.1 Поиск · 1.2 Select · 1.3 KYC · 1.4 Lock · 2.1 Yield · 2.2 Price Forecast · 2.6 AI-чат · 5.1 Studio (минимум 30 статей) |
| **Year 1 Q3–Q4** | 1.5–1.9 (полный цикл сделки до Росреестра) · 3.1 Yield management · 3.2 Mortgage broker · 4.1 B2C subscriptions · 5.2 Partners · 6.1–6.3 Dashboard |
| **Year 2** | 3.3–3.11 (всё adjacent) · 4.2 B2B subscriptions · 5.3 Showcase · 7.1 API · 8.2 Villas · 8.5 Index public |
| **Year 3** | 7.2 Pro SaaS · 7.3 White-label · 7.4 Index Pro feed · 8.8 Academy · 8.9 Concierge |
| **Year 4–5** | 9.1 Commercial · 9.2 Secondary · 9.3 Global (Domonly bridge) · 9.5 Insurance |
| **Year 6+** | 9.4 Bank · 9.6 Tokenized · 9.7 Build (co-investment) |

---

## 11. Ключевая логика дерева

Не строим всё сразу. **Каждая ветка вырастает только после того, как core ствол даёт сигнал «готов»:**

- Ветки 3 (adjacent) и 6 (portfolio tools) растут **после** core flow (1) — нет смысла продавать страховку, пока сделок 0
- Ветка 7 (SaaS / API) — **только после** 50–100 застройщиков-партнёров (есть кому продавать API)
- Ветка 8 (sub-brands) — **только после** core-узнаваемости бренда Apartsales
- Ветка 9 (future) — **только после** доминирования в РФ (бессмысленно идти в Дубай, не закрепившись в Крыму)

**Дисциплина «что НЕ делаем сейчас» = velocity.** Конкуренты, пытающиеся быть всем для всех, проигрывают в 90% случаев против focused specialist'а.

---

**Конец документа 06-PRODUCT-TREE-v1.md**
