# 12. Tech Architecture

> Архитектура построена под глобальный мульти-региональный multi-tenant продукт с дня 0. Не «потом дотюним».

---

## 1. Top-level diagram

```
                       ┌─────────────────────────┐
                       │  EDGE / CDN (Cloudflare) │
                       └────────────┬────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
   ┌────────▼────────┐    ┌─────────▼────────┐    ┌────────▼────────┐
   │  WEB (Next.js)  │    │  MOBILE iOS/AND  │    │   PARTNER API   │
   │  apartsales.com │    │  Native + RN     │    │  Open API + WH  │
   │  apartsales.ru  │    │                  │    │                 │
   └────────┬────────┘    └─────────┬────────┘    └────────┬────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │   API GATEWAY (Kong)     │
                       │   Auth / RateLimit / OAuth│
                       └────────────┬────────────┘
                                    │
   ┌────────────────────────────────┼────────────────────────────────┐
   │                                │                                │
┌──▼───┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────▼────┐
│Listing│ │Discovery │ │Trust/KYC │ │Payments  │ │AI/ML     │ │Reporting  │
│Service│ │/Search   │ │AML       │ │Mortgage  │ │Concierge │ │Analytics  │
└──┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
   │          │            │            │            │            │
   └──────────┴────────────┼────────────┴────────────┴────────────┘
                           │
              ┌────────────▼────────────┐
              │  EVENT BUS (Kafka)       │
              └────────────┬────────────┘
                           │
   ┌──────────┬────────────┼────────────┬───────────┐
   │          │            │            │           │
┌──▼──┐  ┌────▼─────┐ ┌────▼────┐  ┌────▼────┐ ┌────▼──────┐
│Postgres│Listings │ │ClickHouse│ │Pinecone │ │S3 / Object │
│(OLTP)  │ │CMS data │ │(OLAP)   │ │(Vector) │ │Storage     │
└────────┘ └─────────┘ └─────────┘ └─────────┘ └────────────┘
```

---

## 2. Stack — обоснование

### Frontend

- **Web:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui.
- **Mobile:** Swift (iOS native) + Kotlin (Android native) + React Native для shared screens (admin / CRM).
- **Дизайн-система:** BillionsX Design System v3.0 (iOS 26 Liquid Glass).
- **State:** TanStack Query + Zustand.
- **Build / Deploy:** Vercel (web), Apple App Store + TestFlight, Google Play.

### Backend

- **Languages:** Go (high-throughput services), Node.js/TypeScript (BFF, integrations), Python (ML pipelines).
- **API gateway:** Kong + custom auth.
- **Microservices** (топ-15):
  1. Listings Service — юниты / ЖК / застройщики.
  2. Discovery / Search Service.
  3. Trust / KYC / AML Service.
  4. Payments / Crypto Rails Service.
  5. Mortgage Service.
  6. AI / Concierge Service.
  7. Pricing Engine Service.
  8. Reporting / Analytics Service.
  9. CMS / Content Service.
  10. Notification Service.
  11. Document / DocSign Service.
  12. Subscription / Billing Service.
  13. Loyalty / Points Service.
  14. UC-as-Service (PMS).
  15. NFT-Title Service.

### Data

- **OLTP:** PostgreSQL (Supabase для starting + потом dedicated).
- **OLAP:** ClickHouse — для AS-Index, transactions analytics, reporting.
- **Vector:** Pinecone (или Weaviate self-hosted) для AI Concierge RAG.
- **Cache:** Redis Cluster.
- **Object storage:** S3-compatible (Cloudflare R2 для cost / AWS S3 для US-loads).
- **Search:** Elasticsearch / Typesense для full-text + filters.

### Streaming / Events

