'use client';
// @ts-nocheck
import { useState, useEffect } from 'react';

const FD = '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif';
const FT = '"SF Pro Text",-apple-system,BlinkMacSystemFont,sans-serif';

type Tab = 'home' | 'tours' | 'stay' | 'services' | 'passport';

const HERO_SLIDES = [
  { id:1, emoji:'🎭', title:'Фестиваль Индии', sub:'Сегодня · 18:00 · Главная арена', badge:'Сегодня', gradient:'linear-gradient(135deg,#7B1D1D,#C0392B,#E91E63)' },
  { id:2, emoji:'🌸', title:'Сакура Фестиваль', sub:'15 марта · 12:00 · Японский сад', badge:'Через 7 дней', gradient:'linear-gradient(135deg,#1a1a3e,#6B2FA0,#FF6B9D)' },
  { id:3, emoji:'🥁', title:'Навруз 2026', sub:'21 марта · Весь день · Этнодворы', badge:'Бесплатно', gradient:'linear-gradient(135deg,#0d2b1d,#1a6b3a,#30D158)' },
  { id:4, emoji:'🏮', title:'Праздник фонарей', sub:'5 апреля · 20:00 · Китайский павильон', badge:'Скоро', gradient:'linear-gradient(135deg,#4a1500,#c0390b,#FF9500)' },
];
const OPEN_NOW = [
  { emoji:'🍜', name:'Пад Тай', sub:'15 мин', color:'#FF6B35' },
  { emoji:'💆', name:'СПА Восток', sub:'Есть места', color:'#9B59B6' },
  { emoji:'🎭', name:'Шоу Индии', sub:'18:00', color:'#E91E63' },
  { emoji:'🐺', name:'Хаски-парк', sub:'Открыт', color:'#5D4037' },
  { emoji:'🧖', name:'Баня Русь', sub:'3 кабины', color:'#C0392B' },
  { emoji:'🏹', name:'Тир', sub:'Открыт', color:'#E67E22' },
  { emoji:'🎻', name:'Живая музыка', sub:'Каждый час', color:'#8E44AD' },
  { emoji:'🧁', name:'Кондитерская', sub:'До 22:00', color:'#F39C12' },
];
const SERVICES_GRID_ALL = [
  { emoji:'🌍', name:'Страны', color:'#007AFF' },{ emoji:'🎫', name:'Билеты', color:'#FF3B30' },
  { emoji:'🏨', name:'Отели', color:'#FF9500' },{ emoji:'🍜', name:'Рестораны', color:'#FF6B35' },
  { emoji:'🛁', name:'Баня', color:'#C0392B' },{ emoji:'💆', name:'СПА', color:'#AF52DE' },
  { emoji:'🎉', name:'События', color:'#34C759' },{ emoji:'🧩', name:'Квесты', color:'#5856D6' },
  { emoji:'🎓', name:'Мастер-классы', color:'#007AFF' },{ emoji:'🚌', name:'Экскурсии', color:'#00C7BE' },
  { emoji:'🐾', name:'Зоопарк', color:'#8B4513' },{ emoji:'🏛', name:'Музеи', color:'#546E7A' },
  { emoji:'🗿', name:'Памятники', color:'#607D8B' },{ emoji:'🖼', name:'Выставки', color:'#E91E63' },
  { emoji:'⛺', name:'Глэмпинг', color:'#1E8449' },{ emoji:'🚗', name:'Транспорт', color:'#2471A3' },
  { emoji:'🏘', name:'Недвижимость', color:'#1a3a5c' },{ emoji:'🤝', name:'Франшиза', color:'#4CAF50' },
  { emoji:'🎡', name:'Аттракционы', color:'#FF9800' },{ emoji:'💍', name:'Свадьбы', color:'#E91E63' },
  { emoji:'🚐', name:'Автотуры', color:'#009688' },{ emoji:'📸', name:'Фото', color:'#FF5722' },
  { emoji:'🎧', name:'Аудиогид', color:'#9C27B0' },{ emoji:'🛍', name:'Магазины', color:'#F57F17' },
  { emoji:'🌏', name:'Этнодворы', color:'#2E7D32' },
];
const FLAGSHIP_TOURS = [
  { id:1, emoji:'🌏', title:'Мир за день', sub:'40 стран · 8 часов · Хит продаж', price:'2 900 ₽', duration:'1 день', badge:'Хит', color:'#C0392B', includes:['Билет на весь день','Карта парка','Аудиогид','Бонус 50 баллов'] },
  { id:2, emoji:'🗺️', title:'Кругосветка за выходные', sub:'Азия + Европа + Америка', price:'13 900 ₽', duration:'3 дня', badge:'Популярно', color:'#2471A3', includes:['2 ночи в отеле','Завтраки включены','Мастер-класс ×2','Экскурсионные туры'] },
  { id:3, emoji:'🌐', title:'Планета за неделю', sub:'Все 40 стран · Сертификат посла', price:'34 900 ₽', duration:'7 дней', badge:'Премиум', color:'#1E8449', includes:['7 ночей','Все питание','Неограниченные МК','Диплом Гражданина Мира'] },
  { id:4, emoji:'🇷🇺', title:'Погружение в Россию', sub:'85 регионов · Баня · Ремёсла', price:'9 900 ₽', duration:'2 дня', badge:'Новинка', color:'#7D3C98', includes:['1 ночь','Русская баня','МК по ремёслам','Дегустация блюд'] },
];
const MASTERCLASSES = [
  { emoji:'🏺', name:'Гончарный круг', price:'1 200 ₽', dur:'90 мин', country:'🇷🇺 Россия', avail:'3 места' },
  { emoji:'🪆', name:'Роспись матрёшки', price:'900 ₽', dur:'60 мин', country:'🇷🇺 Россия', avail:'5 мест' },
  { emoji:'🍱', name:'Суши-мастер', price:'1 500 ₽', dur:'90 мин', country:'🇯🇵 Япония', avail:'2 места' },
  { emoji:'🖌️', name:'Японская каллиграфия', price:'1 000 ₽', dur:'60 мин', country:'🇯🇵 Япония', avail:'8 мест' },
  { emoji:'🍛', name:'Индийские специи', price:'1 200 ₽', dur:'60 мин', country:'🇮🇳 Индия', avail:'4 места' },
  { emoji:'💃', name:'Танец живота', price:'700 ₽', dur:'60 мин', country:'🇪🇬 Египет', avail:'10 мест' },
  { emoji:'☕', name:'Турецкий кофе', price:'800 ₽', dur:'45 мин', country:'🇹🇷 Турция', avail:'6 мест' },
  { emoji:'🌹', name:'Фламенко базовый', price:'800 ₽', dur:'60 мин', country:'🇪🇸 Испания', avail:'7 мест' },
  { emoji:'🍵', name:'Чайная церемония', price:'1 000 ₽', dur:'60 мин', country:'🇨🇳 Китай', avail:'5 мест' },
  { emoji:'🎨', name:'Батик — роспись ткани', price:'1 400 ₽', dur:'90 мин', country:'🇮🇩 Индонезия', avail:'3 места' },
  { emoji:'🎭', name:'Бурятский танец', price:'600 ₽', dur:'45 мин', country:'🇷🇺 Бурятия', avail:'12 мест' },
  { emoji:'🪘', name:'Африканские барабаны', price:'900 ₽', dur:'60 мин', country:'🌍 Африка', avail:'8 мест' },
];
const EVENTS = [
  { emoji:'🌺', name:'Навруз — Встреча Нового года', date:'Через 13 дней', loc:'Этнодвор Ср. Азии', free:true, color:'#30D158' },
  { emoji:'🌸', name:'Сакура Фестиваль', date:'Через 7 дней', loc:'Японский павильон', free:true, color:'#FF2D55' },
  { emoji:'🐣', name:'Пасхальная ярмарка', date:'Через 20 дней', loc:'Главная площадь', free:true, color:'#FF9500' },
  { emoji:'🥁', name:'Всемирный день музыки', date:'Через 40 дней', loc:'Амфитеатр', free:true, color:'#AF52DE' },
  { emoji:'🏆', name:'Кулинарный чемпионат', date:'Через 75 дней', loc:'Кулинарный театр', free:false, color:'#FFD60A' },
  { emoji:'🎪', name:'Летний фестиваль', date:'Через 90 дней', loc:'Вся территория', free:false, color:'#007AFF' },
];
const HOTELS = [
  { emoji:'🏯', name:'Замок Японии', type:'Аутентичный японский стиль', price:'12 000 ₽', rooms:4, rating:'4.9', reviews:128, color:'#C0392B' },
  { emoji:'🕌', name:'Дворец Индии', type:'Могольская архитектура', price:'9 500 ₽', rooms:2, rating:'4.8', reviews:96, color:'#E67E22' },
  { emoji:'🏰', name:'Замок Франции', type:'Нормандский шато', price:'14 000 ₽', rooms:6, rating:'5.0', reviews:64, color:'#2C3E50' },
  { emoji:'⛺', name:'Монгольская юрта', type:'Глэмпинг премиум', price:'6 500 ₽', rooms:8, rating:'4.7', reviews:212, color:'#8B6914' },
  { emoji:'🏡', name:'Изба Руси', type:'Русский традиционный', price:'7 000 ₽', rooms:3, rating:'4.9', reviews:183, color:'#1A5276' },
  { emoji:'🌴', name:'Бунгало Шри-Ланки', type:'Тропический стиль', price:'11 000 ₽', rooms:1, rating:'4.8', reviews:77, color:'#1E8449' },
  { emoji:'🪆', name:'Терем Ярославля', type:'Русский теремок', price:'8 500 ₽', rooms:5, rating:'4.9', reviews:142, color:'#7D3C98' },
  { emoji:'🏟️', name:'Вилла Средиземноморья', type:'Итало-греческий стиль', price:'13 500 ₽', rooms:2, rating:'4.9', reviews:91, color:'#2980B9' },
];
const REAL_ESTATE = [
  { emoji:'🏙️', name:'Студия «Азия» 36м²', price:'5 400 000 ₽', priceM2:'150 000 ₽/м²', roi:'22% ROI', income:'99 000 ₽/мес', floor:'3 этаж', badge:'Хит' },
  { emoji:'🏢', name:'Апарт «Европа» 52м²', price:'8 100 000 ₽', priceM2:'155 769 ₽/м²', roi:'19.5% ROI', income:'131 625 ₽/мес', floor:'5 этаж', badge:'Популярно' },
  { emoji:'🏛️', name:'Вилла «Шри-Ланка» 120м²', price:'22 000 000 ₽', priceM2:'183 333 ₽/м²', roi:'15% ROI', income:'275 000 ₽/мес', floor:'1 этаж + двор', badge:'Топ' },
];
const RESTAURANTS = [
  { emoji:'🍜', name:'Пад Тай', country:'🇹🇭 Таиланд', type:'Азиатская', wait:'15 мин', open:true, avg:'600 ₽' },
  { emoji:'🍛', name:'Индийская душа', country:'🇮🇳 Индия', type:'Индийская', wait:'20 мин', open:true, avg:'750 ₽' },
  { emoji:'🥘', name:'Турецкий дворик', country:'🇹🇷 Турция', type:'Средиземноморская', wait:'10 мин', open:true, avg:'800 ₽' },
  { emoji:'🍣', name:'Сакура', country:'🇯🇵 Япония', type:'Японская', wait:'25 мин', open:true, avg:'1 200 ₽' },
  { emoji:'🌮', name:'Фиеста', country:'🇲🇽 Мексика', type:'Мексиканская', wait:'5 мин', open:true, avg:'650 ₽' },
  { emoji:'🥗', name:'Русский двор', country:'🇷🇺 Россия', type:'Русская', wait:'10 мин', open:true, avg:'900 ₽' },
  { emoji:'🍝', name:'Тратория Рима', country:'🇮🇹 Италия', type:'Итальянская', wait:'30 мин', open:false, avg:'1 100 ₽' },
  { emoji:'🥙', name:'Кебаб Марракеш', country:'🇲🇦 Марокко', type:'Ближневосточная', wait:'15 мин', open:true, avg:'700 ₽' },
  { emoji:'🫕', name:'Эфиопский котёл', country:'🇪🇹 Эфиопия', type:'Африканская', wait:'20 мин', open:true, avg:'850 ₽' },
  { emoji:'🥟', name:'Дим-сам Шанхай', country:'🇨🇳 Китай', type:'Китайская', wait:'15 мин', open:true, avg:'950 ₽' },
];
const BANYA = [
  { emoji:'🛁', name:'Русская баня «Русь»', type:'Классическая · Дрова · до 8 чел', avail:'3 кабины', price:'3 500 ₽/2ч', color:'#C0392B' },
  { emoji:'🔥', name:'Финская сауна', type:'Сухой жар 85°C · до 6 чел', avail:'Есть места', price:'2 500 ₽/2ч', color:'#8B4513' },
  { emoji:'💆', name:'СПА «Восток»', type:'Хаммам + 4 вида массажа', avail:'2 кабины', price:'4 500 ₽/2ч', color:'#1A5276' },
  { emoji:'🌊', name:'Хаммам «Шри-Ланка»', type:'Турецкая баня + бассейн', avail:'Запись на завтра', price:'3 800 ₽/2ч', color:'#1E8449' },
  { emoji:'🌿', name:'Японская офуро', type:'Кедровая бочка · до 2 чел', avail:'1 место', price:'2 200 ₽/ч', color:'#2E7D32' },
];
const COUNTRIES_ALL = [
  { id:'russia', flag:'🇷🇺', name:'Россия', unlocked:true, stamps:3 },
  { id:'china', flag:'🇨🇳', name:'Китай', unlocked:true, stamps:1 },
  { id:'india', flag:'🇮🇳', name:'Индия', unlocked:true, stamps:2 },
  { id:'japan', flag:'🇯🇵', name:'Япония', unlocked:false, stamps:0 },
  { id:'egypt', flag:'🇪🇬', name:'Египет', unlocked:false, stamps:0 },
  { id:'turkey', flag:'🇹🇷', name:'Турция', unlocked:false, stamps:0 },
  { id:'france', flag:'🇫🇷', name:'Франция', unlocked:false, stamps:0 },
  { id:'italy', flag:'🇮🇹', name:'Италия', unlocked:false, stamps:0 },
  { id:'spain', flag:'🇪🇸', name:'Испания', unlocked:false, stamps:0 },
  { id:'germany', flag:'🇩🇪', name:'Германия', unlocked:false, stamps:0 },
  { id:'greece', flag:'🇬🇷', name:'Греция', unlocked:false, stamps:0 },
  { id:'brazil', flag:'🇧🇷', name:'Бразилия', unlocked:false, stamps:0 },
  { id:'mexico', flag:'🇲🇽', name:'Мексика', unlocked:false, stamps:0 },
  { id:'usa', flag:'🇺🇸', name:'США', unlocked:false, stamps:0 },
  { id:'uk', flag:'🇬🇧', name:'Великобритания', unlocked:false, stamps:0 },
  { id:'srilanka', flag:'🇱🇰', name:'Шри-Ланка', unlocked:false, stamps:0 },
  { id:'thailand', flag:'🇹🇭', name:'Таиланд', unlocked:false, stamps:0 },
  { id:'vietnam', flag:'🇻🇳', name:'Вьетнам', unlocked:false, stamps:0 },
  { id:'mongolia', flag:'🇲🇳', name:'Монголия', unlocked:false, stamps:0 },
  { id:'iran', flag:'🇮🇷', name:'Иран', unlocked:false, stamps:0 },
  { id:'morocco', flag:'🇲🇦', name:'Марокко', unlocked:false, stamps:0 },
  { id:'kenya', flag:'🇰🇪', name:'Кения', unlocked:false, stamps:0 },
  { id:'peru', flag:'🇵🇪', name:'Перу', unlocked:false, stamps:0 },
  { id:'indonesia', flag:'🇮🇩', name:'Индонезия', unlocked:false, stamps:0 },
  { id:'korea', flag:'🇰🇷', name:'Корея', unlocked:false, stamps:0 },
  { id:'ethiopia', flag:'🇪🇹', name:'Эфиопия', unlocked:false, stamps:0 },
  { id:'argentina', flag:'🇦🇷', name:'Аргентина', unlocked:false, stamps:0 },
  { id:'portugal', flag:'🇵🇹', name:'Португалия', unlocked:false, stamps:0 },
  { id:'georgia', flag:'🇬🇪', name:'Грузия', unlocked:false, stamps:0 },
  { id:'armenia', flag:'🇦🇲', name:'Армения', unlocked:false, stamps:0 },
  { id:'uzbekistan', flag:'🇺🇿', name:'Узбекистан', unlocked:false, stamps:0 },
  { id:'kazakhstan', flag:'🇰🇿', name:'Казахстан', unlocked:false, stamps:0 },
  { id:'azerbaijan', flag:'🇦🇿', name:'Азербайджан', unlocked:false, stamps:0 },
  { id:'nepal', flag:'🇳🇵', name:'Непал', unlocked:false, stamps:0 },
  { id:'cuba', flag:'🇨🇺', name:'Куба', unlocked:false, stamps:0 },
  { id:'israel', flag:'🇮🇱', name:'Израиль', unlocked:false, stamps:0 },
  { id:'sweden', flag:'🇸🇪', name:'Швеция', unlocked:false, stamps:0 },
  { id:'norway', flag:'🇳🇴', name:'Норвегия', unlocked:false, stamps:0 },
  { id:'myanmar', flag:'🇲🇲', name:'Мьянма', unlocked:false, stamps:0 },
  { id:'ukraine', flag:'🇺🇦', name:'Украина', unlocked:false, stamps:0 },
];
const ACHIEVEMENTS = [
  { emoji:'🌱', name:'Первые шаги', desc:'Открой первую страну', done:true, color:'#34C759', progress:1, total:1 },
  { emoji:'🗺️', name:'Картограф', desc:'Открой 10 стран', done:false, progress:3, total:10, color:'#007AFF' },
  { emoji:'🍽️', name:'Гастроном', desc:'Посети 5 ресторанов', done:false, progress:1, total:5, color:'#FF9500' },
  { emoji:'🏺', name:'Мастер', desc:'Пройди 3 мастер-класса', done:false, progress:0, total:3, color:'#AF52DE' },
  { emoji:'🛁', name:'Знаток бань', desc:'Посети 3 бани мира', done:false, progress:1, total:3, color:'#C0392B' },
  { emoji:'🌍', name:'Исследователь', desc:'Посети 20 стран', done:false, progress:3, total:20, color:'#5856D6' },
  { emoji:'🏆', name:'Гражданин Мира', desc:'Открой все 40 стран', done:false, progress:3, total:40, color:'#FFD60A' },
  { emoji:'💎', name:'Посол Мира', desc:'Набери 10 000 баллов', done:false, progress:150, total:10000, color:'#FF2D55' },
];

