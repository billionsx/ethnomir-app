#!/usr/bin/env python3
"""
enhance_screens.py — СКРИПТ ОТКЛЮЧЁН.

По требованию владельца проекта (Billions X), скрины идут в PDF в оригинальных
цветах как были присланы (iOS-нативная палитра, JPEG-passthrough в PDF).
Enhancement CAUSED visual degradation — цвета становились слишком насыщенными.

Скрипт оставлен как no-op: VIBRANCE_STRENGTH=0, CONTRAST=1.0, BRIGHTNESS=1.0.
Файлы проверяются, идемпотентно пропускаются если уже PNG, иначе остаются JPEG.
НЕ запускать без явного разрешения.
"""
import os
from PIL import Image, ImageEnhance
import numpy as np

SCREENS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "..", "screens")
SCREENS_DIR = os.path.abspath(SCREENS_DIR)

# DISABLED — по требованию, оригиналы не трогать
VIBRANCE_STRENGTH = 0.0
CONTRAST = 1.0
BRIGHTNESS = 1.0


def apply_vibrance(img_rgb, strength=VIBRANCE_STRENGTH):
    """Нелинейный S-boost: пастельные пиксели (S≈25) получают большой прирост,
    насыщенные (S≈200) — почти не трогаются.
    Формула: new_S = S + (255-S) * strength * (1 - S/255)
    """
    arr = np.array(img_rgb.convert("HSV"), dtype=np.float32)
    S = arr[..., 1]
    headroom = 1.0 - (S / 255.0)
    boost = (255.0 - S) * strength * headroom
    arr[..., 1] = np.clip(S + boost, 0, 255)
    hsv_out = Image.fromarray(arr.astype(np.uint8), mode="HSV")
    return hsv_out.convert("RGB")


def enhance_one(path):
    img = Image.open(path)
    if img.format == "PNG":
        return os.path.getsize(path), True
    img = img.convert("RGB")
    out = apply_vibrance(img, VIBRANCE_STRENGTH)
    out = ImageEnhance.Contrast(out).enhance(CONTRAST)
    out = ImageEnhance.Brightness(out).enhance(BRIGHTNESS)
    out.save(path, "PNG", optimize=True)
    return os.path.getsize(path), False


def main():
    files = sorted(f for f in os.listdir(SCREENS_DIR)
                   if f.startswith("Screenshot_") and f.endswith(".png"))
    print(f"Vibrance-enhancing {len(files)} screens")
    print(f"  vibrance={VIBRANCE_STRENGTH}, contrast×{CONTRAST}, brightness×{BRIGHTNESS}\n")
    total_before = total_after = skipped = 0
    for i, fn in enumerate(files, 1):
        fp = os.path.join(SCREENS_DIR, fn)
        before = os.path.getsize(fp)
        after, was_skipped = enhance_one(fp)
        total_before += before
        total_after += after
        if was_skipped:
            skipped += 1
        else:
            print(f"  [{i:>2}/{len(files)}] {fn}: {before:>7}B → {after:>7}B")
    print(f"\nProcessed: {len(files)-skipped}, skipped: {skipped}")
    print(f"Total: {total_before/1024/1024:.1f} MB → {total_after/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
