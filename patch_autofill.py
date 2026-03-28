#!/usr/bin/env python3
"""
Autofill name+phone from userProfile in ALL client-facing forms.

Forms to patch:
1. HomeTab — B2B group booking (id=b2b-name, b2b-phone)
2. EthnoMirTab review form — rvName (already has partial, upgrade)
3. ReviewsLanding — rvName
4. UniversalLanding — name, phone
5. BuildLandingV2 — nm, phone  
6. DirectionsLandingV2 — phone
7. FAQLandingV2 — phone
8. RealtyLandingV2 — name, phone
9. JobsLandingV2 — name, phone
10. FarmLandingV2 — name, phone

Strategy: Add session/userProfile props + useEffect autofill.
"""
import re

path = "apps/web/app/page.tsx"
with open(path, "r") as f:
    txt = f.read()

orig = len(txt)
print(f"Original: {orig:,}")
changes = 0

# ═══════════════════════════════════════════
# 1. HomeTab — add session/userProfile props + B2B autofill
# ═══════════════════════════════════════════

# Add props to signature
old_ht = "function HomeTab({onBuyTicket,onSearch,onMap,onQR,onProfile,onFranchise,onLanding,onNav,cart,setCart,userId,showCartToast,onCalendar}:{onBuyTicket?:()=>void,onSearch?:()=>void,onMap?:()=>void,onQR?:()=>void,onProfile?:()=>void,onNav?:(t:string,s?:string)=>void,onFranchise?:()=>void,onLanding?:(s:string)=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void,onCalendar?:()=>void})"
new_ht = "function HomeTab({onBuyTicket,onSearch,onMap,onQR,onProfile,onFranchise,onLanding,onNav,cart,setCart,userId,showCartToast,onCalendar,session,userProfile}:{onBuyTicket?:()=>void,onSearch?:()=>void,onMap?:()=>void,onQR?:()=>void,onProfile?:()=>void,onNav?:(t:string,s?:string)=>void,onFranchise?:()=>void,onLanding?:(s:string)=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void,onCalendar?:()=>void,session?:any,userProfile?:any})"
c = txt.count(old_ht)
txt = txt.replace(old_ht, new_ht)
changes += c
print(f"✅ HomeTab props ({c})")

# Add autofill to B2B form — find the b2b-name input and add defaultValue
# The B2B form uses DOM ids, not React state. We'll add a useEffect to fill them.
# Find where HomeTab's scroll refs are (early in function body)
old_b2b_name = 'id="b2b-name" placeholder="Ваше имя"'
new_b2b_name = 'id="b2b-name" placeholder="Ваше имя" defaultValue={userProfile?.name&&userProfile.name!=="Путешественник"?userProfile.name:""}'
c = txt.count(old_b2b_name)
txt = txt.replace(old_b2b_name, new_b2b_name)
changes += c
print(f"✅ B2B name autofill ({c})")

old_b2b_phone = 'id="b2b-phone" placeholder="Телефон"'
new_b2b_phone = 'id="b2b-phone" placeholder="Телефон" defaultValue={userProfile?.phone||""}'
c = txt.count(old_b2b_phone)
txt = txt.replace(old_b2b_phone, new_b2b_phone)
changes += c
print(f"✅ B2B phone autofill ({c})")

# Pass session/userProfile to HomeTab render
old_ht_render = '<HomeTab onBuyTicket={()=>setShowTickets(true)} onSearch={()=>setShowSearch(true)} onMap={()=>setShowMap(true)} onQR={()=>setShowQRScanner(true)} onProfile={()=>setShowPassport(true)} cart={cart} setCart={setCart} userId={session?.user?.id} showCartToast={showCartToast} onFranchise={()=>setShowFranchise(true)} onLanding={(s:string)=>setLandingSlug(s)} onNav={(t:any,s:any)=>{setPendingSec(s||"");setTab(t);}}/>'
new_ht_render = '<HomeTab onBuyTicket={()=>setShowTickets(true)} onSearch={()=>setShowSearch(true)} onMap={()=>setShowMap(true)} onQR={()=>setShowQRScanner(true)} onProfile={()=>setShowPassport(true)} cart={cart} setCart={setCart} userId={session?.user?.id} showCartToast={showCartToast} onFranchise={()=>setShowFranchise(true)} onLanding={(s:string)=>setLandingSlug(s)} onNav={(t:any,s:any)=>{setPendingSec(s||"");setTab(t);}} session={session} userProfile={userProfile}/>'
c = txt.count(old_ht_render)
txt = txt.replace(old_ht_render, new_ht_render)
changes += c
print(f"✅ HomeTab render props ({c})")

