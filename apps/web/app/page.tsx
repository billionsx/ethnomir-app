'use client';
import { useState, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────
type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

// ─── Data ────────────────────────────────────────────────
const FLAGSHIP_TOURS = [
  { id:1, emoji:'🌏', title:'Мир за день', sub:'40 стран за один день', price:'2 900 ₽', duration:'8 ч', badge:'Хит', color:'#C0392B' },
  { id:2, emoji:'🗺️', title:'Кругосветка за выходные', sub:'3 дня · 2 ночи · Азия + Европа', price:'13 900 ₽', duration:'3 дня', badge:'Популярно', color:'#2471A3' },
  { id:3, emoji:'🌐', title:'Планета за неделю', sub:'Все 40 стран · Сертификат', price:'34 900 ₽', duration:'7 дней', badge:'Топ', color:'#1E8449' },
  { id:4, emoji:'🇷🇺', title:'Погружение в Россию', sub:'85 регионов · Баня · Ремёсла', price:'9 900 ₽', duration:'2 дня', badge:'Новинка', color:'#7D3C98' },
];

const MASTERCLASSES = [
  { emoji:'🏺', name:'Гончарный круг', price:'1 200 ₽', dur:'90 мин', country:'Россия' },
  { emoji:'🪆', name:'Роспись матрёшки', price:'900 ₽', dur:'60 мин', country:'Россия' },
  { emoji:'🍱', name:'Приготовление суши', price:'1 500 ₽', dur:'90 мин', country:'Япония' },
  { emoji:'🖌️', name:'Японская каллиграфия', price:'1 000 ₽', dur:'60 мин', country:'Япония' },
  { emoji:'🍛', name:'Индийские специи', price:'1 200 ₽', dur:'60 мин', country:'Индия' },
  { emoji:'💃', name:'Танец живота', price:'700 ₽', dur:'60 мин', country:'Египет' },
  { emoji:'☕', name:'Турецкий кофе', price:'800 ₽', dur:'45 мин', country:'Турция' },
  { emoji:'🌹', name:'Фламенко базовый', price:'800 ₽', dur:'60 мин', country:'Испания' },
  { emoji:'🍵', name:'Чайная церемония', price:'1 000 ₽', dur:'60 мин', country:'Китай' },
  { emoji:'🎨', name:'Батик — роспись ткани', price:'1 400 ₽', dur:'90 мин', country:'Индонезия' },
];

const EVENTS = [
  { emoji:'🌺', name:'Навруз — Встреча Нового года', date:'Через 5 дней', loc:'Этнодвор Ср. Азии', free:true },
  { emoji:'🌸', name:'Сакура фестиваль', date:'Через 12 дней', loc:'Японский павильон', free:true },
  { emoji:'🐣', name:'Пасхальная ярмарка', date:'Через 20 дней', loc:'Главная площадь', free:true },
  { emoji:'🎵', name:'Всемирный день музыки', date:'Через 40 дней', loc:'Амфитеатр', free:true },
  { emoji:'🏆', name:'Кулинарный чемпионат', date:'Через 75 дней', loc:'Кулинарный театр', free:false },
];

const HOTELS = [
  { emoji:'🏯', name:'Замок Японии', type:'Японский стиль', price:'12 000 ₽/ночь', rooms:4, color:'#C0392B' },
  { emoji:'🕌', name:'Дворец Индии', type:'Могольский стиль', price:'9 500 ₽/ночь', rooms:2, color:'#E67E22' },
  { emoji:'🏰', name:'Замок Франции', type:'Французский шато', price:'14 000 ₽/ночь', rooms:6, color:'#2C3E50' },
  { emoji:'⛺', name:'Монгольская юрта', type:'Глэмпинг', price:'6 500 ₽/ночь', rooms:8, color:'#8B6914' },
  { emoji:'🏡', name:'Изба Руси', type:'Русский стиль', price:'7 000 ₽/ночь', rooms:3, color:'#1A5276' },
  { emoji:'🌴', name:'Бунгало Шри-Ланки', type:'Тропический стиль', price:'11 000 ₽/ночь', rooms:1, color:'#1E8449' },
];

const REAL_ESTATE = [
  { emoji:'🏙️', name:'Студия «Азия» 36м²', price:'5 400 000 ₽', roi:'22% ROI', income:'99 000 ₽/мес', status:'Доступно' },
  { emoji:'🏢', name:'Апарт «Европа» 52м²', price:'8 100 000 ₽', roi:'19.5% ROI', income:'131 625 ₽/мес', status:'Доступно' },
  { emoji:'🏛️', name:'Вилла «Шри-Ланка» 120м²', price:'22 000 000 ₽', roi:'15% ROI', income:'275 000 ₽/мес', status:'Доступно' },
];

const RESTAURANTS = [
  { emoji:'🍜', name:'Пад Тай', country:'Таиланд', type:'Азиатская кухня', wait:'15 мин', open:true },
  { emoji:'🍛', name:'Индийская душа', country:'Индия', type:'Индийская кухня', wait:'20 мин', open:true },
  { emoji:'🥘', name:'Турецкий дворик', country:'Турция', type:'Средиземноморская', wait:'10 мин', open:true },
  { emoji:'🍣', name:'Сакура', country:'Япония', type:'Японская кухня', wait:'25 мин', open:true },
  { emoji:'🌮', name:'Фиеста', country:'Мексика', type:'Мексиканская кухня', wait:'5 мин', open:true },
  { emoji:'🥗', name:'Русский двор', country:'Россия', type:'Русская кухня', wait:'10 мин', open:true },
  { emoji:'🍝', name:'Тратория Рима', country:'Италия', type:'Итальянская кухня', wait:'30 мин', open:false },
  { emoji:'🥙', name:'Кебаб по-арабски', country:'Марокко', type:'Ближневосточная', wait:'15 мин', open:true },
];

const SERVICES_GRID = [
  { emoji:'🛁', name:'Баня и СПА', color:'#C0392B' },
  { emoji:'🚲', name:'Прокат', color:'#2471A3' },
  { emoji:'🚐', name:'Трансфер', color:'#1E8449' },
  { emoji:'🚚', name:'Доставка', color:'#E67E22' },
  { emoji:'📸', name:'Фотосессия', color:'#8E44AD' },
  { emoji:'💍', name:'Свадьбы', color:'#E91E63' },
  { emoji:'🏢', name:'Конференции', color:'#546E7A' },
  { emoji:'🐾', name:'Зоодома', color:'#795548' },
  { emoji:'🎧', name:'Аудиогид', color:'#00897B' },
  { emoji:'🎁', name:'Сертификаты', color:'#F57F17' },
];

const COUNTRIES_STAMPS = [
  { id:'russia', flag:'🇷🇺', name:'Россия', unlocked:true },
  { id:'china', flag:'🇨🇳', name:'Китай', unlocked:true },
  { id:'india', flag:'🇮🇳', name:'Индия', unlocked:true },
  { id:'japan', flag:'🇯🇵', name:'Япония', unlocked:false },
  { id:'egypt', flag:'🇪🇬', name:'Египет', unlocked:false },
  { id:'turkey', flag:'🇹🇷', name:'Турция', unlocked:false },
  { id:'france', flag:'🇫🇷', name:'Франция', unlocked:false },
  { id:'italy', flag:'🇮🇹', name:'Италия', unlocked:false },
  { id:'spain', flag:'🇪🇸', name:'Испания', unlocked:false },
  { id:'germany', flag:'🇩🇪', name:'Германия', unlocked:false },
  { id:'greece', flag:'🇬🇷', name:'Греция', unlocked:false },
  { id:'brazil', flag:'🇧🇷', name:'Бразилия', unlocked:false },
  { id:'mexico', flag:'🇲🇽', name:'Мексика', unlocked:false },
  { id:'usa', flag:'🇺🇸', name:'США', unlocked:false },
  { id:'uk', flag:'🇬🇧', name:'Великобритания', unlocked:false },
  { id:'srilanka', flag:'🇱🇰', name:'Шри-Ланка', unlocked:false },
  { id:'thailand', flag:'🇹🇭', name:'Таиланд', unlocked:false },
  { id:'vietnam', flag:'🇻🇳', name:'Вьетнам', unlocked:false },
  { id:'mongolia', flag:'🇲🇳', name:'Монголия', unlocked:false },
  { id:'iran', flag:'🇮🇷', name:'Иран', unlocked:false },
];

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
  html,body,#__next{height:100%;overflow:hidden;margin:0;padding:0}
  .eth-root{
    --eb:#F2F2F7;--eb2:#FFFFFF;--ef1:rgba(120,120,128,.18);--ef2:rgba(120,120,128,.13);--ef3:rgba(120,120,128,.08);
    --el1:#000000;--el2:rgba(60,60,67,.65);--el3:rgba(60,60,67,.4);--el4:rgba(60,60,67,.2);
    --es:rgba(60,60,67,.25);--es2:rgba(60,60,67,.14);
    --egl:rgba(255,255,255,.72);--egl2:rgba(248,248,252,.6);--eglborder:rgba(255,255,255,.9);
    --eglspec:rgba(255,255,255,.92);--eglspec2:rgba(255,255,255,.35);
    --eblue:#007AFF;--egreen:#34C759;--ered:#FF3B30;--eor:#FF9500;
    --eye:#FFCC00;--epu:#AF52DE;--ete:#5AC8FA;--ein:#5856D6;--epk:#FF2D55;
    color-scheme:light;
  }
  .eth-root *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;min-height:0}
  .eth-root ::-webkit-scrollbar{display:none}
  .eth-root input,textarea{-webkit-appearance:none;outline:none;border:none;background:transparent}

  @keyframes eth-spring-in{0%{opacity:0;transform:scale(.88) translateY(16px)}60%{opacity:1;transform:scale(1.02) translateY(-2px)}80%{transform:scale(.99) translateY(1px)}100%{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes eth-fadeup{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes eth-fadein{from{opacity:0}to{opacity:1}}
  @keyframes eth-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes eth-pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes eth-spin{to{transform:rotate(360deg)}}
  @keyframes eth-pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
  @keyframes eth-stamp{0%{transform:scale(2) rotate(-15deg);opacity:0}60%{transform:scale(.9) rotate(3deg);opacity:1}80%{transform:scale(1.05) rotate(-1deg)}100%{transform:scale(1) rotate(0);opacity:1}}
  @keyframes eth-hero-in{0%{opacity:0;transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}

  .eth-spring{animation:eth-spring-in .44s cubic-bezier(.34,1.56,.64,1) both}
  .eth-fadeup{animation:eth-fadeup .38s cubic-bezier(.25,.46,.45,.94) both}
  .eth-fadein{animation:eth-fadein .25s ease both}
  .eth-hero-in{animation:eth-hero-in .5s cubic-bezier(.25,.46,.45,.94) both}
  .eth-s1{animation-delay:.05s}.eth-s2{animation-delay:.1s}.eth-s3{animation-delay:.15s}
  .eth-s4{animation-delay:.2s}.eth-s5{animation-delay:.25s}.eth-s6{animation-delay:.3s}

  .eth-tap{cursor:pointer;transition:transform .18s cubic-bezier(.34,1.5,.64,1),opacity .12s}
  .eth-tap:active{transform:scale(.92);opacity:.7;transition:transform .06s,opacity .06s}
  .eth-press{cursor:pointer;transition:transform .15s cubic-bezier(.34,1.3,.64,1),opacity .15s}
  .eth-press:active{transform:scale(.95);opacity:.8}

  .eth-glass{
    backdrop-filter:blur(40px) saturate(200%) brightness(1.05);
    -webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.05);
    background:var(--egl);border:0.5px solid var(--eglborder);
    box-shadow:inset 0 1px 0 var(--eglspec),inset 0 -0.5px 0 var(--eglspec2),0 4px 24px rgba(0,0,0,.12),0 1px 3px rgba(0,0,0,.08);
  }
  .eth-glass-premium{
    backdrop-filter:blur(60px) saturate(220%) brightness(1.08);
    -webkit-backdrop-filter:blur(60px) saturate(220%) brightness(1.08);
    background:rgba(255,255,255,.72);border:0.5px solid rgba(0,0,0,.08);
    box-shadow:inset 0 1.5px 0 rgba(255,255,255,.9),inset 0 -0.5px 0 rgba(0,0,0,.04),0 8px 40px rgba(0,0,0,.16),0 1px 4px rgba(0,0,0,.08),0 0 0 0.5px rgba(0,0,0,.04);
  }
  .eth-card{transition:transform .2s cubic-bezier(.34,1.3,.64,1),box-shadow .2s ease}
  .eth-live::before{content:'';width:6px;height:6px;border-radius:50%;background:#ff3b30;flex-shrink:0;animation:eth-pulse .8s ease-in-out infinite;display:inline-block;margin-right:5px}
`;

// ─── Sub-components ───────────────────────────────────────

function SectionHeader({ title, sub, action }: { title:string; sub?:string; action?:string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
      <div>
        <div style={{ fontSize:17, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Display",-apple-system,sans-serif', letterSpacing:'-.3px' }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:'var(--el3)', fontFamily:'"SF Pro Text",-apple-system,sans-serif', marginTop:1 }}>{sub}</div>}
      </div>
      {action && <div className="eth-tap" style={{ padding:'5px 10px', background:'var(--eblue)12', borderRadius:8 }}>
        <span style={{ fontSize:11, color:'var(--eblue)', fontFamily:'"SF Pro Text",-apple-system,sans-serif', fontWeight:600 }}>{action}</span>
      </div>}
    </div>
  );
}

function Badge({ label, color }: { label:string; color:string }) {
  return (
    <div style={{ display:'inline-block', padding:'2px 7px', background:`${color}22`, borderRadius:6, border:`0.5px solid ${color}44` }}>
      <span style={{ fontSize:10, fontWeight:700, color, fontFamily:'"SF Pro Text",-apple-system,sans-serif' }}>{label}</span>
    </div>
  );
}

// ─── TAB 1: Home ─────────────────────────────────────────
function HomeTab() {
  const stampsCount = 3;
  const totalCountries = 40;
  const points = 150;

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:100 }}>
      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:50, padding:'52px 20px 14px', background:'transparent' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:12, color:'var(--el3)', fontFamily:'"SF Pro Text",-apple-system,sans-serif', letterSpacing:'.2px' }}>Добрый день 👋</div>
            <div style={{ fontSize:28, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Display",-apple-system,sans-serif', letterSpacing:'-.6px', lineHeight:1.1, marginTop:1 }}>Этномир</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div className="eth-tap" style={{ width:38, height:38, borderRadius:19, background:'var(--ef2)', border:'0.5px solid var(--es2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="var(--el2)" strokeWidth="1.6"/><path d="M13.5 13.5L18 18" stroke="var(--el2)" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <div className="eth-tap" style={{ width:38, height:38, borderRadius:19, background:'var(--ef2)', border:'0.5px solid var(--es2)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <span style={{ fontSize:16 }}>🔔</span>
              <div style={{ position:'absolute', top:8, right:8, width:8, height:8, borderRadius:4, background:'#ff3b30', border:'1.5px solid var(--eb)' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ padding:'0 16px 14px' }}>
        <div className="eth-tap eth-hero-in" style={{ borderRadius:24, overflow:'hidden', position:'relative', height:178, background:'linear-gradient(135deg,#7B1D1D,#C0392B,#E91E63)', cursor:'pointer' }}>
          <div style={{ position:'absolute', right:-16, top:'50%', transform:'translateY(-50%)', fontSize:92, opacity:.2 }}>🎭</div>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(0,0,0,.35),transparent 60%)' }}/>
          <div style={{ position:'absolute', top:14, left:16 }}>
            <div style={{ display:'inline-flex', background:'rgba(255,255,255,.22)', backdropFilter:'blur(8px)', borderRadius:8, padding:'3px 10px', border:'0.5px solid rgba(255,255,255,.3)' }}>
              <span style={{ fontSize:10, color:'#fff', fontWeight:700 }}>Сегодня</span>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:16 }}>
            <div style={{ fontSize:20, fontWeight:800, color:'#fff', fontFamily:'"SF Pro Display",-apple-system,sans-serif', letterSpacing:'-.5px', marginBottom:4 }}>Фестиваль Индии</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.75)' }}>Сегодня · 18:00 · Главная арена</div>
          </div>
        </div>
      </div>

      {/* Passport widget */}
      <div style={{ padding:'0 16px 16px' }}>
        <div className="eth-tap eth-fadeup eth-s1" style={{ borderRadius:20, background:'linear-gradient(160deg,#1B433222,#1B433208)', border:'0.5px solid #1B433240', padding:'14px 16px', cursor:'pointer', display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'#1B433220', border:'1px solid #1B433240', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🌍</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Text",-apple-system,sans-serif' }}>Паспорт путешественника</div>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--egreen)' }}>{stampsCount}/{totalCountries}</span>
            </div>
            <div style={{ height:5, background:'rgba(0,0,0,.08)', borderRadius:3, overflow:'hidden', marginBottom:4 }}>
              <div style={{ height:'100%', width:`${(stampsCount/totalCountries)*100}%`, background:'linear-gradient(90deg,#30D158,#7DEFA1)', borderRadius:3, transition:'width .6s cubic-bezier(.34,1.3,.64,1)' }}/>
            </div>
            <div style={{ fontSize:11, color:'var(--el3)', fontFamily:'"SF Pro Text",-apple-system,sans-serif' }}>
              {stampsCount} стран · {points} баллов · До «Путник» ещё {4-stampsCount}
            </div>
          </div>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="var(--el3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>

      {/* 4 flagship tours */}
      <div style={{ padding:'0 16px 16px' }}>
        <SectionHeader title="4 флагманских тура" sub="Выбери своё путешествие" action="Все туры" />
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {FLAGSHIP_TOURS.map((t, i) => (
            <div key={t.id} className={`eth-tap eth-fadeup eth-s${i+1}`} style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:18, background:'var(--ef2)', border:'0.5px solid var(--es2)', cursor:'pointer', alignItems:'center' }}>
              <div style={{ width:52, height:52, borderRadius:16, background:`${t.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{t.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Text",-apple-system,sans-serif' }}>{t.title}</div>
                  <Badge label={t.badge} color={t.color} />
                </div>
                <div style={{ fontSize:11, color:'var(--el3)', marginBottom:2 }}>{t.sub}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:t.color }}>{t.price}</span>
                  <span style={{ fontSize:11, color:'var(--el4)' }}>· {t.duration}</span>
                </div>
              </div>
              <div style={{ width:32, height:32, borderRadius:16, background:`${t.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={t.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding:'0 16px 16px' }}>
        <SectionHeader title="Быстрые действия" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { emoji:'📷', label:'Сканировать QR', color:'#007AFF', sub:'Открыть страну' },
            { emoji:'🗺️', label:'Карта парка', color:'#34C759', sub:'140 га · GPS' },
            { emoji:'📦', label:'Мои заказы', color:'#FF9500', sub:'2 активных' },
            { emoji:'💳', label:'Купить билет', color:'#AF52DE', sub:'От 990 ₽' },
          ].map(a => (
            <div key={a.label} className="eth-tap" style={{ padding:'14px', borderRadius:18, background:`${a.color}10`, border:`0.5px solid ${a.color}25`, cursor:'pointer' }}>
              <div style={{ fontSize:26, marginBottom:6 }}>{a.emoji}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--el1)', marginBottom:1 }}>{a.label}</div>
              <div style={{ fontSize:10, color:'var(--el3)' }}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today events */}
      <div style={{ padding:'0 16px 16px' }}>
        <SectionHeader title="Ближайшие события" action="Все" />
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
          {EVENTS.slice(0,3).map(e => (
            <div key={e.name} className="eth-tap" style={{ flexShrink:0, width:150, padding:'12px', borderRadius:16, background:'var(--ef2)', border:'0.5px solid var(--es2)', cursor:'pointer' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{e.emoji}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--el1)', marginBottom:4, lineHeight:1.3 }}>{e.name}</div>
              <div style={{ fontSize:10, color:'var(--el3)', marginBottom:2 }}>{e.date}</div>
              <div style={{ fontSize:10, color:'var(--el4)' }}>{e.loc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Development promo */}
      <div style={{ padding:'0 16px 16px' }}>
        <div className="eth-tap" style={{ borderRadius:20, background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'18px', cursor:'pointer', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-10, top:'50%', transform:'translateY(-50%)', fontSize:64, opacity:.15 }}>🏗️</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginBottom:4, fontWeight:600, letterSpacing:1 }}>ETHNOMIR DEVELOPMENT</div>
            <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:4 }}>Живи в Этномире</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', marginBottom:12 }}>Апартаменты от 5.4 млн ₽ · ROI 22%/год</div>
            <div style={{ display:'inline-flex', background:'rgba(255,255,255,.15)', borderRadius:10, padding:'6px 14px', border:'0.5px solid rgba(255,255,255,.2)' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#fff' }}>Узнать подробнее →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: Tours ─────────────────────────────────────────
function ToursTab() {
  const [activeSection, setActiveSection] = useState<'tours'|'mk'|'events'>('tours');

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto', paddingBottom:100 }}>
      {/* Header */}
      <div style={{ padding:'52px 20px 14px' }}>
        <div style={{ fontSize:28, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Display",-apple-system,sans-serif', letterSpacing:'-.6px' }}>Туры</div>
        <div style={{ fontSize:13, color:'var(--el3)', marginTop:2 }}>Флагманские · МК · Фестивали</div>
      </div>

      {/* Segment control */}
      <div style={{ padding:'0 16px 16px' }}>
        <div style={{ display:'flex', background:'var(--ef2)', borderRadius:12, padding:3, gap:2 }}>
          {([['tours','🎫 Туры'],['mk','🎓 Мастер-классы'],['events','🎉 События']] as [typeof activeSection, string][]).map(([k,l]) => (
            <div key={k} className="eth-tap" onClick={() => setActiveSection(k)}
              style={{ flex:1, textAlign:'center', padding:'7px 0', borderRadius:9, background: activeSection===k ? 'var(--eb2)' : 'transparent',
                boxShadow: activeSection===k ? '0 1px 4px rgba(0,0,0,.15)' : 'none',
                transition:'all .2s cubic-bezier(.34,1.2,.64,1)', cursor:'pointer' }}>
              <span style={{ fontSize:11, fontWeight: activeSection===k ? 700 : 400, color: activeSection===k ? 'var(--el1)' : 'var(--el3)', fontFamily:'"SF Pro Text",-apple-system,sans-serif' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flagship tours */}
      {activeSection === 'tours' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {FLAGSHIP_TOURS.map((t, i) => (
              <div key={t.id} className={`eth-tap eth-fadeup eth-s${i+1}`} style={{ borderRadius:22, overflow:'hidden', position:'relative', background:`linear-gradient(135deg,${t.color}dd,${t.color}88)`, cursor:'pointer', padding:'20px' }}>
                <div style={{ position:'absolute', right:-10, top:'50%', transform:'translateY(-50%)', fontSize:80, opacity:.2 }}>{t.emoji}</div>
                <div style={{ position:'relative', zIndex:1 }}>
                  <Badge label={t.badge} color="#fff" />
                  <div style={{ fontSize:20, fontWeight:800, color:'#fff', marginTop:8, marginBottom:4, fontFamily:'"SF Pro Display",-apple-system,sans-serif' }}>{t.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.75)', marginBottom:14 }}>{t.sub}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{t.price}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.6)' }}>/ {t.duration}</div>
                    </div>
                    <div style={{ background:'rgba(255,255,255,.25)', borderRadius:14, padding:'9px 18px', border:'0.5px solid rgba(255,255,255,.3)' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Забронировать</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masterclasses */}
      {activeSection === 'mk' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {MASTERCLASSES.map((mc, i) => (
              <div key={mc.name} className={`eth-tap eth-fadeup eth-s${Math.min(i+1,6)}`} style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:16, background:'var(--ef2)', border:'0.5px solid var(--es2)', cursor:'pointer', alignItems:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'var(--ef3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{mc.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--el1)', marginBottom:2 }}>{mc.name}</div>
                  <div style={{ fontSize:11, color:'var(--el3)' }}>{mc.country} · {mc.dur}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--eblue)' }}>{mc.price}</div>
                  <div style={{ fontSize:10, color:'var(--el4)', marginTop:2 }}>Записаться</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events */}
      {activeSection === 'events' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {EVENTS.map((e, i) => (
              <div key={e.name} className={`eth-tap eth-fadeup eth-s${Math.min(i+1,6)}`} style={{ display:'flex', gap:12, padding:'14px', borderRadius:18, background:'var(--ef2)', border:'0.5px solid var(--es2)', cursor:'pointer' }}>
                <div style={{ width:52, height:52, borderRadius:16, background:'var(--ef3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{e.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--el1)' }}>{e.name}</div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--el3)', marginBottom:1 }}>{e.loc}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, color:'var(--eblue)', fontWeight:600 }}>{e.date}</span>
                    {e.free && <Badge label="Бесплатно" color="var(--egreen)" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: Stay ─────────────────────────────────────────
function StayTab() {
  const [view, setView] = useState<'hotels'|'realestate'>('hotels');

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:100 }}>
      <div style={{ padding:'52px 20px 14px' }}>
        <div style={{ fontSize:28, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Display",-apple-system,sans-serif', letterSpacing:'-.6px' }}>Жильё</div>
        <div style={{ fontSize:13, color:'var(--el3)', marginTop:2 }}>Отели · Глэмпинг · Недвижимость</div>
      </div>

      {/* Segment */}
      <div style={{ padding:'0 16px 16px' }}>
        <div style={{ display:'flex', background:'var(--ef2)', borderRadius:12, padding:3, gap:2 }}>
          {([['hotels','🏨 Снять'],['realestate','🏗️ Купить']] as [typeof view, string][]).map(([k,l]) => (
            <div key={k} className="eth-tap" onClick={() => setView(k)}
              style={{ flex:1, textAlign:'center', padding:'7px 0', borderRadius:9, background: view===k ? 'var(--eb2)' : 'transparent',
                boxShadow: view===k ? '0 1px 4px rgba(0,0,0,.15)' : 'none', transition:'all .2s', cursor:'pointer' }}>
              <span style={{ fontSize:12, fontWeight: view===k ? 700 : 400, color: view===k ? 'var(--el1)' : 'var(--el3)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hotels */}
      {view === 'hotels' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {HOTELS.map((h, i) => (
              <div key={h.name} className={`eth-tap eth-fadeup eth-s${Math.min(i+1,6)}`} style={{ borderRadius:20, overflow:'hidden', background:`linear-gradient(135deg,${h.color}22,${h.color}08)`, border:`0.5px solid ${h.color}40`, padding:'16px', cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <div style={{ width:52, height:52, borderRadius:16, background:`${h.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{h.emoji}</div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'var(--el1)', marginBottom:2 }}>{h.name}</div>
                      <div style={{ fontSize:11, color:'var(--el3)', marginBottom:4 }}>{h.type}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div style={{ width:6, height:6, borderRadius:3, background:'var(--egreen)' }}/>
                        <span style={{ fontSize:10, color:'var(--egreen)', fontWeight:600 }}>{h.rooms} свободно</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:15, fontWeight:800, color:h.color }}>{h.price}</div>
                    <div style={{ marginTop:8, background:`${h.color}20`, borderRadius:10, padding:'6px 12px', border:`0.5px solid ${h.color}40` }}>
                      <span style={{ fontSize:11, fontWeight:700, color:h.color }}>Забронировать</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real estate */}
      {view === 'realestate' && (
        <div style={{ padding:'0 16px' }}>
          {/* Banner */}
          <div style={{ borderRadius:20, background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)', padding:'18px', marginBottom:16, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:-20, bottom:-20, fontSize:80, opacity:.1 }}>🏙️</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', fontWeight:700, letterSpacing:1, marginBottom:6 }}>ETHNOMIR DEVELOPMENT</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:4 }}>Живи в Этномире</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', marginBottom:12 }}>Апартаменты · Виллы · Апарт-отели · Управляемая аренда</div>
            <div style={{ display:'flex', gap:16 }}>
              {[['ROI', 'до 22%'],['Заезд', '2026'],['Площадь', 'от 36м²']].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{v}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.5)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {REAL_ESTATE.map((r, i) => (
              <div key={r.name} className={`eth-tap eth-fadeup eth-s${i+1}`} style={{ borderRadius:20, background:'var(--ef2)', border:'0.5px solid var(--es2)', padding:'16px', cursor:'pointer' }}>
                <div style={{ display:'flex', gap:12, marginBottom:12 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#1a3a5c,#0d1b2a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{r.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--el1)', marginBottom:2 }}>{r.name}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:'var(--el1)' }}>{r.price}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <div style={{ flex:1, background:'#34C75910', borderRadius:10, padding:'8px 10px', border:'0.5px solid #34C75930' }}>
                    <div style={{ fontSize:13, fontWeight:800, color:'var(--egreen)' }}>{r.roi}</div>
                    <div style={{ fontSize:10, color:'var(--el3)' }}>Доходность</div>
                  </div>
                  <div style={{ flex:1, background:'var(--ef3)', borderRadius:10, padding:'8px 10px' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--el1)' }}>{r.income}</div>
                    <div style={{ fontSize:10, color:'var(--el3)' }}>Прогноз дохода</div>
                  </div>
                </div>
                <div style={{ marginTop:10, background:'#0d1b2a', borderRadius:12, padding:'10px', textAlign:'center' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Записаться на показ →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: Services ─────────────────────────────────────
function ServicesTab() {
  const [activeSection, setActiveSection] = useState<'food'|'spa'|'more'>('food');

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:100 }}>
      <div style={{ padding:'52px 20px 14px' }}>
        <div style={{ fontSize:28, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Display",-apple-system,sans-serif', letterSpacing:'-.6px' }}>Сервисы</div>
        <div style={{ fontSize:13, color:'var(--el3)', marginTop:2 }}>Еда · Баня · Прокат · Доставка</div>
      </div>

      {/* Segment */}
      <div style={{ padding:'0 16px 16px' }}>
        <div style={{ display:'flex', background:'var(--ef2)', borderRadius:12, padding:3, gap:2 }}>
          {([['food','🍽️ Рестораны'],['spa','🛁 Баня/СПА'],['more','⚡ Ещё']] as [typeof activeSection, string][]).map(([k,l]) => (
            <div key={k} className="eth-tap" onClick={() => setActiveSection(k)}
              style={{ flex:1, textAlign:'center', padding:'7px 0', borderRadius:9, background: activeSection===k ? 'var(--eb2)' : 'transparent',
                boxShadow: activeSection===k ? '0 1px 4px rgba(0,0,0,.15)' : 'none', transition:'all .2s', cursor:'pointer' }}>
              <span style={{ fontSize:11, fontWeight: activeSection===k ? 700 : 400, color: activeSection===k ? 'var(--el1)' : 'var(--el3)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Food */}
      {activeSection === 'food' && (
        <div style={{ padding:'0 16px' }}>
          {/* Delivery banner */}
          <div className="eth-tap" style={{ borderRadius:16, background:'linear-gradient(135deg,#FF6B35,#FF9500)', padding:'14px 16px', marginBottom:14, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:28 }}>🚚</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Доставка в любую точку парка</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>GPS-доставка к вашей беседке за 20 мин</div>
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {RESTAURANTS.map((r, i) => (
              <div key={r.name} className={`eth-tap eth-fadeup eth-s${Math.min(i+1,6)}`} style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:16, background:'var(--ef2)', border:'0.5px solid var(--es2)', cursor:'pointer', alignItems:'center', opacity: r.open ? 1 : .6 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'var(--ef3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{r.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--el1)', marginBottom:1 }}>{r.name}</div>
                  <div style={{ fontSize:11, color:'var(--el3)' }}>{r.country} · {r.type}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                    <div style={{ width:5, height:5, borderRadius:3, background: r.open ? 'var(--egreen)' : 'var(--el4)' }}/>
                    <span style={{ fontSize:10, color: r.open ? 'var(--egreen)' : 'var(--el3)', fontWeight:600 }}>{r.open ? `Открыт · ${r.wait}` : 'Закрыт'}</span>
                  </div>
                </div>
                <div style={{ padding:'5px 10px', borderRadius:8, background:'var(--eblue)12' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'var(--eblue)' }}>Меню</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spa/banya */}
      {activeSection === 'spa' && (
        <div style={{ padding:'0 16px' }}>
          {[
            { emoji:'🛁', name:'Русская баня «Русь»', type:'Классическая', avail:'3 кабины', price:'3 500 ₽/2ч', color:'#C0392B' },
            { emoji:'🧖', name:'Финская сауна', type:'Сухой жар 85°C', avail:'Есть места', price:'2 500 ₽/2ч', color:'#8B4513' },
            { emoji:'💆', name:'СПА «Восток»', type:'Хаммам + массаж', avail:'2 кабины', price:'4 500 ₽/2ч', color:'#1A5276' },
            { emoji:'🌊', name:'Хаммам «Шри-Ланка»', type:'Турецкая баня', avail:'Запись на завтра', price:'3 800 ₽/2ч', color:'#1E8449' },
          ].map((s, i) => (
            <div key={s.name} className={`eth-tap eth-fadeup eth-s${i+1}`} style={{ borderRadius:18, background:`linear-gradient(135deg,${s.color}15,${s.color}05)`, border:`0.5px solid ${s.color}30`, padding:'16px', marginBottom:10, cursor:'pointer' }}>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:52, height:52, borderRadius:16, background:`${s.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{s.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--el1)', marginBottom:2 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'var(--el3)', marginBottom:4 }}>{s.type}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:5, height:5, borderRadius:3, background:'var(--egreen)' }}/>
                    <span style={{ fontSize:10, color:'var(--egreen)', fontWeight:600 }}>{s.avail}</span>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.price}</div>
                  <div style={{ marginTop:6, background:`${s.color}15`, borderRadius:10, padding:'5px 10px' }}>
                    <span style={{ fontSize:11, fontWeight:700, color:s.color }}>Забронировать</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* More */}
      {activeSection === 'more' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {SERVICES_GRID.map((s, i) => (
              <div key={s.name} className={`eth-tap eth-fadeup eth-s${Math.min(i+1,6)}`} style={{ padding:'16px', borderRadius:18, background:`${s.color}10`, border:`0.5px solid ${s.color}25`, cursor:'pointer', textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{s.emoji}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--el1)' }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 5: Passport ─────────────────────────────────────
function PassportTab() {
  const [section, setSection] = useState<'stamps'|'achievements'|'profile'>('stamps');
  const stamped = COUNTRIES_STAMPS.filter(c => c.unlocked).length;
  const total = COUNTRIES_STAMPS.length;

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:100 }}>
      {/* Header with passport */}
      <div style={{ padding:'52px 20px 0' }}>
        <div style={{ fontSize:28, fontWeight:700, color:'var(--el1)', fontFamily:'"SF Pro Display",-apple-system,sans-serif', letterSpacing:'-.6px', marginBottom:14 }}>Паспорт</div>

        {/* Passport card */}
        <div style={{ borderRadius:24, background:'linear-gradient(135deg,#1a2a1a,#2d4a2d)', padding:'20px', marginBottom:16, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-10, top:-10, fontSize:80, opacity:.08 }}>🌍</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', fontWeight:700, letterSpacing:1.5 }}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
                <div style={{ fontSize:18, fontWeight:800, color:'#fff', marginTop:4 }}>Гражданин Мира</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginTop:2 }}>Уровень: Путник</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:14, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🌐</div>
            </div>
            <div style={{ display:'flex', gap:20, marginBottom:14 }}>
              {[['Стран', stamped, '#7DEFA1'],['Баллов', 150, '#FFD60A'],['Уровень', 1, '#5E9CFF']].map(([l,v,c]) => (
                <div key={l as string}>
                  <div style={{ fontSize:20, fontWeight:800, color:c as string }}>{v}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.5)' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ height:5, background:'rgba(255,255,255,.1)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(stamped/total)*100}%`, background:'linear-gradient(90deg,#30D158,#7DEFA1)', borderRadius:3 }}/>
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginTop:4 }}>{stamped} из {total} стран открыто</div>
          </div>
        </div>
      </div>

      {/* Segment */}
      <div style={{ padding:'0 20px 16px' }}>
        <div style={{ display:'flex', background:'var(--ef2)', borderRadius:12, padding:3, gap:2 }}>
          {([['stamps','🗺️ Страны'],['achievements','🏆 Ачивки'],['profile','👤 Профиль']] as [typeof section, string][]).map(([k,l]) => (
            <div key={k} className="eth-tap" onClick={() => setSection(k)}
              style={{ flex:1, textAlign:'center', padding:'7px 0', borderRadius:9, background: section===k ? 'var(--eb2)' : 'transparent',
                boxShadow: section===k ? '0 1px 4px rgba(0,0,0,.15)' : 'none', transition:'all .2s', cursor:'pointer' }}>
              <span style={{ fontSize:11, fontWeight: section===k ? 700 : 400, color: section===k ? 'var(--el1)' : 'var(--el3)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stamps grid */}
      {section === 'stamps' && (
        <div style={{ padding:'0 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {COUNTRIES_STAMPS.map((c, i) => (
              <div key={c.id} className={`eth-tap eth-fadeup eth-s${Math.min((i%6)+1,6)}`}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 6px',
                  borderRadius:14, background: c.unlocked ? 'var(--ef2)' : 'var(--ef3)',
                  border: c.unlocked ? '0.5px solid var(--egreen)40' : '0.5px solid var(--es2)',
                  cursor:'pointer', opacity: c.unlocked ? 1 : .55, position:'relative', overflow:'hidden' }}>
                {c.unlocked && <div style={{ position:'absolute', top:4, right:4, width:6, height:6, borderRadius:3, background:'var(--egreen)' }}/>}
                <div style={{ fontSize:24 }}>{c.flag}</div>
                <div style={{ fontSize:9, fontWeight:600, color: c.unlocked ? 'var(--el1)' : 'var(--el3)', textAlign:'center', lineHeight:1.2 }}>{c.name}</div>
                {!c.unlocked && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(242,242,247,.4)' }}>
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><rect x="1" y="5.5" width="10" height="8" rx="2" stroke="var(--el3)" strokeWidth="1.4"/><path d="M3.5 5.5V4a2.5 2.5 0 015 0v1.5" stroke="var(--el3)" strokeWidth="1.4"/></svg>
                </div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, padding:'12px 14px', borderRadius:16, background:'linear-gradient(135deg,#007AFF10,#007AFF05)', border:'0.5px solid #007AFF30', textAlign:'center' }}>
            <div style={{ fontSize:13, color:'var(--eblue)', fontWeight:600 }}>Сканируй QR-коды у павильонов, чтобы открывать страны 📷</div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {section === 'achievements' && (
        <div style={{ padding:'0 20px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { emoji:'🌱', name:'Первые шаги', desc:'Открой первую страну', done:true, color:'#34C759' },
              { emoji:'🗺️', name:'Картограф', desc:'Открой 10 стран', done:false, progress:3, total:10, color:'#007AFF' },
              { emoji:'🍽️', name:'Гастроном', desc:'Посети 5 ресторанов', done:false, progress:1, total:5, color:'#FF9500' },
              { emoji:'🏺', name:'Мастер', desc:'Пройди 3 мастер-класса', done:false, progress:0, total:3, color:'#AF52DE' },
              { emoji:'🏆', name:'Гражданин Мира', desc:'Открой все 40 стран', done:false, progress:3, total:40, color:'#FFD60A' },
            ].map((a, i) => (
              <div key={a.name} className={`eth-tap eth-fadeup eth-s${i+1}`}
                style={{ display:'flex', gap:12, padding:'14px', borderRadius:18, background: a.done ? `${a.color}12` : 'var(--ef2)',
                  border:`0.5px solid ${a.done ? a.color+'40' : 'var(--es2)'}`, cursor:'pointer', alignItems:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${a.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{a.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--el1)', marginBottom:2 }}>{a.name}</div>
                  <div style={{ fontSize:11, color:'var(--el3)', marginBottom:a.done ? 0 : 6 }}>{a.desc}</div>
                  {!a.done && a.progress !== undefined && (
                    <>
                      <div style={{ height:4, background:'var(--ef3)', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(a.progress/a.total!)*100}%`, background:a.color, borderRadius:2 }}/>
                      </div>
                      <div style={{ fontSize:10, color:'var(--el4)', marginTop:2 }}>{a.progress} / {a.total}</div>
                    </>
                  )}
                </div>
                {a.done && <div style={{ width:24, height:24, borderRadius:12, background:`${a.color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={a.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      {section === 'profile' && (
        <div style={{ padding:'0 20px' }}>
          {/* Profile card */}
          <div style={{ display:'flex', gap:14, padding:'16px', borderRadius:20, background:'var(--ef2)', border:'0.5px solid var(--es2)', marginBottom:14, alignItems:'center' }}>
            <div style={{ width:60, height:60, borderRadius:20, background:'linear-gradient(135deg,#007AFF,#5856D6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>👤</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:17, fontWeight:700, color:'var(--el1)', marginBottom:2 }}>Гость</div>
              <div style={{ fontSize:12, color:'var(--el3)', marginBottom:4 }}>Путник · 150 баллов</div>
              <div className="eth-tap" style={{ display:'inline-block', padding:'4px 12px', borderRadius:8, background:'var(--eblue)12', cursor:'pointer' }}>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--eblue)' }}>Войти / Зарегистрироваться</span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          {[
            { emoji:'📦', label:'Мои заказы', sub:'2 активных' },
            { emoji:'💎', label:'Подписка «Посол Мира»', sub:'990 ₽/мес · 30 дней бесплатно' },
            { emoji:'🏘️', label:'Моя недвижимость', sub:'Управление объектами' },
            { emoji:'💰', label:'Баллы лояльности', sub:'150 баллов' },
            { emoji:'🤝', label:'Пригласить друга', sub:'+150 баллов за каждого' },
            { emoji:'⚙️', label:'Настройки', sub:'Уведомления, язык, тема' },
          ].map(item => (
            <div key={item.label} className="eth-tap" style={{ display:'flex', gap:12, padding:'14px', borderRadius:16, background:'var(--ef2)', border:'0.5px solid var(--es2)', marginBottom:8, cursor:'pointer', alignItems:'center' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'var(--ef3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{item.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--el1)' }}>{item.label}</div>
                <div style={{ fontSize:11, color:'var(--el3)', marginTop:1 }}>{item.sub}</div>
              </div>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="var(--el3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TabBar ───────────────────────────────────────────────
function TabBar({ active, onSelect }: { active:Tab; onSelect:(t:Tab)=>void }) {
  const TABS: { id:Tab; label:string; icon:(active:boolean)=>React.ReactNode }[] = [
    {
      id:'home', label:'Главная',
      icon:(a) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?"#000":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    },
    {
      id:'tours', label:'Туры',
      icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
    },
    {
      id:'stay', label:'Жильё',
      icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><rect x="9" y="12" width="6" height="9" rx="1" fill={a?"#fff":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8"/></svg>
    },
    {
      id:'services', label:'Сервисы',
      icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
    },
    {
      id:'passport', label:'Паспорт',
      icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><circle cx="12" cy="11" r="3" stroke={a?"#fff":"var(--el3)"} fill="none" strokeWidth="1.5"/><path d="M6 20v-1a6 6 0 0112 0v1" stroke={a?"#fff":"var(--el3)"} strokeWidth="1.5"/></svg>
    },
  ];

  return (
    <div style={{ position:'fixed', bottom:20, left:0, right:0, display:'flex', justifyContent:'center', zIndex:100, pointerEvents:'none' }}>
      <div className="eth-glass-premium" style={{ pointerEvents:'all', display:'flex', alignItems:'center', padding:'0 8px', height:64, borderRadius:36, gap:0 }}>
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <div key={tab.id} className="eth-tap"
              onClick={() => onSelect(tab.id)}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'10px 14px 8px', cursor:'pointer', position:'relative', transition:'transform .12s cubic-bezier(.34,1.5,.64,1)' }}>
              {isActive && <div style={{ position:'absolute', inset:'5px 6px', borderRadius:14, background:'rgba(0,0,0,.07)' }}/>}
              <div style={{ position:'relative', zIndex:1 }}>{tab.icon(isActive)}</div>
              <span style={{ fontSize:10, fontFamily:'"SF Pro Text",-apple-system,sans-serif', fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--el1)' : 'var(--el3)', marginTop:3, letterSpacing:'-.1px', position:'relative', zIndex:1 }}>
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <>
      <style>{CSS}</style>
      <div className="eth-root" style={{ width:'100%', maxWidth:390, height:'100dvh', margin:'0 auto', display:'flex', flexDirection:'column', background:'var(--eb)', overflow:'hidden', position:'relative' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {tab === 'home'     && <HomeTab />}
          {tab === 'tours'    && <ToursTab />}
          {tab === 'stay'     && <StayTab />}
          {tab === 'services' && <ServicesTab />}
          {tab === 'passport' && <PassportTab />}
        </div>
        <TabBar active={tab} onSelect={setTab} />
      </div>
    </>
  );
}
