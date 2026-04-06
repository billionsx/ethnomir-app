#!/usr/bin/env python3
"""Complete rewrite of BillionsXApp — proper iOS 26 Liquid Glass with glass cards everywhere"""
path = 'apps/web/app/page.tsx'
with open(path,'r') as f: code = f.read()

start_marker = "function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {"
end_marker = "\n\n\n// ─── TAB BAR ──"
start_idx = code.index(start_marker)
end_idx = code.index(end_marker, start_idx)

new_code = r'''function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {
  const [bxView,setBxView]=useState<string>('landing');
  const scrollRef=useRef<HTMLDivElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const G='#C8A44E';const GG='linear-gradient(135deg,#C8A44E,#F4D675)';

  // Canvas gradient
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;
    const dpr=window.devicePixelRatio||1;
    const rs=()=>{c.width=c.clientWidth*dpr;c.height=c.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
    rs();window.addEventListener('resize',rs);
    const B=[{x:.2,y:.1,r:.44,c:[215,185,125],vx:.11,vy:.09,p:0,s:.5},{x:.8,y:.2,r:.35,c:[190,160,210],vx:-.1,vy:.12,p:1.4,s:.45},{x:.35,y:.5,r:.38,c:[235,200,155],vx:.09,vy:-.08,p:2.8,s:.6},{x:.65,y:.75,r:.32,c:[175,205,225],vx:-.12,vy:-.1,p:4,s:.52},{x:.5,y:.35,r:.3,c:[225,195,165],vx:.08,vy:.11,p:5.3,s:.58}];
    let t=0,raf:number;
    const draw=()=>{const W=c.clientWidth,H=c.clientHeight;ctx.fillStyle='#F2F2F7';ctx.fillRect(0,0,W,H);t+=.002;
      for(const b of B){const cx=(b.x+Math.sin(t*b.s+b.p)*b.vx)*W,cy=(b.y+Math.cos(t*b.s*.8+b.p)*b.vy)*H,g=ctx.createRadialGradient(cx,cy,0,cx,cy,b.r*Math.min(W,H));
        g.addColorStop(0,'rgba('+b.c+',.5)');g.addColorStop(.4,'rgba('+b.c+',.2)');g.addColorStop(1,'rgba('+b.c+',0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
      raf=requestAnimationFrame(draw)};draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',rs)};
  },[]);

  // Photos
  const P:any={
    xp1:'https://static.tildacdn.net/tild6366-6531-4138-a565-613864366262/xProduction-02-min-m.png',
    xp2:'https://static.tildacdn.net/tild6234-3135-4535-a338-643234656139/xProduction-013-min.png',
    xp3:'https://static.tildacdn.net/tild3434-3261-4238-b963-323534383238/xProduction-04-min-m.png',
    astro:'https://static.tildacdn.net/tild6663-6536-4763-b563-643364306366/Astronaut_Brenson_2-.png',
    ceo:'https://static.tildacdn.net/tild3632-6639-4131-b036-313335323639/billions-x-leads-ceo.png',
    leads:'https://static.tildacdn.net/tild6536-3336-4739-a537-633437316463/billions-x-leads-bag.png',
    mac:'https://static.tildacdn.net/tild3335-3935-4862-a631-303033306436/mac-min-min.png',
    bx:'https://static.tildacdn.net/tild3638-3434-4466-b666-663738363034/billionsx.svg',
    fortune:'https://static.tildacdn.net/tild3764-6661-4136-b465-323638613235/fortune.svg',
    forbes:'https://static.tildacdn.net/tild3733-3933-4430-b664-343465353562/forbes.svg',
    award:'https://static.tildacdn.net/tild6432-6165-4331-a237-353863663131/billionsx-award.svg',
    parq:'https://static.tildacdn.net/tild3136-3737-4630-a662-653761313836/parq.svg',
    orbi:'https://static.tildacdn.net/tild3534-3835-4861-b639-383661306633/kompaniya-po-upakovk.svg',
    abb:'https://static.tildacdn.net/tild3237-3966-4333-b931-343033663266/abb-3.svg',
    eaton:'https://static.tildacdn.net/tild3635-3239-4365-a662-653633616466/eaton-6.svg',
    maxbox:'https://static.tildacdn.net/tild3231-6166-4531-a132-396464323565/maxboxvr-for-white.svg',
    bulldog:'https://static.tildacdn.net/tild3361-6564-4238-a465-376166336431/bulldog-gold.svg',
    biteLogo:'https://static.tildacdn.net/tild6238-6565-4238-a232-613361366430/bite.svg',
    georgia:'https://static.tildacdn.net/tild6339-6262-4264-a662-333036313765/georgia.svg',
    ryb:'https://static.tildacdn.net/tild3830-6238-4239-b730-363235313065/ribakov-min-2-min.png',
    cher:'https://static.tildacdn.net/tild6366-3736-4331-b734-623165613636/chernyak-min-2-min.png',
    hart:'https://static.tildacdn.net/tild3230-6532-4665-b737-316638356565/hartmann-min-2-min.png',
  };
  const cLogos=['https://static.tildacdn.net/tild3036-3734-4566-b161-316136326262/google-1-1.svg','https://static.tildacdn.net/tild6133-3264-4833-b836-353230626635/microsoft.svg','https://static.tildacdn.net/tild6331-3966-4235-a639-386634343662/nasa-3.svg','https://static.tildacdn.net/tild6439-6434-4266-b764-323530343464/bmw.svg','https://static.tildacdn.net/tild6438-3733-4233-a566-376363663739/nike-4.svg','https://static.tildacdn.net/tild3966-3935-4734-b836-663833633034/disney.svg','https://static.tildacdn.net/tild3464-3039-4639-a562-386563396262/visa.svg','https://static.tildacdn.net/tild3437-6565-4336-a135-646133633838/rolls-royce-por-hern.svg','https://static.tildacdn.net/tild3437-6134-4461-a532-313266353239/jp-morgan.svg','https://static.tildacdn.net/tild3162-3562-4136-b437-633333386434/mercedes-benz-4.svg','https://static.tildacdn.net/tild3531-6261-4239-a634-316532383639/mastercard-2.svg','https://static.tildacdn.net/tild6135-6361-4866-b137-613131623131/ibm.svg','https://static.tildacdn.net/tild3339-3762-4162-a332-646332323361/sony-2.svg','https://static.tildacdn.net/tild3865-3363-4435-b563-613065323162/coca-cola.svg','https://static.tildacdn.net/tild3539-3162-4338-a438-623062613561/deloitte-2.svg','https://static.tildacdn.net/tild3865-3936-4538-b736-353232633737/pwc.svg','https://static.tildacdn.net/tild3835-6230-4336-a131-373562633536/siemens-3.svg','https://static.tildacdn.net/tild3435-6164-4330-a465-396331313630/hilton-2.svg','https://static.tildacdn.net/tild6136-6532-4838-b531-313732343866/adidas-9.svg','https://static.tildacdn.net/tild3261-6332-4433-b262-613964336265/oracle-2.svg'];

  // Glass card component
  const GC=({children,style={},gold=false}:any)=><div style={{background:gold?'rgba(200,164,78,.06)':'rgba(255,255,255,.52)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',borderRadius:20,border:gold?'.5px solid rgba(200,164,78,.12)':'.5px solid rgba(255,255,255,.6)',boxShadow:'0 .5px 0 rgba(255,255,255,.9) inset, 0 2px 12px rgba(0,0,0,.04)',position:'relative' as const,overflow:'hidden' as const,...style}}><div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent 5%,rgba(255,255,255,.85) 50%,transparent 95%)',pointerEvents:'none',zIndex:1}}/><div style={{position:'relative',zIndex:2}}>{children}</div></div>;
  const Lbl=({children}:any)=><div style={{fontSize:11,fontWeight:700,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase' as const,marginBottom:8}}>{children}</div>;
  const scrollTo=(id:string)=>{const el=document.getElementById(id);el?.scrollIntoView({behavior:'smooth'});};

  // ── CASE DETAIL ──
  if(bxView==='parq'||bxView==='orbi'){const isP=bxView==='parq';
    return(<div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',flexDirection:'column'}}>
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{position:'sticky',top:0,zIndex:10,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(242,242,247,.75)',backdropFilter:'blur(30px) saturate(180%)',WebkitBackdropFilter:'blur(30px) saturate(180%)',borderBottom:'.5px solid rgba(0,0,0,.04)'}}>
          <span className="tap" onClick={()=>{setBxView('landing');}} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>‹ Назад</span>
          <span style={{fontSize:12,fontWeight:700,letterSpacing:3,fontFamily:FD,color:'rgba(60,60,67,.2)'}}>BILLIONS X</span>
          {mode==='embedded'&&onClose?<span className="tap" onClick={onClose} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>✕</span>:<div style={{width:40}}/>}
        </div>
        <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'20px 16px 80px'}}>
          <div style={{maxWidth:540,margin:'0 auto'}}>
            <GC style={{marginBottom:16}}><img src={isP?P.xp1:P.leads} alt="" style={{width:'100%',height:240,objectFit:'cover',borderRadius:20,display:'block'}}/></GC>
            <GC style={{padding:20,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><img src={isP?P.parq:P.orbi} alt="" style={{height:24}}/><img src={P.award} alt="" style={{height:16,opacity:.3}}/></div>
              <h1 style={{fontSize:28,fontWeight:800,fontFamily:FD,color:'#000',margin:'0 0 4px'}}>{isP?'PARQ Development':'ORBI Group'}</h1>
              <p style={{fontSize:13,color:'rgba(60,60,67,.4)',fontFamily:FT,margin:0}}>{isP?'Бали, Индонезия':'Батуми, Грузия'}</p>
            </GC>
            <GC gold style={{padding:'14px 18px',marginBottom:16}}><p style={{fontSize:14,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:0,lineHeight:1.45}}>{isP?'№1 застройщик Бали за 1 год. Распродан целый район вилл. До 2,000 посетителей ежедневно.':'Рост в 20 раз. 55 офисов в 19 странах. Самый большой гостиничный комплекс в мире — 12,000+ апартаментов.'}</p></GC>
            <GC style={{padding:20,marginBottom:12}}><Lbl>Контекст рынка</Lbl><p style={{fontSize:15,color:'rgba(60,60,67,.65)',fontFamily:FT,lineHeight:1.65,margin:0}}>{isP?'После пандемии началась полномасштабная война между РФ и Украиной. Многие жители обеих стран начали искать возможность жить вдали от конфликта. Возникла потребность в комфортной недвижимости, обеспечивающей непрерывную деловую, творческую и семейную коммуникацию.':'Батуми — единственный город в мире с населением менее 200,000 человек с наибольшим количеством международных гостиничных брендов. Три года подряд Батуми бьёт рекорды (+20% ежегодно) как новый туристический тренд.'}</p></GC>
            <GC style={{padding:20,marginBottom:12}}><Lbl>Billions X Game Changer</Lbl><p style={{fontSize:15,color:'rgba(60,60,67,.65)',fontFamily:FT,lineHeight:1.65,margin:0}}>{isP?'Мы дали старт всему маркетингу PARQ Development, упаковав виллы и комплекс PARQ Ubud для рекламных коллабораций с крупными блогерами. Высокая конверсия из рекламы в продажи позволила распродать целый район вилл. За год PARQ Development стал самым быстрорастущим и крупнейшим застройщиком на острове.':'Мы в течение полутора лет выступали в роли продакт-оунера, обеспечивая полный контроль над продуктом для всех отделов: маркетинга, рекламы, PR, продаж, колл-центра. Разработали единые стандарты продукта. Компания выросла в 20 раз, увеличив офисы до 55 в 19 странах.'}</p></GC>
            {isP&&<GC style={{padding:20,marginBottom:12,borderLeft:'3px solid '+G}}><p style={{fontSize:15,fontStyle:'italic',color:'rgba(60,60,67,.55)',fontFamily:FT,lineHeight:1.65,margin:'0 0 10px'}}>«Parq Development придумала и реализовала концепцию «нового Бали» — места для экспатов, где можно жить, работать и инвестировать в недвижимость, не уезжая с острова.»</p><p style={{fontSize:12,fontWeight:600,color:'rgba(60,60,67,.3)',fontFamily:FD,margin:0}}>Forbes</p></GC>}
            <GC style={{padding:16,marginBottom:16}}>
              {(isP?['До 2,000 человек посещают PARQ Ubud ежедневно','Строится 8 городов с масштабной инфраструктурой','16 лет опыта на рынке девелопмента на Бали']:['Награда Prix d\'Excellence FIABCI','Жюри из 40 стран признало проект лучшим в мире','1,500,000 туристов ежегодно','25 лет на рынке · 3,000,000 кв.м. построено']).map((a:string,i:number)=>(
                <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'10px 0',borderBottom:i<3?'.5px solid rgba(0,0,0,.04)':'none'}}><img src={P.award} alt="" style={{height:14,opacity:.25,marginTop:2,flexShrink:0}}/><p style={{fontSize:13,fontWeight:500,fontFamily:FD,color:'rgba(60,60,67,.6)',margin:0}}>{a}</p></div>
              ))}
            </GC>
            <button className="tap" onClick={()=>scrollTo('bx-form')} style={{width:'100%',padding:16,borderRadius:14,background:GG,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 20px rgba(200,164,78,.2)'}}>Обсудить ваш проект</button>
          </div>
        </div>
      </div>
    </div>);
  }

  // ── LANDING ──
  return(
    <div style={{position:'fixed',inset:0,zIndex:9998,background:'#F2F2F7',display:'flex',flexDirection:'column'}}>
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',height:'100%'}}>
        {/* Glass Nav */}
        <nav style={{position:'sticky',top:0,zIndex:10,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(242,242,247,.75)',backdropFilter:'blur(30px) saturate(180%)',WebkitBackdropFilter:'blur(30px) saturate(180%)',borderBottom:'.5px solid rgba(0,0,0,.04)'}}>
          <img src={P.bx} alt="" style={{height:16,opacity:.4}}/>
          <div style={{display:'flex',gap:18}}>
            <span className="tap" onClick={()=>scrollTo('bx-cases')} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'rgba(60,60,67,.45)',cursor:'pointer'}}>Кейсы</span>
            <span className="tap" onClick={()=>scrollTo('bx-prices')} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'rgba(60,60,67,.45)',cursor:'pointer'}}>Цены</span>
            <span className="tap" onClick={()=>scrollTo('bx-form')} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'rgba(60,60,67,.45)',cursor:'pointer'}}>Обсудить</span>
          </div>
          {mode==='embedded'&&onClose?<span className="tap" onClick={onClose} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>✕</span>:<div style={{width:20}}/>}
        </nav>

        <div ref={scrollRef} style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch'}}>
          <div style={{maxWidth:540,margin:'0 auto',padding:'0 16px'}}>

            {/* ═══ HERO ═══ */}
            <section style={{paddingTop:60,paddingBottom:32,textAlign:'center'}}>
              <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:24,opacity:.25}}><img src={P.fortune} alt="" style={{height:12}}/><img src={P.forbes} alt="" style={{height:12}}/></div>
              <h1 style={{fontSize:46,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.04,margin:'0 0 16px',letterSpacing:-.5}}>Упаковка<br/>бизнеса<br/>под ключ.</h1>
              <p style={{fontSize:17,fontFamily:FT,color:'rgba(60,60,67,.5)',lineHeight:1.5,margin:'0 0 28px',maxWidth:360,marginLeft:'auto',marginRight:'auto'}}>Продвигаем там, где конкуренты сливают бюджеты. Создаём высокий спрос. Продаём дорого.</p>
              <GC style={{padding:'18px 16px',marginBottom:24}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8}}>
                  {[['$80B+','Капитализация'],['100+','Стран'],['60+','Fortune 500'],['10+','Лет']].map(([v,l]:any,i:number)=>(
                    <div key={i} style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,fontFamily:FD,color:'#000'}}>{v}</div><div style={{fontSize:9,color:'rgba(60,60,67,.3)',fontFamily:FT,marginTop:3}}>{l}</div></div>
                  ))}
                </div>
              </GC>
              <button className="tap" onClick={()=>scrollTo('bx-form')} style={{padding:'15px 36px',borderRadius:50,background:GG,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 24px rgba(200,164,78,.3)'}}>Обсудить проект</button>
            </section>

            {/* ═══ HERO PHOTO ═══ */}
            <GC style={{marginBottom:32}}><img src={P.xp2} alt="" style={{width:'100%',height:280,objectFit:'cover',borderRadius:20,display:'block'}}/></GC>

            {/* ═══ MANIFESTO ═══ */}
            <GC style={{padding:22,marginBottom:32}}>
              <p style={{fontSize:18,fontWeight:600,fontFamily:FD,color:'#000',lineHeight:1.55,margin:'0 0 14px'}}>Приносим больше денег, круто упаковывая, стильно рекламируя и эффективно продвигая бизнесы, продукты, бренды, цифровые личности.</p>
              <p style={{fontSize:14,fontFamily:FT,color:'rgba(60,60,67,.45)',lineHeight:1.6,margin:0}}>Вы видели их на обложках, читали их книги, покупали их продукты. Мы — те, кто сделали их медийными, богатыми и влиятельными. Наш маркетинг стоит дорого, но наши клиенты зарабатывают ещё больше.</p>
            </GC>

            {/* ═══ LOGO TICKER ═══ */}
            <div style={{marginBottom:32,overflow:'hidden',borderRadius:16}}>
              <style>{`@keyframes bxTK{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
              <div style={{display:'flex',gap:28,alignItems:'center',animation:'bxTK 18s linear infinite',width:'max-content',padding:'14px 0'}}>
                {[...cLogos,...cLogos].map((u:string,i:number)=>(<img key={i} src={u} alt="" style={{height:15,opacity:.2,flexShrink:0}}/>))}
              </div>
            </div>

            {/* ═══ CASES ═══ */}
            <section id="bx-cases" style={{marginBottom:32}}>
              <Lbl>Кейсы</Lbl>
              <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.1,margin:'0 0 6px'}}>Сильнейшие<br/>в кейсах.</h2>
              <p style={{fontSize:14,color:'rgba(60,60,67,.35)',fontFamily:FT,margin:'0 0 20px'}}>От малого бизнеса до корпораций. Бренды из Forbes и Fortune 500.</p>

              {/* PARQ */}
              <GC className="tap" style={{marginBottom:12,cursor:'pointer'}} onClick={()=>{setBxView('parq');if(scrollRef.current)scrollRef.current.scrollTop=0;}}>
                <img src={P.xp1} alt="" style={{width:'100%',height:200,objectFit:'cover',borderRadius:'20px 20px 0 0',display:'block'}}/>
                <div style={{padding:'16px 18px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><img src={P.parq} alt="" style={{height:18}}/><img src={P.award} alt="" style={{height:12,opacity:.2}}/></div>
                  <h3 style={{fontSize:18,fontWeight:700,fontFamily:FD,color:'#000',margin:'0 0 2px'}}>PARQ Development</h3>
                  <p style={{fontSize:11,color:'rgba(60,60,67,.35)',fontFamily:FT,margin:'0 0 8px'}}>BALI | INDONESIA</p>
                  <p style={{fontSize:13,fontWeight:700,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 4px'}}>№1 застройщик Бали за 1 год →</p>
                </div>
              </GC>

              {/* ORBI + 2Space grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                <GC className="tap" style={{cursor:'pointer'}} onClick={()=>{setBxView('orbi');if(scrollRef.current)scrollRef.current.scrollTop=0;}}>
                  <img src={P.leads} alt="" style={{width:'100%',height:130,objectFit:'cover',borderRadius:'20px 20px 0 0',display:'block'}}/>
                  <div style={{padding:'12px 14px'}}>
                    <img src={P.orbi} alt="" style={{height:14,marginBottom:4}}/>
                    <h3 style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000',margin:'0 0 2px'}}>ORBI Group</h3>
                    <p style={{fontSize:10,color:'rgba(60,60,67,.35)',fontFamily:FT,margin:'0 0 6px'}}>Батуми, Грузия</p>
                    <p style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,margin:0}}>Рост в 20 раз</p>
                  </div>
                </GC>
                <GC>
                  <img src={P.astro} alt="" style={{width:'100%',height:130,objectFit:'contain',objectPosition:'center',borderRadius:'20px 20px 0 0',display:'block',background:'linear-gradient(180deg,#e8e4f0,#f2f2f7)'}}/>
                  <div style={{padding:'12px 14px'}}>
                    <h3 style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000',margin:'0 0 2px'}}>2Space</h3>
                    <p style={{fontSize:10,color:'rgba(60,60,67,.35)',fontFamily:FT,margin:'0 0 6px'}}>Richard Branson</p>
                    <p style={{fontSize:11,fontWeight:700,color:G,fontFamily:FD,margin:0}}>$100M+ · 37 стран</p>
                  </div>
                </GC>
              </div>

              {/* Product visual */}
              <GC style={{marginBottom:12}}><img src={P.xp3} alt="" style={{width:'100%',borderRadius:20,display:'block'}}/></GC>

              {/* More cases */}
              <GC style={{padding:'4px 0',marginBottom:12}}>
                {([
                  [P.abb,'ABB','$43B капитализация · 105,000 сотрудников'],
                  [P.eaton,'Eaton Corporation','$34.2B · 100+ стран'],
                  [null,'PF Capital','Оборот $1,986,450,000/год'],
                  [P.maxbox,'MaxboxVR','Google Partner · Fortune 500'],
                  [P.bulldog,'Гарик Харламов','9.2M подписчиков · ТОП-3 Forbes'],
                  [P.biteLogo,'Bite Helper','CES · Amazon ТОП-5 · NASA'],
                  [P.georgia,'Бренд Грузии','Инвестиционный бренд страны'],
                  [null,'Metaverse Bank','≈1,000 экранов'],
                ] as any[]).map(([logo,n,r]:any,i:number)=>(
                  <div key={i} style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:i<7?'.5px solid rgba(0,0,0,.04)':'none'}}>
                    {logo?<img src={logo} alt="" style={{height:20,width:28,objectFit:'contain',opacity:.5,flexShrink:0}}/>:<div style={{width:28}}/>}
                    <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,fontFamily:FD,color:'#000'}}>{n}</div><div style={{fontSize:11,fontWeight:600,color:G,fontFamily:FD,marginTop:2}}>{r}</div></div>
                    <span style={{color:'rgba(60,60,67,.12)',fontSize:18}}>›</span>
                  </div>
                ))}
              </GC>
            </section>

            {/* ═══ CEO VISUAL ═══ */}
            <GC style={{marginBottom:32}}><img src={P.ceo} alt="" style={{width:'100%',height:260,objectFit:'cover',borderRadius:20,display:'block'}}/></GC>

            {/* ═══ TESTIMONIALS ═══ */}
            <section style={{marginBottom:32}}>
              <Lbl>Рекомендации</Lbl>
              <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.1,margin:'0 0 20px'}}>Нам доверяют<br/>лидеры.</h2>
              {[{n:'Игорь Рыбаков',t:'Долларовый миллиардер',q:'BillionsX — команда, которая понимает масштаб и мыслит категориями роста.',p:P.ryb},
                {n:'Евгений Черняк',t:'Мультимиллионер',q:'Профессионалы, которые умеют упаковать бизнес так, чтобы он продавал.',p:P.cher},
                {n:'Оскар Хартманн',t:'Мультимиллионер',q:'Системный подход к маркетингу и брендингу на самом высоком уровне.',p:P.hart}
              ].map((t:any,i:number)=>(
                <GC key={i} style={{padding:18,marginBottom:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <img src={t.p} alt="" style={{width:44,height:44,borderRadius:22,objectFit:'cover',border:'1.5px solid rgba(200,164,78,.15)'}}/>
                    <div><div style={{fontSize:15,fontWeight:700,fontFamily:FD,color:'#000'}}>{t.n}</div><div style={{fontSize:11,color:'rgba(60,60,67,.35)',fontFamily:FT}}>{t.t}</div></div>
                  </div>
                  <p style={{fontSize:15,color:'rgba(60,60,67,.55)',fontFamily:FT,lineHeight:1.55,fontStyle:'italic',margin:0}}>«{t.q}»</p>
                </GC>
              ))}
            </section>

            {/* ═══ SYSTEM ═══ */}
            <section style={{marginBottom:32}}>
              <Lbl>Полный цикл</Lbl>
              <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.1,margin:'0 0 20px'}}>Один партнёр.<br/>Семь систем.</h2>
              <GC style={{padding:'4px 0'}}>
                {[['xVision™','Стратегия','Глубокий анализ рынка и конкурентов','#FF9500'],['xGenetics™','ДНК бренда','Суперсила бренда и гены победителя','#AF52DE'],['xNeural™','Смыслы','За что клиенты платят в 3 раза больше','#FF2D55'],['xProduction™','Упаковка','Сайты, бренды, визуалы уровня Apple','#007AFF'],['xPerformance™','Продвижение','Реклама, SEO, PR — поток клиентов','#34C759'],['xSales™','Продажи','Книги продукта, обучение, системы','#FF9500'],['xAI™','AI','Искусственный интеллект на каждом этапе','#5856D6']].map(([n,l,d,c]:any,i:number)=>(
                  <div key={i} style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:i<6?'.5px solid rgba(0,0,0,.04)':'none'}}>
                    <div style={{width:26,height:26,borderRadius:8,background:c,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,fontFamily:FD,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1}}><div><span style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#000'}}>{l}</span><span style={{fontSize:10,fontWeight:600,color:c,fontFamily:FD,marginLeft:8}}>{n}</span></div><div style={{fontSize:12,color:'rgba(60,60,67,.4)',fontFamily:FT,marginTop:2}}>{d}</div></div>
                  </div>
                ))}
              </GC>
            </section>

            {/* ═══ PRICES ═══ */}
            <section id="bx-prices" style={{marginBottom:32}}>
              <Lbl>Стоимость</Lbl>
              <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.1,margin:'0 0 20px'}}>Три уровня.</h2>
              {[{n:'LAUNCH',r:'$15K – $50K',d:'Стартапы, персональные бренды',it:[['Brand Essence','$15,000'],['Personal Brand','$25,000'],['Campaign Launch','$15,000'],['Personal Producing','$50,000']]},
                {n:'SCALE',r:'$50K – $500K',d:'Компании $1M–$50M',it:[['Space Vision','$75,000'],['Product Book','$50,000'],['SEO продвижение','от $15K/мес'],['Super App Dev','от $150K']]},
                {n:'DOMINATE',r:'$250K+',d:'Корпорации, девелоперы, государства',it:[['Full Transformation','от $250K'],['Product Ownership','от $500K/год'],['Nation Branding','от $500K'],['AI Platform','от $1M']]}
              ].map((tier:any,ti:number)=>(
                <div key={ti} style={{marginBottom:14}}>
                  <GC gold style={{padding:'14px 18px',borderRadius:'18px 18px 4px 4px'}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:8}}><span style={{fontSize:20,fontWeight:800,fontFamily:FD,background:GG,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{tier.n}</span><span style={{fontSize:11,color:'rgba(60,60,67,.3)',fontFamily:FD,fontWeight:600}}>{tier.r}</span></div>
                    <div style={{fontSize:11,color:'rgba(60,60,67,.35)',fontFamily:FT,marginTop:2}}>{tier.d}</div>
                  </GC>
                  {tier.it.map(([n,p]:any,ii:number)=>(
                    <GC key={ii} style={{padding:'12px 18px',borderRadius:ii===tier.it.length-1?'0 0 18px 18px':0,marginTop:1,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#000'}}>{n}</span>
                      <span style={{fontSize:15,fontWeight:700,fontFamily:FD,color:G}}>{p}</span>
                    </GC>
                  ))}
                </div>
              ))}
            </section>

            {/* ═══ FORM ═══ */}
            <section id="bx-form" style={{marginBottom:32}}>
              <Lbl>Заявка</Lbl>
              <h2 style={{fontSize:34,fontWeight:800,fontFamily:FD,color:'#000',lineHeight:1.1,margin:'0 0 6px'}}>Обсудить проект.</h2>
              <p style={{fontSize:14,color:'rgba(60,60,67,.35)',fontFamily:FT,margin:'0 0 20px'}}>12 проектов в год. Ответ в течение 48 часов.</p>
              {['Имя','Email','Телефон','Компания','О проекте'].map((ph:string)=>(
                <GC key={ph} style={{marginBottom:6,borderRadius:14,padding:0}}><input placeholder={ph} style={{width:'100%',boxSizing:'border-box' as const,padding:'15px 16px',background:'transparent',border:'none',fontSize:15,fontFamily:FT,color:'#000',outline:'none'}}/></GC>
              ))}
              <button className="tap" style={{width:'100%',padding:16,borderRadius:14,background:GG,color:'#fff',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',marginTop:10,boxShadow:'0 4px 20px rgba(200,164,78,.25)'}}>Отправить</button>
            </section>

            {/* Footer */}
            <footer style={{paddingBottom:60,textAlign:'center'}}>
              <img src={P.bx} alt="" style={{height:16,opacity:.25,marginBottom:6}}/>
              <p style={{fontSize:11,color:'rgba(60,60,67,.2)',fontFamily:FT,margin:0}}>Маркетинг богатых и очень богатых.</p>
            </footer>

          </div>
        </div>
      </div>
      <style>{`input::placeholder{color:rgba(60,60,67,.25)!important}`}</style>
    </div>
  );
}
'''

code = code[:start_idx] + new_code + code[end_idx+1:]
with open(path,'w') as f: f.write(code)
print(f"OK size={len(code):,}")
