/**
 * BillionsX Design System — JavaScript Tokens v2.0
 * Apple iOS 26+ Liquid Glass · April 2026
 *
 * Usage in Next.js/React:
 *   import { colors, spacing, radius, shadows, fonts, ease, glass } from './billionsx-tokens';
 *   <div style={{ background: colors.bg, padding: spacing.s4, borderRadius: radius.card }}>
 */

// ─── Colors: System (Light) ───
export const colors = {
  blue:    '#007AFF', green:  '#34C759', indigo: '#5856D6',
  orange:  '#FF9500', pink:   '#FF2D55', purple: '#AF52DE',
  red:     '#FF3B30', teal:   '#5AC8FA', yellow: '#FFCC00',
  mint:    '#00C7BE', cyan:   '#32ADE6', brown:  '#A2845E',

  gray:  '#8E8E93', gray2: '#AEAEB2', gray3: '#C7C7CC',
  gray4: '#D1D1D6', gray5: '#E5E5EA', gray6: '#F2F2F7',

  label:  '#000000',
  label2: 'rgba(60, 60, 67, 0.60)',
  label3: 'rgba(60, 60, 67, 0.30)',
  label4: 'rgba(60, 60, 67, 0.18)',

  fill:  'rgba(120, 120, 128, 0.20)',
  fill2: 'rgba(120, 120, 128, 0.16)',
  fill3: 'rgba(118, 118, 128, 0.12)',
  fill4: 'rgba(116, 116, 128, 0.08)',

  bg:  '#FFFFFF', bg2: '#F2F2F7', bg3: '#FFFFFF',
  bgGroup: '#F2F2F7', bgGroup2: '#FFFFFF', bgGroup3: '#F2F2F7',

  separator:       'rgba(60, 60, 67, 0.29)',
  separatorOpaque: '#C6C6C8',
  link:            '#007AFF',
  placeholder:     'rgba(60, 60, 67, 0.30)',

  // BillionsX
  bxRed:      '#FF3B30',
  bxRedLight: 'rgba(255, 59, 48, 0.12)',
};

// ─── Colors: Dark Mode ───
export const colorsDark = {
  blue:    '#0A84FF', green:  '#30D158', indigo: '#5E5CE6',
  orange:  '#FF9F0A', pink:   '#FF375F', purple: '#BF5AF2',
  red:     '#FF453A', teal:   '#64D2FF', yellow: '#FFD60A',
  mint:    '#63E6E2', cyan:   '#70D7FF', brown:  '#AC8E68',

  gray:  '#8E8E93', gray2: '#636366', gray3: '#48484A',
  gray4: '#3A3A3C', gray5: '#2C2C2E', gray6: '#1C1C1E',

  label:  '#FFFFFF',
  label2: 'rgba(235, 235, 245, 0.60)',
  label3: 'rgba(235, 235, 245, 0.30)',
  label4: 'rgba(235, 235, 245, 0.18)',

  fill:  'rgba(120, 120, 128, 0.36)',
  fill2: 'rgba(120, 120, 128, 0.32)',
  fill3: 'rgba(118, 118, 128, 0.24)',
  fill4: 'rgba(118, 118, 128, 0.18)',

  bg: '#000000', bg2: '#1C1C1E', bg3: '#2C2C2E',
  bgGroup: '#000000', bgGroup2: '#1C1C1E', bgGroup3: '#2C2C2E',

  separator:       'rgba(84, 84, 88, 0.60)',
  separatorOpaque: '#38383A',
  link:            '#0A84FF',
  placeholder:     'rgba(235, 235, 245, 0.30)',

  bxRed: '#FF453A',
};

// ─── Spacing (8pt grid) ───
export const spacing = {
  s0: 0,    s1: 4,   s2: 8,   s3: 12,  s4: 16,
  s5: 20,   s6: 24,  s8: 32,  s10: 40, s12: 48,
  s16: 64,  s20: 80, s24: 96, s32: 128,
};

// ─── Border Radius ───
export const radius = {
  xs: 6,   sm: 8,   md: 12,  lg: 16,
  xl: 20,  xxl: 24, xxxl: 28, xxxxl: 36,
  full: 9999,
  btn: 14, input: 12, card: 20, sheet: 28, tab: 36,
};

// ─── Shadows ───
export const shadows = {
  sh0: 'none',
  sh1: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
  sh2: '0 2px 8px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)',
  sh3: '0 4px 12px rgba(0,0,0,.10), 0 8px 24px rgba(0,0,0,.08)',
  sh4: '0 8px 24px rgba(0,0,0,.12), 0 16px 48px rgba(0,0,0,.10)',
  sh5: '0 16px 48px rgba(0,0,0,.16), 0 32px 80px rgba(0,0,0,.12)',
};

export const shadowsDark = {
  sh1: '0 1px 3px rgba(0,0,0,.20), 0 1px 2px rgba(0,0,0,.15)',
  sh2: '0 2px 8px rgba(0,0,0,.30), 0 4px 16px rgba(0,0,0,.25)',
  sh3: '0 4px 12px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.30)',
  sh4: '0 8px 24px rgba(0,0,0,.40), 0 16px 48px rgba(0,0,0,.35)',
};

