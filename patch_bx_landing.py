#!/usr/bin/env python3
"""BillionsXApp → scrollable landing page with iOS 26 Liquid Glass + billionsx.com photos"""
path = 'apps/web/app/page.tsx'
with open(path,'r') as f: code = f.read()

start_marker = "function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {"
end_marker = "\n\n\n// ─── TAB BAR ──"
start_idx = code.index(start_marker)
end_idx = code.index(end_marker, start_idx)

new_component = r'''function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {
  const [bxData, setBxData] = useState<any>({cases:[],methodology:[],testimonials:[],logos:[],tiers:[],services:[],config:{}});
  const [bxDetail, setBxDetail] = useState<any>(null);
  const [bxLoading, setBxLoading] = useState(true);
  const [bxForm, setBxForm] = useState({name:'',email:'',phone:'',company:'',message:''});
  const [bxSent, setBxSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sb = useMemo(()=>{
    const h:any={'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};
    return{
      q:async(table:string,filters:string='')=>{const r=await fetch(SB_URL+'/rest/v1/'+table+'?select=*&order=sort_order.asc'+filters,{headers:h});return r.json();},
      rpc:async(fn:string,p:any)=>{const r=await fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:h,body:JSON.stringify(p)});return r.json();}
    };
  },[]);

  useEffect(()=>{(async()=>{try{const[cases,meth,test,logos,tiers,svcs,cfgRaw]=await Promise.all([
    sb.q('bx_cases','&is_active=eq.true&order=tier.asc,sort_order.asc'),
    sb.q('bx_methodology','&is_active=eq.true'),
    sb.q('bx_testimonials','&is_active=eq.true'),
    sb.q('bx_client_logos','&is_active=eq.true'),
    sb.q('bx_pricing_tiers','&is_active=eq.true'),
    sb.q('bx_services','&is_active=eq.true'),
    sb.q('bx_config','')
  ]);const cfg:any={};(cfgRaw||[]).forEach((r:any)=>{cfg[r.key]=r.value;});
  setBxData({cases:cases||[],methodology:meth||[],testimonials:test||[],logos:logos||[],tiers:tiers||[],services:svcs||[],config:cfg});}catch(e){console.error('BX',e);}setBxLoading(false);})();},[]);

  const openCase=async(slug:string)=>{const d=await sb.rpc('bx_get_case_full',{p_slug:slug});setBxDetail(d);if(scrollRef.current)scrollRef.current.scrollTop=0;};
  const closeCase=()=>{setBxDetail(null);};

  const {cases,methodology,testimonials,logos,tiers,services,config}=bxData;
  const stats=config.hero_stats||{};

  // Tier grouping
  const tierGroups=useMemo(()=>{const g:any={};(cases||[]).forEach((c:any)=>{if(!g[c.tier])g[c.tier]={tier:c.tier,label:c.tier_label_ru||'',cases:[]};g[c.tier].cases.push(c);});return Object.values(g).sort((a:any,b:any)=>a.tier-b.tier);},[cases]);

  // Glass style
  const glass=(x:any={}):any=>({background:'rgba(255,255,255,.42)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',borderRadius:20,border:'0.5px solid rgba(255,255,255,0.5)',boxShadow:'0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',...x});
  const G='#C8A44E';const GG='linear-gradient(135deg,#C8A44E,#F4D675)';

  const CSS=`
    @keyframes bxIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
    @keyframes bxOrb{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5}50%{transform:translate(-50%,-50%) scale(1.15);opacity:.8}}
    .bxA{animation:bxIn .7s ease both}.bxA1{animation-delay:.1s}.bxA2{animation-delay:.2s}.bxA3{animation-delay:.3s}.bxA4{animation-delay:.4s}.bxA5{animation-delay:.5s}
    .bxT{transition:transform .25s ease,opacity .25s ease}.bxT:active{transform:scale(.97)!important;opacity:.85}
    .bxI{background:rgba(255,255,255,.55)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important;border:0.5px solid rgba(255,255,255,.5)!important;border-radius:14px!important;padding:14px 16px!important;font-size:15px!important;font-family:${FT}!important;color:#000!important;outline:none!important;width:100%!important;box-sizing:border-box!important}
    .bxI::placeholder{color:rgba(60,60,67,.35)!important}.bxI:focus{border-color:rgba(200,164,78,.5)!important;box-shadow:0 0 0 3px rgba(200,164,78,.1)!important}
    .bxSec{padding:80px 20px 60px;max-width:600px;margin:0 auto}
    .bxSec h2{font-size:32px;font-weight:800;font-family:${FD};color:#000;line-height:1.15;margin:0 0 12px;text-align:center}
    .bxLbl{font-size:11px;font-weight:700;letter-spacing:4px;color:${G};font-family:${FD};text-transform:uppercase;text-align:center;margin-bottom:12px}
  `;

  // ── CASE DETAIL VIEW ──
  if(bxDetail){
    const c=bxDetail.case||{};const metrics=bxDetail.metrics||[];
    return(
      <div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',flexDirection:'column'}}>
        <style>{CSS}</style>
        <div style={{padding:'54px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',...glass({borderRadius:0,background:'rgba(242,242,247,.85)'})}}>
          <span className="bxT" onClick={closeCase} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>← Назад</span>
          <span style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:3}}>BILLIONS X</span>
          {mode==='embedded'&&onClose?<span className="bxT" onClick={onClose} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>Закрыть</span>:<div style={{width:60}}/>}
        </div>
        <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
          {/* Hero */}
          <div className="bxA" style={{padding:'40px 20px 32px',textAlign:'center'}}>
            {c.client_logo_url&&<img src={c.client_logo_url} alt="" style={{height:52,objectFit:'contain',marginBottom:16}}/>}
            <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:'0 0 6px'}}>{c.client_name}</h2>
            {c.location_country&&<div style={{fontSize:13,color:'rgba(60,60,67,.5)',fontFamily:FT}}>{c.location_city?c.location_city+' · ':''}{c.location_country}</div>}
            {c.result_headline_ru&&<div className="bxA bxA1" style={{marginTop:16,display:'inline-block',...glass({padding:'12px 20px',borderRadius:14})}}><div style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{c.result_headline_ru}</div></div>}
          </div>
          {/* Metrics */}
          {metrics.length>0&&<div className="bxA bxA2" style={{padding:'0 20px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{metrics.map((m:any,i:number)=>(<div key={i} style={glass({padding:'12px',display:'flex',gap:8,alignItems:'flex-start',borderRadius:14})}><span style={{color:G,fontSize:12}}>✦</span><span style={{fontSize:12,fontWeight:600,fontFamily:FD,color:'#000',lineHeight:1.4}}>{m.value_ru}</span></div>))}</div>}
          <div style={{padding:'0 20px 40px'}}>
            {c.market_context_ru&&<div className="bxA bxA2" style={{marginBottom:20}}><div className="bxLbl" style={{textAlign:'left'}}>Контекст рынка</div><p style={{fontSize:15,color:'rgba(60,60,67,.8)',fontFamily:FT,lineHeight:1.7,margin:0}}>{c.market_context_ru}</p></div>}
            {c.company_context_ru&&<div className="bxA bxA3" style={{marginBottom:20}}><div className="bxLbl" style={{textAlign:'left'}}>О компании</div><p style={{fontSize:15,color:'rgba(60,60,67,.8)',fontFamily:FT,lineHeight:1.7,margin:0}}>{c.company_context_ru}</p></div>}
            {c.game_changer_ru&&<div className="bxA bxA3" style={{marginBottom:20,...glass({padding:20,background:'rgba(200,164,78,.06)',border:'1px solid rgba(200,164,78,.15)'}),borderRadius:16}}><div className="bxLbl" style={{textAlign:'left'}}>✦ Billions X Game Changer</div><p style={{fontSize:15,color:'#000',fontFamily:FT,lineHeight:1.7,margin:0}}>{c.game_changer_ru}</p></div>}
            {c.quote_text&&<div className="bxA bxA4" style={{marginBottom:20,padding:'20px',borderLeft:`3px solid ${G}`,background:'rgba(200,164,78,.03)',borderRadius:'0 16px 16px 0'}}><p style={{fontSize:15,fontStyle:'italic',color:'rgba(60,60,67,.75)',fontFamily:FT,lineHeight:1.7,margin:0}}>«{c.quote_text}»</p>{c.quote_source&&<div style={{marginTop:10,display:'flex',alignItems:'center',gap:8}}>{c.quote_source_logo_url&&<img src={c.quote_source_logo_url} alt="" style={{height:14,objectFit:'contain'}}/>}<span style={{fontSize:12,fontWeight:600,fontFamily:FD,color:'rgba(60,60,67,.4)'}}>{c.quote_source}</span></div>}</div>}
            {c.services_provided&&c.services_provided.length>0&&<div className="bxA bxA4" style={{marginBottom:24,display:'flex',gap:8,flexWrap:'wrap'}}>{c.services_provided.map((s:string)=>(<span key={s} style={{fontSize:12,fontWeight:600,fontFamily:FD,padding:'6px 16px',borderRadius:50,...glass({background:'rgba(200,164,78,.08)'}),color:G}}>{s}</span>))}</div>}
            <button className="bxT" onClick={closeCase} style={{width:'100%',padding:'16px',borderRadius:14,background:GG,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer'}}>Обсудить ваш проект</button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ──
  if(bxLoading) return(<div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontSize:16,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:6}}>BILLIONS X</div></div>);

  // ── LANDING PAGE ──
  return(
    <div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',flexDirection:'column'}}>
      <style>{CSS}</style>
      {/* Sticky Header */}
      <div style={{position:'sticky',top:0,zIndex:10,padding:'54px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',...glass({borderRadius:0,background:'rgba(242,242,247,.85)'})}}>
        <div style={{width:60}}/>
        <div style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:3}}>BILLIONS X</div>
        {mode==='embedded'&&onClose?<span className="bxT" onClick={onClose} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>Закрыть</span>:<div style={{width:60}}/>}
      </div>

      <div ref={scrollRef} style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch'}}>

        {/* ═══ HERO ═══ */}
        <div style={{minHeight:'85vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px 60px',textAlign:'center',position:'relative',overflow:'hidden'}}>
          {/* Orb */}
          <div style={{position:'absolute',top:'30%',left:'50%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(200,164,78,0.15) 0%,rgba(200,164,78,0.03) 50%,transparent 70%)',animation:'bxOrb 8s ease infinite',pointerEvents:'none'}}/>
          <div className="bxA" style={{fontSize:11,fontWeight:700,letterSpacing:6,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:20}}>Billions X</div>
          <h1 className="bxA bxA1" style={{fontSize:44,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.1,margin:'0 0 20px'}}>We Engineer<br/><span style={{background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Billion-Dollar</span><br/>Brands</h1>
          <p className="bxA bxA2" style={{fontSize:17,color:'rgba(60,60,67,.55)',fontFamily:FT,lineHeight:1.6,maxWidth:400,margin:'0 0 36px'}}>Стратегия · Смыслы · Упаковка · Продвижение · Продажи — под ключ</p>
          <div className="bxA bxA3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,width:'100%',maxWidth:320,marginBottom:36}}>
            {[{v:stats.total_capitalization||'$80B+',l:'Капитализация'},{v:stats.countries||'100+',l:'Стран'},{v:stats.fortune500_clients||'60+',l:'Fortune 500'},{v:stats.years_experience||'10+',l:'Лет опыта'}].map((s,i)=>(
              <div key={i} style={glass({textAlign:'center',padding:'14px 10px',borderRadius:16})}>
                <div style={{fontSize:24,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div>
                <div style={{fontSize:10,color:'rgba(60,60,67,.4)',fontFamily:FT,marginTop:4}}>{s.l}</div>
              </div>
            ))}
          </div>
          <button className="bxA bxA4 bxT" onClick={()=>{const el=document.getElementById('bx-cases');el?.scrollIntoView({behavior:'smooth'});}} style={{padding:'14px 36px',borderRadius:50,background:GG,color:'#fff',fontSize:15,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 24px rgba(200,164,78,.25)'}}>Смотреть портфолио ↓</button>
        </div>

        {/* ═══ PROBLEM ═══ */}
        <div className="bxSec">
          <div className="bxLbl">Проблема</div>
          <h2>95% компаний тратят миллионы на маркетинг, который не&nbsp;работает</h2>
          <div style={{marginTop:28}}>
            {['Красивые сайты без смыслов — клиент смотрит и уходит','Реклама без стратегии — бюджеты сливаются, ROI отрицательный','Бренд без ДНК — конкуренция только по цене','Продажи без системы — менеджеры импровизируют, сделки теряются','Технологии без AI — конкуренты уже используют, разрыв растёт'].map((t,i)=>(
              <div key={i} style={glass({padding:'14px 18px',marginBottom:8,borderRadius:14,display:'flex',gap:12,alignItems:'center'})}>
                <div style={{width:3,height:32,borderRadius:2,background:G,flexShrink:0,opacity:.5}}/>
                <span style={{fontSize:14,fontFamily:FT,color:'rgba(60,60,67,.75)',lineHeight:1.4}}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SYSTEM ═══ */}
        <div className="bxSec">
          <div className="bxLbl">Система</div>
          <h2>Один партнёр. Полный цикл.</h2>
          <p style={{fontSize:15,color:'rgba(60,60,67,.5)',fontFamily:FT,textAlign:'center',margin:'0 0 28px'}}>От первой идеи до миллиардного оборота</p>
          {methodology.map((m:any,i:number)=>(
            <div key={m.id}>
              <div style={glass({padding:'16px 18px',marginBottom:2,borderRadius:i===0?'16px 16px 4px 4px':i===methodology.length-1?'4px 4px 16px 16px':'4px',position:'relative',overflow:'hidden'})}>
                <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:m.color_accent||G}}/>
                <div style={{display:'flex',alignItems:'center',gap:12,marginLeft:8}}>
                  <div style={{width:28,height:28,borderRadius:8,background:m.color_accent||G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800,fontFamily:FD,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:6}}><span style={{fontSize:14,fontWeight:700,fontFamily:FD,color:'#000'}}>{m.label_ru}</span><span style={{fontSize:10,color:m.color_accent||G,fontWeight:600,fontFamily:FD}}>{m.name}</span></div>
                    <div style={{fontSize:12,color:'rgba(60,60,67,.55)',fontFamily:FT,marginTop:3,lineHeight:1.4}}>{m.simple_ru}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ CASES ═══ */}
        <div id="bx-cases" className="bxSec">
          <div className="bxLbl">Impact Portfolio</div>
          <h2>Бренды, которые мы вывели на&nbsp;новый уровень</h2>
          <div style={{marginTop:28}}>
          {(tierGroups as any[]).map((group:any)=>(
            <div key={group.tier} style={{marginBottom:28}}>
              <div style={{fontSize:10,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>{group.label}</div>
              {group.cases.map((c:any)=>(
                <div key={c.slug} className="bxT" onClick={()=>openCase(c.slug)} style={glass({padding:'16px',marginBottom:8,borderRadius:16,cursor:'pointer'})}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    {c.client_logo_url&&<img src={c.client_logo_url} alt="" style={{width:40,height:40,objectFit:'contain',borderRadius:10,flexShrink:0}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000'}}>{c.client_name}</div>
                      {c.location_country&&<div style={{fontSize:11,color:'rgba(60,60,67,.4)',fontFamily:FT}}>{c.location_city?c.location_city+', ':''}{c.location_country}</div>}
                    </div>
                    <span style={{color:'rgba(60,60,67,.2)',fontSize:20}}>›</span>
                  </div>
                  {c.result_headline_ru&&<div style={{marginTop:10,padding:'8px 12px',borderRadius:10,background:'rgba(200,164,78,.06)',fontSize:12,fontWeight:600,fontFamily:FD,color:G,lineHeight:1.4}}>{c.result_headline_ru}</div>}
                </div>
              ))}
            </div>
          ))}
          </div>
        </div>

        {/* ═══ FORTUNE WALL ═══ */}
        <div className="bxSec" style={{paddingTop:40}}>
          <div className="bxLbl">Клиенты</div>
          <h2>Fortune 500</h2>
          <div style={{marginTop:24,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
            {logos.map((l:any)=>(<div key={l.id} style={glass({padding:'10px 6px',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',aspectRatio:'1.3'})}><img src={l.logo_url} alt={l.name} style={{width:'75%',height:'55%',objectFit:'contain',opacity:.4}}/></div>))}
          </div>
        </div>

        {/* ═══ TESTIMONIALS ═══ */}
        <div className="bxSec">
          <div className="bxLbl">Отзывы</div>
          <h2>Нам доверяют лидеры</h2>
          <div style={{marginTop:24}}>
          {testimonials.map((t:any)=>(
            <div key={t.id} style={glass({padding:'16px',marginBottom:10,borderRadius:16})}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                {t.person_photo_url&&<img src={t.person_photo_url} alt="" style={{width:40,height:40,borderRadius:20,objectFit:'cover'}}/>}
                <div><div style={{fontSize:14,fontWeight:700,fontFamily:FD,color:'#000'}}>{t.person_name}</div><div style={{fontSize:10,color:'rgba(60,60,67,.4)',fontFamily:FT,marginTop:1}}>{t.person_title_ru}</div></div>
              </div>
              <div style={{fontSize:14,color:'rgba(60,60,67,.7)',fontFamily:FT,lineHeight:1.6,fontStyle:'italic'}}>«{t.quote_ru}»</div>
            </div>
          ))}
          </div>
        </div>

        {/* ═══ INVESTMENT ═══ */}
        <div className="bxSec">
          <div className="bxLbl">Инвестиции</div>
          <h2>Три уровня входа</h2>
          <p style={{fontSize:13,color:'rgba(60,60,67,.45)',fontFamily:FT,textAlign:'center',margin:'0 0 24px',lineHeight:1.5}}>McKinsey — стратегия без реализации. Агентство — сайт без понимания бизнеса. BillionsX — всё. Под ключ. С AI.</p>
          {tiers.map((tier:any)=>{const svc=services.filter((s:any)=>s.tier_id===tier.id);return(
            <div key={tier.id} style={{marginBottom:16}}>
              <div style={glass({padding:'14px 16px',borderRadius:'16px 16px 2px 2px',background:'rgba(200,164,78,.08)',border:'0.5px solid rgba(200,164,78,.15)'})}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:18,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{tier.name}</span>{tier.price_range_display&&<span style={{fontSize:10,fontWeight:600,fontFamily:FD,color:'rgba(60,60,67,.4)',padding:'2px 8px',borderRadius:20,background:'rgba(0,0,0,.03)'}}>{tier.price_range_display}</span>}</div>
                <div style={{fontSize:11,color:'rgba(60,60,67,.45)',fontFamily:FT,marginTop:3}}>{tier.subtitle_ru}</div>
              </div>
              {svc.map((s:any,si:number)=>(<div key={s.id} style={glass({padding:'12px 16px',borderRadius:si===svc.length-1?'0 0 16px 16px':'0',marginTop:1,display:'flex',justifyContent:'space-between',alignItems:'center'})}>
                <div><div style={{fontSize:14,fontWeight:600,fontFamily:FD,color:'#000'}}>{s.name_ru}</div><div style={{fontSize:11,color:'rgba(60,60,67,.4)',fontFamily:FT,marginTop:2}}>{s.subtitle_ru}</div></div>
                {s.price_display&&<div style={{fontSize:14,fontWeight:700,fontFamily:FD,color:G,flexShrink:0}}>{s.price_display}</div>}
              </div>))}
            </div>
          );})}
        </div>

        {/* ═══ APPLICATION FORM ═══ */}
        <div className="bxSec" style={{paddingBottom:40}}>
          <div className="bxLbl">Inner Circle</div>
          <h2>Подать заявку</h2>
          <p style={{fontSize:14,color:'rgba(60,60,67,.45)',fontFamily:FT,textAlign:'center',margin:'0 0 24px'}}>Мы берём 12 проектов в год</p>
          {bxSent?<div style={glass({padding:'36px 20px',textAlign:'center',borderRadius:20})}><div style={{fontSize:36,marginBottom:12}}>✦</div><div style={{fontSize:18,fontWeight:700,fontFamily:FD,color:'#000'}}>Заявка отправлена</div><div style={{fontSize:13,color:'rgba(60,60,67,.45)',fontFamily:FT,marginTop:6}}>Свяжемся в течение 48 часов</div></div>:(
            <div>{['name','email','phone','company','message'].map(f=>(<div key={f} style={{marginBottom:8}}><input className="bxI" placeholder={{name:'Ваше имя *',email:'Email',phone:'Телефон',company:'Компания',message:'О проекте'}[f]} value={(bxForm as any)[f]} onChange={e=>setBxForm({...bxForm,[f]:e.target.value})}/></div>))}
            <button className="bxT" onClick={async()=>{if(!bxForm.name.trim())return;await sb.rpc('bx_submit_application',{p_name:bxForm.name,p_email:bxForm.email||null,p_phone:bxForm.phone||null,p_company:bxForm.company||null,p_message:bxForm.message||null,p_source:mode==='embedded'?'ethnomir':'web'});setBxSent(true);}} style={{width:'100%',padding:'16px',borderRadius:14,background:GG,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 20px rgba(200,164,78,.2)'}}>Отправить заявку</button></div>
          )}
        </div>

        {/* ═══ ABOUT ═══ */}
        <div className="bxSec" style={{paddingTop:20,paddingBottom:100}}>
          <div className="bxLbl">О компании</div>
          <h2>10+ лет инженерии брендов</h2>
          <div style={glass({padding:'18px',borderRadius:16,marginTop:20,marginBottom:12})}><p style={{fontSize:14,color:'rgba(60,60,67,.7)',fontFamily:FT,lineHeight:1.7,margin:0}}>Billions X — не агентство. Это операционная система для премиальных брендов. Стратегический консалтинг уровня Big 4, маркетинговая упаковка мирового класса и AI-разработка — в одной команде. Без брифов. Без шаблонов.</p></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[{v:'$80B+',l:'Капитализация'},{v:'100+',l:'Стран'},{v:'10+',l:'Лет'},{v:'60+',l:'Fortune 500'}].map((s,i)=>(<div key={i} style={glass({textAlign:'center',padding:'14px',borderRadius:14})}><div style={{fontSize:22,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div><div style={{fontSize:10,color:'rgba(60,60,67,.35)',fontFamily:FT,marginTop:4}}>{s.l}</div></div>))}
          </div>
        </div>

      </div>
    </div>
  );
}
'''

code = code[:start_idx] + new_component + code[end_idx+1:]
with open(path,'w') as f: f.write(code)
print(f"✅ Landing page version. Size: {len(code):,}")
