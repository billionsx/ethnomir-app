'use client';
// @ts-nocheck
// v19: 2026-03-11T17:48:26.619Z
import { useState, useEffect, useCallback } from 'react';

// âââ Supabase ââââââââââââââââââââââââââââââââââââââââââââ
const SB_URL = 'https://ewnoqkoojobyqqxpvzhj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';

async function doShare(title:string,text:string) {
  if(navigator.share) {
    try { await navigator.share({title,text,url:window.location.href}); } catch{}
  } else {
    await navigator.clipboard.writeText(text+" "+window.location.href);
  }
}


function logActivity(action,meta){try{fetch(SB_URL+'/rest/v1/user_activity',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({action:action,metadata:typeof meta==='string'?meta:JSON.stringify(meta||{}),device_info:navigator.userAgent?.slice(0,100)||'',created_at:new Date().toISOString()})}).catch(()=>{});}catch(e){}}
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

async function sb(table: string, params = '') {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) return [];
  return r.json();
}

// âââ Auth âââââââââââââââââââââââââââââââââââââââââââââââââ
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
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) return [];
  return r.json();
}

// âââ Fonts âââââââââââââââââââââââââââââââââââââââââââââââ
const FD = '"SF Pro Display",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';
const FT = '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';

type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

// âââ CSS âââââââââââââââââââââââââââââââââââââââââââââââââ
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
  .tap{cursor:pointer;transition:transform .22s cubic-bezier(0.34,1.56,0.64,1),opacity .15s} @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}} .anim-slideUp{animation:slideUp .45s cubic-bezier(0.2,0.8,0.2,1) forwards} .anim-fadeIn{animation:fadeIn .3s ease forwards} .anim-scaleIn{animation:scaleIn .35s cubic-bezier(0.2,0.8,0.2,1) forwards} .fu{opacity:0;transform:translateY(16px);animation:fadeUp .5s ease forwards} @keyframes fadeUp{to{opacity:1;transform:translateY(0)}} .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}.s6{animation-delay:.3s}
  .tap{-webkit-tap-highlight-color:transparent} .tap:active{transform:scale(0.96)!important;opacity:.7!important;transition:transform .08s,opacity .06s}
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

// âââ Helpers âââââââââââââââââââââââââââââââââââââââââââââ
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
  {g:'linear-gradient(135deg,#C0392B,#E91E63)',title:'Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ',sub:'ÐÐ°Ð³ÑÑÐ·ÐºÐ°...',badge:'',cover_emoji:'ð'},
]

// âââ HOME âââââââââââââââââââââââââââââââââââââââââââââââââ
function WelcomeScreen({onDone}:{onDone:()=>void}) {
  const [step, setStep] = useState(0);
  const steps = [
    {e:"ð",t:"ÐÐ¾Ð±ÑÐ¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°ÑÑ!",s:"Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ â ÐºÑÑÐ¿Ð½ÐµÐ¹ÑÐ¸Ð¹ ÑÑÐ½Ð¾Ð³ÑÐ°ÑÐ¸ÑÐµÑÐºÐ¸Ð¹ Ð¿Ð°ÑÐº Ð Ð¾ÑÑÐ¸Ð¸. 96 ÑÑÑÐ°Ð½ Ð¼Ð¸ÑÐ° Ð½Ð° 140 Ð³ÐµÐºÑÐ°ÑÐ°Ñ.",bg:"linear-gradient(145deg,#1B3A2A,#2D5A3D)"},
    {e:"ð·",t:"Ð¡Ð¾Ð±Ð¸ÑÐ°Ð¹ÑÐµ ÑÑÐ°Ð¼Ð¿Ñ",s:"Ð¡ÐºÐ°Ð½Ð¸ÑÑÐ¹ÑÐµ QR-ÐºÐ¾Ð´Ñ Ñ ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ ÑÑÐ½Ð¾Ð´Ð²Ð¾ÑÐ° Ð¸ Ð·Ð°ÑÐ°Ð±Ð°ÑÑÐ²Ð°Ð¹ÑÐµ Ð¾ÑÐºÐ¸ Ð² Ð¿Ð°ÑÐ¿Ð¾ÑÑ Ð¿ÑÑÐµÑÐµÑÑÐ²ÐµÐ½Ð½Ð¸ÐºÐ°.",bg:"linear-gradient(145deg,#0a2463,#247ba0)"},
    {e:"ð¨",t:"ÐÑÐ¾Ð½Ð¸ÑÑÐ¹ÑÐµ Ð¾Ð½Ð»Ð°Ð¹Ð½",s:"ÐÑÐµÐ»Ð¸, ÑÑÑÑ, Ð¼Ð°ÑÑÐµÑ-ÐºÐ»Ð°ÑÑÑ Ð¸ ÑÐµÑÑÐ¾ÑÐ°Ð½Ñ â Ð²ÑÑ Ð² Ð¾Ð´Ð½Ð¾Ð¼ Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ð¸. Ð¡Ð¿ÐµÑÐ¸Ð°Ð»ÑÐ½ÑÐµ ÑÐµÐ½Ñ!",bg:"linear-gradient(145deg,#6b2fa0,#c33764)"}
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
        <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{step<2?"ÐÐ°Ð»ÐµÐµ":"ÐÐ°ÑÐ°ÑÑ"}</span>
      </div>
      {step>0 && <div className="tap" onClick={onDone} style={{marginTop:12}}><span style={{fontSize:14,color:"rgba(255,255,255,.5)",fontFamily:FT}}>ÐÑÐ¾Ð¿ÑÑÑÐ¸ÑÑ</span></div>}
    </div>
  );
}

function SuccessToast({msg,onClose}:{msg:string,onClose:()=>void}) {
  useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t);},[]);
  return (
    <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:300,width:"calc(100% - 40px)",maxWidth:350,padding:"16px 20px",borderRadius:16,background:"rgba(52,199,89,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",display:"flex",gap:12,alignItems:"center",animation:"fu .4s cubic-bezier(0.2,0.8,0.2,1)"}}>
      <div style={{width:36,height:36,borderRadius:18,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>â</div>
      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:FT}}>{msg}</div></div>
      <div className="tap" onClick={onClose} style={{fontSize:18,color:"rgba(255,255,255,0.7)",cursor:"pointer"}}>â</div>
    </div>
  );
}

