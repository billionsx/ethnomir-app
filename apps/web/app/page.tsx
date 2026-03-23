'use client';
import dynamic from 'next/dynamic';
// @ts-nocheck
// v60.1: 2026-03-21T19:12:00.000Z — all fixes applied
var editingRv:any = null; // global fallback for all components
const APP_V = 68;
const BackBtn = ({onClick,light}:{onClick:()=>void,light?:boolean}) => (
  <div className="tap" onClick={onClick} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 0"}}>
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke={light?"#fff":"#007AFF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <span style={{fontSize:17,color:light?"#fff":"#007AFF",fontFamily:FT}}>Назад</span>
  </div>
);
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
function _sanitize(s:string):string{return s.replace(/[<>&"']/g,(c:string)=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","\x27":"&#x27;"}[c]||c));}
function _s(v:any):string{if(v==null)return'';if(Array.isArray(v))return v.join(', ');if(typeof v==='object')return JSON.stringify(v);return String(v);}
function _cleanUser(u:any){if(!u)return{};return{id:String(u.id||''),email:String(u.email||''),phone:String(u.phone||'')}}
function _cleanSession(raw:any):any{if(!raw||typeof raw!=='object')return raw;const out:any={};for(const k in raw){const v=raw[k];if(k==='user'){out.user=_cleanUser(v);}else if(v===null||v===undefined){continue;}else if(typeof v==='string'||typeof v==='number'||typeof v==='boolean'){out[k]=v;}}return out;}
function _vpnOn(){try{return localStorage.getItem("vpn_enabled")==="true";}catch{return false;}}
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
const AmbientFX=({c1,c2,c3,d}:{c1:string,c2:string,c3:string,d?:number})=>{const o=d||0;return <>
  <div style={{position:"absolute",width:200,height:200,top:-60,right:-40,borderRadius:"50%",filter:"blur(40px)",background:c1,animation:"_am1 12s ease-in-out infinite",animationDelay:o+"s"}}/>
  <div style={{position:"absolute",width:160,height:160,bottom:-40,left:-30,borderRadius:"50%",filter:"blur(40px)",background:c2,animation:"_am2 15s ease-in-out infinite",animationDelay:(o-3)+"s"}}/>
  <div style={{position:"absolute",width:120,height:120,top:"30%",left:"40%",borderRadius:"50%",filter:"blur(40px)",background:c3,animation:"_am3 10s ease-in-out infinite",animationDelay:(o-5)+"s"}}/>
  <div style={{position:"absolute",inset:0,backdropFilter:"blur(1px)",WebkitBackdropFilter:"blur(1px)",background:"linear-gradient(180deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,0) 50%,rgba(0,0,0,.08) 100%)"}}/>
  <div style={{position:"absolute",top:"-50%",left:0,width:"60%",height:"200%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)",transform:"rotate(25deg)",animation:"_sheen "+(6+o)+"s ease-in-out infinite",pointerEvents:"none"}}/>
  {[18,30,50,12,42].map((t,i)=><div key={i} style={{position:"absolute",width:3,height:3,background:"#fff",borderRadius:"50%",top:t+"%",left:(22+i*15)+"%",animation:"_twinkle 3s ease-in-out infinite",animationDelay:(i*.6)+"s",pointerEvents:"none"}}/>)}
  {[20,60].map((l,i)=><div key={"r"+i} style={{position:"absolute",width:40,height:40,borderRadius:"50%",border:"1px solid rgba(255,255,255,.1)",top:(20+i*25)+"%",left:l+"%",animation:"_ripple 4s ease-out infinite",animationDelay:(i*2)+"s",pointerEvents:"none"}}/>)}
  {[30,70,15].map((l,i)=><div key={"f"+i} style={{position:"absolute",width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,.15)",top:(15+i*18)+"%",left:l+"%",animation:"_drift 5s ease-in-out infinite",animationDelay:(i*1.5)+"s",pointerEvents:"none"}}/>)}
</>};
const FD = '"SF Pro Display",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';
const FT = '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';

type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
  html,body{height:100%;overflow:hidden;overflow-x:hidden!important;margin:0;padding:0;max-width:100vw;background:#F2F2F7;background:var(--bg)} *{box-sizing:border-box} .eth,.eth *{box-sizing:border-box} .eth>div{max-width:390px;overflow-x:hidden}
  @media(prefers-color-scheme:dark){:root{--label:#F5F5F7;--label2:rgba(235,235,245,0.6);--label3:rgba(235,235,245,0.38);--label4:rgba(235,235,245,0.18);--bg:#000;--bg2:#1C1C1E;--fill:rgba(120,120,128,0.36);--fill3:rgba(118,118,128,0.24);--fill4:rgba(118,118,128,0.18);--sep:rgba(84,84,88,0.36);--sep-opaque:#38383A;--shadow-sm:0 1px 3px rgba(0,0,0,.3);--shadow-card:0 2px 8px rgba(0,0,0,.4);--shadow-md:0 4px 16px rgba(0,0,0,.5);}}
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
  @keyframes _am1{0%{transform:translate(0,0) scale(1);opacity:.6}33%{transform:translate(30px,-20px) scale(1.2);opacity:.8}66%{transform:translate(-20px,15px) scale(.9);opacity:.5}100%{transform:translate(0,0) scale(1);opacity:.6}}
  @keyframes _am2{0%{transform:translate(0,0) scale(1.1);opacity:.5}50%{transform:translate(-25px,-25px) scale(.85);opacity:.7}100%{transform:translate(0,0) scale(1.1);opacity:.5}}
  @keyframes _am3{0%{transform:translate(0,0) scale(.9)}40%{transform:translate(15px,20px) scale(1.15)}80%{transform:translate(-10px,-15px) scale(.95)}100%{transform:translate(0,0) scale(.9)}}
  @keyframes _sheen{0%{transform:translateX(-100%) rotate(25deg)}100%{transform:translateX(200%) rotate(25deg)}}
  @keyframes _twinkle{0%,100%{opacity:0;transform:scale(.3)}40%{opacity:.9;transform:scale(1)}60%{opacity:.7;transform:scale(.8)}}
  @keyframes _ripple{0%{transform:scale(.6);opacity:.35}100%{transform:scale(2.5);opacity:0}}
  @keyframes _drift{0%{transform:translateY(0) translateX(0)}50%{transform:translateY(-8px) translateX(4px)}100%{transform:translateY(0) translateX(0)}}
  .tap{cursor:pointer;transition:transform .22s cubic-bezier(0.34,1.56,0.64,1),opacity .15s} .ds-open .em-tabbar{display:none!important} @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}} .anim-slideUp{animation:slideUp .45s cubic-bezier(0.2,0.8,0.2,1) forwards} .anim-fadeIn{animation:fadeIn .3s ease forwards} .anim-scaleIn{animation:scaleIn .35s cubic-bezier(0.2,0.8,0.2,1) forwards} .fu{opacity:0;transform:translateY(16px);animation:fadeUp .5s ease forwards} @keyframes fadeUp{to{opacity:1;transform:translateY(0)}} .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}.s6{animation-delay:.3s}
  @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes _am1{0%{transform:translate(0,0) scale(1);opacity:.6}33%{transform:translate(30px,-20px) scale(1.2);opacity:.8}66%{transform:translate(-20px,15px) scale(.9);opacity:.5}100%{transform:translate(0,0) scale(1);opacity:.6}}
  @keyframes _am2{0%{transform:translate(0,0) scale(1.1);opacity:.5}50%{transform:translate(-25px,-25px) scale(.85);opacity:.7}100%{transform:translate(0,0) scale(1.1);opacity:.5}}
  @keyframes _am3{0%{transform:translate(0,0) scale(.9)}40%{transform:translate(15px,20px) scale(1.15)}80%{transform:translate(-10px,-15px) scale(.95)}100%{transform:translate(0,0) scale(.9)}}
  @keyframes _sheen{0%{transform:translateX(-100%) rotate(25deg)}100%{transform:translateX(200%) rotate(25deg)}}
  @keyframes _twinkle{0%,100%{opacity:0;transform:scale(.3)}40%{opacity:.9;transform:scale(1)}60%{opacity:.7;transform:scale(.8)}}
  @keyframes _ripple{0%{transform:scale(.6);opacity:.35}100%{transform:scale(2.5);opacity:0}}
  @keyframes _drift{0%{transform:translateY(0) translateX(0)}50%{transform:translateY(-8px) translateX(4px)}100%{transform:translateY(0) translateX(0)}}
  .tap{-webkit-tap-highlight-color:transparent} .tap:active{transform:scale(0.96)!important;opacity:.7!important;transition:transform .08s,opacity .06s}
  @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .slide-up{animation:slideUp .35s cubic-bezier(.2,.8,.2,1)}
  .fade-in{animation:fadeIn .25s ease} .anim-fadeIn{animation:fadeIn .3s ease forwards}
  .glass-p{backdrop-filter:blur(40px) saturate(200%) brightness(1.08);
    -webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.08);
    background:rgba(255,255,255,0.72);border:0.5px solid rgba(0,0,0,0.08);
    box-shadow:inset 0 0.5px 0 rgba(255,255,255,0.5),0 8px 32px rgba(0,0,0,0.10)}
  /* ═══ iOS 26+ ANIMATION SYSTEM ═══ */
  @keyframes springIn{0%{opacity:0;transform:scale(0.85) translateY(20px)}60%{transform:scale(1.02) translateY(-4px)}100%{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes springScale{0%{transform:scale(0.9)}60%{transform:scale(1.03)}100%{transform:scale(1)}}
  @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(0,122,255,0.3)}50%{box-shadow:0 0 0 8px rgba(0,122,255,0)}}
  @keyframes floatUp{0%{opacity:0;transform:translateY(30px) scale(0.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes cardPress{0%{transform:scale(1)}50%{transform:scale(0.95)}100%{transform:scale(1)}}
  @keyframes tabSwitch{0%{opacity:0;transform:translateY(8px) scale(0.98)}100%{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes heroParallax{from{transform:scale(1.08) translateY(0)}to{transform:scale(1) translateY(-20px)}}
  @keyframes badgeBounce{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes ripple{0%{transform:scale(0);opacity:0.5}100%{transform:scale(4);opacity:0}}
  .spring-in{animation:springIn .55s cubic-bezier(0.175,0.885,0.32,1.275) both}
  .spring-scale{animation:springScale .4s cubic-bezier(0.175,0.885,0.32,1.275) both}
  .float-up{animation:floatUp .5s cubic-bezier(0.2,0.8,0.2,1) both}
  .tab-content{animation:tabSwitch .35s cubic-bezier(0.2,0.8,0.2,1) both}
  .shimmer{background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.04) 50%,rgba(255,255,255,0) 100%);background-size:200% 100%;animation:shimmer 1.8s ease infinite}
  .pulse-cta{animation:pulseGlow 2.5s ease infinite}
  .breathe{animation:breathe 4s ease-in-out infinite}
  .badge-bounce{animation:badgeBounce .4s cubic-bezier(0.175,0.885,0.32,1.275) both}
  @keyframes _am1{0%{transform:translate(0,0) scale(1);opacity:.6}33%{transform:translate(30px,-20px) scale(1.2);opacity:.8}66%{transform:translate(-20px,15px) scale(.9);opacity:.5}100%{transform:translate(0,0) scale(1);opacity:.6}}
  @keyframes _am2{0%{transform:translate(0,0) scale(1.1);opacity:.5}50%{transform:translate(-25px,-25px) scale(.85);opacity:.7}100%{transform:translate(0,0) scale(1.1);opacity:.5}}
  @keyframes _am3{0%{transform:translate(0,0) scale(.9)}40%{transform:translate(15px,20px) scale(1.15)}80%{transform:translate(-10px,-15px) scale(.95)}100%{transform:translate(0,0) scale(.9)}}
  @keyframes _sheen{0%{transform:translateX(-100%) rotate(25deg)}100%{transform:translateX(200%) rotate(25deg)}}
  @keyframes _twinkle{0%,100%{opacity:0;transform:scale(.3)}40%{opacity:.9;transform:scale(1)}60%{opacity:.7;transform:scale(.8)}}
  @keyframes _ripple{0%{transform:scale(.6);opacity:.35}100%{transform:scale(2.5);opacity:0}}
  @keyframes _drift{0%{transform:translateY(0) translateX(0)}50%{transform:translateY(-8px) translateX(4px)}100%{transform:translateY(0) translateX(0)}}
  .tap{-webkit-tap-highlight-color:transparent;transition:transform .2s cubic-bezier(0.2,0.8,0.2,1),opacity .15s ease}
  .tap:active{transform:scale(0.97)!important;opacity:.85!important}
  .card-hover{transition:transform .3s cubic-bezier(0.2,0.8,0.2,1),box-shadow .3s ease}
  .card-hover:active{transform:scale(0.97)!important;box-shadow:0 2px 8px rgba(0,0,0,0.15)!important}
  .btn-spring{transition:transform .25s cubic-bezier(0.175,0.885,0.32,1.275)}
  .btn-spring:active{transform:scale(0.92)!important}
  .hero-img{animation:heroParallax 1s cubic-bezier(0.2,0.8,0.2,1) both}
  .stagger-1{animation-delay:.06s}.stagger-2{animation-delay:.12s}.stagger-3{animation-delay:.18s}.stagger-4{animation-delay:.24s}.stagger-5{animation-delay:.3s}.stagger-6{animation-delay:.36s}.stagger-7{animation-delay:.42s}.stagger-8{animation-delay:.48s}
  .ios-sheet{animation:sheetUp .5s cubic-bezier(0.2,0.8,0.2,1) both} .anim-slideUp{animation:slideUp .45s cubic-bezier(0.2,0.8,0.2,1) forwards}
  .ios-modal{animation:springIn .5s cubic-bezier(0.175,0.885,0.32,1.275) both}
  .smooth-appear{opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .4s cubic-bezier(0.2,0.8,0.2,1)}
  .smooth-appear.visible{opacity:1;transform:translateY(0)}
  /* ═══ POLISH ═══ */
  *::-webkit-scrollbar{display:none}*{scrollbar-width:none}
  img{transition:opacity .3s ease}img[src=""]{display:none}img:not([src]){display:none}
  .img-fade{opacity:0;transition:opacity .4s ease}.img-fade.loaded{opacity:1}
  .section-gap{margin-bottom:20px}
  .pill-scroll{display:flex;gap:8px;overflow-x:auto;padding:0 20px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
  .pill-scroll>*{scroll-snap-align:start;flex-shrink:0}
  .scroll-fade{-webkit-mask-image:linear-gradient(to right,transparent,black 16px,black calc(100% - 16px),transparent);mask-image:linear-gradient(to right,transparent,black 16px,black calc(100% - 16px),transparent)}
  .card-ios{background:var(--bg2);border-radius:16px;border:0.5px solid var(--sep-opaque);box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden;transition:transform .2s cubic-bezier(0.2,0.8,0.2,1)}
  .card-ios:active{transform:scale(0.97)}
  .section-title{fontSize:20px;fontWeight:700;letterSpacing:-0.3px}
  .safe-bottom{padding-bottom:env(safe-area-inset-bottom,0)}
  .back-btn{position:sticky;top:0;zIndex:10;display:flex;alignItems:center;gap:6;padding:14px 20px;background:var(--bg);borderBottom:0.5px solid var(--sep);cursor:pointer}
  @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
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
          <div key={i} style={{width:step===i?20:6,height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:step===i?"#fff":"rgba(255,255,255,.25)",transition:"all .3s cubic-bezier(0.2,0.8,0.2,1)"}}/>
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

function BookingModal({item,type,total,guests,onClose,cart,setCart,userId}:{item:any,type:string,total:number,guests:number,onClose:()=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void,onCalendar?:()=>void}) {
  // ЕДИНЫЙ СТАНДАРТ: cart есть → сразу добавляем, без формы
  useEffect(()=>{
    if(cart&&setCart){
      const catMap:Record<string,string>={tour:"tour",masterclass:"masterclass",hotel:"hotel",event:"event"};
      const nc=addToCart(cart,setCart,{cat:catMap[type]||"service",itemId:item.id||"",name:item.name||item.name_ru||"",emoji:item.cover_emoji||"🎫",qty:guests,price:total/Math.max(guests,1),meta:{type}});
      syncCartToDB(nc,userId);
      const te=document.createElement("div");te.style.cssText="position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#34C759;color:#fff;padding:10px 24px;border-radius:50px;font-size:14px;font-weight:600;z-index:10000;font-family:-apple-system,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15)";te.textContent="✓ Добавлено в корзину";document.body.appendChild(te);setTimeout(()=>te.remove(),2000);
      onClose();
      return;
    }
  },[]);
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
      if(r.ok){setDone(true);logAction(null,"booking",type,item.id||"",{item_name:item.name||item.name_ru,total,guests});fetch(SB_URL+"/rest/v1/orders",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({type,items:JSON.stringify([{id:item.id,name:item.name||item.name_ru,qty:guests}]),subtotal:total,total,guest_name:name,guest_phone:phone,status:"pending"})}).catch(()=>{});fetch(SB_URL+"/rest/v1/rpc/create_receipt",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({p_items:[{item_type:type||"hotel",item_name:item.name||item.name_ru||"",unit_price:total||0,quantity:1,details:{nights:item._nights||null,guests:guests},country_visited:""}],p_guest_name:name,p_guest_phone:phone.replace(/\\D/g,""),p_payment_method:"request",p_idempotency_key:"book-"+Date.now()})}).catch(()=>{});}else{setErr("Ошибка. Позвоните +7 (495) 023-43-49");}
    }catch{setErr("Нет связи. Попробуйте позже.");}
    setSending(false);
  };

  if(done) return (
    <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="fu" style={{background:"rgba(249,249,249,0.78)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",borderRadius:32,padding:"40px 24px",maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 16px 48px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.4)",border:"0.5px solid rgba(255,255,255,0.35)"}}>
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
      <div className="fu" onClick={(e:any)=>e.stopPropagation()} style={{background:"rgba(249,249,249,0.78)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",borderRadius:"28px 28px 0 0",padding:"6px 16px 28px",maxWidth:390,width:"100%",boxShadow:"0 -1px 0 rgba(0,0,0,0.04), 0 -4px 16px rgba(0,0,0,0.04)",border:"0.5px solid rgba(255,255,255,0.5)",border:"0.5px solid rgba(255,255,255,0.35)"}}>
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
      <div style={{flex:1,overflowY:"auto",padding:20,paddingBottom:110}}>
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
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState("");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream|null>(null);
  const scannerRef = React.useRef<any>(null);
  const startCamera = async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:640},height:{ideal:480}}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.setAttribute("playsinline","");videoRef.current.setAttribute("webkit-playsinline","");videoRef.current.muted=true;try{await videoRef.current.play();}catch{}}
      setCamActive(true);setCamError("");
      if(typeof (window as any).BarcodeDetector!=="undefined"){
        const det=new (window as any).BarcodeDetector({formats:["qr_code"]});
        scannerRef.current=setInterval(async()=>{if(!videoRef.current||videoRef.current.readyState<2)return;try{const r=await det.detect(videoRef.current);if(r.length>0&&r[0].rawValue){setCode(r[0].rawValue);clearInterval(scannerRef.current);stopCamera();setTimeout(()=>{document.getElementById("qr-go")?.click();},200);}}catch{}},400);
      }
    }catch(e:any){setCamError(e.name==="NotAllowedError"?"Разрешите камеру в настройках":"Камера недоступна");}
  };
  const stopCamera=()=>{if(scannerRef.current)clearInterval(scannerRef.current);if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;setCamActive(false);};
  React.useEffect(()=>{startCamera();return()=>{stopCamera();};},[]);
  const scan=async()=>{
    if(!code.trim()){setError("Введите код");return;}
    setLoading(true);setError("");setResult(null);
    try{const r=await fetch(SB_URL+"/rest/v1/rpc/scan_qr_code",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_code:code.trim(),p_user_id:session?.user?.id||null})});const d=await r.json();if(d.ok){setResult(d);stopCamera();}else{setError(d.error==="invalid_code"?"Код не найден":"Ошибка");}}catch{setError("Нет связи");}
    setLoading(false);
  };
  if(result) return (
    <div style={{position:"fixed",inset:0,margin:"0 auto",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div className="fu" style={{textAlign:"center",width:"100%"}}>
        {result.already?(<>
          <div style={{fontSize:64,marginBottom:16}}>{result.type==="masterclass"?(result.masterclass?.cover_emoji||""):result.country?.flag_emoji||""}</div>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{result.type==="masterclass"?result.masterclass?.name_ru:result.country?.name_ru}</div>
          <div style={{fontSize:15,color:"var(--label2)",fontFamily:FT,marginTop:8}}>{result.type==="masterclass"?"Этот мастер-класс уже в паспорте!":"Эта страна уже в паспорте!"}</div>
          <div style={{marginTop:12,padding:"6px 16px",borderRadius:10,background:"rgba(52,199,89,.1)",display:"inline-block"}}><span style={{fontSize:13,fontWeight:600,color:"#34C759",fontFamily:FT}}>Посещено ранее</span></div>
        </>):(<>
          <div style={{width:96,height:96,borderRadius:48,background:"rgba(52,199,89,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}} className="celebrate"><span style={{fontSize:48}}>{result.type==="masterclass"?(result.masterclass?.cover_emoji||""):result.country?.flag_emoji||""}</span></div>
          <div style={{fontSize:12,fontWeight:700,color:"#34C759",fontFamily:FT,letterSpacing:1,textTransform:"uppercase"}}>{result.type==="masterclass"?"Мастер-класс пройден":"Новый штамп"}</div>
          <div style={{fontSize:28,fontWeight:700,color:"var(--label)",fontFamily:FD,marginTop:8}}>{result.type==="masterclass"?result.masterclass?.name_ru:result.country?.name_ru}</div>
          <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8,lineHeight:1.5}}>{result.type==="masterclass"?(result.total?" из 41 пройдено":""):(result.country?.fun_fact_ru||"")}</div>
          <div style={{marginTop:20,padding:"10px 24px",borderRadius:30,background:"linear-gradient(135deg,#FFD700,#FFA500)",display:"inline-block"}} className="celebrate"><span style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:FD}}>+{result.points||15} очков</span></div>
        </>)}
        <div className="tap" onClick={()=>{setResult(null);setCode("");startCamera();}} style={{marginTop:28,height:50,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>Сканировать ещё</span></div>
        <div className="tap" onClick={onClose} style={{marginTop:12,padding:10}}><span style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Закрыть</span></div>
      </div>
    </div>
  );
  return (
    <div style={{position:"fixed",inset:0,margin:"0 auto",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"54px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Сканер</div>
        <div className="tap" onClick={()=>{stopCamera();onClose();}} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>✕</span></div>
      </div>
      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"0 20px"}}>
        {/* Camera */}
        <div style={{aspectRatio:"4/3",borderRadius:20,background:"#000",position:"relative",overflow:"hidden",marginBottom:20}}>
          <video ref={videoRef} playsInline muted autoPlay style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{width:"65%",aspectRatio:"1",position:"relative",maxWidth:220}}>
              <div style={{position:"absolute",top:0,left:0,width:28,height:28,borderTop:"3px solid #007AFF",borderLeft:"3px solid #007AFF",borderRadius:"6px 0 0 0"}}/>
              <div style={{position:"absolute",top:0,right:0,width:28,height:28,borderTop:"3px solid #007AFF",borderRight:"3px solid #007AFF",borderRadius:"0 6px 0 0"}}/>
              <div style={{position:"absolute",bottom:0,left:0,width:28,height:28,borderBottom:"3px solid #007AFF",borderLeft:"3px solid #007AFF",borderRadius:"0 0 0 6px"}}/>
              <div style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderBottom:"3px solid #007AFF",borderRight:"3px solid #007AFF",borderRadius:"0 0 6px 0"}}/>
              <div style={{position:"absolute",left:8,right:8,height:2,background:"linear-gradient(90deg,transparent,#007AFF,transparent)",animation:"qrScanLine 2s ease-in-out infinite"}}/>
            </div>
          </div>
          {!camActive&&!camError&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#000"}}><span style={{color:"rgba(255,255,255,.5)",fontFamily:FT,fontSize:14}}>Запуск камеры...</span></div>}
          {camError&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.9)",padding:20,gap:8}}><span style={{fontSize:14,color:"rgba(255,255,255,.6)",fontFamily:FT,textAlign:"center"}}>{camError}</span><div className="tap" onClick={startCamera} style={{padding:"8px 20px",borderRadius:10,background:"var(--blue)"}}><span style={{fontSize:14,color:"#fff",fontFamily:FT}}>Повторить</span></div></div>}
        </div>
        {/* Input */}
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <input value={code} onChange={(e:any)=>setCode(e.target.value.toUpperCase())} onKeyDown={(e:any)=>e.key==="Enter"&&scan()} placeholder="ETHNO-JAPAN-2026" style={{flex:1,height:50,padding:"0 16px",borderRadius:14,border:"0.5px solid var(--sep-opaque)",background:"var(--bg2)",fontSize:16,fontFamily:FT,color:"var(--label)",letterSpacing:0.5,outline:"none"}} />
        </div>
        {error&&<div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,marginBottom:8,textAlign:"center"}}>{error}</div>}
        <div id="qr-go" className="tap" onClick={scan} style={{height:50,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",opacity:loading?.5:1,marginBottom:24}}><span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>{loading?"Проверяю...":"Проверить код"}</span></div>
        {/* How it works */}
        <div style={{padding:20,borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>Как собрать паспорт</div>
          {[{n:"1",c:"#007AFF",bg:"rgba(0,122,255,0.1)",t:"Наведите камеру на QR-код",d:"QR-коды размещены у каждого этнодвора и мастер-класса на территории парка"},{n:"2",c:"#34C759",bg:"rgba(52,199,89,0.1)",t:"Получите штамп в паспорт",d:"Страна или мастер-класс засчитается в ваш цифровой паспорт Этномира"},{n:"3",c:"#FF9500",bg:"rgba(255,149,0,0.1)",t:"Копите баллы и достижения",d:"Страна = 15 очков, мастер-класс = 20. Соберите все 96 стран и 41 МК!"}].map((s,i)=>(<div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<2?14:0}}><div style={{width:32,height:32,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,fontWeight:700,color:s.c,fontFamily:FD}}>{s.n}</div><div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{s.t}</div><div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:2,lineHeight:1.4}}>{s.d}</div></div></div>))}
        </div>
        {!session&&<div style={{padding:"12px 16px",borderRadius:12,background:"rgba(0,122,255,.06)",display:"flex",gap:10,alignItems:"center",marginBottom:20}}><span style={{fontSize:18}}>💡</span><div style={{fontSize:12,color:"#007AFF",fontFamily:FT,lineHeight:1.4}}>Войдите в аккаунт, чтобы штампы сохранялись</div></div>}
        <div style={{height:80}}/>
      </div>
    </div>
  );
}

function CalendarView({onClose,onBuy}:{onClose:()=>void,onBuy?:()=>void}) {
  const [events,setEvents]=useState<any[]>([]);
  const [month,setMonth]=useState(new Date().getMonth());
  const [year,setYear]=useState(new Date().getFullYear());
  const [selDay,setSelDay]=useState<number|null>(new Date().getDate());
  const MN=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  const WD=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  useEffect(()=>{sb("park_events","select=*&is_active=eq.true&order=date_start.asc").then(d=>setEvents(d||[]));},[]);
  const daysInMonth=new Date(year,month+1,0).getDate();
  const firstDow=(new Date(year,month,1).getDay()+6)%7;
  const today=new Date();
  const isToday=(d:number)=>today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
  const pad=(d:number)=>String(year)+"-"+String(month+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
  const dayEvents=(d:number)=>events.filter(e=>{const ds=e.date_start,de=e.date_end||ds,p=pad(d);return p>=ds&&p<=de;});
  const hasEvent=(d:number)=>dayEvents(d).length>0;
  const prevM=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);setSelDay(null);};
  const nextM=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);setSelDay(null);};
  const selEvents=selDay?dayEvents(selDay):[];
  const catColor=(c:string)=>c==="festival"?"#007AFF":c==="holiday"?"#FF3B30":c==="kids"?"#34C759":"#FF9500";
  return (
    <div style={{position:"fixed",inset:0,margin:"0 auto",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"54px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Календарь</div>
        <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>✕</span></div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"0 20px"}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div className="tap" onClick={prevM} style={{width:36,height:36,borderRadius:18,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>‹</span></div>
          <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{MN[month]} {year}</div>
          <div className="tap" onClick={nextM} style={{width:36,height:36,borderRadius:18,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>›</span></div>
        </div>
        {/* Weekday headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:0,marginBottom:8}}>
          {WD.map(w=><div key={w} style={{textAlign:"center",fontSize:11,fontWeight:600,color:"var(--label3)",fontFamily:FT,padding:"4px 0"}}>{w}</div>)}
        </div>
        {/* Day grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:20}}>
          {Array(firstDow).fill(0).map((_,i)=><div key={"e"+i}/>)}
          {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
            const sel=selDay===d;const td=isToday(d);const he=hasEvent(d);
            return <div key={d} className="tap" onClick={()=>setSelDay(d)} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:12,background:sel?"var(--blue)":td?"rgba(0,122,255,0.08)":"transparent",cursor:"pointer",position:"relative"}}>
              <span style={{fontSize:16,fontWeight:sel||td?700:400,color:sel?"#fff":td?"#007AFF":"var(--label)",fontFamily:FT}}>{d}</span>
              {he&&!sel&&<div style={{position:"absolute",bottom:4,width:5,height:5,borderRadius:3,background:sel?"#fff":"#007AFF"}}/>}
              {he&&sel&&<div style={{position:"absolute",bottom:4,width:5,height:5,borderRadius:3,background:"#fff"}}/>}
            </div>;
          })}
        </div>
        {/* Selected day events */}
        {selDay&&<div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>{selDay} {MN[month].toLowerCase()}</div>
          {selEvents.length===0?<div style={{padding:"20px",borderRadius:16,background:"var(--bg2)",textAlign:"center"}}><span style={{fontSize:14,color:"var(--label3)",fontFamily:FT}}>Нет событий в этот день</span></div>:
          selEvents.map((e:any,i:number)=>(
            <div key={i} style={{padding:"14px 16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:44,height:44,borderRadius:14,background:catColor(e.category)+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22}}>{e.cover_emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{e.name_ru}</div>
                <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{new Date(e.date_start).toLocaleDateString("ru",{day:"numeric",month:"short"})} {e.date_end&&e.date_end!==e.date_start?"— "+new Date(e.date_end).toLocaleDateString("ru",{day:"numeric",month:"short"}):""}</div>
              </div>
              <div style={{padding:"4px 10px",borderRadius:8,background:catColor(e.category)+"20"}}><span style={{fontSize:11,fontWeight:600,color:catColor(e.category),fontFamily:FT}}>{e.category==="festival"?"Фестиваль":e.category==="holiday"?"Праздник":e.category==="kids"?"Дети":"Событие"}</span></div>
            </div>
          ))}
        </div>}
        {/* Promo banner */}
        <div style={{padding:"20px",borderRadius:20,background:"linear-gradient(135deg,#007AFF,#5856D6)",marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)",fontFamily:FT}}>Планируйте заранее</div>
          <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>Бронируйте отель на дни фестивалей</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:6,lineHeight:1.4}}>Номера на праздничные даты заканчиваются за 2–3 недели. Забронируйте сейчас со скидкой!</div>
          <div className="tap" onClick={onBuy} style={{marginTop:12,padding:"10px 20px",borderRadius:12,background:"rgba(255,255,255,.2)",display:"inline-block"}}><span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FT}}>Забронировать</span></div>
        </div>
        {/* Legend */}
        <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:20,padding:"12px 16px",borderRadius:12,background:"var(--bg2)"}}>
          {[{c:"#007AFF",l:"Фестиваль"},{c:"#FF3B30",l:"Праздник"},{c:"#34C759",l:"Дети"},{c:"#FF9500",l:"Событие"}].map(x=><div key={x.l} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:4,background:x.c}}/><span style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>{x.l}</span></div>)}
        </div>
        <div style={{height:80}}/>
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

function HomeTab({onBuyTicket,onSearch,onMap,onQR,onProfile,onFranchise,onLanding,onNav}:{onBuyTicket?:()=>void,onSearch?:()=>void,onMap?:()=>void,onQR?:()=>void,onProfile?:()=>void,onNav?:(t:string,s?:string)=>void,onFranchise?:()=>void,onLanding?:(s:string)=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void,onCalendar?:()=>void}) {
  const [slide, setSlide] = useState(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [rests, setRests] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [viewStory, setViewStory] = useState<any>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [weather, setWeather] = useState<any>(null);
  const [promos, setPromos] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [parkEvents, setParkEvents] = useState<any[]>([]);
  useEffect(()=>{sb("daily_schedule","select=name_ru,location_ru,time_start,cover_emoji,category&is_active=eq.true&order=time_start.asc").then(d=>setSchedule(d||[]));
    sb("park_events","select=*&is_active=eq.true&date_start=gte."+new Date().toISOString().slice(0,10)+"&order=date_start.asc&limit=8").then(d=>setParkEvents(d||[]));
  },[]);
  const _touchX = React.useRef(0);
  const _swiped = React.useRef(false);
  const _touchT = React.useRef(0);
  const heroSvgs = [
`<svg viewBox="0 0 390 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><radialGradient id="z1" cx="75%" cy="18%"><stop offset="0%" stop-color="#FFD700" stop-opacity=".8"/><stop offset="50%" stop-color="#FF6B35" stop-opacity=".3"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><path d="M0 30 Q100 0 200 40 Q300 10 390 30 L390 100 Q300 70 200 110 Q100 60 0 100Z" fill="#C084FC" opacity=".1"><animate attributeName="d" values="M0 30 Q100 0 200 40 Q300 10 390 30 L390 100 Q300 70 200 110 Q100 60 0 100Z;M0 40 Q100 10 200 30 Q300 20 390 40 L390 110 Q300 80 200 100 Q100 70 0 110Z;M0 30 Q100 0 200 40 Q300 10 390 30 L390 100 Q300 70 200 110 Q100 60 0 100Z" dur="8s" repeatCount="indefinite"/></path><path d="M0 60 Q130 30 260 70 Q340 40 390 60 L390 140 Q340 110 260 140 Q130 100 0 140Z" fill="#22D3EE" opacity=".07"><animate attributeName="d" values="M0 60 Q130 30 260 70 Q340 40 390 60 L390 140 Q340 110 260 140 Q130 100 0 140Z;M0 70 Q130 40 260 60 Q340 50 390 70 L390 150 Q340 120 260 130 Q130 110 0 150Z;M0 60 Q130 30 260 70 Q340 40 390 60 L390 140 Q340 110 260 140 Q130 100 0 140Z" dur="10s" repeatCount="indefinite"/></path><circle cx="320" cy="60" r="90" fill="url(#z1)"/><circle cx="195" cy="170" r="160" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="8 5" opacity=".3"><animateTransform attributeName="transform" type="rotate" from="0 195 170" to="360 195 170" dur="40s" repeatCount="indefinite"/></circle><circle cx="195" cy="170" r="130" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="5 6" opacity=".2"><animateTransform attributeName="transform" type="rotate" from="360 195 170" to="0 195 170" dur="28s" repeatCount="indefinite"/></circle><circle cx="195" cy="170" r="190" fill="none" stroke="#fff" stroke-width=".7" stroke-dasharray="3 10" opacity=".12"><animateTransform attributeName="transform" type="rotate" from="0 195 170" to="360 195 170" dur="55s" repeatCount="indefinite"/></circle><ellipse cx="195" cy="170" rx="160" ry="60" fill="none" stroke="#fff" stroke-width=".8" opacity=".12"/><ellipse cx="195" cy="170" rx="60" ry="160" fill="none" stroke="#fff" stroke-width=".8" opacity=".12"/><circle cx="100" cy="80" r="8" fill="#FFD700" opacity=".45"><animate attributeName="r" values="5;10;5" dur="2.5s" repeatCount="indefinite"/><animate attributeName="opacity" values=".2;.55;.2" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="290" cy="100" r="7" fill="#FF6B9D" opacity=".4"><animate attributeName="r" values="4;9;4" dur="3s" repeatCount="indefinite" begin=".5s"/></circle><circle cx="70" cy="190" r="6" fill="#22D3EE" opacity=".35"><animate attributeName="r" values="4;8;4" dur="3.5s" repeatCount="indefinite" begin="1s"/></circle><circle cx="320" cy="200" r="7" fill="#C084FC" opacity=".4"><animate attributeName="r" values="4;9;4" dur="2.8s" repeatCount="indefinite" begin=".7s"/></circle><circle cx="160" cy="60" r="5" fill="#34D399" opacity=".35"><animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" begin="1.5s"/></circle><circle cx="240" cy="280" r="6" fill="#FB923C" opacity=".3"><animate attributeName="r" values="3;8;3" dur="4s" repeatCount="indefinite" begin="2s"/></circle><circle cx="50" cy="300" r="5" fill="#F43F5E" opacity=".3"><animate attributeName="r" values="3;7;3" dur="3s" repeatCount="indefinite" begin="1.2s"/></circle><path d="M0 300 Q50 270 110 290 Q170 255 240 280 Q310 262 390 290 L390 400 L0 400Z" fill="#fff" opacity=".1"/><path d="M0 330 Q70 310 140 325 Q210 305 280 320 Q350 308 390 325 L390 400 L0 400Z" fill="#fff" opacity=".07"/><path d="M0 355 Q100 340 200 350 Q300 338 390 355 L390 400 L0 400Z" fill="#fff" opacity=".05"/><rect x="40" y="260" width="24" height="60" rx="3" fill="#fff" opacity=".14"/><path d="M30 260 L52 228 L74 260Z" fill="#fff" opacity=".12"/><rect x="130" y="255" width="32" height="65" rx="2" fill="#fff" opacity=".12"/><circle cx="146" cy="240" r="16" fill="#fff" opacity=".08"/><rect x="240" y="250" width="26" height="70" rx="3" fill="#fff" opacity=".13"/><rect x="246" y="238" width="14" height="12" rx="1" fill="#fff" opacity=".08"/><path d="M330 335 L345 275 L360 335Z" fill="#fff" opacity=".09"/><circle cx="30" cy="15" r="2.5" fill="#fff"><animate attributeName="opacity" values=".15;.6;.15" dur="2s" repeatCount="indefinite"/></circle><circle cx="150" cy="10" r="2" fill="#fff"><animate attributeName="opacity" values=".1;.55;.1" dur="3s" repeatCount="indefinite" begin=".7s"/></circle><circle cx="380" cy="30" r="2" fill="#fff"><animate attributeName="opacity" values=".1;.5;.1" dur="2.5s" repeatCount="indefinite" begin="1.5s"/></circle><circle cx="60" cy="45" r="1.5" fill="#fff"><animate attributeName="opacity" values=".1;.45;.1" dur="4s" repeatCount="indefinite" begin=".3s"/></circle><circle cx="250" cy="20" r="1.5" fill="#fff"><animate attributeName="opacity" values=".1;.5;.1" dur="3.5s" repeatCount="indefinite" begin="2s"/></circle></svg>`,
`<svg viewBox="0 0 390 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0B0D2E" stop-opacity=".6"/><stop offset="60%" stop-color="#1B1464" stop-opacity=".3"/><stop offset="100%" stop-color="transparent"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="390" height="400" fill="url(#nsky)" opacity=".5"/><circle cx="320" cy="50" r="18" fill="#FDE68A" opacity=".6"><animate attributeName="opacity" values=".4;.7;.4" dur="6s" repeatCount="indefinite"/></circle><circle cx="320" cy="50" r="22" fill="none" stroke="#FDE68A" stroke-width=".5" opacity=".2"><animate attributeName="r" values="22;28;22" dur="6s" repeatCount="indefinite"/></circle><circle cx="30" cy="30" r="1.5" fill="#fff"><animate attributeName="opacity" values=".2;.8;.2" dur="2s" repeatCount="indefinite"/></circle><circle cx="90" cy="15" r="1" fill="#fff"><animate attributeName="opacity" values=".1;.7;.1" dur="3s" repeatCount="indefinite" begin=".5s"/></circle><circle cx="150" cy="40" r="1.5" fill="#fff"><animate attributeName="opacity" values=".15;.6;.15" dur="2.5s" repeatCount="indefinite" begin="1s"/></circle><circle cx="220" cy="20" r="1" fill="#fff"><animate attributeName="opacity" values=".1;.8;.1" dur="4s" repeatCount="indefinite" begin="1.5s"/></circle><circle cx="270" cy="45" r="1.2" fill="#fff"><animate attributeName="opacity" values=".2;.7;.2" dur="2.8s" repeatCount="indefinite" begin=".8s"/></circle><circle cx="370" cy="25" r="1" fill="#fff"><animate attributeName="opacity" values=".1;.6;.1" dur="3.5s" repeatCount="indefinite" begin="2s"/></circle><circle cx="60" cy="60" r="1" fill="#fff"><animate attributeName="opacity" values=".15;.5;.15" dur="3s" repeatCount="indefinite" begin="1.2s"/></circle><circle cx="340" cy="70" r="1.3" fill="#fff"><animate attributeName="opacity" values=".1;.65;.1" dur="2.2s" repeatCount="indefinite" begin=".3s"/></circle><path d="M0 300 Q50 280 110 295 Q170 270 230 288 Q290 275 350 290 Q375 282 390 290 L390 400 L0 400Z" fill="#fff" opacity=".06"/><path d="M0 330 Q70 315 140 325 Q210 310 280 322 Q350 312 390 325 L390 400 L0 400Z" fill="#fff" opacity=".04"/><rect x="30" y="230" width="60" height="90" rx="4" fill="#fff" opacity=".12"/><path d="M20 230 L60 185 L100 230Z" fill="#fff" opacity=".1"/><rect x="42" y="248" width="12" height="14" rx="1" fill="#FDE68A" opacity=".5" filter="url(#glow)"><animate attributeName="opacity" values=".3;.6;.3" dur="4s" repeatCount="indefinite"/></rect><rect x="64" y="248" width="12" height="14" rx="1" fill="#FDE68A" opacity=".45" filter="url(#glow)"><animate attributeName="opacity" values=".25;.55;.25" dur="5s" repeatCount="indefinite" begin="1s"/></rect><rect x="42" y="280" width="12" height="14" rx="1" fill="#87CEEB" opacity=".3"><animate attributeName="opacity" values=".15;.4;.15" dur="6s" repeatCount="indefinite" begin="2s"/></rect><rect x="64" y="280" width="12" height="14" rx="1" fill="#FDE68A" opacity=".5" filter="url(#glow)"><animate attributeName="opacity" values=".35;.6;.35" dur="3.5s" repeatCount="indefinite" begin=".5s"/></rect><rect x="150" y="210" width="70" height="110" rx="4" fill="#fff" opacity=".11"/><circle cx="185" cy="195" r="18" fill="#fff" opacity=".06"/><rect x="162" y="228" width="14" height="16" rx="1" fill="#FDE68A" opacity=".5" filter="url(#glow)"><animate attributeName="opacity" values=".3;.65;.3" dur="3s" repeatCount="indefinite" begin=".3s"/></rect><rect x="188" y="228" width="14" height="16" rx="1" fill="#87CEEB" opacity=".25"><animate attributeName="opacity" values=".1;.35;.1" dur="7s" repeatCount="indefinite" begin="2s"/></rect><rect x="162" y="262" width="14" height="16" rx="1" fill="#FDE68A" opacity=".4" filter="url(#glow)"><animate attributeName="opacity" values=".2;.5;.2" dur="5s" repeatCount="indefinite" begin="1.5s"/></rect><rect x="188" y="262" width="14" height="16" rx="1" fill="#FDE68A" opacity=".55" filter="url(#glow)"><animate attributeName="opacity" values=".35;.65;.35" dur="4s" repeatCount="indefinite" begin=".8s"/></rect><rect x="162" y="296" width="14" height="16" rx="1" fill="#FDE68A" opacity=".3"><animate attributeName="opacity" values=".15;.45;.15" dur="6s" repeatCount="indefinite" begin="3s"/></rect><rect x="280" y="240" width="55" height="80" rx="4" fill="#fff" opacity=".1"/><path d="M275 240 L307 200 L340 240Z" fill="#fff" opacity=".08"/><rect x="290" y="255" width="11" height="13" rx="1" fill="#FDE68A" opacity=".5" filter="url(#glow)"><animate attributeName="opacity" values=".3;.6;.3" dur="4.5s" repeatCount="indefinite" begin=".2s"/></rect><rect x="312" y="255" width="11" height="13" rx="1" fill="#FDE68A" opacity=".4" filter="url(#glow)"><animate attributeName="opacity" values=".2;.55;.2" dur="3.8s" repeatCount="indefinite" begin="1.3s"/></rect><rect x="290" y="282" width="11" height="13" rx="1" fill="#87CEEB" opacity=".25"><animate attributeName="opacity" values=".1;.3;.1" dur="5s" repeatCount="indefinite" begin="2.5s"/></rect><rect x="312" y="282" width="11" height="13" rx="1" fill="#FDE68A" opacity=".45" filter="url(#glow)"><animate attributeName="opacity" values=".25;.55;.25" dur="4s" repeatCount="indefinite" begin=".7s"/></rect><circle cx="195" cy="100" r="50" fill="none" stroke="#fff" stroke-width=".4" stroke-dasharray="4 6" opacity=".08"><animateTransform attributeName="transform" type="rotate" from="0 195 100" to="360 195 100" dur="30s" repeatCount="indefinite"/></circle></svg>`,
`<svg viewBox="0 0 390 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><radialGradient id="z3" cx="50%" cy="35%"><stop offset="0%" stop-color="#FF9F43" stop-opacity=".25"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="195" cy="160" r="200" fill="url(#z3)"/><ellipse cx="195" cy="250" rx="140" ry="42" fill="none" stroke="#fff" stroke-width="2" opacity=".25"/><ellipse cx="195" cy="250" rx="115" ry="34" fill="#fff" opacity=".05"/><ellipse cx="195" cy="242" rx="85" ry="24" fill="#fff" opacity=".03"/><path d="M130 230 Q136 160 128 90 Q124 40 134 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".15"><animate attributeName="d" values="M130 230 Q136 160 128 90 Q124 40 134 0;M130 230 Q140 155 125 82 Q120 30 138 -10;M130 230 Q136 160 128 90 Q124 40 134 0" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".06;.2;.06" dur="3s" repeatCount="indefinite"/></path><path d="M165 225 Q172 145 164 70 Q160 20 170 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".2"><animate attributeName="d" values="M165 225 Q172 145 164 70 Q160 20 170 0;M165 225 Q176 138 160 62 Q156 10 174 -10;M165 225 Q172 145 164 70 Q160 20 170 0" dur="2.5s" repeatCount="indefinite" begin=".3s"/><animate attributeName="opacity" values=".08;.25;.08" dur="2.5s" repeatCount="indefinite" begin=".3s"/></path><path d="M200 218 Q206 130 198 50 Q195 0 205 -20" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".22"><animate attributeName="d" values="M200 218 Q206 130 198 50 Q195 0 205 -20;M200 218 Q210 124 194 42 Q190 -10 210 -30;M200 218 Q206 130 198 50 Q195 0 205 -20" dur="2.8s" repeatCount="indefinite" begin=".5s"/><animate attributeName="opacity" values=".1;.3;.1" dur="2.8s" repeatCount="indefinite" begin=".5s"/></path><path d="M235 225 Q228 150 238 75 Q242 25 233 0" stroke="#fff" stroke-width="5.5" fill="none" stroke-linecap="round" opacity=".18"><animate attributeName="d" values="M235 225 Q228 150 238 75 Q242 25 233 0;M235 225 Q224 145 240 68 Q245 18 230 -10;M235 225 Q228 150 238 75 Q242 25 233 0" dur="3.2s" repeatCount="indefinite" begin=".7s"/><animate attributeName="opacity" values=".07;.22;.07" dur="3.2s" repeatCount="indefinite" begin=".7s"/></path><path d="M268 232 Q262 165 272 100 Q276 50 266 10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".12"><animate attributeName="d" values="M268 232 Q262 165 272 100 Q276 50 266 10;M268 232 Q258 160 275 92 Q280 42 263 0;M268 232 Q262 165 272 100 Q276 50 266 10" dur="3.5s" repeatCount="indefinite" begin="1s"/><animate attributeName="opacity" values=".05;.18;.05" dur="3.5s" repeatCount="indefinite" begin="1s"/></path><circle cx="50" cy="60" r="9" fill="#FF6B9D" opacity=".2"><animate attributeName="cy" values="60;30;70;35;60" dur="7s" repeatCount="indefinite"/><animate attributeName="opacity" values=".1;.3;.1" dur="3s" repeatCount="indefinite"/></circle><circle cx="350" cy="40" r="8" fill="#FFD700" opacity=".2"><animate attributeName="cy" values="40;15;45;20;40" dur="6s" repeatCount="indefinite" begin="1s"/></circle><circle cx="30" cy="160" r="7" fill="#34D399" opacity=".15"><animate attributeName="cy" values="160;135;168;140;160" dur="8s" repeatCount="indefinite" begin="2s"/></circle><circle cx="370" cy="130" r="6" fill="#C084FC" opacity=".18"><animate attributeName="cy" values="130;108;138;112;130" dur="5.5s" repeatCount="indefinite" begin="3s"/></circle><circle cx="80" cy="310" r="8" fill="#FB923C" opacity=".15"><animate attributeName="cy" values="310;288;318;292;310" dur="9s" repeatCount="indefinite" begin="1.5s"/></circle><circle cx="320" cy="320" r="7" fill="#F43F5E" opacity=".12"><animate attributeName="cy" values="320;300;328;305;320" dur="6s" repeatCount="indefinite" begin="4s"/></circle><circle cx="80" cy="340" r="35" fill="#FF9F43" opacity=".06"><animate attributeName="r" values="25;40;25" dur="5s" repeatCount="indefinite"/></circle><circle cx="330" cy="335" r="30" fill="#FF9F43" opacity=".05"><animate attributeName="r" values="20;35;20" dur="4s" repeatCount="indefinite" begin="2s"/></circle></svg>`,
`<svg viewBox="0 0 390 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><radialGradient id="z4" cx="50%" cy="42%"><stop offset="0%" stop-color="#fff" stop-opacity=".15"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><circle cx="195" cy="180" r="190" fill="url(#z4)"/><circle cx="60" cy="60" r="70" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="14 8" opacity=".18"><animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="10s" repeatCount="indefinite"/></circle><circle cx="60" cy="60" r="42" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="6 6" opacity=".12"><animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="7s" repeatCount="indefinite"/></circle><circle cx="345" cy="70" r="55" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="10 7" opacity=".14"><animateTransform attributeName="transform" type="rotate" from="360 345 70" to="0 345 70" dur="8s" repeatCount="indefinite"/></circle><ellipse cx="195" cy="265" rx="140" ry="40" fill="none" stroke="#fff" stroke-width="2" opacity=".2"/><ellipse cx="195" cy="265" rx="140" ry="40" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="14 18" opacity=".12"><animateTransform attributeName="transform" type="rotate" from="0 195 265" to="360 195 265" dur="3s" repeatCount="indefinite"/></ellipse><ellipse cx="195" cy="265" rx="100" ry="28" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 12" opacity=".1"><animateTransform attributeName="transform" type="rotate" from="360 195 265" to="0 195 265" dur="2s" repeatCount="indefinite"/></ellipse><path d="M158 265 Q162 210 168 170 Q180 135 195 125 Q210 135 222 170 Q228 210 232 265" fill="none" stroke="#fff" stroke-width="2.5" opacity=".22"/><ellipse cx="195" cy="168" rx="30" ry="10" fill="none" stroke="#fff" stroke-width="1" opacity=".12"/><circle r="9" fill="#C084FC" opacity=".35"><animateMotion dur="6s" repeatCount="indefinite" path="M195 180 Q350 60 370 180 Q350 340 195 180"/><animate attributeName="opacity" values=".15;.45;.15" dur="6s" repeatCount="indefinite"/></circle><circle r="8" fill="#FF6B9D" opacity=".3"><animateMotion dur="5s" repeatCount="indefinite" path="M195 180 Q30 310 20 180 Q30 40 195 180" begin="1.5s"/><animate attributeName="opacity" values=".12;.4;.12" dur="5s" repeatCount="indefinite" begin="1.5s"/></circle><circle r="7" fill="#FFD700" opacity=".25"><animateMotion dur="8s" repeatCount="indefinite" path="M195 180 Q310 20 380 120 Q350 350 195 180" begin="3s"/></circle><circle r="8" fill="#22D3EE" opacity=".28"><animateMotion dur="5.5s" repeatCount="indefinite" path="M195 180 Q80 20 20 130 Q50 360 195 180" begin=".8s"/></circle><circle r="6" fill="#34D399" opacity=".2"><animateMotion dur="7s" repeatCount="indefinite" path="M195 180 Q280 10 380 80 Q340 380 195 180" begin="4s"/></circle><circle r="7" fill="#FB923C" opacity=".22"><animateMotion dur="6.5s" repeatCount="indefinite" path="M195 180 Q100 360 10 280 Q20 60 195 180" begin="2.5s"/></circle></svg>`,
`<svg viewBox="0 0 390 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><linearGradient id="cg1" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#fff" stop-opacity=".12"/></linearGradient></defs><line x1="40" y1="100" x2="40" y2="350" stroke="#fff" stroke-width=".5" opacity=".15"/><line x1="40" y1="350" x2="360" y2="350" stroke="#fff" stroke-width=".5" opacity=".15"/><line x1="40" y1="200" x2="360" y2="200" stroke="#fff" stroke-width=".3" stroke-dasharray="4 6" opacity=".08"/><line x1="40" y1="275" x2="360" y2="275" stroke="#fff" stroke-width=".3" stroke-dasharray="4 6" opacity=".08"/><rect x="60" y="300" width="30" height="50" rx="4" fill="#fff" opacity=".08"><animate attributeName="height" values="30;50;30" dur="4s" repeatCount="indefinite"/><animate attributeName="y" values="320;300;320" dur="4s" repeatCount="indefinite"/></rect><rect x="110" y="270" width="30" height="80" rx="4" fill="#fff" opacity=".1"><animate attributeName="height" values="55;80;55" dur="3.5s" repeatCount="indefinite" begin=".5s"/><animate attributeName="y" values="295;270;295" dur="3.5s" repeatCount="indefinite" begin=".5s"/></rect><rect x="160" y="240" width="30" height="110" rx="4" fill="#fff" opacity=".12"><animate attributeName="height" values="80;110;80" dur="4s" repeatCount="indefinite" begin="1s"/><animate attributeName="y" values="270;240;270" dur="4s" repeatCount="indefinite" begin="1s"/></rect><rect x="210" y="210" width="30" height="140" rx="4" fill="#fff" opacity=".14"><animate attributeName="height" values="100;140;100" dur="3.8s" repeatCount="indefinite" begin="1.5s"/><animate attributeName="y" values="250;210;250" dur="3.8s" repeatCount="indefinite" begin="1.5s"/></rect><rect x="260" y="175" width="30" height="175" rx="4" fill="#fff" opacity=".16"><animate attributeName="height" values="130;175;130" dur="4.2s" repeatCount="indefinite" begin="2s"/><animate attributeName="y" values="220;175;220" dur="4.2s" repeatCount="indefinite" begin="2s"/></rect><rect x="310" y="140" width="30" height="210" rx="4" fill="#fff" opacity=".18"><animate attributeName="height" values="160;210;160" dur="3.5s" repeatCount="indefinite" begin="2.5s"/><animate attributeName="y" values="190;140;190" dur="3.5s" repeatCount="indefinite" begin="2.5s"/></rect><path d="M75 310 L125 280 L175 250 L225 225 L275 195 L325 155" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".4"><animate attributeName="opacity" values=".25;.5;.25" dur="4s" repeatCount="indefinite"/></path><circle cx="75" cy="310" r="4" fill="#fff" opacity=".4"><animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/></circle><circle cx="125" cy="280" r="4" fill="#fff" opacity=".4"><animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" begin=".4s"/></circle><circle cx="175" cy="250" r="4" fill="#fff" opacity=".4"><animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" begin=".8s"/></circle><circle cx="225" cy="225" r="5" fill="#fff" opacity=".45"><animate attributeName="r" values="3;6;3" dur="3s" repeatCount="indefinite" begin="1.2s"/></circle><circle cx="275" cy="195" r="5" fill="#fff" opacity=".45"><animate attributeName="r" values="3;6;3" dur="3s" repeatCount="indefinite" begin="1.6s"/></circle><circle cx="325" cy="155" r="6" fill="#fff" opacity=".5"><animate attributeName="r" values="4;7;4" dur="2.5s" repeatCount="indefinite" begin="2s"/></circle><text x="340" y="130" fill="#fff" font-size="14" font-weight="700" font-family="system-ui" opacity=".18" text-anchor="end"><animate attributeName="opacity" values=".1;.25;.1" dur="4s" repeatCount="indefinite"/>+22%</text><polygon points="325,155 332,138 340,148" fill="#fff" opacity=".3"><animate attributeName="opacity" values=".15;.4;.15" dur="2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="2s" repeatCount="indefinite"/></polygon></svg>`,
  ];
  const heroCards = [
    {title:"96 \u0441\u0442\u0440\u0430\u043D \u043C\u0438\u0440\u0430",sub:"\u042D\u0442\u043D\u043E\u043F\u0430\u0440\u043A \u043C\u0438\u0440\u043E\u0432\u043E\u0433\u043E \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0430. \u041F\u0430\u0432\u0438\u043B\u044C\u043E\u043D\u044B, \u044D\u0442\u043D\u043E\u0434\u0432\u043E\u0440\u044B \u0438 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u0438 \u043D\u0430 140 \u0433\u0430.",g:"linear-gradient(135deg,#F77062,#FE5196)",badge:"96 \u0421\u0422\u0420\u0410\u041D",emoji:"🌍",act:()=>onNav&&onNav("passport")},
    {title:"13 \u043E\u0442\u0435\u043B\u0435\u0439 \u0438 \u0433\u043B\u044D\u043C\u043F\u0438\u043D\u0433\u043E\u0432",sub:"\u0421\u041F\u0410, \u044D\u0442\u043D\u043E-\u043E\u0442\u0435\u043B\u0438, \u043A\u043E\u0442\u0442\u0435\u0434\u0436\u0438 \u0438 \u0433\u043B\u044D\u043C\u043F\u0438\u043D\u0433\u0438. \u041E\u0442 4 000 \u20BD/\u043D\u043E\u0447\u044C.",g:"linear-gradient(135deg,#667EEA,#764BA2)",badge:"\u0416\u0418\u041B\u042C\u0401",emoji:"🏨",act:()=>onNav&&onNav("stay")},
    {title:"18 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u043E\u0432 \u043C\u0438\u0440\u0430",sub:"\u041A\u0443\u0445\u043D\u0438 15 \u0441\u0442\u0440\u0430\u043D. \u0418\u043D\u0434\u0438\u044F, \u0413\u0440\u0443\u0437\u0438\u044F, \u042F\u043F\u043E\u043D\u0438\u044F, \u0418\u0442\u0430\u043B\u0438\u044F \u0438 \u0434\u0440\u0443\u0433\u0438\u0435.",g:"linear-gradient(135deg,#F093FB,#F5576C)",badge:"\u0420\u0415\u0421\u0422\u041E\u0420\u0410\u041D\u042B",emoji:"\ud83c\udf7d\ufe0f",act:()=>onNav&&onNav("services","food")},
    {title:"41 \u043C\u0430\u0441\u0442\u0435\u0440-\u043A\u043B\u0430\u0441\u0441",sub:"\u0413\u043E\u043D\u0447\u0430\u0440\u043D\u043E\u0435 \u0434\u0435\u043B\u043E, \u043A\u0443\u043B\u0438\u043D\u0430\u0440\u0438\u044F, \u0440\u0435\u0441\u043B\u0430\u0432. \u0414\u043B\u044F \u0434\u0435\u0442\u0435\u0439 \u0438 \u0432\u0437\u0440\u043E\u0441\u043B\u044B\u0445.",g:"linear-gradient(135deg,#F6D365,#FDA085)",badge:"\u041C\u0410\u0421\u0422\u0415\u0420-\u041A\u041B\u0410\u0421\u0421\u042B",emoji:"\ud83c\udfa8",act:()=>onNav&&onNav("tours","mk")},
    {title:"\u0418\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u0432 \u043F\u0430\u0440\u043A",sub:"\u041D\u0435\u0434\u0432\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u044C \u0441 ROI \u0434\u043E 22%. \u041E\u043A\u0443\u043F\u0430\u0435\u043C\u043E\u0441\u0442\u044C 5\u20137 \u043B\u0435\u0442.",g:"linear-gradient(135deg,#11998E,#38EF7D)",badge:"\u041D\u0415\u0414\u0412\u0418\u0416\u0418\u041C\u041E\u0421\u0422\u042C",emoji:"\ud83c\udfd7\ufe0f",act:()=>onNav&&onNav("stay","re")},
  ];
  useEffect(()=>{const t=setInterval(()=>setSlide(s=>(s+1)%heroCards.length),5000);return()=>clearInterval(t);},[]);
  useEffect(()=>{if(!viewStory)return;setStoryProgress(0);const iv=setInterval(()=>setStoryProgress(p=>{if(p>=100){setViewStory(null);return 0;}return p+2;}),100);return()=>clearInterval(iv);},[viewStory]);
  useEffect(()=>{
    Promise.all([
      sb('hotels','select=id,name,cover_image_url,price_from,rating,type,tagline&active=eq.true&order=rating.desc&limit=6'),
      sb('restaurants','select=id,name_ru,cover_emoji,cuisine_type,avg_check,cover_image_url&active=eq.true&limit=6'),
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
    {label:"\u041E\u0422\u041A\u0420\u041E\u0419\u0422\u0415 \u041F\u0410\u0420\u041A",title:"Билеты \u0438 \u044D\u043A\u0441\u043A\u0443\u0440\u0441\u0438\u0438",desc:"4 \u0442\u0438\u043F\u0430 \u0431\u0438\u043B\u0435\u0442\u043E\u0432. \u0414\u0435\u0442\u0441\u043A\u0438\u0435, \u0432\u0437\u0440\u043E\u0441\u043B\u044B\u0435, VIP \u0438 \u0433\u0440\u0443\u043F\u043F\u043E\u0432\u044B\u0435.",g:"linear-gradient(135deg,#059669,#34D399)",emoji:"\ud83c\udfab",act:()=>onBuyTicket&&onBuyTicket()},
    {label:"\u0420\u0410\u0417\u0412\u041B\u0415\u0427\u0415\u041D\u0418\u042F",title:"\u0411\u0430\u043D\u044F, \u0421\u041F\u0410 \u0438 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438",desc:"\u0420\u0443\u0441\u0441\u043A\u0430\u044F \u0431\u0430\u043D\u044F, \u0445\u0430\u043C\u043C\u0430\u043C, \u0432\u0435\u0440\u0451\u0432\u043E\u0447\u043D\u044B\u0439 \u043F\u0430\u0440\u043A, \u043B\u0430\u0437\u0435\u0440\u0442\u0430\u0433.",g:"linear-gradient(135deg,#EA580C,#F97316)",emoji:"\u2668\ufe0f",act:()=>onNav&&onNav("services","banya")},
    {label:"\u0424\u0420\u0410\u041D\u0427\u0410\u0419\u0417\u0418\u041D\u0413",title:"\u0421\u0442\u0430\u043D\u044C\u0442\u0435 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u043C",desc:"\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0441\u0432\u043E\u0439 \u042D\u0442\u043D\u043E\u043C\u0438\u0440 \u0432 \u0441\u0432\u043E\u0451\u043C \u0433\u043E\u0440\u043E\u0434\u0435. \u0418\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u043E\u0442 60 \u043C\u043B\u043D.",g:"linear-gradient(135deg,#6366F1,#A78BFA)",emoji:"🌍",act:()=>onFranchise&&onFranchise()},
  ];
  return (
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:110,background:"var(--bg)"}}>
      {/* ═══ APP STORE HEADER ═══ */}
      <div style={{paddingTop:54,padding:"54px 20px 4px"}}>
        <div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>{dateStr}</div>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px",lineHeight:1.1,marginTop:2}}>{"Этномир"}</div>
        <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:6}}>Крупнейший этнографический парк России</div>
        <div style={{display:"flex",gap:10,marginTop:12}}>
          {[{v:"140",l:"га",c:"#007AFF"},{v:"96",l:"стран",c:"#34C759"},{v:"365",l:"дней",c:"#FF9500"}].map((s,i)=>(
            <div key={i} className={"fu s"+(i+1)} style={{padding:"8px 14px",borderRadius:14,background:"rgba(255,255,255,.85)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",display:"flex",alignItems:"baseline",gap:4}}>
              <span style={{fontSize:18,fontWeight:800,color:s.c,fontFamily:FD}}>{s.v}</span>
              <span style={{fontSize:11,color:"var(--label2)",fontFamily:FT}}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes storyRing{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes weatherFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes qrScanLine{0%{top:10px;opacity:0}50%{opacity:1}100%{top:calc(100% - 10px);opacity:0}}@keyframes hF{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.05)}}@keyframes hPulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.8;transform:scale(1.2)}}@keyframes hDrift{0%{transform:translate(0,0)}25%{transform:translate(10px,-15px)}50%{transform:translate(-5px,-25px)}75%{transform:translate(-15px,-10px)}100%{transform:translate(0,0)}}@keyframes hG{0%,100%{opacity:.4}50%{opacity:1}}@keyframes hR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes tabPulse{0%{transform:scale(1.02)}40%{transform:scale(1.16)}100%{transform:scale(1.02)}}@keyframes holoRotate{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@keyframes glassShimmer{0%{box-shadow:0 0 0 1px rgba(255,255,255,0.5),0 0 8px 2px rgba(130,200,255,0.12),0 0 6px 2px rgba(255,140,220,0.08)}50%{box-shadow:0 0 0 1px rgba(255,255,255,0.5),0 0 10px 3px rgba(255,140,220,0.15),0 0 8px 3px rgba(130,200,255,0.12)}100%{box-shadow:0 0 0 1px rgba(255,255,255,0.5),0 0 8px 2px rgba(130,200,255,0.12),0 0 6px 2px rgba(255,140,220,0.08)}}@keyframes hFloat{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-12px) rotate(3deg)}66%{transform:translateY(-6px) rotate(-2deg)}}`}</style>
      {/* ═══ HERO CAROUSEL ═══ */}
      <div style={{padding:"16px 20px 0"}}
        onTouchStart={(e:any)=>{_touchX.current=e.touches[0].clientX;_touchT.current=Date.now();_swiped.current=false;}}
        onTouchEnd={(e:any)=>{const dx=e.changedTouches[0].clientX-_touchX.current;const dt=Date.now()-_touchT.current;if(Math.abs(dx)>30&&dt<500){_swiped.current=true;if(dx<0)setSlide(s=>(s+1)%heroCards.length);else setSlide(s=>(s-1+heroCards.length)%heroCards.length);}}}>
        <div className="tap" onClick={()=>{if(!_swiped.current)cur.act();}} style={{borderRadius:20,overflow:"hidden",position:"relative",height:400,background:cur.g,transition:"background .8s cubic-bezier(.2,.8,.2,1)",boxShadow:"0 8px 30px rgba(0,0,0,0.12)"}}>
          
          <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(circle at 30% 40%, white 1px, transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,.55) 100%)"}} />
          <div style={{position:"absolute",top:18,left:18,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:8,padding:"4px 10px",border:"0.5px solid rgba(255,255,255,.15)",fontSize:10,color:"rgba(255,255,255,.85)",fontWeight:700,fontFamily:FT,letterSpacing:"1.5px",textTransform:"uppercase"}}>{cur.badge}</span>
          </div>
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}} dangerouslySetInnerHTML={{__html:heroSvgs[slide%heroCards.length]||""}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 24px 24px"}}>
            <div style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-0.5px",lineHeight:1.15,marginBottom:6}}>{cur.title}</div>
            <div style={{fontSize:15,color:"rgba(255,255,255,.7)",fontFamily:FT,lineHeight:1.4,fontWeight:400}}>{cur.sub}</div>
            <div style={{display:"flex",gap:5,marginTop:16}}>
              {heroCards.map((_:any,i:number)=><div key={i} style={{width:i===slide%heroCards.length?24:6,height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:i===slide%heroCards.length?"#fff":"rgba(255,255,255,.35)",transition:"width .4s cubic-bezier(.2,.8,.2,1)"}} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STORIES ═══ */}
      {(stories||[]).length>0 && (
        <div style={{padding:'14px 0 0'}}>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'4px 20px 8px',scrollbarWidth:'none'}}>
            {stories.map((s:any)=>(
              <div key={s.id} className="tap" onClick={()=>setViewStory(s)}
                style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:5,width:72}}>
                <div style={{width:68,height:68,position:'relative'}}>
                  <svg width="68" height="68" viewBox="0 0 68 68" style={{position:'absolute',inset:0,animation:'storyRing 20s linear infinite'}}><defs><linearGradient id={'sg'+s.id} x1="0" y1="0" x2="68" y2="68"><stop offset="0%" stopColor={s.gradient_from}/><stop offset="100%" stopColor={s.gradient_to}/></linearGradient></defs><circle cx="34" cy="34" r="31" fill="none" stroke={'url(#sg'+s.id+')'} strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round"/></svg>
                  <div style={{position:'absolute',top:6,left:6,width:56,height:56,borderRadius:28,background:'linear-gradient(135deg,'+s.gradient_from+','+s.gradient_to+')',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:24,filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.15))'}}>{s.cover_emoji}</span>
                  </div>
                </div>
                <span style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textAlign:'center',lineHeight:1.2,maxWidth:68,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',fontWeight:500}}>{s.title}</span>
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
              <span style={{fontSize:14,color:'#fff'}}>{"✕"}</span>
            </div>
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 36px',textAlign:'center'}}>
            <span style={{fontSize:64,marginBottom:20,filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'}}>{viewStory.cover_emoji}</span>
            <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',lineHeight:1.2,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{viewStory.title}</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:10,lineHeight:1.5}}>{viewStory.content_text}</div>
          </div>
          <div style={{padding:'0 24px 40px'}}>
            {viewStory.link_text&&<div className="tap" onClick={(e:any)=>{e.stopPropagation();if(viewStory.link_action){try{const a=JSON.parse(viewStory.link_action);if(a.tab)onNav&&onNav(a.tab,a.sec);}catch{}}setViewStory(null);}} style={{padding:'14px',borderRadius:14,background:'rgba(255,255,255,.2)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',textAlign:'center'}}>
              <span style={{fontSize:15,fontWeight:600,color:'#fff',fontFamily:FT}}>{viewStory.link_text}</span>
            </div>}
          </div>
        </div>
      )}

      {/* ═══ PARK WEATHER — iOS 26.3.1 Pack 3 ═══ */}
      <div style={{padding:"8px 20px"}}>
        {(()=>{const h=new Date().getHours(),m=new Date().getMinutes(),mins=(h-9)*60+m,total=12*60,pct=Math.max(0,Math.min(100,Math.round(mins/total*100))),left=Math.max(0,(21-h)*60-m),lH=Math.floor(left/60),lM=left%60,tp=weather?weather.temp:12,tod=h<6?"\u041D\u043E\u0447\u044C":h<12?"\u0423\u0442\u0440\u043E":h<18?"\u0414\u0435\u043D\u044C":"\u0412\u0435\u0447\u0435\u0440",ps=h<9?"\u041F\u0430\u0440\u043A \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u0432 9:00":(h>=21?"\u041F\u0430\u0440\u043A \u0437\u0430\u043A\u0440\u044B\u0442":"\u041F\u0430\u0440\u043A \u043E\u0442\u043A\u0440\u044B\u0442"),desc=weather?weather.desc:"\u042F\u0441\u043D\u043E";return(
        <div style={{borderRadius:20,overflow:"hidden",background:"linear-gradient(180deg,#1a3a5c,#2d6a9f,#4a9fd6)",padding:20,position:"relative"}}>
          <div style={{position:"absolute",right:16,top:16,animation:"weatherFloat 4s ease-in-out infinite"}}><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="16" r="7" fill="rgba(255,255,255,.12)"/><ellipse cx="22" cy="22" rx="16" ry="9" fill="rgba(255,255,255,.15)"/><ellipse cx="30" cy="20" rx="10" ry="7" fill="rgba(255,255,255,.12)"/></svg></div>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.45)",letterSpacing:"1px",textTransform:"uppercase",fontFamily:FT}}>{"\u042D\u0442\u043D\u043E\u043C\u0438\u0440 \u00b7 "+tod}</div>
          <div style={{fontFamily:FD,fontSize:52,fontWeight:200,color:"#fff",lineHeight:1,marginTop:2}}>{tp}{"\u00b0"}</div>
          <div style={{fontSize:15,color:"rgba(255,255,255,.55)",marginTop:4,fontFamily:FT}}>{desc}</div>
          <div style={{marginTop:14,padding:"12px 14px",background:"rgba(255,255,255,.08)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:14,border:"0.5px solid rgba(255,255,255,.12)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:3,background:"#34C759"}}/><span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>{ps}</span></div><span style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT}}>{"\u0434\u043E 21:00"}</span></div>
            <div style={{position:"relative",height:6,borderRadius:3,background:"rgba(255,255,255,.1)",marginBottom:6}}><div style={{position:"absolute",left:0,height:"100%",width:pct+"%",borderRadius:3,background:"linear-gradient(90deg,#34C759,#30D158)"}}/><div style={{position:"absolute",left:pct+"%",top:-3,width:12,height:12,borderRadius:6,background:"#34C759",border:"2px solid rgba(255,255,255,.9)",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transform:"translateX(-50%)"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",fontFamily:FT}}>9:00</div><div style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{"\u041E\u0442\u043A\u0440."}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:600,color:"#34C759",fontFamily:FT}}>{h+":"+String(m).padStart(2,"0")}</div><div style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{"\u0421\u0435\u0439\u0447\u0430\u0441"}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",fontFamily:FT}}>21:00</div><div style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{"\u0417\u0430\u043A\u0440."}</div></div></div>
            {h>=9&&h<21&&<div style={{marginTop:8,padding:"6px 10px",background:"rgba(52,199,89,.1)",borderRadius:8,display:"flex",alignItems:"center",gap:6}}><svg width="12" height="12" fill="none" stroke="#34C759" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span style={{fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:FT}}>{"\u0415\u0449\u0451 "}<span style={{fontWeight:600,color:"#34C759"}}>{lH+"\u00a0\u0447 "+lM+"\u00a0\u043C\u0438\u043D"}</span></span></div>}
          </div>
        </div>);})()}
      </div>

      {/* ═══ PASSPORT BANNER ═══ */}
      <div style={{padding:"6px 20px"}}>
        <div className="tap" onClick={()=>onProfile&&onProfile()} style={{borderRadius:20,overflow:"hidden",position:"relative",height:200,background:"#8B1A1A"}}>
          <div style={{position:"absolute",inset:0,opacity:.03,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)",backgroundSize:"14px 14px"}}/>
          <div style={{position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",opacity:.12}}>
            <svg width="100" height="100" viewBox="0 0 100 100"><rect x="10" y="5" width="80" height="90" rx="6" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1.5" fillOpacity=".3"/><circle cx="50" cy="42" r="16" fill="none" stroke="#D4AF37" strokeWidth="1.5"/><text x="50" y="78" textAnchor="middle" fill="#D4AF37" fontSize="8" fontWeight="700" fontFamily="serif">Этномир</text></svg>
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 22px",zIndex:2}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(212,175,55,.6)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT}}>Паспорт</div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>Паспорт путешественника</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.55)",fontFamily:FT,marginTop:4}}>Собирайте штампы 96 стран. QR-сканер и достижения.</div>
          </div>
        </div>
      </div>

      {/* ═══ SCHEDULE ═══ */}
      <div style={{padding:"6px 20px"}}>
        <div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",overflow:"hidden"}}>
          <div className="tap" onClick={()=>onNav&&onNav("tours","schedule")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 12px"}}>
            <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.3px"}}>Расписание дня</div>
            <span style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>Все</span>
          </div>
          {((schedule||[]).length>0?schedule.slice(0,8):([{name_ru:"Загрузка...",location_ru:"",time_start:"--:--",cover_emoji:"⏳",category:"general"}] as any[])).map((ev:any,i:number)=>{const ts=String(ev.time_start||"").slice(0,5);const h=new Date().getHours();const m=new Date().getMinutes();const evH=parseInt(ts);const isLive=evH===h||(evH===h-1&&m<30);return(
            <div key={i} className="tap" onClick={()=>onNav&&onNav("tours","schedule")} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"11px 20px",borderTop:"0.5px solid var(--sep)"}}>
              <div style={{width:44,paddingTop:1,flexShrink:0}}>
                <div style={{fontSize:15,fontWeight:600,color:isLive?"#34C759":"var(--label)",fontFamily:FT,letterSpacing:"-.2px"}}>{ts}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:16}}>{ev.cover_emoji}</span>
                  <span style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,letterSpacing:"-.1px"}}>{ev.name_ru}</span>
                  {isLive&&<span style={{fontSize:9,fontWeight:700,color:"#34C759",fontFamily:FT,background:"rgba(52,199,89,.12)",padding:"2px 8px",borderRadius:6,letterSpacing:".5px",animation:"pulse 2s infinite"}}>СЕЙЧАС</span>}
                </div>
                <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{ev.location_ru}</div>
              </div>
              {ev.price>0&&<div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}><span style={{fontSize:13,fontWeight:600,color:"var(--orange)",fontFamily:FD}}>{ev.price} ₽</span><div className="tap" onClick={(e:any)=>{e.stopPropagation();if(cart&&setCart){const nc=addToCart(cart,setCart,{cat:"event",itemId:ev.id,name:ev.name_ru,emoji:ev.cover_emoji||"🎫",qty:1,price:ev.price});syncCartToDB(nc,userId);showCartToast&&showCartToast(ev.name_ru);}}} style={{width:26,height:26,borderRadius:13,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg></div></div>}
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{marginTop:4,flexShrink:0}}><path d="M1 1l5 5-5 5" stroke="var(--label4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          );})}
          <div style={{padding:"12px 20px 16px",borderTop:"0.5px solid var(--sep)"}}>
            <div className="tap" onClick={()=>onNav&&onNav("tours","schedule")} style={{display:"flex",alignItems:"center",justifyContent:"center",height:44,borderRadius:12,background:"var(--fill4)"}}>
              <span style={{fontSize:15,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>Полное расписание</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TICKETS BANNER ═══ */}
      <div style={{padding:"6px 20px"}}>
        <div className="tap" onClick={()=>onBuyTicket&&onBuyTicket()} style={{borderRadius:20,overflow:"hidden",position:"relative",height:200,background:"#059669"}}>
          <AmbientFX c1="rgba(52,211,153,.5)" c2="rgba(16,185,129,.4)" c3="rgba(255,255,255,.1)" d={-4}/>
          
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 22px",zIndex:2}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT}}>Билеты</div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>Билеты и экскурсии</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4}}>Детские, взрослые, VIP и групповые. Онлайн-бронирование.</div>
          </div>
        </div>
      </div>

      {/* ═══ HOTELS COLLECTION ═══ */}
      {hotels.length>0&&(
        <div style={{padding:"16px 0 0"}}>
          <div style={{padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.3px"}}>{"\u0413\u0434\u0435 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C\u0441\u044F"}</div>
            <div className="tap" onClick={()=>onNav&&onNav("stay")} style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>{"Все"}</div>
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
            <div className="tap" onClick={()=>onNav&&onNav("services","food")} style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>{"Все"}</div>
          </div>
          <div style={{display:"flex",gap:12,overflowX:"auto",padding:"12px 20px 4px",scrollbarWidth:"none"}}>
            {rests.map((r:any)=>(
              <div key={r.id} className="tap" onClick={()=>onNav&&onNav("services","food")} style={{flexShrink:0,width:160,borderRadius:16,overflow:"hidden",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
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


      {/* ═══ DISCOVER ═══ */}
      <div style={{padding:"12px 20px 0",display:"flex",flexDirection:"column",gap:12}}>
        <div className="tap" onClick={()=>onNav&&onNav("tours","events")} style={{borderRadius:20,height:200,overflow:"hidden",position:"relative",background:"#FF2D55"}}>
          <AmbientFX c1="rgba(255,149,0,.5)" c2="rgba(175,82,222,.4)" c3="rgba(255,107,138,.5)" d={0}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 22px",zIndex:2}}><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:5}}>События</div><div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,lineHeight:1.2,letterSpacing:"-.3px"}}>Мероприятия и праздники</div><div style={{fontSize:14,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:5}}>Фестивали, концерты, тематические выходные</div></div>
        </div>
        <div className="tap" onClick={()=>onNav&&onNav("tours","excursions")} style={{borderRadius:20,height:200,overflow:"hidden",position:"relative",background:"#5856D6"}}>
          <AmbientFX c1="rgba(90,200,250,.4)" c2="rgba(175,82,222,.4)" c3="rgba(0,122,255,.4)" d={-2}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 22px",zIndex:2}}><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:5}}>Экскурсии</div><div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,lineHeight:1.2,letterSpacing:"-.3px"}}>Гиды по парку</div><div style={{fontSize:14,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:5}}>Индивидуальные и групповые</div></div>
        </div>
        <div className="tap" onClick={()=>onNav&&onNav("services","banya")} style={{borderRadius:20,height:200,overflow:"hidden",position:"relative",background:"#C4956A"}}>
          <AmbientFX c1="rgba(255,159,10,.5)" c2="rgba(255,214,10,.3)" c3="rgba(212,165,116,.5)" d={-4}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 22px",zIndex:2}}><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:5}}>Здоровье</div><div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,lineHeight:1.2,letterSpacing:"-.3px"}}>Бани и СПА</div><div style={{fontSize:14,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:5}}>Русская баня, хаммам, сауна</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="tap" onClick={()=>onNav&&onNav("tours","museums")} style={{borderRadius:20,height:150,overflow:"hidden",position:"relative",background:"#AF52DE"}}><AmbientFX c1="rgba(191,90,242,.5)" c2="rgba(88,86,214,.4)" c3="rgba(255,255,255,.1)" d={-1}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px",zIndex:2}}><div style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FD}}>Музеи</div><div style={{fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:3}}>15 экспозиций</div></div></div>
          <div className="tap" onClick={()=>onNav&&onNav("tours","b2b")} style={{borderRadius:20,height:150,overflow:"hidden",position:"relative",background:"#007AFF"}}><AmbientFX c1="rgba(90,200,250,.4)" c2="rgba(52,199,89,.3)" c3="rgba(255,255,255,.1)" d={-3}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px",zIndex:2}}><div style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FD}}>Группы</div><div style={{fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:3}}>Детские, корп.</div></div></div>
          <div className="tap" onClick={()=>onNav&&onNav("services","fun")} style={{borderRadius:20,height:150,overflow:"hidden",position:"relative",background:"#FF3B30"}}><AmbientFX c1="rgba(255,149,0,.4)" c2="rgba(255,107,138,.4)" c3="rgba(255,255,255,.1)" d={-5}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px",zIndex:2}}><div style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FD}}>Развлечения</div><div style={{fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:3}}>Активный отдых</div></div></div>
          <div className="tap" onClick={()=>onNav&&onNav("services","food")} style={{borderRadius:20,height:150,overflow:"hidden",position:"relative",background:"#FF9500"}}><AmbientFX c1="rgba(255,214,10,.4)" c2="rgba(255,59,48,.3)" c3="rgba(255,255,255,.1)" d={-2}/><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px",zIndex:2}}><div style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FD}}>Доставка</div><div style={{fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:3}}>Еда в номер</div></div></div>
        </div>
      </div>

      {/* ═══ EVENTS CALENDAR — iOS 26.3.1 ═══ */}
      {(parkEvents||[]).length>0&&<div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:FD,fontSize:22,fontWeight:700,letterSpacing:"-.2px",color:"var(--label)"}}>Ближайшие события</div>
          <div className="tap" onClick={()=>onNav&&onNav("tours","calendar")} style={{fontSize:13,fontWeight:500,color:"#007AFF",fontFamily:FT}}>Календарь года</div>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:16,overflow:"hidden"}}>
          {parkEvents.slice(0,3).map((ev:any,i:number)=>{
            const d=new Date(ev.date_start);
            const months=["ЯНВ","ФЕВ","МАР","АПР","МАЙ","ИЮН","ИЮЛ","АВГ","СЕН","ОКТ","НОЯ","ДЕК"];
            const colors=["#FF375F","#007AFF","#5856D6","#FF9500","#34C759","#AF52DE"];
            const cl=colors[i%colors.length];
            return <div key={i} className="tap" onClick={()=>onNav&&onNav("tours","calendar")} style={{display:"flex",alignItems:"center",padding:"14px 16px",gap:14,borderBottom:i<Math.min(parkEvents.length,3)-1?"0.5px solid var(--sep-opaque)":"none"}}>
              <div style={{width:48,height:48,borderRadius:12,background:cl+"0F",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{fontFamily:FD,fontSize:20,fontWeight:700,color:cl,lineHeight:1}}>{d.getDate()}</div>
                <div style={{fontSize:10,fontWeight:600,color:cl,fontFamily:FT,opacity:.7,marginTop:1}}>{months[d.getMonth()]}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{ev.name_ru}</div>
                <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:2,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",lineHeight:1.4}}>{ev.description_ru||""}</div>
              </div>
              {ev.is_featured&&<div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",height:20,padding:"0 8px",borderRadius:6,background:"rgba(255,149,0,.08)",flexShrink:0}}><span style={{fontSize:10,fontWeight:600,color:"#FF9500",lineHeight:1,fontFamily:FT}}>ТОП</span></div>}
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{flexShrink:0,opacity:.2}}><path d="M1 1l5 5-5 5" stroke="var(--label)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>;
          })}
        </div>
      </div>}

      {/* ═══ HERITAGE ═══ */}
      <div style={{padding:"10px 20px 0"}}>
        <div className="tap" onClick={()=>onNav&&onNav("passport","heritage")} style={{borderRadius:20,height:200,overflow:"hidden",position:"relative",background:"#11998e"}}>
          <AmbientFX c1="rgba(56,239,125,.4)" c2="rgba(52,199,89,.3)" c3="rgba(255,255,255,.1)" d={-3}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 22px",zIndex:2}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:5}}>Культура</div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>Наследие Этномира</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4}}>История, культура и философия парка с 2007 года.</div>
          </div>
        </div>
      </div>

      {/* ═══ MAP BUTTON ═══ */}
      <div style={{padding:"8px 20px 0"}}>
        <div className="tap card-ios" onClick={()=>{sb("map_pois","select=*&is_active=eq.true&order=sort_order.asc").then(d=>setMapPois(d||[]));setShowParkMap(true);}} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#34C759,#30D158)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🗺️</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FD}}>Карта парка</div><div style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>15+ объектов · маршруты</div></div>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="var(--label3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>

      {/* ═══ QUICK ICONS ═══ */}
      <div style={{padding:"10px 20px 0",display:"flex",gap:10,justifyContent:"space-between"}}>
        {[{e:"🛍️",l:"Магазины",s:"services",sub:"shops"},{e:"🚲",l:"Прокат",s:"services",sub:"rental"},{e:"🛎️",l:"В номер",s:"stay",sub:"guest"}].map((q,i)=>(
          <div key={i} className="tap" onClick={()=>onNav&&onNav(q.s as any,q.sub)} style={{flex:1,padding:"14px 6px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",textAlign:"center"}}>
            <div style={{fontSize:28}}>{q.e}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT,marginTop:6}}>{q.l}</div>
          </div>
        ))}
      </div>

      {/* ═══ REAL ESTATE ═══ */}
      <div style={{padding:"10px 20px 0"}}>
        <div className="tap" onClick={()=>onNav&&onNav("stay","realestate")} style={{borderRadius:20,height:200,overflow:"hidden",position:"relative",background:"#56ab2f"}}>
          <AmbientFX c1="rgba(168,224,99,.4)" c2="rgba(255,214,10,.3)" c3="rgba(255,255,255,.1)" d={-1}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"20px 22px",zIndex:2}}>
            <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:5}}>Недвижимость</div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>Доходная недвижимость</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4}}>ROI до 22%. Окупаемость 5-7 лет. От 3,9 млн ₽.</div>
          </div>
        </div>
      </div>


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
function ToursTab({onSearch,onBuyTicket,onProfile,pendingSec,onClearPending,favorites,toggleFav,cart,setCart,userId,onCalendar}:{onSearch?:()=>void,onBuyTicket?:()=>void,onProfile?:()=>void,onCalendar?:()=>void,pendingSec?:string,onClearPending?:()=>void,favorites?:Set<string>,toggleFav?:(id:string,name?:string,emoji?:string)=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void}) {
  const [sec, setSec] = useState("tours");
  useEffect(()=>{if(pendingSec){if(pendingSec==="calendar"&&onCalendar){onCalendar();onClearPending&&onClearPending();return;}setSec(pendingSec);onClearPending&&onClearPending();setTimeout(()=>{const el=document.getElementById("pill-"+pendingSec);if(el)el.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});},100);}},[pendingSec]);
  const [tours, setTours] = useState<any[]>([]);
  const [mk, setMk] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [detailType, setDetailType] = useState("");
  const [persons, setPersons] = useState(2);
  const [booked, setBooked] = useState(false);
  
  const [checkIn, setCheckIn] = useState(new Date(Date.now()+86400000).toISOString().slice(0,10));
  const [checkOut, setCheckOut] = useState(new Date(Date.now()+3*86400000).toISOString().slice(0,10));
  const [children, setChildren] = useState(0);
  const [showCal, setShowCal] = useState<"in"|"out"|null>(null);
  const calcNights=Math.max(1,Math.round((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000));
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
    const isTour = detailType==="tour";const isB2b = detailType==="b2b";
    const isMk = detailType==="mk";
    const color = isTour?(TC[detail.type]||"#555"):isMk?"#AF52DE":"#FF9500";
    const dur = isTour?(detail.duration_minutes>=1440?Math.floor(detail.duration_minutes/1440)+" дн.":detail.duration_minutes>=60?Math.floor(detail.duration_minutes/60)+" ч.":detail.duration_minutes+" мин."):isMk?detail.duration_min+" мин.":"";
    const price = isTour?detail.price:isMk?detail.price:detail.price||0;
    const maxP = isTour?detail.max_participants:isMk?detail.max_persons:null;

    if(isB2b) return (
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:110,background:"var(--bg)"}}>
        <div style={{position:"relative",height:200,background:"linear-gradient(135deg,#007AFF,#5856D6)",display:"flex",alignItems:"flex-end",padding:20}}>
          <div style={{position:"absolute",right:20,top:20,fontSize:64,opacity:.15}}>{detail.cover_emoji}</div>
          <div className="tap" onClick={()=>setDetail(null)} style={{position:"absolute",left:16,top:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18,color:"#fff",fontWeight:300}}>‹</span></div>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT}}>Программа для групп</div>
            <div style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>{detail.title}</div>
          </div>
        </div>
        <div style={{padding:"20px"}}>
          <div style={{fontSize:15,color:"var(--label2)",fontFamily:FT,lineHeight:1.6,marginBottom:20}}>{detail.description_ru}</div>
          {(detail.tags||[]).length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>{(detail.tags||[]).map((t:string,k:number)=>(<span key={k} style={{padding:"6px 14px",borderRadius:20,background:"rgba(0,122,255,.08)",fontSize:13,fontWeight:500,color:"#007AFF",fontFamily:FT}}>{t}</span>))}</div>}
          {(detail.features||detail.included||[]).length>0&&<div style={{marginBottom:20}}><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:10}}>Что включено</div>{(detail.features||detail.included||[]).map((f:string,k:number)=>(<div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:k<(detail.features||detail.included||[]).length-1?"0.5px solid var(--sep-opaque)":"none"}}><span style={{color:"#34C759",fontSize:16,fontWeight:700}}>✓</span><span style={{fontSize:14,color:"var(--label)",fontFamily:FT}}>{f}</span></div>))}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>{[{n:"от 10 чел.",l:"Группа",ic:"👥"},{n:"от 2 часов",l:"Длительность",ic:"⏱️"},{n:"индивид.",l:"Программа",ic:"📋"},{n:"менеджер",l:"Поддержка",ic:"🤝"}].map((s,i)=>(<div key={i} style={{padding:"12px",borderRadius:14,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>{s.ic}</div><div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{s.n}</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>{s.l}</div></div>))}</div>
          <div style={{marginBottom:20,padding:16,borderRadius:16,background:"rgba(0,122,255,.05)",border:"0.5px solid rgba(0,122,255,.12)"}}>
            <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:12}}>Оставьте заявку</div>
            <input id="b2b-name" placeholder="Ваше имя" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:8,boxSizing:"border-box"}}/>
            <input id="b2b-phone" placeholder="Телефон" type="tel" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:8,boxSizing:"border-box"}}/>
            <input id="b2b-size" placeholder="Кол-во человек в группе" type="number" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:8,boxSizing:"border-box"}}/>
            <textarea id="b2b-msg" placeholder="Пожелания и комментарии" rows={3} style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:4,boxSizing:"border-box",resize:"vertical"}}/>
          </div>
          <div className="tap" onClick={async()=>{const n=(document.getElementById("b2b-name") as any)?.value||"";const p=(document.getElementById("b2b-phone") as any)?.value||"";const sz=(document.getElementById("b2b-size") as any)?.value||"";const msg=(document.getElementById("b2b-msg") as any)?.value||"";if(!p){alert("Укажите телефон");return;}await submitContactRequest("b2b",detail.title||"B2B",n,p,"Группа: "+sz+" чел. "+msg);alert("Заявка отправлена! Менеджер свяжется с вами.");}} style={{borderRadius:14,background:"#007AFF",height:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>Отправить заявку</span>
          </div>
          {/* ═══ LANDING SECTIONS ═══ */}
          {(detail.landing_sections||[]).map((s:any,idx:number)=>{
            const ac="#007AFF";
            if(s.type==="stats") return <div key={idx} style={{marginTop:24,padding:"20px 0"}}>
              {s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}
              {s.title&&<div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>{s.title}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{(s.items||[]).map((it:any,k:number)=>(<div key={k} style={{padding:"14px",borderRadius:16,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:it[2]||ac,fontFamily:FD}}>{it[0]}</div><div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{it[1]}</div></div>))}</div>
            </div>;
            if(s.type==="feature") return <div key={idx} style={{marginTop:24}}>
              {s.image&&<div style={{height:180,borderRadius:16,overflow:"hidden",marginBottom:14}}><img src={s.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
              {s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}
              <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:8}}>{s.title}</div>
              <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.6}}>{s.body}</div>
            </div>;
            if(s.type==="products") return <div key={idx} style={{marginTop:24}}>
              {s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}
              {s.title&&<div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:12}}>{s.title}</div>}
              <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>{(s.items||[]).map((p:any,k:number)=>(<div key={k} style={{flexShrink:0,width:140,borderRadius:14,overflow:"hidden",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)"}}>{p.image&&<div style={{height:80}}><img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}<div style={{padding:"8px 10px"}}><div style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{p.name}</div><div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{p.caption}</div>{p.price&&<div style={{fontSize:12,fontWeight:700,color:ac,fontFamily:FD,marginTop:4}}>от {p.price} ₽</div>}</div></div>))}</div>
            </div>;
            if(s.type==="quote") return <div key={idx} style={{marginTop:24,padding:"16px",borderRadius:16,background:"var(--fill4)",borderLeft:"3px solid "+ac}}>
              <div style={{fontSize:14,color:"var(--label)",fontFamily:FT,lineHeight:1.6,fontStyle:"italic"}}>«{s.text}»</div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:8}}>— {s.author}</div>
            </div>;
            if(s.type==="cards") return <div key={idx} style={{marginTop:24}}>
              {s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}
              {s.title&&<div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:12}}>{s.title}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{(s.items||[]).map((c:any,k:number)=>(<div key={k} style={{padding:"14px",borderRadius:16,background:c[3]||"var(--fill4)"}}><div style={{fontSize:24,marginBottom:6}}>{c[0]}</div><div style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>{c[1]}</div><div style={{fontSize:11,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4,lineHeight:1.4}}>{c[2]}</div></div>))}</div>
            </div>;
            if(s.type==="text") return <div key={idx} style={{marginTop:24}}>
              {s.title&&<div style={{fontSize:16,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:8}}>{s.title}</div>}
              <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.6}}>{s.content}</div>
            </div>;
            return null;
          })}
        </div>
      </div>
    );
    return (
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:110,background:"var(--bg)"}}>
        {/* Hero */}
        <div style={{position:"relative",height:220,background:"linear-gradient(145deg,"+color+"cc,"+color+"88)"}}>
          <div style={{position:"absolute",right:10,top:"40%",transform:"translateY(-50%)",fontSize:96,opacity:.15}}>{detail.cover_emoji}</div>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,.45) 100%)"}}/>
          <div className="tap" onClick={()=>setDetail(null)} style={{position:"absolute",top:54,left:16,zIndex:20,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.4)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
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

          {showBooking && <BookingModal item={detail} type={detailType} total={price*persons} guests={persons} onClose={()=>setShowBooking(false)} cart={cart||[]} setCart={setCart} userId={userId}/>}

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
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:110,background:"var(--bg)"}}>
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
          {[["tickets","🎫","Билеты"],["tours","🌟","Туры"],["mk","🎓","Мастер-классы"],["events","🎉","События"],["excursions","🗺️","Экскурсии"],["museums","🏛️","Музеи"],["schedule","📋","Расписание"],["certificates","🎁","Сертификаты"],["b2b","🤝","Для групп"],["calendar","📅","Календарь"]].map(([id,ic,label])=>(
            <div key={id} className="tap" id={"pill-"+id} onClick={()=>{if(id==="tickets"&&onBuyTicket){onBuyTicket();return;}if(id==="calendar"&&onCalendar){onCalendar();return;}setSec(id);setTimeout(()=>{const pe=document.getElementById("pill-"+id);if(pe)pe.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});},50);}}
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
          {tours.map((t:any,i:number)=>{
            const tc=["#007AFF","#5856D6","#FF9500","#34C759","#FF3B30"][i%5];
            return <div key={t.id} className="tap fu" style={{borderRadius:20,overflow:"hidden",marginBottom:14,background:"var(--bg2)",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              {/* Top colored strip */}
              <div style={{background:"linear-gradient(135deg,"+tc+","+tc+"cc)",padding:"16px 18px 14px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",right:-20,top:-10,fontSize:80,opacity:.08,transform:"rotate(-15deg)"}}>✈</div>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT}}>Посадочный талон</div>
                <div style={{fontSize:19,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>{t.name_ru||t.name}</div>
              </div>
              {/* Perforated edge */}
              <div style={{display:"flex",alignItems:"center",margin:"0 12px"}}><div style={{flex:1,borderTop:"2px dashed var(--sep-opaque)"}}/></div>
              {/* Ticket body */}
              <div style={{padding:"12px 18px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:16,marginBottom:8}}>
                    <div><div style={{fontSize:9,fontWeight:700,color:"var(--label3)",letterSpacing:.5,textTransform:"uppercase",fontFamily:FT}}>Откуда</div><div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FD}}>МОСКВА</div></div>
                    <div style={{fontSize:16,color:"var(--label3)",alignSelf:"center"}}>→</div>
                    <div><div style={{fontSize:9,fontWeight:700,color:"var(--label3)",letterSpacing:.5,textTransform:"uppercase",fontFamily:FT}}>Куда</div><div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FD}}>ЭТНОМИР</div></div>
                  </div>
                  <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,lineHeight:1.4}}>{t.description_ru||"Входной билет в парк"}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:16}}>
                  <div style={{fontSize:24,fontWeight:800,color:tc,fontFamily:FD}}>{t.price||990} ₽</div>
                  <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:2}}>+{t.points||30} очков</div>
                </div>
              </div>
              {/* Buy button */}
              <div style={{padding:"0 18px 16px"}}>
                <div className="tap" style={{borderRadius:14,background:tc,height:48,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>Купить билет</span>
                </div>
              </div>
            </div>;
          })}
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
            const catEmoji=s.category==="excursion"?"🗺️":s.category==="masterclass"?"🎨":s.category==="sport"?"⚽":s.category==="yoga"?"🧘":s.category==="quest"?"🧩":s.cover_emoji||"📌";
            return (
            <div key={s.id||i} className={"tap fu s"+(Math.min(i+1,8))} style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",padding:"14px 16px",marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:52,textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:20,marginBottom:2}}>{catEmoji}</div>
                <div style={{fontSize:13,fontWeight:700,color:live?"#34C759":"var(--label)",fontFamily:FD,letterSpacing:"-.3px"}}>{(s.time_start||"10:00").slice(0,5)}</div>
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{(s.time_end||"").slice(0,5)}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <div style={{fontSize:16,fontWeight:600,color:"var(--label)",fontFamily:FT,flex:1}}>{s.title_ru||s.name_ru||"Мероприятие"}</div>
                  {live && <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:"rgba(52,199,89,.1)"}}><div style={{width:6,height:6,borderRadius:3,background:"#34C759",animation:"pulse 2s infinite"}}/><span style={{fontSize:11,fontWeight:600,color:"#34C759",fontFamily:FT}}>Сейчас</span></div>}
                </div>
                <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT}}>{s.location_ru||s.description_ru||""}</div>
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

      {sec==='certificates' && (
        <div style={{padding:"0 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Подарите незабываемый отдых в крупнейшем этнографическом парке России</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{n:1000,d:"Мастер-класс на 1 чел.",c:"#FF6B9D"},{n:3000,d:"Билет + МК + обед",c:"#007AFF"},{n:5000,d:"Выходные на двоих",c:"#34C759"},{n:10000,d:"Отдых с проживанием",c:"#FF9F0A"}].map(c=>(
              <div key={c.n} className="tap" onClick={()=>{if(cart&&setCart){addToCart(cart,setCart,{cat:"certificate",itemId:"cert_"+c.n,name:"Сертификат "+c.n.toLocaleString("ru")+" P",emoji:"🎁",qty:1,price:c.n});syncCartToDB(cart,userId);showCartToast&&showCartToast("Сертификат добавлен");}}} style={{borderRadius:20,padding:"20px 16px",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",textAlign:"center"}}>
                <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,"+c.c+","+c.c+"80)",margin:"0 auto 10px",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28}}>🎁</span></div>
                <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{c.n.toLocaleString("ru")} ₽</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:4}}>{c.d}</div>
                <div style={{marginTop:10,padding:"8px",borderRadius:10,background:"var(--fill4)"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>В корзину</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:20,padding:"16px",borderRadius:16,background:"rgba(0,122,255,.05)",border:"0.5px solid rgba(0,122,255,.12)"}}>
            <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Как это работает</div>
            <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:6,lineHeight:1.5}}>1. Выберите номинал и добавьте в корзину • 2. Оформите заказ и оплатите • 3. Получите уникальный код сертификата • 4. Подарите код получателю</div>
          </div>
          <div style={{marginTop:16,padding:"14px 16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>📅</span><div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Срок действия — 1 год</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>Можно использовать на любые услуги парка</div></div></div>
          </div>
        </div>
      )}

      {sec==='b2b' && (
        <div style={{padding:"0 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Для групп</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Программы для организованных групп</div>
          {b2bPrograms.map((p:any,j:number)=>{const item={icon:p.cover_emoji,t:p.title,d:p.description_ru,tags:p.tags||[]};return (
            <div key={j} className="tap fu" onClick={()=>openDetail(p,"b2b")} style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",padding:16,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{width:44,height:44,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22}}>{item.icon}</span></div>
                <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{item.t}</div>
              </div>
              <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{item.d}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {item.tags.map((tag:string,k:number)=>(<span key={k} style={{padding:"4px 10px",borderRadius:30,background:"var(--fill4)",fontSize:12,color:"var(--label2)",fontFamily:FT}}>{tag}</span>))}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:13,color:"var(--blue)",fontWeight:600,fontFamily:FT}}>Подробнее</span><svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
            </div>
          );})}
        </div>
      )}

    </div>
  );
}

// ─── CalendarPicker ───────────────────────────────────────
function CalendarPicker({checkIn,checkOut,showCal,setShowCal,setCheckIn,setCheckOut}:{checkIn:string,checkOut:string,showCal:"in"|"out"|null,setShowCal:(v:"in"|"out"|null)=>void,setCheckIn:(v:string)=>void,setCheckOut:(v:string)=>void}) {
  const [cm,setCm]=useState(new Date(showCal==="out"?checkOut:checkIn).getMonth());
  const [cy,setCy]=useState(new Date(showCal==="out"?checkOut:checkIn).getFullYear());
  const fd=new Date(cy,cm,1);const sd=(fd.getDay()+6)%7;const dm=new Date(cy,cm+1,0).getDate();
  const mn=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  const wd=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  const blanks=Array.from({length:sd},(_,i)=>({k:"b"+i,d:0}));
  const days=Array.from({length:dm},(_,i)=>({k:"d"+(i+1),d:i+1}));
  const cells=[...blanks,...days];
  const todayStr=new Date().toISOString().slice(0,10);
  const pick=(d:number)=>{
    const iso=cy+"-"+String(cm+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
    if(showCal==="in"){setCheckIn(iso);if(iso>=checkOut)setCheckOut(new Date(new Date(iso).getTime()+86400000).toISOString().slice(0,10));setShowCal("out");}
    else{if(iso<=checkIn)return;setCheckOut(iso);setShowCal(null);}
  };
  const pM=()=>{if(cm===0){setCy(cy-1);setCm(11);}else setCm(cm-1);};
  const nM=()=>{if(cm===11){setCy(cy+1);setCm(0);}else setCm(cm+1);};
  const nts=Math.max(1,Math.round((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000));
  return(
    <div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:16,marginTop:10,marginBottom:10,boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="tap" onClick={pM} style={{width:36,height:36,borderRadius:18,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="var(--label)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{mn[cm]} {cy}</div>
        <div className="tap" onClick={nM} style={{width:36,height:36,borderRadius:18,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="var(--label)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}}>
        {wd.map(w=><div key={w} style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,padding:"6px 0"}}>{w}</div>)}
        {cells.map(c=>{if(c.d===0)return <div key={c.k}/>;
          const iso=cy+"-"+String(cm+1).padStart(2,"0")+"-"+String(c.d).padStart(2,"0");
          const past=iso<todayStr;const isCI=iso===checkIn;const isCO=iso===checkOut;
          const inR=iso>checkIn&&iso<checkOut;
          return <div key={c.k} className={past?"":"tap"} onClick={()=>{if(!past)pick(c.d)}} style={{width:40,height:40,borderRadius:isCI||isCO?20:inR?8:20,background:isCI?"#007AFF":isCO?"#34C759":inR?"rgba(0,122,255,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s cubic-bezier(0.2,0.8,0.2,1)"}}>
            <span style={{fontSize:16,fontWeight:isCI||isCO?700:400,color:past?"var(--label4)":isCI||isCO?"#fff":"var(--label)",fontFamily:FT}}>{c.d}</span></div>})}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:14,fontSize:13,fontFamily:FT}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:5,background:"#007AFF"}}/><span style={{color:"var(--label2)"}}>Заезд</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:5,background:"#34C759"}}/><span style={{color:"var(--label2)"}}>Выезд</span></div>
        <span style={{color:"var(--label3)"}}>{nts} ноч.</span>
      </div>
    </div>
  );
}

// ─── STAY ─────────────────────────────────────────────────
function StayTab({onSearch,favorites,toggleFav,onProfile,pendingSec,onClearPending,cart,setCart,userId}:{onSearch?:()=>void,favorites?:Set<string>,toggleFav?:(id:string)=>void,onProfile?:()=>void,onCalendar?:()=>void,pendingSec?:string,onClearPending?:()=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void,onCalendar?:()=>void}) {
  const [view, setView] = useState('hotels');
  const [detailSheet, setDetailSheet] = useState<any>(null);
  const [galIdx, setGalIdx] = useState(0);
  useEffect(()=>{setGalIdx(0);},[detailSheet]);useEffect(()=>{const tb=document.querySelector('.em-tabbar');if(tb)tb.style.display=detailSheet?'none':'';return()=>{const tb=document.querySelector('.em-tabbar');if(tb)tb.style.display='';};},[detailSheet]);
  useEffect(()=>{if(detailSheet)document.body.classList.add('ds-open');else document.body.classList.remove('ds-open');return()=>document.body.classList.remove('ds-open');},[detailSheet]);
  useEffect(()=>{if(pendingSec){setView(pendingSec);onClearPending&&onClearPending();setTimeout(()=>{const el=document.getElementById("pill-"+pendingSec);if(el)el.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});},100);}},[pendingSec]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [re, setRe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [guestSvcs, setGuestSvcs] = useState<any[]>([]);
  const [booked, setBooked] = useState(false);
  
  const [checkIn, setCheckIn] = useState(new Date(Date.now()+86400000).toISOString().slice(0,10));
  const [checkOut, setCheckOut] = useState(new Date(Date.now()+3*86400000).toISOString().slice(0,10));
  const [children, setChildren] = useState(0);
  const [showCal, setShowCal] = useState<"in"|"out"|null>(null);
  const calcNights=Math.max(1,Math.round((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000));
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
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',paddingBottom:110,background:'var(--bg)',maxWidth:'100%'}}>
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
        <div style={{padding:"0",paddingBottom:110}}>
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
              {allImgs.length>1&&allImgs.length<=10&&<div style={{position:"absolute",bottom:44,left:0,right:0,display:"flex",justifyContent:"center",gap:5,zIndex:5}}>{allImgs.map((_:any,i:number)=>(<div key={i} style={{width:i===galIdx?18:6,height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:i===galIdx?"#fff":"rgba(255,255,255,.45)",transition:"all .3s ease"}}/>))}</div>}
              {/* Back button */}
              <div className="tap" onClick={()=>{setSelectedHotel(null);setGalIdx(0);}}
                style={{position:"absolute",top:54,left:16,zIndex:20,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.4)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
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
              {/* Date selectors */}
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div className="tap" onClick={()=>setShowCal(showCal==="in"?null:"in")} style={{flex:1,padding:"10px 14px",borderRadius:12,background:showCal==="in"?"rgba(0,122,255,0.08)":"var(--fill4)",border:showCal==="in"?"2px solid #007AFF":"2px solid transparent"}}>
                  <div style={{fontSize:10,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Заезд</div>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{new Date(checkIn).toLocaleDateString("ru",{day:"numeric",month:"short"})}</div>
                </div>
                <div className="tap" onClick={()=>setShowCal(showCal==="out"?null:"out")} style={{flex:1,padding:"10px 14px",borderRadius:12,background:showCal==="out"?"rgba(52,199,89,0.08)":"var(--fill4)",border:showCal==="out"?"2px solid #34C759":"2px solid transparent"}}>
                  <div style={{fontSize:10,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Выезд</div>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{new Date(checkOut).toLocaleDateString("ru",{day:"numeric",month:"short"})}</div>
                </div>
              </div>
              {showCal&&selectedHotel&&<CalendarPicker checkIn={checkIn} checkOut={checkOut} showCal={showCal} setShowCal={setShowCal} setCheckIn={setCheckIn} setCheckOut={setCheckOut}/>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"10px 14px",borderRadius:12,background:"rgba(0,122,255,0.06)"}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{calcNights} {calcNights===1?"ночь":calcNights<5?"ночи":"ночей"}</div>
                <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{new Date(checkIn).toLocaleDateString("ru",{day:"numeric",month:"short"})} → {new Date(checkOut).toLocaleDateString("ru",{day:"numeric",month:"short"})}</div>
              </div>
              {/* Guests selector */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:"0.5px solid var(--sep)"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Взрослые</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>1–6 чел.</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setGuests(Math.max(1,guests-1))} style={{width:34,height:34,borderRadius:17,background:guests>1?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:guests>1?"var(--label)":"var(--label4)"}}>−</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{guests}</span>
                  <div className="tap" onClick={()=>setGuests(Math.min(6,guests+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              {/* Children */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:"0.5px solid var(--sep)"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Дети</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>0–4, до 12 лет</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setChildren(Math.max(0,children-1))} style={{width:34,height:34,borderRadius:17,background:children>0?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:children>0?"var(--label)":"var(--label4)"}}>−</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{children}</span>
                  <div className="tap" onClick={()=>setChildren(Math.min(4,children+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              {/* Price calculation */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{selectedHotel.price_from?.toLocaleString("ru")} ₽ × {calcNights} ноч.</span>
                <span style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{(selectedHotel.price_from*calcNights)?.toLocaleString("ru")} ₽</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>Билеты в парк (вкл.)</span>
                <span style={{fontSize:14,fontWeight:600,color:"#34C759",fontFamily:FT}}>0 ₽</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"0.5px solid var(--sep)"}}>
                <span style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT}}>Итого</span>
                <span style={{fontSize:24,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(selectedHotel.price_from*calcNights)?.toLocaleString("ru")} ₽</span>
              </div>
              {/* Book button */}
              <div className="tap" onClick={()=>{if(cart&&setCart){const nc=addToCart(cart,setCart,{cat:"hotel",itemId:selectedHotel.id,name:selectedHotel.name,emoji:"🏨",qty:1,price:selectedHotel.price_from*calcNights,meta:{nights,guests,hotel:selectedHotel.name}});syncCartToDB(nc,userId);showCartToast&&showCartToast("Отель добавлен");}else{setBooked(true);}}} style={{marginTop:16,padding:"16px",borderRadius:16,background:"#003580",textAlign:"center",boxShadow:"0 4px 16px rgba(0,53,128,.3)"}}>
                <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>В корзину · {(selectedHotel.price_from*calcNights)?.toLocaleString("ru")} ₽</span>
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
                  <div className="tap" onClick={(e:any)=>{e.stopPropagation();if(cart&&setCart){const p=rt.price_weekday||rt.price_weekend||0;const nc=addToCart(cart,setCart,{cat:"hotel",itemId:selectedHotel.id+"_"+rt.id,name:selectedHotel.name+" — "+rt.name,emoji:"🏨",qty:nights||1,price:p,meta:{room:rt.name,hotel:selectedHotel.name}});syncCartToDB(nc,userId);showCartToast&&showCartToast(rt.name+" добавлен");}}} style={{padding:"6px 14px",borderRadius:10,background:"rgba(0,122,255,.08)",marginLeft:6}}><span style={{fontSize:13,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>В корзину</span></div>
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
          {!booked&&(<div style={{position:"fixed",bottom:34,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 80px)",maxWidth:310,zIndex:150,padding:"10px 16px",background:"rgba(255,255,255,0.22)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.4)",borderRadius:22,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FD}}>от {(selectedHotel.price_from*calcNights)?.toLocaleString("ru")} ₽</div>
              <div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,marginTop:1}}>{nights} ноч. · {guests} гост.</div>
            </div>
            <div className="tap" onClick={()=>{if(cart&&setCart){const nc=addToCart(cart,setCart,{cat:"hotel",itemId:selectedHotel.id,name:selectedHotel.name,emoji:"🏨",qty:1,price:selectedHotel.price_from*calcNights,meta:{nights,guests}});syncCartToDB(nc,userId);showCartToast&&showCartToast("Отель добавлен");}else{setBooked(true);}}} style={{padding:"8px 18px",height:34,borderRadius:17,background:"#003580",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FT,whiteSpace:"nowrap"}}>В корзину</span>
            </div>
          </div>)}
          {booked && <BookingModal item={{...selectedHotel,_nights:nights}} type="hotel" total={selectedHotel.price_from*calcNights} guests={guests} onClose={()=>setBooked(false)} cart={cart||[]} setCart={setCart} userId={userId}/>}
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
              <div className="tap" onClick={()=>setShowCal(showCal==='in'?null:'in')} style={{flex:1,padding:'10px 12px',borderRadius:12,background:showCal==='in'?'rgba(0,122,255,0.08)':'var(--bg)',border:showCal==='in'?'2px solid #007AFF':'0.5px solid var(--sep-opaque)'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>Заезд</div>
                <div style={{fontSize:15,fontWeight:600,color:'#007AFF',fontFamily:FT,marginTop:2}}>{new Date(checkIn).toLocaleDateString('ru',{day:'numeric',month:'short'})}</div>
              </div>
              <div className="tap" onClick={()=>setShowCal(showCal==='out'?null:'out')} style={{flex:1,padding:'10px 12px',borderRadius:12,background:showCal==='out'?'rgba(52,199,89,0.08)':'var(--bg)',border:showCal==='out'?'2px solid #34C759':'0.5px solid var(--sep-opaque)'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>Выезд</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginTop:2}}>{new Date(checkOut).toLocaleDateString('ru',{day:'numeric',month:'short'})}</div>
              </div>
              
            </div>
            {showCal&&!selectedHotel&&<CalendarPicker checkIn={checkIn} checkOut={checkOut} showCal={showCal} setShowCal={setShowCal} setCheckIn={setCheckIn} setCheckOut={setCheckOut}/>}
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
              {(function(){const imgs=[detailSheet.cover_image_url,...(detailSheet.images||[])].filter(Boolean);return imgs.length>1?<div style={{position:"absolute",bottom:52,left:0,right:0,display:"flex",justifyContent:"center",gap:5,zIndex:5}}>{imgs.map((_:any,i:number)=>(<div key={i} style={{width:i===galIdx?18:6,height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:i===galIdx?"#fff":"rgba(255,255,255,.4)",transition:"all .3s"}}/>))}</div>:null;})()}
              <div className="tap" onClick={()=>setDetailSheet(null)} style={{position:"absolute",top:54,left:16,zIndex:20,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.4)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
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
            <div style={{position:"fixed",bottom:34,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 80px)",maxWidth:310,zIndex:300,padding:"10px 16px",background:"rgba(255,255,255,0.22)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.4)",borderRadius:22,display:"flex",alignItems:"center"}}>
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
function ServicesTab({onSearch,onProfile,pendingSec,onClearPending,cart:appCart,setCart:setAppCart,userId}:{onSearch?:()=>void,onProfile?:()=>void,onCalendar?:()=>void,pendingSec?:string,onClearPending?:()=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void,onCalendar?:()=>void}) {
  const [sec, setSec] = useState('delivery');
  useEffect(()=>{if(pendingSec){if(pendingSec==="calendar"&&onCalendar){onCalendar();onClearPending&&onClearPending();return;}setSec(pendingSec);onClearPending&&onClearPending();setTimeout(()=>{const el=document.getElementById("pill-"+pendingSec);if(el)el.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});},100);}},[pendingSec]);
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
  useEffect(()=>{if(showReviewForm&&!rvName){try{const s=localStorage.getItem("sb_session");if(s){const p=JSON.parse(s);if(p?.user?.user_metadata?.name)setRvName(p.user.user_metadata.name);}}catch{}}},[showReviewForm]);
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
  const toggleFav = async(id:string,name?:string,emoji?:string,itemType?:string)=>{
    setFavorites(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});
    if(typeof navigator!=="undefined"&&navigator.vibrate)navigator.vibrate(10);
    try{
      const exists = await fetch(SB_URL+'/rest/v1/favorites?item_id=eq.'+id+'&select=id',{headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}}).then(r=>r.json());
      if(exists&&exists.length>0){
        await fetch(SB_URL+'/rest/v1/favorites?item_id=eq.'+id,{method:'DELETE',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}});
      }else{
        await fetch(SB_URL+'/rest/v1/favorites',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({item_type:itemType||'hotel',item_id:id,item_name:name||'',item_emoji:emoji||'',user_id:userId||null})});
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
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',paddingBottom:110,background:'var(--bg)',maxWidth:'100%'}}>
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
          {[['delivery','🛵','Доставка'],['food','🍽️','Рестораны'],['shops','🛍️','Магазины'],['banya','🧖','Бани и СПА'],['fun','🎡','Развлечения'],['rental','🚲','Прокат']].map(([id,ic,label])=>(
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
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.6)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px'}}>Коллекции</div>
              <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4,letterSpacing:'-.5px'}}>0 / {(gastroRests||[]).length}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:2}}>ресторанов посещено</div>
              <div style={{marginTop:12,height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:'rgba(255,255,255,.2)'}}><div style={{height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:'#fff',width:'0%',transition:'width .5s'}}/></div>
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
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}><span style={{fontWeight:700,color:'var(--label)'}}>{(allReviews||[]).length}</span> отзывов</div>
            <div className="tap" onClick={()=>{setShowReviewForm(true);if(userId)sb('profiles','select=name&id=eq.'+userId).then(d=>{if(d&&d[0]&&d[0].name)setRvName(d[0].name);});}} style={{padding:'7px 16px',borderRadius:20,background:'#007AFF'}}>
              <span style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:FT}}>Написать отзыв</span>
            </div>
          </div>
          {allReviews.map((rv:any,i:number)=>{const stars='★'.repeat(rv.rating)+'☆'.repeat(5-rv.rating);const ago=Math.ceil((Date.now()-new Date(rv.created_at).getTime())/86400000);const agoText=ago<=0?'сегодня':ago===1?'вчера':ago+' дн. назад';return(<div key={rv.id} className={"fu s"+Math.min(i+1,6)} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14,marginBottom:10,boxShadow:'var(--shadow-sm)'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:18,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{rv.author_emoji||'👤'}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{rv.author_name||'Гость'}</div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>{agoText}</div>{session?.user?.id&&rv.user_id===session.user.id&&<div style={{display:"flex",gap:8,marginTop:4}}><div className="tap" onClick={()=>{setEditingRv(rv);setRvRating(rv.rating);setRvComment(rv.comment||"");setRvItem((rv.item_type||"park")+":"+(rv.item_name||"Этномир"));setShowRvForm(true);}} style={{fontSize:12,color:"#007AFF",fontFamily:FT}}>Изменить</div><div className="tap" onClick={async()=>{if(confirm("Удалить отзыв?")){await fetch(SB_URL+"/rest/v1/rpc/delete_review",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_review_id:rv.id,p_user_id:session.user.id})});setRevs((p:any)=>p.filter((r:any)=>r.id!==rv.id));}}} style={{fontSize:12,color:"#FF3B30",fontFamily:FT}}>Удалить</div></div>}</div><div style={{fontSize:13,color:'#FFD60A',letterSpacing:1}}>{stars}</div></div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5,marginBottom:6}}>{rv.comment}</div><span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'2px 8px',borderRadius:8}}>{rv.item_name}</span></div>);})}
          {(allReviews||[]).length===0&&!loading&&<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>⭐</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>Отзывов пока нет</div></div>}
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
              <div className="tap" onClick={()=>{if(appCart&&setAppCart){data.filter((d:any)=>cart[d.id]>0).forEach((d:any)=>{addToCart(appCart,setAppCart,{cat:"delivery",itemId:d.id,name:d.name_ru||d.name,emoji:d.cover_emoji||"🍽️",qty:cart[d.id],price:d.price});});syncCartToDB(appCart,userId);setCart({});showCartToast&&showCartToast("Доставка добавлена");}}} style={{padding:'10px 20px',borderRadius:14,background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)'}}>
                <span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>В корзину</span>
              </div>
            </div>
          )}
        </div>
      ) : sec==='food' ? (selectedRest ? (
        <div style={{padding:0}}>
          <div style={{position:'relative',height:200,background:'linear-gradient(145deg,#8B4513,#D2691E)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'0 0 0 0'}}>
            <span style={{fontSize:80,opacity:.2}}>{selectedRest.cover_emoji}</span>
            <div className="tap" onClick={()=>toggleFav(selectedRest?.id||"",selectedRest?.name_ru||"",selectedRest?.cover_emoji||"")} style={{position:'absolute',top:54,right:16,width:36,height:36,borderRadius:18,background:'rgba(0,0,0,.2)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}><span style={{fontSize:18,color:favorites.has(selectedRest.id)?'#FF3B30':'rgba(255,255,255,.85)'}}>{favorites.has(selectedRest.id)?'♥':'♡'}</span></div>
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
                      <span style={{fontSize:15,fontWeight:700,color:'var(--orange)',fontFamily:FD,flexShrink:0,marginLeft:8}}>{m.price} ₽</span>
                      {m.price>0&&<div className="tap" onClick={(e:any)=>{e.stopPropagation();if(appCart&&setAppCart){const nc=addToCart(appCart,setAppCart,{cat:"delivery",itemId:m.id,name:m.name_ru,emoji:"🍽️",qty:1,price:m.price});syncCartToDB(nc,userId);showCartToast&&showCartToast(m.name_ru);}}} style={{width:28,height:28,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg></div>}
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
        <div className="ios-sheet" style={{background:"var(--bg2)",borderRadius:"28px 28px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:390,maxHeight:"80vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{"Новый отзыв"}</div>
            <div className="tap" onClick={()=>setShowReviewForm(false)} style={{width:30,height:30,borderRadius:15,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,color:"var(--label3)"}}>✕</span></div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:6}}>Оценка</div>
            <div style={{display:"flex",gap:6}}>{[1,2,3,4,5].map(n=>(<div key={n} className="tap" onClick={()=>setRvRating(n)} style={{fontSize:28,cursor:"pointer"}}>{n<=rvRating?"★":"☆"}</div>))}</div>
          </div>
          <div style={{borderRadius:12,background:"var(--bg)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:14}}>
            <input value={rvName} onChange={(e:any)=>setRvName(e.target.value)} placeholder="Ваше имя" style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box"}}/>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <select value={rvItem} onChange={(e:any)=>setRvItem(e.target.value)} style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:rvItem?"var(--label)":"var(--label4)",boxSizing:"border-box",WebkitAppearance:"none",appearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 16px center"}}><option value="">Что посетили?</option><option value="Этномир">Парк Этномир</option><option value="Отель">Отель</option><option value="Ресторан">Ресторан / Кафе</option><option value="Экскурсия">Экскурсия / Тур</option><option value="Мастер-класс">Мастер-класс</option><option value="Баня / СПА">Баня / СПА</option><option value="Мероприятие">Мероприятие / Фестиваль</option><option value="Прокат / Развлечения">Прокат / Развлечения</option><option value="Другое">Другое</option></select>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <textarea value={rvComment} onChange={(e:any)=>setRvComment(e.target.value)} placeholder="Ваш отзыв..." rows={4} style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box",resize:"none"}}/>
          </div>
          <div className="tap" onClick={async()=>{if(!rvComment.trim()){alert("Напишите отзыв");return;}setRvSending(true);await fetch(SB_URL+"/rest/v1/reviews",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({item_type:rvItem.replace(/[<>]/g,"").match(/тур|экскурси/i)?"tour":rvItem.match(/мастер|класс/i)?"masterclass":rvItem.match(/отел|номер/i)?"hotel":rvItem.match(/бан|спа|хамм/i)?"service":rvItem.match(/ресторан|кафе|кухн/i)?"restaurant":"park",item_id:"manual",item_name:rvItem||"Этномир",rating:rvRating,comment:rvComment,author_name:rvName||"Гость",author_emoji:"👤"})});setRvSending(false);setShowReviewForm(false);setRvComment("");setRvName("");setRvItem("");setRvRating(5);setAllReviews(prev=>[{id:Date.now(),item_type:"restaurant",item_name:rvItem||"Этномир",rating:rvRating,comment:rvComment,author_name:rvName||"Гость",author_emoji:"👤",created_at:new Date().toISOString()},...prev]);}} onClick={async()=>{if(rvSending||!rvComment.trim())return;setRvSending(true);try{const emoji=["👤","👩","👨","🧑","👩‍🦰","👨‍🦱"][Math.floor(Math.random()*6)];await fetch(SB_URL+'/rest/v1/reviews',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({item_type:rvItem.includes("отель")||rvItem.includes("hotel")?"hotel":rvItem.includes("ресторан")||rvItem.includes("кафе")?"restaurant":"park",item_name:rvItem||"Этномир",rating:rvRating,comment:rvComment,author_name:rvName||"Гость",author_emoji:emoji})});setShowReviewForm(false);setRvComment('');setRvRating(5);setRvItem('');sb('reviews','select=id,item_type,item_name,rating,comment,author_name,author_emoji,created_at&order=created_at.desc&limit=50').then(d=>setAllReviews(_safe(d||[])));}catch(e){console.error(e);}finally{setRvSending(false);}}} style={{padding:"14px",borderRadius:14,background:"#007AFF",textAlign:"center",opacity:rvSending?.5:1,cursor:"pointer"}}>
            <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>{rvSending?"Отправка...":"Отправить отзыв"}</span>
          </div>
        </div>
      </div>
    )}
    {bookingService && <BookingModal item={bookingService} type="service" total={bookingService.price_from||0} guests={1} onClose={()=>setBookingService(null)} cart={appCart||[]} setCart={setAppCart} userId={userId}/>}
    </div>
  );
}

// ─── PASSPORT ─────────────────────────────────────────────


// ─── PASSPORT VIEW (iOS 26 grouped) ──────────────────────
function _sv(v:any):string{if(v==null)return '';if(typeof v==='object')return JSON.stringify(v);return String(v);}
class ErrorBoundary extends Component<{fallback:any,children:any},{err:any,info:any}>{constructor(p:any){super(p);this.state={err:null,info:null};}static getDerivedStateFromError(e:any){return{err:e};}componentDidCatch(e:any,info:any){console.warn('PASSPORT_DEBUG:',e,'\\nStack:',info?.componentStack);this.setState({err:e,info});}render(){if(this.state.err){const msg=String(this.state.err?.message||this.state.err);const stack=this.state.info?.componentStack||'';return <div style={{padding:40,textAlign:'center'}}><div style={{fontSize:48,marginBottom:8}}>⚠️</div><div style={{fontSize:15,color:'#FF3B30',fontFamily:'system-ui',marginBottom:8}}>Ошибка паспорта</div><div style={{fontSize:12,color:'#8E8E93',fontFamily:'monospace',padding:'8px 12px',background:'#F2F2F7',borderRadius:8,textAlign:'left',maxHeight:300,overflow:'auto',wordBreak:'break-all'}}>{msg}{'\\n\\nComponentStack: '+stack.slice(0,500)}</div><div className='tap' onClick={()=>{localStorage.removeItem('sb_session');window.location.reload();}} style={{marginTop:16,padding:'12px 24px',borderRadius:14,background:'#007AFF',color:'#fff',fontSize:15,fontWeight:600,display:'inline-block',cursor:'pointer'}}>Очистить и повторить</div></div>;}return this.props.children;}}

function PassportView({session,onLogin,onLogout,onQR,cart,setCart,showCartToast,onOpenPromo,onOpenChat,onOpenNotifs,onOpenMap}:{session:any,onLogin:any,onLogout:any,onQR:any,cart?:CartItem[],setCart?:(c:CartItem[])=>void,showCartToast?:(m:string)=>void,onOpenPromo?:()=>void,onOpenChat?:()=>void,onOpenNotifs?:()=>void,onOpenMap?:()=>void,onOpenCalendar?:()=>void}){
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
  const [myOrders,setMyOrders]=useState<any[]>([]);const [receiptsFilter,setReceiptsFilter]=useState('all');
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
  const [selectedLegal,setSelectedLegal]=useState<any>(null);const _lastScrolledView=React.useRef("");
  const [vpnEnabled,setVpnEnabled]=useState(()=>{try{return localStorage.getItem("vpn_enabled")==="true";}catch{return false;}});
  const [vpnServer,setVpnServer]=useState(()=>{try{return localStorage.getItem("vpn_server")||"auto";}catch{return "auto";}});
  const [vpnProtocol,setVpnProtocol]=useState(()=>{try{return localStorage.getItem("vpn_protocol")||"wireguard";}catch{return "wireguard";}});
  const [selBooking,setSelBooking]=useState<any>(null);
  const [bookingItems,setBookingItems]=useState<any[]>([]);
  const [showRvForm,setShowRvForm]=useState(false);const [editingRv,setEditingRv]=useState<any>(null);
  const [rvRating,setRvRating]=useState(5);
  const [rvComment,setRvComment]=useState("");
  const [rvItem,setRvItem]=useState("");
  const [rvSending,setRvSending]=useState(false);
  const [gastroStamps,setGastroStamps]=useState<any[]>([]);
  const [gastroRests,setGastroRests]=useState<any[]>([]);
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
      sb('bookings','select=id,type,item_name,hotel_name,guest_name,total_price,status,created_at,receipt_number,date_from,date_to,nights,guests_count,children,points_earned,country_visited,check_in_time,check_out_time,room_type&order=created_at.desc&limit=50'),
      sb('favorites','select=id,item_id,item_name,item_emoji,created_at&order=created_at.desc&limit=20'),
      sb('reviews','select=id,item_name,item_type,rating,comment,author_name,user_id,created_at&order=created_at.desc&limit=20'),
      sb('loyalty_levels','select=id,name_ru,icon,color,min_points&order=min_points.asc'),
      sb('subscription_plans','select=id,name_ru,slug,price_monthly,features,sort_order&is_active=eq.true&order=sort_order.asc'),
      sb('wallet_transactions','select=id,description,amount,created_at&order=created_at.desc&limit=20'),
      sb('points_log','select=id,description,points,created_at&order=created_at.desc&limit=20'),
      sb('legal_docs','select=id,title_ru,body_ru,published_at&is_current=eq.true&order=published_at.desc'),
      sb('gastro_stamps','select=id,restaurant_id,dish_name_ru,rating,visited_at,points_earned&order=visited_at.desc'),
      sb('restaurants','select=id,name_ru,cover_emoji,rating&active=eq.true&order=rating.desc'),
    ]).then(([c,r,a,b,f,rv,ll,sp,wt,pl,ld,gs,gr])=>{
      setCountries(Array.isArray(c)?c:[]);setRegions(Array.isArray(r)?r:[]);setAchievements(Array.isArray(a)?a:[]);setBookings(Array.isArray(b)?b:[]);setFavs(Array.isArray(f)?f:[]);setRevs(Array.isArray(rv)?rv:[]);setGastroStamps(Array.isArray(gs)?gs:[]);setGastroRests(Array.isArray(gr)?gr:[]);setLoyaltyLvls(Array.isArray(ll)?ll:[]);setSubPlans(Array.isArray(sp)?sp:[]);
      sb("receipts","select=id,receipt_code,category,total,status,created_at,points_earned,countries_unlocked,receipt_items(item_name,item_type,emoji,line_total,country_visited,details)&order=created_at.desc&limit=50").then(d=>setMyOrders(d||[]));setWalletTx(Array.isArray(wt)?wt:[]);setPointsLog(Array.isArray(pl)?pl:[]);setLegalDocs(Array.isArray(ld)?ld:[]);setLoading(false);
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
    if(_lastScrolledView.current!==view){_lastScrolledView.current=view;setTimeout(()=>{document.getElementById("pp-top")?.scrollIntoView({behavior:"instant"});},50);}const titles:Record<string,string>={countries:'Страны мира',regions:'Регионы России',achievements:'Достижения',orders:'Мои заказы',bookings:'Бронирования',receipts:'Мои чеки',favorites:'Избранное',reviews:'Отзывы',wallet:'Кошелёк',points:'Баллы',requests:'Мои заявки',settings:'Настройки',collections:'Коллекции',terms:'Условия использования',privacy:'Политика конфиденциальности'};
    return(
      <div style={{padding:'12px 0'}}>
        <div id="pp-top" className="tap no-print" onClick={()=>setView(null)} style={{display:'flex',alignItems:'center',gap:6,padding:'0 20px 16px'}}>
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

        {view==='receipts'&&(
      <div style={{padding:"12px 0"}}>
        <div style={{display:"flex",gap:8,padding:"0 20px 16px",overflowX:"auto"}}>
          {[{k:"all",l:"Все"},{k:"housing",l:"Жильё"},{k:"tickets",l:"Билеты"},{k:"services",l:"Услуги"},{k:"other",l:"Другое"}].map(f=>(
            <div key={f.k} className="tap" onClick={()=>setReceiptsFilter(f.k)} style={{padding:"6px 16px",borderRadius:20,background:receiptsFilter===f.k?"#007AFF":"var(--fill4)",color:receiptsFilter===f.k?"#fff":"var(--label2)",fontSize:13,fontWeight:600,fontFamily:FT,whiteSpace:"nowrap"}}>{f.l}</div>
          ))}
        </div>
        <div style={{padding:"0 20px"}}>
          {myOrders.filter((r:any)=>receiptsFilter==="all"||r.category===receiptsFilter).length===0?
            <div style={{textAlign:"center",padding:40,color:"var(--label3)",fontFamily:FT,fontSize:14}}>Нет чеков</div>:
            myOrders.filter((r:any)=>receiptsFilter==="all"||r.category===receiptsFilter).map((r:any)=>{
              const sm:Record<string,{l:string,c:string}>={pending:{l:"Ожидает",c:"#FF9F0A"},confirmed:{l:"Подтверждён",c:"#34C759"},paid:{l:"Оплачен",c:"#34C759"},completed:{l:"Завершён",c:"#007AFF"},cancelled:{l:"Отменён",c:"#FF3B30"},refunded:{l:"Возврат",c:"#8E8E93"}};
              const s=sm[r.status]||{l:r.status,c:"#8E8E93"};
              const items=r.receipt_items||[];
              const mainItem=items[0]||{};
              const catIcon:Record<string,string>={housing:"🏨",tickets:"🎟",services:"🛎",other:"📦"};
              return(
                <div key={r.id} className="tap" onClick={()=>{window.location.hash="order/"+(r.receipt_code||r.id);}} style={{padding:"14px 16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{catIcon[r.category]||"📦"} {_s(mainItem.item_name||"Чек")}</div>
                      <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{r.created_at?new Date(r.created_at).toLocaleDateString("ru",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}):""}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(r.total||0).toLocaleString("ru")} ₽</div>
                      <div style={{fontSize:11,fontWeight:600,color:s.c,marginTop:2}}>{s.l}</div>
                    </div>
                  </div>
                  {items.length>1&&<div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:6}}>+{items.length-1} ещё</div>}
                  {r.points_earned>0&&<div style={{fontSize:11,color:"#34C759",fontFamily:FT,marginTop:4}}>+{r.points_earned} баллов</div>}
                </div>
              );
            })
          }
        </div>
      </div>
    )}

        {view==='favorites'&&(
          <div style={{padding:'0 20px'}}>{(favs||[]).length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>❤️</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>Пусто</div></div>:
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>{favs.map((f:any,i:number)=>(
              <div key={f.id||i} style={{padding:'14px 16px',borderBottom:i<(favs||[]).length-1?'0.5px solid var(--sep)':'none',display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24}}>{_s(f.item_emoji||'❤️')}</span>
                <div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{_s(f.item_name)}</div>
              </div>
            ))}</div>}
          </div>
        )}

        {view==='terms'&&(
          <div style={{padding:'0 20px'}}>
            <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:16}}>Условия использования</div>
            {[{t:"1. Общие положения",b:"Настоящие условия регулируют использование мобильного приложения «Этномир» (далее — Приложение). Используя Приложение, вы соглашаетесь с настоящими условиями. Приложение предоставляется ООО «ЭТНОМИР» (ОГРН 1034004404584)."},
            {t:"2. Услуги",b:"Приложение позволяет просматривать информацию о парке, бронировать билеты, экскурсии, мастер-классы, проживание и другие услуги. Все цены указаны в рублях РФ и включают НДС. Окончательная стоимость подтверждается при оформлении заказа."},
            {t:"3. Бронирование и оплата",b:"Бронирование считается подтверждённым после получения электронного подтверждения. Оплата производится онлайн банковской картой или при посещении парка. Электронный билет действителен при предъявлении QR-кода."},
            {t:"4. Отмена и возврат",b:"Отмена бронирования возможна не позднее чем за 24 часа до начала мероприятия. Возврат средств осуществляется в течение 10 рабочих дней на карту, с которой была произведена оплата. При отмене менее чем за 24 часа удерживается 50% стоимости."},
            {t:"5. Правила посещения",b:"Посетители обязаны соблюдать правила парка, следовать указаниям персонала, бережно относиться к имуществу и экспонатам. Запрещено: нахождение в состоянии опьянения, курение вне отведённых мест, причинение ущерба объектам парка."},
            {t:"6. Программа лояльности",b:"Баллы начисляются за покупки, посещения и активности в приложении. 1 балл = 1 рубль при оплате услуг парка. Баллы не обмениваются на денежные средства и сгорают через 12 месяцев неактивности."},
            {t:"7. Ответственность",b:"Парк не несёт ответственности за ущерб, вызванный нарушением правил посещения. Максимальная ответственность парка ограничена стоимостью оплаченных услуг."}
            ].map((s,i)=>(
              <div key={i} style={{marginBottom:16}}>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginBottom:6}}>{s.t}</div>
                <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,lineHeight:1.6}}>{s.b}</div>
              </div>
            ))}
            <div style={{padding:16,borderRadius:16,background:'var(--fill4)',marginTop:8}}>
              <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,lineHeight:1.5}}>Последнее обновление: март 2026 г. Вопросы: info@ethnomir.ru | +7 (495) 320-93-10</div>
            </div>
          </div>
        )}

        {view==='privacy'&&(
          <div style={{padding:'0 20px'}}>
            <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:16}}>Политика конфиденциальности</div>
            {[{t:"1. Сбор данных",b:"Мы собираем: имя, номер телефона, email (при регистрации); данные о посещениях и покупках; техническую информацию об устройстве. Данные собираются только с вашего согласия."},
            {t:"2. Использование данных",b:"Ваши данные используются для: обработки заказов и бронирований, начисления баллов лояльности, отправки уведомлений о мероприятиях (с вашего согласия), улучшения качества услуг и аналитики."},
            {t:"3. Хранение и защита",b:"Данные хранятся на защищённых серверах с шифрованием. Доступ имеют только авторизованные сотрудники. Мы применяем SSL/TLS для передачи данных и регулярно проводим аудит безопасности."},
            {t:"4. Передача третьим лицам",b:"Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением: платёжных систем (для обработки оплаты), государственных органов (по запросу суда)."},
            {t:"5. Cookies и аналитика",b:"Приложение использует cookies для сохранения сессии авторизации и предпочтений. Аналитические данные собираются в обезличенном виде для улучшения сервиса."},
            {t:"6. Ваши права",b:"Вы имеете право: запросить копию своих данных, потребовать их удаления, отозвать согласие на обработку, обратиться в Роскомнадзор. Для обращений: privacy@ethnomir.ru."},
            {t:"7. Изменения политики",b:"Мы оставляем за собой право обновлять настоящую политику. О существенных изменениях вы будете уведомлены через приложение."}
            ].map((s,i)=>(
              <div key={i} style={{marginBottom:16}}>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginBottom:6}}>{s.t}</div>
                <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,lineHeight:1.6}}>{s.b}</div>
              </div>
            ))}
            <div style={{padding:16,borderRadius:16,background:'var(--fill4)',marginTop:8}}>
              <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,lineHeight:1.5}}>Оператор: ООО «ЭТНОМИР» | ИНН 4004004584 | Последнее обновление: март 2026 г.</div>
            </div>
          </div>
        )}

        {view==='reviews'&&(
          <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
            {!showRvForm&&<div className="tap" onClick={()=>{setShowRvForm(true);setRvRating(5);setRvComment("");setRvItem("");}} style={{padding:16,borderRadius:16,background:"var(--blue)",textAlign:"center",marginBottom:4}}><span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>Оставить отзыв</span></div>}
            {showRvForm&&<div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:20,marginBottom:8}}>
              <div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>{editingRv?"Редактировать отзыв":"Новый отзыв"}</div>
              <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:4}}>Ваше имя</div>
              <div style={{padding:"12px 14px",borderRadius:12,background:"var(--fill4)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:12}}>{profile?.name||session?.user?.email||"Гость"}</div>
              <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:4}}>Что посетили</div>
              <select value={rvItem} onChange={(e:any)=>setRvItem(e.target.value)} style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--fill4)",border:"none",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:12,WebkitAppearance:"none",appearance:"none"}}>
                <option value="">Выберите...</option>
                <option value="park:Этномир">Парк Этномир</option>
                <option value="tour:Экскурсия">Экскурсия</option>
                <option value="masterclass:Мастер-класс">Мастер-класс</option>
                <option value="hotel:Отель">Отель</option>
                <option value="restaurant:Ресторан">Ресторан</option>
                <option value="service:Баня и СПА">Баня и СПА</option>
                <option value="event:Событие">Событие</option>
              </select>
              <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:6}}>Оценка</div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>{[1,2,3,4,5].map(n=>(<div key={n} className="tap" onClick={()=>setRvRating(n)} style={{fontSize:28,cursor:"pointer",color:n<=rvRating?"#FFD60A":"var(--label3)",transition:"transform .15s"}}>{n<=rvRating?"★":"☆"}</div>))}</div>
              <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:4}}>Комментарий</div>
              <textarea value={rvComment} onChange={(e:any)=>setRvComment(e.target.value)} placeholder="Расскажите о впечатлениях..." rows={3} style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--fill4)",border:"none",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:12,resize:"vertical"}}/>
              <div className="tap" onClick={async()=>{if(!rvItem||!rvComment.trim()){return;}setRvSending(true);const[itype,iname]=rvItem.split(":");await fetch(SB_URL+(editingRv?"/rest/v1/rpc/edit_review":"/rest/v1/reviews"),{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({item_type:itype,item_name:iname,rating:rvRating,comment:rvComment.trim(),author_name:profile?.name||session?.user?.email||"Гость",author_emoji:"⭐"})});setRvSending(false);setShowRvForm(false);setRevs(p=>[{id:Date.now(),item_name:iname,rating:rvRating,comment:rvComment,author_name:profile?.name||session?.user?.email||"Гость",created_at:new Date().toISOString()},...p]);}} style={{padding:16,borderRadius:14,background:"var(--blue)",textAlign:"center",opacity:rvSending?.5:1}}><span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>{rvSending?"Отправка...":"Отправить"}</span></div>
              <div className="tap" onClick={()=>setShowRvForm(false)} style={{padding:12,textAlign:"center",marginTop:4}}><span style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Отмена</span></div>
            </div>}
            {(revs||[]).length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>📝</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>Нет отзывов</div></div>:
            revs.map((r:any,i:number)=>{
              const mine=session?.user?.id&&r.user_id===session.user.id;
              return <div key={r.id||i} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{_s(r.item_name)}</div>
                  <div style={{color:'#FFD60A',fontSize:13}}>{'★'.repeat(r.rating||0)+'☆'.repeat(5-(r.rating||0))}</div>
                </div>
                <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,fontStyle:'italic'}}>«{_s(r.comment)}»</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6}}>
                  <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>{new Date(r.created_at).toLocaleDateString('ru',{day:'numeric',month:'long',year:'numeric'})}</div>
                  {mine&&<div style={{display:'flex',gap:12}}>
                    <div className="tap" onClick={()=>{setEditingRv(r);setRvRating(r.rating);setRvComment(r.comment||"");setRvItem((r.item_type||"park")+":"+(r.item_name||""));setShowRvForm(true);}} style={{fontSize:12,fontWeight:600,color:'#007AFF',fontFamily:FT}}>Изменить</div>
                    <div className="tap" onClick={async()=>{if(confirm("Удалить отзыв?")){await fetch(SB_URL+"/rest/v1/rpc/delete_review",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},body:JSON.stringify({p_review_id:r.id,p_user_id:session.user.id})});setRevs((p:any)=>p.filter((x:any)=>x.id!==r.id));}}} style={{fontSize:12,fontWeight:600,color:'#FF3B30',fontFamily:FT}}>Удалить</div>
                  </div>}
                </div>
              </div>;
            })}
          </div>
        )}

        {view==='collections'&&(
          <div style={{padding:'0 20px'}}>
            <div style={{borderRadius:20,overflow:'hidden',background:'linear-gradient(135deg,#FF6B35,#F7931E)',padding:'24px 20px',marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.6)',letterSpacing:'.5px',textTransform:'uppercase'}}>Коллекции</div>
              <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4}}>{(gastroStamps||[]).length} / {(gastroRests||[]).length}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:2}}>ресторанов посещено</div>
              <div style={{marginTop:12,height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:'rgba(255,255,255,.2)'}}><div style={{height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:'#fff',width:((gastroRests||[]).length>0?Math.round((gastroStamps||[]).length/(gastroRests||[]).length*100):0)+'%',transition:'width .5s'}}/></div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:6}}>Посетите все и получите значок «Гурман» + 500 очков</div>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:12}}>Рестораны парка</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>{gastroRests.map((r:any,i:number)=>{const visited=gastroStamps.some((s:any)=>s.restaurant_id===r.id);return(<div key={r.id} className={"tap fu s"+Math.min(i+1,6)} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:12,textAlign:'center',position:'relative'}}><div style={{fontSize:32,marginBottom:6}}>{r.cover_emoji}</div><div style={{fontSize:11,fontWeight:600,color:'var(--label)',fontFamily:FT,lineHeight:1.3}}>{(r.name_ru||'').replace(/Ресторан |Кафе |Кафе-пекарня /g,'').replace(/[«»]/g,'')}</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,marginTop:2}}>⭐ {r.rating}</div><div style={{position:'absolute',top:6,right:6,width:20,height:20,borderRadius:10,border:visited?'none':'2px solid var(--sep)',background:visited?'#34C759':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:10,color:visited?'#fff':'var(--sep)'}}>✓</span></div></div>);})}</div>
            {(gastroStamps||[]).length>0&&<div style={{marginBottom:20}}><div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:12}}>История посещений</div><div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>{gastroStamps.map((s:any,i:number)=>{const rest=gastroRests.find((r:any)=>r.id===s.restaurant_id);return(<div key={s.id||i} style={{padding:'14px 16px',borderBottom:i<(gastroStamps||[]).length-1?'0.5px solid var(--sep)':'none',display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:24}}>{rest?.cover_emoji||'🍽️'}</span><div style={{flex:1}}><div style={{fontSize:15,color:'var(--label)',fontFamily:FT,fontWeight:600}}>{_s(rest?.name_ru||s.dish_name_ru||'Ресторан')}</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{s.dish_name_ru?_s(s.dish_name_ru)+' · ':''}{new Date(s.visited_at).toLocaleDateString('ru')} · {s.rating?'⭐'.repeat(s.rating):''}</div></div>{s.points_earned>0&&<div style={{fontSize:13,fontWeight:700,color:'#34C759',fontFamily:FD}}>+{s.points_earned}</div>}</div>);})}</div></div>}
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:16}}><div style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FT,marginBottom:10}}>Как это работает</div>{[['📱','Покажите QR','Откройте приложение и покажите QR официанту'],['✅','Получите штамп','Штамп появится автоматически'],['🏆','Соберите все','30 очков за каждый, 500 бонус за все']].map(([ic,tt,d]:any,i:number)=>(<div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<2?10:0}}><div style={{width:36,height:36,borderRadius:10,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{ic}</div><div><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{tt}</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{d}</div></div></div>))}</div>
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
                      <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:10}}>Мои заказы</div>
            {(myOrders||[]).length===0?<div style={{textAlign:"center",padding:20,color:"var(--label3)",fontFamily:FT,fontSize:13,marginBottom:16}}>Пока нет заказов</div>:<div style={{marginBottom:16}}>{myOrders.map((o:any)=>{const sm:Record<string,{l:string,c:string}>={pending:{l:"Ожидает",c:"#FF9F0A"},confirmed:{l:"Подтверждён",c:"#34C759"},paid:{l:"Оплачен",c:"#34C759"},completed:{l:"Завершён",c:"#007AFF"},cancelled:{l:"Отменён",c:"#FF3B30"}};const s=sm[o.status]||{l:o.status,c:"#8E8E93"};return(<div key={o.id} className="tap" onClick={()=>{window.location.hash="order/"+(o.order_code||o.id);}} style={{padding:"12px 16px",borderRadius:14,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{(()=>{const it=o.items?(typeof o.items==="string"?JSON.parse(o.items):o.items):[];return it.length>0?(it[0].name||"Заказ")+(it.length>1?" и ещё "+(it.length-1):""):o.type==="cart"?"Корзина":o.type==="food"?"Доставка":o.type||"Заказ";})()}</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{new Date(o.created_at).toLocaleDateString("ru",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(o.total||0).toLocaleString("ru")} ₽</div><span style={{fontSize:10,fontWeight:600,color:s.c,fontFamily:FT,background:s.c+"15",padding:"2px 8px",borderRadius:6}}>{s.l}</span></div><svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg></div></div>);})}</div>}
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

        {view==='points'&&(
          <div style={{padding:"0 20px"}}>
            <div style={{borderRadius:22,background:"linear-gradient(135deg,#1a2a1a,#2a4a2a)",padding:20,marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px"}}>Мои баллы</div>
              <div style={{fontSize:42,fontWeight:800,color:"#34C759",fontFamily:FD,marginTop:4}}>0</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,marginTop:4}}>Копите баллы за покупки, отзывы и активность</div>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:12}}>Как заработать</div>
            {(()=>{const [rules,setRules]=React.useState<any[]>([]);React.useEffect(()=>{sb("points_rules","select=*&is_active=eq.true&order=points.desc").then(d=>setRules(d||[]));},[]);return rules.map((r:any,i:number)=>(<div key={i} className="float-up" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<rules.length-1?"0.5px solid var(--sep)":"none",animationDelay:i*0.05+"s"}}><div style={{width:40,height:40,borderRadius:12,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{r.icon}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FD}}>{r.action_label}</div><div style={{fontSize:12,color:"var(--label2)",fontFamily:FT}}>{r.description_ru}</div></div><div style={{fontSize:16,fontWeight:700,color:"#34C759",fontFamily:FD}}>+{r.points}</div></div>));})()}
          </div>
        )}

        {view==='requests'&&(
          <div style={{padding:"0 20px"}}>
            <div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:12}}>Мои заявки</div>
            {(()=>{const [reqs,setReqs]=React.useState<any[]>([]);const [loading,setLoading]=React.useState(true);React.useEffect(()=>{sb("contact_requests","select=*&order=created_at.desc&limit=20").then(d=>{setReqs(_safe(d||[]));setLoading(false);});},[]);if(loading)return <div style={{textAlign:"center",padding:40,color:"var(--label2)",fontFamily:FT}}>Загрузка...</div>;if(!reqs.length)return <div style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:12}}>📋</div><div style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>У вас пока нет заявок</div></div>;return reqs.map((r:any,i:number)=>{const d=new Date(r.created_at);const status=r.status==='done'?{t:"Выполнена",c:"#34C759"}:r.status==='in_progress'?{t:"В работе",c:"#FF9500"}:{t:"Новая",c:"#007AFF"};return <div key={i} className="float-up" style={{padding:16,borderRadius:16,background:"var(--bg2)",marginBottom:8,animationDelay:i*0.05+"s"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{r.type||"Заявка"}</div><div style={{fontSize:11,fontWeight:600,color:status.c,fontFamily:FT,background:status.c+"15",padding:"3px 8px",borderRadius:6}}>{status.t}</div></div><div style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{r.message||r.source||""}</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:6}}>{d.toLocaleDateString("ru")}</div></div>;});})()}
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

            <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginTop:24,marginBottom:6}}>VPN и приватность</div>
            <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:16}}>
              {/* VPN Toggle */}
              <div className="tap" onClick={()=>{const nv=!vpnEnabled;setVpnEnabled(nv);try{localStorage.setItem("vpn_enabled",String(nv));}catch{}}} style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"0.5px solid var(--sep)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:8,background:vpnEnabled?"rgba(52,199,89,.15)":"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>{vpnEnabled?"🟢":"🔒"}</span></div>
                  <div><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FD}}>VPN-защита</div><div style={{fontSize:12,color:vpnEnabled?"#34C759":"var(--label3)",fontFamily:FT}}>{vpnEnabled?"Подключено":"Отключено"}</div></div>
                </div>
                <div style={{width:51,height:31,borderRadius:16,background:vpnEnabled?"#34C759":"var(--fill4)",padding:2,transition:"background .2s"}}><div style={{width:27,height:27,borderRadius:14,background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transform:vpnEnabled?"translateX(20px)":"translateX(0)",transition:"transform .2s cubic-bezier(0.2,0.8,0.2,1)"}}/></div>
              </div>
              {/* Server */}
              <div style={{padding:"14px 16px",borderBottom:"0.5px solid var(--sep)"}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Сервер</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["auto","Авто","🌐"],["nl","Нидерланды","🇳🇱"],["de","Германия","🇩🇪"],["fi","Финляндия","🇫🇮"],["us","США","🇺🇸"],["sg","Сингапур","🇸🇬"]].map(([id,name,flag]:any)=>(
                    <div key={id} className="tap" onClick={()=>{setVpnServer(id);try{localStorage.setItem("vpn_server",id);}catch{}}} style={{padding:"8px 12px",borderRadius:10,background:vpnServer===id?"rgba(0,122,255,.15)":"var(--bg)",border:vpnServer===id?"1px solid rgba(0,122,255,.3)":"1px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:16}}>{flag}</span>
                      <span style={{fontSize:13,fontWeight:vpnServer===id?600:400,color:vpnServer===id?"#007AFF":"var(--label2)",fontFamily:FT}}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Protocol */}
              <div style={{padding:"14px 16px",borderBottom:"0.5px solid var(--sep)"}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Протокол</div>
                <div style={{display:"flex",gap:6}}>
                  {[["wireguard","WireGuard"],["openvpn","OpenVPN"],["ikev2","IKEv2"]].map(([id,name]:any)=>(
                    <div key={id} className="tap" onClick={()=>{setVpnProtocol(id);try{localStorage.setItem("vpn_protocol",id);}catch{}}} style={{padding:"8px 14px",borderRadius:10,background:vpnProtocol===id?"rgba(0,122,255,.15)":"var(--bg)",border:vpnProtocol===id?"1px solid rgba(0,122,255,.3)":"1px solid var(--sep)"}}>
                      <span style={{fontSize:13,fontWeight:vpnProtocol===id?600:400,color:vpnProtocol===id?"#007AFF":"var(--label2)",fontFamily:FT}}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Status */}
              <div style={{padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:4,background:vpnEnabled?"#34C759":"var(--fill4)"}}></div>
                  <span style={{fontSize:13,color:vpnEnabled?"#34C759":"var(--label3)",fontFamily:FT,fontWeight:600}}>{vpnEnabled?"Прокси-режим активен":"Прямое соединение"}</span>
                </div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,lineHeight:1.5}}>
                  {vpnEnabled?"Прокси через "+({auto:"ближайший сервер",nl:"Нидерланды",de:"Германию",fi:"Финляндию",us:"США",sg:"Сингапур"}[vpnServer]||"авто")+" по протоколу "+(vpnProtocol==="wireguard"?"WireGuard":vpnProtocol==="openvpn"?"OpenVPN":"IKEv2")+". HTTPS-шифрование. Обход блокировок для API-запросов приложения.":"Включите прокси для обхода региональных ограничений. Трафик приложения пойдёт через глобальный CDN (AWS/Vercel Edge Network)."}
                </div>
              </div>
            </div>

            <div style={{fontSize:13,fontWeight:700,color:"var(--label2)",fontFamily:FD,textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>Правовая информация</div>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
              {(legalDocs||[]).length>0?legalDocs.map((doc:any,i:number)=>(
                <div key={doc.id} className="tap" onClick={()=>setSelectedLegal(doc)} style={{padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:i<(legalDocs||[]).length-1?'0.5px solid var(--sep)':'none'}}>
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
              <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:3}}>Отзывы</div>
              <div className="tap" onClick={()=>onLanding&&onLanding('reviews')} style={{borderRadius:16,background:'linear-gradient(135deg,#FF9500 0%,#FF6B00 100%)',padding:'20px',marginTop:12,cursor:'pointer'}}>
                <div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD}}>{revs.length>0?(revs.reduce((s:number,r:any)=>s+(r.rating||0),0)/revs.length).toFixed(1):'—'} ⭐</div>
                <div style={{fontSize:15,fontWeight:600,color:'#fff',fontFamily:FT,marginTop:4}}>{revs.length} отзывов посетителей</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',fontFamily:FT,marginTop:4}}>Парк · Отели · Рестораны · Туры · МК</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:12,padding:'8px 16px',borderRadius:20,background:'rgba(255,255,255,0.25)',backdropFilter:'blur(10px)'}}><span style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:FT}}>Читать все отзывы →</span></div>
              </div>
              
              {([] as any[]).map((rv:any,i:number)=>(
                <div key={rv.id||i} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px 16px',marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:20}}>{rv.author_emoji||'👤'}</span><span style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{_s(rv.author_name||'Гость')}</span></div>
                    <div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(n=>(<span key={n} style={{fontSize:12,color:n<=(rv.rating||0)?'#FF9500':'var(--sep)'}}>{n<=(rv.rating||0)?'★':'☆'}</span>))}</div>
                  </div>
                  {rv.item_name&&<div style={{fontSize:11,color:'var(--blue)',fontFamily:FT,marginBottom:4}}>{_s(rv.item_name)}</div>}
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5}}>{_s(rv.comment)}</div>
                  <div style={{fontSize:11,color:'var(--label4)',fontFamily:FT,marginTop:6}}>{new Date(rv.created_at).toLocaleDateString('ru')}</div>
                </div>
              ))}
            </div>
            <div style={{padding:'20px',textAlign:'center'}}>
              <div style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FD}}>Крупнейший парк РФ</div>
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
        <div style={{position:'absolute',top:16,right:16,width:56,height:56,borderRadius:32,border:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}><svg width="44" height="44" viewBox="0 0 200 200"><defs><radialGradient id="rp"><stop offset="0%" stopColor="#D4AF37" stopOpacity=".4"/><stop offset="100%" stopColor="#D4AF37" stopOpacity=".05"/></radialGradient></defs><circle cx="100" cy="100" r="38" fill="url(#rp)"/><circle cx="100" cy="100" r="60" fill="none" stroke="rgba(212,175,55,.12)" strokeWidth="1" strokeDasharray="4 4"/><ellipse cx="100" cy="100" rx="45" ry="20" fill="none" stroke="rgba(212,175,55,.1)" strokeWidth="1"/><circle cx="100" cy="62" r="4" fill="#FFD60A" opacity=".6" style={{animation:"frFloat 3s ease-in-out infinite"}}/><circle cx="138" cy="100" r="3" fill="#D4AF37" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite .5s"}}/><circle cx="62" cy="100" r="3" fill="#D4AF37" opacity=".5" style={{animation:"frFloat 3s ease-in-out infinite 1.5s"}}/><text x="100" y="108" textAnchor="middle" fontSize="24" fill="rgba(212,175,55,.4)" fontWeight="700" fontFamily="system-ui">ЭМ</text></svg></div>
        <div style={{position:'relative'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:2.5,fontFamily:FT,textTransform:'uppercase'}}>КРУПНЕЙШИЙ ПАРК РФ</div>
          <div style={{fontSize:14,color:'#D4AF37',fontWeight:700,letterSpacing:3,fontFamily:FT,marginTop:6}}>ПАСПОРТ</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:600,letterSpacing:2,fontFamily:FT,marginTop:12,textTransform:'uppercase'}}>Паспорт путешественника Этномира</div>
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
      <div style={{textAlign:'center',marginTop:16,padding:'0 10px'}}><span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Нажимая «Войти», вы принимаете <span className="tap" onClick={()=>setView('terms')} style={{color:'#007AFF'}}>условия</span> и <span className="tap" onClick={()=>setView('privacy')} style={{color:'#007AFF'}}>политику</span></span></div>
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
            <div><div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD}}>{(visitedC||[]).length}<span style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>/96</span></div><div style={{fontSize:9,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Стран</div></div>
            <div><div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD}}>{(visitedR||[]).length}<span style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>/85</span></div><div style={{fontSize:9,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Регионов</div></div>
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
          <Row icon="🌍" label="Страны мира" value={(visitedC||[]).length+'/96'} onClick={()=>setView('countries')}/>
          <Row icon="🇷🇺" label="Регионы России" value={(visitedR||[]).length+'/85'} onClick={()=>setView('regions')}/>
          <Row icon="🏆" label="Достижения" value={(unlockedAchs||[]).length+'/'+(achievements||[]).length} onClick={()=>setView('achievements')}/>
          <Row icon="🍽️" label="Коллекции" value={(gastroStamps||[]).length+'/'+(gastroRests||[]).length} onClick={()=>setView('collections')} last/>
        </div>
      </div>

      {/* Мои данные */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>Мои данные</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="🧾" label="Мои чеки" value={(myOrders||[]).length+''} onClick={()=>setView('receipts')}/>
          <Row icon="❤️" label="Избранное" value={(favs||[]).length+''} onClick={()=>setView('favorites')}/>
          <Row icon="📝" label="Мои отзывы" value={(revs||[]).length+''} onClick={()=>setView('reviews')} last/>
          
        </div>
      </div>

      {/* Кошелёк */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>Кошелёк</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="⭐" label="Баллы" value={pts+' оч.'} onClick={()=>setView('wallet')}/>
          <Row icon="👑" label="PRO подписка" value="990 ₽/мес" onClick={()=>setShowPro(!showPro)} last/>
        </div>

      <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6,marginTop:16}}>Инструменты</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="🏷️" label="Промокод" value="" onClick={()=>onOpenPromo&&onOpenPromo()}/>
          <Row icon="💬" label="Чат поддержки" value="" onClick={()=>onOpenChat&&onOpenChat()}/>
          <Row icon="🔔" label="Уведомления" value="" onClick={()=>onOpenNotifs&&onOpenNotifs()}/>
          <Row icon="🗺️" label="Карта парка" value="" onClick={()=>onOpenMap&&onOpenMap()} last/>
          
        </div>
        {showPro&&subPlans.filter((p:any)=>p.slug!=='free').length>0&&(
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginTop:8}}>
            {subPlans.filter((p:any)=>p.slug!=='free').map((plan:any,i:number,arr:any[])=>{
              const features=(()=>{try{const f=typeof plan.features==='string'?JSON.parse(plan.features):plan.features;return Array.isArray(f)?f:[];}catch(e){return[];}})();
              return(<div key={plan.id||i} style={{padding:14,borderBottom:i<arr.length-1?'0.5px solid var(--sep)':'none'}}>
                <div style={{fontSize:16,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{_s(plan.name_ru)} <span style={{fontSize:13,color:'var(--label3)',fontWeight:400}}>{_s(plan.price_monthly)} ₽/мес</span></div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>{features.map((f:string,j:number)=>(<span key={j} style={{fontSize:11,color:'var(--green)',background:'rgba(52,199,89,.08)',padding:'2px 8px',borderRadius:6,fontFamily:FT}}>✓ {_s(f)}</span>))}</div>
                <div className="tap" onClick={async()=>{if(cart&&setCart){addToCart(cart,setCart,{cat:"service",itemId:"sub_"+plan.id,name:"Подписка "+plan.name_ru,emoji:"⭐",qty:1,price:plan.price_monthly});showCartToast&&showCartToast("Подписка добавлена");}}} style={{marginTop:10,padding:'11px',borderRadius:14,background:'linear-gradient(135deg,#007AFF,#5856D6)',textAlign:'center'}}>
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
        <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:12,marginBottom:4}}>
          <span className="tap" onClick={()=>setView('terms')} style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>Условия использования</span>
          <span style={{color:'var(--sep-opaque)'}}>|</span>
          <span className="tap" onClick={()=>setView('privacy')} style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>Конфиденциальность</span>
        </div>
        <div className="tap" onClick={onLogout} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px',textAlign:'center',marginTop:8}}>
          <span style={{fontSize:15,fontWeight:500,color:'#FF3B30',fontFamily:FT}}>Выйти из аккаунта</span>
        </div>
      </div>
    </div>
  );
}

// ─── ETHNOMIR TAB ────────────────────────────────────────────>\u0414\u043b\u044f \u0433\u043e\u0441\u0442\u0435\u0439</div>
        <div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[["M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z","\u041a\u0430\u043a \u0434\u043e\u0431\u0440\u0430\u0442\u044c\u0441\u044f","directions"],["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z","\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043e\u0442\u0432\u0435\u0442\u044b","faq"],["M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z","\u041e\u0442\u0437\u044b\u0432\u044b \u0433\u043e\u0441\u0442\u0435\u0439","reviews"],["M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z","\u0421\u0442\u0430\u0442\u044c\u0438","articles"]].map(([ic,t,s]:any,i:number)=>(
            <div key={i} className="tap fu" onClick={()=>onLanding&&onLanding(s)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:i<3?"0.5px solid var(--sep)":"none"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--label2)" style={{flexShrink:0,opacity:.6}}><path d={ic}/></svg>
              <div style={{fontSize:15,fontWeight:500,color:"var(--label)",fontFamily:FT,flex:1}}>{t}</div><span style={{fontSize:17,color:"var(--label4)"}}>\u203a</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:13,fontWeight:600,color:"var(--label2)",fontFamily:FT,textTransform:"uppercase",letterSpacing:"1px",marginTop:16,marginBottom:6,padding:"0 4px"}}>{"\u041e \u043f\u0430\u0440\u043a\u0435"}</div>
        <div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[["M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z","\u042d\u0442\u043d\u043e\u043c\u0438\u0440 2030","ethnomir2030"],["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z","\u042d\u043a\u043e\u043b\u043e\u0433\u0438\u044f","recycling"],["M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2z","\u0421\u0435\u043b\u044c\u0441\u043a\u043e\u0435 \u0445\u043e\u0437\u044f\u0439\u0441\u0442\u0432\u043e","farm"]].map(([ic,t,s]:any,i:number)=>(
            <div key={"b"+i} className="tap fu" onClick={()=>onLanding&&onLanding(s)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:i<2?"0.5px solid var(--sep)":"none"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--label2)" style={{flexShrink:0,opacity:.6}}><path d={ic}/></svg>
              <div style={{fontSize:15,fontWeight:500,color:"var(--label)",fontFamily:FT,flex:1}}>{t}</div><span style={{fontSize:17,color:"var(--label4)"}}>\u203a</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:13,fontWeight:600,color:"var(--label2)",fontFamily:FT,textTransform:"uppercase",letterSpacing:"1px",marginTop:16,marginBottom:6,padding:"0 4px"}}>{"\u041f\u0440\u043e\u0435\u043a\u0442\u044b"}</div>
        <div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[["M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z","\u041d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c","realty"],["M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z","\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u0438","jobs"],["M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z","\u0411\u043b\u0430\u0433\u043e\u0442\u0432\u043e\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c","charity"],["M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z","\u041e\u0441\u043d\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430","founder"],["M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z","\u0421\u043e\u0433\u043b\u0430\u0441\u0438\u0435 \u043d\u0430 \u0434\u0430\u043d\u043d\u044b\u0435","agreement"]].map(([ic,t,s]:any,i:number)=>(
            <div key={"c"+i} className="tap fu" onClick={()=>onLanding&&onLanding(s)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:i<4?"0.5px solid var(--sep)":"none"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--label2)" style={{flexShrink:0,opacity:.6}}><path d={ic}/></svg>
              <div style={{fontSize:15,fontWeight:500,color:"var(--label)",fontFamily:FT,flex:1}}>{t}</div><span style={{fontSize:17,color:"var(--label4)"}}>\u203a</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heritage Timeline */}
      {heritage.length>0&&(
        <div id="ethno-heritage" style={{padding:"0 20px 16px"}}>
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
            <div key={j} className="tap" onClick={()=>fn&&fn()} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderLeft:"3px solid transparent",borderBottom:j<a.length-1?"0.5px solid var(--sep)":"none"}}>
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
              <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:3}}>Отзывы</div>
              <div className="tap" onClick={()=>onLanding&&onLanding('reviews')} style={{borderRadius:16,background:'linear-gradient(135deg,#FF9500 0%,#FF6B00 100%)',padding:'20px',marginTop:12,cursor:'pointer'}}>
                <div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD}}>{revs.length>0?(revs.reduce((s:number,r:any)=>s+(r.rating||0),0)/revs.length).toFixed(1):'—'} ⭐</div>
                <div style={{fontSize:15,fontWeight:600,color:'#fff',fontFamily:FT,marginTop:4}}>{revs.length} отзывов посетителей</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',fontFamily:FT,marginTop:4}}>Парк · Отели · Рестораны · Туры · МК</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:12,padding:'8px 16px',borderRadius:20,background:'rgba(255,255,255,0.25)',backdropFilter:'blur(10px)'}}><span style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:FT}}>Читать все отзывы →</span></div>
              </div>
              
              {([] as any[]).map((rv:any,i:number)=>(
                <div key={rv.id||i} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px 16px',marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:20}}>{rv.author_emoji||'👤'}</span><span style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{_s(rv.author_name||'Гость')}</span></div>
                    <div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(n=>(<span key={n} style={{fontSize:12,color:n<=(rv.rating||0)?'#FF9500':'var(--sep)'}}>{n<=(rv.rating||0)?'★':'☆'}</span>))}</div>
                  </div>
                  {rv.item_name&&<div style={{fontSize:11,color:'var(--blue)',fontFamily:FT,marginBottom:4}}>{_s(rv.item_name)}</div>}
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5}}>{_s(rv.comment)}</div>
                  <div style={{fontSize:11,color:'var(--label4)',fontFamily:FT,marginTop:6}}>{new Date(rv.created_at).toLocaleDateString('ru')}</div>
                </div>
              ))}
            </div>
            <div style={{padding:'20px',textAlign:'center'}}>
              <div style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FD}}>Крупнейший парк РФ</div>
              <div style={{marginTop:14,fontSize:12,color:'var(--label3)',fontFamily:FT,lineHeight:1.7}}>С 9:00 до 21:00 ежедневно<br/>+7 (495) 023-43-49</div>
              <div style={{marginTop:14}}><span className="tap" onClick={()=>window.open('https://billionsx.com','_blank')} style={{fontSize:11,color:'var(--label4)',cursor:'pointer'}}>Разработчик приложения billionsx.com</span></div>
            </div>
    </div>
  );
}

// ─── TAB BAR ──────────────────────────────────────────────
function TabBar({ active, onSelect }:{ active:Tab; onSelect:(t:Tab)=>void }) {
  const _dragging = React.useRef(false);
  const _dragX = React.useRef(0);
  const _pillRef = React.useRef<HTMLDivElement>(null);
  const _barRef = React.useRef<HTMLDivElement>(null);
  const _longPress = React.useRef<any>(null);
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
        display:"flex",alignItems:"center",justifyContent:"space-around",position:"relative",overflow:"hidden",
        height:54,borderRadius:32,
        background:"rgba(255,255,255,0.22)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
        backdropFilter:"blur(50px) saturate(200%)",
        WebkitBackdropFilter:"blur(50px) saturate(200%)",
        border:"0.5px solid rgba(255,255,255,0.35)",
        boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.4)",
      }}>
        {/* iOS 26+ Liquid Glass Pill */}
        <div ref={_pillRef} style={{position:"absolute",top:2,bottom:2,width:(100/tabs.length)+"%",left:0,transform:"translateX("+(tabs.findIndex(t=>t[0]===active)*100)+"%)",transition:_dragging.current?"none":"transform 0.55s cubic-bezier(0.32,0.72,0,1), box-shadow 0.3s",pointerEvents:"none",zIndex:0,padding:"0 4px",boxSizing:"border-box"}}>
          <div style={{width:"100%",height:"100%",borderRadius:20,background:"rgba(255,255,255,0.5)",backdropFilter:"blur(20px) saturate(200%)",WebkitBackdropFilter:"blur(20px) saturate(200%)",boxShadow:_dragging.current?"0 0 0 3.5px rgba(130,220,255,0.7), 0 0 35px 14px rgba(80,170,255,0.35), 0 0 30px 10px rgba(255,100,220,0.28), 0 0 55px 20px rgba(160,80,255,0.18)":"0 0 0 2px rgba(140,210,255,0.35), 0 0 12px 4px rgba(120,190,255,0.18), 0 0 10px 3px rgba(255,130,220,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",animation:_dragging.current?"none":"glassShimmer 3s ease-in-out infinite",transition:"background 0.35s cubic-bezier(0.32,0.72,0,1), box-shadow 0.35s, transform 0.4s cubic-bezier(0.32,0.72,0,1)",transform:_dragging.current?"scale(1.22)":"scale(1.06)"}}/>
        </div>
        {tabs.map(([id,label,renderIcon],idx)=>{
          const on = active===id;
          return (
            <div key={id} ref={idx===0?_barRef:undefined}
              onClick={()=>{if(!_dragging.current){onSelect(id);logActivity('tab_switch',{tab:id});/* Pulse animation on tap */const pill=_pillRef.current;if(pill&&pill.firstChild){const el=pill.firstChild as HTMLElement;el.style.animation="none";el.offsetHeight;el.style.animation="tabPulse 0.5s cubic-bezier(0.32,0.72,0,1)";/* Flash holographic glow */el.style.boxShadow="0 0 0 3.5px rgba(130,220,255,0.65), 0 0 30px 12px rgba(80,170,255,0.3), 0 0 25px 8px rgba(255,100,220,0.22), 0 0 45px 16px rgba(160,80,255,0.15)";setTimeout(()=>{el.style.boxShadow="";el.style.animation="glassShimmer 3s ease-in-out infinite";},500);}}}}
              onTouchStart={(e:any)=>{const cx=e.touches[0].clientX;_longPress.current=setTimeout(()=>{_dragging.current=true;_dragX.current=cx;if(navigator.vibrate)navigator.vibrate(12);const pill=_pillRef.current;if(pill)pill.style.transition="none";},250);}}
              onTouchMove={(e:any)=>{if(!_dragging.current){clearTimeout(_longPress.current);return;}
                const bar=_barRef.current?.parentElement;if(!bar)return;
                const rect=bar.getBoundingClientRect();
                const x=e.touches[0].clientX-rect.left;
                const tabW=rect.width/tabs.length;
                const ni=Math.max(0,Math.min(tabs.length-1,Math.floor(x/tabW)));
                // Move pill to follow finger
                const pill=_pillRef.current;
                if(pill){pill.style.transform="translateX("+(x-tabW/2)+"px)";pill.style.transition="none";}
                if(tabs[ni][0]!==active){onSelect(tabs[ni][0]);if(navigator.vibrate)navigator.vibrate(5);}
              }}
              onTouchEnd={()=>{clearTimeout(_longPress.current);
                _dragging.current=false;
                const pill=_pillRef.current;
                if(pill){pill.style.transition="transform 0.55s cubic-bezier(0.32,0.72,0,1)";pill.style.transform="translateX("+(tabs.findIndex(t=>t[0]===active)*100)+"%)";
                  // Remove holographic shadow after settling
                  setTimeout(()=>{if(pill.firstChild)((pill.firstChild as HTMLElement).style.boxShadow)="none";},300);
                }
              }}
              style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,flex:1,height:"100%",cursor:"pointer",position:"relative",zIndex:1,WebkitTapHighlightColor:"transparent"}}>
              <div style={{transition:"transform 0.4s cubic-bezier(0.32,0.72,0,1)",transform:on?"scale(1.1)":"scale(0.92)"}}>{renderIcon(on)}</div>
              <span style={{fontSize:10,fontFamily:FT,fontWeight:on?600:400,color:on?"#007AFF":"#000",opacity:on?1:0.85,transition:"all 0.35s",letterSpacing:"-.1px"}}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TICKETS ──────────────────────────────────────────────
function TicketScreen({onClose,cart,setCart,userId,showCartToast}:{onClose:()=>void,cart:CartItem[],setCart:(c:CartItem[])=>void,userId?:string,showCartToast?:(m:string)=>void,onCalendar?:()=>void}) {
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
          <div className="tap" onClick={()=>{tickets.forEach((tk:any)=>{const q=qty[tk.id]||0;if(q>0){const p=isWeekend?tk.price_weekend:tk.price_weekday;const nc=addToCart(cart,setCart,{cat:"ticket",itemId:tk.id,name:tk.name_ru,emoji:tk.cover_emoji||"🎫",qty:q,price:p});syncCartToDB(nc,userId);}});showCartToast&&showCartToast("Билеты добавлены");onClose();}} style={{padding:"16px",borderRadius:16,background:"var(--blue)",textAlign:"center",boxShadow:"0 4px 16px rgba(0,122,255,.3)"}}>
            <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>В корзину · {total.toLocaleString("ru")} ₽</span>
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
            <input value={srch} onChange={(e:any)=>setSrch(e.target.value)} autoFocus placeholder="Поиск по всему парку..." style={{flex:1,border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)"}}/>
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
function ReviewsLanding({onClose}:{onClose:()=>void}) {
  const [reviews,setReviews]=useState<any[]>([]);
  const [filter,setFilter]=useState('all');
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [rvName,setRvName]=useState('');
  const [rvComment,setRvComment]=useState('');
  const [rvRating,setRvRating]=useState(5);
  const [rvItem,setRvItem]=useState('');
  const [sending,setSending]=useState(false);
  const [sortBy,setSortBy]=useState('new');
  const filters=[{k:'all',l:'Все'},{k:'park',l:'Парк'},{k:'hotel',l:'Отели'},{k:'restaurant',l:'Рестораны'},{k:'tour',l:'Туры'},{k:'masterclass',l:'МК'},{k:'service',l:'Услуги'},{k:'event',l:'События'}];
  useEffect(()=>{sb('reviews','select=id,item_type,item_name,rating,comment,author_name,author_emoji,created_at&order=created_at.desc&limit=500').then(d=>{setReviews(Array.isArray(d)?d:[]);setLoading(false);});},[]);
  const filtered=filter==='all'?reviews:reviews.filter(r=>r.item_type===filter);
  const sorted=sortBy==='top'?[...filtered].sort((a,b)=>(b.rating||0)-(a.rating||0)):filtered;
  const avgAll=reviews.length>0?(reviews.reduce((s:number,r:any)=>s+(r.rating||0),0)/reviews.length).toFixed(1):'0';
  const stats=filters.slice(1).map(f=>{const items=reviews.filter(r=>r.item_type===f.k);return{...f,count:items.length,avg:items.length>0?(items.reduce((s:number,r:any)=>s+(r.rating||0),0)/items.length).toFixed(1):'—'};});
  useEffect(()=>{if(showForm&&!rvName){try{const s=JSON.parse(localStorage.getItem('sb_session')||'null');if(s?.user?.user_metadata?.name)setRvName(s.user.user_metadata.name);else if(s?.user?.id)sb('profiles','select=name&id=eq.'+s.user.id).then((d:any)=>{if(d?.[0]?.name)setRvName(d[0].name);});}catch{}};},[showForm]);const submit=async()=>{if(!rvComment.trim())return;setSending(true);await fetch(SB_URL+'/rest/v1/reviews',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({item_type:rvItem.replace(/[<>]/g,"").match(/тур|экскурс/i)?'tour':rvItem.match(/мастер|класс/i)?'masterclass':rvItem.match(/отел|номер/i)?'hotel':rvItem.match(/бан|спа|хамм/i)?'service':rvItem.match(/ресторан|кафе|кухн/i)?'restaurant':'park',item_id:'manual',item_name:rvItem||'Этномир',rating:rvRating,comment:rvComment,author_name:rvName||'Гость',author_emoji:'👤'})});setReviews(prev=>[{id:'new-'+Date.now(),item_type:'park',item_name:rvItem||'Этномир',rating:rvRating,comment:rvComment,author_name:rvName||'Гость',author_emoji:'👤',created_at:new Date().toISOString()},...prev]);setSending(false);setShowForm(false);setRvComment('');setRvName('');setRvItem('');setRvRating(5);};
  const starDist=[5,4,3,2,1].map(s=>({s,c:reviews.filter(r=>r.rating===s).length,p:reviews.length>0?Math.round(reviews.filter(r=>r.rating===s).length/reviews.length*100):0}));
  return(
    <div style={{position:"fixed",inset:0,zIndex:250,background:"var(--bg)",display:"flex",flexDirection:"column",overflow:"hidden",margin:"0 auto",maxWidth:390,width:"100%"}}>
      <div style={{padding:"max(54px, env(safe-area-inset-top, 54px)) 20px 12px",background:"rgba(242,242,247,0.94)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div className="tap" onClick={onClose} style={{display:"flex",alignItems:"center",gap:6}}><svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:17,color:"#007AFF",fontFamily:FT}}>Назад</span></div>
        <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FD}}>Отзывы</div>
        <div style={{width:60}}/>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        {/* Hero */}
        <div style={{padding:"20px",background:"linear-gradient(135deg,#FF9500 0%,#FF6B00 100%)",margin:"0 0 16px"}}>
          <div style={{fontSize:48,fontWeight:800,color:"#fff",fontFamily:FD}}>{avgAll}</div>
          <div style={{display:"flex",gap:2,marginBottom:4}}>{[1,2,3,4,5].map(n=>(<span key={n} style={{fontSize:20,color:n<=Math.round(Number(avgAll))?'#fff':'rgba(255,255,255,0.4)'}}>{n<=Math.round(Number(avgAll))?'★':'☆'}</span>))}</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,0.85)",fontFamily:FT}}>{reviews.length} отзывов</div>
          {/* Star distribution */}
          <div style={{marginTop:12}}>{starDist.map(s=>(<div key={s.s} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span style={{fontSize:11,color:"rgba(255,255,255,0.7)",width:14,textAlign:"right",fontFamily:FT}}>{s.s}</span><div style={{flex:1,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}><div style={{width:s.p+"%",height:"100%",borderRadius:2,background:"#fff"}}/></div><span style={{fontSize:11,color:"rgba(255,255,255,0.7)",width:28,fontFamily:FT}}>{s.c}</span></div>))}</div>
        </div>
        {/* Category stats */}
        <div style={{padding:"0 20px 12px",display:"flex",flexWrap:"wrap",gap:8}}>{stats.map(s=>(<div key={s.k} style={{borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:"8px 12px",fontSize:12,fontFamily:FT}}><div style={{fontWeight:600,color:"var(--label)"}}>{s.l}</div><div style={{color:"var(--label3)"}}>{s.avg} ★ · {s.count}</div></div>))}</div>
        {/* Filter pills */}
        <div style={{padding:"0 20px 12px",display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>{filters.map(f=>(<div key={f.k} className="tap" onClick={()=>setFilter(f.k)} style={{padding:"7px 16px",borderRadius:20,background:filter===f.k?"#007AFF":"var(--fill4)",color:filter===f.k?"#fff":"var(--label)",fontSize:13,fontWeight:600,fontFamily:FT,whiteSpace:"nowrap",flexShrink:0}}>{f.l}</div>))}</div>
        {/* Sort + Write */}
        <div style={{padding:"0 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:8}}>{[{k:'new',l:'Новые'},{k:'top',l:'Лучшие'}].map(s=>(<div key={s.k} className="tap" onClick={()=>setSortBy(s.k)} style={{fontSize:13,fontWeight:sortBy===s.k?700:400,color:sortBy===s.k?"var(--label)":"var(--label3)",fontFamily:FT}}>{s.l}</div>))}</div>
          <div className="tap" onClick={()=>setShowForm(true)} style={{padding:"7px 16px",borderRadius:20,background:"#007AFF"}}><span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>Написать отзыв</span></div>
        </div>
        {/* Reviews list */}
        <div style={{padding:"0 20px 100px"}}>
          {loading&&<div style={{textAlign:"center",padding:40}}><Spinner/></div>}
          {!loading&&sorted.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--label3)",fontFamily:FT}}>Нет отзывов</div>}
          {sorted.map((rv:any,i:number)=>(<div key={rv.id||i} style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>{rv.author_emoji||'👤'}</span><div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{_s(rv.author_name||'Гость')}</div><div style={{fontSize:11,color:"var(--label4)",fontFamily:FT}}>{new Date(rv.created_at).toLocaleDateString('ru',{day:'numeric',month:'long',year:'numeric'})}</div></div></div>
              <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=>(<span key={n} style={{fontSize:14,color:n<=(rv.rating||0)?'#FF9500':'var(--sep)'}}>{n<=(rv.rating||0)?'★':'☆'}</span>))}</div>
            </div>
            {rv.item_name&&<div style={{display:"inline-block",padding:"2px 8px",borderRadius:8,background:"rgba(0,122,255,0.08)",fontSize:11,color:"#007AFF",fontFamily:FT,marginBottom:6}}>{_s(rv.item_name)}</div>}
            <div style={{fontSize:14,color:"var(--label)",fontFamily:FT,lineHeight:1.55}}>{_s(rv.comment)}</div>
          </div>))}
        </div>
      </div>
      {/* Write review modal */}
      {showForm&&(<div style={{position:"fixed",inset:0,zIndex:260,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={(e:any)=>{if(e.target===e.currentTarget)setShowForm(false)}}>
        <div className="ios-sheet" style={{background:"var(--bg2)",borderRadius:"28px 28px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:390,maxHeight:"80vh",overflowY:"auto"}}>
          <div style={{width:36,height:5,borderRadius:3,background:"var(--sep)",margin:"0 auto 16px"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{editingRv?"Редактировать отзыв":"Новый отзыв"}</div><div className="tap" onClick={()=>setShowForm(false)} style={{width:30,height:30,borderRadius:15,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,color:"var(--label3)"}}>✕</span></div></div>
          <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:6}}>Оценка</div><div style={{display:"flex",gap:8}}>{[1,2,3,4,5].map(n=>(<div key={n} className="tap" onClick={()=>setRvRating(n)} style={{fontSize:36,cursor:"pointer",color:n<=rvRating?"#FF9500":"#C7C7CC",lineHeight:1}}>{n<=rvRating?"★":"★"}</div>))}</div></div>
          <div style={{borderRadius:12,background:"var(--bg)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:14}}>
            <input value={rvName} onChange={(e:any)=>setRvName(e.target.value)} placeholder="Ваше имя" style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box"}}/>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <select value={rvItem} onChange={(e:any)=>setRvItem(e.target.value)} style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:rvItem?"var(--label)":"var(--label4)",boxSizing:"border-box",WebkitAppearance:"none",appearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 16px center"}}><option value="">Что посетили?</option><option value="Этномир">Парк Этномир</option><option value="Отель">Отель</option><option value="Ресторан">Ресторан / Кафе</option><option value="Экскурсия">Экскурсия / Тур</option><option value="Мастер-класс">Мастер-класс</option><option value="Баня / СПА">Баня / СПА</option><option value="Мероприятие">Мероприятие / Фестиваль</option><option value="Прокат / Развлечения">Прокат / Развлечения</option><option value="Другое">Другое</option></select>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <textarea value={rvComment} onChange={(e:any)=>setRvComment(e.target.value)} placeholder="Ваш отзыв..." rows={4} style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box",resize:"none"}}/>
          </div>
          <div className="tap" onClick={submit} style={{borderRadius:14,background:sending?"var(--fill4)":"#007AFF",padding:"15px",textAlign:"center"}}><span style={{fontSize:16,fontWeight:600,color:sending?"var(--label3)":"#fff",fontFamily:FT}}>{sending?"Отправка...":"Отправить отзыв"}</span></div>
        </div>
      </div>)}
    </div>
  );
}

function UniversalLanding({slug,onClose,onNav,onBuy}:{slug:string,onClose:()=>void,onNav?:(t:string,s?:string)=>void,onBuy?:()=>void}) {
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [cooldown,setCooldown]=useState(0);
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
  if(loading) return <div style={{position:"fixed",inset:0,zIndex:250,background:"#0a1028",display:"flex",alignItems:"center",justifyContent:"center"}}><Spinner/></div>;
  if(!data) return <div style={{position:"fixed",inset:0,zIndex:250,background:"#0a1028",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{color:"rgba(255,255,255,.5)",fontFamily:FT}}>Страница не найдена</div><div className="tap" onClick={onClose} style={{color:"#007AFF",fontFamily:FT}}>Назад</div></div>;
  const ac=data.accent_color||'#34C759';
  const bg=data.hero_gradient||'#000';
  const G=48;
  const secs=data.sections||[];
  const renderSection=(s:any,idx:number)=>{
    const lc=s.lc||ac;
    if(s.type==='tagline') return <div key={idx} className="ul-a" style={{padding:G+"px 24px",background:bg,textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.25}}>{s.text}</div></div>;
    if(s.type==='stats') return <div key={idx} style={{padding:"0 20px "+G+"px",background:bg}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{(s.items||[]).map(([v,l,c]:any,i:number)=>(<div key={i} className={"ul-a ul-d"+i} style={{borderRadius:18,background:c+"0a",border:"1px solid "+c+"15",padding:"22px 12px",textAlign:"center"}}><div style={{fontSize:32,fontWeight:700,letterSpacing:"-1px",color:c,fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:4,textTransform:"uppercase",letterSpacing:1}}>{l}</div></div>))}</div></div>;
    if(s.type==='cards') return <div key={idx} style={{padding:"0 20px "+G+"px",background:bg}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div>{(s.items||[]).map(([ic,t,d,bg]:any,i:number)=>(<div key={i} className={"ul-a ul-d"+(i%4)} style={{borderRadius:16,padding:"18px",background:"linear-gradient(135deg,"+bg+",#0d0d14)",marginBottom:8}}><div style={{fontSize:28,marginBottom:8}}>{ic}</div><div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:FD}}>{t}</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,lineHeight:1.5,marginTop:4}}>{d}</div></div>))}</div>;
    if(s.type==='list') return <div key={idx} style={{padding:"0 20px "+G+"px",background:bg}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div><div className="ul-a" style={{borderRadius:16,background:"rgba(255,255,255,.025)",border:"0.5px solid rgba(255,255,255,.05)",overflow:"hidden"}}>{(s.items||[]).map((t:string,i:number)=>(<div key={i} style={{padding:"14px 18px",borderBottom:i<(s.items||[]).length-1?"0.5px solid rgba(255,255,255,.04)":"none",display:"flex",gap:10,alignItems:"center"}}><div style={{width:6,height:6,borderRadius:3,transition:"all 0.4s cubic-bezier(0.2,0.8,0.2,1)",background:ac,flexShrink:0,opacity:.6}}/><div style={{fontSize:14,color:"rgba(255,255,255,.55)",fontFamily:FT}}>{t}</div></div>))}</div></div>;
    if(s.type==='steps') return <div key={idx} style={{padding:"0 20px "+G+"px",background:bg}}><div className="ul-a" style={{textAlign:"center",marginBottom:16}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div>{(s.items||[]).map(([ic,t,d]:any,i:number)=>(<div key={i} className={"ul-a ul-d"+(i%4)} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i<(s.items||[]).length-1?"0.5px solid rgba(255,255,255,.04)":"none"}}><div style={{fontSize:18}}>{ic}</div><div><div style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FD}}>{t}</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,marginTop:2}}>{d}</div></div></div>))}</div>;
    if(s.type==='quote') return <div key={idx} className="ul-a" style={{padding:G+"px 24px",background:"linear-gradient(180deg,#0d2818,#1a4a2e,#0d2818)",textAlign:"center"}}><div style={{fontSize:36,marginBottom:10}}>{s.emoji||'💬'}</div><div style={{fontSize:19,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.3px",lineHeight:1.3,fontStyle:"italic"}}>{s.text}</div>{s.author&&<div style={{fontSize:12,color:"rgba(255,255,255,.3)",fontFamily:FT,marginTop:10}}>{s.author}</div>}</div>;
    if(s.type==='text') return <div key={idx} className="ul-a" style={{padding:"0 24px "+G+"px",background:bg}}><div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:8}}>{s.title}</div><div style={{fontSize:14,color:"rgba(255,255,255,.45)",fontFamily:FT,lineHeight:1.6}}>{s.content}</div></div>;
    if(s.type==='form') return <div key={idx} id={"ul-form-"+slug} className="ul-a" style={{padding:G+"px 24px",background:bg,textAlign:"center"}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:ac,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:8}}>{s.label}</div>}<div style={{fontSize:36,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-1px"}}>{s.title}</div>{s.subtitle&&<div style={{fontSize:14,color:"rgba(255,255,255,.35)",fontFamily:FT,marginTop:6,marginBottom:24}}>{s.subtitle}</div>}{sent?(<div style={{borderRadius:18,background:"rgba(52,199,89,.06)",border:"1px solid rgba(52,199,89,.12)",padding:"32px 16px"}}><div style={{fontSize:40,marginBottom:6}}>✅</div><div style={{fontSize:18,fontWeight:700,color:"#34C759",fontFamily:FD}}>Отправлено!</div><div style={{fontSize:13,color:"rgba(255,255,255,.3)",fontFamily:FT,marginTop:4}}>Мы свяжемся с вами.</div></div>):(<div style={{textAlign:"left"}}><div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.25)",fontFamily:FT,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Имя</div><input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Иван Иванов" style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",fontSize:16,fontFamily:FT,color:"#fff",outline:"none"}}/></div><div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.25)",fontFamily:FT,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Телефон</div><input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",fontSize:16,fontFamily:FT,color:"#fff",outline:"none"}}/></div>{err&&<div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,textAlign:"center",marginBottom:8}}>{err}</div>}<div className="tap" onClick={submit} style={{height:50,borderRadius:14,background:ac,display:"flex",alignItems:"center",justifyContent:"center",opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>{sending?"Отправка...":"Отправить"}</span></div></div>)}</div>;
    if(s.type==='hero_image') return <div key={idx} className="ul-a hero-img" style={{position:"relative",height:360,borderRadius:0,overflow:"hidden",marginBottom:0}}><img src={s.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",top:0,left:0}}/><div style={{position:"absolute",inset:0,background:s.gradient||"linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.85) 100%)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"40px 24px 32px"}}>{s.label&&<div style={{fontSize:11,fontWeight:700,color:lc,letterSpacing:2.5,textTransform:"uppercase",fontFamily:FT,marginBottom:8}}>{s.label}</div>}<div style={{fontSize:34,fontWeight:800,color:"#fff",fontFamily:FD,letterSpacing:"-1px",lineHeight:1.1,marginBottom:8}}>{s.title}</div>{s.subtitle&&<div style={{fontSize:15,color:"rgba(255,255,255,.65)",fontFamily:FT,lineHeight:1.5,maxWidth:320}}>{s.subtitle}</div>}</div></div>;
    if(s.type==='feature') return <div key={idx} className="ul-a" style={{padding:"0 0 "+G+"px",background:bg}}><div style={{borderRadius:20,overflow:"hidden",margin:"0 20px"}}><div style={{position:"relative",height:220}}><img src={s.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div><div style={{padding:"20px 20px 24px",background:"rgba(255,255,255,.03)",borderTop:"0.5px solid rgba(255,255,255,.06)"}}>{s.label&&<div style={{fontSize:11,fontWeight:700,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.3px",marginBottom:8}}>{s.title}</div><div style={{fontSize:14,color:"rgba(255,255,255,.5)",fontFamily:FT,lineHeight:1.6}}>{s.body}</div>{s.action&&<div className="tap" onClick={()=>{if(s.action==="tickets"){if(onBuy)onBuy();else if(onClose)onClose();}else if(s.action==="request")setShowForm(true);else if(s.action&&onNav)onNav(s.action,s.sub||"");}} style={{display:"inline-flex",marginTop:14,padding:"10px 20px",borderRadius:12,background:lc+"18",color:lc,fontSize:14,fontWeight:600,fontFamily:FT}}>{s.cta_text||"Подробнее"}</div>}</div></div></div>;
    if(s.type==='products') return <div key={idx} style={{padding:"0 0 "+G+"px",background:bg}}><div className="ul-a" style={{textAlign:"center",padding:"0 24px",marginBottom:16}}>{s.label&&<div style={{fontSize:11,fontWeight:700,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:28,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.5px"}}>{s.title}</div></div><div style={{display:"flex",gap:12,overflowX:"auto",padding:"0 20px",scrollSnapType:"x mandatory"}}>{(s.items||[]).map((p:any,i:number)=>(<div key={i} className={"ul-a ul-d"+i+" tap"} onClick={()=>{if(s.nav&&onNav){onNav(s.nav,s.nav_sub||"");onClose&&onClose();}}} style={{minWidth:220,borderRadius:18,overflow:"hidden",scrollSnapAlign:"start",flexShrink:0,background:"rgba(255,255,255,.04)",border:"0.5px solid rgba(255,255,255,.06)"}}><div style={{height:140,position:"relative"}}><img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>{p.price&&<div style={{position:"absolute",bottom:8,right:8,padding:"4px 10px",borderRadius:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(10px)",fontSize:13,fontWeight:700,color:"#fff",fontFamily:FT}}>{"от "+p.price+" \u20bd"}</div>}</div><div style={{padding:"12px 14px 14px"}}><div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:3}}>{p.name}</div><div style={{fontSize:12,color:"rgba(255,255,255,.4)",fontFamily:FT}}>{p.caption}</div>{p.rating&&<div style={{marginTop:6,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:"#FF9F0A"}}>\u2605</span><span style={{fontSize:12,color:"rgba(255,255,255,.5)",fontFamily:FT}}>{p.rating}</span></div>}</div></div>))}</div></div>;
    if(s.type==='quote') return <div key={idx} className="ul-a" style={{padding:G+"px 24px",background:bg,textAlign:"center"}}><div style={{fontSize:48,color:lc,lineHeight:1,marginBottom:8}}>\u201C</div><div style={{fontSize:18,fontWeight:500,color:"rgba(255,255,255,.75)",fontFamily:FT,lineHeight:1.6,fontStyle:"italic",maxWidth:340,margin:"0 auto"}}>{s.text}</div>{s.author&&<div style={{marginTop:12,fontSize:13,color:"rgba(255,255,255,.3)",fontFamily:FT}}>{s.author}</div>}</div>;
    if(s.type==='gallery') return <div key={idx} style={{padding:"0 0 "+G+"px",background:bg}}>{s.title&&<div className="ul-a" style={{textAlign:"center",marginBottom:16,padding:"0 24px"}}>{s.label&&<div style={{fontSize:12,fontWeight:600,color:lc,letterSpacing:2,textTransform:"uppercase",fontFamily:FT,marginBottom:6}}>{s.label}</div>}<div style={{fontSize:32,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.8px"}}>{s.title}</div></div>}<div style={{display:"flex",gap:10,overflowX:"auto",padding:"0 20px",scrollSnapType:"x mandatory"}}>{(s.items||[]).map((img:any,i:number)=>(<div key={i} className={"ul-a ul-d"+i} style={{minWidth:260,height:180,borderRadius:16,overflow:"hidden",scrollSnapAlign:"start",flexShrink:0,position:"relative"}}><img src={typeof img==="string"?img:img.url} alt={typeof img==="string"?"":img.caption||""} style={{width:"100%",height:"100%",objectFit:"cover"}}/>{typeof img!=="string"&&img.caption&&<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"8px 12px",background:"linear-gradient(transparent,rgba(0,0,0,.7))",fontSize:12,color:"#fff",fontFamily:FT}}>{img.caption}</div>}</div>))}</div></div>;
    if(!["tagline","stats","text","list","cards","gallery","cta","hero_image","feature","products","quote","form"].includes(s.type)) return null;
          if(s.type==='cta') return <div key={idx} className="ul-a" className="ul-a" style={{padding:G+"px 24px",background:bg,textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:6}}>{s.title}</div>{s.subtitle&&<div style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:FT,marginBottom:16}}>{s.subtitle}</div>}<div className="tap" onClick={()=>{if(s.action==="tickets"){if(onBuy)onBuy();else if(onClose)onClose();}else if(s.action==="request"){setShowForm(true);}else if(s.action==="stay"&&onNav){onNav("stay",s.sub||"");}else if(s.action==="tours"&&onNav){onNav("tours",s.sub||"");}else if(s.action==="services"&&onNav){onNav("services",s.sub||"");}else if(s.action==="passport"&&onNav){onNav("passport",s.sub||"");}else if(s.phone){window.location.href="tel:"+s.phone;}else if(s.url){window.open(s.url,"_blank");}else{setShowForm(true);}}} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px 32px",borderRadius:14,background:lc,color:"#fff",fontSize:16,fontWeight:600,fontFamily:FT}}>{s.icon&&<span>{s.icon}</span>}{s.button||"Подробнее"}</div></div>;
    return null;
  };
  return(
    <div className="ios-sheet" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:245,background:bg,display:"flex",flexDirection:"column",overflow:"hidden"}}>
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
        {data.contact_phone&&<div style={{padding:"0 20px "+G+"px",background:bg}}><div className="tap" onClick={()=>window.open('tel:'+data.contact_phone.replace(/[^+0-9]/g,''))} style={{borderRadius:16,background:"rgba(255,255,255,.025)",border:"0.5px solid rgba(255,255,255,.05)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:20,background:ac+"10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📞</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>{data.contact_phone}</div>{data.contact_email&&<div style={{fontSize:11,color:"rgba(255,255,255,.25)",fontFamily:FT,marginTop:1}}>{data.contact_email}</div>}</div></div></div>}
        {/* Footer */}
        <div style={{background:bg,padding:"16px 24px 40px",textAlign:"center",borderTop:"0.5px solid rgba(255,255,255,.03)"}}><div style={{fontSize:11,color:"rgba(255,255,255,.1)",fontFamily:FT}}>© 2008–2026 Этномир. Все права защищены.</div></div>
      </div>
    </div>
  );
}



// --- FRANCHISE LANDING v3 (Apple-level) ---
// ═══════════════════════════════════════════════════════════════
// iOS 26.3.1 ETHNOMIR — FranchiseLandingV2
// Утверждённый макет: light theme, indigo accent, self-contained
// ═══════════════════════════════════════════════════════════════

function BuildLandingV2({onClose,session}:{onClose:()=>void,session?:any}){
const P='#AF52DE',BL='#0284C7',GR='#34C759',OR='#FF9500',RD='#FF3B30',IND='#5856D6';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const[nm,setNm]=(React as any).useState('');const[ph,setPh]=(React as any).useState('');const[sent,setSent]=(React as any).useState(false);const[err,setErr]=(React as any).useState('');const[sending,setSending]=(React as any).useState(false);
const submit=async()=>{if(!nm.trim()||!ph.trim()){setErr('\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u043b\u044f');return;}setSending(true);setErr('');const ok=await submitContactRequest('build','landing_build',nm,ph);if(ok){setSent(true);logActivity('lead_build',{name:nm,phone:ph});}else setErr('\u041e\u0448\u0438\u0431\u043a\u0430');setSending(false);};
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#F3E8FF 0%,#F2F2F7 12%,#F2F2F7 50%,#EDE9FE 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:400,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(21,10,32,.3) 0%,rgba(21,10,32,.85) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,background:'rgba(255,255,255,.15)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',background:'rgba(175,82,222,.85)',backdropFilter:'blur(15px)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0418\u041d\u0412\u0415\u0421\u0422\u0418\u0426\u0418\u0418'}</div><div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u041f\u043e\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0439\u043e\u043d'}</div><div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u0418\u043d\u0432\u0435\u0441\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0432 \u0441\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e \u043d\u043e\u0432\u043e\u0433\u043e \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u0430. \u0417\u0435\u043c\u043b\u044f, \u043f\u0440\u043e\u0435\u043a\u0442, \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435.'}</div></div></div>
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{[{t:'140 \u0433\u0430',l:'\u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044f',c:P},{t:'85',l:'\u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u043e\u0432',c:BL},{t:'250+',l:'\u043f\u043b\u0430\u043d \u0434\u0432\u043e\u0440\u043e\u0432',c:GR},{t:'\u043e\u0442 15M',l:'\u0432\u0445\u043e\u0434 \u20bd',c:OR}].map((s:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:10,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0446\u0435\u043f\u0446\u0438\u044f'}</div><div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0440\u0430\u0441\u0442\u0451\u0442. 85 \u0434\u0432\u043e\u0440\u043e\u0432 \u0441\u0435\u0439\u0447\u0430\u0441, \u043f\u043b\u0430\u043d \u2014 250+. \u041a\u0430\u0436\u0434\u044b\u0439 \u0434\u0432\u043e\u0440 \u2014 \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u0430 \u0441\u0442\u0440\u0430\u043d\u044b: \u0430\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430, \u043a\u0443\u0445\u043d\u044f, \u0440\u0435\u043c\u0451\u0441\u043b\u0430, \u043e\u0442\u0435\u043b\u044c. \u0418\u043d\u0432\u0435\u0441\u0442\u043e\u0440 \u0441\u0442\u0440\u043e\u0438\u0442 \u0438 \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u0442 \u0434\u043e\u0445\u043e\u0434.'}</div></div></div>
{/* INVEST TABLE */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:P,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041c\u041e\u0414\u0415\u041b\u042c'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u0438\u043d\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438'}</div>
<div style={{borderRadius:12,overflow:'hidden',border:'1px solid rgba(60,60,67,.1)'}}>
{[{p:'\u0423\u0447\u0430\u0441\u0442\u043e\u043a',v:'\u043e\u0442 500 \u043c\u00b2'},{p:'\u0421\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c',v:'15\u201380M \u20bd'},{p:'\u0421\u0440\u043e\u043a',v:'8\u201418 \u043c\u0435\u0441.'},{p:'\u041e\u043a\u0443\u043f\u0430\u0435\u043c\u043e\u0441\u0442\u044c',v:'5\u20147 \u043b\u0435\u0442'},{p:'\u0414\u043e\u0445\u043e\u0434\u043d\u043e\u0441\u0442\u044c',v:'15\u201425%/\u0433\u043e\u0434'},{p:'\u0412\u043b\u0430\u0434\u0435\u043d\u0438\u0435',v:'\u0421\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0441\u0442\u044c'}].map((r:any,i:number)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',borderTop:i>0?'1px solid rgba(60,60,67,.06)':'none',background:i%2===0?'#F9FAFB':'#fff'}}><span style={{fontSize:13,fontFamily:FT,color:L2}}>{r.p}</span><span style={{fontSize:13,fontWeight:700,color:P,fontFamily:FD}}>{r.v}</span></div>)}
</div></div></div>
{/* WHAT YOU GET */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u0421\u041e\u0421\u0422\u0410\u0412'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u0427\u0442\u043e \u0432\u0445\u043e\u0434\u0438\u0442 \u0432 \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440'}</div>
{[{e:'\ud83c\udfe0',t:'\u041e\u0442\u0435\u043b\u044c 10\u201430 \u043d\u043e\u043c\u0435\u0440\u043e\u0432',d:'\u0410\u0443\u0442\u0435\u043d\u0442\u0438\u0447\u043d\u0430\u044f \u0430\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0430 \u0441\u0442\u0440\u0430\u043d\u044b',c:P},{e:'\ud83c\udf73',t:'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d \u043d\u0430\u0446. \u043a\u0443\u0445\u043d\u0438',d:'\u0410\u0432\u0442\u043e\u0440\u0441\u043a\u043e\u0435 \u043c\u0435\u043d\u044e \u0441\u0442\u0440\u0430\u043d\u044b-\u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430',c:OR},{e:'\ud83c\udfa8',t:'\u041c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0438\u0435',d:'\u0420\u0435\u043c\u0451\u0441\u043b\u0430 \u0438 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u0438 \u043d\u0430\u0440\u043e\u0434\u0430',c:GR},{e:'\ud83d\uded2',t:'\u0422\u043e\u0440\u0433\u043e\u0432\u044b\u0435 \u0442\u043e\u0447\u043a\u0438',d:'\u0421\u0443\u0432\u0435\u043d\u0438\u0440\u044b, \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u044b, \u0442\u0435\u043a\u0441\u0442\u0438\u043b\u044c',c:BL},{e:'\ud83c\udfad',t:'\u041f\u043b\u043e\u0449\u0430\u0434\u043a\u0430 \u0441\u043e\u0431\u044b\u0442\u0438\u0439',d:'\u0424\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u0438, \u0441\u0432\u0430\u0434\u044c\u0431\u044b, \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u044b',c:IND}].map((f:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:f.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{f.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{f.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{f.d}</div></div></div>)}
</div>
{/* GROWTH */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:GR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0420\u041e\u0421\u0422'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0414\u0438\u043d\u0430\u043c\u0438\u043a\u0430 \u043f\u043e\u0441\u0435\u0449\u0430\u0435\u043c\u043e\u0441\u0442\u0438'}</div>
<svg viewBox="0 0 310 120" style={{width:'100%'}}>
<defs><linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P} stopOpacity="0.3"/><stop offset="100%" stopColor={P} stopOpacity="0"/></linearGradient></defs>
<polyline points="10,100 55,92 100,78 145,65 190,48 235,35 280,18" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
<polygon points="10,100 55,92 100,78 145,65 190,48 235,35 280,18 280,110 10,110" fill="url(#gfill)"/>
{[{x:10,y:100,l:'2018',v:'200K'},{x:55,y:92,l:'2019',v:'350K'},{x:100,y:78,l:'2020',v:'420K'},{x:145,y:65,l:'2021',v:'600K'},{x:190,y:48,l:'2022',v:'750K'},{x:235,y:35,l:'2023',v:'920K'},{x:280,y:18,l:'2024',v:'1.1M'}].map((p:any,i:number)=><g key={i}><circle cx={p.x} cy={p.y} r="4" fill={P}/><text x={p.x} y={p.y-8} textAnchor="middle" fontSize="8" fontWeight="700" fill={P} fontFamily={FT}>{p.v}</text><text x={p.x} y={118} textAnchor="middle" fontSize="7" fill="rgba(60,60,67,.4)" fontFamily={FT}>{p.l}</text></g>)}
</svg>
</div></div>
{/* TIMELINE */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:P,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u042d\u0422\u0410\u041f\u042b'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u041e\u0442 \u0438\u0434\u0435\u0438 \u0434\u043e \u043e\u0442\u043a\u0440\u044b\u0442\u0438\u044f'}</div>
<div style={{background:'#fff',borderRadius:16,overflow:'hidden'}}>
{[{n:'1',t:'\u041a\u043e\u043d\u0446\u0435\u043f\u0446\u0438\u044f',d:'\u0412\u044b\u0431\u043e\u0440 \u0441\u0442\u0440\u0430\u043d\u044b, \u0443\u0447\u0430\u0441\u0442\u043a\u0430, \u0430\u0440\u0445. \u043f\u0440\u043e\u0435\u043a\u0442',c:P},{n:'2',t:'\u0421\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e',d:'\u041f\u0430\u0440\u043a \u043a\u0443\u0440\u0438\u0440\u0443\u0435\u0442 \u043f\u0440\u043e\u0446\u0435\u0441\u0441 \u043f\u043e\u0434 \u043a\u043b\u044e\u0447',c:BL},{n:'3',t:'\u041e\u0441\u043d\u0430\u0449\u0435\u043d\u0438\u0435',d:'\u0418\u043d\u0442\u0435\u0440\u044c\u0435\u0440, \u043c\u0435\u0431\u0435\u043b\u044c, \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435',c:OR},{n:'4',t:'\u0417\u0430\u043f\u0443\u0441\u043a',d:'\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043a \u044d\u043a\u043e\u0441\u0438\u0441\u0442\u0435\u043c\u0435 \u043f\u0430\u0440\u043a\u0430',c:GR}].map((s:any,i:number)=><div key={i} style={{display:'flex',gap:14,padding:'14px 16px',borderBottom:i<3?'1px solid rgba(60,60,67,.1)':'none'}}><div style={{width:32,height:32,borderRadius:16,background:s.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:s.c,fontFamily:FD,flexShrink:0}}>{s.n}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{s.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{s.d}</div></div></div>)}
</div></div>
{/* DONUT */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0414\u041e\u0425\u041e\u0414\u042b'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438 \u0432\u044b\u0440\u0443\u0447\u043a\u0438'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110">
<circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={P} strokeWidth="12" strokeDasharray="106 158" strokeDashoffset="66" strokeLinecap="round"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="66 198" strokeDashoffset="-40" strokeLinecap="round"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-106" strokeLinecap="round"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={GR} strokeWidth="12" strokeDasharray="26 238" strokeDashoffset="-159" strokeLinecap="round"/>
</svg>
<div style={{flex:1}}>
{[{c:P,l:'\u041e\u0442\u0435\u043b\u044c',v:'40%'},{c:OR,l:'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d',v:'25%'},{c:BL,l:'\u041c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0438\u0435',v:'20%'},{c:GR,l:'\u0421\u043e\u0431\u044b\u0442\u0438\u044f',v:'15%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:i<3?8:0}}><div style={{width:10,height:10,borderRadius:5,background:r.c}}/><span style={{fontSize:13,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:13,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}
</div></div>
</div></div>
{/* COMPARISON */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:IND,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0420\u0410\u0412\u041d\u0415\u041d\u0418\u0415'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u042d\u0442\u043d\u043e\u0434\u0432\u043e\u0440 vs \u0410\u043f\u0430\u0440\u0442-\u043e\u0442\u0435\u043b\u044c'}</div>
{[{p:'\u0422\u0440\u0430\u0444\u0438\u043a',a:'\u0413\u043e\u0442\u043e\u0432\u044b\u0439 1M+',b:'\u0421 \u043d\u0443\u043b\u044f'},{p:'\u0420\u0435\u043a\u043b\u0430\u043c\u0430',a:'\u0412\u043a\u043b\u044e\u0447\u0435\u043d\u0430',b:'\u0417\u0430 \u0441\u0447\u0451\u0442 \u0438\u043d\u0432.'},{p:'\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435',a:'\u041f\u0430\u0440\u043a',b:'\u0421\u0430\u043c\u043e\u0441\u0442.'},{p:'\u0414\u043e\u0445\u043e\u0434\u043d.',a:'15\u201425%',b:'8\u201412%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',padding:'10px 0',borderBottom:i<3?'1px solid rgba(60,60,67,.06)':'none'}}><div style={{flex:1,fontSize:13,color:L2,fontFamily:FT}}>{r.p}</div><div style={{flex:1,fontSize:13,fontWeight:700,color:P,fontFamily:FD,textAlign:'center'}}>{r.a}</div><div style={{flex:1,fontSize:13,color:L2,fontFamily:FT,textAlign:'center'}}>{r.b}</div></div>)}
</div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+P}}>
<div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u041a\u0430\u0436\u0434\u044b\u0439 \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440 \u2014 \u043d\u0435 \u0437\u0434\u0430\u043d\u0438\u0435, \u0430 \u043f\u043e\u0441\u043e\u043b\u044c\u0441\u0442\u0432\u043e \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u044b. \u041a\u0430\u0436\u0434\u044b\u0439 \u0438\u043d\u0432\u0435\u0441\u0442\u043e\u0440 \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f \u0441\u043e\u0430\u0432\u0442\u043e\u0440\u043e\u043c \u043c\u0438\u0440\u043e\u0432\u043e\u0433\u043e \u043f\u0440\u043e\u0435\u043a\u0442\u0430.\u00bb'}</div>
<div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u0420\u0443\u0441\u043b\u0430\u043d \u0411\u0430\u0439\u0440\u0430\u043c\u043e\u0432, \u043e\u0441\u043d\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430'}</div>
</div></div>
{/* CTA */}
{sent?<div style={{padding:'16px 20px 0'}}><div style={{borderRadius:16,background:'rgba(52,199,89,.06)',border:'1px solid rgba(52,199,89,.12)',padding:'28px 16px',textAlign:'center'}}><div style={{fontSize:36,marginBottom:4}}>{'\u2705'}</div><div style={{fontSize:17,fontWeight:700,color:GR,fontFamily:FD}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e!'}</div></div></div>
:<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20,textAlign:'center'}}>
<div style={{fontSize:20,fontWeight:800,fontFamily:FD,marginBottom:16}}>{'\u041e\u0431\u0441\u0443\u0434\u0438\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442'}</div>
<div style={{textAlign:'left',marginBottom:10}}><input value={nm} onChange={(e:any)=>setNm(e.target.value)} placeholder={'\u0418\u043c\u044f'} style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid rgba(60,60,67,.1)',background:'#F2F2F7',fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
<div style={{textAlign:'left',marginBottom:16}}><input value={ph} onChange={(e:any)=>setPh(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid rgba(60,60,67,.1)',background:'#F2F2F7',fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
{err&&<div style={{fontSize:13,color:RD,marginBottom:8}}>{err}</div>}
<div className="tap" onClick={submit} style={{height:50,borderRadius:16,background:P,display:'flex',alignItems:'center',justifyContent:'center',opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{sending?'...':'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}</span></div>
</div></div>}
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:18}}>
<div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>invest@ethnomir.ru<br/>ethnomir.ru</div>
</div></div>
<div style={{height:80}}/>
</div>;
}

function DirectionsLandingV2({onClose}:{onClose:()=>void}){
const C='#5AC8FA',BL='#007AFF',GR='#34C759',OR='#FF9500',RD='#FF3B30',PR='#AF52DE';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const[tab,setTab]=(React as any).useState(0);
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#E8F4FD 0%,#F2F2F7 12%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
{/* HERO */}
<div style={{position:'relative',height:320,borderRadius:'0 0 20px 20px',overflow:'hidden'}}>
<img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/>
<div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 0%,rgba(0,0,0,.75) 100%)'}}/>
<div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,background:'rgba(255,255,255,.18)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
<div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}>
<div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',background:'rgba(90,200,250,.85)',backdropFilter:'blur(15px)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u041c\u0410\u0420\u0428\u0420\u0423\u0422'}</div>
<div style={{fontSize:30,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u041a\u0430\u043a \u0434\u043e\u0431\u0440\u0430\u0442\u044c\u0441\u044f'}</div>
<div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u041a\u0430\u043b\u0443\u0436\u0441\u043a\u0430\u044f \u043e\u0431\u043b., \u0411\u043e\u0440\u043e\u0432\u0441\u043a\u0438\u0439 \u0440-\u043d. 90 \u043a\u043c \u043e\u0442 \u041c\u041a\u0410\u0414.'}</div>
</div></div>
{/* ADDRESS CARD */}
<div style={{padding:'24px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{display:'flex',gap:14,alignItems:'center',marginBottom:14}}>
<div style={{width:48,height:48,borderRadius:14,background:C+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{'\ud83d\udccd'}</div>
<div><div style={{fontSize:17,fontWeight:700,fontFamily:FD}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440'}</div>
<div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{'\u041a\u0430\u043b\u0443\u0436\u0441\u043a\u0430\u044f \u043e\u0431\u043b., \u0411\u043e\u0440\u043e\u0432\u0441\u043a\u0438\u0439 \u0440-\u043d, \u0434. \u041f\u0435\u0442\u0440\u043e\u0432\u043e'}</div></div></div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
<div className="tap" onClick={()=>window.open('https://yandex.ru/maps/?pt=36.4167,55.2417&z=14&l=map','_blank')} style={{height:44,borderRadius:12,background:BL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u042f\u043d\u0434\u0435\u043a\u0441 \u041a\u0430\u0440\u0442\u044b'}</span></div>
<div className="tap" onClick={()=>window.open('https://maps.google.com/?q=55.2417,36.4167','_blank')} style={{height:44,borderRadius:12,background:GR,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>Google Maps</span></div>
</div>
</div></div>
{/* TRANSPORT TABS */}
<div style={{padding:'16px 20px 0'}}><div style={{display:'flex',background:'rgba(118,118,128,.12)',borderRadius:10,padding:3,gap:2}}>
{['\ud83d\ude97 \u0410\u0432\u0442\u043e','\ud83d\ude86 \u042d\u043b\u0435\u043a\u0442\u0440.','\ud83d\ude8c \u0410\u0432\u0442\u043e\u0431\u0443\u0441'].map((n:string,i:number)=><div key={i} className="tap" onClick={()=>setTab(i)} style={{flex:1,textAlign:'center',padding:'8px 4px',borderRadius:8,background:tab===i?'#fff':'transparent',boxShadow:tab===i?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .25s'}}><span style={{fontSize:12,fontWeight:tab===i?700:400,color:tab===i?'#000':L2,fontFamily:FT}}>{n}</span></div>)}
</div></div>
{/* TAB CONTENT */}
{tab===0&&<div style={{padding:'12px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:18,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041d\u0430 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u0435'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6,marginBottom:14}}>{'\u041a\u0438\u0435\u0432\u0441\u043a\u043e\u0435 \u0448\u043e\u0441\u0441\u0435 (\u041c3) \u2192 90 \u043a\u043c \u043e\u0442 \u041c\u041a\u0410\u0414 \u2192 \u043f\u043e\u0432\u043e\u0440\u043e\u0442 \u043d\u0430 \u0411\u043e\u0440\u043e\u0432\u0441\u043a \u2192 \u0443\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c \u00ab\u042d\u0442\u043d\u043e\u043c\u0438\u0440\u00bb.'}</div>
{[{v:'1.5 \u0447\u0430\u0441\u0430',l:'\u0432\u0440\u0435\u043c\u044f \u0432 \u043f\u0443\u0442\u0438',c:C},{v:'\u0411\u0435\u0441\u043f\u043b.',l:'\u043f\u0430\u0440\u043a\u043e\u0432\u043a\u0430',c:GR},{v:'90 \u043a\u043c',l:'\u043e\u0442 \u041c\u041a\u0410\u0414',c:BL}].map((s:any,i:number)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<2?'1px solid rgba(60,60,67,.06)':'none'}}><span style={{fontSize:14,color:L2,fontFamily:FT}}>{s.l}</span><span style={{fontSize:15,fontWeight:700,color:s.c,fontFamily:FD}}>{s.v}</span></div>)}
</div></div>}
{tab===1&&<div style={{padding:'12px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:18,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041d\u0430 \u044d\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u043a\u0435'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6,marginBottom:14}}>{'\u041a\u0438\u0435\u0432\u0441\u043a\u0438\u0439 \u0432\u043e\u043a\u0437\u0430\u043b \u2192 \u0441\u0442. \u0411\u0430\u043b\u0430\u0431\u0430\u043d\u043e\u0432\u043e (2 \u0447). \u0414\u0430\u043b\u0435\u0435 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u0448\u0430\u0442\u0442\u043b \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430.'}</div>
{[{v:'2.5 \u0447',l:'\u0432\u0440\u0435\u043c\u044f \u0432 \u043f\u0443\u0442\u0438',c:C},{v:'~450 \u20bd',l:'\u0431\u0438\u043b\u0435\u0442',c:OR},{v:'\u0411\u0435\u0441\u043f\u043b.',l:'\u0448\u0430\u0442\u0442\u043b',c:GR}].map((s:any,i:number)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<2?'1px solid rgba(60,60,67,.06)':'none'}}><span style={{fontSize:14,color:L2,fontFamily:FT}}>{s.l}</span><span style={{fontSize:15,fontWeight:700,color:s.c,fontFamily:FD}}>{s.v}</span></div>)}
</div></div>}
{tab===2&&<div style={{padding:'12px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:18,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041d\u0430 \u0430\u0432\u0442\u043e\u0431\u0443\u0441\u0435'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6,marginBottom:14}}>{'\u0410\u0432\u0442\u043e\u0431\u0443\u0441 \u043e\u0442 \u043c. \u0422\u0451\u043f\u043b\u044b\u0439 \u0421\u0442\u0430\u043d \u2192 \u0411\u043e\u0440\u043e\u0432\u0441\u043a. \u041f\u0435\u0440\u0435\u0441\u0430\u0434\u043a\u0430 \u043d\u0430 \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u043a\u0443 \u0434\u043e \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430.'}</div>
{[{v:'2\u20143 \u0447',l:'\u0432\u0440\u0435\u043c\u044f \u0432 \u043f\u0443\u0442\u0438',c:C},{v:'~600 \u20bd',l:'\u0431\u0438\u043b\u0435\u0442',c:OR},{v:'\u0427\u0430\u0441\u0442\u043e',l:'\u0440\u0435\u0439\u0441\u044b',c:GR}].map((s:any,i:number)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<2?'1px solid rgba(60,60,67,.06)':'none'}}><span style={{fontSize:14,color:L2,fontFamily:FT}}>{s.l}</span><span style={{fontSize:15,fontWeight:700,color:s.c,fontFamily:FD}}>{s.v}</span></div>)}
</div></div>}
{/* COMPARISON */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:C,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0420\u0410\u0412\u041d\u0415\u041d\u0418\u0415'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043f\u043e\u0441\u043e\u0431'}</div>
<div style={{borderRadius:12,overflow:'hidden',border:'1px solid rgba(60,60,67,.1)'}}>
<div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr',background:'#F2F2F7'}}><div style={{padding:'8px 10px',fontSize:10,fontWeight:700,color:L2,fontFamily:FT}}/>{['\ud83d\ude97','\ud83d\ude86','\ud83d\ude8c'].map((e:string,i:number)=><div key={i} style={{padding:'8px 6px',fontSize:16,textAlign:'center'}}>{e}</div>)}</div>
{[{p:'\u0412\u0440\u0435\u043c\u044f',a:'1.5\u0447',b:'2.5\u0447',c2:'2-3\u0447'},{p:'\u0426\u0435\u043d\u0430',a:'\u0411\u0435\u043d\u0437\u0438\u043d',b:'450\u20bd',c2:'600\u20bd'},{p:'\u041a\u043e\u043c\u0444\u043e\u0440\u0442',a:'\u2605\u2605\u2605',b:'\u2605\u2605',c2:'\u2605'},{p:'\u0413\u0438\u0431\u043a\u043e\u0441\u0442\u044c',a:'\u2605\u2605\u2605',b:'\u2605\u2605',c2:'\u2605'}].map((r:any,i:number)=><div key={i} style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr',borderTop:'1px solid rgba(60,60,67,.06)'}}><div style={{padding:'9px 10px',fontSize:12,fontFamily:FT,color:L2}}>{r.p}</div><div style={{padding:'9px 6px',fontSize:12,fontWeight:600,fontFamily:FT,color:BL,textAlign:'center'}}>{r.a}</div><div style={{padding:'9px 6px',fontSize:12,fontWeight:600,fontFamily:FT,color:PR,textAlign:'center'}}>{r.b}</div><div style={{padding:'9px 6px',fontSize:12,fontFamily:FT,color:L2,textAlign:'center'}}>{r.c2}</div></div>)}
</div></div></div>
{/* SHUTTLE */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:GR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0428\u0410\u0422\u0422\u041b'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u0442\u0440\u0430\u043d\u0441\u0444\u0435\u0440'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6,marginBottom:14}}>{'\u041e\u0442 \u0441\u0442. \u0411\u0430\u043b\u0430\u0431\u0430\u043d\u043e\u0432\u043e \u043a\u0443\u0440\u0441\u0438\u0440\u0443\u0435\u0442 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u0448\u0430\u0442\u0442\u043b \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430. \u0420\u0435\u0439\u0441\u044b \u043f\u043e\u0434 \u043f\u0440\u0438\u0431\u044b\u0442\u0438\u0435 \u044d\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u0435\u043a.'}</div>
{['10:30','12:15','14:00','16:30','18:00'].map((t:string,i:number)=><div key={i} style={{display:'inline-flex',height:32,padding:'0 14px',borderRadius:10,lineHeight:'32px',background:GR+'12',fontSize:14,fontWeight:700,color:GR,fontFamily:FD,marginRight:8,marginBottom:8}}>{t}</div>)}
<div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:4}}>{'\u0420\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043c\u043e\u0436\u0435\u0442 \u043c\u0435\u043d\u044f\u0442\u044c\u0441\u044f. \u0423\u0442\u043e\u0447\u043d\u044f\u0439\u0442\u0435 \u043f\u043e \u0442\u0435\u043b.'}</div>
</div></div>
{/* PARKING */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0410\u0420\u041a\u041e\u0412\u041a\u0410'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0430\u044f \u043f\u0430\u0440\u043a\u043e\u0432\u043a\u0430'}</div>
{[{e:'\ud83c\udd7f\ufe0f',t:'2000+ \u043c\u0435\u0441\u0442',d:'\u041e\u0445\u0440\u0430\u043d\u044f\u0435\u043c\u0430\u044f \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044f',c:BL},{e:'\ud83d\ude8d',t:'\u0410\u0432\u0442\u043e\u0431\u0443\u0441\u044b',d:'\u041e\u0442\u0434\u0435\u043b\u044c\u043d\u0430\u044f \u0437\u043e\u043d\u0430 \u0434\u043b\u044f \u0433\u0440\u0443\u043f\u043f',c:OR},{e:'\u267f',t:'\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c',d:'\u041c\u0435\u0441\u0442\u0430 \u0434\u043b\u044f \u041c\u041c\u0413 \u0443 \u0432\u0445\u043e\u0434\u0430',c:GR}].map((p:any,i:number)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<2?'1px solid rgba(60,60,67,.06)':'none'}}><div style={{fontSize:24,width:36,textAlign:'center',flexShrink:0}}>{p.e}</div><div><div style={{fontSize:15,fontWeight:600,fontFamily:FD}}>{p.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:1}}>{p.d}</div></div></div>)}
</div></div>
{/* TIPS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u0421\u041e\u0412\u0415\u0422\u042b'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u041f\u043e\u043b\u0435\u0437\u043d\u043e \u0437\u043d\u0430\u0442\u044c'}</div>
{[{e:'\u23f0',t:'\u0412\u044b\u0435\u0437\u0436\u0430\u0439\u0442\u0435 \u0434\u043e 9:00',d:'\u0418\u0437\u0431\u0435\u0436\u0438\u0442\u0435 \u043f\u0440\u043e\u0431\u043e\u043a \u043d\u0430 \u041a\u0438\u0435\u0432\u0441\u043a\u043e\u043c \u0448\u043e\u0441\u0441\u0435'},{e:'\ud83d\udcf1',t:'\u041d\u0430\u0432\u0438\u0433\u0430\u0442\u043e\u0440',d:'\u0412\u0431\u0435\u0439\u0442\u0435 \u00ab\u042d\u0442\u043d\u043e\u043c\u0438\u0440\u00bb \u2014 \u0432\u0441\u0435 \u043a\u0430\u0440\u0442\u044b \u0437\u043d\u0430\u044e\u0442'},{e:'\u2615',t:'\u041a\u0430\u0444\u0435 \u043f\u043e \u0434\u043e\u0440\u043e\u0433\u0435',d:'\u0417\u0430\u043f\u0440\u0430\u0432\u043a\u0438 \u0438 \u043a\u0430\u0444\u0435 \u043d\u0430 \u0432\u0441\u0451\u043c \u043f\u0443\u0442\u0438'},{e:'\u2744\ufe0f',t:'\u0417\u0438\u043c\u043e\u0439',d:'\u0414\u043e\u0440\u043e\u0433\u0430 \u0447\u0438\u0441\u0442\u0438\u0442\u0441\u044f, \u043d\u043e \u0432\u043e\u0437\u044c\u043c\u0438\u0442\u0435 \u0446\u0435\u043f\u0438'}].map((t:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{fontSize:22,width:36,textAlign:'center',flexShrink:0}}>{t.e}</div><div><div style={{fontSize:15,fontWeight:700,fontFamily:FD}}>{t.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{t.d}</div></div></div>)}
</div>
{/* CONTACT */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:18}}>
<div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>info@ethnomir.ru<br/>ethnomir.ru</div>
<div className="tap" onClick={()=>window.open('tel:+74950238181')} style={{height:50,borderRadius:16,background:C,display:'flex',alignItems:'center',justifyContent:'center',marginTop:14,cursor:'pointer'}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u041f\u043e\u0437\u0432\u043e\u043d\u0438\u0442\u044c'}</span></div>
</div></div>
<div style={{height:80}}/>
</div>;
}

function FAQLandingV2({onClose,go}:{onClose:()=>void,go?:(t:string)=>void}){
const C='#5AC8FA',BL='#007AFF',GR='#34C759',OR='#FF9500',RD='#FF3B30',PR='#AF52DE';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
const[open,setOpen]=(React as any).useState(-1);
const[cat,setCat]=(React as any).useState(0);
const[srch,setSrch]=(React as any).useState('');
const cats=[{l:'\u0412\u0441\u0435',c:BL},{l:'\u0411\u0438\u043b\u0435\u0442\u044b',c:OR},{l:'\u041f\u0440\u043e\u0436\u0438\u0432\u0430\u043d\u0438\u0435',c:PR},{l:'\u041f\u0430\u0440\u043a',c:GR},{l:'\u0414\u0435\u0442\u0438',c:RD},{l:'\u0421\u0435\u0440\u0432\u0438\u0441',c:C}];
const faqs:any[]=[{q:'\u0421\u043a\u043e\u043b\u044c\u043a\u043e \u0441\u0442\u043e\u0438\u0442 \u0432\u0445\u043e\u0434\u043d\u043e\u0439 \u0431\u0438\u043b\u0435\u0442?',a:'\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0439 \u2014 600 \u20bd, \u0434\u0435\u0442\u0441\u043a\u0438\u0439 (5\u201412 \u043b\u0435\u0442) \u2014 300 \u20bd, \u0434\u043e 5 \u043b\u0435\u0442 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e. \u0412 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0432\u0445\u043e\u0434\u0438\u0442 \u043f\u043e\u0441\u0435\u0449\u0435\u043d\u0438\u0435 \u0423\u043b\u0438\u0446\u044b \u041c\u0438\u0440\u0430, \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u043e\u0432 \u0438 \u043c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u0439 \u043f\u043e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435 \u0434\u043d\u044f.',g:1,btn:{l:'\u041a\u0443\u043f\u0438\u0442\u044c \u0431\u0438\u043b\u0435\u0442',t:'action:tickets',c:OR}},
{q:'\u0427\u0442\u043e \u0432\u0445\u043e\u0434\u0438\u0442 \u0432 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0431\u0438\u043b\u0435\u0442\u0430?',a:'\u041f\u043e\u0441\u0435\u0449\u0435\u043d\u0438\u0435 \u043c\u0443\u0437\u0435\u0435\u0432, \u0432\u044b\u0441\u0442\u0430\u0432\u043e\u043a, \u043c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u043e\u0432 \u0438 \u044d\u043a\u0441\u043a\u0443\u0440\u0441\u0438\u0439 \u043f\u043e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0435 \u0434\u043d\u044f. \u041f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0430 \u2014 \u0432 \u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u0439.',g:1,btn:{l:'\u0427\u0442\u043e \u0432\u0445\u043e\u0434\u0438\u0442',t:'action:tickets',c:OR}},
{q:'\u041a\u0430\u043a\u043e\u0439 \u0440\u0435\u0436\u0438\u043c \u0440\u0430\u0431\u043e\u0442\u044b?',a:'\u041f\u0430\u0440\u043a \u043e\u0442\u043a\u0440\u044b\u0442 \u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u043e \u0441 09:00 \u0434\u043e 21:00. \u041c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u044f \u0434\u043e 19:00. \u0414\u043b\u044f \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u044e\u0449\u0438\u0445 \u2014 \u043a\u0440\u0443\u0433\u043b\u043e\u0441\u0443\u0442\u043e\u0447\u043d\u043e.',g:3},
{q:'\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u043f\u0440\u0438\u0435\u0445\u0430\u0442\u044c \u043d\u0430 \u043e\u0434\u0438\u043d \u0434\u0435\u043d\u044c?',a:'\u0414\u0430, \u043d\u043e \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c \u043c\u0438\u043d\u0438\u043c\u0443\u043c 2 \u0434\u043d\u044f. \u041f\u0430\u0440\u043a \u043e\u0433\u0440\u043e\u043c\u043d\u044b\u0439 \u2014 140 \u0433\u0430, 85 \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u043e\u0432, \u043c\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u0432\u043b\u0435\u0447\u0435\u043d\u0438\u0439 \u043d\u0430 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0434\u043d\u0435\u0439.',g:3,btn:{l:'\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043e\u0442\u0435\u043b\u0438',t:'tab:stay',c:PR}},
{q:'\u041a\u0430\u043a \u0437\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043e\u0442\u0435\u043b\u044c?',a:'\u0427\u0435\u0440\u0435\u0437 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435, \u0441\u0430\u0439\u0442 ethnomir.ru \u0438\u043b\u0438 \u043f\u043e \u0442\u0435\u043b. +7 495 023-81-81. \u0411\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043e\u043f\u043b\u0430\u0442\u0438\u0442\u044c \u0432 \u0442\u0435\u0447\u0435\u043d\u0438\u0435 12 \u0447\u0430\u0441\u043e\u0432. 13 \u043e\u0442\u0435\u043b\u0435\u0439 \u0440\u0430\u0437\u043d\u044b\u0445 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439.',g:2,btn:{l:'\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043e\u0442\u0435\u043b\u044c',t:'tab:stay',c:PR}},
{q:'\u0417\u0430\u0432\u0442\u0440\u0430\u043a \u0432\u043a\u043b\u044e\u0447\u0451\u043d \u0432 \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u043d\u0438\u0435?',a:'\u0414\u0430, \u0437\u0430\u0432\u0442\u0440\u0430\u043a \u0432\u043a\u043b\u044e\u0447\u0451\u043d \u043f\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0443 \u043e\u0441\u043d\u043e\u0432\u043d\u044b\u0445 \u043c\u0435\u0441\u0442. \u0428\u0432\u0435\u0434\u0441\u043a\u0438\u0439 \u0441\u0442\u043e\u043b \u0441 9:00 \u0434\u043e 11:00. \u041c\u0435\u0441\u0442\u043e \u043f\u0440\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u0443\u0442\u043e\u0447\u043d\u044f\u0439\u0442\u0435 \u0443 \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u0430.',g:2},
{q:'\u0414\u0435\u0442\u0438 \u0434\u043e 3 \u043b\u0435\u0442 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e?',a:'\u0414\u0430, \u0434\u0435\u0442\u0438 \u0434\u043e 3 \u043b\u0435\u0442 \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u044e\u0442 \u0441 \u0440\u043e\u0434\u0438\u0442\u0435\u043b\u044f\u043c\u0438 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0431\u0435\u0437 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e\u0433\u043e \u043c\u0435\u0441\u0442\u0430. \u0414\u043b\u044f \u0434\u0435\u0442\u0435\u0439 \u0441\u0442\u0430\u0440\u0448\u0435 3 \u043b\u0435\u0442 \u043d\u0443\u0436\u043d\u043e \u0437\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e\u0435 \u043c\u0435\u0441\u0442\u043e.',g:4},
{q:'\u041a\u0430\u043a \u0434\u043e\u0431\u0440\u0430\u0442\u044c\u0441\u044f?',a:'90 \u043a\u043c \u043e\u0442 \u041c\u041a\u0410\u0414 \u043f\u043e \u041a\u0438\u0435\u0432\u0441\u043a\u043e\u043c\u0443 \u0448\u043e\u0441\u0441\u0435 (\u041c3). \u042d\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u043a\u0430 \u0434\u043e \u0441\u0442. \u0411\u0430\u043b\u0430\u0431\u0430\u043d\u043e\u0432\u043e + \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u0448\u0430\u0442\u0442\u043b \u043f\u0430\u0440\u043a\u0430.',g:3,btn:{l:'\u041c\u0430\u0440\u0448\u0440\u0443\u0442\u044b',t:'directions',c:C}},
{q:'\u041d\u0443\u0436\u0435\u043d \u043b\u0438 \u043f\u0440\u043e\u043f\u0443\u0441\u043a \u043d\u0430 \u043f\u0430\u0440\u043a\u043e\u0432\u043a\u0443?',a:'\u041d\u0435\u0442, \u043f\u0430\u0440\u043a\u043e\u0432\u043a\u0430 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0430\u044f. \u0418\u0441\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u2014 \u0434\u043d\u0438 \u043a\u0440\u0443\u043f\u043d\u044b\u0445 \u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u0435\u0439, \u043a\u043e\u0433\u0434\u0430 \u043d\u0443\u0436\u0435\u043d \u043f\u0440\u043e\u043f\u0443\u0441\u043a \u0434\u043b\u044f \u0441\u043f\u0435\u0446\u043f\u0430\u0440\u043a\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u044e\u0449\u0438\u0445.',g:3},
{q:'\u0413\u0434\u0435 \u043a\u0443\u0440\u0438\u0442\u044c?',a:'\u041a\u0443\u0440\u0435\u043d\u0438\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u043e \u0440\u044f\u0434\u043e\u043c \u0441 \u0443\u0440\u043d\u0430\u043c\u0438 \u0432\u0434\u043e\u043b\u044c \u041f\u0430\u0432\u0438\u043b\u044c\u043e\u043d\u043e\u0432 \u0423\u043b\u0438\u0446\u044b \u041c\u0438\u0440\u0430 \u0438 \u043f\u0440\u0438 \u0432\u0445\u043e\u0434\u0435 \u0432 \u00ab\u0412\u043e\u043a\u0440\u0443\u0433 \u0441\u0432\u0435\u0442\u0430\u00bb. \u0412 \u043e\u0442\u0435\u043b\u044f\u0445 \u0438 \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u0430\u0445 \u043a\u0443\u0440\u0438\u0442\u044c \u043d\u0435\u043b\u044c\u0437\u044f.',g:3},
{q:'\u0415\u0441\u0442\u044c \u043b\u0438 \u0433\u0440\u0443\u043f\u043f\u043e\u0432\u044b\u0435 \u0441\u043a\u0438\u0434\u043a\u0438?',a:'\u0414\u0430, \u043e\u0442 15 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u2014 \u0441\u043a\u0438\u0434\u043a\u0430 15%. \u0414\u043b\u044f \u0448\u043a\u043e\u043b\u044c\u043d\u044b\u0445 \u0433\u0440\u0443\u043f\u043f \u0438 \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043e\u0432 \u2014 \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f.',g:1,btn:{l:'\u0414\u043b\u044f \u0433\u0440\u0443\u043f\u043f',t:'tab:tours:b2b',c:OR}},
{q:'\u041a\u0430\u043a\u043e\u0439 \u0441\u0440\u043e\u043a \u043e\u043f\u043b\u0430\u0442\u044b \u0431\u0440\u043e\u043d\u0438?',a:'\u0411\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e \u043e\u043f\u043b\u0430\u0442\u0438\u0442\u044c \u0432 \u0442\u0435\u0447\u0435\u043d\u0438\u0435 12 \u0447\u0430\u0441\u043e\u0432 \u0441 \u043c\u043e\u043c\u0435\u043d\u0442\u0430 \u043e\u0444\u043e\u0440\u043c\u043b\u0435\u043d\u0438\u044f. \u041e\u043f\u043b\u0430\u0442\u0430 \u043e\u043d\u043b\u0430\u0439\u043d \u0447\u0435\u0440\u0435\u0437 \u0441\u0430\u0439\u0442.',g:2},
{q:'\u0415\u0441\u0442\u044c \u043b\u0438 \u0431\u0430\u0441\u0441\u0435\u0439\u043d \u0438 \u0441\u043f\u0430?',a:'\u0414\u0430, \u0430\u043a\u0432\u0430\u0437\u043e\u043d\u0430 \u0441 \u0431\u0430\u0441\u0441\u0435\u0439\u043d\u043e\u043c, \u0441\u0430\u0443\u043d\u0430\u043c\u0438 \u0438 \u0445\u0430\u043c\u0430\u043c\u043e\u043c. \u0421\u041f\u0410-\u0446\u0435\u043d\u0442\u0440 \u00ab\u0421\u0438\u043c\u0432\u043e\u043b\u044b\u00bb \u0441 \u043e\u0437\u0434\u043e\u0440\u043e\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u043c\u0438 \u043f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u0430\u043c\u0438.',g:5,btn:{l:'\u0421\u041f\u0410 \u0438 \u0431\u0430\u043d\u0438',t:'tab:services:banya',c:GR}},
{q:'\u041c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b \u0434\u043b\u044f \u0434\u0435\u0442\u0435\u0439?',a:'\u0411\u043e\u043b\u044c\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u0441 5 \u043b\u0435\u0442. \u0415\u0441\u0442\u044c \u0441\u043f\u0435\u0446\u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u044b \u0434\u043b\u044f \u043c\u0430\u043b\u044b\u0448\u0435\u0439 3+. \u041c\u043e\u0436\u043d\u043e \u0437\u0430\u043a\u0430\u0437\u0430\u0442\u044c \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0439 \u043c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441.',g:4,btn:{l:'\u041c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b',t:'tab:tours:mk',c:GR}},
{q:'\u041c\u043e\u0436\u043d\u043e \u0441 \u0434\u043e\u043c\u0430\u0448\u043d\u0438\u043c\u0438 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u043c\u0438?',a:'\u041d\u0430 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044e \u043f\u0430\u0440\u043a\u0430 \u043d\u0435\u043b\u044c\u0437\u044f. \u0412 \u043e\u0442\u0435\u043b\u0435 \u00ab\u0421\u0438\u0431\u0438\u0440\u0438\u044f\u00bb \u0440\u0430\u0437\u043c\u0435\u0449\u0435\u043d\u0438\u0435 \u0441 \u043f\u0438\u0442\u043e\u043c\u0446\u0430\u043c\u0438 \u0434\u043e 5 \u043a\u0433, \u043d\u0435 \u0431\u043e\u0439\u0446\u043e\u0432\u044b\u0445 \u043f\u043e\u0440\u043e\u0434.',g:5},
{q:'\u0415\u0441\u0442\u044c \u043b\u0438 Wi-Fi?',a:'\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 Wi-Fi \u043d\u0430 \u0432\u0441\u0435\u0439 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438 \u043f\u0430\u0440\u043a\u0430 \u0438 \u0432\u043e \u0432\u0441\u0435\u0445 \u043e\u0442\u0435\u043b\u044f\u0445.',g:5},
{q:'\u0414\u0435\u0442\u0441\u043a\u0438\u0435 \u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0438 \u0438 \u0430\u0442\u0442\u0440\u0430\u043a\u0446\u0438\u043e\u043d\u044b?',a:'\u0412\u043e\u043b\u0448\u0435\u0431\u043d\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0430, \u043b\u0430\u0431\u0438\u0440\u0438\u043d\u0442, \u0432\u0435\u0440\u0451\u0432\u043e\u0447\u043d\u044b\u0439 \u043f\u0430\u0440\u043a, \u044d\u043a\u043e-\u0442\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442, \u0437\u043e\u043e\u0434\u043e\u043c\u0430 \u0441 \u0445\u0430\u0441\u043a\u0438. \u0414\u043b\u044f \u0432\u0441\u0435\u0445 \u0432\u043e\u0437\u0440\u0430\u0441\u0442\u043e\u0432.',g:4,btn:{l:'\u0420\u0430\u0437\u0432\u043b\u0435\u0447\u0435\u043d\u0438\u044f',t:'tab:services:fun',c:GR}},
{q:'\u041f\u043e\u0434\u0430\u0440\u043e\u0447\u043d\u044b\u0435 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043a\u0430\u0442\u044b?',a:'\u0414\u0430, \u043d\u043e\u043c\u0438\u043d\u0430\u043b\u043e\u043c \u043e\u0442 3 000 \u20bd. \u041f\u043e\u0434\u0430\u0440\u0438\u0442\u0435 \u0431\u043b\u0438\u0437\u043a\u0438\u043c \u0437\u0430\u0433\u043e\u0440\u043e\u0434\u043d\u044b\u0439 \u043e\u0442\u0434\u044b\u0445 \u0432 \u044d\u0442\u043d\u043e\u043f\u0430\u0440\u043a\u0435.',g:5,btn:{l:'\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043a\u0430\u0442\u044b',t:'tab:tours:certificates',c:OR}}];
const filtered=faqs.filter((f:any)=>(cat===0||f.g===cat)&&(!srch||new RegExp(srch.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&'),'i').test(f.q+' '+f.a)));
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#E8F4FD 0%,#F2F2F7 15%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:260,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 0%,rgba(0,0,0,.75) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...GL,background:'rgba(90,200,250,.7)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>FAQ</div><div style={{fontSize:30,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05}}>{'\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043e\u0442\u0432\u0435\u0442\u044b'}</div></div></div>
<div style={{padding:'20px 20px 0'}}><div style={{position:'relative'}}><input value={srch} onChange={(e:any)=>setSrch(e.target.value)} placeholder={'\u041f\u043e\u0438\u0441\u043a...'} style={{width:'100%',padding:'14px 16px 14px 42px',borderRadius:16,...GL,fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/><svg style={{position:'absolute',left:14,top:15}} width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="rgba(60,60,67,.3)" strokeWidth="2"/><path d="M20 20l-3.5-3.5" stroke="rgba(60,60,67,.3)" strokeWidth="2" strokeLinecap="round"/></svg></div></div>
<div style={{padding:'12px 20px 0',display:'flex',gap:8,overflowX:'auto',WebkitOverflowScrolling:'touch'}}>{cats.map((ct:any,i:number)=><div key={i} className="tap" onClick={()=>{setCat(i);setOpen(-1);}} style={{flexShrink:0,height:32,padding:'0 14px',borderRadius:16,...(cat===i?{background:ct.c}:GL),lineHeight:'32px',fontSize:13,fontWeight:cat===i?700:400,color:cat===i?'#fff':L2,fontFamily:FT,transition:'all .25s',cursor:'pointer'}}>{ct.l}</div>)}</div>
<div style={{padding:'12px 20px 0'}}><div style={{...GL,borderRadius:20,overflow:'hidden'}}>
{filtered.length===0&&<div style={{padding:20,textAlign:'center',fontSize:14,color:L2,fontFamily:FT}}>{'\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'}</div>}
{filtered.map((f:any,i:number)=>{const isO=open===i;return <div key={i} style={{borderBottom:i<filtered.length-1?'.5px solid rgba(60,60,67,.08)':'none'}}>
<div className="tap" onClick={()=>setOpen(isO?-1:i)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',cursor:'pointer'}}><span style={{fontSize:15,fontWeight:600,fontFamily:FD,flex:1,paddingRight:12}}>{f.q}</span><svg width="12" height="7" viewBox="0 0 12 7" style={{flexShrink:0,transition:'transform .3s cubic-bezier(0.2,0.8,0.2,1)',transform:isO?'rotate(180deg)':'rotate(0)'}}><path d="M1 1l5 5 5-5" stroke={BL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div>
{isO&&<div style={{padding:'0 16px 14px'}}><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6}}>{f.a}</div>
{f.btn&&go&&<div className="tap" onClick={()=>go(f.btn.t)} style={{marginTop:10,height:36,borderRadius:12,background:f.btn.c,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:6}}><span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>{f.btn.l}</span><svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
</div>}
</div>})}
</div></div>
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20,textAlign:'center'}}><div style={{fontSize:32,marginBottom:4}}>{'\ud83e\udd14'}</div><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:6}}>{'\u041d\u0435 \u043d\u0430\u0448\u043b\u0438 \u043e\u0442\u0432\u0435\u0442?'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.5,marginBottom:14}}>{'\u041f\u043e\u0437\u0432\u043e\u043d\u0438\u0442\u0435 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430\u043c: +7 495 023-81-81 \u0438\u043b\u0438 \u043d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 zakaz@ethnomir.ru'}</div><div className="tap" onClick={()=>window.open('tel:+74950238181')} style={{height:50,borderRadius:16,background:C,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u041f\u043e\u0437\u0432\u043e\u043d\u0438\u0442\u044c'}</span></div></div></div>
<div style={{height:80}}/>
</div>;
}

function RealtyLandingV2({onClose,go}:{onClose:()=>void,go?:(t:string)=>void}){
const G='#34C759',BL='#007AFF',OR='#FF9500',PR='#AF52DE',RD='#FF3B30',IND='#5856D6';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
const[nm,setNm]=(React as any).useState('');const[ph,setPh]=(React as any).useState('');const[sent,setSent]=(React as any).useState(false);const[err,setErr]=(React as any).useState('');const[sending,setSending]=(React as any).useState(false);
const submit=async()=>{if(!nm.trim()||!ph.trim()){setErr('\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u043b\u044f');return;}setSending(true);setErr('');const ok=await submitContactRequest('realty','landing_realty',nm,ph);if(ok){setSent(true);logActivity('lead_realty',{name:nm,phone:ph});}else setErr('\u041e\u0448\u0438\u0431\u043a\u0430');setSending(false);};
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#ECFDF5 0%,#F2F2F7 12%,#F2F2F7 50%,#F0FDF4 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
{/* HERO */}
<div style={{position:'relative',height:400,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,40,20,.2) 0%,rgba(0,20,10,.8) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...GL,background:'rgba(52,199,89,.75)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u041d\u0415\u0414\u0412\u0418\u0416\u0418\u041c\u041e\u0421\u0422\u042c'}</div><div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u0416\u0438\u0437\u043d\u044c \u0443 \u043f\u0430\u0440\u043a\u0430 \u042d\u0442\u043d\u043e\u043c\u0438\u0440'}</div><div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u041a\u043e\u0442\u0442\u0435\u0434\u0436\u043d\u044b\u0439 \u043f\u043e\u0441\u0451\u043b\u043e\u043a \u00ab\u041c\u0438\u0440\u00bb. \u0414\u043e\u043c\u0430, \u0442\u0430\u0443\u043d\u0445\u0430\u0443\u0441\u044b \u0438 \u0443\u0447\u0430\u0441\u0442\u043a\u0438.'}</div></div></div>
{/* METRICS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{[{t:'90 \u043a\u043c',l:'\u043e\u0442 \u041c\u041a\u0410\u0414',c:G},{t:'\u043e\u0442 8M \u20bd',l:'\u0443\u0447\u0430\u0441\u0442\u043e\u043a',c:OR},{t:'\u043e\u0442 18M \u20bd',l:'\u0434\u043e\u043c \u043f\u043e\u0434 \u043a\u043b\u044e\u0447',c:BL},{t:'140 \u0433\u0430',l:'\u043f\u0430\u0440\u043a \u0440\u044f\u0434\u043e\u043c',c:PR}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:16,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:10,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
{/* CONCEPT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041f\u043e\u0441\u0451\u043b\u043e\u043a \u00ab\u041c\u0438\u0440\u00bb'}</div><div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u042d\u043a\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0438 \u0447\u0438\u0441\u0442\u044b\u0439 \u0440\u0430\u0439\u043e\u043d \u041a\u0430\u043b\u0443\u0436\u0441\u043a\u043e\u0439 \u043e\u0431\u043b\u0430\u0441\u0442\u0438. \u0412\u0441\u044f \u0438\u043d\u0444\u0440\u0430\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043f\u0430\u0440\u043a\u0430 \u2014 \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b, \u0441\u043f\u0430, \u0431\u0430\u0441\u0441\u0435\u0439\u043d, \u043c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0438\u0435, \u0434\u0435\u0442\u0441\u043a\u0438\u0435 \u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0438 \u2014 \u0432 \u0448\u0430\u0433\u043e\u0432\u043e\u0439 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u0438. \u041b\u0435\u0441, \u0442\u0438\u0448\u0438\u043d\u0430, \u043f\u0440\u0438\u0440\u043e\u0434\u0430.'}</div></div></div>
{/* FORMATS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u0424\u041e\u0420\u041c\u0410\u0422\u042b'}</div><div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0432\u043e\u0439'}</div>
{[{e:'\ud83c\udfde',t:'\u0423\u0447\u0430\u0441\u0442\u043e\u043a \u0431\u0435\u0437 \u043f\u043e\u0434\u0440\u044f\u0434\u0430',d:'\u041e\u0442 6 \u0441\u043e\u0442\u043e\u043a. \u041a\u043e\u043c\u043c\u0443\u043d\u0438\u043a\u0430\u0446\u0438\u0438 \u043d\u0430 \u0433\u0440\u0430\u043d\u0438\u0446\u0435. \u041e\u0442 8M \u20bd',c:G},{e:'\ud83c\udfe1',t:'\u0414\u043e\u043c \u043f\u043e\u0434 \u043a\u043b\u044e\u0447',d:'100\u2014250 \u043c\u00b2. \u041f\u0440\u043e\u0435\u043a\u0442, \u0441\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e, \u043e\u0442\u0434\u0435\u043b\u043a\u0430. \u041e\u0442 18M \u20bd',c:BL},{e:'\ud83c\udfe0',t:'\u0422\u0430\u0443\u043d\u0445\u0430\u0443\u0441',d:'80\u2014150 \u043c\u00b2. \u041e\u0431\u0449\u0430\u044f \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044f, \u0441\u0432\u043e\u0439 \u0432\u0445\u043e\u0434. \u041e\u0442 12M \u20bd',c:PR},{e:'\ud83c\udf33',t:'\u041f\u0440\u0435\u043c\u0438\u0443\u043c-\u0443\u0447\u0430\u0441\u0442\u043e\u043a',d:'\u041e\u0442 15 \u0441\u043e\u0442\u043e\u043a \u0441 \u043b\u0435\u0441\u043e\u043c. \u041f\u0435\u0440\u0432\u0430\u044f \u043b\u0438\u043d\u0438\u044f. \u041e\u0442 15M \u20bd',c:OR}].map((f:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:48,height:48,borderRadius:14,background:f.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{f.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{f.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{f.d}</div></div></div>)}</div>
{/* PRICE CHART */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0414\u0418\u041d\u0410\u041c\u0418\u041a\u0410 \u0426\u0415\u041d'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0420\u043e\u0441\u0442 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u0438 \u0443\u0447\u0430\u0441\u0442\u043a\u043e\u0432'}</div>
<svg viewBox="0 0 310 120" style={{width:'100%'}}><defs><linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G} stopOpacity="0.3"/><stop offset="100%" stopColor={G} stopOpacity="0"/></linearGradient></defs><polyline points="10,105 62,95 114,82 166,68 218,50 270,30" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><polygon points="10,105 62,95 114,82 166,68 218,50 270,30 270,112 10,112" fill="url(#pf)"/>
{[{x:10,y:105,l:'2020',v:'3M'},{x:62,y:95,l:'2021',v:'4M'},{x:114,y:82,l:'2022',v:'5.5M'},{x:166,y:68,l:'2023',v:'6.5M'},{x:218,y:50,l:'2024',v:'8M'},{x:270,y:30,l:'2025',v:'10M'}].map((p:any,i:number)=><g key={i}><circle cx={p.x} cy={p.y} r="4" fill={G}/><text x={p.x} y={p.y-8} textAnchor="middle" fontSize="8" fontWeight="700" fill={G} fontFamily={FT}>{p.v}</text><text x={p.x} y={118} textAnchor="middle" fontSize="7" fill="rgba(60,60,67,.4)" fontFamily={FT}>{p.l}</text></g>)}</svg><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8,textAlign:'center'}}>{'\u0421\u0440\u0435\u0434\u043d\u044f\u044f \u0446\u0435\u043d\u0430 \u0443\u0447\u0430\u0441\u0442\u043a\u0430 \u0437\u0430 5 \u043b\u0435\u0442: +233%'}</div></div></div>
{/* INFRA */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0418\u041d\u0424\u0420\u0410\u0421\u0422\u0420\u0423\u041a\u0422\u0423\u0420\u0410'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0412\u0441\u0451 \u0440\u044f\u0434\u043e\u043c'}</div>
{[{p:'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b',v:'12',c:OR},{p:'\u0421\u041f\u0410 \u0438 \u0431\u0430\u043d\u0438',v:'4',c:BL},{p:'\u0414\u0435\u0442\u0441\u043a\u0438\u0435 \u0437\u043e\u043d\u044b',v:'6+',c:G},{p:'\u041e\u0442\u0435\u043b\u0438',v:'13',c:PR},{p:'\u041c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0438\u0435',v:'40+',c:RD},{p:'\u041c\u0443\u0437\u0435\u0438',v:'15',c:IND}].map((r:any,i:number)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<5?'.5px solid rgba(60,60,67,.08)':'none'}}><span style={{fontSize:14,fontFamily:FT}}>{r.p}</span><span style={{fontSize:16,fontWeight:800,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}</div></div>
{/* DONUT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0414\u041e\u0425\u041e\u0414'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0410\u0440\u0435\u043d\u0434\u043d\u044b\u0439 \u043f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/><circle cx="50" cy="50" r="42" fill="none" stroke={G} strokeWidth="12" strokeDasharray="119 145" strokeDashoffset="66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="79 185" strokeDashoffset="-53" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-132" strokeLinecap="round"/></svg>
<div style={{flex:1}}>{[{c:G,l:'Airbnb / \u0441\u0443\u0442\u043a\u0438',v:'45%'},{c:OR,l:'\u0414\u043e\u043b\u0433\u043e\u0441\u0440\u043e\u0447\u043d.',v:'30%'},{c:BL,l:'\u041c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u044f',v:'25%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:i<2?8:0}}><div style={{width:10,height:10,borderRadius:5,background:r.c}}/><span style={{fontSize:13,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:13,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}</div></div>
<div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:12}}>{'\u041f\u043e\u0441\u0451\u043b\u043e\u043a \u0443 \u043f\u0430\u0440\u043a\u0430 \u0441 1M+ \u0433\u043e\u0441\u0442\u0435\u0439/\u0433\u043e\u0434 \u2014 \u0438\u0434\u0435\u0430\u043b\u044c\u043d\u044b\u0439 \u043e\u0431\u044a\u0435\u043a\u0442 \u0434\u043b\u044f \u043f\u043e\u0441\u0443\u0442\u043e\u0447\u043d\u043e\u0439 \u0430\u0440\u0435\u043d\u0434\u044b.'}</div></div></div>
{/* COMPARE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:IND,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0420\u0410\u0412\u041d\u0415\u041d\u0418\u0415'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u041f\u043e\u0441\u0451\u043b\u043e\u043a \u00ab\u041c\u0438\u0440\u00bb vs \u041c\u043e\u0441\u043a\u0432\u0430'}</div>
{[{p:'\u0426\u0435\u043d\u0430 \u0437\u0430 \u043c\u00b2',a:'\u043e\u0442 60K',b:'250K+'},{p:'\u042d\u043a\u043e\u043b\u043e\u0433\u0438\u044f',a:'\u2605\u2605\u2605',b:'\u2605'},{p:'\u0418\u043d\u0444\u0440\u0430\u0441\u0442\u0440.',a:'\u041f\u0430\u0440\u043a 140\u0433\u0430',b:'\u0422\u0426, \u043c\u0435\u0442\u0440\u043e'},{p:'\u0414\u043e\u0445\u043e\u0434\u043d.',a:'15\u201425%',b:'5\u20148%'},{p:'\u041e\u043a\u0443\u043f\u0430\u0435\u043c.',a:'5\u20147 \u043b\u0435\u0442',b:'15\u201420 \u043b\u0435\u0442'}].map((r:any,i:number)=><div key={i} style={{display:'flex',padding:'10px 0',borderBottom:i<4?'.5px solid rgba(60,60,67,.06)':'none'}}><div style={{flex:1,fontSize:13,color:L2,fontFamily:FT}}>{r.p}</div><div style={{flex:1,fontSize:13,fontWeight:700,color:G,fontFamily:FD,textAlign:'center'}}>{r.a}</div><div style={{flex:1,fontSize:13,color:L2,fontFamily:FT,textAlign:'center'}}>{r.b}</div></div>)}</div></div>
{/* ADVANTAGES */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:PR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041f\u0420\u0415\u0418\u041c\u0423\u0429\u0415\u0421\u0422\u0412\u0410'}</div>
{[{e:'\ud83c\udf3f',t:'\u0427\u0438\u0441\u0442\u044b\u0439 \u0432\u043e\u0437\u0434\u0443\u0445',d:'\u041b\u0435\u0441\u043d\u043e\u0439 \u043c\u0430\u0441\u0441\u0438\u0432, \u043d\u0435\u0442 \u043f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u043e\u0441\u0442\u0438',c:G},{e:'\ud83c\udfab',t:'\u0414\u043e\u0441\u0443\u0433 365 \u0434\u043d\u0435\u0439',d:'\u0424\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u0438, \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b, \u0441\u043f\u0430, \u043c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b',c:OR},{e:'\ud83d\udcc8',t:'\u0420\u043e\u0441\u0442 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u0438',d:'\u0426\u0435\u043d\u0430 \u0443\u0447\u0430\u0441\u0442\u043a\u043e\u0432 +233% \u0437\u0430 5 \u043b\u0435\u0442',c:BL},{e:'\ud83d\ude97',t:'\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c',d:'1.5 \u0447\u0430\u0441\u0430 \u043e\u0442 \u041c\u043e\u0441\u043a\u0432\u044b \u043f\u043e \u041a\u0438\u0435\u0432\u0441\u043a\u043e\u043c\u0443 \u0448\u043e\u0441\u0441\u0435',c:PR}].map((a:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:a.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{a.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{a.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{a.d}</div></div></div>)}</div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+G}}><div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u2014 \u043d\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u043f\u0430\u0440\u043a, \u043d\u043e \u0438 \u043c\u0435\u0441\u0442\u043e \u0434\u043b\u044f \u0436\u0438\u0437\u043d\u0438. \u041c\u044b \u0441\u0442\u0440\u043e\u0438\u043c \u0441\u043e\u043e\u0431\u0449\u0435\u0441\u0442\u0432\u043e \u043b\u044e\u0434\u0435\u0439, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0446\u0435\u043d\u044f\u0442 \u043f\u0440\u0438\u0440\u043e\u0434\u0443, \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u0443 \u0438 \u0434\u0440\u0443\u0433 \u0434\u0440\u0443\u0433\u0430.\u00bb'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u0420\u0443\u0441\u043b\u0430\u043d \u0411\u0430\u0439\u0440\u0430\u043c\u043e\u0432, \u043e\u0441\u043d\u043e\u0432\u0430\u0442\u0435\u043b\u044c'}</div></div></div>
{/* NAV BUTTONS */}
<div style={{padding:'16px 20px 0'}}>
{go&&<div className="tap" onClick={()=>go('tab:stay')} style={{...GL,borderRadius:20,padding:'16px 20px',marginBottom:10,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}><div style={{width:40,height:40,borderRadius:12,background:G+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{'\ud83c\udfe0'}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,fontFamily:FD}}>{'\u0416\u0438\u043b\u044c\u0451 \u0438 \u043d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c'}</div><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:1}}>{'\u041e\u0442\u0435\u043b\u0438, \u0430\u043f\u0430\u0440\u0442\u0430\u043c\u0435\u043d\u0442\u044b, \u0434\u043e\u043c\u0430'}</div></div><svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="rgba(60,60,67,.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
{go&&<div className="tap" onClick={()=>go('directions')} style={{...GL,borderRadius:20,padding:'16px 20px',marginBottom:10,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}><div style={{width:40,height:40,borderRadius:12,background:BL+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{'\ud83d\udccd'}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,fontFamily:FD}}>{'\u041a\u0430\u043a \u0434\u043e\u0431\u0440\u0430\u0442\u044c\u0441\u044f'}</div><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:1}}>{'90 \u043a\u043c \u043e\u0442 \u041c\u041a\u0410\u0414, 1.5 \u0447\u0430\u0441\u0430'}</div></div><svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="rgba(60,60,67,.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
{go&&<div className="tap" onClick={()=>go('build')} style={{...GL,borderRadius:20,padding:'16px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}><div style={{width:40,height:40,borderRadius:12,background:PR+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{'\ud83c\udfd7'}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,fontFamily:FD}}>{'\u041f\u043e\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440'}</div><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:1}}>{'\u0418\u043d\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u0432 \u0441\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e'}</div></div><svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="rgba(60,60,67,.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
</div>
{/* CTA */}
{sent?<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'28px 16px',textAlign:'center'}}><div style={{fontSize:36,marginBottom:4}}>{'\u2705'}</div><div style={{fontSize:17,fontWeight:700,color:G,fontFamily:FD}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e!'}</div></div></div>
:<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20,textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,fontFamily:FD,marginBottom:16}}>{'\u041e\u0431\u0441\u0443\u0434\u0438\u0442\u044c \u043f\u043e\u043a\u0443\u043f\u043a\u0443'}</div>
<div style={{textAlign:'left',marginBottom:10}}><input value={nm} onChange={(e:any)=>setNm(e.target.value)} placeholder={'\u0418\u043c\u044f'} style={{width:'100%',padding:'14px 16px',borderRadius:16,...GL,fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
<div style={{textAlign:'left',marginBottom:16}}><input value={ph} onChange={(e:any)=>setPh(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:'100%',padding:'14px 16px',borderRadius:16,...GL,fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
{err&&<div style={{fontSize:13,color:RD,marginBottom:8}}>{err}</div>}
<div className="tap" onClick={submit} style={{height:50,borderRadius:16,background:G,display:'flex',alignItems:'center',justifyContent:'center',opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{sending?'...':'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}</span></div></div></div>}
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:18}}><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>realty@ethnomir.ru<br/>ethnomir.ru</div></div></div>
<div style={{height:80}}/>
</div>;
}

function JobsLandingV2({onClose}:{onClose:()=>void}){
const G='#34C759',BL='#007AFF',OR='#FF9500',PR='#AF52DE',RD='#FF3B30',IND='#5856D6',C='#5AC8FA';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
const[open,setOpen]=(React as any).useState(-1);
const[nm,setNm]=(React as any).useState('');const[ph,setPh]=(React as any).useState('');const[sent,setSent]=(React as any).useState(false);const[err,setErr]=(React as any).useState('');const[sending,setSending]=(React as any).useState(false);
const submit=async()=>{if(!nm.trim()||!ph.trim()){setErr('\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u043b\u044f');return;}setSending(true);setErr('');const ok=await submitContactRequest('jobs','landing_jobs',nm,ph);if(ok){setSent(true);logActivity('lead_jobs',{name:nm,phone:ph});}else setErr('\u041e\u0448\u0438\u0431\u043a\u0430');setSending(false);};
const jobs:any[]=[{t:'\u0412\u0435\u0434\u0443\u0449\u0438\u0439 \u0431\u0443\u0445\u0433\u0430\u043b\u0442\u0435\u0440',s:'\u043f\u043e \u0434\u043e\u0433\u043e\u0432.',d:'\u041f\u043e\u043b\u043d\u044b\u0439 \u0431\u0443\u0445. \u0443\u0447\u0451\u0442 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u0439. \u041f\u0435\u0440\u0432\u0438\u0447\u043d\u044b\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b, \u0431\u0430\u043d\u043a, \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u0430. \u041e\u0442\u0447\u0451\u0442\u043d\u043e\u0441\u0442\u044c. 5/2.',dep:'\u0424\u0438\u043d\u0430\u043d\u0441\u044b',c:G},{t:'\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440 / \u0440\u0435\u0436\u0438\u0441\u0441\u0451\u0440 \u043c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u0439',s:'\u043e\u0442 70K \u20bd',d:'\u0420\u0435\u0436\u0438\u0441\u0441\u0443\u0440\u0430 \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u043d\u043e-\u043c\u0430\u0441\u0441\u043e\u0432\u044b\u0445 \u043c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u0439. \u041a\u0440\u0435\u0430\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c, \u043e\u043f\u044b\u0442 \u0432 \u0441\u043e\u0431\u044b\u0442\u0438\u044f\u0445.',dep:'\u041c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u044f',c:OR},{t:'\u0422\u0435\u0445\u043d\u0438\u043a \u044d\u043a\u0441\u043f\u043b\u0443\u0430\u0442\u0430\u0446\u0438\u0438 / \u0441\u0430\u043d\u0442\u0435\u0445\u043d\u0438\u043a / \u044d\u043b\u0435\u043a\u0442\u0440\u0438\u043a',s:'\u043f\u043e \u0434\u043e\u0433\u043e\u0432.',d:'\u0422\u0435\u0445\u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u043d\u0438\u0435, \u043f\u043b\u0430\u043d\u043e\u0432\u044b\u0439 \u0438 \u0430\u0432\u0430\u0440\u0438\u0439\u043d\u044b\u0439 \u0440\u0435\u043c\u043e\u043d\u0442. \u041e\u043f\u044b\u0442 \u043e\u0442 1 \u0433\u043e\u0434\u0430.',dep:'\u0422\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438\u0439',c:IND},{t:'\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u043c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u044b\u0445 \u043f\u0440\u043e\u0435\u043a\u0442\u043e\u0432',s:'\u043e\u0442 70K \u20bd',d:'\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u044b\u0439 \u0430\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439. \u041f\u0435\u0440\u0435\u0433\u043e\u0432\u043e\u0440\u044b, \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u044b, \u043a\u043e\u043d\u0444\u0435\u0440\u0435\u043d\u0446\u0438\u0438. \u041c\u043e\u0441\u043a\u0432\u0430, \u043c. \u041c\u043e\u043b\u043e\u0434\u0451\u0436\u043d\u0430\u044f, 5/2.',dep:'\u041c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u044b\u0439',c:BL}];
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#ECFDF5 0%,#F2F2F7 12%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:340,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,30,20,.2) 0%,rgba(0,15,10,.82) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...GL,background:'rgba(52,199,89,.75)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0412\u0410\u041a\u0410\u041d\u0421\u0418\u0418'}</div><div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u0420\u0430\u0431\u043e\u0442\u0430 \u0432 \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0435'}</div><div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u041f\u0440\u0438\u0441\u043e\u0435\u0434\u0438\u043d\u044f\u0439\u0442\u0435\u0441\u044c \u043a \u043a\u043e\u043c\u0430\u043d\u0434\u0435 \u043a\u0440\u0443\u043f\u043d\u0435\u0439\u0448\u0435\u0433\u043e \u044d\u0442\u043d\u043e\u043f\u0430\u0440\u043a\u0430 \u0420\u043e\u0441\u0441\u0438\u0438.'}</div></div></div>
{/* METRICS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>{[{t:'500+',l:'\u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432',c:G},{t:'20+',l:'\u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0439',c:BL},{t:'4',l:'\u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439',c:OR}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:16,padding:'16px 8px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:9,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
{/* JOBS LIST */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041e\u0422\u041a\u0420\u042b\u0422\u042b\u0415 \u041f\u041e\u0417\u0418\u0426\u0418\u0418'}</div><div style={{...GL,borderRadius:20,overflow:'hidden'}}>
{jobs.map((j:any,i:number)=>{const isO=open===i;return <div key={i} style={{borderBottom:i<jobs.length-1?'.5px solid rgba(60,60,67,.08)':'none'}}><div className="tap" onClick={()=>setOpen(isO?-1:i)} style={{display:'flex',alignItems:'center',padding:'14px 16px',cursor:'pointer',gap:10}}><div style={{width:8,height:8,borderRadius:4,background:j.c,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,fontFamily:FD}}>{j.t}</div><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:1}}>{j.dep}</div></div><div style={{fontSize:13,fontWeight:700,color:G,fontFamily:FD,flexShrink:0,marginRight:6}}>{j.s}</div><svg width="12" height="7" viewBox="0 0 12 7" style={{flexShrink:0,transition:'transform .3s cubic-bezier(0.2,0.8,0.2,1)',transform:isO?'rotate(180deg)':'rotate(0)'}}><path d="M1 1l5 5 5-5" stroke={BL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div>
{isO&&<div style={{padding:'0 16px 14px'}}><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6}}>{j.d}</div><div className="tap" onClick={()=>window.open('mailto:rabota@ethnomir.ru?subject='+encodeURIComponent(j.t))} style={{marginTop:10,height:36,borderRadius:12,background:G,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:6}}><span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u041e\u0442\u043a\u043b\u0438\u043a\u043d\u0443\u0442\u044c\u0441\u044f'}</span><svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div>}
</div>})}</div></div>
{/* DONUT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:IND,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041a\u041e\u041c\u0410\u041d\u0414\u0410'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u044b'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/><circle cx="50" cy="50" r="42" fill="none" stroke={PR} strokeWidth="12" strokeDasharray="79 185" strokeDashoffset="66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-13" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="40 224" strokeDashoffset="-66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={G} strokeWidth="12" strokeDasharray="40 224" strokeDashoffset="-106" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={IND} strokeWidth="12" strokeDasharray="26 238" strokeDashoffset="-146" strokeLinecap="round"/></svg>
<div style={{flex:1}}>{[{c:PR,l:'\u041e\u0442\u0435\u043b\u0438',v:'30%'},{c:OR,l:'\u041c\u0435\u0440\u043e\u043f\u0440.',v:'20%'},{c:BL,l:'\u041f\u0440\u043e\u0434\u0430\u0436\u0438',v:'15%'},{c:G,l:'\u0422\u0435\u0445\u043d\u0438\u0447.',v:'15%'},{c:IND,l:'\u0410\u0434\u043c\u0438\u043d.',v:'20%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:i<4?6:0}}><div style={{width:8,height:8,borderRadius:4,background:r.c}}/><span style={{fontSize:11,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:11,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}</div></div></div></div>
{/* BENEFITS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041f\u0420\u0415\u0418\u041c\u0423\u0429\u0415\u0421\u0422\u0412\u0410'}</div>
{[{e:'\ud83d\udcb0',t:'\u0421\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u0430\u044f \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u0430',d:'\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e \u0422\u041a \u0420\u0424, \u0431\u0435\u0437 \u0437\u0430\u0434\u0435\u0440\u0436\u0435\u043a',c:G},{e:'\ud83c\udfe0',t:'\u041f\u0440\u043e\u0436\u0438\u0432\u0430\u043d\u0438\u0435',d:'\u041a\u043e\u043c\u0444\u043e\u0440\u0442\u043d\u043e\u0435 \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u043d\u0438\u0435 \u043d\u0430 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438',c:BL},{e:'\ud83d\ude8c',t:'\u041a\u043e\u0440\u043f. \u0442\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442',d:'\u0410\u0432\u0442\u043e\u0431\u0443\u0441 \u043e\u0442 \u0433. \u0411\u043e\u0440\u043e\u0432\u0441\u043a',c:OR},{e:'\ud83c\udf1f',t:'\u041a\u0430\u0440\u044c\u0435\u0440\u0430',d:'\u0413\u043e\u0440\u0438\u0437\u043e\u043d\u0442\u0430\u043b\u044c\u043d\u044b\u0439 \u0438 \u0432\u0435\u0440\u0442\u0438\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u0440\u043e\u0441\u0442',c:PR},{e:'\ud83c\udf3f',t:'\u041f\u0440\u0438\u0440\u043e\u0434\u0430',d:'\u0420\u0430\u0431\u043e\u0442\u0430 \u0432 \u043b\u0435\u0441\u0443 \u043d\u0430 140 \u0433\u0430',c:C}].map((b:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:b.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{b.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{b.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{b.d}</div></div></div>)}</div>
{/* SALARY */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0417\u0410\u0420\u041f\u041b\u0410\u0422\u042b'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0423\u0440\u043e\u0432\u0435\u043d\u044c \u0434\u043e\u0445\u043e\u0434\u0430'}</div>
{[{l:'\u0422\u0435\u0445\u043d\u0438\u043a',v:50,c:IND},{l:'\u0411\u0443\u0445\u0433\u0430\u043b\u0442\u0435\u0440',v:70,c:G},{l:'\u041e\u0440\u0433. \u043c\u0435\u0440\u043e\u043f\u0440.',v:70,c:OR},{l:'\u041c\u0435\u0436\u0434\u0443\u043d\u0430\u0440.',v:70,c:BL}].map((b:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><div style={{width:90,fontSize:11,color:L2,fontFamily:FT,textAlign:'right',flexShrink:0}}>{b.l}</div><div style={{flex:1,height:20,borderRadius:6,background:'rgba(120,120,128,.06)',overflow:'hidden'}}><div style={{height:'100%',width:Math.round(b.v/70*100)+'%',borderRadius:6,background:b.c,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:6}}><span style={{fontSize:9,fontWeight:700,color:'#fff',fontFamily:FD}}>{b.v+'K'}</span></div></div></div>)}
</div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+G}}><div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u041e\u0441\u043d\u043e\u0432\u0430 \u043d\u0430\u0448\u0435\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u044b \u2014 \u043f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u043e\u043d\u0430\u043b\u044b, \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u044b\u0435 \u043d\u0430 \u0432\u043e\u043f\u043b\u043e\u0449\u0435\u043d\u0438\u0435 \u043d\u0435\u0441\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u044b\u0445 \u0438\u0434\u0435\u0439.\u00bb'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u041a\u043e\u043c\u0430\u043d\u0434\u0430 \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430'}</div></div></div>
{/* CTA */}
{sent?<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'28px 16px',textAlign:'center'}}><div style={{fontSize:36,marginBottom:4}}>{'\u2705'}</div><div style={{fontSize:17,fontWeight:700,color:G,fontFamily:FD}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e!'}</div></div></div>
:<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20,textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,fontFamily:FD,marginBottom:6}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0440\u0435\u0437\u044e\u043c\u0435'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginBottom:14}}>{'\u0418\u043b\u0438 \u043d\u0430 rabota@ethnomir.ru'}</div>
<div style={{textAlign:'left',marginBottom:10}}><input value={nm} onChange={(e:any)=>setNm(e.target.value)} placeholder={'\u0418\u043c\u044f'} style={{width:'100%',padding:'14px 16px',borderRadius:16,...GL,fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
<div style={{textAlign:'left',marginBottom:16}}><input value={ph} onChange={(e:any)=>setPh(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:'100%',padding:'14px 16px',borderRadius:16,...GL,fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
{err&&<div style={{fontSize:13,color:RD,marginBottom:8}}>{err}</div>}
<div className="tap" onClick={submit} style={{height:50,borderRadius:16,background:G,display:'flex',alignItems:'center',justifyContent:'center',opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{sending?'...':'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}</span></div></div></div>}
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:18}}><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b HR'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 926 272-65-75<br/>rabota@ethnomir.ru<br/>{'\u041a\u0430\u043b\u0443\u0436\u0441\u043a\u0430\u044f \u043e\u0431\u043b., \u0434. \u041f\u0435\u0442\u0440\u043e\u0432\u043e'}</div></div></div>
<div style={{height:80}}/>
</div>;
}

function FarmLandingV2({onClose}:{onClose:()=>void}){
const G='#34C759',BL='#007AFF',OR='#FF9500',PR='#AF52DE',RD='#FF3B30',IND='#5856D6',C='#5AC8FA',Y='#A8B820';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
const[nm,setNm]=(React as any).useState('');const[ph,setPh]=(React as any).useState('');const[sent,setSent]=(React as any).useState(false);const[err,setErr]=(React as any).useState('');const[sending,setSending]=(React as any).useState(false);
const submit=async()=>{if(!nm.trim()||!ph.trim()){setErr('\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043f\u043e\u043b\u044f');return;}setSending(true);setErr('');const ok=await submitContactRequest('farm','landing_farm',nm,ph);if(ok){setSent(true);logActivity('lead_farm',{name:nm,phone:ph});}else setErr('\u041e\u0448\u0438\u0431\u043a\u0430');setSending(false);};
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#F0FDF4 0%,#F2F2F7 12%,#F2F2F7 50%,#FEFCE8 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:380,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(20,40,0,.2) 0%,rgba(10,30,0,.82) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...GL,background:'rgba(52,199,89,.75)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0410\u0413\u0420\u041e'}</div><div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u0421\u0435\u043b\u044c\u0441\u043a\u043e\u0435 \u0445\u043e\u0437\u044f\u0439\u0441\u0442\u0432\u043e'}</div><div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u042d\u0442\u043d\u043e\u0444\u0435\u0440\u043c\u0430: \u044d\u043a\u043e\u043f\u0440\u043e\u0434\u0443\u043a\u0442\u044b, \u0436\u0438\u0432\u043e\u0442\u043d\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u043e \u0438 \u0430\u0433\u0440\u043e\u0442\u0443\u0440\u0438\u0437\u043c.'}</div></div></div>
{/* METRICS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{[{t:'140 \u0433\u0430',l:'\u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044f',c:G},{t:'1M+',l:'\u0433\u043e\u0441\u0442\u0435\u0439/\u0433\u043e\u0434',c:BL},{t:'\u042d\u041a\u041e',l:'\u0447\u0438\u0441\u0442\u044b\u0439 \u0440\u0430\u0439\u043e\u043d',c:G},{t:'365',l:'\u0434\u043d\u0435\u0439 \u0432 \u0433\u043e\u0434\u0443',c:OR}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:16,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:10,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
{/* CONCEPT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0410\u0433\u0440\u043e'}</div><div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u2014 \u043a\u043b\u0430\u0441\u0442\u0435\u0440 \u044d\u043a\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u0438 \u0441\u0435\u043b\u044c\u0441\u043a\u043e\u0433\u043e \u0442\u0443\u0440\u0438\u0437\u043c\u0430. \u041d\u0430 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438 \u043f\u0430\u0440\u043a\u0430 \u0440\u0430\u0437\u0432\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u044d\u0442\u043d\u043e\u0444\u0435\u0440\u043c\u0430 \u0441 \u044d\u043a\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0438 \u0447\u0438\u0441\u0442\u044b\u043c\u0438 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0430\u043c\u0438, \u0436\u0438\u0432\u043e\u0442\u043d\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u043e\u043c \u0438 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0430\u043c\u0438 \u0430\u0433\u0440\u043e\u0442\u0443\u0440\u0438\u0437\u043c\u0430 \u0434\u043b\u044f \u0433\u043e\u0441\u0442\u0435\u0439.'}</div></div></div>
{/* DIRECTIONS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041d\u0410\u041f\u0420\u0410\u0412\u041b\u0415\u041d\u0418\u042f'}</div><div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u042d\u0442\u043d\u043e\u0444\u0435\u0440\u043c\u0430'}</div>
{[{e:'\ud83d\udc04',t:'\u041c\u043e\u043b\u043e\u0447\u043d\u043e\u0435 \u0445\u043e\u0437\u044f\u0439\u0441\u0442\u0432\u043e',d:'\u041a\u043e\u0440\u043e\u0432\u044b, \u043a\u043e\u0437\u044b. \u041c\u043e\u043b\u043e\u043a\u043e, \u0441\u044b\u0440\u044b, \u0442\u0432\u043e\u0440\u043e\u0433, \u0441\u043c\u0435\u0442\u0430\u043d\u0430.',c:G},{e:'\ud83c\udf3e',t:'\u0420\u0430\u0441\u0442\u0435\u043d\u0438\u0435\u0432\u043e\u0434\u0441\u0442\u0432\u043e',d:'\u041e\u0432\u043e\u0449\u0438, \u0444\u0440\u0443\u043a\u0442\u044b, \u044f\u0433\u043e\u0434\u044b, \u0442\u0440\u0430\u0432\u044b. \u0422\u0435\u043f\u043b\u0438\u0446\u044b \u0438 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0439 \u0433\u0440\u0443\u043d\u0442.',c:OR},{e:'\ud83c\udf6f',t:'\u041f\u0447\u0435\u043b\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u043e',d:'\u041f\u0430\u0441\u0435\u043a\u0430, \u043d\u0430\u0442\u0443\u0440\u0430\u043b\u044c\u043d\u044b\u0439 \u043c\u0451\u0434, \u043f\u044b\u043b\u044c\u0446\u0430, \u0432\u043e\u0441\u043a.',c:Y},{e:'\ud83c\udfde',t:'\u0410\u0433\u0440\u043e\u0442\u0443\u0440\u0438\u0437\u043c',d:'\u042d\u043a\u0441\u043a\u0443\u0440\u0441\u0438\u0438 \u043d\u0430 \u0444\u0435\u0440\u043c\u0443, \u043c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b, \u0434\u0435\u0433\u0443\u0441\u0442\u0430\u0446\u0438\u0438.',c:BL},{e:'\ud83c\udf31',t:'\u042d\u043a\u043e\u043f\u0440\u043e\u0434\u0443\u043a\u0442\u044b',d:'\u0424\u0435\u0440\u043c\u0435\u0440\u0441\u043a\u0438\u0439 \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u043d\u0430 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438 \u043f\u0430\u0440\u043a\u0430.',c:PR}].map((f:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:48,height:48,borderRadius:14,background:f.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{f.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{f.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{f.d}</div></div></div>)}</div>
{/* DONUT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0420\u041e\u0414\u0423\u041a\u0426\u0418\u042f'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u0430'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/><circle cx="50" cy="50" r="42" fill="none" stroke={G} strokeWidth="12" strokeDasharray="92 172" strokeDashoffset="66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="66 198" strokeDashoffset="-26" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-92" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={PR} strokeWidth="12" strokeDasharray="26 238" strokeDashoffset="-145" strokeLinecap="round"/></svg>
<div style={{flex:1}}>{[{c:G,l:'\u041c\u043e\u043b\u043e\u0447\u043d\u043e\u0435',v:'35%'},{c:OR,l:'\u041e\u0432\u043e\u0449\u0438/\u0444\u0440\u0443\u043a\u0442\u044b',v:'25%'},{c:BL,l:'\u041c\u0451\u0434 \u0438 \u043f\u0447\u0435\u043b\u043e\u043f\u0440.',v:'20%'},{c:PR,l:'\u0422\u0440\u0430\u0432\u044b \u0438 \u0441\u043f\u0435\u0446\u0438\u0438',v:'20%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:i<3?6:0}}><div style={{width:8,height:8,borderRadius:4,background:r.c}}/><span style={{fontSize:11,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:11,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}</div></div></div></div>
{/* SEASON BAR CHART */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0415\u0417\u041e\u041d\u042b'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0443\u0440\u043e\u0436\u0430\u044f'}</div>
<svg viewBox="0 0 310 100" style={{width:'100%'}}><defs><linearGradient id="hv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G}/><stop offset="100%" stopColor={G} stopOpacity=".4"/></linearGradient></defs>
{[{x:5,h:15},{x:30,h:12},{x:55,h:18},{x:80,h:35},{x:105,h:55},{x:130,h:80},{x:155,h:90},{x:180,h:85},{x:205,h:70},{x:230,h:40},{x:255,h:20},{x:280,h:15}].map((b:any,i:number)=><g key={i}><rect x={b.x} y={90-b.h} width="20" height={b.h} rx="4" fill="url(#hv)"/><text x={b.x+10} y={98} textAnchor="middle" fontSize="6" fill="rgba(60,60,67,.4)" fontFamily={FT}>{['\u042f','\u0424','\u041c','\u0410','\u041c','\u0418','\u0418','\u0410','\u0421','\u041e','\u041d','\u0414'][i]}</text></g>)}</svg><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:6,textAlign:'center'}}>{'\u041f\u0438\u043a \u0443\u0440\u043e\u0436\u0430\u044f: \u0438\u044e\u043d\u044c\u2014\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c'}</div></div></div>
{/* ADVANTAGES */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:PR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041f\u0420\u0415\u0418\u041c\u0423\u0429\u0415\u0421\u0422\u0412\u0410'}</div>
{[{e:'\ud83c\udf3f',t:'\u0411\u0435\u0437 \u0413\u041c\u041e \u0438 \u0445\u0438\u043c\u0438\u0438',d:'\u0422\u043e\u043b\u044c\u043a\u043e \u043d\u0430\u0442\u0443\u0440\u0430\u043b\u044c\u043d\u044b\u0435 \u043a\u043e\u0440\u043c\u0430 \u0438 \u0443\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u044f',c:G},{e:'\ud83d\udc68\u200d\ud83c\udf3e',t:'\u0410\u0433\u0440\u043e\u0442\u0443\u0440\u0438\u0437\u043c',d:'\u042d\u043a\u0441\u043a\u0443\u0440\u0441\u0438\u0438 \u0434\u043b\u044f \u0434\u0435\u0442\u0435\u0439 \u0438 \u0432\u0437\u0440\u043e\u0441\u043b\u044b\u0445 \u043d\u0430 \u0444\u0435\u0440\u043c\u0443',c:BL},{e:'\ud83c\udfe1',t:'\u0424\u0435\u0440\u043c. \u043c\u0430\u0433\u0430\u0437\u0438\u043d',d:'\u041f\u0440\u044f\u043c\u044b\u0435 \u043f\u0440\u043e\u0434\u0430\u0436\u0438 \u0433\u043e\u0441\u0442\u044f\u043c \u043f\u0430\u0440\u043a\u0430 \u2014 1M+ \u0432 \u0433\u043e\u0434',c:OR},{e:'\ud83c\udf93',t:'\u041e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435',d:'\u041c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b: \u0441\u044b\u0440\u043e\u0432\u0430\u0440\u0435\u043d\u0438\u0435, \u043f\u0447\u0435\u043b\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u043e, \u043e\u0433\u043e\u0440\u043e\u0434',c:PR}].map((a:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:a.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{a.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{a.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{a.d}</div></div></div>)}</div>
{/* PARTNERS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0410\u0420\u0422\u041d\u0401\u0420\u0421\u0422\u0412\u041e'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u0447\u0435\u0441\u0442\u0432\u043e'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0430\u0435\u043c \u0444\u0435\u0440\u043c\u0435\u0440\u043e\u0432 \u0438 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u0435\u0439 \u044d\u043a\u043e\u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432. \u0420\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u043f\u0440\u043e\u0434\u0443\u043a\u0446\u0438\u0438 \u0432 \u043f\u0430\u0440\u043a\u0435, \u0443\u0447\u0430\u0441\u0442\u0438\u0435 \u0432 \u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u044f\u0445, \u043c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u043e\u0442 \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430.'}</div></div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+G}}><div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0410\u0433\u0440\u043e \u2014 \u044d\u0442\u043e \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u0435 \u043a \u043a\u043e\u0440\u043d\u044f\u043c. \u041c\u044b \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u043c, \u043a\u0430\u043a \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u0438 \u043d\u0430\u0440\u043e\u0434\u043e\u0432 \u0441\u043e\u0437\u0434\u0430\u044e\u0442 \u0447\u0438\u0441\u0442\u0443\u044e \u0435\u0434\u0443.\u00bb'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u041a\u043e\u043c\u0430\u043d\u0434\u0430 \u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0410\u0433\u0440\u043e'}</div></div></div>
{/* CTA */}
{sent?<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'28px 16px',textAlign:'center'}}><div style={{fontSize:36,marginBottom:4}}>{'\u2705'}</div><div style={{fontSize:17,fontWeight:700,color:G,fontFamily:FD}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e!'}</div></div></div>
:<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20,textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,fontFamily:FD,marginBottom:16}}>{'\u0421\u0442\u0430\u0442\u044c \u043f\u0430\u0440\u0442\u043d\u0451\u0440\u043e\u043c'}</div>
<div style={{textAlign:'left',marginBottom:10}}><input value={nm} onChange={(e:any)=>setNm(e.target.value)} placeholder={'\u0418\u043c\u044f'} style={{width:'100%',padding:'14px 16px',borderRadius:16,...GL,fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
<div style={{textAlign:'left',marginBottom:16}}><input value={ph} onChange={(e:any)=>setPh(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:'100%',padding:'14px 16px',borderRadius:16,...GL,fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
{err&&<div style={{fontSize:13,color:RD,marginBottom:8}}>{err}</div>}
<div className="tap" onClick={submit} style={{height:50,borderRadius:16,background:G,display:'flex',alignItems:'center',justifyContent:'center',opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{sending?'...':'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}</span></div></div></div>}
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:18}}><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>agro@ethnomir.ru<br/>ethnomir.ru</div></div></div>
<div style={{height:80}}/>
</div>;
}

function Vision2030LandingV2({onClose}:{onClose:()=>void}){
const I='#5856D6',G='#34C759',BL='#007AFF',OR='#FF9500',PR='#AF52DE',RD='#FF3B30',C='#5AC8FA';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#EEF2FF 0%,#F2F2F7 12%,#F2F2F7 50%,#EDE9FE 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:400,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(15,10,40,.3) 0%,rgba(10,5,30,.85) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...GL,background:'rgba(88,86,214,.75)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0412\u0418\u0417\u0418\u042f'}</div><div style={{fontSize:30,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 2030'}</div><div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u041a\u0440\u0435\u0430\u0442\u0438\u0432\u043d\u044b\u0439 \u0433\u043e\u0440\u043e\u0434 \u0438 \u043a\u043b\u0430\u0441\u0442\u0435\u0440 \u043c\u0438\u0440\u043e\u0432\u043e\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f.'}</div></div></div>
{/* METRICS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{[{t:'250+',l:'\u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u043e\u0432',c:I},{t:'3.5M',l:'\u0433\u043e\u0441\u0442\u0435\u0439/\u0433\u043e\u0434',c:G},{t:'\u0420\u043e\u0441\u0441\u0438\u044f+',l:'\u0415\u0432\u0440\u043e\u043f\u0430 \u0438 \u0421\u0428\u0410',c:BL},{t:'\u0428\u043a\u043e\u043b\u0430',l:'\u0438\u043d\u043d\u043e\u0432\u0430\u0446\u0438\u043e\u043d\u043d\u0430\u044f',c:OR}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:16,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:10,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
{/* VISION */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u0440\u0435\u0430\u0442\u0438\u0432\u043d\u044b\u0439 \u0433\u043e\u0440\u043e\u0434'}</div><div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u0412 2030 \u0433\u043e\u0434\u0443 \u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0441\u0442\u0430\u043d\u0435\u0442 \u043a\u0440\u0435\u0430\u0442\u0438\u0432\u043d\u044b\u043c \u0433\u043e\u0440\u043e\u0434\u043e\u043c \u2014 \u043a\u043b\u0430\u0441\u0442\u0435\u0440\u043e\u043c \u044d\u0442\u043d\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e, \u044d\u043a\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u0438 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0433\u043e \u0442\u0443\u0440\u0438\u0437\u043c\u0430. \u041f\u0440\u043e\u0435\u043a\u0442 \u0431\u0443\u0434\u0435\u0442 \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u0435\u043d \u0432 \u0420\u043e\u0441\u0441\u0438\u0438, \u0415\u0432\u0440\u043e\u043f\u0435 \u0438 \u0421\u0428\u0410. \u0418\u043d\u043d\u043e\u0432\u0430\u0446\u0438\u043e\u043d\u043d\u0430\u044f \u0448\u043a\u043e\u043b\u0430 \u0441 \u043f\u0435\u0440\u0435\u0434\u043e\u0432\u044b\u043c\u0438 \u043c\u0435\u0442\u043e\u0434\u0430\u043c\u0438 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f.'}</div></div></div>
{/* GROWTH CHART */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:I,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0420\u041e\u0421\u0422'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041e\u0442 85 \u0434\u043e 250+ \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u043e\u0432'}</div>
<svg viewBox="0 -5 310 130" style={{width:'100%'}}><defs><linearGradient id="vf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={I} stopOpacity="0.3"/><stop offset="100%" stopColor={I} stopOpacity="0"/></linearGradient></defs><polyline points="10,95 65,88 120,72 175,55 230,35 285,18" fill="none" stroke={I} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><polygon points="10,95 65,88 120,72 175,55 230,35 285,18 285,112 10,112" fill="url(#vf)"/>
{[{x:10,y:95,l:'2008',v:'5'},{x:65,y:88,l:'2012',v:'20'},{x:120,y:72,l:'2016',v:'45'},{x:175,y:55,l:'2020',v:'65'},{x:230,y:35,l:'2024',v:'85'},{x:275,y:18,l:'2030',v:'250+'}].map((p:any,i:number)=><g key={i}><circle cx={p.x} cy={p.y} r="4" fill={i===5?OR:I}/><text x={p.x} y={p.y-8} textAnchor="middle" fontSize="8" fontWeight="700" fill={i===5?OR:I} fontFamily={FT}>{p.v}</text><text x={p.x} y={118} textAnchor="middle" fontSize="7" fill="rgba(60,60,67,.4)" fontFamily={FT}>{p.l}</text></g>)}</svg></div></div>
{/* DIRECTIONS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:I,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041d\u0410\u041f\u0420\u0410\u0412\u041b\u0415\u041d\u0418\u042f'}</div><div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u041f\u0440\u043e\u0435\u043a\u0442\u044b \u0434\u043e 2030'}</div>
{[{e:'\ud83c\udfe0',t:'250+ \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u043e\u0432',d:'\u041a\u0443\u043b\u044c\u0442\u0443\u0440\u044b \u0432\u0441\u0435\u0445 \u043d\u0430\u0440\u043e\u0434\u043e\u0432 \u043c\u0438\u0440\u0430 \u043d\u0430 \u043e\u0434\u043d\u043e\u0439 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438',c:I},{e:'\ud83c\udf93',t:'\u0418\u043d\u043d\u043e\u0432\u0430\u0446\u0438\u043e\u043d\u043d\u0430\u044f \u0448\u043a\u043e\u043b\u0430',d:'\u041f\u0435\u0440\u0435\u0434\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u043e\u0434\u044b \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f, \u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043b\u0438\u0447\u043d\u043e\u0441\u0442\u0438',c:OR},{e:'\ud83c\udf0d',t:'\u041c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u0430\u044f \u0441\u0435\u0442\u044c',d:'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0432 \u0415\u0432\u0440\u043e\u043f\u0435 \u0438 \u0421\u0428\u0410. \u0413\u043b\u043e\u0431\u0430\u043b\u044c\u043d\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442',c:BL},{e:'\ud83c\udfd5',t:'\u041b\u0430\u0433\u0435\u0440\u044f \u0438 \u0444\u043e\u0440\u0443\u043c\u044b',d:'\u041f\u043b\u043e\u0449\u0430\u0434\u043a\u0430 \u0434\u043b\u044f \u043a\u043e\u043d\u0444\u0435\u0440\u0435\u043d\u0446\u0438\u0439, \u0441\u043b\u0451\u0442\u043e\u0432, \u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u0435\u0439',c:G},{e:'\ud83c\udf31',t:'\u042d\u043a\u043e\u043b\u043e\u0433\u0438\u044f \u0438 \u0430\u0433\u0440\u043e',d:'\u0421\u0435\u043b\u044c\u0441\u043a\u043e\u0435 \u0445\u043e\u0437\u044f\u0439\u0441\u0442\u0432\u043e, \u044d\u043a\u043e\u0442\u0443\u0440\u0438\u0437\u043c, \u0440\u0430\u0437\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0441\u0431\u043e\u0440',c:G},{e:'\ud83c\udfe1',t:'\u041d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c',d:'\u041a\u043e\u0442\u0442\u0435\u0434\u0436\u043d\u044b\u0439 \u043f\u043e\u0441\u0451\u043b\u043e\u043a \u00ab\u041c\u0438\u0440\u00bb \u0443 \u043f\u0430\u0440\u043a\u0430',c:PR}].map((f:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:48,height:48,borderRadius:14,background:f.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{f.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{f.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{f.d}</div></div></div>)}</div>
{/* DONUT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0422\u0420\u0423\u041a\u0422\u0423\u0420\u0410'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u044f'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/><circle cx="50" cy="50" r="42" fill="none" stroke={I} strokeWidth="12" strokeDasharray="79 185" strokeDashoffset="66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-13" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={G} strokeWidth="12" strokeDasharray="40 224" strokeDashoffset="-119" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={PR} strokeWidth="12" strokeDasharray="26 238" strokeDashoffset="-159" strokeLinecap="round"/></svg>
<div style={{flex:1}}>{[{c:I,l:'\u042d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u044b',v:'30%'},{c:OR,l:'\u041e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435',v:'20%'},{c:BL,l:'\u041c\u0435\u0436\u0434\u0443\u043d\u0430\u0440.',v:'20%'},{c:G,l:'\u042d\u043a\u043e/\u0410\u0433\u0440\u043e',v:'15%'},{c:PR,l:'\u041d\u0435\u0434\u0432\u0438\u0436\u0438\u043c.',v:'15%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:i<4?6:0}}><div style={{width:8,height:8,borderRadius:4,background:r.c}}/><span style={{fontSize:11,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:11,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}</div></div></div></div>
{/* TIMELINE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0418\u0421\u0422\u041e\u0420\u0418\u042f'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u041a\u043b\u044e\u0447\u0435\u0432\u044b\u0435 \u0432\u0435\u0445\u0438'}</div>
{[{y:'2008',t:'\u041e\u0441\u043d\u043e\u0432\u0430\u043d\u0438\u0435',d:'\u041d\u0430\u0447\u0430\u043b\u043e \u0441\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430 \u043d\u0430 140 \u0433\u0430',c:I},{y:'2016',t:'\u041e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435 \u041f\u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442\u0430',d:'\u0424\u043e\u0440\u0443\u043c \u0410\u0421\u0418, \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0412.\u0412. \u041f\u0443\u0442\u0438\u043d\u0430',c:G},{y:'2024',t:'85 \u044d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u043e\u0432',d:'1M+ \u0433\u043e\u0441\u0442\u0435\u0439/\u0433\u043e\u0434, 13 \u043e\u0442\u0435\u043b\u0435\u0439, \u0444\u043e\u0440\u0443\u043c\u044b \u0411\u0420\u0418\u041a\u0421',c:BL},{y:'2030',t:'\u041a\u0440\u0435\u0430\u0442\u0438\u0432\u043d\u044b\u0439 \u0433\u043e\u0440\u043e\u0434',d:'250+ \u0434\u0432\u043e\u0440\u043e\u0432, 3.5M \u0433\u043e\u0441\u0442\u0435\u0439, \u0448\u043a\u043e\u043b\u0430, \u043c\u0435\u0436\u0434. \u0441\u0435\u0442\u044c',c:OR}].map((m:any,i:number)=><div key={i} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:i<3?'.5px solid rgba(60,60,67,.08)':'none'}}><div style={{width:48,textAlign:'center',flexShrink:0}}><div style={{fontSize:13,fontWeight:800,color:m.c,fontFamily:FD}}>{m.y}</div></div><div><div style={{fontSize:15,fontWeight:700,fontFamily:FD}}>{m.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{m.d}</div></div></div>)}</div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+I}}><div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0441\u0442\u0430\u043d\u0435\u0442 \u0444\u043b\u0430\u0433\u043c\u0430\u043d\u043e\u043c \u0432 \u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0438 \u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0438 \u0441\u0438\u043b\u044c\u043d\u043e\u0439 \u0438 \u0446\u0435\u043b\u044c\u043d\u043e\u0439 \u043b\u0438\u0447\u043d\u043e\u0441\u0442\u0438, \u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0438\u043d\u0430 \u0420\u043e\u0441\u0441\u0438\u0438 \u0438 \u043c\u0438\u0440\u0430.\u00bb'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u041c\u0438\u0441\u0441\u0438\u044f \u042d\u0442\u043d\u043e\u043c\u0438\u0440 2030'}</div></div></div>
{/* ACHIEVEMENTS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u0414\u041e\u0421\u0422\u0418\u0416\u0415\u041d\u0418\u042f'}</div>
{[{e:'\ud83c\udfc6',t:'\u041e\u0434\u043e\u0431\u0440\u0435\u043d \u041f\u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442\u043e\u043c \u0420\u0424',d:'\u0424\u043e\u0440\u0443\u043c \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043a\u0438\u0445 \u0438\u043d\u0438\u0446\u0438\u0430\u0442\u0438\u0432 \u0410\u0421\u0418, 2016',c:I},{e:'\ud83c\udf0d',t:'\u0424\u043e\u0440\u0443\u043c\u044b \u0411\u0420\u0418\u041a\u0421',d:'\u041f\u043b\u043e\u0449\u0430\u0434\u043a\u0430 \u043c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u044b\u0445 \u043c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u0439',c:BL},{e:'\ud83c\udfe8',t:'13 \u044d\u0442\u043d\u043e\u043e\u0442\u0435\u043b\u0435\u0439',d:'\u0423\u043d\u0438\u043a\u0430\u043b\u044c\u043d\u044b\u0435 \u0433\u043e\u0441\u0442\u0438\u043d\u0438\u0446\u044b \u0432 \u0441\u0442\u0438\u043b\u0435 \u043d\u0430\u0440\u043e\u0434\u043e\u0432 \u043c\u0438\u0440\u0430',c:OR},{e:'\ud83d\udcda',t:'\u041a\u0440\u0443\u043f\u043d\u0435\u0439\u0448\u0438\u0439 \u0432 \u0420\u043e\u0441\u0441\u0438\u0438',d:'\u0421\u0430\u043c\u044b\u0439 \u0431\u043e\u043b\u044c\u0448\u043e\u0439 \u044d\u0442\u043d\u043e\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043f\u0430\u0440\u043a-\u043c\u0443\u0437\u0435\u0439',c:G}].map((a:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:a.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{a.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{a.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{a.d}</div></div></div>)}</div>
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:18}}><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>zakaz@ethnomir.ru<br/>ethnomir.ru/etno/ethnomir-2030</div></div></div>
<div style={{height:80}}/>
</div>;
}

function EcoLandingV2({onClose}:{onClose:()=>void}){
const G='#34C759',BL='#007AFF',OR='#FF9500',PR='#AF52DE',RD='#FF3B30',I='#5856D6',C='#5AC8FA';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#ECFDF5 0%,#F2F2F7 12%,#F2F2F7 50%,#F0FDF4 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:360,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,40,20,.2) 0%,rgba(0,20,10,.82) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...GL,background:'rgba(52,199,89,.75)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u042d\u041a\u041e\u041b\u041e\u0413\u0418\u042f'}</div><div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u0417\u0435\u043b\u0451\u043d\u044b\u0439 \u042d\u0442\u043d\u043e\u043c\u0438\u0440'}</div><div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u0420\u0430\u0437\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0441\u0431\u043e\u0440, \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0430, \u044d\u043a\u043e\u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435.'}</div></div></div>
{/* METRICS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>{[{t:'140 \u0433\u0430',l:'\u043b\u0435\u0441\u043d\u0430\u044f \u0437\u043e\u043d\u0430',c:G},{t:'0',l:'\u0441\u0432\u0430\u043b\u043e\u043a',c:BL},{t:'100%',l:'\u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430',c:OR}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:16,padding:'16px 8px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:9,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
{/* CONCEPT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041f\u0440\u0438\u043d\u0446\u0438\u043f\u044b 3R'}</div><div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'Reduce \u2014 \u0441\u043e\u043a\u0440\u0430\u0449\u0430\u0439. Reuse \u2014 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439 \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u043e. Recycle \u2014 \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0439. \u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0437\u0430\u0431\u043e\u0442\u0438\u0442\u0441\u044f \u043e \u043f\u0440\u0438\u0440\u043e\u0434\u0435 \u0438 \u0432\u043d\u0435\u0434\u0440\u044f\u0435\u0442 \u0441\u0438\u0441\u0442\u0435\u043c\u0443 \u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0433\u043e \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u044f \u0441 \u043e\u0442\u0445\u043e\u0434\u0430\u043c\u0438 \u043d\u0430 \u0432\u0441\u0435\u0439 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438 \u043f\u0430\u0440\u043a\u0430.'}</div></div></div>
{/* DIRECTIONS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041d\u0410\u041f\u0420\u0410\u0412\u041b\u0415\u041d\u0418\u042f'}</div>
{[{e:'\u267b\ufe0f',t:'\u0420\u0430\u0437\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0441\u0431\u043e\u0440',d:'\u041a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u044b \u0434\u043b\u044f \u043f\u043b\u0430\u0441\u0442\u0438\u043a\u0430, \u0441\u0442\u0435\u043a\u043b\u0430, \u0431\u0443\u043c\u0430\u0433\u0438, \u043c\u0435\u0442\u0430\u043b\u043b\u0430 \u043d\u0430 \u0432\u0441\u0435\u0439 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438.',c:G},{e:'\ud83c\udf31',t:'\u041a\u043e\u043c\u043f\u043e\u0441\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435',d:'\u041e\u0440\u0433\u0430\u043d\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043e\u0442\u0445\u043e\u0434\u044b \u043f\u0440\u0435\u0432\u0440\u0430\u0449\u0430\u044e\u0442\u0441\u044f \u0432 \u0443\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435 \u0434\u043b\u044f \u044d\u0442\u043d\u043e\u0444\u0435\u0440\u043c\u044b.',c:OR},{e:'\ud83d\udca1',t:'\u042d\u043d\u0435\u0440\u0433\u043e\u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c',d:'\u0421\u043e\u043b\u043d\u0435\u0447\u043d\u044b\u0435 \u043f\u0430\u043d\u0435\u043b\u0438, LED-\u043e\u0441\u0432\u0435\u0449\u0435\u043d\u0438\u0435, \u044d\u043d\u0435\u0440\u0433\u043e\u0441\u0431\u0435\u0440\u0435\u0433\u0430\u044e\u0449\u0438\u0435 \u0441\u0438\u0441\u0442\u0435\u043c\u044b.',c:BL},{e:'\ud83c\udf33',t:'\u041e\u0437\u0435\u043b\u0435\u043d\u0435\u043d\u0438\u0435',d:'\u0412\u044b\u0441\u0430\u0434\u043a\u0430 \u0434\u0435\u0440\u0435\u0432\u044c\u0435\u0432, \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u043b\u0435\u0441\u043d\u043e\u0433\u043e \u043c\u0430\u0441\u0441\u0438\u0432\u0430 \u043d\u0430 140 \u0433\u0430.',c:G},{e:'\ud83c\udf93',t:'\u042d\u043a\u043e\u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435',d:'\u041c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b, \u043b\u0435\u043a\u0446\u0438\u0438, \u044d\u043a\u043e\u043a\u0432\u0435\u0441\u0442\u044b \u0434\u043b\u044f \u0434\u0435\u0442\u0435\u0439 \u0438 \u0432\u0437\u0440\u043e\u0441\u043b\u044b\u0445.',c:PR}].map((f:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:48,height:48,borderRadius:14,background:f.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{f.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{f.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{f.d}</div></div></div>)}</div>
{/* DONUT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041e\u0422\u0425\u041e\u0414\u042b'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0438'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/><circle cx="50" cy="50" r="42" fill="none" stroke={G} strokeWidth="12" strokeDasharray="92 172" strokeDashoffset="66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-26" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="40 224" strokeDashoffset="-79" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={PR} strokeWidth="12" strokeDasharray="40 224" strokeDashoffset="-119" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={C} strokeWidth="12" strokeDasharray="26 238" strokeDashoffset="-159" strokeLinecap="round"/></svg>
<div style={{flex:1}}>{[{c:G,l:'\u041f\u043b\u0430\u0441\u0442\u0438\u043a',v:'35%'},{c:BL,l:'\u0411\u0443\u043c\u0430\u0433\u0430',v:'20%'},{c:OR,l:'\u0421\u0442\u0435\u043a\u043b\u043e',v:'15%'},{c:PR,l:'\u041e\u0440\u0433\u0430\u043d\u0438\u043a\u0430',v:'15%'},{c:C,l:'\u041c\u0435\u0442\u0430\u043b\u043b',v:'15%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:i<4?6:0}}><div style={{width:8,height:8,borderRadius:4,background:r.c}}/><span style={{fontSize:11,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:11,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}</div></div></div></div>
{/* PROGRESS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0420\u041e\u0413\u0420\u0415\u0421\u0421'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0426\u0435\u043b\u0438 \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430'}</div>
{[{l:'\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043e\u0442\u0445\u043e\u0434\u043e\u0432',v:85,c:G},{l:'\u041f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0430',v:60,c:BL},{l:'\u041a\u043e\u043c\u043f\u043e\u0441\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435',v:45,c:OR},{l:'\u042d\u043d\u0435\u0440\u0433\u043e\u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c',v:70,c:PR}].map((b:any,i:number)=><div key={i} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:13,fontFamily:FT}}>{b.l}</span><span style={{fontSize:13,fontWeight:700,color:b.c,fontFamily:FD}}>{b.v+'%'}</span></div><div style={{height:8,borderRadius:4,background:'rgba(120,120,128,.08)',overflow:'hidden'}}><div style={{height:'100%',width:b.v+'%',borderRadius:4,background:b.c}}/></div></div>)}
</div></div>
{/* IMPACT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u042d\u0424\u0424\u0415\u041a\u0422'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0427\u0442\u043e \u0434\u0430\u0451\u0442 \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0430'}</div>
{[{e:'\ud83c\udf32',t:'500+ \u0434\u0435\u0440\u0435\u0432\u044c\u0435\u0432/\u0433\u043e\u0434',d:'\u0441\u043f\u0430\u0441\u0435\u043d\u043e \u0431\u043b\u0430\u0433\u043e\u0434\u0430\u0440\u044f \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0435 \u043c\u0430\u043a\u0443\u043b\u0430\u0442\u0443\u0440\u044b',c:G},{e:'\ud83d\udca7',t:'2M \u043b\u0438\u0442\u0440\u043e\u0432 \u0432\u043e\u0434\u044b',d:'\u0441\u044d\u043a\u043e\u043d\u043e\u043c\u043b\u0435\u043d\u043e \u0437\u0430 \u0441\u0447\u0451\u0442 \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0438 \u043f\u043b\u0430\u0441\u0442\u0438\u043a\u0430',c:BL},{e:'\u26a1',t:'30% \u044d\u043d\u0435\u0440\u0433\u0438\u0438',d:'\u0441\u043e\u043a\u0440\u0430\u0449\u0435\u043d\u0438\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u0430 \u043e\u0442 LED \u0438 \u0441\u043e\u043b\u043d\u0435\u0447\u043d\u044b\u0445 \u043f\u0430\u043d\u0435\u043b\u0435\u0439',c:OR},{e:'\ud83c\udf0d',t:'\u041d\u0443\u043b\u044c \u0441\u0432\u0430\u043b\u043e\u043a',d:'\u0446\u0435\u043b\u044c \u2014 \u043f\u043e\u043b\u043d\u0430\u044f \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u043a 2030',c:PR}].map((a:any,i:number)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<3?'.5px solid rgba(60,60,67,.08)':'none'}}><div style={{fontSize:24,width:36,textAlign:'center',flexShrink:0}}>{a.e}</div><div><div style={{fontSize:15,fontWeight:700,color:a.c,fontFamily:FD}}>{a.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:1}}>{a.d}</div></div></div>)}
</div></div>
{/* HOW TO HELP */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:PR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041a\u0410\u041a \u041f\u041e\u041c\u041e\u0427\u042c'}</div>
{[{e:'1',t:'\u0421\u043e\u0440\u0442\u0438\u0440\u0443\u0439\u0442\u0435',d:'\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u0446\u0432\u0435\u0442\u043d\u044b\u0435 \u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u044b \u043d\u0430 \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438',c:G},{e:'2',t:'\u0411\u0435\u0440\u0438\u0442\u0435 \u0441\u0432\u043e\u0451',d:'\u041c\u043d\u043e\u0433\u043e\u0440\u0430\u0437\u043e\u0432\u0430\u044f \u0431\u0443\u0442\u044b\u043b\u043a\u0430, \u0441\u0443\u043c\u043a\u0430, \u0442\u0435\u0440\u043c\u043e\u043a\u0440\u0443\u0436\u043a\u0430',c:BL},{e:'3',t:'\u0423\u0447\u0430\u0441\u0442\u0432\u0443\u0439\u0442\u0435',d:'\u042d\u043a\u043e\u043a\u0432\u0435\u0441\u0442\u044b, \u043c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b \u043f\u043e \u043f\u0435\u0440\u0435\u0440\u0430\u0431\u043e\u0442\u043a\u0435',c:OR}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:14,alignItems:'center'}}><div style={{width:36,height:36,borderRadius:18,background:s.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:s.c,fontFamily:FD,flexShrink:0}}>{s.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{s.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{s.d}</div></div></div>)}</div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+G}}><div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u2014 \u043d\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u043d\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442, \u043d\u043e \u0438 \u044d\u043a\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0438\u0439. \u041c\u044b \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u043c, \u0447\u0442\u043e \u0437\u0430\u0431\u043e\u0442\u0430 \u043e \u043f\u0440\u0438\u0440\u043e\u0434\u0435 \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442\u0441\u044f \u0441 \u043a\u0430\u0436\u0434\u043e\u0433\u043e.\u00bb'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u041a\u043e\u043c\u0430\u043d\u0434\u0430 \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430'}</div></div></div>
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:18}}><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>eco@ethnomir.ru<br/>ethnomir.ru</div></div></div>
<div style={{height:80}}/>
</div>;
}

function CharityLandingV2({onClose,cart,setCart}:{onClose:()=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void}){
const G='#34C759',BL='#007AFF',OR='#FF9500',PR='#AF52DE',RD='#FF3B30',I='#5856D6',C='#5AC8FA',GOLD='#D4A017';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
const[amt,setAmt]=(React as any).useState(2);
const amounts=[500,1000,3000,5000,10000];
const[custom,setCustom]=(React as any).useState(3000);const[doneSt,setDoneSt]=(React as any).useState(false);
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#FFF7ED 0%,#F2F2F7 12%,#F2F2F7 50%,#FFFBEB 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:380,borderRadius:'0 0 20px 20px',overflow:'hidden'}}><img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(40,20,0,.2) 0%,rgba(30,10,0,.82) 100%)'}}/><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}><div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...GL,background:'rgba(212,160,23,.75)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0424\u041e\u041d\u0414'}</div><div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u0411\u043b\u0430\u0433\u043e\u0442\u0432\u043e\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c'}</div><div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u0424\u043e\u043d\u0434 \u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440 \u2014 \u0415\u0434\u0438\u043d\u044b\u0439 \u041c\u0438\u0440\u00bb. \u0421 2005 \u0433\u043e\u0434\u0430.'}</div></div></div>
{/* METRICS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{[{t:'500+',l:'\u043f\u0440\u043e\u0435\u043a\u0442\u043e\u0432',c:GOLD},{t:'60',l:'\u0441\u0442\u0440\u0430\u043d \u043c\u0438\u0440\u0430',c:BL},{t:'\u041e\u041e\u041d',l:'\u043a\u043e\u043d\u0441\u0443\u043b\u044c\u0442. \u0441\u0442\u0430\u0442\u0443\u0441',c:I},{t:'2005',l:'\u0433\u043e\u0434 \u043e\u0441\u043d\u043e\u0432\u0430\u043d\u0438\u044f',c:G}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:16,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:10,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
{/* MISSION */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041c\u0438\u0441\u0441\u0438\u044f'}</div><div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u043f\u043b\u043e\u0449\u0430\u0434\u043e\u043a \u0434\u043b\u044f \u0436\u0438\u0432\u043e\u0433\u043e \u0434\u0438\u0430\u043b\u043e\u0433\u0430 \u043a\u0443\u043b\u044c\u0442\u0443\u0440 \u0432\u043e \u0432\u0441\u0451\u043c \u043c\u0438\u0440\u0435. \u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u0438 \u043f\u043e\u043f\u0443\u043b\u044f\u0440\u0438\u0437\u0430\u0446\u0438\u044f \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0445 \u043a\u0443\u043b\u044c\u0442\u0443\u0440 \u043d\u0430\u0440\u043e\u0434\u043e\u0432 \u043c\u0438\u0440\u0430. \u0424\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0442\u043e\u043b\u0435\u0440\u0430\u043d\u0442\u043d\u043e\u0441\u0442\u0438 \u0438 \u0443\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u0435 \u0434\u0440\u0443\u0436\u0431\u044b \u043c\u0435\u0436\u0434\u0443 \u043d\u0430\u0440\u043e\u0434\u0430\u043c\u0438.'}</div></div></div>
{/* DIRECTIONS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:GOLD,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041d\u0410\u041f\u0420\u0410\u0412\u041b\u0415\u041d\u0418\u042f'}</div>
{[{e:'\ud83c\udfe0',t:'\u042d\u0442\u043d\u043e\u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0430',d:'\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u044d\u0442\u043d\u043e\u043f\u0430\u0440\u043a\u043e\u0432 \u0432 \u0420\u043e\u0441\u0441\u0438\u0438, \u0415\u0432\u0440\u043e\u043f\u0435, \u0421\u0428\u0410',c:GOLD},{e:'\ud83c\udf0d',t:'\u041f\u0430\u043c\u044f\u0442\u043d\u0438\u043a\u0438 \u043c\u0438\u0440\u0430',d:'\u0411\u044e\u0441\u0442\u044b \u0413\u0430\u0433\u0430\u0440\u0438\u043d\u0430, \u0426\u0438\u043e\u043b\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e \u0432 60 \u0441\u0442\u0440\u0430\u043d\u0430\u0445',c:BL},{e:'\ud83c\udf93',t:'\u041e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435',d:'\u041f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u044b \u0434\u043b\u044f \u0448\u043a\u043e\u043b\u044c\u043d\u0438\u043a\u043e\u0432 \u0438 \u0441\u0442\u0443\u0434\u0435\u043d\u0442\u043e\u0432',c:OR},{e:'\ud83e\udd1d',t:'\u0414\u0440\u0443\u0436\u0431\u0430 \u043d\u0430\u0440\u043e\u0434\u043e\u0432',d:'\u041a\u043e\u043d\u0444\u0435\u0440\u0435\u043d\u0446\u0438\u0438, \u0444\u043e\u0440\u0443\u043c\u044b \u0411\u0420\u0418\u041a\u0421, \u0434\u0438\u0430\u043b\u043e\u0433',c:G},{e:'\ud83c\udfa8',t:'\u041a\u0443\u043b\u044c\u0442\u0443\u0440\u043d\u043e\u0435 \u043d\u0430\u0441\u043b\u0435\u0434\u0438\u0435',d:'\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u0439, \u0440\u0435\u043c\u0451\u0441\u0435\u043b, \u044f\u0437\u044b\u043a\u043e\u0432',c:PR}].map((f:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:48,height:48,borderRadius:14,background:f.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{f.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{f.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{f.d}</div></div></div>)}</div>
{/* DONUT */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:I,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0420\u041e\u0415\u041a\u0422\u042b'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0413\u0435\u043e\u0433\u0440\u0430\u0444\u0438\u044f \u0444\u043e\u043d\u0434\u0430'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/><circle cx="50" cy="50" r="42" fill="none" stroke={GOLD} strokeWidth="12" strokeDasharray="106 158" strokeDashoffset="66" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="66 198" strokeDashoffset="-40" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={G} strokeWidth="12" strokeDasharray="40 224" strokeDashoffset="-106" strokeLinecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="26 238" strokeDashoffset="-146" strokeLinecap="round"/></svg>
<div style={{flex:1}}>{[{c:GOLD,l:'\u0420\u043e\u0441\u0441\u0438\u044f',v:'40%'},{c:BL,l:'\u0415\u0432\u0440\u043e\u043f\u0430',v:'25%'},{c:G,l:'\u041b\u0430\u0442. \u0410\u043c\u0435\u0440\u0438\u043a\u0430',v:'20%'},{c:OR,l:'\u0410\u0437\u0438\u044f \u0438 \u0410\u0444\u0440\u0438\u043a\u0430',v:'15%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:i<3?6:0}}><div style={{width:8,height:8,borderRadius:4,background:r.c}}/><span style={{fontSize:11,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:11,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}</div></div></div></div>
{/* ACHIEVEMENTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0420\u0418\u0417\u041d\u0410\u041d\u0418\u0415'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u041d\u0430\u0433\u0440\u0430\u0434\u044b \u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u044b'}</div>
{[{e:'\ud83c\uddfa\ud83c\uddf3',t:'\u041a\u043e\u043d\u0441\u0443\u043b\u044c\u0442. \u0441\u0442\u0430\u0442\u0443\u0441 \u041e\u041e\u041d',d:'\u042d\u043a\u043e\u043d\u043e\u043c\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0438 \u0421\u043e\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u0421\u043e\u0432\u0435\u0442, 2015',c:BL},{e:'\ud83c\udfc6',t:'\u041f\u0440\u0435\u043c\u0438\u044f \u041f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430 \u0420\u0424',d:'\u0417\u0430 \u0434\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u044f \u0432 \u0441\u0444\u0435\u0440\u0435 \u0442\u0443\u0440\u0438\u0437\u043c\u0430, 2016',c:GOLD},{e:'\u2b50',t:'\u041e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435 \u041f\u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442\u0430',d:'\u0424\u043e\u0440\u0443\u043c \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043a\u0438\u0445 \u0438\u043d\u0438\u0446\u0438\u0430\u0442\u0438\u0432 \u0410\u0421\u0418, 2016',c:OR},{e:'\ud83c\udfc5',t:'\u041c\u0435\u0446\u0435\u043d\u0430\u0442 \u0433\u043e\u0434\u0430',d:'\u041f\u0440\u0435\u043c\u0438\u044f \u041c\u0438\u043d\u043a\u0443\u043b\u044c\u0442\u0443\u0440\u044b \u0420\u0424, 2014',c:PR}].map((a:any,i:number)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<3?'.5px solid rgba(60,60,67,.08)':'none'}}><div style={{fontSize:24,width:36,textAlign:'center',flexShrink:0}}>{a.e}</div><div><div style={{fontSize:15,fontWeight:700,fontFamily:FD}}>{a.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:1}}>{a.d}</div></div></div>)}
</div></div>
{/* DONATE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:24}}>
<div style={{textAlign:'center',marginBottom:20}}><div style={{fontSize:32,marginBottom:6}}>{'\ud83d\udc9b'}</div><div style={{fontSize:22,fontWeight:800,fontFamily:FD}}>{'\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0444\u043e\u043d\u0434'}</div></div>
{/* SLIDER */}
<div style={{marginBottom:20}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:12,color:L2,fontFamily:FT}}>{'500 \u20bd'}</span><span style={{fontSize:12,color:L2,fontFamily:FT}}>{'100 000 \u20bd'}</span></div><input type="range" min="500" max="100000" step="500" value={custom} onChange={(e:any)=>{setCustom(Number(e.target.value));setAmt(-1);}} style={{width:'100%',height:6,accentColor:GOLD,borderRadius:3}}/></div>
{/* AMOUNT */}
<div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:40,fontWeight:800,color:GOLD,fontFamily:FD,lineHeight:1}}>{custom.toLocaleString('ru-RU')}</div><div style={{fontSize:15,color:L2,fontFamily:FT,marginTop:2}}>{'\u0440\u0443\u0431\u043b\u0435\u0439'}</div></div>
{/* QUICK */}
<div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:20}}>{amounts.map((a:number,i:number)=><div key={i} className="tap" onClick={()=>{setAmt(i);setCustom(a);}} style={{height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,fontFamily:FD,...(custom===a?{background:GOLD,color:'#fff'}:{background:'rgba(120,120,128,.06)',color:L2}),cursor:'pointer',transition:'all .2s'}}>{a>=1000?(a/1000)+'\u0442':a+''}</div>)}</div>
{/* INFO */}
<div style={{...GL,borderRadius:14,padding:'12px 14px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}><div style={{fontSize:20}}>{'\ud83d\udc9b'}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,fontFamily:FD}}>{'\u041f\u043e\u0436\u0435\u0440\u0442\u0432\u043e\u0432\u0430\u043d\u0438\u0435 \u0444\u043e\u043d\u0434\u0443'}</div><div style={{fontSize:12,color:L2,fontFamily:FT}}>{'\u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440 \u2014 \u0415\u0434\u0438\u043d\u044b\u0439 \u041c\u0438\u0440\u00bb'}</div></div><div style={{fontSize:15,fontWeight:700,color:GOLD,fontFamily:FD,whiteSpace:'nowrap'}}>{custom.toLocaleString('ru-RU')+' \u20bd'}</div></div>
{/* BUTTON */}
<div className="tap" onClick={()=>{if(cart&&setCart){const cid='donate-'+custom;const ex=cart.find((c:any)=>c.id===cid);if(ex){setCart(cart.map((c:any)=>c.id===cid?{...c,qty:c.qty+1}:c));}else{setCart([...cart,{id:cid,cat:'donation',itemId:'donate',name:'\u041f\u043e\u0436\u0435\u0440\u0442\u0432\u043e\u0432\u0430\u043d\u0438\u0435 \u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440\u00bb',emoji:'\ud83d\udc9b',qty:1,price:custom}]);}logActivity('donate_cart',{amount:custom});setDoneSt(true);setTimeout(()=>setDoneSt(false),2500);}}} style={{height:54,borderRadius:16,background:doneSt?G:GOLD,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:8,transition:'background .3s'}}>{doneSt?<span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u2705 \u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443!'}</span>:<><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u0412 \u043a\u043e\u0440\u0437\u0438\u043d\u0443 '+custom.toLocaleString('ru-RU')+' \u20bd'}</span></>}</div>
<div style={{fontSize:11,color:L2,fontFamily:FT,textAlign:'center',marginTop:10}}>{'\u0427\u0435\u043a \u0441 QR-\u043a\u043e\u0434\u043e\u043c \u0432 \u00ab\u041c\u043e\u0438 \u0447\u0435\u043a\u0438\u00bb \u0432 \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0435'}</div>
</div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+GOLD}}><div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u043f\u0440\u043e\u0442\u0438\u0432\u043e\u0440\u0435\u0447\u0438\u0439 \u043c\u043e\u0436\u043d\u043e \u043b\u0438\u0448\u044c \u0447\u0435\u0440\u0435\u0437 \u0438\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u043e \u0434\u0438\u0430\u043b\u043e\u0433\u0430. \u0418\u043c\u0435\u043d\u043d\u043e \u0434\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u0431\u044b\u043b \u0441\u043e\u0437\u0434\u0430\u043d \u043d\u0430\u0448 \u0424\u043e\u043d\u0434.\u00bb'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u0420\u0443\u0441\u043b\u0430\u043d \u0411\u0430\u0439\u0440\u0430\u043c\u043e\u0432, \u043f\u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442 \u0444\u043e\u043d\u0434\u0430'}</div></div></div>
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:18}}><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b \u0444\u043e\u043d\u0434\u0430'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>ethnoworld.ru<br/>+7 495 023-81-81<br/>{'\u041f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430: \u0420\u043e\u0441\u0441\u0438\u044f, \u041a\u0438\u0440\u0433\u0438\u0437\u0438\u044f, \u041a\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043d, \u0427\u0435\u0445\u0438\u044f'}</div></div></div>
<div style={{height:80}}/>
</div>;
}

function FounderLandingV2({onClose,cart,setCart}:{onClose:()=>void,cart?:CartItem[],setCart?:(c:CartItem[])=>void}){
const GOLD='#D4A017',G='#34C759',BL='#007AFF',OR='#FF9500',PR='#AF52DE',I='#5856D6',C='#5AC8FA';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
const amounts=[1000,3000,5000,10000,50000];const[custom,setCustom]=(React as any).useState(3000);const[amt,setAmt]=(React as any).useState(1);const[doneSt,setDoneSt]=(React as any).useState(false);
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#FFFBEB 0%,#F2F2F7 14%,#F2F2F7 50%,#FFF7ED 80%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
{/* HERO */}
<div style={{position:'relative',padding:'54px 20px 0',textAlign:'center'}}><div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,...GL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:2}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
<div style={{width:140,height:140,borderRadius:70,overflow:'hidden',margin:'20px auto 16px',boxShadow:'0 4px 24px rgba(0,0,0,.12)',border:'3px solid rgba(255,255,255,.6)'}}><img src="https://ethnoworld.ru/upload/iblock/774/7747f21e993a2be3ad636b2393f77827.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
<div style={{fontSize:26,fontWeight:800,fontFamily:FD,letterSpacing:'-0.8px',lineHeight:1.1,marginBottom:4}}>{'\u0420\u0443\u0441\u043b\u0430\u043d \u0411\u0430\u0439\u0440\u0430\u043c\u043e\u0432'}</div>
<div style={{fontSize:13,color:L2,fontFamily:FT,marginBottom:20}}>{'\u041e\u0441\u043d\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430 \u0438 \u043f\u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442 \u0444\u043e\u043d\u0434\u0430 \u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440\u00bb'}</div></div>
{/* METRICS */}
<div style={{padding:'0 20px'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>{[{t:'1969',l:'\u0433\u043e\u0434 \u0440\u043e\u0436\u0434.',c:GOLD},{t:'500+',l:'\u043f\u0440\u043e\u0435\u043a\u0442\u043e\u0432',c:BL},{t:'60',l:'\u0441\u0442\u0440\u0430\u043d',c:G}].map((s:any,i:number)=><div key={i} style={{...GL,borderRadius:16,padding:'14px 8px',textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:9,color:L2,fontFamily:FT,marginTop:2,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}</div></div>
{/* BIO */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:GOLD,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0411\u0418\u041e\u0413\u0420\u0410\u0424\u0418\u042f'}</div><div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.65}}>{'\u0420\u043e\u0434\u0438\u043b\u0441\u044f 7 \u0430\u0432\u0433\u0443\u0441\u0442\u0430 1969 \u0433\u043e\u0434\u0430 \u0432 \u0441\u0435\u043b\u0435 \u041d\u043e\u0432\u043e-\u0418\u0432\u0430\u043d\u043e\u0432\u043a\u0430, \u0410\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043d. \u0421\u0435\u043c\u044c\u044f \u0438\u043d\u0442\u0435\u0440\u043d\u0430\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f: \u043c\u0430\u0442\u044c \u2014 \u0440\u0443\u0441\u0441\u043a\u0430\u044f, \u043e\u0442\u0435\u0446 \u2014 \u0430\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043d\u0435\u0446, \u043e\u0431\u0430 \u0444\u0438\u043b\u043e\u043b\u043e\u0433\u0438. \u0412 5 \u043b\u0435\u0442 \u043e\u0442\u0435\u0446 \u043f\u043e\u0432\u0435\u0441\u0438\u043b \u043d\u0430\u0434 \u043a\u0440\u043e\u0432\u0430\u0442\u044c\u044e \u043a\u0430\u0440\u0442\u0443 \u043c\u0438\u0440\u0430 \u2014 \u043e\u0442\u0441\u044e\u0434\u0430 \u0440\u043e\u0434\u0438\u043b\u0430\u0441\u044c \u043c\u0435\u0447\u0442\u0430 \u043e\u0431 \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0435.'}</div></div></div>
{/* EDUCATION */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041e\u0411\u0420\u0410\u0417\u041e\u0412\u0410\u041d\u0418\u0415'}</div>
{[{e:'\ud83c\udf93',t:'\u042e\u0440\u0438\u0434\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0444\u0430\u043a\u0443\u043b\u044c\u0442\u0435\u0442 \u041c\u0413\u0423',d:'\u041c\u043e\u0441\u043a\u043e\u0432\u0441\u043a\u0438\u0439 \u0433\u043e\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0443\u043d\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442 \u0438\u043c. \u041b\u043e\u043c\u043e\u043d\u043e\u0441\u043e\u0432\u0430, 1997',c:BL},{e:'\ud83d\udcbc',t:'MBA',d:'\u0428\u043a\u043e\u043b\u0430 \u043c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u043e\u0433\u043e \u0431\u0438\u0437\u043d\u0435\u0441\u0430 \u0410\u041d\u0425 \u043f\u0440\u0438 \u041f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0435 \u0420\u0424, 2003',c:OR}].map((e:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{fontSize:24,width:40,textAlign:'center',flexShrink:0}}>{e.e}</div><div><div style={{fontSize:15,fontWeight:700,fontFamily:FD}}>{e.t}</div><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:2}}>{e.d}</div></div></div>)}</div>
{/* TIMELINE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:G,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0423\u0422\u042c'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u041a\u043b\u044e\u0447\u0435\u0432\u044b\u0435 \u0432\u0435\u0445\u0438'}</div>
{[{y:'1986',t:'\u041d\u0430\u0447\u0430\u043b\u043e \u043a\u0430\u0440\u044c\u0435\u0440\u044b',c:L2},{y:'2005',t:'\u0424\u043e\u043d\u0434 \u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440\u00bb',c:BL},{y:'2006',t:'\u041e\u0441\u043d\u043e\u0432\u0430\u043d\u0438\u0435 \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430',c:G},{y:'2014',t:'\u041c\u0435\u0446\u0435\u043d\u0430\u0442 \u0433\u043e\u0434\u0430 (\u041c\u0438\u043d\u043a\u0443\u043b\u044c\u0442.)',c:PR},{y:'2015',t:'\u041a\u043e\u043d\u0441\u0443\u043b\u044c\u0442. \u0441\u0442\u0430\u0442\u0443\u0441 \u041e\u041e\u041d',c:BL},{y:'2016',t:'\u041f\u0440\u0435\u043c\u0438\u044f \u041f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430 \u0420\u0424',c:GOLD},{y:'2019',t:'\u041c\u0435\u0434\u0430\u043b\u044c \u00ab\u0417\u0430 \u0437\u0430\u0441\u043b\u0443\u0433\u0438\u00bb II \u0441\u0442.',c:OR}].map((m:any,i:number)=><div key={i} style={{display:'flex',gap:14,padding:'10px 0',borderBottom:i<6?'.5px solid rgba(60,60,67,.08)':'none'}}><div style={{width:44,textAlign:'center',flexShrink:0}}><div style={{fontSize:12,fontWeight:800,color:m.c,fontFamily:FD}}>{m.y}</div></div><div style={{fontSize:14,fontFamily:FT}}>{m.t}</div></div>)}</div></div>
{/* PROJECTS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041f\u0420\u041e\u0415\u041a\u0422\u042b'}</div>
{[{e:'\ud83c\udfe0',t:'\u042d\u0442\u043d\u043e\u043c\u0438\u0440',d:'\u041a\u0440\u0443\u043f\u043d\u0435\u0439\u0448\u0438\u0439 \u044d\u0442\u043d\u043e\u043f\u0430\u0440\u043a \u0420\u043e\u0441\u0441\u0438\u0438, 140 \u0433\u0430, 1M+ \u0433\u043e\u0441\u0442\u0435\u0439/\u0433\u043e\u0434',c:GOLD},{e:'\ud83c\udf0d',t:'\u0414\u0410\u0413 \u0425\u043e\u043b\u0434\u0438\u043d\u0433',d:'80 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0439: \u0422\u0426 \u00ab\u0422\u0440\u0430\u043c\u043f\u043b\u0438\u043d\u00bb, \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b, \u043d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c',c:BL},{e:'\ud83d\udc9b',t:'\u0424\u043e\u043d\u0434 \u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440\u00bb',d:'500+ \u043f\u0440\u043e\u0435\u043a\u0442\u043e\u0432 \u0432 60 \u0441\u0442\u0440\u0430\u043d\u0430\u0445, \u0441\u0442\u0430\u0442\u0443\u0441 \u041e\u041e\u041d',c:OR},{e:'\ud83d\udc74',t:'\u0424\u043e\u043d\u0434 \u00ab\u0421\u043e\u0444\u0438\u044f\u00bb',d:'\u0411\u043b\u0430\u0433\u043e\u0442\u0432\u043e\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0444\u043e\u043d\u0434 \u0434\u043b\u044f \u043f\u043e\u0436\u0438\u043b\u044b\u0445 \u043b\u044e\u0434\u0435\u0439',c:PR},{e:'\ud83c\udfe8',t:'Etnosv\u011bt \u041f\u0440\u0430\u0433\u0430',d:'\u0415\u0432\u0440\u043e\u043f\u0435\u0439\u0441\u043a\u0430\u044f \u0432\u0435\u0440\u0441\u0438\u044f \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430 \u0432 \u0427\u0435\u0445\u0438\u0438',c:G}].map((p:any,i:number)=><div key={i} style={{...GL,borderRadius:20,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:p.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{p.e}</div><div><div style={{fontSize:15,fontWeight:700,fontFamily:FD}}>{p.t}</div><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:2}}>{p.d}</div></div></div>)}</div>
{/* AWARDS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:20}}><div style={{fontSize:12,fontWeight:700,color:GOLD,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041d\u0410\u0413\u0420\u0410\u0414\u042b'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:12}}>{'\u041f\u0440\u0438\u0437\u043d\u0430\u043d\u0438\u0435'}</div>
{[{e:'\ud83c\udfc5',t:'\u041c\u0435\u0434\u0430\u043b\u044c \u00ab\u0417\u0430 \u0437\u0430\u0441\u043b\u0443\u0433\u0438\u00bb II \u0441\u0442.',d:'\u0413\u043e\u0441. \u043d\u0430\u0433\u0440\u0430\u0434\u0430 \u0420\u043e\u0441\u0441\u0438\u0439\u0441\u043a\u043e\u0439 \u0424\u0435\u0434\u0435\u0440\u0430\u0446\u0438\u0438, 2019'},{e:'\ud83c\udfc6',t:'\u041f\u0440\u0435\u043c\u0438\u044f \u041f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430 \u0420\u0424',d:'\u0417\u0430 \u0434\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u044f \u0432 \u0441\u0444\u0435\u0440\u0435 \u0442\u0443\u0440\u0438\u0437\u043c\u0430, 2016'},{e:'\u2b50',t:'\u041e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435 \u041f\u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442\u0430 \u0420\u0424',d:'\u0424\u043e\u0440\u0443\u043c \u0410\u0421\u0418, \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0412.\u0412. \u041f\u0443\u0442\u0438\u043d\u0430, 2016'},{e:'\ud83c\udfc5',t:'\u041c\u0435\u0446\u0435\u043d\u0430\u0442 \u0433\u043e\u0434\u0430',d:'\u041f\u0440\u0435\u043c\u0438\u044f \u041c\u0438\u043d\u043a\u0443\u043b\u044c\u0442\u0443\u0440\u044b \u0420\u0424, 2014'},{e:'\ud83c\uddfa\ud83c\uddf3',t:'\u0421\u0442\u0430\u0442\u0443\u0441 \u041e\u041e\u041d (\u042d\u041a\u041e\u0421\u041e\u0421)',d:'\u041a\u043e\u043d\u0441\u0443\u043b\u044c\u0442. \u0441\u0442\u0430\u0442\u0443\u0441 \u0444\u043e\u043d\u0434\u0430, 2015'},{e:'\u271d\ufe0f',t:'\u041c\u0435\u0434\u0430\u043b\u044c \u041a\u0430\u043b\u0443\u0436\u0441\u043a\u043e\u0439 \u0415\u043f\u0430\u0440\u0445\u0438\u0438',d:'\u041f\u043e\u043c\u043e\u0449\u044c \u0432 \u0432\u043e\u0441\u0441\u0442. \u0421\u0432\u044f\u0442\u043e-\u041b\u0430\u0432\u0440\u0435\u043d\u0442\u044c\u0435\u0432\u0430 \u043c\u043e\u043d\u0430\u0441\u0442\u044b\u0440\u044f'}].map((a:any,i:number)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<5?'.5px solid rgba(60,60,67,.08)':'none'}}><div style={{fontSize:22,width:32,textAlign:'center',flexShrink:0}}>{a.e}</div><div><div style={{fontSize:14,fontWeight:700,fontFamily:FD}}>{a.t}</div><div style={{fontSize:12,color:L2,fontFamily:FT,marginTop:1}}>{a.d}</div></div></div>)}
</div></div>
{/* DONATE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:24}}>
<div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:28,marginBottom:4}}>{'\ud83d\udc9b'}</div><div style={{fontSize:20,fontWeight:800,fontFamily:FD}}>{'\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0434\u0435\u043b\u043e \u0420\u0443\u0441\u043b\u0430\u043d\u0430'}</div></div>
<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:12,color:L2,fontFamily:FT}}>{'1 000 \u20bd'}</span><span style={{fontSize:12,color:L2,fontFamily:FT}}>{'100 000 \u20bd'}</span></div><input type="range" min="1000" max="100000" step="500" value={custom} onChange={(e:any)=>{setCustom(Number(e.target.value));setAmt(-1);}} style={{width:'100%',accentColor:GOLD}}/></div>
<div style={{textAlign:'center',marginBottom:12}}><div style={{fontSize:36,fontWeight:800,color:GOLD,fontFamily:FD,lineHeight:1}}>{custom.toLocaleString('ru-RU')}</div><div style={{fontSize:14,color:L2,fontFamily:FT,marginTop:2}}>{'\u0440\u0443\u0431\u043b\u0435\u0439'}</div></div>
<div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:16}}>{amounts.map((a:number,i:number)=><div key={i} className="tap" onClick={()=>{setAmt(i);setCustom(a);}} style={{height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,fontFamily:FD,...(custom===a?{background:GOLD,color:'#fff'}:{background:'rgba(120,120,128,.06)',color:L2}),cursor:'pointer'}}>{a>=1000?(a/1000)+'\u0442':a+''}</div>)}</div>
<div style={{...GL,borderRadius:14,padding:'12px 14px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}><div style={{fontSize:18}}>{'\ud83d\udc9b'}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,fontFamily:FD}}>{'\u041f\u043e\u0436\u0435\u0440\u0442\u0432\u043e\u0432\u0430\u043d\u0438\u0435 \u0444\u043e\u043d\u0434\u0443'}</div><div style={{fontSize:11,color:L2,fontFamily:FT}}>{'\u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440 \u2014 \u0415\u0434\u0438\u043d\u044b\u0439 \u041c\u0438\u0440\u00bb'}</div></div><div style={{fontSize:14,fontWeight:700,color:GOLD,fontFamily:FD,whiteSpace:'nowrap'}}>{custom.toLocaleString('ru-RU')+' \u20bd'}</div></div>
<div className="tap" onClick={()=>{if(cart&&setCart){const cid='donate-'+custom;const ex=cart.find((c:any)=>c.id===cid);if(ex){setCart(cart.map((c:any)=>c.id===cid?{...c,qty:c.qty+1}:c));}else{setCart([...cart,{id:cid,cat:'donation',itemId:'donate',name:'\u041f\u043e\u0436\u0435\u0440\u0442\u0432\u043e\u0432\u0430\u043d\u0438\u0435 \u00ab\u0414\u0438\u0430\u043b\u043e\u0433 \u041a\u0443\u043b\u044c\u0442\u0443\u0440\u00bb',emoji:'\ud83d\udc9b',qty:1,price:custom}]);}logActivity('donate_cart',{amount:custom,source:'founder'});setDoneSt(true);setTimeout(()=>setDoneSt(false),2500);}}} style={{height:54,borderRadius:16,background:doneSt?G:GOLD,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:8,transition:'background .3s'}}>{doneSt?<span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u2705 \u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443!'}</span>:<><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{'\u0412 \u043a\u043e\u0440\u0437\u0438\u043d\u0443 '+custom.toLocaleString('ru-RU')+' \u20bd'}</span></>}</div>
<div style={{fontSize:11,color:L2,fontFamily:FT,textAlign:'center',marginTop:10}}>{'\u0427\u0435\u043a \u0441 QR-\u043a\u043e\u0434\u043e\u043c \u0432 \u00ab\u041c\u043e\u0438 \u0447\u0435\u043a\u0438\u00bb'}</div>
</div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+GOLD}}><div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u042f \u0432\u0441\u044e \u0441\u0432\u043e\u044e \u0436\u0438\u0437\u043d\u044c \u043e\u0431\u044f\u0437\u0430\u043d \u0431\u044b\u0442\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u044b\u043c, \u0447\u0442\u043e\u0431\u044b \u0434\u043e\u043a\u0430\u0437\u0430\u0442\u044c: \u0444\u0438\u043b\u043e\u0441\u043e\u0444\u0441\u043a\u0438\u0435 \u043a\u043e\u043d\u0446\u0435\u043f\u0446\u0438\u0438 \u0438 \u0431\u0438\u0437\u043d\u0435\u0441 \u2014 \u043f\u043e\u043d\u044f\u0442\u0438\u044f \u0441\u043e\u0432\u043c\u0435\u0441\u0442\u0438\u043c\u044b\u0435.\u00bb'}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u0420\u0443\u0441\u043b\u0430\u043d \u0411\u0430\u0439\u0440\u0430\u043c\u043e\u0432, \u041a\u043e\u043c\u043c\u0435\u0440\u0441\u0430\u043d\u0442\u044a'}</div></div></div>
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{...GL,borderRadius:20,padding:18}}><div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>ethnomir.ru<br/>ethnoworld.ru<br/>+7 495 023-81-81</div></div></div>
<div style={{height:80}}/>
</div>;
}

function ArticlesLandingV2({onClose}:{onClose:()=>void}){
const BL='#007AFF',G='#34C759',OR='#FF9500',PR='#AF52DE',I='#5856D6',RD='#FF3B30',C='#5AC8FA',GOLD='#D4A017';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const GL={background:'rgba(255,255,255,.72)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'};
const cats=['\u0412\u0441\u0435','\u041d\u043e\u0432\u043e\u0441\u0442\u0438','\u0421\u041c\u0418','\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u0438','\u0414\u043e\u0441\u0442\u043e\u043f\u0440\u0438\u043c.','\u0420\u0435\u043c\u0451\u0441\u043b\u0430','\u0412\u0435\u043b\u0438\u043a\u0438\u0435 \u0443\u0447.','\u0423\u043b\u0438\u0446\u0430 \u041c\u0438\u0440\u0430'];
const[articles,setArticles]=(React as any).useState<any[]>([]);
(React as any).useEffect(()=>{fetch('https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/articles?select=id,slug,category,title_ru,lead_ru,body_ru,source,published_at,accent_color&is_published=eq.true&order=published_at.desc',{headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY}}).then(r=>r.json()).then(d=>{if(Array.isArray(d))setArticles(d);}).catch(()=>{});},[]);
const catMap:Record<string,string>={news:'\u041d\u043e\u0432\u043e\u0441\u0442\u0438',blog:'\u0411\u043b\u043e\u0433',press:'\u0421\u041c\u0418',smi:'\u0421\u041c\u0418',announcement:'\u0421\u043e\u0431\u044b\u0442\u0438\u044f',culture:'\u041a\u0443\u043b\u044c\u0442\u0443\u0440\u0430',tourism:'\u0422\u0443\u0440\u0438\u0437\u043c',education:'\u041e\u0431\u0440\u0430\u0437\u043e\u0432.',ecology:'\u042d\u043a\u043e\u043b\u043e\u0433\u0438\u044f'};
const[cat,setCat]=(React as any).useState(0);
const[open,setOpen]=(React as any).useState<any>(null);
const filtered=cat===0?articles:articles.filter((a:any)=>a.category===cats[cat]||a.category.startsWith(cats[cat]));
if(open){const a=open;return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'#F2F2F7',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}><div style={{position:'sticky',top:0,zIndex:2,padding:'54px 20px 12px',...GL}}><div style={{display:'flex',alignItems:'center',gap:12}}><div className="tap" onClick={()=>setOpen(null)} style={{width:36,height:36,borderRadius:22,background:'rgba(120,120,128,.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:17,fontWeight:700,fontFamily:FD,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title_ru}</div></div></div><div style={{padding:'16px 20px'}}><div style={{display:'inline-flex',height:22,padding:'0 8px',borderRadius:6,lineHeight:'22px',fontSize:11,fontWeight:600,color:'#fff',background:a.accent_color||BL,fontFamily:FT,marginBottom:8}}>{a.category}</div><div style={{fontSize:24,fontWeight:800,fontFamily:FD,letterSpacing:'-0.5px',lineHeight:1.15,marginBottom:8}}>{a.title_ru}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginBottom:16}}>{(a.published_at||'').slice(0,10)+' \u00b7 '+(a.source||'ethnomir.ru')}</div><div style={{fontSize:16,color:'#000',fontFamily:FT,lineHeight:1.7}}>{a.lead_ru}</div><div style={{height:1,background:'rgba(60,60,67,.08)',margin:'16px 0'}}/><div style={{fontSize:16,color:'#000',fontFamily:FT,lineHeight:1.7}}>{a.body_ru}</div></div><div style={{height:80}}/></div>;}
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'#F2F2F7',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
{/* HEADER */}
<div style={{position:'sticky',top:0,zIndex:2,padding:'54px 20px 12px',...GL}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><div className="tap" onClick={onClose} style={{width:36,height:36,borderRadius:22,background:'rgba(120,120,128,.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:22,fontWeight:800,fontFamily:FD}}>{'\u0421\u0442\u0430\u0442\u044c\u0438'}</div><div style={{width:36}}/></div></div>
{/* PILLS */}
<div style={{padding:'8px 20px 4px',display:'flex',gap:6,overflowX:'auto',WebkitOverflowScrolling:'touch'}}>{cats.map((c:string,i:number)=><div key={i} className="tap" onClick={()=>setCat(i)} style={{height:32,padding:'0 14px',borderRadius:16,lineHeight:'32px',fontSize:13,fontWeight:cat===i?700:400,fontFamily:FT,whiteSpace:'nowrap',flexShrink:0,...(cat===i?{background:BL,color:'#fff'}:{...GL,color:L2}),cursor:'pointer',transition:'all .2s'}}>{c}</div>)}</div>
{/* COUNTER */}
<div style={{padding:'8px 20px 0',fontSize:12,color:L2,fontFamily:FT}}>{filtered.length+' '+((filtered.length%10===1&&filtered.length%100!==11)?'\u0441\u0442\u0430\u0442\u044c\u044f':(filtered.length%10>=2&&filtered.length%10<=4&&(filtered.length%100<10||filtered.length%100>=20))?'\u0441\u0442\u0430\u0442\u044c\u0438':'\u0441\u0442\u0430\u0442\u0435\u0439')}</div>
{/* CARDS */}
<div style={{padding:'8px 20px 0'}}>{filtered.map((a:any)=><div key={a.id} className="tap" onClick={()=>setOpen(a)} style={{...GL,borderRadius:20,padding:16,marginBottom:10,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:6}}><div style={{display:'inline-flex',height:20,padding:'0 8px',borderRadius:6,lineHeight:'20px',fontSize:10,fontWeight:600,color:'#fff',background:a.accent_color||BL,fontFamily:FT}}>{a.category}</div><div style={{fontSize:11,color:L2,fontFamily:FT,flexShrink:0}}>{(a.published_at||'').slice(0,10)}</div></div><div style={{fontSize:17,fontWeight:700,fontFamily:FD,lineHeight:1.25,marginBottom:6}}>{a.title_ru}</div><div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.lead_ru}</div><div style={{fontSize:13,color:BL,fontFamily:FT,fontWeight:600,marginTop:8}}>{'\u0427\u0438\u0442\u0430\u0442\u044c \u2192'}</div></div>)}</div>
<div style={{height:80}}/>
</div>;
}

function FranchiseLandingV2({onClose,session}:{onClose:()=>void,session?:any}){
const BLUE='#007AFF',GREEN='#34C759',PURPLE='#AF52DE',FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const[tab,setTab]=(React as any).useState(0);
const[nm,setNm]=(React as any).useState('');
(React as any).useEffect(()=>{if(session?.user?.id){const sb=async()=>{try{const r=await fetch('https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/profiles?select=name,phone&id=eq.'+session.user.id,{headers:{apikey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NTU0MTcsImV4cCI6MjA1NzAzMTQxN30.0VFlPFImSOH3FEBVGpGfRHbGrmBScmBB0v4fGNuLbk0',Authorization:'Bearer '+session.access_token}});const d=await r.json();if(d&&d[0]){if(d[0].name&&!nm)setNm(d[0].name);if(d[0].phone&&!ph)setPh(d[0].phone);}}catch(e){}};sb();}},[]); 
const[ph,setPh]=(React as any).useState(session?.user?.phone||'');
const[sent,setSent]=(React as any).useState(false);
const G=(b=40,s=180,g='rgba(255,255,255,.55)')=>({background:g,backdropFilter:`blur(${b}px) saturate(${s}%)`,WebkitBackdropFilter:`blur(${b}px) saturate(${s}%)`,border:'.5px solid rgba(255,255,255,.35)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), inset 0 -0.5px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.06)'});
const gc={...G(40,180,'rgba(255,255,255,.72)'),borderRadius:16};
const gs={...G(40,180,'rgba(255,255,255,.78)'),borderRadius:16};
const sep='rgba(60,60,67,.08)';
const l3='rgba(60,60,67,.35)';
const fmts=[{ic:'\u{1F3DB}',t:'\u0426\u0435\u043d\u0442\u0440 \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u044b',a:'200\u201310 000 \u043c\u00b2',inv:'$1\u20138M',pau:'$200\u2013800K',pay:'2\u20133.5\u0433',irr:'28\u201335%',mon:'$80\u2013500K',cap:'$8\u201370M',c:BLUE,rev:[35,25,20,12,8],rl:['\u0411\u0438\u043b\u0435\u0442\u044b','\u041c\u041a','\u041a\u0430\u0444\u0435','Events','VR']},{ic:'\u{1F333}',t:'\u041f\u0430\u0440\u043a 10 \u0433\u0430',a:'10 \u0433\u0435\u043a\u0442\u0430\u0440\u043e\u0432',inv:'$15\u201325M',pau:'$800K',pay:'3.5\u20134\u0433',irr:'25\u201332%',mon:'$0.5\u20131.2M',cap:'$70\u2013150M',c:GREEN,rev:[30,25,18,12,10,5],rl:['\u041f\u0440\u043e\u0436\u0438\u0432.','\u0411\u0438\u043b\u0435\u0442\u044b','\u0420\u0435\u0441\u0442.','\u041c\u041a','B2B','VR']},{ic:'\u{1F30D}',t:'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 20+\u0433\u0430',a:'20+ \u0433\u0435\u043a\u0442\u0430\u0440\u043e\u0432',inv:'$30\u201350M',pau:'$1.5M',pay:'4\u20135\u043b\u0435\u0442',irr:'22\u201330%',mon:'$1.5\u20133M',cap:'$150\u2013350M',c:PURPLE,rev:[28,22,16,14,10,6,4],rl:['\u041f\u0440\u043e\u0436\u0438\u0432.','\u0411\u0438\u043b\u0435\u0442\u044b','\u0420\u0435\u0441\u0442.','B2B','\u041c\u041a','SPA','VR']}];
const fm=fmts[Math.min(tab,2)];
const K=({l,v,a}:any)=><div style={{flex:1,padding:'12px 0'}}><div style={{fontSize:10,color:l3,fontFamily:FT,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>{l}</div><div style={{fontSize:17,fontWeight:700,color:a||'#000',fontFamily:FD}}>{v}</div></div>;
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#E8E0F0 0%,#F2F2F7 15%,#EDF5FF 40%,#F2F2F7 60%,#F0FFF4 80%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
<div style={{position:'relative',height:420,borderRadius:'0 0 20px 20px',overflow:'hidden'}}>
<img src="https://ethnomir.ru/upload/iblock/e0c/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/>
<div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 0%,rgba(0,0,0,.08) 30%,rgba(0,0,0,.75) 100%)'}}/>
<div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:18,...G(30,200,'rgba(255,255,255,.18)'),display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
<div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}>
<div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',...G(15,160,'rgba(99,102,241,.85)'),fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0424\u0420\u0410\u041d\u0428\u0418\u0417\u0410'}</div>
<div style={{fontSize:32,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043f\u0430\u0440\u043a \u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u0432 \u0441\u0432\u043e\u0451\u043c \u0433\u043e\u0440\u043e\u0434\u0435'}</div>
<div style={{fontSize:15,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u0413\u043e\u0442\u043e\u0432\u0430\u044f \u0431\u0438\u0437\u043d\u0435\u0441-\u043c\u043e\u0434\u0435\u043b\u044c. \u0418\u043d\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u043e\u0442 $1\u043c\u043b\u043d.'}</div>
</div></div>
<div style={{padding:'24px 20px 0'}}>
<div style={{textAlign:'center',marginBottom:20}}><div style={{fontSize:12,fontWeight:700,color:'#5856D6',letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041f\u0420\u041e\u0415\u041a\u0422'}</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>{'\u041f\u043e\u0447\u0435\u043c\u0443 \u044d\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442'}</div></div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
{[{v:'18 \u043b\u0435\u0442',l:'\u041d\u0430 \u0440\u044b\u043d\u043a\u0435',c:'#5856D6'},{v:'1M+',l:'\u0413\u043e\u0441\u0442\u0435\u0439/\u0433\u043e\u0434',c:GREEN},{v:'16M\u20bd',l:'\u041e\u0431\u043e\u0440\u043e\u0442/\u043c\u0435\u0441',c:'#FF9500'},{v:'35%',l:'ROI',c:PURPLE}].map((s:any,i:number)=><div key={i} style={{...gc,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:26,fontWeight:800,color:s.c,fontFamily:FD}}>{s.v}</div><div style={{fontSize:10,color:l3,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}
</div></div>
<div style={{padding:'24px 20px 0'}}>
<div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:BLUE,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0424\u041e\u0420\u041c\u0410\u0422\u042b'}</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>{'\u0422\u0440\u0438 \u043c\u0430\u0441\u0448\u0442\u0430\u0431\u0430'}</div></div>
<div style={{display:'flex',background:'rgba(118,118,128,.12)',borderRadius:10,padding:3,gap:2,marginBottom:14}}>
{['\u0426\u0435\u043d\u0442\u0440','10\u0433\u0430','20+\u0433\u0430','\u0421\u0440\u0430\u0432\u043d.'].map((t:any,i:number)=><div key={i} className="tap" onClick={()=>setTab(i)} style={{flex:1,textAlign:'center',padding:'7px 0',borderRadius:8,background:tab===i?'#fff':'transparent',boxShadow:tab===i?'0 1px 4px rgba(0,0,0,.08), 0 0.5px 1px rgba(0,0,0,.04)':'none',transition:'all .2s'}}><span style={{fontSize:12,fontWeight:tab===i?700:400,color:tab===i?'#000':'rgba(60,60,67,.6)',fontFamily:FT}}>{t}</span></div>)}
</div>
{tab<3?<div style={{...gs,overflow:'hidden'}}>
<div style={{padding:16,borderBottom:`.5px solid ${sep}`,display:'flex',gap:12,alignItems:'center'}}>
<div style={{width:44,height:44,borderRadius:14,background:`${fm.c}10`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{fm.ic}</div>
<div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{fm.t}</div><div style={{fontSize:13,color:l3,fontFamily:FT}}>{fm.a}</div></div>
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
{[['\u0418\u043d\u0432\u0435\u0441\u0442.',fm.inv,fm.c],['\u041f\u0430\u0443\u0448.',fm.pau],['\u041e\u043a\u0443\u043f.',fm.pay,GREEN],['IRR',fm.irr,GREEN],['\u041f\u0440\u0438\u0431./\u043c\u0435\u0441',fm.mon,GREEN],['\u041a\u0430\u043f.10\u043b',fm.cap,'#5856D6']].map(([l,vv,a]:any,i:number)=><div key={i} style={{padding:'10px 14px',borderBottom:`.5px solid ${sep}`,borderRight:i%2===0?`.5px solid ${sep}`:'none'}}><K l={l} v={vv} a={a}/></div>)}
</div>
<div style={{padding:'12px 14px 4px'}}>
<div style={{fontSize:11,fontWeight:600,color:'rgba(60,60,67,.6)',fontFamily:FT,marginBottom:6}}>ROI</div>
{React.createElement('svg',{viewBox:'0 0 280 50',style:{width:'100%',height:40,display:'block'}},React.createElement('rect',{x:0,y:6,width:280,height:36,rx:5,fill:'rgba(0,0,0,.02)'}),React.createElement('line',{x1:0,y1:24,x2:280,y2:24,stroke:'rgba(0,0,0,.05)',strokeWidth:.5,strokeDasharray:'3,3'}),React.createElement('polyline',{points:tab===0?'0,40 56,35 112,27 168,19 224,12 280,8':tab===1?'0,40 56,37 112,31 168,23 224,14 280,10':'0,40 56,38 112,33 168,26 224,17 280,12',fill:'none',stroke:fm.c,strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'}),React.createElement('circle',{cx:tab===0?168:tab===1?196:224,cy:tab===0?19:tab===1?18:17,r:3.5,fill:fm.c}))}
</div>
<div style={{padding:'4px 14px 4px'}}>
<div style={{fontSize:11,fontWeight:600,color:'rgba(60,60,67,.6)',fontFamily:FT,marginBottom:6}}>Капитализация</div>
<div style={{display:'flex',alignItems:'flex-end',gap:3,height:32}}>
{(tab===0?[8,15,24,35,50,62,70]:tab===1?[12,22,38,58,85,120,150]:[20,40,70,110,170,260,350]).map(function(v,i,a){var mx=a[a.length-1];return React.createElement('div',{key:'c'+i,style:{flex:1,height:Math.max(3,v/mx*32),borderRadius:3,background:fm.c,opacity:.4+i*.09,transition:'height .5s cubic-bezier(0.2,0.8,0.2,1)'}})})}
</div>
<div style={{display:'flex',justifyContent:'space-between',marginTop:2}}>{React.createElement('span',{style:{fontSize:8,color:'rgba(60,60,67,.3)',fontFamily:FT}},'1г')}{React.createElement('span',{style:{fontSize:8,color:'rgba(60,60,67,.3)',fontFamily:FT}},'7лет')}</div>
</div>
<div style={{padding:14}}>
<div style={{fontSize:11,fontWeight:600,color:'rgba(60,60,67,.6)',fontFamily:FT,marginBottom:8}}>{'\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0434\u043e\u0445\u043e\u0434\u043e\u0432'}</div>
<div style={{display:'flex',borderRadius:5,overflow:'hidden',height:7,marginBottom:6}}>
{fm.rev.map((p:number,j:number)=><div key={j} style={{width:p+'%',background:fm.c,opacity:1-j*.13}}/>)}
</div>
{fm.rev.map((p:number,j:number)=><div key={j} style={{display:'flex',justifyContent:'space-between',padding:'2px 0'}}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:7,height:7,borderRadius:4,background:fm.c,opacity:1-j*.13}}/><span style={{fontSize:12,color:'rgba(60,60,67,.6)',fontFamily:FT}}>{fm.rl[j]}</span></div><span style={{fontSize:12,fontWeight:600,fontFamily:FD}}>{p}%</span></div>)}
</div>
</div>:<div style={{...gs,overflow:'hidden'}}><div style={{display:'flex',borderBottom:'0.5px solid rgba(60,60,67,.08)'}}><div style={{width:78,flexShrink:0,padding:'10px 6px'}}/>{[{l:'Центр',c:BLUE},{l:'10га',c:GREEN},{l:'20+га',c:PURPLE}].map((h:any,i:number)=><div key={i} style={{flex:1,padding:'8px 2px',textAlign:'center'}}><span style={{display:'inline-flex',height:20,lineHeight:'20px',padding:'0 6px',borderRadius:10,background:`${h.c}12`,color:h.c,fontSize:10,fontWeight:700,fontFamily:FT}}>{h.l}</span></div>)}</div>{[['Инвест.','$1-8M','$15-25M','$30-50M'],['Площадь','10Км²','10га','20+га'],['Пауш.','$0.2-0.8M','$0.8M','$1.5M'],['Окуп.','2-3.5г','3.5-4г','4-5л'],['Приб/мес','$80-500K','$0.5-1.2M','$1.5-3M'],['IRR','28-35%','25-32%','22-30%'],['Кап.10л','$8-70M','$70-150M','$150-350M'],['Отели','—','3-5','10+'],['Рест.','Кафе','3-5','10+']].map((r:any,i:number)=><div key={i} style={{display:'flex',borderBottom:i<8?'0.5px solid rgba(60,60,67,.06)':'none',background:i%2===0?'transparent':'rgba(0,0,0,.012)'}}><div style={{width:78,flexShrink:0,padding:'8px 6px',fontSize:11,color:'rgba(60,60,67,.5)',fontFamily:FT,fontWeight:500}}>{r[0]}</div>{[r[1],r[2],r[3]].map((v:any,j:number)=><div key={j} style={{flex:1,padding:'8px 2px',textAlign:'center',fontSize:11,fontWeight:600,color:'#000',fontFamily:FD}}>{v}</div>)}</div>)}</div>}</div>
<div style={{padding:'24px 20px 0'}}>
<div style={{...gs,padding:18,display:'flex',gap:12}}>
<div style={{width:44,height:44,borderRadius:14,background:'#5856D610',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{'\u{1F3C5}'}</div>
<div><div style={{fontSize:16,fontWeight:700,fontFamily:FD,marginBottom:4}}>{'\u0422\u043e\u0432\u0430\u0440\u043d\u044b\u0439 \u0437\u043d\u0430\u043a \u043c\u0438\u0440\u043e\u0432\u043e\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f'}</div><div style={{fontSize:13,color:'rgba(60,60,67,.6)',fontFamily:FT,lineHeight:1.45}}>{'\u041c\u0430\u0434\u0440\u0438\u0434\u0441\u043a\u0430\u044f \u0441\u0438\u0441\u0442\u0435\u043c\u0430. 18 \u043b\u0435\u0442 \u043e\u043f\u044b\u0442\u0430. \u042e\u041d\u0415\u0421\u041a\u041e.'}</div></div>
</div></div>
<div style={{padding:'24px 20px 0'}}>
<div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:GREEN,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0417\u0410\u042f\u0412\u041a\u0410'}</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>{'\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u043f\u0440\u0435\u0437\u0435\u043d\u0442\u0430\u0446\u0438\u044e'}</div></div>
<div style={{...gs,padding:18}}>
{sent?<div style={{textAlign:'center',padding:24}}><div style={{fontSize:44,marginBottom:10}}>{'\u2705'}</div><div style={{fontSize:18,fontWeight:700,fontFamily:FD}}>{'\u0417\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430'}</div></div>
:<div style={{display:'flex',flexDirection:'column',gap:10}}>
<input placeholder={'\u0418\u043c\u044f'} value={nm} onChange={(e:any)=>setNm(e.target.value)} style={{width:'100%',boxSizing:'border-box',padding:'13px 14px',borderRadius:12,border:`.5px solid ${sep}`,background:'#F2F2F7',fontSize:15,fontFamily:FT,outline:'none'}}/>
<input placeholder={'\u0422\u0435\u043b\u0435\u0444\u043e\u043d'} value={ph} onChange={(e:any)=>setPh(e.target.value)} type="tel" style={{width:'100%',boxSizing:'border-box',padding:'13px 14px',borderRadius:12,border:`.5px solid ${sep}`,background:'#F2F2F7',fontSize:15,fontFamily:FT,outline:'none'}}/>
<button className="tap" onClick={()=>{if(nm&&ph)setSent(true)}} disabled={!nm||!ph} style={{width:'100%',height:50,borderRadius:14,border:'none',background:(!nm||!ph)?'rgba(0,122,255,.35)':BLUE,color:'#fff',fontSize:17,fontWeight:600,fontFamily:FT}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}</button>
</div>}
</div></div>
{/* WHY ETHNOMIR */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:'#FF2D55',letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>ПРЕИМУЩЕСТВА</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>Почему именно Этномир</div></div>
      {[['\u{1F3AF}','Нет конкурентов','Единственный этнографический парк такого масштаба в мире. Уникальная ниша без прямой конкуренции.'],['\u{1F4B0}','Множественные потоки дохода','7+ источников выручки: билеты, проживание, рестораны, МК, events, SPA, ритейл.'],['\u{1F30E}','Масштабируемость','Концепция адаптируется от 200м\u00b2 до 20+га. Работает в любом климате и культуре.'],['\u{1F91D}','Полная поддержка','Архитектура, обучение, маркетинг, IT, операционный менеджмент \u2014 всё включено.']].map(([ic,t,dd]:any,i:number)=>
        <div key={i} style={{...G(40,180,'rgba(255,255,255,.72)'),borderRadius:16,padding:16,marginBottom:10,display:'flex',gap:14,alignItems:'flex-start'}}>
          <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,45,85,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{ic}</div>
          <div><div style={{fontSize:15,fontWeight:700,color:'#000',fontFamily:FD}}>{t}</div><div style={{fontSize:13,color:'rgba(60,60,67,.55)',fontFamily:FT,marginTop:3,lineHeight:1.45}}>{dd}</div></div>
        </div>)}
    </div>
    {/* MARKET */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:GREEN,letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>РЫНОК</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>Глобальный потенциал</div></div>
      <div style={{...G(40,180,'rgba(255,255,255,.78)'),borderRadius:16,padding:18}}>
        {[['$1.5 трлн','Мировой рынок туризма 2025',GREEN],['12%','Рост культурного туризма/год',BLUE],['850 млн','Путешественников ищут уникальный опыт',PURPLE],['73%','Семей выбирают образовательный отдых','#FF9500']].map(([v,l,c]:any,i:number)=>
          <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 0',borderBottom:i<3?'0.5px solid rgba(60,60,67,.06)':'none'}}>
            <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:FD,minWidth:90}}>{v}</div>
            <div style={{fontSize:13,color:'rgba(60,60,67,.55)',fontFamily:FT,lineHeight:1.4}}>{l}</div>
          </div>)}
      </div>
    </div>
    {/* TEAM */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:'#5856D6',letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>КОМАНДА</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>Эксперты за вашей спиной</div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[['\u{1F3D7}','Архитекторы','15+ объектов'],['\u{1F468}\u200D\u{1F373}','Шеф-повара','12 кухонь мира'],['\u{1F3AD}','Культурологи','40 стран'],['\u{1F4BB}','IT-команда','CRM + App']].map(([ic,t,d]:any,i:number)=>
          <div key={i} style={{...G(40,180,'rgba(255,255,255,.72)'),borderRadius:16,padding:'14px 10px',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:6}}>{ic}</div>
            <div style={{fontSize:14,fontWeight:700,color:'#000',fontFamily:FD}}>{t}</div>
            <div style={{fontSize:11,color:'rgba(60,60,67,.4)',fontFamily:FT,marginTop:2}}>{d}</div>
          </div>)}
      </div>
    </div>
    {/* STEPS */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:18}}><div style={{fontSize:12,fontWeight:700,color:'#5AC8FA',letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>ПРОЦЕСС</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>6 шагов к парку</div></div>
      {[['01','Заявка и NDA','Подписываем NDA и отправляем презентацию','1 день'],['02','Финмодель','Персональная модель под ваш рынок','1–2 нед.'],['03','Визит в Этномир','Экскурсия, встреча с командой','2 дня'],['04','Договор','Согласование, подписание, паушальный взнос','2–4 нед.'],['05','Строительство','Проектирование и стройка под ключ','12–24 мес.'],['06','Запуск','Обучение, маркетинг, открытие','1–2 мес.']].map(([n,t,dd,dur]:any,i:number)=>
        <div key={i} style={{display:'flex',gap:14,marginBottom:4}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
            <div style={{width:32,height:32,borderRadius:16,background:i===0?BLUE:'rgba(0,122,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:i===0?'#fff':BLUE,fontFamily:FD}}>{n}</div>
            {i<5&&<div style={{width:1.5,height:26,background:'rgba(0,122,255,.15)',marginTop:2}}/>}
          </div>
          <div style={{paddingBottom:10,flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:14,fontWeight:700,color:'#000',fontFamily:FD}}>{t}</div><span style={{display:'inline-flex',height:20,lineHeight:'20px',padding:'0 7px',borderRadius:10,background:'rgba(0,122,255,.08)',color:BLUE,fontSize:10,fontWeight:700,fontFamily:FT}}>{dur}</span></div>
            <div style={{fontSize:12,color:'rgba(60,60,67,.55)',fontFamily:FT,marginTop:2,lineHeight:1.4}}>{dd}</div>
          </div>
        </div>)}
    </div>
    {/* SUPPORT */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:PURPLE,letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>ПОДДЕРЖКА</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>Что вы получаете</div></div>
      {[['📐','Архитектура','Полный пакет проектной документации'],['🎓','Обучение','Программа для всех сотрудников парка'],['📊','Маркетинг и IT','Брендбук, CRM, приложение, сайт'],['🛠','Операционная поддержка','Ежемесячный аудит и KPI-дашборд']].map(([ic,t,dd]:any,i:number)=>
        <div key={i} style={{...G(40,180,'rgba(255,255,255,.72)'),borderRadius:16,padding:14,marginBottom:8,display:'flex',gap:12,alignItems:'flex-start'}}>
          <div style={{width:38,height:38,borderRadius:12,background:'rgba(175,82,222,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{ic}</div>
          <div><div style={{fontSize:14,fontWeight:700,color:'#000',fontFamily:FD}}>{t}</div><div style={{fontSize:12,color:'rgba(60,60,67,.55)',fontFamily:FT,marginTop:2,lineHeight:1.4}}>{dd}</div></div>
        </div>)}
    </div>
    {/* GEOGRAPHY */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:'#FF9500',letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>ГЕОГРАФИЯ</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>Где открыть парк</div></div>
      <div style={{...G(40,180,'rgba(255,255,255,.78)'),borderRadius:16,padding:16}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          {[['🇷🇺','Россия','50+ городов'],['🇨🇳','Китай','Мегаполисы'],['🇦🇪','ОАЭ','Дубай'],['🇹🇷','Турция','Анталья'],['🇮🇳','Индия','Дели'],['🇧🇷','Бразилия','Сан-Паулу']].map(([fl,cn,ct]:any,i:number)=>
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:i<4?'0.5px solid rgba(60,60,67,.06)':'none'}}>
              <span style={{fontSize:20}}>{fl}</span>
              <div><div style={{fontSize:13,fontWeight:600,color:'#000',fontFamily:FD}}>{cn}</div><div style={{fontSize:10,color:'rgba(60,60,67,.35)',fontFamily:FT}}>{ct}</div></div>
            </div>)}
        </div>
      </div>
    </div>
    {/* TRUST */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:BLUE,letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>ДОВЕРИЕ</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>Реальные факты</div></div>
      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:8,WebkitOverflowScrolling:'touch'}}>
        {[['140 га','Территория','Калужская обл.'],['2006','Год основания','18+ лет на рынке'],['57K+','Instagram','Подписчиков'],['АСИ','Одобрено','Президентом РФ']].map(([v,src,dd]:any,i:number)=>
          <div key={i} style={{...G(40,180,'rgba(255,255,255,.72)'),borderRadius:16,padding:'14px 12px',minWidth:120,flexShrink:0,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:800,color:BLUE,fontFamily:FD}}>{v}</div>
            <div style={{fontSize:12,fontWeight:600,color:'#000',fontFamily:FT,marginTop:3}}>{src}</div>
            <div style={{fontSize:10,color:'rgba(60,60,67,.4)',fontFamily:FT,marginTop:1}}>{dd}</div>
          </div>)}
      </div>
    </div>
    {/* FAQ */}
    <div style={{padding:'24px 20px 0'}}>
      <div style={{textAlign:'center',marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:'#FF9500',letterSpacing:2.5,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>FAQ</div><div style={{fontSize:26,fontWeight:800,fontFamily:FD}}>Частые вопросы</div></div>
      {[['Нужен ли опыт в туризме?','Нет. Мы обучаем с нуля. Ваша задача — управление и инвестиции.'],['Какой минимальный бюджет?','От $1M для формата Центр (200-10 000 м\u00b2).'],['Сколько до открытия?','От 12 мес для Центра до 24-36 мес для парка.'],['Есть ли роялти?','5% от оборота. Включает IT, маркетинг, обучение, аудит.']].map(([q,a]:any,i:number)=>
        <div key={i} style={{...G(40,180,'rgba(255,255,255,.72)'),borderRadius:16,padding:'12px 14px',marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:700,color:'#000',fontFamily:FD,marginBottom:4}}>{q}</div>
          <div style={{fontSize:12,color:'rgba(60,60,67,.5)',fontFamily:FT,lineHeight:1.5}}>{a}</div>
        </div>)}
    </div>
    <div style={{height:100}}/>
</div>;
}


function ArendaLandingV2({onClose,session}:{onClose:()=>void,session?:any}){
const B='#0284C7',GR='#34C759',OR='#FF9500',RD='#FF3B30',PR='#AF52DE',IND='#5856D6';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const[nm,setNm]=(React as any).useState('');
const[ph,setPh]=(React as any).useState('');
const[sent,setSent]=(React as any).useState(false);
const[err,setErr]=(React as any).useState('');
const[sending,setSending]=(React as any).useState(false);
const[zone,setZone]=(React as any).useState(0);
const[area,setArea]=(React as any).useState(20);
const zP=[3500,2200,1200,2800];
const submit=async()=>{if(!nm.trim()||!ph.trim()){setErr('\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0432\u0441\u0435 \u043f\u043e\u043b\u044f');return;}setSending(true);setErr('');const ok=await submitContactRequest('arenda','landing_arenda',nm,ph);if(ok){setSent(true);logActivity('lead_arenda',{name:nm,phone:ph});}else setErr('\u041e\u0448\u0438\u0431\u043a\u0430');setSending(false);};
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#E6F2FA 0%,#F2F2F7 12%,#F2F2F7 50%,#EBF8EE 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
{/* HERO */}
<div style={{position:'relative',height:380,borderRadius:'0 0 20px 20px',overflow:'hidden'}}>
<img src="https://ethnomir.ru/upload/iblock/f94/1.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/>
<div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 0%,rgba(0,0,0,.75) 100%)'}}/>
<div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,background:'rgba(255,255,255,.18)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
<div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}>
<div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',background:'rgba(2,132,199,.85)',backdropFilter:'blur(15px)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0410\u0420\u0415\u041d\u0414\u0410'}</div>
<div style={{fontSize:30,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u0411\u0438\u0437\u043d\u0435\u0441 \u0441 \u0433\u0430\u0440\u0430\u043d\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u043c \u0442\u0440\u0430\u0444\u0438\u043a\u043e\u043c'}</div>
<div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u0422\u043e\u0440\u0433\u043e\u0432\u044b\u0435 \u0442\u043e\u0447\u043a\u0438, \u043c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0438\u0435 \u0438 \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b'}</div>
</div></div>
{/* COUNTERS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
{[{t:'1 000 000+',l:'\u0413\u043e\u0441\u0442\u0435\u0439/\u0433\u043e\u0434',c:B},{t:'20 000',l:'\u041c\u0430\u043a\u0441/\u0434\u0435\u043d\u044c',c:GR},{t:'30 000 \u043c\u00b2',l:'\u041f\u043b\u043e\u0449\u0430\u0434\u0435\u0439',c:OR},{t:'3.5 \u043c\u043b\u043d',l:'\u041f\u043b\u0430\u043d \u043f\u043e\u0441\u0435\u0449.',c:PR}].map((s:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:10,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}
</div></div>
{/* ULITSA */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u0423\u043b\u0438\u0446\u0430 \u041c\u0438\u0440\u0430 \u2014 1,5 \u043a\u043c \u0431\u0435\u0437 \u0430\u043b\u044c\u0442\u0435\u0440\u043d\u0430\u0442\u0438\u0432\u044b'}</div>
<div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u041a\u0430\u0436\u0434\u044b\u0439 \u0433\u043e\u0441\u0442\u044c \u043f\u0440\u043e\u0445\u043e\u0434\u0438\u0442 \u0423\u043b\u0438\u0446\u0443 \u041c\u0438\u0440\u0430 \u0434\u0432\u0430\u0436\u0434\u044b. \u0412\u044b\u0439\u0442\u0438 \u0434\u0440\u0443\u0433\u0438\u043c \u043f\u0443\u0442\u0451\u043c \u043d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e. \u042d\u0442\u043e \u043d\u0435 \u0422\u0426 \u2014 \u0437\u0434\u0435\u0441\u044c \u0432\u0430\u0448\u0430 \u0442\u043e\u0447\u043a\u0430 \u043d\u0430 \u0435\u0434\u0438\u043d\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u043c \u043f\u0443\u0442\u0438 \u043c\u0438\u043b\u043b\u0438\u043e\u043d\u0430 \u0447\u0435\u043b\u043e\u0432\u0435\u043a.'}</div>
</div></div>
{/* ROI */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:GR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'ROI'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041e\u043a\u0443\u043f\u0430\u0435\u043c\u043e\u0441\u0442\u044c \u0432\u043b\u043e\u0436\u0435\u043d\u0438\u0439'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110">
<circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={GR} strokeWidth="12" strokeDasharray="198 66" strokeDashoffset="66" strokeLinecap="round" style={{transition:'stroke-dasharray 1.5s ease'}}/>
<circle cx="50" cy="50" r="42" fill="none" stroke={OR} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-132" strokeLinecap="round"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={B} strokeWidth="12" strokeDasharray="13 251" strokeDashoffset="-185" strokeLinecap="round"/>
<text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill="#000" fontFamily={FD}>75%</text>
<text x="50" y="60" textAnchor="middle" fontSize="8" fill="rgba(60,60,67,.6)" fontFamily={FT}>ROI / \u0433\u043e\u0434</text>
</svg>
<div style={{flex:1}}>
{[{c:GR,l:'\u0422\u043e\u0440\u0433\u043e\u0432\u043b\u044f',v:'75%'},{c:OR,l:'\u041f\u0438\u0442\u0430\u043d\u0438\u0435',v:'60%'},{c:B,l:'\u041c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0438\u0435',v:'45%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:i<2?8:0}}><div style={{width:10,height:10,borderRadius:5,background:r.c}}/><span style={{fontSize:13,fontFamily:FT,color:'#000',flex:1}}>{r.l}</span><span style={{fontSize:13,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}
</div></div>
<div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:12,lineHeight:1.5}}>{'\u0421\u0440\u0435\u0434\u043d\u0438\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044e\u0449\u0438\u0445 \u0430\u0440\u0435\u043d\u0434\u0430\u0442\u043e\u0440\u043e\u0432 \u0437\u0430 2024\u20132025 \u0433\u0433.'}</div>
</div></div>
{/* OCCUPANCY */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:RD,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0417\u0410\u041f\u041e\u041b\u041d\u0415\u041d\u041d\u041e\u0421\u0422\u042c'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0423\u0441\u043f\u0435\u0439\u0442\u0435 \u0437\u0430\u043d\u044f\u0442\u044c \u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0443'}</div>
{[{p:87,c:RD,l:'\u0423\u043b\u0438\u0446\u0430 \u041c\u0438\u0440\u0430'},{p:65,c:OR,l:'\u042d\u0442\u043d\u043e\u0434\u0432\u043e\u0440\u044b'},{p:40,c:GR,l:'\u041e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u043f\u043b\u043e\u0449.'},{p:55,c:B,l:'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b'}].map((m:any,i:number)=><div key={i} style={{marginBottom:i<3?14:0}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:14,fontWeight:600,fontFamily:FD}}>{m.l}</span><span style={{fontSize:14,fontWeight:700,color:m.c,fontFamily:FD}}>{m.p}%</span></div><div style={{height:8,borderRadius:4,background:'rgba(120,120,128,.08)'}}><div style={{height:8,borderRadius:4,background:m.c,width:m.p+'%',transition:'width 1.2s ease'}}/></div></div>)}
</div></div>
{/* CALC */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,overflow:'hidden'}}>
<div style={{padding:'16px 16px 12px'}}><div style={{fontSize:12,fontWeight:700,color:B,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041a\u0410\u041b\u042c\u041a\u0423\u041b\u042f\u0422\u041e\u0420'}</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD}}>{'\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c'}</div></div>
<div style={{padding:'0 16px 12px'}}><div style={{display:'flex',background:'rgba(118,118,128,.12)',borderRadius:10,padding:3,gap:2}}>
{['\u0423\u043b\u0438\u0446\u0430','\u0414\u0432\u043e\u0440\u044b','\u041f\u043b\u043e\u0449.','\u0420\u0435\u0441\u0442.'].map((n:string,i:number)=><div key={i} className="tap" onClick={()=>setZone(i)} style={{flex:1,textAlign:'center',padding:'7px 4px',borderRadius:8,background:zone===i?'#fff':'transparent',boxShadow:zone===i?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .25s'}}><span style={{fontSize:11,fontWeight:zone===i?700:400,color:zone===i?'#000':L2,fontFamily:FT}}>{n}</span></div>)}
</div></div>
<div style={{padding:'0 16px 12px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:13,color:L2,fontFamily:FT}}>{'\u041f\u043b\u043e\u0449\u0430\u0434\u044c'}</span><span style={{fontSize:15,fontWeight:700,fontFamily:FD}}>{area} {'\u043c\u00b2'}</span></div>
<input type="range" min={5} max={200} value={area} onChange={(e:any)=>setArea(+e.target.value)} style={{width:'100%',accentColor:B}}/></div>
<div style={{borderTop:'1px solid rgba(60,60,67,.1)',padding:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontSize:11,color:L2,fontFamily:FT,textTransform:'uppercase'}}>{'\u043e\u0442 / \u043c\u0435\u0441\u044f\u0446'}</div><div style={{fontSize:28,fontWeight:800,color:B,fontFamily:FD}}>{(area*zP[zone]).toLocaleString('ru')} {'\u20bd'}</div></div><div style={{fontSize:13,color:L2,fontFamily:FT,textAlign:'right'}}>{zP[zone].toLocaleString('ru')} {'\u20bd/\u043c\u00b2'}</div></div>
</div></div>
{/* TRAFFIC CHART */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:B,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0422\u0420\u0410\u0424\u0418\u041a'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041f\u043e\u0441\u0435\u0449\u0430\u0435\u043c\u043e\u0441\u0442\u044c \u043f\u043e \u043c\u0435\u0441\u044f\u0446\u0430\u043c'}</div>
<svg viewBox="0 0 320 140" style={{width:'100%'}}>
{[28,35,52,68,95,120,115,110,75,50,40,45].map((v:number,i:number)=>{const h=v*1.1;const x=i*26+8;return <g key={i}><defs><linearGradient id={'gb'+i} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={i>=4&&i<=7?'#FF9500':B}/><stop offset="100%" stopColor={i>=4&&i<=7?'#FF950040':B+'40'}/></linearGradient></defs><rect x={x} y={130-h} width={20} rx={6} height={h} fill={'url(#gb'+i+')'} opacity={0.9}/><text x={x+10} y={128-h} textAnchor="middle" fontSize="9" fontWeight="700" fill={i>=4&&i<=7?'#FF9500':B} fontFamily={FT}>{v}K</text><text x={x+10} y={140} textAnchor="middle" fontSize="8" fill="rgba(60,60,67,.4)" fontFamily={FT}>{['\u042f','\u0424','\u041c','\u0410','\u041c','\u0418','\u0418','\u0410','\u0421','\u041e','\u041d','\u0414'][i]}</text></g>})}
</svg>
<div style={{display:'flex',gap:16,justifyContent:'center',marginTop:8}}><div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:4,background:B}}/><span style={{fontSize:11,color:L2,fontFamily:FT}}>{'\u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442'}</span></div><div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:4,background:OR}}/><span style={{fontSize:11,color:L2,fontFamily:FT}}>{'\u041f\u0438\u043a (\u043b\u0435\u0442\u043e)'}</span></div></div>
</div></div>
{/* GEOGRAPHY */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:PR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0413\u0415\u041e\u0413\u0420\u0410\u0424\u0418\u042f'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041e\u0442\u043a\u0443\u0434\u0430 \u0435\u0434\u0443\u0442 \u0433\u043e\u0441\u0442\u0438'}</div>
{[{l:'\u041c\u043e\u0441\u043a\u0432\u0430 \u0438 \u041c\u041e',p:62,c:B},{l:'\u0420\u0435\u0433\u0438\u043e\u043d\u044b \u0420\u0424',p:28,c:OR},{l:'\u0418\u043d\u043e\u0441\u0442\u0440\u0430\u043d\u043d\u044b\u0435',p:10,c:GR}].map((g:any,i:number)=><div key={i} style={{marginBottom:i<2?12:0}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:14,fontWeight:600,fontFamily:FD}}>{g.l}</span><span style={{fontSize:14,fontWeight:700,color:g.c,fontFamily:FD}}>{g.p}%</span></div><div style={{height:8,borderRadius:4,background:'rgba(120,120,128,.08)'}}><div style={{height:8,borderRadius:4,background:g.c,width:g.p+'%'}}/></div></div>)}
<div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:12,lineHeight:1.5}}>{'\u0421\u0440\u0435\u0434\u043d\u0438\u0439 \u0447\u0435\u043a \u0433\u043e\u0441\u0442\u044f: 2 800 \u20bd. \u0421\u0440\u0435\u0434\u043d\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u0432 \u043f\u0430\u0440\u043a\u0435: 6 \u0447\u0430\u0441\u043e\u0432.'}</div>
</div></div>
{/* SEASONS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:OR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u0421\u0415\u0417\u041e\u041d\u041d\u041e\u0421\u0422\u042c'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'365 \u0434\u043d\u0435\u0439 \u0434\u043e\u0445\u043e\u0434\u0430'}</div>
{[{e:'\u2600\ufe0f',t:'\u041b\u0435\u0442\u043e',d:'\u041f\u0438\u043a. \u0424\u0435\u0441\u0442\u0438\u0432\u0430\u043b\u0438, \u0434\u043e 20K/\u0434\u0435\u043d\u044c',c:OR},{e:'\u2744\ufe0f',t:'\u0417\u0438\u043c\u0430',d:'\u041d\u043e\u0432\u044b\u0439 \u0433\u043e\u0434, \u041c\u0430\u0441\u043b\u0435\u043d\u0438\u0446\u0430',c:B},{e:'\ud83c\udf42',t:'\u041e\u0441\u0435\u043d\u044c+\u0412\u0435\u0441\u043d\u0430',d:'\u0428\u043a\u043e\u043b\u044b, \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u044b',c:GR}].map((c:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:c.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{c.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{c.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{c.d}</div></div></div>)}
</div>
{/* TIMELINE */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:GR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041f\u0423\u0422\u042c'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u041e\u0442 \u0437\u0430\u044f\u0432\u043a\u0438 \u0434\u043e \u043a\u043b\u0438\u0435\u043d\u0442\u0430 \u2014 14 \u0434\u043d\u0435\u0439'}</div>
<div style={{background:'#fff',borderRadius:16,overflow:'hidden'}}>
{[{n:'1',t:'\u0417\u0430\u044f\u0432\u043a\u0430',d:'\u042d\u043a\u0441\u043a\u0443\u0440\u0441\u0438\u044f \u043f\u043e \u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0430\u043c',c:B},{n:'2',t:'\u041f\u043e\u0434\u0431\u043e\u0440',d:'\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0442\u0440\u0430\u0444\u0438\u043a\u0430',c:GR},{n:'3',t:'\u0414\u043e\u0433\u043e\u0432\u043e\u0440',d:'\u0424\u0438\u043a\u0441 \u0438\u043b\u0438 % \u043e\u0442 \u043e\u0431\u043e\u0440\u043e\u0442\u0430',c:OR},{n:'4',t:'\u0417\u0430\u043f\u0443\u0441\u043a',d:'\u041c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433 + \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435',c:PR}].map((s:any,i:number)=><div key={i} style={{display:'flex',gap:14,padding:'14px 16px',borderBottom:i<3?'1px solid rgba(60,60,67,.1)':'none'}}><div style={{width:32,height:32,borderRadius:16,background:s.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:s.c,fontFamily:FD,flexShrink:0}}>{s.n}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{s.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{s.d}</div></div></div>)}
</div></div>
{/* CASE */}
<div style={{padding:'16px 20px 0'}}><div style={{borderRadius:16,overflow:'hidden',background:'#fff'}}>
<div style={{position:'relative',height:180}}><img src="https://ethnomir.ru/upload/iblock/0e8/6.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/><div style={{position:'absolute',top:12,left:12,display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',background:'rgba(52,199,89,.85)',backdropFilter:'blur(15px)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2}}>{'\u041a\u0415\u0419\u0421'}</div></div>
<div style={{padding:18}}><div style={{fontSize:18,fontWeight:700,fontFamily:FD,marginBottom:6}}>{'\u00ab\u0412\u043e\u043b\u0448\u0435\u0431\u043d\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0430\u00bb \u2014 8 \u043b\u0435\u0442 \u0432 \u043f\u0430\u0440\u043a\u0435'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u0414\u0435\u0442\u0441\u043a\u0438\u0439 \u043f\u0430\u0440\u043a. \u041d\u0430\u0447\u0430\u043b\u0438 \u0441 1 \u0430\u0442\u0442\u0440\u0430\u043a\u0446\u0438\u043e\u043d\u0430 \u2014 \u0441\u0435\u0439\u0447\u0430\u0441 \u0446\u0435\u043b\u0430\u044f \u0437\u043e\u043d\u0430. \u0422\u0440\u0430\u0444\u0438\u043a \u043f\u0430\u0440\u043a\u0430 = \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u0442\u043e\u043a \u0431\u0435\u0437 \u0440\u0435\u043a\u043b\u0430\u043c\u044b.'}</div>
<div style={{display:'flex',gap:12,marginTop:12}}>{[{v:'x3',l:'\u0440\u043e\u0441\u0442 \u0437\u0430 5 \u043b\u0435\u0442'},{v:'0 \u20bd',l:'\u043d\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u0443'},{v:'92%',l:'\u043f\u043e\u0432\u0442\u043e\u0440\u043d\u044b\u0435'}].map((s:any,i:number)=><div key={i} style={{flex:1,textAlign:'center',padding:'10px 0',background:'#F2F2F7',borderRadius:12}}><div style={{fontSize:18,fontWeight:800,color:B,fontFamily:FD}}>{s.v}</div><div style={{fontSize:9,color:L2,fontFamily:FT,textTransform:'uppercase',letterSpacing:.5,marginTop:2}}>{s.l}</div></div>)}</div>
</div></div></div>
{/* COMPARISON */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:IND,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0420\u0410\u0412\u041d\u0415\u041d\u0418\u0415'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 vs \u0422\u0426'}</div>
<div style={{borderRadius:12,overflow:'hidden',border:'1px solid rgba(60,60,67,.1)'}}>
<div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',background:'#F2F2F7'}}><div style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:L2,fontFamily:FT}}>{'\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440'}</div><div style={{padding:'10px 8px',fontSize:11,fontWeight:700,color:B,fontFamily:FT,textAlign:'center'}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440'}</div><div style={{padding:'10px 8px',fontSize:11,fontWeight:700,color:L2,fontFamily:FT,textAlign:'center'}}>{'\u0422\u0426'}</div></div>
{[{p:'\u0422\u0440\u0430\u0444\u0438\u043a',e:'\u0413\u0430\u0440\u0430\u043d\u0442.',t:'\u041d\u0435\u0441\u0442\u0430\u0431.'},{p:'\u0420\u0435\u043a\u043b\u0430\u043c\u0430',e:'\u0412\u043a\u043b\u044e\u0447\u0435\u043d\u0430',t:'\u0417\u0430 \u0432\u0430\u0448 \u0441\u0447\u0451\u0442'},{p:'\u0410\u0440\u0435\u043d\u0434\u0430',e:'\u043e\u0442 1 200\u20bd',t:'\u043e\u0442 3 500\u20bd'},{p:'\u0410\u0443\u0434\u0438\u0442\u043e\u0440\u0438\u044f',e:'\u0421\u0435\u043c\u044c\u0438',t:'\u0421\u043c\u0435\u0448.'},{p:'\u0414\u043e\u0433\u043e\u0432\u043e\u0440',e:'\u0413\u0438\u0431\u043a\u0438\u0439',t:'\u0416\u0451\u0441\u0442\u043a\u0438\u0439'}].map((r:any,i:number)=><div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',borderTop:'1px solid rgba(60,60,67,.06)'}}><div style={{padding:'10px 12px',fontSize:13,fontFamily:FT,color:'#000'}}>{r.p}</div><div style={{padding:'10px 8px',fontSize:13,fontWeight:600,fontFamily:FT,color:B,textAlign:'center'}}>{r.e}</div><div style={{padding:'10px 8px',fontSize:13,fontFamily:FT,color:L2,textAlign:'center'}}>{r.t}</div></div>)}
</div></div></div>
{/* ADVANTAGES */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,overflow:'hidden'}}>
{[{e:'\ud83d\udd27',t:'\u0418\u043d\u0444\u0440\u0430\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430',d:'\u0412\u043e\u0434\u0430, \u044d\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u0435\u0441\u0442\u0432\u043e, Wi-Fi, \u043e\u0445\u0440\u0430\u043d\u0430'},{e:'\ud83d\udcf1',t:'\u0426\u0438\u0444\u0440\u043e\u0432\u043e\u0439 \u043c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433',d:'\u0422\u043e\u0447\u043a\u0430 \u0432 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438 + \u043a\u0430\u0440\u0442\u0430'},{e:'\ud83e\udd1d',t:'\u0413\u0438\u0431\u043a\u0438\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f',d:'\u0424\u0438\u043a\u0441 \u0438\u043b\u0438 % \u043e\u0442 \u043e\u0431\u043e\u0440\u043e\u0442\u0430'},{e:'\ud83c\udfdb',t:'\u0411\u0440\u0435\u043d\u0434 \u042e\u041d\u0415\u0421\u041a\u041e',d:'\u041a\u0443\u043b\u044c\u0442\u0443\u0440\u043d\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442 \u043c\u0438\u0440\u043e\u0432\u043e\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f'}].map((it:any,i:number)=><div key={i} style={{display:'flex',gap:14,padding:'14px 16px',borderBottom:i<3?'1px solid rgba(60,60,67,.1)':'none'}}><div style={{width:40,height:40,borderRadius:12,background:'#F2F2F7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{it.e}</div><div><div style={{fontSize:15,fontWeight:600,fontFamily:FD}}>{it.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{it.d}</div></div></div>)}
</div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+B}}>
<div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u041c\u043e\u044f \u043c\u0435\u0447\u0442\u0430 \u2014 \u043c\u0430\u043b\u044b\u0439 \u0438 \u0441\u0440\u0435\u0434\u043d\u0438\u0439 \u0431\u0438\u0437\u043d\u0435\u0441, \u0434\u043b\u044f \u043a\u043e\u0442\u043e\u0440\u043e\u0433\u043e \u043c\u044b \u0441\u043e\u0437\u0434\u0430\u043b\u0438 \u0432\u0441\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f.\u00bb'}</div>
<div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u0420\u0443\u0441\u043b\u0430\u043d \u0411\u0430\u0439\u0440\u0430\u043c\u043e\u0432, \u043e\u0441\u043d\u043e\u0432\u0430\u0442\u0435\u043b\u044c'}</div>
</div></div>
{/* FORMATS */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:RD,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u0424\u041e\u0420\u041c\u0410\u0422\u042b'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0432\u043e\u0439 \u0444\u043e\u0440\u043c\u0430\u0442'}</div>
{[{ic:'\ud83d\udecb',t:'\u0422\u043e\u0440\u0433\u043e\u0432\u0430\u044f \u0442\u043e\u0447\u043a\u0430',d:'\u041e\u0442 5 \u043c\u00b2. \u0421\u0443\u0432\u0435\u043d\u0438\u0440\u044b, \u0440\u0435\u043c\u0451\u0441\u043b\u0430, \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u044b',c:B},{ic:'\ud83c\udf73',t:'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d / \u043a\u0430\u0444\u0435',d:'\u041e\u0442 20 \u043c\u00b2. \u041b\u044e\u0431\u0430\u044f \u043a\u0443\u0445\u043d\u044f \u043c\u0438\u0440\u0430',c:OR},{ic:'\ud83c\udfa8',t:'\u041c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0430\u044f',d:'\u041e\u0442 10 \u043c\u00b2. \u041a\u0435\u0440\u0430\u043c\u0438\u043a\u0430, \u0442\u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e, \u043a\u043e\u0432\u043a\u0430',c:GR},{ic:'\ud83c\udfa0',t:'\u0410\u0442\u0442\u0440\u0430\u043a\u0446\u0438\u043e\u043d',d:'\u041e\u0442\u043a\u0440\u044b\u0442\u0430\u044f \u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0430 \u0438\u043b\u0438 \u043f\u0430\u0432\u0438\u043b\u044c\u043e\u043d',c:PR}].map((f:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:16,marginBottom:10,display:'flex',gap:14,alignItems:'center'}}><div style={{width:48,height:48,borderRadius:14,background:f.c+'10',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{f.ic}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{f.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{f.d}</div></div></div>)}
</div>
{/* CTA */}
{sent?<div style={{padding:'16px 20px 0'}}><div style={{borderRadius:16,background:'rgba(52,199,89,.06)',border:'1px solid rgba(52,199,89,.12)',padding:'28px 16px',textAlign:'center'}}><div style={{fontSize:36,marginBottom:4}}>{'\u2705'}</div><div style={{fontSize:17,fontWeight:700,color:GR,fontFamily:FD}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e!'}</div></div></div>
:<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20,textAlign:'center'}}>
<div style={{fontSize:20,fontWeight:800,fontFamily:FD,marginBottom:16}}>{'\u041e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443'}</div>
<div style={{textAlign:'left',marginBottom:10}}><input value={nm} onChange={(e:any)=>setNm(e.target.value)} placeholder={'\u0418\u043c\u044f'} style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid rgba(60,60,67,.1)',background:'#F2F2F7',fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
<div style={{textAlign:'left',marginBottom:16}}><input value={ph} onChange={(e:any)=>setPh(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid rgba(60,60,67,.1)',background:'#F2F2F7',fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
{err&&<div style={{fontSize:13,color:'#FF3B30',marginBottom:8}}>{err}</div>}
<div className="tap" onClick={submit} style={{height:50,borderRadius:16,background:B,display:'flex',alignItems:'center',justifyContent:'center',opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{sending?'\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430...':'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}</span></div>
</div></div>}
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:18}}>
<div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>arenda@ethnomir.ru</div>
</div></div>
<div style={{height:80}}/>
</div>;
}

function BusinessLandingV2({onClose,session}:{onClose:()=>void,session?:any}){
const A='#EA580C',BL='#0284C7',GR='#34C759',OR='#FF9500',RD='#FF3B30',PR='#AF52DE',IND='#5856D6';
const FD="-apple-system,'SF Pro Display',system-ui,sans-serif",FT="-apple-system,'SF Pro Text',system-ui,sans-serif";
const L2='rgba(60,60,67,.60)';
const[nm,setNm]=(React as any).useState('');
const[ph,setPh]=(React as any).useState('');
const[sent,setSent]=(React as any).useState(false);
const[err,setErr]=(React as any).useState('');
const[sending,setSending]=(React as any).useState(false);
const submit=async()=>{if(!nm.trim()||!ph.trim()){setErr('\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0432\u0441\u0435 \u043f\u043e\u043b\u044f');return;}setSending(true);setErr('');const ok=await submitContactRequest('business','landing_business',nm,ph);if(ok){setSent(true);logActivity('lead_business',{name:nm,phone:ph});}else setErr('\u041e\u0448\u0438\u0431\u043a\u0430');setSending(false);};
return <div style={{position:'fixed',inset:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:390,zIndex:99,background:'linear-gradient(180deg,#FFF7ED 0%,#F2F2F7 12%,#F2F2F7 50%,#FEF3C7 75%,#F2F2F7 100%)',color:'#000',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
{/* HERO */}
<div style={{position:'relative',height:380,borderRadius:'0 0 20px 20px',overflow:'hidden'}}>
<img src="https://ethnomir.ru/upload/iblock/0e8/6.jpg" alt="" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/>
<div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 0%,rgba(0,0,0,.75) 100%)'}}/>
<div className="tap" onClick={onClose} style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:22,background:'rgba(255,255,255,.18)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1.5 8.5L9 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
<div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 28px'}}>
<div style={{display:'inline-flex',height:24,padding:'0 10px',borderRadius:12,lineHeight:'24px',background:'rgba(234,88,12,.85)',backdropFilter:'blur(15px)',fontSize:11,fontWeight:700,color:'#fff',fontFamily:FT,letterSpacing:2,marginBottom:10}}>{'\u0411\u0418\u0417\u041d\u0415\u0421'}</div>
<div style={{fontSize:30,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1px',lineHeight:1.05,marginBottom:8}}>{'\u0417\u0430\u0439\u0442\u0438 \u0441\u0432\u043e\u0438\u043c \u0431\u0438\u0437\u043d\u0435\u0441\u043e\u043c'}</div>
<div style={{fontSize:14,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.5}}>{'\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d, \u043c\u0430\u0441\u0442\u0435\u0440\u0441\u043a\u0430\u044f, \u043c\u0430\u0433\u0430\u0437\u0438\u043d, \u0430\u0442\u0442\u0440\u0430\u043a\u0446\u0438\u043e\u043d \u2014 \u043d\u0430 \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0435 1 000 000 \u0433\u043e\u0441\u0442\u0435\u0439'}</div>
</div></div>
{/* METRICS */}
<div style={{padding:'24px 20px 0'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
{[{t:'0 \u20bd',l:'\u043d\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u0443',c:GR},{t:'14 \u0434\u043d\u0435\u0439',l:'\u0434\u043e \u0437\u0430\u043f\u0443\u0441\u043a\u0430',c:A},{t:'75%',l:'\u0441\u0440\u0435\u0434\u043d\u0438\u0439 ROI',c:BL},{t:'365',l:'\u0434\u043d\u0435\u0439 \u0441\u0435\u0437\u043e\u043d',c:PR}].map((s:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:'18px 12px',textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.c,fontFamily:FD}}>{s.t}</div><div style={{fontSize:10,color:L2,fontFamily:FT,marginTop:3,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div></div>)}
</div></div>
{/* WHY */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041f\u043e\u0447\u0435\u043c\u0443 \u0438\u043c\u0435\u043d\u043d\u043e \u0437\u0434\u0435\u0441\u044c?'}</div>
<div style={{fontSize:15,color:L2,fontFamily:FT,lineHeight:1.6}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 \u2014 \u043d\u0435 \u0422\u0426. \u0417\u0434\u0435\u0441\u044c \u043b\u044e\u0434\u0438 \u043f\u0440\u0438\u0445\u043e\u0434\u044f\u0442 \u043d\u0430 \u0446\u0435\u043b\u044b\u0439 \u0434\u0435\u043d\u044c. \u0421\u0440\u0435\u0434\u043d\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u0432 \u043f\u0430\u0440\u043a\u0435 \u2014 6 \u0447\u0430\u0441\u043e\u0432. \u041a\u0430\u0436\u0434\u044b\u0439 \u0433\u043e\u0441\u0442\u044c \u0442\u0440\u0430\u0442\u0438\u0442 \u0432 \u0441\u0440\u0435\u0434\u043d\u0435\u043c 2 800 \u20bd. \u0412\u0430\u0448 \u0431\u0438\u0437\u043d\u0435\u0441 \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f \u0447\u0430\u0441\u0442\u044c\u044e \u044d\u0442\u043e\u0433\u043e \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0430.'}</div>
</div></div>
{/* REVENUE PIE */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:A,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0422\u0420\u0423\u041a\u0422\u0423\u0420\u0410 \u0414\u041e\u0425\u041e\u0414\u0410'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041d\u0430 \u0447\u0451\u043c \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u044e\u0442 \u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442\u044b'}</div>
<div style={{display:'flex',alignItems:'center',gap:20}}>
<svg viewBox="0 0 100 100" width="110" height="110">
<circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,120,128,.08)" strokeWidth="12"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={A} strokeWidth="12" strokeDasharray="112 152" strokeDashoffset="66" strokeLinecap="round"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={BL} strokeWidth="12" strokeDasharray="79 185" strokeDashoffset="-46" strokeLinecap="round"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={GR} strokeWidth="12" strokeDasharray="53 211" strokeDashoffset="-125" strokeLinecap="round"/>
<circle cx="50" cy="50" r="42" fill="none" stroke={PR} strokeWidth="12" strokeDasharray="20 244" strokeDashoffset="-178" strokeLinecap="round"/>
</svg>
<div style={{flex:1}}>
{[{c:A,l:'\u0422\u043e\u0432\u0430\u0440\u044b',v:'42%'},{c:BL,l:'\u0415\u0434\u0430',v:'30%'},{c:GR,l:'\u041c\u0430\u0441\u0442\u0435\u0440-\u043a\u043b\u0430\u0441\u0441\u044b',v:'20%'},{c:PR,l:'\u0423\u0441\u043b\u0443\u0433\u0438',v:'8%'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:i<3?8:0}}><div style={{width:10,height:10,borderRadius:5,background:r.c}}/><span style={{fontSize:13,fontFamily:FT,flex:1}}>{r.l}</span><span style={{fontSize:13,fontWeight:700,color:r.c,fontFamily:FD}}>{r.v}</span></div>)}
</div></div>
</div></div>
{/* INVEST MODEL */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:GR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0418\u041d\u0412\u0415\u0421\u0422\u0418\u0426\u0418\u0418'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041c\u043e\u0434\u0435\u043b\u044c \u0432\u0445\u043e\u0434\u0430'}</div>
<div style={{borderRadius:12,overflow:'hidden',border:'1px solid rgba(60,60,67,.1)'}}>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',background:'#F2F2F7'}}><div style={{padding:'10px 12px',fontSize:11,fontWeight:700,color:L2,fontFamily:FT}}>{'\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440'}</div><div style={{padding:'10px 8px',fontSize:11,fontWeight:700,color:GR,fontFamily:FT,textAlign:'center'}}>{'\u041c\u0438\u043d.'}</div><div style={{padding:'10px 8px',fontSize:11,fontWeight:700,color:A,fontFamily:FT,textAlign:'center'}}>{'\u041e\u043f\u0442\u0438\u043c.'}</div></div>
{[{p:'\u0412\u0445\u043e\u0434',a:'300K \u20bd',b:'1.2M \u20bd'},{p:'\u0410\u0440\u0435\u043d\u0434\u0430/\u043c\u0435\u0441',a:'6K \u20bd',b:'60K \u20bd'},{p:'\u041e\u043a\u0443\u043f\u0430\u0435\u043c.',a:'4 \u043c\u0435\u0441',b:'8 \u043c\u0435\u0441'},{p:'\u0412\u044b\u0440\u0443\u0447\u043a\u0430/\u043c\u0435\u0441',a:'80K \u20bd',b:'500K \u20bd'},{p:'\u041c\u0430\u0440\u0436\u0430',a:'40%',b:'65%'}].map((r:any,i:number)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderTop:'1px solid rgba(60,60,67,.06)'}}><div style={{padding:'10px 12px',fontSize:13,fontFamily:FT}}>{r.p}</div><div style={{padding:'10px 8px',fontSize:13,fontWeight:600,fontFamily:FT,color:GR,textAlign:'center'}}>{r.a}</div><div style={{padding:'10px 8px',fontSize:13,fontWeight:600,fontFamily:FT,color:A,textAlign:'center'}}>{r.b}</div></div>)}
</div></div></div>
{/* AUDIENCE */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:PR,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0410\u0423\u0414\u0418\u0422\u041e\u0420\u0418\u042f'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u041a\u0442\u043e \u0432\u0430\u0448\u0438 \u043a\u043b\u0438\u0435\u043d\u0442\u044b'}</div>
{[{e:'\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',t:'\u0421\u0435\u043c\u044c\u0438 \u0441 \u0434\u0435\u0442\u044c\u043c\u0438',v:'55%',c:A},{e:'\ud83c\udfe2',t:'\u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u044b\u0435 \u0433\u0440\u0443\u043f\u043f\u044b',v:'20%',c:BL},{e:'\ud83c\udf93',t:'\u0428\u043a\u043e\u043b\u044c\u043d\u044b\u0435 \u044d\u043a\u0441\u043a\u0443\u0440\u0441\u0438\u0438',v:'15%',c:GR},{e:'\ud83e\uddd3',t:'\u0418\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0435',v:'10%',c:PR}].map((a:any,i:number)=><div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<3?'1px solid rgba(60,60,67,.06)':'none'}}><div style={{fontSize:24,width:36,textAlign:'center',flexShrink:0}}>{a.e}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,fontFamily:FD}}>{a.t}</div></div><div style={{fontSize:16,fontWeight:800,color:a.c,fontFamily:FD}}>{a.v}</div></div>)}
</div></div>
{/* SUPPORT */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:BL,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041f\u041e\u0414\u0414\u0415\u0420\u0416\u041a\u0410'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u0427\u0442\u043e \u0434\u0430\u0451\u0442 \u043f\u0430\u0440\u043a'}</div>
{[{e:'\ud83d\udce3',t:'\u041c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433',d:'\u0412\u0430\u0448\u0430 \u0442\u043e\u0447\u043a\u0430 \u0432 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438, \u043d\u0430 \u0441\u0430\u0439\u0442\u0435, \u043d\u0430 \u043a\u0430\u0440\u0442\u0435',c:A},{e:'\u26a1',t:'\u041a\u043e\u043c\u043c\u0443\u043d\u0438\u043a\u0430\u0446\u0438\u0438',d:'\u0412\u043e\u0434\u0430, \u044d\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u0435\u0441\u0442\u0432\u043e, Wi-Fi, \u043e\u0442\u043e\u043f\u043b\u0435\u043d\u0438\u0435',c:BL},{e:'\ud83d\udee1',t:'\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c',d:'\u041e\u0445\u0440\u0430\u043d\u0430 24/7, \u0432\u0438\u0434\u0435\u043e\u043d\u0430\u0431\u043b\u044e\u0434\u0435\u043d\u0438\u0435, \u043f\u0430\u0440\u043a\u043e\u0432\u043a\u0430',c:GR}].map((s:any,i:number)=><div key={i} style={{background:'#fff',borderRadius:16,padding:16,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}><div style={{width:44,height:44,borderRadius:14,background:s.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{s.e}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{s.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{s.d}</div></div></div>)}
</div>
{/* TIMELINE */}
<div style={{padding:'16px 20px 0'}}><div style={{fontSize:12,fontWeight:700,color:A,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,textAlign:'center',marginBottom:8}}>{'\u041f\u0423\u0422\u042c'}</div>
<div style={{fontSize:22,fontWeight:800,fontFamily:FD,textAlign:'center',marginBottom:12}}>{'\u041a\u0430\u043a \u0441\u0442\u0430\u0440\u0442\u043e\u0432\u0430\u0442\u044c'}</div>
<div style={{background:'#fff',borderRadius:16,overflow:'hidden'}}>
{[{n:'1',t:'\u0417\u0430\u044f\u0432\u043a\u0430',d:'\u041e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u043d\u0442\u0430\u043a\u0442 \u2014 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0441\u0432\u044f\u0436\u0435\u0442\u0441\u044f',c:A},{n:'2',t:'\u042d\u043a\u0441\u043a\u0443\u0440\u0441\u0438\u044f',d:'\u041f\u043e\u043a\u0430\u0436\u0435\u043c \u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0438, \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0443 \u0442\u0440\u0430\u0444\u0438\u043a\u0430',c:BL},{n:'3',t:'\u0414\u043e\u0433\u043e\u0432\u043e\u0440',d:'\u0424\u0438\u043a\u0441 \u0438\u043b\u0438 % \u043e\u0442 \u043e\u0431\u043e\u0440\u043e\u0442\u0430. \u0412\u044b \u0432\u044b\u0431\u0438\u0440\u0430\u0435\u0442\u0435',c:GR},{n:'4',t:'\u0417\u0430\u043f\u0443\u0441\u043a',d:'\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043a \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044e \u0438 \u043a\u0430\u0440\u0442\u0435 \u043f\u0430\u0440\u043a\u0430',c:PR}].map((s:any,i:number)=><div key={i} style={{display:'flex',gap:14,padding:'14px 16px',borderBottom:i<3?'1px solid rgba(60,60,67,.1)':'none'}}><div style={{width:32,height:32,borderRadius:16,background:s.c+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:s.c,fontFamily:FD,flexShrink:0}}>{s.n}</div><div><div style={{fontSize:16,fontWeight:700,fontFamily:FD}}>{s.t}</div><div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:2}}>{s.d}</div></div></div>)}
</div></div>
{/* COMPARISON */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:IND,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u0421\u0420\u0410\u0412\u041d\u0415\u041d\u0418\u0415'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u042d\u0442\u043d\u043e\u043c\u0438\u0440 vs \u0441\u0430\u043c\u043e\u0441\u0442\u043e\u044f\u0442\u0435\u043b\u044c\u043d\u043e'}</div>
{[{p:'\u0422\u0440\u0430\u0444\u0438\u043a',e:'\u0413\u043e\u0442\u043e\u0432\u044b\u0439',t:'\u0421 \u043d\u0443\u043b\u044f'},{p:'\u0420\u0435\u043a\u043b\u0430\u043c\u0430',e:'0 \u20bd',t:'50-200K/\u043c\u0435\u0441'},{p:'\u0421\u0442\u0430\u0440\u0442',e:'14 \u0434\u043d\u0435\u0439',t:'3-6 \u043c\u0435\u0441.'},{p:'\u0420\u0438\u0441\u043a\u0438',e:'\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0435',t:'\u0412\u044b\u0441\u043e\u043a\u0438\u0435'}].map((r:any,i:number)=><div key={i} style={{display:'flex',alignItems:'center',padding:'10px 0',borderBottom:i<3?'1px solid rgba(60,60,67,.06)':'none'}}><div style={{flex:1,fontSize:13,fontFamily:FT,color:L2}}>{r.p}</div><div style={{flex:1,fontSize:13,fontWeight:700,color:A,fontFamily:FD,textAlign:'center'}}>{r.e}</div><div style={{flex:1,fontSize:13,fontFamily:FT,color:L2,textAlign:'center'}}>{r.t}</div></div>)}
</div></div>
{/* SUCCESS CHART */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20}}>
<div style={{fontSize:12,fontWeight:700,color:A,letterSpacing:2,textTransform:'uppercase',fontFamily:FT,marginBottom:4}}>{'\u041a\u0415\u0419\u0421\u042b'}</div>
<div style={{fontSize:20,fontWeight:700,fontFamily:FD,marginBottom:16}}>{'\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b \u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442\u043e\u0432'}</div>
{[{l:'\u0412\u043e\u043b\u0448\u0435\u0431\u043d\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0430',v:92,c:A},{l:'\u041a\u0435\u0440\u0430\u043c\u0438\u043a\u0430 \u041c\u0438\u0440\u0430',v:78,c:BL},{l:'\u0410\u0440\u043e\u043c\u0430\u0442\u044b \u0412\u043e\u0441\u0442\u043e\u043a\u0430',v:85,c:GR},{l:'\u041f\u0435\u043b\u044c\u043c\u0435\u043d\u043d\u0430\u044f',v:70,c:PR}].map((b:any,i:number)=><div key={i} style={{marginBottom:i<3?12:0}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:14,fontWeight:600,fontFamily:FD}}>{b.l}</span><span style={{fontSize:14,fontWeight:700,color:b.c,fontFamily:FD}}>{b.v}%</span></div><div style={{height:8,borderRadius:4,background:'rgba(120,120,128,.08)'}}><div style={{height:8,borderRadius:4,background:b.c,width:b.v+'%'}}/></div></div>)}
<div style={{fontSize:11,color:L2,fontFamily:FT,marginTop:8,textAlign:'center'}}>{'% \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u044b\u0445 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432 \u0437\u0430 2024 \u0433.'}</div>
</div></div>
{/* QUOTE */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:'20px 20px 20px 23px',borderLeft:'3px solid '+A}}>
<div style={{fontSize:16,fontStyle:'italic',color:'#000',fontFamily:"Georgia,serif",lineHeight:1.6}}>{'\u00ab\u041c\u044b \u0441\u043e\u0437\u0434\u0430\u043b\u0438 \u044d\u043a\u043e\u0441\u0438\u0441\u0442\u0435\u043c\u0443, \u0433\u0434\u0435 \u043a\u0430\u0436\u0434\u044b\u0439 \u0431\u0438\u0437\u043d\u0435\u0441 \u0443\u0441\u0438\u043b\u0438\u0432\u0430\u0435\u0442 \u0434\u0440\u0443\u0433\u043e\u0439. \u0427\u0435\u043c \u0431\u043e\u043b\u044c\u0448\u0435 \u0440\u0435\u0437\u0438\u0434\u0435\u043d\u0442\u043e\u0432, \u0442\u0435\u043c \u0434\u043e\u043b\u044c\u0448\u0435 \u0433\u043e\u0441\u0442\u044c \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u0438 \u0431\u043e\u043b\u044c\u0448\u0435 \u0442\u0440\u0430\u0442\u0438\u0442.\u00bb'}</div>
<div style={{fontSize:13,color:L2,fontFamily:FT,marginTop:8}}>{'\u0420\u0443\u0441\u043b\u0430\u043d \u0411\u0430\u0439\u0440\u0430\u043c\u043e\u0432, \u043e\u0441\u043d\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u042d\u0442\u043d\u043e\u043c\u0438\u0440\u0430'}</div>
</div></div>
{/* CTA */}
{sent?<div style={{padding:'16px 20px 0'}}><div style={{borderRadius:16,background:'rgba(52,199,89,.06)',border:'1px solid rgba(52,199,89,.12)',padding:'28px 16px',textAlign:'center'}}><div style={{fontSize:36,marginBottom:4}}>{'\u2705'}</div><div style={{fontSize:17,fontWeight:700,color:GR,fontFamily:FD}}>{'\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e!'}</div></div></div>
:<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:20,textAlign:'center'}}>
<div style={{fontSize:20,fontWeight:800,fontFamily:FD,marginBottom:16}}>{'\u041e\u0431\u0441\u0443\u0434\u0438\u0442\u044c \u0432\u0445\u043e\u0434'}</div>
<div style={{textAlign:'left',marginBottom:10}}><input value={nm} onChange={(e:any)=>setNm(e.target.value)} placeholder={'\u0418\u043c\u044f'} style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid rgba(60,60,67,.1)',background:'#F2F2F7',fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
<div style={{textAlign:'left',marginBottom:16}}><input value={ph} onChange={(e:any)=>setPh(e.target.value)} placeholder="+7 900 123-45-67" type="tel" style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'1px solid rgba(60,60,67,.1)',background:'#F2F2F7',fontSize:16,fontFamily:FT,color:'#000',outline:'none',boxSizing:'border-box'}}/></div>
{err&&<div style={{fontSize:13,color:RD,marginBottom:8}}>{err}</div>}
<div className="tap" onClick={submit} style={{height:50,borderRadius:16,background:A,display:'flex',alignItems:'center',justifyContent:'center',opacity:sending?.5:1}}><span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{sending?'\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430...':'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}</span></div>
</div></div>}
{/* CONTACTS */}
<div style={{padding:'16px 20px 0'}}><div style={{background:'#fff',borderRadius:16,padding:18}}>
<div style={{fontSize:17,fontWeight:700,fontFamily:FD,marginBottom:8}}>{'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}</div>
<div style={{fontSize:14,color:L2,fontFamily:FT,lineHeight:1.8}}>+7 495 023-81-81<br/>business@ethnomir.ru<br/>ethnomir.ru</div>
</div></div>
<div style={{height:80}}/>
</div>;
}

function FranchiseLanding({onClose,slug:_slug}:{onClose:()=>void,slug?:string}) { const slug=_slug||'franchise';
  const [data,setData]=useState<any>(null);const [loading,setLoading]=useState(true);
  const [name,setName]=useState('');const [phone,setPhone]=useState('');const [msg,setMsg]=useState('');const [plan,setPlan]=useState(0);const [rentPlan,setRentPlan]=useState(0);const [bizPlan,setBizPlan]=useState(0);
  const scrollRef=React.useRef<HTMLDivElement>(null);
  useEffect(()=>{sb('landing_pages','select=*&slug=eq.'+slug+'&limit=1').then((d:any)=>{if(d&&d[0])setData(d[0]);setLoading(false);});},[]);
  useEffect(()=>{const el=scrollRef.current;if(!el)return;const t=setTimeout(()=>{const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('fr-vis');obs.unobserve(e.target);}});},{threshold:0.08,rootMargin:'0px 0px -30px 0px'});el.querySelectorAll('.fr-a').forEach(n=>obs.observe(n));return()=>obs.disconnect();},200);return()=>clearTimeout(t);},[data]);
  const ac=data?.accent_color||'#818CF8';
  if(loading) return <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:250,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><Spinner/></div>;
  if(!data) return <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:250,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{color:"var(--label2)",fontFamily:FT}}>Не найдено</div><div className="tap" onClick={onClose} style={{color:"#007AFF",fontFamily:FT}}>Назад</div></div>;
  const secs=data.sections||[];
  const bPlans=[{name:"Ресторан",traffic:"1М+/год",audience:"Семьи, туристы",model:"% от оборота",start:"от 2 млн ₽",example:"18 ресторанов",feat:["Этно-кухня","Фаст-фуд","Кондитерская","Кафе","Бар"]},{name:"Мастерская",traffic:"100% проход.",audience:"Дети, взрослые",model:"Аренда + доход МК",start:"от 300 тыс. ₽",example:"Гончарная, ковка",feat:["Гончарная","Кузнечная","Ткацкая","Эбру","Мыловарение"]},{name:"Магазин",traffic:"1М+/год",audience:"Все гости",model:"Аренда от 6 м²",start:"от 200 тыс. ₽",example:"Сувениры, арт",feat:["Сувениры","Этно-декор","Одежда","Книги","Украшения"]},{name:"Развлечения",traffic:"40% — семьи",audience:"Дети 3–14 лет",model:"Билет / аренда",start:"от 1 млн ₽",example:"Дебри, Динопарк",feat:["Аттракцион","Квест","Парк","Лабиринт","VR-зона"]}];
  const rPlans=[{name:"Торговая точка",area:"от 6 м²",loc:"Улица Мира",traffic:"1М+/год",format:"Долгосрочная",price:"Индивид.",feat:["Сувениры","Этно-товары","Одежда","Книги","Декор"]},{name:"Мастерская",area:"от 15 м²",loc:"Этнодворы",traffic:"100% проход.",format:"Долгосрочная",price:"Индивид.",feat:["Гончарная","Кузнечная","Ткацкая","Кулинарная","Эбру"]},{name:"Кафе/Ресторан",area:"от 50 м²",loc:"Павильоны",traffic:"18 работают",format:"Долгосрочная",price:"% от оборота",feat:["Этно-кухня","Фаст-фуд","Кондитерская","Чайная","Бар"]},{name:"Площадка",area:"до 140 га",loc:"Открытая",traffic:"до 50K/день",format:"На мероприятие",price:"от 2 500 ₽/ч",feat:["Фестивали","Ярмарки","Концерты","Спорт","Свадьбы"]}];
  const fPlans=[{name:"10 тыс. м²",invest:"$8 млн",area:"10 000 м²",payback:"3,5–4 года",fee:"$800 тыс.",cap:"$70,5 млн",profit:"$500К/мес",objs:["Музей","Выставка","VR","Мастерские","Магазины","Дет. центр","Коворкинг"]},{name:"10 га",invest:"$25 млн",area:"16 000 м²",payback:"4–5 лет",fee:"$1,5 млн",cap:"$200 млн",profit:"$1,5М/мес",objs:["Этнодворы","Отели","Рестораны","Мастерские","Развлечения","Конференции"]},{name:"20 га",invest:"$50 млн",area:"30 000 м²",payback:"5–7 лет",fee:"$2,5 млн",cap:"$400 млн",profit:"$3М/мес",objs:["Полная инфраструктура","Все отели","Все рестораны","СПА и бани","Аквапарк","Стадион"]}];
  const renderSec=(s:any,idx:number)=>{
    if(s.type==='hero_image') return null;
    if(s.type==='biz_calc'){const b=bPlans[bizPlan];return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}><div style={{fontSize:10,fontWeight:700,color:"#007AFF",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>ФОРМАТЫ БИЗНЕСА</div><div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>Выберите направление</div><div style={{display:"flex",borderRadius:9,background:"rgba(118,118,128,.12)",padding:2,marginBottom:20}}>{bPlans.map((bp:any,i:number)=><div key={i} className="tap" onClick={()=>setBizPlan(i)} style={{flex:1,textAlign:"center",padding:"7px 0",borderRadius:7,fontSize:13,fontWeight:bizPlan===i?600:400,color:bizPlan===i?"var(--label)":"var(--label2)",fontFamily:FT,background:bizPlan===i?"#fff":"transparent",boxShadow:bizPlan===i?"0 1px 3px rgba(0,0,0,.08)":"none",transition:"all .3s cubic-bezier(.2,.8,.2,1)"}}>{bp.name}</div>)}</div><div key={"bc"+bizPlan} className="fc-in"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>{([["Трафик",b.traffic,"#34C759"],["Аудитория",b.audience,"#007AFF"],["Модель",b.model,"#FF9500"],["Старт",b.start,"#AF52DE"]] as any).map(([l,v,c]:any,k:number)=><div key={k} style={{padding:14,borderRadius:16,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,color:c,fontFamily:FD,letterSpacing:"-.3px"}}>{v}</div><div style={{fontSize:10,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{l}</div></div>)}</div><div style={{padding:"12px 16px",borderRadius:14,background:"var(--fill4)",marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>Уже работают</span><span style={{fontSize:15,fontWeight:600,color:"#007AFF",fontFamily:FD}}>{b.example}</span></div></div><div style={{padding:"14px 16px",borderRadius:14,background:"var(--fill4)"}}><div style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:8}}>Идеи для вашего бизнеса</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{b.feat.map((f:string,k:number)=><span key={k} style={{padding:"5px 10px",borderRadius:8,background:"rgba(0,122,255,.06)",fontSize:11,color:"#007AFF",fontFamily:FT,fontWeight:500}}>{f}</span>)}</div></div></div></div>;}
    if(s.type==='process_steps'){return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:"#007AFF",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}{s.title&&<div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:20}}>{s.title}</div>}<div style={{position:"relative",paddingLeft:28}}><div style={{position:"absolute",left:9,top:6,bottom:6,width:2,background:"var(--sep-opaque)"}}/>
    {(s.items||[]).map(([num,title,desc]:any,k:number)=><div key={k} className="fr-a" style={{position:"relative",marginBottom:k<(s.items||[]).length-1?24:0}}><div style={{position:"absolute",left:-28,top:0,width:20,height:20,borderRadius:10,background:ac,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontWeight:700,color:"#fff",fontFamily:FD}}>{num}</span></div><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{title}</div><div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,lineHeight:1.5,marginTop:3}}>{desc}</div></div>)}</div></div>;}
    if(s.type==='meter'){const MeterBar=({pct,color,label,sub}:{pct:number,color:string,label:string,sub:string})=>{const [w,setW]=useState(0);const ref=React.useRef<HTMLDivElement>(null);React.useEffect(()=>{const el=ref.current;if(!el)return;const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setTimeout(()=>setW(pct),150);obs.disconnect();}},{threshold:0.3});obs.observe(el);return()=>obs.disconnect();},[pct]);return <div ref={ref} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{label}</span><span style={{fontSize:13,fontWeight:700,color,fontFamily:FD}}>{pct}%</span></div><div style={{height:8,borderRadius:4,background:"var(--fill4)",overflow:"hidden"}}><div style={{height:"100%",width:w+"%",borderRadius:4,background:color,transition:"width 1.2s cubic-bezier(.22,1,.36,1)"}}></div></div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:3}}>{sub}</div></div>;};return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:"#007AFF",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}{s.title&&<div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>{s.title}</div>}{(s.items||[]).map(([pct,color,label,sub]:any,k:number)=><MeterBar key={k} pct={pct} color={color} label={label} sub={sub}/>)}</div>;}
    if(s.type==='animated_counter'){const CountUp=({target,color}:{target:number,color:string})=>{const [val,setVal]=useState(0);const ref=React.useRef<HTMLDivElement>(null);const started=React.useRef(false);React.useEffect(()=>{const el=ref.current;if(!el)return;const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!started.current){started.current=true;const dur=1200;const st=performance.now();const tick=(now:number)=>{const p=Math.min((now-st)/dur,1);const ease=1-Math.pow(1-p,3);setVal(Math.round(target*ease));if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);}},{threshold:0.3});obs.observe(el);return()=>obs.disconnect();},[target]);return <div ref={ref} style={{fontSize:22,fontWeight:700,color,fontFamily:FD,letterSpacing:"-.5px",fontVariantNumeric:"tabular-nums"}}>{val.toLocaleString("ru")}</div>;};return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:"#007AFF",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}{s.title&&<div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>{s.title}</div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{(s.items||[]).map(([display,label,color,target]:any,k:number)=><div key={k} style={{padding:"18px 12px",borderRadius:16,background:"var(--fill4)",textAlign:"center"}}><CountUp target={target||0} color={color||ac}/><div style={{fontSize:10,color:"var(--label2)",fontFamily:FT,marginTop:4,textTransform:"uppercase",letterSpacing:".5px"}}>{label}</div></div>)}</div></div>;}
    if(s.type==='rent_calc'){const r=rPlans[rentPlan];return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}><div style={{fontSize:10,fontWeight:700,color:"#007AFF",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>ФОРМАТЫ АРЕНДЫ</div><div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>Подберите площадку</div><div style={{display:"flex",borderRadius:9,background:"rgba(118,118,128,.12)",padding:2,marginBottom:20}}>{rPlans.map((rp:any,i:number)=><div key={i} className="tap" onClick={()=>setRentPlan(i)} style={{flex:1,textAlign:"center",padding:"7px 0",borderRadius:7,fontSize:13,fontWeight:rentPlan===i?600:400,color:rentPlan===i?"var(--label)":"var(--label2)",fontFamily:FT,background:rentPlan===i?"#fff":"transparent",boxShadow:rentPlan===i?"0 1px 3px rgba(0,0,0,.08)":"none",transition:"all .3s cubic-bezier(.2,.8,.2,1)"}}>{rp.name}</div>)}</div><div key={"rc"+rentPlan} className="fc-in"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>{([["Площадь",r.area,"#007AFF"],["Локация",r.loc,"#34C759"],["Трафик",r.traffic,"#FF9500"],["Формат",r.format,"#AF52DE"]] as any).map(([l,v,c]:any,k:number)=><div key={k} style={{padding:14,borderRadius:16,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,color:c,fontFamily:FD,letterSpacing:"-.3px"}}>{v}</div><div style={{fontSize:10,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{l}</div></div>)}</div><div style={{padding:"12px 16px",borderRadius:14,background:"var(--fill4)",marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>Стоимость</span><span style={{fontSize:15,fontWeight:600,color:"#007AFF",fontFamily:FD}}>{r.price}</span></div></div><div style={{padding:"14px 16px",borderRadius:14,background:"var(--fill4)"}}><div style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:8}}>Подходит для</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{r.feat.map((f:string,k:number)=><span key={k} style={{padding:"5px 10px",borderRadius:8,background:"rgba(0,122,255,.08)",fontSize:11,color:ac,fontFamily:FT,fontWeight:500}}>{f}</span>)}</div></div></div></div>;}
    if(s.type==='franchise_calc'){const p=fPlans[plan];return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}><div style={{fontSize:10,fontWeight:700,color:"#007AFF",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>ВИДЫ ФРАНШИЗЫ</div><div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>Калькулятор инвестиций</div><div style={{display:"flex",borderRadius:9,background:"rgba(118,118,128,.12)",padding:2,marginBottom:20}}>{fPlans.map((pl:any,i:number)=><div key={i} className="tap" onClick={()=>setPlan(i)} style={{flex:1,textAlign:"center",padding:"7px 0",borderRadius:7,fontSize:13,fontWeight:plan===i?600:400,color:plan===i?"var(--label)":"var(--label2)",fontFamily:FT,background:plan===i?"#fff":"transparent",boxShadow:plan===i?"0 1px 3px rgba(0,0,0,.08)":"none",transition:"all .3s cubic-bezier(.2,.8,.2,1)"}}>{pl.name}</div>)}</div><div key={"fc"+plan} className="fc-in"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>{([["Инвестиции",p.invest,"#FF9500"],["Окупаемость",p.payback,"#34C759"],["Прибыль/мес",p.profit,"#6366F1"],["Капитал. 10 лет",p.cap,"#AF52DE"],["Площадь",p.area,"#007AFF"],["Паушальный",p.fee,"#FF3B30"]] as any).map(([l,v,c]:any,k:number)=><div key={k} style={{padding:14,borderRadius:16,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:17,fontWeight:700,color:c,fontFamily:FD,letterSpacing:"-.3px"}}>{v}</div><div style={{fontSize:10,color:"var(--label2)",fontFamily:FT,marginTop:3}}>{l}</div></div>)}</div><div style={{display:"flex",gap:8,marginBottom:12}}><div style={{flex:1,padding:10,borderRadius:12,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FD}}>5%</div><div style={{fontSize:10,color:"var(--label2)",fontFamily:FT,marginTop:2}}>Роялти</div></div><div style={{flex:1,padding:10,borderRadius:12,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FD}}>1%</div><div style={{fontSize:10,color:"var(--label2)",fontFamily:FT,marginTop:2}}>Маркетинг</div></div></div><div style={{padding:"14px 16px",borderRadius:14,background:"var(--fill4)"}}><div style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:8}}>Основные объекты</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{p.objs.map((o:string,k:number)=><span key={k} style={{padding:"5px 10px",borderRadius:8,background:"rgba(0,122,255,.06)",fontSize:11,color:"#007AFF",fontFamily:FT,fontWeight:500}}>{o}</span>)}</div></div></div></div>;}
    if(s.type==='hero_image') return <div key={idx} className="fr-a" style={{position:"relative",height:220,borderRadius:20,overflow:"hidden",margin:"20px 20px 0"}}><img src={s.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",top:0,left:0}}/><div style={{position:"absolute",inset:0,background:s.gradient||"linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.85) 100%)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:20}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}<div style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:FD,lineHeight:1.15}}>{s.title}</div>{s.subtitle&&<div style={{fontSize:14,color:"rgba(255,255,255,.65)",fontFamily:FT,marginTop:6,lineHeight:1.5}}>{s.subtitle}</div>}</div></div>;
    if(s.type==='stats') return <div key={idx} className="fr-a" style={{padding:"24px 20px"}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}{s.title&&<div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>{s.title}</div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{(s.items||[]).map((it:any,k:number)=>(<div key={k} style={{padding:"14px",borderRadius:16,background:"var(--fill4)",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:it[2]||ac,fontFamily:FD}}>{it[0]}</div><div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{it[1]}</div></div>))}</div></div>;
    if(s.type==='text') return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}><div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:8}}>{s.title}</div><div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.6}}>{s.content}</div></div>;
    if(s.type==='cards') return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}{s.title&&<div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:14}}>{s.title}</div>}{(s.items||[]).map(([ic,t,d]:any,k:number)=>(<div key={k} style={{padding:"14px 16px",borderRadius:14,background:"var(--fill4)",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}><span style={{fontSize:24,flexShrink:0}}>{ic}</span><div><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{t}</div><div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:3,lineHeight:1.5}}>{d}</div></div></div>))}</div>;
    if(s.type==='feature') return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}>{s.image&&<div style={{height:180,borderRadius:16,overflow:"hidden",marginBottom:14}}><img src={s.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}{s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}<div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:8}}>{s.title}</div><div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.6}}>{s.body}</div></div>;
    if(s.type==='products') return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:ac,letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT,marginBottom:4}}>{s.label}</div>}{s.title&&<div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:12}}>{s.title}</div>}<div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>{(s.items||[]).map((p:any,k:number)=>(<div key={k} style={{flexShrink:0,width:140,borderRadius:14,overflow:"hidden",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)"}}>{p.image&&<div style={{height:80}}><img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}<div style={{padding:"8px 10px"}}><div style={{fontSize:12,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{p.name}</div><div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{p.caption}</div>{p.price&&<div style={{fontSize:12,fontWeight:700,color:ac,fontFamily:FD,marginTop:4}}>от {p.price.toLocaleString("ru")} ₽</div>}</div></div>))}</div></div>;
    if(s.type==='quote') return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}><div style={{padding:"20px",borderRadius:16,background:"var(--fill4)",borderLeft:"3px solid "+ac}}><div style={{fontSize:15,color:"var(--label)",fontFamily:FT,fontStyle:"italic",lineHeight:1.6}}>«{s.text}»</div>{s.author&&<div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:10}}>— {s.author}</div>}</div></div>;
    if(s.type==='cta') return <div key={idx} className="fr-a" style={{padding:"0 20px 24px"}}><div style={{padding:"20px",borderRadius:16,background:"rgba(0,122,255,.05)",border:"0.5px solid rgba(0,122,255,.12)",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{s.title}</div>{s.subtitle&&<div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4}}>{s.subtitle}</div>}</div></div>;
    return null;
  };
  const css=`.fr-a{opacity:0;transform:translateY(24px);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)}.fr-vis{opacity:1!important;transform:translateY(0)!important}@keyframes fcIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}.fc-in{animation:fcIn .45s cubic-bezier(.2,.8,.2,1) both}`;
  return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:250,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:110}}>
        <div style={{position:"relative",height:240,background:"linear-gradient(135deg,#4F46E5,#818CF8,#6366F1)",display:"flex",alignItems:"flex-end",padding:20}}>
          <div className="tap" onClick={onClose} style={{position:"absolute",left:16,top:54,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.2)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18,color:"#fff",fontWeight:300}}>‹</span></div>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:FT}}>ЭТНОМИР</div>
            <div style={{fontSize:30,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4,lineHeight:1.1}}>{data.title_ru}</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.7)",fontFamily:FT,marginTop:8,lineHeight:1.4}}>{data.subtitle_ru}</div>
          </div>
        </div>
        {secs.map(renderSec)}
        <div style={{padding:"0 20px 24px"}}>
          <div style={{padding:20,borderRadius:16,background:"rgba(0,122,255,.05)",border:"0.5px solid rgba(0,122,255,.12)"}}>
            <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:14}}>Оставьте заявку</div>
            <input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Ваше имя" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:8,boxSizing:"border-box"}}/>
            <input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="Телефон" type="tel" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:8,boxSizing:"border-box"}}/>
            <textarea value={msg} onChange={(e:any)=>setMsg(e.target.value)} placeholder="Ваш город и комментарии" rows={3} style={{width:"100%",padding:"12px 14px",borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",fontSize:15,color:"var(--label)",fontFamily:FT,marginBottom:4,boxSizing:"border-box",resize:"vertical"}}/>
          </div>
        </div>
        <div style={{padding:"0 20px 40px"}}><div className="tap" onClick={async()=>{if(!phone){alert("Укажите телефон");return;}await submitContactRequest("franchise","franchise_landing",name,phone,msg);alert("Заявка отправлена!");}} style={{borderRadius:14,background:"#007AFF",height:50,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>Отправить заявку</span></div></div>
      </div>
    </div>
  );
}


// ─── CART ─────────────────────────────────────────────────
type CartItem = {id:string,cat:string,itemId:string,name:string,emoji:string,qty:number,price:number,meta?:any};
const CART_KEY = "em_cart_v2";
const SID_KEY = "em_sid";
function getSessionId():string{let s=localStorage.getItem(SID_KEY);if(!s){s=Date.now().toString(36)+Math.random().toString(36).slice(2);localStorage.setItem(SID_KEY,s);}return s;}
async function syncCartToDB(cart:CartItem[],userId?:string){
  if(!userId)return;
  try{
    await fetch(SB_URL+"/rest/v1/cart_items?user_id=eq."+userId,{method:"DELETE",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY}});
    if(cart.length>0){
      const rows=cart.map(i=>({user_id:userId,session_id:getSessionId(),cat:i.cat,item_id:i.itemId,name:i.name,emoji:i.emoji,qty:i.qty,price:i.price,meta:i.meta||{}}));
      await fetch(SB_URL+"/rest/v1/cart_items",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(rows)});
    }
  }catch{}
}
async function loadCartFromDB(userId:string):Promise<CartItem[]>{
  try{
    const r=await fetch(SB_URL+"/rest/v1/cart_items?user_id=eq."+userId+"&order=created_at.asc",{headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY}});
    if(!r.ok)return[];
    const d=await r.json();
    return(d||[]).map((x:any)=>({id:x.id,cat:x.cat,itemId:x.item_id,name:x.name,emoji:x.emoji||"",qty:x.qty,price:Number(x.price),meta:x.meta||{}}));
  }catch{return[];}
}
let _cartMerged=false;
async function mergeCartOnLogin(localCart:CartItem[],userId:string,setCart:(c:CartItem[])=>void){
  if(_cartMerged)return;_cartMerged=true;
  try{
    const dbCart=await loadCartFromDB(userId);
    const merged=[...dbCart];
    for(const li of localCart){
      if(!merged.find(d=>d.itemId===li.itemId&&d.cat===li.cat))merged.push(li);
    }
    if(merged.length>50)merged.length=50;
    saveCart(merged);setCart(merged);
    syncCartToDB(merged,userId);
  }catch(e){console.error("merge err",e);}
}
const CAT_LABELS: Record<string,string> = {ticket:"Билеты",hotel:"Жильё",masterclass:"Мастер-классы",tour:"Экскурсии",event:"События",service:"Услуги",delivery:"Доставка",certificate:"Сертификаты",donation:"Благотворительность"};
const CAT_ORDER = ["ticket","hotel","tour","masterclass","event","service","delivery","certificate","donation"];
function loadCart():CartItem[]{try{const c=JSON.parse(localStorage.getItem(CART_KEY)||"[]");if(c.length>20){localStorage.removeItem(CART_KEY);return[];}return c;}catch{return[];}}
function saveCart(c:CartItem[]){localStorage.setItem(CART_KEY,JSON.stringify(c));}
function addToCart(cart:CartItem[],setCart:(c:CartItem[])=>void,item:Omit<CartItem,"id">){
  const c=[...cart];const ex=c.find(x=>x.itemId===item.itemId&&x.cat===item.cat);
  if(ex){ex.qty+=item.qty;}else{c.push({...item,id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)});}
  saveCart(c);setCart(c);return c;
}
function removeFromCart(cart:CartItem[],setCart:(c:CartItem[])=>void,id:string){const c=cart.filter(x=>x.id!==id);saveCart(c);setCart(c);}
function updateQty(cart:CartItem[],setCart:(c:CartItem[])=>void,id:string,qty:number){const c=cart.map(x=>x.id===id?{...x,qty:Math.max(0,qty)}:x).filter(x=>x.qty>0);saveCart(c);setCart(c);}
function cartTotal(cart:CartItem[]):number{return cart.reduce((s,i)=>s+i.price*i.qty,0);}
function cartCount(cart:CartItem[]):number{return cart.reduce((s,i)=>s+i.qty,0);}

function CartSheet({cart,setCart,onClose,onCheckout,userId,session,userProfile}:{cart:CartItem[],setCart:(c:CartItem[])=>void,onClose:()=>void,onCheckout:()=>void,userId?:string,session?:any,userProfile?:any}) {
  const grouped = CAT_ORDER.filter(c=>cart.some(i=>i.cat===c)).map(c=>({cat:c,label:CAT_LABELS[c]||c,items:cart.filter(i=>i.cat===c)}));
  const total = cartTotal(cart);
  const count = cartCount(cart);
  return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:260,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)"}}/>
      <div className="fu" onClick={(e:any)=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:390,maxHeight:"80vh",borderRadius:"28px 28px 0 0",background:"rgba(249,249,249,.94)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,.5)",boxShadow:"0 -10px 40px rgba(0,0,0,.15), inset 0 0.5px 0 rgba(255,255,255,.6)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Handle + Header */}
        <div style={{padding:"8px 0 0",textAlign:"center"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(60,60,67,.2)",margin:"0 auto"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px 8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px"}}>Корзина</div>{userId?<span style={{fontSize:10,fontWeight:600,color:"var(--blue)",fontFamily:FT,background:"rgba(0,122,255,.08)",padding:"3px 8px",borderRadius:8}}>{userProfile?.name&&userProfile.name!=="Путешественник"?userProfile.name:session?.user?.email?.split("@")[0]||"Паспорт"}</span>:<span style={{fontSize:10,fontWeight:600,color:"var(--label3)",fontFamily:FT,background:"var(--fill4)",padding:"3px 8px",borderRadius:8}}>Гость</span>}</div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            {count>0&&<div className="tap" onClick={()=>{saveCart([]);setCart([]);if(userId)syncCartToDB([],userId);}} style={{fontSize:13,color:"var(--red)",fontFamily:FT,fontWeight:600}}>Очистить</div>}
            <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"rgba(120,120,128,.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          </div>
        </div>
        {/* Cart Content */}
        <div style={{flex:1,overflowY:"auto",padding:"0 20px",WebkitOverflowScrolling:"touch"}}>
          {count===0?(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>🛒</div>
              <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Корзина пуста</div>
              <div style={{fontSize:14,color:"var(--label3)",fontFamily:FT,marginTop:4}}>Добавьте билеты, отели или услуги</div>
            </div>
          ):(
            grouped.map(g=>(
              <div key={g.cat} style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>{g.label}</div>
                <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
                  {g.items.map((item,idx)=>(
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderTop:idx>0?"0.5px solid var(--sep)":"none"}}>
                      <span style={{fontSize:24,flexShrink:0}}>{item.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                        {item.meta?.dates&&<div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>{item.meta.dates}</div>}
                        <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{(item.price*item.qty).toLocaleString("ru")} ₽</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <div className="tap" onClick={()=>updateQty(cart,setCart,item.id,item.qty-1)} style={{width:28,height:28,borderRadius:14,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:16,color:"var(--label2)",fontWeight:300}}>−</span>
                        </div>
                        <span style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,minWidth:20,textAlign:"center"}}>{item.qty}</span>
                        <div className="tap" onClick={()=>updateQty(cart,setCart,item.id,item.qty+1)} style={{width:28,height:28,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:16,color:"#fff",fontWeight:300}}>+</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Footer */}
        {count>0&&(
          <div style={{padding:"14px 20px 36px",borderTop:"0.5px solid var(--sep)",background:"rgba(249,249,249,.98)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Итого</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{total.toLocaleString("ru")} ₽</span>
            </div>
            {userId&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:13,color:"var(--label3)",fontFamily:FT}}>Начисление баллов</span>
              <span style={{fontSize:13,fontWeight:600,color:"#34C759",fontFamily:FT}}>+{Math.floor(total*0.05)} баллов</span>
            </div>}
            {!userId&&<div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginBottom:8,textAlign:"center"}}>Авторизуйтесь для начисления баллов</div>}
            <div className="tap" onClick={onCheckout} style={{height:50,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,122,255,.25)",marginBottom:4}}>
              <span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>Оформить заказ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutSheet({cart,setCart,onClose,onDone,userId,session,userProfile,onPassport}:{cart:CartItem[],setCart:(c:CartItem[])=>void,onClose:()=>void,onDone:(msg:string,orderId?:string)=>void,userId?:string,session?:any,userProfile?:any,onPassport?:()=>void}) {
  const [name,setName]=useState(userProfile?.name&&userProfile.name!=="Путешественник"?userProfile.name:"");const [phone,setPhone]=useState(userProfile?.phone||session?.user?.phone||"");const [payMethod,setPayMethod]=useState("request");
  const [sending,setSending]=useState(false);const [err,setErr]=useState("");const [hotelName,setHotelName]=useState("");const [roomNum,setRoomNum]=useState("");const hasDelivery=cart.some((c:any)=>c.category==="delivery"||c.category==="food");
  const total=cartTotal(cart);const count=cartCount(cart);
  // Hotel delivery fields shown if cart has delivery/food items
  const HOTELS=["Гималайский дом","Шри-Ланка","Беларусь","Украина","Индия","Дербент","Восточная Азия","Юго-Восточная Азия","Центральная Азия","Непал","Дао","Океан смыслов","Дома"];
  const PAY_OPTS=[{id:"request",label:"Заявка",desc:"Менеджер перезвонит",emoji:"📞"},{id:"cash",label:"Наличные",desc:"Оплата на месте",emoji:"💵"},{id:"card",label:"Картой",desc:"Онлайн-оплата",emoji:"💳"}];
  const submit=async()=>{
    if(!name.trim()||!phone.trim()){setErr("Заполните имя и телефон");return;}
    if(phone.replace(/\D/g,"").length<10){setErr("Проверьте номер телефона");return;}
    setSending(true);setErr("");
    try{
      const items=cart.map(i=>({cat:i.cat,name:i.name,qty:i.qty,price:i.price,meta:i.meta}));
      const r=await fetch(SB_URL+"/rest/v1/orders",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=representation"},
        body:JSON.stringify({type:"cart",items:JSON.stringify(items),subtotal:total,total,guest_name:name,guest_phone:phone.replace(/\D/g,""),status:"pending",payment_method:payMethod,user_id:userId||null,notes:(document.getElementById("order-comment") as HTMLInputElement)?.value||""})});
      await fetch(SB_URL+"/rest/v1/bookings",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},
        body:JSON.stringify({type:"cart_order",item_name:cart.length===1?(cart[0] as any).name||"Заказ":"Заказ "+count+" поз.",hotel_name:cart.find((c:any)=>c.type==="hotel")?.name||(cart[0] as any)?.name||"",guest_name:name,guest_phone:phone.replace(/\D/g,""),total_price:total})});fetch(SB_URL+"/rest/v1/rpc/create_receipt",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({p_items:cart.map((i:any)=>({item_type:i.cat||"service",item_name:i.name,unit_price:i.price||0,quantity:i.qty||1,country_visited:i.meta?.country||"",details:i.meta||{}})),p_guest_name:name,p_guest_phone:phone.replace(/\\D/g,""),p_payment_method:payMethod,p_user_id:userId||null,p_idempotency_key:"cart-"+Date.now()})}).catch(()=>{});
      saveCart([]);setCart([]);if(userId)syncCartToDB([],userId);
      r.json().then((d:any)=>{const oid=d&&d[0]&&d[0].order_code?d[0].order_code:"EM-"+Date.now().toString(36).toUpperCase();onDone(payMethod==="request"?"Менеджер свяжется с вами в течение 30 минут":payMethod==="cash"?"Покажите QR-код на кассе":"Оплата прошла успешно",oid);}).catch(()=>{onDone("Заказ оформлен","EM-ERR");});
    }catch{setErr("Ошибка. Позвоните +7 (495) 023-43-49");}
    setSending(false);
  };
  return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:265,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)"}}/>
      <div className="fu" onClick={(e:any)=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:390,maxHeight:"90vh",borderRadius:"28px 28px 0 0",background:"rgba(249,249,249,.94)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,.5)",boxShadow:"0 -10px 40px rgba(0,0,0,.15), inset 0 0.5px 0 rgba(255,255,255,.6)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"8px 0 0",textAlign:"center"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(60,60,67,.2)",margin:"0 auto"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px 4px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>Оформление</div>
          <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"rgba(120,120,128,.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 20px",WebkitOverflowScrolling:"touch"}}>
          {/* Order summary */}
          <div style={{padding:"14px 16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:14,color:"var(--label2)",fontFamily:FT}}>{count} позиций</span>
              <span style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{total.toLocaleString("ru")} ₽</span>
            </div>
          </div>
          {/* Contacts */}
          <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Контакты</div>
          <input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Ваше имя" className="ios-input" style={{marginBottom:8}}/>
          <input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+7 900 123-45-67" type="tel" className="ios-input" style={{marginBottom:16}}/>
          {/* Auth prompt for guests */}
          {!userId&&onPassport&&(
            <div className="tap" onClick={()=>{onClose();setTimeout(()=>onPassport&&onPassport(),300);}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:16,background:"rgba(0,122,255,.05)",border:"0.5px solid rgba(0,122,255,.15)",marginBottom:16}}>
              <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#7B1818,#C0392B)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#fff" strokeWidth="1.5"/><line x1="7" y1="10" x2="17" y2="10" stroke="#fff" strokeWidth="1"/><line x1="7" y1="14" x2="13" y2="14" stroke="#fff" strokeWidth="1"/></svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>Получить паспорт Этномира</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>Копите баллы и получайте скидки</div>
              </div>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
          {/* Payment method */}
          <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>Способ оплаты</div>
          {PAY_OPTS.map(p=>(
            <div key={p.id} className="tap" onClick={()=>setPayMethod(p.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:14,background:payMethod===p.id?"rgba(0,122,255,.06)":"var(--bg2)",border:payMethod===p.id?"1.5px solid var(--blue)":"0.5px solid var(--sep-opaque)",marginBottom:8,transition:"all .2s"}}>
              <span style={{fontSize:22}}>{p.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{p.label}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>{p.desc}</div>
              </div>
              <div style={{width:22,height:22,borderRadius:11,border:payMethod===p.id?"6px solid var(--blue)":"2px solid var(--sep-opaque)",transition:"all .2s"}}/>
            </div>
          ))}
          <div style={{marginTop:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Комментарий</div>
            <input id="order-comment" placeholder="Дата визита, пожелания..." className="ios-input" style={{marginBottom:0}}/>
          </div>
          {/* Promo code */}
          <div style={{marginTop:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Промокод</div>
            <div style={{display:"flex",gap:8}}>
              <input id="promo-input" placeholder="Введите промокод" className="ios-input" style={{flex:1,marginBottom:0}}/>
              <div className="tap" onClick={()=>{const inp=document.getElementById("promo-input") as HTMLInputElement;if(inp&&inp.value.trim()){setErr("Промокод не найден");}}} style={{padding:"0 16px",borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>Применить</span>
              </div>
            </div>
          </div>
          {err&&<div style={{fontSize:13,color:"var(--red)",fontFamily:FT,textAlign:"center",marginTop:8}}>{err}</div>}
        </div>
        <div style={{padding:"12px 20px 28px",borderTop:"0.5px solid var(--sep)"}}>
          <div className="tap" onClick={submit} style={{height:50,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",opacity:sending?.5:1}}>
            <span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>{sending?"Отправка...":"Подтвердить заказ"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderView({code,onBack}:{code:string,onBack:()=>void}) {
  const [order,setOrder] = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [parkInfo,setParkInfo] = useState<any>(null);
  useEffect(()=>{
    sb("receipts","select=*,receipt_items(*)&receipt_code=eq."+code).then(d=>{if(d&&d[0]){const r=d[0];const items=r.receipt_items||[];const mapped={...r,order_code:r.receipt_code,items:items.map((it:any)=>({name:it.item_name,cat:it.item_type,price:it.unit_price,qty:it.quantity,meta:it.details})),type:r.category==="housing"?"hotel":r.category==="tickets"?"ticket":r.category};setOrder(mapped);setLoading(false);}else{sb("orders","select=*&order_code=eq."+code).then(d2=>{if(d2&&d2[0])setOrder(d2[0]);setLoading(false);}).catch(()=>setLoading(false));}}).catch(()=>setLoading(false));
    sb("park_info","select=key,value_ru&key=in.(legal_name,address,phone,email,inn,ogrn,kpp)").then(d=>{if(d){const m:any={};d.forEach((r:any)=>{m[r.key]=r.value_ru;});setParkInfo(m);}});
  },[code]);
  
  const statusMap:Record<string,{l:string,c:string}>={pending:{l:"Ожидает оплаты",c:"#FF9F0A"},confirmed:{l:"Подтверждён",c:"#34C759"},paid:{l:"Оплачен",c:"#34C759"},completed:{l:"Завершён",c:"#007AFF"},cancelled:{l:"Отменён",c:"#FF3B30"}};
  const payMap:Record<string,string>={request:"Заявка (менеджер перезвонит)",cash:"Наличные на месте",card:"Банковская карта",card_new:"Банковская карта"};
  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F2F2F7"}}><Spinner/></div>;
  if(!order) return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#F2F2F7",padding:40,fontFamily:FT}}><div style={{fontSize:64,marginBottom:20}}>🔍</div><div style={{fontSize:22,fontWeight:700,color:"#000",fontFamily:FD,marginBottom:8}}>Заказ не найден</div><div style={{fontSize:15,color:"rgba(60,60,67,.6)",textAlign:"center",marginBottom:24,lineHeight:1.5}}>Код <b>{code}</b> не найден в системе.<br/>Проверьте правильность ссылки.</div><div className="tap" onClick={onBack} style={{height:50,padding:"0 32px",borderRadius:14,background:"#007AFF",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:17,fontWeight:600,color:"#fff"}}>На главную</span></div></div>);
  const s=statusMap[order.status]||{l:order.status,c:"#8E8E93"};
  const items=order.items?(typeof order.items==="string"?JSON.parse(order.items):order.items):[];
  const dt=new Date(order.created_at);
  const fmtDate=dt.toLocaleDateString("ru",{day:"numeric",month:"long",year:"numeric"});
  const fmtTime=dt.toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
  return(
    <div style={{minHeight:"100vh",background:"#F2F2F7",fontFamily:FT,overflowX:"hidden",maxWidth:"100vw"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)",padding:"28px 24px 24px",textAlign:"center",position:"relative"}}>
        <div className="tap no-print" onClick={onBack} style={{position:"absolute",top:16,left:16,width:36,height:36,borderRadius:18,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M10 1L4 7l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></div>
        <div style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.5)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Этномир</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:16}}>Электронный билет</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:50,background:s.c+"25",border:"1px solid "+s.c+"40"}}><div style={{width:8,height:8,borderRadius:4,background:s.c}}/><span style={{fontSize:14,fontWeight:600,color:s.c}}>{s.l}</span></div>
      </div>
      {/* Receipt body */}
      <div style={{margin:"-16px 16px 0",position:"relative",zIndex:1}}>
        {/* Order number card */}
        <div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",padding:"24px",marginBottom:12,textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(60,60,67,.4)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>Номер чека</div>
          <div style={{fontSize:28,fontWeight:800,color:"#000",fontFamily:FD,letterSpacing:"1px"}}>{order.order_code}</div>
          <div style={{fontSize:13,color:"rgba(60,60,67,.6)",marginTop:6}}>{fmtDate} в {fmtTime}</div>
        </div>
        {/* QR for cashier */}
        <div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",padding:"24px",marginBottom:12,textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:"rgba(60,60,67,.4)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12}}>QR-код для кассы</div>
          <div style={{display:"inline-block",padding:12,background:"#fff",borderRadius:16,border:"2px solid #F2F2F7"}}><img src={"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data="+encodeURIComponent("https://ethnomir.app/#order/"+order.order_code)} width={180} height={180} alt="QR" style={{display:"block"}}/></div>
          <div style={{fontSize:12,color:"rgba(60,60,67,.4)",marginTop:10}}>Покажите сотруднику парка</div>
        </div>
        {/* Items */}
        <div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"16px 20px 12px"}}><div style={{fontSize:12,fontWeight:700,color:"rgba(60,60,67,.4)",letterSpacing:"1.5px",textTransform:"uppercase"}}>{order.type==="hotel"||order.category==="housing"?"🏨 Проживание":order.type==="ticket"||order.category==="tickets"?"🎟 Входной билет":order.type==="tour"?"🧭 Экскурсия":order.type==="masterclass"?"🎨 Мастер-класс":order.type==="food"||order.type==="delivery"?"🍽 Заказ еды":"🧾 Услуги"}</div></div>
          {items.map((it:any,i:number)=>{const price=(it.price||0)*(it.qty||1)||0;const showPrice=it.price&&it.price>0;return(<div key={i} style={{padding:"10px 20px",borderTop:"0.5px solid rgba(60,60,67,.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:500,color:"#000"}}>{it.name||it.item_name||"Позиция "+(i+1)}</div>{(it.qty||1)>1&&<div style={{fontSize:12,color:"rgba(60,60,67,.4)",marginTop:1}}>{it.qty} x {(it.price||0).toLocaleString("ru")} ₽</div>}</div><div style={{fontSize:15,fontWeight:600,color:"#000",fontFamily:FD,flexShrink:0,marginLeft:12}}>{showPrice?price.toLocaleString("ru")+" ₽":""}</div></div>);})}
          <div style={{padding:"14px 20px",background:"#F8F8FA",display:"flex",justifyContent:"space-between",borderTop:"0.5px solid rgba(60,60,67,.08)"}}><span style={{fontSize:17,fontWeight:700,color:"#000",fontFamily:FD}}>Итого</span><span style={{fontSize:17,fontWeight:700,color:"#000",fontFamily:FD}}>{(order.total||0).toLocaleString("ru")} ₽</span></div>
        </div>
        {/* === TYPE-SPECIFIC DETAILS (boarding pass style) === */}
        {(()=>{
          const m=items[0]?.meta||{};
          const R=({k,v}:{k:string,v:any})=>v?<div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"0.5px solid rgba(60,60,67,.06)"}}><span style={{fontSize:14,color:"rgba(60,60,67,.6)"}}>{k}</span><span style={{fontSize:14,fontWeight:500,color:"#000",textAlign:"right"}}>{v}</span></div>:null;
          if(order.type==="hotel"||order.category==="housing"){
            const fd=(d:string)=>{try{return new Date(d).toLocaleDateString("ru",{weekday:"short",day:"numeric",month:"long",year:"numeric"})}catch{return d}};
            return(<>
              {/* Perforation */}
              <div style={{position:"relative",marginBottom:12}}><div style={{borderTop:"2px dashed rgba(60,60,67,.12)",margin:"0 -16px"}}/><div style={{position:"absolute",left:-24,top:-8,width:16,height:16,borderRadius:8,background:"#F2F2F7"}}/><div style={{position:"absolute",right:-24,top:-8,width:16,height:16,borderRadius:8,background:"#F2F2F7"}}/></div>
              <div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",padding:"16px 20px",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:"rgba(60,60,67,.4)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12}}>🏨 Проживание</div>
                <R k="Заезд" v={m.date_from?fd(m.date_from)+(m.check_in?" в "+m.check_in:""):null}/>
                <R k="Выезд" v={m.date_to?fd(m.date_to)+(m.check_out?" в "+m.check_out:""):null}/>
                <R k="Ночей" v={m.nights}/>
                <R k="Взрослые" v={m.guests}/>
                {m.children>0&&<R k="Дети" v={m.children}/>}
                <R k="Тип номера" v={m.room_type}/>
                <R k="Питание" v={m.meal_plan}/>
              </div>
            </>);
          }
          if(order.type==="ticket"||order.category==="tickets"){
            return(<div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",padding:"16px 20px",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"rgba(60,60,67,.4)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12}}>🎟 Билет</div>
              {m.visit_date&&<R k="Дата" v={m.visit_date}/>}
              {m.ticket_type&&<R k="Тип" v={m.ticket_type}/>}
              {m.age_category&&<R k="Категория" v={m.age_category}/>}
            </div>);
          }
          if(order.type==="tour"||order.type==="masterclass"){
            return(<div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",padding:"16px 20px",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"rgba(60,60,67,.4)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12}}>{order.type==="tour"?"🧭 Тур":"🎨 Мастер-класс"}</div>
              {m.tour_date&&<R k="Дата" v={m.tour_date}/>}
              {m.start_time&&<R k="Начало" v={m.start_time}/>}
              {m.duration_min&&<R k="Продолж." v={m.duration_min+" мин"}/>}
              {m.master_name&&<R k="Мастер" v={m.master_name}/>}
            </div>);
          }
          return null;
        })()}
        {/* Passport impact */}
        {(order.points_earned>0||(order.countries_unlocked&&order.countries_unlocked.length>0))&&(
          <div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",padding:"16px 20px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(60,60,67,.4)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12}}>🏆 Паспорт путешественника</div>
            {order.points_earned>0&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}><div style={{width:36,height:36,borderRadius:10,background:"rgba(52,199,89,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎯</div><div><div style={{fontSize:14,fontWeight:500,color:"#000"}}>+{order.points_earned} баллов</div><div style={{fontSize:12,color:"#34C759"}}>Начислено на счёт</div></div></div>}
            {order.countries_unlocked&&order.countries_unlocked.filter((c:string)=>c).map((c:string,i:number)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}><div style={{width:36,height:36,borderRadius:10,background:"rgba(0,122,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌍</div><div><div style={{fontSize:14,fontWeight:500,color:"#000"}}>Новая страна</div><div style={{fontSize:12,color:"#007AFF"}}>«{c}» добавлена</div></div></div>))}
          </div>
        )}
        {/* Payment & contacts */}
        <div style={{borderRadius:20,background:"#fff",boxShadow:"0 1px 8px rgba(0,0,0,.05)",padding:"16px 20px",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"rgba(60,60,67,.35)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10}}>Детали оплаты</div>
          {[
            {k:"Способ оплаты",v:payMap[order.payment_method]||order.payment_method||"—"},
            order.guest_name?{k:"Клиент",v:order.guest_name}:null,
            order.guest_phone?{k:"Телефон",v:order.guest_phone?"+7 "+order.guest_phone.replace(/\D/g,"").slice(-10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/,"+7 $1-$2-$3-$4").slice(3):null}:null,
            order.notes?{k:"Комментарий",v:order.notes}:null,
            {k:"Тип",v:order.type==="cart"?"Корзина":order.type==="food"?"Доставка еды":order.type==="service"||order.type==="services"?"Услуга":order.type==="hotel"||order.category==="housing"?"Проживание":order.type==="ticket"||order.category==="tickets"?"Входной билет":order.type==="tour"?"Экскурсия":order.type==="masterclass"?"Мастер-класс":order.type==="delivery"?"Доставка":"Заказ"}
          ].filter(Boolean).map((row:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?"0.5px solid rgba(60,60,67,.06)":"none"}}><span style={{fontSize:14,color:"rgba(60,60,67,.6)"}}>{row.k}</span><span style={{fontSize:14,fontWeight:500,color:"#000",textAlign:"right",maxWidth:"60%"}}>{row.v}</span></div>))}
        </div>
        
                {/* Legal footer */}
        <div style={{padding:"10px 4px 16px",textAlign:"center"}}>
          <div style={{fontSize:11,color:"rgba(60,60,67,.3)",lineHeight:1.6}}>
            {parkInfo?.legal_name||"ООО «ЭТНОМИР»"}<br/>
            {parkInfo?.address||"Калужская обл., Боровский р-н, д. Петрово"}<br/>
            {parkInfo?.inn?"ИНН "+parkInfo.inn:""}{parkInfo?.kpp?" / КПП "+parkInfo.kpp:""}{parkInfo?.ogrn?" / ОГРН "+parkInfo.ogrn:""}<br/>
            {parkInfo?.phone||"+7 (495) 023-43-49"} | {parkInfo?.email||"info@ethnomir.ru"}
          </div>
          <div style={{fontSize:10,color:"rgba(60,60,67,.2)",marginTop:8}}>Документ сформирован автоматически в системе ethnomir.app</div>
        </div>
        <style>{`@page{margin:0;}@media print{.no-print{display:none!important;}}`}</style>
        {/* ═══ ACTION BUTTONS ═══ */}
        <div className="no-print" style={{padding:"0 20px 40px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",gap:10}}>
            <div className="tap" onClick={()=>{if(navigator.share){navigator.share({title:"Чек "+order.order_code,text:"Электронный билет на "+(order.total||0).toLocaleString("ru")+" ₽",url:"https://ethnomir.app/#order/"+order.order_code}).catch(()=>{});}else{navigator.clipboard.writeText("https://ethnomir.app/#order/"+order.order_code);alert("Ссылка скопирована!");}}} style={{flex:1,height:50,borderRadius:14,background:"rgba(0,122,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:15,fontWeight:600,color:"#007AFF",fontFamily:FT}}>Отправить</span></div>
            <div className="tap" onClick={()=>{const c=document.querySelector(".print-only-receipt");if(!c)return;const h=c.innerHTML;const w=window.open("","print_receipt","width=450,height=800");if(!w){alert("Разрешите всплывающие окна");return;}w.document.write("<html><head><meta charset=utf-8><meta name=viewport content=\"width=device-width\"><title>"+order.order_code+"</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#F2F2F7;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;max-width:390px;margin:0 auto;overflow-x:hidden;}.no-print{display:none!important;}@page{margin:5mm;}</style></head><body>"+h+"</body></html>");w.document.close();w.onload=()=>{setTimeout(()=>{w.focus();w.print();},400);};}} style={{flex:1,height:50,borderRadius:14,background:"rgba(52,199,89,.08)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="#34C759" strokeWidth="2" strokeLinecap="round"/><path d="M17 21v-8H7v8M7 3v5h8" stroke="#34C759" strokeWidth="2" strokeLinecap="round"/></svg><span style={{fontSize:15,fontWeight:600,color:"#34C759",fontFamily:FT}}>Сохранить</span></div>
          </div>
          <div className="tap no-print" onClick={onBack} style={{height:50,borderRadius:14,background:"#007AFF",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>Закрыть</span></div>
        </div>
      </div>
    </div>
  );
}


function App() { if(typeof window!=="undefined"&&!(window as any).__ev){(window as any).__ev=APP_V;console.log("EthnoMir v"+APP_V);}
  useEffect(()=>{
    if(typeof document!=='undefined'){
      const m=document.createElement('meta');m.name='theme-color';m.content='#000000';document.head.appendChild(m);
      const m2=document.createElement('meta');m2.name='mobile-web-app-capable';m2.content='yes';document.head.appendChild(m2);const m2b=document.createElement('meta');m2b.name='apple-mobile-web-app-capable';m2b.content='yes';document.head.appendChild(m2b);
      const m3=document.createElement('meta');m3.name='apple-mobile-web-app-status-bar-style';m3.content='black-translucent';document.head.appendChild(m3);
      const m4=document.createElement('meta');m4.name='viewport';m4.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';document.head.appendChild(m4);
      document.addEventListener('touchstart',function(){},true);
      // Service Worker
      // SW ready when sw.js deployed
      // Apple launch screen
      const lnk=document.createElement('link');lnk.rel='apple-touch-icon';lnk.href='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 180 180%22%3E%3Crect width=%22180%22 height=%22180%22 rx=%2240%22 fill=%22%231B3A2A%22/%3E%3Ctext x=%2290%22 y=%22108%22 font-size=%2244%22 fill=%22white%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-weight=%22800%22%3E\u042d\u041c%3C/text%3E%3C/svg%3E';document.head.appendChild(lnk);
      const ti=document.createElement('meta');ti.name='apple-mobile-web-app-title';ti.content='\u042d\u0442\u043d\u043e\u043c\u0438\u0440';document.head.appendChild(ti);const m5=document.createElement('link');m5.rel='manifest';m5.href='data:application/json,'+encodeURIComponent(JSON.stringify({name:"Этномир — Суперприложение",short_name:"Этномир",description:"Крупнейший этнографический парк России. Бронирование отелей, билеты, мастер-классы, рестораны, бани и СПА.",start_url:"/?source=pwa",scope:"/",id:"/",display:"standalone",display_override:["standalone","minimal-ui"],orientation:"portrait",background_color:"#000000",theme_color:"#1B3A2A",dir:"ltr",lang:"ru",categories:["travel","entertainment","lifestyle","food"],prefer_related_applications:false,launch_handler:{client_mode:"navigate-existing"},icons:[{src:"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 512 512%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%25%27 y1=%270%25%27 x2=%27100%25%27 y2=%27100%25%27%3E%3Cstop offset=%270%25%27 style=%27stop-color:%231B3A2A%27/%3E%3Cstop offset=%27100%25%27 style=%27stop-color:%230D1F15%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27512%27 height=%27512%27 rx=%27108%27 fill=%27url(%23g)%27/%3E%3Ccircle cx=%27256%27 cy=%27210%27 r=%2785%27 fill=%27none%27 stroke=%27%2334C759%27 stroke-width=%278%27 opacity=%27.7%27/%3E%3Cpath d=%27M216 310 h80 v60 a40 40 0 01-80 0z%27 fill=%27%2334C759%27 opacity=%27.6%27/%3E%3Ctext x=%27256%27 y=%27240%27 font-size=%2780%27 fill=%27white%27 text-anchor=%27middle%27 font-family=%27-apple-system,system-ui,sans-serif%27 font-weight=%27800%27%3E%D0%AD%D0%9C%3C/text%3E%3Ctext x=%27256%27 y=%27440%27 font-size=%2736%27 fill=%27rgba(255,255,255,.5)%27 text-anchor=%27middle%27 font-family=%27-apple-system,system-ui,sans-serif%27 font-weight=%27600%27 letter-spacing=%272%27%3EETHNOMIR%3C/text%3E%3C/svg%3E",sizes:"512x512",type:"image/svg+xml",purpose:"any maskable"},{src:"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 192 192%27%3E%3Crect width=%27192%27 height=%27192%27 rx=%2742%27 fill=%27%231B3A2A%27/%3E%3Ctext x=%2796%27 y=%27115%27 font-size=%2748%27 fill=%27white%27 text-anchor=%27middle%27 font-family=%27system-ui%27 font-weight=%27800%27%3E%D0%AD%D0%9C%3C/text%3E%3C/svg%3E",sizes:"192x192",type:"image/svg+xml",purpose:"any"}],screenshots:[{src:"https://ethnomir.ru/upload/iblock/0e8/6.jpg",sizes:"390x844",type:"image/jpeg",form_factor:"narrow",label:"СПА-отель Шри-Ланка"},{src:"https://ethnomir.ru/upload/iblock/e0c/1.jpg",sizes:"390x844",type:"image/jpeg",form_factor:"narrow",label:"Этноотель Индия"}],shortcuts:[{name:"Купить билет",short_name:"Билеты",url:"/?tab=tours",icons:[{src:"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 96 96%27%3E%3Crect width=%2796%27 height=%2796%27 rx=%2720%27 fill=%27%23007AFF%27/%3E%3Ctext x=%2748%27 y=%2762%27 font-size=%2740%27 text-anchor=%27middle%27%3E%F0%9F%8E%9F%3C/text%3E%3C/svg%3E",sizes:"96x96"}]},{name:"Отели",short_name:"Жильё",url:"/?tab=stay",icons:[{src:"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 96 96%27%3E%3Crect width=%2796%27 height=%2796%27 rx=%2720%27 fill=%27%2334C759%27/%3E%3Ctext x=%2748%27 y=%2762%27 font-size=%2740%27 text-anchor=%27middle%27%3E%F0%9F%8F%A8%3C/text%3E%3C/svg%3E",sizes:"96x96"}]},{name:"Рестораны",short_name:"Еда",url:"/?tab=services&sec=food",icons:[{src:"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 96 96%27%3E%3Crect width=%2796%27 height=%2796%27 rx=%2720%27 fill=%27%23FF9500%27/%3E%3Ctext x=%2748%27 y=%2762%27 font-size=%2740%27 text-anchor=%27middle%27%3E%F0%9F%8D%BD%3C/text%3E%3C/svg%3E",sizes:"96x96"}]}]}));document.head.appendChild(m5);
    }
  },[]);
  const [tab, setTab] = useState<Tab>('home');
  const [pendingSec, setPendingSec] = useState("");
  const [showTickets, setShowTickets] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
  const [orderCode, setOrderCode] = useState<string|null>(null);
  useEffect(()=>{const h=window.location.hash;if(h.startsWith("#order/")){setOrderCode(h.replace("#order/",""));}const onHash=()=>{const h2=window.location.hash;if(h2.startsWith("#order/")){setOrderCode(h2.replace("#order/",""));}else{setOrderCode(null);}};window.addEventListener("hashchange",onHash);return()=>window.removeEventListener("hashchange",onHash);},[]);
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
  
  const [cart, setCart] = useState<CartItem[]>(loadCart());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  useEffect(()=>{if(session?.user?.id){sb("profiles","select=name,phone,email&id=eq."+session.user.id).then(d=>{if(d&&d[0])setUserProfile(d[0]);});sb("favorites","select=item_id&user_id=eq."+session.user.id).then(d=>{if(Array.isArray(d))setFavorites(new Set(d.map((f:any)=>f.item_id)));});}},[session?.user?.id]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCertSheet, setShowCertSheet] = useState(false);
  const [cartToast, setCartToast] = useState("");
  const [orderConfirm, setOrderConfirm] = useState<{msg:string,orderId:string}|null>(null);
  const showCartToast = (msg:string)=>{setCartToast(msg);setTimeout(()=>setCartToast(""),2000);if(navigator.vibrate)navigator.vibrate(15);};
  const [certNominal, setCertNominal] = useState(3000);
  const [showPassport, setShowPassport] = useState(false);
  const [showFranchise, setShowFranchise] = useState(false);
  const [showPromo,setShowPromo]=useState(false);
  const [promoCode,setPromoCode]=useState("");
  const [promoResult,setPromoResult]=useState<any>(null);
  const [showChat,setShowChat]=useState(false);
  const [chatMessages,setChatMessages]=useState<any[]>([]);
  const [chatInput,setChatInput]=useState("");
  const [chatSessionId]=useState(()=>{
    try{const s=localStorage.getItem("em_chat_sid");if(s)return s;const n=Math.random().toString(36).slice(2);localStorage.setItem("em_chat_sid",n);return n;}catch{return Math.random().toString(36).slice(2);}
  });
  const _chatPollRef=React.useRef<any>(null);
  const _lastMsgTime=React.useRef<string>("2020-01-01T00:00:00Z");
  const [showParkMap,setShowParkMap]=useState(false);const [showCalendar,setShowCalendar]=useState(false);
  const [mapPois,setMapPois]=useState<any[]>([]);
  const [mapFilter,setMapFilter]=useState("all");const [selectedPoi,setSelectedPoi]=useState<any>(null);
  const [showNotifs,setShowNotifs]=useState(false);
  const [notifs,setNotifs]=useState<any[]>([]);
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
            <div className="tap" onClick={()=>setShowSearch(true)} style={{width:44,height:44,borderRadius:22,background:"rgba(255,255,255,0.22)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 2px 12px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="7" stroke="#3C3C43" strokeWidth="2"/><path d="M16 16l5.5 5.5" stroke="#3C3C43" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="tap" onClick={()=>setShowPassport(true)} style={{width:44,height:44,borderRadius:22,background:"rgba(255,255,255,0.22)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 2px 12px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="#3C3C43" strokeWidth="1.8"/><path d="M4.5 21c0-3.3 3.4-6 7.5-6s7.5 2.7 7.5 6" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
          </div>
          {tab==='home'     && <HomeTab onBuyTicket={()=>setShowTickets(true)} onSearch={()=>setShowSearch(true)} onMap={()=>setShowMap(true)} onQR={()=>setShowQR(true)} onProfile={()=>setShowPassport(true)} cart={cart} setCart={setCart} userId={session?.user?.id} showCartToast={showCartToast} onFranchise={()=>setShowFranchise(true)} onLanding={(s:string)=>setLandingSlug(s)} onNav={(t:any,s:any)=>{setPendingSec(s||"");setTab(t);}}/>}
          {tab==='tours'    && <ToursTab onSearch={()=>setShowSearch(true)} onBuyTicket={()=>setShowTickets(true)} onCalendar={()=>setShowCalendar(true)} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")} favorites={favorites} toggleFav={toggleFav} cart={cart} setCart={setCart} userId={session?.user?.id} showCartToast={showCartToast}/>}
          {tab==='stay'     && <StayTab onSearch={()=>setShowSearch(true)} favorites={favorites} toggleFav={toggleFav} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")} cart={cart} setCart={setCart} userId={session?.user?.id} showCartToast={showCartToast}/>}
          {tab==='services' && <ServicesTab onSearch={()=>setShowSearch(true)} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")} cart={cart} setCart={setCart} userId={session?.user?.id} showCartToast={showCartToast}/>}
          {tab==='passport' && <EthnoMirTab session={session} userProfile={userProfile} onFranchise={()=>setShowFranchise(true)} onLanding={(s:string)=>setLandingSlug(s)} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")}/>}
        </div>
        {/* ═══ ORDER PAGE ═══ */}
        {orderCode&&<div className="print-only-receipt" style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:9999,background:"#F2F2F7",overflow:"auto"}}><OrderView code={orderCode} onBack={()=>{setOrderCode(null);window.history.replaceState(null,"",window.location.pathname);}}/></div>}
        {/* ═══ CERT SHEET ═══ */}
        {showCertSheet&&(
          <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:270,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowCertSheet(false)}>
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)"}}/>
            <div className="fu" onClick={(e:any)=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:390,borderRadius:"28px 28px 0 0",background:"rgba(249,249,249,.94)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,.5)",boxShadow:"0 -10px 40px rgba(0,0,0,.15)",padding:"0 0 32px",overflow:"hidden"}}>
              <div style={{padding:"8px 0 0",textAlign:"center"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(60,60,67,.2)",margin:"0 auto"}}/></div>
              <div style={{padding:"12px 20px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>Подарочный сертификат</div>
                  <div className="tap" onClick={()=>setShowCertSheet(false)} style={{width:30,height:30,borderRadius:15,background:"rgba(120,120,128,.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
                </div>
                <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4}}>Подарите незабываемый отдых в Этномире</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px 16px"}}>
                {[1000,3000,5000,10000].map(n=>(
                  <div key={n} className="tap" onClick={()=>setCertNominal(n)} style={{padding:"16px",borderRadius:16,background:certNominal===n?"rgba(0,122,255,.06)":"var(--bg2)",border:certNominal===n?"1.5px solid var(--blue)":"0.5px solid var(--sep-opaque)",textAlign:"center",transition:"all .2s"}}>
                    <div style={{fontSize:24,marginBottom:4}}>🎁</div>
                    <div style={{fontSize:20,fontWeight:700,color:certNominal===n?"var(--blue)":"var(--label)",fontFamily:FD}}>{n.toLocaleString("ru")} ₽</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"0 20px"}}>
                <div className="tap" onClick={()=>{addToCart(cart,setCart,{cat:"certificate",itemId:"cert_"+certNominal,name:"Сертификат "+certNominal.toLocaleString("ru")+" ₽",emoji:"🎁",qty:1,price:certNominal});syncCartToDB(cart,session?.user?.id);setShowCertSheet(false);}} style={{height:50,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,122,255,.25)"}}>
                  <span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>В корзину · {certNominal.toLocaleString("ru")} ₽</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ═══ ORDER CONFIRMATION ═══ */}
        {orderConfirm&&(
          <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:280,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setOrderConfirm(null)}>
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}}/>
            <div className="fu" onClick={(e:any)=>e.stopPropagation()} style={{position:"relative",width:"calc(100% - 40px)",maxWidth:340,borderRadius:32,background:"rgba(249,249,249,.97)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",padding:"32px 24px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.2)",maxHeight:"85vh",overflow:"auto"}}>
              <div style={{width:52,height:52,borderRadius:26,background:"linear-gradient(135deg,#34C759,#30D158)",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:8}}>Заказ оформлен!</div>
              <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginBottom:16,lineHeight:1.5}}>{orderConfirm.msg}</div>
              <div style={{padding:"16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",marginBottom:16}}>
                <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginBottom:6}}>НОМЕР ЗАКАЗА</div>
                <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"2px"}}>{orderConfirm.orderId}</div>
                <div style={{marginTop:12,padding:12,background:"#fff",borderRadius:12,display:"inline-block"}}>
                  <img src={"https://api.qrserver.com/v1/create-qr-code/?size=120x120&data="+encodeURIComponent("https://ethnomir.app/#order/"+orderConfirm.orderId)} width={120} height={120} alt="QR" style={{display:"block"}}/>
                </div>
                <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:8}}>Покажите на кассе</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div className="tap" onClick={()=>{window.location.hash="order/"+orderConfirm.orderId;setOrderConfirm(null);}} style={{flex:1,height:44,borderRadius:12,background:"rgba(0,122,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{fontSize:14,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>Открыть чек</span>
                </div>
                <div className="tap" onClick={()=>{if(navigator.share){navigator.share({title:"Чек Этномир",text:"Электронный билет #"+orderConfirm.orderId,url:"https://ethnomir.app/#order/"+orderConfirm.orderId}).catch(()=>{});}else{navigator.clipboard.writeText("https://ethnomir.app/#order/"+orderConfirm.orderId);}}} style={{flex:1,height:44,borderRadius:12,background:"rgba(52,199,89,.08)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{fontSize:14,fontWeight:600,color:"#34C759",fontFamily:FT}}>Отправить</span>
                </div>
              </div>
              <div className="tap" onClick={()=>setOrderConfirm(null)} style={{height:50,borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:17,fontWeight:600,color:"#fff",fontFamily:FT}}>Готово</span>
              </div>
            </div>
          </div>
        )}
        {/* ═══ CART TOAST ═══ */}
        {cartToast&&(
          <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:300,maxWidth:340,padding:"12px 20px",borderRadius:16,background:"rgba(52,199,89,.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 4px 20px rgba(52,199,89,.3)",display:"flex",alignItems:"center",gap:10,animation:"fu .3s cubic-bezier(0.2,0.8,0.2,1)"}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="rgba(255,255,255,.2)"/><path d="M6 10l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FT}}>{cartToast}</span>
          </div>
        )}
        {/* ═══ CART ═══ */}
        {cartCount(cart)>0&&!showCart&&!showCheckout&&(
          <div className="tap" onClick={()=>setShowCart(true)} style={{position:"fixed",bottom:100,zIndex:180,display:"flex",alignItems:"center",gap:8,padding:"12px 20px",borderRadius:50,background:"var(--blue)",boxShadow:"0 6px 24px rgba(0,122,255,.35), inset 0 1px 0 rgba(255,255,255,.2)",left:"50%",transform:"translateX(-50%)",maxWidth:340}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:FT}}>{cartCount(cart)}</span>
            <span style={{fontSize:13,color:"rgba(255,255,255,.7)",fontFamily:FT}}>{cartTotal(cart).toLocaleString("ru")} ₽</span>
          </div>
        )}
        {showCart&&<CartSheet cart={cart} setCart={setCart} onClose={()=>setShowCart(false)} onCheckout={()=>{setShowCart(false);setShowCheckout(true);}} userId={session?.user?.id} session={session} userProfile={userProfile}/>}
        {showCheckout&&<CheckoutSheet cart={cart} setCart={setCart} onClose={()=>setShowCheckout(false)} onDone={(msg:string,orderId?:string)=>{setShowCheckout(false);setOrderConfirm({msg,orderId:orderId||Date.now().toString(36).toUpperCase()});}} userId={session?.user?.id} session={session} userProfile={userProfile} onPassport={()=>setShowPassport(true)}/>}
        {showTickets && <TicketScreen onClose={()=>setShowTickets(false)} cart={cart} setCart={setCart} userId={session?.user?.id} showCartToast={showCartToast}/>}
        {toast && <SuccessToast msg={toast} onClose={()=>setToast("")}/>}
        {showWelcome && <WelcomeScreen onDone={()=>{setShowWelcome(false);localStorage.setItem('em_welcomed','1');}}/>}
        {countryDetail && <CountryDetail country={countryDetail} onClose={()=>setCountryDetail(null)}/>}
        {showQR && <QRModal onClose={()=>{setShowQR(false);}} session={session}/>}
        {showMap && <MapModal onClose={()=>setShowMap(false)}/>}
        {showFranchise && <FranchiseLandingV2 onClose={()=>setShowFranchise(false)} session={session}/>}
        {landingSlug && (landingSlug==='reviews'?<ReviewsLanding onClose={()=>setLandingSlug(null)}/>:landingSlug==='franchise'?<FranchiseLandingV2 onClose={()=>setLandingSlug(null)}/>:landingSlug==='arenda'?<ArendaLandingV2 onClose={()=>setLandingSlug(null)} session={session}/>:landingSlug==='business'?<BusinessLandingV2 onClose={()=>setLandingSlug(null)} session={session}/>:landingSlug==='build'?<BuildLandingV2 onClose={()=>setLandingSlug(null)} session={session}/>:landingSlug==='directions'?<DirectionsLandingV2 onClose={()=>setLandingSlug(null)}/>:landingSlug==='faq'?<FAQLandingV2 onClose={()=>setLandingSlug(null)} go={(t:string)=>{setLandingSlug(null);if(t==='action:tickets')setShowTickets(true);else if(t.startsWith('tab:')){const p=t.split(':');setTab(p[1] as any);if(p[2])setPendingSec(p[2]);}else setTimeout(()=>setLandingSlug(t),100);}}/>:landingSlug==='realty'?<RealtyLandingV2 onClose={()=>setLandingSlug(null)} go={(t:string)=>{setLandingSlug(null);if(t==='action:tickets')setShowTickets(true);else if(t.startsWith('tab:')){const p=t.split(':');setTab(p[1] as any);if(p[2])setPendingSec(p[2]);}else setTimeout(()=>setLandingSlug(t),100);}}/>:landingSlug==='jobs'?<JobsLandingV2 onClose={()=>setLandingSlug(null)}/>:landingSlug==='farm'?<FarmLandingV2 onClose={()=>setLandingSlug(null)}/>:landingSlug==='vision2030'||landingSlug==='ethnomir2030'?<Vision2030LandingV2 onClose={()=>setLandingSlug(null)}/>:landingSlug==='recycling'?<EcoLandingV2 onClose={()=>setLandingSlug(null)}/>:landingSlug==='charity'?<CharityLandingV2 onClose={()=>setLandingSlug(null)} cart={cart} setCart={setCart}/>:landingSlug==='founder'?<FounderLandingV2 onClose={()=>setLandingSlug(null)} cart={cart} setCart={setCart}/>:landingSlug==='articles'?<ArticlesLandingV2 onClose={()=>setLandingSlug(null)}/>:<UniversalLanding slug={landingSlug} onClose={()=>setLandingSlug(null)} onNav={(t:any,s:any)=>{setLandingSlug(null);setPendingSec(s||"");setTab(t);}} onBuy={()=>{setLandingSlug(null);setShowTickets(true);}}/>)}
        {showSearch && <div className="fade-in" style={{position:"fixed",inset:0,zIndex:300,background:"var(--bg)"}}><SearchModal onClose={()=>setShowSearch(false)} onNav={(t:string,s?:string)=>{setPendingSec(s||"");setTab(t as Tab);}}/></div>}
        {/* ═══ PROMO CODE MODAL ═══ */}
        {showPromo&&<div className="ios-sheet" style={{position:"fixed",inset:0,margin:"0 auto",maxWidth:390,zIndex:250,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={(e:any)=>{if(e.target===e.currentTarget)setShowPromo(false);}}>
          <div style={{width:"100%",maxWidth:390,background:"var(--bg)",borderRadius:"28px 28px 0 0",padding:"24px 20px env(safe-area-inset-bottom,20px)"}}>
            <div style={{width:36,height:5,borderRadius:3,background:"var(--fill4)",margin:"0 auto 16px"}}></div>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:4}}>Промокод</div>
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Введите код для получения скидки</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={promoCode} onChange={(e:any)=>setPromoCode(e.target.value.toUpperCase())} placeholder="ЭТНО2026" style={{flex:1,padding:"14px 16px",borderRadius:14,border:"1px solid var(--sep)",background:"var(--bg2)",fontSize:17,fontWeight:600,fontFamily:FD,color:"var(--label)",letterSpacing:"2px",textTransform:"uppercase"}} />
              <div className="tap btn-spring" onClick={async()=>{if(!promoCode.trim())return;const d=await sb("promo_codes","select=*&code=eq."+promoCode.trim()+"&is_active=eq.true&limit=1");if(d&&d[0]){const p=d[0];if(p.valid_until&&new Date(p.valid_until)<new Date()){setPromoResult({ok:false,msg:"Промокод истёк"});}else if(p.max_uses&&p.used_count>=p.max_uses){setPromoResult({ok:false,msg:"Промокод исчерпан"});}else{setPromoResult({ok:true,promo:p,msg:p.type==="discount"?"-"+p.value+"%":p.type==="fixed"?"-"+p.value+"\u20bd":p.type==="points"?"+"+p.value+" баллов":"Активировано!"});
              // Save promo usage to DB
              fetch(SB_URL+"/rest/v1/promo_uses",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({promo_id:p.id,user_id:session?.user?.id||null,discount_amount:p.value})});
              fetch(SB_URL+"/rest/v1/promo_codes?id=eq."+p.id,{method:"PATCH",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({used_count:(p.used_count||0)+1})});
              // Store active promo for cart
              try{localStorage.setItem("em_promo",JSON.stringify(p));}catch{}}}else{setPromoResult({ok:false,msg:"Промокод не найден"});}}} style={{width:50,height:50,borderRadius:14,background:"#007AFF",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            </div>
            {promoResult&&<div style={{padding:"14px 16px",borderRadius:14,background:promoResult.ok?"rgba(52,199,89,.1)":"rgba(255,59,48,.1)",marginBottom:12}}>
              <div style={{fontSize:15,fontWeight:600,color:promoResult.ok?"#34C759":"#FF3B30",fontFamily:FD}}>{promoResult.msg}</div>
              {promoResult.promo&&<div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4}}>{promoResult.promo.description_ru}</div>}
            </div>}
          </div>
        </div>}

        {/* ═══ CHAT SUPPORT ═══ */}
        {showChat&&<div style={{position:"fixed",bottom:0,right:0,left:0,top:0,margin:"0 auto",maxWidth:390,zIndex:260,display:"flex",flexDirection:"column"}}>
          <div style={{flex:0,padding:"54px 20px 12px",background:"var(--bg)",borderBottom:"0.5px solid var(--sep)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FD}}>Чат поддержки</div>
            <div className="tap" onClick={()=>{setShowChat(false);if(_chatPollRef.current){clearInterval(_chatPollRef.current);_chatPollRef.current=null;}}} style={{fontSize:15,color:"#007AFF",fontFamily:FT}}>Закрыть</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px",background:"var(--bg)",display:"flex",flexDirection:"column",gap:10}}>
            {chatMessages.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"var(--label3)",fontFamily:FT}}><div style={{fontSize:48,marginBottom:8}}>💬</div><div style={{fontSize:17,fontWeight:600,color:"var(--label)",marginBottom:4}}>Чат с менеджером</div><div style={{fontSize:13,lineHeight:1.5}}>Сообщения отправляются в Telegram команды поддержки. Ответ придёт сюда.</div></div>}
            {chatMessages.map((m:any,i:number)=>(<div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"80%"}}>
                {m.role==="support"&&<div style={{fontSize:11,fontWeight:600,color:"#34C759",fontFamily:FT,marginBottom:2}}>{m.metadata?.manager||"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440"}</div>}
                <div style={{padding:"10px 14px",borderRadius:18,background:m.role==="user"?"#007AFF":m.role==="support"?"#E8F5E9":"var(--fill4)",color:m.role==="user"?"#fff":"var(--label)",fontSize:15,fontFamily:FT,lineHeight:1.4}}>{m.message}</div>
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:2,textAlign:m.role==="user"?"right":"left"}}>{m.created_at?new Date(m.created_at).toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}):""}</div>
              </div>))}
          </div>
          <div style={{padding:"12px 20px env(safe-area-inset-bottom,12px)",background:"var(--bg)",borderTop:"0.5px solid var(--sep)",display:"flex",gap:8}}>
            <input value={chatInput} onChange={(e:any)=>setChatInput(e.target.value)} onKeyDown={(e:any)=>{if(e.key==="Enter"&&chatInput.trim()){const msg=chatInput.trim();setChatInput("");setChatMessages(p=>[...p,{role:"user",message:msg,created_at:new Date().toISOString()}]);
              // Save to DB
              fetch(SB_URL+"/rest/v1/chat_messages",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({session_id:chatSessionId,role:"user",message:msg})});
              // Send to Telegram via RPC
              fetch(SB_URL+"/rest/v1/rpc/send_to_telegram",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({p_session_id:chatSessionId,p_message:msg,p_user_name:session?.user?.email||"\u0413\u043e\u0441\u0442\u044c"})}).catch(()=>{});setTimeout(()=>{const ml=msg.toLowerCase();let reply="Спасибо за обращение! Менеджер ответит в ближайшее время.";
                if(ml.includes("режим")||ml.includes("работ")||ml.includes("час")||ml.includes("откры"))reply="Режим работы: ежедневно 09:00–21:00, 365 дней в году. Касса до 19:30.";
                else if(ml.includes("цен")||ml.includes("стоим")||ml.includes("биле")||ml.includes("скольк"))reply="Входной билет: взрослый 600\u20bd, детский 300\u20bd. Промокод ЭТНО2026 даёт скидку 10%!";
                else if(ml.includes("отел")||ml.includes("жиль")||ml.includes("брон")||ml.includes("номер"))reply="У нас 13 этноотелей от 4000\u20bd/ночь. Перейдите в раздел «Жильё» для бронирования.";
                else if(ml.includes("ресторан")||ml.includes("кафе")||ml.includes("еда")||ml.includes("кухн"))reply="18 ресторанов с кухнями 15 стран мира. Раздел «Услуги» → «Рестораны».";
                else if(ml.includes("маршру")||ml.includes("карт")||ml.includes("как добр")||ml.includes("дорог"))reply="Адрес: Калужская обл., Боровский р-н, д. Петрово. Координаты: 55.2396, 36.4215. Бесплатная парковка.";
                else if(ml.includes("мастер")||ml.includes("класс")||ml.includes("заняти"))reply="41 мастер-класс: гончарное дело, кулинария, ткачество, роспись и другие. Раздел «Билеты» → «Мастер-классы».";
                else if(ml.includes("бан")||ml.includes("спа")||ml.includes("сауна"))reply="Русская баня, хаммам, японская баня офуро. Раздел «Услуги» → «Бани».";
                else if(ml.includes("промо")||ml.includes("скидк")||ml.includes("код"))reply="Промокоды: ЭТНО2026 (-10%), ЛЕТО26 (-15%), СЕМЬЯ (-1000\u20bd). Введите в разделе «Промокод» в Паспорте.";
                else if(ml.includes("дет")||ml.includes("ребён")||ml.includes("семь"))reply="Для детей: площадки, хаски-парк, верёвочный парк, мастер-классы. Дети до 5 лет — бесплатно!";
                else if(ml.includes("прив")||ml.includes("здравс")||ml.includes("добр"))reply="Здравствуйте! Я помощник Этномира. Спросите о билетах, отелях, ресторанах, мастер-классах или маршруте.";
                setChatMessages(p=>[...p,{role:"bot",message:reply}]);
                // Save bot reply to DB
                fetch(SB_URL+"/rest/v1/chat_messages",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({session_id:chatSessionId,role:"bot",message:reply})});},1000);}}} placeholder="Сообщение..." style={{flex:1,padding:"10px 14px",borderRadius:20,border:"1px solid var(--sep)",background:"var(--bg2)",fontSize:15,fontFamily:FT,color:"var(--label)"}} />
            <div className="tap" onClick={()=>{if(!chatInput.trim())return;const msg=chatInput.trim();setChatInput("");setChatMessages((p:any)=>[...p,{role:"user",message:msg,created_at:new Date().toISOString()}]);fetch(SB_URL+"/rest/v1/chat_messages",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({session_id:chatSessionId,role:"user",message:msg})});fetch(SB_URL+"/rest/v1/rpc/send_to_telegram",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({p_session_id:chatSessionId,p_message:msg,p_user_name:session?.user?.email||"\u0413\u043e\u0441\u0442\u044c"})}).catch(()=>{});setTimeout(()=>{const ml=msg.toLowerCase();let r="\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0443.";if(ml.includes("\u0440\u0435\u0436\u0438\u043c")||ml.includes("\u0447\u0430\u0441"))r="\u0420\u0435\u0436\u0438\u043c: 09:00\u201321:00, 365 \u0434\u043d\u0435\u0439.";else if(ml.includes("\u0446\u0435\u043d")||ml.includes("\u0431\u0438\u043b\u0435"))r="\u0411\u0438\u043b\u0435\u0442: 600\u20bd \u0432\u0437\u0440., 300\u20bd \u0434\u0435\u0442.";setChatMessages((p:any)=>[...p,{role:"bot",message:r}]);fetch(SB_URL+"/rest/v1/chat_messages",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({session_id:chatSessionId,role:"bot",message:r})});},800);}} style={{width:36,height:36,borderRadius:18,background:"#007AFF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12l20-9-9 20-2-8z" fill="#fff"/></svg></div>
          </div>
        </div>}

        {/* ═══ PARK MAP ═══ */}
        {showCalendar&&<CalendarView onClose={()=>setShowCalendar(false)} onBuy={()=>{setShowCalendar(false);setTab("stay" as Tab);}}/>}
        {showParkMap&&<div style={{position:"fixed",inset:0,margin:"0 auto",maxWidth:390,zIndex:250,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"54px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>Карта парка</div>
            <div className="tap" onClick={()=>setShowParkMap(false)} style={{fontSize:15,color:"#007AFF",fontFamily:FT}}>Закрыть</div>
          </div>
          <div style={{display:"flex",gap:6,padding:"0 20px 12px",overflowX:"auto"}}>
            {[["all","Все","📍"],["hotel","Отели","🏨"],["food","Еда","🍽️"],["activity","Активности","🎯"],["spa","СПА","🧖"],["entrance","Вход","🚪"],["parking","Парковка","🅿️"]].map(([id,label,ic]:any)=>(<div key={id} className="tap" onClick={()=>setMapFilter(id)} style={{padding:"6px 12px",borderRadius:20,background:mapFilter===id?"#007AFF":"var(--bg2)",color:mapFilter===id?"#fff":"var(--label2)",fontSize:12,fontWeight:600,fontFamily:FT,display:"flex",gap:4,alignItems:"center",flexShrink:0}}><span>{ic}</span>{label}</div>))}
          </div>
          <div style={{flex:1,position:"relative",background:"#E8E4DF",margin:"0 20px 20px",borderRadius:20,overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#C5E1A5 0%,#A5D6A7 30%,#81C784 60%,#66BB6A 100%)",opacity:0.3}}></div>
            <svg viewBox="0 0 400 500" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
              <path d="M50 250 Q100 200 200 220 Q300 240 350 200" stroke="#795548" strokeWidth="3" fill="none" strokeDasharray="8 4" opacity="0.4"/>
              <path d="M100 400 Q200 350 300 380" stroke="#795548" strokeWidth="2" fill="none" strokeDasharray="6 3" opacity="0.3"/>
              <rect x="150" y="180" width="100" height="60" rx="8" fill="rgba(255,255,255,0.5)" stroke="#999" strokeWidth="0.5"/>
              <text x="200" y="215" textAnchor="middle" fontSize="10" fill="#666" fontFamily="system-ui">Улица Мира</text>
            </svg>
            {(mapPois.length===0?[]:mapPois).filter((p:any)=>mapFilter==="all"||p.category===mapFilter).map((p:any,i:number)=>(<div key={i} className="tap" style={{position:"absolute",left:(p.pos_x*100)+"%",top:(p.pos_y*100)+"%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:2,zIndex:10}} title={p.name_ru} onClick={()=>setSelectedPoi(p)}>
              <div style={{width:36,height:36,borderRadius:18,background:p.color||"#007AFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>{p.cover_emoji||"📍"}</div>
              <div style={{fontSize:9,fontWeight:600,color:"var(--label)",fontFamily:FT,background:"rgba(255,255,255,0.85)",padding:"1px 4px",borderRadius:4,whiteSpace:"nowrap",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis"}}>{p.name_ru}</div>
            </div>))}
          </div>
        </div>}

        {selectedPoi&&showParkMap&&<div style={{position:"absolute",bottom:20,left:20,right:20,padding:"16px",borderRadius:16,background:"var(--bg2)",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",zIndex:20,border:"0.5px solid var(--sep-opaque)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{selectedPoi.cover_emoji} {selectedPoi.name_ru}</div>
                  <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4}}>{selectedPoi.description_ru||selectedPoi.category}</div>
                  {selectedPoi.lat&&<div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:6}}>📍 {Number(selectedPoi.lat).toFixed(4)}, {Number(selectedPoi.lon).toFixed(4)}</div>}
                </div>
                <div className="tap" onClick={()=>setSelectedPoi(null)} style={{width:28,height:28,borderRadius:14,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"var(--label2)"}}>✕</div>
              </div>
            </div>}
            {/* ═══ NOTIFICATIONS ═══ */}
        {showNotifs&&<div className="ios-sheet" style={{position:"fixed",inset:0,margin:"0 auto",maxWidth:390,zIndex:250,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={(e:any)=>{if(e.target===e.currentTarget)setShowNotifs(false);}}>
          <div style={{width:"100%",maxWidth:390,maxHeight:"70vh",background:"var(--bg)",borderRadius:"28px 28px 0 0",padding:"24px 20px",overflowY:"auto"}}>
            <div style={{width:36,height:5,borderRadius:3,background:"var(--fill4)",margin:"0 auto 16px"}}></div>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:16}}>Уведомления</div>
            {notifs.map((n:any,i:number)=>(<div key={i} style={{padding:"14px 0",borderBottom:i<notifs.length-1?"0.5px solid var(--sep)":"none",display:"flex",gap:12}}>
              <div style={{fontSize:28}}>{n.icon||"🔔"}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FD}}>{n.title}</div><div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:2}}>{n.body}</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:4}}>{n.created_at?new Date(n.created_at).toLocaleDateString("ru",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""}</div></div>
            </div>))}
            {notifs.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"var(--label3)",fontFamily:FT}}>Нет новых уведомлений</div>}
          </div>
        </div>}

        {/* ═══ PASSPORT OVERLAY ═══ */}
        {showPassport && (
          <div className="ios-sheet" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div className="no-print" style={{padding:"max(54px, env(safe-area-inset-top, 54px)) 20px 12px",background:"rgba(242,242,247,0.94)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="tap" onClick={()=>setShowPassport(false)} style={{width:32,height:32,borderRadius:16,background:"rgba(120,120,128,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}className="no-print">Паспорт</div>
              <div style={{width:32}}/>
            </div>
            <div style={{flex:1,overflow:"auto",WebkitOverflowScrolling:"touch"}}>
              <ErrorBoundary fallback={<div style={{padding:40,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>⚠️</div><div style={{fontSize:15,color:"var(--label2)"}}>Ошибка паспорта</div><div className="tap" onClick={()=>window.location.reload()} style={{marginTop:16,padding:"12px 24px",background:"#007AFF",color:"#fff",borderRadius:12,display:"inline-block",fontSize:15,fontWeight:600}}>Повторить</div></div>}><PassportView session={session} onLogin={doLogin} onLogout={doLogout} onQR={()=>{setShowPassport(false);setShowQR(true);}} onOpenPromo={()=>{setPromoCode("");setPromoResult(null);setShowPromo(true);}} onOpenChat={()=>{setShowChat(true);
            // Start polling for support replies every 5s
            if(_chatPollRef.current)clearInterval(_chatPollRef.current);
            _chatPollRef.current=setInterval(()=>{
              fetch(SB_URL+"/rest/v1/rpc/chat_poll",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({p_session_id:chatSessionId,p_after:_lastMsgTime.current})}).then(r=>r.json()).then(msgs=>{
                if(Array.isArray(msgs)&&msgs.length>0){
                  const newSupport=msgs.filter((m:any)=>m.role==="support");
                  if(newSupport.length>0){setChatMessages(p=>{const ids=new Set(p.map((x:any)=>x.id));const fresh=newSupport.filter((m:any)=>!ids.has(m.id));return fresh.length>0?[...p,...fresh]:p;});}
                  _lastMsgTime.current=msgs[msgs.length-1].created_at;
                }
              }).catch(()=>{});
            },5000);fetch(SB_URL+"/rest/v1/chat_messages?session_id=eq."+chatSessionId+"&order=created_at.asc&limit=50",{headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY}}).then(r=>r.json()).then(d=>{if(Array.isArray(d)&&d.length>0)setChatMessages(d);}).catch(()=>{});}} onOpenNotifs={()=>{sb("push_messages","select=*&order=created_at.desc&limit=10").then(d=>setNotifs(d||[]));setShowNotifs(true);}} onOpenCalendar={()=>setShowCalendar(true)} onOpenMap={()=>{sb("map_pois","select=*&is_active=eq.true&order=sort_order.asc").then(d=>setMapPois(d||[]));setShowParkMap(true);}}/></ErrorBoundary>
            </div>
          </div>
        )}
        <TabBar active={tab} onSelect={(t:any)=>{setTab(t);setShowFranchise(false);setLandingSlug(null);}}/>
      
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
