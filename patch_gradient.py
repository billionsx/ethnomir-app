#!/usr/bin/env python3
"""
Apply Ethnomir Gradient + iOS 26.3.1 Liquid Glass across the entire app.

Changes:
1. Add EthnomirGradient canvas component
2. Replace all brand-grad backgrounds → transparent (canvas shows through)
3. Update .gl-card CSS opacity .72 → .42
4. Update all inline glass rgba(255,255,255,.72) → .42
5. CRM .ios-sheet override → transparent
6. Main .eth container → transparent
"""
import re, sys

path = "apps/web/app/page.tsx"
with open(path, "r") as f:
    txt = f.read()

orig_len = len(txt)
print(f"Original: {orig_len:,} chars")

# ═══════════════════════════════════════════
# 1. ADD EthnomirGradient COMPONENT
# Insert right before "function HomeTab"
# ═══════════════════════════════════════════

GRADIENT_COMPONENT = '''
// ═══ ETHNOMIR GRADIENT — утверждённый живой фон v5 ═══
const EthnomirGradient=()=>{const ref=React.useRef<HTMLCanvasElement>(null);React.useEffect(()=>{const c=ref.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;const dpr=window.devicePixelRatio||1;const resize=()=>{c.width=c.clientWidth*dpr;c.height=c.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};resize();window.addEventListener('resize',resize);const blobs=[
{x:0.2,y:0.15,r:0.44,color:[178,160,220],vx:0.14,vy:0.11,phase:0,speed:0.80},
{x:0.75,y:0.2,r:0.39,color:[150,195,240],vx:-0.12,vy:0.14,phase:1.2,speed:0.72},
{x:0.3,y:0.45,r:0.41,color:[160,210,155],vx:0.13,vy:-0.10,phase:2.5,speed:0.88},
{x:0.7,y:0.7,r:0.39,color:[242,195,145],vx:-0.14,vy:-0.12,phase:3.8,speed:0.76},
{x:0.25,y:0.75,r:0.37,color:[195,170,230],vx:0.11,vy:-0.14,phase:5.0,speed:0.84},
{x:0.55,y:0.5,r:0.31,color:[235,170,195],vx:-0.15,vy:0.12,phase:6.3,speed:0.92},
{x:0.6,y:0.1,r:0.31,color:[170,215,248],vx:-0.10,vy:0.16,phase:7.5,speed:0.68},
{x:0.5,y:0.4,r:0.34,color:[248,210,175],vx:0.09,vy:0.11,phase:8.8,speed:0.60},
{x:0.15,y:0.55,r:0.33,color:[145,210,220],vx:0.13,vy:0.08,phase:0.7,speed:0.95},
{x:0.8,y:0.45,r:0.30,color:[220,165,190],vx:-0.11,vy:-0.13,phase:4.2,speed:0.88},
{x:0.45,y:0.85,r:0.35,color:[185,205,160],vx:0.10,vy:-0.15,phase:2.1,speed:0.82},
{x:0.65,y:0.3,r:0.28,color:[240,185,170],vx:-0.14,vy:0.10,phase:5.6,speed:1.0}
];let raf:number;const draw=(time:number)=>{const t=time*0.001;const w=c.clientWidth;const h=c.clientHeight;ctx.fillStyle='rgb(218,214,226)';ctx.fillRect(0,0,w,h);for(const b of blobs){const px=b.x+b.vx*Math.sin(t*b.speed+b.phase)+0.06*Math.sin(t*b.speed*1.73+b.phase*2.3)+0.03*Math.cos(t*b.speed*2.91+b.phase*0.7);const py=b.y+b.vy*Math.sin(t*b.speed*0.83+b.phase+1)+0.07*Math.cos(t*b.speed*1.37+b.phase*1.7)+0.03*Math.sin(t*b.speed*2.47+b.phase*3.1);const pr=b.r+0.06*Math.sin(t*b.speed*0.6+b.phase*0.5);const cx2=px*w;const cy2=py*h;const radius=pr*Math.max(w,h);const g=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,radius);const[rv,gv,bv]=b.color;g.addColorStop(0,`rgba(${rv},${gv},${bv},0.92)`);g.addColorStop(0.25,`rgba(${rv},${gv},${bv},0.7)`);g.addColorStop(0.55,`rgba(${rv},${gv},${bv},0.3)`);g.addColorStop(1,`rgba(${rv},${gv},${bv},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}const shX=w*(0.3+0.06*Math.sin(t*0.45));const shY=h*(0.12+0.04*Math.sin(t*0.38));const sh=ctx.createRadialGradient(shX,shY,0,shX,shY,w*0.4);sh.addColorStop(0,'rgba(255,255,255,0.18)');sh.addColorStop(0.5,'rgba(255,255,255,0.06)');sh.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=sh;ctx.fillRect(0,0,w,h);raf=requestAnimationFrame(draw);};raf=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);}},[]);return <canvas ref={ref} style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,height:'100dvh',zIndex:0,pointerEvents:'none'}}/>;};

'''

