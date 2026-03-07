'use client'
import{useState,useEffect,useRef,useCallback}from"react";

// ═══════════════════════════════════════════════════════════════
//  ETHNOMIR v7 — iOS 26 / Liquid Glass Design System
//  Reference: AppStore, Wallet, Weather, Voice Memos (iOS 26)
//  Key fixes vs v6:
//  · TabBar = floating pill, shrinks on scroll (NOT edge-to-edge)
//  · Glass = real specular rim, lensing refraction, NOT just blur
//  · NavBar = truly transparent, materialises on scroll
//  · Cards = no solid boxes — content on bg, glass only for chrome
//  · Buttons = glass pill with specular highlight
//  · Animations = spring physics, morph, not just scale
// ═══════════════════════════════════════════════════════════════

const FD='"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif';
const FT='"SF Pro Text",-apple-system,BlinkMacSystemFont,sans-serif';
const FM='"SF Pro Rounded",-apple-system,BlinkMacSystemFont,sans-serif';

// CSS shortcuts — same tokens, same names
const bg='var(--eb)',bg2='var(--eb2)',bg3='var(--eb3)',bg4='var(--eb4)';
const l1='var(--el1)',l2='var(--el2)',l3='var(--el3)',l4='var(--el4)';
const sep='var(--es)',sep2='var(--es2)';
const f1='var(--ef1)',f2='var(--ef2)',f3='var(--ef3)';
const gl='var(--egl)',gl2='var(--egl2)';
const blue='var(--eblue)',green='var(--egreen)',red='var(--ered)';
const orange='var(--eor)',yellow='var(--eye)',purple='var(--epu)';
const teal='var(--ete)',indigo='var(--ein)',pink='var(--epk)';
const G='#1B4332',Gm='#2D6A4F',Gl='#30D158';

// ─── Theme Tokens ─────────────────────────────────────────────
const DARK={
  eb:'#000000',eb2:'#111111',eb3:'#1C1C1E',eb4:'#2C2C2E',
  el1:'#FFFFFF',el2:'rgba(235,235,245,.7)',el3:'rgba(235,235,245,.4)',el4:'rgba(235,235,245,.2)',
  es:'rgba(84,84,88,.55)',es2:'rgba(84,84,88,.28)',
  ef1:'rgba(118,118,128,.28)',ef2:'rgba(118,118,128,.18)',ef3:'rgba(118,118,128,.1)',
  // iOS 26 glass tokens — dark mode
  egl:'rgba(30,30,32,.65)',egl2:'rgba(22,22,24,.5)',
  eglborder:'rgba(255,255,255,.14)',
  eglspec:'rgba(255,255,255,.18)',   // specular rim
  eglspec2:'rgba(255,255,255,.06)',  // specular bottom
  eblue:'#0A84FF',egreen:'#30D158',ered:'#FF453A',
  eor:'#FF9F0A',eye:'#FFD60A',epu:'#BF5AF2',
  ete:'#5AC8FA',ein:'#5E5CE6',epk:'#FF375F',
  ecScheme:'dark',
};
const LIGHT={
  eb:'#F2F2F7',eb2:'#FFFFFF',eb3:'#F2F2F7',eb4:'#E5E5EA',
  el1:'#000000',el2:'rgba(60,60,67,.65)',el3:'rgba(60,60,67,.4)',el4:'rgba(60,60,67,.2)',
  es:'rgba(60,60,67,.25)',es2:'rgba(60,60,67,.14)',
  ef1:'rgba(120,120,128,.18)',ef2:'rgba(120,120,128,.13)',ef3:'rgba(120,120,128,.08)',
  // iOS 26 glass tokens — light mode
  egl:'rgba(255,255,255,.72)',egl2:'rgba(248,248,252,.6)',
  eglborder:'rgba(255,255,255,.9)',
  eglspec:'rgba(255,255,255,.92)',
  eglspec2:'rgba(255,255,255,.35)',
  eblue:'#007AFF',egreen:'#34C759',ered:'#FF3B30',
  eor:'#FF9500',eye:'#FFCC00',epu:'#AF52DE',
  ete:'#5AC8FA',ein:'#5856D6',epk:'#FF2D55',
  ecScheme:'light',
};

// ─── Страны Этномира ──────────────────────────────────────────
const COUNTRIES=[
  {
    id:'russia',flag:'🇷🇺',name:'Россия',color:'#C0392B',
    grad:'linear-gradient(135deg,#5c1a1a 0%,#a02020 50%,#C0392B 100%)',
    hotel:{n:'Этноотель Россия',p:7200,desc:'Русская деревня, баня, кедровый лес'},
    restaurants:[
      {n:'Русская трапезная',e:'🥣',p:'300–1800₽',desc:'Щи, борщ, пироги, уха',country:'russia'},
    ],
    activities:['Русская баня','Охота с соколом','Резьба по дереву','Рыбалка'],
    realestate:[
      {t:'Сруб «Кедр»',type:'house',p:5500000,area:90,desc:'Баня, лес, участок 6 соток'},
    ],
    stamps:9,visited:true,
  },
  {
    id:'india',flag:'🇮🇳',name:'Индия',color:'#FF6B35',
    grad:'linear-gradient(135deg,#7B1D1D 0%,#C84B31 50%,#FF6B35 100%)',
    hotel:{n:'Этноотель Индия',p:5800,desc:'Дворцовый стиль, арки, мозаика'},
    restaurants:[
      {n:'Индийская душа',e:'🍛',p:'500–3500₽',desc:'Карри, тандур, масала',country:'india'},
    ],
    activities:['Йога-класс','Аюрведа-ритуал','Урок танца Болливуд','Роспись хной'],
    realestate:[
      {t:'Апартамент «Радж»',type:'apartment',p:2400000,area:42,desc:'Вид на сад, дворцовый стиль'},
      {t:'Вилла «Тадж»',type:'villa',p:9800000,area:120,desc:'Бассейн, сад специй'},
    ],
    stamps:12,visited:true,
  },
  {
    id:'nepal',flag:'🇳🇵',name:'Непал',color:'#4A90D9',
    grad:'linear-gradient(135deg,#1a3a5c 0%,#2d6a9f 50%,#4A90D9 100%)',
    hotel:{n:'Гималайский дом',p:5200,desc:'Основной рецепшен, Непал/Бутан/Тибет'},
    restaurants:[
      {n:'Чайхана',e:'🍵',p:'400–2800₽',desc:'Восточная кухня, плов, лагман',country:'nepal'},
    ],
    activities:['Медитация','Тибетские чаши','Мастер-класс по тханке','Трекинг'],
    realestate:[
      {t:'Апартамент «Анапурна»',type:'apartment',p:1900000,area:38,desc:'Горный вид, тибетский декор'},
    ],
    stamps:8,visited:true,
  },
  {
    id:'srilanka',flag:'🇱🇰',name:'Шри-Ланка',color:'#2ECC71',
    grad:'linear-gradient(135deg,#0a3d1e 0%,#1a6b3a 50%,#2ECC71 100%)',
    hotel:{n:'СПА-отель Шри-Ланка',p:8500,desc:'Тропический стиль, бассейн, хаммам'},
    restaurants:[
      {n:'Океан и Я',e:'🦞',p:'800–6000₽',desc:'Морепродукты, устрицы, лобстер',country:'srilanka'},
    ],
    activities:['СПА-церемония','Аюрведа','Чайная дегустация','Сёрфинг-класс'],
    realestate:[
      {t:'Вилла «Цейлон»',type:'villa',p:14500000,area:200,desc:'Бассейн, джакузи, тропический сад'},
    ],
    stamps:15,visited:true,
  },
  {
    id:'eastasia',flag:'🇨🇳',name:'Восточная Азия',color:'#E74C3C',
    grad:'linear-gradient(135deg,#7b0000 0%,#c0392b 50%,#E74C3C 100%)',
    hotel:{n:'Этноотель Восточная Азия',p:6200,desc:'Китай/Япония/Корея, чайная церемония'},
    restaurants:[
      {n:'Кафе Восточной Азии',e:'🍜',p:'500–2500₽',desc:'Фо-бо, суши, димсам',country:'eastasia'},
    ],
    activities:['Чайная церемония','Боевые искусства','Икебана','Оригами-МК'],
    realestate:[
      {t:'Апартамент «Пагода»',type:'apartment',p:2800000,area:48,desc:'Японский минимализм, чайный сад'},
    ],
    stamps:6,visited:true,
  },
  {
    id:'sea',flag:'🇹🇭',name:'Юго-Восточная Азия',color:'#F39C12',
    grad:'linear-gradient(135deg,#7b4200 0%,#c97d00 50%,#F39C12 100%)',
    hotel:{n:'Этноотель ЮВА',p:5900,desc:'Таиланд/Индонезия/Бали, тропики'},
    restaurants:[
      {n:'Кафе Юго-Восточной Азии',e:'🍲',p:'500–2500₽',desc:'Пад-тай, том-ям, наси-горенг',country:'sea'},
    ],
    activities:['Тайский массаж','Балийский танец','Батик-МК','Кокосовое мастерство'],
    realestate:[
      {t:'Вилла «Убуд»',type:'villa',p:7900000,area:150,desc:'Балийский стиль, рисовые террасы'},
    ],
    stamps:4,visited:false,
  },
  {
    id:'centralasia',flag:'🇰🇿',name:'Центральная Азия',color:'#9B59B6',
    grad:'linear-gradient(135deg,#3d1a60 0%,#6c3483 50%,#9B59B6 100%)',
    hotel:{n:'Этноотель Центральная Азия',p:4800,desc:'Казахстан/Узбекистан, Музей СССР'},
    restaurants:[
      {n:'Чайхана',e:'🍽',p:'400–2800₽',desc:'Плов, лагман, самса, манты',country:'centralasia'},
      {n:'Кафе Азербайджан',e:'🥩',p:'400–2200₽',desc:'Долма, пити, люля-кебаб',country:'centralasia'},
    ],
    activities:['Игра на домбре','Юртовая жизнь','Национальные танцы','Кочевой быт'],
    realestate:[
      {t:'Апартамент «Самарканд»',type:'apartment',p:1600000,area:35,desc:'Восточный стиль, ковры, аутентика'},
    ],
    stamps:3,visited:false,
  },
  {
    id:'siberia',flag:'🇷🇺',name:'Сибирь',color:'#1ABC9C',
    grad:'linear-gradient(135deg,#0a3d35 0%,#148f77 50%,#1ABC9C 100%)',
    hotel:{n:'Этноотель Сибирия',p:4200,desc:'Сибирский стиль, баня, кедровый лес'},
    restaurants:[
      {n:'Русская трапезная',e:'🥣',p:'300–1800₽',desc:'Щи, борщ, пироги, уха',country:'siberia'},
    ],
    activities:['Русская баня','Охота с соколом','Резьба по дереву','Рыбалка'],
    realestate:[
      {t:'Сруб «Тайга»',type:'house',p:4200000,area:80,desc:'Лесной участок, ИЖС'},
    ],
    stamps:5,visited:true,
  },
  {
    id:'ukraine',flag:'🇺🇦',name:'Украина',color:'#F1C40F',
    grad:'linear-gradient(135deg,#1a6b1a 0%,#27ae60 50%,#F1C40F 100%)',
    hotel:{n:'Этноотель Украина',p:3800,desc:'Белёные хаты, хохлома, вышиванка'},
    restaurants:[
      {n:'Украинская кухня',e:'🥟',p:'300–1800₽',desc:'Борщ, вареники, сало',country:'ukraine'},
    ],
    activities:['Гончарство','Вышивка крестиком','Писанки','Народные танцы'],
    realestate:[
      {t:'Хата «Полтава»',type:'house',p:3200000,area:70,desc:'Белёная хата, сад, огород'},
    ],
    stamps:5,visited:true,
  },
  {
    id:'belarus',flag:'🇧🇾',name:'Беларусь',color:'#E74C3C',
    grad:'linear-gradient(135deg,#1a0a0a 0%,#7b1111 50%,#E74C3C 100%)',
    hotel:{n:'Этноотель Беларусь',p:3500,desc:'Деревянный сруб, народные ремёсла'},
    restaurants:[
      {n:'Белорусская кухня',e:'🥔',p:'300–1800₽',desc:'Драники, мачанка, кулага',country:'belarus'},
    ],
    activities:['Лозоплетение','Ткачество','Бортничество','Кузнечное дело'],
    realestate:[
      {t:'Усадьба «Полесье»',type:'house',p:2800000,area:80,desc:'Сруб, баня, сад'},
    ],
    stamps:2,visited:false,
  },
];

const CITIZENSHIP_LEVELS=[
  {id:'guest',    title:'Гость',          emoji:'🌍',color:'#8E8E93',min:0,   desc:'Первый визит в Этномир'},
  {id:'traveler', title:'Путник',         emoji:'🧳',color:'#30D158',min:1,   desc:'Получил паспорт путника'},
  {id:'resident', title:'Резидент',       emoji:'🏠',color:'#0A84FF',min:5,   desc:'Арендует жильё или частый гость'},
  {id:'citizen',  title:'Гражданин',      emoji:'🏡',color:'#BF5AF2',min:100, desc:'Владеет недвижимостью в Этномире'},
  {id:'honorary', title:'Почётный гражданин',emoji:'👑',color:'#FFD60A',min:500,desc:'Партнёр или инвестор Этномира'},
];

const PROPERTY_TYPES={
  land:      {emoji:'🌳',label:'Земля',       color:'#30D158'},
  apartment: {emoji:'🏢',label:'Апартамент',  color:'#0A84FF'},
  house:     {emoji:'🏠',label:'Дом',         color:'#FF9F0A'},
  villa:     {emoji:'🏡',label:'Вилла',       color:'#BF5AF2'},
  commercial:{emoji:'🏪',label:'Коммерция',   color:'#FF453A'},
  franchise: {emoji:'🤝',label:'Франшиза',    color:'#FFD60A'},
};

const ThemeStyle=({dark}:{dark:boolean})=>{
  const t=dark?DARK:LIGHT;
  const vars=Object.entries(t).filter(([k])=>k!=='ecScheme').map(([k,v])=>`--${k}:${v}`).join(';');
  return <style>{`
    .eth-root{${vars};color-scheme:${t.ecScheme}}
    .eth-root *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    .eth-root ::-webkit-scrollbar{display:none}
    .eth-root input,textarea{-webkit-appearance:none;outline:none;border:none;background:transparent}

    /* ── iOS 26 Spring animations ── */
    @keyframes eth-spring-in{
      0%{opacity:0;transform:scale(.88) translateY(16px)}
      60%{opacity:1;transform:scale(1.02) translateY(-2px)}
      80%{transform:scale(.99) translateY(1px)}
      100%{opacity:1;transform:scale(1) translateY(0)}
    }
    @keyframes eth-fadeup{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes eth-scalein{from{opacity:0;transform:scale(.90)}to{opacity:1;transform:scale(1)}}
    @keyframes eth-fadein{from{opacity:0}to{opacity:1}}
    @keyframes eth-slideup{from{transform:translateY(110%)}to{transform:translateY(0)}}
    @keyframes eth-spin{to{transform:rotate(360deg)}}
    @keyframes eth-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes eth-pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes eth-morph{0%{border-radius:18px}50%{border-radius:26px}100%{border-radius:18px}}
    @keyframes eth-glass-appear{
      from{opacity:0;backdrop-filter:blur(0px);transform:scale(.96)}
      to{opacity:1;backdrop-filter:blur(40px);transform:scale(1)}
    }
    @keyframes eth-tabshrink{
      from{padding:0 22px;gap:28px}
      to{padding:0 16px;gap:18px}
    }

    /* ── Press interactions — iOS 26 spring feel ── */
    .eth-press{cursor:pointer;transition:transform .15s cubic-bezier(.34,1.3,.64,1),opacity .15s}
    .eth-press:active{transform:scale(.95);opacity:.8;transition:transform .08s,opacity .08s}
    .eth-press-sm{cursor:pointer;transition:transform .12s cubic-bezier(.34,1.4,.64,1)}
    .eth-press-sm:active{transform:scale(.88);transition:transform .07s}

    /* ── Animation classes ── */
    .eth-spring{animation:eth-spring-in .44s cubic-bezier(.34,1.56,.64,1) both}
    .eth-fadeup{animation:eth-fadeup .38s cubic-bezier(.25,.46,.45,.94) both}
    .eth-scalein{animation:eth-scalein .3s cubic-bezier(.34,1.4,.64,1) both}
    .eth-fadein{animation:eth-fadein .25s ease both}
    .eth-slideup{animation:eth-slideup .42s cubic-bezier(.32,.72,0,1)}
    .eth-glass-appear{animation:eth-glass-appear .3s cubic-bezier(.25,.46,.45,.94) both}
    .eth-shimmer{
      background:linear-gradient(90deg,${dark?'rgba(255,255,255,.03)':'rgba(0,0,0,.03)'} 0%,${dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.07)'} 50%,${dark?'rgba(255,255,255,.03)':'rgba(0,0,0,.03)'} 100%);
      background-size:200% 100%;animation:eth-shimmer 1.9s infinite
    }
    .eth-spin{animation:eth-spin .7s linear infinite}

    /* ── Scroll edge fade — iOS 26 signature ── */
    .eth-scroll-fade-top{mask-image:linear-gradient(to bottom,transparent 0,black 40px);-webkit-mask-image:linear-gradient(to bottom,transparent 0,black 40px)}
    .eth-scroll-fade-bottom{mask-image:linear-gradient(to top,transparent 0,black 36px);-webkit-mask-image:linear-gradient(to top,transparent 0,black 36px)}

    /* ── Glass material — iOS 26 accurate ── */
    .eth-glass{
      backdrop-filter:blur(40px) saturate(200%) brightness(1.05);
      -webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.05);
      background:var(--egl);
      border:0.5px solid var(--eglborder);
      /* Specular rim — the glass edge highlight */
      box-shadow:
        inset 0 1px 0 var(--eglspec),
        inset 0 -0.5px 0 var(--eglspec2),
        0 4px 24px rgba(0,0,0,.12),
        0 1px 3px rgba(0,0,0,.08);
    }
    .eth-glass-sm{
      backdrop-filter:blur(24px) saturate(180%);
      -webkit-backdrop-filter:blur(24px) saturate(180%);
      background:var(--egl2);
      border:0.5px solid var(--eglborder);
      box-shadow:inset 0 0.5px 0 var(--eglspec),0 2px 12px rgba(0,0,0,.1);
    }

    /* ── Floating TabBar (iOS 26 pill) ── */
    .eth-tabbar{
      position:fixed;bottom:20px;left:0;right:0;
      display:flex;justify-content:center;
      z-index:100;pointer-events:none;
    }
    .eth-tabbar-pill{
      pointer-events:all;
      display:flex;align-items:center;
      padding:0 8px;
      height:64px;
      border-radius:36px;
      transition:
        height .35s cubic-bezier(.34,1.2,.64,1),
        padding .35s cubic-bezier(.34,1.2,.64,1),
        width .35s cubic-bezier(.34,1.2,.64,1),
        gap .35s cubic-bezier(.34,1.2,.64,1);
    }
    .eth-tabbar-pill.compact{
      height:52px;
      padding:0 6px;
    }
    .eth-tabbar-item{
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:0 14px;height:100%;gap:3px;cursor:pointer;
      transition:all .25s cubic-bezier(.34,1.3,.64,1);
    }
    .eth-tabbar-item.compact{padding:0 12px;gap:0}
    .eth-tabbar-label{
      font-size:10px;font-family:${FT};font-weight:500;letter-spacing:-.1px;
      transition:all .25s cubic-bezier(.34,1.3,.64,1);
      overflow:hidden;max-height:14px;opacity:1;
    }
    .eth-tabbar-label.hidden{max-height:0;opacity:0;margin:0}
  `}</style>;
};

