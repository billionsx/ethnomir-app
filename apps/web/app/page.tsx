'use client';
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

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

async function sb(table: string, params = '') {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) return [];
  return r.json();
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
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) return [];
  return r.json();
}

// ─── Fonts ───────────────────────────────────────────────
const FD = '"SF Pro Display",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';
const FT = '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif';

type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
  html,body{height:100%;overflow:hidden;margin:0;padding:0}
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
  .tap{cursor:pointer;transition:transform .22s cubic-bezier(0.34,1.56,0.64,1),opacity .15s}
  .tap:active{transform:scale(0.97);opacity:.88;transition:transform .1s cubic-bezier(0.2,0.8,0.2,1),opacity .08s}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
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
    <div style={{padding:"16px",borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)"}}>
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

const HERO = [
  {emoji:'🎪',title:'Летний фестиваль народов мира',sub:'25–26 июля · Вся территория парка',badge:'Топ-событие',g:'linear-gradient(135deg,#C0392B,#E91E63)'},
  {emoji:'🌸',title:'Сакура Фестиваль',sub:'18–19 апреля · Японский павильон',badge:'Бесплатно',g:'linear-gradient(135deg,#1a1a3e,#AF52DE,#FF6B9D)'},
  {emoji:'🥁',title:'Масленица юбилейная',sub:'28 февр.–8 марта · Главная площадь',badge:'XX лет!',g:'linear-gradient(135deg,#0d2b1d,#1a6b3a,#30D158)'},
  {emoji:'🏆',title:'Кулинарный чемпионат',sub:'11–12 июля · Кулинарный театр',badge:'Продажа',g:'linear-gradient(135deg,#4a1500,#c0390b,#FF9500)'},
];

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
      <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.2}}>{s.t}</div>
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
      if(r.ok){setDone(true);}else{setErr("Ошибка. Позвоните +7 495 023-81-81");}
    }catch{setErr("Нет связи. Попробуйте позже.");}
    setSending(false);
  };

  if(done) return (
    <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:28,padding:"40px 24px",maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 16px 48px rgba(0,0,0,0.2)"}}>
        <div style={{width:64,height:64,borderRadius:32,background:"rgba(52,199,89,0.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>✅</div>
        <div style={{fontSize:22,fontWeight:800,color:"var(--label)",fontFamily:FD}}>Заявка отправлена!</div>
        <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8,lineHeight:1.5}}>Менеджер свяжется с вами в течение 30 минут по номеру {phone}</div>
        <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:12}}>{item.name||item.name_ru} · {total.toLocaleString("ru")} ₽</div>
        <div className="tap" onClick={onClose} style={{marginTop:20,padding:"14px",borderRadius:14,background:"var(--blue)",cursor:"pointer"}}>
          <span style={{fontSize:16,fontWeight:600,color:"#fff",fontFamily:FT}}>Отлично</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:250,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"28px 28px 0 0",padding:"8px 24px 32px",maxWidth:390,width:"100%",boxShadow:"0 -8px 32px rgba(0,0,0,0.15)"}}>
        {/* Handle bar */}
        <div style={{width:36,height:4,borderRadius:2,background:"var(--label4)",margin:"0 auto 16px"}}/>
        <div style={{fontSize:20,fontWeight:800,color:"var(--label)",fontFamily:FD,marginBottom:4}}>Оформить заявку</div>
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
            <div style={{padding:"5px 12px",borderRadius:20,background:"var(--fill4)",border:"0.5px solid var(--sep)"}}>
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
            <div style={{fontSize:22,fontWeight:800,color:"var(--label)",fontFamily:FD}}>{result.country?.name_ru}</div>
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
            <div style={{fontSize:26,fontWeight:800,color:"var(--label)",fontFamily:FD,marginTop:8}}>{result.country?.name_ru}</div>
            <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,marginTop:8,lineHeight:1.5}}>{result.country?.fun_fact_ru||"Добро пожаловать в новую страну!"}</div>
            <div style={{marginTop:16,padding:"8px 20px",borderRadius:20,background:"linear-gradient(135deg,#FFD700,#FFA500)",display:"inline-block"}} className="celebrate">
              <span style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:FD}}>+{result.points||15} очков</span>
            </div>
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
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
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
  const POIS = [
    {e:"🏨",n:"СПА-отель «Шри-Ланка»",x:42,y:28,c:"#E91E63"},
    {e:"🏔️",n:"«Гималайский дом»",x:38,y:22,c:"#795548"},
    {e:"🌏",n:"«Восточная Азия»",x:50,y:25,c:"#1565C0"},
    {e:"🕌",n:"«Центральная Азия»",x:45,y:20,c:"#FF8F00"},
    {e:"🏡",n:"Этнодвор Русь",x:25,y:55,c:"#8D6E63"},
    {e:"🐺",n:"Хаски-парк",x:72,y:60,c:"#546E7A"},
    {e:"🌍",n:"Улица Мира",x:40,y:38,c:"#2196F3"},
    {e:"🏛️",n:"Конгресс-холл",x:44,y:18,c:"#7B1FA2"},
    {e:"🐍",n:"Зоодом «Кобры-мобры»",x:68,y:45,c:"#388E3C"},
    {e:"🍕",n:"Ресторан «Мука»",x:35,y:42,c:"#E65100"},
    {e:"🥩",n:"Ресторан «Дербент»",x:30,y:48,c:"#BF360C"},
    {e:"🍛",n:"«Индийская душа»",x:48,y:35,c:"#AD1457"},
    {e:"🎪",n:"Главная площадь",x:38,y:45,c:"#D84315"},
    {e:"🅿️",n:"Парковка",x:15,y:18,c:"#78909C"},
    {e:"🚪",n:"Главный вход",x:20,y:32,c:"#F57C00"},
    {e:"🛶",n:"Лесное озеро",x:82,y:75,c:"#0277BD"},
    {e:"🧖",n:"Бани и СПА",x:55,y:55,c:"#C62828"},
    {e:"🥢",n:"«ЯККиТОФУ»",x:52,y:30,c:"#1A237E"},
    {e:"🌸",n:"Японский сад",x:60,y:40,c:"#AD1457"},
    {e:"🏕️",n:"Этнодом «Сибирия»",x:18,y:65,c:"#4E342E"},
  ];
  const [sel, setSel] = useState<any>(null);
  return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
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

