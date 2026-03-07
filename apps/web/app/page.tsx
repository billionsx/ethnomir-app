// @ts-nocheck
import{useState,useEffect,useRef,useCallback}from"react";

//  ETHNOMIR v7 — iOS 26 / Liquid Glass Design System
//  Reference: AppStore, Wallet, Weather, Voice Memos (iOS 26)
//  Key fixes vs v6:
//  · TabBar = floating pill, shrinks on scroll (NOT edge-to-edge)
//  · Glass = real specular rim, lensing refraction, NOT just blur
//  · NavBar = truly transparent, materialises on scroll
//  · Cards = no solid boxes — content on bg, glass only for chrome
//  · Buttons = glass pill with specular highlight
//  · Animations = spring physics, morph, not just scale

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

const ThemeStyle=({dark})=>{
  const t=dark?DARK:LIGHT;
  const vars=Object.entries(t).filter(([k])=>k!=='ecScheme').map(([k,v])=>`--${k}:${v}`).join(';');
  return <style>{`
    html,body,#root{height:100%;overflow:hidden;margin:0;padding:0}
    .eth-root{${vars};color-scheme:${t.ecScheme}}
    .eth-root *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;min-height:0}
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

    /* ── iOS 26 Advanced Animations ── */
    @keyframes eth-slide-right{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}
    @keyframes eth-slide-left{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
    @keyframes eth-pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
    @keyframes eth-bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}70%{transform:translateY(-3px)}}
    @keyframes eth-liquid{0%{border-radius:60% 40% 50% 50%/60% 50% 50% 40%}50%{border-radius:40% 60% 40% 60%/40% 60% 60% 40%}100%{border-radius:60% 40% 50% 50%/60% 50% 50% 40%}}
    @keyframes eth-glow{0%,100%{box-shadow:0 0 20px rgba(48,209,88,.3)}50%{box-shadow:0 0 40px rgba(48,209,88,.6)}}
    @keyframes eth-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes eth-ripple{0%{transform:scale(0);opacity:.6}100%{transform:scale(4);opacity:0}}
    @keyframes eth-ticker{0%{transform:translateY(100%);opacity:0}15%{transform:translateY(0);opacity:1}85%{transform:translateY(0);opacity:1}100%{transform:translateY(-100%);opacity:0}}
    @keyframes eth-hero-in{0%{opacity:0;transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
    @keyframes eth-stagger-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes eth-depth{0%{transform:perspective(600px) rotateX(8deg) scale(.95);opacity:0}100%{transform:perspective(600px) rotateX(0deg) scale(1);opacity:1}}
    @keyframes eth-ink{0%{clip-path:circle(0% at 50% 50%)}100%{clip-path:circle(150% at 50% 50%)}}

    /* ── Stagger utilities ── */
    .eth-s1{animation-delay:.05s}.eth-s2{animation-delay:.1s}.eth-s3{animation-delay:.15s}
    .eth-s4{animation-delay:.2s}.eth-s5{animation-delay:.25s}.eth-s6{animation-delay:.3s}
    .eth-s7{animation-delay:.35s}.eth-s8{animation-delay:.4s}

    /* ── New animation classes ── */
    .eth-slide-r{animation:eth-slide-right .36s cubic-bezier(.34,1.2,.64,1) both}
    .eth-slide-l{animation:eth-slide-left .36s cubic-bezier(.34,1.2,.64,1) both}
    .eth-pop{animation:eth-pop .4s cubic-bezier(.34,1.56,.64,1) both}
    .eth-bounce{animation:eth-bounce .6s cubic-bezier(.34,1.3,.64,1) both}
    .eth-float{animation:eth-float 3s ease-in-out infinite}
    .eth-hero-in{animation:eth-hero-in .5s cubic-bezier(.25,.46,.45,.94) both}
    .eth-stagger{animation:eth-stagger-up .4s cubic-bezier(.34,1.2,.64,1) both}
    .eth-depth{animation:eth-depth .45s cubic-bezier(.25,.46,.45,.94) both}

    /* ── Card elevation hover ── */
    .eth-card{transition:transform .2s cubic-bezier(.34,1.3,.64,1),box-shadow .2s ease}
    .eth-card:hover{transform:translateY(-3px) scale(1.005);box-shadow:0 12px 40px rgba(0,0,0,.2)}

    /* ── Active scale with spring ── */
    .eth-tap{cursor:pointer;transition:transform .18s cubic-bezier(.34,1.5,.64,1),opacity .12s}
    .eth-tap:active{transform:scale(.92);opacity:.7;transition:transform .06s,opacity .06s}

    /* ── Glass premium ── */
    .eth-glass-premium{
      backdrop-filter:blur(60px) saturate(220%) brightness(1.08);
      -webkit-backdrop-filter:blur(60px) saturate(220%) brightness(1.08);
      background:${dark?'rgba(30,30,35,.72)':'rgba(255,255,255,.72)'};
      border:0.5px solid ${dark?'rgba(255,255,255,.12)':'rgba(0,0,0,.08)'};
      box-shadow:
        inset 0 1.5px 0 ${dark?'rgba(255,255,255,.15)':'rgba(255,255,255,.9)'},
        inset 0 -0.5px 0 ${dark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'},
        0 8px 40px rgba(0,0,0,.16),
        0 1px 4px rgba(0,0,0,.08),
        0 0 0 0.5px ${dark?'rgba(255,255,255,.06)':'rgba(0,0,0,.04)'};
    }

    /* ── Specular highlight on cards ── */
    .eth-specular{position:relative;overflow:hidden}
    .eth-specular::before{
      content:'';position:absolute;top:0;left:-50%;width:50%;height:100%;
      background:linear-gradient(90deg,transparent,${dark?'rgba(255,255,255,.04)':'rgba(255,255,255,.5)'},transparent);
      transform:skewX(-15deg);pointer-events:none;
    }

    /* ── Ripple container ── */
    .eth-ripple-container{position:relative;overflow:hidden}
    .eth-ripple-container .ripple{
      position:absolute;border-radius:50%;
      background:rgba(255,255,255,.25);
      animation:eth-ripple .6s ease-out forwards;
      pointer-events:none;
    }

    /* ── Gradient text ── */
    .eth-gradient-text{
      background:linear-gradient(135deg,${dark?'#fff':'#000'} 0%,${dark?'rgba(255,255,255,.6)':'rgba(0,0,0,.5)'} 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }

    /* ── Live indicator ── */
    .eth-live{display:inline-flex;align-items:center;gap:5px}
    .eth-live::before{
      content:'';width:6px;height:6px;border-radius:50%;background:#ff3b30;flex-shrink:0;
      animation:eth-pulse .8s ease-in-out infinite;
    }
  `}</style>;
};

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
  diamond:({s=22,c=teal})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M6 3l4 6m4 0l4-6"/></svg>,
  book:({s=22,c=purple})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  spa:({s=22,c=pink})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M12 22c4-4 8-8 8-13a8 8 0 00-16 0c0 5 4 9 8 13z"/><path d="M12 13c0-3 2-6 4-8"/><path d="M12 13c0-3-2-6-4-8"/></svg>,
};

//  PRIMITIVES — iOS 26 accurate

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

// iOS 26: cards are less present. Content on bg with thin separator lines.
// Use GlassCard only for floating elements (like Wallet cards, featured items)
const GlassCard=({children,style:st={},onPress})=><div onClick={onPress} className={`eth-glass${onPress?' eth-press':''}`} style={{borderRadius:22,...st}}>{children}</div>;

// Legacy Card — simple bg surface with separator
const Card=({children,style:st={},onPress})=><div onClick={onPress} className={onPress?'eth-press':''} style={{background:bg2,borderRadius:14,overflow:'hidden',...st}}>{children}</div>;

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

const Glass=({children,style:st={},animate=false})=><div className={`eth-glass${animate?' eth-glass-appear':''}`} style={{borderRadius:18,...st}}>{children}</div>;

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

function FloatingTabBar({tabs,active,setActive,scrollingDown,dark}){
  const[pressed,setPressed]=useState(null);
  return <div className="eth-tabbar" style={{
    transform:scrollingDown?'translateY(100%)':'translateY(0)',
    transition:'transform .35s cubic-bezier(.4,0,.2,1)',
  }}>
    <div className="eth-tabbar-pill eth-glass-premium" style={{gap:0}}>
      {tabs.map((t,i)=>{
        const isActive=active===i;
        const Ico=t.Icon;
        return <div key={i}
          onPointerDown={()=>setPressed(i)}
          onPointerUp={()=>{setPressed(null);setActive(i);}}
          onPointerCancel={()=>setPressed(null)}
          style={{
            flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            padding:'10px 0 8px',cursor:'pointer',position:'relative',
            transform:pressed===i?'scale(.88)':'scale(1)',
            transition:'transform .12s cubic-bezier(.34,1.5,.64,1)',
          }}>
          {isActive&&<div style={{
            position:'absolute',inset:'5px 6px',borderRadius:14,
            background:dark?'rgba(255,255,255,.12)':'rgba(0,0,0,.07)',
          }}/>}
          <div style={{position:'relative',zIndex:1}}>
            <Ico s={isActive?22:20} c={isActive?(dark?'#fff':'#000'):'var(--el3)'}/>
            {t.badge>0&&<div style={{position:'absolute',top:-4,right:-6,minWidth:16,height:16,borderRadius:8,background:'#FF3B30',border:'1.5px solid '+(dark?'#1c1c1e':'#fff'),display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
              <span style={{fontSize:9,fontWeight:700,color:'#fff',fontFamily:FT}}>{t.badge>99?'99+':t.badge}</span>
            </div>}
          </div>
          <span style={{
            fontSize:isActive?10.5:10,fontFamily:FT,fontWeight:isActive?600:400,
            color:isActive?(dark?'#fff':'#000'):'var(--el3)',
            marginTop:3,letterSpacing:'-.1px',position:'relative',zIndex:1,
          }}>{t.label}</span>
        </div>;
      })}
    </div>
  </div>;
}

function HomeScreen({push,setMainTab,visits={},orders=[],cartCount=0}){
  const hr=new Date().getHours();
  const greet=hr<5?'Доброй ночи 🌙':hr<12?'Доброе утро ☀️':hr<17?'Добрый день 🌤':hr<21?'Добрый вечер 🌅':'Добрый вечер 🌙';
  const scrollRef=useRef(null);
  const{scrolled}=useScrollState(scrollRef);
  const[featIdx,setFeatIdx]=useState(0);
  const[mounted,setMounted]=useState(false);
  const[weatherExpanded,setWeatherExpanded]=useState(false);
  useEffect(()=>{setMounted(true);},[]);
  useEffect(()=>{
    const t=setInterval(()=>setFeatIdx(i=>(i+1)%FEATURED.length),4200);
    return ()=>clearInterval(t);
  },[]);

  const visitedCountries=COUNTRIES.filter(c=>(visits[c.id]||{}).visited);
  const totalStamps=Object.values(visits).reduce((s,v)=>s+v.stamps,0);
  const level=totalStamps>=500?4:totalStamps>=100?3:totalStamps>=5?2:totalStamps>=1?1:0;
  const lvl=CITIZENSHIP_LEVELS[level];
  const nextLvl=CITIZENSHIP_LEVELS[Math.min(level+1,4)];
  const nextThresh=[0,1,5,100,500][Math.min(level+1,4)];
  const progress=level>=4?1:Math.min(1,totalStamps/nextThresh);
  const nextCountry=COUNTRIES.find(c=>!(visits[c.id]||{}).visited);

  const FEATURED=[
    {em:'🎭',title:'Фестиваль Индии',sub:'Сегодня · 18:00 · Главная арена',grad:'linear-gradient(135deg,#7B1D1D,#C0392B,#E91E63)',badge:'Сегодня',s:'events'},
    {em:'🏨',title:'Отель Шри-Ланки',sub:'Номера от 8 500₽/ночь',grad:'linear-gradient(135deg,#0a3d1e,#1B4332,#2ECC71)',badge:'Горящее',s:'hotels'},
    {em:'🥋',title:'Боевые искусства',sub:'Мастер-класс · 18+',grad:'linear-gradient(135deg,#7b0000,#8B008B,#4A0080)',badge:'Новое',s:'masterclasses'},
    {em:'⛺',title:'Глэмпинг-этно',sub:'Эко-кемпинг в лесу',grad:'linear-gradient(135deg,#1a3a5c,#1B4332,#0E4D92)',badge:'Популярно',s:'glamping'},
    {em:'🎪',title:'Цирк народов',sub:'Шоу · Каждые выходные',grad:'linear-gradient(135deg,#4a0030,#8B0045,#C0392B)',badge:'Хит',s:'events'},
  ];

  const OPEN_NOW=[
    {em:'🍜',n:'Пад Тай',sub:'15 мин',color:'#FF6B35',s:'food'},
    {em:'💆',n:'СПА Восток',sub:'Есть места',color:'#9B59B6',s:'spa'},
    {em:'🎭',n:'Шоу Индии',sub:'18:00',color:'#E91E63',s:'events'},
    {em:'🐺',n:'Хаски-парк',sub:'Открыт',color:'#5D4037',s:'zoo'},
    {em:'🧖',n:'Баня Русь',sub:'3 кабины',color:'#C0392B',s:'banya'},
    {em:'🏹',n:'Стрельба',sub:'Тир открыт',color:'#E67E22',s:'quests'},
  ];

  const RECS=[
    {em:'🎓',n:'Гончарный круг',sub:'Для вас · Основано на предпочтениях',color:blue,s:'masterclasses'},
    {em:'🌮',n:'Фиеста · Мексика',sub:'Популярно сейчас',color:'#006847',s:'food'},
    {em:'🛁',n:'Джакузи с видом',sub:'Скидка 15% сегодня',color:purple,s:'banya'},
  ];

  const activeOrder=orders.find(o=>o.status==='tracking');
  const feat=FEATURED[featIdx];

  const SERVICES=[
    {e:'🌍',l:'Страны',s:'countries'},{e:'🎫',l:'Билеты',s:'tickets'},
    {e:'🏨',l:'Отели',s:'hotels'},{e:'🍜',l:'Рестораны',s:'food'},
    {e:'🛁',l:'Баня',s:'banya'},{e:'💆',l:'СПА',s:'spa'},{e:'🎉',l:'События',s:'events'},
    {e:'🧩',l:'Квесты',s:'quests'},{e:'🎓',l:'Мастер-классы',s:'masterclasses'},
    {e:'🚌',l:'Экскурсии',s:'excursions'},{e:'🐾',l:'Зоопарк',s:'zoo'},
    {e:'🏛',l:'Музеи',s:'museums'},{e:'🗿',l:'Памятники',s:'landmarks'},
    {e:'🖼',l:'Выставки',s:'exhibitions'},{e:'⛺',l:'Глэмпинг',s:'glamping'},
    {e:'🚗',l:'Транспорт',s:'transfer'},{e:'🏘',l:'Недвижимость',s:'realestate'},
    {e:'🤝',l:'Франшиза',s:'franchise'},{e:'🎡',l:'Аттракционы',s:'attractions'},
    {e:'💍',l:'Свадьбы',s:'weddings'},{e:'🚐',l:'Автотуры',s:'bustours'},
    {e:'📸',l:'Фото',s:'photo'},{e:'🎧',l:'Аудиогид',s:'audiogide'},
    {e:'🛍',l:'Магазины',s:'shop'},{e:'🏛',l:'Улица Мира',s:'ulicamira'},
    {e:'🌏',l:'Этнодворы',s:'etnodvory'},{e:'🎭',l:'Анимация',s:'animation'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg,overflow:'hidden'}}>
    {/* ── Sticky NavBar ── */}
    <div style={{
      position:'sticky',top:0,zIndex:100,
      padding:'56px 20px 14px',
      background:scrolled?'var(--eglass)':'transparent',
      backdropFilter:scrolled?'blur(24px) saturate(200%)':'none',
      WebkitBackdropFilter:scrolled?'blur(24px) saturate(200%)':'none',
      borderBottom:scrolled?'0.5px solid var(--es2)':'none',
      transition:'all .4s cubic-bezier(.25,.46,.45,.94)',
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:12,color:l3,fontFamily:FT,letterSpacing:'.2px'}}>{greet}</div>
          <div style={{fontSize:28,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.6px',lineHeight:1.1,marginTop:1}}>Этномир</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div onClick={()=>push('search')} className="eth-tap" style={{width:38,height:38,borderRadius:19,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Ic.search s={16} c={l2}/>
          </div>
          <div onClick={()=>push('notify')} className="eth-tap" style={{width:38,height:38,borderRadius:19,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
            <span style={{fontSize:16}}>🔔</span>
            <div style={{position:'absolute',top:8,right:8,width:8,height:8,borderRadius:4,background:'#ff3b30',border:'1.5px solid var(--eb)'}}/>
          </div>
        </div>
      </div>
    </div>

    <div ref={scrollRef} style={{flex:1,overflowY:'auto',paddingBottom:120}}>

      {/* ── Active Order Banner ── */}
      {activeOrder&&<div onClick={()=>push('ordertracking',{delivery:activeOrder.delivery,total:activeOrder.total})} className="eth-tap" style={{margin:'0 16px 14px',background:`linear-gradient(135deg,${blue}18,${green}10)`,borderRadius:18,padding:'14px 16px',border:`1px solid ${blue}30`,display:'flex',gap:12,alignItems:'center',cursor:'pointer'}}>
        <div style={{width:44,height:44,borderRadius:14,background:`${blue}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,animation:'eth-pulse 2s ease infinite'}}>🛵</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT}}>Заказ #{activeOrder.id} в пути</div>
          <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>Нажмите, чтобы отследить</div>
        </div>
        <Ic.chevR s={7} c={blue}/>
      </div>}

      {/* ── Weather widget ── */}
      <div onClick={()=>setWeatherExpanded(!weatherExpanded)} className="eth-tap" style={{margin:'0 16px 14px',background:'var(--ef2)',borderRadius:18,padding:'12px 16px',border:'0.5px solid var(--es2)',transition:'all .3s ease',cursor:'pointer'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:28}}>🌤</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:6,alignItems:'baseline'}}>
              <span style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.5px'}}>+8°</span>
              <span style={{fontSize:12,color:l3,fontFamily:FT}}>Этномир · Сейчас</span>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:1}}>Переменная облачность · Ветер 5 м/с</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:10,color:l4,fontFamily:FT}}>Сегодня</div>
            <div style={{fontSize:11,color:l2,fontFamily:FT}}>+6° / +11°</div>
          </div>
        </div>
        {weatherExpanded&&<div style={{marginTop:12,paddingTop:12,borderTop:'0.5px solid var(--es2)',display:'flex',justifyContent:'space-between'}}>
          {[['Ср','🌤','9°'],['Чт','🌧','6°'],['Пт','⛅','10°'],['Сб','☀️','13°'],['Вс','🌤','12°']].map(([d,em,t],i)=>(
            <div key={i} style={{textAlign:'center',flex:1}}>
              <div style={{fontSize:10,color:l4,fontFamily:FT,marginBottom:3}}>{d}</div>
              <div style={{fontSize:16}}>{em}</div>
              <div style={{fontSize:12,fontWeight:600,color:l1,fontFamily:FT,marginTop:3}}>{t}</div>
            </div>
          ))}
        </div>}
      </div>

      {/* ── Featured carousel ── */}
      <div style={{padding:'0 16px 14px'}}>
        <div onClick={()=>push(feat.s)} className="eth-tap" style={{borderRadius:24,overflow:'hidden',position:'relative',height:178,background:feat.grad,cursor:'pointer',transition:'all .4s cubic-bezier(.34,1.3,.64,1)'}}>
          <div style={{position:'absolute',right:-16,top:'50%',transform:'translateY(-50%)',fontSize:92,opacity:.2,filter:'drop-shadow(0 4px 16px rgba(0,0,0,.4))'}}>{feat.em}</div>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(0,0,0,.35),transparent 60%)'}}/>
          <div style={{position:'absolute',top:14,left:16}}>
            <div style={{display:'inline-flex',background:'rgba(255,255,255,.22)',backdropFilter:'blur(8px)',borderRadius:8,padding:'3px 10px',border:'0.5px solid rgba(255,255,255,.3)'}}>
              <span style={{fontSize:10,color:'#fff',fontWeight:700,fontFamily:FT}}>{feat.badge}</span>
            </div>
          </div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'16px'}}>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>{feat.title}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.75)',fontFamily:FT}}>{feat.sub}</div>
          </div>
          <div style={{position:'absolute',bottom:14,right:16,display:'flex',gap:5}}>
            {FEATURED.map((_,i)=><div key={i} style={{width:i===featIdx?18:6,height:5,borderRadius:3,background:i===featIdx?'#fff':'rgba(255,255,255,.4)',transition:'width .35s cubic-bezier(.34,1.3,.64,1)'}}/>)}
          </div>
        </div>
      </div>

      {/* ── Open Now ── */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px'}}>Открыто сейчас</div>
            <div style={{display:'flex',alignItems:'center',gap:4,marginTop:1}}>
              <div style={{width:6,height:6,borderRadius:3,background:green}}/>
              <span style={{fontSize:11,color:green,fontFamily:FT}}>{OPEN_NOW.length} мест · Живой статус</span>
            </div>
          </div>
          <div onClick={()=>push('park')} className="eth-tap" style={{padding:'5px 10px',background:`${blue}12`,borderRadius:8,cursor:'pointer'}}>
            <span style={{fontSize:11,color:blue,fontFamily:FT,fontWeight:600}}>Карта</span>
          </div>
        </div>
        <div style={{display:'flex',gap:10,overflowX:'auto',scrollbarWidth:'none',paddingBottom:2}}>
          {OPEN_NOW.map((item,i)=>(
            <div key={i} onClick={()=>push(item.s)} className="eth-tap" style={{flexShrink:0,width:88,cursor:'pointer'}}>
              <div style={{width:88,height:72,borderRadius:16,background:`${item.color}15`,border:`0.5px solid ${item.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,marginBottom:6,position:'relative'}}>
                {item.em}
                <div style={{position:'absolute',bottom:5,right:5,width:8,height:8,borderRadius:4,background:green,border:'1.5px solid var(--ef2)'}}/>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:l1,fontFamily:FT,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.n}</div>
              <div style={{fontSize:10,color:l3,fontFamily:FT,textAlign:'center'}}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── For You (AI picks) ── */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px'}}>Для вас ✨</div>
          <span style={{fontSize:10,color:l4,fontFamily:FT}}>Персонально</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {RECS.map((r,i)=>(
            <div key={i} onClick={()=>push(r.s)} className="eth-tap" style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',cursor:'pointer',alignItems:'center'}}>
              <div style={{width:48,height:48,borderRadius:14,background:`${r.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{r.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT}}>{r.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>{r.sub}</div>
              </div>
              <div style={{padding:'5px 10px',borderRadius:8,background:`${r.color}12`,flexShrink:0}}>
                <span style={{fontSize:11,fontWeight:600,color:r.color,fontFamily:FT}}>Открыть</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Citizen Progress ── */}
      <div style={{padding:'0 16px 16px'}}>
        <div onClick={()=>push('citizenship')} className="eth-tap" style={{borderRadius:20,background:`linear-gradient(160deg,${G}22,${G}08)`,border:`0.5px solid ${G}40`,padding:'16px 18px',cursor:'pointer',display:'flex',gap:14,alignItems:'center'}}>
          <div style={{width:52,height:52,borderRadius:16,background:`${G}20`,border:`1px solid ${G}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{lvl.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:l4,fontFamily:FT,marginBottom:2}}>{lvl.title}</div>
            <div style={{height:5,background:'rgba(255,255,255,.1)',borderRadius:3,overflow:'hidden',marginBottom:4}}>
              <div style={{height:'100%',width:`${Math.round(progress*100)}%`,background:`linear-gradient(90deg,${Gl},#7DEFA1)`,borderRadius:3,transition:'width .6s cubic-bezier(.34,1.3,.64,1)'}}/>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT}}>{visitedCountries.length} стран · {totalStamps} марок{level<4?` · До «${nextLvl.title}» ещё ${nextThresh-totalStamps}`:' · Макс. уровень'}</div>
          </div>
          <Ic.chevR s={7} c={l3}/>
        </div>
      </div>

      {/* ── All Services ── */}
      <div style={{padding:'0 16px 16px'}}>
        <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px',marginBottom:12}}>Все сервисы</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
          {SERVICES.map((s,i)=><div key={i} onClick={()=>push(s.s)} className="eth-tap" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer'}}>
            <div style={{width:52,height:52,borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
              <span style={{fontSize:22}}>{s.e}</span>
            </div>
            <span style={{fontSize:9.5,color:l2,fontFamily:FT,fontWeight:500,textAlign:'center',lineHeight:1.2}}>{s.l}</span>
          </div>)}
        </div>
      </div>

    </div>
  </div>;
}


function ProfileScreen({push,visits={}}){
  const[notif,setNotif]=useState(true);
  const[geo,setGeo]=useState(true);
  const visitedCountries=COUNTRIES.filter(c=>(visits[c.id]||{}).visited);
  const totalStamps=Object.values(visits).reduce((s,v)=>s+v.stamps,0);
  const level=totalStamps>=500?4:totalStamps>=100?3:totalStamps>=5?2:totalStamps>=1?1:0;
  const lvl=CITIZENSHIP_LEVELS[level];

  const stats=[
    [String(visitedCountries.length),'Стран'],
    ['3','Брони'],
    [String(totalStamps),'Штампов'],
    ['1 247','Баллов'],
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg,overflowY:'auto',paddingBottom:100}}>
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
          {icon:'📦',t:'Мои заказы',s:'orderhistory',c:orange},
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
        <Row icon={<Ic.share s={18} c={blue}/>} title="Поделиться" onPress={()=>{}}/>
        <Row icon={<span style={{fontSize:16}}>💬</span>} title="Чат поддержки" onPress={()=>push('chat')} last/>
      </Section>

      <Btn label="Выйти из аккаунта" onPress={()=>{}} variant="tint" color={red} style={{marginTop:4}}/>
    </div>
  </div>;
}

function ParkScreen({push,pop}){
  const[sel,setSel]=useState(null);
  const[filter,setFilter]=useState('all');
  const zones=[
    {id:'ru',em:'🏯',n:'Русская деревня',sub:'Избы · Кузница · Ярмарка',s:'excursions',c:'#E53935',x:15,y:25,cat:'culture',desc:'Главный этнический квартал. Живые мастера, русская печь, колодец'},
    {id:'ea',em:'🕌',n:'Восточный квартал',sub:'Базар · Хаммам · Специи',s:'banya',c:'#2980B9',x:60,y:18,cat:'relax',desc:'Хаммам, марокканские специи, живая музыка'},
    {id:'jp',em:'🎎',n:'Японский квартал',sub:'Сад камней · Пагода · Рёкан',s:'hotels',c:'#BC002D',x:75,y:40,cat:'culture',desc:'Японский сад с пагодой, чайный домик, сакура в апреле'},
    {id:'ci',em:'🎪',n:'Цирк и шоу',sub:'Акробаты · Фокусники',s:'animation',c:'#9B59B6',x:85,y:25,cat:'fun',desc:'Ежедневные шоу в 13:00 и 17:00'},
    {id:'sg',em:'🌿',n:'Этносад',sub:'Растения 40 стран',s:'excursions',c:'#27AE60',x:22,y:62,cat:'nature',desc:'1200 видов растений из 40 стран'},
    {id:'zo',em:'🐾',n:'Зоопарк',sub:'Хаски · Олени · Птицы',s:'zoo',c:'#E67E22',x:45,y:68,cat:'nature',desc:'Деревня хаски, олени, плавучий домик с утками'},
    {id:'lk',em:'🌊',n:'Лебединое озеро',sub:'Лодки · Рыбалка · Пикник',s:'rental',c:'#1ABC9C',x:50,y:50,cat:'nature',desc:'Озеро 3 га. Прокат лодок, рыбалка, пикник'},
    {id:'in',em:'🐘',n:'Индийский дворец',sub:'Могольская архитектура · Йога',s:'masterclasses',c:'#F39C12',x:30,y:42,cat:'culture',desc:'Белокаменный дворец, мастер-классы по йоге, хна'},
    {id:'ch',em:'🌸',n:'Китайский квартал',sub:'Пагода · Чай · Каллиграфия',s:'masterclasses',c:'#C0392B',x:65,y:65,cat:'culture',desc:'7-ярусная пагода, чайная церемония'},
    {id:'gm',em:'🏕',n:'Глэмпинг',sub:'Шатры · Юрты · Купол',s:'glamping',c:'#2ECC71',x:10,y:80,cat:'stay',desc:'Premium-шатры, юрта, купол под звёздами'},
    {id:'fd',em:'🍜',n:'Фуд-корт',sub:'8 ресторанов · 20 кухонь',s:'food',c:'#E91E63',x:50,y:32,cat:'food',desc:'Тайская лапша, грузинские хинкали и всё что между'},
    {id:'sp',em:'💆',n:'СПА и баня',sub:'4 вида бань · Массаж',s:'spa',c:'#3498DB',x:20,y:45,cat:'relax',desc:'Русская баня, финская сауна, хаммам, японская офуро'},
  ];
  const filters=[['all','🗺 Все'],['culture','🏛 Культура'],['nature','🌿 Природа'],['fun','🎪 Развлечения'],['relax','💆 Релакс'],['stay','🏕 Ночёвка'],['food','🍜 Еда']];
  const shown=filter==='all'?zones:zones.filter(z=>z.cat===filter);
  const selZone=zones.find(z=>z.id===sel);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Карта парка</div>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1}}>400 га · 12 зон · Этномир</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,background:`${green}15`,border:`0.5px solid ${green}30`,borderRadius:12,padding:'6px 12px'}}>
        <div style={{width:6,height:6,borderRadius:3,background:green,animation:'eth-pulse 2s ease infinite'}}/>
        <span style={{fontSize:11,color:green,fontFamily:FT,fontWeight:600}}>GPS</span>
      </div>
    </div>
    <div style={{padding:'0 20px 10px',display:'flex',gap:7,overflowX:'auto',scrollbarWidth:'none'}}>
      {filters.map(([id,label])=><div key={id} onClick={()=>{setFilter(id);setSel(null);}} className="eth-tap" style={{flexShrink:0,borderRadius:18,padding:'6px 12px',cursor:'pointer',background:filter===id?l1:'var(--ef2)',border:filter===id?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
        <span style={{fontSize:11,fontFamily:FT,fontWeight:filter===id?600:400,color:filter===id?bg:l2}}>{label}</span>
      </div>)}
    </div>
    <div style={{margin:'0 20px 12px',borderRadius:22,background:'linear-gradient(145deg,#0a1f10,#0d2a15)',border:'0.5px solid var(--es2)',height:220,position:'relative',overflow:'hidden',flexShrink:0}}>
      {[20,40,60,80].map(p=><div key={p} style={{position:'absolute',left:`${p}%`,top:0,bottom:0,borderLeft:'0.5px solid rgba(255,255,255,.04)'}}/>)}
      {[25,50,75].map(p=><div key={p} style={{position:'absolute',top:`${p}%`,left:0,right:0,borderTop:'0.5px solid rgba(255,255,255,.04)'}}/>)}
      {shown.map(z=>{
        const active=sel===z.id;
        return <div key={z.id} onClick={()=>setSel(active?null:z.id)} className="eth-tap" style={{position:'absolute',left:`${z.x}%`,top:`${z.y}%`,transform:'translate(-50%,-50%)',cursor:'pointer',zIndex:active?10:1,transition:'all .25s cubic-bezier(.34,1.3,.64,1)'}}>
          <div style={{width:active?46:34,height:active?46:34,borderRadius:'50%',background:active?z.c:z.c+'80',border:`${active?3:2}px solid ${z.c}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:active?20:14,boxShadow:active?`0 0 0 6px ${z.c}30,0 4px 20px ${z.c}60`:`0 2px 8px ${z.c}40`,transition:'all .25s cubic-bezier(.34,1.3,.64,1)'}}>
            {z.em}
          </div>
          {active&&<div style={{position:'absolute',bottom:'110%',left:'50%',transform:'translateX(-50%)',background:'var(--ef2)',border:`0.5px solid ${z.c}40`,borderRadius:10,padding:'4px 8px',whiteSpace:'nowrap',backdropFilter:'blur(10px)'}}>
            <span style={{fontSize:10,color:l1,fontFamily:FT,fontWeight:600}}>{z.n}</span>
          </div>}
        </div>;
      })}
      <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
        <div style={{width:12,height:12,borderRadius:'50%',background:blue,boxShadow:`0 0 0 4px ${blue}40`,animation:'eth-pulse 2s ease infinite'}}/>
      </div>
      <div style={{position:'absolute',bottom:8,left:10,fontSize:9,color:'rgba(255,255,255,.35)',fontFamily:FT}}>● Вы здесь</div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'0 20px 100px'}}>
      {selZone
        ?<div className="eth-card" style={{borderRadius:22,background:'var(--ef2)',border:`0.5px solid ${selZone.c}30`,overflow:'hidden'}}>
          <div style={{height:4,background:selZone.c}}/>
          <div style={{padding:'16px'}}>
            <div style={{display:'flex',gap:14,marginBottom:10}}>
              <div style={{width:56,height:56,borderRadius:18,background:`${selZone.c}15`,border:`0.5px solid ${selZone.c}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{selZone.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FD,marginBottom:2}}>{selZone.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT}}>{selZone.sub}</div>
              </div>
            </div>
            <div style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.6,marginBottom:12}}>{selZone.desc}</div>
            <div style={{display:'flex',gap:8}}>
              <div onClick={()=>push(selZone.s)} className="eth-tap" style={{flex:1,borderRadius:14,padding:'11px',background:selZone.c,textAlign:'center',cursor:'pointer'}}>
                <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Открыть →</span>
              </div>
              <div onClick={()=>setSel(null)} className="eth-tap" style={{width:44,height:44,borderRadius:14,background:'var(--ef3)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16}}>✕</span>
              </div>
            </div>
          </div>
        </div>
        :<div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{fontSize:11,color:l3,fontFamily:FT,fontWeight:700,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:4}}>Зоны парка ({shown.length})</div>
          {shown.map((z,i)=><div key={z.id} onClick={()=>setSel(z.id)} className="eth-tap eth-card" style={{borderRadius:18,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'12px 14px',cursor:'pointer',display:'flex',gap:12,alignItems:'center',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:z.c}}/>
            <div style={{width:44,height:44,borderRadius:14,background:`${z.c}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,marginLeft:8}}>{z.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:2}}>{z.n}</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT}}>{z.sub}</div>
            </div>
            <Ic.chevR s={7} c={l4}/>
          </div>)}
        </div>
      }
    </div>
  </div>;
}

function SearchScreen({push,pop}){
  const[q,setQ]=useState('');
  const[mounted,setMounted]=useState(false);
  const inpRef=useRef(null);
  useEffect(()=>{setMounted(true);setTimeout(()=>inpRef.current?.focus(),150);},[]);

  const ALL_ITEMS=[
    ...COUNTRIES.map(c=>({type:'country',em:c.flag,title:c.name,sub:c.nameLocal,id:c.id,s:'country',params:{id:c.id},color:c.color})),
    {type:'service',em:'🏨',title:'Отели',sub:'16 вариантов размещения',s:'hotels'},
    {type:'service',em:'🍜',title:'Рестораны',sub:'12 ресторанов мира',s:'food'},
    {type:'service',em:'🛁',title:'Баня и хаммам',sub:'Русская · Финская · Хаммам',s:'banya'},
    {type:'service',em:'💆',title:'СПА',sub:'Массаж · Процедуры',s:'spa'},
    {type:'service',em:'🎓',title:'Мастер-классы',sub:'40+ программ',s:'masterclasses'},
    {type:'service',em:'🚌',title:'Экскурсии',sub:'9 маршрутов',s:'excursions'},
    {type:'service',em:'🧩',title:'Квесты',sub:'Игры и загадки',s:'quests'},
    {type:'service',em:'🐾',title:'Зоопарк',sub:'Хаски · Олени · Кони',s:'zoo'},
    {type:'service',em:'🏛',title:'Музеи',sub:'Этнография · Искусство',s:'museums'},
    {type:'service',em:'🎡',title:'Аттракционы',sub:'Лабиринт · Верёвочный · Динозавры',s:'attractions'},
    {type:'service',em:'🎭',title:'Анимация',sub:'Шоу · Мастер-классы',s:'animation'},
    {type:'service',em:'⛺',title:'Глэмпинг',sub:'Эко-кемпинг в лесу',s:'glamping'},
    {type:'service',em:'🏕',title:'Детский лагерь',sub:'Программы для детей',s:'kidscamp'},
    {type:'service',em:'🎓',title:'Школьникам',sub:'Образовательные программы',s:'school'},
    {type:'service',em:'🏘',title:'Недвижимость',sub:'Апартаменты · Таунхаусы',s:'realestate'},
    {type:'service',em:'🤝',title:'Франшиза',sub:'Открыть Этномир',s:'franchise'},
    {type:'service',em:'🛍',title:'Магазины',sub:'Сувениры · Товары мира',s:'shop'},
    {type:'service',em:'🗿',title:'Памятники',sub:'Гагарин · Пагода · Мечеть',s:'landmarks'},
    {type:'service',em:'🌏',title:'Этнодворы',sub:'9 дворов народов мира',s:'etnodvory'},
    {type:'service',em:'🏛',title:'Улица Мира',sub:'Павильоны 60 стран',s:'ulicamira'},
    {type:'service',em:'📸',title:'Фотопрогулка',sub:'Профессиональный фотограф',s:'photo'},
    {type:'service',em:'🎧',title:'Аудиогид',sub:'Путеводитель по парку',s:'audiogide'},
    {type:'service',em:'💍',title:'Свадьбы',sub:'Этно-банкеты · Церемонии',s:'weddings'},
    {type:'service',em:'🏟',title:'Аренда площадок',sub:'Конференции · Мероприятия',s:'venue'},
    {type:'service',em:'🚐',title:'Автотуры',sub:'Туры из Москвы',s:'bustours'},
  ];

  const filtered=q.length<1?[]:ALL_ITEMS.filter(it=>
    it.title.toLowerCase().includes(q.toLowerCase())||
    it.sub.toLowerCase().includes(q.toLowerCase())
  ).slice(0,12);

  const POPULAR=[
    {em:'🌍',l:'Страны',s:'countries'},{em:'🎫',l:'Билеты',s:'tickets'},
    {em:'🏨',l:'Отели',s:'hotels'},{em:'🎭',l:'События',s:'events'},
    {em:'🐾',l:'Зоопарк',s:'zoo'},{em:'🎓',l:'Мастер-кл.',s:'masterclasses'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    {/* Search bar */}
    <div style={{padding:'56px 20px 12px',position:'sticky',top:0,zIndex:100,background:bg}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{
          flex:1,display:'flex',alignItems:'center',gap:10,
          background:'var(--ef2)',border:'0.5px solid var(--es2)',
          borderRadius:16,padding:'0 14px',height:44,
        }}>
          <Ic.search s={15} c={l3}/>
          <input ref={inpRef} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Поиск по Этномиру..."
            style={{flex:1,fontSize:15,color:l1,fontFamily:FT,background:'transparent'}}/>
          {q&&<div onClick={()=>setQ('')} className="eth-tap" style={{fontSize:16,color:l3,lineHeight:1}}>✕</div>}
        </div>
        {pop&&<div onClick={pop} className="eth-tap" style={{fontSize:14,color:blue,fontFamily:FT,fontWeight:500,whiteSpace:'nowrap'}}>Отмена</div>}
      </div>
    </div>

    <div style={{flex:1,overflowY:'auto',padding:'0 20px 100px'}}>
      {q.length<1?<>
        {/* Popular */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:600,color:l3,marginBottom:12,fontFamily:FT,letterSpacing:'.2px',textTransform:'uppercase',fontSize:11}}>Популярное</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {POPULAR.map((p,i)=><div key={i} onClick={()=>push(p.s)} className="eth-tap" style={{
              display:'flex',alignItems:'center',gap:7,
              background:'var(--ef2)',border:'0.5px solid var(--es2)',
              borderRadius:20,padding:'8px 14px',cursor:'pointer',
            }}>
              <span style={{fontSize:16}}>{p.em}</span>
              <span style={{fontSize:13,color:l1,fontFamily:FT,fontWeight:500}}>{p.l}</span>
            </div>)}
          </div>
        </div>
        {/* Sections */}
        {[
          {title:'Страны',items:COUNTRIES.slice(0,5),render:c=>({em:c.flag,title:c.name,sub:c.nameLocal,action:()=>push('country',{id:c.id})})},
        ].map(sec=><div key={sec.title} style={{marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:600,color:l3,marginBottom:12,fontFamily:FT,letterSpacing:'.2px',textTransform:'uppercase',fontSize:11}}>{sec.title}</div>
          {sec.items.map((it,i)=>{
            const r=sec.render(it);
            return <div key={i} onClick={r.action} className="eth-tap" style={{
              display:'flex',alignItems:'center',gap:14,
              padding:'12px 0',
              borderBottom:i<sec.items.length-1?'0.5px solid var(--es2)':'none',
              cursor:'pointer',
            }}>
              <div style={{width:40,height:40,borderRadius:12,background:'var(--ef2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{r.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT}}>{r.title}</div>
                <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:2}}>{r.sub}</div>
              </div>
              <Ic.chevR s={7} c={l4}/>
            </div>;
          })}
        </div>)}
      </>:filtered.length>0
        ?<div style={{paddingTop:8}}>
          <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:12,letterSpacing:'.2px'}}>Результаты: {filtered.length}</div>
          {filtered.map((it,i)=><div key={i} onClick={()=>push(it.s,it.params||{})} className="eth-tap" style={{
            display:'flex',alignItems:'center',gap:14,
            padding:'12px 0',
            borderBottom:i<filtered.length-1?'0.5px solid var(--es2)':'none',
            cursor:'pointer',
          }}>
            <div style={{width:44,height:44,borderRadius:14,background:'var(--ef2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{it.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT}}>{it.title}</div>
              <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:2}}>{it.sub}</div>
            </div>
            <div style={{fontSize:10,color:l4,fontFamily:FT,textTransform:'uppercase',letterSpacing:'.3px',background:'var(--ef2)',borderRadius:8,padding:'3px 7px'}}>{it.type==='country'?'Страна':'Услуга'}</div>
          </div>)}
        </div>
        :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:12}}>
          <span style={{fontSize:40}}>🔍</span>
          <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT}}>Ничего не найдено</div>
          <div style={{fontSize:13,color:l3,fontFamily:FT,textAlign:'center'}}>Попробуйте другой запрос</div>
        </div>
      }
    </div>
  </div>;
}

function MarketScreen({push,pop,cart=[],cartCount=0,addToCart}){
  const[tab,setTab]=useState('certs');
  const CERTS=[
    {id:'world',em:'🌍',name:'«Гражданин мира»',price:3000,color:'linear-gradient(135deg,#1B4332,#2ECC71)',desc:'Для путешественников · Любые услуги',popular:true,valid:'1 год'},
    {id:'relax',em:'🧘',name:'«День релакса»',price:5000,color:'linear-gradient(135deg,#4A0080,#9B59B6)',desc:'СПА + Баня + Массаж · 1 день',popular:false,valid:'6 мес'},
    {id:'food',em:'🍽',name:'«Гастрономия»',price:2500,color:'linear-gradient(135deg,#7B0000,#E53935)',desc:'Рестораны · Мастер-классы кухни',popular:false,valid:'1 год'},
    {id:'family',em:'👨‍👩‍👧',name:'«Семейный»',price:7500,color:'linear-gradient(135deg,#0E3460,#1565C0)',desc:'Всё для семьи · 2 взрослых + 2 детей',popular:true,valid:'1 год'},
    {id:'adventure',em:'🏹',name:'«Искатель приключений»',price:4000,color:'linear-gradient(135deg,#5c1a00,#C0392B)',desc:'Квесты · Экскурсии · Активности',popular:false,valid:'6 мес'},
    {id:'vip',em:'👑',name:'«VIP Этномир»',price:15000,color:'linear-gradient(135deg,#1a1a1a,#FFD60A)',desc:'Полный доступ · Все услуги · Любой срок',popular:true,valid:'1 год'},
  ];
  const SOUVENIRS=[
    {id:'mat',em:'🪆',name:'Матрёшка 7 куколок',price:1800,cat:'Народные'},
    {id:'khokh',em:'🎨',name:'Хохломская миска',price:2200,cat:'Народные'},
    {id:'scarf',em:'🧣',name:'Павловопосадский платок',price:3500,cat:'Текстиль'},
    {id:'ceramic',em:'🏺',name:'Гончарная кружка ручная',price:1200,cat:'Керамика'},
    {id:'amber',em:'🌟',name:'Янтарные бусы',price:2800,cat:'Украшения'},
    {id:'shawl',em:'🪡',name:'Кашемировый шаль · Индия',price:4200,cat:'Текстиль'},
  ];
  const addItem=(item)=>addToCart&&addToCart({...item,category:'market',source:'Маркет'});
  const inCart=(id)=>cart.find(x=>x.id===id)?.qty||0;
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?10:0}}>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Магазин</div>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1}}>Сертификаты и сувениры</div>
      </div>
      {cartCount>0&&<div onClick={()=>push('cart')} className="eth-tap" style={{background:blue,borderRadius:14,padding:'8px 14px',display:'flex',gap:6,alignItems:'center',cursor:'pointer'}}>
        <span style={{fontSize:12,color:'#fff',fontFamily:FT,fontWeight:700}}>🛒 {cartCount}</span>
      </div>}
    </div>
    <div style={{padding:'10px 20px 0',display:'flex',gap:8}}>
      {[['certs','🎁 Сертификаты'],['souvenirs','🛍 Сувениры']].map(([id,label])=><div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,borderRadius:14,padding:'10px',textAlign:'center',cursor:'pointer',background:tab===id?l1:'var(--ef2)',border:tab===id?'none':'0.5px solid var(--es2)',transition:'all .25s cubic-bezier(.34,1.3,.64,1)'}}>
        <span style={{fontSize:13,fontFamily:FT,fontWeight:tab===id?600:400,color:tab===id?bg:l2}}>{label}</span>
      </div>)}
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'12px 20px 100px'}}>
      {tab==='certs'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
        {CERTS.map((c,i)=><div key={c.id} style={{borderRadius:22,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.15)'}}>
          <div style={{background:c.color,padding:'20px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-15,bottom:-15,fontSize:60,opacity:.15}}>{c.em}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
              <div>
                {c.popular&&<div style={{display:'inline-flex',background:'rgba(255,255,255,.2)',backdropFilter:'blur(6px)',borderRadius:8,padding:'2px 8px',marginBottom:6,border:'0.5px solid rgba(255,255,255,.3)'}}>
                  <span style={{fontSize:9,color:'#fff',fontFamily:FT,fontWeight:700}}>⭐ ПОПУЛЯРНЫЙ</span>
                </div>}
                <div style={{fontSize:17,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.3px',marginBottom:4}}>{c.name}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT,marginBottom:4}}>{c.desc}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT}}>Действует {c.valid}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                <div style={{fontSize:22,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-.4px'}}>{c.price.toLocaleString('ru')}₽</div>
                {inCart(c.id)>0&&<div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT,marginTop:3}}>В корзине: {inCart(c.id)}</div>}
              </div>
            </div>
          </div>
          <div style={{background:'var(--ef2)',padding:'10px 20px',display:'flex',gap:8,alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:11,color:l3,fontFamily:FT}}>🎁 Отправить как подарок</span>
            <div onClick={()=>addItem({...c,category:'market',source:'Маркет'})} className="eth-tap" style={{background:inCart(c.id)>0?green:blue,borderRadius:10,padding:'6px 14px',cursor:'pointer',transition:'background .2s'}}>
              <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:FT}}>{inCart(c.id)>0?'✓ В корзине':'+ В корзину'}</span>
            </div>
          </div>
        </div>)}
      </div>}
      {tab==='souvenirs'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {SOUVENIRS.map((s,i)=><div key={s.id} onClick={()=>push('productdetail',{product:s})} className="eth-tap eth-card" style={{borderRadius:18,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer'}}>
          <div style={{height:90,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:42}}>{s.em}</div>
          <div style={{padding:'10px 12px'}}>
            <div style={{fontSize:10,color:l4,fontFamily:FT,marginBottom:3}}>{s.cat}</div>
            <div style={{fontSize:12,fontWeight:700,color:l1,fontFamily:FT,lineHeight:1.3,marginBottom:6}}>{s.name}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD}}>{s.price.toLocaleString('ru')}₽</span>
              <div onClick={e=>{e.stopPropagation();addItem(s);}} className="eth-tap" style={{width:28,height:28,borderRadius:14,background:inCart(s.id)>0?green:blue,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16,color:'#fff'}}>{inCart(s.id)>0?'✓':'+'}</div>
            </div>
          </div>
        </div>)}
      </div>}
    </div>
  </div>;
}

function FavScreen({push,pop}){
  const[tab,setTab]=useState('all');
  const[favs,setFavs]=useState({
    'spa-thai':true,'hotel-srilanka':true,'mc-gonchar':true,
    'event-india':true,'excursion-krugosvetka':true,'zoo-husky':true,
  });
  const ITEMS=[
    {id:'hotel-srilanka',em:'🇱🇰',n:'СПА-отель «Шри-Ланка»',sub:'от 8 500₽/ночь',type:'hotel',r:4.9,s:'hotels'},
    {id:'spa-thai',em:'💆',n:'Тайский массаж',sub:'3 200₽ · 90 мин',type:'spa',r:4.9,s:'spa'},
    {id:'mc-gonchar',em:'🏺',n:'Гончарный круг',sub:'1 800₽ · 1.5 ч',type:'mc',r:4.9,s:'masterclasses'},
    {id:'event-india',em:'🎭',n:'Фестиваль Индии',sub:'350₽ · 15 марта',type:'event',r:4.9,s:'events'},
    {id:'excursion-krugosvetka',em:'🌍',n:'Кругосветка за день',sub:'1 800₽ · 3 часа',type:'excursion',r:4.9,s:'excursions'},
    {id:'zoo-husky',em:'🐺',n:'Деревня хаски',sub:'Бесплатно · 10:00–20:00',type:'zoo',r:4.9,s:'zoo'},
  ];
  const tabs=['all','hotel','spa','mc','event','excursion'];
  const tabLabels={all:'Все',hotel:'Отели',spa:'СПА',mc:'МК',event:'События',excursion:'Экскур.'};
  const shown=ITEMS.filter(it=>favs[it.id]&&(tab==='all'||it.type===tab));
  const toggle=(id)=>setFavs(f=>({...f,[id]:!f[id]}));
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Избранное" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'8px 20px 12px',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {tabs.map(t=><div key={t} onClick={()=>setTab(t)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'6px 14px',cursor:'pointer',background:tab===t?l1:'var(--ef2)',border:tab===t?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:tab===t?600:400,color:tab===t?bg:l2}}>{tabLabels[t]}</span>
        </div>)}
      </div>
      {shown.length>0
        ?<div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:10}}>
          {shown.map((it,i)=><div key={it.id} className="eth-tap eth-card" style={{borderRadius:18,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'14px 16px',cursor:'pointer',display:'flex',gap:14,alignItems:'center'}} onClick={()=>push(it.s)}>
            <div style={{width:50,height:50,borderRadius:16,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{it.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FT,marginBottom:2}}>{it.n}</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:4}}>{it.sub}</div>
              <span style={{fontSize:11,color:'#FFD60A'}}>★ {it.r}</span>
            </div>
            <div onClick={e=>{e.stopPropagation();toggle(it.id);}} className="eth-tap" style={{width:32,height:32,borderRadius:16,background:`${red}15`,border:`0.5px solid ${red}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontSize:16}}>❤️</span>
            </div>
          </div>)}
        </div>
        :<div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 20px',gap:12}}>
          <span style={{fontSize:44}}>🤍</span>
          <div style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FT}}>Список пуст</div>
          <div style={{fontSize:13,color:l3,fontFamily:FT,textAlign:'center'}}>Добавляйте услуги в избранное нажав ❤️</div>
        </div>
      }
    </div>
  </div>;
}

function ProfileEditSC({pop}){
  const[name,setName]=useState('Алексей Путешественников');
  const[phone,setPhone]=useState('+7 999 123-45-67');
  const[email,setEmail]=useState('alex@ethnomir.ru');
  const[city,setCity]=useState('Москва');
  const[bio,setBio]=useState('Люблю путешествовать и открывать культуры разных народов');
  const[saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>{setSaved(false);pop&&pop();},1500);};
  const Field=({label,val,onChange,multiline})=><div style={{marginBottom:14}}>
    <div style={{fontSize:11,color:l3,fontFamily:FT,letterSpacing:'.3px',textTransform:'uppercase',fontWeight:600,marginBottom:6}}>{label}</div>
    {multiline
      ?<textarea value={val} onChange={e=>onChange(e.target.value)} rows={3} style={{width:'100%',borderRadius:14,padding:'12px 14px',background:'var(--ef2)',border:'0.5px solid var(--es2)',fontSize:14,color:l1,fontFamily:FT,resize:'none',lineHeight:1.5}}/>
      :<input value={val} onChange={e=>onChange(e.target.value)} style={{width:'100%',borderRadius:14,padding:'12px 14px',background:'var(--ef2)',border:'0.5px solid var(--es2)',fontSize:14,color:l1,fontFamily:FT}}/>
    }
  </div>;
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Редактировать профиль" back={pop?'Назад':undefined} onBack={pop}
      right={<div onClick={save} className="eth-tap" style={{fontSize:14,color:blue,fontFamily:FT,fontWeight:600}}>{saved?'✓ Сохранено':'Сохранить'}</div>}/>
    <div style={{flex:1,overflowY:'auto',padding:'16px 20px 100px'}}>
      {/* Avatar */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24}}>
        <div style={{width:90,height:90,borderRadius:30,background:'linear-gradient(135deg,#1B4332,#2ECC71)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,marginBottom:10,position:'relative'}}>
          🌍
          <div className="eth-tap" style={{position:'absolute',bottom:-4,right:-4,width:28,height:28,borderRadius:14,background:blue,border:'2px solid var(--eb)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <span style={{fontSize:12}}>✏️</span>
          </div>
        </div>
        <div style={{fontSize:12,color:blue,fontFamily:FT,fontWeight:500}}>Изменить фото</div>
      </div>
      <Field label="Имя и фамилия" val={name} onChange={setName}/>
      <Field label="Телефон" val={phone} onChange={setPhone}/>
      <Field label="Email" val={email} onChange={setEmail}/>
      <Field label="Город" val={city} onChange={setCity}/>
      <Field label="О себе" val={bio} onChange={setBio} multiline/>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:l3,fontFamily:FT,letterSpacing:'.3px',textTransform:'uppercase',fontWeight:600,marginBottom:6}}>Язык интерфейса</div>
        <div style={{display:'flex',gap:8}}>
          {['Русский','English','中文'].map((l,i)=><div key={i} className="eth-tap" style={{flex:1,borderRadius:12,padding:'10px',textAlign:'center',background:i===0?blue:'var(--ef2)',border:i===0?'none':'0.5px solid var(--es2)',cursor:'pointer'}}>
            <span style={{fontSize:12,fontFamily:FT,fontWeight:i===0?600:400,color:i===0?'#fff':l2}}>{l}</span>
          </div>)}
        </div>
      </div>
      <div onClick={save} className="eth-tap" style={{borderRadius:16,padding:'15px',background:blue,textAlign:'center',cursor:'pointer',marginTop:8}}>
        <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>{saved?'✓ Сохранено!':'Сохранить изменения'}</span>
      </div>
    </div>
  </div>;
}

function HotelsScreen({push,pop}){
  const[cat,setCat]=useState('Все');
  const[sort,setSort]=useState('rating');
  const cats=['Все','Эконом','Комфорт','Люкс','Глэмпинг'];
  const hotels=[
    // Реальные отели ЭТНОМИРА (источник: ethnomir.ru/oteli/)
    {id:1,em:'🇱🇰',n:'СПА-отель «Шри-Ланка»',sub:'Тропический стиль · Бассейн · Хаммам',
     p:8500,r:4.9,nr:412,tag:'Флагман',cat:'Люкс',
     grad:'linear-gradient(135deg,#0a3d1e,#1B4332)',
     feats:['♨️ Хаммам','🏊 Бассейн','🍃 СПА','🌴 Тропик'],
     desc:'Флагман Этномира. Единственный тропический СПА-отель в Подмосковье. Бассейн, хамам, тропический сад.'},
    {id:2,em:'🏔',n:'«Гималайский дом»',sub:'Непал · Бутан · Тибет',
     p:6900,r:4.8,nr:189,tag:'Популярно',cat:'Комфорт',
     grad:'linear-gradient(135deg,#1a3a8a,#2980B9)',
     feats:['🧘 Медитация','🍵 Чайная','🏔 Вид','🪔 Декор'],
     desc:'Апартаменты в духе непальских монастырей. Расписные потолки, аутентичные ткани, горный уют.'},
    {id:3,em:'🇮🇳',n:'«Индия»',sub:'Стиль Великих Моголов · 36 номеров',
     p:5452,r:4.8,nr:267,tag:'Восточный',cat:'Комфорт',
     grad:'linear-gradient(135deg,#7B0000,#FF9933)',
     feats:['🕌 Арки','🌺 Сад','🎶 Ситар','🌅 Терраса'],
     desc:'Выстроен в стиле династии Великих Моголов. 36 номеров с восточными лампами, ажурными колоннами.'},
    {id:4,em:'🇧🇾',n:'«Беларусь»',sub:'Деревянная архитектура · Лес',
     p:4500,r:4.7,nr:203,tag:'Природа',cat:'Комфорт',
     grad:'linear-gradient(135deg,#1a4a1a,#2D6A4F)',
     feats:['🌲 Лес','🛁 Душ','🍳 Завтрак','🅿️ Парковка'],
     desc:'Деревянная архитектура и уютные номера в белорусском стиле среди берёзового леса.'},
    {id:5,em:'🌻',n:'Парк-отель «Украина»',sub:'Мазанка · Вышиванка · Степь',
     p:4200,r:4.7,nr:178,tag:'Уютный',cat:'Комфорт',
     grad:'linear-gradient(135deg,#2D5A00,#C2862A)',
     feats:['🌻 Декор','🌾 Сад','🍳 Завтрак','🅿️ Парковка'],
     desc:'Колоритная мазанка с вышиванками, петриковской росписью и духом украинской степи.'},
    {id:6,em:'🌲',n:'«Сибирия»',sub:'Сибирский стиль · Кедр · Природа',
     p:3900,r:4.7,nr:145,tag:'Новинка',cat:'Комфорт',
     grad:'linear-gradient(135deg,#2C3E50,#4A235A)',
     feats:['🌲 Кедр','🔥 Камин','🎿 Природа','🛁 Ванна'],
     desc:'Этноотель в сибирском стиле — кедровые стены, тёплые меха, дух Тайги и северного простора.'},
    {id:7,em:'🕌',n:'Этноотель «Центральная Азия»',sub:'Юрта · Шёлковый путь · Степь',
     p:4400,r:4.7,nr:167,tag:'Экзотика',cat:'Эконом',
     grad:'linear-gradient(135deg,#4a3000,#C2862A)',
     feats:['🏕 Юрта','🐴 Лошади','🌾 Степь','🔥 Очаг'],
     desc:'Дух Великого шёлкового пути. Юрты, шёлковые ковры, Казахстан, Узбекистан, Монголия рядом.'},
    {id:8,em:'⛰️',n:'«Непал»',sub:'Буддийский монастырь · Флаги-лунгта',
     p:5200,r:4.8,nr:134,tag:'Духовный',cat:'Комфорт',
     grad:'linear-gradient(135deg,#4a0050,#8B0068)',
     feats:['🪷 Буддизм','🔔 Колокол','🧘 Медитация','🌸 Лунгта'],
     desc:'Атмосфера тибетского монастыря. Медные колокольчики, буддийские танки, благовония.'},
    {id:9,em:'🏯',n:'«Восточная Азия»',sub:'Япония · Китай · Корея',
     p:5500,r:4.7,nr:156,tag:'Стильный',cat:'Комфорт',
     grad:'linear-gradient(135deg,#7b0000,#BC002D)',
     feats:['🎌 Япония','🐉 Китай','🌸 Сакура','🍵 Матча'],
     desc:'Японские сёдзи, китайский фарфор, корейские мотивы — гармония трёх великих культур.'},
    {id:10,em:'🛕',n:'«Юго-Восточная Азия»',sub:'Таиланд · Вьетнам · Индонезия',
     p:4800,r:4.6,nr:121,tag:'Тропики',cat:'Эконом',
     grad:'linear-gradient(135deg,#0a3d2e,#1a7a5a)',
     feats:['🌴 Тропик','🌺 Цветы','🍜 Кухня','🅿️ Парковка'],
     desc:'Тропическая роскошь без перелёта. Интерьеры Бали, Таиланда, Вьетнама в Подмосковье.'},
    {id:11,em:'🏡',n:'Этнодомики',sub:'Отдельные дома · Кухня · Камин',
     p:6200,r:4.8,nr:203,tag:'Для семьи',cat:'Люкс',
     grad:'linear-gradient(135deg,#1a3a1a,#2D5016)',
     feats:['🏠 Дом','🔥 Камин','🍳 Кухня','🌲 Природа'],
     desc:'Отдельные этнические дома на 4–8 гостей. Своя кухня, камин, терраса, полная приватность.'},
  ];
  const shown=(cat==='Все'?hotels:hotels.filter(h=>h.cat===cat))
    .sort((a,b)=>sort==='rating'?b.r-a.r:a.p-b.p);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Отели" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(160deg,#0a0a1a,#1a1a3a)',padding:'20px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',right:-20,top:-20,fontSize:80,opacity:.08}}>🏨</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>11 отелей · Шри-Ланка · Сибирия · Индия · Непал</div>
        <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>Этно-отели</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT}}>Каждый номер — погружение в культуру другой страны. Завтрак включён.</div>
      </div>
      {/* Filters */}
      <div style={{padding:'12px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {cats.map(c=><div key={c} onClick={()=>setCat(c)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',background:cat===c?l1:'var(--ef2)',border:cat===c?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:cat===c?600:400,color:cat===c?bg:l2}}>{c}</span>
        </div>)}
        <div style={{flexShrink:0,display:'flex',alignItems:'center',gap:6,background:'var(--ef2)',border:'0.5px solid var(--es2)',borderRadius:20,padding:'7px 14px',cursor:'pointer'}} onClick={()=>setSort(s=>s==='rating'?'price':'rating')}>
          <span style={{fontSize:10}}>{sort==='rating'?'★':'₽'}</span>
          <span style={{fontSize:12,color:l2,fontFamily:FT,fontWeight:500}}>{sort==='rating'?'Рейтинг':'Цена'}</span>
        </div>
      </div>
      <div style={{padding:'12px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {shown.map((h,i)=><div key={h.id} onClick={()=>push('hoteldetail',{hotel:h})} className="eth-tap eth-card" style={{borderRadius:22,overflow:'hidden',cursor:'pointer',boxShadow:'0 2px 16px rgba(0,0,0,.12)'}}>
          {/* Gradient header */}
          <div style={{background:h.grad,padding:'18px',position:'relative',overflow:'hidden',minHeight:90}}>
            <div style={{position:'absolute',right:-15,bottom:-15,fontSize:60,opacity:.25}}>{h.em}</div>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'relative'}}>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:FT,letterSpacing:'.3px',textTransform:'uppercase',marginBottom:3}}>{h.cat}</div>
                <div style={{fontSize:17,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.3px'}}>{h.n}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:2}}>{h.sub}</div>
              </div>
              <div style={{background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',borderRadius:12,padding:'5px 10px',border:'0.5px solid rgba(255,255,255,.3)',flexShrink:0}}>
                <div style={{fontSize:11,color:'#fff',fontFamily:FT,fontWeight:700}}>{h.tag}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
              {h.feats.map((f,j)=><div key={j} style={{background:'rgba(255,255,255,.15)',backdropFilter:'blur(6px)',borderRadius:8,padding:'3px 8px',border:'0.5px solid rgba(255,255,255,.2)'}}>
                <span style={{fontSize:10,color:'rgba(255,255,255,.9)',fontFamily:FT}}>{f}</span>
              </div>)}
            </div>
          </div>
          {/* Bottom row */}
          <div style={{background:'var(--ef2)',padding:'12px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:2}}>{h.desc.slice(0,52)}…</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:12,color:'#FFD60A'}}>★ {h.r}</span>
                <span style={{fontSize:11,color:l4,fontFamily:FT}}>{h.nr} отзывов</span>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
              <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>{h.p.toLocaleString('ru')}₽</div>
              <div style={{fontSize:10,color:l3,fontFamily:FT}}>/ ночь</div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function HotelDetailSC({push,pop,params={}}){
  const h=params.h||{id:1,em:'🇱🇰',n:'СПА-отель Шри-Ланка',sub:'Тропический стиль · Бассейн',p:8500,r:4.9,nr:142,g:'linear-gradient(135deg,#0a3d62,#1a6091)'};
  const[fav,setFav]=useState(false);
  const[tab,setTab]=useState('rooms');
  const[gallery,setGallery]=useState(0);
  const PHOTOS=['🌊','🏊','🌴','🛏','🍹','💆'];
  const PHOTO_CAPS=['Бассейн','Зона отдыха','Территория','Номер Делюкс','Лобби-бар','СПА'];
  const amenities=['☀️ Бассейн','🧖 СПА','🍳 Завтрак','🚗 Парковка','📶 Wi-Fi','🏋️ Тренажёр','🌡 Хаммам','🍷 Мини-бар','♨️ Джакузи','🌿 Сад'];
  const rooms=[
    {t:'Стандарт',sub:'1 кровать · 20 м²',p:h.p,em:'🛏',color:'#607D8B',perks:['Wi-Fi','Завтрак','Кондиционер']},
    {t:'Делюкс',sub:'2 кровати · 32 м²',p:Math.round(h.p*1.45),em:'🛌',color:blue,perks:['Wi-Fi','Завтрак','Мини-бар','Вид на парк'],popular:true},
    {t:'Сюит',sub:'Гостиная · 55 м²',p:Math.round(h.p*2.1),em:'🏠',color:'#FFD60A',perks:['Всё включено','Джакузи','Батлер','Трансфер']},
  ];
  const REVIEWS=[
    {n:'Анна К.',r:5,d:'10 марта',t:'Потрясающее место! Атмосфера Шри-Ланки передана идеально. СПА-процедуры на высшем уровне.',em:'🇷🇺'},
    {n:'Dmitry V.',r:5,d:'5 марта',t:'Amazing experience. The pool area is gorgeous, breakfast is fresh every day.',em:'🇷🇺'},
    {n:'Елена М.',r:4,d:'28 февраля',t:'Очень красиво оформлено, персонал внимательный. Единственное — шумновато в выходные.',em:'🇷🇺'},
  ];
  const SIMILAR=[
    {em:'🇯🇵',n:'Отель Сакура',p:9200,r:4.8,g:'linear-gradient(135deg,#7B0000,#BC002D)'},
    {em:'🇮🇳',n:'Радж Махал',p:7800,r:4.7,g:'linear-gradient(135deg,#8B4513,#FF9933)'},
    {em:'🇹🇭',n:'Тайский дворец',p:8100,r:4.9,g:'linear-gradient(135deg,#4A0080,#9B59B6)'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    {/* Hero + Gallery */}
    <div style={{position:'relative',flexShrink:0}}>
      <div style={{height:260,background:h.g,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:90,opacity:.35,filter:'drop-shadow(0 8px 24px rgba(0,0,0,.5))',transition:'all .3s'}}>{PHOTOS[gallery]}</div>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.4) 0%,transparent 40%,rgba(0,0,0,.7) 100%)'}}/>
        {/* Nav */}
        <div style={{position:'absolute',top:48,left:0,right:0,display:'flex',justifyContent:'space-between',padding:'0 16px'}}>
          {pop&&<div onClick={pop} className="eth-press" style={{width:36,height:36,borderRadius:12,background:'rgba(0,0,0,.42)',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <Ic.chevL s={9} c="#fff"/>
          </div>}
          <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
            <div onClick={()=>setFav(!fav)} className="eth-press" style={{width:36,height:36,borderRadius:12,background:'rgba(0,0,0,.42)',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <Ic.heart s={17} c={fav?red:'#fff'} fill={fav}/>
            </div>
            <div className="eth-press" style={{width:36,height:36,borderRadius:12,background:'rgba(0,0,0,.42)',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <Ic.share s={16} c="#fff"/>
            </div>
          </div>
        </div>
        {/* Title */}
        <div style={{position:'absolute',bottom:50,left:0,right:0,padding:'0 20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
            <Ic.location s={10} c="rgba(255,255,255,.7)"/>
            <span style={{fontSize:12,fontFamily:FT,color:'rgba(255,255,255,.7)'}}>Этномир, Калужская обл.</span>
          </div>
          <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px',lineHeight:1.1}}>{h.n}</div>
        </div>
        {/* Gallery dots */}
        <div style={{position:'absolute',bottom:14,left:0,right:0,display:'flex',justifyContent:'center',gap:5}}>
          {PHOTOS.map((_,i)=><div key={i} onClick={()=>setGallery(i)} style={{width:i===gallery?20:6,height:5,borderRadius:3,background:i===gallery?'#fff':'rgba(255,255,255,.4)',transition:'width .3s',cursor:'pointer'}}/>)}
        </div>
      </div>
      {/* Gallery strip */}
      <div style={{display:'flex',gap:6,padding:'10px 16px',background:'var(--ef2)',overflowX:'auto',scrollbarWidth:'none',borderBottom:'0.5px solid var(--es2)'}}>
        {PHOTOS.map((ph,i)=>(
          <div key={i} onClick={()=>setGallery(i)} className="eth-tap" style={{flexShrink:0,width:64,height:48,borderRadius:10,background:i===gallery?`${h.g.match(/#\w+/)?.[0]||'#333'}20`:'var(--ef3)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:`1.5px solid ${i===gallery?blue:'var(--es2)'}`,cursor:'pointer',transition:'all .2s'}}>
            <div style={{fontSize:18}}>{ph}</div>
            <div style={{fontSize:7,color:i===gallery?blue:l4,fontFamily:FT,marginTop:2,textAlign:'center'}}>{PHOTO_CAPS[i]}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Rating */}
    <div style={{padding:'12px 20px',display:'flex',alignItems:'center',gap:10,borderBottom:`0.5px solid var(--es2)`,flexWrap:'wrap'}}>
      <div style={{display:'flex',alignItems:'center',gap:5,background:`${yellow}18`,borderRadius:10,padding:'5px 11px'}}>
        <Ic.star s={13} c={yellow}/>
        <span style={{fontSize:14,fontFamily:FD,fontWeight:700,color:yellow}}>{h.r}</span>
        <span style={{fontSize:12,fontFamily:FT,color:l3}}>({h.nr||0})</span>
      </div>
      {['Этнотуризм','СПА','Бассейн'].map((t,i)=><Tag key={i} label={t} color={[green,pink,blue][i]}/>)}
    </div>

    {/* Section tabs */}
    <div style={{display:'flex',padding:'8px 20px 0',gap:4,borderBottom:'0.5px solid var(--es2)'}}>
      {[['rooms','🛏 Номера'],['amenities','✨ Удобства'],['reviews','⭐ Отзывы']].map(([id,lbl])=>(
        <div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,padding:'9px',textAlign:'center',borderRadius:10,background:tab===id?`${blue}12`:'transparent',cursor:'pointer',borderBottom:tab===id?`2px solid ${blue}`:'2px solid transparent'}}>
          <span style={{fontSize:11,fontWeight:600,color:tab===id?blue:l3,fontFamily:FT}}>{lbl}</span>
        </div>
      ))}
    </div>

    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Description */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:14,fontFamily:FT,color:l2,lineHeight:1.6,letterSpacing:'-.1px'}}>
          {h.n} — уникальный этноотель, воссоздающий атмосферу {h.sub?.split('·')[0].trim()}. Каждый номер оформлен в аутентичном стиле с использованием традиционных материалов и текстиля.
        </div>
      </div>

      {tab==='rooms'&&<div style={{padding:'16px 20px'}}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {rooms.map((r,i)=><div key={i} onClick={()=>push('booking',{h,room:r})} className="eth-press" style={{background:'var(--ef2)',borderRadius:20,overflow:'hidden',cursor:'pointer',border:`0.5px solid ${r.popular?r.color+'50':'var(--es2)'}`,position:'relative'}}>
            {r.popular&&<div style={{position:'absolute',top:12,right:12,background:r.color,borderRadius:7,padding:'3px 8px',zIndex:1}}>
              <span style={{fontSize:9,fontWeight:700,color:'#fff',fontFamily:FT}}>Популярный</span>
            </div>}
            <div style={{height:80,background:`${r.color}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40}}>{r.em}</div>
            <div style={{padding:'12px 16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FT}}>{r.t}</div>
                  <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:2}}>{r.sub}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:20,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>{r.p.toLocaleString('ru')}₽</div>
                  <div style={{fontSize:10,color:l4,fontFamily:FT}}>/ночь</div>
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {r.perks.map((p,j)=><div key={j} style={{background:'var(--ef3)',borderRadius:6,padding:'3px 8px'}}>
                  <span style={{fontSize:10,color:l2,fontFamily:FT}}>{p}</span>
                </div>)}
              </div>
            </div>
          </div>)}
        </div>
      </div>}

      {tab==='amenities'&&<div style={{padding:'16px 20px'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:20}}>
          {amenities.map((a,i)=><div key={i} style={{background:'var(--ef2)',borderRadius:12,padding:'9px 14px',fontSize:13,fontFamily:FT,color:l1,border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',gap:6}}>{a}</div>)}
        </div>
        {/* Map placeholder */}
        <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Расположение</div>
        <div style={{borderRadius:18,overflow:'hidden',border:'0.5px solid var(--es2)',background:'var(--ef2)'}}>
          <div style={{height:140,background:'linear-gradient(160deg,#0d2010,#0d2818)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,opacity:.4}}>
              <svg width="100%" height="100%" viewBox="0 0 390 140">
                <path d="M 0 70 Q 100 50 200 70 Q 300 90 390 70" stroke={green} strokeWidth="3" fill="none" opacity=".5"/>
                <path d="M 195 0 Q 180 50 195 70 Q 210 90 195 140" stroke={blue} strokeWidth="2" fill="none" opacity=".4"/>
                <circle cx="195" cy="70" r="8" fill={red} opacity=".9"/>
                <circle cx="195" cy="70" r="18" fill={red} opacity=".15"/>
              </svg>
            </div>
            <div style={{position:'relative',textAlign:'center'}}>
              <div style={{fontSize:32}}>📍</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT,marginTop:4}}>Зона А · Корпус 2</div>
            </div>
          </div>
          <div style={{padding:'10px 14px',display:'flex',gap:12,alignItems:'center'}}>
            <span style={{fontSize:12,color:l2,fontFamily:FT,flex:1}}>5 мин от главного входа</span>
            <div className="eth-tap" style={{padding:'5px 12px',background:`${blue}12`,borderRadius:8,cursor:'pointer'}}>
              <span style={{fontSize:11,color:blue,fontFamily:FT,fontWeight:600}}>Маршрут</span>
            </div>
          </div>
        </div>
      </div>}

      {tab==='reviews'&&<div style={{padding:'16px 20px'}}>
        {/* Rating summary */}
        <div style={{background:'var(--ef2)',borderRadius:18,padding:'16px',border:'0.5px solid var(--es2)',marginBottom:16}}>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:44,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-1.5px'}}>{h.r}</div>
              <div style={{fontSize:11,color:yellow,letterSpacing:1}}>★★★★★</div>
              <div style={{fontSize:10,color:l4,fontFamily:FT,marginTop:4}}>{h.nr} отзывов</div>
            </div>
            <div style={{flex:1}}>
              {[[5,'#FFD60A',0.82],[4,green,0.13],[3,orange,0.05],[2,red,0],[1,red,0]].map(([stars,color,pct],i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                  <span style={{fontSize:10,color:l3,fontFamily:FT,width:10}}>{stars}</span>
                  <div style={{flex:1,height:4,background:'var(--ef3)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct*100}%`,background:color,borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:10,color:l4,fontFamily:FT,width:30}}>{Math.round(pct*100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {REVIEWS.map((rv,i)=>(
          <div key={i} style={{padding:'14px 0',borderBottom:i<REVIEWS.length-1?'0.5px solid var(--es2)':'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div style={{width:36,height:36,borderRadius:12,background:'var(--ef2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{rv.em}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT}}>{rv.n}</div>
                  <div style={{fontSize:11,color:'#FFD60A'}}>{'★'.repeat(rv.r)}</div>
                </div>
              </div>
              <span style={{fontSize:11,color:l4,fontFamily:FT}}>{rv.d}</span>
            </div>
            <div style={{fontSize:13,color:l2,fontFamily:FT,lineHeight:1.55}}>{rv.t}</div>
          </div>
        ))}
      </div>}

      {/* Similar hotels */}
      <div style={{padding:'0 20px 16px'}}>
        <div style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FT,marginBottom:12}}>Похожие отели</div>
        <div style={{display:'flex',gap:10,overflowX:'auto',scrollbarWidth:'none'}}>
          {SIMILAR.map((s,i)=>(
            <div key={i} onClick={()=>push('hoteldetail',{h:{...s,p:s.p,r:s.r,nr:Math.floor(50+Math.random()*100)}})} className="eth-tap" style={{flexShrink:0,width:130,borderRadius:16,overflow:'hidden',background:'var(--ef2)',border:'0.5px solid var(--es2)',cursor:'pointer'}}>
              <div style={{height:60,background:s.g,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{s.em}</div>
              <div style={{padding:'8px 10px'}}>
                <div style={{fontSize:11,fontWeight:600,color:l1,fontFamily:FT,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.n}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:10,color:'#FFD60A'}}>★ {s.r}</span>
                  <span style={{fontSize:11,fontWeight:700,color:l1,fontFamily:FD}}>{s.p.toLocaleString('ru')}₽</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>;
}


function BookingSC({push,pop,params={}}){
  const h=params.h||{n:'СПА-отель',p:8500,em:'🏨'};
  const room=params.room||{t:'Стандарт',sub:'Комфорт',p:8500,em:'🛏'};
  const[checkin]=useState('15 марта');
  const[checkout]=useState('17 марта');
  const[guests,setGuests]=useState(2);
  const nights=2;
  const extras=[
    {em:'🍳',n:'Завтрак',sub:'Шведский стол',p:800},
    {em:'🧖',n:'СПА-пакет',sub:'1 процедура',p:2500},
    {em:'🌹',n:'Романтика',sub:'Декор номера',p:1200},
  ];
  const[sel,setSel]=useState([]);
  const extraTotal=sel.reduce((s,i)=>s+extras[i].p*guests,0);
  const grandTotal=room.p*nights+extraTotal+500;

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Бронирование" back={pop}/>
    <div style={{flex:1,overflowY:'auto',padding:'16px 20px 16px'}}>
      {/* Hotel card */}
      <div style={{display:'flex',alignItems:'center',gap:14,background:bg2,borderRadius:16,padding:'14px 16px',marginBottom:20,border:`0.5px solid ${sep2}`}}>
        <span style={{fontSize:36}}>{h.em||'🏨'}</span>
        <div>
          <div style={{fontSize:16,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.2px'}}>{h.n}</div>
          <div style={{fontSize:13,fontFamily:FT,color:l3,marginTop:1}}>{room.t} · {room.sub}</div>
        </div>
      </div>

      {/* Dates */}
      <Section header="Даты и гости">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',background:bg2}}>
          {[['ЗАЕЗД',checkin],['ВЫЕЗД',checkout]].map(([l,v],i)=><div key={i} style={{padding:'13px 16px',borderRight:i===0?`0.5px solid ${sep2}`:'none'}}>
            <div style={{fontSize:11,fontFamily:FT,color:l3,marginBottom:5,letterSpacing:'.4px'}}>{l}</div>
            <div style={{fontSize:17,fontFamily:FD,fontWeight:600,color:l1,letterSpacing:'-.3px'}}>{v}</div>
          </div>)}
        </div>
        <div style={{height:'.5px',background:sep2}}/>
        <div style={{padding:'13px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',background:bg2}}>
          <div>
            <div style={{fontSize:11,fontFamily:FT,color:l3,letterSpacing:'.4px',marginBottom:5}}>ГОСТИ</div>
            <div style={{fontSize:17,fontFamily:FD,fontWeight:600,color:l1,letterSpacing:'-.3px'}}>{guests} {guests===1?'гость':guests<5?'гостя':'гостей'}</div>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <div onClick={()=>setGuests(g=>Math.max(1,g-1))} className="eth-press-sm" style={{width:32,height:32,borderRadius:10,background:f2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <span style={{fontSize:20,color:l1,lineHeight:1,fontFamily:FD,fontWeight:300}}>−</span>
            </div>
            <span style={{fontSize:18,fontFamily:FD,fontWeight:600,color:l1,minWidth:16,textAlign:'center'}}>{guests}</span>
            <div onClick={()=>setGuests(g=>Math.min(6,g+1))} className="eth-press-sm" style={{width:32,height:32,borderRadius:10,background:f2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <Ic.plus s={13} c={l1}/>
            </div>
          </div>
        </div>
      </Section>

      {/* Extras */}
      <Section header="Дополнения">
        {extras.map((ex,i)=><div key={i} style={{display:'flex',alignItems:'center',padding:'12px 16px',borderBottom:i===extras.length-1?'none':`0.5px solid ${sep2}`,background:bg2}}>
          <span style={{fontSize:24,marginRight:14,flexShrink:0}}>{ex.em}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontFamily:FT,fontWeight:500,color:l1,letterSpacing:'-.2px'}}>{ex.n}</div>
            <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{ex.sub} · {ex.p.toLocaleString('ru-RU')} ₽/чел</div>
          </div>
          <div onClick={()=>setSel(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])} className="eth-press-sm" style={{width:28,height:28,borderRadius:8,background:sel.includes(i)?green:f2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'background .2s'}}>
            {sel.includes(i)?<Ic.check s={13} c="#fff"/>:<Ic.plus s={13} c={l3}/>}
          </div>
        </div>)}
      </Section>

      {/* Price breakdown */}
      <Card style={{padding:'14px 16px',marginBottom:20}}>
        {[
          [`Номер × ${nights} ноч.`,`${(room.p*nights).toLocaleString('ru-RU')} ₽`],
          [`Гости (${guests})`,'Включено'],
          ...(sel.length?[[`Допы`,`${extraTotal.toLocaleString('ru-RU')} ₽`]]:[]),
          ['Сервисный сбор','500 ₽'],
        ].map(([l,v],i,a)=><div key={i} style={{display:'flex',justifyContent:'space-between',paddingBottom:i<a.length-1?8:0,marginBottom:i<a.length-1?8:0,borderBottom:i<a.length-1?`0.5px solid ${sep2}`:'none'}}>
          <span style={{fontSize:15,fontFamily:FT,color:l3}}>{l}</span>
          <span style={{fontSize:15,fontFamily:FT,fontWeight:500,color:l2}}>{v}</span>
        </div>)}
        <div style={{height:'.5px',background:sep,margin:'12px 0'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
          <span style={{fontSize:17,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>Итого</span>
          <span style={{fontSize:24,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.5px'}}>{grandTotal.toLocaleString('ru-RU')} ₽</span>
        </div>
      </Card>
    </div>

    <div style={{padding:'12px 20px 24px',borderTop:`0.5px solid ${sep2}`,background:bg,flexShrink:0}}>
      <Btn label="Перейти к оплате" onPress={()=>push('checkout',{h,room,total:grandTotal,nights,guests,type:'hotel'})}/>
    </div>
  </div>;
}

//  CHECKOUT / PAYMENT SCREEN
function CheckoutSC({push,pop,params={},clearCart,addOrder}){
  const[step,setStep]=useState(0);
  const[method,setMethod]=useState(1);
  const[promo,setPromo]=useState('');
  const[promoApplied,setPromoApplied]=useState(false);
  const[promoError,setPromoError]=useState('');
  const[bonusInput,setBonusInput]=useState('');
  const MAX_BONUS=623;
  const bonusUsed=Math.min(Math.max(0,parseInt(bonusInput)||0),MAX_BONUS);
  const total=params.total||8500;
  const title=params.h?.n||params.item?.n||params.room?.t||params.service?.n||'Оплата';
  const isFromCart=!!params.fromCart;
  const delivery=params.delivery;
  const cartItems=params.cart||[];
  const discount=promoApplied?Math.round(total*.1):0;
  const finalTotal=Math.max(0,total-discount-bonusUsed);
  const VALID_PROMOS={'ETHNO10':10,'WELCOME':15,'VIP20':20};
  const applyPromo=()=>{
    if(VALID_PROMOS[promo.toUpperCase()]){setPromoApplied(true);setPromoError('');}
    else{setPromoError('Промокод не найден');setPromoApplied(false);}
  };
  const methods=[
    {id:0,em:'🍎',n:'Apple Pay',sub:'Мгновенная оплата · Face ID',color:'#000'},
    {id:1,em:'💳',n:'Visa •••• 4231',sub:'Основная карта',color:blue},
    {id:3,em:'🏦',n:'СБП',sub:'Система быстрых платежей',color:green},
  ];
  const doPayment=()=>{
    setStep(1);
    setTimeout(()=>{
      if(isFromCart){
        addOrder&&addOrder({items:cartItems,total:finalTotal,bonusUsed,delivery,status:'tracking'});
        clearCart&&clearCart();
        setStep(0);
        push('ordertracking',{fromCart:true,delivery,total:finalTotal});
      } else {setStep(2);}
    },2000);
  };
  if(step===1) return <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:bg,gap:20}}>
    <div style={{width:72,height:72,borderRadius:36,background:`${blue}15`,border:`2px solid ${blue}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,animation:'eth-pulse 1s ease infinite'}}>💳</div>
    <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>Обрабатываем платёж…</div>
    <div style={{fontSize:13,color:l3,fontFamily:FT}}>Пожалуйста, не закрывайте экран</div>
    <div style={{width:200,height:4,borderRadius:2,background:'var(--ef2)',overflow:'hidden'}}>
      <div style={{height:'100%',width:'60%',borderRadius:2,background:blue,animation:'eth-shimmer 1.5s ease infinite'}}/>
    </div>
  </div>;
  if(step===2) return <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:bg,gap:16,padding:'40px'}}>
    <div style={{width:90,height:90,borderRadius:45,background:`${green}15`,border:`3px solid ${green}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:42}}>✓</div>
    <div style={{fontSize:24,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-.5px',marginTop:8}}>Оплачено!</div>
    <div style={{fontSize:14,color:l3,fontFamily:FT,textAlign:'center',lineHeight:1.6}}>{title}<br/>Подтверждение выслано на почту</div>
    <div style={{background:'var(--ef2)',borderRadius:20,padding:'16px 20px',width:'100%',border:'0.5px solid var(--es2)'}}>
      <div style={{fontSize:11,color:l3,fontFamily:FT,textTransform:'uppercase',fontWeight:600,letterSpacing:'.4px',marginBottom:10}}>Детали</div>
      {[['💳','Сумма',`${finalTotal.toLocaleString('ru')}₽`],bonusUsed>0?['🌟','Баллами',`−${bonusUsed}₽`]:null,['🎟','Код','ETH-'+Math.floor(10000+Math.random()*90000)],['📅','Дата',new Date().toLocaleDateString('ru',{day:'numeric',month:'long'})]]
        .filter(Boolean).map(([em,k,v],i,arr)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,borderBottom:i<arr.length-1?'0.5px solid var(--es2)':'none',padding:'6px 0'}}>
          <span style={{fontSize:16}}>{em}</span><span style={{flex:1,fontSize:13,color:l3,fontFamily:FT}}>{k}</span><span style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT}}>{v}</span>
        </div>)}
    </div>
    <div onClick={()=>push('bookings')} className="eth-tap" style={{borderRadius:16,padding:'15px 40px',background:blue,cursor:'pointer'}}>
      <span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Мои бронирования →</span>
    </div>
    <div onClick={()=>{setStep(0);pop&&pop();}} className="eth-tap" style={{padding:'8px'}}>
      <span style={{fontSize:13,color:l3,fontFamily:FT}}>На главную</span>
    </div>
  </div>;
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?4:0}}>
        <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Оплата</div>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1,maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{isFromCart?`${cartItems.length} позиции`:title}</div>
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'0 20px 140px'}}>
      <div style={{background:'var(--ef2)',border:'0.5px solid var(--es2)',borderRadius:20,padding:'16px',marginBottom:16}}>
        <div style={{fontSize:11,color:l3,fontFamily:FT,fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Состав заказа</div>
        {isFromCart&&cartItems.length>0?cartItems.map((it,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:13,color:l2,fontFamily:FT}}>{it.emoji} {it.name} ×{it.qty}</span>
            <span style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{(it.price*it.qty).toLocaleString('ru')}₽</span>
          </div>
        )):(
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:13,color:l2,fontFamily:FT}}>{title}</span>
            <span style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{total.toLocaleString('ru')}₽</span>
          </div>
        )}
        {delivery&&<div style={{marginTop:8,padding:'8px 10px',background:`${blue}10`,borderRadius:10}}>
          <span style={{fontSize:12,color:blue,fontFamily:FT}}>{delivery.type==='delivery'?'🛵':'🏃'} {delivery.address} · {delivery.slot}</span>
        </div>}
        {promoApplied&&<div style={{display:'flex',justifyContent:'space-between',margin:'8px 0'}}>
          <span style={{fontSize:13,color:green,fontFamily:FT}}>🎁 {promo.toUpperCase()}</span>
          <span style={{fontSize:13,fontWeight:600,color:green,fontFamily:FT}}>−{discount.toLocaleString('ru')}₽</span>
        </div>}
        {bonusUsed>0&&<div style={{display:'flex',justifyContent:'space-between',margin:'8px 0'}}>
          <span style={{fontSize:13,color:yellow,fontFamily:FT}}>🌟 Баллы</span>
          <span style={{fontSize:13,fontWeight:600,color:yellow,fontFamily:FT}}>−{bonusUsed.toLocaleString('ru')}₽</span>
        </div>}
        <div style={{height:'0.5px',background:'var(--es2)',margin:'10px 0'}}/>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FT}}>Итого</span>
          <span style={{fontSize:20,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>{finalTotal.toLocaleString('ru')}₽</span>
        </div>
      </div>
      <div style={{marginBottom:16,background:'var(--ef2)',borderRadius:18,padding:'14px 16px',border:'0.5px solid var(--es2)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT}}>🌟 Бонусные баллы</div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>Доступно: {MAX_BONUS} = {MAX_BONUS}₽</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input value={bonusInput} onChange={e=>setBonusInput(e.target.value.replace(/\D/g,''))} placeholder={`До ${MAX_BONUS} баллов`} style={{flex:1,borderRadius:12,padding:'10px 14px',background:'var(--ef3)',border:`0.5px solid ${bonusUsed>0?yellow:'var(--es2)'}`,fontSize:13,color:l1,fontFamily:FT}}/>
          <div onClick={()=>setBonusInput(String(Math.min(MAX_BONUS,total-discount)))} className="eth-tap" style={{borderRadius:12,padding:'10px 14px',background:`${yellow}15`,border:`0.5px solid ${yellow}30`,cursor:'pointer',flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:600,color:yellow,fontFamily:FT}}>Макс.</span>
          </div>
        </div>
        {bonusUsed>0&&<div style={{fontSize:11,color:yellow,fontFamily:FT,marginTop:6}}>✓ Спишется {bonusUsed}₽</div>}
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:l3,fontFamily:FT,fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:8}}>Промокод</div>
        <div style={{display:'flex',gap:8}}>
          <input value={promo} onChange={e=>setPromo(e.target.value)} placeholder="Введите промокод" style={{flex:1,borderRadius:14,padding:'12px 14px',background:'var(--ef2)',border:`0.5px solid ${promoError?red:promoApplied?green:'var(--es2)'}`,fontSize:13,color:l1,fontFamily:FT}}/>
          <div onClick={applyPromo} className="eth-tap" style={{borderRadius:14,padding:'12px 18px',background:promoApplied?green:blue,cursor:'pointer',flexShrink:0}}>
            <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>{promoApplied?'✓':'Применить'}</span>
          </div>
        </div>
        {promoError&&<div style={{fontSize:11,color:red,fontFamily:FT,marginTop:4}}>✗ {promoError}</div>}
        {promoApplied&&<div style={{fontSize:11,color:green,fontFamily:FT,marginTop:4}}>✓ Скидка применена!</div>}
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:l3,fontFamily:FT,fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>Способ оплаты</div>
        {methods.map((m,i)=><div key={i} onClick={()=>setMethod(i)} className="eth-tap" style={{display:'flex',gap:14,padding:'13px 16px',marginBottom:8,borderRadius:16,background:'var(--ef2)',border:`1.5px solid ${method===i?m.color:'var(--es2)'}`,cursor:'pointer',transition:'all .2s'}}>
          <div style={{width:44,height:44,borderRadius:14,background:`${m.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{m.em}</div>
          <div style={{flex:1,paddingTop:2}}>
            <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT,marginBottom:2}}>{m.n}</div>
            <div style={{fontSize:11,color:l3,fontFamily:FT}}>{m.sub}</div>
          </div>
          <div style={{width:22,height:22,borderRadius:11,border:`2px solid ${method===i?m.color:'var(--es2)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:10}}>
            {method===i&&<div style={{width:10,height:10,borderRadius:5,background:m.color}}/>}
          </div>
        </div>)}
      </div>
      <div style={{fontSize:11,color:l4,fontFamily:FT,textAlign:'center',lineHeight:1.5,padding:'0 10px'}}>Нажимая «Оплатить», вы соглашаетесь с условиями Этномира</div>
    </div>
    <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
      <div onClick={doPayment} className="eth-tap" style={{borderRadius:18,padding:'16px',background:`linear-gradient(135deg,${blue},#5AC8FA)`,textAlign:'center',cursor:'pointer',boxShadow:`0 4px 20px ${blue}50`}}>
        <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FT}}>Оплатить {finalTotal.toLocaleString('ru')}₽</span>
      </div>
    </div>
  </div>;
}

function BookingsScreen({push,pop}){
  const[tab,setTab]=useState('active');
  const[qrItem,setQrItem]=useState(null);
  const ACTIVE=[
    {em:'🇱🇰',n:'СПА-отель «Шри-Ланка»',sub:'15–17 марта · 2 гостя · Делюкс',status:'Подтверждено',sc:green,code:'ETH-2847',price:17000,type:'hotel',actions:['QR-билет','Маршрут']},
    {em:'💆',n:'Тайский массаж',sub:'16 марта · 14:00 · 90 мин',status:'Ожидает оплаты',sc:orange,code:'ETH-28503',price:3200,type:'spa',actions:['Оплатить','Отменить']},
    {em:'🎭',n:'Фестиваль Индии',sub:'15 марта · 18:00 · 2 билета',status:'Подтверждено',sc:green,code:'ETH-29011',price:700,type:'event',actions:['QR-билет','Поделиться']},
  ];
  const PAST=[
    {em:'🧩',n:'Квест «Тайны Этномира»',sub:'8 марта · 12:00 · 4 участника',status:'Завершено',sc:l3,code:'ETH-27433',price:2800,r:5},
    {em:'🍜',n:'Мастер-класс: Том Ям',sub:'2 марта · 14:00',status:'Завершено',sc:l3,code:'ETH-26991',price:800,r:5},
    {em:'🐾',n:'Деревня хаски · Кормление',sub:'24 февр · 11:00',status:'Завершено',sc:l3,code:'ETH-26120',price:200,r:5},
    {em:'🏹',n:'Стрельба из лука',sub:'18 февр · 15:00',status:'Завершено',sc:l3,code:'ETH-25801',price:600,r:4},
  ];
  const list=tab==='active'?ACTIVE:PAST;
  const totalSpent=PAST.reduce((s,b)=>s+b.price,0);

  if(qrItem) return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg,alignItems:'center',justifyContent:'center',padding:'30px'}}>
    <div onClick={()=>setQrItem(null)} className="eth-tap" style={{position:'absolute',top:52,right:20,width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
      <span style={{fontSize:14}}>✕</span>
    </div>
    <div style={{fontSize:40,marginBottom:16}}>{qrItem.em}</div>
    <div style={{fontSize:18,fontWeight:700,color:l1,fontFamily:FD,marginBottom:4,textAlign:'center'}}>{qrItem.n}</div>
    <div style={{fontSize:12,color:l3,fontFamily:FT,marginBottom:24,textAlign:'center'}}>{qrItem.sub}</div>
    {/* QR placeholder */}
    <div style={{width:200,height:200,borderRadius:20,background:'var(--ef2)',border:'2px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,display:'grid',gridTemplateColumns:'repeat(8,1fr)',gridTemplateRows:'repeat(8,1fr)',gap:2,padding:16}}>
        {Array.from({length:64}).map((_,i)=><div key={i} style={{borderRadius:1,background:Math.random()>.45?l1:'transparent'}}/>)}
      </div>
      <div style={{position:'absolute',width:50,height:50,background:'var(--ef2)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{qrItem.em}</div>
    </div>
    <div style={{background:'var(--ef2)',border:'0.5px solid var(--es2)',borderRadius:16,padding:'12px 20px',textAlign:'center'}}>
      <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:3}}>Код бронирования</div>
      <div style={{fontSize:20,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:2}}>{qrItem.code}</div>
    </div>
    <div style={{fontSize:11,color:l4,fontFamily:FT,marginTop:12,textAlign:'center'}}>Покажите сотруднику при входе</div>
  </div>;

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?4:0}}>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Мои бронирования</div>
      </div>
    </div>
    <div style={{padding:'10px 20px 0',display:'flex',gap:10}}>
      {[{label:'Активных',val:ACTIVE.length,color:blue},{label:'Завершено',val:PAST.length,color:green},{label:'Потрачено',val:`${totalSpent.toLocaleString('ru')}₽`,color:purple}].map((s,i)=><div key={i} style={{flex:1,borderRadius:14,padding:'10px 8px',background:'var(--ef2)',border:'0.5px solid var(--es2)',textAlign:'center'}}>
        <div style={{fontSize:17,fontWeight:700,color:s.color,fontFamily:FD}}>{s.val}</div>
        <div style={{fontSize:9,color:l3,fontFamily:FT,marginTop:2}}>{s.label}</div>
      </div>)}
    </div>
    <div style={{padding:'10px 20px 0',display:'flex',gap:8}}>
      {[['active',`Активные (${ACTIVE.length})`],['past','История']].map(([id,label])=><div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,borderRadius:14,padding:'10px',textAlign:'center',cursor:'pointer',background:tab===id?l1:'var(--ef2)',border:tab===id?'none':'0.5px solid var(--es2)',transition:'all .25s cubic-bezier(.34,1.3,.64,1)'}}>
        <span style={{fontSize:13,fontFamily:FT,fontWeight:tab===id?600:400,color:tab===id?bg:l2}}>{label}</span>
      </div>)}
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'10px 20px 100px',display:'flex',flexDirection:'column',gap:10}}>
      {list.map((b,i)=><div key={i} className="eth-card" style={{borderRadius:20,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden'}}>
        <div style={{padding:'14px 16px'}}>
          <div style={{display:'flex',gap:12,marginBottom:10}}>
            <div style={{width:48,height:48,borderRadius:14,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{b.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FT,marginBottom:2}}>{b.n}</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:5}}>{b.sub}</div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div style={{display:'flex',gap:4,alignItems:'center'}}>
                  <div style={{width:6,height:6,borderRadius:3,background:b.sc}}/>
                  <span style={{fontSize:11,color:b.sc,fontFamily:FT,fontWeight:600}}>{b.status}</span>
                </div>
                <span style={{fontSize:9,color:l4,fontFamily:FT}}>{b.code}</span>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FD}}>{b.price.toLocaleString('ru')}₽</div>
              {b.r&&<div style={{fontSize:11,color:'#FFD60A',marginTop:2}}>{'★'.repeat(b.r)}</div>}
            </div>
          </div>
          {b.actions&&<div style={{display:'flex',gap:8}}>
            {b.actions.map((a,j)=><div key={j} onClick={()=>a==='QR-билет'?setQrItem(b):a==='Оплатить'?push('checkout',{item:b,total:b.price}):null} className="eth-tap" style={{flex:1,borderRadius:10,padding:'9px',textAlign:'center',background:j===0?blue:'var(--ef3)',border:j===0?'none':'0.5px solid var(--es2)',cursor:'pointer'}}>
              <span style={{fontSize:12,color:j===0?'#fff':l2,fontFamily:FT,fontWeight:j===0?600:400}}>{a}</span>
            </div>)}
          </div>}
        </div>
      </div>)}
    </div>
  </div>;
}

function EventsSC({push,pop}){
  const[day,setDay]=useState(0);
  const today=new Date();
  const days=Array.from({length:7},(_,i)=>{
    const d=new Date(today);d.setDate(today.getDate()+i);
    return {s:['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()],d:d.getDate(),full:d};
  });
  const EVENTS=[
    {em:'🎭',t:'Фестиваль Индии',sub:'Танцы · Музыка · Еда',time:'18:00',dur:'3 ч',price:350,r:4.9,spots:12,day:0,color:'#E91E63',
     desc:'Живые выступления индийских танцоров, мастера йоги, дегустация специй'},
    {em:'🥁',t:'Барабаны народов мира',sub:'Мастер-класс · Все участвуют',time:'19:30',dur:'1 ч',price:500,r:4.8,spots:3,day:0,color:'#FF9500',
     desc:'Научитесь играть на барабанах djembe, табла и кахон прямо на сеансе'},
    {em:'🍜',t:'Мастер: Тайская кухня',sub:'Готовим Пад Тай вместе',time:'14:00',dur:'2 ч',price:800,r:4.9,spots:8,day:0,color:'#FF6B35',
     desc:'Шеф из Таиланда учит готовить настоящий стритфуд. Едим то что приготовили'},
    {em:'🎪',t:'Этно-цирк',sub:'Шоу · Акробатика · Интерактив',time:'16:00',dur:'1 ч',price:400,r:4.9,spots:30,day:0,color:'#5E5CE6',
     desc:'Акробаты и жонглёры в костюмах народов мира. Дети выходят на сцену в финале'},
    {em:'💃',t:'Хоровод народов',sub:'Традиционные танцы · Бесплатно',time:'17:00',dur:'30 мин',price:0,r:4.9,spots:999,day:0,color:'#30D158',
     desc:'Каждый вечер на главной площади. Все желающие приглашаются к участию'},
    {em:'🎵',t:'Живая этно-музыка',sub:'Концерт · Балалайка · Домбра',time:'20:00',dur:'1.5 ч',price:0,r:4.9,spots:999,day:0,color:'#FFD60A',
     desc:'Ансамбль народных инструментов под открытым небом'},
    {em:'🎨',t:'Батик-марафон',sub:'Роспись по ткани · Уносишь домой',time:'12:00',dur:'3 ч',price:1200,r:4.8,spots:15,day:1,color:'#BF5AF2',
     desc:'За 3 часа создаёшь свой уникальный рисунок в технике батик. Изделие остаётся у тебя'},
    {em:'🏹',t:'Стрельба из лука «Монгол»',sub:'Казахская традиция · Инструктор',time:'11:00',dur:'1 ч',price:600,r:4.8,spots:10,day:1,color:'#FF9500',
     desc:'Настоящий лук, инструктор, цели — соревнование на точность в конце'},
    {em:'🍵',t:'Чайная церемония Китая',sub:'Гунфу Ча · Медитация',time:'15:00',dur:'1.5 ч',price:700,r:4.9,spots:6,day:2,color:'#BC002D',
     desc:'Мастер чайной церемонии проведёт вас через 7 этапов дегустации редких сортов'},
  ];
  const shown=EVENTS.filter(e=>e.day===day);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="События" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Date picker */}
      <div style={{padding:'8px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {days.map((d,i)=><div key={i} onClick={()=>setDay(i)} className="eth-tap" style={{flexShrink:0,width:52,borderRadius:16,padding:'10px 0',textAlign:'center',cursor:'pointer',background:day===i?l1:'var(--ef2)',border:day===i?'none':'0.5px solid var(--es2)',transition:'all .25s cubic-bezier(.34,1.3,.64,1)'}}>
          <div style={{fontSize:10,fontFamily:FT,fontWeight:500,color:day===i?bg:l3,marginBottom:4}}>{d.s}</div>
          <div style={{fontSize:18,fontWeight:700,fontFamily:FD,color:day===i?bg:l1,letterSpacing:'-.3px'}}>{d.d}</div>
          {i===0&&<div style={{fontSize:8,color:day===0?bg:blue,fontFamily:FT,marginTop:3,fontWeight:600}}>Сегодня</div>}
        </div>)}
      </div>
      <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {shown.length>0?shown.map((ev,i)=><div key={i} onClick={()=>push('eventdetail',{event:{...ev,n:ev.t}})} className="eth-tap eth-card" style={{borderRadius:22,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer'}}>
          <div style={{display:'flex',gap:0}}>
            {/* Color bar */}
            <div style={{width:4,background:ev.color,flexShrink:0}}/>
            <div style={{flex:1,padding:'14px 16px'}}>
              <div style={{display:'flex',gap:12}}>
                <div style={{width:52,height:52,borderRadius:16,background:`${ev.color}15`,border:`0.5px solid ${ev.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{ev.em}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2}}>{ev.t}</div>
                  <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:5}}>{ev.sub}</div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏰ {ev.time}</span>
                    <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {ev.dur}</span>
                    <span style={{fontSize:11,color:'#FFD60A'}}>★ {ev.r}</span>
                    {ev.spots<15&&<span style={{fontSize:11,color:red,fontFamily:FT,fontWeight:600}}>⚡ {ev.spots} мест</span>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  {ev.price===0
                    ?<div style={{background:`${green}15`,border:`0.5px solid ${green}25`,borderRadius:10,padding:'5px 10px'}}><span style={{fontSize:12,fontWeight:700,color:green,fontFamily:FD}}>Бесплатно</span></div>
                    :<div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{ev.price}₽</div>
                  }
                </div>
              </div>
              <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginTop:10,paddingTop:10,borderTop:'0.5px solid var(--es2)'}}>{ev.desc}</div>
            </div>
          </div>
        </div>)
        :<div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 20px',gap:12}}>
          <span style={{fontSize:40}}>📅</span>
          <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT}}>На этот день событий нет</div>
          <div style={{fontSize:13,color:l3,fontFamily:FT,textAlign:'center'}}>Попробуйте другую дату</div>
        </div>}
      </div>
    </div>
  </div>;
}

function FoodSC({push,pop,cart=[],addToCart}){
  const[cat,setCat]=useState('Все');
  const[search,setSearch]=useState('');
  const[sort,setSort]=useState('rating');
  const cats=['Все','Рестораны','Кафе','Улица','Чайные'];
  // ПОЛНЫЙ список заведений ЭТНОМИРА — источник: ethnomir.ru/restorany-i-kafe/
  const RESTAURANTS=[
    // ── РЕСТОРАНЫ ──
    {em:'🏰',n:'Ресторан «Дербент»',sub:'Кавказская кухня · Банкеты до 350 чел.',cat:'Рестораны',price:'500–1500₽',r:4.9,wait:'25 мин',
     dishes:['Хычины с сыром 350₽','Дагестанские пельмени 420₽','Долма 380₽','Шашлык из баранины 850₽'],
     color:'#8B4513',open:true,waitMin:25,hot:true,capacity:350,
     desc:'Главный ресторан ЭТНОМИРа в атмосфере Дербента. Банкеты, свадьбы, корпоративы до 350 гостей. Летняя веранда на 150 мест.'},
    {em:'🌻',n:'Ресторан «Корчма»',sub:'Украинская кухня · Домашний очаг · Банкеты',cat:'Рестораны',price:'400–900₽',r:4.8,wait:'20 мин',
     dishes:['Борщ с пампушками 320₽','Вареники 280₽','Деруны 260₽','Рулька свиная 890₽'],
     color:'#2D6A4F',open:true,waitMin:20,hot:true,capacity:80,
     desc:'Нарядная мазанка с настоящим украинским духом. Борщ с пампушками по рецепту шеф-повара, жаркое в горшочках, вареники с разными начинками.'},
    {em:'🍕',n:'Ресторан-пиццерия «Мука»',sub:'Итальянская кухня · Мастер-классы',cat:'Рестораны',price:'450–1100₽',r:4.7,wait:'15 мин',
     dishes:['Маргарита 620₽','Паста карбонара 580₽','Тирамису 280₽','Пицца детская 350₽'],
     color:'#009246',open:true,waitMin:15,hot:false,capacity:60,
     desc:'Атмосферное итальянское патио. Пицца и паста из твёрдых сортов пшеницы по старинным рецептам. Мастер-классы по лепке пиццы для детей.'},
    {em:'🫖',n:'Ресторан «Чайхана»',sub:'Узбекская кухня · Плов · Чайные церемонии',cat:'Рестораны',price:'350–900₽',r:4.8,wait:'20 мин',
     dishes:['Плов с бараниной 480₽','Самса 180₽','Лагман 380₽','Шурпа 320₽'],
     color:'#C2862A',open:true,waitMin:20,hot:true,capacity:100,
     desc:'Уютное восточное заведение для ценителей неторопливого отдыха. Настоящий узбекский плов, самса, лагман и чайные церемонии.'},
    {em:'🍛',n:'Ресторан «Индийская душа»',sub:'Аутентичная индийская кухня · Тандур',cat:'Рестораны',price:'400–1000₽',r:4.8,wait:'25 мин',
     dishes:['Butter Chicken 580₽','Палак Панир 420₽','Наан из тандура 90₽','Масала-чай 160₽'],
     color:'#FF9933',open:true,waitMin:25,hot:true,capacity:50,
     desc:'Аутентичный ресторан индийской кухни при Культурном центре Индии. Карри, тандурные блюда, масала. Специи и рецепты — прямо из Индии.'},
    {em:'🌿',n:'Ресторан «Океан и Я»',sub:'Здоровое питание · Морепродукты · Ферм. продукты',cat:'Рестораны',price:'500–2000₽',r:4.7,wait:'20 мин',
     dishes:['Сёмга на гриле 890₽','Боул с кускусом 480₽','Смузи 280₽','Авокадо-тост 320₽'],
     color:'#00BCD4',open:true,waitMin:20,hot:false,capacity:60,
     desc:'Ресторан здорового питания с фермерскими продуктами и блюдами из морепродуктов. Правильное питание без компромиссов со вкусом.'},
    {em:'🎤',n:'Ресторан и Karaoke «Оазис»',sub:'Европейская кухня · Конгресс-холл · Karaoke',cat:'Рестораны',price:'350–900₽',r:4.6,wait:'15 мин',
     dishes:['Цезарь 380₽','Стейк 890₽','Детское меню 280₽','Бизнес-ланч 350₽'],
     color:'#5B8DB8',open:true,waitMin:15,hot:false,capacity:120,
     desc:'Ресторан в конгресс-холле «Диалог культур». Полное меню + детские позиции + банкеты + меню karaoke-бара. На 1-м этаже.'},
    // ── КАФЕ ──
    {em:'🍲',n:'Кафе «Борщ»',sub:'Славянская кухня · В сердце украинского хутора',cat:'Кафе',price:'250–600₽',r:4.6,wait:'10 мин',
     dishes:['Борщ 280₽','Окрошка 220₽','Пирожки 80₽','Компот 90₽'],
     color:'#C0392B',open:true,waitMin:10,hot:false,capacity:50,
     desc:'Кафе в стилизованном интерьере украинского хутора. Душевное место для дружеской компании. Недорого, по-домашнему, вкусно.'},
    {em:'☕',n:'Кафе-пекарня «Этномир»',sub:'Кофе · Выпечка · Круассаны',cat:'Кафе',price:'150–500₽',r:4.6,wait:'5 мин',
     dishes:['Кофе 150₽','Круассан 120₽','Пирожное 180₽','Бизнес-ланч 300₽'],
     color:'#795548',open:true,waitMin:5,hot:false,capacity:40,
     desc:'Уютная кафе-пекарня — идеальное место для завтрака или кофе-паузы. Свежая выпечка каждое утро, ароматный кофе, лёгкие закуски.'},
    {em:'🧆',n:'Кафе «Кавказский дворик»',sub:'Кавказская домашняя кухня',cat:'Кафе',price:'350–800₽',r:4.7,wait:'20 мин',
     dishes:['Хычины 320₽','Долма 350₽','Шашлык куриный 520₽','Лаваш с сыром 160₽'],
     color:'#B85C38',open:true,waitMin:20,hot:false,capacity:70,
     desc:'Кафе национальной домашней кавказской кухни. Хычины, долма, шашлык — всё как у бабушки в горах. Кофе по-восточному.'},
    {em:'🏕️',n:'Кафе «Мудрый кочевник»',sub:'Сибирская и узбекская кухня',cat:'Кафе',price:'300–750₽',r:4.7,wait:'20 мин',
     dishes:['Позы (буузы) 350₽','Строганина 420₽','Чай с молоком 120₽','Пельмени сибирские 320₽'],
     color:'#6B4226',open:true,waitMin:20,hot:false,capacity:40,
     desc:'Уютный интерьер из натурального дерева. Блюда сибирской и узбекской кухни, запах тайги. Как в гостях у кочевника.'},
    {em:'🌲',n:'Кафе «Тайга»',sub:'На берегу лесного озера · Терраса над водой',cat:'Кафе',price:'300–800₽',r:4.8,wait:'15 мин',
     dishes:['Шашлык на мангале 580₽','Суп дня 250₽','Форель 720₽','Кофе 160₽'],
     color:'#2E7D32',open:true,waitMin:15,hot:true,capacity:80,
     desc:'Просторное кафе на берегу лесного озера с летней террасой прямо над водой. Рядом лодочная станция. Мангал, банкетный зал на летний сезон.'},
    {em:'🍷',n:'Кафе «Гандагана»',sub:'Грузинская кухня · Хачапури · Хинкали',cat:'Кафе',price:'400–1000₽',r:4.9,wait:'20 мин',
     dishes:['Хачапури аджарский 480₽','Хинкали 6 шт 380₽','Чахохбили 520₽','Шашлык 680₽'],
     color:'#C62828',open:true,waitMin:20,hot:true,capacity:60,
     desc:'Грузинский ресторан в павильоне «Вокруг света». Приправы и рецепты — из Грузии. Два зала: Дом Армении и Грузии с каменными стенами и квеври. Детское меню.'},
    // ── ЧАЙНЫЕ ──
    {em:'🍵',n:'Чайная «Турция и Азербайджан»',sub:'Восточное чаепитие · Пахлава · Кальян',cat:'Чайные',price:'150–500₽',r:4.7,wait:'5 мин',
     dishes:['Чай турецкий 120₽','Пахлава 180₽','Рахат-лукум 160₽','Кофе по-восточному 180₽'],
     color:'#E53935',open:true,waitMin:5,hot:false,capacity:30,
     desc:'Восточная чайная с традиционным турецким и азербайджанским чаем, сладостями и кальяном. Атмосфера восточного базара.'},
    {em:'🌸',n:'Кофейня «Восторг-Небо»',sub:'В Культурном центре Индии · Масала-чай',cat:'Чайные',price:'150–500₽',r:4.8,wait:'5 мин',
     dishes:['Масала-чай 180₽','Авторский кофе 200₽','Выпечка 150₽','Индийские сладости 180₽'],
     color:'#FF8F00',open:true,waitMin:5,hot:false,capacity:20,
     desc:'Кофейня в Культурном центре Индии. Наследница легендарного кафе Ecstasy-Sky из Цюриха. Мягкие тона, золотые акценты, аромат индийских благовоний. Уголок индийских сувениров.'},
    // ── УЛИЦА / СТРИТ-ФУД ──
    {em:'🌯',n:'Кафе Burrito\'s',sub:'Мексиканские буррито · Стрит-фуд',cat:'Улица',price:'250–500₽',r:4.5,wait:'5 мин',
     dishes:['Буррито с курицей 350₽','Начос 280₽','Такос 320₽','Лимонад 120₽'],
     color:'#FF6B35',open:true,waitMin:5,hot:false,capacity:20,
     desc:'Яркое кафе мексиканской уличной еды. Буррито, начос, такос — быстро, сытно, с огоньком.'},
    {em:'🧇',n:'Кафе Waffle',sub:'Вафли · Блины · Десерты',cat:'Улица',price:'150–400₽',r:4.6,wait:'5 мин',
     dishes:['Венские вафли 280₽','Блинчики 220₽','Мороженое 150₽','Горячий шоколад 180₽'],
     color:'#F9A825',open:true,waitMin:5,hot:false,capacity:15,
     desc:'Уютный уголок с горячими вафлями, блинами и десертами. Идеально для сладкого перекуса во время прогулки.'},
    {em:'🍦',n:'«Сладкий островок»',sub:'Жареное мороженое · Уникальное лакомство',cat:'Улица',price:'150–350₽',r:4.7,wait:'3 мин',
     dishes:['Жареное мороженое 250₽','Мороженое 150₽','Фруктовый лёд 120₽'],
     color:'#E91E63',open:true,waitMin:3,hot:false,capacity:0,
     desc:'Уникальный островок жареного мороженого — самого необычного десерта в парке. Смотришь как делают и тут же пробуешь!'},
    {em:'🏕️',n:'Летнее кафе «С Бобром за столом»',sub:'Сезонное · Природная атмосфера',cat:'Улица',price:'200–600₽',r:4.5,wait:'10 мин',
     dishes:['Шашлык 480₽','Пирожки 90₽','Квас 80₽','Чай 100₽'],
     color:'#5D4037',open:false,waitMin:0,hot:false,capacity:40,
     desc:'Летнее кафе с природной атмосферой. Открыто в тёплый сезон. Лесные блюда, посиделки у огня, добродушный «Бобёр» встречает гостей.'},
  ];
  const FEATURED=[
    {em:'🏰',n:'Хычины с сыром',p:350,r:'Дербент',color:'#8B4513',badge:'🔥 Хит'},
    {em:'🍷',n:'Хачапури аджарский',p:480,r:'Гандагана',color:'#C62828',badge:'⭐ Топ'},
    {em:'🍕',n:'Пицца Маргарита',p:620,r:'Мука',color:'#009246',badge:'👶 М-класс'},
    {em:'🍛',n:'Butter Chicken',p:580,r:'Инд. душа',color:'#FF9933',badge:'🌶 Острое'},
    {em:'🌲',n:'Форель на мангале',p:720,r:'Тайга',color:'#2E7D32',badge:'🏞 На озере'},
  ];
  let shown=RESTAURANTS.filter(r=>
    (cat==='Все'||r.cat===cat)&&
    (!search||r.n.toLowerCase().includes(search.toLowerCase())||r.sub.toLowerCase().includes(search.toLowerCase())||r.desc.toLowerCase().includes(search.toLowerCase()))
  );
  if(sort==='rating') shown=[...shown].sort((a,b)=>b.r-a.r);
  else if(sort==='fast') shown=[...shown].sort((a,b)=>{if(!a.open&&b.open)return 1;if(a.open&&!b.open)return -1;return a.waitMin-b.waitMin;});
  else if(sort==='price') shown=[...shown].sort((a,b)=>parseInt(a.price)-parseInt(b.price));

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?8:0}}>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Рестораны · Кафе</div>
        <div style={{fontSize:12,color:green,fontFamily:FT,marginTop:1}}>● {RESTAURANTS.filter(r=>r.open).length} открыто · {RESTAURANTS.length} заведений</div>
      </div>
    </div>

    {/* Search */}
    <div style={{padding:'10px 20px 0'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,background:'var(--ef2)',borderRadius:14,padding:'10px 14px',border:'0.5px solid var(--es2)'}}>
        <Ic.search s={14} c={l3}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Кухня, блюдо, ресторан…" style={{flex:1,fontSize:14,color:l1,fontFamily:FT,background:'transparent'}}/>
        {search&&<div onClick={()=>setSearch('')} className="eth-tap" style={{fontSize:16,color:l3,cursor:'pointer',lineHeight:1}}>✕</div>}
      </div>
    </div>

    {/* Sort chips */}
    <div style={{padding:'8px 20px 0',display:'flex',gap:8}}>
      {[['rating','⭐ Рейтинг'],['fast','⚡ Быстро'],['price','💰 Цена']].map(([id,lbl])=>(
        <div key={id} onClick={()=>setSort(id)} className="eth-tap" style={{borderRadius:10,padding:'6px 12px',background:sort===id?blue:'var(--ef2)',border:sort===id?'none':'0.5px solid var(--es2)',cursor:'pointer'}}>
          <span style={{fontSize:11,fontWeight:600,color:sort===id?'#fff':l2,fontFamily:FT}}>{lbl}</span>
        </div>
      ))}
    </div>

    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>

      {/* Featured dishes carousel */}
      {!search&&<div style={{padding:'14px 0 0'}}>
        <div style={{padding:'0 20px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FT}}>🔥 Хиты кухни</div>
          <span style={{fontSize:11,color:l3,fontFamily:FT}}>Топ блюда</span>
        </div>
        <div style={{display:'flex',gap:10,padding:'0 20px',overflowX:'auto',scrollbarWidth:'none'}}>
          {FEATURED.map((d,i)=>(
            <div key={i} onClick={()=>push('food')} className="eth-tap" style={{flexShrink:0,width:130,background:'var(--ef2)',borderRadius:16,overflow:'hidden',border:'0.5px solid var(--es2)',cursor:'pointer'}}>
              <div style={{height:66,background:`${d.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,position:'relative'}}>
                {d.em}
                <div style={{position:'absolute',top:5,left:5,background:d.color,borderRadius:5,padding:'2px 5px'}}>
                  <span style={{fontSize:8,fontWeight:700,color:'#fff',fontFamily:FT}}>{d.badge}</span>
                </div>
              </div>
              <div style={{padding:'7px 9px'}}>
                <div style={{fontSize:10,fontWeight:600,color:l1,fontFamily:FT,lineHeight:1.3,marginBottom:4}}>{d.n}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:700,color:l1,fontFamily:FD}}>{d.p}₽</span>
                  <div onClick={e=>{e.stopPropagation();addToCart&&addToCart({id:'dish_'+i,name:d.n,emoji:d.em,price:d.p,category:'food',source:d.r});}} className="eth-tap" style={{width:22,height:22,borderRadius:7,background:blue,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#fff'}}>+</div>
                </div>
                <div style={{fontSize:9,color:l3,fontFamily:FT,marginTop:2}}>{d.r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* Category filter */}
      <div style={{padding:'12px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {cats.map(c=><div key={c} onClick={()=>setCat(c)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'6px 14px',cursor:'pointer',background:cat===c?l1:'var(--ef2)',border:cat===c?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:11,fontFamily:FT,fontWeight:cat===c?600:400,color:cat===c?bg:l2}}>{c}</span>
        </div>)}
      </div>

      {/* Restaurant cards */}
      <div style={{padding:'10px 20px',display:'flex',flexDirection:'column',gap:10}}>
        {shown.length===0&&<div style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:40,marginBottom:10}}>🔍</div>
          <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT}}>Ничего не найдено</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:4}}>Попробуйте другой запрос</div>
        </div>}
        {shown.map((r,i)=><div key={i} onClick={()=>push('restaurant',{restaurant:r})} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer',opacity:r.open?1:.6}}>
          <div style={{height:3,background:`linear-gradient(90deg,${r.color},${r.color}44)`}}/>
          <div style={{padding:'13px 15px'}}>
            <div style={{display:'flex',gap:11,marginBottom:8}}>
              <div style={{width:52,height:52,borderRadius:15,background:`${r.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:25,flexShrink:0,border:`0.5px solid ${r.color}20`}}>{r.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2,lineHeight:1.2}}>{r.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:4,lineHeight:1.3}}>{r.sub}</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                  <span style={{fontSize:11,color:'#FFD60A'}}>★ {r.r}</span>
                  {r.open&&<span style={{fontSize:10,color:l3,fontFamily:FT}}>⏱ {r.wait}</span>}
                  <span style={{fontSize:10,color:l3,fontFamily:FT}}>{r.price}</span>
                  {r.hot&&<span style={{fontSize:9,background:`${red}15`,color:red,borderRadius:5,padding:'1px 5px',fontFamily:FT,fontWeight:700}}>🔥</span>}
                </div>
              </div>
              <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <div style={{width:6,height:6,borderRadius:3,background:r.open?green:red}}/>
                  <span style={{fontSize:9,color:r.open?green:red,fontFamily:FT,fontWeight:600}}>{r.open?'Открыт':'Закрыт'}</span>
                </div>
                <div style={{fontSize:9,background:`${r.color}12`,color:r.color,borderRadius:6,padding:'2px 7px',fontFamily:FT,fontWeight:600}}>{r.cat}</div>
              </div>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.45,marginBottom:8}}>{r.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {r.dishes.map((d,j)=><div key={j} style={{background:'var(--ef3)',borderRadius:7,padding:'3px 8px'}}><span style={{fontSize:9,color:l2,fontFamily:FT}}>{d}</span></div>)}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}


function SpaSC({push,pop}){
  const[cat,setCat]=useState('all');
  // Реальные услуги СПА-центра «Океания» — ЭТНОМИР
  // Источник: ethnomir.ru/posetitelyam/health/spa-tsentr-okeaniya/
  const cats=['all','массаж','обёртывание','уход за лицом','программы'];
  const ITEMS=[
    // ── МАССАЖИ ──
    {em:'💆',name:'Массаж тела классический',sub:'Расслабляющий · Всё тело',price:3500,dur:'60 мин',cat:'массаж',r:4.9,color:'#FF9500',
     feats:['Опытный массажист','Ароматические масла','Приватный кабинет'],
     fact:'Снимает мышечное напряжение, улучшает кровообращение'},
    {em:'🏋️',name:'Массаж тела антицеллюлитный',sub:'Коррекция фигуры · Моделирование',price:3800,dur:'60 мин',cat:'массаж',r:4.8,color:'#FF6B35',
     feats:['Глубокая проработка','Улучшение рельефа','Курс или разово'],
     fact:'Видимый результат уже после 5–7 сеансов'},
    {em:'🪨',name:'Стоун-массаж',sub:'Горячие базальтовые камни',price:4200,dur:'75 мин',cat:'массаж',r:4.9,color:'#636366',
     feats:['Базальтовые камни','Масло лаванды','Глубокое расслабление'],
     fact:'Прогревает мышцы и суставы в глубину'},
    {em:'🌿',name:'Лимфодренажный массаж',sub:'Дренаж + детокс · Облегчение ног',price:3600,dur:'60 мин',cat:'массаж',r:4.7,color:'#30D158',
     feats:['Уменьшение отёков','Детокс организма','Лёгкость в ногах'],
     fact:'Особенно эффективен при отёчности'},
    {em:'🙆',name:'Массаж лица уходовый',sub:'Расслабление + лифтинг · 30 мин',price:2300,dur:'30 мин',cat:'уход за лицом',r:4.9,color:'#E91E63',
     feats:['Уходовый или омолаживающий','Лифтинг эффект','Без аппаратов'],
     fact:'Улучшает тонус и цвет кожи с первого сеанса'},
    // ── ОБЁРТЫВАНИЯ И ТЕЛО ──
    {em:'🌊',name:'Иммерсионная ванна «Сон в невесомости»',sub:'Флоатинг · Полное расслабление',price:3900,dur:'60 мин',cat:'обёртывание',r:5.0,color:'#5E5CE6',
     feats:['Состояние невесомости','Соляной раствор','Полная темнота и тишина'],
     fact:'Устраняет боли в спине, снимает стресс, перезагружает нервную систему'},
    {em:'🌲',name:'Кедровая бочка',sub:'Фитотерапия · Прогревание · Детокс',price:1800,dur:'20 мин',cat:'обёртывание',r:4.8,color:'#8D6E63',
     feats:['Травяные настои','Прогревание тела','Выведение токсинов'],
     fact:'Улучшает обмен веществ, укрепляет иммунитет'},
    {em:'🍫',name:'Обёртывание тела',sub:'Шоколадное · Грязевое · Водорослевое',price:3200,dur:'45 мин',cat:'обёртывание',r:4.8,color:'#C2862A',
     feats:['Выбор состава','Пилинг до процедуры','Питание и увлажнение'],
     fact:'Подтягивает кожу, уменьшает целлюлит'},
    {em:'💧',name:'Прессотерапия',sub:'Аппаратный лимфодренаж · Антицеллюлит',price:2500,dur:'30 мин',cat:'обёртывание',r:4.7,color:'#64D2FF',
     feats:['Аппаратный лимфодренаж','Костюм-манжеты','Быстрый результат'],
     fact:'Аппаратный аналог лимфодренажного массажа'},
    // ── УХОД ЗА ЛИЦОМ ──
    {em:'✨',name:'Чистка лица аппаратная',sub:'Механическая или ультразвуковая · 45 мин',price:3000,dur:'45 мин',cat:'уход за лицом',r:4.8,color:'#BF5AF2',
     feats:['Аппаратная чистка','Глубокое очищение','3600 мех / 3000 узи'],
     fact:'Подходит для всех типов кожи'},
    {em:'🧴',name:'Чистка лица + альгинатная маска',sub:'Глубокий уход · 60 мин',price:4100,dur:'60 мин',cat:'уход за лицом',r:4.9,color:'#FF2D55',
     feats:['Чистка + маска','Альгинат = морские водоросли','Увлажнение и лифтинг'],
     fact:'Комплексный уход — чистота и сияние'},
    {em:'🌺',name:'Маска тканевая / альгинатная',sub:'Экспресс-уход · 20 мин',price:1000,dur:'20 мин',cat:'уход за лицом',r:4.7,color:'#FF9500',
     feats:['Тканевая 1000₽','Альгинатная 1600₽','Питание и увлажнение'],
     fact:'Экспресс-уход между процедурами'},
    // ── ПРОГРАММЫ ──
    {em:'🌸',name:'СПА-программа «Афродита»',sub:'Красота и молодость · Комплекс',price:7500,dur:'2.5 ч',cat:'программы',r:4.9,color:'#E91E63',
     feats:['Массаж тела','Обёртывание','Уход за лицом'],
     fact:'Комплексная программа красоты для женщин'},
    {em:'💫',name:'СПА-программа «Сияние»',sub:'Лифтинг + детокс · Комплекс',price:6800,dur:'2 ч',cat:'программы',r:4.9,color:'#BF5AF2',
     feats:['Кедровая бочка','Обёртывание','Маска для лица'],
     fact:'Восстанавливает сияние и молодость кожи'},
    {em:'💪',name:'СПА-программа «Богатырское здоровье»',sub:'Для мужчин · Тонус и сила',price:6200,dur:'2 ч',cat:'программы',r:4.8,color:'#FF6B35',
     feats:['Классический массаж','Прессотерапия','Кедровая бочка'],
     fact:'Специально разработана для мужчин'},
  ];

  const shown=cat==='all'?ITEMS:ITEMS.filter(it=>it.cat===cat);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="СПА «Океания»" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>

      {/* Hero */}
      <div style={{
        background:'linear-gradient(160deg,#0d0a2e,#1a1060,#0a2040)',
        padding:'22px 20px 20px',position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:-30,right:-30,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(94,92,230,.35) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-20,left:10,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,45,85,.2) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT,letterSpacing:'.6px',textTransform:'uppercase',marginBottom:4}}>ЭТНОМИР · Подмосковье</div>
          <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:2}}>СПА-центр «Океания»</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginBottom:14}}>Массажи · Флоатинг · Обёртывания · Уход за лицом</div>
          <div style={{display:'flex',gap:8}}>
            {[['💆','14 процедур'],['🛁','Флоатинг'],['⭐','4.9']].map(([em,t],i)=><div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:13}}>{em}</span>
              <span style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT}}>{t}</span>
            </div>)}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{padding:'14px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {cats.map(c=><div key={c} onClick={()=>setCat(c)} className="eth-tap" style={{
          flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',
          background:cat===c?l1:'var(--ef2)',
          border:cat===c?'none':'0.5px solid var(--es2)',
          transition:'all .2s cubic-bezier(.34,1.3,.64,1)',
        }}>
          <span style={{fontSize:11,fontFamily:FT,fontWeight:cat===c?600:400,color:cat===c?bg:l2,whiteSpace:'nowrap'}}>
            {c==='all'?'Все':c.charAt(0).toUpperCase()+c.slice(1)}
          </span>
        </div>)}
      </div>

      {/* Cards */}
      <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {shown.map((it,i)=><div key={i} onClick={()=>push('booking',{service:it,title:it.name})} className="eth-tap eth-specular" style={{
          borderRadius:20,overflow:'hidden',cursor:'pointer',
          background:'var(--ef2)',border:'0.5px solid var(--es2)',
        }}>
          <div style={{height:4,background:`linear-gradient(90deg,${it.color},${it.color}55)`}}/>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:12,marginBottom:10}}>
              <div style={{
                width:52,height:52,borderRadius:16,flexShrink:0,
                background:`linear-gradient(135deg,${it.color}22,${it.color}0a)`,
                border:`0.5px solid ${it.color}30`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
              }}>{it.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px',lineHeight:1.3}}>{it.name}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>{it.sub}</div>
                <div style={{display:'flex',gap:10,marginTop:5}}>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {it.dur}</span>
                  <span style={{fontSize:11,color:'#FFD60A',fontFamily:FT}}>★ {it.r}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px'}}>{it.price.toLocaleString('ru')}₽</div>
                <div style={{fontSize:9,color:it.color,fontFamily:FT,marginTop:2,fontWeight:600}}>Записаться</div>
              </div>
            </div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
              {it.feats.map((f,j)=><div key={j} style={{
                background:`${it.color}10`,border:`0.5px solid ${it.color}22`,
                borderRadius:8,padding:'2px 8px',
              }}>
                <span style={{fontSize:10,color:it.color,fontFamily:FT,fontWeight:500}}>{f}</span>
              </div>)}
            </div>
            <div style={{background:'var(--ef3)',borderRadius:10,padding:'7px 11px',display:'flex',alignItems:'center',gap:7}}>
              <span style={{fontSize:11}}>💡</span>
              <span style={{fontSize:11,color:l3,fontFamily:FT,fontStyle:'italic',lineHeight:1.4}}>{it.fact}</span>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function McSC({push,pop}){
  const[cat,setCat]=useState('Все');
  const cats=['Все','Куклы','Ремёсла','Роспись'];
  // Реальные мастер-классы ЭТНОМИРА (источник: ethnomir.ru/posetitelyam/master-class/)
  const MCS=[
    // Народные куклы — мастерская «Народные промыслы»
    {em:'🪆',n:'Зайчик-на-пальчик',sub:'Тряпичная кукла · Без ножниц',cat:'Куклы',dur:'20 мин',p:100,r:4.9,
     color:'#E91E63',age:'3+',level:'Все',included:['Материал','Готовая кукла'],
     desc:'Простейшая народная кукла — мотанка. Подходит даже дошкольникам. Без иголки и ножниц, только руки.'},
    {em:'🌾',n:'Стригушка из лыка',sub:'Природный материал · Славянская традиция',cat:'Куклы',dur:'20 мин',p:200,r:4.8,
     color:'#C2862A',age:'5+',level:'Все',included:['Лыко','Готовая кукла'],
     desc:'Кукла из ржаной соломы и лыка — одна из старейших тряпичных кукол Руси.'},
    {em:'💃',n:'Хороводница',sub:'Кукла с широкой юбкой · На радость',cat:'Куклы',dur:'25 мин',p:200,r:4.9,
     color:'#E91E63',age:'5+',level:'Все',included:['Ткань','Нитки','Готовая кукла'],
     desc:'Обрядовая кукла — символ хоровода и праздника. Широкая юбка, яркие цвета, не разлей вода с детьми.'},
    {em:'🌿',n:'Кубышка-травница',sub:'Кукла-оберег · Ароматная',cat:'Куклы',dur:'30 мин',p:300,r:4.9,
     color:'#5F7D5A',age:'6+',level:'Все',included:['Ткань','Травы','Оберег домой'],
     desc:'Кукла-оберег с ароматными травами внутри. Дома ставят у кровати или на полочку — очищает воздух и несёт покой.'},
    {em:'👵',n:'Баба Яга',sub:'Игровая кукла · Характерная',cat:'Куклы',dur:'30 мин',p:300,r:4.8,
     color:'#8B4513',age:'6+',level:'Все',included:['Все материалы','Готовая кукла'],
     desc:'Сказочный персонаж из лоскутков и природных материалов. Каждая получается неповторимой — как и сама Яга.'},
    {em:'🌰',n:'Крупеничка (Зерновушка)',sub:'Кукла достатка · Семейный оберег',cat:'Куклы',dur:'30 мин',p:400,r:4.9,
     color:'#C2862A',age:'6+',level:'Все',included:['Ткань','Зерно','Оберег'],
     desc:'Кукла-мешочек с зерном — символ урожая и сытости. Стоит в доме и «притягивает» достаток.'},
    {em:'🏠',n:'Берегиня дома',sub:'Большая кукла · 2.5 ч · Углублённая',cat:'Куклы',dur:'2.5 ч',p:1400,r:4.9,
     color:'#7B0000',age:'10+',level:'Продвинутый',included:['Все материалы','Кукла 30 см','Чай'],
     desc:'Главный оберег славянского дома высотой 30 см. Занятие для тех, кто хочет углублённо изучить традицию. Мастер рассказывает историю каждого элемента.'},
    // Гончарное и керамика
    {em:'🏺',n:'Гончарный круг',sub:'Лепка сосуда · Настоящий круг',cat:'Ремёсла',dur:'1.5 ч',p:800,r:4.9,
     color:'#8B4513',age:'5+',level:'Все',included:['Глина','Фартук','Изделие на обжиг'],
     desc:'Настоящий гончарный круг, настоящая глина. Лепите миску, кружку или вазу. Мастер помогает. Изделие обожгут и можно забрать через неделю.'},
    {em:'🎶',n:'Глиняная свистулька',sub:'45 мин · Дымковская игрушка',cat:'Ремёсла',dur:'45 мин',p:350,r:4.9,
     color:'#E53935',age:'4+',level:'Все',included:['Глина','Краски','Свистулька'],
     desc:'Каргопольская, филимоновская, романовская, хлудневская — выберете тип и сделаете под руководством мастера. Каждая игрушка уникальна.'},
    // Роспись
    {em:'🎨',n:'Городецкая роспись',sub:'Русский орнамент · По дереву',cat:'Роспись',dur:'1.5 ч',p:600,r:4.8,
     color:'#E91E63',age:'6+',level:'Все',included:['Заготовка','Краски','Кисти','Готовое изделие'],
     desc:'Яркий городецкий узор: розы, конь, птица. Роспись на деревянной разделочной доске или шкатулке. Уносите домой.'},
    {em:'🌺',n:'Батик — роспись по ткани',sub:'Горячий воск + краска',cat:'Роспись',dur:'2 ч',p:1200,r:4.8,
     color:'#BF5AF2',age:'8+',level:'Все',included:['Ткань','Воск','Краски','Свой батик'],
     desc:'Горячий воск + яркие краски = уникальный рисунок. Шарф или платок — на ваш выбор. Техника народов Юго-Восточной Азии.'},
    // Другие ремёсла
    {em:'🧶',n:'Ткачество на раме',sub:'Традиционный орнамент · Пояс',cat:'Ремёсла',dur:'2 ч',p:700,r:4.8,
     color:'#E91E63',age:'8+',level:'Начинающий',included:['Нитки','Рама','Готовый пояс'],
     desc:'Народное ткачество — пояс с традиционным русским орнаментом. Уносите сотканный фрагмент домой.'},
    {em:'🕯️',n:'Изготовление свечи из воска',sub:'Декоративная · Ароматная',cat:'Ремёсла',dur:'45 мин',p:400,r:4.8,
     color:'#C2862A',age:'4+',level:'Все',included:['Воск','Ароматизатор','Форма','Свечка'],
     desc:'Натуральный пчелиный воск, ароматические масла, декоративные элементы. Свечу сразу уносите с собой.'},
    {em:'🌿',n:'Береста — шкатулка или туес',sub:'Уральские традиции',cat:'Ремёсла',dur:'2 ч',p:900,r:4.7,
     color:'#5F7D5A',age:'10+',level:'Начинающий',included:['Береста','Инструменты','Готовое изделие'],
     desc:'Уральское плетение из берёзовой коры. Традиция русского Севера — туес, шкатулка, корзинка.'},
    {em:'🐑',n:'Валяние из шерсти',sub:'Войлочная игрушка или брошь',cat:'Ремёсла',dur:'2 ч',p:800,r:4.8,
     color:'#8B4513',age:'6+',level:'Все',included:['Шерсть','Иглы','Готовое изделие'],
     desc:'Мокрое или сухое валяние. Войлочная игрушка или брошь для ежедневного ношения. Тёплое и живое.'},
  ];
  const shown=cat==='Все'?MCS:MCS.filter(m=>m.cat===cat);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Мастер-классы" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#1a0a2e,#2d1b69,#4a1b6e)',padding:'20px 20px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-15,bottom:-15,fontSize:80,opacity:.12}}>🎨</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>Ремёсла · Кулинария · Искусство</div>
        <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>Мастер-классы</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginBottom:16}}>40+ программ · Каждый день · Уносишь всё что сделал</div>
        <div style={{display:'flex',gap:10}}>
          {[['🎯','40+ программ'],['👨‍🏫','Мастера мирового уровня'],['🎁','Всё включено']].map(([em,t],i)=>
            <div key={i} style={{flex:1,background:'rgba(255,255,255,.1)',backdropFilter:'blur(8px)',borderRadius:12,padding:'10px 8px',textAlign:'center',border:'0.5px solid rgba(255,255,255,.15)'}}>
              <div style={{fontSize:16,marginBottom:3}}>{em}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.3}}>{t}</div>
            </div>)}
        </div>
      </div>
      <div style={{padding:'12px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {cats.map(c=><div key={c} onClick={()=>setCat(c)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',background:cat===c?l1:'var(--ef2)',border:cat===c?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:cat===c?600:400,color:cat===c?bg:l2}}>{c}</span>
        </div>)}
      </div>
      <div style={{padding:'12px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {shown.map((mc,i)=><div key={i} onClick={()=>push('booking',{service:mc,title:mc.n})} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:`0.5px solid ${mc.color}20`,overflow:'hidden',cursor:'pointer'}}>
          <div style={{height:3,background:`linear-gradient(90deg,${mc.color},${mc.color}44)`}}/>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:12,marginBottom:10}}>
              <div style={{width:54,height:54,borderRadius:16,background:`${mc.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{mc.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2}}>{mc.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:5}}>{mc.sub}</div>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {mc.dur}</span>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>👶 {mc.age}</span>
                  <span style={{fontSize:11,color:'#FFD60A'}}>★ {mc.r}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{mc.p}₽</div>
                <div style={{fontSize:10,color:mc.color,fontFamily:FT,fontWeight:600,marginTop:2}}>Записаться</div>
              </div>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{mc.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {mc.included.map((inc,j)=><div key={j} style={{background:`${mc.color}10`,border:`0.5px solid ${mc.color}20`,borderRadius:8,padding:'3px 8px',display:'flex',gap:4}}>
                <span style={{fontSize:9,color:mc.color}}>✓</span>
                <span style={{fontSize:10,color:l2,fontFamily:FT}}>{inc}</span>
              </div>)}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function GlampingSC({push,pop}){
  const[type,setType]=useState('all');
  const types=['all','Шатры','Юрты','Домики','VIP'];
  const TENTS=[
    {em:'⛺',n:'Сафари-шатёр «Саванна»',sub:'Двуспальный · Террасса · Хаски рядом',
     p:5800,cap:2,r:4.9,type:'Шатры',tag:'Хит',
     grad:'linear-gradient(135deg,#1a3a1a,#2D5016)',
     feats:['Двуспальная кровать','Электричество','Отопление','Завтрак'],
     desc:'Premium-шатёр в скандинавском стиле с тёплым полом и панорамным окном в потолке'},
    {em:'🏕',n:'Юрта «Казахский двор»',sub:'Традиционная · Войлок · Очаг',
     p:4200,cap:4,r:4.8,type:'Юрты',tag:null,
     grad:'linear-gradient(135deg,#2D3A00,#4A5A00)',
     feats:['Войлочный декор','Очаг','Кумыс утром','Тихая зона'],
     desc:'Настоящая юрта из натуральных материалов. Спать под звук степного ветра'},
    {em:'🌲',n:'Домик «Северный лес»',sub:'Сосновый сруб · Баня · Лес',
     p:7200,cap:6,r:4.9,type:'Домики',tag:'Топ',
     grad:'linear-gradient(135deg,#0a2010,#1B4332)',
     feats:['Камин','Собственная баня','Кухня','Мангал'],
     desc:'Трёхкомнатный дом-сруб в сосновом лесу. Собственная банька и мангальная зона'},
    {em:'🌙',n:'Купольный домик «Звёзды»',sub:'Прозрачный потолок · Джакузи',
     p:12500,cap:2,r:5.0,type:'VIP',tag:'Уникальный',
     grad:'linear-gradient(135deg,#0a0a1a,#1a1a3a)',
     feats:['Прозрачный купол','Джакузи','Завтрак в номер','Личный гид'],
     desc:'Спать под звёздным небом в стеклянном куполе. Джакузи на открытом воздухе'},
    {em:'🏔',n:'Шале «Альпы»',sub:'Тирольский стиль · Горный вид · 2 эт',
     p:9800,cap:4,r:4.9,type:'VIP',tag:null,
     grad:'linear-gradient(135deg,#1a3a8a,#2980B9)',
     feats:['2 спальни','Балкон','Камин','Вид на парк'],
     desc:'Двухэтажный дом в альпийском стиле с видом на этно-парк и горизонт'},
    {em:'🛶',n:'Плавучий домик',sub:'На воде · Озеро · Романтика',
     p:8900,cap:2,r:4.8,type:'Домики',tag:'Эксклюзив',
     grad:'linear-gradient(135deg,#0a2040,#0E4D92)',
     feats:['Вода вокруг','Лодка в аренду','Рыбалка','Рассвет на озере'],
     desc:'Уникальный домик на воде — просыпаться под плеск волн у берегов озера'},
  ];
  const shown=type==='all'?TENTS:TENTS.filter(t=>t.type===type);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Глэмпинг" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#0a1f0a,#1B4332,#2D5016)',padding:'20px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-20,top:-20,fontSize:80,opacity:.08}}>⛺</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>Шатры · Юрты · Домики</div>
        <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>Глэмпинг в Этномире</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginBottom:14}}>Природа без отказа от комфорта · 6 видов размещения</div>
        <div style={{display:'flex',gap:10}}>
          {[['🌟','6 видов'],['🌙','Ночь от 4 200₽'],['⭐','4.9 рейтинг']].map(([em,t],i)=><div key={i} style={{flex:1,background:'rgba(255,255,255,.1)',backdropFilter:'blur(8px)',borderRadius:10,padding:'8px 6px',textAlign:'center',border:'0.5px solid rgba(255,255,255,.15)'}}>
            <div style={{fontSize:14,marginBottom:2}}>{em}</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.75)',fontFamily:FT,lineHeight:1.3}}>{t}</div>
          </div>)}
        </div>
      </div>
      <div style={{padding:'12px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {types.map(t=><div key={t} onClick={()=>setType(t)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',background:type===t?l1:'var(--ef2)',border:type===t?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:type===t?600:400,color:type===t?bg:l2}}>{t==='all'?'Все':t}</span>
        </div>)}
      </div>
      <div style={{padding:'12px 20px',display:'flex',flexDirection:'column',gap:16}}>
        {shown.map((t,i)=><div key={i} onClick={()=>push('booking',{service:t,title:t.n})} className="eth-tap" style={{borderRadius:22,overflow:'hidden',cursor:'pointer',boxShadow:'0 4px 20px rgba(0,0,0,.15)'}}>
          <div style={{background:t.grad,padding:'18px 18px 16px',position:'relative',overflow:'hidden',minHeight:110}}>
            <div style={{position:'absolute',right:-10,bottom:-10,fontSize:60,opacity:.2}}>{t.em}</div>
            {t.tag&&<div style={{display:'inline-flex',background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',borderRadius:10,padding:'3px 10px',border:'0.5px solid rgba(255,255,255,.3)',marginBottom:8}}>
              <span style={{fontSize:10,color:'#fff',fontFamily:FT,fontWeight:600}}>{t.tag}</span>
            </div>}
            <div style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.3px',marginBottom:3,position:'relative'}}>{t.n}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT,marginBottom:10,position:'relative'}}>{t.sub}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',position:'relative'}}>
              {t.feats.map((f,j)=><div key={j} style={{background:'rgba(255,255,255,.14)',backdropFilter:'blur(6px)',borderRadius:8,padding:'2px 8px',border:'0.5px solid rgba(255,255,255,.2)'}}>
                <span style={{fontSize:9,color:'rgba(255,255,255,.9)',fontFamily:FT}}>{f}</span>
              </div>)}
            </div>
          </div>
          <div style={{background:'var(--ef2)',padding:'12px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:2}}>{t.desc.slice(0,50)}…</div>
              <div style={{display:'flex',gap:8}}>
                <span style={{fontSize:12,color:'#FFD60A'}}>★ {t.r}</span>
                <span style={{fontSize:11,color:l3,fontFamily:FT}}>👥 до {t.cap} гостей</span>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
              <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>{t.p.toLocaleString('ru')}₽</div>
              <div style={{fontSize:10,color:l3,fontFamily:FT}}>/ ночь</div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function RentalSC({push,pop}){
  const[cat,setCat]=useState('all');
  const cats=['all','Транспорт','Спорт','Детям','Пикник'];
  const ITEMS=[
    {em:'🚲',n:'Городской велосипед',sub:'7-скоростной · Взрослый',p:300,unit:'час',cat:'Транспорт',avail:12,color:green,deposit:1500},
    {em:'⚡',n:'Электросамокат',sub:'Xiaomi · до 25 км/ч',p:250,unit:'час',cat:'Транспорт',avail:8,color:blue,deposit:2000},
    {em:'🛴',n:'Детский самокат',sub:'До 12 лет · С регулировкой',p:150,unit:'час',cat:'Детям',avail:15,color:yellow,deposit:500},
    {em:'🏕',n:'Велокартинг',sub:'Педальный · Трасса 500м',p:400,unit:'30 мин',cat:'Спорт',avail:6,color:orange,deposit:0},
    {em:'🛶',n:'Лодка на вёслах',sub:'На 2–4 человека · Озеро',p:500,unit:'час',cat:'Транспорт',avail:4,color:teal,deposit:2000},
    {em:'🏹',n:'Лук и стрелы',sub:'Спортивный · Инструктаж',p:350,unit:'30 мин',cat:'Спорт',avail:10,color:red,deposit:0},
    {em:'🥊',n:'Кайтбординг-симулятор',sub:'Для начинающих',p:600,unit:'час',cat:'Спорт',avail:2,color:purple,deposit:1000},
    {em:'🧺',n:'Пикник-сет',sub:'Плед + посуда + корзина',p:600,unit:'день',cat:'Пикник',avail:20,color:'#8D6E63',deposit:1000},
    {em:'🎯',n:'Дротики + мишень',sub:'Дартс · Профессиональные',p:200,unit:'час',cat:'Спорт',avail:8,color:orange,deposit:0},
    {em:'⚽',n:'Спортинвентарь',sub:'Мяч + кегли + бадминтон',p:300,unit:'час',cat:'Спорт',avail:5,color:green,deposit:500},
    {em:'🎠',n:'Детская лошадка',sub:'Механическая · Для малышей',p:100,unit:'5 мин',cat:'Детям',avail:3,color:pink,deposit:0},
    {em:'🏕',n:'Мангал + уголь',sub:'Гриль-зона · Стол + лавки',p:800,unit:'день',cat:'Пикник',avail:8,color:red,deposit:500},
  ];
  const shown=cat==='all'?ITEMS:ITEMS.filter(i=>i.cat===cat);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Прокат" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#0a2010,#1B4332,#2D5A27)',padding:'18px 20px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-20,top:-10,fontSize:70,opacity:.1}}>🚲</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>Транспорт · Спорт · Пикник</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>Прокат инвентаря</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT}}>Всё необходимое для активного отдыха в парке</div>
      </div>
      <div style={{padding:'12px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {cats.map(c=><div key={c} onClick={()=>setCat(c)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',background:cat===c?l1:'var(--ef2)',border:cat===c?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:cat===c?600:400,color:cat===c?bg:l2}}>{c==='all'?'Все':c}</span>
        </div>)}
      </div>
      <div style={{padding:'12px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {shown.map((it,i)=><div key={i} onClick={()=>push('booking',{service:it,title:it.n})} className="eth-tap eth-card" style={{borderRadius:18,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer'}}>
          <div style={{height:3,background:it.color}}/>
          <div style={{padding:'12px'}}>
            <div style={{width:44,height:44,borderRadius:14,background:`${it.color}15`,border:`0.5px solid ${it.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:8}}>{it.em}</div>
            <div style={{fontSize:12,fontWeight:700,color:l1,fontFamily:FT,lineHeight:1.3,marginBottom:2}}>{it.n}</div>
            <div style={{fontSize:10,color:l3,fontFamily:FT,marginBottom:8}}>{it.sub}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD}}>{it.p}₽</div>
                <div style={{fontSize:9,color:l4,fontFamily:FT}}>/ {it.unit}</div>
              </div>
              <div style={{background:it.avail>5?`${green}15`:it.avail>0?`${orange}15`:`${red}15`,borderRadius:8,padding:'2px 8px',border:`0.5px solid ${it.avail>5?green:it.avail>0?orange:red}30`}}>
                <span style={{fontSize:9,color:it.avail>5?green:it.avail>0?orange:red,fontFamily:FT,fontWeight:600}}>{it.avail>0?`${it.avail} шт`:'Нет'}</span>
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function KidsSC({push,pop}){
  const ZONES=[
    {em:'🎭',n:'Театр кукол',sub:'Сказки народов мира · 40 мин',p:350,r:4.9,age:'3–10',
     color:'#E91E63',times:['11:00','14:00','16:00'],desc:'Кукольный спектакль по народным сказкам. Дети выходят на сцену в финале'},
    {em:'🧩',n:'Город мастеров (детский)',sub:'Мини-мастер-классы · 1 ч',p:500,r:4.9,age:'4–12',
     color:purple,times:['10:00','12:00','14:00','16:00'],desc:'Лепка, рисование, плетение — 4 мастерских за 1 час. Каждый ребёнок уносит поделку'},
    {em:'🐾',n:'Детская ферма',sub:'Кормление животных · 30 мин',p:300,r:4.9,age:'0+',
     color:green,times:['10:00','13:00','16:00'],desc:'Кролики, козята, утята — можно кормить с рук. Полностью безопасно'},
    {em:'🏰',n:'Замок-лабиринт (малыши)',sub:'Мягкие материалы · Безопасно',p:200,r:4.8,age:'2–8',
     color:orange,times:['10:00–18:00'],desc:'Мягкий лабиринт, горки, туннели. Родители могут быть внутри с детьми'},
    {em:'🎪',n:'Интерактивный цирк',sub:'Дети на сцене · 50 мин',p:400,r:4.9,age:'5–14',
     color:blue,times:['12:00','15:00','17:00'],desc:'Дети учатся жонглировать, ходить на ходулях и делать фокусы. В финале — выступление'},
    {em:'🌱',n:'Мини-огород',sub:'Посадить свой росток',p:250,r:4.8,age:'4+',
     color:'#228B22',times:['11:00','14:00'],desc:'Каждый ребёнок сажает свой росток и уносит домой в красивом горшке'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Детям" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#1a0a3a,#0a3a1e,#1a3a5a)',padding:'20px 20px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-10,top:-10,fontSize:80,opacity:.12}}>🎪</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>Игры · Мастерские · Животные</div>
        <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>Мир ребёнка</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT}}>6 зон · Возраст от 0 · Родители могут участвовать</div>
      </div>
      <div style={{padding:'12px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {ZONES.map((z,i)=><div key={i} onClick={()=>push('booking',{service:z,title:z.n})} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:`0.5px solid ${z.color}20`,overflow:'hidden',cursor:'pointer'}}>
          <div style={{height:3,background:`linear-gradient(90deg,${z.color},${z.color}44)`}}/>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:12,marginBottom:8}}>
              <div style={{width:52,height:52,borderRadius:16,background:`${z.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{z.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2}}>{z.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:4}}>{z.sub}</div>
                <div style={{display:'flex',gap:8}}>
                  <div style={{background:`${z.color}15`,borderRadius:8,padding:'2px 8px'}}><span style={{fontSize:10,color:z.color,fontFamily:FT,fontWeight:600}}>👶 {z.age}</span></div>
                  <span style={{fontSize:11,color:'#FFD60A'}}>★ {z.r}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{z.p}₽</div>
              </div>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginBottom:8}}>{z.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {z.times.map((t,j)=><div key={j} style={{background:`${z.color}12`,border:`0.5px solid ${z.color}25`,borderRadius:8,padding:'3px 9px'}}>
                <span style={{fontSize:10,color:z.color,fontFamily:FT,fontWeight:500}}>⏰ {t}</span>
              </div>)}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function LoyaltyScreen({push,pop}){
  const bal=1247;
  const TIERS=[
    {id:0,n:'Гость',em:'🌱',min:0,max:500,color:'#8D8D93'},
    {id:1,n:'Знаток',em:'🌿',min:500,max:1500,color:green},
    {id:2,n:'Путешественник',em:'🌍',min:1500,max:3000,color:blue},
    {id:3,n:'Исследователь',em:'🔭',min:3000,max:6000,color:purple},
    {id:4,n:'Посол мира',em:'👑',min:6000,max:6000,color:'#FFD60A'},
  ];
  const tier=TIERS.find((t,i)=>bal<t.max||i===4)||TIERS[4];
  const nextTier=TIERS[tier.id+1]||tier;
  const tierProgress=tier.id>=4?1:Math.min(1,(bal-tier.min)/(tier.max-tier.min));
  const tierPct=Math.round(tierProgress*100);
  // SVG ring
  const R=54,SW=8,C=Math.PI*2*R,dash=C*tierProgress;
  const[tab,setTab]=useState('rewards');
  const REWARDS=[
    {em:'☕',n:'Кофе в подарок',p:200,c:'#A2845E',available:true},
    {em:'🎟',n:'Билет на шоу',p:500,c:purple,available:true},
    {em:'🍜',n:'Обед в ресторане',p:800,c:orange,available:true},
    {em:'💆',n:'СПА-процедура',p:1200,c:pink,available:false},
    {em:'🏨',n:'Ночь в отеле',p:2500,c:teal,available:false},
    {em:'🎁',n:'Подарочный сертификат',p:1500,c:green,available:false},
  ];
  const CHALLENGES=[
    {em:'🍜',n:'Попробуй 3 кухни',sub:'2 из 3',p:150,done:false,prog:0.66},
    {em:'⭐',n:'Оставь 5 отзывов',sub:'3 из 5',p:100,done:false,prog:0.6},
    {em:'🎭',n:'Посети мероприятие',sub:'Выполнено',p:200,done:true,prog:1},
    {em:'📸',n:'Фото в 5 зонах',sub:'1 из 5',p:250,done:false,prog:0.2},
  ];
  const TX=[
    {em:'➕',n:'Посещение парка',d:'сегодня',v:'+50',s:'in'},
    {em:'➕',n:'Бронь отеля',d:'вчера',v:'+340',s:'in'},
    {em:'➖',n:'Кофе в подарок',d:'3 дня назад',v:'−200',s:'out'},
    {em:'➕',n:'МК Гончарство',d:'5 дней назад',v:'+90',s:'in'},
    {em:'➕',n:'Ресторан Индия',d:'неделю назад',v:'+170',s:'in'},
    {em:'➕',n:'СПА Восток',d:'2 нед. назад',v:'+210',s:'in'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    {/* Hero */}
    <div style={{background:`linear-gradient(160deg,#0a1520,#0d1e2e)`,padding:'52px 20px 20px',flexShrink:0,position:'relative',overflow:'hidden'}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{display:'inline-flex',alignItems:'center',gap:5,marginBottom:12,cursor:'pointer'}}>
        <Ic.chevL s={10} c={blue}/><span style={{fontSize:17,fontFamily:FT,color:blue}}>Назад</span>
      </div>}
      {/* Decorative */}
      <div style={{position:'absolute',top:-30,right:-30,fontSize:140,opacity:.05,userSelect:'none'}}>{tier.em}</div>
      {/* Main card */}
      <div style={{background:'rgba(255,255,255,.07)',border:'0.5px solid rgba(255,255,255,.12)',borderRadius:24,padding:'20px',backdropFilter:'blur(20px)'}}>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          {/* SVG Ring */}
          <div style={{position:'relative',width:128,height:128,flexShrink:0}}>
            <svg width="128" height="128" style={{transform:'rotate(-90deg)'}}>
              <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={SW}/>
              <circle cx="64" cy="64" r={R} fill="none" stroke={tier.color} strokeWidth={SW}
                strokeDasharray={`${C}`} strokeDashoffset={`${C-dash}`}
                strokeLinecap="round" style={{transition:'stroke-dashoffset 1s cubic-bezier(.34,1.3,.64,1)'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <div style={{fontSize:32}}>{tier.em}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT,fontWeight:700,marginTop:2}}>{tierPct}%</div>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)',fontFamily:FT,letterSpacing:'.8px',textTransform:'uppercase',marginBottom:4}}>{tier.n}</div>
            <div style={{fontSize:44,fontWeight:800,color:'#fff',fontFamily:FD,letterSpacing:'-1.5px',lineHeight:1}}>{bal.toLocaleString('ru')}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginTop:4}}>баллов</div>
            {tier.id<4&&<div style={{marginTop:8,fontSize:11,color:tier.color,fontFamily:FT}}>До «{nextTier.n}» ещё {(nextTier.min-bal).toLocaleString('ru')} б</div>}
          </div>
        </div>
        {/* Tier progress row */}
        <div style={{marginTop:16,display:'flex',justifyContent:'space-between',gap:4}}>
          {TIERS.map((t,i)=>(
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
              <div style={{fontSize:16,opacity:bal>=t.min?1:.3}}>{t.em}</div>
              <div style={{height:3,borderRadius:2,background:bal>=t.min?t.color:'rgba(255,255,255,.1)',width:'100%',transition:'background .5s'}}/>
              <div style={{fontSize:8,color:bal>=t.min?'rgba(255,255,255,.7)':'rgba(255,255,255,.25)',fontFamily:FT}}>{t.n.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:'flex',padding:'10px 20px 0',gap:4,background:bg,borderBottom:'0.5px solid var(--es2)'}}>
      {[['rewards','🎁 Награды'],['challenges','🏆 Задания'],['history','📋 История']].map(([id,lbl])=>(
        <div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,padding:'9px',textAlign:'center',borderRadius:12,background:tab===id?`${tier.color}18`:'transparent',cursor:'pointer',borderBottom:tab===id?`2px solid ${tier.color}`:'2px solid transparent'}}>
          <span style={{fontSize:12,fontWeight:600,color:tab===id?tier.color:l3,fontFamily:FT}}>{lbl}</span>
        </div>
      ))}
    </div>

    <div style={{flex:1,overflowY:'auto',padding:'16px 20px 100px'}}>
      {tab==='rewards'&&<>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginBottom:12}}>Ваш баланс: <span style={{fontWeight:700,color:l1}}>{bal}</span> баллов</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {REWARDS.map((r,i)=><div key={i} onClick={()=>{}} className="eth-tap" style={{background:'var(--ef2)',borderRadius:18,padding:'14px 12px',cursor:r.available?'pointer':'not-allowed',border:`0.5px solid ${r.available?r.c+'30':'var(--es2)'}`,opacity:r.available?1:.55,position:'relative',overflow:'hidden'}}>
            {!r.available&&<div style={{position:'absolute',inset:0,background:'var(--ef3)',opacity:.3,borderRadius:18}}/>}
            <div style={{fontSize:34,marginBottom:8}}>{r.em}</div>
            <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT,marginBottom:6,lineHeight:1.3}}>{r.n}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{background:`${r.c}18`,borderRadius:8,padding:'4px 8px'}}>
                <span style={{fontSize:12,fontWeight:700,color:r.c,fontFamily:FD}}>{r.p} б</span>
              </div>
              {r.available?<div style={{fontSize:11,color:r.p<=bal?green:l4,fontFamily:FT}}>{r.p<=bal?'✓ Доступно':'Мало баллов'}</div>:
                <div style={{fontSize:9,color:l4,fontFamily:FT}}>🔒 Нужно {(r.p-bal)>0?`ещё ${r.p-bal}`:''} б</div>}
            </div>
          </div>)}
        </div>

        {/* Referral */}
        <div style={{marginTop:16,background:'linear-gradient(135deg,#0d1e2e,#1a3a5c)',borderRadius:20,padding:'16px',border:`0.5px solid ${blue}30`}}>
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
            <div style={{fontSize:28}}>🎊</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Пригласи друга</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:FT}}>Ты получишь 300 баллов · Друг — 150</div>
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,.08)',borderRadius:12,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'.5px'}}>ETHNO-1247</span>
            <div className="eth-tap" style={{background:blue,borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>
              <span style={{fontSize:11,fontWeight:600,color:'#fff',fontFamily:FT}}>Скопировать</span>
            </div>
          </div>
        </div>
      </>}

      {tab==='challenges'&&<>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginBottom:12}}>Выполняйте задания — получайте бонусные баллы</div>
        {CHALLENGES.map((ch,i)=>(
          <div key={i} style={{background:'var(--ef2)',borderRadius:18,padding:'14px 16px',marginBottom:10,border:`0.5px solid ${ch.done?green+'40':'var(--es2)'}`,opacity:ch.done?.8:1}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:44,height:44,borderRadius:14,background:ch.done?`${green}18`:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{ch.done?'✅':ch.em}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT}}>{ch.n}</div>
                  <div style={{background:`${ch.done?green:tier.color}18`,borderRadius:8,padding:'3px 8px'}}>
                    <span style={{fontSize:11,fontWeight:700,color:ch.done?green:tier.color,fontFamily:FD}}>+{ch.p} б</span>
                  </div>
                </div>
                <div style={{fontSize:11,color:ch.done?green:l3,fontFamily:FT,marginBottom:8}}>{ch.sub}</div>
                <div style={{height:4,background:'var(--ef3)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${ch.prog*100}%`,background:ch.done?green:tier.color,borderRadius:2,transition:'width .6s ease'}}/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>}

      {tab==='history'&&TX.map((t,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',padding:'12px 0',borderBottom:'0.5px solid var(--es2)'}}>
          <div style={{width:36,height:36,borderRadius:12,background:t.s==='in'?`${green}18`:`${red}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,marginRight:12,flexShrink:0}}>{t.em}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:500,color:l1,fontFamily:FT}}>{t.n}</div>
            <div style={{fontSize:11,color:l4,fontFamily:FT,marginTop:2}}>{t.d}</div>
          </div>
          <span style={{fontSize:16,fontWeight:700,color:t.s==='in'?green:red,fontFamily:FD}}>{t.v}</span>
        </div>
      ))}
    </div>
  </div>;
}


const COUNTRIES=[
  {
    id:'india',
    flag:'🇮🇳',
    name:'Индия',
    nameLocal:'भारत',
    color:'#FF6B35',
    grad:'linear-gradient(135deg,#7B1D1D 0%,#C84B31 50%,#FF6B35 100%)',
    hotel:{n:'Этноотель Индия',p:5800,desc:'Дворцовый стиль, арки, мозаика'},
    restaurants:[
      {n:'Индийская душа',e:'🍛',p:'500–3500₽',desc:'Карри, тандур, масала'},
    ],
    activities:['Йога-класс','Аюрведа-ритуал','Урок танца Болливуд','Роспись хной'],
    facts:['Официальный язык: хинди','Население страны: 1.4 млрд','Специи: 50+ видов'],
    realestate:[
      {t:'Апартамент «Радж»',type:'apartment',p:2400000,area:42,desc:'Вид на сад, дворцовый стиль'},
      {t:'Вилла «Тадж»',type:'villa',p:9800000,area:120,desc:'Бассейн, сад специй'},
    ],
    stamps:12,visited:true,
  },
  {
    id:'nepal',
    flag:'🇳🇵',
    name:'Непал',
    nameLocal:'नेपाल',
    color:'#4A90D9',
    grad:'linear-gradient(135deg,#1a3a5c 0%,#2d6a9f 50%,#4A90D9 100%)',
    hotel:{n:'Гималайский дом',p:5200,desc:'Основной ресепшен, Непал/Бутан/Тибет'},
    restaurants:[
      {n:'Чайхана',e:'🍵',p:'400–2800₽',desc:'Восточная кухня, плов, лагман'},
    ],
    activities:['Медитация','Тибетские чаши','Мастер-класс по тханке','Трекинг'],
    facts:['Дом Эвереста','Родина Будды','8 из 14 восьмитысячников'],
    realestate:[
      {t:'Апартамент «Анапурна»',type:'apartment',p:1900000,area:38,desc:'Горный вид, тибетский декор'},
    ],
    stamps:8,visited:true,
  },
  {
    id:'srilanka',
    flag:'🇱🇰',
    name:'Шри-Ланка',
    nameLocal:'ශ්‍රී ලංකා',
    color:'#2ECC71',
    grad:'linear-gradient(135deg,#0a3d1e 0%,#1a6b3a 50%,#2ECC71 100%)',
    hotel:{n:'СПА-отель Шри-Ланка',p:8500,desc:'Тропический стиль, бассейн, хаммам'},
    restaurants:[
      {n:'Океан и Я',e:'🦞',p:'800–6000₽',desc:'Морепродукты, устрицы, лобстер'},
    ],
    activities:['СПА-церемония','Аюрведа','Чайная дегустация','Серфинг-класс'],
    facts:['Остров пряностей','Родина Ceylon tea','Тропический климат'],
    realestate:[
      {t:'Вилла «Цейлон»',type:'villa',p:14500000,area:200,desc:'Бассейн, джакузи, тропический сад'},
      {t:'Апартамент «Коломбо»',type:'apartment',p:3200000,area:55,desc:'Вид на бассейн, СПА-доступ'},
    ],
    stamps:15,visited:true,
  },
  {
    id:'eastasia',
    flag:'🇨🇳',
    name:'Восточная Азия',
    nameLocal:'东亚',
    color:'#E74C3C',
    grad:'linear-gradient(135deg,#7b0000 0%,#c0392b 50%,#E74C3C 100%)',
    hotel:{n:'Этноотель Восточная Азия',p:6200,desc:'Китай/Япония/Корея, чайная церемония'},
    restaurants:[
      {n:'Кафе Восточной Азии',e:'🍜',p:'500–2500₽',desc:'Фо-бо, суши, димсам'},
    ],
    activities:['Чайная церемония','Боевые искусства','Икебана','Оригами-МК'],
    facts:['3 тысячелетия культуры','Иероглифическое письмо','Шёлковый путь'],
    realestate:[
      {t:'Апартамент «Пагода»',type:'apartment',p:2800000,area:48,desc:'Японский минимализм, чайный сад'},
    ],
    stamps:6,visited:true,
  },
  {
    id:'sea',
    flag:'🇹🇭',
    name:'Юго-Восточная Азия',
    nameLocal:'Asia Tenggara',
    color:'#F39C12',
    grad:'linear-gradient(135deg,#7b4200 0%,#c97d00 50%,#F39C12 100%)',
    hotel:{n:'Этноотель ЮВА',p:5900,desc:'Таиланд/Индонезия/Бали, тропики'},
    restaurants:[
      {n:'Кафе Юго-Восточной Азии',e:'🍲',p:'500–2500₽',desc:'Пад-тай, том-ям, наси-горенг'},
    ],
    activities:['Тайский массаж','Балийский танец','Батик-МК','Кокосовое мастерство'],
    facts:['11 стран','Родина тайского бокса','Тысяча островов'],
    realestate:[
      {t:'Вилла «Убуд»',type:'villa',p:7900000,area:150,desc:'Балийский стиль, рисовые террасы'},
    ],
    stamps:4,visited:false,
  },
  {
    id:'centralasia',
    flag:'🇰🇿',
    name:'Центральная Азия',
    nameLocal:'Орта Азия',
    color:'#9B59B6',
    grad:'linear-gradient(135deg,#3d1a60 0%,#6c3483 50%,#9B59B6 100%)',
    hotel:{n:'Этноотель Центральная Азия',p:4800,desc:'Казахстан/Узбекистан, Музей СССР'},
    restaurants:[
      {n:'Чайхана',e:'🍽',p:'400–2800₽',desc:'Плов, лагман, самса, манты'},
      {n:'Кафе Азербайджан',e:'🥩',p:'400–2200₽',desc:'Долма, пити, люля-кебаб'},
    ],
    activities:['Игра на домбре','Юртовая жизнь','Национальные танцы','Кочевой быт'],
    facts:['Великий Шёлковый путь','Самарканд и Бухара','Степи и горы'],
    realestate:[
      {t:'Апартамент «Самарканд»',type:'apartment',p:1600000,area:35,desc:'Восточный стиль, ковры, аутентика'},
      {t:'Земля под юрту',type:'land',p:800000,area:300,desc:'Земельный участок, 3 сотки'},
    ],
    stamps:3,visited:false,
  },
  {
    id:'siberia',
    flag:'🇷🇺',
    name:'Сибирия',
    nameLocal:'Сибирь',
    color:'#1ABC9C',
    grad:'linear-gradient(135deg,#0a3d35 0%,#148f77 50%,#1ABC9C 100%)',
    hotel:{n:'Этноотель Сибирия',p:4200,desc:'Сибирский стиль, баня, кедровый лес'},
    restaurants:[
      {n:'Русская трапезная',e:'🥣',p:'300–1800₽',desc:'Щи, борщ, пироги, уха'},
    ],
    activities:['Русская баня','Охота с соколом','Резьба по дереву','Рыбалка'],
    facts:['Кедровые леса','Байкал рядом','Сибирский тракт'],
    realestate:[
      {t:'Срубовой дом «Кедр»',type:'house',p:5500000,area:90,desc:'Баня, лес, участок 6 соток'},
      {t:'Земля «Тайга»',type:'land',p:1200000,area:600,desc:'Лесной участок, ИЖС'},
    ],
    stamps:9,visited:true,
  },
  {
    id:'ukraine',
    flag:'🇺🇦',
    name:'Украина',
    nameLocal:'Україна',
    color:'#F1C40F',
    grad:'linear-gradient(135deg,#1a6b1a 0%,#27ae60 50%,#F1C40F 100%)',
    hotel:{n:'Этноотель Украина',p:3800,desc:'Белёные хаты, хохлома, вышиванка'},
    restaurants:[
      {n:'Русская трапезная',e:'🥟',p:'300–1800₽',desc:'Борщ, вареники, сало'},
    ],
    activities:['Гончарство','Вышивка крестиком','Писанки','Народные танцы'],
    facts:['Самый большой каравай','Черноземье','Казацкая вольница'],
    realestate:[
      {t:'Хата «Полтава»',type:'house',p:3200000,area:70,desc:'Белёная хата, сад, огород'},
    ],
    stamps:5,visited:true,
  },
  {
    id:'belarus',
    flag:'🇧🇾',
    name:'Беларусь',
    nameLocal:'Беларусь',
    color:'#E74C3C',
    grad:'linear-gradient(135deg,#1a0a0a 0%,#7b1111 50%,#E74C3C 100%)',
    hotel:{n:'Этноотель Беларусь',p:3500,desc:'Деревянный сруб, народные ремёсла'},
    restaurants:[
      {n:'Русская трапезная',e:'🥔',p:'300–1800₽',desc:'Драники, мачанка, кулага'},
    ],
    activities:['Лозоплетение','Ткачество','Бортничество','Кузнечное дело'],
    facts:['Страна синеокая','Беловежская пуща','Зубры и аисты'],
    realestate:[
      {t:'Усадьба «Полесье»',type:'house',p:2800000,area:80,desc:'Сруб, баня, сад'},
    ],
    stamps:2,visited:false,
  },
];

const CITIZENSHIP_LEVELS=[
  {id:'guest',    title:'Гость',             emoji:'🌍',color:'#8E8E93',min:0,   desc:'Первый визит в Этномир'},
  {id:'traveler', title:'Путник',            emoji:'🧳',color:'#30D158',min:1,   desc:'Получил паспорт путника'},
  {id:'resident', title:'Резидент',          emoji:'🏠',color:'#0A84FF',min:5,   desc:'Арендует жильё или частый гость'},
  {id:'citizen',  title:'Гражданин',         emoji:'🏡',color:'#BF5AF2',min:100, desc:'Владеет недвижимостью в Этномире'},
  {id:'honorary', title:'Почётный гражданин',emoji:'👑',color:'#FFD60A',min:500, desc:'Партнёр или инвестор Этномира'},
];

const PROPERTY_TYPES={
  land:      {emoji:'🌳',label:'Земля',      color:'#30D158'},
  apartment: {emoji:'🏢',label:'Апартамент', color:'#0A84FF'},
  house:     {emoji:'🏠',label:'Дом',        color:'#FF9F0A'},
  villa:     {emoji:'🏡',label:'Вилла',      color:'#BF5AF2'},
  commercial:{emoji:'🏪',label:'Коммерция',  color:'#FF453A'},
  franchise: {emoji:'🤝',label:'Франшиза',   color:'#FFD60A'},
};

function CountriesScreen({push,pop,visits={}}){
  const[q,setQ]=useState('');
  const[continent,setContinent]=useState('all');
  const CONT=['all','Азия','Европа','Ближний Восток','Африка','Америка'];
  const visitedCount=COUNTRIES.filter(c=>(visits[c.id]||{}).visited).length;
  const totalStamps=Object.values(visits).reduce((s,v)=>s+v.stamps,0);
  const shown=COUNTRIES.filter(c=>{
    const matchQ=!q||c.name.toLowerCase().includes(q.toLowerCase())||c.nameLocal.toLowerCase().includes(q.toLowerCase());
    const matchC=continent==='all'||(c.region||'').includes(continent)||c.name.includes(continent);
    return matchQ&&matchC;
  });
  const visited=shown.filter(c=>(visits[c.id]||{}).visited);
  const unvisited=shown.filter(c=>!(visits[c.id]||{}).visited);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1}}>
          <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Страны мира</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1}}>{visitedCount} из {COUNTRIES.length} посещено · {totalStamps} штампов</div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{height:6,borderRadius:3,background:'var(--ef2)',overflow:'hidden',marginBottom:12}}>
        <div style={{height:'100%',width:`${(visitedCount/COUNTRIES.length)*100}%`,borderRadius:3,background:`linear-gradient(90deg,${green},${blue})`,transition:'width .6s cubic-bezier(.34,1.3,.64,1)'}}/>
      </div>
      {/* Search */}
      <div style={{position:'relative',marginBottom:10}}>
        <div style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}><Ic.search s={14} c={l3}/></div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск страны…" style={{width:'100%',borderRadius:14,padding:'10px 14px 10px 36px',background:'var(--ef2)',border:'0.5px solid var(--es2)',fontSize:13,color:l1,fontFamily:FT}}/>
      </div>
      {/* Continent filter */}
      <div style={{display:'flex',gap:7,overflowX:'auto',scrollbarWidth:'none',paddingBottom:8}}>
        {CONT.map(c=><div key={c} onClick={()=>setContinent(c)} className="eth-tap" style={{flexShrink:0,borderRadius:18,padding:'6px 12px',cursor:'pointer',background:continent===c?l1:'var(--ef2)',border:continent===c?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:11,fontFamily:FT,fontWeight:continent===c?600:400,color:continent===c?bg:l2}}>{c==='all'?'Все':c}</span>
        </div>)}
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'0 20px 100px'}}>
      {visited.length>0&&<>
        <div style={{fontSize:11,color:green,fontFamily:FT,fontWeight:700,textTransform:'uppercase',letterSpacing:'.4px',margin:'12px 0 8px'}}>✓ Посещено ({visited.length})</div>
        {visited.map((c,i)=>{
          const v=visits[c.id]||{stamps:0};
          return <div key={c.id} onClick={()=>push('country',{id:c.id})} className="eth-tap eth-card" style={{display:'flex',gap:14,padding:'12px 0',borderBottom:'0.5px solid var(--es2)',cursor:'pointer',alignItems:'center'}}>
            <div style={{fontSize:32,width:44,textAlign:'center',flexShrink:0}}>{c.emoji||'🌍'}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FT,marginBottom:2}}>{c.name}</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT}}>{c.nameLocal}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:12,color:green,fontFamily:FT,fontWeight:600}}>✓ {v.stamps} 🎯</div>
            </div>
            <Ic.chevR s={7} c={l4}/>
          </div>;
        })}
      </>}
      {unvisited.length>0&&<>
        <div style={{fontSize:11,color:l3,fontFamily:FT,fontWeight:700,textTransform:'uppercase',letterSpacing:'.4px',margin:'16px 0 8px'}}>Не посещено ({unvisited.length})</div>
        {unvisited.map((c,i)=><div key={c.id} onClick={()=>push('country',{id:c.id})} className="eth-tap" style={{display:'flex',gap:14,padding:'12px 0',borderBottom:'0.5px solid var(--es2)',cursor:'pointer',alignItems:'center',opacity:.75}}>
          <div style={{fontSize:32,width:44,textAlign:'center',flexShrink:0}}>{c.emoji||'🌍'}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT,marginBottom:2}}>{c.name}</div>
            <div style={{fontSize:11,color:l4,fontFamily:FT}}>{c.nameLocal}</div>
          </div>
          <Ic.chevR s={7} c={l4}/>
        </div>)}
      </>}
      {shown.length===0&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'50px 20px',gap:12}}>
        <span style={{fontSize:40}}>🔍</span>
        <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT}}>Ничего не найдено</div>
        <div style={{fontSize:13,color:l3,fontFamily:FT,textAlign:'center'}}>Попробуйте другой запрос или фильтр</div>
      </div>}
    </div>
  </div>;
}

function CountryScreen({push,pop,params={},visits={},addVisit,levelUpToast}){
  const countryId=params.id||'india';
  const country=COUNTRIES.find(c=>c.id===countryId)||COUNTRIES[0];
  const[stampAnim,setStampAnim]=useState(false);
  const scrollRef=useRef(null);
  const{scrolled}=useScrollState(scrollRef);
  const cv=visits[countryId]||{stamps:0,visited:false};

  const handleGetVisa=()=>{
    if(addVisit) addVisit(countryId);
    setStampAnim(true);
    setTimeout(()=>setStampAnim(false),1500);
  };

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg,overflow:'hidden'}}>
    <div ref={scrollRef} style={{flex:1,overflowY:'auto',paddingBottom:100}}>

      {/* Hero */}
      <div style={{
        background:country.grad,
        padding:'60px 20px 24px',position:'relative',overflow:'hidden',
      }}>
        {/* Back */}
        {pop&&<div onClick={pop} className="eth-press" style={{
          position:'absolute',top:14,left:16,
          width:36,height:36,borderRadius:18,
          background:'rgba(0,0,0,.3)',backdropFilter:'blur(10px)',
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
        }}><Ic.chevL s={18} c="#fff"/></div>}

        {/* Stamp animation overlay */}
        {stampAnim&&<div style={{
          position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
          pointerEvents:'none',zIndex:10,
          animation:'eth-spring .4s ease',
        }}>
          <div style={{
            width:120,height:120,borderRadius:60,
            background:'rgba(46,204,113,.85)',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            boxShadow:'0 0 60px rgba(46,204,113,.6)',
            border:'4px solid rgba(255,255,255,.4)',
          }}>
            <div style={{fontSize:36}}>✦</div>
            <div style={{fontSize:13,color:'#fff',fontFamily:FT,fontWeight:700,marginTop:4}}>ВИЗА</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT}}>получена!</div>
          </div>
        </div>}

        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
          <span style={{fontSize:56}}>{country.flag}</span>
          <div>
            <div style={{fontSize:26,fontWeight:700,color:'#fff',fontFamily:FT}}>{country.name}</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,.6)',fontFamily:FT}}>{country.nameLocal}</div>
          </div>
        </div>

        {/* Visa status + Get Visa */}
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{
            flex:1,background:'rgba(0,0,0,.25)',backdropFilter:'blur(10px)',
            borderRadius:14,padding:'10px 14px',
            display:'flex',alignItems:'center',gap:10,
          }}>
            {cv.visited
              ?<><span style={{fontSize:18}}>✦</span>
                <div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT}}>Виза получена</div>
                  <div style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>{cv.stamps} штамп{cv.stamps===1?'':'ов'}</div>
                </div></>
              :<><span style={{fontSize:18}}>🔒</span>
                <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:FT}}>Виза не получена</div></>
            }
          </div>
          <div onClick={handleGetVisa} className="eth-press" style={{
            background:'rgba(255,255,255,.95)',borderRadius:14,
            padding:'12px 18px',cursor:'pointer',flexShrink:0,
          }}>
            <div style={{fontSize:13,fontWeight:700,color:country.color,fontFamily:FT}}>
              {cv.visited?'+ Штамп':'Получить визу'}
            </div>
          </div>
        </div>
      </div>

      {/* Facts */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {country.facts.map((f,i)=><div key={i} style={{
            background:'var(--ef2)',borderRadius:10,padding:'6px 12px',
            fontSize:12,color:l2,fontFamily:FT,
            border:'0.5px solid var(--es2)',
          }}>{f}</div>)}
        </div>
      </div>

      {/* Hotel */}
      <div style={{padding:'20px 20px 0'}}>
        <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT,marginBottom:10}}>🏨 Отель</div>
        <div onClick={()=>push('hotels')} className="eth-press" style={{
          background:'var(--ef2)',borderRadius:16,padding:16,cursor:'pointer',
          border:'0.5px solid var(--es2)',
          display:'flex',alignItems:'center',gap:14,
        }}>
          <div style={{
            width:52,height:52,borderRadius:12,
            background:country.grad,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:24,flexShrink:0,
          }}>{country.flag}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT}}>{country.hotel.n}</div>
            <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:2}}>{country.hotel.desc}</div>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT}}>от {country.hotel.p}₽</div>
            <div style={{fontSize:11,color:l3,fontFamily:FT}}>/ ночь</div>
          </div>
        </div>
      </div>

      {/* Restaurants */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT,marginBottom:10}}>🍜 Рестораны</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {country.restaurants.map((r,i)=><div key={i} onClick={()=>push('food')} className="eth-press" style={{
            background:'var(--ef2)',borderRadius:14,padding:'12px 14px',cursor:'pointer',
            border:'0.5px solid var(--es2)',
            display:'flex',alignItems:'center',gap:12,
          }}>
            <span style={{fontSize:24}}>{r.e}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{r.n}</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>{r.desc}</div>
            </div>
            <div style={{fontSize:12,color:l2,fontFamily:FT}}>{r.p}</div>
          </div>)}
        </div>
      </div>

      {/* Activities */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT,marginBottom:10}}>⚡ Активности</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {country.activities.map((a,i)=><div key={i} onClick={()=>push('masterclasses')} className="eth-press" style={{
            background:country.color+'22',borderRadius:12,padding:'8px 14px',cursor:'pointer',
            border:`0.5px solid ${country.color}44`,
            fontSize:13,color:l1,fontFamily:FT,
          }}>{a}</div>)}
        </div>
      </div>

      {/* Real Estate */}
      {country.realestate&&country.realestate.length>0&&<div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:15,fontWeight:600,color:l1,fontFamily:FT,marginBottom:10}}>🏡 Недвижимость</div>
        <div style={{display:'flex',gap:12,overflowX:'auto',scrollbarWidth:'none'}}>
          {country.realestate.map((r,i)=><div key={i} onClick={()=>push('propertydetail',{property:r,country:country})} className="eth-press" style={{
            flexShrink:0,width:180,
            background:'var(--ef2)',borderRadius:16,overflow:'hidden',cursor:'pointer',
            border:'0.5px solid var(--es2)',
          }}>
            <div style={{height:80,background:country.grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30}}>{country.flag}</div>
            <div style={{padding:12}}>
              <div style={{fontSize:11,color:l3,fontFamily:FT}}>{PROPERTY_TYPES[r.type]?.emoji} {PROPERTY_TYPES[r.type]?.label}</div>
              <div style={{fontSize:12,fontWeight:600,color:l1,fontFamily:FT,marginTop:2}}>{r.t}</div>
              <div style={{fontSize:13,fontWeight:700,color:blue,fontFamily:FT,marginTop:6}}>{(r.p/1000000).toFixed(1)}M₽</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT}}>{r.area} м²</div>
            </div>
          </div>)}
        </div>
      </div>}

    </div>
  </div>;
}

function PassportScreen({push,pop,visits={}}){
  const[page,setPage]=useState(0);
  const pages=['Обложка','Данные','Визы','Достижения'];
  const visitedCountries=COUNTRIES.filter(c=>(visits[c.id]||{}).visited);
  const totalStamps=Object.values(visits).reduce((s,v)=>s+v.stamps,0);
  const level=totalStamps>=500?4:totalStamps>=100?3:totalStamps>=5?2:totalStamps>=1?1:0;
  const lvl=CITIZENSHIP_LEVELS[level];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Паспорт" back={pop?'Назад':undefined} onBack={pop}
      right={<div onClick={()=>push('settings')} className="eth-press-sm" style={{width:32,height:32,borderRadius:16,background:'var(--ef2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
        <Ic.ellipsis s={16} c={l2}/>
      </div>}
    />

    {/* Page tabs */}
    <div style={{padding:'0 20px 12px',flexShrink:0}}>
      <div style={{display:'flex',gap:6,background:'var(--ef2)',borderRadius:14,padding:4,border:'0.5px solid var(--es2)'}}>
        {pages.map((p,i)=><div
          key={i} onClick={()=>setPage(i)}
          className="eth-press-sm"
          style={{
            flex:1,height:34,borderRadius:11,
            background:page===i?bg2:'transparent',
            boxShadow:page===i?'0 1px 4px rgba(0,0,0,.15),inset 0 0.5px 0 rgba(255,255,255,.1)':'none',
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'pointer',transition:'all .2s',
          }}
        >
          <span style={{fontSize:12,fontFamily:FT,fontWeight:page===i?600:400,color:page===i?l1:l3,letterSpacing:'-.1px'}}>{p}</span>
        </div>)}
      </div>
    </div>

    <div style={{flex:1,overflowY:'auto',padding:'0 20px',paddingBottom:100}}>

      {/* ── PAGE 0: COVER ── */}
      {page===0&&<div className="eth-spring">
        {/* Passport book */}
        <div style={{
          borderRadius:20,overflow:'hidden',
          background:`linear-gradient(145deg,${G} 0%,${Gm} 60%,#1e6b42 100%)`,
          boxShadow:'0 20px 60px rgba(27,67,50,.55),0 4px 16px rgba(0,0,0,.3)',
          padding:'28px 24px 24px',
          position:'relative',
          minHeight:320,
        }}>
          {/* Specular */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:80,background:'linear-gradient(180deg,rgba(255,255,255,.08),transparent)',pointerEvents:'none'}}/>
          {/* Binding line */}
          <div style={{position:'absolute',left:28,top:0,bottom:0,width:1,background:'rgba(255,255,255,.1)'}}/>
          {/* Logo */}
          <div style={{textAlign:'center',marginBottom:20,position:'relative'}}>
            <div style={{fontSize:48,marginBottom:8}}>🌍</div>
            <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.55)',letterSpacing:'2px',textTransform:'uppercase'}}>Государство</div>
            <div style={{fontSize:24,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px',marginTop:2}}>Этномир</div>
            <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.45)',letterSpacing:'1px',textTransform:'uppercase',marginTop:2}}>ETHNOMIR STATE</div>
          </div>

          {/* Divider */}
          <div style={{height:'0.5px',background:'rgba(255,255,255,.15)',marginBottom:20}}/>

          <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.5)',letterSpacing:'1.5px',textTransform:'uppercase',textAlign:'center',marginBottom:16}}>ПАСПОРТ · PASSPORT</div>

          {/* Citizen number */}
          <div style={{
            backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
            background:'rgba(255,255,255,.1)',
            border:'0.5px solid rgba(255,255,255,.18)',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,.15)',
            borderRadius:14,padding:'14px 18px',marginBottom:16,
          }}>
            <div style={{fontSize:10,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.5)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:4}}>Гражданин</div>
            <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.3px'}}>Иван Петров</div>
            <div style={{fontSize:12,fontFamily:FT,color:'rgba(255,255,255,.55)',marginTop:2}}>Путник · ID: ETH-2024-00847</div>
          </div>

          {/* Citizenship level */}
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{
              width:48,height:48,borderRadius:14,
              background:'rgba(255,255,255,.12)',
              border:`1.5px solid ${lvl.color}60`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:24,flexShrink:0,
            }}>
              {lvl.emoji}
            </div>
            <div>
              <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.5)',letterSpacing:'.5px',textTransform:'uppercase'}}>Статус</div>
              <div style={{fontSize:16,fontFamily:FD,fontWeight:700,color:lvl.color,letterSpacing:'-.2px'}}>{lvl.title}</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.45)',marginTop:1}}>{visitedCountries.length} стран · {totalStamps} штампов</div>
            </div>
          </div>

          {/* MRZ bottom */}
          <div style={{marginTop:20,paddingTop:14,borderTop:'0.5px solid rgba(255,255,255,.1)'}}>
            <div style={{fontFamily:'Courier New,monospace',fontSize:9,color:'rgba(255,255,255,.3)',letterSpacing:'1px',lineHeight:1.8}}>
              <div>P&lt;ETHNPETROV&lt;&lt;IVAN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
              <div>ETH00084724RUS8801019M2401019&lt;&lt;&lt;&lt;&lt;</div>
            </div>
          </div>
        </div>

        {/* QR for park entry */}
        <div style={{marginTop:20}}>
          <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>Вход в парк</div>
          <div onClick={()=>push('tickets')} className="eth-press" style={{
            backdropFilter:'blur(20px) saturate(180%)',
            WebkitBackdropFilter:'blur(20px) saturate(180%)',
            background:'var(--ef2)',border:'0.5px solid var(--es2)',
            boxShadow:'inset 0 1px 0 var(--eglspec)',
            borderRadius:18,padding:'18px',
            display:'flex',alignItems:'center',gap:16,cursor:'pointer',
          }}>
            <div style={{
              width:72,height:72,borderRadius:14,
              background:bg3,
              display:'grid',gridTemplateColumns:'repeat(7,8px)',gap:1,
              padding:8,alignContent:'center',
            }}>
              {[1,0,1,1,0,1,0,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1].map((b,i)=><div key={i} style={{width:8,height:8,borderRadius:1,background:b?l1:'transparent'}}/>)}
            </div>
            <div>
              <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.2px'}}>QR-код входа</div>
              <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:2}}>Действителен сегодня</div>
              <div style={{fontSize:12,fontFamily:FT,color:green,marginTop:4}}>● Активен</div>
            </div>
          </div>
        </div>
      </div>}

      {/* ── PAGE 1: PERSONAL DATA ── */}
      {page===1&&<div className="eth-spring">
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>Личные данные</div>
        <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`,marginBottom:24}}>
          {[
            {label:'Фамилия',value:'Петров'},
            {label:'Имя',value:'Иван'},
            {label:'Гражданство',value:'Россия'},
            {label:'Дата рождения',value:'01.01.1990'},
            {label:'Пол',value:'Мужской'},
            {label:'Номер паспорта',value:'ETH-2024-00847'},
            {label:'Дата выдачи',value:'15.03.2024'},
            {label:'Действителен до',value:'15.03.2029'},
          ].map((f,i,a)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'13px 16px',background:bg2,borderBottom:i<a.length-1?`0.5px solid ${sep2}`:'none'}}>
            <span style={{fontSize:13,fontFamily:FT,color:l3,letterSpacing:'-.1px'}}>{f.label}</span>
            <span style={{fontSize:14,fontFamily:FT,fontWeight:500,color:l1,letterSpacing:'-.1px'}}>{f.value}</span>
          </div>)}
        </div>

        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>Уровень гражданства</div>
        <div style={{borderRadius:16,overflow:'hidden',border:`0.5px solid ${sep2}`,marginBottom:24}}>
          {CITIZENSHIP_LEVELS.map((l_,i,a)=>{
            const isActive=level===i;
            const isPassed=level>i;
            return <div key={i} style={{display:'flex',alignItems:'center',gap:13,padding:'14px 16px',background:bg2,borderBottom:i<a.length-1?`0.5px solid ${sep2}`:'none',opacity:isPassed||isActive?1:.45}}>
              <div style={{
                width:40,height:40,borderRadius:12,flexShrink:0,
                background:isActive?(l_.color+'20'):isPassed?(l_.color+'10'):'var(--ef3)',
                border:`1.5px solid ${isActive?l_.color:isPassed?(l_.color+'50'):'var(--es2)'}`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
              }}>{l_.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:isActive?l_.color:l1,letterSpacing:'-.2px'}}>{l_.title}</div>
                <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{l_.desc}</div>
              </div>
              {isActive&&<Tag label="Текущий" color={l_.color} small/>}
              {isPassed&&<Ic.check s={14} c={l_.color}/>}
            </div>;
          })}
        </div>
      </div>}

      {/* ── PAGE 2: VISAS / STAMPS ── */}
      {page===2&&<div className="eth-spring">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
          <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px'}}>
            Визы и штампы
          </div>
          <span style={{fontSize:13,fontFamily:FT,color:l3}}>{visitedCountries.length}/{COUNTRIES.length}</span>
        </div>

        {/* Visa pages — passport spread */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24}}>
          {COUNTRIES.map((country,i)=>(
            <div key={country.id} onClick={()=>push('country',{id:country.id})} className="eth-press" style={{
              borderRadius:16,overflow:'hidden',cursor:'pointer',
              background:country.visited?`${country.grad}`:'var(--ef3)',
              border:country.visited?`1.5px solid ${country.color}40`:`0.5px solid ${sep2}`,
              padding:'14px',
              position:'relative',minHeight:90,
              opacity:country.visited?1:.55,
            }}>
              {country.visited&&<div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.45))'}}/>}
              <div style={{position:'relative'}}>
                <div style={{fontSize:24,marginBottom:4}}>{country.flag}</div>
                <div style={{fontSize:13,fontFamily:FD,fontWeight:700,color:country.visited?'#fff':l2,letterSpacing:'-.2px'}}>{country.name}</div>
                {country.visited
                  ?<div style={{fontSize:10,fontFamily:FT,color:'rgba(255,255,255,.65)',marginTop:2}}>✓ {country.stamps} штамп.</div>
                  :<div style={{fontSize:10,fontFamily:FT,color:l4,marginTop:2}}>Не посещена</div>
                }
                {/* Stamp mark */}
                {country.visited&&<div style={{
                  position:'absolute',top:-4,right:-4,
                  width:28,height:28,borderRadius:14,
                  border:`2px solid ${country.color}80`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  background:`${country.color}30`,
                  transform:'rotate(-12deg)',
                }}>
                  <span style={{fontSize:12}}>✅</span>
                </div>}
              </div>
            </div>
          ))}
        </div>

        {/* Get more stamps CTA */}
        <div onClick={()=>push('countries')} className="eth-press" style={{
          borderRadius:16,
          background:bg2,border:`0.5px solid ${sep2}`,
          padding:'16px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',
        }}>
          <div style={{width:44,height:44,borderRadius:12,background:`${green}15`,border:`1px solid ${green}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🧳</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:l1}}>Исследовать страны</div>
            <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>Получайте визы и штампы</div>
          </div>
          <Ic.chevR/>
        </div>
      </div>}

      {/* ── PAGE 3: ACHIEVEMENTS ── */}
      {page===3&&<div className="eth-spring">
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:12}}>Достижения</div>
        {[
          {emoji:'🌍',title:'Первые шаги',desc:'Получите паспорт Этномира',done:true,color:green},
          {emoji:'🍛',title:'Гурман',desc:'Поешьте в 3 ресторанах разных стран',done:true,color:orange},
          {emoji:'🏨',title:'Путешественник',desc:'Переночуйте в отеле Этномира',done:true,color:blue},
          {emoji:'🗺',title:'Первооткрыватель',desc:'Посетите 5 стран Этномира',done:visitedCountries.length>=5,color:purple},
          {emoji:'🏠',title:'Резидент',desc:'Арендуйте или купите недвижимость',done:false,color:'#FF9F0A'},
          {emoji:'🤝',title:'Партнёр',desc:'Откройте франшизу Этномира',done:false,color:'#FFD60A'},
          {emoji:'👑',title:'Почётный гражданин',desc:'Владелец недвижимости во всех странах',done:false,color:yellow},
          {emoji:'🌱',title:'Эколог',desc:'Поучаствуйте в 5 мастер-классах',done:true,color:green},
        ].map((ach,i)=>(
          <div key={i} style={{
            display:'flex',alignItems:'center',gap:14,
            padding:'14px 0',
            borderBottom:i<7?`0.5px solid ${sep2}`:'none',
            opacity:ach.done?1:.4,
          }}>
            <div style={{
              width:48,height:48,borderRadius:14,flexShrink:0,
              background:ach.done?`${ach.color}20`:'var(--ef3)',
              border:`1.5px solid ${ach.done?ach.color:'var(--es2)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,
            }}>{ach.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontFamily:FT,fontWeight:600,color:ach.done?l1:l2,letterSpacing:'-.2px'}}>{ach.title}</div>
              <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{ach.desc}</div>
            </div>
            {ach.done&&<div style={{width:22,height:22,borderRadius:11,background:`${ach.color}20`,border:`1.5px solid ${ach.color}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Ic.check s={11} c={ach.color}/>
            </div>}
          </div>
        ))}
      </div>}
    </div>
  </div>;
}

//  REAL ESTATE SCREEN — Недвижимость Этномира
//  Buy land, house, villa, apartment, rent commercial
function RealEstateScreen({push,pop}){
  const[cat,setCat]=useState('all');
  const categories=['all','land','apartment','house','villa','commercial'];
  const catLabels={all:'Все',land:'Земля',apartment:'Апарт.',house:'Дом',villa:'Вилла',commercial:'Коммерция'};

  // Aggregate all real estate from countries + add commercial
  const allProps=[
    ...COUNTRIES.flatMap(c=>c.realestate.map(p=>({...p,country:c}))),
    {t:'Коммерческая площадь А1',type:'commercial',p:75000,priceType:'month',area:48,desc:'Ресторан/кафе, ул. Мира',country:COUNTRIES[0]},
    {t:'Торговый павильон «Восток»',type:'commercial',p:45000,priceType:'month',area:28,desc:'Сувениры, рынок',country:COUNTRIES[3]},
    {t:'Ремесленная мастерская',type:'commercial',p:38000,priceType:'month',area:35,desc:'Мастер-классы, аренда',country:COUNTRIES[6]},
  ];
  const shown=cat==='all'?allProps:allProps.filter(p=>p.type===cat);

  const totalForSale=allProps.filter(p=>p.type!=='commercial').length;

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Недвижимость" back={pop?'Назад':undefined} onBack={pop}
      right={<div style={{height:30,borderRadius:9,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'0 11px',display:'flex',alignItems:'center'}}>
        <span style={{fontSize:13,fontFamily:FT,color:l3}}>{shown.length} объект.</span>
      </div>}
    />

    <div style={{flex:1,overflowY:'auto'}}>
      {/* Hero stats */}
      <div style={{padding:'12px 20px 0'}}>
        <div style={{
          background:'linear-gradient(135deg,#0a1f1a,#0f3329)',
          borderRadius:18,padding:'16px 18px',marginBottom:16,
          boxShadow:'0 4px 20px rgba(10,30,25,.5)',
          border:'0.5px solid rgba(48,209,88,.1)',
        }}>
          <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,255,255,.5)',letterSpacing:'.4px',textTransform:'uppercase',marginBottom:8}}>Недвижимость в Этномире</div>
          <div style={{display:'flex',gap:20}}>
            {[
              {emoji:'🏡',n:totalForSale,label:'Объектов'},
              {emoji:'🌳',n:allProps.filter(p=>p.type==='land').length,label:'Земельных уч.'},
              {emoji:'🏢',n:allProps.filter(p=>p.type==='commercial').length,label:'Коммерч.'},
            ].map((s,i)=><div key={i}>
              <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px'}}>{s.n}</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.45)',marginTop:1}}>{s.label}</div>
            </div>)}
          </div>
        </div>

        {/* Category filters */}
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:12,scrollbarWidth:'none'}}>
          {categories.map(c=>{
            const pt=PROPERTY_TYPES[c]||{emoji:'🏘',label:'Все',color:green};
            const active=cat===c;
            return <div key={c} onClick={()=>setCat(c)} className="eth-press" style={{
              flexShrink:0,height:36,borderRadius:18,
              backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
              background:active?green:'var(--ef2)',
              border:active?'none':'0.5px solid var(--es2)',
              boxShadow:active?`inset 0 1px 0 rgba(255,255,255,.22),0 2px 6px ${green}30`:'inset 0 0.5px 0 var(--eglspec)',
              padding:'0 14px',display:'flex',alignItems:'center',gap:5,cursor:'pointer',
              transition:'all .22s cubic-bezier(.34,1.3,.64,1)',
            }}>
              {c!=='all'&&<span style={{fontSize:13}}>{pt.emoji}</span>}
              <span style={{fontSize:13,fontFamily:FT,fontWeight:active?600:400,color:active?'#fff':l2}}>{catLabels[c]}</span>
            </div>;
          })}
        </div>
      </div>

      {/* Property list */}
      <div style={{padding:'0 20px',paddingBottom:100}}>
        {shown.map((prop,i)=>{
          const pt=PROPERTY_TYPES[prop.type]||PROPERTY_TYPES.apartment;
          const isRent=prop.priceType==='month';
          return <div key={i} onClick={()=>push('propertydetail',{prop,country:prop.country})} className="eth-press" style={{
            borderRadius:18,overflow:'hidden',marginBottom:14,cursor:'pointer',
            background:bg2,border:`0.5px solid ${sep2}`,
            boxShadow:'0 2px 12px rgba(0,0,0,.06)',
          }}>
            {/* Image area */}
            <div style={{height:120,background:prop.country.grad,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:52,opacity:.4}}>{pt.emoji}</span>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.4))'}}/>
              {/* Country badge */}
              <div style={{position:'absolute',top:10,left:12,backdropFilter:'blur(12px)',background:'rgba(0,0,0,.35)',border:'0.5px solid rgba(255,255,255,.18)',borderRadius:10,padding:'4px 10px',display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:14}}>{prop.country.flag}</span>
                <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'#fff'}}>{prop.country.name}</span>
              </div>
              {/* Type badge */}
              <div style={{position:'absolute',top:10,right:12,background:`${pt.color}30`,border:`0.5px solid ${pt.color}50`,backdropFilter:'blur(10px)',borderRadius:8,padding:'3px 9px'}}>
                <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:pt.color}}>{pt.label}</span>
              </div>
            </div>
            {/* Content */}
            <div style={{padding:'14px 16px'}}>
              <div style={{fontSize:16,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px',marginBottom:4}}>{prop.t}</div>
              <div style={{fontSize:13,fontFamily:FT,color:l3,marginBottom:10}}>{prop.desc}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.5px'}}>
                    {prop.p.toLocaleString('ru-RU')} ₽{isRent?'/мес':''}
                  </div>
                  {prop.area&&<div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{prop.area} м² · {isRent?'аренда':'продажа'}</div>}
                </div>
                <div style={{
                  height:40,borderRadius:12,
                  background:green,
                  boxShadow:`inset 0 1px 0 rgba(255,255,255,.2),0 2px 8px ${green}40`,
                  padding:'0 18px',display:'flex',alignItems:'center',
                }}>
                  <span style={{fontSize:14,fontFamily:FT,fontWeight:600,color:'#fff'}}>{isRent?'Арендовать':'Купить'}</span>
                </div>
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

//  PROPERTY DETAIL SCREEN
function PropertyDetailScreen({push,pop,params={}}){
  const prop=params.prop||{t:'Апартамент',type:'apartment',p:2400000,area:42,desc:'Описание',country:COUNTRIES[0]};
  const country=params.country||COUNTRIES[0];
  const pt=PROPERTY_TYPES[prop.type]||PROPERTY_TYPES.apartment;
  const isRent=prop.priceType==='month';
  const[interested,setInterested]=useState(false);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    {/* Floating back */}
    <div style={{position:'absolute',top:0,left:0,right:0,zIndex:20,padding:'52px 16px 0',display:'flex',justifyContent:'space-between'}}>
      {pop&&<div onClick={pop} className="eth-press" style={{backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',background:'rgba(0,0,0,.35)',border:'0.5px solid rgba(255,255,255,.18)',borderRadius:12,padding:'6px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
        <Ic.chevL s={9} c="#fff"/>
        <span style={{fontSize:15,fontFamily:FT,color:'#fff'}}>Назад</span>
      </div>}
    </div>

    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Hero */}
      <div style={{height:240,background:country.grad,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:72,opacity:.25}}>{pt.emoji}</span>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.6) 100%)'}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px'}}>
          <div style={{fontSize:11,fontFamily:FT,fontWeight:700,color:pt.color,letterSpacing:'.4px',textTransform:'uppercase',marginBottom:4,background:`${pt.color}20`,borderRadius:6,padding:'2px 8px',display:'inline-block'}}>{pt.label}</div>
          <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px',marginTop:4}}>{prop.t}</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
            <span style={{fontSize:16}}>{country.flag}</span>
            <span style={{fontSize:13,fontFamily:FT,color:'rgba(255,255,255,.7)'}}>{country.name} · Этномир</span>
          </div>
        </div>
      </div>

      <div style={{padding:'20px'}}>
        {/* Price + area */}
        <div style={{
          backdropFilter:'blur(20px) saturate(180%)',
          WebkitBackdropFilter:'blur(20px) saturate(180%)',
          background:'var(--ef2)',border:'0.5px solid var(--eglborder)',
          boxShadow:'inset 0 1px 0 var(--eglspec)',
          borderRadius:18,padding:'18px',marginBottom:24,
        }}>
          <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:4}}>
            <span style={{fontSize:32,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-1px'}}>{prop.p.toLocaleString('ru-RU')} ₽</span>
            {isRent&&<span style={{fontSize:14,fontFamily:FT,color:l3}}>/месяц</span>}
          </div>
          <div style={{display:'flex',gap:16}}>
            {prop.area&&<div><span style={{fontSize:13,fontFamily:FT,color:l3}}>{prop.area} м²</span></div>}
            <div><span style={{fontSize:13,fontFamily:FT,color:l3}}>{isRent?'Долгосрочная аренда':'Продажа'}</span></div>
          </div>
        </div>

        {/* Description */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px',marginBottom:8}}>О объекте</div>
          <div style={{fontSize:15,fontFamily:FT,color:l2,lineHeight:1.6}}>{prop.desc}</div>
        </div>

        {/* Features */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:20,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.4px',marginBottom:12}}>Характеристики</div>
          <div style={{borderRadius:14,overflow:'hidden',border:`0.5px solid ${sep2}`}}>
            {[
              {k:'Тип',v:pt.label},
              {k:'Страна',v:country.name},
              {k:'Площадь',v:prop.area?`${prop.area} м²`:'—'},
              {k:'Отделка',v:'Авторский дизайн'},
              {k:'Инфраструктура',v:'Отель, рестораны, СПА'},
              {k:'Статус',v:'Свободен'},
            ].map((r,i,a)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 16px',background:bg2,borderBottom:i<a.length-1?`0.5px solid ${sep2}`:'none'}}>
              <span style={{fontSize:13,fontFamily:FT,color:l3}}>{r.k}</span>
              <span style={{fontSize:14,fontFamily:FT,fontWeight:500,color:l1}}>{r.v}</span>
            </div>)}
          </div>
        </div>

        {/* Country CTA */}
        <div onClick={()=>push('country',{id:country.id})} className="eth-press" style={{
          borderRadius:14,border:`0.5px solid ${sep2}`,
          background:bg2,padding:'13px 16px',
          display:'flex',alignItems:'center',gap:13,cursor:'pointer',marginBottom:100,
        }}>
          <span style={{fontSize:28}}>{country.flag}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontFamily:FT,fontWeight:600,color:l1}}>Узнать о стране</div>
            <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{country.name} · Отель, еда, активности</div>
          </div>
          <Ic.chevR/>
        </div>
      </div>
    </div>

    {/* Sticky CTA */}
    <div style={{
      position:'sticky',bottom:0,padding:'12px 20px 28px',
      backdropFilter:'blur(40px) saturate(200%)',
      WebkitBackdropFilter:'blur(40px) saturate(200%)',
      background:'var(--egl)',borderTop:`0.5px solid var(--es2)`,
      boxShadow:'inset 0 1px 0 var(--eglspec)',
    }}>
      <div style={{display:'flex',gap:10}}>
        <div onClick={()=>setInterested(!interested)} className="eth-press" style={{
          width:52,height:52,borderRadius:14,flexShrink:0,
          backdropFilter:'blur(16px)',background:'var(--ef2)',
          border:'0.5px solid var(--es2)',
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
        }}>
          <Ic.heart s={20} c={interested?red:l3} fill={interested}/>
        </div>
        <div onClick={()=>push('business')} className="eth-press" style={{
          flex:1,height:52,borderRadius:14,
          background:green,
          boxShadow:`inset 0 1px 0 rgba(255,255,255,.22),0 4px 16px ${green}40`,
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
        }}>
          <span style={{fontSize:17,fontFamily:FD,fontWeight:600,color:'#fff',letterSpacing:'-.3px'}}>
            {isRent?'Арендовать':'Купить — оставить заявку'}
          </span>
        </div>
      </div>
    </div>
  </div>;
}

//  FRANCHISE SCREEN — Франшиза и бизнес Этномира
function FranchiseScreen({push,pop}){
  const opportunities=[
    {
      emoji:'🤝',title:'Мастер-франшиза',
      price:25000000,
      color:'#FFD60A',
      desc:'Право открыть полноценный Этномир в своём регионе',
      includes:['Полный бренд-пакет','Земля + строительство','Обучение команды','Поддержка 24/7','Маркетинг в сети'],
      roi:'18–24 мес.',
    },
    {
      emoji:'🏪',title:'Павильон страны',
      price:5000000,
      color:'#0A84FF',
      desc:'Откройте собственный павильон одной из стран мира',
      includes:['Аренда площади 200–500 м²','Дизайн-проект','Концепция меню','Обучение персонала','Бренд Этномира'],
      roi:'12–18 мес.',
    },
    {
      emoji:'🍽',title:'Ресторан в Этномире',
      price:3500000,
      color:'#FF9F0A',
      desc:'Откройте ресторан национальной кухни',
      includes:['Аренда кухни + зала','Рецептурная база','Закупочные цены','Технолог от Этномира','Поток гостей'],
      roi:'10–14 мес.',
    },
    {
      emoji:'🏺',title:'Мастерская',
      price:1200000,
      color:'#BF5AF2',
      desc:'Ремесленная мастерская и мастер-классы',
      includes:['Площадь 30–60 м²','Оборудование','Расходники','Расписание в приложении','Реклама'],
      roi:'8–12 мес.',
    },
    {
      emoji:'🏕',title:'Глэмпинг-кластер',
      price:8000000,
      color:'#30D158',
      desc:'Авторский этнический кемпинг',
      includes:['Участок 0.5 га','Типи/юрты/шатры','Инфраструктура','Управление доходами','Бронирование в сети'],
      roi:'14–20 мес.',
    },
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Бизнес & Франшиза" back={pop?'Назад':undefined} onBack={pop}/>

    <div style={{flex:1,overflowY:'auto'}}>
      {/* Hero */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{
          background:'linear-gradient(135deg,#1a1200,#3a2800,#5a4000)',
          borderRadius:20,padding:'20px',marginBottom:20,
          boxShadow:'0 6px 24px rgba(90,64,0,.3)',
          position:'relative',overflow:'hidden',
          border:'0.5px solid rgba(255,215,0,.1)',
        }}>
          <div style={{position:'absolute',right:-15,top:-15,width:100,height:100,borderRadius:50,background:'rgba(255,215,0,.05)'}}/>
          <div style={{fontSize:11,fontFamily:FT,fontWeight:600,color:'rgba(255,215,0,.6)',letterSpacing:'.4px',textTransform:'uppercase',marginBottom:6}}>Стать партнёром</div>
          <div style={{fontSize:24,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.6px',lineHeight:1.2,marginBottom:6}}>
            Откройте свой бизнес в Этномире
          </div>
          <div style={{fontSize:14,fontFamily:FT,color:'rgba(255,255,255,.6)',lineHeight:1.5,marginBottom:16}}>
            Этномир — государство с 1 млн+ гостей в год. Стать частью этой экосистемы.
          </div>
          <div style={{display:'flex',gap:16}}>
            {[
              {n:'1M+',l:'гостей/год'},
              {n:'140 га',l:'территория'},
              {n:'50+',l:'ресторанов'},
            ].map((s,i)=><div key={i}>
              <div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:'#FFD60A',letterSpacing:'-.4px'}}>{s.n}</div>
              <div style={{fontSize:11,fontFamily:FT,color:'rgba(255,255,255,.45)'}}>{s.l}</div>
            </div>)}
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div style={{padding:'0 20px',paddingBottom:100}}>
        <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:14}}>Форматы партнёрства</div>
        {opportunities.map((opp,i)=><div key={i} style={{borderRadius:20,overflow:'hidden',marginBottom:16,background:bg2,border:`0.5px solid ${sep2}`}}>
          {/* Header */}
          <div style={{
            padding:'18px 18px 14px',
            background:`linear-gradient(135deg,${opp.color}10,transparent)`,
            borderBottom:`0.5px solid ${sep2}`,
          }}>
            <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
              <div style={{
                width:52,height:52,borderRadius:15,flexShrink:0,
                background:`${opp.color}15`,
                border:`1.5px solid ${opp.color}35`,
                boxShadow:`inset 0 1px 0 ${opp.color}20`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
              }}>{opp.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:17,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px'}}>{opp.title}</div>
                <div style={{fontSize:13,fontFamily:FT,color:l3,marginTop:2,lineHeight:1.4}}>{opp.desc}</div>
              </div>
            </div>
          </div>
          {/* Price + ROI */}
          <div style={{padding:'12px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`0.5px solid ${sep2}`}}>
            <div>
              <div style={{fontSize:11,fontFamily:FT,color:l3,letterSpacing:'.2px',textTransform:'uppercase',marginBottom:2}}>Инвестиции от</div>
              <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.6px'}}>{(opp.price/1000000).toFixed(1)} млн ₽</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,fontFamily:FT,color:l3,letterSpacing:'.2px',textTransform:'uppercase',marginBottom:2}}>Окупаемость</div>
              <div style={{fontSize:16,fontFamily:FD,fontWeight:700,color:opp.color,letterSpacing:'-.3px'}}>{opp.roi}</div>
            </div>
          </div>
          {/* Includes */}
          <div style={{padding:'12px 18px 16px'}}>
            <div style={{fontSize:12,fontFamily:FT,fontWeight:600,color:l3,textTransform:'uppercase',letterSpacing:'.3px',marginBottom:10}}>Включено</div>
            {opp.includes.map((inc,j)=><div key={j} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div style={{width:16,height:16,borderRadius:8,background:`${opp.color}20`,border:`1px solid ${opp.color}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Ic.check s={8} c={opp.color}/>
              </div>
              <span style={{fontSize:13,fontFamily:FT,color:l2}}>{inc}</span>
            </div>)}
            <div style={{marginTop:14}}>
              <div onClick={()=>push('business')} className="eth-press" style={{
                height:44,borderRadius:12,
                background:opp.color,
                boxShadow:`inset 0 1px 0 rgba(255,255,255,.22),0 3px 12px ${opp.color}35`,
                display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
              }}>
                <span style={{fontSize:15,fontFamily:FD,fontWeight:600,color:opp.color==='#FFD60A'?'#000':'#fff',letterSpacing:'-.2px'}}>Оставить заявку</span>
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function SubsSC({pop}){
  const[sel,setSel]=useState(1);
  const plans=[
    {n:'Стартер',p:990,per:'мес',color:'var(--eblue)',g:'linear-gradient(145deg,#001630,#002a54)',perks:['1 визит в месяц','Скидка 10% в ресторанах','Карта лояльности']},
    {n:'Про',p:2490,per:'мес',color:'var(--egreen)',g:'linear-gradient(145deg,#001a0f,#003020)',popular:true,perks:['Безлимитные визиты','Скидка 20% везде','Приоритет бронирования','1 МК в месяц бесплатно','Гостевые билеты × 2']},
    {n:'Максимум',p:5990,per:'мес',color:'var(--epu)',g:'linear-gradient(145deg,#1a001a,#330033)',perks:['VIP-доступ 24/7','Скидка 35% везде','Персональный менеджер','МК без ограничений','VIP-зона + паркинг','Трансфер из Москвы']},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Подписки" back={pop}/>
    <div style={{flex:1,overflowY:'auto',padding:'8px 20px 120px'}}>
      <div style={{textAlign:'center',marginBottom:22}}>
        <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.5px'}}>Выберите план</div>
        <div style={{fontSize:14,fontFamily:FT,color:l3,marginTop:4}}>Отмена в любой момент</div>
      </div>
      {plans.map((pl,i)=><div key={i} onClick={()=>setSel(i)} className="eth-press" style={{background:bg2,borderRadius:22,overflow:'hidden',marginBottom:14,border:`1.5px solid ${sel===i?pl.color:sep2}`,cursor:'pointer',transition:'border-color .2s'}}>
        {pl.popular&&<div style={{background:pl.color,padding:'6px 0',textAlign:'center'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:700,color:'#fff',letterSpacing:'.3px'}}>ПОПУЛЯРНЫЙ</span>
        </div>}
        <div style={{background:pl.g,padding:'18px 20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:22,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.5px'}}>{pl.n}</div>
              <div style={{fontSize:36,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-1px',marginTop:4,lineHeight:1}}>
                {pl.p.toLocaleString('ru-RU')} ₽<span style={{fontSize:16,fontWeight:400,color:'rgba(255,255,255,.6)'}}> /{pl.per}</span>
              </div>
            </div>
            {sel===i&&<div style={{width:28,height:28,borderRadius:14,background:pl.color,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Ic.check s={14} c="#fff"/>
            </div>}
          </div>
        </div>
        <div style={{padding:'14px 20px 18px'}}>
          {pl.perks.map((pk,j)=><div key={j} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div style={{width:18,height:18,borderRadius:9,background:`${pl.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Ic.check s={9} c={pl.color}/>
            </div>
            <span style={{fontSize:14,fontFamily:FT,color:l2,letterSpacing:'-.1px'}}>{pk}</span>
          </div>)}
        </div>
      </div>)}
    </div>
    <div style={{padding:'12px 20px 24px',borderTop:`0.5px solid ${sep2}`,background:bg,flexShrink:0}}>
      <Btn label={`Подключить «${plans[sel].n}» — ${plans[sel].p.toLocaleString('ru-RU')} ₽/мес`} color={plans[sel].color}/>
    </div>
  </div>;
}

//  CERTIFICATES SCREEN
function CertsSC({push,pop}){
  const[tab,setTab]=useState(0);
  const types=[
    {em:'🌿',n:'Этно-путешествие',sub:'Подходит для 1–4 гостей',amounts:[2000,5000,10000],g:'linear-gradient(135deg,#001a0f,#003020)'},
    {em:'💆',n:'День релакса',sub:'СПА + Обед + Прогулка',amounts:[3500,7000,15000],g:'linear-gradient(135deg,#1a001a,#330033)'},
    {em:'🎭',n:'Вечер впечатлений',sub:'Шоу + Ужин + Бонусы',amounts:[2500,5000,8000],g:'linear-gradient(135deg,#001630,#002a54)'},
  ];
  const mine=[
    {em:'🌿',n:'Этно-путешествие',code:'CERT-7X2K',p:'5 000 ₽',exp:'01.06.2026'},
    {em:'💆',n:'День релакса',code:'CERT-9P4M',p:'3 500 ₽',exp:'15.07.2026'},
  ];
  const[chosen,setChosen]=useState({});

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Сертификаты" back={pop}/>
    <div style={{padding:'0 20px 12px',flexShrink:0}}>
      <div style={{display:'flex',background:f3,borderRadius:12,padding:3}}>
        {['Купить','Мои'].map((t,i)=><div key={i} onClick={()=>setTab(i)} style={{flex:1,borderRadius:10,padding:'7px 0',textAlign:'center',cursor:'pointer',background:tab===i?bg2:'transparent',transition:'background .2s'}}>
          <span style={{fontSize:14,fontFamily:FT,fontWeight:tab===i?600:400,color:tab===i?l1:l3}}>{t}</span>
        </div>)}
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'4px 20px 100px'}}>
      {tab===0&&types.map((tp,i)=><div key={i} style={{background:bg2,borderRadius:20,overflow:'hidden',marginBottom:14,border:`0.5px solid ${sep2}`}}>
        <div style={{background:tp.g,padding:'18px 20px',display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:42}}>{tp.em}</span>
          <div><div style={{fontSize:18,fontFamily:FD,fontWeight:700,color:'#fff',letterSpacing:'-.4px'}}>{tp.n}</div>
          <div style={{fontSize:13,fontFamily:FT,color:'rgba(255,255,255,.6)',marginTop:2}}>{tp.sub}</div></div>
        </div>
        <div style={{padding:'14px 16px 16px'}}>
          <div style={{fontSize:12,fontFamily:FT,color:l3,marginBottom:10,letterSpacing:'.2px'}}>ВЫБЕРИТЕ НОМИНАЛ</div>
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            {tp.amounts.map((a,j)=><div key={j} onClick={()=>setChosen(c=>({...c,[i]:j}))} className="eth-press" style={{flex:1,borderRadius:12,border:`1.5px solid ${chosen[i]===j?green:sep2}`,background:chosen[i]===j?`${green}14`:'transparent',padding:'10px 0',textAlign:'center',cursor:'pointer',transition:'all .2s'}}>
              <span style={{fontSize:14,fontFamily:FD,fontWeight:600,color:chosen[i]===j?green:l2}}>{a.toLocaleString('ru-RU')} ₽</span>
            </div>)}
          </div>
          <Btn label="Купить сертификат" size="m" color={chosen[i]!==undefined?green:l3} onPress={()=>{}} style={{opacity:chosen[i]!==undefined?1:.5}}/>
        </div>
      </div>)}

      {tab===1&&<div className="eth-fadein">
        {mine.map((m,i)=><div key={i} style={{background:bg2,borderRadius:20,padding:'16px 18px',marginBottom:12,border:`0.5px solid ${sep2}`}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <span style={{fontSize:32}}>{m.em}</span>
            <div><div style={{fontSize:17,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.3px'}}>{m.n}</div>
            <div style={{fontSize:14,fontFamily:FD,fontWeight:700,color:green,letterSpacing:'-.3px',marginTop:2}}>{m.p}</div></div>
          </div>
          <div style={{background:f3,borderRadius:12,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:13,fontFamily:'monospace',color:l2,letterSpacing:'.5px'}}>{m.code}</div>
            <div style={{background:blue,borderRadius:9,padding:'4px 12px',cursor:'pointer'}}>
              <span style={{fontSize:12,fontFamily:FT,fontWeight:600,color:'#fff'}}>Копировать</span>
            </div>
          </div>
          <div style={{fontSize:12,fontFamily:FT,color:l4,marginTop:8}}>Действует до {m.exp}</div>
        </div>)}
      </div>}
    </div>
  </div>;
}

//  NOTIFICATIONS SCREEN
function NotifyScreen({pop,push}){
  const[filter,setFilter]=useState('all');
  const[read,setRead]=useState(new Set());
  const markAll=()=>setRead(new Set(NOTIFS.map((_,i)=>i)));

  const NOTIFS=[
    {em:'🎭',t:'Фестиваль Индии начинается через 2 часа',sub:'Сегодня · 18:00 · Главная арена',time:'Только что',unread:true,type:'event',color:'#E91E63',action:{label:'Смотреть программу',s:'events'},group:'today'},
    {em:'⚡',t:'Осталось 3 места на Djembe-мастер-класс',sub:'Завтра · 19:00',time:'15 мин назад',unread:true,type:'alert',color:red,action:{label:'Забронировать',s:'masterclasses'},group:'today'},
    {em:'🎁',t:'Скидка 20% на СПА в будние дни',sub:'Только до воскресенья',time:'1 ч назад',unread:true,type:'promo',color:purple,action:{label:'Активировать',s:'spa'},group:'today'},
    {em:'✅',t:'Бронь подтверждена: Русская баня',sub:'Сб 11 марта · 14:00',time:'2 ч назад',unread:false,type:'booking',color:green,confirm:{cancel:'Отменить'},group:'today'},
    {em:'🌍',t:'Вы получили визу Индии!',sub:'Паспорт гражданина мира пополнен',time:'Вчера, 11:20',unread:false,type:'passport',color:blue,action:{label:'Открыть паспорт',s:'passport'},group:'yesterday'},
    {em:'🏆',t:'Уровень «Знаток мира» достигнут',sub:'Открыты новые привилегии',time:'Вчера, 09:00',unread:false,type:'level',color:'#FFD60A',action:{label:'Посмотреть награды',s:'loyalty'},group:'yesterday'},
    {em:'📸',t:'Ваши фото готовы к скачиванию',sub:'Фотосессия от 09.03',time:'2 дня назад',unread:false,type:'photo',color:orange,action:{label:'Скачать',s:'photo'},group:'earlier'},
    {em:'⭐',t:'Оцените посещение ресторана «Сакура»',sub:'Ваш отзыв важен для нас',time:'3 дня назад',unread:false,type:'review',color:'#FFD60A',action:{label:'Оставить отзыв',s:'food'},group:'earlier'},
    {em:'🚗',t:'Аренда электрокара доступна со скидкой',sub:'Суббота-воскресенье · −25%',time:'3 дня назад',unread:false,type:'promo',color:green,action:{label:'Арендовать',s:'transfer'},group:'earlier'},
  ];

  const unreadCount=NOTIFS.filter((n,i)=>n.unread&&!read.has(i)).length;
  const getShown=()=>{
    let ns=NOTIFS;
    if(filter==='unread') ns=ns.filter((n,i)=>n.unread&&!read.has(i));
    else if(filter!=='all') ns=ns.filter(n=>n.type===filter);
    return ns;
  };
  const shown=getShown();

  const groups=[
    {id:'today',label:'Сегодня'},
    {id:'yesterday',label:'Вчера'},
    {id:'earlier',label:'Ранее'},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?8:0}}>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Уведомления</div>
        {unreadCount>0&&<div style={{fontSize:12,color:blue,fontFamily:FT,marginTop:1}}>{unreadCount} непрочитанных</div>}
      </div>
      {unreadCount>0&&<div onClick={markAll} className="eth-tap" style={{padding:'6px 12px',borderRadius:10,background:`${blue}12`,cursor:'pointer'}}>
        <span style={{fontSize:11,fontWeight:600,color:blue,fontFamily:FT}}>Прочитать все</span>
      </div>}
    </div>

    {/* Filter */}
    <div style={{padding:'10px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
      {[['all','Все'],['unread','Новые'],['event','События'],['booking','Брони'],['promo','Акции']].map(([id,lbl])=>(
        <div key={id} onClick={()=>setFilter(id)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',background:filter===id?l1:'var(--ef2)',border:filter===id?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:filter===id?600:400,color:filter===id?bg:l2}}>{lbl}</span>
        </div>
      ))}
    </div>

    <div style={{flex:1,overflowY:'auto',padding:'0 20px 100px'}}>
      {(filter==='all'||filter==='unread')?groups.map(g=>{
        const items=shown.filter(n=>n.group===g.id);
        if(items.length===0) return null;
        return <div key={g.id}>
          <div style={{fontSize:12,fontWeight:700,color:l4,fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',padding:'16px 0 8px'}}>{g.label}</div>
          {items.map((n,i)=>{
            const idx=NOTIFS.indexOf(n);
            const isRead=read.has(idx);
            return <NotifCard key={i} n={n} isRead={isRead} onRead={()=>setRead(r=>new Set([...r,idx]))} push={push}/>;
          })}
        </div>;
      }):(
        <div style={{paddingTop:16}}>
          {shown.map((n,i)=>{
            const idx=NOTIFS.indexOf(n);
            return <NotifCard key={i} n={n} isRead={read.has(idx)} onRead={()=>setRead(r=>new Set([...r,idx]))} push={push}/>;
          })}
          {shown.length===0&&<div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:48,marginBottom:12}}>🔔</div>
            <div style={{fontSize:16,fontWeight:600,color:l1,fontFamily:FT}}>Всё прочитано</div>
            <div style={{fontSize:13,color:l3,fontFamily:FT,marginTop:6}}>Новых уведомлений нет</div>
          </div>}
        </div>
      )}
    </div>
  </div>;
}
function NotifCard({n,isRead,onRead,push}){
  return <div onClick={onRead} className="eth-tap" style={{marginBottom:8,background:(!isRead&&n.unread)?'var(--ef2)':'transparent',borderRadius:18,padding:(!isRead&&n.unread)?'14px 14px':0,border:(!isRead&&n.unread)?'0.5px solid var(--es2)':'none',cursor:'pointer',transition:'all .3s'}}>
    <div style={{display:'flex',gap:12,alignItems:'flex-start',padding:(!isRead&&n.unread)?0:'10px 0',borderBottom:(!isRead&&n.unread)?'none':'0.5px solid var(--es2)'}}>
      <div style={{position:'relative',flexShrink:0}}>
        <div style={{width:46,height:46,borderRadius:14,background:`${n.color}15`,border:`0.5px solid ${n.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{n.em}</div>
        {!isRead&&n.unread&&<div style={{position:'absolute',top:-2,right:-2,width:10,height:10,borderRadius:5,background:blue,border:'2px solid var(--eb)'}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:(!isRead&&n.unread)?700:500,color:l1,fontFamily:FT,lineHeight:1.4,marginBottom:3}}>{n.t}</div>
        <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:4}}>{n.sub}</div>
        <div style={{fontSize:10,color:l4,fontFamily:FT,marginBottom:n.action||n.confirm?8:0}}>{n.time}</div>
        {n.action&&<div onClick={e=>{e.stopPropagation();push&&push(n.action.s);}} className="eth-tap" style={{display:'inline-flex',background:`${n.color}12`,borderRadius:8,padding:'5px 12px',cursor:'pointer',border:`0.5px solid ${n.color}25`}}>
          <span style={{fontSize:11,fontWeight:600,color:n.color,fontFamily:FT}}>{n.action.label} →</span>
        </div>}
        {n.confirm&&<div style={{display:'flex',gap:8}}>
          <div onClick={e=>e.stopPropagation()} className="eth-tap" style={{flex:1,background:`${red}12`,borderRadius:8,padding:'5px 12px',textAlign:'center',cursor:'pointer',border:`0.5px solid ${red}25`}}>
            <span style={{fontSize:11,fontWeight:600,color:red,fontFamily:FT}}>{n.confirm.cancel}</span>
          </div>
        </div>}
      </div>
    </div>
  </div>;
}


function SettingsScreen({pop,dark,setDark}){
  const[notif,setNotif]=useState(true);
  const[geo,setGeo]=useState(true);
  const[analytics,setAnalytics]=useState(false);
  const Toggle=({val,set})=><div onClick={()=>set(!val)} className="eth-tap" style={{
    width:48,height:28,borderRadius:14,cursor:'pointer',
    background:val?green:'var(--es2)',
    position:'relative',transition:'background .25s cubic-bezier(.34,1.3,.64,1)',flexShrink:0,
  }}>
    <div style={{
      position:'absolute',top:3,left:val?22:3,width:22,height:22,borderRadius:11,
      background:'#fff',boxShadow:'0 2px 6px rgba(0,0,0,.2)',
      transition:'left .25s cubic-bezier(.34,1.5,.64,1)',
    }}/>
  </div>;
  const Row=({em,title,sub,right,onClick})=><div onClick={onClick} className={onClick?'eth-tap':''} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 0',borderBottom:'0.5px solid var(--es2)',cursor:onClick?'pointer':'default'}}>
    <div style={{width:34,height:34,borderRadius:10,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{em}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:14,fontWeight:500,color:l1,fontFamily:FT}}>{title}</div>
      {sub&&<div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>{sub}</div>}
    </div>
    {right||<Ic.chevR s={7} c={l4}/>}
  </div>;
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Настройки" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100,padding:'0 20px'}}>
      <div style={{marginBottom:24,paddingTop:8}}>
        <div style={{fontSize:11,color:l4,fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,marginLeft:4}}>Интерфейс</div>
        <div style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'0 16px'}}>
          <Row em="🌙" title="Тёмная тема" sub={dark?'Включена':'Выключена'} right={<Toggle val={dark} set={setDark}/>}/>
          <Row em="🌍" title="Язык" sub="Русский"/>
          <Row em="📐" title="Размер шрифта" sub="Стандартный" onClick={()=>{}}/>
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,color:l4,fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,marginLeft:4}}>Уведомления</div>
        <div style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'0 16px'}}>
          <Row em="🔔" title="Push-уведомления" sub="События и акции" right={<Toggle val={notif} set={setNotif}/>}/>
          <Row em="🎭" title="Напоминания о событиях" sub="За 2 часа до начала" onClick={()=>{}}/>
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,color:l4,fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,marginLeft:4}}>Приватность</div>
        <div style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'0 16px'}}>
          <Row em="📍" title="Геолокация" sub="Для аудиогида и навигации" right={<Toggle val={geo} set={setGeo}/>}/>
          <Row em="📊" title="Аналитика" sub="Улучшение приложения" right={<Toggle val={analytics} set={setAnalytics}/>}/>
          <Row em="🔐" title="Данные и приватность" onClick={()=>{}}/>
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,color:l4,fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,marginLeft:4}}>О приложении</div>
        <div style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'0 16px'}}>
          <Row em="ℹ️" title="О Этномире" sub="Культурно-образовательный парк" onClick={()=>{}}/>
          <Row em="⭐" title="Оценить приложение" onClick={()=>{}}/>
          <Row em="📞" title="Поддержка" sub="+7 (484) 399-00-44" onClick={()=>{}}/>
          <Row em="📄" title="Версия" sub="v10.0 · iOS 26 ready" right={<span/>}/>
        </div>
      </div>
    </div>
  </div>;
}

function ExcSC({push,pop}){
  const[dur,setDur]=useState('all');
  const durs=['all','45 мин','1ч','1.5ч','2ч','до 2ч'];
  // Реальные экскурсии ЭТНОМИРА (источник: ethnomir.ru/posetitelyam/excursions/)
  const EXCURSIONS=[
    {em:'🌍',name:'Ознакомительная обзорная',sub:'Улица Мира · 45 жилищ разных народов',price:0,dur:'2ч',r:4.9,color:'#5E5CE6',
     included:['Гид-экскурсовод','Павильон «Вокруг света»','Все этнодворы'],age:'12+',group:20,
     desc:'Кругосветное путешествие за 1 день: японский минка, корейский ханок, европейский фахверк, дом из бамбука. Проходит по этнодворам и Улице Мира. Входит в программу дня.'},
    {em:'🏠',name:'«Открываем ЭТНОМИР»',sub:'Полный обзор · Все этнодворы',price:0,dur:'2ч',r:4.8,color:'#34C759',
     included:['Гид-экскурсовод','Все этнодворы парка'],age:'0+',group:25,
     desc:'Знакомство с Музеем русской печи, этнодворами Украины, Беларуси, Севера, Сибири, Дальнего Востока и стран Южной Азии. Разные народы — один день.'},
    {em:'🔥',name:'«В каждой сторонке своя избёнка»',sub:'Музей Русской Печи · Смотровая',price:350,dur:'1.5ч',r:4.9,color:'#C0392B',
     included:['Гид','Подъём на смотровую','История печи'],age:'0+',group:20,
     desc:'Обзорная экскурсия по Музею Русской Печи. 12-метровая печь, 9 домиков-изб, подъём на смотровую площадку с панорамой парка. Рассказ о роли печи в жизни славян.'},
    {em:'🐘',name:'«Путешествие по штатам Индии»',sub:'Культурный центр Индии · Индиология',price:300,dur:'1ч',r:4.8,color:'#FF9933',
     included:['Гид','Примерка сари','Легенды Индии'],age:'0+',group:20,
     desc:'Погружение в культуру Индии в Культурном центре. Древние легенды, мифология, Тадж-Махал, специи и традиции разных штатов.'},
    {em:'🧘',name:'«Магия кочевых обрядов»',sub:'Тувинская чайная · Шаманизм',price:500,dur:'1.5ч',r:4.8,color:'#C2862A',
     included:['Хранитель культуры','Тувинская чайная','Обряды Севера'],age:'12+',group:15,
     desc:'Экскурсия по этнодворам Севера, Сибири и Дальнего Востока с тувинской чайной церемонией. Шаманизм, обряды, жилища кочевых народов.'},
    {em:'🎊',name:'«Свадебные традиции народов Алтая»',sub:'Хакасская свадьба · Обряды',price:400,dur:'1.5ч',r:4.7,color:'#8E44AD',
     included:['Актёры-хранители','Обряды','Костюмы'],age:'0+',group:20,
     desc:'Яркая интерактивная программа — «Хакасская свадьба». Традиции народов Алтая и Саян, ритуалы сватовства, свадебные костюмы, хороводы.'},
    {em:'🌿',name:'«Загадки простых вещей»',sub:'Этнография · Предметы быта',price:350,dur:'1ч',r:4.7,color:'#5F7D5A',
     included:['Гид','Загадки','Сувенир'],age:'6+',group:20,
     desc:'Чем пользовались в быту разные народы? Загадочные предметы старины из мировых этнодворов — гид расскажет историю каждого.'},
    {em:'🎸',name:'«Традиционное алтайское песнопение»',sub:'Горловое пение · Живой концерт',price:0,dur:'45 мин',r:4.9,color:'#C2862A',
     included:['Живое выступление','Рассказ о традициях'],age:'0+',group:50,
     desc:'Интерактивная программа с исполнителем традиционного алтайского горлового пения. Уникальный звук — «голос природы». Входит в программу дня.'},
    {em:'👤',name:'Индивидуальная экскурсия',sub:'1–10 человек · Любая тема',price:13000,dur:'до 2ч',r:4.9,color:'#5E5CE6',
     included:['Личный гид','Любой маршрут','Интерактив'],age:'0+',group:10,
     desc:'Персональная программа на 1–10 человек. Выбор темы, глубокое погружение, личный контакт с хранителями культур. Возможна примерка костюмов, фотосессия. 13 000₽ за программу.'},
  ];

  const shown=dur==='all'?EXCURSIONS:EXCURSIONS.filter(e=>e.dur===dur);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Экскурсии" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Hero banner */}
      <div style={{
        margin:'0 20px 20px',borderRadius:20,
        background:'linear-gradient(135deg,#1B4332,#2D6A4F)',
        padding:'20px',overflow:'hidden',position:'relative',
      }}>
        <div style={{position:'absolute',right:-10,top:-10,fontSize:64,opacity:.25}}>🧭</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:FT,letterSpacing:'.3px',textTransform:'uppercase',marginBottom:6}}>Добро пожаловать</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>Экскурсии по Этномиру</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:FT}}>Обзорные · Тематические · Индивидуальные · Ежедневно с 10:00</div>
      </div>

      {/* Duration filter */}
      <div style={{padding:'0 20px 16px',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
        {durs.map(d=><div key={d} onClick={()=>setDur(d)} className="eth-tap" style={{
          flexShrink:0,borderRadius:20,padding:'7px 16px',cursor:'pointer',
          background:dur===d?l1:'var(--ef2)',border:dur===d?'none':'0.5px solid var(--es2)',
          transition:'all .2s cubic-bezier(.34,1.3,.64,1)',
        }}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:dur===d?600:400,color:dur===d?bg:l2}}>
            {d==='all'?'Все':d==='день'?'Целый день':d}
          </span>
        </div>)}
      </div>

      {/* Cards */}
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
        {shown.map((ex,i)=><div key={i} onClick={()=>push('booking',{service:ex,title:ex.name})} className="eth-tap eth-card" style={{
          borderRadius:20,background:'var(--ef2)',border:'0.5px solid var(--es2)',
          cursor:'pointer',overflow:'hidden',
        }}>
          <div style={{display:'flex',gap:14,padding:'16px 16px 12px'}}>
            <div style={{
              width:60,height:60,borderRadius:18,flexShrink:0,
              background:`linear-gradient(135deg,${ex.color}25,${ex.color}10)`,
              border:`0.5px solid ${ex.color}30`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,
            }}>{ex.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px'}}>{ex.name}</div>
              <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:2}}>{ex.sub}</div>
              <div style={{display:'flex',gap:10,marginTop:5}}>
                <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {ex.dur}</span>
                <span style={{fontSize:11,color:l3,fontFamily:FT}}>👥 до {ex.group} чел</span>
                <span style={{fontSize:11,color:'#FFD60A',fontFamily:FT}}>★ {ex.r}</span>
              </div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:18,fontWeight:700,color:l1,fontFamily:FD}}>{ex.price}₽</div>
              <div style={{fontSize:10,color:l3,fontFamily:FT,marginTop:1}}>/ чел</div>
              <div style={{
                marginTop:6,background:ex.color,borderRadius:10,padding:'4px 10px',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                <span style={{fontSize:11,color:'#fff',fontFamily:FT,fontWeight:600}}>{ex.age}</span>
              </div>
            </div>
          </div>
          {/* Included */}
          <div style={{padding:'0 16px 14px',display:'flex',gap:6,flexWrap:'wrap'}}>
            {ex.included.map((inc,j)=><div key={j} style={{
              display:'flex',alignItems:'center',gap:4,
              background:'var(--ef3)',borderRadius:8,padding:'4px 8px',
            }}>
              <span style={{fontSize:10,color:green}}>✓</span>
              <span style={{fontSize:10,color:l2,fontFamily:FT}}>{inc}</span>
            </div>)}
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function PhotoSC({push,pop}){
  const PACKAGES=[
    {em:'📸',n:'Этно-портрет',sub:'1 чел · 30 мин · 20 фото',p:2500,color:blue,
     includes:['Профессиональная камера','2 локации','Обработка за 24 ч','Готовые файлы'],
     desc:'Портрет в народном костюме на фоне этнических локаций. Ретушь и цветокоррекция включены'},
    {em:'👫',n:'Love story',sub:'2 чел · 60 мин · 40 фото',p:4500,color:pink,
     includes:['Стилист-консультация','4 локации','Обработка за 48 ч','USB-флешка'],
     desc:'Романтическая съёмка пары среди этнических пейзажей. Самые красивые уголки парка'},
    {em:'👨‍👩‍👧',n:'Семейный фотосет',sub:'Семья · 90 мин · 60 фото',p:7000,color:orange,
     includes:['4–5 локаций','Костюмы народов мира','Обработка 72 ч','Фотокнига в подарок'],
     desc:'Незабываемые воспоминания всей семьи. Дети в национальных костюмах — это очень мило'},
    {em:'🎭',n:'Образ народа',sub:'Грим · Костюм · 40 мин',p:3200,color:purple,
     includes:['Грим и костюм','Профессиональный свет','3 образа','30 фото'],
     desc:'Перевоплощение в гейшу, самурая, казака или любой образ из 20 вариантов. Полный грим'},
    {em:'🌅',n:'Закатная съёмка',sub:'Золотой час · 2 чел · 60 мин',p:5500,color:'#FF9500',
     includes:['Дрон включён','Золотой час','5 локаций','50 фото + видео 1 мин'],
     desc:'Съёмка на закате — самый красивый свет. Включает аэросъёмку дроном над парком'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Фотопрогулка" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#1a0a1e,#2d1060,#4a0a5a)',padding:'20px 20px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-15,top:-15,fontSize:80,opacity:.12}}>📸</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>Фотография · Образы · Воспоминания</div>
        <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>Фото в Этномире</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT}}>Профессиональный фотограф · 5 пакетов · Обработка включена</div>
      </div>
      <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {PACKAGES.map((pk,i)=><div key={i} onClick={()=>push('booking',{service:pk,title:pk.n})} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:`0.5px solid ${pk.color}20`,overflow:'hidden',cursor:'pointer'}}>
          <div style={{height:4,background:`linear-gradient(90deg,${pk.color},${pk.color}44)`}}/>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:12,marginBottom:10}}>
              <div style={{width:54,height:54,borderRadius:16,background:`${pk.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{pk.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2}}>{pk.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT}}>{pk.sub}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{pk.p.toLocaleString('ru')}₽</div>
              </div>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{pk.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {pk.includes.map((inc,j)=><div key={j} style={{background:`${pk.color}10`,border:`0.5px solid ${pk.color}20`,borderRadius:8,padding:'3px 8px',display:'flex',gap:4}}>
                <span style={{fontSize:9,color:pk.color}}>✓</span><span style={{fontSize:10,color:l2,fontFamily:FT}}>{inc}</span>
              </div>)}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function AudioSC({push,pop}){
  const[lang,setLang]=useState('ru');
  const langs=[{id:'ru',em:'🇷🇺',n:'Русский'},{id:'en',em:'🇬🇧',n:'English'},{id:'zh',em:'🇨🇳',n:'中文'},{id:'de',em:'🇩🇪',n:'Deutsch'}];
  const ROUTES=[
    {em:'🌍',n:'Полный тур: Весь парк',sub:'60 остановок · 4 часа',price:0,r:4.9,
     feats:['Карта оффлайн','Авто-запуск по GPS','Музыка народов'],
     desc:'Полный аудиогид по всему парку. GPS автоматически запускает рассказ у каждого объекта'},
    {em:'🏯',n:'Маршрут «Деревянная Русь»',sub:'15 остановок · 1.5 часа',price:0,r:4.8,
     feats:['Истории о срубах','Народная музыка','Загадки'],
     desc:'Погружение в историю деревянного зодчества России. От избы до церкви'},
    {em:'🕌',n:'Маршрут «Восток»',sub:'12 остановок · 1 час',price:0,r:4.9,
     feats:['История ислама','Арабская музыка','Поэзия'],
     desc:'Путешествие по восточным дворам — Казахстан, Узбекистан, Марокко, Турция'},
    {em:'🎧',n:'Экскурсия с живым гидом',sub:'Персональный гид в наушниках',price:1500,r:4.9,
     feats:['Живой гид онлайн','Вопросы в реальном времени','Видео-звонок'],
     desc:'Эксперт-этнограф ведёт вас через наушники. Задавайте вопросы в реальном времени'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Аудиогид" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#0a0a1e,#1a1060,#0E1a40)',padding:'20px 20px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-15,top:-15,fontSize:80,opacity:.12}}>🎧</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>GPS · Оффлайн · 4 языка</div>
        <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>Аудиогид Этномира</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginBottom:16}}>60 остановок · Авто-GPS · Народная музыка · Бесплатно</div>
        <div style={{display:'flex',gap:8,background:'rgba(255,255,255,.08)',borderRadius:16,padding:6}}>
          {langs.map(l=><div key={l.id} onClick={()=>setLang(l.id)} className="eth-tap" style={{flex:1,borderRadius:12,padding:'8px 4px',textAlign:'center',cursor:'pointer',background:lang===l.id?'rgba(255,255,255,.2)':'transparent',transition:'all .2s'}}>
            <div style={{fontSize:16}}>{l.em}</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:2}}>{l.n}</div>
          </div>)}
        </div>
      </div>
      <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {ROUTES.map((r,i)=><div key={i} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer',padding:'16px'}} onClick={()=>push('audioplayer',{route:rt})}>
          <div style={{display:'flex',gap:12,marginBottom:10}}>
            <div style={{width:52,height:52,borderRadius:16,background:`${blue}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{r.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2}}>{r.n}</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:5}}>{r.sub}</div>
              <div style={{display:'flex',gap:8}}><span style={{fontSize:11,color:'#FFD60A'}}>★ {r.r}</span></div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              {r.price===0
                ?<div style={{background:`${green}15`,borderRadius:10,padding:'5px 10px'}}><span style={{fontSize:12,fontWeight:700,color:green,fontFamily:FD}}>Бесплатно</span></div>
                :<div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{r.price}₽</div>}
            </div>
          </div>
          <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{r.desc}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {r.feats.map((f,j)=><div key={j} style={{background:`${blue}10`,border:`0.5px solid ${blue}20`,borderRadius:8,padding:'3px 9px'}}>
              <span style={{fontSize:10,color:blue,fontFamily:FT}}>▶ {f}</span>
            </div>)}
          </div>
        </div>)}
      </div>
      <div style={{padding:'0 20px'}}>
        <div style={{borderRadius:18,background:`${blue}12`,border:`0.5px solid ${blue}20`,padding:'16px',display:'flex',gap:12}}>
          <span style={{fontSize:28}}>📱</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT,marginBottom:4}}>Скачайте приложение</div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5}}>Аудиогид работает без интернета. Скачайте маршруты заранее и слушайте оффлайн</div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function ProductDetailSC({push,pop,params={}}){
  const p=params.product||{em:'🏺',n:'Керамика ручной работы',sub:'Гончарные изделия',p:1200,r:4.9,cat:'сувениры'};
  const[qty,setQty]=useState(1);
  const REVIEWS=[
    {name:'Анна М.',r:5,text:'Привезла в подарок — все в восторге! Очень качественная роспись.',date:'12 марта'},
    {name:'Игорь С.',r:5,text:'Брал набор для чайной церемонии — потрясающее качество для такой цены.',date:'8 марта'},
    {name:'Мария К.',r:4,text:'Красиво, но упаковка могла быть получше. Сам товар отличный.',date:'3 марта'},
  ];
  const RELATED=[
    {em:'🧣',n:'Этно-шарф',p:800},{em:'📿',n:'Оберег',p:450},{em:'🕯',n:'Ароматные свечи',p:980},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title={p.n} back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:120}}>
      {/* Big visual */}
      <div style={{margin:'0 20px 16px',borderRadius:22,background:'var(--ef2)',border:'0.5px solid var(--es2)',height:220,display:'flex',alignItems:'center',justifyContent:'center',fontSize:90,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 60% 40%,var(--ef3),transparent 70%)'}}/>
        {p.em}
      </div>
      <div style={{padding:'0 20px'}}>
        {/* Title */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:4}}>
            <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px',flex:1}}>{p.n}</div>
            <div className="eth-tap" style={{width:36,height:36,borderRadius:18,background:`${red}15`,border:`0.5px solid ${red}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:'pointer'}}>
              <span style={{fontSize:16}}>🤍</span>
            </div>
          </div>
          <div style={{fontSize:13,color:l3,fontFamily:FT,marginBottom:8}}>{p.sub}</div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <span style={{fontSize:12,color:'#FFD60A'}}>{'★'.repeat(Math.floor(p.r||4))} {p.r}</span>
            <span style={{fontSize:11,color:l4,fontFamily:FT}}>42 отзыва</span>
            <span style={{fontSize:10,color:green,fontFamily:FT,fontWeight:600,background:`${green}12`,borderRadius:8,padding:'2px 8px'}}>В наличии</span>
          </div>
        </div>
        {/* Price + qty */}
        <div style={{background:'var(--ef2)',border:'0.5px solid var(--es2)',borderRadius:18,padding:'16px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:26,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.5px'}}>{(p.p*qty).toLocaleString('ru')}₽</div>
            {qty>1&&<div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:1}}>{p.p}₽ × {qty} шт</div>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div onClick={()=>setQty(q=>Math.max(1,q-1))} className="eth-tap" style={{width:36,height:36,borderRadius:18,background:'var(--ef3)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,color:l1}}>−</div>
            <span style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FD,minWidth:20,textAlign:'center'}}>{qty}</span>
            <div onClick={()=>setQty(q=>q+1)} className="eth-tap" style={{width:36,height:36,borderRadius:18,background:blue,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,color:'#fff'}}>+</div>
          </div>
        </div>
        {/* Description */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD,marginBottom:8}}>О товаре</div>
          <div style={{fontSize:13,color:l2,fontFamily:FT,lineHeight:1.6}}>Изделие ручной работы мастеров Этномира. Каждый предмет уникален — небольшие различия в рисунке и форме являются признаком ручного труда, а не браком. Материалы: натуральная глина, безопасная акриловая краска, матовый лак.</div>
        </div>
        {/* Details */}
        <div style={{background:'var(--ef2)',borderRadius:14,overflow:'hidden',marginBottom:16}}>
          {[['🏭','Производство','Этномир, Россия'],['📦','Доставка','Самовывоз или почта РФ'],['↩️','Возврат','14 дней'],['🌿','Материал','Натуральная глина']].map(([em,k,v],j,arr)=><div key={j} style={{display:'flex',gap:12,padding:'10px 14px',borderBottom:j<arr.length-1?'0.5px solid var(--es2)':'none'}}>
            <span style={{fontSize:14}}>{em}</span>
            <span style={{flex:1,fontSize:12,color:l3,fontFamily:FT}}>{k}</span>
            <span style={{fontSize:12,fontWeight:600,color:l1,fontFamily:FT}}>{v}</span>
          </div>)}
        </div>
        {/* Reviews */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD,marginBottom:12}}>Отзывы (42)</div>
          {REVIEWS.map((rv,i)=><div key={i} style={{paddingBottom:12,marginBottom:12,borderBottom:i<REVIEWS.length-1?'0.5px solid var(--es2)':'none'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
              <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{rv.name}</div>
              <div style={{display:'flex',gap:4,alignItems:'center'}}>
                <span style={{fontSize:11,color:'#FFD60A'}}>{'★'.repeat(rv.r)}</span>
                <span style={{fontSize:10,color:l4,fontFamily:FT}}>{rv.date}</span>
              </div>
            </div>
            <div style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.5}}>{rv.text}</div>
          </div>)}
        </div>
      </div>
    </div>
    {/* Buy bar */}
    <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
      <div onClick={()=>push('checkout',{item:{...p,qty},total:p.p*qty})} className="eth-tap" style={{borderRadius:16,padding:'15px',background:blue,textAlign:'center',cursor:'pointer'}}>
        <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>Купить · {(p.p*qty).toLocaleString('ru')}₽</span>
      </div>
    </div>
  </div>;
}

function BusinessSC({push,pop,params={}}){
  const type=params.type||'franchise';
  const[name,setName]=useState('');
  const[phone,setPhone]=useState('');
  const[email,setEmail]=useState('');
  const[company,setCompany]=useState('');
  const[msg,setMsg]=useState('');
  const[sent,setSent]=useState(false);
  const CONFIG={
    franchise:{title:'Заявка на франшизу',em:'🤝',color:blue,
      fields:'Расскажите о вашем опыте в бизнесе и почему выбрали Этномир',
      whatsapp:'Получить презентацию'},
    realestate:{title:'Заявка на недвижимость',em:'🏡',color:green,
      fields:'Укажите интересующий объект и бюджет',
      whatsapp:'Получить условия'},
    b2b:{title:'Корпоративная заявка',em:'🏢',color:purple,
      fields:'Опишите ваши корпоративные нужды',
      whatsapp:'Обсудить условия'},
    partner:{title:'Стать партнёром',em:'🌟',color:orange,
      fields:'Расскажите о вашем проекте',
      whatsapp:'Обсудить партнёрство'},
  };
  const cfg=CONFIG[type]||CONFIG.franchise;
  if(sent) return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title={cfg.title} back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 30px',gap:16}}>
      <div style={{width:80,height:80,borderRadius:28,background:cfg.color+'15',border:`1px solid ${cfg.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40}}>{cfg.em}</div>
      <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,textAlign:'center',letterSpacing:'-.3px'}}>Заявка отправлена!</div>
      <div style={{fontSize:14,color:l2,fontFamily:FT,textAlign:'center',lineHeight:1.6}}>Наш менеджер свяжется с вами в течение 24 часов. Ждите звонка или письма.</div>
      <div onClick={pop} className="eth-tap" style={{marginTop:16,borderRadius:16,padding:'14px 32px',background:cfg.color,cursor:'pointer'}}>
        <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>На главную</span>
      </div>
    </div>
  </div>;

  const Field=({label,val,onChange,ph,multiline})=><div style={{marginBottom:14}}>
    <div style={{fontSize:11,color:l3,fontFamily:FT,letterSpacing:'.3px',textTransform:'uppercase',fontWeight:600,marginBottom:6}}>{label}</div>
    {multiline
      ?<textarea value={val} onChange={e=>onChange(e.target.value)} rows={3} placeholder={ph||''} style={{width:'100%',borderRadius:14,padding:'12px 14px',background:'var(--ef2)',border:'0.5px solid var(--es2)',fontSize:14,color:l1,fontFamily:FT,resize:'none',outline:'none'}}/>
      :<input value={val} onChange={e=>onChange(e.target.value)} placeholder={ph||''} style={{width:'100%',borderRadius:14,padding:'12px 14px',background:'var(--ef2)',border:'0.5px solid var(--es2)',fontSize:14,color:l1,fontFamily:FT,outline:'none'}}/>
    }
  </div>;

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title={cfg.title} back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',padding:'16px 20px 100px'}}>
      {/* Header */}
      <div style={{borderRadius:20,background:`linear-gradient(135deg,${cfg.color}20,${cfg.color}08)`,border:`0.5px solid ${cfg.color}30`,padding:'18px',marginBottom:20,display:'flex',gap:14,alignItems:'center'}}>
        <div style={{width:54,height:54,borderRadius:18,background:cfg.color+'15',border:`0.5px solid ${cfg.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{cfg.em}</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD,marginBottom:3}}>{cfg.title}</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT,lineHeight:1.5}}>{cfg.fields}</div>
        </div>
      </div>
      <Field label="Имя и фамилия" val={name} onChange={setName} ph="Ваше имя"/>
      <Field label="Телефон" val={phone} onChange={setPhone} ph="+7 999 000-00-00"/>
      <Field label="Email" val={email} onChange={setEmail} ph="email@company.ru"/>
      <Field label="Компания / проект" val={company} onChange={setCompany} ph="Название компании"/>
      <Field label="Сообщение" val={msg} onChange={setMsg} ph={cfg.fields} multiline/>
      <div onClick={()=>setSent(true)} className="eth-tap" style={{borderRadius:16,padding:'15px',background:cfg.color,textAlign:'center',cursor:'pointer',marginTop:8}}>
        <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>Отправить заявку</span>
      </div>
      <div style={{marginTop:14,display:'flex',gap:10}}>
        <div className="eth-tap" style={{flex:1,borderRadius:14,padding:'12px',background:'var(--ef2)',border:'0.5px solid var(--es2)',textAlign:'center',cursor:'pointer'}}>
          <span style={{fontSize:12,color:green,fontFamily:FT,fontWeight:600}}>💬 WhatsApp</span>
        </div>
        <div className="eth-tap" style={{flex:1,borderRadius:14,padding:'12px',background:'var(--ef2)',border:'0.5px solid var(--es2)',textAlign:'center',cursor:'pointer'}}>
          <span style={{fontSize:12,color:blue,fontFamily:FT,fontWeight:600}}>📞 Позвонить</span>
        </div>
      </div>
    </div>
  </div>;
}

function PartnerDashSC({push,pop}){
  const[period,setPeriod]=useState('month');
  const METRICS=[
    {em:'👥',label:'Посетителей',val:'1 248',delta:'+12%',color:blue},
    {em:'💰',label:'Выручка',val:'184 500₽',delta:'+8%',color:green},
    {em:'⭐',label:'Средний рейтинг',val:'4.8',delta:'+0.1',color:yellow},
    {em:'🔄',label:'Повторных визитов',val:'34%',delta:'+5%',color:purple},
  ];
  const SERVICES=[
    {n:'Мастер-класс «Гончарный круг»',visits:142,revenue:'255 600₽',r:4.9},
    {n:'Аренда площадки «Юрта»',visits:23,revenue:'1 495 000₽',r:4.8},
    {n:'Батик по шёлку',visits:89,revenue:'222 500₽',r:4.8},
    {n:'Тайский массаж',visits:167,revenue:'534 400₽',r:4.9},
  ];
  const REVIEWS=[
    {text:'Отличный мастер-класс! Дети в восторге.',r:5,name:'Анна М.'},
    {text:'Красивое место, хороший сервис.',r:5,name:'Игорь С.'},
    {text:'Очень понравилось, приедем ещё.',r:4,name:'Мария К.'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Партнёрская панель" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(160deg,#0a1628,#1a2a4a)',padding:'16px 20px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,marginBottom:4}}>Добро пожаловать,</div>
          <div style={{fontSize:20,fontWeight:700,color:'#fff',fontFamily:FD}}>Этно-Мастер СПА 💆</div>
        </div>
        <div style={{background:'rgba(255,255,255,.12)',backdropFilter:'blur(8px)',borderRadius:12,padding:'8px 14px',border:'0.5px solid rgba(255,255,255,.2)'}}>
          <span style={{fontSize:11,color:'#fff',fontFamily:FT,fontWeight:600}}>Партнёр ★ Pro</span>
        </div>
      </div>
      {/* Period filter */}
      <div style={{padding:'12px 20px 0',display:'flex',gap:8}}>
        {[['week','Неделя'],['month','Месяц'],['year','Год']].map(([id,label])=>(
          <div key={id} onClick={()=>setPeriod(id)} className="eth-tap" style={{flex:1,borderRadius:12,padding:'8px',textAlign:'center',cursor:'pointer',background:period===id?l1:'var(--ef2)',border:period===id?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
            <span style={{fontSize:12,fontFamily:FT,fontWeight:period===id?600:400,color:period===id?bg:l2}}>{label}</span>
          </div>
        ))}
      </div>
      {/* Metrics grid */}
      <div style={{padding:'12px 20px 0',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {METRICS.map((m,i)=>(
          <div key={i} style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'14px'}}>
            <div style={{fontSize:18,marginBottom:6}}>{m.em}</div>
            <div style={{fontSize:18,fontWeight:700,color:l1,fontFamily:FD,marginBottom:2}}>{m.val}</div>
            <div style={{fontSize:10,color:l3,fontFamily:FT,marginBottom:4}}>{m.label}</div>
            <div style={{background:m.color+'15',borderRadius:8,padding:'2px 8px',display:'inline-flex'}}>
              <span style={{fontSize:10,color:m.color,fontFamily:FT,fontWeight:600}}>{m.delta}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Top services */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FD,marginBottom:10}}>Ваши услуги</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {SERVICES.map((sv,i)=>(
            <div key={i} style={{borderRadius:14,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT,marginBottom:2}}>{sv.n}</div>
                <div style={{display:'flex',gap:10}}>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>{sv.visits} визитов</span>
                  <span style={{fontSize:11,color:green,fontFamily:FT,fontWeight:600}}>{sv.revenue}</span>
                </div>
              </div>
              <span style={{fontSize:12,color:'#FFD60A'}}>★ {sv.r}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Recent reviews */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FD,marginBottom:10}}>Последние отзывы</div>
        {REVIEWS.map((rv,i)=>(
          <div key={i} style={{padding:'10px 0',borderBottom:i<REVIEWS.length-1?'0.5px solid var(--es2)':'none'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
              <span style={{fontSize:12,fontWeight:600,color:l1,fontFamily:FT}}>{rv.name}</span>
              <span style={{fontSize:12,color:'#FFD60A'}}>{'★'.repeat(rv.r)}</span>
            </div>
            <div style={{fontSize:12,color:l2,fontFamily:FT}}>{rv.text}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function AffiliateSC({pop}){
  const[copied,setCopied]=useState(false);
  const REF_CODE='ETHNO-ALEX-7842';
  const STATS=[
    {em:'👥',label:'Приведено друзей',val:'12',color:blue},
    {em:'💰',label:'Заработано',val:'2 400₽',color:green},
    {em:'🔄',label:'Конверсия',val:'67%',color:purple},
    {em:'⏳',label:'Ожидает выплаты',val:'600₽',color:orange},
  ];
  const HISTORY=[
    {name:'Мария С.',date:'12 марта',bonus:'200₽',status:'Выплачено',sc:green},
    {name:'Андрей К.',date:'8 марта',bonus:'200₽',status:'Выплачено',sc:green},
    {name:'Ольга М.',date:'3 марта',bonus:'200₽',status:'Ожидает',sc:orange},
    {name:'Пётр Н.',date:'28 февраля',bonus:'200₽',status:'Выплачено',sc:green},
  ];
  const copyCode=()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Реферальная программа" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(160deg,#0a1628,#1a2a5a,#0E3460)',padding:'24px 20px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-20,top:-15,fontSize:80,opacity:.1}}>💸</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:6}}>Приглашай друзей</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:6,position:'relative'}}>Зарабатывай с Этномиром</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:16}}>200₽ за каждого друга, который купит билет или бронь</div>
        {/* Ref code */}
        <div style={{background:'rgba(255,255,255,.12)',backdropFilter:'blur(8px)',borderRadius:14,padding:'14px 16px',border:'0.5px solid rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontFamily:FT,marginBottom:3}}>Ваш реферальный код</div>
            <div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'2px'}}>{REF_CODE}</div>
          </div>
          <div onClick={copyCode} className="eth-tap" style={{background:copied?green:blue,borderRadius:10,padding:'8px 14px',cursor:'pointer',flexShrink:0}}>
            <span style={{fontSize:12,color:'#fff',fontFamily:FT,fontWeight:600}}>{copied?'✓ Скопировано':'Копировать'}</span>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div style={{padding:'12px 20px 0',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {STATS.map((s,i)=>(
          <div key={i} style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'14px'}}>
            <div style={{fontSize:18,marginBottom:5}}>{s.em}</div>
            <div style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:FD,marginBottom:2}}>{s.val}</div>
            <div style={{fontSize:10,color:l3,fontFamily:FT}}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* How it works */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FD,marginBottom:10}}>Как это работает</div>
        <div style={{background:'var(--ef2)',borderRadius:16,overflow:'hidden',border:'0.5px solid var(--es2)'}}>
          {[['1️⃣','Поделитесь кодом','Отправьте реферальный код другу'],['2️⃣','Друг покупает','Друг использует ваш код при оплате'],['3️⃣','Вы получаете 200₽','Бонус начисляется автоматически']].map(([n,t,s],i,arr)=>(
            <div key={i} style={{display:'flex',gap:12,padding:'12px 16px',borderBottom:i<arr.length-1?'0.5px solid var(--es2)':'none',alignItems:'center'}}>
              <span style={{fontSize:20,flexShrink:0}}>{n}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT,marginBottom:2}}>{t}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT}}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* History */}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FD,marginBottom:10}}>История рефералов</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {HISTORY.map((h,i)=>(
            <div key={i} style={{borderRadius:14,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:12,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>👤</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{h.name}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT}}>{h.date}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:700,color:green,fontFamily:FD}}>{h.bonus}</div>
                <div style={{fontSize:10,color:h.sc,fontFamily:FT,fontWeight:600}}>{h.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Share CTA */}
      <div style={{padding:'16px 20px'}}>
        <div onClick={()=>{}} className="eth-tap" style={{borderRadius:16,padding:'14px',background:blue,textAlign:'center',cursor:'pointer'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>📤 Поделиться кодом</span>
        </div>
      </div>
    </div>
  </div>;
}

function B2BSubsSC({push,pop}){
  const[chosen,setChosen]=useState(null);
  const PLANS=[
    {id:'team',em:'👥',n:'Командный',sub:'До 10 сотрудников',p:4900,punit:'мес',
     color:blue,
     feats:['10 корпоративных визитов/мес','Скидка 10% на мастер-классы','Приоритетное бронирование площадок','Персональный менеджер'],
     highlight:false},
    {id:'corp',em:'🏢',n:'Корпоративный',sub:'До 50 сотрудников',p:14900,punit:'мес',
     color:purple,
     feats:['50 корпоративных визитов/мес','Скидка 20% на все услуги','Закрытые корпоративные события','Тимбилдинг 2 раза в год','Отчёты для HR'],
     highlight:true},
    {id:'enterprise',em:'🌐',n:'Enterprise',sub:'Без ограничений',p:49900,punit:'мес',
     color:orange,
     feats:['Неограниченные визиты','Скидка 30% на всё','Именная зона в парке','Выделенная команда','API-интеграция','SLA 24/7'],
     highlight:false},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Корпоративные подписки" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#0a1628,#1a2a4a)',padding:'20px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-20,top:-15,fontSize:80,opacity:.08}}>🏢</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>B2B · Для компаний</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:4}}>Корпоративные тарифы</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT}}>Командный отдых, тимбилдинг и обучение для вашей компании</div>
      </div>
      <div style={{padding:'12px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {PLANS.map((p,i)=>(
          <div key={i} onClick={()=>setChosen(chosen===p.id?null:p.id)} className="eth-tap" style={{borderRadius:22,overflow:'hidden',cursor:'pointer',border:`1.5px solid ${chosen===p.id?p.color:'var(--es2)'}`,transition:'border-color .2s',boxShadow:p.highlight?`0 4px 24px ${p.color}30`:undefined}}>
            {p.highlight&&<div style={{background:`linear-gradient(90deg,${p.color},${p.color}88)`,padding:'4px',textAlign:'center'}}>
              <span style={{fontSize:11,color:'#fff',fontFamily:FT,fontWeight:700}}>★ Популярный выбор</span>
            </div>}
            <div style={{background:'var(--ef2)',padding:'16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:44,height:44,borderRadius:14,background:`${p.color}15`,border:`0.5px solid ${p.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{p.em}</div>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FD}}>{p.n}</div>
                    <div style={{fontSize:11,color:l3,fontFamily:FT}}>{p.sub}</div>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>{p.p.toLocaleString('ru')}₽</div>
                  <div style={{fontSize:10,color:l3,fontFamily:FT}}>/ {p.punit}</div>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {p.feats.map((f,j)=>(
                  <div key={j} style={{display:'flex',gap:8,alignItems:'center'}}>
                    <div style={{width:16,height:16,borderRadius:8,background:`${p.color}20`,border:`0.5px solid ${p.color}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:8,color:p.color}}>✓</span>
                    </div>
                    <span style={{fontSize:12,color:l2,fontFamily:FT}}>{f}</span>
                  </div>
                ))}
              </div>
              {chosen===p.id&&<div onClick={e=>{e.stopPropagation();push('checkout',{item:{em:p.em,n:p.n+' подписка'},total:p.p});}} className="eth-tap" style={{marginTop:14,borderRadius:14,padding:'12px',background:p.color,textAlign:'center',cursor:'pointer'}}>
                <span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Оформить {p.n} · {p.p.toLocaleString('ru')}₽/мес</span>
              </div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function TicketsScreen({push,pop}){
  const[sel,setSel]=useState(null);
  const[qty,setQty]=useState({adult:2,child:0,льгота:0});
  const cats=[
    {id:'adult',em:'🧑',n:'Взрослый',sub:'18+ лет',p:1200},
    {id:'child',em:'👦',n:'Детский',sub:'7–17 лет · Льготный',p:700},
    {id:'льгота',em:'🎖',n:'Льготный',sub:'Инвалиды I–II гр, ветераны',p:600},
  ];
  const extras=[
    {em:'🚌',n:'Автобус из Москвы',sub:'м. Молодёжная + обратно',p:600},
    {em:'🎧',n:'Аудиогид',sub:'Маршрут по парку',p:300},
    {em:'🅿️',n:'Парковка VIP',sub:'У павильонов Улицы Мира',p:200},
  ];
  const[selExtra,setSelExtra]=useState([]);
  const total=cats.reduce((s,c)=>s+c.p*qty[c.id],0)
    +selExtra.reduce((s,i)=>s+extras[i].p*(qty.adult+qty.child+qty['льгота']),0);

  const adjustQty=(id,d)=>setQty(q=>({...q,[id]:Math.max(0,q[id]+d)}));
  const anyGuests=Object.values(qty).some(v=>v>0);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{background:`linear-gradient(160deg,#0a1a0a,#152510,${bg})`,padding:'56px 20px 18px',flexShrink:0}}>
      {pop&&<div onClick={pop} className="eth-press" style={{display:'inline-flex',alignItems:'center',gap:5,marginBottom:6,cursor:'pointer'}}>
        <Ic.chevL s={10} c={blue}/><span style={{fontSize:17,fontFamily:FT,color:blue}}>Назад</span>
      </div>}
      <div style={{fontSize:34,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.8px'}}>Билеты</div>
      <div style={{fontSize:15,fontFamily:FT,color:l3,marginTop:2}}>Выбери категорию и количество</div>
    </div>

    <div style={{flex:1,overflowY:'auto',padding:'12px 20px 100px'}}>
      {/* Info banner */}
      <div style={{background:`${green}14`,borderRadius:14,padding:'12px 14px',marginBottom:18,display:'flex',gap:10,border:`0.5px solid ${green}30`}}>
        <span style={{fontSize:18,flexShrink:0}}>ℹ️</span>
        <div style={{fontSize:13,fontFamily:FT,color:l2,lineHeight:1.5}}>Билет включает: вход на территорию 140 га, все бесплатные мероприятия дня, посещение музеев и выставок</div>
      </div>

      {/* Ticket types */}
      <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,marginBottom:8,letterSpacing:'.3px',textTransform:'uppercase'}}>Категории</div>
      <Card style={{marginBottom:20}}>
        {cats.map((c,i)=><div key={c.id} style={{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:i===cats.length-1?'none':`0.5px solid ${sep2}`,background:bg2}}>
          <span style={{fontSize:26,marginRight:12,flexShrink:0}}>{c.em}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontFamily:FT,fontWeight:600,color:l1,letterSpacing:'-.2px'}}>{c.n}</div>
            <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{c.sub}</div>
          </div>
          <div style={{fontSize:17,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.3px',marginRight:14}}>{c.p} ₽</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div onClick={()=>adjustQty(c.id,-1)} className="eth-press-sm" style={{width:28,height:28,borderRadius:9,background:f2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <span style={{fontSize:18,color:qty[c.id]>0?l1:l4,lineHeight:1,fontFamily:FD,fontWeight:300}}>−</span>
            </div>
            <span style={{fontSize:17,fontFamily:FD,fontWeight:600,color:l1,minWidth:16,textAlign:'center'}}>{qty[c.id]}</span>
            <div onClick={()=>adjustQty(c.id,+1)} className="eth-press-sm" style={{width:28,height:28,borderRadius:9,background:f2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <Ic.plus s={12} c={l1}/>
            </div>
          </div>
        </div>)}
      </Card>

      {/* Extras */}
      <div style={{fontSize:13,fontFamily:FT,fontWeight:600,color:l3,marginBottom:8,letterSpacing:'.3px',textTransform:'uppercase'}}>Дополнительно</div>
      <Card style={{marginBottom:20}}>
        {extras.map((ex,i)=><div key={i} style={{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:i===extras.length-1?'none':`0.5px solid ${sep2}`,background:bg2}}>
          <span style={{fontSize:22,marginRight:12,flexShrink:0}}>{ex.em}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontFamily:FT,fontWeight:500,color:l1,letterSpacing:'-.2px'}}>{ex.n}</div>
            <div style={{fontSize:12,fontFamily:FT,color:l3,marginTop:1}}>{ex.sub} · {ex.p} ₽/чел</div>
          </div>
          <div onClick={()=>setSelExtra(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])} className="eth-press-sm" style={{width:26,height:26,borderRadius:8,background:selExtra.includes(i)?green:f2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'background .2s'}}>
            {selExtra.includes(i)?<Ic.check s={12} c="#fff"/>:<Ic.plus s={12} c={l3}/>}
          </div>
        </div>)}
      </Card>

      {/* Discounts */}
      <div style={{background:`${yellow}12`,borderRadius:14,padding:'12px 14px',marginBottom:18}}>
        <div style={{fontSize:14,fontFamily:FT,fontWeight:600,color:yellow,marginBottom:4}}>🎂 Скидки</div>
        <div style={{fontSize:13,fontFamily:FT,color:l2,lineHeight:1.5}}>День рождения ±7 дней — скидка на проживание. Дети до 7 лет — бесплатно. Жители Боровского района — бесплатно.</div>
      </div>
    </div>

    {/* Sticky CTA */}
    {anyGuests&&<div style={{padding:'12px 20px 24px',borderTop:`0.5px solid ${sep2}`,background:bg,flexShrink:0}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:10}}>
        <span style={{fontSize:15,fontFamily:FT,color:l3}}>Итого</span>
        <span style={{fontSize:28,fontFamily:FD,fontWeight:700,color:l1,letterSpacing:'-.6px'}}>{total.toLocaleString('ru-RU')} ₽</span>
      </div>
      <Btn label={`Купить билеты · ${total.toLocaleString('ru-RU')} ₽`} onPress={()=>push('checkout',{item:{em:'🎟',n:'Билеты в Этномир',p:total},total})}/>
    </div>}
  </div>;
}

//  QUESTS SCREEN
function QuestsScreen({push,pop}){
  const[cat,setCat]=useState('all');
  const cats=['all','Квесты','Игры','Шоу'];
  // Реальные квесты и игры ЭТНОМИРА — источник: ethnomir.ru/posetitelyam/kvesty/
  const QUESTS=[
    // ── КВЕСТЫ ──
    {em:'🏰',n:'Квест «Форт Боярд»',cat:'Квесты',sub:'Приключение в замке · 7–12 лет · до 48 чел',
     price:'9 000₽',priceNote:'до 12 уч.',r:4.9,dur:'1.5 ч',group:'до 48',color:'#C2862A',
     tags:['Дети','Семья','Команда'],
     desc:'Команда просыпается в стенах загадочного замка. Непроходимые лабиринты, тёмные комнаты, испытания — нужно собрать 5 ключей и разгадать кодовое слово. Добрый старец Фура и Паспарту помогут.',
     prizes:'Шоколадные монеты (опционально)'},
    {em:'🕵️',n:'Квест «Детективный»',cat:'Квесты',sub:'Расследование · Улики · Актёры',
     price:'По запросу',priceNote:'группа',r:4.8,dur:'2 ч',group:'до 36',color:'#5C6BC0',
     tags:['16+','Корпоратив','Детектив'],
     desc:'Настоящее детективное расследование с уликами, подозреваемыми и алиби. Найдите преступника раньше, чем он скроется. Актёры в ролях создают полное погружение.',
     prizes:'Диплом лучшего сыщика'},
    {em:'🏝️',n:'Квест «Остров сокровищ»',cat:'Квесты',sub:'Пираты · Карта клада · Семейный',
     price:'По запросу',priceNote:'группа',r:4.8,dur:'1.5 ч',group:'до 48',color:'#26A69A',
     tags:['Дети','Семья','Пираты'],
     desc:'Капитан пиратского корабля Флинт зарыл сокровища на таинственном острове! Ваша команда получит настоящую пиратскую карту и пройдёт эстафету с кенгуру через Кордильеры.',
     prizes:'Сундук с пиратским кладом'},
    {em:'🧙',n:'Квест «Школа волшебства»',cat:'Квесты',sub:'Гарри Поттер · 5–18 лет · магические испытания',
     price:'6 000₽',priceNote:'до 12 уч.',r:4.9,dur:'1.5 ч',group:'до 48',color:'#7E57C2',
     tags:['Дети','Магия','Семья'],
     desc:'Главная школа чародейства и волшебства объявила набор! Путешествие в мир колдунов, магических зелий и таинственных существ. Давным-давно жил великий волшебник, дважды победивший тёмного мага.',
     prizes:'Диплом волшебника'},
    {em:'❄️',n:'Квест «В поисках новогодней сказки»',cat:'Квесты',sub:'Сезонный · Декабрь–Январь · Новый год',
     price:'По запросу',priceNote:'сезонный',r:4.8,dur:'1.5 ч',group:'до 48',color:'#42A5F5',
     tags:['НГ','Зима','Семья'],
     desc:'Специальный новогодний квест в атмосфере рождественской сказки. Помогите героям найти потерянные подарки и спасти праздник! Только в период новогодних каникул.',
     prizes:'Новогодний сюрприз'},
    // ── ИГРЫ ──
    {em:'🎭',n:'Игра «Мафия»',cat:'Игры',sub:'Ролевая игра · Психология · 16+',
     price:'По запросу',priceNote:'группа',r:4.7,dur:'2 ч',group:'8–30',color:'#EF5350',
     tags:['16+','Взрослые','Психология'],
     desc:'Классическая игра на социальную дедукцию. Мирные жители против мафии. Умение убеждать, анализировать поведение и вычислять противника — главное оружие. С ведущим от ЭТНОМИРА.',
     prizes:'Кубок победителю'},
    {em:'💰',n:'Игра «Акционер»',cat:'Игры',sub:'Деловая игра · Биржа · Стратегия',
     price:'По запросу',priceNote:'группа',r:4.6,dur:'2 ч',group:'8–40',color:'#26A69A',
     tags:['Взрослые','Бизнес','Стратегия'],
     desc:'Захватывающая деловая игра в формате биржи. Торгуйте акциями, принимайте стратегические решения, создавайте капитал. Идеально для корпоративных мероприятий и тимбилдинга.',
     prizes:'Корона «лучший акционер»'},
    {em:'🎬',n:'Вечеринка «Голливуд»',cat:'Игры',sub:'Тематическая вечеринка · Звёзды · Гламур',
     price:'По запросу',priceNote:'группа',r:4.8,dur:'2–3 ч',group:'до 50',color:'#FF8F00',
     tags:['Взрослые','Вечеринка','Гламур'],
     desc:'Погрузитесь в атмосферу голливудских звёзд! Красная дорожка, фотосессия в образах, конкурсы и церемония награждения. Ведущий в роли распорядителя «Оскара».',
     prizes:'Статуэтка «Оскар» (сувенир)'},
    {em:'🔪',n:'Вечеринка «Мафия»',cat:'Игры',sub:'Тематическая вечеринка · Роли · Атмосфера',
     price:'По запросу',priceNote:'группа',r:4.7,dur:'2–3 ч',group:'до 40',color:'#546E7A',
     tags:['16+','Вечеринка','Детектив'],
     desc:'Тематическая вечеринка с погружением в мир мафии. Каждый гость получает роль и костюм. Ужин, игра, интрига — незабываемый вечер в стиле чикагских гангстеров 30-х.',
     prizes:'Приз лучшему актёру'},
    // ── ШОУ ──
    {em:'🫧',n:'Мыльное шоу',cat:'Шоу',sub:'Для детей · Шоу мыльных пузырей · Wow-эффект',
     price:'По запросу',priceNote:'группа',r:4.9,dur:'40 мин',group:'до 50',color:'#26C6DA',
     tags:['Дети','Шоу','Wow'],
     desc:'Невероятное шоу мыльных пузырей — ребёнок внутри гигантского пузыря, летящие фигуры, пузыри размером с человека. Аниматоры ЭТНОМИРА создают волшебство из воздуха и мыла.',
     prizes:'Фото в мыльном пузыре'},
    {em:'📰',n:'Бумажное шоу',cat:'Шоу',sub:'Бумажная дискотека · Для детей и взрослых',
     price:'По запросу',priceNote:'группа',r:4.8,dur:'40 мин',group:'до 100',color:'#EF5350',
     tags:['Дети','Шоу','Дискотека'],
     desc:'Бумажная дискотека — серебряная бумага, конфетти-пушки, яркие вспышки. Гости кидаются бумагой, танцуют, дети в восторге! Идеальный финальный аккорд любого праздника.',
     prizes:'Бумажный фейерверк'},
  ];
  const typeColor={Квесты:blue,Игры:orange,Шоу:green};
  const shown=cat==='all'?QUESTS:QUESTS.filter(q=>q.cat===cat);

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?8:0}}>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Квесты и игры</div>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1}}>🗝 {QUESTS.filter(q=>q.cat==='Квесты').length} квеста · 🎭 {QUESTS.filter(q=>q.cat==='Игры').length} игры · ✨ {QUESTS.filter(q=>q.cat==='Шоу').length} шоу</div>
      </div>
    </div>

    {/* Hero */}
    <div style={{margin:'12px 20px 0',borderRadius:20,background:'linear-gradient(135deg,#1a0a3a,#3a0a5a)',padding:'18px 20px',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',right:-10,top:-10,fontSize:70,opacity:.15}}>🗝</div>
      <div style={{fontSize:12,color:'rgba(255,255,255,.55)',fontFamily:FT,marginBottom:4}}>Квесты · Игры · Шоу</div>
      <div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.3px',marginBottom:6}}>Волшебные приключения ЭТНОМИРа</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {['С актёрами','Призы','Для детей','Тимбилдинг'].map((t,i)=>(
          <div key={i} style={{background:'rgba(255,255,255,.12)',borderRadius:8,padding:'3px 9px'}}>
            <span style={{fontSize:10,color:'rgba(255,255,255,.8)',fontFamily:FT}}>{t}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Category filter */}
    <div style={{padding:'10px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
      {cats.map(c=>{
        const col=typeColor[c]||l1;
        return <div key={c} onClick={()=>setCat(c)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',background:cat===c?(c==='all'?l1:col):'var(--ef2)',border:cat===c?'none':`0.5px solid ${c==='all'?'var(--es2)':col+'50'}`,transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:cat===c?600:400,color:cat===c?'#fff':c==='all'?l2:col}}>{c==='all'?'Все':c}</span>
        </div>;
      })}
    </div>

    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'10px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {shown.map((q,i)=><div key={i} onClick={()=>push('booking',{service:q,title:q.n})} className="eth-tap eth-card" style={{borderRadius:22,background:'var(--ef2)',border:`0.5px solid ${q.color}22`,overflow:'hidden',cursor:'pointer'}}>
          <div style={{height:3,background:`linear-gradient(90deg,${q.color},${q.color}44)`}}/>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:12,marginBottom:10}}>
              <div style={{width:56,height:56,borderRadius:17,background:`${q.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:27,flexShrink:0,border:`0.5px solid ${q.color}20`}}>{q.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2,lineHeight:1.2}}>{q.n}</div>
                <div style={{fontSize:10,color:l3,fontFamily:FT,marginBottom:5,lineHeight:1.3}}>{q.sub}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                  <div style={{background:`${q.color}15`,border:`0.5px solid ${q.color}30`,borderRadius:7,padding:'2px 7px'}}>
                    <span style={{fontSize:9,color:q.color,fontFamily:FT,fontWeight:600}}>{q.cat}</span>
                  </div>
                  <span style={{fontSize:10,color:l3,fontFamily:FT}}>⏱ {q.dur}</span>
                  <span style={{fontSize:10,color:l3,fontFamily:FT}}>👥 {q.group}</span>
                  <span style={{fontSize:10,color:'#FFD60A'}}>★ {q.r}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD}}>{q.price}</div>
                <div style={{fontSize:9,color:l3,fontFamily:FT,marginTop:1}}>{q.priceNote}</div>
              </div>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{q.desc}</div>
            <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {q.tags.map((t,j)=><div key={j} style={{background:'var(--ef3)',borderRadius:7,padding:'3px 8px'}}><span style={{fontSize:9,color:l3,fontFamily:FT}}>{t}</span></div>)}
              </div>
              <div style={{background:blue,borderRadius:10,padding:'6px 14px',flexShrink:0}}>
                <span style={{fontSize:11,fontWeight:600,color:'#fff',fontFamily:FT}}>Забронировать</span>
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function ZooScreen({push,pop}){
  const[zone,setZone]=useState('all');
  const zones=['all','Хаски','Ферма','Экзотика','Коты','Кои'];
  // Реальные зоопарки и питомники ЭТНОМИРА — ethnomir.ru/posetitelyam/zooparki-i-pitomniki/
  const ANIMALS=[
    {em:'🐕',n:'Вольер хаски',sub:'Сибирские хаски · Знакомство · Фото',zone:'Хаски',color:'#5B8ECC',
     price:'вкл. в билет',priceNum:0,r:4.9,hours:'10:00–17:00',
     facts:['Сибирские хаски — ездовые собаки Севера, можно гладить и обниматься','Вольер в зоне этнодвора «Север, Сибирь и Дальний Восток»','Фото с собаками включено в стоимость входного билета'],
     desc:'Познакомьтесь с настоящими ездовыми хаски. Невозможно устоять перед этими голубоглазыми красавцами! Общение и фото включены в стоимость входного билета в парк.'},
    {em:'🛷',n:'Катание на хаски',sub:'Собачья упряжка · Зима · По предзаписи',zone:'Хаски',color:'#3A7CA5',
     price:'1 000₽',priceNum:1000,r:4.9,hours:'Ноябрь–Март',
     facts:['В упряжке 6 собак: ведущая + 5 коренных','Бронь на будни — онлайн; выходные — на месте','Не проводится при неблагоприятных погодных условиях'],
     desc:'Прокатитесь на настоящей собачьей упряжке! Ощутите дыхание Севера — скорость, снег, ветер и радостный лай хаски. Незабываемое зимнее приключение для всей семьи.'},
    {em:'🐄',n:'ЭтноФерма',sub:'Козы · Коровы · Кролики · Птицы',zone:'Ферма',color:'#8BC34A',
     price:'200₽',priceNum:200,r:4.8,hours:'10:00–18:00',
     facts:['Козы, коровы, свиньи, кролики, индюки, фазаны, павлины и павлины','Ослик, нубийский козлик, черепахи — экзотика Севера, Сибири и ДВ','Животных можно кормить с рук и гладить'],
     desc:'Настоящее крестьянское подворье. Экскурсоводы расскажут об именах и характере каждого питомца. Тёплая, уютная атмосфера с гарантированно положительными эмоциями!'},
    {em:'🦌',n:'Оленья ферма',sub:'Северные олени · Кормление · Зимнее катание',zone:'Ферма',color:'#A07855',
     price:'По запросу',priceNum:null,r:4.9,hours:'10:00–17:00',
     facts:['Северные олени — символ природы Севера','Кормление из рук ягелем и специальным кормом','Зимой — катание на оленьей упряжке'],
     desc:'Встреча с северными красавцами-оленями! Протяните им корм с ладони. Зимой доступно катание на оленьей упряжке по территории парка.'},
    {em:'🐴',n:'Катание в конном экипаже',sub:'Карета · Лошади · Прогулка по парку',zone:'Ферма',color:'#8D5524',
     price:'По запросу',priceNum:null,r:4.8,hours:'10:00–17:00',
     facts:['Прогулка на лошадях по живописным дорожкам парка','Инструктор сопровождает весь маршрут','Дети от 5 лет, снаряжение включено'],
     desc:'Романтическая прогулка на лошадях по ЭТНОМИРу. Экипаж проедет мимо этнодворов и садов — лучший способ осмотреть парк неспешно.'},
    {em:'🦎',n:'Зоодом «Кобры-мобры»',sub:'~30 видов экзотики · Контактный · Сурикаты',zone:'Экзотика',color:'#FF7043',
     price:'По запросу',priceNum:null,r:4.9,hours:'10:00–18:00',
     facts:['Ранее «Музей живой природы», расположен между питомником хаски и ЭтноФермой','Около 30 видов беспозвоночных и мелких позвоночных со всего мира','Сурикаты у западного торца приветствуют гостей через окно'],
     desc:'Сурикаты, рептилии, насекомые и экзотические животные со всех континентов — здесь можно взаимодействовать с ними вживую! Животные подготовлены для безопасного контакта.'},
    {em:'🐱',n:'Котодом «ЭтноКот»',sub:'Котодом · Мастерские · Гостиница для кошек',zone:'Коты',color:'#F48FB1',
     price:'вкл. в билет',priceNum:0,r:4.9,hours:'10:00–18:00',
     facts:['Двухэтажный деревянный дом в экостиле (зона Калининградской обл.)','Две творческие мастерские, магазин, кинозал','Котогостиница: уютные номера 3–5 м² с балкончиком для вашей кошки'],
     desc:'Уютный котодом с местными мурлыками — место отдыха, творчества и общения с кошками. Помогают бездомным котам. Можно оставить своего питомца в котогостинице.'},
    {em:'🐟',n:'Зоосалон «Ханако-парк»',sub:'Японские карпы кои · Аквариум 5 м³ · Медитация',zone:'Кои',color:'#FF8F00',
     price:'вкл. в билет',priceNum:0,r:4.8,hours:'10:00–18:00',
     facts:['Назван в честь кои Ханако, прожившей 226 лет','36 японских карпов кои + 2 тайские мини-акулы (пангасиус)','Аквариум 5 м³ — наблюдение за подводной жизнью в деталях'],
     desc:'Самое умиротворяющее место в ЭТНОМИРе. Кормление японских декоративных карпов кои снимает стресс. Наблюдайте за грациозными кои через огромный аквариум.'},
  ];
  const shown=zone==='all'?ANIMALS:ANIMALS.filter(a=>a.zone===zone);
  const zoneEmoji={Хаски:'🐕',Ферма:'🐄',Экзотика:'🦎',Коты:'🐱',Кои:'🐟'};
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?8:0}}>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Зоопарки и питомники</div>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1}}>🐕 Хаски · 🐄 Ферма · 🦎 Экзотика · 🐱 ЭтноКот · 🐟 Кои</div>
      </div>
    </div>
    <div style={{margin:'12px 20px 0',borderRadius:20,background:'linear-gradient(135deg,#0a2a0a,#1B4332)',padding:'18px 20px',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',right:-10,top:-10,fontSize:70,opacity:.12}}>🌿</div>
      <div style={{fontSize:12,color:'rgba(255,255,255,.55)',fontFamily:FT,marginBottom:4}}>Животные · Фермы · Питомники · ЭКОМИР</div>
      <div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.3px',marginBottom:8}}>Лучший антидепрессант!</div>
      <div style={{display:'flex',gap:8}}>
        {[['🤲','Кормление'],['📸','Фото'],['🛷','Упряжки'],['🐾','Контакт']].map(([em,t],i)=>(
          <div key={i} style={{flex:1,background:'rgba(255,255,255,.1)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}>
            <div style={{fontSize:16,marginBottom:2}}>{em}</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.75)',fontFamily:FT}}>{t}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{padding:'10px 20px 0',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
      {zones.map(z=>(
        <div key={z} onClick={()=>setZone(z)} className="eth-tap" style={{flexShrink:0,borderRadius:20,padding:'7px 14px',cursor:'pointer',background:zone===z?green:'var(--ef2)',border:zone===z?'none':`0.5px solid ${z==='all'?'var(--es2)':green+'40'}`,transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:zone===z?600:400,color:zone===z?'#fff':z==='all'?l2:green}}>
            {z==='all'?'Все':`${zoneEmoji[z]||''} ${z}`}
          </span>
        </div>
      ))}
    </div>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{padding:'10px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {shown.map((a,i)=><div key={i} onClick={()=>push('booking',{service:a,title:a.n})} className="eth-tap eth-card" style={{borderRadius:22,background:'var(--ef2)',border:`0.5px solid ${a.color}22`,overflow:'hidden',cursor:'pointer'}}>
          <div style={{height:3,background:`linear-gradient(90deg,${a.color},${a.color}44)`}}/>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:12,marginBottom:8}}>
              <div style={{width:56,height:56,borderRadius:17,background:`${a.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:27,flexShrink:0,border:`0.5px solid ${a.color}20`}}>{a.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2,lineHeight:1.2}}>{a.n}</div>
                <div style={{fontSize:10,color:l3,fontFamily:FT,marginBottom:5}}>{a.sub}</div>
                <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                  <div style={{background:`${a.color}15`,border:`0.5px solid ${a.color}30`,borderRadius:7,padding:'2px 8px'}}>
                    <span style={{fontSize:9,color:a.color,fontFamily:FT,fontWeight:600}}>{a.zone}</span>
                  </div>
                  <span style={{fontSize:10,color:l3,fontFamily:FT}}>🕐 {a.hours}</span>
                  <span style={{fontSize:10,color:'#FFD60A'}}>★ {a.r}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:a.priceNum===0?13:15,fontWeight:700,color:a.priceNum===0?green:l1,fontFamily:FD}}>{a.price}</div>
                {a.priceNum!==0&&a.priceNum!==null&&<div style={{fontSize:9,color:l3,fontFamily:FT,marginTop:1}}>/чел</div>}
              </div>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{a.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {a.facts.map((f,j)=>(
                <div key={j} style={{background:'var(--ef3)',borderRadius:8,padding:'4px 10px',display:'flex',gap:5,alignItems:'center'}}>
                  <span style={{fontSize:8,color:a.color}}>●</span>
                  <span style={{fontSize:10,color:l2,fontFamily:FT}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

function MuseumsScreen({push,pop}){
  const[tab,setTab]=useState('museums');
  // Реальные музеи ЭТНОМИРА (источник: ethnomir.ru/posetitelyam/muzei/)
  const MUSEUMS=[
    {em:'🪆',n:'Музей кукол народов мира',sub:'500+ кукол · 100+ стран',p:250,r:4.9,dur:'1–1.5 ч',
     color:pink,
     halls:['Куклы России (Дагестан, Татарстан, Алтай…)','Японские нингё','Индийские тряпичные','Украинские мотанки'],
     desc:'Открылся 1 мая 2011 г. 500+ экспонатов из 100+ стран. Народные куклы всех материалов: кукурузные листья, дерево, войлок, солома. Павильон «Вокруг света».'},
    {em:'🔧',n:'Музей утюгов',sub:'Рекорд России · 200+ экспонатов',p:200,r:4.8,dur:'45 мин',
     color:orange,
     halls:['Угольные утюги XVII–XIX вв.','Газовые и спиртовые','Советские электрические','Современные дизайнерские'],
     desc:'Самая большая в России коллекция старинных утюгов. От тяжёлых чугунных XVII века до электрических советских. 200+ экспонатов.'},
    {em:'🫖',n:'Музей самоваров',sub:'Тульские · Уральские · Дорожные',p:200,r:4.7,dur:'45 мин',
     color:yellow,
     halls:['Тульские самовары','Уральские самовары','Дорожные самовары','Электрические XX века'],
     desc:'Уникальная коллекция самоваров разных эпох и стилей. Чаепитие с самоварным чаем включено.'},
    {em:'⭐',n:'Музей СССР',sub:'Интерактив · 1950–1980-е',p:350,r:4.9,dur:'1 ч',
     color:red,
     halls:['Квартира конца 1950-х–нач. 1960-х','Школьный класс СССР','Пионерская комната','Советские артефакты'],
     desc:'Интерактивный музей советского быта. Сядьте за школьную парту, перелистайте старые журналы, послушайте виниловые пластинки. 3 зала погружения.'},
    {em:'🔥',n:'Музей Русской Печи',sub:'12 метров высоты · Смотровая площадка',p:400,r:4.9,dur:'1.5 ч',
     color:'#C0392B',
     halls:['Сама печь (12 м высоты)','Смотровая площадка','История русской печи','Пекарня и мастер-класс'],
     desc:'Самая большая в мире русская печь — 12 метров высотой. Уникальная смотровая площадка с панорамой всего этнопарка. Мастер-класс по выпечке.'},
    {em:'🌻',n:'Музей «Украина»',sub:'Хата-мазанка · Гуцульский быт',p:200,r:4.7,dur:'45 мин',
     color:green,
     halls:['Украинская мазанка','Петриковская роспись','Гуцульский зал','Народные инструменты'],
     desc:'В черниговской хате-мазанке с петриковской росписью. Гуцульский сердак, бандура, трембита (4 м). Рушники, «дидух», «кут».'},
    {em:'🌾',n:'Музей «Беларусь»',sub:'Традиционный белорусский быт',p:200,r:4.7,dur:'45 мин',
     color:'#5B8DB8',
     halls:['Белорусская хата','Ткачество и рушники','Соломоплетение','Народные ремёсла'],
     desc:'Традиционный белорусский дом с ткацким станком. Хранитель культуры расскажет о ремёслах и проведёт мастер-класс.'},
    {em:'🛖',n:'Парк народов Сибири и Дальнего Востока',sub:'Под открытым небом · 40+ жилищ',p:300,r:4.8,dur:'2 ч',
     color:'#5F7D5A',
     halls:['Чумы народов Севера','Яранга чукчей','Юрта бурят','Землянка и сруб'],
     desc:'Музей под открытым небом. 40+ жилищ народов Крайнего Севера, Сибири и Дальнего Востока в натуральную величину. Уникален в России.'},
    {em:'💎',n:'Музей камней «Хозяйка Медной горы»',sub:'100+ минералов · Бажов · Артефакты',p:300,r:4.7,dur:'1 ч',
     color:purple,
     halls:['Минералы мира (100+)','Космические артефакты','Фигуры гуманоидов','По мотивам Бажова'],
     desc:'Выставка «Хозяйка Медной горы» — 100+ образцов минералов со всего мира, космические артефакты, модели планет и легенды Бажова.'},
    {em:'🔥',n:'Музей спичек',sub:'Уникальная коллекция · Огонь в истории',p:150,r:4.7,dur:'30 мин',
     color:'#FF4500',
     halls:['История спичек','Мировые коробки спичек','Огниво и кресало','Современные зажигалки'],
     desc:'Редкий музей — история добычи огня от кремня до спичек. Уникальные коллекции спичечных этикеток и коробков со всего мира.'},
  ];
  const EXHIBITIONS=[
    {em:'🧠',n:'«Великие Учителя человечества»',sub:'Постоянная · 33+ бюста мыслителей всех времён',color:purple,new:false},
    {em:'🗺',n:'Галерея «Путешествие по России»',sub:'Постоянная · 89 регионов · 3500+ брендов',color:green,new:false},
    {em:'🪨',n:'Галерея каменных скульптур',sub:'Постоянная · 10 работ из 12 стран · 2019',color:orange,new:false},
    {em:'👒',n:'Традиционные головные уборы',sub:'Постоянная · Народы мира',color:red,new:false},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Музеи" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{background:'linear-gradient(160deg,#0a0a1a,#1a1a3a,#2a1a5a)',padding:'20px 20px 22px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-15,top:-15,fontSize:70,opacity:.12}}>🏛</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>Экспозиции · Выставки · Галереи</div>
        <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:4}}>Музеи Этномира</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT}}>10 музеев · Утюги · Самовары · СССР · Русская Печь · Куклы · Спички</div>
      </div>
      <div style={{padding:'12px 20px 0',display:'flex',gap:8}}>
        {[['museums','🏛 Музеи'],['exhibitions','🎨 Выставки']].map(([id,label])=><div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,borderRadius:14,padding:'10px',textAlign:'center',cursor:'pointer',background:tab===id?l1:'var(--ef2)',border:tab===id?'none':'0.5px solid var(--es2)',transition:'all .25s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:13,fontFamily:FT,fontWeight:tab===id?600:400,color:tab===id?bg:l2}}>{label}</span>
        </div>)}
      </div>
      <div style={{padding:'12px 20px'}}>
        {tab==='museums'
          ?<div style={{display:'flex',flexDirection:'column',gap:12}}>
            {MUSEUMS.map((m,i)=><div key={i} onClick={()=>push('booking',{service:m,title:m.n})} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer',position:'relative'}}>
              <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:m.color}}/>
              <div style={{padding:'14px 16px 14px 20px'}}>
                <div style={{display:'flex',gap:14,marginBottom:8}}>
                  <div style={{width:52,height:52,borderRadius:16,background:`${m.color}15`,border:`0.5px solid ${m.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{m.em}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2}}>{m.n}</div>
                    <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:4}}>{m.sub}</div>
                    <div style={{display:'flex',gap:10}}>
                      <span style={{fontSize:11,color:'#FFD60A'}}>★ {m.r}</span>
                      <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {m.dur}</span>
                      {m.p===0?<span style={{fontSize:11,color:green,fontFamily:FT,fontWeight:600}}>Бесплатно</span>:<span style={{fontSize:11,color:m.color,fontFamily:FT,fontWeight:600}}>{m.p}₽</span>}
                    </div>
                  </div>
                </div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5,marginBottom:8}}>{m.desc}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {m.halls.map((h,j)=><div key={j} style={{background:`${m.color}10`,border:`0.5px solid ${m.color}20`,borderRadius:8,padding:'3px 8px'}}><span style={{fontSize:10,color:m.color,fontFamily:FT}}>{h}</span></div>)}
                </div>
              </div>
            </div>)}
          </div>
          :<div style={{display:'flex',flexDirection:'column',gap:12}}>
            {EXHIBITIONS.map((ex,i)=><div key={i} onClick={()=>push('exhibitions')} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'16px',cursor:'pointer',display:'flex',gap:14,alignItems:'center',position:'relative'}}>
              {ex.new&&<div style={{position:'absolute',top:10,right:10,background:blue,borderRadius:8,padding:'2px 8px'}}><span style={{fontSize:9,color:'#fff',fontFamily:FT,fontWeight:700}}>Новая</span></div>}
              <div style={{width:52,height:52,borderRadius:16,background:`${ex.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{ex.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,marginBottom:3}}>{ex.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT}}>{ex.sub}</div>
              </div>
              <Ic.chevR s={7} c={l4}/>
            </div>)}
          </div>
        }
      </div>
    </div>
  </div>;
}

function BanyaScreen({push,pop}){
  const[tab,setTab]=useState('banya');
  // Реальные бани «Банного острова» СПА-центра «Символы» ЭТНОМИРА
  // Источник: ethnomir.ru/posetitelyam/health/
  // Автор концепции: Александр Дедков — СПА-путешественник и эксперт
  const BANYA=[
    {em:'🐒',n:'Баня Ханумана',sub:'Авторская · 4 вида бань · Для похудения',p:1500,dur:'2 ч',r:4.9,
     slots:['10:00','12:00','14:00','16:00','18:00','20:00'],
     feats:['Нет аналогов в мире','4 вида бань в одном сеансе','Авторский метод А. Дедкова','Халат и полотенце'],
     color:'#FF6B35',
     desc:'Уникальная баня без аналогов в мире. Сочетает 4 вида бань в одном сеансе — одна из лучших для похудения. Автор — Александр Дедков, знаменитый СПА-путешественник и эксперт. Каждые 10 минут меняются ароматы, температура, влажность, звуки.'},
    {em:'🌶',n:'Ланкийская баня «Сад специй»',sub:'Шри-Ланка · Целебные специи · Ароматерапия',p:1500,dur:'2 ч',r:4.9,
     slots:['10:00','12:00','14:00','16:00','18:00','20:00'],
     feats:['Настоящий сад специй','Улучшает настроение','Целебное воздействие','Экзотика острова'],
     color:'#C0CA33',
     desc:'Необыкновенно целебная баня! Настоящий сад специй благотворно воздействует на психологическое состояние человека и улучшает настроение. Погружение в атмосферу тропического острова Шри-Ланка.'},
    {em:'💎',n:'Изумрудный хаммам',sub:'Тайна молодости Востока · Мрамор · Пилинг',p:4500,dur:'2 ч',r:4.9,
     slots:['10:30','12:30','14:30','16:30','18:30','20:30'],
     feats:['Изысканный дизайн','Пилинг и пена','Полная релаксация','4500₽ за 2 чел'],
     color:'#00BCD4',
     note:'4500₽ за 2 чел · каждый след. +1000₽',
     desc:'Одна из тайн вечной молодости красавиц Востока. Изысканный дизайн и специальное тщательно продуманное устройство бани способствует полной релаксации. Детям до 5 лет — бесплатно в сопровождении взрослых.'},
    {em:'🌾',n:'Славянская баня «Телега»',sub:'Русский стиль · Травяные настои · Веник',p:4500,dur:'2 ч',r:4.9,
     slots:['11:00','13:00','15:00','17:00','19:00','21:00'],
     feats:['Лучшее от любой хвори','Только натуральные травы','Приятные ароматы','4500₽ за 2 чел'],
     color:'#8D6E63',
     note:'4500₽ за 2 чел · каждый след. +1000₽',
     desc:'Лучшее лечение от любой хвори! Колоритная банька в русском стиле с натуральными травяными настоями и приятными ароматами. Традиции славянских народов в сердце этнопарка.'},
    {em:'🪵',n:'«Сила Духа» — банный комплекс',sub:'Старорусские традиции · Знахари · Сутки',p:0,dur:'от 1 ч',r:4.9,
     slots:['10:00','12:00','14:00','16:00','18:00','20:00'],
     feats:['Знахари и лекари','Индивидуальная программа','Суточная аренда','Профессиональное парение'],
     color:'#5D4037',
     note:'Цены по запросу · +7 495 023-81-81',
     desc:'Новый комплекс русских бань на территории ЭТНОМИРА с профессиональным подходом к процедуре парения. Знахари и лекари подберут индивидуальную программу. Можно остаться на ночь! Круглосуточная парковка.'},
  ];
  // Реальные пакеты и условия посещения
  const PACKAGES=[
    {em:'🌊',n:'Групповой сеанс «Банный остров»',sub:'Все 4 бани за 2 часа · от 6 чел',p:1500,dur:'2 ч',
     color:'linear-gradient(135deg,#1a3a5c,#0D47A1,#1565C0)',popular:true,
     details:['1500₽/чел','Маршрут по всем баням','Полотенце и халат включены','Купальник и тапочки — с собой']},
    {em:'💑',n:'Индивидуальный для двоих',sub:'Хаммам + Телега · Приватно',p:4500,dur:'2 ч',
     color:'linear-gradient(135deg,#4A148C,#7B1FA2,#AB47BC)',popular:false,
     details:['4500₽ за 2 человека','каждый следующий +1000₽','Детям до 5 лет — бесплатно','До 7 лет — только в этом формате']},
    {em:'🌿',n:'СПА-тур для двоих',sub:'ЕСКО + косметология + бани',p:0,dur:'3–4 ч',
     color:'linear-gradient(135deg,#1B5E20,#2E7D32,#43A047)',popular:true,
     details:['Авторская система ЕСКО','Лучшие косметологи','Уникальные СПА-туры','Цена по запросу']},
    {em:'🔥',n:'«Сила Духа» — суточная аренда',sub:'Профессиональное парение · Ночёвка',p:0,dur:'Сутки',
     color:'linear-gradient(135deg,#3E2723,#5D4037,#8D6E63)',popular:false,
     details:['Знахари и лекари','Индивидуальная программа','Парковка 24/7','Запрос по телефону']},
  ];
  // Правила «Банного острова»
  const RULES=[
    {em:'👙',t:'Взять с собой','d':'Купальник, тапочки, моющие средства'},
    {em:'🛁',t:'Выдаётся','d':'Полотенце, халат, одноразовое бельё'},
    {em:'🚫',t:'Запрещено','d':'Спиртные напитки, продукты питания, пилинги и скрабы'},
    {em:'👶',t:'Дети','d':'До 5 лет — бесплатно. До 7 лет — только индивидуальный формат'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Баня и СПА" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Hero — «Банный остров» */}
      <div style={{background:'linear-gradient(160deg,#0d1b2a,#1b2838,#3d1a00)',padding:'20px 20px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,107,53,.3) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-30,left:10,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,188,212,.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,.45)',fontFamily:FT,letterSpacing:'.6px',textTransform:'uppercase',marginBottom:4}}>СПА-центр «Символы» · ЭТНОМИР</div>
          <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px',marginBottom:2}}>«Банный остров»</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginBottom:14}}>Проект Александра Дедкова · Бани народов мира</div>
          <div style={{display:'flex',gap:8}}>
            {[['🛁','4 бани мира'],['💆','Авт. система ЕСКО'],['⭐','4.9']].map(([em,t],i)=><div key={i} style={{flex:1,background:'rgba(255,255,255,.08)',backdropFilter:'blur(8px)',borderRadius:10,padding:'8px 6px',textAlign:'center',border:'0.5px solid rgba(255,255,255,.12)'}}>
              <div style={{fontSize:14,marginBottom:2}}>{em}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.7)',fontFamily:FT,lineHeight:1.3}}>{t}</div>
            </div>)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{padding:'14px 20px',display:'flex',gap:8}}>
        {[['banya','🛁 Бани'],['packages','🎁 Пакеты'],['rules','📋 Правила']].map(([id,label])=><div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,borderRadius:14,padding:'9px 4px',textAlign:'center',cursor:'pointer',background:tab===id?l1:'var(--ef2)',border:tab===id?'none':'0.5px solid var(--es2)',transition:'all .25s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:11,fontFamily:FT,fontWeight:tab===id?600:400,color:tab===id?bg:l2}}>{label}</span>
        </div>)}
      </div>

      {tab==='banya'&&<div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:14}}>
        {BANYA.map((b,i)=><div key={i} onClick={()=>push('booking',{service:b,title:b.n})} className="eth-tap eth-card" style={{borderRadius:22,overflow:'hidden',background:'var(--ef2)',border:`0.5px solid ${b.color}25`,cursor:'pointer'}}>
          <div style={{height:4,background:`linear-gradient(90deg,${b.color},${b.color}44)`}}/>
          <div style={{padding:'16px'}}>
            <div style={{display:'flex',gap:14,marginBottom:12}}>
              <div style={{width:58,height:58,borderRadius:18,background:`${b.color}15`,border:`0.5px solid ${b.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{b.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px',marginBottom:2}}>{b.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:5}}>{b.sub}</div>
                <div style={{display:'flex',gap:10}}>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {b.dur}</span>
                  <span style={{fontSize:11,color:'#FFD60A'}}>★ {b.r}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                {b.p>0
                  ?<><div style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FD}}>{b.p.toLocaleString('ru')}₽</div>
                    <div style={{fontSize:9,color:l3,fontFamily:FT,marginTop:1}}>/чел</div></>
                  :<div style={{fontSize:12,fontWeight:600,color:b.color,fontFamily:FT}}>По запросу</div>
                }
              </div>
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.55,marginBottom:10}}>{b.desc}</div>
            {b.note&&<div style={{background:`${b.color}12`,borderRadius:10,padding:'6px 10px',marginBottom:10}}>
              <span style={{fontSize:10,color:b.color,fontFamily:FT,fontWeight:600}}>ℹ️ {b.note}</span>
            </div>}
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              {b.feats.map((f,j)=><div key={j} style={{background:`${b.color}10`,border:`0.5px solid ${b.color}20`,borderRadius:8,padding:'3px 8px',display:'flex',gap:4}}>
                <span style={{fontSize:9,color:b.color}}>✓</span>
                <span style={{fontSize:10,color:l2,fontFamily:FT}}>{f}</span>
              </div>)}
            </div>
            <div style={{display:'flex',gap:6,overflowX:'auto',scrollbarWidth:'none'}}>
              {b.slots.map((sl,j)=><div key={j} className="eth-tap" onClick={e=>{e.stopPropagation();push('booking',{service:b,title:b.n,time:sl});}} style={{flexShrink:0,borderRadius:10,padding:'5px 12px',background:j===0?b.color:'var(--ef3)',border:j===0?'none':'0.5px solid var(--es2)',cursor:'pointer'}}>
                <span style={{fontSize:11,fontFamily:FT,fontWeight:600,color:j===0?'#fff':l2}}>{sl}</span>
              </div>)}
            </div>
          </div>
        </div>)}
      </div>}

      {tab==='packages'&&<div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:14}}>
        {PACKAGES.map((pk,i)=><div key={i} onClick={()=>push('booking',{service:pk,title:pk.n})} className="eth-tap" style={{borderRadius:22,overflow:'hidden',background:pk.color,boxShadow:'0 6px 28px rgba(0,0,0,.2)',position:'relative',cursor:'pointer'}}>
          {pk.popular&&<div style={{position:'absolute',top:12,right:12,background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',borderRadius:12,padding:'4px 10px',border:'0.5px solid rgba(255,255,255,.3)'}}><span style={{fontSize:10,color:'#fff',fontFamily:FT,fontWeight:600}}>🔥 Популярно</span></div>}
          <div style={{padding:'20px'}}>
            <div style={{fontSize:36,marginBottom:8}}>{pk.em}</div>
            <div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.3px',marginBottom:4}}>{pk.n}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:FT,marginBottom:14}}>{pk.sub} · {pk.dur}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
              {pk.details.map((d,j)=><div key={j} style={{background:'rgba(255,255,255,.12)',borderRadius:8,padding:'3px 8px'}}>
                <span style={{fontSize:10,color:'rgba(255,255,255,.85)',fontFamily:FT}}>{d}</span>
              </div>)}
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD}}>
                {pk.p>0?`${pk.p.toLocaleString('ru')}₽`:'По запросу'}
              </div>
              <div style={{background:'rgba(255,255,255,.95)',borderRadius:14,padding:'10px 20px'}}>
                <span style={{fontSize:13,fontWeight:700,fontFamily:FT,color:'#000'}}>Выбрать →</span>
              </div>
            </div>
          </div>
        </div>)}
      </div>}

      {tab==='rules'&&<div style={{padding:'0 20px 20px',display:'flex',flexDirection:'column',gap:12}}>
        <div style={{marginTop:4,marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FD}}>Правила посещения «Банного острова»</div>
          <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>СПА-центр «Символы» в отеле Шри-Ланка</div>
        </div>
        {RULES.map((r,i)=><div key={i} style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
          <div style={{fontSize:24,flexShrink:0}}>{r.em}</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT,marginBottom:3}}>{r.t}</div>
            <div style={{fontSize:12,color:l3,fontFamily:FT,lineHeight:1.5}}>{r.d}</div>
          </div>
        </div>)}
        <div style={{borderRadius:16,background:'rgba(255,107,53,.08)',border:'0.5px solid rgba(255,107,53,.25)',padding:'14px 16px'}}>
          <div style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.6}}>
            ⚠️ При малом количестве гостей (менее 6 чел.) на групповой сеанс администрация оставляет за собой право скорректировать условия проведения.
          </div>
        </div>
        <div onClick={()=>push('booking',{service:{n:'«Банный остров»',p:1500},title:'Забронировать Банный остров'})} className="eth-tap" style={{borderRadius:18,background:'linear-gradient(135deg,#FF6B35,#C0CA33)',padding:'16px',textAlign:'center',cursor:'pointer',marginTop:4}}>
          <div style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FD}}>Забронировать сеанс</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.8)',fontFamily:FT,marginTop:2}}>Групповой от 1500₽/чел · Звонок +7 495 023-81-81</div>
        </div>
      </div>}
    </div>
  </div>;
}

function ExhibitionsScreen({push,pop}){
  const[sel,setSel]=useState(null);
  // Источник: ethnomir.ru/posetitelyam/vystavki/
  // 4 реальные постоянные выставки ЭТНОМИРА
  const EXHBS=[
    {
      em:'🧠',
      n:'«Великие Учителя человечества»',
      sub:'Постоянная · бюсты великих мыслителей',
      status:'Постоянная',
      color:'#BF5AF2',
      loc:'Территория ЭТНОМИРа',
      count:'33+ бюста',
      price:0,
      desc:'Величайшее собрание бюстов мудрецов всех времён и народов: Аристотель и Омар Хайям, Циолковский и Будда, Ломоносов и Толстой, Платон и Коперник, Шекспир и Гумилёв.',
      fact:'Каждый бюст — повод для размышления о единстве человечества. Все они жили в разное время и принадлежали к разным культурам, но всех объединяет одно — любовь к знанию и людям.',
      includes:['33+ бюста выдающихся мыслителей','Аудиогид по QR-коду','Информационные таблички к каждому бюсту','Включено в билет в парк'],
    },
    {
      em:'🗺',
      n:'Галерея «Путешествие по России»',
      sub:'Постоянная · 89 регионов РФ',
      status:'Постоянная',
      color:'#30D158',
      loc:'Галерея «Путешествие по России», рядом с Музеем русской печи',
      count:'89 инфощитов',
      price:0,
      desc:'89 уникальных инфощитов — по одному для каждого субъекта Российской Федерации. Создана при информационной поддержке официальных представительств регионов.',
      fact:'На каждом инфощите — от 30 до 40 культурных, географических, исторических и туристических брендов региона. Итого более 3 500 брендов России в одном месте.',
      includes:['89 инфощитов по субъектам РФ','Более 3 500 региональных брендов','Фасады с фотографиями природы и архитектуры','Включено в билет в парк'],
    },
    {
      em:'🪨',
      n:'Галерея каменных скульптур',
      sub:'Постоянная · 10 скульптур · 11 стран',
      status:'Постоянная',
      color:'#FF9500',
      loc:'Между павильоном «Вокруг света» и «Центральная Азия»',
      count:'10 скульптур',
      price:0,
      desc:'Результат Международного симпозиума «Культура. Код. Камень» (2019). 11 скульпторов из 12 стран создали 10 уникальных скульптурных образов о мире, сотворчестве и любви.',
      fact:'Участники: Китай, Уругвай, Киргизия, Азербайджан, Белоруссия, Словения, Украина, Таджикистан, Сербия, Иран, Эстония, Россия. Проводился Фондом «Диалог Культур — Единый Мир».',
      includes:['10 авторских каменных скульптур','Работы мастеров из 12 стран мира','Под открытым небом — доступно круглый год','Включено в билет в парк'],
    },
    {
      em:'👒',
      n:'Выставка традиционных головных уборов',
      sub:'Постоянная · народы мира',
      status:'Постоянная',
      color:'#FF375F',
      loc:'Этнодворы и павильоны Улицы Мира',
      count:'Экспонаты народов мира',
      price:0,
      desc:'Коллекция традиционных головных уборов разных народов и культур. Головной убор — один из самых сложных и насыщенных смыслами элементов традиционного костюма.',
      fact:'Головной убор «звучит» в социальном этикете, ритуалах и обрядах, отражает представления о миропорядке: возраст, социальный статус, семейное и имущественное положение.',
      includes:['Головные уборы народов мира','Информационные описания к каждому экспонату','Возможность примерки (в некоторых экспонатах)','Включено в билет в парк'],
    },
  ];

  const statusColor={Постоянная:'#30D158',Временная:'#FF9500',Новая:'#0A84FF'};
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      {/* Header */}
      <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1,paddingLeft:pop?8:0}}>
          <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Выставки</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1}}>Постоянные экспозиции ЭТНОМИРа</div>
        </div>
      </div>
      {/* Hero */}
      <div style={{margin:'12px 20px 0',borderRadius:20,background:'linear-gradient(160deg,#0a0a1e,#1a1a4a,#2a1a5a)',padding:'18px 20px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-10,top:-10,fontSize:70,opacity:.12}}>🖼</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT,marginBottom:4}}>Постоянные · Обзорные · Образовательные</div>
        <div style={{fontSize:17,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.3px',marginBottom:6}}>Великолепные коллекции</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.65)',fontFamily:FT,lineHeight:1.5,marginBottom:12}}>Экспозиции расширяют кругозор, дают почву для размышлений, способствуют культурной идентификации и осознанию общемировых ценностей.</div>
        <div style={{display:'flex',gap:8}}>
          {[['4','выставки'],['Все','бесплатно'],['120+','памятников']].map(([n,lb],i)=>(
            <div key={i} style={{flex:1,background:'rgba(255,255,255,.1)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:700,color:'#fff',fontFamily:FD}}>{n}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.55)',fontFamily:FT}}>{lb}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Notice */}
      <div style={{margin:'10px 20px 0',borderRadius:12,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'10px 14px'}}>
        <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.5}}>
          ✅ Все постоянные выставки входят в стоимость билета в парк · +7 495 023-81-81
        </div>
      </div>
      {/* List */}
      <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
        <div style={{padding:'10px 20px 0'}}>
          {EXHBS.map((ex,i)=>{
            const open=sel===i;
            return(
              <div key={i} style={{borderRadius:20,background:'var(--ef2)',border:`0.5px solid ${ex.color}22`,overflow:'hidden',marginBottom:12}}>
                <div style={{height:3,background:`linear-gradient(90deg,${ex.color},${ex.color}44)`}}/>
                <div onClick={()=>setSel(open?null:i)} className="eth-tap" style={{padding:'14px 16px',cursor:'pointer'}}>
                  <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                    <div style={{width:54,height:54,borderRadius:16,background:`${ex.color}15`,border:`0.5px solid ${ex.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{ex.em}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',lineHeight:1.3}}>{ex.n}</div>
                      <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>{ex.sub}</div>
                      <div style={{display:'flex',gap:6,marginTop:5,flexWrap:'wrap',alignItems:'center'}}>
                        <span style={{fontSize:10,background:`${statusColor[ex.status]}15`,border:`0.5px solid ${statusColor[ex.status]}30`,borderRadius:6,padding:'2px 7px',color:statusColor[ex.status],fontFamily:FT,fontWeight:600}}>{ex.status}</span>
                        <span style={{fontSize:10,color:l3,fontFamily:FT}}>📦 {ex.count}</span>
                        <span style={{fontSize:11,fontWeight:700,color:green,fontFamily:FD,marginLeft:'auto'}}>Бесплатно</span>
                      </div>
                    </div>
                    <div style={{fontSize:18,color:l3,marginLeft:4,transition:'transform .25s',transform:open?'rotate(180deg)':'rotate(0)',flexShrink:0}}>⌄</div>
                  </div>
                  <div style={{background:'var(--ef3)',borderRadius:10,padding:'8px 10px',marginTop:10,display:'flex',gap:6}}>
                    <span style={{fontSize:11,flexShrink:0}}>💡</span>
                    <span style={{fontSize:11,color:l3,fontFamily:FT,fontStyle:'italic',lineHeight:1.4}}>{ex.fact}</span>
                  </div>
                </div>
                {open&&(
                  <div style={{borderTop:'0.5px solid var(--es2)',padding:'14px 16px',background:`${ex.color}06`}}>
                    <div style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.6,marginBottom:12}}>{ex.desc}</div>
                    <div style={{fontSize:10,fontWeight:700,color:l1,fontFamily:FD,marginBottom:8,letterSpacing:'.3px',textTransform:'uppercase'}}>Что включено:</div>
                    {ex.includes.map((inc,j)=>(
                      <div key={j} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:6}}>
                        <span style={{color:ex.color,fontSize:8,marginTop:4,flexShrink:0}}>▸</span>
                        <span style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.4}}>{inc}</span>
                      </div>
                    ))}
                    <div style={{background:`${ex.color}12`,border:`0.5px solid ${ex.color}28`,borderRadius:10,padding:'8px 12px',margin:'10px 0'}}>
                      <div style={{fontSize:10,color:ex.color,fontFamily:FT,fontWeight:600}}>📍 Расположение</div>
                      <div style={{fontSize:11,color:l2,fontFamily:FT,marginTop:2}}>{ex.loc}</div>
                    </div>
                    <div style={{display:'flex',gap:10}}>
                      <div onClick={()=>push('tickets',{})} className="eth-tap" style={{flex:1,background:ex.color,borderRadius:12,padding:'10px',textAlign:'center',cursor:'pointer'}}>
                        <span style={{fontSize:12,fontWeight:600,color:'#fff',fontFamily:FT}}>Купить билет</span>
                      </div>
                      <div onClick={()=>push('excursions',{})} className="eth-tap" style={{flex:1,background:'var(--ef3)',border:'0.5px solid var(--es2)',borderRadius:12,padding:'10px',textAlign:'center',cursor:'pointer'}}>
                        <span style={{fontSize:12,fontWeight:600,color:l1,fontFamily:FT}}>Экскурсия</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {/* Info block */}
          <div style={{borderRadius:16,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'16px'}}>
            <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FD,marginBottom:6}}>О выставках ЭТНОМИРа</div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,lineHeight:1.6}}>
              Посещение каждой экспозиции расширяет кругозор, даёт почву для размышлений и способствует культурной идентификации. Все постоянные выставки открыты ежедневно с 09:00 до 21:00 и включены в стоимость входного билета.
            </div>
            <div onClick={()=>push('tickets',{})} className="eth-tap" style={{marginTop:10,background:'var(--ef3)',border:'0.5px solid var(--es2)',borderRadius:12,padding:'10px',textAlign:'center',cursor:'pointer'}}>
              <span style={{fontSize:12,fontWeight:600,color:l1,fontFamily:FT}}>Купить билет в парк →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




// ═══════════════════ KIDSCAMP ═══════════════════

function KidsCampScreen({push,pop}){
  const PROGRAMS=[
    {em:'🏕',n:'Летний лагерь «Этномир»',sub:'7–14 лет · Июнь–август',dur:'21 день',p:42000,r:4.9,spots:12,
     feats:['Мастер-классы каждый день','Спорт и игры','Экскурсии','Питание 5 раз'],
     desc:'Полное погружение в культуры мира. Дети живут в тематических домиках разных народов'},
    {em:'🎒',n:'Этно-смена выходного дня',sub:'6–12 лет · Сб–Вс',dur:'2 дня',p:6500,r:4.8,spots:5,
     feats:['Ночёвка в лагере','Мастер-классы','Квест','Питание включено'],
     desc:'Мини-версия лагеря: 2 дня насыщенной программы с ночёвкой'},
    {em:'🌱',n:'Экошкола «Зелёный мир»',sub:'8–14 лет · Весь год',dur:'5 дней',p:18000,r:4.9,spots:8,
     feats:['Экология','Природа','Огород','Животные'],
     desc:'Дети изучают экологию и природу разных стран через практику: сажают растения, ухаживают за животными'},
    {em:'🎨',n:'Творческий интенсив',sub:'5–11 лет · На каникулах',dur:'7 дней',p:22000,r:4.8,spots:15,
     feats:['Живопись','Лепка','Батик','Выставка в конце'],
     desc:'Погружение в искусство народов мира. В конце — персональная выставка работ каждого ребёнка'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Детский лагерь" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{margin:'0 20px 16px',borderRadius:22,background:'linear-gradient(135deg,#0a3d1e,#1B4332,#27AE60)',padding:'22px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',right:-15,bottom:-15,fontSize:70,opacity:.15}}>🏕</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.55)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>Летний лагерь · Смены · Программы</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px'}}>Детский лагерь</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:FT,marginTop:4,marginBottom:16}}>20 лет опыта · 5 000+ детей каждый год</div>
        <div style={{display:'flex',gap:12}}>
          {[['🏆','5 000+ детей в год'],['⭐','4.9 рейтинг'],['🗓','4 смены в год']].map(([em,t],i)=><div key={i} style={{flex:1,background:'rgba(255,255,255,.12)',backdropFilter:'blur(8px)',borderRadius:12,padding:'10px 8px',textAlign:'center',border:'0.5px solid rgba(255,255,255,.2)'}}>
            <div style={{fontSize:16,marginBottom:4}}>{em}</div>
            <div style={{fontSize:9.5,color:'rgba(255,255,255,.85)',fontFamily:FT,lineHeight:1.3}}>{t}</div>
          </div>)}
        </div>
      </div>
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:14}}>
        {PROGRAMS.map((pr,i)=><div key={i} className="eth-tap eth-card" style={{borderRadius:22,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer'}} onClick={()=>push('booking',{service:pr,title:pr.n})}>
          <div style={{padding:'18px 18px 14px'}}>
            <div style={{display:'flex',gap:14,marginBottom:12}}>
              <div style={{width:58,height:58,borderRadius:18,background:`${green}15`,border:`0.5px solid ${green}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{pr.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px',marginBottom:2}}>{pr.n}</div>
                <div style={{fontSize:12,color:l3,fontFamily:FT,marginBottom:4}}>{pr.sub}</div>
                <div style={{display:'flex',gap:10}}>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {pr.dur}</span>
                  <span style={{fontSize:11,color:'#FFD60A'}}>★ {pr.r}</span>
                  {pr.spots<10&&<span style={{fontSize:11,color:red,fontFamily:FT}}>⚡ {pr.spots} мест</span>}
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:700,color:l1,fontFamily:FD}}>{pr.p.toLocaleString('ru')}₽</div>
                <div style={{fontSize:10,color:l3,fontFamily:FT,marginTop:1}}>/ смена</div>
              </div>
            </div>
            <div style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.5,marginBottom:12}}>{pr.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {pr.feats.map((f,j)=><div key={j} style={{background:`${green}10`,border:`0.5px solid ${green}20`,borderRadius:8,padding:'3px 8px',display:'flex',gap:4,alignItems:'center'}}>
                <span style={{fontSize:9,color:green}}>✓</span>
                <span style={{fontSize:10,color:l2,fontFamily:FT}}>{f}</span>
              </div>)}
            </div>
          </div>
          <div style={{padding:'12px 18px 16px',borderTop:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:12,color:l3,fontFamily:FT}}>Запись открыта</span>
            <div style={{background:green,borderRadius:14,padding:'8px 20px'}}>
              <span style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:FT}}>Записать ребёнка →</span>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

// ═══════════════════ VENUE ═══════════════════

function VenueScreen({push,pop}){
  const VENUES=[
    {em:'🏛',n:'Главный зал «Мир»',sub:'Конференции · Форумы · Выставки',cap:500,sq:800,p:120000,color:blue,
     feats:['Сцена 20×15м','Проектор 8К','Звук Dolby','Видеосъёмка']},
    {em:'🎪',n:'Шатёр «Юрта»',sub:'Банкеты · Свадьбы · Корпоративы',cap:200,sq:400,p:65000,color:orange,
     feats:['Круглый стол','Этно-декор','Кейтеринг','Открытая терраса']},
    {em:'🌿',n:'Сад «Этно-терраса»',sub:'Летние мероприятия · Пикники',cap:300,sq:1200,p:45000,color:green,
     feats:['Открытое небо','Мангал','Лужайка','Сцена на природе']},
    {em:'🎓',n:'Конференц-зал «Академия»',sub:'Семинары · Тренинги · Лекции',cap:80,sq:150,p:25000,color:purple,
     feats:['Флипчарты','Wi-Fi 1Гбит','Кофе-брейк','Ноутбуки']},
    {em:'🎨',n:'Арт-галерея',sub:'Презентации · Открытия · Выставки',cap:120,sq:250,p:35000,color:pink,
     feats:['Галерейный свет','Витрины','Арт-подвес','Бар']},
    {em:'🌊',n:'Панорамный купол',sub:'VR-ивенты · Нестандартные форматы',cap:60,sq:300,p:55000,color:teal,
     feats:['360° проекция','Immersive sound','Климат-контроль','Уникальный формат']},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Аренда площадок" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{margin:'0 20px 16px',borderRadius:22,background:'linear-gradient(135deg,#0a1628,#1a2a4a)',padding:'20px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',right:-15,top:-15,fontSize:56,opacity:.15}}>🏟</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>Конференции · Банкеты · Ивенты</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px'}}>Площадки для мероприятий</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:4}}>6 уникальных пространств · Вместимость до 500 гостей</div>
      </div>
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
        {VENUES.map((v,i)=><div key={i} onClick={()=>push('booking',{service:v,title:v.n})} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:`0.5px solid ${v.color}25`,overflow:'hidden',cursor:'pointer',position:'relative'}}>
          <div style={{height:4,background:`linear-gradient(90deg,${v.color},${v.color}44)`}}/>
          <div style={{padding:'16px'}}>
            <div style={{display:'flex',gap:14,marginBottom:12}}>
              <div style={{width:54,height:54,borderRadius:16,background:`${v.color}15`,border:`0.5px solid ${v.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{v.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.3px',marginBottom:2}}>{v.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:6}}>{v.sub}</div>
                <div style={{display:'flex',gap:12}}>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>👥 до {v.cap}</span>
                  <span style={{fontSize:11,color:l3,fontFamily:FT}}>📐 {v.sq} м²</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{v.p.toLocaleString('ru')}₽</div>
                <div style={{fontSize:10,color:l3,fontFamily:FT,marginTop:1}}>/ день</div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {v.feats.map((f,j)=><div key={j} style={{background:`${v.color}10`,border:`0.5px solid ${v.color}20`,borderRadius:8,padding:'3px 9px'}}><span style={{fontSize:10,color:v.color,fontFamily:FT,fontWeight:500}}>{f}</span></div>)}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  </div>;
}

// ═══════════════════ SCHOOL ═══════════════════

function SchoolScreen({push,pop}){
  const PROGRAMS=[
    {em:'🌍',n:'Этнографическая экспедиция',sub:'7–11 классы · ФГОС · 5 стран',dur:'3 часа',p:1800,r:4.9,
     subjects:['История','География','МХК'],
     feats:['5 стран','3 мастер-класса','Обед включён','Рабочая тетрадь'],
     desc:'Учебная экскурсия — живой урок истории и географии. Дети получают зачётный балл по МХК'},
    {em:'🔬',n:'Живая наука народов мира',sub:'5–8 классы · Химия и физика',dur:'2.5 часа',p:1200,r:4.8,
     subjects:['Химия','Физика','Биология'],
     feats:['10 экспериментов','Лабораторный журнал','Диплом участника'],
     desc:'Научные эксперименты с использованием природных материалов разных культур'},
    {em:'🎨',n:'Искусство народов мира',sub:'1–4 классы · Творчество',dur:'2 часа',p:900,r:4.9,
     subjects:['ИЗО','Технология','Музыка'],
     feats:['3 мастер-класса','Забирают поделку','Сувениры'],
     desc:'Малыши пробуют гончарство, плетение и батик — всё в безопасном формате для начальной школы'},
    {em:'✈️',n:'Кругосветка за один день',sub:'6–11 классы · Всё включено',dur:'6 часов',p:2200,r:4.9,
     subjects:['История','Литература','ИЗО','Музыка'],
     feats:['9 стран','Гид','Обед + полдник','Паспорт путешественника'],
     desc:'Самая популярная программа: дети объезжают 9 стран, собирают «визы» и выполняют задания'},
    {em:'🏛',n:'Студенческая экспедиция',sub:'ВУЗы · Полевые исследования',dur:'2–3 дня',p:4500,r:4.9,
     subjects:['Этнография','Культурология','Социология'],
     feats:['Проживание','Полевой дневник','Зачёт/оценка','Научный руководитель'],
     desc:'Для студентов гуманитарных специальностей. Полноценная полевая практика с зачётом'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Школьникам" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      <div style={{margin:'0 20px 16px',borderRadius:22,background:'linear-gradient(135deg,#1a3a8a,#0E4D92,#2980B9)',padding:'20px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',right:-15,top:-15,fontSize:56,opacity:.15}}>🎓</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.55)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:4}}>ФГОС · Образование · Практика</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.4px'}}>Образовательные программы</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.6)',fontFamily:FT,marginTop:4,marginBottom:16}}>20 лет · 500+ программ в год · 50 000 школьников</div>
        <div style={{display:'flex',gap:8}}>
          {[['📋','ФГОС-совм.'],['🏆','ТОП-10 Подмосковья'],['🎓','Зачётный балл']].map(([em,t],i)=><div key={i} style={{flex:1,background:'rgba(255,255,255,.12)',backdropFilter:'blur(8px)',borderRadius:10,padding:'8px 6px',textAlign:'center',border:'0.5px solid rgba(255,255,255,.2)'}}>
            <div style={{fontSize:14,marginBottom:3}}>{em}</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.8)',fontFamily:FT,lineHeight:1.3}}>{t}</div>
          </div>)}
        </div>
      </div>
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
        {PROGRAMS.map((pr,i)=><div key={i} onClick={()=>push('booking',{service:pr,title:pr.n})} className="eth-tap eth-card" style={{borderRadius:20,background:'var(--ef2)',border:'0.5px solid var(--es2)',overflow:'hidden',cursor:'pointer'}}>
          <div style={{padding:'16px'}}>
            <div style={{display:'flex',gap:14,marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:16,background:`${blue}15`,border:`0.5px solid ${blue}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{pr.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.2px',marginBottom:2}}>{pr.n}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:4}}>{pr.sub}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {pr.subjects.map((s,j)=><div key={j} style={{background:`${blue}12`,borderRadius:6,padding:'2px 7px'}}><span style={{fontSize:9,color:blue,fontFamily:FT,fontWeight:600}}>{s}</span></div>)}
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{pr.p}₽</div>
                <div style={{fontSize:10,color:l3,fontFamily:FT,marginTop:1}}>/ чел</div>
              </div>
            </div>
            <div style={{fontSize:11,color:l2,fontFamily:FT,lineHeight:1.5,marginBottom:10}}>{pr.desc}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {pr.feats.map((f,j)=><div key={j} style={{background:'var(--ef3)',borderRadius:8,padding:'3px 8px',display:'flex',gap:4}}>
                <span style={{fontSize:9,color:green}}>✓</span>
                <span style={{fontSize:10,color:l2,fontFamily:FT}}>{f}</span>
              </div>)}
            </div>
          </div>
        </div>)}
      </div>
      {/* Group CTA */}
      <div style={{padding:'16px 20px 0'}}>
        <div onClick={()=>push('booking',{service:{n:'Групповая заявка'},title:'Групповая заявка'})} className="eth-tap" style={{borderRadius:18,padding:'16px',background:blue,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FD,marginBottom:2}}>Групповая заявка</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.75)',fontFamily:FT}}>Для групп от 7 человек · Скидка 15%</div>
          </div>
          <div style={{fontSize:22}}>📋</div>
        </div>
      </div>
    </div>
  </div>;
}

function CitizenshipScreen({push,pop,visits={}}){
  const totalStamps=Object.values(visits).reduce((s,v)=>s+v.stamps,0);
  const level=totalStamps>=500?4:totalStamps>=100?3:totalStamps>=5?2:totalStamps>=1?1:0;
  const lvl=CITIZENSHIP_LEVELS[level];
  const nextLvl=CITIZENSHIP_LEVELS[Math.min(level+1,4)];
  const thresholds=[0,1,5,100,500];
  const nextThreshold=thresholds[Math.min(level+1,4)];
  const progress=level>=4?1:Math.min((totalStamps-thresholds[level])/(nextThreshold-thresholds[level]),1);
  const visitedCount=Object.values(visits).filter(v=>v.visited).length;

  const PERKS=[
    {level:0,emoji:'🌱',title:'Путешественник',perks:['Доступ к базовым экскурсиям','Паспорт путешественника','Карта парка'],color:'#8D6E63',threshold:0},
    {level:1,emoji:'🌿',title:'Знакомый',perks:['Скидка 5% на мастер-классы','Приоритетная бронь','Доступ к аудиогиду бесплатно'],color:green,threshold:1},
    {level:2,emoji:'🌳',title:'Гражданин',perks:['Скидка 10% на всё','Бесплатный вход 2 раза/год','Закрытые мероприятия'],color:blue,threshold:5},
    {level:3,emoji:'🏛',title:'Посол',perks:['Скидка 20% на всё','Бесплатный вход безлимит','VIP-зал · Личный гид','Сертификат Посла'],color:purple,threshold:100},
    {level:4,emoji:'👑',title:'Легенда',perks:['Скидка 30% навсегда','Приоритет во всём','Именная звезда в парке','Пожизненный абонемент'],color:yellow,threshold:500},
  ];

  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?4:0}}>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Гражданство</div>
        <div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:1}}>Путь от Путешественника до Легенды</div>
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',paddingBottom:100}}>
      {/* Current status hero */}
      <div style={{margin:'16px 20px',borderRadius:28,background:`linear-gradient(145deg,${lvl.color}22,${lvl.color}08)`,border:`1px solid ${lvl.color}30`,padding:'24px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',right:-20,top:-20,fontSize:100,opacity:.08}}>{lvl.emoji}</div>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
          <div style={{width:72,height:72,borderRadius:22,background:`${lvl.color}20`,border:`2px solid ${lvl.color}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34,flexShrink:0}}>{lvl.emoji}</div>
          <div>
            <div style={{fontSize:12,color:lvl.color,fontFamily:FT,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:3}}>Ваш уровень</div>
            <div style={{fontSize:26,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-.5px'}}>{lvl.title}</div>
          </div>
        </div>
        {/* Stats row */}
        <div style={{display:'flex',gap:10,marginBottom:16}}>
          {[['🎯',String(totalStamps),'штампов'],[' 🌍',String(visitedCount),'стран'],['⭐',`Ур. ${level+1}/5`,'']].map(([em,v,sub],i)=><div key={i} style={{flex:1,background:'rgba(255,255,255,.06)',borderRadius:14,padding:'10px 8px',textAlign:'center',border:'0.5px solid rgba(255,255,255,.08)'}}>
            <div style={{fontSize:12,marginBottom:3}}>{em}</div>
            <div style={{fontSize:17,fontWeight:700,color:l1,fontFamily:FD}}>{v}</div>
            {sub&&<div style={{fontSize:9,color:l3,fontFamily:FT,marginTop:1}}>{sub}</div>}
          </div>)}
        </div>
        {/* Progress bar */}
        {level<4&&<>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:11,color:l3,fontFamily:FT}}>До уровня «{nextLvl.title}»</span>
            <span style={{fontSize:11,color:lvl.color,fontFamily:FT,fontWeight:600}}>{totalStamps} / {nextThreshold} штампов</span>
          </div>
          <div style={{height:8,borderRadius:4,background:'rgba(255,255,255,.1)',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${progress*100}%`,borderRadius:4,background:`linear-gradient(90deg,${lvl.color},${nextLvl.color})`,transition:'width .6s cubic-bezier(.34,1.3,.64,1)'}}/>
          </div>
        </>}
        {level===4&&<div style={{background:`${yellow}20`,border:`0.5px solid ${yellow}40`,borderRadius:12,padding:'8px 14px',textAlign:'center'}}>
          <span style={{fontSize:12,color:yellow,fontFamily:FT,fontWeight:600}}>👑 Вы достигли максимального уровня!</span>
        </div>}
      </div>

      {/* How to earn stamps */}
      <div style={{padding:'0 20px 16px'}}>
        <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Как получать штампы</div>
        {[
          {em:'🌍',n:'Посетить страну',desc:'Зайди в павильон и получи штамп',stamps:1,color:blue},
          {em:'🎓',n:'Мастер-класс',desc:'Пройди любой мастер-класс до конца',stamps:2,color:orange},
          {em:'🏨',n:'Переночевать в отеле',desc:'Бронь на 1+ ночь в этно-отеле',stamps:5,color:teal},
          {em:'🎫',n:'Фестиваль',desc:'Посетить главное событие сезона',stamps:3,color:purple},
          {em:'🧩',n:'Завершить квест',desc:'Пройти любой квест целиком',stamps:4,color:green},
        ].map((h,i)=><div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:i<4?'0.5px solid var(--es2)':'none',alignItems:'center'}}>
          <div style={{width:38,height:38,borderRadius:12,background:`${h.color}15`,border:`0.5px solid ${h.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{h.em}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{h.n}</div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:1}}>{h.desc}</div>
          </div>
          <div style={{background:`${h.color}15`,borderRadius:10,padding:'4px 10px',border:`0.5px solid ${h.color}30`}}>
            <span style={{fontSize:12,color:h.color,fontFamily:FT,fontWeight:700}}>+{h.stamps} 🎯</span>
          </div>
        </div>)}
      </div>

      {/* All levels */}
      <div style={{padding:'0 20px'}}>
        <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Все уровни и привилегии</div>
        {PERKS.map((lv,i)=>{
          const isActive=level===lv.level;
          const isUnlocked=level>=lv.level;
          const isFuture=level<lv.level;
          return <div key={i} style={{borderRadius:20,background:isActive?`${lv.color}12`:'var(--ef2)',border:`1px solid ${isActive?lv.color:isFuture?'var(--es2)':lv.color+'30'}`,padding:'14px 16px',marginBottom:10,opacity:isFuture?.55:1,transition:'all .2s'}}>
            <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
              <div style={{width:48,height:48,borderRadius:15,background:isUnlocked?`${lv.color}20`:'var(--ef3)',border:`${isActive?2:1}px solid ${isUnlocked?lv.color+'40':'var(--es2)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{lv.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <div style={{fontSize:15,fontWeight:700,color:isActive?lv.color:l1,fontFamily:FD,letterSpacing:'-.2px'}}>{lv.title}</div>
                  {isActive&&<div style={{background:lv.color,borderRadius:8,padding:'2px 8px'}}><span style={{fontSize:9,color:'#fff',fontFamily:FT,fontWeight:700}}>ТЕКУЩИЙ</span></div>}
                  {isUnlocked&&!isActive&&<span style={{fontSize:12,color:green}}>✓</span>}
                </div>
                <div style={{fontSize:10,color:l4,fontFamily:FT,marginBottom:8}}>от {lv.threshold} штампов</div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {lv.perks.map((p,j)=><div key={j} style={{background:isUnlocked?`${lv.color}10`:'var(--ef3)',border:`0.5px solid ${isUnlocked?lv.color+'20':'var(--es2)'}`,borderRadius:8,padding:'2px 8px',display:'flex',gap:4,alignItems:'center'}}>
                    <span style={{fontSize:9,color:isUnlocked?lv.color:l4}}>✓</span>
                    <span style={{fontSize:10,color:isUnlocked?l2:l4,fontFamily:FT}}>{p}</span>
                  </div>)}
                </div>
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

function RestaurantDetailSC({push,pop,params={},cart=[],cartCount=0,cartTotal=0,addToCart}){
  const r=params.restaurant||params.res||{em:'🍜',n:'Пад Тай · Тайланд',sub:'Тайская кухня',r:4.9,wait:'15 мин',price:'400–900₽',region:'Азия',color:'#FF6B35',dishes:['Пад Тай 450₽','Том Ям 380₽','Карри 520₽']};
  const[tab,setTab]=useState('menu');
  const MENU={
    'Закуски':[
      {n:'Спринг-роллы',p:320,desc:'Хрустящие с овощами',em:'🥢',hot:false},
      {n:'Суп Том Ям',p:380,desc:'Острый кокосовый суп',em:'🥣',hot:true},
    ],
    'Основное':[
      {n:r.dishes?.[0]?.split(' ')[0]||'Пад Тай',p:parseInt(r.dishes?.[0]?.match(/\d+/)?.[0]||450),desc:'Классика',em:'🍜',hot:false},
      {n:r.dishes?.[1]?.split(' ')[0]||'Карри',p:parseInt(r.dishes?.[1]?.match(/\d+/)?.[0]||520),desc:'Кокосовый соус',em:'🍛',hot:true},
      {n:r.dishes?.[2]?.split(' ')[0]||'Лапша',p:parseInt(r.dishes?.[2]?.match(/\d+/)?.[0]||480),desc:'Вок-сковорода',em:'🫕',hot:false},
    ],
    'Напитки':[
      {n:'Тайский чай',p:180,desc:'Со сгущёнкой и льдом',em:'🧋',hot:false},
      {n:'Кокосовая вода',p:220,desc:'Свежий кокос',em:'🥥',hot:false},
    ],
    'Десерты':[
      {n:'Манго с рисом',p:280,desc:'Sticky rice с манго',em:'🥭',hot:false},
    ],
  };
  const restaurantCart=cart.filter(x=>x.source===r.n);
  const totalItems=restaurantCart.reduce((s,x)=>s+x.qty,0);
  const totalPrice=restaurantCart.reduce((s,x)=>s+x.price*x.qty,0);
  const inCart=(name)=>cart.find(x=>x.id===r.n+'_'+name)?.qty||0;
  const addDish=(item)=>addToCart&&addToCart({id:r.n+'_'+item.n,name:item.n,emoji:item.em,price:item.p,category:'food',source:r.n});
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?4:0}}>
        <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>{r.n}</div>
        <div style={{display:'flex',gap:10,marginTop:2}}>
          <span style={{fontSize:11,color:'#FFD60A'}}>★ {r.r}</span>
          <span style={{fontSize:11,color:l3,fontFamily:FT}}>⏱ {r.wait}</span>
          <span style={{fontSize:11,color:green,fontFamily:FT,fontWeight:600}}>● Открыт</span>
        </div>
      </div>
      <div style={{width:52,height:52,borderRadius:16,background:`${r.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{r.em}</div>
    </div>
    <div style={{padding:'0 20px 10px',display:'flex',gap:8}}>
      {[['menu','📋 Меню'],['info','ℹ️ О ресторане'],['reviews','⭐ Отзывы']].map(([id,label])=><div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,borderRadius:12,padding:'8px',textAlign:'center',cursor:'pointer',background:tab===id?l1:'var(--ef2)',border:tab===id?'none':'0.5px solid var(--es2)',transition:'all .2s'}}>
        <span style={{fontSize:11,fontFamily:FT,fontWeight:tab===id?600:400,color:tab===id?bg:l2}}>{label}</span>
      </div>)}
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'0 20px',paddingBottom:totalItems>0?140:80}}>
      {tab==='menu'&&Object.entries(MENU).map(([cat,items])=><div key={cat} style={{marginBottom:16}}>
        <div style={{fontSize:12,color:l3,fontFamily:FT,fontWeight:700,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:8}}>{cat}</div>
        {items.map((item,i)=><div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'0.5px solid var(--es2)',alignItems:'center'}}>
          <div style={{fontSize:26,width:36,textAlign:'center',flexShrink:0}}>{item.em}</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:2}}>
              <span style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{item.n}</span>
              {item.hot&&<span style={{fontSize:9,background:`${red}15`,color:red,borderRadius:6,padding:'1px 5px'}}>Остро</span>}
            </div>
            <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:4}}>{item.desc}</div>
            <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD}}>{item.p}₽</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            {inCart(item.n)>0&&<span style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FD,minWidth:14,textAlign:'center'}}>{inCart(item.n)}</span>}
            <div onClick={()=>addDish(item)} className="eth-tap" style={{width:32,height:32,borderRadius:11,background:inCart(item.n)>0?r.color:blue,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,color:'#fff'}}>+</div>
          </div>
        </div>)}
      </div>)}
      {tab==='info'&&<div style={{paddingTop:8}}>
        {[['🕐','Часы работы','10:00–22:00'],['📍','Расположение','Фуд-корт, корпус Б'],['💰','Средний чек',r.price||'400–900₽']].map(([em,k,v],i,arr)=><div key={i} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:i<arr.length-1?'0.5px solid var(--es2)':'none',alignItems:'center'}}>
          <span style={{fontSize:18,width:30,textAlign:'center'}}>{em}</span>
          <span style={{flex:1,fontSize:13,color:l3,fontFamily:FT}}>{k}</span>
          <span style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{v}</span>
        </div>)}
      </div>}
      {tab==='reviews'&&<div style={{paddingTop:8}}>
        {[{name:'Анна',r:5,text:'Лучший пад тай!',date:'12 марта'},{name:'Дмитрий',r:4,text:'Том ям огонь 🔥',date:'8 марта'},{name:'Светлана',r:5,text:'Аутентичная кухня',date:'3 марта'}].map((rv,i)=><div key={i} style={{padding:'12px 0',borderBottom:i<2?'0.5px solid var(--es2)':'none'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{rv.name}</span>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <span style={{fontSize:11,color:'#FFD60A'}}>{'★'.repeat(rv.r)}</span>
              <span style={{fontSize:10,color:l4,fontFamily:FT}}>{rv.date}</span>
            </div>
          </div>
          <div style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.5}}>{rv.text}</div>
        </div>)}
      </div>}
    </div>
    {totalItems>0&&<div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
      <div onClick={()=>push('cart')} className="eth-tap" style={{borderRadius:16,padding:'15px',background:r.color,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:26,height:26,borderRadius:13,background:'rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:12,color:'#fff',fontWeight:700}}>{totalItems}</span>
          </div>
          <span style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FT}}>Перейти в корзину</span>
        </div>
        <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FD}}>{totalPrice.toLocaleString('ru')}₽</span>
      </div>
    </div>}
  </div>;
}

function AudioPlayerSC({pop,params={}}){
  const route=params.route||{em:'🌍',n:'Полный тур: Весь парк',sub:'60 остановок · 4 часа',price:0,r:4.9};
  const[playing,setPlaying]=useState(false);
  const[stop,setStop]=useState(0);
  const[progress,setProgress]=useState(0.18);
  const stops=[
    {n:'Главный вход',sub:'Точка начала маршрута',em:'🚪',dur:'2:30',done:true},
    {n:'Русская деревня',sub:'История русского зодчества',em:'🏯',dur:'4:15',done:true},
    {n:'Колодец-журавль',sub:'Символ крестьянской жизни',em:'🪣',dur:'1:45',done:false,active:true},
    {n:'Кузница',sub:'Живой мастер — изготовление ножа',em:'⚒️',dur:'3:20',done:false},
    {n:'Русская печь',sub:'8 метров · Внутри музей хлеба',em:'🍞',dur:'2:50',done:false},
    {n:'Восточный базар',sub:'Специи, ковры, живая музыка',em:'🕌',dur:'5:10',done:false},
    {n:'Хаммам',sub:'История восточной бани',em:'♨️',dur:'3:30',done:false},
    {n:'Японский сад',sub:'Сад камней и медитации',em:'🌸',dur:'4:00',done:false},
    {n:'Пагода Дракона',sub:'7 этажей, 24 метра',em:'🐉',dur:'2:15',done:false},
    {n:'Лебединое озеро',sub:'Финальная точка маршрута',em:'🌊',dur:'3:45',done:false},
  ];
  const doneCount=stops.filter(s=>s.done).length;
  const totalMins=stops.reduce((s,st)=>{const[m,sec]=st.dur.split(':').map(Number);return s+m+sec/60;},0);
  const doneMins=stops.filter(s=>s.done).reduce((s,st)=>{const[m,sec]=st.dur.split(':').map(Number);return s+m+sec/60;},0);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
      {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
      <div style={{flex:1,paddingLeft:pop?4:0}}>
        <div style={{fontSize:18,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px',lineHeight:1.2}}>{route.n}</div>
        <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>{route.sub}</div>
      </div>
    </div>
    {/* Player card */}
    <div style={{margin:'16px 20px 0',borderRadius:28,background:'linear-gradient(145deg,#0a1628,#1a2a4a)',padding:'22px',border:'0.5px solid rgba(255,255,255,.1)'}}>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18}}>
        <div style={{width:64,height:64,borderRadius:20,background:'rgba(255,255,255,.1)',border:'0.5px solid rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0}}>{stops.find(s=>s.active)?.em||'🎧'}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:FD,marginBottom:3}}>{stops.find(s=>s.active)?.n||'Колодец-журавль'}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.55)',fontFamily:FT}}>{stops.find(s=>s.active)?.sub||'Остановка 3 из 10'}</div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,.15)',overflow:'hidden',marginBottom:8}}>
        <div style={{height:'100%',width:`${progress*100}%`,borderRadius:2,background:`linear-gradient(90deg,${blue},#5AC8FA)`,transition:'width .3s'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
        <span style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>1:23</span>
        <span style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:FT}}>3:45</span>
      </div>
      {/* Controls */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:28}}>
        <div onClick={()=>setStop(s=>Math.max(0,s-1))} className="eth-tap" style={{width:44,height:44,borderRadius:22,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <span style={{fontSize:24,color:'rgba(255,255,255,.6)'}}>⏮</span>
        </div>
        <div onClick={()=>setPlaying(p=>!p)} className="eth-tap" style={{width:60,height:60,borderRadius:30,background:blue,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 4px 20px ${blue}60`}}>
          <span style={{fontSize:26,color:'#fff'}}>{playing?'⏸':'▶'}</span>
        </div>
        <div onClick={()=>setStop(s=>Math.min(stops.length-1,s+1))} className="eth-tap" style={{width:44,height:44,borderRadius:22,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <span style={{fontSize:24,color:'rgba(255,255,255,.6)'}}>⏭</span>
        </div>
      </div>
    </div>
    {/* Stats */}
    <div style={{padding:'12px 20px 0',display:'flex',gap:10}}>
      {[[`${doneCount}/${stops.length}`,'Остановок','✅'],[`${Math.round(doneMins)}/${Math.round(totalMins)}`,'Минут','⏱'],['2/10','км пройдено','🚶']].map(([v,label,em],i)=><div key={i} style={{flex:1,borderRadius:14,padding:'10px 8px',background:'var(--ef2)',border:'0.5px solid var(--es2)',textAlign:'center'}}>
        <div style={{fontSize:10,marginBottom:3}}>{em}</div>
        <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FD}}>{v}</div>
        <div style={{fontSize:9,color:l3,fontFamily:FT,marginTop:1}}>{label}</div>
      </div>)}
    </div>
    {/* Track list */}
    <div style={{flex:1,overflowY:'auto',padding:'12px 20px 100px'}}>
      <div style={{fontSize:11,color:l3,fontFamily:FT,fontWeight:700,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:10}}>Маршрут</div>
      {stops.map((s,i)=><div key={i} onClick={()=>setStop(i)} className="eth-tap" style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'0.5px solid var(--es2)',alignItems:'center',cursor:'pointer',opacity:s.done&&!s.active?.6:1}}>
        <div style={{width:32,height:32,borderRadius:10,background:s.active?`${blue}15`:s.done?`${green}15`:'var(--ef3)',border:`0.5px solid ${s.active?blue:s.done?green:'var(--es2)'}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{s.em}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:s.active?700:500,color:s.active?blue:l1,fontFamily:FT,marginBottom:1}}>{s.n}</div>
          <div style={{fontSize:10,color:l3,fontFamily:FT}}>{s.sub}</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontSize:11,color:s.active?blue:l4,fontFamily:FT,fontWeight:s.active?600:400}}>{s.dur}</div>
          {s.done&&<div style={{fontSize:9,color:green,marginTop:1}}>✓ Прослушано</div>}
          {s.active&&<div style={{fontSize:9,color:blue,marginTop:1}}>Сейчас</div>}
        </div>
      </div>)}
    </div>
  </div>;
}

function EventDetailSC({push,pop,params={}}){
  const ev=params.event||{
    em:'🎭',n:'Фестиваль Индии',sub:'Живые танцоры · Йога · Специи',
    date:'15 марта',time:'18:00',dur:'3 ч',p:350,r:4.9,spots:12,
    color:'#FF9933',
  };
  const[tab,setTab]=useState('about');
  const PROGRAM=[
    {time:'18:00',em:'🎵',n:'Открытие: живая музыка',d:'Ситар, табла, флейта бансури'},
    {time:'18:30',em:'💃',n:'Классический танец Катхак',d:'Труппа из Джайпура, 45 мин'},
    {time:'19:15',em:'🧘',n:'Интерактивная йога',d:'Мастер-класс для всех участников'},
    {time:'20:00',em:'🍛',n:'Дегустация специй',d:'10 видов специй с гидом'},
    {time:'20:30',em:'🎨',n:'Мастер-класс по хне',d:'Узоры мехенди на руку'},
    {time:'21:00',em:'🎆',n:'Финальное шоу',d:'Огонь-шоу и музыкальный джем'},
  ];
  const SPEAKERS=[
    {em:'👩',n:'Аиша Сингх',role:'Хореограф-постановщик',from:'Джайпур, Раджастан'},
    {em:'👨',n:'Рам Прасад',role:'Мастер игры на ситаре',from:'Бенарес, UP'},
    {em:'👩‍🦱',n:'Прия Мехта',role:'Инструктор йоги, 15 лет',from:'Ришикеш, Уттаракханд'},
  ];
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    <NavBar title="Событие" back={pop?'Назад':undefined} onBack={pop}/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:120}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(160deg,#1a0500,${ev.color}40,${ev.color}15)`,padding:'22px 20px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-20,bottom:-20,fontSize:80,opacity:.1}}>{ev.em}</div>
        <div style={{position:'relative'}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,.5)',fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:8}}>Событие дня</div>
          <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',marginBottom:6}}>{ev.n}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontFamily:FT,marginBottom:16}}>{ev.sub}</div>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {[['📅',ev.date],['⏰',ev.time],['⏱',ev.dur],['★',String(ev.r)],['💰',`${ev.p}₽`]].map(([em,val],i)=><div key={i} style={{display:'flex',gap:5,alignItems:'center'}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,.5)'}}>{em}</span>
              <span style={{fontSize:12,color:'rgba(255,255,255,.8)',fontFamily:FT,fontWeight:500}}>{val}</span>
            </div>)}
          </div>
          {ev.spots&&ev.spots<20&&<div style={{marginTop:12,display:'inline-flex',gap:6,alignItems:'center',background:'rgba(255,69,58,.2)',borderRadius:10,padding:'6px 12px',border:'0.5px solid rgba(255,69,58,.4)'}}>
            <span style={{fontSize:12}}>⚡</span>
            <span style={{fontSize:12,color:'#FF453A',fontFamily:FT,fontWeight:600}}>Осталось {ev.spots} мест!</span>
          </div>}
        </div>
      </div>
      {/* Tabs */}
      <div style={{padding:'12px 20px 0',display:'flex',gap:8}}>
        {[['about','О событии'],['program','Программа'],['speakers','Участники']].map(([id,label])=><div key={id} onClick={()=>setTab(id)} className="eth-tap" style={{flex:1,borderRadius:14,padding:'9px',textAlign:'center',cursor:'pointer',background:tab===id?l1:'var(--ef2)',border:tab===id?'none':'0.5px solid var(--es2)',transition:'all .2s cubic-bezier(.34,1.3,.64,1)'}}>
          <span style={{fontSize:12,fontFamily:FT,fontWeight:tab===id?600:400,color:tab===id?bg:l2}}>{label}</span>
        </div>)}
      </div>
      <div style={{padding:'14px 20px'}}>
        {tab==='about'&&<div>
          <div style={{fontSize:13,color:l2,fontFamily:FT,lineHeight:1.7,marginBottom:18}}>Ежегодный Фестиваль Индии — одно из самых популярных событий Этномира. Три часа живой культуры: классические танцы Катхак и Бхаратанатьям, мастер-классы по йоге, дегустация специй и огненное шоу.</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[['📍','Место','Площадь Мира, Главная сцена'],['🚗','Как добраться','Трансфер от м. Молодёжная каждый час'],['🎪','Формат','Уличное шоу + крытые мастер-классы'],['👨‍👩‍👧','Для кого','6+ лет, без ограничений'],['🌧','Погода','Проводится при любой погоде']].map(([em,k,v],i)=><div key={i} style={{borderRadius:14,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'10px 14px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontSize:18,flexShrink:0}}>{em}</span>
              <div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginBottom:1}}>{k}</div>
                <div style={{fontSize:13,fontWeight:500,color:l1,fontFamily:FT}}>{v}</div>
              </div>
            </div>)}
          </div>
        </div>}
        {tab==='program'&&<div style={{display:'flex',flexDirection:'column',gap:10}}>
          {PROGRAM.map((pr,i)=><div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',position:'relative'}}>
            {i<PROGRAM.length-1&&<div style={{position:'absolute',left:28,top:32,bottom:-10,width:1,background:'var(--es2)'}}/>}
            <div style={{width:56,flexShrink:0}}>
              <div style={{width:56,height:56,borderRadius:18,background:`${ev.color}15`,border:`0.5px solid ${ev.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,position:'relative',zIndex:1}}>{pr.em}</div>
            </div>
            <div style={{flex:1,paddingTop:8,paddingBottom:i<PROGRAM.length-1?20:0}}>
              <div style={{fontSize:11,color:ev.color,fontFamily:FT,fontWeight:700,marginBottom:3}}>{pr.time}</div>
              <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:2}}>{pr.n}</div>
              <div style={{fontSize:11,color:l3,fontFamily:FT}}>{pr.d}</div>
            </div>
          </div>)}
        </div>}
        {tab==='speakers'&&<div style={{display:'flex',flexDirection:'column',gap:12}}>
          {SPEAKERS.map((sp,i)=><div key={i} style={{borderRadius:18,background:'var(--ef2)',border:'0.5px solid var(--es2)',padding:'14px',display:'flex',gap:12,alignItems:'center'}}>
            <div style={{width:52,height:52,borderRadius:16,background:`${ev.color}15`,border:`0.5px solid ${ev.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{sp.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FT,marginBottom:2}}>{sp.n}</div>
              <div style={{fontSize:12,color:l2,fontFamily:FT,marginBottom:2}}>{sp.role}</div>
              <div style={{fontSize:11,color:l4,fontFamily:FT}}>📍 {sp.from}</div>
            </div>
          </div>)}
        </div>}
      </div>
    </div>
    {/* Buy bar */}
    <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
      <div onClick={()=>push('checkout',{item:{em:ev.em,n:ev.n,p:ev.p},total:ev.p})} className="eth-tap" style={{borderRadius:16,padding:'15px',background:`linear-gradient(90deg,${ev.color},${ev.color}CC)`,textAlign:'center',cursor:'pointer',boxShadow:`0 4px 24px ${ev.color}40`}}>
        <span style={{fontSize:15,fontWeight:700,color:'#fff',fontFamily:FT}}>Купить билет · {ev.p}₽</span>
      </div>
    </div>
  </div>;
}

function OnboardingSC({onDone}){
  const[step,setStep]=useState(0);
  const[interests,setInterests]=useState(new Set());
  const SLIDES=[
    {
      em:'🌍',
      title:'60 народов мира\nпод одной крышей',
      sub:'Этномир — крупнейший этнографический парк России. 400 гектаров живой культуры.',
      grad:'linear-gradient(160deg,#0a1f15,#1B4332,#2D6A4F)',
    },
    {
      em:'🛂',
      title:'Ваш паспорт\nпутешественника',
      sub:'Собирайте визы стран, повышайте уровень гражданства и получайте привилегии.',
      grad:'linear-gradient(160deg,#0a0a2a,#1a1a4a,#2a2a6a)',
    },
    {
      em:'🎓',
      title:'Мастер-классы,\nквесты и СПА',
      sub:'40+ активностей каждый день. Гончарный круг, тайский массаж, охота за кладом.',
      grad:'linear-gradient(160deg,#2a0a00,#5c1a00,#8B2500)',
    },
  ];
  const INTERESTS=[
    {id:'culture',em:'🎭',label:'Культура'},
    {id:'food',em:'🍜',label:'Еда'},
    {id:'spa',em:'💆',label:'СПА'},
    {id:'quests',em:'🧩',label:'Квесты'},
    {id:'nature',em:'🌿',label:'Природа'},
    {id:'kids',em:'👶',label:'Дети'},
    {id:'hotels',em:'🏨',label:'Отели'},
    {id:'photo',em:'📸',label:'Фото'},
  ];
  const isLast=step===SLIDES.length;
  const sl=SLIDES[step]||SLIDES[SLIDES.length-1];
  const toggleInt=(id)=>setInterests(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:isLast?bg:sl.grad,overflow:'hidden',position:'relative'}}>
    {/* Skip */}
    {step<SLIDES.length&&<div onClick={onDone||'#'} style={{position:'absolute',top:56,right:20,zIndex:10,cursor:'pointer'}}>
      <span style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:FT}}>Пропустить</span>
    </div>}
    {!isLast?<div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 40px',textAlign:'center'}}>
      {/* Emoji */}
      <div style={{fontSize:80,marginBottom:32,filter:`drop-shadow(0 8px 32px rgba(0,0,0,.3))`}}>{sl.em}</div>
      {/* Dots */}
      <div style={{display:'flex',gap:8,marginBottom:28}}>
        {SLIDES.map((_,i)=><div key={i} style={{height:4,borderRadius:2,background:i===step?'#fff':'rgba(255,255,255,.25)',width:i===step?24:8,transition:'all .3s ease'}}/>)}
      </div>
      <div style={{fontSize:28,fontWeight:700,color:'#fff',fontFamily:FD,letterSpacing:'-.5px',lineHeight:1.25,marginBottom:14,whiteSpace:'pre-line'}}>{sl.title}</div>
      <div style={{fontSize:15,color:'rgba(255,255,255,.7)',fontFamily:FT,lineHeight:1.65}}>{sl.sub}</div>
    </div>
    :<div style={{flex:1,display:'flex',flexDirection:'column',padding:'60px 24px 20px'}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:40,marginBottom:12}}>✨</div>
        <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px',marginBottom:8}}>Что вас интересует?</div>
        <div style={{fontSize:14,color:l3,fontFamily:FT}}>Персонализируем приложение под вас</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,flex:1}}>
        {INTERESTS.map(int=><div key={int.id} onClick={()=>toggleInt(int.id)} className="eth-tap" style={{
          borderRadius:20,padding:'18px 14px',cursor:'pointer',textAlign:'center',
          background:interests.has(int.id)?blue:'var(--ef2)',
          border:interests.has(int.id)?'none':'0.5px solid var(--es2)',
          transition:'all .2s cubic-bezier(.34,1.3,.64,1)',
          transform:interests.has(int.id)?'scale(1.04)':'scale(1)',
        }}>
          <div style={{fontSize:28,marginBottom:6}}>{int.em}</div>
          <div style={{fontSize:13,fontWeight:600,color:interests.has(int.id)?'#fff':l2,fontFamily:FT}}>{int.label}</div>
        </div>)}
      </div>
    </div>}
    {/* Button */}
    <div style={{padding:'16px 24px 40px'}}>
      <div onClick={()=>{if(step<SLIDES.length)setStep(s=>s+1);else onDone?.();}} className="eth-tap" style={{
        borderRadius:18,padding:'17px',
        background:isLast?blue:'rgba(255,255,255,.15)',
        backdropFilter:isLast?'none':'blur(12px)',
        border:isLast?'none':'0.5px solid rgba(255,255,255,.25)',
        textAlign:'center',cursor:'pointer',
        boxShadow:isLast?`0 8px 32px ${blue}50`:'none',
      }}>
        <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FT}}>
          {step<SLIDES.length-1?'Далее →':step===SLIDES.length-1?'Выбрать интересы →':('Начать'+(interests.size>0?(' ('+interests.size+' выбрано)'):'')+'  →')}
        </span>
      </div>
    </div>
  </div>;
}

function ChatSC({pop}){
  const[msgs,setMsgs]=useState([
    {id:1,from:'bot',text:'Добрый день! Меня зовут Этна — умный помощник Этномира 🌍\nЧем могу помочь?',time:'10:23',avatar:'🤖'},
    {id:2,from:'bot',text:'Вы можете спросить о расписании, бронировании, маршрутах или любом другом вопросе.',time:'10:23',avatar:'🤖'},
  ]);
  const[input,setInput]=useState('');
  const[typing,setTyping]=useState(false);
  const scrollRef=useRef(null);
  const QUICK=['Расписание событий','Как добраться?','Часы работы','Купить билеты','Книга жалоб'];
  const AUTO_REPLIES={
    'расписан':'Ближайшие события: 🎭 Фестиваль Индии сегодня в 18:00, 🎪 Шоу огня завтра в 20:00. Полное расписание в разделе «События».',
    'добрать':'Из Москвы: автобус от м. Молодёжная каждую субботу в 09:00. Или на авто 110 км по Калужскому шоссе. Координаты: 55.009, 36.848',
    'час':'Парк открыт ежедневно с 09:00 до 22:00. Отели работают круглосуточно. СПА: 10:00–21:00.',
    'билет':'Билеты можно купить прямо в приложении в разделе «Билеты» или на кассе. Онлайн выгоднее на 10%!',
    'default':'Спасибо за вопрос! Я передам его нашему специалисту. Обычно отвечаем в течение 5 минут 🕐',
  };
  const sendMsg=()=>{
    if(!input.trim()) return;
    const userMsg={id:Date.now(),from:'user',text:input.trim(),time:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})};
    setMsgs(m=>[...m,userMsg]);
    const q=input.toLowerCase();
    setInput('');
    setTyping(true);
    setTimeout(()=>{
      const reply=Object.entries(AUTO_REPLIES).find(([k])=>q.includes(k))?.[1]||AUTO_REPLIES.default;
      setMsgs(m=>[...m,{id:Date.now()+1,from:'bot',text:reply,time:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}),avatar:'🤖'}]);
      setTyping(false);
    },1200);
  };
  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight;
  },[msgs,typing]);
  return <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
    {/* Header */}
    <div style={{padding:'52px 20px 12px',background:bg,borderBottom:'0.5px solid var(--es2)',flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{width:42,height:42,borderRadius:14,background:'linear-gradient(135deg,#0a1628,#1B4332)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🤖</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FT}}>Этна · Умный помощник</div>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:7,height:7,borderRadius:4,background:green}}/>
            <span style={{fontSize:11,color:green,fontFamily:FT}}>Онлайн</span>
          </div>
        </div>
        <div className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <Ic.phone s={14} c={l2}/>
        </div>
      </div>
    </div>
    {/* Messages */}
    <div ref={scrollRef} style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:12}}>
      {msgs.map(msg=><div key={msg.id} style={{display:'flex',flexDirection:msg.from==='user'?'row-reverse':'row',gap:10,alignItems:'flex-end'}}>
        {msg.from==='bot'&&<div style={{width:32,height:32,borderRadius:10,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{msg.avatar}</div>}
        <div style={{maxWidth:'75%'}}>
          <div style={{background:msg.from==='user'?blue:'var(--ef2)',borderRadius:msg.from==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',padding:'10px 14px',border:msg.from==='user'?'none':'0.5px solid var(--es2)'}}>
            <div style={{fontSize:13,color:msg.from==='user'?'#fff':l1,fontFamily:FT,lineHeight:1.5,whiteSpace:'pre-wrap'}}>{msg.text}</div>
          </div>
          <div style={{fontSize:9,color:l4,fontFamily:FT,marginTop:4,textAlign:msg.from==='user'?'right':'left'}}>{msg.time}</div>
        </div>
      </div>)}
      {typing&&<div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
        <div style={{width:32,height:32,borderRadius:10,background:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
        <div style={{background:'var(--ef2)',borderRadius:'18px 18px 18px 4px',padding:'12px 16px',border:'0.5px solid var(--es2)',display:'flex',gap:4,alignItems:'center'}}>
          {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:3,background:l3,animation:`eth-pulse ${.6+i*.15}s ease infinite`}}/>)}
        </div>
      </div>}
    </div>
    {/* Quick replies */}
    <div style={{padding:'8px 20px 0',display:'flex',gap:7,overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
      {QUICK.map((q,i)=><div key={i} onClick={()=>{setInput(q);}} className="eth-tap" style={{flexShrink:0,borderRadius:16,padding:'6px 12px',background:'var(--ef2)',border:`0.5px solid ${blue}30`,cursor:'pointer'}}>
        <span style={{fontSize:11,color:blue,fontFamily:FT,fontWeight:500}}>{q}</span>
      </div>)}
    </div>
    {/* Input */}
    <div style={{padding:'10px 20px 28px',display:'flex',gap:10,alignItems:'center',borderTop:'0.5px solid var(--es2)',flexShrink:0}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} placeholder="Написать сообщение…" style={{flex:1,borderRadius:20,padding:'11px 16px',background:'var(--ef2)',border:'0.5px solid var(--es2)',fontSize:13,color:l1,fontFamily:FT}}/>
      <div onClick={sendMsg} className="eth-tap" style={{width:42,height:42,borderRadius:21,background:input.trim()?blue:'var(--ef3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
        <span style={{fontSize:16,color:input.trim()?'#fff':l4}}>↑</span>
      </div>
    </div>
  </div>;
}

function CartScreen({push,pop,cart=[],cartCount=0,cartTotal=0,removeFromCart,updateQty}){
  const ref=useRef();const[scrolled,setScrolled]=useState(false);
  const groups={food:cart.filter(x=>x.category==='food'),market:cart.filter(x=>x.category==='market')};
  const hasFood=groups.food.length>0;const hasMarket=groups.market.length>0;
  if(cart.length===0) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Корзина</div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:'40px'}}>
        <div style={{fontSize:72}}>🛒</div>
        <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD}}>Корзина пуста</div>
        <div style={{fontSize:14,color:l3,fontFamily:FT,textAlign:'center',lineHeight:1.6}}>Добавьте блюда из ресторана или товары из магазина</div>
        <div onClick={()=>{pop&&pop();}} className="eth-tap" style={{marginTop:8,borderRadius:16,padding:'12px 28px',background:blue,cursor:'pointer'}}>
          <span style={{fontSize:14,fontWeight:600,color:'#fff',fontFamily:FT}}>В Магазин</span>
        </div>
      </div>
    </div>
  );
  const CartItem=({item})=>(
    <div style={{display:'flex',gap:14,padding:'12px 20px',alignItems:'center',borderBottom:'0.5px solid var(--es2)'}}>
      <div style={{width:52,height:52,borderRadius:16,background:'var(--ef2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{item.emoji}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:l1,fontFamily:FT,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
        <div style={{fontSize:12,color:l3,fontFamily:FT}}>{item.source}</div>
        <div style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FT,marginTop:4}}>{(item.price*item.qty).toLocaleString('ru')}₽</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <div onClick={()=>updateQty(item.id,-1)} className="eth-tap" style={{width:30,height:30,borderRadius:10,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,color:l1}}>−</div>
        <span style={{fontSize:15,fontWeight:700,color:l1,fontFamily:FT,minWidth:20,textAlign:'center'}}>{item.qty}</span>
        <div onClick={()=>updateQty(item.id,1)} className="eth-tap" style={{width:30,height:30,borderRadius:10,background:blue,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,color:'#fff'}}>+</div>
      </div>
    </div>
  );
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Корзина</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT}}>{cartCount} позиции</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',paddingBottom:140}}>
        {hasFood&&<>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'16px 20px 8px'}}>
            <span style={{fontSize:18}}>🍽</span>
            <span style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT}}>Еда и напитки</span>
          </div>
          <div style={{background:'var(--ef2)',borderRadius:18,margin:'0 16px 8px',overflow:'hidden',border:'0.5px solid var(--es2)'}}>
            {groups.food.map(it=><CartItem key={it.id} item={it}/>)}
          </div>
        </>}
        {hasMarket&&<>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'16px 20px 8px'}}>
            <span style={{fontSize:18}}>🛍</span>
            <span style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT}}>Магазин</span>
          </div>
          <div style={{background:'var(--ef2)',borderRadius:18,margin:'0 16px 8px',overflow:'hidden',border:'0.5px solid var(--es2)'}}>
            {groups.market.map(it=><CartItem key={it.id} item={it}/>)}
          </div>
        </>}
        <div style={{margin:'12px 16px',background:'var(--ef2)',borderRadius:18,padding:'16px',border:'0.5px solid var(--es2)'}}>
          <div style={{fontSize:11,fontWeight:600,color:l3,fontFamily:FT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:12}}>Итого</div>
          {cart.map((it,i)=>(
            <div key={it.id} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:13,color:l2,fontFamily:FT}}>{it.name} × {it.qty}</span>
              <span style={{fontSize:13,fontWeight:500,color:l1,fontFamily:FT}}>{(it.price*it.qty).toLocaleString('ru')}₽</span>
            </div>
          ))}
          <div style={{height:'0.5px',background:'var(--es2)',margin:'10px 0'}}/>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:16,fontWeight:700,color:l1,fontFamily:FT}}>К оплате</span>
            <span style={{fontSize:22,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-.5px'}}>{cartTotal.toLocaleString('ru')}₽</span>
          </div>
        </div>
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
        <div onClick={()=>push('delivery',{cart,cartTotal})} className="eth-tap" style={{borderRadius:18,padding:'16px',background:`linear-gradient(135deg,${blue},#5AC8FA)`,textAlign:'center',cursor:'pointer',boxShadow:`0 4px 20px ${blue}40`}}>
          <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FT}}>Оформить заказ — {cartTotal.toLocaleString('ru')}₽</span>
        </div>
      </div>
    </div>
  );
}

function DeliverySC({push,pop,cart=[],cartTotal=0,params={}}){
  const[mode,setMode]=useState(0);
  const[addr,setAddr]=useState(0);
  const[point,setPoint]=useState(0);
  const[slot,setSlot]=useState(0);
  const now=new Date();
  const slots=Array.from({length:8},(_,i)=>{
    const d=new Date(now.getTime()+(30+i*30)*60000);
    return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
  });
  const ADDRESSES=['🏨 Мой номер (Корпус 2, №314)','⛺ Мой глэмпинг (Зона А, №7)','📍 Другой адрес на территории'];
  const POINTS=['🍽 Ресторан Индия (зона питания)','🛍 Маркет ЭтноМира','🎪 Главная касса (вход)'];
  const doNext=()=>{
    const delivery={type:mode===0?'delivery':'pickup',address:mode===0?ADDRESSES[addr]:POINTS[point],slot:slots[slot]};
    push('checkout',{cart,total:cartTotal,delivery,fromCart:true});
  };
  const Seg=({label,active,onPress})=>(
    <div onClick={onPress} className="eth-tap" style={{flex:1,padding:'10px',textAlign:'center',borderRadius:12,background:active?blue:'transparent',cursor:'pointer',transition:'all .2s'}}>
      <span style={{fontSize:14,fontWeight:600,color:active?'#fff':l2,fontFamily:FT}}>{label}</span>
    </div>
  );
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Получение заказа</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT}}>{cartTotal.toLocaleString('ru')}₽ · {cart.length} позиции</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 140px'}}>
        <div style={{display:'flex',gap:4,padding:'4px',background:'var(--ef2)',borderRadius:16,border:'0.5px solid var(--es2)',marginBottom:24}}>
          <Seg label="🛵 Доставка" active={mode===0} onPress={()=>setMode(0)}/>
          <Seg label="🏃 Самовывоз" active={mode===1} onPress={()=>setMode(1)}/>
        </div>
        {mode===0?(
          <>
            <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Куда доставить?</div>
            {ADDRESSES.map((a,i)=>(
              <div key={i} onClick={()=>setAddr(i)} className="eth-tap" style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',marginBottom:8,borderRadius:16,background:'var(--ef2)',border:`1.5px solid ${addr===i?blue:'var(--es2)'}`,cursor:'pointer'}}>
                <div style={{flex:1,fontSize:14,color:l1,fontFamily:FT}}>{a}</div>
                <div style={{width:22,height:22,borderRadius:11,border:`2px solid ${addr===i?blue:'var(--es2)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {addr===i&&<div style={{width:10,height:10,borderRadius:5,background:blue}}/>}
                </div>
              </div>
            ))}
            <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,margin:'20px 0 10px'}}>Время доставки</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {slots.map((s,i)=>(
                <div key={i} onClick={()=>setSlot(i)} className="eth-tap" style={{padding:'10px 18px',borderRadius:12,background:slot===i?blue:'var(--ef2)',border:`1.5px solid ${slot===i?blue:'var(--es2)'}`,cursor:'pointer'}}>
                  <span style={{fontSize:14,fontWeight:600,color:slot===i?'#fff':l1,fontFamily:FT}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,padding:'12px 16px',background:`${blue}10`,borderRadius:12}}>
              <span style={{fontSize:12,color:blue,fontFamily:FT}}>🛵 Ориентировочно 25–35 минут</span>
            </div>
          </>
        ):(
          <>
            <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Точка выдачи</div>
            {POINTS.map((p,i)=>(
              <div key={i} onClick={()=>setPoint(i)} className="eth-tap" style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',marginBottom:8,borderRadius:16,background:'var(--ef2)',border:`1.5px solid ${point===i?green:'var(--es2)'}`,cursor:'pointer'}}>
                <div style={{flex:1,fontSize:14,color:l1,fontFamily:FT}}>{p}</div>
                <div style={{width:22,height:22,borderRadius:11,border:`2px solid ${point===i?green:'var(--es2)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {point===i&&<div style={{width:10,height:10,borderRadius:5,background:green}}/>}
                </div>
              </div>
            ))}
            <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,margin:'20px 0 10px'}}>Время готовности</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {slots.slice(0,6).map((s,i)=>(
                <div key={i} onClick={()=>setSlot(i)} className="eth-tap" style={{padding:'10px 18px',borderRadius:12,background:slot===i?green:'var(--ef2)',border:`1.5px solid ${slot===i?green:'var(--es2)'}`,cursor:'pointer'}}>
                  <span style={{fontSize:14,fontWeight:600,color:slot===i?'#fff':l1,fontFamily:FT}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,padding:'12px 16px',background:`${green}10`,borderRadius:12}}>
              <span style={{fontSize:12,color:green,fontFamily:FT}}>⏱ Заказ готов через ~20 минут</span>
            </div>
          </>
        )}
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
        <div onClick={doNext} className="eth-tap" style={{borderRadius:18,padding:'16px',background:`linear-gradient(135deg,${blue},#5AC8FA)`,textAlign:'center',cursor:'pointer',boxShadow:`0 4px 20px ${blue}40`}}>
          <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FT}}>Перейти к оплате →</span>
        </div>
      </div>
    </div>
  );
}

function OrderTrackingSC({push,pop,params={}}){
  const delivery=params.delivery||{type:'delivery',address:'🏨 Мой номер (Корпус 2, №314)',slot:'14:30'};
  const isDelivery=delivery.type==='delivery';
  const STEPS=[
    {id:0,icon:'✅',label:'Принят',sub:'Заказ принят',color:green},
    {id:1,icon:'👨‍🍳',label:'Готовится',sub:'Повар работает над заказом',color:blue},
    {id:2,icon:'🛵',label:'В пути',sub:isDelivery?'Курьер везёт заказ':'Почти готово',color:'#FF9500'},
    {id:3,icon:'🎉',label:'Доставлен',sub:isDelivery?'Приятного аппетита!':'Можете забирать!',color:green},
  ];
  const[step,setStep]=useState(0);
  const[seconds,setSeconds]=useState(isDelivery?25*60:12*60);
  useEffect(()=>{
    const timers=[setTimeout(()=>setStep(1),3000),setTimeout(()=>setStep(2),8000),setTimeout(()=>setStep(3),14000)];
    return()=>timers.forEach(clearTimeout);
  },[]);
  useEffect(()=>{
    if(step>=3)return;
    const t=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);
    return()=>clearInterval(t);
  },[step]);
  const mins=Math.floor(seconds/60);
  const secs=seconds%60;
  const pct=step>=3?100:Math.round((step/3)*100);
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Статус заказа</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT}}>{delivery.address}</div>
        </div>
        <div style={{padding:'6px 12px',borderRadius:10,background:`${STEPS[step].color}15`}}>
          <span style={{fontSize:11,fontWeight:700,color:STEPS[step].color,fontFamily:FT}}>{STEPS[step].label}</span>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 120px'}}>
        {step<3?(
          <div style={{background:`linear-gradient(135deg,${blue}15,${green}10)`,borderRadius:24,padding:'28px',marginBottom:20,border:`0.5px solid ${blue}20`,textAlign:'center'}}>
            <div style={{fontSize:11,color:l3,fontFamily:FT,letterSpacing:'.5px',marginBottom:8,textTransform:'uppercase',fontWeight:600}}>{isDelivery?'Ожидаемое время':'До готовности'}</div>
            <div style={{fontSize:52,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-2px'}}>
              {mins.toString().padStart(2,'0')}:{secs.toString().padStart(2,'0')}
            </div>
            <div style={{fontSize:13,color:l3,fontFamily:FT,marginTop:4}}>{delivery.slot}</div>
          </div>
        ):(
          <div style={{background:`${green}12`,borderRadius:24,padding:'32px',marginBottom:20,textAlign:'center'}}>
            <div style={{fontSize:56,marginBottom:8}}>🎉</div>
            <div style={{fontSize:22,fontWeight:800,color:l1,fontFamily:FD}}>{isDelivery?'Доставлено!':'Готово к выдаче!'}</div>
            <div style={{fontSize:13,color:l3,fontFamily:FT,marginTop:6}}>{isDelivery?'Приятного аппетита!':'Покажите QR-код'}</div>
          </div>
        )}
        <div style={{background:'var(--ef2)',borderRadius:18,padding:'16px',marginBottom:16,border:'0.5px solid var(--es2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <span style={{fontSize:12,fontWeight:600,color:l1,fontFamily:FT}}>Прогресс</span>
            <span style={{fontSize:12,color:l3,fontFamily:FT}}>{pct}%</span>
          </div>
          <div style={{height:6,background:'var(--ef3)',borderRadius:3,overflow:'hidden',marginBottom:20}}>
            <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${blue},${green})`,borderRadius:3,transition:'width 1.5s cubic-bezier(.34,1.3,.64,1)'}}/>
          </div>
          {STEPS.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:i<STEPS.length-1?16:0}}>
              <div style={{width:40,height:40,borderRadius:14,background:i<=step?`${s.color}15`:'var(--ef3)',border:`1.5px solid ${i<=step?s.color:'var(--es2)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,transition:'all .5s'}}>
                {i<=step?s.icon:<span style={{fontSize:12,color:l4}}>○</span>}
              </div>
              <div style={{flex:1,paddingTop:4}}>
                <div style={{fontSize:14,fontWeight:i<=step?700:500,color:i<=step?l1:l3,fontFamily:FT}}>{s.label}</div>
                {i===step&&<div style={{fontSize:12,color:l3,fontFamily:FT,marginTop:2}}>{s.sub}</div>}
              </div>
              {i===step&&<div style={{width:8,height:8,borderRadius:4,background:s.color,marginTop:8,animation:'eth-pulse 1.5s ease infinite'}}/>}
            </div>
          ))}
        </div>
        {isDelivery&&step>=2&&(
          <div style={{background:'var(--ef2)',borderRadius:18,padding:'14px 16px',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:48,height:48,borderRadius:16,background:`${blue}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🛵</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:l1,fontFamily:FT}}>Алексей</div>
              <div style={{fontSize:12,color:l3,fontFamily:FT}}>Курьер · ★ 4.9</div>
            </div>
            <div className="eth-tap" style={{width:44,height:44,borderRadius:14,background:`${green}15`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:20}}>📞</div>
          </div>
        )}
      </div>
      {step>=3&&(
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
          <div onClick={()=>pop&&pop()} className="eth-tap" style={{borderRadius:18,padding:'16px',background:`linear-gradient(135deg,${green},#27ae60)`,textAlign:'center',cursor:'pointer'}}>
            <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FT}}>Отлично! 👍</span>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderHistorySC({push,pop,orders=[],addToCart}){
  const STATUS_COLOR={tracking:blue,delivered:green,cancelled:red};
  const STATUS_LABEL={tracking:'В пути',delivered:'Доставлен',cancelled:'Отменён'};
  const DEMO=[
    {id:'ETH-29847',createdAt:new Date(Date.now()-2*3600000),items:[{id:'d1',name:'Том Ям',emoji:'🍜',price:490,qty:1,category:'food',source:'Ресторан Тайланд'},{id:'d2',name:'Спринг-роллы',emoji:'🥟',price:320,qty:2,category:'food',source:'Ресторан Тайланд'}],total:1130,delivery:{type:'delivery',address:'⛺ Глэмпинг А-7'},status:'delivered'},
    {id:'ETH-29501',createdAt:new Date(Date.now()-3*24*3600000),items:[{id:'d3',name:'Матрёшка расписная',emoji:'🪆',price:850,qty:1,category:'market',source:'Маркет'},{id:'d4',name:'Чай алтайский',emoji:'🍵',price:290,qty:2,category:'market',source:'Маркет'}],total:1430,delivery:{type:'pickup',address:'Маркет ЭтноМира'},status:'delivered'},
  ];
  const allOrders=[...orders,...DEMO];
  const fmt=(d)=>new Date(d).toLocaleDateString('ru',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Мои заказы</div>
          <div style={{fontSize:12,color:l3,fontFamily:FT}}>{allOrders.length} заказов</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 16px 40px'}}>
        {allOrders.map((order,oi)=>(
          <div key={order.id} style={{background:'var(--ef2)',borderRadius:20,padding:'16px',marginBottom:12,border:'0.5px solid var(--es2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT}}>{order.id}</div>
                <div style={{fontSize:11,color:l3,fontFamily:FT,marginTop:2}}>{fmt(order.createdAt)}</div>
              </div>
              <div style={{padding:'5px 10px',borderRadius:8,background:`${STATUS_COLOR[order.status]||green}15`}}>
                <span style={{fontSize:11,fontWeight:700,color:STATUS_COLOR[order.status]||green,fontFamily:FT}}>{STATUS_LABEL[order.status]||'Доставлен'}</span>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              {order.items.slice(0,3).map((it,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                  <span style={{fontSize:18,flexShrink:0}}>{it.emoji}</span>
                  <span style={{flex:1,fontSize:13,color:l2,fontFamily:FT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.name} ×{it.qty}</span>
                  <span style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT,flexShrink:0}}>{(it.price*it.qty).toLocaleString('ru')}₽</span>
                </div>
              ))}
              {order.items.length>3&&<div style={{fontSize:12,color:l3,fontFamily:FT}}>+ещё {order.items.length-3} позиции</div>}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10,borderTop:'0.5px solid var(--es2)'}}>
              <div>
                <div style={{fontSize:11,color:l3,fontFamily:FT}}>{order.delivery?.type==='delivery'?'🛵 Доставка':'🏃 Самовывоз'}</div>
                <div style={{fontSize:16,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-.3px',marginTop:2}}>{order.total.toLocaleString('ru')}₽</div>
              </div>
              <div onClick={()=>{order.items.forEach(it=>addToCart&&addToCart(it));push('cart');}} className="eth-tap" style={{padding:'9px 18px',borderRadius:12,background:`${blue}15`,cursor:'pointer'}}>
                <span style={{fontSize:13,fontWeight:600,color:blue,fontFamily:FT}}>Повторить →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransferSC({push,pop}){
  const[vehicle,setVehicle]=useState(0);
  const[duration,setDuration]=useState(1);
  const[zone,setZone]=useState(0);
  const[booked,setBooked]=useState(false);
  const[countdown,setCountdown]=useState(null);

  const VEHICLES=[
    {em:'🚗',n:'Электрокар',sub:'4 места · Весь парк',price:400,unit:'час',max:3,color:green,perks:['Вся территория','Детские сиденья','Зарядка на борту']},
    {em:'🚲',n:'Велосипед',sub:'1 место · Дорожки',price:150,unit:'час',max:4,color:blue,perks:['Велодорожки','Шлем включён','Замок в комплекте']},
    {em:'🛴',n:'Самокат',sub:'1 место · Дорожки',price:100,unit:'час',max:4,color:orange,perks:['До 25 км/ч','Зоны парковки','Мобильная зарядка']},
    {em:'🐴',n:'Верховая езда',sub:'С инструктором',price:800,unit:'сеанс',max:1,color:'#8D6E63',perks:['Тренер в комплекте','Шлем и форма','Возраст 6+']},
  ];

  const ZONES=[
    {n:'Весь парк',em:'🗺',sub:'700 га · Все маршруты'},
    {n:'Зона Азии',em:'🏯',sub:'Японский сад, Пагода'},
    {n:'Зона Европы',em:'🏰',sub:'Замки, мельницы'},
    {n:'Зона Африки',em:'🦁',sub:'Саванна, зоопарк'},
  ];

  const v=VEHICLES[vehicle];
  const total=v.price*(v.unit==='сеанс'?1:duration);

  useEffect(()=>{
    if(!booked) return;
    let t=45*60;
    setCountdown(t);
    const iv=setInterval(()=>{setCountdown(s=>{if(s<=1){clearInterval(iv);return 0;}return s-1;});},1000);
    return()=>clearInterval(iv);
  },[booked]);

  const mins=countdown!==null?Math.floor(countdown/60):0;
  const secs=countdown!==null?countdown%60:0;

  if(booked&&countdown!==null) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      <div style={{padding:'52px 20px 12px',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1,fontSize:18,fontWeight:700,color:l1,fontFamily:FD}}>Активная аренда</div>
        <div style={{padding:'5px 10px',borderRadius:8,background:`${green}15`}}>
          <span style={{fontSize:11,fontWeight:700,color:green,fontFamily:FT}}>Активно</span>
        </div>
      </div>
      <div style={{flex:1,padding:'0 20px',display:'flex',flexDirection:'column',gap:16}}>
        <div style={{background:`linear-gradient(135deg,${v.color}20,${v.color}08)`,borderRadius:24,padding:'32px',border:`0.5px solid ${v.color}30`,textAlign:'center'}}>
          <div style={{fontSize:80}}>{v.em}</div>
          <div style={{fontSize:20,fontWeight:700,color:l1,fontFamily:FD,marginTop:12}}>{v.n}</div>
          <div style={{fontSize:13,color:l3,fontFamily:FT,marginTop:4}}>{ZONES[zone].n} · {duration} {v.unit}</div>
        </div>
        <div style={{background:'var(--ef2)',borderRadius:20,padding:'20px',border:'0.5px solid var(--es2)',textAlign:'center'}}>
          <div style={{fontSize:12,color:l3,fontFamily:FT,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:8}}>Оставшееся время</div>
          <div style={{fontSize:56,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-2px'}}>
            {mins.toString().padStart(2,'0')}:{secs.toString().padStart(2,'0')}
          </div>
          <div style={{fontSize:11,color:l4,fontFamily:FT,marginTop:6}}>до конца аренды</div>
        </div>
        <div style={{background:'var(--ef2)',borderRadius:18,padding:'14px 16px',border:'0.5px solid var(--es2)'}}>
          <div style={{fontSize:12,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Правила использования</div>
          {['Скорость не более 20 км/ч','Следуйте разметке дорог','Паркуйте в отведённых зонах','При ДТП звоните: +7 (800) 555-05-05'].map((r,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'flex-start'}}>
              <span style={{fontSize:12,color:v.color,flexShrink:0}}>•</span>
              <span style={{fontSize:12,color:l2,fontFamily:FT,lineHeight:1.4}}>{r}</span>
            </div>
          ))}
        </div>
        <div onClick={()=>{setBooked(false);setCountdown(null);}} className="eth-tap" style={{borderRadius:16,padding:'15px',background:`${red}15`,border:`0.5px solid ${red}30`,textAlign:'center',cursor:'pointer'}}>
          <span style={{fontSize:14,fontWeight:600,color:red,fontFamily:FT}}>Завершить аренду досрочно</span>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:bg}}>
      <div style={{padding:'52px 20px 0',display:'flex',alignItems:'center',gap:12}}>
        {pop&&<div onClick={pop} className="eth-tap" style={{width:34,height:34,borderRadius:17,background:'var(--ef2)',border:'0.5px solid var(--es2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic.chevL s={7} c={l1}/></div>}
        <div style={{flex:1}}>
          <div style={{fontSize:22,fontWeight:700,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>Транспорт</div>
          <div style={{fontSize:12,color:green,fontFamily:FT,marginTop:1}}>● 12 единиц доступно · Экологично</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 140px'}}>
        {/* Vehicle selector */}
        <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Выберите транспорт</div>
        <div style={{display:'flex',gap:10,overflowX:'auto',scrollbarWidth:'none',marginBottom:20,paddingBottom:2}}>
          {VEHICLES.map((veh,i)=>(
            <div key={i} onClick={()=>{setVehicle(i);setDuration(1);}} className="eth-tap" style={{flexShrink:0,width:110,borderRadius:18,background:'var(--ef2)',border:`1.5px solid ${i===vehicle?veh.color:'var(--es2)'}`,padding:'14px 10px',textAlign:'center',cursor:'pointer',transition:'all .2s'}}>
              <div style={{fontSize:32,marginBottom:6}}>{veh.em}</div>
              <div style={{fontSize:12,fontWeight:700,color:l1,fontFamily:FT,marginBottom:2}}>{veh.n}</div>
              <div style={{fontSize:10,color:l3,fontFamily:FT,marginBottom:6}}>{veh.sub}</div>
              <div style={{fontSize:13,fontWeight:700,color:veh.color,fontFamily:FD}}>{veh.price}₽/{veh.unit}</div>
            </div>
          ))}
        </div>

        {/* Perks */}
        <div style={{background:`${v.color}08`,borderRadius:16,padding:'12px 14px',marginBottom:16,border:`0.5px solid ${v.color}20`}}>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {v.perks.map((p,i)=>(
              <div key={i} style={{display:'flex',gap:5,alignItems:'center'}}>
                <span style={{fontSize:12,color:v.color}}>✓</span>
                <span style={{fontSize:11,color:l2,fontFamily:FT}}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone */}
        {vehicle===0&&<>
          <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Зона катания</div>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
            {ZONES.map((z,i)=>(
              <div key={i} onClick={()=>setZone(i)} className="eth-tap" style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:14,background:'var(--ef2)',border:`1.5px solid ${zone===i?v.color:'var(--es2)'}`,cursor:'pointer',alignItems:'center'}}>
                <span style={{fontSize:22}}>{z.em}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:l1,fontFamily:FT}}>{z.n}</div>
                  <div style={{fontSize:11,color:l3,fontFamily:FT}}>{z.sub}</div>
                </div>
                {zone===i&&<div style={{width:8,height:8,borderRadius:4,background:v.color}}/>}
              </div>
            ))}
          </div>
        </>}

        {/* Duration */}
        {v.unit==='час'&&<>
          <div style={{fontSize:13,fontWeight:700,color:l1,fontFamily:FT,marginBottom:10}}>Длительность</div>
          <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
            {Array.from({length:v.max},(_,i)=>i+1).map(h=>(
              <div key={h} onClick={()=>setDuration(h)} className="eth-tap" style={{flex:1,minWidth:60,padding:'12px 8px',borderRadius:12,background:duration===h?v.color:'var(--ef2)',border:`1.5px solid ${duration===h?v.color:'var(--es2)'}`,textAlign:'center',cursor:'pointer'}}>
                <div style={{fontSize:16,fontWeight:700,color:duration===h?'#fff':l1,fontFamily:FD}}>{h}</div>
                <div style={{fontSize:10,color:duration===h?'rgba(255,255,255,.7)':l3,fontFamily:FT}}>ч</div>
                <div style={{fontSize:11,fontWeight:600,color:duration===h?'rgba(255,255,255,.85)':v.color,fontFamily:FT,marginTop:2}}>{(v.price*h).toLocaleString('ru')}₽</div>
              </div>
            ))}
          </div>
        </>}

        {/* Map placeholder */}
        <div style={{borderRadius:18,overflow:'hidden',marginBottom:16,border:'0.5px solid var(--es2)',position:'relative',background:'var(--ef2)'}}>
          <div style={{height:140,background:'linear-gradient(160deg,#0d2010,#0d2818)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,opacity:.4}}>
              {/* Simplified park map SVG */}
              <svg width="100%" height="100%" viewBox="0 0 390 140">
                <rect x="0" y="0" width="390" height="140" fill="none"/>
                {/* Roads */}
                <path d="M 0 70 Q 100 50 200 70 Q 300 90 390 70" stroke={green} strokeWidth="3" fill="none" opacity=".6"/>
                <path d="M 195 0 Q 180 50 195 70 Q 210 90 195 140" stroke={blue} strokeWidth="2" fill="none" opacity=".4"/>
                <path d="M 0 30 Q 80 40 160 30 Q 200 25 240 30 Q 300 35 390 30" stroke={orange} strokeWidth="1.5" fill="none" opacity=".3"/>
                {/* Zones */}
                <circle cx="80" cy="60" r="25" fill={green} opacity=".12"/>
                <circle cx="200" cy="70" r="30" fill={blue} opacity=".12"/>
                <circle cx="320" cy="55" r="22" fill={orange} opacity=".12"/>
                {/* You are here */}
                <circle cx="195" cy="70" r="6" fill={v.color} opacity=".9"/>
                <circle cx="195" cy="70" r="12" fill={v.color} opacity=".2"/>
              </svg>
            </div>
            <div style={{position:'relative',textAlign:'center'}}>
              <div style={{fontSize:28}}>{v.em}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT,marginTop:4}}>Вы здесь · {ZONES[zone].n}</div>
            </div>
          </div>
          <div style={{padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:11,color:l3,fontFamily:FT}}>📍 Точки выдачи: Главный вход, Корпус Б, Зона А</span>
            <div className="eth-tap" style={{padding:'4px 8px',background:`${blue}12`,borderRadius:6,cursor:'pointer'}}>
              <span style={{fontSize:10,color:blue,fontFamily:FT,fontWeight:600}}>Открыть</span>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div style={{display:'flex',gap:10}}>
          {[['🕐','Часы выдачи','9:00–21:00'],['📞','Телефон','+7 (800) 555-05-05'],['⚡','Зарядка','Бесплатно']].map(([em,k,v2],i)=>(
            <div key={i} style={{flex:1,background:'var(--ef2)',borderRadius:14,padding:'10px',textAlign:'center',border:'0.5px solid var(--es2)'}}>
              <div style={{fontSize:18,marginBottom:4}}>{em}</div>
              <div style={{fontSize:9,color:l3,fontFamily:FT,marginBottom:2}}>{k}</div>
              <div style={{fontSize:10,fontWeight:600,color:l1,fontFamily:FT}}>{v2}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 20px 28px',background:'var(--eglass)',backdropFilter:'blur(24px)',borderTop:'0.5px solid var(--es2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontSize:13,color:l3,fontFamily:FT}}>{v.n} · {duration} {v.unit}</span>
          <span style={{fontSize:20,fontWeight:800,color:l1,fontFamily:FD,letterSpacing:'-.4px'}}>{total.toLocaleString('ru')}₽</span>
        </div>
        <div onClick={()=>push('checkout',{item:{n:`${v.n} · ${duration} ${v.unit}`},total,h:{n:`Транспорт · ${v.n}`}})} className="eth-tap" style={{borderRadius:18,padding:'16px',background:`linear-gradient(135deg,${v.color},${v.color}cc)`,textAlign:'center',cursor:'pointer',boxShadow:`0 4px 20px ${v.color}40`}}>
          <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:FT}}>Арендовать {v.em} — {total.toLocaleString('ru')}₽</span>
        </div>
      </div>
    </div>
  );
}

function ScreenRouter({screen,params,push,pop,tab,setTab,dark,setDark,visits,addVisit,levelUpToast,cart,cartCount,cartTotal,addToCart,removeFromCart,updateQty,clearCart,orders,addOrder}){
  const screens={
    cart:          ()=><CartScreen        push={push} pop={pop} cart={cart} cartCount={cartCount} cartTotal={cartTotal} removeFromCart={removeFromCart} updateQty={updateQty}/>,
    delivery:      ()=><DeliverySC        push={push} pop={pop} cart={cart} cartTotal={cartTotal} params={params}/>,
    ordertracking: ()=><OrderTrackingSC   push={push} pop={pop} params={params}/>,
    orderhistory:  ()=><OrderHistorySC    push={push} pop={pop} orders={orders} addToCart={addToCart}/>,
    home:          ()=><HomeScreen       push={push} setMainTab={setTab} orders={orders} cartCount={cartCount}/>,
    park:          ()=><ParkScreen       push={push} pop={pop}/>,
    search:        ()=><SearchScreen     push={push} pop={pop}/>,
    market:        ()=><MarketScreen     push={push} pop={pop} cart={cart} cartCount={cartCount} addToCart={addToCart}/>,
    fav:           ()=><FavScreen        push={push} pop={pop}/>,
    profile:       ()=><ProfileScreen    push={push} pop={pop} visits={visits}/>,
    profileedit:   ()=><ProfileEditSC    pop={pop}/>,
    hotels:        ()=><HotelsScreen     push={push} pop={pop}/>,
    hoteldetail:   ()=><HotelDetailSC    push={push} pop={pop} params={params}/>,
    booking:       ()=><BookingSC        push={push} pop={pop} params={params}/>,
    checkout:      ()=><CheckoutSC       push={push} pop={pop} params={params} clearCart={clearCart} addOrder={addOrder}/>,
    bookings:      ()=><BookingsScreen   push={push} pop={pop}/>,
    events:        ()=><EventsSC         push={push} pop={pop}/>,
    eventdetail:   ()=><EventDetailSC   push={push} pop={pop} params={params}/>,
    food:          ()=><FoodSC           push={push} pop={pop} cart={cart} addToCart={addToCart}/>,
    spa:           ()=><SpaSC            push={push} pop={pop}/>,
    masterclasses: ()=><McSC             push={push} pop={pop}/>,
    glamping:      ()=><GlampingSC       push={push} pop={pop}/>,
    rental:        ()=><RentalSC         push={push} pop={pop}/>,
    kids:          ()=><KidsSC           push={push} pop={pop}/>,
    excursions:    ()=><ExcSC            push={push} pop={pop}/>,
    photo:         ()=><PhotoSC          push={push} pop={pop}/>,
    audiogide:     ()=><AudioSC          push={push} pop={pop}/>,
    audioplayer:   ()=><AudioPlayerSC    push={push} pop={pop} params={params}/>,
    restaurant:    ()=><RestaurantDetailSC push={push} pop={pop} params={params} cart={cart} cartCount={cartCount} cartTotal={cartTotal} addToCart={addToCart}/>,
    product:       ()=><ProductDetailSC  push={push} pop={pop} params={params}/>,
    productdetail: ()=><ProductDetailSC  push={push} pop={pop} params={params}/>,
    loyalty:       ()=><LoyaltyScreen    push={push} pop={pop}/>,
    passport:      ()=><PassportScreen   push={push} pop={pop} visits={visits}/>,
    subs:          ()=><SubsSC           pop={pop}/>,
    certs:         ()=><CertsSC          push={push} pop={pop}/>,
    notify:        ()=><NotifyScreen     pop={pop} push={push}/>,
    settings:      ()=><SettingsScreen   dark={dark} setDark={setDark} pop={pop}/>,
    tickets:       ()=><TicketsScreen    push={push} pop={pop}/>,
    quests:        ()=><QuestsScreen     push={push} pop={pop}/>,
    zoo:           ()=><ZooScreen        push={push} pop={pop}/>,
    museums:       ()=><MuseumsScreen    push={push} pop={pop}/>,
    banya:         ()=><BanyaScreen      push={push} pop={pop}/>,
    exhibitions:   ()=><ExhibitionsScreen pop={pop}/>,
    attractions:   ()=><AttractionsScreen push={push} pop={pop}/>,
    weddings:      ()=><WeddingsScreen   push={push} pop={pop}/>,
    bustours:      ()=><BusToursScreen   push={push} pop={pop}/>,
    business:      ()=><BusinessSC       push={push} pop={pop}/>,
    partnerdash:   ()=><PartnerDashSC    pop={pop}/>,
    affiliate:     ()=><AffiliateSC      pop={pop}/>,
    b2bsubs:       ()=><B2BSubsSC        pop={pop}/>,
    countries:     ()=><CountriesScreen  push={push} pop={pop} visits={visits}/>,
    country:       ()=><CountryScreen    push={push} pop={pop} params={params}/>,
    realestate:    ()=><RealEstateScreen push={push} pop={pop} params={params}/>,
    propertydetail:()=><PropertyDetailScreen push={push} pop={pop} params={params}/>,
    franchise:     ()=><FranchiseScreen  push={push} pop={pop}/>,
    shop:          ()=><ShopScreen        push={push} pop={pop}/>,
    ulicamira:     ()=><UlicaMiraScreen   push={push} pop={pop}/>,
    etnodvory:     ()=><EtnodvoryScreen   push={push} pop={pop}/>,
    animation:     ()=><AnimationScreen   push={push} pop={pop}/>,
    landmarks:     ()=><LandmarksScreen   push={push} pop={pop}/>,
    kidscamp:      ()=><KidsCampScreen    push={push} pop={pop}/>,
    venue:         ()=><VenueScreen       push={push} pop={pop}/>,
    school:        ()=><SchoolScreen      push={push} pop={pop}/>,
    citizenship:   ()=><CitizenshipScreen push={push} pop={pop} visits={visits}/>,
    transfer:      ()=><TransferSC       push={push} pop={pop}/>,
    chat:          ()=><ChatSC           pop={pop}/>,
    onboarding:    ()=><OnboardingSC     push={push} pop={pop}/>,
  };
  const render=screens[screen];
  return render?render():<HomeScreen push={push} setMainTab={setTab}/>;
}

//  ROOT APP — iOS 26 · Citizen Passport State Architecture
function App(){
  const prefersDark=typeof window!=='undefined'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const[dark,setDark]=useState(prefersDark!==false);
  // Fixed height from window — prevents auto-resize iframe from breaking scroll
  const[winH,setWinH]=useState(()=>typeof window!=='undefined'?window.innerHeight:844);
  useEffect(()=>{
    const fn=()=>setWinH(window.innerHeight);
    window.addEventListener('resize',fn);
    return()=>window.removeEventListener('resize',fn);
  },[]);
  const appH=Math.min(winH,844);
  const[tab,setTabRaw]=useState(0);
  const[scrollingDown,setScrollingDown]=useState(false);
  const TAB_SCREENS={0:'home',1:'park',2:'market',3:'countries',4:'passport'};
  const[stacks,setStacks]=useState(
    Object.fromEntries(Object.entries(TAB_SCREENS).map(([k,v])=>[k,[{screen:v,params:{}}]]))
  );

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

  // ── Citizen visit state ──
  const INIT_VISITS={
    india:{stamps:12,visited:true},nepal:{stamps:8,visited:true},
    srilanka:{stamps:15,visited:true},eastasia:{stamps:6,visited:true},
    sea:{stamps:4,visited:false},centralasia:{stamps:3,visited:false},
    siberia:{stamps:9,visited:true},ukraine:{stamps:5,visited:true},
    belarus:{stamps:2,visited:false},
  };
  const[visits,setVisits]=useState(INIT_VISITS);
  const[lvlUpToast,setLvlUpToast]=useState(null);

  // ── Cart state ──
  const[cart,setCart]=useState([]);
  const cartCount=cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const addToCart=(item)=>setCart(prev=>{
    const existing=prev.find(x=>x.id===item.id);
    if(existing) return prev.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x);
    return [...prev,{...item,qty:1}];
  });
  const removeFromCart=(id)=>setCart(prev=>prev.filter(x=>x.id!==id));
  const updateQty=(id,delta)=>setCart(prev=>{
    const next=prev.map(x=>x.id===id?{...x,qty:Math.max(0,x.qty+delta)}:x);
    return next.filter(x=>x.qty>0);
  });
  const clearCart=()=>setCart([]);
  // ── Orders history ──
  const[orders,setOrders]=useState([]);
  const addOrder=(order)=>setOrders(prev=>[{...order,id:'ETH-'+Math.floor(10000+Math.random()*90000),createdAt:new Date()},...prev]);

  const totalStampsNow=Object.values(visits).reduce((s,v)=>s+v.stamps,0);
  const citizenLevelNow=totalStampsNow>=500?4:totalStampsNow>=100?3:totalStampsNow>=5?2:totalStampsNow>=1?1:0;

  const addVisit=(countryId)=>{
    setVisits(v=>{
      const prev=v[countryId]||{stamps:0,visited:false};
      const updated={...v,[countryId]:{stamps:prev.stamps+1,visited:true}};
      const newTotal=Object.values(updated).reduce((s,x)=>s+x.stamps,0);
      const newLvl=newTotal>=500?4:newTotal>=100?3:newTotal>=5?2:newTotal>=1?1:0;
      if(newLvl>citizenLevelNow){
        const lvl=CITIZENSHIP_LEVELS[newLvl];
        setTimeout(()=>setLvlUpToast({emoji:lvl.emoji,title:lvl.title}),400);
        setTimeout(()=>setLvlUpToast(null),3000);
      }
      return updated;
    });
  };

  useEffect(()=>{
    const mq=window.matchMedia?.('(prefers-color-scheme: dark)');
    if(!mq) return;
    const handler=e=>setDark(e.matches);
    mq.addEventListener?.('change',handler);
    return()=>mq.removeEventListener?.('change',handler);
  },[]);

  const tabs=[
    {label:'Главная', Icon:Ic.house},
    {label:'Карта',   Icon:Ic.map},
    {label:'Магазин', Icon:Ic.bag, badge:cartCount},
    {label:'Страны',  Icon:({s,c})=><span style={{fontSize:s*.85,lineHeight:1,color:c}}>🌍</span>},
    {label:'Паспорт', Icon:({s,c})=><span style={{fontSize:s*.85,lineHeight:1,color:c}}>🛂</span>},
  ];

  const isDesktop=typeof window!=='undefined'&&window.innerWidth>600;

  return(
    <div className="eth-root" style={{
      width:'100%',maxWidth:390,height:appH+'px',
      margin:'0 auto',display:'flex',flexDirection:'column',
      background:bg,overflow:'hidden',position:'relative',
      borderRadius:isDesktop?46:0,
      boxShadow:isDesktop?'0 30px 80px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.06)':'none',
    }}>
      <ThemeStyle dark={dark}/>
      <div
        style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}
        key={`${tab}-${curStack.length}`}
        className="eth-fadein"
      >
        <ScreenRouter
          screen={cur.screen}
          params={cur.params}
          push={push}
          pop={curStack.length>1?pop:null}
          tab={tab}
          setTab={setTab}
          dark={dark}
          setDark={setDark}
          visits={visits}
          addVisit={addVisit}
          cart={cart}
          cartCount={cartCount}
          cartTotal={cartTotal}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateQty={updateQty}
          clearCart={clearCart}
          orders={orders}
          addOrder={addOrder}
        />
        {/* ── Level-up toast ── */}
        {lvlUpToast&&<div style={{
          position:'absolute',top:60,left:'50%',transform:'translateX(-50%)',
          zIndex:999,
          background:'linear-gradient(135deg,#1a6b3a,#2ECC71)',
          borderRadius:20,padding:'14px 24px',
          display:'flex',alignItems:'center',gap:12,
          boxShadow:'0 8px 32px rgba(46,204,113,.45)',
          border:'0.5px solid rgba(255,255,255,.25)',
          animation:'eth-spring .4s ease',
          whiteSpace:'nowrap',
        }}>
          <span style={{fontSize:28}}>{lvlUpToast.emoji}</span>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.7)',fontFamily:FT,letterSpacing:.5}}>НОВЫЙ УРОВЕНЬ</div>
            <div style={{fontSize:16,color:'#fff',fontFamily:FT,fontWeight:700}}>{lvlUpToast.title}</div>
          </div>
        </div>}
      </div>
      <FloatingTabBar
        tabs={tabs}
        active={tab}
        setActive={(i)=>{
          setTab(i);
          setStacks(s=>({...s,[i]:[{screen:TAB_SCREENS[i]||'home',params:{}}]}));
        }}
        scrollingDown={scrollingDown}
      />
    </div>
  );
}

export default App;