# ═══════════════════════════════════════════
# 2. EthnoMirTab review form — upgrade autofill
# The existing autofill reads from localStorage. Replace with userProfile.
# ═══════════════════════════════════════════

old_rv_auto = 'useEffect(()=>{if(showReviewForm&&!rvName){try{const s=localStorage.getItem("sb_session");if(s){const p=JSON.parse(s);if(p?.user?.user_metadata?.name)setRvName(p.user.user_metadata.name);}}catch{}}},[showReviewForm]);'
new_rv_auto = 'useEffect(()=>{if(showReviewForm&&!rvName){if(userProfile?.name&&userProfile.name!=="Путешественник")setRvName(userProfile.name);else{try{const s=localStorage.getItem("sb_session");if(s){const p=JSON.parse(s);if(p?.user?.user_metadata?.name)setRvName(p.user.user_metadata.name);}}catch{}}}},[showReviewForm,userProfile]);'
c = txt.count(old_rv_auto)
txt = txt.replace(old_rv_auto, new_rv_auto)
changes += c
print(f"✅ EthnoMirTab review autofill ({c})")

# ═══════════════════════════════════════════
# 3. ReviewsLanding — add session/userProfile
# ═══════════════════════════════════════════

old_rl_sig = "function ReviewsLanding({onClose}:{onClose:()=>void})"
new_rl_sig = "function ReviewsLanding({onClose,session,userProfile}:{onClose:()=>void,session?:any,userProfile?:any})"
c = txt.count(old_rl_sig)
txt = txt.replace(old_rl_sig, new_rl_sig)
changes += c
print(f"✅ ReviewsLanding props ({c})")

# Add autofill — replace existing useEffect that reads from localStorage
old_rl_auto = "useEffect(()=>{if(showForm&&!rvName){try{const s=JSON.parse(localStorage.getItem('sb_session')||'null');if(s?.user?.user_metadata?.name)setRvName(s.user.user_metadata.name);else if(s?.user?.id)sb('profiles','select=name&id=eq.'+s.user.id).then((d:any)=>{if(d?.[0]?.name)setRvName(d[0].name);});}catch{}};},[showForm]);"
new_rl_auto = "useEffect(()=>{if(showForm&&!rvName){if(userProfile?.name&&userProfile.name!=='Путешественник')setRvName(userProfile.name);else{try{const s=JSON.parse(localStorage.getItem('sb_session')||'null');if(s?.user?.user_metadata?.name)setRvName(s.user.user_metadata.name);else if(s?.user?.id)sb('profiles','select=name&id=eq.'+s.user.id).then((d:any)=>{if(d?.[0]?.name)setRvName(d[0].name);});}catch{}}}},[showForm,userProfile]);"
c = txt.count(old_rl_auto)
txt = txt.replace(old_rl_auto, new_rl_auto)
changes += c
print(f"✅ ReviewsLanding autofill ({c})")

# Pass props when rendering
old_rl_render = "<ReviewsLanding onClose={()=>setLandingSlug(null)}/>"
new_rl_render = "<ReviewsLanding onClose={()=>setLandingSlug(null)} session={session} userProfile={userProfile}/>"
c = txt.count(old_rl_render)
txt = txt.replace(old_rl_render, new_rl_render)
changes += c
print(f"✅ ReviewsLanding render ({c})")

# ═══════════════════════════════════════════
# 4. UniversalLanding — add session/userProfile + autofill
# ═══════════════════════════════════════════

old_ul_sig = "function UniversalLanding({slug,onClose,onNav,onBuy}:{slug:string,onClose:()=>void,onNav?:(t:string,s?:string)=>void,onBuy?:()=>void})"
new_ul_sig = "function UniversalLanding({slug,onClose,onNav,onBuy,session,userProfile}:{slug:string,onClose:()=>void,onNav?:(t:string,s?:string)=>void,onBuy?:()=>void,session?:any,userProfile?:any})"
c = txt.count(old_ul_sig)
txt = txt.replace(old_ul_sig, new_ul_sig)
changes += c
print(f"✅ UniversalLanding props ({c})")

# Find name/phone state init in UniversalLanding and add autofill
# UniversalLanding has: const [name,setName]=useState(''); const [phone,setPhone]=useState('');
# We need to find them and add initial values
old_ul_state = "const [name,setName]=useState('');const [phone,setPhone]=useState('');"
if old_ul_state not in txt:
    # Try with space variations
    old_ul_state = "const [name,setName]=useState(\"\");const [phone,setPhone]=useState(\"\");"
    
