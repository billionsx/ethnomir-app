'use client';
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

// âââ Supabase ââââââââââââââââââââââââââââââââââââââââââââ
const SB_URL = 'https://ewnoqkoojobyqqxpvzhj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';

async function sb(table: string, params = '') {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) return [];
  return r.json();
}

// âââ Fonts âââââââââââââââââââââââââââââââââââââââââââââââ
const FD = '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif';
const FT = '"SF Pro Text",-apple-system,BlinkMacSystemFont,sans-serif';

type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

// âââ CSS âââââââââââââââââââââââââââââââââââââââââââââââââ
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

// âââ Helpers âââââââââââââââââââââââââââââââââââââââââââââ
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
  {emoji:'ðª',title:'ÐÐµÑÐ½Ð¸Ð¹ ÑÐµÑÑÐ¸Ð²Ð°Ð»Ñ Ð½Ð°ÑÐ¾Ð´Ð¾Ð² Ð¼Ð¸ÑÐ°',sub:'25â26 Ð¸ÑÐ»Ñ Â· ÐÑÑ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ Ð¿Ð°ÑÐºÐ°',badge:'Ð¢Ð¾Ð¿-ÑÐ¾Ð±ÑÑÐ¸Ðµ',g:'linear-gradient(135deg,#C0392B,#E91E63)'},
  {emoji:'ð¸',title:'Ð¡Ð°ÐºÑÑÐ° Ð¤ÐµÑÑÐ¸Ð²Ð°Ð»Ñ',sub:'18â19 Ð°Ð¿ÑÐµÐ»Ñ Â· Ð¯Ð¿Ð¾Ð½ÑÐºÐ¸Ð¹ Ð¿Ð°Ð²Ð¸Ð»ÑÐ¾Ð½',badge:'ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾',g:'linear-gradient(135deg,#1a1a3e,#AF52DE,#FF6B9D)'},
  {emoji:'ð¥',title:'ÐÐ°ÑÐ»ÐµÐ½Ð¸ÑÐ° ÑÐ±Ð¸Ð»ÐµÐ¹Ð½Ð°Ñ',sub:'28 ÑÐµÐ²Ñ.â8 Ð¼Ð°ÑÑÐ° Â· ÐÐ»Ð°Ð²Ð½Ð°Ñ Ð¿Ð»Ð¾ÑÐ°Ð´Ñ',badge:'XX Ð»ÐµÑ!',g:'linear-gradient(135deg,#0d2b1d,#1a6b3a,#30D158)'},
  {emoji:'ð',title:'ÐÑÐ»Ð¸Ð½Ð°ÑÐ½ÑÐ¹ ÑÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ',sub:'11â12 Ð¸ÑÐ»Ñ Â· ÐÑÐ»Ð¸Ð½Ð°ÑÐ½ÑÐ¹ ÑÐµÐ°ÑÑ',badge:'ÐÑÐ¾Ð´Ð°Ð¶Ð°',g:'linear-gradient(135deg,#4a1500,#c0390b,#FF9500)'},
];

