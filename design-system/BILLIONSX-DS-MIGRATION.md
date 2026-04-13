# BillionsX DS Migration Plan — page.tsx
## Переход с хардкод-значений на DS.* систему

---

## ПРИНЦИП: ПОСТЕПЕННАЯ МИГРАЦИЯ

НЕ менять весь файл за раз. Мигрировать по секциям при каждом касании кода.

**Правило:** Трогаешь секцию → переводи её на DS. Не трогаешь → не трогай.

---

## ПРИОРИТЕТ МИГРАЦИИ

| Фаза | Что мигрировать | Когда |
|---|---|---|
| **0** | Вставить `const DS = {...}` в начало page.tsx | Один раз, сейчас |
| **1** | Новый код — сразу через DS.* | Каждая сессия |
| **2** | Глобальные компоненты (TabBar, NavBar, PassportOverlay) | При следующем патче этих компонентов |
| **3** | Секции HomeTab, ToursTab, StayTab | При добавлении фич в эти секции |
| **4** | Лендинги, CRM, legacy | Только при рефакторинге |

---

## ФАЗА 0: ВСТАВКА DS

Найти в page.tsx место ПОСЛЕ всех imports, ПЕРЕД первым компонентом.
Вставить полный блок `const DS = { ... }` из файла `billionsx-ds-inline.js`.

Проверка: `DS.blue` должен вернуть `'#007AFF'`.

---

## ФАЗА 1: НОВЫЙ КОД ЧЕРЕЗ DS

При написании ЛЮБОГО нового компонента или элемента:

```jsx
// СТАРЫЙ СТИЛЬ (запрещён для нового кода):
<button style={{ height:50, padding:'0 24px', borderRadius:14,
  background:'#007AFF', color:'#FFF', fontSize:17, fontWeight:600 }}>

// НОВЫЙ СТИЛЬ (обязателен):
<button style={{ ...DS.btn.primary }}>
```

---

## ФАЗА 2: PYTHON REPLACEMENT PATTERNS

При миграции существующего кода через python3 patch:

### Цвета (безопасная замена — уникальные строки):

```python
# ОСТОРОЖНО: заменять только в style={{ }} контексте!
# НЕ трогать hex в SVG path, градиентах, canvas-коде

# Фон секций
code = code.replace("background:'#F2F2F7'", "background:DS.bg2")
code = code.replace('background:"#F2F2F7"', 'background:DS.bg2')
code = code.replace("background:'#FFFFFF'", "background:DS.bg")

# Текст
code = code.replace("color:'#000000'", "color:DS.label")
code = code.replace("color:'#000'", "color:DS.label")
code = code.replace("color:'rgba(60,60,67,0.6)'", "color:DS.label2")
code = code.replace("color:'rgba(60,60,67,0.60)'", "color:DS.label2")

# Accent
code = code.replace("background:'#007AFF'", "background:DS.blue")
code = code.replace("color:'#007AFF'", "color:DS.blue")
```

### Радиусы:

```python
code = code.replace("borderRadius:14", "borderRadius:DS.r.btn")
code = code.replace("borderRadius:20", "borderRadius:DS.r.card")
code = code.replace("borderRadius:28", "borderRadius:DS.r.sheet")
code = code.replace("borderRadius:36", "borderRadius:DS.r.tab")
# НЕ заменять borderRadius:12 — может быть и r.input и r.md
```

### Отступы:

```python
code = code.replace("padding:16", "padding:DS.s[4]")
code = code.replace("padding:24", "padding:DS.s[6]")
code = code.replace("padding:32", "padding:DS.s[8]")
code = code.replace("gap:8", "gap:DS.s[2]")
code = code.replace("gap:12", "gap:DS.s[3]")
code = code.replace("gap:16", "gap:DS.s[4]")
```

### ⚠️ ОПАСНЫЕ ЗАМЕНЫ (не автоматизировать):

```
borderRadius:12  — может быть r.input ИЛИ r.md
padding:8        — может быть DS.s[2] ИЛИ часть составного padding
'#FF3B30'        — может быть DS.red ИЛИ DS.bxRed
background:'rgba(255,255,255,0.42)' — может быть DS.glass.regular.background ИЛИ самостоятельный стиль
```

Эти замены делать ТОЛЬКО вручную, с проверкой контекста.

---

## ФАЗА 3: КОМПОНЕНТНЫЕ ПРЕСЕТЫ

При рефакторинге крупного компонента (TabBar, Card, List), заменить весь style-блок на spread:

```jsx
// ДО:
<div style={{
  backdropFilter:'blur(40px) saturate(180%)',
  WebkitBackdropFilter:'blur(40px) saturate(180%)',
  background:'rgba(255,255,255,0.42)',
  border:'0.5px solid rgba(255,255,255,0.30)',
  borderRadius:36,
  boxShadow:'inset 0 0.5px 0 rgba(255,255,255,.40), ...'
}}>

// ПОСЛЕ:
<div style={{ ...DS.glass.tabBar }}>
```

---

## ВЕРИФИКАЦИЯ ПОСЛЕ КАЖДОЙ ФАЗЫ

1. `grep -c "background:'#" page.tsx` — считать оставшиеся хардкод-фоны
2. `grep -c "color:'#" page.tsx` — считать оставшиеся хардкод-цвета
3. `grep -c "borderRadius:[0-9]" page.tsx` — считать оставшиеся хардкод-радиусы
4. Визуальная проверка: ничего не сломалось

---

## МЕТРИКА ПРОГРЕССА

Текущее состояние (до миграции): ~100% хардкод
Цель: новый код = 100% DS. Старый код → постепенно при касании.
Не ставить цель "0% хардкод" — это нереалистично для 1.4MB файла.