// ─── Font Stacks ───
export const fonts = {
  display: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif",
  text:    "-apple-system, 'SF Pro Text', BlinkMacSystemFont, system-ui, sans-serif",
  rounded: "-apple-system, 'SF Pro Rounded', BlinkMacSystemFont, system-ui, sans-serif",
  mono:    "'SF Mono', ui-monospace, 'Menlo', 'Consolas', monospace",
  serif:   "'New York', ui-serif, 'Georgia', serif",
};

// ─── Text Styles (iOS canonical) ───
export const textStyles = {
  largeTitle:  { fontFamily: fonts.display, fontSize: 34, fontWeight: 700, lineHeight: '41px', letterSpacing: 0.37 },
  title1:      { fontFamily: fonts.display, fontSize: 28, fontWeight: 700, lineHeight: '34px', letterSpacing: 0.36 },
  title2:      { fontFamily: fonts.display, fontSize: 22, fontWeight: 700, lineHeight: '28px', letterSpacing: 0.35 },
  title3:      { fontFamily: fonts.display, fontSize: 20, fontWeight: 600, lineHeight: '25px', letterSpacing: 0.38 },
  headline:    { fontFamily: fonts.text,    fontSize: 17, fontWeight: 600, lineHeight: '22px', letterSpacing: -0.43 },
  body:        { fontFamily: fonts.text,    fontSize: 17, fontWeight: 400, lineHeight: '22px', letterSpacing: -0.43 },
  callout:     { fontFamily: fonts.text,    fontSize: 16, fontWeight: 400, lineHeight: '21px', letterSpacing: -0.31 },
  subheadline: { fontFamily: fonts.text,    fontSize: 15, fontWeight: 400, lineHeight: '20px', letterSpacing: -0.23 },
  footnote:    { fontFamily: fonts.text,    fontSize: 13, fontWeight: 400, lineHeight: '18px', letterSpacing: -0.08 },
  caption1:    { fontFamily: fonts.text,    fontSize: 12, fontWeight: 400, lineHeight: '16px', letterSpacing: 0 },
  caption2:    { fontFamily: fonts.text,    fontSize: 11, fontWeight: 400, lineHeight: '13px', letterSpacing: 0.07 },
};

// ─── Easing Curves ───
export const ease = {
  default: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  spring:  'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  enter:   'cubic-bezier(0, 0, 0.2, 1)',
  exit:    'cubic-bezier(0.4, 0, 1, 1)',
  drama:   'cubic-bezier(0.16, 1, 0.3, 1)',
};

// ─── Durations (ms) ───
export const duration = {
  instant: 100, fast: 200, normal: 300,
  slow: 450,    slower: 600,
};

// ─── Glass Styles (apply via spread) ───
export const glass = {
  regular: {
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    background: 'rgba(255, 255, 255, 0.42)',
    border: '0.5px solid rgba(255, 255, 255, 0.30)',
    boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06)',
  },
  clear: {
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    background: 'rgba(255, 255, 255, 0.20)',
  },
  heavy: {
    backdropFilter: 'blur(60px) saturate(200%)',
    WebkitBackdropFilter: 'blur(60px) saturate(200%)',
    background: 'rgba(255, 255, 255, 0.60)',
  },
};

export const glassDark = {
  regular: {
    ...glass.regular,
    background: 'rgba(30, 30, 30, 0.50)',
    border: '0.5px solid rgba(255, 255, 255, 0.12)',
    boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,.15), 0 2px 8px rgba(0,0,0,.25), 0 8px 24px rgba(0,0,0,.20)',
  },
};

// ─── Component Heights (pt) ───
export const heights = {
  statusBar: 54,
  navBar: 44,
  navBarLargeTitle: 96,
  searchBar: 36,
  tabBar: 49,
  tabBarWithHome: 83,
  homeIndicator: 34,
  toolbar: 44,
  keyboard: 325,
  floatingTabBar: 56,
  buttonXL: 50,
  buttonLarge: 44,
  buttonRegular: 34,
  buttonSmall: 28,
  buttonMini: 24,
  textField: 44,
  toggle: 31,
  minTouchTarget: 44,
};

// ─── Breakpoints (px) ───
export const breakpoints = {
  phoneSm: 320,
  phone: 375,
  phoneLg: 430,
  tablet: 744,
  tabletLg: 1024,
  desktop: 1280,
  desktopLg: 1440,
};

// ─── Layout ───
export const layout = {
  marginPhone: 16,
  marginTablet: 24,
  marginDesktop: 40,
  contentMax: 1200,
  contentNarrow: 680,
  safeTop: 59,
  safeBottom: 34,
};

// ─── 4 Pillars (Ethnomir) ───
export const pillars = {
  game:    { accent: colors.orange },
  dash:    { accent: colors.blue },
  money:   { accent: colors.green },
  inspire: { accent: colors.purple },
};