const CSS = `
  html,body{height:100%;overflow:hidden;margin:0;padding:0}
  .eth{--eb:#F2F2F7;--eb2:#fff;--ef2:rgba(120,120,128,.13);--ef3:rgba(120,120,128,.08);
    --el1:#000;--el2:rgba(60,60,67,.65);--el3:rgba(60,60,67,.4);--el4:rgba(60,60,67,.2);
    --es2:rgba(60,60,67,.14);--eblue:#007AFF;--egreen:#34C759;--ered:#FF3B30;--eor:#FF9500;--epu:#AF52DE;color-scheme:light}
  .eth *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;min-height:0}
  .eth ::-webkit-scrollbar{display:none}
  @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  .fu{animation:fu .38s cubic-bezier(.25,.46,.45,.94) both}
  .fi{animation:fi .25s ease both}
  .s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}.s4{animation-delay:.2s}.s5{animation-delay:.25s}.s6{animation-delay:.3s}
  .tap{cursor:pointer;transition:transform .18s cubic-bezier(.34,1.5,.64,1),opacity .12s}
  .tap:active{transform:scale(.92);opacity:.7;transition:transform .06s,opacity .06s}
  .glass-p{backdrop-filter:blur(60px) saturate(220%) brightness(1.08);-webkit-backdrop-filter:blur(60px) saturate(220%) brightness(1.08);
    background:rgba(255,255,255,.72);border:.5px solid rgba(0,0,0,.08);
    box-shadow:inset 0 1.5px 0 rgba(255,255,255,.9),inset 0 -.5px 0 rgba(0,0,0,.04),0 8px 40px rgba(0,0,0,.16)}
  .live-dot::before{content:'';width:6px;height:6px;border-radius:50%;background:#ff3b30;display:inline-block;margin-right:4px;animation:pulse .8s ease-in-out infinite}
`;

