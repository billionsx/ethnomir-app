# BillionsX Design System (BXDS) v3.0
## iOS 26 Liquid Glass — Единственный стандарт

Источник: Apple WWDC 2025, Apple HIG iOS 26, Apple Newsroom, iOS 26 Figma Kit.
Всё, что ниже iOS 26 — не существует для BXDS.

---

## LIQUID GLASS — ЧТО ЭТО

Liquid Glass = полупрозрачный материал, который преломляет и отражает окружение. Элементы "плавают" в трёхмерном пространстве. Каждый UI-элемент принадлежит одному из слоёв: Background → Glass → Solid → Dynamic.

Ключевые свойства:
- Lensing: преломление света в реальном времени (не просто blur)
- Specular highlights: блик сверху элемента
- Adaptive shadows: тень зависит от глубины слоя
- Translucency: 20-40% opacity фона + backdrop blur
- Color sampling: элементы подхватывают цвет из фона за ними

---

## GLASS НА ВСЁ

В iOS 26 Liquid Glass используется **повсюду**:
- Tab bars, sidebars, navigation bars
- Карточки, панели, модалы, шиты
- Кнопки, контролы, переключатели
- Виджеты, иконки, Dock
- Поля ввода, поиск

Glass = **default материал** iOS 26. Solid = исключение для readability-критичных зон.

**CSS для glass-элемента:**
```
backdropFilter: blur(40px) saturate(180%)
WebkitBackdropFilter: blur(40px) saturate(180%)
background: rgba(255,255,255, 0.20–0.52)  // 20-52% в зависимости от слоя
border: 0.5px solid rgba(255,255,255, 0.30)
boxShadow: inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06)
```

**НЕ ДЕЛАЙ:**
- Glass поверх glass (двойной blur = performance kill)
- Glass без контрастного фона за ним (бессмысленно на белом)

---

## ФОНЫ СЕКЦИЙ

iOS 26: контент = яркий/динамичный фон, UI-элементы = glass поверх него.

- **CSS linear-gradient**: лёгкий градиентный фон за glass-секциями (zero JS)
- **DS.bg (#FFFFFF)**: белый для секций без glass
- **DS.bg2 (#F2F2F7)**: светло-серый для neutral-секций
- **DS.label (#000)**: тёмный для immersive/flagship секций

Чередование: GradBG → белый → GradBG → белый (ритм глубины)

---

## ТИПОГРАФИКА iOS 26

Bolder left-aligned typography (Apple: "refined color palettes, bolder left-aligned typography").

- SF Pro Display: ≥20pt (заголовки). **Жирнее чем раньше** — w700-800.
- SF Pro Text: <20pt (body). w400-600.
- Minimum: **11px** (caption2)
- Font stack: `-apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif`

| Стиль | Size | Weight | Line | Tracking |
|---|---|---|---|---|
| largeTitle | 34 | 700 | 41px | +0.37 |
| title1 | 28 | 700 | 34px | +0.36 |
| title2 | 22 | 700 | 28px | +0.35 |
| title3 | 20 | 600 | 25px | +0.38 |
| headline | 17 | 600 | 22px | -0.43 |
| body | 17 | 400 | 22px | -0.43 |
| callout | 16 | 400 | 21px | -0.31 |
| subheadline | 15 | 400 | 20px | -0.23 |
| footnote | 13 | 400 | 18px | -0.08 |
| caption1 | 12 | 400 | 16px | 0 |
| caption2 | 11 | 400 | 13px | +0.07 |

---

## ЦВЕТА iOS 26

System colors в iOS 26 **ярче** в dark mode (не темнее).

| Light | Dark | Название |
|---|---|---|
| #007AFF | #0A84FF | blue |
| #34C759 | #30D158 | green |
| #FF3B30 | #FF453A | red |
| #FF9500 | #FF9F0A | orange |
| #AF52DE | #BF5AF2 | purple |
| #5856D6 | #5E5CE6 | indigo |

Semantic labels:
- label: #000 / #FFF
- label2: rgba(60,60,67,.60) / rgba(235,235,245,.60)
- label3: rgba(60,60,67,.30) / rgba(235,235,245,.30)

**Все через DS.* токены. Нулевой хардкод hex.**

---

## SPACING (8pt grid)

`DS.s[N]`: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

**НЕ** 5, 6, 7, 9, 10, 11, 13, 14, 15 — только значения из DS.s

---

## BORDER RADIUS — Concentricity

iOS 26: "concentricity" — внутренний радиус = внешний − padding.

| Элемент | Радиус | DS.r |
|---|---|---|
| Кнопки | 14 | btn |
| Поля ввода | 12 | input |
| Карточки | 20 | card |
| Шиты/модалы | 28 | sheet |
| Tab bar | 36 | tab |

---

## ТЕНИ — DEPTH LAYERS

iOS 26 использует adaptive shadows для создания глубины.

Glass shadow = specular highlight (inset) + depth shadow (external):
```
inset 0 0.5px 0 rgba(255,255,255,.40),  // specular highlight
0 2px 8px rgba(0,0,0,.06),               // soft depth
0 8px 24px rgba(0,0,0,.04)               // ambient
```

---

## TAB BAR iOS 26

Floating glass, shrinks on scroll:
- Glass material + border-radius 36px
- Shrinks при скролле вниз → expand при скролле вверх
- Monochrome SF Symbol icons (filled active, outline inactive)
- Labels 10pt below icons

---

## АНИМАЦИИ iOS 26

- **Materialization**: элементы появляются через модуляцию преломления света
- Spring: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Анимируй **ТОЛЬКО** transform + opacity (GPU compositing)
- Touch feedback: opacity 0.7, <100ms
- `@media (prefers-reduced-motion: reduce)` — обязательно

---

## DEPLOY CHECKLIST

```
□ Все цвета → DS.* токены
□ Все отступы → DS.s[N] (8pt grid)
□ Все радиусы → DS.r.*
□ Glass карточки на GradBG секциях
□ Specular highlights на glass элементах
□ НЕ glass поверх glass
□ Touch targets ≥44px
□ fontSize ≥11px
□ "Этномир" написание верное
□ prefers-reduced-motion работает
```
