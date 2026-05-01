# 14. KPI и метрики

## 1. North Star Metric

**Apartsales North Star: GMV-Active-Users-Index (GAU-Index)**

```
GAU-Index = (GMV / billion ₽) × ln(MAU / 1000) × NPS_factor
```

Почему именно так:
- GMV отражает реальную ценность для рынка.
- ln(MAU) — рост сообщества с уменьшением маржинальной отдачи.
- NPS_factor — поправка на качество (формула 1 + NPS / 100).

**Цели:**
| Год | GMV       | MAU    | NPS | GAU-Index    |
|-----|-----------|--------|-----|---------------|
| Y1  | 5B ₽      | 50K    | 30  | ~25           |
| Y3  | 200B ₽    | 5M     | 50  | ~2 500        |
| Y5  | 2T ₽      | 50M    | 60  | ~35 000       |

---

## 2. OKR-фреймворк

### Y1 OKRs

**O1: Доказать product-market fit в Сочи + Крым**
- KR1.1: 200 закрытых сделок к M12.
- KR1.2: GMV 5B ₽.
- KR1.3: NPS ≥ 30.
- KR1.4: Retention 30-day для застройщиков ≥ 70%.

**O2: Построить технологический фундамент**
- KR2.1: All 15 микросервисов в production.
- KR2.2: Open API в публичной документации (Mintlify).
- KR2.3: White-label CRM (#10) — 50 застройщиков активно используют.
- KR2.4: AI Concierge — 60% сделок инициируется через него.

**O3: Закрепить моат**
- KR3.1: Apartsales Score™ покрытие 95% юнитов.
- KR3.2: 50K страниц пред-генерированы и проиндексированы.
- KR3.3: 1M подписчиков совокупно через Media Empire (#58).

### Y3 OKRs (high-level)

**O1: Выйти в топ-3 PropTech СНГ + Залив**
- GMV 200B ₽.
- 5K застройщиков.
- AS-Index ETF.

**O2: Запустить Apartsales Bank**
- Лицензия в DIFC или Узбекистане.
- $500M в депозитах.

**O3: Глобальная expansion**
- Operations в 30 регионах.
- 6 языков на платформе.
- 5M MAU.

---

## 3. Operational KPIs (по слоям)

### Acquisition

| Метрика                             | Y1     | Y3       | Y5         |
|-------------------------------------|--------|----------|------------|
| Уникальные посетители / мес         | 500K   | 25M      | 200M       |
| Доля органического трафика          | 40%    | 70%      | 80%        |
| CAC blended                         | 2K ₽   | 1K ₽     | 500 ₽      |
| CAC paid only                       | 8K ₽   | 5K ₽     | 3K ₽       |

### Engagement

| Метрика                             | Y1     | Y3       | Y5         |
|-------------------------------------|--------|----------|------------|
| MAU / Total Users                   | 25%    | 35%      | 45%        |
| AI Concierge sessions / user / мес  | 2      | 5        | 10         |
| Digital Twin views / unit           | 50     | 150      | 300        |
| Reverse Marketplace requests / day  | 100    | 5K       | 50K        |

### Conversion

| Метрика                             | Y1     | Y3       | Y5         |
|-------------------------------------|--------|----------|------------|
| Лид → бронь conversion              | 5%     | 12%      | 18%        |
| Бронь → сделка conversion           | 25%    | 35%      | 45%        |
| KYC pass rate                       | 80%    | 90%      | 95%        |
| Mortgage approval rate              | 65%    | 80%      | 85%        |

### Retention / LTV

| Метрика                             | Y1      | Y3        | Y5        |
|-------------------------------------|---------|-----------|-----------|
| Annual retention (B2C clients)      | 40%     | 60%       | 75%       |
| Annual retention (B2B developers)   | 80%     | 92%       | 96%       |
| LTV / CAC                           | 3       | 8         | 15        |
| Avg revenue per customer (B2C)      | 250K ₽  | 1.5M ₽    | 3M ₽      |

### Revenue mix

| Поток                              | Y1  | Y3  | Y5  |
|-------------------------------------|-----|-----|-----|
| Transaction fees (% of total)       | 35% | 13% | 9%  |
| Subscriptions (B2B + B2C)           | 23% | 12% | 4%  |
| Financial products                  | 27% | 38% | 22% |
| Data & Analytics                    | 2%  | 16% | 5%  |
| Ecosystem commissions               | 9%  | 9%  | 5%  |
| Adjacent (academy / media / events) | 5%  | 12% | 5%  |
| Exchange / Sovereign / Investment   | 0%  | 0%  | 50% |

---

## 4. Product KPI per продукт (топ-10)

### #1 Apartsales Score™
- Покрытие юнитов: 95% к Y1, 99% к Y3.
- Корреляция Score → реальный лик-rate (на ресейле): >0.7.
- % покупателей, смотрящих на Score: >80%.

### #6 AI Concierge
- Активных сессий / день к Y3: 500K.
- Конверсия из сессии в лид: 30%.
- CSAT: ≥ 4.6/5.

### #11 SLA-движок
- Median time-to-first-response застройщика: <30 мин Y3.
- % просроченных лидов: <5% Y3.

### #21 PCET
- Объём токенизированных активов к Y3: 1B ₽ (1B токенов в обращении).
- Liquidity: avg daily volume / total cap > 0.1%.

### #22 Reverse Marketplace
- Запросы / день к Y3: 5K.
- Конверсия в сделку: 25%.

### #23 AS-Index
- Цитирование в СМИ / мес: 100+ к Y3.
- Платных подписчиков на Pro tier: 5K.

### #24 Apartsales Bank
- Депозиты к Y3 (если активно): $100M.
- Депозиты к Y5: $2B.

### #34 Real Estate Exchange
- Daily volume к Y5: $1B+.
- Active accounts к Y5: 100K.

### #58 Media Empire
- Подписчики совокупно: 1M Y1 → 30M Y3 → 100M Y5.
- Engagement rate: 5%+.

### #36 Carbon Credits
- ESG-сертифицированных ЖК: 20 Y1 → 5K Y3 → 50K Y5.
- Объём credits торгуется ежегодно: $100M Y3.

---

## 5. Cohort analysis framework

Все когорты замеряются по:
- **Retention curve** (D1, D7, D30, M3, M6, Y1).
- **Revenue retention** (стандарт SaaS — net revenue retention).
- **GMV per cohort** — динамика по году.

**Цель:** Net Revenue Retention (NRR) 120%+ по платным когортам Y3+.

---

## 6. NPS / CSAT методология

### NPS

**Замеряется:**
- После KYC.
- После каждой сделки (через 7, 30, 90 дней).
- Ежемесячно для активных подписчиков.

**Цели:**
- Y1 ≥ 30 (good).
- Y3 ≥ 50 (excellent).
- Y5 ≥ 60 (world-class).

### CSAT (для AI Concierge, Concierge top-1%, поддержка)
- Y1 ≥ 4.5/5.
- Y3 ≥ 4.7/5.

---

## 7. Финансовые метрики

### Unit economics

| Метрика                            | Y1     | Y3      | Y5      |
|------------------------------------|--------|---------|---------|
| Avg sale price на платформе        | 8M ₽   | 15M ₽   | 25M ₽   |
| Take-rate (комиссия)               | 1.5%   | 2.0%    | 2.5%    |
| Revenue per transaction            | 120K ₽ | 300K ₽  | 625K ₽  |
| Margin per transaction             | 60%    | 75%     | 80%     |
| Contribution per transaction       | 72K ₽  | 225K ₽  | 500K ₽  |

### Company-level

| Метрика                            | Y1     | Y3       | Y5         |
|------------------------------------|--------|----------|------------|
| Revenue                            | 220M ₽ | 32B ₽    | 500B ₽     |
| Gross margin                       | 50%    | 65%      | 70%        |
| EBITDA margin                      | -200%  | -10%     | 30%        |
| Burn / month                       | 80M ₽  | 0        | (profit)   |
| Cash-flow positive                 | no     | M40      | yes        |

---

## 8. Engineering KPIs

| Метрика                            | Цель Y3                  |
|------------------------------------|--------------------------|
| Uptime (S0 services)               | 99.95%                   |
| API p95 latency                    | <200ms                   |
| Page load p95 (web)                | <1.5s                    |
| Time-to-deploy (commit → prod)     | <30 мин                  |
| Critical security incidents / год  | 0                        |
| Bug escape rate (prod / sprint)    | <5%                      |
| Test coverage                      | >80% backend, >60% web   |

---

## 9. Compliance KPIs

| Метрика                              | Цель Y3   |
|--------------------------------------|-----------|
| KYC false-positive rate              | <2%       |
| AML alerts / month                   | tracked   |
| GDPR data subject requests resolved within 30 days | 100% |
| 152-ФЗ data residency violations     | 0         |
| SOC 2 Type II certification          | Y2 obtained |
| ISO 27001                            | Y3 obtained |

---

## 10. Health dashboards

### Топ-уровень (CEO)
- North Star (GAU-Index).
- Revenue.
- Burn / runway.
- NPS.
- Регионы операций.

### Продукт (CPO)
- DAU / MAU / WAU.
- Concierge usage.
- Funnel конверсия.
- Top-10 продуктов по сесcиям.

### Финансы (CFO)
- Revenue по 7 потокам.
- Unit economics.
- LTV / CAC.
- Cash flow.

### Технологии (CTO)
- SLA / uptime.
- Engineering velocity.
- Security incidents.

### Compliance (CCO)
- KYC funnel.
- AML alerts.
- Regulatory pipeline (лицензии в работе).
