# Apartsales — Project Documentation

> **Aviasales-клон для рынка новостроек РФ**
> Старт — Крым (Year 1). Цель — рынок РФ-доминирование (Year 5+).

---

## 📁 СТРУКТУРА ДОКУМЕНТОВ

Все markdown-документы доступны также в PDF — для удобного просмотра без рендера на GitHub.

| Файл | Назначение | Форматы | Статус |
|---|---|---|---|
| **00-MASTER** | **Главный справочник-презентация** — единый комплексный документ о продукте, стратегии и арке. Старт здесь | [📄 .md](00-MASTER.md) · [📕 .pdf](00-MASTER.pdf) | ✅ Active |
| 01-STRATEGY-v2.0 | Стратегическая модель v2.0 по 7 законам BillionsX | [📄 .md](01-STRATEGY-v2.0.md) · [📕 .pdf](01-STRATEGY-v2.0.pdf) | ✅ Active |
| 02-FINANCIAL-MODEL-v1 | Financial model — narrative + рекомендация | [📄 .md](02-FINANCIAL-MODEL-v1.md) · [📕 .pdf](02-FINANCIAL-MODEL-v1.pdf) | ✅ Active |
| 02-FINANCIAL-MODEL-v1.xlsx | Live financial model — 7 листов, 1 023 формулы | [📊 .xlsx](02-FINANCIAL-MODEL-v1.xlsx) | ✅ Active |
| 03-COMPETITIVE-DEEP-DIVE-v1 | Конкурентный анализ — как стать чемпионом РФ-первички | [📄 .md](03-COMPETITIVE-DEEP-DIVE-v1.md) · [📕 .pdf](03-COMPETITIVE-DEEP-DIVE-v1.pdf) | ✅ Active |
| 04-PRODUCT-MONETIZATION-v1 | Продуктовая линейка и revenue streams (Aviasales × Тинькофф модель) | [📄 .md](04-PRODUCT-MONETIZATION-v1.md) · [📕 .pdf](04-PRODUCT-MONETIZATION-v1.pdf) | ✅ Active |
| README | Этот файл — навигация | [📄 .md](README.md) · [📕 .pdf](README.pdf) | ✅ Active |
| CHANGELOG | История изменений, версионирование документов | [📄 .md](CHANGELOG.md) · [📕 .pdf](CHANGELOG.pdf) | ✅ Active |

---

## 🎯 НАВИГАЦИЯ ПО ВОПРОСАМ

| Я хочу понять… | Документ |
|---|---|
| Что вообще такое Apartsales | [00-MASTER.md → Executive Summary](00-MASTER.md) |
| Почему Крым, почему сейчас | [00-MASTER.md → Part I Strategy](00-MASTER.md) |
| Как работает приложение, какие экраны | [00-MASTER.md → Part II Product](00-MASTER.md) |
| Техническая архитектура и AI | [00-MASTER.md → Part III Tech](00-MASTER.md) |
| Как зарабатываем, юнит-экономика | [00-MASTER.md → Part IV Business Model](00-MASTER.md) + [02-FINANCIAL-MODEL-v1.md](02-FINANCIAL-MODEL-v1.md) |
| План выхода на рынок | [00-MASTER.md → Part V GTM](00-MASTER.md) |
| Финансовый прогноз и сценарии | [02-FINANCIAL-MODEL-v1.xlsx](02-FINANCIAL-MODEL-v1.xlsx) |
| Как выходим на всю РФ | [00-MASTER.md → Part VII Decacorn Arc](00-MASTER.md) |
| Защитный ров, моаты | [00-MASTER.md → Part VIII Moats](00-MASTER.md) |
| Кто в команде, план найма | [00-MASTER.md → Part X Team](00-MASTER.md) |
| Что делать первые 90 дней | [00-MASTER.md → Part XI Roadmap](00-MASTER.md) |
| Глубокая стратегическая логика | [01-STRATEGY-v2.0.md](01-STRATEGY-v2.0.md) |

---

## 🔄 РАБОЧИЙ WORKFLOW

После каждой рабочей сессии:

1. Изменения вносятся в соответствующий `.md` документ
2. **PDF-копия пересоздаётся автоматически** (см. `_build_pdfs.sh`) — все документы хранятся в `.md` + `.pdf`
3. Версия обновляется (semver: `vMAJOR.MINOR`)
4. Запись в [CHANGELOG.md](CHANGELOG.md) — что изменилось, когда, кем
5. Коммит в репо с осмысленным message: `feat(apartsales): что сделано`

**Команда для пересборки PDF:** запуск `bash _build_pdfs.sh` в этой папке.

---

## 🔗 СВЯЗАННЫЕ ВНЕШНИЕ ДОКУМЕНТЫ

- [`../DOMONLY-MODEL-v1.1.md`](../DOMONLY-MODEL-v1.1.md) — параллельная глобальная стратегия Domonly (Year 5+ горизонт, cross-border)

---

## ⚙️ КОНТАКТЫ И ВЛАДЕНИЕ

- **Product Owner:** Billions X (managing partner, Billions X Holdings)
- **Tech / Strategic Co-pilot:** Claude (full technical team)
- **Юр. структура:** ООО «Апартсейлс» (РФ)
- **Корпоративная семья:** ApartsalesX Holdings (член семейства BillionsX)
- **Домены:** apartsales.com (primary), apartsales.ru, apartsales.app

---

*Документация поддерживается живой. Обновления — через PR с записью в CHANGELOG.*
