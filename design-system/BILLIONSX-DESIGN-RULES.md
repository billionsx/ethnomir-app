# BillionsX Design System (BXDS) v3.0
## Стандарт: apple.com + iOS 26 Liquid Glass

Каждое правило подтверждено источником. Если источника нет — правила нет.

---

## ТИПОГРАФИКА

### Две стратегии масштабирования (apple.com)

- **Display text** (hero, h1-h4): `clamp()` — плавно от mobile до desktop
- **Body text** (body, caption, label): фиксированные breakpoints, НЕ clamp()

Body: 16px → 17px на ≥744px → 17px навсегда.

### Font-weight (apple.com)

| Элемент | Weight |
|---|---|
| Hero display | 700 |
| Section h2 | 700 |
| Section label (uppercase) | 600 |
| Body | 400 |
| Caption/footnote | 400 |

### Line-height (apple.com)

- Display: **unitless ratio** — 1.05 (hero), 1.06 (h1), 1.07 (h2-h4)
- Body/caption: **фиксированный px** на 4px grid — 17px→28px, 13px→20px, 11px→16px

### Letter-spacing — обратная от размера (apple.com)

| Размер | Tracking |
|---|---|
| 56-80px (hero) | -0.04em |
| 48-64px (h1) | -0.035em |
| 34-41px (h2) | -0.025em |
| 28-33px (h3) | -0.02em |
| 16-17px (body) | 0em |
| 13px (caption) | +0.01em |
| 11px (label) | +0.03em |

### Пунктуация (apple.com)

Apple ставит точки в конце заголовков на маркетинговых страницах.

---

## ФОНЫ СЕКЦИЙ (apple.com)

- **#FFFFFF** — основной белый
- **#F5F5F7** — серые секции
- **#000000** — immersive тёмные блоки
- Чередование: белый → серый → белый → серый
- НЕТ Canvas-анимаций, НЕТ цветных градиентов

---

## LIQUID GLASS (iOS 26)

Glass используется на:
- Sticky navigation (backdrop-filter blur)
- Floating overlays (модалы, шиты)
- Floating badges (метки на фото)

Glass НЕ используется на:
- Контентных карточках → solid
- Секциях → solid bg
- Обычных кнопках

CSS glass: `backdrop-filter: blur(20px) saturate(150%); background: rgba(255,255,255,.72); border: 0.5px solid rgba(0,0,0,.06);`

---

## КАРТОЧКИ (apple.com)

- Background: #FFF на сером, #F5F5F7 на белом
- Border-radius: 18-20px
- Box-shadow: `0 2px 8px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.03)`
- Padding: 20-24px
- Карточки = solid. НЕ glass.

---

## SPACING (4px grid)

Значения: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

---

## BREAKPOINTS (apple.com)

390 / 744 / 1024 / 1440

---

## DEPLOY CHECKLIST

```
□ Headings: weight 700, точки в конце
□ Body: 16/17px discrete, НЕ clamp()
□ Tracking: inverse (hero -0.04em → label +0.03em)
□ Line-height display: unitless (1.05-1.07)
□ Line-height body: fixed px, 4px grid
□ Секции: #FFF / #F5F5F7 чередование
□ Glass: только nav + floating
□ Карточки: solid
□ Spacing: 4px grid
□ Touch targets ≥44px
```
