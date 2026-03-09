'use client';
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

// ─── Supabase ────────────────────────────────────────────
const SB_URL = 'https://ewnoqkoojobyqqxpvzhj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';

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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  html,body{height:100%;overflow:hidden;margin:0;padding:0}
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
  @keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}
  .fu{animation:fu .42s cubic-bezier(0.2,0.8,0.2,1) both}
  .s1{animation-delay:.03s}.s2{animation-delay:.06s}.s3{animation-delay:.09s}
  .s4{animation-delay:.12s}.s5{animation-delay:.15s}.s6{animation-delay:.18s}
  .tap{cursor:pointer;transition:transform .22s cubic-bezier(0.34,1.56,0.64,1),opacity .15s}
  .tap:active{transform:scale(0.97);opacity:.88;transition:transform .1s cubic-bezier(0.2,0.8,0.2,1),opacity .08s}
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
  .ios-input{width:100%;height:50px;padding:0 16px;border-radius:var(--r-md);border:0.5px solid var(--sep-opaque);
    background:var(--bg);font-size:17px;color:var(--label);outline:none;
    font-family:"SF Pro Text",-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif;
    transition:border-color .2s,box-shadow .2s}
  .ios-input:focus{border-color:var(--blue);box-shadow:0 0 0 3.5px rgba(0,122,255,0.12)}
  .ios-input::placeholder{color:var(--label3)}
