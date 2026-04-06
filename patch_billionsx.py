#!/usr/bin/env python3
"""
BillionsX App — Phase 1: Shell + Hero + Cases + Case Detail
Adds self-contained BillionsXApp component to Ethnomir page.tsx
"""
import sys

path = 'apps/web/app/page.tsx'
with open(path, 'r') as f:
    code = f.read()

# ═══════════════════════════════════════════════════════════
# PATCH 1: Add showBillionsX state
# ═══════════════════════════════════════════════════════════
anchor1 = "const [view, setView] = useState('hotels');"
assert anchor1 in code, "PATCH1: anchor not found"
code = code.replace(anchor1, anchor1 + "\n  const [showBillionsX, setShowBillionsX] = useState(false);")

# ═══════════════════════════════════════════════════════════
# PATCH 2: Change first billionsx.com link to open overlay
# ═══════════════════════════════════════════════════════════
old_link = """<span className=\"tap\" onClick={()=>window.open('https://billionsx.com','_blank')} style={{fontSize:11,color:'var(--label4)',cursor:'pointer'}}>Разработчик приложения billionsx.com</span>"""
new_link = """<span className=\"tap\" onClick={()=>setShowBillionsX(true)} style={{fontSize:11,color:'var(--label4)',cursor:'pointer',background:'linear-gradient(135deg,#C8A44E,#F4D675)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:600}}>Разработано в Billions X</span>"""
assert code.count(old_link) == 2, f"PATCH2: expected 2 links, found {code.count(old_link)}"
code = code.replace(old_link, new_link)

# ═══════════════════════════════════════════════════════════
# PATCH 3: Add BillionsXApp overlay render + component
# ═══════════════════════════════════════════════════════════
# Insert the overlay render just before the TabBar
anchor3 = "// ─── TAB BAR ──"
assert anchor3 in code, "PATCH3: TabBar anchor not found"

billionsx_overlay = """
{/* ═══ BILLIONS X APP OVERLAY ═══ */}
{showBillionsX && <BillionsXApp onClose={()=>setShowBillionsX(false)} supabase={supabase} />}
"""

code = code.replace(anchor3, billionsx_overlay + "\n" + anchor3)

# ═══════════════════════════════════════════════════════════
# PATCH 4: Add BillionsXApp component definition
# Insert before the main export/app function
# ═══════════════════════════════════════════════════════════
# Find a good insertion point - before TabBar function
anchor4 = "// ─── TAB BAR ──────────────────────────────────────────────"
assert anchor4 in code, "PATCH4: anchor not found"

