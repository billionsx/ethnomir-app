# BillionsX Design System Rules v2.1
## Загружать в начале каждой сессии.

---

## ДВА РЕЖИМА РАБОТЫ

**МОНОЛИТ (Ethnomir page.tsx, BillionsX page.tsx):**
- Константа `DS` в начале файла
- `style={{ ...DS.text.body }}` / `style={{ color: DS.blue, padding: DS.s[4] }}`
- Glass: `style={{ ...DS.glass.regular, borderRadius: DS.r.card }}`
- Кнопки: `style={{ ...DS.btn.primary }}`

**НОВЫЙ ПРОЕКТ:**
- `<link href="billionsx-design-system.css">`
- `className="btn btn-primary"` / `className="text-body glass mt-4"`
- `import { colors } from './billionsx-tokens'`

---

## ЦВЕТА — НЕ ХАРДКОД

| Вместо | Пиши |
|---|---|
| `'#000000'` | `DS.label` |
| `'#F2F2F7'` | `DS.bg2` |
| `'#007AFF'` | `DS.blue` |
| `'#FFFFFF'` | `DS.bg` |
| `'rgba(60,60,67,.6)'` | `DS.label2` |
| `'#FF3B30'` | `DS.bxRed` |

---

## SPACING — НЕ ПРОИЗВОЛЬНЫЙ

| Вместо | Пиши | Значение |
|---|---|---|
| `padding: 15` | `padding: DS.s[4]` | 16 |
| `gap: 10` | `gap: DS.s[3]` | 12 |
| `margin: 20` | `margin: DS.s[5]` | 20 |
| `margin: 30` | `margin: DS.s[8]` | 32 |

---

## РАДИУСЫ — НЕ ПРОИЗВОЛЬНЫЙ

| Вместо | Пиши | Значение |
|---|---|---|
| `borderRadius: 10` | `DS.r.sm (8)` или `DS.r.md (12)` | |
| `borderRadius: 15` | `DS.r.btn` | 14 |
| `borderRadius: 25` | `DS.r.xxxl` | 28 |
| Кнопки | `DS.r.btn` | 14 |
| Поля ввода | `DS.r.input` | 12 |
| Карточки | `DS.r.card` | 20 |
| Шиты | `DS.r.sheet` | 28 |
| Tab bar | `DS.r.tab` | 36 |

---

## ТИПОГРАФИКА

- `style={{ ...DS.text.body }}` — 17px w400 lh22 ls-0.43
- `style={{ ...DS.text.title1 }}` — 28px w700 lh34 ls0.36
- `style={{ ...DS.text.largeTitle }}` — 34px w700 lh41 ls0.37
- `style={{ ...DS.text.bxTitle }}` — clamp(42px,8vw,72px) w800
- **НЕ** вес <400, **НЕ** размер <11px, **НЕ** хардкод fontFamily строкой

---

## GLASS — ТОЛЬКО НАВИГАЦИЯ

- `style={{ ...DS.glass.regular, borderRadius: DS.r.card }}`
- `.glass.clear` — медиа-фон. `.glass.heavy` — модалки
- `.glass.tabBar` — плавающий таб. `.glass.navBar` — навбар
- **НЕ** на контенте. **НЕ** glass поверх glass. **НЕ** >4 на экране

---

## КОМПОНЕНТЫ

```
Кнопка:   style={{ ...DS.btn.primary }}       — синяя 50px r14
Карточка:  style={{ ...DS.card.solid }}         — белая r20 sh1
Glass-кр:  style={{ ...DS.card.glass }}         — стеклянная r20
Список:    style={{ ...DS.list.section }}       — контейнер r16
Строка:    style={{ ...DS.list.item }}          — строка 44px min
Поле:      style={{ ...DS.input.field }}        — 44px r12 fill3
Тень:      boxShadow: DS.sh[2]                 — средняя
```

---

## ТЕНИ — НЕ ПРОИЗВОЛЬНЫЕ

`DS.sh[1]` карточки → `DS.sh[2]` кнопки → `DS.sh[3]` floating → `DS.sh[4]` модалы

---

## АНИМАЦИИ

- ТОЛЬКО `transform` + `opacity` (GPU)
- Touch: `opacity:0.7`, `DS.t.instant` (100ms)
- Spring: `DS.ease.spring`. Drama: `DS.ease.drama`
- `transition: \`opacity ${DS.t.instant}ms ${DS.ease.default}\``
- **НЕ** анимировать width/height/margin/background/box-shadow
- **НЕ** scale на мелких элементах — только на крупных карточках (0.97)

