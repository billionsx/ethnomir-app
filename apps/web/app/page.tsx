'use client';
import dynamic from 'next/dynamic';
// @ts-nocheck
// v21: 2026-03-15T22:40:00.000Z
import React, { useState, useEffect, useCallback, Component } from 'react';

// ─── Supabase ────────────────────────────────────────────
const SB_URL = 'https://ewnoqkoojobyqqxpvzhj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';

async function doShare(title:string,text:string) {
  if(navigator.share) {
    try { await navigator.share({title,text,url:window.location.href}); } catch{}
  } else {
    await navigator.clipboard.writeText(text+" "+window.location.href);
  }
}


function logActivity(action,meta){try{fetch(SB_URL+'/rest/v1/user_activity',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({action:action,details:JSON.stringify(typeof meta==='string'?meta:(meta||{})),device:navigator.userAgent?.slice(0,100)||''})}).catch(()=>{});}catch(e){}}
async function submitContactRequest(type:string,source:string,name?:string,phone?:string,message?:string) {
  try{
    await fetch(SB_URL+'/rest/v1/contact_requests',{
      method:'POST',
      headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify({type,source,name:name||'',phone:phone||'',message:message||''})
    });
    return true;
  }catch{return false;}
}

async function logAction(userId:string|null,action:string,entityType:string,entityId?:string,meta?:any){
  if(!userId)return;
  fetch(SB_URL+'/rest/v1/user_activity',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({user_id:userId,action:action+'_'+entityType,details:JSON.stringify({entity_type:entityType,entity_id:entityId,...(meta||{})})})}).catch(()=>{});
}

function _safe(rows:any[]):any[]{return rows.map((r:any)=>{const o:any={};for(const k in r){const v=r[k];o[k]=(v===null||v===undefined)?'':(Array.isArray(v)?v:(typeof v==='object'?JSON.stringify(v):v));}return o;});}
function _s(v:any):string{if(v==null)return'';if(Array.isArray(v))return v.join(', ');if(typeof v==='object')return JSON.stringify(v);return String(v);}
function _cleanUser(u:any){if(!u)return{};return{id:String(u.id||''),email:String(u.email||''),phone:String(u.phone||'')}}
function _cleanSession(raw:any):any{if(!raw||typeof raw!=='object')return raw;const out:any={};for(const k in raw){const v=raw[k];if(k==='user'){out.user=_cleanUser(v);}else if(v===null||v===undefined){continue;}else if(typeof v==='string'||typeof v==='number'||typeof v==='boolean'){out[k]=v;}}return out;}
async function sb(table: string, params = '') {
  try{
    const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
    });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? _safe(d) : [];
  }catch(e){return [];}
}

// ─── Auth ─────────────────────────────────────────────────
async function sbAuth(action: string, body: any) {
  if (action.startsWith('token?grant_type=password')) {
    const r = await fetch(`${SB_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return r.json();
  }
  const r = await fetch(`${SB_URL}/auth/v1/${action}`, {
    method: 'POST',
    headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}
async function sbAuthGet(token: string, path: string) {
  try{
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if(r.status===401){
      const refreshed = await tryRefreshSession();
      if(refreshed?.access_token){
        const r2 = await fetch(`${SB_URL}/rest/v1/${path}`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${refreshed.access_token}`, 'Content-Type': 'application/json' }
        });
        if(r2.ok){const d2=await r2.json();return Array.isArray(d2)?_safe(d2):[];}
      }
      return [];
    }
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? _safe(d) : [];
  }catch(e){return [];}
}

async function tryRefreshSession(): Promise<any> {
  try{
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sb_session') : null;
    if(!stored) return null;
    const s = JSON.parse(stored);
    if(!s?.refresh_token) return null;
    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    });
    if(!r.ok){ localStorage.removeItem('sb_session'); return null; }
    const d = await r.json();
    if(d?.access_token){
      const newSession = _cleanSession({ ...d, user: _cleanUser(d.user || s.user) });
      localStorage.setItem('sb_session', JSON.stringify(newSession));
      window.dispatchEvent(new CustomEvent('session-refreshed', { detail: newSession }));
      return newSession;
    }
    return null;
  }catch(e){ return null; }
}

// ─── Fonts ───────────────────────────────────────────────
const FD = '"SF Pro Display",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';
const FT = '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';

type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
  html,body{height:100%;overflow:hidden;overflow-x:hidden!important;margin:0;padding:0;max-width:100vw;background:#F2F2F7;background:var(--bg)} *{box-sizing:border-box} .eth,.eth *{box-sizing:border-box} .eth>div{max-width:390px;overflow-x:hidden}
  @media(prefers-color-scheme:dark){:root{--label:#F5F5F7;--label2:rgba(235,235,245,0.6);--label3:rgba(235,235,245,0.3);--label4:rgba(235,235,245,0.18);--bg:#000;--bg2:#1C1C1E;--fill:rgba(120,120,128,0.36);--fill3:rgba(118,118,128,0.24);--fill4:rgba(118,118,128,0.18);--sep:rgba(84,84,88,0.36);--sep-opaque:#38383A;--shadow-sm:0 1px 3px rgba(0,0,0,.3);--shadow-card:0 2px 8px rgba(0,0,0,.4);--shadow-md:0 4px 16px rgba(0,0,0,.5);}}
 .eth{
    --bg:#F2F2F7;--bg2:#FFFFFF;--bg3:#F9F9F9;
    --label:#000000;--label2:rgba(60,60,67,0.60);--label3:rgba(60,60,67,0.30);--label4:rgba(60,60,67,0.18);
    --fill:rgba(120,120,128,0.20);--fill2:rgba(120,120,128,0.16);--fill3:rgba(120,120,128,0.12);--fill4:rgba(120,120,128,0.08);
    --sep:rgba(60,60,67,0.29);--sep-opaque:#C6C6C8;
    --blue:#007AFF;--green:#34C759;--red:#FF3B30;--orange:#FF9500;--purple:#AF52DE;--pink:#FF2D55;--yellow:#FFCC00;--teal:#5AC8FA;--indigo:#5856D6;
    --r-sm:10px;--r-md:14px;--r-lg:20px;--r-card:22px;--r-sheet:28px;
    --shadow-sm:0 0.5px 1px rgba(0,0,0,0.04),0 1px 3px rgba(0,0,0,0.06);
    --shadow-md:0 2px 8px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);
    --shadow-lg:0 8px 24px rgba(0,0,0,0.08),0 16px 48px rgba(0,0,0,0.04);
    --shadow-card:0 0.5px 1px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.06);
    color-scheme:light;
    font-family:"SF Pro Text",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif;
  }
  .eth *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;min-height:0}
  .eth ::-webkit-scrollbar{display:none}
  @keyframes fu{from{opacity:0;transform:translateY(12px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(120vh) rotate(720deg);opacity:0}}
  @keyframes celebrate{0%{transform:scale(0) rotate(-10deg);opacity:0}50%{transform:scale(1.15) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
  .celebrate{animation:celebrate .5s cubic-bezier(0.2,0.8,0.2,1) both}
  @keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}
  .fu{animation:fu .42s cubic-bezier(0.2,0.8,0.2,1) both}
  .s1{animation-delay:.03s}.s2{animation-delay:.06s}.s3{animation-delay:.09s}
  .s4{animation-delay:.12s}.s5{animation-delay:.15s}.s6{animation-delay:.18s}
  .tap{cursor:pointer;transition:transform .22s cubic-bezier(0.34,1.56,0.64,1),opacity .15s} .ds-open .em-tabbar{display:none!important} @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}} .anim-slideUp{animation:slideUp .45s cubic-bezier(0.2,0.8,0.2,1) forwards} .anim-fadeIn{animation:fadeIn .3s ease forwards} .anim-scaleIn{animation:scaleIn .35s cubic-bezier(0.2,0.8,0.2,1) forwards} .fu{opacity:0;transform:translateY(16px);animation:fadeUp .5s ease forwards} @keyframes fadeUp{to{opacity:1;transform:translateY(0)}} .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}.s6{animation-delay:.3s}
  @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}.tap{-webkit-tap-highlight-color:transparent} .tap:active{transform:scale(0.96)!important;opacity:.7!important;transition:transform .08s,opacity .06s}
  @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .slide-up{animation:slideUp .35s cubic-bezier(.2,.8,.2,1)}
  .fade-in{animation:fadeIn .25s ease}
  .glass-p{backdrop-filter:blur(40px) saturate(200%) brightness(1.08);
    -webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.08);
    background:rgba(255,255,255,0.72);border:0.5px solid rgba(0,0,0,0.08);
    box-shadow:inset 0 0.5px 0 rgba(255,255,255,0.5),0 8px 32px rgba(0,0,0,0.10)}
  .live::before{content:'';width:6px;height:6px;border-radius:50%;background:#ff3b30;
    display:inline-block;margin-right:4px;animation:pulse 1.2s ease-in-out infinite}
  .spin{animation:spin .8s linear infinite}
  .ios-card{background:var(--bg2);border-radius:var(--r-card);box-shadow:var(--shadow-card);overflow:hidden}
  .ios-list{background:var(--bg2);border-radius:var(--r-lg)}
  .ios-list-row{padding:13px 20px;display:flex;align-items:center;gap:14px;min-height:48px}
  .ios-list-row+.ios-list-row{border-top:0.5px solid var(--sep)}
  .ios-section-header{font-size:22px;font-weight:700;letter-spacing:-0.4px;padding:8px 20px 10px;color:var(--label)}
  .ios-btn{display:flex;align-items:center;justify-content:center;height:50px;border-radius:var(--r-md);
    font-size:17px;font-weight:600;letter-spacing:-0.2px;border:none;cursor:pointer;
    transition:all .2s cubic-bezier(0.2,0.8,0.2,1)}
  .ios-btn:active{transform:scale(0.97);opacity:.9}
  .snap-x{scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}.snap-x>*{scroll-snap-align:start;}
.ios-input{width:100%;padding:14px 16px;border-radius:12px;border:0.5px solid var(--sep-opaque);background:var(--bg);font-size:16px;font-family:inherit;outline:none;color:var(--label);transition:border-color .2s;}.ios-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(0,122,255,0.12);}.ios-input-old{width:100%;height:50px;padding:0 16px;border-radius:var(--r-md);border:0.5px solid var(--sep-opaque);
    background:var(--bg);font-size:17px;color:var(--label);outline:none;
    font-family:"SF Pro Text",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif;
    transition:border-color .2s,box-shadow .2s}
  .ios-input:focus{border-color:var(--blue);box-shadow:0 0 0 3.5px rgba(0,122,255,0.12)}
  .ios-input::placeholder{color:var(--label3)}