bx_component = r'''
// ═══════════════════════════════════════════════════════════════════
// BILLIONS X APP — Self-contained portable module
// Can be used: embedded (Ethnomir), standalone (billionsx.app), native (App Store)
// ═══════════════════════════════════════════════════════════════════
function BillionsXApp({ onClose, supabase, mode = 'embedded' }: { onClose?: () => void; supabase: any; mode?: string }) {
  const [bxScreen, setBxScreen] = useState<string>('hero');
  const [bxCases, setBxCases] = useState<any[]>([]);
  const [bxServices, setBxServices] = useState<any[]>([]);
  const [bxMethodology, setBxMethodology] = useState<any[]>([]);
  const [bxTestimonials, setBxTestimonials] = useState<any[]>([]);
  const [bxLogos, setBxLogos] = useState<any[]>([]);
  const [bxConfig, setBxConfig] = useState<any>({});
  const [bxTiers, setBxTiers] = useState<any[]>([]);
  const [bxCaseDetail, setBxCaseDetail] = useState<any>(null);
  const [bxCaseMetrics, setBxCaseMetrics] = useState<any[]>([]);
  const [bxLoading, setBxLoading] = useState(true);
  const [bxScrollY, setBxScrollY] = useState(0);
  const bxScrollRef = useRef<HTMLDivElement>(null);

  const BX_GOLD = '#C8A44E';
  const BX_GOLD_GRAD = 'linear-gradient(135deg,#C8A44E,#F4D675)';
  const BX_DARK = '#1C1C1E';

  // ─── Data Loading ───
  useEffect(() => {
    (async () => {
      try {
        const [casesR, methR, testR, logosR, tiersR, svcR] = await Promise.all([
          supabase.from('bx_cases').select('*').eq('is_active', true).order('tier').order('sort_order'),
          supabase.from('bx_methodology').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('bx_testimonials').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('bx_client_logos').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('bx_pricing_tiers').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('bx_services').select('*').eq('is_active', true).order('sort_order'),
        ]);
        setBxCases(casesR.data || []);
        setBxMethodology(methR.data || []);
        setBxTestimonials(testR.data || []);
        setBxLogos(logosR.data || []);
        setBxTiers(tiersR.data || []);
        setBxServices(svcR.data || []);
        // Load config
        const cfgR = await supabase.from('bx_config').select('*');
        const cfg: any = {};
        (cfgR.data || []).forEach((r: any) => { cfg[r.key] = r.value; });
        setBxConfig(cfg);
      } catch (e) { console.error('BX load error', e); }
      setBxLoading(false);
    })();
  }, []);

  // ─── Open Case Detail ───
  const openCase = async (slug: string) => {
    const r = await supabase.rpc('bx_get_case_full', { p_slug: slug });
    if (r.data) {
      setBxCaseDetail(r.data);
      setBxScreen('case-detail');
    }
  };

  // ─── Glass Card Style ───
  const glassCard = (extra: any = {}): any => ({
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: 20,
    border: '0.5px solid rgba(255,255,255,0.5)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
    ...extra
  });

  const glassCardDark = (extra: any = {}): any => ({
    background: 'rgba(28,28,30,0.85)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: 20,
    border: '0.5px solid rgba(255,255,255,0.12)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
    ...extra
  });

  // ─── Stats from config ───
  const stats = bxConfig.hero_stats || {};

  // ─── Tier grouping ───
  const tierGroups = useMemo(() => {
    const groups: any = {};
    bxCases.forEach((c: any) => {
      if (!groups[c.tier]) groups[c.tier] = { tier: c.tier, label: c.tier_label_ru || 'Другое', cases: [] };
      groups[c.tier].cases.push(c);
    });
    return Object.values(groups).sort((a: any, b: any) => a.tier - b.tier);
  }, [bxCases]);

  // ─── Navigation Items ───
  const bxNavItems = [
    { id: 'hero', label: 'Главная' },
    { id: 'problem', label: 'Проблема' },
    { id: 'system', label: 'Система' },
    { id: 'cases', label: 'Портфолио' },
    { id: 'fortune-wall', label: 'Клиенты' },
    { id: 'testimonials', label: 'Отзывы' },
    { id: 'investment', label: 'Инвестиции' },
    { id: 'inner-circle', label: 'Заявка' },
    { id: 'about', label: 'О нас' },
  ];

  const navigateTo = (id: string) => {
    setBxScreen(id);
    setBxCaseDetail(null);
    if (bxScrollRef.current) bxScrollRef.current.scrollTop = 0;
  };

  // ═══════════════════════════════════════════════════════
  // SCREEN: HERO
  // ═══════════════════════════════════════════════════════
  const BXHeroScreen = () => (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px 40px',textAlign:'center'}}>
      {/* Logo */}
      <div style={{fontSize:13,fontWeight:700,letterSpacing:6,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Billions X</div>
      <h1 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.15,margin:'0 0 16px',maxWidth:600}}>We Engineer<br/><span style={{background:BX_GOLD_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Billion-Dollar</span><br/>Brands</h1>
      <p style={{fontSize:17,color:'rgba(60,60,67,0.6)',fontFamily:FT,lineHeight:1.5,maxWidth:480,margin:'0 0 32px'}}>Маркетинг богатых и очень богатых. Стратегия, смыслы, упаковка, продвижение, продажи — под ключ.</p>
      
      {/* Stats Grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,width:'100%',maxWidth:360,marginBottom:32}}>
        {[
          { value: stats.total_capitalization || '$80B+', label: 'Капитализация клиентов' },
          { value: stats.countries || '100+', label: 'Стран присутствия' },
          { value: stats.fortune500_clients || '60+', label: 'Брендов Fortune 500' },
          { value: stats.years_experience || '10+', label: 'Лет на рынке' },
        ].map((s, i) => (
          <div key={i} style={glassCard({padding:'16px 12px',textAlign:'center'})}>
            <div style={{fontSize:28,fontWeight:800,fontFamily:FD,background:BX_GOLD_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.value}</div>
            <div style={{fontSize:11,color:'rgba(60,60,67,0.6)',fontFamily:FT,marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
        <button onClick={()=>navigateTo('cases')} style={{padding:'14px 28px',borderRadius:14,background:BX_DARK,color:'#fff',fontSize:15,fontWeight:600,fontFamily:FD,border:'none',cursor:'pointer'}}>Портфолио</button>
        <button onClick={()=>navigateTo('inner-circle')} style={{padding:'14px 28px',borderRadius:14,background:BX_GOLD_GRAD,color:'#fff',fontSize:15,fontWeight:600,fontFamily:FD,border:'none',cursor:'pointer'}}>Обсудить проект</button>
      </div>

      {/* Scroll hint */}
      <div style={{marginTop:48,fontSize:12,color:'rgba(60,60,67,0.4)',fontFamily:FT}}>Листайте вниз</div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: PROBLEM
  // ═══════════════════════════════════════════════════════
  const BXProblemScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Проблема</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:0}}>95% компаний тратят миллионы на маркетинг, который не работает</h2>
      </div>
      {[
        { icon: '🎯', title: 'Красивые сайты без смыслов', desc: 'Дизайн есть, а продукт не продаёт. Клиент смотрит и уходит.' },
        { icon: '📢', title: 'Реклама без стратегии', desc: 'Бюджеты сливаются. Лиды холодные. ROI отрицательный.' },
        { icon: '🧬', title: 'Бренд без ДНК', desc: 'Нет уникальности. Нет «генов победителя». Конкуренция только по цене.' },
        { icon: '📊', title: 'Продажи без системы', desc: 'Менеджеры импровизируют. Нет единой методологии. Сделки теряются.' },
        { icon: '🤖', title: 'Технологии без AI', desc: 'Конкуренты уже используют AI. Вы — нет. Разрыв растёт каждый день.' },
      ].map((item, i) => (
        <div key={i} style={glassCard({padding:'16px 18px',marginBottom:12,display:'flex',gap:14,alignItems:'flex-start'})}>
          <div style={{fontSize:28,lineHeight:1}}>{item.icon}</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000'}}>{item.title}</div>
            <div style={{fontSize:13,color:'rgba(60,60,67,0.6)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{item.desc}</div>
          </div>
        </div>
      ))}
      <div style={{textAlign:'center',marginTop:24}}>
        <button onClick={()=>navigateTo('system')} style={{padding:'14px 28px',borderRadius:14,background:BX_DARK,color:'#fff',fontSize:15,fontWeight:600,fontFamily:FD,border:'none',cursor:'pointer'}}>Как мы это решаем →</button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: THE SYSTEM (pipeline)
  // ═══════════════════════════════════════════════════════
  const BXSystemScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Система</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:'0 0 12px'}}>Один партнёр.<br/>Полный цикл.</h2>
        <p style={{fontSize:15,color:'rgba(60,60,67,0.6)',fontFamily:FT,margin:0,lineHeight:1.5}}>От первой идеи до миллиардного оборота</p>
      </div>
      {/* Pipeline chain */}
      {bxMethodology.map((m: any, i: number) => (
        <div key={m.id} style={{marginBottom:16}}>
          <div style={glassCard({padding:'18px',position:'relative',overflow:'hidden'})}>
            <div style={{position:'absolute',top:0,left:0,width:4,height:'100%',background:m.color_accent || BX_GOLD,borderRadius:'20px 0 0 20px'}} />
            <div style={{display:'flex',alignItems:'center',gap:12,marginLeft:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:m.color_accent || BX_GOLD,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,fontWeight:800,fontFamily:FD}}>{i + 1}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000'}}>{m.label_ru}</span>
                  <span style={{fontSize:11,color:m.color_accent || BX_GOLD,fontWeight:600,fontFamily:FD}}>{m.name}</span>
                </div>
                <div style={{fontSize:13,color:'rgba(60,60,67,0.6)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{m.simple_ru}</div>
              </div>
            </div>
          </div>
          {i < bxMethodology.length - 1 && <div style={{textAlign:'center',color:'rgba(60,60,67,0.2)',fontSize:20,lineHeight:1}}>↓</div>}
        </div>
      ))}
      <div style={{textAlign:'center',marginTop:24}}>
        <button onClick={()=>navigateTo('cases')} style={{padding:'14px 28px',borderRadius:14,background:BX_GOLD_GRAD,color:'#fff',fontSize:15,fontWeight:600,fontFamily:FD,border:'none',cursor:'pointer'}}>Смотреть результаты →</button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: CASES GALLERY (grouped by tier)
  // ═══════════════════════════════════════════════════════
  const BXCasesScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Impact Portfolio</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:0}}>Бренды, которые мы вывели на новый уровень</h2>
      </div>
      {(tierGroups as any[]).map((group: any) => (
        <div key={group.tier} style={{marginBottom:32}}>
          <div style={{fontSize:13,fontWeight:700,color:BX_GOLD,fontFamily:FD,letterSpacing:2,textTransform:'uppercase',marginBottom:12,paddingLeft:4}}>{group.label}</div>
          {group.cases.map((c: any) => (
            <div key={c.slug} className="tap" onClick={()=>openCase(c.slug)} style={glassCard({padding:'18px',marginBottom:12,cursor:'pointer',transition:'transform 0.2s',position:'relative',overflow:'hidden'})}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                {c.client_logo_url && <img src={c.client_logo_url} alt="" style={{width:44,height:44,objectFit:'contain',borderRadius:10,flexShrink:0}} />}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000'}}>{c.client_name}</div>
                  {c.location_country && <div style={{fontSize:11,color:'rgba(60,60,67,0.5)',fontFamily:FT,marginTop:2}}>{c.location_city ? c.location_city + ', ' : ''}{c.location_country}</div>}
                  <div style={{fontSize:12,color:'rgba(60,60,67,0.6)',fontFamily:FT,marginTop:4,lineHeight:1.4}}>{c.tagline_ru}</div>
                </div>
                <div style={{color:'rgba(60,60,67,0.3)',fontSize:18,flexShrink:0}}>›</div>
              </div>
              {c.result_headline_ru && (
                <div style={{marginTop:12,padding:'10px 14px',borderRadius:12,background:'rgba(200,164,78,0.08)',fontSize:12,fontWeight:600,fontFamily:FD,color:BX_GOLD,lineHeight:1.4}}>{c.result_headline_ru}</div>
              )}
              {c.services_provided && c.services_provided.length > 0 && (
                <div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
                  {c.services_provided.map((s: string) => (
                    <span key={s} style={{fontSize:10,fontWeight:600,fontFamily:FD,padding:'3px 8px',borderRadius:6,background:'rgba(0,0,0,0.04)',color:'rgba(60,60,67,0.5)'}}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: CASE DETAIL (universal template)
  // ═══════════════════════════════════════════════════════
  const BXCaseDetailScreen = () => {
    if (!bxCaseDetail) return null;
    const c = bxCaseDetail.case || {};
    const metrics = bxCaseDetail.metrics || [];
    const gallery = bxCaseDetail.gallery || [];
    return (
      <div style={{padding:'0 0 40px'}}>
        {/* Hero */}
        <div style={{padding:'60px 20px 32px',textAlign:'center',background:'linear-gradient(180deg,rgba(200,164,78,0.06) 0%,transparent 100%)'}}>
          {c.client_logo_url && <img src={c.client_logo_url} alt="" style={{height:56,objectFit:'contain',marginBottom:16}} />}
          <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:'0 0 8px'}}>{c.client_name}</h2>
          {c.location_country && <div style={{fontSize:13,color:'rgba(60,60,67,0.5)',fontFamily:FT}}>{c.location_city ? c.location_city + ' • ' : ''}{c.location_country}</div>}
          {c.result_headline_ru && (
            <div style={{marginTop:16,padding:'14px 18px',borderRadius:16,...glassCard(),display:'inline-block'}}>
              <div style={{fontSize:15,fontWeight:700,fontFamily:FD,background:BX_GOLD_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{c.result_headline_ru}</div>
            </div>
          )}
        </div>

        {/* Metrics badges */}
        {metrics.length > 0 && (
          <div style={{padding:'0 20px',marginBottom:24}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {metrics.map((m: any, i: number) => (
                <div key={i} style={glassCard({padding:'12px 14px',display:'flex',gap:10,alignItems:'flex-start'})}>
                  <div style={{fontSize:18}}>{'🏆'}</div>
                  <div style={{fontSize:12,fontWeight:600,fontFamily:FD,color:'#000',lineHeight:1.4}}>{m.value_ru}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content sections */}
        <div style={{padding:'0 20px'}}>
          {c.market_context_ru && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:BX_GOLD,fontFamily:FD,letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>Контекст рынка</div>
              <div style={{fontSize:15,color:'rgba(60,60,67,0.8)',fontFamily:FT,lineHeight:1.6}}>{c.market_context_ru}</div>
            </div>
          )}
          {c.company_context_ru && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:BX_GOLD,fontFamily:FD,letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>О компании</div>
              <div style={{fontSize:15,color:'rgba(60,60,67,0.8)',fontFamily:FT,lineHeight:1.6}}>{c.company_context_ru}</div>
            </div>
          )}
          {c.game_changer_ru && (
            <div style={{marginBottom:20}}>
              <div style={glassCardDark({padding:'20px'})}>
                <div style={{fontSize:13,fontWeight:700,color:BX_GOLD,fontFamily:FD,letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>Billions X Game Changer</div>
                <div style={{fontSize:15,color:'rgba(255,255,255,0.85)',fontFamily:FT,lineHeight:1.6}}>{c.game_changer_ru}</div>
              </div>
            </div>
          )}

          {/* Quote */}
          {c.quote_text && (
            <div style={{marginBottom:20,padding:'20px',borderLeft:`3px solid ${BX_GOLD}`,background:'rgba(200,164,78,0.04)',borderRadius:'0 16px 16px 0'}}>
              <div style={{fontSize:15,fontStyle:'italic',color:'rgba(60,60,67,0.8)',fontFamily:FT,lineHeight:1.6}}>«{c.quote_text}»</div>
              {c.quote_source && (
                <div style={{marginTop:10,display:'flex',alignItems:'center',gap:8}}>
                  {c.quote_source_logo_url && <img src={c.quote_source_logo_url} alt="" style={{height:16,objectFit:'contain'}} />}
                  <span style={{fontSize:12,fontWeight:600,fontFamily:FD,color:'rgba(60,60,67,0.5)'}}>{c.quote_source}</span>
                </div>
              )}
            </div>
          )}

          {/* Services provided */}
          {c.services_provided && c.services_provided.length > 0 && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:BX_GOLD,fontFamily:FD,letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>Оказанные услуги</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {c.services_provided.map((s: string) => (
                  <span key={s} style={{fontSize:13,fontWeight:600,fontFamily:FD,padding:'6px 14px',borderRadius:10,background:'rgba(200,164,78,0.1)',color:BX_GOLD}}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{textAlign:'center',marginTop:32}}>
            <button onClick={()=>navigateTo('inner-circle')} style={{padding:'16px 32px',borderRadius:14,background:BX_GOLD_GRAD,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',width:'100%'}}>Обсудить ваш проект</button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════
  // SCREEN: FORTUNE WALL
  // ═══════════════════════════════════════════════════════
  const BXFortuneWallScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Fortune Wall</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:'0 0 8px'}}>Бренды из Fortune 500</h2>
        <p style={{fontSize:15,color:'rgba(60,60,67,0.5)',fontFamily:FT,margin:0}}>Через MaxboxVR — партнёра Google</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {bxLogos.map((l: any) => (
          <div key={l.id} style={glassCard({padding:'12px 8px',display:'flex',alignItems:'center',justifyContent:'center',aspectRatio:'1',overflow:'hidden'})}>
            <img src={l.logo_url} alt={l.name} style={{width:'80%',height:'60%',objectFit:'contain',opacity:0.7}} />
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: TESTIMONIALS
  // ═══════════════════════════════════════════════════════
  const BXTestimonialsScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Отзывы</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:0}}>Нам доверяют лидеры</h2>
      </div>
      {bxTestimonials.map((t: any) => (
        <div key={t.id} style={glassCard({padding:'18px',marginBottom:14})}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            {t.person_photo_url && <img src={t.person_photo_url} alt="" style={{width:48,height:48,borderRadius:24,objectFit:'cover'}} />}
            <div>
              <div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000'}}>{t.person_name}</div>
              <div style={{fontSize:11,color:'rgba(60,60,67,0.5)',fontFamily:FT,marginTop:2}}>{t.person_title_ru}</div>
            </div>
          </div>
          <div style={{fontSize:14,color:'rgba(60,60,67,0.8)',fontFamily:FT,lineHeight:1.5,fontStyle:'italic'}}>«{t.quote_ru}»</div>
        </div>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: INVESTMENT (tiers + services)
  // ═══════════════════════════════════════════════════════
  const BXInvestmentScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:8}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Инвестиции</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:'0 0 8px'}}>Три уровня входа</h2>
        <p style={{fontSize:14,color:'rgba(60,60,67,0.5)',fontFamily:FT,margin:'0 0 24px',lineHeight:1.5}}>McKinsey берёт $500K за стратегию, но не делает реализацию. Агентство берёт $30K за сайт, но не понимает ваш бизнес. BillionsX — единственная компания, которая делает всё. Под ключ. С AI.</p>
      </div>
      {bxTiers.map((tier: any) => {
        const tierServices = bxServices.filter((s: any) => s.tier_id === tier.id);
        return (
          <div key={tier.id} style={{marginBottom:24}}>
            <div style={glassCardDark({padding:'18px 18px 8px',marginBottom:2,borderRadius:'20px 20px 4px 4px'})}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                <div style={{fontSize:22,fontWeight:800,fontFamily:FD,color:'#fff'}}>{tier.name}</div>
                {tier.price_range_display && <span style={{fontSize:12,fontWeight:600,fontFamily:FD,color:tier.color_accent || BX_GOLD,padding:'3px 10px',borderRadius:8,background:'rgba(255,255,255,0.08)'}}>{tier.price_range_display}</span>}
              </div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontFamily:FT,paddingBottom:10}}>{tier.subtitle_ru}</div>
            </div>
            {tierServices.map((svc: any, si: number) => (
              <div key={svc.id} style={glassCard({padding:'16px 18px',marginBottom:2,borderRadius: si === tierServices.length - 1 ? '4px 4px 20px 20px' : '4px'})}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000'}}>{svc.name_ru}</div>
                    <div style={{fontSize:12,color:'rgba(60,60,67,0.5)',fontFamily:FT,marginTop:3}}>{svc.subtitle_ru}</div>
                  </div>
                  {svc.price_display && <div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:BX_GOLD,flexShrink:0,marginLeft:12}}>{svc.price_display}</div>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{textAlign:'center',marginTop:16}}>
        <button onClick={()=>navigateTo('inner-circle')} style={{padding:'16px 32px',borderRadius:14,background:BX_GOLD_GRAD,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',width:'100%'}}>Подать заявку</button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: INNER CIRCLE (application form)
  // ═══════════════════════════════════════════════════════
  const [bxFormData, setBxFormData] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [bxFormSent, setBxFormSent] = useState(false);
  const BXInnerCircleScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Inner Circle</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:'0 0 8px'}}>Подать заявку</h2>
        <p style={{fontSize:15,color:'rgba(60,60,67,0.5)',fontFamily:FT,margin:0,lineHeight:1.5}}>Мы берём 12 проектов в год.<br/>Мы свяжемся в течение 48 часов.</p>
      </div>
      {bxFormSent ? (
        <div style={glassCard({padding:'32px',textAlign:'center'})}>
          <div style={{fontSize:48,marginBottom:16}}>✓</div>
          <div style={{fontSize:20,fontWeight:700,fontFamily:FD,color:'#000'}}>Заявка отправлена</div>
          <div style={{fontSize:14,color:'rgba(60,60,67,0.5)',fontFamily:FT,marginTop:8}}>Управляющий партнёр свяжется с вами в течение 48 часов</div>
        </div>
      ) : (
        <div>
          {['name','email','phone','company','message'].map((field) => (
            <div key={field} style={{marginBottom:12}}>
              <input
                placeholder={{name:'Ваше имя *',email:'Email',phone:'Телефон',company:'Компания',message:'Расскажите о проекте'}[field]}
                value={(bxFormData as any)[field]}
                onChange={(e)=>setBxFormData({...bxFormData,[field]:e.target.value})}
                style={glassCard({width:'100%',padding:'14px 18px',fontSize:15,fontFamily:FT,color:'#000',border:'0.5px solid rgba(0,0,0,0.08)',outline:'none',boxSizing:'border-box'})}
              />
            </div>
          ))}
          <button onClick={async()=>{
            if(!bxFormData.name.trim())return;
            await supabase.rpc('bx_submit_application',{p_name:bxFormData.name,p_email:bxFormData.email||null,p_phone:bxFormData.phone||null,p_company:bxFormData.company||null,p_message:bxFormData.message||null,p_source:mode==='embedded'?'ethnomir':'web'});
            setBxFormSent(true);
          }} style={{width:'100%',padding:'16px',borderRadius:14,background:BX_GOLD_GRAD,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',marginTop:8}}>Отправить заявку</button>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SCREEN: ABOUT
  // ═══════════════════════════════════════════════════════
  const BXAboutScreen = () => (
    <div style={{padding:'60px 20px 40px'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:13,fontWeight:700,letterSpacing:4,color:BX_GOLD,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>О компании</div>
        <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:0}}>10+ лет инженерии брендов</h2>
      </div>
      <div style={glassCard({padding:'20px',marginBottom:16})}>
        <div style={{fontSize:15,color:'rgba(60,60,67,0.8)',fontFamily:FT,lineHeight:1.7}}>
          Billions X — не агентство и не студия. Это операционная система для премиальных брендов.
          Мы объединяем стратегический консалтинг уровня Big 4, маркетинговую упаковку мирового класса и AI-разработку уровня Big Tech — в одной команде. Без брифов. Без шаблонов. Управляющий партнёр лично вникает в каждый проект.
        </div>
      </div>
      <div style={glassCardDark({padding:'20px',marginBottom:16})}>
        <div style={{fontSize:15,color:'rgba(255,255,255,0.8)',fontFamily:FT,lineHeight:1.7}}>
          Наш маркетинг стоит дорого, но наши клиенты зарабатывают ещё больше. Мы помогаем строить бизнесы, которые оставляют след в истории. Каждая новая работа соответствует высоким стандартам качества и эффективности.
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[
          { v: '$80B+', l: 'Капитализация клиентов' },
          { v: '100+', l: 'Стран' },
          { v: '10+', l: 'Лет опыта' },
          { v: '60+', l: 'Fortune 500 брендов' },
        ].map((s, i) => (
          <div key={i} style={glassCard({padding:'16px',textAlign:'center'})}>
            <div style={{fontSize:24,fontWeight:800,fontFamily:FD,background:BX_GOLD_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div>
            <div style={{fontSize:11,color:'rgba(60,60,67,0.5)',fontFamily:FT,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════
  if (bxLoading) return (
    <div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
      <div style={{fontSize:18,fontWeight:700,fontFamily:FD,background:BX_GOLD_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:4}}>BILLIONS X</div>
      <div style={{fontSize:13,color:'rgba(60,60,67,0.4)',fontFamily:FT,marginTop:8}}>Загрузка...</div>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',flexDirection:'column'}}>
      {/* Header Bar */}
      <div style={{position:'sticky',top:0,zIndex:10,padding:'54px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(242,242,247,0.85)',backdropFilter:'blur(20px) saturate(180%)',WebkitBackdropFilter:'blur(20px) saturate(180%)',borderBottom:'0.5px solid rgba(0,0,0,0.05)'}}>
        {bxScreen === 'case-detail' ? (
          <span className="tap" onClick={()=>{setBxCaseDetail(null);setBxScreen('cases');}} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>← Портфолио</span>
        ) : bxScreen !== 'hero' ? (
          <span className="tap" onClick={()=>navigateTo('hero')} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>← Главная</span>
        ) : <div/>}
        <div style={{fontSize:15,fontWeight:700,fontFamily:FD,background:BX_GOLD_GRAD,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:2}}>BILLIONS X</div>
        {mode === 'embedded' && onClose ? (
          <span className="tap" onClick={onClose} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>Закрыть</span>
        ) : <div style={{width:60}}/>}
      </div>

      {/* Navigation Pills */}
      {bxScreen !== 'case-detail' && (
        <div style={{display:'flex',gap:6,padding:'8px 20px',overflowX:'auto',flexShrink:0}}>
          {bxNavItems.map((item) => (
            <span key={item.id} className="tap" onClick={()=>navigateTo(item.id)} style={{
              padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,fontFamily:FD,whiteSpace:'nowrap',cursor:'pointer',flexShrink:0,
              ...(bxScreen === item.id ? {background:BX_DARK,color:'#fff'} : {background:'rgba(0,0,0,0.04)',color:'rgba(60,60,67,0.6)'})
            }}>{item.label}</span>
          ))}
        </div>
      )}

      {/* Scrollable Content */}
      <div ref={bxScrollRef} style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch'}}>
        {bxScreen === 'hero' && <BXHeroScreen />}
        {bxScreen === 'problem' && <BXProblemScreen />}
        {bxScreen === 'system' && <BXSystemScreen />}
        {bxScreen === 'cases' && <BXCasesScreen />}
        {bxScreen === 'case-detail' && <BXCaseDetailScreen />}
        {bxScreen === 'fortune-wall' && <BXFortuneWallScreen />}
        {bxScreen === 'testimonials' && <BXTestimonialsScreen />}
        {bxScreen === 'investment' && <BXInvestmentScreen />}
        {bxScreen === 'inner-circle' && <BXInnerCircleScreen />}
        {bxScreen === 'about' && <BXAboutScreen />}
      </div>
    </div>
  );
}

'''

code = code.replace(anchor4, bx_component + "\n" + anchor4)

# ═══════════════════════════════════════════════════════════
# VERIFY
# ═══════════════════════════════════════════════════════════
assert 'BillionsXApp' in code, "BillionsXApp component not found"
assert 'showBillionsX' in code, "showBillionsX state not found"
assert code.count('setShowBillionsX(true)') == 2, "Should have 2 links opening BillionsX"
assert 'bx_get_case_full' in code, "RPC call not found"

with open(path, 'w') as f:
    f.write(code)

print("✅ BillionsX App patched successfully")
print(f"   File size: {len(code):,} bytes")