---

## iOS 26 / SAFARI

- Tab bar = floating glass, shrink on scroll
- `100dvh` не `100vh`. `viewport-fit=cover`
- `theme-color` для light + dark
- Fixed bottom: `+ env(safe-area-inset-bottom)`
- Touch target ≥ 44×44

---

## ЗАПРЕТЫ

- **НЕ** хардкод hex цвета — DS.*
- **НЕ** произвольные отступы — DS.s[N]
- **НЕ** произвольные радиусы — DS.r.*
- **НЕ** произвольные тени — DS.sh[N]
- **НЕ** вес шрифта <400
- **НЕ** размер текста <11px
- **НЕ** emoji в кнопках
- **НЕ** glass на контенте
- **НЕ** "ЭТНОМИР" или "ЭтноМир" → строго "Этномир"
- **НЕ** анимация width/height/margin/background

---

## ДЕРЕВО РЕШЕНИЙ — КОГДА ЧТО ИСПОЛЬЗОВАТЬ

**Glass vs Solid?**
- Элемент плавает над контентом (навбар, таб, шит, поповер, FAB) → **glass**
- Элемент является контентом (карточка, список, форма, текст) → **solid**
- Сомневаешься → **solid**. Glass — исключение, не правило.

**Card solid vs Card glass?**
- Карточка на однородном фоне (bg2/#F2F2F7) → `DS.card.solid` (белая)
- Карточка на ярком/динамичном фоне (фото, градиент, canvas) → `DS.card.glass`
- Карточка с важным контентом (цены, данные, формы) → **solid** (лучше читаемость)

**FAB vs inline button?**
- Одно главное действие на весь экран (создать, добавить) → **FAB**
- Действие привязано к конкретной секции/карточке → **inline button**
- Есть Tab bar на экране → **НЕ FAB** (Apple: или tab bar, или FAB)

**Sheet vs Alert vs Fullscreen?**
- Просмотр/редактирование контента → **Sheet** (half/full, swipe to close)
- Да/Нет решение, критическое подтверждение → **Alert** (2-3 кнопки)
- Полноценная подзадача (checkout, onboarding, compose) → **Fullscreen modal**

**sh[1] vs sh[2] vs sh[3]?**
- Лежит на поверхности (карточка на bg2) → `DS.sh[1]`
- Слегка приподнят (кнопка, таб-бар) → `DS.sh[2]`
- Плавает (поповер, FAB, dropdown) → `DS.sh[3]`
- Парит (модал, алерт) → `DS.sh[4]`

**Когда DS не покрывает кейс:**
1. Посмотри в `Standard-v2.0.md` — возможно, есть значение в справочнике
2. Используй ближайшее значение из DS (ближайший spacing, ближайший radius)
3. Если совсем уникальный элемент — задокументируй отклонение комментарием `// DS-exception: reason`

---

## НЕДОСТАЮЩИЕ КОМПОНЕНТЫ — РУЧНЫЕ РЕЦЕПТЫ

**Progress Bar:**
```
height: 4,  borderRadius: 2,  background: DS.fill3
→ inner: height: 4,  borderRadius: 2,  background: DS.blue
```

**Segmented Control:**
```
height: 32,  borderRadius: DS.r.sm (8),  background: DS.fill3,  padding: 2
→ segment: borderRadius: 6,  background (active): DS.bg,  boxShadow: DS.sh[1]
```

**Sheet Handle:**
```
width: 36,  height: 4,  borderRadius: 2,  background: DS.fill2,  margin: '6px auto'
```

**Empty State:**
```
icon: 48px DS.label3  →  title: DS.text.headline  →  desc: DS.text.subheadline DS.label2
→  button: DS.btn.primary  →  всё center, gap: DS.s[4]
```

**Skeleton:**
```
background: DS.fill3,  borderRadius: DS.r.md,
animation: 'skeleton-pulse 1.5s ease-in-out infinite'
```

---

## DEPLOY CHECKLIST

```
□ Все цвета → DS.*
□ Все отступы → DS.s[N] (кратны 8)
□ Все радиусы → DS.r.*
□ Все тени → DS.sh[N]
□ Glass ≤4 шт, только nav layer
□ Touch targets ≥44px
□ Safe area для fixed
□ Animations: transform+opacity only
□ "Этномир" написание верное
```