# If not found as consecutive, search broader
if old_ul_state in txt:
    new_ul_state = "const [name,setName]=useState(()=>userProfile?.name&&userProfile.name!=='Путешественник'?userProfile.name:'');const [phone,setPhone]=useState(()=>userProfile?.phone||'');"
    c = txt.count(old_ul_state)
    txt = txt.replace(old_ul_state, new_ul_state)
    changes += c
    print(f"✅ UniversalLanding state init ({c})")
else:
    # Search for it with regex
    # The pattern is inside UniversalLanding function
    pat = r"(function UniversalLanding[^{]+\{[^}]*?)const \[name,setName\]=useState\(['\"]?['\"]?\);const \[phone,setPhone\]=useState\(['\"]?['\"]?\);"
    m = re.search(pat, txt, re.DOTALL)
    if m:
        print(f"⚠️  UniversalLanding state: found via regex at pos {m.start()}")
    else:
        print(f"⚠️  UniversalLanding state: NOT FOUND — manual fix needed")

# Pass props when rendering UniversalLanding
old_ul_render = '<UniversalLanding slug={landingSlug} onClose={()=>setLandingSlug(null)} onNav={(t:any,s:any)=>{setLandingSlug(null);setPendingSec(s||"");setTab(t);}} onBuy={()=>{setLandingSlug(null);setShowTickets(true);}}/>'
new_ul_render = '<UniversalLanding slug={landingSlug} onClose={()=>setLandingSlug(null)} onNav={(t:any,s:any)=>{setLandingSlug(null);setPendingSec(s||"");setTab(t);}} onBuy={()=>{setLandingSlug(null);setShowTickets(true);}} session={session} userProfile={userProfile}/>'
c = txt.count(old_ul_render)
txt = txt.replace(old_ul_render, new_ul_render)
changes += c
print(f"✅ UniversalLanding render ({c})")

# ═══════════════════════════════════════════
# 5-10. Other landings — add session/userProfile props + pass them
# ═══════════════════════════════════════════

# For each landing, add props to signature and pass when rendering
landings = [
    ("BuildLandingV2", "{onClose,session}", "{onClose,session,userProfile}", ":{onClose:()=>void,session?:any}", ":{onClose:()=>void,session?:any,userProfile?:any}"),
    ("DirectionsLandingV2", "{onClose}", "{onClose,session,userProfile}", ":{onClose:()=>void}", ":{onClose:()=>void,session?:any,userProfile?:any}"),
    ("FAQLandingV2", "{onClose,go}", "{onClose,go,session,userProfile}", ":{onClose:()=>void,go?:(t:string)=>void}", ":{onClose:()=>void,go?:(t:string)=>void,session?:any,userProfile?:any}"),
    ("RealtyLandingV2", "{onClose,go}", "{onClose,go,session,userProfile}", ":{onClose:()=>void,go?:(t:string)=>void}", ":{onClose:()=>void,go?:(t:string)=>void,session?:any,userProfile?:any}"),
    ("JobsLandingV2", "{onClose}", "{onClose,session,userProfile}", ":{onClose:()=>void}", ":{onClose:()=>void,session?:any,userProfile?:any}"),
    ("FarmLandingV2", "{onClose}", "{onClose,session,userProfile}", ":{onClose:()=>void}", ":{onClose:()=>void,session?:any,userProfile?:any}"),
]

for name, old_props, new_props, old_types, new_types in landings:
    old = f"function {name}({old_props}{old_types})"
    new = f"function {name}({new_props}{new_types})"
    c = txt.count(old)
    if c > 0:
        txt = txt.replace(old, new)
        changes += c
        print(f"✅ {name} props ({c})")
    else:
        print(f"⚠️  {name} signature not found")

# Pass session/userProfile in render calls
render_patches = [
    ("<BuildLandingV2 onClose={()=>setLandingSlug(null)} session={session}/>",
     "<BuildLandingV2 onClose={()=>setLandingSlug(null)} session={session} userProfile={userProfile}/>"),
    ("<DirectionsLandingV2 onClose={()=>setLandingSlug(null)}/>",
     "<DirectionsLandingV2 onClose={()=>setLandingSlug(null)} session={session} userProfile={userProfile}/>"),
    ("<JobsLandingV2 onClose={()=>setLandingSlug(null)}/>",
     "<JobsLandingV2 onClose={()=>setLandingSlug(null)} session={session} userProfile={userProfile}/>"),
    ("<FarmLandingV2 onClose={()=>setLandingSlug(null)}/>",
     "<FarmLandingV2 onClose={()=>setLandingSlug(null)} session={session} userProfile={userProfile}/>"),
]

