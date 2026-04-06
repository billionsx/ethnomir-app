#!/usr/bin/env python3
"""Replace BillionsXApp with premium dark-theme luxury version"""
path = 'apps/web/app/page.tsx'
with open(path,'r') as f: code = f.read()

# Find the exact boundaries
start_marker = "function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {"
end_marker = "\n\n\n// ─── TAB BAR ──"

start_idx = code.index(start_marker)
end_idx = code.index(end_marker, start_idx)
# We want to replace from start_marker to the closing } before end_marker
# Find the last } before end_marker
old_component = code[start_idx:end_idx+1]  # +1 to include the newline
print(f"Old component: {len(old_component)} chars, lines ~{old_component.count(chr(10))}")

new_component = r'''function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {
  const [bxScreen, setBxScreen] = useState<string>('hero');
  const [bxCases, setBxCases] = useState<any[]>([]);
  const [bxServices, setBxServices] = useState<any[]>([]);
  const [bxMethodology, setBxMethodology] = useState<any[]>([]);
  const [bxTestimonials, setBxTestimonials] = useState<any[]>([]);
  const [bxLogos, setBxLogos] = useState<any[]>([]);
  const [bxConfig, setBxConfig] = useState<any>({});
  const [bxTiers, setBxTiers] = useState<any[]>([]);
  const [bxCaseDetail, setBxCaseDetail] = useState<any>(null);
  const [bxLoading, setBxLoading] = useState(true);
  const [bxFormData, setBxFormData] = useState({name:'',email:'',phone:'',company:'',message:''});
  const [bxFormSent, setBxFormSent] = useState(false);
  const bxScrollRef = useRef<HTMLDivElement>(null);

  const G = '#C8A44E';
  const GG = 'linear-gradient(135deg,#C8A44E,#F4D675)';
  const DB = '#0A0A0A';
  const D2 = '#141414';
  const D3 = '#1C1C1E';
  const DT = 'rgba(255,255,255,0.92)';
  const DT2 = 'rgba(255,255,255,0.5)';
  const DT3 = 'rgba(255,255,255,0.25)';

  // Supabase client
  const supabase = useMemo(()=>{
    const hdrs:any = {'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};
    const from = (table:string) => {
      let q:any = {_table:table,_filters:[],_order:[],_select:'*'};
      const chain:any = {
        select:(cols:string='*')=>{q._select=cols;return chain;},
        eq:(col:string,val:any)=>{q._filters.push(col+'=eq.'+val);return chain;},
        order:(col:string)=>{q._order.push(col+'.asc');return chain;},
        then:async(resolve:any)=>{try{let url=SB_URL+'/rest/v1/'+q._table+'?select='+q._select;q._filters.forEach((f:string)=>url+='&'+f);if(q._order.length)url+='&order='+q._order.join(',');const r=await fetch(url,{headers:hdrs});const data=await r.json();resolve({data,error:null});}catch(e){resolve({data:null,error:e});}}
      };return chain;
    };
    const rpc=async(fn:string,params:any)=>{try{const r=await fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:hdrs,body:JSON.stringify(params)});return{data:await r.json(),error:null};}catch(e){return{data:null,error:e};}};
    return{from,rpc};
  },[]);

  useEffect(()=>{(async()=>{try{const[c,m,t,l,ti,s]=await Promise.all([supabase.from('bx_cases').select('*').eq('is_active',true).order('tier').order('sort_order'),supabase.from('bx_methodology').select('*').eq('is_active',true).order('sort_order'),supabase.from('bx_testimonials').select('*').eq('is_active',true).order('sort_order'),supabase.from('bx_client_logos').select('*').eq('is_active',true).order('sort_order'),supabase.from('bx_pricing_tiers').select('*').eq('is_active',true).order('sort_order'),supabase.from('bx_services').select('*').eq('is_active',true).order('sort_order')]);setBxCases(c.data||[]);setBxMethodology(m.data||[]);setBxTestimonials(t.data||[]);setBxLogos(l.data||[]);setBxTiers(ti.data||[]);setBxServices(s.data||[]);const cfgR=await supabase.from('bx_config').select('*');const cfg:any={};(cfgR.data||[]).forEach((r:any)=>{cfg[r.key]=r.value;});setBxConfig(cfg);}catch(e){console.error('BX',e);}setBxLoading(false);})();},[]);

  const openCase=async(slug:string)=>{const r=await supabase.rpc('bx_get_case_full',{p_slug:slug});if(r.data){setBxCaseDetail(r.data);setBxScreen('case-detail');if(bxScrollRef.current)bxScrollRef.current.scrollTop=0;}};
  const nav=(id:string)=>{setBxScreen(id);setBxCaseDetail(null);if(bxScrollRef.current)bxScrollRef.current.scrollTop=0;};

  const stats=bxConfig.hero_stats||{};
  const tierGroups=useMemo(()=>{const g:any={};bxCases.forEach((c:any)=>{if(!g[c.tier])g[c.tier]={tier:c.tier,label:c.tier_label_ru||'',cases:[]};g[c.tier].cases.push(c);});return Object.values(g).sort((a:any,b:any)=>a.tier-b.tier);},[bxCases]);

  const gc=(x:any={}):any=>({background:'rgba(255,255,255,0.04)',borderRadius:16,border:'1px solid rgba(255,255,255,0.06)',padding:'20px',...x});
  const navItems=[{id:'hero',l:'Главная'},{id:'problem',l:'Проблема'},{id:'system',l:'Система'},{id:'cases',l:'Портфолио'},{id:'fortune-wall',l:'Клиенты'},{id:'testimonials',l:'Отзывы'},{id:'investment',l:'Инвестиции'},{id:'inner-circle',l:'Заявка'},{id:'about',l:'О нас'}];

  // ── CSS ──
  const bxCSS = `
    @keyframes bxFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes bxGlow{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.1)}}
    @keyframes bxPulse{0%,100%{box-shadow:0 0 40px rgba(200,164,78,0.15)}50%{box-shadow:0 0 80px rgba(200,164,78,0.3)}}
    .bx-fade{animation:bxFadeIn .6s ease both}
    .bx-fade-1{animation-delay:.1s}.bx-fade-2{animation-delay:.2s}.bx-fade-3{animation-delay:.3s}.bx-fade-4{animation-delay:.4s}
    .bx-card{transition:all .3s ease}.bx-card:active{transform:scale(.98);opacity:.9}
    .bx-glow{animation:bxPulse 3s ease infinite}
    .bx-pill{transition:all .2s ease}
    .bx-pill:active{transform:scale(.95)}
    .bx-input{background:rgba(255,255,255,0.06)!important;border:1px solid rgba(255,255,255,0.08)!important;color:#fff!important;border-radius:12px!important;padding:16px!important;font-size:15px!important;font-family:${FT}!important;outline:none!important;width:100%!important;box-sizing:border-box!important}
    .bx-input::placeholder{color:rgba(255,255,255,0.3)!important}
    .bx-input:focus{border-color:rgba(200,164,78,0.4)!important}
  `;

  // ── SCREENS ──
  const Hero=()=>(
    <div className="bx-fade" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'100px 24px 60px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(200,164,78,0.12) 0%,transparent 70%)',filter:'blur(60px)',animation:'bxGlow 6s ease infinite',pointerEvents:'none'}}/>
      <div className="bx-fade" style={{fontSize:12,fontWeight:600,letterSpacing:6,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:20}}>Billions X</div>
      <h1 className="bx-fade bx-fade-1" style={{fontSize:48,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.1,margin:'0 0 24px',maxWidth:600}}>We Engineer<br/><span style={{background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Billion-Dollar</span><br/>Brands</h1>
      <p className="bx-fade bx-fade-2" style={{fontSize:17,color:DT2,fontFamily:FT,lineHeight:1.6,maxWidth:440,margin:'0 0 40px'}}>Стратегия, смыслы, упаковка, продвижение, продажи — под ключ. Маркетинг богатых и очень богатых.</p>
      <div className="bx-fade bx-fade-3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,width:'100%',maxWidth:340,marginBottom:40}}>
        {[{v:stats.total_capitalization||'$80B+',l:'Капитализация клиентов'},{v:stats.countries||'100+',l:'Стран присутствия'},{v:stats.fortune500_clients||'60+',l:'Fortune 500'},{v:stats.years_experience||'10+',l:'Лет на рынке'}].map((s,i)=>(
          <div key={i} style={gc({textAlign:'center',padding:'18px 12px'})}>
            <div style={{fontSize:26,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div>
            <div style={{fontSize:10,color:DT3,fontFamily:FT,marginTop:6,letterSpacing:0.5}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bx-fade bx-fade-4" style={{display:'flex',gap:12}}>
        <button onClick={()=>nav('cases')} className="bx-pill bx-glow" style={{padding:'14px 32px',borderRadius:50,background:GG,color:'#000',fontSize:14,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',letterSpacing:0.5}}>Портфолио</button>
        <button onClick={()=>nav('inner-circle')} className="bx-pill" style={{padding:'14px 32px',borderRadius:50,background:'transparent',color:DT,fontSize:14,fontWeight:600,fontFamily:FD,border:`1px solid ${DT3}`,cursor:'pointer'}}>Обсудить проект</button>
      </div>
    </div>
  );

  const Problem=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>Проблема</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:0}}>95% компаний тратят миллионы на маркетинг, который не&nbsp;работает</h2>
      </div>
      {[{t:'Красивые сайты без смыслов',d:'Дизайн есть, а продукт не продаёт. Клиент смотрит и уходит.'},{t:'Реклама без стратегии',d:'Бюджеты сливаются. Лиды холодные. ROI отрицательный.'},{t:'Бренд без ДНК',d:'Нет уникальности. Нет «генов победителя». Конкуренция только по цене.'},{t:'Продажи без системы',d:'Менеджеры импровизируют. Нет единой методологии. Сделки теряются.'},{t:'Технологии без AI',d:'Конкуренты уже используют AI. Вы — нет. Разрыв растёт каждый день.'}].map((item,i)=>(
        <div key={i} className="bx-fade bx-card" style={{...gc({marginBottom:10,display:'flex',gap:16,alignItems:'flex-start'}),animationDelay:i*0.08+'s'}}>
          <div style={{width:4,minHeight:40,borderRadius:2,background:G,flexShrink:0,marginTop:2,opacity:0.6}}/>
          <div><div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:DT}}>{item.t}</div><div style={{fontSize:13,color:DT2,fontFamily:FT,marginTop:4,lineHeight:1.5}}>{item.d}</div></div>
        </div>
      ))}
      <div style={{textAlign:'center',marginTop:32}}><button onClick={()=>nav('system')} className="bx-pill" style={{padding:'14px 32px',borderRadius:50,background:GG,color:'#000',fontSize:14,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer'}}>Как мы это решаем</button></div>
    </div>
  );

  const System=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>Система</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.15,margin:'0 0 12px'}}>Один партнёр.<br/>Полный цикл.</h2>
        <p style={{fontSize:15,color:DT2,fontFamily:FT,margin:0}}>От первой идеи до миллиардного оборота</p>
      </div>
      {bxMethodology.map((m:any,i:number)=>(
        <div key={m.id} className="bx-fade" style={{animationDelay:i*0.06+'s'}}>
          <div className="bx-card" style={gc({marginBottom:2,position:'relative',overflow:'hidden'})}>
            <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:m.color_accent||G,borderRadius:2}}/>
            <div style={{display:'flex',alignItems:'center',gap:14,marginLeft:12}}>
              <div style={{width:32,height:32,borderRadius:10,background:m.color_accent||G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:800,fontFamily:FD,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:15,fontWeight:700,fontFamily:FD,color:DT}}>{m.label_ru}</span><span style={{fontSize:10,color:m.color_accent||G,fontWeight:600,fontFamily:FD,opacity:0.7}}>{m.name}</span></div>
                <div style={{fontSize:13,color:DT2,fontFamily:FT,marginTop:4,lineHeight:1.5}}>{m.simple_ru}</div>
              </div>
            </div>
          </div>
          {i<bxMethodology.length-1&&<div style={{textAlign:'center',color:DT3,fontSize:16,lineHeight:'20px',opacity:0.3}}>↓</div>}
        </div>
      ))}
      <div style={{textAlign:'center',marginTop:32}}><button onClick={()=>nav('cases')} className="bx-pill" style={{padding:'14px 32px',borderRadius:50,background:GG,color:'#000',fontSize:14,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer'}}>Смотреть результаты</button></div>
    </div>
  );

  const Cases=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>Impact Portfolio</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:0}}>Бренды, которые мы вывели на&nbsp;новый уровень</h2>
      </div>
      {(tierGroups as any[]).map((group:any)=>(
        <div key={group.tier} style={{marginBottom:36}}>
          <div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:14,opacity:0.8}}>{group.label}</div>
          {group.cases.map((c:any)=>(
            <div key={c.slug} className="bx-card" onClick={()=>openCase(c.slug)} style={{...gc({marginBottom:10,cursor:'pointer',position:'relative',overflow:'hidden'})}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                {c.client_logo_url&&<div style={{width:44,height:44,borderRadius:10,background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><img src={c.client_logo_url} alt="" style={{width:32,height:32,objectFit:'contain',filter:'brightness(0) invert(1)',opacity:0.7}}/></div>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:DT}}>{c.client_name}</div>
                  {c.location_country&&<div style={{fontSize:11,color:DT3,fontFamily:FT,marginTop:2}}>{c.location_city?c.location_city+', ':''}{c.location_country}</div>}
                </div>
                <div style={{color:DT3,fontSize:18,flexShrink:0}}>›</div>
              </div>
              {c.result_headline_ru&&<div style={{marginTop:12,padding:'10px 14px',borderRadius:10,background:'rgba(200,164,78,0.06)',border:'1px solid rgba(200,164,78,0.1)',fontSize:12,fontWeight:600,fontFamily:FD,color:G,lineHeight:1.4}}>{c.result_headline_ru}</div>}
              {c.services_provided&&c.services_provided.length>0&&<div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>{c.services_provided.map((s:string)=>(<span key={s} style={{fontSize:9,fontWeight:600,fontFamily:FD,padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,0.04)',color:DT3,letterSpacing:0.5}}>{s}</span>))}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const CaseDetail=()=>{
    if(!bxCaseDetail)return null;
    const c=bxCaseDetail.case||{};const metrics=bxCaseDetail.metrics||[];
    return(
      <div className="bx-fade" style={{padding:'0 0 60px'}}>
        <div style={{padding:'80px 24px 32px',textAlign:'center',background:'linear-gradient(180deg,rgba(200,164,78,0.04) 0%,transparent 100%)'}}>
          {c.client_logo_url&&<img src={c.client_logo_url} alt="" style={{height:48,objectFit:'contain',marginBottom:16,filter:'brightness(0) invert(1)',opacity:0.8}}/>}
          <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:'0 0 8px'}}>{c.client_name}</h2>
          {c.location_country&&<div style={{fontSize:13,color:DT3,fontFamily:FT}}>{c.location_city?c.location_city+' · ':''}{c.location_country}</div>}
          {c.result_headline_ru&&<div style={{marginTop:20,padding:'14px 20px',borderRadius:14,background:'rgba(200,164,78,0.06)',border:'1px solid rgba(200,164,78,0.12)',display:'inline-block'}}><div style={{fontSize:15,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{c.result_headline_ru}</div></div>}
        </div>
        {metrics.length>0&&<div style={{padding:'0 24px',marginBottom:24}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{metrics.map((m:any,i:number)=>(<div key={i} style={gc({display:'flex',gap:10,alignItems:'flex-start',padding:'14px'})}><div style={{color:G,fontSize:14,flexShrink:0}}>✦</div><div style={{fontSize:12,fontWeight:600,fontFamily:FD,color:DT2,lineHeight:1.4}}>{m.value_ru}</div></div>))}</div></div>}
        <div style={{padding:'0 24px'}}>
          {c.market_context_ru&&<div style={{marginBottom:24}}><div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>Контекст рынка</div><div style={{fontSize:15,color:DT2,fontFamily:FT,lineHeight:1.7}}>{c.market_context_ru}</div></div>}
          {c.company_context_ru&&<div style={{marginBottom:24}}><div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>О компании</div><div style={{fontSize:15,color:DT2,fontFamily:FT,lineHeight:1.7}}>{c.company_context_ru}</div></div>}
          {c.game_changer_ru&&<div style={{marginBottom:24,padding:'24px',borderRadius:16,background:'rgba(200,164,78,0.04)',border:'1px solid rgba(200,164,78,0.1)'}}><div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:12}}>✦ Billions X Game Changer</div><div style={{fontSize:15,color:DT,fontFamily:FT,lineHeight:1.7}}>{c.game_changer_ru}</div></div>}
          {c.quote_text&&<div style={{marginBottom:24,padding:'24px',borderLeft:`2px solid ${G}`,background:'rgba(200,164,78,0.02)'}}><div style={{fontSize:15,fontStyle:'italic',color:DT2,fontFamily:FT,lineHeight:1.7}}>«{c.quote_text}»</div>{c.quote_source&&<div style={{marginTop:12,display:'flex',alignItems:'center',gap:8}}>{c.quote_source_logo_url&&<img src={c.quote_source_logo_url} alt="" style={{height:14,objectFit:'contain',filter:'brightness(0) invert(1)',opacity:0.5}}/>}<span style={{fontSize:12,fontWeight:600,fontFamily:FD,color:DT3}}>{c.quote_source}</span></div>}</div>}
          {c.services_provided&&c.services_provided.length>0&&<div style={{marginBottom:24}}><div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:12}}>Оказанные услуги</div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{c.services_provided.map((s:string)=>(<span key={s} style={{fontSize:12,fontWeight:600,fontFamily:FD,padding:'6px 16px',borderRadius:50,background:'rgba(200,164,78,0.08)',border:'1px solid rgba(200,164,78,0.15)',color:G}}>{s}</span>))}</div></div>}
          <button onClick={()=>nav('inner-circle')} className="bx-pill bx-glow" style={{width:'100%',padding:'16px',borderRadius:50,background:GG,color:'#000',fontSize:15,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',marginTop:16}}>Обсудить ваш проект</button>
        </div>
      </div>
    );
  };

  const FortuneWall=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>Fortune Wall</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:0}}>Бренды из Fortune&nbsp;500</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:2}}>
        {bxLogos.map((l:any)=>(<div key={l.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'16px 8px',display:'flex',alignItems:'center',justifyContent:'center',aspectRatio:'1.4'}}><img src={l.logo_url} alt={l.name} style={{width:'70%',height:'50%',objectFit:'contain',filter:'brightness(0) invert(1)',opacity:0.35}}/></div>))}
      </div>
    </div>
  );

  const Testimonials=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>Отзывы</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:0}}>Нам доверяют лидеры</h2>
      </div>
      {bxTestimonials.map((t:any,i:number)=>(
        <div key={t.id} className="bx-fade" style={{...gc({marginBottom:12}),animationDelay:i*0.06+'s'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            {t.person_photo_url&&<img src={t.person_photo_url} alt="" style={{width:44,height:44,borderRadius:22,objectFit:'cover',border:'1px solid rgba(200,164,78,0.2)'}}/>}
            <div><div style={{fontSize:14,fontWeight:700,fontFamily:FD,color:DT}}>{t.person_name}</div><div style={{fontSize:11,color:DT3,fontFamily:FT,marginTop:2}}>{t.person_title_ru}</div></div>
          </div>
          <div style={{fontSize:14,color:DT2,fontFamily:FT,lineHeight:1.6,fontStyle:'italic'}}>«{t.quote_ru}»</div>
        </div>
      ))}
    </div>
  );

  const Investment=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>Инвестиции</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:'0 0 12px'}}>Три уровня входа</h2>
        <p style={{fontSize:13,color:DT3,fontFamily:FT,margin:'0 0 32px',lineHeight:1.6,maxWidth:480,marginLeft:'auto',marginRight:'auto'}}>McKinsey берёт $500K за стратегию, но не делает реализацию. Агентство берёт $30K за сайт, но не понимает ваш бизнес. BillionsX делает всё. Под ключ. С AI.</p>
      </div>
      {bxTiers.map((tier:any)=>{const svc=bxServices.filter((s:any)=>s.tier_id===tier.id);return(
        <div key={tier.id} style={{marginBottom:20}}>
          <div style={{padding:'16px 20px',borderRadius:'14px 14px 2px 2px',background:'rgba(200,164,78,0.06)',border:'1px solid rgba(200,164,78,0.1)',borderBottom:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{tier.name}</span>{tier.price_range_display&&<span style={{fontSize:11,fontWeight:600,fontFamily:FD,color:DT3,padding:'2px 10px',borderRadius:20,background:'rgba(255,255,255,0.04)'}}>{tier.price_range_display}</span>}</div>
            <div style={{fontSize:12,color:DT3,fontFamily:FT,marginTop:4}}>{tier.subtitle_ru}</div>
          </div>
          {svc.map((s:any,si:number)=>(<div key={s.id} style={{padding:'14px 20px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.04)',borderTop:'none',borderRadius:si===svc.length-1?'0 0 14px 14px':'0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:14,fontWeight:700,fontFamily:FD,color:DT}}>{s.name_ru}</div><div style={{fontSize:11,color:DT3,fontFamily:FT,marginTop:3}}>{s.subtitle_ru}</div></div>
            {s.price_display&&<div style={{fontSize:14,fontWeight:700,fontFamily:FD,color:G,flexShrink:0,marginLeft:12}}>{s.price_display}</div>}
          </div>))}
        </div>
      );})}
      <button onClick={()=>nav('inner-circle')} className="bx-pill bx-glow" style={{width:'100%',padding:'16px',borderRadius:50,background:GG,color:'#000',fontSize:15,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',marginTop:8}}>Подать заявку</button>
    </div>
  );

  const InnerCircle=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>Inner Circle</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:'0 0 8px'}}>Подать заявку</h2>
        <p style={{fontSize:15,color:DT3,fontFamily:FT,margin:0}}>Мы берём 12 проектов в год</p>
      </div>
      {bxFormSent?<div style={gc({textAlign:'center',padding:'40px'})}><div style={{fontSize:40,marginBottom:16}}>✦</div><div style={{fontSize:20,fontWeight:700,fontFamily:FD,color:DT}}>Заявка отправлена</div><div style={{fontSize:14,color:DT3,fontFamily:FT,marginTop:8}}>Управляющий партнёр свяжется в течение 48 часов</div></div>:(
        <div>{['name','email','phone','company','message'].map(f=>(<div key={f} style={{marginBottom:10}}><input className="bx-input" placeholder={{name:'Ваше имя *',email:'Email',phone:'Телефон',company:'Компания',message:'О проекте'}[f]} value={(bxFormData as any)[f]} onChange={e=>setBxFormData({...bxFormData,[f]:e.target.value})}/></div>))}
        <button onClick={async()=>{if(!bxFormData.name.trim())return;await supabase.rpc('bx_submit_application',{p_name:bxFormData.name,p_email:bxFormData.email||null,p_phone:bxFormData.phone||null,p_company:bxFormData.company||null,p_message:bxFormData.message||null,p_source:mode==='embedded'?'ethnomir':'web'});setBxFormSent(true);}} className="bx-pill bx-glow" style={{width:'100%',padding:'16px',borderRadius:50,background:GG,color:'#000',fontSize:15,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',marginTop:4}}>Отправить заявку</button></div>
      )}
    </div>
  );

  const About=()=>(
    <div className="bx-fade" style={{padding:'80px 24px 60px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:12,fontWeight:600,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:12}}>О компании</div>
        <h2 style={{fontSize:32,fontWeight:800,fontFamily:FD,color:DT,lineHeight:1.2,margin:0}}>10+ лет инженерии брендов</h2>
      </div>
      <div style={gc({marginBottom:16})}><div style={{fontSize:15,color:DT2,fontFamily:FT,lineHeight:1.8}}>Billions X — не агентство и не студия. Это операционная система для премиальных брендов. Мы объединяем стратегический консалтинг уровня Big 4, маркетинговую упаковку мирового класса и AI-разработку уровня Big Tech — в одной команде.</div></div>
      <div style={{...gc({marginBottom:16}),background:'rgba(200,164,78,0.04)',border:'1px solid rgba(200,164,78,0.1)'}}><div style={{fontSize:15,color:DT,fontFamily:FT,lineHeight:1.8}}>Без брифов. Без шаблонов. Управляющий партнёр лично вникает в каждый проект. Наш маркетинг стоит дорого, но наши клиенты зарабатывают ещё больше.</div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[{v:'$80B+',l:'Капитализация'},{v:'100+',l:'Стран'},{v:'10+',l:'Лет'},{v:'60+',l:'Fortune 500'}].map((s,i)=>(<div key={i} style={gc({textAlign:'center',padding:'18px'})}><div style={{fontSize:24,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div><div style={{fontSize:10,color:DT3,fontFamily:FT,marginTop:6}}>{s.l}</div></div>))}
      </div>
    </div>
  );

  // ── LOADING ──
  if(bxLoading) return(<div style={{position:'fixed',inset:0,zIndex:9998,background:DB,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><div style={{fontSize:16,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:6}}>BILLIONS X</div></div>);

  // ── MAIN ──
  return(
    <div style={{position:'fixed',inset:0,zIndex:9998,background:DB,display:'flex',flexDirection:'column',color:DT}}>
      <style>{bxCSS}</style>
      {/* Header */}
      <div style={{position:'sticky',top:0,zIndex:10,padding:'50px 20px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(10,10,10,0.9)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        {bxScreen==='case-detail'?<span className="bx-pill" onClick={()=>{setBxCaseDetail(null);setBxScreen('cases');}} style={{fontSize:14,fontWeight:600,fontFamily:FD,color:G,cursor:'pointer'}}>← Назад</span>:bxScreen!=='hero'?<span className="bx-pill" onClick={()=>nav('hero')} style={{fontSize:14,fontWeight:600,fontFamily:FD,color:G,cursor:'pointer'}}>← Главная</span>:<div style={{width:60}}/>}
        <div style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:4}}>BILLIONS X</div>
        {mode==='embedded'&&onClose?<span className="bx-pill" onClick={onClose} style={{fontSize:14,fontWeight:600,fontFamily:FD,color:DT2,cursor:'pointer'}}>Закрыть</span>:<div style={{width:60}}/>}
      </div>
      {/* Nav Pills */}
      {bxScreen!=='case-detail'&&<div style={{display:'flex',gap:6,padding:'10px 20px',overflowX:'auto',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
        {navItems.map(item=>(<span key={item.id} className="bx-pill" onClick={()=>nav(item.id)} style={{padding:'6px 14px',borderRadius:20,fontSize:11,fontWeight:600,fontFamily:FD,whiteSpace:'nowrap',cursor:'pointer',flexShrink:0,...(bxScreen===item.id?{background:'rgba(200,164,78,0.15)',color:G,border:`1px solid rgba(200,164,78,0.2)`}:{background:'rgba(255,255,255,0.03)',color:DT3,border:'1px solid transparent'})}}>{item.l}</span>))}
      </div>}
      {/* Content */}
      <div ref={bxScrollRef} style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch'}}>
        {bxScreen==='hero'&&<Hero/>}
        {bxScreen==='problem'&&<Problem/>}
        {bxScreen==='system'&&<System/>}
        {bxScreen==='cases'&&<Cases/>}
        {bxScreen==='case-detail'&&<CaseDetail/>}
        {bxScreen==='fortune-wall'&&<FortuneWall/>}
        {bxScreen==='testimonials'&&<Testimonials/>}
        {bxScreen==='investment'&&<Investment/>}
        {bxScreen==='inner-circle'&&<InnerCircle/>}
        {bxScreen==='about'&&<About/>}
      </div>
    </div>
  );
}
'''

code = code[:start_idx] + new_component + code[end_idx+1:]

with open(path,'w') as f: f.write(code)
print(f"✅ Premium BillionsXApp written. Size: {len(code):,} bytes")