function HomeTab({onBuyTicket,onSearch,onMap,onQR,onProfile}:{onBuyTicket?:()=>void,onSearch?:()=>void,onMap?:()=>void,onQR?:()=>void,onProfile?:()=>void}) {
  const [slide, setSlide] = useState(0);
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
    const t = setInterval(()=>setSlide(s=>(s+1)%HERO.length),4200);
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
    ]).then(([sv,ev,sch,pr,wt,nf,st])=>{
      setServices(sv||[]);setEvents(ev||[]);setSchedule(sch||[]);setPromos(pr||[]);
      const now=new Date().toISOString().slice(0,10);
      const currentTheme=(wt||[]).find((t:any)=>t.week_starts<=now&&t.week_ends>=now);
      const nextTheme=(wt||[]).find((t:any)=>t.week_starts>now);
      setWeekTheme(currentTheme||nextTheme||null);
      setNotifs(nf||[]);
      setStories(st||[]);
      setLoading(false);
    });
  },[]);

  const sl = HERO[slide];
  const hour = new Date().getHours();
  const greeting = hour<6?"Доброй ночи":hour<12?"Доброе утро":hour<18?"Добрый день":"Добрый вечер";
  const dateStr = new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"});
  const dayOfWeek = new Date().getDay();
  const todaySchedule = schedule.filter(s=>(s.days_of_week||[]).includes(dayOfWeek));

  return (
    <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
      {/* ═══ HEADER ═══ */}
      <div style={{position:"sticky",top:0,zIndex:50,paddingTop:54,background:"rgba(242,242,247,0.72)",backdropFilter:"blur(40px) saturate(200%) brightness(1.08)",WebkitBackdropFilter:"blur(40px) saturate(200%) brightness(1.08)",borderBottom:"0.5px solid rgba(60,60,67,0.12)"}}>
        <div style={{padding:"0 20px 14px"}}>
          <div style={{fontSize:11,color:"var(--label2)",fontFamily:FT,textTransform:"uppercase",fontWeight:600,letterSpacing:".3px"}}>{dateStr}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2}}>
            <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px",lineHeight:1.1}}>Этномир</div>
            <div className="tap" onClick={()=>onProfile?onProfile():null} style={{width:38,height:38,borderRadius:19,background:"linear-gradient(145deg,#1B3A2A,#2D5A3D)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.12)"}}>
              <span style={{fontSize:14,color:"#fff",fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ HERO CARD ═══ */}
      <div style={{padding:"16px 20px 0"}}>
        <div className="tap" style={{borderRadius:20,overflow:"hidden",position:"relative",height:300,background:sl.g,transition:"background .6s",boxShadow:"0 4px 20px rgba(0,0,0,0.10)"}}>
          
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 40%,rgba(0,0,0,.5) 100%)"}} />
          <div style={{position:"absolute",top:18,left:18}}>
            <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:8,padding:"4px 10px",border:"0.5px solid rgba(255,255,255,.15)",fontSize:11,color:"rgba(255,255,255,.85)",fontWeight:600,fontFamily:FT,letterSpacing:".3px",textTransform:"uppercase"}}>{sl.badge}</span>
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
            <div style={{fontSize:24,fontWeight:700,color:"#fff",fontFamily:FD,letterSpacing:"-0.4px",lineHeight:1.2,marginBottom:4}}>{sl.title}</div>
            <div style={{fontSize:15,color:"rgba(255,255,255,.6)",fontFamily:FT,lineHeight:1.3,fontWeight:400}}>{sl.sub}</div>
            <div style={{display:"flex",gap:5,marginTop:12}}>
              {HERO.map((_:any,i:number)=><div key={i} style={{width:i===slide?20:6,height:6,borderRadius:3,background:i===slide?"#fff":"rgba(255,255,255,.35)",transition:"width .35s"}} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STORIES ═══ */}
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
            <div style={{flex:1}}><span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Этномир</span></div>
            <div className="tap" onClick={(e:any)=>{e.stopPropagation();setViewStory(null);}} style={{width:30,height:30,borderRadius:15,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:14,color:'#fff'}}>✕</span>
            </div>
          </div>
          {/* Content */}
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 36px',textAlign:'center'}}>
            <span style={{fontSize:64,marginBottom:20,filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'}}>{viewStory.cover_emoji}</span>
            <div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',lineHeight:1.2,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{viewStory.title}</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:12,lineHeight:1.6}}>{viewStory.content_text}</div>
          </div>
          {/* Swipe hint */}
          <div style={{padding:'20px 32px 40px',textAlign:'center'}}>
            <span style={{fontSize:12,color:'rgba(255,255,255,.3)',fontFamily:FT}}>Нажмите чтобы закрыть</span>
          </div>
        </div>
      )}

      {/* ═══ INSTALL PWA ═══ */}
      {typeof window!=='undefined' && !window.matchMedia('(display-mode:standalone)').matches && navigator.userAgent.match(/iPhone|Android/) && (
        <div style={{padding:'8px 20px 0'}}>
          <div className="tap" onClick={()=>{}} style={{borderRadius:14,background:'var(--fill4)',padding:'10px 14px',display:'flex',gap:10,alignItems:'center',border:'0.5px solid var(--sep)'}}>
            <span style={{fontSize:20}}>📲</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Добавьте на экран</div>
              <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Поделиться → На экран «Домой»</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ WEATHER ═══ */}
      {weather && (
        <div style={{padding:"12px 20px 0"}}>
          <div className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"var(--shadow-sm)"}}>
            <span style={{fontSize:28}}>{weatherEmoji(weather.code)}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                <span style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{weather.temp>0?"+":""}{weather.temp}°</span><span style={{fontSize:14,color:"var(--label2)",fontFamily:FT}}> сейчас в Этномире</span>
              </div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:1}}>Парк открыт до 21:00</div>
            </div>

          </div>
        </div>
      )}

      {/* ═══ LIVE VISITORS ═══ */}
      <div style={{padding:'0 20px',marginTop:8}}>
        <div style={{display:'flex',gap:12,alignItems:'center',padding:'12px 16px',borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)'}}>
          <div style={{width:8,height:8,borderRadius:4,background:'#34C759',boxShadow:'0 0 6px rgba(52,199,89,.5)',animation:'pulse 2s ease infinite'}} />
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Сейчас в парке</div>
          </div>
          <div style={{fontSize:20,fontWeight:700,color:'var(--label)',fontFamily:FD}}>{Math.floor(800+Math.random()*400)}</div>
          <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT}}>чел.</div>
        </div>
      </div>

      {/* ═══ NOTIFICATIONS ═══ */}
      {notifs.filter((n:any)=>!dismissedNotifs.includes(n.id)).length>0 && (
        <div style={{padding:'8px 20px 0'}}>
          {notifs.filter((n:any)=>!dismissedNotifs.includes(n.id)).slice(0,2).map((n:any)=>(
            <div key={n.id} className="fu" style={{marginBottom:8,borderRadius:16,background:n.type==='promo'?'rgba(0,122,255,.04)':n.type==='alert'?'rgba(255,59,48,.04)':'var(--fill4)',border:'0.5px solid '+(n.type==='promo'?'rgba(0,122,255,.12)':n.type==='alert'?'rgba(255,59,48,.12)':'var(--sep)'),padding:'12px 14px',display:'flex',gap:10,alignItems:'flex-start'}}>
              <span style={{fontSize:20,flexShrink:0}}>{n.cover_emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{n.title}</div>
                <div style={{fontSize:12,color:'var(--label2)',fontFamily:FT,marginTop:2,lineHeight:1.4}}>{n.body}</div>
              </div>
              <div className="tap" onClick={()=>setDismissedNotifs(p=>[...p,n.id])} style={{flexShrink:0,marginTop:2}}>
                <span style={{fontSize:14,color:'var(--label4)'}}>✕</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ WEEKLY THEME ═══ */}
      {weekTheme && (
        <div style={{padding:"12px 20px 0"}}>
          <div className="tap" style={{borderRadius:20,background:"linear-gradient(135deg,#1a1a3e,#AF52DE,#FF6B9D)",padding:"16px 18px",position:"relative",overflow:"hidden",boxShadow:"0 4px 16px rgba(175,82,222,.2)"}}>
            <div style={{position:"absolute",right:-8,top:"50%",transform:"translateY(-50%)",fontSize:56,opacity:.15}}>{weekTheme.cover_emoji}</div>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:"uppercase"}}>ТЕМА НЕДЕЛИ</div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:FD,marginTop:4}}>{weekTheme.cover_emoji} {weekTheme.name_ru}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.65)",fontFamily:FT,marginTop:4}}>{weekTheme.description_ru}</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROMOS: horizontal scroll ═══ */}
      {promos.length>0 && (
        <div style={{padding:"16px 0 0"}}>
          <div style={{display:"flex",gap:12,overflowX:"auto",padding:"0 20px",scrollSnapType:"x mandatory"}}>
            {promos.map((p:any,i:number)=>{
              const isWeekend = [0,6].includes(new Date().getDay());
              const price = isWeekend ? (p.price_weekend||p.price) : (p.price_weekday||p.price);
              return (
              <div key={p.id||i} className="tap" onClick={()=>onBuyTicket&&onBuyTicket()} style={{flexShrink:0,width:220,padding:"16px",borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",scrollSnapAlign:"start"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:10,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20}}>{p.cover_emoji||"🎫"}</span></div>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{p.name_ru}</div>
                </div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginBottom:10,lineHeight:1.4}}>{p.description_ru?.slice(0,60)||(p.age_range||"")}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:18,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{price} ₽</span>
                    <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{isWeekend?"выходной":"будний день"}</div>
                  </div>
                  <div style={{padding:"6px 14px",borderRadius:10,background:"var(--blue)"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>Купить</span>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* ═══ РАСПИСАНИЕ ДНЯ ═══ */}
      {todaySchedule.length>0 && (
        <div style={{padding:"20px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
            <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px"}}>Расписание на сегодня</div>
            <span style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>Все &rsaquo;</span>
          </div>
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>
            {todaySchedule.slice(0,6).map((s:any,i:number)=>(
              <div key={s.id||i} className="tap" style={{padding:"12px 16px",display:"flex",gap:12,alignItems:"center",borderBottom:i<Math.min(todaySchedule.length,6)-1?"0.5px solid var(--sep)":"none"}}>
                <div style={{width:48,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--label)",fontFamily:FD}}>{String(s.time_start).slice(0,5)}</div>
                  <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT}}>{String(s.time_end).slice(0,5)}</div>
                </div>
                <div style={{width:1,height:32,background:"var(--sep)",flexShrink:0}} />
                <div style={{width:40,height:40,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.cover_emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{s.name_ru}</div>
                  <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{s.location_ru}{s.price>0?" · "+s.price+" ₽":" · Бесплатно"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PASSPORT PILL ═══ */}
      <div style={{padding:"14px 20px 0"}}>
        <div className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:"14px 16px",display:"flex",gap:14,alignItems:"center",boxShadow:"var(--shadow-sm)"}}>
          <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(145deg,#1B3A2A,#2D5A3D)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🌍</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:16,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Паспорт путешественника</div>
            <div style={{fontSize:13,color:"var(--label2)",fontFamily:FT,marginTop:2}}>Сканируй QR у павильонов · Копи баллы</div>
          </div>
          <Chev />
        </div>
      </div>

      {/* ═══ SMART RECOMMENDATIONS ═══ */}
      <div style={{padding:'20px 20px 0'}}>
        <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>{hour<12?"Чем заняться утром":"Рекомендации"}</div>
        <div className="snap-x" style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
          {(hour<12?[
            {e:"🧘",t:"Йога",s:"09:00 · Поляна",c:"#2D6A4F"},
            {e:"☕",t:"Завтрак",s:"В отеле · до 10:30",c:"#8D6E63"},
            {e:"🌿",t:"Прогулка",s:"Тропа · 3 км",c:"#388E3C"},
          ]:hour<15?[
            {e:"🎭",t:"Экскурсия",s:"Улица Мира · 2.5ч",c:"#1565C0"},
            {e:"🍕",t:"Обед",s:"Мука · ~950 ₽",c:"#E65100"},
            {e:"🎨",t:"Мастер-класс",s:"Керамика · 14:00",c:"#6A1B9A"},
          ]:hour<19?[
            {e:"🐺",t:"Хаски",s:"Катание · до 17",c:"#37474F"},
            {e:"🧖",t:"СПА",s:"Хаммам + бассейн",c:"#AD1457"},
            {e:"🫖",t:"Чайхана",s:"Плов · ~800 ₽",c:"#F57F17"},
          ]:[
            {e:"🌙",t:"Концерт",s:"Главная площадь",c:"#283593"},
            {e:"🍽️",t:"Ужин",s:"Дербент · ~1200₽",c:"#BF360C"},
            {e:"⭐",t:"Звёзды",s:"Телескоп · ясно",c:"#1A237E"},
          ]).map((r:any,i:number)=>(
            <div key={i} className="tap" style={{flexShrink:0,width:130,borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
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

      
      {/* ═══ ОТКРЫТО СЕЙЧАС ═══ */}
      <div style={{padding:"20px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px"}}>Открыто сейчас</div>
          {!loading && <span style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>Все &rsaquo;</span>}
        </div>
        {loading ? <SkeletonCard/> : (
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:4}}>
            {services.map((s:any,i:number)=>(
              <div key={i} className="tap" style={{flexShrink:0,width:80,textAlign:"center"}}>
                <div style={{width:80,height:80,borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep)",boxShadow:"var(--shadow-sm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,marginBottom:8,position:"relative"}}>
                  {s.cover_emoji}
                  <div style={{position:"absolute",bottom:4,right:4,width:8,height:8,borderRadius:4,background:"#34C759",border:"2px solid var(--bg2)"}} />
                </div>
                <div style={{fontSize:11,fontWeight:600,color:"var(--label)",fontFamily:FT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name_ru}</div>
                <div style={{fontSize:10,color:"var(--label3)",fontFamily:FT,marginTop:1}}>{s.status_text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ СОБЫТИЯ ═══ */}
      <div style={{padding:"20px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px"}}>Ближайшие события</div>
          <span className="tap" style={{fontSize:13,color:"var(--blue)",fontFamily:FT,fontWeight:600}}>Все &rsaquo;</span>
        </div>
        {loading ? <SkeletonCard/> : (
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
            {events.map((e:any,i:number)=>{
              const d = new Date(e.starts_at);
              const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
              const label = diff<=0?"Сегодня":diff===1?"Завтра":"Через "+diff+" дн.";
              return (
                <div key={i} className="tap" style={{display:"flex",gap:14,padding:"13px 16px",borderBottom:i<events.length-1?"0.5px solid var(--sep)":"none",alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{e.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{e.name_ru}</div>
                    <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{e.location_ru}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--blue)",fontFamily:FT}}>{label}</span>
                    {e.is_free && <span style={{fontSize:10,fontWeight:600,color:"var(--green)",fontFamily:FT,padding:"2px 6px",borderRadius:6,background:"rgba(52,199,89,.1)"}}>Бесплатно</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ БЫСТРЫЕ ДЕЙСТВИЯ ═══ */}
      <div style={{padding:"20px 20px 0"}}>
        <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:14}}>Быстрые действия</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[{e:"📷",l:"Сканировать QR",c:"#007AFF",s:"Получить штамп",fn:onQR},{e:"🗺️",l:"Карта парка",c:"#34C759",s:"140 га · GPS",fn:onMap},{e:"📞",l:"Звонок",c:"#FF9500",s:"+7 495 023-81-81",fn:()=>window.open("tel:+74950238181")},{e:"💳",l:"Купить билет",c:"#AF52DE",s:"Онлайн · От 500 ₽",fn:onBuyTicket}].map((a:any)=>(
            <div key={a.l} className="tap" onClick={()=>a.fn&&a.fn()} style={{padding:16,borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)"}}>
              <div style={{width:44,height:44,borderRadius:12,background:a.c+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:10}}>{a.e}</div>
              <div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT,marginBottom:2}}>{a.l}</div>
              <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>{a.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PROMO BANNER ═══ */}
      <div style={{padding:"20px 20px 20px"}}>
        <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:14}}>Возможности</div>
        {/* Business */}
        <div className="tap" style={{borderRadius:20,overflow:"hidden",marginBottom:12,background:"linear-gradient(135deg,#0d2b1d,#1a6b3a)",padding:20,position:"relative"}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px"}}>Бизнес с Этномир</div>
          <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:6,letterSpacing:"-.3px"}}>Откройте своё дело</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4,lineHeight:1.5}}>Аренда площадей, недвижимость, франшиза</div>
          <div style={{marginTop:12,display:"inline-flex",padding:"7px 16px",borderRadius:20,background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)"}}>
            <span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>Подробнее</span>
          </div>
        </div>
        {/* Charity */}
        <div className="tap" style={{borderRadius:20,overflow:"hidden",marginBottom:12,background:"linear-gradient(135deg,#1a237e,#3949ab)",padding:20,position:"relative"}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px"}}>Благотворительность</div>
          <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginTop:6,letterSpacing:"-.3px"}}>Фонд «Диалог Культур»</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:4,lineHeight:1.5}}>Благотворительные проекты и участие</div>
          <div style={{marginTop:12,display:"inline-flex",padding:"7px 16px",borderRadius:20,background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)"}}>
            <span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>Поучаствовать</span>
          </div>
        </div>
        {/* Real Estate */}
        <div className="tap" style={{borderRadius:20,background:"linear-gradient(135deg,#0d1b2a,#1a3a5c)",padding:20,position:"relative",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.12)"}}>
          <div style={{position:"absolute",right:-10,top:"50%",transform:"translateY(-50%)",fontSize:64,opacity:.14}}>🏗️</div>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:6,fontWeight:700,letterSpacing:1,fontFamily:FT,textTransform:"uppercase"}}>Ethnomir DEVELOPMENT</div>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:FD,marginBottom:5,letterSpacing:"-.3px"}}>Живи в Этномире</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:FT,marginBottom:16,lineHeight:1.4}}>Апартаменты от 5.4 млн ₽ · ROI до 22%/год</div>
            <div style={{display:"flex",gap:20,marginBottom:16}}>
              {[["ROI","до 22%"],["Заезд","2026"],["Площадь","от 36м²"]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:FD}}>{v}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{display:"inline-flex",background:"rgba(255,255,255,.14)",borderRadius:12,padding:"8px 18px",border:"0.5px solid rgba(255,255,255,.2)"}}>
              <span style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:FT}}>Узнать подробнее →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TOURS ────────────────────────────────────────────────
function ToursTab({onSearch,onBuyTicket,onProfile}:{onSearch?:()=>void,onBuyTicket?:()=>void,onProfile?:()=>void}) {
  const [sec, setSec] = useState("tours");
  const [tours, setTours] = useState<any[]>([]);
  const [mk, setMk] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [detailType, setDetailType] = useState("");
  const [persons, setPersons] = useState(2);
  const [booked, setBooked] = useState(false);

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
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
        {/* Hero */}
        <div style={{position:"relative",height:220,background:"linear-gradient(145deg,"+color+"cc,"+color+"88)"}}>
          <div style={{position:"absolute",right:-10,top:"40%",transform:"translateY(-50%)",fontSize:96,opacity:.15}}>{detail.cover_emoji}</div>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,rgba(0,0,0,.45) 100%)"}}/>
          <div className="tap" onClick={()=>setDetail(null)} style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
            <span style={{fontSize:18,color:"#fff"}}>‹</span>
          </div>
          <div style={{position:"absolute",top:54,right:16}}>
            <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(12px)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#fff",fontWeight:700,fontFamily:FT}}>{isTour?detail.type?.toUpperCase():isMk?"МАСТЕР-КЛАСС":"СОБЫТИЕ"}</span>
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
            <div style={{fontSize:24,fontWeight:800,color:"#fff",fontFamily:FD,letterSpacing:"-.4px",lineHeight:1.15}}>{isTour?detail.name_ru:isMk?detail.name_ru:detail.name_ru}</div>
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
            <div style={{padding:"20px",borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-md)"}}>
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
                <span style={{fontSize:24,fontWeight:800,color:"var(--label)",fontFamily:FD}}>{(price*persons).toLocaleString("ru")} ₽</span>
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
                <span key={i} style={{padding:"4px 10px",borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep)",fontSize:12,color:"var(--label2)",fontFamily:FT}}>{t}</span>
              ))}
            </div>
          </div>
          {/* Phone */}
          <div className="tap" style={{marginTop:16,borderRadius:16,padding:"14px 16px",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:20}}>📞</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Вопросы по турам</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>+7 495 023-81-81</div></div>
            <Chev/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:100,background:"var(--bg)"}}>
      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(242,242,247,0.72)",backdropFilter:"blur(40px) saturate(200%) brightness(1.08)",WebkitBackdropFilter:"blur(40px) saturate(200%) brightness(1.08)",borderBottom:"0.5px solid rgba(60,60,67,0.12)"}}>
        <div style={{padding:"54px 20px 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:34,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-0.6px"}}>Парк</div>
            <div className="tap" onClick={()=>onProfile?onProfile():null} style={{width:38,height:38,borderRadius:19,background:"linear-gradient(145deg,#1B3A2A,#2D5A3D)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.12)"}}>
              <span style={{fontSize:14,color:"#fff",fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,padding:"12px 20px 14px",overflowX:"auto"}}>
          {[["tickets","🎫","Билеты"],["tours","🌟","Туры"],["mk","🎓","Мастер-классы"],["events","🎉","События"],["excursions","🗺️","Экскурсии"],["museums","🏛️","Музеи"],["schedule","📋","Расписание"],["b2b","🤝","Для групп"]].map(([id,ic,label])=>(
            <div key={id} className="tap" onClick={()=>{if(id==="tickets"&&onBuyTicket){onBuyTicket();return;}setSec(id);}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,flexShrink:0,
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
                style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-card)",marginBottom:14}}>
                <div style={{padding:"16px",display:"flex",gap:14}}>
                  <div style={{width:56,height:56,borderRadius:16,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{t.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{t.name_ru}</div>
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <div style={{fontSize:17,fontWeight:800,color:color,fontFamily:FD}}>{t.price.toLocaleString("ru")} ₽</div>
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
              style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-card)",marginBottom:14}}>
              <div style={{padding:"16px",display:"flex",gap:14}}>
                <div style={{width:56,height:56,borderRadius:16,background:"rgba(175,82,222,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{m.cover_emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{fontSize:16,fontWeight:700,color:"var(--label)",fontFamily:FT,lineHeight:1.3}}>{m.name_ru}</div>
                    <div style={{fontSize:16,fontWeight:800,color:"#AF52DE",fontFamily:FD,flexShrink:0}}>{m.price} ₽</div>
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
                style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",boxShadow:"var(--shadow-card)",marginBottom:14}}>
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
          {[{icon:"🏢",t:"Корпоративным клиентам",d:"16 площадок для мероприятий, тимбилдинг, MICE, банкеты и конференции",tags:["Тимбилдинг","MICE","Банкеты"]},
            {icon:"🎓",t:"Школьникам и студентам",d:"Образовательные программы, интерактивные экскурсии, детские лагеря",tags:["Экскурсии","Лагеря","МК"]},
            {icon:"✈️",t:"Турагентствам",d:"Групповые пакеты с проживанием и питанием, комиссия для агентов",tags:["Пакеты","Комиссия","Гиды"]}].map((item:any,j:number)=>(
            <div key={j} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:16,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{width:44,height:44,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22}}>{item.icon}</span></div>
                <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{item.t}</div>
              </div>
              <div style={{fontSize:14,color:"var(--label2)",fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{item.d}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {item.tags.map((tag:string,k:number)=>(<span key={k} style={{padding:"4px 10px",borderRadius:20,background:"var(--fill4)",fontSize:12,color:"var(--label2)",fontFamily:FT}}>{tag}</span>))}
              </div>
              <div className="tap" style={{borderRadius:10,background:"var(--blue)",height:40,display:"flex",alignItems:"center",justifyContent:"center"}}>
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
function StayTab({onSearch,favorites,toggleFav}:{onSearch?:()=>void,favorites?:Set<string>,toggleFav?:(id:string)=>void}) {
  const [view, setView] = useState('hotels');
  const [hotels, setHotels] = useState<any[]>([]);
  const [re, setRe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [booked, setBooked] = useState(false);

  useEffect(()=>{
    setLoading(true);
    if(view==='guest') {
      setLoading(false);
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
    <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)'}}>
      {/* HEADER */}
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(242,242,247,0.72)',backdropFilter:'blur(40px) saturate(200%) brightness(1.08)',WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.08)',borderBottom:'0.5px solid rgba(60,60,67,0.12)'}}>
        <div style={{padding:'54px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.6px'}}>Жильё</div>
            <div className="tap" style={{width:38,height:38,borderRadius:19,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <span style={{fontSize:14,color:'#fff',fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px'}}>
          {[['hotels','🏨','Забронировать'],['guest','🛎️','Гостю'],['re','🏗️','Недвижимость']].map(([id,ic,label])=>(
            <div key={id} className="tap" onClick={()=>{setView(id);setSelectedHotel(null);setBooked(false);}}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:20,flexShrink:0,
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
          {[{icon:"🧹",t:"Заказать уборку",d:"Ежедневная уборка номера",time:"30-60 мин",b:"+10"},{icon:"🛎️",t:"Вызвать консьержа",d:"Любые вопросы и пожелания",time:"5-15 мин",b:"+5"},{icon:"🍽️",t:"Еда в номер",d:"Из 15 ресторанов парка",time:"30-60 мин",b:"+15"},{icon:"🛍️",t:"Товары в номер",d:"Сувениры, косметика, книги",time:"30-60 мин",b:"+15"},{icon:"🕐",t:"Продлить проживание",d:"Добавить ночи к бронированию",time:"Онлайн",b:"+100"},{icon:"📋",t:"Чек-аут",d:"Цифровой чек-аут без очереди",time:"Мгновенно",b:"+20"}].map((item:any,j:number)=>(
            <div key={j} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:12,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{item.t}</div>
                <div style={{fontSize:12,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{item.d}</div>
                <div style={{fontSize:11,color:"var(--label3)",fontFamily:FT,marginTop:2}}>⏱ {item.time}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <div style={{padding:"3px 8px",borderRadius:8,background:"rgba(52,199,89,.1)"}}><span style={{fontSize:11,fontWeight:600,color:"var(--green)",fontFamily:FT}}>{item.b}</span></div>
                <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
              </div>
            </div>
          ))}
          <div style={{padding:14,borderRadius:14,background:"rgba(0,122,255,.06)",border:"0.5px solid rgba(0,122,255,.12)",marginTop:4}}>
            <div style={{fontSize:13,color:"var(--blue)",fontFamily:FT,textAlign:"center"}}>Доступно для гостей с активным бронированием</div>
          </div>
        </div>
      ) : selectedHotel ? (
        /* ═══ HOTEL DETAIL VIEW ═══ */
        <div style={{padding:"0"}}>
          {/* Back + Hero */}
          <div style={{position:"relative",height:220,background:"linear-gradient(145deg,#1a3a5c,#0d2240)"}}>
            <div style={{position:"absolute",inset:0,opacity:.06,backgroundImage:"radial-gradient(circle at 30% 40%, white 1px, transparent 1px)",backgroundSize:"40px 40px"}}/>
            <div className="tap" onClick={()=>setSelectedHotel(null)}
              style={{position:"absolute",top:54,left:16,width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
              <span style={{fontSize:18,color:"#fff"}}>‹</span>
            </div>
            <div style={{position:"absolute",top:54,right:16,display:"flex",gap:8}}>
              <div style={{width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:16}}>♡</span>
              </div>
              <div style={{width:36,height:36,borderRadius:18,background:"rgba(0,0,0,.3)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:14}}>↗</span>
              </div>
            </div>
            {/* Rating badge */}
            <div style={{position:"absolute",bottom:16,right:16,display:"flex",alignItems:"center",gap:8}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:FT}}>{parseFloat(selectedHotel.rating)>=4.8?"Превосходно":parseFloat(selectedHotel.rating)>=4.5?"Великолепно":"Очень хорошо"}</div>
              </div>
              <div style={{width:40,height:40,borderRadius:"12px 12px 12px 2px",background:"#003580",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:FD}}>{(parseFloat(selectedHotel.rating)*2).toFixed(1)}</span>
              </div>
            </div>
            <div style={{position:"absolute",bottom:16,left:16}}>
              <span style={{background:"rgba(255,255,255,.18)",backdropFilter:"blur(12px)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#fff",fontWeight:700,fontFamily:FT}}>{selectedHotel.rooms_count} номеров</span>
            </div>
          </div>
          <div style={{padding:"20px"}}>
            {/* Name + type */}
            <div style={{fontSize:26,fontWeight:800,color:"var(--label)",fontFamily:FD,letterSpacing:"-.5px",lineHeight:1.2}}>{selectedHotel.name}</div>
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
            </div>
            {/* Booking section */}
            <div style={{marginTop:20,padding:"20px",borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-md)"}}>
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
                <span style={{fontSize:24,fontWeight:800,color:"var(--label)",fontFamily:FD}}>{(selectedHotel.price_from*nights)?.toLocaleString("ru")} ₽</span>
              </div>
              {/* Book button */}
              <div className="tap" onClick={()=>setBooked(true)} style={{marginTop:16,padding:"16px",borderRadius:16,background:"#003580",textAlign:"center",boxShadow:"0 4px 16px rgba(0,53,128,.3)"}}>
                <span style={{fontSize:17,fontWeight:700,color:"#fff",fontFamily:FT}}>Забронировать</span>
              </div>
              <div style={{textAlign:"center",marginTop:8}}>
                <span style={{fontSize:11,color:"var(--label3)",fontFamily:FT}}>Бесплатная отмена за 48 часов</span>
              </div>
            </div>
            {/* Phone help */}
            <div className="tap" style={{marginTop:16,borderRadius:16,padding:"14px 16px",background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:20}}>📞</span>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"var(--label)",fontFamily:FT}}>Помощь с бронированием</div><div style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>+7 495 023-81-81 · 9:00–21:00</div></div>
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
              <div key={h.id} className={`fu s${Math.min(i+1,6)}`} style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-md)',marginBottom:16}}>
                {/* Photo */}
                <div style={{height:180,background:`linear-gradient(145deg,${g[0]},${g[1]})`,position:'relative',overflow:'hidden'}}>
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
                      <span style={{fontSize:15,fontWeight:800,color:'#fff',fontFamily:FD}}>{rDisp}</span>
                    </div>
                  </div>
                  <div className="tap" style={{position:'absolute',bottom:14,right:14,width:34,height:34,borderRadius:17,background:'rgba(0,0,0,.3)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:16}}>♡</span>
                  </div>
                  <div style={{position:'absolute',bottom:14,left:14,background:'rgba(0,0,0,.45)',backdropFilter:'blur(8px)',borderRadius:8,padding:'4px 10px',display:'flex',alignItems:'center',gap:4}}>
                    <span style={{fontSize:11,color:'#fff',fontFamily:FT}}>📷 Фото скоро</span>
                  </div>
                </div>
                {/* Content */}
                <div style={{padding:'16px'}}>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',lineHeight:1.2}}>{h.name}</div>
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
                        <span style={{fontSize:26,fontWeight:800,color:'var(--label)',fontFamily:FD,letterSpacing:'-.5px'}}>{h.price_from?.toLocaleString('ru')}</span>
                        <span style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>₽</span>
                      </div>
                      <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>за ночь · вкл. билеты в парк</div>
                    </div>
                    <div className="tap" onClick={()=>setSelectedHotel(h)} style={{padding:'13px 24px',borderRadius:14,background:'#003580',boxShadow:'0 2px 8px rgba(0,53,128,.3)',cursor:'pointer'}}>
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
            <div style={{position:'absolute',right:-8,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.1}}>📞</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>Нужна помощь с выбором?</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.65)',fontFamily:FT,marginTop:4}}>Позвоните: +7 495 023-81-81</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:2}}>Ежедневно 9:00–21:00</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 20px'}}>
          <div style={{borderRadius:20,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.12)'}}>
            <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:64,opacity:.08}}>🏗️</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>Ethnomir DEVELOPMENT</div>
              <div style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4,letterSpacing:'-.3px'}}>Инвестируй в Этномир</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:6,lineHeight:1.4}}>Апартаменты, виллы и коммерческие площади в уникальном парке</div>
              <div style={{display:'flex',gap:20,marginTop:14}}>
                {[['ROI','до 22%'],['Заезд','2026'],['Доход','от 83K₽/мес']].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:18,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:'var(--label)'}}>{re.length}</span> объектов в продаже</div>
          {re.map((r:any,i:number)=>{
            const st = RE_STATUS[r.status]||RE_STATUS.available;
            const rt = RE_TYPE[r.type]||RE_TYPE.apartment;
            return (
              <div key={r.id} className={`fu s${Math.min(i+1,6)}`} style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-md)',marginBottom:16}}>
                <div style={{height:160,background:'linear-gradient(145deg,#1a2a3a,#2a3a4a)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',inset:0,opacity:.04,backgroundImage:'radial-gradient(circle at 25% 35%, white 1px, transparent 1px)',backgroundSize:'30px 30px'}}/>
                  <span style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',fontSize:56,opacity:.15}}>{rt.e}</span>
                  <div style={{position:'absolute',top:14,left:14}}><span style={{background:st.c,borderRadius:6,padding:'4px 10px',fontSize:11,color:'#fff',fontWeight:700,fontFamily:FT}}>{st.l}</span></div>
                  <div style={{position:'absolute',top:14,right:14}}><span style={{background:'rgba(255,255,255,.18)',backdropFilter:'blur(12px)',borderRadius:6,padding:'4px 10px',fontSize:11,color:'#fff',fontWeight:700,fontFamily:FT}}>{rt.l}</span></div>
                  <div style={{position:'absolute',bottom:14,left:14,background:'rgba(52,199,89,.85)',backdropFilter:'blur(8px)',borderRadius:8,padding:'5px 12px'}}><span style={{fontSize:13,fontWeight:800,color:'#fff',fontFamily:FD}}>ROI {r.roi_percent}%</span></div>
                </div>
                <div style={{padding:'16px'}}>
                  <div style={{fontSize:18,fontWeight:800,color:'var(--label)',fontFamily:FD,letterSpacing:'-.3px',lineHeight:1.25}}>{r.name_ru}</div>
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:6,lineHeight:1.45}}>{r.description_ru?.slice(0,120)}{r.description_ru?.length>120?'…':''}</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:12}}>
                    <div style={{padding:'10px 8px',borderRadius:12,background:'var(--bg)',textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:'var(--label)',fontFamily:FD}}>{r.area_m2} м²</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Площадь</div></div>
                    <div style={{padding:'10px 8px',borderRadius:12,background:'var(--bg)',textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:'var(--label)',fontFamily:FD}}>{r.rooms}</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Комнат</div></div>
                    <div style={{padding:'10px 8px',borderRadius:12,background:'var(--bg)',textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:'var(--label)',fontFamily:FD}}>{r.floor}/{r.floors_total}</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Этаж</div></div>
                  </div>
                  <div style={{marginTop:12,padding:'12px',borderRadius:14,background:'rgba(52,199,89,.04)',border:'0.5px solid rgba(52,199,89,.15)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Ежемесячный доход</div><div style={{fontSize:18,fontWeight:800,color:'#34C759',fontFamily:FD,marginTop:2}}>{r.monthly_income?.toLocaleString('ru')} ₽</div></div>
                      <div style={{textAlign:'right'}}><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Цена за м²</div><div style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT,marginTop:2}}>{r.price_per_m2?.toLocaleString('ru')} ₽</div></div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:14,paddingTop:14,borderTop:'0.5px solid var(--sep)'}}>
                    <div><div style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>Стоимость</div><div style={{display:'flex',alignItems:'baseline',gap:4}}><span style={{fontSize:24,fontWeight:800,color:'var(--label)',fontFamily:FD,letterSpacing:'-.5px'}}>{(r.price/1000000).toFixed(1)}</span><span style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>млн ₽</span></div></div>
                    <div className="tap" style={{padding:'13px 24px',borderRadius:14,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',boxShadow:'0 2px 8px rgba(0,0,0,.15)'}}><span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>Подробнее</span></div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="tap" style={{borderRadius:16,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'18px',position:'relative',overflow:'hidden',marginBottom:16}}>
            <div style={{position:'absolute',right:-8,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.1}}>💼</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>Бесплатная консультация</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.65)',fontFamily:FT,marginTop:4}}>Расскажем о доходности и условиях покупки</div>
              <div style={{display:'inline-flex',marginTop:12,background:'rgba(255,255,255,.14)',borderRadius:12,padding:'8px 18px',border:'0.5px solid rgba(255,255,255,.2)'}}><span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Оставить заявку →</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SERVICES ─────────────────────────────────────────────
function ServicesTab({onSearch,onProfile}:{onSearch?:()=>void,onProfile?:()=>void}) {
  const [sec, setSec] = useState('delivery');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any[]>([]);
  const [restId, setRestId] = useState<string|null>(null);
  const [partner, setPartner] = useState<any[]>([]);
  const [expId, setExpId] = useState<string|null>(null);
  const [selectedRest, setSelectedRest] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [countryDetail, setCountryDetail] = useState<any>(null);
  const [loyaltyLevels, setLoyaltyLevels] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const toggleFav = (id:string)=>setFavorites(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});
  
  const [fullMenu, setFullMenu] = useState<any[]>([]);

  useEffect(()=>{
    setLoading(true);setExpId(null);
    if(sec==='banya') {
      sb('services','select=*&category=eq.banya&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='delivery') {
      setData([]);setLoading(false);
    } else if(sec==='shops') {
      sb('services','select=*&category=eq.shop&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='food') {
      sb('restaurants','select=*&active=eq.true&order=rating.desc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='fun') {
      sb('services','select=*&category=eq.attractions&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='rental') {
      sb('services','select=*&category=in.(rental,transport)&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='partner') {
      sb('partnership','select=*&is_published=eq.true&order=sort_order.asc').then(d=>{setPartner(d||[]);setLoading(false);});
    } else {
      sb('services','select=*&category=in.(excursion,kids,photo)&active=eq.true&order=category.asc,sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
    }
  },[sec]);

  const openRest = (r:any)=>{
    setSelectedRest(r);
    setFullMenu([]);
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
        style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
        <div style={{padding:'16px',display:'flex',gap:14}}>
          <div style={{width:60,height:60,borderRadius:16,background:`${sc}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{s.cover_emoji}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
              <div style={{fontSize:16,fontWeight:700,color:'var(--label)',fontFamily:FT,lineHeight:1.3}}>{s.name_ru}</div>
              {s.price_from>0 && <div style={{flexShrink:0,textAlign:'right'}}>
                <div style={{fontSize:16,fontWeight:800,color:sc,fontFamily:FD}}>{s.price_from>=1000?(s.price_from/1000).toFixed(s.price_from%1000?1:0)+'K':s.price_from} ₽</div>
              </div>}
            </div>
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{isExp ? s.description_ru : (s.description_ru?.slice(0,80)+(s.description_ru?.length>80?'...':''))}</div>
            <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8,flexWrap:'wrap'}}>
              {s.location_ru && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>📍 {s.location_ru}</span>}
              {s.duration_text && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>⏱ {s.duration_text}</span>}
              {s.status_text && <span style={{fontSize:11,fontWeight:600,color:'#34C759',fontFamily:FT}}>● {s.status_text}</span>}
            </div>
            {isExp && s.price_from>0 && (
              <div className="tap" onClick={(e:any)=>e.stopPropagation()} style={{marginTop:12,padding:'11px',borderRadius:14,background:sc,textAlign:'center'}}>
                <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>{s.price_from>=10000?'Оставить заявку':'Записаться'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)'}}>
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(242,242,247,0.72)',backdropFilter:'blur(40px) saturate(200%) brightness(1.08)',WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.08)',borderBottom:'0.5px solid rgba(60,60,67,0.12)'}}>
        <div style={{padding:'54px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.6px'}}>Услуги</div>
            <div className="tap" style={{width:38,height:38,borderRadius:19,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <span style={{fontSize:14,color:'#fff',fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px',overflowX:'auto'}}>
          {[['delivery','🛵','Доставка'],['food','🍽️','Рестораны'],['shops','🛍️','Магазины'],['banya','🧖','Бани и СПА'],['fun','🎡','Развлечения'],['rental','🚲','Прокат'],['other','🎯','Экскурсии'],['partner','💼','Партнёрство']].map(([id,ic,label])=>(
            <div key={id} className="tap" onClick={()=>setSec(id)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:20,flexShrink:0,
                background:sec===id?'var(--label)':'var(--bg2)',
                border:'0.5px solid '+(sec===id?'var(--label)':'var(--sep-opaque)'),
                boxShadow:sec===id?'none':'var(--shadow-sm)'}}>
              <span style={{fontSize:14}}>{ic}</span>
              <span style={{fontSize:14,fontWeight:600,color:sec===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? <Spinner/> : sec==='partner' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{borderRadius:20,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:64,opacity:.08}}>🤝</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>Ethnomir BUSINESS</div>
              <div style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>Партнёрство</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:6,lineHeight:1.4}}>Франшиза · Аренда · Инвестиции · Свой бизнес в парке</div>
            </div>
          </div>
          {partner.map((p:any,i:number)=>{
            const isExp = expId === p.id;
            return (
              <div key={p.id} className={`tap fu s${Math.min(i+1,6)}`} onClick={()=>setExpId(isExp?null:p.id)}
                style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
                <div style={{padding:'16px',display:'flex',gap:14}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'linear-gradient(145deg,#0d1b2a22,#1a3a5c22)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{p.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{p.name_ru}</div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{p.description_ru}</div>
                    {p.investment_from && <div style={{display:'flex',gap:12,marginTop:10}}>
                      <div><div style={{fontSize:15,fontWeight:800,color:'var(--blue)',fontFamily:FD}}>от {p.investment_from>=1000000?(p.investment_from/1000000)+'M':(p.investment_from/1000)+'K'} ₽</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Инвестиции</div></div>
                      {p.roi_percent && <div><div style={{fontSize:15,fontWeight:800,color:'#34C759',fontFamily:FD}}>{p.roi_percent}%</div><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>ROI</div></div>}
                    </div>}
                    {isExp && (p.benefits||[]).length>0 && (
                      <div style={{marginTop:12,padding:'12px',borderRadius:14,background:'var(--bg)',border:'0.5px solid var(--sep)'}}>
                        {(p.benefits||[]).map((b:string,j:number)=>(
                          <div key={j} style={{display:'flex',gap:6,alignItems:'center',padding:'4px 0'}}>
                            <span style={{fontSize:12,color:'#34C759'}}>✓</span>
                            <span style={{fontSize:12,color:'var(--label2)',fontFamily:FT}}>{b}</span>
                          </div>
                        ))}
                        <div className="tap" onClick={(e:any)=>e.stopPropagation()} style={{marginTop:10,padding:'11px',borderRadius:14,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',textAlign:'center'}}>
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
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Отдел партнёрства</div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>+7 495 023-81-81</div></div>
            <Chev/>
          </div>
        </div>
      ) : sec==='delivery' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>Доставка в номер</div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:16}}>Еда и товары из парка — прямо к двери</div>
          <div style={{borderRadius:20,background:'linear-gradient(135deg,#0d2b1d,#1a6b3a)',padding:20,marginBottom:16}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:FD,marginBottom:6}}>Единая корзина</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,.7)',fontFamily:FT,lineHeight:1.5}}>Блюда из ресторанов и товары из магазинов — в одну корзину. Укажите отель и номер.</div>
          </div>
          {[{c:'🍽️',t:'Заказать еду',d:'Из 15 ресторанов парка',b:'+15'},{c:'🛍️',t:'Заказать товары',d:'Сувениры и ремёсла',b:'+15'},{c:'🧖',t:'СПА-наборы',d:'Косметика для бани',b:'+10'}].map((x:any,j:number)=>(
            <div key={j} className="tap" style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-card)',padding:14,marginBottom:10,display:'flex',gap:14,alignItems:'center'}}>
              <div style={{width:50,height:50,borderRadius:12,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{x.c}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{x.t}</div>
                <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{x.d}</div>
              </div>
              <div style={{padding:'3px 8px',borderRadius:8,background:'rgba(52,199,89,.1)'}}><span style={{fontSize:11,fontWeight:600,color:'var(--green)',fontFamily:FT}}>{x.b}</span></div>
            </div>
          ))}
          <div style={{padding:12,borderRadius:12,background:'var(--fill4)',marginTop:4}}>
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,textAlign:'center'}}>Минимум 500 ₽ · Доставка 30-60 мин</div>
          </div>
        </div>
      ) : sec==='food' ? (selectedRest ? (
        <div style={{padding:0}}>
          <div style={{position:'relative',height:200,background:'linear-gradient(145deg,#8B4513,#D2691E)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'0 0 0 0'}}>
            <span style={{fontSize:80,opacity:.2}}>{selectedRest.cover_emoji}</span>
            <div className="tap" onClick={()=>{setSelectedRest(null);setFullMenu([]);}}
              style={{position:'absolute',top:54,left:16,width:36,height:36,borderRadius:18,background:'rgba(0,0,0,.3)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>
              <span style={{fontSize:18,color:'#fff'}}>‹</span>
            </div>
            <div style={{position:'absolute',top:54,right:16,display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,color:'#FFD60A'}}>★</span>
              <span style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD}}>{selectedRest.rating}</span>
            </div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 18px 16px',background:'linear-gradient(transparent,rgba(0,0,0,.5))'}}>
              <div style={{fontSize:26,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.5px'}}>{selectedRest.name_ru}</div>
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
                style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
                <div className="tap" onClick={()=>openRest(r)} style={{padding:'16px',display:'flex',gap:14}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'rgba(255,149,0,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{r.cover_emoji||'🍽️'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div style={{fontSize:17,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{r.name_ru}</div>
                      <div style={{display:'flex',alignItems:'center',gap:3,flexShrink:0}}>
                        <span style={{fontSize:12,color:'#FFD60A'}}>★</span>
                        <span style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{r.rating}</span>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{r.description_ru?.slice(0,90)}{r.description_ru?.length>90?'...':''}</div>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      {r.avg_check && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT,background:'var(--fill4)',padding:'3px 8px',borderRadius:8}}>💰 ~{r.avg_check} ₽</span>}
                      {r.is_halal && <span style={{fontSize:11,color:'#34C759',fontFamily:FT,background:'rgba(52,199,89,.08)',padding:'3px 8px',borderRadius:8}}>☪️ Халяль</span>}
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
                          <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{m.weight_g?m.weight_g+'г':''}{m.calories?' · '+m.calories+'ккал':''}</div></div>
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
              <div style={{borderRadius:20,background:"linear-gradient(135deg,#0d2b1d,#1a6b3a)",padding:20,marginBottom:16}}>
                <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:FD,marginBottom:6}}>Единая корзина</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,.7)",fontFamily:FT,lineHeight:1.5}}>Блюда из ресторанов и товары из магазинов — в одну корзину. Укажите отель и номер.</div>
              </div>
              {[{c:"🍽️",t:"Заказать еду",d:"Из 15 ресторанов парка",b:"+15"},{c:"🛍️",t:"Заказать товары",d:"Сувениры и ремёсла",b:"+15"},{c:"🧖",t:"СПА-наборы",d:"Косметика для бани",b:"+10"}].map((x:any,j:number)=>(
                <div key={j} className="tap" style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:14,marginBottom:10,display:"flex",gap:14,alignItems:"center"}}>
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
              <div style={{position:'absolute',right:-8,top:'50%',transform:'translateY(-50%)',fontSize:48,opacity:.15}}>🔥</div>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>СПА-туры для двоих</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:4}}>Романтический отдых: баня + массаж + ужин</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:2}}>+7 495 023-81-81</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PASSPORT ─────────────────────────────────────────────
function PassportTab({ session, onLogin, onLogout, onQR, onCountry, loyaltyLevels, userPoints }: any) {
  const [sec, setSec] = useState('stamps');
  const [countries, setCountries] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCountry, setExpandedCountry] = useState<string|null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string|null>(null);
  const [regionFd, setRegionFd] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [visitedRegions, setVisitedRegions] = useState<string[]>([]);
  const [walletTx, setWalletTx] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.access_token) { setProfile(null); setVisitedCountries([]); setVisitedRegions([]); return; }
    const t = session.access_token;
    Promise.all([
      sbAuthGet(t, 'profiles?select=*&id=eq.' + session.user?.id),
      sbAuthGet(t, 'passport_stamps?select=country_id,region_id&user_id=eq.' + session.user?.id),
    ]).then(([prof, stamps]) => {
      if (prof?.[0]) setProfile(prof[0]);
      const cIds = (stamps||[]).filter((s:any)=>s.country_id).map((s:any)=>s.country_id);
      const rIds = (stamps||[]).filter((s:any)=>s.region_id).map((s:any)=>s.region_id);
      setVisitedCountries([...new Set(cIds)]);
      setVisitedRegions([...new Set(rIds)]);
      sbAuthGet(t, 'wallet_transactions?select=*&user_id=eq.' + session.user?.id + '&order=created_at.desc&limit=10').then(tx => setWalletTx(tx || []));
    });
  }, [session]);

  useEffect(()=>{
    setLoading(true);
    if(sec==='cabinet') {
      setLoading(false);
    } else if(sec==='stamps') {
      sb('countries','select=*&active=eq.true&order=sort_order.asc').then(d=>{setCountries(d||[]);setLoading(false);});
    } else if(sec==='achievements') {
      sb('achievements','select=*&order=track.asc,level.asc').then(d=>{setAchievements(d||[]);setLoading(false);});
    } else if(sec==='regions') {
      sb('regions_rf','select=*&active=eq.true&order=sort_order.asc').then(d=>{setRegions(d||[]);setLoading(false);});
    } else { setLoading(false); }
  },[sec]);

  const filteredRegions = regionFd ? regions.filter(r=>r.federal_district===regionFd) : regions;
  const FDS = [...new Set(regions.map(r=>r.federal_district).filter(Boolean))];
  const vPct = Math.round(visitedCountries.length/96*100);
  const rPct = Math.round(visitedRegions.length/85*100);
  const lvlName = (l:string)=>({'newcomer':'Новичок','tourist':'Турист','traveler':'Путешественник','explorer':'Исследователь','ambassador':'Посол Мира','citizen':'Гражданин','legend':'Легенда'}[l]||'Новичок');

  // Round passport stamp component
  const Stamp = ({flag,name,visited,size=64}:{flag:string,name:string,visited:boolean,size?:number}) => (
    <div style={{width:size,textAlign:'center'}}>
      <div style={{width:size,height:size,borderRadius:size/2,
        border:visited?'3px solid #34C759':'2.5px dashed var(--sep-opaque)',
        background:visited?'rgba(52,199,89,.06)':'var(--bg)',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:size*0.45,opacity:visited?1:.5,filter:visited?'none':'grayscale(60%)',
        position:'relative',transition:'all .3s'}}>
        {flag}
        {visited && <div style={{position:'absolute',bottom:-2,right:-2,width:20,height:20,borderRadius:10,background:'#34C759',border:'2px solid var(--bg2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:10,color:'#fff',fontWeight:800}}>✓</span>
        </div>}
      </div>
      <div style={{fontSize:9,fontWeight:600,color:visited?'var(--label)':'var(--label3)',fontFamily:FT,marginTop:4,lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
    </div>
  );

  const ACH_COLORS: Record<string,string> = {countries:'#007AFF',gastronomy:'#FF9500',masterclasses:'#AF52DE',banya:'#C0392B',visits:'#34C759',regions:'#E91E63',social:'#5856D6',purchases:'#FFD60A'};

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100,background:'var(--bg)'}}>
      {/* HEADER */}
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(242,242,247,0.72)',backdropFilter:'blur(40px) saturate(200%) brightness(1.08)',WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.08)',borderBottom:'0.5px solid rgba(60,60,67,0.12)'}}>
        <div style={{padding:'54px 20px 14px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.6px'}}>Паспорт</div>
            <div className="tap" style={{width:38,height:38,borderRadius:19,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <span style={{fontSize:14,color:'#fff',fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PASSPORT BOOK CARD ═══ */}
      <div style={{padding:'14px 20px 0'}}>
        <div style={{borderRadius:24,background:'linear-gradient(160deg,#0A1A10 0%,#142A1A 30%,#1D3D25 60%,#2A5433 100%)',boxShadow:'0 8px 32px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,.05)',padding:'24px 20px',position:'relative',overflow:'hidden'}}>
          {/* Decorative passport pattern */}
          <div style={{position:'absolute',inset:0,opacity:.03,backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)',backgroundSize:'14px 14px'}}/>
          <div style={{position:'absolute',top:12,right:12,width:60,height:60,borderRadius:30,border:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:48,height:48,borderRadius:24,border:'1px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🌐</div>
          </div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.35)',fontWeight:700,letterSpacing:2.5,fontFamily:FT,textTransform:'uppercase'}}>ЭТНОГРАФИЧЕСКИЙ ПАРК-МУЗЕЙ</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)',fontWeight:600,letterSpacing:1.5,fontFamily:FT,marginTop:2}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
            <div style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:10,letterSpacing:-0.4}}>{session ? (profile?.name || 'Загрузка...') : 'Гражданин Мира'}</div>
            {session && profile && <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:3}}>{lvlName(profile.citizenship_level)} · {profile.streak_days||0} дн. серия</div>}
            {!session && <div style={{fontSize:12,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:3}}>Войди чтобы сохранять прогресс</div>}

            {/* Stats row */}
            <div style={{display:'flex',gap:0,marginTop:16,background:'rgba(0,0,0,.2)',borderRadius:14,overflow:'hidden'}}>
              {[['🌍',visitedCountries.length+'/96','Стран','#7DEFA1'],['🇷🇺',visitedRegions.length+'/85','Регионов','#5E9CFF'],['⭐',profile?String(profile.points||0):'0','Баллов','#FFD60A']].map(([ic,v,l,c],i)=>(
                <div key={l} style={{flex:1,padding:'12px 8px',textAlign:'center',borderRight:i<2?'0.5px solid rgba(255,255,255,.06)':'none'}}>
                  <div style={{fontSize:14}}>{ic}</div>
                  <div style={{fontSize:16,fontWeight:800,color:c,fontFamily:FD,marginTop:2}}>{v}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.4)',fontFamily:FT}}>{l}</div>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div style={{marginTop:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Страны мира</span>
                <span style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT,fontWeight:600}}>{vPct}%</span>
              </div>
              <div style={{height:4,background:'rgba(255,255,255,.08)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.max(2,vPct)}%`,background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:2,transition:'width .8s cubic-bezier(0.2,0.8,0.2,1)'}}/>
              </div>
            </div>
            <div style={{marginTop:8}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>Регионы России</span>
                <span style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT,fontWeight:600}}>{rPct}%</span>
              </div>
              <div style={{height:4,background:'rgba(255,255,255,.08)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.max(2,rPct)}%`,background:'linear-gradient(90deg,#007AFF,#5E9CFF)',borderRadius:2,transition:'width .8s'}}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SCAN QR BUTTON ═══ */}
      <div style={{padding:'0 20px'}}>
        {/* Loyalty Card */}
        {loyaltyLevels && loyaltyLevels.length>0 && (
          <div style={{marginBottom:16,padding:16,borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:28}}>{loyaltyLevels[0]?.icon||"🌱"}</span>
              <div>
                <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{loyaltyLevels[0]?.name_ru||"Гость"}</div>
                <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT}}>{userPoints||0} очков</div>
              </div>
            </div>
            {loyaltyLevels[1] && (
              <div style={{marginTop:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>До уровня {loyaltyLevels[1].icon} {loyaltyLevels[1].name_ru}</span>
                  <span style={{fontSize:12,color:"var(--label3)",fontFamily:FT}}>{loyaltyLevels[1].min_points-(userPoints||0)}</span>
                </div>
                <div style={{height:4,borderRadius:2,background:"var(--fill4)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:Math.min(100,Math.round((userPoints||0)/loyaltyLevels[1].min_points*100))+"%",borderRadius:2,background:loyaltyLevels[0]?.color||"var(--blue)",transition:"width .5s"}}/>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="tap" style={{borderRadius:14,background:'var(--blue)',height:50,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} onClick={()=>onQR&&onQR()}>
          <span style={{fontSize:17,fontWeight:600,color:'#fff',fontFamily:FT}}>Сканировать QR-код</span>
        </div>
      </div>

      {/* ═══ GAMIFICATION STATS ═══ */}
      <div style={{padding:'16px 20px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0,borderRadius:16,overflow:'hidden',border:'0.5px solid var(--sep-opaque)'}}>
          <div style={{padding:'16px 8px',background:'var(--bg2)',textAlign:'center',borderRight:'0.5px solid var(--sep)'}}>
            <div style={{fontSize:20,fontWeight:600,color:'var(--blue)',fontFamily:FD}}>{countries.filter((c:any)=>c._visited).length}</div>
            <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:4,fontWeight:500}}>стран</div>
          </div>
          <div style={{padding:'16px 8px',background:'var(--bg2)',textAlign:'center',borderRight:'0.5px solid var(--sep)'}}>
            <div style={{fontSize:20,fontWeight:600,color:'var(--orange)',fontFamily:FD}}>{countries.filter((c:any)=>c._visited).length*15}</div>
            <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:4,fontWeight:500}}>очков</div>
          </div>
          <div style={{padding:'16px 8px',background:'var(--bg2)',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:600,color:'var(--green)',fontFamily:FD}}>{Math.round(countries.filter((c:any)=>c._visited).length/96*100)}%</div>
            <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:4,fontWeight:500}}>прогресс</div>
          </div>
        </div>
      </div>

      {/* ═══ TAB PILLS ═══ */}
      <div style={{display:'flex',gap:8,padding:'14px 20px',overflowX:'auto'}}>
        {[['stamps','🌍','Страны'],['regions','🇷🇺','Регионы'],['achievements','🏆','Достижения'],['cabinet','👤','Кабинет']].map(([id,ic,label])=>(
          <div key={id} className="tap" onClick={()=>setSec(id)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:20,flexShrink:0,
              background:sec===id?'var(--label)':'var(--bg2)',
              border:'0.5px solid '+(sec===id?'var(--label)':'var(--sep-opaque)'),
              boxShadow:sec===id?'none':'var(--shadow-sm)'}}>
            <span style={{fontSize:14}}>{ic}</span>
            <span style={{fontSize:14,fontWeight:600,color:sec===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
          </div>
        ))}
      </div>

      {loading ? <Spinner/> : sec==='stamps' ? (
        <div style={{padding:'0 20px'}}>
          {/* ═══ ROUND STAMPS GRID ═══ */}
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>Коллекция штампов</div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:16}}>Посети павильон → отсканируй QR → получи штамп и баллы</div>

          {/* Stamps grid - like a real passport page */}
          <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'flex-start',marginBottom:20}}>
            {countries.slice(0,24).map((c:any)=>(
              <div key={c.id} className="tap" onClick={()=>{const opening=expandedCountry!==c.id;setExpandedCountry(opening?c.id:null);if(opening)setTimeout(()=>{const el=document.getElementById("cdetail-"+c.id);if(el)el.scrollIntoView({behavior:"smooth",block:"nearest"})},150)}}>
                <Stamp flag={c.flag_emoji} name={c.name_ru} visited={visitedCountries.includes(c.id)} size={58}/>
              </div>
            ))}
          </div>

          {/* Expanded country detail */}
          {expandedCountry && countries.find((c:any)=>c.id===expandedCountry) && (()=>{
            const c = countries.find((cc:any)=>cc.id===expandedCountry);
            const vis = visitedCountries.includes(c.id);
            return (
              <div id={"cdetail-"+c.id} className="fu" style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-md)',padding:'20px',marginBottom:16}}>
                <div style={{display:'flex',gap:14,alignItems:'center',marginBottom:14}}>
                  <div style={{width:56,height:56,borderRadius:28,border:vis?'3px solid #34C759':'2.5px dashed var(--sep)',background:vis?'rgba(52,199,89,.06)':'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{c.flag_emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:20,fontWeight:800,color:'var(--label)',fontFamily:FD}}>{c.name_ru}</div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>{c.capital?c.capital+' · ':''}{c.region}</div>
                  </div>
                  <div className="tap" onClick={()=>setExpandedCountry(null)} style={{width:28,height:28,borderRadius:14,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'var(--label3)'}}>✕</div>
                </div>

                {/* Stamp status */}
                <div style={{padding:'16px',borderRadius:16,background:vis?'rgba(52,199,89,.05)':'rgba(0,122,255,.04)',border:vis?'0.5px solid rgba(52,199,89,.15)':'0.5px solid rgba(0,122,255,.12)',textAlign:'center',marginBottom:14}}>
                  {vis ? (
                    <><div style={{fontSize:40,marginBottom:6}}>🎫</div>
                    <div style={{fontSize:15,fontWeight:700,color:'#34C759',fontFamily:FT}}>Штамп получен!</div>
                    <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:2}}>+50 баллов зачислено</div></>
                  ) : (
                    <><div style={{fontSize:40,marginBottom:6}}>🔒</div>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--blue)',fontFamily:FT}}>Страна не открыта</div>
                    <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:2}}>Посети павильон и отсканируй QR-код</div>
                    <div className="tap" style={{display:'inline-block',marginTop:12,padding:'10px 24px',borderRadius:14,background:'var(--blue)'}}>
                      <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>📷 Сканировать QR</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--blue)',fontFamily:FT,marginTop:8}}>+50 баллов за открытие</div></>
                  )}
                </div>

                {c.description_ru && <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{c.description_ru}</div>}
                {c.fun_fact_ru && (
                  <div style={{padding:'12px',borderRadius:14,background:'rgba(255,149,0,.06)',border:'0.5px solid rgba(255,149,0,.12)',marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--orange)',fontFamily:FT,marginBottom:3}}>💡 Интересный факт</div>
                    <div style={{fontSize:12,color:'var(--label2)',fontFamily:FT,lineHeight:1.5}}>{c.fun_fact_ru}</div>
                  </div>
                )}
                <div style={{display:'flex',gap:8}}>
                  {c.capital && <div style={{flex:1,padding:'10px',borderRadius:12,background:'var(--fill4)',textAlign:'center'}}><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Столица</div><div style={{fontSize:12,fontWeight:700,color:'var(--label)',fontFamily:FT,marginTop:2}}>{c.capital}</div></div>}
                  {c.population>0 && <div style={{flex:1,padding:'10px',borderRadius:12,background:'var(--fill4)',textAlign:'center'}}><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Население</div><div style={{fontSize:12,fontWeight:700,color:'var(--label)',fontFamily:FT,marginTop:2}}>{(c.population/1000000).toFixed(0)} млн</div></div>}
                  {c.area_km2>0 && <div style={{flex:1,padding:'10px',borderRadius:12,background:'var(--fill4)',textAlign:'center'}}><div style={{fontSize:10,color:'var(--label3)',fontFamily:FT}}>Площадь</div><div style={{fontSize:12,fontWeight:700,color:'var(--label)',fontFamily:FT,marginTop:2}}>{(c.area_km2/1000).toFixed(0)}K км²</div></div>}
                </div>
              </div>
            );
          })()}

          {/* Show more button */}
          {countries.length>24 && (
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginBottom:8}}>Показано 24 из {countries.length} стран</div>
              <div className="tap" style={{display:'inline-block',padding:'10px 24px',borderRadius:14,background:'var(--fill4)',border:'0.5px solid var(--sep)'}}>
                <span style={{fontSize:13,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Показать все {countries.length} стран</span>
              </div>
            </div>
          )}

          {/* Achievement milestones */}
          <div style={{borderRadius:18,background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:'16px',marginBottom:16}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ТРЕК «ГРАЖДАНИН МИРА»</div>
            <div style={{display:'flex',gap:8,marginTop:10}}>
              {[{n:'1',l:'Первые шаги',c:'#7DEFA1'},{n:'5',l:'Путник',c:'#5E9CFF'},{n:'10',l:'Картограф',c:'#FFD60A'},{n:'20',l:'Исследователь',c:'#FF9500'},{n:'96',l:'Посол Мира',c:'#FF6B9D'}].map(a=>(
                <div key={a.n} style={{flex:1,textAlign:'center',padding:'8px 2px',borderRadius:10,background:'rgba(255,255,255,.06)'}}>
                  <div style={{fontSize:14,fontWeight:800,color:visitedCountries.length>=parseInt(a.n)?a.c:'rgba(255,255,255,.25)',fontFamily:FD}}>{a.n}</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,.4)',fontFamily:FT}}>{a.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : sec==='regions' ? (
        <div style={{padding:'0 20px'}}>
          <div style={{borderRadius:18,background:'linear-gradient(135deg,#1a2a1a,#2d4a2d)',padding:'16px',marginBottom:14}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ПАСПОРТ «МОЯ РОССИЯ»</div>
            <div style={{fontSize:18,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>{visitedRegions.length} / 85 регионов</div>
            <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,marginTop:10,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.max(2,rPct)}%`,background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:2}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12,overflowX:'auto',paddingBottom:4}}>
            <div className="tap" onClick={()=>setRegionFd('')} style={{flexShrink:0,padding:'5px 12px',borderRadius:10,background:regionFd===''?'var(--blue)':'var(--fill4)',border:'.5px solid var(--sep)'}}>
              <span style={{fontSize:11,fontWeight:600,color:regionFd===''?'#fff':'var(--label2)',fontFamily:FT}}>Все 85</span>
            </div>
            {FDS.map(fd=>(
              <div key={fd} className="tap" onClick={()=>setRegionFd(fd)} style={{flexShrink:0,padding:'5px 12px',borderRadius:10,background:regionFd===fd?'var(--blue)':'var(--fill4)',border:'.5px solid var(--sep)'}}>
                <span style={{fontSize:10,fontWeight:600,color:regionFd===fd?'#fff':'var(--label2)',fontFamily:FT}}>{fd}</span>
              </div>
            ))}
          </div>
          {/* Region stamps grid */}
          <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:16}}>
            {filteredRegions.slice(0,30).map((r:any)=>{
              const vis=visitedRegions.includes(r.id);
              return (
              <div key={r.id} className="tap" onClick={()=>setExpandedRegion(expandedRegion===r.id?null:r.id)} style={{width:58,textAlign:'center'}}>
                <div style={{width:58,height:58,borderRadius:29,border:vis?'3px solid #34C759':'2.5px dashed var(--sep-opaque)',background:vis?'rgba(52,199,89,.06)':'#fff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative',opacity:vis?1:.6,filter:vis?'none':'grayscale(50%)'}}>
                  {r.coat_of_arms_url ? <img src={r.coat_of_arms_url} alt="" style={{width:'80%',height:'80%',objectFit:'contain'}}/> : <span style={{fontSize:24}}>{r.flag_emoji||'🏛️'}</span>}
                  {vis && <div style={{position:'absolute',bottom:-2,right:-2,width:18,height:18,borderRadius:9,background:'#34C759',border:'2px solid var(--bg2)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:8,color:'#fff',fontWeight:800}}>✓</span></div>}
                </div>
                <div style={{fontSize:8,fontWeight:600,color:vis?'var(--label)':'var(--label3)',fontFamily:FT,marginTop:3,lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.name_ru}</div>
              </div>);
            })}
          </div>
          {expandedRegion && regions.find((r:any)=>r.id===expandedRegion) && (()=>{
            const r = regions.find((rr:any)=>rr.id===expandedRegion);
            return (
              <div className="fu" style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-md)',padding:'20px',marginBottom:16}}>
                <div style={{display:'flex',gap:14,alignItems:'center',marginBottom:14}}>
                  <div style={{width:48,height:48,borderRadius:24,border:'2px solid var(--sep)',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',padding:4}}>{r.coat_of_arms_url?<img src={r.coat_of_arms_url} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<span style={{fontSize:20}}>{r.flag_emoji||'🏛️'}</span>}</div>
                  <div style={{flex:1}}><div style={{fontSize:18,fontWeight:800,color:'var(--label)',fontFamily:FD}}>{r.name_ru}</div><div style={{fontSize:12,color:'var(--label2)',fontFamily:FT}}>{r.capital?r.capital+' · ':''}{r.federal_district}</div></div>
                  <div className="tap" onClick={()=>setExpandedRegion(null)} style={{width:28,height:28,borderRadius:14,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'var(--label3)'}}>✕</div>
                </div>
                {r.description_ru && <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{r.description_ru}</div>}
                {r.fun_fact_ru && <div style={{padding:'12px',borderRadius:14,background:'rgba(255,149,0,.06)',border:'.5px solid rgba(255,149,0,.12)',marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:'var(--orange)',fontFamily:FT,marginBottom:3}}>💡 Факт</div><div style={{fontSize:12,color:'var(--label2)',fontFamily:FT,lineHeight:1.5}}>{r.fun_fact_ru}</div></div>}
                <div className="tap" style={{padding:'12px',borderRadius:14,background:'var(--blue)',textAlign:'center'}}><span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>📷 Отсканировать QR · +30 баллов</span></div>
              </div>
            );
          })()}
          {filteredRegions.length>30 && <div style={{textAlign:'center',marginBottom:16}}><div className="tap" style={{display:'inline-block',padding:'10px 24px',borderRadius:14,background:'var(--fill4)'}}><span style={{fontSize:13,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Ещё {filteredRegions.length-30} регионов</span></div></div>}
        </div>
      ) : sec==='achievements' ? (
        <div style={{padding:'0 20px'}}>
          {(()=>{
            const tracks = [...new Set(achievements.map((a:any)=>a.track))];
            const TN:any = {countries:'Страны мира',regions:'Регионы России',visits:'Визиты',masterclasses:'Мастер-классы',gastronomy:'Гастрономия',banya:'Бани и СПА',social:'Социальные',purchases:'Покупки'};
            return tracks.map((t:string)=>(
              <div key={t} style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--label3)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,paddingLeft:4}}>{TN[t]||t}</div>
                <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden'}}>
                  {achievements.filter((a:any)=>a.track===t).map((a:any,i:number,arr:any[])=>(
                    <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<arr.length-1?'0.5px solid var(--sep)':'none'}}>
                      <div style={{width:40,height:40,borderRadius:13,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{a.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{a.name_ru}</div>
                        <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{a.description_ru}</div>
                      </div>
                      <div style={{flexShrink:0,display:'flex',alignItems:'center',gap:4}}>
                        <span style={{fontSize:13,fontWeight:600,color:'var(--label3)',fontFamily:FT}}>+{a.reward_points}</span>
                        <span style={{fontSize:11,color:'var(--label4)'}}>🔒</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      ) : (
        <div style={{padding:'0 20px'}}>
          {session && profile ? (
            <div>
              <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)',marginBottom:16}}>
                <div style={{padding:'20px 16px',display:'flex',gap:14,alignItems:'center'}}>
                  <div style={{width:56,height:56,borderRadius:28,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:20,color:'#fff',fontWeight:700,fontFamily:FT}}>{(profile.name||'').split(' ').map((w:string)=>w[0]).join('').slice(0,2)}</span>
                  </div>
                  <div style={{flex:1}}><div style={{fontSize:18,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{profile.name}</div><div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:2}}>{profile.email}</div></div>
                </div>
              </div>

              {/* Wallet */}
              <div style={{borderRadius:20,background:'linear-gradient(145deg,#0a1628,#162d50)',padding:20,marginBottom:16,position:'relative',overflow:'hidden'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
                  <div><div style={{fontSize:11,color:'rgba(255,255,255,.45)',fontFamily:FT,fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase'}}>Кошелёк</div><div style={{fontSize:28,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>{(profile.wallet_balance||0).toLocaleString('ru')} ₽</div></div>
                  <div style={{fontSize:28}}>💳</div>
                </div>
                <div style={{display:'flex',gap:10,marginTop:14}}>
                  <div className="tap" style={{flex:1,padding:'11px',borderRadius:14,background:'rgba(52,199,89,.15)',textAlign:'center'}}><span style={{fontSize:14,fontWeight:600,color:'#34C759',fontFamily:FT}}>Пополнить</span></div>
                  <div className="tap" style={{flex:1,padding:'11px',borderRadius:14,background:'rgba(0,122,255,.15)',textAlign:'center'}}><span style={{fontSize:14,fontWeight:600,color:'#5AC8FA',fontFamily:FT}}>История</span></div>
                </div>
              </div>

              {/* Menu items */}
              {[
                [{e:'📦',l:'Мои заказы',s:'Бронирования и билеты'},{e:'💰',l:'Баллы',s:'История начислений'},{e:'🤝',l:'Пригласить друга',s:'+100 баллов'}],
                [{e:'📞',l:'Поддержка',s:'+7 495 023-81-81'},{e:'⚙️',l:'Настройки',s:'Уведомления'},{e:'🌐',l:'ethnomir.ru',s:'Сайт парка'}]
              ].map((group,gi)=>(
                <div key={gi} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)',marginBottom:16}}>
                  {group.map((it,i)=>(
                    <div key={it.l} className="tap" style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<group.length-1?'0.5px solid var(--sep)':'none'}}>
                      <div style={{width:44,height:44,borderRadius:12,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{it.e}</div>
                      <div style={{flex:1}}><div style={{fontSize:16,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{it.l}</div><div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{it.s}</div></div>
                      <Chev/>
                    </div>
                  ))}
                </div>
              ))}
              <div className="tap" onClick={()=>onLogout()} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px',textAlign:'center',marginBottom:16}}>
                <span style={{fontSize:16,fontWeight:500,color:'#FF3B30',fontFamily:FT}}>Выйти</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)',padding:'24px 20px'}}>
                <div style={{textAlign:'center',marginBottom:20}}>
                  <div style={{width:64,height:64,borderRadius:32,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:28}}>🌍</div>
                  <div style={{fontSize:20,fontWeight:700,color:'var(--label)',fontFamily:FD}}>Войти в паспорт</div>
                  <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,marginTop:4}}>Сохраняй прогресс и копи баллы</div>
                </div>
                <div style={{borderRadius:12,background:'var(--bg)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',marginBottom:14}}>
                  <input value={loginEmail} onChange={(e:any)=>setLoginEmail(e.target.value)} placeholder="Email" style={{width:'100%',padding:'14px 16px',border:'none',background:'transparent',fontSize:16,fontFamily:FT,outline:'none',color:'var(--label)'}}/>
                  <div style={{height:'0.5px',background:'var(--sep)',marginLeft:16}}/>
                  <input value={loginPass} onChange={(e:any)=>setLoginPass(e.target.value)} type="password" placeholder="Пароль" style={{width:'100%',padding:'14px 16px',border:'none',background:'transparent',fontSize:16,fontFamily:FT,outline:'none',color:'var(--label)'}}/>
                </div>
                {loginError && <div style={{fontSize:13,color:'#FF3B30',fontFamily:FT,marginBottom:10,textAlign:'center'}}>{loginError}</div>}
                <div className="tap" onClick={async()=>{if(!loginEmail||!loginPass)return;setLoginLoading(true);setLoginError('');const r=await onLogin(loginEmail,loginPass);setLoginLoading(false);if(!r.ok)setLoginError(r.error);}}
                  style={{padding:'14px',borderRadius:14,background:'var(--blue)',textAlign:'center',opacity:loginLoading?.5:1}}>
                  <span style={{fontSize:16,fontWeight:600,color:'#fff',fontFamily:FT}}>{loginLoading?'Вход...':'Войти'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {sec==='cabinet' && (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.4px",marginBottom:16}}>Кабинет</div>
          
          {/* Profile card */}
          <div style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",padding:20,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:56,height:56,borderRadius:28,background:"linear-gradient(145deg,#1B3A2A,#2D5A3D)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:FT}}>ЭМ</span>
              </div>
              <div>
                <div style={{fontSize:17,fontWeight:600,color:"var(--label)",fontFamily:FT}}>{profile?.full_name||session?.user?.email||"Гость"}</div>
                <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginTop:2}}>{session?.user?.email||"Не авторизован"}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{borderRadius:16,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:16}}>
            {[{l:"Мои бронирования",v:"0",i:"🎫"},{l:"Мои баллы",v:(userPoints||0)+"",i:"⭐"},{l:"Избранное",v:"0",i:"♥️"},{l:"Мои отзывы",v:"0",i:"📝"}].map((r:any,j:number,a:any[])=>(
              <div key={j} className="tap" style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:j<a.length-1?"0.5px solid var(--sep)":"none"}}>
                <div style={{width:32,height:32,borderRadius:8,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16}}>{r.i}</span></div>
                <div style={{flex:1}}><span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{r.l}</span></div>
                <span style={{fontSize:15,fontWeight:600,color:"var(--label2)",fontFamily:FT}}>{r.v}</span>
                <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
              </div>
            ))}
          </div>

          {/* PRO banner */}
          <div className="tap" style={{borderRadius:16,background:"linear-gradient(135deg,#1a1a2e,#16213e)",padding:16,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>👑</span>
              <div>
                <div style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:FT}}>Этномир PRO</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:FT,marginTop:2}}>Эксклюзивные привилегии</div>
              </div>
              <div style={{marginLeft:"auto",padding:"5px 12px",borderRadius:20,background:"rgba(255,255,255,.15)"}}><span style={{fontSize:13,fontWeight:600,color:"#fff",fontFamily:FT}}>Скоро</span></div>
            </div>
          </div>

          {/* Logout */}
          {session && (
            <div className="tap" onClick={onLogout} style={{borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",padding:"13px 16px",textAlign:"center"}}>
              <span style={{fontSize:15,color:"#FF3B30",fontFamily:FT}}>Выйти из аккаунта</span>
            </div>
          )}
        </div>
      )}

      {/* ═══ ЕЩЁ — iOS Settings grouped ═══ */}
      <div style={{padding:"16px 20px 40px"}}>
        <div style={{fontSize:20,fontWeight:700,color:"var(--label)",fontFamily:FD,letterSpacing:"-.3px",marginBottom:16}}>Ещё</div>
        {/* ПАРТНЁРСТВО */}
        <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:16,marginBottom:6}}>Партнёрство</div>
        <div style={{borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:24}}>
          {[["💼","Бизнес с Этномир"],["🏢","Корпоративным клиентам"],["🎓","Школьникам и студентам"],["✈️","Турагентствам"]].map(([ic,lb]:any,j:number,a:any[])=>(
            <div key={j} className="tap" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:j<a.length-1?"0.5px solid var(--sep)":"none"}}>
              <div style={{width:30,height:30,borderRadius:7,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14}}>{ic}</span></div>
              <div style={{flex:1}}><span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{lb}</span></div>
              <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
            </div>
          ))}
        </div>
        {/* О ПАРКЕ */}
        <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:16,marginBottom:6}}>О парке</div>
        <div style={{borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:24}}>
          {[["💚","Благотворительность"],["ℹ️","Об Этномире"],["⭐","Отзывы"],["📰","Статьи"]].map(([ic,lb]:any,j:number,a:any[])=>(
            <div key={j} className="tap" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:j<a.length-1?"0.5px solid var(--sep)":"none"}}>
              <div style={{width:30,height:30,borderRadius:7,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14}}>{ic}</span></div>
              <div style={{flex:1}}><span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{lb}</span></div>
              <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
            </div>
          ))}
        </div>
        {/* ПОДДЕРЖКА */}
        <div style={{fontSize:12,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",paddingLeft:16,marginBottom:6}}>Поддержка</div>
        <div style={{borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden",marginBottom:24}}>
          {[["❓","Вопросы и ответы"],["📞","Контакты"],["📄","Документы"]].map(([ic,lb]:any,j:number,a:any[])=>(
            <div key={j} className="tap" onClick={()=>{if(lb==="Контакты")window.open("tel:+74950238181")}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:j<a.length-1?"0.5px solid var(--sep)":"none"}}>
              <div style={{width:30,height:30,borderRadius:7,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14}}>{ic}</span></div>
              <div style={{flex:1}}><span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>{lb}</span></div>
              <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
            </div>
          ))}
        </div>
        {/* НАСТРОЙКИ */}
        <div style={{borderRadius:12,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",overflow:"hidden"}}>
          <div className="tap" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px"}}>
            <div style={{width:30,height:30,borderRadius:7,background:"var(--fill4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14}}>⚙️</span></div>
            <div style={{flex:1}}><span style={{fontSize:15,color:"var(--label)",fontFamily:FT}}>Настройки</span></div>
            <span style={{fontSize:17,color:"var(--label4)"}}>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB BAR ──────────────────────────────────────────────
// SF Symbols-style monochrome icons: outline=inactive, filled=active
const TI = [
  ["home","Мир","M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z","M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"],
  ["tours","Парк","M3 6.5A2.5 2.5 0 015.5 4h3A2.5 2.5 0 0111 6.5v3A2.5 2.5 0 018.5 12h-3A2.5 2.5 0 013 9.5zM13 6.5A2.5 2.5 0 0115.5 4h3A2.5 2.5 0 0121 6.5v3a2.5 2.5 0 01-2.5 2.5h-3A2.5 2.5 0 0113 9.5zM3 16.5A2.5 2.5 0 015.5 14h3a2.5 2.5 0 012.5 2.5v3A2.5 2.5 0 018.5 22h-3A2.5 2.5 0 013 19.5zM13 16.5a2.5 2.5 0 012.5-2.5h3a2.5 2.5 0 012.5 2.5v3a2.5 2.5 0 01-2.5 2.5h-3a2.5 2.5 0 01-2.5-2.5z",""],
  ["stay","Жильё","M2 20V8l10-6 10 6v12","M8 14h8v6H8z"],
  ["services","Услуги","M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",""],
] as const;

function TabIcon({d,d2,active}:{d:string,d2:string,active:boolean}) {
  const col = active ? "#000" : "rgba(60,60,67,0.30)";
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path d={d} fill={active?"#000":"none"} stroke={active?"none":col} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
      {d2 && <path d={d2} fill={active?"#fff":"none"} stroke={active?"#fff":col} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  );
}

function TabBar({ active, onSelect }:{ active:Tab; onSelect:(t:Tab)=>void }) {
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",zIndex:100,pointerEvents:"none"}}>
      <div style={{
        pointerEvents:"all",display:"flex",alignItems:"center",
        height:84,width:"100%",maxWidth:390,
        paddingBottom:"env(safe-area-inset-bottom,0px)",
        background:"rgba(249,249,249,0.78)",
        backdropFilter:"blur(50px) saturate(180%)",
        WebkitBackdropFilter:"blur(50px) saturate(180%)",
        borderTop:"0.33px solid rgba(60,60,67,0.29)",
      }}>
        {TI.map(([id,label,d,d2])=>{
          const on = active===id;
          return (
            <div key={id} className="tap" onClick={()=>onSelect(id as Tab)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:8,paddingBottom:2,cursor:"pointer"}}>
              <TabIcon d={d} d2={d2} active={on}/>
              <span style={{fontSize:10,fontFamily:FT,fontWeight:on?600:400,color:on?"#000":"rgba(60,60,67,0.30)",marginTop:1,letterSpacing:"-.1px"}}>{label}</span>
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
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
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
            <div key={t.id} className={"fu s"+Math.min(i+1,6)} style={{borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-card)",marginBottom:14,overflow:"hidden"}}>
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
                    <div style={{fontSize:22,fontWeight:800,color:price===0?"#34C759":"var(--label)",fontFamily:FD}}>{price===0?"Бесплатно":price+" ₽"}</div>
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
              <div style={{fontSize:28,fontWeight:800,color:"var(--label)",fontFamily:FD}}>{total.toLocaleString("ru")} ₽</div>
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
function SearchModal({onClose}:{onClose:()=>void}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    ]).then(([h,t,r,s,m,e,c])=>{
      const all:any[] = [];
      (h||[]).forEach((x:any)=>all.push({...x,_type:"hotel",_emoji:"🏨",_label:x.name,_sub:x.type+" · "+x.price_from+" ₽/ночь"}));
      (t||[]).forEach((x:any)=>all.push({...x,_type:"tour",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.price+" ₽"}));
      (r||[]).forEach((x:any)=>all.push({...x,_type:"restaurant",_emoji:x.cover_emoji||"🍽️",_label:x.name_ru,_sub:"★ "+x.rating}));
      (s||[]).forEach((x:any)=>all.push({...x,_type:"service",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.category+(x.price_from?" · "+x.price_from+" ₽":"")}));
      (m||[]).forEach((x:any)=>all.push({...x,_type:"mk",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.price+" ₽ · "+x.location_ru}));
      (e||[]).forEach((x:any)=>all.push({...x,_type:"event",_emoji:x.cover_emoji,_label:x.name_ru,_sub:x.location_ru}));
      (c||[]).forEach((x:any)=>all.push({...x,_type:"country",_emoji:x.flag_emoji,_label:x.name_ru,_sub:x.region}));
      setResults(all);
      setLoading(false);
    });
  },[q]);

  const TYPE_LABEL:Record<string,string> = {hotel:"Отель",tour:"Тур",restaurant:"Ресторан",service:"Услуга",mk:"Мастер-класс",event:"Событие",country:"Страна"};
  const TYPE_COLOR:Record<string,string> = {hotel:"#003580",tour:"#2471A3",restaurant:"#FF9500",service:"#34C759",mk:"#AF52DE",event:"#FF3B30",country:"#007AFF"};

  return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,zIndex:200,background:"var(--bg)",display:"flex",flexDirection:"column"}}>
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
        {q.length<2 ? (
          /* Popular searches */
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--label3)",fontFamily:FT,textTransform:"uppercase",letterSpacing:".5px",marginBottom:12}}>Популярные запросы</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["Баня","СПА","Хаски","Юрта","Индия","Билеты","Ресторан","Мастер-класс","Динопарк","Лодки"].map(s=>(
                <div key={s} className="tap" onClick={()=>setQ(s)} style={{padding:"8px 14px",borderRadius:20,background:"var(--bg2)",border:"0.5px solid var(--sep-opaque)",boxShadow:"var(--shadow-sm)"}}>
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
            <div style={{fontSize:13,color:"var(--label3)",fontFamily:FT,marginBottom:12}}>Найдено <span style={{fontWeight:700,color:"var(--label)"}}>{results.length}</span> результатов</div>
            {results.map((r:any,i:number)=>(
              <div key={r._type+r.id+i} className="tap" style={{display:"flex",gap:14,padding:"12px 0",borderBottom:i<results.length-1?"0.5px solid var(--sep)":"none",alignItems:"center"}}>
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
export default function App() {
  useEffect(()=>{
    if(typeof document!=='undefined'){
      const m=document.createElement('meta');m.name='theme-color';m.content='#000000';document.head.appendChild(m);
      const m2=document.createElement('meta');m2.name='apple-mobile-web-app-capable';m2.content='yes';document.head.appendChild(m2);
      const m3=document.createElement('meta');m3.name='apple-mobile-web-app-status-bar-style';m3.content='black-translucent';document.head.appendChild(m3);
      const m4=document.createElement('meta');m4.name='viewport';m4.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';document.head.appendChild(m4);
      const m5=document.createElement('link');m5.rel='manifest';m5.href='data:application/json,'+encodeURIComponent(JSON.stringify({name:"Этномир",short_name:"Этномир",start_url:"/",display:"standalone",background_color:"#000000",theme_color:"#1B3A2A",icons:[{src:"https://fakeimg.pl/512x512/1B3A2A/ffffff?text=ЭМ&font_size=200",sizes:"512x512",type:"image/png"}]}));document.head.appendChild(m5);
    }
  },[]);
  const [tab, setTab] = useState<Tab>('home');
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
      <div className="eth" style={{width:'100%',maxWidth:390,height:'100dvh',margin:'0 auto',display:'flex',flexDirection:'column',background:'var(--bg)',overflow:'hidden',position:'relative'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {tab==='home'     && <HomeTab onBuyTicket={()=>setShowTickets(true)} onSearch={()=>setShowSearch(true)} onMap={()=>setShowMap(true)} onQR={()=>setShowQR(true)} onProfile={()=>setTab('passport')}/>}
          {tab==='tours'    && <ToursTab onSearch={()=>setShowSearch(true)} onBuyTicket={()=>setShowTickets(true)} onProfile={()=>setTab('passport')}/>}
          {tab==='stay'     && <StayTab onSearch={()=>setShowSearch(true)} favorites={favorites} toggleFav={toggleFav} onProfile={()=>setTab('passport')}/>}
          {tab==='services' && <ServicesTab onSearch={()=>setShowSearch(true)} onProfile={()=>setTab('passport')}/>}
          {tab==='passport' && <PassportTab session={session} onLogin={doLogin} onLogout={doLogout} onQR={()=>setShowQR(true)} onCountry={(c:any)=>setCountryDetail(c)} loyaltyLevels={loyaltyLevels} userPoints={userPoints}/>}
        </div>
        {showTickets && <TicketScreen onClose={()=>setShowTickets(false)}/>}
        {toast && <SuccessToast msg={toast} onClose={()=>setToast("")}/>}
        {showWelcome && <WelcomeScreen onDone={()=>{setShowWelcome(false);localStorage.setItem('em_welcomed','1');}}/>}
        {countryDetail && <CountryDetail country={countryDetail} onClose={()=>setCountryDetail(null)}/>}
        {showQR && <QRModal onClose={()=>setShowQR(false)} session={session}/>}
        {showMap && <MapModal onClose={()=>setShowMap(false)}/>}
        {showSearch && <SearchModal onClose={()=>setShowSearch(false)}/>}
        <TabBar active={tab} onSelect={setTab}/>
      </div>
    </>
  );
}
