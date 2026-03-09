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
const FD = '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif';
const FT = '"SF Pro Text",-apple-system,BlinkMacSystemFont,sans-serif';

type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
  html,body{height:100%;overflow:hidden;margin:0;padding:0}
  .eth{--eb:#F2F2F7;--eb2:#fff;--ef2:rgba(120,120,128,.13);--ef3:rgba(120,120,128,.08);
    --el1:#000;--el2:rgba(60,60,67,.65);--el3:rgba(60,60,67,.4);--el4:rgba(60,60,67,.2);
    --es2:rgba(60,60,67,.14);--eblue:#007AFF;--egreen:#34C759;--ered:#FF3B30;
    --eor:#FF9500;--epu:#AF52DE;--epk:#FF2D55;color-scheme:light}
  .eth *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;min-height:0}
  .eth ::-webkit-scrollbar{display:none}
  @keyframes fu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fu{animation:fu .38s cubic-bezier(.25,.46,.45,.94) both}
  .s1{animation-delay:.04s}.s2{animation-delay:.08s}.s3{animation-delay:.12s}
  .s4{animation-delay:.16s}.s5{animation-delay:.20s}.s6{animation-delay:.24s}
  .tap{cursor:pointer;transition:transform .18s cubic-bezier(.34,1.5,.64,1),opacity .12s}
  .tap:active{transform:scale(.93);opacity:.7;transition:transform .06s,opacity .06s}
  .glass-p{backdrop-filter:blur(60px) saturate(220%) brightness(1.08);
    -webkit-backdrop-filter:blur(60px) saturate(220%) brightness(1.08);
    background:rgba(255,255,255,.72);border:.5px solid rgba(0,0,0,.08);
    box-shadow:inset 0 1.5px 0 rgba(255,255,255,.9),0 8px 40px rgba(0,0,0,.16)}
  .live::before{content:'';width:6px;height:6px;border-radius:50%;background:#ff3b30;
    display:inline-block;margin-right:4px;animation:pulse .8s ease-in-out infinite}
  .spin{animation:spin .8s linear infinite}
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
    <div style={{display:'flex',background:'var(--ef2)',borderRadius:12,padding:3,gap:2,margin:'0 16px 16px'}}>
      {items.map(([k,l]:any)=>(
        <div key={k} className="tap" onClick={()=>set(k)}
          style={{flex:1,textAlign:'center',padding:'7px 0',borderRadius:9,cursor:'pointer',
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
  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Header */}
      <div style={{position:'sticky',top:0,zIndex:50,padding:'52px 20px 14px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:12,color:'var(--el3)',fontFamily:FT}}>Добрый день 👋</div>
            <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px',lineHeight:1.1,marginTop:1}}>ЭТНОМИР</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {['🔍','🔔'].map((ic,i)=>(
              <div key={i} className="tap" style={{width:38,height:38,borderRadius:19,background:'var(--ef2)',border:'.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                <span style={{fontSize:16}}>{ic}</span>
                {i===1 && <div style={{position:'absolute',top:8,right:8,width:8,height:8,borderRadius:4,background:'#ff3b30',border:'1.5px solid var(--eb)'}}/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className="tap" style={{margin:'0 16px 14px',background:'var(--ef2)',borderRadius:18,padding:'12px 16px',border:'.5px solid var(--es2)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:28}}>🌤</span>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:8,alignItems:'baseline'}}>
              <span style={{fontSize:22,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.5px'}}>+8°</span>
              <span style={{fontSize:12,color:'var(--el3)',fontFamily:FT}}>Калужская обл. · Этномир</span>
            </div>
            <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginTop:1}}>Переменная облачность · Ветер 5 м/с · Открыто до 21:00</div>
          </div>
          <div style={{textAlign:'right'}}><div style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>Сегодня</div><div style={{fontSize:11,color:'var(--el2)',fontFamily:FT}}>+6°/+11°</div></div>
        </div>
      </div>

      {/* Hero */}
      <div style={{padding:'0 16px 14px'}}>
        <div className="tap" style={{borderRadius:24,overflow:'hidden',position:'relative',height:180,background:sl.g,transition:'background .6s'}}>
          <div style={{position:'absolute',right:-16,top:'50%',transform:'translateY(-50%)',fontSize:96,opacity:.18,transition:'all .5s'}}>{sl.emoji}</div>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(140deg,rgba(0,0,0,.38),transparent 65%)'}}/>
          <div style={{position:'absolute',top:14,left:16}}>
            <span style={{background:'rgba(255,255,255,.22)',backdropFilter:'blur(8px)',borderRadius:8,padding:'3px 10px',border:'.5px solid rgba(255,255,255,.3)',fontSize:10,color:'#fff',fontWeight:700,fontFamily:FT}}>{sl.badge}</span>
          </div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:16}}>
            <div style={{fontSize:19,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:3}}>{sl.title}</div>
            <div style={{fontSize:11.5,color:'rgba(255,255,255,.78)',fontFamily:FT}}>{sl.sub}</div>
          </div>
          <div style={{position:'absolute',bottom:14,right:16,display:'flex',gap:5}}>
            {HERO.map((_,i)=><div key={i} style={{width:i===slide?18:5,height:5,borderRadius:3,background:i===slide?'#fff':'rgba(255,255,255,.38)',transition:'width .35s'}}/>)}
          </div>
        </div>
      </div>

      {/* Passport widget */}
      <div style={{padding:'0 16px 16px'}}>
        <div className="tap fu s1" style={{borderRadius:20,background:'linear-gradient(160deg,rgba(27,67,50,.13),rgba(27,67,50,.05))',border:'.5px solid rgba(27,67,50,.25)',padding:'14px 16px',display:'flex',gap:14,alignItems:'center'}}>
          <div style={{width:48,height:48,borderRadius:14,background:'rgba(27,67,50,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🌍</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>Паспорт путешественника</span>
              <span style={{fontSize:12,fontWeight:700,color:'var(--egreen)'}}>0 / 96</span>
            </div>
            <div style={{height:5,background:'rgba(0,0,0,.08)',borderRadius:3,overflow:'hidden',marginBottom:4}}>
              <div style={{height:'100%',width:'0%',background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT}}>Сканируй QR у павильонов · 0 баллов</div>
          </div>
          <Chev/>
        </div>
      </div>

      {/* Open now */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px'}}>Открыто сейчас</div>
            {!loading && <div style={{fontSize:11,color:'var(--egreen)',fontFamily:FT,marginTop:1}}><span className="live"/>{services.length} мест · Живой статус</div>}
          </div>
        </div>
        {loading ? <Spinner/> : (
          <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:2}}>
            {services.map((s:any,i:number)=>(
              <div key={i} className="tap" style={{flexShrink:0,width:90}}>
                <div style={{width:90,height:74,borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,marginBottom:6,position:'relative'}}>
                  {s.cover_emoji}
                  <div style={{position:'absolute',bottom:5,right:5,width:7,height:7,borderRadius:4,background:'var(--egreen)',border:'1.5px solid var(--eb)'}}/>
                </div>
                <div style={{fontSize:10.5,fontWeight:600,color:'var(--el1)',fontFamily:FT,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name_ru}</div>
                <div style={{fontSize:9.5,color:'var(--el3)',fontFamily:FT,textAlign:'center'}}>{s.status_text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px'}}>Ближайшие события</div>
          <div className="tap" style={{padding:'5px 10px',background:'rgba(0,122,255,.1)',borderRadius:8}}><span style={{fontSize:11,color:'var(--eblue)',fontFamily:FT,fontWeight:600}}>Все 12</span></div>
        </div>
        {loading ? <Spinner/> : (
          <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
            {events.map((e:any,i:number)=>{
              const d = new Date(e.starts_at);
              const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
              const label = diff<=0?'Сегодня!':diff===1?'Завтра':`Через ${diff} дн.`;
              return (
                <div key={i} className={`tap fu s${Math.min(i+1,6)}`} style={{flexShrink:0,width:158,padding:'12px',borderRadius:18,background:'var(--ef2)',border:'.5px solid var(--es2)'}}>
                  <div style={{fontSize:28,marginBottom:8}}>{e.cover_emoji}</div>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:4,lineHeight:1.3}}>{e.name_ru}</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{e.location_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                    <span style={{fontSize:10,color:'var(--eblue)',fontWeight:600,fontFamily:FT}}>{label}</span>
                    {e.is_free && <Bdg label="Бесплатно" color="var(--egreen)"/>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px',marginBottom:12}}>Быстрые действия</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[{e:'📷',l:'Сканировать QR',c:'#007AFF',s:'Открыть страну'},
            {e:'🗺️',l:'Карта парка',c:'#34C759',s:'140 га · GPS'},
            {e:'📞',l:'Звонок',c:'#FF9500',s:'+7 495 023-81-81'},
            {e:'💳',l:'Купить билет',c:'#AF52DE',s:'Онлайн · От 990 ₽'}].map(a=>(
            <div key={a.l} className="tap" style={{padding:'14px',borderRadius:18,background:`${a.c}10`,border:`.5px solid ${a.c}25`}}>
              <div style={{fontSize:26,marginBottom:6}}>{a.e}</div>
              <div style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:1}}>{a.l}</div>
              <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>{a.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dev promo */}
      <div style={{padding:'0 16px 16px'}}>
        <div className="tap" style={{borderRadius:20,background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:'18px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:64,opacity:.14}}>🏗️</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginBottom:4,fontWeight:700,letterSpacing:1,fontFamily:FT}}>ETHNOMIR DEVELOPMENT</div>
            <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD,marginBottom:4}}>Живи в Этномире</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:12}}>Апартаменты от 5.4 млн ₽ · ROI до 22%/год</div>
            <div style={{display:'flex',gap:18,marginBottom:12}}>
              {[['ROI','до 22%'],['Заезд','2026'],['Площадь','от 36м²']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,.14)',borderRadius:10,padding:'6px 14px',border:'.5px solid rgba(255,255,255,.2)'}}>
              <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>Узнать подробнее →</span>
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

  const TOUR_COLORS: Record<string,string> = {
    flagship:'#C0392B', excursion:'#2471A3', tour_weekend:'#7D3C98',
    thematic:'#1E8449', camp:'#8B4513'
  };

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Туры</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>{tours.length || ''} турпакетов · {mk.length||'41'} МК · 12 событий</div>
      </div>
      <Seg items={[['tours','🎫 Туры'],['mk','🎓 Мастер-классы'],['events','🎉 События']]} val={sec} set={setSec}/>

      {loading ? <Spinner/> : sec==='tours' ? (
        <div style={{padding:'0 16px'}}>
          {tours.map((t:any,i:number)=>{
            const color = TOUR_COLORS[t.type]||'#555';
            const h = Math.floor(t.duration_minutes/60);
            const dur = h>=24?`${Math.floor(h/24)} дн.`:h>0?`${h} ч.`:`${t.duration_minutes} мин.`;
            return (
              <div key={t.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{borderRadius:22,background:`linear-gradient(135deg,${color}dd,${color}88)`,padding:'20px',marginBottom:14,position:'relative',overflow:'hidden'}}
                onClick={()=>setExp(exp===t.id?null:t.id)}>
                <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:72,opacity:.18}}>{t.cover_emoji}</div>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.6)',fontWeight:700,marginBottom:6,fontFamily:FT,letterSpacing:.8}}>{t.type?.toUpperCase()}</div>
                  <div style={{fontSize:19,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>{t.name_ru}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.72)',fontFamily:FT,marginBottom:14,lineHeight:1.4}}>{t.description_ru?.slice(0,80)}…</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontSize:24,fontWeight:800,color:'#fff',fontFamily:FD}}>{t.price.toLocaleString('ru')} ₽</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.55)',fontFamily:FT}}>/ {dur} · до {t.max_participants} чел.</div>
                    </div>
                    <div style={{background:'rgba(255,255,255,.22)',borderRadius:14,padding:'9px 18px',border:'.5px solid rgba(255,255,255,.28)'}}>
                      <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Забронировать</span>
                    </div>
                  </div>
                  {exp===t.id && (
                    <div style={{marginTop:14,paddingTop:14,borderTop:'.5px solid rgba(255,255,255,.22)'}}>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.9)',fontFamily:FT,lineHeight:1.5}}>{t.description_ru}</div>
                      <div style={{marginTop:10,display:'flex',gap:12}}>
                        {[['⭐','Рейтинг',t.rating],['👥','Участников',t.max_participants],['🕐','Длительность',dur]].map(([ic,l,v])=>(
                          <div key={l as string} style={{flex:1,background:'rgba(255,255,255,.12)',borderRadius:10,padding:'8px',textAlign:'center'}}>
                            <div style={{fontSize:16}}>{ic}</div>
                            <div style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>{v as string}</div>
                            <div style={{fontSize:9,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : sec==='mk' ? (
        <div style={{padding:'0 16px'}}>
          {mk.map((m:any,i:number)=>(
            <div key={m.id} className={`tap fu s${Math.min(i+1,6)}`}
              style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',alignItems:'center',marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:16,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{m.cover_emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{m.name_ru}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:3}}>{m.location_ru} · {m.duration_min} мин.</div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <div style={{width:5,height:5,borderRadius:3,background:m.is_available?'var(--egreen)':'var(--el4)'}}/>
                  <span style={{fontSize:10,color:m.is_available?'var(--egreen)':'var(--el3)',fontFamily:FT,fontWeight:600}}>
                    {m.is_available?`до ${m.max_persons} чел.`:'Недоступен'}
                  </span>
                  {m.min_age>0 && <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>· от {m.min_age} лет</span>}
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:15,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>{m.price.toLocaleString('ru')} ₽</div>
                <div style={{marginTop:5,padding:'4px 10px',borderRadius:8,background:'rgba(0,122,255,.1)'}}>
                  <span style={{fontSize:11,fontWeight:600,color:'var(--eblue)',fontFamily:FT}}>Записаться</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{padding:'0 16px'}}>
          {events.map((e:any,i:number)=>{
            const d = new Date(e.starts_at);
            const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
            const label = diff<=0?'Идёт сейчас!':diff===1?'Завтра':`Через ${diff} дн.`;
            const color = e.is_free?'var(--egreen)':'var(--eor)';
            return (
              <div key={e.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{display:'flex',gap:12,padding:'14px',borderRadius:18,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:10}}>
                <div style={{width:56,height:56,borderRadius:16,background:`rgba(120,120,128,.1)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{e.cover_emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:3}}>{e.name_ru}</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:5}}>{e.location_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:11,color:color,fontWeight:700,fontFamily:FT}}>{label}</span>
                    {e.is_free ? <Bdg label="Бесплатно" color="var(--egreen)"/> : e.price>0 ? <Bdg label={`от ${e.price.toLocaleString('ru')} ₽`} color="var(--eor)"/> : null}
                  </div>
                </div>
              </div>
            );
          })}
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

  const HOTEL_COLORS: Record<string,string> = {
    spa:'#1E8449',glamping:'#5D4037',apart:'#2471A3',cottage:'#7D3C98',ethno:'#C0392B'
  };
  const HOTEL_EMOJIS: Record<string,string> = {
    srilanka:'🌴',india:'🕌',nepal:'🏔️',himalayan:'🏢',sibiriya:'⛺',russian:'🏡',
    belarus:'🌲',ukraine:'🌻',sea:'🏝️',caravanserai:'🕌'
  };

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Жильё</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>10 этноотелей · Глэмпинг · Апартаменты</div>
      </div>
      <Seg items={[['hotels','🏨 Снять'],['re','🏗️ Купить']]} val={view} set={setView}/>

      {loading ? <Spinner/> : view==='hotels' ? (
        <div style={{padding:'0 16px'}}>
          {hotels.map((h:any,i:number)=>{
            const color = HOTEL_COLORS[h.type]||'#555';
            const emoji = HOTEL_EMOJIS[h.slug]||'🏠';
            const ams: string[] = h.amenities||[];
            return (
              <div key={h.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{borderRadius:22,background:`linear-gradient(135deg,${color}18,${color}05)`,border:`.5px solid ${color}30`,padding:'16px',marginBottom:12}}>
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <div style={{width:62,height:62,borderRadius:18,background:`${color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{h.name}</div>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                      <span style={{fontSize:11,color:'#FFD60A'}}>{'★'.repeat(5)}</span>
                      <span style={{fontSize:11,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{h.rating}</span>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {ams.slice(0,3).map((a:string)=>(
                        <span key={a} style={{fontSize:9.5,padding:'2px 6px',background:'var(--ef2)',borderRadius:5,color:'var(--el3)',fontFamily:FT}}>{a}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:16,fontWeight:800,color:color,fontFamily:FD}}>
                      {h.price_from?.toLocaleString('ru')} ₽
                    </div>
                    <div style={{fontSize:10,color:'var(--el4)',fontFamily:FT,marginBottom:8}}>за ночь</div>
                    <div style={{background:`${color}18`,borderRadius:12,padding:'6px 12px',border:`.5px solid ${color}35`}}>
                      <span style={{fontSize:11,fontWeight:700,color,fontFamily:FT}}>Забронировать</span>
                    </div>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:11,color:'var(--el3)',fontFamily:FT,lineHeight:1.5}}>
                  {h.description?.slice(0,120)}…
                </div>
                <div style={{display:'flex',gap:10,marginTop:8}}>
                  <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>🕐 Check-in {h.check_in}</span>
                  <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>🔑 Check-out {h.check_out}</span>
                  <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>🛏 {h.rooms_count} номеров</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{padding:'0 16px'}}>
          <div style={{borderRadius:22,background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-20,bottom:-20,fontSize:80,opacity:.1}}>🏙️</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1,marginBottom:6,fontFamily:FT}}>ETHNOMIR DEVELOPMENT</div>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,marginBottom:6}}>Живи в Этномире</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:16}}>Апартаменты · Виллы · Апарт-отели</div>
            <div style={{display:'flex',gap:20}}>
              {[['ROI','до 22%'],['Заезд','2026'],['Площадь','от 36м²']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:15,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
          </div>
          {re.map((r:any,i:number)=>(
            <div key={r.id} className={`tap fu s${i+1}`}
              style={{borderRadius:22,background:'var(--ef2)',border:'.5px solid var(--es2)',padding:'18px',marginBottom:12}}>
              <div style={{display:'flex',gap:14,marginBottom:12,alignItems:'center'}}>
                <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#1a3a5c,#0d1b2a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>🏙️</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:4}}>{r.name_ru}</div>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--el1)',fontFamily:FD}}>{r.price?.toLocaleString('ru')} ₽</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT}}>{r.price_per_m2?.toLocaleString('ru')} ₽/м² · {r.area_m2} м²</div>
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <div style={{flex:1,background:'#34C75910',borderRadius:12,padding:'10px',border:'.5px solid #34C75930',textAlign:'center'}}>
                  <div style={{fontSize:16,fontWeight:800,color:'var(--egreen)',fontFamily:FD}}>{r.roi_percent}%</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>ROI в год</div>
                </div>
                <div style={{flex:1,background:'var(--ef3)',borderRadius:12,padding:'10px',textAlign:'center'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{r.monthly_income?.toLocaleString('ru')} ₽</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>в месяц</div>
                </div>
              </div>
              <div style={{fontSize:12,color:'var(--el3)',fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{r.description_ru}</div>
              <div style={{background:'#0d1b2a',borderRadius:14,padding:'12px',textAlign:'center'}}>
                <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Записаться на показ →</span>
              </div>
            </div>
          ))}
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
      sb('services',`select=*&category=eq.banya&active=eq.true`)
        .then(d=>{setData(d||[]);setLoading(false);});
    } else {
      sb('services',`select=*&category=in.(attractions,excursion,rental,kids,photo,transport)&active=eq.true&order=category.asc`)
        .then(d=>{setData(d||[]);setLoading(false);});
    }
  },[sec]);

  const loadMenu = useCallback((id:string)=>{
    if(restId===id){setRestId(null);setMenu([]);return;}
    setRestId(id);
    sb('menu_items',`select=*&restaurant_id=eq.${id}&is_available=eq.true&order=sort_order.asc`)
      .then(d=>setMenu(d||[]));
  },[restId]);

  const BANYA_COLOR: Record<string,string> = {
    'Русская баня «Русь»':'#C0392B','Финская сауна':'#8B4513',
    'Хаммам «Шри-Ланка»':'#1E8449','СПА «Восток»':'#1A5276','Японская офуро':'#2E7D32'
  };

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Сервисы</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>12 ресторанов · 5 видов бань · 22 сервиса</div>
      </div>
      <Seg items={[['banya','🛁 Баня/СПА'],['food','🍽️ Рестораны'],['more','⚡ Ещё']]} val={sec} set={setSec}/>

      {loading ? <Spinner/> : sec==='banya' ? (
        <div style={{padding:'0 16px'}}>
          <div style={{borderRadius:18,background:'linear-gradient(135deg,#7B1D1D,#C0392B)',padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>БАННЫЙ КОМПЛЕКС ЭТНОМИРА</div>
            <div style={{fontSize:15,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:2}}>5 видов бань народов мира</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT}}>Русская · Финская · Хаммам · СПА · Офуро</div>
          </div>
          {data.map((s:any,i:number)=>{
            const c = BANYA_COLOR[s.name_ru]||'#555';
            return (
              <div key={s.id} className={`tap fu s${i+1}`}
                style={{borderRadius:20,background:`linear-gradient(135deg,${c}15,${c}04)`,border:`.5px solid ${c}28`,padding:'16px',marginBottom:12}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:56,height:56,borderRadius:16,background:`${c}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{s.cover_emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{s.name_ru}</div>
                    <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:5}}>{s.description_ru?.slice(0,70)}…</div>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <div style={{width:6,height:6,borderRadius:3,background:s.is_open_now?'var(--egreen)':'var(--el4)'}}/>
                      <span style={{fontSize:10,color:s.is_open_now?'var(--egreen)':'var(--el3)',fontFamily:FT,fontWeight:600}}>{s.status_text}</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:c,fontFamily:FD}}>от {s.price_from?.toLocaleString('ru')} ₽</div>
                    <div style={{marginTop:6,background:`${c}15`,borderRadius:10,padding:'5px 10px'}}>
                      <span style={{fontSize:11,fontWeight:700,color:c,fontFamily:FT}}>Забронировать</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : sec==='food' ? (
        <div style={{padding:'0 16px'}}>
          <div className="tap" style={{borderRadius:16,background:'linear-gradient(135deg,#FF6B35,#FF9500)',padding:'13px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:26}}>🚚</span>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:'#fff',fontFamily:FT}}>Доставка в любую точку парка</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT}}>GPS · от 20 мин · 140 га</div>
            </div>
          </div>
          {data.map((r:any,i:number)=>(
            <div key={r.id}>
              <div className={`tap fu s${Math.min(i+1,6)}`}
                style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',alignItems:'center',marginBottom:restId===r.id?0:10}}
                onClick={()=>loadMenu(r.id)}>
                <div style={{width:52,height:52,borderRadius:14,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{r.cover_emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:'var(--el1)',fontFamily:FT,marginBottom:1}}>{r.name_ru}</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{r.description_ru?.slice(0,50)}…</div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:10,color:'var(--egreen)',fontFamily:FT,fontWeight:600}}>Открыт</span>
                    <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>· ср. {r.avg_check} ₽</span>
                    <span style={{fontSize:10,color:'#FFD60A'}}>{'★'.repeat(Math.round(r.rating||5))}</span>
                  </div>
                </div>
                <div style={{transform:restId===r.id?'rotate(90deg)':'rotate(0)',transition:'transform .2s'}}>
                  <Chev/>
                </div>
              </div>
              {restId===r.id && menu.length>0 && (
                <div style={{background:'var(--ef3)',borderRadius:'0 0 16px 16px',padding:'8px 14px 12px',marginBottom:10,border:'.5px solid var(--es2)',borderTop:'none'}}>
                  {menu.map((m:any)=>(
                    <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'.5px solid var(--es2)'}}>
                      <div style={{flex:1,paddingRight:10}}>
                        <div style={{fontSize:12,fontWeight:600,color:'var(--el1)',fontFamily:FT}}>{m.name_ru}</div>
                        <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginTop:1}}>{m.description_ru?.slice(0,50)}</div>
                        {m.weight_grams && <span style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>{m.weight_grams}г · {m.calories} ккал</span>}
                        {m.spice_level>0 && <span style={{marginLeft:5,fontSize:9}}>{'🌶️'.repeat(m.spice_level)}</span>}
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:'var(--eblue)',fontFamily:FT,flexShrink:0}}>{m.price} ₽</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{padding:'0 16px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {data.map((s:any,i:number)=>(
              <div key={s.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{padding:'14px',borderRadius:18,background:'var(--ef2)',border:'.5px solid var(--es2)'}}>
                <div style={{fontSize:28,marginBottom:6}}>{s.cover_emoji}</div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{s.name_ru}</div>
                <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginBottom:6,lineHeight:1.3}}>{s.description_ru?.slice(0,55)}…</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>от {s.price_from} ₽</span>
                  <div style={{width:5,height:5,borderRadius:3,background:s.is_open_now?'var(--egreen)':'var(--el4)'}}/>
                </div>
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
      <div style={{padding:'52px 20px 0'}}>
        {/* Passport card */}
        <div style={{borderRadius:24,background:'linear-gradient(135deg,#1a2a1a,#2d4a2d)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-10,top:-10,fontSize:80,opacity:.08}}>🌍</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
                <div style={{fontSize:19,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>Гражданин Мира</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.55)',fontFamily:FT,marginTop:2}}>Уровень: Новичок · Войди для синхронизации</div>
              </div>
              <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🌐</div>
            </div>
            <div style={{display:'flex',gap:24,marginBottom:14}}>
              {[['Стран',String(visitedCountries.length),'#7DEFA1'],['Баллов',profile?String(profile.points):'0','#FFD60A'],['Уровень',profile?String(Math.floor((profile.points||0)/1000)+1):'1','#5E9CFF']].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:22,fontWeight:800,color:c,fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{height:5,background:'rgba(255,255,255,.1)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:'0%',background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:4}}>0 из 96 стран · 0 из 85 регионов России</div>
          </div>
        </div>
      </div>

      <Seg items={[['stamps','🗺️ 96 стран'],['regions','🇷🇺 85 регионов'],['achievements','🏆 Достижения'],['profile','👤 Профиль']]} val={sec} set={setSec}/>

      {loading ? <Spinner/> : sec==='stamps' ? (
        <div style={{padding:'0 20px'}}>
          {/* Achievement progress */}
          <div style={{marginBottom:14,borderRadius:18,background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:'16px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:-10,fontSize:64,opacity:.08}}>🌍</div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
              <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>0 / 96 стран</div>
              <div style={{display:'flex',gap:12,marginTop:10}}>
                {[['Первые шаги','1','#7DEFA1'],['Путник','5','#5E9CFF'],['Картограф','10','#FFD60A'],['Исследователь','20','#FF9500'],['Посол Мира','96','#FF6B9D']].map(([l,n,c]:any)=>(
                  <div key={l} style={{flex:1,textAlign:'center',padding:'6px 2px',borderRadius:10,background:'rgba(255,255,255,.08)'}}>
                    <div style={{fontSize:12,fontWeight:800,color:c,fontFamily:FD}}>{n}</div>
                    <div style={{fontSize:7,color:'rgba(255,255,255,.45)',fontFamily:FT}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,marginTop:10,overflow:'hidden'}}>
                <div style={{height:'100%',width:'0%',background:'linear-gradient(90deg,#007AFF,#5E9CFF)',borderRadius:2}}/>
              </div>
            </div>
          </div>

          {/* Country cards */}
          {countries.map((c:any,i:number)=>{
            const isOpen = expandedCountry === c.id;
            return (
            <div key={c.id} className={`fu s${Math.min((i%6)+1,6)}`}
              style={{borderRadius:20,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:10,overflow:'hidden'}}>
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
                    {c.capital && <div style={{flex:1,padding:'10px 8px',borderRadius:12,background:'var(--ef3)',textAlign:'center'}}>
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
            <div style={{display:'flex',gap:14,padding:'16px',borderRadius:20,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:14,alignItems:'center'}}>
              <div style={{width:64,height:64,borderRadius:20,background:'linear-gradient(135deg,#1a3a5c,#007AFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0,color:'#fff',fontWeight:800,fontFamily:FD}}>{(profile.name||'').split(' ').map((w:string)=>w[0]).join('').slice(0,2)}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:1}}>{profile.name}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:1}}>{session.user?.email} {profile.is_partner ? ' · Партнёр' : ''}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:1}}>{profile.phone || ''}</div>
                <div style={{display:'flex',gap:8,marginTop:6}}>
                  <div style={{padding:'3px 10px',borderRadius:8,background:'rgba(52,199,89,.1)'}}><span style={{fontSize:10,fontWeight:700,color:'var(--egreen)',fontFamily:FT}}>{profile.points} баллов</span></div>
                  <div style={{padding:'3px 10px',borderRadius:8,background:'rgba(0,122,255,.1)'}}><span style={{fontSize:10,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>Кошелёк: {(profile.wallet_balance||0).toLocaleString('ru')} ₽</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{padding:'20px',borderRadius:20,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:14}}>
              <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2,textAlign:'center'}}>Войти в паспорт</div>
              <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:14,textAlign:'center'}}>Сохраняй прогресс и копи баллы</div>
              <div style={{marginBottom:10}}><input value={loginEmail} onChange={(e:any)=>setLoginEmail(e.target.value)} placeholder="Email" style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid var(--separator)',background:'var(--eb)',fontSize:15,fontFamily:FT,outline:'none'}} /></div>
              <div style={{marginBottom:10}}><input value={loginPass} onChange={(e:any)=>setLoginPass(e.target.value)} type="password" placeholder="Пароль" style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid var(--separator)',background:'var(--eb)',fontSize:15,fontFamily:FT,outline:'none'}} /></div>
              {loginError && <div style={{fontSize:11,color:'var(--ered)',fontFamily:FT,marginBottom:8,textAlign:'center'}}>{loginError}</div>}
              <div className="tap" onClick={async()=>{ if(!loginEmail||!loginPass)return; setLoginLoading(true); setLoginError(''); const r = await onLogin(loginEmail,loginPass); setLoginLoading(false); if(!r.ok) setLoginError(r.error); }}
                style={{padding:'13px',borderRadius:14,background:'var(--eblue)',textAlign:'center',opacity:loginLoading?.5:1}}>
                <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>{loginLoading ? 'Вход...' : 'Войти'}</span>
              </div>
              <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'center'}}>
                {['Apple','Google','VK'].map(p=>(
                  <div key={p} className="tap" style={{flex:1,padding:'10px',borderRadius:12,border:'1px solid var(--separator)',textAlign:'center'}}>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--el2)',fontFamily:FT}}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {session && profile && (
            <div style={{borderRadius:20,background:'linear-gradient(135deg,#0a1628,#1a3352)',padding:'16px',marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Кошелёк</div>
                <div style={{fontSize:22,fontWeight:800,color:'#7DEFA1',fontFamily:FD}}>{(profile.wallet_balance||0).toLocaleString('ru')} ₽</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <div className="tap" style={{flex:1,padding:'10px',borderRadius:12,background:'rgba(52,199,89,.15)',textAlign:'center'}}>
                  <span style={{fontSize:12,fontWeight:700,color:'var(--egreen)',fontFamily:FT}}>Пополнить</span>
                </div>
                <div className="tap" style={{flex:1,padding:'10px',borderRadius:12,background:'rgba(0,122,255,.15)',textAlign:'center'}}>
                  <span style={{fontSize:12,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>История</span>
                </div>
              </div>
            </div>
          )}
          <div className="tap" style={{borderRadius:20,background:'linear-gradient(135deg,#1a1a2e,#16213e)',padding:'16px',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:'rgba(255,215,0,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>💎</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Подписка «Посол Мира»</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:FT}}>990 ₽/мес · 30 дней бесплатно</div>
              </div>
              <Chev c="rgba(255,255,255,.4)"/>
            </div>
          </div>
          {[{e:'📦',l:'Мои заказы',s:'Бронирования и билеты'},
            {e:'💰',l:'Баллы лояльности',s:'История начислений'},
            {e:'🤝',l:'Пригласить друга',s:'+100 баллов за каждого'},
            {e:'📞',l:'Поддержка',s:'+7 495 023-81-81 · 24/7'},
            {e:'⚙️',l:'Настройки',s:'Уведомления · Язык'},
            {e:'🌐',l:'ethnomir.ru',s:'Официальный сайт'},
            ...(session ? [{e:'🚪',l:'Выйти',s:'Завершить сессию'}] : [])
          ].map(it=>(
            <div key={it.l} className="tap"
              onClick={()=>{if(it.l==='Выйти')onLogout();}}
              style={{display:'flex',gap:12,padding:'13px',borderRadius:16,background:it.l==='Выйти'?'rgba(255,59,48,.06)':'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:8,alignItems:'center'}}>
              <div style={{width:42,height:42,borderRadius:12,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{it.e}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--el1)',fontFamily:FT}}>{it.l}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginTop:1}}>{it.s}</div>
              </div>
              <Chev/>
            </div>
          ))}
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
              <span style={{fontSize:10,fontFamily:FT,fontWeight:on?700:400,color:on?'var(--el1)':'var(--el3)',marginTop:3,letterSpacing:'-.1px',position:'relative',zIndex:1}}>{tab.label}</span>
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