`;

// ─── Helpers ─────────────────────────────────────────────
function Skeleton({w,h,r}:{w?:string,h?:number,r?:number}) {
  return <div style={{width:w||"100%",height:h||16,borderRadius:r||8,background:"linear-gradient(90deg,var(--fill4) 25%,var(--fill3) 50%,var(--fill4) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s ease infinite"}}/>;
}

function SkeletonCard() {
  return (
    <div style={{padding:"16px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)"}}>
      <Skeleton h={140} r={14}/>
      <div style={{marginTop:12}}><Skeleton h={18} w="70%" r={6}/></div>
      <div style={{marginTop:8}}><Skeleton h={13} w="45%" r={6}/></div>
    </div>
  );
}

function SkeletonList({n}:{n?:number}) {
  return <div style={{display:"flex",flexDirection:"column",gap:12}}>{Array.from({length:n||3}).map((_,i)=><div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i<(n||3)-1?"0.5px solid var(--sep)":"none"}}><Skeleton w="44px" h={44} r={13}/><div style={{flex:1}}><Skeleton h={15} w="60%" r={6}/><div style={{marginTop:6}}><Skeleton h={12} w="40%" r={6}/></div></div></div>)}</div>;
}

function Spinner() {
  return <div style={{display:'flex',justifyContent:'center',padding:32}}>
    <div className="spin" style={{width:28,height:28,borderRadius:14,border:'2.5px solid var(--bg2)',borderTopColor:'var(--blue)'}}/>
  </div>;
}
function Chev({ c='var(--label3)' }:any) {
  return <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Bdg({ label, color }:any) {
  return <span style={{display:'inline-block',padding:'2px 7px',background:`${color}22`,borderRadius:6,border:`.5px solid ${color}44`,fontSize:10,fontWeight:700,color,fontFamily:FT}}>{label}</span>;
}
function Seg({ items, val, set }:any) {
  return (
    <div style={{display:'flex',background:'var(--fill4)',borderRadius:10,padding:2,gap:1,margin:'0 20px 16px'}}>
      {items.map(([k,l]:any)=>(
        <div key={k} className="tap" onClick={()=>set(k)}
          style={{flex:1,textAlign:'center',padding:'8px 0',borderRadius:8,cursor:'pointer',
            background:val===k?'var(--bg2)':'transparent',boxShadow:val===k?'0 1px 4px rgba(0,0,0,.15)':'none',transition:'all .2s'}}>
          <span style={{fontSize:11,fontWeight:val===k?700:400,color:val===k?'var(--label)':'var(--label3)',fontFamily:FT}}>{l}</span>
        </div>
      ))}
    </div>
  );
}

const HERO_FB:{g:string,title:string,sub:string,badge:string,cover_emoji?:string}[] = [
  {g:'linear-gradient(135deg,#C0392B,#E91E63)',title:'Этномир',sub:'Загрузка...',badge:'',cover_emoji:'🌍'},
]

// ─── HOME ─────────────────────────────────────────────────
function WelcomeScreen({onDone}:{onDone:()=>void}) {
  const [step, setStep] = useState(0);
  const steps = [
    {e:"🌍",t:"Добро пожаловать!",s:"Этномир — крупнейший этнографический парк России. 96 стран мира на 140 гектарах.",bg:"linear-gradient(145deg,#1B3A2A,#2D5A3D)"},
    {e:"📷",t:"Собирайте штампы",s:"Сканируйте QR-коды у каждого этнодвора и зарабатывайте очки в паспорт путешественника.",bg:"linear-gradient(145deg,#0a2463,#247ba0)"},
    {e:"🏨",t:"Бронируйте онлайн",s:"Отели, туры, мастер-классы и рестораны — всё в одном приложении. Специальные цены!",bg:"linear-gradient(145deg,#6b2fa0,#c33764)"}
  ];
  const s = steps[step];
  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:s.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 30px",textAlign:"center",transition:"background .5s ease"}}>
      <div style={{fontSize:72,marginBottom:24}}>{s.e}</div>
      <div style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.2}}>{s.t}</div>
      <div style={{fontSize:15,color:"rgba(255,255,255,.7)",fontFamily:FT,marginTop:12,lineHeight:1.6,maxWidth:300}}>{s.s}</div>
      <div style={{display:"flex",gap:6,marginTop:32}}>
        {steps.map((_:any,i:number)=>(
          <div key={i} style={{width:step===i?20:6,height:6,borderRadius:3,background:step===i?"#fff":"rgba(255,255,255,.25)",transition:"all .3s cubic-bezier(0.2,0.8,0.2,1)"}}/>
        ))}
      </div>
      <div className="tap" onClick={()=>step<2?setStep(step+1):onDone()} style={{marginTop:40,padding:"17px 52px",borderRadius:14,background:"rgba(255,255,255,.18)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"0.5px solid rgba(255,255,255,.2)"}}>
        <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{step<2?"Далее":"Начать"}</span>
      </div>
      {step>0 && <div className="tap" onClick={onDone} style={{marginTop:12}}><span style={{fontSize:14,color:"rgba(255,255,255,.5)",fontFamily:FT}}>Пропустить</span></div>}
    </div>
  );
}

function SuccessToast({msg,onClose}:{msg:string,onClose:()=>void}) {
  useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t);},[]);
  return (
    <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:300,width:"calc(100% - 40px)",maxWidth:350,padding:"16px 20px",borderRadius:16,background:"rgba(52,199,89,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",display:"flex",gap:12,alignItems:"center",animation:"fu .4s cubic-bezier(0.2,0.8,0.2,1)"}}>
      <div style={{width:36,height:36,borderRadius:18,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✓</div>
      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:FT}}>{msg}</div></div>
      <div className="tap" onClick={onClose} style={{fontSize:18,color:"rgba(255,255,255,0.7)",cursor:"pointer"}}>✕</div>
    </div>
  );
}

function BookingModal({item,type,total,guests,onClose}:{item:any,type:string,total:number,guests:number,onClose:()=>void}) {
  useEffect(()=>{const tb=document.querySelector('.em-tabbar') as any;if(tb)tb.style.display='none';return()=>{if(tb)tb.style.display='';};},[]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if(!name.trim()||!phone.trim()){setErr("Заполните имя и телефон");return;}
    if(phone.replace(/\D/g,"").length<10){setErr("Проверьте номер телефона");return;}
    setSending(true);setErr("");
    try{
      const r = await fetch(SB_URL+"/rest/v1/bookings",{
        method:"POST",
        headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"return=minimal"},
        body:JSON.stringify({type,item_id:item.id||null,item_name:item.name||item.name_ru||"",guest_name:name,guest_phone:phone.replace(/\D/g,""),guests_count:guests,total_price:total,nights:item._nights||null})
      });
      if(r.ok){setDone(true);logAction(null,"booking",type,item.id||"",{item_name:item.name||item.name_ru,total,guests});fetch(SB_URL+"/rest/v1/orders",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({type,items:JSON.stringify([{id:item.id,name:item.name||item.name_ru,qty:guests}]),subtotal:total,total,guest_name:name,guest_phone:phone,status:"pending"})}).catch(()=>{});}else{setErr("Ошибка. Позвоните +7 (495) 023-43-49");}
    }catch{setErr("Нет связи. Попробуйте позже.");}
    setSending(false);
  };

  if(done) return (
    <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="fu" style={{background:"rgba(249,249,249,0.94)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",borderRadius:28,padding:"40px 24px",maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 16px 48px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.4)",border:"0.5px solid rgba(255,255,255,0.35)"}}>
        <div style={{width:64,height:64,borderRadius:32,background:"rgba(52,199,89,0.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>✅</div>
        <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>Заявка отправлена!</div>
        <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8,lineHeight:1.5}}>Менеджер свяжется с вами в течение 30 минут по номеру {phone}</div>
        <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:12}}>{item.name||item.name_ru} · {total.toLocaleString("ru")} ₽</div>
        <div className="tap" onClick={onClose} style={{marginTop:20,padding:"14px",borderRadius:14,background:"var(--blue)",cursor:"pointer"}}>
          <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>Отлично</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}} onClick={onClose}>
      <div className="fu" onClick={(e:any)=>e.stopPropagation()} style={{background:"rgba(249,249,249,0.94)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",borderRadius:"28px 28px 0 0",padding:"8px 24px 32px",maxWidth:390,width:"100%",boxShadow:"0 -8px 32px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.4)",border:"0.5px solid rgba(255,255,255,0.35)"}}>
        {/* Handle bar */}
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(60,60,67,0.2)",margin:"0 auto 8px"}}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}><div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"rgba(120,120,128,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg></div></div>
        <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:4}}>Оформить заявку</div>
        <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>{item.name||item.name_ru} · {guests} чел. · {total.toLocaleString("ru")} ₽</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--label2)",fontFamily:FT,marginBottom:6}}>Ваше имя</div>
          <input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Иван Иванов" className="ios-input"/>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--label2)",fontFamily:FT,marginBottom:6}}>Телефон</div>
          <input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+7 900 123-45-67" type="tel" className="ios-input"/>
        </div>
        {err && <div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,marginBottom:12,textAlign:"center"}}>{err}</div>}
        <div className="tap" onClick={submit} style={{padding:"16px",borderRadius:16,background:"var(--blue)",textAlign:"center",opacity:sending?.5:1,marginBottom:8}}>
          <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{sending?"Отправка...":"Отправить заявку"}</span>
        </div>
        <div className="tap" onClick={onClose} style={{padding:"12px",textAlign:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Отмена</span>
        </div>
      </div>
    </div>
  );
}

function Stamp({flag,name,visited,size,date}:{flag:string,name:string,visited?:boolean,size?:number,date?:string}) {
  const s = size||58;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,width:s+12}}>
      <div style={{width:s,height:s,borderRadius:visited?4:s/2,background:visited?"transparent":"var(--fill4)",border:visited?"2px solid var(--green)":"2px dashed rgba(60,60,67,.15)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",opacity:visited?1:0.45,transform:visited?"rotate(-6deg)":"none",transition:"all .3s ease"}}>
        {visited && <div style={{position:"absolute",inset:0,borderRadius:4,border:"2px solid var(--green)",opacity:.3}}/>}
        <span style={{fontSize:s*0.45,filter:visited?"none":"grayscale(100%)"}}>{flag}</span>
        {!visited && <div style={{position:"absolute",inset:0,borderRadius:s/2,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,opacity:.4}}>🔒</span></div>}
        {visited && <div style={{position:"absolute",bottom:-4,left:"50%",transform:"translateX(-50%)",padding:"1px 6px",borderRadius:4,background:"var(--green)",whiteSpace:"nowrap"}}><span style={{fontSize:8,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{date||"2026"}</span></div>}
      </div>
      <span style={{fontSize:10,color:visited?"var(--label)":"var(--label3)",fontFamily:FT,textAlign:"center",maxWidth:s+12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:visited?600:400}}>{name}</span>
    </div>
  );
}

/* OLD Stamp close kept for compat */
function _StampOld({flag,name,visited,size}:{flag:string,name:string,visited?:boolean,size?:number}) {
  const s = size||58;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,width:s+8}}>
      <div style={{width:s,height:s,borderRadius:s/2,background:visited?"rgba(52,199,89,.08)":"var(--fill4)",border:visited?"2px solid var(--green)":"2px solid var(--sep-opaque)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <span style={{fontSize:s*0.5}}>{flag}</span>
        {visited && <div style={{position:"absolute",bottom:-2,right:-2,width:18,height:18,borderRadius:9,background:"var(--green)",border:"2px solid var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,color:"#fff"}}>✓</span></div>}
      </div>
      <span style={{fontSize:10,color:"var(--label3)",fontFamily:FT,textAlign:"center",maxWidth:s+8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{name}</span>
    </div>
  );
}

function StarRating({value,onChange,size}:{value:number,onChange?:(n:number)=>void,size?:number}) {
  const s = size||20;
  return (
    <div style={{display:"flex",gap:2}}>
      {[1,2,3,4,5].map(n=>(
        <div key={n} className={onChange?"tap":""} onClick={()=>onChange&&onChange(n)} style={{fontSize:s,color:n<=value?"#FF9500":"var(--fill)",cursor:onChange?"pointer":"default",transition:"transform .15s"}}>
          {n<=value?"★":"☆"}
        </div>
      ))}
    </div>
  );
}

function CountryDetail({country,onClose}:{country:any,onClose:()=>void}) {
  return (
    <div className="fade-in" style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:180,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      <div style={{position:"relative",height:220,background:"linear-gradient(145deg,#0a2463,#247ba0)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div className="tap" onClick={onClose} style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.25)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:18,color:"#fff",fontWeight:300}}>‹</span>
        </div>
        <span style={{fontSize:80}}>{country.flag_emoji}</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20,paddingBottom:100}}>
        <div style={{fontSize:28,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px"}}>{country.name_ru}</div>
        {country.name_en && <div style={{fontSize:15,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{country.name_en}</div>}
        {country.continent && (
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <div style={{padding:"5px 12px",borderRadius:30,background:"var(--fill4)",border:"0.5px solid var(--sep)"}}>
              <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT,fontWeight:500}}>{country.continent}</span>
            </div>
          </div>
        )}
        {country.fun_fact_ru && (
          <div style={{marginTop:20,padding:16,borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Интересный факт</div>
            <div style={{fontSize:15,color:"var(--label)",fontFamily:FT,lineHeight:1.6}}>{country.fun_fact_ru}</div>
          </div>
        )}
        {country.description_ru && (
          <div style={{marginTop:12,padding:16,borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>О павильоне</div>
            <div style={{fontSize:15,color:"var(--label2)",fontFamily:FT,lineHeight:1.6}}>{country.description_ru}</div>
          </div>
        )}
        {country._visited && (
          <div style={{marginTop:16,padding:16,borderRadius:16,background:"rgba(52,199,89,.06)",border:"0.5px solid rgba(52,199,89,.15)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>✓</span>
              <span style={{fontSize:15,fontWeight:600,color:"var(--green)",fontFamily:FT}}>Посещено</span>
            </div>
          </div>
        )}
        {!country._visited && (
          <div style={{marginTop:16,padding:16,borderRadius:16,background:"rgba(0,122,255,.04)",border:"0.5px solid rgba(0,122,255,.12)"}}>
            <div style={{fontSize:13,color:"var(--blue)",fontFamily:FT,lineHeight:1.5}}>Посетите павильон и отсканируйте QR-код, чтобы получить штамп</div>
          </div>
        )}
        <div className="tap" onClick={()=>doShare(country.name_ru+" в Этномире",country.flag_emoji+" "+country.name_ru+" — павильон в этнопарке Этномир")} style={{marginTop:20,height:50,borderRadius:14,background:"var(--fill4)",border:"0.5px solid var(--sep-opaque)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:16}}>↗</span>
          <span style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Поделиться</span>
        </div>
      </div>
    </div>
  );
}

function QRModal({onClose,session}:{onClose:()=>void,session?:any}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const scan = async ()=>{
    if(!code.trim()){setError("Введите код");return;}
    setLoading(true);setError("");setResult(null);
    try{
      const r = await fetch(SB_URL+"/functions/v1/scan-qr",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({code:code.trim(),user_id:session?.user?.id||null})
      });
      const d = await r.json();
      if(d.ok){
        setResult(d);
      } else {
        setError(d.error==="invalid_code"?"Код не найден. Проверьте и попробуйте снова.":"Ошибка сканирования");
      }
    }catch{setError("Нет связи");}
    setLoading(false);
  };

  if(result) return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
      <div className="fu" style={{textAlign:"center"}}>
        {result.already ? (
          <>
            <div style={{fontSize:64,marginBottom:16}}>{result.country?.flag_emoji||"🌍"}</div>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{result.country?.name_ru}</div>
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8}}>Эта страна уже в вашем паспорте!</div>
            <div style={{marginTop:8,padding:"6px 14px",borderRadius:10,background:"rgba(52,199,89,.1)",display:"inline-block"}}>
              <span style={{fontSize:13,fontWeight:600,color:"#34C759",fontFamily:FT}}>✓ Посещено ранее</span>
            </div>
          </>
        ) : (
          <>
            <div style={{width:88,height:88,borderRadius:44,background:"rgba(52,199,89,.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}} className="celebrate">
              <span style={{fontSize:44}}>{result.country?.flag_emoji||"🌍"}</span>
            </div>
            <div style={{fontSize:11,fontWeight:600,color:"#34C759",fontFamily:FT,letterSpacing:1,textTransform:"uppercase"}}>Новый штамп</div>
            <div style={{fontSize:26,fontWeight:700,color:"var(--label)",fontFamily:FD,marginTop:8}}>{result.country?.name_ru}</div>
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8,lineHeight:1.5}}>{result.country?.fun_fact_ru||"Добро пожаловать в новую страну!"}</div>
            <div style={{marginTop:16,padding:"8px 20px",borderRadius:30,background:"linear-gradient(135deg,#FFD700,#FFA500)",display:"inline-block"}} className="celebrate">
              <span style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:FD}}>+{result.points||15} очков</span>
            </div>
            {result.achievements&&result.achievements.length>0&&(
              <div style={{marginTop:12,padding:'12px 16px',borderRadius:14,background:'rgba(255,214,10,.1)',border:'0.5px solid rgba(255,214,10,.3)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#FFD60A',fontFamily:FT,marginBottom:4}}>Достижение разблокировано!</div>
                {result.achievements.map((a:string,i:number)=>(<div key={i} style={{fontSize:14,color:'var(--label)',fontFamily:FT}}>🏆 {a}</div>))}
              </div>
            )}
          </>
        )}
        <div className="tap" onClick={()=>{setResult(null);setCode("");}} style={{marginTop:28,height:50,padding:"0 40px",borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>Сканировать ещё</span>
        </div>
        <div className="tap" onClick={onClose} style={{marginTop:12,padding:"10px"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Закрыть</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"54px 20px 14px",background:"rgba(242,242,247,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Сканер</div>
        <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>✕</span>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"24px 20px"}}>
        {/* Camera placeholder */}
        <div style={{height:200,borderRadius:24,background:"linear-gradient(145deg,#1a1a2e,#16213e)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:24,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:30,border:"2px solid rgba(255,255,255,.2)",borderRadius:16}}/>
          <div style={{position:"absolute",top:30,left:30,width:24,height:24,borderTop:"3px solid #007AFF",borderLeft:"3px solid #007AFF",borderRadius:"4px 0 0 0"}}/>
          <div style={{position:"absolute",top:30,right:30,width:24,height:24,borderTop:"3px solid #007AFF",borderRight:"3px solid #007AFF",borderRadius:"0 4px 0 0"}}/>
          <div style={{position:"absolute",bottom:30,left:30,width:24,height:24,borderBottom:"3px solid #007AFF",borderLeft:"3px solid #007AFF",borderRadius:"0 0 0 4px"}}/>
          <div style={{position:"absolute",bottom:30,right:30,width:24,height:24,borderBottom:"3px solid #007AFF",borderRight:"3px solid #007AFF",borderRadius:"0 0 4px 0"}}/>
          <span style={{fontSize:40,marginBottom:8}}>📷</span>
          <span style={{fontSize:13,color:"rgba(255,255,255,.5)",fontFamily:FT}}>Наведите камеру на QR-код</span>
          <span style={{fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:FT,marginTop:4}}>или введите код вручную ↓</span>
        </div>
        {/* Manual entry */}
        <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:8}}>Введите код со стенда</div>
        <div style={{display:"flex",gap:10}}>
          <input value={code} onChange={(e:any)=>setCode(e.target.value)} 
            onKeyDown={(e:any)=>e.key==="Enter"&&scan()}
            placeholder="Например: ETHNO-JP-2026"
            className="ios-input" style={{flex:1,fontSize:16,letterSpacing:1}}/>
        </div>
        {error && <div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,marginTop:8,textAlign:"center"}}>{error}</div>}
        <div className="tap" onClick={scan} style={{marginTop:16,padding:"16px",borderRadius:16,background:"var(--blue)",textAlign:"center",opacity:loading?.5:1}}>
          <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{loading?"Проверяю...":"Проверить код"}</span>
        </div>
        {/* Hint */}
        <div style={{marginTop:24,padding:"16px",borderRadius:16,background:"var(--fill4)",border:"0.5px solid var(--sep)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:6}}>Где найти QR-код?</div>
          <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,lineHeight:1.5}}>QR-коды расположены у каждого этнодвора на территории парка. Отсканируйте код или введите номер со стенда, чтобы получить штамп в паспорт и заработать очки.</div>
        </div>
        {/* Stats */}
        {!session && (
          <div style={{marginTop:16,padding:"14px 16px",borderRadius:14,background:"rgba(255,149,0,.06)",border:"0.5px solid rgba(255,149,0,.15)",display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:20}}>⚠️</span>
            <div style={{fontSize:12,color:"var(--orange)",fontFamily:FT,lineHeight:1.4}}>Войдите в аккаунт, чтобы штампы сохранялись в вашем паспорте</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MapModal({onClose}:{onClose:()=>void}) {
  const [pois, setPois] = useState<any[]>([]);
  useEffect(()=>{sb("map_pois","select=*&is_active=eq.true&order=sort_order.asc").then(d=>setPois((d||[]).map((p:any)=>({e:p.cover_emoji,n:p.name_ru,x:+p.pos_x,y:+p.pos_y,c:p.color}))));},[]);
  const POIS = pois;
  const [sel, setSel] = useState<any>(null);
  return (
    <div style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"54px 20px 14px",background:"rgba(242,242,247,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Карта</div>
        <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>✕</span>
        </div>
      </div>
      <div style={{flex:1,position:"relative",background:"linear-gradient(180deg,#e8f5e9 0%,#c8e6c9 40%,#a5d6a7 70%,#81c784 100%)",overflow:"hidden"}}>
        {/* Park outline */}
        <div style={{position:"absolute",top:"10%",left:"10%",right:"10%",bottom:"10%",borderRadius:30,border:"2px dashed rgba(0,0,0,0.1)",background:"rgba(255,255,255,0.15)"}} />
        {/* Paths */}
        <div style={{position:"absolute",top:"40%",left:"15%",right:"15%",height:2,background:"rgba(0,0,0,0.08)",transform:"rotate(-5deg)"}} />
        <div style={{position:"absolute",top:"20%",left:"40%",width:2,height:"60%",background:"rgba(0,0,0,0.08)"}} />
        {/* Title */}
        <div style={{position:"absolute",top:16,left:0,right:0,textAlign:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:"rgba(0,0,0,0.25)",fontFamily:FT,letterSpacing:2,textTransform:"uppercase"}}>Этномир · 140 ГА</span>
        </div>
        {/* POIs */}
        {POIS.map((p,i)=>(
          <div key={i} className="tap" onClick={()=>setSel(sel?.n===p.n?null:p)}
            style={{position:"absolute",left:p.x+"%",top:p.y+"%",transform:"translate(-50%,-50%)",zIndex:sel?.n===p.n?10:1}}>
            <div style={{width:sel?.n===p.n?48:36,height:sel?.n===p.n?48:36,borderRadius:sel?.n===p.n?24:18,background:sel?.n===p.n?p.c:"#fff",border:sel?.n===p.n?"3px solid #fff":"2px solid "+p.c+"44",boxShadow:sel?.n===p.n?"0 4px 16px rgba(0,0,0,0.2)":"0 2px 8px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sel?.n===p.n?22:16,transition:"all .2s cubic-bezier(0.2,0.8,0.2,1)"}}>{p.e}</div>
          </div>
        ))}
        {/* Selected POI info */}
        {sel && (
          <div className="fu" style={{position:"absolute",bottom:20,left:20,right:20,padding:"14px 18px",borderRadius:18,background:"var(--bg2)",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:44,height:44,borderRadius:12,background:sel.c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{sel.e}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FT}}>{sel.n}</div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>Нажмите для навигации</div>
            </div>
            <Chev />
          </div>
        )}
      </div>
    </div>
  );
}

function weatherEmoji(code:number){if(code<=1)return"☀️";if(code<=3)return"⛅";if(code<=48)return"🌫️";if(code<=67)return"🌧️";if(code<=77)return"🌨️";if(code<=82)return"🌦️";return"⛈️";}

function HomeTab({onBuyTicket,onSearch,onMap,onQR,onProfile,onFranchise,onLanding,onNav}:{onBuyTicket?:()=>void,onSearch?:()=>void,onMap?:()=>void,onQR?:()=>void,onProfile?:()=>void,onNav?:(t:string,s?:string)=>void,onFranchise?:()=>void,onLanding?:(s:string)=>void}) {
  const [slide, setSlide] = useState(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [rests, setRests] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [viewStory, setViewStory] = useState<any>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [weather, setWeather] = useState<any>(null);
  const [promos, setPromos] = useState<any[]>([]);
  const heroCards = [
    {title:"\u0411\u0438\u043B\u0435\u0442\u044B \u0432 \u043F\u0430\u0440\u043A",sub:"\u042D\u0442\u043D\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0430\u0440\u043A \u043C\u0438\u0440\u043E\u0432\u043E\u0433\u043E \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0430. 140 \u0433\u0430 \u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B \u0438 \u043F\u0440\u0438\u0440\u043E\u0434\u044B.",g:"linear-gradient(145deg,#1a5c2e,#0d4020)",badge:"\u0411\u0418\u041B\u0415\u0422\u042B",emoji:"\ud83c\udf9f\ufe0f",act:()=>onBuyTicket&&onBuyTicket()},
    {title:"13 \u043E\u0442\u0435\u043B\u0435\u0439 \u0438 \u0433\u043B\u044D\u043C\u043F\u0438\u043D\u0433\u043E\u0432",sub:"\u0421\u041F\u0410, \u044D\u0442\u043D\u043E-\u043E\u0442\u0435\u043B\u0438, \u043A\u043E\u0442\u0442\u0435\u0434\u0436\u0438 \u0438 \u0433\u043B\u044D\u043C\u043F\u0438\u043D\u0433\u0438. \u041E\u0442 4 000 \u20BD/\u043D\u043E\u0447\u044C.",g:"linear-gradient(145deg,#1a3a5c,#0d2240)",badge:"\u0416\u0418\u041B\u042C\u0401",emoji:"\ud83c\udfe8",act:()=>onNav&&onNav("stay")},
    {title:"18 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u043E\u0432 \u043C\u0438\u0440\u0430",sub:"\u041A\u0443\u0445\u043D\u0438 15 \u0441\u0442\u0440\u0430\u043D. \u0418\u043D\u0434\u0438\u044F, \u0413\u0440\u0443\u0437\u0438\u044F, \u042F\u043F\u043E\u043D\u0438\u044F, \u0418\u0442\u0430\u043B\u0438\u044F \u0438 \u0434\u0440\u0443\u0433\u0438\u0435.",g:"linear-gradient(145deg,#5c1a3a,#40102a)",badge:"\u0420\u0415\u0421\u0422\u041E\u0420\u0410\u041D\u042B",emoji:"\ud83c\udf7d\ufe0f",act:()=>onNav&&onNav("services","delivery")},
    {title:"41 \u043C\u0430\u0441\u0442\u0435\u0440-\u043A\u043B\u0430\u0441\u0441",sub:"\u0413\u043E\u043D\u0447\u0430\u0440\u043D\u043E\u0435 \u0434\u0435\u043B\u043E, \u043A\u0443\u043B\u0438\u043D\u0430\u0440\u0438\u044F, \u0440\u0435\u0441\u043B\u0430\u0432. \u0414\u043B\u044F \u0434\u0435\u0442\u0435\u0439 \u0438 \u0432\u0437\u0440\u043E\u0441\u043B\u044B\u0445.",g:"linear-gradient(145deg,#4a3a0a,#2d2006)",badge:"\u041C\u0410\u0421\u0422\u0415\u0420-\u041A\u041B\u0410\u0421\u0421\u042B",emoji:"\ud83c\udfa8",act:()=>onNav&&onNav("tours","masterclasses")},
    {title:"\u0418\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u0432 \u043F\u0430\u0440\u043A",sub:"\u041D\u0435\u0434\u0432\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u044C \u0441 ROI \u0434\u043E 22%. \u041E\u043A\u0443\u043F\u0430\u0435\u043C\u043E\u0441\u0442\u044C 5\u20137 \u043B\u0435\u0442.",g:"linear-gradient(145deg,#0a3a4a,#062d38)",badge:"\u041D\u0415\u0414\u0412\u0418\u0416\u0418\u041C\u041E\u0421\u0422\u042C",emoji:"\ud83c\udfd7\ufe0f",act:()=>onNav&&onNav("stay","re")},
  ];
  useEffect(()=>{const t=setInterval(()=>setSlide(s=>(s+1)%heroCards.length),5000);return()=>clearInterval(t);},[]);
  useEffect(()=>{if(!viewStory)return;setStoryProgress(0);const iv=setInterval(()=>setStoryProgress(p=>{if(p>=100){setViewStory(null);return 0;}return p+2;}),100);return()=>clearInterval(iv);},[viewStory]);
  useEffect(()=>{
    Promise.all([
      sb('hotels','select=id,name,cover_image_url,price_from,rating,type,tagline&active=eq.true&order=rating.desc&limit=6'),
      sb('restaurants','select=id,name_ru,cover_emoji,cuisine_type,price_level,cover_image_url&active=eq.true&limit=6'),
      sb('stories','select=*&is_active=eq.true&order=sort_order.asc&limit=10'),
      sb('promos','select=*&is_active=eq.true&order=sort_order.asc'),
    ]).then(([h,r,st,pr])=>{setHotels(h||[]);setRests(r||[]);setStories(st||[]);setPromos(pr||[]);});
    fetch("https://api.open-meteo.com/v1/forecast?latitude=55.24&longitude=36.43&current=temperature_2m,weather_code&timezone=Europe/Moscow&forecast_days=1")
      .then(r=>r.json()).then(d=>{if(d?.current)setWeather({temp:Math.round(d.current.temperature_2m),code:d.current.weather_code});}).catch(()=>{});
  },[]);
  const W_ICO:Record<number,string>={0:"\u2600\ufe0f",1:"\ud83c\udf24\ufe0f",2:"\u26c5",3:"\u2601\ufe0f",45:"\ud83c\udf2b\ufe0f",48:"\ud83c\udf2b\ufe0f",51:"\ud83c\udf27\ufe0f",53:"\ud83c\udf27\ufe0f",55:"\ud83c\udf27\ufe0f",61:"\ud83c\udf27\ufe0f",63:"\ud83c\udf27\ufe0f",65:"\ud83c\udf27\ufe0f",71:"\u2744\ufe0f",73:"\u2744\ufe0f",75:"\u2744\ufe0f",80:"\ud83c\udf26\ufe0f",81:"\ud83c\udf26\ufe0f",95:"\u26c8\ufe0f"};
  const cur=heroCards[slide%heroCards.length];
  const dateStr=new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"});
  const featureCards=[
    {label:"\u041E\u0422\u041A\u0420\u041E\u0419\u0422\u0415 \u041F\u0410\u0420\u041A",title:"\u0411\u0438\u043B\u0435\u0442\u044B \u0438 \u044D\u043A\u0441\u043A\u0443\u0440\u0441\u0438\u0438",desc:"4 \u0442\u0438\u043F\u0430 \u0431\u0438\u043B\u0435\u0442\u043E\u0432. \u0414\u0435\u0442\u0441\u043A\u0438\u0435, \u0432\u0437\u0440\u043E\u0441\u043B\u044B\u0435, VIP \u0438 \u0433\u0440\u0443\u043F\u043F\u043E\u0432\u044B\u0435.",g:"linear-gradient(145deg,#2d5016,#1a3a0a)",emoji:"\ud83c\udfab",act:()=>onBuyTicket&&onBuyTicket()},
    {label:"\u0420\u0410\u0417\u0412\u041B\u0415\u0427\u0415\u041D\u0418\u042F",title:"\u0411\u0430\u043D\u044F, \u0421\u041F\u0410 \u0438 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438",desc:"\u0420\u0443\u0441\u0441\u043A\u0430\u044F \u0431\u0430\u043D\u044F, \u0445\u0430\u043C\u043C\u0430\u043C, \u0432\u0435\u0440\u0451\u0432\u043E\u0447\u043D\u044B\u0439 \u043F\u0430\u0440\u043A, \u043B\u0430\u0437\u0435\u0440\u0442\u0430\u0433.",g:"linear-gradient(145deg,#5c3a1a,#40280e)",emoji:"\u2668\ufe0f",act:()=>onNav&&onNav("services","banya")},
    {label:"\u0424\u0420\u0410\u041D\u0427\u0410\u0419\u0417\u0418\u041D\u0413",title:"\u0421\u0442\u0430\u043D\u044C\u0442\u0435 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u043C",desc:"\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0441\u0432\u043E\u0439 \u042D\u0442\u043D\u043E\u043C\u0438\u0440 \u0432 \u0441\u0432\u043E\u0451\u043C \u0433\u043E\u0440\u043E\u0434\u0435. \u0418\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u043E\u0442 60 \u043C\u043B\u043D.",g:"linear-gradient(145deg,#1a1a3a,#0d0d20)",emoji:"\ud83c\udf0d",act:()=>onFranchise&&onFranchise()},
  ];
  return (
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
      {/* ═══ APP STORE HEADER ═══ */}
      <div style={{paddingTop:54,padding:"54px 20px 4px"}}>
        <div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>{dateStr}</div>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px",lineHeight:1.1,marginTop:2}}>{"\u0421\u0435\u0433\u043E\u0434\u043D\u044F"}</div>
      </div>

      <style>{`@keyframes hF{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.03)}}@keyframes hG{0%,100%{opacity:.5}50%{opacity:.9}}@keyframes hR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      {/* ═══ HERO CAROUSEL ═══ */}
      <div style={{padding:"12px 20px 0"}}>
        <div className="tap" onClick={()=>cur.act()} style={{borderRadius:20,overflow:"hidden",position:"relative",height:400,background:cur.g,transition:"background .8s cubic-bezier(.2,.8,.2,1)",boxShadow:"0 8px 30px rgba(0,0,0,0.12)"}}>
          <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(circle at 30% 40%, white 1px, transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,.55) 100%)"}} />
          <div style={{position:"absolute",top:18,left:18,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:8,padding:"4px 10px",border:"0.5px solid rgba(255,255,255,.15)",fontSize:10,color:"rgba(255,255,255,.85)",fontWeight:700,fontFamily:FT,letterSpacing:"1.5px",textTransform:"uppercase"}}>{cur.badge}</span>
          </div>
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}><div style={{position:"absolute",width:220,height:220,borderRadius:110,background:"radial-gradient(circle,rgba(255,255,255,.09) 0%,transparent 70%)",top:"-10%",right:"-12%",animation:"hF 8s ease-in-out infinite"}}/><div style={{position:"absolute",width:160,height:160,borderRadius:80,background:"radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%)",bottom:"0%",left:"-8%",animation:"hF 10s ease-in-out infinite reverse"}}/><div style={{position:"absolute",width:90,height:90,borderRadius:45,background:"rgba(255,255,255,.05)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"0.5px solid rgba(255,255,255,.1)",top:"20%",right:"18%",animation:"hF 6s ease-in-out infinite 1s"}}/><div style={{position:"absolute",width:130,height:130,borderRadius:65,background:"rgba(255,255,255,.04)",backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",border:"0.5px solid rgba(255,255,255,.08)",top:"35%",left:"25%",animation:"hF 9s ease-in-out infinite .5s"}}/><div style={{position:"absolute",width:50,height:50,borderRadius:25,background:"rgba(255,255,255,.08)",top:"55%",right:"35%",animation:"hF 5s ease-in-out infinite 2s"}}/></div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 24px 24px"}}>
            <div style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-0.5px",lineHeight:1.15,marginBottom:6}}>{cur.title}</div>
            <div style={{fontSize:15,color:"rgba(255,255,255,.7)",fontFamily:FT,lineHeight:1.4,fontWeight:400}}>{cur.sub}</div>
            <div style={{display:"flex",gap:5,marginTop:16}}>
              {heroCards.map((_:any,i:number)=><div key={i} style={{width:i===slide%heroCards.length?24:6,height:6,borderRadius:3,background:i===slide%heroCards.length?"#fff":"rgba(255,255,255,.35)",transition:"width .4s cubic-bezier(.2,.8,.2,1)"}} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STORIES ═══ */}
      {stories.length>0 && (
        <div style={{padding:'14px 0 0'}}>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'4px 20px 8px',scrollbarWidth:'none'}}>
            {stories.map((s:any)=>(
              <div key={s.id} className="tap" onClick={()=>setViewStory(s)}
                style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:4,width:68}}>
                <div style={{width:62,height:62,borderRadius:31,padding:2,background:'linear-gradient(135deg,'+s.gradient_from+','+s.gradient_to+')',boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
                  <div style={{width:58,height:58,borderRadius:29,background:'var(--bg2)',display:'flex',alignItems:'center',justifyContent:'center',border:'2.5px solid var(--bg)'}}>
                    <span style={{fontSize:26}}>{s.cover_emoji}</span>
                  </div>
                </div>
                <span style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textAlign:'center',lineHeight:1.2,maxWidth:66,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',fontWeight:500}}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {viewStory && (
        <div className="fade-in" onClick={()=>setViewStory(null)} style={{position:'fixed',top:0,bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:250,background:'linear-gradient(145deg,'+viewStory.gradient_from+','+viewStory.gradient_to+')',display:'flex',flexDirection:'column',padding:'0'}}>
          <div style={{padding:'54px 16px 0',display:'flex',gap:4}}>
            <div style={{flex:1,height:3,borderRadius:2,background:'rgba(255,255,255,.2)',overflow:'hidden'}}>
              <div style={{width:storyProgress+'%',height:'100%',background:'#fff',borderRadius:2,transition:'width .1s linear'}}/>
            </div>
          </div>
          <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:18,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:18}}>{viewStory.cover_emoji}</span>
            </div>
            <div style={{flex:1}}><span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>{"\u042D\u0442\u043D\u043E\u043C\u0438\u0440"}</span></div>
            <div className="tap" onClick={(e:any)=>{e.stopPropagation();setViewStory(null);}} style={{width:30,height:30,borderRadius:15,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:14,color:'#fff'}}>{"\u2715"}</span>
            </div>
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 36px',textAlign:'center'}}>
            <span style={{fontSize:64,marginBottom:20,filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'}}>{viewStory.cover_emoji}</span>
            <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',lineHeight:1.2,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{viewStory.title}</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:10,lineHeight:1.5}}>{viewStory.description}</div>
          </div>
          <div style={{padding:'0 24px 40px'}}>
            {viewStory.link_text&&<div className="tap" onClick={(e:any)=>{e.stopPropagation();if(viewStory.link_action){try{const a=JSON.parse(viewStory.link_action);if(a.tab)onNav&&onNav(a.tab,a.sec);}catch{}}setViewStory(null);}} style={{padding:'14px',borderRadius:14,background:'rgba(255,255,255,.2)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',textAlign:'center'}}>
              <span style={{fontSize:15,fontWeight:600,color:'#fff',fontFamily:FT}}>{viewStory.link_text}</span>
            </div>}
          </div>
        </div>
      )}

      {/* ═══ QUICK INFO BAR ═══ */}
      <div style={{padding:"8px 20px",display:"flex",gap:10}}>
        <div className="tap" onClick={()=>onMap&&onMap()} style={{flex:1,padding:"12px 14px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>{"\ud83d\uddfa\ufe0f"}</span>
          <div><div style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{"\u041A\u0430\u0440\u0442\u0430 \u043F\u0430\u0440\u043A\u0430"}</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>140 \u0433\u0430</div></div>
        </div>
        {weather&&<div style={{padding:"12px 14px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",alignItems:"center",gap:8,minWidth:100}}>
          <span style={{fontSize:22}}>{W_ICO[weather.code]||"\u2600\ufe0f"}</span>
          <div><div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{weather.temp}{"\u00b0"}</div><div style={{fontSize:10,color:"var(--label3)",fontFamily:FT}}>{"\u042d\u0442\u043D\u043E\u043C\u0438\u0440"}</div></div>
        </div>}
      </div>

      {/* ═══ FEATURE CARDS — App Store editorial ═══ */}
      {featureCards.map((fc,fi)=>(
        <div key={fi} style={{padding:"6px 20px"}}>
          <div className="tap" onClick={()=>fc.act()} style={{borderRadius:20,overflow:"hidden",position:"relative",height:220,background:fc.g,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none"}}/>
            <div style={{position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",fontSize:56,opacity:.85,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.2))"}}>{fc.emoji}</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 20px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.5)",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:FT}}>{fc.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.3px",lineHeight:1.15,marginTop:4}}>{fc.title}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4,lineHeight:1.4}}>{fc.desc}</div>
            </div>
          </div>
        </div>
      ))}

      {/* ═══ HOTELS COLLECTION ═══ */}
      {hotels.length>0&&(
        <div style={{padding:"16px 0 0"}}>
          <div style={{padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.3px"}}>{"\u0413\u0434\u0435 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C\u0441\u044F"}</div>
            <div className="tap" onClick={()=>onNav&&onNav("stay")} style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>{"\u0412\u0441\u0435"}</div>
          </div>
          <div style={{display:"flex",gap:12,overflowX:"auto",padding:"12px 20px 4px",scrollbarWidth:"none"}}>
            {hotels.map((h:any)=>(
              <div key={h.id} className="tap" onClick={()=>onNav&&onNav("stay")} style={{flexShrink:0,width:200,borderRadius:16,overflow:"hidden",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{height:120,background:h.cover_image_url?"url("+h.cover_image_url+") center/cover":"linear-gradient(145deg,#1a3a5c,#0d2240)"}}/>
                <div style={{padding:"10px 12px"}}>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</div>
                  <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{"\u043E\u0442 "}{h.price_from?.toLocaleString("ru")}{" \u20BD/\u043D\u043E\u0447\u044C"}</div>
                  {h.rating&&<div style={{fontSize:11,color:"#FF9500",fontFamily:FT,marginTop:3}}>{"\u2b50 "}{h.rating}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ RESTAURANTS COLLECTION ═══ */}
      {rests.length>0&&(
        <div style={{padding:"16px 0 0"}}>
          <div style={{padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.3px"}}>{"\u0420\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u044B"}</div>
            <div className="tap" onClick={()=>onNav&&onNav("services","delivery")} style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>{"\u0412\u0441\u0435"}</div>
          </div>
          <div style={{display:"flex",gap:12,overflowX:"auto",padding:"12px 20px 4px",scrollbarWidth:"none"}}>
            {rests.map((r:any)=>(
              <div key={r.id} className="tap" onClick={()=>onNav&&onNav("services","delivery")} style={{flexShrink:0,width:160,borderRadius:16,overflow:"hidden",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{height:90,background:r.cover_image_url?"url("+r.cover_image_url+") center/cover":"linear-gradient(145deg,#3a1a1a,#200e0e)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {!r.cover_image_url&&<span style={{fontSize:36}}>{r.cover_emoji}</span>}
                </div>
                <div style={{padding:"10px 12px"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name_ru}</div>
                  <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{r.cuisine_type||"\u041A\u0443\u0445\u043D\u044F \u043C\u0438\u0440\u0430"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PROMOS ═══ */}
      {promos.length>0&&(
        <div style={{padding:"16px 20px 0"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.3px",marginBottom:10}}>{"\u0410\u043A\u0446\u0438\u0438"}</div>
          {promos.slice(0,3).map((p:any)=>(
            <div key={p.id} style={{padding:"14px 16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:28}}>{p.cover_emoji||"\ud83c\udf81"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{p.title}</div>
                <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{p.description_short||p.description_ru||""}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ BOTTOM CTA ═══ */}
      <div style={{padding:"20px 20px 0"}}>
        <div className="tap" onClick={()=>onBuyTicket&&onBuyTicket()} style={{borderRadius:16,padding:"20px",background:"linear-gradient(145deg,#007AFF,#0055D4)",textAlign:"center",boxShadow:"0 4px 16px rgba(0,122,255,0.2)"}}>
          <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:FD}}>{"\u041A\u0443\u043F\u0438\u0442\u044C \u0431\u0438\u043B\u0435\u0442\u044B"}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.7)",fontFamily:FT,marginTop:4}}>{"\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 140 \u0433\u0430 \u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B \u0438 \u043F\u0440\u0438\u0440\u043E\u0434\u044B"}</div>
        </div>
      </div>

      {/* ═══ PARK INFO FOOTER ═══ */}
      <div style={{padding:"24px 20px 8px",textAlign:"center"}}>
        <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,lineHeight:1.8}}>
          {"\u042d\u0442\u043D\u043E\u043C\u0438\u0440 \u00b7 \u041A\u0430\u043B\u0443\u0436\u0441\u043A\u0430\u044F \u043E\u0431\u043B."}<br/>
          {"\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E 9:00\u201321:00"}<br/>
          +7 (495) 023-43-49
        </div>
      </div>

    </div>
  );
}

// ─── TOURS ────────────────────────────────────────────────
function ToursTab({onSearch,onBuyTicket,onProfile,pendingSec,onClearPending,favorites,toggleFav}:{onSearch?:()=>void,onBuyTicket?:()=>void,onProfile?:()=>void,pendingSec?:string,onClearPending?:()=>void,favorites?:Set<string>,toggleFav?:(id:string,name?:string,emoji?:string)=>void}) {
  const [sec, setSec] = useState("tours");
  useEffect(()=>{if(pendingSec){setSec(pendingSec);onClearPending&&onClearPending();setTimeout(()=>{const el=document.getElementById("pill-"+pendingSec);/* no scroll */;},100);}},[pendingSec]);
  const [tours, setTours] = useState<any[]>([]);
  const [mk, setMk] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [detailType, setDetailType] = useState("");
  const [persons, setPersons] = useState(2);
  const [booked, setBooked] = useState(false);
  const [b2bPrograms, setB2bPrograms] = useState<any[]>([]);

  useEffect(()=>{
    setLoading(true);setDetail(null);
    if(sec==="tickets") {
      sb("ticket_types","select=*&is_active=eq.true&order=sort_order.asc").then(d=>{setTours(d||[]);setLoading(false);});
    } else if(sec==="tours") {
      sb("tours","select=*&is_available=eq.true&order=price.asc").then(d=>{setTours(d||[]);setLoading(false);});
    } else if(sec==="mk") {
      sb("masterclasses","select=*&is_available=eq.true&order=sort_order.asc&limit=40").then(d=>{setMk(d||[]);setLoading(false);});
    } else if(sec==="events") {
      sb("events","select=*&is_published=eq.true&order=starts_at.asc").then(d=>{setEvents(d||[]);setLoading(false);});
    } else if(sec==="excursions") {
      sb("tours","select=*&is_available=eq.true&type=eq.excursion&order=price.asc").then(d=>{setTours(d||[]);setLoading(false);});
    } else if(sec==="schedule") {
      sb("daily_schedule","select=*&order=time_start.asc").then(d=>{setEvents(d||[]);setLoading(false);});
    } else if(sec==="museums") {
      sb("services","select=*&category=eq.museum&active=eq.true&order=sort_order.asc").then(d=>{setEvents(d||[]);setLoading(false);});
    } else if(sec==='b2b') {
      sb('b2b_programs','select=*&is_active=eq.true&order=sort_order.asc').then(d=>{setB2bPrograms(d||[]);setLoading(false);});
    } else {
      setLoading(false);
    }
  },[sec]);

  const TC: Record<string,string> = {flagship:"#C0392B",excursion:"#2471A3",tour_weekend:"#7D3C98",thematic:"#1E8449",camp:"#8B4513"};
  const [showBooking, setShowBooking] = useState(false);
  const openDetail = (item:any,type:string)=>{setDetail(item);setDetailType(type);setPersons(2);setShowBooking(false);};

  // ═══ DETAIL VIEW ═══
  if (detail) {
    const isTour = detailType==="tour";
    const isMk = detailType==="mk";
    const color = isTour?(TC[detail.type]||"#555"):isMk?"#AF52DE":"#FF9500";
    const dur = isTour?(detail.duration_minutes>=1440?Math.floor(detail.duration_minutes/1440)+" дн.":detail.duration_minutes>=60?Math.floor(detail.duration_minutes/60)+" ч.":detail.duration_minutes+" мин."):isMk?detail.duration_min+" мин.":"";
    const price = isTour?detail.price:isMk?detail.price:detail.price||0;
    const maxP = isTour?detail.max_participants:isMk?detail.max_persons:null;

    return (
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
        {/* Hero */}
        <div style={{position:"relative",height:220,background:"linear-gradient(145deg,"+color+"cc,"+color+"88)"}}>
          <div style={{position:"absolute",right:10,top:"40%",transform:"translateY(-50%)",fontSize:96,opacity:.15}}>{detail.cover_emoji}</div>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,.45) 100%)"}}/>
          <div className="tap" onClick={()=>setDetail(null)} style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
            <span style={{fontSize:18,color:"#fff"}}>‹</span>
          </div>
          <div style={{position:"absolute",top:54,right:16}}>
            <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(12px)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#fff",fontWeight:700,fontFamily:FT}}>{isTour?detail.type?.toUpperCase():isMk?"МАСТЕР-КЛАСС":"СОБЫТИЕ"}</span>
            {toggleFav&&<div className="tap" onClick={()=>toggleFav(detail.id,detail.name_ru,detail.cover_emoji)} style={{marginLeft:8,width:32,height:32,borderRadius:16,background:"rgba(0,0,0,.2)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,color:favorites?.has(detail.id)?"#FF3B30":"rgba(255,255,255,.85)"}}>{favorites?.has(detail.id)?"♥":"♡"}</span></div>}
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
            <div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.4px",lineHeight:1.15}}>{isTour?detail.name_ru:isMk?detail.name_ru:detail.name_ru}</div>
            {dur && <div style={{fontSize:13,color:"rgba(255,255,255,.7)",fontFamily:FT,marginTop:4}}>{dur}{maxP?" · до "+maxP+" чел.":""}{detail.rating?" · ★ "+detail.rating:""}</div>}
          </div>
        </div>
        <div style={{padding:"20px"}}>
          {/* Description */}
          <div style={{fontSize:15,color:"var(--label2)",fontFamily:FT,lineHeight:1.6,marginBottom:20}}>{detail.description_ru}</div>

          {/* Info chips */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {dur && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>⏱</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{dur}</span></div>}
            {maxP && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>👥</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>до {maxP} чел.</span></div>}
            {detail.rating && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>⭐</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{detail.rating}</span></div>}
            {isMk && detail.min_age>0 && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>🧒</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>от {detail.min_age} лет</span></div>}
            {isMk && detail.location_ru && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>📍</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{detail.location_ru}</span></div>}
          </div>

          {/* Event specific: date */}
          {!isTour && !isMk && detail.starts_at && (
            <div style={{padding:"14px 16px",borderRadius:16,background:"var(--fill4)",border:"0.5px solid var(--sep)",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:24}}>📅</span>
              <div><div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FT}}>{new Date(detail.starts_at).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})}</div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{detail.location_ru}</div></div>
              {detail.is_free && <div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:8,background:"rgba(52,199,89,.1)"}}><span style={{fontSize:12,fontWeight:700,color:"#34C759",fontFamily:FT}}>Бесплатно</span></div>}
            </div>
          )}

          {/* Booking section */}
          {price>0 && (
            <div style={{padding:"20px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-md)"}}>
              <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:14}}>Записаться</div>
              {/* Persons selector */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:"0.5px solid var(--sep)"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Участников</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>1–{maxP||10} человек</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setPersons(Math.max(1,persons-1))} style={{width:34,height:34,borderRadius:17,background:persons>1?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:persons>1?"var(--label)":"var(--label4)"}}>−</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{persons}</span>
                  <div className="tap" onClick={()=>setPersons(Math.min(maxP||10,persons+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{price.toLocaleString("ru")} ₽ × {persons} чел.</span>
                <span style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{(price*persons).toLocaleString("ru")} ₽</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"0.5px solid var(--sep)"}}>
                <span style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT}}>Итого</span>
                <span style={{fontSize:24,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(price*persons).toLocaleString("ru")} ₽</span>
              </div>
              <div className="tap" onClick={()=>setShowBooking(true)} style={{marginTop:16,padding:"16px",borderRadius:16,background:color,textAlign:"center",boxShadow:"0 4px 16px "+color+"44"}}>
                <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{isMk?"Записаться на МК":"Забронировать"}</span>
              </div>
            </div>
          )}

          {showBooking && <BookingModal item={detail} type={detailType} total={price*persons} guests={persons} onClose={()=>setShowBooking(false)}/>}

          {/* Cross-sell */}
          <div style={{marginTop:16,borderRadius:16,padding:14,background:"rgba(0,122,255,.06)",border:"0.5px solid rgba(0,122,255,.15)"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--blue)",fontFamily:FT,marginBottom:4}}>Рекомендуем к проживанию</div>
            <div style={{display:"flex",gap:8}}>
              {["🍽️ Ужин в ресторане","🧖 СПА-программа","🗺️ Экскурсия"].map((t:string,i:number)=>(
                <span key={i} style={{padding:"4px 10px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep)",fontSize:12,color:"var(--label2)",fontFamily:FT}}>{t}</span>
              ))}
            </div>
          </div>
          {/* Phone */}
          <div className="tap" style={{marginTop:16,borderRadius:16,padding:"14px 16px",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:20}}>📞</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Вопросы по турам</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>+7 (495) 023-43-49</div></div>
            <Chev/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
      {/* HEADER */}
      <div style={{background:"var(--bg)"}}>
        <div style={{padding:"54px 20px 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Парк</div>
            <div className="tap" onClick={()=>onProfile?onProfile():null} style={{visibility:"hidden",width:0,height:0,overflow:"hidden",position:"absolute",background:"linear-gradient(145deg,#1B3A2A,#2D5A3D)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.12)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#fff"/></svg>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 20px 14px",overflowX:"auto"}}>
          {[["tickets","🎫","Билеты"],["tours","🌟","Туры"],["mk","🎓","Мастер-классы"],["events","🎉","События"],["excursions","🗺️","Экскурсии"],["museums","🏛️","Музеи"],["schedule","📋","Расписание"],["b2b","🤝","Для групп"]].map(([id,ic,label])=>(
            <div key={id} className="tap" id={"pill-"+id} onClick={()=>{if(id==="tickets"&&onBuyTicket){onBuyTicket();return;}setSec(id);}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:30,flexShrink:0,
                background:sec===id?"var(--label)":"var(--bg2)",
                border:"0.5px solid "+(sec===id?"var(--label)":"var(--sep-opaque)"),
                boxShadow:sec===id?"none":"var(--shadow-sm)"}}>
              <span style={{fontSize:14}}>{ic}</span>
              <span style={{fontSize:14,fontWeight:600,color:sec===id?"#fff":"var(--label)",fontFamily:FT}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? <Spinner/> : sec==="tickets" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Билеты в парк</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Выберите тип билета и приезжайте</div>
          {tours.map((t:any,i:number)=>(
            <div key={t.id} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{t.name_ru||t.name}</div>
                  <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4,lineHeight:1.5}}>{t.description_ru||t.description||"Входной билет в парк Этномир"}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                  <div style={{fontSize:22,fontWeight:700,color:"var(--green)",fontFamily:FD}}>{t.price||990} ₽</div>
                  <div style={{padding:"2px 8px",borderRadius:8,background:"rgba(52,199,89,.1)",marginTop:4,display:"inline-block"}}><span style={{fontSize:10,fontWeight:600,color:"var(--green)",fontFamily:FT}}>+30 очков</span></div>
                </div>
              </div>
              <div className="tap" style={{marginTop:12,borderRadius:12,background:"var(--blue)",height:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>Купить билет</span>
              </div>
            </div>
          ))}
        </div>
      ) : sec==="tours" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{tours.length}</span> туров и экскурсий</div>
          {tours.map((t:any,i:number)=>{
            const h = Math.floor(t.duration_minutes/60);
            const dur = t.duration_minutes>=1440?Math.floor(t.duration_minutes/1440)+" дн.":h>0?h+" ч.":t.duration_minutes+" мин.";
            const color = TC[t.type]||"#555";
            return (
              <div key={t.id} className={"tap fu s"+Math.min(i+1,6)} onClick={()=>openDetail(t,"tour")}
                style={{borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-card)",marginBottom:14}}>
                <div style={{padding:"16px",display:"flex",gap:14}}>
                  <div style={{width:56,height:56,borderRadius:16,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{t.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{t.name_ru}</div>
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <div style={{fontSize:17,fontWeight:700,color:color,fontFamily:FD}}>{t.price.toLocaleString("ru")} ₽</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:4}}>{dur} · до {t.max_participants} чел. · ★ {t.rating}</div>
                    <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:6,lineHeight:1.4}}>{t.description_ru?.slice(0,80)}...</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : sec==="mk" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{mk.length}</span> мастер-классов</div>
          {mk.map((m:any,i:number)=>(
            <div key={m.id} className={"tap fu s"+Math.min(i+1,6)} onClick={()=>openDetail(m,"mk")}
              style={{borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-card)",marginBottom:14}}>
              <div style={{padding:"16px",display:"flex",gap:14}}>
                <div style={{width:56,height:56,borderRadius:16,background:"rgba(175,82,222,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{m.cover_emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{m.name_ru}</div>
                    <div style={{fontSize:16,fontWeight:700,color:"#AF52DE",fontFamily:FD,flexShrink:0}}>{m.price} ₽</div>
                  </div>
                  <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:4}}>{m.location_ru} · {m.duration_min} мин. · +40 очков{m.min_age>0?" · от "+m.min_age+" лет":""}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sec==="events" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{events.length}</span> событий</div>
          {events.map((e:any,i:number)=>{
            const d = new Date(e.starts_at);
            const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
            const label = diff<=0?"Сегодня":diff===1?"Завтра":"Через "+diff+" дн.";
            return (
              <div key={e.id} className={"tap fu s"+Math.min(i+1,6)} onClick={()=>openDetail(e,"event")}
                style={{borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-card)",marginBottom:14}}>
                <div style={{padding:"16px",display:"flex",gap:14}}>
                  <div style={{width:56,height:56,borderRadius:16,background:"rgba(255,149,0,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{e.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{e.name_ru}</div>
                    <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:4}}>{e.location_ru}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                      <span style={{fontSize:12,color:"var(--blue)",fontWeight:600,fontFamily:FT}}>{label}</span>
                      {e.is_free ? <Bdg label="Бесплатно" color="#34C759"/> : e.price>0 ? <Bdg label={e.price.toLocaleString("ru")+" ₽"} color="var(--orange)"/> : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : sec==="excursions" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}>Тематические экскурсии по парку</div>
          {tours.length===0 && !loading && <div style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:8}}>🗺️</div><div style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Экскурсии загружаются...</div></div>}
          {tours.map((t:any,i:number)=>(
            <div key={t.id} className="tap" onClick={()=>openDetail(t,"tour")} style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{t.emoji||"🗺️"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{t.name_ru}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{t.duration_hours||2} ч. · до {t.max_group||20} чел.</div>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:"var(--green)",fontFamily:FT}}>{t.price} ₽</div><div style={{padding:"2px 6px",borderRadius:8,background:"rgba(52,199,89,.1)",marginTop:2}}><span style={{fontSize:10,fontWeight:600,color:"var(--green)",fontFamily:FT}}>+30</span></div>
            </div>
          ))}
        </div>
      ) : sec==="schedule" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Расписание на сегодня</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Что происходит в парке прямо сейчас</div>
          {events.map((s:any,i:number)=>{
            const now=new Date();
            const [h,m]=(s.time_start||"10:00").split(":");
            const st=new Date();st.setHours(+h,+m,0);
            const [h2,m2]=(s.time_end||"18:00").split(":");
            const en=new Date();en.setHours(+h2,+m2,0);
            const live=now>=st&&now<=en;
            return (
            <div key={s.id||i} className="tap" style={{borderRadius:14,background:live?"rgba(52,199,89,.06)":"var(--bg2)",border:live?"1.5px solid var(--green)":"0.5px solid var(--sep-opaque)",padding:"12px 14px",marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:50,textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:15,fontWeight:700,color:live?"var(--green)":"var(--label)",fontFamily:"monospace"}}>{(s.time_start||"10:00").slice(0,5)}</div>
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT}}>{(s.time_end||"").slice(0,5)}</div>
              </div>
              <div style={{width:2,height:36,borderRadius:1,background:live?"var(--green)":"var(--sep)",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{s.title_ru||s.name_ru||"Мероприятие"}</div>
                  {live && <div style={{padding:"1px 6px",borderRadius:6,background:"var(--green)"}}><span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:FT}}>LIVE</span></div>}
                </div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{s.location_ru||s.description_ru||""}</div>
              </div>
            </div>
          );})}
          {events.length===0 && !loading && <div style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:8}}>📋</div><div style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Расписание загружается...</div></div>}
        </div>
      ) : sec==="museums" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}>Музеи и выставки Этномира</div>
          {events.length===0 && !loading && <div style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:8}}>🏛️</div><div style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Музеи загружаются...</div></div>}
          {events.map((s:any,i:number)=>(
            <div key={s.id} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{s.emoji||"🏛️"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{s.name_ru}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{s.location_ru||"Улица Мира"}</div>
              </div>
              {s.price>0 && <div style={{fontSize:14,fontWeight:700,color:"var(--orange)",fontFamily:FT}}>{s.price} ₽</div>}
            </div>
          ))}
        </div>
      ) : null}

      {sec==='b2b' && (
        <div style={{padding:"0 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Для групп</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Программы для организованных групп</div>
          {b2bPrograms.map((p:any)=>({icon:p.cover_emoji,t:p.title,d:p.description_ru,tags:p.tags||[]})).map((item:any,j:number)=>(
            <div key={j} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:16,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{width:44,height:44,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22}}>{item.icon}</span></div>
                <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{item.t}</div>
              </div>
              <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{item.d}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {item.tags.map((tag:string,k:number)=>(<span key={k} style={{padding:"4px 10px",borderRadius:30,background:"var(--fill4)",fontSize:12,color:"var(--label2)",fontFamily:FT}}>{tag}</span>))}
              </div>
              <div className="tap" style={{borderRadius:10,background:"var(--blue)",height:40,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{submitContactRequest("b2b",item.t||"B2B");alert("Заявка отправлена! Менеджер свяжется с вами.");}}>
                <span style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>Оставить заявку</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ─── STAY ─────────────────────────────────────────────────
function StayTab({onSearch,favorites,toggleFav,onProfile,pendingSec,onClearPending}:{onSearch?:()=>void,favorites?:Set<string>,toggleFav?:(id:string)=>void,onProfile?:()=>void,pendingSec?:string,onClearPending?:()=>void}) {
  const [view, setView] = useState('hotels');
  const [detailSheet, setDetailSheet] = useState<any>(null);
  const [galIdx, setGalIdx] = useState(0);
  useEffect(()=>{setGalIdx(0);},[detailSheet]);useEffect(()=>{const tb=document.querySelector('.em-tabbar');if(tb)tb.style.display=detailSheet?'none':'';return()=>{const tb=document.querySelector('.em-tabbar');if(tb)tb.style.display='';};},[detailSheet]);
  useEffect(()=>{if(detailSheet)document.body.classList.add('ds-open');else document.body.classList.remove('ds-open');return()=>document.body.classList.remove('ds-open');},[detailSheet]);
  useEffect(()=>{if(pendingSec){setView(pendingSec);onClearPending&&onClearPending();setTimeout(()=>{const el=document.getElementById("pill-"+pendingSec);/* no scroll */;},100);}},[pendingSec]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [re, setRe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [guestSvcs, setGuestSvcs] = useState<any[]>([]);
  const [booked, setBooked] = useState(false);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [hotelPromos, setHotelPromos] = useState<any[]>([]);
  const [hotelReviews, setHotelReviews] = useState<any[]>([]);
  const [hotelNearby, setHotelNearby] = useState<any[]>([]);
  const [selRoomType, setSelRoomType] = useState<any>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);
  useEffect(()=>{const tb=document.querySelector('.em-tabbar') as any;if(tb)tb.style.display=selectedHotel?'none':'';return()=>{if(tb)tb.style.display='';};},[selectedHotel]);
  useEffect(()=>{if(!selectedHotel)return;const hid=selectedHotel.id;
    sb("room_types","select=*&hotel_id=eq."+hid+"&is_active=eq.true&order=sort_order.asc").then(d=>setRoomTypes(d||[]));
    sb("hotel_promos","select=*&is_active=eq.true&or=(hotel_id.eq."+hid+",hotel_id.is.null)&order=sort_order.asc").then(d=>setHotelPromos(d||[]));
    sb("hotel_reviews","select=*&hotel_id=eq."+hid+"&is_published=eq.true&order=created_at.desc&limit=10").then(d=>setHotelReviews(d||[]));
    sb("hotel_nearby","select=*&hotel_id=eq."+hid+"&is_active=eq.true&order=sort_order.asc").then(d=>setHotelNearby(d||[]));
  },[selectedHotel]);

  useEffect(()=>{
    setLoading(true);
    if(view==='guest') {
      sb('guest_services','select=*&is_active=eq.true&order=sort_order.asc').then(d=>{setGuestSvcs(d||[]);setLoading(false);});
    } else if(view==='hotels') {
      sb('hotels','select=*,cover_image_url&active=eq.true&order=rating.desc')
        .then(d=>{setHotels(d||[]);setLoading(false);});
    } else {
      sb('real_estate','select=*&is_published=eq.true&order=sort_order.asc')
        .then(d=>{setRe(d||[]);setLoading(false);});
    }
  },[view]);

  const TYPE_LABEL: Record<string,string> = {spa:'SPA-отель',glamping:'Глэмпинг',apart:'Апарт-отель',cottage:'Коттеджи',ethno:'Этно-отель'};
  const TYPE_COLOR: Record<string,string> = {spa:'#E91E63',glamping:'#4CAF50',apart:'#2196F3',cottage:'#8D6E63',ethno:'#FF9800'};
  const HOTEL_GRAD = [['#1a3a5c','#0d2240'],['#2C5F41','#1B3A2A'],['#5D3A1A','#3E2510'],['#4A2D6B','#2E1A4A'],['#8B3A3A','#5C1A1A'],['#1a4a6e','#0d2b4a'],['#3d5a1a','#2a4010'],['#6b2d4a','#4a1a2e'],['#1a5a5a','#0d3a3a'],['#5a4a1a','#3a3010']];
  const RE_STATUS: Record<string,{l:string,c:string}> = {available:{l:'В продаже',c:'#34C759'},few_left:{l:'Осталось мало',c:'#FF9500'},reserved:{l:'Бронь',c:'#007AFF'},sold:{l:'Продано',c:'#FF3B30'}};
  const RE_TYPE: Record<string,{l:string,e:string}> = {apartment:{l:'Апартаменты',e:'🏢'},villa:{l:'Вилла',e:'🏡'},commercial:{l:'Коммерция',e:'🏪'}};
  const ratingLabel = (r:number) => r>=4.8?'Превосходно':r>=4.5?'Великолепно':r>=4.0?'Очень хорошо':'Хорошо';
  const amenityIcon = (a:string) => {
    const m: Record<string,string> = {'Wi-Fi':'📶','Парковка':'🅿️','Кухня':'🍳','Камин':'🔥','Бассейн':'🏊','СПА':'💆','Хаммам':'🧖','Массаж':'💆','Кондиционер':'❄️','Балкон':'🌅','Ресторан':'🍽️','Завтрак':'☕','Холодильник':'🧊','Чайник':'☕','Баня':'♨️','Детская':'🧒'};
    for (const [k,v] of Object.entries(m)) { if (a.includes(k)) return v; }
    return '✓';
  };

  return (
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)',maxWidth:'100%'}}>
      {/* HEADER */}
      <div style={{background:'var(--bg)'}}>
        <div style={{padding:'54px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.8px'}}>Жильё</div>
            <div className="tap" onClick={()=>onProfile&&onProfile()} style={{visibility:"hidden",width:0,height:0,overflow:"hidden",position:"absolute",background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',boxShadow:'0 1px 4px rgba(0,0,0,0.12)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#fff"/></svg>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px',overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
          {[['hotels','🏨','Забронировать'],['guest','🛎️','Гостю'],['re','🏗️','Недвижимость']].map(([id,ic,label])=>(
            <div key={id} className="tap" id={"pill-"+id} onClick={()=>{setView(id);setSelectedHotel(null);setBooked(false);}}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:30,flexShrink:0,
                background:view===id?'var(--label)':'var(--bg2)',
                border:'0.5px solid '+(view===id?'var(--label)':'var(--sep-opaque)'),
                boxShadow:view===id?'none':'var(--shadow-sm)'}}>
              <span style={{fontSize:14}}>{ic}</span>
              <span style={{fontSize:14,fontWeight:600,color:view===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {view==='guest' ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Услуги для гостей</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Управляйте проживанием из приложения</div>
          {guestSvcs.map((gs:any)=>({icon:gs.cover_emoji,t:gs.title,d:gs.description_ru,time:gs.estimated_time||'',b:gs.bonus_points?"+"+gs.bonus_points:''})).map((item:any,j:number)=>(
            <div key={j} className="tap" onClick={()=>setDetailSheet({type:"gs",title:item.t,sub:item.d,price:item.time||"",badge:item.b?"+"+item.b+" баллов":"",desc:"",action:"Заказать услугу",actionKey:"gs_"+j})} style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center",cursor:"pointer"}}>
              <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{item.t}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{item.d}</div>
                <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:2}}>⏱ {item.time}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <div style={{padding:"3px 8px",borderRadius:8,background:"rgba(52,199,89,.1)"}}><span style={{fontSize:11,fontWeight:600,color:"var(--green)",fontFamily:FT}}>{item.b}</span></div>
                <span onClick={(ev:any)=>{ev.stopPropagation();submitContactRequest('guest',item.t);alert('Заявка отправлена!');}} style={{fontSize:17,color:"var(--label4)",cursor:'pointer'}}>›</span>
              </div>
            </div>
          ))}
          <div style={{padding:14,borderRadius:14,background:"rgba(0,122,255,.06)",border:"0.5px solid rgba(0,122,255,.12)",marginTop:4}}>
            <div style={{fontSize:13,color:"var(--blue)",fontFamily:FT,textAlign:"center"}}>Доступно для гостей с активным бронированием</div>
          </div>
        </div>
      ) : selectedHotel ? (
        /* ═══ HOTEL DETAIL VIEW ═══ */
        <div style={{padding:"0",paddingBottom:100}}>
          {/* Back + Hero Gallery */}
          {(()=>{
            const allImgs=[selectedHotel.cover_image_url,...(selectedHotel.images||[])].filter(Boolean);
            const touchRef={startX:0,startY:0,swiping:false};
            return <div style={{position:"relative",height:260,background:"#1a1a1a",overflow:"hidden",touchAction:"pan-y"}}>
              {/* Gallery strip */}
              <div style={{display:"flex",width:allImgs.length*100+"%",height:"100%",transform:"translateX(-"+(galIdx*(100/allImgs.length))+"%)",transition:"transform .35s cubic-bezier(.2,.8,.2,1)"}}
                onTouchStart={(e:any)=>{touchRef.startX=e.touches[0].clientX;touchRef.startY=e.touches[0].clientY;touchRef.swiping=false;}}
                onTouchMove={(e:any)=>{const dx=Math.abs(e.touches[0].clientX-touchRef.startX);const dy=Math.abs(e.touches[0].clientY-touchRef.startY);if(dx>dy&&dx>10)touchRef.swiping=true;}}
                onTouchEnd={(e:any)=>{if(!touchRef.swiping)return;const dx=e.changedTouches[0].clientX-touchRef.startX;if(dx<-40&&galIdx<allImgs.length-1)setGalIdx(galIdx+1);if(dx>40&&galIdx>0)setGalIdx(galIdx-1);}}>
                {allImgs.map((src:string,i:number)=>(
                  <div key={i} style={{width:100/allImgs.length+"%",height:"100%",flexShrink:0,backgroundImage:"url("+src+")",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"}}/>
                ))}
              </div>
              {/* Left/Right arrows */}
              {allImgs.length>1&&galIdx>0&&<div className="tap" onClick={()=>setGalIdx(galIdx-1)} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.4)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,cursor:"pointer"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></div>}
              {allImgs.length>1&&galIdx<allImgs.length-1&&<div className="tap" onClick={()=>setGalIdx(galIdx+1)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.4)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,cursor:"pointer"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>}
              {/* Counter badge (Booking-style) */}
              {allImgs.length>1&&<div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,.55)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderRadius:12,padding:"4px 10px",display:"flex",alignItems:"center",gap:6,zIndex:5}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" stroke="#fff" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="2" fill="#fff"/><path d="M2 17l5-5 3 3 4-4 8 8v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-3z" fill="rgba(255,255,255,.6)"/></svg>
                <span style={{fontSize:12,fontWeight:600,color:"#fff",fontFamily:FT}}>{galIdx+1} / {allImgs.length}</span>
              </div>}
              {/* Dot indicators */}
              {allImgs.length>1&&allImgs.length<=10&&<div style={{position:"absolute",bottom:44,left:0,right:0,display:"flex",justifyContent:"center",gap:5,zIndex:5}}>{allImgs.map((_:any,i:number)=>(<div key={i} style={{width:i===galIdx?18:6,height:6,borderRadius:3,background:i===galIdx?"#fff":"rgba(255,255,255,.45)",transition:"all .3s ease"}}/>))}</div>}
              {/* Back button */}
              <div className="tap" onClick={()=>{setSelectedHotel(null);setGalIdx(0);}}
                style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.35)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
                <span style={{fontSize:18,color:"#fff"}}>‹</span>
              </div>
              {/* Fav + Share */}
              <div style={{position:"absolute",top:54,right:16,display:"flex",gap:8,zIndex:10}}>
                <div className="tap" style={{width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.35)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:16,color:"#fff"}}>♡</span>
                </div>
                <div className="tap" style={{width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.35)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:14,color:"#fff"}}>↗</span>
                </div>
              </div>
              {/* Rating badge */}
              <div style={{position:"absolute",bottom:16,right:16,display:"flex",alignItems:"center",gap:8,zIndex:5}}>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:FT,textShadow:"0 1px 3px rgba(0,0,0,.5)"}}>{parseFloat(selectedHotel.rating)>=4.8?"Превосходно":parseFloat(selectedHotel.rating)>=4.5?"Великолепно":"Очень хорошо"}</div>
                </div>
                <div style={{width:40,height:40,borderRadius:"12px 12px 12px 2px",background:"#003580",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.3)"}}>
                  <span style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:FD}}>{(parseFloat(selectedHotel.rating)*2).toFixed(1)}</span>
                </div>
              </div>
              {/* Rooms badge */}
              <div style={{position:"absolute",bottom:16,left:16,zIndex:5}}>
                <span style={{background:"rgba(0,0,0,.45)",backdropFilter:"blur(12px)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#fff",fontWeight:700,fontFamily:FT}}>{selectedHotel.rooms_count} номеров</span>
              </div>
            </div>;
          })()}
          <div style={{padding:"20px"}}>
            {/* Name + type */}
            <div style={{fontSize:26,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.2}}>{selectedHotel.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
              <span style={{fontSize:12}}>📍</span>
              <span style={{fontSize:14,color:"var(--blue)",fontFamily:FT,fontWeight:500}}>Этномир · Калужская обл.</span>
            </div>
            {/* Description */}
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:14,lineHeight:1.55}}>{selectedHotel.description}</div>
            {/* Amenities full list */}
            <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginTop:20,marginBottom:10}}>Удобства</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {(selectedHotel.amenities||[]).map((a:string)=>(
                <div key={a} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)"}}>
                  <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{a}</span>
                </div>
              ))}
            </div>
            {/* Check-in / Check-out */}
            <div style={{display:"flex",gap:12,marginTop:16}}>
              <div style={{flex:1,padding:"14px",borderRadius:16,background:"var(--bg)",border:"0.5px solid var(--sep-opaque)",textAlign:"center"}}>
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>Заезд</div>
                <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginTop:4}}>{selectedHotel.check_in}</div>
              </div>
              <div style={{flex:1,padding:"14px",borderRadius:16,background:"var(--bg)",border:"0.5px solid var(--sep-opaque)",textAlign:"center"}}>
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>Выезд</div>
                <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginTop:4}}>{selectedHotel.check_out}</div>
              </div>
            </div>
            {selectedHotel.allows_pets && <div style={{marginTop:10,padding:"10px 14px",borderRadius:12,background:"rgba(52,199,89,.06)",border:"0.5px solid rgba(52,199,89,.15)",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>🐾</span>
              <span style={{fontSize:13,fontWeight:600,color:"#34C759",fontFamily:FT}}>Можно с домашними питомцами</span>
            </div>}
            {/* Included */}
            <div style={{marginTop:16,padding:"16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Включено в стоимость</div>
              {["Входные билеты в парк на все дни","Парковка на территории","Развлекательная программа","Wi-Fi на всей территории"].map((it,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:i<3?"0.5px solid var(--fill3)":"none"}}>
                  <span style={{fontSize:13,color:"#34C759"}}>✓</span>
                  <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{it}</span>
                </div>
              ))}
            </div>{/* Booking section */}
            <div style={{marginTop:20,padding:"20px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-md)"}}>
              <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:14}}>Бронирование</div>
              {/* Nights selector */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Ночей</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>1–14 ночей</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setNights(Math.max(1,nights-1))} style={{width:34,height:34,borderRadius:17,background:nights>1?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:nights>1?"var(--label)":"var(--label4)"}}>−</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{nights}</span>
                  <div className="tap" onClick={()=>setNights(Math.min(14,nights+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              {/* Guests selector */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:"0.5px solid var(--sep)"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Гостей</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>1–6 человек</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setGuests(Math.max(1,guests-1))} style={{width:34,height:34,borderRadius:17,background:guests>1?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:guests>1?"var(--label)":"var(--label4)"}}>−</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{guests}</span>
                  <div className="tap" onClick={()=>setGuests(Math.min(6,guests+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              {/* Price calculation */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{selectedHotel.price_from?.toLocaleString("ru")} ₽ × {nights} ноч.</span>
                <span style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{(selectedHotel.price_from*nights)?.toLocaleString("ru")} ₽</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>Билеты в парк (вкл.)</span>
                <span style={{fontSize:14,fontWeight:600,color:"#34C759",fontFamily:FT}}>0 ₽</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"0.5px solid var(--sep)"}}>
                <span style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT}}>Итого</span>
                <span style={{fontSize:24,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(selectedHotel.price_from*nights)?.toLocaleString("ru")} ₽</span>
              </div>
              {/* Book button */}
              <div className="tap" onClick={()=>setBooked(true)} style={{marginTop:16,padding:"16px",borderRadius:16,background:"#003580",textAlign:"center",boxShadow:"0 4px 16px rgba(0,53,128,.3)"}}>
                <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>Забронировать</span>
              </div>
              <div style={{textAlign:"center",marginTop:8}}>
                <span style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>Бесплатная отмена за 48 часов</span>
              </div>
            </div>
            
            {/* ═══ TAGLINE + STARS ═══ */}
            <div style={{marginTop:20}}></div>
            {selectedHotel.tagline&&<div style={{marginTop:-8,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13,color:"#FF9500",letterSpacing:"1px"}}>{"⭐".repeat(selectedHotel.stars||4)}</span><span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{selectedHotel.tagline}</span></div>}
            {selectedHotel.ideal_for&&selectedHotel.ideal_for.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>{selectedHotel.ideal_for.map((t:string,i:number)=>(<span key={i} style={{padding:"4px 10px",borderRadius:20,background:"rgba(0,122,255,.08)",border:"0.5px solid rgba(0,122,255,.15)",fontSize:12,fontWeight:500,color:"var(--blue)",fontFamily:FT}}>{t}</span>))}</div>}
            {/* ═══ PROMOS ═══ */}
            {hotelPromos.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Скидки и акции</div>{hotelPromos.map((p:any)=>(<div key={p.id} style={{padding:"12px 14px",borderRadius:14,background:"linear-gradient(135deg,rgba(255,149,0,.08),rgba(255,204,0,.08))",border:"0.5px solid rgba(255,149,0,.2)",marginBottom:8,display:"flex",alignItems:"center",gap:10}}><div style={{width:40,height:40,borderRadius:12,background:"rgba(255,149,0,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16,fontWeight:700,color:"#FF9500",fontFamily:FD}}>-{p.discount_percent}%</span></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{p.title}</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{p.conditions}</div></div></div>))}</div>}
            {/* ═══ ROOM TYPES ═══ */}
            {roomTypes.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Категории номеров</div>{roomTypes.map((rt:any)=>(<div key={rt.id} className="tap" onClick={()=>setSelRoomType(selRoomType?.id===rt.id?null:rt)} style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid "+(selRoomType?.id===rt.id?"var(--blue)":"var(--sep-opaque)"),boxShadow:selRoomType?.id===rt.id?"0 0 0 1px var(--blue)":"var(--shadow-sm)",marginBottom:12,overflow:"hidden"}}>
              {rt.cover_image_url&&<div style={{height:140,background:"url("+rt.cover_image_url+") center/cover",position:"relative"}}><div style={{position:"absolute",top:10,left:10}}><span style={{background:rt.category==="family"?"#34C759":rt.category==="comfort"?"#007AFF":"#8E8E93",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,color:"#fff",fontFamily:FT}}>{rt.category==="family"?"Семейный":rt.category==="comfort"?"Комфорт":rt.category==="suite"?"Люкс":"Стандарт"}</span></div></div>}
              <div style={{padding:14}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{rt.name}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                  {rt.area_sqm&&<span style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>📐 {rt.area_sqm} м²</span>}
                  <span style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>👤 до {rt.max_guests} гостей</span>
                  {rt.has_balcony&&<span style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>🏖️ Балкон</span>}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
                  <div><span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{rt.price_weekday?.toLocaleString("ru")}</span><span style={{fontSize:13,color:"var(--label3)",fontFamily:FT}}> ₽/ночь</span></div>
                  <div style={{padding:"6px 14px",borderRadius:10,background:selRoomType?.id===rt.id?"var(--blue)":"var(--fill4)"}}><span style={{fontSize:13,fontWeight:600,color:selRoomType?.id===rt.id?"#fff":"var(--blue)",fontFamily:FT}}>{selRoomType?.id===rt.id?"Выбрано":"Выбрать"}</span></div>
                </div>
                {selRoomType?.id===rt.id&&<div style={{marginTop:12,paddingTop:12,borderTop:"0.5px solid var(--sep)"}}>
                  {rt.description&&<div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{rt.description}</div>}
                  {rt.beds&&<div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Кровати: </span>{rt.beds.map((b:any,i:number)=>(<span key={i} style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>{b.count}x {b.type==="double"?"двусп.":b.type==="single"?"односп.":b.type==="sofa"?"диван":b.type}{i<rt.beds.length-1?", ":""}</span>))}</div>}
                  {rt.kitchen&&rt.kitchen.has_kitchen&&<div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Кухня: </span><span style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>{rt.kitchen.items?.join(", ")}</span></div>}
                  {rt.bathroom&&<div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Ванная: </span><span style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>{rt.bathroom.items?.join(", ")}</span></div>}
                  {rt.amenities&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>{rt.amenities.map((a:string,i:number)=>(<span key={i} style={{padding:"3px 8px",borderRadius:8,background:"var(--fill4)",fontSize:11,color:"var(--label2)",fontFamily:FT}}>{a}</span>))}</div>}
                </div>}
              </div>
            </div>))}</div>}
            {/* ═══ PAID SERVICES ═══ */}
            {selectedHotel.paid_services&&selectedHotel.paid_services.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Доп. платные услуги</div><div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>{selectedHotel.paid_services.map((s:any,i:number)=>(<div key={i} style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:i<selectedHotel.paid_services.length-1?"0.5px solid var(--sep)":"none"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,color:"var(--label)",fontFamily:FT}}>{s.name}</div>{s.note&&<div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{s.note}</div>}</div><span style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FD,flexShrink:0,marginLeft:8}}>{s.price?.toLocaleString("ru")} ₽</span></div>))}</div></div>}
            {/* ═══ BOOKING RULES ═══ */}
            {selectedHotel.booking_rules&&selectedHotel.booking_rules.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Правила бронирования</div><div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>{selectedHotel.booking_rules.map((r:any,i:number)=>(<div key={i} style={{padding:"12px 14px",borderBottom:i<selectedHotel.booking_rules.length-1?"0.5px solid var(--sep)":"none"}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{r.title}</div><div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{r.text}</div></div>))}</div></div>}
            {/* ═══ NEARBY ═══ */}
            {hotelNearby.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Рядом находятся</div><div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>{hotelNearby.map((n:any,i:number)=>(<div key={n.id} style={{padding:"12px 14px",display:"flex",gap:10,alignItems:"center",borderBottom:i<hotelNearby.length-1?"0.5px solid var(--sep)":"none"}}><span style={{fontSize:20,flexShrink:0}}>{n.icon_emoji}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:500,color:"var(--label)",fontFamily:FT}}>{n.name}</div>{n.description&&<div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{n.description}</div>}</div>{n.walk_minutes&&<span style={{fontSize:11,color:"var(--label3)",fontFamily:FT,flexShrink:0}}>{n.walk_minutes} мин</span>}</div>))}</div></div>}
            {/* ═══ FULL DESCRIPTION ═══ */}
            {selectedHotel.full_description&&<div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Подробнее об отеле</div><div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.6}}>{expandDesc?selectedHotel.full_description:selectedHotel.full_description.slice(0,200)+"..."}</div>{selectedHotel.full_description.length>200&&<div className="tap" onClick={()=>setExpandDesc(!expandDesc)} style={{marginTop:6}}><span style={{fontSize:13,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>{expandDesc?"Свернуть":"Читать дальше"}</span></div>}{selectedHotel.classification_number&&<div style={{marginTop:8,fontSize:11,color:"var(--label4)",fontFamily:FT}}>{"№ в реестре: "+selectedHotel.classification_number}</div>}</div>}
            {/* ═══ REVIEWS ═══ */}
            {hotelReviews.length>0&&<div style={{marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT}}>Отзывы</div><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:32,height:32,borderRadius:"10px 10px 10px 2px",background:"#003580",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:FD}}>{(hotelReviews.reduce((a:number,r:any)=>a+parseFloat(r.rating),0)/hotelReviews.length*2).toFixed(1)}</span></div><span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{hotelReviews.length} отз.</span></div></div>{hotelReviews.slice(0,3).map((rv:any)=>(<div key={rv.id} style={{padding:14,borderRadius:14,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:28,height:28,borderRadius:14,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(rv.author_name||"?")[0]}</span></div><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{rv.author_name}</span></div><span style={{fontSize:12,fontWeight:700,color:"#003580",fontFamily:FD}}>{(parseFloat(rv.rating)*2).toFixed(1)}</span></div>{rv.title&&<div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:4}}>{rv.title}</div>}{rv.text&&<div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,lineHeight:1.5}}>{rv.text}</div>}{rv.pros&&<div style={{marginTop:6,fontSize:12,color:"#34C759",fontFamily:FT}}>{"👍 "+rv.pros}</div>}</div>))}</div>}
            {/* ═══ OTHER HOTELS ═══ */}
            {hotels.length>1&&<div style={{marginBottom:20}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Другие отели</div><div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>{hotels.filter((h:any)=>h.id!==selectedHotel.id).slice(0,5).map((h:any)=>(<div key={h.id} className="tap" onClick={()=>{setSelectedHotel(h);setGalIdx(0);setSelRoomType(null);setExpandDesc(false);setTimeout(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;document.querySelectorAll('div').forEach(el=>{if(el.scrollHeight>el.clientHeight+50)el.scrollTop=0;});},30);}} style={{minWidth:160,borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",flexShrink:0}}><div style={{height:90,background:h.cover_image_url?"url("+h.cover_image_url+") center/cover":"var(--fill4)"}}/><div style={{padding:"8px 10px"}}><div style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT,lineHeight:1.2}}>{h.name}</div><div style={{fontSize:12,color:"var(--blue)",fontFamily:FD,marginTop:4}}>{"от "+h.price_from?.toLocaleString("ru")+" ₽"}</div></div></div>))}</div></div>}
            
            {/* Phone help */}
            <div className="tap" style={{marginTop:16,borderRadius:16,padding:"14px 16px",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:20}}>📞</span>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Помощь с бронированием</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>+7 (495) 023-43-49 · 9:00–21:00</div></div>
              <Chev/>
            </div>
          </div>
          {/* Floating Liquid Glass CTA */}
          {!booked&&(<div style={{position:"fixed",bottom:34,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 80px)",maxWidth:310,zIndex:300,padding:"10px 16px",background:"rgba(255,255,255,0.18)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.4)",borderRadius:22,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FD}}>от {(selectedHotel.price_from*nights)?.toLocaleString("ru")} ₽</div>
              <div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,marginTop:1}}>{nights} ноч. · {guests} гост.</div>
            </div>
            <div className="tap" onClick={()=>setBooked(true)} style={{padding:"8px 18px",height:34,borderRadius:17,background:"#003580",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FT,whiteSpace:"nowrap"}}>Забронировать</span>
            </div>
          </div>)}
          {booked && <BookingModal item={{...selectedHotel,_nights:nights}} type="hotel" total={selectedHotel.price_from*nights} guests={guests} onClose={()=>setBooked(false)}/>}
        </div>
      ) : loading ? <Spinner/> : view==='hotels' ? (
        <div style={{padding:'14px 20px'}}>
          {/* SEARCH BAR */}
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)',padding:'14px 16px',marginBottom:16}}>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:16}}>📅</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Даты проживания</div>
                <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:1}}>Заезд 14:00 · Выезд 12:00</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>Заезд</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginTop:2}}>Выбрать</div>
              </div>
              <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>Выезд</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginTop:2}}>Выбрать</div>
              </div>
              <div style={{width:70,padding:'10px 8px',borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)',textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>Гости</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginTop:2}}>2</div>
              </div>
            </div>
          </div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}>Найдено <span style={{fontWeight:700,color:'var(--label)'}}>{hotels.length}</span> вариантов размещения</div>

          {/* HOTEL CARDS - Booking.com */}
          {hotels.map((h:any,i:number)=>{
            const g = HOTEL_GRAD[i % HOTEL_GRAD.length];
            const tc = TYPE_COLOR[h.type]||'#888';
            const amenities = (h.amenities||[]).slice(0,5);
            const rScore = parseFloat(h.rating)||4.5;
            const rDisp = (rScore * 2).toFixed(1);
            return (
              <div key={h.id} className={`fu s${Math.min(i+1,6)}`} style={{borderRadius:30,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-md)',marginBottom:16,width:"100%"}}>
                {/* Photo */}
                <div style={{height:180,background:h.cover_image_url?`url(${h.cover_image_url}) center/cover no-repeat`:`linear-gradient(145deg,${g[0]},${g[1]})`,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',inset:0,opacity:.06,backgroundImage:'radial-gradient(circle at 30% 40%, white 1px, transparent 1px),radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',backgroundSize:'40px 40px'}}/>
                  {toggleFav && <div className="tap" onClick={(e:any)=>{e.stopPropagation();toggleFav(h.id);}} style={{position:'absolute',top:14,right:14,width:32,height:32,borderRadius:16,background:'rgba(0,0,0,.2)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}><span style={{fontSize:16,color:favorites?.has(h.id)?"#FF3B30":"rgba(255,255,255,.85)"}}>{favorites?.has(h.id)?"♥":"♡"}</span></div>}
                  <div style={{position:'absolute',top:14,left:14,display:'flex',gap:6}}>
                    <span style={{background:tc,borderRadius:6,padding:'4px 10px',fontSize:11,color:'#fff',fontWeight:700,fontFamily:FT,letterSpacing:'.2px'}}>{TYPE_LABEL[h.type]||h.type}</span>
                    {rScore>=4.8 && <span style={{background:'rgba(255,255,255,.18)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',borderRadius:6,padding:'4px 10px',fontSize:11,color:'#fff',fontWeight:700,fontFamily:FT}}>⭐ Топ</span>}
                  </div>
                  <div style={{position:'absolute',top:14,right:14,display:'flex',alignItems:'center',gap:8}}>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>{ratingLabel(rScore)}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.65)',fontFamily:FT}}>{h.rooms_count} номеров</div>
                    </div>
                    <div style={{width:38,height:38,borderRadius:'10px 10px 10px 2px',background:'#003580',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FD}}>{rDisp}</span>
                    </div>
                  </div>
                  <div className="tap" style={{position:'absolute',bottom:14,right:14,width:34,height:34,borderRadius:17,background:'rgba(0,0,0,.3)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:16}}>♡</span>
                  </div>
                  <div style={{position:'absolute',bottom:14,left:14,background:'rgba(0,0,0,.45)',backdropFilter:'blur(8px)',borderRadius:8,padding:'4px 10px',display:'flex',alignItems:'center',gap:4}}>
                    {!h.cover_image_url&&<span style={{fontSize:11,color:'#fff',fontFamily:FT}}>📷 Фото скоро</span>}
                  </div>
                </div>
                {/* Content */}
                <div style={{padding:'16px'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',lineHeight:1.2}}>{h.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:4,marginTop:5}}>
                    <span style={{fontSize:12}}>📍</span>
                    <span style={{fontSize:13,color:'var(--blue)',fontFamily:FT,fontWeight:500}}>Этномир · Калужская обл.</span>
                  </div>
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:8,lineHeight:1.45}}>{h.description?.slice(0,110)}{h.description?.length>110?'…':''}</div>
                  <div style={{display:'flex',gap:6,marginTop:12,flexWrap:'wrap'}}>
                    {amenities.map((a:string)=>(
                      <div key={a} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:10,background:'var(--fill4)',border:'0.5px solid var(--sep)'}}>
                        <span style={{fontSize:12}}>{amenityIcon(a)}</span>
                        <span style={{fontSize:11,fontWeight:500,color:'var(--label2)',fontFamily:FT}}>{a}</span>
                      </div>
                    ))}
                    {(h.amenities||[]).length > 5 && (
                      <div style={{padding:'5px 10px',borderRadius:10,background:'rgba(0,122,255,.06)',border:'0.5px solid rgba(0,122,255,.15)'}}>
                        <span style={{fontSize:11,fontWeight:600,color:'var(--blue)',fontFamily:FT}}>+{(h.amenities||[]).length-5}</span>
                      </div>
                    )}
                  </div>
                  <div style={{marginTop:12,padding:'10px 12px',borderRadius:12,background:'var(--bg)',display:'flex',gap:16}}>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Заезд</span>
                      <span style={{fontSize:12,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{h.check_in}</span>
                    </div>
                    <div style={{width:'0.5px',background:'var(--sep)'}}/>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Выезд</span>
                      <span style={{fontSize:12,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{h.check_out}</span>
                    </div>
                    {h.allows_pets && <>
                      <div style={{width:'0.5px',background:'var(--sep)'}}/>
                      <span style={{fontSize:11,color:'#34C759',fontWeight:600,fontFamily:FT}}>🐾 С питомцами</span>
                    </>}
                  </div>
                  <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:14,paddingTop:14,borderTop:'0.5px solid var(--sep)'}}>
                    <div>
                      <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>от</div>
                      <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                        <span style={{fontSize:26,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.5px'}}>{h.price_from?.toLocaleString('ru')}</span>
                        <span style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>₽</span>
                      </div>
                      <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>за ночь · вкл. билеты в парк</div>
                    </div>
                    <div className="tap" onClick={()=>{setSelectedHotel(h);setGalIdx(0);setSelRoomType(null);setExpandDesc(false);setTimeout(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;document.querySelectorAll('div').forEach(el=>{if(el.scrollHeight>el.clientHeight+50)el.scrollTop=0;});},30);}} style={{padding:'13px 24px',borderRadius:14,background:'#003580',boxShadow:'0 2px 8px rgba(0,53,128,.3)',cursor:'pointer'}}>
                      <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>Выбрать</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)',padding:'16px',marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT,marginBottom:10}}>Включено в стоимость проживания</div>
            {['Входные билеты в парк на все дни проживания','Парковка на территории парка','Развлекательная программа','Wi-Fi на всей территории','Детские площадки и общ. зоны'].map((it,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'center',padding:'6px 0',borderBottom:i<4?'0.5px solid var(--fill3)':'none'}}>
                <span style={{fontSize:14,color:'#34C759'}}>✓</span>
                <span style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>{it}</span>
              </div>
            ))}
          </div>
          <div className="tap" style={{borderRadius:16,background:'linear-gradient(145deg,#003580,#00224e)',padding:'18px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.1}}>📞</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>Нужна помощь с выбором?</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.65)',fontFamily:FT,marginTop:4}}>Позвоните: +7 (495) 023-43-49</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:2}}>Ежедневно 9:00–21:00</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 20px',overflow:"hidden",width:"100%",boxSizing:"border-box"}}>
          <div style={{borderRadius:16,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'16px',marginBottom:16,position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.12)'}}>
            <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.06}}>🏗️</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>Ethnomir DEVELOPMENT</div>
              <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4,letterSpacing:'-.3px'}}>Инвестируй в Этномир</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:6,lineHeight:1.4}}>Апартаменты, виллы и коммерческие площади в уникальном парке</div>
              <div style={{display:'flex',gap:16,marginTop:14,flexWrap:"wrap"}}>
                {[['ROI','до 22%'],['Заезд','2026'],['Доход','от 83K₽/мес']].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{re.length}</span> объектов в продаже</div>
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
            {re.map((r:any,i:number)=>{
              const rt=RE_TYPE[r.type]||RE_TYPE.apartment;
              return (
                <div key={r.id} className="tap" onClick={()=>setDetailSheet({type:"re",title:r.name_ru,sub:(r.area_m2||"")+" м² · "+(r.rooms||1)+" комн.",price:(r.price/1000000).toFixed(1)+" млн ₽",badge:"ROI "+(r.roi_percent||18)+"%",desc:r.description_ru||"Инвестиционный объект на территории парка Этномир.",action:"Оставить заявку",actionKey:"re_"+r.id})} style={{display:"flex",gap:14,padding:"14px 16px",borderBottom:i<re.length-1?"0.5px solid var(--sep)":"none",alignItems:"center",cursor:"pointer"}}>
                  <div style={{width:48,height:48,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:24}}>{rt.e}</span></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name_ru}</div>
                    <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{r.area_m2} м² · {r.rooms||1} комн.</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(r.price/1000000).toFixed(1)} млн</div>
                    <div style={{fontSize:10,color:"var(--green)",fontFamily:FT,marginTop:2}}>ROI {r.roi_percent||18}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="tap" onClick={()=>window.open("tel:+74950234349")} style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:"14px 16px",marginTop:12,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:40,height:40,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>📞</span></div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Нужна помощь с выбором?</div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>+7 (495) 023-43-49 · 9:00–21:00</div>
            </div>
            <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
          </div>
        </div>
      )}



      {detailSheet&&(
        <div style={{position:"fixed",inset:0,zIndex:250,background:"var(--bg)",overflow:"auto",display:"flex",justifyContent:"center"}}>
          <div style={{width:"100%",maxWidth:390}}>
            <div style={{position:"relative",height:260}}>
              <div style={{display:"flex",overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",height:260,scrollbarWidth:"none",msOverflowStyle:"none"}} className="hide-scrollbar" onScroll={(e:any)=>{const el=e.target;const w=el.offsetWidth;if(w>0)setGalIdx(Math.round(el.scrollLeft/w));}}>
                {(function(){const imgs=[detailSheet.cover_image_url,...(detailSheet.images||[])].filter(Boolean);return imgs.length>0?imgs.map((img:string,i:number)=>(<div key={i} style={{minWidth:"100%",height:260,background:"url("+img+") center/cover no-repeat",scrollSnapAlign:"start",flexShrink:0}}/>)):[<div key="fb" style={{minWidth:"100%",height:260,background:detailSheet.type==="re"?"linear-gradient(145deg,#1a3a5c,#0d2240)":"linear-gradient(145deg,#2d5016,#1a3a0a)"}}/>];})()}
              </div>
              <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
              <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"radial-gradient(circle at 30% 40%, white 1px, transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:1}}/>
              {(function(){const imgs=[detailSheet.cover_image_url,...(detailSheet.images||[])].filter(Boolean);return imgs.length>1?<div style={{position:"absolute",bottom:52,left:0,right:0,display:"flex",justifyContent:"center",gap:5,zIndex:5}}>{imgs.map((_:any,i:number)=>(<div key={i} style={{width:i===galIdx?18:6,height:6,borderRadius:3,background:i===galIdx?"#fff":"rgba(255,255,255,.4)",transition:"all .3s"}}/>))}</div>:null;})()}
              <div className="tap" onClick={()=>setDetailSheet(null)} style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
                <span style={{fontSize:18,color:"#fff"}}>{"‹"}</span>
              </div>
              <div style={{position:"absolute",bottom:24,left:20,right:20}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:FT}}>{detailSheet.type==="re"?"\u041D\u0415\u0414\u0412\u0418\u0416\u0418\u041C\u041E\u0421\u0422\u042C":"\u0423\u0421\u041B\u0423\u0413\u0410"}</div>
                <div style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.1,marginTop:6}}>{detailSheet.title}</div>
              </div>
            </div>
            <div style={{padding:"20px 20px 140px"}}>
              {detailSheet.sub&&<div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{detailSheet.sub}</div>}
              {detailSheet.desc&&<div style={{fontSize:15,color:"var(--label2)",fontFamily:FT,lineHeight:1.65,marginBottom:20}}>{detailSheet.desc}</div>}
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24}}>
                {detailSheet.price&&<div style={{padding:"8px 16px",borderRadius:20,background:"var(--blue)",color:"#fff",fontSize:15,fontWeight:600}}>{detailSheet.price}</div>}
                {detailSheet.badge&&<div style={{padding:"8px 16px",borderRadius:20,background:"rgba(52,199,89,.12)",color:"#34C759",fontSize:14,fontWeight:600}}>{detailSheet.badge}</div>}
              </div>
              <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
                <div style={{padding:"14px 16px",borderBottom:"0.5px solid var(--sep)"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{detailSheet.type==="re"?"\u041F\u0420\u0415\u0418\u041C\u0423\u0429\u0415\u0421\u0422\u0412\u0410":"\u0427\u0422\u041E \u0412\u041A\u041B\u042E\u0427\u0415\u041D\u041E"}</div>
                </div>
                {(detailSheet.type==="re"?["\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043E\u0442\u0434\u0435\u043B\u043A\u0430 \u043F\u043E\u0434 \u043A\u043B\u044E\u0447","\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0430\u044F \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u044F \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430","\u0414\u043E\u0445\u043E\u0434 \u043E\u0442 \u0430\u0440\u0435\u043D\u0434\u044B \u0441 1 \u0434\u043D\u044F","\u0418\u043D\u0444\u0440\u0430\u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u043F\u0430\u0440\u043A\u0430 24/7","\u041F\u0430\u0440\u043A\u043E\u0432\u043A\u0430, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u044B, \u0421\u041F\u0410"]:
                ["\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0432 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 \u0441\u0440\u043E\u043A","\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B","\u0411\u043E\u043D\u0443\u0441\u043D\u044B\u0435 \u0431\u0430\u043B\u043B\u044B \u043D\u0430 \u0441\u0447\u0451\u0442","\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438"]).map((b:any,bi:number)=>(
                  <div key={bi} style={{padding:"12px 16px",borderBottom:bi<4?"0.5px solid var(--sep)":"none",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{color:"#34C759",fontSize:16,fontWeight:700}}>{"\u2713"}</span>
                    <span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{b}</span>
                  </div>
                ))}
              </div>
              {detailSheet.type==="re"&&<div style={{marginTop:20,padding:16,borderRadius:16,background:"rgba(0,122,255,.06)",border:"0.5px solid rgba(0,122,255,.15)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>{"\u0418\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u043A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440"}</div>
                <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:6,lineHeight:1.5}}>{"\u041F\u0440\u0438 \u0441\u0434\u0430\u0447\u0435 \u0432 \u0430\u0440\u0435\u043D\u0434\u0443 \u0447\u0435\u0440\u0435\u0437 \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0443\u044E \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u044E \u043F\u0430\u0440\u043A\u0430, \u043E\u043A\u0443\u043F\u0430\u0435\u043C\u043E\u0441\u0442\u044C \u0441\u043E\u0441\u0442\u0430\u0432\u0438\u0442 5\u20137 \u043B\u0435\u0442. \u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0442\u043E\u043A \u0433\u043E\u0441\u0442\u0435\u0439 \u043A\u0440\u0443\u0433\u043B\u044B\u0439 \u0433\u043E\u0434."}</div>
              </div>}
            </div>
            <div style={{position:"fixed",bottom:34,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 80px)",maxWidth:310,zIndex:300,padding:"10px 16px",background:"rgba(255,255,255,0.18)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.4)",borderRadius:22,display:"flex",alignItems:"center"}}>
              <div style={{width:"100%",maxWidth:390,display:"flex",alignItems:"center",gap:12}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{detailSheet.title}</div><div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:1}}>{detailSheet.price||detailSheet.sub||""}</div></div>
                <div className="tap" onClick={()=>{if(detailSheet.actionKey){submitContactRequest(detailSheet.type,detailSheet.actionKey,"","");}setDetailSheet(null);if(detailSheet.actionKey)alert("\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430!");}} style={{padding:"8px 22px",height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>{detailSheet.action}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SERVICES ─────────────────────────────────────────────
function ServicesTab({onSearch,onProfile,pendingSec,onClearPending}:{onSearch?:()=>void,onProfile?:()=>void,pendingSec?:string,onClearPending?:()=>void}) {
  const [sec, setSec] = useState('delivery');
  useEffect(()=>{if(pendingSec){setSec(pendingSec);onClearPending&&onClearPending();setTimeout(()=>{const el=document.getElementById("pill-"+pendingSec);/* no scroll */;},100);}},[pendingSec]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any[]>([]);
  const [restId, setRestId] = useState<string|null>(null);
  const [partner, setPartner] = useState<any[]>([]);
  const [expId, setExpId] = useState<string|null>(null);
  const [selectedRest, setSelectedRest] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingService, setBookingService] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rvName, setRvName] = useState('');
  const [rvComment, setRvComment] = useState('');
  const [rvRating, setRvRating] = useState(5);
  const [rvItem, setRvItem] = useState('');
  const [rvSending, setRvSending] = useState(false);
  const [cart, setCart] = useState<Record<string,number>>({});
  const [deliveryCat, setDeliveryCat] = useState('food');
  const cartTotal = data.filter((d:any)=>cart[d.id]>0).reduce((s:number,d:any)=>s+(cart[d.id]||0)*d.price,0);
  const cartCount = Object.values(cart).reduce((a:number,b:number)=>a+b,0);
  const [countryDetail, setCountryDetail] = useState<any>(null);
  const [loyaltyLevels, setLoyaltyLevels] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const toggleFav = async(id:string,name?:string,emoji?:string)=>{
    setFavorites(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});
    try{
      const exists = await fetch(SB_URL+'/rest/v1/favorites?item_id=eq.'+id+'&select=id',{headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}}).then(r=>r.json());
      if(exists&&exists.length>0){
        await fetch(SB_URL+'/rest/v1/favorites?item_id=eq.'+id,{method:'DELETE',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}});
      }else{
        await fetch(SB_URL+'/rest/v1/favorites',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({item_type:'hotel',item_id:id,item_name:name||'',item_emoji:emoji||''})});
      }
    }catch{}
  };
  
  const [fullMenu, setFullMenu] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [gastroRests, setGastroRests] = useState<any[]>([]);

  useEffect(()=>{
    setLoading(true);setExpId(null);
    if(sec==='banya') {
      sb('services','select=*&category=eq.banya&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='delivery') {
      sb('delivery_items','select=*&is_available=eq.true&order=category.asc,sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='shops') {
      sb('services','select=*&category=eq.shop&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='food') {
      sb('restaurants','select=*&active=eq.true&order=rating.desc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='fun') {
      sb('services','select=*&category=eq.attractions&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='rental') {
      sb('services','select=*&category=in.(rental,transport)&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='gastro') {
      sb('restaurants','select=*&active=eq.true&order=rating.desc').then(d=>{setGastroRests(d||[]);setLoading(false);});
    } else if(sec==='reviews') {
      sb('reviews','select=*&item_type=eq.restaurant&order=created_at.desc&limit=20').then(d=>{setAllReviews(d||[]);setLoading(false);});
    } else if(sec==='partner') {
      sb('partnership','select=*&is_published=eq.true&order=sort_order.asc').then(d=>{setPartner(d||[]);setLoading(false);});
    } else {
      sb('services','select=*&category=in.(excursion,kids,photo)&active=eq.true&order=category.asc,sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    }
  },[sec]);

  const openRest = (r:any)=>{
    setSelectedRest(r);
    setFullMenu([]);
    fetch(SB_URL+'/rest/v1/gastro_stamps',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({user_id:'00000000-0000-0000-0000-000000000000',restaurant_id:r.id,points_earned:5})}).catch(()=>{});
    sb("menu_items","select=*&restaurant_id=eq."+r.id+"&is_available=eq.true&order=sort_order.asc").then(d=>setFullMenu(d&&d.length>0?d:[{id:"empty",name_ru:"Меню обновляется",price:0}]));
  };

  const loadMenu = useCallback((id:string)=>{
    if(restId===id){setRestId(null);setMenu([]);return;}
    setRestId(id);
    sb('menu_items',`select=*&restaurant_id=eq.${id}&is_available=eq.true&order=sort_order.asc`).then(d=>setMenu(d||[]));
  },[restId]);

  const CAT_COLORS: Record<string,string> = {zoo:'#4CAF50',adventure:'#FF5722',sport:'#2196F3',craft:'#FF9800',events:'#E91E63',animals:'#8BC34A'};

  // Rich service card
  const ServiceCard = ({s,i}:{s:any,i:number}) => {
    const isExp = expId === s.id;
    const sc = CAT_COLORS[s.subcategory]||'var(--blue)';
    return (
      <div key={s.id} className={`tap fu s${Math.min(i+1,6)}`} onClick={()=>setExpId(isExp?null:s.id)}
        style={{borderRadius:30,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
        <div style={{padding:'16px',display:'flex',gap:14}}>
          <div style={{width:60,height:60,borderRadius:16,background:`${sc}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{s.cover_emoji}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
              <div style={{fontSize:16,fontWeight:700,color:'var(--label)',fontFamily:FT,lineHeight:1.3}}>{s.name_ru}</div>
              {s.price_from>0 && <div style={{flexShrink:0,textAlign:'right'}}>
                <div style={{fontSize:16,fontWeight:700,color:sc,fontFamily:FD}}>{s.price_from>=1000?(s.price_from/1000).toFixed(s.price_from%1000?1:0)+'K':s.price_from} ₽</div>
              </div>}
            </div>
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{isExp ? s.description_ru : (s.description_ru?.slice(0,80)+(s.description_ru?.length>80?'...':''))}</div>
            <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8,flexWrap:'wrap'}}>
              {s.location_ru && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>📍 {s.location_ru}</span>}
              {s.duration_text && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>⏱ {s.duration_text}</span>}
              {s.status_text && <span style={{fontSize:11,fontWeight:600,color:'#34C759',fontFamily:FT}}>● {s.status_text}</span>}
            </div>
            {isExp && (
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <div className="tap" onClick={(e:any)=>{e.stopPropagation();setBookingService(s);}} style={{flex:1,padding:'11px',borderRadius:14,background:sc,textAlign:'center'}}>
                  <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>{s.price_from>=10000?'Оставить заявку':'Записаться'}</span>
                </div>
                <div className="tap" onClick={(e:any)=>{e.stopPropagation();toggleFav(s.id,s.name_ru,s.cover_emoji);}} style={{width:44,height:44,borderRadius:14,background:favorites.has(s.id)?'rgba(255,59,48,.08)':'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:18}}>{favorites.has(s.id)?'❤️':'🤍'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)',maxWidth:'100%'}}>
      <div style={{background:'var(--bg)'}}>
        <div style={{padding:'54px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.8px'}}>Услуги</div>
            <div className="tap" onClick={()=>onProfile&&onProfile()} style={{visibility:"hidden",width:0,height:0,overflow:"hidden",position:"absolute",background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',boxShadow:'0 1px 4px rgba(0,0,0,0.12)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#fff"/></svg>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px',overflowX:'auto'}}>
          {[['delivery','🛵','Доставка'],['food','🍽️','Рестораны'],['shops','🛍️','Магазины'],['banya','🧖','Бани и СПА'],['fun','🎡','Развлечения'],['rental','🚲','Прокат'],['other','🎯','Экскурсии'],['gastro','🏆','Гастро'],['reviews','⭐','Отзывы']].map(([id,ic,label])=>(
            <div key={id} id={"pill-"+id} className="tap" onClick={()=>setSec(id)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:30,flexShrink:0,
                background:sec===id?'var(--label)':'var(--bg2)',
                border:'0.5px solid '+(sec===id?'var(--label)':'var(--sep-opaque)'),
                boxShadow:sec===id?'none':'var(--shadow-sm)'}}>
              <span style={{fontSize:14}}>{ic}</span>
              <span style={{fontSize:14,fontWeight:600,color:sec===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? <Spinner/> : sec==='gastro' ? (
        <div style={{padding:'0 20px'}}>
          <div style={{borderRadius:22,background:'linear-gradient(135deg,#FF6B00,#FF9500)',padding:20,marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-20,top:-20,fontSize:120,opacity:.1}}>🍽️</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.6)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px'}}>Гастро-паспорт</div>
              <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4,letterSpacing:'-.5px'}}>0 / {gastroRests.length}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:2}}>ресторанов посещено</div>
              <div style={{marginTop:12,height:6,borderRadius:3,background:'rgba(255,255,255,.2)'}}><div style={{height:6,borderRadius:3,background:'#fff',width:'0%',transition:'width .5s'}}/></div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:6}}>Посетите все 15 и получите значок «Гурман» + 500 очков</div>
            </div>
          </div>
          <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.3px',marginBottom:12}}>Рестораны парка</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>{gastroRests.map((r:any,i:number)=>(<div key={r.id} className={"tap fu s"+Math.min(i+1,6)} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:12,textAlign:'center',boxShadow:'var(--shadow-sm)',position:'relative'}}><div style={{fontSize:32,marginBottom:6}}>{r.cover_emoji}</div><div style={{fontSize:11,fontWeight:600,color:'var(--label)',fontFamily:FT,lineHeight:1.3}}>{(r.name_ru||'').replace(/Ресторан |Кафе |Кафе-пекарня |Ресторан-пиццерия |Ресторан и караоке |Чайная /g,'').replace(/[«»]/g,'')}</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,marginTop:2}}>⭐ {r.rating}</div><div style={{position:'absolute',top:6,right:6,width:20,height:20,borderRadius:10,border:'2px solid var(--sep)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:10,color:'var(--sep)'}}>✓</span></div></div>))}</div>
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:16}}><div style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FT,marginBottom:10}}>Как это работает</div>{[['📱','Покажите QR','Откройте приложение и покажите QR официанту'],['✅','Получите штамп','Штамп появится автоматически'],['🏆','Соберите все','30 очков за каждый, 500 бонус за все 15']].map(([ic,t,d]:any,i:number)=>(<div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<2?10:0}}><div style={{width:36,height:36,borderRadius:10,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{ic}</div><div><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{t}</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{d}</div></div></div>))}</div>
        </div>
      ) : sec==='reviews' ? (
        <div style={{padding:'0 20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}><span style={{fontWeight:700,color:'var(--label)'}}>{allReviews.length}</span> отзывов</div>
            <div className="tap" onClick={()=>setShowReviewForm(true)} style={{padding:'7px 16px',borderRadius:20,background:'#007AFF'}}>
              <span style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:FT}}>Написать отзыв</span>
            </div>
          </div>
          {allReviews.map((rv:any,i:number)=>{const stars='★'.repeat(rv.rating)+'☆'.repeat(5-rv.rating);const ago=Math.ceil((Date.now()-new Date(rv.created_at).getTime())/86400000);const agoText=ago<=0?'сегодня':ago===1?'вчера':ago+' дн. назад';return(<div key={rv.id} className={"fu s"+Math.min(i+1,6)} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14,marginBottom:10,boxShadow:'var(--shadow-sm)'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:18,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{rv.author_emoji||'👤'}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{rv.author_name||'Гость'}</div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>{agoText}</div></div><div style={{fontSize:13,color:'var(--orange)',letterSpacing:1}}>{stars}</div></div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5,marginBottom:6}}>{rv.comment}</div><span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'2px 8px',borderRadius:8}}>{rv.item_name}</span></div>);})}
          {allReviews.length===0&&!loading&&<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>⭐</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>Отзывов пока нет</div></div>}
        </div>
      ) : sec==='partner' ? (
        <div style={{padding:'14px 20px',overflow:"hidden",width:"100%",boxSizing:"border-box"}}>
          <div style={{borderRadius:16,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'16px',marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.06}}>🤝</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>Ethnomir BUSINESS</div>
              <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4}}>Партнёрство</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:6,lineHeight:1.4}}>Франшиза · Аренда · Инвестиции · Свой бизнес в парке</div>
            </div>
          </div>
          {partner.map((p:any,i:number)=>{
            const isExp = expId === p.id; const isFr = p.sort_order===1||p.name_ru==='Франшиза Этномир';
            return (
              <div key={p.id} className={`tap fu s${Math.min(i+1,6)}`} onClick={()=>{if(isFr&&onFranchise){onFranchise();return;}setExpId(isExp?null:p.id);}}
                style={{borderRadius:30,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
                <div style={{padding:'16px',display:'flex',gap:14}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'linear-gradient(145deg,#0d1b2a22,#1a3a5c22)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{p.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{p.name_ru}</div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{p.description_ru}</div>
                    {p.investment_from && <div style={{display:'flex',gap:12,marginTop:10}}>
                      <div><div style={{fontSize:15,fontWeight:700,color:'var(--blue)',fontFamily:FD}}>от {p.investment_from>=1000000?(p.investment_from/1000000)+'M':(p.investment_from/1000)+'K'} ₽</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Инвестиции</div></div>
                      {p.roi_percent && <div><div style={{fontSize:15,fontWeight:700,color:'#34C759',fontFamily:FD}}>{p.roi_percent}%</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>ROI</div></div>}
                    </div>}
                    {isExp && (p.benefits||[]).length>0 && (
                      <div style={{marginTop:12,padding:'12px',borderRadius:14,background:'var(--bg)',border:'0.5px solid var(--sep)'}}>
                        {(p.benefits||[]).map((b:string,j:number)=>(
                          <div key={j} style={{display:'flex',gap:6,alignItems:'center',padding:'4px 0'}}>
                            <span style={{fontSize:12,color:'#34C759'}}>✓</span>
                            <span style={{fontSize:12,color:'var(--label2)',fontFamily:FT}}>{b}</span>
                          </div>
                        ))}
                        <div className="tap" onClick={(e:any)=>e.stopPropagation()} style={{marginTop:10,padding:'11px',borderRadius:14,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',textAlign:'center'}} onClick={()=>{const n=prompt("Ваше имя:");if(!n)return;const p=prompt("Телефон:");if(!p)return;submitContactRequest("realestate","Недвижимость",n,p,"Запрос по недвижимости");alert("Заявка отправлена! Менеджер свяжется.");}}>
                          <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>Узнать подробнее</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="tap" style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px 16px',display:'flex',gap:14,alignItems:'center',boxShadow:'var(--shadow-sm)'}}>
            <span style={{fontSize:20}}>📞</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Отдел партнёрства</div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>+7 (495) 023-43-49</div></div>
            <Chev/>
          </div>
        </div>
      ) : sec==='delivery' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>Доставка в номер</div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}>Еда и товары — прямо к двери</div>

          {/* Category pills */}
          <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:4}}>
            {[['food','🍲','Еда'],['drinks','🍵','Напитки'],['snacks','🧀','Снеки'],['merch','👕','Мерч'],['essentials','🪥','Необходимое'],['kids','🧸','Детям']].map(([id,ic,lb]:any)=>(
              <div key={id} className="tap" onClick={()=>setDeliveryCat(id)} style={{padding:'6px 14px',borderRadius:20,fontSize:13,fontFamily:FT,flexShrink:0,display:'flex',alignItems:'center',gap:4,background:deliveryCat===id?'var(--label)':'var(--fill4)',color:deliveryCat===id?'#fff':'var(--label2)'}}><span>{ic}</span>{lb}</div>
            ))}
          </div>

          {/* Items */}
          {loading?<Spinner/>:data.filter((d:any)=>d.category===deliveryCat).map((item:any,i:number)=>{
            const qty=cart[item.id]||0;
            return(
              <div key={item.id} className={"fu s"+Math.min(i+1,6)} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'0.5px solid var(--sep)',alignItems:'center'}}>
                <div style={{width:44,height:44,borderRadius:12,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{item.cover_emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{item.name_ru}</div>
                  <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{item.description_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                    <span style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{item.price>0?item.price+' ₽':'Беспл.'}</span>
                    {item.prep_time_min&&<span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>∼{item.prep_time_min} мин</span>}
                  </div>
                </div>
                {qty===0?(
                  <div className="tap" onClick={()=>setCart(p=>({...p,[item.id]:1}))} style={{width:34,height:34,borderRadius:17,background:'#007AFF',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:18,color:'#fff',fontWeight:300}}>+</span>
                  </div>
                ):(
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="tap" onClick={()=>setCart(p=>({...p,[item.id]:Math.max(0,qty-1)}))} style={{width:28,height:28,borderRadius:14,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:14,fontWeight:600,color:'var(--label2)'}}>−</span></div>
                    <span style={{fontSize:16,fontWeight:700,color:'var(--label)',fontFamily:FD,minWidth:18,textAlign:'center'}}>{qty}</span>
                    <div className="tap" onClick={()=>setCart(p=>({...p,[item.id]:qty+1}))} style={{width:28,height:28,borderRadius:14,background:'#007AFF',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:14,fontWeight:600,color:'#fff'}}>+</span></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Cart summary */}
          {cartCount>0&&(
            <div style={{position:'sticky',bottom:90,marginTop:16,borderRadius:20,background:'#007AFF',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 4px 20px rgba(0,122,255,.3)'}}>
              <div><div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>{cartTotal.toLocaleString('ru')} ₽</div><div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT}}>{cartCount} тов.{cartCount===1?'':'ар'}</div></div>
              <div className="tap" onClick={()=>{const n=prompt('Имя:');if(!n)return;const p=prompt('Телефон:');if(!p)return;const room=prompt('Отель и номер комнаты:');const items=data.filter((d:any)=>cart[d.id]>0).map((d:any)=>({name:d.name_ru,qty:cart[d.id],price:d.price}));fetch(SB_URL+'/rest/v1/orders',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({type:'food',items:JSON.stringify(items),subtotal:cartTotal,total:cartTotal,guest_name:n,guest_phone:p,notes:room||'',status:'pending'})});setCart({});alert('Заказ оформлен! Ожидайте доставку.');}} style={{padding:'10px 20px',borderRadius:14,background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)'}}>
                <span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Оформить</span>
              </div>
            </div>
          )}
        </div>
      ) : sec==='food' ? (selectedRest ? (
        <div style={{padding:0}}>
          <div style={{position:'relative',height:200,background:'linear-gradient(145deg,#8B4513,#D2691E)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'0 0 0 0'}}>
            <span style={{fontSize:80,opacity:.2}}>{selectedRest.cover_emoji}</span>
            <div className="tap" onClick={()=>toggleFav(selectedRest.id,selectedRest.name_ru,selectedRest.cover_emoji)} style={{position:'absolute',top:54,right:16,width:36,height:36,borderRadius:18,background:'rgba(0,0,0,.2)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}><span style={{fontSize:18,color:favorites.has(selectedRest.id)?'#FF3B30':'rgba(255,255,255,.85)'}}>{favorites.has(selectedRest.id)?'♥':'♡'}</span></div>
            <div className="tap" onClick={()=>{setSelectedRest(null);setFullMenu([]);}}
              style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:18,background:'rgba(0,0,0,.3)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>
              <span style={{fontSize:18,color:'#fff'}}>‹</span>
            </div>
            <div style={{position:'absolute',top:54,right:16,display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,color:'#FFD60A'}}>★</span>
              <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>{selectedRest.rating}</span>
            </div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 18px 16px',background:'linear-gradient(transparent,rgba(0,0,0,.5))'}}>
              <div style={{fontSize:26,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px'}}>{selectedRest.name_ru}</div>
            </div>
          </div>
          <div style={{padding:'20px'}}>
            <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,lineHeight:1.55,marginBottom:16}}>{selectedRest.description_ru}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
              {selectedRest.avg_check && <div style={{padding:'7px 12px',borderRadius:12,background:'var(--fill4)',border:'0.5px solid var(--sep)',display:'flex',alignItems:'center',gap:5}}><span style={{fontSize:13}}>💰</span><span style={{fontSize:13,fontWeight:600,color:'var(--label)',fontFamily:FT}}>~{selectedRest.avg_check} ₽</span></div>}
              {selectedRest.is_halal && <div style={{padding:'7px 12px',borderRadius:12,background:'rgba(52,199,89,.06)',border:'0.5px solid rgba(52,199,89,.15)',display:'flex',alignItems:'center',gap:5}}><span style={{fontSize:13}}>☪️</span><span style={{fontSize:13,fontWeight:600,color:'#34C759',fontFamily:FT}}>Халяль</span></div>}
            </div>
            <div style={{fontSize:18,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:12}}>Меню</div>
            {fullMenu.length===0 ? <div style={{padding:'20px',textAlign:'center'}}><Spinner/></div> : (
              <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
                {fullMenu.map((m:any,i:number)=>{
                  const spice = m.spice_level>0?'🌶️'.repeat(Math.min(m.spice_level,3)):'';
                  return (
                    <div key={m.id||i} style={{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:i<fullMenu.length-1?'0.5px solid var(--sep)':'none'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{m.name_ru}{spice?' '+spice:''}</div>
                        <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{m.weight_grams?(m.weight_grams+'г '):''}{m.calories?(m.calories+'ккал'):''}</div>
                      </div>
                      <span style={{fontSize:15,fontWeight:700,color:'var(--orange)',fontFamily:FD,flexShrink:0,marginLeft:12}}>{m.price} ₽</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="tap" style={{marginTop:20,height:50,borderRadius:14,background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>Забронировать столик</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:'var(--label)'}}>{data.length}</span> ресторанов и кафе</div>
          {data.map((r:any,i:number)=>{
            const hasMenu = restId===r.id && menu.length>0;
            return (
              <div key={r.id} className={`fu s${Math.min(i+1,6)}`}
                style={{borderRadius:30,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
                <div className="tap" onClick={()=>openRest(r)} style={{padding:'16px',display:'flex',gap:14}}>
                  {r.cover_image_url?<img src={r.cover_image_url} style={{width:60,height:60,borderRadius:16,objectFit:'cover',flexShrink:0}} alt="" />:<div style={{width:60,height:60,borderRadius:16,background:'rgba(255,149,0,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{r.cover_emoji||'🍽️'}</div>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{_s(r.name_ru)}</div>
                      <div style={{display:'flex',alignItems:'center',gap:3,flexShrink:0}}>
                        <span style={{fontSize:12,color:'#FFD60A'}}>★</span>
                        <span style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{r.rating}</span>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{r.description_ru?.slice(0,90)}{r.description_ru?.length>90?'...':''}</div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      {r.avg_check && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>💰 ~{r.avg_check} ₽</span>}
                      {r.cuisine_type && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>{r.cuisine_type}</span>}{r.dietary_tags&&r.dietary_tags.length>0&&r.dietary_tags.map((t:string,i:number)=>(<span key={i} style={{fontSize:11,color:t==='vegan'||t==='vegetarian'?'#34C759':t==='halal'?'#FF9500':'var(--label3)',fontFamily:FT,background:t==='vegan'||t==='vegetarian'?'rgba(52,199,89,.08)':t==='halal'?'rgba(255,149,0,.08)':'var(--fill4)',padding:'3px 8px',borderRadius:8}}>{t==='vegetarian'?'🥗 Вег':t==='vegan'?'🌱 Веган':t==='halal'?'☪️ Халяль':t}</span>))}
                      <span style={{fontSize:11,color:'var(--blue)',fontFamily:FT,fontWeight:600}}>{hasMenu?'Скрыть меню ▲':'Меню ▼'}</span>
                    </div>
                  </div>
                </div>
                {hasMenu && (
                  <div style={{padding:'0 16px 14px',borderTop:'0.5px solid var(--sep)'}}>
                    <div style={{padding:'10px 0 0'}}>
                      {menu.map((m:any)=>(
                        <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'0.5px solid var(--fill3)'}}>
                          <div><div style={{fontSize:14,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{m.cover_emoji} {m.name_ru}</div>
                          <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{m.weight_g?m.weight_g+'г':''}{m.calories?' · '+m.calories+'ккал':''}</div>{m.dietary_tags&&m.dietary_tags.length>0&&<div style={{display:'flex',gap:3,marginTop:3,flexWrap:'wrap'}}>{m.dietary_tags.map((t:string,i:number)=>(<span key={i} style={{fontSize:9,padding:'1px 5px',borderRadius:6,color:t==='meat'?'#FF3B30':t==='vegetarian'?'#34C759':t==='vegan'?'#00C7BE':t==='keto'?'#AF52DE':t==='lenten'?'#5856D6':t==='halal'?'#FF9500':'var(--label3)',background:t==='meat'?'rgba(255,59,48,.08)':t==='vegetarian'?'rgba(52,199,89,.08)':t==='vegan'?'rgba(0,199,190,.08)':t==='keto'?'rgba(175,82,222,.08)':t==='lenten'?'rgba(88,86,214,.08)':t==='halal'?'rgba(255,149,0,.08)':'var(--fill4)',fontFamily:FT}}>{t==='meat'?'🥩':t==='vegetarian'?'🥗':t==='vegan'?'🌱':t==='keto'?'🥑':t==='lenten'?'🕊️':t==='halal'?'☪️':t==='gluten_free'?'🌾':''}</span>))}</div>}</div>
                          <span style={{fontSize:14,fontWeight:700,color:'var(--orange)',fontFamily:FT}}>{m.price} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )) : (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}>
            <span style={{fontWeight:700,color:'var(--label)'}}>{data.length}</span> {sec==='banya'?'банных и СПА программ':sec==='fun'?'развлечений и аттракционов':sec==='rental'?'видов транспорта':sec==='delivery'?'вариантов доставки':'услуг'}
          </div>
          {sec==='delivery' ? (
            <div>
              <div style={{borderRadius:30,background:"linear-gradient(135deg,#0d2b1d,#1a6b3a)",padding:20,marginBottom:16}}>
                <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:6}}>Единая корзина</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,.7)",fontFamily:FT,lineHeight:1.5}}>Блюда из ресторанов и товары из магазинов — в одну корзину. Укажите отель и номер.</div>
              </div>
              {[{c:"🍽️",t:"Заказать еду",d:"Из 15 ресторанов парка",b:"+15"},{c:"🛍️",t:"Заказать товары",d:"Сувениры и ремёсла",b:"+15"},{c:"🧖",t:"СПА-наборы",d:"Косметика для бани",b:"+10"}].map((x:any,j:number)=>(
                <div key={j} className="tap" onClick={()=>setDetailSheet({type:"gs",title:item.t,sub:item.d,price:item.time||"",badge:item.b?"+"+item.b+" баллов":"",desc:"",action:"Заказать услугу",actionKey:"gs_"+j})} style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center",cursor:"pointer"}}>
                  <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{x.c}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{x.t}</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{x.d}</div></div>
                  <div style={{padding:"3px 8px",borderRadius:8,background:"rgba(52,199,89,.1)"}}><span style={{fontSize:11,fontWeight:600,color:"var(--green)",fontFamily:FT}}>{x.b}</span></div>
                </div>
              ))}
              <div style={{padding:12,borderRadius:12,background:"var(--fill4)",marginTop:4}}>
                <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,textAlign:"center"}}>Минимум 500 ₽ · Доставка 30-60 мин</div>
              </div>
            </div>
          ) : data.map((s:any,i:number)=><ServiceCard key={s.id} s={s} i={i}/>)}
          {sec==='banya' && (
            <div className="tap" style={{borderRadius:16,background:'linear-gradient(145deg,#8B0000,#C0392B)',padding:'18px',position:'relative',overflow:'hidden',marginTop:4}}>
              <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.15}}>🔥</div>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>СПА-туры для двоих</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:4}}>Романтический отдых: баня + массаж + ужин</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:2}}>+7 (495) 023-43-49</div>
              </div>
            </div>
          )}
        </div>
      )}
    {showReviewForm && (
      <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 0 0"}}>
        <div className="anim-slideUp" style={{background:"var(--bg2)",borderRadius:"28px 28px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:390,maxHeight:"80vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD}}>Новый отзыв</div>
            <div className="tap" onClick={()=>setShowReviewForm(false)} style={{width:30,height:30,borderRadius:15,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,color:"var(--label3)"}}>✕</span></div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:6}}>Оценка</div>
            <div style={{display:"flex",gap:6}}>{[1,2,3,4,5].map(n=>(<div key={n} className="tap" onClick={()=>setRvRating(n)} style={{fontSize:28,cursor:"pointer"}}>{n<=rvRating?"★":"☆"}</div>))}</div>
          </div>
          <div style={{borderRadius:12,background:"var(--bg)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:14}}>
            <input value={rvName} onChange={(e:any)=>setRvName(e.target.value)} placeholder="Ваше имя" style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box"}}/>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <input value={rvItem} onChange={(e:any)=>setRvItem(e.target.value)} placeholder="Что посетили (ресторан, тур...)" style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box"}}/>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <textarea value={rvComment} onChange={(e:any)=>setRvComment(e.target.value)} placeholder="Ваш отзыв..." rows={4} style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box",resize:"none"}}/>
          </div>
          <div className="tap" onClick={async()=>{if(!rvComment.trim()){alert("Напишите отзыв");return;}setRvSending(true);await fetch(SB_URL+"/rest/v1/reviews",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({item_type:"restaurant",item_id:"manual",item_name:rvItem||"Этномир",rating:rvRating,comment:rvComment,author_name:rvName||"Гость",author_emoji:"👤"})});setRvSending(false);setShowReviewForm(false);setRvComment("");setRvName("");setRvItem("");setRvRating(5);setAllReviews(prev=>[{id:Date.now(),item_type:"restaurant",item_name:rvItem||"Этномир",rating:rvRating,comment:rvComment,author_name:rvName||"Гость",author_emoji:"👤",created_at:new Date().toISOString()},...prev]);}} style={{padding:"14px",borderRadius:14,background:"#007AFF",textAlign:"center",opacity:rvSending?.5:1}}>
            <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>{rvSending?"Отправка...":"Отправить отзыв"}</span>
          </div>
        </div>
      </div>
    )}
    {bookingService && <BookingModal item={bookingService} type="service" total={bookingService.price_from||0} guests={1} onClose={()=>setBookingService(null)}/>}
    </div>
  );
}

// ─── PASSPORT ─────────────────────────────────────────────


// ─── PASSPORT VIEW (iOS 26 grouped) ──────────────────────
function _sv(v:any):string{if(v==null)return '';if(typeof v==='object')return JSON.stringify(v);return String(v);}
class ErrorBoundary extends Component<{fallback:any,children:any},{err:any,info:any}>{constructor(p:any){super(p);this.state={err:null,info:null};}static getDerivedStateFromError(e:any){return{err:e};}componentDidCatch(e:any,info:any){console.warn('PASSPORT_DEBUG:',e,'\\nStack:',info?.componentStack);this.setState({err:e,info});}render(){if(this.state.err){const msg=String(this.state.err?.message||this.state.err);const stack=this.state.info?.componentStack||'';return <div style={{padding:40,textAlign:'center'}}><div style={{fontSize:48,marginBottom:8}}>⚠️</div><div style={{fontSize:15,color:'#FF3B30',fontFamily:'system-ui',marginBottom:8}}>Ошибка паспорта</div><div style={{fontSize:12,color:'#8E8E93',fontFamily:'monospace',padding:'8px 12px',background:'#F2F2F7',borderRadius:8,textAlign:'left',maxHeight:300,overflow:'auto',wordBreak:'break-all'}}>{msg}{'\\n\\nComponentStack: '+stack.slice(0,500)}</div><div className='tap' onClick={()=>{localStorage.removeItem('sb_session');window.location.reload();}} style={{marginTop:16,padding:'12px 24px',borderRadius:14,background:'#007AFF',color:'#fff',fontSize:15,fontWeight:600,display:'inline-block',cursor:'pointer'}}>Очистить и повторить</div></div>;}return this.props.children;}}

function PassportView({session,onLogin,onLogout,onQR}:{session:any,onLogin:any,onLogout:any,onQR:any}){
  const [view,setView]=useState<string|null>(null);
  const [countries,setCountries]=useState<any[]>([]);
  const [regions,setRegions]=useState<any[]>([]);
  const [achievements,setAchievements]=useState<any[]>([]);
  const [bookings,setBookings]=useState<any[]>([]);
  const [favs,setFavs]=useState<any[]>([]);
  const [revs,setRevs]=useState<any[]>([]);
  const [profile,setProfile]=useState<any>(null);
  const [walletTx,setWalletTx]=useState<any[]>([]);
  const [pointsLog,setPointsLog]=useState<any[]>([]);
  const [loyaltyLvls,setLoyaltyLvls]=useState<any[]>([]);
  const [subPlans,setSubPlans]=useState<any[]>([]);
  const [showPro,setShowPro]=useState(false);
  const [editBirth,setEditBirth]=useState('');
  const [editGender,setEditGender]=useState('');
  const [editNation,setEditNation]=useState('');
  const [editingPassport,setEditingPassport]=useState(false);
  const [visitedC,setVisitedC]=useState<string[]>([]);
  const [visitedR,setVisitedR]=useState<string[]>([]);
  const [loginEmail,setLoginEmail]=useState('');
  const [loginPass,setLoginPass]=useState('');
  const [loginErr,setLoginErr]=useState('');
  const [loginLoading,setLoginLoading]=useState(false);
  const [isRegister,setIsRegister]=useState(false);
  const [regName,setRegName]=useState('');
  const [authStep,setAuthStep]=useState<string>('phone');
  const [authMode,setAuthMode]=useState<string>('phone');
  const [phoneInput,setPhoneInput]=useState('+7');
  const [otpInput,setOtpInput]=useState('');
  const [countdown,setCountdown]=useState(0);
  const [devCode,setDevCode]=useState('');
  const [loading,setLoading]=useState(true);
  const [userSet,setUserSet]=useState<any>({push_enabled:true,marketing_consent:false,theme:'auto',locale:'ru'});
  const [legalDocs,setLegalDocs]=useState<any[]>([]);
  const [selectedLegal,setSelectedLegal]=useState<any>(null);
  const [unlockedAchs,setUnlockedAchs]=useState<string[]>([]);
  const [regionFd,setRegionFd]=useState('');
  const [expandedCountry,setExpandedCountry]=useState<string|null>(null);
  const [selectedCountry,setSelectedCountry]=useState<any>(null);
  const [selectedRegion,setSelectedRegion]=useState<any>(null);
  const [stampsData,setStampsData]=useState<any[]>([]);

  useEffect(()=>{
    Promise.all([
      sb('countries','select=id,name_ru,flag_emoji,color_hex,capital,population,area_km2,description_ru,fun_fact_ru,region,official_language&active=eq.true&order=sort_order.asc'),
      sb('regions_rf','select=id,name_ru,flag_emoji,federal_district,capital,population,area_km2,description_ru,fun_fact_ru,coat_of_arms_emoji,coat_of_arms_url,reward_points&active=eq.true&order=sort_order.asc'),
      sb('achievements','select=id,name_ru,description_ru,icon,reward_points,track,level&order=track.asc,level.asc'),
      sb('bookings','select=id,type,item_name,guest_name,total_price,created_at&order=created_at.desc&limit=20'),
      sb('favorites','select=id,item_id,item_name,item_emoji,created_at&order=created_at.desc&limit=20'),
      sb('reviews','select=id,item_name,rating,comment,author_name,created_at&order=created_at.desc&limit=20'),
      sb('loyalty_levels','select=id,name_ru,icon,color,min_points&order=min_points.asc'),
      sb('subscription_plans','select=id,name_ru,slug,price_monthly,features,sort_order&is_active=eq.true&order=sort_order.asc'),
      sb('wallet_transactions','select=id,description,amount,created_at&order=created_at.desc&limit=20'),
      sb('points_log','select=id,description,points,created_at&order=created_at.desc&limit=20'),
      sb('legal_docs','select=id,title_ru,body_ru,published_at&is_current=eq.true&order=published_at.desc'),
    ]).then(([c,r,a,b,f,rv,ll,sp,wt,pl,ld])=>{
      setCountries(Array.isArray(c)?c:[]);setRegions(Array.isArray(r)?r:[]);setAchievements(Array.isArray(a)?a:[]);setBookings(Array.isArray(b)?b:[]);setFavs(Array.isArray(f)?f:[]);setRevs(Array.isArray(rv)?rv:[]);setLoyaltyLvls(Array.isArray(ll)?ll:[]);setSubPlans(Array.isArray(sp)?sp:[]);setWalletTx(Array.isArray(wt)?wt:[]);setPointsLog(Array.isArray(pl)?pl:[]);setLegalDocs(Array.isArray(ld)?ld:[]);setLoading(false);
    }).catch(()=>setLoading(false));
    if(session?.access_token){
      const t=session.access_token;
      const uid=session.user?.id;
      if(!uid){setLoading(false);return;}
      sbAuthGet(t,'profiles?select=id,name,phone,email,points,citizenship_level,passport_number,role,referral_code,total_visits,wallet_balance,cashback_percent,photo_url,bio,locale,birth_date,gender,passport_issued_at,passport_expires_at,passport_authority,nationality&id=eq.'+uid).then(p=>{if(p?.[0])setProfile(p[0]);});
      sbAuthGet(t,'user_settings?select=user_id,push_enabled,marketing_consent,theme,locale,face_id_enabled&user_id=eq.'+uid).then(us=>{if(us?.[0])setUserSet(us[0]);});
      sbAuthGet(t,'user_achievements?select=achievement_id&user_id=eq.'+uid).then(ua=>{setUnlockedAchs((ua||[]).map((x:any)=>x.achievement_id));});
      sbAuthGet(t,'passport_stamps?select=country_id,region_id,earned_at,points_earned&user_id=eq.'+uid).then(st=>{
        setStampsData(st||[]);
        setVisitedC([...new Set((st||[]).filter((s:any)=>s.country_id).map((s:any)=>String(s.country_id)))]);
        setVisitedR([...new Set((st||[]).filter((s:any)=>s.region_id).map((s:any)=>String(s.region_id)))]);
      });
    }
  },[session]);
  useEffect(()=>{if(countdown<=0)return;const t=setTimeout(()=>setCountdown((c:number)=>c-1),1000);return()=>clearTimeout(t);},[countdown]);

  const pts=profile?.points||0;
  const lvls=loyaltyLvls.length>0?loyaltyLvls:[{name_ru:'Гость',icon:'🌱',color:'#8E8E93',min_points:0,perks_ru:[]}];
  const curLvl=lvls.filter((l:any)=>pts>=l.min_points).pop()||lvls[0];
  const nxtLvl=lvls.find((l:any)=>l.min_points>pts);
  const lvlPct=nxtLvl?Math.min(100,Math.round((pts-(curLvl?.min_points||0))/(nxtLvl.min_points-(curLvl?.min_points||0))*100)):100;

  // iOS grouped row
  const Row=({icon,label,value,last,onClick}:{icon:string,label:string,value?:string,last?:boolean,onClick?:()=>void})=>(
    <div className="tap" onClick={onClick} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:last?'none':'0.5px solid var(--sep)'}}>
      <div style={{width:32,height:32,borderRadius:10,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{_s(icon)}</div>
      <div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{_s(label)}</div>
      {value!=null&&<span style={{fontSize:15,fontWeight:500,color:'var(--label3)',fontFamily:FT}}>{_s(value)}</span>}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </div>
  );

  // === SUB-VIEWS ===
  if(view){
    const titles:Record<string,string>={countries:'Страны мира',regions:'Регионы России',achievements:'Достижения',bookings:'Бронирования',favorites:'Избранное',reviews:'Отзывы',wallet:'Кошелёк',settings:'Настройки'};
    return(
      <div style={{padding:'12px 0'}}>
        <div className="tap" onClick={()=>setView(null)} style={{display:'flex',alignItems:'center',gap:6,padding:'0 20px 16px'}}>
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:17,color:'#007AFF',fontFamily:FT}}>Назад</span>
        </div>
        <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.8px',padding:'0 20px',marginBottom:20}}>{_s(titles[view]||view)}</div>

        {view==='countries'&&(<div style={{padding:'0 20px'}}>{selectedCountry?(()=>{const c=selectedCountry;const v=visitedC.includes(c.id);const stamp=stampsData.find((s:any)=>s.country_id===c.id);return(<div>
<div className="tap" onClick={()=>setSelectedCountry(null)} style={{display:'flex',alignItems:'center',gap:6,marginBottom:16}}><svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:17,color:'#007AFF',fontFamily:FT}}>Все страны</span></div>
<div style={{borderRadius:24,background:'linear-gradient(160deg,#4A0E0E,#7B1818,#5A1010)',padding:'28px 20px',position:'relative',overflow:'hidden',marginBottom:16}}>
<div style={{position:'absolute',inset:0,opacity:.04,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)',backgroundSize:'14px 14px'}}/>
<div style={{position:'relative',textAlign:'center'}}>
<div style={{fontSize:64,marginBottom:8}}>{_s(c.flag_emoji)}</div>
<div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD}}>{_s(c.name_ru)}</div>
<div style={{fontSize:13,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:4}}>{_s(c.region)} · {_s(c.official_language)}</div>
{v?(<div style={{marginTop:16,padding:'12px 20px',borderRadius:16,background:'rgba(52,199,89,.15)',border:'1px solid rgba(52,199,89,.3)',display:'inline-block'}}><div style={{fontSize:11,fontWeight:700,color:'rgba(52,199,89,.7)',textTransform:'uppercase',letterSpacing:1}}>ПОСЕЩЕНО</div><div style={{fontSize:18,fontWeight:700,color:'#34C759',fontFamily:FD,marginTop:2,transform:'rotate(-3deg)'}}>{stamp?.earned_at?new Date(stamp.earned_at).toLocaleDateString('ru',{day:'numeric',month:'short',year:'numeric'}):'Открыто'}</div>{stamp?.points_earned&&<div style={{fontSize:11,color:'rgba(52,199,89,.7)',marginTop:2}}>+{stamp.points_earned} баллов</div>}</div>):(<div style={{marginTop:16,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><span style={{fontSize:20}}>🔒</span><span style={{fontSize:14,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Отсканируйте QR-код</span></div>)}
</div></div>
{c.description_ru&&<div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:16,marginBottom:12}}><div style={{fontSize:15,color:'var(--label)',fontFamily:FT,lineHeight:1.6}}>{_s(c.description_ru)}</div></div>}
<div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginBottom:12}}>
{[['🏛️','Столица',_s(c.capital)],['👥','Население',c.population?(Number(c.population)/1e6).toFixed(1)+' млн':'—'],['📐','Площадь',c.area_km2?Number(c.area_km2).toLocaleString('ru')+' км²':'—']].map(([ic,lb,vl]:any,i:number)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:i<2?'0.5px solid var(--sep)':'none'}}><span style={{fontSize:18}}>{ic}</span><div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{lb}</div><span style={{fontSize:14,color:'var(--label2)',fontFamily:FT,fontWeight:500}}>{vl}</span></div>))}
</div>
{c.fun_fact_ru&&<div style={{borderRadius:16,background:'rgba(255,149,0,.06)',border:'1px solid rgba(255,149,0,.15)',padding:16,marginBottom:12}}><div style={{display:'flex',gap:10,alignItems:'flex-start'}}><span style={{fontSize:20,flexShrink:0}}>💡</span><div style={{fontSize:14,color:'var(--label)',fontFamily:FT,lineHeight:1.55,fontStyle:'italic'}}>{_s(c.fun_fact_ru)}</div></div></div>}
{!v&&<div style={{borderRadius:16,background:'rgba(0,122,255,.06)',border:'1px solid rgba(0,122,255,.12)',padding:16,marginBottom:12}}><div style={{display:'flex',gap:10,alignItems:'flex-start'}}><span style={{fontSize:20,flexShrink:0}}>📷</span><div><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT,marginBottom:4}}>Как открыть страну?</div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5}}>Найдите павильон этой страны в парке и отсканируйте QR-код у входа. Вы получите штамп в паспорт и +15 баллов!</div></div></div></div>}
</div>);})():<div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
{countries.map((c:any)=>{const v=visitedC.includes(c.id);return(
<div key={c.id} className="tap" onClick={()=>setSelectedCountry(c)} style={{width:64,textAlign:'center'}}>
<div style={{width:64,height:64,borderRadius:32,border:v?'3px solid #34C759':'2.5px dashed var(--sep-opaque)',background:v?'rgba(52,199,89,.08)':'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{_s(c.flag_emoji)}</div>
<div style={{fontSize:10,color:v?'var(--label)':'var(--label3)',fontFamily:FT,marginTop:4,lineHeight:1.2}}>{_s(c.name_ru)}</div>
</div>)})}
<div style={{width:'100%',borderRadius:16,background:'rgba(0,122,255,.06)',border:'1px solid rgba(0,122,255,.12)',padding:14,marginTop:8}}><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,textAlign:'center'}}>📷 Сканируйте QR-коды у павильонов стран, чтобы собрать штампы · +15 баллов за каждую</div></div>
</div>}</div>)}

        {view==='regions'&&(<div style={{padding:'0 20px'}}>{selectedRegion?(()=>{const r=selectedRegion;const v=visitedR.includes(r.id);const stamp=stampsData.find((s:any)=>s.region_id===r.id);return(<div>
<div className="tap" onClick={()=>setSelectedRegion(null)} style={{display:'flex',alignItems:'center',gap:6,marginBottom:16}}><svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:17,color:'#007AFF',fontFamily:FT}}>Все регионы</span></div>
<div style={{borderRadius:24,background:'linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)',padding:'28px 20px',position:'relative',overflow:'hidden',marginBottom:16}}>
<div style={{position:'absolute',inset:0,opacity:.04,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)',backgroundSize:'14px 14px'}}/>
<div style={{position:'relative',textAlign:'center'}}>
{r.coat_of_arms_url?<img src={r.coat_of_arms_url} alt="" style={{width:72,height:72,objectFit:'contain',filter:'drop-shadow(0 2px 8px rgba(0,0,0,.3))'}}/>:<div style={{fontSize:48}}>{_s(r.flag_emoji||'🏛️')}</div>}
<div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD}}>{_s(r.name_ru)}</div>
<div style={{fontSize:13,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:4}}>{_s(r.federal_district)} ФО</div>
{v?(<div style={{marginTop:16,padding:'12px 20px',borderRadius:16,background:'rgba(52,199,89,.15)',border:'1px solid rgba(52,199,89,.3)',display:'inline-block'}}><div style={{fontSize:11,fontWeight:700,color:'rgba(52,199,89,.7)',textTransform:'uppercase',letterSpacing:1}}>ПОСЕЩЕНО</div><div style={{fontSize:18,fontWeight:700,color:'#34C759',fontFamily:FD,marginTop:2,transform:'rotate(-3deg)'}}>{stamp?.earned_at?new Date(stamp.earned_at).toLocaleDateString('ru',{day:'numeric',month:'short',year:'numeric'}):'Открыто'}</div>{stamp?.points_earned&&<div style={{fontSize:11,color:'rgba(52,199,89,.7)',marginTop:2}}>+{stamp.points_earned} баллов</div>}</div>):(<div style={{marginTop:16,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><span style={{fontSize:20}}>🔒</span><span style={{fontSize:14,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Отсканируйте QR-код</span></div>)}
</div></div>
{r.description_ru&&<div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:16,marginBottom:12}}><div style={{fontSize:15,color:'var(--label)',fontFamily:FT,lineHeight:1.6}}>{_s(r.description_ru)}</div></div>}
<div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginBottom:12}}>
{[['🏛️','Столица',_s(r.capital)],['👥','Население',r.population?(Number(r.population)/1e6).toFixed(1)+' млн':'—'],['📐','Площадь',r.area_km2?Number(r.area_km2).toLocaleString('ru')+' км²':'—'],['⭐','Баллы за открытие','+'+(r.reward_points||15)]].map(([ic,lb,vl]:any,i:number)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:i<3?'0.5px solid var(--sep)':'none'}}><span style={{fontSize:18}}>{ic}</span><div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{lb}</div><span style={{fontSize:14,color:'var(--label2)',fontFamily:FT,fontWeight:500}}>{vl}</span></div>))}
</div>
{r.fun_fact_ru&&<div style={{borderRadius:16,background:'rgba(255,149,0,.06)',border:'1px solid rgba(255,149,0,.15)',padding:16,marginBottom:12}}><div style={{display:'flex',gap:10,alignItems:'flex-start'}}><span style={{fontSize:20,flexShrink:0}}>💡</span><div style={{fontSize:14,color:'var(--label)',fontFamily:FT,lineHeight:1.55,fontStyle:'italic'}}>{_s(r.fun_fact_ru)}</div></div></div>}
{!v&&<div style={{borderRadius:16,background:'rgba(0,122,255,.06)',border:'1px solid rgba(0,122,255,.12)',padding:16,marginBottom:12}}><div style={{display:'flex',gap:10,alignItems:'flex-start'}}><span style={{fontSize:20,flexShrink:0}}>📷</span><div><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT,marginBottom:4}}>Как открыть регион?</div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5}}>Найдите стенд этого региона в галерее и отсканируйте QR-код. Штамп + {r.reward_points||15} баллов!</div></div></div></div>}
</div>);})():(()=>{
const fds=[...new Set(regions.map((rr:any)=>rr.federal_district).filter(Boolean))];
const filtered=regionFd?regions.filter((rr:any)=>rr.federal_district===regionFd):regions;
return(<><div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:4}}>
<div className="tap" onClick={()=>setRegionFd('')} style={{padding:'6px 14px',borderRadius:20,fontSize:13,fontFamily:FT,flexShrink:0,background:!regionFd?'var(--label)':'var(--fill4)',color:!regionFd?'#fff':'var(--label2)'}}>Все</div>
{fds.map((fd:string)=>(<div key={fd} className="tap" onClick={()=>setRegionFd(fd)} style={{padding:'6px 14px',borderRadius:20,fontSize:13,fontFamily:FT,flexShrink:0,background:regionFd===fd?'var(--label)':'var(--fill4)',color:regionFd===fd?'#fff':'var(--label2)'}}>{_s(fd)}</div>))}
</div>
<div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
{filtered.map((rr:any,i:number)=>{const v=visitedR.includes(rr.id);return(
<div key={rr.id} className="tap" onClick={()=>setSelectedRegion(rr)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<filtered.length-1?'0.5px solid var(--sep)':'none'}}>
{rr.coat_of_arms_url?<img src={rr.coat_of_arms_url} alt="" style={{width:28,height:28,objectFit:'contain'}}/>:<span style={{fontSize:20}}>{_s(rr.flag_emoji||'🏳️')}</span>}
<div style={{flex:1}}><div style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>{_s(rr.name_ru)}</div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>{_s(rr.capital)}</div></div>
{v?<span style={{fontSize:12,color:'#34C759',fontWeight:600}}>✓</span>:<span style={{fontSize:12,color:'var(--label4)'}}>🔒</span>}
<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
</div>)})}
</div>
<div style={{borderRadius:16,background:'rgba(0,122,255,.06)',border:'1px solid rgba(0,122,255,.12)',padding:14,marginTop:12}}><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,textAlign:'center'}}>📷 Сканируйте QR-коды у стендов регионов · от 15 до 30 баллов</div></div>
</>);})()}</div>)}

        {view==='achievements'&&(
          <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:10}}>
            {achievements.map((a:any,i:number)=>(
              <div key={a.id||i} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14,display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:44,height:44,borderRadius:13,background:unlockedAchs.includes(a.id)?'rgba(52,199,89,.12)':'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,opacity:unlockedAchs.includes(a.id)?1:.4}}>{_s(a.icon||'🏆')}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600,color:unlockedAchs.includes(a.id)?'var(--label)':'var(--label3)',fontFamily:FT}}>{_s(a.name_ru)}</div>
                  <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{_s(a.description_ru)}</div>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:unlockedAchs.includes(a.id)?'#34C759':'var(--label4)',fontFamily:FT}}>{_s(unlockedAchs.includes(a.id)?'✓':'+'+a.reward_points)}</div>
              </div>
            ))}
          </div>
        )}

        {view==='bookings'&&(
          <div style={{padding:'0 20px'}}>{bookings.length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>🎟️</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>Нет бронирований</div></div>:
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>{bookings.map((b:any,i:number)=>(
              <div key={b.id||i} style={{padding:'14px 16px',borderBottom:i<bookings.length-1?'0.5px solid var(--sep)':'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{_s(b.item_name||'Бронь')}</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{_s(b.type)} · {new Date(b.created_at).toLocaleDateString('ru')}</div></div>
                <div style={{fontSize:15,fontWeight:700,color:'#34C759',fontFamily:FD}}>{(b.total_price||0).toLocaleString('ru')} ₽</div>
              </div>
            ))}</div>}
          </div>
        )}

        {view==='favorites'&&(
          <div style={{padding:'0 20px'}}>{favs.length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>❤️</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>Пусто</div></div>:
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>{favs.map((f:any,i:number)=>(
              <div key={f.id||i} style={{padding:'14px 16px',borderBottom:i<favs.length-1?'0.5px solid var(--sep)':'none',display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24}}>{_s(f.item_emoji||'❤️')}</span>
                <div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{_s(f.item_name)}</div>
              </div>
            ))}</div>}
          </div>
        )}

        {view==='reviews'&&(
          <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
            {revs.length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>📝</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>Нет отзывов</div></div>:
            revs.map((r:any,i:number)=>(
              <div key={r.id||i} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{_s(r.item_name)}</div>
                  <div style={{color:'#FF9500',fontSize:13}}>{'★'.repeat(r.rating||0)+'☆'.repeat(5-(r.rating||0))}</div>
                </div>
                <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,fontStyle:'italic'}}>«{_s(r.comment)}»</div>
                <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:6}}>{new Date(r.created_at).toLocaleDateString('ru',{day:'numeric',month:'long',year:'numeric'})}</div>
              </div>
            ))}
          </div>
        )}

        {view==='wallet'&&(
          <div style={{padding:'0 20px'}}>
            <div style={{borderRadius:22,background:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',padding:20,marginBottom:16,position:'relative',overflow:'hidden'}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px'}}>Баланс очков</div>
              <div style={{fontSize:36,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4}}>{pts}</div>
              <div style={{display:'flex',gap:16,marginTop:12}}>
                <div><div style={{fontSize:14,fontWeight:700,color:'#34C759',fontFamily:FD}}>+30</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>посещение</div></div>
                <div><div style={{fontSize:14,fontWeight:700,color:'#FF9500',fontFamily:FD}}>+50</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>QR</div></div>
                <div><div style={{fontSize:14,fontWeight:700,color:'#AF52DE',fontFamily:FD}}>+100</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>отзыв</div></div>
              </div>
            </div>
            <div className="tap" onClick={()=>{const nom=prompt('Номинал сертификата (1000, 3000, 5000, 10000):');if(!nom)return;const n=parseInt(nom);if(![1000,3000,5000,10000].includes(n)){alert('Выберите: 1000, 3000, 5000 или 10000');return;}const rn=prompt('Имя получателя:');if(!rn)return;const rp=prompt('Телефон получателя:');const msg=prompt('Сообщение (необязательно):')||'';const code='GIFT'+Date.now().toString(36).toUpperCase();fetch(SB_URL+'/rest/v1/gift_certificates',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({nominal:n,balance:n,code,status:'active',recipient_name:rn,recipient_phone:rp||'',message:msg,valid_until:new Date(Date.now()+365*86400000).toISOString()})});alert('Сертификат создан!\\nКод: '+code+'\\nНоминал: '+n+' ₽');}} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#FF6B6B,#FFD93D)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🎁</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Подарочный сертификат</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>1 000 – 10 000 ₽</div></div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:10}}>История</div>
            {(()=>{
              const all=[...walletTx.map((t:any)=>({...t,src:'w'})),...pointsLog.map((p:any)=>({id:p.id,description:p.description,amount:p.points,created_at:p.created_at,src:'p'}))].sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
              if(!all.length)return <div style={{textAlign:'center',padding:30,color:'var(--label3)',fontFamily:FT,fontSize:14}}>Посещайте парк!</div>;
              return all.map((tx:any,i:number)=>(
                <div key={tx.id||i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<all.length-1?'0.5px solid var(--sep)':'none'}}>
                  <div style={{width:34,height:34,borderRadius:10,background:tx.src==='p'?'rgba(0,122,255,.1)':tx.amount>0?'rgba(52,199,89,.1)':'rgba(255,59,48,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>{tx.src==='p'?'⭐':tx.amount>0?'➕':'➖'}</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{_sv(tx.description||'')}</div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{new Date(tx.created_at).toLocaleDateString('ru')}</div></div>
                  <div style={{fontSize:14,fontWeight:700,color:tx.src==='p'?'#007AFF':tx.amount>0?'#34C759':'#FF3B30',fontFamily:FD}}>{tx.amount>0?'+':''}{tx.amount}{tx.src==='p'?' оч.':' ₽'}</div>
                </div>
              ));
            })()}
          </div>
        )}

        {view==='settings'&&(
          <div style={{padding:'0 20px'}}>
            {selectedLegal ? (
              <div>
                <div className="tap" onClick={()=>setSelectedLegal(null)} style={{display:'flex',alignItems:'center',gap:6,marginBottom:16}}>
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{fontSize:17,color:'#007AFF',fontFamily:FT}}>Назад</span>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:16}}>{_s(selectedLegal.title_ru)}</div>
                <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,lineHeight:1.65,whiteSpace:'pre-line'}}>{String(selectedLegal.body_ru||'')}</div>
              </div>
            ) : (<>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
              {[['push_enabled','Push-уведомления'],['marketing_consent','Маркетинговые рассылки']].map(([key,label]:any,i:number)=>(
                <div key={key} className="tap" onClick={async()=>{const nv={...userSet,[key]:!userSet[key]};setUserSet(nv);if(session?.user?.id){await fetch(SB_URL+'/rest/v1/user_settings?user_id=eq.'+session.user.id,{method:'PATCH',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({[key]:!userSet[key]})}).catch(()=>{});await fetch(SB_URL+'/rest/v1/user_settings',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal,resolution=merge-duplicates'},body:JSON.stringify({user_id:session.user.id,[key]:nv[key]})}).catch(()=>{});}}} style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:i<1?'0.5px solid var(--sep)':'none'}}>
                  <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>{label}</span>
                  <div style={{width:51,height:31,borderRadius:16,background:userSet[key]?'#34C759':'var(--fill4)',padding:2,transition:'background .2s'}}><div style={{width:27,height:27,borderRadius:14,background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,.2)',transform:userSet[key]?'translateX(20px)':'translateX(0)',transition:'transform .2s cubic-bezier(0.2,0.8,0.2,1)'}}/></div>
                </div>
              ))}
            </div>

            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginTop:12}}>
              <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid var(--sep)'}}>
                <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>Язык</span>
                <span style={{fontSize:15,color:'var(--label3)',fontFamily:FT}}>Русский</span>
              </div>
              <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>Тема</span>
                <span style={{fontSize:15,color:'var(--label3)',fontFamily:FT}}>Авто</span>
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginTop:24,marginBottom:6}}>Данные паспорта</div>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginBottom:12}}>
              <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--sep)'}}>
                <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginBottom:6}}>Дата рождения</div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>{(()=>{const bd=(editBirth||profile?.birth_date||"").split("-");const dy=bd[2]||"";const mo=bd[1]||"";const yr=bd[0]||"";return [<select key="d" value={dy} onChange={(e:any)=>{const p=(editBirth||profile?.birth_date||"2000-01-01").split("-");p[2]=e.target.value;setEditBirth(p.join("-"));}} style={{flex:1,fontSize:17,fontFamily:FT,fontWeight:500,color:'var(--label)',background:'var(--fill4)',border:'none',borderRadius:12,padding:'12px 4px',textAlign:'center',outline:'none'}}>{Array.from({length:31},(_:any,i:number)=><option key={i+1} value={String(i+1).padStart(2,"0")}>{i+1}</option>)}</select>,<select key="m" value={mo} onChange={(e:any)=>{const p=(editBirth||profile?.birth_date||"2000-01-01").split("-");p[1]=e.target.value;setEditBirth(p.join("-"));}} style={{flex:1.5,fontSize:17,fontFamily:FT,fontWeight:500,color:'var(--label)',background:'var(--fill4)',border:'none',borderRadius:12,padding:'12px 4px',textAlign:'center',outline:'none'}}>{["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"].map((m:string,i:number)=><option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>,<select key="y" value={yr} onChange={(e:any)=>{const p=(editBirth||profile?.birth_date||"2000-01-01").split("-");p[0]=e.target.value;setEditBirth(p.join("-"));}} style={{flex:1.2,fontSize:17,fontFamily:FT,fontWeight:500,color:'var(--label)',background:'var(--fill4)',border:'none',borderRadius:12,padding:'12px 4px',textAlign:'center',outline:'none'}}>{Array.from({length:80},(_:any,i:number)=><option key={i} value={String(2010-i)}>{2010-i}</option>)}</select>]})()}</div>
              </div>
              <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--sep)'}}>
                <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginBottom:6}}>Пол</div>
                <div style={{display:'flex',gap:8}}>{[["male","Мужской"],["female","Женский"]].map(([v,l]:any)=>(<div key={v} className="tap" onClick={()=>setEditGender(v)} style={{padding:'8px 16px',borderRadius:10,fontSize:14,fontFamily:FT,background:(editGender||profile?.gender)===v?'var(--blue)':'var(--fill4)',color:(editGender||profile?.gender)===v?'#fff':'var(--label)'}}>{l}</div>))}</div>
              </div>
              <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--sep)'}}>
                <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginBottom:6}}>Гражданство</div>
                <div style={{fontSize:16,fontFamily:FT,color:'var(--label3)'}}>Гражданин Этномира</div>
              </div>
              <div className="tap" onClick={async()=>{const u={} as any;if(editBirth)u.birth_date=editBirth;if(editGender)u.gender=editGender;if(editNation)u.nationality=editNation;if(Object.keys(u).length&&session?.user?.id){await fetch(SB_URL+'/rest/v1/profiles?id=eq.'+session.user.id,{method:'PATCH',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(u)});setProfile({...profile,...u});setEditBirth('');setEditGender('');setEditNation('');alert('Сохранено!');}}} style={{padding:'14px 16px',textAlign:'center'}}>
                <span style={{fontSize:15,fontWeight:600,color:'var(--blue)',fontFamily:FT}}>Сохранить изменения</span>
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginTop:24,marginBottom:6}}>Аккаунт</div>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--sep)'}}>
                <div style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>Email</div>
                <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{_sv(session?.user?.email||'—')}</div>
              </div>
              <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--sep)'}}>
                <div style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>Телефон</div>
                <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{profile?.phone||'—'}</div>
              </div>
              <div style={{padding:'14px 16px'}}>
                <div style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>ID</div>
                <div style={{fontSize:11,color:'var(--label3)',fontFamily:'monospace',marginTop:2}}>{_sv(session?.user?.id?.slice(0,8)||'—')}</div>
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginTop:24,marginBottom:6}}>Правовая информация</div>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
              {legalDocs.length>0?legalDocs.map((doc:any,i:number)=>(
                <div key={doc.id} className="tap" onClick={()=>setSelectedLegal(doc)} style={{padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:i<legalDocs.length-1?'0.5px solid var(--sep)':'none'}}>
                  <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>{_s(doc.title_ru)}</span>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              )):['Политика конфиденциальности','Пользовательское соглашение','Публичная оферта'].map((t:string,i:number)=>(
                <div key={i} style={{padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:i<2?'0.5px solid var(--sep)':'none'}}>
                  <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>{t}</span>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              ))}
            </div>

            <div style={{textAlign:'center',padding:'32px 0 48px'}}>
              <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FD}}>Этномир.</div>
              <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:3}}>Крупнейший парк РФ</div>
              <div style={{marginTop:14,fontSize:12,color:'var(--label3)',fontFamily:FT,lineHeight:1.7}}>С 9:00 до 21:00 ежедневно<br/>+7 (495) 023-43-49</div>
              <div style={{marginTop:14}}><span className="tap" onClick={()=>window.open('https://billionsx.com','_blank')} style={{fontSize:11,color:'var(--label4)',cursor:'pointer'}}>Разработчик приложения billionsx.com</span></div>
            </div>
            </>)}
          </div>
        )}
      </div>
    );
  }

  // === NOT LOGGED IN — MULTI AUTH ===
  const sendOtp = async () => {
    if(phoneInput.replace(/\D/g,'').length<11){setLoginErr('Введите номер телефона');return;}
    setLoginLoading(true);setLoginErr('');setOtpInput('');
    try{
      const r=await fetch(SB_URL+'/functions/v1/send-otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:phoneInput})});
      const d=await r.json();
      if(d.success){setAuthStep('otp');setCountdown(60);setDevCode(d.dev_code||'');setOtpInput('');}
      else{setLoginErr(d.error||'Ошибка');}
    }catch(_e){setLoginErr('Ошибка сети');}
    setLoginLoading(false);
  };
  const verifyOtp = async (val?:string) => {
    const c = val || otpInput;
    if(c.length!==6){setLoginErr('Введите 6 цифр');return;}
    setLoginLoading(true);setLoginErr('');
    try{
      const r=await fetch(SB_URL+'/functions/v1/verify-otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:phoneInput,code:c})});
      const d=await r.json();
      if(d.success&&d.session){
        localStorage.setItem('sb_session',JSON.stringify({...d.session,user:{id:d.user?.id||'',email:d.user?.email||'',phone:d.user?.phone||''}}));
        window.location.reload();
      }else{setLoginErr(d.error||'Неверный код');}
    }catch(_e){setLoginErr('Ошибка сети');}
    setLoginLoading(false);
  };
  const fmtPh=(v:string)=>{
    const d=v.replace(/\D/g,'');if(d.length<=1)return'+7';
    let f='+7';if(d.length>1)f+=' ('+d.slice(1,4);if(d.length>4)f+=') '+d.slice(4,7);
    if(d.length>7)f+='-'+d.slice(7,9);if(d.length>9)f+='-'+d.slice(9,11);return f;
  };
  const doResetPassword=async()=>{
    if(!loginEmail){setLoginErr('Введите email');return;}
    setLoginLoading(true);setLoginErr('');
    try{const r=await fetch(SB_URL+'/auth/v1/recover',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY},body:JSON.stringify({email:loginEmail,gotrue_meta_security:{captcha_token:''}})});
      if(r.ok){setLoginErr('Письмо отправлено на '+loginEmail);setLoginEmail('');setLoginPass('');}else{const d=await r.json();setLoginErr(d.error_description||d.msg||'Ошибка');}}
    catch(_e){setLoginErr('Ошибка');}
    setLoginLoading(false);
  };

  if(!session) return(
    <div style={{padding:'20px'}}>
      <div style={{borderRadius:24,background:'linear-gradient(160deg,#4A0E0E,#7B1818,#5A1010)',padding:'32px 22px',position:'relative',overflow:'hidden',marginBottom:24}}>
        <div style={{position:'absolute',inset:0,opacity:.03,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)',backgroundSize:'14px 14px'}}/>
        <div style={{position:'absolute',top:16,right:16,width:56,height:56,borderRadius:28,border:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}><svg width="44" height="44" viewBox="0 0 200 200"><defs><radialGradient id="rp"><stop offset="0%" stopColor="#D4AF37" stopOpacity=".4"/><stop offset="100%" stopColor="#D4AF37" stopOpacity=".05"/></radialGradient></defs><circle cx="100" cy="100" r="38" fill="url(#rp)"/><circle cx="100" cy="100" r="60" fill="none" stroke="rgba(212,175,55,.12)" strokeWidth="1" strokeDasharray="4 4"/><ellipse cx="100" cy="100" rx="45" ry="20" fill="none" stroke="rgba(212,175,55,.1)" strokeWidth="1"/><circle cx="100" cy="62" r="4" fill="#FFD60A" opacity=".6" style={{animation:"frFloat 3s ease-in-out infinite"}}/><circle cx="138" cy="100" r="3" fill="#D4AF37" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite .5s"}}/><circle cx="62" cy="100" r="3" fill="#D4AF37" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite 1.5s"}}/><text x="100" y="108" textAnchor="middle" fontSize="24" fill="rgba(212,175,55,.4)" fontWeight="700" fontFamily="system-ui">ЭМ</text></svg></div>
        <div style={{position:'relative'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:2.5,fontFamily:FT,textTransform:'uppercase'}}>КРУПНЕЙШИЙ ПАРК РФ</div>
          <div style={{fontSize:14,color:'#D4AF37',fontWeight:700,letterSpacing:3,fontFamily:FT,marginTop:6}}>ПАСПОРТ</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:600,letterSpacing:2,fontFamily:FT,marginTop:12,textTransform:'uppercase'}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА ЭТНОМИРА</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:16}}>Войдите, чтобы получить паспорт</div>
        </div></div>
      <div style={{display:'flex',borderRadius:10,background:'var(--fill4)',padding:2,marginBottom:16}}>
        <div className="tap" onClick={()=>{setAuthMode('phone');setAuthStep('phone');setLoginErr('');}} style={{flex:1,padding:'8px 0',borderRadius:8,textAlign:'center',fontSize:14,fontWeight:authMode==='phone'?600:400,fontFamily:FT,color:authMode==='phone'?'var(--label)':'var(--label2)',background:authMode==='phone'?'var(--bg2)':'transparent',transition:'all .2s'}}>📱 Телефон</div>
        <div className="tap" onClick={()=>{setAuthMode('email');setLoginErr('');}} style={{flex:1,padding:'8px 0',borderRadius:8,textAlign:'center',fontSize:14,fontWeight:authMode==='email'?600:400,fontFamily:FT,color:authMode==='email'?'var(--label)':'var(--label2)',background:authMode==='email'?'var(--bg2)':'transparent',transition:'all .2s'}}>✉️ Email</div>
      </div>
      <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'20px 16px'}}>
        {authMode==='phone'?(<>
          {authStep==='phone'?(<>
            <div style={{borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',padding:'0 16px'}}>
                <span style={{fontSize:20,marginRight:8}}>🇷🇺</span>
                <input value={fmtPh(phoneInput)} onChange={(e:any)=>{const raw=e.target.value.replace(/\D/g,'');setPhoneInput('+'+raw.slice(0,11));setLoginErr('');}} placeholder="+7 (900) 123-45-67" type="tel" autoFocus style={{width:'100%',padding:'16px 0',border:'none',background:'transparent',fontSize:18,fontFamily:FT,outline:'none',color:'var(--label)',fontWeight:500,letterSpacing:0.5}}/>
              </div></div>
            {loginErr&&<div style={{fontSize:13,color:loginErr.includes('Письмо')?'#34C759':'#FF3B30',fontFamily:FT,marginBottom:10,textAlign:'center'}}>{loginErr}</div>}
            <div className="tap" onClick={()=>!loginLoading&&sendOtp()} style={{padding:'16px',borderRadius:14,background:loginLoading?'rgba(0,122,255,0.5)':'#007AFF',textAlign:'center'}}>
              <span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{loginLoading?'Отправка...':'Получить код'}</span></div>
            <div style={{textAlign:'center',marginTop:14}}><span style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>Мы отправим SMS с кодом</span></div>
          </>):(<>
            <div style={{textAlign:'center',marginBottom:14}}><span style={{fontSize:15,color:'var(--label)',fontFamily:FT,fontWeight:500}}>Код отправлен на {fmtPh(phoneInput)}</span></div>
            <div style={{position:'relative',display:'flex',gap:8,justifyContent:'center',marginBottom:14}}>
              {[0,1,2,3,4,5].map((i:number)=>(<div key={i} style={{width:46,height:56,borderRadius:12,border:otpInput.length===i?'2px solid #007AFF':'1.5px solid var(--sep-opaque)',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'var(--label)',fontFamily:FT,transition:'border-color .2s'}}>{otpInput[i]||''}</div>))}
              <input value={otpInput} onChange={(e:any)=>{const v=e.target.value.replace(/\D/g,'').slice(0,6);setOtpInput(v);setLoginErr('');if(v.length===6)setTimeout(()=>verifyOtp(v),200);}} type="tel" autoFocus inputMode="numeric" autoComplete="one-time-code" style={{position:'absolute',inset:0,opacity:0,fontSize:24}}/>
            </div>
            {loginErr&&<div style={{fontSize:13,color:'#FF3B30',fontFamily:FT,marginBottom:10,textAlign:'center'}}>{loginErr}</div>}
            {devCode&&<div style={{fontSize:12,color:'var(--label2)',fontFamily:FT,marginBottom:10,textAlign:'center',background:'rgba(0,122,255,0.06)',padding:'8px 12px',borderRadius:8}}>DEV: <span style={{fontWeight:700,color:'#007AFF',letterSpacing:2}}>{devCode}</span></div>}
            <div className="tap" onClick={()=>!loginLoading&&verifyOtp()} style={{padding:'16px',borderRadius:14,background:loginLoading||otpInput.length<6?'rgba(0,122,255,0.3)':'#007AFF',textAlign:'center',marginBottom:12}}>
              <span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{loginLoading?'Проверка...':'Подтвердить'}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div className="tap" onClick={()=>{setAuthStep('phone');setOtpInput('');setLoginErr('');setDevCode('');}} style={{fontSize:14,color:'#007AFF',fontFamily:FT}}>← Номер</div>
              {countdown>0?<span style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>{countdown}с</span>:<div className="tap" onClick={()=>{setOtpInput('');setLoginErr('');sendOtp();}} style={{fontSize:14,color:'#007AFF',fontFamily:FT}}>Повторить</div>}
            </div>
          </>)}
        </>):(<>
          <div style={{borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginBottom:14}}>
            {isRegister&&<><input value={regName} onChange={(e:any)=>setRegName(e.target.value)} placeholder="Имя" style={{width:'100%',padding:'14px 16px',border:'none',background:'transparent',fontSize:16,fontFamily:FT,outline:'none',color:'var(--label)',boxSizing:'border-box'}}/><div style={{height:'0.5px',background:'var(--sep)',marginLeft:16}}/></>}
            <input value={loginEmail} onChange={(e:any)=>setLoginEmail(e.target.value)} placeholder="Email" type="email" style={{width:'100%',padding:'14px 16px',border:'none',background:'transparent',fontSize:16,fontFamily:FT,outline:'none',color:'var(--label)',boxSizing:'border-box'}}/>
            <div style={{height:'0.5px',background:'var(--sep)',marginLeft:16}}/>
            <input value={loginPass} onChange={(e:any)=>setLoginPass(e.target.value)} type="password" placeholder="Пароль" style={{width:'100%',padding:'14px 16px',border:'none',background:'transparent',fontSize:16,fontFamily:FT,outline:'none',color:'var(--label)',boxSizing:'border-box'}}/>
          </div>
          {loginErr&&<div style={{fontSize:13,color:loginErr.includes('Письмо')?'#34C759':'#FF3B30',fontFamily:FT,marginBottom:10,textAlign:'center'}}>{loginErr}</div>}
          <div className="tap" onClick={async()=>{if(!loginEmail||!loginPass)return;setLoginLoading(true);setLoginErr('');if(isRegister){if(!regName.trim()){setLoginErr('Введите имя');setLoginLoading(false);return;}const sr=await sbAuth('signup',{email:loginEmail,password:loginPass});if(sr.error){setLoginErr(sr.error.message||'Ошибка');}else if(sr.access_token){await fetch(SB_URL+'/rest/v1/profiles',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+sr.access_token,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({id:sr.user?.id,name:regName,email:loginEmail})});const lr=await onLogin(loginEmail,loginPass);if(!lr.ok)setLoginErr(lr.error);}else{setLoginErr('Проверьте email');}}else{const r=await onLogin(loginEmail,loginPass);if(!r.ok)setLoginErr(r.error);}setLoginLoading(false);}}
            style={{padding:'14px',borderRadius:14,background:'#007AFF',textAlign:'center',opacity:loginLoading?.5:1}}>
            <span style={{fontSize:16,fontWeight:600,color:'#fff',fontFamily:FT}}>{loginLoading?(isRegister?'Регистрация...':'Вход...'):(isRegister?'Зарегистрироваться':'Войти')}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
            <div className="tap" onClick={()=>{setIsRegister(!isRegister);setLoginErr('');}} style={{fontSize:14,color:'#007AFF',fontFamily:FT}}>{isRegister?'Войти':'Регистрация'}</div>
            {!isRegister&&<div className="tap" onClick={doResetPassword} style={{fontSize:14,color:'var(--label2)',fontFamily:FT}}>Забыли пароль?</div>}
          </div>
        </>)}
      </div>
      <div style={{marginTop:20}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}><div style={{flex:1,height:'0.5px',background:'var(--sep)'}}/><span style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>или</span><div style={{flex:1,height:'0.5px',background:'var(--sep)'}}/></div>
        <div style={{display:'flex',justifyContent:'center',gap:12}}>
          <div className="tap" style={{width:52,height:52,borderRadius:14,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="22" height="22" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="var(--label)"/></svg></div>
          <div className="tap" style={{width:52,height:52,borderRadius:14,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></div>
          <div className="tap" style={{width:52,height:52,borderRadius:14,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="24" height="14" viewBox="0 0 24 14"><path d="M12.77 13.84c-7.82 0-12.28-5.36-12.47-14.27h3.92c.13 6.55 3.01 9.32 5.3 9.9V-.43h3.68v5.64c2.26-.24 4.64-2.82 5.44-5.64h3.68c-.61 3.48-3.17 6.06-4.99 7.12 1.82.84 4.77 3.12 5.89 7.15h-4.06c-.87-2.72-3.05-4.82-5.96-5.11v5.11h-.43z" fill="#0077FF"/></svg></div>
        </div>
        <div style={{textAlign:'center',marginTop:12}}><span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Apple, Google, VK — скоро</span></div>
      </div>
      <div style={{textAlign:'center',marginTop:16,padding:'0 10px'}}><span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Нажимая «Войти», вы принимаете <span style={{color:'#007AFF'}}>условия</span> и <span style={{color:'#007AFF'}}>политику</span></span></div>
    </div>);
  
  // === LOGGED IN: iOS grouped menu ===
  if(loading) return <div style={{padding:60,textAlign:'center'}}><Spinner/></div>;

  

  return(
    <div style={{paddingBottom:40}}>
      {/* Passport Card */}
      <div style={{padding:'12px 20px 0'}}>
        <div style={{borderRadius:24,background:'linear-gradient(160deg,#4A0E0E,#7B1818,#5A1010)',padding:'24px 20px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,opacity:.03,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)',backgroundSize:'14px 14px'}}/>
          <div style={{position:'relative',textAlign:'center'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:2.5,fontFamily:FT}}>КРУПНЕЙШИЙ ПАРК РФ</div>
            <div style={{margin:'12px auto',width:72,height:72,borderRadius:36,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="64" height="64" viewBox="0 0 200 200"><defs><radialGradient id="rpL"><stop offset="0%" stopColor="#D4AF37" stopOpacity=".3"/><stop offset="100%" stopColor="#D4AF37" stopOpacity=".05"/></radialGradient></defs><circle cx="100" cy="100" r="40" fill="url(#rpL)"/><circle cx="100" cy="100" r="65" fill="none" stroke="rgba(212,175,55,.12)" strokeWidth="1" strokeDasharray="4 4"/><ellipse cx="100" cy="100" rx="50" ry="22" fill="none" stroke="rgba(212,175,55,.08)" strokeWidth="1"/><ellipse cx="100" cy="100" rx="22" ry="50" fill="none" stroke="rgba(212,175,55,.08)" strokeWidth="1"/><circle cx="100" cy="48" r="5" fill="#FFD60A" opacity=".7" style={{animation:"frFloat 3s ease-in-out infinite"}}/><circle cx="152" cy="100" r="4" fill="#5AC8FA" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite .5s"}}/><circle cx="100" cy="152" r="4" fill="#FF9500" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite 1s"}}/><circle cx="48" cy="100" r="5" fill="#34C759" opacity=".6" style={{animation:"frFloat 3s ease-in-out infinite 1.5s"}}/><circle cx="135" cy="60" r="3" fill="#AF52DE" opacity=".4" style={{animation:"frFloat 3s ease-in-out infinite 2s"}}/><circle cx="65" cy="140" r="3" fill="#FF2D55" opacity=".4" style={{animation:"frFloat 3s ease-in-out infinite 2.5s"}}/><text x="100" y="108" textAnchor="middle" fontSize="28" fill="rgba(212,175,55,.4)" fontWeight="700" fontFamily="system-ui">ЭМ</text></svg></div>
            <div style={{fontSize:14,color:'#D4AF37',fontWeight:700,letterSpacing:3,fontFamily:FT}}>ПАСПОРТ</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.3)',fontWeight:600,letterSpacing:1.5,fontFamily:FT,marginTop:2}}>PASSPORT</div>
          </div>
          <div style={{marginTop:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,position:'relative'}}>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ФАМИЛИЯ / ИМЯ</div><div style={{fontSize:13,color:'#D4AF37',fontWeight:600,fontFamily:FT,marginTop:2}}>{_sv(profile?.name||"—")}</div></div>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ГРАЖДАНСТВО</div><div style={{fontSize:13,color:'#D4AF37',fontWeight:600,fontFamily:FT,marginTop:2}}>{profile?.nationality||"Гражданин Этномира"}</div></div>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ДАТА РОЖДЕНИЯ</div><div style={{fontSize:12,color:'#fff',fontFamily:FT,marginTop:2}}>{profile?.birth_date?profile.birth_date.split("-").reverse().join("."):"—"}</div></div>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ПОЛ / SEX</div><div style={{fontSize:12,color:'#fff',fontFamily:FT,marginTop:2}}>{profile?.gender==="male"?"Мужской":profile?.gender==="female"?"Женский":"Не указан"}</div></div>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ПАСПОРТ №</div><div style={{fontSize:13,color:'#D4AF37',fontWeight:700,fontFamily:'monospace',marginTop:2,letterSpacing:1.5}}>{profile?.passport_number||"—"}</div></div>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ДАТА ВЫДАЧИ</div><div style={{fontSize:12,color:'#fff',fontFamily:FT,marginTop:2}}>{profile?.passport_issued_at?profile.passport_issued_at.split("-").reverse().join("."):"—"}</div></div>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ОРГАН ВЫДАЧИ</div><div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:2,lineHeight:1.3}}>{profile?.passport_authority||"Этномир"}</div></div>
            <div><div style={{fontSize:8,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ДЕЙСТВИТЕЛЕН ДО</div><div style={{fontSize:12,color:'#fff',fontFamily:FT,marginTop:2}}>{profile?.passport_expires_at?profile.passport_expires_at.split("-").reverse().join("."):"—"}</div></div>
          </div>
          <div style={{marginTop:14,paddingTop:10,borderTop:'1px solid rgba(212,175,55,.12)',display:'flex',justifyContent:'space-between',position:'relative'}}>
            <div><div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD}}>{visitedC.length}<span style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>/96</span></div><div style={{fontSize:9,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Стран</div></div>
            <div><div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD}}>{visitedR.length}<span style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>/85</span></div><div style={{fontSize:9,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Регионов</div></div>
            <div><div style={{fontSize:18,fontWeight:700,color:'#FFD60A',fontFamily:FD}}>{pts}</div><div style={{fontSize:9,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Баллов</div></div>
          </div>
        </div>
      </div>

      {/* Loyalty Level */}
      <div style={{padding:'12px 20px 0'}}>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:22}}>{_sv(curLvl?.icon||'🌱')}</span>
              <div style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{_sv(curLvl?.name_ru||'Гость')}</div>
            </div>
            {nxtLvl&&<div style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>До {_sv(nxtLvl.name_ru)}: {_sv(nxtLvl.min_points-pts)}</div>}
          </div>
          <div style={{height:5,borderRadius:3,background:'var(--fill4)',overflow:'hidden'}}><div style={{height:'100%',borderRadius:3,background:curLvl?.color||'#8E8E93',width:lvlPct+'%'}}/></div>
        </div>
      </div>

      {/* QR Button */}
      <div style={{padding:'12px 20px 0'}}>
        <div className="tap" onClick={onQR} style={{borderRadius:16,background:'#007AFF',padding:'15px',textAlign:'center'}}>
          <span style={{fontSize:16,fontWeight:600,color:'#fff',fontFamily:FT}}>📷  Сканировать QR-код</span>
        </div>
      </div>

      {/* Коллекция */}
      <div style={{padding:'20px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>Коллекция</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="🌍" label="Страны мира" value={visitedC.length+'/96'} onClick={()=>setView('countries')}/>
          <Row icon="🇷🇺" label="Регионы России" value={visitedR.length+'/85'} onClick={()=>setView('regions')}/>
          <Row icon="🏆" label="Достижения" value={unlockedAchs.length+'/'+achievements.length} onClick={()=>setView('achievements')} last/>
        </div>
      </div>

      {/* Мои данные */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>Мои данные</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="🎟️" label="Бронирования" value={bookings.length+''} onClick={()=>setView('bookings')}/>
          <Row icon="❤️" label="Избранное" value={favs.length+''} onClick={()=>setView('favorites')}/>
          <Row icon="📝" label="Мои отзывы" value={revs.length+''} onClick={()=>setView('reviews')} last/>
        </div>
      </div>

      {/* Кошелёк */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>Кошелёк</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="⭐" label="Баллы" value={pts+' оч.'} onClick={()=>setView('wallet')}/>
          <Row icon="👑" label="PRO подписка" value="990 ₽/мес" onClick={()=>setShowPro(!showPro)} last/>
        </div>
        {showPro&&subPlans.filter((p:any)=>p.slug!=='free').length>0&&(
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginTop:8}}>
            {subPlans.filter((p:any)=>p.slug!=='free').map((plan:any,i:number,arr:any[])=>{
              const features=(()=>{try{const f=typeof plan.features==='string'?JSON.parse(plan.features):plan.features;return Array.isArray(f)?f:[];}catch(e){return[];}})();
              return(<div key={plan.id||i} style={{padding:14,borderBottom:i<arr.length-1?'0.5px solid var(--sep)':'none'}}>
                <div style={{fontSize:16,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{_s(plan.name_ru)} <span style={{fontSize:13,color:'var(--label3)',fontWeight:400}}>{_s(plan.price_monthly)} ₽/мес</span></div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>{features.map((f:string,j:number)=>(<span key={j} style={{fontSize:11,color:'var(--green)',background:'rgba(52,199,89,.08)',padding:'2px 8px',borderRadius:6,fontFamily:FT}}>✓ {_s(f)}</span>))}</div>
                <div className="tap" onClick={async()=>{if(!session?.user?.id){alert('Войдите в аккаунт');return;}const ok=confirm('Оформить подписку «'+plan.name_ru+'» за '+plan.price_monthly+' ₽/мес?');if(!ok)return;await fetch(SB_URL+'/rest/v1/subscriptions',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({user_id:session.user.id,plan_id:plan.id,status:'active',started_at:new Date().toISOString(),expires_at:new Date(Date.now()+30*86400000).toISOString()})});await fetch(SB_URL+'/rest/v1/orders',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({type:'service',items:JSON.stringify([{name:'PRO: '+plan.name_ru,qty:1}]),total:plan.price_monthly,guest_name:profile?.name||'',status:'paid'})});alert('Подписка «'+plan.name_ru+'» активирована!');}} style={{marginTop:10,padding:'11px',borderRadius:14,background:'linear-gradient(135deg,#007AFF,#5856D6)',textAlign:'center'}}>
                  <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>Оформить за {_s(plan.price_monthly)} ₽/мес</span>
                </div>
              </div>);
            })}
          </div>
        )}
      </div>

      {/* Аккаунт */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>Аккаунт</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="⚙️" label="Настройки" onClick={()=>setView('settings')} last/>
        </div>
        <div className="tap" onClick={onLogout} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px',textAlign:'center',marginTop:8}}>
          <span style={{fontSize:15,fontWeight:500,color:'#FF3B30',fontFamily:FT}}>Выйти из аккаунта</span>
        </div>
      </div>
    </div>
  );
}

// ─── ETHNOMIR TAB ────────────────────────────────────────────
function EthnoMirTab({onFranchise,onLanding}:{onFranchise?:()=>void,onLanding?:(s:string)=>void}) {
  const [heritage, setHeritage] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [b2b, setB2b] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<string|null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [expandedBiz, setExpandedBiz] = useState<number|null>(null);
  const [ethnoContacts,setEthnoContacts]=useState<any[]>([]);
  const [parkInfo,setParkInfo]=useState<Record<string,string>>({});

  useEffect(()=>{
    Promise.all([
      sb('heritage_items','select=*&is_published=eq.true&order=sort_order.asc'),
      sb('partnership','select=*&is_published=eq.true&order=sort_order.asc'),
      sb('b2b_programs','select=*&is_active=eq.true&order=sort_order.asc'),
      sb('articles','select=*&is_published=eq.true&order=published_at.desc&limit=6'),
      sb('faq','select=*&is_published=eq.true&order=sort_order.asc'),
    sb('contacts','select=*&is_active=eq.true&order=sort_order.asc'),
      sb('park_info','select=key,value_ru'),
    ]).then(([h,p,b,a,f,ct,pi])=>{
      setHeritage(h||[]);setPartners(p||[]);setB2b(b||[]);setArticles(a||[]);setFaqs(f||[]);
      setEthnoContacts(ct||[]);
      const pm:Record<string,string>={};(pi||[]).forEach((r:any)=>{pm[r.key]=r.value_ru;});setParkInfo(pm);
      setLoading(false);
    });
  },[]);

  if(loading) return <div style={{padding:"60px 20px",textAlign:"center"}}><Spinner/></div>;

  // Article detail view
  if(selectedArticle) return (
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100}}>
      <div className="tap" onClick={()=>setSelectedArticle(null)} style={{display:"flex",alignItems:"center",gap:6,padding:"54px 20px 14px",background:"var(--bg)",position:"sticky",top:0,zIndex:10}}>
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{fontSize:17,color:"#007AFF",fontFamily:FT}}>Этномир</span>
      </div>
      <div style={{padding:"0 20px"}}>
        <div style={{fontSize:11,fontWeight:600,color:"#007AFF",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>{selectedArticle.category==="news"?"Новость":selectedArticle.category==="blog"?"Блог":selectedArticle.category==="press"?"Пресса":"Анонс"}</div>
        <div style={{fontSize:28,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.6px",lineHeight:1.15,marginBottom:12}}>{selectedArticle.title_ru}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
          {selectedArticle.author_name&&<span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{selectedArticle.author_name}</span>}
          <span style={{fontSize:13,color:"var(--label3)",fontFamily:FT}}>{selectedArticle.published_at?new Date(selectedArticle.published_at).toLocaleDateString("ru",{day:"numeric",month:"long",year:"numeric"}):""}</span>
        </div>
        <div style={{fontSize:19,color:"var(--label)",fontFamily:FT,lineHeight:1.78,letterSpacing:"-.15px",whiteSpace:"pre-line"}}>{selectedArticle.body_ru}</div>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"14px 20px 0"}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.8px"}}>Этномир</div>
      </div>

      {/* Hero Card */}
      <div style={{padding:"16px 20px"}}>
        <div style={{borderRadius:24,background:"linear-gradient(145deg,#4A0E0E 0%,#7B1818 50%,#5A1010 100%)",padding:"28px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 12px)",backgroundSize:"17px 17px"}}/>
          <div style={{position:"absolute",right:16,top:16,fontSize:64,opacity:.08}}>🌍</div>
          <div style={{position:"relative"}}>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",letterSpacing:2,textTransform:"uppercase",fontFamily:FT}}>КРУПНЕЙШИЙ ПАРК РФ</div>
            <div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:8,lineHeight:1.2}}>Мир начинается<br/>с тебя</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.55)",fontFamily:FT,marginTop:8}}>С {parkInfo.founded_year||"2007"} года · {parkInfo.countries_count||"96"} стран мира · {parkInfo.address||"Калужская область"}</div>
            
          </div>
        </div>
      </div>

      {/* Articles */}
      {articles.length>0&&(
        <div style={{padding:"0 20px 16px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:12}}>Новости</div>
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:4,marginRight:-20}}>
            {articles.map((a:any)=>(
              <div key={a.id} className="tap" onClick={()=>setSelectedArticle(a)} style={{minWidth:220,maxWidth:220,borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",flexShrink:0}}>
                <div style={{padding:"14px 14px 12px"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{a.cover_emoji}</div>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.title_ru}</div>
                  <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:6}}>{a.category==='news'?'Новость':a.category==='blog'?'Блог':a.category==='press'?'Пресса':'Анонс'} · {a.published_at?new Date(a.published_at).toLocaleDateString('ru',{day:'numeric',month:'short'}):''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business & Partnership */}
      <div style={{padding:"0 20px 16px"}}>
        <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Бизнес</div>
        <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:12}}>Партнёрство и возможности</div>
        <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[...partners.map((p:any)=>({emoji:p.cover_emoji||'💼',label:p.name_ru,desc:p.description_ru})),...b2b.map((b:any)=>({emoji:b.cover_emoji||'🤝',label:b.title,desc:b.description_ru}))].map((item:any,j:number,arr:any[])=>(
            <div key={j}>
              {j===4&&<div style={{padding:"16px 16px 8px",borderTop:"8px solid var(--bg)"}}><div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD}}>Предложения</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>Для гостей и групп</div></div>}
              <div className="tap" onClick={()=>{if(j===0&&onFranchise){onFranchise();return;}const slugMap=['','arenda','business','build','gift','corp','educ','travel'];if(j>0&&j<slugMap.length&&onLanding&&slugMap[j]){onLanding(slugMap[j]);return;}setExpandedBiz(expandedBiz===j?null:j);}} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:(j<arr.length-1&&expandedBiz!==j)?"0.5px solid var(--sep)":"none"}}>
                <div style={{width:34,height:34,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{item.emoji}</div>
                <div style={{flex:1}}><span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{item.label}</span></div>
                <span style={{fontSize:17,color:"var(--label4)",transform:expandedBiz===j?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
              </div>
              {expandedBiz===j&&(
                <div style={{padding:"0 16px 14px",borderBottom:j<arr.length-1?"0.5px solid var(--sep)":"none"}}>
                  <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{item.desc}</div>
                  <div className="tap" onClick={()=>{const n=prompt("Ваше имя:");if(!n)return;const p=prompt("Телефон:");if(!p)return;submitContactRequest("partnership",item.label,n,p,"Заявка на: "+item.label);alert("Заявка отправлена!");}} style={{padding:"11px",borderRadius:14,background:"#007AFF",textAlign:"center"}}>
                    <span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FT}}>Оставить заявку</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>


      {/* Useful links grid */}
      <div style={{padding:"0 20px 16px"}}>
        <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:12}}>Полезное</div>
        <div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[["M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z","Как добраться","directions"],["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z","Вопросы и ответы","faq"],["M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z","Подарочные сертификаты","gift"],["M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z","Недвижимость","realty"],["M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z","Вакансии","jobs"],["M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2z","Сельское хозяйство","farm"],["M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z","Отзывы гостей","reviews"],["M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z","Этномир 3000","ethnomir3000"],["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z","Экология","recycling"],["M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z","Статьи","articles"],["M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z","Благотворительность","charity"],["M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z","Основатель Этномира","founder"],["M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z","Согласие на данные","agreement"]].map(([ic,t,s]:any,i:number)=>(
            <div key={i} className="tap fu" onClick={()=>onLanding&&onLanding(s)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"0.5px solid var(--sep)"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--label2)" style={{flexShrink:0,opacity:.6}}><path d={ic}/></svg>
              <div style={{fontSize:15,fontWeight:500,color:"var(--label)",fontFamily:FT,flex:1}}>{t}</div><span style={{fontSize:17,color:"var(--label4)"}}>›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heritage Timeline */}
      {heritage.length>0&&(
        <div style={{padding:"0 20px 16px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Наследие</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}>История Этномира</div>
          <div style={{borderLeft:"2px solid var(--sep-opaque)",marginLeft:8,paddingLeft:20}}>
            {heritage.filter((h:any)=>h.year).map((h:any,i:number)=>(
              <div key={h.id} className={"fu s"+Math.min(i+1,6)} style={{position:"relative",marginBottom:20}}>
                <div style={{position:"absolute",left:-28,top:2,width:14,height:14,borderRadius:7,background:"#007AFF",border:"2px solid var(--bg)"}}/>
                <div style={{fontSize:12,fontWeight:700,color:"#007AFF",fontFamily:FD}}>{h.year}</div>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,marginTop:2}}>{h.title_ru}</div>
                {h.content_ru&&<div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4,lineHeight:1.4}}>{h.content_ru}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {false&&(
        <div style={{padding:"0 20px 16px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:12}}>Вопросы и ответы</div>
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
            {faqs.slice(0,6).map((f:any,j:number,arr:any[])=>(
              <div key={f.id}>
                <div className="tap" onClick={()=>setExpandedFaq(expandedFaq===f.id?null:f.id)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:(j<arr.length-1&&expandedFaq!==f.id)?"0.5px solid var(--sep)":"none"}}>
                  <div style={{flex:1}}><span style={{fontSize:15,fontWeight:500,color:"var(--label)",fontFamily:FT}}>{f.question_ru}</span></div>
                  <span style={{fontSize:16,color:"var(--label3)",transform:expandedFaq===f.id?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
                </div>
                {expandedFaq===f.id&&(
                  <div style={{padding:"0 16px 14px",borderBottom:j<arr.length-1?"0.5px solid var(--sep)":"none"}}>
                    <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.5}}>{f.answer_ru}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support */}
      <div style={{padding:"0 20px 16px"}}>
        <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:16,marginBottom:6}}>Поддержка</div>
        <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[["📞","Контакты","+7 (495) 023-43-49",()=>window.open("tel:+74950234349")],["📧","Написать нам","Обратная связь",()=>{const n=prompt("Ваше имя:");if(!n)return;const m=prompt("Ваше сообщение:");if(!m)return;submitContactRequest("feedback","ethnomir_tab",n,"",m);alert("Спасибо! Мы ответим в ближайшее время.");}]].map(([ic,lb,sub,fn]:any,j:number,a:any[])=>(
            <div key={j} className="tap" onClick={()=>fn&&fn()} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:j<a.length-1?"0.5px solid var(--sep)":"none"}}>
              <div style={{width:34,height:34,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{ic}</div>
              <div style={{flex:1}}><div style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{lb}</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{sub}</div></div>
              <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:'center',padding:'32px 0 48px'}}>
              <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FD}}>Этномир.</div>
              <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:3}}>Крупнейший парк РФ</div>
              <div style={{marginTop:14,fontSize:12,color:'var(--label3)',fontFamily:FT,lineHeight:1.7}}>С 9:00 до 21:00 ежедневно<br/>+7 (495) 023-43-49</div>
              <div style={{marginTop:14}}><span className="tap" onClick={()=>window.open('https://billionsx.com','_blank')} style={{fontSize:11,color:'var(--label4)',cursor:'pointer'}}>Разработчик приложения billionsx.com</span></div>
            </div>
    </div>
  );
}

// ─── TAB BAR ──────────────────────────────────────────────
function TabBar({ active, onSelect }:{ active:Tab; onSelect:(t:Tab)=>void }) {
  const tabs:[Tab,string,(on:boolean)=>any][] = [
    ["home","Парк",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#007AFF"/><path d="M2 12h20M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10c-2.5-3-4-6.5-4-10s1.5-7 4-10z" stroke="#fff" strokeWidth="1.3" fill="none"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.25" stroke="#3C3C43" strokeWidth="1.5"/><path d="M2.5 12h19M12 2.5c2.3 2.8 3.7 6.2 3.7 9.5s-1.4 6.7-3.7 9.5c-2.3-2.8-3.7-6.2-3.7-9.5s1.4-6.7 3.7-9.5z" stroke="#3C3C43" strokeWidth="1.5"/></svg>],
    ["tours","Билеты",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" fill="#007AFF"/><circle cx="2" cy="12" r="2.5" fill="#F2F2F7"/><circle cx="22" cy="12" r="2.5" fill="#F2F2F7"/><path d="M9 5v14" stroke="#fff" strokeWidth="1" strokeDasharray="2 2" opacity=".5"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="2" cy="12" r="2.5" fill="#F2F2F7" stroke="#3C3C43" strokeWidth="1"/><circle cx="22" cy="12" r="2.5" fill="#F2F2F7" stroke="#3C3C43" strokeWidth="1"/><path d="M9 6v12" stroke="#3C3C43" strokeWidth="1" strokeDasharray="2 2"/></svg>],
    ["stay","Жильё",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" fill="#007AFF"/><rect x="9" y="14" width="6" height="8" rx=".5" fill="#fff"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="#3C3C43" strokeWidth="1.5" strokeLinejoin="round"/><rect x="9" y="14" width="6" height="8" rx=".5" stroke="#3C3C43" strokeWidth="1.5"/></svg>],
    ["services","Услуги",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="7" cy="7" r="4" fill="#007AFF"/><circle cx="17" cy="7" r="4" fill="#007AFF"/><circle cx="7" cy="17" r="4" fill="#007AFF"/><circle cx="17" cy="17" r="4" fill="#007AFF"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="17" cy="7" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="7" cy="17" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="17" cy="17" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/></svg>],
    ["passport","Этномир",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 620 620"><path d="M300.898 0C300.381 3.71918 300.215 7.43805 300.959 11.1572C300.959 14.8153 300.959 17.255 299.739 20.9131C298.52 28.2291 294.861 34.3261 289.982 40.4229C282.665 47.739 276.568 57.4938 272.909 68.4678C268.031 78.2227 266.811 89.1976 266.811 100.172C266.811 103.83 266.811 106.269 265.592 109.927C264.372 117.243 260.713 123.34 255.835 129.437C248.518 136.753 242.419 146.507 238.761 157.481C235.102 168.456 232.663 178.211 233.883 189.186C233.883 192.844 233.883 195.282 232.663 198.94C231.443 206.257 227.785 212.353 222.906 218.45C215.589 225.766 209.491 235.522 205.832 246.496C202.173 257.47 199.735 267.225 200.954 278.199C200.954 281.857 200.954 284.296 199.734 287.954C198.515 294.051 194.856 300.148 191.197 305.025C192.417 306.245 194.857 306.244 196.076 307.464L355.84 64.8096L229.004 324.535C230.223 324.535 230.224 325.755 231.443 325.755C236.322 322.097 241.2 318.438 244.858 312.342C246.078 309.903 247.298 306.244 248.518 303.806C250.957 294.051 255.835 284.296 263.152 275.761C270.47 267.225 279.007 259.909 288.764 255.031C294.861 251.373 299.739 246.495 304.617 240.398C305.837 237.96 307.057 234.302 308.276 231.863C310.716 222.108 315.594 212.353 322.911 203.817C330.229 195.282 338.766 187.966 348.522 183.089C354.62 179.431 359.499 174.553 364.377 168.456C365.596 166.017 366.816 162.36 368.035 159.921C370.474 150.166 375.353 140.411 382.67 131.875C389.987 123.339 398.525 116.023 408.281 111.146C414.379 107.487 419.258 102.61 424.136 96.5137C424.136 90.4168 425.356 87.9774 426.575 84.3193C429.014 74.5646 433.893 64.8099 441.21 56.2744C448.527 47.739 449.747 48.9583 443.649 58.7129C437.552 68.4677 432.673 78.2227 430.233 87.9775C429.014 90.4163 427.795 92.8556 426.575 96.5137C422.917 103.83 418.038 108.707 411.94 112.365C403.404 118.462 394.866 125.778 388.769 134.313C382.671 144.068 377.792 153.824 375.353 163.579C374.133 167.237 374.133 169.676 371.694 172.114C368.036 179.43 363.157 184.308 357.06 187.966C348.523 194.063 339.986 201.379 333.888 209.915C327.79 218.451 322.911 229.425 320.472 239.18C319.252 242.838 319.252 245.276 316.813 247.715C313.155 255.031 308.276 259.908 302.179 263.566C293.642 269.663 285.105 276.98 279.007 285.516C272.909 295.271 268.031 305.025 265.592 314.78C264.372 318.438 264.372 320.877 261.933 323.315C259.494 329.412 254.616 334.29 249.737 337.948L253.396 341.606L470.479 151.385L285.104 372.091L287.544 374.529C293.642 372.091 298.52 369.652 303.398 364.774C305.838 362.336 307.057 359.897 309.496 357.458C314.374 348.922 321.692 340.386 331.448 333.07C339.985 325.754 350.961 322.096 360.718 319.657C368.035 318.438 374.133 314.78 379.012 308.684C381.451 306.245 382.67 303.806 385.109 301.367C389.988 292.832 397.305 284.296 407.062 276.979C415.598 269.663 426.575 266.005 436.331 263.566C443.648 262.347 449.747 258.689 454.625 252.593C457.064 250.154 458.284 247.715 460.723 245.276C465.601 236.741 472.918 228.205 482.675 220.889C491.212 213.572 502.189 209.914 511.945 207.476C519.262 206.256 525.36 202.598 530.238 196.502C532.677 194.063 533.897 191.624 536.336 189.186C541.214 180.65 548.532 172.114 558.289 164.798C566.826 157.482 568.045 159.921 559.509 167.236C550.972 174.553 544.873 183.089 539.995 192.844C538.776 195.282 536.337 198.94 535.117 201.379C530.239 207.476 524.141 211.134 516.823 213.572C507.067 217.23 497.31 222.109 488.773 229.425C480.236 236.741 474.138 245.276 469.26 255.031C468.04 257.47 465.601 259.909 464.382 263.566C459.504 269.663 453.405 273.322 446.088 275.761C436.331 279.419 426.575 284.296 418.038 291.612C409.501 298.928 403.403 307.464 398.524 317.219C397.305 319.657 394.866 322.097 393.646 325.755C388.768 331.852 382.67 335.51 375.353 337.948C365.596 341.606 355.84 346.484 347.303 353.8C338.766 361.116 332.667 369.652 327.789 379.407C326.569 381.846 324.131 384.285 322.911 387.942C318.033 392.82 313.154 396.478 307.057 398.917L310.716 402.574L560.728 263.566L327.789 431.84C327.789 433.059 329.009 433.059 329.009 434.278C335.107 434.278 341.205 431.84 347.303 428.182C349.742 426.962 352.181 425.742 354.62 423.304C361.938 415.988 370.475 409.891 381.451 405.014C392.427 400.136 402.183 398.917 413.159 398.917C420.477 398.917 427.795 396.477 433.893 392.819C436.332 391.6 438.771 389.161 441.21 386.723C448.527 379.407 457.064 373.31 468.04 368.433C479.016 363.555 488.773 362.336 499.749 362.336C507.066 362.336 514.385 359.896 520.482 356.238C522.921 355.019 525.361 352.58 527.8 350.142C535.117 342.826 543.654 336.729 554.63 331.852C565.606 326.974 575.363 325.755 586.339 325.755C593.656 325.755 600.973 323.315 607.071 319.657C609.51 318.438 611.95 315.999 614.389 313.561C616.086 311.863 617.972 310.166 619.995 308.521C619.997 308.97 620 309.418 620 309.867C620 312.522 619.966 315.169 619.899 317.808C619.689 318.018 619.478 318.228 619.268 318.438C616.829 320.877 614.389 323.316 611.95 324.535C605.852 329.413 598.534 331.852 591.217 331.852C580.241 333.071 570.485 335.509 559.509 340.387C549.752 345.264 541.215 352.58 533.897 359.896C531.458 362.335 529.019 364.775 526.58 365.994C520.482 370.872 513.164 373.31 505.847 373.31C494.871 374.529 485.115 376.968 474.139 381.846C464.382 386.723 455.845 394.039 448.527 401.355C446.088 403.794 443.649 406.233 441.21 407.452C435.112 412.33 427.794 414.769 420.477 414.769C409.501 415.988 398.525 418.426 388.769 423.304C379.012 428.181 370.475 435.497 363.157 442.813C360.718 445.252 358.279 447.692 355.84 448.911C350.962 452.569 344.863 455.007 338.766 456.227C339.985 457.446 339.986 459.885 341.205 461.104L608.177 394.952C607.955 395.73 607.73 396.505 607.503 397.28L353.4 498.904C353.4 500.124 353.401 500.124 354.62 501.344C360.718 502.563 366.816 502.563 374.133 500.124C377.791 501.343 380.231 500.124 382.67 498.904C391.207 492.808 402.183 489.15 413.159 487.931C424.135 486.711 435.112 486.711 446.088 489.149C453.405 490.369 460.723 490.369 468.04 487.931C471.699 486.711 474.138 485.492 476.577 484.272C485.114 478.176 496.09 474.517 507.066 473.298C518.043 472.078 529.019 472.079 539.995 474.518C547.313 475.737 554.63 475.737 561.947 473.298C565.606 472.078 568.045 470.859 570.484 469.64C572.963 467.869 575.649 466.305 578.479 464.946C574.459 471.892 570.177 478.668 565.646 485.259C564.544 485.787 563.333 486.249 561.947 486.711C554.63 489.15 547.313 490.369 539.995 489.149C529.019 486.711 518.043 487.93 507.066 490.369C496.09 492.808 486.334 497.685 477.797 503.782C475.358 505.002 472.918 507.441 469.26 508.66C461.942 511.099 454.625 512.318 447.308 511.099C436.331 508.66 425.355 509.879 414.379 512.317C403.403 514.756 393.646 519.634 385.109 525.73C382.67 526.95 380.231 529.389 376.572 530.608C370.475 533.047 364.377 534.266 358.279 533.047C358.279 535.486 359.498 537.925 359.498 540.363L522.015 536.029C516.149 541.53 510.069 546.806 503.789 551.842L364.377 573.286V579.383C370.475 581.821 376.572 583.041 382.67 581.821C386.329 581.821 388.768 580.602 392.427 579.383C402.183 575.725 413.16 574.505 424.136 575.725C434.828 576.912 445.52 579.258 455.085 583.888C444.491 589.508 433.533 594.534 422.255 598.917C411.91 599.176 401.626 601.541 392.427 604.99C389.988 606.21 386.329 607.429 382.67 607.429C376.572 608.648 369.255 607.428 363.157 606.209V609.867H388.396C363.355 616.392 337.084 619.867 310 619.867C138.792 619.867 0 481.075 0 309.867C0 258.017 12.7306 209.14 35.2354 166.19C35.478 171.01 34.6765 175.83 33.873 180.649C30.2144 190.404 28.9944 201.379 30.2139 213.572C31.4334 224.547 35.0924 235.521 39.9707 244.057C41.1903 246.495 42.4093 250.154 43.6289 252.593C44.8484 258.689 44.8484 264.786 43.6289 270.883H50.9463L67.8076 116.349C73.2274 109.575 78.9248 103.032 84.8838 96.7402L91.1924 273.321H93.6318C96.0709 268.444 98.5098 262.347 98.5098 255.031C98.5098 251.373 98.5096 248.934 97.29 245.276C94.8509 235.521 94.8509 224.547 97.29 213.572C99.7292 202.598 103.389 192.844 109.486 183.089C113.145 176.992 115.584 169.676 115.584 162.359C115.584 158.701 115.584 156.263 114.364 152.604C114.364 144.069 114.365 133.094 116.804 122.12C119.243 111.146 122.901 101.391 128.999 91.6357C132.658 85.5389 135.097 78.2224 135.097 70.9062C135.097 67.2484 135.097 64.8093 133.878 61.1514C133.417 59.3093 133.043 57.4238 132.757 55.5029C136.318 53.0169 139.933 50.6037 143.602 48.2656C144.089 53.1461 144.952 57.8874 146.073 62.3711C147.293 64.8098 147.293 68.4679 147.293 72.126C147.293 79.4421 146.074 86.7587 142.415 92.8555C137.537 102.61 133.878 112.366 131.438 123.34C130.219 134.314 131.439 145.288 133.878 155.043C135.097 157.482 135.097 161.14 135.097 164.798C135.097 172.114 133.877 179.431 130.219 185.527C125.34 195.282 121.682 205.037 119.243 216.012C118.024 226.986 119.243 237.96 121.682 247.715C122.901 250.154 122.901 253.812 122.901 257.47C122.901 263.567 121.682 270.883 119.243 275.761C120.463 275.761 122.902 276.979 124.121 276.979L220.454 12.9971C220.81 12.8899 221.165 12.7817 221.521 12.6758L161.928 287.954C163.147 287.954 163.148 289.174 164.367 289.174C168.026 284.296 171.684 279.418 174.123 273.321C175.343 269.663 175.343 267.224 175.343 263.566C175.343 252.592 177.782 242.837 182.66 231.863C188.758 224.547 196.076 216.012 203.394 208.695C208.272 203.818 213.15 197.72 214.369 190.404C215.589 186.746 215.589 184.307 215.589 180.649C215.589 169.675 218.028 159.92 222.906 148.946C227.785 139.191 233.883 129.437 242.42 123.34C247.298 118.462 252.176 112.365 253.396 105.049C255.835 101.391 255.835 98.952 257.055 95.2939C257.055 84.3197 259.494 74.565 264.372 63.5908C269.25 53.8359 275.348 44.0802 283.885 37.9834C288.763 33.106 293.642 27.0095 294.861 19.6934C296.081 16.0353 296.081 13.5965 296.081 9.93848C296.081 6.42042 296.488 3.30839 297.065 0.133789C298.341 0.0814298 299.619 0.0368953 300.898 0Z" fill="#007AFF"/></svg>
      : <svg width="26" height="26" viewBox="0 0 620 620"><path d="M300.898 0C300.381 3.71918 300.215 7.43805 300.959 11.1572C300.959 14.8153 300.959 17.255 299.739 20.9131C298.52 28.2291 294.861 34.3261 289.982 40.4229C282.665 47.739 276.568 57.4938 272.909 68.4678C268.031 78.2227 266.811 89.1976 266.811 100.172C266.811 103.83 266.811 106.269 265.592 109.927C264.372 117.243 260.713 123.34 255.835 129.437C248.518 136.753 242.419 146.507 238.761 157.481C235.102 168.456 232.663 178.211 233.883 189.186C233.883 192.844 233.883 195.282 232.663 198.94C231.443 206.257 227.785 212.353 222.906 218.45C215.589 225.766 209.491 235.522 205.832 246.496C202.173 257.47 199.735 267.225 200.954 278.199C200.954 281.857 200.954 284.296 199.734 287.954C198.515 294.051 194.856 300.148 191.197 305.025C192.417 306.245 194.857 306.244 196.076 307.464L355.84 64.8096L229.004 324.535C230.223 324.535 230.224 325.755 231.443 325.755C236.322 322.097 241.2 318.438 244.858 312.342C246.078 309.903 247.298 306.244 248.518 303.806C250.957 294.051 255.835 284.296 263.152 275.761C270.47 267.225 279.007 259.909 288.764 255.031C294.861 251.373 299.739 246.495 304.617 240.398C305.837 237.96 307.057 234.302 308.276 231.863C310.716 222.108 315.594 212.353 322.911 203.817C330.229 195.282 338.766 187.966 348.522 183.089C354.62 179.431 359.499 174.553 364.377 168.456C365.596 166.017 366.816 162.36 368.035 159.921C370.474 150.166 375.353 140.411 382.67 131.875C389.987 123.339 398.525 116.023 408.281 111.146C414.379 107.487 419.258 102.61 424.136 96.5137C424.136 90.4168 425.356 87.9774 426.575 84.3193C429.014 74.5646 433.893 64.8099 441.21 56.2744C448.527 47.739 449.747 48.9583 443.649 58.7129C437.552 68.4677 432.673 78.2227 430.233 87.9775C429.014 90.4163 427.795 92.8556 426.575 96.5137C422.917 103.83 418.038 108.707 411.94 112.365C403.404 118.462 394.866 125.778 388.769 134.313C382.671 144.068 377.792 153.824 375.353 163.579C374.133 167.237 374.133 169.676 371.694 172.114C368.036 179.43 363.157 184.308 357.06 187.966C348.523 194.063 339.986 201.379 333.888 209.915C327.79 218.451 322.911 229.425 320.472 239.18C319.252 242.838 319.252 245.276 316.813 247.715C313.155 255.031 308.276 259.908 302.179 263.566C293.642 269.663 285.105 276.98 279.007 285.516C272.909 295.271 268.031 305.025 265.592 314.78C264.372 318.438 264.372 320.877 261.933 323.315C259.494 329.412 254.616 334.29 249.737 337.948L253.396 341.606L470.479 151.385L285.104 372.091L287.544 374.529C293.642 372.091 298.52 369.652 303.398 364.774C305.838 362.336 307.057 359.897 309.496 357.458C314.374 348.922 321.692 340.386 331.448 333.07C339.985 325.754 350.961 322.096 360.718 319.657C368.035 318.438 374.133 314.78 379.012 308.684C381.451 306.245 382.67 303.806 385.109 301.367C389.988 292.832 397.305 284.296 407.062 276.979C415.598 269.663 426.575 266.005 436.331 263.566C443.648 262.347 449.747 258.689 454.625 252.593C457.064 250.154 458.284 247.715 460.723 245.276C465.601 236.741 472.918 228.205 482.675 220.889C491.212 213.572 502.189 209.914 511.945 207.476C519.262 206.256 525.36 202.598 530.238 196.502C532.677 194.063 533.897 191.624 536.336 189.186C541.214 180.65 548.532 172.114 558.289 164.798C566.826 157.482 568.045 159.921 559.509 167.236C550.972 174.553 544.873 183.089 539.995 192.844C538.776 195.282 536.337 198.94 535.117 201.379C530.239 207.476 524.141 211.134 516.823 213.572C507.067 217.23 497.31 222.109 488.773 229.425C480.236 236.741 474.138 245.276 469.26 255.031C468.04 257.47 465.601 259.909 464.382 263.566C459.504 269.663 453.405 273.322 446.088 275.761C436.331 279.419 426.575 284.296 418.038 291.612C409.501 298.928 403.403 307.464 398.524 317.219C397.305 319.657 394.866 322.097 393.646 325.755C388.768 331.852 382.67 335.51 375.353 337.948C365.596 341.606 355.84 346.484 347.303 353.8C338.766 361.116 332.667 369.652 327.789 379.407C326.569 381.846 324.131 384.285 322.911 387.942C318.033 392.82 313.154 396.478 307.057 398.917L310.716 402.574L560.728 263.566L327.789 431.84C327.789 433.059 329.009 433.059 329.009 434.278C335.107 434.278 341.205 431.84 347.303 428.182C349.742 426.962 352.181 425.742 354.62 423.304C361.938 415.988 370.475 409.891 381.451 405.014C392.427 400.136 402.183 398.917 413.159 398.917C420.477 398.917 427.795 396.477 433.893 392.819C436.332 391.6 438.771 389.161 441.21 386.723C448.527 379.407 457.064 373.31 468.04 368.433C479.016 363.555 488.773 362.336 499.749 362.336C507.066 362.336 514.385 359.896 520.482 356.238C522.921 355.019 525.361 352.58 527.8 350.142C535.117 342.826 543.654 336.729 554.63 331.852C565.606 326.974 575.363 325.755 586.339 325.755C593.656 325.755 600.973 323.315 607.071 319.657C609.51 318.438 611.95 315.999 614.389 313.561C616.086 311.863 617.972 310.166 619.995 308.521C619.997 308.97 620 309.418 620 309.867C620 312.522 619.966 315.169 619.899 317.808C619.689 318.018 619.478 318.228 619.268 318.438C616.829 320.877 614.389 323.316 611.95 324.535C605.852 329.413 598.534 331.852 591.217 331.852C580.241 333.071 570.485 335.509 559.509 340.387C549.752 345.264 541.215 352.58 533.897 359.896C531.458 362.335 529.019 364.775 526.58 365.994C520.482 370.872 513.164 373.31 505.847 373.31C494.871 374.529 485.115 376.968 474.139 381.846C464.382 386.723 455.845 394.039 448.527 401.355C446.088 403.794 443.649 406.233 441.21 407.452C435.112 412.33 427.794 414.769 420.477 414.769C409.501 415.988 398.525 418.426 388.769 423.304C379.012 428.181 370.475 435.497 363.157 442.813C360.718 445.252 358.279 447.692 355.84 448.911C350.962 452.569 344.863 455.007 338.766 456.227C339.985 457.446 339.986 459.885 341.205 461.104L608.177 394.952C607.955 395.73 607.73 396.505 607.503 397.28L353.4 498.904C353.4 500.124 353.401 500.124 354.62 501.344C360.718 502.563 366.816 502.563 374.133 500.124C377.791 501.343 380.231 500.124 382.67 498.904C391.207 492.808 402.183 489.15 413.159 487.931C424.135 486.711 435.112 486.711 446.088 489.149C453.405 490.369 460.723 490.369 468.04 487.931C471.699 486.711 474.138 485.492 476.577 484.272C485.114 478.176 496.09 474.517 507.066 473.298C518.043 472.078 529.019 472.079 539.995 474.518C547.313 475.737 554.63 475.737 561.947 473.298C565.606 472.078 568.045 470.859 570.484 469.64C572.963 467.869 575.649 466.305 578.479 464.946C574.459 471.892 570.177 478.668 565.646 485.259C564.544 485.787 563.333 486.249 561.947 486.711C554.63 489.15 547.313 490.369 539.995 489.149C529.019 486.711 518.043 487.93 507.066 490.369C496.09 492.808 486.334 497.685 477.797 503.782C475.358 505.002 472.918 507.441 469.26 508.66C461.942 511.099 454.625 512.318 447.308 511.099C436.331 508.66 425.355 509.879 414.379 512.317C403.403 514.756 393.646 519.634 385.109 525.73C382.67 526.95 380.231 529.389 376.572 530.608C370.475 533.047 364.377 534.266 358.279 533.047C358.279 535.486 359.498 537.925 359.498 540.363L522.015 536.029C516.149 541.53 510.069 546.806 503.789 551.842L364.377 573.286V579.383C370.475 581.821 376.572 583.041 382.67 581.821C386.329 581.821 388.768 580.602 392.427 579.383C402.183 575.725 413.16 574.505 424.136 575.725C434.828 576.912 445.52 579.258 455.085 583.888C444.491 589.508 433.533 594.534 422.255 598.917C411.91 599.176 401.626 601.541 392.427 604.99C389.988 606.21 386.329 607.429 382.67 607.429C376.572 608.648 369.255 607.428 363.157 606.209V609.867H388.396C363.355 616.392 337.084 619.867 310 619.867C138.792 619.867 0 481.075 0 309.867C0 258.017 12.7306 209.14 35.2354 166.19C35.478 171.01 34.6765 175.83 33.873 180.649C30.2144 190.404 28.9944 201.379 30.2139 213.572C31.4334 224.547 35.0924 235.521 39.9707 244.057C41.1903 246.495 42.4093 250.154 43.6289 252.593C44.8484 258.689 44.8484 264.786 43.6289 270.883H50.9463L67.8076 116.349C73.2274 109.575 78.9248 103.032 84.8838 96.7402L91.1924 273.321H93.6318C96.0709 268.444 98.5098 262.347 98.5098 255.031C98.5098 251.373 98.5096 248.934 97.29 245.276C94.8509 235.521 94.8509 224.547 97.29 213.572C99.7292 202.598 103.389 192.844 109.486 183.089C113.145 176.992 115.584 169.676 115.584 162.359C115.584 158.701 115.584 156.263 114.364 152.604C114.364 144.069 114.365 133.094 116.804 122.12C119.243 111.146 122.901 101.391 128.999 91.6357C132.658 85.5389 135.097 78.2224 135.097 70.9062C135.097 67.2484 135.097 64.8093 133.878 61.1514C133.417 59.3093 133.043 57.4238 132.757 55.5029C136.318 53.0169 139.933 50.6037 143.602 48.2656C144.089 53.1461 144.952 57.8874 146.073 62.3711C147.293 64.8098 147.293 68.4679 147.293 72.126C147.293 79.4421 146.074 86.7587 142.415 92.8555C137.537 102.61 133.878 112.366 131.438 123.34C130.219 134.314 131.439 145.288 133.878 155.043C135.097 157.482 135.097 161.14 135.097 164.798C135.097 172.114 133.877 179.431 130.219 185.527C125.34 195.282 121.682 205.037 119.243 216.012C118.024 226.986 119.243 237.96 121.682 247.715C122.901 250.154 122.901 253.812 122.901 257.47C122.901 263.567 121.682 270.883 119.243 275.761C120.463 275.761 122.902 276.979 124.121 276.979L220.454 12.9971C220.81 12.8899 221.165 12.7817 221.521 12.6758L161.928 287.954C163.147 287.954 163.148 289.174 164.367 289.174C168.026 284.296 171.684 279.418 174.123 273.321C175.343 269.663 175.343 267.224 175.343 263.566C175.343 252.592 177.782 242.837 182.66 231.863C188.758 224.547 196.076 216.012 203.394 208.695C208.272 203.818 213.15 197.72 214.369 190.404C215.589 186.746 215.589 184.307 215.589 180.649C215.589 169.675 218.028 159.92 222.906 148.946C227.785 139.191 233.883 129.437 242.42 123.34C247.298 118.462 252.176 112.365 253.396 105.049C255.835 101.391 255.835 98.952 257.055 95.2939C257.055 84.3197 259.494 74.565 264.372 63.5908C269.25 53.8359 275.348 44.0802 283.885 37.9834C288.763 33.106 293.642 27.0095 294.861 19.6934C296.081 16.0353 296.081 13.5965 296.081 9.93848C296.081 6.42042 296.488 3.30839 297.065 0.133789C298.341 0.0814298 299.619 0.0368953 300.898 0Z" fill="#8E8E93"/></svg>],
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:100,padding:"0 40px 40px 40px"}} className="em-tabbar">
      <div style={{
        display:"flex",alignItems:"center",justifyContent:"space-around",
        height:54,borderRadius:28,
        background:"rgba(255,255,255,0.18)",
        backdropFilter:"blur(50px) saturate(200%)",
        WebkitBackdropFilter:"blur(50px) saturate(200%)",
        border:"0.5px solid rgba(255,255,255,0.35)",
        boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.4)",
      }}>
        {tabs.map(([id,label,renderIcon])=>{
          const on = active===id;
          return (
            <div key={id} className="tap" onClick={()=>{onSelect(id);logActivity('tab_switch',{tab:id});}}
              style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,flex:1,height:"100%",cursor:"pointer"}}>
              {renderIcon(on)}
              <span style={{fontSize:10,fontFamily:FT,fontWeight:on?600:400,color:on?"#007AFF":"#3C3C43",opacity:on?1:0.6,letterSpacing:"-.2px"}}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TICKETS ──────────────────────────────────────────────
function TicketScreen({onClose}:{onClose:()=>void}) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<string,number>>({});
  const [isWeekend, setIsWeekend] = useState(new Date().getDay()%6===0);

  useEffect(()=>{
    sb("ticket_types","select=id,name_ru,description_ru,cover_emoji,price_weekday,price_weekend,age_range,included_items,is_active&is_active=eq.true&order=sort_order.asc").then(d=>{
      setTickets(d||[]);
      const q:Record<string,number>={};
      (d||[]).forEach((t:any)=>{q[t.id]=0;});
      setQty(q);
      setLoading(false);
    });
  },[]);

  const total = tickets.reduce((s,t)=>s+(qty[t.id]||0)*(isWeekend?t.price_weekend:t.price_weekday),0);
  const count = Object.values(qty).reduce((a,b)=>a+b,0);

  return (
    <div style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"54px 20px 14px",background:"rgba(242,242,247,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Билеты</div>
        <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>✕</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px",paddingBottom:180}}>
        {/* Day type toggle */}
        <div style={{display:"flex",background:"var(--fill4)",borderRadius:12,padding:2,marginBottom:20}}>
          {[[false,"Будни"],[true,"Выходные / Праздники"]].map(([v,l]:any)=>(
            <div key={String(v)} className="tap" onClick={()=>setIsWeekend(v)}
              style={{flex:1,textAlign:"center",padding:"10px 0",borderRadius:10,cursor:"pointer",
                background:isWeekend===v?"var(--bg2)":"transparent",boxShadow:isWeekend===v?"0 1px 4px rgba(0,0,0,.1)":"none"}}>
              <span style={{fontSize:13,fontWeight:isWeekend===v?700:400,color:isWeekend===v?"var(--label)":"var(--label3)",fontFamily:FT}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div style={{padding:"14px 16px",borderRadius:16,background:"rgba(0,122,255,.05)",border:"0.5px solid rgba(0,122,255,.12)",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:16}}>ℹ️</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Что включено в билет</div>
            <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:3,lineHeight:1.4}}>Территория 140 га, программа дня, музеи, выставки, этнодворы, арт-объекты, Wi-Fi. Аттракционы оплачиваются отдельно.</div>
          </div>
        </div>

        {/* Ticket cards */}
        {loading ? <Spinner/> : tickets.map((t:any,i:number)=>{
          const price = isWeekend?t.price_weekend:t.price_weekday;
          const q = qty[t.id]||0;
          return (
            <div key={t.id} className={"fu s"+Math.min(i+1,6)} style={{borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",marginBottom:14,overflow:"hidden"}}>
              <div style={{padding:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:48,height:48,borderRadius:14,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{t.cover_emoji}</div>
                    <div>
                      <div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FT}}>{t.name_ru}</div>
                      <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{t.age_range}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:700,color:price===0?"#34C759":"var(--label)",fontFamily:FD}}>{price===0?"Бесплатно":price+" ₽"}</div>
                  </div>
                </div>

                {/* Description */}
                <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:10,lineHeight:1.4}}>{t.description_ru}</div>

                {/* Includes chips */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                  {(t.included_items||[]).slice(0,4).map((inc:string,j:number)=>(
                    <span key={j} style={{fontSize:10,fontWeight:500,color:"var(--label3)",fontFamily:FT,padding:"3px 8px",borderRadius:8,background:"var(--fill4)"}}>✓ {inc}</span>
                  ))}
                </div>

                {/* Quantity selector */}
                {price>=0 && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:16,marginTop:14,paddingTop:14,borderTop:"0.5px solid var(--sep)"}}>
                    <div className="tap" onClick={()=>setQty(p=>({...p,[t.id]:Math.max(0,(p[t.id]||0)-1)}))}
                      style={{width:36,height:36,borderRadius:18,background:q>0?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:18,fontWeight:600,color:q>0?"var(--label)":"var(--label4)"}}>−</span>
                    </div>
                    <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{q}</span>
                    <div className="tap" onClick={()=>setQty(p=>({...p,[t.id]:Math.min(10,(p[t.id]||0)+1)}))}
                      style={{width:36,height:36,borderRadius:18,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:18,fontWeight:600,color:"#fff"}}>+</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Working hours */}
        <div style={{padding:"14px 16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:8}}>Режим работы</div>
          {[["Парк","09:00 – 21:00 ежедневно"],["Экскурсии","до 19:00"],["Рестораны","10:00 – 21:00"],["Бани и СПА","10:00 – 22:00"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"0.5px solid var(--fill3)"}}>
              <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{l}</span>
              <span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar with total */}
      {count>0 && (
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 20px",paddingBottom:"calc(16px + env(safe-area-inset-bottom,8px))",background:"rgba(255,255,255,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderTop:"0.5px solid rgba(60,60,67,0.12)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{count} билет{count===1?"":count<5?"а":"ов"}</div>
              <div style={{fontSize:28,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{total.toLocaleString("ru")} ₽</div>
            </div>
            <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,textAlign:"right"}}>{isWeekend?"Выходной тариф":"Будний тариф"}</div>
          </div>
          <div className="tap" style={{padding:"16px",borderRadius:16,background:"var(--blue)",textAlign:"center",boxShadow:"0 4px 16px rgba(0,122,255,.3)"}}>
            <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>Оплатить {total.toLocaleString("ru")} ₽</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SEARCH ───────────────────────────────────────────────
function SearchModal({onClose,onNav}:{onClose:()=>void,onNav?:(tab:string,sec?:string)=>void}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(()=>{
    if(q.length<2){setResults([]);return;}
    setLoading(true);
    const term = "%"+q+"%";
    Promise.all([
      sb("hotels","select=id,name,description,price_from,rating,type&active=eq.true&or=(name.ilike."+encodeURIComponent(term)+",description.ilike."+encodeURIComponent(term)+")&limit=5"),
      sb("tours","select=id,name_ru,description_ru,price,cover_emoji,type&is_available=eq.true&or=(name_ru.ilike."+encodeURIComponent(term)+",description_ru.ilike."+encodeURIComponent(term)+")&limit=5"),
      sb("restaurants","select=id,name_ru,description_ru,cover_emoji,rating&active=eq.true&or=(name_ru.ilike."+encodeURIComponent(term)+",description_ru.ilike."+encodeURIComponent(term)+")&limit=5"),
      sb("services","select=id,name_ru,description_ru,cover_emoji,price_from,category&active=eq.true&or=(name_ru.ilike."+encodeURIComponent(term)+",description_ru.ilike."+encodeURIComponent(term)+")&limit=5"),
      sb("masterclasses","select=id,name_ru,cover_emoji,price,location_ru&is_available=eq.true&or=(name_ru.ilike."+encodeURIComponent(term)+")&limit=5"),
      sb("events","select=id,name_ru,cover_emoji,location_ru,starts_at,is_free&is_published=eq.true&or=(name_ru.ilike."+encodeURIComponent(term)+",location_ru.ilike."+encodeURIComponent(term)+")&limit=5"),
      sb("countries","select=id,name_ru,flag_emoji,region&active=eq.true&name_ru=ilike."+encodeURIComponent(term)+"&limit=5"),
      sb("articles","select=id,title_ru,cover_emoji,category,published_at&is_published=eq.true&title_ru=ilike."+encodeURIComponent(term)+"&limit=3"),
      sb("faq","select=id,question_ru,answer_ru,category&is_published=eq.true&or=(question_ru.ilike."+encodeURIComponent(term)+",answer_ru.ilike."+encodeURIComponent(term)+")&limit=5"),
    ]).then(([h,t,r,s,m,e,c,ar,fq])=>{
      const all:any[] = [];
      (h||[]).forEach((x:any)=>all.push({...x,_type:"hotel",_emoji:"🏨",_label:x.name,_sub:x.type+" · "+x.price_from+" ₽/ночь"}));
      (t||[]).forEach((x:any)=>all.push({...x,_type:"tour",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.price+" ₽"}));
      (r||[]).forEach((x:any)=>all.push({...x,_type:"restaurant",_emoji:x.cover_emoji||"🍽️",_label:x.name_ru,_sub:"★ "+x.rating}));
      (s||[]).forEach((x:any)=>all.push({...x,_type:"service",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.category+(x.price_from?" · "+x.price_from+" ₽":"")}));
      (m||[]).forEach((x:any)=>all.push({...x,_type:"mk",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.price+" ₽ · "+x.location_ru}));
      (e||[]).forEach((x:any)=>all.push({...x,_type:"event",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.location_ru}));
      (c||[]).forEach((x:any)=>all.push({...x,_type:"country",_emoji:x.flag_emoji,_label:x.name_ru,_sub:x.region}));
      (ar||[]).forEach((x:any)=>all.push({...x,_type:"article",_emoji:x.cover_emoji||"📰",_label:x.title_ru,_sub:x.category==='news'?'Новость':'Статья'}));
      (fq||[]).forEach((x:any)=>all.push({...x,_type:"faq",_emoji:"❓",_label:x.question_ru,_sub:x.answer_ru?.substring(0,50)+'...'}));
      setResults(all);
      setLoading(false);
    });
  },[q]);

  const TYPE_LABEL:Record<string,string> = {hotel:"Отель",tour:"Тур",restaurant:"Ресторан",service:"Услуга",mk:"Мастер-класс",event:"Событие",country:"Страна",article:"Статья",faq:"FAQ"};
  const TYPE_COLOR:Record<string,string> = {hotel:"#003580",tour:"#2471A3",restaurant:"#FF9500",service:"#34C759",mk:"#AF52DE",event:"#FF3B30",country:"#007AFF",article:"#FF9500",faq:"#5856D6"};

  return (
    <div style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Header with search input */}
      <div style={{padding:"54px 20px 14px",background:"rgba(242,242,247,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)"}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep-opaque)"}}>
            <span style={{fontSize:14,color:"var(--label3)"}}>🔍</span>
            <input value={q} onChange={(e:any)=>setQ(e.target.value)} autoFocus placeholder="Поиск по всему парку..." style={{flex:1,border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)"}}/>
            {q && <span className="tap" onClick={()=>setQ("")} style={{fontSize:14,color:"var(--label3)",cursor:"pointer"}}>✕</span>}
          </div>
          <span className="tap" onClick={onClose} style={{fontSize:15,color:"var(--blue)",fontFamily:FT,fontWeight:600,cursor:"pointer"}}>Отмена</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        {/* Filter pills */}
        {results.length>0&&<div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
          {[["","Все"],["hotel","Отели"],["tour","Туры"],["restaurant","Рестораны"],["service","Услуги"],["mk","МК"],["event","События"],["country","Страны"]].map(([fid,fl]:any)=>(
            <div key={fid} className="tap" onClick={()=>setFilter(fid)} style={{padding:"6px 14px",borderRadius:20,fontSize:13,fontFamily:FT,flexShrink:0,background:filter===fid?"var(--label)":"var(--fill4)",color:filter===fid?"#fff":"var(--label2)"}}>{fl}</div>
          ))}
        </div>}
        {q.length<2 ? (
          /* Popular searches */
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:12}}>Популярные запросы</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["Баня","СПА","Хаски","Юрта","Индия","Билеты","Ресторан","Мастер-класс","Динопарк","Лодки"].map(s=>(
                <div key={s} className="tap" onClick={()=>setQ(s)} style={{padding:"8px 14px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
                  <span style={{fontSize:13,color:"var(--label)",fontFamily:FT}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? <Spinner/> : results.length===0 ? (
          <div style={{textAlign:"center",paddingTop:40}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <div style={{fontSize:16,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Ничего не найдено</div>
            <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:4}}>Попробуйте другой запрос</div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginBottom:12}}>Найдено <span style={{fontWeight:700,color:"var(--label)"}}>{(filter?results.filter((x:any)=>x._type===filter):results).length}</span> результатов</div>
            {(filter?results.filter((x:any)=>x._type===filter):results).map((r:any,i:number)=>(
              <div key={r._type+r.id+i} className="tap" onClick={()=>{const map:Record<string,string>={hotel:'stay',tour:'tours',restaurant:'services',service:'services',mk:'tours',event:'tours',country:'home',article:'passport',faq:'passport'};const secMap:Record<string,string>={hotel:'hotels',restaurant:'food',service:'shops',mk:'mk',event:'events',faq:''};if(onNav){onNav(map[r._type]||'home',secMap[r._type]||'');onClose();}}} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<results.length-1?"0.5px solid var(--sep)":"none",alignItems:"center"}}>
                <div style={{width:44,height:44,borderRadius:12,background:(TYPE_COLOR[r._type]||"#888")+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{r._emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{r._label}</div>
                  <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{r._sub}</div>
                </div>
                <div style={{padding:"4px 8px",borderRadius:6,background:(TYPE_COLOR[r._type]||"#888")+"14"}}>
                  <span style={{fontSize:10,fontWeight:700,color:TYPE_COLOR[r._type]||"#888",fontFamily:FT}}>{TYPE_LABEL[r._type]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      


    </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────
// --- UNIVERSAL LANDING ---
function UniversalLanding({slug,onClose}:{slug:string,onClose:()=>void}) {
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [err,setErr]=useState('');
  const scrollRef=React.useRef<HTMLDivElement>(null);
  useEffect(()=>{
    sb('landing_pages','select=*&slug=eq.'+slug+'&limit=1').then((d:any)=>{
      if(d&&d[0])setData(d[0]);
      setLoading(false);
    });
  },[slug]);
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    const t=setTimeout(()=>{
      const obs=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('ul-vis');obs.unobserve(e.target);}});
      },{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
      el.querySelectorAll('.ul-a').forEach(n=>obs.observe(n));
      return()=>obs.disconnect();
    },100);
    return()=>clearTimeout(t);
  },[data]);
  const submit=async()=>{
    if(!name.trim()||!phone.trim()){setErr('Заполните имя и телефон');return;}
    setSending(true);setErr('');
    const ok=await submitContactRequest(slug,'landing_'+slug,name,phone);
    if(ok){setSent(true);logActivity('lead_'+slug,{name,phone});}
    else setErr('Ошибка отправки');
    setSending(false);
  };
  const css=`.ul-a{opacity:0;transform:translateY(28px) scale(.98);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}.ul-vis{opacity:1!important;transform:translateY(0) scale(1)!important}.ul-d1{transition-delay:.06s}.ul-d2{transition-delay:.12s}.ul-d3{transition-delay:.18s}.ul-d4{transition-delay:.24s}.ul-d5{transition-delay:.3s}`;
  if(loading) return <div style={{position:"fixed",inset:0,zIndex:250,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}><Spinner/></div>;
  if(!data) return <div style={{position:"fixed",inset:0,zIndex:250,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{color:"rgba(255,255,255,.5)",fontFamily:FT}}>Страница не найдена</div><div className="tap" onClick={onClose} style={{color:"#007AFF",fontFamily:FT}}>Назад</div></div>;
  const ac=data.accent_color||'#34C759';
  const G=48;
  const secs=data.sections||[];
  const renderSection=(s:any,idx:number)=>{
    const lc=s.lc||ac;
    if(s.type==='tagline') return <div key={idx} className="ul-a" style={{padding:G+"px 24px",background:"#000",textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.25}}>{s.text}</div></div>;
    if(s.type==='stats') return <div key={idx} style={{padding:"0 20px "+G+"px",background:"#000"}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{(s.items||[]).map(([v,l,c]:any,i:number)=>(<div key={i} className={"ul-a ul-d"+i} style={{borderRadius:18,background:c+"0a",border:"1px solid "+c+"15",padding:"22px 12px",textAlign:"center"}}><div style={{fontSize:32,fontWeight:700,letterSpacing:"-1px",color:c,fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:4,textTransform:"uppercase",letterSpacing:1}}>{l}</div></div>))}</div></div>;
    if(s.type==='cards') return <div key={idx} style={{padding:"0 20px "+G+"px",background:"#000"}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div>{(s.items||[]).map(([ic,t,d,bg]:any,i:number)=>(<div key={i} className={"ul-a ul-d"+(i%4)} style={{borderRadius:16,padding:"18px",background:"linear-gradient(135deg,"+bg+",#0d0d14)",marginBottom:8}}><div style={{fontSize:28,marginBottom:8}}>{ic}</div><div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:FD}}>{t}</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,lineHeight:1.5,marginTop:4}}>{d}</div></div>))}</div>;
    if(s.type==='list') return <div key={idx} style={{padding:"0 20px "+G+"px",background:"#000"}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div><div className="ul-a" style={{borderRadius:16,background:"rgba(255,255,255,.025)",border:"0.5px solid rgba(255,255,255,.05)",overflow:"hidden"}}>{(s.items||[]).map((t:string,i:number)=>(<div key={i} style={{padding:"14px 18px",borderBottom:i<(s.items||[]).length-1?"0.5px solid rgba(255,255,255,.04)":"none",display:"flex",gap:10,alignItems:"center"}}><div style={{width:6,height:6,borderRadius:3,background:ac,flexShrink:0,opacity:.6}}/><div style={{fontSize:14,color:"rgba(255,255,255,.55)",fontFamily:FT}}>{t}</div></div>))}</div></div>;
    if(s.type==='steps') return <div key={idx} style={{padding:"0 20px "+G+"px",background:"#000"}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div>{(s.items||[]).map(([ic,t,d]:any,i:number)=>(<div key={i} className={"ul-a ul-d"+(i%4)} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i<(s.items||[]).length-1?"0.5px solid rgba(255,255,255,.04)":"none"}}><div style={{fontSize:18}}>{ic}</div><div><div style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FD}}>{t}</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,marginTop:2}}>{d}</div></div></div>))}</div>;
    if(s.type==='quote') return <div key={idx} className="ul-a" style={{padding:G+"px 24px",background:"linear-gradient(180deg,#0d2818,#1a4a2e,#0d2818)",textAlign:"center"}}><div style={{fontSize:36,marginBottom:10}}>{s.emoji||'💬'}</div><div style={{fontSize:19,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.3px",lineHeight:1.3,fontStyle:"italic"}}>{s.text}</div>{s.author&&<div style={{fontSize:12,color:"rgba(255,255,255,.3)",fontFamily:FT,marginTop:10}}>{s.author}</div>}</div>;
    if(s.type==='text') return <div key={idx} className="ul-a" style={{padding:"0 24px "+G+"px",background:"#000"}}><div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:8}}>{s.title}</div><div style={{fontSize:14,color:"rgba(255,255,255,.45)",fontFamily:FT,lineHeight:1.6}}>{s.content}</div></div>;
    if(s.type==='form') return <div key={idx} id={"ul-form-"+slug} className="ul-a" style={{padding:G+"px 24px",background:"#000",textAlign:"center"}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:ac,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:8}}>{s.label}</div>}<div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px"}}>{s.title}</div>{s.subtitle&&<div style={{fontSize:14,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:6,marginBottom:24}}>{s.subtitle}</div>}{sent?(<div style={{borderRadius:18,background:"rgba(52,199,89,.06)",border:"1px solid rgba(52,199,89,.12)",padding:"32px 16px"}}><div style={{fontSize:40,marginBottom:6}}>✅</div><div style={{fontSize:18,fontWeight:700,color:"#34C759",fontFamily:FD}}>Отправлено!</div><div style={{fontSize:13,color:"rgba(255,255,255,.3)",fontFamily:FT,marginTop:4}}>Мы свяжемся с вами.</div></div>):(<div style={{textAlign:"left"}}><div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.25)",fontFamily:FT,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Имя</div><input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Иван Иванов" style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",fontSize:16,fontFamily:FT,color:"#fff",outline:"none"}}/></div><div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.25)",fontFamily:FT,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Телефон</div><input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",fontSize:16,fontFamily:FT,color:"#fff",outline:"none"}}/></div>{err&&<div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,textAlign:"center",marginBottom:8}}>{err}</div>}<div className="tap" onClick={submit} style={{height:50,borderRadius:14,background:ac,display:"flex",alignItems:"center",justifyContent:"center",opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>{sending?"Отправка...":"Отправить"}</span></div></div>)}</div>;
    return null;
  };
  return(
    <div className="anim-slideUp" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:245,background:"#000",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{css}</style>
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:10,padding:"50px 20px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(180deg,rgba(0,0,0,.92) 60%,rgba(0,0,0,0) 100%)"}}>
        <div className="tap" onClick={onClose} style={{display:"flex",alignItems:"center",gap:4}}><svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M8 1L1 8l7 7" stroke="rgba(255,255,255,.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:17,color:"rgba(255,255,255,.85)",fontFamily:FT}}>Назад</span></div>
        {secs.some((s:any)=>s.type==='form')&&<div className="tap" onClick={()=>{const el=document.getElementById('ul-form-'+slug);if(el)el.scrollIntoView({behavior:'smooth'});}} style={{padding:"7px 16px",borderRadius:980,background:"#fff"}}><span style={{fontSize:13,fontWeight:600,color:"#000",fontFamily:FT}}>Оставить заявку</span></div>}
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch"}}>
        {/* Hero */}
        <div style={{padding:"100px 24px 48px",background:data.hero_gradient||"linear-gradient(180deg,#0a1a10,#0d2818,#1a4a2e,#0d2018)",position:"relative",textAlign:"center"}}>
          <div style={{position:"absolute",inset:0,opacity:.02,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 12px)",backgroundSize:"16px 16px"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.3)",letterSpacing:3,textTransform:"uppercase",fontFamily:FT}}>Этномир</div>
            <div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.12,marginTop:10,wordBreak:"break-word",padding:"0 12px"}}>{data.title_ru}</div>
            {data.subtitle_ru&&<div style={{fontSize:16,color:"rgba(255,255,255,.45)",fontFamily:FT,lineHeight:1.5,marginTop:14,maxWidth:310,margin:"14px auto 0"}}>{data.subtitle_ru}</div>}
          </div>
        </div>
        {/* Sections */}
        {secs.map((s:any,i:number)=>renderSection(s,i))}
        {/* Contact */}
        {data.contact_phone&&<div style={{padding:"0 20px "+G+"px",background:"#000"}}><div className="tap" onClick={()=>window.open('tel:'+data.contact_phone.replace(/[^+0-9]/g,''))} style={{borderRadius:16,background:"rgba(255,255,255,.025)",border:"0.5px solid rgba(255,255,255,.05)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:20,background:ac+"10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📞</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>{data.contact_phone}</div>{data.contact_email&&<div style={{fontSize:11,color:"rgba(255,255,255,.25)",fontFamily:FT,marginTop:1}}>{data.contact_email}</div>}</div></div></div>}
        {/* Footer */}
        <div style={{background:"#000",padding:"16px 24px 40px",textAlign:"center",borderTop:"0.5px solid rgba(255,255,255,.03)"}}><div style={{fontSize:11,color:"rgba(255,255,255,.1)",fontFamily:FT}}>© 2008–2026 Этномир. Все права защищены.</div></div>
      </div>
    </div>
  );
}



// --- FRANCHISE LANDING v3 (Apple-level) ---
function FranchiseLanding({onClose}:{onClose:()=>void}) {
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [err,setErr]=useState('');
  const [activePlan,setActivePlan]=useState(0);
  const scrollRef=React.useRef<HTMLDivElement>(null);
  const submit=async()=>{
    if(!name.trim()||!phone.trim()){setErr('Заполните имя и телефон');return;}
    setSending(true);setErr('');
    const ok=await submitContactRequest('franchise','franchise_landing',name,phone);
    if(ok){setSent(true);logActivity('franchise_lead',{name,phone});}
    else setErr('Ошибка отправки');
    setSending(false);
  };
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('fr-vis');obs.unobserve(e.target);}});
    },{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
    el.querySelectorAll('.fr-a').forEach(n=>obs.observe(n));
    return()=>obs.disconnect();
  },[]);
  const css=`.fr-a{opacity:0;transform:translateY(30px) scale(.98);transition:opacity .65s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1)}.fr-vis{opacity:1!important;transform:translateY(0) scale(1)!important}.fr-d1{transition-delay:.07s}.fr-d2{transition-delay:.14s}.fr-d3{transition-delay:.21s}.fr-d4{transition-delay:.28s}.fr-d5{transition-delay:.35s}@keyframes frFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes frGlow{0%,100%{opacity:.4}50%{opacity:.8}}@keyframes frPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}`;
  const G=48; /* consistent gap */
  const plans=[
    {name:'Парк 10 тыс. м²',area:'10 000 кв. м',invest:'$ 8 млн',payback:'3,5–4 года',fee:'$ 800 тыс.',royalty:'5 %',marketing:'1 %',cap10:'$ 70,5 млн',profit:'от $ 500 000/мес.',objects:['Музей','Выставка','VR','Мастерские','Магазины','Детский центр','Коворкинг']},
    {name:'Парк 10 га',area:'10 га (16 000 м²)',invest:'$ 25 млн',payback:'5,5–6 лет',fee:'$ 2,5 млн',royalty:'5 %',marketing:'1 %',cap10:'$ 120 млн',profit:'от $ 1,2 млн/мес.',objects:['Музей','Выставка','VR','Мастерские','Магазины','Детский центр','Коворкинг','Отель','Ресторан','СПА','Спорт']},
    {name:'Парк 20 га',area:'20 га (30 000 м²)',invest:'$ 50 млн',payback:'7–8 лет',fee:'$ 2,5 млн',royalty:'5 %',marketing:'1 %',cap10:'$ 157 млн',profit:'от $ 2 млн/мес.',objects:['Музей','Выставка','VR','Мастерские','Магазины','Детский центр','Коворкинг','Отель','Ресторан','СПА','Спорт','Природный парк','Апартаменты']}
  ];
  const p=plans[activePlan];
  /* SVG art — globe with orbiting cultures */
  const GlobeArt=()=>(<svg viewBox="0 0 200 200" width="160" height="160" style={{margin:"0 auto",display:"block"}}><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34C759" stopOpacity=".3"/><stop offset="100%" stopColor="#5AC8FA" stopOpacity=".1"/></linearGradient><radialGradient id="rg"><stop offset="0%" stopColor="#34C759" stopOpacity=".15"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs><circle cx="100" cy="100" r="60" fill="none" stroke="url(#gg)" strokeWidth="1.5"/><circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1" strokeDasharray="4 4"/><circle cx="100" cy="100" r="40" fill="url(#rg)"/><ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1"/><ellipse cx="100" cy="100" rx="25" ry="60" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1"/><circle cx="100" cy="40" r="6" fill="#FFD60A" opacity=".7" style={{animation:"frFloat 3s ease-in-out infinite"}}/><circle cx="160" cy="100" r="5" fill="#5AC8FA" opacity=".6" style={{animation:"frFloat 3s ease-in-out infinite .5s"}}/><circle cx="100" cy="160" r="5" fill="#FF9500" opacity=".6" style={{animation:"frFloat 3s ease-in-out infinite 1s"}}/><circle cx="40" cy="100" r="6" fill="#34C759" opacity=".7" style={{animation:"frFloat 3s ease-in-out infinite 1.5s"}}/><circle cx="140" cy="55" r="4" fill="#AF52DE" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite 2s"}}/><circle cx="60" cy="145" r="4" fill="#FF2D55" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite 2.5s"}}/><text x="100" y="106" textAnchor="middle" fontSize="28" fill="rgba(255,255,255,.15)" fontWeight="700" fontFamily="system-ui">ЭМ</text></svg>);
  /* SVG art — park illustration */
  const ParkArt=()=>(<svg viewBox="0 0 340 120" width="100%" height="120" style={{display:"block"}}><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a4a2e" stopOpacity=".3"/><stop offset="100%" stopColor="transparent"/></linearGradient></defs><rect width="340" height="120" fill="url(#sky)"/><path d="M0,100 Q40,70 80,85 T160,75 T240,85 T320,78 L340,100Z" fill="rgba(52,199,89,.08)"/><path d="M0,110 Q50,90 100,95 T200,88 T300,95 L340,110Z" fill="rgba(52,199,89,.04)"/>{[40,90,150,210,270,310].map((x,i)=>(<rect key={i} x={x} y={70-i*3} width={12+i*2} height={30+i*3} rx="2" fill={"rgba(255,255,255,"+(0.03+i*.008)+")"} style={{animation:"frFloat "+(2.5+i*.3)+"s ease-in-out infinite "+(i*.2)+"s"}}/>))}<circle cx="50" cy="40" r="15" fill="rgba(255,214,10,.06)"/></svg>);
  return(
    <div className="anim-slideUp" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:250,background:"#000",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{css}</style>
      {/* Floating header */}
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:10,padding:"50px 20px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(180deg,rgba(0,0,0,.92) 60%,rgba(0,0,0,0) 100%)"}}>
        <div className="tap" onClick={onClose} style={{display:"flex",alignItems:"center",gap:4}}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none"><path d="M8 1L1 8l7 7" stroke="rgba(255,255,255,.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:17,color:"rgba(255,255,255,.85)",fontFamily:FT}}>Назад</span>
        </div>
        <div className="tap" onClick={()=>{const el=document.getElementById('fr-cta3');if(el)el.scrollIntoView({behavior:'smooth'});}} style={{padding:"7px 16px",borderRadius:980,background:"#fff"}}>
          <span style={{fontSize:13,fontWeight:600,color:"#000",fontFamily:FT}}>Оставить заявку</span>
        </div>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch"}}>

        {/* ═══ 1. HERO ═══ */}
        <div style={{padding:"100px 24px 48px",background:"linear-gradient(180deg,#0a1a10 0%,#0d2818 40%,#1a4a2e 70%,#0d2018 100%)",position:"relative",textAlign:"center"}}>
          <div style={{position:"absolute",inset:0,opacity:.025,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 12px)",backgroundSize:"16px 16px"}}/>
          <div style={{position:"absolute",top:"8%",right:"-15%",width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,199,89,.1) 0%,transparent 70%)"}}/>
          <div style={{position:"relative"}}>
            <GlobeArt/>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.3)",letterSpacing:3,textTransform:"uppercase",fontFamily:FT,marginTop:20}}>Этномир · Международный проект</div>
            <div style={{fontSize:48,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1.8px",lineHeight:1,marginTop:12}}>Франшиза</div>
            <div style={{fontSize:48,fontWeight:700,color:"#34C759",fontFamily:FD,letterSpacing:"-1.8px",lineHeight:1,marginTop:4}}>мирового уровня.</div>
            <div style={{fontSize:17,color:"rgba(255,255,255,.5)",fontFamily:FT,lineHeight:1.5,marginTop:16,maxWidth:300,margin:"16px auto 0"}}>Откройте культурно-развлекательный парк в своём регионе. Прибыль от $500 000 в месяц.</div>
          </div>
        </div>

        {/* ═══ 2. PARK ART ═══ */}
        <div style={{background:"#000"}}><ParkArt/></div>

        {/* ═══ 3. TAGLINE ═══ */}
        <div className="fr-a" style={{background:"#000",padding:G+"px 24px",textAlign:"center"}}>
          <div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.25}}>Каждый посетитель совершит кругосветное путешествие, прожив историю и культуру народов мира.</div>
        </div>

        {/* ═══ 4. STATS ═══ */}
        <div style={{background:"#000",padding:"0 20px "+G+"px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["18+","лет опыта","#FFD60A","rgba(255,214,10,.05)"],["140","гектаров","#34C759","rgba(52,199,89,.05)"],["1 млн","гостей в год","#5AC8FA","rgba(90,200,250,.05)"],["96","этнодворов","#FF9500","rgba(255,149,0,.05)"]].map(([v,l,c,bg]:any,i:number)=>(
              <div key={i} className={"fr-a fr-d"+i} style={{borderRadius:20,background:bg,border:"1px solid "+c+"15",padding:"24px 14px",textAlign:"center"}}>
                <div style={{fontSize:36,fontWeight:700,letterSpacing:"-1.5px",lineHeight:1,color:c,fontFamily:FD}}>{v}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:6,textTransform:"uppercase",letterSpacing:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 5. WHY ═══ */}
        <div style={{background:"#000",padding:"0 20px "+G+"px"}}>
          <div className="fr-a" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#34C759",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>Почему Этномир</div>
            <div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.05}}>Уникальный формат.</div>
          </div>
          {[["💰","Прибыльный","Средний оборот от $500 000 в месяц. Билеты, отели, рестораны, СПА, мастер-классы, мерч, корпоративы."],["🌍","Уникальный","96 культур на одной территории. Товарный знак зарегистрирован по Мадридской системе."],["🚀","Инновационный","VR-аттракционы, интерактивные музеи, мобильное приложение, IT-платформа управления."],["🎓","Социальный","Образовательная миссия: диалог культур, толерантность. Поддержка государственных структур."],["🏗️","Многофункциональный","Музеи, отели, рестораны, спорт, СПА, коворкинг, детские центры — всё в одном парке."],["✈️","Туристический","1 млн посетителей в год в России. Etnosvet в Праге — 100 000 гостей ежегодно."]].map(([ic,t,d]:any,i:number)=>(
            <div key={i} className={"fr-a fr-d"+(i%4)} style={{borderRadius:16,background:"rgba(255,255,255,.025)",border:"0.5px solid rgba(255,255,255,.05)",padding:"16px 18px",marginBottom:8,display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{ic}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:FD}}>{t}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,lineHeight:1.5,marginTop:3}}>{d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ 6. EXPERIENCE ═══ */}
        <div style={{padding:G+"px 20px",background:"linear-gradient(180deg,#000,#0d1f15,#000)"}}>
          <div className="fr-a" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#5AC8FA",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>ОПЫТ</div>
            <div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.05}}>Проверено временем.</div>
          </div>
          <div className="fr-a" style={{borderRadius:20,background:"linear-gradient(135deg,#1a3a2a,#0d2818)",padding:20,marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:600,color:"#34C759",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:10}}>🇷🇺 РОССИЯ · С 2006 ГОДА</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {[["140","га"],["50K","м² зданий"],["1 млн","гостей/год"],["11","отелей"],["13","ресторанов"],["80","музеев"],["120","скульптур"],["12","конференц-залов"],["365","дней/год"]].map(([v,l]:any,j:number)=>(
                <div key={j} style={{textAlign:"center",padding:"8px 0"}}>
                  <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:FD}}>{v}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.3)",fontFamily:FT}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fr-a fr-d1" style={{borderRadius:20,background:"linear-gradient(135deg,#1a2a3a,#0d1828)",padding:20}}>
            <div style={{fontSize:11,fontWeight:600,color:"#5AC8FA",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:10}}>🇨🇿 ЧЕХИЯ · ETNOSVET · С 2015 ГОДА</div>
            <div style={{display:"flex",gap:20}}>
              {[["500","м²"],["100K","гостей/год"]].map(([v,l]:any,j:number)=>(
                <div key={j}><div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:FD}}>{v}</div><div style={{fontSize:9,color:"rgba(255,255,255,.3)",fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:10}}>Культурный центр и ресторан в центре Праги.</div>
          </div>
        </div>

        {/* ═══ 7. BUSINESS MODELS ═══ */}
        <div style={{padding:G+"px 20px",background:"#000"}}>
          <div className="fr-a" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#FFD60A",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>БИЗНЕС-МОДЕЛИ</div>
            <div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.05}}>Три формата.</div>
          </div>
          <div className="fr-a" style={{display:"flex",borderRadius:10,background:"rgba(255,255,255,.05)",padding:3,marginBottom:16}}>
            {plans.map((_:any,i:number)=>(
              <div key={i} className="tap" onClick={()=>setActivePlan(i)} style={{flex:1,textAlign:"center",padding:"9px 0",borderRadius:8,background:activePlan===i?"rgba(255,255,255,.1)":"transparent",transition:"all .2s"}}>
                <span style={{fontSize:11,fontWeight:activePlan===i?700:400,color:activePlan===i?"#fff":"rgba(255,255,255,.35)",fontFamily:FT}}>{["10K м²","10 га","20 га"][i]}</span>
              </div>
            ))}
          </div>
          <div className="fr-a" style={{borderRadius:20,background:"linear-gradient(135deg,#1a2a1a,#0d280d)",padding:20,border:"1px solid rgba(52,199,89,.1)"}}>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:14}}>{p.name}</div>
            {[["Площадь",p.area],["Инвестиции",p.invest],["Окупаемость",p.payback],["Паушальный взнос",p.fee],["Роялти",p.royalty],["Маркетинговый взнос",p.marketing],["Прибыль",p.profit]].map(([l,v]:any,j:number)=>(
              <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:j<6?"0.5px solid rgba(255,255,255,.05)":"none"}}>
                <span style={{fontSize:13,color:"rgba(255,255,255,.35)",fontFamily:FT}}>{l}</span>
                <span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FD}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:12,padding:"12px 14px",borderRadius:12,background:"rgba(255,214,10,.05)",border:"0.5px solid rgba(255,214,10,.12)"}}>
              <div style={{fontSize:10,color:"rgba(255,214,10,.5)",fontFamily:FT,textTransform:"uppercase",letterSpacing:1}}>КАПИТАЛИЗАЦИЯ ЧЕРЕЗ 10 ЛЕТ</div>
              <div style={{fontSize:22,fontWeight:700,color:"#FFD60A",fontFamily:FD,marginTop:4}}>{p.cap10}</div>
            </div>
            <div style={{marginTop:12}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.25)",fontFamily:FT,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>ОБЪЕКТЫ ПАРКА</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{p.objects.map((o:string,j:number)=>(<span key={j} style={{fontSize:10,color:"rgba(255,255,255,.45)",background:"rgba(255,255,255,.04)",padding:"3px 8px",borderRadius:6,fontFamily:FT}}>{o}</span>))}</div>
            </div>
          </div>
        </div>

        {/* ═══ 8. INCLUDED ═══ */}
        <div style={{padding:G+"px 20px",background:"linear-gradient(180deg,#000,#0a1520,#000)"}}>
          <div className="fr-a" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#AF52DE",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>ВКЛЮЧЕНО</div>
            <div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.05}}>Полная поддержка.</div>
          </div>
          {[["🌍","Международный бренд","Товарный знак по Мадридской системе. Признан общеизвестным в 41 классе МКТУ.","#1a3a2a"],["🏗️","Архитектура и дизайн","Концепция, генплан, проект зданий, дизайн интерьеров этнодворов.","#1a2a3a"],["📊","Финансовая модель","Бизнес-план, прогноз выручки, расчёт точки безубыточности.","#2a1a3a"],["🎭","200+ сценариев контента","Мастер-классы, экскурсии, праздники, квесты — на 365 дней.","#3a2a1a"],["💻","IT-платформа","Мобильное приложение, CRM, бронирование, программа лояльности.","#1a3a1a"],["🎓","Обучение команды","Стажировки в Этномире. Стандарты сервиса и аттестация.","#3a1a2a"],["📢","Маркетинг","Стратегия продвижения, SMM, PR-поддержка при открытии.","#1a2a2a"]].map(([ic,t,d,bg]:any,i:number)=>(
            <div key={i} className={"fr-a fr-d"+(i%4)} style={{borderRadius:16,padding:"18px",background:"linear-gradient(135deg,"+bg+",#0d0d14)",marginBottom:8}}>
              <div style={{fontSize:28,marginBottom:8}}>{ic}</div>
              <div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:FD}}>{t}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,lineHeight:1.5,marginTop:4}}>{d}</div>
            </div>
          ))}
        </div>

        {/* ═══ 9. TEAM ═══ */}
        <div style={{padding:G+"px 20px",background:"#000"}}>
          <div className="fr-a" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#FF9500",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>КОМАНДА</div>
            <div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.05}}>Опытные эксперты.</div>
          </div>
          <div className="fr-a" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[["👤","Менеджер проекта"],["📢","Маркетинг"],["💰","Финансы"],["⚖️","Юристы"],["🛠️","Запуск"],["🎨","Дизайн"]].map(([ic,l]:any,i:number)=>(
              <div key={i} style={{borderRadius:14,background:"rgba(255,255,255,.025)",border:"0.5px solid rgba(255,255,255,.05)",padding:"16px 8px",textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:6}}>{ic}</div>
                <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",fontFamily:FT,lineHeight:1.3}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 10. REQUIREMENTS ═══ */}
        <div style={{padding:G+"px 20px",background:"linear-gradient(180deg,#000,#0d1520,#000)"}}>
          <div className="fr-a" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#FF2D55",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>ТРЕБОВАНИЯ</div>
            <div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.05}}>К локации.</div>
          </div>
          {[["📍","Высокие социально-экономические показатели региона"],["👥","Население от 1 млн человек или турпоток от 1,5 млн в год"],["🛣️","Транспортная доступность: автомагистрали, аэропорты, метро"],["⚡","Коммуникации: вода, электричество, интернет"],["🏛️","Благоприятная инвестиционная политика региона"]].map(([ic,t]:any,i:number)=>(
            <div key={i} className={"fr-a fr-d"+(i%4)} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 0",borderBottom:i<4?"0.5px solid rgba(255,255,255,.04)":"none"}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,45,85,.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{ic}</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.55)",fontFamily:FT,lineHeight:1.45}}>{t}</div>
            </div>
          ))}
        </div>

        {/* ═══ 11. PROCESS ═══ */}
        <div style={{padding:G+"px 20px",background:"#000"}}>
          <div className="fr-a" style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#5856D6",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>ПРОЦЕСС</div>
            <div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.05}}>7 шагов к запуску.</div>
          </div>
          {[["01","Заявка","Оставьте заявку — мы свяжемся в течение 24 часов."],["02","Знакомство","Первичная встреча и обсуждение вашего региона."],["03","Экскурсия","Посещение парка Этномир в Калужской области."],["04","NDA","Подписание NDA и обмен финансовой информацией."],["05","Согласование","Утверждение условий договора и дорожной карты."],["06","Договор","Подписание франшизного договора."],["07","Реализация","Строительство, обучение и гранд-открытие."]].map(([n,t,d]:any,i:number)=>(
            <div key={i} className={"fr-a fr-d"+(i%4)} style={{display:"flex",gap:12,marginBottom:i<6?20:0,alignItems:"flex-start"}}>
              <div style={{width:36,height:36,borderRadius:18,background:"linear-gradient(135deg,#5856D6,#AF52DE)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:FD}}>{n}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:FD}}>{t}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.38)",fontFamily:FT,lineHeight:1.5,marginTop:2}}>{d}</div>
                {i<6&&<div style={{height:1,background:"rgba(255,255,255,.03)",marginTop:16}}/>}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ 12. QUOTE ═══ */}
        <div className="fr-a" style={{padding:G+"px 24px",background:"linear-gradient(180deg,#0d2818,#1a4a2e,#0d2818)",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12,animation:"frFloat 4s ease-in-out infinite"}}>🌏</div>
          <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.3px",lineHeight:1.3,fontStyle:"italic"}}>«Этномир — это платформа для диалога культур. Мы строим мосты между народами через образование и отдых.»</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.3)",fontFamily:FT,marginTop:12}}>Руслан Байрамов, основатель Этномира</div>
        </div>

        {/* ═══ 13. CTA + FORM ═══ */}
        <div id="fr-cta3" className="fr-a" style={{padding:G+"px 24px "+G+"px",background:"#000",textAlign:"center"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#34C759",letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:8}}>НАЧНИТЕ СЕГОДНЯ</div>
          <div style={{fontSize:40,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1.2px",lineHeight:1.05}}>Оставьте заявку.</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:8,marginBottom:24}}>Менеджер свяжется с вами в течение 24 часов.</div>
          {sent?(<div style={{borderRadius:20,background:"rgba(52,199,89,.06)",border:"1px solid rgba(52,199,89,.12)",padding:"36px 20px"}}>
            <div style={{fontSize:44,marginBottom:8}}>✅</div>
            <div style={{fontSize:20,fontWeight:700,color:"#34C759",fontFamily:FD}}>Заявка отправлена!</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:6}}>Мы перезвоним в ближайшее время.</div>
          </div>):(<div style={{textAlign:"left"}}>
            <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",fontFamily:FT,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Ваше имя</div><input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Иван Иванов" style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",fontSize:16,fontFamily:FT,color:"#fff",outline:"none"}}/></div>
            <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.25)",fontFamily:FT,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Телефон</div><input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",fontSize:16,fontFamily:FT,color:"#fff",outline:"none"}}/></div>
            {err&&<div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,textAlign:"center",marginBottom:8}}>{err}</div>}
            <div className="tap" onClick={submit} style={{height:50,borderRadius:14,background:"#34C759",display:"flex",alignItems:"center",justifyContent:"center",opacity:sending?.5:1,marginTop:4}}>
              <span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>{sending?"Отправка...":"Отправить заявку"}</span>
            </div>
          </div>)}
        </div>

        {/* ═══ 14. CONTACT ═══ */}
        <div style={{padding:"0 20px "+G+"px",background:"#000"}}>
          <div className="tap" onClick={()=>window.open('tel:+74950238181')} style={{borderRadius:16,background:"rgba(255,255,255,.025)",border:"0.5px solid rgba(255,255,255,.05)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:22,background:"rgba(52,199,89,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📞</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>+7 (495) 023-81-81</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.25)",fontFamily:FT,marginTop:2}}>achervyakov@ethnomir.ru</div>
            </div>
          </div>
        </div>

        {/* ═══ 15. FOOTER ═══ */}
        <div style={{background:"#000",padding:"20px 24px 40px",textAlign:"center",borderTop:"0.5px solid rgba(255,255,255,.03)"}}>
          <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.15)",fontFamily:FT}}>Этномир · Франшиза</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.08)",fontFamily:FT,marginTop:4}}>© 2008–2026 Калужская обл., Боровский р-н. Все права защищены.</div>
        </div>

      </div>
    </div>
  );
}


function App() {
  useEffect(()=>{
    if(typeof document!=='undefined'){
      const m=document.createElement('meta');m.name='theme-color';m.content='#000000';document.head.appendChild(m);
      const m2=document.createElement('meta');m2.name='mobile-web-app-capable';m2.content='yes';document.head.appendChild(m2);const m2b=document.createElement('meta');m2b.name='apple-mobile-web-app-capable';m2b.content='yes';document.head.appendChild(m2b);
      const m3=document.createElement('meta');m3.name='apple-mobile-web-app-status-bar-style';m3.content='black-translucent';document.head.appendChild(m3);
      const m4=document.createElement('meta');m4.name='viewport';m4.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';document.head.appendChild(m4);
      document.addEventListener('touchstart',function(){},true);const m5=document.createElement('link');m5.rel='manifest';m5.href='data:application/json,'+encodeURIComponent(JSON.stringify({name:"Этномир",short_name:"Этномир",start_url:"/",display:"standalone",background_color:"#000000",theme_color:"#1B3A2A",icons:[{src:"data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22512%22 height=%22512%22%3E%3Crect width=%22512%22 height=%22512%22 rx=%2280%22 fill=%22%231B3A2A%22/%3E%3Ctext x=%22256%22 y=%22300%22 font-size=%22200%22 fill=%22white%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-weight=%22700%22%3EEM%3C/text%3E%3C/svg%3E",sizes:"512x512",type:"image/png"}]}));document.head.appendChild(m5);
    }
  },[]);
  const [tab, setTab] = useState<Tab>('home');
  const [pendingSec, setPendingSec] = useState("");
  const [showTickets, setShowTickets] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
  const [toast, setToast] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [countryDetail, setCountryDetail] = useState<any>(null);
  const [loyaltyLevels, setLoyaltyLevels] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const toggleFav = (id:string)=>setFavorites(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [showFranchise, setShowFranchise] = useState(false);
  const [landingSlug, setLandingSlug] = useState<string|null>(null);
  // favs_from_db
  useEffect(()=>{sb('favorites','select=item_id').then(d=>{if(d&&d.length)setFavorites(new Set(d.map((f:any)=>f.item_id)));});},[]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sb_session') : null;
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s?.access_token) {
          if(s?.refresh_token){
            fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
              method: 'POST',
              headers: { apikey: SB_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: s.refresh_token })
            }).then(r=>{
              if(r.ok) return r.json();
              localStorage.removeItem('sb_session');
              setSession(null);
              return null;
            }).then(d=>{
              if(d?.access_token){
                const newS = _cleanSession({ ...d, user: _cleanUser(d.user || s.user) });
                localStorage.setItem('sb_session', JSON.stringify(newS));
                setSession(newS);
              }
            }).catch(()=>{
              setSession(_cleanSession({...s, user: _cleanUser(s.user)}));
            });
          } else {
            setSession(_cleanSession({...s, user: _cleanUser(s.user)}));
          }
        }
      } catch {}
    }
    setAuthLoading(false);
    sb("loyalty_levels","select=id,name_ru,icon,color,min_points&order=min_points.asc").then(d=>setLoyaltyLevels(d||[]));
    if(!localStorage.getItem('em_welcomed')){setShowWelcome(true);}
  }, []);

  const doLogin = async (email: string, password: string) => {
    const res = await sbAuth('token?grant_type=password', { email, password });
    if (res.access_token) {
      if(res.user)res.user=_cleanUser(res.user);
      const cleanRes = _cleanSession(res);
      setSession(cleanRes);
      localStorage.setItem('sb_session', JSON.stringify(cleanRes));
      return { ok: true };
    }
    return { ok: false, error: res.error_description || res.msg || 'Login failed' };
  };
  const doLogout = () => { setSession(null); localStorage.removeItem('sb_session'); };
  
  useEffect(()=>{
    const handler = (e:any)=>{if(e.detail?.access_token)setSession(_cleanSession(e.detail));};
    window.addEventListener('session-refreshed', handler as any);
    return ()=>window.removeEventListener('session-refreshed', handler as any);
  },[]);
  
  return (
    <>
      <style>{CSS}</style>
      <div className="eth" style={{width:'100%',maxWidth:390,height:'100dvh',margin:'0 auto',display:'flex',flexDirection:'column',background:'var(--bg)',overflow:'hidden',overflowX:'hidden',position:'relative'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
          {/* ═══ FLOATING BUTTONS ═══ */}
          <div style={{position:"absolute",top:54,right:20,display:showSearch||showPassport||showFranchise||landingSlug?"none":"flex",gap:12,zIndex:50}}>
            <div className="tap" onClick={()=>setShowSearch(true)} style={{width:44,height:44,borderRadius:22,background:"rgba(255,255,255,0.18)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 2px 12px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="7" stroke="#3C3C43" strokeWidth="2"/><path d="M16 16l5.5 5.5" stroke="#3C3C43" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="tap" onClick={()=>setShowPassport(true)} style={{width:44,height:44,borderRadius:22,background:"rgba(255,255,255,0.18)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 2px 12px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="#3C3C43" strokeWidth="1.8"/><path d="M4.5 21c0-3.3 3.4-6 7.5-6s7.5 2.7 7.5 6" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
          </div>
          {tab==='home'     && <HomeTab onBuyTicket={()=>setShowTickets(true)} onSearch={()=>setShowSearch(true)} onMap={()=>setShowMap(true)} onQR={()=>setShowQR(true)} onProfile={()=>setTab('passport')} onFranchise={()=>setShowFranchise(true)} onLanding={(s:string)=>setLandingSlug(s)} onNav={(t:any,s:any)=>{setPendingSec(s||"");setTab(t);}}/>}
          {tab==='tours'    && <ToursTab onSearch={()=>setShowSearch(true)} onBuyTicket={()=>setShowTickets(true)} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")} favorites={favorites} toggleFav={toggleFav}/>}
          {tab==='stay'     && <StayTab onSearch={()=>setShowSearch(true)} favorites={favorites} toggleFav={toggleFav} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")}/>}
          {tab==='services' && <ServicesTab onSearch={()=>setShowSearch(true)} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")}/>}
          {tab==='passport' && <EthnoMirTab onFranchise={()=>setShowFranchise(true)} onLanding={(s:string)=>setLandingSlug(s)}/>}
        </div>
        {showTickets && <TicketScreen onClose={()=>setShowTickets(false)}/>}
        {toast && <SuccessToast msg={toast} onClose={()=>setToast("")}/>}
        {showWelcome && <WelcomeScreen onDone={()=>{setShowWelcome(false);localStorage.setItem('em_welcomed','1');}}/>}
        {countryDetail && <CountryDetail country={countryDetail} onClose={()=>setCountryDetail(null)}/>}
        {showQR && <QRModal onClose={()=>setShowQR(false)} session={session}/>}
        {showMap && <MapModal onClose={()=>setShowMap(false)}/>}
        {showFranchise && <FranchiseLanding onClose={()=>setShowFranchise(false)}/>}
        {landingSlug && <UniversalLanding slug={landingSlug} onClose={()=>setLandingSlug(null)}/>}
        {showSearch && <div className="anim-fadeIn"><SearchModal onClose={()=>setShowSearch(false)} onNav={(t:string,s?:string)=>{setPendingSec(s||"");setTab(t as Tab);}}/></div>}
        {/* ═══ PASSPORT OVERLAY ═══ */}
        {showPassport && (
          <div className="anim-slideUp" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"54px 20px 12px",background:"rgba(242,242,247,0.94)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="tap" onClick={()=>setShowPassport(false)} style={{width:32,height:32,borderRadius:16,background:"rgba(120,120,128,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Паспорт</div>
              <div style={{width:32}}/>
            </div>
            <div style={{flex:1,overflow:"auto",WebkitOverflowScrolling:"touch"}}>
              <ErrorBoundary fallback={<div style={{padding:40,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>⚠️</div><div style={{fontSize:15,color:"var(--label2)"}}>Ошибка паспорта</div><div className="tap" onClick={()=>window.location.reload()} style={{marginTop:16,padding:"12px 24px",background:"#007AFF",color:"#fff",borderRadius:12,display:"inline-block",fontSize:15,fontWeight:600}}>Повторить</div></div>}><PassportView session={session} onLogin={doLogin} onLogout={doLogout} onQR={()=>{setShowPassport(false);setShowQR(true);}}/></ErrorBoundary>
            </div>
          </div>
        )}
        <TabBar active={tab} onSelect={setTab}/>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