`;

// ─── Helpers ─────────────────────────────────────────────
function Spinner() {
  return <div style={{display:'flex',justifyContent:'center',padding:32}}>
    <div className="spin" style={{width:28,height:28,borderRadius:14,border:'2.5px solid var(--ef2)',borderTopColor:'var(--eblue)'}}/>
  </div>;
}
function Chev({ c='var(--el3)' }:any) {
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
            background:val===k?'var(--eb2)':'transparent',boxShadow:val===k?'0 1px 4px rgba(0,0,0,.15)':'none',transition:'all .2s'}}>
          <span style={{fontSize:11,fontWeight:val===k?700:400,color:val===k?'var(--el1)':'var(--el3)',fontFamily:FT}}>{l}</span>
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
function HomeTab() {
  const [slide, setSlide] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const t = setInterval(()=>setSlide(s=>(s+1)%HERO.length),4200);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    Promise.all([
      sb('services','select=cover_emoji,name_ru,status_text,category&is_open_now=eq.true&active=eq.true&limit=10'),
      sb('events','select=cover_emoji,name_ru,location_ru,starts_at,is_free&is_published=eq.true&order=starts_at.asc&limit=5'),
    ]).then(([sv,ev])=>{
      setServices(sv||[]);
      setEvents(ev||[]);
      setLoading(false);
    });
  },[]);

  const sl = HERO[slide];
  const dateStr = new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'});
  return (
    <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)'}}>
      {/* ═══ HEADER: App Store style ═══ */}
      <div style={{position:'sticky',top:0,zIndex:50,paddingTop:54,background:'rgba(242,242,247,0.72)',backdropFilter:'blur(40px) saturate(200%) brightness(1.08)',WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.08)',borderBottom:'0.5px solid rgba(60,60,67,0.12)'}}>
        <div style={{padding:'0 20px 14px'}}>
          <div style={{fontSize:11,color:'var(--label2)',fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.3px'}}>{dateStr}</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:2}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.6px',lineHeight:1.1}}>Этномир</div>
            <div className="tap" style={{width:38,height:38,borderRadius:19,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <span style={{fontSize:14,color:'#fff',fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FEATURED HERO: App Store card ═══ */}
      <div style={{padding:'16px 20px 0'}}>
        <div className="tap" style={{borderRadius:20,overflow:'hidden',position:'relative',height:380,background:sl.g,transition:'background .6s',boxShadow:'0 4px 20px rgba(0,0,0,0.10)'}}>
          <div style={{position:'absolute',right:-20,top:'40%',transform:'translateY(-50%)',fontSize:120,opacity:.12,transition:'all .5s'}}>{sl.emoji}</div>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 30%,rgba(0,0,0,.55) 100%)'}}/>
          <div style={{position:'absolute',top:18,left:18}}>
            <span style={{background:'rgba(255,255,255,.18)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',borderRadius:6,padding:'5px 12px',border:'0.5px solid rgba(255,255,255,.2)',fontSize:11,color:'#fff',fontWeight:700,fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase'}}>{sl.badge}</span>
          </div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 18px 18px'}}>
            <div style={{fontSize:26,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-0.5px',lineHeight:1.15,marginBottom:5}}>{sl.title}</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,.75)',fontFamily:FT,lineHeight:1.3}}>{sl.sub}</div>
            <div style={{display:'flex',gap:5,marginTop:14}}>
              {HERO.map((_,i)=><div key={i} style={{width:i===slide?20:6,height:6,borderRadius:3,background:i===slide?'#fff':'rgba(255,255,255,.35)',transition:'width .35s'}}/>)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ WEATHER: compact pill ═══ */}
      <div style={{padding:'14px 20px 0'}}>
        <div className="tap" style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'12px 16px',display:'flex',alignItems:'center',gap:12,boxShadow:'var(--shadow-sm)'}}>
          <span style={{fontSize:32}}>☀️</span>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:8,alignItems:'baseline'}}>
              <span style={{fontSize:24,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.5px'}}>+8°</span>
              <span style={{fontSize:13,color:'var(--label2)',fontFamily:FT}}>Калужская обл.</span>
            </div>
            <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginTop:1}}>Переменная обл. · Ветер 5 м/с · Открыто до 21:00</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>+6°/+11°</div>
          </div>
        </div>
      </div>

      {/* ═══ PASSPORT: grouped row like App Store list ═══ */}
      <div style={{padding:'14px 20px 0'}}>
        <div className="tap" style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',padding:'14px 16px',display:'flex',gap:14,alignItems:'center',boxShadow:'var(--shadow-sm)'}}>
          <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🌍</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Паспорт путешественника</div>
            <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:2}}>Сканируй QR у павильонов · Копи баллы</div>
          </div>
          <Chev/>
        </div>
      </div>

      {/* ═══ ОТКРЫТО СЕЙЧАС: App Store section ═══ */}
      <div style={{padding:'24px 20px 0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px'}}>Открыто сейчас</div>
          {!loading && <span style={{fontSize:13,color:'var(--blue)',fontFamily:FT,fontWeight:600}}>Все &rsaquo;</span>}
        </div>
        {loading ? <Spinner/> : (
          <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:4}}>
            {services.map((s:any,i:number)=>(
              <div key={i} className="tap" style={{flexShrink:0,width:80,textAlign:'center'}}>
                <div style={{width:80,height:80,borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep)',boxShadow:'var(--shadow-sm)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:8,position:'relative'}}>
                  {s.cover_emoji}
                  <div style={{position:'absolute',bottom:4,right:4,width:8,height:8,borderRadius:4,background:'#34C759',border:'2px solid var(--bg2)'}}/>
                </div>
                <div style={{fontSize:11,fontWeight:600,color:'var(--label)',fontFamily:FT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name_ru}</div>
                <div style={{fontSize:10,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{s.status_text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ СОБЫТИЯ: App Store section ═══ */}
      <div style={{padding:'24px 20px 0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px'}}>Ближайшие события</div>
          <span className="tap" style={{fontSize:13,color:'var(--blue)',fontFamily:FT,fontWeight:600}}>Все {events.length} &rsaquo;</span>
        </div>
        {loading ? <Spinner/> : (
          <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:4}}>
            {events.map((e:any,i:number)=>{
              const d = new Date(e.starts_at);
              const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
              const label = diff<=0?'Сегодня':diff===1?'Завтра':`Через ${diff} дн.`;
              return (
                <div key={i} className={`tap fu s${Math.min(i+1,6)}`} style={{flexShrink:0,width:170,padding:14,borderRadius:18,background:'var(--bg2)',border:'0.5px solid var(--sep)',boxShadow:'var(--shadow-sm)'}}>
                  <div style={{fontSize:32,marginBottom:10}}>{e.cover_emoji}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT,marginBottom:4,lineHeight:1.3}}>{e.name_ru}</div>
                  <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT,marginBottom:6}}>{e.location_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:11,color:'var(--blue)',fontWeight:600,fontFamily:FT}}>{label}</span>
                    {e.is_free && <Bdg label="Бесплатно" color="#34C759"/>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ БЫСТРЫЕ ДЕЙСТВИЯ ═══ */}
      <div style={{padding:'24px 20px 0'}}>
        <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>Быстрые действия</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {[{e:'📷',l:'Сканировать QR',c:'#007AFF',s:'Открыть страну'},
            {e:'🗺️',l:'Карта парка',c:'#34C759',s:'140 га · GPS'},
            {e:'📞',l:'Звонок',c:'#FF9500',s:'+7 495 023-81-81'},
            {e:'💳',l:'Купить билет',c:'#AF52DE',s:'Онлайн · От 990 ₽'}].map(a=>(
            <div key={a.l} className="tap" style={{padding:16,borderRadius:18,background:'var(--bg2)',border:'0.5px solid var(--sep)',boxShadow:'var(--shadow-sm)'}}>
              <div style={{width:44,height:44,borderRadius:12,background:a.c+'14',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:10}}>{a.e}</div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--label)',fontFamily:FT,marginBottom:2}}>{a.l}</div>
              <div style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>{a.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PROMO ═══ */}
      <div style={{padding:'24px 20px 20px'}}>
        <div className="tap" style={{borderRadius:20,background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:20,position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.12)'}}>
          <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:64,opacity:.14}}>🏗️</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginBottom:6,fontWeight:700,letterSpacing:1,fontFamily:FT,textTransform:'uppercase'}}>ETHNOMIR DEVELOPMENT</div>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,marginBottom:5,letterSpacing:'-.3px'}}>Живи в Этномире</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT,marginBottom:16,lineHeight:1.4}}>Апартаменты от 5.4 млн ₽ · ROI до 22%/год</div>
            <div style={{display:'flex',gap:20,marginBottom:16}}>
              {[['ROI','до 22%'],['Заезд','2026'],['Площадь','от 36м²']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:18,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,.14)',borderRadius:12,padding:'8px 18px',border:'0.5px solid rgba(255,255,255,.2)'}}>
              <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Узнать подробнее →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TOURS ────────────────────────────────────────────────
function ToursTab() {
  const [sec, setSec] = useState('tours');
  const [tours, setTours] = useState<any[]>([]);
  const [mk, setMk] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [exp, setExp] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    if(sec==='tours') {
      sb('tours','select=*&is_available=eq.true&order=price.asc')
        .then(d=>{setTours(d||[]);setLoading(false);});
    } else if(sec==='mk') {
      sb('masterclasses','select=id,name_ru,country_id,category,duration_min,price,max_persons,min_age,cover_emoji,location_ru,is_available&is_available=eq.true&order=sort_order.asc&limit=40')
        .then(d=>{setMk(d||[]);setLoading(false);});
    } else {
      sb('events','select=*&is_published=eq.true&order=starts_at.asc')
        .then(d=>{setEvents(d||[]);setLoading(false);});
    }
  },[sec]);

  const TC: Record<string,string> = {
    flagship:'#C0392B', excursion:'#2471A3', tour_weekend:'#7D3C98',
    thematic:'#1E8449', camp:'#8B4513'
  };

  return (
    <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)'}}>
      {/* === HEADER === */}
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(242,242,247,0.72)',backdropFilter:'blur(40px) saturate(200%) brightness(1.08)',WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.08)',borderBottom:'0.5px solid rgba(60,60,67,0.12)'}}>
        <div style={{padding:'54px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.6px'}}>Туры</div>
            <div className="tap" style={{width:38,height:38,borderRadius:19,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <span style={{fontSize:14,color:'#fff',fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
        {/* Pill filters - Apple App Store style */}
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px',overflowX:'auto'}}>
          {[['tours','🌟','Туры'],['mk','🎓','Мастер-классы'],['events','🎉','События']].map(([id,ic,label])=>(
            <div key={id} className="tap" onClick={()=>setSec(id)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:20,flexShrink:0,
                background:sec===id?'var(--label)':'var(--bg2)',
                border:'0.5px solid '+(sec===id?'var(--label)':'var(--sep-opaque)'),
                boxShadow:sec===id?'none':'var(--shadow-sm)'}}>
              <span style={{fontSize:14}}>{ic}</span>
              <span style={{fontSize:14,fontWeight:600,color:sec===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? <Spinner/> : sec==='tours' ? (
        <div style={{padding:'14px 20px'}}>
          {/* Featured tour */}
          {tours[0] && (
            <div className="tap fu" style={{borderRadius:20,background:`linear-gradient(145deg,${TC[tours[0].type]||'#555'}dd,${TC[tours[0].type]||'#555'}88)`,padding:0,marginBottom:20,position:'relative',overflow:'hidden',height:220,boxShadow:'0 4px 20px rgba(0,0,0,.10)'}}>
              <div style={{position:'absolute',right:-10,top:'40%',transform:'translateY(-50%)',fontSize:96,opacity:.15}}>{tours[0].cover_emoji}</div>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 20%,rgba(0,0,0,.45) 100%)'}}/>
              <div style={{position:'absolute',top:16,left:16}}>
                <span style={{background:'rgba(255,255,255,.18)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',borderRadius:6,padding:'4px 10px',fontSize:10,color:'#fff',fontWeight:700,fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase'}}>{tours[0].type?.toUpperCase()}</span>
              </div>
              <div style={{position:'absolute',bottom:0,left:0,right:0,padding:18}}>
                <div style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>{tours[0].name_ru}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT}}>{tours[0].description_ru?.slice(0,60)}…</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12}}>
                  <span style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:FD}}>{tours[0].price.toLocaleString('ru')} ₽</span>
                  <div style={{background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',borderRadius:14,padding:'8px 18px',border:'0.5px solid rgba(255,255,255,.25)'}}>
                    <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Забронировать</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Все туры */}
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>Все туры &rsaquo;</div>

          {/* Grouped list - Apple style */}
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
            {tours.map((t:any,i:number)=>{
              const h = Math.floor(t.duration_minutes/60);
              const dur = h>=24?`${Math.floor(h/24)} дн.`:h>0?`${h} ч.`:`${t.duration_minutes} мин.`;
              return (
                <div key={t.id} className="tap" onClick={()=>setExp(exp===t.id?null:t.id)}
                  style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<tours.length-1?'0.5px solid var(--sep)':'none'}}>
                  <div style={{width:60,height:60,borderRadius:16,background:`${TC[t.type]||'#555'}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0}}>{t.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{t.name_ru}</div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:2}}>{dur} · до {t.max_participants} чел. · ★ {t.rating}</div>
                    {exp===t.id && <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:6,lineHeight:1.4}}>{t.description_ru}</div>}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:'var(--blue)',fontFamily:FT}}>{t.price.toLocaleString('ru')} ₽</div>
                    <div style={{marginTop:6,padding:'6px 16px',borderRadius:16,background:'rgba(0,122,255,.08)'}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--blue)',fontFamily:FT}}>Купить</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : sec==='mk' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>Мастер-классы &rsaquo;</div>
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
            {mk.map((m:any,i:number)=>(
              <div key={m.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<mk.length-1?'0.5px solid var(--sep)':'none'}}>
                <div style={{width:60,height:60,borderRadius:16,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0}}>{m.cover_emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{m.name_ru}</div>
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:2}}>{m.location_ru} · {m.duration_min} мин.</div>
                  <div style={{display:'flex',gap:6,alignItems:'center',marginTop:3}}>
                    <div style={{width:6,height:6,borderRadius:3,background:m.is_available?'#34C759':'var(--label4)'}}/>
                    <span style={{fontSize:11,color:m.is_available?'#34C759':'var(--label3)',fontFamily:FT,fontWeight:600}}>
                      {m.is_available?`до ${m.max_persons} чел.`:'Недоступен'}
                    </span>
                    {m.min_age>0 && <span style={{fontSize:11,color:'var(--label3)',fontFamily:FT}}>· от {m.min_age} лет</span>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--blue)',fontFamily:FT}}>{m.price.toLocaleString('ru')} ₽</div>
                  <div style={{marginTop:6,padding:'6px 16px',borderRadius:16,background:'rgba(0,122,255,.08)'}}>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--blue)',fontFamily:FT}}>Записаться</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>События &rsaquo;</div>
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
            {events.map((e:any,i:number)=>{
              const d = new Date(e.starts_at);
              const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
              const label = diff<=0?'Сегодня':diff===1?'Завтра':`Через ${diff} дн.`;
              return (
                <div key={e.id} className={`tap fu s${Math.min(i+1,6)}`}
                  style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<events.length-1?'0.5px solid var(--sep)':'none'}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0}}>{e.cover_emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{e.name_ru}</div>
                    <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:2}}>{e.location_ru}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                      <span style={{fontSize:12,color:'var(--blue)',fontWeight:600,fontFamily:FT}}>{label}</span>
                      {e.is_free ? <Bdg label="Бесплатно" color="#34C759"/> : e.price>0 ? <Bdg label={`${e.price.toLocaleString('ru')} ₽`} color="var(--orange)"/> : null}
                    </div>
                  </div>
                  <Chev/>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STAY ─────────────────────────────────────────────────