function BookingModal({item,type,total,guests,onClose}:{item:any,type:string,total:number,guests:number,onClose:()=>void}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if(!name.trim()||!phone.trim()){setErr("ÐÐ°Ð¿Ð¾Ð»Ð½Ð¸ÑÐµ Ð¸Ð¼Ñ Ð¸ ÑÐµÐ»ÐµÑÐ¾Ð½");return;}
    if(phone.replace(/\D/g,"").length<10){setErr("ÐÑÐ¾Ð²ÐµÑÑÑÐµ Ð½Ð¾Ð¼ÐµÑ ÑÐµÐ»ÐµÑÐ¾Ð½Ð°");return;}
    setSending(true);setErr("");
    try{
      const r = await fetch(SB_URL+"/rest/v1/bookings",{
        method:"POST",
        headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"return=minimal"},
        body:JSON.stringify({type,item_id:item.id||null,item_name:item.name||item.name_ru||"",guest_name:name,guest_phone:phone.replace(/\D/g,""),guests_count:guests,total_price:total,nights:item._nights||null})
      });
      if(r.ok){setDone(true);logAction(null,"booking",type,item.id||"",{item_name:item.name||item.name_ru,total,guests});fetch(SB_URL+"/rest/v1/orders",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({type,items:JSON.stringify([{id:item.id,name:item.name||item.name_ru,qty:guests}]),subtotal:total,total,guest_name:name,guest_phone:phone,status:"pending"})}).catch(()=>{});}else{setErr("ÐÑÐ¸Ð±ÐºÐ°. ÐÐ¾Ð·Ð²Ð¾Ð½Ð¸ÑÐµ +7 (495) 023-43-49");}
    }catch{setErr("ÐÐµÑ ÑÐ²ÑÐ·Ð¸. ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ Ð¿Ð¾Ð·Ð¶Ðµ.");}
    setSending(false);
  };

  if(done) return (
    <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:28,padding:"40px 24px",maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 16px 48px rgba(0,0,0,0.2)"}}>
        <div style={{width:64,height:64,borderRadius:32,background:"rgba(52,199,89,0.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>â</div>
        <>{logActivity('booking',{source:'contact_form'})}</><div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>ÐÐ°ÑÐ²ÐºÐ° Ð¾ÑÐ¿ÑÐ°Ð²Ð»ÐµÐ½Ð°!</div>
        <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8,lineHeight:1.5}}>ÐÐµÐ½ÐµÐ´Ð¶ÐµÑ ÑÐ²ÑÐ¶ÐµÑÑÑ Ñ Ð²Ð°Ð¼Ð¸ Ð² ÑÐµÑÐµÐ½Ð¸Ðµ 30 Ð¼Ð¸Ð½ÑÑ Ð¿Ð¾ Ð½Ð¾Ð¼ÐµÑÑ {phone}</div>
        <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:12}}>{item.name||item.name_ru} Â· {total.toLocaleString("ru")} â½</div>
        <div className="tap" onClick={onClose} style={{marginTop:20,padding:"14px",borderRadius:14,background:"var(--blue)",cursor:"pointer"}}>
          <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>ÐÑÐ»Ð¸ÑÐ½Ð¾</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"28px 28px 0 0",padding:"8px 24px 32px",maxWidth:390,width:"100%",boxShadow:"0 -8px 32px rgba(0,0,0,0.15)"}}>
        {/* Handle bar */}
        <div style={{width:36,height:4,borderRadius:2,background:"var(--label4)",margin:"0 auto 16px"}}/>
        <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:4}}>ÐÑÐ¾ÑÐ¼Ð¸ÑÑ Ð·Ð°ÑÐ²ÐºÑ</div>
        <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>{item.name||item.name_ru} Â· {guests} ÑÐµÐ». Â· {total.toLocaleString("ru")} â½</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--label2)",fontFamily:FT,marginBottom:6}}>ÐÐ°ÑÐµ Ð¸Ð¼Ñ</div>
          <input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="ÐÐ²Ð°Ð½ ÐÐ²Ð°Ð½Ð¾Ð²" className="ios-input"/>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"var(--label2)",fontFamily:FT,marginBottom:6}}>Ð¢ÐµÐ»ÐµÑÐ¾Ð½</div>
          <input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+7 900 123-45-67" type="tel" className="ios-input"/>
        </div>
        {err && <div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,marginBottom:12,textAlign:"center"}}>{err}</div>}
        <div className="tap" onClick={submit} style={{padding:"16px",borderRadius:16,background:"var(--blue)",textAlign:"center",opacity:sending?.5:1,marginBottom:8}}>
          <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{sending?"ÐÑÐ¿ÑÐ°Ð²ÐºÐ°...":"ÐÑÐ¿ÑÐ°Ð²Ð¸ÑÑ Ð·Ð°ÑÐ²ÐºÑ"}</span>
        </div>
        <div className="tap" onClick={onClose} style={{padding:"12px",textAlign:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>ÐÑÐ¼ÐµÐ½Ð°</span>
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
        {!visited && <div style={{position:"absolute",inset:0,borderRadius:s/2,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,opacity:.4}}>ð</span></div>}
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
        {visited && <div style={{position:"absolute",bottom:-2,right:-2,width:18,height:18,borderRadius:9,background:"var(--green)",border:"2px solid var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,color:"#fff"}}>â</span></div>}
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
          {n<=value?"â":"â"}
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
          <span style={{fontSize:18,color:"#fff",fontWeight:300}}>â¹</span>
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
            <div style={{fontSize:11,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>ÐÐ½ÑÐµÑÐµÑÐ½ÑÐ¹ ÑÐ°ÐºÑ</div>
            <div style={{fontSize:15,color:"var(--label)",fontFamily:FT,lineHeight:1.6}}>{country.fun_fact_ru}</div>
          </div>
        )}
        {country.description_ru && (
          <div style={{marginTop:12,padding:16,borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Ð Ð¿Ð°Ð²Ð¸Ð»ÑÐ¾Ð½Ðµ</div>
            <div style={{fontSize:15,color:"var(--label2)",fontFamily:FT,lineHeight:1.6}}>{country.description_ru}</div>
          </div>
        )}
        {country._visited && (
          <div style={{marginTop:16,padding:16,borderRadius:16,background:"rgba(52,199,89,.06)",border:"0.5px solid rgba(52,199,89,.15)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>â</span>
              <span style={{fontSize:15,fontWeight:600,color:"var(--green)",fontFamily:FT}}>ÐÐ¾ÑÐµÑÐµÐ½Ð¾</span>
            </div>
          </div>
        )}
        {!country._visited && (
          <div style={{marginTop:16,padding:16,borderRadius:16,background:"rgba(0,122,255,.04)",border:"0.5px solid rgba(0,122,255,.12)"}}>
            <div style={{fontSize:13,color:"var(--blue)",fontFamily:FT,lineHeight:1.5}}>ÐÐ¾ÑÐµÑÐ¸ÑÐµ Ð¿Ð°Ð²Ð¸Ð»ÑÐ¾Ð½ Ð¸ Ð¾ÑÑÐºÐ°Ð½Ð¸ÑÑÐ¹ÑÐµ QR-ÐºÐ¾Ð´, ÑÑÐ¾Ð±Ñ Ð¿Ð¾Ð»ÑÑÐ¸ÑÑ ÑÑÐ°Ð¼Ð¿</div>
          </div>
        )}
        <div className="tap" onClick={()=>doShare(country.name_ru+" Ð² Ð­ÑÐ½Ð¾Ð¼Ð¸ÑÐµ",country.flag_emoji+" "+country.name_ru+" â Ð¿Ð°Ð²Ð¸Ð»ÑÐ¾Ð½ Ð² ÑÑÐ½Ð¾Ð¿Ð°ÑÐºÐµ Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ")} style={{marginTop:20,height:50,borderRadius:14,background:"var(--fill4)",border:"0.5px solid var(--sep-opaque)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:16}}>â</span>
          <span style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÐ¾Ð´ÐµÐ»Ð¸ÑÑÑÑ</span>
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
    if(!code.trim()){setError("ÐÐ²ÐµÐ´Ð¸ÑÐµ ÐºÐ¾Ð´");return;}
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
        setError(d.error==="invalid_code"?"ÐÐ¾Ð´ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½. ÐÑÐ¾Ð²ÐµÑÑÑÐµ Ð¸ Ð¿Ð¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ ÑÐ½Ð¾Ð²Ð°.":"ÐÑÐ¸Ð±ÐºÐ° ÑÐºÐ°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ñ");
      }
    }catch{setError("ÐÐµÑ ÑÐ²ÑÐ·Ð¸");}
    setLoading(false);
  };

  if(result) return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
      <div className="fu" style={{textAlign:"center"}}>
        {result.already ? (
          <>
            <div style={{fontSize:64,marginBottom:16}}>{result.country?.flag_emoji||"ð"}</div>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{result.country?.name_ru}</div>
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8}}>Ð­ÑÐ° ÑÑÑÐ°Ð½Ð° ÑÐ¶Ðµ Ð² Ð²Ð°ÑÐµÐ¼ Ð¿Ð°ÑÐ¿Ð¾ÑÑÐµ!</div>
            <div style={{marginTop:8,padding:"6px 14px",borderRadius:10,background:"rgba(52,199,89,.1)",display:"inline-block"}}>
              <span style={{fontSize:13,fontWeight:600,color:"#34C759",fontFamily:FT}}>â ÐÐ¾ÑÐµÑÐµÐ½Ð¾ ÑÐ°Ð½ÐµÐµ</span>
            </div>
          </>
        ) : (
          <>
            <div style={{width:88,height:88,borderRadius:44,background:"rgba(52,199,89,.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}} className="celebrate">
              <span style={{fontSize:44}}>{result.country?.flag_emoji||"ð"}</span>
            </div>
            <div style={{fontSize:11,fontWeight:600,color:"#34C759",fontFamily:FT,letterSpacing:1,textTransform:"uppercase"}}>ÐÐ¾Ð²ÑÐ¹ ÑÑÐ°Ð¼Ð¿</div>
            <div style={{fontSize:26,fontWeight:700,color:"var(--label)",fontFamily:FD,marginTop:8}}>{result.country?.name_ru}</div>
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8,lineHeight:1.5}}>{result.country?.fun_fact_ru||"ÐÐ¾Ð±ÑÐ¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°ÑÑ Ð² Ð½Ð¾Ð²ÑÑ ÑÑÑÐ°Ð½Ñ!"}</div>
            <div style={{marginTop:16,padding:"8px 20px",borderRadius:30,background:"linear-gradient(135deg,#FFD700,#FFA500)",display:"inline-block"}} className="celebrate">
              <span style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:FD}}>+{result.points||15} Ð¾ÑÐºÐ¾Ð²</span>
            </div>
            {result.achievements&&result.achievements.length>0&&(
              <div style={{marginTop:12,padding:'12px 16px',borderRadius:14,background:'rgba(255,214,10,.1)',border:'0.5px solid rgba(255,214,10,.3)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#FFD60A',fontFamily:FT,marginBottom:4}}>ÐÐ¾ÑÑÐ¸Ð¶ÐµÐ½Ð¸Ðµ ÑÐ°Ð·Ð±Ð»Ð¾ÐºÐ¸ÑÐ¾Ð²Ð°Ð½Ð¾!</div>
                {result.achievements.map((a:string,i:number)=>(<div key={i} style={{fontSize:14,color:'var(--label)',fontFamily:FT}}>ð {a}</div>))}
              </div>
            )}
          </>
        )}
        <div className="tap" onClick={()=>{setResult(null);setCode("");}} style={{marginTop:28,height:50,padding:"0 40px",borderRadius:14,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>Ð¡ÐºÐ°Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ ÐµÑÑ</span>
        </div>
        <div className="tap" onClick={onClose} style={{marginTop:12,padding:"10px"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>ÐÐ°ÐºÑÑÑÑ</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"54px 20px 14px",background:"rgba(242,242,247,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Ð¡ÐºÐ°Ð½ÐµÑ</div>
        <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>â</span>
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
          <span style={{fontSize:40,marginBottom:8}}>ð·</span>
          <span style={{fontSize:13,color:"rgba(255,255,255,.5)",fontFamily:FT}}>ÐÐ°Ð²ÐµÐ´Ð¸ÑÐµ ÐºÐ°Ð¼ÐµÑÑ Ð½Ð° QR-ÐºÐ¾Ð´</span>
          <span style={{fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:FT,marginTop:4}}>Ð¸Ð»Ð¸ Ð²Ð²ÐµÐ´Ð¸ÑÐµ ÐºÐ¾Ð´ Ð²ÑÑÑÐ½ÑÑ â</span>
        </div>
        {/* Manual entry */}
        <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:8}}>ÐÐ²ÐµÐ´Ð¸ÑÐµ ÐºÐ¾Ð´ ÑÐ¾ ÑÑÐµÐ½Ð´Ð°</div>
        <div style={{display:"flex",gap:10}}>
          <input value={code} onChange={(e:any)=>setCode(e.target.value)} 
            onKeyDown={(e:any)=>e.key==="Enter"&&scan()}
            placeholder="ÐÐ°Ð¿ÑÐ¸Ð¼ÐµÑ: ETHNO-JP-2026"
            className="ios-input" style={{flex:1,fontSize:16,letterSpacing:1}}/>
        </div>
        {error && <div style={{fontSize:13,color:"#FF3B30",fontFamily:FT,marginTop:8,textAlign:"center"}}>{error}</div>}
        <div className="tap" onClick={scan} style={{marginTop:16,padding:"16px",borderRadius:16,background:"var(--blue)",textAlign:"center",opacity:loading?.5:1}}>
          <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{loading?"ÐÑÐ¾Ð²ÐµÑÑÑ...":"ÐÑÐ¾Ð²ÐµÑÐ¸ÑÑ ÐºÐ¾Ð´"}</span>
        </div>
        {/* Hint */}
        <div style={{marginTop:24,padding:"16px",borderRadius:16,background:"var(--fill4)",border:"0.5px solid var(--sep)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:6}}>ÐÐ´Ðµ Ð½Ð°Ð¹ÑÐ¸ QR-ÐºÐ¾Ð´?</div>
          <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,lineHeight:1.5}}>QR-ÐºÐ¾Ð´Ñ ÑÐ°ÑÐ¿Ð¾Ð»Ð¾Ð¶ÐµÐ½Ñ Ñ ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ ÑÑÐ½Ð¾Ð´Ð²Ð¾ÑÐ° Ð½Ð° ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸ Ð¿Ð°ÑÐºÐ°. ÐÑÑÐºÐ°Ð½Ð¸ÑÑÐ¹ÑÐµ ÐºÐ¾Ð´ Ð¸Ð»Ð¸ Ð²Ð²ÐµÐ´Ð¸ÑÐµ Ð½Ð¾Ð¼ÐµÑ ÑÐ¾ ÑÑÐµÐ½Ð´Ð°, ÑÑÐ¾Ð±Ñ Ð¿Ð¾Ð»ÑÑÐ¸ÑÑ ÑÑÐ°Ð¼Ð¿ Ð² Ð¿Ð°ÑÐ¿Ð¾ÑÑ Ð¸ Ð·Ð°ÑÐ°Ð±Ð¾ÑÐ°ÑÑ Ð¾ÑÐºÐ¸.</div>
        </div>
        {/* Stats */}
        {!session && (
          <div style={{marginTop:16,padding:"14px 16px",borderRadius:14,background:"rgba(255,149,0,.06)",border:"0.5px solid rgba(255,149,0,.15)",display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:20}}>â ï¸</span>
            <div style={{fontSize:12,color:"var(--orange)",fontFamily:FT,lineHeight:1.4}}>ÐÐ¾Ð¹Ð´Ð¸ÑÐµ Ð² Ð°ÐºÐºÐ°ÑÐ½Ñ, ÑÑÐ¾Ð±Ñ ÑÑÐ°Ð¼Ð¿Ñ ÑÐ¾ÑÑÐ°Ð½ÑÐ»Ð¸ÑÑ Ð² Ð²Ð°ÑÐµÐ¼ Ð¿Ð°ÑÐ¿Ð¾ÑÑÐµ</div>
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
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>ÐÐ°ÑÑÐ°</div>
        <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>â</span>
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
          <span style={{fontSize:11,fontWeight:700,color:"rgba(0,0,0,0.25)",fontFamily:FT,letterSpacing:2,textTransform:"uppercase"}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ Â· 140 ÐÐ</span>
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
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>ÐÐ°Ð¶Ð¼Ð¸ÑÐµ Ð´Ð»Ñ Ð½Ð°Ð²Ð¸Ð³Ð°ÑÐ¸Ð¸</div>
            </div>
            <Chev />
          </div>
        )}
      </div>
    </div>
  );
}

function weatherEmoji(code:number){if(code<=1)return"âï¸";if(code<=3)return"â";if(code<=48)return"ð«ï¸";if(code<=67)return"ð§ï¸";if(code<=77)return"ð¨ï¸";if(code<=82)return"ð¦ï¸";return"âï¸";}

function HomeTab({onBuyTicket,onSearch,onMap,onQR,onProfile,onNav}:{onBuyTicket?:()=>void,onSearch?:()=>void,onMap?:()=>void,onQR?:()=>void,onProfile?:()=>void,onNav?:(t:string,s?:string)=>void}) {
  const [slide, setSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<any[]>(HERO_FB);
  const [allRecos, setAllRecos] = useState<any[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [weekTheme, setWeekTheme] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [viewStory, setViewStory] = useState<any>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [dismissedNotifs, setDismissedNotifs] = useState<string[]>([]);

  useEffect(()=>{
    if(!viewStory)return;
    setStoryProgress(0);
    const iv=setInterval(()=>setStoryProgress(p=>{if(p>=100){setViewStory(null);return 0;}return p+2;}),100);
    return()=>clearInterval(iv);
  },[viewStory]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const t = setInterval(()=>setSlide(s=>(s+1)%heroSlides.length),4200);
    fetch("https://api.open-meteo.com/v1/forecast?latitude=55.24&longitude=36.43&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Moscow&forecast_days=1")
      .then(r=>r.json()).then(d=>{
        if(d?.current)setWeather({temp:Math.round(d.current.temperature_2m),wind:Math.round(d.current.wind_speed_10m),code:d.current.weather_code,hi:d.daily?.temperature_2m_max?.[0],lo:d.daily?.temperature_2m_min?.[0]});
      }).catch(()=>{});
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    Promise.all([
      sb("services","select=cover_emoji,name_ru,status_text,category&is_open_now=eq.true&active=eq.true&limit=10"),
      sb("events","select=cover_emoji,name_ru,location_ru,starts_at,is_free&is_published=eq.true&order=starts_at.asc&limit=5"),
      sb("daily_schedule","select=*&is_active=eq.true&order=time_start.asc"),
      sb("ticket_types","select=id,name_ru,description_ru,cover_emoji,price_weekday,price_weekend,age_range,included_items,is_active&is_active=eq.true&order=sort_order.asc"),
      sb("weekly_themes","select=*&is_published=eq.true&order=week_starts.asc"),
      sb("notifications","select=*&is_active=eq.true&order=priority.desc&limit=5"),
      sb("stories","select=*,image_url&is_active=eq.true&order=sort_order.asc&limit=10"),
      sb("promos","select=*&is_active=eq.true&order=sort_order.asc"),
      sb("hero_slides","select=*&is_active=eq.true&order=sort_order.asc&limit=6"),
      sb("recommendations","select=*&is_active=eq.true&order=sort_order.asc"),
      sb("promo_banners","select=*&is_active=eq.true&order=sort_order.asc"),
    ]).then(([sv,ev,sch,tt,wt,nn,st,pr,hs,recs,pbn])=>{
      setServices(sv||[]);setEvents(ev||[]);setSchedule(sch||[]);setPromos(pr||[]);
      const now=new Date().toISOString().slice(0,10);
      const currentTheme=(wt||[]).find((t:any)=>t.week_starts<=now&&t.week_ends>=now);
      const nextTheme=(wt||[]).find((t:any)=>t.week_starts>now);
      setWeekTheme(currentTheme||nextTheme||null);
      setNotifs(nn||[]);
      setStories(st||[]);setAllRecos(recs||[]);setPromoBanners(pbn||[]);if(hs&&hs.length>0)setHeroSlides(hs.map((h:any)=>({...h,g:h.gradient,sub:h.subtitle})));
      setLoading(false);
    });
  },[]);

  const sl = heroSlides[slide % heroSlides.length] || HERO_FB[0];
  const hour = new Date().getHours();
  const greeting = hour<6?"ÐÐ¾Ð±ÑÐ¾Ð¹ Ð½Ð¾ÑÐ¸":hour<12?"ÐÐ¾Ð±ÑÐ¾Ðµ ÑÑÑÐ¾":hour<18?"ÐÐ¾Ð±ÑÑÐ¹ Ð´ÐµÐ½Ñ":"ÐÐ¾Ð±ÑÑÐ¹ Ð²ÐµÑÐµÑ";
  const dateStr = new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"});
  const dayOfWeek = new Date().getDay();
  const todaySchedule = schedule.filter(s=>(s.days_of_week||[]).includes(dayOfWeek));

  return (
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
      {/* âââ HEADER âââ */}
      <div style={{paddingTop:54}}>
        <div style={{padding:"0 20px 14px"}}>
          <div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>{dateStr}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2}}>
            <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px",lineHeight:1.1}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ</div>
          </div>
        </div>
      </div>

      {/* âââ HERO CARD âââ */}
      <div style={{padding:"16px 20px 0"}}>
        <div className="tap" onClick={()=>onBuyTicket&&onBuyTicket()} style={{borderRadius:30,overflow:"hidden",position:"relative",height:380,background:sl.g,transition:"background .6s",boxShadow:"0 4px 20px rgba(0,0,0,0.10)"}}>
          
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 40%,rgba(0,0,0,.5) 100%)"}} />
          <div style={{position:"absolute",top:18,left:18}}>
            <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:8,padding:"4px 10px",border:"0.5px solid rgba(255,255,255,.15)",fontSize:11,color:"rgba(255,255,255,.85)",fontWeight:600,fontFamily:FT,letterSpacing:".3px",textTransform:"uppercase"}}>{sl.badge}</span>
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
            <div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-0.4px",lineHeight:1.2,marginBottom:4}}>{sl.title}</div>
            <div style={{fontSize:15,color:"rgba(255,255,255,.6)",fontFamily:FT,lineHeight:1.3,fontWeight:400}}>{sl.sub}</div>
            <div style={{display:"flex",gap:5,marginTop:12}}>
              {heroSlides.map((_:any,i:number)=><div key={i} style={{width:i===slide?20:6,height:6,borderRadius:3,background:i===slide?"#fff":"rgba(255,255,255,.35)",transition:"width .35s"}} />)}
            </div>
          </div>
        </div>
      </div>

      {/* âââ STORIES âââ */}
      {stories.length>0 && (
        <div style={{padding:'12px 0 0'}}>
          <div className="snap-x" style={{display:'flex',gap:12,overflowX:'auto',padding:'4px 20px 8px',scrollbarWidth:'none'}}>
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
          {/* Progress bar */}
          <div style={{padding:'54px 16px 0',display:'flex',gap:4}}>
            <div style={{flex:1,height:3,borderRadius:2,background:'rgba(255,255,255,.2)',overflow:'hidden'}}>
              <div style={{width:storyProgress+'%',height:'100%',background:'#fff',borderRadius:2,transition:'width .1s linear'}}/>
            </div>
          </div>
          {/* Header */}
          <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:18,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:18}}>{viewStory.cover_emoji}</span>
            </div>
            <div style={{flex:1}}><span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ</span></div>
            <div className="tap" onClick={(e:any)=>{e.stopPropagation();setViewStory(null);}} style={{width:30,height:30,borderRadius:15,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:14,color:'#fff'}}>â</span>
            </div>
          </div>
          {/* Content */}
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 36px',textAlign:'center'}}>
            <span style={{fontSize:64,marginBottom:20,filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'}}>{viewStory.cover_emoji}</span>
            <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',lineHeight:1.2,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{viewStory.title}</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:12,lineHeight:1.6}}>{viewStory.content_text}</div>
          </div>
          {/* Swipe hint */}
          <div style={{padding:'20px 32px 40px',textAlign:'center'}}>
            <span style={{fontSize:12,color:'rgba(255,255,255,.3)',fontFamily:FT}}>ÐÐ°Ð¶Ð¼Ð¸ÑÐµ ÑÑÐ¾Ð±Ñ Ð·Ð°ÐºÑÑÑÑ</span>
          </div>
        </div>
      )}

      

      {/* âââ WEATHER âââ */}
      <div style={{padding:"12px 20px 0"}}>
        <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {weather && (
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px"}}>
              <div style={{width:44,height:44,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:22}}>{weatherEmoji(weather.code)}</span></div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{weather.temp>0?"+":""}{weather.temp}Â° ÑÐµÐ¹ÑÐ°Ñ</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>ÐÐ°ÑÐº Ð¾ÑÐºÑÑÑ Ð´Ð¾ 21:00</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* âââ ÐÐÐ¢Ð£ÐÐÐ¬ÐÐÐ (Notifications + Theme) âââ */}
      <div style={{padding:"12px 20px 0"}}>
        {/* Weekly Theme Banner */}
        {weekTheme && (
          <div className="tap" style={{borderRadius:16,background:"linear-gradient(135deg,#1a1a3e,#AF52DE,#FF6B9D)",padding:"14px 16px",marginBottom:12,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:48,opacity:.12}}>{weekTheme.cover_emoji}</div>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:600,letterSpacing:.3,fontFamily:FT,textTransform:"uppercase"}}>Ð¢ÐµÐ¼Ð° Ð½ÐµÐ´ÐµÐ»Ð¸</div>
              <div style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:4}}>{weekTheme.cover_emoji} {weekTheme.name_ru}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:3}}>{weekTheme.description_ru}</div>
            </div>
          </div>
        )}
        {/* Notifications as grouped list */}
        {notifs.filter((n:any)=>!dismissedNotifs.includes(n.id)&&!(weekTheme&&n.title===weekTheme.name_ru)).length>0 && (
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
            {notifs.filter((n:any)=>!dismissedNotifs.includes(n.id)&&!(weekTheme&&n.title===weekTheme.name_ru)).slice(0,3).map((n:any,i:number,arr:any[])=>(
              <div key={n.id} style={{display:"flex",gap:12,padding:"13px 16px",borderBottom:i<arr.length-1?"0.5px solid var(--sep)":"none",alignItems:"center"}}>
                <div style={{width:44,height:44,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:20}}>{n.cover_emoji}</span></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{n.title}</div>
                  <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2,lineHeight:1.4}}>{n.body?.slice(0,60)}</div>
                </div>
                <div className="tap" onClick={()=>setDismissedNotifs((p:any)=>[...p,n.id])} style={{flexShrink:0}}>
                  <span style={{fontSize:13,color:"var(--label4)"}}>â</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* âââ PROMOS: horizontal scroll âââ */}
      {promos.length>0 && (
        <div style={{padding:"16px 0 0"}}>
          <div style={{display:"flex",gap:12,overflowX:"auto",padding:"0 20px",scrollSnapType:"x mandatory"}}>
            {promos.map((p:any,i:number)=>{
              const isWeekend = [0,6].includes(new Date().getDay());
              const price = isWeekend ? (p.price_weekend||p.price) : (p.price_weekday||p.price);
              return (
              <div key={p.id||i} className="tap" onClick={()=>onBuyTicket&&onBuyTicket()} style={{flexShrink:0,width:220,padding:"16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",scrollSnapAlign:"start"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20}}>{p.cover_emoji||"ð«"}</span></div>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{p.name_ru}</div>
                </div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginBottom:10,lineHeight:1.4}}>{p.description_ru?.slice(0,60)||(p.age_range||"")}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{price} â½</span>
                    <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{isWeekend?"Ð²ÑÑÐ¾Ð´Ð½Ð¾Ð¹":"Ð±ÑÐ´Ð½Ð¸Ð¹ Ð´ÐµÐ½Ñ"}</div>
                  </div>
                  <div style={{padding:"6px 14px",borderRadius:10,background:"var(--blue)"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>ÐÑÐ¿Ð¸ÑÑ</span>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* âââ Ð ÐÐ¡ÐÐÐ¡ÐÐÐÐ ÐÐÐ¯ âââ */}
      {todaySchedule.length>0 && (
        <div style={{padding:"20px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px"}}>Ð Ð°ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ Ð½Ð° ÑÐµÐ³Ð¾Ð´Ð½Ñ</div>
            <span className="tap" onClick={()=>onNav&&onNav("tours","schedule")} style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>ÐÑÐµ &rsaquo;</span>
          </div>
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>
            {todaySchedule.slice(0,6).map((s:any,i:number)=>{
              const now=new Date();
              const [hh,mm]=(s.time_start||"10:00").split(":");
              const st=new Date();st.setHours(+hh,+mm,0);
              const [hh2,mm2]=(s.time_end||"18:00").split(":");
              const en=new Date();en.setHours(+hh2,+mm2,0);
              const live=now>=st&&now<=en;
              return (
                <div key={s.id||i} className="tap" style={{padding:"12px 16px",display:"flex",gap:12,alignItems:"center",borderBottom:i<Math.min(todaySchedule.length,6)-1?"0.5px solid var(--sep)":"none",background:live?"rgba(52,199,89,.03)":"transparent"}}>
                  <div style={{width:48,textAlign:"center",flexShrink:0}}>
                    <div style={{fontSize:14,fontWeight:700,color:live?"var(--green)":"var(--label)",fontFamily:"monospace"}}>{String(s.time_start).slice(0,5)}</div>
                    <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT}}>{String(s.time_end).slice(0,5)}</div>
                  </div>
                  <div style={{width:2,height:32,borderRadius:1,background:live?"var(--green)":"var(--sep)",flexShrink:0}}/>
                  <div style={{width:40,height:40,borderRadius:12,background:live?"rgba(52,199,89,.1)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,border:live?"1.5px solid var(--green)":"none"}}>{s.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{s.name_ru}</div>
                      {live&&<div style={{padding:"1px 6px",borderRadius:6,background:"var(--green)"}}><span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:FT}}>LIVE</span></div>}
                    </div>
                    <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{s.location_ru}{s.price>0?" Â· "+s.price+" â½":" Â· ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* âââ SMART RECOMMENDATIONS âââ */}
      <div style={{padding:'20px 20px 0'}}>
        <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>{hour<12?"Ð§ÐµÐ¼ Ð·Ð°Ð½ÑÑÑÑÑ ÑÑÑÐ¾Ð¼":"Ð ÐµÐºÐ¾Ð¼ÐµÐ½Ð´Ð°ÑÐ¸Ð¸"}</div>
        <div className="snap-x" style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
          {(()=>{const recoSlot=hour<12?'morning':hour<15?'noon':hour<19?'afternoon':'evening';return allRecos.filter((r:any)=>r.time_slot===recoSlot).map((r:any)=>({e:r.cover_emoji,t:r.title,s:r.subtitle,c:r.color}));})().map((r:any,i:number)=>(
            <div key={i} className="tap" style={{flexShrink:0,width:130,borderRadius:30,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
              <div style={{height:70,background:'linear-gradient(145deg,'+r.c+'cc,'+r.c+'88)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:32}}>{r.e}</span>
              </div>
              <div style={{padding:'8px 10px'}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{r.t}</div>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{r.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      
      {/* âââ Ð¡ÐÐÐ«Ð¢ÐÐ¯ âââ */}
      <div style={{padding:"20px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px"}}>ÐÐ»Ð¸Ð¶Ð°Ð¹ÑÐ¸Ðµ ÑÐ¾Ð±ÑÑÐ¸Ñ</div>
          <span className="tap" onClick={()=>onNav&&onNav("tours","events")} style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>ÐÑÐµ &rsaquo;</span>
        </div>
        {loading ? <SkeletonCard/> : (
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
            {events.map((e:any,i:number)=>{
              const d = new Date(e.starts_at);
              const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
              const label = diff<=0?"Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ":diff===1?"ÐÐ°Ð²ÑÑÐ°":"Ð§ÐµÑÐµÐ· "+diff+" Ð´Ð½.";
              return (
                <div key={i} className="tap" onClick={()=>onNav&&onNav("tours","events")} style={{display:"flex",gap:14,padding:"13px 16px",borderBottom:i<events.length-1?"0.5px solid var(--sep)":"none",alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{e.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{e.name_ru}</div>
                    <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{e.location_ru}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>{label}</span>
                    {e.is_free && <span style={{fontSize:10,fontWeight:600,color:"var(--green)",fontFamily:FT,padding:"2px 6px",borderRadius:6,background:"rgba(52,199,89,.1)"}}>ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      

      {/* âââ PROMO BANNER âââ */}
      {promoBanners.length>0 && (
        <div style={{padding:"20px 20px 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:14}}>ÐÐ¾Ð·Ð¼Ð¾Ð¶Ð½Ð¾ÑÑÐ¸</div>
          {promoBanners.map((pb:any,i:number)=>(
            <div key={pb.id||i} className="tap" onClick={()=>pb.link_tab&&onNav&&onNav(pb.link_tab,pb.link_sec||'')} style={{borderRadius:30,overflow:"hidden",marginBottom:12,background:pb.gradient||"linear-gradient(135deg,#0d2b1d,#1a6b3a)",padding:20,position:"relative"}}>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px"}}>{pb.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:6,letterSpacing:"-.3px"}}>{pb.title}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4,lineHeight:1.5}}>{pb.description_ru}</div>
              <div style={{marginTop:12,display:"inline-flex",padding:"7px 16px",borderRadius:30,background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)"}}>
                <span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>{pb.button_text||"ÐÐ¾Ð´ÑÐ¾Ð±Ð½ÐµÐµ"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// âââ TOURS ââââââââââââââââââââââââââââââââââââââââââââââââ
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

  // âââ DETAIL VIEW âââ
  if (detail) {
    const isTour = detailType==="tour";
    const isMk = detailType==="mk";
    const color = isTour?(TC[detail.type]||"#555"):isMk?"#AF52DE":"#FF9500";
    const dur = isTour?(detail.duration_minutes>=1440?Math.floor(detail.duration_minutes/1440)+" Ð´Ð½.":detail.duration_minutes>=60?Math.floor(detail.duration_minutes/60)+" Ñ.":detail.duration_minutes+" Ð¼Ð¸Ð½."):isMk?detail.duration_min+" Ð¼Ð¸Ð½.":"";
    const price = isTour?detail.price:isMk?detail.price:detail.price||0;
    const maxP = isTour?detail.max_participants:isMk?detail.max_persons:null;

    return (
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
        {/* Hero */}
        <div style={{position:"relative",height:220,background:"linear-gradient(145deg,"+color+"cc,"+color+"88)"}}>
          <div style={{position:"absolute",right:10,top:"40%",transform:"translateY(-50%)",fontSize:96,opacity:.15}}>{detail.cover_emoji}</div>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,.45) 100%)"}}/>
          <div className="tap" onClick={()=>setDetail(null)} style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
            <span style={{fontSize:18,color:"#fff"}}>â¹</span>
          </div>
          <div style={{position:"absolute",top:54,right:16}}>
            <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(12px)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#fff",fontWeight:700,fontFamily:FT}}>{isTour?detail.type?.toUpperCase():isMk?"ÐÐÐ¡Ð¢ÐÐ -ÐÐÐÐ¡Ð¡":"Ð¡ÐÐÐ«Ð¢ÐÐ"}</span>
            {toggleFav&&<div className="tap" onClick={()=>toggleFav(detail.id,detail.name_ru,detail.cover_emoji)} style={{marginLeft:8,width:32,height:32,borderRadius:16,background:"rgba(0,0,0,.2)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,color:favorites?.has(detail.id)?"#FF3B30":"rgba(255,255,255,.85)"}}>{favorites?.has(detail.id)?"â¥":"â¡"}</span></div>}
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
            <div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-.4px",lineHeight:1.15}}>{isTour?detail.name_ru:isMk?detail.name_ru:detail.name_ru}</div>
            {dur && <div style={{fontSize:13,color:"rgba(255,255,255,.7)",fontFamily:FT,marginTop:4}}>{dur}{maxP?" Â· Ð´Ð¾ "+maxP+" ÑÐµÐ».":""}{detail.rating?" Â· â "+detail.rating:""}</div>}
          </div>
        </div>
        <div style={{padding:"20px"}}>
          {/* Description */}
          <div style={{fontSize:15,color:"var(--label2)",fontFamily:FT,lineHeight:1.6,marginBottom:20}}>{detail.description_ru}</div>

          {/* Info chips */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {dur && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>â±</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{dur}</span></div>}
            {maxP && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>ð¥</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Ð´Ð¾ {maxP} ÑÐµÐ».</span></div>}
            {detail.rating && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>â­</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{detail.rating}</span></div>}
            {isMk && detail.min_age>0 && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>ð§</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Ð¾Ñ {detail.min_age} Ð»ÐµÑ</span></div>}
            {isMk && detail.location_ru && <div style={{padding:"8px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep)",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>ð</span><span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{detail.location_ru}</span></div>}
          </div>

          {/* Event specific: date */}
          {!isTour && !isMk && detail.starts_at && (
            <div style={{padding:"14px 16px",borderRadius:16,background:"var(--fill4)",border:"0.5px solid var(--sep)",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:24}}>ð</span>
              <div><div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FT}}>{new Date(detail.starts_at).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})}</div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{detail.location_ru}</div></div>
              {detail.is_free && <div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:8,background:"rgba(52,199,89,.1)"}}><span style={{fontSize:12,fontWeight:700,color:"#34C759",fontFamily:FT}}>ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾</span></div>}
            </div>
          )}

          {/* Booking section */}
          {price>0 && (
            <div style={{padding:"20px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-md)"}}>
              <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:14}}>ÐÐ°Ð¿Ð¸ÑÐ°ÑÑÑÑ</div>
              {/* Persons selector */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:"0.5px solid var(--sep)"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Ð£ÑÐ°ÑÑÐ½Ð¸ÐºÐ¾Ð²</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>1â{maxP||10} ÑÐµÐ»Ð¾Ð²ÐµÐº</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setPersons(Math.max(1,persons-1))} style={{width:34,height:34,borderRadius:17,background:persons>1?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:persons>1?"var(--label)":"var(--label4)"}}>â</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{persons}</span>
                  <div className="tap" onClick={()=>setPersons(Math.min(maxP||10,persons+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{price.toLocaleString("ru")} â½ Ã {persons} ÑÐµÐ».</span>
                <span style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{(price*persons).toLocaleString("ru")} â½</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"0.5px solid var(--sep)"}}>
                <span style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT}}>ÐÑÐ¾Ð³Ð¾</span>
                <span style={{fontSize:24,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(price*persons).toLocaleString("ru")} â½</span>
              </div>
              <div className="tap" onClick={()=>setShowBooking(true)} style={{marginTop:16,padding:"16px",borderRadius:16,background:color,textAlign:"center",boxShadow:"0 4px 16px "+color+"44"}}>
                <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>{isMk?"ÐÐ°Ð¿Ð¸ÑÐ°ÑÑÑÑ Ð½Ð° ÐÐ":"ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ"}</span>
              </div>
            </div>
          )}

          {showBooking && <BookingModal item={detail} type={detailType} total={price*persons} guests={persons} onClose={()=>setShowBooking(false)}/>}

          {/* Cross-sell */}
          <div style={{marginTop:16,borderRadius:16,padding:14,background:"rgba(0,122,255,.06)",border:"0.5px solid rgba(0,122,255,.15)"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--blue)",fontFamily:FT,marginBottom:4}}>Ð ÐµÐºÐ¾Ð¼ÐµÐ½Ð´ÑÐµÐ¼ Ðº Ð¿ÑÐ¾Ð¶Ð¸Ð²Ð°Ð½Ð¸Ñ</div>
            <div style={{display:"flex",gap:8}}>
              {["ð½ï¸ Ð£Ð¶Ð¸Ð½ Ð² ÑÐµÑÑÐ¾ÑÐ°Ð½Ðµ","ð§ Ð¡ÐÐ-Ð¿ÑÐ¾Ð³ÑÐ°Ð¼Ð¼Ð°","ðºï¸ Ð­ÐºÑÐºÑÑÑÐ¸Ñ"].map((t:string,i:number)=>(
                <span key={i} style={{padding:"4px 10px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep)",fontSize:12,color:"var(--label2)",fontFamily:FT}}>{t}</span>
              ))}
            </div>
          </div>
          {/* Phone */}
          <div className="tap" style={{marginTop:16,borderRadius:16,padding:"14px 16px",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:20}}>ð</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÐ¾Ð¿ÑÐ¾ÑÑ Ð¿Ð¾ ÑÑÑÐ°Ð¼</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>+7 (495) 023-43-49</div></div>
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
            <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>ÐÐ°ÑÐº</div>
            <div className="tap" onClick={()=>onProfile?onProfile():null} style={{visibility:"hidden",width:0,height:0,overflow:"hidden",position:"absolute",background:"linear-gradient(145deg,#1B3A2A,#2D5A3D)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.12)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#fff"/></svg>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 20px 14px",overflowX:"auto"}}>
          {[["tickets","ð«","ÐÐ¸Ð»ÐµÑÑ"],["tours","ð","Ð¢ÑÑÑ"],["mk","ð","ÐÐ°ÑÑÐµÑ-ÐºÐ»Ð°ÑÑÑ"],["events","ð","Ð¡Ð¾Ð±ÑÑÐ¸Ñ"],["excursions","ðºï¸","Ð­ÐºÑÐºÑÑÑÐ¸Ð¸"],["museums","ðï¸","ÐÑÐ·ÐµÐ¸"],["schedule","ð","Ð Ð°ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ"],["b2b","ð¤","ÐÐ»Ñ Ð³ÑÑÐ¿Ð¿"]].map(([id,ic,label])=>(
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
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>ÐÐ¸Ð»ÐµÑÑ Ð² Ð¿Ð°ÑÐº</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¸Ð¿ Ð±Ð¸Ð»ÐµÑÐ° Ð¸ Ð¿ÑÐ¸ÐµÐ·Ð¶Ð°Ð¹ÑÐµ</div>
          {tours.map((t:any,i:number)=>(
            <div key={t.id} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{t.name_ru||t.name}</div>
                  <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4,lineHeight:1.5}}>{t.description_ru||t.description||"ÐÑÐ¾Ð´Ð½Ð¾Ð¹ Ð±Ð¸Ð»ÐµÑ Ð² Ð¿Ð°ÑÐº Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ"}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                  <div style={{fontSize:22,fontWeight:700,color:"var(--green)",fontFamily:FD}}>{t.price||990} â½</div>
                  <div style={{padding:"2px 8px",borderRadius:8,background:"rgba(52,199,89,.1)",marginTop:4,display:"inline-block"}}><span style={{fontSize:10,fontWeight:600,color:"var(--green)",fontFamily:FT}}>+30 Ð¾ÑÐºÐ¾Ð²</span></div>
                </div>
              </div>
              <div className="tap" style={{marginTop:12,borderRadius:12,background:"var(--blue)",height:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>ÐÑÐ¿Ð¸ÑÑ Ð±Ð¸Ð»ÐµÑ</span>
              </div>
            </div>
          ))}
        </div>
      ) : sec==="tours" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{tours.length}</span> ÑÑÑÐ¾Ð² Ð¸ ÑÐºÑÐºÑÑÑÐ¸Ð¹</div>
          {tours.map((t:any,i:number)=>{
            const h = Math.floor(t.duration_minutes/60);
            const dur = t.duration_minutes>=1440?Math.floor(t.duration_minutes/1440)+" Ð´Ð½.":h>0?h+" Ñ.":t.duration_minutes+" Ð¼Ð¸Ð½.";
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
                        <div style={{fontSize:17,fontWeight:700,color:color,fontFamily:FD}}>{t.price.toLocaleString("ru")} â½</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:4}}>{dur} Â· Ð´Ð¾ {t.max_participants} ÑÐµÐ». Â· â {t.rating}</div>
                    <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:6,lineHeight:1.4}}>{t.description_ru?.slice(0,80)}...</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : sec==="mk" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{mk.length}</span> Ð¼Ð°ÑÑÐµÑ-ÐºÐ»Ð°ÑÑÐ¾Ð²</div>
          {mk.map((m:any,i:number)=>(
            <div key={m.id} className={"tap fu s"+Math.min(i+1,6)} onClick={()=>openDetail(m,"mk")}
              style={{borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-card)",marginBottom:14}}>
              <div style={{padding:"16px",display:"flex",gap:14}}>
                <div style={{width:56,height:56,borderRadius:16,background:"rgba(175,82,222,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{m.cover_emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{m.name_ru}</div>
                    <div style={{fontSize:16,fontWeight:700,color:"#AF52DE",fontFamily:FD,flexShrink:0}}>{m.price} â½</div>
                  </div>
                  <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:4}}>{m.location_ru} Â· {m.duration_min} Ð¼Ð¸Ð½. Â· +40 Ð¾ÑÐºÐ¾Ð²{m.min_age>0?" Â· Ð¾Ñ "+m.min_age+" Ð»ÐµÑ":""}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sec==="events" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{events.length}</span> ÑÐ¾Ð±ÑÑÐ¸Ð¹</div>
          {events.map((e:any,i:number)=>{
            const d = new Date(e.starts_at);
            const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
            const label = diff<=0?"Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ":diff===1?"ÐÐ°Ð²ÑÑÐ°":"Ð§ÐµÑÐµÐ· "+diff+" Ð´Ð½.";
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
                      {e.is_free ? <Bdg label="ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾" color="#34C759"/> : e.price>0 ? <Bdg label={e.price.toLocaleString("ru")+" â½"} color="var(--orange)"/> : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : sec==="excursions" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}>Ð¢ÐµÐ¼Ð°ÑÐ¸ÑÐµÑÐºÐ¸Ðµ ÑÐºÑÐºÑÑÑÐ¸Ð¸ Ð¿Ð¾ Ð¿Ð°ÑÐºÑ</div>
          {tours.length===0 && !loading && <div style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:8}}>ðºï¸</div><div style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Ð­ÐºÑÐºÑÑÑÐ¸Ð¸ Ð·Ð°Ð³ÑÑÐ¶Ð°ÑÑÑÑ...</div></div>}
          {tours.map((t:any,i:number)=>(
            <div key={t.id} className="tap" onClick={()=>openDetail(t,"tour")} style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{t.emoji||"ðºï¸"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{t.name_ru}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{t.duration_hours||2} Ñ. Â· Ð´Ð¾ {t.max_group||20} ÑÐµÐ».</div>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:"var(--green)",fontFamily:FT}}>{t.price} â½</div><div style={{padding:"2px 6px",borderRadius:8,background:"rgba(52,199,89,.1)",marginTop:2}}><span style={{fontSize:10,fontWeight:600,color:"var(--green)",fontFamily:FT}}>+30</span></div>
            </div>
          ))}
        </div>
      ) : sec==="schedule" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Ð Ð°ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ Ð½Ð° ÑÐµÐ³Ð¾Ð´Ð½Ñ</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Ð§ÑÐ¾ Ð¿ÑÐ¾Ð¸ÑÑÐ¾Ð´Ð¸Ñ Ð² Ð¿Ð°ÑÐºÐµ Ð¿ÑÑÐ¼Ð¾ ÑÐµÐ¹ÑÐ°Ñ</div>
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
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{s.title_ru||s.name_ru||"ÐÐµÑÐ¾Ð¿ÑÐ¸ÑÑÐ¸Ðµ"}</div>
                  {live && <div style={{padding:"1px 6px",borderRadius:6,background:"var(--green)"}}><span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:FT}}>LIVE</span></div>}
                </div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{s.location_ru||s.description_ru||""}</div>
              </div>
            </div>
          );})}
          {events.length===0 && !loading && <div style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:8}}>ð</div><div style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>Ð Ð°ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ Ð·Ð°Ð³ÑÑÐ¶Ð°ÐµÑÑÑ...</div></div>}
        </div>
      ) : sec==="museums" ? (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}>ÐÑÐ·ÐµÐ¸ Ð¸ Ð²ÑÑÑÐ°Ð²ÐºÐ¸ Ð­ÑÐ½Ð¾Ð¼Ð¸ÑÐ°</div>
          {events.length===0 && !loading && <div style={{textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:8}}>ðï¸</div><div style={{fontSize:15,color:"var(--label2)",fontFamily:FT}}>ÐÑÐ·ÐµÐ¸ Ð·Ð°Ð³ÑÑÐ¶Ð°ÑÑÑÑ...</div></div>}
          {events.map((s:any,i:number)=>(
            <div key={s.id} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{s.emoji||"ðï¸"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{s.name_ru}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{s.location_ru||"Ð£Ð»Ð¸ÑÐ° ÐÐ¸ÑÐ°"}</div>
              </div>
              {s.price>0 && <div style={{fontSize:14,fontWeight:700,color:"var(--orange)",fontFamily:FT}}>{s.price} â½</div>}
            </div>
          ))}
        </div>
      ) : null}

      {sec==='b2b' && (
        <div style={{padding:"0 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>ÐÐ»Ñ Ð³ÑÑÐ¿Ð¿</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>ÐÑÐ¾Ð³ÑÐ°Ð¼Ð¼Ñ Ð´Ð»Ñ Ð¾ÑÐ³Ð°Ð½Ð¸Ð·Ð¾Ð²Ð°Ð½Ð½ÑÑ Ð³ÑÑÐ¿Ð¿</div>
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
              <div className="tap" style={{borderRadius:10,background:"var(--blue)",height:40,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{submitContactRequest("b2b",item.t||"B2B");alert("ÐÐ°ÑÐ²ÐºÐ° Ð¾ÑÐ¿ÑÐ°Ð²Ð»ÐµÐ½Ð°! ÐÐµÐ½ÐµÐ´Ð¶ÐµÑ ÑÐ²ÑÐ¶ÐµÑÑÑ Ñ Ð²Ð°Ð¼Ð¸.");}}>
                <span style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>ÐÑÑÐ°Ð²Ð¸ÑÑ Ð·Ð°ÑÐ²ÐºÑ</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// âââ STAY âââââââââââââââââââââââââââââââââââââââââââââââââ
function StayTab({onSearch,favorites,toggleFav,onProfile,pendingSec,onClearPending}:{onSearch?:()=>void,favorites?:Set<string>,toggleFav?:(id:string)=>void,onProfile?:()=>void,pendingSec?:string,onClearPending?:()=>void}) {
  const [view, setView] = useState('hotels');
  useEffect(()=>{if(pendingSec){setView(pendingSec);onClearPending&&onClearPending();setTimeout(()=>{const el=document.getElementById("pill-"+pendingSec);/* no scroll */;},100);}},[pendingSec]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [re, setRe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [guestSvcs, setGuestSvcs] = useState<any[]>([]);
  const [booked, setBooked] = useState(false);

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

  const TYPE_LABEL: Record<string,string> = {spa:'SPA-Ð¾ÑÐµÐ»Ñ',glamping:'ÐÐ»ÑÐ¼Ð¿Ð¸Ð½Ð³',apart:'ÐÐ¿Ð°ÑÑ-Ð¾ÑÐµÐ»Ñ',cottage:'ÐÐ¾ÑÑÐµÐ´Ð¶Ð¸',ethno:'Ð­ÑÐ½Ð¾-Ð¾ÑÐµÐ»Ñ'};
  const TYPE_COLOR: Record<string,string> = {spa:'#E91E63',glamping:'#4CAF50',apart:'#2196F3',cottage:'#8D6E63',ethno:'#FF9800'};
  const HOTEL_GRAD = [['#1a3a5c','#0d2240'],['#2C5F41','#1B3A2A'],['#5D3A1A','#3E2510'],['#4A2D6B','#2E1A4A'],['#8B3A3A','#5C1A1A'],['#1a4a6e','#0d2b4a'],['#3d5a1a','#2a4010'],['#6b2d4a','#4a1a2e'],['#1a5a5a','#0d3a3a'],['#5a4a1a','#3a3010']];
  const RE_STATUS: Record<string,{l:string,c:string}> = {available:{l:'Ð Ð¿ÑÐ¾Ð´Ð°Ð¶Ðµ',c:'#34C759'},few_left:{l:'ÐÑÑÐ°Ð»Ð¾ÑÑ Ð¼Ð°Ð»Ð¾',c:'#FF9500'},reserved:{l:'ÐÑÐ¾Ð½Ñ',c:'#007AFF'},sold:{l:'ÐÑÐ¾Ð´Ð°Ð½Ð¾',c:'#FF3B30'}};
  const RE_TYPE: Record<string,{l:string,e:string}> = {apartment:{l:'ÐÐ¿Ð°ÑÑÐ°Ð¼ÐµÐ½ÑÑ',e:'ð¢'},villa:{l:'ÐÐ¸Ð»Ð»Ð°',e:'ð¡'},commercial:{l:'ÐÐ¾Ð¼Ð¼ÐµÑÑÐ¸Ñ',e:'ðª'}};
  const ratingLabel = (r:number) => r>=4.8?'ÐÑÐµÐ²Ð¾ÑÑÐ¾Ð´Ð½Ð¾':r>=4.5?'ÐÐµÐ»Ð¸ÐºÐ¾Ð»ÐµÐ¿Ð½Ð¾':r>=4.0?'ÐÑÐµÐ½Ñ ÑÐ¾ÑÐ¾ÑÐ¾':'Ð¥Ð¾ÑÐ¾ÑÐ¾';
  const amenityIcon = (a:string) => {
    const m: Record<string,string> = {'Wi-Fi':'ð¶','ÐÐ°ÑÐºÐ¾Ð²ÐºÐ°':'ð¿ï¸','ÐÑÑÐ½Ñ':'ð³','ÐÐ°Ð¼Ð¸Ð½':'ð¥','ÐÐ°ÑÑÐµÐ¹Ð½':'ð','Ð¡ÐÐ':'ð','Ð¥Ð°Ð¼Ð¼Ð°Ð¼':'ð§','ÐÐ°ÑÑÐ°Ð¶':'ð','ÐÐ¾Ð½Ð´Ð¸ÑÐ¸Ð¾Ð½ÐµÑ':'âï¸','ÐÐ°Ð»ÐºÐ¾Ð½':'ð','Ð ÐµÑÑÐ¾ÑÐ°Ð½':'ð½ï¸','ÐÐ°Ð²ÑÑÐ°Ðº':'â','Ð¥Ð¾Ð»Ð¾Ð´Ð¸Ð»ÑÐ½Ð¸Ðº':'ð§','Ð§Ð°Ð¹Ð½Ð¸Ðº':'â','ÐÐ°Ð½Ñ':'â¨ï¸','ÐÐµÑÑÐºÐ°Ñ':'ð§'};
    for (const [k,v] of Object.entries(m)) { if (a.includes(k)) return v; }
    return 'â';
  };

  return (
    <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)',maxWidth:'100%'}}>
      {/* HEADER */}
      <div style={{background:'var(--bg)'}}>
        <div style={{padding:'54px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.8px'}}>ÐÐ¸Ð»ÑÑ</div>
            <div className="tap" onClick={()=>onProfile&&onProfile()} style={{visibility:"hidden",width:0,height:0,overflow:"hidden",position:"absolute",background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',boxShadow:'0 1px 4px rgba(0,0,0,0.12)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#fff"/></svg>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px'}}>
          {[['hotels','ð¨','ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ'],['guest','ðï¸','ÐÐ¾ÑÑÑ'],['re','ðï¸','ÐÐµÐ´Ð²Ð¸Ð¶Ð¸Ð¼Ð¾ÑÑÑ']].map(([id,ic,label])=>(
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
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>Ð£ÑÐ»ÑÐ³Ð¸ Ð´Ð»Ñ Ð³Ð¾ÑÑÐµÐ¹</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:16}}>Ð£Ð¿ÑÐ°Ð²Ð»ÑÐ¹ÑÐµ Ð¿ÑÐ¾Ð¶Ð¸Ð²Ð°Ð½Ð¸ÐµÐ¼ Ð¸Ð· Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ</div>
          {guestSvcs.map((gs:any)=>({icon:gs.cover_emoji,t:gs.title,d:gs.description_ru,time:gs.estimated_time||'',b:gs.bonus_points?"+"+gs.bonus_points:''})).map((item:any,j:number)=>(
            <div key={j} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{item.t}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{item.d}</div>
                <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:2}}>â± {item.time}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <div style={{padding:"3px 8px",borderRadius:8,background:"rgba(52,199,89,.1)"}}><span style={{fontSize:11,fontWeight:600,color:"var(--green)",fontFamily:FT}}>{item.b}</span></div>
                <span onClick={(ev:any)=>{ev.stopPropagation();submitContactRequest('guest',item.t);alert('ÐÐ°ÑÐ²ÐºÐ° Ð¾ÑÐ¿ÑÐ°Ð²Ð»ÐµÐ½Ð°!');}} style={{fontSize:17,color:"var(--label4)",cursor:'pointer'}}>âº</span>
              </div>
            </div>
          ))}
          <div style={{padding:14,borderRadius:14,background:"rgba(0,122,255,.06)",border:"0.5px solid rgba(0,122,255,.12)",marginTop:4}}>
            <div style={{fontSize:13,color:"var(--blue)",fontFamily:FT,textAlign:"center"}}>ÐÐ¾ÑÑÑÐ¿Ð½Ð¾ Ð´Ð»Ñ Ð³Ð¾ÑÑÐµÐ¹ Ñ Ð°ÐºÑÐ¸Ð²Ð½ÑÐ¼ Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸ÐµÐ¼</div>
          </div>
        </div>
      ) : selectedHotel ? (
        /* âââ HOTEL DETAIL VIEW âââ */
        <div style={{padding:"0"}}>
          {/* Back + Hero */}
          <div style={{position:"relative",height:220,background:"linear-gradient(145deg,#1a3a5c,#0d2240)"}}>
            <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"radial-gradient(circle at 30% 40%, white 1px, transparent 1px)",backgroundSize:"40px 40px"}}/>
            <div className="tap" onClick={()=>setSelectedHotel(null)}
              style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
              <span style={{fontSize:18,color:"#fff"}}>â¹</span>
            </div>
            <div style={{position:"absolute",top:54,right:16,display:"flex",gap:8}}>
              <div style={{width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:16}}>â¡</span>
              </div>
              <div style={{width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:14}}>â</span>
              </div>
            </div>
            {/* Rating badge */}
            <div style={{position:"absolute",bottom:16,right:16,display:"flex",alignItems:"center",gap:8}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:FT}}>{parseFloat(selectedHotel.rating)>=4.8?"ÐÑÐµÐ²Ð¾ÑÑÐ¾Ð´Ð½Ð¾":parseFloat(selectedHotel.rating)>=4.5?"ÐÐµÐ»Ð¸ÐºÐ¾Ð»ÐµÐ¿Ð½Ð¾":"ÐÑÐµÐ½Ñ ÑÐ¾ÑÐ¾ÑÐ¾"}</div>
              </div>
              <div style={{width:40,height:40,borderRadius:"12px 12px 12px 2px",background:"#003580",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:FD}}>{(parseFloat(selectedHotel.rating)*2).toFixed(1)}</span>
              </div>
            </div>
            <div style={{position:"absolute",bottom:16,left:16}}>
              <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(12px)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#fff",fontWeight:700,fontFamily:FT}}>{selectedHotel.rooms_count} Ð½Ð¾Ð¼ÐµÑÐ¾Ð²</span>
            </div>
          </div>
          <div style={{padding:"20px"}}>
            {/* Name + type */}
            <div style={{fontSize:26,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.2}}>{selectedHotel.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
              <span style={{fontSize:12}}>ð</span>
              <span style={{fontSize:14,color:"var(--blue)",fontFamily:FT,fontWeight:500}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ Â· ÐÐ°Ð»ÑÐ¶ÑÐºÐ°Ñ Ð¾Ð±Ð».</span>
            </div>
            {/* Description */}
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:14,lineHeight:1.55}}>{selectedHotel.description}</div>
            {/* Amenities full list */}
            <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,marginTop:20,marginBottom:10}}>Ð£Ð´Ð¾Ð±ÑÑÐ²Ð°</div>
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
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>ÐÐ°ÐµÐ·Ð´</div>
                <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginTop:4}}>{selectedHotel.check_in}</div>
              </div>
              <div style={{flex:1,padding:"14px",borderRadius:16,background:"var(--bg)",border:"0.5px solid var(--sep-opaque)",textAlign:"center"}}>
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>ÐÑÐµÐ·Ð´</div>
                <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginTop:4}}>{selectedHotel.check_out}</div>
              </div>
            </div>
            {selectedHotel.allows_pets && <div style={{marginTop:10,padding:"10px 14px",borderRadius:12,background:"rgba(52,199,89,.06)",border:"0.5px solid rgba(52,199,89,.15)",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>ð¾</span>
              <span style={{fontSize:13,fontWeight:600,color:"#34C759",fontFamily:FT}}>ÐÐ¾Ð¶Ð½Ð¾ Ñ Ð´Ð¾Ð¼Ð°ÑÐ½Ð¸Ð¼Ð¸ Ð¿Ð¸ÑÐ¾Ð¼ÑÐ°Ð¼Ð¸</span>
            </div>}
            {/* Included */}
            <div style={{marginTop:16,padding:"16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:10}}>ÐÐºÐ»ÑÑÐµÐ½Ð¾ Ð² ÑÑÐ¾Ð¸Ð¼Ð¾ÑÑÑ</div>
              {["ÐÑÐ¾Ð´Ð½ÑÐµ Ð±Ð¸Ð»ÐµÑÑ Ð² Ð¿Ð°ÑÐº Ð½Ð° Ð²ÑÐµ Ð´Ð½Ð¸","ÐÐ°ÑÐºÐ¾Ð²ÐºÐ° Ð½Ð° ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸","Ð Ð°Ð·Ð²Ð»ÐµÐºÐ°ÑÐµÐ»ÑÐ½Ð°Ñ Ð¿ÑÐ¾Ð³ÑÐ°Ð¼Ð¼Ð°","Wi-Fi Ð½Ð° Ð²ÑÐµÐ¹ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸"].map((it,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:i<3?"0.5px solid var(--fill3)":"none"}}>
                  <span style={{fontSize:13,color:"#34C759"}}>â</span>
                  <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{it}</span>
                </div>
              ))}
            </div>
            {/* Booking section */}
            <div style={{marginTop:20,padding:"20px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-md)"}}>
              <div style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD,marginBottom:14}}>ÐÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ðµ</div>
              {/* Nights selector */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÐ¾ÑÐµÐ¹</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>1â14 Ð½Ð¾ÑÐµÐ¹</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setNights(Math.max(1,nights-1))} style={{width:34,height:34,borderRadius:17,background:nights>1?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:nights>1?"var(--label)":"var(--label4)"}}>â</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{nights}</span>
                  <div className="tap" onClick={()=>setNights(Math.min(14,nights+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              {/* Guests selector */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:16,borderBottom:"0.5px solid var(--sep)"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÐ¾ÑÑÐµÐ¹</div><div style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>1â6 ÑÐµÐ»Ð¾Ð²ÐµÐº</div></div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="tap" onClick={()=>setGuests(Math.max(1,guests-1))} style={{width:34,height:34,borderRadius:17,background:guests>1?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:guests>1?"var(--label)":"var(--label4)"}}>â</span></div>
                  <span style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,minWidth:24,textAlign:"center"}}>{guests}</span>
                  <div className="tap" onClick={()=>setGuests(Math.min(6,guests+1))} style={{width:34,height:34,borderRadius:17,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:600,color:"#fff"}}>+</span></div>
                </div>
              </div>
              {/* Price calculation */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{selectedHotel.price_from?.toLocaleString("ru")} â½ Ã {nights} Ð½Ð¾Ñ.</span>
                <span style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{(selectedHotel.price_from*nights)?.toLocaleString("ru")} â½</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>ÐÐ¸Ð»ÐµÑÑ Ð² Ð¿Ð°ÑÐº (Ð²ÐºÐ».)</span>
                <span style={{fontSize:14,fontWeight:600,color:"#34C759",fontFamily:FT}}>0 â½</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"0.5px solid var(--sep)"}}>
                <span style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT}}>ÐÑÐ¾Ð³Ð¾</span>
                <span style={{fontSize:24,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(selectedHotel.price_from*nights)?.toLocaleString("ru")} â½</span>
              </div>
              {/* Book button */}
              <div className="tap" onClick={()=>setBooked(true)} style={{marginTop:16,padding:"16px",borderRadius:16,background:"#003580",textAlign:"center",boxShadow:"0 4px 16px rgba(0,53,128,.3)"}}>
                <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ</span>
              </div>
              <div style={{textAlign:"center",marginTop:8}}>
                <span style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð°Ñ Ð¾ÑÐ¼ÐµÐ½Ð° Ð·Ð° 48 ÑÐ°ÑÐ¾Ð²</span>
              </div>
            </div>
            {/* Phone help */}
            <div className="tap" style={{marginTop:16,borderRadius:16,padding:"14px 16px",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:20}}>ð</span>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÐ¾Ð¼Ð¾ÑÑ Ñ Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸ÐµÐ¼</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>+7 (495) 023-43-49 Â· 9:00â21:00</div></div>
              <Chev/>
            </div>
          </div>
          {booked && <BookingModal item={{...selectedHotel,_nights:nights}} type="hotel" total={selectedHotel.price_from*nights} guests={guests} onClose={()=>setBooked(false)}/>}
        </div>
      ) : loading ? <Spinner/> : view==='hotels' ? (
        <div style={{padding:'14px 20px'}}>
          {/* SEARCH BAR */}
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)',padding:'14px 16px',marginBottom:16}}>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:16}}>ð</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>ÐÐ°ÑÑ Ð¿ÑÐ¾Ð¶Ð¸Ð²Ð°Ð½Ð¸Ñ</div>
                <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:1}}>ÐÐ°ÐµÐ·Ð´ 14:00 Â· ÐÑÐµÐ·Ð´ 12:00</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>ÐÐ°ÐµÐ·Ð´</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginTop:2}}>ÐÑÐ±ÑÐ°ÑÑ</div>
              </div>
              <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>ÐÑÐµÐ·Ð´</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginTop:2}}>ÐÑÐ±ÑÐ°ÑÑ</div>
              </div>
              <div style={{width:70,padding:'10px 8px',borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)',textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>ÐÐ¾ÑÑÐ¸</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT,marginTop:2}}>2</div>
              </div>
            </div>
          </div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}>ÐÐ°Ð¹Ð´ÐµÐ½Ð¾ <span style={{fontWeight:700,color:'var(--label)'}}>{hotels.length}</span> Ð²Ð°ÑÐ¸Ð°Ð½ÑÐ¾Ð² ÑÐ°Ð·Ð¼ÐµÑÐµÐ½Ð¸Ñ</div>

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
                <div style={{height:180,background:`linear-gradient(145deg,${g[0]},${g[1]})`,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',inset:0,opacity:.06,backgroundImage:'radial-gradient(circle at 30% 40%, white 1px, transparent 1px),radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',backgroundSize:'40px 40px'}}/>
                  {toggleFav && <div className="tap" onClick={(e:any)=>{e.stopPropagation();toggleFav(h.id);}} style={{position:'absolute',top:14,right:14,width:32,height:32,borderRadius:16,background:'rgba(0,0,0,.2)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}><span style={{fontSize:16,color:favorites?.has(h.id)?"#FF3B30":"rgba(255,255,255,.85)"}}>{favorites?.has(h.id)?"â¥":"â¡"}</span></div>}
                  <div style={{position:'absolute',top:14,left:14,display:'flex',gap:6}}>
                    <span style={{background:tc,borderRadius:6,padding:'4px 10px',fontSize:11,color:'#fff',fontWeight:700,fontFamily:FT,letterSpacing:'.2px'}}>{TYPE_LABEL[h.type]||h.type}</span>
                    {rScore>=4.8 && <span style={{background:'rgba(255,255,255,.18)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',borderRadius:6,padding:'4px 10px',fontSize:11,color:'#fff',fontWeight:700,fontFamily:FT}}>â­ Ð¢Ð¾Ð¿</span>}
                  </div>
                  <div style={{position:'absolute',top:14,right:14,display:'flex',alignItems:'center',gap:8}}>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>{ratingLabel(rScore)}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.65)',fontFamily:FT}}>{h.rooms_count} Ð½Ð¾Ð¼ÐµÑÐ¾Ð²</div>
                    </div>
                    <div style={{width:38,height:38,borderRadius:'10px 10px 10px 2px',background:'#003580',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FD}}>{rDisp}</span>
                    </div>
                  </div>
                  <div className="tap" style={{position:'absolute',bottom:14,right:14,width:34,height:34,borderRadius:17,background:'rgba(0,0,0,.3)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:16}}>â¡</span>
                  </div>
                  <div style={{position:'absolute',bottom:14,left:14,background:'rgba(0,0,0,.45)',backdropFilter:'blur(8px)',borderRadius:8,padding:'4px 10px',display:'flex',alignItems:'center',gap:4}}>
                    <span style={{fontSize:11,color:'#fff',fontFamily:FT}}>ð· Ð¤Ð¾ÑÐ¾ ÑÐºÐ¾ÑÐ¾</span>
                  </div>
                </div>
                {/* Content */}
                <div style={{padding:'16px'}}>
                  <div style={{fontSize:20,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',lineHeight:1.2}}>{h.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:4,marginTop:5}}>
                    <span style={{fontSize:12}}>ð</span>
                    <span style={{fontSize:13,color:'var(--blue)',fontFamily:FT,fontWeight:500}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ Â· ÐÐ°Ð»ÑÐ¶ÑÐºÐ°Ñ Ð¾Ð±Ð».</span>
                  </div>
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:8,lineHeight:1.45}}>{h.description?.slice(0,110)}{h.description?.length>110?'â¦':''}</div>
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
                      <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>ÐÐ°ÐµÐ·Ð´</span>
                      <span style={{fontSize:12,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{h.check_in}</span>
                    </div>
                    <div style={{width:'0.5px',background:'var(--sep)'}}/>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>ÐÑÐµÐ·Ð´</span>
                      <span style={{fontSize:12,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{h.check_out}</span>
                    </div>
                    {h.allows_pets && <>
                      <div style={{width:'0.5px',background:'var(--sep)'}}/>
                      <span style={{fontSize:11,color:'#34C759',fontWeight:600,fontFamily:FT}}>ð¾ Ð¡ Ð¿Ð¸ÑÐ¾Ð¼ÑÐ°Ð¼Ð¸</span>
                    </>}
                  </div>
                  <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:14,paddingTop:14,borderTop:'0.5px solid var(--sep)'}}>
                    <div>
                      <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Ð¾Ñ</div>
                      <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                        <span style={{fontSize:26,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.5px'}}>{h.price_from?.toLocaleString('ru')}</span>
                        <span style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>â½</span>
                      </div>
                      <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Ð·Ð° Ð½Ð¾ÑÑ Â· Ð²ÐºÐ». Ð±Ð¸Ð»ÐµÑÑ Ð² Ð¿Ð°ÑÐº</div>
                    </div>
                    <div className="tap" onClick={()=>setSelectedHotel(h)} style={{padding:'13px 24px',borderRadius:14,background:'#003580',boxShadow:'0 2px 8px rgba(0,53,128,.3)',cursor:'pointer'}}>
                      <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>ÐÑÐ±ÑÐ°ÑÑ</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)',padding:'16px',marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT,marginBottom:10}}>ÐÐºÐ»ÑÑÐµÐ½Ð¾ Ð² ÑÑÐ¾Ð¸Ð¼Ð¾ÑÑÑ Ð¿ÑÐ¾Ð¶Ð¸Ð²Ð°Ð½Ð¸Ñ</div>
            {['ÐÑÐ¾Ð´Ð½ÑÐµ Ð±Ð¸Ð»ÐµÑÑ Ð² Ð¿Ð°ÑÐº Ð½Ð° Ð²ÑÐµ Ð´Ð½Ð¸ Ð¿ÑÐ¾Ð¶Ð¸Ð²Ð°Ð½Ð¸Ñ','ÐÐ°ÑÐºÐ¾Ð²ÐºÐ° Ð½Ð° ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸ Ð¿Ð°ÑÐºÐ°','Ð Ð°Ð·Ð²Ð»ÐµÐºÐ°ÑÐµÐ»ÑÐ½Ð°Ñ Ð¿ÑÐ¾Ð³ÑÐ°Ð¼Ð¼Ð°','Wi-Fi Ð½Ð° Ð²ÑÐµÐ¹ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸','ÐÐµÑÑÐºÐ¸Ðµ Ð¿Ð»Ð¾ÑÐ°Ð´ÐºÐ¸ Ð¸ Ð¾Ð±Ñ. Ð·Ð¾Ð½Ñ'].map((it,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'center',padding:'6px 0',borderBottom:i<4?'0.5px solid var(--fill3)':'none'}}>
                <span style={{fontSize:14,color:'#34C759'}}>â</span>
                <span style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>{it}</span>
              </div>
            ))}
          </div>
          <div className="tap" style={{borderRadius:16,background:'linear-gradient(145deg,#003580,#00224e)',padding:'18px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.1}}>ð</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>ÐÑÐ¶Ð½Ð° Ð¿Ð¾Ð¼Ð¾ÑÑ Ñ Ð²ÑÐ±Ð¾ÑÐ¾Ð¼?</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.65)',fontFamily:FT,marginTop:4}}>ÐÐ¾Ð·Ð²Ð¾Ð½Ð¸ÑÐµ: +7 (495) 023-43-49</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:2}}>ÐÐ¶ÐµÐ´Ð½ÐµÐ²Ð½Ð¾ 9:00â21:00</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 20px',overflow:"hidden",width:"100%",boxSizing:"border-box"}}>
          <div style={{borderRadius:16,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'16px',marginBottom:16,position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.12)'}}>
            <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.06}}>ðï¸</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>Ethnomir DEVELOPMENT</div>
              <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4,letterSpacing:'-.3px'}}>ÐÐ½Ð²ÐµÑÑÐ¸ÑÑÐ¹ Ð² Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:6,lineHeight:1.4}}>ÐÐ¿Ð°ÑÑÐ°Ð¼ÐµÐ½ÑÑ, Ð²Ð¸Ð»Ð»Ñ Ð¸ ÐºÐ¾Ð¼Ð¼ÐµÑÑÐµÑÐºÐ¸Ðµ Ð¿Ð»Ð¾ÑÐ°Ð´Ð¸ Ð² ÑÐ½Ð¸ÐºÐ°Ð»ÑÐ½Ð¾Ð¼ Ð¿Ð°ÑÐºÐµ</div>
              <div style={{display:'flex',gap:16,marginTop:14,flexWrap:"wrap"}}>
                {[['ROI','Ð´Ð¾ 22%'],['ÐÐ°ÐµÐ·Ð´','2026'],['ÐÐ¾ÑÐ¾Ð´','Ð¾Ñ 83Kâ½/Ð¼ÐµÑ']].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:"var(--label)"}}>{re.length}</span> Ð¾Ð±ÑÐµÐºÑÐ¾Ð² Ð² Ð¿ÑÐ¾Ð´Ð°Ð¶Ðµ</div>
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
            {re.map((r:any,i:number)=>{
              const rt=RE_TYPE[r.type]||RE_TYPE.apartment;
              return (
                <div key={r.id} className="tap" style={{display:"flex",gap:14,padding:"14px 16px",borderBottom:i<re.length-1?"0.5px solid var(--sep)":"none",alignItems:"center"}}>
                  <div style={{width:48,height:48,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:24}}>{rt.e}</span></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name_ru}</div>
                    <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{r.area_m2} Ð¼Â² Â· {r.rooms||1} ÐºÐ¾Ð¼Ð½.</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{(r.price/1000000).toFixed(1)} Ð¼Ð»Ð½</div>
                    <div style={{fontSize:10,color:"var(--green)",fontFamily:FT,marginTop:2}}>ROI {r.roi_percent||18}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="tap" onClick={()=>window.open("tel:+74950234349")} style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:"14px 16px",marginTop:12,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:40,height:40,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>ð</span></div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÑÐ¶Ð½Ð° Ð¿Ð¾Ð¼Ð¾ÑÑ Ñ Ð²ÑÐ±Ð¾ÑÐ¾Ð¼?</div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>+7 (495) 023-43-49 Â· 9:00â21:00</div>
            </div>
            <span style={{fontSize:17,color:"var(--label4)"}}>âº</span>
          </div>
        </div>
      )}
    </div>
  );
}

// âââ SERVICES âââââââââââââââââââââââââââââââââââââââââââââ
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
      sb('restaurants','select=id,name_ru,cover_emoji,avg_check,rating&active=eq.true&order=rating.desc').then(d=>{setGastroRests(d||[]);setLoading(false);});
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
    sb("menu_items","select=*&restaurant_id=eq."+r.id+"&is_available=eq.true&order=sort_order.asc").then(d=>setFullMenu(d&&d.length>0?d:[{id:"empty",name_ru:"ÐÐµÐ½Ñ Ð¾Ð±Ð½Ð¾Ð²Ð»ÑÐµÑÑÑ",price:0}]));
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
                <div style={{fontSize:16,fontWeight:700,color:sc,fontFamily:FD}}>{s.price_from>=1000?(s.price_from/1000).toFixed(s.price_from%1000?1:0)+'K':s.price_from} â½</div>
              </div>}
            </div>
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{isExp ? s.description_ru : (s.description_ru?.slice(0,80)+(s.description_ru?.length>80?'...':''))}</div>
            <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8,flexWrap:'wrap'}}>
              {s.location_ru && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>ð {s.location_ru}</span>}
              {s.duration_text && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>â± {s.duration_text}</span>}
              {s.status_text && <span style={{fontSize:11,fontWeight:600,color:'#34C759',fontFamily:FT}}>â {s.status_text}</span>}
            </div>
            {isExp && (
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <div className="tap" onClick={(e:any)=>{e.stopPropagation();setBookingService(s);}} style={{flex:1,padding:'11px',borderRadius:14,background:sc,textAlign:'center'}}>
                  <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>{s.price_from>=10000?'ÐÑÑÐ°Ð²Ð¸ÑÑ Ð·Ð°ÑÐ²ÐºÑ':'ÐÐ°Ð¿Ð¸ÑÐ°ÑÑÑÑ'}</span>
                </div>
                <div className="tap" onClick={(e:any)=>{e.stopPropagation();toggleFav(s.id,s.name_ru,s.cover_emoji);}} style={{width:44,height:44,borderRadius:14,background:favorites.has(s.id)?'rgba(255,59,48,.08)':'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:18}}>{favorites.has(s.id)?'â¤ï¸':'ð¤'}</span>
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
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.8px'}}>Ð£ÑÐ»ÑÐ³Ð¸</div>
            <div className="tap" onClick={()=>onProfile&&onProfile()} style={{visibility:"hidden",width:0,height:0,overflow:"hidden",position:"absolute",background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',boxShadow:'0 1px 4px rgba(0,0,0,0.12)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#fff"/></svg>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px',overflowX:'auto'}}>
          {[['delivery','ðµ','ÐÐ¾ÑÑÐ°Ð²ÐºÐ°'],['food','ð½ï¸','Ð ÐµÑÑÐ¾ÑÐ°Ð½Ñ'],['shops','ðï¸','ÐÐ°Ð³Ð°Ð·Ð¸Ð½Ñ'],['banya','ð§','ÐÐ°Ð½Ð¸ Ð¸ Ð¡ÐÐ'],['fun','ð¡','Ð Ð°Ð·Ð²Ð»ÐµÑÐµÐ½Ð¸Ñ'],['rental','ð²','ÐÑÐ¾ÐºÐ°Ñ'],['other','ð¯','Ð­ÐºÑÐºÑÑÑÐ¸Ð¸'],['gastro','ð','ÐÐ°ÑÑÑÐ¾'],['reviews','â­','ÐÑÐ·ÑÐ²Ñ']].map(([id,ic,label])=>(
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
            <div style={{position:'absolute',right:-20,top:-20,fontSize:120,opacity:.1}}>ð½ï¸</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.6)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px'}}>ÐÐ°ÑÑÑÐ¾-Ð¿Ð°ÑÐ¿Ð¾ÑÑ</div>
              <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4,letterSpacing:'-.5px'}}>0 / {gastroRests.length}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:2}}>ÑÐµÑÑÐ¾ÑÐ°Ð½Ð¾Ð² Ð¿Ð¾ÑÐµÑÐµÐ½Ð¾</div>
              <div style={{marginTop:12,height:6,borderRadius:3,background:'rgba(255,255,255,.2)'}}><div style={{height:6,borderRadius:3,background:'#fff',width:'0%',transition:'width .5s'}}/></div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:6}}>ÐÐ¾ÑÐµÑÐ¸ÑÐµ Ð²ÑÐµ 15 Ð¸ Ð¿Ð¾Ð»ÑÑÐ¸ÑÐµ Ð·Ð½Ð°ÑÐ¾Ðº Â«ÐÑÑÐ¼Ð°Ð½Â» + 500 Ð¾ÑÐºÐ¾Ð²</div>
            </div>
          </div>
          <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.3px',marginBottom:12}}>Ð ÐµÑÑÐ¾ÑÐ°Ð½Ñ Ð¿Ð°ÑÐºÐ°</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>{gastroRests.map((r:any,i:number)=>(<div key={r.id} className={"tap fu s"+Math.min(i+1,6)} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:12,textAlign:'center',boxShadow:'var(--shadow-sm)',position:'relative'}}><div style={{fontSize:32,marginBottom:6}}>{r.cover_emoji}</div><div style={{fontSize:11,fontWeight:600,color:'var(--label)',fontFamily:FT,lineHeight:1.3}}>{(r.name_ru||'').replace(/Ð ÐµÑÑÐ¾ÑÐ°Ð½ |ÐÐ°ÑÐµ |ÐÐ°ÑÐµ-Ð¿ÐµÐºÐ°ÑÐ½Ñ |Ð ÐµÑÑÐ¾ÑÐ°Ð½-Ð¿Ð¸ÑÑÐµÑÐ¸Ñ |Ð ÐµÑÑÐ¾ÑÐ°Ð½ Ð¸ ÐºÐ°ÑÐ°Ð¾ÐºÐµ |Ð§Ð°Ð¹Ð½Ð°Ñ /g,'').replace(/[Â«Â»]/g,'')}</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,marginTop:2}}>â­ {r.rating}</div><div style={{position:'absolute',top:6,right:6,width:20,height:20,borderRadius:10,border:'2px solid var(--sep)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:10,color:'var(--sep)'}}>â</span></div></div>))}</div>
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:16}}><div style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FT,marginBottom:10}}>ÐÐ°Ðº ÑÑÐ¾ ÑÐ°Ð±Ð¾ÑÐ°ÐµÑ</div>{[['ð±','ÐÐ¾ÐºÐ°Ð¶Ð¸ÑÐµ QR','ÐÑÐºÑÐ¾Ð¹ÑÐµ Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ Ð¸ Ð¿Ð¾ÐºÐ°Ð¶Ð¸ÑÐµ QR Ð¾ÑÐ¸ÑÐ¸Ð°Ð½ÑÑ'],['â','ÐÐ¾Ð»ÑÑÐ¸ÑÐµ ÑÑÐ°Ð¼Ð¿','Ð¨ÑÐ°Ð¼Ð¿ Ð¿Ð¾ÑÐ²Ð¸ÑÑÑ Ð°Ð²ÑÐ¾Ð¼Ð°ÑÐ¸ÑÐµÑÐºÐ¸'],['ð','Ð¡Ð¾Ð±ÐµÑÐ¸ÑÐµ Ð²ÑÐµ','30 Ð¾ÑÐºÐ¾Ð² Ð·Ð° ÐºÐ°Ð¶Ð´ÑÐ¹, 500 Ð±Ð¾Ð½ÑÑ Ð·Ð° Ð²ÑÐµ 15']].map(([ic,t,d]:any,i:number)=>(<div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<2?10:0}}><div style={{width:36,height:36,borderRadius:10,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{ic}</div><div><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{t}</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{d}</div></div></div>))}</div>
        </div>
      ) : sec==='reviews' ? (
        <div style={{padding:'0 20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}><span style={{fontWeight:700,color:'var(--label)'}}>{allReviews.length}</span> Ð¾ÑÐ·ÑÐ²Ð¾Ð²</div>
            <div className="tap" onClick={()=>setShowReviewForm(true)} style={{padding:'7px 16px',borderRadius:20,background:'#007AFF'}}>
              <span style={{fontSize:13,fontWeight:600,color:'#fff',fontFamily:FT}}>ÐÐ°Ð¿Ð¸ÑÐ°ÑÑ Ð¾ÑÐ·ÑÐ²</span>
            </div>
          </div>
          {allReviews.map((rv:any,i:number)=>{const stars='â'.repeat(rv.rating)+'â'.repeat(5-rv.rating);const ago=Math.ceil((Date.now()-new Date(rv.created_at).getTime())/86400000);const agoText=ago<=0?'ÑÐµÐ³Ð¾Ð´Ð½Ñ':ago===1?'Ð²ÑÐµÑÐ°':ago+' Ð´Ð½. Ð½Ð°Ð·Ð°Ð´';return(<div key={rv.id} className={"fu s"+Math.min(i+1,6)} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14,marginBottom:10,boxShadow:'var(--shadow-sm)'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><div style={{width:36,height:36,borderRadius:18,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{rv.author_emoji||'ð¤'}</div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{rv.author_name||'ÐÐ¾ÑÑÑ'}</div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>{agoText}</div></div><div style={{fontSize:13,color:'var(--orange)',letterSpacing:1}}>{stars}</div></div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5,marginBottom:6}}>{rv.comment}</div><span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'2px 8px',borderRadius:8}}>{rv.item_name}</span></div>);})}
          {allReviews.length===0&&!loading&&<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>â­</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>ÐÑÐ·ÑÐ²Ð¾Ð² Ð¿Ð¾ÐºÐ° Ð½ÐµÑ</div></div>}
        </div>
      ) : sec==='partner' ? (
        <div style={{padding:'14px 20px',overflow:"hidden",width:"100%",boxSizing:"border-box"}}>
          <div style={{borderRadius:16,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'16px',marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.06}}>ð¤</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>Ethnomir BUSINESS</div>
              <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4}}>ÐÐ°ÑÑÐ½ÑÑÑÑÐ²Ð¾</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:6,lineHeight:1.4}}>Ð¤ÑÐ°Ð½ÑÐ¸Ð·Ð° Â· ÐÑÐµÐ½Ð´Ð° Â· ÐÐ½Ð²ÐµÑÑÐ¸ÑÐ¸Ð¸ Â· Ð¡Ð²Ð¾Ð¹ Ð±Ð¸Ð·Ð½ÐµÑ Ð² Ð¿Ð°ÑÐºÐµ</div>
            </div>
          </div>
          {partner.map((p:any,i:number)=>{
            const isExp = expId === p.id;
            return (
              <div key={p.id} className={`tap fu s${Math.min(i+1,6)}`} onClick={()=>setExpId(isExp?null:p.id)}
                style={{borderRadius:30,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
                <div style={{padding:'16px',display:'flex',gap:14}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'linear-gradient(145deg,#0d1b2a22,#1a3a5c22)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{p.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{p.name_ru}</div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{p.description_ru}</div>
                    {p.investment_from && <div style={{display:'flex',gap:12,marginTop:10}}>
                      <div><div style={{fontSize:15,fontWeight:700,color:'var(--blue)',fontFamily:FD}}>Ð¾Ñ {p.investment_from>=1000000?(p.investment_from/1000000)+'M':(p.investment_from/1000)+'K'} â½</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>ÐÐ½Ð²ÐµÑÑÐ¸ÑÐ¸Ð¸</div></div>
                      {p.roi_percent && <div><div style={{fontSize:15,fontWeight:700,color:'#34C759',fontFamily:FD}}>{p.roi_percent}%</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>ROI</div></div>}
                    </div>}
                    {isExp && (p.benefits||[]).length>0 && (
                      <div style={{marginTop:12,padding:'12px',borderRadius:14,background:'var(--bg)',border:'0.5px solid var(--sep)'}}>
                        {(p.benefits||[]).map((b:string,j:number)=>(
                          <div key={j} style={{display:'flex',gap:6,alignItems:'center',padding:'4px 0'}}>
                            <span style={{fontSize:12,color:'#34C759'}}>â</span>
                            <span style={{fontSize:12,color:'var(--label2)',fontFamily:FT}}>{b}</span>
                          </div>
                        ))}
                        <div className="tap" onClick={(e:any)=>e.stopPropagation()} style={{marginTop:10,padding:'11px',borderRadius:14,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',textAlign:'center'}} onClick={()=>{const n=prompt("ÐÐ°ÑÐµ Ð¸Ð¼Ñ:");if(!n)return;const p=prompt("Ð¢ÐµÐ»ÐµÑÐ¾Ð½:");if(!p)return;submitContactRequest("realestate","ÐÐµÐ´Ð²Ð¸Ð¶Ð¸Ð¼Ð¾ÑÑÑ",n,p,"ÐÐ°Ð¿ÑÐ¾Ñ Ð¿Ð¾ Ð½ÐµÐ´Ð²Ð¸Ð¶Ð¸Ð¼Ð¾ÑÑÐ¸");alert("ÐÐ°ÑÐ²ÐºÐ° Ð¾ÑÐ¿ÑÐ°Ð²Ð»ÐµÐ½Ð°! ÐÐµÐ½ÐµÐ´Ð¶ÐµÑ ÑÐ²ÑÐ¶ÐµÑÑÑ.");}}>
                          <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>Ð£Ð·Ð½Ð°ÑÑ Ð¿Ð¾Ð´ÑÐ¾Ð±Ð½ÐµÐµ</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="tap" style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px 16px',display:'flex',gap:14,alignItems:'center',boxShadow:'var(--shadow-sm)'}}>
            <span style={{fontSize:20}}>ð</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>ÐÑÐ´ÐµÐ» Ð¿Ð°ÑÑÐ½ÑÑÑÑÐ²Ð°</div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>+7 (495) 023-43-49</div></div>
            <Chev/>
          </div>
        </div>
      ) : sec==='delivery' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>ÐÐ¾ÑÑÐ°Ð²ÐºÐ° Ð² Ð½Ð¾Ð¼ÐµÑ</div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}>ÐÐ´Ð° Ð¸ ÑÐ¾Ð²Ð°ÑÑ â Ð¿ÑÑÐ¼Ð¾ Ðº Ð´Ð²ÐµÑÐ¸</div>

          {/* Category pills */}
          <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:4}}>
            {[['food','ð²','ÐÐ´Ð°'],['drinks','ðµ','ÐÐ°Ð¿Ð¸ÑÐºÐ¸'],['snacks','ð§','Ð¡Ð½ÐµÐºÐ¸'],['merch','ð','ÐÐµÑÑ'],['essentials','ðª¥','ÐÐµÐ¾Ð±ÑÐ¾Ð´Ð¸Ð¼Ð¾Ðµ'],['kids','ð§¸','ÐÐµÑÑÐ¼']].map(([id,ic,lb]:any)=>(
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
                    <span style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{item.price>0?item.price+' â½':'ÐÐµÑÐ¿Ð».'}</span>
                    {item.prep_time_min&&<span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>â¼{item.prep_time_min} Ð¼Ð¸Ð½</span>}
                  </div>
                </div>
                {qty===0?(
                  <div className="tap" onClick={()=>setCart(p=>({...p,[item.id]:1}))} style={{width:34,height:34,borderRadius:17,background:'#007AFF',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:18,color:'#fff',fontWeight:300}}>+</span>
                  </div>
                ):(
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="tap" onClick={()=>setCart(p=>({...p,[item.id]:Math.max(0,qty-1)}))} style={{width:28,height:28,borderRadius:14,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:14,fontWeight:600,color:'var(--label2)'}}>â</span></div>
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
              <div><div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>{cartTotal.toLocaleString('ru')} â½</div><div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT}}>{cartCount} ÑÐ¾Ð².{cartCount===1?'':'Ð°Ñ'}</div></div>
              <div className="tap" onClick={()=>{const n=prompt('ÐÐ¼Ñ:');if(!n)return;const p=prompt('Ð¢ÐµÐ»ÐµÑÐ¾Ð½:');if(!p)return;const room=prompt('ÐÑÐµÐ»Ñ Ð¸ Ð½Ð¾Ð¼ÐµÑ ÐºÐ¾Ð¼Ð½Ð°ÑÑ:');const items=data.filter((d:any)=>cart[d.id]>0).map((d:any)=>({name:d.name_ru,qty:cart[d.id],price:d.price}));fetch(SB_URL+'/rest/v1/orders',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({type:'food',items:JSON.stringify(items),subtotal:cartTotal,total:cartTotal,guest_name:n,guest_phone:p,notes:room||'',status:'pending'})});setCart({});alert('ÐÐ°ÐºÐ°Ð· Ð¾ÑÐ¾ÑÐ¼Ð»ÐµÐ½! ÐÐ¶Ð¸Ð´Ð°Ð¹ÑÐµ Ð´Ð¾ÑÑÐ°Ð²ÐºÑ.');}} style={{padding:'10px 20px',borderRadius:14,background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)'}}>
                <span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>ÐÑÐ¾ÑÐ¼Ð¸ÑÑ</span>
              </div>
            </div>
          )}
        </div>
      ) : sec==='food' ? (selectedRest ? (
        <div style={{padding:0}}>
          <div style={{position:'relative',height:200,background:'linear-gradient(145deg,#8B4513,#D2691E)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'0 0 0 0'}}>
            <span style={{fontSize:80,opacity:.2}}>{selectedRest.cover_emoji}</span>
            <div className="tap" onClick={()=>toggleFav(selectedRest.id,selectedRest.name_ru,selectedRest.cover_emoji)} style={{position:'absolute',top:54,right:16,width:36,height:36,borderRadius:18,background:'rgba(0,0,0,.2)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}><span style={{fontSize:18,color:favorites.has(selectedRest.id)?'#FF3B30':'rgba(255,255,255,.85)'}}>{favorites.has(selectedRest.id)?'â¥':'â¡'}</span></div>
            <div className="tap" onClick={()=>{setSelectedRest(null);setFullMenu([]);}}
              style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:18,background:'rgba(0,0,0,.3)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>
              <span style={{fontSize:18,color:'#fff'}}>â¹</span>
            </div>
            <div style={{position:'absolute',top:54,right:16,display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,color:'#FFD60A'}}>â</span>
              <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>{selectedRest.rating}</span>
            </div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 18px 16px',background:'linear-gradient(transparent,rgba(0,0,0,.5))'}}>
              <div style={{fontSize:26,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px'}}>{selectedRest.name_ru}</div>
            </div>
          </div>
          <div style={{padding:'20px'}}>
            <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,lineHeight:1.55,marginBottom:16}}>{selectedRest.description_ru}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
              {selectedRest.avg_check && <div style={{padding:'7px 12px',borderRadius:12,background:'var(--fill4)',border:'0.5px solid var(--sep)',display:'flex',alignItems:'center',gap:5}}><span style={{fontSize:13}}>ð°</span><span style={{fontSize:13,fontWeight:600,color:'var(--label)',fontFamily:FT}}>~{selectedRest.avg_check} â½</span></div>}
              {selectedRest.is_halal && <div style={{padding:'7px 12px',borderRadius:12,background:'rgba(52,199,89,.06)',border:'0.5px solid rgba(52,199,89,.15)',display:'flex',alignItems:'center',gap:5}}><span style={{fontSize:13}}>âªï¸</span><span style={{fontSize:13,fontWeight:600,color:'#34C759',fontFamily:FT}}>Ð¥Ð°Ð»ÑÐ»Ñ</span></div>}
            </div>
            <div style={{fontSize:18,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:12}}>ÐÐµÐ½Ñ</div>
            {fullMenu.length===0 ? <div style={{padding:'20px',textAlign:'center'}}><Spinner/></div> : (
              <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
                {fullMenu.map((m:any,i:number)=>{
                  const spice = m.spice_level>0?'ð¶ï¸'.repeat(Math.min(m.spice_level,3)):'';
                  return (
                    <div key={m.id||i} style={{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:i<fullMenu.length-1?'0.5px solid var(--sep)':'none'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{m.name_ru}{spice?' '+spice:''}</div>
                        <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{m.weight_grams?(m.weight_grams+'Ð³ '):''}{m.calories?(m.calories+'ÐºÐºÐ°Ð»'):''}</div>
                      </div>
                      <span style={{fontSize:15,fontWeight:700,color:'var(--orange)',fontFamily:FD,flexShrink:0,marginLeft:12}}>{m.price} â½</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="tap" style={{marginTop:20,height:50,borderRadius:14,background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ ÑÑÐ¾Ð»Ð¸Ðº</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:'var(--label)'}}>{data.length}</span> ÑÐµÑÑÐ¾ÑÐ°Ð½Ð¾Ð² Ð¸ ÐºÐ°ÑÐµ</div>
          {data.map((r:any,i:number)=>{
            const hasMenu = restId===r.id && menu.length>0;
            return (
              <div key={r.id} className={`fu s${Math.min(i+1,6)}`}
                style={{borderRadius:30,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
                <div className="tap" onClick={()=>openRest(r)} style={{padding:'16px',display:'flex',gap:14}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'rgba(255,149,0,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{r.cover_emoji||'ð½ï¸'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{r.name_ru}</div>
                      <div style={{display:'flex',alignItems:'center',gap:3,flexShrink:0}}>
                        <span style={{fontSize:12,color:'#FFD60A'}}>â</span>
                        <span style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{r.rating}</span>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{r.description_ru?.slice(0,90)}{r.description_ru?.length>90?'...':''}</div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      {r.avg_check && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>ð° ~{r.avg_check} â½</span>}
                      {r.is_halal && <span style={{fontSize:11,color:'#34C759',fontFamily:FT,background:'rgba(52,199,89,.08)',padding:'3px 8px',borderRadius:8}}>âªï¸ Ð¥Ð°Ð»ÑÐ»Ñ</span>}
                      <span style={{fontSize:11,color:'var(--blue)',fontFamily:FT,fontWeight:600}}>{hasMenu?'Ð¡ÐºÑÑÑÑ Ð¼ÐµÐ½Ñ â²':'ÐÐµÐ½Ñ â¼'}</span>
                    </div>
                  </div>
                </div>
                {hasMenu && (
                  <div style={{padding:'0 16px 14px',borderTop:'0.5px solid var(--sep)'}}>
                    <div style={{padding:'10px 0 0'}}>
                      {menu.map((m:any)=>(
                        <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'0.5px solid var(--fill3)'}}>
                          <div><div style={{fontSize:14,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{m.cover_emoji} {m.name_ru}</div>
                          <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{m.weight_g?m.weight_g+'Ð³':''}{m.calories?' Â· '+m.calories+'ÐºÐºÐ°Ð»':''}</div></div>
                          <span style={{fontSize:14,fontWeight:700,color:'var(--orange)',fontFamily:FT}}>{m.price} â½</span>
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
            <span style={{fontWeight:700,color:'var(--label)'}}>{data.length}</span> {sec==='banya'?'Ð±Ð°Ð½Ð½ÑÑ Ð¸ Ð¡ÐÐ Ð¿ÑÐ¾Ð³ÑÐ°Ð¼Ð¼':sec==='fun'?'ÑÐ°Ð·Ð²Ð»ÐµÑÐµÐ½Ð¸Ð¹ Ð¸ Ð°ÑÑÑÐ°ÐºÑÐ¸Ð¾Ð½Ð¾Ð²':sec==='rental'?'Ð²Ð¸Ð´Ð¾Ð² ÑÑÐ°Ð½ÑÐ¿Ð¾ÑÑÐ°':sec==='delivery'?'Ð²Ð°ÑÐ¸Ð°Ð½ÑÐ¾Ð² Ð´Ð¾ÑÑÐ°Ð²ÐºÐ¸':'ÑÑÐ»ÑÐ³'}
          </div>
          {sec==='delivery' ? (
            <div>
              <div style={{borderRadius:30,background:"linear-gradient(135deg,#0d2b1d,#1a6b3a)",padding:20,marginBottom:16}}>
                <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:6}}>ÐÐ´Ð¸Ð½Ð°Ñ ÐºÐ¾ÑÐ·Ð¸Ð½Ð°</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,.7)",fontFamily:FT,lineHeight:1.5}}>ÐÐ»ÑÐ´Ð° Ð¸Ð· ÑÐµÑÑÐ¾ÑÐ°Ð½Ð¾Ð² Ð¸ ÑÐ¾Ð²Ð°ÑÑ Ð¸Ð· Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ð¾Ð² â Ð² Ð¾Ð´Ð½Ñ ÐºÐ¾ÑÐ·Ð¸Ð½Ñ. Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Ð¾ÑÐµÐ»Ñ Ð¸ Ð½Ð¾Ð¼ÐµÑ.</div>
              </div>
              {[{c:"ð½ï¸",t:"ÐÐ°ÐºÐ°Ð·Ð°ÑÑ ÐµÐ´Ñ",d:"ÐÐ· 15 ÑÐµÑÑÐ¾ÑÐ°Ð½Ð¾Ð² Ð¿Ð°ÑÐºÐ°",b:"+15"},{c:"ðï¸",t:"ÐÐ°ÐºÐ°Ð·Ð°ÑÑ ÑÐ¾Ð²Ð°ÑÑ",d:"Ð¡ÑÐ²ÐµÐ½Ð¸ÑÑ Ð¸ ÑÐµÐ¼ÑÑÐ»Ð°",b:"+15"},{c:"ð§",t:"Ð¡ÐÐ-Ð½Ð°Ð±Ð¾ÑÑ",d:"ÐÐ¾ÑÐ¼ÐµÑÐ¸ÐºÐ° Ð´Ð»Ñ Ð±Ð°Ð½Ð¸",b:"+10"}].map((x:any,j:number)=>(
                <div key={j} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{x.c}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{x.t}</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{x.d}</div></div>
                  <div style={{padding:"3px 8px",borderRadius:8,background:"rgba(52,199,89,.1)"}}><span style={{fontSize:11,fontWeight:600,color:"var(--green)",fontFamily:FT}}>{x.b}</span></div>
                </div>
              ))}
              <div style={{padding:12,borderRadius:12,background:"var(--fill4)",marginTop:4}}>
                <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,textAlign:"center"}}>ÐÐ¸Ð½Ð¸Ð¼ÑÐ¼ 500 â½ Â· ÐÐ¾ÑÑÐ°Ð²ÐºÐ° 30-60 Ð¼Ð¸Ð½</div>
              </div>
            </div>
          ) : data.map((s:any,i:number)=><ServiceCard key={s.id} s={s} i={i}/>)}
          {sec==='banya' && (
            <div className="tap" style={{borderRadius:16,background:'linear-gradient(145deg,#8B0000,#C0392B)',padding:'18px',position:'relative',overflow:'hidden',marginTop:4}}>
              <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.15}}>ð¥</div>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>Ð¡ÐÐ-ÑÑÑÑ Ð´Ð»Ñ Ð´Ð²Ð¾Ð¸Ñ</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:4}}>Ð Ð¾Ð¼Ð°Ð½ÑÐ¸ÑÐµÑÐºÐ¸Ð¹ Ð¾ÑÐ´ÑÑ: Ð±Ð°Ð½Ñ + Ð¼Ð°ÑÑÐ°Ð¶ + ÑÐ¶Ð¸Ð½</div>
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
            <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD}}>ÐÐ¾Ð²ÑÐ¹ Ð¾ÑÐ·ÑÐ²</div>
            <div className="tap" onClick={()=>setShowReviewForm(false)} style={{width:30,height:30,borderRadius:15,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,color:"var(--label3)"}}>â</span></div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,marginBottom:6}}>ÐÑÐµÐ½ÐºÐ°</div>
            <div style={{display:"flex",gap:6}}>{[1,2,3,4,5].map(n=>(<div key={n} className="tap" onClick={()=>setRvRating(n)} style={{fontSize:28,cursor:"pointer"}}>{n<=rvRating?"â":"â"}</div>))}</div>
          </div>
          <div style={{borderRadius:12,background:"var(--bg)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:14}}>
            <input value={rvName} onChange={(e:any)=>setRvName(e.target.value)} placeholder="ÐÐ°ÑÐµ Ð¸Ð¼Ñ" style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box"}}/>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <input value={rvItem} onChange={(e:any)=>setRvItem(e.target.value)} placeholder="Ð§ÑÐ¾ Ð¿Ð¾ÑÐµÑÐ¸Ð»Ð¸ (ÑÐµÑÑÐ¾ÑÐ°Ð½, ÑÑÑ...)" style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box"}}/>
            <div style={{height:"0.5px",background:"var(--sep)",marginLeft:16}}/>
            <textarea value={rvComment} onChange={(e:any)=>setRvComment(e.target.value)} placeholder="ÐÐ°Ñ Ð¾ÑÐ·ÑÐ²..." rows={4} style={{width:"100%",padding:"14px 16px",border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)",boxSizing:"border-box",resize:"none"}}/>
          </div>
          <div className="tap" onClick={async()=>{if(!rvComment.trim()){alert("ÐÐ°Ð¿Ð¸ÑÐ¸ÑÐµ Ð¾ÑÐ·ÑÐ²");return;}setRvSending(true);await fetch(SB_URL+"/rest/v1/reviews",{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({item_type:"restaurant",item_id:"manual",item_name:rvItem||"Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ",rating:rvRating,comment:rvComment,author_name:rvName||"ÐÐ¾ÑÑÑ",author_emoji:"ð¤"})});setRvSending(false);setShowReviewForm(false);setRvComment("");setRvName("");setRvItem("");setRvRating(5);setAllReviews(prev=>[{id:Date.now(),item_type:"restaurant",item_name:rvItem||"Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ",rating:rvRating,comment:rvComment,author_name:rvName||"ÐÐ¾ÑÑÑ",author_emoji:"ð¤",created_at:new Date().toISOString()},...prev]);}} style={{padding:"14px",borderRadius:14,background:"#007AFF",textAlign:"center",opacity:rvSending?.5:1}}>
            <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>{rvSending?"ÐÑÐ¿ÑÐ°Ð²ÐºÐ°...":"ÐÑÐ¿ÑÐ°Ð²Ð¸ÑÑ Ð¾ÑÐ·ÑÐ²"}</span>
          </div>
        </div>
      </div>
    )}
    {bookingService && <BookingModal item={bookingService} type="service" total={bookingService.price_from||0} guests={1} onClose={()=>setBookingService(null)}/>}
    </div>
  );
}

// âââ PASSPORT âââââââââââââââââââââââââââââââââââââââââââââ


// âââ PASSPORT VIEW (iOS 26 grouped) ââââââââââââââââââââââ
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
  const [visitedC,setVisitedC]=useState<string[]>([]);
  const [visitedR,setVisitedR]=useState<string[]>([]);
  const [authStep,setAuthStep]=useState<string>('phone');
  const [phoneInput,setPhoneInput]=useState('+7');
  const [otpInput,setOtpInput]=useState('');
  const [authErr,setAuthErr]=useState('');
  const [authLoading,setAuthLoading]=useState(false);
  const [countdown,setCountdown]=useState(0);
  const [devCode,setDevCode]=useState('');
  const [loading,setLoading]=useState(true);
  const [userSet,setUserSet]=useState<any>({push_enabled:true,marketing_consent:false,theme:'auto',locale:'ru'});
  const [legalDocs,setLegalDocs]=useState<any[]>([]);
  const [selectedLegal,setSelectedLegal]=useState<any>(null);
  const [unlockedAchs,setUnlockedAchs]=useState<string[]>([]);
  const [regionFd,setRegionFd]=useState('');
  const [expandedCountry,setExpandedCountry]=useState<string|null>(null);

  useEffect(()=>{
    Promise.all([
      sb('countries','select=id,name_ru,flag_emoji,color_hex&active=eq.true&order=sort_order.asc'),
      sb('regions_rf','select=id,name_ru,flag_emoji,federal_district&active=eq.true&order=sort_order.asc'),
      sb('achievements','select=*&order=track.asc,level.asc'),
      sb('bookings','select=*&order=created_at.desc&limit=20'),
      sb('favorites','select=*&order=created_at.desc&limit=20'),
      sb('reviews','select=*&order=created_at.desc&limit=20'),
      sb('loyalty_levels','select=*&order=min_points.asc'),
      sb('subscription_plans','select=*&is_active=eq.true&order=sort_order.asc'),
      sb('wallet_transactions','select=*&order=created_at.desc&limit=20'),
      sb('points_log','select=*&order=created_at.desc&limit=20'),
      sb('legal_docs','select=*&is_published=eq.true&order=sort_order.asc'),
    ]).then(([c,r,a,b,f,rv,ll,sp,wt,pl,ld])=>{
      setCountries(c||[]);setRegions(r||[]);setAchievements(a||[]);setBookings(b||[]);setFavs(f||[]);setRevs(rv||[]);setLoyaltyLvls(ll||[]);setSubPlans(sp||[]);setWalletTx(wt||[]);setPointsLog(pl||[]);setLegalDocs(ld||[]);setLoading(false);
    });
    if(session?.access_token){
      const t=session.access_token;
      sbAuthGet(t,'profiles?select=*&id=eq.'+session.user?.id).then(p=>{if(p?.[0])setProfile(p[0]);});
      sbAuthGet(t,'user_settings?select=*&user_id=eq.'+session.user?.id).then(us=>{if(us?.[0])setUserSet(us[0]);});
      sbAuthGet(t,'user_achievements?select=achievement_id&user_id=eq.'+session.user?.id).then(ua=>{setUnlockedAchs((ua||[]).map((x:any)=>x.achievement_id));});
      sbAuthGet(t,'passport_stamps?select=country_id,region_id&user_id=eq.'+session.user?.id).then(st=>{
        setVisitedC([...new Set((st||[]).filter((s:any)=>s.country_id).map((s:any)=>s.country_id))]);
        setVisitedR([...new Set((st||[]).filter((s:any)=>s.region_id).map((s:any)=>s.region_id))]);
      });
    }
  },[session]);

  const pts=profile?.points||0;
  const lvls=loyaltyLvls.length>0?loyaltyLvls:[{name_ru:'ÐÐ¾ÑÑÑ',icon:'ð±',color:'#8E8E93',min_points:0,perks_ru:[]}];
  const curLvl=lvls.filter((l:any)=>pts>=l.min_points).pop()||lvls[0];
  const nxtLvl=lvls.find((l:any)=>l.min_points>pts);
  const lvlPct=nxtLvl?Math.min(100,Math.round((pts-(curLvl?.min_points||0))/(nxtLvl.min_points-(curLvl?.min_points||0))*100)):100;

  // iOS grouped row
  const Row=({icon,label,value,last,onClick}:{icon:string,label:string,value?:string,last?:boolean,onClick?:()=>void})=>(
    <div className="tap" onClick={onClick} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:last?'none':'0.5px solid var(--sep)'}}>
      <div style={{width:32,height:32,borderRadius:10,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{icon}</div>
      <div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{label}</div>
      {value!=null&&<span style={{fontSize:15,fontWeight:500,color:'var(--label3)',fontFamily:FT}}>{value}</span>}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </div>
  );

  // === SUB-VIEWS ===
  if(view){
    const titles:Record<string,string>={countries:'Ð¡ÑÑÐ°Ð½Ñ Ð¼Ð¸ÑÐ°',regions:'Ð ÐµÐ³Ð¸Ð¾Ð½Ñ Ð Ð¾ÑÑÐ¸Ð¸',achievements:'ÐÐ¾ÑÑÐ¸Ð¶ÐµÐ½Ð¸Ñ',bookings:'ÐÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ñ',favorites:'ÐÐ·Ð±ÑÐ°Ð½Ð½Ð¾Ðµ',reviews:'ÐÑÐ·ÑÐ²Ñ',wallet:'ÐÐ¾ÑÐµÐ»ÑÐº',settings:'ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸'};
    return(
      <div style={{padding:'12px 0'}}>
        <div className="tap" onClick={()=>setView(null)} style={{display:'flex',alignItems:'center',gap:6,padding:'0 20px 16px'}}>
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:17,color:'#007AFF',fontFamily:FT}}>ÐÐ°Ð·Ð°Ð´</span>
        </div>
        <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.8px',padding:'0 20px',marginBottom:20}}>{titles[view]||view}</div>

        {view==='countries'&&(
          <div style={{padding:'0 20px',display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center'}}>
            {countries.map((c:any)=>{const v=visitedC.includes(c.id);return(
              <div key={c.id} style={{width:64,textAlign:'center'}}>
                <div style={{width:64,height:64,borderRadius:32,border:v?'3px solid #34C759':'2.5px dashed var(--sep-opaque)',background:v?'rgba(52,199,89,.08)':'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{c.flag_emoji}</div>
                <div style={{fontSize:10,color:v?'var(--label)':'var(--label3)',fontFamily:FT,marginTop:4,lineHeight:1.2}}>{c.name_ru}</div>
              </div>
            )})}
          </div>
        )}

        {view==='regions'&&(
          <div style={{padding:'0 20px'}}>
            {(() => {
              const fds=[...new Set(regions.map((r:any)=>r.federal_district).filter(Boolean))];
              const filtered=regionFd?regions.filter((r:any)=>r.federal_district===regionFd):regions;
              return(<>
                <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:4}}>
                  <div className="tap" onClick={()=>setRegionFd('')} style={{padding:'6px 14px',borderRadius:20,fontSize:13,fontFamily:FT,flexShrink:0,background:!regionFd?'var(--label)':'var(--fill4)',color:!regionFd?'#fff':'var(--label2)'}}>ÐÑÐµ</div>
                  {fds.map((fd:string)=>(<div key={fd} className="tap" onClick={()=>setRegionFd(fd)} style={{padding:'6px 14px',borderRadius:20,fontSize:13,fontFamily:FT,flexShrink:0,background:regionFd===fd?'var(--label)':'var(--fill4)',color:regionFd===fd?'#fff':'var(--label2)'}}>{fd}</div>))}
                </div>
                <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
                  {filtered.map((r:any,i:number)=>{const v=visitedR.includes(r.id);return(
                    <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<filtered.length-1?'0.5px solid var(--sep)':'none'}}>
                      <span style={{fontSize:20}}>{r.flag_emoji||'ð³ï¸'}</span>
                      <div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{r.name_ru}</div>
                      {v&&<span style={{fontSize:12,color:'#34C759'}}>â</span>}
                    </div>
                  )})}
                </div>
              </>);
            })()}
          </div>
        )}

        {view==='achievements'&&(
          <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:10}}>
            {achievements.map((a:any,i:number)=>(
              <div key={a.id||i} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14,display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:44,height:44,borderRadius:13,background:unlockedAchs.includes(a.id)?'rgba(52,199,89,.12)':'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,opacity:unlockedAchs.includes(a.id)?1:.4}}>{a.icon||'ð'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600,color:unlockedAchs.includes(a.id)?'var(--label)':'var(--label3)',fontFamily:FT}}>{a.name_ru}</div>
                  <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{a.description_ru}</div>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:unlockedAchs.includes(a.id)?'#34C759':'var(--label4)',fontFamily:FT}}>{unlockedAchs.includes(a.id)?'â':'+'+a.reward_points}</div>
              </div>
            ))}
          </div>
        )}

        {view==='bookings'&&(
          <div style={{padding:'0 20px'}}>{bookings.length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>ðï¸</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>ÐÐµÑ Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ð¹</div></div>:
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>{bookings.map((b:any,i:number)=>(
              <div key={b.id||i} style={{padding:'14px 16px',borderBottom:i<bookings.length-1?'0.5px solid var(--sep)':'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{b.item_name||'ÐÑÐ¾Ð½Ñ'}</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{b.type} Â· {new Date(b.created_at).toLocaleDateString('ru')}</div></div>
                <div style={{fontSize:15,fontWeight:700,color:'#34C759',fontFamily:FD}}>{(b.total_price||0).toLocaleString('ru')} â½</div>
              </div>
            ))}</div>}
          </div>
        )}

        {view==='favorites'&&(
          <div style={{padding:'0 20px'}}>{favs.length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>â¤ï¸</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>ÐÑÑÑÐ¾</div></div>:
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>{favs.map((f:any,i:number)=>(
              <div key={f.id||i} style={{padding:'14px 16px',borderBottom:i<favs.length-1?'0.5px solid var(--sep)':'none',display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24}}>{f.item_emoji||'â¤ï¸'}</span>
                <div style={{flex:1,fontSize:15,color:'var(--label)',fontFamily:FT}}>{f.item_name}</div>
              </div>
            ))}</div>}
          </div>
        )}

        {view==='reviews'&&(
          <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
            {revs.length===0?<div style={{textAlign:'center',padding:40}}><div style={{fontSize:48,marginBottom:8}}>ð</div><div style={{fontSize:15,color:'var(--label2)',fontFamily:FT}}>ÐÐµÑ Ð¾ÑÐ·ÑÐ²Ð¾Ð²</div></div>:
            revs.map((r:any,i:number)=>(
              <div key={r.id||i} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{r.item_name}</div>
                  <div style={{color:'#FF9500',fontSize:13}}>{'â'.repeat(r.rating||0)+'â'.repeat(5-(r.rating||0))}</div>
                </div>
                <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,fontStyle:'italic'}}>Â«{r.comment}Â»</div>
                <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:6}}>{new Date(r.created_at).toLocaleDateString('ru',{day:'numeric',month:'long',year:'numeric'})}</div>
              </div>
            ))}
          </div>
        )}

        {view==='wallet'&&(
          <div style={{padding:'0 20px'}}>
            <div style={{borderRadius:22,background:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',padding:20,marginBottom:16,position:'relative',overflow:'hidden'}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px'}}>ÐÐ°Ð»Ð°Ð½Ñ Ð¾ÑÐºÐ¾Ð²</div>
              <div style={{fontSize:36,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4}}>{pts}</div>
              <div style={{display:'flex',gap:16,marginTop:12}}>
                <div><div style={{fontSize:14,fontWeight:700,color:'#34C759',fontFamily:FD}}>+30</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Ð¿Ð¾ÑÐµÑÐµÐ½Ð¸Ðµ</div></div>
                <div><div style={{fontSize:14,fontWeight:700,color:'#FF9500',fontFamily:FD}}>+50</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>QR</div></div>
                <div><div style={{fontSize:14,fontWeight:700,color:'#AF52DE',fontFamily:FD}}>+100</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Ð¾ÑÐ·ÑÐ²</div></div>
              </div>
            </div>
            <div className="tap" onClick={()=>{const nom=prompt('ÐÐ¾Ð¼Ð¸Ð½Ð°Ð» ÑÐµÑÑÐ¸ÑÐ¸ÐºÐ°ÑÐ° (1000, 3000, 5000, 10000):');if(!nom)return;const n=parseInt(nom);if(![1000,3000,5000,10000].includes(n)){alert('ÐÑÐ±ÐµÑÐ¸ÑÐµ: 1000, 3000, 5000 Ð¸Ð»Ð¸ 10000');return;}const rn=prompt('ÐÐ¼Ñ Ð¿Ð¾Ð»ÑÑÐ°ÑÐµÐ»Ñ:');if(!rn)return;const rp=prompt('Ð¢ÐµÐ»ÐµÑÐ¾Ð½ Ð¿Ð¾Ð»ÑÑÐ°ÑÐµÐ»Ñ:');const msg=prompt('Ð¡Ð¾Ð¾Ð±ÑÐµÐ½Ð¸Ðµ (Ð½ÐµÐ¾Ð±ÑÐ·Ð°ÑÐµÐ»ÑÐ½Ð¾):')||'';const code='GIFT'+Date.now().toString(36).toUpperCase();fetch(SB_URL+'/rest/v1/gift_certificates',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({nominal:n,balance:n,code,status:'active',recipient_name:rn,recipient_phone:rp||'',message:msg,valid_until:new Date(Date.now()+365*86400000).toISOString()})});alert('Ð¡ÐµÑÑÐ¸ÑÐ¸ÐºÐ°Ñ ÑÐ¾Ð·Ð´Ð°Ð½!\\nÐÐ¾Ð´: '+code+'\\nÐÐ¾Ð¼Ð¸Ð½Ð°Ð»: '+n+' â½');}} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#FF6B6B,#FFD93D)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>ð</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>ÐÐ¾Ð´Ð°ÑÐ¾ÑÐ½ÑÐ¹ ÑÐµÑÑÐ¸ÑÐ¸ÐºÐ°Ñ</div><div style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>1 000 â 10 000 â½</div></div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:10}}>ÐÑÑÐ¾ÑÐ¸Ñ</div>
            {(()=>{
              const all=[...walletTx.map((t:any)=>({...t,src:'w'})),...pointsLog.map((p:any)=>({id:p.id,description:p.description,amount:p.points,created_at:p.created_at,src:'p'}))].sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
              if(!all.length)return <div style={{textAlign:'center',padding:30,color:'var(--label3)',fontFamily:FT,fontSize:14}}>ÐÐ¾ÑÐµÑÐ°Ð¹ÑÐµ Ð¿Ð°ÑÐº!</div>;
              return all.map((tx:any,i:number)=>(
                <div key={tx.id||i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<all.length-1?'0.5px solid var(--sep)':'none'}}>
                  <div style={{width:34,height:34,borderRadius:10,background:tx.src==='p'?'rgba(0,122,255,.1)':tx.amount>0?'rgba(52,199,89,.1)':'rgba(255,59,48,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>{tx.src==='p'?'â­':tx.amount>0?'â':'â'}</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{tx.description}</div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{new Date(tx.created_at).toLocaleDateString('ru')}</div></div>
                  <div style={{fontSize:14,fontWeight:700,color:tx.src==='p'?'#007AFF':tx.amount>0?'#34C759':'#FF3B30',fontFamily:FD}}>{tx.amount>0?'+':''}{tx.amount}{tx.src==='p'?' Ð¾Ñ.':' â½'}</div>
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
                  <span style={{fontSize:17,color:'#007AFF',fontFamily:FT}}>ÐÐ°Ð·Ð°Ð´</span>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,marginBottom:16}}>{selectedLegal.title_ru}</div>
                <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,lineHeight:1.65,whiteSpace:'pre-line'}}>{selectedLegal.body_ru}</div>
              </div>
            ) : (<>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
              {[['push_enabled','Push-ÑÐ²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ñ'],['marketing_consent','ÐÐ°ÑÐºÐµÑÐ¸Ð½Ð³Ð¾Ð²ÑÐµ ÑÐ°ÑÑÑÐ»ÐºÐ¸']].map(([key,label]:any,i:number)=>(
                <div key={key} className="tap" onClick={async()=>{const nv={...userSet,[key]:!userSet[key]};setUserSet(nv);if(session?.user?.id){await fetch(SB_URL+'/rest/v1/user_settings?user_id=eq.'+session.user.id,{method:'PATCH',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({[key]:!userSet[key]})}).catch(()=>{});await fetch(SB_URL+'/rest/v1/user_settings',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal,resolution=merge-duplicates'},body:JSON.stringify({user_id:session.user.id,[key]:nv[key]})}).catch(()=>{});}}} style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:i<1?'0.5px solid var(--sep)':'none'}}>
                  <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>{label}</span>
                  <div style={{width:51,height:31,borderRadius:16,background:userSet[key]?'#34C759':'var(--fill4)',padding:2,transition:'background .2s'}}><div style={{width:27,height:27,borderRadius:14,background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,.2)',transform:userSet[key]?'translateX(20px)':'translateX(0)',transition:'transform .2s cubic-bezier(0.2,0.8,0.2,1)'}}/></div>
                </div>
              ))}
            </div>

            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginTop:12}}>
              <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid var(--sep)'}}>
                <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>Ð¯Ð·ÑÐº</span>
                <span style={{fontSize:15,color:'var(--label3)',fontFamily:FT}}>Ð ÑÑÑÐºÐ¸Ð¹</span>
              </div>
              <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>Ð¢ÐµÐ¼Ð°</span>
                <span style={{fontSize:15,color:'var(--label3)',fontFamily:FT}}>ÐÐ²ÑÐ¾</span>
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginTop:24,marginBottom:6}}>ÐÐºÐºÐ°ÑÐ½Ñ</div>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--sep)'}}>
                <div style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>Email</div>
                <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{session?.user?.email||'â'}</div>
              </div>
              <div style={{padding:'14px 16px'}}>
                <div style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>ID</div>
                <div style={{fontSize:11,color:'var(--label3)',fontFamily:'monospace',marginTop:2}}>{session?.user?.id?.slice(0,8)||'â'}</div>
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginTop:24,marginBottom:6}}>ÐÑÐ°Ð²Ð¾Ð²Ð°Ñ Ð¸Ð½ÑÐ¾ÑÐ¼Ð°ÑÐ¸Ñ</div>
            <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
              {legalDocs.length>0?legalDocs.map((doc:any,i:number)=>(
                <div key={doc.id} className="tap" onClick={()=>setSelectedLegal(doc)} style={{padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:i<legalDocs.length-1?'0.5px solid var(--sep)':'none'}}>
                  <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>{doc.title_ru}</span>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              )):['ÐÐ¾Ð»Ð¸ÑÐ¸ÐºÐ° ÐºÐ¾Ð½ÑÐ¸Ð´ÐµÐ½ÑÐ¸Ð°Ð»ÑÐ½Ð¾ÑÑÐ¸','ÐÐ¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÑÑÐºÐ¾Ðµ ÑÐ¾Ð³Ð»Ð°ÑÐµÐ½Ð¸Ðµ','ÐÑÐ±Ð»Ð¸ÑÐ½Ð°Ñ Ð¾ÑÐµÑÑÐ°'].map((t:string,i:number)=>(
                <div key={i} style={{padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:i<2?'0.5px solid var(--sep)':'none'}}>
                  <span style={{fontSize:15,color:'var(--label)',fontFamily:FT}}>{t}</span>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(60,60,67,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              ))}
            </div>

            <div style={{textAlign:'center',padding:'32px 0 48px'}}>
              <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FD}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ.</div>
              <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:3}}>ÐÑÑÐ¿Ð½ÐµÐ¹ÑÐ¸Ð¹ Ð¿Ð°ÑÐº Ð Ð¤</div>
              <div style={{marginTop:14,fontSize:12,color:'var(--label3)',fontFamily:FT,lineHeight:1.7}}>Ð¡ 9:00 Ð´Ð¾ 21:00 ÐµÐ¶ÐµÐ´Ð½ÐµÐ²Ð½Ð¾<br/>+7 (495) 023-43-49</div>
              <div style={{marginTop:14}}><span className="tap" onClick={()=>window.open('https://billionsx.com','_blank')} style={{fontSize:12,color:'var(--blue)',cursor:'pointer'}}>Ð Ð°Ð·ÑÐ°Ð±Ð¾ÑÑÐ¸Ðº Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ billionsx.com</span></div>
            </div>
            </>)}
          </div>
        )}
      </div>
    );
  }

  // === NOT LOGGED IN — PHONE OTP ===
  const sendOtp = async () => {
    if (phoneInput.replace(/\D/g,'').length < 11) { setAuthErr('Введите корректный номер телефона'); return; }
    setAuthLoading(true); setAuthErr('');
    try {
      const r = await fetch(SB_URL+'/functions/v1/send-otp', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone: phoneInput })
      });
      const d = await r.json();
      if (d.success) {
        setAuthStep('otp'); setCountdown(60); setDevCode(d.dev_code||'');
      } else {
        setAuthErr(d.error || 'Ошибка отправки SMS');
      }
    } catch { setAuthErr('Ошибка сети'); }
    setAuthLoading(false);
  };

  const verifyOtp = async () => {
    if (otpInput.length !== 6) { setAuthErr('Введите 6-значный код'); return; }
    setAuthLoading(true); setAuthErr('');
    try {
      const r = await fetch(SB_URL+'/functions/v1/verify-otp', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone: phoneInput, code: otpInput })
      });
      const d = await r.json();
      if (d.success && d.session) {
        localStorage.setItem('sb_session', JSON.stringify({ ...d.session, user: d.user }));
        window.location.reload();
      } else {
        setAuthErr(d.error || 'Неверный код');
      }
    } catch { setAuthErr('Ошибка сети'); }
    setAuthLoading(false);
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 1) return '+7';
    let f = '+7';
    if (d.length > 1) f += ' (' + d.slice(1, 4);
    if (d.length > 4) f += ') ' + d.slice(4, 7);
    if (d.length > 7) f += '-' + d.slice(7, 9);
    if (d.length > 9) f += '-' + d.slice(9, 11);
    return f;
  };

  if(!session) return(
    <div style={{padding:'20px',minHeight:'100%',display:'flex',flexDirection:'column',justifyContent:'center'}}>
      {/* Hero card */}
      <div style={{borderRadius:24,background:'linear-gradient(160deg,#0A1A10,#1D3D25,#2A5433)',padding:'32px 22px',position:'relative',overflow:'hidden',marginBottom:24}}>
        <div style={{position:'absolute',inset:0,opacity:.03,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)',backgroundSize:'14px 14px'}}/>
        <div style={{position:'absolute',top:16,right:16,width:56,height:56,borderRadius:28,border:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🌍</div>
        <div style={{position:'relative'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:2.5,fontFamily:FT,textTransform:'uppercase'}}>ЭТНОГРАФИЧЕСКИЙ ПАРК-МУЗЕЙ</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.55)',fontWeight:600,letterSpacing:1.5,fontFamily:FT,marginTop:2}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
          <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:20}}>{authStep==='otp'?'Введите код из SMS':'Войдите по телефону'}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.55)',fontFamily:FT,marginTop:6}}>{authStep==='otp'?'Код отправлен на '+formatPhone(phoneInput):'Быстрый вход за 30 секунд'}</div>
        </div>
      </div>

      {/* Auth form */}
      <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'20px 16px'}}>
        {authStep==='phone' ? (
          <>
            {/* Phone input */}
            <div style={{borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',padding:'0 16px'}}>
                <span style={{fontSize:20,marginRight:8}}>🇷🇺</span>
                <input
                  value={formatPhone(phoneInput)}
                  onChange={(e:any)=>{
                    const raw=e.target.value.replace(/\D/g,'');
                    setPhoneInput('+'+raw.slice(0,11));
                    setAuthErr('');
                  }}
                  placeholder="+7 (900) 123-45-67"
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  style={{width:'100%',padding:'16px 0',border:'none',background:'transparent',fontSize:18,fontFamily:FT,outline:'none',color:'var(--label)',fontWeight:500,letterSpacing:0.5}}
                />
              </div>
            </div>
            {authErr&&<div style={{fontSize:13,color:'#FF3B30',fontFamily:FT,marginBottom:10,textAlign:'center'}}>{authErr}</div>}
            <div className="tap" onClick={()=>!authLoading&&sendOtp()}
              style={{padding:'16px',borderRadius:14,background:authLoading?'rgba(0,122,255,0.5)':'#007AFF',textAlign:'center'}}>
              <span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{authLoading?'Отправка...':'Получить код'}</span>
            </div>
            <div style={{textAlign:'center',marginTop:16}}>
              <span style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>Мы отправим SMS с кодом подтверждения</span>
            </div>
          </>
        ) : (
          <>
            {/* OTP input */}
            <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:14}}>
              {[0,1,2,3,4,5].map(i=>(
                <div key={i} style={{width:44,height:54,borderRadius:12,background:'var(--bg)',border:otpInput.length===i?'2px solid #007AFF':'0.5px solid var(--sep-opaque)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:24,fontWeight:600,fontFamily:FT,color:'var(--label)'}}>{otpInput[i]||''}</span>
                </div>
              ))}
            </div>
            <input
              value={otpInput}
              onChange={(e:any)=>{
                const v=e.target.value.replace(/\D/g,'').slice(0,6);
                setOtpInput(v);
                setAuthErr('');
                if(v.length===6) setTimeout(()=>verifyOtp(),100);
              }}
              type="tel" inputMode="numeric" autoFocus
              style={{position:'absolute',opacity:0,width:1,height:1}}
            />
            <div className="tap" onClick={()=>document.querySelector<HTMLInputElement>('input[type=tel][inputMode=numeric]')?.focus()}
              style={{padding:'16px',borderRadius:14,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)',textAlign:'center',marginBottom:10}}>
              <span style={{fontSize:15,color:'#007AFF',fontFamily:FT,fontWeight:500}}>Нажмите для ввода кода</span>
            </div>
            {authErr&&<div style={{fontSize:13,color:'#FF3B30',fontFamily:FT,marginBottom:10,textAlign:'center'}}>{authErr}</div>}
            {devCode&&<div style={{fontSize:12,color:'var(--label2)',fontFamily:FT,marginBottom:10,textAlign:'center',background:'rgba(0,122,255,0.06)',padding:'8px 12px',borderRadius:8}}>DEV код: <span style={{fontWeight:700,color:'#007AFF',letterSpacing:2}}>{devCode}</span></div>}
            <div className="tap" onClick={()=>!authLoading&&verifyOtp()}
              style={{padding:'16px',borderRadius:14,background:authLoading||otpInput.length<6?'rgba(0,122,255,0.3)':'#007AFF',textAlign:'center',marginBottom:12}}>
              <span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>{authLoading?'Проверка...':'Подтвердить'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div className="tap" onClick={()=>{setAuthStep('phone');setOtpInput('');setAuthErr('');setDevCode('');}}
                style={{fontSize:14,color:'#007AFF',fontFamily:FT}}>← Изменить номер</div>
              {countdown>0?(
                <span style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>Повторить через {countdown}с</span>
              ):(
                <div className="tap" onClick={sendOtp} style={{fontSize:14,color:'#007AFF',fontFamily:FT}}>Отправить повторно</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer info */}
      <div style={{textAlign:'center',marginTop:20,padding:'0 10px'}}>
        <span style={{fontSize:11,color:'var(--label2)',fontFamily:FT,lineHeight:1.4}}>Нажимая «Получить код», вы соглашаетесь с <span style={{color:'#007AFF'}}>условиями использования</span> и <span style={{color:'#007AFF'}}>политикой конфиденциальности</span></span>
      </div>
    </div>
  );

  // === LOGGED IN: iOS grouped menu ===
  if(loading) return <div style={{padding:60,textAlign:'center'}}><Spinner/></div>;

  return(
    <div style={{paddingBottom:40}}>
      {/* Passport Card */}
      <div style={{padding:'12px 20px 0'}}>
        <div style={{borderRadius:24,background:'linear-gradient(160deg,#0A1A10,#1D3D25,#2A5433)',padding:'24px 20px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,opacity:.03,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)',backgroundSize:'14px 14px'}}/>
          <div style={{position:'absolute',top:12,right:12,width:52,height:52,borderRadius:26,border:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>ð</div>
          <div style={{position:'relative'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:2,fontFamily:FT,textTransform:'uppercase'}}>ÐÐÐ¡ÐÐÐ Ð¢ ÐÐ£Ð¢ÐÐ¨ÐÐ¡Ð¢ÐÐÐÐÐÐÐ</div>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:8}}>{profile?.name||session?.user?.email||'ÐÐ¾ÑÑÑ'}</div>
            <div style={{display:'flex',gap:20,marginTop:16}}>
              <div><div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:FD}}>{visitedC.length}<span style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>/96</span></div><div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT}}>Ð¡ÑÑÐ°Ð½</div></div>
              <div><div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:FD}}>{visitedR.length}<span style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>/85</span></div><div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT}}>Ð ÐµÐ³Ð¸Ð¾Ð½Ð¾Ð²</div></div>
              <div><div style={{fontSize:20,fontWeight:700,color:'#FFD60A',fontFamily:FD}}>{pts}</div><div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT}}>ÐÐ°Ð»Ð»Ð¾Ð²</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Level */}
      <div style={{padding:'12px 20px 0'}}>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:22}}>{curLvl?.icon||'ð±'}</span>
              <div style={{fontSize:15,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{curLvl?.name_ru||'ÐÐ¾ÑÑÑ'}</div>
            </div>
            {nxtLvl&&<div style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>ÐÐ¾ {nxtLvl.name_ru}: {nxtLvl.min_points-pts}</div>}
          </div>
          <div style={{height:5,borderRadius:3,background:'var(--fill4)',overflow:'hidden'}}><div style={{height:'100%',borderRadius:3,background:curLvl?.color||'#8E8E93',width:lvlPct+'%'}}/></div>
        </div>
      </div>

      {/* QR Button */}
      <div style={{padding:'12px 20px 0'}}>
        <div className="tap" onClick={onQR} style={{borderRadius:16,background:'#007AFF',padding:'15px',textAlign:'center'}}>
          <span style={{fontSize:16,fontWeight:600,color:'#fff',fontFamily:FT}}>ð·  Ð¡ÐºÐ°Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ QR-ÐºÐ¾Ð´</span>
        </div>
      </div>

      {/* ÐÐ¾Ð»Ð»ÐµÐºÑÐ¸Ñ */}
      <div style={{padding:'20px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>ÐÐ¾Ð»Ð»ÐµÐºÑÐ¸Ñ</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="ð" label="Ð¡ÑÑÐ°Ð½Ñ Ð¼Ð¸ÑÐ°" value={visitedC.length+'/96'} onClick={()=>setView('countries')}/>
          <Row icon="ð·ðº" label="Ð ÐµÐ³Ð¸Ð¾Ð½Ñ Ð Ð¾ÑÑÐ¸Ð¸" value={visitedR.length+'/85'} onClick={()=>setView('regions')}/>
          <Row icon="ð" label="ÐÐ¾ÑÑÐ¸Ð¶ÐµÐ½Ð¸Ñ" value={unlockedAchs.length+'/'+achievements.length} onClick={()=>setView('achievements')} last/>
        </div>
      </div>

      {/* ÐÐ¾Ð¸ Ð´Ð°Ð½Ð½ÑÐµ */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>ÐÐ¾Ð¸ Ð´Ð°Ð½Ð½ÑÐµ</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="ðï¸" label="ÐÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ñ" value={bookings.length+''} onClick={()=>setView('bookings')}/>
          <Row icon="â¤ï¸" label="ÐÐ·Ð±ÑÐ°Ð½Ð½Ð¾Ðµ" value={favs.length+''} onClick={()=>setView('favorites')}/>
          <Row icon="ð" label="ÐÐ¾Ð¸ Ð¾ÑÐ·ÑÐ²Ñ" value={revs.length+''} onClick={()=>setView('reviews')} last/>
        </div>
      </div>

      {/* ÐÐ¾ÑÐµÐ»ÑÐº */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>ÐÐ¾ÑÐµÐ»ÑÐº</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="â­" label="ÐÐ°Ð»Ð»Ñ" value={pts+' Ð¾Ñ.'} onClick={()=>setView('wallet')}/>
          <Row icon="ð" label="PRO Ð¿Ð¾Ð´Ð¿Ð¸ÑÐºÐ°" value="990 â½/Ð¼ÐµÑ" onClick={()=>setShowPro(!showPro)} last/>
        </div>
        {showPro&&subPlans.filter((p:any)=>p.slug!=='free').length>0&&(
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginTop:8}}>
            {subPlans.filter((p:any)=>p.slug!=='free').map((plan:any,i:number,arr:any[])=>{
              const features=typeof plan.features==='string'?JSON.parse(plan.features):plan.features||[];
              return(<div key={plan.id||i} style={{padding:14,borderBottom:i<arr.length-1?'0.5px solid var(--sep)':'none'}}>
                <div style={{fontSize:16,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{plan.name_ru} <span style={{fontSize:13,color:'var(--label3)',fontWeight:400}}>{plan.price_monthly} â½/Ð¼ÐµÑ</span></div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>{features.map((f:string,j:number)=>(<span key={j} style={{fontSize:11,color:'var(--green)',background:'rgba(52,199,89,.08)',padding:'2px 8px',borderRadius:6,fontFamily:FT}}>â {f}</span>))}</div>
                <div className="tap" onClick={async()=>{if(!session?.user?.id){alert('ÐÐ¾Ð¹Ð´Ð¸ÑÐµ Ð² Ð°ÐºÐºÐ°ÑÐ½Ñ');return;}const ok=confirm('ÐÑÐ¾ÑÐ¼Ð¸ÑÑ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐºÑ Â«'+plan.name_ru+'Â» Ð·Ð° '+plan.price_monthly+' â½/Ð¼ÐµÑ?');if(!ok)return;await fetch(SB_URL+'/rest/v1/subscriptions',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({user_id:session.user.id,plan_id:plan.id,status:'active',started_at:new Date().toISOString(),expires_at:new Date(Date.now()+30*86400000).toISOString()})});await fetch(SB_URL+'/rest/v1/orders',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({type:'service',items:JSON.stringify([{name:'PRO: '+plan.name_ru,qty:1}]),total:plan.price_monthly,guest_name:profile?.name||'',status:'paid'})});alert('ÐÐ¾Ð´Ð¿Ð¸ÑÐºÐ° Â«'+plan.name_ru+'Â» Ð°ÐºÑÐ¸Ð²Ð¸ÑÐ¾Ð²Ð°Ð½Ð°!');}} style={{marginTop:10,padding:'11px',borderRadius:14,background:'linear-gradient(135deg,#007AFF,#5856D6)',textAlign:'center'}}>
                  <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>ÐÑÐ¾ÑÐ¼Ð¸ÑÑ Ð·Ð° {plan.price_monthly} â½/Ð¼ÐµÑ</span>
                </div>
              </div>);
            })}
          </div>
        )}
      </div>

      {/* ÐÐºÐºÐ°ÑÐ½Ñ */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',paddingLeft:16,marginBottom:6}}>ÐÐºÐºÐ°ÑÐ½Ñ</div>
        <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
          <Row icon="âï¸" label="ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸" onClick={()=>setView('settings')} last/>
        </div>
        <div className="tap" onClick={onLogout} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px',textAlign:'center',marginTop:8}}>
          <span style={{fontSize:15,fontWeight:500,color:'#FF3B30',fontFamily:FT}}>ÐÑÐ¹ÑÐ¸ Ð¸Ð· Ð°ÐºÐºÐ°ÑÐ½ÑÐ°</span>
        </div>
      </div>
    </div>
  );
}

// âââ ETHNOMIR TAB ââââââââââââââââââââââââââââââââââââââââââââ
function EthnoMirTab() {
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
      <div className="tap" onClick={()=>setSelectedArticle(null)} style={{display:"flex",alignItems:"center",gap:6,padding:"14px 20px"}}>
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none"><path d="M9 1L1 9l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{fontSize:17,color:"#007AFF",fontFamily:FT}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ</span>
      </div>
      <div style={{padding:"0 20px"}}>
        <div style={{fontSize:11,fontWeight:600,color:"#007AFF",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>{selectedArticle.category==="news"?"ÐÐ¾Ð²Ð¾ÑÑÑ":selectedArticle.category==="blog"?"ÐÐ»Ð¾Ð³":selectedArticle.category==="press"?"ÐÑÐµÑÑÐ°":"ÐÐ½Ð¾Ð½Ñ"}</div>
        <div style={{fontSize:28,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.6px",lineHeight:1.15,marginBottom:12}}>{selectedArticle.title_ru}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
          {selectedArticle.author_name&&<span style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{selectedArticle.author_name}</span>}
          <span style={{fontSize:13,color:"var(--label3)",fontFamily:FT}}>{selectedArticle.published_at?new Date(selectedArticle.published_at).toLocaleDateString("ru",{day:"numeric",month:"long",year:"numeric"}):""}</span>
        </div>
        <div style={{fontSize:16,color:"var(--label)",fontFamily:FT,lineHeight:1.65,whiteSpace:"pre-line"}}>{selectedArticle.body_ru}</div>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"14px 20px 0"}}>
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.8px"}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ</div>
      </div>

      {/* Hero Card */}
      <div style={{padding:"16px 20px"}}>
        <div style={{borderRadius:24,background:"linear-gradient(145deg,#0A1A10 0%,#1D3D25 50%,#2D5A3D 100%)",padding:"28px 22px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 12px)",backgroundSize:"17px 17px"}}/>
          <div style={{position:"absolute",right:16,top:16,fontSize:64,opacity:.08}}>ð</div>
          <div style={{position:"relative"}}>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",letterSpacing:2,textTransform:"uppercase",fontFamily:FT}}>Ð­Ð¢ÐÐÐÐ ÐÐ¤ÐÐ§ÐÐ¡ÐÐÐ ÐÐÐ Ð-ÐÐ£ÐÐÐ</div>
            <div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:8,lineHeight:1.2}}>ÐÐ¸Ñ Ð½Ð°ÑÐ¸Ð½Ð°ÐµÑÑÑ<br/>Ñ ÑÐµÐ±Ñ</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.55)",fontFamily:FT,marginTop:8}}>Ð¡ {parkInfo.founded_year||"2007"} Ð³Ð¾Ð´Ð° Â· {parkInfo.countries_count||"96"} ÑÑÑÐ°Ð½ Ð¼Ð¸ÑÐ° Â· {parkInfo.address||"ÐÐ°Ð»ÑÐ¶ÑÐºÐ°Ñ Ð¾Ð±Ð»Ð°ÑÑÑ"}</div>
            
          </div>
        </div>
      </div>

      {/* Articles */}
      {articles.length>0&&(
        <div style={{padding:"0 20px 16px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:12}}>ÐÐ¾Ð²Ð¾ÑÑÐ¸</div>
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:4,marginRight:-20}}>
            {articles.map((a:any)=>(
              <div key={a.id} className="tap" onClick={()=>setSelectedArticle(a)} style={{minWidth:220,maxWidth:220,borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",flexShrink:0}}>
                <div style={{padding:"14px 14px 12px"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{a.cover_emoji}</div>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.title_ru}</div>
                  <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:6}}>{a.category==='news'?'ÐÐ¾Ð²Ð¾ÑÑÑ':a.category==='blog'?'ÐÐ»Ð¾Ð³':a.category==='press'?'ÐÑÐµÑÑÐ°':'ÐÐ½Ð¾Ð½Ñ'} Â· {a.published_at?new Date(a.published_at).toLocaleDateString('ru',{day:'numeric',month:'short'}):''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heritage Timeline */}
      {heritage.length>0&&(
        <div style={{padding:"0 20px 16px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>ÐÐ°ÑÐ»ÐµÐ´Ð¸Ðµ</div>
          <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:14}}>ÐÑÑÐ¾ÑÐ¸Ñ Ð­ÑÐ½Ð¾Ð¼Ð¸ÑÐ°</div>
          <div style={{borderLeft:"2px solid var(--sep-opaque)",marginLeft:8,paddingLeft:20}}>
            {heritage.filter((h:any)=>h.year).slice(0,5).map((h:any,i:number)=>(
              <div key={h.id} className={"fu s"+Math.min(i+1,6)} style={{position:"relative",marginBottom:20}}>
                <div style={{position:"absolute",left:-28,top:2,width:14,height:14,borderRadius:7,background:"#007AFF",border:"2px solid var(--bg)"}}/>
                <div style={{fontSize:12,fontWeight:700,color:"#007AFF",fontFamily:FD}}>{h.year}</div>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,marginTop:2}}>{h.title_ru}</div>
                {h.content_ru&&<div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:4,lineHeight:1.4}}>{h.content_ru.substring(0,100)}{h.content_ru.length>100?'...':''}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business & Partnership */}
      <div style={{padding:"0 20px 16px"}}>
        <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:4}}>ÐÐ¸Ð·Ð½ÐµÑ</div>
        <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginBottom:12}}>ÐÐ°ÑÑÐ½ÑÑÑÑÐ²Ð¾ Ð¸ Ð²Ð¾Ð·Ð¼Ð¾Ð¶Ð½Ð¾ÑÑÐ¸</div>
        <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[...partners.map((p:any)=>({emoji:p.cover_emoji||'ð¼',label:p.name_ru,desc:p.description_ru})),...b2b.map((b:any)=>({emoji:b.cover_emoji||'ð¤',label:b.title,desc:b.description_ru}))].map((item:any,j:number,arr:any[])=>(
            <div key={j}>
              <div className="tap" onClick={()=>setExpandedBiz(expandedBiz===j?null:j)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:(j<arr.length-1&&expandedBiz!==j)?"0.5px solid var(--sep)":"none"}}>
                <div style={{width:34,height:34,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{item.emoji}</div>
                <div style={{flex:1}}><span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{item.label}</span></div>
                <span style={{fontSize:17,color:"var(--label4)",transform:expandedBiz===j?"rotate(90deg)":"none",transition:"transform .2s"}}>âº</span>
              </div>
              {expandedBiz===j&&(
                <div style={{padding:"0 16px 14px",borderBottom:j<arr.length-1?"0.5px solid var(--sep)":"none"}}>
                  <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{item.desc}</div>
                  <div className="tap" onClick={()=>{const n=prompt("ÐÐ°ÑÐµ Ð¸Ð¼Ñ:");if(!n)return;const p=prompt("Ð¢ÐµÐ»ÐµÑÐ¾Ð½:");if(!p)return;submitContactRequest("partnership",item.label,n,p,"ÐÐ°ÑÐ²ÐºÐ° Ð½Ð°: "+item.label);alert("ÐÐ°ÑÐ²ÐºÐ° Ð¾ÑÐ¿ÑÐ°Ð²Ð»ÐµÐ½Ð°!");}} style={{padding:"11px",borderRadius:14,background:"#007AFF",textAlign:"center"}}>
                    <span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:FT}}>ÐÑÑÐ°Ð²Ð¸ÑÑ Ð·Ð°ÑÐ²ÐºÑ</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      {faqs.length>0&&(
        <div style={{padding:"0 20px 16px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:12}}>ÐÐ¾Ð¿ÑÐ¾ÑÑ Ð¸ Ð¾ÑÐ²ÐµÑÑ</div>
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
            {faqs.slice(0,6).map((f:any,j:number,arr:any[])=>(
              <div key={f.id}>
                <div className="tap" onClick={()=>setExpandedFaq(expandedFaq===f.id?null:f.id)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:(j<arr.length-1&&expandedFaq!==f.id)?"0.5px solid var(--sep)":"none"}}>
                  <div style={{flex:1}}><span style={{fontSize:15,fontWeight:500,color:"var(--label)",fontFamily:FT}}>{f.question_ru}</span></div>
                  <span style={{fontSize:16,color:"var(--label3)",transform:expandedFaq===f.id?"rotate(90deg)":"none",transition:"transform .2s"}}>âº</span>
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
        <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:16,marginBottom:6}}>ÐÐ¾Ð´Ð´ÐµÑÐ¶ÐºÐ°</div>
        <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          {[["ð","ÐÐ¾Ð½ÑÐ°ÐºÑÑ","+7 (495) 023-43-49",()=>window.open("tel:+74950234349")],["ð§","ÐÐ°Ð¿Ð¸ÑÐ°ÑÑ Ð½Ð°Ð¼","ÐÐ±ÑÐ°ÑÐ½Ð°Ñ ÑÐ²ÑÐ·Ñ",()=>{const n=prompt("ÐÐ°ÑÐµ Ð¸Ð¼Ñ:");if(!n)return;const m=prompt("ÐÐ°ÑÐµ ÑÐ¾Ð¾Ð±ÑÐµÐ½Ð¸Ðµ:");if(!m)return;submitContactRequest("feedback","ethnomir_tab",n,"",m);alert("Ð¡Ð¿Ð°ÑÐ¸Ð±Ð¾! ÐÑ Ð¾ÑÐ²ÐµÑÐ¸Ð¼ Ð² Ð±Ð»Ð¸Ð¶Ð°Ð¹ÑÐµÐµ Ð²ÑÐµÐ¼Ñ.");}]].map(([ic,lb,sub,fn]:any,j:number,a:any[])=>(
            <div key={j} className="tap" onClick={()=>fn&&fn()} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:j<a.length-1?"0.5px solid var(--sep)":"none"}}>
              <div style={{width:34,height:34,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{ic}</div>
              <div style={{flex:1}}><div style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{lb}</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{sub}</div></div>
              <span style={{fontSize:17,color:"var(--label4)"}}>âº</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:'center',padding:'32px 0 48px'}}>
              <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FD}}>Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ.</div>
              <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:3}}>ÐÑÑÐ¿Ð½ÐµÐ¹ÑÐ¸Ð¹ Ð¿Ð°ÑÐº Ð Ð¤</div>
              <div style={{marginTop:14,fontSize:12,color:'var(--label3)',fontFamily:FT,lineHeight:1.7}}>Ð¡ 9:00 Ð´Ð¾ 21:00 ÐµÐ¶ÐµÐ´Ð½ÐµÐ²Ð½Ð¾<br/>+7 (495) 023-43-49</div>
              <div style={{marginTop:14}}><span className="tap" onClick={()=>window.open('https://billionsx.com','_blank')} style={{fontSize:12,color:'var(--blue)',cursor:'pointer'}}>Ð Ð°Ð·ÑÐ°Ð±Ð¾ÑÑÐ¸Ðº Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ billionsx.com</span></div>
            </div>
    </div>
  );
}

// âââ TAB BAR ââââââââââââââââââââââââââââââââââââââââââââââ
function TabBar({ active, onSelect }:{ active:Tab; onSelect:(t:Tab)=>void }) {
  const tabs:[Tab,string,(on:boolean)=>any][] = [
    ["home","ÐÐ°ÑÐº",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#007AFF"/><path d="M2 12h20M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10c-2.5-3-4-6.5-4-10s1.5-7 4-10z" stroke="#fff" strokeWidth="1.3" fill="none"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.25" stroke="#3C3C43" strokeWidth="1.5"/><path d="M2.5 12h19M12 2.5c2.3 2.8 3.7 6.2 3.7 9.5s-1.4 6.7-3.7 9.5c-2.3-2.8-3.7-6.2-3.7-9.5s1.4-6.7 3.7-9.5z" stroke="#3C3C43" strokeWidth="1.5"/></svg>],
    ["tours","ÐÐ¸Ð»ÐµÑÑ",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" fill="#007AFF"/><circle cx="2" cy="12" r="2.5" fill="#F2F2F7"/><circle cx="22" cy="12" r="2.5" fill="#F2F2F7"/><path d="M9 5v14" stroke="#fff" strokeWidth="1" strokeDasharray="2 2" opacity=".5"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2.75" y="5.75" width="18.5" height="12.5" rx="2.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="2" cy="12" r="2.5" fill="#F2F2F7" stroke="#3C3C43" strokeWidth="1"/><circle cx="22" cy="12" r="2.5" fill="#F2F2F7" stroke="#3C3C43" strokeWidth="1"/><path d="M9 6v12" stroke="#3C3C43" strokeWidth="1" strokeDasharray="2 2"/></svg>],
    ["stay","ÐÐ¸Ð»ÑÑ",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" fill="#007AFF"/><rect x="9" y="14" width="6" height="8" rx=".5" fill="#fff"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="#3C3C43" strokeWidth="1.5" strokeLinejoin="round"/><rect x="9" y="14" width="6" height="8" rx=".5" stroke="#3C3C43" strokeWidth="1.5"/></svg>],
    ["services","Ð£ÑÐ»ÑÐ³Ð¸",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="7" cy="7" r="4" fill="#007AFF"/><circle cx="17" cy="7" r="4" fill="#007AFF"/><circle cx="7" cy="17" r="4" fill="#007AFF"/><circle cx="17" cy="17" r="4" fill="#007AFF"/></svg>
      : <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="17" cy="7" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="7" cy="17" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/><circle cx="17" cy="17" r="3.25" stroke="#3C3C43" strokeWidth="1.5"/></svg>],
    ["passport","Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ",(on)=>on
      ? <svg width="26" height="26" viewBox="0 0 620 620"><path d="M300.898 0C300.381 3.71918 300.215 7.43805 300.959 11.1572C300.959 14.8153 300.959 17.255 299.739 20.9131C298.52 28.2291 294.861 34.3261 289.982 40.4229C282.665 47.739 276.568 57.4938 272.909 68.4678C268.031 78.2227 266.811 89.1976 266.811 100.172C266.811 103.83 266.811 106.269 265.592 109.927C264.372 117.243 260.713 123.34 255.835 129.437C248.518 136.753 242.419 146.507 238.761 157.481C235.102 168.456 232.663 178.211 233.883 189.186C233.883 192.844 233.883 195.282 232.663 198.94C231.443 206.257 227.785 212.353 222.906 218.45C215.589 225.766 209.491 235.522 205.832 246.496C202.173 257.47 199.735 267.225 200.954 278.199C200.954 281.857 200.954 284.296 199.734 287.954C198.515 294.051 194.856 300.148 191.197 305.025C192.417 306.245 194.857 306.244 196.076 307.464L355.84 64.8096L229.004 324.535C230.223 324.535 230.224 325.755 231.443 325.755C236.322 322.097 241.2 318.438 244.858 312.342C246.078 309.903 247.298 306.244 248.518 303.806C250.957 294.051 255.835 284.296 263.152 275.761C270.47 267.225 279.007 259.909 288.764 255.031C294.861 251.373 299.739 246.495 304.617 240.398C305.837 237.96 307.057 234.302 308.276 231.863C310.716 222.108 315.594 212.353 322.911 203.817C330.229 195.282 338.766 187.966 348.522 183.089C354.62 179.431 359.499 174.553 364.377 168.456C365.596 166.017 366.816 162.36 368.035 159.921C370.474 150.166 375.353 140.411 382.67 131.875C389.987 123.339 398.525 116.023 408.281 111.146C414.379 107.487 419.258 102.61 424.136 96.5137C424.136 90.4168 425.356 87.9774 426.575 84.3193C429.014 74.5646 433.893 64.8099 441.21 56.2744C448.527 47.739 449.747 48.9583 443.649 58.7129C437.552 68.4677 432.673 78.2227 430.233 87.9775C429.014 90.4163 427.795 92.8556 426.575 96.5137C422.917 103.83 418.038 108.707 411.94 112.365C403.404 118.462 394.866 125.778 388.769 134.313C382.671 144.068 377.792 153.824 375.353 163.579C374.133 167.237 374.133 169.676 371.694 172.114C368.036 179.43 363.157 184.308 357.06 187.966C348.523 194.063 339.986 201.379 333.888 209.915C327.79 218.451 322.911 229.425 320.472 239.18C319.252 242.838 319.252 245.276 316.813 247.715C313.155 255.031 308.276 259.908 302.179 263.566C293.642 269.663 285.105 276.98 279.007 285.516C272.909 295.271 268.031 305.025 265.592 314.78C264.372 318.438 264.372 320.877 261.933 323.315C259.494 329.412 254.616 334.29 249.737 337.948L253.396 341.606L470.479 151.385L285.104 372.091L287.544 374.529C293.642 372.091 298.52 369.652 303.398 364.774C305.838 362.336 307.057 359.897 309.496 357.458C314.374 348.922 321.692 340.386 331.448 333.07C339.985 325.754 350.961 322.096 360.718 319.657C368.035 318.438 374.133 314.78 379.012 308.684C381.451 306.245 382.67 303.806 385.109 301.367C389.988 292.832 397.305 284.296 407.062 276.979C415.598 269.663 426.575 266.005 436.331 263.566C443.648 262.347 449.747 258.689 454.625 252.593C457.064 250.154 458.284 247.715 460.723 245.276C465.601 236.741 472.918 228.205 482.675 220.889C491.212 213.572 502.189 209.914 511.945 207.476C519.262 206.256 525.36 202.598 530.238 196.502C532.677 194.063 533.897 191.624 536.336 189.186C541.214 180.65 548.532 172.114 558.289 164.798C566.826 157.482 568.045 159.921 559.509 167.236C550.972 174.553 544.873 183.089 539.995 192.844C538.776 195.282 536.337 198.94 535.117 201.379C530.239 207.476 524.141 211.134 516.823 213.572C507.067 217.23 497.31 222.109 488.773 229.425C480.236 236.741 474.138 245.276 469.26 255.031C468.04 257.47 465.601 259.909 464.382 263.566C459.504 269.663 453.405 273.322 446.088 275.761C436.331 279.419 426.575 284.296 418.038 291.612C409.501 298.928 403.403 307.464 398.524 317.219C397.305 319.657 394.866 322.097 393.646 325.755C388.768 331.852 382.67 335.51 375.353 337.948C365.596 341.606 355.84 346.484 347.303 353.8C338.766 361.116 332.667 369.652 327.789 379.407C326.569 381.846 324.131 384.285 322.911 387.942C318.033 392.82 313.154 396.478 307.057 398.917L310.716 402.574L560.728 263.566L327.789 431.84C327.789 433.059 329.009 433.059 329.009 434.278C335.107 434.278 341.205 431.84 347.303 428.182C349.742 426.962 352.181 425.742 354.62 423.304C361.938 415.988 370.475 409.891 381.451 405.014C392.427 400.136 402.183 398.917 413.159 398.917C420.477 398.917 427.795 396.477 433.893 392.819C436.332 391.6 438.771 389.161 441.21 386.723C448.527 379.407 457.064 373.31 468.04 368.433C479.016 363.555 488.773 362.336 499.749 362.336C507.066 362.336 514.385 359.896 520.482 356.238C522.921 355.019 525.361 352.58 527.8 350.142C535.117 342.826 543.654 336.729 554.63 331.852C565.606 326.974 575.363 325.755 586.339 325.755C593.656 325.755 600.973 323.315 607.071 319.657C609.51 318.438 611.95 315.999 614.389 313.561C616.086 311.863 617.972 310.166 619.995 308.521C619.997 308.97 620 309.418 620 309.867C620 312.522 619.966 315.169 619.899 317.808C619.689 318.018 619.478 318.228 619.268 318.438C616.829 320.877 614.389 323.316 611.95 324.535C605.852 329.413 598.534 331.852 591.217 331.852C580.241 333.071 570.485 335.509 559.509 340.387C549.752 345.264 541.215 352.58 533.897 359.896C531.458 362.335 529.019 364.775 526.58 365.994C520.482 370.872 513.164 373.31 505.847 373.31C494.871 374.529 485.115 376.968 474.139 381.846C464.382 386.723 455.845 394.039 448.527 401.355C446.088 403.794 443.649 406.233 441.21 407.452C435.112 412.33 427.794 414.769 420.477 414.769C409.501 415.988 398.525 418.426 388.769 423.304C379.012 428.181 370.475 435.497 363.157 442.813C360.718 445.252 358.279 447.692 355.84 448.911C350.962 452.569 344.863 455.007 338.766 456.227C339.985 457.446 339.986 459.885 341.205 461.104L608.177 394.952C607.955 395.73 607.73 396.505 607.503 397.28L353.4 498.904C353.4 500.124 353.401 500.124 354.62 501.344C360.718 502.563 366.816 502.563 374.133 500.124C377.791 501.343 380.231 500.124 382.67 498.904C391.207 492.808 402.183 489.15 413.159 487.931C424.135 486.711 435.112 486.711 446.088 489.149C453.405 490.369 460.723 490.369 468.04 487.931C471.699 486.711 474.138 485.492 476.577 484.272C485.114 478.176 496.09 474.517 507.066 473.298C518.043 472.078 529.019 472.079 539.995 474.518C547.313 475.737 554.63 475.737 561.947 473.298C565.606 472.078 568.045 470.859 570.484 469.64C572.963 467.869 575.649 466.305 578.479 464.946C574.459 471.892 570.177 478.668 565.646 485.259C564.544 485.787 563.333 486.249 561.947 486.711C554.63 489.15 547.313 490.369 539.995 489.149C529.019 486.711 518.043 487.93 507.066 490.369C496.09 492.808 486.334 497.685 477.797 503.782C475.358 505.002 472.918 507.441 469.26 508.66C461.942 511.099 454.625 512.318 447.308 511.099C436.331 508.66 425.355 509.879 414.379 512.317C403.403 514.756 393.646 519.634 385.109 525.73C382.67 526.95 380.231 529.389 376.572 530.608C370.475 533.047 364.377 534.266 358.279 533.047C358.279 535.486 359.498 537.925 359.498 540.363L522.015 536.029C516.149 541.53 510.069 546.806 503.789 551.842L364.377 573.286V579.383C370.475 581.821 376.572 583.041 382.67 581.821C386.329 581.821 388.768 580.602 392.427 579.383C402.183 575.725 413.16 574.505 424.136 575.725C434.828 576.912 445.52 579.258 455.085 583.888C444.491 589.508 433.533 594.534 422.255 598.917C411.91 599.176 401.626 601.541 392.427 604.99C389.988 606.21 386.329 607.429 382.67 607.429C376.572 608.648 369.255 607.428 363.157 606.209V609.867H388.396C363.355 616.392 337.084 619.867 310 619.867C138.792 619.867 0 481.075 0 309.867C0 258.017 12.7306 209.14 35.2354 166.19C35.478 171.01 34.6765 175.83 33.873 180.649C30.2144 190.404 28.9944 201.379 30.2139 213.572C31.4334 224.547 35.0924 235.521 39.9707 244.057C41.1903 246.495 42.4093 250.154 43.6289 252.593C44.8484 258.689 44.8484 264.786 43.6289 270.883H50.9463L67.8076 116.349C73.2274 109.575 78.9248 103.032 84.8838 96.7402L91.1924 273.321H93.6318C96.0709 268.444 98.5098 262.347 98.5098 255.031C98.5098 251.373 98.5096 248.934 97.29 245.276C94.8509 235.521 94.8509 224.547 97.29 213.572C99.7292 202.598 103.389 192.844 109.486 183.089C113.145 176.992 115.584 169.676 115.584 162.359C115.584 158.701 115.584 156.263 114.364 152.604C114.364 144.069 114.365 133.094 116.804 122.12C119.243 111.146 122.901 101.391 128.999 91.6357C132.658 85.5389 135.097 78.2224 135.097 70.9062C135.097 67.2484 135.097 64.8093 133.878 61.1514C133.417 59.3093 133.043 57.4238 132.757 55.5029C136.318 53.0169 139.933 50.6037 143.602 48.2656C144.089 53.1461 144.952 57.8874 146.073 62.3711C147.293 64.8098 147.293 68.4679 147.293 72.126C147.293 79.4421 146.074 86.7587 142.415 92.8555C137.537 102.61 133.878 112.366 131.438 123.34C130.219 134.314 131.439 145.288 133.878 155.043C135.097 157.482 135.097 161.14 135.097 164.798C135.097 172.114 133.877 179.431 130.219 185.527C125.34 195.282 121.682 205.037 119.243 216.012C118.024 226.986 119.243 237.96 121.682 247.715C122.901 250.154 122.901 253.812 122.901 257.47C122.901 263.567 121.682 270.883 119.243 275.761C120.463 275.761 122.902 276.979 124.121 276.979L220.454 12.9971C220.81 12.8899 221.165 12.7817 221.521 12.6758L161.928 287.954C163.147 287.954 163.148 289.174 164.367 289.174C168.026 284.296 171.684 279.418 174.123 273.321C175.343 269.663 175.343 267.224 175.343 263.566C175.343 252.592 177.782 242.837 182.66 231.863C188.758 224.547 196.076 216.012 203.394 208.695C208.272 203.818 213.15 197.72 214.369 190.404C215.589 186.746 215.589 184.307 215.589 180.649C215.589 169.675 218.028 159.92 222.906 148.946C227.785 139.191 233.883 129.437 242.42 123.34C247.298 118.462 252.176 112.365 253.396 105.049C255.835 101.391 255.835 98.952 257.055 95.2939C257.055 84.3197 259.494 74.565 264.372 63.5908C269.25 53.8359 275.348 44.0802 283.885 37.9834C288.763 33.106 293.642 27.0095 294.861 19.6934C296.081 16.0353 296.081 13.5965 296.081 9.93848C296.081 6.42042 296.488 3.30839 297.065 0.133789C298.341 0.0814298 299.619 0.0368953 300.898 0Z" fill="#007AFF"/></svg>
      : <svg width="26" height="26" viewBox="0 0 620 620"><path d="M300.898 0C300.381 3.71918 300.215 7.43805 300.959 11.1572C300.959 14.8153 300.959 17.255 299.739 20.9131C298.52 28.2291 294.861 34.3261 289.982 40.4229C282.665 47.739 276.568 57.4938 272.909 68.4678C268.031 78.2227 266.811 89.1976 266.811 100.172C266.811 103.83 266.811 106.269 265.592 109.927C264.372 117.243 260.713 123.34 255.835 129.437C248.518 136.753 242.419 146.507 238.761 157.481C235.102 168.456 232.663 178.211 233.883 189.186C233.883 192.844 233.883 195.282 232.663 198.94C231.443 206.257 227.785 212.353 222.906 218.45C215.589 225.766 209.491 235.522 205.832 246.496C202.173 257.47 199.735 267.225 200.954 278.199C200.954 281.857 200.954 284.296 199.734 287.954C198.515 294.051 194.856 300.148 191.197 305.025C192.417 306.245 194.857 306.244 196.076 307.464L355.84 64.8096L229.004 324.535C230.223 324.535 230.224 325.755 231.443 325.755C236.322 322.097 241.2 318.438 244.858 312.342C246.078 309.903 247.298 306.244 248.518 303.806C250.957 294.051 255.835 284.296 263.152 275.761C270.47 267.225 279.007 259.909 288.764 255.031C294.861 251.373 299.739 246.495 304.617 240.398C305.837 237.96 307.057 234.302 308.276 231.863C310.716 222.108 315.594 212.353 322.911 203.817C330.229 195.282 338.766 187.966 348.522 183.089C354.62 179.431 359.499 174.553 364.377 168.456C365.596 166.017 366.816 162.36 368.035 159.921C370.474 150.166 375.353 140.411 382.67 131.875C389.987 123.339 398.525 116.023 408.281 111.146C414.379 107.487 419.258 102.61 424.136 96.5137C424.136 90.4168 425.356 87.9774 426.575 84.3193C429.014 74.5646 433.893 64.8099 441.21 56.2744C448.527 47.739 449.747 48.9583 443.649 58.7129C437.552 68.4677 432.673 78.2227 430.233 87.9775C429.014 90.4163 427.795 92.8556 426.575 96.5137C422.917 103.83 418.038 108.707 411.94 112.365C403.404 118.462 394.866 125.778 388.769 134.313C382.671 144.068 377.792 153.824 375.353 163.579C374.133 167.237 374.133 169.676 371.694 172.114C368.036 179.43 363.157 184.308 357.06 187.966C348.523 194.063 339.986 201.379 333.888 209.915C327.79 218.451 322.911 229.425 320.472 239.18C319.252 242.838 319.252 245.276 316.813 247.715C313.155 255.031 308.276 259.908 302.179 263.566C293.642 269.663 285.105 276.98 279.007 285.516C272.909 295.271 268.031 305.025 265.592 314.78C264.372 318.438 264.372 320.877 261.933 323.315C259.494 329.412 254.616 334.29 249.737 337.948L253.396 341.606L470.479 151.385L285.104 372.091L287.544 374.529C293.642 372.091 298.52 369.652 303.398 364.774C305.838 362.336 307.057 359.897 309.496 357.458C314.374 348.922 321.692 340.386 331.448 333.07C339.985 325.754 350.961 322.096 360.718 319.657C368.035 318.438 374.133 314.78 379.012 308.684C381.451 306.245 382.67 303.806 385.109 301.367C389.988 292.832 397.305 284.296 407.062 276.979C415.598 269.663 426.575 266.005 436.331 263.566C443.648 262.347 449.747 258.689 454.625 252.593C457.064 250.154 458.284 247.715 460.723 245.276C465.601 236.741 472.918 228.205 482.675 220.889C491.212 213.572 502.189 209.914 511.945 207.476C519.262 206.256 525.36 202.598 530.238 196.502C532.677 194.063 533.897 191.624 536.336 189.186C541.214 180.65 548.532 172.114 558.289 164.798C566.826 157.482 568.045 159.921 559.509 167.236C550.972 174.553 544.873 183.089 539.995 192.844C538.776 195.282 536.337 198.94 535.117 201.379C530.239 207.476 524.141 211.134 516.823 213.572C507.067 217.23 497.31 222.109 488.773 229.425C480.236 236.741 474.138 245.276 469.26 255.031C468.04 257.47 465.601 259.909 464.382 263.566C459.504 269.663 453.405 273.322 446.088 275.761C436.331 279.419 426.575 284.296 418.038 291.612C409.501 298.928 403.403 307.464 398.524 317.219C397.305 319.657 394.866 322.097 393.646 325.755C388.768 331.852 382.67 335.51 375.353 337.948C365.596 341.606 355.84 346.484 347.303 353.8C338.766 361.116 332.667 369.652 327.789 379.407C326.569 381.846 324.131 384.285 322.911 387.942C318.033 392.82 313.154 396.478 307.057 398.917L310.716 402.574L560.728 263.566L327.789 431.84C327.789 433.059 329.009 433.059 329.009 434.278C335.107 434.278 341.205 431.84 347.303 428.182C349.742 426.962 352.181 425.742 354.62 423.304C361.938 415.988 370.475 409.891 381.451 405.014C392.427 400.136 402.183 398.917 413.159 398.917C420.477 398.917 427.795 396.477 433.893 392.819C436.332 391.6 438.771 389.161 441.21 386.723C448.527 379.407 457.064 373.31 468.04 368.433C479.016 363.555 488.773 362.336 499.749 362.336C507.066 362.336 514.385 359.896 520.482 356.238C522.921 355.019 525.361 352.58 527.8 350.142C535.117 342.826 543.654 336.729 554.63 331.852C565.606 326.974 575.363 325.755 586.339 325.755C593.656 325.755 600.973 323.315 607.071 319.657C609.51 318.438 611.95 315.999 614.389 313.561C616.086 311.863 617.972 310.166 619.995 308.521C619.997 308.97 620 309.418 620 309.867C620 312.522 619.966 315.169 619.899 317.808C619.689 318.018 619.478 318.228 619.268 318.438C616.829 320.877 614.389 323.316 611.95 324.535C605.852 329.413 598.534 331.852 591.217 331.852C580.241 333.071 570.485 335.509 559.509 340.387C549.752 345.264 541.215 352.58 533.897 359.896C531.458 362.335 529.019 364.775 526.58 365.994C520.482 370.872 513.164 373.31 505.847 373.31C494.871 374.529 485.115 376.968 474.139 381.846C464.382 386.723 455.845 394.039 448.527 401.355C446.088 403.794 443.649 406.233 441.21 407.452C435.112 412.33 427.794 414.769 420.477 414.769C409.501 415.988 398.525 418.426 388.769 423.304C379.012 428.181 370.475 435.497 363.157 442.813C360.718 445.252 358.279 447.692 355.84 448.911C350.962 452.569 344.863 455.007 338.766 456.227C339.985 457.446 339.986 459.885 341.205 461.104L608.177 394.952C607.955 395.73 607.73 396.505 607.503 397.28L353.4 498.904C353.4 500.124 353.401 500.124 354.62 501.344C360.718 502.563 366.816 502.563 374.133 500.124C377.791 501.343 380.231 500.124 382.67 498.904C391.207 492.808 402.183 489.15 413.159 487.931C424.135 486.711 435.112 486.711 446.088 489.149C453.405 490.369 460.723 490.369 468.04 487.931C471.699 486.711 474.138 485.492 476.577 484.272C485.114 478.176 496.09 474.517 507.066 473.298C518.043 472.078 529.019 472.079 539.995 474.518C547.313 475.737 554.63 475.737 561.947 473.298C565.606 472.078 568.045 470.859 570.484 469.64C572.963 467.869 575.649 466.305 578.479 464.946C574.459 471.892 570.177 478.668 565.646 485.259C564.544 485.787 563.333 486.249 561.947 486.711C554.63 489.15 547.313 490.369 539.995 489.149C529.019 486.711 518.043 487.93 507.066 490.369C496.09 492.808 486.334 497.685 477.797 503.782C475.358 505.002 472.918 507.441 469.26 508.66C461.942 511.099 454.625 512.318 447.308 511.099C436.331 508.66 425.355 509.879 414.379 512.317C403.403 514.756 393.646 519.634 385.109 525.73C382.67 526.95 380.231 529.389 376.572 530.608C370.475 533.047 364.377 534.266 358.279 533.047C358.279 535.486 359.498 537.925 359.498 540.363L522.015 536.029C516.149 541.53 510.069 546.806 503.789 551.842L364.377 573.286V579.383C370.475 581.821 376.572 583.041 382.67 581.821C386.329 581.821 388.768 580.602 392.427 579.383C402.183 575.725 413.16 574.505 424.136 575.725C434.828 576.912 445.52 579.258 455.085 583.888C444.491 589.508 433.533 594.534 422.255 598.917C411.91 599.176 401.626 601.541 392.427 604.99C389.988 606.21 386.329 607.429 382.67 607.429C376.572 608.648 369.255 607.428 363.157 606.209V609.867H388.396C363.355 616.392 337.084 619.867 310 619.867C138.792 619.867 0 481.075 0 309.867C0 258.017 12.7306 209.14 35.2354 166.19C35.478 171.01 34.6765 175.83 33.873 180.649C30.2144 190.404 28.9944 201.379 30.2139 213.572C31.4334 224.547 35.0924 235.521 39.9707 244.057C41.1903 246.495 42.4093 250.154 43.6289 252.593C44.8484 258.689 44.8484 264.786 43.6289 270.883H50.9463L67.8076 116.349C73.2274 109.575 78.9248 103.032 84.8838 96.7402L91.1924 273.321H93.6318C96.0709 268.444 98.5098 262.347 98.5098 255.031C98.5098 251.373 98.5096 248.934 97.29 245.276C94.8509 235.521 94.8509 224.547 97.29 213.572C99.7292 202.598 103.389 192.844 109.486 183.089C113.145 176.992 115.584 169.676 115.584 162.359C115.584 158.701 115.584 156.263 114.364 152.604C114.364 144.069 114.365 133.094 116.804 122.12C119.243 111.146 122.901 101.391 128.999 91.6357C132.658 85.5389 135.097 78.2224 135.097 70.9062C135.097 67.2484 135.097 64.8093 133.878 61.1514C133.417 59.3093 133.043 57.4238 132.757 55.5029C136.318 53.0169 139.933 50.6037 143.602 48.2656C144.089 53.1461 144.952 57.8874 146.073 62.3711C147.293 64.8098 147.293 68.4679 147.293 72.126C147.293 79.4421 146.074 86.7587 142.415 92.8555C137.537 102.61 133.878 112.366 131.438 123.34C130.219 134.314 131.439 145.288 133.878 155.043C135.097 157.482 135.097 161.14 135.097 164.798C135.097 172.114 133.877 179.431 130.219 185.527C125.34 195.282 121.682 205.037 119.243 216.012C118.024 226.986 119.243 237.96 121.682 247.715C122.901 250.154 122.901 253.812 122.901 257.47C122.901 263.567 121.682 270.883 119.243 275.761C120.463 275.761 122.902 276.979 124.121 276.979L220.454 12.9971C220.81 12.8899 221.165 12.7817 221.521 12.6758L161.928 287.954C163.147 287.954 163.148 289.174 164.367 289.174C168.026 284.296 171.684 279.418 174.123 273.321C175.343 269.663 175.343 267.224 175.343 263.566C175.343 252.592 177.782 242.837 182.66 231.863C188.758 224.547 196.076 216.012 203.394 208.695C208.272 203.818 213.15 197.72 214.369 190.404C215.589 186.746 215.589 184.307 215.589 180.649C215.589 169.675 218.028 159.92 222.906 148.946C227.785 139.191 233.883 129.437 242.42 123.34C247.298 118.462 252.176 112.365 253.396 105.049C255.835 101.391 255.835 98.952 257.055 95.2939C257.055 84.3197 259.494 74.565 264.372 63.5908C269.25 53.8359 275.348 44.0802 283.885 37.9834C288.763 33.106 293.642 27.0095 294.861 19.6934C296.081 16.0353 296.081 13.5965 296.081 9.93848C296.081 6.42042 296.488 3.30839 297.065 0.133789C298.341 0.0814298 299.619 0.0368953 300.898 0Z" fill="#8E8E93"/></svg>],
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:100,padding:"0 40px 40px 40px"}}>
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

// âââ TICKETS ââââââââââââââââââââââââââââââââââââââââââââââ
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
        <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>ÐÐ¸Ð»ÐµÑÑ</div>
        <div className="tap" onClick={onClose} style={{width:30,height:30,borderRadius:15,background:"var(--fill)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:15,color:"var(--label2)",fontWeight:600}}>â</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px",paddingBottom:180}}>
        {/* Day type toggle */}
        <div style={{display:"flex",background:"var(--fill4)",borderRadius:12,padding:2,marginBottom:20}}>
          {[[false,"ÐÑÐ´Ð½Ð¸"],[true,"ÐÑÑÐ¾Ð´Ð½ÑÐµ / ÐÑÐ°Ð·Ð´Ð½Ð¸ÐºÐ¸"]].map(([v,l]:any)=>(
            <div key={String(v)} className="tap" onClick={()=>setIsWeekend(v)}
              style={{flex:1,textAlign:"center",padding:"10px 0",borderRadius:10,cursor:"pointer",
                background:isWeekend===v?"var(--bg2)":"transparent",boxShadow:isWeekend===v?"0 1px 4px rgba(0,0,0,.1)":"none"}}>
              <span style={{fontSize:13,fontWeight:isWeekend===v?700:400,color:isWeekend===v?"var(--label)":"var(--label3)",fontFamily:FT}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div style={{padding:"14px 16px",borderRadius:16,background:"rgba(0,122,255,.05)",border:"0.5px solid rgba(0,122,255,.12)",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:16}}>â¹ï¸</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Ð§ÑÐ¾ Ð²ÐºÐ»ÑÑÐµÐ½Ð¾ Ð² Ð±Ð¸Ð»ÐµÑ</div>
            <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:3,lineHeight:1.4}}>Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ 140 Ð³Ð°, Ð¿ÑÐ¾Ð³ÑÐ°Ð¼Ð¼Ð° Ð´Ð½Ñ, Ð¼ÑÐ·ÐµÐ¸, Ð²ÑÑÑÐ°Ð²ÐºÐ¸, ÑÑÐ½Ð¾Ð´Ð²Ð¾ÑÑ, Ð°ÑÑ-Ð¾Ð±ÑÐµÐºÑÑ, Wi-Fi. ÐÑÑÑÐ°ÐºÑÐ¸Ð¾Ð½Ñ Ð¾Ð¿Ð»Ð°ÑÐ¸Ð²Ð°ÑÑÑÑ Ð¾ÑÐ´ÐµÐ»ÑÐ½Ð¾.</div>
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
                    <div style={{fontSize:22,fontWeight:700,color:price===0?"#34C759":"var(--label)",fontFamily:FD}}>{price===0?"ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾":price+" â½"}</div>
                  </div>
                </div>

                {/* Description */}
                <div style={{fontSize:12,color:"var(--label2)",fontFamily:FT,marginTop:10,lineHeight:1.4}}>{t.description_ru}</div>

                {/* Includes chips */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                  {(t.included_items||[]).slice(0,4).map((inc:string,j:number)=>(
                    <span key={j} style={{fontSize:10,fontWeight:500,color:"var(--label3)",fontFamily:FT,padding:"3px 8px",borderRadius:8,background:"var(--fill4)"}}>â {inc}</span>
                  ))}
                </div>

                {/* Quantity selector */}
                {price>=0 && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:16,marginTop:14,paddingTop:14,borderTop:"0.5px solid var(--sep)"}}>
                    <div className="tap" onClick={()=>setQty(p=>({...p,[t.id]:Math.max(0,(p[t.id]||0)-1)}))}
                      style={{width:36,height:36,borderRadius:18,background:q>0?"var(--fill)":"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:18,fontWeight:600,color:q>0?"var(--label)":"var(--label4)"}}>â</span>
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
          <div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FT,marginBottom:8}}>Ð ÐµÐ¶Ð¸Ð¼ ÑÐ°Ð±Ð¾ÑÑ</div>
          {[["ÐÐ°ÑÐº","09:00 â 21:00 ÐµÐ¶ÐµÐ´Ð½ÐµÐ²Ð½Ð¾"],["Ð­ÐºÑÐºÑÑÑÐ¸Ð¸","Ð´Ð¾ 19:00"],["Ð ÐµÑÑÐ¾ÑÐ°Ð½Ñ","10:00 â 21:00"],["ÐÐ°Ð½Ð¸ Ð¸ Ð¡ÐÐ","10:00 â 22:00"]].map(([l,v])=>(
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
              <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT}}>{count} Ð±Ð¸Ð»ÐµÑ{count===1?"":count<5?"Ð°":"Ð¾Ð²"}</div>
              <div style={{fontSize:28,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{total.toLocaleString("ru")} â½</div>
            </div>
            <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,textAlign:"right"}}>{isWeekend?"ÐÑÑÐ¾Ð´Ð½Ð¾Ð¹ ÑÐ°ÑÐ¸Ñ":"ÐÑÐ´Ð½Ð¸Ð¹ ÑÐ°ÑÐ¸Ñ"}</div>
          </div>
          <div className="tap" style={{padding:"16px",borderRadius:16,background:"var(--blue)",textAlign:"center",boxShadow:"0 4px 16px rgba(0,122,255,.3)"}}>
            <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>ÐÐ¿Ð»Ð°ÑÐ¸ÑÑ {total.toLocaleString("ru")} â½</span>
          </div>
        </div>
      )}
    </div>
  );
}

// âââ SEARCH âââââââââââââââââââââââââââââââââââââââââââââââ
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
      sb("hotels","select=id,name,description,price_from,rating,type&active=eq.true&name=ilike."+encodeURIComponent(term)+"&limit=3"),
      sb("tours","select=id,name_ru,description_ru,price,cover_emoji,type&is_available=eq.true&name_ru=ilike."+encodeURIComponent(term)+"&limit=3"),
      sb("restaurants","select=id,name_ru,description_ru,cover_emoji,rating&active=eq.true&name_ru=ilike."+encodeURIComponent(term)+"&limit=3"),
      sb("services","select=id,name_ru,description_ru,cover_emoji,price_from,category&active=eq.true&name_ru=ilike."+encodeURIComponent(term)+"&limit=4"),
      sb("masterclasses","select=id,name_ru,cover_emoji,price,location_ru&is_available=eq.true&name_ru=ilike."+encodeURIComponent(term)+"&limit=3"),
      sb("events","select=id,name_ru,cover_emoji,location_ru,starts_at,is_free&is_published=eq.true&name_ru=ilike."+encodeURIComponent(term)+"&limit=3"),
      sb("countries","select=id,name_ru,flag_emoji,region&active=eq.true&name_ru=ilike."+encodeURIComponent(term)+"&limit=5"),
      sb("articles","select=id,title_ru,cover_emoji,category,published_at&is_published=eq.true&title_ru=ilike."+encodeURIComponent(term)+"&limit=3"),
      sb("faq","select=id,question_ru,answer_ru,category&is_published=eq.true&question_ru=ilike."+encodeURIComponent(term)+"&limit=3"),
    ]).then(([h,t,r,s,m,e,c,ar,fq])=>{
      const all:any[] = [];
      (h||[]).forEach((x:any)=>all.push({...x,_type:"hotel",_emoji:"ð¨",_label:x.name,_sub:x.type+" Â· "+x.price_from+" â½/Ð½Ð¾ÑÑ"}));
      (t||[]).forEach((x:any)=>all.push({...x,_type:"tour",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.price+" â½"}));
      (r||[]).forEach((x:any)=>all.push({...x,_type:"restaurant",_emoji:x.cover_emoji||"ð½ï¸",_label:x.name_ru,_sub:"â "+x.rating}));
      (s||[]).forEach((x:any)=>all.push({...x,_type:"service",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.category+(x.price_from?" Â· "+x.price_from+" â½":"")}));
      (m||[]).forEach((x:any)=>all.push({...x,_type:"mk",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.price+" â½ Â· "+x.location_ru}));
      (e||[]).forEach((x:any)=>all.push({...x,_type:"event",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.location_ru}));
      (c||[]).forEach((x:any)=>all.push({...x,_type:"country",_emoji:x.flag_emoji,_label:x.name_ru,_sub:x.region}));
      (ar||[]).forEach((x:any)=>all.push({...x,_type:"article",_emoji:x.cover_emoji||"ð°",_label:x.title_ru,_sub:x.category==='news'?'ÐÐ¾Ð²Ð¾ÑÑÑ':'Ð¡ÑÐ°ÑÑÑ'}));
      (fq||[]).forEach((x:any)=>all.push({...x,_type:"faq",_emoji:"â",_label:x.question_ru,_sub:x.answer_ru?.substring(0,50)+'...'}));
      setResults(all);
      setLoading(false);
    });
  },[q]);

  const TYPE_LABEL:Record<string,string> = {hotel:"ÐÑÐµÐ»Ñ",tour:"Ð¢ÑÑ",restaurant:"Ð ÐµÑÑÐ¾ÑÐ°Ð½",service:"Ð£ÑÐ»ÑÐ³Ð°",mk:"ÐÐ°ÑÑÐµÑ-ÐºÐ»Ð°ÑÑ",event:"Ð¡Ð¾Ð±ÑÑÐ¸Ðµ",country:"Ð¡ÑÑÐ°Ð½Ð°",article:"Ð¡ÑÐ°ÑÑÑ",faq:"FAQ"};
  const TYPE_COLOR:Record<string,string> = {hotel:"#003580",tour:"#2471A3",restaurant:"#FF9500",service:"#34C759",mk:"#AF52DE",event:"#FF3B30",country:"#007AFF",article:"#FF9500",faq:"#5856D6"};

  return (
    <div style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Header with search input */}
      <div style={{padding:"54px 20px 14px",background:"rgba(242,242,247,0.92)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)"}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"var(--fill4)",border:"0.5px solid var(--sep-opaque)"}}>
            <span style={{fontSize:14,color:"var(--label3)"}}>ð</span>
            <input value={q} onChange={(e:any)=>setQ(e.target.value)} autoFocus placeholder="ÐÐ¾Ð¸ÑÐº Ð¿Ð¾ Ð²ÑÐµÐ¼Ñ Ð¿Ð°ÑÐºÑ..." style={{flex:1,border:"none",background:"transparent",fontSize:16,fontFamily:FT,outline:"none",color:"var(--label)"}}/>
            {q && <span className="tap" onClick={()=>setQ("")} style={{fontSize:14,color:"var(--label3)",cursor:"pointer"}}>â</span>}
          </div>
          <span className="tap" onClick={onClose} style={{fontSize:15,color:"var(--blue)",fontFamily:FT,fontWeight:600,cursor:"pointer"}}>ÐÑÐ¼ÐµÐ½Ð°</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        {/* Filter pills */}
        {results.length>0&&<div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
          {[["","ÐÑÐµ"],["hotel","ÐÑÐµÐ»Ð¸"],["tour","Ð¢ÑÑÑ"],["restaurant","Ð ÐµÑÑÐ¾ÑÐ°Ð½Ñ"],["service","Ð£ÑÐ»ÑÐ³Ð¸"],["mk","ÐÐ"],["event","Ð¡Ð¾Ð±ÑÑÐ¸Ñ"],["country","Ð¡ÑÑÐ°Ð½Ñ"]].map(([fid,fl]:any)=>(
            <div key={fid} className="tap" onClick={()=>setFilter(fid)} style={{padding:"6px 14px",borderRadius:20,fontSize:13,fontFamily:FT,flexShrink:0,background:filter===fid?"var(--label)":"var(--fill4)",color:filter===fid?"#fff":"var(--label2)"}}>{fl}</div>
          ))}
        </div>}
        {q.length<2 ? (
          /* Popular searches */
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:12}}>ÐÐ¾Ð¿ÑÐ»ÑÑÐ½ÑÐµ Ð·Ð°Ð¿ÑÐ¾ÑÑ</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["ÐÐ°Ð½Ñ","Ð¡ÐÐ","Ð¥Ð°ÑÐºÐ¸","Ð®ÑÑÐ°","ÐÐ½Ð´Ð¸Ñ","ÐÐ¸Ð»ÐµÑÑ","Ð ÐµÑÑÐ¾ÑÐ°Ð½","ÐÐ°ÑÑÐµÑ-ÐºÐ»Ð°ÑÑ","ÐÐ¸Ð½Ð¾Ð¿Ð°ÑÐº","ÐÐ¾Ð´ÐºÐ¸"].map(s=>(
                <div key={s} className="tap" onClick={()=>setQ(s)} style={{padding:"8px 14px",borderRadius:30,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
                  <span style={{fontSize:13,color:"var(--label)",fontFamily:FT}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? <Spinner/> : results.length===0 ? (
          <div style={{textAlign:"center",paddingTop:40}}>
            <div style={{fontSize:48,marginBottom:12}}>ð</div>
            <div style={{fontSize:16,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÐ¸ÑÐµÐ³Ð¾ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾</div>
            <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:4}}>ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ Ð´ÑÑÐ³Ð¾Ð¹ Ð·Ð°Ð¿ÑÐ¾Ñ</div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginBottom:12}}>ÐÐ°Ð¹Ð´ÐµÐ½Ð¾ <span style={{fontWeight:700,color:"var(--label)"}}>{(filter?results.filter((x:any)=>x._type===filter):results).length}</span> ÑÐµÐ·ÑÐ»ÑÑÐ°ÑÐ¾Ð²</div>
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

// âââ APP ââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function App() {
  useEffect(()=>{
    if(typeof document!=='undefined'){
      const m=document.createElement('meta');m.name='theme-color';m.content='#000000';document.head.appendChild(m);
      const m2=document.createElement('meta');m2.name='apple-mobile-web-app-capable';m2.content='yes';document.head.appendChild(m2);
      const m3=document.createElement('meta');m3.name='apple-mobile-web-app-status-bar-style';m3.content='black-translucent';document.head.appendChild(m3);
      const m4=document.createElement('meta');m4.name='viewport';m4.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';document.head.appendChild(m4);
      document.addEventListener('touchstart',function(){},true);const m5=document.createElement('link');m5.rel='manifest';m5.href='data:application/json,'+encodeURIComponent(JSON.stringify({name:"Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ",short_name:"Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ",start_url:"/",display:"standalone",background_color:"#000000",theme_color:"#1B3A2A",icons:[{src:"https://fakeimg.pl/512x512/1B3A2A/ffffff?text=Ð­Ð&font_size=200",sizes:"512x512",type:"image/png"}]}));document.head.appendChild(m5);
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
  // favs_from_db
  useEffect(()=>{sb('favorites','select=item_id').then(d=>{if(d&&d.length)setFavorites(new Set(d.map((f:any)=>f.item_id)));});},[]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sb_session') : null;
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s?.access_token) { setSession(s); }
      } catch {}
    }
    setAuthLoading(false);
    sb("loyalty_levels","select=*&order=min_points.asc").then(d=>setLoyaltyLevels(d||[]));
    if(!localStorage.getItem('em_welcomed')){setShowWelcome(true);}
  }, []);

  const doLogin = async (email: string, password: string) => {
    const res = await sbAuth('token?grant_type=password', { email, password });
    if (res.access_token) {
      setSession(res);
      localStorage.setItem('sb_session', JSON.stringify(res));
      return { ok: true };
    }
    return { ok: false, error: res.error_description || res.msg || 'Login failed' };
  };
  const doLogout = () => { setSession(null); localStorage.removeItem('sb_session'); };
  return (
    <>
      <style>{CSS}</style>
      <div className="eth" style={{width:'100%',maxWidth:390,height:'100dvh',margin:'0 auto',display:'flex',flexDirection:'column',background:'var(--bg)',overflow:'hidden',overflowX:'hidden',position:'relative'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
          {/* âââ FLOATING BUTTONS âââ */}
          <div style={{position:"absolute",top:54,right:20,display:"flex",gap:12,zIndex:50}}>
            <div className="tap" onClick={()=>setShowSearch(true)} style={{width:44,height:44,borderRadius:22,background:"rgba(255,255,255,0.18)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 2px 12px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="7" stroke="#3C3C43" strokeWidth="2"/><path d="M16 16l5.5 5.5" stroke="#3C3C43" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="tap" onClick={()=>setShowPassport(true)} style={{width:44,height:44,borderRadius:22,background:"rgba(255,255,255,0.18)",backdropFilter:"blur(50px) saturate(200%)",WebkitBackdropFilter:"blur(50px) saturate(200%)",border:"0.5px solid rgba(255,255,255,0.35)",boxShadow:"0 2px 12px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="#3C3C43" strokeWidth="1.8"/><path d="M4.5 21c0-3.3 3.4-6 7.5-6s7.5 2.7 7.5 6" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
          </div>
          {tab==='home'     && <HomeTab onBuyTicket={()=>setShowTickets(true)} onSearch={()=>setShowSearch(true)} onMap={()=>setShowMap(true)} onQR={()=>setShowQR(true)} onProfile={()=>setTab('passport')} onNav={(t:any,s:any)=>{setPendingSec(s||"");setTab(t);}}/>}
          {tab==='tours'    && <ToursTab onSearch={()=>setShowSearch(true)} onBuyTicket={()=>setShowTickets(true)} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")} favorites={favorites} toggleFav={toggleFav}/>}
          {tab==='stay'     && <StayTab onSearch={()=>setShowSearch(true)} favorites={favorites} toggleFav={toggleFav} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")}/>}
          {tab==='services' && <ServicesTab onSearch={()=>setShowSearch(true)} onProfile={()=>setTab('passport')} pendingSec={pendingSec} onClearPending={()=>setPendingSec("")}/>}
          {tab==='passport' && <EthnoMirTab/>}
        </div>
        {showTickets && <TicketScreen onClose={()=>setShowTickets(false)}/>}
        {toast && <SuccessToast msg={toast} onClose={()=>setToast("")}/>}
        {showWelcome && <WelcomeScreen onDone={()=>{setShowWelcome(false);localStorage.setItem('em_welcomed','1');}}/>}
        {countryDetail && <CountryDetail country={countryDetail} onClose={()=>setCountryDetail(null)}/>}
        {showQR && <QRModal onClose={()=>setShowQR(false)} session={session}/>}
        {showMap && <MapModal onClose={()=>setShowMap(false)}/>}
        {showSearch && <div className="anim-fadeIn"><SearchModal onClose={()=>setShowSearch(false)} onNav={(t:string,s?:string)=>{setPendingSec(s||"");setTab(t as Tab);}}/></div>}
        {/* âââ PASSPORT OVERLAY âââ */}
        {showPassport && (
          <div className="anim-slideUp" style={{position:"fixed",top:0,bottom:0,left:0,right:0,margin:"0 auto",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"54px 20px 12px",background:"rgba(242,242,247,0.94)",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",borderBottom:"0.5px solid rgba(60,60,67,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="tap" onClick={()=>setShowPassport(false)} style={{width:32,height:32,borderRadius:16,background:"rgba(120,120,128,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#3C3C43" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>ÐÐ°ÑÐ¿Ð¾ÑÑ</div>
              <div style={{width:32}}/>
            </div>
            <div style={{flex:1,overflow:"auto",WebkitOverflowScrolling:"touch"}}>
              <PassportView session={session} onLogin={doLogin} onLogout={doLogout} onQR={()=>{setShowPassport(false);setShowQR(true);}}/>
            </div>
          </div>
        )}
        <TabBar active={tab} onSelect={setTab}/>
      </div>
    </>
  );
}