// ─── SF Symbols ───────────────────────────────────────────────
const Ic={
  house:({s=24,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M10 20V14h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  map:({s=24,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  bag:({s=24,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  heart:({s=24,c=l1,fill=true})=><svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:"none"} stroke={c} strokeWidth={fill?"0":"1.8"}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  person:({s=24,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chevR:({s=7,c=l3})=><svg width={s} height={s*12/7} viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevL:({s=10,c=blue})=><svg width={s} height={s*16/10} viewBox="0 0 10 16" fill="none"><path d="M8 1L1 8l7 7" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevD:({s=12,c=l3})=><svg width={s} height={s*7/12} viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search:({s=16,c=l3})=><svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke={c} strokeWidth="1.6"/><path d="M13.5 13.5L18 18" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  bell:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9m-4.27 13a2 2 0 01-3.46 0"/></svg>,
  share:({s=20,c=blue})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  plus:({s=16,c=l1})=><svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  xmark:({s=12,c=l3})=><svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke={c} strokeWidth="1.9" strokeLinecap="round"/></svg>,
  check:({s=14,c=l1})=><svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M2 9l5 5L16 4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ellipsis:({s=20,c=l3})=><svg width={s} height={s*5/20} viewBox="0 0 24 6" fill={c}><circle cx="3" cy="3" r="2.2"/><circle cx="12" cy="3" r="2.2"/><circle cx="21" cy="3" r="2.2"/></svg>,
  star:({s=14,c=yellow})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  location:({s=14,c=red})=><svg width={s} height={s*18/14} viewBox="0 0 14 18" fill="none"><path d="M7 0C3.69 0 1 2.69 1 6c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6z" fill={c}/><circle cx="7" cy="6" r="2" fill="white"/></svg>,
  calendar:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  card:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  lock:({s=20,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  qr:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill={c}/><rect x="16" y="5" width="3" height="3" fill={c}/><rect x="5" y="16" width="3" height="3" fill={c}/><path d="M14 14h3m0 0v3m0-3h3m-3 3v3m-3-3v3"/></svg>,
  flame:({s=22,c=orange})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2C9 6 5 8 6 14c1 5 5.5 8 9 8s8-3 8-8c0-4-2-6-4-8-1 3-2.5 4-2.5 4S14 7 12 2z"/></svg>,
  award:({s=22,c=yellow})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  gear:({s=22,c=l3})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  globe:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  mic:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  camera:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  ticket:({s=22,c=green})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M2 9a3 3 0 000 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 000-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/><line x1="9" y1="3" x2="9" y2="21" strokeDasharray="2,3"/></svg>,
  info:({s=20,c=blue})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  people:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  chart:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  building:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>,
  headphones:({s=22,c=l1})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
};

// ═══════════════════════════════════════════════════════════════
//  PRIMITIVES — iOS 26 accurate
// ═══════════════════════════════════════════════════════════════

// ── Glass NavBar — transparent, materialises on scroll ────────
const NavBar=({title,large=false,back,onBack,right,scrolled=false})=>{
  if(large){
    return <div style={{
      position:'sticky',top:0,zIndex:10,
      paddingTop:56,paddingBottom:0,
      // No background when fresh — glass appears on scroll
      background:scrolled?'var(--egl)':bg,
      backdropFilter:scrolled?'blur(40px) saturate(200%) brightness(1.05)':undefined,
      WebkitBackdropFilter:scrolled?'blur(40px) saturate(200%) brightness(1.05)':undefined,
      borderBottom:scrolled?`0.5px solid var(--es2)`:'none',
      boxShadow:scrolled?'inset 0 1px 0 var(--eglspec),0 1px 0 var(--es2)':undefined,
      transition:'background .2s,border-color .2s',
      flexShrink:0,
    }}>
      {back&&<div onClick={onBack} style={{position:'absolute',top:14,left:16,display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
        <Ic.chevL s={10} c={blue}/>
        <span style={{fontSize:17,fontFamily:FT,color:blue}}>{back}</span>
      </div>}
      {right&&<div style={{position:'absolute',top:10,right:16}}>{right}</div>}
      {!scrolled&&<div style={{padding:'12px 20px 20px'}}>
        <div style={{fontSize:34,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.8px',lineHeight:1}}>{title}</div>
      </div>}
      {scrolled&&<div style={{padding:'12px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:17,fontFamily:FD,fontWeight:600,color:l1,letterSpacing:'-.3px'}}>{title}</div>
      </div>}
    </div>;
  }
  return <div style={{
    position:'sticky',top:0,zIndex:10,flexShrink:0,
    backdropFilter:'blur(40px) saturate(200%)',
    WebkitBackdropFilter:'blur(40px) saturate(200%)',
    background:'var(--egl)',
    borderBottom:`0.5px solid var(--es2)`,
    boxShadow:'inset 0 1px 0 var(--eglspec),0 0.5px 0 var(--es2)',
    padding:'14px 16px',
    display:'flex',alignItems:'center',
  }}>
    {back&&<div onClick={onBack} className="eth-press" style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',marginRight:8}}>
      <Ic.chevL s={9} c={blue}/>
      <span style={{fontSize:17,fontFamily:FT,color:blue}}>{back}</span>
    </div>}
    <div style={{flex:1,textAlign:back?'center':'left'}}>
      <span style={{fontSize:17,fontFamily:FD,fontWeight:600,color:l1,letterSpacing:'-.3px'}}>{title}</span>
    </div>
    {right&&<div style={{marginLeft:8}}>{right}</div>}
  </div>;
};

// ── Glass Pill Button — iOS 26 style ─────────────────────────
// Primary: filled (brand green / blue)
// Glass: translucent backdrop with specular
// Ghost: just specular border
const Btn=({label,onPress,color,variant='fill',size='l',icon,style:st={}})=>{
  const c=color||green;
  const szs={l:{h:52,fs:17,r:16,px:22},m:{h:40,fs:15,r:13,px:18},s:{h:32,fs:13,r:10,px:14}};
  const sz=szs[size]||szs.l;
  const styles={
    fill:{
      background:c,
      boxShadow:`inset 0 1px 0 rgba(255,255,255,.22),0 2px 8px ${c}40`,
    },
    glass:{
      backdropFilter:'blur(24px) saturate(180%)',
      WebkitBackdropFilter:'blur(24px) saturate(180%)',
      background:'var(--egl)',
      boxShadow:'inset 0 1px 0 var(--eglspec),inset 0 -0.5px 0 var(--eglspec2),0 2px 8px rgba(0,0,0,.12)',
      border:'0.5px solid var(--eglborder)',
    },
    tint:{
      background:`${c}1A`,
      border:`0.5px solid ${c}30`,
    },
    ghost:{
      background:'transparent',
    }
  };
  const textColors={fill:'#fff',glass:l1,tint:c,ghost:c};
  return <div onClick={onPress} className="eth-press" style={{
    height:sz.h,borderRadius:sz.r,
    padding:`0 ${sz.px}px`,
    display:'flex',alignItems:'center',justifyContent:'center',gap:7,
    cursor:'pointer',overflow:'hidden',position:'relative',
    ...styles[variant]||styles.fill,...st
  }}>
    {/* Specular shimmer overlay for fill buttons */}
    {variant==='fill'&&<div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(255,255,255,.12) 0%,transparent 60%)',borderRadius:sz.r,pointerEvents:'none'}}/>}
    {icon}
    <span style={{fontSize:sz.fs,fontFamily:FD,fontWeight:600,color:textColors[variant]||'#fff',letterSpacing:'-.3px',position:'relative'}}>{label}</span>
  </div>;
};

// ── Glass Card — replaces solid Card ─────────────────────────
// iOS 26: cards are less present. Content on bg with thin separator lines.
// Use GlassCard only for floating elements (like Wallet cards, featured items)
const GlassCard=({children,style:st={},onPress})=><div onClick={onPress} className={`eth-glass${onPress?' eth-press':''}`} style={{borderRadius:22,...st}}>{children}</div>;

// Legacy Card — simple bg surface with separator
const Card=({children,style:st={},onPress})=><div onClick={onPress} className={onPress?'eth-press':''} style={{background:bg2,borderRadius:14,overflow:'hidden',...st}}>{children}</div>;

// ── Row (Settings / List) ─────────────────────────────────────
const Row=({e,icon,title,sub,value,right,onPress,last,danger,badge,inset=false})=><div
  onClick={onPress}
  className={onPress?'eth-press':''}
  style={{display:'flex',alignItems:'center',padding:inset?'12px 16px 12px 54px':'12px 16px',cursor:onPress?'pointer':'default',borderBottom:last?'none':`0.5px solid ${sep2}`,minHeight:44,background:bg2}}
>
  {(e||icon)&&!inset&&<div style={{width:30,marginRight:12,display:'flex',justifyContent:'center',alignItems:'center',flexShrink:0}}>{icon||<span style={{fontSize:20}}>{e}</span>}</div>}
  <div style={{flex:1,minWidth:0}}>
    <div style={{fontSize:17,fontFamily:FT,color:danger?red:l1,letterSpacing:'-.2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</div>
    {sub&&<div style={{fontSize:13,fontFamily:FT,color:l3,marginTop:2}}>{sub}</div>}
  </div>
  <div style={{display:'flex',alignItems:'center',gap:6,marginLeft:8,flexShrink:0}}>
    {badge&&<div style={{background:red,borderRadius:10,minWidth:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px'}}><span style={{fontSize:11,fontFamily:FT,fontWeight:700,color:'#fff'}}>{badge}</span></div>}
    {value&&<span style={{fontSize:15,fontFamily:FT,color:l3}}>{value}</span>}
    {right===undefined&&onPress&&<Ic.chevR/>}
    {right!==undefined&&right}
  </div>
</div>;

const Section=({header,footer,children,style:st={}})=><div style={{marginBottom:36,...st}}>
  {header&&<div style={{padding:'0 20px 7px',fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px'}}>{header}</div>}
  <div style={{borderRadius:14,overflow:'hidden',borderTop:`0.5px solid ${sep2}`,borderBottom:`0.5px solid ${sep2}`}}>{children}</div>
  {footer&&<div style={{padding:'8px 20px 0',fontSize:13,fontFamily:FT,color:l3,lineHeight:1.4}}>{footer}</div>}
</div>;

// ── SearchBar — iOS 26: glass material ───────────────────────
const SearchBar=({q,setQ,placeholder='Поиск',style:st={}})=><div style={{
  display:'flex',alignItems:'center',
  backdropFilter:'blur(24px) saturate(180%)',
  WebkitBackdropFilter:'blur(24px) saturate(180%)',
  background:'var(--ef2)',
  borderRadius:14,padding:'9px 13px',gap:8,
  border:'0.5px solid var(--es2)',
  boxShadow:'inset 0 0.5px 0 var(--eglspec)',
  ...st
}}>
  <Ic.search s={15} c={l3}/>
  <input
    value={q} onChange={e=>setQ(e.target.value)}
    placeholder={placeholder}
    style={{flex:1,fontSize:17,fontFamily:FT,color:l1,letterSpacing:'-.2px'}}
    autoComplete="off"
  />
  {q&&<div onClick={()=>setQ('')} className="eth-press-sm" style={{width:18,height:18,borderRadius:9,background:f1,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
    <Ic.xmark s={8} c={l3}/>
  </div>}
</div>;

// ── Filter Pills — iOS 26 glass variant ──────────────────────
const FilterPills=({items,active,set,style:st={}})=><div style={{display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none',...st}}>
  {items.map((it,i)=>{
    const a=active===it;
    return <div key={i} onClick={()=>set(it)} className="eth-press" style={{
      flexShrink:0,height:36,borderRadius:18,
      padding:'0 17px',display:'flex',alignItems:'center',cursor:'pointer',
      // active: glass + brand tint; inactive: glass pill
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      background:a?green:'var(--ef2)',
      border:a?'none':'0.5px solid var(--es2)',
      boxShadow:a
        ?`inset 0 1px 0 rgba(255,255,255,.22),0 2px 6px ${green}30`
        :'inset 0 0.5px 0 var(--eglspec)',
      transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
    }}>
      <span style={{fontSize:14,fontFamily:FT,fontWeight:a?600:400,color:a?'#fff':l2,letterSpacing:'-.1px'}}>{it}</span>
    </div>;
  })}
</div>;

const Tag=({label,color,small})=>{const c=color||green;return<div style={{background:`${c}18`,borderRadius:8,padding:small?'2px 8px':'4px 11px',display:'inline-flex',border:`0.5px solid ${c}25`}}>
  <span style={{fontSize:small?10:12,fontFamily:FT,fontWeight:600,color:c,letterSpacing:'.1px'}}>{label}</span>
</div>;};

const Stars=({r=4.9,n})=><div style={{display:'flex',alignItems:'center',gap:3}}>
  <Ic.star s={11} c={yellow}/>
  <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:yellow}}>{Number(r).toFixed(1)}</span>
  {n&&<span style={{fontSize:11,fontFamily:FT,color:l3}}>({n})</span>}
</div>;

// ── Glass primitive (legacy compat) ──────────────────────────
const Glass=({children,style:st={}})=><div className="eth-glass" style={{borderRadius:18,...st}}>{children}</div>;

// ── Toggle ────────────────────────────────────────────────────
const Toggle=({on,set})=><div onClick={()=>set(!on)} style={{width:51,height:31,borderRadius:16,background:on?green:'var(--ef1)',position:'relative',cursor:'pointer',transition:'background .25s',flexShrink:0}}>
  <div style={{
    width:27,height:27,borderRadius:14,background:'#fff',
    position:'absolute',top:2,left:on?22:2,
    transition:'left .28s cubic-bezier(.34,1.56,.64,1)',
    boxShadow:'0 2px 8px rgba(0,0,0,.25)',
  }}/>
</div>;

const NotifDot=({n})=>n?<div style={{position:'absolute',top:-3,right:-3,width:18,height:18,borderRadius:9,background:red,border:`2px solid ${bg}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
  <span style={{fontSize:9,fontFamily:FT,fontWeight:700,color:'#fff'}}>{n>9?'9+':n}</span>
</div>:null;

const PriceLine=({v,prev,sz=20})=><div style={{display:'flex',alignItems:'baseline',gap:6}}>
  <span style={{fontSize:sz,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.5px'}}>{Number(v).toLocaleString('ru-RU')} ₽</span>
  {prev&&<span style={{fontSize:sz*.7,fontFamily:FT,color:l3,textDecoration:'line-through'}}>{Number(prev).toLocaleString('ru-RU')} ₽</span>}
</div>;

// ── HeroCard — App Store editorial card style ─────────────────
const HeroCard=({gradient,emoji,tag,title,sub,onPress,w='82vw',h=220})=><div onClick={onPress} className="eth-press" style={{
  flexShrink:0,width:w,height:h,borderRadius:24,overflow:'hidden',
  cursor:'pointer',position:'relative',
  boxShadow:'0 8px 32px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.14)',
  scrollSnapAlign:'start',
}}>
  <div style={{position:'absolute',inset:0,background:gradient||`linear-gradient(145deg,${G},${Gm})`}}/>
  {emoji&&<div style={{position:'absolute',right:16,top:16,fontSize:80,opacity:.22,lineHeight:1,filter:'blur(1px)'}}>{emoji}</div>}
  {/* Scrim for legibility */}
  <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.04) 0%,transparent 35%,rgba(0,0,0,.5) 100%)'}}/>
  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:20}}>
    {tag&&<div style={{
      backdropFilter:'blur(16px) saturate(180%)',
      WebkitBackdropFilter:'blur(16px) saturate(180%)',
      background:'rgba(255,255,255,.18)',
      border:'0.5px solid rgba(255,255,255,.28)',
      boxShadow:'inset 0 1px 0 rgba(255,255,255,.22)',
      borderRadius:9,padding:'3px 10px',display:'inline-flex',marginBottom:8,
    }}>
      <span style={{fontSize:11,fontFamily:FT,fontWeight:700,color:'#fff',letterSpacing:'.2px'}}>{tag}</span>
    </div>}
    <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px',lineHeight:1.2}}>{title}</div>
    <div style={{fontSize:14,fontFamily:FT,color:'rgba(255,255,255,.8)',marginTop:4,letterSpacing:'-.1px'}}>{sub}</div>
  </div>
</div>;

// ── ServiceTile — looser, App Store feel ─────────────────────
const ServiceTile=({icon,emoji,title,color,onPress})=><div onClick={onPress} className="eth-press" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,cursor:'pointer'}}>
  <div style={{
    width:58,height:58,borderRadius:17,
    backdropFilter:'blur(20px) saturate(180%)',
    WebkitBackdropFilter:'blur(20px) saturate(180%)',
    background:`${color||green}16`,
    border:`0.5px solid ${color||green}28`,
    boxShadow:`inset 0 1px 0 ${color||green}30`,
    display:'flex',alignItems:'center',justifyContent:'center',
  }}>
    {icon||<span style={{fontSize:25}}>{emoji}</span>}
  </div>
  <span style={{fontSize:11,fontFamily:FT,fontWeight:500,color:l3,textAlign:'center',lineHeight:1.3,letterSpacing:'-.05px',maxWidth:60}}>{title}</span>
</div>;

const Skeleton=({w='100%',h=16,r=8})=><div className="eth-shimmer" style={{width:w,height:h,borderRadius:r}}/>;

// ── Scroll-aware hook ─────────────────────────────────────────
// Returns scrolled (bool) and scrollDir ('up'/'down') for a scrollable ref
function useScrollState(ref){
  const[scrolled,setScrolled]=useState(false);
  const[dir,setDir]=useState('up');
  const prev=useRef(0);
  useEffect(()=>{
    const el=ref?.current;
    if(!el)return;
    const handler=()=>{
      const top=el.scrollTop;
      setScrolled(top>10);
      setDir(top>prev.current?'down':'up');
      prev.current=top;
    };
    el.addEventListener('scroll',handler,{passive:true});
    return()=>el.removeEventListener('scroll',handler);
  },[ref]);
  return{scrolled,scrollingDown:dir==='down'};
}

// ── FLOATING TABBAR — iOS 26 signature component ─────────────
function FloatingTabBar({tabs,active,setActive,scrollingDown=false}){
  const compact=scrollingDown;
  return <div className="eth-tabbar">
    <div className={`eth-tabbar-pill eth-glass${compact?' compact':''}`} style={{gap:compact?4:0}}>
      {tabs.map((t,i)=>{
        const a=active===i;
        return <div
          key={i}
          onClick={()=>setActive(i)}
          className={`eth-tabbar-item${compact?' compact':''}`}
          style={{
            opacity:a?1:.55,
            transform:a&&!compact?'scale(1.05)':'scale(1)',
            transition:'all .28s cubic-bezier(.34,1.3,.64,1)',
          }}
        >
          {/* Active indicator dot — like Wallet app */}
          <div style={{position:'relative'}}>
            {a&&<div style={{
              position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',
              width:4,height:4,borderRadius:2,
              background:green,
              boxShadow:`0 0 6px ${green}80`,
            }}/>}
            <t.Icon s={24} c={a?green:l2}/>
          </div>
          <span className={`eth-tabbar-label${compact?' hidden':''}`} style={{color:a?green:l3}}>
            {t.label}
          </span>
        </div>;
      })}
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  HOME SCREEN v8 — Citizen Dashboard
//  Concept: App = Citizen Passport, shows travel progress
// ═══════════════════════════════════════════════════════════════
function HomeScreen({push,setMainTab}){
  const hr=new Date().getHours();
  const greet=hr<5?'Доброй ночи':hr<12?'Доброе утро':hr<17?'Добрый день':'Добрый вечер';
  const scrollRef=useRef(null);
  const{scrolled}=useScrollState(scrollRef);

  // Citizen data
  const visitedCountries=COUNTRIES.filter(c=>c.visited);
  const totalStamps=visitedCountries.reduce((s,c)=>s+c.stamps,0);
  const level=totalStamps>=500?4:totalStamps>=100?3:totalStamps>=5?2:totalStamps>=1?1:0;
  const lvl=CITIZENSHIP_LEVELS[level];
  const nextLvl=CITIZENSHIP_LEVELS[Math.min(level+1,4)];

  const featured=[
    {g:'linear-gradient(145deg,#0f2a1a,#1B4332,#0d3b22)',em:'🌿',tag:'Открыто сейчас',title:'Масленица 2026',sub:'1–8 марта · Гуляния весь день',s:'events'},
    {g:'linear-gradient(145deg,#0a2030,#1a4060,#0d3050)',em:'🏔',tag:'Новинка',title:'Гималайский дом',sub:'Непал · от 5 200 ₽/ночь',s:'hotels'},
    {g:'linear-gradient(145deg,#2a0a3a,#5a1070,#3a0560)',em:'🎭',tag:'−30%',title:'Мастер-классы',sub:'Гончарство, роспись, ткачество',s:'masterclasses'},
    {g:'linear-gradient(145deg,#1a1200,#3a2a00,#2a1e00)',em:'⛺',tag:'Топ недели',title:'Глэмпинг',sub:'Этнические шатры · Природа',s:'glamping'},
  ];

  const services=[
    {em:'🌍',title:'Страны',s:'countries',c:'var(--eblue)'},
    {em:'🎟',title:'Билеты',s:'tickets',c:'var(--egreen)'},
    {em:'🏨',title:'Отели',s:'hotels',c:'var(--ete)'},
    {em:'🍜',title:'Рестораны',s:'food',c:'var(--eor)'},
    {em:'🔥',title:'Бани',s:'banya',c:'var(--ered)'},
    {em:'💆',title:'СПА',s:'spa',c:'var(--epk)'},
    {em:'🎭',title:'События',s:'events',c:'var(--epu)'},
    {em:'🗝',title:'Квесты',s:'quests',c:'var(--epu)'},
    {em:'🏺',title:'Мастер-кл',s:'masterclasses',c:'#A2845E'},
    {em:'🧭',title:'Экскурсии',s:'excursions',c:'var(--eblue)'},
    {em:'🦜',title:'Зоопарк',s:'zoo',c:'var(--egreen)'},
    {em:'🏛',title:'Музеи',s:'museums',c:'var(--ered)'},
    {em:'🖼',title:'Выставки',s:'exhibitions',c:'var(--ein)'},
    {em:'🏡',title:'Недвиж.',s:'realestate',c:'var(--epk)'},
    {em:'🤝',title:'Франшиза',s:'franchise',c:'var(--eye)'},
    {em:'🎡',title:'Аттракц.',s:'attractions',c:'var(--eye)'},
    {em:'🏕',title:'Глэмпинг',s:'glamping',c:'var(--egreen)'},
    {em:'🚲',title:'Прокат',s:'rental',c:'var(--ete)'},
    {em:'🚌',title:'Автотуры',s:'bustours',c:'var(--eor)'},
    {em:'💒',title:'Праздники',s:'weddings',c:'var(--epk)'},
  ];

  const today=[
    {t:'14:00',em:'🏺',n:'Гончарный МК',l:'Ремесленный двор'},
    {t:'16:30',em:'🍛',n:'Мастер кулинар',l:'Индийский зал'},
    {t:'19:00',em:'🔥',n:'Шоу огня',l:'Центральная сцена'},
  ];

  // Next unvisited country to explore
  const nextCountry=COUNTRIES.find(c=>!c.visited);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg,position:'relative'}}>
    {/* Sticky NavBar */}
    <div style={{
      position:'sticky',top:0,zIndex:20,flexShrink:0,
      transition:'all .2s',
      backdropFilter:scrolled?'blur(40px) saturate(200%)':'none',
      WebkitBackdropFilter:scrolled?'blur(40px) saturate(200%)':'none',
      background:scrolled?'var(--egl)':'transparent',
      borderBottom:scrolled?`0.5px solid var(--es2)`:'none',
      boxShadow:scrolled?'inset 0 1px 0 var(--eglspec)':undefined,
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',paddingTop:scrolled?14:56}}>
        {scrolled
          ?<span style={{fontSize:17,fontFamily:FD,fontWeight:600,color:l1,letterSpacing:'-.3px'}}>Этномир</span>
          :<div>
            <div style={{fontSize:13,fontFamily:FT,color:l3,marginBottom:1}}>{greet}</div>
            <div style={{fontSize:34,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.8px',lineHeight:1.05}}>Этномир</div>
          </div>
        }
        <div style={{display:'flex',gap:10}}>
          <div onClick={()=>push('search')} className="eth-press-sm" style={{width:36,height:36,borderRadius:18,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',background:'var(--ef2)',border:'0.5px solid var(--es2)',boxShadow:'inset 0 0.5px 0 var(--eglspec)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <Ic.search s={15} c={l2}/>
          </div>
          <div onClick={()=>push('passport')} className="eth-press-sm" style={{width:36,height:36,borderRadius:18,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',background:`${green}15`,border:`0.5px solid ${green}40`,boxShadow:'inset 0 0.5px 0 var(--eglspec)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <span style={{fontSize:18}}>🛂</span>
          </div>
        </div>
      </div>
    </div>

    <div ref={scrollRef} style={{flex:1,overflowY:'auto'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:320,background:'linear-gradient(180deg,#0a1f14 0%,transparent 100%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1}}>

        {/* Weather pill */}
        <div style={{padding:'0 20px 16px'}}>
          <div onClick={()=>push('park')} className="eth-press" style={{
            display:'flex',alignItems:'center',gap:12,
            backdropFilter:'blur(24px) saturate(180%)',
            WebkitBackdropFilter:'blur(24px) saturate(180%)',
            background:'var(--ef2)',
            border:'0.5px solid var(--eglborder)',
            boxShadow:'inset 0 1px 0 var(--eglspec),0 2px 12px rgba(0,0,0,.12)',
            borderRadius:16,padding:'12px 15px',cursor:'pointer',
          }}>
            <span style={{fontSize:28,flexShrink:0}}>🌤</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.2px'}}>Калужская обл. · −3°C</div>
              <div style={{fontSize:12,fontFamily:FT,color:l3}}>Парк открыт · 09:00 — 22:00</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:6,height:6,borderRadius:3,background:green,boxShadow:`0 0 6px ${green}80`}}/>
              <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:green}}>Сейчас</span>
            </div>
          </div>
        </div>

        {/* ── CITIZEN PASSPORT CARD ── */}
        <div style={{padding:'0 20px',marginBottom:28}}>
          <div onClick={()=>push('passport')} className="eth-press" style={{
            background:`linear-gradient(145deg,${G} 0%,${Gm} 60%,#1e6b42 100%)`,
            borderRadius:22,padding:'18px 20px',cursor:'pointer',position:'relative',overflow:'hidden',
            boxShadow:`0 12px 40px rgba(27,67,50,.45),0 4px 12px rgba(0,0,0,.2)`,
          }}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:60,background:'linear-gradient(180deg,rgba(255,255,255,.1),transparent)',borderRadius:'22px 22px 0 0',pointerEvents:'none'}}/>
            <div style={{position:'absolute',right:-15,top:-15,width:100,height:100,borderRadius:50,background:'rgba(255,255,255,.05)',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,position:'relative'}}>
              <div>
                <div style={{fontSize:10,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.5)',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:4}}>Паспорт гражданина</div>
                <div style={{fontSize:19,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.3px'}}>Иван Петров</div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:5}}>
                  <span style={{fontSize:14}}>{lvl.emoji}</span>
                  <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:lvl.color}}>{lvl.title}</span>
                  <span style={{fontSize:10,fontFamily:FT,color:'rgba(255,255,255,.4)'}}>· ETH-2024-00847</span>
                </div>
              </div>
              <div style={{backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',background:'rgba(255,255,255,.12)',border:'0.5px solid rgba(255,255,255,.2)',borderRadius:12,padding:'10px 12px'}}>
                <Ic.qr s={24} c="#fff"/>
              </div>
            </div>
            {/* Countries visited */}
            <div style={{display:'flex',gap:4,marginBottom:10,flexWrap:'wrap'}}>
              {visitedCountries.slice(0,8).map(c=><span key={c.id} style={{fontSize:16}}>{c.flag}</span>)}
              {visitedCountries.length===0&&<span style={{fontSize:12,fontFamily:FT,color:'rgba(255,255,255,.4)'}}>Посетите первую страну</span>}
            </div>
            {/* Progress to next level */}
            <div style={{background:'rgba(255,255,255,.12)',borderRadius:6,height:4}}>
              <div style={{width:`${Math.min(totalStamps/(nextLvl.min||1)*100,100)}%`,height:'100%',background:lvl.color,borderRadius:6,transition:'width .5s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
              <span style={{fontSize:10,fontFamily:FT,color:'rgba(255,255,255,.4)'}}>
                {visitedCountries.length} стран · {totalStamps} штампов
              </span>
              <span style={{fontSize:10,fontFamily:FT,color:'rgba(255,255,255,.4)'}}>
                до «{nextLvl.title}»
              </span>
            </div>
          </div>
        </div>

        {/* ── Next country to explore ── */}
        {nextCountry&&<div style={{padding:'0 20px',marginBottom:28}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
            <span style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>Следующее путешествие</span>
            <span onClick={()=>push('countries')} style={{fontSize:14,fontFamily:FT,color:blue,cursor:'pointer'}}>Все страны</span>
          </div>
          <div onClick={()=>push('country',{id:nextCountry.id})} className="eth-press" style={{
            borderRadius:20,overflow:'hidden',height:140,cursor:'pointer',position:'relative',
            background:nextCountry.grad,
            boxShadow:`0 8px 28px ${nextCountry.color}30`,
          }}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(0,0,0,.5),rgba(0,0,0,.2))'}}/>
            <div style={{position:'absolute',inset:0,padding:'18px 20px',display:'flex',alignItems:'center',gap:16}}>
              <div style={{fontSize:52}}>{nextCountry.flag}</div>
              <div>
                <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.6)',letterSpacing:'.3px',textTransform:'uppercase',marginBottom:4}}>Не посещена</div>
                <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px'}}>{nextCountry.name}</div>
                <div style={{fontSize:13,fontFamily:FT,color:'rgba(255,255,255,.65)',marginTop:3}}>{nextCountry.hotel.desc}</div>
              </div>
            </div>
            <div style={{position:'absolute',right:16,bottom:16,backdropFilter:'blur(12px)',background:'rgba(255,255,255,.15)',border:'0.5px solid rgba(255,255,255,.22)',borderRadius:10,padding:'5px 13px'}}>
              <span style={{fontSize:13,fontFamily:FT,fontWeight:600,color:'#fff'}}>Исследовать →</span>
            </div>
          </div>
        </div>}

        {/* Featured carousel */}
        <div style={{marginBottom:32}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'0 20px 14px'}}>
            <span style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>Рекомендуем</span>
            <span onClick={()=>push('search')} style={{fontSize:14,fontFamily:FT,color:blue,cursor:'pointer'}}>Показать все</span>
          </div>
          <div style={{display:'flex',gap:14,overflowX:'auto',padding:'4px 20px 8px',scrollbarWidth:'none',scrollSnapType:'x mandatory'}}>
            {featured.map((f,i)=><HeroCard key={i} gradient={f.g} emoji={f.em} tag={f.tag} title={f.title} sub={f.sub} onPress={()=>push(f.s)}/>)}
          </div>
        </div>

        {/* Services grid */}
        <div style={{padding:'0 20px',marginBottom:32}}>
          <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px',marginBottom:16}}>Всё для путника</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
            {services.map((s,i)=><ServiceTile key={i} emoji={s.em} title={s.title} color={s.c} onPress={()=>push(s.s)}/>)}
          </div>
        </div>

        {/* Today */}
        <div style={{padding:'0 20px',marginBottom:32}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}>
            <span style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>Сегодня в парке</span>
            <span onClick={()=>push('events')} style={{fontSize:14,fontFamily:FT,color:blue,cursor:'pointer'}}>Расписание</span>
          </div>
          <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`}}>
            {today.map((ev,i)=><div key={i} onClick={()=>push('events')} className="eth-press" style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:bg2,borderBottom:i<today.length-1?`0.5px solid ${sep2}`:'none',cursor:'pointer'}}>
              <div style={{width:44,height:44,borderRadius:13,background:'var(--ef2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{ev.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.2px'}}>{ev.n}</div>
                <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{ev.l}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontFamily:FD,fontWeight:600,color:l2,letterSpacing:'-.2px'}}>{ev.t}</div>
              </div>
            </div>)}
          </div>
        </div>

        {/* Real Estate & Franchise teaser */}
        <div style={{padding:'0 20px',marginBottom:24}}>
          <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px',marginBottom:14}}>Стать частью Этномира</div>
          <div style={{display:'flex',gap:12}}>
            <div onClick={()=>push('realestate')} className="eth-press" style={{
              flex:1,borderRadius:18,padding:'16px',cursor:'pointer',
              background:'linear-gradient(135deg,#0a1f2a,#0f3040)',
              border:'0.5px solid rgba(10,132,255,.2)',
              boxShadow:'0 4px 16px rgba(10,132,255,.1)',
            }}>
              <span style={{fontSize:28,display:'block',marginBottom:8}}>🏡</span>
              <div style={{fontSize:14,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.2px',marginBottom:2}}>Недвижимость</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.5)'}}>Земля, дома, апарт.</div>
            </div>
            <div onClick={()=>push('franchise')} className="eth-press" style={{
              flex:1,borderRadius:18,padding:'16px',cursor:'pointer',
              background:'linear-gradient(135deg,#1a1200,#3a2800)',
              border:'0.5px solid rgba(255,215,0,.15)',
              boxShadow:'0 4px 16px rgba(255,215,0,.08)',
            }}>
              <span style={{fontSize:28,display:'block',marginBottom:8}}>🤝</span>
              <div style={{fontSize:14,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.2px',marginBottom:2}}>Франшиза</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.5)'}}>Бизнес партнёрство</div>
            </div>
          </div>
        </div>

        <div style={{height:110}}/>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PROFILE SCREEN v8 — Citizen Profile
//  Full passport holder dashboard
// ═══════════════════════════════════════════════════════════════
function ProfileScreen({push}){
  const[notif,setNotif]=useState(true);
  const[geo,setGeo]=useState(true);
  const visitedCountries=COUNTRIES.filter(c=>c.visited);
  const totalStamps=visitedCountries.reduce((s,c)=>s+c.stamps,0);
  const level=totalStamps>=500?4:totalStamps>=100?3:totalStamps>=5?2:totalStamps>=1?1:0;
  const lvl=CITIZENSHIP_LEVELS[level];

  const stats=[
    [String(visitedCountries.length),'Стран'],
    ['3','Брони'],
    [String(totalStamps),'Штампов'],
    ['1 247','Баллов'],
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg,overflowY:'auto'}}>
    {/* Hero gradient */}
    <div style={{background:`linear-gradient(160deg,#0a1f15,#122a1e,${bg})`,padding:'56px 20px 24px',flexShrink:0}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:20}}>
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:72,height:72,borderRadius:22,background:`linear-gradient(145deg,${G},${Gm})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34}}>👤</div>
          <div onClick={()=>push('profileedit')} style={{position:'absolute',bottom:-3,right:-3,width:22,height:22,borderRadius:7,background:blue,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:`2px solid ${bg}`}}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M8.5.5l3 3L3 12H0V9L8.5.5z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{flex:1,paddingTop:4}}>
          <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.5px'}}>Иван Петров</div>
          <div style={{fontSize:13,fontFamily:FT,color:l3,marginTop:1}}>ETH-2024-00847 · ivan@example.com</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:5,background:`${lvl.color}18`,borderRadius:10,padding:'4px 10px',marginTop:8,border:`0.5px solid ${lvl.color}30`}}>
            <span style={{fontSize:12}}>{lvl.emoji}</span>
            <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:lvl.color}}>{lvl.title}</span>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {stats.map(([v,l_],i)=><div key={i} style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(10px)',borderRadius:14,padding:'10px 0',textAlign:'center',border:'0.5px solid rgba(255,255,255,.06)'}}>
          <div style={{fontSize:17,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>{v}</div>
          <div style={{fontSize:10,fontFamily:FT,color:l3,marginTop:2}}>{l_}</div>
        </div>)}
      </div>
    </div>

    <div style={{padding:'0 20px 100px'}}>
      {/* Quick actions */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:28,marginTop:4}}>
        {[
          {icon:'🛂',t:'Мой паспорт',s:'passport',c:green},
          {icon:'🌍',t:'Мои страны',s:'countries',c:blue},
          {icon:'🏡',t:'Недвижимость',s:'realestate',c:'#0A84FF'},
          {icon:'🎟',t:'Мои брони',s:'bookings',c:purple},
          {icon:'⭐',t:'Бонусы',s:'loyalty',c:yellow},
          {icon:'📜',t:'Сертификаты',s:'certs',c:teal},
        ].map((a,i)=><div key={i} onClick={()=>push(a.s)} className="eth-press" style={{
          background:bg2,borderRadius:16,padding:'14px 16px',cursor:'pointer',
          display:'flex',alignItems:'center',gap:12,
          border:`0.5px solid ${sep2}`,
        }}>
          <div style={{width:34,height:34,borderRadius:10,background:`${a.c}15`,border:`0.5px solid ${a.c}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{a.icon}</div>
          <span style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.1px'}}>{a.t}</span>
        </div>)}
      </div>

      <Section header="Аккаунт">
        <Row icon={<Ic.person s={18} c={l2}/>} title="Редактировать профиль" onPress={()=>push('profileedit')}/>
        <Row icon={<Ic.lock s={16} c={l2}/>} title="Безопасность" onPress={()=>push('settings')}/>
        <Row icon={<Ic.globe s={18} c={l2}/>} title="Язык" value="Русский" onPress={()=>push('settings')} last/>
      </Section>

      <Section header="Подписки & Партнёрство">
        <Row icon={<span style={{fontSize:16}}>🤝</span>} title="Франшиза Этномира" sub="Открыть бизнес" onPress={()=>push('franchise')}/>
        <Row icon={<span style={{fontSize:16}}>🏡</span>} title="Недвижимость" sub="Купить или арендовать" onPress={()=>push('realestate')}/>
        <Row icon={<Ic.award s={18} c={yellow}/>} title="Подписки" onPress={()=>push('subs')} last/>
      </Section>

      <Section header="Уведомления">
        <Row icon={<Ic.bell s={18} c={l2}/>} title="Push-уведомления" right={<Toggle on={notif} set={setNotif}/>}/>
        <Row icon={<Ic.info s={18} c={blue}/>} title="Новости и акции" right={<Toggle on={false} set={()=>{}}/>} last/>
      </Section>

      <Section header="Поддержка">
        <Row icon={<Ic.info s={18} c={blue}/>} title="О приложении" value="v8.0" onPress={()=>{}}/>
        <Row icon={<Ic.share s={18} c={blue}/>} title="Поделиться" onPress={()=>{}} last/>
      </Section>

      <Btn label="Выйти из аккаунта" onPress={()=>{}} variant="tint" color={red} style={{marginTop:4}}/>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  FOOD SCREEN v9 — Рестораны по странам Этномира
// ═══════════════════════════════════════════════════════════════
function FoodSC({push,pop}){
  const[country,setCountry]=useState('all');
  const[meal,setMeal]=useState('all'); // all | breakfast | lunch | dinner

  // Build full restaurant list from COUNTRIES + standalones
  const allRestaurants=[
    // From countries
    {id:'india-soul',country:'india',name:'Индийская душа',emoji:'🍛',cuisine:'Индийская',desc:'Карри, тандур, масала, дал',price:'500–3 500',priceN:500,rating:4.8,nr:342,open:true,wait:15,tags:['Специи','Вегетарианское','Халяль']},
    {id:'india-chai',country:'india',name:'Масала-чай',emoji:'☕',cuisine:'Индийская кафе',desc:'Чай масала, самоса, ладду',price:'200–1 200',priceN:200,rating:4.7,nr:189,open:true,wait:5,tags:['Веган','Быстро']},
    {id:'nepal-chai',country:'nepal',name:'Гималайская чайхана',emoji:'🫖',cuisine:'Непальская',desc:'Момо, дал-бат, тибетский чай',price:'400–2 800',priceN:400,rating:4.6,nr:156,open:true,wait:20,tags:['Аутентично']},
    {id:'srilanka-sea',country:'srilanka',name:'Океан и Я',emoji:'🦞',cuisine:'Морепродукты',desc:'Устрицы, лобстер, рыба на гриле',price:'800–6 000',priceN:800,rating:4.9,nr:412,open:true,wait:35,tags:['Премиум','Морепродукты']},
    {id:'srilanka-spice',country:'srilanka',name:'Пряный берег',emoji:'🍲',cuisine:'Шри-Ланкийская',desc:'Котту, стрингхоппер, девил',price:'500–2 500',priceN:500,rating:4.7,nr:203,open:true,wait:20,tags:['Острое','Аутентично']},
    {id:'eastasia-wok',country:'eastasia',name:'Вок & Мир',emoji:'🍜',cuisine:'Паназиатская',desc:'Фо-бо, пад-тай, димсам, рамен',price:'500–2 500',priceN:500,rating:4.6,nr:278,open:true,wait:15,tags:['Быстро','Лапша']},
    {id:'eastasia-tea',country:'eastasia',name:'Чайный дом',emoji:'🍵',cuisine:'Китайская чайная',desc:'Улун, пуэр, пельмени',price:'300–1 800',priceN:300,rating:4.8,nr:165,open:true,wait:10,tags:['Тихо','Чай']},
    {id:'sea-thai',country:'sea',name:'Краснодеревщик',emoji:'🥥',cuisine:'Тайская',desc:'Том-ям, пад-тай, зелёное карри',price:'500–2 500',priceN:500,rating:4.7,nr:234,open:false,wait:0,tags:['Острое','Веган']},
    {id:'centralasia-plov',country:'centralasia',name:'Самаркандский плов',emoji:'🍚',cuisine:'Узбекская',desc:'Плов, манты, самса, лагман',price:'400–2 800',priceN:400,rating:4.8,nr:389,open:true,wait:20,tags:['Халяль','Сытно']},
    {id:'centralasia-az',country:'centralasia',name:'Кафе Азербайджан',emoji:'🥩',cuisine:'Кавказская',desc:'Люля-кебаб, долма, пити, пахлава',price:'400–2 200',priceN:400,rating:4.7,nr:267,open:true,wait:15,tags:['Гриль','Халяль']},
    {id:'siberia-rus',country:'siberia',name:'Русская трапезная',emoji:'🥣',cuisine:'Русская',desc:'Щи, борщ, пироги, уха, блины',price:'300–1 800',priceN:300,rating:4.5,nr:445,open:true,wait:10,tags:['Домашнее','Сытно']},
    {id:'ukraine-var',country:'ukraine',name:'Украинская хата',emoji:'🥟',cuisine:'Украинская',desc:'Борщ, вареники, деруны, голубцы',price:'300–1 800',priceN:300,rating:4.6,nr:312,open:true,wait:15,tags:['Домашнее']},
    {id:'belarus-dran',country:'belarus',name:'Белорусская кухня',emoji:'🥔',cuisine:'Белорусская',desc:'Драники, мачанка, колдуны',price:'300–1 600',priceN:300,rating:4.5,nr:198,open:true,wait:10,tags:['Домашнее']},
    // Standalone
    {id:'bakery',country:null,name:'Этнопекарня',emoji:'🥐',cuisine:'Выпечка',desc:'Хлеб народов мира, круассаны',price:'200–800',priceN:200,rating:4.9,nr:521,open:true,wait:5,tags:['Завтрак','Быстро','Веган']},
    {id:'bbq',country:null,name:'Этно-барбекю',emoji:'🔥',cuisine:'Гриль',desc:'Мясо на углях, овощи, соусы',price:'600–3 500',priceN:600,rating:4.7,nr:287,open:true,wait:25,tags:['Гриль','На улице']},
    {id:'icecream',country:null,name:'Мороженое мира',emoji:'🍦',cuisine:'Десерты',desc:'Мороженое из 20 стран мира',price:'150–600',priceN:150,rating:4.9,nr:634,open:true,wait:3,tags:['Десерт','Дети']},
  ];

  const countries=[{id:'all',flag:'🌍',name:'Все'},...COUNTRIES.filter(c=>allRestaurants.some(r=>r.country===c.id))];

  const shown=allRestaurants.filter(r=>{
    if(country!=='all'&&r.country!==country) return false;
    return true;
  });

  const openNow=shown.filter(r=>r.open).length;

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Рестораны Этномира" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:green}}>● {openNow} открыто</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      {/* Country filter strip */}
      <div style={{padding:'4px 20px 0',flexShrink:0}}>
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:12,scrollbarWidth:'none'}}>
          {countries.map(c=>{
            const active=country===c.id;
            return <div key={c.id} onClick={()=>setCountry(c.id)} className="eth-press" style={{
              flexShrink:0,height:40,borderRadius:20,
              backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
              background:active?green:'var(--ef2)',
              border:active?'none':'0.5px solid var(--es2)',
              boxShadow:active?`inset 0 1px 0 rgba(255,255,255,.22),0 2px 8px ${green}30`:'inset 0 0.5px 0 var(--eglspec)',
              padding:'0 14px',display:'flex',alignItems:'center',gap:6,cursor:'pointer',
              transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
            }}>
              <span style={{fontSize:16}}>{c.flag}</span>
              <span style={{fontSize:13,fontFamily:FT,fontWeight:active?600:400,color:active?'#fff':l2,whiteSpace:'nowrap'}}>{c.name}</span>
            </div>;
          })}
        </div>

        {/* Section header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <span style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px'}}>
            {country==='all'?`Все рестораны (${shown.length})`:`${COUNTRIES.find(c=>c.id===country)?.name||''} · ${shown.length}`}
          </span>
        </div>
      </div>

      {/* Restaurant cards */}
      <div style={{padding:'0 20px',paddingBottom:100}}>
        {shown.map((r,i)=>{
          const ctry=COUNTRIES.find(c=>c.id===r.country);
          return <div key={r.id} onClick={()=>push('food')} className="eth-press" style={{
            borderRadius:18,overflow:'hidden',marginBottom:14,cursor:'pointer',
            background:bg2,border:`0.5px solid ${sep2}`,
          }}>
            {/* Color band header */}
            <div style={{
              height:6,
              background:ctry?ctry.grad:`linear-gradient(90deg,${green},${teal})`,
            }}/>
            <div style={{padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:13}}>
                {/* Emoji icon */}
                <div style={{
                  width:56,height:56,borderRadius:16,flexShrink:0,
                  background:ctry?`${ctry.color}12`:'var(--ef2)',
                  border:`0.5px solid ${ctry?ctry.color+'25':'var(--es2)'}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:28,
                }}>
                  {r.emoji}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                    <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{r.name}</span>
                    {ctry&&<span style={{fontSize:14}}>{ctry.flag}</span>}
                  </div>
                  <div style={{fontSize:12,fontFamily:FT,color:l3,marginBottom:6}}>{r.cuisine} · {r.desc}</div>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                    <div style={{display:'flex',alignItems:'center',gap:3}}>
                      <Ic.star s={10} c={yellow}/>
                      <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:yellow}}>{r.rating}</span>
                      <span style={{fontSize:11,fontFamily:FT,color:l4}}>({r.nr})</span>
                    </div>
                    <div style={{
                      height:20,borderRadius:6,
                      background:r.open?`${green}15`:`${red}15`,
                      border:`0.5px solid ${r.open?green+'30':red+'30'}`,
                      padding:'0 8px',display:'flex',alignItems:'center',
                    }}>
                      <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:r.open?green:red}}>
                        {r.open?`Открыто · ${r.wait} мин`:'Закрыто'}
                      </span>
                    </div>
                    <span style={{fontSize:12,fontFamily:FT,color:l3}}>{r.price} ₽</span>
                  </div>
                </div>
              </div>
              {/* Tags */}
              <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                {r.tags.map((t,j)=><span key={j} style={{
                  fontSize:11,fontFamily:FT,color:l3,
                  background:'var(--ef3)',borderRadius:7,padding:'3px 9px',
                  border:`0.5px solid ${sep2}`,
                }}>{t}</span>)}
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  HOTELS SCREEN v9 — Отели по странам Этномира
// ═══════════════════════════════════════════════════════════════
function HotelsScreen({push,pop}){
  const[country,setCountry]=useState('all');
  const[sort,setSort]=useState('rating'); // rating | price | new

  // Build full hotel list from COUNTRIES
  const allHotels=COUNTRIES.map(c=>({
    id:c.id,
    country:c,
    name:c.hotel.n,
    desc:c.hotel.desc,
    price:c.hotel.p,
    rating:[4.9,4.8,4.9,4.7,4.8,4.6,4.7,4.8,4.5][COUNTRIES.indexOf(c)]||4.7,
    nr:[412,289,534,178,234,145,356,267,189][COUNTRIES.indexOf(c)]||200,
    rooms:[12,8,24,16,10,6,18,9,7][COUNTRIES.indexOf(c)]||10,
    amenities:['🏊 Бассейн','🧖 СПА','🍳 Завтрак'].slice(0,2+COUNTRIES.indexOf(c)%2),
    new:COUNTRIES.indexOf(c)<2,
  }));

  const shown=[...allHotels]
    .filter(h=>country==='all'||h.id===country)
    .sort((a,b)=>{
      if(sort==='price') return a.price-b.price;
      if(sort==='rating') return b.rating-a.rating;
      return b.new-a.new;
    });

  const avgPrice=Math.round(shown.reduce((s,h)=>s+h.price,0)/shown.length);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Отели Этномира" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:l3}}>от {avgPrice.toLocaleString('ru-RU')} ₽</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      {/* Hero stat */}
      <div style={{padding:'8px 20px 0'}}>
        <div style={{
          background:'linear-gradient(135deg,#0a1a2e,#0f2a45)',
          borderRadius:18,padding:'14px 18px',marginBottom:14,
          border:'0.5px solid rgba(10,132,255,.15)',
        }}>
          <div style={{display:'flex',gap:20,alignItems:'center'}}>
            {[
              {n:allHotels.length,l:'отелей'},
              {n:allHotels.reduce((s,h)=>s+h.rooms,0),l:'номеров'},
              {n:'9',l:'стран'},
            ].map((s,i)=><div key={i}>
              <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px'}}>{s.n}</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.45)'}}>{s.l}</div>
            </div>)}
            <div style={{flex:1,textAlign:'right'}}>
              <div style={{fontSize:10,fontFamily:FT,color:'rgba(255,255,255,.45)',letterSpacing:'.3px',textTransform:'uppercase'}}>Среднее</div>
              <div style={{fontSize:16,fontFamily:FD,fontWeight:700,color:blue}}>{avgPrice.toLocaleString('ru-RU')} ₽/ночь</div>
            </div>
          </div>
        </div>

        {/* Country filter */}
        <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:10,scrollbarWidth:'none'}}>
          {[{id:'all',flag:'🌍',name:'Все'},...COUNTRIES].map(c=>{
            const active=country===c.id;
            return <div key={c.id} onClick={()=>setCountry(c.id)} className="eth-press" style={{
              flexShrink:0,height:36,borderRadius:18,
              background:active?blue:'var(--ef2)',
              border:active?'none':'0.5px solid var(--es2)',
              padding:'0 12px',display:'flex',alignItems:'center',gap:5,cursor:'pointer',
              transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
            }}>
              <span style={{fontSize:14}}>{c.flag}</span>
              <span style={{fontSize:12,fontFamily:FT,fontWeight:active?600:400,color:active?'#fff':l2,whiteSpace:'nowrap'}}>{c.name}</span>
            </div>;
          })}
        </div>

        {/* Sort pills */}
        <div style={{display:'flex',gap:6,marginBottom:14}}>
          {[['rating','По рейтингу'],['price','По цене'],['new','Новинки']].map(([k,l])=><div
            key={k} onClick={()=>setSort(k)} className="eth-press-sm"
            style={{
              height:28,borderRadius:14,
              background:sort===k?'var(--ef1)':'var(--ef3)',
              border:`0.5px solid ${sep2}`,
              padding:'0 11px',display:'flex',alignItems:'center',cursor:'pointer',
            }}
          >
            <span style={{fontSize:12,fontFamily:FT,fontWeight:sort===k?600:400,color:sort===k?l1:l3}}>{l}</span>
          </div>)}
        </div>
      </div>

      {/* Hotel cards */}
      <div style={{padding:'0 20px',paddingBottom:100}}>
        {shown.map((hotel,i)=><div
          key={hotel.id}
          onClick={()=>push('hoteldetail',{h:{
            id:hotel.id,
            n:hotel.name,
            sub:hotel.desc,
            p:hotel.price,
            em:hotel.country.flag,
            g:hotel.country.grad,
            r:hotel.rating,
            nr:hotel.nr,
          }})}
          className="eth-press"
          style={{borderRadius:20,overflow:'hidden',marginBottom:16,cursor:'pointer',background:bg2,border:`0.5px solid ${sep2}`}}
        >
          {/* Hero image area */}
          <div style={{height:150,background:hotel.country.grad,position:'relative'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.5))'}}/>
            {/* Specular */}
            <div style={{position:'absolute',top:0,left:0,right:0,height:50,background:'linear-gradient(180deg,rgba(255,255,255,.07),transparent)'}}/>
            {hotel.new&&<div style={{
              position:'absolute',top:12,left:12,
              height:22,borderRadius:8,
              background:blue,boxShadow:`inset 0 1px 0 rgba(255,255,255,.2),0 2px 6px ${blue}40`,
              padding:'0 10px',display:'flex',alignItems:'center',
            }}>
              <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'#fff',letterSpacing:'.2px'}}>НОВЫЙ</span>
            </div>}
            <div style={{position:'absolute',bottom:12,left:16,right:16,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                  <span style={{fontSize:20}}>{hotel.country.flag}</span>
                  <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.7)'}}>Этноотель · {hotel.country.name}</span>
                </div>
                <div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.4px'}}>{hotel.name}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{
                  backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',
                  background:'rgba(0,0,0,.4)',border:'0.5px solid rgba(255,255,255,.15)',
                  borderRadius:10,padding:'5px 10px',
                }}>
                  <div style={{fontSize:14,fontFamily:FD,fontWeight:700,color:'#fff'}}>от {hotel.price.toLocaleString('ru-RU')} ₽</div>
                  <div style={{fontSize:9,fontFamily:FT,color:'rgba(255,255,255,.6)',letterSpacing:'.2px'}}>/ночь</div>
                </div>
              </div>
            </div>
          </div>
          {/* Details */}
          <div style={{padding:'13px 16px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontSize:13,fontFamily:FT,color:l3,lineHeight:1.4}}>{hotel.desc}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <Stars r={hotel.rating} n={hotel.nr}/>
                <span style={{fontSize:12,fontFamily:FT,color:l3}}>{hotel.rooms} номеров</span>
              </div>
              <div style={{display:'flex',gap:5}}>
                {hotel.amenities.map((a,j)=><span key={j} style={{fontSize:13}}>{a.split(' ')[0]}</span>)}
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  TICKETS SCREEN v9 — Билеты в Государство Этномир
// ═══════════════════════════════════════════════════════════════
function TicketsScreen({push,pop}){
  const[qty,setQty]=useState({adult:2,child:0,senior:0});
  const[date,setDate]=useState(0); // 0=today, 1=tomorrow, 2=+2days
  const[type,setType]=useState('standard'); // standard | premium | citizen

  const dates=['Сегодня','Завтра','Послезавтра'];
  const today=new Date();
  const dateLabels=dates.map((_,i)=>{
    const d=new Date(today);
    d.setDate(d.getDate()+i);
    return `${d.getDate()} ${['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()]}`;
  });

  const tickets={
    standard:{
      name:'Стандарт',emoji:'🎟',
      desc:'Вход в парк и посещение всех открытых экспозиций',
      adult:1200,child:700,senior:900,
      includes:['Вход в парк','Все экспозиции','Аудиогид (QR)','Карта Этномира'],
      color:green,
    },
    premium:{
      name:'Премиум',emoji:'⭐',
      desc:'Полный доступ + один мастер-класс на выбор',
      adult:2200,child:1400,senior:1700,
      includes:['Всё из Стандарта','1 мастер-класс','Приоритетный вход','Сувенир'],
      color:orange,
    },
    citizen:{
      name:'Гражданский',emoji:'🛂',
      desc:'Безлимитный проход для держателей паспорта',
      adult:3500,child:2000,senior:2500,
      includes:['Безлимитный проход','Все мастер-классы','Скидка 15% в ресторанах','Штамп в паспорт'],
      color:blue,
    },
  };

  const tkt=tickets[type];
  const total=qty.adult*tkt.adult + qty.child*tkt.child + qty.senior*tkt.senior;
  const totalPeople=qty.adult+qty.child+qty.senior;

  const Counter=({label,sub,val,key_:k,price})=><div style={{
    display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'13px 0',borderBottom:`0.5px solid ${sep2}`,
  }}>
    <div>
      <div style={{fontSize:15,fontFamily:FT,fontWeight:500,color:l1}}>{label}</div>
      <div style={{fontSize:12,fontFamily:FT,color:l3}}>{sub} · {price.toLocaleString('ru-RU')} ₽</div>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:16}}>
      <div onClick={()=>setQty(q=>({...q,[k]:Math.max(0,q[k]-1)}))} style={{
        width:32,height:32,borderRadius:16,
        background:'var(--ef2)',border:`0.5px solid ${sep2}`,
        display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
        fontSize:18,color:l2,userSelect:'none',
      }}>−</div>
      <span style={{fontSize:17,fontFamily:FD,fontWeight:700,color:l1,width:20,textAlign:'center'}}>{val}</span>
      <div onClick={()=>setQty(q=>({...q,[k]:q[k]+1}))} style={{
        width:32,height:32,borderRadius:16,
        background:tkt.color,
        boxShadow:`inset 0 1px 0 rgba(255,255,255,.2),0 2px 6px ${tkt.color}40`,
        display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
        fontSize:18,color:'#fff',userSelect:'none',
      }}>+</div>
    </div>
  </div>;

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Билеты в Этномир" back={pop?'Назад':undefined} onBack={pop}
      right={<div onClick={()=>push('passport')} style={{height:30,borderRadius:9,background:`${green}15`,border:`0.5px solid ${green}30`,padding:'0 11px',display:'flex',alignItems:'center',gap:5,cursor:'pointer'}}>
        <span style={{fontSize:13}}>🛂</span>
        <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:green}}>Паспорт</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      {/* Hero */}
      <div style={{padding:'12px 20px 0'}}>
        <div style={{
          background:'linear-gradient(145deg,#0a1f14,#1B4332)',
          borderRadius:20,padding:'20px',marginBottom:18,
          boxShadow:'0 8px 32px rgba(27,67,50,.4)',
          position:'relative',overflow:'hidden',
          border:'0.5px solid rgba(48,209,88,.12)',
        }}>
          <div style={{position:'absolute',right:-10,top:-10,width:80,height:80,borderRadius:40,background:'rgba(255,255,255,.04)'}}/>
          <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.55)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>Государство Этномир</div>
          <div style={{fontSize:24,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.6px',lineHeight:1.2,marginBottom:4}}>Билет для путника</div>
          <div style={{fontSize:13,fontFamily:FT,color:'rgba(255,255,255,.55)',lineHeight:1.5}}>140 га · 9 стран мира · 50+ ресторанов · 1 день приключений</div>
          <div style={{display:'flex',gap:16,marginTop:14}}>
            {[['🌅','09:00 — 22:00'],['☀️','−3°C Солнечно'],['🎭','18 событий']].map(([e,l],i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:14}}>{e}</span>
                <span style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.6)'}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket type */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>Тип билета</div>
        <div style={{display:'flex',gap:8,marginBottom:18}}>
          {Object.entries(tickets).map(([k,t])=><div
            key={k} onClick={()=>setType(k)} className="eth-press"
            style={{
              flex:1,borderRadius:16,padding:'12px 10px',cursor:'pointer',
              background:type===k?`${t.color}12`:bg2,
              border:type===k?`1.5px solid ${t.color}50`:`0.5px solid ${sep2}`,
              boxShadow:type===k?`0 4px 16px ${t.color}20`:'none',
              textAlign:'center',transition:'all .2s',
            }}
          >
            <div style={{fontSize:22,marginBottom:4}}>{t.emoji}</div>
            <div style={{fontSize:12,fontFamily:FT,fontWeight:type===k?700:500,color:type===k?t.color:l2}}>{t.name}</div>
            <div style={{fontSize:12,fontFamily:FD,fontWeight:700,color:type===k?t.color:l3,marginTop:2}}>{t.adult.toLocaleString('ru-RU')} ₽</div>
          </div>)}
        </div>

        {/* Description */}
        <div style={{
          backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
          background:`${tkt.color}08`,border:`0.5px solid ${tkt.color}25`,
          borderRadius:14,padding:'12px 14px',marginBottom:18,
        }}>
          <div style={{fontSize:13,fontFamily:FT,color:l2,lineHeight:1.5,marginBottom:8}}>{tkt.desc}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {tkt.includes.map((inc,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
              <Ic.check s={10} c={tkt.color}/>
              <span style={{fontSize:12,fontFamily:FT,color:l3}}>{inc}</span>
            </div>)}
          </div>
        </div>

        {/* Date picker */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>Дата посещения</div>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {dates.map((d,i)=><div
            key={i} onClick={()=>setDate(i)} className="eth-press"
            style={{
              flex:1,height:52,borderRadius:14,cursor:'pointer',
              background:date===i?tkt.color:bg2,
              border:date===i?'none':`0.5px solid ${sep2}`,
              boxShadow:date===i?`inset 0 1px 0 rgba(255,255,255,.2),0 3px 12px ${tkt.color}35`:'none',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              transition:'all .2s',
            }}
          >
            <span style={{fontSize:12,fontFamily:FT,fontWeight:date===i?600:400,color:date===i?'#fff':l3}}>{d}</span>
            <span style={{fontSize:11,fontFamily:FT,color:date===i?'rgba(255,255,255,.7)':l4}}>{dateLabels[i]}</span>
          </div>)}
        </div>

        {/* Qty */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:4}}>Количество</div>
        <div style={{background:bg2,borderRadius:16,padding:'0 16px',border:`0.5px solid ${sep2}`,marginBottom:100}}>
          <Counter label="Взрослые" sub="18–64 года" val={qty.adult} key_="adult" price={tkt.adult}/>
          <Counter label="Дети" sub="До 12 лет" val={qty.child} key_="child" price={tkt.child}/>
          <Counter label="Пенсионеры" sub="65+ лет" val={qty.senior} key_="senior" price={tkt.senior}/>
        </div>
      </div>
    </div>

    {/* Sticky checkout */}
    <div style={{
      position:'sticky',bottom:0,padding:'12px 20px 28px',
      backdropFilter:'blur(40px) saturate(200%)',WebkitBackdropFilter:'blur(40px) saturate(200%)',
      background:'var(--egl)',borderTop:`0.5px solid var(--es2)`,
      boxShadow:'inset 0 1px 0 var(--eglspec)',
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div>
          <div style={{fontSize:12,fontFamily:FT,color:l3}}>
            {totalPeople} {totalPeople===1?'билет':totalPeople<5?'билета':'билетов'} · {dates[date]}
          </div>
          <div style={{fontSize:26,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-1px'}}>
            {total.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <div onClick={()=>push('checkout',{title:`Билеты ${tkt.name}`,price:total})} className="eth-press" style={{
          height:52,borderRadius:16,
          background:tkt.color,
          boxShadow:`inset 0 1px 0 rgba(255,255,255,.22),0 4px 16px ${tkt.color}40`,
          padding:'0 28px',display:'flex',alignItems:'center',cursor:'pointer',
        }}>
          <span style={{fontSize:17,fontFamily:FD,fontWeight:600,color:tkt.color==='#FFD60A'?'#000':'#fff',letterSpacing:'-.3px'}}>
            Купить {totalPeople>0?`(${totalPeople})`:''}
          </span>
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  QUESTS SCREEN v9 — Квесты по странам Этномира
// ═══════════════════════════════════════════════════════════════
function QuestsScreen({push,pop}){
  const[activeCountry,setActiveCountry]=useState('all');

  const quests=[
    // Country-specific quests
    {id:'q1',country:'india',title:'Путь специй',emoji:'🌶',dur:'2 часа',pts:150,diff:'Лёгко',desc:'Исследуйте Индию: попробуйте 5 блюд, узнайте историю специй',steps:['Кофейня масала','Ашрам йоги','Рынок специй','Дегустация карри','Роспись хной'],done:2,},
    {id:'q2',country:'nepal',title:'Путь к вершине',emoji:'🏔',dur:'3 часа',pts:250,diff:'Средне',desc:'Пройдите путь непальского монаха через Гималаи',steps:['Медитация','Тибетские чаши','Молитвенные флаги','Монастырь','Горный чай'],done:0,},
    {id:'q3',country:'srilanka',title:'Тропическая одиссея',emoji:'🌴',dur:'2.5 часа',pts:200,diff:'Лёгко',desc:'Откройте тайны Шри-Ланки: чай, СПА и океан',steps:['Чайная плантация','Аюрведа-ритуал','Океанский ресторан','Серфинг-класс','Закат'],done:0,},
    {id:'q4',country:'eastasia',title:'Дракон и Тигр',emoji:'🐉',dur:'2 часа',pts:180,diff:'Лёгко',desc:'Мир Восточной Азии: чай, каллиграфия, кунг-фу',steps:['Чайная церемония','Каллиграфия','Кунг-фу урок','Оригами','Пельмени'],done:4,},
    {id:'q5',country:'centralasia',title:'Великий Шёлковый путь',emoji:'🐪',dur:'3 часа',pts:300,diff:'Сложно',desc:'Пройдите маршрут великих торговцев',steps:['Юрта','Домбра','Плов','Ковёр','Арыстан'],done:1,},
    {id:'q6',country:'siberia',title:'Сибирская тайга',emoji:'🌲',dur:'2 часа',pts:180,diff:'Средне',desc:'Русская баня, кедровые орехи и таёжная кухня',steps:['Баня','Берёзовый веник','Уха','Кедровые орехи','Рыбалка'],done:0,},
    // Cross-country quests
    {id:'q7',country:null,title:'Вокруг света за день',emoji:'🌍',dur:'6 часов',pts:500,diff:'Сложно',desc:'Посетите все 9 стран Этномира за один день',steps:['Индия','Непал','Шри-Ланка','Восточная Азия','ЮВА','Центральная Азия','Сибирия','Украина','Беларусь'],done:3,featured:true},
    {id:'q8',country:null,title:'Гурман мира',emoji:'🍽',dur:'4 часа',pts:350,diff:'Средне',desc:'Попробуйте блюда из 5 разных стран',steps:['Индийское карри','Плов','Фо-бо','Борщ','Том-ям'],done:2,},
    {id:'q9',country:null,title:'Мастер ремёсел',emoji:'🏺',dur:'3 часа',pts:280,diff:'Средне',desc:'Освойте 3 народных ремесла разных стран',steps:['Гончарство','Вышивка','Роспись','Лепка','Плетение'],done:0,},
  ];

  const shown=activeCountry==='all'?quests:quests.filter(q=>q.country===activeCountry||q.country===null);
  const completedPts=quests.reduce((s,q)=>q.done===q.steps.length?s+q.pts:s,0);

  const diffColor={Лёгко:green,Средне:orange,Сложно:red};

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Квесты" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:`${yellow}15`,border:`0.5px solid ${yellow}30`,padding:'0 11px',display:'flex',alignItems:'center',gap:5}}>
        <Ic.award s={12} c={yellow}/>
        <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:yellow}}>{completedPts} очков</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      {/* Progress */}
      <div style={{padding:'8px 20px 0'}}>
        <div style={{
          background:'linear-gradient(135deg,#1a0f00,#3a2000)',
          borderRadius:18,padding:'14px 18px',marginBottom:14,
          border:'0.5px solid rgba(255,159,10,.15)',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div>
              <div style={{fontSize:10,fontFamily:FT,fontWeight:600,color:'rgba(255,159,10,.7)',letterSpacing:'.4px',textTransform:'uppercase',marginBottom:2}}>Прогресс квестов</div>
              <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px'}}>{quests.filter(q=>q.done===q.steps.length).length}/{quests.length} выполнено</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:26,fontFamily:FD,fontWeight:700,color:yellow,letterSpacing:'-1px'}}>{completedPts}</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.45)'}}>баллов</div>
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,.1)',borderRadius:5,height:5}}>
            <div style={{width:`${quests.filter(q=>q.done===q.steps.length).length/quests.length*100}%`,height:'100%',background:yellow,borderRadius:5}}/>
          </div>
        </div>

        {/* Country filter */}
        <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:12,scrollbarWidth:'none'}}>
          {[{id:'all',flag:'🌍',name:'Все'},...COUNTRIES.filter(c=>quests.some(q=>q.country===c.id))].map(c=>{
            const active=activeCountry===c.id;
            return <div key={c.id} onClick={()=>setActiveCountry(c.id)} className="eth-press" style={{
              flexShrink:0,height:34,borderRadius:17,
              background:active?orange:'var(--ef2)',
              border:active?'none':'0.5px solid var(--es2)',
              padding:'0 12px',display:'flex',alignItems:'center',gap:5,cursor:'pointer',
              transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
            }}>
              <span style={{fontSize:13}}>{c.flag}</span>
              <span style={{fontSize:12,fontFamily:FT,fontWeight:active?600:400,color:active?'#fff':l2,whiteSpace:'nowrap'}}>{c.name}</span>
            </div>;
          })}
        </div>
      </div>

      {/* Quest cards */}
      <div style={{padding:'0 20px',paddingBottom:100}}>
        {shown.map((q,i)=>{
          const ctry=COUNTRIES.find(c=>c.id===q.country);
          const pct=q.done/q.steps.length;
          const isComplete=q.done===q.steps.length;
          return <div key={q.id} onClick={()=>push('quests')} className="eth-press" style={{
            borderRadius:20,overflow:'hidden',marginBottom:14,cursor:'pointer',
            background:bg2,border:`0.5px solid ${isComplete?green+'40':sep2}`,
            boxShadow:isComplete?`0 4px 16px ${green}15`:q.featured?`0 4px 16px rgba(255,159,10,.12)`:'none',
          }}>
            {/* Country gradient top */}
            {ctry&&<div style={{height:4,background:ctry.grad}}/>}
            {q.featured&&!ctry&&<div style={{height:4,background:`linear-gradient(90deg,${orange},${yellow})`}}/>}
            <div style={{padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:10}}>
                <div style={{
                  width:52,height:52,borderRadius:15,flexShrink:0,
                  background:ctry?`${ctry.color}15`:`${orange}15`,
                  border:`1.5px solid ${isComplete?green+'50':ctry?ctry.color+'25':`${orange}25`}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:26,
                }}>{q.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                    <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{q.title}</span>
                    {ctry&&<span style={{fontSize:13}}>{ctry.flag}</span>}
                    {q.featured&&<span style={{fontSize:11,fontFamily:FT,fontWeight:700,color:orange,background:`${orange}15`,borderRadius:5,padding:'1px 7px'}}>★</span>}
                  </div>
                  <div style={{fontSize:12,fontFamily:FT,color:l3,lineHeight:1.4,marginBottom:6}}>{q.desc}</div>
                  <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                    <span style={{fontSize:11,fontFamily:FT,color:l3}}>⏱ {q.dur}</span>
                    <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:diffColor[q.diff]||l3}}>{q.diff}</span>
                    <div style={{display:'flex',alignItems:'center',gap:3}}>
                      <Ic.award s={10} c={yellow}/>
                      <span style={{fontSize:11,fontFamily:FD,fontWeight:700,color:yellow}}>{q.pts} pts</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Steps progress */}
              <div style={{display:'flex',gap:4,marginBottom:8}}>
                {q.steps.map((_,j)=><div key={j} style={{
                  flex:1,height:4,borderRadius:2,
                  background:j<q.done?green:`var(--ef2)`,
                  transition:'background .3s',
                }}/>)}
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {q.steps.slice(0,4).map((step,j)=><span key={j} style={{
                    fontSize:10,fontFamily:FT,
                    color:j<q.done?green:l4,
                    textDecoration:j<q.done?'line-through':'none',
                  }}>{step}{j<3&&','}</span>)}
                  {q.steps.length>4&&<span style={{fontSize:10,fontFamily:FT,color:l4}}>+{q.steps.length-4}</span>}
                </div>
                <span style={{fontSize:11,fontFamily:FD,fontWeight:600,color:isComplete?green:l3}}>
                  {isComplete?'✓ Выполнен':`${q.done}/${q.steps.length}`}
                </span>
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  SEARCH SCREEN v9 — Поиск по Этномиру
// ═══════════════════════════════════════════════════════════════
function SearchScreen({push,pop}){
  const[q,setQ]=useState('');

  const categories=[
    {emoji:'🌍',label:'Страны',color:blue,s:'countries'},
    {emoji:'🏨',label:'Отели',color:teal,s:'hotels'},
    {emoji:'🍜',label:'Рестораны',color:orange,s:'food'},
    {emoji:'🎟',label:'Билеты',color:green,s:'tickets'},
    {emoji:'💆',label:'СПА',color:pink,s:'spa'},
    {emoji:'🎭',label:'События',color:purple,s:'events'},
    {emoji:'🏺',label:'Мастер-кл',color:'#A2845E',s:'masterclasses'},
    {emoji:'🗝',label:'Квесты',color:orange,s:'quests'},
    {emoji:'🏡',label:'Недвиж.',color:blue,s:'realestate'},
    {emoji:'🤝',label:'Франшиза',color:yellow,s:'franchise'},
  ];

  // All searchable items
  const allItems=[
    ...COUNTRIES.map(c=>({type:'country',title:c.name,sub:`Страна Этномира · ${c.visited?'Посещена':'Не посещена'}`,emoji:c.flag,s:'country',params:{id:c.id},country:c})),
    ...COUNTRIES.map(c=>({type:'hotel',title:c.hotel.n,sub:`Отель · от ${c.hotel.p.toLocaleString('ru-RU')} ₽/ночь`,emoji:'🏨',s:'hoteldetail',params:{h:{n:c.hotel.n,p:c.hotel.p,em:c.flag,g:c.grad,r:4.8,nr:100}}})),
    ...COUNTRIES.flatMap(c=>c.restaurants.map(r=>({type:'restaurant',title:r.n,sub:`Ресторан · ${r.p}`,emoji:r.e,s:'food',params:{}}))),
    ...COUNTRIES.flatMap(c=>c.activities.map(a=>({type:'activity',title:a,sub:`Активность · ${c.name}`,emoji:'🎭',s:'masterclasses',params:{}}))),
    ...COUNTRIES.flatMap(c=>c.realestate.map(p=>({type:'property',title:p.t,sub:`Недвижимость · ${p.p.toLocaleString('ru-RU')} ₽`,emoji:(PROPERTY_TYPES[p.type]||{emoji:'🏠'}).emoji,s:'propertydetail',params:{prop:p,country:c}}))),
  ];

  const results=q.length>1?allItems.filter(item=>
    item.title.toLowerCase().includes(q.toLowerCase())||
    item.sub.toLowerCase().includes(q.toLowerCase())
  ):[];

  const typeLabel={country:'Страна',hotel:'Отель',restaurant:'Ресторан',activity:'Активность',property:'Недвижимость'};
  const typeColor={country:blue,hotel:teal,restaurant:orange,activity:purple,property:'#FF9F0A'};

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Поиск" back={pop?'Назад':undefined} onBack={pop}/>

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'0 20px'}}>
        {/* Search input */}
        <div style={{
          display:'flex',alignItems:'center',gap:10,
          backdropFilter:'blur(20px) saturate(180%)',WebkitBackdropFilter:'blur(20px) saturate(180%)',
          background:'var(--ef2)',border:'0.5px solid var(--es2)',
          boxShadow:'inset 0 1px 0 var(--eglspec)',
          borderRadius:16,padding:'12px 16px',marginBottom:18,
        }}>
          <Ic.search s={16} c={l3}/>
          <input
            value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Страны, отели, рестораны, квесты..."
            autoFocus
            style={{flex:1,fontSize:16,fontFamily:FT,color:l1,letterSpacing:'-.2px',caretColor:green}}
          />
          {q&&<div onClick={()=>setQ('')} style={{cursor:'pointer',padding:2}}>
            <div style={{width:18,height:18,borderRadius:9,background:'var(--ef1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke={l3} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>}
        </div>

        {/* Results */}
        {q.length>1&&<div style={{marginBottom:24}}>
          <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>
            {results.length>0?`Найдено (${results.length})`:'Ничего не найдено'}
          </div>
          {results.length===0&&<div style={{textAlign:'center',padding:'32px 0',color:l4}}>
            <span style={{fontSize:36,display:'block',marginBottom:8}}>🔍</span>
            <span style={{fontSize:15,fontFamily:FT,color:l3}}>Попробуйте другой запрос</span>
          </div>}
          <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`}}>
            {results.slice(0,15).map((item,i)=><div key={i} onClick={()=>push(item.s,item.params||{})} className="eth-press" style={{
              display:'flex',alignItems:'center',gap:12,
              padding:'12px 16px',background:bg2,
              borderBottom:i<Math.min(results.length,15)-1?`0.5px solid ${sep2}`:'none',
              cursor:'pointer',
            }}>
              <div style={{
                width:42,height:42,borderRadius:12,flexShrink:0,
                background:`${typeColor[item.type]||blue}12`,
                border:`0.5px solid ${typeColor[item.type]||blue}20`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:20,
              }}>{item.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.2px'}}>{item.title}</div>
                <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{item.sub}</div>
              </div>
              <div style={{
                height:20,borderRadius:6,
                background:`${typeColor[item.type]||blue}15`,
                padding:'0 7px',display:'flex',alignItems:'center',
              }}>
                <span style={{fontSize:10,fontFamily:FT,fontWeight:600,color:typeColor[item.type]||blue}}>{typeLabel[item.type]}</span>
              </div>
            </div>)}
          </div>
        </div>}

        {/* Categories (shown when no query) */}
        {!q&&<div>
          <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Разделы</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24}}>
            {categories.map((c,i)=><div key={i} onClick={()=>push(c.s)} className="eth-press" style={{
              borderRadius:16,padding:'16px 14px',cursor:'pointer',
              background:bg2,border:`0.5px solid ${sep2}`,
              display:'flex',alignItems:'center',gap:12,
            }}>
              <div style={{
                width:40,height:40,borderRadius:12,flexShrink:0,
                background:`${c.color}12`,border:`0.5px solid ${c.color}25`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:20,
              }}>{c.emoji}</div>
              <span style={{fontSize:14,fontFamily:FT,fontWeight:600,color:l1}}>{c.label}</span>
            </div>)}
          </div>

          {/* Recent countries */}
          <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Страны Этномира</div>
          <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none',marginBottom:100}}>
            {COUNTRIES.map(c=><div key={c.id} onClick={()=>push('country',{id:c.id})} className="eth-press" style={{
              flexShrink:0,width:120,borderRadius:16,overflow:'hidden',cursor:'pointer',
              height:80,background:c.grad,position:'relative',
            }}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.5))'}}/>
              <div style={{position:'absolute',bottom:8,left:10}}>
                <div style={{fontSize:18}}>{c.flag}</div>
                <div style={{fontSize:12,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.2px',marginTop:1}}>{c.name}</div>
              </div>
              {c.visited&&<div style={{position:'absolute',top:6,right:6,width:14,height:14,borderRadius:7,background:green,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Ic.check s={7} c="#fff"/>
              </div>}
            </div>)}
          </div>
        </div>}
      </div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  ONBOARDING SCREEN — Добро пожаловать в Государство Этномир
// ═══════════════════════════════════════════════════════════════
function OnboardingScreen({onDone}){
  const[step,setStep]=useState(0);
  const steps=[
    {
      emoji:'🌍',
      title:'Добро пожаловать\nв Государство\nЭтномир',
      sub:'140 га · 9 стран мира · Тысяча впечатлений',
      bg:'linear-gradient(145deg,#0a1f14,#1B4332,#0d3b22)',
      cta:'Начать путешествие',
    },
    {
      emoji:'🛂',
      title:'Ваш паспорт\nпутника',
      sub:'Получайте визы, копите штампы стран, становитесь Почётным гражданином',
      bg:'linear-gradient(145deg,#0a1a2a,#0f2d45,#1a4060)',
      cta:'Понятно',
    },
    {
      emoji:'🏡',
      title:'Живите\nв Этномире',
      sub:'Купите землю, дом или апартамент. Откройте ресторан или франшизу',
      bg:'linear-gradient(145deg,#1a1200,#3a2800,#5a4000)',
      cta:'Продолжить',
    },
    {
      emoji:'🗺',
      title:'Исследуйте\n9 стран мира',
      sub:'Индия, Непал, Шри-Ланка, Восточная и Юго-Восточная Азия, Центральная Азия и другие',
      bg:'linear-gradient(145deg,#200a3a,#4a1070,#6a1090)',
      cta:'Начать 🚀',
    },
  ];
  const s=steps[step];
  const isLast=step===steps.length-1;

  return <div style={{
    flex:1,display:'flex',flexDirection:'column',
    background:s.bg,
    position:'relative',overflow:'hidden',
    transition:'background .6s',
  }}>
    {/* Background decoration */}
    <div style={{position:'absolute',right:-40,top:-40,width:220,height:220,borderRadius:110,background:'rgba(255,255,255,.04)'}}/>
    <div style={{position:'absolute',left:-60,bottom:80,width:180,height:180,borderRadius:90,background:'rgba(255,255,255,.03)'}}/>

    {/* Skip */}
    <div style={{position:'absolute',top:56,right:20,zIndex:10}}>
      <div onClick={onDone} style={{
        height:32,borderRadius:16,
        background:'rgba(255,255,255,.12)',border:'0.5px solid rgba(255,255,255,.18)',
        padding:'0 14px',display:'flex',alignItems:'center',cursor:'pointer',
      }}>
        <span style={{fontSize:13,fontFamily:FT,color:'rgba(255,255,255,.7)'}}>Пропустить</span>
      </div>
    </div>

    {/* Content */}
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 0',textAlign:'center'}}>
      <div key={step} style={{animation:'eth-spring-in .5s cubic-bezier(.34,1.56,.64,1) both'}}>
        <div style={{fontSize:80,marginBottom:24,filter:'drop-shadow(0 8px 24px rgba(0,0,0,.3))'}}>{s.emoji}</div>
        <div style={{fontSize:32,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.8px',lineHeight:1.2,marginBottom:14,whiteSpace:'pre-line'}}>{s.title}</div>
        <div style={{fontSize:16,fontFamily:FT,color:'rgba(255,255,255,.65)',lineHeight:1.6,maxWidth:280,margin:'0 auto'}}>{s.sub}</div>
      </div>
    </div>

    {/* Bottom */}
    <div style={{padding:'24px 32px 48px'}}>
      {/* Dots */}
      <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:24}}>
        {steps.map((_,i)=><div key={i} style={{
          width:i===step?20:6,height:6,borderRadius:3,
          background:i===step?'rgba(255,255,255,.9)':'rgba(255,255,255,.3)',
          transition:'all .3s',
        }}/>)}
      </div>
      <div onClick={isLast?onDone:()=>setStep(s=>s+1)} className="eth-press" style={{
        height:56,borderRadius:18,
        background:'rgba(255,255,255,.15)',
        backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
        border:'0.5px solid rgba(255,255,255,.25)',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,.22)',
        display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
      }}>
        <span style={{fontSize:17,fontFamily:FD,fontWeight:600,color:'#fff',letterSpacing:'-.3px'}}>{s.cta}</span>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CITIZENSHIP SCREEN — Уровни гражданства Этномира
// ═══════════════════════════════════════════════════════════════
function CitizenshipScreen({push,pop}){
  const visitedCountries=COUNTRIES.filter(c=>c.visited);
  const totalStamps=visitedCountries.reduce((s,c)=>s+c.stamps,0);
  const level=totalStamps>=500?4:totalStamps>=100?3:totalStamps>=5?2:totalStamps>=1?1:0;

  const benefits={
    guest:   ['Вход в парк по билету','Базовый аудиогид'],
    traveler:['Паспорт путника','Визы и штампы стран','Скидка 5% в ресторанах','Участие в квестах'],
    resident:['Безлимитный вход 30 дней','Скидка 15% во всём','Приоритетная бронь отелей','VIP-мастер-классы'],
    citizen: ['Безлимитный вход навсегда','Скидка 25%','Личный менеджер','Номер в отеле -50%','Участие в управлении'],
    honorary:['Всё из Гражданина','Именная звезда в парке','Процент с франшизы','Место в Совете директоров','Вилла в подарок'],
  };

  const howToProgress=[
    {emoji:'🌍',text:'Посещайте страны Этномира'},
    {emoji:'🏺',text:'Участвуйте в мастер-классах'},
    {emoji:'🍜',text:'Обедайте в ресторанах стран'},
    {emoji:'🏨',text:'Ночуйте в этноотелях'},
    {emoji:'🗝',text:'Выполняйте квесты'},
    {emoji:'🏡',text:'Купите недвижимость в Этномире'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Гражданство" back={pop?'Назад':undefined} onBack={pop}
      right={<div onClick={()=>push('passport')} style={{height:30,borderRadius:9,background:`${green}15`,border:`0.5px solid ${green}30`,padding:'0 11px',display:'flex',alignItems:'center',gap:5,cursor:'pointer'}}>
        <span style={{fontSize:13}}>🛂</span>
        <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:green}}>Паспорт</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto',padding:'0 20px',paddingBottom:100}}>
      {/* Current level card */}
      {(()=>{
        const lvl=CITIZENSHIP_LEVELS[level];
        const nextLvl=CITIZENSHIP_LEVELS[Math.min(level+1,4)];
        const pct=Math.min(totalStamps/(nextLvl.min||1)*100,100);
        return <div style={{
          background:`linear-gradient(135deg,${lvl.color}15,${lvl.color}05)`,
          borderRadius:20,padding:'20px',marginBottom:24,
          border:`1.5px solid ${lvl.color}30`,
          boxShadow:`0 8px 32px ${lvl.color}15`,
        }}>
          <div style={{display:'flex',gap:16,alignItems:'flex-start',marginBottom:16}}>
            <div style={{
              width:64,height:64,borderRadius:18,flexShrink:0,
              background:`${lvl.color}20`,border:`2px solid ${lvl.color}40`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,
            }}>{lvl.emoji}</div>
            <div>
              <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:4}}>Ваш статус</div>
              <div style={{fontSize:24,fontFamily:FD,fontWeight:700,color:lvl.color,letterSpacing:'-.5px'}}>{lvl.title}</div>
              <div style={{fontSize:13,fontFamily:FT,color:l3,marginTop:2}}>{lvl.desc}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:16,marginBottom:12}}>
            {[
              {n:visitedCountries.length,l:'стран'},
              {n:totalStamps,l:'штампов'},
            ].map((s,i)=><div key={i}>
              <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:lvl.color,letterSpacing:'-.4px'}}>{s.n}</div>
              <div style={{fontSize:11,fontFamily:FT,color:l3}}>{s.l}</div>
            </div>)}
          </div>
          {level<4&&<div>
            <div style={{background:'var(--ef2)',borderRadius:5,height:6,marginBottom:5}}>
              <div style={{width:`${pct}%`,height:'100%',background:lvl.color,borderRadius:5,transition:'width .5s'}}/>
            </div>
            <div style={{fontSize:12,fontFamily:FT,color:l3}}>До уровня «{nextLvl.title}» · ещё {nextLvl.min-totalStamps} штампов</div>
          </div>}
        </div>;
      })()}

      {/* All levels */}
      <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Уровни гражданства</div>
      {CITIZENSHIP_LEVELS.map((lvl,i)=>{
        const isActive=level===i;
        const isPast=level>i;
        const isFuture=level<i;
        const lvlBenefits=benefits[lvl.id]||[];
        return <div key={lvl.id} style={{
          borderRadius:18,overflow:'hidden',marginBottom:12,
          background:bg2,
          border:`${isActive?1.5:.5}px solid ${isActive?lvl.color+'60':isPast?lvl.color+'20':sep2}`,
          opacity:isFuture?.7:1,
        }}>
          <div style={{
            padding:'14px 16px',display:'flex',gap:12,alignItems:'center',
            background:isActive?`${lvl.color}08`:undefined,
          }}>
            <div style={{
              width:48,height:48,borderRadius:14,flexShrink:0,
              background:`${lvl.color}${isActive?'20':'10'}`,
              border:`${isActive?1.5:.5}px solid ${lvl.color}${isActive?'40':'20'}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
            }}>{lvl.emoji}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:isActive?lvl.color:l1,letterSpacing:'-.3px'}}>{lvl.title}</span>
                {isActive&&<Tag label="Текущий" color={lvl.color} small/>}
                {isPast&&<Ic.check s={14} c={lvl.color}/>}
              </div>
              <div style={{fontSize:12,fontFamily:FT,color:l3}}>{lvl.desc} {lvl.min>0&&`· от ${lvl.min} штампов`}</div>
            </div>
          </div>
          <div style={{padding:'0 16px 14px',borderTop:`0.5px solid ${sep2}`}}>
            <div style={{paddingTop:10,display:'flex',flexWrap:'wrap',gap:6}}>
              {lvlBenefits.map((b,j)=><div key={j} style={{display:'flex',alignItems:'center',gap:5}}>
                <Ic.check s={10} c={isPast||isActive?lvl.color:l4}/>
                <span style={{fontSize:12,fontFamily:FT,color:isPast||isActive?l2:l4}}>{b}</span>
              </div>)}
            </div>
          </div>
        </div>;
      })}

      {/* How to progress */}
      <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12,marginTop:8}}>Как копить штампы</div>
      <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`,marginBottom:16}}>
        {howToProgress.map((h,i)=><div key={i} style={{
          display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
          background:bg2,borderBottom:i<howToProgress.length-1?`0.5px solid ${sep2}`:'none',
        }}>
          <span style={{fontSize:22}}>{h.emoji}</span>
          <span style={{fontSize:14,fontFamily:FT,color:l1}}>{h.text}</span>
          <Ic.chevR s={6} c={l4}/>
        </div>)}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  KIDS SCREEN v9 — Детям в Этномире
// ═══════════════════════════════════════════════════════════════
function KidsSC({push,pop}){
  const ages=[['3–6','Малыши','🧸'],['7–12','Школьники','📚'],['13–17','Подростки','🎮']];
  const[age,setAge]=useState(0);

  const activities=[
    {emoji:'🎨',title:'Детская роспись',desc:'Хохлома, гжель, роспись по ткани',price:'600 ₽',dur:'1.5 ч',age:[0,1],s:'masterclasses'},
    {emoji:'🏺',title:'Гончарный кружок',desc:'Лепим из глины: горшки, фигурки',price:'700 ₽',dur:'2 ч',age:[0,1],s:'masterclasses'},
    {emoji:'🧩',title:'Мастер-класс по оригами',desc:'Японские фигурки из бумаги',price:'400 ₽',dur:'1 ч',age:[0,1,2],s:'masterclasses'},
    {emoji:'🐘',title:'Встреча с животными',desc:'Зоопарк: покормить и погладить',price:'500 ₽',dur:'1 ч',age:[0,1],s:'zoo'},
    {emoji:'🎭',title:'Театр этнических сказок',desc:'Сказки народов мира на сцене',price:'400 ₽',dur:'1.5 ч',age:[0,1],s:'events'},
    {emoji:'🏹',title:'Лучная стрельба',desc:'Казахские традиции лучников',price:'600 ₽',dur:'1 ч',age:[1,2],s:'attractions'},
    {emoji:'🧗',title:'Этнопарк приключений',desc:'Верёвочный парк, зиплайн',price:'900 ₽',dur:'2 ч',age:[1,2],s:'attractions'},
    {emoji:'💻',title:'Квест «Вокруг света»',desc:'Цифровой квест по всем странам',price:'500 ₽',dur:'2 ч',age:[1,2],s:'quests'},
    {emoji:'🍜',title:'Кулинарный МК',desc:'Готовим блюда народов мира',price:'800 ₽',dur:'2 ч',age:[2],s:'masterclasses'},
    {emoji:'🎵',title:'Мировые барабаны',desc:'Игра на этнических инструментах',price:'600 ₽',dur:'1 ч',age:[0,1,2],s:'masterclasses'},
  ];

  const shown=activities.filter(a=>a.age.includes(age));

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Детям" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'8px 20px 0'}}>
        {/* Age selector */}
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {ages.map(([range,label,emoji],i)=><div
            key={i} onClick={()=>setAge(i)} className="eth-press"
            style={{
              flex:1,borderRadius:16,padding:'12px 8px',cursor:'pointer',
              background:age===i?`${yellow}15`:bg2,
              border:age===i?`1.5px solid ${yellow}40`:`0.5px solid ${sep2}`,
              textAlign:'center',transition:'all .2s',
            }}
          >
            <div style={{fontSize:24,marginBottom:4}}>{emoji}</div>
            <div style={{fontSize:13,fontFamily:FT,fontWeight:age===i?700:500,color:age===i?yellow:l2}}>{label}</div>
            <div style={{fontSize:11,fontFamily:FT,color:l4,marginTop:1}}>{range} лет</div>
          </div>)}
        </div>

        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>
          Активности ({shown.length})
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,paddingBottom:100}}>
          {shown.map((act,i)=><div key={i} onClick={()=>push(act.s)} className="eth-press" style={{
            borderRadius:18,overflow:'hidden',cursor:'pointer',
            background:bg2,border:`0.5px solid ${sep2}`,
          }}>
            <div style={{
              height:80,background:`linear-gradient(135deg,${yellow}20,${orange}15)`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:36,
            }}>{act.emoji}</div>
            <div style={{padding:'10px 12px'}}>
              <div style={{fontSize:13,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.2px',marginBottom:2,lineHeight:1.2}}>{act.title}</div>
              <div style={{fontSize:11,fontFamily:FT,color:l3,marginBottom:6,lineHeight:1.3}}>{act.desc}</div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:12,fontFamily:FD,fontWeight:600,color:green}}>{act.price}</span>
                <span style={{fontSize:11,fontFamily:FT,color:l4}}>⏱ {act.dur}</span>
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  RENTAL SCREEN v9 — Прокат в Этномире
// ═══════════════════════════════════════════════════════════════
function RentalSC({push,pop}){
  const categories=[
    {emoji:'🚲',label:'Велосипеды',count:24},
    {emoji:'⚡',label:'Самокаты',count:36},
    {emoji:'🛖',label:'Этнокарты',count:8},
    {emoji:'📷',label:'Фотоаппараты',count:12},
    {emoji:'🎒',label:'Рюкзаки',count:20},
    {emoji:'☂️',label:'Зонты',count:50},
  ];
  const items=[
    {emoji:'🚲',title:'Велосипед',desc:'Горный/городской',price:'200',per:'час',available:14,color:teal},
    {emoji:'🚲',title:'Тандем',desc:'Для двоих',price:'350',per:'час',available:5,color:teal},
    {emoji:'⚡',title:'Электросамокат',desc:'До 25 км/ч',price:'300',per:'час',available:22,color:blue},
    {emoji:'⚡',title:'Электровелосипед',desc:'Лёгкий подъём',price:'400',per:'час',available:8,color:blue},
    {emoji:'🛖',title:'Гольф-кар «Этно»',desc:'4 места',price:'1 200',per:'час',available:3,color:orange},
    {emoji:'📷',title:'Зеркалка Canon',desc:'Объектив 24-105',price:'800',per:'день',available:6,color:purple},
    {emoji:'📷',title:'Инстакс Fuji',desc:'Плёночный',price:'400',per:'день',available:9,color:pink},
    {emoji:'🎒',title:'Рюкзак-пикник',desc:'На 2 персоны',price:'250',per:'день',available:12,color:green},
    {emoji:'🛖',title:'Квадроцикл',desc:'С инструктором',price:'2 500',per:'час',available:2,color:red},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Прокат" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'8px 20px 0'}}>
        {/* Category scroll */}
        <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:14,scrollbarWidth:'none'}}>
          {categories.map((c,i)=><div key={i} style={{
            flexShrink:0,
            backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
            background:'var(--ef2)',border:'0.5px solid var(--es2)',
            borderRadius:16,padding:'10px 14px',
            display:'flex',flexDirection:'column',alignItems:'center',gap:4,
            cursor:'pointer',
          }}>
            <span style={{fontSize:24}}>{c.emoji}</span>
            <span style={{fontSize:11,fontFamily:FT,color:l2,whiteSpace:'nowrap'}}>{c.label}</span>
            <span style={{fontSize:10,fontFamily:FT,color:green}}>{c.count} шт.</span>
          </div>)}
        </div>

        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:14}}>Доступно сейчас</div>
        <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`,paddingBottom:100}}>
          {items.map((item,i)=><div key={i} onClick={()=>push('checkout',{title:item.title,price:parseInt(item.price.replace(' ',''))})} className="eth-press" style={{
            display:'flex',alignItems:'center',gap:13,padding:'13px 16px',
            background:bg2,borderBottom:i<items.length-1?`0.5px solid ${sep2}`:'none',cursor:'pointer',
          }}>
            <div style={{
              width:50,height:50,borderRadius:14,flexShrink:0,
              background:`${item.color}12`,border:`0.5px solid ${item.color}25`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,
            }}>{item.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.2px'}}>{item.title}</div>
              <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{item.desc} · {item.available} шт. в наличии</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:15,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{item.price} ₽</div>
              <div style={{fontSize:11,fontFamily:FT,color:l3}}>/{item.per}</div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  AUDIO GUIDE SCREEN v9 — Аудиогид по Этномиру
// ═══════════════════════════════════════════════════════════════
function AudioSC({pop,push}){
  const[playing,setPlaying]=useState(null);
  const[progress,setProgress]=useState({});

  const tracks=[
    ...COUNTRIES.map((c,i)=>({
      id:c.id,country:c,
      title:`${c.name} — Аудиогид`,
      desc:`История, культура и традиции · ${8+i*2} мин`,
      dur:`${8+i*2}:00`,
      progress:i<4?[0.6,0.3,1.0,0.45][i]:0,
    })),
    {id:'park',country:null,title:'Обзор парка Этномир',desc:'Маршруты, карта, история · 12 мин',dur:'12:00',progress:0.2},
    {id:'nature',country:null,title:'Природа Этномира',desc:'Флора и фауна территории · 8 мин',dur:'8:00',progress:0},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Аудиогид" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'8px 20px'}}>
        {/* Active player */}
        {playing&&(()=>{
          const t=tracks.find(tr=>tr.id===playing);
          if(!t) return null;
          return <div style={{
            backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',
            background:t.country?t.country.grad:'linear-gradient(135deg,#1a1a2e,#2d2d4e)',
            borderRadius:20,padding:'18px',marginBottom:20,
            boxShadow:`0 8px 32px ${t.country?t.country.color+'30':'rgba(0,0,0,.2)'}`,
            position:'relative',overflow:'hidden',
          }}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.5))'}}/>
            <div style={{position:'relative'}}>
              <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.5)',letterSpacing:'.3px',textTransform:'uppercase',marginBottom:4}}>Сейчас играет</div>
              <div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:'#fff',marginBottom:2}}>{t.title}</div>
              <div style={{fontSize:12,fontFamily:FT,color:'rgba(255,255,255,.6)',marginBottom:16}}>{t.desc}</div>
              <div style={{background:'rgba(255,255,255,.2)',borderRadius:4,height:4,marginBottom:10}}>
                <div style={{width:`${(t.progress||0)*100}%`,height:'100%',background:'#fff',borderRadius:4}}/>
              </div>
              <div style={{display:'flex',justifyContent:'center',gap:24,alignItems:'center'}}>
                <div style={{width:32,height:32,borderRadius:16,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff"><path d="M2 2l4 4-4 4V2zm5 0l4 4-4 4V2z"/></svg>
                </div>
                <div onClick={()=>setPlaying(null)} style={{width:48,height:48,borderRadius:24,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff"><rect x="3" y="3" width="4" height="10" rx="1"/><rect x="9" y="3" width="4" height="10" rx="1"/></svg>
                </div>
                <div style={{width:32,height:32,borderRadius:16,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="#fff"><path d="M10 2L6 6l4 4V2zM5 2L1 6l4 4V2z"/></svg>
                </div>
              </div>
            </div>
          </div>;
        })()}

        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>
          Гиды по странам
        </div>
        <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`,marginBottom:100}}>
          {tracks.map((track,i)=>{
            const isPlaying=playing===track.id;
            const ctry=track.country;
            return <div key={track.id} onClick={()=>setPlaying(isPlaying?null:track.id)} className="eth-press" style={{
              display:'flex',alignItems:'center',gap:13,padding:'13px 16px',
              background:isPlaying?`${ctry?ctry.color:'var(--ef1)'}15`:bg2,
              borderBottom:i<tracks.length-1?`0.5px solid ${sep2}`:'none',
              cursor:'pointer',
            }}>
              <div style={{
                width:48,height:48,borderRadius:14,flexShrink:0,
                background:ctry?ctry.grad:'linear-gradient(135deg,#1a1a2e,#3d3d6e)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
              }}>{ctry?ctry.flag:'🎧'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:isPlaying?ctry?.color||blue:l1,letterSpacing:'-.2px'}}>{track.title}</div>
                <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{track.desc}</div>
                {track.progress>0&&<div style={{background:'var(--ef2)',borderRadius:3,height:3,marginTop:6,width:'80%'}}>
                  <div style={{width:`${track.progress*100}%`,height:'100%',background:ctry?ctry.color:blue,borderRadius:3}}/>
                </div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                <span style={{fontSize:12,fontFamily:FT,color:l4}}>{track.dur}</span>
                <div style={{
                  width:28,height:28,borderRadius:14,
                  background:isPlaying?`${ctry?.color||blue}20`:'var(--ef2)',
                  border:`0.5px solid ${isPlaying?ctry?.color||blue:sep2}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                }}>
                  {isPlaying
                    ?<svg width="10" height="10" viewBox="0 0 10 10" fill={ctry?.color||blue}><rect x="1" y="1" width="3" height="8" rx=".5"/><rect x="6" y="1" width="3" height="8" rx=".5"/></svg>
                    :<svg width="10" height="10" viewBox="0 0 10 10" fill={l3}><path d="M2 1.5l7 3.5-7 3.5V1.5z"/></svg>
                  }
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  EXCURSIONS SCREEN v9 — Экскурсии по странам
// ═══════════════════════════════════════════════════════════════
function ExcSC({push,pop}){
  const excursions=[
    ...COUNTRIES.slice(0,6).map((c,i)=>({
      id:`exc-${c.id}`,
      country:c,
      title:`Экскурсия по ${c.name.replace(/у$/,'е').replace(/а$/,'е')||c.name}`,
      desc:`Погружение в культуру, историю и традиции ${c.name}`,
      dur:`${1+i*0.5} ч`,price:800+i*200,rating:4.5+i*0.05,
      guide:'Гид Этномира',people:`${12+i*3} чел.`,
    })),
    {id:'exc-full',country:null,title:'Большая экскурсия «Вокруг света»',desc:'Обзорная по всему парку: все 9 стран за 3 часа',dur:'3 ч',price:1500,rating:4.9,guide:'Старший гид',people:'До 20 чел.',featured:true},
    {id:'exc-night',country:null,title:'Вечерний Этномир',desc:'Ночная прогулка при свечах и огне',dur:'2 ч',price:1200,rating:4.8,guide:'Гид Этномира',people:'До 15 чел.'},
    {id:'exc-kids',country:null,title:'Детская экскурсия',desc:'Сказочное путешествие по странам для детей',dur:'1.5 ч',price:600,rating:4.9,guide:'Аниматор',people:'До 10 детей'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Экскурсии" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',padding:'8px 20px',paddingBottom:100}}>
      {excursions.map((exc,i)=>{
        const ctry=exc.country;
        return <div key={exc.id} onClick={()=>push('booking',{h:{n:exc.title,p:exc.price,em:ctry?.flag||'🧭'}})} className="eth-press" style={{
          borderRadius:20,overflow:'hidden',marginBottom:14,cursor:'pointer',
          background:bg2,border:`0.5px solid ${exc.featured?`${orange}40`:sep2}`,
          boxShadow:exc.featured?`0 4px 16px ${orange}15`:'none',
        }}>
          {/* Header */}
          <div style={{
            height:100,
            background:ctry?ctry.grad:'linear-gradient(135deg,#1a2a1a,#2d4a2d)',
            position:'relative',display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <span style={{fontSize:44,opacity:.4}}>{ctry?ctry.flag:'🗺'}</span>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.5))'}}/>
            {exc.featured&&<div style={{position:'absolute',top:10,left:12,height:22,borderRadius:8,background:orange,padding:'0 10px',display:'flex',alignItems:'center'}}>
              <span style={{fontSize:11,fontFamily:FT,fontWeight:700,color:'#fff'}}>⭐ Хит</span>
            </div>}
            <div style={{position:'absolute',bottom:10,left:16}}>
              {ctry&&<div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:16}}>{ctry.flag}</span>
                <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.8)'}}>{ctry.name}</span>
              </div>}
            </div>
          </div>
          <div style={{padding:'14px 16px'}}>
            <div style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px',marginBottom:4}}>{exc.title}</div>
            <div style={{fontSize:13,fontFamily:FT,color:l3,marginBottom:10,lineHeight:1.4}}>{exc.desc}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <Stars r={exc.rating}/>
                <span style={{fontSize:12,fontFamily:FT,color:l3}}>⏱ {exc.dur}</span>
                <span style={{fontSize:12,fontFamily:FT,color:l3}}>👥 {exc.people}</span>
              </div>
              <div style={{fontSize:17,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>{exc.price.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  MASTERCLASSES SCREEN v9+ — Мастер-классы по странам
// ═══════════════════════════════════════════════════════════════
function McSC({push,pop}){
  const[filter,setFilter]=useState('all'); // all | country.id | category

  const MCS=[
    // Ремёсла по странам
    {id:'mc1',country:'india',cat:'Ремёсла',emoji:'🪬',name:'Роспись хной (мехенди)',desc:'Традиционные узоры на руках по индийским мотивам',price:1200,dur:'2 ч',rating:4.9,spots:5,level:'Любой',times:['11:00','14:00','16:30']},
    {id:'mc2',country:'india',cat:'Кулинария',emoji:'🍛',name:'Кулинарный МК — Индия',desc:'Карри, самоса, ладду — готовим вместе с шеф-поваром',price:2400,dur:'2.5 ч',rating:4.8,spots:8,level:'Любой',times:['12:00','17:00']},
    {id:'mc3',country:'india',cat:'Танцы',emoji:'💃',name:'Болливудский танец',desc:'Зажигательные движения индийского кино за 1.5 часа',price:900,dur:'1.5 ч',rating:4.7,spots:12,level:'Начальный',times:['10:00','15:00']},
    {id:'mc4',country:'nepal',cat:'Медитация',emoji:'🔔',name:'Тибетские поющие чаши',desc:'Медитация со звуком — исцеление и гармония',price:1500,dur:'1.5 ч',rating:4.9,spots:6,level:'Любой',times:['09:00','13:00']},
    {id:'mc5',country:'nepal',cat:'Живопись',emoji:'🖌',name:'Тханка — тибетская живопись',desc:'Создаём священный буддийский рисунок',price:3500,dur:'4 ч',rating:4.9,spots:4,level:'Любой',times:['10:00']},
    {id:'mc6',country:'eastasia',cat:'Живопись',emoji:'🖊',name:'Китайская каллиграфия',desc:'Учимся писать иероглифы кистью и тушью',price:1600,dur:'2 ч',rating:4.8,spots:10,level:'Любой',times:['11:00','15:00','18:00']},
    {id:'mc7',country:'eastasia',cat:'Ремёсла',emoji:'🦋',name:'Японское оригами',desc:'Создаём сложные фигуры из бумаги',price:700,dur:'1 ч',rating:4.7,spots:15,level:'Начальный',times:['10:00','12:00','14:00','16:00']},
    {id:'mc8',country:'eastasia',cat:'Медитация',emoji:'🍵',name:'Китайская чайная церемония',desc:'История, философия и практика чайного пути',price:1800,dur:'1.5 ч',rating:4.9,spots:8,level:'Любой',times:['11:00','16:00']},
    {id:'mc9',country:'centralasia',cat:'Музыка',emoji:'🎶',name:'Домбра — казахский инструмент',desc:'Основы игры на национальном инструменте',price:1100,dur:'1 ч',rating:4.7,spots:6,level:'Любой',times:['13:00','17:00']},
    {id:'mc10',country:'centralasia',cat:'Ремёсла',emoji:'🪡',name:'Ткачество ковров',desc:'Традиционное центральноазиатское искусство',price:2800,dur:'3 ч',rating:4.8,spots:4,level:'Любой',times:['10:00','14:00']},
    {id:'mc11',country:'siberia',cat:'Ремёсла',emoji:'🏺',name:'Гончарство на круге',desc:'Лепим сосуды из сибирской глины',price:1800,dur:'2 ч',rating:4.9,spots:6,level:'Любой',times:['11:00','14:00','17:00']},
    {id:'mc12',country:'siberia',cat:'Кулинария',emoji:'🥣',name:'Русская кухня — пироги',desc:'Секреты русских пирогов и блинов',price:1900,dur:'2.5 ч',rating:4.7,spots:10,level:'Любой',times:['10:00','15:00']},
    {id:'mc13',country:'ukraine',cat:'Ремёсла',emoji:'🪆',name:'Роспись деревянной игрушки',desc:'Хохлома, гжель, авторская роспись',price:1400,dur:'2 ч',rating:4.8,spots:8,level:'Любой',times:['11:00','14:00']},
    {id:'mc14',country:'ukraine',cat:'Ремёсла',emoji:'🥚',name:'Роспись писанки',desc:'Украинская традиция расписных яиц',price:900,dur:'1.5 ч',rating:4.8,spots:12,level:'Любой',times:['10:00','13:00','16:00']},
    {id:'mc15',country:'srilanka',cat:'Медитация',emoji:'🌺',name:'Аюрведа — основы',desc:'Диагностика и практики индийской медицины',price:2500,dur:'2 ч',rating:4.9,spots:5,level:'Любой',times:['10:00','15:00']},
    {id:'mc16',country:'sea',cat:'Ремёсла',emoji:'🌸',name:'Батик — роспись ткани',desc:'Яванское искусство батика',price:2000,dur:'3 ч',rating:4.8,spots:6,level:'Любой',times:['11:00','15:00']},
    // Cross-country
    {id:'mc17',country:null,cat:'Музыка',emoji:'🥁',name:'Барабаны народов мира',desc:'Джамбе, конга, дарбука — для всех',price:900,dur:'1.5 ч',rating:4.8,spots:15,level:'Любой',times:['12:00','17:00']},
    {id:'mc18',country:null,cat:'Кулинария',emoji:'🌏',name:'Кулинарный квест «Вокруг света»',desc:'5 блюд из 5 стран за 3 часа',price:3200,dur:'3 ч',rating:4.9,spots:8,level:'Любой',times:['13:00']},
  ];

  const categories=['all','Ремёсла','Живопись','Кулинария','Музыка','Медитация','Танцы'];
  const catLabels={all:'Все','Ремёсла':'🏺 Ремёсла','Живопись':'🎨 Живопись','Кулинария':'🍜 Кулинария','Музыка':'🎵 Музыка','Медитация':'🧘 Медитация','Танцы':'💃 Танцы'};

  // Filter: either by country or by category
  const shown=MCS.filter(mc=>{
    if(filter==='all') return true;
    const knownCountry=COUNTRIES.find(c=>c.id===filter);
    if(knownCountry) return mc.country===filter;
    return mc.cat===filter;
  });

  const todaySlots=MCS.reduce((s,m)=>s+m.times.length,0);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Мастер-классы" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:`${purple}15`,border:`0.5px solid ${purple}30`,padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:purple}}>{todaySlots} занятий сегодня</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'4px 20px 0'}}>
        {/* Tab toggle — по стране / по категории */}
        <div style={{display:'flex',gap:6,marginBottom:12}}>
          {['По стране','По теме'].map((lbl,i)=>{
            const isCountryMode = filter==='all' || !!COUNTRIES.find(c=>c.id===filter);
            const active = i===0 ? isCountryMode : !isCountryMode || filter!=='all' && !COUNTRIES.find(c=>c.id===filter);
            return null; // just use single scroll strip below
          })}
        </div>

        {/* Country + category filter scroll */}
        <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:12,scrollbarWidth:'none'}}>
          {/* Category filters */}
          {categories.map(cat=>{
            const active=filter===cat;
            return <div key={cat} onClick={()=>setFilter(cat)} className="eth-press" style={{
              flexShrink:0,height:36,borderRadius:18,
              background:active?purple:'var(--ef2)',
              border:active?'none':'0.5px solid var(--es2)',
              padding:'0 13px',display:'flex',alignItems:'center',gap:5,cursor:'pointer',
              transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
            }}>
              <span style={{fontSize:12,fontFamily:FT,fontWeight:active?600:400,color:active?'#fff':l2,whiteSpace:'nowrap'}}>{catLabels[cat]||cat}</span>
            </div>;
          })}
          <div style={{height:36,width:0.5,background:sep2,flexShrink:0,alignSelf:'center'}}/>
          {/* Country filters */}
          {COUNTRIES.filter(c=>MCS.some(m=>m.country===c.id)).map(c=>{
            const active=filter===c.id;
            return <div key={c.id} onClick={()=>setFilter(c.id)} className="eth-press" style={{
              flexShrink:0,height:36,borderRadius:18,
              background:active?c.color:'var(--ef2)',
              border:active?'none':'0.5px solid var(--es2)',
              padding:'0 12px',display:'flex',alignItems:'center',gap:5,cursor:'pointer',
              transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
            }}>
              <span style={{fontSize:14}}>{c.flag}</span>
              <span style={{fontSize:12,fontFamily:FT,fontWeight:active?600:400,color:active?'#fff':l2,whiteSpace:'nowrap'}}>{c.name}</span>
            </div>;
          })}
        </div>

        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:14}}>
          {shown.length} мастер-класс{shown.length===1?'':shown.length<5?'а':'ов'} сегодня
        </div>

        {/* MC cards */}
        <div style={{paddingBottom:100}}>
          {shown.map((mc,i)=>{
            const ctry=COUNTRIES.find(c=>c.id===mc.country);
            return <div key={mc.id} onClick={()=>push('booking',{h:{n:mc.name,p:mc.price,em:ctry?.flag||'🎨'}})} className="eth-press" style={{
              borderRadius:20,overflow:'hidden',marginBottom:14,cursor:'pointer',
              background:bg2,border:`0.5px solid ${ctry?ctry.color+'25':sep2}`,
            }}>
              {/* Colour band */}
              {ctry&&<div style={{height:4,background:ctry.grad}}/>}
              <div style={{padding:'14px 16px'}}>
                <div style={{display:'flex',gap:13}}>
                  <div style={{
                    width:60,height:60,borderRadius:17,flexShrink:0,
                    background:ctry?`${ctry.color}12`:`${purple}12`,
                    border:`1px solid ${ctry?ctry.color+'25':`${purple}20`}`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,
                  }}>{mc.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:1}}>
                      <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{mc.name}</span>
                      {ctry&&<span style={{fontSize:13}}>{ctry.flag}</span>}
                    </div>
                    <div style={{fontSize:12,fontFamily:FT,color:l3,marginBottom:7,lineHeight:1.4}}>{mc.desc}</div>
                    <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                      <div style={{display:'flex',alignItems:'center',gap:3}}>
                        <Ic.star s={10} c={yellow}/>
                        <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:yellow}}>{mc.rating}</span>
                      </div>
                      <span style={{fontSize:12,fontFamily:FT,color:l3}}>⏱ {mc.dur}</span>
                      <div style={{
                        height:20,borderRadius:6,
                        background:mc.spots<=3?`${red}15`:`${green}15`,
                        border:`0.5px solid ${mc.spots<=3?red+'30':green+'30'}`,
                        padding:'0 8px',display:'flex',alignItems:'center',
                      }}>
                        <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:mc.spots<=3?red:green}}>
                          {mc.spots<=3?`⚡ ${mc.spots} места`:`${mc.spots} мест`}
                        </span>
                      </div>
                      <span style={{fontSize:12,fontFamily:FT,color:l3}}>{mc.level}</span>
                    </div>
                  </div>
                </div>
                {/* Time slots */}
                <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:11,fontFamily:FT,color:l4,flexShrink:0}}>Сегодня:</span>
                  <div style={{display:'flex',gap:6,overflowX:'auto',scrollbarWidth:'none'}}>
                    {mc.times.map((t,j)=><div key={j} style={{
                      flexShrink:0,height:26,borderRadius:8,
                      background:'var(--ef2)',border:'0.5px solid var(--es2)',
                      padding:'0 10px',display:'flex',alignItems:'center',
                    }}>
                      <span style={{fontSize:12,fontFamily:FD,fontWeight:500,color:l2}}>{t}</span>
                    </div>)}
                  </div>
                  <div style={{
                    flexShrink:0,height:30,borderRadius:9,
                    background:purple,
                    boxShadow:`inset 0 1px 0 rgba(255,255,255,.2),0 2px 6px ${purple}35`,
                    padding:'0 13px',display:'flex',alignItems:'center',cursor:'pointer',marginLeft:'auto',
                  }}>
                    <span style={{fontSize:13,fontFamily:FT,fontWeight:600,color:'#fff'}}>{mc.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  SPA SCREEN v9+ — Мировые практики СПА
// ═══════════════════════════════════════════════════════════════
function SpaSC({push,pop}){
  const[cat,setCat]=useState('all');
  const cats=['all','Массаж','Аюрведа','Обёртывание','Ванны','Лицо','Антистресс'];

  const treatments=[
    // By country origin
    {id:'sp1',origin:'india',cat:'Аюрведа',emoji:'🪴',name:'Аюрведа Абхьянга',desc:'Масляный массаж всего тела по системе Аюрведы',dur:'90 мин',price:6800,rating:4.9,origin_label:'Индия 🇮🇳'},
    {id:'sp2',origin:'india',cat:'Аюрведа',emoji:'🫚',name:'Широдхара',desc:'Тёплое масло на лоб — снятие стресса и бессонницы',dur:'60 мин',price:5400,rating:4.9,origin_label:'Индия 🇮🇳'},
    {id:'sp3',origin:'sea',cat:'Массаж',emoji:'💆',name:'Тайский традиционный массаж',desc:'Йога-массаж с растяжкой без масла',dur:'60/90/120 мин',price:4200,rating:4.9,origin_label:'Таиланд 🇹🇭'},
    {id:'sp4',origin:'sea',cat:'Массаж',emoji:'🌺',name:'Балийский массаж',desc:'Глубокое расслабление с кокосовым маслом',dur:'60 мин',price:3800,rating:4.8,origin_label:'Бали 🇮🇩'},
    {id:'sp5',origin:'eastasia',cat:'Массаж',emoji:'🔴',name:'Китайский точечный — Шиацу',desc:'Воздействие на биологически активные точки',dur:'60 мин',price:4500,rating:4.8,origin_label:'Япония 🇯🇵'},
    {id:'sp6',origin:'eastasia',cat:'Антистресс',emoji:'🎐',name:'Японская зоновая терапия',desc:'Рефлексотерапия стоп по меридианам',dur:'45 мин',price:3200,rating:4.7,origin_label:'Япония 🇯🇵'},
    {id:'sp7',origin:'srilanka',cat:'Обёртывание',emoji:'🌿',name:'Цейлонское чайное обёртывание',desc:'Детокс и подтяжка с экстрактом чая',dur:'50 мин',price:3500,rating:4.7,origin_label:'Шри-Ланка 🇱🇰'},
    {id:'sp8',origin:'srilanka',cat:'Ванны',emoji:'🛁',name:'СПА-ритуал Шри-Ланки',desc:'Тропическая ванна с лепестками и маслами',dur:'45 мин',price:2800,rating:4.8,origin_label:'Шри-Ланка 🇱🇰'},
    // Universal
    {id:'sp9',origin:null,cat:'Обёртывание',emoji:'🌸',name:'Фито-обёртывание «Детокс»',desc:'Лечебные травы, разгон лимфы, похудение',dur:'50 мин',price:3200,rating:4.7,origin_label:'Авторская'},
    {id:'sp10',origin:null,cat:'Массаж',emoji:'🔥',name:'Горячие базальтовые камни',desc:'Глубокое прогревание мышц — идеально после бани',dur:'90 мин',price:4900,rating:4.8,origin_label:'Авторская'},
    {id:'sp11',origin:null,cat:'Лицо',emoji:'💎',name:'Diamond Lifting',desc:'Алмазный пилинг + кислородная маска',dur:'60 мин',price:5800,rating:4.9,origin_label:'Премиум'},
    {id:'sp12',origin:null,cat:'Антистресс',emoji:'🌙',name:'Лунный ритуал',desc:'Ароматерапия + кристаллы + звуковые чаши',dur:'90 мин',price:5200,rating:4.9,origin_label:'Авторская'},
    {id:'sp13',origin:null,cat:'Ванны',emoji:'🫧',name:'Жемчужная ванна',desc:'Гидромассажная ванна с морскими минералами',dur:'30 мин',price:2200,rating:4.6,origin_label:'Классика'},
    {id:'sp14',origin:null,cat:'Ванны',emoji:'🌷',name:'Ванна на молоке',desc:'Египетский ритуал красоты — Клеопатра',dur:'45 мин',price:3400,rating:4.8,origin_label:'Классика'},
  ];

  const shown=cat==='all'?treatments:treatments.filter(t=>t.cat===cat);

  const packages=[
    {name:'День СПА',emoji:'✨',dur:'4 ч',price:12000,includes:'Массаж + ванна + обёртывание'},
    {name:'Пара',emoji:'💑',dur:'3 ч',price:16000,includes:'Для двоих: ритуал + ужин'},
    {name:'Антистресс',emoji:'🧘',dur:'2.5 ч',price:9500,includes:'Медитация + массаж + баня'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="СПА" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:`${pink}15`,border:`0.5px solid ${pink}30`,padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:pink}}>● Открыто 09:00–22:00</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'4px 20px 0'}}>
        {/* Packages teaser */}
        <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:14,scrollbarWidth:'none'}}>
          {packages.map((pkg,i)=><div key={i} onClick={()=>push('booking',{h:{n:pkg.name,p:pkg.price,em:'💆'}})} className="eth-press" style={{
            flexShrink:0,width:180,borderRadius:18,overflow:'hidden',cursor:'pointer',
            background:`linear-gradient(135deg,#2a0a1a,#4a1030)`,
            border:`0.5px solid ${pink}25`,
            padding:'14px 14px',
          }}>
            <div style={{fontSize:26,marginBottom:6}}>{pkg.emoji}</div>
            <div style={{fontSize:14,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.2px',marginBottom:2}}>{pkg.name}</div>
            <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.6)',marginBottom:8,lineHeight:1.3}}>{pkg.includes}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:pink}}>{pkg.price.toLocaleString('ru-RU')} ₽</span>
              <span style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.4)'}}>{pkg.dur}</span>
            </div>
          </div>)}
        </div>

        {/* Category filter */}
        <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:12,scrollbarWidth:'none'}}>
          {cats.map(c=>{
            const active=cat===c;
            return <div key={c} onClick={()=>setCat(c)} className="eth-press" style={{
              flexShrink:0,height:34,borderRadius:17,
              background:active?pink:'var(--ef2)',
              border:active?'none':'0.5px solid var(--es2)',
              padding:'0 12px',display:'flex',alignItems:'center',cursor:'pointer',
              transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
            }}>
              <span style={{fontSize:12,fontFamily:FT,fontWeight:active?600:400,color:active?'#fff':l2,whiteSpace:'nowrap'}}>{c==='all'?'Все':c}</span>
            </div>;
          })}
        </div>

        {/* Treatments */}
        <div style={{paddingBottom:100}}>
          {shown.map((t,i)=>{
            const ctry=COUNTRIES.find(c=>c.id===t.origin);
            return <div key={t.id} onClick={()=>push('booking',{h:{n:t.name,p:t.price,em:'💆'}})} className="eth-press" style={{
              display:'flex',gap:13,padding:'14px 16px',
              background:bg2,borderRadius:18,marginBottom:12,
              border:`0.5px solid ${sep2}`,cursor:'pointer',
            }}>
              <div style={{
                width:62,height:62,borderRadius:17,flexShrink:0,
                background:ctry?ctry.grad:`linear-gradient(135deg,#2a0a1a,#4a1030)`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,
                position:'relative',
              }}>
                {t.emoji}
                {ctry&&<div style={{position:'absolute',bottom:-4,right:-4,fontSize:12,background:bg2,borderRadius:6,padding:'1px 3px',border:`0.5px solid ${sep2}`}}>{ctry.flag}</div>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px',marginBottom:1}}>{t.name}</div>
                <div style={{fontSize:11,fontFamily:FT,color:t.origin_label.includes('🇮🇳')||t.origin_label.includes('🇹🇭')||t.origin_label.includes('🇯🇵')?pink:l3,marginBottom:5,fontWeight:500}}>{t.origin_label}</div>
                <div style={{fontSize:12,fontFamily:FT,color:l3,marginBottom:6,lineHeight:1.4}}>{t.desc}</div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:3}}>
                    <Ic.star s={10} c={yellow}/>
                    <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:yellow}}>{t.rating}</span>
                  </div>
                  <span style={{fontSize:12,fontFamily:FT,color:l3}}>{t.dur}</span>
                  <span style={{fontSize:14,fontFamily:FD,fontWeight:700,color:l1,marginLeft:'auto',letterSpacing:'-.3px'}}>{t.price.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  BANYA SCREEN v9+ — Банный остров Этномира
// ═══════════════════════════════════════════════════════════════
function BanyaScreen({push,pop}){
  const[selected,setSelected]=useState(null);

  const baths=[
    {
      id:'rus',emoji:'🔥',name:'Русская парная',country:'siberia',
      desc:'Берёзовый и дубовый веники, купель с ледяной водой, травяной чай',
      temp:'85–95°C',humidity:'60–70%',
      price:2500,dur:'2 ч',rating:4.9,nr:521,
      cap:'До 8 чел.',
      perks:['Веник в подарок','Мёд и соль','Купель −10°C','Чай с травами','Простыни и халат'],
      color:'#FF453A',
    },
    {
      id:'finn',emoji:'🧊',name:'Финская сауна',country:'siberia',
      desc:'Сухой жар, соляная комната, охлаждающий бассейн',
      temp:'90–100°C',humidity:'15–25%',
      price:2200,dur:'1.5 ч',rating:4.8,nr:389,
      cap:'До 12 чел.',
      perks:['Соляная комната','Бассейн','Ароматный пар','Простыни'],
      color:teal,
    },
    {
      id:'hammam',emoji:'🕌',name:'Хаммам',country:'centralasia',
      desc:'Мраморная баня, пенный массаж, пилинг кисой, ароматные масла',
      temp:'40–50°C',humidity:'90–100%',
      price:3200,dur:'1.5 ч',rating:4.9,nr:445,
      cap:'До 6 чел.',
      perks:['Пилинг кисой','Пенный массаж','Мраморный стол','Ароматерапия'],
      color:orange,
    },
    {
      id:'esko',emoji:'🌿',name:'Авторская баня ЕСКО',country:null,
      desc:'Уникальная методика оздоровления: парение, дыхательные практики, холодное обливание',
      temp:'60–80°C',humidity:'40–60%',
      price:4500,dur:'2 ч',rating:4.9,nr:278,
      cap:'До 4 чел.',
      perks:['Авторский протокол','Дыхательная гимнастика','Холодное обливание','Травяной сбор','Разбор практики'],
      color:green,
      featured:true,
    },
    {
      id:'infra',emoji:'❤️',name:'Инфракрасная сауна',country:null,
      desc:'Глубокое прогревание без высокой температуры — детокс и похудение',
      temp:'50–60°C',humidity:'10%',
      price:1800,dur:'1 ч',rating:4.7,nr:156,
      cap:'До 2 чел.',
      perks:['Хромотерапия','Музыкотерапия','Детокс-эффект'],
      color:pink,
    },
    {
      id:'couple',emoji:'💑',name:'СПА-тур для двоих',country:null,
      desc:'Баня + Хаммам + Массаж вдвоём + Ужин в этноресторане',
      temp:'—',humidity:'—',
      price:9800,dur:'4 ч',rating:4.9,nr:203,
      cap:'2 чел.',
      perks:['Русская баня','Хаммам','Массаж для двоих','Ужин в ресторане','Вино в подарок','Лепестки роз'],
      color:pink,
      featured:true,
    },
  ];

  const infra=[
    {emoji:'🏊',name:'Открытый бассейн',sub:'Подогрев 36°C · Круглый год'},
    {emoji:'🧊',name:'Купель',sub:'−5°C · Экстремальное закаливание'},
    {emoji:'☕',name:'Чайная комната',sub:'Травяные сборы · 20 видов чая'},
    {emoji:'🛋',name:'Зал отдыха',sub:'Кушетки · Тишина · Розмариновый аромат'},
    {emoji:'🍽',name:'Банная кухня',sub:'Лёгкие закуски · Соки · Смузи'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Бани и СПА" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:`${red}15`,border:`0.5px solid ${red}30`,padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:red}}>🔥 Жарко</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'4px 20px 0'}}>
        {/* Hero teaser */}
        <div style={{
          background:'linear-gradient(145deg,#2a0a00,#500000)',
          borderRadius:20,padding:'18px',marginBottom:18,
          border:'0.5px solid rgba(255,69,58,.15)',
          position:'relative',overflow:'hidden',
        }}>
          <div style={{position:'absolute',right:-15,top:-15,width:90,height:90,borderRadius:45,background:'rgba(255,100,0,.08)'}}/>
          <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,100,0,.7)',letterSpacing:'.4px',textTransform:'uppercase',marginBottom:4}}>Банный остров</div>
          <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px',lineHeight:1.2,marginBottom:6}}>6 видов бань и саун · Россия, Турция, Финляндия</div>
          <div style={{display:'flex',gap:16}}>
            {[['🔥','6 бань'],['🌡','До 100°C'],['💆','Массаж']].map(([e,l],i)=><div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:14}}>{e}</span>
              <span style={{fontSize:12,fontFamily:FT,color:'rgba(255,255,255,.6)'}}>{l}</span>
            </div>)}
          </div>
        </div>

        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:14}}>Выберите баню</div>

        {/* Bath cards */}
        {baths.map((bath,i)=>{
          const isOpen=selected===bath.id;
          const ctry=COUNTRIES.find(c=>c.id===bath.country);
          return <div key={bath.id} onClick={()=>setSelected(isOpen?null:bath.id)} className="eth-press" style={{
            borderRadius:20,overflow:'hidden',marginBottom:12,cursor:'pointer',
            background:bg2,
            border:`${bath.featured?1.5:.5}px solid ${bath.featured?bath.color+'40':sep2}`,
            boxShadow:bath.featured?`0 4px 20px ${bath.color}15`:'none',
          }}>
            {/* Card header */}
            <div style={{padding:'14px 16px',display:'flex',gap:13,alignItems:'center'}}>
              <div style={{
                width:56,height:56,borderRadius:16,flexShrink:0,
                background:ctry?ctry.grad:`linear-gradient(135deg,${bath.color}20,${bath.color}08)`,
                border:`1.5px solid ${bath.color}40`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
              }}>{bath.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                  <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{bath.name}</span>
                  {ctry&&<span style={{fontSize:13}}>{ctry.flag}</span>}
                  {bath.featured&&<Tag label="Хит" color={bath.color} small/>}
                </div>
                <div style={{fontSize:12,fontFamily:FT,color:l3,marginBottom:5,lineHeight:1.4}}>{bath.desc}</div>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <Stars r={bath.rating} n={bath.nr}/>
                  <span style={{fontSize:11,fontFamily:FT,color:l3}}>⏱ {bath.dur}</span>
                  <span style={{fontSize:11,fontFamily:FT,color:l3}}>👥 {bath.cap}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>{bath.price.toLocaleString('ru-RU')} ₽</div>
                <div style={{fontSize:10,fontFamily:FT,color:l4}}>/{bath.dur.split(' ')[0]}</div>
                <div style={{fontSize:12,fontFamily:FT,color:bath.color,marginTop:3}}>{bath.temp}</div>
              </div>
            </div>
            {/* Expanded perks */}
            {isOpen&&<div style={{padding:'0 16px 14px',borderTop:`0.5px solid ${sep2}`}}>
              <div style={{paddingTop:12,display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
                {bath.perks.map((p,j)=><div key={j} style={{
                  display:'flex',alignItems:'center',gap:5,
                  background:`${bath.color}10`,border:`0.5px solid ${bath.color}25`,
                  borderRadius:8,padding:'4px 10px',
                }}>
                  <Ic.check s={9} c={bath.color}/>
                  <span style={{fontSize:12,fontFamily:FT,color:l2}}>{p}</span>
                </div>)}
              </div>
              <div onClick={e=>{e.stopPropagation();push('booking',{h:{n:bath.name,p:bath.price,em:bath.emoji}});}} style={{
                height:44,borderRadius:13,
                background:bath.color,
                boxShadow:`inset 0 1px 0 rgba(255,255,255,.22),0 3px 12px ${bath.color}35`,
                display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
              }}>
                <span style={{fontSize:15,fontFamily:FD,fontWeight:600,color:'#fff',letterSpacing:'-.2px'}}>Забронировать</span>
              </div>
            </div>}
          </div>;
        })}

        {/* Infrastructure */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12,marginTop:8}}>Инфраструктура</div>
        <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`,marginBottom:100}}>
          {infra.map((item,i)=><div key={i} style={{
            display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
            background:bg2,borderBottom:i<infra.length-1?`0.5px solid ${sep2}`:'none',
          }}>
            <span style={{fontSize:22}}>{item.emoji}</span>
            <div>
              <div style={{fontSize:14,fontFamily:FT,fontWeight:600,color:l1}}>{item.name}</div>
              <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{item.sub}</div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  MUSEUMS SCREEN v9+ — Музеи и выставки Этномира
// ═══════════════════════════════════════════════════════════════
function MuseumsScreen({push,pop}){
  const museums=[
    {
      id:'m1',country:'centralasia',emoji:'🚀',
      name:'Музей СССР',
      desc:'Уникальная коллекция советской эпохи: быт, техника, плакаты, кинохроника',
      rating:4.8,nr:1240,
      price:800,price_child:400,
      dur:'1.5–2 ч',
      area:'2 000 м²',
      sections:['Советская кухня','Кинотеатр','Магазин «Берёзка»','Гараж ретроавтомобилей'],
      open:true,schedule:'10:00–20:00',
      color:'#FF453A',featured:true,
    },
    {
      id:'m2',country:'india',emoji:'🪬',
      name:'Галерея индийского искусства',
      desc:'Миниатюрная живопись Моголов, народное искусство, современный индийский арт',
      rating:4.7,nr:567,
      price:600,price_child:300,
      dur:'1 ч',area:'800 м²',
      sections:['Миниатюры','Маски','Скульптура','Ювелирное дело'],
      open:true,schedule:'10:00–19:00',
      color:'#FF6B35',featured:false,
    },
    {
      id:'m3',country:'nepal',emoji:'🏔',
      name:'Музей Гималаев',
      desc:'История восхождений, буддийская культура Тибета, экспонаты Непала и Бутана',
      rating:4.8,nr:445,
      price:700,price_child:350,
      dur:'1.5 ч',area:'1 200 м²',
      sections:['Мир Будды','Альпинистское снаряжение','Монастырский зал','Тибетская танка'],
      open:true,schedule:'09:00–18:00',
      color:'#4A90D9',featured:false,
    },
    {
      id:'m4',country:'eastasia',emoji:'🏯',
      name:'Мир Востока',
      desc:'Китайская, японская, корейская культуры — фарфор, шёлк, лакировка, самурайское оружие',
      rating:4.9,nr:789,
      price:900,price_child:450,
      dur:'2 ч',area:'2 500 м²',
      sections:['Самурайская броня','Шёлковый путь','Фарфор','Чайный зал'],
      open:true,schedule:'10:00–20:00',
      color:'#E74C3C',featured:false,
    },
    {
      id:'m5',country:'siberia',emoji:'🌲',
      name:'Музей Сибири',
      desc:'История Сибири от эпохи мамонтов до освоения космоса. Животные, минералы, шаманизм',
      rating:4.7,nr:534,
      price:600,price_child:300,
      dur:'1.5 ч',area:'1 800 м²',
      sections:['Мамонты','Шаманский ритуал','Освоение Сибири','Флора и фауна'],
      open:true,schedule:'09:00–19:00',
      color:'#1ABC9C',featured:false,
    },
    {
      id:'m6',country:null,emoji:'🌐',
      name:'Музей народов мира',
      desc:'Экспозиция об этнографии всех народов, живущих в Этномире: одежда, обряды, кухня',
      rating:4.9,nr:920,
      price:700,price_child:350,
      dur:'2 ч',area:'3 000 м²',
      sections:['Одежда народов','Ритуалы','Кухня мира','Детский зал'],
      open:true,schedule:'09:00–21:00',
      color:blue,featured:true,
    },
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Музеи" back={pop?'Назад':undefined} onBack={pop}/>

    <div style={{flex:1,overflowY:'auto',padding:'8px 20px',paddingBottom:100}}>
      {/* Featured */}
      {museums.filter(m=>m.featured).length>0&&<div style={{marginBottom:24}}>
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Рекомендуем</div>
        <div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
          {museums.filter(m=>m.featured).map(m=>{
            const ctry=COUNTRIES.find(c=>c.id===m.country);
            return <div key={m.id} onClick={()=>push('museums')} className="eth-press" style={{
              flexShrink:0,width:280,borderRadius:20,overflow:'hidden',cursor:'pointer',
              background:ctry?ctry.grad:`linear-gradient(135deg,#1a1a3e,#2d2d6e)`,
              boxShadow:`0 8px 28px ${m.color}25`,
              height:160,position:'relative',
            }}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.55))'}}/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'14px 16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  {ctry&&<span style={{fontSize:16}}>{ctry.flag}</span>}
                  <Tag label="⭐ Рекомендуем" color={m.color} small/>
                </div>
                <div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.4px',marginBottom:2}}>{m.emoji} {m.name}</div>
                <div style={{fontSize:12,fontFamily:FT,color:'rgba(255,255,255,.65)',lineHeight:1.4}}>{m.desc.slice(0,70)}…</div>
              </div>
            </div>;
          })}
        </div>
      </div>}

      {/* All museums */}
      <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Все музеи ({museums.length})</div>
      {museums.map((m,i)=>{
        const ctry=COUNTRIES.find(c=>c.id===m.country);
        return <div key={m.id} onClick={()=>push('museums')} className="eth-press" style={{
          borderRadius:20,overflow:'hidden',marginBottom:14,cursor:'pointer',
          background:bg2,border:`0.5px solid ${sep2}`,
        }}>
          <div style={{height:8,background:ctry?ctry.grad:`linear-gradient(90deg,${m.color},${m.color}80)`}}/>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:13}}>
              <div style={{
                width:58,height:58,borderRadius:16,flexShrink:0,
                background:`${m.color}12`,border:`1px solid ${m.color}25`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,
              }}>{m.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                  <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{m.name}</span>
                  {ctry&&<span style={{fontSize:14}}>{ctry.flag}</span>}
                </div>
                <div style={{fontSize:12,fontFamily:FT,color:l3,marginBottom:7,lineHeight:1.4}}>{m.desc}</div>
                <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                  <Stars r={m.rating} n={m.nr}/>
                  <span style={{fontSize:12,fontFamily:FT,color:l3}}>⏱ {m.dur}</span>
                  <div style={{height:18,borderRadius:6,background:`${green}15`,border:`0.5px solid ${green}30`,padding:'0 7px',display:'flex',alignItems:'center'}}>
                    <span style={{fontSize:10,fontFamily:FT,fontWeight:600,color:green}}>{m.schedule}</span>
                  </div>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:15,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{m.price} ₽</div>
                <div style={{fontSize:10,fontFamily:FT,color:l4}}>взрослый</div>
                <div style={{fontSize:11,fontFamily:FT,color:l3,marginTop:1}}>{m.price_child} ₽ дети</div>
              </div>
            </div>
            {/* Sections */}
            <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
              {m.sections.map((s,j)=><span key={j} style={{fontSize:11,fontFamily:FT,color:l3,background:'var(--ef3)',borderRadius:7,padding:'3px 9px',border:`0.5px solid ${sep2}`}}>{s}</span>)}
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ATTRACTIONS SCREEN v9+ — Аттракционы и развлечения
// ═══════════════════════════════════════════════════════════════
function AttractionsScreen({push,pop}){
  const[age,setAge]=useState('all');
  const ageGroups=['all','kids','family','adult'];
  const ageLabels={all:'Все',kids:'Детям',family:'Семья',adult:'Взрослым'};

  const attractions=[
    {id:'a1',emoji:'🏹',name:'Лучный тир «Монгол»',desc:'Стреляем из лука по-казахски — с коня и с земли',price:600,age:'adult',country:'centralasia',dur:'30 мин',rating:4.8},
    {id:'a2',emoji:'🧗',name:'Верёвочный парк «Тайга»',desc:'12 маршрутов от 2 до 18 метров, зиплайн 150 м',price:900,age:'family',country:'siberia',dur:'2 ч',rating:4.7},
    {id:'a3',emoji:'🐴',name:'Конные прогулки',desc:'Верховая езда по территории парка с инструктором',price:1500,age:'family',country:'centralasia',dur:'1 ч',rating:4.9},
    {id:'a4',emoji:'🚁',name:'Полёт на параплане',desc:'Тандемный полёт над Этномиром — высота 300 м',price:4500,age:'adult',country:null,dur:'30 мин',rating:4.9},
    {id:'a5',emoji:'🎯',name:'Охота с беркутом',desc:'Казахская традиция — соколиная охота с настоящим беркутом',price:2000,age:'adult',country:'centralasia',dur:'1 ч',rating:4.9},
    {id:'a6',emoji:'🛶',name:'Прогулка на лодке',desc:'Озеро Этномира — прокат лодок и катамаранов',price:400,age:'family',country:null,dur:'1 ч',rating:4.6},
    {id:'a7',emoji:'🎪',name:'Этноцирк',desc:'Акробаты, жонглёры, огненное шоу — ежевечерне',price:1200,age:'family',country:null,dur:'1.5 ч',rating:4.8},
    {id:'a8',emoji:'🏄',name:'Водные горки',desc:'Аквапарк: 5 горок от детских до экстремальных',price:800,age:'kids',country:null,dur:'—',rating:4.7},
    {id:'a9',emoji:'⚔️',name:'Рыцарский турнир',desc:'Театрализованный исторический бой в доспехах',price:1500,age:'adult',country:null,dur:'1 ч',rating:4.8},
    {id:'a10',emoji:'🔭',name:'Звёздное небо',desc:'Ночная астрономия с телескопом — 500+ объектов',price:700,age:'family',country:null,dur:'2 ч',rating:4.9},
    {id:'a11',emoji:'🎠',name:'Карусель народов мира',desc:'Vintage-карусель с фигурами животных всех стран',price:200,age:'kids',country:null,dur:'—',rating:4.5},
    {id:'a12',emoji:'🌊',name:'Рафтинг',desc:'Спуск на рафте по искусственному порогу',price:1200,age:'adult',country:null,dur:'40 мин',rating:4.8},
  ];

  const shown=age==='all'?attractions:attractions.filter(a=>a.age===age);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Аттракционы" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:`${orange}15`,border:`0.5px solid ${orange}30`,padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:orange}}>{shown.length} доступно</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'8px 20px 0'}}>
        {/* Age tabs */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {ageGroups.map(g=><div
            key={g} onClick={()=>setAge(g)} className="eth-press"
            style={{
              flex:1,height:38,borderRadius:12,cursor:'pointer',
              background:age===g?orange:bg2,
              border:age===g?'none':`0.5px solid ${sep2}`,
              display:'flex',alignItems:'center',justifyContent:'center',
              transition:'all .2s',
            }}
          >
            <span style={{fontSize:13,fontFamily:FT,fontWeight:age===g?700:400,color:age===g?'#fff':l2}}>{ageLabels[g]}</span>
          </div>)}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,paddingBottom:100}}>
          {shown.map((a,i)=>{
            const ctry=COUNTRIES.find(c=>c.id===a.country);
            return <div key={a.id} onClick={()=>push('booking',{h:{n:a.name,p:a.price,em:a.emoji}})} className="eth-press" style={{
              borderRadius:18,overflow:'hidden',cursor:'pointer',background:bg2,border:`0.5px solid ${sep2}`,
            }}>
              <div style={{
                height:90,
                background:ctry?ctry.grad:`linear-gradient(135deg,#1a2a1a,#2d4a2d)`,
                position:'relative',display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                <span style={{fontSize:40,opacity:.4}}>{a.emoji}</span>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.4))'}}/>
                {ctry&&<div style={{position:'absolute',top:8,left:10,fontSize:14}}>{ctry.flag}</div>}
                <div style={{position:'absolute',top:8,right:10,background:'rgba(0,0,0,.4)',borderRadius:7,padding:'2px 8px'}}>
                  <span style={{fontSize:11,fontFamily:FD,fontWeight:700,color:'#fff'}}>{a.price} ₽</span>
                </div>
              </div>
              <div style={{padding:'10px 12px'}}>
                <div style={{fontSize:14,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.2px',lineHeight:1.2,marginBottom:3}}>{a.name}</div>
                <div style={{fontSize:11,fontFamily:FT,color:l3,lineHeight:1.3,marginBottom:6}}>{a.desc.slice(0,60)}{a.desc.length>60?'…':''}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:3}}>
                    <Ic.star s={10} c={yellow}/>
                    <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:yellow}}>{a.rating}</span>
                  </div>
                  <span style={{fontSize:11,fontFamily:FT,color:l4}}>⏱ {a.dur}</span>
                </div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  WEDDINGS SCREEN v9+ — Праздники и события
// ═══════════════════════════════════════════════════════════════
function WeddingsScreen({push,pop}){
  const venues=[
    {id:'v1',emoji:'🏛',name:'Конгресс-холл «Диалог культур»',cap:'До 1 000 чел.',area:'2 500 м²',style:'Международный',color:blue},
    {id:'v2',emoji:'🌿',name:'Открытая сцена «Земля»',cap:'До 5 000 чел.',area:'Открытая',style:'Фестиваль',color:green},
    {id:'v3',emoji:'🏰',name:'Этнотерраса «Горизонт»',cap:'До 200 чел.',area:'600 м²',style:'Банкет',color:orange},
    {id:'v4',emoji:'🔥',name:'Индийский зал «Раджа»',cap:'До 120 чел.',area:'380 м²',style:'Этнический',color:'#FF6B35'},
    {id:'v5',emoji:'🏔',name:'Непальский дворик',cap:'До 80 чел.',area:'250 м²',style:'Камерный',color:'#4A90D9'},
    {id:'v6',emoji:'🌙',name:'Зал «Луна» (VIP)',cap:'До 40 чел.',area:'150 м²',style:'VIP',color:purple},
  ];

  const pkgs=[
    {
      emoji:'💒',name:'Свадьба в Этномире',color:pink,
      price:350000,priceLabel:'от 350 000 ₽',
      sub:'Полный день · Все залы · До 200 гостей',
      includes:['Конгресс-холл «Диалог культур»','Банкетное меню народов мира','Профессиональное фото + видео','Номер молодожёнов в этноотеле','Фейерверк над территорией','Этническая музыкальная программа','Флористическое оформление','Выездная церемония в любой стране'],
    },
    {
      emoji:'🎂',name:'День рождения',color:orange,
      price:45000,priceLabel:'от 45 000 ₽',
      sub:'Праздничная программа · Любой зал',
      includes:['Зал на выбор','Аниматоры и конкурсы','Торт на заказ','Скидки на отели и ресторан','Воздушные шары','МК для гостей'],
    },
    {
      emoji:'🎓',name:'Выпускной',color:blue,
      price:80000,priceLabel:'от 80 000 ₽',
      sub:'4, 9, 11 класс · Банкет + программа',
      includes:['Банкетное меню','Live-музыка','Конкурсы и квесты','Скидки на отели','Фейерверк','Памятные подарки'],
    },
    {
      emoji:'🏢',name:'Корпоратив',color:teal,
      price:120000,priceLabel:'от 120 000 ₽',
      sub:'Тимбилдинг · Банкет · Любой формат',
      includes:['Конгресс-холл или открытая площадка','Программы командообразования','Мастер-классы по странам','Кейтеринг меню народов','Трансфер из Москвы','Размещение в этноотелях'],
    },
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Праздники" back={pop?'Назад':undefined} onBack={pop}
      right={<div onClick={()=>push('business')} style={{height:30,borderRadius:9,background:`${pink}15`,border:`0.5px solid ${pink}30`,padding:'0 11px',display:'flex',alignItems:'center',cursor:'pointer'}}>
        <span style={{fontSize:12,fontFamily:FT,color:pink}}>Заявка</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'8px 20px 0'}}>
        {/* Venues scroll */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Площадки</div>
        <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:14,scrollbarWidth:'none'}}>
          {venues.map(v=><div key={v.id} style={{
            flexShrink:0,width:170,borderRadius:16,overflow:'hidden',cursor:'pointer',
            background:bg2,border:`0.5px solid ${sep2}`,
          }}>
            <div style={{height:70,background:`linear-gradient(135deg,${v.color}20,${v.color}08)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>{v.emoji}</div>
            <div style={{padding:'10px 12px'}}>
              <div style={{fontSize:13,fontFamily:FD,fontWeight:700,color:l1,lineHeight:1.2,marginBottom:3}}>{v.name}</div>
              <div style={{fontSize:11,fontFamily:FT,color:l3}}>{v.cap}</div>
              <div style={{fontSize:11,fontFamily:FT,color:v.color,marginTop:2,fontWeight:600}}>{v.style}</div>
            </div>
          </div>)}
        </div>

        {/* Packages */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:14}}>Форматы</div>
        {pkgs.map((pk,i)=><div key={i} style={{
          borderRadius:22,overflow:'hidden',marginBottom:16,
          background:bg2,border:`0.5px solid ${sep2}`,
        }}>
          <div style={{
            background:`linear-gradient(135deg,${pk.color}12,${pk.color}04)`,
            padding:'18px 18px 14px',display:'flex',alignItems:'center',gap:14,
            borderBottom:`0.5px solid ${sep2}`,
          }}>
            <div style={{
              width:56,height:56,borderRadius:16,flexShrink:0,
              background:`${pk.color}15`,border:`1.5px solid ${pk.color}35`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,
            }}>{pk.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:19,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>{pk.name}</div>
              <div style={{fontSize:13,fontFamily:FT,color:l3,marginTop:2}}>{pk.sub}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:16,fontFamily:FD,fontWeight:700,color:pk.color,letterSpacing:'-.3px'}}>{pk.priceLabel}</div>
            </div>
          </div>
          <div style={{padding:'14px 18px'}}>
            <div style={{display:'flex',flexWrap:'wrap',gap:'8px 16px',marginBottom:14}}>
              {pk.includes.map((inc,j)=><div key={j} style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:16,height:16,borderRadius:8,background:`${pk.color}18`,border:`0.5px solid ${pk.color}35`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic.check s={8} c={pk.color}/>
                </div>
                <span style={{fontSize:13,fontFamily:FT,color:l2}}>{inc}</span>
              </div>)}
            </div>
            <div onClick={()=>push('business')} className="eth-press" style={{
              height:46,borderRadius:13,
              background:pk.color,
              boxShadow:`inset 0 1px 0 rgba(255,255,255,.22),0 3px 12px ${pk.color}35`,
              display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
            }}>
              <span style={{fontSize:15,fontFamily:FD,fontWeight:600,color:['#FFD60A','#F1C40F'].includes(pk.color)?'#000':'#fff',letterSpacing:'-.2px'}}>Оставить заявку</span>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PARTNER DASHBOARD v9+ — Кабинет партнёра Этномира
// ═══════════════════════════════════════════════════════════════
function PartnerDashSC({push,pop}){
  const[period,setPeriod]=useState('month');

  const stats={
    revenue:    {month:387400, week:94200,  day:13800},
    orders:     {month:234,    week:56,     day:9},
    visitors:   {month:1240,   week:310,    day:48},
    conversion: {month:18.9,   week:18.1,   day:18.6},
  };

  const S=stats;
  const rev=S.revenue[period];
  const ord=S.orders[period];
  const vis=S.visitors[period];
  const conv=S.conversion[period];

  const channels=[
    {emoji:'🏨',name:'Этноотель',revenue:145000,orders:87,color:blue},
    {emoji:'🍜',name:'Ресторан',revenue:98400,orders:234,color:orange},
    {emoji:'🏺',name:'Мастер-кл.',revenue:67200,orders:56,color:purple},
    {emoji:'🏡',name:'Аренда пл.',revenue:76800,orders:12,color:teal},
  ];

  const recentOrders=[
    {id:'#4821',name:'Бронь отеля 2 ночи',amount:11600,time:'10:32',status:'paid'},
    {id:'#4820',name:'МК Гончарство × 3',amount:5400,time:'09:18',status:'paid'},
    {id:'#4819',name:'Ужин Индия × 4',amount:8800,time:'вчера',status:'paid'},
    {id:'#4818',name:'СПА Хаммам × 2',amount:6400,time:'вчера',status:'pending'},
    {id:'#4817',name:'Аренда мастерской',amount:38000,time:'3 дня',status:'paid'},
  ];

  const statusColor={paid:green,pending:orange,canceled:red};
  const statusLabel={paid:'Оплачен',pending:'Ожидает',canceled:'Отменён'};

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Кабинет партнёра" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:`${teal}15`,border:`0.5px solid ${teal}30`,padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:teal}}>● Активен</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'8px 20px 0'}}>
        {/* Period toggle */}
        <div style={{display:'flex',gap:6,background:'var(--ef2)',borderRadius:14,padding:4,border:'0.5px solid var(--es2)',marginBottom:18}}>
          {[['day','День'],['week','Неделя'],['month','Месяц']].map(([k,l])=><div
            key={k} onClick={()=>setPeriod(k)} className="eth-press-sm"
            style={{
              flex:1,height:32,borderRadius:11,cursor:'pointer',
              background:period===k?bg2:'transparent',
              boxShadow:period===k?'0 1px 4px rgba(0,0,0,.15)':'none',
              display:'flex',alignItems:'center',justifyContent:'center',
              transition:'all .2s',
            }}
          >
            <span style={{fontSize:13,fontFamily:FT,fontWeight:period===k?600:400,color:period===k?l1:l3}}>{l}</span>
          </div>)}
        </div>

        {/* Main revenue card */}
        <div style={{
          background:'linear-gradient(145deg,#0a2a1a,#1B4332)',
          borderRadius:20,padding:'20px',marginBottom:18,
          border:'0.5px solid rgba(48,209,88,.12)',
          boxShadow:'0 8px 32px rgba(27,67,50,.3)',
        }}>
          <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.5)',letterSpacing:'.4px',textTransform:'uppercase',marginBottom:6}}>Выручка</div>
          <div style={{fontSize:36,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-1.2px',marginBottom:4}}>
            {rev.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{display:'flex',gap:20}}>
            {[
              {n:ord,l:'заказов'},
              {n:vis,l:'посетителей'},
              {n:`${conv}%`,l:'конверсия'},
            ].map((s,i)=><div key={i}>
              <div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:'rgba(255,255,255,.9)',letterSpacing:'-.4px'}}>{s.n}</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.45)'}}>{s.l}</div>
            </div>)}
          </div>
        </div>

        {/* Channels breakdown */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>По каналам</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
          {channels.map((ch,i)=>{
            const pct=Math.round(ch.revenue/rev*100);
            return <div key={i} style={{borderRadius:16,padding:'14px',background:bg2,border:`0.5px solid ${sep2}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                <span style={{fontSize:20}}>{ch.emoji}</span>
                <span style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l1}}>{ch.name}</span>
              </div>
              <div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.5px',marginBottom:2}}>{ch.revenue.toLocaleString('ru-RU')} ₽</div>
              <div style={{background:'var(--ef2)',borderRadius:4,height:4,marginBottom:4}}>
                <div style={{width:`${pct}%`,height:'100%',background:ch.color,borderRadius:4}}/>
              </div>
              <div style={{fontSize:11,fontFamily:FT,color:l4}}>{ch.orders} заказов · {pct}%</div>
            </div>;
          })}
        </div>

        {/* Recent orders */}
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Последние заказы</div>
        <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`,marginBottom:100}}>
          {recentOrders.map((o,i)=><div key={i} style={{
            display:'flex',alignItems:'center',gap:13,padding:'12px 16px',
            background:bg2,borderBottom:i<recentOrders.length-1?`0.5px solid ${sep2}`:'none',
          }}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:1}}>
                <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:teal}}>{o.id}</span>
                <span style={{fontSize:14,fontFamily:FT,color:l1}}>{o.name}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{height:18,borderRadius:6,background:`${statusColor[o.status]}15`,border:`0.5px solid ${statusColor[o.status]}30`,padding:'0 7px',display:'flex',alignItems:'center'}}>
                  <span style={{fontSize:10,fontFamily:FT,fontWeight:600,color:statusColor[o.status]}}>{statusLabel[o.status]}</span>
                </div>
                <span style={{fontSize:11,fontFamily:FT,color:l4}}>{o.time}</span>
              </div>
            </div>
            <div style={{fontSize:15,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{o.amount.toLocaleString('ru-RU')} ₽</div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  GLAMPING SCREEN v9+ — Этнический глэмпинг
// ═══════════════════════════════════════════════════════════════
function GlampingSC({push,pop}){
  const[selected,setSelected]=useState(null);
  const options=[
    {
      id:'tipi',country:'centralasia',emoji:'🏕',name:'Типи «Великие Степи»',
      desc:'Индейский вигвам в стиле казахских кочевников — ковры, меховые подушки, живой огонь',
      sleeps:2,price:8500,rating:4.9,nr:234,
      amenities:['Кожаные подушки','Живой костёр','Завтрак включён','Звёздное небо'],color:'#F39C12',
    },
    {
      id:'yurt',country:'centralasia',emoji:'🏠',name:'Юрта «Кочевник»',
      desc:'Аутентичная казахская юрта с подогревом, шерстяными коврами и традиционным убранством',
      sleeps:4,price:12000,rating:4.9,nr:189,
      amenities:['Печное отопление','Этнические ковры','Завтрак','Банный комплекс'],color:'#9B59B6',
    },
    {
      id:'bubble',country:null,emoji:'🫧',name:'Bubble-шатёр «Небо»',
      desc:'Прозрачный купол со звёздами — спишь прямо под ночным небом, панорама 360°',
      sleeps:2,price:15000,rating:5.0,nr:156,
      amenities:['Вид на звёзды','Климат-контроль','Завтрак в номер','Джакузи'],color:blue,featured:true,
    },
    {
      id:'treehouse',country:'siberia',emoji:'🌲',name:'Дом на дереве «Тайга»',
      desc:'Деревянный домик в кронах сибирских кедров — на высоте 5 метров',
      sleeps:2,price:11000,rating:4.8,nr:145,
      amenities:['Подогрев','Кофемашина','Завтрак','Верёвочный мостик'],color:'#1ABC9C',
    },
    {
      id:'india-tent',country:'india',emoji:'🪅',name:'Шатёр «Радж»',
      desc:'Роскошный индийский шатёр с мозаикой, фонтанами и гамаком',
      sleeps:2,price:9500,rating:4.8,nr:178,
      amenities:['Лотосовый пруд','Индийский завтрак','Арома-терапия'],color:'#FF6B35',
    },
    {
      id:'mongol',country:'centralasia',emoji:'🏇',name:'Монгольский эр-гэр',
      desc:'Разборная юрта монгольского кочевника с очагом и лошадьми у входа',
      sleeps:3,price:10000,rating:4.7,nr:112,
      amenities:['Очаг','Конная прогулка','Этнический ужин'],color:'#E74C3C',
    },
  ];

  const sel=options.find(o=>o.id===selected);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Глэмпинг" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:`${green}15`,border:`0.5px solid ${green}30`,padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:green}}>6 вариантов</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'8px 20px 0'}}>
        {/* Options */}
        {options.map((opt,i)=>{
          const ctry=COUNTRIES.find(c=>c.id===opt.country);
          const isOpen=selected===opt.id;
          return <div key={opt.id} onClick={()=>setSelected(isOpen?null:opt.id)} className="eth-press" style={{
            borderRadius:20,overflow:'hidden',marginBottom:14,cursor:'pointer',
            background:bg2,
            border:`${opt.featured?2:.5}px solid ${opt.featured?opt.color+'50':sep2}`,
            boxShadow:opt.featured?`0 6px 24px ${opt.color}20`:isOpen?`0 3px 14px ${opt.color}15`:'none',
          }}>
            {/* Hero */}
            <div style={{height:130,background:ctry?ctry.grad:`linear-gradient(135deg,#0a1f14,#1B4332)`,position:'relative'}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.55))'}}/>
              {opt.featured&&<div style={{position:'absolute',top:12,left:14,height:24,borderRadius:8,background:opt.color,boxShadow:`0 2px 8px ${opt.color}50`,padding:'0 10px',display:'flex',alignItems:'center'}}>
                <span style={{fontSize:12,fontFamily:FT,fontWeight:700,color:'#fff'}}>⭐ Топ-выбор</span>
              </div>}
              {ctry&&<div style={{position:'absolute',top:12,right:14,fontSize:22}}>{ctry.flag}</div>}
              <div style={{position:'absolute',bottom:12,left:16,right:16,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                <div>
                  <div style={{fontSize:22,marginBottom:3}}>{opt.emoji}</div>
                  <div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.4px'}}>{opt.name}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{backdropFilter:'blur(12px)',background:'rgba(0,0,0,.35)',border:'0.5px solid rgba(255,255,255,.15)',borderRadius:10,padding:'5px 11px'}}>
                    <div style={{fontSize:15,fontFamily:FD,fontWeight:700,color:'#fff'}}>{opt.price.toLocaleString('ru-RU')} ₽</div>
                    <div style={{fontSize:9,fontFamily:FT,color:'rgba(255,255,255,.6)',letterSpacing:'.2px'}}>/ночь</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div style={{padding:'12px 16px'}}>
              <div style={{fontSize:13,fontFamily:FT,color:l3,lineHeight:1.4,marginBottom:8}}>{opt.desc}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <Stars r={opt.rating} n={opt.nr}/>
                  <span style={{fontSize:12,fontFamily:FT,color:l3}}>👥 {opt.sleeps} чел.</span>
                </div>
                <div style={{display:'flex',gap:5}}>
                  {opt.amenities.slice(0,2).map((a,j)=><span key={j} style={{fontSize:10,fontFamily:FT,color:l4,background:'var(--ef3)',borderRadius:6,padding:'2px 7px',border:`0.5px solid ${sep2}`}}>{a}</span>)}
                </div>
              </div>
            </div>

            {/* Expanded */}
            {isOpen&&<div style={{padding:'0 16px 16px',borderTop:`0.5px solid ${sep2}`}}>
              <div style={{paddingTop:12,display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
                {opt.amenities.map((a,j)=><div key={j} style={{display:'flex',alignItems:'center',gap:5,background:`${opt.color}10`,border:`0.5px solid ${opt.color}25`,borderRadius:8,padding:'4px 10px'}}>
                  <Ic.check s={9} c={opt.color}/>
                  <span style={{fontSize:12,fontFamily:FT,color:l2}}>{a}</span>
                </div>)}
              </div>
              <div onClick={e=>{e.stopPropagation();push('hoteldetail',{h:{n:opt.name,p:opt.price,em:opt.emoji,g:ctry?.grad||'linear-gradient(135deg,#0a1f14,#1B4332)',r:opt.rating,nr:opt.nr}});}} style={{
                height:46,borderRadius:13,background:opt.color,
                boxShadow:`inset 0 1px 0 rgba(255,255,255,.22),0 3px 12px ${opt.color}35`,
                display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
              }}>
                <span style={{fontSize:15,fontFamily:FD,fontWeight:600,color:'#fff',letterSpacing:'-.2px'}}>Забронировать</span>
              </div>
            </div>}
          </div>;
        })}
        <div style={{height:60}}/>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  EVENTS SCREEN v9+ — События и мероприятия
// ═══════════════════════════════════════════════════════════════
function EventsSC({push,pop}){
  const[day,setDay]=useState(0);
  const days=['Сегодня','Завтра','Эта неделя'];

  const events=[
    // Today
    {id:'e1',day:0,time:'12:00',dur:'1.5 ч',country:'india',emoji:'💃',name:'Болливудское шоу',place:'Индийский павильон',price:800,cap:200,spots:45,type:'Шоу',color:'#FF6B35'},
    {id:'e2',day:0,time:'14:00',dur:'2 ч',country:null,emoji:'🔥',name:'Шоу огня и барабанов',place:'Центральная сцена',price:0,cap:500,spots:320,type:'Бесплатно',color:red},
    {id:'e3',day:0,time:'15:30',dur:'1 ч',country:'eastasia',emoji:'🎋',name:'Чайная церемония — открытый урок',place:'Китайский дом',price:400,cap:20,spots:8,type:'Мастер-класс',color:'#E74C3C'},
    {id:'e4',day:0,time:'18:00',dur:'1 ч',country:'centralasia',emoji:'🎶',name:'Концерт домбристов',place:'Юрточный городок',price:600,cap:150,spots:67,type:'Концерт',color:'#9B59B6'},
    {id:'e5',day:0,time:'19:30',dur:'2 ч',country:null,emoji:'🌙',name:'Вечерний фестиваль фонариков',place:'Озеро Этномира',price:1200,cap:300,spots:120,type:'Фестиваль',color:blue,featured:true},
    {id:'e6',day:0,time:'21:00',dur:'45 мин',country:null,emoji:'✨',name:'Фейерверк «Народы мира»',place:'Главная площадь',price:0,cap:5000,spots:3200,type:'Бесплатно',color:yellow},
    // Tomorrow
    {id:'e7',day:1,time:'10:00',dur:'3 ч',country:'russia',emoji:'🥞',name:'Масленица — проводы зимы',place:'Русская деревня',price:500,cap:1000,spots:450,type:'Фестиваль',color:orange,featured:true},
    {id:'e8',day:1,time:'14:00',dur:'2 ч',country:'nepal',emoji:'🔔',name:'Тибетский буддийский ритуал',place:'Непальский монастырь',price:700,cap:40,spots:22,type:'Ритуал',color:'#4A90D9'},
    {id:'e9',day:1,time:'19:00',dur:'2 ч',country:'india',emoji:'🎭',name:'Катхак — классический индийский танец',place:'Сцена Индии',price:900,cap:150,spots:78,type:'Шоу',color:'#FF6B35'},
    // Week
    {id:'e10',day:2,time:'15:00',dur:'3 ч',country:null,emoji:'🌍',name:'Фестиваль народной кухни',place:'Весь Этномир',price:1500,cap:2000,spots:890,type:'Фестиваль',color:green,featured:true},
    {id:'e11',day:2,time:'12:00',dur:'2 ч',country:'centralasia',emoji:'🐎',name:'Конный турнир «Кокпар»',place:'Конный двор',price:600,cap:300,spots:180,type:'Спорт',color:'#F39C12'},
  ];

  const shown=events.filter(e=>e.day===day);
  const freeCount=shown.filter(e=>e.price===0).length;
  const typeColor={Шоу:pink,Концерт:purple,'Мастер-класс':orange,Фестиваль:green,Ритуал:blue,Бесплатно:green,Спорт:teal};

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="События" back={pop?'Назад':undefined} onBack={pop}
      right={freeCount>0?<div style={{height:30,borderRadius:9,background:`${green}15`,border:`0.5px solid ${green}30`,padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:12,fontFamily:FT,color:green}}>{freeCount} бесплатных</span>
      </div>:null}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'4px 20px 0'}}>
        {/* Day tabs */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {days.map((d,i)=><div
            key={i} onClick={()=>setDay(i)} className="eth-press"
            style={{
              flex:1,height:40,borderRadius:14,cursor:'pointer',
              background:day===i?blue:bg2,
              border:day===i?'none':`0.5px solid ${sep2}`,
              display:'flex',alignItems:'center',justifyContent:'center',
              transition:'all .2s',
            }}
          >
            <span style={{fontSize:13,fontFamily:FT,fontWeight:day===i?700:400,color:day===i?'#fff':l2}}>{d}</span>
          </div>)}
        </div>

        {/* Events list */}
        {shown.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:l3}}>
          <span style={{fontSize:36,display:'block',marginBottom:8}}>🎭</span>
          <span style={{fontSize:15,fontFamily:FT}}>Событий нет</span>
        </div>}

        {shown.map((ev,i)=>{
          const ctry=COUNTRIES.find(c=>c.id===ev.country);
          const pctFull=Math.round((ev.cap-ev.spots)/ev.cap*100);
          return <div key={ev.id} onClick={()=>push('booking',{h:{n:ev.name,p:ev.price,em:ev.emoji}})} className="eth-press" style={{
            borderRadius:20,overflow:'hidden',marginBottom:14,cursor:'pointer',
            background:bg2,
            border:`${ev.featured?1.5:.5}px solid ${ev.featured?ev.color+'40':sep2}`,
            boxShadow:ev.featured?`0 4px 20px ${ev.color}15`:'none',
          }}>
            {ctry&&<div style={{height:4,background:ctry.grad}}/>}
            <div style={{padding:'14px 16px'}}>
              <div style={{display:'flex',gap:13}}>
                <div style={{flexShrink:0,textAlign:'center',minWidth:44}}>
                  <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px'}}>{ev.time.split(':')[0]}</div>
                  <div style={{fontSize:12,fontFamily:FT,color:l4}}>{ev.time.split(':')[1]}</div>
                </div>
                <div style={{width:.5,background:sep2,flexShrink:0,alignSelf:'stretch'}}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                    <span style={{fontSize:16}}>{ev.emoji}</span>
                    <span style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{ev.name}</span>
                    {ctry&&<span style={{fontSize:13}}>{ctry.flag}</span>}
                  </div>
                  <div style={{fontSize:12,fontFamily:FT,color:l3,marginBottom:8}}>{ev.place} · ⏱ {ev.dur}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <div style={{height:20,borderRadius:6,background:`${(typeColor[ev.type]||blue)}15`,border:`0.5px solid ${(typeColor[ev.type]||blue)}30`,padding:'0 8px',display:'flex',alignItems:'center'}}>
                      <span style={{fontSize:10,fontFamily:FT,fontWeight:600,color:typeColor[ev.type]||blue}}>{ev.type}</span>
                    </div>
                    <span style={{fontSize:13,fontFamily:FD,fontWeight:700,color:ev.price===0?green:l1}}>
                      {ev.price===0?'Бесплатно':`${ev.price.toLocaleString('ru-RU')} ₽`}
                    </span>
                    <span style={{fontSize:12,fontFamily:FT,color:l4}}>·</span>
                    <span style={{fontSize:12,fontFamily:FT,color:ev.spots<50?red:l3}}>
                      {ev.spots<50?`⚡ Осталось ${ev.spots} мест`:`${ev.spots} мест`}
                    </span>
                  </div>
                </div>
              </div>
              {/* Capacity bar */}
              <div style={{marginTop:10,background:'var(--ef2)',borderRadius:3,height:3}}>
                <div style={{width:`${pctFull}%`,height:'100%',background:pctFull>80?red:pctFull>50?orange:green,borderRadius:3}}/>
              </div>
            </div>
          </div>;
        })}
        <div style={{height:80}}/>
      </div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════
//  SCREEN ROUTER
// ═══════════════════════════════════════════════════════════════
// AUTO-GENERATED STUBS for missing screens
function ThemeStub({pop,title,emoji='🚧'}){
  const bg='var(--eb)',l1='var(--el1)',l3='var(--el3)';
  const FD='"SF Pro Display",-apple-system,sans-serif';
  const FT='"SF Pro Text",-apple-system,sans-serif';
  return(
    <div style={{flex:1,background:bg,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'52px 20px 12px',display:'flex',gap:12,alignItems:'center',borderBottom:'0.5px solid var(--es2)',flexShrink:0}}>
        <div onClick={()=>pop&&pop()} style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>◀</div>
        <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD}}>{title}</div>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
        <div style={{fontSize:52}}>{emoji}</div>
        <div style={{fontSize:15,color:l3,fontFamily:FT}}>Скоро</div>
      </div>
    </div>
  );
}
function MarketScreen({push,pop}){return <ThemeStub pop={pop} title="Маркет" emoji="🛍"/>;}
function FavScreen({push,pop}){return <ThemeStub pop={pop} title="Избранное" emoji="❤️"/>;}
function ProfileEditSC({pop}){return <ThemeStub pop={pop} title="Редактировать профиль" emoji="✏️"/>;}
function HotelDetailSC({push,pop,params}){return <ThemeStub pop={pop} title="Номер" emoji="🏡"/>;}
function BookingSC({push,pop,params}){return <ThemeStub pop={pop} title="Бронирование" emoji="📅"/>;}
function CheckoutSC({push,pop,params}){return <ThemeStub pop={pop} title="Оплата" emoji="💳"/>;}
function BookingsScreen({push,pop}){return <ThemeStub pop={pop} title="Мои бронирования" emoji="📋"/>;}
function PassportSC({pop}){return <ThemeStub pop={pop} title="Паспорт мира" emoji="🌐"/>;}
function LoyaltyScreen({push,pop}){return <ThemeStub pop={pop} title="Программа лояльности" emoji="⭐"/>;}
function ProductDetailSC({push,pop,params}){return <ThemeStub pop={pop} title="Товар" emoji="📦"/>;}
function SubsSC({pop}){return <ThemeStub pop={pop} title="Подписки" emoji="💎"/>;}
function CertsSC({push,pop}){return <ThemeStub pop={pop} title="Сертификаты" emoji="🎁"/>;}
function NotifyScreen({pop}){return <ThemeStub pop={pop} title="Уведомления" emoji="🔔"/>;}
function SettingsScreen({pop,dark,setDark}){
  const bg='var(--eb)',l1='var(--el1)',l2='var(--el2)',l3='var(--el3)';
  const FD='"SF Pro Display",-apple-system,sans-serif';
  const FT='"SF Pro Text",-apple-system,sans-serif';
  return(
    <div style={{flex:1,background:bg,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'52px 20px 12px',display:'flex',gap:12,alignItems:'center',borderBottom:'0.5px solid var(--es2)',flexShrink:0}}>
        <div onClick={()=>pop&&pop()} style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>◀</div>
        <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD}}>Настройки</div>
      </div>
      <div style={{padding:'20px 20px',display:'flex',flexDirection:'column',gap:16}}>
        <div style={{fontSize:15,color:l2,fontFamily:FT}}>Тема</div>
        <div style={{display:'flex',gap:12}}>
          <button onClick={()=>setDark&&setDark(false)} style={{flex:1,padding:'12px',borderRadius:12,border:'none',background:!dark?'#30D158':'var(--ef2)',color:!dark?'white':'var(--el1)',cursor:'pointer',fontFamily:FT,fontSize:14,fontWeight:600}}>Светлая</button>
          <button onClick={()=>setDark&&setDark(true)} style={{flex:1,padding:'12px',borderRadius:12,border:'none',background:dark?'#30D158':'var(--ef2)',color:dark?'white':'var(--el1)',cursor:'pointer',fontFamily:FT,fontSize:14,fontWeight:600}}>Тёмная</button>
        </div>
      </div>
    </div>
  );
}
function ParkScreen({push,pop}){return <ThemeStub pop={pop} title="Карта парка" emoji="🗺"/>;}
function PhotoSC({push,pop}){return <ThemeStub pop={pop} title="Фотостудия" emoji="📸"/>;}
function BusinessSC({push,pop}){return <ThemeStub pop={pop} title="Бизнес" emoji="🏢"/>;}
function AffiliateSC({push,pop}){return <ThemeStub pop={pop} title="Партнёрам" emoji="🤝"/>;}
function B2BSubsSC({pop}){return <ThemeStub pop={pop} title="B2B" emoji="📊"/>;}
function BusToursScreen({push,pop}){return <ThemeStub pop={pop} title="Автотуры" emoji="🚌"/>;}
function ExhibitionsScreen({push,pop}){return <ThemeStub pop={pop} title="Выставки" emoji="🎨"/>;}
function ZooScreen({push,pop}){return <ThemeStub pop={pop} title="Зоопарк" emoji="🦁"/>;}

function ScreenRouter({screen,params,push,pop,tab,setTab,dark,setDark}){
  const screens={
    home:    ()=><HomeScreen    push={push} setMainTab={setTab}/>,
    park:    ()=><ParkScreen    push={push} pop={pop}/>,
    search:  ()=><SearchScreen  push={push} pop={pop}/>,
    market:  ()=><MarketScreen  push={push} pop={pop}/>,
    fav:     ()=><FavScreen     push={push} pop={pop}/>,
    profile: ()=><ProfileScreen push={push} pop={pop}/>,
    profileedit:()=><ProfileEditSC pop={pop}/>,
    hotels:  ()=><HotelsScreen  push={push} pop={pop}/>,
    hoteldetail:()=><HotelDetailSC push={push} pop={pop} params={params}/>,
    booking: ()=><BookingSC     push={push} pop={pop} params={params}/>,
    checkout:()=><CheckoutSC    push={push} pop={pop} params={params}/>,
    bookings:()=><BookingsScreen push={push} pop={pop}/>,
    events:  ()=><EventsSC      push={push} pop={pop}/>,
    food:    ()=><FoodSC        push={push} pop={pop}/>,
    spa:     ()=><SpaSC         push={push} pop={pop}/>,
    masterclasses:()=><McSC     push={push} pop={pop}/>,
    glamping:()=><GlampingSC    push={push} pop={pop}/>,
    rental:  ()=><RentalSC      push={push} pop={pop}/>,
    kids:    ()=><KidsSC        push={push} pop={pop}/>,
    excursions:()=><ExcSC       push={push} pop={pop}/>,
    photo:   ()=><PhotoSC       push={push} pop={pop}/>,
    audiogide:()=><AudioSC      pop={pop}/>,
    product: ()=><ProductDetailSC push={push} pop={pop} params={params}/>,
    loyalty: ()=><LoyaltyScreen push={push} pop={pop}/>,
    passport:()=><PassportSC    pop={pop}/>,
    subs:    ()=><SubsSC        pop={pop}/>,
    certs:   ()=><CertsSC       push={push} pop={pop}/>,
    notify:  ()=><NotifyScreen  pop={pop}/>,
    settings:()=><SettingsScreen pop={pop} dark={dark} setDark={setDark}/>,
    tickets: ()=><TicketsScreen push={push} pop={pop}/>,
    quests:  ()=><QuestsScreen  push={push} pop={pop}/>,
    zoo:     ()=><ZooScreen     push={push} pop={pop}/>,
    museums: ()=><MuseumsScreen push={push} pop={pop}/>,
    banya:   ()=><BanyaScreen   push={push} pop={pop}/>,
    exhibitions:()=><ExhibitionsScreen pop={pop}/>,
    attractions:()=><AttractionsScreen push={push} pop={pop}/>,
    weddings:()=><WeddingsScreen push={push} pop={pop}/>,
    bustours:()=><BusToursScreen push={push} pop={pop}/>,
    business:()=><BusinessSC    push={push} pop={pop}/>,
    partnerdash:()=><PartnerDashSC pop={pop}/>,
    affiliate:()=><AffiliateSC  pop={pop}/>,
    b2bsubs: ()=><B2BSubsSC     pop={pop}/>,
  };
  const render=screens[screen];
  return render?render():<HomeScreen push={push} setMainTab={setTab}/>;
}

const TAB_MAP={0:'home',1:'park',2:'market',3:'fav',4:'profile'};

// ═══════════════════════════════════════════════════════════════
//  ROOT APP — iOS 26 Floating TabBar architecture
// ═══════════════════════════════════════════════════════════════
function App(){
  const prefersDark=typeof window!=='undefined'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const[dark,setDark]=useState(prefersDark!==false);
  const[tab,setTabRaw]=useState(0);
  const[scrollingDown,setScrollingDown]=useState(false);
  const[stacks,setStacks]=useState({
    0:[{screen:'home',params:{}}],
    1:[{screen:'park',params:{}}],
    2:[{screen:'market',params:{}}],
    3:[{screen:'fav',params:{}}],
    4:[{screen:'profile',params:{}}],
  });

  const setTab=(i)=>{
    setTabRaw(i);
    setScrollingDown(false);
  };

  const push=(screen,params={})=>{
    setStacks(s=>({...s,[tab]:[...s[tab],{screen,params}]}));
    setScrollingDown(false);
  };
  const pop=()=>{
    setStacks(s=>{
      const cur=s[tab];
      if(cur.length<=1) return s;
      return {...s,[tab]:cur.slice(0,-1)};
    });
  };

  const curStack=stacks[tab];
  const cur=curStack[curStack.length-1];

  useEffect(()=>{
    const mq=window.matchMedia?.('(prefers-color-scheme: dark)');
    if(!mq) return;
    const handler=e=>setDark(e.matches);
    mq.addEventListener?.('change',handler);
    return()=>mq.removeEventListener?.('change',handler);
  },[]);

  // Tab bar items
  const tabs=[
    {label:'Главная',Icon:Ic.house},
    {label:'Карта',Icon:Ic.map},
    {label:'Магазин',Icon:Ic.bag},
    {label:'Избранное',Icon:({s,c})=><Ic.heart s={s} c={c} fill={false}/>},
    {label:'Профиль',Icon:Ic.person},
  ];

  const isDesktop=typeof window!=='undefined'&&window.innerWidth>600;

  return(
    <div className="eth-root" style={{
      width:'100%',maxWidth:390,height:'100%',maxHeight:844,
      margin:'0 auto',
      display:'flex',flexDirection:'column',
      background:bg,
      overflow:'hidden',
      position:'relative',
      borderRadius:isDesktop?46:0,
      boxShadow:isDesktop?'0 30px 80px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.06)':'none',
    }}>
      <ThemeStyle dark={dark}/>

      {/* Screens fill full height — TabBar floats OVER content */}
      <div
        style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}
        key={`${tab}-${curStack.length}`}
        className="eth-fadein"
      >
        <ScreenRouter
          screen={cur.screen}
          params={cur.params}
          push={push}
          pop={pop}
          tab={tab}
          setTab={setTab}
          dark={dark}
          setDark={setDark}
        />
      </div>

      {/* ── FLOATING TABBAR — iOS 26 pill ─────────────────────── */}
      <FloatingTabBar
        tabs={tabs}
        active={tab}
        setActive={setTab}
        scrollingDown={scrollingDown}
      />
    </div>
  );
}

export default App;
