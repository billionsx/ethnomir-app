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
  const [partner, setPartner] = useState<any[]>([]);
  const [expId, setExpId] = useState<string|null>(null);

  useEffect(()=>{
    setLoading(true);setExpId(null);
    if(sec==='banya') {
      sb('services','select=*&category=eq.banya&active=eq.true&order=sort_order.asc').then(d=>{setData(d||[]);setLoading(false);});
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
          {[['banya','🧖','Бани и СПА'],['food','🍽️','Рестораны'],['fun','🎡','Развлечения'],['rental','🚲','Прокат'],['other','🎯','Экскурсии'],['partner','💼','Партнёрство']].map(([id,ic,label])=>(
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

      {loading ? <Spinner/> : sec==='partner' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{borderRadius:20,background:'linear-gradient(145deg,#0d1b2a,#1a3a5c)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:64,opacity:.08}}>🤝</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontWeight:700,letterSpacing:1.5,fontFamily:FT,textTransform:'uppercase'}}>ETHNOMIR BUSINESS</div>
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
      ) : sec==='food' ? (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}><span style={{fontWeight:700,color:'var(--label)'}}>{data.length}</span> ресторанов и кафе</div>
          {data.map((r:any,i:number)=>{
            const hasMenu = restId===r.id && menu.length>0;
            return (
              <div key={r.id} className={`fu s${Math.min(i+1,6)}`}
                style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',overflow:'hidden',boxShadow:'var(--shadow-card)',marginBottom:14}}>
                <div className="tap" onClick={()=>loadMenu(r.id)} style={{padding:'16px',display:'flex',gap:14}}>
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
      ) : (
        <div style={{padding:'14px 20px'}}>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:14}}>
            <span style={{fontWeight:700,color:'var(--label)'}}>{data.length}</span> {sec==='banya'?'банных и СПА программ':sec==='fun'?'развлечений и аттракционов':sec==='rental'?'видов транспорта':'услуг'}
          </div>
          {data.map((s:any,i:number)=><ServiceCard key={s.id} s={s} i={i}/>)}
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
function PassportTab({ session, onLogin, onLogout }: any) {
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
    if(sec==='stamps') {
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
      <div style={{padding:'12px 20px 0'}}>
        <div className="tap" style={{borderRadius:16,background:'var(--blue)',padding:'14px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,122,255,.25)'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>📷 Сканировать QR-код у павильона</span>
        </div>
      </div>

      {/* ═══ TAB PILLS ═══ */}
      <div style={{display:'flex',gap:8,padding:'14px 20px',overflowX:'auto'}}>
        {[['stamps','🌍','Страны'],['regions','🇷🇺','Регионы'],['achievements','🏆','Достижения'],['profile','👤','Профиль']].map(([id,ic,label])=>(
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

      {loading ? <Spinner/> : sec==='stamps' ? (
        <div style={{padding:'0 20px'}}>
          {/* ═══ ROUND STAMPS GRID ═══ */}
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>Коллекция штампов</div>
          <div style={{fontSize:13,color:'var(--label2)',fontFamily:FT,marginBottom:16}}>Посети павильон → отсканируй QR → получи штамп и баллы</div>

          {/* Stamps grid - like a real passport page */}
          <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'flex-start',marginBottom:20}}>
            {countries.slice(0,24).map((c:any)=>(
              <div key={c.id} className="tap" onClick={()=>setExpandedCountry(expandedCountry===c.id?null:c.id)}>
                <Stamp flag={c.flag_emoji} name={c.name_ru} visited={visitedCountries.includes(c.id)} size={58}/>
              </div>
            ))}
          </div>

          {/* Expanded country detail */}
          {expandedCountry && countries.find((c:any)=>c.id===expandedCountry) && (()=>{
            const c = countries.find((cc:any)=>cc.id===expandedCountry);
            const vis = visitedCountries.includes(c.id);
            return (
              <div className="fu" style={{borderRadius:20,background:'var(--bg2)',border:'0.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-md)',padding:'20px',marginBottom:16}}>
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
          <div style={{fontSize:22,fontWeight:700,color:'var(--label)',fontFamily:FD,letterSpacing:'-.4px',marginBottom:14}}>Достижения</div>
          {achievements.map((a:any,i:number)=>{
            const c = ACH_COLORS[a.track]||'#888';
            return (
              <div key={a.id} className={`tap fu s${Math.min(i+1,6)}`} style={{display:'flex',gap:12,padding:'14px',borderRadius:18,background:'var(--bg2)',border:'.5px solid var(--sep-opaque)',boxShadow:'var(--shadow-sm)',alignItems:'center',marginBottom:10}}>
                <div style={{width:52,height:52,borderRadius:26,background:`${c}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{a.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                    <div style={{fontSize:14,fontWeight:700,color:'var(--label)',fontFamily:FT}}>{a.name_ru}</div>
                    <span style={{fontSize:9,padding:'1px 5px',background:`${c}18`,borderRadius:5,color:c,fontWeight:700,fontFamily:FT}}>Ур.{a.level}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--label3)',fontFamily:FT,marginBottom:4}}>{a.description_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:10,color:'#FFD60A',fontFamily:FT,fontWeight:600}}>+{a.reward_points} баллов</span>
                    <span style={{fontSize:10,color:'var(--label4)',fontFamily:FT}}>· {a.required_count} раз</span>
                  </div>
                </div>
                <div style={{width:28,height:28,borderRadius:14,background:'var(--fill4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:12}}>🔒</span>
                </div>
              </div>
            );
          })}
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
    </div>
  );
}

// ─── TAB BAR ──────────────────────────────────────────────
// SF Symbols-style monochrome icons: outline=inactive, filled=active
const TI = [
  ["home","Главная","M3 10.5L12 3l9 7.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V13h6v9"],
  ["tours","Туры","M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",""],
  ["stay","Жильё","M2 20V8l10-6 10 6v12","M8 14h8v6H8z"],
  ["services","Услуги","M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",""],
  ["passport","Паспорт","M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z","M12 10a3 3 0 100-6 3 3 0 000 6zM7 19c0-2.8 2.2-5 5-5s5 2.2 5 5"],
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
      <div className="eth" style={{width:'100%',maxWidth:390,height:'100dvh',margin:'0 auto',display:'flex',flexDirection:'column',background:'var(--bg)',overflow:'hidden',position:'relative'}}>
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
