# APARTSALES — PRODUCT LINE & MONETIZATION v1

> **На чём зарабатывает Apartsales. Полный цикл онлайн.**
> Aviasales × Тинькофф для первичной недвижимости РФ. Ноль оффлайн-офисов.

**Версия:** v1.0 (29 апреля 2026)
**Авторы:** Billions X × Claude
**Документ:** `docs/apartsales/04-PRODUCT-MONETIZATION-v1.md`
**Связанные:** [00-MASTER.md](00-MASTER.md) · [01-STRATEGY-v2.0.md](01-STRATEGY-v2.0.md) · [02-FINANCIAL-MODEL-v1.md](02-FINANCIAL-MODEL-v1.md) · [03-COMPETITIVE-DEEP-DIVE-v1.md](03-COMPETITIVE-DEEP-DIVE-v1.md)

---

## TABLE OF CONTENTS

- [0. Executive — манифест и map of revenue](#0-executive)
- [1. Вдохновение — кого мы зеркалим и где идём дальше](#1-вдохновение)
- [2. Полный цикл онлайн — 8 этапов end-to-end digital](#2-полный-цикл-онлайн)
- [3. Core revenue — комиссия от застройщика](#3-core-revenue)
- [4. Adjacent revenue — digital ecosystem](#4-adjacent-revenue)
- [5. Subscription revenue — B2B + B2C](#5-subscription-revenue)
- [6. Data revenue — Apartsales Index](#6-data-revenue)
- [7. Advertising revenue — Aviasales-style](#7-advertising-revenue)
- [8. Affiliate program — Travelpayouts-style](#8-affiliate-program)
- [9. SaaS / White-label — Year 4+](#9-saas--white-label)
- [10. Revenue trajectory по годам](#10-revenue-trajectory)
- [11. Unit economics по каждому stream](#11-unit-economics)
- [12. Roadmap активации stream'ов](#12-roadmap)
- [Appendix — глоссарий, источники](#appendix)

---

## 0. EXECUTIVE

### Манифест

**Apartsales — это Aviasales первичной недвижимости, построенный на философии Тинькофф.**

- **От Aviasales** — модель метапоиска: мы не агенты, не застройщики. Мы лучший digital-инструмент сравнения и фиксации, берущий комиссию с тех, кто закрывает сделку.
- **От Тинькофф** — философия: ноль оффлайн-офисов, 24/7 онлайн-сервис, открытое API, контентный авторитет (Apartsales Studio как Tinkoff Journal), радикальная transparency.
- **Наше уникальное** — Lead Lock (юридически защищённая транзакционная фиксация), AI-консьерж как primary UX, специализация на инвест-курорте.

### Полный цикл онлайн — без единого оффлайн touchpoint

```
SEARCH → SELECT → KYC → LOCK → CONTRACT → ESCROW → MORTGAGE → PAY → REGISTER

  AI         3D/         Гос-      Apart-     Гос-       Сбер/       Сбер/       ЮKassa/    Гос-
  консьерж   drone/      услуги    sales      ключ       Тинькофф    Тинькофф    СБП        услуги
             video                 Lock                  ВТБ         ВТБ                    Росреестр
                                   + сертиф.             API         API
```

**Всё в приложении. Все платежи через ЮKassa/СБП. Все документы через Госключ. Регистрация через Госуслуги/Росреестр. Ни одного похода в офис.**

### Map of revenue streams

```
APARTSALES REVENUE ECOSYSTEM
│
├── 1. CORE — Commission (3% от закрытой сделки)              ~50-60% rev Y1
│   └─ Net 280K ₽/сделка после сертификата покупателю
│
├── 2. ADJACENT (digital services per-deal)                    ~25-30% rev Y1
│   ├── Apartsales Yield (rentals management)
│   ├── Mortgage broker integration
│   ├── Юридический пакет (DDU чек, эскроу)
│   ├── Госключ-подписание (электронная)
│   ├── Insurance broker
│   ├── Furniture / меблировка под ключ
│   ├── Дизайн интерьера
│   └── Переезд / клининг
│
├── 3. SUBSCRIPTIONS (B2B + B2C recurring)                     ~5-8% rev Y1, ~15-20% Y3+
│   ├── B2C: Free / Premium 990 ₽ / Pro Investor 4 990 ₽
│   └── B2B: Listed / Pro 50K / Enterprise 200K / Strategic
│
├── 4. DATA — Apartsales Index                                 ~0% Y1 → ~5-7% Y3+
│   └── Public price index + private B2B feed
│
├── 5. ADVERTISING                                              ~5-8% rev Y1
│   ├── Branded listings (приоритет в выдаче)
│   ├── Showcase placements
│   └── Спецпроекты с застройщиками
│
├── 6. AFFILIATE (Apartsales Partners)                         ~3-5% rev Y2+
│   └── Реферальная сеть блогеров, Telegram-каналов, агентств
│
└── 7. SAAS / WHITE-LABEL                                      Year 4+
    ├── Apartsales Pro для агентств
    └── White-label для регионального B2B
```

### Year 5 target — диверсифицированная revenue base

| Stream | % от revenue Y5 | Млрд ₽ Y5 |
|---|---:|---:|
| Core commission | 45% | 10.0 |
| Adjacent services | 25% | 5.5 |
| Subscriptions | 15% | 3.3 |
| Data (Apartsales Index) | 7% | 1.5 |
| Advertising | 5% | 1.1 |
| Affiliate | 3% | 0.7 |
| **Total Year 5** | **100%** | **22.0** |

---

## 1. ВДОХНОВЕНИЕ

### 1.1 Aviasales — что мы заимствуем

**Бизнес-модель Aviasales:**

| Параметр | Aviasales |
|---|---|
| Roль | Метапоиск (не продаёт сам, перенаправляет на партнёра) |
| Комиссия | ~2.5% с проданного билета |
| Структура revenue | ~80% commissions / ~20% advertising |
| Партнёров | 728 авиакомпаний + 200 онлайн-касс + 5 GDS |
| Affiliate сеть | Travelpayouts (1000+ блогеров и сайтов-аффилиатов) |
| Mobile-first | В каждом 3-м смартфоне РФ |
| Запросов | 2M в день |

**5 принципов которые мы заимствуем напрямую:**

1. **Партнёрская комиссия** — мы зарабатываем когда партнёр (застройщик) закрывает сделку, а не за лиды. Aviasales ~2.5% / Apartsales 3% (выше, потому что real estate сложнее)

2. **Direct booking через NDC-стандарт** — Aviasales перешли от перенаправления на ОТА к прямому бронированию у авиакомпаний, что увеличило конверсию с 6.36% до 12.62%. Apartsales **изначально строится на direct deal lock** через CRM застройщика — мы не перенаправляем на сайт, мы **сразу фиксируем** в CRM.

3. **Бренд-билеты как реклама** — Aviasales продают застройщикам авиакомпаниям возможность поднять билет в выдаче независимо от цены, CTR 3% vs 1% обычного баннера. У нас аналог — **Showcase listings** в премиум-выдаче.

4. **Travelpayouts — affiliate сеть** — мы делаем **Apartsales Partners**: блогеры, Telegram-каналы, региональные агентства получают комиссию за привлечённых клиентов.

5. **Mobile-first product disposition** — приоритет mobile UX, потому что 53% поиска уже на мобильных.

**Чего у Aviasales нет, а у нас есть:**
- Lead Lock с юридической защитой (у Aviasales нет — там бронь напрямую у партнёра)
- Yield-аналитика и инвест-фокус (Aviasales нет)
- Полный цикл сделки в приложении (Aviasales перенаправляет на сайт партнёра)

### 1.2 Тинькофф — что мы заимствуем

**Что Тинькофф изменил в банковском секторе:**

1. **Ноль отделений** — банк работает только digital. Все операции — в приложении или на сайте. Доставка карт и документов курьером.

2. **Digital onboarding** — открыть счёт за 15 минут с телефона, через биометрию и фото паспорта. Никаких "приходите в отделение".

3. **Открытое API** — Тинькофф первый в РФ открыл публичные API для интеграции с любыми сервисами.

4. **Tinkoff Journal как контентный авторитет** — крупнейший финансово-образовательный медиа в РФ-инете. Не реклама — образование, которое строит доверие.

5. **24/7 онлайн-поддержка** в чате — никакого "перезвоните в рабочее время".

6. **Радикальная transparency** — комиссии прозрачны, условия в тексте мобильной кнопки, не в 12-страничном договоре.

7. **Экосистема через банк** — Tinkoff Investments, Mobile, Travel — построены на основе банка как core, но как самостоятельные продукты.

**Apartsales-зеркало:**

| Тинькофф | Apartsales |
|---|---|
| Ноль отделений | Ноль офисов агентов |
| Digital onboarding в 15 минут | Регистрация и KYC через ЕСИА за 5 минут |
| Открытое API | Apartsales API для застройщиков (CRM-интеграция) и аффилиатов |
| Tinkoff Journal | Apartsales Studio (статьи, видео, гайды) |
| 24/7 chat support | Apartsales-консьерж (AI + human) 24/7 |
| Radical transparency | Каждое число (yield, прогноз) кликабельно — раскрывает источники |
| Экосистема через банк | Экосистема через сделку (Search → Yield → Concierge → Index) |

**Один-предложением:** Тинькофф убрал отделения, мы убираем агентов и офисы. Тинькофф сделал банковский продукт чистым приложением, мы делаем то же с покупкой недвижимости.

### 1.3 Zillow — что мы заимствуем

Из конкурентного deep-dive (см. документ 03):

| Stream Zillow | $M 2025 | Зеркало в Apartsales |
|---|---:|---|
| Premier Agent (lead-gen) | $1 700 (66%) | Apartsales Lock + commission (наш core) |
| Rentals | $630 (24%) | Apartsales Yield (rentals management) |
| Mortgage | $199 (8%) | Apartsales Mortgage broker (Year 2) |
| Software (Follow Up Boss, dotloop) | included | Apartsales Pro SaaS (Year 4+) |

**Главный урок:** один stream доминирует (lead-gen у Zillow = 66%, у Apartsales будет core commission ~50-60%), но adjacency'ии растут быстрее (Rentals +39%, Mortgage +37%). Мы должны строить такую же диверсификацию.

### 1.4 PropertyGuru — что мы заимствуем

| Stream | Замечания |
|---|---|
| Subscriptions for agents (recurring) | Apartsales B2B Pro/Enterprise/Strategic тарифы |
| Developer FastKey (sales enablement) | Apartsales Pro для застройщиков (Year 3+) |
| Data services ($11.8M proj 2025) | Apartsales Index Year 2 |
| Fintech / mortgage origination ($16.2M proj 2025) | Apartsales Mortgage broker Year 2 |
| StoryTeller (VR property tours) | Apartsales 3D + drone (Year 1) |

**Главный урок:** data licensing — это $10M+/год возможность для зрелого игрока. Apartsales Index должен быть приоритетом Year 2.

### 1.5 Что мы делаем уникально

```
┌─────────────────────────────────────────────────────────────┐
│ AVIASALES + ТИНЬКОФФ + ZILLOW + PROPERTYGURU                │
│             ↓                                               │
│        APARTSALES                                           │
│             +                                               │
│   ┌─────────────────────────────────┐                       │
│   │ LEAD LOCK INFRASTRUCTURE        │  ← наше уникальное    │
│   │ (юридически защищённая          │     преимущество     │
│   │  транзакционная фиксация)       │                       │
│   ├─────────────────────────────────┤                       │
│   │ AI-CONSIERGE AS PRIMARY UX      │  ← наша операционная  │
│   │ (диалог, не каталог)            │     дифференциация    │
│   ├─────────────────────────────────┤                       │
│   │ INVESTMENT RESORT SPECIALIZATION │ ← наша рыночная       │
│   │ (Crimea/Сочи/КавМинВоды focus)  │    позиция           │
│   ├─────────────────────────────────┤                       │
│   │ FULL CYCLE END-TO-END DIGITAL   │  ← наш product play  │
│   │ (Тинькофф-style для real estate)│                       │
│   └─────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ПОЛНЫЙ ЦИКЛ ОНЛАЙН

### 8 этапов end-to-end digital

```
┌──────────────┬───────────────────────────────────────────────┬───────────────┐
│ ЭТАП         │ ЧТО ПРОИСХОДИТ                                │ ИНТЕГРАЦИЯ    │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 1. SEARCH    │ User описывает цели AI-консьержу,             │ Apartsales AI │
│              │ AI находит 3-5 подходящих объектов            │ + Yield Pred. │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 2. SELECT    │ User изучает карточку объекта:                │ 3D-tour vendor│
│              │ • 3D virtual tour                             │ Drone footage │
│              │ • Drone-съёмка района                         │ vendor        │
│              │ • Yield/ROI калькулятор                       │ AI insights   │
│              │ • AI-инсайт                                   │               │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 3. KYC       │ Подтверждение личности через ЕСИА (Госуслуги).│ Госуслуги ЕСИА│
│              │ Никаких сканов паспорта руками                │ OAuth         │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 4. LOCK      │ Apartsales Lock: SMS-код, фиксация в CRM      │ Apartsales    │
│              │ застройщика, PDF-сертификат на 1% скидку      │ Lock backend  │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 5. CONTRACT  │ ДДУ генерируется в системе застройщика,       │ Госключ ЭП    │
│              │ user подписывает электронной подписью         │ (e-signature) │
│              │ через Госключ                                 │               │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 6. ESCROW    │ Открытие эскроу-счёта в банке через API.      │ Сбер/Тинькофф/│
│              │ User видит баланс эскроу в реальном времени   │ ВТБ API       │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 7. MORTGAGE  │ Если ипотека — заявка через Apartsales        │ Сбер/Тинькофф/│
│ (optional)   │ перенаправляется в банк, решение в 15 минут.  │ ВТБ ипотека   │
│              │ Мы получаем broker commission                 │ API           │
├──────────────┼───────────────────────────────────────────────┼───────────────┤
│ 8. PAY +     │ Платёж через ЮKassa/СБП на эскроу.            │ ЮKassa, СБП,  │
│ REGISTER     │ Регистрация ДДУ в Росреестре через            │ Госуслуги     │
│              │ Госуслуги (электронно).                       │ Росреестр API │
│              │ Apartsales автоматически применяет 1% скидку  │               │
└──────────────┴───────────────────────────────────────────────┴───────────────┘
```

### Технические партнёры — реестр интеграций

| Партнёр | Назначение | Год интеграции |
|---|---|---|
| **Госуслуги (ЕСИА)** | KYC, авторизация, signature flow | Y1 (Q1) |
| **Госключ** | Электронная подпись ДДУ | Y1 (Q2) |
| **Росреестр** | Регистрация ДДУ онлайн | Y1 (Q3) |
| **ЮKassa** | Платежи (карты, СБП) | Y1 (Q1) |
| **Сбер API** | Эскроу-счета, ипотека | Y2 |
| **Тинькофф API** | Эскроу, ипотека, рассрочка | Y2 |
| **ВТБ API** | Эскроу, ипотека | Y2-Y3 |
| **Bitrix24 / 1С-Битрикс** | CRM-интеграции с застройщиками | Y1 |
| **Booking, Airbnb API** | Yield management для арендодателей | Y1-Y2 |
| **YandexGPT / GigaChat** | AI distribution через сторонние ассистенты | Y2-Y3 |

### Юридическая инфраструктура

- **Агентский договор по ст. 1005 ГК РФ** — с каждым застройщиком (template подготовлен Q1 Y1)
- **Публичная оферта** для покупателей (использование платформы)
- **152-ФЗ согласие** на обработку PD
- **Соглашение об электронном документообороте** через Госключ
- **Партнёрское соглашение** для аффилиатов (Apartsales Partners)
- **Договор подписки** для B2B и B2C тарифов

---

## 3. CORE REVENUE

### Структура комиссии 3%

```
СДЕЛКА: Студия в ЖК "Морская Симфония", Ялта, 14 850 000 ₽

├── Gross commission от застройщика:    14 850 000 × 3% = 445 500 ₽
│
├── - Сертификат покупателю (1%):       14 850 000 × 1% = (148 500) ₽
│   ↓
│   Применяется автоматически как скидка к ДДУ
│   при closing через Apartsales
│
└── = NET CORE REVENUE:                                  297 000 ₽
                                                          ─────────
```

### Сравнение с альтернативными моделями

| Модель | Кто платит | Эффективная комиссия (от 14.85M ₽) | Гарантия close |
|---|---|---:|:---:|
| **Apartsales (transaction)** | **Застройщик** | **297 000 ₽** | **✅ Да (за close)** |
| ЦИАН (lead-gen / CPL) | Застройщик | ~50-150K ₽/лид × 30+ лидов на close = **150-300K ₽** | ❌ Нет (за лиды) |
| Etagi / агенты (% commission) | Застройщик | 3-5% = **445K-742K ₽** | ✅ Да |
| Самолёт Плюс | Застройщик + покупатель | ~3% (через УК) | ✅ Да |
| Покупатель платит риелтору | Покупатель | 100-300K ₽ | ❌ Нет |

**Ключевое преимущество Apartsales:**

1. Для **застройщика** — equivalent ЦИАНу по абсолютной сумме, но **с гарантией close**. Это структурно лучшая unit-economics.
2. Для **покупателя** — лучше всех альтернатив: получает 1% обратно (148.5K ₽) + бесплатный AI-консьерж + бесплатный Lead Lock.
3. Для **Apartsales** — устойчивая 3% маржа, не разбавленная конкуренцией за лиды (как у ЦИАН с -6.7% количества лидов).

### Pricing tiers по типу инвентаря

| Тип инвентаря | Стандартная комиссия | Условия |
|---|---:|---|
| Standard listing | 3% от ДДУ | Базовый договор |
| Premium showcase | 2.5% от ДДУ | Платная подписка Pro у застройщика |
| Strategic exclusive | 1.5% от ДДУ | Эксклюзив на ЖК для Apartsales |

Лучшая комиссия для Strategic — это incentive для застройщика подписать эксклюзив, что закрывает топ-инвентарь от конкурентов.

### Why this is structurally better than ЦИАН

ЦИАН зарабатывает на росте стоимости лида при падении количества — это **trap**: застройщики платят больше за тот же результат, недовольны, ищут альтернативы. Apartsales даёт застройщикам **predictable cost-per-acquisition** (комиссия привязана к close, не к лидам), что выровнивает наши incentive с их.

---

## 4. ADJACENT REVENUE

10 digital revenue streams, каждый из которых работает **без оффлайн touchpoint'ов**.

### 4.1 Apartsales Yield (rentals management)

**Что:** Управление сданной в аренду недвижимостью для удалённых владельцев.

**Полный цикл онлайн:**
1. Owner регистрирует объект в Apartsales после closing
2. Apartsales: подключение к Booking, Airbnb, Avito, Островок (API)
3. AI dynamic pricing — оптимальная цена за ночь по дням
4. Apartsales-консьерж координирует уборку, заезд/выезд
5. Owner видит rent-roll, отчётность в приложении

**Pricing:** 8-12% от gross rent-roll (в среднем 10%).

**Юнит-экономика:**
- Average yield на объект: ~1 100 000 ₽/год
- Apartsales Yield fee: ~110 000 ₽/год revenue per managed property
- Marginal cost: ~30 000 ₽/год (партнёрский клининг, software)
- **Net contribution: 80 000 ₽/год × 5 лет = 400 000 ₽ LTV**

**Сравнение с Zillow Rentals:** $630M revenue 2025, +39% YoY. У них multifamily, у нас курортная аренда — но **тот же flywheel: после покупки → recurring revenue**.

### 4.2 Mortgage broker integration (Year 2 launch)

**Что:** Apartsales перенаправляет ипотечные заявки в банки-партнёры, получает broker commission.

**Полный цикл онлайн:**
1. User в Apartsales: "Хочу ипотеку"
2. AI: "Заполню заявку за вас. У вас доход ___, объект ___ . Сделаю pre-approval в 5 банках за 15 минут"
3. Заявка через API → Сбер / Тинькофф / ВТБ / Альфа / Дом.рф
4. Решение в 15 минут от каждого
5. User выбирает лучшее предложение
6. Подписание ипотечного договора через Госключ
7. Apartsales получает 0.5-1% broker commission

**Pricing:** 0.5-1% от суммы ипотеки.

**Юнит-экономика:**
- Average ипотека на инвест-объект Крым: 8M ₽
- Apartsales commission: 80 000 ₽ при 1%
- Marginal cost: ~5 000 ₽ (compute + AI)
- **Net contribution: 75 000 ₽ per mortgage closed**
- Attach rate цели: 30% сделок Y2, 50% Y3+

**Сравнение с Zillow Mortgage:** $199M revenue 2025, +37% YoY. PropertyGuru fintech projected $16.2M в 2025. Это валидированная adjacency, проверенная мировыми players.

### 4.3 Юридический пакет — DDU чек, эскроу-проверка

**Что:** Apartsales-юристы (партнёры на retainer) проводят due diligence ДДУ.

**Полный цикл онлайн:**
1. User: "Перед подписанием хочу юр.чек"
2. ДДУ передаётся через систему партнёру-юристу
3. AI первичная проверка → human юрист finalize
4. Отчёт в 24 часа: красные флаги, рекомендации
5. Apartsales берёт fixed fee

**Pricing:** 49 900 ₽ за пакет.

**Юнит-экономика:**
- Revenue: 49 900 ₽
- Cost (юрист на partner-основе): 20 000 ₽
- **Margin: ~60%**
- Attach rate цели: 60% сделок Y1, 80% Y2+

### 4.4 Электронная подпись через Госключ

**Что:** Apartsales facilitates подписание ДДУ через Госключ (Госуслуги ЭП).

**Pricing:** 990 ₽ за документ (passing-cost + наш sliver).

**Стратегическая ценность:**
- Не главный revenue driver
- **Critical infrastructure** для full-cycle digital
- Нет такого сервиса в open-marketplace конкурентах = дифференциация

### 4.5 Эскроу assistance

**Что:** Apartsales выбирает оптимальный банк-эскроу-агент (по ставке, удобству), помогает открыть счёт онлайн.

**Pricing:** 9 900 ₽ fixed fee (administrative).

**Юнит-экономика:** низкая margin, но **высокая attach rate** (~95% сделок) → стабильный contribution.

### 4.6 Insurance broker

**Что:** Страхование объекта (имущество, титул, life insurance for borrower).

**Полный цикл онлайн:**
1. После closing user сравнивает 5 страховых компаний в Apartsales
2. Заявка → API страховщика
3. Договор подписывается через Госключ
4. Apartsales получает 5-10% от страховой премии

**Pricing:** 5-10% от страховой премии (стандартная broker rate).

**Юнит-экономика:**
- Average insurance premium: 25 000 ₽/год на объект
- Apartsales commission: 1 750 ₽ × 5 лет (avg renewal): **~9 000 ₽ LTV**

### 4.7 Furniture / меблировка под ключ

**Что:** Партнёрство с поставщиками мебели для apartments-под-аренду.

**Полный цикл онлайн:**
1. Apartsales Yield: "Ваш объект готовится к аренде. Меблировка?"
2. AI рекомендует пакет мебели по типу объекта (студия / 2-комн / премиум)
3. User видит 3 варианта (бюджет / комфорт / премиум) с виртуальной примеркой
4. Заказ через Apartsales → партнёр-поставщик
5. Доставка и сборка партнёром

**Pricing:** 5-10% mark-up на партнёрский каталог.

**Юнит-экономика:**
- Average furniture package: 800 000 ₽
- Apartsales mark-up 7%: **56 000 ₽ revenue per package**
- Cost: ~10 000 ₽ (AI + partner mgmt)
- **Net: 46 000 ₽ per furnished objект**
- Attach rate: 70% сданных в Apartsales Yield

### 4.8 Дизайн интерьера

**Что:** Партнёрство с дизайн-студиями.

**Pricing:** 49 000 ₽ — design package starter / 99 000 ₽ — premium.

**Юнит-экономика:** низкий attach rate (~10%), но высокая margin (60%). Niche product для premium-сегмента.

### 4.9 Переезд / клининг

**Что:** Партнёрские сервисы переезда и клининга (для покупателей и для гостей в Yield).

**Pricing:** 5% commission от партнёра.

### 4.10 3D-туры и drone-съёмка для застройщиков (B2B)

**Что:** Apartsales заказывает у партнёров 3D-туры и drone-съёмку, продаёт застройщикам как часть Apartsales Pro подписки.

**Pricing:** Включено в B2B Pro/Enterprise тарифы (см. секция 5).

**Стратегическая ценность:** обеспечивает quality в карточках объектов = выше conversion = больше комиссий для нас.

### Сводная таблица adjacent streams

| Stream | Revenue/unit | Cost/unit | Net margin | Attach rate Y3 | LTV per buyer |
|---|---:|---:|---:|---:|---:|
| Apartsales Yield | 110K ₽/год | 30K | 73% | 35% × 5 лет | 400K ₽ |
| Mortgage broker | 80K ₽ once | 5K | 94% | 50% | 75K ₽ |
| Юр.пакет | 49.9K ₽ once | 20K | 60% | 80% | 30K ₽ |
| Госключ ЭП | 0.99K ₽ × 3 docs | 0.5K | 49% | 100% | 1.5K ₽ |
| Эскроу assistance | 9.9K ₽ once | 1K | 90% | 95% | 9K ₽ |
| Insurance broker | 1.75K ₽/год | 0.3K | 83% | 60% × 5 лет | 5K ₽ |
| Furniture | 56K ₽ once | 10K | 82% | 25% (Yield only) | 14K ₽ |
| Design interior | 50K ₽ once | 20K | 60% | 8% | 4K ₽ |
| Переезд/клининг | 3K ₽ once | 0.5K | 83% | 30% | 1K ₽ |
| **TOTAL adjacent LTV** | | | | | **~540K ₽** |

**Это значит:** в зрелой модели **adjacent revenue per buyer (540K ₽) почти в 2× больше core commission (297K ₽)**. Это прямое подтверждение Zillow и PropertyGuru опыта — adjacent ecosystem = главный engine LTV.

---

## 5. SUBSCRIPTION REVENUE

### 5.1 B2C тарифы для покупателей

| Тариф | Цена | Что включено |
|---|---:|---|
| **Apartsales Free** | 0 ₽ | AI-консьерж 5 диалогов/мес, поиск, базовые туры, чат, **сертификат 1%** |
| **Apartsales Premium** | 990 ₽/мес или 7 990 ₽/год | Безлимит AI, due diligence reports, ROI Pro, юр.шаблоны, приоритет в очереди консьержа |
| **Apartsales Pro Investor** | 4 990 ₽/мес или 39 990 ₽/год | Personal AI+human эксперт, налоговое планирование, портфельный анализ, ежемесячные ZOOM-консультации, доступ к закрытым ЖК |

**Стратегическая роль B2C subscriptions:**
- **НЕ главный revenue driver** Year 1-3
- **Фильтр серьёзности** — оплатил 990 ₽ → 2.5× выше conversion на сделку
- **Recurring revenue** — стабилизирует cashflow
- **Branding** — "Apartsales Pro Investor" звучит престижно, что-то иметь престижное

**Сравнение с Tinkoff Pro (Tinkoff Black 2.0):** Тинькофф продаёт premium-подписки за статус и плюшки. Та же модель работает у нас — 4 990 ₽/мес — это меньше, чем стоит хороший ужин в Москве.

### 5.2 B2B тарифы для застройщиков

| Тариф | Цена | Что включено | Целевой сегмент |
|---|---|---|---|
| **Apartsales Listed** | 0 ₽/мес + 3% success fee | Базовый листинг, видимость в поиске, доступ к Lock-инфраструктуре | Все застройщики (default) |
| **Apartsales Pro** | 50 000 ₽/мес + 2.5% success fee | + аналитика по интересу к объектам, A/B-тесты на цены, premium placement, 3D-tour включён | Mid-tier застройщики (10-50 объектов в продаже) |
| **Apartsales Enterprise** | 200 000 ₽/мес + 2% success fee | + dedicated account manager (1 на 1), кастомизация feed, exclusive promotions, drone-съёмка | Top-tier застройщики (>50 объектов) |
| **Apartsales Strategic** | По договорённости + 1.5% success fee | Эксклюзив на ЖК, приоритет AI-выдачи, joint marketing, joint PR | 5-10 партнёров премиум-уровня |

**Структура revenue Apartsales Pro застройщика:**
- 50 000 ₽/мес × 12 = **600 000 ₽/год subscription**
- Average 12 closes/year × 14M ₽ × 2.5% = **4 200 000 ₽/год success fee**
- **Total LTV/застройщик/год: ~4.8M ₽**

**Цель Year 3:** 100+ застройщиков, из них ~50% на Pro+ тарифах = ~30M ₽/мес recurring B2B subscription revenue (~360M ₽/год).

**Сравнение с PropertyGuru:** их subscription model для агентов = recurring revenue base. ARPA (Average Revenue Per Agent) растёт год к году. У нас ARPA по застройщикам существенно выше из-за specialization.

### 5.3 Психология ценообразования B2C — Тинькофф-style

**Принципы:**
1. **Free tier даёт реальную ценность** — не watered-down версию, как у некоторых конкурентов. Покупатель Free может закрыть сделку и получить сертификат.
2. **Premium и Pro — не essentials, а multipliers** — те, кто хочет глубже погружения, получают tooling
3. **Ежемесячная подписка vs annual со скидкой** — годовой тариф +33% (7 990 vs 990×12 = 11 880) → motivates annual lock-in
4. **Pro Investor = lifestyle product** — 4 990 ₽/мес = около стоимости 2 ужинов в Москве. Доступно для среднего class инвестора.

---

## 6. DATA REVENUE — APARTSALES INDEX

### Что продаём

**Apartsales Index** — публичный + приватный data product, основанный на 12+ месяцах сделок через нашу платформу.

**Public** (бесплатно, для PR и SEO):
- Месячный индекс цен по hubs (Ялта, Алушта, Сочи, и т.д.)
- Yield-индекс по типам объектов
- Динамика интереса покупателей
- ROI-калькулятор открытый

**Private** (платно для B2B):

| Тариф | Кому | Цена |
|---|---|---:|
| **Apartsales Index API** | Банки (для valuation) | 250 000 ₽/мес |
| **Apartsales Insights** | Оценщики, страховщики | 100 000 ₽/мес |
| **Apartsales Reports** | Журналисты, аналитики, инвест-фонды | 50 000 ₽/отчёт + 30 000 ₽/мес subscription |
| **Apartsales Whitebook** | Застройщики (эксклюзив insights по конкурентам) | 500 000 ₽/мес (top-tier only) |

### Цикл создания

1. **Year 1 Q3:** запуск Public Apartsales Index (на сделках первого года). Free, для бренд-build
2. **Year 2 Q1:** запуск B2B Insights — продажа банкам и оценщикам
3. **Year 2 Q3:** запуск Apartsales Reports — журналам и фондам
4. **Year 3:** Whitebook для top-застройщиков

### Targeted revenue

| Год | Public users | B2B clients | Revenue |
|---|---:|---:|---:|
| Y1 | — | — | 0 ₽ |
| Y2 | 50K | 10 (banks + assessors) | 30M ₽ |
| Y3 | 200K | 35 | 130M ₽ |
| Y5 | 1M | 80 | 600M ₽ |

**Сравнение с PropertyGuru:** их data services projected $11.8M в 2025 = ~1B ₽. Наш Y5 target — 600M ₽, это agressive но valid.

### Как это создаёт moat

Apartsales Index основан на **наших уникальных данных**: каждая сделка через нашу платформу = ground truth для AI. Конкуренты не имеют такой data trail.

К Year 3 у нас:
- 5 000+ сделок в database
- 50 000+ показов с трекингом
- 200 000+ AI-диалогов
- ML-модели Yield Predictor с точностью ±10%

Это data flywheel, **который нельзя купить и нельзя быстро воссоздать**.

---

## 7. ADVERTISING REVENUE

### 7.1 Branded listings ("бренд-объекты")

Аналог Aviasales "бренд-билет": застройщик платит за поднятие конкретного объекта в выдаче независимо от ranking factors.

**Pricing:** 30 000-100 000 ₽/мес за объект (зависит от спрос на район).

**CTR ожидаемый:** 3-5% (vs ~1% organic) — как у Aviasales бренд-билетов.

### 7.2 Showcase placements

Каркас premium-карточки: видео-обложка, AI-инсайт от застройщика, дополнительные фото, виртуальный тур.

**Pricing:** 200 000 ₽/мес за ЖК или 500 000 ₽/мес за группу ЖК.

### 7.3 Спецпроекты с застройщиками

Кастомные content-кампании: статьи в Apartsales Studio, видео-туры, Telegram-марафоны.

**Pricing:** 500 000 ₽ — 5 000 000 ₽ за проект.

**Пример:** "Открытие нового ЖК Бухта Истомина" → 4-недельная кампания с серией статей, видео-обзоров, Telegram-трансляции, AI-инсайтов = 2 500 000 ₽ за проект.

### 7.4 Email и push кампании

**Pricing:** 50 000 ₽ за targeted email кампанию (по нашей базе подписчиков).

### Targeted advertising revenue

| Год | % от total revenue | Млрд ₽ |
|---|---:|---:|
| Y1 | 5% | 6.5M |
| Y2 | 7% | 32M |
| Y3 | 6% | 62M |
| Y5 | 5% | 1100M |

---

## 8. AFFILIATE PROGRAM (Apartsales Partners)

### Зеркало Travelpayouts

Aviasales имеет Travelpayouts — программу для блогеров и сайтов, которые приводят клиентов и получают долю комиссии. Это распространяет brand и acquisition без агрессивного маркетингового spending.

### Apartsales Partners — структура

```
APARTSALES PARTNERS

├── Tier 1: Travel/Investment Bloggers
│   ├── Reward: 10% от Apartsales net commission
│   ├── Tracking: персональная UTM ссылка
│   └── Tools: white-label landing для блогера, content-pack
│
├── Tier 2: Telegram-каналы (инвест, недвижимость)
│   ├── Reward: 7% от Apartsales net commission
│   ├── Format: пост-интеграция, нативный контент
│   └── Tools: SDK для виджета, статистика
│
├── Tier 3: Региональные риелторы и агентства
│   ├── Reward: 15% от Apartsales net commission (выше других)
│   ├── Logic: они закрывают сделку, мы предоставляем платформу
│   └── Use case: classic agent → Apartsales-enabled agent
│
├── Tier 4: B2B-партнёры (бухгалтеры, нотариусы, консультанты)
│   ├── Reward: 5% от Apartsales net commission
│   ├── Logic: их клиенты покупают недвижимость → они referят
│   └── Tools: партнёрский dashboard
│
└── Tier 5: Корпоративные партнёрства (HR-департаменты крупных IT-компаний)
    ├── Reward: revenue-share от successful onboarded clients
    ├── Use case: "льгота для сотрудников" — Yandex, VK, Tinkoff корпорация
    └── Тoo$ls: white-label интеграция в HR-портал
```

### Юнит-экономика affiliate

**Пример Tier 1 блогер:**
- Блогер 100K subs, делает 1 видео/мес о нашей услуге
- Конверсия видео → close: 0.05% (50 closes per 100K views)
- Apartsales net commission на close: 297 000 ₽
- Affiliate payout 10%: 29 700 ₽ × 50 closes = **1.5M ₽ payout per video**
- Apartsales revenue: 297K × 50 - 1.5M = **13.4M ₽ net** на одном видео

Это очень привлекательно для блогеров (1.5M ₽ за 1 видео — больше, чем большинство sponsorship'ов в РФ-инете).

### Targeted affiliate revenue

| Год | Активных аффилиатов | % closes from affiliate | Revenue contribution |
|---|---:|---:|---:|
| Y1 | 0 (запуск Q4) | — | 0 |
| Y2 | 50 | 15% | 60M ₽ |
| Y3 | 200 | 22% | 220M ₽ |
| Y5 | 800 | 30% | 1500M ₽ |

---

## 9. SAAS / WHITE-LABEL — YEAR 4+

### 9.1 Apartsales Pro для агентств

**Что:** SaaS-tool для классических агентств недвижимости (мини-Apartsales для их клиентов).

**Что включает:**
- AI-ассистент в их брендинге
- CRM-модуль (lite-версия)
- Автоматизация документооборота
- Госключ-интеграция
- Эскроу-checks

**Pricing:** 30 000-100 000 ₽/мес per agency, в зависимости от количества риелторов.

**Целевой ICP:** агентства 5-50 риелторов (их в РФ ~3000-5000).

### 9.2 White-label для региональных партнёров

Региональные хабы Year 4+ могут работать как **white-label**: локальный партнёр запускает "Apartsales Camchatka" на нашей платформе, мы получаем 30-40% revenue share.

**Этот подход** хорошо работал у Idealista (Spain) и PropertyGuru (через FastKey), он позволяет быстрое расширение без CapEx.

### 9.3 API для застройщиков (новостройка-as-service)

Top-застройщики могут платить за интеграцию своих внутренних CRM-систем с Apartsales API:
- Auto-sync inventory
- Real-time pricing updates
- Lead lock webhooks
- Sales automation

**Pricing:** 50 000-300 000 ₽/мес fixed fee + per-transaction.

### Targeted SaaS revenue Year 5

- Apartsales Pro для агентств: 200 агентств × 60K avg = 12M ₽/мес = **144M ₽/год**
- White-label партнёров: 5 регионов × 15M revenue share/год = **75M ₽**
- API: 50 застройщиков × 100K = **60M ₽/год**

**Total Y5 SaaS:** ~280M ₽

---

## 10. REVENUE TRAJECTORY

### Распределение по streams (% от total)

| Stream | Y1 | Y2 | Y3 | Y5 | Y7 |
|---|---:|---:|---:|---:|---:|
| Core commission | 60% | 55% | 50% | 45% | 40% |
| Adjacent services | 25% | 28% | 30% | 25% | 22% |
| Subscriptions B2B+B2C | 7% | 10% | 12% | 15% | 17% |
| Data (Apartsales Index) | 0% | 3% | 5% | 7% | 8% |
| Advertising | 5% | 3% | 2% | 5% | 6% |
| Affiliate | 0% | 1% | 1% | 3% | 5% |
| SaaS / White-label | 0% | 0% | 0% | 0% (запуск) | 2% |
| **Total revenue** | **100%** | **100%** | **100%** | **100%** | **100%** |

### Абсолютные числа (Seed scenario)

| Stream | Y1 | Y2 | Y3 | Y5 | Y7 |
|---|---:|---:|---:|---:|---:|
| Core commission | 78M | 250M | 519M | 9 900M | 24 000M |
| Adjacent services | 32M | 127M | 311M | 5 500M | 13 200M |
| Subscriptions | 9M | 45M | 124M | 3 300M | 10 200M |
| Data | 0 | 14M | 52M | 1 540M | 4 800M |
| Advertising | 6M | 14M | 21M | 1 100M | 3 600M |
| Affiliate | 0 | 5M | 10M | 660M | 3 000M |
| SaaS | 0 | 0 | 0 | 0 | 1 200M |
| **Total** | **130M** | **454M** | **1 037M** | **22 000M** | **60 000M** |

> Year 5 cross-check: 22 млрд ₽ = $260M = на уровне зрелого PropertyGuru ($117M, но без специализации). $260M = ~10× нашего раунда Seed at post-money $12M = 22× return за 5 лет. **Это decacorn-trajectory.**

### Critical observation

```
В Year 1 — мы простой broker (60% rev = commission)
   ↓
К Year 3 — мы платформа со множеством streams (50% commission, 50% всё остальное)
   ↓
К Year 5 — мы экосистема (45% core, 55% adjacency = recurring + scalable)
   ↓
К Year 7 — мы super-app (40% core, 8% data, 17% subscriptions, 22% adjacent = stable revenue base даже при коррекциях рынка)
```

**Это та же траектория, что у Zillow:** в 2020-х они были lead-gen платформой (75% Premier Agent), к 2025 диверсифицировали на 66% residential / 24% rentals / 8% mortgage. Apartsales делает то же самое — но **на 5 лет быстрее, потому что начинаем с этой структурой в архитектуре**.

---

## 11. UNIT ECONOMICS

### LTV per buyer breakdown

```
APARTSALES BUYER LIFETIME VALUE (Year 3+ steady-state)
─────────────────────────────────────────────────────

CORE TRANSACTION (one-time):
  Net commission:                            297 000 ₽
  Adjacent at-purchase services:
    + Юр.пакет (80% attach):                  40 000 ₽
    + Эскроу assistance (95%):                 9 500 ₽
    + Госключ ЭП (100%):                       1 500 ₽
    + Insurance broker (60% attach × 5y):      9 000 ₽
    + Furniture (25% × 56K):                  14 000 ₽
    + Mortgage broker (50% × 75K):            37 500 ₽
                                            ────────────
   Subtotal at-purchase:                     408 500 ₽

RECURRING (5 years post-purchase):
  Apartsales Yield (35% attach × 80K × 5):  140 000 ₽
  Subscription Premium (15% × 990 × 60mo):    8 900 ₽
                                            ────────────
   Subtotal recurring:                       148 900 ₽

REFERRAL VALUE:
  Friends/family attribution (15% rate):     ~50 000 ₽
                                            ────────────
   
TOTAL BUYER LTV:                              ~607 000 ₽
─────────────────────────────────────────────────────
```

### CAC per buyer (Y3 steady-state)

| Channel | % closes from channel | CAC | Source |
|---|---:|---:|---|
| Direct / SEO / brand | 25% | 0 ₽ | organic |
| Paid acquisition (VK, Yandex) | 15% | 200 000 ₽ | performance |
| Affiliate | 30% | 60 000 ₽ | affiliate payouts |
| Referral | 15% | 0 ₽ | from existing buyers |
| Apartsales Studio (content) | 10% | 50 000 ₽ | content production |
| PR | 5% | 30 000 ₽ | PR retainers |
| **Blended CAC** | **100%** | **~85 000 ₽** | |

### LTV : CAC

- LTV: 607 000 ₽
- CAC: 85 000 ₽
- **LTV : CAC = 7.1 : 1**

> Healthy SaaS benchmark: 3:1. Healthy marketplace: 4-6:1. Apartsales target: 7:1+ к Year 3 за счёт adjacent ecosystem и referrals.

### Margin analysis по stream

| Stream | Net margin | Reason |
|---|---:|---|
| Core commission | 65% | High margin (просто комиссия), но требует BD-спендинга |
| Adjacent yield mgmt | 73% | Recurring, low marginal cost |
| Adjacent legal pack | 60% | Партнёрские юристы |
| Adjacent furniture | 82% | Mark-up без логистики |
| Adjacent mortgage | 94% | Pure broker fee |
| Subscriptions B2C | 88% | High margin SaaS |
| Subscriptions B2B | 75% | После BD-спендинга |
| Data (Index) | 85% | Margin SaaS |
| Advertising | 90% | Pure margin (наш inventory) |
| Affiliate | 50% | После payout 10-15% |
| **Blended Y5** | **~70%** | |

---

## 12. ROADMAP АКТИВАЦИИ STREAM'ОВ

### Year 1 (Crimea launch)

**Q1:**
- ✅ Core commission stream live
- ✅ B2C subscription tiers
- ✅ B2B Listed tariff
- ✅ Apartsales Lock + сертификат
- ✅ Эскроу assistance

**Q2:**
- ✅ Apartsales Yield (rentals management)
- ✅ Юридический пакет
- ✅ Госключ ЭП integration
- ✅ B2B Pro tariff активирован

**Q3:**
- ✅ Apartsales Studio (контент)
- ✅ Insurance broker
- ✅ Furniture partnership
- ✅ Branded listings (advertising stream)

**Q4:**
- ✅ B2B Enterprise tariff (для top-3 застройщиков)
- ✅ Apartsales Public Index v1 (free)
- ✅ Apartsales Partners (affiliate) Tier 1-2 запуск

### Year 2 (юг РФ)

**Q1:**
- 🚀 Mortgage broker integration (Сбер + Тинькофф)
- 🚀 Apartsales Index private (B2B feed)
- 🚀 Apartsales Partners Tier 3 (региональные агентства)
- 🚀 Spec-проекты (advertising)

**Q3:**
- 🚀 B2B Strategic tariff (эксклюзив)
- 🚀 Apartsales Reports (для журналистов/фондов)
- 🚀 Дизайн-интерьер партнёрство

### Year 3-4

- Apartsales Whitebook (для top-застройщиков)
- Apartsales Concierge premium tier
- Apartsales API для застройщиков

### Year 4-5

- Apartsales Pro SaaS для агентств
- White-label для региональных партнёров
- Cross-border preparation (Domonly convergence)

### Зависимости между stream'ами

```
Core commission (Y1)
   ↓ (нужны сделки)
Apartsales Yield (Y1) — после первого closing
   ↓ (нужны owners)
Furniture / Insurance / Дизайн (Y1-Y2) — для тех, кто в Yield
   ↓ (нужны данные)
Apartsales Index (Y1 public, Y2 B2B) — основано на сделках
   ↓ (нужен бренд)
Apartsales Partners (Y1 Q4) — нужна reputation для аффилиатов
   ↓ (нужно ≥1B revenue)
SaaS / White-label (Y4+) — нужна зрелость продукта
```

Каждый последующий stream активируется когда **предыдущий генерирует достаточно данных или объёма для следующего**. Это organic ecosystem growth.

---

## APPENDIX

### A. Глоссарий

| Термин | Определение |
|---|---|
| **Core commission** | 3% от ДДУ, выплачивается застройщиком при closing |
| **Adjacent services** | Дополнительные services per-deal: yield, mortgage, legal etc. |
| **Subscription** | Recurring подписка (B2B застройщики, B2C покупатели) |
| **Travelpayouts** | Affiliate сеть Aviasales |
| **NDC** | New Distribution Capability — IATA-стандарт для прямого бронирования |
| **Госключ** | Сервис электронной подписи через Госуслуги |
| **ЕСИА** | Единая система идентификации (Госуслуги-аутентификация) |
| **Эскроу** | Счёт у банка-агента, на котором деньги хранятся до выполнения условий ДДУ |
| **Lead Lock** | Apartsales-механика юридической фиксации лида (см. Master doc 2.7) |
| **LTV** | Lifetime Value (доход от клиента за весь период отношений) |
| **CAC** | Customer Acquisition Cost (стоимость привлечения клиента) |
| **ARPA** | Average Revenue Per Account (средняя выручка с подписчика) |
| **Attach rate** | % основных сделок, к которым добавлен adjacent service |

### B. Источники

- Aviasales бизнес-модель — Wikipedia, vc.ru, travelpayouts.com, the-village.ru
- Тинькофф философия — публичные интервью, Forbes profiles
- Zillow Q4 2025 financials — housingwire.com, Inman
- PropertyGuru data services — kr-asia.com, propertyguru newsroom
- Российский рынок ипотеки 2025 — Домклик, Сбер, ЦБ РФ
- Стандарты NDC — IATA documentation

### C. Связанные документы

- [00-MASTER.md](00-MASTER.md) — главный справочник
- [01-STRATEGY-v2.0.md](01-STRATEGY-v2.0.md) — стратегическая модель
- [02-FINANCIAL-MODEL-v1.md](02-FINANCIAL-MODEL-v1.md) — финансовая модель (3 сценария)
- [03-COMPETITIVE-DEEP-DIVE-v1.md](03-COMPETITIVE-DEEP-DIVE-v1.md) — конкурентный анализ

---

## ПОДПИСЬ

**Документ:** Apartsales Product Line & Monetization v1
**Версия:** v1.0 (29 апреля 2026)
**Авторы:** Billions X × Claude
**Файл:** `docs/apartsales/04-PRODUCT-MONETIZATION-v1.md`

**Следующая итерация (v1.1):**
- После первых 50 сделок: replace оценок реальными attach rates
- Углубить unit economics по cohorts (по hub'ам, по типам объектов)
- Добавить sensitivity analysis для CAC blended
- Spec'и для каждой партнёрской интеграции (Сбер API, Госключ, ЮKassa)
- Pricing experiments (A/B тесты на subscription тарифах)

---

*"Apartsales — это Тинькофф для real estate.*
*Полный цикл онлайн. Ноль офисов. Многократный revenue per buyer.*
*Decacorn-трактория к Year 7."*