// âââ HOME âââââââââââââââââââââââââââââââââââââââââââââââââ
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
            <div style={{fontSize:12,color:'var(--el3)',fontFamily:FT}}>ÐÐ¾Ð±ÑÑÐ¹ Ð´ÐµÐ½Ñ ð</div>
            <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px',lineHeight:1.1,marginTop:1}}>Ð­Ð¢ÐÐÐÐÐ </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {['ð','ð'].map((ic,i)=>(
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
          <span style={{fontSize:28}}>ð¤</span>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:8,alignItems:'baseline'}}>
              <span style={{fontSize:22,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.5px'}}>+8Â°</span>
              <span style={{fontSize:12,color:'var(--el3)',fontFamily:FT}}>ÐÐ°Ð»ÑÐ¶ÑÐºÐ°Ñ Ð¾Ð±Ð». Â· Ð­ÑÐ½Ð¾Ð¼Ð¸Ñ</span>
            </div>
            <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginTop:1}}>ÐÐµÑÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ð¾Ð±Ð»Ð°ÑÐ½Ð¾ÑÑÑ Â· ÐÐµÑÐµÑ 5 Ð¼/Ñ Â· ÐÑÐºÑÑÑÐ¾ Ð´Ð¾ 21:00</div>
          </div>
          <div style={{textAlign:'right'}}><div style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ</div><div style={{fontSize:11,color:'var(--el2)',fontFamily:FT}}>+6Â°/+11Â°</div></div>
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
          <div style={{width:48,height:48,borderRadius:14,background:'rgba(27,67,50,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>ð</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>ÐÐ°ÑÐ¿Ð¾ÑÑ Ð¿ÑÑÐµÑÐµÑÑÐ²ÐµÐ½Ð½Ð¸ÐºÐ°</span>
              <span style={{fontSize:12,fontWeight:700,color:'var(--egreen)'}}>0 / 40</span>
            </div>
            <div style={{height:5,background:'rgba(0,0,0,.08)',borderRadius:3,overflow:'hidden',marginBottom:4}}>
              <div style={{height:'100%',width:'0%',background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT}}>Ð¡ÐºÐ°Ð½Ð¸ÑÑÐ¹ QR Ñ Ð¿Ð°Ð²Ð¸Ð»ÑÐ¾Ð½Ð¾Ð² Â· 0 Ð±Ð°Ð»Ð»Ð¾Ð²</div>
          </div>
          <Chev/>
        </div>
      </div>

      {/* Open now */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px'}}>ÐÑÐºÑÑÑÐ¾ ÑÐµÐ¹ÑÐ°Ñ</div>
            {!loading && <div style={{fontSize:11,color:'var(--egreen)',fontFamily:FT,marginTop:1}}><span className="live"/>{services.length} Ð¼ÐµÑÑ Â· ÐÐ¸Ð²Ð¾Ð¹ ÑÑÐ°ÑÑÑ</div>}
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
          <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px'}}>ÐÐ»Ð¸Ð¶Ð°Ð¹ÑÐ¸Ðµ ÑÐ¾Ð±ÑÑÐ¸Ñ</div>
          <div className="tap" style={{padding:'5px 10px',background:'rgba(0,122,255,.1)',borderRadius:8}}><span style={{fontSize:11,color:'var(--eblue)',fontFamily:FT,fontWeight:600}}>ÐÑÐµ 12</span></div>
        </div>
        {loading ? <Spinner/> : (
          <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
            {events.map((e:any,i:number)=>{
              const d = new Date(e.starts_at);
              const diff = Math.ceil((d.getTime()-Date.now())/(86400000));
              const label = diff<=0?'Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ!':diff===1?'ÐÐ°Ð²ÑÑÐ°':`Ð§ÐµÑÐµÐ· ${diff} Ð´Ð½.`;
              return (
                <div key={i} className={`tap fu s${Math.min(i+1,6)}`} style={{flexShrink:0,width:158,padding:'12px',borderRadius:18,background:'var(--ef2)',border:'.5px solid var(--es2)'}}>
                  <div style={{fontSize:28,marginBottom:8}}>{e.cover_emoji}</div>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:4,lineHeight:1.3}}>{e.name_ru}</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{e.location_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                    <span style={{fontSize:10,color:'var(--eblue)',fontWeight:600,fontFamily:FT}}>{label}</span>
                    {e.is_free && <Bdg label="ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾" color="var(--egreen)"/>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px',marginBottom:12}}>ÐÑÑÑÑÑÐµ Ð´ÐµÐ¹ÑÑÐ²Ð¸Ñ</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[{e:'ð·',l:'Ð¡ÐºÐ°Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ QR',c:'#007AFF',s:'ÐÑÐºÑÑÑÑ ÑÑÑÐ°Ð½Ñ'},
            {e:'ðºï¸',l:'ÐÐ°ÑÑÐ° Ð¿Ð°ÑÐºÐ°',c:'#34C759',s:'140 Ð³Ð° Â· GPS'},
            {e:'ð',l:'ÐÐ²Ð¾Ð½Ð¾Ðº',c:'#FF9500',s:'+7 495 023-81-81'},
            {e:'ð³',l:'ÐÑÐ¿Ð¸ÑÑ Ð±Ð¸Ð»ÐµÑ',c:'#AF52DE',s:'ÐÐ½Ð»Ð°Ð¹Ð½ Â· ÐÑ 990 â½'}].map(a=>(
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
          <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:64,opacity:.14}}>ðï¸</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginBottom:4,fontWeight:700,letterSpacing:1,fontFamily:FT}}>ETHNOMIR DEVELOPMENT</div>
            <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD,marginBottom:4}}>ÐÐ¸Ð²Ð¸ Ð² Ð­ÑÐ½Ð¾Ð¼Ð¸ÑÐµ</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:12}}>ÐÐ¿Ð°ÑÑÐ°Ð¼ÐµÐ½ÑÑ Ð¾Ñ 5.4 Ð¼Ð»Ð½ â½ Â· ROI Ð´Ð¾ 22%/Ð³Ð¾Ð´</div>
            <div style={{display:'flex',gap:18,marginBottom:12}}>
              {[['ROI','Ð´Ð¾ 22%'],['ÐÐ°ÐµÐ·Ð´','2026'],['ÐÐ»Ð¾ÑÐ°Ð´Ñ','Ð¾Ñ 36Ð¼Â²']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,.14)',borderRadius:10,padding:'6px 14px',border:'.5px solid rgba(255,255,255,.2)'}}>
              <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>Ð£Ð·Ð½Ð°ÑÑ Ð¿Ð¾Ð´ÑÐ¾Ð±Ð½ÐµÐµ â</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// âââ TOURS ââââââââââââââââââââââââââââââââââââââââââââââââ
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
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Ð¢ÑÑÑ</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>{tours.length || ''} ÑÑÑÐ¿Ð°ÐºÐµÑÐ¾Ð² Â· {mk.length||'41'} ÐÐ Â· 12 ÑÐ¾Ð±ÑÑÐ¸Ð¹</div>
      </div>
      <Seg items={[['tours','ð« Ð¢ÑÑÑ'],['mk','ð ÐÐ°ÑÑÐµÑ-ÐºÐ»Ð°ÑÑÑ'],['events','ð Ð¡Ð¾Ð±ÑÑÐ¸Ñ']]} val={sec} set={setSec}/>

      {loading ? <Spinner/> : sec==='tours' ? (
        <div style={{padding:'0 16px'}}>
          {tours.map((t:any,i:number)=>{
            const color = TOUR_COLORS[t.type]||'#555';
            const h = Math.floor(t.duration_minutes/60);
            const dur = h>=24?`${Math.floor(h/24)} Ð´Ð½.`:h>0?`${h} Ñ.`:`${t.duration_minutes} Ð¼Ð¸Ð½.`;
            return (
              <div key={t.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{borderRadius:22,background:`linear-gradient(135deg,${color}dd,${color}88)`,padding:'20px',marginBottom:14,position:'relative',overflow:'hidden'}}
                onClick={()=>setExp(exp===t.id?null:t.id)}>
                <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:72,opacity:.18}}>{t.cover_emoji}</div>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.6)',fontWeight:700,marginBottom:6,fontFamily:FT,letterSpacing:.8}}>{t.type?.toUpperCase()}</div>
                  <div style={{fontSize:19,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>{t.name_ru}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.72)',fontFamily:FT,marginBottom:14,lineHeight:1.4}}>{t.description_ru?.slice(0,80)}â¦</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontSize:24,fontWeight:800,color:'#fff',fontFamily:FD}}>{t.price.toLocaleString('ru')} â½</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.55)',fontFamily:FT}}>/ {dur} Â· Ð´Ð¾ {t.max_participants} ÑÐµÐ».</div>
                    </div>
                    <div style={{background:'rgba(255,255,255,.22)',borderRadius:14,padding:'9px 18px',border:'.5px solid rgba(255,255,255,.28)'}}>
                      <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ</span>
                    </div>
                  </div>
                  {exp===t.id && (
                    <div style={{marginTop:14,paddingTop:14,borderTop:'.5px solid rgba(255,255,255,.22)'}}>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.9)',fontFamily:FT,lineHeight:1.5}}>{t.description_ru}</div>
                      <div style={{marginTop:10,display:'flex',gap:12}}>
                        {[['â­','Ð ÐµÐ¹ÑÐ¸Ð½Ð³',t.rating],['ð¥','Ð£ÑÐ°ÑÑÐ½Ð¸ÐºÐ¾Ð²',t.max_participants],['ð','ÐÐ»Ð¸ÑÐµÐ»ÑÐ½Ð¾ÑÑÑ',dur]].map(([ic,l,v])=>(
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
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:3}}>{m.location_ru} Â· {m.duration_min} Ð¼Ð¸Ð½.</div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <div style={{width:5,height:5,borderRadius:3,background:m.is_available?'var(--egreen)':'var(--el4)'}}/>
                  <span style={{fontSize:10,color:m.is_available?'var(--egreen)':'var(--el3)',fontFamily:FT,fontWeight:600}}>
                    {m.is_available?`Ð´Ð¾ ${m.max_persons} ÑÐµÐ».`:'ÐÐµÐ´Ð¾ÑÑÑÐ¿ÐµÐ½'}
                  </span>
                  {m.min_age>0 && <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>Â· Ð¾Ñ {m.min_age} Ð»ÐµÑ</span>}
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:15,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>{m.price.toLocaleString('ru')} â½</div>
                <div style={{marginTop:5,padding:'4px 10px',borderRadius:8,background:'rgba(0,122,255,.1)'}}>
                  <span style={{fontSize:11,fontWeight:600,color:'var(--eblue)',fontFamily:FT}}>ÐÐ°Ð¿Ð¸ÑÐ°ÑÑÑÑ</span>
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
            const label = diff<=0?'ÐÐ´ÑÑ ÑÐµÐ¹ÑÐ°Ñ!':diff===1?'ÐÐ°Ð²ÑÑÐ°':`Ð§ÐµÑÐµÐ· ${diff} Ð´Ð½.`;
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
                    {e.is_free ? <Bdg label="ÐÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾" color="var(--egreen)"/> : e.price>0 ? <Bdg label={`Ð¾Ñ ${e.price.toLocaleString('ru')} â½`} color="var(--eor)"/> : null}
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

// âââ STAY âââââââââââââââââââââââââââââââââââââââââââââââââ
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
    srilanka:'ð´',india:'ð',nepal:'ðï¸',himalayan:'ð¢',sibiriya:'âº',russian:'ð¡',
    belarus:'ð²',ukraine:'ð»',sea:'ðï¸',caravanserai:'ð'
  };

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>ÐÐ¸Ð»ÑÑ</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>10 ÑÑÐ½Ð¾Ð¾ÑÐµÐ»ÐµÐ¹ Â· ÐÐ»ÑÐ¼Ð¿Ð¸Ð½Ð³ Â· ÐÐ¿Ð°ÑÑÐ°Ð¼ÐµÐ½ÑÑ</div>
      </div>
      <Seg items={[['hotels','ð¨ Ð¡Ð½ÑÑÑ'],['re','ðï¸ ÐÑÐ¿Ð¸ÑÑ']]} val={view} set={setView}/>

      {loading ? <Spinner/> : view==='hotels' ? (
        <div style={{padding:'0 16px'}}>
          {hotels.map((h:any,i:number)=>{
            const color = HOTEL_COLORS[h.type]||'#555';
            const emoji = HOTEL_EMOJIS[h.slug]||'ð ';
            const ams: string[] = h.amenities||[];
            return (
              <div key={h.id} className={`tap fu s${Math.min(i+1,6)}`}
                style={{borderRadius:22,background:`linear-gradient(135deg,${color}18,${color}05)`,border:`.5px solid ${color}30`,padding:'16px',marginBottom:12}}>
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <div style={{width:62,height:62,borderRadius:18,background:`${color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{h.name}</div>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                      <span style={{fontSize:11,color:'#FFD60A'}}>{'â'.repeat(5)}</span>
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
                      {h.price_from?.toLocaleString('ru')} â½
                    </div>
                    <div style={{fontSize:10,color:'var(--el4)',fontFamily:FT,marginBottom:8}}>Ð·Ð° Ð½Ð¾ÑÑ</div>
                    <div style={{background:`${color}18`,borderRadius:12,padding:'6px 12px',border:`.5px solid ${color}35`}}>
                      <span style={{fontSize:11,fontWeight:700,color,fontFamily:FT}}>ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ</span>
                    </div>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:11,color:'var(--el3)',fontFamily:FT,lineHeight:1.5}}>
                  {h.description?.slice(0,120)}â¦
                </div>
                <div style={{display:'flex',gap:10,marginTop:8}}>
                  <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>ð Check-in {h.check_in}</span>
                  <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>ð Check-out {h.check_out}</span>
                  <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>ð {h.rooms_count} Ð½Ð¾Ð¼ÐµÑÐ¾Ð²</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{padding:'0 16px'}}>
          <div style={{borderRadius:22,background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-20,bottom:-20,fontSize:80,opacity:.1}}>ðï¸</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1,marginBottom:6,fontFamily:FT}}>ETHNOMIR DEVELOPMENT</div>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,marginBottom:6}}>ÐÐ¸Ð²Ð¸ Ð² Ð­ÑÐ½Ð¾Ð¼Ð¸ÑÐµ</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:16}}>ÐÐ¿Ð°ÑÑÐ°Ð¼ÐµÐ½ÑÑ Â· ÐÐ¸Ð»Ð»Ñ Â· ÐÐ¿Ð°ÑÑ-Ð¾ÑÐµÐ»Ð¸</div>
            <div style={{display:'flex',gap:20}}>
              {[['ROI','Ð´Ð¾ 22%'],['ÐÐ°ÐµÐ·Ð´','2026'],['ÐÐ»Ð¾ÑÐ°Ð´Ñ','Ð¾Ñ 36Ð¼Â²']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:15,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
          </div>
          {re.map((r:any,i:number)=>(
            <div key={r.id} className={`tap fu s${i+1}`}
              style={{borderRadius:22,background:'var(--ef2)',border:'.5px solid var(--es2)',padding:'18px',marginBottom:12}}>
              <div style={{display:'flex',gap:14,marginBottom:12,alignItems:'center'}}>
                <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#1a3a5c,#0d1b2a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>ðï¸</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:4}}>{r.name_ru}</div>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--el1)',fontFamily:FD}}>{r.price?.toLocaleString('ru')} â½</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT}}>{r.price_per_m2?.toLocaleString('ru')} â½/Ð¼Â² Â· {r.area_m2} Ð¼Â²</div>
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <div style={{flex:1,background:'#34C75910',borderRadius:12,padding:'10px',border:'.5px solid #34C75930',textAlign:'center'}}>
                  <div style={{fontSize:16,fontWeight:800,color:'var(--egreen)',fontFamily:FD}}>{r.roi_percent}%</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>ROI Ð² Ð³Ð¾Ð´</div>
                </div>
                <div style={{flex:1,background:'var(--ef3)',borderRadius:12,padding:'10px',textAlign:'center'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{r.monthly_income?.toLocaleString('ru')} â½</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>Ð² Ð¼ÐµÑÑÑ</div>
                </div>
              </div>
              <div style={{fontSize:12,color:'var(--el3)',fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{r.description_ru}</div>
              <div style={{background:'#0d1b2a',borderRadius:14,padding:'12px',textAlign:'center'}}>
                <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>ÐÐ°Ð¿Ð¸ÑÐ°ÑÑÑÑ Ð½Ð° Ð¿Ð¾ÐºÐ°Ð· â</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// âââ SERVICES âââââââââââââââââââââââââââââââââââââââââââââ
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
    'Ð ÑÑÑÐºÐ°Ñ Ð±Ð°Ð½Ñ Â«Ð ÑÑÑÂ»':'#C0392B','Ð¤Ð¸Ð½ÑÐºÐ°Ñ ÑÐ°ÑÐ½Ð°':'#8B4513',
    'Ð¥Ð°Ð¼Ð¼Ð°Ð¼ Â«Ð¨ÑÐ¸-ÐÐ°Ð½ÐºÐ°Â»':'#1E8449','Ð¡ÐÐ Â«ÐÐ¾ÑÑÐ¾ÐºÂ»':'#1A5276','Ð¯Ð¿Ð¾Ð½ÑÐºÐ°Ñ Ð¾ÑÑÑÐ¾':'#2E7D32'
  };

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Ð¡ÐµÑÐ²Ð¸ÑÑ</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>12 ÑÐµÑÑÐ¾ÑÐ°Ð½Ð¾Ð² Â· 5 Ð²Ð¸Ð´Ð¾Ð² Ð±Ð°Ð½Ñ Â· 22 ÑÐµÑÐ²Ð¸ÑÐ°</div>
      </div>
      <Seg items={[['banya','ð ÐÐ°Ð½Ñ/Ð¡ÐÐ'],['food','ð½ï¸ Ð ÐµÑÑÐ¾ÑÐ°Ð½Ñ'],['more','â¡ ÐÑÑ']]} val={sec} set={setSec}/>

      {loading ? <Spinner/> : sec==='banya' ? (
        <div style={{padding:'0 16px'}}>
          <div style={{borderRadius:18,background:'linear-gradient(135deg,#7B1D1D,#C0392B)',padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontWeight:700,letterSpacing:1,fontFamily:FT}}>ÐÐÐÐÐ«Ð ÐÐÐÐÐÐÐÐ¡ Ð­Ð¢ÐÐÐÐÐ Ð</div>
            <div style={{fontSize:15,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:2}}>5 Ð²Ð¸Ð´Ð¾Ð² Ð±Ð°Ð½Ñ Ð½Ð°ÑÐ¾Ð´Ð¾Ð² Ð¼Ð¸ÑÐ°</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT}}>Ð ÑÑÑÐºÐ°Ñ Â· Ð¤Ð¸Ð½ÑÐºÐ°Ñ Â· Ð¥Ð°Ð¼Ð¼Ð°Ð¼ Â· Ð¡ÐÐ Â· ÐÑÑÑÐ¾</div>
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
                    <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:5}}>{s.description_ru?.slice(0,70)}â¦</div>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <div style={{width:6,height:6,borderRadius:3,background:s.is_open_now?'var(--egreen)':'var(--el4)'}}/>
                      <span style={{fontSize:10,color:s.is_open_now?'var(--egreen)':'var(--el3)',fontFamily:FT,fontWeight:600}}>{s.status_text}</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:c,fontFamily:FD}}>Ð¾Ñ {s.price_from?.toLocaleString('ru')} â½</div>
                    <div style={{marginTop:6,background:`${c}15`,borderRadius:10,padding:'5px 10px'}}>
                      <span style={{fontSize:11,fontWeight:700,color:c,fontFamily:FT}}>ÐÐ°Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°ÑÑ</span>
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
            <span style={{fontSize:26}}>ð</span>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:'#fff',fontFamily:FT}}>ÐÐ¾ÑÑÐ°Ð²ÐºÐ° Ð² Ð»ÑÐ±ÑÑ ÑÐ¾ÑÐºÑ Ð¿Ð°ÑÐºÐ°</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT}}>GPS Â· Ð¾Ñ 20 Ð¼Ð¸Ð½ Â· 140 Ð³Ð°</div>
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
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{r.description_ru?.slice(0,50)}â¦</div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:10,color:'var(--egreen)',fontFamily:FT,fontWeight:600}}>ÐÑÐºÑÑÑ</span>
                    <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>Â· ÑÑ. {r.avg_check} â½</span>
                    <span style={{fontSize:10,color:'#FFD60A'}}>{'â'.repeat(Math.round(r.rating||5))}</span>
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
                        {m.weight_grams && <span style={{fontSize:9,color:'var(--el4)',fontFamily:FT}}>{m.weight_grams}Ð³ Â· {m.calories} ÐºÐºÐ°Ð»</span>}
                        {m.spice_level>0 && <span style={{marginLeft:5,fontSize:9}}>{'ð¶ï¸'.repeat(m.spice_level)}</span>}
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:'var(--eblue)',fontFamily:FT,flexShrink:0}}>{m.price} â½</div>
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
                <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginBottom:6,lineHeight:1.3}}>{s.description_ru?.slice(0,55)}â¦</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>Ð¾Ñ {s.price_from} â½</span>
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

// âââ PASSPORT âââââââââââââââââââââââââââââââââââââââââââââ
function PassportTab() {
  const [sec, setSec] = useState('stamps');
  const [countries, setCountries] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFd, setRegionFd] = useState('');

  useEffect(()=>{
    setLoading(true);
    if(sec==='stamps') {
      sb('countries','select=id,name_ru,flag_emoji,region&active=eq.true&order=sort_order.asc')
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
          <div style={{position:'absolute',right:-10,top:-10,fontSize:80,opacity:.08}}>ð</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ÐÐÐ¡ÐÐÐ Ð¢ ÐÐ£Ð¢ÐÐ¨ÐÐ¡Ð¢ÐÐÐÐÐÐÐ</div>
                <div style={{fontSize:19,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>ÐÑÐ°Ð¶Ð´Ð°Ð½Ð¸Ð½ ÐÐ¸ÑÐ°</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.55)',fontFamily:FT,marginTop:2}}>Ð£ÑÐ¾Ð²ÐµÐ½Ñ: ÐÐ¾Ð²Ð¸ÑÐ¾Ðº Â· ÐÐ¾Ð¹Ð´Ð¸ Ð´Ð»Ñ ÑÐ¸Ð½ÑÑÐ¾Ð½Ð¸Ð·Ð°ÑÐ¸Ð¸</div>
              </div>
              <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>ð</div>
            </div>
            <div style={{display:'flex',gap:24,marginBottom:14}}>
              {[['Ð¡ÑÑÐ°Ð½','0','#7DEFA1'],['ÐÐ°Ð»Ð»Ð¾Ð²','0','#FFD60A'],['Ð£ÑÐ¾Ð²ÐµÐ½Ñ','1','#5E9CFF']].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:22,fontWeight:800,color:c,fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{height:5,background:'rgba(255,255,255,.1)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:'0%',background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT,marginTop:4}}>0 Ð¸Ð· 40 ÑÑÑÐ°Ð½ Â· 0 Ð¸Ð· 85 ÑÐµÐ³Ð¸Ð¾Ð½Ð¾Ð² Ð Ð¾ÑÑÐ¸Ð¸</div>
          </div>
        </div>
      </div>

      <Seg items={[['stamps','ðºï¸ 40 ÑÑÑÐ°Ð½'],['regions','ð·ðº 85 ÑÐµÐ³Ð¸Ð¾Ð½Ð¾Ð²'],['achievements','ð ÐÑÐ¸Ð²ÐºÐ¸'],['profile','ð¤ ÐÑÐ¾ÑÐ¸Ð»Ñ']]} val={sec} set={setSec}/>

      {loading ? <Spinner/> : sec==='stamps' ? (
        <div style={{padding:'0 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {countries.map((c:any,i:number)=>(
              <div key={c.id} className={`tap fu s${Math.min((i%6)+1,6)}`}
                style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 6px',
                  borderRadius:14,background:'var(--ef3)',border:'.5px solid var(--es2)',opacity:.6,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(242,242,247,.35)'}}>
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><rect x="1" y="5.5" width="10" height="8" rx="2" stroke="var(--el3)" strokeWidth="1.4"/><path d="M3.5 5.5V4a2.5 2.5 0 015 0v1.5" stroke="var(--el3)" strokeWidth="1.4"/></svg>
                </div>
                <div style={{fontSize:22}}>{c.flag_emoji}</div>
                <div style={{fontSize:9,fontWeight:600,color:'var(--el3)',fontFamily:FT,textAlign:'center',lineHeight:1.2}}>{c.name_ru}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:'12px 14px',borderRadius:16,background:'rgba(0,122,255,.07)',border:'.5px solid rgba(0,122,255,.2)',textAlign:'center',marginBottom:8}}>
            <div style={{fontSize:13,color:'var(--eblue)',fontWeight:600,fontFamily:FT}}>Ð¡ÐºÐ°Ð½Ð¸ÑÑÐ¹ QR-ÐºÐ¾Ð´ Ñ Ð¿Ð°Ð²Ð¸Ð»ÑÐ¾Ð½Ð¾Ð² Ð¸ Ð¾ÑÐºÑÑÐ²Ð°Ð¹ ÑÑÑÐ°Ð½Ñ ð·</div>
          </div>
        </div>
      ) : sec==='regions' ? (
        <div style={{padding:'0 20px'}}>
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
          {filteredRegions.map((r:any,i:number)=>(
            <div key={r.id} className={`tap fu s${Math.min((i%6)+1,6)}`}
              style={{display:'flex',gap:14,padding:'14px',borderRadius:20,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:10,alignItems:'center'}}
              onClick={()=>setRegionFd(regionFd===r.id?'':r.id)}>
              <div style={{width:56,height:56,borderRadius:14,background:'#fff',border:'1px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',padding:4}}>
                {r.coat_of_arms_url ? (
                  <img src={r.coat_of_arms_url} alt={r.name_ru} style={{width:'100%',height:'100%',objectFit:'contain'}} onError={(e:any)=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/>
                ) : null}
                <div style={{display:r.coat_of_arms_url?'none':'flex',fontSize:24,alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>{r.flag_emoji}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{r.name_ru}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{r.capital ? r.capital + ' · ' : ''}{r.federal_district}</div>
                {r.population>0 && <div style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>{(r.population/1000000).toFixed(1)} млн чел. · {(r.area_km2/1000).toFixed(0)} тыс. км²</div>}
              </div>
              <Chev/>
            </div>
          ))}
          {filteredRegions.length>0 && filteredRegions[0].description_ru && (
            <div style={{marginTop:8,padding:'14px',borderRadius:16,background:'rgba(0,122,255,.06)',border:'.5px solid rgba(0,122,255,.15)'}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--eblue)',fontFamily:FT,marginBottom:6}}>🇷🇺 Паспорт «Моя Россия»</div>
              <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,lineHeight:1.5}}>Посещай павильоны и собирай штампы 85 регионов. За полную коллекцию — ачивка «Гражданин России» и 3 000 баллов!</div>
            </div>
          )}
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
                    <span style={{fontSize:9,padding:'1px 5px',background:`${c}18`,borderRadius:5,color:c,fontWeight:700,fontFamily:FT}}>Ð£Ñ.{a.level}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:4}}>{a.description_ru}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:10,color:'#FFD60A',fontFamily:FT,fontWeight:600}}>+{a.reward_points} Ð±Ð°Ð»Ð»Ð¾Ð²</span>
                    <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>Â· {a.required_count} {a.required_count>=1000?'â½':'ÑÐ°Ð·'}</span>
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
          <div style={{display:'flex',gap:14,padding:'16px',borderRadius:20,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:14,alignItems:'center'}}>
            <div style={{width:64,height:64,borderRadius:20,background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>ð¤</div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>ÐÐ¾ÑÑÑ</div>
              <div style={{fontSize:12,color:'var(--el3)',fontFamily:FT,marginBottom:8}}>ÐÐ¾Ð¹Ð´Ð¸ÑÐµ, ÑÑÐ¾Ð±Ñ ÑÐ¾ÑÑÐ°Ð½ÑÑÑ Ð¿ÑÐ¾Ð³ÑÐµÑÑ</div>
              <div className="tap" style={{display:'inline-block',padding:'7px 16px',borderRadius:10,background:'var(--eblue)'}}>
                <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>ÐÐ¾Ð¹ÑÐ¸ / ÐÐ°ÑÐµÐ³Ð¸ÑÑÑÐ¸ÑÐ¾Ð²Ð°ÑÑÑÑ</span>
              </div>
            </div>
          </div>
          <div className="tap" style={{borderRadius:20,background:'linear-gradient(135deg,#1a1a2e,#16213e)',padding:'16px',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:'rgba(255,215,0,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>ð</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>ÐÐ¾Ð´Ð¿Ð¸ÑÐºÐ° Â«ÐÐ¾ÑÐ¾Ð» ÐÐ¸ÑÐ°Â»</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:FT}}>990 â½/Ð¼ÐµÑ Â· 30 Ð´Ð½ÐµÐ¹ Ð±ÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾</div>
              </div>
              <Chev c="rgba(255,255,255,.4)"/>
            </div>
          </div>
          {[{e:'ð¦',l:'ÐÐ¾Ð¸ Ð·Ð°ÐºÐ°Ð·Ñ',s:'ÐÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ñ Ð¸ Ð±Ð¸Ð»ÐµÑÑ'},
            {e:'ð°',l:'ÐÐ°Ð»Ð»Ñ Ð»Ð¾ÑÐ»ÑÐ½Ð¾ÑÑÐ¸',s:'ÐÑÑÐ¾ÑÐ¸Ñ Ð½Ð°ÑÐ¸ÑÐ»ÐµÐ½Ð¸Ð¹'},
            {e:'ð¤',l:'ÐÑÐ¸Ð³Ð»Ð°ÑÐ¸ÑÑ Ð´ÑÑÐ³Ð°',s:'+100 Ð±Ð°Ð»Ð»Ð¾Ð² Ð·Ð° ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾'},
            {e:'ð',l:'ÐÐ¾Ð´Ð´ÐµÑÐ¶ÐºÐ°',s:'+7 495 023-81-81 Â· 24/7'},
            {e:'âï¸',l:'ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸',s:'Ð£Ð²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ñ Â· Ð¯Ð·ÑÐº'},
            {e:'ð',l:'ethnomir.ru',s:'ÐÑÐ¸ÑÐ¸Ð°Ð»ÑÐ½ÑÐ¹ ÑÐ°Ð¹Ñ'}
          ].map(it=>(
            <div key={it.l} className="tap"
              style={{display:'flex',gap:12,padding:'13px',borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:8,alignItems:'center'}}>
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

// âââ TAB BAR ââââââââââââââââââââââââââââââââââââââââââââââ
const TABS = [
  {id:'home' as Tab, label:'ÐÐ»Ð°Ð²Ð½Ð°Ñ', ic:(a:boolean)=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?'#000':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill={a?'#fff':'none'} stroke={a?'#fff':'var(--el3)'}/></svg>},
  {id:'tours' as Tab, label:'Ð¢ÑÑÑ', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>},
  {id:'stay' as Tab, label:'ÐÐ¸Ð»ÑÑ', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10" fill={a?'#fff':'none'} stroke={a?'#fff':'var(--el3)'} strokeWidth="1.8"/></svg>},
  {id:'services' as Tab, label:'Ð¡ÐµÑÐ²Ð¸ÑÑ', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/></svg>},
  {id:'passport' as Tab, label:'ÐÐ°ÑÐ¿Ð¾ÑÑ', ic:(a:boolean)=><svg width="21" height="21" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" fill={a?'var(--el1)':'none'} stroke={a?'none':'var(--el3)'} strokeWidth="1.8"/><circle cx="12" cy="11" r="3" fill="none" stroke={a?'#fff':'var(--el3)'} strokeWidth="1.5"/><path d="M6 20v-1a6 6 0 0112 0v1" fill="none" stroke={a?'#fff':'var(--el3)'} strokeWidth="1.5"/></svg>},
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

// âââ APP ââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  return (
    <>
      <style>{CSS}</style>
      <div className="eth" style={{width:'100%',maxWidth:390,height:'100dvh',margin:'0 auto',display:'flex',flexDirection:'column',background:'var(--eb)',overflow:'hidden',position:'relative'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {tab==='home'     && <HomeTab/>}
          {tab==='tours'    && <ToursTab/>}
          {tab==='stay'     && <StayTab/>}
          {tab==='services' && <ServicesTab/>}
          {tab==='passport' && <PassportTab/>}
        </div>
        <TabBar active={tab} onSelect={setTab}/>
      </div>
    </>
  );
}
