# BillionsX Design System (BXDS) v3.0
## Стандарт: ИСКЛЮЧИТЕЛЬНО iOS 26 Liquid Glass

**Glass = дефолтный материал для ВСЕХ UI элементов.**
Нулевой legacy. Нулевые flat/solid карточки. Всё — через glass.

---

## LIQUID GLASS — ГЛАВНЫЙ ПРИНЦИП

### Glass 6-слойная система (iOS 26)

Каждый glass-элемент состоит из 6 слоёв:

1. **Translucency**: `background: rgba(255,255,255, 0.20–0.52)`
2. **Blur**: `backdrop-filter: blur(40px) saturate(180%)`
3. **Border**: `border: 0.5px solid rgba(255,255,255, 0.30)`
4. **Specular highlight**: `inset 0 0.5px 0 rgba(255,255,255, 0.40)`
5. **Inner shadow**: по необходимости
6. **Drop shadow**: `0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)`

### Где применяется Glass

**ВЕЗДЕ:**
- Карточки (кейсы, результаты, awards, метрики)
- Навигация (sticky nav)
- Кнопки и pill-фильтры
- Модальные окна и шиты
- Floating badges
- Таблицы
- Формы и инпуты
- CTA-секции
- Тултипы

### Translucency уровни

| Элемент | Прозрачность |
|---|---|
| Карточки | 52% (rgba(255,255,255,.52)) |
| Nav bar | 72% (rgba(255,255,255,.72)) |
| Modals | 85% (rgba(255,255,255,.85)) |
| Badges/pills | 40% (rgba(255,255,255,.40)) |
| Dark glass | rgba(0,0,0,.52) + blur(40px) |

---

## ТИПОГРАФИКА (apple.com)

### Font families
- Display: -apple-system, 'SF Pro Display', system-ui, sans-serif
- Text: -apple-system, 'SF Pro Text', system-ui, sans-serif

### Масштабирование
- **Display** (hero, h1-h4): clamp() — плавно от mobile до desktop
- **Body** (body, caption, label): дискретные breakpoints, НЕ clamp()

### Font-weight

| Элемент | Weight |
|---|---|
| Hero display | 800 |
| Section h2 | 700 |
| Section label (uppercase) | 600 |
| Body | 400 |

### Letter-spacing — обратная от размера

| Размер | Tracking |
|---|---|
| 56-80px (hero) | -0.04em |
| 34-41px (h2) | -0.025em |
| 16-17px (body) | 0em |
| 11px (label) | +0.03em |

---

## КАРТОЧКИ (iOS 26 Glass)

```css
background: rgba(255,255,255, .52);
backdrop-filter: blur(40px) saturate(180%);
border: 0.5px solid rgba(255,255,255, .30);
border-radius: 20px;
box-shadow:
  inset 0 0.5px 0 rgba(255,255,255, .40),
  0 2px 8px rgba(0,0,0, .06),
  0 8px 24px rgba(0,0,0, .04);
```

Specular highlight ОБЯЗАТЕЛЕН.

---

## BORDER-RADIUS

| Элемент | Radius |
|---|---|
| Cards | 20px |
| Buttons | 14px |
| Sheets/modals | 28px |
| Pills/tags | 9999px |

---

## ЗАПРЕЩЕНО

- Flat/solid карточки (всё = glass)
- Google Fonts
- Emoji в UI
- Border-radius > 28px (кроме pills)
- Legacy iOS 18 паттерны