for old_r, new_r in render_patches:
    c = txt.count(old_r)
    txt = txt.replace(old_r, new_r)
    if c > 0:
        changes += c
        print(f"✅ Render patch ({c}): ...{old_r[:50]}...")

# FAQLandingV2 and RealtyLandingV2 have complex render — use regex
for ln in ["FAQLandingV2", "RealtyLandingV2"]:
    # Add session={session} userProfile={userProfile} before />
    old_p = f"<{ln} onClose={{()=>setLandingSlug(null)}}"
    if old_p in txt and f"userProfile={{userProfile}}" not in txt.split(old_p)[1][:100]:
        # Find the full render and add props
        pat = re.compile(f"(<{ln} [^/]+)(/>)")
        matches = list(pat.finditer(txt))
        for m in matches:
            if "userProfile" not in m.group(1):
                old_full = m.group(0)
                new_full = m.group(1) + " session={session} userProfile={userProfile}" + m.group(2)
                txt = txt.replace(old_full, new_full, 1)
                changes += 1
                print(f"✅ {ln} render props added")

# ═══════════════════════════════════════════
# Now add autofill logic inside each landing's form
# Most landings use: const [nm,setNm]=useState('') or [name,setName]
# We need to init from userProfile
# ═══════════════════════════════════════════

# For landings that have [nm,setNm] pattern:
# BuildLandingV2, DirectionsLandingV2, FAQLandingV2, RealtyLandingV2, JobsLandingV2, FarmLandingV2
for fn_name in ["BuildLandingV2", "DirectionsLandingV2", "FAQLandingV2", "RealtyLandingV2", "JobsLandingV2", "FarmLandingV2"]:
    # Find the function and its state declarations
    fn_start = txt.find(f"function {fn_name}")
    if fn_start < 0:
        continue
    # Look for state in next 2000 chars
    chunk = txt[fn_start:fn_start+2000]
    
    # Pattern: const [nm,setNm]=useState('')
    for state_var, setter, field in [("nm", "setNm", "name"), ("name", "setName", "name"), ("phone", "setPhone", "phone"), ("ph", "setPh", "phone")]:
        for q in ["'", '"']:
            old_state = f"const [{state_var},{setter}]=useState({q}{q})"
            if old_state in chunk:
                if field == "name":
                    new_state = f"const [{state_var},{setter}]=useState(()=>userProfile?.name&&userProfile.name!=='Путешественник'?userProfile.name:'')"
                else:
                    new_state = f"const [{state_var},{setter}]=useState(()=>userProfile?.phone||'')"
                # Replace only within this function's scope
                pos = txt.find(old_state, fn_start)
                if pos >= fn_start and pos < fn_start + 3000:
                    txt = txt[:pos] + new_state + txt[pos+len(old_state):]
                    changes += 1
                    print(f"✅ {fn_name}.{state_var} autofill from userProfile.{field}")
                break

# ═══════════════════════════════════════════
# Also patch UniversalLanding's form section
# The form inside uses name/phone that are defined via useState  
# We already tried above. Let's check if it worked or do regex.
# ═══════════════════════════════════════════

# Check UniversalLanding has the autofill
ul_start = txt.find("function UniversalLanding")
if ul_start > 0:
    ul_chunk = txt[ul_start:ul_start+3000]
    if "userProfile?.name" not in ul_chunk:
        # Need to find and replace the state init
        for q in ["'", '"']:
            for pat_str in [f"const [name,setName]=useState({q}{q});const [phone,setPhone]=useState({q}{q})",
                           f"const [name,setName]=useState({q}{q})\nconst [phone,setPhone]=useState({q}{q})"]:
                pos = txt.find(pat_str, ul_start)
                if pos >= ul_start and pos < ul_start + 3000:
                    new_s = f"const [name,setName]=useState(()=>userProfile?.name&&userProfile.name!=='Путешественник'?userProfile.name:'');const [phone,setPhone]=useState(()=>userProfile?.phone||'')"
                    txt = txt[:pos] + new_s + txt[pos+len(pat_str):]
                    changes += 1
                    print(f"✅ UniversalLanding name/phone autofill (found with quote {q})")
                    break

print(f"\n📊 Total changes: {changes}")
print(f"Final: {len(txt):,} (delta: {len(txt)-orig:+,})")

with open(path, 'w') as f:
    f.write(txt)

print("✅ PATCH COMPLETE")