function Seg({ items, val, onChange }: { items:[string,string][], val:string, onChange:(v:string)=>void }) {
  return (
    <div style={{display:'flex',background:'var(--ef2)',borderRadius:12,padding:3,gap:2,margin:'0 16px 16px'}}>
      {items.map(([k,l]) => (
        <div key={k} className="tap" onClick={()=>onChange(k)}
          style={{flex:1,textAlign:'center',padding:'7px 0',borderRadius:9,background:val===k?'var(--eb2)':'transparent',
            boxShadow:val===k?'0 1px 4px rgba(0,0,0,.15)':'none',transition:'all .2s',cursor:'pointer'}}>
          <span style={{fontSize:11,fontWeight:val===k?700:400,color:val===k?'var(--el1)':'var(--el3)',fontFamily:FT}}>{l}</span>
        </div>
      ))}
    </div>
  );
}
function Chevron({ c='var(--el3)' }:any) {
  return <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Bdg({ label, color }:any) {
  return <span style={{display:'inline-block',padding:'2px 7px',background:`${color}22`,borderRadius:6,border:`.5px solid ${color}44`,fontSize:10,fontWeight:700,color,fontFamily:FT}}>{label}</span>;
}

// ── HOME ─────────────────────────────────────────────────
function HomeTab() {
  const [slide, setSlide] = useState(0);
  useEffect(() => { const t = setInterval(()=>setSlide(s=>(s+1)%HERO_SLIDES.length),4000); return ()=>clearInterval(t); },[]);
  const sl = HERO_SLIDES[slide];
  const stamped=3, total=40, pts=150;

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Header */}
      <div style={{position:'sticky',top:0,zIndex:50,padding:'52px 20px 14px',background:'transparent'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:12,color:'var(--el3)',fontFamily:FT}}>Добрый день 👋</div>
            <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px',lineHeight:1.1,marginTop:1}}>Этномир</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {['🔍','🔔'].map((ic,i) => (
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
            <div style={{display:'flex',gap:6,alignItems:'baseline'}}>
              <span style={{fontSize:22,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.5px'}}>+8°</span>
              <span style={{fontSize:12,color:'var(--el3)',fontFamily:FT}}>Этномир · Сейчас</span>
            </div>
            <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginTop:1}}>Переменная облачность · Ветер 5 м/с</div>
          </div>
          <div style={{textAlign:'right'}}><div style={{fontSize:10,color:'var(--el4)'}}>Сегодня</div><div style={{fontSize:11,color:'var(--el2)',fontFamily:FT}}>+6° / +11°</div></div>
        </div>
      </div>

      {/* Hero carousel */}
      <div style={{padding:'0 16px 14px'}}>
        <div className="tap" style={{borderRadius:24,overflow:'hidden',position:'relative',height:178,background:sl.gradient,cursor:'pointer'}}>
          <div style={{position:'absolute',right:-16,top:'50%',transform:'translateY(-50%)',fontSize:92,opacity:.2}}>{sl.emoji}</div>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(0,0,0,.35),transparent 60%)'}}/>
          <div style={{position:'absolute',top:14,left:16}}>
            <span style={{background:'rgba(255,255,255,.22)',backdropFilter:'blur(8px)',borderRadius:8,padding:'3px 10px',border:'.5px solid rgba(255,255,255,.3)',fontSize:10,color:'#fff',fontWeight:700,fontFamily:FT}}>{sl.badge}</span>
          </div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:16}}>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>{sl.title}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.75)',fontFamily:FT}}>{sl.sub}</div>
          </div>
          <div style={{position:'absolute',bottom:14,right:16,display:'flex',gap:5}}>
            {HERO_SLIDES.map((_,i) => <div key={i} style={{width:i===slide?18:6,height:5,borderRadius:3,background:i===slide?'#fff':'rgba(255,255,255,.4)',transition:'width .35s'}}/>)}
          </div>
        </div>
      </div>

      {/* Passport */}
      <div style={{padding:'0 16px 16px'}}>
        <div className="tap fu s1" style={{borderRadius:20,background:'linear-gradient(160deg,#1B433222,#1B433208)',border:'.5px solid #1B433240',padding:'14px 16px',display:'flex',gap:14,alignItems:'center'}}>
          <div style={{width:48,height:48,borderRadius:14,background:'#1B433220',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🌍</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>Паспорт путешественника</span>
              <span style={{fontSize:12,fontWeight:700,color:'var(--egreen)'}}>{stamped}/{total}</span>
            </div>
            <div style={{height:5,background:'rgba(0,0,0,.08)',borderRadius:3,overflow:'hidden',marginBottom:4}}>
              <div style={{height:'100%',width:`${(stamped/total)*100}%`,background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT}}>{stamped} стран · {pts} баллов · До «Путник» ещё {4-stamped}</div>
          </div>
          <Chevron/>
        </div>
      </div>

      {/* Open Now */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px'}}>Открыто сейчас</div>
            <div style={{fontSize:11,color:'var(--egreen)',fontFamily:FT,marginTop:1}}><span className="live-dot"/>{OPEN_NOW.length} мест · Живой статус</div>
          </div>
          <div className="tap" style={{padding:'5px 10px',background:'rgba(0,122,255,.1)',borderRadius:8}}>
            <span style={{fontSize:11,color:'var(--eblue)',fontFamily:FT,fontWeight:600}}>Карта</span>
          </div>
        </div>
        <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:2}}>
          {OPEN_NOW.map(p => (
            <div key={p.name} className="tap" style={{flexShrink:0,width:88}}>
              <div style={{width:88,height:72,borderRadius:16,background:`${p.color}15`,border:`.5px solid ${p.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,marginBottom:6,position:'relative'}}>
                {p.emoji}
                <div style={{position:'absolute',bottom:5,right:5,width:8,height:8,borderRadius:4,background:'var(--egreen)',border:'1.5px solid var(--eb)'}}/>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:'var(--el1)',fontFamily:FT,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
              <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,textAlign:'center'}}>{p.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* For you */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px'}}>Для вас ✨</div>
          <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>Персонально</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[{e:'🎓',n:'Гончарный круг',s:'Основано на предпочтениях',c:'#007AFF'},
            {e:'🌮',n:'Фиеста · Мексика',s:'Популярно сейчас',c:'#006847'},
            {e:'🛁',n:'Джакузи с видом',s:'Скидка 15% сегодня',c:'#AF52DE'}].map(it=>(
            <div key={it.n} className="tap" style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',alignItems:'center'}}>
              <div style={{width:48,height:48,borderRadius:14,background:`${it.c}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{it.e}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--el1)',fontFamily:FT}}>{it.n}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginTop:2}}>{it.s}</div>
              </div>
              <div style={{padding:'5px 10px',borderRadius:8,background:`${it.c}12`}}>
                <span style={{fontSize:11,fontWeight:600,color:it.c,fontFamily:FT}}>Открыть</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px',marginBottom:12}}>Быстрые действия</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[{e:'📷',l:'Сканировать QR',c:'#007AFF',s:'Открыть страну'},
            {e:'🗺️',l:'Карта парка',c:'#34C759',s:'140 га · GPS'},
            {e:'📦',l:'Мои заказы',c:'#FF9500',s:'2 активных'},
            {e:'💳',l:'Купить билет',c:'#AF52DE',s:'От 990 ₽'}].map(a=>(
            <div key={a.l} className="tap" style={{padding:'14px',borderRadius:18,background:`${a.c}10`,border:`.5px solid ${a.c}25`}}>
              <div style={{fontSize:26,marginBottom:6}}>{a.e}</div>
              <div style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:1}}>{a.l}</div>
              <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>{a.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Events preview */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px'}}>Ближайшие события</div>
          <div className="tap" style={{padding:'5px 10px',background:'rgba(0,122,255,.1)',borderRadius:8}}><span style={{fontSize:11,color:'var(--eblue)',fontFamily:FT,fontWeight:600}}>Все</span></div>
        </div>
        <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
          {EVENTS.slice(0,4).map(e=>(
            <div key={e.name} className="tap" style={{flexShrink:0,width:155,padding:'12px',borderRadius:18,background:'var(--ef2)',border:'.5px solid var(--es2)'}}>
              <div style={{fontSize:28,marginBottom:8}}>{e.emoji}</div>
              <div style={{fontSize:12,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:4,lineHeight:1.3}}>{e.name}</div>
              <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{e.date}</div>
              <div style={{fontSize:10,color:'var(--el4)',fontFamily:FT,marginBottom:6}}>{e.loc}</div>
              {e.free && <Bdg label="Бесплатно" color="var(--egreen)" />}
            </div>
          ))}
        </div>
      </div>

      {/* Dev promo */}
      <div style={{padding:'0 16px 16px'}}>
        <div className="tap" style={{borderRadius:20,background:'linear-gradient(135deg,#1a1a2e,#16213e)',padding:'18px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:64,opacity:.15}}>🏗️</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginBottom:4,fontWeight:700,letterSpacing:1}}>ETHNOMIR DEVELOPMENT</div>
            <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD,marginBottom:4}}>Живи в Этномире</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:12}}>Апартаменты от 5.4 млн ₽ · ROI до 22%/год</div>
            <div style={{display:'flex',gap:16,marginBottom:12}}>
              {[['ROI','до 22%'],['Заезд','2026'],['От','36м²']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,.15)',borderRadius:10,padding:'6px 14px',border:'.5px solid rgba(255,255,255,.2)'}}>
              <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>Узнать подробнее →</span>
            </div>
          </div>
        </div>
      </div>

      {/* All services */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.3px',marginBottom:12}}>Все сервисы</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
          {SERVICES_GRID_ALL.map(s=>(
            <div key={s.name} className="tap" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
              <div style={{width:52,height:52,borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{s.emoji}</div>
              <span style={{fontSize:9.5,color:'var(--el2)',fontFamily:FT,fontWeight:500,textAlign:'center',lineHeight:1.2}}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TOURS ────────────────────────────────────────────────
function ToursTab() {
  const [sec, setSec] = useState('tours');
  const [exp, setExp] = useState<number|null>(null);

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Туры</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>Флагманские · Мастер-классы · Фестивали</div>
      </div>
      <Seg items={[['tours','🎫 Туры'],['mk','🎓 Мастер-классы'],['events','🎉 События']]} val={sec} onChange={setSec}/>

      {sec==='tours' && (
        <div style={{padding:'0 16px'}}>
          {FLAGSHIP_TOURS.map((t,i)=>(
            <div key={t.id} className={`tap fu s${i+1}`} onClick={()=>setExp(exp===t.id?null:t.id)}
              style={{borderRadius:22,background:`linear-gradient(135deg,${t.color}dd,${t.color}88)`,padding:'20px',marginBottom:14,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',right:-10,top:'50%',transform:'translateY(-50%)',fontSize:70,opacity:.2}}>{t.emoji}</div>
              <div style={{position:'relative',zIndex:1}}>
                <Bdg label={t.badge} color="rgba(255,255,255,.9)"/>
                <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginTop:6,marginBottom:4}}>{t.title}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.75)',fontFamily:FT,marginBottom:14}}>{t.sub}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:24,fontWeight:800,color:'#fff',fontFamily:FD}}>{t.price}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,.6)',fontFamily:FT}}>/ {t.duration}</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,.25)',borderRadius:14,padding:'9px 18px',border:'.5px solid rgba(255,255,255,.3)'}}>
                    <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Забронировать</span>
                  </div>
                </div>
                {exp===t.id && (
                  <div style={{marginTop:14,paddingTop:14,borderTop:'.5px solid rgba(255,255,255,.25)'}}>
                    {t.includes.map(inc=>(
                      <div key={inc} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        <div style={{width:16,height:16,borderRadius:8,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                        <span style={{fontSize:12,color:'rgba(255,255,255,.9)',fontFamily:FT}}>{inc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sec==='mk' && (
        <div style={{padding:'0 16px'}}>
          {MASTERCLASSES.map((mc,i)=>(
            <div key={mc.name} className={`tap fu s${Math.min(i+1,6)}`}
              style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',alignItems:'center',marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:16,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{mc.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{mc.name}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:3}}>{mc.country} · {mc.dur}</div>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <div style={{width:5,height:5,borderRadius:3,background:'var(--egreen)'}}/>
                  <span style={{fontSize:10,color:'var(--egreen)',fontFamily:FT,fontWeight:600}}>{mc.avail}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:15,fontWeight:700,color:'var(--eblue)',fontFamily:FT}}>{mc.price}</div>
                <div style={{marginTop:4,padding:'4px 10px',borderRadius:8,background:'rgba(0,122,255,.1)'}}>
                  <span style={{fontSize:11,fontWeight:600,color:'var(--eblue)',fontFamily:FT}}>Записаться</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sec==='events' && (
        <div style={{padding:'0 16px'}}>
          {EVENTS.map((e,i)=>(
            <div key={e.name} className={`tap fu s${Math.min(i+1,6)}`}
              style={{display:'flex',gap:12,padding:'14px',borderRadius:18,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:10}}>
              <div style={{width:56,height:56,borderRadius:16,background:`${e.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{e.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:3}}>{e.name}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:4}}>{e.loc}</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:11,color:e.color,fontWeight:600,fontFamily:FT}}>{e.date}</span>
                  {e.free && <Bdg label="Бесплатно" color="var(--egreen)"/>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STAY ─────────────────────────────────────────────────
function StayTab() {
  const [view, setView] = useState('hotels');
  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Жильё</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>Отели · Глэмпинг · Недвижимость</div>
      </div>
      <Seg items={[['hotels','🏨 Снять'],['re','🏗️ Купить']]} val={view} onChange={setView}/>

      {view==='hotels' && (
        <div style={{padding:'0 16px'}}>
          {HOTELS.map((h,i)=>(
            <div key={h.name} className={`tap fu s${Math.min(i+1,6)}`}
              style={{borderRadius:22,background:`linear-gradient(135deg,${h.color}18,${h.color}05)`,border:`.5px solid ${h.color}35`,padding:'16px',marginBottom:12}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <div style={{width:60,height:60,borderRadius:18,background:`${h.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{h.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{h.name}</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:6}}>{h.type}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:11,color:'#FFD60A'}}>★★★★★</span>
                    <span style={{fontSize:11,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{h.rating}</span>
                    <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>({h.reviews})</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:5,marginTop:4}}>
                    <div style={{width:5,height:5,borderRadius:3,background:'var(--egreen)'}}/>
                    <span style={{fontSize:10,color:'var(--egreen)',fontFamily:FT,fontWeight:600}}>{h.rooms} свободно</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:16,fontWeight:800,color:h.color,fontFamily:FD}}>{h.price}</div>
                  <div style={{fontSize:10,color:'var(--el4)',fontFamily:FT,marginBottom:8}}>за ночь</div>
                  <div style={{background:`${h.color}20`,borderRadius:12,padding:'6px 12px',border:`.5px solid ${h.color}40`}}>
                    <span style={{fontSize:11,fontWeight:700,color:h.color,fontFamily:FT}}>Забронировать</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view==='re' && (
        <div style={{padding:'0 16px'}}>
          <div style={{borderRadius:22,background:'linear-gradient(135deg,#0d1b2a,#1a3a5c)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-20,bottom:-20,fontSize:80,opacity:.1}}>🏙️</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1,marginBottom:6,fontFamily:FT}}>ETHNOMIR DEVELOPMENT</div>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,marginBottom:6}}>Живи в Этномире</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:16}}>Апартаменты · Виллы · Апарт-отели</div>
            <div style={{display:'flex',gap:20}}>
              {[['ROI','до 22%'],['Заезд','2026'],['Площадь','от 36м²']].map(([l,v])=>(
                <div key={l}><div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
          </div>
          {REAL_ESTATE.map((r,i)=>(
            <div key={r.name} className={`tap fu s${i+1}`}
              style={{borderRadius:22,background:'var(--ef2)',border:'.5px solid var(--es2)',padding:'18px',marginBottom:12}}>
              <div style={{display:'flex',gap:14,marginBottom:14,alignItems:'center'}}>
                <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#1a3a5c,#0d1b2a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{r.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{r.name}</div>
                    <Bdg label={r.badge} color="#1a3a5c"/>
                  </div>
                  <div style={{fontSize:22,fontWeight:800,color:'var(--el1)',fontFamily:FD}}>{r.price}</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT}}>{r.priceM2} · {r.floor}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <div style={{flex:1,background:'#34C75910',borderRadius:12,padding:'10px 12px',border:'.5px solid #34C75930'}}>
                  <div style={{fontSize:15,fontWeight:800,color:'var(--egreen)',fontFamily:FD}}>{r.roi}</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>Доходность</div>
                </div>
                <div style={{flex:1,background:'var(--ef3)',borderRadius:12,padding:'10px 12px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{r.income}</div>
                  <div style={{fontSize:10,color:'var(--el3)',fontFamily:FT}}>Прогноз дохода</div>
                </div>
              </div>
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

// ── SERVICES ─────────────────────────────────────────────
function ServicesTab() {
  const [sec, setSec] = useState('food');
  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 14px'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px'}}>Сервисы</div>
        <div style={{fontSize:13,color:'var(--el3)',fontFamily:FT,marginTop:2}}>Еда · Баня · Прокат · Доставка</div>
      </div>
      <Seg items={[['food','🍽️ Рестораны'],['banya','🛁 Баня/СПА'],['more','⚡ Ещё']]} val={sec} onChange={setSec}/>

      {sec==='food' && (
        <div style={{padding:'0 16px'}}>
          <div className="tap" style={{borderRadius:16,background:'linear-gradient(135deg,#FF6B35,#FF9500)',padding:'14px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:28}}>🚚</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:800,color:'#fff',fontFamily:FT}}>Доставка в любую точку парка</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT}}>GPS-доставка к вашей беседке · от 20 мин</div>
            </div>
            <Chevron c="#fff"/>
          </div>
          {RESTAURANTS.map((r,i)=>(
            <div key={r.name} className={`tap fu s${Math.min(i+1,6)}`}
              style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',alignItems:'center',marginBottom:10,opacity:r.open?1:.6}}>
              <div style={{width:52,height:52,borderRadius:14,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{r.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--el1)',fontFamily:FT,marginBottom:1}}>{r.name}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:2}}>{r.country} · {r.type}</div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:5,height:5,borderRadius:3,background:r.open?'var(--egreen)':'var(--el4)'}}/>
                  <span style={{fontSize:10,color:r.open?'var(--egreen)':'var(--el3)',fontFamily:FT,fontWeight:600}}>{r.open?r.wait:'Закрыт'}</span>
                  <span style={{fontSize:10,color:'var(--el4)',fontFamily:FT}}>· ср. {r.avg}</span>
                </div>
              </div>
              <div style={{padding:'5px 10px',borderRadius:8,background:'rgba(0,122,255,.1)'}}>
                <span style={{fontSize:11,fontWeight:600,color:'var(--eblue)',fontFamily:FT}}>Меню</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {sec==='banya' && (
        <div style={{padding:'0 16px'}}>
          <div style={{borderRadius:18,background:'linear-gradient(135deg,#7B1D1D,#C0392B)',padding:'16px 18px',marginBottom:14}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontWeight:700,letterSpacing:1,marginBottom:4,fontFamily:FT}}>БАННЫЙ КОМПЛЕКС</div>
            <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:FD}}>5 видов бань мира</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.7)',fontFamily:FT}}>Русская · Финская · Хаммам · Офуро · Ичал</div>
          </div>
          {BANYA.map((b,i)=>(
            <div key={b.name} className={`tap fu s${i+1}`}
              style={{borderRadius:20,background:`linear-gradient(135deg,${b.color}15,${b.color}05)`,border:`.5px solid ${b.color}30`,padding:'16px',marginBottom:12}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:56,height:56,borderRadius:16,background:`${b.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{b.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{b.name}</div>
                  <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:4}}>{b.type}</div>
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    <div style={{width:5,height:5,borderRadius:3,background:'var(--egreen)'}}/>
                    <span style={{fontSize:10,color:'var(--egreen)',fontFamily:FT,fontWeight:600}}>{b.avail}</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:15,fontWeight:800,color:b.color,fontFamily:FD}}>{b.price}</div>
                  <div style={{marginTop:6,background:`${b.color}15`,borderRadius:10,padding:'5px 10px'}}>
                    <span style={{fontSize:11,fontWeight:700,color:b.color,fontFamily:FT}}>Забронировать</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sec==='more' && (
        <div style={{padding:'0 16px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {SERVICES_GRID_ALL.slice(4).map((s,i)=>(
              <div key={s.name} className={`tap fu s${Math.min(i+1,6)}`}
                style={{padding:'16px',borderRadius:18,background:`${s.color}10`,border:`.5px solid ${s.color}25`,textAlign:'center'}}>
                <div style={{fontSize:30,marginBottom:8}}>{s.emoji}</div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--el1)',fontFamily:FT}}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PASSPORT ─────────────────────────────────────────────
function PassportTab() {
  const [sec, setSec] = useState('stamps');
  const stamped=COUNTRIES_ALL.filter(c=>c.unlocked).length, total=COUNTRIES_ALL.length;

  return (
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'52px 20px 0'}}>
        <div style={{fontSize:28,fontWeight:700,color:'var(--el1)',fontFamily:FD,letterSpacing:'-.6px',marginBottom:16}}>Паспорт</div>
        {/* Card */}
        <div style={{borderRadius:24,background:'linear-gradient(135deg,#1a2a1a,#2d4a2d)',padding:'20px',marginBottom:16,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-10,top:-10,fontSize:80,opacity:.08}}>🌍</div>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,letterSpacing:1.5,fontFamily:FT}}>ПАСПОРТ ПУТЕШЕСТВЕННИКА</div>
                <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,marginTop:4}}>Гражданин Мира</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:2}}>Уровень: Новичок</div>
              </div>
              <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🌐</div>
            </div>
            <div style={{display:'flex',gap:24,marginBottom:14}}>
              {[['Стран',stamped,'#7DEFA1'],['Баллов',150,'#FFD60A'],['Уровень',1,'#5E9CFF']].map(([l,v,c])=>(
                <div key={l as string}><div style={{fontSize:22,fontWeight:800,color:c as string,fontFamily:FD}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>{l}</div></div>
              ))}
            </div>
            <div style={{height:5,background:'rgba(255,255,255,.1)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${(stamped/total)*100}%`,background:'linear-gradient(90deg,#30D158,#7DEFA1)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:4}}>{stamped} из {total} стран открыто</div>
          </div>
        </div>
      </div>

      <Seg items={[['stamps','🗺️ Страны'],['achievements','🏆 Ачивки'],['profile','👤 Профиль']]} val={sec} onChange={setSec}/>

      {sec==='stamps' && (
        <div style={{padding:'0 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {COUNTRIES_ALL.map((c,i)=>(
              <div key={c.id} className={`tap fu s${Math.min((i%6)+1,6)}`}
                style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 6px',
                  borderRadius:14,background:c.unlocked?'var(--ef2)':'var(--ef3)',
                  border:c.unlocked?'.5px solid rgba(52,199,89,.4)':'.5px solid var(--es2)',
                  opacity:c.unlocked?1:.55,position:'relative',overflow:'hidden'}}>
                {c.unlocked && <div style={{position:'absolute',top:4,right:4,width:6,height:6,borderRadius:3,background:'var(--egreen)'}}/>}
                <div style={{fontSize:24}}>{c.flag}</div>
                <div style={{fontSize:9,fontWeight:600,color:c.unlocked?'var(--el1)':'var(--el3)',fontFamily:FT,textAlign:'center',lineHeight:1.2}}>{c.name}</div>
                {c.unlocked && c.stamps>0 && <div style={{fontSize:9,color:'var(--egreen)',fontFamily:FT}}>×{c.stamps}</div>}
                {!c.unlocked && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(242,242,247,.4)'}}>
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><rect x="1" y="5.5" width="10" height="8" rx="2" stroke="var(--el3)" strokeWidth="1.4"/><path d="M3.5 5.5V4a2.5 2.5 0 015 0v1.5" stroke="var(--el3)" strokeWidth="1.4"/></svg>
                </div>}
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:'12px 14px',borderRadius:16,background:'rgba(0,122,255,.08)',border:'.5px solid rgba(0,122,255,.2)',textAlign:'center',marginBottom:8}}>
            <div style={{fontSize:13,color:'var(--eblue)',fontWeight:600,fontFamily:FT}}>Сканируй QR у павильонов чтобы открывать страны 📷</div>
          </div>
        </div>
      )}

      {sec==='achievements' && (
        <div style={{padding:'0 20px'}}>
          {ACHIEVEMENTS.map((a,i)=>(
            <div key={a.name} className={`tap fu s${Math.min(i+1,6)}`}
              style={{display:'flex',gap:12,padding:'14px',borderRadius:18,background:a.done?`${a.color}12`:'var(--ef2)',
                border:`.5px solid ${a.done?a.color+'40':'var(--es2)'}`,alignItems:'center',marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:14,background:`${a.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{a.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>{a.name}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginBottom:a.done?0:6}}>{a.desc}</div>
                {!a.done && <>
                  <div style={{height:4,background:'var(--ef3)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(a.progress/a.total)*100}%`,background:a.color,borderRadius:2}}/>
                  </div>
                  <div style={{fontSize:10,color:'var(--el4)',fontFamily:FT,marginTop:2}}>{a.progress} / {a.total}</div>
                </>}
              </div>
              {a.done && <div style={{width:28,height:28,borderRadius:14,background:`${a.color}20`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6l4 4L13 1" stroke={a.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>}
            </div>
          ))}
        </div>
      )}

      {sec==='profile' && (
        <div style={{padding:'0 20px'}}>
          <div style={{display:'flex',gap:14,padding:'16px',borderRadius:20,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:14,alignItems:'center'}}>
            <div style={{width:64,height:64,borderRadius:20,background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>👤</div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:700,color:'var(--el1)',fontFamily:FT,marginBottom:2}}>Гость</div>
              <div style={{fontSize:12,color:'var(--el3)',fontFamily:FT,marginBottom:8}}>Новичок · 150 баллов · 3 страны</div>
              <div className="tap" style={{display:'inline-block',padding:'6px 14px',borderRadius:10,background:'var(--eblue)'}}>
                <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>Войти / Зарегистрироваться</span>
              </div>
            </div>
          </div>
          <div className="tap" style={{borderRadius:20,background:'linear-gradient(135deg,#1a1a2e,#16213e)',padding:'16px',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:'rgba(255,215,0,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>💎</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Подписка «Посол Мира»</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:FT}}>990 ₽/мес · 30 дней бесплатно</div>
              </div>
              <Chevron c="rgba(255,255,255,.4)"/>
            </div>
          </div>
          {[{e:'📦',l:'Мои заказы',s:'2 активных'},{e:'🏘️',l:'Моя недвижимость',s:'Управление объектами'},
            {e:'💰',l:'Баллы лояльности',s:'150 баллов · История'},{e:'🤝',l:'Пригласить друга',s:'+150 баллов за каждого'},
            {e:'🗺️',l:'История путешествий',s:'3 страны · 5 визитов'},{e:'⚙️',l:'Настройки',s:'Уведомления · Язык · Тема'},
            {e:'❓',l:'Помощь',s:'Служба заботы 24/7'}].map(it=>(
            <div key={it.l} className="tap"
              style={{display:'flex',gap:12,padding:'14px',borderRadius:16,background:'var(--ef2)',border:'.5px solid var(--es2)',marginBottom:8,alignItems:'center'}}>
              <div style={{width:42,height:42,borderRadius:12,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{it.e}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'var(--el1)',fontFamily:FT}}>{it.l}</div>
                <div style={{fontSize:11,color:'var(--el3)',fontFamily:FT,marginTop:1}}>{it.s}</div>
              </div>
              <Chevron/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TAB BAR ───────────────────────────────────────────────
const TABS_DEF = [
  { id:'home' as Tab, label:'Главная', icon:(a:boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?"#000":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill={a?"#fff":"none"} stroke={a?"#fff":"var(--el3)"}/></svg> },
  { id:'tours' as Tab, label:'Туры', icon:(a:boolean) => <svg width="21" height="21" viewBox="0 0 24 24" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { id:'stay' as Tab, label:'Жильё', icon:(a:boolean) => <svg width="21" height="21" viewBox="0 0 24 24" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10" fill={a?"#fff":"none"} stroke={a?"#fff":"var(--el3)"} strokeWidth="1.8"/></svg> },
  { id:'services' as Tab, label:'Сервисы', icon:(a:boolean) => <svg width="21" height="21" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8"/></svg> },
  { id:'passport' as Tab, label:'Паспорт', icon:(a:boolean) => <svg width="21" height="21" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" fill={a?"var(--el1)":"none"} stroke={a?"none":"var(--el3)"} strokeWidth="1.8"/><circle cx="12" cy="11" r="3" fill="none" stroke={a?"#fff":"var(--el3)"} strokeWidth="1.5"/><path d="M6 20v-1a6 6 0 0112 0v1" fill="none" stroke={a?"#fff":"var(--el3)"} strokeWidth="1.5"/></svg> },
];

function TabBar({ active, onSelect }: { active:Tab; onSelect:(t:Tab)=>void }) {
  return (
    <div style={{position:'fixed',bottom:20,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100,pointerEvents:'none'}}>
      <div className="glass-p" style={{pointerEvents:'all',display:'flex',alignItems:'center',padding:'0 8px',height:64,borderRadius:36}}>
        {TABS_DEF.map(tab => {
          const on = active===tab.id;
          return (
            <div key={tab.id} className="tap" onClick={()=>onSelect(tab.id)}
              style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 14px 8px',position:'relative'}}>
              {on && <div style={{position:'absolute',inset:'5px 6px',borderRadius:14,background:'rgba(0,0,0,.07)'}}/>}
              <div style={{position:'relative',zIndex:1}}>{tab.icon(on)}</div>
              <span style={{fontSize:10,fontFamily:FT,fontWeight:on?700:400,color:on?'var(--el1)':'var(--el3)',marginTop:3,letterSpacing:'-.1px',position:'relative',zIndex:1}}>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