function StayTab() {
  const [view, setView] = useState('hotels');
  const [hotels, setHotels] = useState<any[]>([]);
  const [re, setRe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  useEffect(()=>{
    setLoading(true);
    if(view==='hotels') {
      sb('hotels','select=*&active=eq.true&order=rating.desc')
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
          {[['hotels','🏨','Забронировать'],['re','🏗️','Купить недвижимость']].map(([id,ic,label])=>(
            <div key={id} className="tap" onClick={()=>setView(id)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:20,flexShrink:0,
                background:view===id?'var(--label)':'var(--bg2)',
                border:'0.5px solid '+(view===id?'var(--label)':'var(--sep-opaque)'),
                boxShadow:view===id?'none':'var(--shadow-sm)'}}>
              <span style={{fontSize:14}}>{ic}</span>
              <span style={{fontSize:14,fontWeight:600,color:view===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? <Spinner/> : view==='hotels' ? (
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
                    <span style={{fontSize:13,color:'var(--blue)',fontFamily:FT,fontWeight:500}}>ЭТНОМИР · Калужская обл.</span>
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
                    <div className="tap" style={{padding:'13px 24px',borderRadius:14,background:'#003580',boxShadow:'0 2px 8px rgba(0,53,128,.3)'}}>
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
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>ETHNOMIR DEVELOPMENT</div>
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
function ServicesTab() {
  const [sec, setSec] = useState('banya');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any[]>([]);
  const [restId, setRestId] = useState<string|null>(null);

  useEffect(()=>{
    setLoading(true);
    if(sec==='food') {
      sb('restaurants','select=*&active=eq.true&order=rating.desc')
        .then(d=>{setData(d||[]);setLoading(false);});
    } else if(sec==='banya') {
      sb('services','select=*&category=eq.banya&active=eq.true')
        .then(d=>{setData(d||[]);setLoading(false);});
    } else {
      sb('services','select=*&category=in.(attractions,excursion,rental,kids,photo,transport)&active=eq.true&order=category.asc')
        .then(d=>{setData(d||[]);setLoading(false);});
    }
  },[sec]);

  const loadMenu = useCallback((id:string)=>{
    if(restId===id){setRestId(null);setMenu([]);return;}
    setRestId(id);
    sb('menu_items',`select=*&restaurant_id=eq.${id}&is_available=eq.true&order=sort_order.asc`)
      .then(d=>setMenu(d||[]));
  },[restId]);

  return (
    <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',paddingBottom:100,background:'var(--bg)'}}>
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(242,242,247,0.72)',backdropFilter:'blur(40px) saturate(200%) brightness(1.08)',WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.08)',borderBottom:'0.5px solid rgba(60,60,67,0.12)'}}>
        <div style={{padding:'54px 20px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.6px'}}>Сервисы</div>
            <div className="tap" style={{width:38,height:38,borderRadius:19,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>
              <span style={{fontSize:14,color:'#fff',fontWeight:700,fontFamily:FT}}>ЭМ</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,padding:'12px 20px 14px',overflowX:'auto'}}>
          {[['banya','🧖','Бани и СПА'],['food','🍽️','Еда'],['other','🎠','Развлечения']].map(([id,ic,label])=>(
            <div key={id} className="tap" onClick={()=>setSec(id)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:20,flexShrink:0,
                background:sec===id?'var(--label)':'var(--bg2)',
                border:'0.5px solid '+(sec===id?'var(--label)':'var(--sep-opaque)'),
                boxShadow:sec===id?'none':'var(--shadow-sm)'}}>
              <span style={{fontSize:14}}>{ic}</span>
              <span style={{fontSize:14,fontWeight:600,color:sec===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? <Spinner/> : sec==='food' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>Рестораны &rsaquo;</div>
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
            {data.map((r:any,i:number)=>(
              <div key={r.id}>
                <div className="tap" onClick={()=>loadMenu(r.id)}
                  style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:(i<data.length-1&&restId!==r.id)?'0.5px solid var(--sep)':'none'}}>
                  <div style={{width:60,height:60,borderRadius:16,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{r.cover_emoji||'🍽️'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{r.name_ru}</div>
                    <div style={{display:'flex',alignItems:'center',gap:4,marginTop:2}}>
                      <span style={{fontSize:12,color:'#FFD60A'}}>★</span>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{r.rating}</span>
                      <span style={{fontSize:12,color:'var(--label3)',fontFamily:FT}}>· {r.cuisine_type}</span>
                    </div>
                  </div>
                  <Chev/>
                </div>
                {restId===r.id && menu.length>0 && (
                  <div style={{padding:'0 16px 12px',borderBottom:i<data.length-1?'0.5px solid var(--sep)':'none'}}>
                    {menu.map((m:any)=>(
                      <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'0.5px solid var(--fill3)'}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{m.cover_emoji} {m.name_ru}</div>
                          <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{m.weight_g}г · {m.calories}ккал</div>
                        </div>
                        <span style={{fontSize:14,fontWeight:700,color:'var(--blue)',fontFamily:FT}}>{m.price} ₽</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>{sec==='banya'?'Бани и СПА':'Развлечения'} &rsaquo;</div>
          <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
            {data.map((s:any,i:number)=>(
              <div key={s.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<data.length-1?'0.5px solid var(--sep)':'none'}}>
                <div style={{width:60,height:60,borderRadius:16,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{s.cover_emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{s.name_ru}</div>
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:2}}>{s.status_text||s.location_ru||s.category}</div>
                  <div style={{display:'flex',gap:6,alignItems:'center',marginTop:3}}>
                    <div style={{width:6,height:6,borderRadius:3,background:s.is_open_now?'#34C759':'var(--label4)'}}/>
                    <span style={{fontSize:11,color:s.is_open_now?'#34C759':'var(--label3)',fontFamily:FT,fontWeight:600}}>
                      {s.is_open_now?'Открыто':'Закрыто'}
                    </span>
                  </div>
                </div>
                {s.price_from>0 && (
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:'var(--blue)',fontFamily:FT}}>{s.price_from?.toLocaleString('ru')} ₽</div>
                    <div style={{marginTop:4,padding:'6px 16px',borderRadius:16,background:'rgba(0,122,255,.08)'}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--blue)',fontFamily:FT}}>Запись</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PASSPORT ─────────────────────────────────────────────
function PassportTab({ session, onLogin, onLogout }: any) {
  const [sec, setSec] = useState('stamps');
  const [countries, setCountries] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFd, setRegionFd] = useState('');
  const [expandedRegion, setExpandedRegion] = useState<string|null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [visitedRegions, setVisitedRegions] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTx, setWalletTx] = useState<any[]>([]);

  // Fetch user data when session exists
  useEffect(() => {
    if (!session?.access_token) { setProfile(null); setVisitedCountries([]); setVisitedRegions([]); return; }
    const t = session.access_token;
    Promise.all([
      sbAuthGet(t, 'profiles?select=*&id=eq.' + session.user?.id),
      sbAuthGet(t, 'passport_stamps?select=country_id,region_id&user_id=eq.' + session.user?.id),
    ]).then(([prof, stamps]) => {
      if (prof?.[0]) { setProfile(prof[0]); setWalletBalance(prof[0].wallet_balance || 0); }
      const cIds = (stamps||[]).filter((s:any)=>s.country_id).map((s:any)=>s.country_id);
      const rIds = (stamps||[]).filter((s:any)=>s.region_id).map((s:any)=>s.region_id);
      setVisitedCountries([...new Set(cIds)]);
      setVisitedRegions([...new Set(rIds)]);
      // Load wallet transactions
      sbAuthGet(t, 'wallet_transactions?select=*&user_id=eq.' + session.user?.id + '&order=created_at.desc&limit=10').then(tx => setWalletTx(tx || []));
    });
  }, [session]);
  const [expandedCountry, setExpandedCountry] = useState<string|null>(null);

  useEffect(()=>{
    setLoading(true);
    if(sec==='stamps') {
      sb('countries','select=*&active=eq.true&order=sort_order.asc')
        .then(d=>{setCountries(d||[]);setLoading(false);});
    } else if(sec==='achievements') {
      sb('achievements','select=*&order=track.asc,level.asc')
        .then(d=>{setAchievements(d||[]);setLoading(false);});
    } else {
      sb('regions_rf','select=*&active=eq.true&order=sort_order.asc')
        .then(d=>{setRegions(d||[]);setLoading(false);});
    }
  },[sec]);

  const filteredRegions = regionFd
    ? regions.filter(r=>r.federal_district===regionFd)
    : regions;

  const FDS = [...new Set(regions.map(r=>r.federal_district).filter(Boolean))];

  const ACH_COLORS: Record<string,string> = {
    countries:'#007AFF',gastronomy:'#FF9500',masterclasses:'#AF52DE',
    banya:'#C0392B',visits:'#34C759',regions:'#E91E63',social:'#5856D6',purchases:'#FFD60A'
  };

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(242,242,247,0.72)',backdropFilter:'blur(40px) saturate(200%) brightness(1.08)',WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.08)',borderBottom:'0.5px solid rgba(60,60,67,0.12)'}}><div style={{padding:'54px 20px 14px'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{fontSize:34,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-0.6px'}}>Паспорт</div><div className="tap" style={{width:38,height:38,borderRadius:19,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}><span style={{fontSize:14,color:'#fff',fontWeight:700,fontFamily:FT}}>ЭМ</span></div></div></div></div>
      <div style={{padding:'14px 20px 0'}}>
        {/* Passport card */}
        <div style={{borderRadius:20,background:'linear-gradient(160deg,#0A1A10 0%,#142A1A 30%,#1D3D25 60%,#2A5433 100%)',boxShadow:'0 4px 20px rgba(0,0,0,0.15)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-10,top:-10,fontSize:80,opacity:.08}}>🌍</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
                <div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:FD,marginTop:4,letterSpacing:-0.4}}>{session ? (profile?.name || 'Загрузка...') : 'Гражданин Мира'}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.55)',fontFamily:FT,marginTop:3}}>{session ? (profile ? `Уровень: ${({'newcomer':'Новичок','tourist':'Турист','traveler':'Путешественник','explorer':'Исследователь','ambassador':'Посол Мира','citizen':'Гражданин','legend':'Легенда'}[profile.citizenship_level] || 'Новичок')} · ${profile.streak_days || 0} дн. серия` : 'Загрузка...') : 'Войди для синхронизации'}</div>
              </div>
              <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🌐</div>
            </div>
            <div style={{display:'flex',gap:24,marginBottom:14}}>
              {[['Стран',String(visitedCountries.length),'#7DEFA1'],['Баллов',profile?String(profile.points):'0','#FFD60A'],['Уровень',profile?String(Math.floor((profile.points||0)/1000)+1):'1','#5E9CFF']].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:22,fontWeight:800,color:c,fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{height:5,background:'rgba(255,255,255,.1)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.round(visitedCountries.length/96*100)}%`,background:'linear-gradient(90deg,#30D158,#7DEFA1)',transition:'width .6s cubic-bezier(0.2,0.8,0.2,1)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:6}}>{visitedCountries.length} из 96 стран · {visitedRegions.length} из 85 регионов России</div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:8,padding:'12px 20px',overflowX:'auto'}}>
        {[['stamps','🌍','Страны'],['regions','🇷🇺','Регионы'],['achievements','🏆','Достижения'],['profile','👤','Профиль']].map(([id,ic,label])=>(
          <div key={id} className="tap" onClick={()=>setSec(id)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:20,flexShrink:0,
              background:sec===id?'var(--label)':'var(--bg2)',
              border:'0.5px solid '+(sec===id?'var(--label)':'var(--sep-opaque)'),
              boxShadow:sec===id?'none':'var(--shadow-sm)'}}>{ic && <span style={{fontSize:14}}>{ic}</span>}
            <span style={{fontSize:14,fontWeight:600,color:sec===id?'#fff':'var(--label)',fontFamily:FT}}>{label}</span>
          </div>
        ))}
      </div>

      {loading ? <Spinner/> : sec==='stamps' ? (
        <div style={{padding:'0 20px'}}>
          {/* Achievement progress */}
          <div className='ios-card fu' style={{marginBottom:14,borderRadius:'var(--r-card)',background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:'16px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:-10,fontSize:64,opacity:.08}}>🌍</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
              <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>${visitedCountries.length} / 96 стран</div>
              <div style={{display:'flex',gap:12,marginTop:10}}>
                {[['Первые шаги','1','#7DEFA1'],['Путник','5','#5E9CFF'],['Картограф','10','#FFD60A'],['Исследователь','20','#FF9500'],['Посол Мира','96','#FF6B9D']].map(([l,n,c]:any)=>(
                  <div key={l} style={{flex:1,textAlign:'center',padding:'6px 2px',borderRadius:10,background:'rgba(255,255,255,.08)'}}>
                    <div style={{fontSize:12,fontWeight:800,color:c,fontFamily:FD}}>{n}</div>
                    <div style={{fontSize:7,color:'rgba(255,255,255,.45)',fontFamily:FT}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,marginTop:10,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.max(2,Math.round(visitedCountries.length/96*100))}%`,background:'linear-gradient(90deg,#007AFF,#5E9CFF)',transition:'width .6s',borderRadius:2}}/>
              </div>
            </div>
          </div>

          {/* Country cards */}
          {countries.map((c:any,i:number)=>{
            const isOpen = expandedCountry === c.id;
            return (
            <div key={c.id} className={`fu s${Math.min((i%6)+1,6)}`}
              style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',marginBottom:10,boxShadow:'var(--shadow-sm)',overflow:'hidden'}}>
              <div className="tap" onClick={()=>setExpandedCountry(isOpen?null:c.id)}
                style={{display:'flex',gap:14,padding:'14px',alignItems:'center'}}>
                <div style={{width:48,height:48,borderRadius:14,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0,opacity:.7,filter:'grayscale(40%)'}}>
                  {c.flag_emoji}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{c.name_ru}</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT}}>{c.capital ? c.capital + ' · ' : ''}{c.region}</div>
                </div>
                <div style={{transform:isOpen?'rotate(90deg)':'rotate(0)',transition:'transform .2s'}}><Chev/></div>
              </div>

              {isOpen && (
                <div style={{padding:'0 14px 16px'}}>
                  {/* Stamp */}
                  <div style={{padding:'14px',borderRadius:16,background:'rgba(0,122,255,.04)',border:'.5px solid rgba(0,122,255,.12)',marginBottom:12,textAlign:'center'}}>
                    <div style={{fontSize:32,marginBottom:4}}>🔒</div>
                    <div style={{fontSize:13,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>Страна закрыта</div>
                    <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginTop:2}}>Посети павильон и отсканируй QR-код</div>
                    <div className="tap" style={{display:'inline-block',marginTop:10,padding:'8px 20px',borderRadius:12,background:'var(--eblue)'}}>
                      <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>📷 Сканировать QR</span>
                    </div>
                    <div style={{fontSize:10,color:'var(--eblue)',fontFamily:FT,marginTop:6}}>+50 баллов за открытие</div>
                  </div>

                  {/* Description */}
                  {c.description_ru && (
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:4}}>О стране</div>
                      <div style={{fontSize:12,color:'var(--el2)',fontFamily:FT,lineHeight:1.5}}>{c.description_ru}</div>
                    </div>
                  )}

                  {/* Fun fact */}
                  {c.fun_fact_ru && (
                    <div style={{padding:'12px',borderRadius:14,background:'rgba(255,149,0,.06)',border:'.5px solid rgba(255,149,0,.15)',marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--eor)',fontFamily:FT,marginBottom:3}}>💡 Интересный факт</div>
                      <div style={{fontSize:11,color:'var(--el2)',fontFamily:FT,lineHeight:1.5}}>{c.fun_fact_ru}</div>
                    </div>
                  )}

                  {/* Stats */}
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    {c.capital && <div style={{flex:1,padding:'10px 8px',borderRadius:14,background:'rgba(118,118,128,0.12)',textAlign:'center'}}>
                      <div style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>Столица</div>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginTop:2}}>{c.capital}</div>
                    </div>}
                    {c.population>0 && <div style={{flex:1,padding:'10px 8px',borderRadius:12,background:'var(--ef3)',textAlign:'center'}}>
                      <div style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>Население</div>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginTop:2}}>{(c.population/1000000).toFixed(0)} млн</div>
                    </div>}
                    {c.area_km2>0 && <div style={{flex:1,padding:'10px 8px',borderRadius:12,background:'var(--ef3)',textAlign:'center'}}>
                      <div style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>Площадь</div>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginTop:2}}>{(c.area_km2/1000).toFixed(0)} тыс км²</div>
                    </div>}
                  </div>

                  {/* Achievement track */}
                  <div style={{padding:'12px',borderRadius:14,background:'rgba(0,122,255,.06)',border:'.5px solid rgba(0,122,255,.15)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--eblue)',fontFamily:FT,marginBottom:6}}>🌍 Трек «Гражданин Мира»</div>
                    <div style={{display:'flex',gap:6}}>
                      {[{n:'1',l:'Первые',p:50},{n:'5',l:'Путник',p:150},{n:'10',l:'Картограф',p:300},{n:'20',l:'Исслед.',p:600},{n:'96',l:'Посол',p:2000}].map((a:any)=>(
                        <div key={a.n} style={{flex:1,textAlign:'center',padding:'6px 2px',borderRadius:8,background:'rgba(0,122,255,.08)'}}>
                          <div style={{fontSize:11,fontWeight:800,color:'var(--eblue)',fontFamily:FD}}>{a.n}</div>
                          <div style={{fontSize:7.5,color:'var(--el3)',fontFamily:FT,lineHeight:1.2}}>{a.l}</div>
                          <div style={{fontSize:8,color:'var(--eblue)',fontFamily:FT,marginTop:1}}>+{a.p}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );})}
        </div>
      ) : sec==='regions' ? (
        <div style={{padding:'0 20px'}}>
          {/* Achievement progress banner */}
          <div style={{marginBottom:14,borderRadius:18,background:'linear-gradient(135deg,#1a2a1a,#2d4a2d)',padding:'16px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:-10,fontSize:64,opacity:.08}}>🇷🇺</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ПАСПОРТ «МОЯ РОССИЯ»</div>
              <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>0 / 85 регионов</div>
              <div style={{display:'flex',gap:12,marginTop:10}}>
                {[['Моя Россия','1','#7DEFA1'],['Краевед','10','#5E9CFF'],['По всей России','50','#FFD60A'],['Гражданин','85','#FF6B9D']].map(([l,n,c]:any)=>(
                  <div key={l} style={{flex:1,textAlign:'center',padding:'6px 4px',borderRadius:10,background:'rgba(255,255,255,.08)'}}>
                    <div style={{fontSize:13,fontWeight:800,color:c,fontFamily:FD}}>{n}</div>
                    <div style={{fontSize:8,color:'rgba(255,255,255,.45)',fontFamily:FT}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,marginTop:10,overflow:'hidden'}}>
                <div style={{height:'100%',width:'0%',background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:2}}/>
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div style={{marginBottom:12}}>
            <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
              <div className="tap" onClick={()=>setRegionFd('')}
                style={{flexShrink:0,padding:'5px 12px',borderRadius:10,background:regionFd===''?'var(--eblue)':'var(--ef2)',border:'.5px solid var(--es2)'}}>
                <span style={{fontSize:11,fontWeight:600,color:regionFd===''?'#fff':'var(--el2)',fontFamily:FT}}>Все 85</span>
              </div>
              {FDS.map((fd:string)=>(
                <div key={fd} className="tap" onClick={()=>setRegionFd(fd)}
                  style={{flexShrink:0,padding:'5px 12px',borderRadius:10,background:regionFd===fd?'var(--eblue)':'var(--ef2)',border:'.5px solid var(--es2)'}}>
                  <span style={{fontSize:10,fontWeight:600,color:regionFd===fd?'#fff':'var(--el2)',fontFamily:FT}}>{fd}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Region cards */}
          {filteredRegions.map((r:any,i:number)=>{
            const isOpen = expandedRegion === r.id;
            const isVisited = false; /* Will be dynamic when auth is ready */
            return (
            <div key={r.id} className={`fu s${Math.min((i%6)+1,6)}`}
              style={{borderRadius:20,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:10,overflow:'hidden'}}>
              {/* Header row - always visible */}
              <div className="tap" onClick={()=>setExpandedRegion(isOpen?null:r.id)}
                style={{display:'flex',gap:14,padding:'14px',alignItems:'center'}}>
                <div style={{width:56,height:56,borderRadius:14,background:'#fff',border:'1px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',padding:4,opacity:visitedRegions.includes(r.id)?1:.7,filter:visitedRegions.includes(r.id)?'none':'grayscale(40%)'}}>
                  {r.coat_of_arms_url ? (
                    <img src={r.coat_of_arms_url} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}} />
                  ) : (
                    <span style={{fontSize:24}}>{r.flag_emoji}</span>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                    <div style={{fontSize:14,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{r.name_ru}</div>
                    {visitedRegions.includes(r.id) && <span style={{fontSize:10,padding:'1px 6px',background:'#34C75918',borderRadius:5,color:'var(--egreen)',fontWeight:700,fontFamily:FT}}>✓</span>}
                  </div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{r.capital ? r.capital + ' · ' : ''}{r.federal_district}</div>
                  {r.population>0 && <div style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>{(r.population/1000000).toFixed(1)} млн чел. · {(r.area_km2/1000).toFixed(0)} тыс. км²</div>}
                </div>
                <div style={{transform:isOpen?'rotate(90deg)':'rotate(0)',transition:'transform .2s'}}><Chev/></div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{padding:'0 14px 16px'}}>
                  {/* Stamp area */}
                  <div style={{padding:'14px',borderRadius:16,background:isVisited?'rgba(52,199,89,.06)':'rgba(0,122,255,.04)',border:isVisited?'.5px solid rgba(52,199,89,.2)':'.5px solid rgba(0,122,255,.12)',marginBottom:12,textAlign:'center'}}>
                    {visitedRegions.includes(r.id) ? (
                      <>
                        <div style={{fontSize:32,marginBottom:4}}>🎫</div>
                        <div style={{fontSize:13,fontWeight:700,color:'var(--egreen)',fontFamily:FT}}>Посещён!</div>
                        <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginTop:2}}>Штамп: 15 марта 2026 · +30 баллов</div>
                      </>
                    ) : (
                      <>
                        <div style={{fontSize:32,marginBottom:4}}>🔒</div>
                        <div style={{fontSize:13,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>Регион закрыт</div>
                        <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginTop:2}}>Посети павильон и отсканируй QR-код</div>
                        <div className="tap" style={{display:'inline-block',marginTop:10,padding:'8px 20px',borderRadius:12,background:'var(--eblue)'}}>
                          <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>📷 Сканировать QR</span>
                        </div>
                        <div style={{fontSize:10,color:'var(--eblue)',fontFamily:FT,marginTop:6}}>+30 баллов за открытие</div>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  {r.description_ru && (
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:4}}>О регионе</div>
                      <div style={{fontSize:12,color:'var(--el2)',fontFamily:FT,lineHeight:1.5}}>{r.description_ru}</div>
                    </div>
                  )}

                  {/* Fun fact */}
                  {r.fun_fact_ru && (
                    <div style={{padding:'12px',borderRadius:14,background:'rgba(255,149,0,.06)',border:'.5px solid rgba(255,149,0,.15)',marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--eor)',fontFamily:FT,marginBottom:3}}>💡 Интересный факт</div>
                      <div style={{fontSize:11,color:'var(--el2)',fontFamily:FT,lineHeight:1.5}}>{r.fun_fact_ru}</div>
                    </div>
                  )}

                  {/* Stats grid */}
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    {r.capital && <div style={{flex:1,padding:'10px 8px',borderRadius:12,background:'var(--ef3)',textAlign:'center'}}>
                      <div style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>Столица</div>
                      <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginTop:2}}>{r.capital}</div>
                    </div>}
                    {r.population>0 && <div style={{flex:1,padding:'10px 8px',borderRadius:12,background:'var(--ef3)',textAlign:'center'}}>
                      <div style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>Население</div>
                      <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginTop:2}}>{(r.population/1000000).toFixed(1)} млн</div>
                    </div>}
                    {r.area_km2>0 && <div style={{flex:1,padding:'10px 8px',borderRadius:12,background:'var(--ef3)',textAlign:'center'}}>
                      <div style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>Площадь</div>
                      <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginTop:2}}>{(r.area_km2/1000).toFixed(0)} тыс км²</div>
                    </div>}
                  </div>

                  {/* Achievement progress */}
                  <div style={{padding:'12px',borderRadius:14,background:'rgba(175,82,222,.06)',border:'.5px solid rgba(175,82,222,.15)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--epu)',fontFamily:FT,marginBottom:6}}>🏆 Трек «Моя Россия»</div>
                    <div style={{display:'flex',gap:6}}>
                      {[{n:'1',l:'Моя Россия',p:50},{n:'10',l:'Краевед',p:200},{n:'50',l:'По всей РФ',p:1000},{n:'85',l:'Гражданин',p:3000}].map((a:any)=>(
                        <div key={a.n} style={{flex:1,textAlign:'center',padding:'6px 2px',borderRadius:8,background:'rgba(175,82,222,.08)'}}>
                          <div style={{fontSize:11,fontWeight:800,color:'var(--epu)',fontFamily:FD}}>{a.n}</div>
                          <div style={{fontSize:7.5,color:'var(--el3)',fontFamily:FT,lineHeight:1.2}}>{a.l}</div>
                          <div style={{fontSize:8,color:'var(--epu)',fontFamily:FT,marginTop:1}}>+{a.p}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );})}
        </div>
      ) : sec==='achievements' ? (
        <div style={{padding:'0 20px'}}>
          {achievements.map((a:any,i:number)=>{
            const c = ACH_COLORS[a.track]||'#888';
            return (
              <div key={a.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{display:'flex',gap:12,padding:'14px',borderRadius:18,background:'var(--ef2)',border:`.5px solid var(--es2)`,alignItems:'center',marginBottom:10}}>
                <div style={{width:52,height:52,borderRadius:14,background:`${c}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{a.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                    <div style={{fontSize:14,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{a.name_ru}</div>
                    <span style={{fontSize:9,padding:'1px 5px',background:`${c}18`,borderRadius:5,color:c,fontWeight:700,fontFamily:FT}}>Ур.{a.level}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:4}}>{a.description_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:10,color:'#FFD60A',fontFamily:FT,fontWeight:600}}>+{a.reward_points} баллов</span>
                    <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>· {a.required_count} {a.required_count>=1000?'₽':'раз'}</span>
                  </div>
                </div>
                <div style={{width:28,height:28,borderRadius:14,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x=".5" y="3" width="7" height="6" rx="1.5" stroke="var(--el3)" strokeWidth="1.2"/><path d="M1.5 3V2.5a2.5 2.5 0 015 0V3" stroke="var(--el3)" strokeWidth="1.2"/></svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{padding:'0 20px'}}>
          {session && profile ? (
            <div>
              {/* APPLE ACCOUNT CARD */}
              <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)',marginBottom:16}}>
                <div style={{padding:'20px 16px',display:'flex',gap:14,alignItems:'center'}}>
                  <div style={{width:56,height:56,borderRadius:28,background:'linear-gradient(145deg,#1B3A2A,#2D5A3D)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:20,color:'#fff',fontWeight:700,fontFamily:FT}}>{(profile.name||'').split(' ').map((w:string)=>w[0]).join('').slice(0,2)}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:18,fontWeight:600,color:'var(--label)',fontFamily:FT}}>{profile.name}</div>
                    <div style={{fontSize:14,color:'var(--label2)',fontFamily:FT,marginTop:2}}>{profile.email}</div>
                    <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{profile.phone||''}</div>
                  </div>
                </div>
                <div style={{borderTop:'0.5px solid var(--sep)',padding:'12px 16px',display:'flex',gap:8,flexWrap:'wrap'}}>
                  <div style={{padding:'5px 12px',borderRadius:14,background:'rgba(52,199,89,.1)'}}><span style={{fontSize:12,fontWeight:600,color:'#34C759',fontFamily:FT}}>{profile.points?.toLocaleString('ru')} баллов</span></div>
                  {profile.is_partner && <div style={{padding:'5px 12px',borderRadius:14,background:'rgba(175,82,222,.1)'}}><span style={{fontSize:12,fontWeight:600,color:'#AF52DE',fontFamily:FT}}>Партнёр</span></div>}
                </div>
              </div>

              {/* WALLET CARD */}
              <div style={{borderRadius:20,background:'linear-gradient(145deg,#0a1628,#162d50,#0a1628)',padding:20,marginBottom:16,position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.12)'}}>
                <div style={{position:'absolute',top:0,right:0,width:120,height:120,background:'radial-gradient(circle,rgba(125,239,161,.08),transparent)',borderRadius:'50%'}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,position:'relative'}}>
                  <div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.45)',fontFamily:FT,fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase'}}>КОШЕЛЁК ЭТНОМИР</div>
                    <div style={{fontSize:32,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:6,letterSpacing:'-0.5px'}}>{(profile.wallet_balance||0).toLocaleString('ru')} ₽</div>
                  </div>
                  <div style={{width:40,height:40,borderRadius:20,background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🌐</div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <div className="tap" style={{flex:1,padding:'11px',borderRadius:14,background:'rgba(52,199,89,.15)',textAlign:'center'}}><span style={{fontSize:14,fontWeight:600,color:'#34C759',fontFamily:FT}}>Пополнить</span></div>
                  <div className="tap" style={{flex:1,padding:'11px',borderRadius:14,background:'rgba(0,122,255,.15)',textAlign:'center'}}><span style={{fontSize:14,fontWeight:600,color:'#5AC8FA',fontFamily:FT}}>История</span></div>
                </div>
              </div>

              
              {/* TRANSACTIONS - Apple Wallet style */}
              {walletTx.length > 0 && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:12}}>Последние транзакции</div>
                  <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
                    {walletTx.map((tx:any,i:number)=>{
                      const isIncome = tx.amount > 0;
                      const icon = tx.type==='topup'?'💳':tx.type==='cashback'?'🎁':tx.type==='refund'?'↩️':'🛒';
                      return (
                        <div key={tx.id||i} className="tap" style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<walletTx.length-1?'0.5px solid var(--sep)':'none'}}>
                          <div style={{width:44,height:44,borderRadius:12,background:isIncome?'rgba(52,199,89,.1)':'rgba(255,59,48,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{icon}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:16,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{tx.description}</div>
                            <div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:2}}>{new Date(tx.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}</div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontSize:16,fontWeight:600,color:isIncome?'#34C759':'var(--label)',fontFamily:FT}}>{isIncome?'+':''}{tx.amount.toLocaleString('ru')} ₽</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBSCRIPTION */}
              <div className="tap" style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)',marginBottom:16,padding:'14px 16px',display:'flex',gap:14,alignItems:'center'}}>
                <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#FFD700,#FFA500)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>💎</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:600,color:'var(--label)',fontFamily:FT}}>Подписка «Посол Мира»</div>
                  <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginTop:2}}>990 ₽/мес · 30 дней бесплатно</div>
                </div>
                <Chev/>
              </div>

              {/* GROUP 1 */}
              <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)',marginBottom:16}}>
                {[{e:'📦',l:'Мои заказы',s:'Бронирования и билеты'},{e:'💰',l:'Баллы лояльности',s:'История начислений'},{e:'🤝',l:'Пригласить друга',s:'+100 баллов за каждого'}].map((it,i,a)=>(
                  <div key={it.l} className="tap" style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<a.length-1?'0.5px solid var(--sep)':'none'}}>
                    <div style={{width:44,height:44,borderRadius:12,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{it.e}</div>
                    <div style={{flex:1}}><div style={{fontSize:16,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{it.l}</div><div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{it.s}</div></div>
                    <Chev/>
                  </div>
                ))}
              </div>

              {/* GROUP 2 */}
              <div style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-sm)',marginBottom:16}}>
                {[{e:'📞',l:'Поддержка',s:'+7 495 023-81-81'},{e:'⚙️',l:'Настройки',s:'Уведомления · Язык'},{e:'🌐',l:'ethnomir.ru',s:'Официальный сайт'}].map((it,i,a)=>(
                  <div key={it.l} className="tap" style={{padding:'14px 16px',display:'flex',gap:14,alignItems:'center',borderBottom:i<a.length-1?'0.5px solid var(--sep)':'none'}}>
                    <div style={{width:44,height:44,borderRadius:12,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{it.e}</div>
                    <div style={{flex:1}}><div style={{fontSize:16,fontWeight:500,color:'var(--label)',fontFamily:FT}}>{it.l}</div><div style={{fontSize:13,color:'var(--label3)',fontFamily:FT,marginTop:1}}>{it.s}</div></div>
                    <Chev/>
                  </div>
                ))}
              </div>

              {/* LOGOUT */}
              <div className="tap" onClick={()=>onLogout()} style={{borderRadius:16,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)',marginBottom:16,padding:'14px 16px',textAlign:'center'}}>
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
                <div className="tap" onClick={async()=>{ if(!loginEmail||!loginPass)return; setLoginLoading(true); setLoginError(''); const r = await onLogin(loginEmail,loginPass); setLoginLoading(false); if(!r.ok) setLoginError(r.error); }}
                  style={{padding:'14px',borderRadius:14,background:'var(--blue)',textAlign:'center',opacity:loginLoading?.5:1}}>
                  <span style={{fontSize:16,fontWeight:600,color:'#fff',fontFamily:FT}}>{loginLoading ? 'Вход...' : 'Войти'}</span>
                </div>
                <div style={{display:'flex',gap:10,marginTop:14}}>
                  {['Apple','Google','VK'].map(p=>(
                    <div key={p} className="tap" style={{flex:1,padding:'11px',borderRadius:12,background:'var(--fill4)',textAlign:'center'}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--label2)',fontFamily:FT}}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TAB BAR ──────────────────────────────────────────────
const TABS = [
  {id:'home' as Tab, label:'Главная', ic:(a:boolean)=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?'#000':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill={a?'#fff':'none'} stroke={a?'#fff':'var(--el3)'}/></svg>},
  {id:'tours' as Tab, label:'Туры', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>},
  {id:'stay' as Tab, label:'Жильё', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10" fill={a?'#fff':'none'} stroke={a?'#fff':'var(--el3)'} strokeWidth="1.8"/></svg>},
  {id:'services' as Tab, label:'Сервисы', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/></svg>},
  {id:'passport' as Tab, label:'Паспорт', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><circle cx="12" cy="11" r="3" fill="none" stroke={a?'#fff':'var(--el3)'} strokeWidth="1.5"/><path d="M6 20v-1a6 6 0 0112 0v1" fill="none" stroke={a?'#fff':'var(--el3)'} strokeWidth="1.5"/></svg>},
];

function TabBar({ active, onSelect }:{ active:Tab; onSelect:(t:Tab)=>void }) {
  return (
    <div style={{position:'fixed',bottom:20,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100,pointerEvents:'none'}}>
      <div className="glass-p" style={{pointerEvents:'all',display:'flex',alignItems:'center',padding:'0 8px',height:64,borderRadius:36}}>
        {TABS.map(tab=>{
          const on = active===tab.id;
          return (
            <div key={tab.id} className="tap" onClick={()=>onSelect(tab.id)}
              style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 14px 8px',position:'relative'}}>
              {on && <div style={{position:'absolute',inset:'5px 6px',borderRadius:14,background:'rgba(0,0,0,.07)'}}/>}
              <div style={{position:'relative',zIndex:1}}>{tab.ic(on)}</div>
              <span style={{fontSize:10,fontFamily:FT,fontWeight:on?600:400,color:on?'var(--el1)':'var(--el3)',marginTop:3,letterSpacing:'-.1px',position:'relative',zIndex:1}}>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sb_session') : null;
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s?.access_token) { setSession(s); }
      } catch {}
    }
    setAuthLoading(false);
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
      <div className="eth" style={{width:'100%',maxWidth:390,height:'100dvh',margin:'0 auto',display:'flex',flexDirection:'column',background:'var(--eb)',overflow:'hidden',position:'relative'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {tab==='home'     && <HomeTab/>}
          {tab==='tours'    && <ToursTab/>}
          {tab==='stay'     && <StayTab/>}
          {tab==='services' && <ServicesTab/>}
          {tab==='passport' && <PassportTab session={session} onLogin={doLogin} onLogout={doLogout}/>}
        </div>
        <TabBar active={tab} onSelect={setTab}/>
      </div>
    </>
  );
}
