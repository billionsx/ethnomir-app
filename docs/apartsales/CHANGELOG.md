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

## [v1.1] — 2026-04-29 — PDF-копии всех документов + build script

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