anchor = "function HomeTab("
if anchor not in txt:
    print("ERROR: Cannot find HomeTab anchor")
    sys.exit(1)

txt = txt.replace(anchor, GRADIENT_COMPONENT + anchor, 1)
print("✅ Added EthnomirGradient component")

# ═══════════════════════════════════════════
# 2. UPDATE brand-grad CSS CLASS → transparent
# ═══════════════════════════════════════════

old_brand = ".brand-grad,.brand-grad-bg{background:linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)!important;background-size:300% 300%!important;animation:gradLive 25s ease infinite!important}"
new_brand = ".brand-grad,.brand-grad-bg{background:transparent!important}"

count = txt.count(old_brand)
if count == 1:
    txt = txt.replace(old_brand, new_brand)
    print(f"✅ Replaced brand-grad CSS class ({count})")
else:
    print(f"⚠️  brand-grad CSS found {count} times, skipping exact match — trying flexible")
    # Flexible: replace via regex
    txt = re.sub(
        r'\.brand-grad,\.brand-grad-bg\{background:linear-gradient\(170deg[^}]+\}',
        '.brand-grad,.brand-grad-bg{background:transparent!important}',
        txt, count=1
    )
    print("✅ Replaced brand-grad CSS (regex)")

# ═══════════════════════════════════════════
# 3. UPDATE .gl-card opacity .72 → .42
# ═══════════════════════════════════════════

old_gl = ".gl-card{background:rgba(255,255,255,.72)"
new_gl = ".gl-card{background:rgba(255,255,255,.42)"
c = txt.count(old_gl)
txt = txt.replace(old_gl, new_gl)
print(f"✅ Updated .gl-card CSS opacity → .42 ({c})")

# ═══════════════════════════════════════════
# 4. REPLACE ALL INLINE brand-grad backgrounds → transparent
# Both quote styles: " and '
# ═══════════════════════════════════════════

# Pattern: background:"linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)"
# with optional backgroundSize and animation afterwards that we'll also remove

inline_bg = 'background:"linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)",backgroundSize:"300% 300%",animation:"gradLive 25s ease infinite"'
inline_bg_new = 'background:"transparent"'
c = txt.count(inline_bg)
txt = txt.replace(inline_bg, inline_bg_new)
print(f"✅ Replaced inline brand-grad (double-quote full) → transparent ({c})")

# Single quote version
inline_bg2 = "background:'linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)',backgroundSize:'300% 300%',animation:'gradLive 25s ease infinite'"
inline_bg2_new = "background:'transparent'"
c = txt.count(inline_bg2)
txt = txt.replace(inline_bg2, inline_bg2_new)
print(f"✅ Replaced inline brand-grad (single-quote full) → transparent ({c})")

# Some might have the gradient without backgroundSize/animation on same line
# Use regex to catch remaining inline brand-grad patterns
remaining_dq = txt.count('"linear-gradient(170deg,#E3DFF0')
remaining_sq = txt.count("'linear-gradient(170deg,#E3DFF0")
print(f"   Remaining inline brand-grad refs: dq={remaining_dq} sq={remaining_sq}")

# Replace remaining double-quote inline gradients
txt = re.sub(
    r'background:"linear-gradient\(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0\)"(,backgroundSize:"300% 300%")?(,animation:"gradLive 25s ease infinite")?',
    'background:"transparent"',
    txt
)
# Replace remaining single-quote
txt = re.sub(
    r"background:'linear-gradient\(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0\)'(,backgroundSize:'300% 300%')?(,animation:'gradLive 25s ease infinite')?",
    "background:'transparent'",
    txt
)

