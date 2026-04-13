/* ═══════════════════════════════════════════════════════════════════════════
   BillionsX Design System — Inline Constants for page.tsx
   v2.0 · Apple iOS 26+ Liquid Glass · April 2026

   USAGE: Вставить этот блок в начало page.tsx (после imports, перед компонентами).
   Затем:  style={{ color: DS.label, padding: DS.s[4], borderRadius: DS.r.card }}
   Glass:  style={{ ...DS.glass.regular, borderRadius: DS.r.card }}
   Text:   style={{ ...DS.text.body }}
   Button: style={{ ...DS.btn.primary }}
   ═══════════════════════════════════════════════════════════════════════════ */

const DS = {
  // ─── System Colors ───
  blue: '#007AFF', green: '#34C759', indigo: '#5856D6',
  orange: '#FF9500', pink: '#FF2D55', purple: '#AF52DE',
  red: '#FF3B30', teal: '#5AC8FA', yellow: '#FFCC00',
  mint: '#00C7BE', cyan: '#32ADE6', brown: '#A2845E',

  // ─── Grays ───
  gray: '#8E8E93', gray2: '#AEAEB2', gray3: '#C7C7CC',
  gray4: '#D1D1D6', gray5: '#E5E5EA', gray6: '#F2F2F7',

  // ─── Semantic Labels ───
  label: '#000000',
  label2: 'rgba(60,60,67,0.60)',
  label3: 'rgba(60,60,67,0.30)',
  label4: 'rgba(60,60,67,0.18)',

  // ─── Fills ───
  fill: 'rgba(120,120,128,0.20)',
  fill2: 'rgba(120,120,128,0.16)',
  fill3: 'rgba(118,118,128,0.12)',
  fill4: 'rgba(116,116,128,0.08)',

  // ─── Backgrounds ───
  bg: '#FFFFFF', bg2: '#F2F2F7', bg3: '#FFFFFF',
  bgGroup: '#F2F2F7', bgGroup2: '#FFFFFF', bgGroup3: '#F2F2F7',

  // ─── Utility Colors ───
  separator: 'rgba(60,60,67,0.29)',
  separatorOpaque: '#C6C6C8',
  link: '#007AFF',
  placeholder: 'rgba(60,60,67,0.30)',

  // ─── BillionsX ───
  bxRed: '#FF3B30',
  bxRedLight: 'rgba(255,59,48,0.12)',

  // ─── Spacing (8pt grid) ── use: DS.s[4] → 16 ───
  s: { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64, 20:80, 24:96, 32:128 },

  // ─── Border Radius ───
  r: {
    xs:6, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:28, xxxxl:36, full:9999,
    btn:14, input:12, card:20, sheet:28, tab:36,
  },

  // ─── Shadows ───
  sh: {
    0: 'none',
    1: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
    2: '0 2px 8px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)',
    3: '0 4px 12px rgba(0,0,0,.10), 0 8px 24px rgba(0,0,0,.08)',
    4: '0 8px 24px rgba(0,0,0,.12), 0 16px 48px rgba(0,0,0,.10)',
    5: '0 16px 48px rgba(0,0,0,.16), 0 32px 80px rgba(0,0,0,.12)',
  },

  // ─── Font Stacks ───
  fontDisplay: "-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif",
  fontText: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",
  fontMono: "'SF Mono',ui-monospace,'Menlo','Consolas',monospace",

  // ─── Text Styles (spread: style={{...DS.text.body}}) ───
  text: {
    largeTitle:  { fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif", fontSize:34, fontWeight:700, lineHeight:'41px', letterSpacing:'0.37px' },
    title1:      { fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif", fontSize:28, fontWeight:700, lineHeight:'34px', letterSpacing:'0.36px' },
    title2:      { fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif", fontSize:22, fontWeight:700, lineHeight:'28px', letterSpacing:'0.35px' },
    title3:      { fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif", fontSize:20, fontWeight:600, lineHeight:'25px', letterSpacing:'0.38px' },
    headline:    { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:17, fontWeight:600, lineHeight:'22px', letterSpacing:'-0.43px' },
    body:        { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:17, fontWeight:400, lineHeight:'22px', letterSpacing:'-0.43px' },
    callout:     { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:16, fontWeight:400, lineHeight:'21px', letterSpacing:'-0.31px' },
    subheadline: { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:15, fontWeight:400, lineHeight:'20px', letterSpacing:'-0.23px' },
    footnote:    { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:13, fontWeight:400, lineHeight:'18px', letterSpacing:'-0.08px' },
    caption1:    { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:12, fontWeight:400, lineHeight:'16px', letterSpacing:'0px' },
    caption2:    { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:11, fontWeight:400, lineHeight:'13px', letterSpacing:'0.07px' },
    // BillionsX hero
    bxTitle:     { fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif", fontSize:'clamp(42px,8vw,72px)', fontWeight:800, lineHeight:1.0, letterSpacing:'-0.009em', color:'#000' },
    bxSubtitle:  { fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif", fontSize:'clamp(20px,3.5vw,28px)', fontWeight:600, lineHeight:1.2, letterSpacing:'-0.012em' },
    bxDesc:      { fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",    fontSize:'clamp(15px,2.2vw,17px)', fontWeight:400, lineHeight:'22px', letterSpacing:'-0.43px', color:'rgba(60,60,67,0.55)' },
  },

  // ─── Glass Styles (spread: style={{...DS.glass.regular, borderRadius: DS.r.card}}) ───
  glass: {
    regular: {
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255,255,255,0.42)',
      border: '0.5px solid rgba(255,255,255,0.30)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06)',
    },
    clear: {
      backdropFilter: 'blur(20px) saturate(150%)',
      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      background: 'rgba(255,255,255,0.20)',
      border: '0.5px solid rgba(255,255,255,0.20)',
    },
    heavy: {
      backdropFilter: 'blur(60px) saturate(200%)',
      WebkitBackdropFilter: 'blur(60px) saturate(200%)',
      background: 'rgba(255,255,255,0.60)',
      border: '0.5px solid rgba(255,255,255,0.35)',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,.50), 0 4px 16px rgba(0,0,0,.10), 0 12px 40px rgba(0,0,0,.08)',
    },
    tabBar: {
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255,255,255,0.42)',
      border: '0.5px solid rgba(255,255,255,0.30)',
      borderRadius: 36,
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,.40), 0 4px 16px rgba(0,0,0,.10), 0 12px 40px rgba(0,0,0,.08)',
    },
    navBar: {
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(255,255,255,0.85)',
      borderBottom: '0.5px solid rgba(60,60,67,0.12)',
    },
  },

  // ─── Button Presets (spread: style={{...DS.btn.primary}}) ───
  btn: {
    _base: {
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      height:50, padding:'0 24px', borderRadius:14, border:'none', cursor:'pointer',
      fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",
      fontSize:17, fontWeight:600, lineHeight:'22px', letterSpacing:'-0.43px',
      WebkitTapHighlightColor:'transparent', userSelect:'none', touchAction:'manipulation',
    },
    get primary() { return { ...this._base, background:'#007AFF', color:'#FFF' }; },
    get secondary() { return { ...this._base, background:'rgba(120,120,128,0.20)', color:'#007AFF' }; },
    get destructive() { return { ...this._base, background:'#FF3B30', color:'#FFF' }; },
    get ghost() { return { ...this._base, background:'transparent', color:'#007AFF' }; },
    get glass() { return { ...this._base, ...DS.glass.regular, color:'#000' }; },
  },

  // ─── Card Presets ───
  card: {
    solid: { background:'#FFFFFF', borderRadius:20, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)' },
    get glass() { return { ...DS.glass.regular, borderRadius:20, padding:16 }; },
    grouped: { background:'#FFFFFF', borderRadius:16, overflow:'hidden' },
  },

  // ─── List Presets ───
  list: {
    section: { background:'#FFFFFF', borderRadius:16, overflow:'hidden' },
    item: { display:'flex', alignItems:'center', padding:'11px 16px', minHeight:44, gap:12 },
    separator: { height:0.5, background:'rgba(60,60,67,0.29)', marginLeft:16 },
  },

  // ─── Input Presets ───
  input: {
    field: {
      width:'100%', height:44, padding:'0 16px',
      fontFamily: "-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",
      fontSize:17, fontWeight:400, letterSpacing:'-0.43px',
      color:'#000', background:'rgba(118,118,128,0.12)',
      border:'none', borderRadius:12, outline:'none',
    },
  },

  // ─── Progress Bar ───
  progress: {
    track: { height:4, borderRadius:2, background:'rgba(118,118,128,0.12)', overflow:'hidden' },
    fill:  { height:4, borderRadius:2, background:'#007AFF', transition:'width 300ms cubic-bezier(0.25,0.1,0.25,1)' },
  },

  // ─── Segmented Control ───
  segment: {
    container: { display:'flex', height:32, borderRadius:8, background:'rgba(118,118,128,0.12)', padding:2, gap:0 },
    item:      { flex:1, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 200ms cubic-bezier(0.25,0.1,0.25,1)' },
    active:    { background:'#FFFFFF', boxShadow:'0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)' },
  },

  // ─── Sheet ───
  sheet: {
    handle: { width:36, height:4, borderRadius:2, background:'rgba(120,120,128,0.16)', margin:'6px auto' },
    container: { borderRadius:'28px 28px 0 0', background:'#FFFFFF', overflow:'hidden' },
  },

  // ─── Empty State ───
  empty: {
    container: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:32, gap:16 },
    icon:      { fontSize:48, color:'rgba(60,60,67,0.30)' },
  },

  // ─── Badge ───
  badge: {
    _base: { display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:20, height:20, padding:'0 6px', borderRadius:9999, fontSize:12, fontWeight:600, lineHeight:'16px', color:'#FFF' },
    get red()    { return { ...this._base, background:'#FF3B30' }; },
    get blue()   { return { ...this._base, background:'#007AFF' }; },
    get green()  { return { ...this._base, background:'#34C759' }; },
    get orange() { return { ...this._base, background:'#FF9500' }; },
    get gray()   { return { ...this._base, background:'#8E8E93' }; },
  },

  // ─── Separator ───
  sep: {
    line:    { height:0.5, background:'rgba(60,60,67,0.29)' },
    inset:   { height:0.5, background:'rgba(60,60,67,0.29)', marginLeft:16 },
    opaque:  { height:0.5, background:'#C6C6C8' },
  },

  // ─── Avatar ───
  avatar: {
    sm:  { width:32, height:32, borderRadius:16, objectFit:'cover' },
    md:  { width:40, height:40, borderRadius:20, objectFit:'cover' },
    lg:  { width:64, height:64, borderRadius:32, objectFit:'cover' },
    xl:  { width:80, height:80, borderRadius:40, objectFit:'cover' },
  },

  // ─── Skeleton Loading ───
  skeleton: {
    base: { background:'rgba(118,118,128,0.12)', borderRadius:12 },
    text: { height:17, borderRadius:4, background:'rgba(118,118,128,0.12)' },
    circle: (size) => ({ width:size, height:size, borderRadius:size/2, background:'rgba(118,118,128,0.12)' }),
    rect: (w,h) => ({ width:w, height:h, borderRadius:12, background:'rgba(118,118,128,0.12)' }),
  },

  // ─── Easing ───
  ease: {
    default: 'cubic-bezier(0.25,0.1,0.25,1)',
    spring: 'cubic-bezier(0.175,0.885,0.32,1.275)',
    enter: 'cubic-bezier(0,0,0.2,1)',
    exit: 'cubic-bezier(0.4,0,1,1)',
    drama: 'cubic-bezier(0.16,1,0.3,1)',
  },

  // ─── Durations (ms) ───
  t: { instant:100, fast:200, normal:300, slow:450, slower:600 },

  // ─── Component Heights ───
  h: {
    statusBar:54, navBar:44, navBarLarge:96, searchBar:36,
    tabBar:49, tabBarHome:83, homeIndicator:34, toolbar:44,
    keyboard:325, floatingTab:56, minTouch:44,
  },

  // ─── Layout ───
  margin: 16,
  contentMax: 1200,
  contentNarrow: 680,
  safeTop: 59,
  safeBottom: 34,

  // ─── Pillar Accents (Ethnomir) ───
  pillar: { game:'#FF9500', dash:'#007AFF', money:'#34C759', inspire:'#AF52DE' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DARK MODE — override only colors, glass, shadows
   Usage: const t = prefersDark ? DS.dark : DS;
          style={{ color: t.label, background: t.bg }}
   
   Spacing, radius, fonts, heights, layout — SAME in both themes.
   ═══════════════════════════════════════════════════════════════════════════ */

DS.dark = {
  // System Colors (brighter in dark)
  blue:'#0A84FF', green:'#30D158', indigo:'#5E5CE6',
  orange:'#FF9F0A', pink:'#FF375F', purple:'#BF5AF2',
  red:'#FF453A', teal:'#64D2FF', yellow:'#FFD60A',
  mint:'#63E6E2', cyan:'#70D7FF', brown:'#AC8E68',

  // Grays (inverted direction)
  gray:'#8E8E93', gray2:'#636366', gray3:'#48484A',
  gray4:'#3A3A3C', gray5:'#2C2C2E', gray6:'#1C1C1E',

  // Labels
  label:'#FFFFFF',
  label2:'rgba(235,235,245,0.60)',
  label3:'rgba(235,235,245,0.30)',
  label4:'rgba(235,235,245,0.18)',

  // Fills
  fill:'rgba(120,120,128,0.36)',
  fill2:'rgba(120,120,128,0.32)',
  fill3:'rgba(118,118,128,0.24)',
  fill4:'rgba(118,118,128,0.18)',

  // Backgrounds (dark elevation)
  bg:'#000000', bg2:'#1C1C1E', bg3:'#2C2C2E',
  bgGroup:'#000000', bgGroup2:'#1C1C1E', bgGroup3:'#2C2C2E',

  // Utility
  separator:'rgba(84,84,88,0.60)',
  separatorOpaque:'#38383A',
  link:'#0A84FF',
  placeholder:'rgba(235,235,245,0.30)',

  bxRed:'#FF453A',
  bxRedLight:'rgba(255,69,58,0.15)',
};

// Dark glass
DS.dark.glass = {
  regular: {
    backdropFilter:'blur(40px) saturate(180%)',
    WebkitBackdropFilter:'blur(40px) saturate(180%)',
    background:'rgba(30,30,30,0.50)',
    border:'0.5px solid rgba(255,255,255,0.12)',
    boxShadow:'inset 0 0.5px 0 rgba(255,255,255,.15), 0 2px 8px rgba(0,0,0,.25), 0 8px 24px rgba(0,0,0,.20)',
  },
  clear: {
    backdropFilter:'blur(20px) saturate(150%)',
    WebkitBackdropFilter:'blur(20px) saturate(150%)',
    background:'rgba(30,30,30,0.25)',
    border:'0.5px solid rgba(255,255,255,0.08)',
  },
  heavy: {
    backdropFilter:'blur(60px) saturate(200%)',
    WebkitBackdropFilter:'blur(60px) saturate(200%)',
    background:'rgba(30,30,30,0.70)',
    border:'0.5px solid rgba(255,255,255,0.15)',
  },
};

// Dark shadows
DS.dark.sh = {
  0:'none',
  1:'0 1px 3px rgba(0,0,0,.20), 0 1px 2px rgba(0,0,0,.15)',
  2:'0 2px 8px rgba(0,0,0,.30), 0 4px 16px rgba(0,0,0,.25)',
  3:'0 4px 12px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.30)',
  4:'0 8px 24px rgba(0,0,0,.40), 0 16px 48px rgba(0,0,0,.35)',
};

/* ═══════════════════════════════════════════════════════════════════════════
   THEME HELPER — for components that need dynamic theme
   Usage:
     const prefersDark = typeof window!=='undefined' 
       && window.matchMedia('(prefers-color-scheme:dark)').matches;
     const t = prefersDark ? DS.dark : DS;
     <div style={{ color: t.label, background: t.bg }}>
     <div style={{ ...(prefersDark ? DS.dark.glass.regular : DS.glass.regular) }}>
   ═══════════════════════════════════════════════════════════════════════════ */
