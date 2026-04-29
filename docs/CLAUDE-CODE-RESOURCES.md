# Claude Code Stack — 9 ресурсов для всех проектов

> **Утверждено:** 29 апреля 2026
> **Применять во всех проектах:** EthnoMir, BillionsX, Apartsales, и любых будущих
> **Источник:** изображение из чата Billions X — список курированных репозиториев

Этот стек ресурсов составляет рабочую среду Claude Code для команды Billions X. Применять подходы и принципы из каждого ресурса при работе над любым проектом.

---

## 1. Superpowers

**Репо:** https://github.com/obra/superpowers
**Автор:** Jesse Vincent (obra)
**Тип:** Plugin / методология
**Статус:** ✅ Активна как базовый workflow

Agentic skills framework + методология разработки. Полный цикл: spec first → design approval по чанкам → write-plan с bite-sized задачами (2–5 мин) → TDD RED→GREEN→REFACTOR → code-review между задачами. Принципы: YAGNI, DRY, simplicity, evidence over claims.

**Установка:**
```
/plugin install superpowers@claude-plugins-official
```
или через marketplace:
```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**Что даёт:** 14 skills, агенты code-reviewer, команды /brainstorm /write-plan /execute-plan, SessionStart context injection.

---

## 2. Claude Mem

**Репо:** https://github.com/thedotmack/claude-mem
**Автор:** Alex Newman (thedotmack)
**Тип:** Plugin / persistent memory
**Лицензия:** AGPL-3.0

Captures everything Claude does during coding sessions, compresses with Claude agent-sdk, injects relevant context into future sessions. Хранит локально в `~/.claude-mem/` через SQLite + ChromaDB. Решает проблему context loss между сессиями.

**Установка:**
```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

**Что даёт:** SessionStart/UserPromptSubmit/PostToolUse/Summary/SessionEnd хуки, Worker Service на 37777, MCP-инструменты search/get_observations, web viewer для timeline, режимы code/chill/investigation, поддержка ru/zh/ja/es через `CLAUDE_MEM_MODE`.

---

## 3. GSD (Get Shit Done)

**Репо:** https://github.com/gsd-build/get-shit-done
**Автор:** TÂCHES
**Тип:** CLI / spec-driven development system
**Лицензия:** MIT

Lightweight meta-prompting + context engineering + spec-driven framework. 86 skills + 33 subagents в полной версии (~12k tokens overhead). Цикл: new-project → discuss → plan → execute → help → update. Альтернатива/дополнение к Superpowers, акцент на milestones и phases.

**Установка (минимальная — 6 core skills):**
```
npx get-shit-done-cc --claude --global --minimal
```
**Полная (86 skills, для frontier-моделей с большим контекстом):**
```
npx get-shit-done-cc --claude --global
```

**Что даёт:** /gsd-spike (feasibility), /gsd-sketch (UI варианты), /gsd-ingest-docs (бутстрап .planning из существующих документов), /gsd-progress, profile system (quality/balanced/budget/inherit).

---

## 4. UI/UX Pro Max

**Репо:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
**Автор:** Next Level Builder
**Тип:** AI Skill / design intelligence

Design intelligence engine для построения профессиональных UI/UX интерфейсов. Design System Generator анализирует продукт и за секунды генерирует полную design-систему. Поддержка: HTML/Tailwind, React, Next.js, Vue, Nuxt, Svelte, ShadCN, Flutter, SwiftUI, React Native, Jetpack Compose.

**Установка:**
```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

**Что даёт:** CSV-базы стилей/палитр/типографики/чартов, BM25 + regex hybrid search, шаблоны под платформы, pre-delivery checks против UI/UX антипаттернов.

**Как применять у нас:** для генерации новых лендингов и проверки соответствия BXDS v3.0 / Apple iOS 26.3.1 Golden Standard.

---

## 5. n8n-MCP

**Репо:** https://github.com/czlonkowski/n8n-mcp
**Автор:** Romuald Członkowski
**Тип:** MCP server
**Stars:** 18.8k

MCP-сервер, дающий Claude полное знание о всех 525 нодах n8n. Позволяет строить и валидировать workflow через Claude Desktop / Code / Cursor / Windsurf. То что раньше занимало 45 минут с ошибками — теперь 3 минуты с нуля.

**Установка:**
```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

**Ключевые принципы (из системного промпта):** Templates First (2,709 шаблонов), Multi-Level Validation (validate_node minimal → full → validate_workflow), Never Trust Defaults — явно конфигурировать ВСЕ параметры.

**Как применять у нас:** автоматизация CRM (письма, рассылки, интеграции), фоновые джобы Этномир.

---

## 6. Obsidian Skills

**Репо:** https://github.com/kepano/obsidian-skills
**Автор:** Steph Ango (kepano, CEO Obsidian)
**Тип:** Agent Skills
**Stars:** 27.3k

Скиллы для работы агента с Obsidian-vault: Markdown с wikilinks/embeds/callouts/properties, Bases, JSON Canvas, CLI. Соответствует Agent Skills specification — работает с любым skills-compatible агентом.

