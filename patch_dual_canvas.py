#!/usr/bin/env python3
"""
ARCHITECTURE FIX: Dual-canvas gradient

Canvas A: z-index 0, always visible (main app background)
Canvas B: z-index 98, shown ONLY when overlay is open (blocks main content, provides gradient for overlays)

All overlays → transparent → both main and overlay see identical canvas gradient.
"""
import re

path = "apps/web/app/page.tsx"
with open(path, "r") as f:
    txt = f.read()

orig = len(txt)
print(f"Original: {orig:,}")

# ═══ 1. Update EthnomirGradient to accept zIndex prop ═══
old_sig = "const EthnomirGradient=()=>{"
new_sig = "const EthnomirGradient=({zIndex=0}:{zIndex?:number})=>{"
c = txt.count(old_sig)
txt = txt.replace(old_sig, new_sig)
print(f"✅ Updated EthnomirGradient signature ({c})")

# Update style to use zIndex prop
old_style = "style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,height:'100dvh',zIndex:0,pointerEvents:'none'}}"
new_style = "style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,height:'100dvh',zIndex,pointerEvents:'none'}}"
c = txt.count(old_style)
txt = txt.replace(old_style, new_style)
print(f"✅ Updated canvas style to use zIndex prop ({c})")

# ═══ 2. Add _hasOverlay variable + second gradient in App render ═══
# Insert hasOverlay right before "return (" in App
# Find the App's return statement
old_return = """  return (
    <>
      <style>{CSS}</style>
<EthnomirGradient/>"""

new_return = """  const _hasOverlay=showPassport||showCalendar||showFranchise||!!landingSlug||showParkMap||!!orderCode||showChat||showNotifs||showCheckout;
  return (
    <>
      <style>{CSS}</style>
<EthnomirGradient/>
{_hasOverlay&&<EthnomirGradient zIndex={98}/>}"""

c = txt.count(old_return)
txt = txt.replace(old_return, new_return, 1)
print(f"✅ Added _hasOverlay + conditional second gradient ({c})")

# ═══ 3. All overlay backgrounds → transparent ═══
# Double-quote
c1 = txt.count('background:"rgb(218,214,226)"')
txt = txt.replace('background:"rgb(218,214,226)"', 'background:"transparent"')
# Single-quote
c2 = txt.count("background:'rgb(218,214,226)'")
txt = txt.replace("background:'rgb(218,214,226)'", "background:'transparent'")
print(f"✅ All overlays → transparent (dq={c1} sq={c2})")

# ═══ 4. CRM .ios-sheet → transparent ═══
old_crm = ".ios-sheet{background:rgb(218,214,226)!important}"
new_crm = ".ios-sheet{background:transparent!important}"
c = txt.count(old_crm)
txt = txt.replace(old_crm, new_crm)
print(f"✅ CRM .ios-sheet → transparent ({c})")

# ═══ 5. Remove overlay-grad class (not needed anymore) ═══
# Remove the CSS class definition
old_ovg = """
  .overlay-grad{background:linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)!important;background-size:300% 300%!important;animation:gradLive 25s ease infinite!important}"""
c = txt.count(old_ovg)
txt = txt.replace(old_ovg, "")
print(f"✅ Removed .overlay-grad CSS ({c})")

# Remove overlay-grad className usage
txt = txt.replace(' overlay-grad', '')
c3 = txt.count('overlay-grad')
print(f"✅ Cleaned overlay-grad classNames (remaining: {c3})")

# ═══ VERIFY ═══
remaining_opaque = txt.count("rgb(218,214,226)")
print(f"\n📊 Remaining rgb(218,214,226): {remaining_opaque}")
print(f"📊 EthnomirGradient renders: {txt.count('<EthnomirGradient')}")
print(f"Final: {len(txt):,} (delta: {len(txt)-orig:+,})")

with open(path, 'w') as f:
    f.write(txt)

print("✅ PATCH COMPLETE")
