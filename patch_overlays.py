#!/usr/bin/env python3
"""
Fix: overlay screens (Passport, CRM, Calendar, Heritage, etc.)
need opaque background to block content underneath.

Strategy:
1. Add CSS class .overlay-grad with opaque animated brand gradient
2. Replace background:"transparent" → background:"rgb(218,214,226)" 
   on all position:fixed overlay divs (NOT on .eth container)
3. Add className="overlay-grad" to these overlays where possible
"""
import re

path = "apps/web/app/page.tsx"
with open(path, "r") as f:
    txt = f.read()

orig = len(txt)
print(f"Original: {orig:,}")

# ═══ 1. Add .overlay-grad CSS class ═══
# Insert right after .brand-grad,.brand-grad-bg{...}
old_brand_css = ".brand-grad,.brand-grad-bg{background:transparent!important}"
new_brand_css = """.brand-grad,.brand-grad-bg{background:transparent!important}
  .overlay-grad{background:linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)!important;background-size:300% 300%!important;animation:gradLive 25s ease infinite!important}"""

c = txt.count(old_brand_css)
txt = txt.replace(old_brand_css, new_brand_css, 1)
print(f"✅ Added .overlay-grad CSS class ({c})")

# ═══ 2. Replace transparent → rgb(218,214,226) on all fixed overlays ═══
# We need to target lines with position:"fixed" or position:'fixed' AND zIndex
# and NOT the .eth container (which has className="eth")

# Double-quote: position:"fixed" ... background:"transparent"
# Replace background:"transparent" with background:"rgb(218,214,226)"
# BUT only on lines that also contain zIndex (overlay indicators)

lines = txt.split('\n')
fixed_count = 0
for i, line in enumerate(lines):
    # Skip .eth container and EthnomirGradient
    if 'className="eth"' in line or 'className=\\"eth\\"' in line:
        continue
    if 'EthnomirGradient' in line:
        continue
    
    # Must be a fixed overlay (has position fixed AND zIndex)
    has_fixed = ('position:"fixed"' in line or "position:'fixed'" in line or 
                 'position:"fixed"' in line)
    has_zindex = ('zIndex:' in line or 'zIndex:' in line)
    
    if has_fixed and has_zindex:
        if 'background:"transparent"' in line:
            lines[i] = line.replace('background:"transparent"', 'background:"rgb(218,214,226)"')
            fixed_count += 1
        if "background:'transparent'" in line:
            lines[i] = lines[i].replace("background:'transparent'", "background:'rgb(218,214,226)'")
            fixed_count += 1

txt = '\n'.join(lines)
print(f"✅ Fixed {fixed_count} overlay backgrounds → rgb(218,214,226)")

# ═══ 3. Also fix CRM .ios-sheet — should be opaque ═══
old_crm = ".ios-sheet{background:transparent!important}"
new_crm = ".ios-sheet{background:rgb(218,214,226)!important}"
c = txt.count(old_crm)
txt = txt.replace(old_crm, new_crm)
print(f"✅ Fixed CRM .ios-sheet → opaque ({c})")

# ═══ 4. Now add overlay-grad class to key overlays ═══
# Passport overlay
c1 = txt.count('className="fade-in passport-overlay"')
txt = txt.replace('className="fade-in passport-overlay"', 'className="fade-in passport-overlay overlay-grad"')
print(f"✅ Passport → overlay-grad ({c1})")

# Passport overlay in App (the one with showPassport)
# This is the ios-sheet with zIndex:200 that shows passport
old_pp = 'className="ios-sheet" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"rgb(218,214,226)"'
new_pp = 'className="ios-sheet overlay-grad" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"rgb(218,214,226)"'
c2 = txt.count(old_pp)
txt = txt.replace(old_pp, new_pp)
print(f"✅ Passport sheet → overlay-grad ({c2})")

# Heritage/Landing pages (zIndex:99)
old_h = "position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'rgb(218,214,226)'"
new_h = "position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'rgb(218,214,226)',className:'overlay-grad'"
# Actually className can't be in style, need different approach
# Let's just leave them with solid bg — the gradient is subtle enough

# ═══ 5. Park map overlay 
old_map = 'zIndex:250,background:"rgb(218,214,226)",display:"flex",flexDirection:"column"}}>'
# There might be multiple, that's fine

# ═══ VERIFY ═══
remaining_transparent_fixed = 0
for line in txt.split('\n'):
    if ('position:"fixed"' in line or "position:'fixed'" in line):
        if ('zIndex:' in line):
            if ('background:"transparent"' in line or "background:'transparent'" in line):
                remaining_transparent_fixed += 1

print(f"\n📊 Remaining transparent fixed overlays: {remaining_transparent_fixed}")

# Check .eth is still transparent
eth_line = [l for l in txt.split('\n') if 'className="eth"' in l]
if eth_line:
    has_transparent = 'transparent' in eth_line[0]
    print(f"📊 .eth container still transparent: {has_transparent}")

print(f"\nFinal: {len(txt):,} (delta: {len(txt)-orig:+,})")

with open(path, 'w') as f:
    f.write(txt)

print("✅ PATCH COMPLETE")