remaining_dq2 = txt.count('"linear-gradient(170deg,#E3DFF0')
remaining_sq2 = txt.count("'linear-gradient(170deg,#E3DFF0")
print(f"   After regex: dq={remaining_dq2} sq={remaining_sq2}")

# ═══════════════════════════════════════════
# 5. CRM .ios-sheet override → transparent
# ═══════════════════════════════════════════

old_crm = ".ios-sheet{background:linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)!important;background-size:300% 300%!important;animation:gradLive 25s ease infinite!important}"
new_crm = ".ios-sheet{background:transparent!important}"
c = txt.count(old_crm)
txt = txt.replace(old_crm, new_crm)
print(f"✅ Updated CRM .ios-sheet override → transparent ({c})")

# ═══════════════════════════════════════════
# 6. MAIN .eth CONTAINER → transparent
# ═══════════════════════════════════════════

old_eth = """<div className="eth" style={{background:'linear-gradient(170deg,#E3DFF0,#D4E4F0,#DCE8D6,#F0E6D4,#E8E0F0,#D4E4F0,#E3DFF0)',backgroundSize:'300% 300%',animation:'gradLive 25s ease infinite',"""
new_eth = """<div className="eth" style={{background:'transparent',"""
c = txt.count(old_eth)
txt = txt.replace(old_eth, new_eth)
print(f"✅ Main .eth container → transparent ({c})")

# ═══════════════════════════════════════════
# 7. UPDATE ALL INLINE glass card backgrounds .72 → .42
# ═══════════════════════════════════════════

# Double-quote version
c1 = txt.count('background:"rgba(255,255,255,.72)"')
txt = txt.replace('background:"rgba(255,255,255,.72)"', 'background:"rgba(255,255,255,.42)"')

# Single-quote version
c2 = txt.count("background:'rgba(255,255,255,.72)'")
txt = txt.replace("background:'rgba(255,255,255,.72)'", "background:'rgba(255,255,255,.42)'")

# Also handle no-quotes in CSS strings
c3 = txt.count("background:rgba(255,255,255,.72)")
# Be careful to not double-replace the .gl-card CSS we already changed
# Only replace the inline ones (in style strings)
txt = re.sub(r"(?<=\{)background:rgba\(255,255,255,\.72\)", "background:rgba(255,255,255,.42)", txt)

print(f"✅ Updated glass backgrounds .72 → .42 (dq={c1} sq={c2} css={c3})")

# Also update rgba with .82 (CRM segments bar)
c4 = txt.count("background:'rgba(255,255,255,.82)'")
txt = txt.replace("background:'rgba(255,255,255,.82)'", "background:'rgba(255,255,255,.42)'")
c5 = txt.count('background:"rgba(255,255,255,.82)"')
txt = txt.replace('background:"rgba(255,255,255,.82)"', 'background:"rgba(255,255,255,.42)"')
print(f"✅ Updated .82 opacity glass → .42 (sq={c4} dq={c5})")

# ═══════════════════════════════════════════
# 8. INSERT <EthnomirGradient/> IN RENDER
# After <style>{CSS}</style> in the App return
# ═══════════════════════════════════════════

old_render = "<style>{CSS}</style>\n{showSplash"
new_render = "<style>{CSS}</style>\n<EthnomirGradient/>\n{showSplash"
c = txt.count(old_render)
txt = txt.replace(old_render, new_render, 1)
print(f"✅ Inserted <EthnomirGradient/> in App render ({c})")

# ═══════════════════════════════════════════
# VERIFY & WRITE
# ═══════════════════════════════════════════

# Check for any remaining brand gradient references
remaining = txt.count("linear-gradient(170deg,#E3DFF0")
print(f"\n📊 Remaining brand-grad references: {remaining}")
if remaining > 0:
    # Find them
    for i, line in enumerate(txt.split('\n'), 1):
        if "linear-gradient(170deg,#E3DFF0" in line:
            print(f"   Line {i}: ...{line[max(0,line.index('linear-gradient(170deg')-20):line.index('linear-gradient(170deg')+40]}...")

print(f"\nFinal size: {len(txt):,} chars (delta: {len(txt)-orig_len:+,})")

with open(path, "w") as f:
    f.write(txt)

print("\n✅ PATCH COMPLETE")