**Установка:**
```
/plugin marketplace add kepano/obsidian-skills
/plugin install obsidian@obsidian-skills
```
или
```
npx skills add git@github.com:kepano/obsidian-skills.git
```

**Как применять у нас:** для управления стратегическими документами (BillionsX-STRATEGY-v10.md, Apartsales модели и т.п.) если переедем в Obsidian как knowledge base.

---

## 7. LightRAG

**Репо:** https://github.com/HKUDS/LightRAG
**Авторы:** HKUDS (HKU Data Science Lab)
**Публикация:** EMNLP 2025
**Stars:** 28.4k

Графовый Retrieval-Augmented Generation. Извлекает entities + relationships из документов, строит knowledge graph, использует multi-modal retrieval (local/global/hybrid/mix/naive). Преодолевает ограничения flat-RAG, обеспечивает контекстную осведомлённость через граф.

**Установка:**
```bash
pip install "lightrag-hku[api]"
cp env.example .env
lightrag-server
```

**Storage:** KV / Vector / Graph / DocStatus с pluggable backends (PostgreSQL, Neo4j, Redis, Milvus, Qdrant, Faiss, Memgraph, OpenSearch).

**Как применять у нас:** AI-движок поиска внутри Этномир (96 стран, 22 лендинга, 309 отзывов, 13 туров — идеальные данные для графа), AI-консьерж для гостей.

---

## 8. Everything Claude Code (ECC)

**Репо:** https://github.com/affaan-m/everything-claude-code
**Автор:** Affaan Mustafa
**Тип:** Agent harness performance system
**Лицензия:** MIT

Не просто config-bundle — целая система оптимизации работы агента: skills, instincts, memory, security, research-first development. Работает с Claude Code, Codex, OpenCode, Cursor из единого конфига. AgentShield: 102 security rules, 912 тестов.

**Установка:**
```
/plugin marketplace add https://github.com/affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code
```

**Что даёт:** /harness-audit, /quality-gate, /plan, /tdd, /code-review, /security, /build-fix, /e2e, /refactor-clean, /orchestrate. Агенты planner / architect / code-reviewer / security-reviewer / tdd-guide / build-error-resolver / e2e-runner / doc-updater / refactor-cleaner / database-reviewer.

**Как применять у нас:** после security audit (13 critical уязвимостей в EthnoMir) — обязательное использование security-reviewer и database-reviewer.

---

## 9. Awesome Claude Code

**Репо:** https://github.com/hesreallyhim/awesome-claude-code
**Автор:** hesreallyhim
**Тип:** Curated list
**Stars:** 41.2k

Курированный индекс всего экосистемы Claude Code: skills, hooks, slash-commands, agent orchestrators, applications, plugins. Используется как источник для поиска новых инструментов и для проверки качества (resource-submission validation).

**Использование:** просто читать README и issues для submission. Нет инсталляции — это reference.

**Как применять у нас:** периодически проверять новые ресурсы для обогащения стека.

---

## Сводная таблица — как применять в проектах

| Ресурс | EthnoMir | BillionsX | Apartsales | Когда обязателен |
|--------|----------|-----------|------------|------------------|
| Superpowers | ✅ всегда | ✅ всегда | ✅ всегда | ВСЕ задачи (TDD workflow) |
| claude-mem | рекомендуется | рекомендуется | рекомендуется | Длинные сессии, потеря контекста |
| GSD | для новых features | для новых features | для новых features | Greenfield / новый milestone |
| UI/UX Pro Max | для лендингов | для лендингов | для лендингов | Новый UI / новая страница |
| n8n-MCP | CRM автоматизация | — | — | Workflow интеграции |
| Obsidian Skills | — | strategy docs | strategy docs | Knowledge management |
| LightRAG | AI-консьерж | AI-search блога | — | Поиск по большому контенту |
| ECC | security review | security review | security review | Audit / production deploy |
| Awesome CC | reference | reference | reference | Поиск новых инструментов |

---

## Командный workflow (рекомендуемый)

Для каждой новой задачи:

1. **Старт:** Superpowers brainstorm → spec в чанках на approval
2. **Plan:** Superpowers write-plan ИЛИ GSD /gsd-plan-phase (для крупных milestones)
3. **Design (если UI):** UI/UX Pro Max → Design System Generator → проверка против BXDS v3.0
4. **Execute:** Superpowers TDD RED→GREEN→REFACTOR
5. **Review:** ECC code-reviewer + security-reviewer
6. **Memory:** claude-mem автоматически фиксирует контекст
7. **Deploy:** Vercel auto-build → web_fetch проверка

---

## Связанные документы

- `design-system/BILLIONSX-DESIGN-RULES.md` — DO/DON'T правила для дизайна
- `design-system/Standard-v2.0.md` — каноническая спецификация BXDS v3.0
- `/home/claude/ios-26-3-1-ethnomir-golden-standard.md` — Apple iOS 26.3.1 Golden Standard

---

*Файл должен обновляться при добавлении новых ресурсов в стек. Хранить как single source of truth для команды.*
