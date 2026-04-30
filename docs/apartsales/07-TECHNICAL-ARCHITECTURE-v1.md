# APARTSALES — TECHNICAL ARCHITECTURE v1

> **Архитектура iOS + Android + Web. Спецификация (код ещё не пишем).**
> По Superpowers v4.1.1: spec → одобрение → write-plan → TDD.
> Цель документа — закрепить ключевые архитектурные решения, чтобы стройка не пошла не туда.

**Версия:** v1.0 (30 апреля 2026)
**Статус:** 🟡 Draft — ожидает одобрения 5 ключевых решений (см. Section 9)
**Документ:** `docs/apartsales/07-TECHNICAL-ARCHITECTURE-v1.md`
**Авторы:** Billions X × Claude
**Связанные:** [00-MASTER.md](00-MASTER.md) · [04-PRODUCT-MONETIZATION-v1.md](04-PRODUCT-MONETIZATION-v1.md) · [06-PRODUCT-TREE-v1.md](06-PRODUCT-TREE-v1.md)

---

## TABLE OF CONTENTS

- [0. Структура решения](#0-структура-решения)
- [1. Tech Stack](#1-tech-stack--ключевые-решения)
- [2. System Architecture](#2-system-architecture--высокоуровневая-диаграмма)
- [3. Screen Architecture](#3-screen-architecture--экраны-по-платформам)
- [4. Service Architecture](#4-service-architecture--микросервисы)
- [5. Data Architecture](#5-data-architecture--модель-данных)
- [6. Integrations](#6-integrations--критические-внешние-api)
- [7. Cross-cutting Concerns](#7-cross-cutting-concerns)
- [8. Phased Rollout](#8-phased-rollout-plan)
- [9. Точки одобрения](#9-что-дальше--точки-одобрения)

---

## 0. Структура решения

8 слоёв, каждый — отдельное решение, требующее одобрения:

```
1. Tech Stack          — на чём пишем (iOS / Android / Web / Backend)
2. System Architecture — как куски говорят друг с другом
3. Screen Architecture — какие экраны на каждой платформе
4. Service Architecture— какие микросервисы внутри
5. Data Architecture   — какие сущности, где хранятся
6. Integrations        — ЕСИА, Госключ, банки, ЮKassa, Росреестр
7. Cross-cutting       — auth, security, observability, CI/CD
8. Phased Rollout      — что строим Q1, что Q2, что Y2+
```

---

## 1. TECH STACK — ключевые решения

### 1.1 Сводная матрица

| Платформа | Стек | Альтернатива | Почему **не** альтернатива |
|---|---|---|---|
| **iOS** | **Swift 6 + SwiftUI 6 + The Composable Architecture (TCA)** | React Native / Flutter | Liquid Glass golden standard невозможно повторить cross-platform. Безопасные операции (Secure Enclave, биометрия, Госключ-SDK) требуют native. iPhone — основной девайс ICP «Москвич-инвестор». |
| **Android** | **Kotlin 2.0 + Jetpack Compose + Material 3 Expressive** | Flutter / RN | Те же причины: native-quality + СБП Pay через native intents + Госключ Android SDK + биометрия через BiometricPrompt. |
| **Web (B2C)** | **Next.js 15 (App Router) + React 19 + TypeScript 5.5 + Tailwind 4 + shadcn/ui** | Remix, Astro | Уже проверено на Ethnomir. Vercel deploy. SSR/RSC для SEO (критично для Apartsales Studio + Apartsales Index). |
| **Web (B2B CRM)** | **Next.js 15 (тот же монорепо) + dashboard kit (Tremor + shadcn)** | Retool, Refine | Полный контроль UI, единый бренд, общие компоненты с B2C. |
| **Web (Pro SaaS, Y3+)** | Next.js 15 | Same | Та же логика. |
| **Backend Core** | **Node.js 22 + Fastify + TypeScript** | Go, NestJS | Один язык с Web (TypeScript), быстрый dev velocity, Fastify в 3× быстрее Express, экосистема SDK для всех РФ-интеграций. |
| **Backend ML** | **Python 3.12 + FastAPI + scikit-learn + XGBoost + PyTorch (LSTM)** | TensorFlow.js | Стандарт индустрии для ML, лучшие библиотеки для табличных данных и time-series. |
| **Database** | **Supabase Postgres 16** | Self-hosted PG, MongoDB | Уже проверено на Ethnomir. RLS из коробки. 136 таблиц/146 RPC уже работают. Auth + Storage в одной экосистеме. |
| **Cache / Queue** | **Upstash Redis (serverless) + Redis Streams** | NATS, RabbitMQ, SQS | Serverless = платим за usage; Streams хватит для Year 1-3 нагрузки. |
| **Search Engine** | **Postgres FTS + pg_trgm (Y1) → OpenSearch (Y2+)** | Algolia, Elasticsearch Cloud | Дешевле, под контролем, RU-морфология через `russian` config. |
| **Object Storage** | **Supabase Storage (S3-compat) + CDN через Cloudflare** | AWS S3 | Уже проверено. Дешевле для нашего размера. |
| **Realtime** | **Supabase Realtime (Postgres replication)** | Pusher, Ably | Встроено, бесплатно до лимита. |
| **API стиль** | **REST (OpenAPI 3.1) для B2C/B2B + tRPC внутри монорепо для типобезопасности** | GraphQL | GraphQL overhead для нашего scope не оправдан. Y3+ можно добавить GraphQL Gateway для партнёров. |
| **AI Chat** | **Anthropic Claude (primary) + Yandex GPT (fallback для суверенности)** | OpenAI | Claude сильнее в long-context рассуждениях по yield/прайсу. YandexGPT обязателен для соответствия 152-ФЗ при работе с ПД. |
| **Monorepo** | **Turborepo + pnpm workspaces** | Nx, Bazel | Vercel-native, отлично работает с Next.js. |
| **CI/CD** | **GitHub Actions + Fastlane (iOS) + Gradle Play Publisher (Android) + Vercel (web)** | CircleCI | Бесплатно до лимита, нативно для GitHub. |
| **Observability** | **Sentry (errors) + Posthog (product analytics, self-hosted) + Grafana Cloud (infra)** | Datadog | Дешевле в 5×, Posthog self-hosted = ПД остаются в РФ. |
| **Feature flags** | **Unleash (self-hosted)** | LaunchDarkly | Бесплатно, в РФ-юрисдикции. |
| **Hosting** | **Vercel (web) + AWS Frankfurt (services) + Supabase EU-West-1** | Yandex Cloud | Y1 — европейские дата-центры (соответствие 152-ФЗ через локализацию ПД в РФ — отдельный домен ниже). |

### 1.2 Локализация ПД (152-ФЗ)

Критично: **персональные данные граждан РФ должны храниться в РФ**. План:

- **Y1:** Supabase Postgres на EU-West-1 для всех нечувствительных данных (каталог, поиск, аналитика). Параллельно поднимаем **зеркальную базу в Yandex Cloud / VK Cloud / Selectel для ПД** (имя, телефон, паспорт, КYC данные). Связь через защищённый канал.
- **Y2:** Полный переезд в Yandex Cloud / Selectel, Supabase остаётся как dev/staging.

### 1.3 Что **не** используем

- ❌ React Native / Flutter — ниже native-quality, проблемы с Liquid Glass, отстают от платформенных API на 6-12 месяцев
- ❌ Capacitor / Ionic — webview-обёртки не дают premium UX
- ❌ MongoDB / NoSQL для core — реляционная модель сделок требует ACID
- ❌ Firebase — vendor lock-in от Google + проблемы 152-ФЗ + расходы
- ❌ Lambda / Cloud Functions для core API — холодный старт убивает p99 latency

---

## 2. SYSTEM ARCHITECTURE — высокоуровневая диаграмма

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENTS (PRESENTATION)                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              │
│  │ iOS App      │   │ Android App  │   │ Web (Next.js)│              │
│  │ Swift 6 +    │   │ Kotlin +     │   │ B2C / B2B /  │              │
│  │ SwiftUI 6    │   │ Compose      │   │ Pro / Studio │              │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘              │
│         │                  │                   │                     │
└─────────┼──────────────────┼───────────────────┼─────────────────────┘
          │                  │                   │
          └──────────────────┴───────────────────┘
                            │
                  HTTPS + JWT (Supabase Auth)
                            │
┌───────────────────────────▼──────────────────────────────────────────┐
│                       API GATEWAY / BFF                              │
│              Node 22 + Fastify, OpenAPI 3.1, rate-limit              │
│           Auth · CORS · validation · feature flags · logging         │
└─┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬───────────────────┘
  │      │      │      │      │      │      │      │
┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐
│Sea-│ │Lis-│ │Lock│ │Mtg │ │Yld │ │AI  │ │Pay │ │Por-│   ← Core Services
│rch │ │ting│ │svc │ │svc │ │mgmt│ │chat│ │ment│ │tfl │     (Node 22)
└─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
  │      │      │      │      │      │      │      │
  └──────┴──┬───┴──────┴──────┴──────┴──────┴──────┘
            │
   ┌────────▼─────────┐
   │   Event Bus      │ Redis Streams (Y1) → NATS / Kafka (Y3+)
   │   (Async events) │ deal.locked, deal.contract_signed, etc.
   └────────┬─────────┘
            │
┌───────────┴─────────────────────────────────────────────────────────┐
│                       INTEGRATION LAYER                              │
│ ┌──────┐ ┌──────┐ ┌──────────┐ ┌─────────┐ ┌─────┐ ┌──────────┐    │
│ │ESIA  │ │Госкл-│ │Escrow API│ │ЮKassa   │ │СБП  │ │Росреестр │    │
│ │OAuth │ │ юч  │ │Сбер/Тинь/│ │Server-  │ │API  │ │ via Гос- │    │
│ │      │ │SDK   │ │ВТБ       │ │to-server│ │FPS  │ │ услуги   │    │
│ └──────┘ └──────┘ └──────────┘ └─────────┘ └─────┘ └──────────┘    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│ ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────────┐       │
│ │ Postgres   │ │ Redis      │ │ Object   │ │ Time-series    │       │
│ │ Supabase 16│ │ Upstash    │ │ Storage  │ │ ClickHouse Y2+ │       │
│ │ (RLS, FTS) │ │ cache+     │ │ S3-compat│ │ (analytics)    │       │
│ │ + ПД-зерка-│ │ streams    │ │ + CDN    │ │                │       │
│ │ ло в RU    │ │            │ │          │ │                │       │
│ └────────────┘ └────────────┘ └──────────┘ └────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        ML / AI LAYER (Python)                        │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐       │
│ │ Yield      │ │ Price      │ │ Developer  │ │ AI Chat      │       │
│ │ Predictor  │ │ Forecast   │ │ Risk Score │ │ (Claude API  │       │
│ │ XGBoost    │ │ LSTM       │ │ ensemble   │ │  + RAG over  │       │
│ │ FastAPI    │ │ FastAPI    │ │ FastAPI    │ │  каталог)    │       │
│ └────────────┘ └────────────┘ └────────────┘ └──────────────┘       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       OBSERVABILITY                                  │
│  Sentry · Posthog · Grafana Cloud · OpenTelemetry · Unleash flags    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. SCREEN ARCHITECTURE — экраны по платформам

### 3.1 Mobile-first философия

Apartsales = mobile-first продукт (53% поиска новостроек уже на мобильных). iOS/Android идентичны по структуре, отличаются только нативной реализацией. Web = mobile-first responsive + дополнительные routes для SEO/B2B.

### 3.2 Архитектура навигации mobile (iOS + Android)

**Tab Bar — 5 вкладок**, Liquid Glass / Material 3:

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  🔍      │  ⭐      │  🔒      │  💼      │  👤      │
│ Поиск    │ Избран-  │ Сделки   │ Портфель │ Профиль  │
│          │  ное     │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Floating button** (поверх таб-бара, как в Этномире): **AI-консьерж** — chat-first primary UX, доступен с любого экрана.

### 3.3 Все экраны mobile (iOS + Android)

| № | Экран | Tab | Функция |
|---|---|---|---|
| **1. Onboarding (без таб-бара)** ||||
| 1.1 | Welcome (4 слайда) | — | Apple-style canvas-анимации |
| 1.2 | Sign-in / ЕСИА | — | OAuth через Госуслуги |
| 1.3 | KYC (биометрия) | — | Face ID / Touch ID + видео-селфи |
| 1.4 | Investor Profile (опц.) | — | Цели / бюджет / горизонт |
| **2. Поиск (Tab 1)** ||||
| 2.1 | AI-консьерж (главный) | 🔍 | Chat + быстрые quick-actions |
| 2.2 | Search Results (list) | 🔍 | Карточки апартов |
| 2.3 | Search Results (map) | 🔍 | MapKit / Google Maps + кластеризация |
| 2.4 | Filters | 🔍 | Bottom sheet, Liquid Glass |
| 2.5 | Saved Searches | 🔍 | Список + alerts |
| 2.6 | Compare (до 4) | 🔍 | Side-by-side сетка |
| **3. Карточка объекта** ||||
| 3.1 | Listing Detail | — | Hero gallery + drone video |
| 3.2 | 3D Tour (Matterport WebView) | — | Полноэкранный |
| 3.3 | Floor Plan | — | Зум планировки |
| 3.4 | ROI Calculator | — | Yield + appreciation + ипотека |
| 3.5 | Reviews | — | Отзывы купивших |
| 3.6 | Developer Page | — | Профиль застройщика + Risk Score |
| **4. Lock Flow (наш core IP)** ||||
| 4.1 | Lock Confirmation | — | "Зафиксировать этот юнит" |
| 4.2 | KYC (если ещё не сделан) | — | ЕСИА |
| 4.3 | SMS Verification | — | Код в CRM застройщика |
| 4.4 | Сертификат (PDF + Wallet) | — | Apple/Google Wallet pass |
| 4.5 | Lock Tracking | 🔒 | Статус лида в реальном времени |
| **5. Contract & Payment Flow** ||||
| 5.1 | DDU Preview | 🔒 | AI-чек + красные флаги |
| 5.2 | Госключ Sign | 🔒 | Native SDK |
| 5.3 | Escrow Setup | 🔒 | Выбор банка (Сбер/Тинькофф/ВТБ) |
| 5.4 | Mortgage Compare | 🔒 | 5+ банков параллельно |
| 5.5 | Mortgage Application | 🔒 | Отправка |
| 5.6 | Payment | 🔒 | СБП / ЮKassa / Apple Pay |
| 5.7 | Росреестр Registration | 🔒 | Через Госуслуги |
| 5.8 | Deal Complete | 🔒 | Поздравление + переход в Портфель |
| **6. Saved (Tab 2)** ||||
| 6.1 | Favorites List | ⭐ | Сохранённые юниты |
| 6.2 | Saved Searches | ⭐ | С push-alerts |
| **7. Deals (Tab 3)** ||||
| 7.1 | Active Deals | 🔒 | Текущие Lock'и + сделки |
| 7.2 | Deal Timeline | 🔒 | Pipeline-progress |
| 7.3 | Documents | 🔒 | ДДУ, ЕГРН, страховки |
| **8. Portfolio (Tab 4)** ||||
| 8.1 | Dashboard | 💼 | Метрики портфеля |
| 8.2 | Assets List | 💼 | Карточки купленных юнитов |
| 8.3 | Asset Detail | 💼 | Yield-графики, capital appreciation |
| 8.4 | Yield Management | 💼 | Apartsales Yield (rentals) |
| 8.5 | Tax Calendar | 💼 | Напоминания |
| 8.6 | Exit Planner | 💼 | Когда продавать |
| 8.7 | Re-financing Advisor | 💼 | Мониторинг ставок |
| **9. Profile (Tab 5)** ||||
| 9.1 | Profile Main | 👤 | Аватар, уровень, баллы |
| 9.2 | Subscription | 👤 | Free / Premium / Pro |
| 9.3 | Documents | 👤 | Все документы |
| 9.4 | Partners (Affiliate) | 👤 | Реф-ссылка, выплаты |
| 9.5 | Settings | 👤 | Уведомления, язык, тема |
| 9.6 | Support | 👤 | AI-чат + human escalation |
| **10. Studio (overlay, доступно с Profile)** ||||
| 10.1 | Studio Feed | — | Apartsales Studio контент |
| 10.2 | Article | — | Reader mode |
| 10.3 | Academy | — | Курсы Yield 101 |

**Итого mobile: ~50 экранов.** Добавляются модальные sheets, bottom sheets, alerts — но всё это под одной иерархией.

### 3.4 Веб — структура routes

#### B2C (`apartsales.com` / `apartsales.ru`)

```
/                         — Лендинг
/search                   — Поиск (мобильный) и /search?view=map
/unit/[id]                — Карточка юнита
/compare?ids=1,2,3        — Сравнение
/lock/[code]              — Подтверждение Lock (deeplink из SMS)
/contract/[id]            — DDU + Госключ flow
/mortgage/[id]            — Ипотечный flow
/payment/[id]             — Оплата
/portfolio                — После авторизации
/yield                    — Apartsales Yield dashboard
/studio                   — Apartsales Studio (контент-медиа)
/studio/[slug]            — Статья
/index                    — Apartsales Index (публичный)
/academy                  — Apartsales Academy
/partners                 — Apartsales Partners (affiliate)
/villas                   — Apartsales Villas (sub-brand)
/about, /pricing, /privacy, /terms, /contacts
/api/docs                 — Developer docs
/auth/login, /auth/esia/callback
```

#### B2B (`crm.apartsales.com`)

```
/                         — Login
/dashboard                — Главный
/leads                    — Список лидов из Apartsales
/leads/[id]               — Карточка лида + Lock-info
/inventory                — Свои ЖК и юниты
/contracts                — Подписанные ДДУ
/billing                  — Расчёты с Apartsales
/integrations             — API keys, CRM-интеграции
```

#### Pro (`pro.apartsales.com`, Y3+)

```
SaaS для агентств — отдельная архитектура, проектируется в Y3
```

---

## 4. SERVICE ARCHITECTURE — микросервисы

Для Y1 — **modular monolith**: все сервисы в одном Node.js процессе, но с чёткими границами модулей. Y2-3 — извлекаем горячие сервисы в отдельные процессы.

### 4.1 Core services (Year 1, monolith with modules)

| Сервис | Тех | Ответственность | Зависимости |
|---|---|---|---|
| **api-gateway** | Node + Fastify | Auth, CORS, rate-limit, маршрутизация, OpenAPI docs | — |
| **auth** | Supabase Auth + ESIA | JWT, OAuth via Госуслуги, refresh tokens | Postgres |
| **listing** | Node + Fastify | CRUD юнитов, синхронизация с CRM застройщиков | Postgres, Redis cache |
| **search** | Node + Fastify | Поиск (FTS + фильтры + гео), saved searches, alerts | Postgres FTS, Redis |
| **lock** | Node + Fastify | Apartsales Lock 🔒 — core IP. SMS-верификация, сертификат, юр-фиксация | Postgres, ЮKassa SMS, Wallet API |
| **contract** | Node + Fastify | DDU lifecycle, Госключ-подписание, AI-чек | Postgres, Goskey SDK |
| **escrow** | Node + Fastify | Открытие эскроу, tracking, multi-bank | Sber/Tinkoff/VTB API |
| **mortgage** | Node + Fastify | Сравнение банков, заявки, скоринг | Bank APIs |
| **payment** | Node + Fastify | ЮKassa, СБП, Apple Pay, Wallet | ЮKassa, СБП-API |
| **rosreestr** | Node + Fastify | Регистрация прав через Госуслуги | Госуслуги API |
| **portfolio** | Node + Fastify | Dashboard, yield-tracking, налоги | Postgres |
| **yield-mgmt** | Node + Fastify | Apartsales Yield (rentals) — поиск арендаторов, динамическое ценообразование | Postgres, ML-pricing |
| **content** | Node + Fastify | Apartsales Studio CMS, Academy, Index | Postgres, Storage |
| **affiliate** | Node + Fastify | Apartsales Partners — трекинг, выплаты | Postgres |
| **notification** | Node + worker | Push (APNs/FCM), email, SMS, Telegram | Redis Streams |
| **crm-sync** | Node + worker | Bi-directional sync с Битрикс/amoCRM застройщиков | Postgres |

### 4.2 ML services (отдельные Python-процессы)

| Сервис | Модель | Endpoint | Train cadence |
|---|---|---|---|
| **ml-yield** | XGBoost regression | `POST /predict/yield` | Weekly retrain |
| **ml-price-forecast** | LSTM time-series | `POST /predict/price?horizon=3y` | Monthly retrain |
| **ml-developer-risk** | Ensemble (Random Forest + rules) | `POST /score/developer` | Quarterly retrain |
| **ml-yield-pricing** | Dynamic pricing для Apartsales Yield | `POST /price/optimal` | Real-time |

### 4.3 AI services

| Сервис | Тех | Описание |
|---|---|---|
| **ai-chat** | Node + Fastify + Claude API + Yandex GPT fallback | Apartsales AI-консьерж. RAG over каталог + yield-data + user history. Tool-use для actions (поиск, lock, calculator). |
| **ai-ddu-check** | Node + Claude | Анализ ДДУ-договора, выявление красных флагов |
| **ai-photo** | Python + CLIP + custom CNN | Анализ фото ремонта/планировки |
| **ai-listing-gen** | Node + Claude | B2B: генерация listing-карточек по описанию застройщика |

### 4.4 Async event bus

**Redis Streams** (Y1) → **NATS JetStream** (Y2+).

Ключевые события:

```
deal.locked              → start sertif issuance, notify CRM, log analytics
deal.contract_signed     → escrow open, notify mortgage svc
deal.payment_completed   → trigger Росреестр, notify all parties
deal.completed           → portfolio update, affiliate payout, NPS request
yield.contract_started   → schedule check-ins, dynamic pricing
content.published        → push to subscribers, SEO sitemap update
user.kyc_completed       → unlock features, send welcome email
```

---

## 5. DATA ARCHITECTURE — модель данных

### 5.1 Top-level entities (~50 таблиц для MVP)

```
AUTH & USERS
├─ users            (id, esia_id, phone, email, kyc_status, role)
├─ user_profiles    (investor_profile, budget, horizon, languages)
├─ subscriptions    (tier, status, renews_at)
└─ sessions

LISTINGS
├─ developers       (id, name, risk_score, verified)
├─ projects         (ЖК, locations, completion_date, ...)
├─ units            (apartment, type, floor, area, price, status)
├─ unit_media       (photos, drones, 3d_tours)
└─ unit_documents   (planirovka, ДДУ template, документы)

LOCK & DEALS
├─ locks            (user, unit, code, sms_verified_at, status)
├─ certificates     (lock_id, pdf_url, wallet_pass_url, discount_pct)
├─ deals            (lock_id, status, contract_id, escrow_id, mortgage_id, payment_ids[])
└─ deal_events      (event log per deal)

CONTRACTS & PAYMENTS
├─ contracts        (deal_id, ddu_url, signed_at, goskey_session)
├─ escrow_accounts  (deal_id, bank, account_no, status)
├─ mortgage_apps    (deal_id, banks_applied[], offers[])
├─ payments         (deal_id, method, amount, ukassa_id, status)
└─ rosreestr_apps   (deal_id, status, egrn_url)

PORTFOLIO & YIELD
├─ assets           (deal_id, owner_id, current_value, monthly_rent)
├─ yield_contracts  (asset_id, manager, since, fee_pct)
├─ rentals          (yield_contract_id, tenant, period, payment_status)
└─ tax_calendar     (asset_id, due_date, type, amount)

CONTENT & GROWTH
├─ articles         (slug, body, author, published_at)
├─ academy_courses
├─ index_snapshots  (date, region, segment, price, yield)
├─ affiliate_partners
└─ affiliate_payouts

ANALYTICS (separate ClickHouse Y2+)
├─ events           (user_id, name, props, ts)
├─ funnel_steps
└─ ml_predictions   (model, input, output, ts)
```

### 5.2 Caching strategy

| Что | Где | TTL |
|---|---|---|
| Hot listings (top 1000) | Redis | 5 мин |
| Search filter facets | Redis | 1 час |
| User session | Redis | 30 мин (sliding) |
| Yield predictions | Redis | 24 часа |
| Apartsales Index | Redis + CDN edge | 1 час |
| Static content (Studio) | Vercel Edge / Cloudflare | 24 часа |

### 5.3 Storage

- **User-generated docs (KYC, ДДУ, ЕГРН)** — Yandex Cloud Storage RU (152-ФЗ требование)
- **Listing media (photos, drones)** — Supabase Storage + Cloudflare CDN
- **3D tours** — Matterport hosted
- **AI chat transcripts** — Postgres JSONB (с retention policy 90 дней)

---

## 6. INTEGRATIONS — критические внешние API

| Интеграция | Назначение | Тип | Риск |
|---|---|---|---|
| **ЕСИА (Госуслуги)** | OAuth + KYC + получение паспортных данных | OAuth 2.0 | Низкий — стабильный API |
| **Госключ** | Электронная подпись ДДУ и других документов | Mobile SDK (iOS+Android) + Web QR-flow | Средний — SDK ограничен в фичах, нужно тестирование |
| **СБП (FPS ЦБ)** | Мгновенные платежи 0.4% | REST через ЮKassa или прямая | Низкий — стандарт |
| **ЮKassa** | Card payments, СБП-обёртка | Server-to-server REST | Низкий |
| **Apple Pay / Google Pay** | Native payments | Native SDK | Низкий |
| **Сбер escrow API** | Открытие эскроу-счетов | REST | Высокий — bureaucracy access |
| **Тинькофф escrow API** | Альтернатива Сберу | REST | Средний |
| **ВТБ escrow API** | Альтернатива Сберу | REST | Высокий |
| **Mortgage APIs (Сбер/Тиньк/Дом.РФ/Альфа)** | Ипотечные заявки | REST + scoring | Средний |
| **Росреестр (через Госуслуги)** | Регистрация прав | REST | Средний |
| **MapKit (iOS) / Google Maps (Android+Web)** | Карты, гео-поиск | SDK | Низкий |
| **Matterport** | 3D-туры | Hosting + embed SDK | Низкий |
| **Битрикс24, amoCRM** | CRM-sync с застройщиками | REST + webhooks | Средний |
| **Telegram Bot API** | Notifications + Studio bot | REST | Низкий |
| **Anthropic Claude API + Yandex GPT** | AI chat | REST | Низкий |

### 6.1 Integration patterns

- **Adapter pattern:** все внешние интеграции через единый интерфейс `BankAdapter`, `KYCProvider`, `PaymentProvider` — легко свапить и testing
- **Circuit breaker:** все интеграции защищены через `opossum` (Node) — auto-fallback при недоступности
- **Idempotency keys:** все mutations через `Idempotency-Key` header
- **Webhook handlers:** signed payloads, retry logic, dead-letter queue

---

## 7. CROSS-CUTTING CONCERNS

### 7.1 Authentication & Authorization

```
User opens app → check session
├─ no session → ESIA OAuth → JWT (15min) + Refresh (30d)
├─ session valid → continue
└─ session expired → silent refresh

Authorization layers:
├─ Row Level Security (RLS) в Postgres — primary
├─ Middleware на api-gateway — secondary (rate-limit, role check)
└─ Feature flags (Unleash) — gradual rollout
```

### 7.2 Security

- **PCI DSS compliance** через ЮKassa (мы не храним карты)
- **152-ФЗ:** ПД в РФ дата-центрах (Yandex Cloud / Selectel)
- **Encryption:** TLS 1.3 везде, at-rest шифрование Postgres + Storage
- **Secrets:** Supabase Vault + AWS Secrets Manager
- **Pen-tests:** Quarterly, плюс bug bounty Y2+
- **Госключ:** соответствие 63-ФЗ для ЭП

### 7.3 Observability

```
Frontend errors      → Sentry
Backend errors       → Sentry + Grafana
Performance (APM)    → OpenTelemetry → Grafana Cloud
Product analytics    → Posthog (self-hosted RU)
Business metrics     → ClickHouse + Grafana dashboards
Alerting             → Grafana → Telegram + PagerDuty (on-call)
```

**Key SLOs (Year 1):**

- API p99 latency: < 500ms
- Search p99: < 800ms
- Lock flow p99: < 2s end-to-end
- Uptime: 99.5% (allows ~3.5h downtime/month)

### 7.4 CI/CD pipelines

```
GitHub PR → CI (lint, type-check, unit, integration)
         → preview deploys (Vercel for web, TestFlight for iOS, Internal Track for Android)
         → manual approval
         → production deploy

iOS:     GitHub Actions → Fastlane → App Store Connect → TestFlight → Production
Android: GitHub Actions → Gradle Play Publisher → Internal → Production
Web:     Vercel auto-deploy on main
Backend: GitHub Actions → Docker → AWS Frankfurt (prod)
```

### 7.5 Testing strategy

```
Unit tests        — Vitest (Node), XCTest (iOS), JUnit (Android) — 70%+ coverage
Integration tests — Test containers + Postgres TestKit
E2E tests         — Playwright (web), Maestro (iOS+Android)
Visual regression — Chromatic / Percy для design system
Load tests        — k6 для critical paths (Lock, Search)
```

---

## 8. PHASED ROLLOUT PLAN

### Phase 1 — MVP (Months 1-4, до Year 1 Q2)

**Цель:** запустить core Lock flow в Крыму с 5-10 застройщиками-партнёрами.

**Платформы:** **iOS native** + **Web (PWA-mobile)**. Android — пока через web.

**Сервисы:**
- ✅ auth (ESIA), listing, search, lock, contract (Госключ), payment (ЮKassa+СБП), notification
- ✅ ML-yield (v1, простая модель)
- ✅ AI chat (через Claude API)
- ⏳ escrow, mortgage, rosreestr — manual / partner integrations

**Команда (минимум):**
- 1 iOS dev (Swift/SwiftUI)
- 2 full-stack (Next.js + Node backend)
- 1 ML engineer (part-time)
- 1 product designer
- 1 QA
- 1 PM

### Phase 2 — Year 1 Q3-Q4

**Дополнения:**
- ✅ **Android native** (Kotlin + Compose) — полный паритет с iOS
- ✅ Полный escrow (Сбер минимум)
- ✅ Полный mortgage (Сбер + Тинькофф)
- ✅ Росреестр через Госуслуги
- ✅ Apartsales Yield (rentals management)
- ✅ B2C subscriptions (Premium)
- ✅ Apartsales Partners (affiliate)
- ✅ Portfolio dashboard + Re-financing advisor
- ✅ Apartsales Studio (контент-медиа)

### Phase 3 — Year 2

- ✅ Apartsales Villas (sub-brand)
- ✅ B2B subscriptions (CRM для застройщиков)
- ✅ Apartsales Index (public)
- ✅ Apartsales API (open для партнёров)
- ✅ Migration: AWS Frankfurt → Yandex Cloud (full 152-ФЗ compliance)
- ✅ Search engine: Postgres FTS → OpenSearch
- ✅ Modular monolith → extract hot services (Lock, Search, AI)

### Phase 4 — Year 3+

- ✅ Apartsales Pro (SaaS для агентств)
- ✅ Apartsales Academy
- ✅ Apartsales White-label
- ✅ Кросс-граничная конвергенция с Domonly

---

## 9. ЧТО ДАЛЬШЕ — точки одобрения

Этот документ закрывает **высокоуровневую архитектуру**. Прежде чем переходить к detailed design (write-plan и код), нужно одобрение по 5 ключевым решениям:

1. **Tech stack** — iOS Swift + Android Kotlin + Web Next.js (vs RN/Flutter cross-platform). **Это самое дорогое решение.** Native = 1.7-2× стоимость дева, но Apple-grade UX. ✅/❌?
2. **Modular monolith Y1, не микросервисы** — экономия на инфре и dev velocity. Микросервисы Y2+. ✅/❌?
3. **Phase 1 = iOS + Web (PWA), Android позже** — экономия 4 месяцев на старте. ✅/❌?
4. **ПД в Яндекс/Selectel, не в Supabase EU** — соответствие 152-ФЗ с Day 1. ✅/❌?
5. **AI: Claude primary + YandexGPT fallback** — vs только YandexGPT. Claude в 3-5× умнее, но международный сервис. ✅/❌?

После одобрения по этим 5 пунктам спускаемся в любой из 8 слоёв на детализацию:

- **Слой 3 (Screens):** покадровая раскадровка ключевых flows (Search → Lock → Payment) с wireframes
- **Слой 4 (Services):** OpenAPI спецификация core endpoints + sequence-диаграммы
- **Слой 5 (Data):** полная ER-диаграмма с DDL для core таблиц
- **Слой 6 (Integrations):** sequence-диаграммы для Госключ-flow, эскроу-flow, ипотечного flow
- **Слой 8 (Rollout):** детальный sprint-план Months 1-4 с задачами на каждую неделю

---

**Конец документа 07-TECHNICAL-ARCHITECTURE-v1.md**
