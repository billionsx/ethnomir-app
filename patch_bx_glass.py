#!/usr/bin/env python3
"""Replace BillionsXApp with iOS 26 Liquid Glass version — Canvas gradient + real photos"""
path = 'apps/web/app/page.tsx'
with open(path,'r') as f: code = f.read()

start_marker = "function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {"
end_marker = "\n\n\n// ─── TAB BAR ──"
start_idx = code.index(start_marker)
end_idx = code.index(end_marker, start_idx)

new_code = r'''function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bxData,setBxData]=useState<any>({cases:[],methodology:[],testimonials:[],logos:[],tiers:[],services:[],config:{}});
  const [bxDetail,setBxDetail]=useState<any>(null);
  const [bxLoading,setBxLoading]=useState(true);
  const [bxForm,setBxForm]=useState({name:'',email:'',phone:'',company:'',message:''});
  const [bxSent,setBxSent]=useState(false);
  const scrollRef=useRef<HTMLDivElement>(null);
  const G='#C8A44E';const GG='linear-gradient(135deg,#C8A44E,#F4D675)';

  // Supabase mini-client
  const sb=useMemo(()=>{
    const h:any={'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};
    return{
      q:async(t:string,f:string='')=>{const r=await fetch(SB_URL+'/rest/v1/'+t+'?select=*&order=sort_order.asc'+f,{headers:h});return r.json();},
      rpc:async(fn:string,p:any)=>{const r=await fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:h,body:JSON.stringify(p)});return r.json();}
    };
  },[]);

  // Load data
  useEffect(()=>{(async()=>{try{const[cases,meth,test,logos,tiers,svcs,cfgRaw]=await Promise.all([
    sb.q('bx_cases','&is_active=eq.true&order=tier.asc,sort_order.asc'),sb.q('bx_methodology','&is_active=eq.true'),
    sb.q('bx_testimonials','&is_active=eq.true'),sb.q('bx_client_logos','&is_active=eq.true'),
    sb.q('bx_pricing_tiers','&is_active=eq.true'),sb.q('bx_services','&is_active=eq.true'),sb.q('bx_config','')
  ]);const cfg:any={};(cfgRaw||[]).forEach((r:any)=>{cfg[r.key]=r.value;});
  setBxData({cases:cases||[],methodology:meth||[],testimonials:test||[],logos:logos||[],tiers:tiers||[],services:svcs||[],config:cfg});}catch(e){console.error('BX',e);}setBxLoading(false);})();},[]);

  // Canvas animated gradient (gold edition)
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;
    const dpr=window.devicePixelRatio||1;
    const resize=()=>{c.width=c.clientWidth*dpr;c.height=c.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
    resize();window.addEventListener('resize',resize);
    const blobs=[
      {x:0.2,y:0.15,r:0.42,color:[210,180,120],vx:0.12,vy:0.10,phase:0,speed:0.7},
      {x:0.75,y:0.2,r:0.38,color:[195,165,215],vx:-0.11,vy:0.13,phase:1.2,speed:0.65},
      {x:0.3,y:0.5,r:0.40,color:[240,200,150],vx:0.10,vy:-0.09,phase:2.5,speed:0.8},
      {x:0.7,y:0.7,r:0.36,color:[180,210,230],vx:-0.13,vy:-0.11,phase:3.8,speed:0.72},
      {x:0.5,y:0.4,r:0.35,color:[230,190,160],vx:0.09,vy:0.12,phase:5.0,speed:0.78},
      {x:0.15,y:0.8,r:0.33,color:[200,175,140],vx:0.14,vy:-0.08,phase:6.2,speed:0.68}
    ];
    let t=0;let raf:number;
    const draw=()=>{const W=c.clientWidth,H=c.clientHeight;ctx.clearRect(0,0,W,H);ctx.fillStyle='#F2F2F7';ctx.fillRect(0,0,W,H);t+=0.003;
      blobs.forEach(b=>{const cx=(b.x+Math.sin(t*b.speed+b.phase)*b.vx)*W;const cy=(b.y+Math.cos(t*b.speed*0.8+b.phase)*b.vy)*H;const radius=b.r*Math.min(W,H);
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);g.addColorStop(0,`rgba(${b.color[0]},${b.color[1]},${b.color[2]},0.45)`);g.addColorStop(0.5,`rgba(${b.color[0]},${b.color[1]},${b.color[2]},0.15)`);g.addColorStop(1,`rgba(${b.color[0]},${b.color[1]},${b.color[2]},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);});
      raf=requestAnimationFrame(draw);};
    draw();return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  },[]);

  const openCase=async(slug:string)=>{const d=await sb.rpc('bx_get_case_full',{p_slug:slug});setBxDetail(d);if(scrollRef.current)scrollRef.current.scrollTop=0;};

  const {cases,methodology,testimonials,logos,tiers,services,config}=bxData;
  const stats=config.hero_stats||{};
  const tierGroups=useMemo(()=>{const g:any={};(cases||[]).forEach((c:any)=>{if(!g[c.tier])g[c.tier]={tier:c.tier,label:c.tier_label_ru||'',cases:[]};g[c.tier].cases.push(c);});return Object.values(g).sort((a:any,b:any)=>a.tier-b.tier);},[cases]);

  // iOS 26 Glass card
  const gc=(x:any={}):any=>({background:'rgba(255,255,255,.52)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',borderRadius:20,border:'0.5px solid rgba(255,255,255,.6)',boxShadow:'0 0.5px 0 rgba(255,255,255,.9) inset, 0 2px 12px rgba(0,0,0,.04)',position:'relative' as const,overflow:'hidden' as const,...x});
  const Spec=()=><div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent 5%,rgba(255,255,255,.85) 50%,transparent 95%)',pointerEvents:'none',zIndex:1}}/>;
  const Lbl=({children}:any)=><div style={{fontSize:11,fontWeight:700,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',textAlign:'center',marginBottom:8}}>{children}</div>;

  // Photos from billionsx.com
  const P:any={
    prod1:'https://static.tildacdn.net/tild6366-6531-4138-a565-613864366262/xProduction-02-min-m.png',
    prod2:'https://static.tildacdn.net/tild6234-3135-4535-a338-643234656139/xProduction-013-min.png',
    leads:'https://static.tildacdn.net/tild6536-3336-4739-a537-633437316463/billions-x-leads-bag.png',
    ceo:'https://static.tildacdn.net/tild3632-6639-4131-b036-313335323639/billions-x-leads-ceo.png',
    astro:'https://static.tildacdn.net/tild6663-6536-4763-b563-643364306366/Astronaut_Brenson_2-.png',
    bxLogo:'https://static.tildacdn.net/tild3638-3434-4466-b666-663738363034/billionsx.svg',
    fortune:'https://static.tildacdn.net/tild3764-6661-4136-b465-323638613235/fortune.svg',
    forbes:'https://static.tildacdn.net/tild3733-3933-4430-b664-343465353562/forbes.svg',
    ryb:'https://static.tildacdn.net/tild3830-6238-4239-b730-363235313065/ribakov-min-2-min.png',
    cher:'https://static.tildacdn.net/tild6366-3736-4331-b734-623165613636/chernyak-min-2-min.png',
    hart:'https://static.tildacdn.net/tild3230-6532-4665-b737-316638356565/hartmann-min-2-min.png',
  };
  const cLogos=['https://static.tildacdn.net/tild3036-3734-4566-b161-316136326262/google-1-1.svg','https://static.tildacdn.net/tild6133-3264-4833-b836-353230626635/microsoft.svg','https://static.tildacdn.net/tild6331-3966-4235-a639-386634343662/nasa-3.svg','https://static.tildacdn.net/tild6439-6434-4266-b764-323530343464/bmw.svg','https://static.tildacdn.net/tild6438-3733-4233-a566-376363663739/nike-4.svg','https://static.tildacdn.net/tild3966-3935-4734-b836-663833633034/disney.svg','https://static.tildacdn.net/tild3464-3039-4639-a562-386563396262/visa.svg','https://static.tildacdn.net/tild3437-6565-4336-a135-646133633838/rolls-royce-por-hern.svg','https://static.tildacdn.net/tild3437-6134-4461-a532-313266353239/jp-morgan.svg','https://static.tildacdn.net/tild3162-3562-4136-b437-633333386434/mercedes-benz-4.svg','https://static.tildacdn.net/tild3531-6261-4239-a634-316532383639/mastercard-2.svg','https://static.tildacdn.net/tild6135-6361-4866-b137-613131623131/ibm.svg','https://static.tildacdn.net/tild3339-3762-4162-a332-646332323361/sony-2.svg','https://static.tildacdn.net/tild3865-3363-4435-b563-613065323162/coca-cola.svg'];

  // ── CASE DETAIL ──
  if(bxDetail){const c=bxDetail.case||{};const metrics=bxDetail.metrics||[];
    return(<div style={{position:'fixed',inset:0,zIndex:9998,display:'flex',flexDirection:'column'}}>
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{padding:'54px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',...gc({borderRadius:0,background:'rgba(242,242,247,.7)'})}}>
          <Spec/><span className="tap" onClick={()=>setBxDetail(null)} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer',position:'relative',zIndex:2}}>← Назад</span>
          <span style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:3,position:'relative',zIndex:2}}>BILLIONS X</span>
          {mode==='embedded'&&onClose?<span className="tap" onClick={onClose} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer',position:'relative',zIndex:2}}>Закрыть</span>:<div style={{width:60}}/>}
        </div>
        <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
          <div style={{padding:'40px 20px 32px',textAlign:'center'}}>
            {c.client_logo_url&&<img src={c.client_logo_url} alt="" style={{height:48,objectFit:'contain',marginBottom:14}}/>}
            <h2 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.2,margin:'0 0 6px'}}>{c.client_name}</h2>
            {c.location_country&&<div style={{fontSize:13,color:'rgba(60,60,67,.45)',fontFamily:FT}}>{c.location_city?c.location_city+' · ':''}{c.location_country}</div>}
            {c.result_headline_ru&&<div style={{marginTop:16,display:'inline-block',...gc({padding:'10px 18px',borderRadius:14})}}><Spec/><div style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',position:'relative',zIndex:2}}>{c.result_headline_ru}</div></div>}
          </div>
          {metrics.length>0&&<div style={{padding:'0 20px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>{metrics.map((m:any,i:number)=>(<div key={i} style={gc({padding:'10px 12px',borderRadius:14,display:'flex',gap:8,alignItems:'flex-start'})}><Spec/><span style={{color:G,fontSize:12,position:'relative',zIndex:2}}>✦</span><span style={{fontSize:11,fontWeight:600,fontFamily:FD,color:'#000',lineHeight:1.4,position:'relative',zIndex:2}}>{m.value_ru}</span></div>))}</div>}
          <div style={{padding:'0 20px 60px'}}>
            {c.market_context_ru&&<div style={{marginBottom:20}}><div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:8}}>Контекст рынка</div><p style={{fontSize:15,color:'rgba(60,60,67,.75)',fontFamily:FT,lineHeight:1.7,margin:0}}>{c.market_context_ru}</p></div>}
            {c.company_context_ru&&<div style={{marginBottom:20}}><div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:8}}>О компании</div><p style={{fontSize:15,color:'rgba(60,60,67,.75)',fontFamily:FT,lineHeight:1.7,margin:0}}>{c.company_context_ru}</p></div>}
            {c.game_changer_ru&&<div style={{marginBottom:20,...gc({padding:20,borderRadius:16,background:'rgba(200,164,78,.06)',border:'0.5px solid rgba(200,164,78,.15)'}),}}><Spec/><div style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,letterSpacing:3,textTransform:'uppercase',marginBottom:10,position:'relative',zIndex:2}}>✦ Billions X Game Changer</div><p style={{fontSize:15,color:'#000',fontFamily:FT,lineHeight:1.7,margin:0,position:'relative',zIndex:2}}>{c.game_changer_ru}</p></div>}
            {c.quote_text&&<div style={{marginBottom:20,padding:20,borderLeft:'3px solid '+G,background:'rgba(200,164,78,.03)',borderRadius:'0 16px 16px 0'}}><p style={{fontSize:15,fontStyle:'italic',color:'rgba(60,60,67,.7)',fontFamily:FT,lineHeight:1.7,margin:0}}>«{c.quote_text}»</p>{c.quote_source&&<div style={{marginTop:10,display:'flex',alignItems:'center',gap:8}}>{c.quote_source_logo_url&&<img src={c.quote_source_logo_url} alt="" style={{height:14}}/>}<span style={{fontSize:12,fontWeight:600,fontFamily:FD,color:'rgba(60,60,67,.4)'}}>{c.quote_source}</span></div>}</div>}
            <button className="tap" onClick={()=>setBxDetail(null)} style={{width:'100%',padding:16,borderRadius:14,background:GG,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 20px rgba(200,164,78,.25)'}}>Обсудить ваш проект</button>
          </div>
        </div>
      </div>
    </div>);
  }

  // ── LOADING ──
  if(bxLoading)return(<div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontSize:16,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:6}}>BILLIONS X</div></div>);

  // ── LANDING PAGE ──
  return(
    <div style={{position:'fixed',inset:0,zIndex:9998,display:'flex',flexDirection:'column'}}>
      {/* Canvas BG */}
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',height:'100%'}}>
        {/* Header */}
        <div style={{position:'sticky',top:0,zIndex:10,padding:'54px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',...gc({borderRadius:0,background:'rgba(242,242,247,.7)'})}}>
          <Spec/><div style={{width:60,position:'relative',zIndex:2}}/>
          <span style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:3,position:'relative',zIndex:2}}>BILLIONS X</span>
          {mode==='embedded'&&onClose?<span className="tap" onClick={onClose} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer',position:'relative',zIndex:2}}>Закрыть</span>:<div style={{width:60}}/>}
        </div>

        <div ref={scrollRef} style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch'}}>

          {/* ═══ HERO ═══ */}
          <div style={{minHeight:'85vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center'}}>
            <img src={P.bxLogo} alt="" style={{height:24,marginBottom:20,opacity:0.7}}/>
            <div style={{display:'flex',gap:16,marginBottom:28,opacity:0.2}}><img src={P.fortune} alt="" style={{height:12}}/><img src={P.forbes} alt="" style={{height:12}}/></div>
            <h1 style={{fontSize:44,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.08,margin:'0 0 16px'}}>We Engineer<br/><span style={{background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Billion-Dollar</span><br/>Brands</h1>
            <p style={{fontSize:17,fontFamily:FT,color:'rgba(60,60,67,.5)',lineHeight:1.55,margin:'0 0 28px',maxWidth:360}}>Полный цикл: стратегия, смыслы, упаковка, реклама, продажи — под ключ.</p>
            <div style={gc({padding:16,width:'100%',maxWidth:380})}><Spec/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,position:'relative',zIndex:2}}>
                {[{v:stats.total_capitalization||'$80B+',l:'Капитализация'},{v:stats.countries||'100+',l:'Стран'},{v:stats.fortune500_clients||'60+',l:'Fortune 500'},{v:stats.years_experience||'10+',l:'Лет'}].map((s:any,i:number)=>(
                  <div key={i} style={{textAlign:'center'}}><div style={{fontSize:20,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div><div style={{fontSize:9,color:'rgba(60,60,67,.35)',fontFamily:FT,marginTop:2}}>{s.l}</div></div>
                ))}
              </div>
            </div>
            <button className="tap" onClick={()=>{const el=document.getElementById('bx-cases');el?.scrollIntoView({behavior:'smooth'});}} style={{marginTop:24,padding:'14px 32px',borderRadius:50,background:GG,color:'#fff',fontSize:15,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 20px rgba(200,164,78,.25)'}}>Смотреть портфолио ↓</button>
          </div>

          {/* ═══ PHOTO: xProduction ═══ */}
          <div style={{padding:'0 20px 40px'}}><div style={gc({padding:0,borderRadius:24})}><Spec/><img src={P.prod2} alt="" style={{width:'100%',borderRadius:24,display:'block'}}/></div></div>

          {/* ═══ LOGO TICKER ═══ */}
          <div style={{padding:'16px 0',overflow:'hidden'}}><style>{`@keyframes bxT{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
            <div style={{display:'flex',gap:32,alignItems:'center',animation:'bxT 20s linear infinite',width:'max-content'}}>{[...cLogos,...cLogos].map((u:string,i:number)=>(<img key={i} src={u} alt="" style={{height:16,opacity:0.2,flexShrink:0}}/>))}</div>
          </div>

          {/* ═══ CASES ═══ */}
          <div id="bx-cases" style={{padding:'60px 20px',maxWidth:500,margin:'0 auto'}}>
            <Lbl>Impact Portfolio</Lbl>
            <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',textAlign:'center',lineHeight:1.12,margin:'0 0 24px'}}>Бренды, которые мы вывели на&nbsp;новый уровень</h2>

            {/* Feature case with photo */}
            <div className="tap" onClick={()=>openCase(cases[0]?.slug||'orbi-group')} style={gc({padding:0,borderRadius:24,marginBottom:12,cursor:'pointer'})}><Spec/>
              <img src={P.prod1} alt="" style={{width:'100%',borderRadius:'24px 24px 0 0',display:'block',height:200,objectFit:'cover'}}/>
              <div style={{padding:'14px 16px',position:'relative',zIndex:2}}>
                <div style={{fontSize:16,fontWeight:700,fontFamily:FD,color:'#000'}}>{cases[0]?.client_name||'ORBI Group'}</div>
                <div style={{fontSize:11,color:'rgba(60,60,67,.4)',fontFamily:FT}}>{cases[0]?.location_city||'Батуми'}, {cases[0]?.location_country||'Georgia'}</div>
                {cases[0]?.result_headline_ru&&<div style={{fontSize:13,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginTop:6}}>{cases[0].result_headline_ru}</div>}
              </div>
            </div>

            {/* 2-col photo cases */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
              {cases.slice(1,3).map((c:any)=>(
                <div key={c.slug} className="tap" onClick={()=>openCase(c.slug)} style={gc({padding:0,borderRadius:18,cursor:'pointer'})}><Spec/>
                  <img src={P.ceo} alt="" style={{width:'100%',height:110,objectFit:'cover',borderRadius:'18px 18px 0 0',display:'block'}}/>
                  <div style={{padding:'10px 12px',position:'relative',zIndex:2}}>
                    {c.client_logo_url&&<img src={c.client_logo_url} alt="" style={{height:14,marginBottom:4,objectFit:'contain'}}/>}
                    <div style={{fontSize:13,fontWeight:700,fontFamily:FD,color:'#000'}}>{c.client_name}</div>
                    <div style={{fontSize:11,fontWeight:600,color:G,fontFamily:FD,marginTop:3}}>{c.result_headline_ru?.split('·')[0]||''}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* List cases */}
            {cases.slice(3).map((c:any)=>(
              <div key={c.slug} className="tap" onClick={()=>openCase(c.slug)} style={gc({padding:'12px 14px',borderRadius:16,marginBottom:6,display:'flex',alignItems:'center',gap:12,cursor:'pointer'})}><Spec/>
                {c.client_logo_url&&<img src={c.client_logo_url} alt="" style={{width:32,height:32,objectFit:'contain',flexShrink:0,position:'relative',zIndex:2}}/>}
                <div style={{flex:1,position:'relative',zIndex:2}}>
                  <div style={{fontSize:14,fontWeight:600,fontFamily:FD,color:'#000'}}>{c.client_name}</div>
                  <div style={{fontSize:11,color:G,fontWeight:600,fontFamily:FD,marginTop:1}}>{c.result_headline_ru?.split('·')[0]||c.tagline_ru||''}</div>
                </div>
                <span style={{color:'rgba(60,60,67,.15)',fontSize:18,position:'relative',zIndex:2}}>›</span>
              </div>
            ))}
          </div>

          {/* ═══ PHOTO: Astronaut ═══ */}
          <div style={{padding:'0 20px 20px'}}><div style={gc({padding:0,borderRadius:24,position:'relative'})}><Spec/>
            <img src={P.astro} alt="" style={{width:'100%',borderRadius:24,display:'block'}}/>
            <div style={{position:'absolute',bottom:14,left:14,right:14,zIndex:2}}>
              <div style={gc({padding:'10px 14px',borderRadius:14,background:'rgba(255,255,255,.7)'})}><Spec/>
                <div style={{fontSize:13,fontWeight:700,fontFamily:FD,color:'#000',position:'relative',zIndex:2}}>2Space · Продюсирование платинового продукта</div>
                <div style={{fontSize:11,color:G,fontWeight:600,fontFamily:FD,marginTop:2,position:'relative',zIndex:2}}>$100M+ опыт продаж · 37 стран</div>
              </div>
            </div>
          </div></div>

          {/* ═══ SYSTEM ═══ */}
          <div style={{padding:'40px 20px 60px',maxWidth:500,margin:'0 auto'}}>
            <Lbl>Система</Lbl>
            <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',textAlign:'center',lineHeight:1.12,margin:'0 0 20px'}}>Один партнёр. Полный цикл.</h2>
            {methodology.map((m:any,i:number)=>(
              <div key={m.id} style={gc({padding:'12px 14px',borderRadius:16,marginBottom:4,display:'flex',alignItems:'center',gap:10})}><Spec/>
                <div style={{width:28,height:28,borderRadius:9,background:m.color_accent||G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800,fontFamily:FD,flexShrink:0,position:'relative',zIndex:2}}>{i+1}</div>
                <div style={{position:'relative',zIndex:2}}><span style={{fontSize:14,fontWeight:700,fontFamily:FD,color:'#000'}}>{m.label_ru}</span><span style={{fontSize:10,color:m.color_accent||G,fontWeight:600,fontFamily:FD,marginLeft:6}}>{m.name}</span></div>
              </div>
            ))}
          </div>

          {/* ═══ TESTIMONIALS ═══ */}
          <div style={{padding:'20px 20px 60px',maxWidth:500,margin:'0 auto'}}>
            <Lbl>Отзывы</Lbl>
            <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',textAlign:'center',lineHeight:1.12,margin:'0 0 20px'}}>Нам доверяют лидеры</h2>
            {testimonials.map((t:any)=>(
              <div key={t.id} style={gc({padding:16,borderRadius:20,marginBottom:8})}><Spec/>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12,position:'relative',zIndex:2}}>
                  {t.person_photo_url&&<img src={t.person_photo_url} alt="" style={{width:48,height:48,borderRadius:24,objectFit:'cover',border:'2px solid rgba(200,164,78,.2)'}}/>}
                  <div><div style={{fontSize:14,fontWeight:700,fontFamily:FD,color:'#000'}}>{t.person_name}</div><div style={{fontSize:10,color:'rgba(60,60,67,.4)',fontFamily:FT}}>{t.person_title_ru}</div></div>
                </div>
                <p style={{fontSize:14,color:'rgba(60,60,67,.65)',fontFamily:FT,lineHeight:1.6,fontStyle:'italic',margin:0,position:'relative',zIndex:2}}>«{t.quote_ru}»</p>
              </div>
            ))}
          </div>

          {/* ═══ INVESTMENT ═══ */}
          <div style={{padding:'20px 20px 60px',maxWidth:500,margin:'0 auto'}}>
            <Lbl>Инвестиции</Lbl>
            <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',textAlign:'center',lineHeight:1.12,margin:'0 0 20px'}}>Три уровня входа</h2>
            {tiers.map((tier:any)=>{const svc=services.filter((s:any)=>s.tier_id===tier.id);return(
              <div key={tier.id} style={{marginBottom:12}}>
                <div style={gc({padding:'12px 16px',borderRadius:'16px 16px 4px 4px',background:'rgba(200,164,78,.08)'})}><Spec/>
                  <div style={{display:'flex',alignItems:'center',gap:8,position:'relative',zIndex:2}}><span style={{fontSize:18,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{tier.name}</span>{tier.price_range_display&&<span style={{fontSize:10,color:'rgba(60,60,67,.35)',fontFamily:FD,fontWeight:600}}>{tier.price_range_display}</span>}</div>
                </div>
                {svc.map((s:any,si:number)=>(<div key={s.id} style={gc({padding:'10px 16px',borderRadius:si===svc.length-1?'0 0 16px 16px':'0',marginTop:1,display:'flex',justifyContent:'space-between',alignItems:'center'})}><span style={{fontSize:14,fontWeight:600,fontFamily:FD,color:'#000',position:'relative',zIndex:2}}>{s.name_ru}</span>{s.price_display&&<span style={{fontSize:14,fontWeight:700,fontFamily:FD,color:G,position:'relative',zIndex:2}}>{s.price_display}</span>}</div>))}
              </div>
            );})}
          </div>

          {/* ═══ FORM ═══ */}
          <div style={{padding:'20px 20px 100px',maxWidth:500,margin:'0 auto'}}>
            <Lbl>Inner Circle</Lbl>
            <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',textAlign:'center',lineHeight:1.12,margin:'0 0 8px'}}>Подать заявку</h2>
            <p style={{fontSize:14,color:'rgba(60,60,67,.4)',fontFamily:FT,textAlign:'center',marginBottom:20}}>Мы берём 12 проектов в год</p>
            {bxSent?<div style={gc({padding:'40px 20px',textAlign:'center'})}><Spec/><div style={{fontSize:32,marginBottom:10,position:'relative',zIndex:2}}>✦</div><div style={{fontSize:18,fontWeight:700,fontFamily:FD,color:'#000',position:'relative',zIndex:2}}>Заявка отправлена</div></div>:(
              <div>{['Ваше имя','Email','Телефон','Компания','О проекте'].map((ph:string)=>(<input key={ph} placeholder={ph} value={(bxForm as any)[{['Ваше имя']:'name',Email:'email',['Телефон']:'phone',['Компания']:'company',['О проекте']:'message'}[ph]||'']} onChange={e=>{const k:any={['Ваше имя']:'name',Email:'email',['Телефон']:'phone',['Компания']:'company',['О проекте']:'message'};setBxForm({...bxForm,[k[ph]||'']:e.target.value});}} style={{width:'100%',boxSizing:'border-box' as const,padding:'14px 16px',marginBottom:6,borderRadius:14,border:'0.5px solid rgba(255,255,255,.6)',background:'rgba(255,255,255,.52)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',fontSize:15,fontFamily:FT,color:'#000',outline:'none',boxShadow:'0 0.5px 0 rgba(255,255,255,.9) inset, 0 2px 8px rgba(0,0,0,.04)'}}/>))}
              <button className="tap" onClick={async()=>{if(!bxForm.name.trim())return;await sb.rpc('bx_submit_application',{p_name:bxForm.name,p_email:bxForm.email||null,p_phone:bxForm.phone||null,p_company:bxForm.company||null,p_message:bxForm.message||null,p_source:mode==='embedded'?'ethnomir':'web'});setBxSent(true);}} style={{width:'100%',padding:16,borderRadius:14,background:GG,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',marginTop:6,boxShadow:'0 4px 20px rgba(200,164,78,.25)'}}>Отправить заявку</button></div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
'''

code = code[:start_idx] + new_code + code[end_idx+1:]
with open(path,'w') as f: f.write(code)
print(f"✅ iOS 26 Liquid Glass deployed. Size: {len(code):,}")