- **Kafka** для event bus.
- **Topics:** listing-events, transaction-events, lead-events, kyc-events, payment-events, etc.
- **Использование:**
  - Listing change → SLA-движок (#11) → ranking update.
  - Transaction → AS-Index update.
  - Lead → SLA-таймер.
  - KYC pass → mortgage pre-qual.

### AI / ML

- **Foundation models:** Claude Sonnet/Opus + GPT-5 (multi-provider for redundancy).
- **Custom models:** обучены на наших данных:
  - Match Engine (#6).
  - Apartsales Score™ (#1).
  - Pricing Engine (#26).
  - Predictive Hype (#38).
  - Genome (#49).
- **Stack:** PyTorch + HF + custom RAG; MLflow для model registry; Kubernetes для inference.
- **Vector store:** Pinecone (production) / pgvector (small workloads).

### Blockchain rails (#21, #34, #36, #39, #53)

- **Public chains:**
  - Ethereum + L2s (Arbitrum / Base) — для PCET, NFT-Title, ESG tokens.
  - TRON / BSC — для USDT.
  - Polygon — для cheap NFT operations.
- **Private/permissioned (где требует регулятор):**
  - Hyperledger Fabric — для NFT-Title в РФ когда придёт регулятор.
- **Tooling:** Foundry + Hardhat для smart contracts; OpenZeppelin libraries; Chainlink для оракулов цен.

### Compliance / KYC

- SumSub + Onfido + Veriff (multi-vendor для resilience).
- ComplyAdvantage для AML / sanctions screening.

---

## 3. Multi-region setup (#19)

### Регионы

| Регион     | Облако        | Покрытие                  |
|------------|---------------|---------------------------|
| EU-West    | AWS Ireland   | Default для ЕС / SEA      |
| Russia     | Selectel/VK   | Согласно 152-ФЗ           |
| UAE        | AWS Bahrain   | Залив + Африка            |
| US-East    | AWS N. Virg.  | Северная Америка          |
| Asia-East  | AWS Singapore | SEA + Австралия           |

### Принципы

- **Data residency** соблюдается (152-ФЗ для россиян, GDPR для ЕС).
- **Active-active replication** для критичных сервисов.
- **Read-replica** в близких регионах для UX.
- **Active-passive failover** для регуляторно-чувствительных сервисов.

### Latency goals

- p95 page load: < 1.5s в любом регионе.
- p95 API call: < 200ms.
- AI Concierge response: < 3s.

---

## 4. Headless CMS (#20)

**Выбор:** Strapi (self-hosted, MIT) или Payload CMS.

**Что внутри:**
- 6 типов контента (страна / регион / город / застройщик / ЖК / юнит).
- Multi-language fields (RU/EN/AR/CN/TR/ES).
- Templates с биндингом полей.
- API GraphQL + REST.
- Webhooks на изменения → ISR-revalidation на Next.js.

**Сборка landing-страниц:**
- Next.js ISR — incremental static regeneration.
- 30M+ страниц пререндерены, обновляются по событиям.
- Edge SSR для динамических компонентов (цены / score).

---

## 5. Open API (#9)

**Стандарты:**
- OpenAPI 3.1 спецификация в открытом доступе.
- REST + GraphQL.
- OAuth 2.0 + API keys.
- Webhooks (стандарт CloudEvents).
- Idempotency keys для всех мутаций.
- Rate limits с burst-allowance.
- Versioning через URL (`/v1`, `/v2`).

**SDK:** Python, TypeScript/JS, PHP, Java, Swift, Kotlin.

**Документация:** Mintlify / Stainless-generated.

---

## 6. Безопасность

### Уровни

1. **Network:** WAF (Cloudflare) + DDoS protection.
2. **Application:** OWASP Top-10 compliance, rate limits, CSRF protection.
3. **Data:** Encryption at rest + in transit (TLS 1.3), key rotation.
4. **Access:** RBAC + ABAC, MFA mandatory для staff.
5. **Audit:** Все мутации логируются в immutable audit trail (Postgres + S3-vault).
6. **Compliance:** SOC 2 Type II Y2, ISO 27001 Y3, GDPR с дня 0.

### Защита от атак

- Anti-fraud ML на транзакциях.
- Bot detection на listings.
- Anti-scraping (rate-limiting + Cloudflare bot management).
- Sybil attack protection через KYC.

---

## 7. DevOps

- **Infra-as-code:** Terraform.
- **Orchestration:** Kubernetes (EKS / GKE) + ArgoCD для GitOps.
- **CI/CD:** GitHub Actions + Vercel для web.
- **Observability:** Datadog + OpenTelemetry + Sentry.
- **Feature flags:** LaunchDarkly или Flagsmith.
- **Incident:** PagerDuty + runbooks + post-mortems публичные.

---

## 8. Mobile-specific

### iOS
- iOS 26+ только.
- Liquid Glass design system (BillionsX DS v3.0).
- WidgetKit для лидов / Score / AS-Index.
- Live Activities для статуса сделки.
- Apple Pay для broni.
- ARKit для AR Digital Twin.

### Android
- Android 14+.
- Material You.
- Foreground services для долгих операций.

### Cross-platform
- React Native для CRM-панелей внутри сотрудников.
- Push notifications через unified API (FCM + APNs).

---

## 9. Estimated team & cost (Y1)

| Команда                        | Размер Y1 | Стоимость / мес |
|--------------------------------|-----------|------------------|
| Frontend (web + mobile)        | 12        | 6M ₽             |
| Backend microservices          | 18        | 12M ₽            |
| Data + ML                      | 8         | 8M ₽             |
| DevOps / SRE                   | 4         | 3M ₽             |
| QA                             | 6         | 3M ₽             |
| Product / Design               | 6         | 3.5M ₽           |
| Security                       | 3         | 2.5M ₽           |
| **Total tech**                 | **57**    | **~38M ₽/мес**   |

**Y1 tech cost:** ~450M ₽ + инфраструктура ~50M ₽ = **~500M ₽**.

**Финансировать:** Seed 180M ₽ (заявлено) + Series A в M9.

---

## 10. Anti-fragility checklist

- ✅ Multi-region (failover за 5 минут).
- ✅ Multi-cloud для критики (AWS + Selectel).
- ✅ Multi-vendor KYC и payments (нет single point of failure).
- ✅ Multi-LLM провайдер для AI (Anthropic + OpenAI + Yandex GPT для РФ).
- ✅ Self-hosted критики (CMS, vector store) для независимости.
- ✅ Open API в публичном repo (если упадём — партнёры могут вырастить альтернативу из протокола).
